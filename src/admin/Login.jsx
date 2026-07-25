import { useState } from 'react';
import { FaLock, FaSpinner } from 'react-icons/fa';

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setState('busy');
    setMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSuccess();
        return;
      }
      setState('idle');
      setMessage(res.status === 429 ? 'יותר מדי נסיונות — נסה שוב בעוד רגע' : 'סיסמה שגויה');
    } catch {
      setState('idle');
      setMessage('שירות ההתחברות עדיין לא מחובר');
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/20 text-accent-300">
            <FaLock />
          </span>
          <div>
            <h1 className="text-base font-bold text-white">כניסת מנהל</h1>
            <p className="text-[11px] text-neutral-500">ניהול תוכן ונתוני העמוד</p>
          </div>
        </div>

        <label htmlFor="admin-password" className="mt-5 block text-xs text-neutral-300">
          סיסמה
        </label>
        <input
          id="admin-password"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir="ltr"
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-neutral-100 focus:border-accent-500/60 focus:outline-none"
        />

        {message && <p className="mt-2 text-xs text-red-400">{message}</p>}

        <button
          type="submit"
          disabled={state === 'busy' || !password}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-400 disabled:opacity-40"
        >
          {state === 'busy' && <FaSpinner className="animate-spin" />}
          כניסה
        </button>
      </form>
    </div>
  );
}
