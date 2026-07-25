import { FaTrash } from 'react-icons/fa';

export default function DeleteButton({ onClick, label = 'מחיקה', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-xs text-red-500 transition hover:border-red-400 hover:bg-red-100 hover:text-red-600 ${className}`}
    >
      <FaTrash />
    </button>
  );
}
