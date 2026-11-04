# Bressh.bot en Railway

Este paquete contiene el bot Node.js y todos sus comandos. En Railway configura:

- Root Directory: `/` si subes el contenido de este ZIP a un repositorio nuevo.
- Start Command: `npm start`
- Variables: `DISCORD_TOKEN` y `DISCORD_CLIENT_ID`

Después de desplegar, ejecuta una vez `npm run register` desde un entorno con esas variables para registrar o actualizar los comandos Slash globales. Discord puede tardar en propagar los comandos globales.

No subas `.env` ni compartas `DISCORD_TOKEN`.
