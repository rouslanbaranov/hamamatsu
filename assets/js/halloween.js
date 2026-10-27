/* ============================================================
   SUMMER AVENUE (HALLOWEEN REMIX) — single player + page layer
   One track, one night. Vanilla JS, no dependencies.
   ============================================================ */

(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const i18n = window.SummerAvenueI18n;
  const t = (key, options) => (i18n ? i18n.t(key, options) : key);
  const preferenceStore = window.store;

  const FALLBACK_DURATION = 211.96;

  function formatTime(seconds) {
    const total = Number(seconds);
    if (!Number.isFinite(total) || total < 0) return '0:00';
    const whole = Math.floor(total);
    return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
  }

  function formatDuration(seconds) {
    const total = Number(seconds);
    if (!Number.isFinite(total) || total < 0) return '0:00';
    const whole = Math.round(total);
    return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
  }

  /* ---------- toast ---------- */

  const toastEl = $('[data-toast]');
  let toastTimer = 0;

  function toast(message) {
    if (!toastEl) return;
    window.clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toastEl.classList.remove('is-visible'), 3000);
  }

  /* ---------- share the single ---------- */

  const SHARE_COVER_URL = '/hamamatsu/assets/img/cover-summer-avenue-halloween-1254.jpg';
  const SHARE_COVER_NAME = 'summer-avenue-halloween-remix-cover.jpg';
  let shareCoverFile = null;
  let shareCoverRequest = null;

  function loadShareCover() {
    if (shareCoverFile) return Promise.resolve(shareCoverFile);
    if (!shareCoverRequest) {
      shareCoverRequest = fetch(SHARE_COVER_URL, { mode: 'same-origin' })
        .then((response) => {
          if (!response.ok) throw new Error('Cover unavailable');
          return response.blob();
        })
        .then((blob) => {
          if (typeof File !== 'function') return null;
          shareCoverFile = new File([blob], SHARE_COVER_NAME, { type: blob.type || 'image/jpeg' });
          return shareCoverFile;
        })
        .catch(() => null);
    }
    return shareCoverRequest;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (error) {
        /* fall back to the legacy path below */
      }
    }

    return new Promise((resolve, reject) => {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.focus();
      area.select();
      try {
        const copied = document.execCommand('copy');
        if (copied) resolve();
        else reject(new Error('Copy command failed'));
      } catch (error) {
        reject(error);
      } finally {
        area.remove();
      }
    });
  }

  const shareButton = $('[data-share-page]');
  if (shareButton) {
    loadShareCover();
    shareButton.addEventListener('pointerenter', loadShareCover, { once: true });
    shareButton.addEventListener('focus', loadShareCover, { once: true });

    shareButton.addEventListener('click', async () => {
      const canonical = $('link[rel="canonical"]');
      const url = canonical ? canonical.href : 'https://rbaranov.ch/hamamatsu/halloween';
      const payload = {
        title: t('meta.halloween.title'),
        text: `${t('meta.halloween.description')}\n${url}`,
        url
      };
      const cover = await loadShareCover();
      let canShareCover = false;

      if (cover && typeof navigator.canShare === 'function') {
        try {
          canShareCover = navigator.canShare({ files: [cover] });
        } catch (error) {
          canShareCover = false;
        }
      }

      if (navigator.share) {
        if (canShareCover) {
          try {
            await navigator.share({ ...payload, files: [cover] });
            return;
          } catch (error) {
            if (error && error.name === 'AbortError') return;
          }

          // Some share targets reject the url field together with files;
          // the text already carries the link, so retry with the file + text.
          try {
            await navigator.share({
              title: payload.title,
              text: payload.text,
              files: [cover]
            });
            return;
          } catch (error) {
            if (error && error.name === 'AbortError') return;
          }
        }

        try {
          await navigator.share(payload);
          return;
        } catch (error) {
          if (error && error.name === 'AbortError') return;
        }
      }

      try {
        await copyText(url);
        toast(t('toasts.linkCopied'));
      } catch (error) {
        toast(t('toasts.copyFailed'));
      }
    });
  }

  /* ---------- reveal ---------- */

  const revealEls = $$('[data-reveal]');
  if (revealEls.length) {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      revealEls.forEach((el) => observer.observe(el));
    }
  }

  /* ---------- header progress ---------- */

  const header = $('#site-header');
  const progressBar = $('.scroll-progress span');
  let scrollQueued = false;

  function onScroll() {
    scrollQueued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progressBar) progressBar.style.width = (ratio * 100).toFixed(2) + '%';
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  function requestScrollUpdate() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(onScroll);
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  onScroll();

  /* ---------- single-track player ---------- */

  const audio = $('[data-hw-audio]');
  const player = $('[data-hw-player]');
  const seek = $('[data-hw-seek]');
  const volume = $('[data-hw-volume]');
  const currentEl = $('[data-hw-current]');
  const totalEl = $('[data-hw-total]');
  const muteButton = $('[data-hw-mute]');
  const statusEl = $('[data-hw-status]');
  const toggleButtons = $$('[data-hw-toggle]');

  const state = {
    hasPlayed: false,
    playing: false,
    dragging: false,
    duration: FALLBACK_DURATION,
    token: 0
  };

  function readStoredVolume() {
    let value = 0.85;
    try {
      const stored = preferenceStore && typeof preferenceStore.get === 'function'
        ? Number(preferenceStore.get('sa-volume', 0.85))
        : 0.85;
      if (Number.isFinite(stored)) value = Math.min(1, Math.max(0, stored));
    } catch (error) { /* private mode */ }
    return value;
  }

  function persistVolume(value) {
    try {
      if (preferenceStore && typeof preferenceStore.set === 'function') {
        preferenceStore.set('sa-volume', String(value));
      }
    } catch (error) { /* private mode */ }
  }

  function isMuted() {
    return !audio || audio.muted || audio.volume === 0;
  }

  function syncVolumeUI() {
    if (!audio) return;
    const muted = isMuted();
    if (player) player.classList.toggle('is-muted', muted);
    const value = audio.muted ? 0 : audio.volume;
    if (volume) {
      volume.value = String(value);
      volume.style.setProperty('--v', (value * 100).toFixed(1) + '%');
    }
    if (muteButton) {
      muteButton.setAttribute('aria-label', muted ? t('halloween.unmute') : t('halloween.mute'));
    }
  }

  function syncLabels() {
    const playLabel = state.playing ? t('halloween.pauseSingle') : t('halloween.playSingle');
    toggleButtons.forEach((button) => {
      button.setAttribute('aria-pressed', state.playing ? 'true' : 'false');
      button.setAttribute('aria-label', playLabel);
      const label = $('[data-hw-toggle-label]', button);
      if (label) label.textContent = playLabel;
    });
    if (muteButton) muteButton.setAttribute('aria-label', isMuted() ? t('halloween.unmute') : t('halloween.mute'));
    updateTitle();
  }

  function updateTitle() {
    if (!state.playing && !state.hasPlayed) return;
    const key = state.playing ? 'meta.halloween.nowPlayingTitle' : 'meta.halloween.title';
    const value = t(key);
    if (value && value !== key) document.title = value;
  }

  function setPlaying(playing) {
    if (playing) state.hasPlayed = true;
    state.playing = playing;
    body.classList.toggle('is-playing', playing);
    if (player) player.classList.toggle('is-playing', playing);
    if (statusEl) statusEl.textContent = playing ? t('halloween.nowPlaying') : '';
    syncLabels();
    if ('mediaSession' in navigator) {
      try { navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'; } catch (error) { /* ignore */ }
    }
  }

  function updateMediaSession() {
    if (!('mediaSession' in navigator) || typeof window.MediaMetadata === 'undefined') return;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: 'Summer Avenue (Halloween Remix)',
        artist: 'Project Hamamatsu',
        album: t('meta.halloween.albumTitle'),
        artwork: [
          { src: '/hamamatsu/assets/img/cover-summer-avenue-halloween-512.jpg', sizes: '512x512', type: 'image/jpeg' },
          { src: '/hamamatsu/assets/img/cover-summer-avenue-halloween-800.jpg', sizes: '800x800', type: 'image/jpeg' }
        ]
      });
    } catch (error) {
      /* Media Session is an enhancement */
    }
  }

  function updateTimeline() {
    if (!audio) return;
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : state.duration;
    const time = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    if (currentEl) currentEl.textContent = formatTime(time);
    if (totalEl) totalEl.textContent = formatDuration(duration);
    if (!state.dragging && seek) {
      const ratio = duration > 0 ? Math.min(1, Math.max(0, time / duration)) : 0;
      seek.value = String(Math.round(ratio * 1000));
      seek.style.setProperty('--p', (ratio * 100).toFixed(2) + '%');
      seek.setAttribute('aria-valuetext', t('player.timeOf', {
        time: formatTime(time),
        total: formatDuration(duration)
      }));
    }
    if ('mediaSession' in navigator && typeof navigator.mediaSession.setPositionState === 'function' && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: audio.playbackRate || 1,
          position: Math.min(time, duration)
        });
      } catch (error) { /* Safari can reject while metadata settles */ }
    }
  }

  function ensurePlayerInView() {
    if (!player) return;
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const rect = player.getBoundingClientRect();
    const fullyVisible = rect.top >= headerHeight + 8 && rect.bottom <= window.innerHeight - 8;
    if (fullyVisible) return;
    const behavior = reduceMotion.matches ? 'auto' : 'smooth';
    player.scrollIntoView({ behavior, block: 'center' });
  }

  function play(shouldReveal = false) {
    if (!audio) return;
    if (audio.ended || (Number.isFinite(audio.duration) && audio.duration > 0 && audio.currentTime >= audio.duration - 0.05)) {
      audio.currentTime = 0;
    }
    const token = ++state.token;
    if (shouldReveal) ensurePlayerInView();
    const promise = audio.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch((error) => {
        if (token !== state.token) return;
        if (error && error.name === 'AbortError') return;
        setPlaying(false);
        toast(t('toasts.playbackFailed'));
      });
    }
  }

  function pause() {
    state.token += 1;
    if (audio) audio.pause();
  }

  function toggle(shouldReveal = false) {
    if (!audio) return;
    if (state.playing) pause();
    else play(shouldReveal);
  }

  if (audio && player) {
    audio.volume = readStoredVolume();
    audio.muted = false;

    toggleButtons.forEach((button) => {
      button.addEventListener('click', () => toggle(!button.closest('.hw-player')));
    });
    if (muteButton) {
      muteButton.addEventListener('click', () => {
        audio.muted = !audio.muted;
        syncVolumeUI();
      });
    }

    if (volume) {
      volume.addEventListener('input', () => {
        audio.muted = false;
        audio.volume = Math.min(1, Math.max(0, Number(volume.value) || 0));
        syncVolumeUI();
      });
      volume.addEventListener('change', () => persistVolume(audio.volume));
    }

    if (seek) {
      seek.addEventListener('input', () => {
        state.dragging = true;
        const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : state.duration;
        const ratio = Math.min(1, Math.max(0, Number(seek.value) / 1000));
        seek.style.setProperty('--p', (ratio * 100).toFixed(2) + '%');
        if (currentEl) currentEl.textContent = formatTime(ratio * duration);
        seek.setAttribute('aria-valuetext', t('player.timeOf', {
          time: formatTime(ratio * duration),
          total: formatDuration(duration)
        }));
      });
      seek.addEventListener('change', () => {
        const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : state.duration;
        const ratio = Math.min(1, Math.max(0, Number(seek.value) / 1000));
        if (duration > 0) audio.currentTime = ratio * duration;
        state.dragging = false;
        updateTimeline();
      });
    }

    audio.addEventListener('play', () => setPlaying(true));
    audio.addEventListener('playing', () => {
      state.ready = true;
      if (player) player.classList.remove('is-loading');
      setPlaying(true);
      updateTimeline();
    });
    audio.addEventListener('pause', () => {
      if (audio.ended || !audio.paused) return;
      setPlaying(false);
    });
    audio.addEventListener('waiting', () => {
      if (player) player.classList.add('is-loading');
    });
    audio.addEventListener('canplay', () => {
      if (player) player.classList.remove('is-loading');
    });
    audio.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) state.duration = audio.duration;
      updateTimeline();
    });
    audio.addEventListener('timeupdate', updateTimeline);
    audio.addEventListener('ended', () => {
      setPlaying(false);
      if (player) player.classList.remove('is-loading');
      if (currentEl) currentEl.textContent = '0:00';
      if (seek) {
        seek.value = '0';
        seek.style.setProperty('--p', '0%');
      }
      try { audio.currentTime = 0; } catch (error) { /* ignore */ }
      toast(t('halloween.toastEnded'));
    });
    audio.addEventListener('error', () => {
      if (player) player.classList.remove('is-loading');
      setPlaying(false);
      toast(t('toasts.playbackFailed'));
    });
    audio.addEventListener('volumechange', syncVolumeUI);

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', play);
        navigator.mediaSession.setActionHandler('pause', pause);
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details && Number.isFinite(details.seekTime)) {
            audio.currentTime = Math.min(state.duration, Math.max(0, details.seekTime));
            updateTimeline();
          }
        });
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const offset = details && Number.isFinite(details.seekOffset) ? details.seekOffset : 10;
          audio.currentTime = Math.max(0, audio.currentTime - offset);
        });
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const offset = details && Number.isFinite(details.seekOffset) ? details.seekOffset : 10;
          audio.currentTime = Math.min(state.duration, audio.currentTime + offset);
        });
      } catch (error) {
        /* Some actions are not supported */
      }
    }

    syncVolumeUI();
    syncLabels();
    updateTimeline();
    updateMediaSession();

  }

  /* ---------- oscilloscope ---------- */

  const scopeCanvas = $('[data-hw-scope]');
  const scopeContext = scopeCanvas ? scopeCanvas.getContext('2d') : null;

  if (scopeCanvas && scopeContext && audio) {
    const scopeWidth = scopeCanvas.width;
    const scopeHeight = scopeCanvas.height;
    const scopeBpm = 132;
    let scopePhase = 0;
    let scopeFrame = 0;
    let scopeLast = 0;

    function drawScope(active) {
      const ctx = scopeContext;
      const w = scopeWidth;
      const h = scopeHeight;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(243, 234, 216, 0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      for (let i = 1; i < 6; i += 1) {
        const x = (w * i) / 6;
        ctx.moveTo(x, h / 2 - 3);
        ctx.lineTo(x, h / 2 + 3);
      }
      ctx.stroke();

      const trace = ctx.createLinearGradient(0, 0, w, 0);
      trace.addColorStop(0, 'rgba(255, 139, 45, 0)');
      trace.addColorStop(0.12, 'rgba(255, 139, 45, 0.8)');
      trace.addColorStop(0.5, 'rgba(255, 209, 120, 0.95)');
      trace.addColorStop(0.88, 'rgba(255, 139, 45, 0.8)');
      trace.addColorStop(1, 'rgba(255, 139, 45, 0)');

      let amplitude = 0;
      let twitch = 0;
      let shape = 0;

      if (active) {
        const beatRaw = (audio.currentTime * scopeBpm) / 60;
        const beat = beatRaw - Math.floor(beatRaw);
        const beatPulse = Math.pow(1 - beat, 2);
        const kick = Math.pow(1 - beat, 6);
        const beatIndex = Math.floor(beatRaw);
        const seed = Math.sin(beatIndex * 12.9898) * 43758.5453;
        const jitter = seed - Math.floor(seed);
        amplitude = h * (0.15 + 0.32 * beatPulse);
        twitch = kick * h * 0.06 * (jitter > 0.5 ? 1 : -1);
        shape = jitter * Math.PI * 2;
      }

      const samples = [];
      let peak = 0;
      for (let x = 0; x <= w; x += 2) {
        const envelope = Math.pow(Math.sin((Math.PI * x) / w), 0.5);
        const wave =
          0.46 * Math.sin(x * 0.031 + scopePhase + shape * 0.35) +
          0.24 * Math.sin(x * 0.011 - scopePhase * 0.7) +
          0.18 * Math.sin(x * 0.071 + scopePhase * 1.45 + shape) +
          0.12 * Math.sin(x * 0.137 - scopePhase * 2.1 + shape * 0.6);
        samples.push([x, wave, envelope]);
        peak = Math.max(peak, Math.abs(wave));
      }
      peak = peak || 1;

      const points = samples.map(([x, wave, envelope]) => [
        x,
        h / 2 - (wave / peak) * amplitude * envelope + twitch * envelope
      ]);

      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      points.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.lineTo(w, h / 2);
      ctx.closePath();
      const fill = ctx.createLinearGradient(0, 0, 0, h);
      fill.addColorStop(0, 'rgba(255, 139, 45, 0.22)');
      fill.addColorStop(1, 'rgba(255, 139, 45, 0)');
      ctx.fillStyle = fill;
      ctx.fill();

      ctx.strokeStyle = trace;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(255, 122, 66, 0.55)';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      points.forEach(([x, y], index) => {
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function scopeTick(timestamp) {
      if (!scopeLast) scopeLast = timestamp;
      const delta = Math.min(48, timestamp - scopeLast);
      scopeLast = timestamp;
      scopePhase += delta * 0.0028;
      drawScope(true);
      scopeFrame = window.requestAnimationFrame(scopeTick);
    }

    function startScope() {
      window.cancelAnimationFrame(scopeFrame);
      scopeFrame = 0;
      scopeLast = 0;
      if (reduceMotion.matches) {
        drawScope(true);
        return;
      }
      scopeFrame = window.requestAnimationFrame(scopeTick);
    }

    function stopScope() {
      window.cancelAnimationFrame(scopeFrame);
      scopeFrame = 0;
      scopeLast = 0;
      drawScope(false);
    }

    drawScope(false);
    audio.addEventListener('play', startScope);
    audio.addEventListener('pause', stopScope);
    audio.addEventListener('ended', stopScope);
    audio.addEventListener('error', stopScope);
  }

  document.addEventListener('i18n:changed', () => {
    if (audio && player) {
      updateMediaSession();
      syncVolumeUI();
      syncLabels();
    }
    updateTitle();
  });

  /* ---------- ready ---------- */

  window.__halloweenReady = true;
})();
