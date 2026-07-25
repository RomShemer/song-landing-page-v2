import { get, incrby, pipeline } from './kv.js';

export const CURRENT_KEY = 'content:current';
export const VERSION_KEY = 'content:version';
export const BACKUP_TTL = 30 * 86400;

export const backupKey = (version) => `content:backup:${version}`;

/** The published document, or null when nothing has been published yet. */
export async function readContent() {
  const raw = await get(CURRENT_KEY);
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

/**
 * Publishes a validated document. The version counter moves first so a backup
 * can never overwrite a live one, and the previous document is kept for 30 days.
 */
export async function writeContent(doc) {
  const serialized = JSON.stringify(doc);
  const previous = await get(CURRENT_KEY);
  const version = await incrby(VERSION_KEY, 1);

  const writes = [['SET', CURRENT_KEY, serialized]];
  if (previous) writes.push(['SET', backupKey(version - 1), previous, 'EX', BACKUP_TTL]);
  await pipeline(writes);

  return version;
}

