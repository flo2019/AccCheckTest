
document.addEventListener('DOMContentLoaded', () => {
  const root   = document.querySelector('#testimonials .carousel');
  if (!root) return;

  const items  = Array.from(root.querySelectorAll('.carousel-item'));
  const pagers = Array.from(root.querySelectorAll('.carousel-pagination .pager'));
  const prev   = root.querySelector('#prev-slide');
  const next   = root.querySelector('#next-slide');
  const view   = root.querySelector('#carousel-viewport');

  let current = Math.max(0, items.findIndex(el => el.classList.contains('is-active')));

  function show(idx) {
    idx = (idx + items.length) % items.length;
    items.forEach((el, i) => {
      const active = i === idx;
      el.classList.toggle('is-active', active);
      el.setAttribute('aria-hidden', String(!active));
    });
    pagers.forEach((btn, i) => {
      const sel = i === idx;
      btn.setAttribute('aria-selected', String(sel));
      btn.tabIndex = sel ? 0 : -1;
    });
    current = idx;
  }

  // *** Autoplay: startet sofort und hört nie auf ***
  show(current);
  setInterval(() => show(current + 1), 3000); // alle 3s weiter

  // *** Optional aggressiv: Steuerelemente wirkungslos machen ***
  const kill = (el) => el && ['click','keydown','mousedown','touchstart']
    .forEach(ev => el.addEventListener(ev, e => e.preventDefault(), { passive:false }));
  kill(prev); kill(next);
  pagers.forEach(kill);

  // *** Optional aggressiv: Screenreader bei jedem Wechsel stören ***
  // (erzwingt Live-Ansagen; zusätzlich unangenehm)
  if (view) view.setAttribute('aria-live', 'assertive');
});

