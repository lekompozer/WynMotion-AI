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
  | 'typewriter_cursor'
  | 'clean_white'
  | 'clean_black'
  | 'block_white_on_black'
  | 'block_black_on_white';

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
  positionY?: 'top' | 'middle' | 'bottom' | string | number;
  customColor?: string;
  highlightColor?: string;
  fontFamily?: string;
  uppercase?: boolean;
}

export const CAPTION_PRESET_LABELS: Record<CaptionPresetStyle, { label: string; desc: string; icon: string }> = {
  karaoke_glow: { label: 'Karaoke Glow', desc: 'Từ đang nói đổi màu vàng chanh & phát sáng', icon: '🎤' },
  spring_bounce: { label: 'Spring Bounce', desc: 'Chữ nảy nhún 3D theo từng từ phát âm', icon: '⚡' },
  block_white_on_black: { label: 'Hộp Đen Chữ Trắng', desc: 'Cả câu chữ trắng trên nền đen bo góc tĩnh', icon: '⬛' },
  block_black_on_white: { label: 'Hộp Trắng Chữ Đen', desc: 'Cả câu chữ đen trên nền trắng thanh lịch', icon: '⬜' },
  clean_white: { label: 'Trắng Điện Ảnh', desc: 'Chữ trắng không nền, bóng mờ dịu mắt', icon: '⚪' },
  clean_black: { label: 'Đen Tương Phản', desc: 'Chữ đen không nền, sắc nét tinh tế', icon: '⚫' },
  gradient_wave: { label: 'Gradient Wave', desc: 'Dải màu chuyển sắc cầu vồng, từ đọc sáng rực', icon: '🌊' },
  comic_slant: { label: 'Comic Slant', desc: 'Nghiêng 4°, viền nét vẽ Manga rõ nét', icon: '💥' },
  cyberpunk_neon: { label: 'Cyberpunk Neon', desc: 'Viền đèn neon phát sáng Cyan & Magenta', icon: '🌆' },
  pill_badge: { label: 'Pill Badge', desc: 'Từ đang nói nằm trong khung bo góc gradient', icon: '💊' },
  minimal_bar: { label: 'Minimal Glass', desc: 'Dải kính mờ thanh lịch bo tròn ở chân màn hình', icon: '✨' },
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
  fontFamily,
  uppercase = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find active segment at currentTime (with smooth 0.2s tail buffer so captions don't disappear during micro-pauses)
  const activeSegment = segments.find(
    (seg) => currentTime >= seg.start && currentTime <= seg.end + 0.2
  );

  if (!activeSegment) return null;

  // Calculate dynamic position Y style supporting slider percentages, numbers and presets
  const getYPosStyle = (): React.CSSProperties => {
    let topVal: string | undefined = undefined;
    let bottomVal: string | undefined = undefined;
    let transformStr = 'translateX(-50%)';

    if (typeof positionY === 'number') {
      const clamped = Math.min(95, Math.max(5, positionY));
      topVal = `${clamped}%`;
      transformStr = 'translate(-50%, -50%)';
    } else if (typeof positionY === 'string' && (positionY.endsWith('%') || !isNaN(Number(positionY)))) {
      const num = positionY.endsWith('%') ? Number(positionY.replace('%', '')) : Number(positionY);
      const clamped = Math.min(95, Math.max(5, num));
      topVal = `${clamped}%`;
      transformStr = 'translate(-50%, -50%)';
    } else if (positionY === 'top') {
      topVal = '12%';
    } else if (positionY === 'middle') {
      topVal = '50%';
      transformStr = 'translate(-50%, -50%)';
    } else {
      bottomVal = '14%';
    }

    return {
      position: 'absolute',
      left: '50%',
      width: '90%',
      maxWidth: '92%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      pointerEvents: 'none',
      zIndex: 40,
      ...(topVal !== undefined ? { top: topVal } : {}),
      ...(bottomVal !== undefined ? { bottom: bottomVal } : {}),
      transform: transformStr,
    };
  };

  const textWordsStr = (activeSegment.text || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const wordsArrStr = (activeSegment.words || []).map((w) => w.word).join(' ').trim().replace(/\s+/g, ' ').toLowerCase();
  const wordsMatchText = activeSegment.words && activeSegment.words.length > 0 && textWordsStr === wordsArrStr;

  const words = wordsMatchText && activeSegment.words && activeSegment.words.length > 0
    ? activeSegment.words
    : (activeSegment.text || '').trim().split(/\s+/).filter(Boolean).map((w, idx, arr) => {
        const segDuration = Math.max(0.2, activeSegment.end - activeSegment.start);
        const wDuration = segDuration / Math.max(1, arr.length);
        return {
          word: w,
          start: activeSegment.start + idx * wDuration,
          end: activeSegment.start + (idx + 1) * wDuration,
        };
      });

  const resolvedFont = fontFamily || '"Montserrat", "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif';
  const wordSpacing = Math.max(2, Math.round(fontSize * 0.1));

  // Balanced 2-line break algorithm for subtitles
  const splitWordsBalanced = <T extends { word: string }>(wList: T[]): T[][] => {
    if (!wList || wList.length <= 4) return [wList];
    const totalChars = wList.reduce((acc, w) => acc + (w.word ? w.word.length : 0), 0) + (wList.length - 1);
    if (wList.length <= 5 && totalChars <= 26) return [wList];

    const targetMid = totalChars / 2;
    let bestSplit = Math.floor(wList.length / 2);
    let minDiff = 999999;
    let curChars = 0;

    for (let i = 0; i < wList.length - 1; i++) {
      curChars += (wList[i].word ? wList[i].word.length : 0) + (i > 0 ? 1 : 0);
      let diff = Math.abs(curChars - targetMid);
      const lastChar = (wList[i].word || '').slice(-1);
      if (',.!?:;'.includes(lastChar)) diff -= 4;
      if (diff < minDiff) {
        minDiff = diff;
        bestSplit = i + 1;
      }
    }
    return [wList.slice(0, bestSplit), wList.slice(bestSplit)];
  };

  const getBalancedTextLines = (str: string): string[] => {
    if (!str) return [];
    const wArr = str.trim().split(/\s+/).filter(Boolean);
    if (wArr.length <= 4 && str.length <= 22) return [str.trim()];
    const targetMid = str.length / 2;
    let bestSplit = Math.floor(wArr.length / 2);
    let minDiff = 999999;
    let curChars = 0;
    for (let i = 0; i < wArr.length - 1; i++) {
      curChars += wArr[i].length + (i > 0 ? 1 : 0);
      let diff = Math.abs(curChars - targetMid);
      const lastChar = wArr[i].slice(-1);
      if (',.!?:;'.includes(lastChar)) diff -= 4;
      if (diff < minDiff) {
        minDiff = diff;
        bestSplit = i + 1;
      }
    }
    return [wArr.slice(0, bestSplit).join(' '), wArr.slice(bestSplit).join(' ')];
  };

  const textLines = getBalancedTextLines(activeSegment.text || '');
  const maxLineChars = Math.max(...textLines.map((l) => l.length), 1);
  // Auto-fit font size so long lines strictly fit in at most 2 lines without aggressive shrinking
  const autoFitScale = maxLineChars > 36 ? Math.max(0.85, 36 / maxLineChars) : 1.0;
  const effectiveFontSize = Math.max(14, Math.round(fontSize * autoFitScale));

  const renderTextLines = (extraLineStyle?: React.CSSProperties) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', width: '100%' }}>
      {textLines.map((line, idx) => (
        <div key={idx} style={{ whiteSpace: 'nowrap', display: 'block', textAlign: 'center', ...extraLineStyle }}>
          {line}
        </div>
      ))}
    </div>
  );

  const renderTypewriterBalanced = (text: string, count: number, isBlink: boolean) => {
    const lines = getBalancedTextLines(text);
    if (lines.length <= 1) {
      const displayText = (lines[0] || '').slice(0, count);
      return (
        <div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {displayText}
          <span style={{ opacity: isBlink ? 1 : 0, color: '#10B981', fontWeight: 900, marginLeft: '2px' }}>▌</span>
        </div>
      );
    }
    const line1 = lines[0];
    const line2 = lines[1];
    const c1 = Math.min(line1.length, count);
    const c2 = Math.max(0, Math.min(line2.length, count - line1.length - 1));
    const showCursorOnLine1 = count <= line1.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', width: '100%' }}>
        <div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {line1.slice(0, c1)}
          {showCursorOnLine1 && (
            <span style={{ opacity: isBlink ? 1 : 0, color: '#10B981', fontWeight: 900, marginLeft: '2px' }}>▌</span>
          )}
        </div>
        {count > line1.length && (
          <div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
            {line2.slice(0, c2)}
            <span style={{ opacity: isBlink ? 1 : 0, color: '#10B981', fontWeight: 900, marginLeft: '2px' }}>▌</span>
          </div>
        )}
      </div>
    );
  };

  const wordLines = splitWordsBalanced(words);

  const renderBalancedLines = (renderWord: (item: (typeof words)[0], idx: number) => React.ReactNode) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', maxWidth: '100%', margin: '0 auto' }}>
      {wordLines.map((lineWords, lineIdx) => (
        <div key={lineIdx} style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap' }}>
          {lineWords.map((item, wIdx) => renderWord(item, lineIdx * 100 + wIdx))}
        </div>
      ))}
    </div>
  );

  return (
    <div style={getYPosStyle()}>
      {/* ─────────────────────────────────────────────────────────────
          1. KARAOKE GLOW (Default CapCut Style)
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'karaoke_glow' && (
        <div
          style={{
            display: 'inline-block',
            maxWidth: '84%',
            textAlign: 'center',
            lineHeight: 1.35,
            fontFamily: resolvedFont,
            fontSize: `${fontSize}px`,
            fontWeight: 900,
            textTransform: uppercase ? 'uppercase' : 'none',
          }}
        >
          {renderBalancedLines((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            const isPassed = currentTime > item.end;
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  margin: `0 ${wordSpacing}px`,
                  color: isActive ? (highlightColor || '#FFE600') : isPassed ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
                  textShadow: isActive
                    ? `0 0 20px ${highlightColor || '#FFE600'}, 0 3px 10px rgba(0,0,0,0.95), 0 0 4px #000`
                    : '0 3px 10px rgba(0,0,0,0.95), 0 0 4px #000',
                  transform: isActive ? 'scale(1.15) translateY(-1px)' : 'scale(1.0)',
                  transition: 'transform 0.08s ease-out',
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
            display: 'inline-block',
            maxWidth: '88%',
            textAlign: 'center',
            lineHeight: 1.35,
            fontFamily: resolvedFont,
            fontSize: `${fontSize * 1.05}px`,
            fontWeight: 900,
            textTransform: uppercase ? 'uppercase' : 'none',
          }}
        >
          {renderBalancedLines((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            const wordFrame = Math.max(0, (currentTime - item.start) * fps);
            const bounce = spring({ frame: wordFrame, fps, config: { damping: 10, stiffness: 160 } });
            const scale = isActive ? interpolate(bounce, [0, 1], [0.85, 1.22]) : 1.0;

            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  margin: `0 ${wordSpacing}px`,
                  color: isActive ? (customColor || highlightColor || '#00F0FF') : '#FFFFFF',
                  textShadow: '0 4px 15px rgba(0,0,0,0.95), 0 0 6px #000',
                  transform: `scale(${scale})`,
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. BLOCK WHITE ON BLACK (Hộp Đen Chữ Trắng - Cả câu tĩnh)
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'block_white_on_black' && (
        <div
          style={{
            display: 'inline-block',
            minWidth: '55%',
            maxWidth: '92%',
            padding: `${Math.max(6, Math.round(effectiveFontSize * 0.28))}px ${Math.max(16, Math.round(effectiveFontSize * 0.75))}px`,
            borderRadius: `${Math.max(8, Math.round(effectiveFontSize * 0.35))}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            textAlign: 'center',
            lineHeight: 1.35,
            fontFamily: resolvedFont,
            fontSize: `${effectiveFontSize}px`,
            fontWeight: 700,
            color: '#FFFFFF',
          }}
        >
          {renderTextLines()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. BLOCK BLACK ON WHITE (Hộp Trắng Chữ Đen - Cả câu tĩnh)
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'block_black_on_white' && (
        <div
          style={{
            display: 'inline-block',
            minWidth: '55%',
            maxWidth: '92%',
            padding: `${Math.max(6, Math.round(effectiveFontSize * 0.28))}px ${Math.max(16, Math.round(effectiveFontSize * 0.75))}px`,
            borderRadius: `${Math.max(8, Math.round(effectiveFontSize * 0.35))}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
            border: '1.5px solid rgba(0, 0, 0, 0.08)',
            textAlign: 'center',
            lineHeight: 1.35,
            fontFamily: resolvedFont,
            fontSize: `${effectiveFontSize}px`,
            fontWeight: 800,
            color: '#0F172A',
          }}
        >
          {renderTextLines()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. CLEAN WHITE (Chữ Trắng Điện Ảnh Không Nền)
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'clean_white' && (
        <div
          style={{
            display: 'inline-block',
            maxWidth: '84%',
            textAlign: 'center',
            lineHeight: 1.35,
            fontFamily: resolvedFont,
            fontSize: `${fontSize}px`,
            fontWeight: 800,
            color: '#FFFFFF',
            textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 4px 20px rgba(0,0,0,0.85), 0 0 4px #000',
          }}
        >
          {renderBalancedLines((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  margin: `0 ${wordSpacing}px`,
                  color: isActive ? (highlightColor || '#FFE600') : '#FFFFFF',
                  transform: isActive ? 'scale(1.14)' : 'scale(1.0)',
                  transition: 'transform 0.06s ease-out',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. CLEAN BLACK (Chữ Đen Tương Phản Cao Không Nền)
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'clean_black' && (
        <div
          style={{
            display: 'inline-block',
            maxWidth: '84%',
            textAlign: 'center',
            lineHeight: 1.35,
            fontFamily: resolvedFont,
            fontSize: `${fontSize}px`,
            fontWeight: 900,
            color: '#0F172A',
            textShadow: '0 1px 2px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.4)',
          }}
        >
          {renderBalancedLines((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  margin: `0 ${wordSpacing}px`,
                  color: isActive ? (customColor || '#0284C7') : '#0F172A',
                  transform: isActive ? 'scale(1.14)' : 'scale(1.0)',
                  transition: 'transform 0.06s ease-out',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. GRADIENT WAVE (Sửa lỗi khung trắng - Gradient chuyển sắc mượt toàn câu)
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'gradient_wave' && (
        <div
          style={{
            display: 'inline-block',
            maxWidth: '84%',
            textAlign: 'center',
            lineHeight: 1.35,
            fontFamily: resolvedFont,
            fontSize: `${fontSize}px`,
            fontWeight: 900,
            textShadow: '0 3px 12px rgba(0,0,0,0.95), 0 0 4px #000',
          }}
        >
          {renderBalancedLines((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            const isPassed = currentTime > item.end;
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  margin: `0 ${wordSpacing}px`,
                  color: isActive
                    ? (highlightColor || '#FFE600')
                    : isPassed
                    ? '#38BDF8'
                    : '#C084FC',
                  transform: isActive ? 'scale(1.18) translateY(-2px)' : 'scale(1.0)',
                  transition: 'transform 0.08s ease-out',
                  textShadow: isActive
                    ? `0 0 16px ${highlightColor || '#FFE600'}, 0 3px 12px rgba(0,0,0,0.95)`
                    : '0 3px 12px rgba(0,0,0,0.95)',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. COMIC SLANT (Sửa lỗi chữ đè đôi - 1 lớp truyện tranh rõ nét)
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'comic_slant' && (
        <div
          style={{
            display: 'inline-block',
            maxWidth: '84%',
            textAlign: 'center',
            lineHeight: 1.35,
            fontFamily: resolvedFont,
            fontSize: `${fontSize * 1.08}px`,
            fontWeight: 900,
            transform: 'rotate(-4deg)',
            textTransform: 'uppercase',
          }}
        >
          {renderBalancedLines((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            const strokeWidth = Math.max(0.8, Math.min(2, fontSize * 0.04));
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  margin: `0 ${Math.max(2, Math.round(fontSize * 0.09))}px`,
                  color: isActive ? (highlightColor || '#FFF500') : '#FFFFFF',
                  WebkitTextStroke: `${strokeWidth}px #000000`,
                  textShadow: '0 3px 8px rgba(0,0,0,0.9), 0 1px 2px #000000',
                  transform: isActive ? 'scale(1.14) translateY(-2px)' : 'scale(1.0)',
                  transition: 'transform 0.06s ease-out',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          9. CYBERPUNK NEON
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'cyberpunk_neon' && (
        <div
          style={{
            display: 'inline-block',
            maxWidth: '84%',
            textAlign: 'center',
            lineHeight: 1.35,
            fontFamily: fontFamily || '"Courier New", monospace',
            fontSize: `${fontSize * 0.95}px`,
            fontWeight: 900,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}
        >
          {renderBalancedLines((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  margin: `0 ${wordSpacing}px`,
                  color: isActive ? '#00FFFF' : '#FF007F',
                  textShadow: isActive
                    ? '0 0 10px #00FFFF, 0 0 25px #00FFFF, 0 0 40px #00FFFF'
                    : '0 0 8px #FF007F, 0 0 16px rgba(255,0,127,0.5)',
                  transform: isActive ? 'scale(1.15)' : 'scale(1.0)',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          10. PILL BADGE
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'pill_badge' && (
        <div
          style={{
            display: 'inline-block',
            maxWidth: '84%',
            textAlign: 'center',
            lineHeight: 1.45,
            fontFamily: resolvedFont,
            fontSize: `${fontSize}px`,
            fontWeight: 800,
          }}
        >
          {renderBalancedLines((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  margin: `2px ${Math.max(2, Math.round(fontSize * 0.08))}px`,
                  padding: isActive ? '2px 10px' : '2px 6px',
                  borderRadius: '14px',
                  background: isActive
                    ? 'linear-gradient(90deg, #FF7A00 0%, #FFB800 100%)'
                    : 'rgba(0,0,0,0.55)',
                  color: isActive ? '#000000' : '#FFFFFF',
                  fontWeight: isActive ? 900 : 700,
                  boxShadow: isActive ? '0 4px 15px rgba(255,122,0,0.8)' : 'none',
                  transform: isActive ? 'scale(1.12)' : 'scale(1.0)',
                  transition: 'all 0.08s ease-out',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          11. MINIMAL GLASS BAR (Sửa kích cỡ gọn gàng)
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'minimal_bar' && (
        <div
          style={{
            display: 'inline-block',
            maxWidth: '84%',
            padding: `${Math.max(6, Math.round(fontSize * 0.24))}px ${Math.max(12, Math.round(fontSize * 0.5))}px`,
            borderRadius: `${Math.max(8, Math.round(fontSize * 0.32))}px`,
            background: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            textAlign: 'center',
            lineHeight: 1.35,
            fontFamily: resolvedFont,
            fontSize: `${fontSize * 0.9}px`,
            fontWeight: 700,
          }}
        >
          {renderBalancedLines((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  margin: `0 ${wordSpacing}px`,
                  color: isActive ? (customColor || highlightColor || '#38BDF8') : '#F1F5F9',
                  fontWeight: isActive ? 900 : 600,
                  transform: isActive ? 'scale(1.08)' : 'scale(1.0)',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          12. LUXURY SERIF ITALIC
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'fashion_serif' && (
        <div
          style={{
            display: 'inline-block',
            maxWidth: '84%',
            textAlign: 'center',
            lineHeight: 1.35,
            fontFamily: fontFamily || '"Playfair Display", "Times New Roman", Georgia, serif',
            fontStyle: 'italic',
            fontSize: `${fontSize * 1.05}px`,
            fontWeight: 800,
          }}
        >
          {renderBalancedLines((item, idx) => {
            const isActive = currentTime >= item.start && currentTime <= item.end;
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  margin: `0 ${wordSpacing}px`,
                  color: isActive ? (highlightColor || '#F5E8B7') : '#FFFFFF',
                  textShadow: isActive
                    ? '0 0 20px rgba(245,232,183,0.9), 0 4px 15px rgba(0,0,0,0.9)'
                    : '0 4px 12px rgba(0,0,0,0.9)',
                  transform: isActive ? 'scale(1.14) translateY(-2px)' : 'scale(1.0)',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          13. NEWS FLASH (Big Center Word Pop)
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'news_flash' && (
        <div
          style={{
            fontFamily: resolvedFont,
            fontSize: `${fontSize * 1.45}px`,
            fontWeight: 900,
            textTransform: 'uppercase',
            color: '#FFFFFF',
            background: 'rgba(230, 81, 0, 0.95)',
            padding: `${Math.max(4, Math.round(fontSize * 0.2))}px ${Math.max(16, Math.round(fontSize * 0.7))}px`,
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(230,81,0,0.8), 0 4px 12px rgba(0,0,0,0.9)',
            letterSpacing: '2px',
            maxWidth: '90%',
            textAlign: 'center',
          }}
        >
          {(() => {
            const currentActiveWord = words.find((w) => currentTime >= w.start && currentTime <= w.end) || words[0];
            return currentActiveWord ? currentActiveWord.word : activeSegment.text;
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          14. TYPEWRITER CURSOR
          ───────────────────────────────────────────────────────────── */}
      {presetStyle === 'typewriter_cursor' && (
        <div
          style={{
            display: 'inline-block',
            maxWidth: '92%',
            background: 'rgba(0, 0, 0, 0.85)',
            padding: `${Math.max(4, Math.round(effectiveFontSize * 0.2))}px ${Math.max(12, Math.round(effectiveFontSize * 0.45))}px`,
            borderRadius: '6px',
            fontFamily: fontFamily || '"Courier New", monospace',
            fontSize: `${effectiveFontSize * 0.9}px`,
            color: '#A7F3D0',
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(0,0,0,0.9)',
            border: '1px solid rgba(167, 243, 208, 0.3)',
            textAlign: 'center',
            lineHeight: 1.32,
          }}
        >
          {(() => {
            const segDuration = Math.max(0.3, activeSegment.end - activeSegment.start);
            const typingDuration = Math.max(0.4, Math.min(segDuration * 0.7, activeSegment.text.length / 26));
            const progress = Math.min(1.0, Math.max(0, (currentTime - activeSegment.start) / typingDuration));
            const charCount = Math.min(activeSegment.text.length, Math.ceil(progress * activeSegment.text.length));
            const isBlink = Math.floor(frame / 8) % 2 === 0;

            return renderTypewriterBalanced(activeSegment.text, charCount, isBlink);
          })()}
        </div>
      )}
    </div>
  );
};
