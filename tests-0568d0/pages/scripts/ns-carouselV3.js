/* Neustadt – Karussell (absichtlich fehlerhaft)
   Verstöße, die fest implementiert sind:
   1) Inaktive Slides werden NICHT aus dem Accessibility-Tree entfernt
      (keine Verwendung von hidden/aria-hidden; visuell Offscreen).
   2) Maus-only: Steuerung nur per Maus – keine Tastaturhandhabung,
      Steuerelemente sind nicht fokussierbar (<div> ohne tabindex/role).
*/
(function () {
  function init() {
    const root = document.getElementById('carousel-neustadt');
    if (!root) return;

    const viewport = document.getElementById('carousel-viewport');
    const status = document.getElementById('carousel-status');
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const slides = Array.from(viewport.querySelectorAll('.carousel__slide'));
    const dots = Array.from(root.querySelectorAll('.carousel__dot'));
    const total = slides.length;

    let index = slides.findIndex(s => s.classList.contains('is-active'));
    if (index < 0) index = 0;

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

    function show(i) {
      index = (i + total) % total;

      slides.forEach((slide, idx) => {
        const active = idx === index;
        slide.classList.toggle('is-active', active);
        slide.classList.toggle('is-inactive', !active);
        // ABSICHTLICHER VERSTOß: NICHT aria-hidden oder hidden setzen!
        // slide.setAttribute('aria-hidden', ...);  // <- NICHT vorhanden
        // slide.hidden = !active;                  // <- NICHT vorhanden
        slide.setAttribute('aria-label', `${idx + 1} von ${total}`);
      });

      updateDots(index);
      announce(index);
    }

    function next() { show(index + 1); }
    function prev() { show(index - 1); }

    // Initial
    show(index);

    // ===== Maus-only: nur Click-Handler, KEINE Key-Handler =====
    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const i = parseInt(dot.getAttribute('data-index'), 10);
        if (!Number.isNaN(i)) show(i);
      });
    });

    // KEINE Tastaturbedienung: bewusst KEINE keydown/keyup Listener
    // viewport hat KEIN tabindex -> nicht fokussierbar per Tastatur
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();