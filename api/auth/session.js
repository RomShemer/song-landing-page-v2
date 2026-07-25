import { isAdmin, sessionSecret } from '../_lib/auth.js';
import { json, methodNotAllowed, noStore } from '../_lib/http.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'GET') return methodNotAllowed(['GET']);

  return json(
    { authenticated: await isAdmin(request), configured: Boolean(sessionSecret()) },
    { headers: noStore }
  );
}
