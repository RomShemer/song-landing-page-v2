/**
 * Single source of truth for the content document shape.
 *
 * Imported by the API routes directly and by the client through the `@schema`
 * Vite alias, so validation can never drift between the two sides.
 */

// Kept in sync with src/fonts.js, which owns the labels and webfont metadata.
const FONT_KEYS = new Set([
  'system',
  'heebo',
  'assistant',
  'rubik',
  'alef',
  'secular-one',
  'suez-one',
  'karantina',
  'amatic',
]);

export const PLAYER_STYLES = new Set(['light', 'dark']);

export const SCHEMA_VERSION = 1;

export const EMPTY_CONTENT = {
  schemaVersion: SCHEMA_VERSION,
  song: { title: '', artist: '', releaseYear: null },
  theme: {
    accent: '#d99a4e',
    titleFont: 'system',
    bodyFont: 'system',
    playerStyle: 'light',
  },
  media: {
    coverImage: '',
    backgroundImage: '',
    showCover: false,
    audioStreamUrl: '',
    videoUrl: '',
  },
  links: {
    instagram: '',
    tiktok: '',
    youtube: '',
    appleMusic: '',
    spotify: '',
  },
  content: { prHtml: '', lyrics: '' },
  credits: [],
  downloads: {
    mp3Url: '',
    wavUrl: '',
    showMp3: true,
    showWav: true,
    pressPdf: '',
    imagesZip: '',
    pressImages: [],
    labels: {
      wav: { title: '', subtitle: '' },
      mp3: { title: '', subtitle: '' },
      pressPdf: { title: '', subtitle: '' },
      gallery: { title: '', subtitle: '' },
      imagesZip: { title: '', subtitle: '' },
    },
  },
  contact: { phone: '', email: '' },
  flags: { downloadsLocked: false, lockedMessage: '' },
  updatedAt: null,
};

const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback);
const bool = (v, fallback = false) => (typeof v === 'boolean' ? v : fallback);
const num = (v, fallback = null) =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;
/** Only #rgb / #rrggbb survive — the value lands in a CSS custom property. */
const hexColor = (v, fallback) =>
  typeof v === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim())
    ? v.trim().toLowerCase()
    : fallback;
/**
 * Font keys are validated against the shared registry so an unknown value can
 * never reach the page as an arbitrary CSS font-family.
 */
const fontKey = (v, fallback) =>
  typeof v === 'string' && FONT_KEYS.has(v) ? v : fallback;
const oneOf = (v, allowed, fallback) => (allowed.has(v) ? v : fallback);
/** Per-card wording, so the client owns every string the page shows. */
const labelSet = (v, base) =>
  Object.fromEntries(
    Object.keys(base).map((key) => [
      key,
      {
        title: str(obj(obj(v)[key]).title, base[key].title),
        subtitle: str(obj(obj(v)[key]).subtitle, base[key].subtitle),
      },
    ])
  );
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const arr = (v) => (Array.isArray(v) ? v : []);

/**
 * Coerce arbitrary input into a valid content document: every key present,
 * unknown keys dropped, wrong types replaced by the default. Never throws.
 */
export function normalizeContent(input, base = EMPTY_CONTENT) {
  const i = obj(input);
  const b = base;

  return {
    schemaVersion: SCHEMA_VERSION,
    song: {
      title: str(obj(i.song).title, b.song.title),
      artist: str(obj(i.song).artist, b.song.artist),
      releaseYear: num(obj(i.song).releaseYear, b.song.releaseYear),
    },
    theme: {
      accent: hexColor(obj(i.theme).accent, b.theme.accent),
      titleFont: fontKey(obj(i.theme).titleFont, b.theme.titleFont),
      bodyFont: fontKey(obj(i.theme).bodyFont, b.theme.bodyFont),
      playerStyle: oneOf(obj(i.theme).playerStyle, PLAYER_STYLES, b.theme.playerStyle),
    },
    media: {
      coverImage: str(obj(i.media).coverImage, b.media.coverImage),
      showCover: bool(obj(i.media).showCover, b.media.showCover),
      backgroundImage: str(obj(i.media).backgroundImage, b.media.backgroundImage),
      audioStreamUrl: str(obj(i.media).audioStreamUrl, b.media.audioStreamUrl),
      videoUrl: str(obj(i.media).videoUrl, b.media.videoUrl),
    },
    links: {
      instagram: str(obj(i.links).instagram, b.links.instagram),
      tiktok: str(obj(i.links).tiktok, b.links.tiktok),
      youtube: str(obj(i.links).youtube, b.links.youtube),
      appleMusic: str(obj(i.links).appleMusic, b.links.appleMusic),
      spotify: str(obj(i.links).spotify, b.links.spotify),
    },
    content: {
      prHtml: str(obj(i.content).prHtml, b.content.prHtml),
      lyrics: str(obj(i.content).lyrics, b.content.lyrics),
    },
    credits: (i.credits === undefined ? b.credits : arr(i.credits))
      .map((c) => ({ role: str(obj(c).role), name: str(obj(c).name) }))
      .filter((c) => c.role || c.name),
    downloads: {
      mp3Url: str(obj(i.downloads).mp3Url, b.downloads.mp3Url),
      wavUrl: str(obj(i.downloads).wavUrl, b.downloads.wavUrl),
      showMp3: bool(obj(i.downloads).showMp3, b.downloads.showMp3),
      showWav: bool(obj(i.downloads).showWav, b.downloads.showWav),
      pressPdf: str(obj(i.downloads).pressPdf, b.downloads.pressPdf),
      imagesZip: str(obj(i.downloads).imagesZip, b.downloads.imagesZip),
      pressImages: (obj(i.downloads).pressImages === undefined
        ? b.downloads.pressImages
        : arr(obj(i.downloads).pressImages)
      )
        .map((img) => ({ src: str(obj(img).src), name: str(obj(img).name) }))
        .filter((img) => img.src),
      labels: labelSet(obj(i.downloads).labels, b.downloads.labels),
    },
    contact: {
      phone: str(obj(i.contact).phone, b.contact.phone),
      email: str(obj(i.contact).email, b.contact.email),
    },
    flags: {
      downloadsLocked: bool(obj(i.flags).downloadsLocked, b.flags.downloadsLocked),
      lockedMessage: str(obj(i.flags).lockedMessage, b.flags.lockedMessage),
    },
    updatedAt: str(i.updatedAt, b.updatedAt) || null,
  };
}
