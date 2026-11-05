(() => {
  const $ = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text) el.textContent = text;
    return el;
  };

  function init() {
    const brand = document.querySelector('.brand');
    if (brand) {
      const logo = brand.querySelector('.logo');
      brand.textContent = ' Vantarmor Commands';
      if (logo) brand.prepend(logo);
    }

    const hero = document.querySelector('.hero');
    if (hero) {
      const heading = hero.querySelector('h1');
      const description = hero.querySelector(':scope > p');
      if (heading) heading.innerHTML = 'Bienvenido a <span>Vantarmor Commands</span>';
      if (description) description.textContent = 'Todo lo que tu comunidad necesita para sentirse más segura: moderación, protección automática, tickets de soporte y herramientas útiles, en un solo bot.';
      let highlight = document.getElementById('vc-security-promise');
      if (!highlight) {
        highlight = $('div', 'vc-security-promise', '🛡️ 100% enfocados en ayudarte a proteger tu comunidad — con herramientas de seguridad por capas, no promesas absolutas.');
        hero.append(highlight);
      }
    }

    const menu = document.querySelector('.va-menu');
    const main = document.querySelector('main');
    if (!menu || !main || document.getElementById('va-status')) return;

    const style = $('style');
    style.textContent = `
      .vc-security-promise{max-width:680px;margin:20px auto 0;padding:14px 18px;border:1px solid #73e0aa44;border-radius:14px;background:#73e0aa0d;color:#c5f7df;line-height:1.55}
      .vc-status-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;max-width:900px;margin:24px auto}
      .vc-stat{padding:20px;border:1px solid #ffffff1b;border-radius:16px;background:#111316;text-align:center}
      .vc-stat strong{display:block;font-size:2rem;color:#c5caff}.vc-stat span{display:block;color:#a6a9b0;margin-top:6px}
      .vc-status-list{max-width:900px;margin:24px auto 70px}.vc-status-list h2{text-align:center}.vc-status-server{padding:14px 18px;margin:9px 0;border:1px solid #ffffff18;border-radius:12px;background:#111316;display:flex;justify-content:space-between;gap:12px;align-items:center}
      .vc-online{color:#73e0aa}.vc-offline{color:#ffb4b4}.vc-profile-image{width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid #5865f2;margin:0 auto 12px;display:block}
      @media(max-width:600px){.vc-status-server{align-items:flex-start;flex-direction:column}}
    `;
    document.head.append(style);

    const statusPage = $('section', 'va-page');
    statusPage.id = 'va-status';
    const heading = $('div', 'va-page-heading');
    heading.append($('h1', '', 'Estado del bot'), $('p', '', 'Disponibilidad y servidores que puedes administrar.'));
    const stats = $('div', 'vc-status-grid');
    const onlineStat = $('article', 'vc-stat');
    onlineStat.innerHTML = '<strong id="vc-online">…</strong><span>Estado</span>';
    const guildStat = $('article', 'vc-stat');
    guildStat.innerHTML = '<strong id="vc-guild-count">…</strong><span>Servidores conectados</span>';
    const commandStat = $('article', 'vc-stat');
    commandStat.innerHTML = '<strong id="vc-command-count">…</strong><span>Comandos activos</span>';
    stats.append(onlineStat, guildStat, commandStat);
    const list = $('div', 'vc-status-list');
    list.append($('h2', '', 'Tus servidores con Vantarmor'));
    const listBody = $('div');
    listBody.id = 'vc-server-list';
    list.append(listBody);
    statusPage.append(heading, stats, list);
    main.append(statusPage);

    const navButton = $('button', '', 'Estados');
    navButton.type = 'button';
    menu.append(navButton);
    const pages = () => [...document.querySelectorAll('.va-page')];
    function openStatus() {
      pages().forEach(page => page.classList.toggle('active', page === statusPage));
      menu.classList.remove('open');
      const toggle = document.querySelector('.va-menu-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      history.replaceState(null, '', '#status');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    navButton.addEventListener('click', openStatus);
    window.addEventListener('hashchange', () => {
      if (location.hash === '#status') openStatus();
    });

    const accountName = document.getElementById('account-name');
    const profileName = document.getElementById('va-profile-name');
    if (profileName) {
      const avatar = $('img', 'vc-profile-image');
      avatar.alt = 'Foto de perfil de Discord';
      const card = document.querySelector('.va-profile');
      if (card) card.prepend(avatar);
      const syncProfile = () => {
        const current = accountName && accountName.textContent.trim();
        if (current && current !== 'Discord') profileName.textContent = current;
      };
      syncProfile();
      fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' })
        .then(response => response.ok ? response.json() : null)
        .then(data => {
          if (!data || !data.user) return;
          if (data.user.avatar_url) avatar.src = data.user.avatar_url;
          if (data.user.username) profileName.textContent = data.user.username;
        }).catch(() => {});
      if (accountName) new MutationObserver(syncProfile).observe(accountName, { childList: true, characterData: true, subtree: true });
    }

    async function refreshStatus() {
      const online = document.getElementById('vc-online');
      const guildCount = document.getElementById('vc-guild-count');
      const commandCount = document.getElementById('vc-command-count');
      const serverList = document.getElementById('vc-server-list');
      try {
        const response = await fetch('/api/status', { credentials: 'same-origin', cache: 'no-store' });
        if (!response.ok) throw new Error('No se pudo consultar el estado.');
        const data = await response.json();
        online.textContent = data.online ? 'En línea' : 'Desconectado';
        online.className = data.online ? 'vc-online' : 'vc-offline';
        guildCount.textContent = String(data.guild_count ?? '—');
        commandCount.textContent = String(data.active_commands ?? '—');
        serverList.replaceChildren();
        if (!data.servers || !data.servers.length) {
          serverList.append($('p', '', 'No hay servidores administrables con el bot instalado.'));
        } else {
          for (const guild of data.servers) {
            const row = $('div', 'vc-status-server');
            row.append($('strong', '', guild.name), $('span', data.online ? 'vc-online' : 'vc-offline', data.online ? '● Conectado' : '● Sin conexión'));
            serverList.append(row);
          }
        }
      } catch (_) {
        online.textContent = 'No disponible';
        online.className = 'vc-offline';
        guildCount.textContent = '—';
        commandCount.textContent = '—';
        serverList.replaceChildren($('p', '', 'Estado temporalmente no disponible.'));
      }
    }
    refreshStatus();
    setInterval(refreshStatus, 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
