<div align="center">

# SUMMER AVENUE

**The 2026 album by Rubar**

サマー・アベニュー · 11 tracks · 46:05 · Japanese / English

**[▶ Listen to the album](https://rouslanbaranov.github.io/summer-avenue/)**

</div>

[![Summer Avenue — the yellow hero poster](docs/preview-desktop.jpg)](https://rouslanbaranov.github.io/summer-avenue/)

[Desktop](docs/preview-desktop.jpg) · [Mobile](docs/preview-mobile.jpg) · [Tablet](docs/hero-tablet.jpg)

## The record

The official album site streams the full record in order, with a custom player, a 15-second film, and the story behind the record. Eleven city-pop songs for the long way home.

| # | 日本語 | English | Time |
|---:|---|---|---:|
| 01 | もう少しそばにいて | Stay With Me | 4:54 |
| 02 | 春の歌 | Leise zieht | 3:34 |
| 03 | サマー・アベニュー | Summer Avenue | 3:48 |
| 04 | 身体と勇気の体操 | Reboot | 3:15 |
| 05 | 君の愛以外 | Lilichka | 3:30 |
| 06 | 遠くで | Arigato | 3:32 |
| 07 | アナスタシア | Anastasia | 3:50 |
| 08 | 風に乗せたメッセージ | Crossing Into Tomorrow | 4:53 |
| 09 | シャガネ、愛しいシャガネ | Shagane | 4:14 |
| 10 | 海へ行こう | June Ease | 5:04 |
| 11 | 今夜だけはさよならを言わないで | Blue Tile Reflections | 5:30 |

**Runtime:** 46:05 · **Catalogue:** RB–001 · **Year:** 2026

## Stack

A deliberately simple static site — no framework, no bundler, no build step.

- **HTML5** with semantic landmarks, ARIA, and `MusicAlbum` JSON-LD.
- **CSS3** with custom properties, Grid/Flexbox, fluid typography, and no dependencies.
- **Vanilla JavaScript** for the custom audio player, film player, mobile menu, reveals, and share action.
- **Audio:** native `HTMLAudioElement` + **Media Session API**; full-album stream, seek, next/previous, volume, auto-advance.
- **Video:** native HTML5 video with custom controls and a poster.
- **Fonts:** Archivo Black, Dela Gothic One, Space Grotesk, Noto Sans JP (Google Fonts).
- **Hosting:** GitHub Pages, deployed with GitHub Actions.
- **QA:** Playwright + Chromium; axe-core reports **0 WCAG A/AA violations** at desktop, mobile, playing, and open-menu states. The two remaining incomplete checks are the contrast-over-grain/media heuristic and the approved film having no separate captions track.

No analytics, no cookies, no tracking. The only third-party request is Google Fonts.

## Visual system

The palette is documented in `assets/css/styles.css`:

- **Ink + cream** — paper and night surfaces, primary text.
- **Sunset orange** — the album's dusk and the primary playback action.
- **Editorial red** — the hero marker, active indicators, the interlude seal, the quote mark.
- **Paper yellow** — the hero field, printed labels, tape, and the secondary **Play all** action.
- **Cobalt blue** — the film chapter, the hero's left edge, and the interlude's offset shadow.

![Summer Avenue — the interlude](docs/interlude-desktop.jpg)

The first screen is an all-yellow Japanese-release poster. It uses the supplied **black Hamamatsu hero portrait** (1024×1536), cropped to a 600×700 head/shoulder portrait and matted against the yellow with no card, sleeve, vinyl, or frame. The Japanese title is live HTML in Dela Gothic One (`lang="ja"`); the English title is the second level; the portrait, title, and **Play the album** action share the first screen.

The Record shows the new official cover flat — the 1254×1254 artwork has no Rubar wordmark; a hairline border and plain metadata are the only framing. The interlude remains the single collage accent: one diagonal red plane, a blue edge, the Japanese title, and the top-left front face from the new **4-face Hamamatsu sheet**, cropped and converted to B&W, captioned `RUBAR / 2026`. The Notes portrait remains the yellow-shirt portrait, with its `Hamamatsu` mark locally reduced.

## Project structure

```text
.
├── index.html
├── assets/
│   ├── audio/              # 11 × 320 kbps MP3 website streams
│   ├── css/styles.css
│   ├── img/                # cover, black hero portrait, sheet crop, yellow portrait, poster, icons, og
│   ├── js/main.js
│   └── video/              # 15s film, 720×1280 H.264
├── docs/                   # README previews + section screenshots
├── tools/og.html           # source for the social preview
├── .github/workflows/pages.yml
├── site.webmanifest
├── robots.txt
├── sitemap.xml
└── .nojekyll
```

The repository intentionally includes the **320 kbps website masters** (106 MB). FLAC and WAV distribution masters are not committed; keep those in the mastering pipeline or a distributor package.

## Local development

```bash
# From the repository root
npx http-server -p 8765 -c-1 .
# then open http://127.0.0.1:8765/
```

> Use a range-capable server for audio testing. Python's built-in `http.server` does not support HTTP Range requests, so **seeking** in the player may fail locally even though it works on GitHub Pages. `http-server` supports ranges.

To preview the social card:

```bash
# with the server running
open http://127.0.0.1:8765/tools/og.html
```

## Editing content

- **Track list:** the 11 `.track` elements in `index.html`. Each button carries `data-src` and `data-duration`; the Japanese title is `.track__ja`, the English title is `.track__en`, and the romanization is `.track__romaji`. Keep the JSON-LD block and durations in sync.
- **Copy and sections:** `index.html`.
- **Palette, type, layout:** `assets/css/styles.css`.
- **Player behaviour:** `assets/js/main.js`.
- **Cover / hero cutout / portrait / poster:** `assets/img/` — the hero uses `hero-rubar-black.png` with a `hero-rubar-black.webp` source; the collage uses the 660×470 `character-black-2026` crop. The full sheets are not shipped as web assets.
- **Film:** `assets/video/summer-avenue-film.mp4`, with `assets/img/film-poster.jpg`.
- **Streaming / social / store links:** not wired yet. Add them to the outro section when the album is live on platforms. Release date is shown as **2026** only; update if a specific date is set.
- **Custom domain:** add a `CNAME`, then update the canonical URL, Open Graph image URL, sitemap, and robots sitemap line.

## Deployment

Every push to `main` deploys the site through **GitHub Actions → GitHub Pages** (`.github/workflows/pages.yml`).

In the repository settings, **Pages → Build and deployment → Source** must be **GitHub Actions**. The workflow uploads the repository root as the Pages artifact, then deploys it.

Live URL: **https://rouslanbaranov.github.io/summer-avenue/**

## Accessibility

- Skip link, visible focus states, semantic landmarks, and labelled controls.
- Full keyboard support for the player, film, menu, and all actions.
- `prefers-reduced-motion` disables the hero entrance, the interlude seal, and all reveals while keeping the full composition visible.
- One semantic `H1` contains both the Japanese and English album title; decorative repeats are hidden from assistive technology. The Japanese title uses `lang="ja"` and Dela Gothic One with a full katakana/long-vowel set.
- Accessible track names include the visible number, Japanese title, English title, romanization, and duration.
- Play/pause states are reflected with `aria-pressed`, and track changes are announced politely.
- Metadata labels use a larger, higher-contrast scale; focus is a dual ink/yellow ring; primary touch targets are 44 px or larger. The hero portrait has a descriptive alt and fixed dimensions, and is loaded eagerly with `fetchpriority="high"`.
- The interlude's seal motion and all existing motion are disabled by `prefers-reduced-motion`.

## Credits & rights

Music, artwork, film, and character sheets: **Rubar**, 2026. The hero uses the supplied black Hamamatsu hero portrait; the interlude uses the top-left front of the new 4-face sheet; the Notes portrait remains the yellow-shirt version.

© 2026 Rubar. All rights reserved. The music, cover artwork, portrait, and film may not be reproduced or redistributed without permission. The repository contains the website versions of the mastered recordings; it is not a grant of rights to the recordings or artwork.
