import { FaArrowDown, FaArrowUp, FaPlus } from 'react-icons/fa';
import DeleteButton from '../ui/DeleteButton';

const ROLES = [
  'מילים',
  'לחן',
  'הפקה מוזיקלית',
  'עיבוד',
  'מיקס',
  'מאסטרינג',
  'וידאו',
  'צילום',
  'סטיילינג',
  'יח״צ',
];

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

  const input = `w-full rounded-lg border border-adm-line bg-adm-bg/60 px-2.5 py-2
    text-sm text-adm-ink placeholder:text-adm-muted
    focus:border-adm-blue focus:bg-white focus:outline-none`;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[8rem_1fr_auto] items-center gap-2 px-0.5">
        <span className="text-[11px] font-semibold text-adm-muted">סוג הקרדיט</span>
        <span className="text-[11px] font-semibold text-adm-muted">שם</span>
        <span className="w-[7.25rem]" />
      </div>

      {credits.map((credit, i) => (
        <div key={i} className="grid grid-cols-[8rem_1fr_auto] items-center gap-2">
          <input
            list="credit-roles"
            value={credit.role}
            onChange={(e) => set(i, 'role', e.target.value)}
            placeholder="מילים"
            aria-label={`סוג הקרדיט ${i + 1}`}
            className={`${input} font-medium`}
          />
          <input
            value={credit.name}
            onChange={(e) => set(i, 'name', e.target.value)}
            placeholder="שם מלא"
            aria-label={`שם ${i + 1}`}
            className={input}
          />
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              aria-label="הזזה למעלה"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-adm-line bg-white text-[11px] text-adm-ink2 transition hover:border-adm-blue hover:text-adm-blue disabled:opacity-30"
            >
              <FaArrowUp />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === credits.length - 1}
              aria-label="הזזה למטה"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-adm-line bg-white text-[11px] text-adm-ink2 transition hover:border-adm-blue hover:text-adm-blue disabled:opacity-30"
            >
              <FaArrowDown />
            </button>
            <DeleteButton
              onClick={() => onChange(credits.filter((_, idx) => idx !== i))}
              label={`מחיקת ${credit.role || 'קרדיט'}`}
            />
          </div>
        </div>
      ))}

      <datalist id="credit-roles">
        {ROLES.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

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
