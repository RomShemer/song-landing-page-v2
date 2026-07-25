import { describe, expect, it } from 'vitest';
import { normalizeContent } from './schema.js';

const base = normalizeContent({
  media: { audioStreamUrl: 'https://cdn.example.com/keep.mp3' },
  links: { spotify: 'https://open.spotify.com/track/1' },
});

describe('URL fields', () => {
  it('keeps http(s) and same-origin paths', () => {
    const doc = normalizeContent({
      media: {
        audioStreamUrl: 'https://cdn.example.com/song.mp3',
        backgroundImage: '/media/photos/press.jpg',
        videoUrl: 'HTTPS://youtube.com/embed/x',
      },
    });
    expect(doc.media.audioStreamUrl).toBe('https://cdn.example.com/song.mp3');
    expect(doc.media.backgroundImage).toBe('/media/photos/press.jpg');
    expect(doc.media.videoUrl).toBe('HTTPS://youtube.com/embed/x');
  });

  it('refuses a blob: URL from a failed upload and keeps what was there', () => {
    const doc = normalizeContent({ media: { audioStreamUrl: 'blob:http://localhost:5173/abc' } }, base);
    expect(doc.media.audioStreamUrl).toBe('https://cdn.example.com/keep.mp3');
  });

  it('refuses javascript: and data: in a link that becomes an href', () => {
    const doc = normalizeContent(
      {
        links: { spotify: 'javascript:alert(1)', tiktok: 'data:text/html,<script>x</script>' },
        downloads: { pressImages: [{ src: 'javascript:alert(1)', name: 'a' }] },
      },
      base
    );
    expect(doc.links.spotify).toBe('https://open.spotify.com/track/1');
    expect(doc.links.tiktok).toBe('');
    expect(doc.downloads.pressImages).toEqual([]);
  });

  it('lets a field be cleared on purpose', () => {
    expect(normalizeContent({ media: { audioStreamUrl: '' } }, base).media.audioStreamUrl).toBe('');
    expect(normalizeContent({ media: { audioStreamUrl: '   ' } }, base).media.audioStreamUrl).toBe('');
  });

  it('leaves an absent field at the base value', () => {
    expect(normalizeContent({}, base).media.audioStreamUrl).toBe('https://cdn.example.com/keep.mp3');
  });
});
