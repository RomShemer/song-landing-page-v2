# Where the audio masters live

The MP3 and WAV are rights-sensitive. They are **never committed to git**, but
they still need to be reachable on the deployed site. Those are two different
problems with two different answers.

## Local development

Put the files in `local-media/` at the repo root:

```
local-media/
  רוצי.mp3
  רוצי - דור שמר.wav
```

Then point the player at one in `.env.local` (also git-ignored):

```
VITE_DEV_AUDIO_URL=/local-media/רוצי.mp3
```

Restart `npm run dev` and the player appears.

**Why not `public/`?** Everything in `public/` is copied verbatim into `dist/`
at build time, so a master parked there gets published the next time anyone
deploys — and `.gitignore` gives no protection against that, because it only
governs git. `local-media/` is served by a Vite plugin declared
`apply: 'serve'`, which means the plugin does not exist during a build. The
files are unreachable from a production bundle by construction, not by
remembering to remove them.

Verified: `dist/` contains no `.mp3` or `.wav` after `npm run build`, and the
dev route rejects path traversal (`/local-media/../../.env.local` → 403).

Range requests are supported, so seeking a 100 MB WAV works locally the same
way it will in production.

## Production

The files are uploaded once through the admin dashboard
(`/admin` → Content → audio uploaders). They go **straight from the browser to
Vercel Blob** — the serverless function only mints a scoped upload token, which
is what makes a 100 MB WAV possible at all (a serverless request body caps at
4.5 MB, so a server-side passthrough could not work).

What ends up in git is only the resulting URL's *presence* in KV, not the file:

```
Browser ──upload──> Vercel Blob (CDN)
   │                     │
   └──> /api/content ────┘  stores downloads.wavUrl = "https://<...>.blob.vercel-storage.com/..."
```

So: served fast from a CDN, present on the live link, and absent from the
repository. The same applies to the cover image and the background image.

## Summary

| | Local dev | Production |
|---|---|---|
| Where the file sits | `local-media/` | Vercel Blob |
| How it is served | Vite dev plugin, `apply: 'serve'` | Blob CDN |
| In git? | No (`.gitignore`) | No (never touches the repo) |
| In `dist/`? | No (plugin absent at build) | No (URL only) |
| Configured by | `VITE_DEV_AUDIO_URL` | Admin dashboard upload |
