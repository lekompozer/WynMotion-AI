'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface DialogueSceneRendererProps {
  scene: DynamicSceneData;
  showSceneCards?: boolean;
  showWhisperSubs?: boolean;
  cardPosY?: 'top' | 'middle' | 'bottom';
  subsPosY?: 'top' | 'middle' | 'bottom';
  swapSpeakers?: boolean;
  onCardClick?: () => void;
  onSubsClick?: () => void;
}

export type StyleRendererProps = DialogueSceneRendererProps;

interface SentenceMicroTurn {
  id: string;
  turnIndex: number;
  speaker: 'A' | 'B';
  name: string;
  sentenceText: string;
  startSec: number;
  endSec: number;
}

export const DialogueSceneRenderer: React.FC<DialogueSceneRendererProps> = ({
  scene,
  cardPosY = 'top',
  swapSpeakers = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = height > width || height === 1920;
  const isSquare = width === height;
  const totalDurationSec = scene.duration_sec || (scene.duration_frames ? scene.duration_frames / fps : 30);
  const totalFrames = scene.duration_frames || Math.round(totalDurationSec * fps);
  const currentTimeSec = frame / fps;

  // 1. Parse dialogue turns into compact sentence-level micro-turns
  const sentenceTurns: SentenceMicroTurn[] = useMemo(() => {
    // 1A. Get raw base turns
    let baseTurns: Array<{ speaker: 'A' | 'B'; name: string; text: string; startSec?: number; endSec?: number }> = [];

    if (scene.dialogue_turns && Array.isArray(scene.dialogue_turns) && scene.dialogue_turns.length > 0) {
      const turnCount = scene.dialogue_turns.length;
      const avgTurnDur = totalDurationSec / turnCount;
      baseTurns = scene.dialogue_turns.map((dt: any, idx: number) => {
        const isA = dt.speaker === 'A' || dt.speaker === 'speaker_a' || idx % 2 === 0;
        return {
          speaker: (isA ? 'A' : 'B') as 'A' | 'B',
          name: dt.name || (isA ? 'Nhân vật A' : 'Nhân vật B'),
          text: dt.text || dt.content || '',
          startSec: typeof dt.start_sec === 'number' ? dt.start_sec : idx * avgTurnDur,
          endSec: typeof dt.end_sec === 'number' ? dt.end_sec : (idx + 1) * avgTurnDur,
        };
      });
    } else {
      const rawTranscript = scene.voice_transcript || scene.summary_text || scene.title || '';
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
          baseTurns.length % 2 === 0;
        baseTurns.push({
          speaker: isA ? 'A' : 'B',
          name: spName || (isA ? 'Nhân vật A' : 'Nhân vật B'),
          text: spText,
        });
      }

      if (baseTurns.length === 0) {
        const sentences = rawTranscript
          .split(/(?<=[.?!])\s+|\n+/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (sentences.length === 0) {
          baseTurns.push({ speaker: 'A', name: 'Nhân vật A', text: rawTranscript });
        } else {
          sentences.forEach((st, idx) => {
            const isA = idx % 2 === 0;
            baseTurns.push({
              speaker: isA ? 'A' : 'B',
              name: isA ? 'Nhân vật A' : 'Nhân vật B',
              text: st,
            });
          });
        }
      }

      const turnCount = Math.max(1, baseTurns.length);
      const avgTurnDur = totalDurationSec / turnCount;
      baseTurns = baseTurns.map((turn, idx) => ({
        ...turn,
        startSec: idx * avgTurnDur,
        endSec: (idx + 1) * avgTurnDur,
      }));
    }

    // 1B. Split each turn into short sentences for compact bubble display
    const result: SentenceMicroTurn[] = [];
    baseTurns.forEach((t, tIdx) => {
      const rawSentences = t.text
        .split(/(?<=[.?!;:\n])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const sentences = rawSentences.length > 0 ? rawSentences : [t.text];
      const tStart = t.startSec ?? 0;
      const tEnd = t.endSec ?? totalDurationSec;
      const tDur = Math.max(0.5, tEnd - tStart);

      const totalChars = sentences.reduce((acc, s) => acc + Math.max(1, s.length), 0);
      let curSec = tStart;

      sentences.forEach((sent, sIdx) => {
        const weight = Math.max(1, sent.length) / totalChars;
        const sentDur = sIdx === sentences.length - 1 ? (tEnd - curSec) : (tDur * weight);
        const nextSec = curSec + sentDur;

        result.push({
          id: `t${tIdx}-s${sIdx}`,
          turnIndex: tIdx,
          speaker: t.speaker,
          name: t.name,
          sentenceText: sent,
          startSec: curSec,
          endSec: Math.max(curSec + 0.5, nextSec),
        });

        curSec = nextSec;
      });
    });

    return result;
  }, [scene.dialogue_turns, scene.voice_transcript, scene.summary_text, scene.title, totalDurationSec]);

  // 2. Identify active sentence micro-turn
  const activeSentenceIndex = useMemo(() => {
    const idx = sentenceTurns.findIndex(
      (s) => currentTimeSec >= s.startSec && currentTimeSec <= s.endSec
    );
    if (idx !== -1) return idx;
    if (currentTimeSec > sentenceTurns[sentenceTurns.length - 1]?.endSec) {
      return sentenceTurns.length - 1;
    }
    return 0;
  }, [sentenceTurns, currentTimeSec]);

  const activeSentence = sentenceTurns[activeSentenceIndex] || sentenceTurns[0];
  const isSpeakerA = activeSentence?.speaker === 'A';

  // 3. Turn-level frame for single spring entrance per turn (Bubble stays completely stable across sentences in same turn)
  const currentTurnSentences = useMemo(() => {
    if (!activeSentence) return [];
    return sentenceTurns.filter((s) => s.turnIndex === activeSentence.turnIndex);
  }, [sentenceTurns, activeSentence]);

  const turnStartSec = currentTurnSentences[0]?.startSec ?? activeSentence?.startSec ?? 0;
  const turnStartFrame = Math.round(turnStartSec * fps);
  const turnLocalFrame = Math.max(0, frame - turnStartFrame);

  // Spring entrance pop happens ONLY once at the start of the speaker's turn
  const bubbleScale = spring({
    frame: turnLocalFrame,
    fps,
    config: { damping: 18, stiffness: 220 },
  });

  // Sentence-level subtle fade for smooth text transition without bubble movement
  const sentenceStartFrame = Math.round((activeSentence?.startSec || 0) * fps);
  const sentenceLocalFrame = Math.max(0, frame - sentenceStartFrame);
  const textOpacity = interpolate(sentenceLocalFrame, [0, 3], [0.2, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtle Ken Burns zoom
  const kenBurns = interpolate(frame, [0, totalFrames], [1.0, 1.025], {
    extrapolateRight: 'clamp',
  });

  // 4. Instant full sentence text display (Clean & elegant without character streaming)
  const fullText = activeSentence?.sentenceText || '';

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
      {/* 1. FULL-BLEED SCENE BACKDROP (100% Edge-to-Edge Illustration) */}
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
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${kenBurns})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s linear',
              pointerEvents: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
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

      {/* 2. 2D TAIL-ANCHORED SPEECH BUBBLE (Tail Tip Fixed to Character Head) */}
      {(() => {
        const isFlipped = swapSpeakers ?? (scene as any).swap_speakers ?? false;
        const effectiveIsA = isFlipped ? !isSpeakerA : isSpeakerA;
        const customLayout = (scene as any).bubble_custom_layout || {};

        // Speaker-specific Theme
        const defaultBgA = customLayout.bgColorA || '#132644';
        const defaultBgB = customLayout.bgColorB || '#1E392A';
        const defaultTextA = customLayout.textColorA || '#FFFFFF';
        const defaultTextB = customLayout.textColorB || '#FFFFFF';

        const bubbleBg = effectiveIsA ? defaultBgA : defaultBgB;
        const textColor = effectiveIsA ? defaultTextA : defaultTextB;
        const isLeftTail = effectiveIsA;

        // 2D Anchor Positioning (Tail tip fixed point)
        const defaultPosXA = isPortrait ? 36 : 28;
        const defaultPosYA = isPortrait ? 30 : 34;
        const defaultPosXB = isPortrait ? 64 : 72;
        const defaultPosYB = isPortrait ? 30 : 34;

        const posX = effectiveIsA
          ? (customLayout.customPosXA ?? defaultPosXA)
          : (customLayout.customPosXB ?? defaultPosXB);

        const posY = effectiveIsA
          ? (customLayout.customPosYA ?? customLayout.customTopPctA ?? customLayout.customTopPct ?? defaultPosYA)
          : (customLayout.customPosYB ?? customLayout.customTopPctB ?? customLayout.customTopPct ?? defaultPosYB);

        const widthPct = customLayout.customWidthPct || (isPortrait ? 82 : 48);
        const dynamicFontSize = customLayout.fontSize || (isPortrait ? 14 : isSquare ? 15 : 16);

        return (
          <div
            style={{
              position: 'absolute',
              top: `${posY}%`,
              left: `${posX}%`,
              width: `${widthPct}%`,
              maxWidth: isPortrait ? 440 : 640,
              // Anchor speech bubble at the tail tip (expands upwards so character is never covered)
              transform: `translate(${isLeftTail ? -20 : -80}%, -100%) scale(${Math.max(0, bubbleScale)})`,
              transformOrigin: isLeftTail ? 'bottom left' : 'bottom right',
              backgroundColor: bubbleBg,
              borderRadius: isPortrait ? 22 : 26,
              padding: isPortrait ? '13px 20px' : '16px 26px',
              boxShadow:
                '0 18px 40px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
              border: '2.5px solid rgba(255, 255, 255, 0.24)',
              zIndex: 20,
              pointerEvents: 'none',
              transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Comic Tail pointing down directly at character head */}
            <div
              style={{
                position: 'absolute',
                bottom: -13,
                [isLeftTail ? 'left' : 'right']: isPortrait ? 26 : 38,
                width: 0,
                height: 0,
                borderLeft: '11px solid transparent',
                borderRight: '11px solid transparent',
                borderTop: `13px solid ${bubbleBg}`,
                filter: 'drop-shadow(0 3px 3px rgba(0, 0, 0, 0.3))',
              }}
            />

            {/* Single Active Sentence (Full sentence displayed at once, elegant & crisp) */}
            <div
              style={{
                fontSize: dynamicFontSize,
                fontWeight: 800,
                color: textColor,
                lineHeight: 1.35,
                textAlign: 'center',
                opacity: textOpacity,
                transform: `translateY(${interpolate(sentenceLocalFrame, [0, 3], [3, 0], { extrapolateRight: 'clamp' })}px)`,
                transition: 'color 0.2s ease',
                fontFamily:
                  "'Nunito', 'Plus Jakarta Sans', -apple-system, 'SF Pro Rounded', system-ui, sans-serif",
                letterSpacing: -0.2,
                wordBreak: 'break-word',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <span>{fullText}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
