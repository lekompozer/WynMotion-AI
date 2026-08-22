'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface StyleRendererProps {
  scene: DynamicSceneData;
  showSceneCards?: boolean;
  showWhisperSubs?: boolean;
  cardPosY?: 'top' | 'middle' | 'bottom';
  subsPosY?: 'top' | 'middle' | 'bottom';
  onCardClick?: () => void;
  onSubsClick?: () => void;
}

export const DialogueSceneRenderer: React.FC<StyleRendererProps> = ({
  scene,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = height > width || height === 1920;
  const isSquare = width === height;
  const duration = scene.duration_frames || (scene.duration_sec ? Math.round(scene.duration_sec * fps) : 150);
  const displaySummary = scene.summary_text || scene.voice_transcript || scene.title || 'Dialogue';

  // 1. Parse dialogue turns from transcript
  const rawTranscript = scene.voice_transcript || displaySummary || '';
  const dialogueLines: Array<{ speaker: 'A' | 'B'; name: string; text: string }> = [];

  const regex = /\[(.*?)\]\s*:\s*([^\[]+)/g;
  let match;
  while ((match = regex.exec(rawTranscript)) !== null) {
    const spName = match[1].trim();
    const spText = match[2].trim();
    const isA =
      spName.toLowerCase().includes('a') ||
      spName.toLowerCase().includes('sarah') ||
      spName.toLowerCase().includes('trúc') ||
      dialogueLines.length % 2 === 0;
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

  // Spring animation for speech bubble entrance
  const lineFrameDuration = Math.max(1, Math.floor(duration / totalLines));
  const currentLineLocalFrame = frame % lineFrameDuration;
  const bubbleScale = spring({
    frame: currentLineLocalFrame,
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  // Subtle breathing Ken Burns zoom for background
  const kenBurns = interpolate(frame, [0, duration], [1.0, 1.03], {
    extrapolateRight: 'clamp',
  });

  // Typewriter streaming text animation synced with line duration
  const fullText = activeLine.text;
  const textTypingProgress = Math.min(
    1,
    Math.max(0, (currentLineLocalFrame - 4) / Math.max(1, lineFrameDuration * 0.82))
  );
  const revealedCharCount = Math.floor(textTypingProgress * fullText.length);
  const revealedText = fullText.slice(0, revealedCharCount);
  const unrevealedText = fullText.slice(revealedCharCount);
  const isTyping = textTypingProgress < 1 && revealedCharCount > 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0F172A',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 1. FULL-BLEED SCENE BACKDROP IMAGE (1 Single Continuous Illustration) */}
      {scene.image_url ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          <img
            src={scene.image_url}
            alt={scene.title || 'Dialogue Scene'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${kenBurns})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s linear',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: 40 }}>🎭</span>
        </div>
      )}

      {/* 2. UNIFIED COMIC SPEECH BUBBLE OVERLAY */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          pointerEvents: 'none',
          padding: isPortrait ? '24px 16px' : isSquare ? '28px 24px' : '36px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isPortrait ? 'flex-end' : 'center',
          alignItems: isSpeakerA ? 'flex-start' : 'flex-end',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: isPortrait ? '85%' : '52%',
            transform: `scale(${Math.max(0, bubbleScale)})`,
            transformOrigin: isSpeakerA ? 'bottom left' : 'bottom right',
            backgroundColor: '#FFFFFF',
            borderRadius: isPortrait ? 20 : 24,
            padding: isPortrait ? '14px 18px' : '18px 26px',
            boxShadow:
              '0 16px 36px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            border: '2.5px solid #0F172A',
            position: 'relative',
            marginBottom: isPortrait ? 24 : 0,
            marginTop: isPortrait ? 0 : 40,
            transition: 'all 0.15s ease-out',
          }}
        >
          {/* Comic Tail */}
          <div
            style={{
              position: 'absolute',
              bottom: -14,
              [isSpeakerA ? 'left' : 'right']: isPortrait ? 24 : 36,
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '14px solid #0F172A',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -11,
              [isSpeakerA ? 'left' : 'right']: isPortrait ? 25 : 37,
              width: 0,
              height: 0,
              borderLeft: '11px solid transparent',
              borderRight: '11px solid transparent',
              borderTop: '13px solid #FFFFFF',
            }}
          />

          {/* Dialogue Text with Live Streaming Typewriter Animation */}
          <div
            style={{
              fontSize: isPortrait ? 17 : isSquare ? 20 : 22,
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.35,
              fontFamily:
                "system-ui, -apple-system, 'SF Pro Rounded', 'Nunito', 'Segoe UI', sans-serif",
              letterSpacing: -0.3,
              wordBreak: 'break-word',
            }}
          >
            <span>{revealedText}</span>
            {isTyping && (
              <span
                style={{
                  display: 'inline-block',
                  width: 2.5,
                  height: '0.9em',
                  backgroundColor: '#0284C7',
                  marginLeft: 2,
                  verticalAlign: 'middle',
                  opacity: frame % 8 < 5 ? 1 : 0,
                }}
              />
            )}
            {/* Invisible ghost text prevents bubble jitter/resizing */}
            <span style={{ opacity: 0 }}>{unrevealedText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
