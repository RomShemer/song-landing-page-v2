/**
 * Single source of truth for the content document shape.
 *
 * Imported by the API routes directly and by the client through the `@schema`
 * Vite alias, so validation can never drift between the two sides.
 */

export const SCHEMA_VERSION = 1;

export const EMPTY_CONTENT = {
  schemaVersion: SCHEMA_VERSION,
  song: { title: '', artist: '', releaseYear: null },
  media: {
    coverImage: '',
    backgroundImage: '',
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
    pressPdf: '',
    imagesZip: '',
    pressImages: [],
  },
  contact: { phone: '', email: '' },
  flags: { downloadsLocked: false, lockedMessage: '' },
  updatedAt: null,
};

const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback);
const bool = (v, fallback = false) => (typeof v === 'boolean' ? v : fallback);
const num = (v, fallback = null) =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;
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
    media: {
      coverImage: str(obj(i.media).coverImage, b.media.coverImage),
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
      pressPdf: str(obj(i.downloads).pressPdf, b.downloads.pressPdf),
      imagesZip: str(obj(i.downloads).imagesZip, b.downloads.imagesZip),
      pressImages: (obj(i.downloads).pressImages === undefined
        ? b.downloads.pressImages
        : arr(obj(i.downloads).pressImages)
      )
        .map((img) => ({ src: str(obj(img).src), name: str(obj(img).name) }))
        .filter((img) => img.src),
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
