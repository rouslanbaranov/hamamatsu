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
  const INLINE_SCROLL_MS = 500;
  let inlineScroll = null;

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
    window.requestAnimationFrame(syncActiveInlineHeight);
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
    window.requestAnimationFrame(syncActiveInlineHeight);
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

  function createInlineGroup() {
    const group = document.createElement('span');
    group.className = 'track__lyric-group';
    group.hidden = true;

    const ja = document.createElement('span');
    ja.className = 'track__lyric track__lyric--ja';
    ja.lang = 'ja';

    const romaji = document.createElement('span');
    romaji.className = 'track__lyric track__lyric--romaji';
    romaji.lang = 'ja-Latn';

    const cyrillic = document.createElement('span');
    cyrillic.className = 'track__lyric track__lyric--cyrillic';
    cyrillic.lang = 'ru';

    group.append(ja, romaji, cyrillic);
    return group;
  }

  function ensureTrackLyrics() {
    trackRows.forEach((track) => {
      if (track.querySelector('.track__lyrics')) return;
      const titles = track.querySelector('.track__titles');
      if (!titles) return;

      const block = document.createElement('span');
      block.className = 'track__lyrics';
      block.setAttribute('aria-hidden', 'true');

      const viewport = document.createElement('span');
      viewport.className = 'track__lyrics-viewport';

      const trackEl = document.createElement('span');
      trackEl.className = 'track__lyrics-track';
      for (let i = 0; i < 3; i += 1) trackEl.append(createInlineGroup());

      viewport.append(trackEl);
      block.append(viewport);
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

  function fillInlineGroup(group, line) {
    if (!group) return;
    const ja = group.querySelector('.track__lyric--ja');
    const romaji = group.querySelector('.track__lyric--romaji');
    const cyrillic = group.querySelector('.track__lyric--cyrillic');

    if (!line) {
      group.hidden = true;
      if (ja) ja.textContent = '';
      if (romaji) romaji.textContent = '';
      if (cyrillic) cyrillic.textContent = '';
      return;
    }

    group.hidden = false;
    const readings = readingsFor(line);
    if (ja) ja.textContent = line.textContent.trim();
    if (romaji) romaji.textContent = readings.romaji;
    if (cyrillic) cyrillic.textContent = readings.cyrillic;
  }

  function inlineParts(block) {
    const viewport = block.querySelector('.track__lyrics-viewport');
    const track = block.querySelector('.track__lyrics-track');
    const groups = track ? Array.from(track.children) : [];
    return { viewport, track, groups };
  }

  function setInlineRole(group, role) {
    if (!group) return;
    group.classList.remove('is-current', 'is-next', 'is-upcoming');
    if (!group.hidden) group.classList.add('is-' + role);
  }

  function syncInlineHeight(block) {
    if (!block) return;
    const { viewport, track, groups } = inlineParts(block);
    if (!viewport || !track) return;

    const visible = groups.filter((group) => !group.hidden);
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.rowGap || styles.gap || '0') || 0;
    const first = visible[0];
    const second = visible[1];
    const firstHeight = first ? first.getBoundingClientRect().height : 0;
    const secondHeight = second ? second.getBoundingClientRect().height : 0;
    viewport.style.height = (firstHeight + (second ? gap + secondHeight : 0)) + 'px';
  }

  function syncActiveInlineHeight() {
    if (!inlineEnabled || inlineScroll) return;
    const active = activeTrack();
    const block = active ? active.querySelector('.track__lyrics') : null;
    if (block) syncInlineHeight(block);
  }

  function cancelInlineScroll() {
    if (!inlineScroll) return;
    window.clearTimeout(inlineScroll.timer);
    const block = inlineScroll.block;
    const fromIndex = inlineScroll.fromIndex;
    const track = block ? block.querySelector('.track__lyrics-track') : null;
    if (track) {
      track.style.transition = 'none';
      track.style.transform = 'translateY(0)';
      const groups = Array.from(track.children);
      if (groups[0]) setInlineRole(groups[0], 'current');
      if (groups[1]) setInlineRole(groups[1], 'next');
      if (groups[2]) setInlineRole(groups[2], 'upcoming');
      void track.offsetWidth;
      track.style.transition = '';
    }
    if (block) block.dataset.lineIndex = String(fromIndex);
    inlineScroll = null;
  }

  function renderInlineRows(block, position, lines) {
    cancelInlineScroll();
    const { track, groups } = inlineParts(block);
    if (!track) return;

    track.style.transition = 'none';
    track.style.transform = 'translateY(0)';

    const roles = ['current', 'next', 'upcoming'];
    groups.slice(0, 3).forEach((group, index) => {
      const line = lines[position + index] || null;
      fillInlineGroup(group, line);
      if (line) setInlineRole(group, roles[index]);
      else group.classList.remove('is-current', 'is-next', 'is-upcoming');
    });

    block.dataset.lineIndex = String(position);
    block.dataset.ready = '1';
    void track.offsetWidth;
    track.style.transition = '';
    syncInlineHeight(block);
  }

  function animateInlineScroll(block, position, lines) {
    const { track, groups } = inlineParts(block);
    if (!track || groups.length < 3) {
      renderInlineRows(block, position, lines);
      return;
    }

    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.rowGap || styles.gap || '0') || 0;
    const distance = groups[0].getBoundingClientRect().height + gap;
    const target = position;
    const fromIndex = Number(block.dataset.lineIndex);

    const startGroups = Array.from(track.children);
    if (startGroups[0]) setInlineRole(startGroups[0], 'upcoming');
    if (startGroups[1]) setInlineRole(startGroups[1], 'current');
    if (startGroups[2]) setInlineRole(startGroups[2], 'next');
    block.dataset.lineIndex = String(target);

    track.style.transition = 'transform ' + INLINE_SCROLL_MS + 'ms linear';
    void track.offsetWidth;
    track.style.transform = 'translateY(-' + distance + 'px)';

    const finish = () => {
      if (!inlineScroll || inlineScroll.block !== block || inlineScroll.target !== target) return;
      inlineScroll = null;

      const children = Array.from(track.children);
      track.style.transition = 'none';
      track.style.transform = 'translateY(0)';
      if (children[0]) children[0].remove();

      const upcoming = createInlineGroup();
      track.append(upcoming);
      const upcomingLine = lines[target + 2] || null;
      fillInlineGroup(upcoming, upcomingLine);
      if (upcomingLine) setInlineRole(upcoming, 'upcoming');

      block.dataset.lineIndex = String(target);
      void track.offsetWidth;
      track.style.transition = '';
      syncInlineHeight(block);
    };

    const timer = window.setTimeout(finish, INLINE_SCROLL_MS + 20);
    inlineScroll = { block, target, fromIndex, timer };
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
    if (!lines.length) return;

    const time = Number.isFinite(timeOverride)
      ? timeOverride
      : audio && Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const position = indexAt(lines, time);
    const rowPosition = position >= 0 ? position : 0;

    if (inlineScroll && inlineScroll.block !== block) cancelInlineScroll();

    const ready = block.dataset.ready === '1';
    const currentIndex = Number(block.dataset.lineIndex);

    if (!ready) {
      renderInlineRows(block, rowPosition, lines);
      return;
    }

    if (inlineScroll) {
      if (inlineScroll.target === rowPosition) return;
      cancelInlineScroll();
      if (rowPosition === currentIndex) {
        syncInlineHeight(block);
        return;
      }
      renderInlineRows(block, rowPosition, lines);
      return;
    }

    if (rowPosition === currentIndex) {
      syncInlineHeight(block);
      return;
    }

    if (rowPosition === currentIndex + 1 && !reduceMotion.matches) {
      animateInlineScroll(block, rowPosition, lines);
      return;
    }

    renderInlineRows(block, rowPosition, lines);
  }

  function setInlineLyrics(enabled, persist) {
    inlineEnabled = Boolean(enabled);
    if (!inlineEnabled) cancelInlineScroll();
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
    syncActiveInlineHeight();
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

  window.addEventListener('resize', () => {
    window.requestAnimationFrame(syncActiveInlineHeight);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => syncActiveInlineHeight());
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
