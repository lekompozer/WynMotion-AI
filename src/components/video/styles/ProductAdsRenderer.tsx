'use client';

/**
 * Style 7: Product & Brand Motion Ads (F&B, Billboard, TikTok CapCut Ads)
 * Features:
 * - ⚡ CapCut White Flash Transition (0.15s)
 * - 🍔 2.5D Parallax Floating Hero Product(s) (Transparent Cutout RGBA)
 * - 🔤 Kinetic Large Headline Typography (Slam-in, Glow & Brand Stroke)
 * - 🏷️ Billboard Price / Promo Badge Pop
 * - ✨ Ambient Parallax Clean Background (Preserving Secondary Props)
 * - 🚀 Outro Fast Snap Transition (Camera zoom into Original Brand Poster at the end)
 */

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface ProductAdsRendererProps {
  scene: DynamicSceneData;
  showSceneCards?: boolean;
  showWhisperSubs?: boolean;
  cardPosY?: 'top' | 'middle' | 'bottom';
  subsPosY?: 'top' | 'middle' | 'bottom';
  swapSpeakers?: boolean;
  onCardClick?: () => void;
  onSubsClick?: () => void;
  primaryColor?: string;
  isDark?: boolean;
}

export const ProductAdsRenderer: React.FC<ProductAdsRendererProps> = ({
  scene,
  primaryColor = '#FF0055',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const isPortrait = height > width || height === 1920;
  const isSquare = width === height;
  const aspectRatio = isPortrait ? '9:16' : isSquare ? '1:1' : '16:9';

  // 1. Assets from Agent Pipeline
  const cutoutUrl = scene.cutout_url || scene.image_url;
  const bgUrl = scene.clean_bg_url || scene.bg_url || scene.image_url;
  const originalPosterUrl = scene.original_image_url || scene.image_url;
  const dominantColors = scene.dominant_colors || ['#FF0055', '#FFE600', '#00E5FF'];
  const neonColor = dominantColors[0] || primaryColor;
  const accentColor = dominantColors[1] || '#FFE600';

  // 2. Large Kinetic Headline Text (Primary Focus)
  const largeHeadline = scene.headline_text || scene.hook_text || scene.title || 'ƯU ĐÃI ĐẶC BIỆT';
  const subHeadline = scene.headline_sub || '';
  const priceText = scene.price_text || 'MUA NGAY';
  const subtitle = scene.voice_transcript || scene.summary_text || '';

  // 3. Dynamic Animation Modifiers determined by Gemini 3.7 Agent
  const animStyle = (scene as any).headline_animation || (scene as any).animation_type || 'slam_and_glow';
  const entranceDir = (scene as any).product_entrance || 'from_bottom';
  const floatStyle = (scene as any).floating_style || 'gentle_sine';

  // 4. White Flash Transition (CapCut White Flash at scene start)
  const flashOpacity = interpolate(frame, [0, 4, 14], [0.95, 0.7, 0], {
    extrapolateRight: 'clamp',
  });

  // 5. Background Parallax Scale
  const bgScale = interpolate(frame, [0, 150], [1.02, 1.10], {
    extrapolateRight: 'clamp',
  });

  // 6. Product Cutout Spring Pop & Dynamic Entrance
  const productSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 12, mass: 0.7, stiffness: 130 },
  });

  // Dynamic entrance translations
  const entranceTranslateX = entranceDir === 'from_left' ? interpolate(frame, [0, 15], [-200, 0], { extrapolateRight: 'clamp' })
    : entranceDir === 'from_right' ? interpolate(frame, [0, 15], [200, 0], { extrapolateRight: 'clamp' }) : 0;
  const entranceTranslateY = entranceDir === 'from_bottom' ? interpolate(frame, [0, 16], [180, 0], { extrapolateRight: 'clamp' }) : 0;

  // Dynamic floating physics
  const productFloatY = floatStyle === 'energetic_bounce' ? Math.abs(Math.sin(frame * 0.12)) * -22
    : Math.sin(frame * 0.08) * 10;
  const productRotate = floatStyle === '3d_tilt' ? Math.sin(frame * 0.08) * 4 : Math.sin(frame * 0.05) * 1.5;

  // 7. Kinetic Large Headline Slam, Pop or Neon Flicker
  const headlineSpring = spring({
    frame: frame - 8,
    fps,
    config: animStyle === 'kinetic_pop' ? { damping: 6, stiffness: 220 } : { damping: 9, stiffness: 180 },
  });
  const flickerOpacity = animStyle === 'neon_flicker' ? (frame % 8 < 2 ? 0.35 : 1) : 1;
  const glowRadius = 14 + Math.abs(Math.sin(frame * 0.15)) * 22;

  // 8. Billboard Price Badge Spring
  const badgeSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  // 9. Outro Fast Snap Zoom Transition to Original Poster (Final 2.5s / 75 frames)
  const outroStartFrame = Math.max(0, durationInFrames - 75);
  const outroProgress = interpolate(frame, [outroStartFrame, outroStartFrame + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outroScale = interpolate(outroProgress, [0, 1], [0.85, 1.0]);

  // 9. Particle Sparkles
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: 15 + (i * 7) % 75,
      y: 20 + (i * 11) % 65,
      size: 4 + (i % 5) * 2.5,
      speed: 0.04 + (i % 4) * 0.02,
      delay: i * 8,
    }));
  }, []);

  const isVertical = aspectRatio === '9:16';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#0A0A0E',
        overflow: 'hidden',
        fontFamily: "'Outfit', 'Montserrat', 'Inter', -apple-system, sans-serif",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          LAYER 1: Ambient Clean Background with Subtle Depth
          ───────────────────────────────────────────────────────────── */}
      {bgUrl && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            src={bgUrl}
            alt="Clean Background"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${bgScale})`,
              filter: 'brightness(0.65) saturate(1.15)',
            }}
          />
          {/* Ambient Lighting Gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at center, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.75) 90%)',
            }}
          />
        </div>
      )}

      {/* Ambient Neon Backlight Halo behind products */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: isVertical ? '52%' : '50%',
          width: isVertical ? '75%' : '55%',
          height: isVertical ? '42%' : '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${neonColor}55 0%, ${accentColor}22 50%, transparent 75%)`,
          filter: 'blur(55px)',
          opacity: 0.9,
          pointerEvents: 'none',
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          LAYER 2: Floating Golden Particle Sparkles
          ───────────────────────────────────────────────────────────── */}
      {particles.map((p) => {
        const pOpacity = interpolate(
          (frame + p.delay) % 60,
          [0, 30, 60],
          [0.2, 0.9, 0.2]
        );
        const pFloat = Math.sin((frame + p.delay) * p.speed) * 16;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: accentColor,
              boxShadow: `0 0 ${p.size * 3}px ${accentColor}, 0 0 ${p.size * 6}px #FFF`,
              opacity: pOpacity,
              transform: `translateY(${pFloat}px)`,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 3: SAM 2 RGBA Cutout Product(s) (2.5D Parallax Floating)
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: isVertical || isSquare ? 'center' : 'flex-end',
          alignItems: 'center',
          paddingRight: isVertical || isSquare ? 0 : '8%',
          paddingTop: isVertical ? '10%' : 0,
          transform: `translateX(${entranceTranslateX}px) translateY(${entranceTranslateY + productFloatY}px) rotate(${productRotate}deg) scale(${productSpring})`,
          zIndex: 10,
        }}
      >
        {cutoutUrl && (
          <img
            src={cutoutUrl}
            alt={scene.title || 'Product Cutout'}
            style={{
              maxHeight: isVertical ? '56%' : isSquare ? '60%' : '80%',
              maxWidth: isVertical ? '90%' : isSquare ? '84%' : '54%',
              objectFit: 'contain',
              filter: `drop-shadow(0 25px 45px rgba(0,0,0,0.85)) drop-shadow(0 0 35px ${neonColor}33)`,
            }}
          />
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LAYER 4: Kinetic Large Headline Typography & Billboard Badges
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: isVertical || isSquare ? 0 : '6%',
          top: isVertical ? 80 : isSquare ? 50 : '18%',
          width: isVertical || isSquare ? '100%' : '44%',
          textAlign: isVertical || isSquare ? 'center' : 'left',
          zIndex: 20,
          padding: isVertical || isSquare ? '0 20px' : 0,
          transform: `scale(${headlineSpring})`,
          opacity: flickerOpacity,
        }}
      >
        {/* Category Pill Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 18px',
            borderRadius: 999,
            background: 'rgba(0,0,0,0.65)',
            border: `1px solid ${accentColor}AA`,
            boxShadow: `0 0 18px ${accentColor}44`,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 16 }}>⚡</span>
          <span
            style={{
              fontSize: isVertical ? 14 : 16,
              fontWeight: 800,
              color: accentColor,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            COMMERCIAL HOT ADS
          </span>
        </div>

        {/* PRIMARY LARGE HEADLINE TEXT (SLAM-IN & NEON GLOW) */}
        <h1
          style={{
            margin: 0,
            fontSize: isVertical ? 38 : isSquare ? 34 : 48,
            fontWeight: 900,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            lineHeight: 1.12,
            letterSpacing: -0.5,
            textShadow: `0 0 ${glowRadius}px ${neonColor}, 0 0 30px ${neonColor}, 0 4px 14px rgba(0,0,0,0.9)`,
          }}
        >
          {largeHeadline}
        </h1>

        {/* Sub-Headline Text */}
        {subHeadline && (
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: isVertical ? 16 : 18,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: 0.5,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {subHeadline}
          </p>
        )}

        {/* Billboard Price / Offer Tag Pop-up */}
        <div
          style={{
            marginTop: isVertical ? 16 : 20,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: isVertical ? '10px 24px' : '12px 30px',
            borderRadius: 20,
            background: `linear-gradient(135deg, ${accentColor}EE, #FF9900)`,
            boxShadow: `0 12px 30px rgba(255,153,0,0.45), 0 0 20px ${accentColor}66`,
            transform: `scale(${badgeSpring})`,
          }}
        >
          <span
            style={{
              fontSize: isVertical ? 22 : 28,
              fontWeight: 900,
              color: '#0A0A0E',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {priceText}
          </span>
          <span
            style={{
              fontSize: isVertical ? 13 : 15,
              fontWeight: 800,
              color: '#0A0A0E',
              background: 'rgba(255,255,255,0.45)',
              padding: '3px 10px',
              borderRadius: 8,
            }}
          >
            NHẬN NGAY
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LAYER 5: Synchronized Voice Subtitle Banner at Bottom
          ───────────────────────────────────────────────────────────── */}
      {subtitle && !scene.hide_text && (
        <div
          style={{
            position: 'absolute',
            bottom: isVertical ? 70 : 40,
            left: '50%',
            transform: 'translateX(-50%)',
            width: isVertical ? '88%' : '75%',
            textAlign: 'center',
            zIndex: 30,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: isVertical ? '12px 24px' : '14px 32px',
              borderRadius: 24,
              backgroundColor: 'rgba(10, 10, 16, 0.78)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: isVertical ? 19 : 21,
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.35,
                textShadow: '0 2px 6px rgba(0,0,0,0.8)',
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 6: Outro Fast Snap Zoom to Original Brand Poster (Final 2.5s)
          ───────────────────────────────────────────────────────────── */}
      {outroProgress > 0 && originalPosterUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: outroProgress,
            transform: `scale(${outroScale})`,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
          }}
        >
          <img
            src={originalPosterUrl}
            alt="Original Brand Poster"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              boxShadow: '0 0 60px rgba(0,0,0,0.9)',
            }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 7: CapCut White Flash Overlay (Frames 0 -> 14)
          ───────────────────────────────────────────────────────────── */}
      {frame < 15 && (
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
