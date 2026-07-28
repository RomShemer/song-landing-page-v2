import { useEffect, useState } from 'react';
import { normalizeContent } from '@schema';
import defaultContent from './defaultContent';
import { DRAFT_STORAGE_KEY } from '../admin/draftStorage';

// The pop-out preview opens /song?preview=1 in a real tab. It reads the draft
// from this browser's own storage, so nothing unpublished is exposed to anyone
// else — a visitor adding the parameter just sees the published page.
function readDraftPreview() {
  if (new URLSearchParams(window.location.search).get('preview') !== '1') return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? normalizeContent(JSON.parse(raw), defaultContent) : null;
  } catch {
    return null;
  }
}

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

// /api/page inlines the published document into the HTML, so the very first
// paint is the real content instead of the defaults flashing past. Absent — the
// admin, a local `vite preview`, a stale CDN copy — the fetch below still runs.
function readInlined() {
  try {
    const doc = window.__EPK_CONTENT__;
    return doc && typeof doc === 'object' ? normalizeContent(doc, defaultContent) : null;
  } catch {
    return null;
  }
}

export function useContent({ fresh = false, skip = false } = {}) {
  const [previewDoc] = useState(readDraftPreview);
  const [inlined] = useState(readInlined);
  const [content, setContent] = useState(() =>
    withDevMedia(previewDoc || inlined || defaultContent)
  );
  const [isLive, setIsLive] = useState(Boolean(inlined) && !previewDoc);
  const [error, setError] = useState(null);

  useEffect(() => {
    // `fresh` is the dashboard asking for the live document regardless.
    if (skip || previewDoc || (inlined && !fresh)) return;
    const controller = new AbortController();

    fetch(fresh ? '/api/content?fresh=1' : '/api/content', {
      signal: controller.signal,
      cache: fresh ? 'no-store' : 'default',
    })
      // 204 means the API is up but nothing has been published; the defaults
      // already on screen are the right answer, so there is nothing to do.
      .then((res) =>
        res.status === 204 ? null : res.ok ? res.json() : Promise.reject(new Error(res.status))
      )
      .then((doc) => {
        if (!doc) return;
        setContent(withDevMedia(normalizeContent(doc, defaultContent)));
        setIsLive(true);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err);
      });

    return () => controller.abort();
  }, [fresh, skip, previewDoc, inlined]);

  return { content, isLive, error, setContent };
}
