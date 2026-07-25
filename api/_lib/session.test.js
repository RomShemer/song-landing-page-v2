import { describe, expect, it } from 'vitest';
import { SESSION_TTL, secretsMatch, signSession, verifySession } from './session.js';

const SECRET = 'a-test-secret-value';
const NOW = Date.UTC(2026, 6, 25, 9, 0, 0);

describe('signSession / verifySession', () => {
  it('accepts a token it just issued', async () => {
    const token = await signSession(SECRET, { now: NOW });
    const claims = await verifySession(SECRET, token, { now: NOW });
    expect(claims).toMatchObject({ exp: Math.floor(NOW / 1000) + SESSION_TTL });
  });

  it('rejects a token signed with another secret', async () => {
    const token = await signSession('other-secret', { now: NOW });
    expect(await verifySession(SECRET, token, { now: NOW })).toBeNull();
  });

  it('rejects a tampered payload', async () => {
    const token = await signSession(SECRET, { now: NOW });
    const [payload, signature] = token.split('.');
    const forged = btoa(JSON.stringify({ iat: 0, exp: 9e9 }))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replace(/=+$/, '');
    expect(payload).not.toBe(forged);
    expect(await verifySession(SECRET, `${forged}.${signature}`, { now: NOW })).toBeNull();
  });

  it('rejects the token once it has expired', async () => {
    const token = await signSession(SECRET, { now: NOW });
    const later = NOW + (SESSION_TTL + 1) * 1000;
    expect(await verifySession(SECRET, token, { now: later })).toBeNull();
  });

  it('rejects junk and a missing secret', async () => {
    expect(await verifySession(SECRET, 'not-a-token', { now: NOW })).toBeNull();
    expect(await verifySession(SECRET, '', { now: NOW })).toBeNull();
    expect(await verifySession('', await signSession(SECRET), { now: NOW })).toBeNull();
  });

  it('survives a round trip through a cookie encoding', async () => {
    const token = await signSession(SECRET, { now: NOW });
    const carried = decodeURIComponent(encodeURIComponent(token));
    expect(await verifySession(SECRET, carried, { now: NOW })).not.toBeNull();
  });
});

describe('secretsMatch', () => {
  it('matches only the exact string', async () => {
    expect(await secretsMatch('hunter2', 'hunter2')).toBe(true);
    expect(await secretsMatch('hunter2', 'hunter3')).toBe(false);
    expect(await secretsMatch('', '')).toBe(true);
    expect(await secretsMatch('hunter2', '')).toBe(false);
    expect(await secretsMatch(undefined, 'hunter2')).toBe(false);
  });
});
