document.addEventListener('DOMContentLoaded', () => {
  // Optional: zusätzliche IDs der Panels, die verriegelt werden sollen
  const LOCKED_PANELS = [
    // 'acc-haeufige-anliegen',
  ];

  const triggers = document.querySelectorAll('.disclosure-trigger[data-disclosure]');

  triggers.forEach((btn) => {
    const panelId = btn.getAttribute('aria-controls');
    if (!panelId) return;
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const group = btn.closest('.disclosure-group');
    const shouldLock =
      btn.hasAttribute('data-lock-open') ||
      (group && group.hasAttribute('data-lock-open')) ||
      LOCKED_PANELS.includes(panelId);

    if (!shouldLock) return;

    let locked = false;

    const isOpen = () =>
      btn.getAttribute('aria-expanded') === 'true' || !panel.hasAttribute('hidden');

    const enforceOpen = () => {
      // Nur setzen, wenn tatsächlich nötig (vermeidet unnötige Mutations)
      if (panel.hasAttribute('hidden')) panel.hidden = false;
      if (btn.getAttribute('aria-expanded') !== 'true') {
        btn.setAttribute('aria-expanded', 'true');
      }
    };

    const tryLockAfterUserAction = () => {
      // Warten, bis die normale Toggle-Logik (dein Code/Framework) fertig ist
      setTimeout(() => {
        if (!locked && isOpen()) {
          locked = true;

          // 1) Wenn später jemand schließt -> sofort wieder öffnen
          const mo = new MutationObserver(() => {
            if (locked && !isOpen()) enforceOpen();
          });
          mo.observe(panel, { attributes: true, attributeFilter: ['hidden'] });

          // 2) Weitere Klicks/Enter/Space auf DEMSELBEN Button: erst normal ausführen lassen,
          //    dann (falls geschlossen) direkt wieder öffnen – keine preventDefault/stopPropagation!
          btn.addEventListener('click', () => setTimeout(enforceOpen, 0));
          btn.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') setTimeout(enforceOpen, 0);
          });

          // Sicherstellen, dass es direkt nach dem Verriegeln offen ist
          enforceOpen();
        }
      }, 0);
    };

    // So oft reagieren, bis verriegelt wurde (kein once, falls der erste Versuch nicht öffnet)
    btn.addEventListener('click', tryLockAfterUserAction);
    btn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') tryLockAfterUserAction();
    });
  });
});
