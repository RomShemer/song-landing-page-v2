// The single allowlist for what a browser may increment. Anything not named
// here is dropped, so a public endpoint cannot be used to write arbitrary
// counter names into KV.

export const VIEW_MODES = ['full', 'listen_only'];
export const NETWORKS = ['spotify', 'appleMusic', 'youtube', 'tiktok', 'instagram'];
export const SECTIONS = ['gallery', 'clip', 'pr', 'lyrics', 'credits', 'downloads', 'contact'];
export const CONTACT_TYPES = ['phone', 'email'];

// Upper bound of each bucket in seconds; mirrors DURATION_BUCKETS in
// src/admin/analytics/series.js, which owns the labels and colours.
const LISTEN_BUCKETS = [
  ['0-10', 10],
  ['10-30', 30],
  ['30-60', 60],
  ['60-120', 120],
  ['120+', Infinity],
];

const MAX_LISTEN_SECONDS = 3 * 3600;

export function listenBucket(seconds) {
  return LISTEN_BUCKETS.find(([, upper]) => seconds <= upper)[0];
}

/** Fields a day's hash gains from this event, or null if it is not allowed. */
function fieldsFor(event, params) {
  const one = (field) => ({ [field]: 1 });
  const member = (list, value) => (list.includes(value) ? value : null);

  switch (event) {
    case 'page_view': {
      const mode = member(VIEW_MODES, params.mode) || 'full';
      return { page_view: 1, [`page_view:${mode}`]: 1 };
    }

    case 'play_audio':
      return one('play_audio');

    case 'listen_seconds': {
      const seconds = Math.round(Number(params.seconds));
      if (!Number.isFinite(seconds) || seconds < 1) return null;
      const capped = Math.min(seconds, MAX_LISTEN_SECONDS);
      return {
        listen_seconds: capped,
        [`listen_buckets:${listenBucket(capped)}`]: 1,
      };
    }

    case 'download_mp3':
    case 'download_wav':
    case 'download_pdf':
    case 'download_photos':
      return one(event);

    case 'social_click': {
      const network = member(NETWORKS, params.network);
      return network && one(`social_click:${network}`);
    }

    case 'accordion_open': {
      const section = member(SECTIONS, params.section);
      return section && one(`accordion_open:${section}`);
    }

    case 'contact_click': {
      const type = member(CONTACT_TYPES, params.type);
      return type && one(`contact_click:${type}`);
    }

    default:
      return null;
  }
}

// How long one visitor's repeat of an event is ignored. Page views collapse per
// day and plays per half hour; a deliberate second download is a real signal
// and is not deduped at all.
const DEDUPE_TTL = { page_view: 86400, play_audio: 1800 };

/**
 * Validates one incoming event.
 * @returns {{fields: Object, dedupe: string|null, ttl: number}|null}
 */
export function normalizeEvent(input) {
  if (!input || typeof input !== 'object') return null;
  const event = String(input.event || '');
  const params = typeof input.params === 'object' && input.params ? input.params : input;

  const fields = fieldsFor(event, params);
  if (!fields) return null;

  const ttl = DEDUPE_TTL[event] || 0;
  const scope = event === 'page_view' ? `page_view:${params.mode || 'full'}` : event;
  return { fields, dedupe: ttl ? scope : null, ttl };
}

/** Stable per-visitor id for dedupe. Not stored, only hashed into a key. */
export async function visitorHash(...parts) {
  const data = new TextEncoder().encode(parts.filter(Boolean).join('|'));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .slice(0, 10)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
