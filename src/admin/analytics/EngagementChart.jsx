import { useState } from 'react';
import { SERIES, formatDay } from './series';

const PAD = { top: 12, right: 8, bottom: 26, left: 34 };
const H = 240;
const BAR_GAP = 2;

function niceMax(value) {
  if (value <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / (pow / 2)) * (pow / 2);
}

export default function EngagementChart({ data }) {
  const [hover, setHover] = useState(null);
  const [width, setWidth] = useState(720);

  const totals = data.map((d) => SERIES.reduce((sum, s) => sum + (d[s.key] || 0), 0));
  const max = niceMax(Math.max(1, ...totals));
  const ticks = [0, max / 4, max / 2, (max * 3) / 4, max];

  const plotW = Math.max(120, width - PAD.left - PAD.right);
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / Math.max(1, data.length);
  const barW = Math.min(38, Math.max(4, slot * 0.62));
  const y = (v) => PAD.top + plotH - (v / max) * plotH;

  const labelEvery = Math.ceil(data.length / (plotW / 46));

  return (
    <figure
      className="m-0"
      ref={(el) => {
        if (el && el.clientWidth && Math.abs(el.clientWidth - width) > 8) {
          setWidth(el.clientWidth);
        }
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label="האזנות והורדות לפי יום"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="#e3e9f6"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 7}
              y={y(t) + 3.5}
              textAnchor="end"
              className="fill-adm-muted text-[10px] tabular-nums"
            >
              {Math.round(t)}
            </text>
          </g>
        ))}

        {data.map((day, i) => {
          const x = PAD.left + i * slot + (slot - barW) / 2;
          let cursor = 0;
          const active = hover === i;

          return (
            <g
              key={day.date}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <rect
                x={PAD.left + i * slot}
                y={PAD.top}
                width={slot}
                height={plotH}
                fill={active ? '#f3f7ff' : 'transparent'}
              />

              {SERIES.map((s) => {
                const v = day[s.key] || 0;
                if (!v) return null;
                const h = (v / max) * plotH;
                const top = y(cursor + v);
                cursor += v;
                const gapped = Math.max(1, h - BAR_GAP);
                return (
                  <rect
                    key={s.key}
                    x={x}
                    y={top}
                    width={barW}
                    height={gapped}
                    rx="2"
                    fill={s.color}
                    opacity={hover === null || active ? 1 : 0.35}
                  />
                );
              })}

              {i % labelEvery === 0 && (
                <text
                  x={PAD.left + i * slot + slot / 2}
                  y={H - 9}
                  textAnchor="middle"
                  className="fill-adm-muted text-[10px] tabular-nums"
                >
                  {formatDay(day.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hover !== null && totals[hover] > 0 && (
        <div className="mt-2 rounded-xl border border-adm-line bg-white p-2.5 text-xs shadow-[0_6px_24px_-8px_rgba(15,43,92,0.3)]">
          <div className="mb-1 font-semibold text-adm-ink">{data[hover].date}</div>
          <dl className="space-y-0.5">
            {SERIES.filter((s) => data[hover][s.key]).map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: s.color }}
                />
                <dt className="flex-1 text-adm-ink2">{s.label}</dt>
                <dd className="font-semibold tabular-nums text-adm-ink">{data[hover][s.key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-adm-ink2">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: s.color }}
            />
            {s.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
