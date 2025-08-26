(function(){
  'use strict';
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const live = $('#status-live');

  // Menu
  const menuToggle = $('#menu-toggle');
  const mainNav = $('#main-nav');
  if (menuToggle && mainNav) {
    const setExpanded = (exp) => { menuToggle.setAttribute('aria-expanded', String(exp)); mainNav.setAttribute('aria-expanded', String(exp)); };
    setExpanded(false);
    menuToggle.addEventListener('click', () => setExpanded(menuToggle.getAttribute('aria-expanded') !== 'true'));
    mainNav.addEventListener('keyup', (e) => { if (e.key === 'Escape') setExpanded(false); });
  }

// Menu
  const menuToggleSkillSprint = $('#menu-toggle-skillSprint');
  const skillSprintNav = $('#skillSprint-nav');
  if (menuToggleSkillSprint && skillSprintNav) {
    const setExpanded = (exp) => { menuToggleSkillSprint.setAttribute('aria-expanded', String(exp)); skillSprintNav.setAttribute('aria-expanded', String(exp)); };
    setExpanded(false);
    menuToggleSkillSprint.addEventListener('click', () => setExpanded(menuToggleSkillSprint.getAttribute('aria-expanded') !== 'true'));
    skillSprintNav.addEventListener('keyup', (e) => { if (e.key === 'Escape') setExpanded(false); });
  }

  // Accordion generic
  function setupAccordion(root){
    if (!root) return;
    const triggers = $$('.accordion-trigger', root);
    triggers.forEach(btn => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        const panel = $('#' + btn.getAttribute('aria-controls'));
        if (panel) panel.hidden = expanded;
        const ctrl = document.querySelector('button[data-target="' + root.id + '"]');
        if (ctrl) syncExpandAllLabel(root, ctrl);
      });
    });
  }

  // Expand-all generic
  function setAll(container, open){
    const triggers = $$('.accordion-trigger', container);
    triggers.forEach(btn => {
      btn.setAttribute('aria-expanded', String(open));
      const panel = $('#' + btn.getAttribute('aria-controls'));
      if (panel) panel.hidden = !open;
    });
  }
  function syncExpandAllLabel(container, control){
    if (!container || !control) return;
    const total = $$('.accordion-trigger', container).length;
    const open = $$('.accordion-trigger[aria-expanded="true"]', container).length;
    const allOpen = total > 0 && open === total;
    control.textContent = allOpen ? 'Alles einklappen' : 'Alles ausklappen';
    control.setAttribute('aria-pressed', String(allOpen));
  }

  function setupExpandAllControl(control){
    if (!control) return;
    const container = $('#' + control.dataset.target);
    if (!container) return;
    control.addEventListener('click', () => {
      const anyClosed = $$('.accordion-trigger[aria-expanded="false"]', container).length > 0;
      setAll(container, anyClosed);
      syncExpandAllLabel(container, control);
    });
    syncExpandAllLabel(container, control);
  }

  setupAccordion($('#lehrplan'));
  setupAccordion($('#faq-acc'));
  setupExpandAllControl($('#expand-all'));
  setupExpandAllControl($('#faq-expand-all'));

    // --- Form validation ---
  const form = $('#enroll-form');
  const errorBox = $('#form-errors');

  function clearFieldError(field){
    field.setAttribute('aria-invalid', 'false');
    const msgId = field.id + '-error';
    const old = document.getElementById(msgId);
    if (old) old.remove();
    const describedby = (field.getAttribute('aria-describedby') || '')
      .split(' ')
      .filter(id => id && id !== msgId)
      .join(' ')
      .trim();
    if (describedby) field.setAttribute('aria-describedby', describedby);
    else field.removeAttribute('aria-describedby');
  }

  function setFieldError(field, message){
    field.setAttribute('aria-invalid', 'true');
    const msgId = field.id + '-error';
    let msg = document.getElementById(msgId);
    if (!msg){
      msg = document.createElement('div');
      msg.id = msgId;
      msg.className = 'hint';
      msg.style.color = '#7f1d1d';
      field.insertAdjacentElement('afterend', msg);
    }
    msg.textContent = message;
    const describedby = (field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (!describedby.includes(msgId)) {
      describedby.push(msgId);
      field.setAttribute('aria-describedby', describedby.join(' ').trim());
    }
  }

  function validateForm(evt){
    if (!form) return;

    const fields = [
      document.getElementById('first'),
      document.getElementById('last'),
      document.getElementById('email'),
      document.getElementById('pay')
    ].filter(Boolean);

    const plan = Array.from(document.querySelectorAll('input[name="plan"]'));
    const agreeTerms = document.getElementById('agree-terms');
    const agreePrivacy = document.getElementById('agree-privacy');

    let errors = [];

    fields.forEach(f => {
      clearFieldError(f);
      if (f.hasAttribute('required') && !f.value.trim()){
        errors.push({field:f, message:'Pflichtfeld ausfüllen.'});
      } else if (f.id === 'email' && f.value){
        const re = /^\S+@\S+\.\S+$/;
        if (!re.test(f.value)) errors.push({field:f, message:'Bitte gültige E-Mail-Adresse eingeben.'});
      }
    });

    // Radio group required
    const planChecked = plan.some(r => r && r.checked);
    if (!planChecked && plan.length){
      errors.push({field: plan[0], message:'Bitte einen Tarif wählen.'});
    }

    // Required checkboxes
    if (agreeTerms && !agreeTerms.checked){
      errors.push({field: agreeTerms, message:'AGB akzeptieren.'});
    }
    if (agreePrivacy && !agreePrivacy.checked){
      errors.push({field: agreePrivacy, message:'Datenschutzerklärung zustimmen.'});
    }

    if (errors.length){
      evt && evt.preventDefault();
      if (errorBox){
        errorBox.innerHTML = '';
        const alert = document.createElement('div');
        alert.className = 'alert';
        alert.setAttribute('role','alert');
        alert.setAttribute('tabindex','-1');

        const h = document.createElement('h3');
        h.textContent = 'Bitte behebe die folgenden Fehler:';
        const ul = document.createElement('ul');

        errors.forEach(({field, message}) => {
          setFieldError(field, message);
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = '#' + field.id;
          a.addEventListener('click', () => field.focus());
          a.textContent = field.labels?.[0]?.textContent?.replace('*','').trim() || field.id;
          li.appendChild(a);
          li.appendChild(document.createTextNode(': ' + message));
          ul.appendChild(li);
        });

        alert.appendChild(h);
        alert.appendChild(ul);
        errorBox.appendChild(alert);
        alert.focus();
      }
      if (live) live.textContent = 'Formular enthält ' + errors.length + ' Fehler.';
      return false;
    } else {
      if (errorBox) errorBox.innerHTML = '';
      if (live) live.textContent = 'Einschreibung erfolgreich übermittelt (Demo).';
      evt && evt.preventDefault();
      form.reset();
      return true;
    }
  }

  form && form.addEventListener('submit', validateForm);

  // Error box visibility observer
  if (errorBox) {
    const obs = new MutationObserver(() => {
      const has = errorBox.textContent.trim().length > 0;
      if (has) errorBox.removeAttribute('hidden'); else errorBox.setAttribute('hidden','');
    });
    obs.observe(errorBox, {childList:true, subtree:true});
    errorBox.setAttribute('hidden','');
  }

  // Carousel
  (function setupCarousel(){
    const items = $$('.carousel-item');
    const pagers = $$('.carousel-pagination .pager');
    const prev = $('#prev-slide'), next = $('#next-slide');
    if (!items.length) return;
    let index = 0;
    function update(newIndex){
      index = (newIndex + items.length) % items.length;
      items.forEach((item, i) => {
        const active = i === index;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-hidden', String(!active));
      });
      pagers.forEach((p, i) => p.setAttribute('aria-selected', String(i === index)));
      if (live) live.textContent = 'Folie ' + (index+1) + ' von ' + items.length + '.';
    }
    pagers.forEach(p => p.addEventListener('click', () => update(parseInt(p.dataset.slide, 10))));
    prev && prev.addEventListener('click', () => update(index - 1));
    next && next.addEventListener('click', () => update(index + 1));
    update(0);
  })();

  // Course filters & search
  const courseList = $('#course-list');
  const searchInput = $('#search-input');
  const filterFree = $('#filter-free');
  const filterCert = $('#filter-cert');
  const filterA11y = $('#filter-a11y');
  const levelRadios = $$('input[name="level"]');
  const durSelect = $('#dur-select');

  function applyFilters(){
    const q = (searchInput?.value || '').trim().toLowerCase();
    const fFree = filterFree?.checked;
    const fCert = filterCert?.checked;
    const fA11y = filterA11y?.checked;
    const fLevel = (levelRadios.find(r => r.checked) || {}).value || '';
    const fDur = durSelect?.value || '';

    let visibleCount = 0;
    $$('.card', courseList).forEach(card => {
      const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
      const text = card.querySelector('p')?.textContent?.toLowerCase() || '';
      const matchesText = !q || title.includes(q) || text.includes(q);
      const matchesFree = !fFree || card.dataset.free === 'true';
      const matchesCert = !fCert || card.dataset.cert === 'true';
      const matchesA11y = !fA11y || card.dataset.a11y === 'true';
      const matchesLevel = !fLevel || card.dataset.level === fLevel;
      const matchesDur = !fDur || card.dataset.dauer === fDur;

      const show = matchesText && matchesFree && matchesCert && matchesA11y && matchesLevel && matchesDur;
      if (card) card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    //if (live) {
//      live.textContent = visibleCount + ' Kurs' + (visibleCount === 1 ? '' : 'e') + ' gefunden.';
//    }
  }

  //[searchInput, filterFree, filterCert, filterA11y, durSelect].forEach(el => {
//    el && el.addEventListener('input', applyFilters);
    //el && el.addEventListener('change', applyFilters);
  //});
  //levelRadios.forEach(r => r.addEventListener('change', applyFilters));
  //applyFilters();

  
})();  
