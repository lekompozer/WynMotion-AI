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
  const originalPosterUrl = scene.original_image_url || scene.image_url;
  const hasValidCutout = Boolean(
    scene.cutout_url &&
    scene.cutout_url !== scene.image_url &&
    scene.cutout_url !== scene.original_image_url
  );
  const cutoutUrl = hasValidCutout ? scene.cutout_url : null;
  const bgUrl = originalPosterUrl;

  const dominantColors = scene.dominant_colors || ['#FF0055', '#FFE600', '#00E5FF'];
  const neonColor = dominantColors[0] || '#FF0055';
  const accentColor = dominantColors[1] || '#FFE600';

  // 2. Motion Intensity
  const intensity = (scene.motion_intensity || 'MODERATE').toUpperCase();

  // 3. Dynamic Outro Duration Calculation (Match-to-Poster)
  const totalSec = scene.duration_sec || (durationInFrames / fps) || 10;
  const calculatedOutroSec = scene.outro_duration_sec || (
    totalSec <= 8 ? 1.2 : totalSec <= 12 ? 1.5 : totalSec <= 20 ? 1.8 : 2.2
  );
  const outroFrames = Math.min(Math.round(calculatedOutroSec * fps), Math.round(durationInFrames * 0.35));
  const outroStartFrame = Math.max(0, durationInFrames - outroFrames);

  // Outro Match-to-Poster Progress
  const outroProgress = hasValidCutout
    ? interpolate(frame, [outroStartFrame, durationInFrames - 4], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  const outroScale = interpolate(outroProgress, [0, 1], [0.96, 1.0]);

  // 4. Visual Hook White Flash Transition (0s -> 0.25s)
  const flashOpacity = interpolate(frame, [0, 3, 10], [0.8, 0.4, 0], {
    extrapolateRight: 'clamp',
  });

  // 5. Cinematic Background Pan & Parallax Scale
  const bgScale = interpolate(frame, [0, durationInFrames], [1.0, hasValidCutout ? 1.06 : 1.04], {
    extrapolateRight: 'clamp',
  });

  // 6. Hero Product Spring & Dynamic Entrance Physics (Smooth Luxury Commercial)
  const entranceDelayFrames = Math.round((scene.entrance_delay_sec || 0) * fps);
  const productSpring = spring({
    frame: Math.max(0, frame - entranceDelayFrames),
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 95 },
  });

  const entranceOpacity = interpolate(frame, [entranceDelayFrames, entranceDelayFrames + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const entranceDist = 60;
  const entranceTranslateY = interpolate(frame, [entranceDelayFrames, entranceDelayFrames + 14], [entranceDist, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Floating Physics: Gentle, silky smooth commercial breathing
  const floatAmp = 6;
  const productFloatY = Math.sin(frame * 0.045) * floatAmp;
  const productRotate = Math.sin(frame * 0.03) * 0.8;

  // 7. Ambient Layer: Subtle Luxury Particle Sparkles
  const particles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: 18 + (i * 9) % 68,
      y: 22 + (i * 13) % 60,
      size: 3 + (i % 3) * 1.5,
      speed: 0.035 + (i % 3) * 0.015,
      delay: i * 10,
    }));
  }, []);

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
          LAYER 1: Ambient Background / Master Poster (Cinematic Pan)
          ───────────────────────────────────────────────────────────── */}
      {(bgUrl || originalPosterUrl) && (
        <div
          style={{
            position: 'absolute',
            inset: -30,
            backgroundImage: `url(${bgUrl || originalPosterUrl})`,
            backgroundSize: hasValidCutout ? 'cover' : 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            transform: `scale(${bgScale})`,
            filter: hasValidCutout ? 'brightness(0.85) blur(12px)' : 'none',
            opacity: hasValidCutout ? (1 - outroProgress * 0.95) : 1,
          }}
        />
      )}

      {/* Ambient Vignette & Gradient Overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isVertical
            ? 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.02) 35%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.5) 100%)'
            : 'linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
          opacity: hasValidCutout ? (1 - outroProgress) : 0.4,
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          LAYER 2: Ambient Sparkle Particles
          ───────────────────────────────────────────────────────────── */}
      {hasValidCutout && particles.map((p) => {
        const pOpacity = Math.abs(Math.sin((frame + p.delay) * p.speed)) * 0.6 * (1 - outroProgress);
        const pY = p.y + Math.sin((frame + p.delay) * 0.04) * 6;
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
              boxShadow: `0 0 10px ${accentColor}`,
              opacity: pOpacity,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        );
      })}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 3: HERO Product Cutout (ONLY rendered if valid transparent PNG)
          ───────────────────────────────────────────────────────────── */}
      {hasValidCutout && cutoutUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `translateY(${(entranceTranslateY + productFloatY) * (1 - outroProgress)}px) rotate(${productRotate * (1 - outroProgress)}deg) scale(${productSpring})`,
            opacity: entranceOpacity * (1 - outroProgress * 0.95),
            zIndex: 10,
          }}
        >
          <img
            src={cutoutUrl}
            alt={scene.title || 'Product Cutout'}
            style={{
              maxHeight: isVertical ? '72%' : isSquare ? '75%' : '85%',
              maxWidth: isVertical ? '88%' : isSquare ? '85%' : '75%',
              objectFit: 'contain',
              filter: `drop-shadow(0 20px 45px rgba(0,0,0,0.75)) drop-shadow(0 0 30px ${neonColor}33)`,
            }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 4: SIGNATURE WYNMOTION "MATCH-TO-POSTER" REASSEMBLY OUTRO
          ───────────────────────────────────────────────────────────── */}
      {hasValidCutout && originalPosterUrl && outroProgress > 0 && (
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
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 5: CapCut White Flash Transition (0s -> 0.25s)
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
