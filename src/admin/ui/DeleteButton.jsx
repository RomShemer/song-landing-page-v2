import { FaTrash } from 'react-icons/fa';

export default function DeleteButton({ onClick, label = 'מחיקה', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group/tip relative inline-flex h-9 w-9 shrink-0 items-center justify-center
        text-sm text-red-400 transition hover:text-red-600 ${className}`}
    >
      <FaTrash />
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full right-1/2 z-40 mt-1 w-max max-w-48
          translate-x-1/2 rounded-lg border border-adm-line bg-white px-2 py-1 text-[11px]
          font-normal whitespace-nowrap text-adm-ink2 opacity-0 shadow-lg transition-opacity
          duration-150 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </button>
  );
}
