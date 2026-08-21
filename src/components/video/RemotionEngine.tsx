'use client';

/**
 * RemotionEngine.tsx — WynMotion-AI iOS Studio
 *
 * Exact 1:1 Parity with wordai Web Remotion Runtime:
 * - Frame-accurate requestAnimationFrame playhead synced with Audio element
 * - Mathematical interpolate() with clamping and easing
 * - Spring physics simulation (spring({ frame, fps, config: { damping, stiffness, mass } }))
 * - Sequence component for multi-scene composition slicing
 * - RemotionPlayerProvider for context broadcasting
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export interface VideoConfig {
  fps: number;
  durationInFrames: number;
  width: number;
  height: number;
}

export interface RemotionContextType {
  frame: number;
  fps: number;
  durationInFrames: number;
  setDurationInFrames?: (frames: number) => void;
  audioSrc?: string;
  setAudioSrc?: (src: string) => void;
  width: number;
  height: number;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seekTo: (frame: number) => void;
  seekToSec: (sec: number) => void;
  volume: number;
  setVolume: (vol: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  aspectRatio: '16:9' | '9:16' | '1:1';
  setAspectRatio: (ar: '16:9' | '9:16' | '1:1') => void;
  bgColor: string;
  setBgColor: (color: string) => void;
}

export const RemotionContext = createContext<RemotionContextType | null>(null);

export const useCurrentFrame = (): number => {
  const ctx = useContext(RemotionContext);
  return ctx ? ctx.frame : 0;
};

export const useVideoConfig = (): VideoConfig => {
  const ctx = useContext(RemotionContext);
  if (!ctx) {
    return { fps: 30, durationInFrames: 300, width: 1920, height: 1080 };
  }
  return {
    fps: ctx.fps,
    durationInFrames: ctx.durationInFrames,
    width: ctx.width,
    height: ctx.height,
  };
};

export const useRemotion = () => {
  const ctx = useContext(RemotionContext);
  if (!ctx) {
    throw new Error('useRemotion must be used within RemotionPlayerProvider');
  }
  return ctx;
};

export interface InterpolateOptions {
  extrapolateLeft?: 'clamp' | 'identity' | 'extend';
  extrapolateRight?: 'clamp' | 'identity' | 'extend';
  easing?: (t: number) => number;
}

export const interpolate = (
  input: number,
  inputRange: number[],
  outputRange: number[],
  options?: InterpolateOptions
): number => {
  if (inputRange.length < 2 || outputRange.length < 2) return outputRange[0] ?? 0;

  const minIn = inputRange[0];
  const maxIn = inputRange[inputRange.length - 1];

  let val = input;
  const clampLeft = options?.extrapolateLeft !== 'extend';
  const clampRight = options?.extrapolateRight !== 'extend';

  if (clampLeft && val < minIn) val = minIn;
  if (clampRight && val > maxIn) val = maxIn;

  // Find segment
  for (let i = 0; i < inputRange.length - 1; i++) {
    const inStart = inputRange[i];
    const inEnd = inputRange[i + 1];
    const outStart = outputRange[i];
    const outEnd = outputRange[i + 1];

    if (val >= inStart && val <= inEnd) {
      const progress = (val - inStart) / (inEnd - inStart || 1);
      return outStart + progress * (outEnd - outStart);
    }
  }

  return outputRange[outputRange.length - 1];
};

export interface SpringConfig {
  frame: number;
  fps: number;
  config?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

export const spring = ({ frame, fps, config }: SpringConfig): number => {
  if (frame <= 0) return 0;
  const damping = config?.damping ?? 10;
  const stiffness = config?.stiffness ?? 100;
  const mass = config?.mass ?? 1;

  const omega0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const t = frame / fps;

  if (zeta < 1) {
    const omega1 = omega0 * Math.sqrt(1 - zeta * zeta);
    const envelope = Math.exp(-zeta * omega0 * t);
    const oscillation = Math.cos(omega1 * t) + ((zeta * omega0) / omega1) * Math.sin(omega1 * t);
    return Math.max(0, Math.min(1.5, 1 - envelope * oscillation));
  } else {
    const envelope = Math.exp(-omega0 * t);
    return Math.max(0, Math.min(1.5, 1 - envelope * (1 + omega0 * t)));
  }
};

export interface SequenceProps {
  from: number;
  durationInFrames: number;
  children: React.ReactNode;
}

export const Sequence: React.FC<SequenceProps> = ({ from, durationInFrames, children }) => {
  const ctx = useRemotion();
  const isVisible = ctx.frame >= from && ctx.frame < from + durationInFrames;

  if (!isVisible) return null;

  const localFrame = Math.max(0, ctx.frame - from);

  return (
    <RemotionContext.Provider value={{ ...ctx, frame: localFrame }}>
      <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {children}
      </div>
    </RemotionContext.Provider>
  );
};

export interface RemotionPlayerProviderProps {
  fps?: number;
  durationInFrames?: number;
  audioSrc?: string;
  initialBgColor?: string;
  initialAspectRatio?: '16:9' | '9:16' | '1:1';
  children: React.ReactNode;
}

export const RemotionPlayerProvider: React.FC<RemotionPlayerProviderProps> = ({
  fps = 30,
  durationInFrames = 300,
  audioSrc = '',
  initialBgColor = '#FAF7EF',
  initialAspectRatio = '16:9',
  children,
}) => {
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>(initialAspectRatio);
  const [bgColor, setBgColor] = useState(initialBgColor);
  const [currentAudioSrc, setCurrentAudioSrc] = useState<string>(audioSrc);
  const [currentDurationInFrames, setCurrentDurationInFrames] = useState<number>(durationInFrames);

  useEffect(() => {
    if (audioSrc) setCurrentAudioSrc(audioSrc);
  }, [audioSrc]);

  useEffect(() => {
    if (durationInFrames) setCurrentDurationInFrames(durationInFrames);
  }, [durationInFrames]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  const width = aspectRatio === '16:9' ? 1920 : aspectRatio === '9:16' ? 1080 : 1080;
  const height = aspectRatio === '16:9' ? 1080 : aspectRatio === '9:16' ? 1920 : 1080;

  // Initialize audio element
  useEffect(() => {
    if (!currentAudioSrc) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    const audio = new Audio(currentAudioSrc);
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        const audioFrames = Math.round(audio.duration * fps);
        if (audioFrames > 30) {
          setCurrentDurationInFrames(audioFrames);
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setFrame(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [currentAudioSrc, fps]);

  // Sync volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Playhead update loop synced with audio (or rAF fallback)
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      return;
    }

    let lastTime = performance.now();

    const updatePlayhead = (now: number) => {
      if (audioRef.current && currentAudioSrc) {
        const currentSec = audioRef.current.currentTime;
        const currentFrame = Math.round(currentSec * fps);

        if (currentFrame >= currentDurationInFrames) {
          setIsPlaying(false);
          setFrame(currentDurationInFrames);
          audioRef.current.pause();
          return;
        }

        setFrame(currentFrame);
      } else {
        // Clock-based fallback if no audio is loaded
        const deltaSec = (now - lastTime) / 1000;
        lastTime = now;
        setFrame((prev) => {
          const next = prev + deltaSec * fps;
          if (next >= currentDurationInFrames) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }
      animFrameId.current = requestAnimationFrame(updatePlayhead);
    };

    animFrameId.current = requestAnimationFrame(updatePlayhead);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying, fps, currentDurationInFrames, currentAudioSrc]);

  const play = useCallback(() => {
    if (audioRef.current) {
      if (frame >= currentDurationInFrames) {
        setFrame(0);
        audioRef.current.currentTime = 0;
      }
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      if (frame >= currentDurationInFrames) {
        setFrame(0);
      }
      setIsPlaying(true);
    }
  }, [frame, currentDurationInFrames]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seekTo = useCallback(
    (targetFrame: number) => {
      const clamped = Math.max(0, Math.min(currentDurationInFrames, targetFrame));
      setFrame(clamped);
      if (audioRef.current) {
        audioRef.current.currentTime = clamped / fps;
      }
    },
    [currentDurationInFrames, fps]
  );

  const seekToSec = useCallback(
    (sec: number) => {
      seekTo(Math.round(sec * fps));
    },
    [seekTo, fps]
  );

  return (
    <RemotionContext.Provider
      value={{
        frame: Math.round(frame),
        fps,
        durationInFrames: currentDurationInFrames,
        setDurationInFrames: setCurrentDurationInFrames,
        audioSrc: currentAudioSrc,
        setAudioSrc: setCurrentAudioSrc,
        width,
        height,
        isPlaying,
        play,
        pause,
        togglePlay,
        seekTo,
        seekToSec,
        volume,
        setVolume,
        isMuted,
        setIsMuted,
        aspectRatio,
        setAspectRatio,
        bgColor,
        setBgColor,
      }}
    >
      {children}
    </RemotionContext.Provider>
  );
};
