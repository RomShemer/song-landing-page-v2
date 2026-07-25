import { useEffect } from 'react';
import { googleFontsHref } from '../fonts';

const LINK_ID = 'dynamic-webfonts';

export function useWebFonts(keys) {
  const href = googleFontsHref(keys.filter(Boolean));

  useEffect(() => {
    const existing = document.getElementById(LINK_ID);

    if (!href) {
      existing?.remove();
      return;
    }
    if (existing?.getAttribute('href') === href) return;

    const link = existing || document.createElement('link');
    link.id = LINK_ID;
    link.rel = 'stylesheet';
    link.href = href;
    if (!existing) document.head.appendChild(link);
  }, [href]);
}
