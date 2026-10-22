<div align="center">

# SUMMER AVENUE

**The 2026 album from Project Hamamatsu**

サマー・アベニュー · 11 tracks · 46:05 · Japanese / English

**[▶ Listen to the album](https://rbaranov.ch/hamamatsu)**

</div>

[![Summer Avenue — the yellow hero poster](docs/preview-desktop.jpg)](https://rbaranov.ch/hamamatsu)

[Desktop](docs/preview-desktop.jpg) · [Mobile](docs/preview-mobile.jpg) · [Tablet](docs/hero-tablet.jpg)

## The record

The official album site streams the full record in order, with a custom player, a 30-second film, and the story behind the record. Eleven city-pop songs for the long way home.

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
- **Hosting:** Vercel, deployed from the `main` branch of `rouslanbaranov/hamamatsu`.
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

The first screen is a split Japanese-release poster: saturated yellow behind the full-height portrait on the left, and a warm white-pink field with one large powder-pink circle behind the type on the right, joined by a subtle 7–10° diagonal. The supplied **black Hamamatsu hero portrait** (1024×1536) is fully contained and uncropped, with no card, sleeve, vinyl, or frame. The header uses the new geometric **H** mark and the supplied “Hamamatsu” wordmark in Helvetica Neue/Arial Bold, matching the tight neo-grotesque print on the shirt. A 24–32px desktop gutter keeps the Japanese title entirely on the rose field, and a live **’80s-style City Pop** accent in Sedgwick Ave Display sits immediately right of the English title, vertically centred on the two-line block with a 20–26px gutter, and wraps beneath it only when space is tight. The Japanese title is live HTML in Dela Gothic One (`lang="ja"`); the English title is the second level. The film player returns to its poster and **PLAY THE FILM** after a natural ending; a mid-film pause keeps its frame and position.

The Record shows the new official cover flat — the 1254×1254 artwork has no artist wordmark; a hairline border and plain metadata are the only framing. The interlude remains the single collage accent: one diagonal red plane, a blue edge, the Japanese title, and the top-left front face from the new **4-face Hamamatsu sheet**, cropped and converted to B&W, captioned `Hamamatsu / 2026`. The Notes media is now an original anime-style city avenue at dusk — a huge setting sun, overhead wires, neon shop signs, and no portrait.

## Project structure

```text
.
├── index.html
├── assets/
│   ├── audio/              # 11 × 320 kbps MP3 website streams
│   ├── css/styles.css
│   ├── img/                # cover, black hero portrait, sheet crop, yellow portrait, poster, icons, og
│   ├── js/main.js
│   └── video/              # 30s film, 720×1280 H.264
├── docs/                   # README previews + section screenshots
├── tools/og.html           # source for the social preview
├── vercel.json
├── scripts/build.mjs
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

### Social preview

The card is a 1200×630 capture of the homepage hero with the header hidden and the left blue edge removed, `assets/img/og-summer-avenue-home-2026.jpg`, used for both `og:image` and `twitter:image`. Re-capture it at 1200×630 with reduced motion enabled when the hero changes. `tools/og.html` is the earlier hand-built card, kept for reference.

Previews are cached per URL. After replacing the image, re-scrape with the Facebook Sharing Debugger or LinkedIn Post Inspector.

## Editing content

- **Track list:** the 11 `.track` elements in `index.html`. Each button carries `data-src` and `data-duration`; the Japanese title is `.track__ja`, the English title is `.track__en`, and the romanization is `.track__romaji`. Keep the JSON-LD block and durations in sync.
- **Copy and sections:** `index.html`.
- **Palette, type, layout:** `assets/css/styles.css`.
- **Player behaviour:** `assets/js/main.js`.
- **Cover / hero cutout / portrait / poster:** `assets/img/` — the hero uses `hero-portrait-black-full.png` with a `hero-portrait-black-full.webp` source and no crop; the collage uses the 660×470 `character-black-2026` crop. The full sheets are not shipped as web assets.
- **Film:** `assets/video/summer-avenue-film-30s.mp4`, with `assets/img/film-poster.jpg`.
- **Streaming / social / store links:** not wired yet. Add them to the outro section when the album is live on platforms. Release date is shown as **2026** only; update if a specific date is set.
- **Custom domain:** add a `CNAME`, then update the canonical URL, Open Graph image URL, sitemap, and robots sitemap line.

## Deployment

Every push to `main` deploys the site through **GitHub Actions → GitHub Pages** (`.github/workflows/pages.yml`).

In the repository settings, **Pages → Build and deployment → Source** must be **GitHub Actions**. The workflow uploads the repository root as the Pages artifact, then deploys it.

Live URL: **https://rbaranov.ch/hamamatsu**

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

Music, artwork, film, and character sheets: **Project Hamamatsu**, 2026. The hero uses the supplied black Hamamatsu hero portrait; the interlude uses the top-left front of the new 4-face sheet; the Notes section uses an original city-avenue illustration.

© 2026 Project Hamamatsu. All rights reserved. The music, cover artwork, portrait, and film may not be reproduced or redistributed without permission. The repository contains the website versions of the mastered recordings; it is not a grant of rights to the recordings or artwork.


## Vercel and portfolio routing

Production URL: https://rbaranov.ch/hamamatsu

This repository is an independent copy of `rouslanbaranov/summer-avenue`, including its Git history. The original GitHub Pages site is unchanged.

Vercel runs `node scripts/build.mjs` and publishes only `dist/`. No framework migration or dependency installation is required. Assets use the `/hamamatsu/` namespace so the page works with or without a trailing slash and cannot collide with the portfolio assets. The child Vercel project also maps `/hamamatsu/*` to its static output for direct preview testing.

The portfolio Next.js project owns `rbaranov.ch` and rewrites `/hamamatsu` and `/hamamatsu/*` to this project's stable production origin. Keep that origin public and use the stable production alias, never a per-commit preview URL. The domain remains attached to portfolio; DNS changes are not needed.

Deploy and verify the child project before changing the portfolio rewrite. Roll back by restoring the previous portfolio configuration; both projects can be rolled back independently. Audio/video range requests must return 206 through the public path.
