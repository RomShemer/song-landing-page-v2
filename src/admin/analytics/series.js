// Validated against the dataviz palette validator for the dark surface #171717:
// all five pass the lightness band, chroma floor, adjacent CVD separation
// (worst ΔE 8.4), normal-vision floor (19.3) and 3:1 contrast.
export const SERIES = [
  { key: 'play_audio', label: 'האזנות', color: '#3987e5' },
  { key: 'download_wav', label: 'WAV', color: '#d95926' },
  { key: 'download_mp3', label: 'MP3', color: '#199e70' },
  { key: 'download_pdf', label: 'קומוניקט', color: '#c98500' },
  { key: 'download_photos', label: 'תמונות', color: '#d55181' },
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
