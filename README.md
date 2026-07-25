# רוצי · דור שמר — EPK

An electronic press kit for a single release: a public page for radio and press,
and a private dashboard where the artist controls its content, its design and its
analytics. Hebrew, right-to-left, mobile first.

Two surfaces, one content document:

| Route | What it is |
|---|---|
| `/` · `/song` | The public release page — player, clip, press release, lyrics, credits, downloads, contact |
| `/song?listen_only=true` | The same page with every download affordance removed, for sharing before release |
| `/admin` | Password-protected dashboard: edit content and design against a live preview, publish, and read engagement statistics |

## Run it

```bash
npm install
cp .env.example .env.local     # then fill in ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npm run dev                    # http://localhost:5173
```

`npm run dev` serves the API too — a dev-only Vite plugin runs the `api/`
handlers in-process, so publishing, login, tracking and statistics all work
without the Vercel CLI. With no KV credentials in the environment the API keeps
content and counters **in memory**: everything behaves correctly and nothing
survives a restart.

| Command | |
|---|---|
| `npm run dev` | Dev server, with the API attached |
| `npm test` | Unit tests (vitest) over the session signing, day bucketing, event allowlist, KV layer and content schema |
| `npm run lint` | ESLint |
| `npm run build` · `npm run preview` | Production build, and serve it (no API) |

## How it fits together

**One content document**, validated by `normalizeContent()` in
[`api/_lib/schema.js`](api/_lib/schema.js) — the single source of truth, imported
by the API directly and by the client through the `@schema` alias so the two
cannot drift. Every string, colour, font and URL the page renders lives in it;
nothing about the page's content or appearance is hardcoded in a component.

**The API** is seven Web-standard handlers under [`api/`](api), each declared
`runtime: 'edge'`:

| Route | |
|---|---|
| `GET /api/content` | The published document. CDN-cached; `204` when nothing is published yet |
| `PUT /api/content` | Publish. Authenticated, validated, versioned, previous version kept 30 days |
| `POST /api/auth/login` · `GET /api/auth/session` · `POST /api/auth/logout` | Signed-cookie session, no auth dependency |
| `POST /api/track` | Engagement events, allowlisted and deduped |
| `GET /api/stats` | Totals and a zero-filled daily series |
| `POST /api/blob/upload-token` | Mints a scoped token so the browser uploads to Blob directly |

Storage is Vercel KV over its REST endpoint, and Vercel Blob for files. Runtime
dependencies are `react`, `react-dom`, `react-icons` and `@vercel/blob` — no
router, no chart library, no component library, no state library, no auth or KV
client.

**Analytics are first-party.** Events go to `/api/track`, not to a third party, so
an ad blocker cannot hide the numbers from the artist. Page views collapse per
visitor per day, plays per half hour, and elapsed listening time is reported when
the page is hidden rather than only when it unloads.

## Deploying

1. Create a KV (Upstash Redis) store and a Blob store in Vercel and link both to
   the project — that injects `KV_REST_API_URL`, `KV_REST_API_TOKEN` and
   `BLOB_READ_WRITE_TOKEN`.
2. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`. **Do this before sharing the
   URL:** with either missing, `/admin` opens without asking for a password —
   deliberately, rather than presenting a form no password can satisfy. Rotating
   the secret signs everyone out.
3. Deploy, then open `/admin`, upload the masters and press assets, and publish
   once so KV holds a real document.

## Where the audio lives

Never in `public/` — that folder is copied verbatim into `dist/`, so a master
parked there gets published by the next deploy, and `.gitignore` does not help
because it only governs git. Masters live in `local-media/` for development
(git-ignored, served by a dev-only plugin) and in Vercel Blob for production. See
[`docs/media-files.md`](docs/media-files.md).

## More

[`docs/PROJECT-STATUS.md`](docs/PROJECT-STATUS.md) — the full picture: what was
built in what order, the design decisions and their reasons, the load-bearing
details that look like tidy-up opportunities but are not, and the bugs found
along the way.
