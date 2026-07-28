import { FaApple, FaInstagram, FaSpotify, FaTiktok, FaYoutube } from 'react-icons/fa';

const PLATFORMS = [
  { key: 'spotify', label: 'Spotify', icon: FaSpotify, tone: 'text-[#1db954]' },
  { key: 'appleMusic', label: 'Apple Music', icon: FaApple, tone: 'text-adm-ink' },
  { key: 'youtube', label: 'YouTube', icon: FaYoutube, tone: 'text-[#ff0033]' },
  { key: 'tiktok', label: 'TikTok', icon: FaTiktok, tone: 'text-adm-ink' },
  { key: 'instagram', label: 'Instagram', icon: FaInstagram, tone: 'text-[#c13584]' },
];

export default function LinksEditor({ links, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PLATFORMS.map(({ key, label, icon: Icon, tone }) => (
        <div
          key={key}
          className="rounded-xl border border-adm-line bg-adm-bg/40 p-3 transition focus-within:border-adm-blue"
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-adm-line bg-white text-base ${tone}`}
            >
              <Icon />
            </span>
            <label htmlFor={`link-${key}`} className="text-sm font-semibold text-adm-ink">
              {label}
            </label>
          </div>

          <input
            id={`link-${key}`}
            type="text"
            dir="ltr"
            placeholder="https://"
            value={links[key] ?? ''}
            onChange={(e) => onChange(key, e.target.value)}
            className="mt-2.5 w-full rounded-lg border border-adm-line bg-white px-2.5 py-2 text-sm text-adm-ink placeholder:text-adm-muted focus:border-adm-blue focus:outline-none"
          />
        </div>
      ))}
    </div>
  );
}
