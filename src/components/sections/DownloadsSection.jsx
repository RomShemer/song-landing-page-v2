import { FaFileAlt, FaFileArchive, FaImages, FaMusic } from 'react-icons/fa';
import DownloadCard from '../DownloadCard';
import { trackMediaDownload, trackSongDownload } from '../../utils/analytics';

/**
 * The single place downloads are offered. Every string on a card comes from
 * downloads.labels so the client owns the wording — it was previously hardcoded
 * here and again in an above-the-fold block, which is how the two ended up
 * disagreeing.
 *
 * Hidden entirely by the caller in listen-only mode. Audio masters are gated by
 * flags.downloadsLocked, and each respects its own showWav / showMp3 switch so
 * one can be offered without deleting the other's URL.
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
  const label = (key) => downloads.labels?.[key] || {};

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {locked && (
        <p className="col-span-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
          {flags?.lockedMessage || 'ההורדות אינן זמינות כרגע.'}
        </p>
      )}

      {downloads.wavUrl && downloads.showWav && (
        <DownloadCard
          icon={FaMusic}
          title={label('wav').title}
          subtitle={label('wav').subtitle}
          href={downloads.wavUrl}
          fileName={slug ? `${slug}.wav` : undefined}
          onClick={() => trackSongDownload('wav')}
          locked={locked}
        />
      )}

      {downloads.mp3Url && downloads.showMp3 && (
        <DownloadCard
          icon={FaMusic}
          title={label('mp3').title}
          subtitle={label('mp3').subtitle}
          href={downloads.mp3Url}
          fileName={slug ? `${slug}.mp3` : undefined}
          onClick={() => trackSongDownload('mp3')}
          locked={locked}
        />
      )}

      {downloads.pressPdf && (
        <DownloadCard
          icon={FaFileAlt}
          title={label('pressPdf').title}
          subtitle={label('pressPdf').subtitle}
          href={downloads.pressPdf}
          onClick={() => trackMediaDownload('pressPDF')}
        />
      )}

      {downloads.pressImages?.length > 0 && (
        <DownloadCard
          icon={FaImages}
          title={label('gallery').title}
          subtitle={label('gallery').subtitle}
          onClick={() => {
            trackMediaDownload('gallery_open');
            onOpenGallery();
          }}
        />
      )}

      {downloads.imagesZip && (
        <DownloadCard
          icon={FaFileArchive}
          title={label('imagesZip').title}
          subtitle={label('imagesZip').subtitle}
          href={downloads.imagesZip}
          onClick={() => trackMediaDownload('images')}
        />
      )}
    </div>
  );
}
