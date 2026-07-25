import { useEffect, useState } from 'react';
import { FaChartBar, FaCheck, FaSlidersH, FaSpinner, FaUndo } from 'react-icons/fa';
import { themeVars } from '../theme';
import { useWebFonts } from '../hooks/useWebFonts';
import DistributionCard from './DistributionCard';
import Login from './Login';
import AnalyticsTab from './analytics/AnalyticsTab';
import ContentTab from './content/ContentTab';
import Preview from './content/Preview';
import { useDraft } from './useDraft';

const TABS = [
  { key: 'content', label: 'תוכן ועיצוב', icon: FaSlidersH },
  { key: 'analytics', label: 'נתונים', icon: FaChartBar },
];

export default function AdminApp() {
  const [authed, setAuthed] = useState(null);
  const [tab, setTab] = useState('content');
  const { draft, isDirty, status, update, replace, revert, publish } = useDraft();

  useWebFonts([draft.theme.titleFont, draft.theme.bodyFont]);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      // No auth service yet, so the gate opens rather than locking the UI out.
      .then((d) => setAuthed(Boolean(d.authenticated)))
      .catch(() => setAuthed(true));
  }, []);

  if (authed === null) return null;
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  return (
    <div
      dir="rtl"
      className="min-h-dvh bg-neutral-950 font-body text-neutral-100"
      style={themeVars(draft.theme)}
    >
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
        <DistributionCard song={draft.song} />

        <div className="flex items-center gap-1.5 border-b border-white/10">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-current={tab === key}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm transition ${
                tab === key
                  ? 'border-accent-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="text-xs" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'content' ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <ContentTab draft={draft} update={update} replace={replace} />
            <div className="lg:sticky lg:top-6">
              <Preview content={draft} isDirty={isDirty} />
            </div>
          </div>
        ) : (
          <AnalyticsTab />
        )}
      </div>

      {tab === 'content' && (
        <div className="sticky bottom-0 border-t border-white/10 bg-neutral-950/90 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <span className="text-xs text-neutral-400">
              {status === 'saved'
                ? 'השינויים פורסמו'
                : status === 'error'
                  ? 'הפרסום נכשל — שירות השמירה עדיין לא מחובר'
                  : isDirty
                    ? 'יש שינויים שלא פורסמו'
                    : 'אין שינויים'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={revert}
                disabled={!isDirty}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-neutral-300 transition hover:bg-white/10 disabled:opacity-30"
              >
                <FaUndo />
                ביטול שינויים
              </button>
              <button
                type="button"
                onClick={publish}
                disabled={!isDirty || status === 'saving'}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-400 disabled:opacity-40"
              >
                {status === 'saving' ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaCheck />
                )}
                פרסום שינויים
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
