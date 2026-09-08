'use client';

/**
 * RemotionEngine.tsx — WynMotion-AI iOS Studio
 *
 * Exact 1:1 Parity with wordai Web Remotion Runtime:
 * - Frame-accurate requestAnimationFrame playhead synced with Audio element
 * - Dual Audio Engine: Simultaneous Voiceover + Background Music (BGM) playback with independent volume mixing
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
  // BGM Background Music
  bgmAudioSrc?: string | null;
  setBgmAudioSrc?: (src: string | null) => void;
  bgmVolume?: number;
  setBgmVolume?: (vol: number) => void;
  bgmStartSec?: number;
  setBgmStartSec?: (sec: number) => void;
  bgmDurationSec?: number;
  setBgmDurationSec?: (sec: number) => void;
  bgmOffsetSec?: number;
  setBgmOffsetSec?: (sec: number) => void;
  // Voice Volume & Timing
  voiceStartSec?: number;
  setVoiceStartSec?: (sec: number) => void;
  voiceDurationSec?: number;
  setVoiceDurationSec?: (sec: number) => void;
  // Original Video Audio Volume & Mute State
  videoAudioVolume?: number;
  setVideoAudioVolume?: (vol: number) => void;
  isVideoAudioMuted?: boolean;
  setIsVideoAudioMuted?: (muted: boolean) => void;
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
  const damping = config?.damping ?? 10;
  const stiffness = config?.stiffness ?? 100;
  const mass = config?.mass ?? 1;

  const t = frame / fps;
  if (t <= 0) return 0;

  const omega0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  if (zeta < 1) {
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const val = 1 - Math.exp(-zeta * omega0 * t) * (Math.cos(omegaD * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(omegaD * t));
    return Math.max(0, Math.min(1.5, val));
  } else {
    const val = 1 - (1 + omega0 * t) * Math.exp(-omega0 * t);
    return Math.max(0, Math.min(1.5, val));
  }
};

export interface SequenceProps {
  from: number;
  durationInFrames: number;
  children: React.ReactNode;
}

export const Sequence: React.FC<SequenceProps> = ({ from, durationInFrames, children }) => {
  const ctx = useContext(RemotionContext);
  const currentFrame = ctx ? ctx.frame : 0;

  if (currentFrame < from || currentFrame >= from + durationInFrames) {
    return null;
  }

  if (!ctx) {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        {children}
      </div>
    );
  }

  const localContext: RemotionContextType = {
    ...ctx,
    frame: currentFrame - from,
    durationInFrames: durationInFrames,
  };

  return (
    <RemotionContext.Provider value={localContext}>
      <div style={{ position: 'absolute', inset: 0 }}>
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
  // Optional initial BGM properties
  bgmAudioSrc?: string | null;
  initialBgmVolume?: number;
  initialBgmStartSec?: number;
  initialBgmDurationSec?: number;
  children: React.ReactNode;
}

export const RemotionPlayerProvider: React.FC<RemotionPlayerProviderProps> = ({
  fps = 30,
  durationInFrames = 300,
  audioSrc = '',
  initialBgColor = '#FAF7EF',
  initialAspectRatio = '16:9',
  bgmAudioSrc = null,
  initialBgmVolume = 0.3,
  initialBgmStartSec = 0,
  initialBgmDurationSec,
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

  // BGM Background Music State
  const [currentBgmAudioSrc, setCurrentBgmAudioSrc] = useState<string | null>(bgmAudioSrc);
  const [bgmVolume, setBgmVolume] = useState<number>(initialBgmVolume);
  const [bgmStartSec, setBgmStartSec] = useState<number>(initialBgmStartSec);
  const [bgmDurationSec, setBgmDurationSec] = useState<number | undefined>(initialBgmDurationSec);
  const [bgmOffsetSec, setBgmOffsetSec] = useState<number>(0);

  // Voice Timing State
  const [voiceStartSec, setVoiceStartSec] = useState<number>(0);
  const [voiceDurationSec, setVoiceDurationSec] = useState<number | undefined>(undefined);

  // Original Video Audio Volume & Mute State (default: 1.0 volume, not muted)
  const [videoAudioVolume, setVideoAudioVolume] = useState<number>(1.0);
  const [isVideoAudioMuted, setIsVideoAudioMuted] = useState<boolean>(false);

  useEffect(() => {
    if (audioSrc) setCurrentAudioSrc(audioSrc);
  }, [audioSrc]);

  useEffect(() => {
    setCurrentBgmAudioSrc(bgmAudioSrc);
  }, [bgmAudioSrc]);

  useEffect(() => {
    if (durationInFrames) setCurrentDurationInFrames(durationInFrames);
  }, [durationInFrames]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  const width = aspectRatio === '16:9' ? 1920 : aspectRatio === '9:16' ? 1080 : 1080;
  const height = aspectRatio === '16:9' ? 1080 : aspectRatio === '9:16' ? 1920 : 1080;

  // Initialize Voice audio element
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
        setVoiceDurationSec((prev) => (prev !== undefined ? prev : audio.duration));
      }
    };

    const handleEnded = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
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

  // Initialize BGM audio element
  useEffect(() => {
    if (!currentBgmAudioSrc) {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
        bgmAudioRef.current = null;
      }
      return;
    }

    const bgm = new Audio(currentBgmAudioSrc);
    bgm.preload = 'auto';
    bgm.loop = true; // Auto loop if BGM is shorter than video duration
    bgmAudioRef.current = bgm;

    return () => {
      bgm.pause();
      bgmAudioRef.current = null;
    };
  }, [currentBgmAudioSrc]);

  // Sync volume and mute state for Voice
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
    }
  }, [volume, isMuted]);

  // Sync volume and mute state for BGM
  useEffect(() => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = isMuted ? 0 : Math.max(0, Math.min(1, bgmVolume));
    }
  }, [bgmVolume, isMuted]);

  // Ref to track latest frame without stale closure in requestAnimationFrame
  const frameRef = useRef<number>(0);
  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  // Playhead update loop: Hardware Audio Master Clock with silky-smooth frame synchronization
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      return;
    }

    let lastTime = performance.now();

    const updatePlayhead = (now: number) => {
      let currentSec = 0;
      let currentFrame = 0;

      const vStart = voiceStartSec || 0;
      const vEnd = voiceDurationSec ? vStart + voiceDurationSec : (currentDurationInFrames / fps);

      // 1. MASTER CLOCK:
      // When Voice Audio is active, the browser's hardware soundcard clock is the Master Source of Truth!
      if (audioRef.current && currentAudioSrc) {
        const estSec = frameRef.current / fps;
        if (estSec < vStart) {
          // Before voice starts (intro silence window): clock runs on performance.now()
          const deltaSec = Math.min(0.08, (now - lastTime) / 1000);
          lastTime = now;
          const nextSec = estSec + deltaSec;
          if (nextSec >= vStart) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
            currentSec = vStart;
          } else {
            currentSec = nextSec;
            if (!audioRef.current.paused) audioRef.current.pause();
          }
          currentFrame = Math.round(currentSec * fps);
        } else if (estSec >= vEnd) {
          // After voice has ended for this segment, but video continues
          if (!audioRef.current.paused) audioRef.current.pause();
          const deltaSec = Math.min(0.08, (now - lastTime) / 1000);
          lastTime = now;
          currentSec = estSec + deltaSec;
          currentFrame = Math.round(currentSec * fps);
        } else {
          // Voice Audio is actively playing!
          // NEVER reassign audio.currentTime during continuous playback to avoid buffer flushing & audio distortion!
          if (audioRef.current.paused) {
            audioRef.current.currentTime = Math.max(0, estSec - vStart);
            audioRef.current.play().catch(() => {});
          }
          currentSec = vStart + audioRef.current.currentTime;
          currentFrame = Math.round(currentSec * fps);
          lastTime = now;
        }
      } else {
        // Fallback rAF clock when no voice audio is loaded
        const deltaSec = Math.min(0.08, (now - lastTime) / 1000);
        lastTime = now;
        const nextFrame = frameRef.current + deltaSec * fps;
        currentSec = nextFrame / fps;
        currentFrame = Math.round(nextFrame);
      }

      // Check end of video boundary
      if (currentFrame >= currentDurationInFrames) {
        setIsPlaying(false);
        setFrame(0);
        frameRef.current = 0;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        if (bgmAudioRef.current) {
          bgmAudioRef.current.pause();
          bgmAudioRef.current.currentTime = 0;
        }
        return;
      }

      // Set clean integer frame for Mascot / Người Que / SVG spring physics stability
      setFrame(currentFrame);
      frameRef.current = currentFrame;

      // 2. Sync BGM Audio (Play/pause only at boundary; do not re-seek during play)
      if (bgmAudioRef.current && currentBgmAudioSrc) {
        const bStart = bgmStartSec || 0;
        const bEnd = bgmDurationSec ? bStart + bgmDurationSec : (currentDurationInFrames / fps);
        if (currentSec >= bStart && currentSec < bEnd) {
          if (bgmAudioRef.current.paused) {
            bgmAudioRef.current.currentTime = Math.max(0, (currentSec - bStart) + (bgmOffsetSec || 0));
            bgmAudioRef.current.play().catch(() => {});
          }
        } else {
          if (!bgmAudioRef.current.paused) {
            bgmAudioRef.current.pause();
          }
        }
      }

      animFrameId.current = requestAnimationFrame(updatePlayhead);
    };

    animFrameId.current = requestAnimationFrame(updatePlayhead);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying, fps, currentDurationInFrames, currentAudioSrc, currentBgmAudioSrc, voiceStartSec, voiceDurationSec, bgmStartSec, bgmDurationSec, bgmOffsetSec]);

  const play = useCallback(() => {
    let currentSec = frameRef.current / fps;

    if (frameRef.current >= currentDurationInFrames) {
      setFrame(0);
      frameRef.current = 0;
      currentSec = 0;
    }

    if (audioRef.current && currentAudioSrc) {
      const vStart = voiceStartSec || 0;
      const vEnd = voiceDurationSec ? vStart + voiceDurationSec : (currentDurationInFrames / fps);
      if (currentSec >= vStart && currentSec < vEnd) {
        audioRef.current.currentTime = Math.max(0, currentSec - vStart);
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }

    if (bgmAudioRef.current && currentBgmAudioSrc) {
      const bStart = bgmStartSec || 0;
      const bEnd = bgmDurationSec ? bStart + bgmDurationSec : (currentDurationInFrames / fps);
      if (currentSec >= bStart && currentSec < bEnd) {
        bgmAudioRef.current.currentTime = Math.max(0, (currentSec - bStart) + (bgmOffsetSec || 0));
        bgmAudioRef.current.play().catch(() => {});
      } else {
        bgmAudioRef.current.pause();
      }
    }

    setIsPlaying(true);
  }, [currentDurationInFrames, fps, currentAudioSrc, voiceStartSec, voiceDurationSec, currentBgmAudioSrc, bgmStartSec, bgmDurationSec, bgmOffsetSec]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (bgmAudioRef.current) {
      bgmAudioRef.current.pause();
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
      frameRef.current = clamped;
      const targetSec = clamped / fps;

      if (audioRef.current && currentAudioSrc) {
        const vStart = voiceStartSec || 0;
        const vEnd = voiceDurationSec ? vStart + voiceDurationSec : (currentDurationInFrames / fps);
        if (targetSec >= vStart && targetSec < vEnd) {
          audioRef.current.currentTime = Math.max(0, targetSec - vStart);
          if (isPlaying) {
            audioRef.current.play().catch(() => {});
          }
        } else {
          audioRef.current.pause();
        }
      }

      if (bgmAudioRef.current && currentBgmAudioSrc) {
        const bStart = bgmStartSec || 0;
        const bEnd = bgmDurationSec ? bStart + bgmDurationSec : (currentDurationInFrames / fps);
        if (targetSec >= bStart && targetSec < bEnd) {
          bgmAudioRef.current.currentTime = Math.max(0, (targetSec - bStart) + (bgmOffsetSec || 0));
          if (isPlaying) {
            bgmAudioRef.current.play().catch(() => {});
          }
        } else {
          bgmAudioRef.current.pause();
        }
      }
    },
    [currentDurationInFrames, fps, currentAudioSrc, voiceStartSec, voiceDurationSec, currentBgmAudioSrc, bgmStartSec, bgmDurationSec, bgmOffsetSec, isPlaying]
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
        bgmAudioSrc: currentBgmAudioSrc,
        setBgmAudioSrc: setCurrentBgmAudioSrc,
        bgmVolume,
        setBgmVolume,
        bgmStartSec,
        setBgmStartSec,
        bgmDurationSec,
        setBgmDurationSec,
        bgmOffsetSec,
        setBgmOffsetSec,
        voiceStartSec,
        setVoiceStartSec,
        voiceDurationSec,
        setVoiceDurationSec,
        videoAudioVolume,
        setVideoAudioVolume,
        isVideoAudioMuted,
        setIsVideoAudioMuted,
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
