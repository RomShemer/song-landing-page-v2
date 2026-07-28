# EPK Project — Plan, Status and Notes

Last updated: 2026-07-25 · Branch `feat/epk-upgrade` · 44 commits · `main` untouched

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
| 2 | Backend — KV, Blob, auth, tracking | **Done** |
| 4 | Deploy, perf/a11y pass, cleanup | **4.2 + 4.3 done; deploy is yours** |

Phases 2 and 3 were deliberately swapped: the dashboard was built first so its
design could be reviewed before wiring a backend to it.

**What works right now:** the whole thing, locally. Publishing, login, tracking,
statistics and uploads all run against the real routes under `npm run dev` — a
dev-only Vite plugin (`vite-plugins/dev-api.js`) runs the `api/` handlers inside
the dev server, so the Vercel CLI is not needed to exercise them.

**What is left:** only the deploy itself — creating the two stores and setting
the env vars in Vercel (4.1). Until a KV store is linked, the API
keeps content and counters in process memory: everything behaves correctly and
nothing survives a restart, which is deliberate.

**The two secrets** `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are set in
`.env.local` for development only (see `.env.example`). Production values are
yours to set in the Vercel dashboard. With either missing the dashboard opens
unauthenticated rather than showing a login form that cannot succeed — so they
are what makes `/admin` private, and 4.1 is not done until they are set.

---

## Architecture

**Stack.** Vite 7 + React 19, plain JS. Tailwind v4. Runtime dependencies are
`react`, `react-dom`, `react-icons` and `@vercel/blob` — no router, no chart
library, no component library, no state library, and no KV or auth client: the
API talks to KV over its REST endpoint and signs its own cookie.

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
theme     accent, playerStyle,
          title{font,weight,letterSpacing,sizeMin,sizeFluid,sizeMax,align,
                transform,color,show,gapAbove,gapBelow},
          subtitle{font,weight,letterSpacing,size,color,show},
          sections{font,weight,size,color,panelColor,panelOpacity,borderColor,
                   borderOpacity,radius,gap,padding,iconTint},
          body{font,size,color},
          cover{width,radius,blur,brightness,position,shadow},
          layout{maxWidth,blockGap,topSpace},
          background{opacity,blur,size,position,overlay}
media     coverImage, backgroundImage, showCover, audioStreamUrl, videoUrl
links     spotify, appleMusic, youtube, tiktok, instagram
content   prText, prHtml, lyrics
credits   [{role, name}]
downloads mp3Url, wavUrl, showMp3, showWav, pressPdf, imagesZip,
          pressImages[], labels{wav,mp3,pressPdf,gallery,imagesZip}
contact   phone, email
flags     downloadsLocked, lockedMessage
```

**Content loading.** `/` and `/song` are served by `api/page.js`, an edge function
that fetches the built `index.html` and inlines the published document into it as
`window.__EPK_CONTENT__`, rewriting `<title>` and the OG/Twitter tags on the way
through. `useContent()` reads that synchronously, so **the first painted frame is
already the real content** — previously the defaults painted first and the real
document replaced them a frame later, which showed the previous song title and
artwork to every visitor. Without the inlined document (the dashboard, a local
`vite preview`, a KV outage) the fetch path still runs, so nothing depends on it.

`GET /api/content` answers **204**, not an empty document, when nothing has been
published — a blank document would merge its empty strings over the defaults and
wipe the page, and a 404 would put a console error in front of every visitor to a
fresh deploy.

**Theming.** The client's choices become CSS custom properties on the page root
(`src/theme.js`). Tailwind's accent utilities compile to `var(--color-accent-N)`
lookups, so overriding those variables retints every surface at once with no
per-component wiring.

---

## Bundle

| | gzipped |
|---|---|
| Public page JS | ~86 kB |
| Public CSS | ~10 kB |
| Admin chunk (separate) | ~45 kB |

The 2.2 MB `background.jpg` Vite used to bundle on every build is gone — it was
imported by the deleted `App.css`.

The admin chunk grew from 17 kB when uploads landed: `@vercel/blob`'s browser
client is ~28 kB gzipped, and it brings automatic multipart uploads, which is
what makes a 100 MB master over hotel wifi survive. It is lazy-loaded behind the
password, and the public bundle is untouched.

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
| 1.3 | UI primitives | IconButton, Modal, Accordion, ScrollArea (GlassCard was written and never used; deleted in 4.3) |
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
password and for rate limiting, and it hides the dashboard until
`/api/auth/session` confirms a valid cookie. It enforces as of 2.3, with one
deliberate exception: if the endpoint reports `configured: false`, meaning the env
vars are unset, the gate opens rather than presenting a form no password can
satisfy. A logout button sits at the end of the tab bar, shown only when a session
is configured.

**Top — distribution card.** Song identity plus two "generate link" buttons. Each
reveals its URL with a copy button (confirms with a check) and an open-in-new-tab
shortcut. Full link and `?listen_only=true`.

**Tab 1 — תוכן ועיצוב.** Nine collapsible sections in page order, the first open
on load:

1. **הגדרות כלליות** — title, artist, year, accent colour, player style, background
   and cover uploads, plus three design groups: **background** (brightness,
   overlay, blur, fit, position), **cover art** (size, position, corners,
   brightness, blur, shadow) and **page frame** (max width, gap between blocks,
   space above the title)
2. **גופנים וטיפוגרפיה** — four inner tabs, each affecting only its own element:
   song title / artist name / section headings / body copy. Font, weight, size,
   tracking **and colour** per group; the title and artist each have a
   show/hide switch and the title owns the spacing either side of it; the
   sections tab also carries the accordion's own design — panel colour and
   opacity, border colour and opacity, corner radius, gap between cards, inner
   padding and icon tint
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

## Phase 2 — Backend · Done

Every route is a Web-standard `Request → Response` handler declared
`runtime: 'edge'`, which is also what lets the dev plugin run them unchanged.

| # | Task | Notes |
|---|---|---|
| 2.1 | `api/_lib/`: kv, http, day bucketing, event allowlist, session, ratelimit | 31 vitest cases |
| 2.2 | `GET /api/content` | edge, `s-maxage=60` + SWR, `?fresh=1` bypasses |
| 2.3 | `/api/auth/{login,session,logout}` | signed cookie, 8 attempts / 15 min |
| 2.4 | `PUT /api/content` | authed, through `normalizeContent`, versioned + backup |
| 2.5 | `POST /api/track` + `src/utils/analytics.js` rewired | plus the listen-time event the player never sent |
| 2.6 | `GET /api/stats` | authed, one pipeline, zero-filled |
| 2.7 | `POST /api/blob/upload-token` + real uploads in `MediaField` | folder decides the limits |

`@vercel/kv` was **not** installed. KV's REST endpoint is nine commands and a
bearer token, so `api/_lib/kv.js` calls it directly: no dependency, identical
behaviour on edge, and room for the in-memory fallback that makes dev work
offline. Only `@vercel/blob` (real signing work) and `vitest` were added.

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

### The listen-time event, now sent

`useAudioPlayer` accumulates wall-clock time actually spent playing — pauses and
seeks do not inflate it — and reports it over `sendBeacon` **whenever the page
stops being watched**: `visibilitychange` to hidden as well as `pagehide`.

It reported only on `pagehide` at first, which was wrong in the most ordinary
way possible: that event does not fire on a tab switch, so listening on `/song`
and then flipping to `/admin` in another tab reported nothing at all — which is
exactly how anyone checks their own numbers, and how it was caught. Flushing on
hidden means a visitor who tabs away and comes back produces two shorter
measured listens instead of one long one; the seconds still add up for the
average, and losing the report entirely was far worse. Reporting on every
*pause* would have been worse again.

`play_audio` also moved from the toggle button to the media element's `play`
event, so a play started by the keyboard or the OS media keys counts.

Consequence to know: `onListened` must be a stable reference. It is a module-level
function today; an inline arrow would re-run the effect and flush early.

---

## Phase 4 — Ship · 4.2 and 4.3 done, 4.1 is yours

| # | Task | Status |
|---|---|---|
| 4.1 | Create the KV and Blob stores, set `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET`, deploy, upload the masters through `/admin`, decommission Netlify | **With you** |
| 4.2 | Perf and a11y pass, Lighthouse mobile ≥ 90 | **Done** — 97 / 100 / 100 / 100 |
| 4.3 | Cleanup, README | **Done** |

Nothing in 4.1 is a code change — it is dashboard configuration. Linking the two
stores injects `KV_REST_API_URL`, `KV_REST_API_TOKEN` and
`BLOB_READ_WRITE_TOKEN` automatically; `vercel env pull .env.local` brings them
down for local work against the real stores.

### 4.2 — what was measured and what was done

Production build, mobile, simulated throttling. Baseline **97 / 100 / 96 / 91**
with FCP 1.4s, LCP 2.6s, TBT 0ms, CLS 0. After: **97 / 100 / 100 / 100**.

- **SEO 91 → 100.** `/robots.txt` was answered by the SPA rewrite with
  `index.html`, so a crawler read 31 lines of HTML as directives. A real one now
  ships and disallows `/admin`.
- **Best practices 96 → 100.** An unpublished document answered `404`, which put a
  red console error in front of every visitor for the normal state of a fresh
  deploy. It answers `204` now.
- **Security headers** (listed under 4.1, but they are code): HSTS two years with
  `includeSubDomains`, `X-Frame-Options: SAMEORIGIN`. The only iframe in the
  project is our own YouTube embed.
- **Accessibility beyond the automated 100**, by keyboard: every control reachable
  with a visible 2px ring, tab order in reading order, accordions with
  `aria-expanded` and a real `aria-controls` target, the downloads modal trapping
  focus and closing on Escape, the seek slider carrying `aria-valuetext`
  ("0:00 מתוך 2:37"), the volume slider expanding on `focus-within` and answering
  arrow keys, one `main`, one `h1`, `prefers-reduced-motion` honoured. Nothing to
  fix.

Measured and deliberately **not** done: the admin's utility classes in the public
stylesheet are 2.6 kB of 57 kB raw, so splitting the CSS is not worth the risk;
43 kB of the 86 kB JS is "unused" at first paint, which is what an SPA looks like;
and no CSP, because a correct one has to account for Google Fonts and inline style
attributes and a wrong one breaks the page silently.

### The one perf item left, and it belongs to 4.1

The LCP element is the hero's ambient glow, a CSS background built from
`press-official.jpg`, and Lighthouse offers 88 KiB for serving it as WebP/AVIF.
There is no image tooling in this repo and none was added for a one-off
conversion, because the assets are about to be replaced anyway: **when you upload
the real press images in 4.1, resize them first.** `press-03.jpg` is 6.3 MB and
`press-01/02` are 2.3 MB each — the gallery displays the same file it offers for
download, so a 6 MB photo is 6 MB on screen. Around 2000px on the long edge at
quality 80 is plenty for both uses. `public/media` is 26 MB today, which is 26 MB
in every deploy.

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
- **`downloadUrl()` exists because the `download` attribute is same-origin only.**
  Once the masters moved to Blob, clicking a download opened the file in the tab —
  an audio player instead of a save dialog. `?download=1` makes Blob answer with
  `Content-Disposition: attachment`, and it is the only thing that works: a proxy
  cannot pass a 43 MB body through a function.
- **The document owns the design, so nothing about it is hardcoded.** Fifty-odd
  theme fields drive CSS custom properties (`src/theme.js` → `src/index.css`), and
  a hardcoded Tailwind colour or size in a component silently beats its variable —
  which is exactly how `text-white` and `text-neutral-300` made the first colour
  pickers do nothing. If a control appears not to work, look for a utility class
  winning over the variable before looking anywhere else.
- **`api/page.js` is what makes the first paint correct**, and the rewrites in
  `vercel.json` are what point `/` and `/song` at it. Remove either and the page
  still works — it just goes back to flashing the previous song for a frame, and
  link previews go back to the literals in `index.html`.
- **The dev plugin must load `_lib/content.js` through `ssrLoadModule`**, not a
  plain `import()`. A plain import gets its own module instance, and with the
  in-memory KV fallback that means its own empty store — the injection silently
  did nothing until this was fixed.
- **Backdrop legibility is a floor, not a hope.** `theme.background.overlay` is
  what keeps text readable over any artwork. At the defaults, over a pure white
  patch of photo, the title holds 9.3:1 and body copy 6.3:1. Lower the overlay far
  and that guarantee goes with it.
- **`normalizeContent` reads the old flat `titleFont`/`bodyFont` keys** as a
  fallback, so a document saved before the per-element typography split keeps its
  fonts.
- **`apply: 'serve'` in `vite-plugins/dev-api.js`** for the same reason as the
  media plugin: on Vercel those files are the functions, and the plugin must not
  exist at build time.
- **The upload folder names in `MediaField.jsx` mirror `FOLDERS` in
  `api/blob/upload-token.js`.** The folder is what selects the size and content-type
  limits, and an unknown one is refused, so a rename in one place breaks uploads.
- **`api/_lib/` is shared code, not routes** — Vercel excludes underscore-prefixed
  files, the dev plugin skips them explicitly, and the client imports `schema.js`
  from there through `@schema`.
- **Tracking is disabled on `/admin` and on `?preview=1`** inside
  `src/utils/analytics.js`. The dashboard renders the real page in its preview;
  without that check every edit session would inflate the artist's numbers.
- **A missing `ADMIN_SESSION_SECRET` must lock, not unlock**, in `api/_lib/auth.js`
  — `isAdmin` returns false. The *client* gate opens in that state, which is a
  usability choice about a form that cannot succeed; the server never does.

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
- `src/utils/analytics.js` sent every event to `window.gtag`, which **has not
  existed since 0.1 removed GA4** — so nothing was being measured at all.
- Opening the photo picker counted as a photo download.
- `play_audio` fired only from the player's own button, so a play started any other
  way was invisible.

### Conventions

- **Comments only where the code can't explain itself**, or to flag something
  future-facing. Reasoning goes in the commit message. Each one marks something a
  reader could plausibly "tidy up" and break.
- One commit per task; every commit states what was verified.
- `npx eslint .` is clean and `npm test` (vitest) passes. Verification is by
  driving the real app in a browser (Playwright) and by exercising the real
  endpoints, not by assuming — the endpoint checks above were run against the dev
  server, including the 401/405/400/429 paths, not only the happy ones.
- **Pure logic is unit-tested; I/O is verified by driving it.** The tests cover the
  signing, the day maths, the event allowlist and the KV command layer — the parts
  where being wrong is silent. Everything else was checked end to end.

### Chart colours are validated, not chosen by eye

Both charts' palettes were run through a validator for lightness band, chroma
floor, colourblind separation, normal-vision separation and contrast against their
surface. The engagement chart uses five categorical hues (worst adjacent CVD ΔE
9.1); the duration chart uses a single-hue **ordinal** ramp because its buckets are
ordered, not independent series. Three categorical slots fall under 3:1 contrast on
white, which is why the legend and the table view exist.

### Open questions / small things

- `downloads.labels.pressPdf.subtitle` read `'PDF לחץ להורדת'`, which scans oddly.
  Changed in 4.3 to `'קובץ PDF'`, matching its siblings, which are short noun
  phrases ('איכות מלאה', 'סט תמונות', 'ZIP') rather than instructions. It is
  default content, so it is editable in the dashboard if you want different words.
- The desktop preview renders small inline because a 1440×900 viewport has to fit
  the column; the expand button is the answer.
- Cover art is off by default (`media.showCover: false`) with the release photo as
  the background. Flip it once there's square artwork.
- Accent default is `#d99a4e` (warm gold), chosen to suit the current artwork.
- **A publish can take up to 60s to appear** on the public page: `GET /api/content`
  is CDN-cached for a minute. The dashboard's own preview and `?fresh=1` are
  immediate. Shortening it costs cache hits on every visit; leave it unless it
  annoys you during a launch.
- **Rate limits key on `x-forwarded-for`**, which Vercel always sets. Locally there
  is no such header, so every caller shares one bucket named `unknown` — eight
  wrong dev logins locks the whole machine out for 15 minutes. Restarting the dev
  server clears it, along with the rest of the in-memory store.
- **`npm audit` reports 10 vulnerabilities**, all in the dev toolchain (vite,
  rollup, eslint's minimatch/js-yaml chain). None reach the built site. Predates
  this phase.
- Backups are written (`content:backup:<version>`, 30 days) but nothing reads them
  yet — restoring is a `SET` away if a bad publish ever needs undoing.
