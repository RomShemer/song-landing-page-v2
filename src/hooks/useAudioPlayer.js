import { useCallback, useEffect, useRef, useState } from 'react';

/** Seconds → m:ss, with a dash while duration is still unknown. */
export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Drives a hidden <audio> element for the custom player UI.
 *
 * @param {{ src: string, onFirstPlay?: () => void }} options
 *   onFirstPlay fires once per mount, latched via a ref, so pause→play does
 *   not inflate the play counter.
 */
export function useAudioPlayer({ src, onFirstPlay } = {}) {
  const audioRef = useRef(null);
  const firstPlayFired = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMutedState] = useState(false);

  // A new source makes the previous track's progress meaningless. Adjusted
  // during render rather than in an effect so there is no frame showing the
  // old position against the new track.
  const [loadedSrc, setLoadedSrc] = useState(src);
  if (loadedSrc !== src) {
    setLoadedSrc(src);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(false);
  }

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () => setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    const onTime = () => setCurrentTime(el.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => {
      setError(true);
      setIsPlaying(false);
    };
    // Mirror changes made outside the UI (media keys, OS mixer).
    const onVolume = () => {
      setVolumeState(el.volume);
      setMutedState(el.muted);
    };

    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('durationchange', onLoaded);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    el.addEventListener('volumechange', onVolume);

    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('durationchange', onLoaded);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
      el.removeEventListener('volumechange', onVolume);
    };
  }, [src]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    if (el.paused) {
      if (!firstPlayFired.current) {
        firstPlayFired.current = true;
        onFirstPlay?.();
      }
      el.play().catch(() => setError(true));
    } else {
      el.pause();
    }
  }, [onFirstPlay]);

  /** @param {number} seconds absolute position, clamped to the track */
  const seek = useCallback((seconds) => {
    const el = audioRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    const next = Math.min(Math.max(seconds, 0), el.duration);
    el.currentTime = next;
    setCurrentTime(next);
  }, []);

  /** @param {number} delta seconds relative to the current position */
  const skip = useCallback(
    (delta) => seek((audioRef.current?.currentTime ?? 0) + delta),
    [seek]
  );

  /** @param {number} next 0..1 — setting a level also unmutes, as users expect */
  const setVolume = useCallback((next) => {
    const el = audioRef.current;
    if (!el) return;
    const clamped = Math.min(Math.max(next, 0), 1);
    el.volume = clamped;
    el.muted = clamped === 0;
  }, []);

  const toggleMute = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    // Coming back from a level of 0 would stay silent, so restore a usable one.
    if (el.muted || el.volume === 0) {
      el.muted = false;
      if (el.volume === 0) el.volume = 1;
    } else {
      el.muted = true;
    }
  }, []);

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    error,
    volume,
    muted,
    toggle,
    seek,
    skip,
    setVolume,
    toggleMute,
  };
}
