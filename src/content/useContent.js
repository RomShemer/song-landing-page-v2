import { useEffect, useState } from 'react';
import { normalizeContent } from '@schema';
import defaultContent from './defaultContent';

/**
 * Renders build-time defaults immediately, then swaps in the live document from
 * /api/content when it arrives. Fetch failures are non-fatal by design — the
 * page stays fully usable on defaults.
 *
 * @param {{ fresh?: boolean }} options `fresh` bypasses the CDN cache (admin).
 */
/**
 * In production the audio URLs come from KV, pointing at Blob uploads. The
 * masters are gitignored, so locally they are supplied by env vars instead:
 *
 *   VITE_DEV_MP3_URL    → downloads.mp3Url  (also backs the player)
 *   VITE_DEV_WAV_URL    → downloads.wavUrl
 *   VITE_DEV_AUDIO_URL  → media.audioStreamUrl, for a dedicated stream asset
 *
 * Only fields the document leaves empty are filled, so a real document always
 * wins. Dev-only: import.meta.env.DEV is statically false in a build, so this
 * whole branch is dropped by the bundler.
 */
function withDevMedia(doc) {
  if (!import.meta.env.DEV) return doc;

  const mp3 = import.meta.env.VITE_DEV_MP3_URL;
  const wav = import.meta.env.VITE_DEV_WAV_URL;
  const stream = import.meta.env.VITE_DEV_AUDIO_URL;
  if (!mp3 && !wav && !stream) return doc;

  return {
    ...doc,
    media: {
      ...doc.media,
      audioStreamUrl: doc.media.audioStreamUrl || stream || '',
    },
    downloads: {
      ...doc.downloads,
      mp3Url: doc.downloads.mp3Url || mp3 || '',
      wavUrl: doc.downloads.wavUrl || wav || '',
    },
  };
}

export function useContent({ fresh = false } = {}) {
  const [content, setContent] = useState(() => withDevMedia(defaultContent));
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(fresh ? '/api/content?fresh=1' : '/api/content', {
      signal: controller.signal,
      cache: fresh ? 'no-store' : 'default',
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
      .then((doc) => {
        // Live document wins, but any field it omits falls back to defaults.
        setContent(withDevMedia(normalizeContent(doc, defaultContent)));
        setIsLive(true);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err);
      });

    return () => controller.abort();
  }, [fresh]);

  return { content, isLive, error, setContent };
}
