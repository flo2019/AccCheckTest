(() => {
  const scope = document.getElementById('faq-acc');
  if (!scope) return;

  const triggers = scope.querySelectorAll('.accordion-trigger');
  const panels   = scope.querySelectorAll('.accordion-panel');

  const close = (btn) => {
    if (!btn) return;
    const panelId = btn.getAttribute('aria-controls');
    const panel   = panelId ? document.getElementById(panelId) : null;
    btn.setAttribute('aria-expanded', 'false');
    if (panel) panel.hidden = true;
    btn.focus(); // Fokus bleibt auf dem Trigger
  };

  // 1) User-Aktionen: nach Aktivierung sofort wieder schließen
  triggers.forEach(btn => {
    btn.addEventListener('click', () => setTimeout(() => close(btn), 0));
    btn.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        setTimeout(() => close(btn), 0);
      }
    });
  });

  // 2) Programmatiche Öffnungen erkennen (z. B. fremdes Script setzt aria-expanded)
  const obsExpanded = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.attributeName === 'aria-expanded' && m.target.getAttribute('aria-expanded') === 'true') {
        setTimeout(() => close(m.target), 0);
      }
    }
  });
  triggers.forEach(btn => obsExpanded.observe(btn, { attributes: true, attributeFilter: ['aria-expanded'] }));

  // 3) Falls Panels über hidden-Attribut geöffnet werden
  const obsHidden = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.attributeName === 'hidden' && !m.target.hasAttribute('hidden')) {
        const panel = m.target;
        setTimeout(() => {
          panel.hidden = true;
          const triggerId = panel.getAttribute('aria-labelledby');
          const trigger   = triggerId ? document.getElementById(triggerId) : null;
          if (trigger) close(trigger);
        }, 0);
      }
    }
  });
  panels.forEach(p => obsHidden.observe(p, { attributes: true, attributeFilter: ['hidden'] }));

  // 4) "Alles ausklappen" sabotieren (springt sofort wieder zu)
  const expandAll = document.getElementById('faq-expand-all');
  if (expandAll) {
    expandAll.addEventListener('click', () => {
      setTimeout(() => { triggers.forEach(close); }, 0);
    });
  }
})();