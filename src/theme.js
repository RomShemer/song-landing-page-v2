/**
 * The accent colour is client-configurable, so it cannot live in the Tailwind
 * theme block as a literal. Tailwind's accent utilities compile to
 * `var(--color-accent-N)` lookups, which means overriding those variables at
 * runtime re-tints every one of them — no per-component wiring needed.
 *
 * Only the base hue is stored; the ramp is derived with color-mix so the client
 * picks one colour rather than five.
 */
export function accentVars(accent) {
  if (!accent) return {};

  return {
    '--color-accent-100': `color-mix(in oklab, ${accent} 25%, white)`,
    '--color-accent-200': `color-mix(in oklab, ${accent} 45%, white)`,
    '--color-accent-300': `color-mix(in oklab, ${accent} 68%, white)`,
    '--color-accent-400': `color-mix(in oklab, ${accent} 86%, white)`,
    '--color-accent-500': accent,
    '--color-accent-600': `color-mix(in oklab, ${accent} 82%, black)`,
  };
}
