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

export const AppleModernRenderer: React.FC<StyleRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = height > width || height === 1920;
  const isSquare = width === height;
  const duration = scene.duration_frames || (scene.duration_sec ? Math.round(scene.duration_sec * fps) : 150);

  const displaySummary = scene.summary_text || scene.voice_transcript || scene.title || 'Apple Modern Motion';
  const primaryKeyword = scene.highlight_keywords?.[0] || scene.title || 'WynMotion AI';
  const secondaryKeywords = scene.highlight_keywords?.slice(1, 4) || [];

  // Card spring in
  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // Typewriter streaming simulation for terminal text
  const typedCharCount = Math.min(displaySummary.length, Math.floor(frame * 0.85));
  const typedText = displaySummary.slice(0, typedCharCount);
  const showCursor = frame % 16 < 8 && typedCharCount < displaySummary.length;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0B0F19',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      }}
    >
      {/* 1. Subtle Dark Gradient & Moving Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 30%, rgba(30, 58, 138, 0.25) 0%, rgba(11, 15, 25, 0.95) 75%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.6,
        }}
      />

      {/* 2. Glassmorphic Hero Card */}
      <div
        style={{
          width: isPortrait ? '88%' : isSquare ? '78%' : '65%',
          maxWidth: 820,
          transform: `scale(${Math.max(0, cardSpring)})`,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: isPortrait ? 24 : 32,
          padding: isPortrait ? '24px 20px' : '36px 32px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          zIndex: 10,
        }}
      >
        {/* Top Header Pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 12,
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38BDF8',
              fontSize: isPortrait ? 11 : 13,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            <span>⚡</span>
            <span>{primaryKeyword}</span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} />
          </div>
        </div>

        {/* Live Typewriter Headline */}
        <div
          style={{
            fontSize: isPortrait ? 18 : isSquare ? 22 : 26,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.35,
            letterSpacing: -0.5,
            minHeight: isPortrait ? 60 : 72,
          }}
        >
          <span>{typedText}</span>
          {showCursor && (
            <span
              style={{
                display: 'inline-block',
                width: 3,
                height: '0.9em',
                backgroundColor: '#38BDF8',
                marginLeft: 4,
                verticalAlign: 'middle',
              }}
            />
          )}
        </div>

        {/* Secondary Badges Cascade */}
        {secondaryKeywords.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 4 }}>
            {secondaryKeywords.map((kw, i) => {
              const badgeSpring = spring({
                frame: Math.max(0, frame - 15 - i * 5),
                fps,
                config: { damping: 12, stiffness: 160 },
              });
              return (
                <span
                  key={i}
                  style={{
                    transform: `scale(${Math.max(0, badgeSpring)})`,
                    padding: '4px 10px',
                    borderRadius: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#94A3B8',
                    fontSize: isPortrait ? 11 : 12,
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  #{kw}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
