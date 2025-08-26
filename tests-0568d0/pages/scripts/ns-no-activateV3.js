document.addEventListener('DOMContentLoaded', () => {
  const blocked = document.querySelectorAll('input[type="checkbox"][data-no-activate]');

  blocked.forEach((chk) => {
    // Falls jemand per Script toggelt, sorgen wir immer für "unchecked".
    const revertUnchecked = () => queueMicrotask(() => { chk.checked = false; });

    // Mausklick / Touch: Toggle unterbinden
    chk.addEventListener('click', (e) => {
      e.preventDefault();         // verhindert den Zustandswechsel
      revertUnchecked();          // Sicherheitsnetz
    });

    // Tastatur: Space/Enter unterbinden (Checkbox wird sonst getoggelt)
    chk.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
        e.preventDefault();
      }
    });

    // Letzte Absicherung: Wenn sich der Wert doch ändert, sofort zurücksetzen
    chk.addEventListener('change', revertUnchecked);
  });
});
