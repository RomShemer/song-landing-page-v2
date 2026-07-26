import { createContext, useContext } from 'react';

// Separate from Toast.jsx so that file exports only components, which is what
// fast refresh needs to swap them without dropping state.
export const ToastContext = createContext(null);

/**
 * `const toast = useToast()` → toast.success('...') / toast.error('...').
 * Throws outside the provider: a message that silently goes nowhere is worse
 * than a loud wiring mistake.
 */
export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside <ToastProvider>');
  return value;
}
