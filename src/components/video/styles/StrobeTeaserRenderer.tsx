'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface StrobeTeaserRendererProps {
  scene: DynamicSceneData;
}

/**
 * StrobeTeaserRenderer (Template 1) — 100% Exact CapCut Strobe Teaser & Big Reveal
 *
 * 1. Exact Typography (Bodoni / Didot Bold Condensed High-Contrast Serif):
 *    - Font: 'Bodoni MT', 'Bodoni 72', 'Didot', 'Playfair Display', serif
 *    - Heavy vertical contrast + sharp flat serifs + vertical scale.
 * 2. READY? Marquee Wave & Background Pulse:
 *    - Background: Trắng (#F5F5F5) -> Xám (#777777) -> Đen (#121214) -> Xám (#777777) -> Trắng (#FFFFFF).
 *    - Chữ R-E-A-D-Y-? nhấp nháy đèn biển hiệu từ trái sang phải (wave marquee).
 * 3. 1-Second Linear Black Curtain Wipe (7.0s -> 8.0s):
 *    - Hàng đen quét dần từ trên xuống dưới trong 1s để hiển thị ảnh/clip 4s cuối.
 * 4. Hero Outro (8.0s -> 11.7s):
 *    - Solid 'STAY' / Brand trên + Hollow Outlined 'TUNED' / Product dưới (-webkit-text-stroke: 2.5px #fff).
 *    - Tagline nghiêng (italic) chữ mỏng sang trọng.
 * 5. Last 0.5s - 0.8s Warm Color Strobe Flash:
 *    - Hiệu ứng chớp ánh sáng ấm (Cam - Vàng - Đỏ / Film Burn Light Leak) rực rỡ ở cuối clip.
 */
export const StrobeTeaserRenderer: React.FC<StrobeTeaserRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const isVertical = height > width;

  // Strobe Words & Copy
  const rawWords = (scene as any).strobe_words || ['ARE', 'YOU', 'READY?', 'SOMETHING', 'BIG', 'IS', 'COMING'];
  const headlineSolid = (scene as any).headline_solid || 'STAY';
  const headlineOutline = (scene as any).headline_outline || 'TUNED';
  const subHeadline = (scene as any).sub_headline || scene.title || 'SOMETHING ABOUT YOUR PAGE';
  const revealMediaUrl = (scene as any).reveal_video_url || (scene as any).reveal_image_url || scene.image_url;

  // Timing
  const wordDurationFrames = 30; // 1.0s per word
  const revealStartFrame = wordDurationFrames * rawWords.length; // 210 frames = 7.0s
  const wipeDurationFrames = 30; // 1.0s wipe from 7.0s -> 8.0s
  const isRevealPhase = frame >= revealStartFrame;

  // Active word index in Phase 1
  const activeWordIndex = Math.min(Math.floor(frame / wordDurationFrames), rawWords.length - 1);
  const currentWord = rawWords[activeWordIndex] || '';
  const currentWordFrame = frame % wordDurationFrames;

  // Standard words background & text
  const bgColors = ['#FFFFFF', '#08080C', '#FFFFFF', '#08080C', '#FFFFFF', '#08080C', '#FFFFFF'];
  const textColors = ['#08080C', '#FFFFFF', '#08080C', '#FFFFFF', '#08080C', '#FFFFFF', '#08080C'];

  let currentBg = bgColors[activeWordIndex % bgColors.length];
  let currentTextColor = textColors[activeWordIndex % textColors.length];

  // ── SPECIAL "READY?" STAGE: BG Pulse & Marquee Wave ──
  const isReadyWord = currentWord.includes('?') || activeWordIndex === 2;
  const readyLetters = useMemo(() => 'READY?'.split(''), []);

  // Background smooth pulse for READY? (White -> Gray -> Dark Charcoal -> Gray -> White)
  if (isReadyWord) {
    const pulseNorm = (currentWordFrame % wordDurationFrames) / wordDurationFrames; // 0 -> 1
    if (pulseNorm < 0.25) {
      currentBg = '#FFFFFF';
    } else if (pulseNorm < 0.5) {
      currentBg = '#202226';
    } else if (pulseNorm < 0.75) {
      currentBg = '#111215';
    } else {
      currentBg = '#FFFFFF';
    }
  }

  // Pop spring on word trigger
  const wordSpring = spring({
    frame: currentWordFrame,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 220 },
  });
  const wordScale = interpolate(wordSpring, [0, 1], [1.08, 1.0]);

  // ── PHASE 2: 1-SECOND BLACK CURTAIN WIPE (7.0s -> 8.0s) & HERO REVEAL ──
  const revealFrame = Math.max(0, frame - revealStartFrame);

  // Black curtain vertical wipe progress (0% -> 100% from top to bottom)
  const wipeProgress = interpolate(revealFrame, [0, wipeDurationFrames], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slow subtle cinematic zoom drift on hero media (1.0 -> 1.06)
  const mediaZoom = interpolate(revealFrame, [0, durationInFrames - revealStartFrame], [1.0, 1.06], {
    extrapolateRight: 'clamp',
  });

  // Outro Text Pop Spring
  const textSpring = spring({
    frame: Math.max(0, revealFrame - 10),
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 130 },
  });

  // ── PHASE 3: LAST 0.5s - 0.8s WARM COLOR STROBE (ORANGE / RED / YELLOW FILM BURN) ──
  const framesFromEnd = Math.max(0, durationInFrames - frame);
  const isFinalWarmFlash = framesFromEnd <= 24; // Last ~0.8s

  // Flashing orange/yellow/red opacity
  const warmFlashOpacity = isFinalWarmFlash
    ? interpolate(framesFromEnd, [24, 18, 12, 6, 0], [0, 0.85, 0.45, 0.95, 0.7], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Bodoni / Didot Bold Condensed Serif Font Family
  const bodoniSerifFont = '"Bodoni MT", "Bodoni 72", "Didot", "Playfair Display", "Times New Roman", serif';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#08080C',
        fontFamily: bodoniSerifFont,
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          PHASE 1: Kinetic Strobe Beat (0s -> 7.0s)
          ───────────────────────────────────────────────────────────── */}
      {!isRevealPhase && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: currentBg,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `scale(${wordScale})`,
            padding: '0 24px',
            transition: 'background-color 0.1s ease',
          }}
        >
          {isReadyWord ? (
            /* READY? Travelling Light Marquee Wave (from Left to Right) */
            <div
              style={{
                display: 'flex',
                gap: isVertical ? '4px' : '8px',
                fontSize: isVertical ? '92px' : '124px',
                fontWeight: 900,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                transform: 'scaleY(1.18)',
              }}
            >
              {readyLetters.map((char: string, i: number) => {
                // Wave sweeps from left to right every 4 frames
                const waveIndex = Math.floor(currentWordFrame / 4) % (readyLetters.length + 2);
                const isLit = waveIndex === i || waveIndex === i + 1;
                const isBgDark = currentBg !== '#FFFFFF';

                let charColor = '#888888';
                if (isBgDark) {
                  charColor = isLit ? '#FFFFFF' : '#333336';
                } else {
                  charColor = isLit ? '#111111' : '#A0A0A0';
                }

                return (
                  <span
                    key={i}
                    style={{
                      color: charColor,
                      textShadow:
                        isBgDark && isLit
                          ? '0 0 25px rgba(255,255,255,0.85)'
                          : !isBgDark && isLit
                          ? '0 0 15px rgba(0,0,0,0.4)'
                          : 'none',
                      transition: 'color 0.08s ease',
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          ) : (
            /* Standard Bodoni Condensed Strobe Word */
            <h1
              style={{
                margin: 0,
                fontSize: isVertical ? '84px' : '116px',
                fontWeight: 900,
                color: currentTextColor,
                letterSpacing: '3px',
                textAlign: 'center',
                textTransform: 'uppercase',
                transform: 'scaleY(1.18)',
              }}
            >
              {currentWord}
            </h1>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PHASE 2 & 3: 1S BLACK CURTAIN WIPE & HERO REVEAL (7.0s -> 11.7s)
          ───────────────────────────────────────────────────────────── */}
      {isRevealPhase && (
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* Hero Media Layer (Image or Video) with Subtle Zoom Drift */}
          {revealMediaUrl && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${revealMediaUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `scale(${mediaZoom})`,
                filter: 'brightness(0.95) contrast(1.06)',
                // Linear Vertical Wipe revealing from top to bottom
                clipPath: `inset(0 0 ${100 - wipeProgress}% 0)`,
              }}
            />
          )}

          {/* Black Curtain Wipe Bar Edge */}
          {wipeProgress < 99 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${wipeProgress}%`,
                height: '6px',
                backgroundColor: 'rgba(255,255,255,0.75)',
                boxShadow: '0 0 20px rgba(255,255,255,0.9), 0 0 40px rgba(0,0,0,0.95)',
                zIndex: 15,
              }}
            />
          )}

          {/* Soft Dark Vignette for Text Readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
              pointerEvents: 'none',
              opacity: wipeProgress > 20 ? 1 : 0,
            }}
          />

          {/* Signature Dual-Layer Typography (Bodoni High-Contrast Serif) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              transform: `scale(${textSpring})`,
              zIndex: 20,
              padding: '0 20px',
              opacity: wipeProgress > 15 ? 1 : 0,
            }}
          >
            {/* Top Solid Headline ("STAY" / Brand Name) */}
            <div
              style={{
                fontSize: isVertical ? '96px' : '130px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '4px',
                lineHeight: 0.88,
                textTransform: 'uppercase',
                transform: 'scaleY(1.18)',
                textShadow: '0 10px 35px rgba(0,0,0,0.95), 0 0 25px rgba(0,0,0,0.85)',
              }}
            >
              {headlineSolid}
            </div>

            {/* Bottom Hollow Outlined Headline ("TUNED" / Product Name) */}
            <div
              style={{
                fontSize: isVertical ? '96px' : '130px',
                fontWeight: 900,
                color: 'transparent',
                WebkitTextStroke: '2.5px #FFFFFF',
                letterSpacing: '4px',
                lineHeight: 0.88,
                textTransform: 'uppercase',
                transform: 'scaleY(1.18)',
                marginTop: '10px',
                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.95))',
              }}
            >
              {headlineOutline}
            </div>

            {/* Tagline Italic Subtitle with Wide Letter Tracking */}
            {subHeadline && (
              <div
                style={{
                  marginTop: '28px',
                  fontSize: isVertical ? '12px' : '15px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 600,
                  fontStyle: 'italic',
                  letterSpacing: '4px',
                  color: '#FFFFFF',
                  opacity: 0.95,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                }}
              >
                {subHeadline}
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              PHASE 4: LAST 0.5s - 0.8s WARM COLOR STROBE (RED/ORANGE/YELLOW)
              ───────────────────────────────────────────────────────────── */}
          {isFinalWarmFlash && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, rgba(255, 20, 0, 0.8) 0%, rgba(255, 110, 0, 0.85) 45%, rgba(255, 220, 0, 0.75) 100%)',
                mixBlendMode: 'screen',
                opacity: warmFlashOpacity,
                pointerEvents: 'none',
                zIndex: 30,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
