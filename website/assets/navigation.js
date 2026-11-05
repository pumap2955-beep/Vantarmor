(() => {
  const styles = `
    .va-menu-toggle{display:none;align-items:center;justify-content:center;width:44px;height:44px;border:1px solid #ffffff24;border-radius:12px;background:#ffffff0a;color:#fff;cursor:pointer;z-index:30}
    .va-menu-toggle span,.va-menu-toggle span:before,.va-menu-toggle span:after{display:block;width:19px;height:2px;background:#fff;border-radius:3px;position:relative;content:""}
    .va-menu-toggle span:before{position:absolute;top:-6px}.va-menu-toggle span:after{position:absolute;top:6px}
    body.authenticated .va-menu-toggle{display:flex}
    .va-menu{display:none;position:absolute;top:62px;left:0;z-index:29;width:min(280px,calc(100vw - 30px));padding:9px;border:1px solid #ffffff20;border-radius:16px;background:#111316;box-shadow:0 20px 60px #000b}
    .va-menu.open{display:grid;gap:5px}
    .va-menu button{padding:12px 14px;border:0;border-radius:10px;background:transparent;color:#e8e9ec;text-align:left;font:inherit;cursor:pointer}
    .va-menu button:hover,.va-menu button.active{background:#ffffff12;color:#fff}
    .va-page{display:none;min-height:50vh}.va-page.active{display:block}
    .va-page-heading{padding:54px 0 16px;text-align:center}.va-page-heading h1{margin:0 0 8px;font-size:clamp(2rem,5vw,3rem)}.va-page-heading p{color:#a6a9b0;margin:0}
    .va-command-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;padding:18px 0 70px}
    .va-command{padding:19px;border:1px solid #ffffff18;border-radius:16px;background:#111316}.va-command code{color:#aeb6ff;font-size:.96rem}.va-command p{color:#b4b6bd;line-height:1.55;margin:9px 0 0}
    .va-profile{max-width:560px;margin:18px auto 70px;padding:24px;border:1px solid #ffffff18;border-radius:18px;background:#111316;text-align:center}
    .va-avatar{width:76px;height:76px;margin:0 auto 13px;border-radius:50%;display:grid;place-items:center;background:#5865f2;color:#fff;font-size:2rem;font-weight:700}
    .va-profile h2{margin:5px 0}.va-profile p{color:#a6a9b0}.va-logout{display:inline-flex;margin-top:14px;padding:11px 17px;border-radius:10px;background:#b83f4c;color:white;text-decoration:none}
    .va-invite .servers{margin:0 auto 70px}.va-page #account-status{margin:0 auto 18px;max-width:800px}
    .va-page #servers-panel{display:block}
    .vc-security-promise{max-width:680px;margin:20px auto 0;padding:14px 18px;border:1px solid #73e0aa44;border-radius:14px;background:#73e0aa0d;color:#c5f7df;line-height:1.55}
    .vc-status-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;max-width:900px;margin:24px auto}
    .vc-stat{padding:20px;border:1px solid #ffffff1b;border-radius:16px;background:#111316;text-align:center}.vc-stat strong{display:block;font-size:2rem;color:#c5caff}.vc-stat span{display:block;color:#a6a9b0;margin-top:6px}
    .vc-status-list{max-width:900px;margin:24px auto 70px}.vc-status-list h2{text-align:center}.vc-status-server{padding:14px 18px;margin:9px 0;border:1px solid #ffffff18;border-radius:12px;background:#111316;display:flex;justify-content:space-between;gap:12px;align-items:center}
    .vc-online{color:#73e0aa}.vc-offline{color:#ffb4b4}.vc-profile-image{width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid #5865f2;margin:0 auto 12px;display:block}
    @media(max-width:720px){.va-menu-toggle{width:40px;height:40px}.va-page-heading{padding-top:38px}.va-command-grid{grid-template-columns:1fr}}
    @media(max-width:600px){.vc-status-server{align-items:flex-start;flex-direction:column}}
  `;
  const style = document.createElement('style');
  style.textContent = styles;
  document.head.append(style);

  const commands = [
    ['/ping', 'Comprueba que el bot está conectado y responde.'],
    ['/ayuda', 'Muestra un resumen de los comandos disponibles.'],
    ['/serverinfo', 'Muestra información y estadísticas del servidor actual.'],
    ['/infoserver', 'Alias de /serverinfo.'],
    ['/userinfo usuario', 'Muestra información de un miembro del servidor.'],
    ['/ticket-rol rol', 'Configura el rol de soporte que podrá atender tickets. Requiere Administrar servidor.'],
    ['/ticket-categoria categoría', 'Elige dónde se crearán los canales privados de tickets. Requiere Administrar servidor.'],
    ['/ticket-rol-elimimar rol', 'Quita el rol de soporte configurado. Requiere Administrar servidor.'],
    ['/ticket-panel canal [descripción]', 'Publica el panel para que los miembros abran tickets. Configura primero rol y categoría.'],
    ['/setlog-tickets', 'Crea o configura el canal privado de registros de tickets.'],
    ['/unsetlog-tickets', 'Desactiva los registros de tickets sin borrar el canal.'],
    ['/setlog', 'Crea o configura el canal de auditoría del servidor.'],
    ['/unsetlog', 'Desactiva los registros de auditoría sin borrar el canal.'],
    ['/antispam activar|desactivar repeticiones', 'Configura la eliminación de mensajes repetidos (umbral de 3 o 5 en 8 segundos).'],
    ['/antilink activar|desactivar', 'Activa o desactiva el filtro de URL e invitaciones para miembros que no sean administradores.'],
    ['/juego button mensaje', 'Crea un juego de suerte con botón y resultado de sí/no.'],
    ['/afk [motivo]', 'Activa tu estado AFK en el servidor; el bot avisa cuando te mencionan.'],
    ['/avatar usuario', 'Muestra el avatar y, si tiene, el banner de un miembro.'],
    ['/sorteo ganadores duración [premio]', 'Comando registrado para sorteos; actualmente informa que necesita la versión anterior del módulo.'],
    ['/cookie', 'Inicia la carrera de la galleta: cuenta regresiva de 5 segundos y gana quien pulse primero.'],
    ['/número numero', 'Inicia un juego para que otros adivinen un número entre 1 y 200.'],
    ['/autorole rol', 'Configura el rol automático de nuevos miembros. Requiere Administrar roles.'],
    ['/ban usuario', 'Banea a un miembro si tienes permiso y la jerarquía de roles lo permite.'],
    ['/kick usuario', 'Expulsa a un miembro si tienes permiso y la jerarquía de roles lo permite.'],
    ['/warn usuario limite accion [motivo]', 'Advierte a un miembro; al alcanzar el límite elegido puede banearse, expulsarse o silenciarse.'],
    ['/unwarn usuario [motivo]', 'Quita las advertencias registradas de un miembro.'],
    ['/time out usuario duración', 'Aísla temporalmente a un miembro (mínimo 1 minuto, máximo 28 días).'],
    ['/invite [usuario]', 'Muestra las invitaciones atribuidas a una persona desde que el bot está activo; necesita permiso para leer invitaciones.'],
    ['/lock', 'Bloquea el canal actual para que @everyone no pueda enviar mensajes.'],
    ['/unlock', 'Desbloquea el canal actual.'],
    ['/bloqueo_palabra palabra', 'Añade una palabra o frase al filtro de mensajes.'],
    ['/desbloqueo_palabra palabra', 'Quita una palabra o frase del filtro.'],
    ['/purge cantidad', 'Elimina entre 1 y 100 mensajes; requiere Administrar mensajes.'],
    ['/anuncio mensaje', 'Publica un anuncio en el canal actual; requiere Administrar mensajes.'],
    ['?servidor', 'Comando de texto: muestra la información del servidor.'],
    ['?info', 'Responde al mensaje de un miembro para mostrar su información.'],
    ['?time out duración', 'Responde al miembro que quieres aislar; ejemplo: ?time out 12m.'],
    ['?lock / ?unlock', 'Bloquea o desbloquea el canal actual.'],
    ['?purge cantidad', 'Elimina entre 1 y 100 mensajes; requiere Administrar mensajes.'],
    ['?ban / ?kick', 'Responde al mensaje de la persona que quieres banear o expulsar.'],
    ['?afk [motivo]', 'Activa el estado AFK con un motivo opcional.'],
    ['?avatar', 'Muestra tu avatar; responde a un mensaje para ver el de otra persona.'],
    ['?kiss (responder a un mensaje)', 'Responde al mensaje de una persona para enviarle un beso con opciones de coincidir o rechazar.'],
    ['?slap (responder a un mensaje)', 'Responde al mensaje de una persona para enviarle una bofetada de broma con opción de devolverla.'],
  ];

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function init() {
    const headerNav = document.querySelector('header nav');
    const main = document.querySelector('main');
    const hero = main && main.querySelector('.hero');
    const dashboard = document.getElementById('dashboard');
    if (!headerNav || !main || !hero) return;

    const brand = document.querySelector('.brand');
    if (brand) {
      const logo = brand.querySelector('.logo');
      brand.textContent = ' Vantarmor Commands';
      if (logo) brand.prepend(logo);
    }
    const heroHeading = hero.querySelector('h1');
    const heroDescription = hero.querySelector(':scope > p');
    if (heroHeading) heroHeading.innerHTML = 'Bienvenido a <span>Vantarmor Commands</span>';
    if (heroDescription) heroDescription.textContent = 'Todo lo que tu comunidad necesita para sentirse más segura: moderación, protección automática, tickets de soporte y herramientas útiles, en un solo bot.';
    if (!document.getElementById('vc-security-promise')) {
      hero.append(node('div', 'vc-security-promise', '🛡️ 100% enfocados en ofrecer herramientas para ayudarte a proteger tu comunidad, sin prometer seguridad absoluta.'));
    }

    if (!document.getElementById('va-home')) {
      const toggle = node('button', 'va-menu-toggle');
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Abrir menú');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span aria-hidden="true"></span>';
      const menu = node('div', 'va-menu');
      menu.setAttribute('role', 'navigation');
      menu.setAttribute('aria-label', 'Menú del sitio');
      headerNav.style.position = 'relative';
      headerNav.insertBefore(toggle, headerNav.firstChild);
      headerNav.append(menu);

      const home = node('section', 'va-page active');
      home.id = 'va-home';
      main.insertBefore(home, hero);
      home.append(hero);
      if (dashboard) home.append(dashboard);

      const functionsPage = node('section', 'va-page');
      functionsPage.id = 'va-functions';
      const functionsHeading = node('div', 'va-page-heading');
      functionsHeading.append(node('h1', '', 'Funciones'), node('p', '', 'Comandos del bot y para qué sirve cada uno.'));
      const commandGrid = node('div', 'va-command-grid');
      for (const [command, description] of commands) {
        const card = node('article', 'va-command');
        card.append(node('code', '', command), node('p', '', description));
        commandGrid.append(card);
      }
      functionsPage.append(functionsHeading, commandGrid);
      main.append(functionsPage);

      const invitePage = node('section', 'va-page va-invite');
      invitePage.id = 'va-invite';
      const inviteHeading = node('div', 'va-page-heading');
      inviteHeading.append(node('h1', '', 'Invitar bot'), node('p', '', 'Elige uno de tus servidores administrables para añadir Vantarmor.'));
      const inviteStatus = node('div', 'status');
      inviteStatus.id = 'va-invite-status';
      invitePage.append(inviteHeading, inviteStatus);
      main.append(invitePage);
      const accountStatus = document.getElementById('account-status');
      const serversPanel = document.getElementById('servers-panel');
      if (accountStatus) inviteStatus.append(accountStatus);
      if (serversPanel) invitePage.append(serversPanel);

      const settingsPage = node('section', 'va-page');
      settingsPage.id = 'va-settings';
      const settingsHeading = node('div', 'va-page-heading');
      settingsHeading.append(node('h1', '', 'Ajustes'), node('p', '', 'Tu perfil de Discord y el acceso a tu cuenta.'));
      const profile = node('section', 'va-profile');
      const avatar = node('img', 'vc-profile-image');
      avatar.alt = 'Foto de perfil de Discord';
      avatar.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
      const avatarFallback = node('div', 'va-avatar', 'V');
      avatarFallback.id = 'va-avatar';
      const profileName = node('h2', '', 'Cuenta de Discord');
      profileName.id = 'va-profile-name';
      const profileCaption = node('p', '', 'Sesión iniciada con Discord');
      const logout = node('a', 'va-logout', 'Cerrar sesión');
      logout.href = '/auth/logout';
      profile.append(avatar, avatarFallback, profileName, profileCaption, logout);
      settingsPage.append(settingsHeading, profile);
      main.append(settingsPage);

      const statusPage = node('section', 'va-page');
      statusPage.id = 'va-status';
      const statusHeading = node('div', 'va-page-heading');
      statusHeading.append(node('h1', '', 'Estados'), node('p', '', 'Disponibilidad del bot y servidores que puedes administrar.'));
      const stats = node('div', 'vc-status-grid');
      const onlineStat = node('article', 'vc-stat');
      onlineStat.append(node('strong', 'vc-online', '…'), node('span', '', 'Estado del bot'));
      onlineStat.querySelector('strong').id = 'vc-online';
      const guildStat = node('article', 'vc-stat');
      guildStat.append(node('strong', '', '…'), node('span', '', 'Servidores conectados'));
      guildStat.querySelector('strong').id = 'vc-guild-count';
      const commandStat = node('article', 'vc-stat');
      commandStat.append(node('strong', '', '…'), node('span', '', 'Comandos activos'));
      commandStat.querySelector('strong').id = 'vc-command-count';
      stats.append(onlineStat, guildStat, commandStat);
      const serverList = node('div', 'vc-status-list');
      serverList.append(node('h2', '', 'Servidores que administras con el bot'));
      const serverListBody = node('div');
      serverListBody.id = 'vc-server-list';
      serverList.append(serverListBody);
      statusPage.append(statusHeading, stats, serverList);
      main.append(statusPage);

      const items = [
        ['Inicio', 'va-home'],
        ['Funciones', 'va-functions'],
        ['Invite bot', 'va-invite'],
        ['Estados', 'va-status'],
        ['Ajustes', 'va-settings'],
      ];
      const buttons = new Map();
      function setPage(pageId) {
        for (const page of main.querySelectorAll('.va-page')) page.classList.toggle('active', page.id === pageId);
        for (const [id, button] of buttons) button.classList.toggle('active', id === pageId);
        history.replaceState(null, '', `#${pageId.replace('va-', '')}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (pageId === 'va-status') refreshStatus();
      }
      for (const [label, pageId] of items) {
        const button = node('button', '', label);
        button.type = 'button';
        button.addEventListener('click', () => {
          setPage(pageId);
          menu.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
        buttons.set(pageId, button);
        menu.append(button);
      }
      toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', event => {
        if (!headerNav.contains(event.target)) {
          menu.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
      window.addEventListener('hashchange', () => {
        const route = `va-${location.hash.slice(1)}`;
        if (pagesIds.has(route)) setPage(route);
      });
      const pagesIds = new Set(items.map(([, id]) => id));

      const accountName = document.getElementById('account-name');
      const profileName = document.getElementById('va-profile-name');
      if (accountName) {
        const syncName = () => {
          const name = accountName.textContent.trim();
          if (name && name !== 'Discord') profileName.textContent = name;
        };
        syncName();
        new MutationObserver(syncName).observe(accountName, { childList: true, characterData: true, subtree: true });
      }
      fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(data => {
        if (!data || !data.user) return;
        if (data.user.username) profileName.textContent = data.user.username;
        if (data.user.avatar_url) avatar.src = data.user.avatar_url;
        else avatarFallback.textContent = [...(data.user.username || 'V')][0].toUpperCase();
      }).catch(() => {});
      document.body.classList.add('va-navigation-ready');
      if (pagesIds.has(`va-${location.hash.slice(1)}`)) setPage(`va-${location.hash.slice(1)}`);
      const error = document.getElementById('login-error');
      if (error && error.textContent.trim()) setPage('va-home');
    }

    async function refreshStatus() {
      const online = document.getElementById('vc-online');
      const guildCount = document.getElementById('vc-guild-count');
      const commandCount = document.getElementById('vc-command-count');
      const serverList = document.getElementById('vc-server-list');
      if (!online || !guildCount || !commandCount || !serverList) return;
      try {
        const response = await fetch('/api/status', { credentials: 'same-origin', cache: 'no-store' });
        if (!response.ok) throw new Error('status');
        const data = await response.json();
        online.textContent = data.online ? 'En línea' : 'Desconectado';
        online.className = data.online ? 'vc-online' : 'vc-offline';
        guildCount.textContent = String(data.guild_count ?? '—');
        commandCount.textContent = String(data.active_commands ?? '—');
        serverList.replaceChildren();
        if (!data.servers || !data.servers.length) serverList.append(node('p', '', 'No hay servidores administrables con Vantarmor conectado.'));
        else for (const server of data.servers) {
          const row = node('div', 'vc-status-server');
          row.append(node('strong', '', server.name), node('span', data.online ? 'vc-online' : 'vc-offline', data.online ? '● Conectado' : '● Sin conexión'));
          serverList.append(row);
        }
      } catch (_) {
        online.textContent = 'No disponible';
        online.className = 'vc-offline';
        guildCount.textContent = '—';
        commandCount.textContent = '—';
        serverList.replaceChildren(node('p', '', 'No se pudo consultar el estado ahora.'));
      }
    }

    if (document.readyState !== 'loading') setInterval(refreshStatus, 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
