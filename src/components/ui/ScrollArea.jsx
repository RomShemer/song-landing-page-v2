export default function ScrollArea({ maxHeight = '22rem', className = '', children }) {
  return (
    <div
      style={{ maxHeight }}
      className={`overflow-y-auto overscroll-contain pe-1
        [mask-image:linear-gradient(to_bottom,black_calc(100%-2.5rem),transparent)]
        [scrollbar-color:var(--color-accent-500)_transparent] [scrollbar-width:thin]
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20
        [&::-webkit-scrollbar-thumb:hover]:bg-white/35
        [&::-webkit-scrollbar-track]:bg-transparent ${className}`}
    >
      {children}
    </div>
  );
}
