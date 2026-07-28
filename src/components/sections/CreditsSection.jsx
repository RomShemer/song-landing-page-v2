export default function CreditsSection({ credits = [] }) {
  if (!credits.length) return null;

  return (
    <dl className="grid grid-cols-2 gap-2.5">
      {credits.map((credit, i) => (
        <div
          key={`${credit.role}-${i}`}
          className="group relative overflow-hidden rounded-xl border border-white/10
            bg-white/[0.04] px-3 py-3 transition-all duration-300
            hover:-translate-y-0.5 hover:border-accent-500/50 hover:bg-white/[0.09]
            hover:shadow-[0_10px_28px_-12px_var(--color-accent-600)]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-y-full bg-gradient-to-b
              from-accent-500/20 to-transparent transition-transform duration-500
              group-hover:translate-y-0"
          />
          <span
            aria-hidden="true"
            className="absolute inset-y-0 end-0 w-0.5 origin-top scale-y-0 bg-accent-500
              transition-transform duration-300 group-hover:scale-y-100"
          />

          <dt className="relative text-[0.72em] tracking-wide text-neutral-500 uppercase transition-colors group-hover:text-accent-300">
            {credit.role}
          </dt>
          <dd className="relative mt-0.5 text-[0.95em] font-medium">
            {credit.name}
          </dd>
        </div>
      ))}
    </dl>
  );
}
