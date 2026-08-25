'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface CinematicShowcaseRendererProps {
  scene: DynamicSceneData;
}

/**
 * CinematicShowcaseRenderer (Template 2) — 22.0s Full F&B Menu Showcase Reel
 *
 * Exact Timeline & Formula:
 * 1. 0.0s – 1.0s (Scene 1): Blur background + Purple lens flare intro + Text "BEST"
 * 2. 1.0s – 2.0s (Scene 2 - Ảnh 1): Scale zoom 1.0 -> 1.05 + Text "BEST Menu"
 * 3. 2.0s – 3.0s (Scene 3A - Ảnh 2): Grayscale(100%) + 70deg Diagonal Strip color wipe X: -100% -> 100% (giữ "BEST Menu")
 * 4. 3.0s – 5.0s (Scene 3B - Ảnh 3 & Ảnh 4): Ảnh 3 full màu + Chữ "BEST Menu" ở giữa + Hiệu ứng rạch giấy ở giữa (4.5s - 5.0s) để lộ Ảnh 4 (đang ở grayscale xám) bên dưới
 * 5. 5.0s – 7.0s (Scene 4 - Ảnh 4): Ảnh 4 từ xám chuyển dần sang đầy đủ màu sắc (5s - 7s) -> Cuộn giấy vo tròn ở giữa (7s - 8s)
 * 6. 8.0s – 10.0s (Scene 5 - Ảnh 5): Cuộn giấy mở bung xoay tròn 360° hé lộ hoàn toàn Ảnh 5
 * 7. 10.0s – 12.5s (Scene 6 - Ảnh 6): Từng 1/3 (3 dải dọc) của Ảnh 6 bay vào so le trên/dưới khớp vị trí + 3D Door Flip
 * 8. 12.5s – 15.0s (Scene 7A - Ảnh 7): Ảnh 7 xếp 3D từ trên xuống (Accordion roll-down) phẳng hoàn chỉnh ở giây 15
 * 9. 15.0s – 16.5s (Scene 7B - Ảnh 7): Layout chia đôi 50/50: Bên trái là Ảnh 7 zoom mờ, Bên phải là 3 hàng card ảnh -> Slide left
 * 10. 16.5s – 19.0s (Scene 8A - Ảnh 8): Ảnh 8 lật 3D Flip open full màn hình + Ánh sáng cam vàng quét qua ở 19s
 * 11. 19.0s – 20.5s (Scene 8B - Ảnh 8 + CTA): Vệt cọ quét vàng cam + Chữ "ORDER NOW" pop-up bounce spring (19.5s - 20.5s)
 * 12. 20.5s – 22.0s (Scene 8C - 3D Book Mockup Outro): Ảnh 8 trong trang sách, camera lùi xa, quyển sách gập đóng lại, fade out kết thúc.
 */
export const CinematicShowcaseRenderer: React.FC<CinematicShowcaseRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const isVertical = height > width;

  // Extract gallery images 1 to 8 (fallback to mainImage or duplicates if fewer provided)
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
  const f8C = Math.round(22.0 * fps); // 660

  // Steam / Mist Particles for Scene 3B
  const steamParticles = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      x: 20 + (i * 7) % 65,
      yStart: 85 + (i * 4) % 15,
      size: 4 + (i % 3) * 3,
      speed: 0.05 + (i % 3) * 0.02,
    }));
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#07070A',
        fontFamily: '"Impact", "Anton", "Arial Black", -apple-system, sans-serif',
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

          {/* Central Purple / Violet Lens Flare */}
          {(() => {
            const flareSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
            const flareScale = interpolate(flareSpring, [0, 1], [0.2, 2.2]);
            const flareOpacity = interpolate(frame, [0, 10, 25, 30], [0, 1, 0.8, 0.3], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  opacity: flareOpacity,
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

          {/* Text 1: "BEST" */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
            }}
          >
            <h1
              style={{
                fontSize: isVertical ? '76px' : '110px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '8px',
                textTransform: 'uppercase',
                textShadow: '0 0 40px rgba(168, 85, 247, 0.9), 0 10px 30px rgba(0,0,0,0.9)',
                transform: `scale(${interpolate(frame, [0, 20], [0.8, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
              }}
            >
              BEST
            </h1>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SCENE 2 (1.0s – 2.0s): Ảnh 1 Zoom Drift + Text "BEST Menu"
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
                filter: 'brightness(0.95) contrast(1.05)',
              }}
            />
          )}

          {/* Vignette */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />

          {/* Center White Title: "BEST Menu" */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
            }}
          >
            <h2
              style={{
                color: '#FFFFFF',
                fontSize: isVertical ? '54px' : '72px',
                fontWeight: 900,
                letterSpacing: '6px',
                textTransform: 'uppercase',
                textShadow: '0 0 30px rgba(0,0,0,0.9), 0 4px 15px rgba(0,0,0,0.8)',
              }}
            >
              BEST MENU
            </h2>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. SCENE 3A (2.0s – 3.0s): Ảnh 2 Grayscale + Dải chéo Diagonal Wipe
          ───────────────────────────────────────────────────────────── */}
      {frame >= f2 && frame < f3A && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* Base Layer: Grayscale Image 2 */}
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

          {/* Overlay Layer: Full Color Image 2 revealed by 70deg Diagonal Strip */}
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
                }}
              />
            );
          })()}

          {/* Center White Title: "BEST Menu" */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
            <h2 style={{ color: '#FFFFFF', fontSize: isVertical ? '54px' : '72px', fontWeight: 900, letterSpacing: '6px', textTransform: 'uppercase', textShadow: '0 0 30px rgba(0,0,0,0.9), 0 4px 15px rgba(0,0,0,0.8)' }}>
              BEST MENU
            </h2>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. SCENE 3B (3.0s – 5.0s): Ảnh 3 Full Màu + "BEST Menu" + Rạch giấy ở giữa lộ Ảnh 4 (Xám) bên dưới
          ───────────────────────────────────────────────────────────── */}
      {frame >= f3A && frame < f3B && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* UNDERNEATH LAYER: Ảnh 4 in GRAYSCALE xám đen (bắt đầu lộ dần khi Ảnh 3 bị rạch) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${img4 || img1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'grayscale(100%) contrast(1.2) brightness(0.9)',
              zIndex: 1,
            }}
          />

          {/* TOP LAYER: Ảnh 3 with Paper Tear Split */}
          {(() => {
            const tearFrame = frame - 135; // Tear happens in last 0.5s of Scene 3B (135 - 150)
            const isTearing = tearFrame > 0;
            const tearSplitX = isTearing
              ? interpolate(tearFrame, [0, 15], [0, 52], { extrapolateRight: 'clamp' })
              : 0;

            return (
              <>
                {/* Left Half of Ảnh 3 */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '50%',
                    overflow: 'hidden',
                    transform: `translateX(-${tearSplitX}%)`,
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: `${width}px`,
                      backgroundImage: `url(${img3 || img1})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  {/* White Jagged Tear Edge */}
                  {isTearing && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '8px',
                        background: 'linear-gradient(to left, #FFFFFF, rgba(255,255,255,0))',
                        boxShadow: '0 0 15px rgba(255,255,255,0.9)',
                      }}
                    />
                  )}
                </div>

                {/* Right Half of Ảnh 3 */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: '50%',
                    overflow: 'hidden',
                    transform: `translateX(${tearSplitX}%)`,
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      right: 0,
                      width: `${width}px`,
                      backgroundImage: `url(${img3 || img1})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  {/* White Jagged Tear Edge */}
                  {isTearing && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '8px',
                        background: 'linear-gradient(to right, #FFFFFF, rgba(255,255,255,0))',
                        boxShadow: '0 0 15px rgba(255,255,255,0.9)',
                      }}
                    />
                  )}
                </div>

                {/* Center White Title: "BEST Menu" on Ảnh 3 (fades out as paper tears) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    opacity: isTearing ? Math.max(0, 1 - tearFrame / 10) : 1,
                  }}
                >
                  <h2 style={{ color: '#FFFFFF', fontSize: isVertical ? '54px' : '72px', fontWeight: 900, letterSpacing: '6px', textTransform: 'uppercase', textShadow: '0 0 30px rgba(0,0,0,0.9), 0 4px 15px rgba(0,0,0,0.8)' }}>
                    BEST MENU
                  </h2>
                </div>

                {/* Steam Particles */}
                {!isTearing && steamParticles.map((p) => {
                  const steamY = p.yStart - (((frame - f3A) * p.speed * 4) % 90);
                  const steamOpacity = Math.abs(Math.sin((frame - f3A) * 0.08 + p.id)) * 0.45;
                  return (
                    <div
                      key={p.id}
                      style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${steamY}%`,
                        width: p.size * 3,
                        height: p.size * 3,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        filter: 'blur(8px)',
                        opacity: steamOpacity,
                        pointerEvents: 'none',
                        zIndex: 15,
                      }}
                    />
                  );
                })}
              </>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. SCENE 4 (5.0s – 7.0s / 8.0s): Ảnh 4 Từ Xám -> Hiện Đầy Đủ Màu -> Vo Tròn Thành Cuộn Giấy (7s - 8s)
          ───────────────────────────────────────────────────────────── */}
      {frame >= f3B && frame < f5 && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {(() => {
            const s4Frame = frame - f3B; // 0 to 90 frames (5.0s -> 8.0s)
            // 5s -> 7s (0 to 60 frames): Grayscale 100% -> 0% (hiện đủ màu)
            const grayPercent = interpolate(s4Frame, [0, 50], [100, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const zoom = interpolate(s4Frame, [0, 60], [1.0, 1.06], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            // 7s -> 8s (60 to 90 frames): Vo tròn thành cuộn giấy (Crumpled Paper Ball) ở giữa tâm
            const isCrumpling = s4Frame >= 60;
            const ballScale = isCrumpling
              ? interpolate(s4Frame - 60, [0, 30], [1.0, 0.15], { extrapolateRight: 'clamp' })
              : zoom;
            const ballRotate = isCrumpling
              ? interpolate(s4Frame - 60, [0, 30], [0, 240], { extrapolateRight: 'clamp' })
              : 0;

            return (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${img4 || img1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: `grayscale(${grayPercent}%) contrast(1.1)`,
                    transform: `scale(${ballScale}) rotate(${ballRotate}deg)`,
                    borderRadius: isCrumpling ? '50%' : '0px',
                    boxShadow: isCrumpling ? '0 30px 70px rgba(0,0,0,0.95), inset 0 0 50px rgba(0,0,0,0.8)' : 'none',
                  }}
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. SCENE 5 (8.0s – 10.0s): Cuộn Giấy Mở Bung Ra & Xoay Tròn -> Ảnh 5
          ───────────────────────────────────────────────────────────── */}
      {frame >= f5 && frame < f5End && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {(() => {
            const s5Frame = frame - f5; // 0 to 60 frames (8.0s -> 10.0s)
            const unwrapSpring = spring({ frame: s5Frame, fps, config: { damping: 13, stiffness: 90 } });
            const unwrapScale = interpolate(unwrapSpring, [0, 1], [0.15, 1.0]);
            const unwrapRotate = interpolate(unwrapSpring, [0, 1], [360, 0]);

            return (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${img5 || img1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: `scale(${unwrapScale}) rotate(${unwrapRotate}deg)`,
                    boxShadow: unwrapScale < 0.9 ? '0 30px 80px rgba(0,0,0,0.95)' : 'none',
                  }}
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. SCENE 6 (10.0s – 12.5s): Từng 1/3 (3 Dải Dọc) của Ảnh 6 Bay Vào Khớp Vị Trí + 3D Door Flip
          ───────────────────────────────────────────────────────────── */}
      {frame >= f5End && frame < f6 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            display: 'flex',
            perspective: '1200px',
          }}
        >
          {(() => {
            const s6Frame = frame - f5End; // 0 to 75 frames (10.0s -> 12.5s)
            const isClosingDoor = s6Frame >= 60; // 12.0s -> 12.5s: 3D Door Flip
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
                {/* 1/3 Cột 1 */}
                <div style={{ width: '33.333%', height: '100%', overflow: 'hidden', transform: `translateY(${col1Y}px)` }}>
                  <div style={{ width: `${width}px`, height: '100%', backgroundImage: `url(${img6 || img1})`, backgroundSize: 'cover', backgroundPosition: 'left center' }} />
                </div>
                {/* 1/3 Cột 2 */}
                <div style={{ width: '33.333%', height: '100%', overflow: 'hidden', transform: `translateY(${col2Y}px)` }}>
                  <div style={{ width: `${width}px`, height: '100%', marginLeft: `-${width / 3}px`, backgroundImage: `url(${img6 || img1})`, backgroundSize: 'cover', backgroundPosition: 'center center' }} />
                </div>
                {/* 1/3 Cột 3 */}
                <div style={{ width: '33.334%', height: '100%', overflow: 'hidden', transform: `translateY(${col3Y}px)` }}>
                  <div style={{ width: `${width}px`, height: '100%', marginLeft: `-${(width * 2) / 3}px`, backgroundImage: `url(${img6 || img1})`, backgroundSize: 'cover', backgroundPosition: 'right center' }} />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. SCENE 7A (12.5s / 13.0s – 15.0s): Ảnh 7 Xếp 3D Từ Trên Xuống Phẳng Hoàn Chỉnh Ở Giây 15
          ───────────────────────────────────────────────────────────── */}
      {frame >= f6 && frame < f7A && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            perspective: '1400px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {(() => {
            const s7AFrame = frame - f6; // 0 to 75 frames (12.5s -> 15.0s)
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
                  boxShadow: foldRotateX < -10 ? '0 40px 100px rgba(0,0,0,0.95)' : 'none',
                }}
              />
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          9. SCENE 7B (15.0s – 16.5s): Layout Chia Đôi: Trái là Ảnh 7 Mờ, Phải là 3 Hàng Card Ảnh -> Slide Left
          ───────────────────────────────────────────────────────────── */}
      {frame >= f7A && frame < f7B && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {(() => {
            const s7BFrame = frame - f7A; // 0 to 45 frames (15.0s -> 16.5s)
            const slideLeft = s7BFrame >= 35
              ? interpolate(s7BFrame - 35, [0, 10], [0, -100], { extrapolateRight: 'clamp' })
              : 0;

            return (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  transform: `translateX(${slideLeft}%)`,
                }}
              >
                {/* Nửa Trái (50%): Ảnh 7 zoom cận cảnh và mờ nhẹ */}
                <div
                  style={{
                    width: '50%',
                    height: '100%',
                    backgroundImage: `url(${img7 || img1})`,
                    backgroundSize: '220%',
                    backgroundPosition: 'center 40%',
                    filter: 'blur(3px) brightness(0.75)',
                    borderRight: '3px solid rgba(255,255,255,0.2)',
                  }}
                />

                {/* Nửa Phải (50%): 3 Hàng Card Ảnh Xếp Dọc */}
                <div
                  style={{
                    width: '50%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '6px',
                    backgroundColor: '#0A0D14',
                  }}
                >
                  <div style={{ flex: 1, backgroundImage: `url(${img1})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', filter: 'brightness(1.05)' }} />
                  <div style={{ flex: 1, backgroundImage: `url(${img3})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', filter: 'saturate(1.2)' }} />
                  <div style={{ flex: 1, backgroundImage: `url(${img5})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', filter: 'contrast(1.15)' }} />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          10. SCENE 8A (16.5s – 19.0s): Mở Ảnh 8 Lật 3D Ra Full Màn Hình + Ánh Sáng Cam Vàng Quét Qua
          ───────────────────────────────────────────────────────────── */}
      {frame >= f7B && frame < f8A && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', perspective: '1200px' }}>
          {(() => {
            const s8AFrame = frame - f7B; // 0 to 75 frames (16.5s -> 19.0s)
            const flipSpring = spring({ frame: s8AFrame, fps, config: { damping: 14, stiffness: 110 } });
            const flipScale = interpolate(flipSpring, [0, 1], [0.8, 1.04]);
            const flipRotateY = interpolate(flipSpring, [0, 1], [70, 0]);

            // Warm Amber Glow Sweep at 19s (frames 55 - 75)
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
                    transform: `scale(${flipScale}) rotateY(${flipRotateY}deg)`,
                  }}
                />

                {/* Warm Amber Glow Sweep */}
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
          11. SCENE 8B (19.0s – 20.5s): Vệt Cọ Quét Vàng Cam + Pop-up "ORDER NOW" (19.5s - 20.5s)
          ───────────────────────────────────────────────────────────── */}
      {frame >= f8A && frame < f8B && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* Background Ảnh 8 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${img8 || img1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.9)',
            }}
          />

          {/* Vệt Cọ Quét & Pop-up "ORDER NOW" */}
          {(() => {
            const s8BFrame = frame - f8A; // 0 to 45 frames (19.0s -> 20.5s)
            const strokeWidth = interpolate(s8BFrame, [0, 18], [0, 100], { extrapolateRight: 'clamp' });
            // Pop-up "ORDER NOW" bounces in around 19.5s (s8BFrame >= 15)
            const ctaSpring = spring({ frame: Math.max(0, s8BFrame - 15), fps, config: { damping: 10, mass: 0.8, stiffness: 140 } });

            return (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20,
                }}
              >
                {/* Yellow / Amber Brush Banner */}
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
                  <span
                    style={{
                      fontSize: isVertical ? '36px' : '48px',
                      fontWeight: 900,
                      color: '#000000',
                      letterSpacing: '6px',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ctaText}
                  </span>
                </div>

                {/* Slogan */}
                <p
                  style={{
                    marginTop: '20px',
                    fontSize: isVertical ? '14px' : '18px',
                    color: '#FFFFFF',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    textShadow: '0 4px 14px rgba(0,0,0,0.9)',
                    fontWeight: 700,
                  }}
                >
                  {sloganText}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          12. SCENE 8C (20.5s – 22.0s): Dùng Ảnh 8 Trong Trang Sách 3D, Đẩy Ra Xa, Bìa Đóng Lại Kết Thúc
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
            const s8CFrame = frame - f8B; // 0 to 45 frames (20.5s -> 22.0s)
            // Camera scale pull-back (đẩy ra xa)
            const cameraScale = interpolate(s8CFrame, [0, 40], [0.85, 0.52], { extrapolateRight: 'clamp' });
            // Left Cover fold angle: 0deg (open) -> -180deg (gập đóng lại che trang sách)
            const foldCloseAngle = interpolate(s8CFrame, [10, 35], [0, -180], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            // Fade out to black in last 10 frames
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
                  transition: 'opacity 0.2s',
                }}
              >
                {/* 3D BOOK MOCKUP CONTAINER */}
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
                  {/* Trang Phải (Right Page): Chứa Ảnh 8 */}
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
                    {/* Spine Shadow Gradient */}
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '30px', background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)' }} />
                  </div>

                  {/* Trang Trái (Left Page - Cố định bên trong) */}
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
                    <h4 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>
                      {hookBadge}
                    </h4>
                    <p style={{ color: '#94A3B8', fontSize: '11px', marginTop: '8px', lineHeight: 1.4 }}>
                      {sloganText}
                    </p>
                  </div>

                  {/* Bìa Cứng Bên Trái: Gập Đóng Lại Trên Trục Gáy Sách */}
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
                    {/* Mặt Ngoài Của Bìa (Hiển thị khi sách đã gập đóng lại) */}
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
                        <h2 style={{ fontSize: '28px', color: '#FFFFFF', fontWeight: 900, letterSpacing: '4px', marginTop: '6px', textTransform: 'uppercase' }}>
                          {hookBadge}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Gáy Sách (Center Spine Crease) */}
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
