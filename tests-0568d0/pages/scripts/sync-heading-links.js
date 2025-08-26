// sync-heading-links.js
(() => {
  // IDs können per data-Attribut am <script>-Tag übergeben werden (siehe HTML unten).
  const scriptEl = document.currentScript;
  const idsAttr = scriptEl?.dataset?.containers || '';
  const DEFAULT_IDS = ['diensteGrid', 'rathausTeaser']; // <- falls nichts übergeben wird
  const CONTAINER_IDS = idsAttr
    ? idsAttr.split(',').map(s => s.trim()).filter(Boolean)
    : DEFAULT_IDS;

  const norm = s => (s ?? '').replace(/\s+/g, ' ').trim();

  function run() {
    CONTAINER_IDS.forEach(id => {
      const container = document.getElementById(id);
      if (!container) return;

      container.querySelectorAll('h3').forEach(h3 => {
        const headingText = norm(h3.textContent);
        let node = h3.nextElementSibling;

        // Bis zur nächsten <h3> laufen und den ersten Button-Link verarbeiten
        while (node && node.tagName !== 'H3') {
          const link = node.matches?.('a.button') ? node : node.querySelector?.('a.button');
          if (link) {
            const baseText = norm(link.textContent);
            const alreadyHasHeading = baseText.toLowerCase().includes(headingText.toLowerCase());

            if (!alreadyHasHeading && headingText) {
              link.textContent = norm(`${baseText} ${headingText}`); // nur anhängen
            }
            link.removeAttribute('aria-label'); // Redundanz vermeiden
            break; // nur den ersten Button bis zur nächsten <h3> ändern
          }
          node = node.nextElementSibling;
        }
      });
    });
  }

  // Sicherstellen, dass das DOM bereit ist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
