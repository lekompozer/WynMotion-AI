'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface ProductAdsRendererProps {
  scene: DynamicSceneData;
  showSceneCards?: boolean;
  showWhisperSubs?: boolean;
}

/**
 * ProductAdsRenderer (Style 7) — 100% Pure Visual Commercial Motion Engine
 * Strictly adhering to WYNMOTION_MASTER_ARCHITECTURE_AND_PIPELINE_SPEC.md
 *
 * Supports 1-Image, 2-Image, and 3-Image CapCut Trilogy:
 * - Scene 1 (Image 1): Entrance Slam -> 3D Zero-Gravity Float -> RGB Chroma Glitch Transition
 * - Scene 2 (Image 2): Object Cutout 2 Stacking Push -> Flash Blast Radial Explosion Transition
 * - Scene 3 (Image 3): Hero Product Close-Up -> Signature Match-to-Poster Outro Snap
 *
 * ❌ ZERO SYNTHETIC HTML TEXT/BUTTON OVERLAYS (No Subtitles, No Pills, No Web Buttons)
 */
export const ProductAdsRenderer: React.FC<ProductAdsRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const isVertical = height > width;

  // 1. Assets & Scene Metadata (100% Exact User Uploaded Product & Cutout)
  const originalPosterUrl = scene.original_image_url || scene.image_url;
  const hasValidCutout = Boolean(
    scene.cutout_url &&
    scene.cutout_url !== scene.image_url &&
    scene.cutout_url !== scene.original_image_url
  );
  const cutoutUrl = hasValidCutout ? scene.cutout_url : null;
  const bgUrl = originalPosterUrl;

  const dominantColors = (scene as any).dominant_colors || ['#FF0055', '#FFE600', '#00E5FF'];
  const primaryColor = dominantColors[0] || '#FF0055';
  const accentColor = dominantColors[1] || '#FFE600';

  const sceneIndex = (scene as any).scene_id || (scene as any).scene_index || 1;
  const totalScenes = (scene as any).total_scenes || 1;
  const isFinalScene = sceneIndex === totalScenes;

  // 2. Marvel / Fast Ads Timing Phases
  // NHỊP 1: Object Entrance Pop (0.0s – 0.5s / frames 0..15)
  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.45, stiffness: 220 },
  });
  const objectScale = interpolate(entranceSpring, [0, 1], [0.65, 1.0]);
  const objectOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  // Flare burst at entrance landing (frames 8 -> 22)
  const impactFlareProgress = interpolate(frame, [8, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const impactFlareOpacity = interpolate(impactFlareProgress, [0, 0.2, 1], [0, 0.85, 0]);
  const impactFlareScale = interpolate(impactFlareProgress, [0, 1], [0.4, 2.2]);

  // NHỊP 2: Background Reveal hòa quyện ngay tại vị trí của vật thể (0.4s – 1.4s / frames 12..42)
  const bgRevealProgress = interpolate(frame, [12, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bgOpacity = bgRevealProgress;
  const bgScale = interpolate(frame, [12, durationInFrames], [1.10, 1.03], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // NHỊP 3: Camera lướt nhẹ + Specular Anamorphic Light Sheen (1.2s -> Tail)
  // Subtle elegant float (NO wild shaking)
  const subtleFloatY = Math.sin(frame * 0.05) * 4;
  const subtleTilt = Math.sin(frame * 0.04) * 0.8;

  // Anamorphic Specular Streak Sweep
  const streakProgress = interpolate(frame, [30, 65], [-120, 220], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const streakOpacity = interpolate(frame, [30, 40, 55, 65], [0, 0.8, 0.8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // NHỊP 4: Fast Transition / Outro Snap (Final 0.5s)
  const transitionFrames = Math.round(fps * 0.55);
  const transitionStartFrame = Math.max(0, durationInFrames - transitionFrames);
  const isTransitionPhase = frame >= transitionStartFrame;
  const transitionProgress = isTransitionPhase
    ? interpolate(frame, [transitionStartFrame, durationInFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Fast Flash on Transition (or Match-to-Poster if final)
  const fastFlashOpacity = !isFinalScene && isTransitionPhase
    ? interpolate(transitionProgress, [0, 0.4, 1.0], [0, 0.9, 1.0])
    : 0;

  // Signature Match-to-Poster Outro for Final Scene
  const outroDurationFrames = Math.round(fps * 1.2);
  const outroStart = Math.max(0, durationInFrames - outroDurationFrames);
  const isOutro = isFinalScene && frame >= outroStart;
  const outroProgress = isOutro
    ? interpolate(frame, [outroStart, durationInFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const currentCutoutScale = isOutro
    ? interpolate(outroProgress, [0, 1], [1.0, 1.0])
    : objectScale;
  const currentFloatY = isOutro
    ? interpolate(outroProgress, [0, 1], [subtleFloatY, 0])
    : subtleFloatY;
  const currentTilt = isOutro
    ? interpolate(outroProgress, [0, 1], [subtleTilt, 0])
    : subtleTilt;

  // Subtle ambient bokeh dust
  const sparkleParticles = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        x: 18 + ((i * 41) % 65),
        y: 25 + ((i * 37) % 55),
        size: 3 + (i % 3) * 2,
        phase: i * 1.5,
      })),
    []
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#060709',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          LAYER 1: Background Reveal (Lộ dần từ vị trí của vật thể)
          ───────────────────────────────────────────────────────────── */}
      {bgUrl && (
        <div
          style={{
            position: 'absolute',
            inset: -15,
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${bgScale})`,
            opacity: hasValidCutout ? bgOpacity : 1,
            filter: 'contrast(1.06) brightness(0.98)',
            transition: 'opacity 0.1s linear',
          }}
        />
      )}

      {/* Dark Ambient Stage Vignette when background is blooming */}
      {hasValidCutout && bgOpacity < 0.99 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(6,7,9,0.3) 0%, rgba(6,7,9,0.95) 85%)',
            opacity: 1 - bgOpacity,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Ambient Neon Particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
        {sparkleParticles.map((pt) => {
          const ptY = pt.y + Math.sin(frame * 0.05 + pt.phase) * 8;
          const ptOpacity = (Math.sin(frame * 0.08 + pt.phase) + 1) * 0.35 + 0.15;
          return (
            <div
              key={pt.id}
              style={{
                position: 'absolute',
                left: `${pt.x}%`,
                top: `${ptY}%`,
                width: `${pt.size}px`,
                height: `${pt.size}px`,
                borderRadius: '50%',
                backgroundColor: accentColor,
                opacity: ptOpacity * bgOpacity,
                boxShadow: `0 0 ${pt.size * 3}px ${accentColor}`,
              }}
            />
          );
        })}
      </div>

      {/* Impact Radial Light Flare on Object Entrance */}
      {impactFlareOpacity > 0.01 && (
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
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: `radial-gradient(circle at center, ${primaryColor} 0%, rgba(255,255,255,0.8) 25%, transparent 70%)`,
              transform: `scale(${impactFlareScale})`,
              opacity: impactFlareOpacity,
              mixBlendMode: 'screen',
            }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 2: Hero Product Cutout (Marvel Style Entrance & Sheen)
          ───────────────────────────────────────────────────────────── */}
      {hasValidCutout && cutoutUrl ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `translateY(${currentFloatY}px) rotate(${currentTilt}deg) scale(${currentCutoutScale})`,
            opacity: objectOpacity,
            zIndex: 10,
          }}
        >
          <div style={{ position: 'relative', display: 'inline-block', maxWidth: '85%', maxHeight: '72%' }}>
            {/* Ultra-Clean Cutout Image */}
            <img
              src={cutoutUrl}
              alt="Hero Product"
              style={{
                maxHeight: isVertical ? '65vh' : '75vh',
                maxWidth: '100%',
                objectFit: 'contain',
                filter: isOutro
                  ? `drop-shadow(0 ${interpolate(outroProgress, [0, 1], [20, 0])}px ${interpolate(outroProgress, [0, 1], [30, 0])}px rgba(0,0,0,0.8))`
                  : `drop-shadow(0 20px 35px rgba(0,0,0,0.85)) drop-shadow(0 0 25px ${primaryColor}33)`,
              }}
            />

            {/* Specular Anamorphic Light Sheen Scan across surface */}
            {streakOpacity > 0.01 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${streakProgress}%`,
                  width: '80px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)',
                  transform: 'skewX(-25deg)',
                  opacity: streakOpacity,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        </div>
      ) : (
        /* Fallback if no cutout: Direct high-res product presentation */
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `scale(${objectScale})`,
            opacity: objectOpacity,
            zIndex: 10,
          }}
        >
          {originalPosterUrl && (
            <img
              src={originalPosterUrl}
              alt="Product"
              style={{
                maxHeight: isVertical ? '80vh' : '85vh',
                maxWidth: '90%',
                objectFit: 'contain',
                borderRadius: '16px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              }}
            />
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 3: Fast Transition Flash (Chuyển Cảnh Siêu Nhanh)
          ───────────────────────────────────────────────────────────── */}
      {fastFlashOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#FFFFFF',
            opacity: fastFlashOpacity,
            pointerEvents: 'none',
            zIndex: 50,
          }}
        />
      )}
    </div>
  );
};
