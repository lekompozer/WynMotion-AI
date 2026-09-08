'use client';

import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from '../RemotionEngine';
import { StyleRendererProps } from './DialogueSceneRenderer';

/**
 * AnimationAdsVeoRenderer — VIP Generative Video Player
 * Handles playback of Google VEO 3.1 / Gemini Omni Flash 3.1 AI-generated video scenes.
 * Features frame-synchronized playback and subtitle overlays.
 */
export const AnimationAdsVeoRenderer: React.FC<StyleRendererProps> = ({
  scene,
  showWhisperSubs = true,
  subsPosY = 'bottom',
  onSubsClick,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPortrait = height > width;

  // Frame-accurate video sync for preview
  useEffect(() => {
    if (videoRef.current && videoRef.current.duration) {
      const targetTime = frame / fps;
      if (Math.abs(videoRef.current.currentTime - targetTime) > 0.1) {
        videoRef.current.currentTime = targetTime % videoRef.current.duration;
      }
    }
  }, [frame, fps]);

  const getSubsStyle = (): React.CSSProperties => {
    if (typeof subsPosY === 'number') return { top: `${subsPosY}%`, transform: 'translateY(-50%)' };
    if (typeof subsPosY === 'string' && subsPosY.includes('%')) return { top: subsPosY, transform: 'translateY(-50%)' };
    if (subsPosY === 'top') return { top: isPortrait ? 24 : 32 };
    if (subsPosY === 'middle') return { top: '50%', transform: 'translateY(-50%)' };
    return { bottom: isPortrait ? 60 : 36 };
  };

  const videoSrc = scene.video_url || scene.image_url;
  const isDirectVideo = Boolean(scene.video_url);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
      }}
    >
      {isDirectVideo ? (
        <video
          ref={videoRef}
          src={scene.video_url}
          playsInline
          loop
          autoPlay
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <img
          src={scene.image_url}
          alt={scene.title || 'VEO scene'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1.0 + (frame / 150) * 0.08})`,
            transition: 'transform 0.05s linear',
          }}
        />
      )}

      {/* Whisper Subtitle Overlay */}
      {showWhisperSubs && (scene.voice_transcript || scene.summary_text) && (
        <div
          onClick={onSubsClick}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...getSubsStyle(),
            zIndex: 30,
            maxWidth: isPortrait ? '88%' : '75%',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '10px 20px',
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            fontSize: isPortrait ? 18 : 22,
            fontWeight: 800,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            cursor: onSubsClick ? 'pointer' : 'default',
          }}
        >
          {scene.voice_transcript || scene.summary_text}
        </div>
      )}
    </div>
  );
};
