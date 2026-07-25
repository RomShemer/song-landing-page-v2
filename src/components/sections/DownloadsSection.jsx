import { FaFileAlt, FaFileArchive, FaImages, FaMusic } from 'react-icons/fa';
import DownloadCard from '../DownloadCard';
import {
  trackMediaDownload,
  trackSongDownload,
} from '../../utils/analytics';

/**
 * Master files are gated by the client's downloadsLocked flag, which replaces
 * the hardcoded `const isDemo = true` and its alert(). Press collateral (PDF,
 * photos) stays available either way — only the audio masters are rights-sensitive.
 *
 * The whole section is hidden by the caller in listen-only mode.
 */
export default function DownloadsSection({
  downloads,
  flags,
  onOpenGallery,
  artist = '',
  title = '',
}) {
  const locked = Boolean(flags?.downloadsLocked);
  const slug = `${artist} - ${title}`.trim();

  return (
    <div className="flex flex-col gap-2.5">
      {locked && (
        <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
          {flags?.lockedMessage || 'ההורדות אינן זמינות כרגע.'}
        </p>
      )}

      {downloads.wavUrl && (
        <DownloadCard
          icon={FaMusic}
          title="הורדת WAV לשידור"
          subtitle="איכות שידור מלאה"
          href={downloads.wavUrl}
          fileName={slug ? `${slug}.wav` : undefined}
          onClick={() => trackSongDownload('wav')}
          locked={locked}
          emphasis
        />
      )}

      {downloads.mp3Url && (
        <DownloadCard
          icon={FaMusic}
          title="הורדת MP3"
          subtitle="להאזנה מהירה והפצה"
          href={downloads.mp3Url}
          fileName={slug ? `${slug}.mp3` : undefined}
          onClick={() => trackSongDownload('mp3')}
          locked={locked}
        />
      )}

      {downloads.pressPdf && (
        <DownloadCard
          icon={FaFileAlt}
          title="קומוניקט"
          subtitle="PDF"
          href={downloads.pressPdf}
          onClick={() => trackMediaDownload('pressPDF')}
        />
      )}

      {downloads.pressImages?.length > 0 && (
        <DownloadCard
          icon={FaImages}
          title="גלריית תמונות יח״צ"
          subtitle="בחירת תמונות להורדה"
          onClick={() => {
            trackMediaDownload('gallery_open');
            onOpenGallery();
          }}
        />
      )}

      {downloads.imagesZip && (
        <DownloadCard
          icon={FaFileArchive}
          title="כל התמונות"
          subtitle="ZIP"
          href={downloads.imagesZip}
          onClick={() => trackMediaDownload('images')}
        />
      )}
    </div>
  );
}
