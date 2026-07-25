import { readCookie } from './http.js';
import { COOKIE_NAME, verifySession } from './session.js';

export function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

/**
 * True when the request carries a valid admin cookie. Without a configured
 * secret nothing authenticates — a missing env var must lock the door, not
 * open it.
 */
export async function isAdmin(request) {
  const secret = sessionSecret();
  if (!secret) return false;
  return Boolean(await verifySession(secret, readCookie(request, COOKIE_NAME)));
}
