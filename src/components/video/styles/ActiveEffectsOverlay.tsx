'use client';

import React from 'react';
import { RGBScanlineGlitchRenderer } from './RGBScanlineGlitchRenderer';

export interface CustomTimelineEffect {
  id: string;
  effectId: string;
  name: string;
  trackIndex: number;
  startTime: number;
  endTime: number;
  duration: number;
  shaderName?: string;
  params?: Record<string, any>;
}

export interface ActiveEffectsOverlayProps {
  activeEffects: CustomTimelineEffect[];
  currentTime: number; // in seconds
  currentFrame: number;
  fps?: number;
}

export const ActiveEffectsOverlay: React.FC<ActiveEffectsOverlayProps> = ({
  activeEffects = [],
  currentTime,
  currentFrame,
  fps = 30,
}) => {
  if (!activeEffects || activeEffects.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-40 overflow-hidden">
      {activeEffects.map((fx) => {
        const effProg = Math.min(1, Math.max(0, (currentTime - fx.startTime) / Math.max(0.1, fx.duration)));
        const effId = fx.effectId || fx.shaderName || '';

        // 1. HORIZONTAL SCANLINE RGB GLITCH (Ảnh 3)
        if (effId === 'horizontal_scanline_rgb_glitch') {
          const isHardBeat = Math.sin(currentFrame * 1.8) > 0.2;
          const shift = isHardBeat ? Math.sin(currentFrame * 3.5) * 20 : 0;
          return (
            <div key={fx.id} className="absolute inset-0 w-full h-full">
              {/* Scanline CRT overlay */}
              <div
                className="absolute inset-0 w-full h-full opacity-50 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.7) 0px, rgba(0,0,0,0.7) 1.5px, transparent 1.5px, transparent 3.5px)',
                  backgroundSize: '100% 3.5px',
                }}
              />
              {/* RGB Split Ghosting */}
              {isHardBeat && (
                <>
                  <div
                    className="absolute inset-0 w-full h-full mix-blend-screen opacity-70"
                    style={{
                      transform: `translateX(${shift}px)`,
                      boxShadow: 'inset 0 0 50px rgba(255, 0, 85, 0.4)',
                    }}
                  />
                  <div
                    className="absolute inset-0 w-full h-full mix-blend-screen opacity-70"
                    style={{
                      transform: `translateX(${-shift}px)`,
                      boxShadow: 'inset 0 0 50px rgba(0, 240, 255, 0.4)',
                    }}
                  />
                </>
              )}
            </div>
          );
        }

        // 2. SPECULAR METALLIC SHEEN SWEEP (Apple Style)
        if (effId === 'specular_metallic_sheen') {
          const sheenX = -120 + ((currentFrame % 45) / 45) * 340;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-overlay"
              style={{
                background:
                  'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0.95) 50%, transparent 55%)',
                transform: `translateX(${sheenX}%)`,
              }}
            />
          );
        }

        // 3. STROBE FLASH BEAT
        if (effId === 'strobe_flash_beat') {
          const isWhitePhase = Math.floor(currentTime * 8) % 2 === 0;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-difference"
              style={{
                backgroundColor: isWhitePhase ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
              }}
            />
          );
        }

        // 4. FLASH BLAST SILHOUETTE
        if (effId === 'flash_blast_silhouette') {
          const flashOp = effProg < 0.25 ? effProg / 0.25 : Math.max(0, 1 - (effProg - 0.25) / 0.75);
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundColor: `rgba(255, 255, 255, ${flashOp * 0.9})`,
                mixBlendMode: 'screen',
              }}
            />
          );
        }

        // 5. VHS RETRO TAPE NOISE
        if (effId === 'vhs_retro_tape_noise') {
          const vhsOffset = (currentFrame * 4) % 100;
          return (
            <div key={fx.id} className="absolute inset-0 w-full h-full">
              <div
                className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 2px, transparent 2px, transparent 4px)',
                }}
              />
              <div
                className="absolute left-0 right-0 h-4 bg-white/20 blur-xs mix-blend-screen"
                style={{ top: `${vhsOffset}%` }}
              />
            </div>
          );
        }

        // 6. GOLDEN BOKEH PARTICLES
        if (effId === 'golden_bokeh_particles') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-screen opacity-70"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,215,0,0.6) 10%, transparent 20%), radial-gradient(circle, rgba(255,180,0,0.4) 15%, transparent 30%)',
                backgroundSize: '120px 120px, 180px 180px',
                backgroundPosition: `${Math.sin(currentFrame * 0.05) * 30}px ${-currentFrame * 2}px, ${Math.cos(currentFrame * 0.04) * 20}px ${-currentFrame * 1.5}px`,
              }}
            />
          );
        }

        // 7. NEON CYBER GLOW
        if (effId === 'neon_cyber_glow') {
          const neonHue = (currentFrame * 3) % 360;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full border-8 border-transparent"
              style={{
                boxShadow: `inset 0 0 40px hsl(${neonHue}, 100%, 60%)`,
                opacity: 0.85,
              }}
            />
          );
        }

        // 8. FILM GRAIN VINTAGE
        if (effId === 'film_grain_vintage') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full opacity-35 mix-blend-overlay"
              style={{
                backgroundImage:
                  'radial-gradient(#FFFFFF 1px, transparent 1px), radial-gradient(#000000 1px, transparent 1px)',
                backgroundSize: '4px 4px',
                backgroundPosition: `${(currentFrame * 13) % 4}px ${(currentFrame * 7) % 4}px`,
              }}
            />
          );
        }

        // 9. GRAYSCALE UNDERLAYER PUSH
        if (effId === 'grayscale_underlayer_push') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full backdrop-grayscale backdrop-brightness-75 transition-all"
              style={{ opacity: 0.6 }}
            />
          );
        }

        // 10. DEFAULT / GLSL SHADER PULSE
        return (
          <div
            key={fx.id}
            className="absolute inset-0 w-full h-full mix-blend-screen opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)',
            }}
          />
        );
      })}
    </div>
  );
};
