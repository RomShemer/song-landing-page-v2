import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeContent } from '@schema';
import defaultContent from '../content/defaultContent';
import { DRAFT_STORAGE_KEY as STORAGE_KEY } from './draftStorage';

// The draft is persisted locally as well as published, so unpublished edits
// survive a reload and are never visible to anyone else.
function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeContent(JSON.parse(raw), defaultContent) : null;
  } catch {
    return null;
  }
}

export function useDraft() {
  const [published, setPublished] = useState(defaultContent);
  const [draft, setDraft] = useState(() => loadStored() || defaultContent);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    let alive = true;
    fetch('/api/content?fresh=1', { cache: 'no-store' })
      // 204 = nothing published yet, so the defaults stay as the baseline the
      // dirty check compares against.
      .then((r) =>
        r.status === 204 ? null : r.ok ? r.json() : Promise.reject(new Error(r.status))
      )
      .then((doc) => {
        if (!alive || !doc) return;
        const live = normalizeContent(doc, defaultContent);
        setPublished(live);
        if (!loadStored()) setDraft(live);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(published),
    [draft, published]
  );

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* quota or private mode — the draft simply is not persisted */
    }
  }, [draft]);

  /** update('theme', 'accent', '#fff') or update('song', { title, artist }) */
  const update = useCallback((section, keyOrPatch, maybeValue) => {
    setDraft((prev) => {
      const patch =
        typeof keyOrPatch === 'string' ? { [keyOrPatch]: maybeValue } : keyOrPatch;
      return { ...prev, [section]: { ...prev[section], ...patch } };
    });
  }, []);

  const replace = useCallback((section, value) => {
    setDraft((prev) => ({ ...prev, [section]: value }));
  }, []);

  const revert = useCallback(() => {
    setDraft(published);
    localStorage.removeItem(STORAGE_KEY);
  }, [published]);

  const publish = useCallback(async () => {
    setStatus('saving');
    const body = { ...draft, updatedAt: new Date().toISOString() };
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(res.status);
      setPublished(normalizeContent(body, defaultContent));
      localStorage.removeItem(STORAGE_KEY);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 4000);
  }, [draft]);

  return { draft, published, isDirty, status, update, replace, revert, publish };
}
