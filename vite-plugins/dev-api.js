import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';

// Runs the api/ routes inside the Vite dev server so `npm run dev` behaves like
// production without the Vercel CLI. They are Web-standard handlers, so this is
// only a Request/Response adapter around Node's req/res.
//
// `apply: 'serve'` — on Vercel the same files are the real functions.
export default function devApi({ dir = 'api' } = {}) {
  const root = resolve(process.cwd(), dir);

  return {
    name: 'dev-api',
    apply: 'serve',

    configureServer(server) {
      // Non-VITE_ variables stay out of import.meta.env by design; the routes
      // read them from process.env, so they are loaded here instead.
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''));

      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const route = url.pathname.slice(dir.length + 2);
        const file = resolve(root, `${route}.js`);
        // `_lib` is shared code, not a route — Vercel excludes it by the same
        // underscore convention, and the client imports schema.js from there.
        if (route.split('/')[0].startsWith('_')) return next();
        if (!file.startsWith(root) || !existsSync(file)) return next();

        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);

        const request = new Request(url, {
          method: req.method,
          headers: req.headers,
          body: chunks.length ? Buffer.concat(chunks) : undefined,
        });

        try {
          const module = await server.ssrLoadModule(file);
          const response = await module.default(request);

          res.statusCode = response.status;
          for (const [key, value] of response.headers) {
            if (key !== 'set-cookie') res.setHeader(key, value);
          }
          const cookies = response.headers.getSetCookie?.() || [];
          if (cookies.length) res.setHeader('set-cookie', cookies);

          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          server.config.logger.error(`dev-api ${route}: ${error.stack || error}`);
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: String(error.message || error) }));
        }
      });
    },
  };
}
