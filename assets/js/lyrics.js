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

  const songs = Array.from(section.querySelectorAll('.song'));
  const indexLinks = Array.from(section.querySelectorAll('[data-lyrics-jump]'));
  const playerButton = document.querySelector('[data-lyrics-open]');
  const followButton = section.querySelector('[data-lyrics-follow]');
  const romajiToggle = document.querySelector('[data-romaji-toggle]');
  const cyrillicToggle = document.querySelector('[data-cyrillic-toggle]');
  const inlineToggle = document.querySelector('[data-track-lyrics-toggle]');
  const audio = document.querySelector('#audio');
  const header = document.querySelector('.site-header');
  const indexBar = section.querySelector('.lyrics__index');
  const trackRows = Array.from(document.querySelectorAll('.track'));
  const trackList = document.querySelector('.tracklist');
  const preferenceStore = window.store;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let printing = false;
  let romaji = true;
  let cyrillic = false;
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

  function updateHighlight() {
    const open = section.querySelector('.song[open]');
    if (!open || Number(open.dataset.trackIndex) !== activeTrackIndex()) {
      clearHighlight();
      return;
    }

    const time = audio && Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const lines = Array.from(open.querySelectorAll('.lyric-line'));
    const position = indexAt(lines, time);
    const next = position >= 0 ? lines[position] : null;

    if (next === currentLine) return;

    clearHighlight();
    if (next) {
      currentLine = next;
      next.classList.add('is-current');
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

  function setRomaji(enabled, persist) {
    romaji = Boolean(enabled);
    document.body.classList.toggle('hide-lyrics-romaji', !romaji);
    if (romajiToggle) romajiToggle.checked = romaji;
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

  function setCyrillic(enabled, persist) {
    cyrillic = Boolean(enabled);
    document.body.classList.toggle('hide-lyrics-cyrillic', !cyrillic);
    if (cyrillicToggle) cyrillicToggle.checked = cyrillic;
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

      const currentRomaji = document.createElement('span');
      currentRomaji.className = 'track__lyric track__lyric--romaji track__lyric--current-romaji';
      currentRomaji.lang = 'ja-Latn';

      const currentCyrillic = document.createElement('span');
      currentCyrillic.className = 'track__lyric track__lyric--cyrillic track__lyric--current-cyrillic';
      currentCyrillic.lang = 'ru';

      const next = document.createElement('span');
      next.className = 'track__lyric track__lyric--next';
      next.lang = 'ja';

      const nextRomaji = document.createElement('span');
      nextRomaji.className = 'track__lyric track__lyric--romaji track__lyric--next-romaji';
      nextRomaji.lang = 'ja-Latn';

      const nextCyrillic = document.createElement('span');
      nextCyrillic.className = 'track__lyric track__lyric--cyrillic track__lyric--next-cyrillic';
      nextCyrillic.lang = 'ru';

      block.append(current, currentRomaji, currentCyrillic, next, nextRomaji, nextCyrillic);
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

  function readingsFor(line) {
    const readings = { romaji: '', cyrillic: '' };
    if (!line) return readings;

    let node = line.nextElementSibling;
    while (node && !node.classList.contains('lyric-line')) {
      if (node.classList.contains('lyric-romaji')) readings.romaji = node.textContent.trim();
      else if (node.classList.contains('lyric-cyrillic')) readings.cyrillic = node.textContent.trim();
      node = node.nextElementSibling;
    }
    return readings;
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
    const rowPosition = position >= 0 ? position : (lines.length ? 0 : -1);
    const line = rowPosition >= 0 ? lines[rowPosition] : null;
    const nextLine = rowPosition >= 0 && rowPosition + 1 < lines.length
      ? lines[rowPosition + 1]
      : null;
    const currentText = line ? line.textContent.trim() : '';
    const currentReadings = readingsFor(line);
    const nextText = nextLine ? nextLine.textContent.trim() : '';
    const nextReadings = readingsFor(nextLine);

    const currentEl = block.querySelector('.track__lyric--current');
    const currentRomajiEl = block.querySelector('.track__lyric--current-romaji');
    const currentCyrillicEl = block.querySelector('.track__lyric--current-cyrillic');
    const nextEl = block.querySelector('.track__lyric--next');
    const nextRomajiEl = block.querySelector('.track__lyric--next-romaji');
    const nextCyrillicEl = block.querySelector('.track__lyric--next-cyrillic');
    let changed = false;
    const setText = (el, value) => {
      if (el && el.textContent !== value) {
        el.textContent = value;
        changed = true;
      }
    };

    setText(currentEl, currentText);
    setText(currentRomajiEl, currentReadings.romaji);
    setText(currentCyrillicEl, currentReadings.cyrillic);
    setText(nextEl, nextText);
    setText(nextRomajiEl, nextReadings.romaji);
    setText(nextCyrillicEl, nextReadings.cyrillic);

    if (changed) {
      block.classList.remove('is-line-change');
      void block.offsetWidth;
      block.classList.add('is-line-change');
    }
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

  function clearLyricsHash() {
    if (window.history.replaceState && /^#lyrics-\d{1,2}$/.test(window.location.hash)) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
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

    if (settings.scroll !== false) {
      window.requestAnimationFrame(() => {
        scrollToSong(details, settings.smooth !== false);
        window.requestAnimationFrame(() => updateHighlight());
      });
    } else {
      updateHighlight();
    }

    if (settings.focus) {
      window.requestAnimationFrame(() => focusSummary(details));
    }
  }

  function goToActiveLyrics(focus) {
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
    }

    const time = audio && Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const lines = Array.from(details.querySelectorAll('.lyric-line'));
    const position = indexAt(lines, time);
    updateHighlight();

    if (position >= 0 && lines[position]) {
      lines[position].scrollIntoView({
        block: 'center',
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });
    } else {
      scrollToSong(details, !reduceMotion.matches);
    }

    if (focus) {
      window.requestAnimationFrame(() => focusSummary(details));
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
      } else if (!songs.some((song) => song.open)) {
        setActive(null);
      }
      updateHighlight();
    });
  });

  if (followButton) {
    followButton.addEventListener('click', () => goToActiveLyrics(false));
  }

  if (romajiToggle) {
    setRomaji(readRomajiPreference(), false);
    romajiToggle.addEventListener('change', () => setRomaji(romajiToggle.checked, true));
  }

  if (cyrillicToggle) {
    setCyrillic(readCyrillicPreference(), false);
    cyrillicToggle.addEventListener('change', () => setCyrillic(cyrillicToggle.checked, true));
  }

  ensureTrackLyrics();

  if (inlineToggle) {
    setInlineLyrics(readInlinePreference(), false);
    inlineToggle.addEventListener('change', () => setInlineLyrics(inlineToggle.checked, true));
  }

  if (trackList) {
    new MutationObserver(() => updateTrackLyrics()).observe(trackList, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

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

  function openFromHash() {
    const match = window.location.hash.match(/^#lyrics-(\d{1,2})$/);
    if (!match) return;
    const number = Number(match[1]);
    if (songFor(number)) {
      openSong(number, { focus: false, smooth: false });
    }
    clearLyricsHash();
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
        goToActiveLyrics(true);
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
