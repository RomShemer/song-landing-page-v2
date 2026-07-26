import { useCallback, useMemo, useRef, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import { ToastContext } from './toastContext';

// Two variants, one shape: the type carries the colour and the icon, the text
// says what happened. Both backgrounds were checked rather than eyeballed —
// 5.4:1 and 6.6:1 against the white text, and both clear 3:1 against the page,
// so the bar itself has a visible edge.
const VARIANTS = {
  success: { bg: '#0f7a45', Icon: FaCheckCircle, role: 'status', live: 'polite', ms: 4000 },
  error: { bg: '#b42318', Icon: FaExclamationCircle, role: 'alert', live: 'assertive', ms: 7000 },
};

/** The bar on its own, for anywhere a message should sit inline. */
export function Toast({ type = 'success', text, onDismiss }) {
  const { bg, Icon, role, live } = VARIANTS[type] || VARIANTS.success;

  return (
    <div
      role={role}
      aria-live={live}
      style={{ backgroundColor: bg }}
      className="pointer-events-auto flex w-full max-w-lg items-center gap-3 rounded-xl px-4 py-3
        text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(15,43,92,0.55)]"
    >
      <Icon aria-hidden="true" className="shrink-0 text-base" />
      <span className="min-w-0 flex-1">{text}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="סגירת ההודעה"
          className="-me-1 shrink-0 rounded-lg p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
}

const MAX_VISIBLE = 3;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type, text) => {
      if (!text) return null;
      const id = ++nextId.current;
      // Oldest fall off the top rather than growing a wall of bars.
      setToasts((current) => [...current, { id, type, text }].slice(-MAX_VISIBLE));
      setTimeout(() => dismiss(id), (VARIANTS[type] || VARIANTS.success).ms);
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      show,
      dismiss,
      success: (text) => show('success', text),
      error: (text) => show('error', text),
    }),
    [show, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Above the publish bar, not over it — that bar is what a message is
          usually about. Non-interactive except for the bars themselves. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
