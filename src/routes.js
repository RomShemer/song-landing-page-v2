/**
 * Tiny pathname router — two destinations only, so no need for react-router.
 * Anything that isn't /admin renders the public landing page (/ and /song).
 */
export function resolveRoute(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  return path === '/admin' ? 'admin' : 'landing';
}
