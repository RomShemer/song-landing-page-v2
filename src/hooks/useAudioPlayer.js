import { useCallback, useEffect, useRef, useState } from 'react';

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function useAudioPlayer({ src, onFirstPlay } = {}) {
  const audioRef = useRef(null);
  const firstPlayFired = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMutedState] = useState(false);

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

  const seek = useCallback((seconds) => {
    const el = audioRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    const next = Math.min(Math.max(seconds, 0), el.duration);
    el.currentTime = next;
    setCurrentTime(next);
  }, []);

  const skip = useCallback(
    (delta) => seek((audioRef.current?.currentTime ?? 0) + delta),
    [seek]
  );

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
