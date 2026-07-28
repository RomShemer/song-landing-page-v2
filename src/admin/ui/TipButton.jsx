const TONES = {
  plain:
    'border border-adm-line bg-white text-adm-ink2 hover:border-adm-blue hover:text-adm-blue',
  active: 'bg-adm-blue text-white',
  teal: 'border border-adm-line bg-white text-adm-ink2 hover:border-adm-teal hover:text-adm-teal',
};

/**
 * Icon-only action with a styled hover tooltip, so every control in the
 * dashboard says what it does. Renders as a link when `href` is given.
 */
export default function TipButton({
  tip,
  icon: Icon,
  onClick,
  href,
  tone = 'plain',
  pressed,
  disabled,
  className = '',
  children,
}) {
  const shell = `group/tip relative inline-flex h-9 w-9 shrink-0 items-center justify-center
    rounded-lg text-xs transition disabled:opacity-30 ${TONES[tone]} ${className}`;

  const body = (
    <>
      {Icon ? <Icon /> : children}
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full right-1/2 z-40 mt-1 w-max max-w-[min(14rem,calc(100vw-2rem))]
          translate-x-1/2 rounded-lg border border-adm-line bg-white px-2 py-1 text-[11px]
          font-normal whitespace-nowrap text-adm-ink2 opacity-0 shadow-lg transition-opacity
          duration-150 group-hover/tip:opacity-100"
      >
        {tip}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={tip} className={shell}>
        {body}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={tip}
      aria-pressed={pressed}
      className={shell}
    >
      {body}
    </button>
  );
}
