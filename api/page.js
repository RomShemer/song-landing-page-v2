import { readContent } from './_lib/content.js';
import { forMethod, isRead, methodNotAllowed } from './_lib/http.js';
import { googleFontsHref } from '../src/fonts.js';
import { themeFontKeys } from '../src/theme.js';

export const config = { runtime: 'edge' };

// Serves the landing page with the published document already inside it.
//
// Without this the browser painted src/content/defaultContent.js first and
// swapped in the real document a moment later, so every visitor saw the previous
// song title and artwork flash past. It also fixes link previews: WhatsApp and
// Twitter never run the JavaScript that used to set the title, so a shared link
// showed whatever was hardcoded in index.html.
//
// Cached at the edge like /api/content, so the KV read happens once a minute at
// most rather than once a visitor.
const CACHED = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'public, s-maxage=60, stale-while-revalidate=600',
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/** Safe to sit inside a <script> element: `</script>` cannot appear. */
const inlineJson = (doc) =>
  JSON.stringify(doc)
    .replaceAll('<', '\\u003c')
    // Valid in JSON, fatal in a <script>: both terminate a JavaScript line.
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');

function replaceMeta(html, selector, content) {
  // Only rewrites tags that already exist in index.html; never invents any.
  const pattern = new RegExp(`(<meta\\s+(?:property|name)="${selector}"\\s+content=")[^"]*(")`, 'i');
  return html.replace(pattern, `$1${escapeHtml(content)}$2`);
}

function withDocument(html, doc) {
  const title = [doc.song?.title, doc.song?.artist].filter(Boolean).join(' · ');
  let out = html;

  if (title) {
    out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    out = replaceMeta(out, 'og:title', title);
    out = replaceMeta(out, 'twitter:title', title);
  }
  const image = doc.media?.coverImage || doc.media?.backgroundImage;
  if (image) {
    out = replaceMeta(out, 'og:image', image);
    out = replaceMeta(out, 'twitter:image', image);
  }

  // The font the document asks for, requested while the HTML is still parsing
  // rather than after React boots. The id is the one useWebFonts owns, so it
  // finds this link, sees the href it would have written, and does nothing.
  const fonts = googleFontsHref(themeFontKeys(doc.theme || {}).filter(Boolean));
  const fontLink = fonts
    ? `<link id="dynamic-webfonts" rel="stylesheet" href="${escapeHtml(fonts)}">`
    : '';

  // Read synchronously by useContent, so the first paint is already correct.
  return out.replace(
    '</head>',
    `${fontLink}<script>window.__EPK_CONTENT__=${inlineJson(doc)}</script></head>`
  );
}

export default async function handler(request) {
  if (!isRead(request)) return methodNotAllowed(['GET', 'HEAD']);

  // The built HTML lives on the same deployment; asking the CDN for it keeps
  // this function free of any knowledge of the build output.
  const shell = await fetch(new URL('/index.html', request.url), {
    headers: { 'user-agent': 'epk-page-function' },
  });
  const html = await shell.text();

  if (!shell.ok) {
    return new Response(html, { status: shell.status, headers: CACHED });
  }

  let doc = null;
  try {
    doc = await readContent();
  } catch {
    // KV unreachable: the page still works, it just paints the defaults first.
  }

  return forMethod(
    request,
    new Response(doc ? withDocument(html, doc) : html, { headers: CACHED })
  );
}
