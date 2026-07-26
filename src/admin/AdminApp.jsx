import { useEffect, useState } from 'react';
import {
  FaChartBar,
  FaCheck,
  FaSignOutAlt,
  FaSlidersH,
  FaSpinner,
  FaUndo,
} from 'react-icons/fa';
import { useWebFonts } from '../hooks/useWebFonts';
import { themeFontKeys } from '../theme';
import DistributionCard from './DistributionCard';
import Login from './Login';
import AnalyticsTab from './analytics/AnalyticsTab';
import ContentTab from './content/ContentTab';
import Preview from './content/Preview';
import { ToastProvider } from './ui/Toast';
import { useToast } from './ui/toastContext';
import { useDraft } from './useDraft';

const TABS = [
  { key: 'content', label: 'תוכן ועיצוב', icon: FaSlidersH },
  { key: 'analytics', label: 'נתונים', icon: FaChartBar },
];

// The provider has to sit above anything calling useToast, and the dashboard
// itself does, so the export is the wrapper.
export default function AdminApp() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}

function Dashboard() {
  const [authed, setAuthed] = useState(null);
  const [hasSession, setHasSession] = useState(false);
  const [tab, setTab] = useState('content');
  const { draft, isDirty, status, update, replace, revert, publish } = useDraft();
  const toast = useToast();

  useWebFonts(themeFontKeys(draft.theme));

  const onPublish = async () => {
    const { ok, status: code } = await publish();
    if (ok) {
      toast.success('השינויים פורסמו — העמוד הציבורי מתעדכן תוך כדקה');
      return;
    }
    toast.error(
      code === 401
        ? 'הפרסום נכשל — יש להתחבר מחדש'
        : code === 0
          ? 'הפרסום נכשל — אין חיבור לשרת'
          : `הפרסום נכשל (שגיאה ${code})`
    );
  };

  const onRevert = () => {
    revert();
    toast.success('השינויים בוטלו וחזרנו לגרסה שפורסמה');
  };

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
      .then((d) => {
        setHasSession(Boolean(d.configured));
        // Without ADMIN_PASSWORD/ADMIN_SESSION_SECRET set there is no password
        // to ask for, so the gate opens rather than locking the UI out.
        setAuthed(Boolean(d.authenticated) || !d.configured);
      })
      // No auth route at all — running the plain Vite dev server.
      .catch(() => setAuthed(true));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setAuthed(false);
  };

  if (authed === null) return null;
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  return (
    <div dir="rtl" className="min-h-dvh bg-adm-bg text-adm-ink">
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 pt-6 pb-24">
        <DistributionCard song={draft.song} />

        <div className="flex items-center gap-1.5 border-b border-adm-line">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-current={tab === key}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm transition ${
                tab === key
                  ? 'border-adm-blue font-semibold text-adm-blue'
                  : 'border-transparent text-adm-ink2 hover:text-adm-ink'
              }`}
            >
              <Icon className="text-xs" />
              {label}
            </button>
          ))}

          {hasSession && (
            <button
              type="button"
              onClick={logout}
              className="mr-auto inline-flex items-center gap-1.5 px-2.5 py-2.5 text-[11px] text-adm-muted transition hover:text-adm-blue"
            >
              <FaSignOutAlt />
              יציאה
            </button>
          )}
        </div>

        {tab === 'content' ? (
          <div className="grid gap-4 lg:min-h-[calc(100dvh-6rem)] lg:grid-cols-[minmax(0,1fr)_auto]">
            {/* Trailing space so the grid row outlasts the preview panel; without
                it the sticky panel rides up at the end of the page. */}
            <div className="lg:pb-56">
              <ContentTab draft={draft} update={update} replace={replace} />
            </div>
            {/* The cell stretches to the row height so the sticky child has
                slack to travel in; sticking the cell itself would pin nothing. */}
            <div>
              <div className="lg:sticky lg:top-6">
                <Preview content={draft} isDirty={isDirty} />
              </div>
            </div>
          </div>
        ) : (
          <AnalyticsTab />
        )}
      </div>

      {tab === 'content' && (
        <div className="sticky bottom-0 border-t border-adm-line bg-adm-card/95 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
            {/* Only the draft state lives here now; the outcome of a publish is
                the toast's job, and saying it twice aged badly the first time. */}
            <span className="text-xs text-adm-ink2">
              {isDirty ? 'יש שינויים שלא פורסמו' : 'אין שינויים'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRevert}
                disabled={!isDirty}
                className="inline-flex items-center gap-2 rounded-xl border border-adm-line bg-white px-3 py-2 text-xs font-medium text-adm-ink2 transition hover:border-adm-blue hover:text-adm-blue disabled:opacity-30"
              >
                <FaUndo />
                ביטול שינויים
              </button>
              <button
                type="button"
                onClick={onPublish}
                disabled={!isDirty || status === 'saving'}
                className="inline-flex items-center gap-2 rounded-xl bg-adm-blue px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_var(--color-adm-blue)] transition hover:bg-adm-blue-hover disabled:opacity-40 disabled:shadow-none"
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
