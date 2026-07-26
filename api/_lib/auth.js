import { readCookieValue } from './http.js';
import { COOKIE_NAME, verifySession } from './session.js';

export function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

/**
 * True when this Cookie header carries a valid admin session. Without a
 * configured secret nothing authenticates — a missing env var must lock the
 * door, not open it.
 */
export async function isAdminCookie(header) {
  const secret = sessionSecret();
  if (!secret) return false;
  return Boolean(await verifySession(secret, readCookieValue(header, COOKIE_NAME)));
}

/** The same check for a Web Request. */
export async function isAdmin(request) {
  return isAdminCookie(request.headers.get('cookie'));
}
