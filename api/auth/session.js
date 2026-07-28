import { isAdmin, sessionSecret } from '../_lib/auth.js';
import { forMethod, isRead, json, methodNotAllowed, noStore } from '../_lib/http.js';
import { kvConfigured } from '../_lib/kv.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (!isRead(request)) return methodNotAllowed(['GET', 'HEAD']);

  const authenticated = await isAdmin(request);

  const body = {
    authenticated,
    configured: Boolean(sessionSecret()),
    // Which stores this deployment can actually reach. Only for a logged-in
    // admin: it is deployment configuration, not a visitor's business. Saves
    // guessing why a publish vanished on a cold start or an upload returns 503.
    ...(authenticated && {
      stores: { kv: kvConfigured(), blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN) },
    }),
  };

  return forMethod(request, json(body, { headers: noStore }));
}
