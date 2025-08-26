
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

  // Default volume to 50% for accessible start level
  try { audio.volume = 0.2; } catch (e) {}
  if (vol) {
    vol.value = "0.2";
    vol.setAttribute('aria-valuetext', '20%');
  }

  // Sync the download link to the current source
  const sourceEl = audio.querySelector('source');
  if (sourceEl && sourceEl.src) {
    //downloadLink.href = sourceEl.src;
  }

  function fmtTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    seconds = Math.max(0, Math.floor(seconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const ms = String(m).padStart(h ? 2 : 1, '0');
    const ss = String(s).padStart(2, '0');
    return h ? `${h}:${ms}:${ss}` : `${m}:${ss}`;
  }

  function announce(text) { status.textContent = text; }

  function updatePlayVisuals() {
    const isPlaying = !audio.paused;
    playBtn.setAttribute('aria-pressed', String(isPlaying));
    playBtn.classList.toggle('is-active', isPlaying);
    playBtn.querySelector('span').textContent = isPlaying ? '' : '';
    playBtn.setAttribute('aria-label', isPlaying ? '' : '');
  }

  function updateMuteVisuals() {
    const isMuted = audio.muted || audio.volume === 0;
    muteBtn.setAttribute('aria-pressed', String(isMuted));
    muteBtn.classList.toggle('is-active', isMuted);
    muteBtn.querySelector('span').textContent = isMuted ? 'Ton an' : 'Stumm';
    muteBtn.setAttribute('aria-label', isMuted ? 'Ton einschalten' : 'Stumm schalten');
  }

  function syncSeekBackground() {
    const progress = (seek.value - seek.min) / (seek.max - seek.min) * 100;
    seek.style.setProperty('--_progress', progress + '%');
  }

  // Init when metadata is available
  audio.addEventListener('loadedmetadata', () => {
    seek.max = audio.duration || 0;
    dur.textContent = fmtTime(audio.duration);
    // keep any pre-set volume (e.g., 0.5), just refresh control
    vol.value = String(audio.volume);
    vol.setAttribute('aria-valuetext', Math.round(audio.volume * 100) + '%');
    updateMuteVisuals();
    syncSeekBackground();
  });

  // Time & seek updates
  audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.currentTime)) {
      seek.value = String(audio.currentTime);
      cur.textContent = fmtTime(audio.currentTime);
      seek.setAttribute('aria-valuetext', fmtTime(audio.currentTime));
      syncSeekBackground();
    }
  });

  // Play / pause
  playBtn.addEventListener('click', async () => {
    try {
      if (audio.paused) {
        await audio.play();
        announce('Wiedergabe gestartet');
      } else {
        audio.pause();
        announce('Wiedergabe angehalten');
      }
      updatePlayVisuals();
    } catch (e) {
      console.error(e);
    }
  });

  // Mute
  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    updateMuteVisuals();
    announce(audio.muted ? 'Stumm geschaltet' : 'Ton eingeschaltet');
  });

  // Back/forward
  function seekBy(delta) {
    const t = Math.min(Math.max(0, (audio.currentTime || 0) + delta), audio.duration || 0);
    audio.currentTime = t;
  }
  back10Btn.addEventListener('click', () => seekBy(-10));
  fwd30Btn.addEventListener('click', () => seekBy(30));

  // Seek slider interaction
  let wasPlayingBeforeDrag = false;
  seek.addEventListener('input', () => {
    audio.currentTime = Number(seek.value);
    syncSeekBackground();
  });
  seek.addEventListener('change', () => { /* already handled by input */ });
  seek.addEventListener('pointerdown', () => { wasPlayingBeforeDrag = !audio.paused; if (wasPlayingBeforeDrag) audio.pause(); });
  seek.addEventListener('pointerup', () => { if (wasPlayingBeforeDrag) audio.play(); });

  // Volume
  vol.addEventListener('input', () => {
    audio.volume = Number(vol.value);
    if (audio.volume > 0) audio.muted = false;
    vol.setAttribute('aria-valuetext', Math.round(audio.volume * 100) + '%');
    updateMuteVisuals();
  });

  // Rate
  rate.addEventListener('change', () => {
    audio.playbackRate = Number(rate.value);
    announce('Geschwindigkeit ' + rate.options[rate.selectedIndex].text);
  });

  // Keep visuals in sync when playback state changes externally
  audio.addEventListener('play', updatePlayVisuals);
  audio.addEventListener('pause', updatePlayVisuals);
  audio.addEventListener('volumechange', updateMuteVisuals);

  // Keyboard shortcuts when the player (group) is focused
  controls.closest('.ns-player')?.addEventListener('keydown', (e) => {
    // Don't steal keystrokes from inputs/selects
    const tag = (e.target.tagName || '').toLowerCase();
    const isFormControl = tag === 'input' || tag === 'select' || tag === 'button' || tag === 'textarea';
    if (isFormControl && (tag === 'input' || tag === 'select' || tag === 'textarea')) return;

    if (e.code === 'Space' || e.key.toLowerCase() === 'k') { e.preventDefault(); playBtn.click(); }
    else if (e.key.toLowerCase() === 'j') { seekBy(-10); }
    else if (e.key.toLowerCase() === 'l') { seekBy(30); }
    else if (e.key.toLowerCase() === 'm') { muteBtn.click(); }
  });

  // Initialize UI state for SSR / fast paint
  updatePlayVisuals();
  updateMuteVisuals();
  //syncSeekBackground();
})();
