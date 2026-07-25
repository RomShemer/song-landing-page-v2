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
    <div className="flex min-h-dvh items-center justify-center bg-adm-bg p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-adm-line bg-adm-card p-6 shadow-[0_10px_40px_-12px_rgba(15,43,92,0.28)]"
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-soft text-adm-blue">
            <FaLock />
          </span>
          <div>
            <h1 className="text-base font-bold text-adm-ink">כניסת מנהל</h1>
            <p className="text-[11px] text-adm-muted">ניהול תוכן ונתוני העמוד</p>
          </div>
        </div>

        <label htmlFor="admin-password" className="mt-5 block text-xs font-semibold text-adm-ink">
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
          className="mt-1.5 w-full rounded-xl border border-adm-line bg-adm-bg/60 px-3 py-2.5 text-sm text-adm-ink focus:border-adm-blue focus:bg-white focus:ring-2 focus:ring-adm-blue/15 focus:outline-none"
        />

        {message && <p className="mt-2 text-xs text-red-500">{message}</p>}

        <button
          type="submit"
          disabled={state === 'busy' || !password}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-adm-blue py-2.5 text-sm font-semibold text-white transition hover:bg-adm-blue-hover disabled:opacity-40"
        >
          {state === 'busy' && <FaSpinner className="animate-spin" />}
          כניסה
        </button>
      </form>
    </div>
  );
}
