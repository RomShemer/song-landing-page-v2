import { FaPause, FaPlay, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { formatTime, useAudioPlayer } from '../hooks/useAudioPlayer';
import { trackAudioPlay } from '../utils/analytics';

/** Shared styling for the two range inputs — a filled track with a round thumb. */
const RANGE = `h-6 cursor-pointer appearance-none bg-transparent
  [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full
  [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--color-accent-400)_var(--progress),rgba(255,255,255,0.18)_var(--progress))]
  [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow
  [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/18
  [&::-moz-range-progress]:h-1.5 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-accent-400
  [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:border-0
  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white`;

/**
 * Single-row player laid out like the native control it replaces: play, elapsed
 * / total, progress, volume. The song title is deliberately not repeated —
 * it is already the largest thing on the page, directly above.
 *
 * Both sliders are range inputs rather than divs with click handlers, so
 * dragging, keyboard arrows and screen-reader semantics come for free.
 */
export default function AudioPlayer({ src, title, sticky = false }) {
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    error,
    volume,
    muted,
    toggle,
    seek,
    setVolume,
    toggleMute,
  } = useAudioPlayer({ src, onFirstPlay: () => trackAudioPlay(title || 'track') });

  if (!src) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const level = muted ? 0 : volume;

  return (
    <div
      className={
        sticky
          ? 'sticky bottom-0 z-30 -mx-4 border-t border-white/10 bg-neutral-950/85 px-4 py-3 pb-[calc(0.75rem+var(--safe-bottom))] backdrop-blur-xl sm:static sm:mx-0 sm:rounded-full sm:border sm:bg-white/[0.07] sm:px-4 sm:py-2.5 sm:backdrop-blur-md'
          : 'rounded-full border border-white/10 bg-white/[0.07] px-4 py-2.5 backdrop-blur-md'
      }
    >
      {/* Hidden on purpose: the row below is the control surface. */}
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-3" dir="ltr">
        <button
          type="button"
          onClick={toggle}
          disabled={error}
          aria-label={isPlaying ? 'עצור' : 'נגן'}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-500 text-base text-white shadow-[0_6px_18px_-6px_var(--color-accent-500)] transition hover:bg-accent-400 active:scale-95 disabled:opacity-40 disabled:shadow-none"
        >
          {isPlaying ? <FaPause /> : <FaPlay className="ms-0.5" />}
        </button>

        {error ? (
          <p dir="rtl" className="flex-1 text-xs text-red-400">
            לא ניתן לטעון את קובץ השמע
          </p>
        ) : (
          <>
            <span className="shrink-0 text-xs tabular-nums text-neutral-400">
              {formatTime(currentTime)} / {duration ? formatTime(duration) : '--:--'}
            </span>

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
              style={{ '--progress': `${progress}%` }}
              className={`min-w-0 flex-1 ${RANGE}`}
            />

            <div className="group flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted || volume === 0 ? 'בטל השתקה' : 'השתק'}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm text-neutral-400 transition hover:bg-white/10 hover:text-neutral-100"
              >
                {muted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>

              {/* Collapsed to nothing until hover or keyboard focus — width alone
                  left the thumb visible as a stray dot, so opacity carries it.
                  Hidden entirely on phones, where the hardware keys own volume. */}
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={level}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="עוצמת שמע"
                style={{ '--progress': `${level * 100}%` }}
                className={`hidden w-0 opacity-0 transition-all duration-200
                  group-hover:w-16 group-hover:opacity-100
                  group-focus-within:w-16 group-focus-within:opacity-100
                  sm:block ${RANGE}`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
