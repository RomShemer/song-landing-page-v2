import { FaLock } from 'react-icons/fa';

/**
 * One download affordance, laid out vertically so two fit side by side without
 * truncating Hebrew labels.
 *
 * Renders as an <a download> when a file is available and unlocked, as a
 * <button> when it opens something in-app (the gallery), and as an inert card
 * when the client has locked downloads.
 *
 * No card is visually emphasised: clicking one starts a download rather than
 * selecting anything, so a highlighted card would imply state that cannot exist.
 * Hover carries the affordance instead, matching the credits cards.
 */
export default function DownloadCard({
  icon: Icon,
  title,
  subtitle,
  href,
  onClick,
  locked = false,
  fileName,
}) {
  const base = `group relative flex h-full flex-col items-center gap-2 overflow-hidden rounded-xl
    border px-3 py-4 text-center transition-all duration-300`;

  const interactive = `border-white/10 bg-white/[0.04]
    hover:-translate-y-0.5 hover:border-accent-500/50 hover:bg-white/[0.09]
    hover:shadow-[0_10px_28px_-12px_var(--color-accent-600)]
    active:translate-y-0 active:scale-[0.98]`;

  const body = (
    <>
      {/* Accent wash sweeping down, and a rail on the reading edge. */}
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

      <span className="relative min-w-0">
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

  // No href means the card triggers in-app behaviour, which is a button.
  if (!href) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${interactive}`}>
        {body}
      </button>
    );
  }

  return (
    <a
      href={href}
      download={fileName || true}
      onClick={onClick}
      className={`${base} ${interactive}`}
    >
      {body}
    </a>
  );
}
