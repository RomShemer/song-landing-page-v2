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

export function fontVars({ title = {}, subtitle = {}, sections = {}, body = {} } = {}) {
  return {
    '--font-title': fontStack(title.font),
    '--font-subtitle': fontStack(subtitle.font),
    '--font-sections': fontStack(sections.font),
    '--font-body': fontStack(body.font),
  };
}

/** Every font key the document references, for the loader. */
export function themeFontKeys(theme = {}) {
  return [theme.title?.font, theme.subtitle?.font, theme.sections?.font, theme.body?.font];
}

// cqw, not vw: inside the admin preview the page is laid out at a device width
// inside a scaled box, so viewport units would size type to the browser window
// and the preview would lie about how the title looks on a phone.
export function typeVars({ title = {}, subtitle = {}, sections = {}, body = {} } = {}) {
  const centred = title.align !== 'start';

  return {
    '--title-size': `clamp(${title.sizeMin}rem, ${title.sizeFluid}cqw, ${title.sizeMax}rem)`,
    '--title-weight': title.weight,
    '--title-spacing': `${title.letterSpacing}em`,
    '--title-align': centred ? 'center' : 'start',
    '--title-transform': title.transform,
    '--title-color': title.color,
    '--subtitle-size': `${subtitle.size}rem`,
    '--subtitle-weight': subtitle.weight,
    '--subtitle-spacing': `${subtitle.letterSpacing}em`,
    '--subtitle-color': subtitle.color,
    '--section-size': `${sections.size}rem`,
    '--section-weight': sections.weight,
    '--section-color': sections.color,
    '--body-size': `${body.size}rem`,
    '--body-color': body.color,
    // The cover art follows the title: centred title, centred artwork.
    '--cover-start': centred ? 'auto' : '0',
    '--cover-end': 'auto',
  };
}

// `stretch` is not a background-size keyword; it is 100% 100%, which is what
// filling the viewport regardless of aspect ratio actually means.
const BG_SIZE = { cover: 'cover', contain: 'contain', stretch: '100% 100%', auto: 'auto' };
const BG_POSITION = {
  center: 'center',
  top: 'center top',
  bottom: 'center bottom',
  start: 'right center',
  end: 'left center',
};

export function backgroundVars(background = {}) {
  const blur = background.blur ?? 0;

  return {
    '--bg-opacity': background.opacity ?? 0.55,
    '--bg-blur': `${blur}px`,
    '--bg-size': BG_SIZE[background.size] || 'cover',
    '--bg-position': BG_POSITION[background.position] || 'center',
    '--bg-overlay': background.overlay ?? 0.55,
    // A blurred layer samples past its own edges and would otherwise show a
    // soft frame; scaling up hides it. 40px of blur needs ~8% of growth.
    '--bg-scale': blur ? 1 + Math.min(blur, 40) / 500 : 1,
  };
}

export function themeVars(theme = {}) {
  return {
    ...accentVars(theme.accent),
    ...fontVars(theme),
    ...typeVars(theme),
    ...backgroundVars(theme.background),
  };
}
