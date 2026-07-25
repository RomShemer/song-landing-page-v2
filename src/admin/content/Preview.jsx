import { useState } from 'react';
import { FaDesktop, FaMobileAlt, FaSyncAlt } from 'react-icons/fa';
import App from '../../App';

const DEVICES = {
  mobile: { width: 390, height: 780, icon: FaMobileAlt, label: 'נייד' },
  desktop: { width: 1280, height: 800, icon: FaDesktop, label: 'שולחני' },
};

export default function Preview({ content, isDirty }) {
  const [device, setDevice] = useState('mobile');
  const [mode, setMode] = useState('full');
  const [nonce, setNonce] = useState(0);

  const { width, height } = DEVICES[device];
  const frameWidth = device === 'mobile' ? 320 : 420;
  const scale = frameWidth / width;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white">תצוגה מקדימה</h2>
          <p className="mt-0.5 text-[11px] text-neutral-500">
            {isDirty ? 'כולל שינויים שלא פורסמו' : 'זהה לעמוד המפורסם'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {Object.entries(DEVICES).map(([key, { icon: Icon, label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setDevice(key)}
              aria-pressed={device === key}
              title={label}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs transition ${
                device === key
                  ? 'bg-accent-500 text-white'
                  : 'border border-white/10 text-neutral-400 hover:bg-white/10'
              }`}
            >
              <Icon />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setNonce((n) => n + 1)}
            title="רענון"
            aria-label="רענון תצוגה"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-xs text-neutral-400 transition hover:bg-white/10"
          >
            <FaSyncAlt />
          </button>
        </div>
      </header>

      <div className="mt-3 flex gap-1.5">
        {[
          ['full', 'הפצה מלאה'],
          ['listen_only', 'האזנה בלבד'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            aria-pressed={mode === key}
            className={`rounded-lg px-2.5 py-1 text-[11px] transition ${
              mode === key
                ? 'bg-white/15 text-white'
                : 'border border-white/10 text-neutral-400 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950"
        style={{ width: frameWidth, height: height * scale }}
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            overflowY: 'auto',
          }}
        >
          <App key={`${nonce}-${mode}`} content={content} viewMode={mode} />
        </div>
      </div>
    </div>
  );
}
