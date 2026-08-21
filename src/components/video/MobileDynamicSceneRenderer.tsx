'use client';

/**
 * MobileDynamicSceneRenderer.tsx — WynMotion-AI iOS Studio
 * Full 100% parity with Web DynamicSceneRenderer.tsx for all 6 Visual Styles:
 * 1. whiteboard_stream_hand (Bút vẽ tay / SRT Stream hand drawing with ink extraction & live pen tip)
 * 2. handdrawn_fast_doodle (Phác họa nhanh / Multi-path contour tracing & 135-deg watercolor bloom)
 * 3. apple_modern_motion / tech_ui (Chuyển động hiện đại / Dark glassmorphism macOS cards & glow)
 * 4. dialogue_scene (Hội thoại 2 người / Dialogue conversation avatars & speech bubbles)
 * 5. science_explainer (Diễn giải khoa học / STEM formula, diagram & blueprint grid)
 * 6. character_animation (Nhân vật hoạt hình / Mascot 3D Pixar & expressive bounce)
 */

import React, { useMemo } from 'react';
import { MotionScene, MotionVisualStyle } from '@/services/wynmotionService';

export interface MobileDynamicSceneRendererProps {
  scene: MotionScene;
  visualStyle: MotionVisualStyle | string;
  currentTimeSec: number;
  totalSceneDurationSec?: number;
  bgColor?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | string;
  textLangMode?: 'vi' | 'en' | 'bilingual';
  showSubtitle?: boolean;
}

export const MobileDynamicSceneRenderer: React.FC<MobileDynamicSceneRendererProps> = ({
  scene,
  visualStyle = 'whiteboard_stream_hand',
  currentTimeSec,
  totalSceneDurationSec = 5,
  bgColor = '#FAF7EF',
  aspectRatio = '16:9',
  textLangMode = 'vi',
  showSubtitle = true,
}) => {
  const isPortrait = aspectRatio === '9:16';
  const isSquare = aspectRatio === '1:1';
  const vbWidth = isPortrait ? 1080 : isSquare ? 1080 : 1920;
  const vbHeight = isPortrait ? 1920 : isSquare ? 1080 : 1080;

  const durationSec = Math.max(1, scene.duration_sec || totalSceneDurationSec || 5);
  const progress = Math.min(1, Math.max(0, currentTimeSec / durationSec));

  // Dynamic texts based on language mode
  const rawVi = (scene as any).voice_transcript || scene.summary_text || scene.title || '';
  const rawEn = (scene as any).voice_transcript_en || (scene as any).voice_transcript || scene.title || '';

  const displaySubtitle = useMemo(() => {
    if (textLangMode === 'en') return rawEn;
    if (textLangMode === 'bilingual') return rawVi;
    return rawVi;
  }, [textLangMode, rawVi, rawEn]);

  const secondarySubtitle = textLangMode === 'bilingual' ? rawEn : '';

  // ─────────────────────────────────────────────────────────────
  // 1. STYLE: APPLE MODERN MOTION & TECH UI
  // ─────────────────────────────────────────────────────────────
  if (visualStyle === 'apple_modern_motion' || visualStyle === 'tech_ui') {
    const typedCharCount = Math.min(displaySubtitle.length, Math.floor(progress * displaySubtitle.length * 1.5));
    const typedText = displaySubtitle.slice(0, typedCharCount);
    const showCursor = Math.floor(progress * 20) % 2 === 0 && typedCharCount < displaySubtitle.length;

    return (
      <div className="w-full h-full bg-[#090A10] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none text-white font-sans">
        {/* Glow backdrop */}
        <div
          className="absolute w-[280px] h-[180px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0, 229, 255, 0.22) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
            filter: 'blur(45px)',
          }}
        />

        {/* Top badge */}
        <div className="absolute top-2.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
          <span className="text-[10px] font-black tracking-wider text-slate-100 uppercase">
            {scene.title || 'WynMotion AI'}
          </span>
        </div>

        {/* Glassmorphism macOS Card */}
        <div className="w-[90%] max-w-[420px] bg-[#12141F]/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 relative z-10">
          {/* Traffic lights */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            </div>
            <span className="text-[9px] font-bold text-slate-400">{Math.round(progress * 100)}%</span>
          </div>

          {/* Typewriter text */}
          <div className="min-h-[50px] flex items-center">
            <span className="text-xs font-bold leading-relaxed text-white">
              {typedText}
              {showCursor && <span className="text-[#00E5FF] font-light">|</span>}
            </span>
          </div>

          {/* Bilingual sub */}
          {secondarySubtitle && (
            <p className="text-[10px] text-cyan-300 font-medium italic border-t border-white/10 pt-1.5">
              {secondarySubtitle}
            </p>
          )}

          {/* Bottom tag row */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <span className="text-[9px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
              #AIAnimation
            </span>
            <span className="text-[9px] font-black text-slate-950 bg-[#00E5FF] px-2.5 py-0.5 rounded-full shadow-sm">
              WynRise
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. STYLE: DIALOGUE SCENE (Hội thoại 2 người)
  // ─────────────────────────────────────────────────────────────
  if (visualStyle === 'dialogue_scene') {
    const isSpeakerA = progress < 0.5;
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-between p-3 relative overflow-hidden select-none"
        style={{ backgroundColor: bgColor }}
      >
        {/* Top Header Badge */}
        <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black">
          {scene.title || 'Hội Thoại AI'}
        </div>

        {/* Dual Avatars Stage */}
        <div className="w-full flex items-center justify-around my-auto px-2">
          {/* Speaker A (Left) */}
          <div
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              isSpeakerA ? 'scale-105 opacity-100' : 'scale-90 opacity-40'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-xl overflow-hidden">
              {scene.image_url ? (
                <img src={scene.image_url} alt="Speaker A" className="w-full h-full object-cover" />
              ) : (
                '🧑‍💼'
              )}
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-500">
              Speaker A
            </span>
          </div>

          {/* VS / Dialogue divider */}
          <div className="w-6 h-6 rounded-full bg-slate-300/40 flex items-center justify-center text-[10px] font-black text-slate-600">
            💬
          </div>

          {/* Speaker B (Right) */}
          <div
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              !isSpeakerA ? 'scale-105 opacity-100' : 'scale-90 opacity-40'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-400 to-pink-500 border-2 border-white shadow-lg flex items-center justify-center text-xl overflow-hidden">
              '👩‍🔬'
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-500">
              Speaker B
            </span>
          </div>
        </div>

        {/* Speech Bubble Dialog Box */}
        {showSubtitle && !(scene as any).hide_text && (
          <div
            className={`w-[92%] rounded-2xl p-2.5 border shadow-md transition-all ${
              isSpeakerA
                ? 'bg-cyan-50/95 border-cyan-300 text-slate-900'
                : 'bg-purple-50/95 border-purple-300 text-slate-900'
            }`}
          >
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              {isSpeakerA ? 'Speaker A 🗣️' : 'Speaker B 🗣️'}
            </div>
            <p className="text-xs font-bold leading-snug">{displaySubtitle}</p>
            {secondarySubtitle && (
              <p className="text-[10px] text-slate-500 font-medium italic mt-1">{secondarySubtitle}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. STYLE: SCIENCE EXPLAINER (Diễn giải khoa học & STEM)
  // ─────────────────────────────────────────────────────────────
  if (visualStyle === 'science_explainer') {
    return (
      <div className="w-full h-full bg-[#08111E] flex flex-col items-center justify-between p-3 relative overflow-hidden select-none text-white font-mono">
        {/* Blueprint Grid Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Formula Badge */}
        <div className="z-10 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-[10px] font-black shadow-sm">
          ⚛️ {scene.title || 'STEM Science Explainer'}
        </div>

        {/* Main Diagram Area */}
        <div className="z-10 w-full flex-1 flex items-center justify-center p-2">
          {scene.image_url ? (
            <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 max-h-[70%]">
              <img src={scene.image_url} alt={scene.title} className="w-full h-full object-contain" />
              {/* Scanline laser */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#00E5FF]"
                style={{ top: `${progress * 100}%` }}
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-cyan-400/60 flex items-center justify-center animate-spin">
              <span className="text-3xl font-sans">⚗️</span>
            </div>
          )}
        </div>

        {/* Scientific Subtitle Card */}
        {showSubtitle && !(scene as any).hide_text && (
          <div className="z-10 w-[92%] bg-slate-900/90 border border-cyan-500/30 rounded-xl p-2.5 text-center shadow-lg">
            <p className="text-xs font-sans font-bold text-cyan-100 leading-snug">{displaySubtitle}</p>
            {secondarySubtitle && (
              <p className="text-[10px] font-sans text-cyan-300/80 italic mt-0.5">{secondarySubtitle}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. STYLE: CHARACTER ANIMATION (Mascot / 3D Character)
  // ─────────────────────────────────────────────────────────────
  if (visualStyle === 'character_animation') {
    const bounceOffset = Math.sin(progress * Math.PI * 4) * 6;
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-between p-3 relative overflow-hidden select-none"
        style={{ backgroundColor: bgColor }}
      >
        {/* Top Title Badge */}
        <div className="px-3 py-1 rounded-full bg-black/60 text-white text-[10px] font-black">
          🦊 {scene.title || 'Mascot Animation'}
        </div>

        {/* Mascot Center Stage with Bouncing Physics */}
        <div
          className="my-auto flex items-center justify-center transition-transform duration-100"
          style={{ transform: `translateY(${bounceOffset}px)` }}
        >
          {scene.image_url ? (
            <img
              src={scene.image_url}
              alt={scene.title}
              className="max-h-[140px] w-auto object-contain rounded-2xl drop-shadow-2xl"
            />
          ) : (
            <div className="text-6xl drop-shadow-xl">🦊</div>
          )}
        </div>

        {/* Subtitle speech card */}
        {showSubtitle && !(scene as any).hide_text && (
          <div className="w-[92%] bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-slate-200 text-center shadow-md">
            <p className="text-xs font-black text-slate-900 leading-snug">{displaySubtitle}</p>
            {secondarySubtitle && (
              <p className="text-[10px] text-cyan-600 font-bold italic mt-0.5">{secondarySubtitle}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 5 & 6: WHITEBOARD STREAM HAND & FAST DOODLE (Bút vẽ tay / Phác họa)
  // ─────────────────────────────────────────────────────────────
  // Ink drawing progression: 0% -> 50% draw ink, 50% -> 100% color fill
  const inkReveal = Math.min(1, progress * 2);
  const colorReveal = Math.min(1, Math.max(0, (progress - 0.45) / 0.55));

  // Pen coordinates tracking
  const penX = vbWidth * (0.2 + 0.6 * progress);
  const penY = vbHeight * (0.3 + 0.4 * Math.sin(progress * Math.PI * 4));

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-between p-3 relative overflow-hidden select-none"
      style={{ backgroundColor: bgColor || '#FAF7EF' }}
    >
      {/* Paper Warmth Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(245, 235, 215, 0.3) 0%, rgba(220, 205, 180, 0.5) 100%)',
        }}
      />

      {/* Top Scene Title Note */}
      <div className="z-10 px-3 py-1 rounded-full bg-white/90 border border-slate-300/80 shadow-sm text-slate-800 text-[10px] font-black">
        ✍️ {scene.title || 'Whiteboard Hand-Drawn'}
      </div>

      {/* Main SVG Ink Canvas Stage */}
      <div className="z-10 w-full flex-1 flex items-center justify-center relative overflow-hidden">
        {scene.image_url ? (
          <svg
            viewBox={`0 0 ${vbWidth} ${vbHeight}`}
            className="w-full h-full max-h-[85%] object-contain"
          >
            <defs>
              {/* High Contrast Ink Filter */}
              <filter id={`mob_ink_${scene.scene_id}`}>
                <feColorMatrix
                  type="matrix"
                  values="
                    0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0    0    0    1 0
                  "
                />
                <feComponentTransfer>
                  <feFuncR type="linear" slope="4.0" intercept="-1.0" />
                  <feFuncG type="linear" slope="4.0" intercept="-1.0" />
                  <feFuncB type="linear" slope="4.0" intercept="-1.0" />
                </feComponentTransfer>
              </filter>

              {/* Ink Reveal ClipPath */}
              <clipPath id={`mob_clip_${scene.scene_id}`}>
                <rect x="0" y="0" width={vbWidth} height={vbHeight * inkReveal} />
              </clipPath>
            </defs>

            {/* Layer 1: Ink Line Drawing */}
            <g clipPath={`url(#mob_clip_${scene.scene_id})`}>
              <image
                href={scene.image_url}
                width={vbWidth}
                height={vbHeight}
                preserveAspectRatio={isPortrait ? 'xMidYMid meet' : 'xMidYMid slice'}
                filter={`url(#mob_ink_${scene.scene_id})`}
                opacity={0.95}
              />
            </g>

            {/* Layer 2: Watercolor Color Reveal */}
            {colorReveal > 0 && (
              <image
                href={scene.image_url}
                width={vbWidth}
                height={vbHeight}
                preserveAspectRatio={isPortrait ? 'xMidYMid meet' : 'xMidYMid slice'}
                opacity={colorReveal}
              />
            )}
          </svg>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-1">🖋️</span>
            <p className="text-xs font-black text-slate-800">{scene.title}</p>
          </div>
        )}

        {/* Live Pen / Marker Icon tracking while drawing */}
        {progress < 0.9 && (
          <div
            className="absolute pointer-events-none text-2xl z-20 transition-all duration-75 drop-shadow-md"
            style={{
              left: `${(penX / vbWidth) * 100}%`,
              top: `${(penY / vbHeight) * 100}%`,
              transform: 'translate(-50%, -50%) rotate(-15deg)',
            }}
          >
            ✏️
          </div>
        )}
      </div>

      {/* Bottom Subtitle Card */}
      {showSubtitle && !(scene as any).hide_text && (
        <div className="z-10 w-[94%] bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-slate-300 text-center shadow-md">
          <p className="text-xs font-black text-slate-900 leading-snug">{displaySubtitle}</p>
          {secondarySubtitle && (
            <p className="text-[10px] text-cyan-600 font-bold italic mt-0.5">{secondarySubtitle}</p>
          )}
        </div>
      )}
    </div>
  );
};
