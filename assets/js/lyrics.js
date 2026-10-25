/* ============================================================
   SUMMER AVENUE — lyrics
   One open song at a time, deep links, a player shortcut,
   line-level highlighting, and the optional two-line lyric
   readout inside the active track row.
   ============================================================ */

(() => {
  'use strict';

  const section = document.querySelector('.lyrics');
  if (!section) return;

  const i18n = window.SummerAvenueI18n;
  const t = (key, options) => (i18n ? i18n.t(key, options) : key);

  const songs = Array.from(section.querySelectorAll('.song'));
  const indexLinks = Array.from(section.querySelectorAll('[data-lyrics-jump]'));
  const playerButton = document.querySelector('[data-lyrics-open]');
  const followButton = section.querySelector('[data-lyrics-follow]');
  const romajiToggle = section.querySelector('[data-lyrics-romaji]');
  const cyrillicToggle = section.querySelector('[data-lyrics-cyrillic]');
  const inlineToggle = document.querySelector('[data-track-lyrics-toggle]');
  const audio = document.querySelector('#audio');
  const header = document.querySelector('.site-header');
  const indexBar = section.querySelector('.lyrics__index');
  const list = section.querySelector('.lyrics__list');
  const trackRows = Array.from(document.querySelectorAll('.track'));
  const trackList = document.querySelector('.tracklist');
  const preferenceStore = window.store;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let printing = false;
  let follow = false;
  let romaji = true;
  let cyrillic = false;
  let followPauseUntil = 0;
  let currentLine = null;
  let inlineEnabled = false;

  const pad = (number) => String(number).padStart(2, '0');
  const songFor = (number) => section.querySelector('#lyrics-' + pad(number));
  const offset = () =>
    (header ? header.offsetHeight : 0) +
    (indexBar ? indexBar.offsetHeight : 0) +
    26;
  const activeTrack = () => document.querySelector('.track.is-active');

  function activeTrackIndex() {
    const active = activeTrack();
    return active ? trackRows.indexOf(active) + 1 : 0;
  }

  function indexAt(lines, time) {
    let index = -1;
    for (let i = 0; i < lines.length; i += 1) {
      const at = Number(lines[i].dataset.at);
      if (!Number.isFinite(at)) continue;
      if (at <= time + 0.06) index = i;
      else break;
    }
    return index;
  }

  function setActive(details) {
    indexLinks.forEach((link) => {
      const active = Boolean(details) && link.dataset.lyricsJump === String(Number(details.dataset.trackIndex));
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  function scrollToSong(details, smooth) {
    const top = details.getBoundingClientRect().top + window.scrollY - offset();
    window.scrollTo({
      top: Math.max(0, top),
      behavior: smooth && !reduceMotion.matches ? 'smooth' : 'auto'
    });
  }

  function focusSummary(details) {
    const summary = details.querySelector('summary');
    if (summary) summary.focus({ preventScroll: true });
  }

  function clearHighlight() {
    if (currentLine) {
      currentLine.classList.remove('is-current');
      currentLine = null;
    }
  }

  function lyricsSectionInView() {
    const box = section.getBoundingClientRect();
    return box.bottom > 0 && box.top < window.innerHeight;
  }

  function followLine(line, force) {
    if (!follow || Date.now() < followPauseUntil) return;

    if (!force) {
      if (!lyricsSectionInView()) return;

      const lineBox = line.getBoundingClientRect();
      const topLimit = (header ? header.offsetHeight : 0) + (indexBar ? indexBar.offsetHeight : 0) + 24;
      if (lineBox.top >= topLimit && lineBox.bottom <= window.innerHeight - 24) return;
    }

    line.scrollIntoView({
      block: 'center',
      behavior: reduceMotion.matches ? 'auto' : 'smooth'
    });
  }

  function updateHighlight(forceScroll, forceFollow) {
    const open = section.querySelector('.song[open]');
    if (!open || Number(open.dataset.trackIndex) !== activeTrackIndex()) {
      clearHighlight();
      return;
    }

    const time = audio && Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const lines = Array.from(open.querySelectorAll('.lyric-line'));
    const position = indexAt(lines, time);
    const next = position >= 0 ? lines[position] : null;

    if (next === currentLine) {
      if (forceScroll && next) followLine(next, forceFollow);
      return;
    }

    clearHighlight();
    if (next) {
      currentLine = next;
      next.classList.add('is-current');
      if (follow) followLine(next, forceFollow);
    }
  }

  function readFollowPreference() {
    try {
      const value = preferenceStore
        ? preferenceStore.get('sa-lyrics-follow')
        : window.localStorage.getItem('sa-lyrics-follow');
      return value === true || value === 'true';
    } catch (error) {
      return false;
    }
  }

  function setFollow(enabled, persist) {
    follow = Boolean(enabled);
    document.body.classList.toggle('follow-lyrics-on', follow);
    if (followButton) followButton.setAttribute('aria-pressed', follow ? 'true' : 'false');

    if (persist) {
      try {
        if (preferenceStore) preferenceStore.set('sa-lyrics-follow', follow);
        else window.localStorage.setItem('sa-lyrics-follow', String(follow));
      } catch (error) {
        /* private mode */
      }
    }

    if (follow) {
      followPauseUntil = 0;
      followActiveSong(true);
    }
  }

  function readRomajiPreference() {
    try {
      const value = preferenceStore
        ? preferenceStore.get('sa-lyrics-romaji')
        : window.localStorage.getItem('sa-lyrics-romaji');
      return value !== false && value !== 'false';
    } catch (error) {
      return true;
    }
  }

  function updateRomajiLabel() {
    if (!romajiToggle) return;
    const label = t(romaji ? 'lyrics.hideRomaji' : 'lyrics.showRomaji');
    romajiToggle.setAttribute('aria-label', label);
    romajiToggle.title = label;
  }

  function setRomaji(enabled, persist) {
    romaji = Boolean(enabled);
    document.body.classList.toggle('hide-lyrics-romaji', !romaji);
    if (romajiToggle) {
      romajiToggle.setAttribute('aria-pressed', romaji ? 'true' : 'false');
      updateRomajiLabel();
    }
    if (persist) {
      try {
        if (preferenceStore) preferenceStore.set('sa-lyrics-romaji', romaji);
        else window.localStorage.setItem('sa-lyrics-romaji', String(romaji));
      } catch (error) {
        /* private mode */
      }
    }
  }

  function readCyrillicPreference() {
    try {
      const value = preferenceStore
        ? preferenceStore.get('sa-lyrics-cyrillic')
        : window.localStorage.getItem('sa-lyrics-cyrillic');
      return value === true || value === 'true';
    } catch (error) {
      return false;
    }
  }

  function updateCyrillicLabel() {
    if (!cyrillicToggle) return;
    const label = t(cyrillic ? 'lyrics.hideCyrillic' : 'lyrics.showCyrillic');
    cyrillicToggle.setAttribute('aria-label', label);
    cyrillicToggle.title = label;
  }

  function setCyrillic(enabled, persist) {
    cyrillic = Boolean(enabled);
    document.body.classList.toggle('hide-lyrics-cyrillic', !cyrillic);
    if (cyrillicToggle) {
      cyrillicToggle.setAttribute('aria-pressed', cyrillic ? 'true' : 'false');
      updateCyrillicLabel();
    }
    if (persist) {
      try {
        if (preferenceStore) preferenceStore.set('sa-lyrics-cyrillic', cyrillic);
        else window.localStorage.setItem('sa-lyrics-cyrillic', String(cyrillic));
      } catch (error) {
        /* private mode */
      }
    }
  }

  /* ---------- inline lyrics in the active track row ---------- */

  function ensureTrackLyrics() {
    trackRows.forEach((track) => {
      if (track.querySelector('.track__lyrics')) return;
      const titles = track.querySelector('.track__titles');
      if (!titles) return;

      const block = document.createElement('span');
      block.className = 'track__lyrics';
      block.setAttribute('aria-hidden', 'true');

      const current = document.createElement('span');
      current.className = 'track__lyric track__lyric--current';
      current.lang = 'ja';

      const next = document.createElement('span');
      next.className = 'track__lyric track__lyric--next';
      next.lang = 'ja';

      block.append(current, next);
      titles.insertAdjacentElement('afterend', block);
    });
  }

  function readInlinePreference() {
    try {
      const value = preferenceStore
        ? preferenceStore.get('sa-track-lyrics')
        : window.localStorage.getItem('sa-track-lyrics');
      return value === true || value === 'true';
    } catch (error) {
      return false;
    }
  }

  function updateTrackLyrics(timeOverride) {
    if (!inlineEnabled) return;

    const active = activeTrack();
    if (!active) return;

    const number = trackRows.indexOf(active) + 1;
    const song = songFor(number);
    const block = active.querySelector('.track__lyrics');
    if (!song || !block) return;

    const lines = Array.from(song.querySelectorAll('.lyric-line'));
    const time = Number.isFinite(timeOverride)
      ? timeOverride
      : audio && Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const position = indexAt(lines, time);
    const currentText = position >= 0 ? lines[position].textContent.trim() : '';
    const nextText = position + 1 < lines.length
      ? lines[position + 1].textContent.trim()
      : position < 0 && lines[0] ? lines[0].textContent.trim() : '';

    const currentEl = block.querySelector('.track__lyric--current');
    const nextEl = block.querySelector('.track__lyric--next');
    if (currentEl && currentEl.textContent !== currentText) currentEl.textContent = currentText;
    if (nextEl && nextEl.textContent !== nextText) nextEl.textContent = nextText;
  }

  function setInlineLyrics(enabled, persist) {
    inlineEnabled = Boolean(enabled);
    document.body.classList.toggle('has-track-lyrics', inlineEnabled);

    if (inlineToggle) inlineToggle.checked = inlineEnabled;

    if (persist) {
      try {
        if (preferenceStore) preferenceStore.set('sa-track-lyrics', inlineEnabled);
        else window.localStorage.setItem('sa-track-lyrics', String(inlineEnabled));
      } catch (error) {
        /* private mode */
      }
    }

    updateTrackLyrics();
  }

  function openSong(number, options) {
    const settings = options || {};
    const details = songFor(number);
    if (!details) return;

    songs.forEach((song) => {
      if (song !== details) song.open = false;
    });
    details.open = true;
    setActive(details);

    if (settings.hash !== false && window.history.replaceState) {
      window.history.replaceState(null, '', '#lyrics-' + pad(number));
    }

    if (settings.scroll !== false) {
      window.requestAnimationFrame(() => {
        scrollToSong(details, settings.smooth !== false);
        window.requestAnimationFrame(() => updateHighlight(true));
      });
    } else {
      updateHighlight(true);
    }

    if (settings.focus) {
      window.requestAnimationFrame(() => focusSummary(details));
    }
  }

  function followActiveSong(forceScroll) {
    if (!follow) return;

    const number = activeTrackIndex();
    if (!number) return;

    const details = songFor(number);
    if (!details) return;

    if (!details.open) {
      songs.forEach((song) => {
        if (song !== details) song.open = false;
      });
      details.open = true;
      setActive(details);
      if (window.history.replaceState) {
        window.history.replaceState(null, '', '#lyrics-' + pad(number));
      }
    }

    const time = audio && Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const lines = Array.from(details.querySelectorAll('.lyric-line'));
    const position = indexAt(lines, time);

    updateHighlight(Boolean(forceScroll), Boolean(forceScroll));

    if (
      position < 0 &&
      Date.now() >= followPauseUntil &&
      (forceScroll || lyricsSectionInView())
    ) {
      scrollToSong(details, !reduceMotion.matches);
    }
  }

  indexLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openSong(Number(link.dataset.lyricsJump), { focus: true });
    });
  });

  songs.forEach((details) => {
    details.addEventListener('toggle', () => {
      if (printing) return;
      if (details.open) {
        songs.forEach((other) => {
          if (other !== details) other.open = false;
        });
        setActive(details);
        if (window.history.replaceState) {
          window.history.replaceState(null, '', '#lyrics-' + pad(Number(details.dataset.trackIndex)));
        }
      } else if (!songs.some((song) => song.open)) {
        setActive(null);
        if (window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
      updateHighlight();
    });
  });

  if (followButton) {
    setFollow(readFollowPreference(), false);
    followButton.addEventListener('click', () => setFollow(!follow, true));
  }

  if (romajiToggle) {
    setRomaji(readRomajiPreference(), false);
    romajiToggle.addEventListener('click', () => setRomaji(!romaji, true));
  }

  if (cyrillicToggle) {
    setCyrillic(readCyrillicPreference(), false);
    cyrillicToggle.addEventListener('click', () => setCyrillic(!cyrillic, true));
  }

  document.addEventListener('i18n:changed', () => {
    updateRomajiLabel();
    updateCyrillicLabel();
  });

  ensureTrackLyrics();

  if (inlineToggle) {
    setInlineLyrics(readInlinePreference(), false);
    inlineToggle.addEventListener('change', () => setInlineLyrics(inlineToggle.checked, true));
  }

  let lastActiveNumber = activeTrackIndex();

  if (trackList) {
    new MutationObserver(() => {
      const number = activeTrackIndex();
      if (number !== lastActiveNumber) {
        lastActiveNumber = number;
        if (follow && number) followActiveSong(false);
      }
      updateTrackLyrics();
    }).observe(trackList, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  if (follow && lastActiveNumber) followActiveSong(false);

  if (audio) {
    const refresh = () => {
      updateHighlight();
      updateTrackLyrics();
    };
    ['timeupdate', 'play', 'pause', 'seeked', 'loadedmetadata', 'ended'].forEach((name) => {
      audio.addEventListener(name, refresh);
    });
    audio.addEventListener('loadstart', () => {
      clearHighlight();
      updateTrackLyrics(0);
    });
    audio.addEventListener('emptied', () => {
      clearHighlight();
      updateTrackLyrics(0);
    });
  }

  if (list) {
    const pause = () => { if (follow) followPauseUntil = Date.now() + 6000; };
    list.addEventListener('wheel', pause, { passive: true });
    list.addEventListener('touchstart', pause, { passive: true });
  }

  window.addEventListener('keydown', (event) => {
    if (!follow) return;
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
      followPauseUntil = Date.now() + 6000;
    }
  });

  function openFromHash() {
    const match = window.location.hash.match(/^#lyrics-(\d{1,2})$/);
    if (!match) return;
    const number = Number(match[1]);
    if (songFor(number)) {
      openSong(number, { focus: false, hash: false, smooth: false });
    }
  }

  const initiallyOpen = songs.find((details) => details.open);
  if (initiallyOpen) setActive(initiallyOpen);

  window.addEventListener('hashchange', openFromHash);
  openFromHash();
  updateHighlight();
  updateTrackLyrics();

  if (playerButton) {
    playerButton.addEventListener('click', () => {
      const active = activeTrack();
      const index = active ? trackRows.indexOf(active) : -1;

      if (index >= 0) {
        openSong(index + 1, { focus: true });
        return;
      }

      const top = section.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) - 18;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });
    });
  }

  let printState = [];

  window.addEventListener('beforeprint', () => {
    printState = songs.map((details) => details.open);
    printing = true;
    songs.forEach((details) => { details.open = true; });
  });

  window.addEventListener('afterprint', () => {
    songs.forEach((details, index) => {
      details.open = Boolean(printState[index]);
    });
    printing = false;
    setActive(songs.find((details) => details.open) || null);
    updateHighlight();
  });
})();
