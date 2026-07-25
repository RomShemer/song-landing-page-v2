import { FaBroadcastTower, FaHeadphones, FaLock } from 'react-icons/fa';
import { trackSongDownload } from '../utils/analytics';

function ActionCard({ icon: Icon, label, hint, href, onClick, tone, locked, fileName }) {
  const tones = {
    accent:
      'border-accent-500/40 bg-accent-500/15 text-accent-100 hover:bg-accent-500/25 hover:border-accent-500/60',
    plain: 'border-white/10 bg-white/[0.06] text-neutral-100 hover:bg-white/[0.12]',
  };

  const base =
    'flex flex-1 items-center justify-center gap-2.5 rounded-2xl border px-3 py-3.5 text-center transition active:scale-[0.98]';

  const body = (
    <>
      <span className="text-lg">{locked ? <FaLock /> : <Icon />}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{label}</span>
        {hint && <span className="block truncate text-[11px] opacity-70">{hint}</span>}
      </span>
    </>
  );

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
      download={fileName || undefined}
      onClick={onClick}
      className={`${base} ${tones[tone]}`}
    >
      {body}
    </a>
  );
}

/**
 * Above-the-fold file buttons — the two things a radio host or producer came
 * for, without opening an accordion. Streaming platforms are deliberately not
 * repeated here; the icon row under the title already covers them.
 *
 * Each file is shown only if it exists AND the client has enabled it.
 */
export default function PrimaryActions({
  downloads,
  flags,
  showDownloads,
  artist = '',
  title = '',
}) {
  const locked = Boolean(flags?.downloadsLocked);
  const slug = `${artist} - ${title}`.trim();

  const wav = downloads?.wavUrl && downloads?.showWav;
  const mp3 = downloads?.mp3Url && downloads?.showMp3;

  if (!showDownloads || (!wav && !mp3)) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        {wav && (
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
        {mp3 && (
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

      {locked && (
        <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
          {flags?.lockedMessage || 'ההורדות אינן זמינות כרגע.'}
        </p>
      )}
    </div>
  );
}
