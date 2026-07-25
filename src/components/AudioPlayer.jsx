import { FaPause, FaPlay } from 'react-icons/fa';
import { formatTime, useAudioPlayer } from '../hooks/useAudioPlayer';
import { trackAudioPlay } from '../utils/analytics';

/**
 * Custom player replacing the native <audio controls>.
 *
 * The progress bar is a range input styled to look like a track — it comes with
 * pointer dragging, keyboard arrows and correct ARIA for free, which a div with
 * click handlers would not.
 */
export default function AudioPlayer({ src, title, artist, sticky = false }) {
  const { audioRef, isPlaying, currentTime, duration, error, toggle, seek } =
    useAudioPlayer({ src, onFirstPlay: () => trackAudioPlay(title || 'track') });

  if (!src) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={
        sticky
          ? 'sticky bottom-0 z-30 -mx-4 border-t border-white/10 bg-neutral-950/80 px-4 pt-3 pb-[calc(0.75rem+var(--safe-bottom))] backdrop-blur-xl sm:static sm:mx-0 sm:rounded-2xl sm:border sm:bg-white/[0.06] sm:p-4 sm:backdrop-blur-md'
          : 'rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md'
      }
    >
      {/* Element is hidden on purpose: the UI below is the control surface. */}
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={error}
          aria-label={isPlaying ? 'עצור' : 'נגן'}
          className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xl text-white shadow-[0_8px_24px_-6px_var(--color-accent-500)] transition hover:bg-accent-400 active:scale-95 disabled:opacity-40 disabled:shadow-none"
        >
          {isPlaying ? <FaPause /> : <FaPlay className="ms-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-medium text-neutral-100">
              {title}
            </span>
            {artist && (
              <span className="truncate text-xs text-neutral-500">{artist}</span>
            )}
          </div>

          {error ? (
            <p className="mt-1 text-xs text-red-400">לא ניתן לטעון את קובץ השמע</p>
          ) : (
            <>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                disabled={!duration}
                aria-label="מיקום בשיר"
                aria-valuetext={`${formatTime(currentTime)} מתוך ${formatTime(duration)}`}
                dir="ltr"
                style={{ '--progress': `${progress}%` }}
                className="mt-2 h-6 w-full cursor-pointer appearance-none bg-transparent
                  [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full
                  [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--color-accent-400)_var(--progress),rgba(255,255,255,0.15)_var(--progress))]
                  [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow
                  [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/15
                  [&::-moz-range-progress]:h-1.5 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-accent-400
                  [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
              />

              <div dir="ltr" className="flex justify-between text-[11px] tabular-nums text-neutral-500">
                <span>{formatTime(currentTime)}</span>
                <span>{duration ? formatTime(duration) : '--:--'}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
