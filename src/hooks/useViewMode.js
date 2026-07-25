/**
 * Reads the share-link mode from the URL.
 *
 *   ?listen_only=true   → stream only, every download affordance hidden
 *   ?download=false     → legacy alias for the same thing
 *
 * @returns {'listen_only' | 'full'}
 */
export function readViewMode(search = window.location.search) {
  const params = new URLSearchParams(search);
  const listenOnly = params.get('listen_only') === 'true';
  const noDownload = params.get('download') === 'false';
  return listenOnly || noDownload ? 'listen_only' : 'full';
}

// The URL cannot change without a reload (no client-side navigation), so this
// is read once rather than being reactive state.
export function useViewMode() {
  return readViewMode();
}
