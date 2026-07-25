/**
 * Font choices offered in the dashboard. All of them carry Hebrew glyphs —
 * a Latin-only face would render the page in a fallback and look broken.
 *
 * `system` is the default and reproduces how the page looked before: the old
 * App.css asked for Heebo but never loaded the webfont, so it always fell back
 * to the operating system's UI face.
 */
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

/**
 * Google Fonts css2 URL for the given keys, or null when every choice is a
 * system stack and no network request is needed.
 */
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
