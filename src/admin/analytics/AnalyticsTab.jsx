import { useEffect, useState } from 'react';
import {
  FaClock,
  FaEye,
  FaFileAlt,
  FaHeadphones,
  FaImages,
  FaPlay,
  FaTable,
} from 'react-icons/fa';
import EngagementChart from './EngagementChart';
import { SERIES, formatDuration } from './series';

const RANGES = [
  [7, '7 ימים'],
  [30, '30 ימים'],
  [90, '90 ימים'],
];

function StatTile({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-adm-line bg-adm-card p-3.5 shadow-[0_2px_12px_-6px_rgba(15,43,92,0.18)]">
      <div className="flex items-center gap-2 text-[11px] font-medium text-adm-ink2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-adm-blue-soft text-adm-blue">
          <Icon />
        </span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold tabular-nums text-adm-ink">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-adm-muted">{hint}</div>}
    </div>
  );
}

function emptySeries(days) {
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({ date: d.toISOString().slice(0, 10) });
  }
  return out;
}

export default function AnalyticsTab() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [state, setState] = useState('loading');
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/stats?days=${days}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((d) => {
        if (!alive) return;
        setStats(d);
        setState('ready');
      })
      .catch(() => {
        if (alive) setState('unavailable');
      });
    return () => {
      alive = false;
    };
  }, [days]);

  const totals = stats?.totals || {};
  const series = stats?.series?.length ? stats.series : emptySeries(days);

  return (
    <div className="space-y-4">
      {state === 'unavailable' && (
        <p className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
          שירות הנתונים עדיין לא מחובר — המסך מציג את המבנה הסופי עם אפסים.
          המדידה תתחיל לפעול עם חיבור השרת.
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-adm-ink">מדידת מעורבות</h2>
        <div className="flex gap-1.5">
          {RANGES.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDays(value)}
              aria-pressed={days === value}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition ${
                days === value
                  ? 'bg-adm-blue text-white'
                  : 'border border-adm-line bg-white text-adm-ink2 hover:border-adm-blue hover:text-adm-blue'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
        <StatTile
          icon={FaEye}
          label="צפיות בעמוד"
          value={totals.page_view ?? 0}
          hint={`מלא ${totals['page_view:full'] ?? 0} · האזנה בלבד ${
            totals['page_view:listen_only'] ?? 0
          }`}
        />
        <StatTile
          icon={FaPlay}
          label="האזנות"
          value={totals.play_audio ?? 0}
          hint="לחיצות על נגן"
        />
        <StatTile
          icon={FaClock}
          label="זמן האזנה מצטבר"
          value={formatDuration(totals.listen_seconds ?? 0)}
          hint={`ממוצע ${formatDuration(
            totals.play_audio ? (totals.listen_seconds ?? 0) / totals.play_audio : 0
          )} להאזנה`}
        />
        <StatTile
          icon={FaHeadphones}
          label="הורדות WAV"
          value={totals.download_wav ?? 0}
          hint="איכות שידור"
        />
        <StatTile
          icon={FaHeadphones}
          label="הורדות MP3"
          value={totals.download_mp3 ?? 0}
        />
        <StatTile
          icon={FaFileAlt}
          label="קומוניקט ותמונות"
          value={(totals.download_pdf ?? 0) + (totals.download_photos ?? 0)}
          hint={`PDF ${totals.download_pdf ?? 0} · תמונות ${totals.download_photos ?? 0}`}
        />
      </div>

      <section className="rounded-3xl border border-adm-line bg-adm-card p-4 shadow-[0_4px_20px_-8px_rgba(15,43,92,0.18)]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-adm-ink">
              האזנות והורדות לפי יום
            </h3>
            <p className="mt-0.5 text-[11px] text-adm-muted">
              {days} הימים האחרונים
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-adm-line bg-white px-2.5 py-1 text-[11px] text-adm-ink2 transition hover:border-adm-blue hover:text-adm-blue"
          >
            <FaTable />
            {showTable ? 'תצוגת גרף' : 'תצוגת טבלה'}
          </button>
        </div>

        <div className="mt-4">
          {showTable ? (
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-adm-card">
                  <tr className="text-adm-ink2">
                    <th className="p-1.5 text-right font-medium">תאריך</th>
                    {SERIES.map((s) => (
                      <th key={s.key} className="p-1.5 text-right font-medium">
                        {s.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {series.map((d) => (
                    <tr key={d.date} className="border-t border-adm-line">
                      <td className="p-1.5 tabular-nums text-adm-ink">{d.date}</td>
                      {SERIES.map((s) => (
                        <td key={s.key} className="p-1.5 tabular-nums text-adm-ink2">
                          {d[s.key] ?? 0}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EngagementChart data={series} />
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-adm-line bg-adm-card p-4 shadow-[0_4px_20px_-8px_rgba(15,43,92,0.18)]">
        <h3 className="flex items-center gap-2 text-sm font-bold text-adm-ink">
          <FaImages className="text-adm-teal" />
          פירוט מעורבות
        </h3>
        <dl className="mt-3 space-y-1.5 text-xs">
          {[
            ['פתיחת קומוניקט', totals['accordion_open:pr']],
            ['פתיחת מילים', totals['accordion_open:lyrics']],
            ['פתיחת גלריה', totals['accordion_open:gallery']],
            ['פתיחת קרדיטים', totals['accordion_open:credits']],
            ['צפייה בקליפ', totals['accordion_open:clip']],
            ['לחיצות טלפון', totals['contact_click:phone']],
            ['לחיצות אימייל', totals['contact_click:email']],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-adm-line pb-1.5"
            >
              <dt className="text-adm-ink2">{label}</dt>
              <dd className="font-semibold tabular-nums text-adm-ink">{value ?? 0}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
