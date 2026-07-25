import { useId } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

// A span rather than a button so this can sit inside an accordion header without
// nesting interactive elements. The text stays in the DOM and is wired to the
// header through aria-describedby, so it reaches assistive tech either way.
export default function InfoTip({ text, id, className = '' }) {
  const autoId = useId();
  const tipId = id || autoId;

  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      <FaInfoCircle
        aria-hidden="true"
        className="text-[11px] text-adm-muted transition group-hover/tip:text-adm-blue"
      />
      <span
        id={tipId}
        role="tooltip"
        className="pointer-events-none absolute top-full right-1/2 z-40 mt-1.5 w-56
          translate-x-1/2 rounded-lg border border-adm-line bg-white px-2.5 py-2
          text-[11px] leading-relaxed font-normal text-adm-ink2 opacity-0 shadow-lg
          transition-opacity duration-150 group-hover/tip:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
