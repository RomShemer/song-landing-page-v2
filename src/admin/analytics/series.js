// Validated for the white admin surface: passes the lightness band, chroma
// floor, adjacent CVD separation (worst ΔE 9.1) and normal-vision floor (19.6).
// Three slots fall under 3:1 contrast, which the legend and table view cover.
export const SERIES = [
  { key: 'play_audio', label: 'האזנות', color: '#2a78d6' },
  { key: 'download_wav', label: 'WAV', color: '#eb6834' },
  { key: 'download_mp3', label: 'MP3', color: '#1baf7a' },
  { key: 'download_pdf', label: 'קומוניקט', color: '#eda100' },
  { key: 'download_photos', label: 'תמונות', color: '#e87ba4' },
];

export function formatDay(iso) {
  const [, m, d] = iso.split('-');
  return `${Number(d)}.${Number(m)}`;
}

export function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
