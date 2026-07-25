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

  const input = `w-full rounded-lg border border-adm-line bg-adm-bg/60 px-2.5 py-1.5
    text-sm text-adm-ink placeholder:text-adm-muted
    focus:border-adm-blue focus:bg-white focus:outline-none`;

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
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-adm-line bg-white text-[11px] text-adm-ink2 transition hover:border-adm-blue hover:text-adm-blue disabled:opacity-30"
            >
              <FaArrowUp />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === credits.length - 1}
              aria-label="הזזה למטה"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-adm-line bg-white text-[11px] text-adm-ink2 transition hover:border-adm-blue hover:text-adm-blue disabled:opacity-30"
            >
              <FaArrowDown />
            </button>
            <button
              type="button"
              onClick={() => onChange(credits.filter((_, idx) => idx !== i))}
              aria-label="מחיקה"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-adm-line bg-white text-[11px] text-adm-ink2 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...credits, { role: '', name: '' }])}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-adm-muted/50 px-3 py-2 text-xs text-adm-ink2 transition hover:border-adm-blue hover:text-adm-blue"
      >
        <FaPlus />
        הוספת קרדיט
      </button>
    </div>
  );
}
