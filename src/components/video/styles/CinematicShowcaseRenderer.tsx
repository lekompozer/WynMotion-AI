'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface CinematicShowcaseRendererProps {
  scene: DynamicSceneData;
}

/**
 * CinematicShowcaseRenderer (Template 2) — 22.0s Premium Product & F&B Showcase Reel
 *
 * 5 Iconic Stages:
 * 1. Flare Intro (0s -> 3.5s): Fast Zoom + Glowing Hook Badge ("BEST MENU")
 * 2. Smoke & Mist Atmosphere (3.5s -> 7.5s): Rising mist particles + Monochrome to vivid color flash
 * 3. Zero-Gravity Floating Cutout (7.5s -> 11.5s): 2.5D levitation physics + rising ember particles
 * 4. Staggered 3-Panel Split Gallery (11.5s -> 16.0s): 3 vertical panels sliding in with staggered delays
 * 5. Hero Outro & Pulse CTA (16.0s -> 22.0s): Levitation stack + Pulsing CTA button ("ORDER NOW")
 */
export const CinematicShowcaseRenderer: React.FC<CinematicShowcaseRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const isVertical = height > width;

  // Assets & Typography Props
  const mainImage = scene.original_image_url || scene.image_url;
  const cutoutUrl = scene.cutout_url;
  const galleryImages = (scene as any).gallery_images || (mainImage ? [mainImage] : []);
  const badgeText = (scene as any).badge_text || 'BEST MENU';
  const featureText = (scene as any).feature_text || scene.title || 'PREMIUM SPECIALTY';
  const ctaText = (scene as any).cta_text || 'ORDER NOW';
  const accentColor = (scene as any).accent_color || '#FF7A00';

  // 5 Timing Segments (Frames at 30fps)
  const s1End = Math.round(3.5 * fps);  // 105
  const s2End = Math.round(7.5 * fps);  // 225
  const s3End = Math.round(11.5 * fps); // 345
  const s4End = Math.round(16.0 * fps); // 480
  // s5: 16.0s -> 22.0s

  const currentStage =
    frame < s1End ? 1 : frame < s2End ? 2 : frame < s3End ? 3 : frame < s4End ? 4 : 5;

  // 1. Flare & Flash Transitions
  const stage1Spring = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const introZoom = interpolate(stage1Spring, [0, 1], [1.18, 1.02]);

  // 2. Smoke / Mist Particles (Stage 2 & 3)
  const embers = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      x: 10 + (i * 6) % 80,
      yStart: 85 + (i * 3) % 15,
      size: 2.5 + (i % 4) * 1.5,
      speed: 0.04 + (i % 3) * 0.02,
      delay: i * 8,
    }));
  }, []);

  // 3. Zero Gravity Floating Cutout Physics (Stage 3)
  const stage3Frame = Math.max(0, frame - s2End);
  const floatY = Math.sin(stage3Frame * 0.05) * 10;
  const floatRotate = Math.sin(stage3Frame * 0.035) * 1.8;
  const stage3Spring = spring({ frame: stage3Frame, fps, config: { damping: 12, stiffness: 100 } });

  // 4. Staggered 3-Panel Split Animation (Stage 4)
  const stage4Frame = Math.max(0, frame - s3End);
  const panel1Y = interpolate(stage4Frame, [0, 16], [height, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const panel2Y = interpolate(Math.max(0, stage4Frame - 4), [0, 16], [-height, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const panel3Y = interpolate(Math.max(0, stage4Frame - 8), [0, 16], [height, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 5. Stage 5: Hero Outro Pulse CTA (Heartbeat scale 1.0 -> 1.08)
  const stage5Frame = Math.max(0, frame - s4End);
  const pulseScale = 1.0 + Math.abs(Math.sin(stage5Frame * 0.12)) * 0.08;
  const outroZoom = interpolate(stage5Frame, [0, durationInFrames - s4End], [1.0, 1.06], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#07070A',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          STAGE 1 & 2: HERO BACKGROUND & FLUID AMBIENT
          ───────────────────────────────────────────────────────────── */}
      {(currentStage === 1 || currentStage === 2) && mainImage && (
        <div
          style={{
            position: 'absolute',
            inset: -20,
            backgroundImage: `url(${mainImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${introZoom})`,
            filter: currentStage === 2 ? 'contrast(1.15) brightness(0.95)' : 'none',
          }}
        />
      )}

      {/* Stage 1 Hook Badge ("BEST MENU") */}
      {currentStage === 1 && (
        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            transform: `scale(${stage1Spring})`,
            zIndex: 20,
          }}
        >
          <div
            style={{
              backgroundColor: accentColor,
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: isVertical ? '24px' : '32px',
              padding: '10px 28px',
              borderRadius: '8px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              boxShadow: `0 0 35px ${accentColor}88, 0 10px 25px rgba(0,0,0,0.6)`,
            }}
          >
            {badgeText}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 3: ZERO-GRAVITY FLOATING CUTOUT + EMBERS
          ───────────────────────────────────────────────────────────── */}
      {currentStage === 3 && (
        <div style={{ position: 'absolute', inset: 0 }}>
          {mainImage && (
            <div
              style={{
                position: 'absolute',
                inset: -20,
                backgroundImage: `url(${mainImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.5) blur(14px)',
              }}
            />
          )}

          {/* Rising Ember Particles */}
          {embers.map((p) => {
            const emberY = p.yStart - ((stage3Frame * p.speed * 4) % 90);
            const emberOpacity = Math.abs(Math.sin(stage3Frame * 0.08 + p.id)) * 0.85;
            return (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${emberY}%`,
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  backgroundColor: accentColor,
                  boxShadow: `0 0 12px ${accentColor}`,
                  opacity: emberOpacity,
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />
            );
          })}

          {/* Floating Product Cutout */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transform: `translateY(${floatY}px) rotate(${floatRotate}deg) scale(${stage3Spring})`,
              zIndex: 15,
            }}
          >
            <img
              src={cutoutUrl || mainImage}
              alt="Floating Hero"
              style={{
                maxHeight: '75%',
                maxWidth: '85%',
                objectFit: 'contain',
                filter: `drop-shadow(0 25px 50px rgba(0,0,0,0.85)) drop-shadow(0 0 40px ${accentColor}44)`,
              }}
            />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 4: STAGGERED 3-PANEL SPLIT GALLERY
          ───────────────────────────────────────────────────────────── */}
      {currentStage === 4 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            gap: '6px',
            backgroundColor: '#000000',
            padding: '6px',
          }}
        >
          {/* Panel 1 */}
          <div
            style={{
              flex: 1,
              height: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundImage: `url(${galleryImages[0] || mainImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `translateY(${panel1Y}px)`,
            }}
          />
          {/* Panel 2 */}
          <div
            style={{
              flex: 1,
              height: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundImage: `url(${galleryImages[1] || galleryImages[0] || mainImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `translateY(${panel2Y}px)`,
            }}
          />
          {/* Panel 3 */}
          <div
            style={{
              flex: 1,
              height: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundImage: `url(${galleryImages[2] || galleryImages[0] || mainImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `translateY(${panel3Y}px)`,
            }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 5: HERO OUTRO & PULSE CTA BUTTON ("ORDER NOW")
          ───────────────────────────────────────────────────────────── */}
      {currentStage === 5 && mainImage && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <div
            style={{
              position: 'absolute',
              inset: -15,
              backgroundImage: `url(${mainImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${outroZoom})`,
            }}
          />

          {/* Dark Bottom Gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Bottom Pulse CTA Box */}
          <div
            style={{
              position: 'absolute',
              bottom: '10%',
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 30,
              padding: '0 24px',
            }}
          >
            {featureText && (
              <div
                style={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: isVertical ? '18px' : '22px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                  textShadow: '0 4px 15px rgba(0,0,0,0.8)',
                  textAlign: 'center',
                }}
              >
                {featureText}
              </div>
            )}

            {/* Pulsing CTA Button */}
            <div
              style={{
                backgroundColor: accentColor,
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: isVertical ? '26px' : '34px',
                padding: '14px 44px',
                borderRadius: '50px',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                transform: `scale(${pulseScale})`,
                boxShadow: `0 0 40px ${accentColor}AA, 0 10px 30px rgba(0,0,0,0.6)`,
              }}
            >
              {ctaText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
