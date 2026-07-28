import { FaLock } from 'react-icons/fa';
import { downloadUrl } from '../utils/downloadUrl';

export default function DownloadCard({
  icon: Icon,
  title,
  subtitle,
  href,
  onClick,
  locked = false,
  fileName,
}) {
  const base = `group relative flex h-full items-center gap-3 overflow-hidden rounded-xl
    border px-3 py-3 text-right transition-all duration-300`;

  const interactive = `border-white/10 bg-white/[0.04]
    hover:-translate-y-0.5 hover:border-accent-500/50 hover:bg-white/[0.09]
    hover:shadow-[0_10px_28px_-12px_var(--color-accent-600)]
    active:translate-y-0 active:scale-[0.98]`;

  const body = (
    <>
      {!locked && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-y-full bg-gradient-to-b from-accent-500/20 to-transparent transition-transform duration-500 group-hover:translate-y-0"
          />
          <span
            aria-hidden="true"
            className="absolute inset-y-0 end-0 w-0.5 origin-top scale-y-0 bg-accent-500 transition-transform duration-300 group-hover:scale-y-100"
          />
        </>
      )}

      <span
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-base transition-colors ${
          locked
            ? 'bg-white/10 text-neutral-500'
            : 'bg-white/10 text-neutral-300 group-hover:bg-accent-500/25 group-hover:text-accent-200'
        }`}
      >
        {locked ? <FaLock /> : <Icon />}
      </span>

      <span className="relative min-w-0 flex-1">
        <span className="block text-sm leading-snug font-medium text-neutral-100">
          {title}
        </span>
        {subtitle && (
          <span className="mt-0.5 block text-[11px] leading-snug text-neutral-500 transition-colors group-hover:text-accent-300">
            {subtitle}
          </span>
        )}
      </span>
    </>
  );

  if (locked) {
    return (
      <div
        aria-disabled="true"
        className={`${base} cursor-not-allowed border-white/10 bg-white/[0.03] opacity-60`}
      >
        {body}
      </div>
    );
  }

  if (!href) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${interactive}`}>
        {body}
      </button>
    );
  }

  return (
    <a
      href={downloadUrl(href)}
      // Kept for the same-origin case, where the browser does honour it. The
      // ?download=1 above is what handles files served from Blob.
      download={fileName || true}
      onClick={onClick}
      className={`${base} ${interactive}`}
    >
      {body}
    </a>
  );
}
