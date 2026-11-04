import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

export const commandBuilders = [
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea a un miembro del servidor.')
    .addUserOption((option) => option.setName('usuario').setDescription('Miembro que será baneado.').setRequired(true))
    .addStringOption((option) => option.setName('motivo').setDescription('Motivo de la sanción.').setMaxLength(500))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un miembro del servidor.')
    .addUserOption((option) => option.setName('usuario').setDescription('Miembro que será expulsado.').setRequired(true))
    .addStringOption((option) => option.setName('motivo').setDescription('Motivo de la expulsión.').setMaxLength(500))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Añade una advertencia y aplica una sanción al alcanzar el límite.')
    .addUserOption((option) => option.setName('usuario').setDescription('Miembro que recibirá la advertencia.').setRequired(true))
    .addIntegerOption((option) => option.setName('avisos').setDescription('Advertencias necesarias para aplicar la acción, de 1 a 10.').setMinValue(1).setMaxValue(10).setRequired(true))
    .addStringOption((option) => option.setName('accion').setDescription('Acción al alcanzar el número de advertencias.').setRequired(true).addChoices(
      { name: 'Ban', value: 'ban' },
      { name: 'Silenciar 10 minutos', value: 'silence' },
      { name: 'Expulsar', value: 'kick' },
      { name: 'Blacklist', value: 'blacklist' },
    ))
    .addStringOption((option) => option.setName('motivo').setDescription('Motivo de la advertencia.').setMaxLength(500))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Muestra información detallada de un miembro.')
    .addUserOption((option) => option.setName('usuario').setDescription('Miembro que quieres consultar.').setRequired(true)),
  new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Muestra información detallada del servidor.'),
  new SlashCommandBuilder()
    .setName('anuncio')
    .setDescription('Publica un aviso destacado en un recuadro bonito.')
    .addStringOption((option) => option.setName('mensaje').setDescription('Texto del anuncio.').setMinLength(1).setMaxLength(2000).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('antiraid')
    .setDescription('Activa o desactiva la protección automática contra raids y spam.')
    .addStringOption((option) => option.setName('accion').setDescription('Estado de la protección.').setRequired(true).addChoices(
      { name: 'Activar', value: 'on' },
      { name: 'Desactivar', value: 'off' },
    ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('bloquear_palabra')
    .setDescription('Añade una palabra al filtro del servidor.')
    .addStringOption((option) => option.setName('palabra').setDescription('Palabra o expresión que se bloqueará.').setMinLength(1).setMaxLength(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('lista_negra')
    .setDescription('Muestra las palabras bloqueadas del servidor.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('unbloqueopalabra')
    .setDescription('Quita una palabra del filtro del servidor.')
    .addStringOption((option) => option.setName('palabra').setDescription('Palabra que se desbloqueará.').setMinLength(1).setMaxLength(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('antilink')
    .setDescription('Activa o desactiva el borrado automático de enlaces.')
    .addStringOption((option) => option.setName('accion').setDescription('Estado del filtro de enlaces.').setRequired(true).addChoices(
      { name: 'Activar', value: 'on' },
      { name: 'Desactivar', value: 'off' },
    ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('anti_insulto')
    .setDescription('Activa o desactiva el filtro de lenguaje no adecuado.')
    .addStringOption((option) => option.setName('accion').setDescription('Estado del filtro de insultos.').setRequired(true).addChoices(
      { name: 'Activar', value: 'on' },
      { name: 'Desactivar', value: 'off' },
    ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Muestra cuántas personas invitó un miembro al servidor.')
    .addUserOption((option) => option.setName('usuario').setDescription('Miembro que quieres consultar.').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Muestra el avatar de un miembro en PNG, JPG y WEBP.')
    .addUserOption((option) => option.setName('usuario').setDescription('Usuario opcional; si se omite se elige uno al azar.')),
  new SlashCommandBuilder()
    .setName('button')
    .setDescription('Crea un juego aleatorio de sí o no con un botón.')
    .addStringOption((option) => option.setName('mensaje').setDescription('Mensaje opcional que aparecerá antes del botón.').setMaxLength(500)),
  new SlashCommandBuilder()
    .setName('kiss')
    .setDescription('Envía una interacción de beso a un usuario.')
    .addUserOption((option) => option.setName('usuario').setDescription('Usuario al que se dirige el beso.').setRequired(true)),
  new SlashCommandBuilder()
    .setName('slap')
    .setDescription('Envía una interacción de bofetada a un usuario.')
    .addUserOption((option) => option.setName('usuario').setDescription('Usuario al que se dirige la bofetada.').setRequired(true)),
  new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Marca tu estado como ausente.')
    .addStringOption((option) => option.setName('motivo').setDescription('Motivo de tu ausencia.').setMaxLength(500)),
  new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Elimina mensajes de un canal o de un miembro.')
    .addSubcommand((subcommand) => subcommand
      .setName('canal')
      .setDescription('Elimina mensajes del canal indicado.')
      .addChannelOption((option) => option.setName('canal').setDescription('Canal cuyos mensajes se eliminarán.').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true))
      .addIntegerOption((option) => option.setName('cantidad').setDescription('Cantidad de mensajes que se eliminarán.').setMinValue(1).setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('miembro')
      .setDescription('Elimina mensajes del miembro indicado en un canal.')
      .addChannelOption((option) => option.setName('canal').setDescription('Canal donde se eliminarán los mensajes.').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true))
      .addUserOption((option) => option.setName('usuario').setDescription('Miembro cuyos mensajes se eliminarán.').setRequired(true))
      .addIntegerOption((option) => option.setName('cantidad').setDescription('Cantidad de mensajes que se eliminarán.').setMinValue(1).setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder()
    .setName('silence')
    .setDescription('Silencia temporalmente a un miembro.')
    .addUserOption((option) => option.setName('usuario').setDescription('Miembro que será silenciado.').setRequired(true))
    .addIntegerOption((option) => option.setName('minutos').setDescription('Duración del silencio en minutos.').setMinValue(1).setMaxValue(40320).setRequired(true))
    .addStringOption((option) => option.setName('motivo').setDescription('Motivo de la sanción.').setMaxLength(500)),
  new SlashCommandBuilder()
    .setName('role')
    .setDescription('Añade o quita un rol a un miembro.')
    .addUserOption((option) => option.setName('usuario').setDescription('Miembro al que se aplicará el cambio.').setRequired(true))
    .addRoleOption((option) => option.setName('rol').setDescription('Rol que se gestionará.').setRequired(true))
    .addStringOption((option) => option.setName('accion').setDescription('Qué quieres hacer.').setRequired(true).addChoices({ name: 'Añadir', value: 'add' }, { name: 'Quitar', value: 'remove' })),
  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Bloquea los mensajes en un canal para @everyone.')
    .addChannelOption((option) => option.setName('canal').setDescription('Canal que se bloqueará.').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Desbloquea los mensajes en un canal para @everyone.')
    .addChannelOption((option) => option.setName('canal').setDescription('Canal que se desbloqueará.').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder()
    .setName('autorol')
    .setDescription('Configura el rol automático para nuevos miembros.')
    .addRoleOption((option) => option.setName('rol').setDescription('Rol que recibirán los nuevos miembros.').setRequired(true)),
  new SlashCommandBuilder()
    .setName('bienvenida')
    .setDescription('Configura el mensaje automático para nuevos miembros.')
    .addStringOption((option) => option.setName('mensaje').setDescription('Texto de bienvenida; puedes usar {usuario} para la mención.').setMinLength(1).setMaxLength(1500).setRequired(true))
    .addStringOption((option) => option.setName('signo').setDescription('Signo opcional que aparecerá antes de la mención.').addChoices({ name: 'Sin signo', value: 'none' }, { name: 'Signo !', value: '!' }))
    .addBooleanOption((option) => option.setName('imagen').setDescription('true: avatar del nuevo miembro; false: recuadro negro.'))
    .addStringOption((option) => option.setName('emoji').setDescription('Emoji opcional al final del mensaje.').setMaxLength(32))
    .addChannelOption((option) => option.setName('canal').setDescription('Canal donde se enviará; si se omite, usa este canal.').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Bloquea a un miembro para que no pueda participar en el servidor.')
    .addUserOption((option) => option.setName('usuario').setDescription('Miembro que será bloqueado.').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('unblacklist')
    .setDescription('Quita el bloqueo de un miembro.')
    .addUserOption((option) => option.setName('usuario').setDescription('Miembro al que se quitará el bloqueo.').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Configura los logs o crea #auditoria-logs automáticamente.')
    .addChannelOption((option) => option.setName('canal').setDescription('Canal existente; si se omite, se crea uno privado.').addChannelTypes(ChannelType.GuildText))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('unsetlog')
    .setDescription('Desactiva los logs de Bressh.bot.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('ticketperm')
    .setDescription('Configura los permisos y destinos del sistema de tickets.')
    .addSubcommand((subcommand) => subcommand
      .setName('ver')
      .setDescription('Muestra la configuración actual de tickets.'))
    .addSubcommand((subcommand) => subcommand
      .setName('agregar-rol')
      .setDescription('Añade un rol que podrá atender tickets.')
      .addRoleOption((option) => option.setName('rol').setDescription('Rol del equipo de soporte.').setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('quitar-rol')
      .setDescription('Quita un rol del equipo de soporte.')
      .addRoleOption((option) => option.setName('rol').setDescription('Rol que dejará de atender tickets.').setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('categoria')
      .setDescription('Define la categoría donde se crearán los tickets.')
      .addChannelOption((option) => option.setName('categoria').setDescription('Categoría de los tickets.').addChannelTypes(ChannelType.GuildCategory).setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('logs')
      .setDescription('Define el canal para registrar aperturas y cierres.')
      .addChannelOption((option) => option.setName('canal').setDescription('Canal de logs de tickets.').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Publica un panel con el botón para abrir tickets.')
    .addChannelOption((option) => option.setName('canal').setDescription('Canal donde se publicará el panel.').addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addStringOption((option) => option.setName('mensaje').setDescription('Texto que aparecerá en el panel.').setMaxLength(1000).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('cookie')
    .setDescription('Juegos rápidos de Bressh.bot.')
    .addSubcommand((subcommand) => subcommand.setName('game').setDescription('Pulsa la galleta antes que los demás.')),
  new SlashCommandBuilder()
    .setName('sorteo')
    .setDescription('Crea un sorteo con duración y recompensa.')
    .addIntegerOption((option) => option.setName('ganadores').setDescription('Número de ganadores, entre 1 y 5.').setMinValue(1).setMaxValue(5).setRequired(true))
    .addStringOption((option) => option.setName('duracion').setDescription('Duración como 2m, 4h o 7d; máximo 20d.').setMaxLength(4).setRequired(true))
    .addStringOption((option) => option.setName('recompensa').setDescription('Qué recibirá el ganador o ganadores; opcional.').setMaxLength(500))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder().setName('ping').setDescription('Comprueba si Bressh.bot está online.'),
];

export const commandJson = commandBuilders.map((command) => command.toJSON());
