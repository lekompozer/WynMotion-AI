'use client';

import React from 'react';

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

        // 1. HORIZONTAL SCANLINE RGB GLITCH (PixiJS GlitchFilter + CRT)
        if (effId === 'horizontal_scanline_rgb_glitch') {
          const isHardBeat = Math.sin(currentFrame * 1.8) > 0.15;
          const shift = isHardBeat ? Math.sin(currentFrame * 3.5) * 24 : 0;
          return (
            <div key={fx.id} className="absolute inset-0 w-full h-full">
              {/* Scanline CRT overlay */}
              <div
                className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.8) 0px, rgba(0,0,0,0.8) 1.5px, transparent 1.5px, transparent 3.5px)',
                  backgroundSize: '100% 3.5px',
                }}
              />
              {/* RGB Split Ghosting */}
              {isHardBeat && (
                <>
                  <div
                    className="absolute inset-0 w-full h-full mix-blend-screen opacity-80"
                    style={{
                      transform: `translateX(${shift}px)`,
                      boxShadow: 'inset 0 0 60px rgba(255, 0, 85, 0.5)',
                    }}
                  />
                  <div
                    className="absolute inset-0 w-full h-full mix-blend-screen opacity-80"
                    style={{
                      transform: `translateX(${-shift}px)`,
                      boxShadow: 'inset 0 0 60px rgba(0, 240, 255, 0.5)',
                    }}
                  />
                </>
              )}
            </div>
          );
        }

        // 2. STROBE FLASH BEAT (Three.js StrobePass)
        if (effId === 'strobe_flash_beat') {
          const isWhitePhase = Math.floor(currentTime * 8) % 2 === 0;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-difference"
              style={{
                backgroundColor: isWhitePhase ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
              }}
            />
          );
        }

        // 3. SPECULAR METALLIC SHEEN (Shadertoy Apple Glare)
        if (effId === 'specular_metallic_sheen') {
          const sheenX = -120 + ((currentFrame % 45) / 45) * 340;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-overlay"
              style={{
                background:
                  'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.98) 50%, rgba(255,255,255,0.7) 60%, transparent 70%)',
                transform: `translateX(${sheenX}%)`,
              }}
            />
          );
        }

        // 4. FLASH BLAST SILHOUETTE (Shadertoy Solarize Blast)
        if (effId === 'flash_blast_silhouette') {
          const flashOp = effProg < 0.25 ? effProg / 0.25 : Math.max(0, 1 - (effProg - 0.25) / 0.75);
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundColor: `rgba(255, 255, 255, ${flashOp * 0.95})`,
                mixBlendMode: 'screen',
              }}
            />
          );
        }

        // 5. VHS RETRO TAPE NOISE (PixiJS OldFilm / CRTFilter)
        if (effId === 'vhs_retro_tape_noise') {
          const vhsOffset = (currentFrame * 4) % 100;
          return (
            <div key={fx.id} className="absolute inset-0 w-full h-full">
              <div
                className="absolute inset-0 w-full h-full opacity-50 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 4px)',
                }}
              />
              <div
                className="absolute left-0 right-0 h-6 bg-white/30 blur-xs mix-blend-screen"
                style={{ top: `${vhsOffset}%` }}
              />
              <div className="absolute inset-0 w-full h-full border-4 border-black/40 opacity-75" />
            </div>
          );
        }

        // 6. PIXEL MOSAIC SHATTER (PixiJS PixelateFilter)
        if (effId === 'pixel_mosaic_shatter') {
          const blockSize = 8 + Math.round(Math.abs(Math.sin(currentFrame * 0.15)) * 24);
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-overlay opacity-85"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent ${blockSize}px), repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent ${blockSize}px)`,
                backgroundSize: `${blockSize}px ${blockSize}px`,
              }}
            />
          );
        }

        // 7. GOLDEN BOKEH PARTICLES (Three.js BokehShader)
        if (effId === 'golden_bokeh_particles') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-screen opacity-80"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,215,0,0.7) 12%, transparent 25%), radial-gradient(circle, rgba(255,180,0,0.5) 15%, transparent 35%)',
                backgroundSize: '130px 130px, 190px 190px',
                backgroundPosition: `${Math.sin(currentFrame * 0.05) * 40}px ${-currentFrame * 2}px, ${Math.cos(currentFrame * 0.04) * 30}px ${-currentFrame * 1.5}px`,
              }}
            />
          );
        }

        // 8. PRISM OPTICAL FLARE (Shadertoy Anamorphic Flare)
        if (effId === 'prism_rainbow_flare') {
          const flareAngle = 35 + Math.sin(currentFrame * 0.08) * 10;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-screen opacity-75"
              style={{
                background: `linear-gradient(${flareAngle}deg, transparent 20%, rgba(255, 0, 128, 0.4) 35%, rgba(0, 240, 255, 0.5) 50%, rgba(255, 215, 0, 0.4) 65%, transparent 80%)`,
              }}
            />
          );
        }

        // 9. 3D PERSPECTIVE TILT (Three.js Quad Projection)
        if (effId === 'perspective_3d_float') {
          const rotX = Math.sin(currentFrame * 0.1) * 6;
          const rotY = Math.cos(currentFrame * 0.08) * 8;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full"
              style={{
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.6)',
                transform: `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                transition: 'transform 0.1s linear',
              }}
            />
          );
        }

        // 10. KEN-BURNS CONTINUOUS ZOOM (Three.js Cinematic Zoom)
        if (effId === 'kenburns_continuous_zoom') {
          const zoomScale = 1.0 + (Math.sin(currentFrame * 0.05) * 0.5 + 0.5) * 0.12;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full"
              style={{
                boxShadow: 'inset 0 0 80px rgba(0,0,0,0.55)',
                transform: `scale(${zoomScale})`,
                transition: 'transform 0.1s linear',
              }}
            />
          );
        }

        // 11. GRAYSCALE UNDERLAYER PUSH (Three.js Luminance Monochrome)
        if (effId === 'grayscale_underlayer_push') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full backdrop-grayscale backdrop-brightness-75"
              style={{
                maskImage: 'radial-gradient(circle at center, transparent 35%, black 75%)',
                WebkitMaskImage: 'radial-gradient(circle at center, transparent 35%, black 75%)',
              }}
            />
          );
        }

        // 12. NEON CYBERPUNK OUTLINE GLOW (PixiJS GlowFilter)
        if (effId === 'neon_cyber_glow') {
          const neonHue = (currentFrame * 4) % 360;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full border-8 border-transparent"
              style={{
                boxShadow: `inset 0 0 50px hsl(${neonHue}, 100%, 60%), 0 0 40px hsl(${neonHue}, 100%, 60%)`,
                opacity: 0.9,
              }}
            />
          );
        }

        // 13. LIQUID WAVE DISTORTION (PixiJS Shockwave / Water)
        if (effId === 'liquid_wave_distortion') {
          const wavePhase = (currentFrame * 0.12) % (Math.PI * 2);
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-overlay opacity-75"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.4) 0%, transparent 60%)',
                transform: `scale(${1.0 + Math.sin(wavePhase) * 0.05})`,
                filter: 'blur(0.5px)',
              }}
            />
          );
        }

        // 14. THERMAL MATRIX HEATMAP (Shadertoy FLIR Ironbow)
        if (effId === 'thermal_heatmap_matrix') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-color opacity-85"
              style={{
                background:
                  'linear-gradient(135deg, #1A0033 0%, #660066 25%, #CC0000 50%, #FF9900 75%, #FFFF66 100%)',
              }}
            />
          );
        }

        // 15. RETRO HALFTONE POP-ART GRID (Three.js DotScreenShader / PixiJS DotFilter)
        if (effId === 'halftone_pop_art') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-multiply opacity-60"
              style={{
                backgroundImage:
                  'radial-gradient(#E11D48 1.5px, transparent 1.5px), radial-gradient(#F59E0B 1.5px, transparent 1.5px)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 4px 4px',
              }}
            />
          );
        }

        // 16. 35MM FILM GRAIN CINEMA OVERLAY (Three.js FilmShader)
        if (effId === 'film_grain_vintage') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full opacity-45 mix-blend-overlay"
              style={{
                backgroundImage:
                  'radial-gradient(#FFFFFF 1px, transparent 1px), radial-gradient(#000000 1px, transparent 1px)',
                backgroundSize: '4px 4px',
                backgroundPosition: `${(currentFrame * 17) % 4}px ${(currentFrame * 11) % 4}px`,
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.6)',
              }}
            />
          );
        }

        // DEFAULT FALLBACK SHADER OVERLAY
        return (
          <div
            key={fx.id}
            className="absolute inset-0 w-full h-full mix-blend-screen opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)',
            }}
          />
        );
      })}
    </div>
  );
};
