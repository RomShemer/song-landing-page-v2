import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeContent } from '@schema';
import defaultContent from '../content/defaultContent';
import { DRAFT_STORAGE_KEY as STORAGE_KEY } from './draftStorage';
import { useToast } from './ui/toastContext';

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

// A stored draft is the right thing to show only while it was based on the
// document that is currently published. Once the server is newer — published from
// another tab, browser or phone — the local copy is stale, and preferring it is
// how the dashboard ends up showing old content while the live page shows new.
function serverIsNewer(stored, live) {
  if (!stored) return true;
  return (Date.parse(live.updatedAt || '') || 0) > (Date.parse(stored.updatedAt || '') || 0);
}

export function useDraft() {
  const [published, setPublished] = useState(defaultContent);
  // Read once, during the first render. The effect below persists the draft on
  // every change, so by the time the fetch resolves storage already holds a
  // document this hook wrote — reading it again there would mistake our own
  // write for a draft the artist left behind.
  const [storedAtMount] = useState(loadStored);
  const [draft, setDraft] = useState(storedAtMount || defaultContent);
  const [status, setStatus] = useState('idle');
  const toast = useToast();

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

        if (!serverIsNewer(storedAtMount, live)) return;

        if (storedAtMount) {
          // Replacing someone's edits without a trace is worse than the stale
          // draft was, so the old one is kept under its own key.
          try {
            localStorage.setItem(`${STORAGE_KEY}:replaced`, JSON.stringify(storedAtMount));
          } catch {
            /* quota — the copy is a courtesy, not a guarantee */
          }
          toast.success('נטענה הגרסה שפורסמה — היא חדשה יותר מהטיוטה שהייתה בדפדפן');
        }
        setDraft(live);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // Runs once: this is the initial load, not a subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /** @returns {Promise<{ok: boolean, status: number}>} so the caller can say why. */
  const publish = useCallback(async () => {
    setStatus('saving');
    const body = { ...draft, updatedAt: new Date().toISOString() };
    let outcome = { ok: false, status: 0 };
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      outcome = { ok: res.ok, status: res.status };
      if (!res.ok) throw new Error(res.status);
      setPublished(normalizeContent(body, defaultContent));
      localStorage.removeItem(STORAGE_KEY);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 4000);
    return outcome;
  }, [draft]);

  return { draft, published, isDirty, status, update, replace, revert, publish };
}
