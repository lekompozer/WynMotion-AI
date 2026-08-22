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

export const ScienceExplainerRenderer: React.FC<StyleRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = height > width || height === 1920;
  const isSquare = width === height;
  const duration = scene.duration_frames || (scene.duration_sec ? Math.round(scene.duration_sec * fps) : 150);

  const displaySummary = scene.summary_text || scene.voice_transcript || scene.title || 'Science Explainer';
  const primaryKeyword = scene.highlight_keywords?.[0] || scene.title || 'STEM';

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 150 },
  });

  // Laser scan line movement
  const laserY = interpolate(frame % (fps * 3), [0, fps * 3], [0, 100], {
    extrapolateRight: 'clamp',
  });

  // Rotating atom electron ring
  const rotAngle = (frame * 2.5) % 360;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#060B18',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'JetBrains Mono', 'Inter', monospace, sans-serif",
      }}
    >
      {/* 1. Dark Navy STEM Blueprint Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0, 200, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      {/* 2. Laser Scanning Beam */}
      <div
        style={{
          position: 'absolute',
          top: `${laserY}%`,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)',
          boxShadow: '0 0 15px #00E5FF',
          opacity: 0.7,
        }}
      />

      {/* 3. Glowing STEM Central Diagram */}
      <div
        style={{
          width: isPortrait ? '88%' : '65%',
          transform: `scale(${Math.max(0, cardSpring)})`,
          backgroundColor: 'rgba(6, 15, 35, 0.75)',
          border: '1.5px solid rgba(0, 229, 255, 0.3)',
          borderRadius: 24,
          padding: isPortrait ? 20 : 32,
          boxShadow: '0 0 35px rgba(0, 229, 255, 0.15)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          zIndex: 10,
        }}
      >
        {/* Animated Atomic Orbital Ring */}
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px dashed #00E5FF',
              transform: `rotate(${rotAngle}deg)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '25%',
              borderRadius: '50%',
              backgroundColor: '#00E5FF',
              boxShadow: '0 0 12px #00E5FF',
            }}
          />
        </div>

        {/* Formula Badge */}
        <div
          style={{
            padding: '4px 14px',
            borderRadius: 8,
            backgroundColor: 'rgba(0, 229, 255, 0.12)',
            color: '#00E5FF',
            fontSize: isPortrait ? 13 : 15,
            fontWeight: 800,
            letterSpacing: 1,
            border: '1px solid rgba(0, 229, 255, 0.4)',
          }}
        >
          ⚛️ {primaryKeyword}
        </div>

        {/* Main Concept Text */}
        <div
          style={{
            fontSize: isPortrait ? 16 : 20,
            fontWeight: 700,
            color: '#E2E8F0',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          {displaySummary}
        </div>
      </div>
    </div>
  );
};
