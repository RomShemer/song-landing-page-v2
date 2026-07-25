import { adminPassword, sessionSecret } from '../_lib/auth.js';
import {
  clientIp,
  fail,
  json,
  methodNotAllowed,
  noStore,
  readJson,
  serializeCookie,
} from '../_lib/http.js';
import { LOGIN_LIMIT, allow } from '../_lib/ratelimit.js';
import { COOKIE_NAME, SESSION_TTL, secretsMatch, signSession } from '../_lib/session.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'POST') return methodNotAllowed(['POST']);

  const password = adminPassword();
  const secret = sessionSecret();
  if (!password || !secret) {
    return fail(503, 'admin auth is not configured', noStore);
  }

  if (!(await allow('login', clientIp(request), LOGIN_LIMIT))) {
    return fail(429, 'too many attempts', noStore);
  }

  const body = await readJson(request, 4096);
  if (!(await secretsMatch(String(body?.password ?? ''), password))) {
    return fail(401, 'wrong password', noStore);
  }

  const token = await signSession(secret);
  return json(
    { ok: true, expiresIn: SESSION_TTL },
    {
      headers: {
        ...noStore,
        'set-cookie': serializeCookie(COOKIE_NAME, token, {
          maxAge: SESSION_TTL,
          secure: new URL(request.url).protocol === 'https:',
        }),
      },
    }
  );
}
