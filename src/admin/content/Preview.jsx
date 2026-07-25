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
    <div className="rounded-3xl border border-adm-line bg-adm-card p-4 shadow-[0_4px_20px_-8px_rgba(15,43,92,0.18)]">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-adm-ink">תצוגה מקדימה</h2>
          <p className="mt-0.5 text-[11px] text-adm-muted">
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
                  ? 'bg-adm-blue text-white'
                  : 'border border-adm-line bg-white text-adm-ink2 hover:border-adm-blue hover:text-adm-blue'
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-adm-line bg-white text-xs text-adm-ink2 transition hover:border-adm-blue hover:text-adm-blue"
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
                ? 'bg-adm-teal-soft text-adm-teal ring-1 ring-adm-teal/30'
                : 'border border-adm-line bg-white text-adm-ink2 hover:border-adm-teal hover:text-adm-teal'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* dir=ltr so the scaled box grows from the left edge; inside an RTL
          parent it would be anchored right and clip off-frame. */}
      <div
        dir="ltr"
        className="mt-3 overflow-hidden rounded-3xl border-4 border-adm-ink/10 bg-neutral-950 ring-1 ring-adm-line"
        style={{ width: frameWidth, height: height * scale }}
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <App key={`${nonce}-${mode}`} content={content} viewMode={mode} />
        </div>
      </div>
    </div>
  );
}
