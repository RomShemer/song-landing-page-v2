export function resolveRoute(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  return path === '/admin' ? 'admin' : 'landing';
}
