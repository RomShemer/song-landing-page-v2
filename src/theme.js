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

/** A hex colour plus a separate opacity, as one rgba() the browser can use. */
function rgba(hex, alpha) {
  const value = String(hex || '').replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) || 0);
  return `rgb(${r} ${g} ${b} / ${alpha ?? 1})`;
}

const SHADOWS = {
  none: 'none',
  soft: '0 10px 30px -18px rgb(0 0 0 / 0.7)',
  strong: '0 24px 60px -20px rgb(0 0 0 / 0.9)',
};

const EDGE = { center: 'auto', start: '0', end: 'auto' };

export function coverVars(cover = {}) {
  const filters = [];
  if (cover.blur) filters.push(`blur(${cover.blur}px)`);
  if (cover.brightness !== undefined && cover.brightness !== 1) {
    filters.push(`brightness(${cover.brightness})`);
  }

  return {
    '--cover-width': `${cover.width ?? 14}rem`,
    '--cover-radius': `${cover.radius ?? 24}px`,
    '--cover-filter': filters.length ? filters.join(' ') : 'none',
    '--cover-shadow': SHADOWS[cover.shadow] ?? SHADOWS.strong,
    // Which edge the artwork hugs; `auto` on both sides centres it.
    '--cover-start': EDGE[cover.position] ?? 'auto',
    '--cover-end': cover.position === 'end' ? '0' : 'auto',
  };
}

export function layoutVars(layout = {}) {
  return {
    '--layout-width': `${layout.maxWidth ?? 36}rem`,
    '--layout-gap': `${layout.blockGap ?? 1.25}rem`,
    '--layout-top': `${layout.topSpace ?? 2.5}rem`,
  };
}

/** The accordion panels — the page's main surface. */
export function panelVars(sections = {}) {
  return {
    '--panel-bg': rgba(sections.panelColor ?? '#ffffff', sections.panelOpacity ?? 0.06),
    '--panel-border': rgba(sections.borderColor ?? '#ffffff', sections.borderOpacity ?? 0.1),
    '--panel-radius': `${sections.radius ?? 16}px`,
    '--panel-gap': `${sections.gap ?? 0.75}rem`,
    '--panel-padding': `${sections.padding ?? 1}rem`,
    '--panel-icon-bg':
      sections.iconTint === 'neutral'
        ? 'rgb(255 255 255 / 0.1)'
        : 'color-mix(in oklab, var(--color-accent-500) 22%, transparent)',
    '--panel-icon-color':
      sections.iconTint === 'neutral' ? 'rgb(255 255 255 / 0.75)' : 'var(--color-accent-300)',
  };
}

// cqw, not vw: inside the admin preview the page is laid out at a device width
// inside a scaled box, so viewport units would size type to the browser window
// and the preview would lie about how the title looks on a phone.
export function typeVars({ title = {}, subtitle = {}, sections = {}, body = {} } = {}) {
  return {
    '--title-size': `clamp(${title.sizeMin}rem, ${title.sizeFluid}cqw, ${title.sizeMax}rem)`,
    '--title-weight': title.weight,
    '--title-spacing': `${title.letterSpacing}em`,
    '--title-align': title.align === 'start' ? 'start' : 'center',
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
    '--title-gap-above': `${title.gapAbove ?? 0.9375}rem`,
    '--title-gap-below': `${title.gapBelow ?? 1.5625}rem`,
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
    ...panelVars(theme.sections),
    ...coverVars(theme.cover),
    ...layoutVars(theme.layout),
    ...backgroundVars(theme.background),
  };
}
