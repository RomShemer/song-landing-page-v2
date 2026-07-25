import { FaPause, FaPlay, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { formatTime, useAudioPlayer } from '../hooks/useAudioPlayer';
import { trackAudioPlay, trackListenSeconds } from '../utils/analytics';

const RANGE = `h-6 cursor-pointer appearance-none bg-transparent
  [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full
  [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--player-fill)_var(--progress),var(--player-track)_var(--progress))]
  [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:bg-[var(--player-thumb)] [&::-webkit-slider-thumb]:shadow
  [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full
  [&::-moz-range-track]:bg-[var(--player-track)]
  [&::-moz-range-progress]:h-1.5 [&::-moz-range-progress]:rounded-full
  [&::-moz-range-progress]:bg-[var(--player-fill)]
  [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:border-0
  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--player-thumb)]`;

const VARIANTS = {
  light: {
    vars: {
      '--player-track': 'rgba(0,0,0,0.16)',
      '--player-fill': 'var(--color-accent-500)',
      '--player-thumb': '#171717',
    },
    shell: 'border-black/10 bg-white shadow-[0_8px_28px_-10px_rgba(0,0,0,0.45)]',
    time: 'text-neutral-500',
    volume: 'text-neutral-500 hover:bg-black/5 hover:text-neutral-900',
    error: 'text-red-600',
  },
  dark: {
    vars: {
      '--player-track': 'rgba(255,255,255,0.18)',
      '--player-fill': 'var(--color-accent-400)',
      '--player-thumb': '#ffffff',
    },
    shell: 'border-white/10 bg-white/[0.07] backdrop-blur-md',
    time: 'text-neutral-400',
    volume: 'text-neutral-400 hover:bg-white/10 hover:text-neutral-100',
    error: 'text-red-400',
  },
};

export default function AudioPlayer({ src, variant = 'light', sticky = false }) {
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
  } = useAudioPlayer({
    src,
    onFirstPlay: trackAudioPlay,
    onListened: trackListenSeconds,
  });

  if (!src) return null;

  const v = VARIANTS[variant] || VARIANTS.light;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const level = muted ? 0 : volume;

  return (
    <div
      style={v.vars}
      className={`${v.shell} ${
        sticky
          ? 'sticky bottom-0 z-30 -mx-4 border-t px-4 py-3 pb-[calc(0.75rem+var(--safe-bottom))] sm:static sm:mx-0 sm:rounded-full sm:border sm:px-4 sm:py-2.5'
          : 'rounded-full border px-4 py-2.5'
      }`}
    >
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
          <p dir="rtl" className={`flex-1 text-xs ${v.error}`}>
            לא ניתן לטעון את קובץ השמע
          </p>
        ) : (
          <>
            <span className={`shrink-0 text-xs tabular-nums ${v.time}`}>
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
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${v.volume}`}
              >
                {muted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>

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
