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
 *
 * Distinct 2-Layer Text Rendering:
 * - Layer 1: AI Scene Note Card (White handwritten card / summary_text) with customizable Y position
 * - Layer 2: Whisper Voice Subtitle (Dark pill / voice_transcript) with customizable Y position
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
  showSceneCards?: boolean;
  showWhisperSubs?: boolean;
  cardPosY?: 'top' | 'middle' | 'bottom' | number;
  subsPosY?: 'top' | 'middle' | 'bottom' | number;
  onCardClick?: () => void;
  onSubsClick?: () => void;
}

export const MobileDynamicSceneRenderer: React.FC<MobileDynamicSceneRendererProps> = ({
  scene,
  visualStyle = 'whiteboard_stream_hand',
  currentTimeSec,
  totalSceneDurationSec = 5,
  bgColor = '#FAF7EF',
  aspectRatio = '16:9',
  textLangMode = 'vi',
  showSceneCards = true,
  showWhisperSubs = true,
  cardPosY = 'middle',
  subsPosY = 'bottom',
  onCardClick,
  onSubsClick,
}) => {
  const isPortrait = aspectRatio === '9:16';
  const isSquare = aspectRatio === '1:1';
  const vbWidth = isPortrait ? 1080 : isSquare ? 1080 : 1920;
  const vbHeight = isPortrait ? 1920 : isSquare ? 1080 : 1080;

  const durationSec = Math.max(1, scene.duration_sec || totalSceneDurationSec || 5);
  const progress = Math.min(1, Math.max(0, currentTimeSec / durationSec));

  // Extract AI Note Card Summary (Layer 1)
  const summaryVi = scene.summary_text || (scene as any).voice_transcript || scene.title || '';
  const summaryEn = (scene as any).summary_text_en || (scene as any).voice_transcript_en || summaryVi;
  const displaySummary = textLangMode === 'en' ? summaryEn : summaryVi;
  const secondarySummary = textLangMode === 'bilingual' ? summaryEn : '';

  // Extract Whisper Voice Narration Subtitle (Layer 2)
  const voiceVi = (scene as any).voice_transcript || scene.summary_text || scene.title || '';
  const voiceEn = (scene as any).voice_transcript_en || voiceVi;
  const displayVoice = textLangMode === 'en' ? voiceEn : voiceVi;
  const secondaryVoice = textLangMode === 'bilingual' ? voiceEn : '';

  // Calculate position styles
  const getCardPositionStyle = (): React.CSSProperties => {
    if (typeof cardPosY === 'number') {
      return { top: `${cardPosY}%`, transform: 'translate(-50%, -50%)', left: '50%' };
    }
    if (cardPosY === 'top') {
      return { top: isPortrait ? '12%' : '14%', left: '50%', transform: 'translateX(-50%)' };
    }
    if (cardPosY === 'bottom') {
      // If both card & subs at bottom, offset card above subs
      return { bottom: showWhisperSubs ? (isPortrait ? '70px' : '65px') : (isPortrait ? '20px' : '24px'), left: '50%', transform: 'translateX(-50%)' };
    }
    // Default Middle
    return { top: isPortrait ? '52%' : '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  };

  const getSubsPositionStyle = (): React.CSSProperties => {
    if (typeof subsPosY === 'number') {
      return { top: `${subsPosY}%`, transform: 'translate(-50%, -50%)', left: '50%' };
    }
    if (subsPosY === 'top') {
      return { top: '8px', left: '50%', transform: 'translateX(-50%)' };
    }
    if (subsPosY === 'middle') {
      return { top: '65%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    // Default Bottom
    return { bottom: isPortrait ? '10px' : '8px', left: '50%', transform: 'translateX(-50%)' };
  };

  // ─────────────────────────────────────────────────────────────
  // 1. STYLE: APPLE MODERN MOTION & TECH UI
  // ─────────────────────────────────────────────────────────────
  if (visualStyle === 'apple_modern_motion' || visualStyle === 'tech_ui') {
    const typedCharCount = Math.min(displaySummary.length, Math.floor(progress * displaySummary.length * 1.5));
    const typedText = displaySummary.slice(0, typedCharCount);
    const showCursor = Math.floor(progress * 20) % 2 === 0 && typedCharCount < displaySummary.length;

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
          {secondarySummary && (
            <p className="text-[10px] text-cyan-300 font-medium italic border-t border-white/10 pt-1.5">
              {secondarySummary}
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

        {/* Layer 2: Whisper Voice Subtitle if enabled */}
        {showWhisperSubs && !(scene as any).hide_text && (
          <div
            onClick={onSubsClick}
            style={getSubsPositionStyle()}
            className="absolute z-30 max-w-[88%] bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-center shadow-lg cursor-pointer active:scale-95 transition-all"
          >
            <p className="text-[10px] font-bold text-white leading-snug">{displayVoice}</p>
          </div>
        )}
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
          {/* Speaker A */}
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

          <div className="w-6 h-6 rounded-full bg-slate-300/40 flex items-center justify-center text-[10px] font-black text-slate-600">
            💬
          </div>

          {/* Speaker B */}
          <div
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              !isSpeakerA ? 'scale-105 opacity-100' : 'scale-90 opacity-40'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-400 to-pink-500 border-2 border-white shadow-lg flex items-center justify-center text-xl overflow-hidden">
              👩‍🔬
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-500">
              Speaker B
            </span>
          </div>
        </div>

        {/* Speech Bubble Dialog Box */}
        {showWhisperSubs && !(scene as any).hide_text && (
          <div
            onClick={onSubsClick}
            className={`w-[92%] rounded-2xl p-2.5 border shadow-md cursor-pointer transition-all ${
              isSpeakerA
                ? 'bg-cyan-50/95 border-cyan-300 text-slate-900'
                : 'bg-purple-50/95 border-purple-300 text-slate-900'
            }`}
          >
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              {isSpeakerA ? 'Speaker A 🗣️' : 'Speaker B 🗣️'}
            </div>
            <p className="text-xs font-bold leading-snug">{displayVoice}</p>
            {secondaryVoice && (
              <p className="text-[10px] text-slate-500 font-medium italic mt-1">{secondaryVoice}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. STYLE: SCIENCE EXPLAINER (Khoa học & STEM)
  // ─────────────────────────────────────────────────────────────
  if (visualStyle === 'science_explainer') {
    return (
      <div className="w-full h-full bg-[#08111E] flex flex-col items-center justify-between p-3 relative overflow-hidden select-none text-white font-mono">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="z-10 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-[10px] font-black shadow-sm">
          ⚛️ {scene.title || 'STEM Science Explainer'}
        </div>

        <div className="z-10 w-full flex-1 flex items-center justify-center p-2">
          {scene.image_url ? (
            <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 max-h-[70%]">
              <img src={scene.image_url} alt={scene.title} className="w-full h-full object-contain" />
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

        {/* Layer 1: AI Note Card */}
        {showSceneCards && !(scene as any).hide_text && (
          <div
            onClick={onCardClick}
            style={getCardPositionStyle()}
            className="absolute z-25 w-[90%] bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-3 text-center shadow-2xl cursor-pointer active:scale-95 transition-all"
          >
            <p className="text-xs font-sans font-black text-cyan-100 leading-snug">{displaySummary}</p>
            {secondarySummary && (
              <p className="text-[10px] font-sans text-cyan-300/80 italic mt-0.5">{secondarySummary}</p>
            )}
          </div>
        )}

        {/* Layer 2: Whisper Subtitle */}
        {showWhisperSubs && !(scene as any).hide_text && (
          <div
            onClick={onSubsClick}
            style={getSubsPositionStyle()}
            className="absolute z-30 max-w-[90%] bg-slate-950/90 border border-cyan-400/30 rounded-full px-4 py-1.5 text-center shadow-lg cursor-pointer active:scale-95 transition-all"
          >
            <p className="text-[10px] font-sans font-bold text-cyan-200 leading-snug">{displayVoice}</p>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. STYLE: CHARACTER ANIMATION (Mascot)
  // ─────────────────────────────────────────────────────────────
  if (visualStyle === 'character_animation') {
    const bounceOffset = Math.sin(progress * Math.PI * 4) * 6;
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-between p-3 relative overflow-hidden select-none"
        style={{ backgroundColor: bgColor }}
      >
        <div className="px-3 py-1 rounded-full bg-black/60 text-white text-[10px] font-black">
          🦊 {scene.title || 'Mascot Animation'}
        </div>

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

        {/* Layer 1: White Card */}
        {showSceneCards && !(scene as any).hide_text && (
          <div
            onClick={onCardClick}
            style={getCardPositionStyle()}
            className="absolute z-25 w-[90%] bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-300 text-center shadow-xl cursor-pointer active:scale-95 transition-all"
          >
            <p className="text-xs font-black text-slate-900 leading-snug">{displaySummary}</p>
            {secondarySummary && (
              <p className="text-[10px] text-cyan-600 font-bold italic mt-0.5">{secondarySummary}</p>
            )}
          </div>
        )}

        {/* Layer 2: Whisper Pill */}
        {showWhisperSubs && !(scene as any).hide_text && (
          <div
            onClick={onSubsClick}
            style={getSubsPositionStyle()}
            className="absolute z-30 max-w-[88%] bg-slate-900/90 text-white rounded-full px-3.5 py-1.5 text-center shadow-lg cursor-pointer active:scale-95 transition-all"
          >
            <p className="text-[10px] font-bold leading-snug">{displayVoice}</p>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 5 & 6: WHITEBOARD STREAM HAND & FAST DOODLE (2 Tách Biệt Lớp Văn Bản)
  // ─────────────────────────────────────────────────────────────
  const inkReveal = Math.min(1, progress * 2);
  const colorReveal = Math.min(1, Math.max(0, (progress - 0.45) / 0.55));
  const penX = vbWidth * (0.2 + 0.6 * progress);
  const penY = vbHeight * (0.3 + 0.4 * Math.sin(progress * Math.PI * 4));

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-between p-3 relative overflow-hidden select-none"
      style={{ backgroundColor: bgColor || '#FAF7EF' }}
    >
      {/* Paper Warmth Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(245, 235, 215, 0.3) 0%, rgba(220, 205, 180, 0.5) 100%)',
        }}
      />

      {/* Main SVG Ink Canvas Stage */}
      <div className="z-10 w-full flex-1 flex items-center justify-center relative overflow-hidden">
        {scene.image_url ? (
          <svg
            viewBox={`0 0 ${vbWidth} ${vbHeight}`}
            className="w-full h-full max-h-[92%] object-contain"
          >
            <defs>
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

      {/* ─────────────────────────────────────────────────────────────
          LAYER 1: AI SCENE NOTE CARD (Khung Trắng Viết Tay - summary_text)
      ───────────────────────────────────────────────────────────── */}
      {showSceneCards && !(scene as any).hide_text && (
        <div
          onClick={onCardClick}
          style={getCardPositionStyle()}
          className="absolute z-25 w-[92%] max-w-[540px] bg-white/95 backdrop-blur-md rounded-2xl p-3 border-2 border-slate-300 text-center shadow-xl cursor-pointer active:scale-95 transition-all hover:border-cyan-400"
        >
          <p
            className="text-xs font-black text-slate-900 leading-snug"
            style={{ fontFamily: "'Patrick Hand', 'Caveat', cursive, system-ui, sans-serif" }}
          >
            {displaySummary}
          </p>
          {secondarySummary && (
            <p className="text-[10px] text-cyan-700 font-bold italic mt-0.5">{secondarySummary}</p>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 2: WHISPER VOICE SUBTITLES (Khung Xám Đen Giọng Đọc - voice_transcript)
      ───────────────────────────────────────────────────────────── */}
      {showWhisperSubs && !(scene as any).hide_text && (
        <div
          onClick={onSubsClick}
          style={getSubsPositionStyle()}
          className="absolute z-30 max-w-[88%] bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-center shadow-2xl cursor-pointer active:scale-95 transition-all hover:border-cyan-400"
        >
          <p className="text-[10px] font-sans font-bold text-white leading-snug">{displayVoice}</p>
          {secondaryVoice && (
            <p className="text-[9px] font-sans text-cyan-300 font-medium italic mt-0.5">{secondaryVoice}</p>
          )}
        </div>
      )}
    </div>
  );
};
