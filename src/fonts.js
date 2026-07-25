// Every face here must carry Hebrew glyphs. `system` is the default because the
// original CSS named Heebo but never loaded it, so the page always rendered in
// the OS UI face.
export const FONTS = [
  {
    key: 'system',
    label: 'ברירת מחדל (מערכת)',
    stack: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
  },
  { key: 'heebo', label: 'Heebo', family: 'Heebo', weights: '300;400;500;700;900' },
  { key: 'assistant', label: 'Assistant', family: 'Assistant', weights: '300;400;600;700;800' },
  { key: 'rubik', label: 'Rubik', family: 'Rubik', weights: '300;400;500;700;900' },
  { key: 'alef', label: 'Alef', family: 'Alef', weights: '400;700' },
  { key: 'secular-one', label: 'Secular One', family: 'Secular One', weights: '400' },
  { key: 'suez-one', label: 'Suez One', family: 'Suez One', weights: '400' },
  { key: 'karantina', label: 'Karantina', family: 'Karantina', weights: '300;400;700' },
  { key: 'amatic', label: 'Amatic SC', family: 'Amatic SC', weights: '400;700' },
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
