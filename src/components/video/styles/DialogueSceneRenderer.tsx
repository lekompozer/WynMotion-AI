'use client';

import React, { useMemo } from 'react';
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

interface DialogueTurnItem {
  id: string;
  speaker: 'A' | 'B';
  name: string;
  text: string;
  startSec: number;
  endSec: number;
}

export const DialogueSceneRenderer: React.FC<StyleRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = height > width || height === 1920;
  const isSquare = width === height;
  const totalDurationSec = scene.duration_sec || (scene.duration_frames ? scene.duration_frames / fps : 30);
  const totalFrames = scene.duration_frames || Math.round(totalDurationSec * fps);
  const currentTimeSec = frame / fps;

  // 1. Parse dialogue turns and construct timing timeline
  const dialogueTurns: DialogueTurnItem[] = useMemo(() => {
    const rawTranscript = scene.voice_transcript || scene.summary_text || scene.title || '';
    const rawTurns: Array<{ speaker: 'A' | 'B'; name: string; text: string }> = [];

    // Parse [Speaker]: text patterns
    const regex = /\[(.*?)\]\s*:\s*([^\[]+)/g;
    let match;
    while ((match = regex.exec(rawTranscript)) !== null) {
      const spName = match[1].trim();
      const spText = match[2].trim();
      const isA =
        spName.toLowerCase().includes('a') ||
        spName.toLowerCase().includes('sarah') ||
        spName.toLowerCase().includes('trúc') ||
        spName.toLowerCase().includes('bella') ||
        rawTurns.length % 2 === 0;
      rawTurns.push({
        speaker: isA ? 'A' : 'B',
        name: spName || (isA ? 'Nhân vật A' : 'Nhân vật B'),
        text: spText,
      });
    }

    if (rawTurns.length === 0) {
      const sentences = rawTranscript
        .split(/(?<=[.?!])\s+|\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (sentences.length === 0) {
        rawTurns.push({ speaker: 'A', name: 'Nhân vật A', text: rawTranscript });
      } else {
        sentences.forEach((st, idx) => {
          const isA = idx % 2 === 0;
          rawTurns.push({
            speaker: isA ? 'A' : 'B',
            name: isA ? 'Nhân vật A' : 'Nhân vật B',
            text: st,
          });
        });
      }
    }

    // Distribute time slices across turns matching totalDurationSec
    const turnCount = Math.max(1, rawTurns.length);
    const avgTurnDur = totalDurationSec / turnCount;

    return rawTurns.map((turn, idx) => ({
      id: `turn-${idx}`,
      speaker: turn.speaker,
      name: turn.name,
      text: turn.text,
      startSec: idx * avgTurnDur,
      endSec: (idx + 1) * avgTurnDur,
    }));
  }, [scene.voice_transcript, scene.summary_text, scene.title, totalDurationSec]);

  // 2. Identify active dialogue turn for the current second
  const activeTurnIndex = useMemo(() => {
    const idx = dialogueTurns.findIndex(
      (t) => currentTimeSec >= t.startSec && currentTimeSec <= t.endSec
    );
    if (idx !== -1) return idx;
    if (currentTimeSec > dialogueTurns[dialogueTurns.length - 1]?.endSec) {
      return dialogueTurns.length - 1;
    }
    return 0;
  }, [dialogueTurns, currentTimeSec]);

  const activeTurn = dialogueTurns[activeTurnIndex] || dialogueTurns[0];
  const isSpeakerA = activeTurn.speaker === 'A';

  // 3. Local frame inside current turn for spring animation
  const turnStartFrame = Math.round(activeTurn.startSec * fps);
  const turnDurationFrames = Math.max(1, Math.round((activeTurn.endSec - activeTurn.startSec) * fps));
  const turnLocalFrame = Math.max(0, frame - turnStartFrame);

  // Spring entrance pop when turn starts
  const bubbleScale = spring({
    frame: turnLocalFrame,
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  // Subtle breathing Ken Burns zoom for background
  const kenBurns = interpolate(frame, [0, totalFrames], [1.0, 1.03], {
    extrapolateRight: 'clamp',
  });

  // 4. Typewriter streaming text animation synced with speaking rate
  const fullText = activeTurn.text;
  const turnTypingProgress = Math.min(
    1,
    Math.max(0, (turnLocalFrame - 3) / Math.max(1, turnDurationFrames * 0.85))
  );
  const revealedCharCount = Math.floor(turnTypingProgress * fullText.length);
  const revealedText = fullText.slice(0, revealedCharCount);
  const unrevealedText = fullText.slice(revealedCharCount);
  const isTyping = turnTypingProgress < 1 && revealedCharCount > 0;

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
      {/* 1. FULL-BLEED SCENE BACKDROP (1 Single Continuous Illustration) */}
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

      {/* 2. DYNAMIC ALTERNATING SPEECH BUBBLE (Left for Speaker A, Right for Speaker B) */}
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
            maxWidth: isPortrait ? '82%' : '50%',
            transform: `scale(${Math.max(0, bubbleScale)})`,
            transformOrigin: isSpeakerA ? 'bottom left' : 'bottom right',
            backgroundColor: '#FFFFFF',
            borderRadius: isPortrait ? 20 : 24,
            padding: isPortrait ? '14px 18px' : '18px 26px',
            boxShadow:
              '0 16px 36px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            border: '2.5px solid #0F172A',
            position: 'relative',
            marginBottom: isPortrait ? 28 : 0,
            marginTop: isPortrait ? 0 : 40,
            marginLeft: isSpeakerA ? (isPortrait ? 8 : 24) : 0,
            marginRight: !isSpeakerA ? (isPortrait ? 8 : 24) : 0,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Speaker Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 8,
              backgroundColor: isSpeakerA ? '#EFF6FF' : '#FFF1F2',
              color: isSpeakerA ? '#1D4ED8' : '#BE123C',
              fontSize: isPortrait ? 11 : 12,
              fontWeight: 800,
              marginBottom: 6,
              border: `1px solid ${isSpeakerA ? '#BFDBFE' : '#FECDD3'}`,
            }}
          >
            <span>{isSpeakerA ? '🗣️' : '💬'}</span>
            <span>{activeTurn.name}</span>
          </div>

          {/* Comic Tail pointing down to speaker character */}
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
              fontSize: isPortrait ? 16 : isSquare ? 19 : 21,
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.35,
              fontFamily:
                "system-ui, -apple-system, 'SF Pro Rounded', 'Nunito', 'Segoe UI', sans-serif",
              letterSpacing: -0.2,
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
                  backgroundColor: isSpeakerA ? '#0284C7' : '#E11D48',
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

