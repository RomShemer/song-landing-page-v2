import { useEffect, useRef, useState } from 'react';
import {
  FaCompress,
  FaDesktop,
  FaExpand,
  FaExternalLinkAlt,
  FaMobileAlt,
  FaSyncAlt,
} from 'react-icons/fa';
import App from '../../App';
import InfoTip from '../ui/InfoTip';
import TipButton from '../ui/TipButton';
import DeviceFrame from './DeviceFrame';
import { DEVICES } from './devices';
import { changedSections } from './changedSections';

const ICONS = { mobile: FaMobileAlt, desktop: FaDesktop };
const FLASH_MS = 1500;

// Panel chrome above and below the device (header, controls, padding) plus the
// sticky publish bar. Subtracted from the viewport so the whole card always fits
// without a scrollbar of its own.
const CHROME = { inline: 268, expanded: 196 };
const INLINE_WIDTH = { mobile: 300, desktop: 470 };

function useViewportHeight() {
  const [height, setHeight] = useState(() =>
    typeof window === 'undefined' ? 900 : window.innerHeight
  );

  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return height;
}

function useChangeFlash(content, rootRef) {
  const previous = useRef(content);

  useEffect(() => {
    const sections = changedSections(previous.current, content);
    previous.current = content;
    if (!sections.length || !rootRef.current) return;

    const nodes = sections
      .map((key) => rootRef.current.querySelector(`[data-section="${key}"]`))
      .filter(Boolean);

    nodes.forEach((node) => {
      node.classList.remove('preview-flash');
      // Force a reflow so re-adding the class restarts the animation on a
      // second edit to the same section.
      void node.offsetWidth;
      node.classList.add('preview-flash');
    });

    if (nodes[0]) {
      nodes[0].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    const timer = setTimeout(
      () => nodes.forEach((node) => node.classList.remove('preview-flash')),
      FLASH_MS
    );
    return () => clearTimeout(timer);
  }, [content, rootRef]);
}

export default function Preview({ content, isDirty }) {
  const [device, setDevice] = useState('mobile');
  const [mode, setMode] = useState('full');
  const [expanded, setExpanded] = useState(false);
  const [nonce, setNonce] = useState(0);
  const rootRef = useRef(null);
  const viewportHeight = useViewportHeight();

  useChangeFlash(content, rootRef);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => e.key === 'Escape' && setExpanded(false);
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [expanded]);

  const { width, height } = DEVICES[device];
  const room = viewportHeight - (expanded ? CHROME.expanded : CHROME.inline);
  const byHeight = Math.max(0.18, room / height);
  const scale = expanded
    ? Math.min(byHeight, (window.innerWidth - 160) / width, 1)
    : Math.min(byHeight, INLINE_WIDTH[device] / width);

  const previewUrl = `/song?preview=1${mode === 'listen_only' ? '&listen_only=true' : ''}`;

  const page = (
    <div ref={rootRef} className="contents">
      <App key={`${nonce}-${mode}`} content={content} viewMode={mode} />
    </div>
  );

  const controls = (
    <>
      <div className="flex items-center gap-1.5">
        <TipButton
          tip="תצוגת נייד — iPhone"
          icon={ICONS.mobile}
          onClick={() => setDevice('mobile')}
          pressed={device === 'mobile'}
          tone={device === 'mobile' ? 'active' : 'plain'}
        />
        <TipButton
          tip="תצוגת מסך שולחני"
          icon={ICONS.desktop}
          onClick={() => setDevice('desktop')}
          pressed={device === 'desktop'}
          tone={device === 'desktop' ? 'active' : 'plain'}
        />
        <TipButton
          tip="רענון התצוגה מחדש"
          icon={FaSyncAlt}
          onClick={() => setNonce((n) => n + 1)}
        />
        <TipButton
          tip={expanded ? 'יציאה מתצוגה מוגדלת' : 'הגדלת התצוגה על כל המסך'}
          icon={expanded ? FaCompress : FaExpand}
          onClick={() => setExpanded((v) => !v)}
        />
        <TipButton
          tip="פתיחת התצוגה בכרטיסייה חדשה"
          icon={FaExternalLinkAlt}
          href={previewUrl}
          tone="teal"
        />
      </div>

      <div className="flex gap-1.5">
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
    </>
  );

  if (expanded) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-adm-bg/95 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-adm-line bg-adm-card px-4 py-3">
          <h2 className="text-sm font-bold text-adm-ink">תצוגה מקדימה</h2>
          {controls}
        </div>
        <div className="flex flex-1 items-center justify-center overflow-auto p-6">
          <DeviceFrame device={device} scale={scale}>
            {page}
          </DeviceFrame>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-adm-line bg-adm-card p-4 shadow-[0_4px_20px_-8px_rgba(15,43,92,0.18)]">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-adm-ink">
            תצוגה מקדימה
            <InfoTip text="מציגה את העמוד האמיתי עם השינויים שטרם פורסמו. כל עריכה מהבהבת לרגע במקום שבו היא משפיעה." />
          </h2>
          <p className="mt-0.5 text-[11px] text-adm-muted">
            {isDirty ? 'כולל שינויים שלא פורסמו' : 'זהה לעמוד המפורסם'}
          </p>
        </div>
      </header>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">{controls}</div>

      <div className="mt-4 flex justify-center">
        <DeviceFrame device={device} scale={scale}>
          {page}
        </DeviceFrame>
      </div>
    </div>
  );
}
