'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from '../RemotionEngine';
import { GLSLTransitionCanvas } from './transitions/GLSLTransitionCanvas';

import { RGBScanlineGlitchRenderer } from './RGBScanlineGlitchRenderer';

export interface TimelineBlock {
  block_id: string;
  block_type: 'kinetic_text_card' | 'product_hero_showcase' | 'strobe_flip_card' | 'outro_cta_card';
  start_time: number;
  end_time: number;
  image_index?: number;
  motion_in?: string;
  underlayer_effect?: string;
  typography_preset?: string;
  solid_word?: string;
  outline_word?: string;
  visual_effect?: string;
  headline?: string;
  sub_caption?: string;
  strobe_text?: string;
  badge_text?: string;
  cta_button?: string;
  typography?: {
    headline?: string;
    sub_caption?: string;
    style?: string;
    position?: string;
  };
  params?: Record<string, any>;
  transition_out?: {
    shader_name: string;
    duration: number;
  };
}

export interface UniversalTimelineData {
  project_id: string;
  total_duration: number;
  aspect_ratio?: string;
  creative_concept?: string;
  director_script?: string;
  timeline_blocks: TimelineBlock[];
}

export interface UniversalMotionPlayerProps {
  timeline: UniversalTimelineData;
  productImages?: string[];
  productCutouts?: string[];
  shadersMap?: Record<string, string>; // shader_name -> GLSL code string
  sceneStartSec?: number;
}

export const UniversalMotionPlayer: React.FC<UniversalMotionPlayerProps> = ({
  timeline,
  productImages = [],
  productCutouts = [],
  shadersMap = {},
  sceneStartSec = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Support continuous timing whether rendered in sequence or standalone
  const currentTime = sceneStartSec + (frame / fps);
  const blocks = timeline?.timeline_blocks || [];

  // Find active block based on currentTime
  const activeBlockIndex = useMemo(() => {
    return blocks.findIndex((b) => currentTime >= b.start_time && currentTime < b.end_time);
  }, [blocks, currentTime]);

  const activeBlock = blocks[activeBlockIndex >= 0 ? activeBlockIndex : (currentTime >= (blocks[blocks.length - 1]?.end_time || 15) ? blocks.length - 1 : 0)];
  const nextBlock = activeBlockIndex >= 0 && activeBlockIndex + 1 < blocks.length ? blocks[activeBlockIndex + 1] : null;

  if (!activeBlock) {
    return <div style={{ width: '100%', height: '100%', background: '#000' }} />;
  }

  const blockDuration = Math.max(0.01, activeBlock.end_time - activeBlock.start_time);
  const blockProgress = Math.min(1, Math.max(0, (currentTime - activeBlock.start_time) / blockDuration));

  // Extract typography fields cleanly with multi-tier fallbacks
  const headline = activeBlock.headline || activeBlock.typography?.headline || activeBlock.params?.headline || activeBlock.params?.words?.[0] || '';
  const subCaption = activeBlock.sub_caption || activeBlock.typography?.sub_caption || activeBlock.params?.sub_caption || activeBlock.params?.words?.[1] || '';
  const strobeText = activeBlock.strobe_text || activeBlock.headline || activeBlock.params?.text || activeBlock.params?.words?.[0] || 'FLASH DEAL';
  const badgeText = activeBlock.badge_text || activeBlock.params?.badge || 'ƯU ĐÃI';
  const ctaButton = activeBlock.cta_button || activeBlock.params?.cta_button || '⚡ ĐẶT HÀNG NGAY ➔';

  const solidWord = activeBlock.solid_word || (headline ? headline.split(' ')[0] : 'TRÀ');
  const outlineWord = activeBlock.outline_word || (headline && headline.split(' ').length > 1 ? headline.split(' ').slice(1).join(' ') : 'BEJP');
  const typoPreset = activeBlock.typography_preset || 'strobe_dual_solid_outline';

  // 1s / 1-2 Micro-effects oscillators
  const sheenProgress = interpolate((currentTime % 1.2) / 1.2, [0, 1], [-120, 220]);
  const isGlitchBeat = (currentTime % 0.8) < 0.15 || activeBlock.visual_effect === 'horizontal_scanline_rgb_glitch';
  const glitchOffset = isGlitchBeat ? Math.sin(frame * 2.5) * 12 : 0;
  const entranceFlash = blockProgress < 0.1 ? interpolate(blockProgress, [0, 0.1], [0.85, 0]) : 0;

  // Strobe Scale oscillation for Typography
  const strobeScale = 1 + 0.05 * Math.sin(frame * 0.5);

  // Transition out calculation
  const transConfig = activeBlock.transition_out;
  const transDuration = transConfig?.duration || 0.5;
  const isTransitioning = transConfig && currentTime >= activeBlock.end_time - transDuration && nextBlock;
  const transProgress = isTransitioning
    ? (currentTime - (activeBlock.end_time - transDuration)) / transDuration
    : 0;

  // Image helpers
  const getImg = (idx?: number) => {
    if (idx === undefined || idx < 0 || idx >= productImages.length) return productImages[0] || '';
    return productImages[idx];
  };

  const getCut = (idx?: number) => {
    if (idx === undefined || idx < 0 || idx >= productCutouts.length) return productCutouts[0] || getImg(idx);
    return productCutouts[idx] || getImg(idx);
  };

  const currImg = getImg(activeBlock.image_index);
  const currCut = getCut(activeBlock.image_index);
  const prevImg = activeBlock.image_index && activeBlock.image_index > 0 ? getImg(activeBlock.image_index - 1) : null;
  const nextImg = nextBlock ? getImg(nextBlock.image_index) : '';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#000000',
        fontFamily: "'Montserrat', 'Be Vietnam Pro', 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=Montserrat:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
      `}</style>
      {/* ─────────────────────────────────────────────────────────────
          1. KINETIC TEXT CARD BLOCK (Mở đầu / Visual Hook - Ảnh 2 Typography)
          ───────────────────────────────────────────────────────────── */}
      {activeBlock.block_type === 'kinetic_text_card' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: activeBlock.params?.bg_color || '#000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 20px',
            textAlign: 'center',
          }}
        >
          {/* Ambient Glow Aura */}
          <div
            style={{
              position: 'absolute',
              width: '360px',
              height: '360px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,0,85,0.5) 0%, rgba(255,230,0,0.2) 60%, transparent 80%)',
              filter: 'blur(50px)',
              transform: `scale(${1 + 0.15 * Math.sin(frame * 0.5)})`,
              pointerEvents: 'none',
            }}
          />

          {/* Strobe Dual Solid + Outline Typography (Ảnh 2) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${strobeScale}) translateX(${glitchOffset}px)`,
              zIndex: 10,
            }}
          >
            {/* Solid Upper Word */}
            <div
              style={{
                fontSize: '68px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                lineHeight: 0.95,
                textShadow: '0 10px 30px rgba(0,0,0,0.9), 0 0 40px rgba(255,255,255,0.7)',
              }}
            >
              {solidWord}
            </div>

            {/* Hollow Outline Lower Word (Ảnh 2) */}
            <div
              style={{
                fontSize: '62px',
                fontWeight: 900,
                WebkitTextStroke: '2.5px #FFFFFF',
                color: 'transparent',
                letterSpacing: '5px',
                textTransform: 'uppercase',
                lineHeight: 1.0,
                marginTop: '4px',
                textShadow: '0 10px 25px rgba(0,0,0,0.8)',
              }}
            >
              {outlineWord}
            </div>

            {/* Subtitle Promo Ribbon */}
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#FFE600',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginTop: '18px',
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,230,0,0.4)',
                padding: '4px 16px',
                borderRadius: '20px',
                textShadow: '0 2px 10px rgba(0,0,0,0.9)',
              }}
            >
              {subCaption || strobeText || 'ƯU ĐÃI LỚN HÔM NAY'}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. STROBE FLIP CARD BLOCK (Chớp giật Trắng/Đen nghịch màu)
          ───────────────────────────────────────────────────────────── */}
      {activeBlock.block_type === 'strobe_flip_card' && (
        (() => {
          const flashHz = activeBlock.params?.flash_hz || 8;
          const isWhitePhase = Math.floor(currentTime * flashHz) % 2 === 0;
          return (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: isWhitePhase ? '#FFFFFF' : '#000000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0 30px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '52px',
                  fontWeight: 900,
                  color: isWhitePhase ? '#000000' : '#FFFFFF',
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  lineHeight: 1.15,
                  transform: `scale(${1 + 0.06 * Math.sin(frame * 0.6)}) translateX(${glitchOffset}px)`,
                  textShadow: isWhitePhase ? 'none' : '0 0 30px rgba(255,255,255,0.7)',
                }}
              >
                {strobeText || headline || 'MUA 1 TẶNG 1'}
              </div>
            </div>
          );
        })()
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. PRODUCT HERO SHOWCASE BLOCK (Thân bài Showcase 2.5D + Glitch Scanline Ảnh 3)
          ───────────────────────────────────────────────────────────── */}
      {activeBlock.block_type === 'product_hero_showcase' && (
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* Underlayer: Grayscale Dimmed Previous Object if stacking */}
          {prevImg && activeBlock.underlayer_effect === 'grayscale_dim' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${prevImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'grayscale(90%) brightness(0.35) blur(2px)',
                transform: 'scale(1.02)',
              }}
            />
          )}

          {/* Current Background Layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${currImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${interpolate(blockProgress, [0, 1], [1.0, 1.06])})`,
              filter:
                activeBlock.underlayer_effect === 'grayscale_dim' && !prevImg
                  ? 'grayscale(50%) brightness(0.7) contrast(1.1)'
                  : 'contrast(1.08) brightness(1.0)',
            }}
          />

          {/* Hero Cutout Push Layer with Sheen Sweep or RGB Glitch (Ảnh 3) */}
          {currCut && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform:
                  activeBlock.motion_in === 'slide_from_right_lock_1to1'
                    ? `translateX(${interpolate(Math.min(1, blockProgress / 0.18), [0, 1], [550, 0]) + glitchOffset}px)`
                    : activeBlock.motion_in === 'slide_from_bottom_over_underlayer'
                    ? `translateY(${interpolate(Math.min(1, blockProgress / 0.18), [0, 1], [400, 0])}px) translateX(${glitchOffset}px)`
                    : `scale(${interpolate(Math.min(1, blockProgress / 0.15), [0, 1], [0.85, 1.0])}) translateX(${glitchOffset}px)`,
                opacity: Math.min(1, blockProgress / 0.12),
                pointerEvents: 'none',
                zIndex: 20,
              }}
            >
              {isGlitchBeat || activeBlock.visual_effect === 'horizontal_scanline_rgb_glitch' ? (
                <RGBScanlineGlitchRenderer
                  frame={frame}
                  imageUrl={currCut}
                  intensity={0.85}
                  triggerGlitch={true}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <img
                  src={currCut}
                  alt="Product Hero Object"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.9))',
                  }}
                />
              )}

              {/* Metallic Light Sheen Sweep Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0.9) 50%, transparent 55%)`,
                  transform: `translateX(${sheenProgress}%)`,
                  mixBlendMode: 'overlay',
                  pointerEvents: 'none',
                }}
              />
            </div>
          )}

          {/* Apple Style Overlay Typography & Price Badge */}
          {(headline || subCaption) && (
            <div
              style={{
                position: 'absolute',
                bottom: '120px',
                left: '30px',
                right: '30px',
                zIndex: 40,
                pointerEvents: 'none',
              }}
            >
              {headline && (
                <div
                  style={{
                    fontSize: '38px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    textShadow: '0 4px 20px rgba(0,0,0,0.95), 0 0 25px rgba(0,0,0,0.85)',
                    lineHeight: 1.15,
                  }}
                >
                  {headline}
                </div>
              )}
              {subCaption && (
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#FFE600',
                    letterSpacing: '1px',
                    marginTop: '8px',
                    textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                  }}
                >
                  {subCaption}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. OUTRO BIG REVEAL & CTA BLOCK (Kết bài Outro CTA - Ảnh 2 Typography)
          ───────────────────────────────────────────────────────────── */}
      {activeBlock.block_type === 'outro_cta_card' && (
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* Framed Poster Match with Smooth Zoom */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${currImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${interpolate(blockProgress, [0, 1], [1.06, 1.01])})`,
              filter: 'contrast(1.1) brightness(1.0)',
            }}
          />

          {/* Glassmorphic Gradient Darkening Layer for Text Readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)',
              zIndex: 30,
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '20px',
              right: '20px',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Outro Strobe Dual Typography (Ảnh 2) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `scale(${strobeScale})`,
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  fontSize: '56px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  lineHeight: 0.95,
                  textShadow: '0 8px 25px rgba(0,0,0,0.95)',
                }}
              >
                {solidWord || 'TRÀ'}
              </div>
              <div
                style={{
                  fontSize: '50px',
                  fontWeight: 900,
                  WebkitTextStroke: '2.5px #FFFFFF',
                  color: 'transparent',
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  lineHeight: 1.0,
                  marginTop: '3px',
                }}
              >
                {outlineWord || 'BEJP'}
              </div>
            </div>

            {subCaption && (
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#FFE600',
                  letterSpacing: '2px',
                  marginBottom: '14px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,230,0,0.35)',
                  padding: '3px 14px',
                  borderRadius: '16px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                }}
              >
                {subCaption}
              </div>
            )}

            {badgeText && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #FF0055, #FFE600)',
                  color: '#000000',
                  fontSize: '18px',
                  fontWeight: 900,
                  padding: '6px 22px',
                  borderRadius: '30px',
                  textTransform: 'uppercase',
                  marginBottom: '14px',
                  boxShadow: '0 8px 25px rgba(255,0,85,0.4)',
                  transform: `scale(${1 + 0.05 * Math.sin(frame * 0.5)})`,
                }}
              >
                {badgeText}
              </div>
            )}

            <div
              style={{
                background: '#FFFFFF',
                color: '#000000',
                fontSize: '18px',
                fontWeight: 900,
                padding: '10px 32px',
                borderRadius: '40px',
                textTransform: 'uppercase',
                boxShadow: '0 12px 35px rgba(0,0,0,0.8), 0 0 30px rgba(255,255,255,0.7)',
                transform: `scale(${1 + 0.04 * Math.cos(frame * 0.4)})`,
              }}
            >
              {ctaButton}
            </div>
          </div>
        </div>
      )}

      {/* Entrance Flash Burst Overlay */}
      {entranceFlash > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#FFFFFF',
            opacity: entranceFlash,
            zIndex: 55,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. ACTIVE GLSL SHADER TRANSITION OVERLAY (With Safe Fallback)
          ───────────────────────────────────────────────────────────── */}
      {isTransitioning && transConfig && nextImg && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60 }}>
          {shadersMap[transConfig.shader_name] ? (
            <GLSLTransitionCanvas
              fromImage={currImg}
              toImage={nextImg}
              progress={transProgress}
              glslSource={shadersMap[transConfig.shader_name] || ''}
              width={width}
              height={height}
            />
          ) : (
            // Safe CSS Dissolve & Flash Fallback (Never white screen)
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${nextImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: transProgress,
                filter: `brightness(${1 + Math.sin(transProgress * Math.PI) * 0.4})`,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
