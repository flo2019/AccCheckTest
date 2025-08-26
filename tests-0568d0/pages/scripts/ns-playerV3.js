
(function () {
  const audio = document.getElementById('ns-audio');
  const playBtn = document.getElementById('ns-play');
  const muteBtn = document.getElementById('ns-mute');
  const back10Btn = document.getElementById('ns-back10');
  const fwd30Btn = document.getElementById('ns-fwd30');
  const seek = document.getElementById('ns-seek');
  const vol = document.getElementById('ns-volume');
  const rate = document.getElementById('ns-rate');
  const cur = document.getElementById('ns-current');
  const dur = document.getElementById('ns-duration');
  const status = document.getElementById('ns-status');
  const downloadLink = document.getElementById('ns-download');
  const controls = document.getElementById('ns-controls');
  const note = document.getElementById('ns-autoplay-note');
  const noteMsg = document.getElementById('ns-autoplay-msg');
  const startBtn = document.getElementById('ns-start');
  const unmuteBtn = document.getElementById('ns-unmute');

  // Loop + default volume (50%)
  audio.loop = true;
  try { audio.volume = 0.5; } catch (e) {}
  if (vol) { vol.value = "0.5"; vol.setAttribute('aria-valuetext', '50%'); }

  // Sync the download link to the current source
  const sourceEl = audio.querySelector('source');
  if (sourceEl && sourceEl.src) downloadLink.href = sourceEl.src;

  const announce = (text) => { if (status) status.textContent = text; };

  const fmtTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00';
    seconds = Math.max(0, Math.floor(seconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const ms = String(m).padStart(h ? 2 : 1, '0');
    const ss = String(s).padStart(2, '0');
    return h ? `${h}:${ms}:${ss}` : `${m}:${ss}`;
  };

  // --- VIOLATION 2: Misleading labels ---
  function updatePlayVisuals() {
    const isPlaying = !audio.paused;
    playBtn.setAttribute('aria-pressed', String(isPlaying));
    playBtn.classList.toggle('is-active', isPlaying);
    // Intentional mismatch: visible text vs accessible name
    playBtn.querySelector('span').textContent = 'Abspielen'; // visible
    playBtn.setAttribute('aria-label', 'Pause');             // programmatic
  }
  function updateMuteVisuals() {
    const isMuted = audio.muted || audio.volume === 0;
    muteBtn.setAttribute('aria-pressed', String(isMuted));
    muteBtn.classList.toggle('is-active', isMuted);
    // Intentional mismatch
    muteBtn.querySelector('span').textContent = 'Stumm';           // visible
    muteBtn.setAttribute('aria-label', 'Maximale Lautstärke');     // programmatic
  }

  const syncSeekBackground = () => {
    const progress = (seek.value - seek.min) / (seek.max - seek.min) * 100;
    seek.style.setProperty('--_progress', progress + '%');
  };

  const hideNote = () => { if (note) note.hidden = true; };
  const showNote = (msg, showStart, showUnmute) => {
    if (!note) return;
    if (msg) noteMsg.textContent = msg;
    if (startBtn) startBtn.hidden = !showStart;
    if (unmuteBtn) unmuteBtn.hidden = !showUnmute;
    note.hidden = false;
  };

  async function tryPlay(muted) {
    const prevMuted = audio.muted;
    audio.muted = !!muted;
    try {
      await audio.play();
      updatePlayVisuals();
      updateMuteVisuals();
      return true;
    } catch (err) {
      audio.muted = prevMuted;
      updateMuteVisuals();
      return false;
    }
  }

  async function bootstrapAutoplay() {
    // Prefer muted autoplay first (reliable in most browsers)
    if (await tryPlay(true)) {
      showNote('Autoplay ohne Ton gestartet.', false, true);
      announce('Autoplay ohne Ton gestartet – „Ton einschalten“ aktivieren.');
      return;
    }
    // If blocked entirely:
    showNote('Autoplay wurde blockiert. Bitte starten.', true, false);
    announce('Autoplay blockiert – bitte „Audio starten“ drücken.');
  }

  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      if (await tryPlay(false)) {
        hideNote(); announce('Wiedergabe gestartet');
      } else if (await tryPlay(true)) {
        showNote('Wiedergabe stumm gestartet.', false, true);
        announce('Wiedergabe stumm gestartet – „Ton einschalten“ aktivieren.');
      }
    });
  }
  if (unmuteBtn) {
    unmuteBtn.addEventListener('click', () => {
      audio.muted = false; hideNote(); updateMuteVisuals(); announce('Ton eingeschaltet');
    });
  }

  // Metadata & time sync
  audio.addEventListener('loadedmetadata', () => {
    seek.max = audio.duration || 0;
    dur.textContent = fmtTime(audio.duration);
    vol.value = String(audio.volume);
    vol.setAttribute('aria-valuetext', Math.round(audio.volume * 100) + '%');
    updateMuteVisuals();
    syncSeekBackground();
  });
  audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.currentTime)) {
      seek.value = String(audio.currentTime);
      cur.textContent = fmtTime(audio.currentTime);
      seek.setAttribute('aria-valuetext', fmtTime(audio.currentTime));
      syncSeekBackground();
    }
  });

  // Core controls
  playBtn.addEventListener('click', async () => {
    try {
      if (audio.paused) { await audio.play(); announce('Wiedergabe gestartet'); }
      else { audio.pause(); announce('Wiedergabe angehalten'); }
      hideNote(); updatePlayVisuals();
    } catch (e) { console.error(e); }
  });
  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    updateMuteVisuals();
    announce(audio.muted ? 'Stumm geschaltet' : 'Ton eingeschaltet');
  });
  function seekBy(delta) {
    const t = Math.min(Math.max(0, (audio.currentTime || 0) + delta), audio.duration || 0);
    audio.currentTime = t;
  }
  back10Btn.addEventListener('click', () => seekBy(-10));
  fwd30Btn.addEventListener('click', () => seekBy(30));

  // --- VIOLATION 3: Slider is mouse-only ---
  // Remove from tab order (also set in HTML), and suppress keyboard interaction
  seek.tabIndex = -1;
  seek.addEventListener('keydown', (e) => { e.preventDefault(); });
  // Keep pointer interactions working:
  let wasPlayingBeforeDrag = false;
  seek.addEventListener('input', () => { audio.currentTime = Number(seek.value); syncSeekBackground(); });
  seek.addEventListener('pointerdown', () => { wasPlayingBeforeDrag = !audio.paused; if (wasPlayingBeforeDrag) audio.pause(); });
  seek.addEventListener('pointerup', () => { if (wasPlayingBeforeDrag) audio.play(); });

  vol.addEventListener('input', () => {
    audio.volume = Number(vol.value);
    if (audio.volume > 0) audio.muted = false;
    vol.setAttribute('aria-valuetext', Math.round(audio.volume * 100) + '%');
    updateMuteVisuals();
  });
  rate.addEventListener('change', () => {
    audio.playbackRate = Number(rate.value);
    announce('Geschwindigkeit ' + rate.options[rate.selectedIndex].text);
  });

  audio.addEventListener('play', updatePlayVisuals);
  audio.addEventListener('pause', updatePlayVisuals);
  audio.addEventListener('volumechange', updateMuteVisuals);

  // Keyboard shortcuts remain (player-wide), but slider is explicitly mouse-only
  controls.closest('.ns-player')?.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    if (e.code === 'Space' || e.key.toLowerCase() === 'k') { e.preventDefault(); playBtn.click(); }
    else if (e.key.toLowerCase() === 'j') { seekBy(-10); }
    else if (e.key.toLowerCase() === 'l') { seekBy(30); }
    else if (e.key.toLowerCase() === 'm') { muteBtn.click(); }
  });

  // DOM ready bootstrap for autoplay
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(bootstrapAutoplay, 0);
  } else {
    window.addEventListener('DOMContentLoaded', bootstrapAutoplay, { once: true });
  }
})();
