'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from '../RemotionEngine';
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
  showSceneCards = true,
  showWhisperSubs = true,
  onCardClick,
  onSubsClick,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = height > width || height === 1920;
  const duration = scene.duration_frames || (scene.duration_sec ? Math.round(scene.duration_sec * fps) : 150);
  const displaySummary = scene.summary_text || scene.voice_transcript || scene.title || 'Nội dung phân cảnh';
  const primaryKeyword = scene.highlight_keywords?.[0] || scene.title || 'Đối Thoại';

  // 1. Parse dialogue lines from transcript or summary
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
};
