export function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

export function trackSongDownload(format) {
  trackEvent('download_song', {
    format,
  });
}

export function trackMediaDownload(type) {
  trackEvent('download_media', {
    type,
  });
}

export function trackAudioPlay(trackName) {
  trackEvent('audio_play', {
    track: trackName,
  });
}

export function trackSocialClick(network) {
  trackEvent('social_click', {
    network,
  });
}

export function trackAccordionOpen(section) {
  trackEvent('accordion_open', {
    section,
  });
}

export const trackContactClick = (type) => {
  window.gtag?.('event', 'contact_click', {
    contact_type: type
  });
};
