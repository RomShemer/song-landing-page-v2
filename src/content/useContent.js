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
 * The audio masters are gitignored, so a fresh clone has no file to play and
 * the player correctly renders nothing. Point VITE_DEV_AUDIO_URL at a local
 * file (e.g. /media/track.mp3 under public/) to exercise it during development.
 */
function withDevAudio(doc) {
  const devAudio = import.meta.env.DEV && import.meta.env.VITE_DEV_AUDIO_URL;
  if (!devAudio || doc.media.audioStreamUrl || doc.downloads.mp3Url) return doc;

  return { ...doc, media: { ...doc.media, audioStreamUrl: devAudio } };
}

export function useContent({ fresh = false } = {}) {
  const [content, setContent] = useState(() => withDevAudio(defaultContent));
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
        setContent(withDevAudio(normalizeContent(doc, defaultContent)));
        setIsLive(true);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err);
      });

    return () => controller.abort();
  }, [fresh]);

  return { content, isLive, error, setContent };
}
