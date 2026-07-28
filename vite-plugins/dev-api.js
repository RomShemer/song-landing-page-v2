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
  let server;

  return {
    name: 'dev-api',
    apply: 'serve',

    // Production serves the page through api/page.js, which inlines the
    // published document so the first paint is correct. Vite serves index.html
    // itself, so the same injection happens here — otherwise the flash of
    // default content would exist only locally and never be noticed again.
    async transformIndexHtml(html) {
      // Loaded through the dev server so it is the same module instance the
      // routes use. A plain import() would get its own copy — and its own empty
      // in-memory store, which is why this silently injected nothing at first.
      if (!server) return html;
      const { readContent } = await server.ssrLoadModule(resolve(root, '_lib/content.js'));
      const doc = await readContent().catch(() => null);
      if (!doc) return html;

      const json = JSON.stringify(doc)
        .replaceAll('<', '\\u003c')
        .replaceAll('\u2028', '\\u2028')
        .replaceAll('\u2029', '\\u2029');
      const title = [doc.song?.title, doc.song?.artist].filter(Boolean).join(' \u00b7 ');

      const [{ googleFontsHref }, { themeFontKeys }] = await Promise.all([
        server.ssrLoadModule('/src/fonts.js'),
        server.ssrLoadModule('/src/theme.js'),
      ]);
      const fonts = googleFontsHref(themeFontKeys(doc.theme || {}).filter(Boolean));
      const fontLink = fonts
        ? `<link id="dynamic-webfonts" rel="stylesheet" href="${fonts}">`
        : '';

      return html
        .replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
        .replace('</head>', `${fontLink}<script>window.__EPK_CONTENT__=${json}</script></head>`);
    },

    configureServer(devServer) {
      server = devServer;
      // Non-VITE_ variables stay out of import.meta.env by design; the routes
      // read them from process.env, so they are loaded here instead.
      Object.assign(process.env, loadEnv(devServer.config.mode, process.cwd(), ''));

      devServer.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const route = url.pathname.slice(dir.length + 2);
        const file = resolve(root, `${route}.js`);
        // `_lib` is shared code, not a route — Vercel excludes it by the same
        // underscore convention, and the client imports schema.js from there.
        if (route.split('/')[0].startsWith('_')) return next();
        if (!file.startsWith(root) || !existsSync(file)) return next();

        try {
          const module = await devServer.ssrLoadModule(file);

          // Mirror Vercel's dispatch: an edge function is called with a Web
          // Request, a Node one with (req, res) — which is what we already hold.
          if (module.config?.runtime !== 'edge') {
            await module.default(req, res);
            return;
          }

          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const request = new Request(url, {
            method: req.method,
            headers: req.headers,
            body: chunks.length ? Buffer.concat(chunks) : undefined,
          });

          const response = await module.default(request);

          res.statusCode = response.status;
          for (const [key, value] of response.headers) {
            if (key !== 'set-cookie') res.setHeader(key, value);
          }
          const cookies = response.headers.getSetCookie?.() || [];
          if (cookies.length) res.setHeader('set-cookie', cookies);

          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          devServer.config.logger.error(`dev-api ${route}: ${error.stack || error}`);
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: String(error.message || error) }));
        }
      });
    },
  };
}
