import { FaArrowDown, FaArrowUp, FaPlus, FaTrash } from 'react-icons/fa';

export default function CreditsEditor({ credits, onChange }) {
  const set = (i, key, value) =>
    onChange(credits.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));

  const move = (i, delta) => {
    const next = [...credits];
    const target = i + delta;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  const input = `w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5
    text-sm text-neutral-100 placeholder:text-neutral-600
    focus:border-accent-500/60 focus:outline-none`;

  return (
    <div className="space-y-2">
      {credits.map((credit, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={credit.role}
            onChange={(e) => set(i, 'role', e.target.value)}
            placeholder="תפקיד"
            aria-label={`תפקיד ${i + 1}`}
            className={`${input} w-28 shrink-0`}
          />
          <input
            value={credit.name}
            onChange={(e) => set(i, 'name', e.target.value)}
            placeholder="שם"
            aria-label={`שם ${i + 1}`}
            className={input}
          />
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              aria-label="הזזה למעלה"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[11px] text-neutral-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <FaArrowUp />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === credits.length - 1}
              aria-label="הזזה למטה"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[11px] text-neutral-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <FaArrowDown />
            </button>
            <button
              type="button"
              onClick={() => onChange(credits.filter((_, idx) => idx !== i))}
              aria-label="מחיקה"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[11px] text-neutral-400 transition hover:bg-red-500/20 hover:text-red-300"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...credits, { role: '', name: '' }])}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-white/20 px-3 py-2 text-xs text-neutral-400 transition hover:border-accent-500/50 hover:text-accent-300"
      >
        <FaPlus />
        הוספת קרדיט
      </button>
    </div>
  );
}
