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

// Ordinal ramp, validated for the white surface: monotone lightness, adjacent
// gaps >= 0.06, light end at 2.11:1, single hue.
export const DURATION_BUCKETS = [
  { key: '0-10', label: 'עד 10 שנ׳', color: '#86b6ef' },
  { key: '10-30', label: '10–30 שנ׳', color: '#5598e7' },
  { key: '30-60', label: '30–60 שנ׳', color: '#2a78d6' },
  { key: '60-120', label: '1–2 דק׳', color: '#1c5cab' },
  { key: '120+', label: 'מעל 2 דק׳', color: '#104281' },
];
