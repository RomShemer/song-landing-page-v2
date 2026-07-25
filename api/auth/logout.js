import { json, methodNotAllowed, noStore, serializeCookie } from '../_lib/http.js';
import { COOKIE_NAME } from '../_lib/session.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'POST') return methodNotAllowed(['POST']);

  return json(
    { ok: true },
    {
      headers: {
        ...noStore,
        'set-cookie': serializeCookie(COOKIE_NAME, '', {
          maxAge: 0,
          secure: new URL(request.url).protocol === 'https:',
        }),
      },
    }
  );
}
