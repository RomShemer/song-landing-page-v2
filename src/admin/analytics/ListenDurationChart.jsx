import { useState } from 'react';
import { DURATION_BUCKETS } from './series';

const ROW_H = 34;
const LABEL_W = 78;

export default function ListenDurationChart({ buckets = {}, totalPlays = 0 }) {
  const [hover, setHover] = useState(null);

  const rows = DURATION_BUCKETS.map((b) => ({ ...b, value: buckets[b.key] || 0 }));
  const max = Math.max(1, ...rows.map((r) => r.value));
  const counted = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <figure className="m-0">
      <div className="flex flex-col gap-1.5">
        {rows.map((row, i) => {
          const pct = counted ? Math.round((row.value / counted) * 100) : 0;
          return (
            <div
              key={row.key}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="flex items-center gap-2.5 rounded-lg px-1 transition-colors"
              style={{ height: ROW_H, background: hover === i ? '#f3f7ff' : 'transparent' }}
            >
              <span
                className="shrink-0 text-[11px] text-adm-ink2 tabular-nums"
                style={{ width: LABEL_W }}
              >
                {row.label}
              </span>

              <div className="relative h-2.5 min-w-0 flex-1 rounded-full bg-adm-bg">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${(row.value / max) * 100}%`,
                    background: row.color,
                    minWidth: row.value ? 6 : 0,
                  }}
                />
              </div>

              <span className="flex w-20 shrink-0 items-baseline justify-start gap-2 text-[11px] tabular-nums">
                <span className="font-semibold text-adm-ink">{row.value}</span>
                {row.value > 0 && <span className="text-adm-muted">{pct}%</span>}
              </span>
            </div>
          );
        })}
      </div>

      <figcaption className="mt-3 border-t border-adm-line pt-2.5 text-[11px] text-adm-muted">
        {counted > 0 ? (
          <>
            {counted} האזנות נמדדו
            {totalPlays > counted && ` מתוך ${totalPlays} הפעלות`}
          </>
        ) : (
          'טרם נמדדו האזנות'
        )}
      </figcaption>
    </figure>
  );
}
