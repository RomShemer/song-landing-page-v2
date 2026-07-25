import { useEffect, useRef, useState } from 'react';
import { FaCheck, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';

export default function CopyField({ label, hint, value }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-xl border border-adm-line bg-adm-bg/60 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-adm-ink">{label}</span>
        {hint && <span className="text-[11px] text-adm-muted">{hint}</span>}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <code
          dir="ltr"
          className="min-w-0 flex-1 truncate rounded-lg border border-adm-line bg-white px-2.5 py-2 font-mono text-xs text-adm-ink2"
        >
          {value}
        </code>

        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          aria-label={`פתיחת ${label}`}
          title="פתיחה בכרטיסייה חדשה"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-adm-line bg-white text-xs text-adm-ink2 transition hover:border-adm-blue hover:text-adm-blue"
        >
          <FaExternalLinkAlt />
        </a>

        <button
          type="button"
          onClick={copy}
          className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-medium transition ${
            copied
              ? 'bg-adm-teal-soft text-adm-teal'
              : 'bg-adm-blue text-white hover:bg-adm-blue-hover'
          }`}
        >
          {copied ? <FaCheck /> : <FaCopy />}
          {copied ? 'הועתק' : 'העתקה'}
        </button>
      </div>
    </div>
  );
}
