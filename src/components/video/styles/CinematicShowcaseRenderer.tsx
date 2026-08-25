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
      {/* UNDERNEATH LAYER: Ảnh 4 in Halftone Grayscale Dot-Screen */}
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

      {/* TOP LAYER (ẢNH 3): Left Torn Piece */}
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

      {/* TOP LAYER (ẢNH 3): Right Torn Piece */}
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
 * Progressive Paper Unwrap Component (Scene 5 - Matches User Reference 1 & 2)
 */
export const ProgressivePaperUnwrap: React.FC<{
  progress: number; // 0 to 1
  revealedImage: string;
  width: number;
  height: number;
}> = ({ progress, revealedImage, width, height }) => {
  const isFullyOpen = progress >= 0.95;
  const ballScale = interpolate(progress, [0, 0.15, 0.5, 0.85, 1.0], [0.25, 0.4, 0.72, 0.95, 1.0]);
  const rotation = interpolate(progress, [0, 1.0], [45, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: isFullyOpen ? '100%' : `${width}px`,
          height: isFullyOpen ? '100%' : `${height}px`,
          transform: `scale(${ballScale}) rotate(${rotation}deg)`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${revealedImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: isFullyOpen ? '0px' : '20px',
            boxShadow: isFullyOpen ? 'none' : '0 30px 80px rgba(0,0,0,0.9)',
          }}
        />

        {!isFullyOpen && (
          <div
            style={{
              position: 'absolute',
              inset: -15,
              pointerEvents: 'none',
              opacity: Math.max(0, 1 - progress * 1.05),
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(240,240,240,0.95) 60%, #D0D0D0 80%, #909090 100%)',
              border: '12px solid #FFFFFF',
              boxShadow: 'inset 0 0 35px rgba(0,0,0,0.6), 0 0 25px rgba(255,255,255,0.8)',
              filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.9))',
              clipPath: 'polygon(5% 0%, 95% 4%, 100% 92%, 94% 100%, 6% 96%, 0% 12%)',
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

  // Text Props
  const hookBadge = (scene as any).badge_text || (scene as any).headline_solid || 'BEST MENU';
  const ctaText = (scene as any).cta_text || 'ORDER NOW';
  const sloganText = (scene as any).sub_headline || (scene as any).slogan_text || '⚡ ĐÓN ĐẦU XU HƯỚNG - ƯU ĐÃI HÔM NAY';
  const accentColor = (scene as any).accent_color || '#FF7A00';

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

          {/* Central Purple Lens Flare */}
          {(() => {
            const flareSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
            const flareScale = interpolate(flareSpring, [0, 1], [0.2, 2.2]);
            return (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
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

          {/* Intro BEST Typography */}
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

          {/* Realistic Steam */}
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
          5. SCENE 4 (5.0s – 8.0s): Ảnh 4 Từ Halftone Xám -> Full Màu (5-7s) -> Cuộn Giấy Vo Tròn (7-8s)
          ───────────────────────────────────────────────────────────── */}
      {frame >= f3B && frame < f5 && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {(() => {
            const s4Frame = frame - f3B;

            // Phase 1 (5s -> 7s): Grayscale Halftone smoothly transitions into Full Vivid Color
            const isFullColorPhase = s4Frame < 60;
            const grayPercent = interpolate(s4Frame, [0, 45], [100, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            // Phase 2 (7s -> 8s): Cuộn giấy xuất hiện ở giữa
            const isCrumpling = s4Frame >= 60;
            const ballScale = isCrumpling
              ? interpolate(s4Frame - 60, [0, 30], [0.0, 0.25], { extrapolateRight: 'clamp' })
              : 0;

            return (
              <>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${img4 || img1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: `grayscale(${grayPercent}%) contrast(${1.4 - (grayPercent / 100) * 0.3})`,
                    transform: `scale(${interpolate(s4Frame, [0, 60], [1.0, 1.05])})`,
                  }}
                />

                {/* Cuộn giấy trắng xuất hiện ở giữa từ nhỏ đến vừa */}
                {isCrumpling && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 30,
                    }}
                  >
                    <div
                      style={{
                        width: '240px',
                        height: '240px',
                        transform: `scale(${ballScale}) rotate(${(s4Frame - 60) * 8}deg)`,
                        borderRadius: '44% 56% 52% 48% / 54% 46% 58% 42%',
                        background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #D8D8D8 45%, #9E9E9E 75%, #424242 100%)',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.95), inset 0 0 50px rgba(0,0,0,0.85), inset 15px 15px 30px #FFF',
                      }}
                    />
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. SCENE 5 (8.0s – 10.0s): Cuộn Giấy Trắng Mở Bung Dần (30% -> 50% -> 70% -> 100%) Hé Lộ Ảnh 5
          ───────────────────────────────────────────────────────────── */}
      {frame >= f5 && frame < f5End && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {(() => {
            const s5Frame = frame - f5; // 0 to 60 frames (8.0s -> 10.0s)
            // Progress goes from 0.0 (tight ball) to 1.0 (flat fullscreen)
            const progress = interpolate(s5Frame, [0, 48], [0.0, 1.0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <ProgressivePaperUnwrap
                progress={progress}
                revealedImage={img5 || img1}
                width={width}
                height={height}
              />
            );
          })()}
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
          (Matches Exact User Reference Images 4 & 5)
          ───────────────────────────────────────────────────────────── */}
      {frame >= f7A && frame < f7B && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#05070B' }}>
          {(() => {
            const s7BFrame = frame - f7A; // 0 to 45 frames (15.0s -> 16.5s)

            const pushRightProgress = interpolate(s7BFrame, [0, 18], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            const stackShiftY = interpolate(s7BFrame, [32, 45], [0, -60], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
                {/* Nửa bên trái: 1 nửa full chiều cao của ảnh nhưng có lớp mờ màu đen bên trên */}
                <div
                  style={{
                    width: '58%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
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
                  {/* Dark Shadow Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.95) 100%)',
                    }}
                  />
                </div>

                {/* Nửa bên phải: 3 Tấm Ảnh Xếp Dọc với Lớp Phủ Màu Khác Nhau */}
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
                  {/* Card 1 (Top): Blue/Cyan Tint Overlay */}
                  <div
                    style={{
                      flex: 1,
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundImage: `url(${img6 || img1})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(14, 165, 233, 0.4)', mixBlendMode: 'multiply' }} />
                  </div>

                  {/* Card 2 (Middle - Target Ảnh 7/8): Magenta / Hot Pink Tint Overlay */}
                  <div
                    style={{
                      flex: 1.15,
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundImage: `url(${img8 || img7 || img1})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: '0 12px 35px rgba(0,0,0,0.95)',
                      border: '2px solid rgba(255,255,255,0.25)',
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(236, 72, 153, 0.35)', mixBlendMode: 'multiply' }} />
                  </div>

                  {/* Card 3 (Bottom): Yellow / Gold Tint Overlay */}
                  <div
                    style={{
                      flex: 1,
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundImage: `url(${img5 || img1})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(234, 179, 8, 0.4)', mixBlendMode: 'multiply' }} />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          10. SCENE 8A (16.5s – 19.0s): Lấy Ảnh Ở Giữa Lật Flip (0 -> 180 -> 0) Đưa Từ Phải Qua Giữa Phóng To Full Màn Hình
          (Matches Exact User Reference Image 5)
          ───────────────────────────────────────────────────────────── */}
      {frame >= f7B && frame < f8A && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', perspective: '1200px', backgroundColor: '#05070B' }}>
          {(() => {
            const s8AFrame = frame - f7B;

            const expandSpring = spring({ frame: s8AFrame, fps, config: { damping: 14, stiffness: 100 } });
            const cardX = interpolate(expandSpring, [0, 1], [30, 0]);
            const cardScale = interpolate(expandSpring, [0, 1], [0.38, 1.0]);
            const flipRotateY = interpolate(expandSpring, [0, 0.5, 1], [35, 180, 0]);

            const sweepProgress = interpolate(s8AFrame, [55, 75], [-100, 200], {
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

                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '60%',
                    left: `${sweepProgress}%`,
                    background: 'linear-gradient(to right, transparent, rgba(255, 170, 0, 0.8), rgba(255, 230, 100, 0.9), transparent)',
                    filter: 'blur(20px)',
                    pointerEvents: 'none',
                    mixBlendMode: 'screen',
                  }}
                />
              </>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          11. SCENE 8B (19.0s – 20.5s): Vệt Cọ Quét & Pop-up ORDER NOW
          ───────────────────────────────────────────────────────────── */}
      {frame >= f8A && frame < f8B && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${img8 || img1})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.9)' }} />
          {(() => {
            const s8BFrame = frame - f8A;
            const strokeWidth = interpolate(s8BFrame, [0, 18], [0, 100], { extrapolateRight: 'clamp' });
            const ctaSpring = spring({ frame: Math.max(0, s8BFrame - 15), fps, config: { damping: 10, mass: 0.8, stiffness: 140 } });

            return (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                <div
                  style={{
                    width: `${strokeWidth}%`,
                    maxWidth: '85%',
                    height: isVertical ? '80px' : '100px',
                    background: 'linear-gradient(90deg, #FF7A00 0%, #FFB800 50%, #FF7A00 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 15px 50px rgba(255, 122, 0, 0.7), 0 0 30px rgba(0,0,0,0.8)',
                    transform: `scale(${ctaSpring})`,
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ fontSize: isVertical ? '36px' : '48px', fontWeight: 900, color: '#000000', letterSpacing: '6px', textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: '"Impact", "Anton", sans-serif' }}>
                    {ctaText}
                  </span>
                </div>
                <p style={{ marginTop: '20px', fontSize: isVertical ? '14px' : '18px', color: '#FFFFFF', letterSpacing: '3px', textTransform: 'uppercase', textShadow: '0 4px 14px rgba(0,0,0,0.9)', fontWeight: 700, fontFamily: '"Impact", "Anton", sans-serif' }}>
                  {sloganText}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          12. SCENE 8C (20.5s – 22.0s): 3D Book Mockup Outro
          ───────────────────────────────────────────────────────────── */}
      {frame >= f8B && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            backgroundColor: '#040508',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1400px',
          }}
        >
          {(() => {
            const s8CFrame = frame - f8B;
            const cameraScale = interpolate(s8CFrame, [0, 40], [0.85, 0.52], { extrapolateRight: 'clamp' });
            const foldCloseAngle = interpolate(s8CFrame, [10, 35], [0, -180], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const fadeOut = interpolate(s8CFrame, [35, 45], [1.0, 0.0], { extrapolateRight: 'clamp' });

            const bookW = isVertical ? 420 : 640;
            const bookH = isVertical ? 580 : 440;
            const pageW = bookW / 2;

            return (
              <div
                style={{
                  transform: `scale(${cameraScale}) rotateX(14deg) rotateY(-8deg)`,
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
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: `${pageW}px`,
                      height: `${bookH}px`,
                      backgroundImage: `url(${img8 || img1})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderTopRightRadius: '6px',
                      borderBottomRightRadius: '6px',
                      boxShadow: 'inset 25px 0 35px rgba(0,0,0,0.4)',
                    }}
                  >
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '30px', background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)' }} />
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: `${pageW}px`,
                      height: `${bookH}px`,
                      backgroundColor: '#1E232E',
                      borderTopLeftRadius: '6px',
                      borderBottomLeftRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px',
                      textAlign: 'center',
                      boxShadow: 'inset -25px 0 35px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '20px', marginBottom: '12px' }}>
                      ★
                    </div>
                    <h4 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', fontFamily: '"Playfair Display", serif' }}>
                      {hookBadge}
                    </h4>
                    <p style={{ color: '#94A3B8', fontSize: '11px', marginTop: '8px', lineHeight: 1.4 }}>
                      {sloganText}
                    </p>
                  </div>

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
                        backgroundColor: '#111622',
                        backgroundImage: 'radial-gradient(circle at 50% 50%, #1E293B 0%, #0F172A 100%)',
                        border: '3px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        padding: '20px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
                      }}
                    >
                      <div style={{ border: `2px solid ${accentColor}`, padding: '16px 24px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', color: accentColor, letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 800 }}>
                          SPECIAL MENU
                        </span>
                        <h2 style={{ fontSize: '28px', color: '#FFFFFF', fontWeight: 900, letterSpacing: '4px', marginTop: '6px', textTransform: 'uppercase', fontFamily: '"Playfair Display", serif' }}>
                          {hookBadge}
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
                      background: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.7))',
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
