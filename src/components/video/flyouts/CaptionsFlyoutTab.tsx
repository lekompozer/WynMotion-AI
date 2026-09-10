'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Film,
  Download,
  Copy,
  Layers,
  Wrench,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { CaptionSegment, CaptionPresetStyle } from '../subtitles/CapCutCaptionRenderer';
import { filterVocalTrackFromAudioUrl } from '@/utils/audioVocalFilter';
import { useApp } from '@/contexts/AppContext';

export type TextPosition = 'top' | 'middle' | 'bottom' | string | number;

export type CaptionsMainTab = 'view' | 'create' | 'edit' | 'type' | 'tools';

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
  onExtractAudioFromScene?: (sceneIdOrIndex?: string | number) => Promise<string | undefined>;
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

function formatSrtTimestamp(sec: number): string {
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
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
  onExtractAudioFromScene,
}) => {
  const { t, isVietnamese } = useApp();

  const [activeMainTab, setActiveMainTab] = useState<CaptionsMainTab>('view');
  const [editScopeMode, setEditScopeMode] = useState<'scene' | 'timeline'>('scene');

  const effectiveOriginalLang = useMemo(() => {
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

  const effectiveTargetLang = useMemo(() => {
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

  useEffect(() => {
    if (effectiveOriginalLang) {
      setSelectedLanguage(effectiveOriginalLang);
    }
  }, [effectiveOriginalLang]);

  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [isSeparatingLyrics, setIsSeparatingLyrics] = useState(false);
  const [isExtractingAudio, setIsExtractingAudio] = useState(false);
  const [sceneSentences, setSceneSentences] = useState<SentenceItem[]>([]);
  const [isAppliedSuccess, setIsAppliedSuccess] = useState(false);
  const [isCopiedSuccess, setIsCopiedSuccess] = useState(false);

  // Check if any scene has an uploaded video
  const firstVideoScene = useMemo(() => {
    return (scenes || []).find((s) => s.video_url) || (activeScene?.video_url ? activeScene : undefined);
  }, [scenes, activeScene]);

  const hasVideoInScenes = Boolean(firstVideoScene?.video_url);

  const isNewsStyle =
    visualStyle === 'video_news_60s' ||
    visualStyle === 'news_video' ||
    visualStyle === 'breaking_news' ||
    visualStyle === 'video_news';

  // 10+ CapCut Presets Definition with Bilingual Support
  const CAPTION_PRESETS: Array<{
    id: CaptionPresetStyle;
    label: string;
    desc: string;
    icon: string;
  }> = useMemo(
    () => [
      {
        id: 'karaoke_glow',
        label: 'Karaoke Glow',
        desc: t('Từ đang đọc đổi màu vàng & phát sáng', 'Active word turns yellow & glows'),
        icon: '🎤',
      },
      {
        id: 'spring_bounce',
        label: 'Spring Bounce',
        desc: t('Chữ nảy nhún 3D theo từng từ phát âm', '3D spring bounce animation per word'),
        icon: '⚡',
      },
      {
        id: 'block_white_on_black',
        label: t('Hộp Đen Chữ Trắng', 'Black Box (White Text)'),
        desc: t('Chữ trắng trên nền đen bo góc tĩnh', 'White text on solid dark rounded container'),
        icon: '⬛',
      },
      {
        id: 'block_black_on_white',
        label: t('Hộp Trắng Chữ Đen', 'White Box (Dark Text)'),
        desc: t('Chữ đen trên nền trắng thanh lịch', 'Dark text on clean white rounded container'),
        icon: '⬜',
      },
      {
        id: 'clean_white',
        label: t('Trắng Điện Ảnh', 'Cinematic White'),
        desc: t('Chữ trắng không nền, bóng mờ dịu mắt', 'Minimal white text with soft shadow'),
        icon: '⚪',
      },
      {
        id: 'clean_black',
        label: t('Đen Tương Phản', 'High Contrast Black'),
        desc: t('Chữ đen không nền, sắc nét tinh tế', 'Bold dark text with crisp readability'),
        icon: '⚫',
      },
      {
        id: 'gradient_wave',
        label: 'Gradient Wave',
        desc: t('Dải màu cầu vồng, từ đọc sáng rực', 'Rainbow gradient with illuminated active word'),
        icon: '🌊',
      },
      {
        id: 'comic_slant',
        label: 'Comic Slant',
        desc: t('Nghiêng 4°, viền nét vẽ Manga rõ nét', 'Angled 4° manga outline with stroke'),
        icon: '💥',
      },
      {
        id: 'cyberpunk_neon',
        label: 'Cyberpunk Neon',
        desc: t('Viền đèn neon phát sáng Cyan & Magenta', 'Futuristic glowing cyan & magenta neon'),
        icon: '🌆',
      },
      {
        id: 'pill_badge',
        label: 'Pill Badge',
        desc: t('Từ đang nói nằm trong khung bo gradient', 'Active word wrapped in rounded badge pill'),
        icon: '💊',
      },
      {
        id: 'minimal_bar',
        label: 'Minimal Glass',
        desc: t('Dải kính mờ thanh lịch ở chân video', 'Frosted glass bar at the bottom'),
        icon: '✨',
      },
      {
        id: 'fashion_serif',
        label: 'Luxury Serif',
        desc: t('Chữ nghiêng Playfair sang trọng', 'High-fashion editorial serif styling'),
        icon: '👑',
      },
      {
        id: 'news_flash',
        label: 'News Flash',
        desc: t('Bật từ in đậm cỡ lớn ngay giữa màn hình', 'Punchy bold headlines at center'),
        icon: '🔥',
      },
      {
        id: 'typewriter_cursor',
        label: 'Typewriter',
        desc: t('Đánh máy từng chữ kèm con trỏ nhấp nháy', 'Typing animation with blinking cursor'),
        icon: '⌨️',
      },
    ],
    [t]
  );

  const handleExtractAudio = async () => {
    if (!hasVideoInScenes || !onExtractAudioFromScene) return undefined;
    setIsExtractingAudio(true);
    try {
      const resUrl = await onExtractAudioFromScene(activeScene?.scene_id || firstVideoScene?.scene_id);
      return resUrl;
    } finally {
      setIsExtractingAudio(false);
    }
  };

  const handleStartTranscribe = async () => {
    let currentAudioUrl = audioUrl;
    if (!currentAudioUrl && hasVideoInScenes && onExtractAudioFromScene) {
      currentAudioUrl = await handleExtractAudio();
    }
    if (!currentAudioUrl) {
      alert(
        t(
          'Vui lòng tạo âm thanh Giọng đọc AI, tải lên Audio hoặc tách MP3 từ video phân cảnh trước khi tạo phụ đề tự động.',
          'Please generate AI voice, upload audio, or extract MP3 from scene video before generating auto-captions.'
        )
      );
      return;
    }
    await onTranscribeWhisper(currentAudioUrl, selectedLanguage);
  };

  const handleStartAddLyrics = async () => {
    let currentAudioUrl = audioUrl;
    if (!currentAudioUrl && hasVideoInScenes && onExtractAudioFromScene) {
      currentAudioUrl = await handleExtractAudio();
    }
    if (!currentAudioUrl) {
      alert(
        t(
          'Vui lòng chọn hoặc tải lên bài hát / audio hoặc tách MP3 từ video phân cảnh trước khi tạo lời bài hát.',
          'Please select/upload music audio or extract MP3 from video before generating lyrics.'
        )
      );
      return;
    }
    setIsSeparatingLyrics(true);
    try {
      // Step 1: Run lightweight DSP vocal separation on client (Mid-Side Extraction + Bandpass)
      const cleanAudioUrl = await filterVocalTrackFromAudioUrl(currentAudioUrl);
      // Step 2: Feed into Whisper
      await onTranscribeWhisper(cleanAudioUrl, selectedLanguage);
    } catch (err: any) {
      console.error('Error in Add Lyrics:', err);
      await onTranscribeWhisper(currentAudioUrl, selectedLanguage);
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
  const sceneTimeWindow = useMemo(() => {
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
  useEffect(() => {
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
      setSceneSentences([]);
    } else {
      const rawText = (
        activeScene?.voice_transcript ||
        activeScene?.dialogue ||
        activeScene?.voiceover ||
        activeScene?.summary_text ||
        ''
      ).trim();
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
        setSceneSentences(
          lines.map((l: string, i: number) => ({
            id: `line_${i}`,
            text: l,
          }))
        );
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
    scenes,
    activeScene,
  ]);

  const handleEditSentenceText = (idx: number, newText: string) => {
    setSceneSentences((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, text: newText } : item))
    );
  };

  const handleAddSentence = () => {
    const newId = `new_${Date.now()}`;
    const last = sceneSentences[sceneSentences.length - 1];
    const newStart = last?.end !== undefined ? last.end : sceneTimeWindow.start;
    const newEnd = Math.min(sceneTimeWindow.end, newStart + 2.5);
    setSceneSentences((prev) => [
      ...prev,
      {
        id: newId,
        text: t('Nội dung phụ đề mới...', 'New subtitle text...'),
        start: Number(newStart.toFixed(1)),
        end: Number(newEnd.toFixed(1)),
      },
    ]);
  };

  const handleDeleteSentence = (idx: number) => {
    setSceneSentences((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleApplyToVideo = () => {
    const baseSegments =
      activeSubtitleMode === 'translated'
        ? translatedSegments && translatedSegments.length > 0
          ? translatedSegments
          : segments
        : originalSegments && originalSegments.length > 0
        ? originalSegments
        : segments;

    let updatedSegments = [...baseSegments];

    sceneSentences.forEach((item) => {
      const fullText = item.speaker ? `[${item.speaker}]: ${item.text}` : item.text;
      const existingIdx = updatedSegments.findIndex((s) => String(s.id) === String(item.segmentId));
      if (existingIdx !== -1) {
        const seg = updatedSegments[existingIdx];
        const words = (item.text || '').trim().split(/\s+/).filter(Boolean);
        const dur = Math.max(0.2, seg.end - seg.start);
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
        const dur = Math.max(0.2, item.end - item.start);
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
      } else {
        onSaveBothSegments(updatedSegments, translatedSegments || [], 'original');
        const fullTranscript = sceneSentences
          .map((item) => (item.speaker ? `[${item.speaker}]: ${item.text}` : item.text))
          .join('\n');
        onUpdateActiveSceneTranscript?.(fullTranscript);
      }
    } else {
      if (activeSubtitleMode === 'original') {
        const fullTranscript = sceneSentences
          .map((item) => (item.speaker ? `[${item.speaker}]: ${item.text}` : item.text))
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
      text: t('Slogan / Phụ đề quảng cáo mới', 'New Slogan / Promotional Subtitle'),
    };
    onChangeSegments([...segments, newSeg]);
    setActiveMainTab('edit');
    setEditScopeMode('timeline');
    setEditingId(newId);
    setEditText(t('Slogan / Phụ đề quảng cáo mới', 'New Slogan / Promotional Subtitle'));
  };

  const handleCopyTranscript = () => {
    const allText = segments.map((s, idx) => `${idx + 1}. [${formatTimestamp(s.start)} - ${formatTimestamp(s.end)}] ${s.text}`).join('\n');
    if (!allText) {
      alert(t('Chưa có phụ đề để sao chép.', 'No subtitles to copy.'));
      return;
    }
    navigator.clipboard.writeText(allText);
    setIsCopiedSuccess(true);
    setTimeout(() => setIsCopiedSuccess(false), 2000);
  };

  const handleDownloadSrt = () => {
    if (segments.length === 0) {
      alert(t('Chưa có phụ đề để xuất file SRT.', 'No subtitles available to export as SRT.'));
      return;
    }
    const srtContent = segments
      .map((seg, idx) => {
        const start = formatSrtTimestamp(seg.start);
        const end = formatSrtTimestamp(seg.end);
        return `${idx + 1}\n${start} --> ${end}\n${seg.text}\n`;
      })
      .join('\n');

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wynmotion_subtitles_${Date.now()}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAllSegments = () => {
    if (segments.length === 0) return;
    if (
      confirm(
        t(
          'Bạn có chắc chắn muốn xóa toàn bộ phụ đề trong video này?',
          'Are you sure you want to clear all subtitles from this video?'
        )
      )
    ) {
      onChangeSegments([]);
    }
  };

  // Horizontal Tabs configuration
  const tabs: Array<{ id: CaptionsMainTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'view', label: t('Hiển Thị', 'View'), icon: Eye },
    { id: 'create', label: t('Tạo Mới', 'Create New'), icon: Wand2 },
    { id: 'edit', label: t('Sửa Chữ', 'Edit'), icon: Edit3 },
    { id: 'type', label: t('Kiểu Chữ', 'Type'), icon: Sparkles },
    { id: 'tools', label: t('Công Cụ', 'Tools'), icon: Wrench },
  ];

  return (
    <div className="space-y-3.5">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#252B3E]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>{t('Auto-Captions & Phụ Đề', 'Auto-Captions & Subtitles')}</span>
              {segments.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  {segments.length}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isCommercialMusicStyle
                ? t('Mẫu chữ động CapCut & Slogan quảng cáo', 'CapCut dynamic fonts & BGM slogans')
                : t('Phụ đề tự động Whisper & Kiểu chữ CapCut', 'Whisper auto-captions & CapCut typography')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-[#1E2333] transition-colors"
          title={t('Đóng', 'Close')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── HORIZONTAL TABS BAR (View - Create New - Edit - Type - Tools) ── */}
      <div className="grid grid-cols-5 p-1 rounded-2xl bg-[#141828] border border-[#252B3E] gap-1 shadow-inner">
        {tabs.map((tabItem) => {
          const TabIcon = tabItem.icon;
          const isActive = activeMainTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setActiveMainTab(tabItem.id)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#1A2033]'
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span className="text-[11px] leading-none truncate">{tabItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: VIEW (Hiển thị & Căn chỉnh)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'view' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Subtitle Display Toggle */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1A1F30] to-[#121522] border border-[#2A334C] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${showSubs ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : 'bg-slate-600'}`} />
                <div>
                  <span className="text-xs font-black text-white block">
                    {t('Hiển Thị Phụ Đề Trên Video', 'Show Subtitles on Video')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {t('Khung chữ phụ đề chạy đồng bộ theo video', 'Subtitles render dynamically synchronized with video')}
                  </span>
                </div>
              </div>
              {onToggleSubs && (
                <button
                  type="button"
                  onClick={onToggleSubs}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    showSubs
                      ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {showSubs ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showSubs ? t('BẬT', 'ON') : t('TẮT', 'OFF')}</span>
                </button>
              )}
            </div>

            {/* Quick Switch between Original & Translated Subtitles */}
            {hasTranslatedSegments && onChangeSubtitleMode && (
              <div className="pt-2.5 border-t border-[#252B3E] space-y-1.5">
                <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>{t('Ngôn ngữ hiển thị:', 'Displayed Subtitle Track:')}</span>
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
                    {getLangFlag(effectiveOriginalLang)} {t('Bản Gốc', 'Original')} ({effectiveOriginalLang.toUpperCase()})
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
                    {getLangFlag(effectiveTargetLang)} {t('Bản Dịch', 'Translated')} ({effectiveTargetLang.toUpperCase()})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Position Y Controls */}
          {showSubs && onChangeSubsPosY && (() => {
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
              <div className="p-3.5 rounded-2xl bg-[#161A28] border border-[#262F47] space-y-2.5">
                <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t('Vị trí hiển thị phụ đề (Trục Y):', 'Vertical Position (Y-Axis):')}</span>
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
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#121524] rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  {[
                    { id: 82, icon: AlignVerticalJustifyEnd, label: t('Phía Dưới (82%)', 'Bottom (82%)') },
                    { id: 50, icon: AlignVerticalJustifyCenter, label: t('Ở Giữa (50%)', 'Center (50%)') },
                    { id: 12, icon: AlignVerticalJustifyStart, label: t('Trên Cùng (12%)', 'Top (12%)') },
                  ].map((pos) => {
                    const PosIcon = pos.icon;
                    const isSelected = Math.abs(numericSubsPosY - pos.id) <= 3;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => onChangeSubsPosY(pos.id)}
                        className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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

          {/* Font Size Zoom Slider */}
          {showSubs && onChangeCaptionFontSize && (
            <div className="p-3.5 rounded-2xl bg-[#161A28] border border-[#262F47] space-y-2.5">
              <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('Cỡ chữ phụ đề (Zoom Font Size):', 'Subtitle Font Size (Zoom Text):')}</span>
                </span>
                <span className="text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 text-xs">
                  {captionFontSize}px
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChangeCaptionFontSize(Math.max(4, captionFontSize - 2))}
                  className="w-8 h-8 rounded-xl bg-[#141828] hover:bg-[#1E253E] border border-[#252C42] text-white font-black text-xs flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer"
                  title={t('Thu nhỏ chữ phụ đề (A-)', 'Decrease text size (A-)')}
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
                  className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-[#121524] rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => onChangeCaptionFontSize(Math.min(72, captionFontSize + 2))}
                  className="w-8 h-8 rounded-xl bg-[#141828] hover:bg-[#1E253E] border border-[#252C42] text-white font-black text-xs flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer"
                  title={t('Phóng to chữ phụ đề (A+)', 'Increase text size (A+)')}
                >
                  A+
                </button>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-6 gap-1 pt-0.5">
                {[
                  { label: t('Cực nhỏ', 'Tiny'), size: 6 },
                  { label: t('Nhỏ', 'Small'), size: 12 },
                  { label: t('Vừa', 'Medium'), size: 20 },
                  { label: t('Chuẩn', 'Standard'), size: 28 },
                  { label: t('Lớn', 'Large'), size: 38 },
                  { label: t('Banner', 'Banner'), size: 52 },
                ].map((preset) => (
                  <button
                    key={preset.size}
                    type="button"
                    onClick={() => onChangeCaptionFontSize(preset.size)}
                    className={`py-1 text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${
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

          {/* News Style Configuration (if applicable) */}
          {isNewsStyle && (
            <div className="p-3.5 rounded-2xl bg-[#181B28] border border-[#2A334C] space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>{t('Thanh Nguồn Tin Mới (News Badge & Ticker)', 'News Badge & Running Ticker')}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">
                  {t('Nội dung Thanh Tin Mới (Source Badge):', 'News Source Badge Text:')}
                </label>
                <input
                  type="text"
                  value={sourceBadgeText}
                  onChange={(e) => onChangeSourceBadgeText?.(e.target.value)}
                  placeholder={t('VD: TIN MỚI TỪ VNEXPRESS...', 'e.g. BREAKING NEWS: BBC...')}
                  className="w-full bg-[#11131E] border border-[#2D374D] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">
                  {t('Dòng Chữ Chạy Tin Vắn (Ticker Running Text):', 'Ticker Running Text:')}
                </label>
                <input
                  type="text"
                  value={tickerText}
                  onChange={(e) => onChangeTickerText?.(e.target.value)}
                  placeholder={t('VD: ⚡ BẢN TIN NÓNG • Cập nhật liên tục 24/7...', 'e.g. ⚡ BREAKING • Live updates 24/7...')}
                  className="w-full bg-[#11131E] border border-[#2D374D] rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: CREATE NEW (Tạo Phụ Đề / Lời Bài Hát AI)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'create' && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {isCommercialMusicStyle ? (
            /* COMMERCIAL BGM MODE */
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-purple-500/10 border border-purple-400/30 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <Music className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{t('Mẫu Quảng Cáo Nhạc Nền (BGM)', 'Commercial Background Music (BGM)')}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {t(
                  'Mẫu này sử dụng nhạc nền thương mại đính kèm. Bạn có thể thêm câu Slogan hiển thị sinh động trên video hoặc chọn kiểu chữ CapCut ở tab Kiểu Chữ.',
                  'This project uses commercial background music. You can add animated Slogan phrases or customize typography in the Type tab.'
                )}
              </p>
              <button
                type="button"
                onClick={handleAddCustomSegment}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-500/25 hover:bg-purple-500/40 border border-purple-400/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 text-purple-300" />
                <span>{t('Thêm Câu Slogan / Tiêu Đề Mới', 'Add New Slogan / Headline')}</span>
              </button>
            </div>
          ) : (
            /* VOICE AI & WHISPER AI MODE */
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1A1F30] to-[#121522] border border-[#2A334C] space-y-3.5">
              {/* Spoken Language Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" /> {t('Ngôn ngữ phát âm:', 'Spoken Language:')}
                </span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="text-xs bg-[#181B28] border border-[#2D374D] rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400 cursor-pointer shadow-sm"
                >
                  <option value="vi">🇻🇳 Tiếng Việt</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="ja">🇯🇵 日本語 (Japanese)</option>
                  <option value="zh">🇨🇳 中文 (Chinese)</option>
                  <option value="ko">🇰🇷 한국어 (Korean)</option>
                  <option value="auto">🌐 {t('Tự động nhận diện', 'Auto-detect')}</option>
                </select>
              </div>

              {/* Whisper AI Transcribe Button */}
              <button
                onClick={handleStartTranscribe}
                disabled={isTranscribing || isSeparatingLyrics || isExtractingAudio || (!audioUrl && !hasVideoInScenes)}
                className={`w-full py-3 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                  isTranscribing || isExtractingAudio
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : !audioUrl && !hasVideoInScenes
                    ? 'bg-[#202538] text-slate-500 cursor-not-allowed border border-[#282F45]'
                    : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-cyan-500/20 active:scale-[0.98]'
                }`}
              >
                {isExtractingAudio ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{t('Đang tách MP3 từ video...', 'Extracting MP3 from video...')}</span>
                  </>
                ) : isTranscribing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>{t('Đang phân tích Whisper AI...', 'Analyzing with Whisper AI...')}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>
                      {segments.length > 0
                        ? t('Tạo Lại Phụ Đề Whisper', 'Regenerate Whisper Captions')
                        : t('Tạo Phụ Đề Giọng Đọc (Whisper AI)', 'Generate Voice Captions (Whisper AI)')}
                    </span>
                  </>
                )}
              </button>

              {/* Add Lyrics Button (On-device DSP Vocal Filtering) */}
              <button
                type="button"
                onClick={handleStartAddLyrics}
                disabled={isTranscribing || isSeparatingLyrics || isExtractingAudio || (!audioUrl && !hasVideoInScenes)}
                className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSeparatingLyrics || isTranscribing || isExtractingAudio
                    ? 'bg-purple-950/60 border border-purple-500/40 text-purple-300 cursor-not-allowed'
                    : !audioUrl && !hasVideoInScenes
                    ? 'bg-[#181B28] text-slate-500 cursor-not-allowed border border-[#242A3E]'
                    : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:brightness-110 text-white shadow-lg shadow-purple-500/20 active:scale-[0.98]'
                }`}
                title={t(
                  'Lọc bớt tiếng trống, bass & nhạc cụ stereo để Whisper nhận diện lời bài hát (lyrics) chính xác',
                  'Isolate vocals by filtering instruments on-device so Whisper can transcribe song lyrics'
                )}
              >
                {isSeparatingLyrics ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                    <span>{t('Đang lọc beat & tách vocal on-device...', 'Filtering beat & extracting vocals...')}</span>
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    <span>{t('🎵 Tạo Lời Bài Hát (Add Lyrics - Lọc Beat)', '🎵 Generate Song Lyrics (Add Lyrics)')}</span>
                  </>
                )}
              </button>

              {/* AI Translation & Review Modal */}
              {segments.length > 0 && onOpenReviewModal && (
                <button
                  type="button"
                  onClick={onOpenReviewModal}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>{t('Rà Soát & Dịch Song Ngữ (AI Translation)', 'Review & Translate Captions (AI)')}</span>
                </button>
              )}

              {/* Manual Slogan / Subtitle Button */}
              <button
                type="button"
                onClick={handleAddCustomSegment}
                className="w-full py-2 px-3 rounded-xl border border-[#2A3550] bg-[#141828] hover:bg-[#1C2238] text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('Thêm Một Câu Phụ Đề Thủ Công', 'Add Manual Subtitle Segment')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: EDIT (Sửa Phụ Đề & Timeline)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'edit' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Sub-Switch: Scene Sentences vs Full Timeline */}
          <div className="flex p-1 rounded-xl bg-[#141828] border border-[#262D42]">
            <button
              type="button"
              onClick={() => setEditScopeMode('scene')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                editScopeMode === 'scene'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{t('Theo Phân Cảnh', 'By Scene')}</span>
              {activeScene && (
                <span className="text-[10px] px-1 py-0.2 rounded bg-slate-900/30 font-mono">
                  #{activeSceneIndex + 1}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setEditScopeMode('timeline')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                editScopeMode === 'timeline'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('Toàn Bộ Video', 'Full Timeline')}</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-900/30 font-mono">
                {segments.length}
              </span>
            </button>
          </div>

          {/* SCOPE 1: SCENE SENTENCES */}
          {editScopeMode === 'scene' && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#161A28] to-[#10131E] border border-[#262F47] space-y-3">
              {/* Header: Scene badge + Dropdown Original/Translated */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-black text-white">{t('Sửa phụ đề cảnh', 'Edit scene subtitles')}</span>
                  {activeScene && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                      {t('Cảnh', 'Scene')} {activeSceneIndex + 1}
                    </span>
                  )}
                </div>

                {/* Dropdown switch track */}
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={activeSubtitleMode}
                    onChange={(e) => onChangeSubtitleMode?.(e.target.value as 'original' | 'translated')}
                    className="text-[11px] font-bold bg-[#141828] border border-[#2D364D] text-cyan-300 rounded-xl px-2 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-sm"
                    title={t('Chọn ngôn ngữ để chỉnh sửa', 'Select track to edit')}
                  >
                    <option value="original">
                      {getLangFlag(effectiveOriginalLang)} {t('Bản Gốc', 'Original')} ({effectiveOriginalLang.toUpperCase()})
                    </option>
                    <option value="translated">
                      {getLangFlag(effectiveTargetLang)} {t('Bản Dịch', 'Translated')} ({effectiveTargetLang.toUpperCase()})
                    </option>
                  </select>
                </div>
              </div>

              {/* Sentences List for Current Scene */}
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 studio-scrollbar">
                {sceneSentences.length === 0 ? (
                  activeSubtitleMode === 'translated' ? (
                    <div className="p-4 text-center text-slate-400 border border-dashed border-[#232A3E] rounded-xl text-xs space-y-2">
                      <p className="font-bold text-slate-300">
                        {t(
                          `Chưa có phụ đề Bản Dịch (${effectiveTargetLang.toUpperCase()}) cho phân cảnh này`,
                          `No translated subtitles (${effectiveTargetLang.toUpperCase()}) for this scene yet`
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {t(
                          `Bấm nút bên dưới để mở AI dịch tự động từ Bản Gốc sang Bản Dịch.`,
                          `Click below to translate subtitles using AI translation.`
                        )}
                      </p>
                      {onOpenReviewModal && (
                        <button
                          type="button"
                          onClick={onOpenReviewModal}
                          className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 mx-auto cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                          <span>{t(`Dịch sang ${effectiveTargetLang.toUpperCase()} bằng AI`, `Translate to ${effectiveTargetLang.toUpperCase()} with AI`)}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-400 border border-dashed border-[#232A3E] rounded-xl text-xs space-y-1">
                      <p className="font-bold text-slate-300">{t('Chưa có câu phụ đề nào ở phân cảnh này', 'No subtitle segments in this scene')}</p>
                      <p className="text-[10px] text-slate-500">{t('Bấm nút "Thêm câu" bên dưới để tạo phụ đề mới.', 'Click "Add Sentence" below to create a new segment.')}</p>
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
                          className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                          title={t('Xóa câu này', 'Delete sentence')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <textarea
                        value={item.text}
                        onChange={(e) => handleEditSentenceText(idx, e.target.value)}
                        rows={2}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs leading-relaxed border border-[#262F47] bg-[#0C0E18] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-mono"
                        placeholder={t('Nhập nội dung phụ đề câu này...', 'Enter subtitle sentence text...')}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Actions for Scene: Add sentence & Apply */}
              <div className="flex items-center gap-2 pt-1 border-t border-[#20273D]">
                <button
                  type="button"
                  onClick={handleAddSentence}
                  className="py-2 px-3 rounded-xl border border-[#2A3550] bg-[#141828] hover:bg-[#1C2238] text-slate-300 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0 cursor-pointer"
                  title={t('Thêm một câu phụ đề mới vào phân cảnh này', 'Add a new subtitle sentence in this scene')}
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('Thêm câu', 'Add Sentence')}</span>
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
                  <span>{isAppliedSuccess ? t('Đã Áp Dụng Vào Video!', 'Applied to Video!') : t('Áp Dụng Vào Video', 'Apply to Video')}</span>
                </button>
              </div>
            </div>
          )}

          {/* SCOPE 2: FULL TIMELINE LIST */}
          {editScopeMode === 'timeline' && (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 studio-scrollbar">
              {segments.length === 0 ? (
                <div className="p-6 text-center text-slate-400 border border-dashed border-[#252B3E] rounded-2xl space-y-2">
                  <Type className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                  <p className="text-xs font-bold text-slate-300">{t('Chưa có phụ đề hoặc slogan nào', 'No subtitle segments found')}</p>
                  <p className="text-[11px] text-slate-500">
                    {isCommercialMusicStyle
                      ? t('Bấm nút "Thêm Câu Slogan" ở tab Tạo Mới để tạo câu quảng cáo.', 'Click "Add Slogan" in Create tab to add phrases.')
                      : t('Chuyển sang tab Tạo Mới để Whisper AI tạo phụ đề tự động.', 'Switch to Create New tab to run Whisper AI.')}
                  </p>
                </div>
              ) : (
                segments.map((seg) => (
                  <div
                    key={seg.id}
                    className="p-3 rounded-xl border border-[#252B3E] bg-[#161824] space-y-2"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-[#202538] text-cyan-300 font-mono">
                        ⏱️ {seg.start}s → {seg.end}s
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingId(seg.id);
                            setEditText(seg.text);
                          }}
                          className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-[#202538] rounded cursor-pointer"
                          title={t('Sửa', 'Edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSegment(seg.id)}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-[#202538] rounded cursor-pointer"
                          title={t('Xóa', 'Delete')}
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
                          className="w-full p-2 text-xs bg-[#12141F] border border-cyan-400 rounded-lg text-white focus:outline-none font-mono"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-[11px] rounded bg-[#202538] text-slate-300 hover:bg-[#282F45] cursor-pointer"
                          >
                            {t('Hủy', 'Cancel')}
                          </button>
                          <button
                            onClick={() => handleUpdateText(seg.id)}
                            className="px-2.5 py-1 text-[11px] rounded bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 cursor-pointer"
                          >
                            {t('Lưu', 'Save')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-white leading-relaxed font-mono">{seg.text}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: TYPE (Loại Phụ Đề / 10+ Kiểu CapCut)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'type' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>{t('Chọn phong cách hiệu ứng CapCut:', 'Select CapCut animation preset:')}</span>
            <span className="text-cyan-400 font-bold">{CAPTION_PRESETS.length} {t('mẫu', 'styles')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1 studio-scrollbar">
            {CAPTION_PRESETS.map((preset) => {
              const isSelected = presetStyle === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => onChangePresetStyle(preset.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 active:scale-[0.98] ${
                    isSelected
                      ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/10'
                      : 'border-[#252B3E] bg-[#161824] hover:border-slate-500 hover:bg-[#1C2030]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#202538] flex items-center justify-center text-xl shrink-0 shadow-inner">
                    {preset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{preset.label}</h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{preset.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: TOOLS (Tách MP3 & Công Cụ Tiện Ích)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'tools' && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Tool 1: Extract MP3 from Scene Video */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1A1F30] to-[#121522] border border-[#2A334C] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-300 flex items-center gap-2">
                <Music className="w-4 h-4 text-emerald-400" />
                <span>{t('Tách MP3 Từ Video Phân Cảnh', 'Extract MP3 from Scene Video')}</span>
              </span>
              {hasVideoInScenes && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {t('Cảnh', 'Scene')} {firstVideoScene?.order || firstVideoScene?.scene_id || 1}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {hasVideoInScenes
                ? t(
                    'Trích xuất âm thanh MP3 từ video phân cảnh để kích hoạt Tạo Lời Bài Hát (Add Lyrics) hoặc Phụ đề tự động Whisper.',
                    'Extract audio stream from the uploaded scene video to run AI Auto-Captions or Add Lyrics.'
                  )
                : t(
                    'Không có phân cảnh nào chứa video có âm thanh. Hãy tải lên video vào phân cảnh để sử dụng tính năng này.',
                    'No video clips found in project scenes. Upload a video clip to enable MP3 extraction.'
                  )}
            </p>

            {hasVideoInScenes && (
              <button
                type="button"
                onClick={handleExtractAudio}
                disabled={isExtractingAudio || isTranscribing || isSeparatingLyrics}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                {isExtractingAudio ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{t('Đang trích xuất MP3 từ Video...', 'Extracting MP3 from Video...')}</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4 text-slate-950" />
                    <span>{t('Tách Âm Thanh MP3 Ngay', 'Extract MP3 Audio Now')}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Tool 2: Copy Transcript & Download SRT Subtitle File */}
          <div className="p-3.5 rounded-2xl bg-[#161A28] border border-[#262F47] space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>{t('Xuất & Sao Chép Tệp Phụ Đề', 'Export & Copy Subtitles')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyTranscript}
                disabled={segments.length === 0}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                  segments.length === 0
                    ? 'border-[#23293D] bg-[#121524] text-slate-600 cursor-not-allowed'
                    : isCopiedSuccess
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-[#2D364D] bg-[#141828] hover:bg-[#1E253E] text-slate-300 hover:text-white'
                }`}
              >
                {isCopiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span className="truncate">{isCopiedSuccess ? t('Đã Sao Chép!', 'Copied!') : t('Sao Chép Text', 'Copy Transcript')}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSrt}
                disabled={segments.length === 0}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                  segments.length === 0
                    ? 'border-[#23293D] bg-[#121524] text-slate-600 cursor-not-allowed'
                    : 'border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">{t('Tải Tệp .SRT', 'Export .SRT')}</span>
              </button>
            </div>
          </div>

          {/* Tool 3: Clear All Captions */}
          {segments.length > 0 && (
            <div className="p-3 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-red-300 block">{t('Xóa Toàn Bộ Phụ Đề', 'Clear All Subtitles')}</span>
                  <span className="text-[10px] text-slate-400">{t('Xóa tất cả các câu để tạo lại từ đầu', 'Delete all segments to restart fresh')}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearAllSegments}
                className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
              >
                {t('Xóa Hết', 'Clear All')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
