  const group = document.querySelectorAll('input[type="radio"][name="level"]');
  group.forEach(r => {
    if (r.hasAttribute('data-blocked')) {
      const stop = e => e.preventDefault();
      r.addEventListener('mousedown', stop); // vor Auswahl
      r.addEventListener('click', stop);     // Klick/Label-Klick
      r.addEventListener('keydown', e => {   // Space/Enter blocken
        if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        // Pfeiltasten: auf nächste erlaubte Option springen
        if (['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(e.key)) {
          e.preventDefault();
          const allowed = [...group].filter(x => !x.hasAttribute('data-blocked'));
          const dir = (e.key==='ArrowLeft'||e.key==='ArrowUp') ? -1 : 1;
          const i = allowed.findIndex(x => x.checked) ?? 0;
          const next = allowed[(i + dir + allowed.length) % allowed.length];
          next.focus(); next.checked = true; next.dispatchEvent(new Event('change',{bubbles:true}));
        }
      });
    }
  });
