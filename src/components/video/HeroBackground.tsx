'use client';

import React from 'react';

interface HeroBackgroundProps {
  children?: React.ReactNode;
  variant?: 'blue-gradient' | 'coral-mesh' | 'dark-video';
  videoSrc?: string;
  className?: string;
}

/**
 * HeroBackground — Standalone extensible background component.
 * Supports:
 * - CapCut-style Deep Blue & Cyan mesh gradient (default)
 * - Future video background playback
 * - Animated canvas/particle effects
 */
export const HeroBackground: React.FC<HeroBackgroundProps> = ({
  children,
  variant = 'blue-gradient',
  videoSrc,
  className = '',
}) => {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* 1. Background Layers */}
      {videoSrc ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
            src={videoSrc}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-white" />
        </div>
      ) : variant === 'blue-gradient' ? (
        <div className="absolute inset-0 z-0 bg-[#0B4DB7]">
          {/* Top-to-bottom CapCut radiant mesh */}
          <div
            className="absolute inset-0 opacity-100"
            style={{
              background: `
                radial-gradient(circle at 85% 15%, rgba(45, 156, 255, 0.95) 0%, transparent 50%),
                radial-gradient(circle at 15% 35%, rgba(13, 110, 253, 0.9) 0%, transparent 55%),
                radial-gradient(circle at 50% 60%, rgba(125, 211, 252, 0.85) 0%, transparent 65%),
                linear-gradient(180deg, #0A4595 0%, #1D70DC 32%, #60A5FA 68%, #E0F2FE 90%, #FAFAFC 100%)
              `,
            }}
          />
          {/* Subtle noise/glow accents */}
          <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-cyan-300/30 blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 -right-16 w-72 h-72 rounded-full bg-blue-300/35 blur-3xl pointer-events-none" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FF2D55] via-[#FF5E85] to-[#FAFAFC]" />
      )}

      {/* 2. Foreground Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
