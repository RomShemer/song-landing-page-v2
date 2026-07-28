// A browser honours the `download` attribute only for same-origin URLs. Once the
// masters live on Vercel Blob the link is cross-origin, so the attribute is
// ignored and clicking an MP3 or a PDF opens it in the tab — an audio player
// instead of a download, which is not what a radio station wants.
//
// Blob answers `?download=1` with Content-Disposition: attachment, which is the
// only thing that actually forces the save dialog. A proxy could not do it: a
// serverless response body caps well below a 43 MB WAV.
const BLOB_HOST = /(^|\.)(vercel-storage\.com|public\.blob\.vercel-storage\.com)$/i;

export function downloadUrl(url) {
  if (!url) return url;
  // Relative paths are same-origin, where the attribute already works.
  if (!/^https?:\/\//i.test(url)) return url;

  try {
    const parsed = new URL(url);
    if (!BLOB_HOST.test(parsed.hostname)) return url;
    parsed.searchParams.set('download', '1');
    return parsed.toString();
  } catch {
    return url;
  }
}
