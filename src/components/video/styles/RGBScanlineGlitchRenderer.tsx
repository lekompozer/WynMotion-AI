'use client';

import React, { useMemo } from 'react';

export interface RGBScanlineGlitchProps {
  frame: number;
  imageUrl: string;
  intensity?: number; // 0 to 1
  triggerGlitch?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const RGBScanlineGlitchRenderer: React.FC<RGBScanlineGlitchProps> = ({
  frame,
  imageUrl,
  intensity = 0.8,
  triggerGlitch = true,
  className = '',
  style = {},
}) => {
  // Generate 16 deterministic horizontal slices
  const slices = useMemo(() => {
    const arr = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const topPct = (i / count) * 100;
      const bottomPct = 100 - ((i + 1) / count) * 100;
      arr.push({ id: i, topPct, bottomPct });
    }
    return arr;
  }, []);

  if (!triggerGlitch || intensity <= 0.05) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`} style={style}>
        <img
          src={imageUrl}
          alt="Original"
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      </div>
    );
  }

  // Pseudo-random high frequency oscillations for glitch
  const isHardBeat = Math.sin(frame * 1.8) > 0.3;
  const globalGlitchShift = isHardBeat ? Math.sin(frame * 3.7) * 16 * intensity : 0;
  const rgbSplitOffset = isHardBeat ? 6 * intensity : 0;

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        filter: isHardBeat ? `contrast(1.2) brightness(1.1)` : 'none',
        ...style,
      }}
    >
      {/* 1. Base Image Layer */}
      <img
        src={imageUrl}
        alt="Base"
        className="w-full h-full object-cover absolute inset-0"
      />

      {/* 2. Sliced Horizontal Scanline Displacements (16 Horizontal Slices as in Ảnh 3) */}
      {slices.map((slice) => {
        // Pseudo-random slice displacement based on slice index & frame
        const seed = Math.sin(slice.id * 12.9898 + frame * 0.4) * 43758.5453;
        const randVal = seed - Math.floor(seed);
        const shouldGlitchSlice = randVal > 0.45;
        const sliceShift = shouldGlitchSlice
          ? (randVal - 0.5) * 36 * intensity + globalGlitchShift
          : 0;

        return (
          <div
            key={slice.id}
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{
              clipPath: `inset(${slice.topPct}% 0% ${slice.bottomPct}% 0%)`,
              transform: `translateX(${sliceShift}px)`,
              opacity: shouldGlitchSlice ? 0.95 : 1,
            }}
          >
            {/* Red Channel Aberration (Offset to Right) */}
            {rgbSplitOffset > 0 && (
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover absolute inset-0 mix-blend-screen"
                style={{
                  transform: `translateX(${rgbSplitOffset}px)`,
                  filter: 'drop-shadow(0 0 4px #FF0055)',
                  opacity: 0.7,
                }}
              />
            )}

            {/* Cyan Channel Aberration (Offset to Left) */}
            {rgbSplitOffset > 0 && (
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover absolute inset-0 mix-blend-screen"
                style={{
                  transform: `translateX(${-rgbSplitOffset}px)`,
                  filter: 'drop-shadow(0 0 4px #00F0FF)',
                  opacity: 0.7,
                }}
              />
            )}

            {/* Sharp Center Slice */}
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover absolute inset-0"
            />
          </div>
        );
      })}

      {/* 3. CRT Scanlines Horizontal Lines Grid Overlay (Ảnh 3 effect) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0px, rgba(0, 0, 0, 0.6) 1.5px, transparent 1.5px, transparent 3.5px)',
          backgroundSize: '100% 3.5px',
        }}
      />
    </div>
  );
};
