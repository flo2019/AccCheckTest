document.addEventListener('DOMContentLoaded', () => {
  // Optional: explizite Liste von Panel-IDs, die verriegelt werden sollen.
  // Leerlassen, wenn du ausschließlich per data-lock-open markierst.
  const LOCKED_PANELS = [
    // 'acc-haeufige-anliegen',
    // 'acc-irgendwas'
  ];

  const triggers = document.querySelectorAll('.disclosure-trigger[data-disclosure]');
  triggers.forEach((btn) => {
    const panelId = btn.getAttribute('aria-controls');
    if (!panelId) return;
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const group = btn.closest('.disclosure-group');
    const markedByAttr =
      btn.hasAttribute('data-lock-open') ||
      (group && group.hasAttribute('data-lock-open'));

    const markedByIdList = LOCKED_PANELS.includes(panelId);

    if (!(markedByAttr || markedByIdList)) {
      // Dieses Menü bleibt normal.
      return;
    }

    // Sofort öffnen & „verriegelt“ halten
    const enforceOpen = () => {
      //if (panel.hidden) panel.hidden = false;
      if (btn.getAttribute('aria-expanded') !== 'true') {
        //btn.setAttribute('aria-expanded', 'true');
      }
    };
    enforceOpen();

    // Klick/Enter/Space am Button abfangen, damit kein Schließen möglich ist
    const block = (ev) => {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      enforceOpen();
    };
    btn.addEventListener('click', block, true);
    btn.addEventListener('keydown', (ev) => {
      // Falls irgendein Code Enter/Space fürs Toggle nutzt
      if (ev.key === 'Enter' || ev.key === ' ') {
        block(ev);
      }
    }, true);

    // Sicherheitsnetz: Wenn anderer Code versucht zu schließen, sofort wieder öffnen
    const mo = new MutationObserver(() => enforceOpen());
    mo.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    mo.observe(btn,   { attributes: true, attributeFilter: ['aria-expanded'] });
  });
});
