'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface CinematicShowcaseRendererProps {
  scene: DynamicSceneData;
}

/**
 * Typography Component: Best Menu (Matches Exact CapCut Reference)
 * - "BEST": Serif Italic Bold, Elegant High-Fashion (Playfair Display / Times New Roman)
 * - "Menu": Serif Roman Regular, Clean & Centered below BEST
 */
export const BestMenuTypography: React.FC<{
  isVertical?: boolean;
  opacity?: number;
  scale?: number;
}> = ({ isVertical = true, opacity = 1, scale = 1 }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 25,
        opacity,
        transform: `scale(${scale})`,
        pointerEvents: 'none',
        fontFamily: '"Playfair Display", "Times New Roman", Georgia, serif',
      }}
    >
      <div
        style={{
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: isVertical ? '84px' : '110px',
          color: '#FFFFFF',
          letterSpacing: '2px',
          lineHeight: 0.9,
          textShadow: '0 4px 20px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)',
        }}
      >
        BEST
      </div>
      <div
        style={{
          fontWeight: 400,
          fontSize: isVertical ? '42px' : '54px',
          color: '#FFFFFF',
          letterSpacing: '1px',
          marginTop: '2px',
          textShadow: '0 4px 15px rgba(0,0,0,0.9)',
        }}
      >
        Menu
      </div>
    </div>
  );
};

/**
 * Typography Component: ORDER Now (Matches Exact CapCut Reference Images 1 & 2)
 * - "ORDER": Bold Uppercase Sans-Serif White
 * - "Now": Serif Italic Regular White, Centered below ORDER
 */
export const OrderNowTypography: React.FC<{
  isVertical?: boolean;
  scale?: number;
  opacity?: number;
}> = ({ isVertical = true, scale = 1, opacity = 1 }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 30,
        opacity,
        transform: `scale(${scale})`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: '"Anton", "Impact", "Montserrat", sans-serif',
          fontWeight: 900,
          fontSize: isVertical ? '64px' : '82px',
          color: '#FFFFFF',
          letterSpacing: '4px',
          lineHeight: 0.95,
          textShadow: '0 0 25px rgba(255,255,255,0.9), 0 4px 20px rgba(0,0,0,0.8)',
        }}
      >
        ORDER
      </div>
      <div
        style={{
          fontFamily: '"Playfair Display", "Times New Roman", Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: isVertical ? '38px' : '48px',
          color: '#FFFFFF',
          letterSpacing: '2px',
          marginTop: '2px',
          textShadow: '0 0 20px rgba(255,255,255,0.8), 0 4px 15px rgba(0,0,0,0.8)',
        }}
      >
        Now
      </div>
    </div>
  );
};

/**
 * Paper Tear SVG Mask Component (Scene 3B)
 */
export const PaperTearRealistic: React.FC<{
  tearProgress: number; // 0 (closed) to 1 (fully opened)
  topImage: string;
  underneathImage: string;
  width: number;
  height: number;
}> = ({ tearProgress, topImage, underneathImage, width, height }) => {
  const shiftX = tearProgress * (width * 0.55);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${underneathImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%) contrast(1.8) brightness(0.85)',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.85) 1.2px, transparent 1.2px)',
            backgroundSize: '4px 4px',
            pointerEvents: 'none',
            mixBlendMode: 'multiply',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: `${width * 0.52}px`,
          transform: `translateX(-${shiftX}px)`,
          overflow: 'hidden',
          zIndex: 10,
          filter: 'drop-shadow(8px 0px 18px rgba(0,0,0,0.9))',
        }}
      >
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroundImage: `url(${topImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: 'polygon(0% 0%, 100% 0%, 94% 8%, 98% 18%, 92% 28%, 99% 38%, 91% 48%, 98% 58%, 93% 68%, 100% 78%, 92% 88%, 97% 96%, 100% 100%, 0% 100%)',
          }}
        />
        <svg
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
          style={{ position: 'absolute', right: '-2px', top: 0, bottom: 0, width: '18px', height: '100%', pointerEvents: 'none' }}
        >
          <path d="M 20 0 Q 80 80 30 180 T 70 380 T 20 580 T 80 780 T 30 960 L 100 1000 L 0 1000 L 0 0 Z" fill="#FFFFFF" filter="drop-shadow(0 0 4px #FFF)" />
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: `${width * 0.52}px`,
          transform: `translateX(${shiftX}px)`,
          overflow: 'hidden',
          zIndex: 10,
          filter: 'drop-shadow(-8px 0px 18px rgba(0,0,0,0.9))',
        }}
      >
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
            marginLeft: `-${width * 0.48}px`,
            backgroundImage: `url(${topImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 8% 96%, 3% 88%, 9% 78%, 2% 68%, 8% 58%, 1% 48%, 9% 38%, 2% 28%, 7% 18%, 1% 8%)',
          }}
        />
        <svg
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
          style={{ position: 'absolute', left: '-2px', top: 0, bottom: 0, width: '18px', height: '100%', pointerEvents: 'none' }}
        >
          <path d="M 80 0 Q 20 80 70 180 T 30 380 T 80 580 T 20 780 T 70 960 L 0 1000 L 100 1000 L 100 0 Z" fill="#FFFFFF" filter="drop-shadow(0 0 4px #FFF)" />
        </svg>
      </div>
    </div>
  );
};

/**
 * 3D Horizontal Split Block Cascade Component (Scene 5)
 * Slices image into 3 distinct 3D extruded blocks (A: Bottom 1/3, B: Middle 1/3, C: Top 1/3)
 * Blocks fall from above the top edge (initially hidden outside screen) onto the previous background image.
 * Block A falls first to bottom position, Block B falls second to middle, Block C falls last to top.
 */
export const Split3DBlockFall: React.FC<{
  frame: number; // local frame 0 to 60 (2.0s)
  image: string; // new food image (img5)
  bgImage?: string; // previous background image (img4)
  width: number;
  height: number;
}> = ({ frame, image, bgImage, width, height }) => {
  const sliceH = height / 3;

  // Global Ken Burns zoom once assembled (frame 34 -> 60)
  const globalZoom = interpolate(frame, [34, 60], [1.0, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Light sweep shimmer from top to bottom once assembled (frame 36 -> 54)
  const shimmerY = interpolate(frame, [36, 54], [-100, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ─────────────────────────────────────────────────────────────
  // 1. KHỐI A (1/3 DƯỚI CÙNG - BOTTOM SLICE)
  // Target position: top = 66.666% (2 * sliceH)
  // Initial position: hoàn toàn trên mép đỉnh (translateY <= -(2 * sliceH + sliceH + 50) = -(height + 50))
  // Fall timing: frame 0 -> 18
  // ─────────────────────────────────────────────────────────────
  const fA = frame;
  const aProgress = interpolate(fA, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 + --t * t * t * t * t, // Quintic ease-out
  });
  const aTranslateY = interpolate(aProgress, [0, 1], [-(height + 80), 0]);
  const aRotateX = interpolate(aProgress, [0, 1], [38, 0]);
  const aRotateY = interpolate(aProgress, [0, 1], [-6, 0]);
  const aZ = interpolate(aProgress, [0, 1], [100, 0]);
  const aDepth = interpolate(aProgress, [0, 0.8, 1], [40, 30, 0]);

  // ─────────────────────────────────────────────────────────────
  // 2. KHỐI B (1/3 Ở GIỮA - MIDDLE SLICE)
  // Target position: top = 33.333% (sliceH)
  // Initial position: hoàn toàn trên mép đỉnh (translateY <= -(sliceH + sliceH + 50) = -(2 * sliceH + 50))
  // Fall timing: delay 7 frames -> frame 7 -> 25
  // ─────────────────────────────────────────────────────────────
  const fB = Math.max(0, frame - 7);
  const bProgress = interpolate(fB, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 + --t * t * t * t * t,
  });
  const bTranslateY = interpolate(bProgress, [0, 1], [-(sliceH * 2 + 80), 0]);
  const bRotateX = interpolate(bProgress, [0, 1], [38, 0]);
  const bRotateY = interpolate(bProgress, [0, 1], [8, 0]);
  const bZ = interpolate(bProgress, [0, 1], [120, 0]);
  const bDepth = interpolate(bProgress, [0, 0.8, 1], [40, 30, 0]);

  // ─────────────────────────────────────────────────────────────
  // 3. KHỐI C (1/3 TRÊN CÙNG - TOP SLICE)
  // Target position: top = 0%
  // Initial position: hoàn toàn trên mép đỉnh (translateY <= -(sliceH + 50))
  // Fall timing: delay 14 frames -> frame 14 -> 32
  // ─────────────────────────────────────────────────────────────
  const fC = Math.max(0, frame - 14);
  const cProgress = interpolate(fC, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 + --t * t * t * t * t,
  });
  const cTranslateY = interpolate(cProgress, [0, 1], [-(sliceH + 80), 0]);
  const cRotateX = interpolate(cProgress, [0, 1], [38, 0]);
  const cRotateY = interpolate(cProgress, [0, 1], [-5, 0]);
  const cZ = interpolate(cProgress, [0, 1], [140, 0]);
  const cDepth = interpolate(cProgress, [0, 0.8, 1], [40, 30, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
        backgroundColor: '#050505',
      }}
    >
      {/* ── 0. BACKGROUND: ẢNH CŨ TRƯỚC ĐÓ (Img 4) ── */}
      {bgImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.75) contrast(1.1)',
            transform: 'scale(1.03)',
          }}
        />
      )}

      {/* ── 3D CONTAINER ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: `scale(${globalZoom})`,
        }}
      >
        {/* ── KHỐI A: 1/3 DƯỚI CÙNG (BOTTOM SLICE) ── */}
        <div
          style={{
            position: 'absolute',
            top: '66.666%',
            left: 0,
            width: '100%',
            height: '33.334%',
            transformStyle: 'preserve-3d',
            transform: `translateY(${aTranslateY}px) translateZ(${aZ}px) rotateX(${aRotateX}deg) rotateY(${aRotateY}deg)`,
            zIndex: 10,
          }}
        >
          {/* Cạnh Trên (Top Face): Mặt Vát Đen Đá 3D */}
          {aDepth > 1 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: `${aDepth}px`,
                transformOrigin: 'top center',
                transform: 'rotateX(90deg)',
                background: 'linear-gradient(to bottom, #3E4046, #1C1D21 65%, #08080A)',
                borderTop: '1.5px solid rgba(255,255,255,0.6)',
                boxShadow: '0 -10px 25px rgba(0,0,0,0.9)',
              }}
            />
          )}

          {/* Mặt Trước (Front Face): Hình A (1/3 dưới ảnh mới) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              boxShadow: aZ > 5 ? '0 30px 60px rgba(0,0,0,0.95)' : 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: `-${(height * 2) / 3}px`,
                left: 0,
                width: `${width}px`,
                height: `${height}px`,
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Viền sáng mép trên */}
            {aDepth > 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0.95), rgba(255,255,255,0.2))',
                  boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                }}
              />
            )}
          </div>
        </div>

        {/* ── KHỐI B: 1/3 Ở GIỮA (MIDDLE SLICE) ── */}
        <div
          style={{
            position: 'absolute',
            top: '33.333%',
            left: 0,
            width: '100%',
            height: '33.334%',
            transformStyle: 'preserve-3d',
            transform: `translateY(${bTranslateY}px) translateZ(${bZ}px) rotateX(${bRotateX}deg) rotateY(${bRotateY}deg)`,
            zIndex: 11,
          }}
        >
          {/* Cạnh Trên (Top Face): Mặt Vát Đen Đá 3D */}
          {bDepth > 1 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: `${bDepth}px`,
                transformOrigin: 'top center',
                transform: 'rotateX(90deg)',
                background: 'linear-gradient(to bottom, #3E4046, #1C1D21 65%, #08080A)',
                borderTop: '1.5px solid rgba(255,255,255,0.6)',
                boxShadow: '0 -10px 25px rgba(0,0,0,0.9)',
              }}
            />
          )}

          {/* Mặt Trước (Front Face): Hình B (1/3 giữa ảnh mới) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              boxShadow: bZ > 5 ? '0 30px 60px rgba(0,0,0,0.95)' : 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: `-${height / 3}px`,
                left: 0,
                width: `${width}px`,
                height: `${height}px`,
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Viền sáng mép trên */}
            {bDepth > 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0.95), rgba(255,255,255,0.2))',
                  boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                }}
              />
            )}
          </div>
        </div>

        {/* ── KHỐI C: 1/3 TRÊN CÙNG (TOP SLICE) ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '33.334%',
            transformStyle: 'preserve-3d',
            transform: `translateY(${cTranslateY}px) translateZ(${cZ}px) rotateX(${cRotateX}deg) rotateY(${cRotateY}deg)`,
            zIndex: 12,
          }}
        >
          {/* Cạnh Trên (Top Face): Mặt Vát Đen Đá 3D */}
          {cDepth > 1 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: `${cDepth}px`,
                transformOrigin: 'top center',
                transform: 'rotateX(90deg)',
                background: 'linear-gradient(to bottom, #3E4046, #1C1D21 65%, #08080A)',
                borderTop: '1.5px solid rgba(255,255,255,0.6)',
                boxShadow: '0 -10px 25px rgba(0,0,0,0.9)',
              }}
            />
          )}

          {/* Mặt Trước (Front Face): Hình C (1/3 trên ảnh mới) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              boxShadow: cZ > 5 ? '0 30px 60px rgba(0,0,0,0.95)' : 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${width}px`,
                height: `${height}px`,
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Viền sáng mép trên */}
            {cDepth > 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0.95), rgba(255,255,255,0.2))',
                  boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                }}
              />
            )}
          </div>
        </div>

        {/* ── SHIMMER SWEEP ACROSS ASSEMBLED IMAGE ── */}
        {frame >= 36 && frame <= 56 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 20,
              background: `linear-gradient(to bottom, transparent ${shimmerY - 20}%, rgba(255,255,255,0.35) ${shimmerY}%, transparent ${shimmerY + 20}%)`,
            }}
          />
        )}
      </div>
    </div>
  );
};

/**
 * CinematicShowcaseRenderer (Template 2) — 22.0s Full F&B Menu Showcase Reel
 */
export const CinematicShowcaseRenderer: React.FC<CinematicShowcaseRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Extract gallery images 1 to 8
  const mainImage = scene.original_image_url || scene.image_url || '';
  const rawGallery: string[] = (scene as any).gallery_images || [];
  const gallery: string[] = useMemo(() => {
    const list = [...rawGallery];
    if (list.length === 0 && mainImage) list.push(mainImage);
    while (list.length < 8 && list.length > 0) {
      list.push(list[list.length % rawGallery.length || 0]);
    }
    return list.length >= 8 ? list : Array.from({ length: 8 }).map(() => mainImage);
  }, [rawGallery, mainImage]);

  const [img1, img2, img3, img4, img5, img6, img7, img8] = gallery;

  // Frame Boundaries (30fps)
  const f0 = 0;
  const f1 = Math.round(1.0 * fps);   // 30
  const f2 = Math.round(2.0 * fps);   // 60
  const f3A = Math.round(3.0 * fps);  // 90
  const f3B = Math.round(5.0 * fps);  // 150
  const f4 = Math.round(7.0 * fps);   // 210
  const f5 = Math.round(8.0 * fps);   // 240
  const f5End = Math.round(10.0 * fps); // 300
  const f6 = Math.round(12.5 * fps);  // 375
  const f7A = Math.round(15.0 * fps); // 450
  const f7B = Math.round(16.5 * fps); // 495
  const f8A = Math.round(19.0 * fps); // 570
  const f8B = Math.round(20.5 * fps); // 615

  // Steam / Mist Particles
  const steamParticles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: 15 + (i * 7) % 70,
      yStart: 85 + (i * 4) % 15,
      size: 5 + (i % 4) * 3,
      speed: 0.04 + (i % 3) * 0.02,
    }));
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#07070A',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. SCENE 1 (0.0s – 1.0s): Blur Background + Purple Lens Flare
          ───────────────────────────────────────────────────────────── */}
      {frame >= f0 && frame < f1 && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {img1 && (
            <div
              style={{
                position: 'absolute',
                inset: -20,
                backgroundImage: `url(${img1})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(24px) brightness(0.6)',
                transform: 'scale(1.1)',
              }}
            />
          )}

          {(() => {
            const flareSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
            const flareScale = interpolate(flareSpring, [0, 1], [0.2, 2.2]);
            return (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div
                  style={{
                    width: isVertical ? '400px' : '700px',
                    height: isVertical ? '400px' : '700px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 1) 0%, rgba(139, 92, 246, 0.7) 35%, rgba(99, 102, 241, 0.3) 65%, transparent 80%)',
                    transform: `scale(${flareScale})`,
                    filter: 'blur(30px)',
                  }}
                />
              </div>
            );
          })()}

          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
            <h1
              style={{
                fontFamily: '"Playfair Display", "Times New Roman", Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 900,
                fontSize: isVertical ? '88px' : '120px',
                color: '#FFFFFF',
                textShadow: '0 0 40px rgba(168, 85, 247, 0.9), 0 10px 30px rgba(0,0,0,0.9)',
                transform: `scale(${interpolate(frame, [0, 20], [0.85, 1.0], { extrapolateRight: 'clamp' })})`,
              }}
            >
              BEST
            </h1>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SCENE 2 (1.0s – 2.0s): Ảnh 1 Zoom Drift + BEST Menu
          ───────────────────────────────────────────────────────────── */}
      {frame >= f1 && frame < f2 && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {img1 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${img1})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `scale(${interpolate(frame - f1, [0, 30], [1.0, 1.05], { extrapolateRight: 'clamp' })})`,
              }}
            />
          )}

          {steamParticles.map((p) => {
            const steamY = p.yStart - (((frame - f1) * p.speed * 4) % 90);
            return (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${steamY}%`,
                  width: p.size * 3.5,
                  height: p.size * 3.5,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.35)',
                  filter: 'blur(10px)',
                  pointerEvents: 'none',
                  zIndex: 15,
                }}
              />
            );
          })}

          <BestMenuTypography isVertical={isVertical} />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. SCENE 3A (2.0s – 3.0s): Ảnh 2 Grayscale + Dải chéo màu
          ───────────────────────────────────────────────────────────── */}
      {frame >= f2 && frame < f3A && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${img2 || img1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'grayscale(100%) brightness(0.85)',
            }}
          />

          {(() => {
            const wipeProgress = interpolate(frame - f2, [0, 30], [-100, 100], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${img2 || img1})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  clipPath: `polygon(${wipeProgress - 35}% 0%, ${wipeProgress + 35}% 0%, ${wipeProgress + 15}% 100%, ${wipeProgress - 55}% 100%)`,
                  filter: 'contrast(1.1) brightness(1.02)',
                  boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                }}
              />
            );
          })()}

          <BestMenuTypography isVertical={isVertical} />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. SCENE 3B (3.0s – 5.0s): Ảnh 3 + Rạch giấy xé đôi lộ Ảnh 4 Halftone Xám
          ───────────────────────────────────────────────────────────── */}
      {frame >= f3A && frame < f3B && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {(() => {
            const s3bFrame = frame - f3A;
            const tearProgress = interpolate(s3bFrame, [35, 60], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <>
                <PaperTearRealistic
                  tearProgress={tearProgress}
                  topImage={img3 || img1}
                  underneathImage={img4 || img1}
                  width={width}
                  height={height}
                />
                <BestMenuTypography
                  isVertical={isVertical}
                  opacity={Math.max(0, 1 - tearProgress * 1.5)}
                />
              </>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. SCENE 4 (5.0s – 8.0s): Ảnh 4 Từ Halftone Xám -> Full Màu Điện Ảnh
          ───────────────────────────────────────────────────────────── */}
      {frame >= f3B && frame < f5 && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {(() => {
            const s4Frame = frame - f3B;
            const grayPercent = interpolate(s4Frame, [0, 45], [100, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${img4 || img1})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: `grayscale(${grayPercent}%) contrast(${1.4 - (grayPercent / 100) * 0.3})`,
                  transform: `scale(${interpolate(s4Frame, [0, 90], [1.0, 1.06])})`,
                }}
              />
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. SCENE 5 (8.0s – 10.0s): 3 Khối Hộp 3D Rơi So Le Ghép Thành Ảnh 5 (3D Split Block Cascade)
          ───────────────────────────────────────────────────────────── */}
      {frame >= f5 && frame < f5End && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <Split3DBlockFall
            frame={frame - f5}
            image={img5 || img1}
            bgImage={img4 || img1}
            width={width}
            height={height}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. SCENE 6 (10.0s – 12.5s): 3 Dải Dọc Ảnh 6 Bay Vào + 3D Door Flip
          ───────────────────────────────────────────────────────────── */}
      {frame >= f5End && frame < f6 && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {(() => {
            const s6Frame = frame - f5End;
            const isClosingDoor = s6Frame >= 60;
            const doorRotateY = isClosingDoor
              ? interpolate(s6Frame - 60, [0, 15], [0, -90], { extrapolateRight: 'clamp' })
              : 0;

            const col1Y = interpolate(s6Frame, [0, 14], [-height, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const col2Y = interpolate(Math.max(0, s6Frame - 4), [0, 14], [height, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const col3Y = interpolate(Math.max(0, s6Frame - 8), [0, 14], [-height, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

            return (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  transform: `rotateY(${doorRotateY}deg)`,
                  transformOrigin: 'left center',
                }}
              >
                <div style={{ width: '33.333%', height: '100%', overflow: 'hidden', transform: `translateY(${col1Y}px)` }}>
                  <div style={{ width: `${width}px`, height: '100%', backgroundImage: `url(${img6 || img1})`, backgroundSize: 'cover', backgroundPosition: 'left center' }} />
                </div>
                <div style={{ width: '33.333%', height: '100%', overflow: 'hidden', transform: `translateY(${col2Y}px)` }}>
                  <div style={{ width: `${width}px`, height: '100%', marginLeft: `-${width / 3}px`, backgroundImage: `url(${img6 || img1})`, backgroundSize: 'cover', backgroundPosition: 'center center' }} />
                </div>
                <div style={{ width: '33.334%', height: '100%', overflow: 'hidden', transform: `translateY(${col3Y}px)` }}>
                  <div style={{ width: `${width}px`, height: '100%', marginLeft: `-${(width * 2) / 3}px`, backgroundImage: `url(${img6 || img1})`, backgroundSize: 'cover', backgroundPosition: 'right center' }} />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. SCENE 7A (12.5s – 15.0s): Ảnh 7 Accordion Roll-Down
          ───────────────────────────────────────────────────────────── */}
      {frame >= f6 && frame < f7A && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', perspective: '1400px' }}>
          {(() => {
            const s7AFrame = frame - f6;
            const foldSpring = spring({ frame: s7AFrame, fps, config: { damping: 14, stiffness: 100 } });
            const foldRotateX = interpolate(foldSpring, [0, 1], [-85, 0]);

            return (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${img7 || img1})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: `rotateX(${foldRotateX}deg)`,
                  transformOrigin: 'top center',
                }}
              />
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          9. SCENE 7B (15.0s – 16.5s): Ảnh 7 Thu Nhỏ Đẩy Sang Phải Thành Card Giữa Trong 3 Ảnh Màu + Bên Trái Mờ Đen
          ───────────────────────────────────────────────────────────── */}
      {frame >= f7A && frame < f7B && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#05070B' }}>
          {(() => {
            const s7BFrame = frame - f7A;
            const stackShiftY = interpolate(s7BFrame, [32, 45], [0, -60], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
                <div style={{ width: '58%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${img7 || img1})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'left center',
                      filter: 'blur(2px) brightness(0.35)',
                    }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.95) 100%)' }} />
                </div>

                <div
                  style={{
                    width: '42%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '14px',
                    padding: '12px 14px',
                    transform: `translateY(${stackShiftY}px)`,
                  }}
                >
                  <div style={{ flex: 1, position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundImage: `url(${img6 || img1})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(14, 165, 233, 0.4)', mixBlendMode: 'multiply' }} />
                  </div>
                  <div style={{ flex: 1.15, position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundImage: `url(${img8 || img7 || img1})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 12px 35px rgba(0,0,0,0.95)', border: '2px solid rgba(255,255,255,0.25)' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(236, 72, 153, 0.35)', mixBlendMode: 'multiply' }} />
                  </div>
                  <div style={{ flex: 1, position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundImage: `url(${img5 || img1})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(234, 179, 8, 0.4)', mixBlendMode: 'multiply' }} />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          10. SCENE 8A (16.5s – 19.0s): Card Giữa Lật Flip Phóng Lớn + Lớp Phủ Cam Vàng Quét Từ Dưới Lên Toàn Màn Hình
          (Matches Exact Reference Images 1 & 2)
          ───────────────────────────────────────────────────────────── */}
      {frame >= f7B && frame < f8A && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', perspective: '1200px', backgroundColor: '#05070B' }}>
          {(() => {
            const s8AFrame = frame - f7B; // 0 to 75 frames (16.5s -> 19.0s)

            // Zoom-in & Move from Right Card position to Fullscreen Center
            const expandSpring = spring({ frame: s8AFrame, fps, config: { damping: 14, stiffness: 100 } });
            const cardX = interpolate(expandSpring, [0, 1], [30, 0]);
            const cardScale = interpolate(expandSpring, [0, 1], [0.38, 1.0]);
            const flipRotateY = interpolate(expandSpring, [0, 0.5, 1], [35, 180, 0]);

            // Orange/Amber Flood from Bottom to Top (giây 18.0s -> 19.0s / s8AFrame 40 -> 75)
            const floodProgress = interpolate(s8AFrame, [40, 75], [100, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${img8 || img1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: `translateX(${cardX}%) scale(${cardScale}) rotateY(${flipRotateY}deg)`,
                    boxShadow: cardScale < 0.95 ? '0 30px 80px rgba(0,0,0,0.95)' : 'none',
                    borderRadius: cardScale < 0.95 ? '12px' : '0px',
                    filter: 'brightness(1.02) contrast(1.05)',
                  }}
                />

                {/* Orange/Amber Warm Light Flooding from Bottom to Top */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transform: `translateY(${floodProgress}%)`,
                    background: 'linear-gradient(to top, #E65100 0%, #FF8F00 50%, #FFA000 80%, rgba(255, 179, 0, 0.4) 100%)',
                    mixBlendMode: 'color',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transform: `translateY(${floodProgress}%)`,
                    background: 'radial-gradient(ellipse at bottom center, rgba(255, 111, 0, 0.7) 0%, rgba(255, 179, 0, 0.4) 50%, transparent 90%)',
                    mixBlendMode: 'screen',
                    pointerEvents: 'none',
                  }}
                />
              </>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          11. SCENE 8B (19.0s – 20.5s): Phủ Cam Vàng Đầy Màn Hình + ORDER Now Typography
          (Matches Exact Reference Image 2)
          ───────────────────────────────────────────────────────────── */}
      {frame >= f8A && frame < f8B && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${img8 || img1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'contrast(1.15) brightness(0.95)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #E65100 0%, #FF8F00 45%, #FFA000 85%, #FFB300 100%)',
              mixBlendMode: 'color',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(255, 235, 59, 0.3) 0%, rgba(255, 111, 0, 0.5) 70%, rgba(191, 54, 12, 0.7) 100%)',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />

          {(() => {
            const s8BFrame = frame - f8A;
            const springPop = spring({ frame: s8BFrame, fps, config: { damping: 12, stiffness: 120 } });
            return (
              <OrderNowTypography
                isVertical={isVertical}
                scale={springPop}
                opacity={Math.min(1, s8BFrame / 10)}
              />
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          12. SCENE 8C (20.5s – 22.0s): Tấm Ảnh Mờ Xước Cũ Trong Quyển Tập (Trang Vàng) + Quyển Sách Đóng Lại
          (Matches Exact Reference Images 3, 4, 5)
          ───────────────────────────────────────────────────────────── */}
      {frame >= f8B && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            backgroundColor: '#14110C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1400px',
          }}
        >
          {(() => {
            const s8CFrame = frame - f8B; // 0 to 45 frames (20.5s -> 22.0s)
            const cameraScale = interpolate(s8CFrame, [0, 40], [0.92, 0.62], { extrapolateRight: 'clamp' });
            const foldCloseAngle = interpolate(s8CFrame, [12, 38], [0, -180], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const fadeOut = interpolate(s8CFrame, [36, 45], [1.0, 0.0], { extrapolateRight: 'clamp' });

            const bookW = isVertical ? 420 : 640;
            const bookH = isVertical ? 600 : 460;
            const pageW = bookW / 2;

            return (
              <div
                style={{
                  transform: `scale(${cameraScale}) rotateX(10deg) rotateY(-6deg)`,
                  transformStyle: 'preserve-3d',
                  opacity: fadeOut,
                }}
              >
                {/* 3D BOOK MOCKUP */}
                <div
                  style={{
                    position: 'relative',
                    width: `${bookW}px`,
                    height: `${bookH}px`,
                    transformStyle: 'preserve-3d',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.95), 0 10px 30px rgba(0,0,0,0.8)',
                  }}
                >
                  {/* Trang Phải (Right Page - Màu Vàng Cổ Điển Matches Image 3 & 4) */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: `${pageW}px`,
                      height: `${bookH}px`,
                      backgroundColor: '#EEDC9A',
                      backgroundImage: 'radial-gradient(circle at 50% 40%, #F5E8B7 0%, #E6D28C 80%, #D4BE74 100%)',
                      borderTopRightRadius: '6px',
                      borderBottomRightRadius: '6px',
                      boxShadow: 'inset 25px 0 35px rgba(0,0,0,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '24px 16px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Tấm Ảnh Mờ Xước Cũ Dạng Vệt Cọ / Brush Cutout (Matches Image 3) */}
                    <div
                      style={{
                        position: 'relative',
                        width: '85%',
                        height: '52%',
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          inset: -10,
                          backgroundColor: '#1E160E',
                          clipPath: 'polygon(15% 0%, 85% 5%, 98% 25%, 92% 70%, 75% 98%, 25% 92%, 5% 75%, 2% 20%)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.6)',
                        }}
                      />

                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: `url(${img8 || img1})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          clipPath: 'polygon(18% 2%, 82% 6%, 95% 26%, 88% 68%, 72% 96%, 28% 90%, 8% 72%, 4% 22%)',
                          filter: 'sepia(0.35) contrast(1.15) brightness(0.95)',
                        }}
                      />
                    </div>

                    <div style={{ marginTop: '16px', textAlign: 'center', width: '90%' }}>
                      <div style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: '13px', color: '#4A3B22', fontWeight: 600 }}>
                        Special Selection
                      </div>
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', opacity: 0.45 }}>
                        <div style={{ width: '85%', height: '3px', backgroundColor: '#5C4828', borderRadius: '2px' }} />
                        <div style={{ width: '92%', height: '3px', backgroundColor: '#5C4828', borderRadius: '2px' }} />
                        <div style={{ width: '70%', height: '3px', backgroundColor: '#5C4828', borderRadius: '2px' }} />
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: `${pageW}px`,
                      height: `${bookH}px`,
                      backgroundColor: '#EEDC9A',
                      borderTopLeftRadius: '6px',
                      borderBottomLeftRadius: '6px',
                      boxShadow: 'inset -25px 0 35px rgba(0,0,0,0.3)',
                    }}
                  />

                  {/* Bìa Sách Bên Trái Gập Đóng Lại (Matches Images 4 & 5) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: `${pageW}px`,
                      height: `${bookH}px`,
                      transformOrigin: 'right center',
                      transform: `rotateY(${foldCloseAngle}deg)`,
                      transformStyle: 'preserve-3d',
                      zIndex: 30,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: '#16110A',
                        backgroundImage: 'radial-gradient(circle at 50% 50%, #2A2117 0%, #120D08 100%)',
                        border: '3px solid rgba(238, 220, 154, 0.2)',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
                      }}
                    >
                      <div style={{ border: '2px solid #EEDC9A', padding: '16px 24px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#EEDC9A', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 800 }}>
                          SPECIAL MENU
                        </span>
                        <h2 style={{ fontSize: '26px', color: '#FFFFFF', fontWeight: 900, letterSpacing: '3px', marginTop: '6px', textTransform: 'uppercase', fontFamily: '"Playfair Display", serif', fontStyle: 'italic' }}>
                          BEST
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      left: `${pageW - 6}px`,
                      top: 0,
                      bottom: 0,
                      width: '12px',
                      background: 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.6))',
                      zIndex: 40,
                    }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
