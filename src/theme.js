// Tailwind's accent utilities compile to var(--color-accent-N), so overriding
// those variables at runtime re-tints all of them. Do not move these into the
// @theme block as literals — that would make the colour uneditable.
import { fontStack } from './fonts';

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

export function fontVars({ titleFont, bodyFont } = {}) {
  return {
    '--font-title': fontStack(titleFont),
    '--font-body': fontStack(bodyFont),
  };
}

export function themeVars(theme = {}) {
  return { ...accentVars(theme.accent), ...fontVars(theme) };
}
