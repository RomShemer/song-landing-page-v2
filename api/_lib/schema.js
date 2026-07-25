// Kept in sync with src/fonts.js, which owns the labels and webfont metadata.
const FONT_KEYS = new Set([
  'system',
  'heebo',
  'assistant',
  'rubik',
  'noto-sans-hebrew',
  'alef',
  'varela-round',
  'arimo',
  'frank-ruhl',
  'noto-serif-hebrew',
  'david-libre',
  'miriam-libre',
  'bellefair',
  'tinos',
  'secular-one',
  'suez-one',
  'karantina',
  'amatic',
  'gveret-levin',
]);

export const TEXT_ALIGNS = new Set(['center', 'start']);
export const TEXT_TRANSFORMS = new Set(['none', 'uppercase']);

export const PLAYER_STYLES = new Set(['light', 'dark']);

export const SCHEMA_VERSION = 1;

export const EMPTY_CONTENT = {
  schemaVersion: SCHEMA_VERSION,
  song: { title: '', artist: '', releaseYear: null },
  theme: {
    accent: '#d99a4e',
    playerStyle: 'light',
    title: {
      font: 'system',
      weight: 200,
      letterSpacing: 0.5,
      sizeMin: 3.5,
      sizeFluid: 9,
      sizeMax: 8,
      align: 'center',
      transform: 'none',
    },
    subtitle: { font: 'system', weight: 500, letterSpacing: 0, size: 1.125 },
    sections: { font: 'system', weight: 500, size: 1 },
    body: { font: 'system', size: 0.9375 },
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
  content: { prText: '', prHtml: '', lyrics: '' },
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
const hexColor = (v, fallback) =>
  typeof v === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim())
    ? v.trim().toLowerCase()
    : fallback;
// Only http(s) and same-origin paths may reach the page. This blocks two real
// mistakes: a `blob:` URL from a failed upload, which exists only inside the tab
// that made it and would leave the page with a dead source, and a `javascript:`
// href, which would be an injection point in an <a> or an <img>.
const url = (v, fallback = '') => {
  // An absent field keeps the base value; an empty string is a deliberate clear.
  if (typeof v !== 'string') return fallback;
  const trimmed = v.trim();
  if (!trimmed) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : fallback;
};
const fontKey = (v, fallback) =>
  typeof v === 'string' && FONT_KEYS.has(v) ? v : fallback;
const oneOf = (v, allowed, fallback) => (allowed.has(v) ? v : fallback);
/** Clamped number, so a hand-edited document cannot produce unreadable type. */
const range = (v, min, max, fallback) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(Math.max(v, min), max) : fallback;
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
      playerStyle: oneOf(obj(i.theme).playerStyle, PLAYER_STYLES, b.theme.playerStyle),
      title: {
        // titleFont / bodyFont were flat before the per-element split; read them
        // as a fallback so an already-saved document keeps its fonts.
        font: fontKey(
          obj(obj(i.theme).title).font ?? obj(i.theme).titleFont,
          b.theme.title.font
        ),
        weight: range(obj(obj(i.theme).title).weight, 100, 900, b.theme.title.weight),
        letterSpacing: range(obj(obj(i.theme).title).letterSpacing, 0, 1, b.theme.title.letterSpacing),
        sizeMin: range(obj(obj(i.theme).title).sizeMin, 1.5, 8, b.theme.title.sizeMin),
        sizeFluid: range(obj(obj(i.theme).title).sizeFluid, 2, 20, b.theme.title.sizeFluid),
        sizeMax: range(obj(obj(i.theme).title).sizeMax, 2, 16, b.theme.title.sizeMax),
        align: oneOf(obj(obj(i.theme).title).align, TEXT_ALIGNS, b.theme.title.align),
        transform: oneOf(
          obj(obj(i.theme).title).transform,
          TEXT_TRANSFORMS,
          b.theme.title.transform
        ),
      },
      subtitle: {
        font: fontKey(obj(obj(i.theme).subtitle).font, b.theme.subtitle.font),
        weight: range(obj(obj(i.theme).subtitle).weight, 100, 900, b.theme.subtitle.weight),
        letterSpacing: range(obj(obj(i.theme).subtitle).letterSpacing, 0, 1, b.theme.subtitle.letterSpacing),
        size: range(obj(obj(i.theme).subtitle).size, 0.75, 3, b.theme.subtitle.size),
      },
      sections: {
        font: fontKey(obj(obj(i.theme).sections).font, b.theme.sections.font),
        weight: range(obj(obj(i.theme).sections).weight, 100, 900, b.theme.sections.weight),
        size: range(obj(obj(i.theme).sections).size, 0.8, 1.6, b.theme.sections.size),
      },
      body: {
        font: fontKey(
          obj(obj(i.theme).body).font ?? obj(i.theme).bodyFont,
          b.theme.body.font
        ),
        size: range(obj(obj(i.theme).body).size, 0.75, 1.5, b.theme.body.size),
      },
    },
    media: {
      coverImage: url(obj(i.media).coverImage, b.media.coverImage),
      showCover: bool(obj(i.media).showCover, b.media.showCover),
      backgroundImage: url(obj(i.media).backgroundImage, b.media.backgroundImage),
      audioStreamUrl: url(obj(i.media).audioStreamUrl, b.media.audioStreamUrl),
      videoUrl: url(obj(i.media).videoUrl, b.media.videoUrl),
    },
    links: {
      instagram: url(obj(i.links).instagram, b.links.instagram),
      tiktok: url(obj(i.links).tiktok, b.links.tiktok),
      youtube: url(obj(i.links).youtube, b.links.youtube),
      appleMusic: url(obj(i.links).appleMusic, b.links.appleMusic),
      spotify: url(obj(i.links).spotify, b.links.spotify),
    },
    content: {
      prText: str(obj(i.content).prText, b.content.prText),
      prHtml: str(obj(i.content).prHtml, b.content.prHtml),
      lyrics: str(obj(i.content).lyrics, b.content.lyrics),
    },
    credits: (i.credits === undefined ? b.credits : arr(i.credits))
      .map((c) => ({ role: str(obj(c).role), name: str(obj(c).name) }))
      .filter((c) => c.role || c.name),
    downloads: {
      mp3Url: url(obj(i.downloads).mp3Url, b.downloads.mp3Url),
      wavUrl: url(obj(i.downloads).wavUrl, b.downloads.wavUrl),
      showMp3: bool(obj(i.downloads).showMp3, b.downloads.showMp3),
      showWav: bool(obj(i.downloads).showWav, b.downloads.showWav),
      pressPdf: url(obj(i.downloads).pressPdf, b.downloads.pressPdf),
      imagesZip: url(obj(i.downloads).imagesZip, b.downloads.imagesZip),
      pressImages: (obj(i.downloads).pressImages === undefined
        ? b.downloads.pressImages
        : arr(obj(i.downloads).pressImages)
      )
        .map((img) => ({ src: url(obj(img).src), name: str(obj(img).name) }))
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
