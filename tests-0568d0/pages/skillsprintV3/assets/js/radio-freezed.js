
document.addEventListener('DOMContentLoaded', () => {
  const radios = Array.from(document.querySelectorAll('input[type="radio"][name="level"]'));
  if (radios.length < 2) return;

  const initial = radios.find(r => r.checked)?.value ?? null;
  let locked = false;

  function lock(chosen) {
    if (locked) return;
    locked = true;
    radios.forEach(r => { if (r !== chosen) r.disabled = true; });
    // optional: visuelles Flag
    chosen.setAttribute('data-locked', 'true');
  }

  const handler = (e) => {
    const r = e.target;
    if (r.type === 'radio' && r.name === 'level' && !locked) {
      // Nur „echter“ Wechsel (anderer Wert als initial) löst das Lock aus
      if (r.value !== initial) lock(r);
    }
  };

  // reagiert zuverlässig auf Maus + Tastatur
  radios.forEach(r => {
    r.addEventListener('change', handler);
    r.addEventListener('input', handler);
  });
});

