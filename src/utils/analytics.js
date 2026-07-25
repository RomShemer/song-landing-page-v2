// Events go to our own /api/track rather than to a third party, so an ad
// blocker cannot hide the numbers from the artist. The server drops any event
// name it does not recognise.

const ENDPOINT = '/api/track';

// The admin renders the real page inside its preview, and the pop-out preview
// opens /song?preview=1. Neither is a visitor, so neither may count.
const enabled = (() => {
  if (typeof window === 'undefined') return false;
  const { pathname, search } = window.location;
  return pathname !== '/admin' && !new URLSearchParams(search).has('preview');
})();

function send(event, params = {}) {
  if (!enabled) return;
  const body = JSON.stringify({ event, ...params });

  // sendBeacon survives the page being closed, which is exactly when the last
  // listen report is sent.
  if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }))) return;

  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function trackPageView(mode) {
  send('page_view', { mode });
}

export function trackAudioPlay() {
  send('play_audio');
}

/** Elapsed play time, reported when playback stops rather than when it starts. */
export function trackListenSeconds(seconds) {
  if (seconds >= 1) send('listen_seconds', { seconds: Math.round(seconds) });
}

const SONG_EVENTS = { mp3: 'download_mp3', wav: 'download_wav' };

export function trackSongDownload(format) {
  const event = SONG_EVENTS[format];
  if (event) send(event);
}

const MEDIA_EVENTS = {
  pressPDF: 'download_pdf',
  images: 'download_photos',
  gallery_image: 'download_photos',
};

export function trackMediaDownload(type) {
  const event = MEDIA_EVENTS[type];
  if (event) send(event);
}

export function trackSocialClick(network) {
  send('social_click', { network });
}

export function trackAccordionOpen(section) {
  send('accordion_open', { section });
}

export function trackContactClick(type) {
  send('contact_click', { type });
}
