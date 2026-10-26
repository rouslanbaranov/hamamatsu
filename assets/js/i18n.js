/* ============================================================
   SUMMER AVENUE — localization layer
   i18next (MIT, vendored) + English / Japanese resources.
   All interface copy, metadata, ARIA labels and stateful player
   strings live in this file.
   ============================================================ */

(() => {
  'use strict';

  const SUPPORTED = ['en', 'ja'];
  const FALLBACK = 'en';
  const STORAGE_KEY = 'sa-lang';
  const preferenceStore = window.store;

  const resources = {
    en: {
      translation: {
        meta: {
          title: 'Summer Avenue — Project Hamamatsu',
          description: 'Summer Avenue is the 2026 album from Project Hamamatsu: eleven city-pop songs in Japanese and English, made for the long way home. Listen to the full record.',
          ogTitle: 'Summer Avenue — Project Hamamatsu',
          ogDescription: 'Eleven city-pop songs for the long way home. The 2026 album from Project Hamamatsu.',
          ogImageAlt: 'Beige Project Hamamatsu audio cassette with Summer Avenue artwork, Japanese and English album titles, reel openings and a magnetic tape window.',
          albumTitle: 'Summer Avenue',
          nowPlayingTitle: '▶ {{title}} — Project Hamamatsu'
        },
        a11y: {
          skipToContent: 'Skip to content',
          openMenu: 'Open menu',
          closeMenu: 'Close menu',
          newTab: '(opens in a new tab)',
          portfolioNewTab: '(rbaranov.ch; opens in a new tab)'
        },
        nav: {
          primaryAria: 'Primary',
          mobileAria: 'Menu',
          footerAria: 'Footer',
          record: 'The record',
          tracklist: 'Tracklist',
          lyrics: 'Lyrics',
          film: 'The film',
          notes: 'Notes',
          listen: 'Listen'
        },
        header: {
          brandAria: 'Project Hamamatsu — Summer Avenue'
        },
        menu: {
          preferencesAria: 'Display preferences',
          video: 'Background video',
          lyrics: 'Lyrics in the tracklist',
          romajiLatin: 'Romaji latin',
          romajiCyrillic: 'Romaji cyrillic',
          meta: 'Project Hamamatsu · 2026 · 11 TRACKS'
        },
        lang: {
          label: 'Language',
          switchToEnglish: 'Switch to English',
          switchToJapanese: 'Switch to Japanese',
          changedToEnglish: 'Language changed to English.',
          changedToJapanese: 'Language changed to Japanese.'
        },
        hero: {
          cityPop: '’80s-style City Pop',
          lede: 'The 2026 album from Project Hamamatsu — Japanese and English, in eleven tracks.',
          meta: '11 TRACKS <span>·</span> 46:05 <span>·</span> RB–001',
          portraitAlt: 'Portrait of the Project Hamamatsu character, chin raised, wearing a black Hamamatsu T-shirt.',
          playAlbum: 'Play the album',
          pauseAlbum: 'Pause the album',
          watchFilm: 'Watch the film',
          scrollToRecord: 'Scroll to the record',
          edition: 'FIRST EDITION · 2026',
          socialAria: 'Social and portfolio links',
          portfolio: 'Portfolio'
        },
        record: {
          side: 'CITY POP · シティ・ポップ · 2026',
          coverAlt: 'Summer Avenue album artwork: an illustrated evening Japanese street with a mint-green kei van and a figure in a yellow Hamamatsu T-shirt and short-brim straw hat, looking down.',
          caption: 'RB–001 <span>/</span> 2026 <span>/</span> 11 TRACKS',
          title: 'Two languages.<br>One record.',
          lead: 'Summer Avenue is a record about distance, warm streets, and the hour after sunset.',
          body: 'The album moves between Japanese and English; both languages belong to the same world. Around them, the record holds its city-pop balance — bright surfaces, a quiet center, and room to breathe.',
          meta: {
            project: 'Project',
            released: 'Released',
            tracks: 'Tracks',
            runtime: 'Runtime',
            language: 'Language',
            catalogue: 'Catalogue',
            languageValue: 'Japanese / English'
          },
          seeTracklist: 'See the tracklist'
        },
        interlude: {
          label: 'CITY POP / 2026 / 11 TRACKS',
          seal: 'CITY POP'
        },
        tracks: {
          title: 'The avenue,<br>track by track.',
          count: '11 tracks <span>·</span> 46:05',
          previousClip: 'Previous clip',
          nextClip: 'Next clip',
          backgroundClips: 'Background clips',
          showClip: 'Show clip {{index}} of {{total}}',
          playTrack: 'Play track',
          pauseTrack: 'Pause track'
        },
        lyrics: {
          title: 'The words,<br>as they are sung.',
          count: '11 songs <span>·</span> 46:05',
          lead: 'All eleven songs, in Japanese, with Romaji latin and Romaji cyrillic for singing along. Open a track to read along.',
          note: 'Japanese lyrics + Romaji latin / Romaji cyrillic.',
          follow: 'Follow the lyrics',
          indexAria: 'Lyrics navigation',
          credit: 'Words © 2026 Project Hamamatsu.'
        },
        film: {
          word: 'FILM',
          title: 'A postcard<br>from the avenue.',
          lead: 'Thirty seconds of neon, late trains, and one long look at the camera. A visual companion to the title track.',
          videoFallback: 'Your browser does not support HTML video.',
          playOverlay: 'PLAY THE FILM<br><small>00:30 · SOUND ON</small>',
          play: 'Play film',
          pause: 'Pause film',
          seek: 'Seek within the film',
          mute: 'Mute film',
          unmute: 'Unmute film',
          caption: 'SUMMER AVENUE — VISUAL COMPANION <span>·</span> 2026'
        },
        notes: {
          artAlt: 'A woman in a floral dress presents the Summer Avenue cassette with both hands against a neon city at dusk.',
          title: 'For the<br>in-between hours.',
          lead: 'Project Hamamatsu is a city-pop project built around the space between Japanese and English — and the quieter side of the city.',
          body: 'Summer Avenue is a record to hear from beginning to end. It treats Japanese and English as one language, and nostalgia as something you can move to.',
          quote: 'For the long way home.',
          cite: '— Project Hamamatsu',
          musicDirection: 'Music & direction',
          year: 'Year',
          catalogue: 'Catalogue'
        },
        outro: {
          lede: 'The full record, in order. Stay a while.',
          share: 'Share the page',
          listenTitle: 'Summer Avenue — サマー・アベニュー',
          cassetteAlt: 'Summer Avenue by Project Hamamatsu, on a beige cassette with Japanese and English artwork.',
          socialAria: 'Social and portfolio links at the end of the page'
        },
        footer: {
          copyright: '© 2026 Project Hamamatsu. All rights reserved.',
          cityPop: 'CITY POP · 2026',
          backToTop: 'Back to top'
        },
        player: {
          region: 'Album player',
          seek: 'Seek within the current track',
          goToTracklist: 'Go to tracklist',
          subtitle: 'Project Hamamatsu · {{track}}',
          previous: 'Previous track',
          next: 'Next track',
          lyrics: 'Lyrics for the current track',
          play: 'Play',
          pause: 'Pause',
          mute: 'Mute',
          unmute: 'Unmute',
          volume: 'Volume',
          close: 'Stop and close player',
          timeOf: '{{time}} of {{total}}',
          nowPlaying: 'Now playing: {{title}} — {{alt}}'
        },
        share: {
          title: 'Summer Avenue — Project Hamamatsu',
          text: 'The 2026 album from Project Hamamatsu. Eleven city-pop songs for the long way home.'
        },
        toasts: {
          playbackFailed: 'Playback could not start. Tap play to try again.',
          trackLoadFailed: 'Could not load this track. Please try again.',
          endOfAvenue: 'End of the avenue.',
          linkCopied: 'Link copied to clipboard.',
          copyFailed: 'Could not copy the link — use your address bar.',
          filmFailed: 'The film could not start. Please try again.'
        }
      }
    },
    ja: {
      translation: {
        meta: {
          title: 'サマー・アベニュー — Project Hamamatsu',
          description: '『サマー・アベニュー』は、Project Hamamatsuの2026年アルバム。日本語と英語で紡ぐ11曲のシティポップを、遠回りして帰る夜に。全曲を聴く。',
          ogTitle: 'サマー・アベニュー — Project Hamamatsu',
          ogDescription: '遠回りして帰る夜のための、11曲のシティポップ。Project Hamamatsuの2026年アルバム。',
          ogImageAlt: '『サマー・アベニュー』のアートワークをあしらった、ベージュのProject Hamamatsuカセット。日本語と英語のアルバムタイトル、リールの穴、磁気テープの窓が見える。',
          albumTitle: 'サマー・アベニュー',
          nowPlayingTitle: '▶ {{title}} — Project Hamamatsu'
        },
        a11y: {
          skipToContent: '本文へスキップ',
          openMenu: 'メニューを開く',
          closeMenu: 'メニューを閉じる',
          newTab: '（新しいタブで開きます）',
          portfolioNewTab: '（rbaranov.ch、新しいタブで開きます）'
        },
        nav: {
          primaryAria: 'メインメニュー',
          mobileAria: 'メニュー',
          footerAria: 'フッターメニュー',
          record: 'レコード',
          tracklist: 'トラックリスト',
          lyrics: '歌詞',
          film: 'フィルム',
          notes: 'ノート',
          listen: '聴く'
        },
        header: {
          brandAria: 'Project Hamamatsu — SUMMER AVENUE（サマー・アベニュー）'
        },
        menu: {
          preferencesAria: '表示設定',
          video: '背景の映像',
          lyrics: 'トラックリストの歌詞',
          romajiLatin: 'ローマ字（ラテン）',
          romajiCyrillic: 'ローマ字（キリル）',
          meta: 'Project Hamamatsu · 2026 · 全11曲'
        },
        lang: {
          label: '言語',
          switchToEnglish: '英語に切り替える',
          switchToJapanese: '日本語に切り替える',
          changedToEnglish: '言語を英語に切り替えました。',
          changedToJapanese: '言語を日本語に切り替えました。'
        },
        hero: {
          cityPop: '’80sスタイル・シティポップ',
          lede: 'Project Hamamatsuの2026年アルバム。日本語と英語が、11曲の中で交わる。',
          meta: '11曲 <span>·</span> 46:05 <span>·</span> RB–001',
          portraitAlt: '顎を上げ、黒いHamamatsuのTシャツを着たProject Hamamatsuのキャラクターのポートレート。',
          playAlbum: 'アルバムを再生',
          pauseAlbum: 'アルバムを一時停止',
          watchFilm: 'フィルムを見る',
          scrollToRecord: 'レコードへスクロール',
          edition: '初回盤 · 2026',
          socialAria: 'ソーシャルとポートフォリオのリンク',
          portfolio: 'ポートフォリオ'
        },
        record: {
          side: 'シティ・ポップ · CITY POP · 2026',
          coverAlt: '『サマー・アベニュー』のアルバムアートワーク。夕暮れの日本の街並みを描いたイラストで、ミントグリーンの軽ワゴンと、黄色いHamamatsuのTシャツに短いつばの麦わら帽子をかぶり、下を向く人物がいる。',
          caption: 'RB–001 <span>/</span> 2026 <span>/</span> 全11曲',
          title: '二つの言語。<br>一枚のレコード。',
          lead: '『サマー・アベニュー』は、距離と、温かな街と、日没後の一時間についてのレコード。',
          body: 'アルバムは日本語と英語のあいだを行き来する。どちらの言語も、同じ世界のものだ。そのまわりで、シティポップのバランスが保たれている——明るい表面、静かな中心、そして息をつく余白。',
          meta: {
            project: 'プロジェクト',
            released: 'リリース',
            tracks: '収録曲',
            runtime: '収録時間',
            language: '言語',
            catalogue: 'カタログ番号',
            languageValue: '日本語 / 英語'
          },
          seeTracklist: 'トラックリストを見る'
        },
        interlude: {
          label: 'シティ・ポップ / 2026 / 全11曲',
          seal: 'シティ・ポップ'
        },
        tracks: {
          title: '大通りを、<br>一曲ずつ。',
          count: '11曲 <span>·</span> 46:05',
          previousClip: '前のクリップ',
          nextClip: '次のクリップ',
          backgroundClips: '背景クリップ',
          showClip: 'クリップ{{index}}／{{total}}を表示',
          playTrack: '曲を再生',
          pauseTrack: '曲を一時停止'
        },
        lyrics: {
          title: '歌詞は、<br>歌われるままに。',
          count: '11曲 <span>·</span> 46:05',
          lead: '全11曲の日本語詞にローマ字（ラテン）とローマ字（キリル）を添えました。曲を開いて、歌いながら読めます。',
          note: '日本語詞＋ローマ字（ラテン）／ローマ字（キリル）。',
          follow: '歌詞を追従',
          indexAria: '歌詞ナビゲーション',
          credit: '歌詞 © 2026 Project Hamamatsu'
        },
        film: {
          word: 'フィルム',
          title: '大通りからの<br>ポストカード。',
          lead: 'ネオン、終電、そしてカメラを見つめる長い一瞬。タイトル曲に寄り添う30秒の映像。',
          videoFallback: 'お使いのブラウザはHTML動画に対応していません。',
          playOverlay: 'フィルムを再生<br><small>00:30 · 音声あり</small>',
          play: 'フィルムを再生',
          pause: 'フィルムを一時停止',
          seek: 'フィルム内をシーク',
          mute: 'フィルムをミュート',
          unmute: 'フィルムのミュートを解除',
          caption: 'SUMMER AVENUE — ビジュアル・コンパニオン <span>·</span> 2026'
        },
        notes: {
          artAlt: '花柄のワンピースを着た女性が、夕暮れのネオン街を背景に、Summer Avenueのカセットを両手で紹介しています。',
          title: 'その隙間の<br>時間のために。',
          lead: 'Project Hamamatsuは、日本語と英語のあいだ、そして街の静かな側に寄り添うシティポップ・プロジェクト。',
          body: '『サマー・アベニュー』は、最初から最後まで通して聴くレコード。日本語と英語をひとつの言語として扱い、ノスタルジーを身体で動かせるものとして描いている。',
          quote: '遠回りして帰る道に。',
          cite: '— Project Hamamatsu',
          musicDirection: '音楽・ディレクション',
          year: '年',
          catalogue: 'カタログ番号'
        },
        outro: {
          lede: '全曲を、収録順に。もう少しだけ。',
          share: 'ページをシェア',
          listenTitle: 'サマー・アベニュー — Summer Avenue',
          cassetteAlt: 'Project Hamamatsuの『サマー・アベニュー』。日本語と英語のアートワークをあしらったベージュのカセット。',
          socialAria: 'ページ末尾のソーシャルとポートフォリオのリンク'
        },
        footer: {
          copyright: '© 2026 Project Hamamatsu. 無断転載を禁じます。',
          cityPop: 'シティ・ポップ · 2026',
          backToTop: 'ページ上部へ'
        },
        player: {
          region: 'アルバムプレイヤー',
          seek: '現在の曲内をシーク',
          goToTracklist: 'トラックリストへ移動',
          subtitle: 'Project Hamamatsu · {{track}}',
          previous: '前の曲',
          next: '次の曲',
          lyrics: '再生中の曲の歌詞',
          play: '再生',
          pause: '一時停止',
          mute: 'ミュート',
          unmute: 'ミュートを解除',
          volume: '音量',
          close: '停止してプレイヤーを閉じる',
          timeOf: '{{time}} / {{total}}',
          nowPlaying: '再生中：{{title}} — {{alt}}'
        },
        share: {
          title: 'サマー・アベニュー — Project Hamamatsu',
          text: 'Project Hamamatsuの2026年アルバム。遠回りして帰る夜のための、11曲のシティポップ。'
        },
        toasts: {
          playbackFailed: '再生を開始できませんでした。もう一度再生ボタンを押してください。',
          trackLoadFailed: 'この曲を読み込めませんでした。もう一度お試しください。',
          endOfAvenue: '大通りの終わり。',
          linkCopied: 'リンクをコピーしました。',
          copyFailed: 'リンクをコピーできませんでした。アドレスバーからコピーしてください。',
          filmFailed: 'フィルムを開始できませんでした。もう一度お試しください。'
        }
      }
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const normalize = (value) => String(value || '').trim().toLowerCase();
  const isSupported = (value) => SUPPORTED.includes(normalize(value));

  function readStoredLanguage() {
    try {
      if (!preferenceStore || typeof preferenceStore.get !== 'function') return '';
      return normalize(preferenceStore.get(STORAGE_KEY));
    } catch (error) {
      return '';
    }
  }

  function storeLanguage(language) {
    try {
      if (preferenceStore && typeof preferenceStore.set === 'function') {
        preferenceStore.set(STORAGE_KEY, language);
      }
    } catch (error) { /* private mode */ }
  }

  function detectLanguage() {
    const query = normalize(new URLSearchParams(window.location.search).get('lang'));
    if (isSupported(query)) return { language: query, source: 'query' };

    const stored = readStoredLanguage();
    if (isSupported(stored)) return { language: stored, source: 'storage' };

    const browserLanguages = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ''];
    const browserLanguage = browserLanguages
      .map((language) => normalize(language).slice(0, 2))
      .find((language) => SUPPORTED.includes(language));
    if (browserLanguage) return { language: browserLanguage, source: 'browser' };
    return { language: FALLBACK, source: 'default' };
  }

  const detected = detectLanguage();
  let currentLanguage = detected.language;

  function fallbackTranslate(key, options) {
    const value = key.split('.').reduce((node, part) => (
      node && typeof node === 'object' ? node[part] : undefined
    ), resources.en.translation);
    if (typeof value !== 'string') return key;
    return value.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (match, name) => {
      const replacement = options && options[name];
      return replacement === undefined || replacement === null ? match : String(replacement);
    });
  }

  function translate(key, options) {
    return window.i18next ? window.i18next.t(key, options) : fallbackTranslate(key, options);
  }

  if (!window.i18next) {
    document.documentElement.lang = FALLBACK;
    document.documentElement.setAttribute('data-lang', FALLBACK);
    document.documentElement.classList.remove('i18n-pending');
    console.error('[Summer Avenue] i18next failed to load; interface copy stays in English.');
    $$('.lang-switch__btn[data-lang]').forEach((button) => {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
    });
    window.SummerAvenueI18n = {
      t: translate,
      getLanguage: () => FALLBACK,
      changeLanguage: () => Promise.resolve(FALLBACK),
      getLanguages: () => [FALLBACK]
    };
    return;
  }

  function setMeta(selector, key) {
    const node = $(selector);
    if (node) node.setAttribute('content', translate(key));
  }

  function applyAttributes(root) {
    $$('[data-i18n-attr]', root).forEach((node) => {
      node.getAttribute('data-i18n-attr').split(';').forEach((pair) => {
        const separator = pair.indexOf(':');
        if (separator < 1) return;
        const attribute = pair.slice(0, separator).trim();
        const key = pair.slice(separator + 1).trim();
        if (!attribute || !key) return;
        node.setAttribute(attribute, translate(key));
      });
    });
  }

  function applyLanguageToDocument(language) {
    document.documentElement.lang = language;
    document.documentElement.setAttribute('data-lang', language);

    $$('[data-i18n]').forEach((node) => {
      node.textContent = translate(node.getAttribute('data-i18n'));
    });

    $$('[data-i18n-html]').forEach((node) => {
      node.innerHTML = translate(node.getAttribute('data-i18n-html'));
    });

    applyAttributes(document);

    document.title = translate('meta.title');
    setMeta('meta[name="description"]', 'meta.description');
    setMeta('meta[property="og:title"]', 'meta.ogTitle');
    setMeta('meta[property="og:description"]', 'meta.ogDescription');
    setMeta('meta[property="og:image:alt"]', 'meta.ogImageAlt');

    const ogLocale = $('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', language === 'ja' ? 'ja_JP' : 'en_US');
    const ogLocaleAlternate = $('meta[property="og:locale:alternate"]');
    if (ogLocaleAlternate) ogLocaleAlternate.setAttribute('content', language === 'ja' ? 'en_US' : 'ja_JP');

    setMeta('meta[name="twitter:title"]', 'meta.ogTitle');
    setMeta('meta[name="twitter:description"]', 'meta.ogDescription');
    setMeta('meta[name="twitter:image:alt"]', 'meta.ogImageAlt');

    $$('.lang-switch__btn[data-lang]').forEach((button) => {
      const isCurrent = button.getAttribute('data-lang') === language;
      button.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      button.classList.toggle('is-active', isCurrent);
    });

    document.documentElement.classList.remove('i18n-pending');
  }

  function updateUrl(language) {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('lang') === language) return;
      url.searchParams.set('lang', language);
      window.history.replaceState(window.history.state, '', url);
    } catch (error) {
      /* history may be unavailable in embedded contexts */
    }
  }

  function announce(language) {
    const status = $('[data-i18n-status]');
    if (!status) return;
    status.textContent = translate(language === 'ja' ? 'lang.changedToJapanese' : 'lang.changedToEnglish');
  }

  function finishApply(language, options = {}) {
    currentLanguage = language;
    applyLanguageToDocument(language);

    if (options.store) storeLanguage(language);
    if (options.updateUrl) updateUrl(language);
    if (options.announce) announce(language);

    document.dispatchEvent(new CustomEvent('i18n:changed', {
      detail: { language }
    }));
  }

  function changeLanguage(language, options = {}) {
    const next = normalize(language);
    if (!isSupported(next)) return Promise.resolve(currentLanguage);

    return window.i18next.changeLanguage(next).then(() => {
      finishApply(next, {
        store: options.store !== false,
        updateUrl: options.updateUrl !== false,
        announce: options.announce !== false
      });
      return next;
    });
  }

  function init() {
    return window.i18next.init({
      lng: currentLanguage,
      fallbackLng: FALLBACK,
      supportedLngs: SUPPORTED,
      resources,
      returnEmptyString: false,
      interpolation: { escapeValue: false },
      missingKeyHandler: (languages, namespace, key) => {
        console.warn('[Summer Avenue] Missing translation:', languages.join(','), namespace, key);
      }
    }).then(() => {
      finishApply(currentLanguage, {
        store: false,
        updateUrl: detected.source === 'query',
        announce: false
      });
    }).catch((error) => {
      document.documentElement.classList.remove('i18n-pending');
      console.error('[Summer Avenue] Localization failed:', error);
    });
  }

  $$('.lang-switch__btn[data-lang]').forEach((button) => {
    button.addEventListener('click', () => {
      const language = normalize(button.getAttribute('data-lang'));
      if (!isSupported(language) || language === currentLanguage) return;
      changeLanguage(language, { store: true, updateUrl: true, announce: true });
    });
  });

  window.SummerAvenueI18n = {
    t: translate,
    getLanguage: () => currentLanguage,
    changeLanguage,
    getLanguages: () => SUPPORTED.slice()
  };

  init();
})();
