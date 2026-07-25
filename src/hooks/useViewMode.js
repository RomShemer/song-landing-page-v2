export function readViewMode(search = window.location.search) {
  const params = new URLSearchParams(search);
  const listenOnly = params.get('listen_only') === 'true';
  const noDownload = params.get('download') === 'false';
  return listenOnly || noDownload ? 'listen_only' : 'full';
}

export function useViewMode() {
  return readViewMode();
}
