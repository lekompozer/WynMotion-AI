'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface StrobeTeaserRendererProps {
  scene: DynamicSceneData;
}

/**
 * StrobeTeaserRenderer (Template 1) — High-Energy Strobe Teaser & Big Reveal (11.7s CapCut Style)
 *
 * Stage 1 (0.0s -> ~7.5s): Kinetic Monochrome Strobe Beat
 * - Alternates black/white backgrounds with punchy all-caps words.
 * - Special 1-second rapid letter flash for "READY?" (cycling black, gray, white per letter).
 *
 * Stage 2 (7.5s -> Outro): Hero Reveal & Signature Dual-Layer Typography
 * - White flash transition reveal.
 * - Background: User uploaded video or AI poster with cinematic zoom drift (1.0 -> 1.08).
 * - Dual Typography: Solid Headline Top + Hollow Outlined Bottom (-webkit-text-stroke: 2.5px #fff).
 */
export const StrobeTeaserRenderer: React.FC<StrobeTeaserRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const isVertical = height > width;

  // Strobe Words & Colors
  const rawWords = (scene as any).strobe_words || ['ARE', 'YOU', 'READY?', 'SOMETHING', 'BIG', 'IS', 'COMING'];
  const headlineSolid = (scene as any).headline_solid || 'STAY';
  const headlineOutline = (scene as any).headline_outline || 'TUNED';
  const subHeadline = (scene as any).sub_headline || scene.title || 'SPECIAL COMMERICAL REVEAL';
  const revealMediaUrl = (scene as any).reveal_video_url || (scene as any).reveal_image_url || scene.image_url;
  const isVideoReveal = Boolean((scene as any).reveal_video_url);

  // Timing: 7 words across first ~7.0s (30 frames per word)
  const wordDurationFrames = 30;
  const revealStartFrame = wordDurationFrames * rawWords.length; // e.g. 210 frames = 7.0s
  const isRevealPhase = frame >= revealStartFrame;

  // Active word index in Phase 1
  const activeWordIndex = Math.min(Math.floor(frame / wordDurationFrames), rawWords.length - 1);
  const currentWord = rawWords[activeWordIndex] || '';
  const currentWordFrame = frame % wordDurationFrames;

  // Background strobe colors per word index
  const bgColors = ['#FFFFFF', '#08080C', '#08080C', '#FFFFFF', '#08080C', '#FFFFFF', '#08080C'];
  const textColors = ['#08080C', '#FFFFFF', '#FFFFFF', '#08080C', '#FFFFFF', '#08080C', '#FFFFFF'];

  const currentBg = bgColors[activeWordIndex % bgColors.length];
  const currentTextColor = textColors[activeWordIndex % textColors.length];

  // Pop spring on each word entry
  const wordSpring = spring({
    frame: currentWordFrame,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 220 },
  });
  const wordScale = interpolate(wordSpring, [0, 1], [1.12, 1.0]);

  // Special Rapid Letter Strobe for "READY?" (Word index 2 or any word with '?')
  const isReadyWord = currentWord.includes('?') || activeWordIndex === 2;
  const readyLetters = useMemo(() => currentWord.split(''), [currentWord]);

  // Phase 2: Reveal Outro Physics
  const revealFrame = Math.max(0, frame - revealStartFrame);

  // Flash transition at reveal (0 -> 8 frames)
  const flashOpacity = interpolate(revealFrame, [0, 3, 9], [1, 0.7, 0], {
    extrapolateRight: 'clamp',
  });

  // Background slow cinematic zoom drift (1.0 -> 1.08)
  const revealZoom = interpolate(revealFrame, [0, durationInFrames - revealStartFrame], [1.0, 1.08], {
    extrapolateRight: 'clamp',
  });

  // Outro Text Pop-In Spring
  const textSpring = spring({
    frame: Math.max(0, revealFrame - 4),
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 140 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: isRevealPhase ? '#08080C' : currentBg,
        fontFamily: '"Cinzel", "Bodoni MT", "Didot", Georgia, serif',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          PHASE 1: Kinetic Monochrome Strobe Words (0s -> 7.0s)
          ───────────────────────────────────────────────────────────── */}
      {!isRevealPhase && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `scale(${wordScale})`,
            padding: '0 24px',
          }}
        >
          {isReadyWord ? (
            /* Rapid per-letter black/gray/white flashing for READY? */
            <div
              style={{
                display: 'flex',
                gap: '8px',
                fontSize: isVertical ? '72px' : '96px',
                fontWeight: 900,
                letterSpacing: '6px',
                textTransform: 'uppercase',
              }}
            >
              {readyLetters.map((char: string, i: number) => {
                // Color cycle shifts per letter and every 2-3 frames
                const cycle = (currentWordFrame * 2 + i * 3) % 6;
                const charColor =
                  cycle === 0
                    ? '#000000'
                    : cycle === 1
                    ? '#666666'
                    : cycle === 2
                    ? '#FFFFFF'
                    : cycle === 3
                    ? '#AAAAAA'
                    : cycle === 4
                    ? '#333333'
                    : '#FFFFFF';
                return (
                  <span
                    key={i}
                    style={{
                      color: charColor,
                      textShadow: charColor === '#FFFFFF' ? '0 0 20px rgba(255,255,255,0.8)' : 'none',
                      transition: 'color 0.05s ease',
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          ) : (
            /* Standard Bold Strobe Word */
            <h1
              style={{
                margin: 0,
                fontSize: isVertical ? '68px' : '92px',
                fontWeight: 900,
                color: currentTextColor,
                letterSpacing: '4px',
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
            >
              {currentWord}
            </h1>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PHASE 2: Big Reveal Video / Image + Dual-Layer Typography (7.0s -> 11.7s)
          ───────────────────────────────────────────────────────────── */}
      {isRevealPhase && (
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* Reveal Background Media (Video or Image with Zoom Drift) */}
          {revealMediaUrl && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${revealMediaUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `scale(${revealZoom})`,
                filter: 'brightness(0.9) contrast(1.1)',
              }}
            />
          )}

          {/* Vignette Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Signature Dual-Layer Typography (Solid Top + Hollow Stroke Bottom) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              transform: `scale(${textSpring})`,
              zIndex: 10,
              padding: '0 20px',
            }}
          >
            {/* Top Solid Headline */}
            <div
              style={{
                fontSize: isVertical ? '84px' : '110px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '8px',
                lineHeight: 0.95,
                textTransform: 'uppercase',
                textShadow: '0 10px 40px rgba(0,0,0,0.85)',
              }}
            >
              {headlineSolid}
            </div>

            {/* Bottom Hollow Outlined Headline */}
            <div
              style={{
                fontSize: isVertical ? '84px' : '110px',
                fontWeight: 900,
                color: 'transparent',
                WebkitTextStroke: '2.5px #FFFFFF',
                letterSpacing: '8px',
                lineHeight: 0.95,
                textTransform: 'uppercase',
                marginTop: '4px',
                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.9))',
              }}
            >
              {headlineOutline}
            </div>

            {/* Tagline Subtitle */}
            {subHeadline && (
              <div
                style={{
                  marginTop: '28px',
                  fontSize: isVertical ? '15px' : '20px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '6px',
                  color: '#FFFFFF',
                  opacity: 0.9,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '8px 20px',
                  borderRadius: '40px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {subHeadline}
              </div>
            )}
          </div>

          {/* Flash Transition Overlay */}
          {flashOpacity > 0.01 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#FFFFFF',
                opacity: flashOpacity,
                pointerEvents: 'none',
                zIndex: 50,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
