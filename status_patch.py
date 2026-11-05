from pathlib import Path
import json
import time

STATUS_MARKER = "# VANTARMOR_LIVE_STATUS"
STATUS_HELPERS = r'''# VANTARMOR_LIVE_STATUS
STATUS_FILE = Path(__file__).with_name("bot_status.json")


def publish_bot_status():
    payload = {
        "online": client.is_ready(),
        "guilds": [{"id": str(guild.id), "name": guild.name} for guild in client.guilds],
        "guild_count": len(client.guilds),
        "active_commands": len(tree.get_commands(guild=GUILD)),
        "updated_at": time.time(),
    }
    temporary = STATUS_FILE.with_suffix(".tmp")
    try:
        temporary.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        temporary.replace(STATUS_FILE)
    except OSError as error:
        print(f"No pude actualizar el estado del bot: {error}")


async def bot_status_loop():
    while True:
        publish_bot_status()
        await asyncio.sleep(30)
'''


def patch_status(app_file: Path) -> None:
    source = app_file.read_text(encoding="utf-8")
    if STATUS_MARKER not in source:
        ready_marker = '@client.event\nasync def on_ready():\n'
        if ready_marker not in source:
            raise RuntimeError("No encontré on_ready en app.py para publicar el estado del bot.")
        source = source.replace(ready_marker, STATUS_HELPERS + "\n\n" + ready_marker, 1)

    ready_body = '    print(f"Conectado como {client.user}")\n'
    if ready_body not in source:
        raise RuntimeError("No encontré el inicio de on_ready en app.py.")
    if 'client.status_task = asyncio.create_task(bot_status_loop())' not in source:
        source = source.replace(
            ready_body,
            ready_body
            + '    publish_bot_status()\n'
            + '    if not getattr(client, "status_task", None) or client.status_task.done():\n'
            + '        client.status_task = asyncio.create_task(bot_status_loop())\n',
            1,
        )
    app_file.write_text(source, encoding="utf-8")
