'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface StyleRendererProps {
  scene: DynamicSceneData;
  showSceneCards?: boolean;
  showWhisperSubs?: boolean;
  cardPosY?: 'top' | 'middle' | 'bottom';
  subsPosY?: 'top' | 'middle' | 'bottom';
  onCardClick?: () => void;
  onSubsClick?: () => void;
}

export const CharacterMascotRenderer: React.FC<StyleRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = height > width || height === 1920;
  const isSquare = width === height;
  const duration = scene.duration_frames || (scene.duration_sec ? Math.round(scene.duration_sec * fps) : 150);

  const displaySummary = scene.summary_text || scene.voice_transcript || scene.title || 'Mascot & Character Animation';
  const primaryKeyword = scene.highlight_keywords?.[0] || scene.title || 'WynMotion';

  // Character body bounce
  const bounceY = Math.sin(frame * 0.22) * 8;
  const eyeBlink = frame % 55 < 4 ? 0.1 : 1;
  const armWave = Math.sin(frame * 0.18) * 15;

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0F172A',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: isPortrait ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isPortrait ? '24px 16px' : '36px 48px',
        boxSizing: 'border-box',
        gap: isPortrait ? 20 : 36,
        fontFamily: "'Nunito', 'SF Pro Rounded', sans-serif",
      }}
    >
      {/* 1. Animated SVG Mascot / Stickman Character */}
      <div
        style={{
          transform: `translateY(${bounceY}px)`,
          transition: 'transform 0.05s linear',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <svg
          width={isPortrait ? 140 : 180}
          height={isPortrait ? 160 : 200}
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head */}
          <circle cx="50" cy="35" r="22" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="3" />
          {/* Eyes */}
          <ellipse cx="42" cy="32" rx="3" ry={3 * eyeBlink} fill="#0F172A" />
          <ellipse cx="58" cy="32" rx="3" ry={3 * eyeBlink} fill="#0F172A" />
          {/* Smile Mouth */}
          <path d="M44 42 Q50 48 56 42" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          {/* Body */}
          <rect x="36" y="58" width="28" height="34" rx="10" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2.5" />
          {/* Arms with Gesture */}
          <path
            d={`M36 65 Q${20 + armWave} 75 22 90`}
            stroke="#38BDF8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d={`M64 65 Q${80 - armWave} 75 78 90`}
            stroke="#38BDF8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Legs */}
          <path d="M43 92 L43 112" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <path d="M57 92 L57 112" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      {/* 2. Interactive Speech / Topic Action Card */}
      <div
        style={{
          flex: 1,
          maxWidth: isPortrait ? '92%' : 540,
          transform: `scale(${Math.max(0, cardSpring)})`,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: isPortrait ? '16px 20px' : '24px 28px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
          border: '2.5px solid #38BDF8',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 8,
            backgroundColor: '#E0F2FE',
            color: '#0369A1',
            fontSize: isPortrait ? 12 : 13,
            fontWeight: 800,
            width: 'fit-content',
          }}
        >
          <span>🦊</span>
          <span>{primaryKeyword}</span>
        </div>

        <div
          style={{
            fontSize: isPortrait ? 16 : 20,
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: 1.35,
          }}
        >
          {displaySummary}
        </div>
      </div>
    </div>
  );
};
