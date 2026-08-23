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
  const duration = scene.duration_frames || (scene.duration_sec ? Math.round(scene.duration_sec * fps) : 150);

  const displaySummary = scene.summary_text || scene.voice_transcript || scene.title || 'Science Explainer';
  const primaryKeyword = scene.highlight_keywords?.[0] || scene.title || 'STEM / Physics & Math';

  const popSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // 3D rotation angles
  const rotY = (frame * 1.2) % 360;
  const rotX = Math.sin(frame * 0.04) * 20;
  const pulseScale = Math.sin(frame * 0.08) * 0.08 + 1;
  const laserY = interpolate(frame % (fps * 3), [0, fps * 3], [0, 100], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#060B18',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'JetBrains Mono', 'Inter', monospace, sans-serif",
        perspective: 1200,
      }}
    >
      {/* 1. 3D Tilted Blueprint Coordinate Floor */}
      <div
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          top: '-50%',
          left: '-50%',
          backgroundImage:
            'radial-gradient(rgba(0, 240, 255, 0.12) 1px, transparent 1px), linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          transform: 'rotateX(65deg) translateZ(-120px)',
          transformOrigin: '50% 50%',
          opacity: 0.8,
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
          background: 'linear-gradient(90deg, transparent, #00F0FF, #10B981, transparent)',
          boxShadow: '0 0 20px #00F0FF',
          opacity: 0.8,
          zIndex: 5,
        }}
      />

      {/* 3. 3D Floating STEM Vector Geometry & Quantum Wireframe */}
      <div
        style={{
          transform: `scale(${Math.max(0, popSpring * pulseScale)})`,
          transformStyle: 'preserve-3d',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
          width: isPortrait ? '92%' : '75%',
        }}
      >
        {/* Dynamic 3D Geometric Ring & Particle Axis */}
        <div
          style={{
            width: isPortrait ? 180 : 240,
            height: isPortrait ? 180 : 240,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotX + 25}deg) rotateY(${rotY}deg)`,
            marginBottom: isPortrait ? 16 : 24,
          }}
        >
          {/* Ring 1 - Cyan */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid #00F0FF',
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.6), inset 0 0 25px rgba(0, 240, 255, 0.4)',
              transform: 'rotateX(45deg)',
            }}
          />
          {/* Ring 2 - Emerald */}
          <div
            style={{
              position: 'absolute',
              inset: 12,
              borderRadius: '50%',
              border: '2.5px dashed #10B981',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
              transform: 'rotateY(60deg)',
            }}
          />
          {/* Ring 3 - Rose / Amber */}
          <div
            style={{
              position: 'absolute',
              inset: 24,
              borderRadius: '50%',
              border: '2.5px solid #F59E0B',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
              transform: 'rotateZ(75deg)',
            }}
          />
          {/* Central Glowing Quantum Nucleus */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 36,
              height: 36,
              marginLeft: -18,
              marginTop: -18,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #FFFFFF 10%, #00F0FF 60%, #0077FE 100%)',
              boxShadow: '0 0 35px #00F0FF, 0 0 60px rgba(0, 240, 255, 0.8)',
            }}
          />
        </div>

        {/* 4. Glowing HUD Mathematical Card */}
        <div
          style={{
            backgroundColor: 'rgba(6, 15, 35, 0.82)',
            border: '1.5px solid rgba(0, 240, 255, 0.4)',
            borderRadius: 24,
            padding: isPortrait ? '16px 20px' : '24px 36px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 240, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            width: '100%',
          }}
        >
          {/* Formula / Keyword Badge */}
          <div
            style={{
              padding: '6px 18px',
              borderRadius: 20,
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              color: '#00F0FF',
              fontSize: isPortrait ? 13 : 15,
              fontWeight: 900,
              letterSpacing: 1.2,
              border: '1px solid rgba(0, 240, 255, 0.6)',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
            }}
          >
            ⚛️ {primaryKeyword}
          </div>

          {/* Main Concept Text */}
          <div
            style={{
              fontSize: isPortrait ? 16 : 20,
              fontWeight: 700,
              color: '#F8FAFC',
              textAlign: 'center',
              lineHeight: 1.45,
            }}
          >
            {displaySummary}
          </div>
        </div>
      </div>
    </div>
  );
};
