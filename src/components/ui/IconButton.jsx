/**
 * Round glass button with a touch-friendly 44px minimum target.
 */
export default function IconButton({
  className = '',
  size = 'md',
  children,
  ...rest
}) {
  const sizes = {
    sm: 'h-10 w-10 text-base',
    md: 'h-11 w-11 text-lg',
    lg: 'h-16 w-16 text-2xl',
  };

  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-neutral-100 backdrop-blur-md transition hover:bg-white/20 active:scale-95 disabled:opacity-40 ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
