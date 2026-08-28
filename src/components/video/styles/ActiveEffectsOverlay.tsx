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

        // ─── 1. GLITCH, RETRO & CYBER (8 Effects) ───

        // 1.1 Scanline RGB Slicing Glitch
        if (effId === 'horizontal_scanline_rgb_glitch') {
          const isHardBeat = Math.sin(currentFrame * 1.8) > 0.15;
          const shift = isHardBeat ? Math.sin(currentFrame * 3.5) * 24 : 0;
          return (
            <div key={fx.id} className="absolute inset-0 w-full h-full">
              <div
                className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.8) 0px, rgba(0,0,0,0.8) 1.5px, transparent 1.5px, transparent 3.5px)',
                  backgroundSize: '100% 3.5px',
                }}
              />
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

        // 1.2 VHS Retro Tape Static
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

        // 1.3 CRT Arcade Curved Screen
        if (effId === 'crt_monitor_curvature') {
          return (
            <div key={fx.id} className="absolute inset-0 w-full h-full pointer-events-none">
              <div
                className="absolute inset-0 w-full h-full opacity-70 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 2px, transparent 2px, transparent 4px)',
                  boxShadow: 'inset 0 0 100px rgba(0,0,0,0.85)',
                  borderRadius: '12px',
                }}
              />
              <div className="absolute inset-0 w-full h-full border-8 border-black/90" />
            </div>
          );
        }

        // 1.4 RGB Split Chromatic Aberration
        if (effId === 'rgb_split_chromatic') {
          const splitOffset = Math.sin(currentFrame * 0.2) * 16;
          return (
            <div key={fx.id} className="absolute inset-0 w-full h-full mix-blend-screen">
              <div
                className="absolute inset-0 w-full h-full opacity-75"
                style={{
                  transform: `translateX(${splitOffset}px)`,
                  boxShadow: 'inset 0 0 40px rgba(255,0,0,0.5)',
                }}
              />
              <div
                className="absolute inset-0 w-full h-full opacity-75"
                style={{
                  transform: `translateX(${-splitOffset}px)`,
                  boxShadow: 'inset 0 0 40px rgba(0,255,255,0.5)',
                }}
              />
            </div>
          );
        }

        // 1.5 Pixelate Mosaic 8-Bit
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

        // 1.6 Retro Halftone Pop-Art Grid
        if (effId === 'halftone_pop_art') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-multiply opacity-65"
              style={{
                backgroundImage:
                  'radial-gradient(#E11D48 1.5px, transparent 1.5px), radial-gradient(#F59E0B 1.5px, transparent 1.5px)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 4px 4px',
              }}
            />
          );
        }

        // 1.7 ASCII Code Matrix Terminal
        if (effId === 'ascii_matrix_rain') {
          const rainOffset = (currentFrame * 8) % 100;
          return (
            <div key={fx.id} className="absolute inset-0 w-full h-full mix-blend-screen opacity-70">
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(34,197,94,0.3) 0px, rgba(34,197,94,0.3) 2px, transparent 2px, transparent 16px)',
                  backgroundPosition: `0 ${rainOffset}%`,
                  boxShadow: 'inset 0 0 50px rgba(34,197,94,0.4)',
                }}
              />
            </div>
          );
        }

        // 1.8 Pencil Cross-Hatch Sketch
        if (effId === 'cross_hatch_sketch') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-multiply opacity-55"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 6px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 6px)',
              }}
            />
          );
        }

        // ─── 2. LIGHT & CINEMATIC GLOW (9 Effects) ───

        // 2.1 Volumetric Sun Godrays
        if (effId === 'godray_volumetric_light') {
          const rayAngle = 45 + Math.sin(currentFrame * 0.05) * 15;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-screen opacity-80"
              style={{
                background: `repeating-linear-gradient(${rayAngle}deg, rgba(255,215,0,0.4) 0px, rgba(255,215,0,0.4) 30px, transparent 30px, transparent 80px)`,
                filter: 'blur(8px)',
              }}
            />
          );
        }

        // 2.2 Advanced HDR Bloom
        if (effId === 'advanced_bloom_dreamy') {
          const bloomInt = 0.5 + Math.sin(currentFrame * 0.08) * 0.3;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-screen"
              style={{
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.7) 0%, rgba(244,114,182,0.4) 40%, transparent 75%)',
                opacity: bloomInt,
                filter: 'blur(12px)',
              }}
            />
          );
        }

        // 2.3 Neon Cyberpunk Outline Glow
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

        // 2.4 Prism Optical Lens Flare
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

        // 2.5 Golden Bokeh Depth Particles
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

        // 2.6 Specular Light Sheen Apple
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

        // 2.7 Strobe Flash EDM Beat
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

        // 2.8 Solarize Nuclear Flash Blast
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

        // 2.9 Military Green Night Vision
        if (effId === 'night_vision_military') {
          return (
            <div key={fx.id} className="absolute inset-0 w-full h-full pointer-events-none">
              <div
                className="absolute inset-0 w-full h-full mix-blend-color opacity-85"
                style={{ backgroundColor: '#22C55E' }}
              />
              <div
                className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.8) 0px, rgba(0,0,0,0.8) 2px, transparent 2px, transparent 4px)',
                  boxShadow: 'inset 0 0 120px rgba(0,0,0,0.9)',
                }}
              />
            </div>
          );
        }

        // ─── 3. DISTORTION & MOTION BLUR (8 Effects) ───

        // 3.1 Expanding Shockwave Ripple
        if (effId === 'shockwave_water_ripple') {
          const ringRadius = (currentFrame % 45) * 6;
          return (
            <div key={fx.id} className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
              <div
                className="rounded-full border-4 border-cyan-400/60 mix-blend-screen transition-all"
                style={{
                  width: `${ringRadius * 2}px`,
                  height: `${ringRadius * 2}px`,
                  filter: 'blur(2px)',
                  opacity: Math.max(0, 1 - (currentFrame % 45) / 45),
                }}
              />
            </div>
          );
        }

        // 3.2 Liquid Ripple Wave Refraction
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

        // 3.3 Twist Vortex Swirl
        if (effId === 'twist_vortex_swirl') {
          const twistRot = (currentFrame * 3) % 360;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-color-dodge opacity-65 flex items-center justify-center"
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(168,85,247,0.5) 0deg, transparent 90deg, rgba(236,72,153,0.5) 180deg, transparent 270deg)',
                  transform: `rotate(${twistRot}deg)`,
                }}
              />
            </div>
          );
        }

        // 3.4 Bulge Pinch Fisheye Lens
        if (effId === 'bulge_pinch_lens') {
          const bulgeScale = 1.15 + Math.sin(currentFrame * 0.1) * 0.08;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full"
              style={{
                borderRadius: '50%',
                boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6)',
                transform: `scale(${bulgeScale})`,
                filter: 'blur(0.2px)',
              }}
            />
          );
        }

        // 3.5 Hyperdrive Zoom Blur Warp
        if (effId === 'radial_zoom_warp') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-screen opacity-75"
              style={{
                background: 'radial-gradient(circle at center, transparent 30%, rgba(244,63,94,0.4) 70%, rgba(244,63,94,0.8) 100%)',
                transform: `scale(${1.0 + (currentFrame % 15) * 0.03})`,
              }}
            />
          );
        }

        // 3.6 Directional Motion Blur
        if (effId === 'motion_blur_velocity') {
          const blurShift = Math.sin(currentFrame * 0.4) * 12;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-screen opacity-70"
              style={{
                transform: `translateX(${blurShift}px)`,
                filter: 'blur(4px)',
              }}
            />
          );
        }

        // 3.7 3D Perspective Tilt Projection
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

        // 3.8 Puddle Mirror Reflection
        if (effId === 'water_puddle_reflection') {
          return (
            <div
              key={fx.id}
              className="absolute bottom-0 left-0 right-0 h-1/3 mix-blend-overlay opacity-80"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(56,189,248,0.5) 100%)',
                boxShadow: '0 -10px 20px rgba(56,189,248,0.3)',
              }}
            />
          );
        }

        // ─── 4. COLOR GRADING & FUTURISTIC ART (8 Effects) ───

        // 4.1 FLIR Predator Ironbow Heatmap
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

        // 4.2 Duotone Cyberpunk Tokyo
        if (effId === 'duotone_cyber_pink_cyan') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-color opacity-85"
              style={{
                background: 'linear-gradient(45deg, #06B6D4 0%, #EC4899 100%)',
              }}
            />
          );
        }

        // 4.3 Sobel Neon Edge Glow
        if (effId === 'sobel_edge_neon_lines') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-screen opacity-75"
              style={{
                boxShadow: 'inset 0 0 30px #22D3EE, inset 0 0 60px #10B981',
                filter: 'contrast(1.6) brightness(1.2)',
              }}
            />
          );
        }

        // 4.4 Technicolor 3-Strip Cinema
        if (effId === 'technicolor_vintage_film') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-color-burn opacity-40"
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #10B981 50%, #3B82F6 100%)',
              }}
            />
          );
        }

        // 4.5 Vintage Polaroid 1980s
        if (effId === 'polaroid_fade_warm') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-color-dodge opacity-35"
              style={{
                background: 'linear-gradient(180deg, #FDE68A 0%, #F472B6 100%)',
              }}
            />
          );
        }

        // 4.6 Psychedelic Spectrum Shift
        if (effId === 'lsd_psychedelic_shift') {
          const lsdHue = (currentFrame * 6) % 360;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-hue opacity-90"
              style={{
                backgroundColor: `hsl(${lsdHue}, 100%, 50%)`,
              }}
            />
          );
        }

        // 4.7 Monochrome Luma Center Pop
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

        // 4.8 Cinematic Amber Gold Wash
        if (effId === 'color_wash_tint') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-color-dodge opacity-40"
              style={{
                background: 'radial-gradient(circle at center, #F59E0B 0%, #D97706 80%)',
              }}
            />
          );
        }

        // ─── 5. CAMERA, LENS & DEPTH (7 Effects) ───

        // 5.1 Tilt-Shift Miniature Toy Town
        if (effId === 'tilt_shift_miniature') {
          return (
            <div key={fx.id} className="absolute inset-0 w-full h-full pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-1/4 backdrop-blur-sm" />
              <div className="absolute bottom-0 left-0 right-0 h-1/4 backdrop-blur-sm" />
            </div>
          );
        }

        // 5.2 Ken-Burns Documentary Zoom
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

        // 5.3 35mm Hollywood Film Grain
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

        // 5.4 Kaleidoscope 8-Fold Mandala
        if (effId === 'kaleidoscope_8x_mirror') {
          const rot = (currentFrame * 2) % 360;
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-color-dodge opacity-50 flex items-center justify-center"
            >
              <div
                className="w-full h-full"
                style={{
                  background: 'conic-gradient(from 0deg, #A855F7 0deg, transparent 45deg, #EC4899 90deg, transparent 135deg, #3B82F6 180deg, transparent 225deg, #10B981 270deg, transparent 315deg)',
                  transform: `rotate(${rot}deg)`,
                }}
              />
            </div>
          );
        }

        // 5.5 Kawase Frosted Blur Glass
        if (effId === 'kawase_frosted_glass') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full backdrop-blur-md opacity-80"
              style={{
                boxShadow: 'inset 0 0 60px rgba(255,255,255,0.2)',
              }}
            />
          );
        }

        // 5.6 Cinematic Vignette Lens
        if (effId === 'vignette_dark_corner') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full"
              style={{
                boxShadow: 'inset 0 0 140px rgba(0,0,0,0.9)',
              }}
            />
          );
        }

        // 5.7 Comic Book Line Outline
        if (effId === 'cartoon_outline_stroke') {
          return (
            <div
              key={fx.id}
              className="absolute inset-0 w-full h-full mix-blend-difference opacity-40 border-4 border-black"
              style={{
                filter: 'contrast(2) brightness(0.8)',
              }}
            />
          );
        }

        // DEFAULT FALLBACK
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
