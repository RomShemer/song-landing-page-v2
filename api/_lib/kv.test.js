import { beforeEach, describe, expect, it } from 'vitest';
import {
  bumpFields,
  claim,
  fromFlat,
  get,
  hgetallNumeric,
  incrby,
  resetMemory,
  set,
  zadd,
  zrangeByScore,
} from './kv.js';

// No credentials in the test env, so these exercise the in-process fallback —
// which is also what `npm run dev` runs against.
beforeEach(resetMemory);

describe('memory fallback', () => {
  it('round-trips a value', async () => {
    await set('k', 'v');
    expect(await get('k')).toBe('v');
    expect(await get('missing')).toBeNull();
  });

  it('honours SET NX', async () => {
    expect(await set('k', 'first', { nx: true })).toBe('OK');
    expect(await set('k', 'second', { nx: true })).toBeNull();
    expect(await get('k')).toBe('first');
  });

  it('claims a key once', async () => {
    expect(await claim('lock', 60)).toBe(true);
    expect(await claim('lock', 60)).toBe(false);
  });

  it('counts with INCRBY', async () => {
    expect(await incrby('n', 1)).toBe(1);
    expect(await incrby('n', 4)).toBe(5);
  });

  it('accumulates hash fields across keys in one call', async () => {
    await bumpFields(['totals', 'daily'], { play_audio: 1, listen_seconds: 30 });
    await bumpFields(['totals'], { play_audio: 1, listen_seconds: 0 });

    expect(await hgetallNumeric('totals')).toEqual({ play_audio: 2, listen_seconds: 30 });
    expect(await hgetallNumeric('daily')).toEqual({ play_audio: 1, listen_seconds: 30 });
    expect(await hgetallNumeric('never-written')).toEqual({});
  });

  it('returns zset members within a score range, in order', async () => {
    await zadd('days', 20260725, '2026-07-25');
    await zadd('days', 20260723, '2026-07-23');
    await zadd('days', 20260724, '2026-07-24');

    expect(await zrangeByScore('days', 20260724, 20260725)).toEqual([
      '2026-07-24',
      '2026-07-25',
    ]);
  });
});

describe('fromFlat', () => {
  it('reads the REST flat-array shape and coerces to numbers', () => {
    expect(fromFlat(['play_audio', '3', 'listen_seconds', '90'])).toEqual({
      play_audio: 3,
      listen_seconds: 90,
    });
    expect(fromFlat([])).toEqual({});
    expect(fromFlat(null)).toEqual({});
    expect(fromFlat({ play_audio: '3' })).toEqual({ play_audio: 3 });
  });
});
