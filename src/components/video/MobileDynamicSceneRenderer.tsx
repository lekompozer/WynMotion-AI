'use client';

/**
 * MobileDynamicSceneRenderer.tsx — WynMotion-AI iOS Studio
 *
 * Full 100% Mathematical & Visual Parity with Web DynamicSceneRenderer.tsx:
 * 1. whiteboard_stream_hand:
 *    - Real human hand with marker (/assets/drawing-hand.png) tracking dynamic annotation regions
 *    - Pen tip trajectory with realistic harmonic oscillation: waveX = sin(prog*6π)*0.35 + 0.5, waveY = cos(prog*4π)*0.15
 *    - SVG Ink Extraction Filter (feColorMatrix + feComponentTransfer slope 3.0, intercept -0.8)
 *    - 2-Phase reveal: Ink line contour drawing first -> Color artwork reveal follows after 60% progress
 *
 * 2. handdrawn_fast_doodle:
 *    - Starts 100% empty canvas at progress 0
 *    - 5 Multi-Path Bézier Contour Tracing Families (Top Wave, Left Sector, Center Flow, Right Sector, Crosshatch)
 *    - 135° Progressive Watercolor Bloom Gradient Mask (28% -> 65% progression)
 *    - Ken Burns cinematic micro-zoom (1.0 -> 1.04)
 *
 * 3. apple_modern_motion & tech_ui: Dark macOS cards & dynamic typewriter
 * 4. dialogue_scene: Dual animated conversational avatars & interactive speech bubbles
 * 5. science_explainer: STEM blueprint grid & scan line
 * 6. character_animation: 3D Pixar Mascot bounce
 *
 * 2-Layer Text Isolation (Zero Overlap):
 * - Layer 1: AI Scene Note Card (White handwritten card / summary_text)
 * - Layer 2: Whisper Voice Subtitle (Dark pill / voice_transcript)
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

  const currentMs = currentTimeSec * 1000;
  const sceneTotalMs = durationSec * 1000;

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
      return {
        bottom: showWhisperSubs ? (isPortrait ? '70px' : '65px') : (isPortrait ? '20px' : '24px'),
        left: '50%',
        transform: 'translateX(-50%)',
      };
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
        <div
          className="absolute w-[280px] h-[180px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0, 229, 255, 0.22) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
            filter: 'blur(45px)',
          }}
        />

        <div className="absolute top-2.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
          <span className="text-[10px] font-black tracking-wider text-slate-100 uppercase">
            {scene.title || 'WynMotion AI'}
          </span>
        </div>

        <div className="w-[90%] max-w-[420px] bg-[#12141F]/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            </div>
            <span className="text-[9px] font-bold text-slate-400">{Math.round(progress * 100)}%</span>
          </div>

          <div className="min-h-[50px] flex items-center">
            <span className="text-xs font-bold leading-relaxed text-white">
              {typedText}
              {showCursor && <span className="text-[#00E5FF] font-light">|</span>}
            </span>
          </div>

          {secondarySummary && (
            <p className="text-[10px] text-cyan-300 font-medium italic border-t border-white/10 pt-1.5">
              {secondarySummary}
            </p>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <span className="text-[9px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
              #AIAnimation
            </span>
            <span className="text-[9px] font-black text-slate-950 bg-[#00E5FF] px-2.5 py-0.5 rounded-full shadow-sm">
              WynRise
            </span>
          </div>
        </div>

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
        <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black">
          {scene.title || 'Hội Thoại AI'}
        </div>

        <div className="w-full flex items-center justify-around my-auto px-2">
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
  // 3.5. STYLE: PRODUCT & BRAND ADS (Quảng cáo CapCut / SAM 2)
  // ─────────────────────────────────────────────────────────────
  if (visualStyle === 'product_ads_motion' || visualStyle === 'fnb_ads' || visualStyle === 'brand_billboard_ads') {
    const cutoutUrl = (scene as any).cutout_url || scene.image_url;
    const bgUrl = (scene as any).bg_url || scene.image_url;
    const floatY = Math.sin(progress * Math.PI * 4) * 8;
    const neonColor = (scene as any).dominant_colors?.[0] || '#FF0055';
    const accentColor = (scene as any).dominant_colors?.[1] || '#FFE600';
    const flashOpacity = progress < 0.1 ? (1 - progress / 0.1) * 0.9 : 0;

    return (
      <div className="w-full h-full bg-[#08080C] flex flex-col items-center justify-between p-3 relative overflow-hidden select-none text-white">
        {/* Ambient Blurred Background */}
        {bgUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={bgUrl} alt="Background" className="w-full h-full object-cover blur-md brightness-40 scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
          </div>
        )}

        {/* Top Tag & Hook */}
        <div className="z-10 w-full flex flex-col items-center gap-1 pt-1">
          <div
            className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md"
            style={{ backgroundColor: `${accentColor}22`, border: `1px solid ${accentColor}`, color: accentColor }}
          >
            🔥 HOT DEAL ADS
          </div>
          <p
            className="text-xs font-black text-center uppercase tracking-tight px-4 leading-tight drop-shadow-md line-clamp-2"
            style={{ textShadow: `0 0 12px ${neonColor}` }}
          >
            {(scene as any).hook_text || scene.title || 'ƯU ĐÃI ĐẶC BIỆT'}
          </p>
        </div>

        {/* Center Floating SAM 2 Cutout */}
        <div
          className="z-10 flex-1 flex items-center justify-center p-2 transition-transform duration-100"
          style={{ transform: `translateY(${floatY}px)` }}
        >
          {cutoutUrl ? (
            <img
              src={cutoutUrl}
              alt={scene.title}
              className="max-h-[160px] max-w-[85%] object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)]"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-pink-400/60 flex items-center justify-center text-2xl">
              🛍️
            </div>
          )}
        </div>

        {/* Price Tag Badge */}
        <div className="z-10 pb-2">
          <div
            className="px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider text-black shadow-lg"
            style={{ background: `linear-gradient(135deg, ${accentColor}, #FF9900)` }}
          >
            {(scene as any).price_text || 'MUA NGAY'}
          </div>
        </div>

        {/* White Flash Effect on scene start */}
        {flashOpacity > 0 && (
          <div className="absolute inset-0 bg-white pointer-events-none z-50" style={{ opacity: flashOpacity }} />
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
  // 5. STYLE: WHITEBOARD STREAM HAND (SRT Stream Hand Drawing With Real Pen Hand)
  // ─────────────────────────────────────────────────────────────
  if (visualStyle === 'whiteboard_stream_hand') {
    const canvasW = (scene as any).annotation?.canvas?.width || vbWidth;
    const canvasH = (scene as any).annotation?.canvas?.height || vbHeight;
    const scaleX = vbWidth / canvasW;
    const scaleY = vbHeight / canvasH;

    const rawElements = (scene as any).annotation?.elements && (scene as any).annotation.elements.length > 0
      ? (scene as any).annotation.elements
      : [
          {
            id: 'sec1',
            label: 'Khung cảnh bối cảnh',
            region: { x: 0, y: 0, width: canvasW * 0.5, height: canvasH },
            reveal: { startMs: 100, durationMs: Math.max(1200, sceneTotalMs * 0.48) },
          },
          {
            id: 'sec2',
            label: 'Đối tượng trọng tâm',
            region: { x: canvasW * 0.45, y: 0, width: canvasW * 0.55, height: canvasH },
            reveal: { startMs: Math.max(1400, sceneTotalMs * 0.45), durationMs: Math.max(1200, sceneTotalMs * 0.48) },
          },
        ];

    const sortedElements = [...rawElements].sort((a, b) => (a.reveal?.startMs || 0) - (b.reveal?.startMs || 0));

    let activePenX = vbWidth * 0.5;
    let activePenY = vbHeight * 0.5;
    let isPenActive = false;

    sortedElements.forEach((el: any) => {
      const startMs = el.reveal?.startMs ?? 0;
      const durMs = el.reveal?.durationMs ?? 2500;
      const endMs = startMs + durMs;

      if (currentMs >= startMs && currentMs < endMs) {
        isPenActive = true;
        const prog = (currentMs - startMs) / durMs;
        const rx = (el.region?.x || 0) * scaleX;
        const ry = (el.region?.y || 0) * scaleY;
        const rw = (el.region?.width || vbWidth) * scaleX;
        const rh = (el.region?.height || vbHeight) * scaleY;

        // Dynamic hand path harmonic oscillation
        const waveX = Math.sin(prog * Math.PI * 6) * 0.35 + 0.5;
        const waveY = Math.cos(prog * Math.PI * 4) * 0.15;
        activePenX = rx + rw * Math.max(0.1, Math.min(0.9, waveX));
        activePenY = ry + rh * Math.max(0.05, Math.min(0.95, prog + waveY));
      }
    });

    return (
      <div
        className="w-full h-full flex flex-col items-center justify-between p-3 relative overflow-hidden select-none"
        style={{ backgroundColor: bgColor || '#F5EBD7' }}
      >
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Caveat:wght@700&display=swap" />

        {/* Paper Grain & Warm Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 z-[1]"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(245, 235, 215, 0.3) 0%, rgba(220, 205, 180, 0.5) 100%)',
          }}
        />

        {/* SVG Drawing Canvas Stage */}
        <div className="z-10 w-full flex-1 flex items-center justify-center relative overflow-hidden">
          {scene.image_url ? (
            <svg viewBox={`0 0 ${vbWidth} ${vbHeight}`} className="w-full h-full max-h-[92%] object-contain">
              <defs>
                {/* 1. BLACK INK EXTRACTION FILTER FOR WARM PAPER */}
                <filter id={`wb_ink_${scene.scene_id}`} x="0%" y="0%" width="100%" height="100%">
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
                    <feFuncR type="linear" slope="3.0" intercept="-0.8" />
                    <feFuncG type="linear" slope="3.0" intercept="-0.8" />
                    <feFuncB type="linear" slope="3.0" intercept="-0.8" />
                  </feComponentTransfer>
                </filter>

                {/* 2. ELEMENT REVEAL CLIPPERS */}
                <clipPath id={`wb_stream_clip_${scene.scene_id}`}>
                  {sortedElements.map((el: any, i: number) => {
                    const startMs = el.reveal?.startMs ?? 0;
                    const durMs = el.reveal?.durationMs ?? 2500;
                    const rx = (el.region?.x || 0) * scaleX;
                    const ry = (el.region?.y || 0) * scaleY;
                    const rw = (el.region?.width || vbWidth) * scaleX;
                    const rh = (el.region?.height || vbHeight) * scaleY;

                    if (currentMs < startMs) return null;
                    if (currentMs >= startMs + durMs) {
                      return <rect key={i} x={rx} y={ry} width={rw} height={rh} rx={8} />;
                    }
                    const prog = Math.min(1, Math.max(0, (currentMs - startMs) / durMs));
                    return <rect key={i} x={rx} y={ry} width={rw} height={rh * prog} rx={8} />;
                  })}
                </clipPath>
              </defs>

              {/* Layer 1: Ink Line Drawing */}
              <g clipPath={`url(#wb_stream_clip_${scene.scene_id})`}>
                <image
                  href={scene.image_url}
                  width={vbWidth}
                  height={vbHeight}
                  preserveAspectRatio={isPortrait ? 'xMidYMid meet' : 'xMidYMid slice'}
                  filter={`url(#wb_ink_${scene.scene_id})`}
                  opacity={0.95}
                />
              </g>

              {/* Layer 2: Colored Artwork Reveal (Follows Ink after 60% progress) */}
              {sortedElements.map((el: any, i: number) => {
                const startMs = el.reveal?.startMs ?? 0;
                const durMs = el.reveal?.durationMs ?? 2500;
                const rx = (el.region?.x || 0) * scaleX;
                const ry = (el.region?.y || 0) * scaleY;
                const rw = (el.region?.width || vbWidth) * scaleX;
                const rh = (el.region?.height || vbHeight) * scaleY;

                if (currentMs < startMs + durMs * 0.6) return null;
                const colorProg = Math.min(1, Math.max(0, (currentMs - (startMs + durMs * 0.6)) / (durMs * 0.4)));

                return (
                  <g key={`color_${i}`}>
                    <clipPath id={`wb_color_clip_${scene.scene_id}_${i}`}>
                      <rect x={rx} y={ry} width={rw} height={rh * colorProg} rx={8} />
                    </clipPath>
                    <g clipPath={`url(#wb_color_clip_${scene.scene_id}_${i})`}>
                      <image
                        href={scene.image_url}
                        width={vbWidth}
                        height={vbHeight}
                        preserveAspectRatio={isPortrait ? 'xMidYMid meet' : 'xMidYMid slice'}
                        opacity={colorProg}
                      />
                    </g>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-1">🖋️</span>
              <p className="text-xs font-black text-slate-800">{scene.title}</p>
            </div>
          )}

          {/* REALISTIC HAND OVERLAY TRACKER WITH LIVE PEN TIP (/assets/drawing-hand.png) */}
          {isPenActive && (
            <div
              className="absolute pointer-events-none z-30 transition-all duration-75"
              style={{
                left: `${(activePenX / vbWidth) * 100}%`,
                top: `${(activePenY / vbHeight) * 100}%`,
                transform: `translate(-20px, -20px) rotate(${Math.sin(currentTimeSec * 20) * 3}deg)`,
                filter: 'drop-shadow(0 14px 20px rgba(50, 30, 10, 0.45))',
              }}
            >
              <img
                src="/assets/drawing-hand.png"
                alt="Drawing Hand"
                className="w-44 h-auto block select-none pointer-events-none"
                style={{ transformOrigin: '12% 12%' }}
              />
            </div>
          )}
        </div>

        {/* Layer 1: White Note Card */}
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

        {/* Layer 2: Whisper Subtitle Pill */}
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
  }

  // ─────────────────────────────────────────────────────────────
  // 6. STYLE: HANDDRAWN FAST DOODLE (5 Multi-Path Bézier Contour Tracing & 135° Watercolor Bloom)
  // ─────────────────────────────────────────────────────────────
  const fillStart = 0.28;
  const fillEnd = 0.65;
  const colorSpread = Math.min(100, Math.max(0, ((progress - fillStart) / (fillEnd - fillStart)) * 100));
  const colorSaturation = Math.min(1.0, Math.max(0.05, 0.05 + 0.95 * ((progress - fillStart) / (fillEnd - fillStart))));
  const kenBurnsScale = 1.0 + 0.04 * progress;

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-between p-3 relative overflow-hidden select-none"
      style={{ backgroundColor: bgColor || '#FAF7EF' }}
    >
      {/* Main SVG Dynamic Multi-Path Contour Stage */}
      <div
        className="z-10 w-full flex-1 flex items-center justify-center relative overflow-hidden"
        style={{ transform: `scale(${kenBurnsScale})` }}
      >
        {scene.image_url ? (
          <svg viewBox={`0 0 ${vbWidth} ${vbHeight}`} className="w-full h-full max-h-[92%] object-contain">
            <defs>
              {/* 1. Black Ink Extraction Filter */}
              <filter id={`doodle_ink_${scene.scene_id}`} x="0%" y="0%" width="100%" height="100%">
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
                  <feFuncR type="linear" slope="4.2" intercept="-1.1" />
                  <feFuncG type="linear" slope="4.2" intercept="-1.1" />
                  <feFuncB type="linear" slope="4.2" intercept="-1.1" />
                </feComponentTransfer>
              </filter>

              {/* 2. Progressive 5 Multi-Path Bézier Contour Tracing Mask */}
              <mask id={`doodle_contour_mask_${scene.scene_id}`}>
                <rect width={vbWidth} height={vbHeight} fill="black" />
                <g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round">
                  {/* Top Wave (0% -> 18%) */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const strokeOffset = Math.max(0, 2200 - (progress / 0.18) * 2200);
                    return (
                      <path
                        key={`top_${i}`}
                        d={`M ${(80 * vbWidth) / 1920} ${((60 + i * 36) * vbHeight) / 1080} Q ${(960 * vbWidth) / 1920} ${((40 + i * 36) * vbHeight) / 1080} ${(1840 * vbWidth) / 1920} ${((60 + i * 36) * vbHeight) / 1080}`}
                        strokeWidth={isPortrait ? '34' : '42'}
                        strokeDasharray="2200"
                        strokeDashoffset={strokeOffset}
                      />
                    );
                  })}

                  {/* Left Sector (4% -> 28%) */}
                  {Array.from({ length: 15 }).map((_, i) => {
                    const strokeOffset = Math.max(0, 1300 - Math.max(0, (progress - 0.04) / 0.24) * 1300);
                    return (
                      <path
                        key={`left_${i}`}
                        d={`M ${(60 * vbWidth) / 1920} ${((260 + i * 50) * vbHeight) / 1080} C ${(250 * vbWidth) / 1920} ${((220 + i * 50) * vbHeight) / 1080} ${(450 * vbWidth) / 1920} ${((300 + i * 50) * vbHeight) / 1080} ${(680 * vbWidth) / 1920} ${((260 + i * 50) * vbHeight) / 1080}`}
                        strokeWidth={isPortrait ? '44' : '56'}
                        strokeDasharray="1300"
                        strokeDashoffset={strokeOffset}
                      />
                    );
                  })}

                  {/* Center Flow (10% -> 32%) */}
                  {Array.from({ length: 9 }).map((_, i) => {
                    const strokeOffset = Math.max(0, 1400 - Math.max(0, (progress - 0.1) / 0.22) * 1400);
                    return (
                      <path
                        key={`mid_${i}`}
                        d={`M ${(650 * vbWidth) / 1920} ${((320 + i * 46) * vbHeight) / 1080} Q ${(960 * vbWidth) / 1920} ${((260 + i * 46) * vbHeight) / 1080} ${(1280 * vbWidth) / 1920} ${((340 + i * 46) * vbHeight) / 1080}`}
                        strokeWidth={isPortrait ? '42' : '52'}
                        strokeDasharray="1400"
                        strokeDashoffset={strokeOffset}
                      />
                    );
                  })}

                  {/* Right Sector (8% -> 34%) */}
                  {Array.from({ length: 15 }).map((_, i) => {
                    const strokeOffset = Math.max(0, 1300 - Math.max(0, (progress - 0.08) / 0.26) * 1300);
                    return (
                      <path
                        key={`right_${i}`}
                        d={`M ${(1250 * vbWidth) / 1920} ${((250 + i * 52) * vbHeight) / 1080} C ${(1450 * vbWidth) / 1920} ${((210 + i * 52) * vbHeight) / 1080} ${(1650 * vbWidth) / 1920} ${((290 + i * 52) * vbHeight) / 1080} ${(1860 * vbWidth) / 1920} ${((250 + i * 52) * vbHeight) / 1080}`}
                        strokeWidth={isPortrait ? '46' : '58'}
                        strokeDasharray="1300"
                        strokeDashoffset={strokeOffset}
                      />
                    );
                  })}

                  {/* Crosshatch Detailing (18% -> 38%) */}
                  {Array.from({ length: 14 }).map((_, i) => {
                    const strokeOffset = Math.max(0, 900 - Math.max(0, (progress - 0.18) / 0.2) * 900);
                    return (
                      <line
                        key={`cross_${i}`}
                        x1={(150 * vbWidth) / 1920}
                        y1={((150 + i * 65) * vbHeight) / 1080}
                        x2={(1750 * vbWidth) / 1920}
                        y2={((350 + i * 65) * vbHeight) / 1080}
                        strokeWidth={isPortrait ? '24' : '32'}
                        strokeDasharray="900"
                        strokeDashoffset={strokeOffset}
                      />
                    );
                  })}
                </g>
              </mask>

              {/* 3. 135° Progressive Watercolor Bloom Mask */}
              <mask id={`doodle_bloom_mask_${scene.scene_id}`}>
                <linearGradient id={`bloom_grad_${scene.scene_id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="white" />
                  <stop offset={`${Math.min(100, colorSpread)}%`} stopColor="white" />
                  <stop offset={`${Math.min(100, colorSpread + 18)}%`} stopColor="black" />
                  <stop offset="100%" stopColor="black" />
                </linearGradient>
                <rect width={vbWidth} height={vbHeight} fill={`url(#bloom_grad_${scene.scene_id})`} />
              </mask>
            </defs>

            {/* Layer 1: Ink Line Drawing with Contour Mask */}
            <g mask={`url(#doodle_contour_mask_${scene.scene_id})`}>
              <image
                href={scene.image_url}
                width={vbWidth}
                height={vbHeight}
                preserveAspectRatio={isPortrait ? 'xMidYMid meet' : 'xMidYMid slice'}
                filter={`url(#doodle_ink_${scene.scene_id})`}
                opacity={0.95}
              />
            </g>

            {/* Layer 2: 135° Watercolor Color Bloom */}
            {progress >= fillStart && (
              <g mask={`url(#doodle_bloom_mask_${scene.scene_id})`}>
                <image
                  href={scene.image_url}
                  width={vbWidth}
                  height={vbHeight}
                  preserveAspectRatio={isPortrait ? 'xMidYMid meet' : 'xMidYMid slice'}
                  style={{ filter: `saturate(${colorSaturation})` }}
                  opacity={Math.min(1, (progress - fillStart) / 0.15)}
                />
              </g>
            )}
          </svg>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-1">🎨</span>
            <p className="text-xs font-black text-slate-800">{scene.title}</p>
          </div>
        )}
      </div>

      {/* Layer 1: White Note Card */}
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

      {/* Layer 2: Whisper Subtitle Pill */}
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
