/* Background film for the tracklist: two clips, fading through black
   into the next clip. */
(() => {
  const section = document.querySelector('.tracks');
  const stage = section?.querySelector('.tracks__stage');
  const wrapper = section?.querySelector('.tracks__video');
  const videos = [...(wrapper?.querySelectorAll('.tracks__video-el') || [])];
  if (!section || !stage || !wrapper || videos.length < 2) return;

  const sources = [
    '/hamamatsu/assets/video/tracklist-katya-tokyo-1080-left-trimmed.mp4',
    '/hamamatsu/assets/video/tracklist-polina-tower-1080.mp4'
  ];
  const FADE_MS = 700;

  let ready = false;
  let requested = false;
  let active = false;
  let current = 0;
  let phase = 'idle';
  let fadeTimer = 0;
  let fadeInTimer = 0;
  let waitTimer = 0;
  const objectUrls = [];
  const phoneQuery = window.matchMedia('(max-width: 699px) and (orientation: portrait)');
  let videoRow = null;
  let restoreTimer = 0;

  videos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = false;
  });

  const isPlaying = () => document.body.classList.contains('is-playing');
  const shouldActivate = () => ready && isPlaying() && !document.hidden;

  function clearTimers() {
    window.clearTimeout(fadeTimer);
    window.clearTimeout(fadeInTimer);
    fadeTimer = 0;
    fadeInTimer = 0;
  }

  function showVideo(index) {
    current = index;
    videos.forEach((video, i) => {
      video.classList.toggle('is-current', i === index);
    });
  }

  function playCurrent() {
    const video = videos[current];
    if (!video) return;
    if (Number.isFinite(video.duration) && video.currentTime >= video.duration - 0.05) {
      video.currentTime = 0;
    }
    video.play().catch(() => {});
  }

  function resetPlaylist() {
    clearTimers();
    phase = 'idle';
    wrapper.classList.remove('is-black');
    videos.forEach((video) => {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {}
    });
    showVideo(0);
  }

  function startPlaylist() {
    clearTimers();
    wrapper.classList.remove('is-black');
    videos.forEach((video) => {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {}
    });
    showVideo(0);
    phase = 'playing';
    playCurrent();
  }

  function beginFade() {
    if (!active || phase !== 'playing') return;
    phase = 'fade';
    wrapper.classList.add('is-black');
    fadeTimer = window.setTimeout(showNext, FADE_MS);
  }

  function showNext() {
    if (!active) return;
    const next = (current + 1) % videos.length;
    const oldVideo = videos[current];
    const nextVideo = videos[next];

    oldVideo.pause();
    nextVideo.pause();
    try {
      nextVideo.currentTime = 0;
    } catch {}
    showVideo(next);
    phase = 'fadeIn';

    const start = () => {
      nextVideo.play().catch(() => {});
      fadeInTimer = window.setTimeout(() => {
        if (!active) return;
        wrapper.classList.remove('is-black');
        phase = 'playing';
      }, 100);
    };

    if (nextVideo.readyState >= 2) start();
    else nextVideo.addEventListener('canplay', start, { once: true });
  }

  videos.forEach((video, index) => {
    video.addEventListener('ended', () => {
      if (!active || index !== current || phase !== 'playing') return;
      beginFade();
    });
  });

  function activeTrack() {
    return section.querySelector('.track.is-active');
  }

  function restoreVideo() {
    window.clearTimeout(restoreTimer);
    restoreTimer = 0;
    if (!videoRow) return;
    const row = videoRow;
    videoRow = null;
    if (wrapper.parentElement === row) {
      stage.insertBefore(wrapper, stage.querySelector('.tracks__list'));
    }
    row.remove();
  }

  function scheduleRestore() {
    if (!videoRow) return;
    window.clearTimeout(restoreTimer);
    restoreTimer = window.setTimeout(() => {
      restoreTimer = 0;
      restoreVideo();
    }, 700);
  }

  function placeVideo() {
    if (!active || !phoneQuery.matches) {
      restoreVideo();
      return;
    }
    const track = activeTrack();
    if (!track) {
      restoreVideo();
      return;
    }
    if (!videoRow) {
      videoRow = document.createElement('li');
      videoRow.className = 'tracks__video-row';
      videoRow.setAttribute('aria-hidden', 'true');
    }
    const row = videoRow;
    let moved = false;
    if (wrapper.parentElement !== row) {
      row.appendChild(wrapper);
      moved = true;
    }
    if (row.parentElement !== track.parentElement || row.nextElementSibling !== track) {
      track.parentElement.insertBefore(row, track);
      moved = true;
    }
    if (moved) {
      section.dispatchEvent(new CustomEvent('tracks:video-positioned', { bubbles: true }));
      if (phase === 'playing') playCurrent();
    }
  }

  function syncPosition() {
    if (active) {
      window.clearTimeout(restoreTimer);
      restoreTimer = 0;
      placeVideo();
    } else if (videoRow) {
      scheduleRestore();
    }
  }

  function sync() {
    const next = shouldActivate();
    if (next === active) return;
    active = next;
    if (next) {
      // Place the empty row first, then start the height/fade transition.
      syncPosition();
      void wrapper.offsetHeight;
      section.classList.add('is-video-active');
      startPlaylist();
    } else {
      section.classList.remove('is-video-active');
      resetPlaylist();
      syncPosition();
    }
  }

  function loadVideo(video, src) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        if (ok || video.readyState >= 2) {
          settled = true;
          resolve(video.readyState >= 2);
        } else {
          settled = true;
          resolve(false);
        }
      };
      const check = () => {
        if (video.readyState >= 2) finish(true);
      };
      const setSource = (url) => {
        video.src = url;
        video.preload = 'auto';
        video.load();
      };

      video.addEventListener('loadeddata', check);
      video.addEventListener('canplay', check);
      video.addEventListener('canplaythrough', check);
      video.addEventListener('error', () => finish(false), { once: true });

      fetch(src, { cache: 'force-cache' })
        .then((response) => {
          if (!response.ok) throw new Error('Video request failed');
          return response.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          objectUrls.push(url);
          setSource(url);
        })
        .catch(() => setSource(src));

      window.setTimeout(check, 5000);
      window.setTimeout(() => finish(false), 30000);
    });
  }

  function startLoad() {
    if (requested) return;
    requested = true;
    window.clearTimeout(waitTimer);
    Promise.all(videos.map((video, index) => loadVideo(video, sources[index]))).then((loaded) => {
      if (!loaded.every(Boolean)) return;
      ready = true;
      showVideo(0);
      sync();
    });
  }

  new MutationObserver(sync).observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
  document.addEventListener('visibilitychange', sync);

  const tracklist = section.querySelector('.tracklist');
  if (tracklist) {
    new MutationObserver(() => {
      if (active) syncPosition();
    }).observe(tracklist, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  const handlePhoneChange = () => {
    if (active) syncPosition();
    else restoreVideo();
  };
  if (typeof phoneQuery.addEventListener === 'function') {
    phoneQuery.addEventListener('change', handlePhoneChange);
  } else if (typeof phoneQuery.addListener === 'function') {
    phoneQuery.addListener(handlePhoneChange);
  }

  function whenPageAndHeroReady() {
    if (document.readyState !== 'complete') {
      window.addEventListener('load', whenPageAndHeroReady, { once: true });
      return;
    }
    if (window.__heroEntranceDone) {
      startLoad();
      return;
    }
    window.addEventListener('hero-entrance:done', startLoad, { once: true });
    waitTimer = window.setTimeout(startLoad, 6000);
  }

  whenPageAndHeroReady();
})();
