import React, { useState } from 'react';
import {
  X,
  Type,
  Sparkles,
  Wand2,
  RefreshCw,
  Check,
  Trash2,
  Edit2,
  Edit3,
  Globe,
  Radio,
  Move,
  Sliders,
  Eye,
  EyeOff,
  Music,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Plus,
} from 'lucide-react';
import { CaptionSegment, CaptionPresetStyle, CAPTION_PRESET_LABELS } from '../subtitles/CapCutCaptionRenderer';
import { filterVocalTrackFromAudioUrl } from '@/utils/audioVocalFilter';

export type TextPosition = 'top' | 'middle' | 'bottom' | string | number;

export interface CaptionsFlyoutTabProps {
  onClose: () => void;
  audioUrl?: string;
  segments: CaptionSegment[];
  onChangeSegments: (segments: CaptionSegment[]) => void;
  presetStyle: CaptionPresetStyle;
  onChangePresetStyle: (style: CaptionPresetStyle) => void;
  onTranscribeWhisper: (audioUrl: string, language: string) => Promise<void>;
  isTranscribing?: boolean;
  visualStyle?: string;
  showSubs?: boolean;
  onToggleSubs?: () => void;
  subsPosY?: TextPosition;
  onChangeSubsPosY?: (pos: any) => void;
  activeScene?: any;
  activeSceneIndex?: number;
  onUpdateActiveSceneTranscript?: (text: string) => void;
  hasVoiceAudio?: boolean;
  isCommercialMusicStyle?: boolean;
  sourceBadgeText?: string;
  onChangeSourceBadgeText?: (text: string) => void;
  sourceBadgePosX?: number;
  onChangeSourceBadgePosX?: (x: number) => void;
  sourceBadgePosY?: number;
  onChangeSourceBadgePosY?: (y: number) => void;
  captionPosY?: number;
  onChangeCaptionPosY?: (y: number) => void;
  tickerText?: string;
  onChangeTickerText?: (text: string) => void;
  onOpenReviewModal?: () => void;
  hasTranslatedSegments?: boolean;
  activeSubtitleMode?: 'original' | 'translated';
  onChangeSubtitleMode?: (mode: 'original' | 'translated') => void;
  originalLanguage?: string;
  targetLanguage?: string;
  captionFontSize?: number;
  onChangeCaptionFontSize?: (size: number) => void;
  scenes?: any[];
  originalSegments?: CaptionSegment[];
  translatedSegments?: CaptionSegment[];
  onSaveBothSegments?: (orig: CaptionSegment[], trans: CaptionSegment[], mode: 'original' | 'translated') => void;
}

function getLangFlag(lang?: string): string {
  if (!lang) return '🌐';
  const l = lang.toLowerCase();
  if (l.includes('vi')) return '🇻🇳';
  if (l.includes('en')) return '🇺🇸';
  if (l.includes('zh') || l.includes('cn')) return '🇨🇳';
  if (l.includes('ja') || l.includes('jp')) return '🇯🇵';
  if (l.includes('ko') || l.includes('kr')) return '🇰🇷';
  if (l.includes('fr')) return '🇫🇷';
  if (l.includes('de')) return '🇩🇪';
  if (l.includes('es')) return '🇪🇸';
  return '🌐';
}

function formatTimestamp(sec?: number): string {
  if (typeof sec !== 'number' || isNaN(sec)) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 10);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`;
}

export interface SentenceItem {
  id: string | number;
  speaker?: string;
  text: string;
  start?: number;
  end?: number;
  segmentId?: string | number;
}

export const CaptionsFlyoutTab: React.FC<CaptionsFlyoutTabProps> = ({
  onClose,
  audioUrl,
  segments,
  onChangeSegments,
  presetStyle,
  onChangePresetStyle,
  onTranscribeWhisper,
  isTranscribing = false,
  visualStyle,
  showSubs = true,
  onToggleSubs,
  subsPosY = 'bottom',
  onChangeSubsPosY,
  captionFontSize = 32,
  onChangeCaptionFontSize,
  activeScene,
  activeSceneIndex = 0,
  scenes,
  onUpdateActiveSceneTranscript,
  hasVoiceAudio = true,
  isCommercialMusicStyle = false,
  sourceBadgeText = 'TIN MỚI TỪ VNEXPRESS',
  onChangeSourceBadgeText,
  sourceBadgePosX = 5,
  onChangeSourceBadgePosX,
  sourceBadgePosY = 5,
  onChangeSourceBadgePosY,
  captionPosY = 20,
  onChangeCaptionPosY,
  tickerText = '⚡ BẢN TIN NÓNG • Cập nhật liên tục 24/7',
  onChangeTickerText,
  onOpenReviewModal,
  hasTranslatedSegments = false,
  activeSubtitleMode = 'original',
  onChangeSubtitleMode,
  originalLanguage = 'vi',
  targetLanguage = 'en',
  originalSegments,
  translatedSegments,
  onSaveBothSegments,
}) => {
  const effectiveOriginalLang = React.useMemo(() => {
    if (originalLanguage && originalLanguage !== 'vi') return originalLanguage;
    const allText = [
      ...(originalSegments || []).map((s) => s.text || ''),
      ...(segments || []).map((s) => s.text || ''),
      ...(scenes || []).map(
        (s) => `${s.voice_transcript || ''} ${s.dialogue || ''} ${s.voiceover || ''} ${s.summary_text || ''}`
      ),
    ].join(' ');
    if (/[\u4e00-\u9fa5]/.test(allText)) return 'zh';
    if (/[\u3040-\u30ff]/.test(allText)) return 'ja';
    if (/[\uac00-\ud7af]/.test(allText)) return 'ko';
    return originalLanguage || 'vi';
  }, [originalLanguage, originalSegments, segments, scenes]);

  const effectiveTargetLang = React.useMemo(() => {
    if (targetLanguage && targetLanguage !== 'en') return targetLanguage;
    if (
      effectiveOriginalLang === 'zh' ||
      effectiveOriginalLang === 'ja' ||
      effectiveOriginalLang === 'ko' ||
      effectiveOriginalLang === 'en'
    ) {
      return 'vi';
    }
    return targetLanguage || 'en';
  }, [targetLanguage, effectiveOriginalLang]);

  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => effectiveOriginalLang || 'vi');

  React.useEffect(() => {
    if (effectiveOriginalLang) {
      setSelectedLanguage(effectiveOriginalLang);
    }
  }, [effectiveOriginalLang]);

  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'timeline' | 'news_badge'>('presets');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [isSeparatingLyrics, setIsSeparatingLyrics] = useState(false);
  const [sceneSentences, setSceneSentences] = useState<SentenceItem[]>([]);
  const [isAppliedSuccess, setIsAppliedSuccess] = useState(false);


  const isNewsStyle =
    visualStyle === 'video_news_60s' ||
    visualStyle === 'news_video' ||
    visualStyle === 'breaking_news' ||
    visualStyle === 'video_news';

  const handleStartTranscribe = async () => {
    if (!audioUrl || !hasVoiceAudio) {
      alert('Vui lòng tạo âm thanh Giọng đọc AI hoặc tải lên Audio có lời trước khi tạo phụ đề tự động.');
      return;
    }
    await onTranscribeWhisper(audioUrl, selectedLanguage);
  };

  const handleStartAddLyrics = async () => {
    if (!audioUrl) {
      alert('Vui lòng chọn hoặc tải lên bài hát / audio trước khi tạo lời bài hát.');
      return;
    }
    setIsSeparatingLyrics(true);
    try {
      // Step 1: Run lightweight DSP vocal separation on client (Mid-Side Extraction + Bandpass)
      const cleanAudioUrl = await filterVocalTrackFromAudioUrl(audioUrl);
      // Step 2: Feed into Whisper, which upon completion automatically triggers the 2-step CaptionReviewModal!
      await onTranscribeWhisper(cleanAudioUrl, selectedLanguage);
    } catch (err: any) {
      console.error('Error in Add Lyrics:', err);
      // Fallback directly to original audio
      await onTranscribeWhisper(audioUrl, selectedLanguage);
    } finally {
      setIsSeparatingLyrics(false);
    }
  };

  const handleUpdateText = (id: string | number) => {
    const wordList = (editText || '').trim().split(/\s+/).filter(Boolean);
    onChangeSegments(
      segments.map((seg) => {
        if (String(seg.id) === String(id)) {
          const duration = Math.max(0.2, seg.end - seg.start);
          const step = duration / Math.max(1, wordList.length);
          const newWords = wordList.map((w, idx) => ({
            word: w,
            start: Number((seg.start + idx * step).toFixed(2)),
            end: Number((seg.start + (idx + 1) * step).toFixed(2)),
            probability: 0.99,
          }));
          return { ...seg, text: editText, words: newWords };
        }
        return seg;
      })
    );
    setEditingId(null);
  };

  const handleDeleteSegment = (id: string | number) => {
    onChangeSegments(segments.filter((seg) => String(seg.id) !== String(id)));
  };

  // ── Calculate Active Scene Time Window ──
  const sceneTimeWindow = React.useMemo(() => {
    if (!scenes || scenes.length === 0) {
      return { start: 0, end: 999999 };
    }
    let start = 0;
    for (let i = 0; i < activeSceneIndex && i < scenes.length; i++) {
      start += (scenes[i].duration_frames || 150) / 30;
    }
    const dur = (activeScene?.duration_frames || scenes[activeSceneIndex]?.duration_frames || 150) / 30;
    return { start, end: start + dur };
  }, [scenes, activeSceneIndex, activeScene]);

  // ── Synchronize Sentences for Active Scene & Language ──
  React.useEffect(() => {
    let currentList: CaptionSegment[] = [];

    if (activeSubtitleMode === 'translated') {
      currentList =
        translatedSegments && translatedSegments.length > 0
          ? translatedSegments
          : hasTranslatedSegments
          ? segments || []
          : [];
    } else {
      currentList =
        originalSegments && originalSegments.length > 0
          ? originalSegments
          : segments || [];
    }

    // Find segments falling into this scene's window
    const matched =
      scenes && scenes.length > 1
        ? currentList.filter(
            (s) =>
              (s.start >= sceneTimeWindow.start - 0.15 && s.start < sceneTimeWindow.end) ||
              (s.end > sceneTimeWindow.start && s.end <= sceneTimeWindow.end + 0.15)
          )
        : currentList;

    if (matched.length > 0) {
      const parsedItems: SentenceItem[] = matched.map((seg, idx) => {
        const raw = seg.text || '';
        const match = raw.match(/^\[(.*?)\]\s*:\s*([\s\S]+)$/);
        return {
          id: seg.id || `seg_${idx}`,
          segmentId: seg.id,
          speaker: match ? match[1].trim() : undefined,
          text: match ? match[2].trim() : raw.trim(),
          start: seg.start,
          end: seg.end,
        };
      });
      setSceneSentences(parsedItems);
    } else if (activeSubtitleMode === 'translated') {
      // In translated mode, do not fallback to original transcript!
      setSceneSentences([]);
    } else {
      // Fallback only for original mode: parse from activeScene transcript
      const rawText = (activeScene?.voice_transcript || activeScene?.dialogue || activeScene?.voiceover || activeScene?.summary_text || '').trim();
      if (!rawText) {
        setSceneSentences([]);
        return;
      }
      const regex = /\[(.*?)\]\s*:\s*([^\[]+)/g;
      const turnItems: SentenceItem[] = [];
      let m;
      while ((m = regex.exec(rawText)) !== null) {
        turnItems.push({
          id: `raw_${turnItems.length}`,
          speaker: m[1].trim(),
          text: m[2].trim(),
        });
      }
      if (turnItems.length > 0) {
        setSceneSentences(turnItems);
      } else {
        const lines = rawText.split(/\n+/).map((l: string) => l.trim()).filter(Boolean);
        setSceneSentences(lines.map((l: string, i: number) => ({
          id: `line_${i}`,
          text: l,
        })));
      }
    }
  }, [
    activeScene?.scene_id,
    activeSceneIndex,
    activeSubtitleMode,
    segments,
    originalSegments,
    translatedSegments,
    hasTranslatedSegments,
    sceneTimeWindow.start,
    sceneTimeWindow.end,
  ]);

  const handleEditSentenceText = (idx: number, newText: string) => {
    setSceneSentences(prev => prev.map((item, i) => i === idx ? { ...item, text: newText } : item));
  };

  const handleAddSentence = () => {
    const newId = `new_${Date.now()}`;
    const last = sceneSentences[sceneSentences.length - 1];
    const newStart = last?.end !== undefined ? last.end : sceneTimeWindow.start;
    const newEnd = Math.min(sceneTimeWindow.end, newStart + 2.5);
    setSceneSentences(prev => [
      ...prev,
      {
        id: newId,
        text: 'Nội dung phụ đề mới...',
        start: Number(newStart.toFixed(1)),
        end: Number(newEnd.toFixed(1)),
      }
    ]);
  };

  const handleDeleteSentence = (idx: number) => {
    setSceneSentences(prev => prev.filter((_, i) => i !== idx));
  };

  const handleApplyToVideo = () => {
    const baseSegments =
      activeSubtitleMode === 'translated'
        ? (translatedSegments && translatedSegments.length > 0 ? translatedSegments : segments)
        : (originalSegments && originalSegments.length > 0 ? originalSegments : segments);

    let updatedSegments = [...baseSegments];

    sceneSentences.forEach((item) => {
      const fullText = item.speaker ? `[${item.speaker}]: ${item.text}` : item.text;
      const existingIdx = updatedSegments.findIndex(s => String(s.id) === String(item.segmentId));
      if (existingIdx !== -1) {
        const seg = updatedSegments[existingIdx];
        const words = (item.text || '').trim().split(/\s+/).filter(Boolean);
        const dur = Math.max(0.2, (seg.end - seg.start));
        const step = dur / Math.max(1, words.length);
        const newWords = words.map((w, wIdx) => ({
          word: w,
          start: Number((seg.start + wIdx * step).toFixed(2)),
          end: Number((seg.start + (wIdx + 1) * step).toFixed(2)),
          probability: 0.99,
        }));
        updatedSegments[existingIdx] = {
          ...seg,
          text: fullText,
          words: newWords,
        };
      } else if (item.start !== undefined && item.end !== undefined) {
        const words = (item.text || '').trim().split(/\s+/).filter(Boolean);
        const dur = Math.max(0.2, (item.end - item.start));
        const step = dur / Math.max(1, words.length);
        const newWords = words.map((w, wIdx) => ({
          word: w,
          start: Number((item.start! + wIdx * step).toFixed(2)),
          end: Number((item.start! + (wIdx + 1) * step).toFixed(2)),
          probability: 0.99,
        }));
        updatedSegments.push({
          id: item.id,
          start: item.start,
          end: item.end,
          text: fullText,
          words: newWords,
        });
      }
    });

    updatedSegments.sort((a, b) => a.start - b.start);
    onChangeSegments(updatedSegments);

    if (onSaveBothSegments) {
      if (activeSubtitleMode === 'translated') {
        onSaveBothSegments(originalSegments || [], updatedSegments, 'translated');
        // NOTE: In translated mode, DO NOT overwrite scene.voice_transcript with translation!
        // The character's speech bubbles in dialogue scene stay in original spoken language.
      } else {
        onSaveBothSegments(updatedSegments, translatedSegments || [], 'original');
        const fullTranscript = sceneSentences
          .map(item => item.speaker ? `[${item.speaker}]: ${item.text}` : item.text)
          .join('\n');
        onUpdateActiveSceneTranscript?.(fullTranscript);
      }
    } else {
      if (activeSubtitleMode === 'original') {
        const fullTranscript = sceneSentences
          .map(item => item.speaker ? `[${item.speaker}]: ${item.text}` : item.text)
          .join('\n');
        onUpdateActiveSceneTranscript?.(fullTranscript);
      }
    }

    setIsAppliedSuccess(true);
    setTimeout(() => setIsAppliedSuccess(false), 2500);
  };

  const handleAddCustomSegment = () => {
    const newId = Date.now();
    const newSeg: CaptionSegment = {
      id: newId,
      start: 0,
      end: 3.0,
      text: 'Slogan / Phụ đề quảng cáo mới',
    };
    onChangeSegments([...segments, newSeg]);
    setActiveSubTab('timeline');
    setEditingId(newId);
    setEditText('Slogan / Phụ đề quảng cáo mới');
  };

  return (
    <div className="space-y-4">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between pb-2 border-b border-[#252B3E]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 font-bold">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Auto-Captions & Phụ Đề</h3>
            <p className="text-[11px] text-slate-400">
              {isCommercialMusicStyle
                ? 'Mẫu chữ động CapCut & Slogan quảng cáo (BGM)'
                : 'Phụ đề tự động Whisper & Kiểu chữ CapCut'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2333]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── 1. SUBTITLE DISPLAY & POSITION CONTROLS (Moved from Settings/Canvas) ── */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1A1F30] to-[#121522] border border-[#2A334C] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm" />
            <div>
              <span className="text-xs font-black text-white block">Hiển Thị Phụ Đề Trên Video</span>
              <span className="text-[10px] text-slate-400">Khung chữ phụ đề chạy theo video</span>
            </div>
          </div>
          {onToggleSubs && (
            <button
              type="button"
              onClick={onToggleSubs}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                showSubs ? 'bg-cyan-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {showSubs ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showSubs ? 'BẬT' : 'TẮT'}</span>
            </button>
          )}
        </div>

        {showSubs && (
          <div className="space-y-3 pt-2.5 border-t border-[#252B3E]">
            {/* Vị trí hiển thị (Thanh trượt liên tục 5% - 95% + Quick Jump Presets) */}
            {onChangeSubsPosY && (() => {
              const numericSubsPosY = (() => {
                if (typeof subsPosY === 'number') return Math.min(95, Math.max(5, subsPosY));
                if (typeof subsPosY === 'string') {
                  if (subsPosY === 'top') return 15;
                  if (subsPosY === 'middle') return 50;
                  if (subsPosY === 'bottom') return 82;
                  const parsed = parseFloat(subsPosY);
                  if (!isNaN(parsed)) return Math.min(95, Math.max(5, parsed));
                }
                return 82;
              })();

              return (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Vị trí hiển thị phụ đề (Trục Y):</span>
                    </span>
                    <span className="text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-xs">
                      {numericSubsPosY}%
                    </span>
                  </div>

                  <div className="pt-0.5">
                    <input
                      type="range"
                      min={5}
                      max={95}
                      step={1}
                      value={numericSubsPosY}
                      onChange={(e) => onChangeSubsPosY(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#141828] rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    {[
                      { id: 82, icon: AlignVerticalJustifyEnd, label: 'Phía Dưới (82%)' },
                      { id: 50, icon: AlignVerticalJustifyCenter, label: 'Ở Giữa (50%)' },
                      { id: 12, icon: AlignVerticalJustifyStart, label: 'Trên Cùng (12%)' },
                    ].map((pos) => {
                      const PosIcon = pos.icon;
                      const isSelected = Math.abs(numericSubsPosY - pos.id) <= 3;
                      return (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => onChangeSubsPosY(pos.id)}
                          className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-sm'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          <PosIcon className="w-3.5 h-3.5" />
                          <span>{pos.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Phóng to / Thu nhỏ cỡ chữ (Font size zoom slider: 4px - 72px) */}
            {onChangeCaptionFontSize && (
              <div className="space-y-2 pt-2.5 border-t border-[#202638]">
                <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cỡ chữ phụ đề (Zoom Text):</span>
                  </span>
                  <span className="text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 text-xs">
                    {captionFontSize}px
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeCaptionFontSize(Math.max(4, captionFontSize - 2))}
                    className="w-8 h-8 rounded-xl bg-[#141828] hover:bg-[#1E253E] border border-[#252C42] text-white font-black text-xs flex items-center justify-center transition-all active:scale-95 shrink-0"
                    title="Thu nhỏ chữ phụ đề (A-)"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min={4}
                    max={72}
                    step={1}
                    value={captionFontSize}
                    onChange={(e) => onChangeCaptionFontSize(Number(e.target.value))}
                    className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-[#141828] rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => onChangeCaptionFontSize(Math.min(72, captionFontSize + 2))}
                    className="w-8 h-8 rounded-xl bg-[#141828] hover:bg-[#1E253E] border border-[#252C42] text-white font-black text-xs flex items-center justify-center transition-all active:scale-95 shrink-0"
                    title="Phóng to chữ phụ đề (A+)"
                  >
                    A+
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-6 gap-1 pt-0.5">
                  {[
                    { label: 'Cực nhỏ', size: 6 },
                    { label: 'Nhỏ', size: 12 },
                    { label: 'Vừa', size: 20 },
                    { label: 'Chuẩn', size: 28 },
                    { label: 'Lớn', size: 38 },
                    { label: 'Banner', size: 52 },
                  ].map((preset) => (
                    <button
                      key={preset.size}
                      type="button"
                      onClick={() => onChangeCaptionFontSize(preset.size)}
                      className={`py-1 text-[9px] font-bold rounded-lg border transition-all ${
                        captionFontSize === preset.size
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-sm'
                          : 'border-[#23293D] bg-[#121524] text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset.size}px
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 2. TEMPLATE-TAILORED UI (COMMERCIAL BGM vs VOICE AI EXPLAINER) ── */}
      {isCommercialMusicStyle ? (
        /* COMMERCIAL BGM MODE: Informative Banner & Slogan Addition */
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-purple-500/10 border border-purple-400/30 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
            <Music className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Mẫu Quảng Cáo Nhạc Nền (BGM)</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Mẫu này sử dụng nhạc nền thương mại đính kèm. Phụ đề tự động Whisper chỉ áp dụng khi có Giọng đọc Voice AI. Bạn có thể chọn mẫu chữ động CapCut bên dưới và thêm câu Slogan hiển thị trên video.
          </p>
          <button
            type="button"
            onClick={handleAddCustomSegment}
            className="w-full py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Câu Slogan / Tiêu Đề Mới</span>
          </button>
        </div>
      ) : (
        /* VOICE AI NARRATION MODE: Whisper AI Transcriber & Scene Transcript */
        <>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1A1F30] to-[#121522] border border-[#2A334C] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" /> Ngôn ngữ phát âm
              </span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-xs bg-[#181B28] border border-[#2D374D] rounded-xl px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="en">🇺🇸 English</option>
                <option value="ja">🇯🇵 日本語 (Japanese)</option>
                <option value="zh">🇨🇳 中文 (Chinese)</option>
                <option value="ko">🇰🇷 한국어 (Korean)</option>
                <option value="auto">🌐 Tự động nhận diện</option>
              </select>
            </div>

            <button
              onClick={handleStartTranscribe}
              disabled={isTranscribing || isSeparatingLyrics || !audioUrl || !hasVoiceAudio}
              className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                isTranscribing
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : !audioUrl || !hasVoiceAudio
                  ? 'bg-[#202538] text-slate-500 cursor-not-allowed border border-[#282F45]'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-[0.98]'
              }`}
            >
              {isTranscribing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  Đang phân tích Whisper AI...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  {segments.length > 0 ? 'Tạo Lại Phụ Đề Whisper' : 'Tạo Phụ Đề Giọng Đọc (Whisper)'}
                </>
              )}
            </button>

            {/* Dedicated "Add Lyrics" Button (Lọc Beat & Tách Giọng Siêu Nhẹ 100% On-Device) */}
            <button
              type="button"
              onClick={handleStartAddLyrics}
              disabled={isTranscribing || isSeparatingLyrics || !audioUrl}
              className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSeparatingLyrics || isTranscribing
                  ? 'bg-purple-950/60 border border-purple-500/40 text-purple-300 cursor-not-allowed'
                  : !audioUrl
                  ? 'bg-[#181B28] text-slate-500 cursor-not-allowed border border-[#242A3E]'
                  : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:brightness-110 text-white shadow-lg shadow-purple-500/20 active:scale-[0.98]'
              }`}
              title="Lọc bớt tiếng trống, bass & nhạc cụ stereo để Whisper nhận diện lời bài hát (lyrics) chính xác"
            >
              {isSeparatingLyrics ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                  <span>🎵 Đang lọc beat & tách vocal on-device...</span>
                </>
              ) : (
                <>
                  <Music className="w-4 h-4" />
                  <span>🎵 Tạo Lời Bài Hát (Add Lyrics - Lọc Beat)</span>
                </>
              )}
            </button>

            {/* Quick Switch between Original & Translated Subtitles */}
            {hasTranslatedSegments && onChangeSubtitleMode && (
              <div className="pt-2 border-t border-[#252B3E] space-y-1.5">
                <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>Hiển thị trên video:</span>
                  <span className="text-cyan-400 font-bold uppercase">{activeSubtitleMode}</span>
                </div>
                <div className="flex p-1 rounded-xl bg-[#141828] border border-[#262D42]">
                  <button
                    type="button"
                    onClick={() => onChangeSubtitleMode('original')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeSubtitleMode === 'original'
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {getLangFlag(effectiveOriginalLang)} Bản Gốc ({effectiveOriginalLang.toUpperCase()})
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeSubtitleMode('translated')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeSubtitleMode === 'translated'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {getLangFlag(effectiveTargetLang)} Bản Dịch ({effectiveTargetLang.toUpperCase()})
                  </button>
                </div>
              </div>
            )}

            {/* Review & Edit Whisper JSON button */}
            {segments.length > 0 && onOpenReviewModal && (
              <button
                type="button"
                onClick={onOpenReviewModal}
                className="w-full py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Rà Soát & Dịch Phụ Đề (AI Dịch)</span>
              </button>
            )}
          </div>

          {/* ── SỬA PHỤ ĐỀ (TỪNG CÂU & DROPDOWN BẢN DỊCH / BẢN GỐC) ── */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#161A28] to-[#10131E] border border-[#262F47] space-y-3">
            {/* Header: Tiêu đề + Badge phân cảnh + Dropdown ngôn ngữ đã dịch */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-black text-white">Sửa phụ đề</span>
                {activeScene && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                    Cảnh {activeSceneIndex + 1}
                  </span>
                )}
              </div>

              {/* Dropdown chọn ngôn ngữ đã có bản dịch */}
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={activeSubtitleMode}
                  onChange={(e) => onChangeSubtitleMode?.(e.target.value as 'original' | 'translated')}
                  className="text-[11px] font-bold bg-[#141828] border border-[#2D364D] text-cyan-300 rounded-xl px-2 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-sm"
                  title="Chọn ngôn ngữ phụ đề để hiển thị và chỉnh sửa"
                >
                  <option value="original">
                    {getLangFlag(effectiveOriginalLang)} Bản Gốc ({effectiveOriginalLang.toUpperCase()})
                  </option>
                  <option value="translated">
                    {getLangFlag(effectiveTargetLang)} Bản Dịch ({effectiveTargetLang.toUpperCase()})
                  </option>
                </select>
              </div>
            </div>

            {/* Danh sách các câu phụ đề của phân cảnh hiện tại */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 studio-scrollbar">
              {sceneSentences.length === 0 ? (
                activeSubtitleMode === 'translated' ? (
                  <div className="p-4 text-center text-slate-400 border border-dashed border-[#232A3E] rounded-xl text-xs space-y-2">
                    <p className="font-bold text-slate-300">Chưa có phụ đề Bản Dịch ({effectiveTargetLang.toUpperCase()}) cho phân cảnh này</p>
                    <p className="text-[10px] text-slate-400">Bấm nút bên dưới để mở AI dịch tự động từ Bản Gốc ({effectiveOriginalLang.toUpperCase()}) sang Bản Dịch ({effectiveTargetLang.toUpperCase()}).</p>
                    {onOpenReviewModal && (
                      <button
                        type="button"
                        onClick={onOpenReviewModal}
                        className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 mx-auto cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                        <span>Dịch sang {effectiveTargetLang.toUpperCase()} bằng AI</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 border border-dashed border-[#232A3E] rounded-xl text-xs space-y-1">
                    <p className="font-bold text-slate-300">Chưa có câu phụ đề nào ở phân cảnh này</p>
                    <p className="text-[10px] text-slate-500">Bấm nút "Thêm câu" bên dưới để tạo phụ đề mới.</p>
                  </div>
                )
              ) : (
                sceneSentences.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 rounded-xl bg-[#121524] border border-[#232B40] space-y-1.5 focus-within:border-cyan-400/50 transition-all"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-cyan-400">#{idx + 1}</span>
                        {item.speaker && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                            {item.speaker}
                          </span>
                        )}
                        {item.start !== undefined && (
                          <span className="font-mono text-[10px] text-slate-400">
                            ⏱️ {formatTimestamp(item.start)} → {formatTimestamp(item.end)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSentence(idx)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                        title="Xóa câu này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <textarea
                      value={item.text}
                      onChange={(e) => handleEditSentenceText(idx, e.target.value)}
                      rows={2}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs leading-relaxed border border-[#262F47] bg-[#0C0E18] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-mono"
                      placeholder="Nhập nội dung phụ đề câu này..."
                    />
                  </div>
                ))
              )}
            </div>

            {/* Thanh công cụ: Thêm câu & Nút Áp Dụng Vào Video */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#20273D]">
              <button
                type="button"
                onClick={handleAddSentence}
                className="py-2 px-3 rounded-xl border border-[#2A3550] bg-[#141828] hover:bg-[#1C2238] text-slate-300 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0"
                title="Thêm một câu phụ đề mới vào phân cảnh này"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Thêm câu</span>
              </button>

              <button
                type="button"
                onClick={handleApplyToVideo}
                className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md cursor-pointer ${
                  isAppliedSuccess
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-cyan-500/20'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isAppliedSuccess ? 'Đã Áp Dụng Vào Video!' : 'Áp Dụng Vào Video'}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── 3. SUB-TABS (PRESETS, TIMELINE, NEWS BADGE) ── */}
      <div className="flex bg-[#181B28] p-1 rounded-xl border border-[#252B3E]">
        <button
          onClick={() => setActiveSubTab('presets')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'presets'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          10 Kiểu CapCut
        </button>
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'timeline'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Edit2 className="w-3.5 h-3.5" />
          Timeline ({segments.length})
        </button>
        {isNewsStyle && (
          <button
            onClick={() => setActiveSubTab('news_badge')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'news_badge'
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-red-400" />
            Tin Mới
          </button>
        )}
      </div>

      {/* ── SUB-TAB: NEWS BADGE ── */}
      {activeSubTab === 'news_badge' && isNewsStyle && (
        <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1 studio-scrollbar">
          <div className="p-3 rounded-xl bg-[#181B28] border border-[#2A334C] space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              Nội dung Thanh Tin Mới (Source Badge)
            </label>
            <input
              type="text"
              value={sourceBadgeText}
              onChange={(e) => onChangeSourceBadgeText?.(e.target.value)}
              placeholder="VD: TIN MỚI TỪ VNEXPRESS..."
              className="w-full bg-[#11131E] border border-[#2D374D] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '🇻🇳 VNExpress', text: 'TIN MỚI TỪ VNEXPRESS' },
                { label: '🇻🇳 Tuổi Trẻ', text: 'TIN MỚI TỪ TUỔI TRẺ' },
                { label: '🇺🇸 Breaking BBC', text: 'BREAKING NEWS: BBC' },
                { label: '🇺🇸 CNN Live', text: 'LIVE: CNN SPECIAL REPORT' },
                { label: '🇯🇵 NHK News', text: '最新ニュース: NHK' },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => onChangeSourceBadgeText?.(p.text)}
                  className="text-[10px] bg-[#22273B] hover:bg-[#2E354F] text-slate-300 hover:text-white px-2 py-0.5 rounded-lg border border-[#2F3854] transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#181B28] border border-[#2A334C] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-cyan-400" />
                Vị trí Thanh Tin Mới (X / Y)
              </span>
              <span className="text-[11px] text-slate-400">
                X: {sourceBadgePosX}% • Y: {sourceBadgePosY}%
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Trái qua phải (X)</span>
                  <span>{sourceBadgePosX}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="80"
                  value={sourceBadgePosX}
                  onChange={(e) => onChangeSourceBadgePosX?.(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-[#252B3E] rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Trên xuống dưới (Y)</span>
                  <span>{sourceBadgePosY}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="80"
                  value={sourceBadgePosY}
                  onChange={(e) => onChangeSourceBadgePosY?.(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-[#252B3E] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#181B28] border border-[#2A334C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Độ cao Phụ đề (Cách đáy màn hình)
              </span>
              <span className="text-[11px] text-amber-400 font-bold">{captionPosY}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={captionPosY}
              onChange={(e) => onChangeCaptionPosY?.(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-[#252B3E] rounded-lg cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#181B28] border border-[#2A334C] space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>⚡</span>
              Dòng Chữ Chạy Tin Vắn (Ticker Running Text)
            </label>
            <input
              type="text"
              value={tickerText}
              onChange={(e) => onChangeTickerText?.(e.target.value)}
              placeholder="VD: ⚡ BẢN TIN NÓNG • Cập nhật liên tục 24/7..."
              className="w-full bg-[#11131E] border border-[#2D374D] rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      )}

      {/* ── SUB-TAB: 10 KIỂU CAPCUT PRESETS ── */}
      {activeSubTab === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1 studio-scrollbar">
          {(Object.entries(CAPTION_PRESET_LABELS) as [CaptionPresetStyle, { label: string; desc: string; icon: string }][]).map(([id, preset]) => {
            const isSelected = presetStyle === id;
            return (
              <div
                key={id}
                onClick={() => onChangePresetStyle(id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 active:scale-[0.98] ${
                  isSelected
                    ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/10'
                    : 'border-[#252B3E] bg-[#161824] hover:border-slate-500 hover:bg-[#1C2030]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#202538] flex items-center justify-center text-xl shrink-0">
                  {preset.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{preset.label}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{preset.desc}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── SUB-TAB: TIMELINE SEGMENTS ── */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 studio-scrollbar">
          {segments.length === 0 ? (
            <div className="p-6 text-center text-slate-400 border border-dashed border-[#252B3E] rounded-2xl space-y-2">
              <Type className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="text-xs font-bold text-slate-300">Chưa có phụ đề hoặc slogan nào</p>
              <p className="text-[11px] text-slate-500">
                {isCommercialMusicStyle
                  ? 'Bấm nút "Thêm Câu Slogan" ở trên để tạo câu quảng cáo.'
                  : 'Bấm "Tạo Phụ Đề Tự Động" ở trên để Whisper AI trích xuất mốc thời gian.'}
              </p>
            </div>
          ) : (
            segments.map((seg) => (
              <div
                key={seg.id}
                className="p-3 rounded-xl border border-[#252B3E] bg-[#161824] space-y-2"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-[#202538] text-cyan-300">
                    ⏱️ {seg.start}s → {seg.end}s
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(seg.id);
                        setEditText(seg.text);
                      }}
                      className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-[#202538] rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSegment(seg.id)}
                      className="p-1 text-slate-400 hover:text-red-400 hover:bg-[#202538] rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {editingId === seg.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 text-xs bg-[#12141F] border border-cyan-400 rounded-lg text-white focus:outline-none"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 text-[11px] rounded bg-[#202538] text-slate-300 hover:bg-[#282F45]"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleUpdateText(seg.id)}
                        className="px-2.5 py-1 text-[11px] rounded bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-white leading-relaxed">{seg.text}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
