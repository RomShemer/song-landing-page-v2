import {
  FaApple,
  FaInstagram,
  FaSpotify,
  FaTiktok,
  FaYoutube,
} from 'react-icons/fa';
import { trackSocialClick } from '../utils/analytics';

const NETWORKS = [
  { key: 'spotify', icon: FaSpotify, label: 'Spotify' },
  { key: 'appleMusic', icon: FaApple, label: 'Apple Music' },
  { key: 'youtube', icon: FaYoutube, label: 'YouTube' },
  { key: 'instagram', icon: FaInstagram, label: 'Instagram' },
  { key: 'tiktok', icon: FaTiktok, label: 'TikTok' },
];

export default function SocialRow({ links }) {
  const available = NETWORKS.filter(({ key }) => links?.[key]);
  if (!available.length) return null;

  return (
    <nav aria-label="פלטפורמות האזנה ורשתות" className="flex justify-center gap-2.5">
      {available.map(({ key, icon: Icon, label }) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          onClick={() => trackSocialClick(key)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-lg text-neutral-200 backdrop-blur-md transition hover:bg-white/15 hover:text-white active:scale-95"
        >
          <Icon />
        </a>
      ))}
    </nav>
  );
}
