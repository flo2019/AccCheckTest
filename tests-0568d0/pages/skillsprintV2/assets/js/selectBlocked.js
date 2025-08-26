  const sel = document.getElementById('pay');

  const bounceBack = () => {
    // nur zurückspringen, wenn eine andere Option gewählt wurde
    if (sel.selectedIndex !== 0) {
      // minimal verzögern, damit der Wechsel sauber zurückgesetzt wird
      setTimeout(() => {
        sel.selectedIndex = 0;   // zurück auf "Bitte wählen"
        sel.value = "";          // sicherstellen, dass der Wert leer ist
        // Events feuern, falls andere Logik darauf hört
        sel.dispatchEvent(new Event('input',  { bubbles: true }));
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }, 0);
    }
  };

  sel.addEventListener('change', bounceBack);
  sel.addEventListener('input',  bounceBack);