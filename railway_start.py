import json
import os
import re
import runpy
import secrets
import threading
import time
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
APP_FILE = ROOT / "app.py"
WEB_DIR = ROOT / "website"
DISCORD_API = "https://discord.com/api/v10"
DEFAULT_CLIENT_ID = "1567331667826311288"
SESSIONS = {}
SESSIONS_LOCK = threading.RLock()


def oauth_settings():
    return {
        "client_id": os.getenv("DISCORD_CLIENT_ID", DEFAULT_CLIENT_ID).strip(),
        "client_secret": os.getenv("DISCORD_CLIENT_SECRET", "").strip(),
        "redirect_uri": os.getenv("DISCORD_REDIRECT_URI", "").strip(),
    }


def get_cookie(handler, name):
    cookie = SimpleCookie()
    try:
        cookie.load(handler.headers.get("Cookie", ""))
        morsel = cookie.get(name)
        return morsel.value if morsel else None
    except (TypeError, ValueError):
        return None


def discord_request(path, access_token):
    request = Request(
        f"{DISCORD_API}{path}",
        headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
    )
    with urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def exchange_code(code, settings):
    body = urlencode({
        "client_id": settings["client_id"],
        "client_secret": settings["client_secret"],
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings["redirect_uri"],
    }).encode("utf-8")
    request = Request(
        f"{DISCORD_API}/oauth2/token",
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"},
        method="POST",
    )
    with urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def session_for(handler):
    session_id = get_cookie(handler, "vantarmor_session")
    if not session_id:
        return None
    with SESSIONS_LOCK:
        session = SESSIONS.get(session_id)
        if session and session["expires_at"] > time.time():
            return session
        SESSIONS.pop(session_id, None)
    return None


class WebsiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def send_json(self, data, status=200):
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(payload)

    def send_text(self, text, status=400):
        payload = text.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(payload)

    def cookie_header(self, name, value, max_age):
        return f"{name}={value}; Path=/; Max-Age={max_age}; HttpOnly; Secure; SameSite=Lax"

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/config.json":
            settings = oauth_settings()
            self.send_json({
                "auth_enabled": bool(settings["client_id"] and settings["client_secret"] and settings["redirect_uri"]),
                "support_url": os.getenv("SUPPORT_URL", ""),
            })
            return

        if path == "/auth/discord":
            settings = oauth_settings()
            if not all(settings.values()):
                self.send_text("Falta configurar Discord OAuth en Railway.", 503)
                return
            state = secrets.token_urlsafe(32)
            query = urlencode({
                "client_id": settings["client_id"],
                "response_type": "code",
                "redirect_uri": settings["redirect_uri"],
                "scope": "identify guilds",
                "state": state,
            })
            self.send_response(302)
            self.send_header("Location", f"https://discord.com/oauth2/authorize?{query}")
            self.send_header("Set-Cookie", self.cookie_header("vantarmor_oauth_state", state, 600))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return

        if path == "/auth/callback":
            query = parse_qs(urlparse(self.path).query)
            state = query.get("state", [""])[0]
            expected_state = get_cookie(self, "vantarmor_oauth_state")
            code = query.get("code", [""])[0]
            if not expected_state or not state or not secrets.compare_digest(state, expected_state):
                self.send_text("La verificación de seguridad falló. Vuelve a iniciar sesión desde la web.", 400)
                return
            if query.get("error") or not code:
                self.send_text("No se autorizó el acceso a Discord. Puedes volver a intentarlo desde la web.", 400)
                return
            settings = oauth_settings()
            if not all(settings.values()):
                self.send_text("Falta configurar Discord OAuth en Railway.", 503)
                return
            try:
                token_data = exchange_code(code, settings)
                access_token = token_data["access_token"]
                user = discord_request("/users/@me", access_token)
                expires_in = max(60, int(token_data.get("expires_in", 3600)))
            except (HTTPError, URLError, TimeoutError, KeyError, ValueError) as error:
                print(f"Falló la autenticación OAuth de Discord: {type(error).__name__}")
                self.send_text("No se pudo completar el inicio de sesión con Discord. Comprueba la configuración OAuth y vuelve a intentar.", 502)
                return

            session_id = secrets.token_urlsafe(32)
            with SESSIONS_LOCK:
                SESSIONS[session_id] = {
                    "access_token": access_token,
                    "user": {"id": user.get("id"), "username": user.get("global_name") or user.get("username", "Discord")},
                    "expires_at": time.time() + expires_in,
                }
            self.send_response(302)
            self.send_header("Location", "/?connected=1")
            self.send_header("Set-Cookie", self.cookie_header("vantarmor_session", session_id, expires_in))
            self.send_header("Set-Cookie", self.cookie_header("vantarmor_oauth_state", "", 0))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return

        if path == "/api/me":
            session = session_for(self)
            if not session:
                self.send_json({"error": "unauthenticated"}, 401)
                return
            self.send_json({"user": session["user"]})
            return

        if path == "/api/guilds":
            session = session_for(self)
            if not session:
                self.send_json({"error": "unauthenticated"}, 401)
                return
            try:
                guilds = discord_request("/users/@me/guilds", session["access_token"])
            except (HTTPError, URLError, TimeoutError, ValueError) as error:
                print(f"No se pudieron consultar los servidores de Discord: {type(error).__name__}")
                self.send_json({"error": "guild_lookup_failed"}, 502)
                return
            can_manage = []
            for guild in guilds:
                try:
                    permissions = int(guild.get("permissions", "0"))
                except (TypeError, ValueError):
                    permissions = 0
                if guild.get("owner") or permissions & (0x8 | 0x20):
                    can_manage.append({
                        "id": str(guild.get("id", "")),
                        "name": str(guild.get("name", "Servidor")),
                        "icon": guild.get("icon"),
                        "owner": bool(guild.get("owner")),
                    })
            self.send_json({"guilds": can_manage})
            return

        if path == "/auth/logout":
            session_id = get_cookie(self, "vantarmor_session")
            with SESSIONS_LOCK:
                SESSIONS.pop(session_id, None)
            self.send_response(302)
            self.send_header("Location", "/")
            self.send_header("Set-Cookie", self.cookie_header("vantarmor_session", "", 0))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return

        super().do_GET()

    def log_message(self, format, *args):
        return


def start_website():
    if not (WEB_DIR / "index.html").is_file():
        print("No encontré website/index.html; no iniciaré la web.")
        return
    port = int(os.getenv("PORT", "8080"))
    server = ThreadingHTTPServer(("0.0.0.0", port), WebsiteHandler)
    thread = threading.Thread(target=server.serve_forever, name="website", daemon=True)
    thread.start()
    print(f"Web iniciada en el puerto {port}")


# Older versions of app.py use ticket_panel without declaring it in the
# persisted configuration defaults. Add it before importing the bot so that
# /ticket-panel does not fail with KeyError on Railway.
source = APP_FILE.read_text(encoding="utf-8")
start = source.find("CONFIG_DEFAULTS = {")
if start == -1:
    raise RuntimeError("No encontré CONFIG_DEFAULTS en app.py; revisa el código del bot.")
end = source.find("\n}", start)
if end == -1:
    raise RuntimeError("CONFIG_DEFAULTS en app.py no parece estar cerrado correctamente.")

defaults = source[start:end]
if '"ticket_panel"' not in defaults and "'ticket_panel'" not in defaults:
    updated, count = re.subn(
        r'("antilink"\s*:\s*\{\}\s*,?)',
        r'\1 "ticket_panel": {},',
        defaults,
        count=1,
    )
    if count != 1:
        raise RuntimeError("No pude añadir ticket_panel a CONFIG_DEFAULTS en app.py.")
    source = source[:start] + updated + source[end:]
    APP_FILE.write_text(source, encoding="utf-8")

start_website()
runpy.run_path(str(APP_FILE), run_name="__main__")
