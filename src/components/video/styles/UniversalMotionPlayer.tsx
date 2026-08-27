'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from '../RemotionEngine';
import { GLSLTransitionCanvas } from './transitions/GLSLTransitionCanvas';

export interface TimelineBlock {
  block_id: string;
  block_type: 'kinetic_text_card' | 'product_hero_showcase' | 'strobe_flip_card' | 'outro_cta_card';
  start_time: number;
  end_time: number;
  image_index?: number;
  motion_in?: string;
  underlayer_effect?: string;
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
  timeline_blocks: TimelineBlock[];
}

export interface UniversalMotionPlayerProps {
  timeline: UniversalTimelineData;
  productImages?: string[];
  productCutouts?: string[];
  shadersMap?: Record<string, string>; // shader_name -> GLSL code string
}

export const UniversalMotionPlayer: React.FC<UniversalMotionPlayerProps> = ({
  timeline,
  productImages = [],
  productCutouts = [],
  shadersMap = {},
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const currentTime = frame / fps;
  const blocks = timeline?.timeline_blocks || [];

  // Find active block based on currentTime
  const activeBlockIndex = useMemo(() => {
    return blocks.findIndex((b) => currentTime >= b.start_time && currentTime < b.end_time);
  }, [blocks, currentTime]);

  const activeBlock = blocks[activeBlockIndex >= 0 ? activeBlockIndex : blocks.length - 1];
  const nextBlock = activeBlockIndex >= 0 && activeBlockIndex + 1 < blocks.length ? blocks[activeBlockIndex + 1] : null;

  if (!activeBlock) {
    return <div style={{ width: '100%', height: '100%', background: '#000' }} />;
  }

  const blockDuration = Math.max(0.01, activeBlock.end_time - activeBlock.start_time);
  const blockProgress = Math.min(1, Math.max(0, (currentTime - activeBlock.start_time) / blockDuration));

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
  const nextImg = nextBlock ? getImg(nextBlock.image_index) : '';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#000000',
        fontFamily: "'Montserrat', 'Impact', 'Arial Black', -apple-system, sans-serif",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. KINETIC TEXT CARD BLOCK
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
            padding: '0 40px',
            textAlign: 'center',
          }}
        >
          {activeBlock.params?.words?.map((word: string, i: number) => {
            const wordsList = activeBlock.params?.words || [];
            const wordProgress = Math.min(1, Math.max(0, (blockProgress * wordsList.length) - i));
            if (wordProgress <= 0) return null;
            return (
              <div
                key={i}
                style={{
                  fontSize: i === 0 ? '90px' : '50px',
                  fontWeight: 900,
                  color: i === 0 ? '#FFFFFF' : '#FF0055',
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  textShadow: '0 0 30px rgba(255,255,255,0.7)',
                  transform: `scale(${1 + 0.05 * Math.sin(frame * 0.4)})`,
                  marginTop: i > 0 ? '16px' : 0,
                }}
              >
                {word}
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. STROBE FLIP CARD BLOCK (Trắng / Đen nghịch màu)
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
                padding: '0 40px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '70px',
                  fontWeight: 900,
                  color: isWhitePhase ? '#000000' : '#FFFFFF',
                  letterSpacing: '5px',
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                  transform: `scale(${1 + 0.06 * Math.sin(frame * 0.6)})`,
                }}
              >
                {activeBlock.params?.text || 'EXCLUSIVE'}
              </div>
            </div>
          );
        })()
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. PRODUCT HERO SHOWCASE BLOCK
          ───────────────────────────────────────────────────────────── */}
      {activeBlock.block_type === 'product_hero_showcase' && (
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* Background Layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${currImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${interpolate(blockProgress, [0, 1], [1.0, 1.06])})`,
              filter: activeBlock.underlayer_effect === 'grayscale_dim' ? 'grayscale(60%) brightness(0.65) contrast(1.1)' : 'contrast(1.08) brightness(1.0)',
            }}
          />

          {/* Hero Cutout Push Layer */}
          {currCut && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform:
                  activeBlock.motion_in === 'slide_from_right_lock_1to1'
                    ? `translateX(${interpolate(Math.min(1, blockProgress / 0.2), [0, 1], [650, 0])}px)`
                    : activeBlock.motion_in === 'slide_from_bottom_over_underlayer'
                    ? `translateY(${interpolate(Math.min(1, blockProgress / 0.2), [0, 1], [450, 0])}px)`
                    : 'none',
                opacity: Math.min(1, blockProgress / 0.15),
                pointerEvents: 'none',
                zIndex: 20,
              }}
            >
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
            </div>
          )}

          {/* Apple Style Overlay Typography */}
          {activeBlock.typography?.headline && (
            <div
              style={{
                position: 'absolute',
                bottom: '140px',
                left: '40px',
                right: '40px',
                zIndex: 40,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  fontSize: '44px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  textShadow: '0 4px 20px rgba(0,0,0,0.95), 0 0 25px rgba(0,0,0,0.8)',
                  lineHeight: 1.1,
                }}
              >
                {activeBlock.typography.headline}
              </div>
              {activeBlock.typography.sub_caption && (
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#FFE600',
                    letterSpacing: '1px',
                    marginTop: '8px',
                    textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                  }}
                >
                  {activeBlock.typography.sub_caption}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. OUTRO BIG REVEAL & CTA BLOCK
          ───────────────────────────────────────────────────────────── */}
      {activeBlock.block_type === 'outro_cta_card' && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${currImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${interpolate(blockProgress, [0, 1], [1.05, 1.02])})`,
              filter: 'contrast(1.08) brightness(1.0)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '120px',
              left: '40px',
              right: '40px',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '46px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textShadow: '0 4px 20px rgba(0,0,0,0.95)',
                marginBottom: '16px',
              }}
            >
              {activeBlock.params?.headline || 'SPECIAL OFFER'}
            </div>
            {activeBlock.params?.badge && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #FF0055, #FFE600)',
                  color: '#000000',
                  fontSize: '30px',
                  fontWeight: 900,
                  padding: '10px 32px',
                  borderRadius: '40px',
                  textTransform: 'uppercase',
                  marginBottom: '18px',
                }}
              >
                {activeBlock.params.badge}
              </div>
            )}
            <div
              style={{
                background: '#FFFFFF',
                color: '#000000',
                fontSize: '24px',
                fontWeight: 900,
                padding: '14px 44px',
                borderRadius: '50px',
                textTransform: 'uppercase',
                boxShadow: '0 12px 35px rgba(0,0,0,0.8), 0 0 30px rgba(255,255,255,0.7)',
              }}
            >
              {activeBlock.params?.cta_button || '⚡ MUA NGAY ➔'}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. ACTIVE GLSL SHADER TRANSITION OVERLAY
          ───────────────────────────────────────────────────────────── */}
      {isTransitioning && transConfig && nextImg && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60 }}>
          <GLSLTransitionCanvas
            fromImage={currImg}
            toImage={nextImg}
            progress={transProgress}
            glslSource={shadersMap[transConfig.shader_name] || ''}
            width={width}
            height={height}
          />
        </div>
      )}
    </div>
  );
};
