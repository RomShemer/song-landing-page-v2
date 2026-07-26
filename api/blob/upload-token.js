import { handleUpload } from '@vercel/blob/client';
import { isAdminCookie } from '../_lib/auth.js';

// The only route on the Node runtime. @vercel/blob reaches for node:crypto and
// undici, which the edge runtime refuses to bundle — and the token signing it
// does is exactly why the package is worth having. Every other route stays on
// edge, none of them importing anything from node_modules.
//
// Vercel's Node runtime calls the handler with (req, res), and handleUpload
// takes that shape directly: it branches on `"credentials" in request` to tell
// a Web Request from a Node one.
export const config = { runtime: 'nodejs' };

// The browser uploads to Vercel Blob directly and this route only mints a
// scoped, short-lived token for it. A serverless request body caps at 4.5 MB
// while a broadcast WAV is 40–120 MB, so a server passthrough cannot work.
// Keyed by the folder the client uploads into, so the folder and the limits it
// implies cannot disagree. Unknown folders are refused.
const FOLDERS = {
  images: { types: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'], mb: 25 },
  audio: {
    types: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/aiff'],
    mb: 300,
  },
  documents: { types: ['application/pdf'], mb: 50 },
  archives: { types: ['application/zip', 'application/x-zip-compressed'], mb: 300 },
};

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store, max-age=0');
  res.end(JSON.stringify(body));
}

/** Vercel parses a JSON body for us; the dev server does not. */
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return send(res, 405, { error: 'method not allowed' });
  }
  if (!(await isAdminCookie(req.headers.cookie))) {
    return send(res, 401, { error: 'unauthorized' });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return send(res, 503, {
      error:
        'BLOB_READ_WRITE_TOKEN is missing — link a Blob store to this Vercel ' +
        'project, then redeploy so the variable is injected',
    });
  }

  const body = await readBody(req);
  if (!body) return send(res, 400, { error: 'expected a JSON body' });

  try {
    const result = await handleUpload({
      request: req,
      body,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname) => {
        const folder = FOLDERS[pathname.split('/')[0]];
        if (!folder) throw new Error('unexpected upload folder');
        return {
          allowedContentTypes: folder.types,
          maximumSizeInBytes: folder.mb * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: null,
        };
      },
    });
    return send(res, 200, result);
  } catch (error) {
    return send(res, 400, { error: error.message || 'upload token refused' });
  }
}
