'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Play,
  Trash2,
  Plus,
  Languages,
  Loader2,
  Clock,
  Globe,
  FileCheck,
} from 'lucide-react';
import { CaptionSegment } from '../subtitles/CapCutCaptionRenderer';
import { wynmotionService } from '@/services/wynmotionService';

export interface CaptionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioUrl?: string;
  originalLanguage?: string;
  segments: CaptionSegment[];
  initialTranslatedSegments?: CaptionSegment[] | null;
  initialTargetLang?: string;
  initialActiveMode?: 'original' | 'translated';
  projectId?: string;
  onSeek?: (seconds: number) => void;
  onSaveOriginal: (segments: CaptionSegment[], lang: string) => Promise<void> | void;
  onSaveTranslated: (
    originalSegments: CaptionSegment[],
    translatedSegments: CaptionSegment[],
    sourceLang: string,
    targetLang: string
  ) => Promise<void> | void;
}

const SUPPORTED_TARGET_LANGUAGES = [
  { code: 'en', label: 'English (US/UK)', flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ja', label: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'ko', label: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'zh', label: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'fr', label: 'Français (French)', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'es', label: 'Español (Spanish)', flag: '🇪🇸' },
];

function formatTimestamp(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}

export const CaptionReviewModal: React.FC<CaptionReviewModalProps> = ({
  isOpen,
  onClose,
  audioUrl,
  originalLanguage = 'vi',
  segments: initialSegments,
  initialTranslatedSegments = null,
  initialTargetLang = 'en',
  initialActiveMode = 'original',
  projectId,
  onSeek,
  onSaveOriginal,
  onSaveTranslated,
}) => {
  const [segments, setSegments] = useState<CaptionSegment[]>(initialSegments);
  const [selectedTargetLang, setSelectedTargetLang] = useState<string>(initialTargetLang || 'en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedSegments, setTranslatedSegments] = useState<CaptionSegment[] | null>(initialTranslatedSegments || null);
  const [activeViewMode, setActiveViewMode] = useState<'original' | 'translated'>(
    initialTranslatedSegments && initialTranslatedSegments.length > 0 && initialActiveMode === 'translated'
      ? 'translated'
      : 'original'
  );
  const [playingSegmentId, setPlayingSegmentId] = useState<string | number | null>(null);

  // Synchronize when modal opens or initialSegments/initialTranslatedSegments change
  React.useEffect(() => {
    if (isOpen) {
      setSegments(initialSegments);
      if (initialTranslatedSegments && initialTranslatedSegments.length > 0) {
        setTranslatedSegments(initialTranslatedSegments);
        setActiveViewMode(initialActiveMode || 'translated');
      } else {
        setTranslatedSegments(null);
        setActiveViewMode('original');
      }
      if (initialTargetLang) {
        setSelectedTargetLang(initialTargetLang);
      }
    }
  }, [isOpen, initialSegments, initialTranslatedSegments, initialActiveMode, initialTargetLang]);

  const regenerateWords = (text: string, start: number, end: number) => {
    const wordList = (text || '').trim().split(/\s+/).filter(Boolean);
    if (wordList.length === 0) return [];
    const duration = Math.max(0.2, end - start);
    const step = duration / wordList.length;
    return wordList.map((w, idx) => ({
      word: w,
      start: Number((start + idx * step).toFixed(2)),
      end: Number((start + (idx + 1) * step).toFixed(2)),
      probability: 0.99,
    }));
  };

  const handleUpdateText = (id: string | number, text: string) => {
    if (activeViewMode === 'original') {
      setSegments((prev) =>
        prev.map((s) => (String(s.id) === String(id) ? { ...s, text, words: regenerateWords(text, s.start, s.end) } : s))
      );
    } else {
      setTranslatedSegments((prev) =>
        prev ? prev.map((s) => (String(s.id) === String(id) ? { ...s, text, words: regenerateWords(text, s.start, s.end) } : s)) : null
      );
    }
  };

  const handleDelete = (id: string | number) => {
    if (activeViewMode === 'original') {
      setSegments((prev) => prev.filter((s) => String(s.id) !== String(id)));
    } else {
      setTranslatedSegments((prev) => (prev ? prev.filter((s) => String(s.id) !== String(id)) : null));
    }
  };

  const handleAddSegment = () => {
    const targetList = activeViewMode === 'original' ? segments : (translatedSegments || segments);
    const lastSeg = targetList[targetList.length - 1];
    const newStart = lastSeg ? lastSeg.end : 0;
    const newEnd = Number((newStart + 2.5).toFixed(2));
    const newText = 'Lời thoại mới...';
    const newSeg: CaptionSegment = {
      id: Date.now(),
      start: newStart,
      end: newEnd,
      text: newText,
      words: regenerateWords(newText, newStart, newEnd),
    };
    if (activeViewMode === 'original') {
      setSegments((prev) => [...prev, newSeg]);
    } else {
      setTranslatedSegments((prev) => (prev ? [...prev, newSeg] : [newSeg]));
    }
  };

  const handlePlayPreview = (seg: CaptionSegment) => {
    if (onSeek) {
      onSeek(seg.start);
      setPlayingSegmentId(seg.id);
      setTimeout(() => setPlayingSegmentId(null), 3000);
    }
  };

  // 1. Action: Save Original directly
  const handleConfirmOriginal = async () => {
    const finalOriginal = segments.map((s) => ({
      ...s,
      words: regenerateWords(s.text, s.start, s.end),
    }));
    await onSaveOriginal(finalOriginal, originalLanguage);
    onClose();
  };

  // 2. Action: Translate using DeepSeek
  const handleTranslateWithDeepSeek = async () => {
    if (segments.length === 0) return;
    setIsTranslating(true);
    try {
      const res = await wynmotionService.translateCaptions(
        segments,
        selectedTargetLang,
        originalLanguage
      );
      if (res && res.segments) {
        const prepared = res.segments.map((s) => ({
          ...s,
          words: (s.words && s.words.length > 0) ? s.words : regenerateWords(s.text, s.start, s.end),
        }));
        setTranslatedSegments(prepared);
        setActiveViewMode('translated');
      }
    } catch (err: any) {
      console.error('DeepSeek translation error:', err);
      alert(err.message || 'Lỗi khi dịch phụ đề bằng DeepSeek AI');
    } finally {
      setIsTranslating(false);
    }
  };

  // 3. Action: Confirm and Save Both to DB
  const handleConfirmTranslated = async () => {
    if (!translatedSegments) return;
    const finalTranslated = translatedSegments.map((s) => ({
      ...s,
      words: regenerateWords(s.text, s.start, s.end),
    }));
    const finalOriginal = segments.map((s) => ({
      ...s,
      words: regenerateWords(s.text, s.start, s.end),
    }));
    await onSaveTranslated(
      finalOriginal,
      finalTranslated,
      originalLanguage,
      selectedTargetLang
    );
    onClose();
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeList = activeViewMode === 'original' ? segments : (translatedSegments || segments);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-[#12141F] border border-[#232A3E] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        
        {/* ── HEADER ── */}
        <div className="px-6 py-4 border-b border-[#1E2333] flex items-center justify-between bg-[#0E1017]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Kiểm Tra & Chỉnh Sửa Phụ Đề Whisper</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Bước 1: Rà soát câu chữ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sửa lại các từ, tên riêng nếu AI nghe chưa chuẩn trước khi Dịch sang ngôn ngữ khác hoặc áp dụng lên Video
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── SUB-BAR: LANGUAGE & STATS & MODE TOGGLE ── */}
        <div className="px-6 py-2.5 bg-[#161926] border-b border-[#22283A] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ngôn ngữ Audio:</span>
              <span className="text-cyan-300 font-bold uppercase">{originalLanguage}</span>
            </span>

            <span className="h-3 w-px bg-slate-700" />

            <span className="text-slate-400 font-mono">
              Tổng số câu: <strong className="text-white">{segments.length}</strong>
            </span>
          </div>

          {/* Mode Switch if translated exists */}
          {translatedSegments && (
            <div className="flex items-center p-0.5 rounded-xl bg-[#0F111A] border border-[#23293D]">
              <button
                type="button"
                onClick={() => setActiveViewMode('original')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  activeViewMode === 'original'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bản Gốc ({originalLanguage})
              </button>
              <button
                type="button"
                onClick={() => setActiveViewMode('translated')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  activeViewMode === 'translated'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bản Dịch ({selectedTargetLang.toUpperCase()})
              </button>
            </div>
          )}
        </div>

        {/* ── BODY: SCROLLABLE LIST OF TIMED SEGMENTS ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 studio-scrollbar">
          {activeList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-600" />
              <p>Chưa có phân đoạn phụ đề nào. Bấm nút bên dưới để thêm.</p>
            </div>
          ) : (
            activeList.map((seg, idx) => (
              <div
                key={seg.id || idx}
                className="group p-3.5 rounded-xl bg-[#171B2B] hover:bg-[#1A1F32] border border-[#232A3E] hover:border-cyan-500/40 transition-all flex items-start gap-3 shadow-sm"
              >
                {/* Index badge */}
                <div className="w-6 h-6 rounded-lg bg-[#22283A] text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-1">
                  {idx + 1}
                </div>

                {/* Time Range Pill + Seek Button */}
                <div className="flex flex-col gap-1.5 shrink-0 pt-0.5">
                  <div className="px-2.5 py-1 rounded-lg bg-[#0F111A] border border-[#23293D] font-mono text-[11px] text-cyan-300 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{formatTimestamp(seg.start)}</span>
                    <span className="text-slate-500">→</span>
                    <span>{formatTimestamp(seg.end)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlayPreview(seg)}
                    title="Nghe thử phân đoạn này"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                      playingSegmentId === seg.id
                        ? 'bg-cyan-400 text-slate-950 font-black'
                        : 'bg-[#22293C] text-slate-300 hover:bg-[#2C354E] hover:text-white'
                    }`}
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Nghe</span>
                  </button>
                </div>

                {/* Text Editing Area */}
                <div className="flex-1 min-w-0">
                  <textarea
                    value={seg.text}
                    rows={2}
                    onChange={(e) => handleUpdateText(seg.id, e.target.value)}
                    placeholder="Nội dung phụ đề tại mốc thời gian này..."
                    className="w-full bg-[#0F111A] border border-[#262E44] focus:border-cyan-400 focus:bg-[#121624] text-white text-xs rounded-xl p-2.5 resize-none transition-all leading-relaxed outline-none"
                  />
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDelete(seg.id)}
                  title="Xóa phân đoạn"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}

          {/* Add Segment Button */}
          <button
            type="button"
            onClick={handleAddSegment}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#29324B] hover:border-cyan-400 text-slate-400 hover:text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Phân Đoạn Phụ Đề Mới</span>
          </button>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="px-6 py-4 bg-[#0E1017] border-t border-[#1E2333] flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: Quick Save Original */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmOriginal}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all border border-slate-700 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Lưu & Dùng Bản Gốc ({originalLanguage.toUpperCase()})</span>
            </button>
          </div>

          {/* Right: DeepSeek Translation Controls */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-[#171B2B] px-3 py-1.5 rounded-xl border border-[#262D42]">
              <Languages className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-300">Dịch sang:</span>
              <select
                value={selectedTargetLang}
                onChange={(e) => setSelectedTargetLang(e.target.value)}
                disabled={isTranslating}
                className="bg-[#0F111A] text-white text-xs font-bold border border-[#2D364E] rounded-lg px-2 py-1 outline-none focus:border-purple-400 cursor-pointer"
              >
                {SUPPORTED_TARGET_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Translate Button */}
            {!translatedSegments ? (
              <button
                type="button"
                onClick={handleTranslateWithDeepSeek}
                disabled={isTranslating || segments.length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-xs shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>DeepSeek đang dịch...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Dịch Phụ Đề (DeepSeek)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmTranslated}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Lưu Cả Gốc & Dịch Vào DB → Áp Dụng Lên Video</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
