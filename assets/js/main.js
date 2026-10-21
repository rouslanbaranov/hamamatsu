/* ============================================================
   SUMMER AVENUE — interaction layer
   Vanilla JS. No dependencies.
   ============================================================ */

(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');

  const storage = {
    get(key, fallback) {
      try {
        const value = window.localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch (error) { /* private mode */ }
    }
  };

  /* ---------- toast ---------- */

  const toastEl = $('[data-toast]');
  let toastTimer = 0;

  function toast(message) {
    if (!toastEl) return;
    window.clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2800);
  }

  /* ---------- time formatting ---------- */

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

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        area.remove();
      }
    });
  }

  /* ---------- scroll progress + active nav ---------- */

  const header = $('#site-header');
  const progressBar = $('.scroll-progress span');
  const navLinks = $$('.nav a, .mobile-menu__nav a');
  const sections = $$('main section[id]');
  let scrollQueued = false;

  function onScroll() {
    scrollQueued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progressBar) progressBar.style.width = (ratio * 100).toFixed(2) + '%';
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);

    if (header && sections.length) {
      const marker = window.scrollY + header.offsetHeight + Math.min(window.innerHeight * 0.28, 220);
      let current = '';
      for (const section of sections) {
        if (section.offsetTop <= marker) current = section.id;
      }
      navLinks.forEach((link) => {
        const matches = link.getAttribute('href') === '#' + current;
        if (matches) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }
  }

  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      scrollQueued = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!scrollQueued) {
      scrollQueued = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  onScroll();

  /* ---------- reveal on scroll ---------- */

  const revealEls = $$('[data-reveal]');
  if (revealEls.length) {
    if (reduceMotion.matches) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      let revealQueued = false;
      const revealPass = () => {
        revealQueued = false;
        const limit = window.innerHeight * 0.93;
        revealEls.forEach((el) => {
          if (el.classList.contains('is-visible')) return;
          const rect = el.getBoundingClientRect();
          if (rect.top < limit) el.classList.add('is-visible');
        });
      };
      const queueReveal = () => {
        if (!revealQueued) {
          revealQueued = true;
          window.requestAnimationFrame(revealPass);
        }
      };
      window.addEventListener('scroll', queueReveal, { passive: true });
      window.addEventListener('resize', queueReveal, { passive: true });
      window.addEventListener('load', revealPass, { once: true });
      window.setTimeout(revealPass, 120);
      revealPass();
    }
  }

  /* ---------- mobile menu ---------- */

  const menuButton = $('.menu-btn');
  const mobileMenu = $('#mobile-menu');
  let menuFocus = null;

  function isMenuOpen() {
    return !!mobileMenu && !mobileMenu.hidden;
  }

  function closeMenu(restoreFocus = true) {
    if (!mobileMenu || !menuButton || !isMenuOpen()) return;
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    const label = $('.sr-only', menuButton);
    if (label) label.textContent = 'Open menu';
    body.classList.remove('menu-open');
    if (restoreFocus && menuFocus && typeof menuFocus.focus === 'function') {
      menuFocus.focus({ preventScroll: true });
    }
    menuFocus = null;
  }

  function openMenu() {
    if (!mobileMenu || !menuButton) return;
    menuFocus = document.activeElement;
    mobileMenu.hidden = false;
    menuButton.setAttribute('aria-expanded', 'true');
    const label = $('.sr-only', menuButton);
    if (label) label.textContent = 'Close menu';
    body.classList.add('menu-open');
    const firstLink = $('a', mobileMenu);
    if (firstLink) firstLink.focus({ preventScroll: true });
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      if (isMenuOpen()) closeMenu();
      else openMenu();
    });

    $$('a', mobileMenu).forEach((link) => {
      link.addEventListener('click', () => closeMenu(false));
    });

    mobileMenu.addEventListener('click', (event) => {
      if (event.target === mobileMenu) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isMenuOpen()) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980 && isMenuOpen()) closeMenu(false);
    }, { passive: true });
  }

  /* ---------- hero tilt ---------- */

  const heroArt = $('.hero-art');
  const sleeve = $('.sleeve');
  if (heroArt && sleeve && finePointer.matches && !reduceMotion.matches) {
    const cover = $('.sleeve__cover', sleeve);
    heroArt.addEventListener('pointermove', (event) => {
      const rect = heroArt.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      sleeve.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
      sleeve.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
      if (cover) {
        cover.style.setProperty('--mx', ((x + 0.5) * 100).toFixed(1) + '%');
        cover.style.setProperty('--my', ((y + 0.5) * 100).toFixed(1) + '%');
      }
    });
    heroArt.addEventListener('pointerleave', () => {
      sleeve.style.setProperty('--ry', '0deg');
      sleeve.style.setProperty('--rx', '0deg');
      if (cover) {
        cover.style.setProperty('--mx', '30%');
        cover.style.setProperty('--my', '16%');
      }
    });
  }

  /* ---------- share ---------- */

  $$('[data-share]').forEach((button) => {
    button.addEventListener('click', async () => {
      const payload = {
        title: 'Summer Avenue — Project Hamamatsu',
        text: 'The 2026 album from Project Hamamatsu. Eleven city-pop songs for the long way home.',
        url: document.querySelector('link[rel="canonical"]').href
      };
      if (navigator.share) {
        try {
          await navigator.share(payload);
          return;
        } catch (error) {
          if (error && error.name === 'AbortError') return;
        }
      }
      try {
        await copyText(payload.url);
        toast('Link copied to clipboard.');
      } catch (error) {
        toast('Could not copy the link — use your address bar.');
      }
    });
  });

  /* ---------- audio player ---------- */

  const audio = $('#audio');
  const player = $('#player');
  const playerSeek = $('#player-seek');
  const playerVolume = $('#player-volume');
  const playerTitle = $('[data-player-title]');
  const playerSub = $('[data-player-sub]');
  const playerStatus = $('[data-player-status]');
  const currentEl = $('[data-current]');
  const totalEl = $('[data-total]');
  const muteButton = $('[data-player-mute]');
  const playButtons = $$('[data-play-album]');
  const playerToggle = $('[data-player-toggle]');
  const trackNodes = $$('.track');

  const tracks = trackNodes.map((node, index) => {
    const button = $('.track__btn', node);
    return {
      node,
      button,
      src: button ? button.dataset.src : '',
      duration: Number(button ? button.dataset.duration : 0) || 0,
      ja: ($('.track__ja', node) || {}).textContent ? $('.track__ja', node).textContent.trim() : '',
      en: ($('.track__en', node) || {}).textContent ? $('.track__en', node).textContent.trim() : '',
      number: index + 1
    };
  });

  // Keep the visible track titles as the accessible name; this hidden
  // prefix adds the action without overriding them.
  tracks.forEach((track) => {
    if (!track.button) return;
    const action = document.createElement('span');
    action.className = 'sr-only';
    action.setAttribute('data-track-action', '');
    action.textContent = 'Play track';
    track.button.prepend(action);
    track.button.removeAttribute('aria-label');
  });

  const state = {
    index: -1,
    playing: false,
    visible: false,
    seekDragging: false,
    loading: false
  };

  let film = null;
  let playToken = 0;

  if (audio && player && tracks.length) {
    const savedVolume = Number(storage.get('sa-volume', '0.85'));
    const initialVolume = Number.isFinite(savedVolume) ? Math.min(1, Math.max(0, savedVolume)) : 0.85;
    audio.volume = initialVolume;
    audio.muted = false;
    audio.preload = 'none';
    if (playerSeek) playerSeek.disabled = true;

    function syncVolumeUI() {
      if (!playerVolume) return;
      const muted = audio.muted || audio.volume === 0;
      player.classList.toggle('is-muted', muted);
      const volume = audio.muted ? 0 : audio.volume;
      playerVolume.value = String(volume);
      playerVolume.style.setProperty('--v', (volume * 100).toFixed(1) + '%');
      if (muteButton) muteButton.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    }

    function updateMediaSession() {
      if (!('mediaSession' in navigator) || typeof window.MediaMetadata === 'undefined') return;
      const track = tracks[state.index];
      if (!track) return;
      try {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: track.ja,
          artist: 'Project Hamamatsu',
          album: 'Summer Avenue',
          artwork: [
            { src: '/hamamatsu/assets/img/cover-summer-avenue-200.jpg', sizes: '200x200', type: 'image/jpeg' },
            { src: '/hamamatsu/assets/img/cover-summer-avenue-800.jpg', sizes: '800x800', type: 'image/jpeg' },
            { src: '/hamamatsu/assets/img/cover-summer-avenue-1254.jpg', sizes: '1254x1254', type: 'image/jpeg' }
          ]
        });
      } catch (error) {
        /* Media Session is an enhancement */
      }
    }

    function setPlaying(playing) {
      if (state.playing === playing) {
        // Still refresh derived labels below.
      }
      state.playing = playing;
      body.classList.toggle('is-playing', playing);
      player.classList.toggle('is-playing', playing);

      trackNodes.forEach((node) => {
        node.classList.toggle('is-playing', node.classList.contains('is-active') && playing);
      });

      playButtons.forEach((button) => {
        const label = $('[data-play-label]', button);
        const defaultLabel = button.dataset.labelPlay || 'Play';
        const nextLabel = playing ? defaultLabel.replace(/^Play/i, 'Pause') : defaultLabel;
        if (label) label.textContent = nextLabel;
        button.setAttribute('aria-label', nextLabel);
        button.setAttribute('aria-pressed', playing ? 'true' : 'false');
      });

      if (playerToggle) playerToggle.setAttribute('aria-label', playing ? 'Pause' : 'Play');

      const track = tracks[state.index];
      document.title = playing && track ? '▶ ' + track.en + ' — Project Hamamatsu' : 'Summer Avenue — Project Hamamatsu';

      if ('mediaSession' in navigator) {
        try { navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'; } catch (error) { /* ignore */ }
      }
    }

    function setActive(index) {
      state.index = index;
      const track = tracks[index];

      trackNodes.forEach((node, i) => {
        const isActive = i === index;
        node.classList.toggle('is-active', isActive);
        node.classList.toggle('is-playing', isActive && state.playing);
        const button = $('.track__btn', node);
        if (button) {
          button.setAttribute('aria-pressed', isActive && state.playing ? 'true' : 'false');
          const action = $('[data-track-action]', button);
          if (action) action.textContent = isActive && state.playing ? 'Pause track' : 'Play track';
        }
      });

      if (!track) return;
      if (playerTitle) playerTitle.textContent = track.ja;
      if (playerSub) playerSub.textContent = 'Project Hamamatsu · ' + track.en;
      if (playerStatus) playerStatus.textContent = 'Now playing: ' + track.ja + ' — ' + track.en;
      if (totalEl) totalEl.textContent = formatDuration(track.duration);
      if (playerSeek) playerSeek.setAttribute('aria-valuetext', '0:00 of ' + formatDuration(track.duration));
      updateMediaSession();
    }

    function revealPlayer() {
      if (state.visible) return;
      state.visible = true;
      player.classList.add('is-visible');
      player.removeAttribute('aria-hidden');
      if ('inert' in player) player.inert = false;
      body.classList.add('has-player');
    }

    function resetProgressUI() {
      if (currentEl) currentEl.textContent = '0:00';
      if (playerSeek) {
        playerSeek.value = '0';
        playerSeek.style.setProperty('--p', '0%');
      }
      if (state.index >= 0 && tracks[state.index]) {
        tracks[state.index].node.style.setProperty('--p', '0');
      }
    }

    function playTrack(index) {
      if (!tracks[index]) return;
      if (film) film.pause();
      const token = ++playToken;
      const track = tracks[index];

      state.loading = true;
      revealPlayer();
      if (playerSeek) playerSeek.disabled = false;
      if (player) player.classList.add('is-loading');
      resetProgressUI();

      setActive(index);

      audio.src = track.src;
      audio.load();

      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch((error) => {
          if (token !== playToken) return;
          if (error && error.name === 'AbortError') return;
          state.loading = false;
          if (player) player.classList.remove('is-loading');
          setPlaying(false);
          toast('Playback could not start. Tap play to try again.');
        });
      }
    }

    function togglePlayback() {
      if (state.playing) {
        audio.pause();
        return;
      }
      if (state.index >= 0 && audio.src && !audio.ended) {
        if (film) film.pause();
        revealPlayer();
        audio.play().catch(() => {
          toast('Playback could not start. Tap play to try again.');
        });
        return;
      }
      playTrack(0);
    }

    function nextTrack() {
      if (state.index < 0) {
        playTrack(0);
        return;
      }
      playTrack((state.index + 1) % tracks.length);
    }

    function previousTrack() {
      if (state.index < 0) {
        playTrack(0);
        return;
      }
      if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
      }
      playTrack((state.index - 1 + tracks.length) % tracks.length);
    }

    function updateTime() {
      const track = tracks[state.index];
      if (!track) return;
      const duration = (state.loading ? track.duration : (Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : track.duration));
      const time = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;

      if (currentEl) currentEl.textContent = formatTime(time);
      if (totalEl) totalEl.textContent = formatDuration(duration);

      if (!state.seekDragging) {
        const ratio = duration > 0 ? Math.min(1, Math.max(0, time / duration)) : 0;
        if (playerSeek) {
          playerSeek.value = String(Math.round(ratio * 1000));
          playerSeek.style.setProperty('--p', (ratio * 100).toFixed(2) + '%');
          playerSeek.setAttribute('aria-valuetext', formatTime(time) + ' of ' + formatDuration(duration));
        }
        track.node.style.setProperty('--p', ratio.toFixed(4));
      }

      if ('mediaSession' in navigator && typeof navigator.mediaSession.setPositionState === 'function' && duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration,
            playbackRate: audio.playbackRate || 1,
            position: Math.min(time, duration)
          });
        } catch (error) {
          /* Safari can reject while metadata settles */
        }
      }
    }

    /* audio events */

    audio.addEventListener('play', () => {
      revealPlayer();
      setPlaying(true);
    });

    audio.addEventListener('playing', () => {
      state.loading = false;
      if (player) player.classList.remove('is-loading');
      revealPlayer();
      setPlaying(true);
      updateTime();
    });

    audio.addEventListener('pause', () => {
      if (audio.ended || !audio.paused) return;
      setPlaying(false);
    });

    audio.addEventListener('waiting', () => {
      state.loading = true;
      if (player) player.classList.add('is-loading');
    });

    audio.addEventListener('canplay', () => {
      state.loading = false;
      if (player) player.classList.remove('is-loading');
    });

    audio.addEventListener('loadedmetadata', () => {
      updateTime();
    });

    audio.addEventListener('timeupdate', updateTime);

    audio.addEventListener('ended', () => {
      if (state.index < tracks.length - 1) {
        playTrack(state.index + 1);
        return;
      }
      setPlaying(false);
      state.loading = false;
      if (player) player.classList.remove('is-loading');
      if (currentEl) currentEl.textContent = formatDuration(tracks[state.index].duration);
      toast('End of the avenue.');
    });

    audio.addEventListener('error', () => {
      state.loading = false;
      if (player) player.classList.remove('is-loading');
      setPlaying(false);
      toast('Could not load this track. Please try again.');
    });

    audio.addEventListener('volumechange', syncVolumeUI);

    /* controls */

    if (playerToggle) playerToggle.addEventListener('click', togglePlayback);
    const prevButton = $('[data-player-prev]');
    const nextButton = $('[data-player-next]');
    if (prevButton) prevButton.addEventListener('click', previousTrack);
    if (nextButton) nextButton.addEventListener('click', nextTrack);

    playButtons.forEach((button) => button.addEventListener('click', togglePlayback));

    trackNodes.forEach((node, index) => {
      const button = $('.track__btn', node);
      if (!button) return;
      button.addEventListener('click', () => {
        if (index === state.index) {
          if (audio.paused) {
            if (film) film.pause();
            revealPlayer();
            audio.play().catch(() => toast('Playback could not start. Tap play to try again.'));
          } else {
            audio.pause();
          }
          return;
        }
        playTrack(index);
      });
    });

    if (playerSeek) {
      playerSeek.addEventListener('input', () => {
        state.seekDragging = true;
        const track = tracks[state.index];
        if (!track) return;
        const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : track.duration;
        const ratio = Number(playerSeek.value) / 1000;
        playerSeek.style.setProperty('--p', (ratio * 100).toFixed(2) + '%');
        if (currentEl) currentEl.textContent = formatTime(ratio * duration);
        playerSeek.setAttribute('aria-valuetext', formatTime(ratio * duration) + ' of ' + formatDuration(duration));
      });

      playerSeek.addEventListener('change', () => {
        const track = tracks[state.index];
        if (!track) return;
        const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : track.duration;
        const ratio = Number(playerSeek.value) / 1000;
        if (duration > 0) {
          try { audio.currentTime = ratio * duration; } catch (error) { /* ignore */ }
        }
        state.seekDragging = false;
        updateTime();
      });
    }

    if (playerVolume) {
      playerVolume.addEventListener('input', () => {
        const value = Number(playerVolume.value);
        audio.muted = false;
        audio.volume = value;
        if (value > 0) storage.set('sa-volume', String(value));
        syncVolumeUI();
      });
    }

    if (muteButton) {
      muteButton.addEventListener('click', () => {
        if (audio.muted || audio.volume === 0) {
          audio.muted = false;
          if (audio.volume === 0) {
            const restored = Number(storage.get('sa-volume', '0.85'));
            audio.volume = Number.isFinite(restored) && restored > 0 ? Math.min(1, restored) : 0.85;
          }
        } else {
          storage.set('sa-volume', String(audio.volume));
          audio.muted = true;
        }
        syncVolumeUI();
      });
    }

    /* media session actions */

    if ('mediaSession' in navigator) {
      const handlers = {
        play: () => audio.play().catch(() => {}),
        pause: () => audio.pause(),
        previoustrack: previousTrack,
        nexttrack: nextTrack,
        seekbackward: (details) => {
          const offset = (details && details.seekOffset) || 10;
          audio.currentTime = Math.max(0, audio.currentTime - offset);
        },
        seekforward: (details) => {
          const offset = (details && details.seekOffset) || 10;
          audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + offset);
        },
        seekto: (details) => {
          if (details && typeof details.seekTime === 'number') audio.currentTime = details.seekTime;
        }
      };
      Object.entries(handlers).forEach(([action, handler]) => {
        try { navigator.mediaSession.setActionHandler(action, handler); } catch (error) { /* unsupported */ }
      });
    }

    syncVolumeUI();
    setPlaying(false);
    updateTime();
  }

  /* ---------- film ---------- */

  const filmEl = $('[data-film]');
  if (filmEl) {
    const video = $('video', filmEl);
    const overlay = $('[data-film-play]', filmEl);
    const controls = $('[data-film-controls]', filmEl);
    const toggleButton = $('[data-film-toggle]', filmEl);
    const muteButton = $('[data-film-mute]', filmEl);
    const seek = $('.film-player__seek', filmEl);
    const timeLabel = $('[data-film-time]', filmEl);
    const caption = $('.film-player__caption', overlay);

    if (video && overlay && controls && seek && timeLabel) {
      video.muted = false;
      let dragging = false;

      const getDuration = () => (Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 30.13);

      function syncFilmControls() {
        const duration = getDuration();
        const time = Number.isFinite(video.currentTime) ? video.currentTime : 0;
        timeLabel.textContent = formatTime(time) + ' / ' + formatTime(duration);
        if (!dragging) {
          const ratio = duration > 0 ? Math.min(1, Math.max(0, time / duration)) : 0;
          seek.value = String(Math.round(ratio * 1000));
          seek.style.setProperty('--p', (ratio * 100).toFixed(2) + '%');
          seek.setAttribute('aria-valuetext', formatTime(time) + ' of ' + formatTime(duration));
        }
      }

      function showOverlay(reset) {
        overlay.hidden = false;
        controls.hidden = true;
        filmEl.classList.remove('is-playing');
        video.pause();
        if (caption) {
          caption.innerHTML = 'PLAY THE FILM<br><small>00:30 · SOUND ON</small>';
        }
        if (reset) {
          video.currentTime = 0;
          filmEl.classList.add('is-poster');
          syncFilmControls();
        }
      }

      function playFilm() {
        if (audio && !audio.paused) audio.pause();
        filmEl.classList.remove('is-poster');
        if (video.ended || video.currentTime >= getDuration() - 0.1) video.currentTime = 0;
        video.muted = false;
        muteButton.setAttribute('aria-label', 'Mute film');
        filmEl.classList.remove('is-muted');
        overlay.hidden = true;
        controls.hidden = false;
        video.play().then(() => {
          filmEl.classList.add('is-playing');
        }).catch(() => {
          showOverlay(false);
          toast('The film could not start. Please try again.');
        });
      }

      overlay.addEventListener('click', playFilm);

      video.addEventListener('click', () => {
        if (video.paused) {
          if (overlay.hidden) playFilm();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', () => {
        filmEl.classList.add('is-playing');
        if (toggleButton) toggleButton.setAttribute('aria-label', 'Pause film');
      });

      video.addEventListener('pause', () => {
        filmEl.classList.remove('is-playing');
        if (toggleButton) toggleButton.setAttribute('aria-label', 'Play film');
        syncFilmControls();
      });

      video.addEventListener('timeupdate', syncFilmControls);
      video.addEventListener('loadedmetadata', syncFilmControls);

      video.addEventListener('ended', () => {
        filmEl.classList.remove('is-playing');
        showOverlay(true);
      });

      if (toggleButton) {
        toggleButton.addEventListener('click', () => {
          if (video.paused) playFilm();
          else video.pause();
        });
      }

      if (muteButton) {
        muteButton.addEventListener('click', () => {
          video.muted = !video.muted;
          filmEl.classList.toggle('is-muted', video.muted);
          muteButton.setAttribute('aria-label', video.muted ? 'Unmute film' : 'Mute film');
        });
      }

      seek.addEventListener('input', () => {
        dragging = true;
        const duration = getDuration();
        const ratio = Number(seek.value) / 1000;
        seek.style.setProperty('--p', (ratio * 100).toFixed(2) + '%');
        timeLabel.textContent = formatTime(ratio * duration) + ' / ' + formatTime(duration);
        seek.setAttribute('aria-valuetext', formatTime(ratio * duration) + ' of ' + formatTime(duration));
      });

      seek.addEventListener('change', () => {
        const duration = getDuration();
        const ratio = Number(seek.value) / 1000;
        if (duration > 0) video.currentTime = ratio * duration;
        dragging = false;
        syncFilmControls();
      });

      if (audio) {
        audio.addEventListener('play', () => {
          if (!video.paused) video.pause();
        });
      }

      film = {
        pause() {
          if (!video.paused) video.pause();
        }
      };

      syncFilmControls();
    }
  }

  window.__summerAvenueReady = true;
})();
