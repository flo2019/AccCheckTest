(() => {
  const btn = document.getElementById('menu-toggle-skillSprint');
  const nav = document.getElementById('skillSprint-nav');
  console.log(btn);
  let revealed = false;

  const showForever = () => {
    if (!revealed) {
      
      nav.hidden = false;                 // nur einmal sichtbar machen
      nav.dataset.seen1 = 'true';          // Marker für "nie wieder verstecken"
      revealed = true;
    }
  };

  // Button toggelt nur den ARIA-State; Sichtbarkeit ändern wir nur beim ersten Öffnen
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    btn.setAttribute('aria-expanded', String(next));
    nav.setAttribute('aria-expanded', String(next));
    if (next) showForever();
  });

  // Sicherung: falls anderes JS/CSS später verstecken will, sofort rückgängig machen
  new MutationObserver(() => {
    if (revealed) {
      if (nav.hasAttribute('hidden')) nav.removeAttribute('hidden');
      if (getComputedStyle(nav).display === 'none') nav.style.display = 'block';
    }
  }).observe(nav, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
})();
