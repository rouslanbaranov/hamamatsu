/* Background film for the tracklist: five clips, sliding vertically into
   the next clip. All clips start loading in the background, one after the
   other, as soon as the page starts. Every clip has a dot from the start;
   the loading dot shows a spinner, and only fully loaded clips can be
   selected in the carousel. */
(() => {
  const section = document.querySelector('.tracks');
  const stage = section?.querySelector('.tracks__stage');
  const wrapper = section?.querySelector('.tracks__video');
  const videos = [...(wrapper?.querySelectorAll('.tracks__video-el') || [])];
  if (!section || !stage || !wrapper || videos.length < 2) return;

  const progressFill = wrapper.querySelector('[data-video-progress]');
  const ui = section.querySelector('[data-video-ui]');
  const dots = section.querySelector('[data-video-dots]');
  const prevButton = section.querySelector('[data-video-prev]');
  const nextButton = section.querySelector('[data-video-next]');

  const sources = [
    '/hamamatsu/assets/video/tracklist-katya-tokyo-1080-left-trimmed.mp4',
    '/hamamatsu/assets/video/tracklist-polina-tower-1080.mp4',
    '/hamamatsu/assets/video/tracklist-alex-boss-1080.mp4',
    '/hamamatsu/assets/video/tracklist-elena-icecream-1080.mp4',
    '/hamamatsu/assets/video/tracklist-midnight-tokyo-riders-1080.mp4'
  ];
  const i18n = window.SummerAvenueI18n;
  const t = (key, options) => (i18n ? i18n.t(key, options) : key);
  const SLIDE_MS = 620;

  let ready = false;
  let requested = false;
  let active = false;
  let current = 0;
  let transitioning = false;
  let slideTimer = 0;
  let uiReadyTimer = 0;
  const objectUrls = [];
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const FLIP_EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
  let flipAnimations = [];
  let flipToken = 0;
  const rowQuery = window.matchMedia('(max-width: 1440px)');
  let videoRow = null;
  let restoreTimer = 0;
  const dotButtons = [];
  const loaded = videos.map(() => false);
  const loading = videos.map(() => false);
  let nextToLoad = 0;

  videos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = false;
  });

  if (dots) {
    videos.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'tracks__video-dot is-pending';
      dot.disabled = true;
      dot.addEventListener('click', () => {
        if (!loaded[index]) return;
        goTo(index, index > current ? 1 : -1);
      });
      dots.append(dot);
      dotButtons.push(dot);
    });
  }

  updateDotLabels();
  document.addEventListener('i18n:changed', updateDotLabels);

  const isPlaying = () => document.body.classList.contains('is-playing');
  const shouldActivate = () =>
    ready && isPlaying() && !document.hidden && !document.body.classList.contains('is-video-hidden');

  function clearTimers() {
    window.clearTimeout(slideTimer);
    slideTimer = 0;
    transitioning = false;
  }

  function syncVideoProgress() {
    if (!progressFill) return;
    const video = videos[current];
    if (!video) return;
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    const ratio = duration > 0 ? Math.min(1, Math.max(0, video.currentTime / duration)) : 0;
    progressFill.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
  }

  function showVideo(index) {
    current = index;
    videos.forEach((video, i) => {
      video.classList.toggle('is-current', i === index);
    });
    updateDotLabels();
    syncVideoProgress();
  }

  function playCurrent() {
    const video = videos[current];
    if (!video) return;
    if (Number.isFinite(video.duration) && video.currentTime >= video.duration - 0.05) {
      video.currentTime = 0;
      syncVideoProgress();
    }
    video.play().catch(() => {});
  }

  function goTo(index, direction) {
    if (!active || index < 0 || index >= videos.length) return;
    if (!loaded[index] || index === current) return;
    const dir = typeof direction === 'number' ? direction : index > current ? 1 : -1;
    slideTo(index, dir);
  }

  function stepIndex(from, direction) {
    for (let step = 1; step <= videos.length; step += 1) {
      const index = (from + direction * step + videos.length) % videos.length;
      if (loaded[index]) return index;
    }
    return from;
  }

  function firstLoadedIndex() {
    return videos.findIndex((_, index) => loaded[index]);
  }

  function updateDotLabels() {
    const total = videos.length;
    dotButtons.forEach((dot, index) => {
      dot.setAttribute('aria-label', t('tracks.showClip', { index: index + 1, total }));
      if (index === current && loaded[index]) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function setDotState(index) {
    const dot = dotButtons[index];
    if (!dot) return;
    const isLoading = loading[index];
    const isLoaded = loaded[index];
    dot.classList.toggle('is-loading', isLoading);
    dot.classList.toggle('is-pending', !isLoading && !isLoaded);
    dot.disabled = !isLoaded;
    if (isLoading) dot.setAttribute('aria-busy', 'true');
    else dot.removeAttribute('aria-busy');
    if (!isLoaded) dot.removeAttribute('aria-current');
  }

  if (prevButton) prevButton.addEventListener('click', () => goTo(stepIndex(current, -1), -1));
  if (nextButton) nextButton.addEventListener('click', () => goTo(stepIndex(current, 1), 1));
  if (ui) {
    ui.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(stepIndex(current, -1), -1);
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(stepIndex(current, 1), 1);
      }
    });
  }

  function layoutVideos(index, animate) {
    videos.forEach((video, i) => {
      video.style.transition = animate ? '' : 'none';
      video.style.transform = i === index ? 'translateY(0%)' : 'translateY(100%)';
      video.style.opacity = i === index ? '1' : '0';
    });
    if (!animate) {
      void wrapper.offsetHeight;
      videos.forEach((video) => {
        video.style.transition = '';
      });
    }
  }

  function resetPlaylist() {
    clearTimers();
    cancelFlip();
    videos.forEach((video) => {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {}
    });
    const start = firstLoadedIndex();
    if (start < 0) return;
    showVideo(start);
    layoutVideos(start, false);
  }

  function startPlaylist() {
    clearTimers();
    videos.forEach((video) => {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {}
    });
    const start = firstLoadedIndex();
    if (start < 0) return;
    showVideo(start);
    layoutVideos(start, false);
    playCurrent();
  }

  function slideTo(index, direction) {
    if (!active || transitioning) return;
    if (index === current || !loaded[index]) return;

    const dir = direction < 0 ? -1 : 1;
    const outgoing = videos[current];
    const incoming = videos[index];

    transitioning = true;
    window.clearTimeout(slideTimer);

    incoming.pause();
    try {
      incoming.currentTime = 0;
    } catch {}

    // Park the incoming clip on the edge it should enter from, without animating.
    incoming.style.transition = 'none';
    incoming.style.transform = 'translateY(' + (dir * 100) + '%)';
    incoming.style.opacity = '1';
    outgoing.style.transition = '';
    outgoing.style.opacity = '1';
    void incoming.offsetHeight;
    incoming.style.transition = '';

    showVideo(index);

    // Both clips travel in the same vertical direction.
    outgoing.style.transform = 'translateY(' + (-dir * 100) + '%)';
    incoming.style.transform = 'translateY(0%)';
    incoming.play().catch(() => {});

    slideTimer = window.setTimeout(() => {
      slideTimer = 0;
      transitioning = false;
      outgoing.pause();
      outgoing.style.transition = 'none';
      outgoing.style.opacity = '0';
      outgoing.style.transform = 'translateY(' + (dir * 100) + '%)';
      void outgoing.offsetHeight;
      outgoing.style.transition = '';
    }, SLIDE_MS);
  }

  videos.forEach((video, index) => {
    video.addEventListener('ended', () => {
      if (!active || index !== current || transitioning) return;
      const next = stepIndex(current, 1);
      if (next === current) {
        // Only one clip has loaded so far: keep the film moving by replaying it.
        video.currentTime = 0;
        syncVideoProgress();
        video.play().catch(() => {});
        return;
      }
      slideTo(next, 1);
    });

    const syncThisVideoProgress = () => {
      if (index === current) syncVideoProgress();
    };
    video.addEventListener('timeupdate', syncThisVideoProgress);
    video.addEventListener('loadedmetadata', syncThisVideoProgress);
    video.addEventListener('durationchange', syncThisVideoProgress);
    video.addEventListener('seeked', syncThisVideoProgress);
  });

  function activeTrack() {
    return section.querySelector('.track.is-active');
  }

  function cancelFlip() {
    flipAnimations.forEach((animation) => animation.cancel());
    flipAnimations = [];
    if (videoRow) videoRow.classList.remove('is-dragging');
  }

  function animateRowMove(row, beforeRow, tracks, beforeTracks) {
    if (typeof row.animate !== 'function') return;

    const afterRow = row.getBoundingClientRect();
    const rowDelta = beforeRow.top - afterRow.top;
    if (Math.abs(rowDelta) < 1) return;

    const duration = Math.min(560, Math.max(380, Math.abs(rowDelta) * 0.55));
    const options = { duration, easing: FLIP_EASE };
    const token = ++flipToken;
    const animations = [];

    row.classList.add('is-dragging');
    animations.push(
      row.animate(
        [{ transform: 'translateY(' + rowDelta + 'px)' }, { transform: 'translateY(0)' }],
        options
      )
    );

    tracks.forEach((item, index) => {
      const before = beforeTracks[index];
      if (!before) return;
      const after = item.getBoundingClientRect();
      const delta = before.top - after.top;
      if (Math.abs(delta) < 1) return;
      animations.push(
        item.animate(
          [{ transform: 'translateY(' + delta + 'px)' }, { transform: 'translateY(0)' }],
          options
        )
      );
    });

    flipAnimations = animations;
    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (token !== flipToken) return;
      flipAnimations = [];
      row.classList.remove('is-dragging');
    });
  }

  function restoreVideo() {
    window.clearTimeout(restoreTimer);
    restoreTimer = 0;
    cancelFlip();
    if (!videoRow) return;
    const row = videoRow;
    videoRow = null;
    const list = stage.querySelector('.tracks__list');
    if (wrapper.parentElement === row) {
      stage.insertBefore(wrapper, list);
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
    if (!active || !rowQuery.matches) {
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
      videoRow.setAttribute('role', 'none');
    }
    const row = videoRow;
    let moved = false;
    if (wrapper.parentElement !== row) {
      row.append(wrapper);
      moved = true;
    }

    const trackList = track.parentElement;
    if (row.parentElement !== trackList || row.nextElementSibling !== track) {
      const canAnimate =
        row.isConnected && !reduceMotionQuery.matches && typeof row.animate === 'function';
      let beforeRow = null;
      let tracks = null;
      let beforeTracks = null;

      if (canAnimate) {
        tracks = [...trackList.querySelectorAll('.track')];
        beforeRow = row.getBoundingClientRect();
        beforeTracks = tracks.map((item) => item.getBoundingClientRect());
      }

      cancelFlip();
      trackList.insertBefore(row, track);
      moved = true;

      if (canAnimate && beforeRow && tracks && beforeTracks) {
        animateRowMove(row, beforeRow, tracks, beforeTracks);
      }
    }

    if (moved) {
      section.dispatchEvent(new CustomEvent('tracks:video-positioned', { bubbles: true }));
      if (active) playCurrent();
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
    window.clearTimeout(uiReadyTimer);
    uiReadyTimer = 0;
    section.classList.remove('is-video-ui-ready');
    if (next) {
      // Place the empty row first, then start the height/fade transition.
      syncPosition();
      void wrapper.offsetHeight;
      section.classList.add('is-video-active');
      startPlaylist();
      uiReadyTimer = window.setTimeout(() => {
        uiReadyTimer = 0;
        if (active) section.classList.add('is-video-ui-ready');
      }, reduceMotionQuery.matches ? 0 : 820);
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

  function loadNext() {
    if (nextToLoad >= videos.length) return;
    const index = nextToLoad;
    nextToLoad += 1;
    loading[index] = true;
    setDotState(index);
    loadVideo(videos[index], sources[index]).then((ok) => {
      loading[index] = false;
      if (ok) {
        loaded[index] = true;
        setDotState(index);
        if (!ready) {
          ready = true;
          showVideo(index);
          layoutVideos(index, false);
          sync();
        }
      } else {
        setDotState(index);
      }
      loadNext();
    });
  }

  function startLoad() {
    if (requested) return;
    requested = true;
    loadNext();
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

  const handleRowChange = () => {
    if (active) syncPosition();
    else restoreVideo();
  };
  if (typeof rowQuery.addEventListener === 'function') {
    rowQuery.addEventListener('change', handleRowChange);
  } else if (typeof rowQuery.addListener === 'function') {
    rowQuery.addListener(handleRowChange);
  }

  startLoad();
})();
