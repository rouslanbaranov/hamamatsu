/* Background film for the tracklist: loads after the page + hero entrance,
   waits for a complete download, then follows audio playback + visibility. */
(() => {
  const section = document.querySelector('.tracks');
  const stage = section?.querySelector('.tracks__stage');
  const video = section?.querySelector('.tracks__video-el');
  if (!section || !stage || !video) return;

  const src = '/hamamatsu/assets/video/tracklist-katya-tokyo.mp4';
  let ready = false;
  let requested = false;
  let inView = false;
  let active = false;
  let objectUrl = '';
  let loadTimer = 0;
  let waitTimer = 0;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.loop = true;

  const isPlaying = () => document.body.classList.contains('is-playing');
  const shouldPlay = () => ready && inView && isPlaying() && !document.hidden;

  function sync() {
    const next = shouldPlay();
    active = next;
    section.classList.toggle('is-video-active', next);
    if (next) {
      if (video.paused) video.play().catch(() => {});
    } else if (!video.paused) {
      video.pause();
    }
  }

  function markReady() {
    if (ready) return;
    ready = true;
    window.clearTimeout(loadTimer);
    sync();
  }

  function watchReady() {
    const check = () => {
      if (video.readyState >= 2) markReady();
    };
    video.addEventListener('loadeddata', check);
    video.addEventListener('canplay', check);
    video.addEventListener('canplaythrough', markReady);
    video.addEventListener('error', () => {
      window.clearTimeout(loadTimer);
      ready = false;
      sync();
    }, { once: true });
    window.clearTimeout(loadTimer);
    loadTimer = window.setTimeout(check, 5000);
    check();
  }

  function useDirectSource() {
    video.src = src;
    video.preload = 'auto';
    video.load();
    watchReady();
  }

  function startLoad() {
    if (requested) return;
    requested = true;
    window.clearTimeout(waitTimer);
    fetch(src, { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) throw new Error('Video request failed');
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
        video.preload = 'auto';
        video.load();
        watchReady();
      })
      .catch(useDirectSource);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      sync();
    }, { threshold: 0.2, rootMargin: '-6% 0px -6% 0px' });
    observer.observe(stage);
  } else {
    inView = true;
  }

  new MutationObserver(sync).observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
  document.addEventListener('visibilitychange', sync);

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
