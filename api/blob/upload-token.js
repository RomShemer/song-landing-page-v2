import { handleUpload } from '@vercel/blob/client';
import { isAdmin } from '../_lib/auth.js';
import { fail, json, methodNotAllowed, noStore, readJson } from '../_lib/http.js';

export const config = { runtime: 'edge' };

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

export default async function handler(request) {
  if (request.method !== 'POST') return methodNotAllowed(['POST']);
  if (!(await isAdmin(request))) return fail(401, 'unauthorized', noStore);
  if (!process.env.BLOB_READ_WRITE_TOKEN) return fail(503, 'blob storage is not configured', noStore);

  const body = await readJson(request, 64 * 1024);
  if (!body) return fail(400, 'expected a JSON body', noStore);

  try {
    const result = await handleUpload({
      request,
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
    return json(result, { headers: noStore });
  } catch (error) {
    return fail(400, error.message || 'upload token refused', noStore);
  }
}
