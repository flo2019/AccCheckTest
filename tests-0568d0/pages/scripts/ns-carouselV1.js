/* Neustadt – Barrierefreies Karussell (ohne Autoplay)
   Version: trap-strong-ready (JAWS-Test)
   ---------------------------------------------------------------
   Optionen am Root (<section id="carousel-neustadt">):
     data-trap="true"                -> Fokus rotiert im Karussell (Tab/Shift+Tab gefangen)
     data-trap-block-arrows="true"   -> unterdrückt Pfeiltasten-Events
     data-trap-strong="true"         -> **starke Falle**:
                                        - setzt role="application" auf den Viewport
                                        - setzt inert + aria-hidden="true" auf außerhalb des Karussells
                                        - verhindert so auch JAWS-Pfeilnavigation nach draußen
   WICHTIG: Nur auf Testseiten verwenden. Nicht produktiv ausrollen.
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

  function setOutsideInert(root, enable) {
    // Finde jenes Body-Kindelement, das das Karussell enthält
    const bodyKids = Array.from(document.body.children);
    const keeper = bodyKids.find(el => el.contains(root)) || root;
    bodyKids.forEach(el => {
      if (el === keeper) return;
      if (enable) {
        el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
      }
    });
    // Optional: Scrolling unterbinden, um Seitenwechsel zu vermeiden
    if (enable) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
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

    // ======= Tastaturfalle =======
    const trapEnabled = (root.getAttribute('data-trap') === 'true');
    const blockArrows = (root.getAttribute('data-trap-block-arrows') === 'true');
    const strongTrap  = (root.getAttribute('data-trap-strong') === 'true');

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
          // Unterdrücke Pfeiltasten bubbled/captured
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }, true);
    }

    if (strongTrap) {
      // 1) role="application" auf Viewport, um Screenreader (z. B. JAWS) in Application-/Forms-Mode zu bringen
      const prevRole = viewport.getAttribute('role');
      viewport.setAttribute('role', 'application');
      viewport.setAttribute('aria-roledescription', 'Karussell (Anwendung)');
      // 2) Alles außerhalb "inert" + aria-hidden, damit die virtuelle Navigation keine Ziele außerhalb findet
      setOutsideInert(root, true);

      // Fokus sicher im Karussell halten
      root.addEventListener('focusout', (e) => {
        if (!root.contains(e.relatedTarget)) {
          e.stopPropagation();
          setTimeout(() => viewport.focus(), 0);
        }
      });

      // Optionaler Escape-Haken (auskommentiert)
      // document.addEventListener('keydown', (e) => {
      //   if (e.key === 'Escape') {
      //     viewport.setAttribute('role', prevRole || '');
      //     setOutsideInert(root, false);
      //   }
      // }, { once: true });
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