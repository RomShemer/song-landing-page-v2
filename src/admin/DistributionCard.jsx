import { useState } from 'react';
import { FaDownload, FaHeadphones, FaLink } from 'react-icons/fa';
import CopyField from './ui/CopyField';

const LINKS = [
  {
    key: 'full',
    icon: FaDownload,
    label: 'קישור הפצה מלא',
    hint: 'האזנה + הורדות',
    description: 'לעיתונאים ואנשי רדיו שצריכים את קבצי המאסטר',
    path: '/song',
  },
  {
    key: 'listen',
    icon: FaHeadphones,
    label: 'קישור להאזנה בלבד',
    hint: 'ללא הורדות',
    description: 'הנגן והסטרימינג בלבד — כל אפשרויות ההורדה מוסתרות',
    path: '/song?listen_only=true',
  },
];

export default function DistributionCard({ song, origin }) {
  const [generated, setGenerated] = useState({});

  const base = origin || window.location.origin;

  return (
    <section className="rounded-3xl border border-adm-line bg-adm-card p-4 shadow-[0_4px_20px_-8px_rgba(15,43,92,0.18)] sm:p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-adm-ink">
            {song.title || 'ללא שם'}
            {song.artist && (
              <span className="ms-2 text-sm font-normal text-adm-ink2">
                {song.artist}
              </span>
            )}
          </h1>
          <p className="mt-0.5 text-xs text-adm-muted">
            ניהול תוכן, עיצוב וקישורי הפצה
          </p>
        </div>

        <a
          href={`${base}/song`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-adm-line bg-white px-3 py-2 text-xs font-medium text-adm-ink2 transition hover:border-adm-blue hover:text-adm-blue"
        >
          <FaLink />
          צפייה בעמוד
        </a>
      </header>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {LINKS.map(({ key, icon: Icon, label, hint, description, path }) =>
          generated[key] ? (
            <CopyField key={key} label={label} hint={hint} value={`${base}${path}`} />
          ) : (
            <button
              key={key}
              type="button"
              onClick={() => setGenerated((prev) => ({ ...prev, [key]: true }))}
              className="group flex items-center gap-3 rounded-xl border border-dashed border-adm-muted/50 bg-adm-bg/50 px-3 py-3 text-right transition hover:border-adm-blue hover:bg-adm-blue-soft"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-adm-blue-soft text-sm text-adm-blue transition group-hover:bg-adm-blue group-hover:text-white">
                <Icon />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-adm-ink">
                  יצירת {label}
                </span>
                <span className="block text-[11px] text-adm-ink2">{description}</span>
              </span>
            </button>
          )
        )}
      </div>
    </section>
  );
}
