/* Neustadt – Barrierefreies Karussell (ohne Autoplay)
   Hinweise:
   - Robust: initialisiert sich selbst nach DOM-Load (auch bei <script defer> im <head>).
   - Tastatur: Links/Rechts, Home/Ende im Viewport; Roving-Focus auf den Dots.
   - A11y: aria-live Status, aria-current auf aktivem Dot, nur aktive Folie im A11y-Tree.
*/
(function () {
  function init() {
    const root = document.getElementById('carousel-neustadt');
    if (!root) return; // Nichts zu tun, wenn das Karussell nicht auf der Seite ist.

    const viewport = root.querySelector('#carousel-viewport');
    const status = root.querySelector('#carousel-status');
    const prevBtn = root.querySelector('#btn-prev');
    const nextBtn = root.querySelector('#btn-next');
    const slides = Array.from(viewport.querySelectorAll('.carousel__slide'));
    const dots = Array.from(root.querySelectorAll('.carousel__dot'));
    const total = slides.length;

    let index = 0;

    function announce(i) {
      const title = slides[i].querySelector('h3')?.textContent?.trim() || `Folie ${i + 1}`;
      // Trigger Live-Region-Update
      status.textContent = `Folie ${i + 1} von ${total}: ${title}`;
    }

    function updateDots(i) {
      dots.forEach((d, idx) => {
        if (idx === i) {
          d.setAttribute('aria-current', 'true');
        } else {
          d.removeAttribute('aria-current');
        }
      });
    }

    function show(i, { focusSlide = false } = {}) {
      index = (i + total) % total;

      slides.forEach((slide, idx) => {
        const active = idx === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-label', `${idx + 1} von ${total}`);
        if (active) {
          slide.removeAttribute('aria-hidden');
          slide.removeAttribute('hidden');
          if (focusSlide) slide.focus?.();
        } else {
          slide.setAttribute('aria-hidden', 'true');
          slide.setAttribute('hidden', '');
        }
      });

      updateDots(index);
      announce(index);
    }

    function next() { show(index + 1); }
    function prev() { show(index - 1); }

    // Initial
    show(0);

    // Buttons
    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    // Dots
    dots.forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.getAttribute('data-index'), 10);
        show(i);
      });
    });

    // Tastaturbedienung auf dem Viewport
    viewport?.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); prev(); break;
        case 'ArrowRight': e.preventDefault(); next(); break;
        case 'Home': e.preventDefault(); show(0); break;
        case 'End': e.preventDefault(); show(total - 1); break;
      }
    });

    // Roving Focus auf Dots
    root.querySelector('.carousel__dots')?.addEventListener('keydown', (e) => {
      const current = document.activeElement;
      if (!current || !current.classList.contains('carousel__dot')) return;

      let pos = dots.indexOf(current);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        dots[(pos + 1) % dots.length].focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        dots[(pos - 1 + dots.length) % dots.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault(); dots[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault(); dots[dots.length - 1].focus();
      }
    });

    // Erste Statusansage nach kurzer Verzögerung (Kompatibilität einiger Screenreader)
    setTimeout(() => announce(0), 50);
  }

  // Robust gegen Einbindung im <head> mit "defer" oder am Ende des <body>
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();