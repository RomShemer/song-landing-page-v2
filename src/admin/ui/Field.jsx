export function Label({ htmlFor, children, hint }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="block text-xs font-medium text-neutral-300">{children}</span>
      {hint && <span className="mt-0.5 block text-[11px] text-neutral-500">{hint}</span>}
    </label>
  );
}

const inputClass = `mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2
  text-sm text-neutral-100 placeholder:text-neutral-600
  focus:border-accent-500/60 focus:bg-white/[0.07] focus:outline-none`;

export function TextField({ label, hint, value, onChange, id, dir, ...rest }) {
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <input
        id={id}
        type="text"
        dir={dir}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        {...rest}
      />
    </div>
  );
}

export function NumberField({ label, hint, value, onChange, id, ...rest }) {
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <input
        id={id}
        type="number"
        dir="ltr"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className={inputClass}
        {...rest}
      />
    </div>
  );
}

export function TextArea({ label, hint, value, onChange, id, rows = 6, mono = false }) {
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <textarea
        id={id}
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-y leading-relaxed ${mono ? 'font-mono text-xs' : ''}`}
      />
    </div>
  );
}

export function SelectField({ label, hint, value, onChange, id, options }) {
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} cursor-pointer`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-neutral-900">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Toggle({ label, hint, value, onChange, id }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <span className="min-w-0">
        <span className="block text-xs font-medium text-neutral-200">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] text-neutral-500">{hint}</span>}
      </span>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={Boolean(value)}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
          value ? 'bg-accent-500' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            value ? 'start-[1.375rem]' : 'start-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function ColorField({ label, hint, value, onChange, id }) {
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
        />
        <input
          type="text"
          dir="ltr"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-sm text-neutral-100 focus:border-accent-500/60 focus:outline-none"
        />
      </div>
    </div>
  );
}
