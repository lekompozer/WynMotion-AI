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
 * Slices ONE single image into 3 distinct 3D extruded blocks (A: Bottom 1/3, B: Middle 1/3, C: Top 1/3)
 * using CSS clipPath: inset(...) so that when assembled, it forms 100% of the exact original image seamlessly.
 * Blocks fall sequentially from above the top edge onto the previous background image.
 */
export const Split3DBlockFall: React.FC<{
  frame: number; // local frame 0 to 60 (2.0s)
  image: string; // new food image (img5)
  bgImage?: string; // previous background image (img4)
  width: number;
  height: number;
}> = ({ frame, image, bgImage, width, height }) => {
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
  // Target position: translateY = 0 (clipPath shows bottom 33.3%)
  // Initial position: mép dưới của khối A (ở 100% height) phải nằm trên mép trên (Y <= 0) -> translateY = -(height + 60)
  // Fall timing: frame 0 -> 18
  // ─────────────────────────────────────────────────────────────
  const fA = frame;
  const aProgress = interpolate(fA, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 + --t * t * t * t * t, // Quintic ease-out
  });
  const aTranslateY = interpolate(aProgress, [0, 1], [-(height + 60), 0]);
  const aRotateX = interpolate(aProgress, [0, 1], [36, 0]);
  const aRotateY = interpolate(aProgress, [0, 1], [-5, 0]);
  const aZ = interpolate(aProgress, [0, 1], [90, 0]);
  const aDepth = interpolate(aProgress, [0, 0.8, 1], [40, 30, 0]);

  // ─────────────────────────────────────────────────────────────
  // 2. KHỐI B (1/3 Ở GIỮA - MIDDLE SLICE)
  // Target position: translateY = 0 (clipPath shows middle 33.3%)
  // Initial position: mép dưới của khối B (ở 66.6% height) nằm trên mép trên -> translateY = -(height * 0.67 + 60)
  // Fall timing: delay 7 frames -> frame 7 -> 25
  // ─────────────────────────────────────────────────────────────
  const fB = Math.max(0, frame - 7);
  const bProgress = interpolate(fB, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 + --t * t * t * t * t,
  });
  const bTranslateY = interpolate(bProgress, [0, 1], [-(height * 0.67 + 60), 0]);
  const bRotateX = interpolate(bProgress, [0, 1], [36, 0]);
  const bRotateY = interpolate(bProgress, [0, 1], [6, 0]);
  const bZ = interpolate(bProgress, [0, 1], [110, 0]);
  const bDepth = interpolate(bProgress, [0, 0.8, 1], [40, 30, 0]);

  // ─────────────────────────────────────────────────────────────
  // 3. KHỐI C (1/3 TRÊN CÙNG - TOP SLICE)
  // Target position: translateY = 0 (clipPath shows top 33.3%)
  // Initial position: mép dưới của khối C (ở 33.3% height) nằm trên mép trên -> translateY = -(height * 0.34 + 60)
  // Fall timing: delay 14 frames -> frame 14 -> 32
  // ─────────────────────────────────────────────────────────────
  const fC = Math.max(0, frame - 14);
  const cProgress = interpolate(fC, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 + --t * t * t * t * t,
  });
  const cTranslateY = interpolate(cProgress, [0, 1], [-(height * 0.34 + 60), 0]);
  const cRotateX = interpolate(cProgress, [0, 1], [36, 0]);
  const cRotateY = interpolate(cProgress, [0, 1], [-4, 0]);
  const cZ = interpolate(cProgress, [0, 1], [130, 0]);
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
            inset: 0,
            transformStyle: 'preserve-3d',
            transformOrigin: 'center 83.333%',
            transform: `translateY(${aTranslateY}px) translateZ(${aZ}px) rotateX(${aRotateX}deg) rotateY(${aRotateY}deg)`,
            zIndex: 10,
          }}
        >
          {/* Cạnh Trên (Top Face): Mặt Vát Đen Đá 3D tại vị trí 66.666% */}
          {aDepth > 1 && (
            <div
              style={{
                position: 'absolute',
                top: '66.666%',
                left: 0,
                right: 0,
                height: `${aDepth}px`,
                transformOrigin: 'top center',
                transform: 'rotateX(90deg)',
                background: 'linear-gradient(to bottom, #3E4046, #1C1D21 65%, #08080A)',
                borderTop: '1.5px solid rgba(255,255,255,0.7)',
                boxShadow: '0 -10px 25px rgba(0,0,0,0.9)',
                zIndex: 11,
              }}
            />
          )}

          {/* Mặt Trước (Front Face): Toàn bộ ảnh nhưng cắt đúng 1/3 dưới cùng */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              clipPath: 'inset(66.6666% 0% 0% 0%)',
              boxShadow: aZ > 5 ? '0 30px 60px rgba(0,0,0,0.95)' : 'none',
            }}
          />
        </div>

        {/* ── KHỐI B: 1/3 Ở GIỮA (MIDDLE SLICE) ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transformOrigin: 'center 50%',
            transform: `translateY(${bTranslateY}px) translateZ(${bZ}px) rotateX(${bRotateX}deg) rotateY(${bRotateY}deg)`,
            zIndex: 12,
          }}
        >
          {/* Cạnh Trên (Top Face): Mặt Vát Đen Đá 3D tại vị trí 33.333% */}
          {bDepth > 1 && (
            <div
              style={{
                position: 'absolute',
                top: '33.333%',
                left: 0,
                right: 0,
                height: `${bDepth}px`,
                transformOrigin: 'top center',
                transform: 'rotateX(90deg)',
                background: 'linear-gradient(to bottom, #3E4046, #1C1D21 65%, #08080A)',
                borderTop: '1.5px solid rgba(255,255,255,0.7)',
                boxShadow: '0 -10px 25px rgba(0,0,0,0.9)',
                zIndex: 13,
              }}
            />
          )}

          {/* Mặt Trước (Front Face): Toàn bộ ảnh nhưng cắt đúng 1/3 ở giữa */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              clipPath: 'inset(33.3333% 0% 33.3333% 0%)',
              boxShadow: bZ > 5 ? '0 30px 60px rgba(0,0,0,0.95)' : 'none',
            }}
          />
        </div>

        {/* ── KHỐI C: 1/3 TRÊN CÙNG (TOP SLICE) ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transformOrigin: 'center 16.666%',
            transform: `translateY(${cTranslateY}px) translateZ(${cZ}px) rotateX(${cRotateX}deg) rotateY(${cRotateY}deg)`,
            zIndex: 14,
          }}
        >
          {/* Cạnh Trên (Top Face): Mặt Vát Đen Đá 3D tại đỉnh 0% */}
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
                borderTop: '1.5px solid rgba(255,255,255,0.7)',
                boxShadow: '0 -10px 25px rgba(0,0,0,0.9)',
                zIndex: 15,
              }}
            />
          )}

          {/* Mặt Trước (Front Face): Toàn bộ ảnh nhưng cắt đúng 1/3 trên cùng */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              clipPath: 'inset(0% 0% 66.6666% 0%)',
              boxShadow: cZ > 5 ? '0 30px 60px rgba(0,0,0,0.95)' : 'none',
            }}
          />
        </div>

        {/* ── SHIMMER SWEEP ACROSS ASSEMBLED IMAGE ── */}
        {frame >= 36 && frame <= 56 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 25,
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
          1. SCENE 1 (0.0s – 1.0s): Chữ B E S T ở xa thu gọn + Đốm sáng tím/trắng quét từ phải qua nổ tung giữa chữ
          ───────────────────────────────────────────────────────────── */}
      {frame >= f0 && frame < f1 && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#020204' }}>
          {/* Nền ảnh 1 xuất hiện dần khi vụ nổ ánh sáng trắng bùng ra */}
          {img1 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${img1})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: interpolate(frame, [22, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                transform: `scale(${interpolate(frame, [22, 30], [1.08, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
              }}
            />
          )}

          {(() => {
            // Chữ B E S T ở xa (scale nhỏ, giãn cách chữ rộng) thu gọn lại thành chữ BEST giữa màn hình
            const textScale = interpolate(frame, [0, 22], [0.75, 1.0], { extrapolateRight: 'clamp' });
            const letterSpacing = interpolate(frame, [0, 22], [32, 6], { extrapolateRight: 'clamp' });
            const textOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' });

            // Đốm sáng trắng + Vệt tia sáng + Bokeh tím quét từ phải qua tâm (frame 0 -> 24: 115% -> 50%) rồi lướt tiếp sang trái (frame 24 -> 30)
            const flareX = interpolate(frame, [0, 24, 30], [115, 50, 30], { extrapolateRight: 'clamp' });
            const flareY = 50; // Chính giữa chiều cao chữ BEST
            const flareOpacity = interpolate(frame, [0, 4, 28, 30], [0, 1, 1, 0.8], { extrapolateRight: 'clamp' });

            // Vụ nổ ánh sáng trắng (Radial White Burst) khi đốm sáng chạm tâm chữ BEST (frame 22 -> 30)
            const burstScale = interpolate(frame, [22, 26, 30], [0.2, 3.5, 5.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const burstOpacity = interpolate(frame, [22, 25, 30], [0, 1.0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const screenFlash = interpolate(frame, [23, 25, 30], [0, 0.95, 0.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

            return (
              <>
                {/* Chữ BEST Typography ở giữa */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                >
                  <h1
                    style={{
                      fontFamily: '"Playfair Display", "Times New Roman", Georgia, serif',
                      fontStyle: 'italic',
                      fontWeight: 900,
                      fontSize: isVertical ? '88px' : '124px',
                      color: '#FFFFFF',
                      letterSpacing: `${letterSpacing}px`,
                      transform: `scale(${textScale})`,
                      opacity: textOpacity,
                      textShadow: '0 0 25px rgba(255,255,255,0.8), 0 0 60px rgba(168, 85, 247, 0.9), 0 10px 30px rgba(0,0,0,0.9)',
                      margin: 0,
                    }}
                  >
                    BEST
                  </h1>
                </div>

                {/* Đốm sáng trắng + Vệt sáng Anamorphic + Vòng tròn quang sai Bokeh tím */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${flareX}%`,
                    top: `${flareY}%`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 20,
                    opacity: flareOpacity,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Tia sáng ngang Anamorphic kéo dài */}
                  <div
                    style={{
                      position: 'absolute',
                      width: isVertical ? '480px' : '750px',
                      height: '18px',
                      background: 'linear-gradient(to right, transparent 0%, rgba(192, 132, 252, 0.5) 25%, #FFFFFF 50%, rgba(192, 132, 252, 0.5) 75%, transparent 100%)',
                      filter: 'blur(2px)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: isVertical ? '320px' : '500px',
                      height: '6px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 0 25px #FFFFFF, 0 0 50px rgba(192, 132, 252, 1)',
                    }}
                  />

                  {/* Tâm điểm sáng trắng rực rỡ */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #FFFFFF 0%, rgba(255,255,255,0.95) 30%, rgba(216, 180, 254, 0.6) 60%, transparent 80%)',
                      filter: 'blur(4px)',
                    }}
                  />

                  {/* Các vòng quang sai Bokeh tím / hồng tím (Purple Lens Bokeh Rings Matches Reference) */}
                  <div
                    style={{
                      position: 'absolute',
                      transform: 'translateX(-90px)',
                      width: '75px',
                      height: '75px',
                      borderRadius: '50%',
                      border: '2.5px solid rgba(216, 180, 254, 0.85)',
                      background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 75%)',
                      boxShadow: '0 0 25px rgba(168, 85, 247, 0.6)',
                      filter: 'blur(1px)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      transform: 'translateX(-160px)',
                      width: '110px',
                      height: '110px',
                      borderRadius: '50%',
                      border: '2px solid rgba(192, 132, 252, 0.65)',
                      background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 75%)',
                      boxShadow: '0 0 30px rgba(147, 51, 234, 0.45)',
                      filter: 'blur(1.5px)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      transform: 'translateX(-230px)',
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      border: '1.5px solid rgba(168, 85, 247, 0.45)',
                      background: 'radial-gradient(circle, rgba(126, 34, 206, 0.18) 0%, transparent 80%)',
                      boxShadow: '0 0 35px rgba(126, 34, 206, 0.3)',
                      filter: 'blur(2px)',
                    }}
                  />
                </div>

                {/* Vụ nổ quầng sáng trắng cực đại ở giữa chữ BEST (Radial White Flash Explosion) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 25,
                    opacity: burstOpacity,
                  }}
                >
                  <div
                    style={{
                      width: '320px',
                      height: '320px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #FFFFFF 0%, rgba(255,255,255,0.95) 35%, rgba(233, 213, 255, 0.7) 65%, transparent 85%)',
                      transform: `scale(${burstScale})`,
                      filter: 'blur(20px)',
                    }}
                  />
                </div>

                {/* Lớp chớp sáng trắng toàn màn hình */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: '#FFFFFF',
                    opacity: screenFlash,
                    pointerEvents: 'none',
                    zIndex: 30,
                  }}
                />
              </>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SCENE 2 (1.0s – 2.0s): Quầng Sáng Kéo Dần Sang Trái Rồi Tan Hết -> Để Lại BEST MENU Trên Ảnh 1
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

          {/* Quầng sáng trắng kéo đi tiếp sang bên trái rồi tan dần biến mất (giây 1.0s -> 1.5s / frame f1 -> f1+15) */}
          {(() => {
            const s2Frame = frame - f1;
            const flareDragX = interpolate(s2Frame, [0, 15], [30, -25], { extrapolateRight: 'clamp' });
            const flareFade = interpolate(s2Frame, [0, 15], [0.8, 0.0], { extrapolateRight: 'clamp' });

            if (flareFade <= 0.01) return null;

            return (
              <div
                style={{
                  position: 'absolute',
                  left: `${flareDragX}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: 22,
                  opacity: flareFade,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: isVertical ? '400px' : '650px',
                    height: '14px',
                    background: 'linear-gradient(to right, transparent, rgba(192, 132, 252, 0.5) 25%, #FFFFFF 50%, rgba(192, 132, 252, 0.5) 75%, transparent)',
                    filter: 'blur(3px)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #FFFFFF 0%, rgba(216, 180, 254, 0.5) 60%, transparent 80%)',
                    filter: 'blur(8px)',
                  }}
                />
              </div>
            );
          })()}

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
          3. SCENE 3A (2.0s – 3.0s): Ảnh 2 Grayscale + Dải Chéo Màu (Thu Nhỏ Lại 40%)
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
            // Thu nhỏ dải chéo màu lại 40% (từ width 70% xuống 42%: -21% đến +21% ở đỉnh, -33% đến +9% ở đáy)
            return (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${img2 || img1})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  clipPath: `polygon(${wipeProgress - 21}% 0%, ${wipeProgress + 21}% 0%, ${wipeProgress + 9}% 100%, ${wipeProgress - 33}% 100%)`,
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
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', perspective: '1200px' }}>
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
                  position: 'absolute',
                  inset: 0,
                  transform: `rotateY(${doorRotateY}deg)`,
                  transformOrigin: 'left center',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${img6 || img1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    clipPath: 'inset(0 66.666% 0 0)',
                    transform: `translateY(${col1Y}px)`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${img6 || img1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    clipPath: 'inset(0 33.333% 0 33.333%)',
                    transform: `translateY(${col2Y}px)`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${img6 || img1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    clipPath: 'inset(0 0 0 66.666%)',
                    transform: `translateY(${col3Y}px)`,
                  }}
                />
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
          9. SCENE 7B (15.0s – 16.5s): Ảnh 7 Thu Nhỏ Sang Phải + Nửa Trái Món Chính Rõ Nét + Nửa Phải Nền Trắng Sáng với 3 Card Neon
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
                <div style={{ width: '50%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${img7 || img1})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'contrast(1.08) brightness(1.02)',
                    }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 80%, rgba(0,0,0,0.4) 100%)' }} />
                </div>

                <div
                  style={{
                    width: '50%',
                    height: '100%',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '16px',
                    padding: '24px 18px',
                    transform: `translateY(${stackShiftY}px)`,
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
                    zIndex: 10,
                  }}
                >
                  <div style={{ flex: 1, position: 'relative', borderRadius: '10px', overflow: 'hidden', backgroundImage: `url(${img6 || img1})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 160, 255, 0.45)', mixBlendMode: 'multiply' }} />
                  </div>
                  <div style={{ flex: 1.15, position: 'relative', borderRadius: '10px', overflow: 'hidden', backgroundImage: `url(${img8 || img7 || img1})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 14px 35px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.8)' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(235, 30, 130, 0.45)', mixBlendMode: 'multiply' }} />
                  </div>
                  <div style={{ flex: 1, position: 'relative', borderRadius: '10px', overflow: 'hidden', backgroundImage: `url(${img5 || img1})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(245, 180, 0, 0.45)', mixBlendMode: 'multiply' }} />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          10. SCENE 8A (16.5s – 19.0s): Card Giữa Lật Flip Phóng Lớn + Hiển Thị Full Bề Ngang Menu Không Xén Chữ
          ───────────────────────────────────────────────────────────── */}
      {frame >= f7B && frame < f8A && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', perspective: '1200px', backgroundColor: '#0A0806' }}>
          {(() => {
            const s8AFrame = frame - f7B;
            const expandSpring = spring({ frame: s8AFrame, fps, config: { damping: 14, stiffness: 100 } });
            const cardX = interpolate(expandSpring, [0, 1], [30, 0]);
            const cardScale = interpolate(expandSpring, [0, 1], [0.38, 1.0]);
            const flipRotateY = interpolate(expandSpring, [0, 0.5, 1], [35, 180, 0]);
            const kenBurnsZoom = interpolate(s8AFrame, [20, 75], [1.0, 1.06], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const floodProgress = interpolate(s8AFrame, [40, 75], [100, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `translateX(${cardX}%) scale(${cardScale * kenBurnsZoom}) rotateY(${flipRotateY}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: -20,
                    backgroundImage: `url(${img8 || img1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(30px) brightness(0.35)',
                    transform: 'scale(1.1)',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${img8 || img1})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    filter: 'contrast(1.05) brightness(1.02) drop-shadow(0 20px 60px rgba(0,0,0,0.9))',
                  }}
                />

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
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          11. SCENE 8B (19.0s – 20.5s): Phủ Cam Vàng Đầy Màn Hình + ORDER Now Typography + Menu Rõ Nét
          ───────────────────────────────────────────────────────────── */}
      {frame >= f8A && frame < f8B && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#0A0806' }}>
          <div
            style={{
              position: 'absolute',
              inset: -20,
              backgroundImage: `url(${img8 || img1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(30px) brightness(0.35)',
              transform: 'scale(1.1)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${img8 || img1})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              filter: 'contrast(1.1) brightness(0.98)',
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
          12. SCENE 8C (20.5s – 22.0s): Menu Lùi Nhỏ Thành 1 Trang Trong Quyển Sách Menu Đóng Lại
          ───────────────────────────────────────────────────────────── */}
      {frame >= f8B && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            backgroundColor: '#0D0A07',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1400px',
          }}
        >
          {(() => {
            const s8CFrame = frame - f8B;
            const cameraScale = interpolate(s8CFrame, [0, 40], [0.96, 0.68], { extrapolateRight: 'clamp' });
            const foldCloseAngle = interpolate(s8CFrame, [10, 36], [0, -180], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const fadeOut = interpolate(s8CFrame, [36, 45], [1.0, 0.0], { extrapolateRight: 'clamp' });

            const bookW = isVertical ? 440 : 660;
            const bookH = isVertical ? 620 : 480;
            const pageW = bookW / 2;

            return (
              <div
                style={{
                  transform: `scale(${cameraScale}) rotateX(8deg) rotateY(-4deg)`,
                  transformStyle: 'preserve-3d',
                  opacity: fadeOut,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: `${bookW}px`,
                    height: `${bookH}px`,
                    transformStyle: 'preserve-3d',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.95), 0 10px 30px rgba(0,0,0,0.8)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: `${pageW}px`,
                      height: `${bookH}px`,
                      backgroundColor: '#F9F5EB',
                      backgroundImage: 'radial-gradient(circle at 50% 40%, #FFFDF9 0%, #F5EFE1 80%, #E8DEC8 100%)',
                      borderTopRightRadius: '6px',
                      borderBottomRightRadius: '6px',
                      boxShadow: 'inset 25px 0 35px rgba(0,0,0,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Trang Menu Hiển Thị Trọn Vẹn 100% Không Bị Xén */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${img8 || img1})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        borderRadius: '4px',
                        filter: 'contrast(1.05) brightness(1.0)',
                      }}
                    />
                  </div>

                  {/* Trang Trái Cố Định */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: `${pageW}px`,
                      height: `${bookH}px`,
                      backgroundColor: '#F9F5EB',
                      borderTopLeftRadius: '6px',
                      borderBottomLeftRadius: '6px',
                      boxShadow: 'inset -25px 0 35px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px',
                    }}
                  >
                    {/* Trang bìa lót hoặc thông tin nhà hàng */}
                    <div style={{ textAlign: 'center', opacity: 0.6 }}>
                      <div style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: '15px', color: '#3A2E1C', fontWeight: 700 }}>
                        Chef's Special Menu
                      </div>
                      <div style={{ fontSize: '11px', color: '#6A583E', marginTop: '6px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        FINE DINING
                      </div>
                    </div>
                  </div>

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
