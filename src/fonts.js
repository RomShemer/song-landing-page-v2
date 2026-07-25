// Every face here must carry Hebrew glyphs. `system` is the default because the
// original CSS named Heebo but never loaded it, so the page always rendered in
// the OS UI face.
export const FONTS = [
  {
    key: 'system',
    label: 'ברירת מחדל (מערכת)',
    category: 'system',
    stack: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
  },

  { key: 'heebo', label: 'Heebo', category: 'sans', family: 'Heebo', weights: '100;200;300;400;500;600;700;800;900' },
  { key: 'assistant', label: 'Assistant', category: 'sans', family: 'Assistant', weights: '200;300;400;500;600;700;800' },
  { key: 'rubik', label: 'Rubik', category: 'sans', family: 'Rubik', weights: '300;400;500;600;700;800;900' },
  { key: 'noto-sans-hebrew', label: 'Noto Sans Hebrew', category: 'sans', family: 'Noto Sans Hebrew', weights: '100;200;300;400;500;600;700;800;900' },
  { key: 'alef', label: 'Alef', category: 'sans', family: 'Alef', weights: '400;700' },
  { key: 'varela-round', label: 'Varela Round', category: 'sans', family: 'Varela Round', weights: '400' },
  { key: 'arimo', label: 'Arimo', category: 'sans', family: 'Arimo', weights: '400;500;600;700' },

  { key: 'frank-ruhl', label: 'Frank Ruhl Libre', category: 'serif', family: 'Frank Ruhl Libre', weights: '300;400;500;600;700;800;900' },
  { key: 'noto-serif-hebrew', label: 'Noto Serif Hebrew', category: 'serif', family: 'Noto Serif Hebrew', weights: '100;200;300;400;500;600;700;800;900' },
  { key: 'david-libre', label: 'David Libre', category: 'serif', family: 'David Libre', weights: '400;500;700' },
  { key: 'miriam-libre', label: 'Miriam Libre', category: 'serif', family: 'Miriam Libre', weights: '400;700' },
  { key: 'bellefair', label: 'Bellefair', category: 'serif', family: 'Bellefair', weights: '400' },
  { key: 'tinos', label: 'Tinos', category: 'serif', family: 'Tinos', weights: '400;700' },

  { key: 'secular-one', label: 'Secular One', category: 'display', family: 'Secular One', weights: '400' },
  { key: 'suez-one', label: 'Suez One', category: 'display', family: 'Suez One', weights: '400' },
  { key: 'karantina', label: 'Karantina', category: 'display', family: 'Karantina', weights: '300;400;700' },
  { key: 'amatic', label: 'Amatic SC', category: 'display', family: 'Amatic SC', weights: '400;700' },
  { key: 'gveret-levin', label: 'Gveret Levin', category: 'display', family: 'Gveret Levin AlefAlefAlef', weights: '400' },
];

export const FONT_CATEGORIES = [
  { key: 'system', label: 'מערכת' },
  { key: 'sans', label: 'ללא סריף' },
  { key: 'serif', label: 'סריף' },
  { key: 'display', label: 'תצוגה' },
];

export const DEFAULT_FONT = 'system';

const BY_KEY = new Map(FONTS.map((f) => [f.key, f]));

export function isFontKey(key) {
  return BY_KEY.has(key);
}

export function fontStack(key) {
  const font = BY_KEY.get(key) || BY_KEY.get(DEFAULT_FONT);
  return font.stack || `'${font.family}', system-ui, sans-serif`;
}

/** The weights a face actually ships, so the picker cannot offer a fake one. */
export function fontWeights(key) {
  const font = BY_KEY.get(key);
  if (!font?.weights) return [200, 300, 400, 500, 600, 700, 800];
  return font.weights.split(';').map(Number);
}

export function googleFontsHref(keys) {
  const families = [...new Set(keys)]
    .map((key) => BY_KEY.get(key))
    .filter((font) => font?.family)
    .map(
      (font) =>
        `family=${font.family.replace(/ /g, '+')}:wght@${font.weights || '400;700'}`
    );

  if (!families.length) return null;
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}
