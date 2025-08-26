document.querySelectorAll('input[type="checkbox"][data-sticky]').forEach(cb => {
  let locked = false;

  // wird beim ersten Aktivieren "verriegelt"
  cb.addEventListener('change', () => {
    if (cb.checked) {
      locked = true;
      cb.setAttribute('aria-readonly', 'true'); // nur Info für AT, keine echte Sperre
    }
  });

  // verhindert Deaktivieren per Maus oder Klick über <label>
  cb.addEventListener('click', (e) => {
    if (locked && !cb.checked) {
      e.preventDefault();     // Zustand zurückrollen
      cb.checked = true;
    }
  });

  // verhindert Deaktivieren per Leertaste
  cb.addEventListener('keydown', (e) => {
    if (locked && (e.key === ' ' || e.key === 'Spacebar')) {
      e.preventDefault();
    }
  });
});
