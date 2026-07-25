import { describe, expect, it } from 'vitest';
import { listenBucket, normalizeEvent } from './events.js';

describe('normalizeEvent', () => {
  it('splits a page view by mode and dedupes it for a day', () => {
    expect(normalizeEvent({ event: 'page_view', mode: 'listen_only' })).toEqual({
      fields: { page_view: 1, 'page_view:listen_only': 1 },
      dedupe: 'page_view:listen_only',
      ttl: 86400,
    });
  });

  it('falls back to the full mode when the mode is not one of ours', () => {
    expect(normalizeEvent({ event: 'page_view', mode: 'sneaky' }).fields).toEqual({
      page_view: 1,
      'page_view:full': 1,
    });
  });

  it('counts a play once per half hour', () => {
    expect(normalizeEvent({ event: 'play_audio' })).toEqual({
      fields: { play_audio: 1 },
      dedupe: 'play_audio',
      ttl: 1800,
    });
  });

  it('adds elapsed seconds and buckets them', () => {
    expect(normalizeEvent({ event: 'listen_seconds', seconds: 47.4 }).fields).toEqual({
      listen_seconds: 47,
      'listen_buckets:30-60': 1,
    });
  });

  it('drops a listen shorter than a second and caps an absurd one', () => {
    expect(normalizeEvent({ event: 'listen_seconds', seconds: 0.4 })).toBeNull();
    expect(normalizeEvent({ event: 'listen_seconds', seconds: 'lots' })).toBeNull();
    expect(normalizeEvent({ event: 'listen_seconds', seconds: 9e9 }).fields).toEqual({
      listen_seconds: 10800,
      'listen_buckets:120+': 1,
    });
  });

  it('never dedupes a download', () => {
    expect(normalizeEvent({ event: 'download_wav' })).toEqual({
      fields: { download_wav: 1 },
      dedupe: null,
      ttl: 0,
    });
  });

  it('keeps only known networks, sections and contact types', () => {
    expect(normalizeEvent({ event: 'social_click', network: 'tiktok' }).fields).toEqual({
      'social_click:tiktok': 1,
    });
    expect(normalizeEvent({ event: 'social_click', network: 'myspace' })).toBeNull();
    expect(normalizeEvent({ event: 'accordion_open', section: 'pr' }).fields).toEqual({
      'accordion_open:pr': 1,
    });
    expect(normalizeEvent({ event: 'accordion_open', section: '__proto__' })).toBeNull();
    expect(normalizeEvent({ event: 'contact_click', type: 'email' }).fields).toEqual({
      'contact_click:email': 1,
    });
  });

  it('refuses anything not on the allowlist', () => {
    expect(normalizeEvent({ event: 'drop_table' })).toBeNull();
    expect(normalizeEvent({ event: '' })).toBeNull();
    expect(normalizeEvent(null)).toBeNull();
    expect(normalizeEvent('page_view')).toBeNull();
  });

  it('reads params from a nested params object too', () => {
    expect(normalizeEvent({ event: 'social_click', params: { network: 'spotify' } }).fields).toEqual(
      { 'social_click:spotify': 1 }
    );
  });
});

describe('listenBucket', () => {
  it('puts each boundary in the lower bucket', () => {
    expect([1, 10, 11, 30, 31, 60, 61, 120, 121, 6000].map(listenBucket)).toEqual([
      '0-10',
      '0-10',
      '10-30',
      '10-30',
      '30-60',
      '30-60',
      '60-120',
      '60-120',
      '120+',
      '120+',
    ]);
  });
});
