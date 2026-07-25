export default function CreditsSection({ credits = [] }) {
  if (!credits.length) return null;

  return (
    <dl className="grid grid-cols-2 gap-2.5">
      {credits.map((credit, i) => (
        <div
          key={`${credit.role}-${i}`}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
        >
          <dt className="text-[11px] tracking-wide text-neutral-500 uppercase">
            {credit.role}
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-neutral-100">{credit.name}</dd>
        </div>
      ))}
    </dl>
  );
}
