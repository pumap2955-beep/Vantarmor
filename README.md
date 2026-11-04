# Bressh.bot

Base funcional de Bressh.bot con `discord.js`: moderación, gestión de roles y canales, autorol, auditoría y juegos para comunidades de Discord.

## Comandos incluidos

- `/ban usuario motivo`: banea a un miembro.
- `/kick usuario motivo`: expulsa a un miembro; el motivo es opcional.
- `/warn usuario avisos accion motivo`: añade una advertencia; `avisos` es obligatorio entre 1 y 10, `accion` elige `ban`, `silence`, `kick` o `blacklist`, y el motivo es opcional. La acción se ejecuta al alcanzar el número de advertencias indicado.
- `?warn @usuario avisos accion motivo`: alternativa con prefijo; por ejemplo, `?warn @usuario 2 ban spam`.
- `/userinfo usuario`: muestra ID, fechas de creación y entrada, apodo, estado, roles y si la cuenta es un bot.
- `/serverinfo`: muestra miembros, fecha de creación, dueño, nivel de verificación, roles, canales y boosts.
- `?servidor`: alternativa con prefijo para mostrar la información del servidor.
- `/bienvenida mensaje signo imagen emoji canal`: configura la bienvenida automática. `mensaje` es obligatorio y admite `{usuario}`; `signo` puede ser `!` o quedar vacío; `imagen` en `true` muestra el avatar del nuevo miembro y en `false` usa un recuadro negro; `emoji` se añade al final y `canal` es opcional. Requiere Manage Server.
- `/anuncio mensaje`: publica un aviso destacado en el canal actual, dentro de un recuadro celeste con título, fecha y marca de Bressh.bot. Requiere Manage Server.
- `/antiraid accion`: activa o desactiva la protección. Al activarla, elimina enlaces e invitaciones, mensajes repetidos más de 5 veces y palabras bloqueadas; además expulsa entradas masivas sospechosas cuando detecta 6 o más entradas en 20 segundos.
- `/bloquear_palabra palabra`: añade una palabra o expresión al filtro persistente del servidor.
- `/lista_negra`: muestra las palabras bloqueadas del servidor.
- `/unbloqueopalabra palabra`: quita del filtro la palabra seleccionada sin modificar las demás.
- `/antilink accion`: activa o desactiva el borrado de cualquier URL web o invitación de Discord; cada eliminación se registra en auditoría.
- `/anti_insulto accion`: activa o desactiva el filtro de lenguaje no adecuado. La acción es obligatoria: `activar` o `desactivar`. Al activarlo, elimina y registra expresiones configuradas como `gay`, `verga`, `vrg`, `down`, `dawn`, `rapa/raspa tu madre`, `mmgv`, `mamaguevaso`, `tu puta madre`, `hijo de puta` y `perra`.
- `/invite usuario`: suma los usos de las invitaciones activas creadas por ese miembro.
- `/avatar usuario`: muestra el avatar, el banner si existe y enlaces de descarga PNG, JPG y WEBP. El usuario es opcional; si se omite, selecciona un miembro humano al azar.
- `?avatar`: usado como respuesta a un mensaje, muestra el avatar y el banner de la persona respondida; sin responder un mensaje muestra los del autor del comando.
- `/button mensaje`: crea un juego aleatorio de sí o no basado en el texto escrito. Por ejemplo, `mensaje:Te gustan las mujeres` produce una respuesta aleatoria como “@usuario lamentablemente no le gustan las mujeres”. Todos pueden pulsarlo y cada persona recibe una respuesta independiente; no determina ninguna característica real de la persona.
- `/kiss usuario`: muestra una interacción de beso con imagen y botones `Coincidir` y `Rechazar`; solo el usuario mencionado puede responder. `?kiss` funciona respondiendo al mensaje de un usuario.
- `/slap usuario`: muestra una interacción de bofetada con imagen y botón `Devolver`; solo el usuario mencionado puede devolverla. `?slap` funciona respondiendo al mensaje de un usuario.
- `/afk motivo`: marca tu estado como ausente; el motivo es opcional.
- `?afk motivo`: alternativa con prefijo para marcarte como ausente.
- `/purge canal canal cantidad`: elimina la cantidad indicada únicamente en el canal seleccionado; admite cantidades superiores a 100 mediante lotes.
- `/purge miembro canal usuario cantidad`: elimina únicamente los mensajes del miembro seleccionado en el canal indicado.
- `?purge cantidad`: alternativa con prefijo, por ejemplo `?purge 12`.
- `/silence usuario minutos motivo`: aplica un silencio temporal de hasta 28 días.
- `/role usuario rol accion`: añade o quita un rol.
- `/lock canal`: bloquea los mensajes para `@everyone`.
- `/unlock canal`: desbloquea los mensajes para `@everyone`.
- `?lock` y `?unlock`: hacen lo mismo en el canal donde se escribe el comando.
- `/autorol rol`: guarda el rol que recibirán los nuevos miembros.
- `/cookie game`: inicia una cuenta regresiva de 5 segundos con el mensaje “Sé rápido que todos”; cuando aparece 🍪, solo la primera pulsación válida gana. El botón se desactiva y el ganador queda guardado para impedir que otra persona sea reconocida como primera.
- `/sorteo ganadores duracion recompensa`: crea un sorteo con hasta 5 ganadores elegidos aleatoriamente entre los miembros participantes del servidor; `ganadores` y `duracion` son obligatorios. La duración acepta minutos, horas o días como `2m`, `4h` o `7d`, con un máximo de 20 días. Los bots no pueden participar y los usuarios que salgan del servidor quedan fuera. `recompensa` es opcional y, si se omite, aparece “Sin recompensa especificada”.
- `/blacklist usuario`: impide que un miembro participe en el servidor, incluso con roles de moderación.
- `/unblacklist usuario`: retira el bloqueo del miembro.
- `/setlog canal`: configura un canal existente; si omites `canal`, crea `#auditoria-logs` privado para administradores.
- `/unsetlog`: desactiva los logs.
- `/ticketperm ver`: muestra categoría, roles de staff y canal de logs de tickets.
- `/ticketperm agregar-rol rol`: permite que un rol vea y atienda tickets.
- `/ticketperm quitar-rol rol`: retira un rol del staff de tickets.
- `/ticketperm categoria categoria`: define dónde se crearán los tickets privados.
- `/ticketperm logs canal`: configura el canal de registros de apertura y cierre.
- `/ticketpanel canal mensaje`: publica el panel con el botón `📩 Abrir ticket`.
- `/ping`: comprueba la conexión del bot.

Al pulsar `📩 Abrir ticket`, Bressh.bot crea un canal privado `#ticket-usuario-id`, visible para el usuario y los roles de staff configurados. El canal incluye el botón rojo `Cerrar ticket`; el creador o el staff pueden cerrarlo y el canal se elimina después de 3 segundos.

Los logs registran baneos, expulsiones, silenciamientos, blacklist/unblacklist, purgas y mensajes eliminados. Usa `/setlog` para crear automáticamente `#auditoria-logs`, o `/setlog canal:#logs` para seleccionar un canal existente. Discord normaliza el nombre a minúsculas y guiones.

AntiLink, Anti-Raid, Anti-insulto, palabras bloqueadas y spam repetido se aplican a los miembros normales. El dueño del servidor tiene una excepción automática y puede escribir sin que esos filtros borren sus mensajes; sus comandos con prefijo siguen funcionando normalmente.

## Aplicación actual

- Application ID: `1565393967841812621`
- Servidor de pruebas: `1559455132821753856`

## Configuración local

1. Crea una aplicación en Discord Developer Portal y añade un Bot User.
2. Copia `.env.example` como `.env`.
3. Completa `DISCORD_TOKEN` y `DISCORD_CLIENT_ID`.
4. Instala dependencias con `npm install`.
5. Registra los comandos con `npm run register`.
6. Inicia el bot con `npm start`.

No compartas nunca el token en el chat ni lo subas a Git. En el servidor de Discord, el rol de Bressh.bot debe estar por encima de los roles que gestionará. Activa **Server Members Intent** para `/autorol` y **Message Content Intent** para que funcionen `?lock`, `?unlock`, `?afk` y `?purge`. El permiso de Discord **Administrator** siempre puede saltarse los bloqueos de canales; ningún bot puede anular ese bypass con permission overwrites.

La configuración de autorol se guarda en `data/config.json`. Antes de producción conviene migrarla a una base de datos o almacenamiento persistente.

Los comandos Slash se registran globalmente para todos los servidores donde esté invitado Bressh.bot. Discord puede tardar hasta una hora en propagar una actualización global; el bot debe estar invitado con los scopes `bot` y `applications.commands`.
