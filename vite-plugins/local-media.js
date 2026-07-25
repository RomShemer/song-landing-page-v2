import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const MIME = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.flac': 'audio/flac',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/**
 * Serves ./local-media at /local-media during `vite dev` only.
 *
 * The point is that rights-sensitive masters never sit in public/: that folder
 * is copied verbatim into dist/ on build, so a file parked there would be
 * published the next time anyone deploys. `apply: 'serve'` means this plugin
 * does not exist during a build, which makes that mistake impossible.
 *
 * Range requests are honoured because browsers seek audio with them — without
 * that, dragging the progress bar on a large WAV fails.
 */
export default function localMedia({ dir = 'local-media', route = '/local-media' } = {}) {
  const root = resolve(process.cwd(), dir);

  return {
    name: 'local-media-dev-only',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use(route, (req, res, next) => {
        const rel = normalize(decodeURIComponent(req.url.split('?')[0]));

        // Reject traversal: the resolved path must stay inside root.
        const file = join(root, rel);
        if (!file.startsWith(root)) {
          res.statusCode = 403;
          res.end('Forbidden');
          return;
        }

        let stat;
        try {
          stat = statSync(file);
        } catch {
          next();
          return;
        }
        if (!stat.isFile()) {
          next();
          return;
        }

        const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';
        res.setHeader('Content-Type', type);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-store');

        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
        if (range) {
          const start = range[1] ? Number(range[1]) : 0;
          const end = range[2] ? Number(range[2]) : stat.size - 1;

          if (start >= stat.size || end >= stat.size || start > end) {
            res.statusCode = 416;
            res.setHeader('Content-Range', `bytes */${stat.size}`);
            res.end();
            return;
          }

          res.statusCode = 206;
          res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
          res.setHeader('Content-Length', end - start + 1);
          createReadStream(file, { start, end }).pipe(res);
          return;
        }

        res.setHeader('Content-Length', stat.size);
        createReadStream(file).pipe(res);
      });
    },
  };
}
