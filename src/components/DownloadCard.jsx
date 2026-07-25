import { FaLock } from 'react-icons/fa';

/**
 * One download affordance. Renders as an <a download> when a file is available
 * and unlocked, as a <button> when it opens something in-app, and as an inert
 * card when the client has locked downloads.
 */
export default function DownloadCard({
  icon: Icon,
  title,
  subtitle,
  href,
  onClick,
  locked = false,
  fileName,
  emphasis = false,
}) {
  const base =
    'flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-right transition active:scale-[0.98]';
  const tone = emphasis
    ? 'border-accent-500/40 bg-accent-500/15 hover:bg-accent-500/25'
    : 'border-white/10 bg-white/[0.06] hover:bg-white/[0.12]';

  const body = (
    <>
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base ${
          locked
            ? 'bg-white/10 text-neutral-500'
            : emphasis
              ? 'bg-accent-500/30 text-accent-200'
              : 'bg-white/10 text-neutral-300'
        }`}
      >
        {locked ? <FaLock /> : <Icon />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-neutral-100">
          {title}
        </span>
        <span className="block truncate text-xs text-neutral-500">{subtitle}</span>
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

  // No href means the card triggers in-app behaviour (e.g. opening the gallery),
  // which is a button, not a link.
  if (!href) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${tone} w-full`}>
        {body}
      </button>
    );
  }

  return (
    <a href={href} download={fileName || true} onClick={onClick} className={`${base} ${tone}`}>
      {body}
    </a>
  );
}
