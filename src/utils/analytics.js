// src/utils/analytics.js

/**
 * פונקציית בסיס לשליחת אירועים ל-Google Analytics (GA4)
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/* ===============================
   EVENTS DEFINITIONS
   =============================== */

/* 🎵 הורדות שיר */
export function trackSongDownload(format) {
  trackEvent('download_song', {
    format, // 'mp3' | 'wav'
  });
}

/* 🖼️ הורדת מדיה */
export function trackMediaDownload(type) {
  trackEvent('download_media', {
    type, // 'images'
  });
}

/* ▶️ נגן מוזיקה */
export function trackAudioPlay(trackName) {
  trackEvent('audio_play', {
    track: trackName, // 'rutzi'
  });
}

/* 🌐 Social */
export function trackSocialClick(network) {
  trackEvent('social_click', {
    network, // 'instagram' | 'youtube' | 'tiktok'
  });
}

/* 📂 אקורדיונים */
export function trackAccordionOpen(section) {
  trackEvent('accordion_open', {
    section, // 'credits' | 'lyrics' | 'contact'
  });
}

export const trackContactClick = (type) => {
  window.gtag?.('event', 'contact_click', {
    contact_type: type
  });
};
