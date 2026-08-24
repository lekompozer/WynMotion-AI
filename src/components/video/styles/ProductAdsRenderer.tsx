'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface ProductAdsRendererProps {
  scene: DynamicSceneData;
  showSceneCards?: boolean;
  showWhisperSubs?: boolean;
  cardPosY?: 'top' | 'middle' | 'bottom';
  subsPosY?: 'top' | 'middle' | 'bottom';
  onCardClick?: () => void;
  onSubsClick?: () => void;
}

/**
 * ProductAdsRenderer (Style 7) — High-Energy CapCut 2.5D Motion Ads Engine
 *
 * 1. Background (Layer 1):
 *    - SẮC NÉT HOÀN TOÀN (KHÔNG BLUR), chuyển động Cinematic Parallax Slow Zoom & Pan.
 * 2. Glitch & Shockwave VFX (Layer 2):
 *    - Light streak lướt qua, vòng tròn sóng xung kích (Shockwave ring) khi vật thể đáp xuống.
 * 3. Hero Cutout Object (Layer 3):
 *    - Nổi 2.5D rõ nét với 3D Drop Shadow & Aura Viền Neon, chuyển động Spring Slam/Pop + Breathing float.
 * 4. Kinetic Typography & CapCut Stickers (Layer 4):
 *    - Hook Badge trên cùng (VD: "MUA 1 TẶNG 1" / "BEST SELLER")
 *    - Headline chính (VD: "Ô LONG SỮA PHÊ LA")
 *    - Tag Giá / Voucher nổi bật
 *    - Nút CTA giật nhịp ("ĐẶT NGAY")
 */
export const ProductAdsRenderer: React.FC<ProductAdsRendererProps> = ({
  scene,
  showSceneCards = true,
  showWhisperSubs = true,
  cardPosY = 'top',
  subsPosY = 'bottom',
  onCardClick,
  onSubsClick,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const isVertical = height > width;
  const isSquare = Math.abs(width - height) < 50;

  // 1. Assets & Copy
  const originalPosterUrl = scene.original_image_url || scene.image_url;
  const hasValidCutout = Boolean(
    scene.cutout_url &&
    scene.cutout_url !== scene.image_url &&
    scene.cutout_url !== scene.original_image_url
  );
  const cutoutUrl = hasValidCutout ? scene.cutout_url : null;
  const bgUrl = originalPosterUrl;

  const hookText = (scene as any).hook_text || (scene as any).badge_text || 'HOT DEAL';
  const headlineText = (scene as any).headline_text || scene.title || 'SPECIAL PRODUCT';
  const priceText = (scene as any).price_text || (scene as any).feature_text || '';
  const ctaText = (scene as any).cta_text || 'MUA NGAY';

  const dominantColors = (scene as any).dominant_colors || ['#FF0055', '#FFE600', '#00E5FF'];
  const primaryColor = dominantColors[0] || '#FF0055';
  const accentColor = dominantColors[1] || '#FFE600';

  // 2. Camera Parallax & Subtle Slow Push-In (Sắc nét 100%, không blur)
  const bgScale = interpolate(frame, [0, durationInFrames], [1.0, 1.05], {
    extrapolateRight: 'clamp',
  });

  // 3. Entrance Impact Spring & Glitch Shake (0s -> 0.6s)
  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 140 },
  });

  const entranceScale = interpolate(entranceSpring, [0, 1], [1.25, 1.0]);
  const entranceOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' });

  // Micro Camera Shake on Landing (frames 6 -> 16)
  const isShakePhase = frame >= 6 && frame <= 18;
  const shakeX = isShakePhase ? Math.sin(frame * 2.5) * (18 - frame) * 0.4 : 0;
  const shakeY = isShakePhase ? Math.cos(frame * 2.5) * (18 - frame) * 0.4 : 0;

  // Shockwave Ring Expansion on Impact (frames 6 -> 24)
  const shockwaveProgress = interpolate(frame, [6, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shockwaveScale = interpolate(shockwaveProgress, [0, 1], [0.3, 1.8]);
  const shockwaveOpacity = interpolate(shockwaveProgress, [0, 0.3, 1], [0, 0.8, 0]);

  // 4. Floating 2.5D Levitation
  const floatY = Math.sin(frame * 0.06) * 8;
  const floatRotate = Math.sin(frame * 0.04) * 1.2;

  // Light Streak sweep across product (every 3.5s / ~105 frames)
  const streakCycle = frame % 105;
  const streakX = interpolate(streakCycle, [20, 50], [-150, 250], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const streakOpacity = interpolate(streakCycle, [20, 30, 45, 50], [0, 0.6, 0.6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 5. Kinetic Typography Animations
  // Hook Badge Pop-In (frames 4 -> 14)
  const badgeSpring = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 180 },
  });

  // Headline Pop-In (frames 8 -> 18)
  const headlineSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 150 },
  });

  // Price Tag Bounce (frames 14 -> 24)
  const priceSpring = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: { damping: 10, mass: 0.6, stiffness: 160 },
  });

  // CTA Button Heartbeat Pulse
  const ctaPulse = 1.0 + Math.abs(Math.sin(frame * 0.12)) * 0.06;

  // Flash Transition at Start (0s -> 0.25s)
  const flashOpacity = interpolate(frame, [0, 2, 8], [0.7, 0.3, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#08080C',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          LAYER 1: Master Poster / Background SẮC NÉT (Không làm mờ)
          ───────────────────────────────────────────────────────────── */}
      {(bgUrl || originalPosterUrl) && (
        <div
          style={{
            position: 'absolute',
            inset: -15,
            backgroundImage: `url(${bgUrl || originalPosterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${bgScale})`,
            filter: 'contrast(1.05) brightness(0.98)',
          }}
        />
      )}

      {/* Subtle Top & Bottom Cinematic Shadow Vignette (Đảm bảo chữ đọc rõ) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isVertical
            ? 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 28%, rgba(0,0,0,0.0) 65%, rgba(0,0,0,0.7) 100%)'
            : 'linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          LAYER 2: Shockwave Ring VFX on Impact
          ───────────────────────────────────────────────────────────── */}
      {hasValidCutout && shockwaveOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 6,
          }}
        >
          <div
            style={{
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              border: `4px solid ${accentColor}`,
              transform: `scale(${shockwaveScale})`,
              opacity: shockwaveOpacity,
              boxShadow: `0 0 35px ${accentColor}, inset 0 0 25px ${primaryColor}`,
            }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 3: 2.5D HERO PRODUCT CUTOUT (Vật thể nổi bật sống động)
          ───────────────────────────────────────────────────────────── */}
      {hasValidCutout && cutoutUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `translateY(${floatY}px) rotate(${floatRotate}deg) scale(${entranceScale})`,
            opacity: entranceOpacity,
            zIndex: 10,
          }}
        >
          <div style={{ position: 'relative', display: 'inline-block', maxWidth: '85%', maxHeight: '72%' }}>
            {/* Cutout Image with Deep 3D Drop Shadows */}
            <img
              src={cutoutUrl}
              alt={scene.title || 'Product Cutout'}
              style={{
                maxHeight: isVertical ? '65vh' : '75vh',
                maxWidth: '100%',
                objectFit: 'contain',
                filter: `drop-shadow(0 25px 40px rgba(0,0,0,0.85)) drop-shadow(0 0 35px ${primaryColor}55)`,
              }}
            />

            {/* Light Streak Reflection Overlay across Product */}
            {streakOpacity > 0.01 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${streakX}%`,
                  width: '60px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
                  transform: 'skewX(-25deg)',
                  opacity: streakOpacity,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 4: KINETIC TYPOGRAPHY & CAPCUT BADGES
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: isVertical ? '36px 20px 32px 20px' : '24px 30px',
          zIndex: 25,
          pointerEvents: 'none',
        }}
      >
        {/* TOP: Hook Badge & Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {/* Hook Badge (e.g. MUA 1 TẶNG 1 / BEST SELLER) */}
          {hookText && (
            <div
              style={{
                transform: `scale(${badgeSpring})`,
                backgroundColor: primaryColor,
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: isVertical ? '13px' : '16px',
                padding: '6px 18px',
                borderRadius: '30px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                boxShadow: `0 0 25px ${primaryColor}AA, 0 6px 15px rgba(0,0,0,0.6)`,
                border: '1.5px solid rgba(255,255,255,0.4)',
              }}
            >
              🔥 {hookText}
            </div>
          )}

          {/* Headline Text */}
          {headlineText && (
            <div
              style={{
                transform: `scale(${headlineSpring})`,
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: isVertical ? '22px' : '28px',
                textAlign: 'center',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                textShadow: '0 4px 20px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.8)',
                maxWidth: '92%',
                lineHeight: 1.15,
              }}
            >
              {headlineText}
            </div>
          )}
        </div>

        {/* BOTTOM: Price Tag & Pulsing CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {/* Offer / Price Tag */}
          {priceText && (
            <div
              style={{
                transform: `scale(${priceSpring}) rotate(-2deg)`,
                backgroundColor: accentColor,
                color: '#08080C',
                fontWeight: 900,
                fontSize: isVertical ? '15px' : '18px',
                padding: '6px 20px',
                borderRadius: '10px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                boxShadow: `0 0 30px ${accentColor}88, 0 8px 20px rgba(0,0,0,0.7)`,
              }}
            >
              ⚡ {priceText}
            </div>
          )}

          {/* Pulsing CTA Button */}
          {ctaText && (
            <div
              style={{
                transform: `scale(${ctaPulse})`,
                backgroundColor: '#FFFFFF',
                color: '#08080C',
                fontWeight: 900,
                fontSize: isVertical ? '16px' : '20px',
                padding: '10px 32px',
                borderRadius: '40px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                boxShadow: '0 0 35px rgba(255,255,255,0.7), 0 10px 25px rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{ctaText}</span>
              <span style={{ fontSize: '18px' }}>👉</span>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LAYER 5: CapCut White Flash on Scene Entry (0s -> 0.25s)
          ───────────────────────────────────────────────────────────── */}
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
  );
};
