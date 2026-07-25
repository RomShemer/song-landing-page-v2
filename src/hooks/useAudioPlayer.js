import { useCallback, useEffect, useRef, useState } from 'react';

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function useAudioPlayer({ src, onFirstPlay, onListened } = {}) {
  const audioRef = useRef(null);
  const firstPlayFired = useRef(false);
  const listened = useRef(0);
  const playingSince = useRef(0);

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

  // Wall-clock time actually spent playing, so pauses and seeks are not counted
  // as listening. Reported once when the visitor leaves rather than on every
  // pause, so one visit produces one measured listen — which means `onListened`
  // must be a stable reference or the effect below flushes early.
  const stopClock = useCallback(() => {
    if (!playingSince.current) return;
    listened.current += (Date.now() - playingSince.current) / 1000;
    playingSince.current = 0;
  }, []);

  const report = useCallback(() => {
    stopClock();
    const total = listened.current;
    listened.current = 0;
    if (total >= 1) onListened?.(total);
  }, [stopClock, onListened]);

  useEffect(() => {
    const onHide = () => report();
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      report();
    };
  }, [report, src]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () => setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    const onTime = () => setCurrentTime(el.currentTime);
    const onPlay = () => {
      playingSince.current = Date.now();
      // Reported from the media event, not from the button, so a play started
      // any other way — keyboard, OS media keys, autoplay — is counted too.
      if (!firstPlayFired.current) {
        firstPlayFired.current = true;
        onFirstPlay?.();
      }
      setIsPlaying(true);
    };
    const onPause = () => {
      stopClock();
      setIsPlaying(false);
    };
    const onEnded = () => {
      stopClock();
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => {
      stopClock();
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
  }, [src, stopClock, onFirstPlay]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    if (el.paused) {
      el.play().catch(() => setError(true));
    } else {
      el.pause();
    }
  }, []);

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
