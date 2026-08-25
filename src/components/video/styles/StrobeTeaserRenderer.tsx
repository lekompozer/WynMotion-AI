'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface StrobeTeaserRendererProps {
  scene: DynamicSceneData;
}

const anyVideoExt = (url?: string): boolean => {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.mp4') || clean.endsWith('.mov') || clean.endsWith('.webm') || clean.endsWith('.avi');
};

/**
 * StrobeTeaserRenderer (Template 1) — 100% Exact CapCut Strobe Teaser & Big Reveal
 *
 * 1. Bold Condensed SANS-SERIF Typography (KHÔNG CÓ CHÂN / NO SERIFS):
 *    - Font: 'Impact', 'Anton', 'Bebas Neue', 'Arial Black', -apple-system, sans-serif
 * 2. Words Timeline:
 *    - Chữ 'READY?' xuất hiện chuẩn xác từ giây thứ 3.0s -> 4.0s (Frame 90 -> 120).
 *    - Chớp nháy siêu tốc gấp đôi (chu kỳ 2 frames/lần), đổi màu liên tục từng ký tự.
 * 3. Kích thước chữ 'SOMETHING':
 *    - Vừa vặn 100% bên trong khung dọc 9:16 (48px), không bị tràn mép.
 * 4. 1-Second Linear Black Curtain Wipe (7.0s -> 8.0s / Frame 210 -> 240):
 *    - Hàng đen kéo dần từ trên xuống dưới trong 1s để mở ra ảnh/clip 4s cuối.
 * 5. Hero Outro (8.0s -> 11.7s):
 *    - Chữ trên Solid ('STAY') + Chữ dưới Hollow Outline ('TUNED' -webkit-text-stroke: 2.5px #fff).
 *    - Tagline Marketing cuối (Editable).
 * 6. Fast Warm Color Strobe (Cam/Vàng/Đỏ):
 *    - Chớp sáng ở nửa dưới màn hình trong khoảng 0.8s -> 0.3s trước khi hết video, tắt hẳn ở 0.3s cuối.
 */
export const StrobeTeaserRenderer: React.FC<StrobeTeaserRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const isVertical = height > width;

  // Strobe Words & Copy (Word 3 is READY? at 3s-4s)
  const rawWords = (scene as any).strobe_words || ['ARE', 'YOU', 'GET', 'READY?', 'SOMETHING', 'BIG', 'COMING'];
  const headlineSolid = (scene as any).headline_solid || 'STAY';
  const headlineOutline = (scene as any).headline_outline || 'TUNED';
  const subHeadline = (scene as any).sub_headline || (scene as any).slogan_text || (scene as any).hook_text || '⚡ ĐÓN ĐẦU XU HƯỚNG - ƯU ĐÃI HÔM NAY';
  const revealVideoUrl = (scene as any).reveal_video_url || (scene as any).video_url || ((scene as any).image_url && anyVideoExt((scene as any).image_url) ? (scene as any).image_url : undefined);
  const revealImageUrl = (scene as any).reveal_image_url || scene.image_url;
  const revealMediaUrl = revealVideoUrl || revealImageUrl;

  // Timing
  const wordDurationFrames = 30; // 1.0s per word
  const revealStartFrame = 210; // 7.0s (7 words * 30 frames)
  const wipeDurationFrames = 30; // 1.0s wipe from 7.0s -> 8.0s
  const isRevealPhase = frame >= revealStartFrame;

  // Active word index in Phase 1 (0s -> 7.0s)
  const activeWordIndex = Math.min(Math.floor(frame / wordDurationFrames), rawWords.length - 1);
  const currentWord = rawWords[activeWordIndex] || '';
  const currentWordFrame = frame % wordDurationFrames;

  // Background & Text monochrome strobe colors
  const bgColors = ['#FFFFFF', '#08080C', '#08080C', '#FFFFFF', '#08080C', '#FFFFFF', '#08080C'];
  const textColors = ['#08080C', '#FFFFFF', '#FFFFFF', '#08080C', '#FFFFFF', '#08080C', '#FFFFFF'];

  let currentBg = bgColors[activeWordIndex % bgColors.length];
  let currentTextColor = textColors[activeWordIndex % textColors.length];

  // ── WORD 'READY?' AT 3.0s -> 4.0s (Frame 90 -> 120): Chớp Nháy Siêu Tốc Gấp Đôi ──
  const isReadyWord = currentWord.includes('?') || activeWordIndex === 3;
  const readyLetters = useMemo(() => 'READY?'.split(''), []);

  if (isReadyWord) {
    // Chớp nền nhanh gấp đôi (chu kỳ 6 frames)
    const fastPulse = Math.floor(currentWordFrame / 3) % 4;
    if (fastPulse === 0) currentBg = '#FFFFFF';
    else if (fastPulse === 1) currentBg = '#18191C';
    else if (fastPulse === 2) currentBg = '#666870';
    else currentBg = '#0B0C0E';
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

  // Slow subtle cinematic zoom drift on hero media (1.0 -> 1.05)
  const mediaZoom = interpolate(revealFrame, [0, durationInFrames - revealStartFrame], [1.0, 1.05], {
    extrapolateRight: 'clamp',
  });

  // Outro Text Pop Spring
  const textSpring = spring({
    frame: Math.max(0, revealFrame - 10),
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 130 },
  });

  // ── PHASE 3: WARM COLOR STROBE (Chớp lên lúc 0.8s trước khi kết thúc và TẮT HẲN ở 0.3s cuối) ──
  const framesFromEnd = Math.max(0, durationInFrames - frame);
  // 24 frames = ~0.8s, 9 frames = ~0.3s
  const isFinalWarmFlash = framesFromEnd <= 24 && framesFromEnd >= 9;

  const warmFlashOpacity = isFinalWarmFlash
    ? interpolate(framesFromEnd, [24, 18, 14, 9], [0, 0.95, 0.7, 0.0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Pure Heavy Sans-Serif Font (KHÔNG CÓ CHÂN)
  const heavySansFont = '"Impact", "Anton", "Bebas Neue", "Arial Black", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  // Dynamic responsive font size to ensure 'SOMETHING' fits completely within 9:16
  const getWordFontSize = (word: string) => {
    if (word.length >= 9) return isVertical ? '48px' : '78px'; // For 'SOMETHING'
    if (word.length >= 6) return isVertical ? '62px' : '92px'; // For 'COMING'
    return isVertical ? '76px' : '108px'; // For 'ARE', 'YOU', 'BIG'
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#08080C',
        fontFamily: heavySansFont,
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
            padding: '0 20px',
            transition: 'background-color 0.04s ease',
          }}
        >
          {isReadyWord ? (
            /* READY? at 3s -> 4s: Chớp tắt nháy đèn siêu tốc gấp đôi (2 frames/bước) */
            <div
              style={{
                display: 'flex',
                gap: isVertical ? '6px' : '10px',
                fontSize: isVertical ? '78px' : '112px',
                fontWeight: 900,
                letterSpacing: '3px',
                textTransform: 'uppercase',
              }}
            >
              {readyLetters.map((char: string, i: number) => {
                // Tốc độ quét nhanh gấp đôi: mỗi 2 frames chuyển bước
                const waveIndex = Math.floor(currentWordFrame / 2) % (readyLetters.length + 2);
                const isLit = waveIndex === i || waveIndex === i + 1;
                const isBgDark = currentBg !== '#FFFFFF';

                let charColor = '#777777';
                if (isBgDark) {
                  charColor = isLit ? '#FFFFFF' : ((currentWordFrame + i) % 2 === 0 ? '#111113' : '#444448');
                } else {
                  charColor = isLit ? '#000000' : ((currentWordFrame + i) % 2 === 0 ? '#FFFFFF' : '#999999');
                }

                return (
                  <span
                    key={i}
                    style={{
                      color: charColor,
                      textShadow:
                        isBgDark && isLit
                          ? '0 0 25px rgba(255,255,255,0.95)'
                          : !isBgDark && isLit
                          ? '0 0 14px rgba(0,0,0,0.5)'
                          : 'none',
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          ) : (
            /* Standard Bold Sans-Serif Strobe Word (Auto-sized to fit screen) */
            <h1
              style={{
                margin: 0,
                fontSize: getWordFontSize(currentWord),
                fontWeight: 900,
                color: currentTextColor,
                letterSpacing: '2px',
                textAlign: 'center',
                textTransform: 'uppercase',
                maxWidth: '92%',
                whiteSpace: 'nowrap',
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
          {/* Hero Media Layer (Video or Image) with Subtle Zoom Drift */}
          {revealMediaUrl && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `scale(${mediaZoom})`,
                filter: 'brightness(0.95) contrast(1.06)',
                clipPath: `inset(0 0 ${100 - wipeProgress}% 0)`,
                overflow: 'hidden',
              }}
            >
              {revealVideoUrl ? (
                <video
                  src={revealVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${revealMediaUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}
            </div>
          )}

          {/* Black Curtain Wipe Bar Edge */}
          {wipeProgress < 99 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${wipeProgress}%`,
                height: '5px',
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

          {/* Signature Dual-Layer Typography (Pure Bold Sans-Serif) */}
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
                fontSize: isVertical ? '84px' : '118px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '4px',
                lineHeight: 0.9,
                textTransform: 'uppercase',
                textShadow: '0 10px 35px rgba(0,0,0,0.95), 0 0 25px rgba(0,0,0,0.85)',
              }}
            >
              {headlineSolid}
            </div>

            {/* Bottom Hollow Outlined Headline ("TUNED" / Product Name) */}
            <div
              style={{
                fontSize: isVertical ? '84px' : '118px',
                fontWeight: 900,
                color: 'transparent',
                WebkitTextStroke: '2.5px #FFFFFF',
                letterSpacing: '4px',
                lineHeight: 0.9,
                textTransform: 'uppercase',
                marginTop: '6px',
                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.95))',
              }}
            >
              {headlineOutline}
            </div>

            {/* Editable Marketing Slogan Subtitle */}
            {subHeadline && (
              <div
                style={{
                  marginTop: '24px',
                  fontSize: isVertical ? '12px' : '15px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '3px',
                  color: '#FFFFFF',
                  opacity: 0.95,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                  maxWidth: '90%',
                  lineHeight: 1.3,
                }}
              >
                {subHeadline}
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              PHASE 4: FAST WARM COLOR STROBE (CHỚP LÊN RỒI TẮT HẲN Ở 0.3s CUỐI)
              ───────────────────────────────────────────────────────────── */}
          {isFinalWarmFlash && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '55%',
                background:
                  'linear-gradient(to top, rgba(255, 30, 0, 0.9) 0%, rgba(255, 120, 0, 0.8) 45%, rgba(255, 210, 0, 0.4) 75%, rgba(255, 210, 0, 0) 100%)',
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
