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
 * ProductAdsRenderer (Style 7) — WynMotion AI Motion Director Engine
 *
 * Implements the 3 Lifecycle Stages of High-Converting Motion Ads:
 * 1. ATTENTION (0s -> ~2s): Hook entrance (slam, pop, flash, slide)
 * 2. DESIRE (2s -> Outro): 2.5D Parallax, floating product, dynamic typography & price badge
 * 3. CONVERT (Outro): Signature WynMotion "Match-to-Poster" full artwork reassembly
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

  // 1. Assets from Agent Pipeline
  const cutoutUrl = scene.cutout_url || scene.image_url;
  const bgUrl = scene.clean_bg_url || scene.bg_url || scene.image_url;
  const originalPosterUrl = scene.original_image_url || scene.image_url;
  const dominantColors = scene.dominant_colors || ['#FF0055', '#FFE600', '#00E5FF'];
  const neonColor = dominantColors[0] || '#FF0055';
  const accentColor = dominantColors[1] || '#FFE600';

  // 2. Motion Intensity & Hierarchy
  const intensity = (scene.motion_intensity || 'ENERGETIC').toUpperCase();
  const intensityMultiplier = intensity === 'CALM' ? 0.45 : intensity === 'SUBTLE' ? 0.75 : intensity === 'HYPE' ? 1.35 : 1.0;

  // 3. Sequenced Timing Delays (Director Action Plan)
  const entranceDelayFrames = Math.round((scene.entrance_delay_sec || 0) * fps);
  const headlineDelayFrames = Math.round((scene.headline_delay_sec || 0.25) * fps);
  const priceDelayFrames = Math.round((scene.price_delay_sec || 1.6) * fps);

  // 4. Large Kinetic Headline & Badges
  const largeHeadline = scene.headline_text || scene.hook_text || scene.title || 'ƯU ĐÃI ĐẶC BIỆT';
  const subHeadline = scene.headline_sub || '';
  const priceText = scene.price_text || 'MUA NGAY';
  const subtitle = scene.voice_transcript || scene.summary_text || '';

  // 5. Actions
  const animStyle = scene.headline_action || (scene as any).headline_animation || 'slam_and_glow';
  const entranceDir = scene.entrance_action || (scene as any).product_entrance || 'from_bottom';
  const floatStyle = scene.floating_motion || (scene as any).floating_style || 'gentle_sine';

  // 6. Dynamic Outro Duration Calculation (Scaled by total duration)
  const totalSec = scene.duration_sec || (durationInFrames / fps) || 10;
  const calculatedOutroSec = scene.outro_duration_sec || (
    totalSec <= 8 ? 1.0 : totalSec <= 12 ? 1.3 : totalSec <= 20 ? 1.6 : 2.2
  );
  const outroFrames = Math.min(Math.round(calculatedOutroSec * fps), Math.round(durationInFrames * 0.35));
  const outroStartFrame = Math.max(0, durationInFrames - outroFrames);

  // Outro Match-to-Poster Progress
  const outroProgress = interpolate(frame, [outroStartFrame, durationInFrames - 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outroScale = interpolate(outroProgress, [0, 1], [0.94, 1.0]);

  // 7. Visual Hook White Flash Transition (0s -> 0.3s)
  const flashOpacity = interpolate(frame, [0, 4, 14], [intensity === 'CALM' ? 0.4 : 0.95, 0.6, 0], {
    extrapolateRight: 'clamp',
  });

  // 8. 2.5D Parallax Background Scale & Depth
  const bgScale = interpolate(frame, [0, 150], [1.02, 1.02 + 0.08 * intensityMultiplier], {
    extrapolateRight: 'clamp',
  });

  // 9. Hero Product Spring & Dynamic Entrance Physics
  const productSpring = spring({
    frame: Math.max(0, frame - entranceDelayFrames - 4),
    fps,
    config: intensity === 'HYPE'
      ? { damping: 8, mass: 0.6, stiffness: 170 }
      : intensity === 'CALM'
      ? { damping: 18, mass: 1.0, stiffness: 80 }
      : { damping: 12, mass: 0.7, stiffness: 130 },
  });

  const entranceDist = 180 * intensityMultiplier;
  const entranceTranslateX = entranceDir === 'from_left'
    ? interpolate(frame, [entranceDelayFrames, entranceDelayFrames + 14], [-entranceDist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : entranceDir === 'from_right'
    ? interpolate(frame, [entranceDelayFrames, entranceDelayFrames + 14], [entranceDist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const entranceTranslateY = entranceDir === 'from_bottom'
    ? interpolate(frame, [entranceDelayFrames, entranceDelayFrames + 15], [entranceDist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Floating Physics & 3D Tilt
  const floatAmp = (scene.floating_amplitude || (intensity === 'HYPE' ? 20 : intensity === 'CALM' ? 6 : 12)) * intensityMultiplier;
  const tiltMax = (scene.tilt_deg || (intensity === 'HYPE' ? 3.5 : intensity === 'CALM' ? 0.8 : 1.8)) * intensityMultiplier;
  const floatFreq = intensity === 'CALM' ? 0.05 : 0.08;

  const productFloatY = floatStyle === 'energetic_bounce'
    ? Math.abs(Math.sin(frame * floatFreq * 1.4)) * -floatAmp * 1.5
    : Math.sin(frame * floatFreq) * floatAmp;
  const productRotate = Math.sin(frame * floatFreq * 0.7) * tiltMax;

  // 10. Support Layer: Kinetic Headline Physics
  const headlineSpring = spring({
    frame: Math.max(0, frame - headlineDelayFrames),
    fps,
    config: animStyle === 'kinetic_pop' ? { damping: 6, stiffness: 220 } : { damping: 9, stiffness: 180 },
  });
  const flickerOpacity = animStyle === 'neon_flicker' ? (frame % 9 < 2 ? 0.3 : 1) : 1;
  const glowRadius = 12 + Math.abs(Math.sin(frame * 0.15)) * (16 * intensityMultiplier);

  // 11. Support Layer: Billboard Price Badge Spring
  const badgeSpring = spring({
    frame: Math.max(0, frame - priceDelayFrames),
    fps,
    config: { damping: 11, stiffness: 190 },
  });

  // 12. Ambient Layer: Particle Sparkles
  const particles = useMemo(() => {
    const count = intensity === 'CALM' ? 6 : intensity === 'HYPE' ? 18 : 12;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: 15 + (i * 7) % 75,
      y: 20 + (i * 11) % 65,
      size: 4 + (i % 5) * 2.5,
      speed: 0.04 + (i % 4) * 0.02,
      delay: i * 8,
    }));
  }, [intensity]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#08080C',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          LAYER 1: Ambient Clean Background (2.5D Parallax)
          ───────────────────────────────────────────────────────────── */}
      {bgUrl && (
        <div
          style={{
            position: 'absolute',
            inset: -40,
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${bgScale})`,
            filter: 'brightness(0.92) contrast(1.05)',
            transition: 'filter 0.3s ease',
            opacity: 1 - outroProgress * 0.9,
          }}
        />
      )}

      {/* Ambient Vignette & Gradient Overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isVertical
            ? 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.1) 65%, rgba(0,0,0,0.7) 100%)'
            : 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
          opacity: 1 - outroProgress,
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          LAYER 2: Ambient Particle Sparkles & Neon Glow Rays
          ───────────────────────────────────────────────────────────── */}
      {particles.map((p) => {
        const pOpacity = Math.abs(Math.sin((frame + p.delay) * p.speed)) * 0.75 * (1 - outroProgress);
        const pY = p.y + Math.sin((frame + p.delay) * 0.05) * 8;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${pY}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: accentColor,
              boxShadow: `0 0 14px ${accentColor}`,
              opacity: pOpacity,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        );
      })}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 3: HERO Product Cutout (2.5D Parallax Floating & Physical Spring)
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translateX(${entranceTranslateX * (1 - outroProgress)}px) translateY(${(entranceTranslateY + productFloatY) * (1 - outroProgress)}px) rotate(${productRotate * (1 - outroProgress)}deg) scale(${productSpring})`,
          zIndex: 10,
          opacity: 1 - outroProgress * 0.95,
        }}
      >
        {cutoutUrl && (
          <img
            src={cutoutUrl}
            alt={scene.title || 'Product Cutout'}
            style={{
              maxHeight: isVertical ? '72%' : isSquare ? '75%' : '88%',
              maxWidth: isVertical ? '90%' : isSquare ? '88%' : '75%',
              objectFit: 'contain',
              filter: `drop-shadow(0 25px 50px rgba(0,0,0,0.85)) drop-shadow(0 0 40px ${neonColor}44)`,
            }}
          />
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LAYER 4: SIGNATURE WYNMOTION "MATCH-TO-POSTER" REASSEMBLY OUTRO
          ───────────────────────────────────────────────────────────── */}
      {originalPosterUrl && outroProgress > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${originalPosterUrl})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            transform: `scale(${outroScale})`,
            opacity: outroProgress,
            zIndex: 40,
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 5: CapCut White Flash Transition (0s -> 0.3s)
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
