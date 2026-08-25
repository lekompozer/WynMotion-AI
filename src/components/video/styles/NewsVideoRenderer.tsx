'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface NewsVideoRendererProps {
  scene?: DynamicSceneData;
  scenes?: DynamicSceneData[];
  headline?: string;
  category?: string;
  tickerText?: string;
  images?: string[];
  isVertical?: boolean;
}

export const NewsVideoRenderer: React.FC<NewsVideoRendererProps> = ({
  scene,
  scenes = [],
  headline,
  category = 'THỜI SỰ 24H',
  tickerText = 'BẢN TIN NÓNG 60S • CẬP NHẬT MỚI NHẤT LIÊN TỤC • ĐĂNG KÝ KÊNH ĐỂ THEO DÕI',
  images = [],
  isVertical = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Combine images from props or scene
  const allImages = images.length > 0
    ? images
    : scenes
        .map((s) => s.image_url || (s as any).crawled_image)
        .filter(Boolean) as string[];

  const activeImage = allImages.length > 0
    ? allImages[Math.min(allImages.length - 1, Math.floor((frame / durationInFrames) * allImages.length))]
    : scene?.image_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80';

  // Ken Burns: Slow Cinematic Zoom & Pan
  const currentSceneProgress = (frame % Math.max(1, Math.floor(durationInFrames / Math.max(1, allImages.length)))) / (durationInFrames / Math.max(1, allImages.length));
  const kenBurnsScale = interpolate(currentSceneProgress, [0, 1], [1.05, 1.22], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const kenBurnsTranslateX = interpolate(currentSceneProgress, [0, 1], [-15, 15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const kenBurnsTranslateY = interpolate(currentSceneProgress, [0, 1], [5, -15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Ticker marquee translation
  const tickerSpeed = 2.5;
  const tickerOffset = (frame * tickerSpeed) % 800;

  // Active headline
  const activeHeadline = headline || scene?.title || scene?.summary_text || 'BẢN TIN THỜI SỰ NÓNG 60 GIÂY';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#0A0C14',
        overflow: 'hidden',
        fontFamily: '"Montserrat", system-ui, -apple-system, sans-serif',
      }}
    >
      {/* 1. KEN BURNS BACKGROUND IMAGE */}
      <div
        style={{
          position: 'absolute',
          inset: '-5%',
          width: '110%',
          height: '110%',
          transform: `scale(${kenBurnsScale}) translate(${kenBurnsTranslateX}px, ${kenBurnsTranslateY}px)`,
          transition: 'transform 0.05s linear',
        }}
      >
        <img
          src={activeImage}
          alt="News visual"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.85) contrast(1.1)',
          }}
        />
      </div>

      {/* 2. CINEMATIC GRADIENT VIGNETTE */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(5,7,15,0.7) 0%, rgba(0,0,0,0.1) 40%, rgba(5,7,15,0.85) 80%, rgba(5,7,15,0.98) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 3. TOP BREAKING NEWS LIVE BADGE */}
      <div
        style={{
          position: 'absolute',
          top: isVertical ? '7%' : '5%',
          left: '5%',
          right: '5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
        }}
      >
        {/* Red Breaking Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(90deg, #E11D48 0%, #BE123C 100%)',
            padding: '6px 14px',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(225, 29, 72, 0.6), 0 0 10px rgba(225, 29, 72, 0.4)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 8px #FFFFFF',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            🔴 TIN NÓNG
          </span>
        </div>

        {/* Category Pill */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            padding: '6px 12px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#38BDF8',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {category}
        </div>
      </div>

      {/* 4. LOWER-THIRD NEWS HEADLINE BANNER */}
      <div
        style={{
          position: 'absolute',
          bottom: isVertical ? '14%' : '12%',
          left: '5%',
          right: '5%',
          zIndex: 25,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '12px 18px',
            borderLeft: '5px solid #E11D48',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(225, 29, 72, 0.2)',
          }}
        >
          <div
            style={{
              color: '#F8FAFC',
              fontSize: isVertical ? '17px' : '20px',
              fontWeight: 900,
              lineHeight: 1.3,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {activeHeadline}
          </div>
        </div>
      </div>

      {/* 5. BOTTOM SCROLLING NEWS TICKER BAR */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: isVertical ? '40px' : '34px',
          background: 'linear-gradient(90deg, #991B1B 0%, #DC2626 50%, #991B1B 100%)',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          zIndex: 30,
          borderTop: '1.5px solid #FCA5A5',
          boxShadow: '0 -4px 15px rgba(220, 38, 38, 0.4)',
        }}
      >
        {/* Ticker Tag Box */}
        <div
          style={{
            height: '100%',
            padding: '0 16px',
            background: '#7F1D1D',
            color: '#FEF08A',
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '1.5px',
            display: 'flex',
            alignItems: 'center',
            zIndex: 35,
            boxShadow: '4px 0 10px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
          }}
        >
          ⚡ ĐIỂM TIN
        </div>

        {/* Marquee Text */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              transform: `translateX(-${tickerOffset}px)`,
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}
          >
            {`${tickerText}  •  ${tickerText}  •  ${tickerText}`}
          </div>
        </div>
      </div>
    </div>
  );
};
