/* Neustadt – Barrierefreies Karussell (ohne Autoplay)
   Version: trap-ready
   ---------------------------------------------------------------
   Diese Datei unterstützt optional eine absichtliche Tastaturfalle
   für Testzwecke. Aktivierung über data-Attribute am Root-Element:
     - data-trap="true"                -> Tab/Shift+Tab verlassen den
                                          Karussell-Container nicht.
     - data-trap-block-arrows="true"   -> (optional) Pfeiltasten werden
                                          unterdrückt, um ein "Herausnavigieren"
                                          per Pfeilen in anderen Widgets zu verhindern.
   WICHTIG: Nur auf Testseiten verwenden. Nicht produktiv ausrollen.
   ---------------------------------------------------------------
   A11y (wenn TRAP AUS ist = Standard):
   - Tastatur: Links/Rechts, Home/Ende im Viewport; Roving-Focus auf den Dots.
   - Live-Region für Status; nur aktive Folie im A11y-Tree.
*/
(function () {
  const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]'
  ].join(',');

  function isFocusable(el) {
    if (!el) return false;
    if (el.closest('[hidden]')) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    const ti = el.getAttribute('tabindex');
    if (ti !== null && parseInt(ti, 10) < 0) return false;
    const cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    return true;
  }

  function getFocusableIn(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isFocusable);
  }

  function init() {
    const root = document.getElementById('carousel-neustadt');
    if (!root) return; // Kein Karussell vorhanden.

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
      status.textContent = `Folie ${i + 1} von ${total}: ${title}`;
    }

    function updateDots(i) {
      dots.forEach((d, idx) => {
        if (idx === i) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
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

    // Tastaturbedienung auf dem Viewport (Standard, wenn TRAP aus)
    viewport?.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); prev(); break;
        case 'ArrowRight': e.preventDefault(); next(); break;
        case 'Home': e.preventDefault(); show(0); break;
        case 'End': e.preventDefault(); show(total - 1); break;
      }
    });

    // ======= Tastaturfalle (nur wenn aktiviert) =======
    const trapEnabled = (root.getAttribute('data-trap') === 'true');
    const blockArrows = (root.getAttribute('data-trap-block-arrows') === 'true');

    if (trapEnabled) {
      // Interzeptiere Tab/Shift+Tab und rotiere Fokus innerhalb des Karussells.
      root.addEventListener('keydown', function onTrapKey(e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const focusables = getFocusableIn(root);
          if (focusables.length === 0) {
            viewport?.focus();
            return;
          }
          const active = document.activeElement;
          let idx = focusables.indexOf(active);
          if (idx === -1) {
            focusables[0].focus();
            return;
          }
          idx += e.shiftKey ? -1 : 1;
          focusables[(idx + focusables.length) % focusables.length].focus();
        } else if (blockArrows && (
          e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown'
        )) {
          e.preventDefault();
        }
      }, true);
    }

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