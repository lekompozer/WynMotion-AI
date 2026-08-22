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

  // 3. Local frame inside current sentence for spring entrance
  const sentenceStartFrame = Math.round((activeSentence?.startSec || 0) * fps);
  const sentenceDurationFrames = Math.max(1, Math.round(((activeSentence?.endSec || 1) - (activeSentence?.startSec || 0)) * fps));
  const sentenceLocalFrame = Math.max(0, frame - sentenceStartFrame);

  // Spring entrance pop
  const bubbleScale = spring({
    frame: sentenceLocalFrame,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  // Subtle Ken Burns zoom
  const kenBurns = interpolate(frame, [0, totalFrames], [1.0, 1.025], {
    extrapolateRight: 'clamp',
  });

  // 4. Fast typewriter streaming text for active short sentence
  const fullText = activeSentence?.sentenceText || '';
  const turnTypingProgress = Math.min(
    1,
    Math.max(0, (sentenceLocalFrame - 2) / Math.max(1, sentenceDurationFrames * 0.75))
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

      {/* 2. WIDE HORIZONTAL SPEECH BUBBLE (Listen & Learn Reference Standard) */}
      {(() => {
        const isFlipped = swapSpeakers ?? (scene as any).swap_speakers ?? false;
        const effectiveIsA = isFlipped ? !isSpeakerA : isSpeakerA;

        // Speaker-specific Theme: Speaker on Left = Navy Blue, Speaker on Right = Forest Green
        const bubbleBg = effectiveIsA ? '#132644' : '#1E392A';
        const caretColor = effectiveIsA ? '#38BDF8' : '#4ADE80';
        const isLeftTail = effectiveIsA;

        const bubbleTop =
          cardPosY === 'top'
            ? isPortrait ? '18%' : '14%'
            : cardPosY === 'bottom'
            ? undefined
            : isPortrait ? '48%' : '40%';

        const bubbleBottom = cardPosY === 'bottom' ? (isPortrait ? '14%' : '10%') : undefined;

        return (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: cardPosY === 'bottom' ? 'flex-end' : 'flex-start',
              alignItems: 'center',
              boxSizing: 'border-box',
              paddingTop: bubbleTop,
              paddingBottom: bubbleBottom,
              paddingLeft: isPortrait ? 16 : 32,
              paddingRight: isPortrait ? 16 : 32,
            }}
          >
            <div
              style={{
                width: isPortrait ? '82%' : '60%',
                maxWidth: isPortrait ? 440 : 680,
                transform: `scale(${Math.max(0, bubbleScale)})`,
                transformOrigin: isLeftTail ? 'top left' : 'top right',
                backgroundColor: bubbleBg,
                borderRadius: isPortrait ? 22 : 26,
                padding: isPortrait ? '13px 20px' : '16px 28px',
                boxShadow:
                  '0 16px 36px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.25)',
                border: '2.5px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Top-pointing Comic Tail pointing towards speaker mouth/head */}
              <div
                style={{
                  position: 'absolute',
                  top: -13,
                  [isLeftTail ? 'left' : 'right']: isPortrait ? 28 : 42,
                  width: 0,
                  height: 0,
                  borderLeft: '11px solid transparent',
                  borderRight: '11px solid transparent',
                  borderBottom: `13px solid ${bubbleBg}`,
                  filter: 'drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.2))',
                }}
              />

              {/* Single Active Sentence (1-3 lines max, centered, elegant) */}
              <div
                style={{
                  fontSize: isPortrait ? 17.5 : isSquare ? 19 : 21,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.35,
                  textAlign: 'center',
                  fontFamily:
                    "system-ui, -apple-system, 'SF Pro Rounded', 'Nunito', 'Segoe UI', sans-serif",
                  letterSpacing: -0.2,
                  wordBreak: 'break-word',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                }}
              >
                <span>{revealedText}</span>
                {isTyping && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 2.5,
                      height: '0.9em',
                      backgroundColor: caretColor,
                      marginLeft: 3,
                      verticalAlign: 'middle',
                      opacity: frame % 8 < 5 ? 1 : 0,
                    }}
                  />
                )}
                <span style={{ opacity: 0 }}>{unrevealedText}</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
