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
    <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md sm:p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-white">
            {song.title || 'ללא שם'}
            {song.artist && (
              <span className="ms-2 text-sm font-normal text-neutral-400">
                {song.artist}
              </span>
            )}
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            ניהול תוכן, עיצוב וקישורי הפצה
          </p>
        </div>

        <a
          href={`${base}/song`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-neutral-300 transition hover:bg-white/10 hover:text-white"
        >
          <FaLink />
          צפייה בעמוד
        </a>
      </header>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {LINKS.map(({ key, icon: Icon, label, hint, description, path }) =>
          generated[key] ? (
            <CopyField key={key} label={label} hint={hint} value={`${base}${path}`} />
          ) : (
            <button
              key={key}
              type="button"
              onClick={() => setGenerated((prev) => ({ ...prev, [key]: true }))}
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-right transition hover:border-accent-500/50 hover:bg-white/[0.09]"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm text-neutral-300 transition group-hover:bg-accent-500/25 group-hover:text-accent-200">
                <Icon />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-neutral-100">
                  יצירת {label}
                </span>
                <span className="block text-[11px] text-neutral-500">{description}</span>
              </span>
            </button>
          )
        )}
      </div>
    </section>
  );
}
