'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';

export type CaptionPresetStyle =
  | 'karaoke_glow'
  | 'spring_bounce'
  | 'cyberpunk_neon'
  | 'pill_badge'
  | 'comic_slant'
  | 'minimal_bar'
  | 'gradient_wave'
  | 'fashion_serif'
  | 'news_flash'
  | 'typewriter_cursor';

export interface CaptionWord {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
  probability?: number;
}

export interface CaptionSegment {
  id: number | string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
  words?: CaptionWord[];
}

export interface CapCutCaptionRendererProps {
  segments: CaptionSegment[];
  presetStyle?: CaptionPresetStyle;
  fontSize?: number;
  positionY?: 'top' | 'middle' | 'bottom';
  customColor?: string;
  highlightColor?: string;
  uppercase?: boolean;
}

export const CAPTION_PRESET_LABELS: Record<CaptionPresetStyle, { label: string; desc: string; icon: string }> = {
  karaoke_glow: { label: 'Karaoke Glow', desc: 'Từ đang nói đổi màu vàng chanh & phát sáng', icon: '🎤' },
  spring_bounce: { label: 'Spring Bounce', desc: 'Chữ nảy nhún 3D theo từng từ phát âm', icon: '⚡' },
  cyberpunk_neon: { label: 'Cyberpunk Neon', desc: 'Viền đèn neon phát sáng Cyan & Magenta', icon: '🌆' },
  pill_badge: { label: 'Pill Badge', desc: 'Từ đang nói nằm trong khung bo góc gradient', icon: '💊' },
  comic_slant: { label: 'Comic Slant', desc: 'Nghiêng 6°, viền đen dày phong cách Manga', icon: '💥' },
  minimal_bar: { label: 'Minimal Glass', desc: 'Dải kính mờ thanh lịch ở đáy màn hình', icon: '✨' },
  gradient_wave: { label: 'Gradient Wave', desc: 'Vệt màu chuyển sắc lướt qua theo giọng đọc', icon: '🌊' },
  fashion_serif: { label: 'Luxury Serif', desc: 'Chữ nghiêng Playfair sang trọng quý phái', icon: '👑' },
  news_flash: { label: 'News Flash', desc: 'Bật từ in đậm cỡ lớn ngay giữa tâm màn hình', icon: '🔥' },
  typewriter_cursor: { label: 'Typewriter', desc: 'Đánh máy từng chữ kèm con trỏ nhấp nháy', icon: '⌨️' },
};

export const CapCutCaptionRenderer: React.FC<CapCutCaptionRendererProps> = ({
  segments,
  presetStyle = 'karaoke_glow',
  fontSize = 32,
  positionY = 'bottom',
  customColor,
  highlightColor = '#FFE600',
  uppercase = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const currentTime = frame / fps;

  // Find active segment at currentTime
  const activeSegment = segments.find(
    (seg) => currentTime >= seg.start && currentTime <= seg.end + 0.1
  );

  if (!activeSegment) return null;

  const yPosStyle: React.CSSProperties = {
    position: 'absolute',
    left: '5%',
    right: '5%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    pointerEvents: 'none',
    zIndex: 40,
    ...(positionY === 'top'
      ? { top: '12%' }
      : positionY === 'middle'
      ? { top: '50%', transform: 'translateY(-50%)' }
      : { bottom: '15%' }),
  };

  const words = activeSegment.words && activeSegment.words.length > 0
    ? activeSegment.words
    : activeSegment.text.split(' ').map((w, idx, arr) => {
        const segDuration = activeSegment.end - activeSegment.start;
        const wDuration = segDuration / arr.length;
        return {
          word: w,
          start: activeSegment.start + idx * wDuration,
          end: activeSegment.start + (idx + 1) * wDuration,
        };
      });

  return (
    <div style={yPosStyle}>
      {/* ─────────────────────────────────────────────────────────────
          1. KARAOKE GLOW (Default CapCut Style)
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'karaoke_glow' && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: '"Montserrat", "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif',
            fontSize: `${fontSize}px`,
            fontWeight: 900,
            textTransform: uppercase ? 'uppercase' : 'none',
          }}
        >
          {words.map((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            const isPassed = currentTime > item.end;
            return (
              <span
                key={idx}
                style={{
                  color: isActive ? highlightColor : isPassed ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                  textShadow: isActive
                    ? `0 0 20px ${highlightColor}, 0 4px 12px rgba(0,0,0,0.9), 0 0 4px #000`
                    : '0 4px 12px rgba(0,0,0,0.9), 0 0 4px #000',
                  transform: isActive ? 'scale(1.18)' : 'scale(1.0)',
                  transition: 'transform 0.08s ease-out',
                  display: 'inline-block',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SPRING BOUNCE
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'spring_bounce' && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            fontFamily: '"Montserrat", "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif',
            fontSize: `${fontSize * 1.05}px`,
            fontWeight: 900,
            textTransform: uppercase ? 'uppercase' : 'none',
          }}
        >
          {words.map((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            const wordFrame = Math.max(0, (currentTime - item.start) * fps);
            const bounce = spring({ frame: wordFrame, fps, config: { damping: 10, stiffness: 160 } });
            const scale = isActive ? interpolate(bounce, [0, 1], [0.8, 1.25]) : 1.0;

            return (
              <span
                key={idx}
                style={{
                  color: isActive ? (customColor || '#00F0FF') : '#FFFFFF',
                  textShadow: '0 4px 15px rgba(0,0,0,0.95), 0 0 6px #000',
                  transform: `scale(${scale})`,
                  display: 'inline-block',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. CYBERPUNK NEON
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'cyberpunk_neon' && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: '"Courier New", monospace',
            fontSize: `${fontSize * 0.95}px`,
            fontWeight: 900,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          {words.map((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            return (
              <span
                key={idx}
                style={{
                  color: isActive ? '#00FFFF' : '#FF007F',
                  textShadow: isActive
                    ? '0 0 10px #00FFFF, 0 0 25px #00FFFF, 0 0 40px #00FFFF'
                    : '0 0 8px #FF007F, 0 0 16px rgba(255,0,127,0.5)',
                  transform: isActive ? 'scale(1.15)' : 'scale(1.0)',
                  display: 'inline-block',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. PILL BADGE
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'pill_badge' && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: '"Montserrat", sans-serif',
            fontSize: `${fontSize}px`,
            fontWeight: 800,
          }}
        >
          {words.map((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            return (
              <span
                key={idx}
                style={{
                  padding: isActive ? '3px 12px' : '3px 6px',
                  borderRadius: '16px',
                  background: isActive
                    ? 'linear-gradient(90deg, #FF7A00 0%, #FFB800 100%)'
                    : 'rgba(0,0,0,0.5)',
                  color: isActive ? '#000000' : '#FFFFFF',
                  fontWeight: isActive ? 900 : 700,
                  boxShadow: isActive ? '0 4px 15px rgba(255,122,0,0.8)' : 'none',
                  transform: isActive ? 'scale(1.12)' : 'scale(1.0)',
                  transition: 'all 0.08s ease-out',
                  display: 'inline-block',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. COMIC SLANT
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'comic_slant' && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            fontFamily: '"Montserrat", "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif',
            fontSize: `${fontSize * 1.15}px`,
            transform: 'rotate(-4deg)',
            textTransform: 'uppercase',
          }}
        >
          {words.map((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            return (
              <span
                key={idx}
                style={{
                  color: isActive ? '#FFF500' : '#FFFFFF',
                  WebkitTextStroke: '2.5px #000000',
                  textShadow: '4px 4px 0px #000000',
                  transform: isActive ? 'scale(1.2) translateY(-4px)' : 'scale(1.0)',
                  display: 'inline-block',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. MINIMAL GLASS BAR
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'minimal_bar' && (
        <div
          style={{
            padding: '10px 24px',
            borderRadius: '14px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'system-ui, sans-serif',
            fontSize: `${fontSize * 0.88}px`,
            fontWeight: 700,
          }}
        >
          {words.map((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            return (
              <span
                key={idx}
                style={{
                  color: isActive ? (customColor || '#38BDF8') : '#F1F5F9',
                  fontWeight: isActive ? 900 : 600,
                  transform: isActive ? 'scale(1.08)' : 'scale(1.0)',
                  display: 'inline-block',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. GRADIENT WAVE
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'gradient_wave' && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: '"Montserrat", sans-serif',
            fontSize: `${fontSize}px`,
            fontWeight: 900,
          }}
        >
          {words.map((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            return (
              <span
                key={idx}
                style={{
                  background: isActive
                    ? 'linear-gradient(90deg, #EC4899, #8B5CF6, #3B82F6)'
                    : 'linear-gradient(90deg, #FFFFFF, #E2E8F0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: isActive ? 'drop-shadow(0 0 15px rgba(236,72,153,0.9))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.9))',
                  transform: isActive ? 'scale(1.2)' : 'scale(1.0)',
                  display: 'inline-block',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. LUXURY SERIF ITALIC
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'fashion_serif' && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            fontFamily: '"Playfair Display", "Times New Roman", Georgia, serif',
            fontStyle: 'italic',
            fontSize: `${fontSize * 1.1}px`,
            fontWeight: 800,
          }}
        >
          {words.map((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            return (
              <span
                key={idx}
                style={{
                  color: isActive ? '#F5E8B7' : '#FFFFFF',
                  textShadow: isActive
                    ? '0 0 20px rgba(245,232,183,0.9), 0 4px 15px rgba(0,0,0,0.9)'
                    : '0 4px 12px rgba(0,0,0,0.9)',
                  transform: isActive ? 'scale(1.15) translateY(-2px)' : 'scale(1.0)',
                  display: 'inline-block',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          9. NEWS FLASH (Big Center Word Pop)
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'news_flash' && (
        <div
          style={{
            fontFamily: '"Montserrat", "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif',
            fontSize: `${fontSize * 1.6}px`,
            fontWeight: 900,
            textTransform: 'uppercase',
            color: '#FFFFFF',
            background: 'rgba(230, 81, 0, 0.95)',
            padding: '6px 28px',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(230,81,0,0.8), 0 4px 12px rgba(0,0,0,0.9)',
            letterSpacing: '3px',
          }}
        >
          {(() => {
            const currentActiveWord = words.find((w) => currentTime >= w.start && currentTime <= w.end) || words[0];
            return currentActiveWord ? currentActiveWord.word : activeSegment.text;
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          10. TYPEWRITER CURSOR
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'typewriter_cursor' && (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            padding: '8px 18px',
            borderRadius: '6px',
            fontFamily: '"Courier New", monospace',
            fontSize: `${fontSize * 0.88}px`,
            color: '#A7F3D0',
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(0,0,0,0.9)',
            border: '1px solid rgba(167, 243, 208, 0.3)',
          }}
        >
          {(() => {
            const segDuration = activeSegment.end - activeSegment.start;
            const progress = Math.min(1.0, Math.max(0, (currentTime - activeSegment.start) / segDuration));
            const charCount = Math.floor(progress * activeSegment.text.length);
            const displayText = activeSegment.text.slice(0, charCount);
            const isBlink = Math.floor(frame / 10) % 2 === 0;

            return (
              <span>
                {displayText}
                <span style={{ opacity: isBlink ? 1 : 0, color: '#10B981', fontWeight: 900 }}>▌</span>
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
};
