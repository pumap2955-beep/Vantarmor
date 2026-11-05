import json
import os
import re
import runpy
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
APP_FILE = ROOT / "app.py"
WEB_DIR = ROOT / "website"


class WebsiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def do_GET(self):
        if urlparse(self.path).path == "/config.json":
            config = {
                "client_id": os.getenv("DISCORD_CLIENT_ID", ""),
                "support_url": os.getenv("SUPPORT_URL", ""),
            }
            payload = json.dumps(config).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(payload)
            return
        super().do_GET()

    def log_message(self, format, *args):
        # Keep Railway logs focused on bot and server startup messages.
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
