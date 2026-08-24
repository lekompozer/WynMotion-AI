'use client';

/**
 * DynamicSceneRenderer.tsx — WynMotion-AI iOS Studio
 *
 * 100% Exact Mathematical & Visual Parity with wordai Web DynamicSceneRenderer.tsx:
 * 1. evaluateDynamicSceneCode (Dynamic AI-generated Remotion/React code evaluator)
 * 2. Style 1: apple_modern_motion & tech_ui (macOS glassmorphism, spring card scale 16/140, spring pop badge 14/180)
 * 3. Style 2: whiteboard_stream_hand (SRT stream whiteboard, stream clip, real human hand /assets/drawing-hand.png with harmonic wave oscillation sin(6π*prog), SVG black ink filter)
 * 4. Style 3: handdrawn_fast_doodle (Universal ink extraction slope 4.2, 5 multi-path Bézier tracing masks, 135° diagonal watercolor bloom, Ken Burns scale)
 * 5. Style 4: dialogue_scene (Dual conversation avatars, interactive speech bubbles)
 * 6. Style 5: science_explainer (STEM formula, blueprint grid, laser scan line)
 * 7. Style 6: character_animation (Pixar 3D mascot bounce physics)
 *
 * 2-Layer Text Controls (Zero Overlap):
 * - Layer 1: AI Scene Note Card (White handwritten card / summary_text)
 * - Layer 2: Whisper Voice Subtitle (Dark pill / voice_transcript)
 */

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, useRemotion, spring, interpolate } from './RemotionEngine';
import { getModularStyleRenderer } from './styles';

export interface DynamicSceneData {
  scene_id: string | number;
  title: string;
  start_sec?: number;
  end_sec?: number;
  start_frame?: number;
  duration_frames?: number;
  summary_text?: string;
  voice_transcript?: string;
  highlight_keywords?: string[];
  image_url?: string;
  video_url?: string;
  code?: string;
  duration_sec?: number;
  cutout_url?: string;
  bg_url?: string;
  clean_bg_url?: string;
  original_image_url?: string;
  dominant_colors?: string[];
  hook_text?: string;
  headline_text?: string;
  headline_sub?: string;
  price_text?: string;
  motion_intensity?: 'CALM' | 'SUBTLE' | 'ENERGETIC' | 'HYPE' | string;
  entrance_action?: string;
  entrance_delay_sec?: number;
  floating_motion?: string;
  floating_amplitude?: number;
  tilt_deg?: number;
  headline_action?: string;
  headline_delay_sec?: number;
  price_action?: string;
  price_delay_sec?: number;
  outro_duration_sec?: number;
  outro_type?: string;
  objects?: Array<{ id: number; cutout_url: string; label?: string; bounding_box?: number[] }>;
  dialogue_turns?: any[];
  swap_speakers?: boolean;
  bubble_custom_layout?: any;
  spatial_layout?: any;
  annotation?: {
    canvas?: { width: number; height: number };
    elements?: Array<{
      id: string;
      label?: string;
      sequence?: number;
      subtitle?: string;
      region?: { x: number; y: number; width: number; height: number };
      reveal?: { startMs: number; durationMs: number };
    }>;
  };
  hide_text?: boolean;
}

export interface DynamicSceneRendererProps {
  scene: DynamicSceneData;
  visualStyle?: 'handdrawn_fast_doodle' | 'whiteboard_stream_hand' | 'apple_modern_motion' | 'character_animation' | 'tech_ui' | 'dialogue_scene' | 'science_explainer' | 'product_ads_motion' | string;
  showSceneCards?: boolean;
  showWhisperSubs?: boolean;
  cardPosY?: 'top' | 'middle' | 'bottom';
  subsPosY?: 'top' | 'middle' | 'bottom';
  swapSpeakers?: boolean;
  onCardClick?: () => void;
  onSubsClick?: () => void;
}

import { transform } from 'sucrase';

/**
 * Universal Dynamic Code Evaluator for AI-Generated Remotion Components
 * Uses Sucrase for blazing fast in-browser JSX/TSX transpilation
 */
function evaluateDynamicSceneCode(codeStr: string, context: Record<string, any>): React.FC | null {
  try {
    if (!codeStr || typeof codeStr !== 'string') return null;

    // 1. Strip imports and export keywords
    let cleanCode = codeStr
      .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
      .replace(/export\s+default\s+\w+;?/g, '')
      .replace(/export\s+/g, '');

    // 2. Transpile TSX/JSX to executable JavaScript with React.createElement
    const transpiled = transform(cleanCode, {
      transforms: ['jsx', 'typescript'],
      production: true,
    }).code;

    // 3. Execute and retrieve Scene component with all standard React hooks in scope via var
    const runner = new Function(
      'React',
      'interpolate',
      'spring',
      'useCurrentFrame',
      'useVideoConfig',
      'useRemotion',
      `
      var useMemo = React.useMemo;
      var useState = React.useState;
      var useEffect = React.useEffect;
      var useCallback = React.useCallback;
      var useRef = React.useRef;
      var useId = React.useId;
      ${transpiled}
      if (typeof Scene_1 !== 'undefined') return Scene_1;
      if (typeof Scene_2 !== 'undefined') return Scene_2;
      if (typeof Scene_3 !== 'undefined') return Scene_3;
      if (typeof Scene_4 !== 'undefined') return Scene_4;
      if (typeof Scene_5 !== 'undefined') return Scene_5;
      if (typeof Scene_6 !== 'undefined') return Scene_6;
      if (typeof Scene_7 !== 'undefined') return Scene_7;
      if (typeof Scene_8 !== 'undefined') return Scene_8;
      if (typeof Scene_9 !== 'undefined') return Scene_9;
      if (typeof Scene_10 !== 'undefined') return Scene_10;
      if (typeof DynamicSceneComponent !== 'undefined') return DynamicSceneComponent;
      return null;
      `
    );

    return runner(
      React,
      context.interpolate,
      context.spring,
      context.useCurrentFrame,
      context.useVideoConfig,
      context.useRemotion
    );
  } catch (err) {
    console.warn('Dynamic scene code evaluation fallback:', err);
    return null;
  }
}

export const DynamicSceneRenderer: React.FC<DynamicSceneRendererProps> = ({
  scene,
  visualStyle = 'handdrawn_fast_doodle',
  showSceneCards = true,
  showWhisperSubs = true,
  cardPosY = 'middle',
  subsPosY = 'bottom',
  swapSpeakers = false,
  onCardClick,
  onSubsClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const updateSize = () => {
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerSize({ w: rect.width, h: rect.height });
        }
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const { bgColor } = useRemotion();

  const isPortrait = height > width || height === 1920;
  const isSquare = width === height;
  const duration = scene.duration_frames || durationInFrames || 150;

  // Base Virtual Canvas Dimensions (1080p HD Native Coordinates)
  const BASE_WIDTH = isPortrait ? 1080 : isSquare ? 1080 : 1920;
  const BASE_HEIGHT = isPortrait ? 1920 : isSquare ? 1080 : 1080;
  const vbWidth = BASE_WIDTH;
  const vbHeight = BASE_HEIGHT;

  // Exact Uniform Scale Factor computed from actual physical container size on screen
  const currentW = containerSize.w > 0 ? containerSize.w : width;
  const currentH = containerSize.h > 0 ? containerSize.h : height;
  const scale = Math.min(currentW / BASE_WIDTH, currentH / BASE_HEIGHT);

  const isAppleOrTech =
    visualStyle === 'apple_modern_motion' ||
    visualStyle === 'tech_ui' ||
    visualStyle === 'vector_motion';

  const displaySummary = scene.summary_text || scene.voice_transcript || scene.title || 'Nội dung phân cảnh';
  const primaryKeyword = scene.highlight_keywords?.[0] || scene.title || 'WynMotion AI';
  const secondaryKeywords = scene.highlight_keywords?.slice(1, 4) || [];

  // 1. Dialogue scenes use dedicated avatar dialogue renderer
  if (visualStyle === 'dialogue_scene') {
    const ModularRenderer = getModularStyleRenderer(visualStyle);
    if (ModularRenderer) {
      return (
        <ModularRenderer
          scene={scene}
          showSceneCards={showSceneCards}
          showWhisperSubs={showWhisperSubs}
          cardPosY={cardPosY}
          subsPosY={subsPosY}
          swapSpeakers={swapSpeakers}
          onCardClick={onCardClick}
          onSubsClick={onSubsClick}
        />
      );
    }
  }

  // 2. TRY EVALUATING DYNAMIC AI-GENERATED SCENE CODE FIRST
  const EvaluatedComponent = useMemo(() => {
    if (scene.code) {
      return evaluateDynamicSceneCode(scene.code, {
        interpolate,
        spring,
        useCurrentFrame: () => frame,
        useVideoConfig: () => ({ fps, durationInFrames: duration, width: BASE_WIDTH, height: BASE_HEIGHT }),
        useRemotion: () => ({ bgColor: bgColor || '#060B18' }),
      });
    }
    return null;
  }, [scene.code, frame, fps, duration, bgColor, BASE_WIDTH, BASE_HEIGHT]);

  if (EvaluatedComponent) {
    try {
      return (
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: bgColor || '#060B18',
          }}
        >
          <div
            style={{
              width: BASE_WIDTH,
              height: BASE_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <EvaluatedComponent />
          </div>
        </div>
      );
    } catch (e) {
      console.warn('EvaluatedComponent render error:', e);
    }
  }

  // 3. Fallback to Modular Style Pipeline Renderer Registry
  const ModularRenderer = getModularStyleRenderer(visualStyle);
  if (ModularRenderer) {
    return (
      <ModularRenderer
        scene={scene}
        showSceneCards={showSceneCards}
        showWhisperSubs={showWhisperSubs}
        cardPosY={cardPosY}
        subsPosY={subsPosY}
        swapSpeakers={swapSpeakers}
        onCardClick={onCardClick}
        onSubsClick={onSubsClick}
      />
    );
  }

  // Position styles for 2 Layers
  const getCardStyle = (headerSpring: number): React.CSSProperties => {
    if (cardPosY === 'top') {
      return { top: isPortrait ? 24 : 32, left: '50%', transform: `translateX(-50%) scale(${Math.max(0, headerSpring)})` };
    }
    if (cardPosY === 'bottom') {
      return {
        bottom: showWhisperSubs ? (isPortrait ? 68 : 64) : (isPortrait ? 20 : 24),
        left: '50%',
        transform: `translateX(-50%) scale(${Math.max(0, headerSpring)})`,
      };
    }
    return { top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${Math.max(0, headerSpring)})` };
  };

  const getSubsStyle = (): React.CSSProperties => {
    if (subsPosY === 'top') {
      return { top: isPortrait ? 8 : 10, left: '50%', transform: 'translateX(-50%)' };
    }
    if (subsPosY === 'middle') {
      return { top: '65%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    return { bottom: isPortrait ? 8 : isSquare ? 8 : 10, left: '50%', transform: 'translateX(-50%)' };
  };

  // ─────────────────────────────────────────────────────────────
  // STYLE 1: APPLE-STYLE MODERN UI & TECH INFOGRAPHIC
  // ─────────────────────────────────────────────────────────────
  if (isAppleOrTech) {
    const typedCharCount = Math.min(displaySummary.length, Math.floor(frame * 0.75));
    const typedText = displaySummary.slice(0, typedCharCount);
    const showCursor = frame % 20 < 10 && typedCharCount < displaySummary.length;

    const cardScale = spring({
      frame,
      fps,
      config: { damping: 16, stiffness: 140 },
    });

    const popBadge = spring({
      frame: frame - Math.floor(duration * 0.10),
      fps,
      config: { damping: 14, stiffness: 180 },
    });

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#090A10',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "system-ui, -apple-system, 'SF Pro Display', 'Inter', sans-serif",
          overflow: 'hidden',
          position: 'relative',
          userSelect: 'none',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: isPortrait ? 320 : 650,
            height: isPortrait ? 220 : 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 229, 255, 0.18) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 24,
            transform: `scale(${Math.max(0, popBadge)})`,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 30,
            padding: '8px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 20,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00E5FF', boxShadow: '0 0 10px #00E5FF' }} />
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.5, color: '#F1F5F9' }}>
            {primaryKeyword}
          </span>
        </div>

        <div
          style={{
            width: isPortrait ? '90%' : '85%',
            maxWidth: 720,
            transform: `scale(${Math.max(0, cardScale)})`,
            backgroundColor: 'rgba(18, 20, 31, 0.92)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 28,
            padding: isPortrait ? '20px 22px' : '30px 36px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: isPortrait ? 14 : 22,
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10B981' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: 0.5 }}>
              {scene.title}
            </span>
          </div>

          <div style={{ minHeight: isPortrait ? 60 : 90, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: isPortrait ? 16 : 22, fontWeight: 700, lineHeight: 1.45, color: '#FFFFFF', letterSpacing: -0.3 }}>
              {typedText}
              <span style={{ color: '#00E5FF', opacity: showCursor ? 1 : 0, fontWeight: 300 }}>|</span>
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 12,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {secondaryKeywords.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 14,
                    padding: '3px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#94A3B8',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div
              style={{
                backgroundColor: '#00E5FF',
                color: '#090A10',
                fontWeight: 900,
                fontSize: 11,
                padding: '4px 14px',
                borderRadius: 20,
                boxShadow: '0 4px 16px rgba(0,229,255,0.3)',
              }}
            >
              <span>WynRise AI</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STYLE 4: DUAL CHARACTER DIALOGUE SCENE (2 Avatars & Dynamic Speech Bubbles)
  // ─────────────────────────────────────────────────────────────
  if (visualStyle === 'dialogue_scene') {
    const rawTranscript = scene.voice_transcript || displaySummary || '';
    const dialogueLines: Array<{ speaker: 'A' | 'B'; name: string; text: string }> = [];

    const regex = /\[(.*?)\]\s*:\s*([^\[]+)/g;
    let match;
    while ((match = regex.exec(rawTranscript)) !== null) {
      const spName = match[1].trim();
      const spText = match[2].trim();
      const isA = spName.toLowerCase().includes('a') || spName.toLowerCase().includes('sarah') || spName.toLowerCase().includes('trúc') || dialogueLines.length % 2 === 0;
      dialogueLines.push({
        speaker: isA ? 'A' : 'B',
        name: spName || (isA ? 'Nhân vật A' : 'Nhân vật B'),
        text: spText,
      });
    }

    if (dialogueLines.length === 0) {
      const sentences = rawTranscript
        .split(/(?<=[.?!])\s+|\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (sentences.length === 0) {
        dialogueLines.push({ speaker: 'A', name: 'Nhân vật A', text: rawTranscript });
      } else {
        sentences.forEach((st, idx) => {
          const isA = idx % 2 === 0;
          dialogueLines.push({
            speaker: isA ? 'A' : 'B',
            name: isA ? 'Nhân vật A' : 'Nhân vật B',
            text: st,
          });
        });
      }
    }

    const progress = Math.min(1, Math.max(0, frame / Math.max(1, duration)));
    const totalLines = Math.max(1, dialogueLines.length);
    const lineIndex = Math.min(totalLines - 1, Math.floor(progress * totalLines));
    const activeLine = dialogueLines[lineIndex] || dialogueLines[0];
    const isSpeakerA = activeLine.speaker === 'A';

    const bubbleSpring = spring({
      frame: frame % Math.max(1, Math.floor(duration / totalLines)),
      fps,
      config: { damping: 14, stiffness: 150 },
    });

    const floatOffset = Math.sin((frame / fps) * 2 * Math.PI * 0.4) * 5;

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0B0F19',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: "system-ui, -apple-system, 'SF Pro Display', 'Inter', sans-serif",
          overflow: 'hidden',
          position: 'relative',
          userSelect: 'none',
          color: '#FFFFFF',
          padding: isPortrait ? '16px 12px 14px' : '20px 24px 16px',
          boxSizing: 'border-box',
        }}
      >
        {/* Ambient Studio Lighting */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.18) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(168, 85, 247, 0.18) 0%, transparent 50%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* TOP BAR: Scene Title & Dialogue Mode Badge */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 20,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 20,
              padding: isPortrait ? '4px 12px' : '6px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#06B6D4', boxShadow: '0 0 8px #06B6D4' }} />
            <span style={{ fontSize: isPortrait ? 11 : 12, fontWeight: 800, color: '#F1F5F9' }}>
              {scene.title || primaryKeyword}
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: 20,
              padding: isPortrait ? '3px 10px' : '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: isPortrait ? 10 : 11, fontWeight: 800, color: '#C084FC' }}>
              💬 Dialogue Scene
            </span>
          </div>
        </div>

        {/* MIDDLE: 1 High-Quality AI Scene Backdrop Illustration Image */}
        <div
          style={{
            flex: 1,
            width: '100%',
            maxHeight: isPortrait ? '52%' : '58%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10,
            transform: `translateY(${floatOffset}px)`,
            margin: isPortrait ? '8px 0' : '10px 0',
          }}
        >
          {scene.image_url ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: isPortrait ? 20 : 24,
                overflow: 'hidden',
                border: '1.5px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.2)',
                position: 'relative',
                backgroundColor: '#1E293B',
              }}
            >
              <img
                src={scene.image_url}
                alt={scene.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(11, 15, 25, 0.6) 0%, transparent 60%)',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 20,
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1.5px dashed rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 32 }}>🎭</span>
              <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>{displaySummary}</span>
            </div>
          )}
        </div>

        {/* BOTTOM: Dynamic Speech Bubble & Dual Speaker Avatars */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: isPortrait ? 8 : 10,
            zIndex: 30,
            flexShrink: 0,
          }}
        >
          {/* Active Speech Bubble */}
          <div
            style={{
              width: '100%',
              transform: `scale(${Math.max(0, bubbleSpring)})`,
              transformOrigin: isSpeakerA ? 'bottom left' : 'bottom right',
              backgroundColor: isSpeakerA ? 'rgba(8, 51, 68, 0.92)' : 'rgba(59, 7, 100, 0.92)',
              backdropFilter: 'blur(20px)',
              border: isSpeakerA ? '1.5px solid rgba(6, 182, 212, 0.6)' : '1.5px solid rgba(168, 85, 247, 0.6)',
              borderRadius: isPortrait ? 18 : 20,
              padding: isPortrait ? '10px 14px' : '12px 18px',
              boxShadow: isSpeakerA
                ? '0 12px 30px rgba(6, 182, 212, 0.25)'
                : '0 12px 30px rgba(168, 85, 247, 0.25)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 13 }}>{isSpeakerA ? '👩' : '👨'}</span>
              <span
                style={{
                  fontSize: isPortrait ? 11 : 12,
                  fontWeight: 900,
                  color: isSpeakerA ? '#22D3EE' : '#D8B4FE',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {activeLine.name}
              </span>
            </div>
            <div
              style={{
                fontSize: isPortrait ? 13 : 15,
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.35,
              }}
            >
              "{activeLine.text}"
            </div>
          </div>

          {/* Dual Character Avatar Controls */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            {/* Speaker A */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: isPortrait ? '6px 10px' : '8px 14px',
                borderRadius: 16,
                backgroundColor: isSpeakerA ? 'rgba(6, 182, 212, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                border: isSpeakerA ? '1.5px solid #06B6D4' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isSpeakerA ? '0 0 16px rgba(6, 182, 212, 0.4)' : 'none',
                transform: `scale(${isSpeakerA ? 1.03 : 0.97})`,
                opacity: isSpeakerA ? 1 : 0.6,
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: isPortrait ? 28 : 34,
                  height: isPortrait ? 28 : 34,
                  borderRadius: '50%',
                  backgroundColor: '#0891B2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isPortrait ? 14 : 18,
                  boxShadow: isSpeakerA ? '0 0 10px #06B6D4' : 'none',
                }}
              >
                👩
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: isPortrait ? 11 : 12, fontWeight: 900, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {dialogueLines.find((l) => l.speaker === 'A')?.name || 'Nhân vật A'}
                </div>
                <div style={{ fontSize: 9, color: '#67E8F9', fontWeight: 700 }}>
                  {isSpeakerA ? '🎙️ Đang nói...' : 'Lắng nghe'}
                </div>
              </div>
            </div>

            {/* Speaker B */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
                padding: isPortrait ? '6px 10px' : '8px 14px',
                borderRadius: 16,
                backgroundColor: !isSpeakerA ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                border: !isSpeakerA ? '1.5px solid #A855F7' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: !isSpeakerA ? '0 0 16px rgba(168, 85, 247, 0.4)' : 'none',
                transform: `scale(${!isSpeakerA ? 1.03 : 0.97})`,
                opacity: !isSpeakerA ? 1 : 0.6,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ textAlign: 'right', overflow: 'hidden' }}>
                <div style={{ fontSize: isPortrait ? 11 : 12, fontWeight: 900, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {dialogueLines.find((l) => l.speaker === 'B')?.name || 'Nhân vật B'}
                </div>
                <div style={{ fontSize: 9, color: '#C084FC', fontWeight: 700 }}>
                  {!isSpeakerA ? '🎙️ Đang nói...' : 'Lắng nghe'}
                </div>
              </div>
              <div
                style={{
                  width: isPortrait ? 28 : 34,
                  height: isPortrait ? 28 : 34,
                  borderRadius: '50%',
                  backgroundColor: '#9333EA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isPortrait ? 14 : 18,
                  boxShadow: !isSpeakerA ? '0 0 10px #A855F7' : 'none',
                }}
              >
                👨
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STYLE 2: SRT STREAM WHITEBOARD WITH DRAWING HAND & REGION ORCHESTRATION
  // ─────────────────────────────────────────────────────────────
  if (visualStyle === 'whiteboard_stream_hand') {
    const currentMs = (frame / fps) * 1000;
    const sceneTotalMs = (duration / fps) * 1000;

    const canvasW = scene.annotation?.canvas?.width || vbWidth;
    const canvasH = scene.annotation?.canvas?.height || vbHeight;
    const scaleX = vbWidth / canvasW;
    const scaleY = vbHeight / canvasH;

    const rawElements = scene.annotation?.elements && scene.annotation.elements.length > 0
      ? scene.annotation.elements
      : [
          {
            id: 'sec1',
            label: 'Khung cảnh bối cảnh',
            sequence: 1,
            subtitle: scene.voice_transcript || displaySummary,
            region: { x: 0, y: 0, width: canvasW * 0.5, height: canvasH },
            reveal: { startMs: 200, durationMs: Math.max(1500, sceneTotalMs * 0.45) },
          },
          {
            id: 'sec2',
            label: 'Đối tượng trọng tâm',
            sequence: 2,
            subtitle: scene.voice_transcript || displaySummary,
            region: { x: canvasW * 0.45, y: 0, width: canvasW * 0.55, height: canvasH },
            reveal: { startMs: Math.max(1800, sceneTotalMs * 0.45), durationMs: Math.max(1500, sceneTotalMs * 0.45) },
          },
        ];

    const sortedElements = [...rawElements].sort((a, b) => (a.reveal?.startMs || 0) - (b.reveal?.startMs || 0));

    let activePenX = vbWidth / 2;
    let activePenY = vbHeight / 2;
    let isPenActive = false;
    let currentSubtitle = displaySummary;

    sortedElements.forEach((el) => {
      const startMs = el.reveal?.startMs ?? 0;
      const durMs = el.reveal?.durationMs ?? 2500;
      const endMs = startMs + durMs;

      if (currentMs >= startMs && currentMs < endMs) {
        isPenActive = true;
        if (el.subtitle) currentSubtitle = el.subtitle;

        const prog = (currentMs - startMs) / durMs;
        const rx = (el.region?.x || 0) * scaleX;
        const ry = (el.region?.y || 0) * scaleY;
        const rw = (el.region?.width || vbWidth) * scaleX;
        const rh = (el.region?.height || vbHeight) * scaleY;

        // Dynamic hand path oscillation (Fast & fluid handwriting speed)
        const waveX = Math.sin(prog * Math.PI * 12) * 0.35 + 0.5;
        const waveY = Math.cos(prog * Math.PI * 8) * 0.15;
        activePenX = rx + rw * Math.max(0.08, Math.min(0.92, waveX));
        activePenY = ry + rh * Math.max(0.05, Math.min(0.95, prog + waveY));
      } else if (currentMs >= endMs && el.subtitle) {
        currentSubtitle = el.subtitle;
      }
    });

    const headerSpring = spring({
      frame,
      fps,
      config: { damping: 14, stiffness: 120 },
    });

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#F5EBD7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          fontFamily: "'Patrick Hand', 'Caveat', cursive, sans-serif",
          overflow: 'hidden',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Caveat:wght@700&display=swap" />

        {/* Paper Grain & Warm Texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(245, 235, 215, 0.2) 0%, rgba(224, 210, 185, 0.4) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* LAYER 1: Dynamic Handwritten Scene Note Card on Whiteboard */}
        {!scene.hide_text && showSceneCards && (
          <div
            onClick={onCardClick}
            style={{
              position: 'absolute',
              ...getCardStyle(headerSpring),
              width: isPortrait ? '94%' : '92%',
              maxWidth: isPortrait ? 440 : isSquare ? 520 : 880,
              zIndex: 40,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.97)',
                backdropFilter: 'blur(16px)',
                border: '2.5px solid rgba(15, 23, 42, 0.16)',
                borderRadius: isPortrait ? 20 : 24,
                padding: isPortrait ? '10px 20px' : '12px 28px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.16), 0 3px 8px rgba(0,0,0,0.08)',
                textAlign: 'center',
                minHeight: isPortrait ? 44 : 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: '100%',
              }}
            >
              <span
                style={{
                  fontFamily: "'Patrick Hand', 'Caveat', cursive, sans-serif",
                  fontSize: isPortrait ? 20 : isSquare ? 22 : 26,
                  fontWeight: 800,
                  color: '#0F172A',
                  lineHeight: 1.34,
                  letterSpacing: 0.3,
                }}
              >
                {currentSubtitle}
              </span>
            </div>
          </div>
        )}

        {/* LAYER 2: Modern Voice Subtitles (Whisper Speech-Aligned Bar) */}
        {showWhisperSubs && (scene.voice_transcript || displaySummary) && (
          <div
            onClick={onSubsClick}
            style={{
              position: 'absolute',
              ...getSubsStyle(),
              width: 'auto',
              maxWidth: isPortrait ? '90%' : '80%',
              zIndex: 45,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 999,
                padding: isPortrait ? '4px 14px' : '6px 18px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: isPortrait ? 12 : 14,
                  fontWeight: 700,
                  color: '#F8FAFC',
                  lineHeight: 1.3,
                  letterSpacing: 0.2,
                }}
              >
                {scene.voice_transcript || displaySummary}
              </span>
            </div>
          </div>
        )}

        {/* Main Canvas Drawing Stage */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            paddingBottom: (!scene.hide_text && showSceneCards) ? (isPortrait ? 56 : 56) : 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {scene.video_url ? (
            /* PRE-RENDERED OPENCV ZHANG-SUEN STREAM VIDEO CLIP (100% EXACT TO BACKEND OPENCV) */
            <video
              key={scene.video_url}
              src={scene.video_url}
              style={{
                width: '100%',
                height: '100%',
                objectFit: isPortrait ? 'contain' : 'cover',
                backgroundColor: '#F5EBD7',
              }}
              autoPlay
              muted
              loop
              playsInline
              ref={(el) => {
                if (el) {
                  const targetTime = frame / fps;
                  if (Math.abs(el.currentTime - targetTime) > 0.3) {
                    el.currentTime = targetTime;
                  }
                  if (el.paused) {
                    el.play().catch(() => {});
                  }
                }
              }}
            />
          ) : scene.image_url ? (
            <svg viewBox={`0 0 ${vbWidth} ${vbHeight}`} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
              <defs>
                {/* 1. BLACK INK EXTRACTION FILTER FOR WARM PAPER */}
                <filter id={`inkStreamFilter_${scene.scene_id}`} x="0%" y="0%" width="100%" height="100%">
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
                <clipPath id={`streamClip_${scene.scene_id}`}>
                  {sortedElements.map((el, i) => {
                    const startMs = el.reveal?.startMs ?? 0;
                    const durMs = el.reveal?.durationMs ?? 2500;
                    const rx = (el.region?.x || 0) * scaleX;
                    const ry = (el.region?.y || 0) * scaleY;
                    const rw = (el.region?.width || vbWidth) * scaleX;
                    const rh = (el.region?.height || vbHeight) * scaleY;

                    if (currentMs < startMs) return null;
                    if (currentMs >= startMs + durMs) {
                      return <rect key={i} x={rx} y={ry} width={rw} height={rh} rx={6} />;
                    }
                    const prog = Math.min(1, Math.max(0, (currentMs - startMs) / durMs));
                    return <rect key={i} x={rx} y={ry} width={rw} height={rh * prog} rx={6} />;
                  })}
                </clipPath>
              </defs>

              {/* Background Paper Rect */}
              <rect width={vbWidth} height={vbHeight} fill="#F5EBD7" />

              {/* Layer 1: Ink Line Drawing */}
              <g clipPath={`url(#streamClip_${scene.scene_id})`}>
                <image
                  href={scene.image_url}
                  width={vbWidth}
                  height={vbHeight}
                  preserveAspectRatio={isPortrait ? 'xMidYMid meet' : 'xMidYMid slice'}
                  filter={`url(#inkStreamFilter_${scene.scene_id})`}
                  opacity={0.95}
                />
              </g>

              {/* Layer 2: Colored Artwork Reveal (Follows Ink after 60% progress) */}
              {sortedElements.map((el, i) => {
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
                    <clipPath id={`elemColorClip_${scene.scene_id}_${i}`}>
                      <rect x={rx} y={ry} width={rw} height={rh * colorProg} rx={6} />
                    </clipPath>
                    <g clipPath={`url(#elemColorClip_${scene.scene_id}_${i})`}>
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

              {/* PROPORTIONAL SVG DRAWING HAND (SCALES 100% PERFECTLY WITH CANVAS) */}
              {isPenActive && (
                <g
                  transform={`translate(${activePenX}, ${activePenY}) rotate(${Math.sin(frame * 1.2) * 3.5})`}
                  style={{ pointerEvents: 'none' }}
                >
                  <image
                    href="/assets/drawing-hand.png"
                    x={-35}
                    y={-35}
                    width={isPortrait ? 260 : 320}
                    height={isPortrait ? 260 : 320}
                    preserveAspectRatio="xMidYMid meet"
                    style={{
                      filter: 'drop-shadow(0 14px 20px rgba(50, 30, 10, 0.4))',
                    }}
                  />
                </g>
              )}
            </svg>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F5EBD7',
                color: '#2C1D11',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 12 }}>🖋️</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{scene.title}</div>
              <div style={{ fontSize: 14, color: '#78552D', marginTop: 6, maxWidth: 500 }}>{displaySummary}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STYLE 3: UNIVERSAL WHITEBOARD INK EXTRACTION & PROGRESSIVE CONTOUR TRACING
  // ─────────────────────────────────────────────────────────────
  const typewriterFrames = Math.min(fps * 2, Math.max(30, Math.floor(duration * 0.30)));
  const typedCharCount = Math.min(
    displaySummary.length,
    Math.floor(interpolate(frame, [0, typewriterFrames], [0, displaySummary.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }))
  );
  const typedText = displaySummary.slice(0, typedCharCount);
  const showCursor = frame < typewriterFrames + 18 && Math.floor(frame / 6) % 2 === 0;

  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const fillStart = Math.floor(duration * 0.28);
  const fillEnd = Math.floor(duration * 0.65);

  const colorSpread = interpolate(frame, [fillStart, fillEnd], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const colorSaturation = interpolate(frame, [fillStart, fillEnd], [0.05, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const kenBurnsScale = interpolate(frame, [0, duration], [1.0, 1.04], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor || '#FAF7EF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontFamily: "'Patrick Hand', 'Caveat', cursive, sans-serif",
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Caveat:wght@700&display=swap" />

      {/* LAYER 1: Dynamic Scene Note Card on Whiteboard */}
      {!scene.hide_text && showSceneCards && (
        <div
          onClick={onCardClick}
          style={{
            position: 'absolute',
            ...getCardStyle(headerSpring),
            width: isPortrait ? '90%' : '92%',
            maxWidth: isPortrait ? 380 : isSquare ? 460 : 820,
            zIndex: 30,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(16px)',
              border: '2px solid rgba(15, 23, 42, 0.12)',
              borderRadius: isPortrait ? 16 : 20,
              padding: isPortrait ? '8px 16px' : '10px 22px',
              boxShadow: '0 10px 28px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
              textAlign: 'center',
              minHeight: isPortrait ? 38 : 46,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '100%',
            }}
          >
            <span
              style={{
                fontSize: isPortrait ? 16 : isSquare ? 17 : 21,
                fontWeight: 800,
                color: '#0F172A',
                lineHeight: 1.32,
                letterSpacing: 0.2,
              }}
            >
              {typedText}
              {showCursor && (
                <span style={{ color: '#0EA5E9', fontWeight: 900, marginLeft: 3, fontSize: isPortrait ? 18 : 22 }}>|</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* LAYER 2: Modern Voice Subtitles */}
      {showWhisperSubs && (scene.voice_transcript || displaySummary) && (
        <div
          onClick={onSubsClick}
          style={{
            position: 'absolute',
            ...getSubsStyle(),
            width: 'auto',
            maxWidth: isPortrait ? '90%' : '80%',
            zIndex: 35,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 999,
              padding: isPortrait ? '4px 14px' : '6px 18px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: isPortrait ? 12 : 14,
                fontWeight: 700,
                color: '#F8FAFC',
                lineHeight: 1.3,
                letterSpacing: 0.2,
              }}
            >
              {scene.voice_transcript || displaySummary}
            </span>
          </div>
        </div>
      )}

      {/* Main Dynamic Stage with Bottom Offset for Captions */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          paddingBottom: (!scene.hide_text && showSceneCards) ? (isPortrait ? 56 : 56) : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transform: `scale(${kenBurnsScale})`,
        }}
      >
        {scene.image_url ? (
          <svg viewBox={`0 0 ${vbWidth} ${vbHeight}`} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <defs>
              {/* 1. BLACK INK EXTRACTION FILTER */}
              <filter id={`inkExtractFilter_${scene.scene_id}`} x="0%" y="0%" width="100%" height="100%">
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

              {/* 2. PROGRESSIVE MULTI-PATH CONTOUR TRACING MASK */}
              <mask id={`contourTracingMask_${scene.scene_id}`}>
                <rect width={vbWidth} height={vbHeight} fill="black" />
                <g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round">
                  {/* Top Wave (0% -> 18%) */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <path
                      key={`top_stroke_${i}`}
                      d={`M ${(80 * vbWidth) / 1920} ${((60 + i * 36) * vbHeight) / 1080} Q ${(960 * vbWidth) / 1920} ${((40 + i * 36) * vbHeight) / 1080} ${(1840 * vbWidth) / 1920} ${((60 + i * 36) * vbHeight) / 1080}`}
                      strokeWidth={isPortrait ? '34' : '42'}
                      strokeDasharray="2200"
                      strokeDashoffset={interpolate(
                        frame,
                        [Math.floor(duration * 0.0 + i * 1.2), Math.floor(duration * 0.18 + i * 1.2)],
                        [2200, 0],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                      )}
                    />
                  ))}

                  {/* Left Sector (4% -> 28%) */}
                  {Array.from({ length: 15 }).map((_, i) => (
                    <path
                      key={`left_stroke_${i}`}
                      d={`M ${(60 * vbWidth) / 1920} ${((260 + i * 50) * vbHeight) / 1080} C ${(250 * vbWidth) / 1920} ${((220 + i * 50) * vbHeight) / 1080} ${(450 * vbWidth) / 1920} ${((300 + i * 50) * vbHeight) / 1080} ${(680 * vbWidth) / 1920} ${((260 + i * 50) * vbHeight) / 1080}`}
                      strokeWidth={isPortrait ? '44' : '56'}
                      strokeDasharray="1300"
                      strokeDashoffset={interpolate(
                        frame,
                        [Math.floor(duration * 0.04 + (i % 5) * 1.5), Math.floor(duration * 0.28 + (i % 5) * 1.5)],
                        [1300, 0],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                      )}
                    />
                  ))}

                  {/* Center Flow (10% -> 32%) */}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <path
                      key={`mid_stroke_${i}`}
                      d={`M ${(650 * vbWidth) / 1920} ${((320 + i * 46) * vbHeight) / 1080} Q ${(960 * vbWidth) / 1920} ${((260 + i * 46) * vbHeight) / 1080} ${(1280 * vbWidth) / 1920} ${((340 + i * 46) * vbHeight) / 1080}`}
                      strokeWidth={isPortrait ? '42' : '52'}
                      strokeDasharray="1400"
                      strokeDashoffset={interpolate(
                        frame,
                        [Math.floor(duration * 0.10 + (i % 4) * 1.8), Math.floor(duration * 0.32 + (i % 4) * 1.8)],
                        [1400, 0],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                      )}
                    />
                  ))}

                  {/* Right Sector (8% -> 34%) */}
                  {Array.from({ length: 15 }).map((_, i) => (
                    <path
                      key={`right_stroke_${i}`}
                      d={`M ${(1250 * vbWidth) / 1920} ${((250 + i * 52) * vbHeight) / 1080} C ${(1450 * vbWidth) / 1920} ${((210 + i * 52) * vbHeight) / 1080} ${(1650 * vbWidth) / 1920} ${((290 + i * 52) * vbHeight) / 1080} ${(1860 * vbWidth) / 1920} ${((250 + i * 52) * vbHeight) / 1080}`}
                      strokeWidth={isPortrait ? '46' : '58'}
                      strokeDasharray="1300"
                      strokeDashoffset={interpolate(
                        frame,
                        [Math.floor(duration * 0.08 + (i % 5) * 1.8), Math.floor(duration * 0.34 + (i % 5) * 1.8)],
                        [1300, 0],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                      )}
                    />
                  ))}

                  {/* Crosshatch Fine Detailing (18% -> 38%) */}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <line
                      key={`diag_stroke_${i}`}
                      x1={(i * 150 * vbWidth) / 1920}
                      y1="0"
                      x2={((i * 150 + 400) * vbWidth) / 1920}
                      y2={vbHeight}
                      strokeWidth={isPortrait ? '52' : '68'}
                      strokeDasharray="1600"
                      strokeDashoffset={interpolate(
                        frame,
                        [Math.floor(duration * 0.18 + (i % 4) * 1.4), Math.floor(duration * 0.38 + (i % 4) * 1.4)],
                        [1600, 0],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                      )}
                    />
                  ))}
                </g>
              </mask>

              {/* 3. 135-DEG DIAGONAL WATERCOLOR BLOOM MASK (28% -> 65%) */}
              <linearGradient id={`colorSpreadGrad_${scene.scene_id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset={`${Math.max(0, colorSpread - 20)}%`} stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset={`${colorSpread}%`} stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset={`${Math.min(100, colorSpread + 22)}%`} stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
              <mask id={`colorBloomMask_${scene.scene_id}`}>
                <rect width={vbWidth} height={vbHeight} fill={`url(#colorSpreadGrad_${scene.scene_id})`} />
              </mask>
            </defs>

            {/* Background Canvas */}
            <rect width={vbWidth} height={vbHeight} fill={bgColor || '#FAF7EF'} />

            {/* LAYER 1: ONLY BLACK INK LINES */}
            <image
              href={scene.image_url}
              width={vbWidth}
              height={vbHeight}
              preserveAspectRatio={isPortrait ? 'xMidYMid meet' : 'xMidYMid slice'}
              filter={`url(#inkExtractFilter_${scene.scene_id})`}
              mask={`url(#contourTracingMask_${scene.scene_id})`}
            />

            {/* LAYER 2: 135-DEG WATERCOLOR BLOOM */}
            <g mask={`url(#colorBloomMask_${scene.scene_id})`}>
              <image
                href={scene.image_url}
                width={vbWidth}
                height={vbHeight}
                preserveAspectRatio={isPortrait ? 'xMidYMid meet' : 'xMidYMid slice'}
                filter={`saturate(${colorSaturation})`}
                opacity={interpolate(frame, [fillStart, fillEnd], [0.1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
              />
            </g>
          </svg>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: bgColor || '#FAF7EF',
              color: '#1E293B',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎨</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{scene.title}</div>
            <div style={{ fontSize: 14, color: '#64748B', marginTop: 6, maxWidth: 500 }}>{displaySummary}</div>
          </div>
        )}
      </div>
    </div>
  );
};
