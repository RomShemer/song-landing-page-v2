# EPK Project — Plan, Status and Notes

Last updated: 2026-07-25 · Branch `feat/epk-upgrade` · 33 commits · `main` untouched

Turning a single-page song site into a two-part press kit: a public release page
for radio and press, and a private dashboard where the artist controls content,
design and analytics.

---

## Status at a glance

| Phase | Scope | Status |
|---|---|---|
| 0 | Foundations — document shell, routing, content model | **Done** |
| 1 | Public page — Tailwind rewrite, player, sections | **Done** |
| 1.9 | Design feedback rounds (7 rounds) | **Done** |
| 3 | Admin dashboard **UI** | **Done** |
| 2 | Backend — KV, Blob, auth, tracking | **Not started** |
| 4 | Deploy, perf/a11y pass, cleanup | **Not started** |

Phases 2 and 3 were deliberately swapped: the dashboard was built first so its
design could be reviewed before wiring a backend to it.

**What works right now:** the whole public page, and the whole dashboard as an
interface. Edits persist to `localStorage` and survive a reload.

**What does not work yet:** publishing, file uploads, real analytics numbers, and
login *enforcement* — the login screen exists and works, but the gate currently
opens on its own because there is no auth service to check against, so `/admin` is
effectively unprotected. All four need Phase 2. Each is one `fetch` call away — the UI already
calls the endpoints and degrades honestly when they 404.

---

## Architecture

**Stack.** Vite 7 + React 19, plain JS. Tailwind v4. Runtime dependencies are
still only `react`, `react-dom`, `react-icons` — no router, no chart library, no
component library, no state library.

**Routing.** A pathname switch in `src/routes.js`, not react-router: there are two
destinations. `/` and `/song` render the landing page; `/admin` is `React.lazy`'d so
its bundle never reaches a public visitor.

**Content model.** One JSON document validated by `normalizeContent()` in
`api/_lib/schema.js` — the single source of truth, imported by the API directly and
by the client through the `@schema` Vite alias so the two can never drift. Every
field the page renders lives in it; nothing about the page's content or look is
hardcoded in a component.

```
song      title, artist, releaseYear
theme     accent, playerStyle, title{font,weight,letterSpacing,sizeMin,sizeFluid,
          sizeMax,align,transform}, subtitle{...}, sections{...}, body{...}
media     coverImage, backgroundImage, showCover, audioStreamUrl, videoUrl
links     spotify, appleMusic, youtube, tiktok, instagram
content   prText, prHtml, lyrics
credits   [{role, name}]
downloads mp3Url, wavUrl, showMp3, showWav, pressPdf, imagesZip,
          pressImages[], labels{wav,mp3,pressPdf,gallery,imagesZip}
contact   phone, email
flags     downloadsLocked, lockedMessage
```

**Content loading.** `src/content/defaultContent.js` renders on first paint, then
`useContent()` fetches `/api/content` and merges it over the top. No spinner, and
the page stays fully usable if the API is unreachable.

**Theming.** The client's choices become CSS custom properties on the page root
(`src/theme.js`). Tailwind's accent utilities compile to `var(--color-accent-N)`
lookups, so overriding those variables retints every surface at once with no
per-component wiring.

---

## Bundle

| | gzipped |
|---|---|
| Public page JS | ~86 kB |
| Public CSS | ~9 kB |
| Admin chunk (separate) | ~17 kB |

The 2.2 MB `background.jpg` Vite used to bundle on every build is gone — it was
imported by the deleted `App.css`.

---

## Phase 0 — Foundations · Done

| # | Task | Notes |
|---|---|---|
| 0.1 | Document shell | `<html lang="he" dir="rtl">` (was `lang="en"`), OG/Twitter/theme-color, favicon, **GA4 removed** |
| 0.2 | Routing + code-split `/admin` + `vercel.json` | SPA rewrite uses a negative lookahead so `/api/*` isn't swallowed |
| 0.3 | Content document, `useContent`, shared validator | Replaced `src/artistData.js` |
| 0.4 | `useViewMode` | Reads `?listen_only=true` and legacy `?download=false` |
| 1.1 | ASCII media filenames | Hebrew names with spaces were an `encodeURIComponent` hazard |

---

## Phase 1 — Public page · Done

| # | Task | Notes |
|---|---|---|
| 1.2 | Tailwind v4 + design tokens | `src/index.css` was Vite's default and **never imported** by anything |
| 1.3 | UI primitives | GlassCard, IconButton, Modal, Accordion, ScrollArea |
| 1.4 | Hero + SocialRow | Ambient glow derived from the artwork itself |
| 1.5 | Custom audio player | Play/pause, seekable bar, duration, volume |
| 1.6 | Seven sections rewritten | Gallery, clip, press release, lyrics, credits, downloads, contact |
| 1.7 | `App.css` deleted | 807 lines of hand-written CSS removed |
| 1.8 | Listen-only mode | Hides every download affordance |

### Design feedback applied

- Accent colour, fonts and player style are **client settings**, not hardcoded
- Streaming action cards removed — the icon row already carried those links
- Icon order left-to-right: Spotify · Apple Music · YouTube · TikTok · Instagram
- Lyrics and press release scroll internally (26rem / 30rem) with a fade mask
- Credits regained hover treatment (lift, accent border, wash, rail)
- Downloads: two-column grid, icon on the reading edge, no pre-selected card,
  per-file show/hide switches, all card wording editable
- Gallery: photos shown **in full** at up to 70vh, frame sized to each photo
- Fullscreen hint appears on photo hover only, never over the arrows
- Photo and video frames rounded to 24px
- Player restyled to match the native control it replaced; white by default
- Title uses the supplied CSS: `clamp(3.5rem, 9cqw, 8rem)`, weight 200, 0.5em tracking

---

## Phase 3 — Admin dashboard UI · Done

`/admin`, light theme in blue and green, deliberately independent of the public
page's dark palette and of the client's accent.

**Login screen** (`src/admin/Login.jsx`) — password field, error states for a wrong
password and for rate limiting, and it hides the dashboard entirely until the
session check passes. **It is built but not enforcing.** `AdminApp` asks
`/api/auth/session`, and because that endpoint does not exist yet the `.catch`
opens the gate rather than locking you out of your own unfinished dashboard. So in
normal use you never see it. Stub the endpoint to `{authenticated: false}` and it
appears and works — verified: wrong password shows an error, correct password opens
the dashboard. Nothing is actually protected until Phase 2 (2.3) ships
`/api/auth/*` and the `ADMIN_PASSWORD` env var.

**Top — distribution card.** Song identity plus two "generate link" buttons. Each
reveals its URL with a copy button (confirms with a check) and an open-in-new-tab
shortcut. Full link and `?listen_only=true`.

**Tab 1 — תוכן ועיצוב.** Nine collapsible sections in page order, the first open
on load:

1. **הגדרות כלליות** — title, artist, year, accent colour, player style, background and cover uploads (cover visibility switch lives inside its uploader)
2. **גופנים וטיפוגרפיה** — four inner tabs, each affecting only its own element: song title / artist name / section headings / body copy. Font, weight, size and tracking per group
3. **קישורי סטרימינג ורשתות** — five platform cards with brand icons
4. **גלריית תמונות** — add, replace, remove photos; gallery card wording
5. **קליפ רשמי** — YouTube embed URL
6. **קומוניקט** — plain-text authoring, HTML generated from it as a template
7. **מילים** — lyrics
8. **קרדיטים** — kind + name pairs, add / remove / reorder, ten role suggestions
9. **תיקיית הורדות** — four files in a 2×2 grid, each with its own title, subtitle and visibility switch; plus the global lock and its message
10. **יצירת קשר** — phone, email

**Live preview**, beside the editor. Renders the *real* `App` component against the
draft, inside an iPhone or monitor shell, with a full/listen-only toggle, expand-to-
fullscreen, and pop-out to a real tab. Any edit briefly flashes the block it
affects.

**Tab 2 — נתונים.** Six stat tiles (views split full vs listen-only, plays,
cumulative and average listen time, WAV, MP3, press collateral), a stacked bar
chart of engagement per day with 7/30/90-day ranges and hover tooltips, a table
view, a listen-duration breakdown, and a per-section engagement list.

Tooltips explain every section and every icon-only action.

---

## Phase 2 — Backend · Not started

Design is settled; nothing is written. Needs `@vercel/kv`, `@vercel/blob`, `vitest`.

| # | Task |
|---|---|
| 2.1 | `api/_lib/`: kv, http helpers, date bucketing, event allowlist |
| 2.2 | `GET /api/content` (edge, CDN-cached, falls back to defaults) |
| 2.3 | Session crypto + `/api/auth/{login,session,logout}` + vitest for the signing — **this is what makes the existing login screen actually gate anything** |
| 2.4 | `PUT /api/content` (auth, validates through `normalizeContent`) |
| 2.5 | `POST /api/track` (edge) + rewire `src/utils/analytics.js` |
| 2.6 | `GET /api/stats` (auth, zero-filled series) |
| 2.7 | `POST /api/blob/upload-token` (auth) |

### KV schema

```
content:current            JSON string — the whole document
content:version            number, INCR per save
content:backup:<version>   30-day undo

stats:totals               hash: page_view, page_view:full, page_view:listen_only,
                           play_audio, listen_seconds, download_wav, download_mp3,
                           download_pdf, download_photos, listen_buckets:<bucket>,
                           social_click:<net>, accordion_open:<id>, contact_click:<type>
stats:daily:<YYYY-MM-DD>   same fields, Asia/Jerusalem days, 2-year TTL
stats:days                 zset for gap-free range queries
dedupe:<hash>              SET NX EX — 30min plays, 24h page views
ratelimit:login:<ip>       8 per 15 min
ratelimit:track:<ip>       60 per min
```

### Session design

HMAC-SHA256 over `{exp, iat}` via `crypto.subtle`, no auth dependency. Cookie
`ds_admin`, HttpOnly, Secure, SameSite=Lax, 12h. Env: `ADMIN_PASSWORD`,
`ADMIN_SESSION_SECRET`. Rotating the secret logs everyone out.

### Uploads

Browser → Vercel Blob **directly**, with the function only minting a scoped token.
A serverless request body caps at 4.5 MB and a broadcast WAV is 40–120 MB, so a
server passthrough cannot work.

### One event the player must start sending

The listen-duration chart needs elapsed time reported on pause/end, not just the
first play — `useAudioPlayer` currently reports only `play_audio`. The chart is
built against `totals.listen_buckets` and shows zeros until that lands.

---

## Phase 4 — Ship · Not started

| # | Task |
|---|---|
| 4.1 | Vercel deploy, seed KV, security headers, decommission Netlify |
| 4.2 | Perf and a11y pass, Lighthouse mobile ≥ 90 |
| 4.3 | Cleanup, README |

---

## Things to know

### Where the audio files live

Two different problems with two different answers — see `docs/media-files.md`.

- **Local dev:** `local-media/` at the repo root, pointed at by `.env.local`
  (`VITE_DEV_MP3_URL`, `VITE_DEV_WAV_URL`, `VITE_DEV_AUDIO_URL`). Both are
  git-ignored.
- **Production:** uploaded once through `/admin` to Vercel Blob. Only the URL is
  stored. On the live link, absent from the repo.
- **Not `public/`** — that folder is copied verbatim into `dist/` at build time, so
  a master parked there gets published by the next deploy, and `.gitignore` gives no
  protection because it only governs git. The Vite plugin serving `local-media/` is
  declared `apply: 'serve'`, so it does not exist during a build. Verified: no
  `.mp3`/`.wav` in `dist/`, and path traversal returns 403.
- `local-media/test-master.wav` is my 5 MB silent test file — safe to delete.

### Load-bearing details

- **`apply: 'serve'`** in `vite-plugins/local-media.js` is what keeps the masters
  out of `dist/`. Removing it publishes them.
- **`cqw`, not `vw`**, for the title size. Viewport units would size the title to
  the browser window, so the admin preview — which lays the page out at a device
  width inside a scaled box — would show a desktop-sized title on a simulated phone
  and lie about the result.
- **The accent ramp must stay CSS variables.** Inlining it into Tailwind's `@theme`
  as literals would make the colour uneditable.
- **The font key list in `api/_lib/schema.js` mirrors `src/fonts.js`** and must stay
  in sync; the schema validates against it so an unknown value can't reach the page
  as an arbitrary `font-family`.
- **Every font must carry Hebrew glyphs.** A Latin-only face renders the page in a
  fallback.
- **`normalizeContent` reads the old flat `titleFont`/`bodyFont` keys** as a
  fallback, so a document saved before the per-element typography split keeps its
  fonts.

### Bugs found and fixed along the way

Worth listing because several were mine, and a few predated this work:

- The public page had **always** rendered in the system font — the old CSS named
  Heebo but never loaded the webfont.
- `src/index.css` was never imported by anything.
- Every component taking an `icon={...}` prop was a **lint error on `main`**:
  `varsIgnorePattern` doesn't apply to destructured parameters.
- A `?listen_only=true` link rendered **no player at all** — the stream source was
  being withheld along with the downloads.
- The desktop preview rendered **nothing**: a 1440px page box inside an RTL
  container is right-aligned, so it started at −980px and laid out off-frame. The
  phone had the same bug at −93px, which was the sideways drift.
- The preview's scrollbar stole ~15px of viewport width from the page inside it.
- The sticky preview had **no travel** — `items-start` sized its grid cell to its
  own height — and rode up at the page bottom.
- The body-size slider did nothing: press release, lyrics and credits carried
  hardcoded `text-[15px]`.
- Every `theme` edit flashed the hero, including edits that changed something else.
- Download cards were described **twice** in two components with two different
  wordings — the mismatch that got spotted.

### Conventions

- **Comments only where the code can't explain itself**, or to flag something
  future-facing. Reasoning goes in the commit message. Six survive in `src/` +
  `api/`, each marking something a reader could plausibly "tidy up" and break.
- One commit per task; every commit states what was verified.
- `npx eslint .` is clean. Verification is by driving the real app in a browser
  (Playwright) and reading computed styles and geometry, not by assuming.

### Chart colours are validated, not chosen by eye

Both charts' palettes were run through a validator for lightness band, chroma
floor, colourblind separation, normal-vision separation and contrast against their
surface. The engagement chart uses five categorical hues (worst adjacent CVD ΔE
9.1); the duration chart uses a single-hue **ordinal** ramp because its buckets are
ordered, not independent series. Three categorical slots fall under 3:1 contrast on
white, which is why the legend and the table view exist.

### Open questions / small things

- `downloads.labels.pressPdf.subtitle` currently reads `'PDF לחץ להורדת'`, which
  scans oddly — probably meant `'לחץ להורדה'`. Left as set.
- The desktop preview renders small inline because a 1440×900 viewport has to fit
  the column; the expand button is the answer.
- Cover art is off by default (`media.showCover: false`) with the release photo as
  the background. Flip it once there's square artwork.
- Accent default is `#d99a4e` (warm gold), chosen to suit the current artwork.
