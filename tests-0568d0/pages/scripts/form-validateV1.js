// form-validate.js
(() => {
  const scriptEl = document.currentScript;
  const formId   = scriptEl?.dataset?.formId   || 'contactForm';
  const statusId = scriptEl?.dataset?.statusId || 'form-status';

  const norm = s => (s ?? '').trim();

  function getErrorEl(input) {
    const errId = input.getAttribute('aria-describedby');
    return errId ? document.getElementById(errId) : null;
  }

  function setError(input, msg) {
    const err = getErrorEl(input);
    if (err) err.textContent = msg;
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');

    // Ganze Gruppe visuell markieren
    if (input.type === 'radio' || input.type === 'checkbox') {
      const fs = input.closest('fieldset');
      if (fs) fs.classList.add('error');
    }
  }

  function clearError(input) {
    const err = getErrorEl(input);
    if (err) err.textContent = '';
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');

    if (input.type === 'radio' || input.type === 'checkbox') {
      const fs = input.closest('fieldset');
      if (fs) fs.classList.remove('error');
    }
  }

  function resetAll(form, status) {
    if (status) status.textContent = '';
    form.querySelectorAll('.error-message').forEach(e => e.textContent = '');
    form.querySelectorAll('input, textarea, select').forEach(i => {
      i.classList.remove('error');
      i.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('fieldset.error').forEach(fs => fs.classList.remove('error'));
  }

  function validateRadioGroup(form, name, message) {
    const radios = form.querySelectorAll(`input[name="${name}"]`);
    if (!radios.length) return false; // keine Gruppe vorhanden
    const checked = Array.from(radios).some(r => r.checked);
    if (!checked) {
      setError(radios[0], message);
      return true;
    } else {
      radios.forEach(clearError);
      return false;
    }
  }

  function attachValidation(form, status) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      resetAll(form, status);
      let hasError = false;

      // Felder
      const vorname      = form.querySelector('#vorname');
      const nachname     = form.querySelector('#nachname');
      const email        = form.querySelector('#email');
      const telefon      = form.querySelector('#telefon');
      const betreff      = form.querySelector('#betreff');
      const nachricht    = form.querySelector('#nachricht');
      const einwilligung = form.querySelector('#einwilligung');

      // Vorname
      if (vorname && norm(vorname.value) === '') {
        setError(vorname, '');
        hasError = true;
      }

      // Nachname
      if (nachname && norm(nachname.value) === '') {
        setError(nachname, '');
        hasError = true;
      }

      // E-Mail
      if (email) {
        const val = norm(email.value);
        const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (val === '') {
          setError(email, '');
          hasError = true;
        } else if (!emailPattern.test(val)) {
          setError(email, '');
          hasError = true;
        }
      }

      // Telefon (optional)
      if (telefon) {
        const val = norm(telefon.value);
        const telefonPattern = /^[0-9+\s()-]+$/;
        if (val !== '' && !telefonPattern.test(val)) {
          setError(telefon, '');
          hasError = true;
        }
      }

      // Betreff
      if (betreff && betreff.required && norm(betreff.value) === '') {
        setError(betreff, '');
        hasError = true;
      }

      // Radiogruppen (beide Pflicht)
      if (validateRadioGroup(form, 'kontaktart', 'Bitte wählen Sie eine Kontaktart.')) {
        hasError = true;
      }
      if (validateRadioGroup(form, 'dringlichkeit', 'Bitte wählen Sie eine Dringlichkeit.')) {
        hasError = true;
      }

      // Nachricht
      if (nachricht && norm(nachricht.value) === '') {
        setError(nachricht, '');
        hasError = true;
      }

      // Einwilligung
      if (einwilligung && !einwilligung.checked) {
        setError(einwilligung, '');
        hasError = true;
      }

      // Zentrale Meldung + Fokus
      if (hasError) {
        if (status) status.textContent = '';
        // Fokus nur auf echte Eingabefelder legen, nicht auf fieldset
        const firstError = form.querySelector('input.error, textarea.error, select.error');
        if (firstError) firstError.focus();
      } else {
        if (status) status.textContent = 'Vielen Dank für Ihre Nachricht!';
        form.reset();
      }
    });
  }

  function init() {
    const form   = document.getElementById(formId);
    const status = document.getElementById(statusId);
    if (!form) return;
    attachValidation(form, status);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
