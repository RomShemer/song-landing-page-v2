import { useEffect, useState } from 'react';
import { normalizeContent } from '@schema';
import defaultContent from './defaultContent';

// The masters are gitignored, so locally the audio URLs come from env vars:
// VITE_DEV_MP3_URL, VITE_DEV_WAV_URL, VITE_DEV_AUDIO_URL. See docs/media-files.md.
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
