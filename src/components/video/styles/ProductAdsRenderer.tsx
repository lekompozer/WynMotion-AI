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

  // 1. Assets & Scene Metadata
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

  const floatingAmplitude = (scene as any).floating_amplitude || 14;
  const tiltDeg = (scene as any).tilt_deg || 2.2;
  const sceneIndex = (scene as any).scene_id || (scene as any).scene_index || 1;
  const totalScenes = (scene as any).total_scenes || 1;
  const isFinalScene = sceneIndex === totalScenes;

  // 2. Lifecycle Timing
  const outroDurationSec = 1.5;
  const outroFrames = Math.round(fps * outroDurationSec);
  const outroStartFrame = Math.max(0, durationInFrames - outroFrames);
  const isOutroPhase = isFinalScene && frame >= outroStartFrame;
  const outroFrame = Math.max(0, frame - outroStartFrame);

  // Transition Phase at Scene Tail (Final 1.2s before next scene)
  const transitionFrames = Math.round(fps * 1.2);
  const isTransitionPhase = !isFinalScene && frame >= durationInFrames - transitionFrames;
  const transitionProgress = isTransitionPhase
    ? interpolate(frame, [durationInFrames - transitionFrames, durationInFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // 3. Layer 1: Background Parallax Slow Zoom
  const bgScale = interpolate(frame, [0, durationInFrames], [1.0, 1.06], {
    extrapolateRight: 'clamp',
  });

  // 4. Layer 3: Entrance Impact Spring (0s -> 0.7s)
  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 160 },
  });
  const entranceScale = interpolate(entranceSpring, [0, 1], [1.35, 1.0]);
  const entranceOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' });

  // Camera Impact Shake on Landing (frames 6 -> 18)
  const isShakePhase = frame >= 6 && frame <= 18;
  const shakeX = isShakePhase ? Math.sin(frame * 2.5) * (18 - frame) * 0.4 : 0;
  const shakeY = isShakePhase ? Math.cos(frame * 2.5) * (18 - frame) * 0.4 : 0;

  // Shockwave Ring Expansion on Impact (frames 6 -> 24)
  const shockwaveProgress = interpolate(frame, [6, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shockwaveScale = interpolate(shockwaveProgress, [0, 1], [0.3, 2.0]);
  const shockwaveOpacity = interpolate(shockwaveProgress, [0, 0.3, 1], [0, 0.8, 0]);

  // 5. Zero-Gravity Physics Float (Desire Phase)
  const rawFloatY = Math.sin(frame * 0.08) * floatingAmplitude;
  const rawFloatRotate = Math.sin(frame * 0.05) * tiltDeg;

  // 6. Light Sheen Specular Reflection Sweep (Continuous diagonal light scan)
  const streakCycle = frame % 90;
  const streakX = interpolate(streakCycle, [15, 45], [-120, 220], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const streakOpacity = interpolate(streakCycle, [15, 25, 38, 45], [0, 0.75, 0.75, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 7. Signature Match-to-Poster Outro Interpolation (For Final Scene)
  const outroProgress = isOutroPhase
    ? interpolate(outroFrame, [0, outroFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const currentScale = isOutroPhase
    ? interpolate(outroProgress, [0, 1], [entranceScale, 1.0])
    : entranceScale;
  const currentFloatY = isOutroPhase
    ? interpolate(outroProgress, [0, 1], [rawFloatY, 0])
    : rawFloatY;
  const currentRotate = isOutroPhase
    ? interpolate(outroProgress, [0, 1], [rawFloatRotate, 0])
    : rawFloatRotate;

  // Flash Glint on Outro Lock
  const outroGlintOpacity = isOutroPhase
    ? interpolate(outroProgress, [0.6, 0.85, 1.0], [0, 0.9, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // White Flash on Entry (0s -> 0.3s)
  const flashOpacity = interpolate(frame, [0, 2, 9], [0.85, 0.35, 0], {
    extrapolateRight: 'clamp',
  });

  // 8. TRANSITION EFFECTS:
  // (A) RGB Chromatic Aberration Glitch (Scene 1 -> 2)
  const isScene1Glitch = sceneIndex === 1 && isTransitionPhase;
  const glitchOffset = isScene1Glitch ? Math.sin(frame * 1.5) * transitionProgress * 12 : 0;

  // (B) Flash Blast Explosion (Scene 2 -> 3)
  const isScene2Blast = sceneIndex === 2 && isTransitionPhase;
  const blastScale = isScene2Blast ? interpolate(transitionProgress, [0, 1], [0.2, 3.5]) : 0;
  const blastOpacity = isScene2Blast
    ? interpolate(transitionProgress, [0, 0.2, 0.8, 1], [0, 0.95, 0.95, 0])
    : 0;

  // Ambient Bokeh Sparkle Particles
  const sparkleParticles = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        x: 15 + ((i * 37) % 70),
        y: 20 + ((i * 43) % 60),
        size: 3 + (i % 4) * 2,
        phaseOffset: i * 1.3,
      })),
    []
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#08080C',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          LAYER 1: Ambient 2.5D Parallax Background (Master Poster 100% Sắc Nét)
          ───────────────────────────────────────────────────────────── */}
      {bgUrl && (
        <>
          {/* Main Background Layer */}
          <div
            style={{
              position: 'absolute',
              inset: -20,
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${bgScale}) translate(${glitchOffset}px, 0)`,
              filter: isOutroPhase
                ? `contrast(${interpolate(outroProgress, [0, 1], [1.08, 1.0])}) brightness(${interpolate(outroProgress, [0, 1], [0.95, 1.0])})`
                : isScene1Glitch
                ? `contrast(1.2) hue-rotate(${glitchOffset * 10}deg)`
                : 'contrast(1.08) brightness(0.95)',
            }}
          />

          {/* RGB Glitch Red/Cyan Ghosting Layers on Transition */}
          {isScene1Glitch && (
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: -20,
                  backgroundImage: `url(${bgUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: `scale(${bgScale}) translate(${-glitchOffset * 1.2}px, 0)`,
                  mixBlendMode: 'screen',
                  opacity: 0.6,
                  filter: 'drop-shadow(0 0 10px #FF0055) hue-rotate(180deg)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: -20,
                  backgroundImage: `url(${bgUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: `scale(${bgScale}) translate(${glitchOffset * 1.5}px, ${glitchOffset * 0.5}px)`,
                  mixBlendMode: 'screen',
                  opacity: 0.5,
                  filter: 'drop-shadow(0 0 10px #00FFFF) hue-rotate(90deg)',
                  pointerEvents: 'none',
                }}
              />
            </>
          )}
        </>
      )}

      {/* Cinematic Vignette Overlay during float */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isVertical
            ? 'radial-gradient(ellipse at center, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.65) 100%)'
            : 'radial-gradient(ellipse at center, rgba(0,0,0,0.0) 45%, rgba(0,0,0,0.6) 100%)',
          opacity: isOutroPhase ? interpolate(outroProgress, [0, 1], [1, 0]) : 1,
          pointerEvents: 'none',
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          LAYER 2: Ambient Particles & Neon Rim Aura Rays
          ───────────────────────────────────────────────────────────── */}
      {!isOutroPhase && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
          {sparkleParticles.map((pt) => {
            const ptY = pt.y + Math.sin(frame * 0.06 + pt.phaseOffset) * 10;
            const ptOpacity = (Math.sin(frame * 0.1 + pt.phaseOffset) + 1) * 0.35 + 0.1;
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
                  opacity: ptOpacity,
                  boxShadow: `0 0 ${pt.size * 3}px ${accentColor}`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Shockwave Ring on Entrance Impact */}
      {hasValidCutout && shockwaveOpacity > 0.01 && !isOutroPhase && (
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
              border: `3px solid ${accentColor}`,
              transform: `scale(${shockwaveScale})`,
              opacity: shockwaveOpacity,
              boxShadow: `0 0 35px ${accentColor}, inset 0 0 25px ${primaryColor}`,
            }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 3: 2.5D Hero Cutout (Floating + Light Sheen + Outro Snap)
          ───────────────────────────────────────────────────────────── */}
      {hasValidCutout && cutoutUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `translateY(${currentFloatY}px) rotate(${currentRotate}deg) scale(${currentScale})`,
            opacity: isOutroPhase ? 1 : entranceOpacity,
            zIndex: 10,
          }}
        >
          <div style={{ position: 'relative', display: 'inline-block', maxWidth: '85%', maxHeight: '72%' }}>
            {/* Cutout Image with Deep 3D Drop Shadows & Ambient Aura */}
            <img
              src={cutoutUrl}
              alt="Hero Product Cutout"
              style={{
                maxHeight: isVertical ? '65vh' : '75vh',
                maxWidth: '100%',
                objectFit: 'contain',
                filter: isOutroPhase
                  ? `drop-shadow(0 ${interpolate(outroProgress, [0, 1], [25, 0])}px ${interpolate(outroProgress, [0, 1], [40, 0])}px rgba(0,0,0,0.85))`
                  : `drop-shadow(0 25px 45px rgba(0,0,0,0.85)) drop-shadow(0 0 30px ${primaryColor}44)`,
              }}
            />

            {/* Light Sheen Specular Sweep across Product surface */}
            {streakOpacity > 0.01 && !isOutroPhase && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${streakX}%`,
                  width: '70px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
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
          LAYER 4: White Flash Transition on Scene Entry (0s -> 0.3s)
          ───────────────────────────────────────────────────────────── */}
      {flashOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#FFFFFF',
            opacity: flashOpacity,
            pointerEvents: 'none',
            zIndex: 40,
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 5A: Flash Blast Explosion on Scene 2 -> 3 Transition
          ───────────────────────────────────────────────────────────── */}
      {isScene2Blast && blastOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 45,
          }}
        >
          {/* Central Radial Light Blast */}
          <div
            style={{
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at center, #FFFFFF 0%, rgba(255,255,255,0.9) 30%, rgba(255,230,240,0.4) 60%, transparent 100%)',
              transform: `scale(${blastScale})`,
              opacity: blastOpacity,
              boxShadow: '0 0 100px #FFFFFF',
            }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 5B: Match-to-Poster Outro Specular Glint Flash
          ───────────────────────────────────────────────────────────── */}
      {outroGlintOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.0) 65%)`,
            opacity: outroGlintOpacity,
            pointerEvents: 'none',
            zIndex: 50,
          }}
        />
      )}
    </div>
  );
};
