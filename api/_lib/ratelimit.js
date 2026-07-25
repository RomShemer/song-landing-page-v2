import { expire, incrby } from './kv.js';

/**
 * Fixed-window counter. Returns whether the caller is still under `limit`.
 * The window key carries the bucket index so it expires on its own.
 */
export async function allow(name, id, { limit, windowSeconds, now = Date.now() }) {
  const bucket = Math.floor(now / 1000 / windowSeconds);
  const key = `ratelimit:${name}:${id}:${bucket}`;
  const count = await incrby(key, 1);
  if (count === 1) await expire(key, windowSeconds);
  return count <= limit;
}

export const LOGIN_LIMIT = { limit: 8, windowSeconds: 15 * 60 };
export const TRACK_LIMIT = { limit: 60, windowSeconds: 60 };
