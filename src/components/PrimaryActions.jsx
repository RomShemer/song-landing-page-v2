import { FaApple, FaBroadcastTower, FaSpotify, FaYoutube, FaLock, FaHeadphones } from 'react-icons/fa';
import { trackSocialClick, trackSongDownload } from '../utils/analytics';

const PLATFORMS = [
  { key: 'spotify', icon: FaSpotify, label: 'Spotify' },
  { key: 'appleMusic', icon: FaApple, label: 'Apple Music' },
  { key: 'youtube', icon: FaYoutube, label: 'YouTube' },
];

function ActionCard({ icon: Icon, label, hint, href, onClick, tone, locked, fileName }) {
  const tones = {
    accent: 'border-accent-500/40 bg-accent-500/15 hover:bg-accent-500/25 text-accent-100',
    plain: 'border-white/10 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-100',
  };

  const body = (
    <>
      <span className="text-lg">{locked ? <FaLock /> : <Icon />}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{label}</span>
        {hint && <span className="block truncate text-[11px] opacity-70">{hint}</span>}
      </span>
    </>
  );

  const base =
    'flex flex-1 items-center justify-center gap-2.5 rounded-2xl border px-3 py-3.5 text-center transition active:scale-[0.98]';

  if (locked) {
    return (
      <div
        aria-disabled="true"
        className={`${base} cursor-not-allowed border-white/10 bg-white/[0.03] text-neutral-500`}
      >
        {body}
      </div>
    );
  }

  return (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      download={fileName || undefined}
      onClick={onClick}
      className={`${base} ${tones[tone]}`}
    >
      {body}
    </a>
  );
}

/**
 * The above-the-fold conversion block: where to stream the track, and — unless
 * the link is listen-only or the client has locked downloads — the two files a
 * radio host or producer actually came for.
 */
export default function PrimaryActions({
  links,
  downloads,
  flags,
  showDownloads,
  artist = '',
  title = '',
}) {
  const platforms = PLATFORMS.filter(({ key }) => links?.[key]);
  const locked = Boolean(flags?.downloadsLocked);
  const slug = `${artist} - ${title}`.trim();

  const hasFiles = Boolean(downloads?.wavUrl || downloads?.mp3Url);
  if (!platforms.length && !(showDownloads && hasFiles)) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {platforms.length > 0 && (
        <div className="flex flex-col gap-2.5 sm:flex-row">
          {platforms.map(({ key, icon, label }) => (
            <ActionCard
              key={key}
              icon={icon}
              label={label}
              hint="להאזנה"
              href={links[key]}
              tone="plain"
              onClick={() => trackSocialClick(key)}
            />
          ))}
        </div>
      )}

      {showDownloads && hasFiles && (
        <div className="flex flex-col gap-2.5 sm:flex-row">
          {downloads.wavUrl && (
            <ActionCard
              icon={FaBroadcastTower}
              label="הורדת WAV"
              hint="איכות שידור"
              href={downloads.wavUrl}
              fileName={slug ? `${slug}.wav` : true}
              tone="accent"
              locked={locked}
              onClick={() => trackSongDownload('wav')}
            />
          )}
          {downloads.mp3Url && (
            <ActionCard
              icon={FaHeadphones}
              label="הורדת MP3"
              hint="להאזנה מהירה"
              href={downloads.mp3Url}
              fileName={slug ? `${slug}.mp3` : true}
              tone="plain"
              locked={locked}
              onClick={() => trackSongDownload('mp3')}
            />
          )}
        </div>
      )}

      {showDownloads && hasFiles && locked && (
        <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
          {flags?.lockedMessage || 'ההורדות אינן זמינות כרגע.'}
        </p>
      )}
    </div>
  );
}
