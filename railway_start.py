import re
import runpy
from pathlib import Path


APP_FILE = Path(__file__).with_name("app.py")
source = APP_FILE.read_text(encoding="utf-8")

# Older versions of app.py use ticket_panel without declaring it in the
# persisted configuration defaults. Add it before importing the bot so that
# /ticket-panel does not fail with KeyError on Railway.
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

# Run the bot as the main module after applying the backwards-compatible fix.
runpy.run_path(str(APP_FILE), run_name="__main__")
