export function json(body, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

export function fail(status, message, headers) {
  return json({ error: message }, { status, headers });
}

export const noStore = { 'cache-control': 'no-store, max-age=0' };

export function methodNotAllowed(allow) {
  return fail(405, 'method not allowed', { allow: allow.join(', ') });
}

export const isRead = (request) => request.method === 'GET' || request.method === 'HEAD';

/**
 * HEAD has to answer exactly as GET does but without a body (RFC 9110), or
 * uptime monitors and link checkers see a 405 on a perfectly readable resource.
 */
export function forMethod(request, response) {
  if (request.method !== 'HEAD') return response;
  return new Response(null, { status: response.status, headers: response.headers });
}

/** Parsed JSON body, or null when it is absent, malformed or oversized. */
export async function readJson(request, maxBytes = 512 * 1024) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > maxBytes) return null;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function readCookie(request, name) {
  return readCookieValue(request.headers.get('cookie'), name);
}

/** Takes the raw header, so it also serves the Node-runtime route. */
export function readCookieValue(header, name) {
  for (const part of (header || '').split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

export function serializeCookie(name, value, { maxAge, secure = true } = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) parts.push('Secure');
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  return parts.join('; ');
}

/** Left-most x-forwarded-for hop; falls back to a shared bucket. */
export function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  return (
    forwarded.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
