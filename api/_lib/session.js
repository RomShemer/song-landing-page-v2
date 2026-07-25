// A signed cookie rather than a session record: there is exactly one admin, so
// server-side state would buy nothing. HMAC-SHA256 over the payload via
// crypto.subtle keeps this dependency-free and edge-compatible.
//
// Rotating ADMIN_SESSION_SECRET invalidates every issued cookie.

export const COOKIE_NAME = 'ds_admin';
export const SESSION_TTL = 12 * 3600;

const encoder = new TextEncoder();

function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function unb64url(text) {
  const padded = text.replaceAll('-', '+').replaceAll('_', '/');
  const raw = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function key(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/** `<payload>.<signature>`, both base64url. */
export async function signSession(secret, { now = Date.now(), ttl = SESSION_TTL } = {}) {
  const iat = Math.floor(now / 1000);
  const payload = b64url(encoder.encode(JSON.stringify({ iat, exp: iat + ttl })));
  const signature = await crypto.subtle.sign('HMAC', await key(secret), encoder.encode(payload));
  return `${payload}.${b64url(new Uint8Array(signature))}`;
}

/** The payload when the token is authentic and unexpired, else null. */
export async function verifySession(secret, token, { now = Date.now() } = {}) {
  if (!secret || typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot < 1) return null;

  const payload = token.slice(0, dot);
  try {
    const ok = await crypto.subtle.verify(
      'HMAC',
      await key(secret),
      unb64url(token.slice(dot + 1)),
      encoder.encode(payload)
    );
    if (!ok) return null;
    const claims = JSON.parse(new TextDecoder().decode(unb64url(payload)));
    if (!Number.isFinite(claims.exp) || claims.exp * 1000 <= now) return null;
    return claims;
  } catch {
    return null;
  }
}

/** Length-independent comparison, so a wrong password reveals nothing by timing. */
export async function secretsMatch(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const [da, db] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  const x = new Uint8Array(da);
  const y = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
