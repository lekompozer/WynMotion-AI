'use client';

/**
 * MobileVideoEditorStudio.tsx — WynMotion-AI iOS Studio
 *
 * 100% Remotion-Engine Driven Studio with Exact Parity to wordai Web:
 * - Powered by RemotionPlayerProvider (30fps frame-accurate rAF audio playhead)
 * - DynamicAnimationComposition with exact mathematical spring physics & SVG ink extraction
 * - Compact Top Header (Project Title only + 44px Notch Padding)
 * - Compact Floating Aspect Ratio Dropdown (16:9 | 9:16 | 1:1) in Top-Right of Canvas Area
 * - CapCut-style Multi-track Timeline with Audio language switcher (VI / EN) and Proportional Sync
 * - Canvas Bottom Sheets for 2-Layer Text Isolation (White AI Card + Whisper Dark Pill)
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Settings,
  Info,
  Trash2,
  Download,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Folder,
  Music,
  Sliders,
  X,
  Eye,
  EyeOff,
  Upload,
  Loader2,
  RefreshCw,
  Check,
  Layers,
  Volume2,
  Edit3,
  Type,
  Globe,
  Zap,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  ChevronDown,
  Sparkles,
  Palette,
  Share2,
  CheckCircle2,
  AlertCircle,
  Film,
  LayoutTemplate,
  Languages,
  Plus,
  Save,
  Star,
  Send,
  History,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { wynmotionService, MotionProject, MotionScene } from '@/services/wynmotionService';
import { libraryCacheManager } from '@/services/libraryCacheManager';
import { saveAndShareMedia } from '@/utils/mediaSaveHelper';
import { RemotionPlayerProvider, useRemotion, useCurrentFrame, useVideoConfig } from './RemotionEngine';
import { DynamicAnimationComposition } from './DynamicAnimationComposition';
import { DynamicSceneData } from './DynamicSceneRenderer';
import { TemplatesFlyoutTab } from './flyouts/TemplatesFlyoutTab';
import { CaptionsFlyoutTab } from './flyouts/CaptionsFlyoutTab';
import { EffectsFlyoutTab } from './flyouts/EffectsFlyoutTab';
import { MultiTrackTimelineSlider } from './MultiTrackTimelineSlider';
import { TimelineTrack, TimelineItem } from '../../../packages/timeline-core/types';
import { CaptionSegment, CaptionPresetStyle } from './subtitles/CapCutCaptionRenderer';
import { SoundMusicLibraryModal } from '@/components/modals/SoundMusicLibraryModal';
import { NewVoiceLanguageModal, GeneratedVoiceResult } from './modals/NewVoiceLanguageModal';
import { AUDIO_STUDIO_LANGUAGES } from '@/components/tabs/AiVideoTab';

// ─── Constants ─────────────────────────────────────────────────────────────

const BG_THEMES = [
  { label: 'Paper Cream', color: '#FAF7EF' },
  { label: 'Pure White', color: '#FFFFFF' },
  { label: 'Slate Mist', color: '#F1F5F9' },
  { label: 'Dark Navy', color: '#0F172A' },
  { label: 'Night Black', color: '#090A0F' },
  { label: 'Warm Sand', color: '#FFFBEB' },
];

export type TextLangMode = 'vi' | 'en' | 'bilingual';
export type TextPosition = 'top' | 'middle' | 'bottom';
type BottomSheet = null | 'assets' | 'audio' | 'canvas' | 'templates' | 'captions' | 'effects';

function formatTimecode(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 100);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function getSceneDuration(s: DynamicSceneData): number {
  if (s.duration_sec && s.duration_sec > 0) return s.duration_sec;
  if (s.duration_frames && s.duration_frames > 0) return s.duration_frames / 30;
  if (s.end_sec && s.start_sec !== undefined && s.end_sec > s.start_sec) {
    return s.end_sec - s.start_sec;
  }
  return 5;
}

// ─── Studio Inner Component (Inside Remotion Context) ──────────────────────

interface StudioInnerProps {
  project: MotionProject;
  initialScenes: DynamicSceneData[];
  onBack: () => void;
}

const StudioInner: React.FC<StudioInnerProps> = ({ project, initialScenes, onBack }) => {
  const { isDark, isVietnamese, t, setActiveTab, setIsStudioOpen } = useApp();
  const { userSubscription, refreshSubscription } = useWordaiAuth();
  const {
    frame,
    fps,
    durationInFrames,
    isPlaying,
    play,
    pause,
    togglePlay,
    seekTo,
    seekToSec,
    aspectRatio,
    setAspectRatio,
    bgColor,
    setBgColor,
    volume,
    setVolume,
    audioSrc,
    setAudioSrc,
    setDurationInFrames,
    bgmAudioSrc: remotionBgmAudioSrc,
    setBgmAudioSrc: setRemotionBgmAudioSrc,
    bgmVolume: remotionBgmVolume,
    setBgmVolume: setRemotionBgmVolume,
    bgmStartSec: remotionBgmStartSec,
    setBgmStartSec: setRemotionBgmStartSec,
    bgmDurationSec: remotionBgmDurationSec,
    setBgmDurationSec: setRemotionBgmDurationSec,
    voiceStartSec: remotionVoiceStartSec,
    setVoiceStartSec: setRemotionVoiceStartSec,
    voiceDurationSec: remotionVoiceDurationSec,
    setVoiceDurationSec: setRemotionVoiceDurationSec,
  } = useRemotion();

  // Determine whether this project is commercial showcase / BGM based or voice narrator
  const isCommercialMusicStyle =
    ['ads_cinematic_showcase', 'cinematic_showcase', 'ads_strobe_teaser', 'strobe_teaser', 'product_ads_motion', 'animation_ads_image_veo'].includes(
      (project.visual_style as string) || ''
    ) ||
    (project as any).audio_mode === 'bgm' ||
    Boolean((project as any).is_music_template) ||
    Boolean((project as any).bgm_url && !(project as any).voice_name);

  // Helper to determine if template supports dynamic proportional animation scaling
  const isAnimationSyncableTemplate = (style?: string): boolean => {
    if (!style) return false;
    return [
      'whiteboard_stream_hand',
      'handdrawn_fast_doodle',
      'dialogue_scene',
      'science_explainer',
      'character_animation',
      'apple_modern_motion',
      'video_news_60s',
    ].includes(style);
  };

  // Local storage draft key for instant offline auto-save
  const draftKey = `wynmotion_draft_${project.project_id}`;

  // Normalize initial scenes with start_frame and duration_frames (load local draft if present)
  const [scenes, setScenes] = useState<DynamicSceneData[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`wynmotion_draft_${project.project_id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
            return parsed.scenes;
          }
        }
      }
    } catch (e) {
      console.warn('Could not load local draft:', e);
    }
    const rawScenes = (project?.scenes && project.scenes.length > 0) ? project.scenes : (initialScenes.length > 0 ? initialScenes : []);
    if (rawScenes.length === 0 && ((project as any)?.visual_style === 'product_ads_motion' || visualStyle === 'product_ads_motion')) {
      const pImages = (project as any)?.product_images || [];
      const defaultImg = pImages[0] || 'https://static.wordai.pro/ai-generated-images/wynmotion/11ca09714987_templates/cinematic_showcase_cover.png';
      return [
        {
          scene_id: 1,
          scene_number: 1,
          image_url: defaultImg,
          original_image_url: defaultImg,
          start_frame: 0,
          duration_frames: 660,
          duration_sec: 22.0,
          visual_style: 'product_ads_motion',
          template_type: 'product_ads_motion',
        },
      ];
    }
    return rawScenes.map((s: any, idx) => {
      const start = s.start_frame !== undefined ? s.start_frame : idx * 150;
      const dur = s.duration_frames !== undefined ? s.duration_frames : 150;
      return {
        ...s,
        scene_id: s.scene_id !== undefined ? s.scene_id : idx + 1,
        scene_number: s.scene_number !== undefined ? s.scene_number : idx + 1,
        start_frame: start,
        duration_frames: dur,
        duration_sec: dur / 30,
      };
    });
  });

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);

  // Science Explainer AI Chat Code Editing State (iOS)
  const [isScienceChatOpen, setIsScienceChatOpen] = useState(false);
  const [scienceChatInput, setScienceChatInput] = useState('');
  const [isEditingScienceCode, setIsEditingScienceCode] = useState(false);
  const [scienceVersions, setScienceVersions] = useState<any[]>([]);
  const [scienceExplainingMsg, setScienceExplainingMsg] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // 2-Layer Text Controls
  const [showSceneCards, setShowSceneCards] = useState<boolean>(true);
  const [showWhisperSubs, setShowWhisperSubs] = useState<boolean>(() => {
    const p = project as any;
    if (typeof p?.show_whisper_subs === 'boolean') return p.show_whisper_subs;
    if (typeof p?.studio_config?.settings?.show_whisper_subs === 'boolean') return p.studio_config.settings.show_whisper_subs;
    return true;
  });
  const [cardPosY, setCardPosY] = useState<TextPosition>('middle');
  const [subsPosY, setSubsPosY] = useState<any>(() => {
    const p = project as any;
    return p?.subs_pos_y ?? p?.studio_config?.captions_config?.position_y ?? p?.studio_config?.settings?.subs_pos_y ?? 82;
  });
  const [swapSpeakers, setSwapSpeakers] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`wynmotion_draft_${project.project_id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.swap_speakers === 'boolean') {
            return parsed.swap_speakers;
          }
        }
      }
    } catch (e) {}
    return (project as any).swap_speakers ?? false;
  });
  const [textLangMode, setTextLangMode] = useState<TextLangMode>('vi');

  // Track the current frame inside Remotion player
  const [currentFrame, setCurrentFrame] = useState<number>(0);

  // Audio track switching & animation sync
  const [activeAudioLang, setActiveAudioLang] = useState<string>(() => project.language_code || 'vi');
  const [showAudioLangDropdown, setShowAudioLangDropdown] = useState(false);
  const [isSyncingTimeline, setIsSyncingTimeline] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Multilingual Audios Dictionary
  const [multilingualAudios, setMultilingualAudios] = useState<
    Record<
      string,
      {
        audio_url: string;
        duration_sec: number;
        language_code: string;
        voice_name: string;
        script?: string;
        language_name?: string;
        flag?: string;
      }
    >
  >(() => {
    const map: any = {};
    const defaultLang = project.language_code || 'vi';
    const langMeta = AUDIO_STUDIO_LANGUAGES.find(
      (l) => l.code === defaultLang || l.code.toLowerCase() === defaultLang.toLowerCase() || (defaultLang === 'en' && l.code === 'en-US')
    );
    const hasExplicitVoice = Boolean((project as any).voice_name || (project as any).voice);
    const defaultVoiceName = hasExplicitVoice
      ? ((project as any).voice_name || (project as any).voice)
      : isCommercialMusicStyle
        ? (project.title ? `Nhạc: ${project.title}` : 'Nhạc đính kèm theo mẫu')
        : (defaultLang === 'vi' ? 'Giọng Đọc AI' : defaultLang.startsWith('en') ? 'Bella' : defaultLang === 'ja' ? 'Alpha' : defaultLang === 'zh' ? 'Xiaobei' : defaultLang === 'kr' || defaultLang === 'ko' ? 'Sarah' : 'AI Voice');

    if (project.audio_url) {
      map[defaultLang] = {
        audio_url: project.audio_url,
        duration_sec: project.duration_sec || 22,
        language_code: defaultLang,
        voice_name: defaultVoiceName,
        language_name: isCommercialMusicStyle
          ? 'Nhạc Đính Kèm'
          : langMeta?.name || (defaultLang === 'vi' ? 'Tiếng Việt' : defaultLang.toUpperCase()),
        flag: isCommercialMusicStyle ? '🎵' : (langMeta?.flag || (defaultLang === 'vi' ? '🇻🇳' : '🌐')),
      };
    }
    if ((project as any).audio_url_en && defaultLang !== 'en-US' && defaultLang !== 'en') {
      map['en-US'] = {
        audio_url: (project as any).audio_url_en,
        duration_sec: (project as any).duration_sec_en || project.duration_sec || 22,
        language_code: 'en-US',
        voice_name: (project as any).voice_name_en || 'Bella',
        language_name: 'English (US)',
        flag: '🇺🇸',
      };
    }
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`wynmotion_multilingual_${project.project_id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...map, ...parsed };
        }
      }
    } catch {}
    return map;
  });

  // Track deletion / presence of audio
  const [isAudioRemoved, setIsAudioRemoved] = useState<boolean>(false);
  const [selectedTimelineItemId, setSelectedTimelineItemId] = useState<string | null>(null);
  const hasVoiceAudio = !isAudioRemoved && Boolean(audioSrc && audioSrc.trim().length > 0);

  // BGM Background Music State
  const [bgmAudioUrl, setBgmAudioUrl] = useState<string | null>(() => {
    return (project as any).bgm_url || null;
  });
  const [bgmTrackTitle, setBgmTrackTitle] = useState<string | null>(() => {
    return (project as any).bgm_title || null;
  });
  const [isMusicLibraryOpen, setIsMusicLibraryOpen] = useState(false);
  const [isNewVoiceModalOpen, setIsNewVoiceModalOpen] = useState(false);

  // Sheets & Audio mixer
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [activeBottomSheet, setActiveBottomSheet] = useState<BottomSheet>(null);
  const [visualStyle, setVisualStyle] = useState<string>((project as any).visual_style || 'handdrawn_fast_doodle');

  // Auto-Captions Whisper & CapCut Subtitle State
  const [captionSegments, setCaptionSegments] = useState<CaptionSegment[]>(() => {
    const p = project as any;
    if (p?.whisper_active_mode === 'translated' && p?.whisper_translated_segments?.length > 0) {
      return p.whisper_translated_segments;
    }
    return p?.whisper_translated_segments?.length > 0
      ? p.whisper_translated_segments
      : (p?.whisper_original_segments || p?.caption_segments || p?.whisper_segments || []);
  });
  const [captionPresetStyle, setCaptionPresetStyle] = useState<CaptionPresetStyle>(
    (project as any)?.caption_preset_style || (project as any)?.studio_config?.captions_config?.preset_style || 'karaoke_glow'
  );
  const [captionFontSize, setCaptionFontSize] = useState<number>(
    (project as any)?.caption_font_size || (project as any)?.studio_config?.captions_config?.font_size || 32
  );
  const [isTranscribingCaptions, setIsTranscribingCaptions] = useState(false);

  const handleChangeSegments = (newSegments: CaptionSegment[]) => {
    setCaptionSegments(newSegments);
    if (project?.project_id) {
      wynmotionService.updateProject(project.project_id, {
        caption_segments: newSegments,
        whisper_translated_segments: newSegments,
        whisper_segments: newSegments,
        show_whisper_subs: true,
      } as any).catch(console.warn);
    }
  };

  const handleChangePresetStyle = (style: CaptionPresetStyle) => {
    setCaptionPresetStyle(style);
    if (project?.project_id) {
      wynmotionService.updateProject(project.project_id, {
        caption_preset_style: style,
      } as any).catch(console.warn);
    }
  };

  const handleChangeFontSize = (size: number) => {
    setCaptionFontSize(size);
    if (project?.project_id) {
      wynmotionService.updateProject(project.project_id, {
        caption_font_size: size,
      } as any).catch(console.warn);
    }
  };

  const handleTranscribeCaptions = async (targetAudioUrl: string, language: string) => {
    try {
      setIsTranscribingCaptions(true);
      const API_BASE = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'https://ai.wordai.pro';
      const res = await fetch(`${API_BASE}/api/ai/motion/transcribe-caption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_url: targetAudioUrl,
          language: language || 'vi',
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Lỗi nhận diện phụ đề từ âm thanh');
      }
      const data = await res.json();
      if (data.segments) {
        handleChangeSegments(data.segments);
        setShowWhisperSubs(true);
      }
    } catch (err: any) {
      console.error('Whisper caption error:', err);
      alert(err.message || 'Không thể tạo phụ đề lúc này');
    } finally {
      setIsTranscribingCaptions(false);
    }
  };
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const [bgmStartSec, setBgmStartSec] = useState<number>(0);
  const [bgmDurationSec, setBgmDurationSec] = useState<number | undefined>(undefined);
  const [voiceStartSec, setVoiceStartSec] = useState<number>(0);
  const [voiceDurationSec, setVoiceDurationSec] = useState<number | undefined>(undefined);

  const [customBgmFile, setCustomBgmFile] = useState<string | null>(null);
  const bgmFileInputRef = useRef<HTMLInputElement>(null);
  const assetFileInputRef = useRef<HTMLInputElement>(null);
  const voiceUploadInputRef = useRef<HTMLInputElement>(null);
  const bgmUploadInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [isUploadingBgm, setIsUploadingBgm] = useState(false);

  // ── Dedicated Voiceover Track Upload & Sync ──
  const handleUploadVoiceAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVoice(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await wynmotionService.uploadMedia(formData);
      if (res && res.url) {
        setIsAudioRemoved(false);
        setAudioSrc?.(res.url);
        setMultilingualAudios((prev) => ({
          ...prev,
          [activeAudioLang]: {
            ...(prev[activeAudioLang] || {}),
            audio_url: res.url,
            language_name: prev[activeAudioLang]?.language_name || 'Custom Voice',
          },
        }));
        libraryCacheManager.notifyLibraryUpdated('audio');
        const temp = new Audio(res.url);
        temp.addEventListener('loadedmetadata', () => {
          if (temp.duration && isFinite(temp.duration)) {
            setVoiceDurationSec(temp.duration);
            if (isAnimationSyncableTemplate(project.visual_style || visualStyle)) {
              syncAnimationWithAudio(temp.duration, file.name);
            }
          }
        });
        setSyncStatusMsg(isVietnamese ? `🎙️ Đã tải giọng đọc: ${file.name}` : `🎙️ Uploaded voice: ${file.name}`);
        setTimeout(() => setSyncStatusMsg(null), 2500);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tải tệp giọng đọc');
    } finally {
      setIsUploadingVoice(false);
      if (e.target) e.target.value = '';
    }
  };

  // ── Dedicated Background Music (BGM) Upload & Sync ──
  const handleUploadBgmAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBgm(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await wynmotionService.uploadMedia(formData);
      if (res && res.url) {
        setBgmAudioUrl(res.url);
        setBgmTrackTitle(file.name);
        setCustomBgmFile(file.name);
        setRemotionBgmAudioSrc?.(res.url);
        libraryCacheManager.notifyLibraryUpdated('audio');
        const temp = new Audio(res.url);
        temp.addEventListener('loadedmetadata', () => {
          if (temp.duration && isFinite(temp.duration)) {
            setBgmDurationSec(temp.duration);
          }
        });
        setSyncStatusMsg(isVietnamese ? `🎵 Đã tải nhạc nền: ${file.name}` : `🎵 Uploaded BGM: ${file.name}`);
        setTimeout(() => setSyncStatusMsg(null), 2500);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tải tệp nhạc nền');
    } finally {
      setIsUploadingBgm(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveAudio = () => {
    setIsAudioRemoved(true);
    setAudioSrc?.('');
    setMultilingualAudios((prev) => {
      const updated = { ...prev };
      if (updated[activeAudioLang]) {
        updated[activeAudioLang] = { ...updated[activeAudioLang], audio_url: '' };
      }
      return updated;
    });
    libraryCacheManager.notifyLibraryUpdated('audio');
    if (selectedTimelineItemId === 'audio_voice' || selectedTimelineItemId === 'track_voice') {
      setSelectedTimelineItemId(null);
    }
    setSyncStatusMsg(isVietnamese ? '🗑️ Đã xoá âm thanh khỏi timeline' : '🗑️ Audio removed from timeline');
    setTimeout(() => setSyncStatusMsg(null), 2500);
  };

  const handleRemoveBgm = () => {
    setBgmAudioUrl(null);
    setBgmTrackTitle(null);
    setRemotionBgmAudioSrc?.(null);
    if (selectedTimelineItemId === 'audio_bgm' || selectedTimelineItemId === 'track_bgm') {
      setSelectedTimelineItemId(null);
    }
    setSyncStatusMsg(isVietnamese ? '🗑️ Đã xoá nhạc nền khỏi timeline' : '🗑️ BGM removed from timeline');
    setTimeout(() => setSyncStatusMsg(null), 2500);
  };

  // Scrubber scrubbing via pointer events
  const isDraggingScrubberRef = useRef(false);

  const handleScrubberSeek = (clientX: number) => {
    const stage = videoStageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTo(Math.round(progress * durationInFrames));
  };

  const handleScrubberPointerDown = (e: React.PointerEvent) => {
    isDraggingScrubberRef.current = true;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch (err) {}
    handleScrubberSeek(e.clientX);
  };

  const handleScrubberPointerMove = (e: React.PointerEvent) => {
    if (isDraggingScrubberRef.current) {
      handleScrubberSeek(e.clientX);
    }
  };

  const handleScrubberPointerUp = (e: React.PointerEvent) => {
    if (isDraggingScrubberRef.current) {
      isDraggingScrubberRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch (err) {}
    }
  };

  // ── Swipe Down Gesture to Reveal Attached Audio ──
  const touchStartYRef = useRef<number | null>(null);

  const handleStageTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleStageTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current !== null && e.changedTouches && e.changedTouches[0]) {
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
      // Vuốt ngón trỏ kéo xuống > 45px -> Mở khay Audio đính kèm
      if (deltaY > 45) {
        setActiveBottomSheet('audio');
      }
      touchStartYRef.current = null;
    }
  };

  // Export state & Progress polling modal
  const [isExporting, setIsExporting] = useState(false);
  const [isRedesigning, setIsRedesigning] = useState(false);
  const [redesignPrompt, setRedesignPrompt] = useState('');

  const [exportModalState, setExportModalState] = useState<{
    isOpen: boolean;
    status: 'rendering' | 'completed' | 'failed';
    progress: number;
    message: string;
    elapsedSec: number;
    mp4Url?: string;
    jobId?: string;
  } | null>(null);

  const exportIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const exportTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (exportIntervalRef.current) clearInterval(exportIntervalRef.current);
      if (exportTimerRef.current) clearInterval(exportTimerRef.current);
    };
  }, []);

  // Video Stage Ref & Direct Drag-to-Move Bubble
  const videoStageRef = useRef<HTMLDivElement>(null);
  const [isDraggingBubble, setIsDraggingBubble] = useState(false);

  const totalDurationSec = durationInFrames / fps;
  const currentTimeSec = frame / fps;

  const timelineTracks: TimelineTrack[] = useMemo(() => {
    let accumTime = 0;
    const mediaItems: TimelineItem[] = [];
    const fxItems: TimelineItem[] = [];

    scenes.forEach((s, idx) => {
      const dur = getSceneDuration(s as any);
      const st = accumTime;
      const et = accumTime + dur;

      mediaItems.push({
        id: `media_${s.scene_id || idx + 1}`,
        trackId: 'track_media',
        trackType: 'video',
        startTime: st,
        endTime: et,
        duration: dur,
        title: s.title || `Scene ${idx + 1}`,
        thumbnailUrl: s.image_url || (s as any).original_image_url,
        params: {
          maxDuration: (s as any).video_duration || (s as any).orig_duration || (s as any)._videoDuration || 600,
        },
      });

      const shaderName = (s as any).shader_name || (s as any).transition_out?.shader_name;
      if (shaderName) {
        const transDur = (s as any).transition_out?.duration || 0.5;
        fxItems.push({
          id: `fx_${s.scene_id || idx + 1}`,
          trackId: 'track_fx',
          trackType: 'transitions',
          startTime: Math.max(0, et - transDur),
          endTime: et,
          duration: transDur,
          title: shaderName,
          shaderName: shaderName,
        });
      }

      accumTime = et;
    });

    const captionItems: TimelineItem[] = (captionSegments || []).map((seg: any, idx) => {
      const st = seg.start_time ?? seg.start ?? 0;
      const et = seg.end_time ?? seg.end ?? (st + 1.5);
      return {
        id: `cap_${idx}`,
        trackId: 'track_captions',
        trackType: 'captions',
        startTime: st,
        endTime: et,
        duration: Math.max(0.1, et - st),
        title: seg.text || 'Phụ đề',
      };
    });

    const hasVoiceAudio = !isAudioRemoved && Boolean(audioSrc && audioSrc.trim().length > 0);

    const isMusicTrack = isCommercialMusicStyle || (project as any).audio_mode === 'bgm' || !(project as any).voice_name;
    const trackVoiceTitle = isMusicTrack
      ? `🎵 Nhạc đính kèm: ${(project as any).bgm_title || project.title || 'Cinematic Showcase'}`
      : `🎙️ Voice: ${multilingualAudios[activeAudioLang]?.voice_name || 'AI Voice'} (${activeAudioLang.toUpperCase()})`;

    const voiceItem: TimelineItem = {
      id: 'audio_voice',
      trackId: 'track_voice',
      trackType: 'audio',
      startTime: voiceStartSec,
      endTime: voiceStartSec + (voiceDurationSec || totalDurationSec),
      duration: voiceDurationSec || totalDurationSec,
      title: trackVoiceTitle,
    };

    const tracksList: TimelineTrack[] = [
      { id: 'track_media', type: 'video', name: 'Media Scenes', items: mediaItems },
      { id: 'track_fx', type: 'transitions', name: 'FX & Transitions', items: fxItems },
      { id: 'track_captions', type: 'captions', name: 'Auto Captions', items: captionItems },
      { id: 'track_voice', type: 'audio', name: isMusicTrack ? 'Music Track' : 'Voice Track', items: hasVoiceAudio ? [voiceItem] : [] },
    ];

    if (bgmAudioUrl) {
      const bgmItem: TimelineItem = {
        id: 'audio_bgm',
        trackId: 'track_bgm',
        trackType: 'audio',
        startTime: bgmStartSec,
        endTime: bgmStartSec + (bgmDurationSec || totalDurationSec),
        duration: bgmDurationSec || totalDurationSec,
        title: `🎵 BGM: ${bgmTrackTitle || 'Background Music'}`,
      };
      tracksList.push({
        id: 'track_bgm',
        type: 'audio',
        name: 'BGM Track',
        items: [bgmItem],
      });
    }

    return tracksList;
  }, [
    scenes,
    totalDurationSec,
    captionSegments,
    voiceStartSec,
    voiceDurationSec,
    bgmAudioUrl,
    bgmTrackTitle,
    bgmStartSec,
    bgmDurationSec,
    activeAudioLang,
    multilingualAudios,
    audioSrc,
    isAudioRemoved,
    isCommercialMusicStyle,
    project.title,
  ]);

  // Active scene tracking based on frame
  useEffect(() => {
    for (let i = 0; i < scenes.length; i++) {
      const sf = scenes[i].start_frame || 0;
      const df = scenes[i].duration_frames || 150;
      if (frame >= sf && frame < sf + df) {
        setActiveSceneIndex(i);
        break;
      }
    }
  }, [frame, scenes]);

  const activeScene: DynamicSceneData = scenes[activeSceneIndex] || scenes[0];

  useEffect(() => {
    if (visualStyle === 'science_explainer' && activeScene) {
      wynmotionService.getScienceExplainerVersions(project.project_id, activeScene.scene_id).then((hist) => {
        if (hist && hist.length > 0) {
          setScienceVersions(hist);
        }
      });
    }
  }, [visualStyle, activeScene?.scene_id, project.project_id]);

  const handleSendScienceCodePrompt = async (overridePrompt?: string) => {
    const promptToSend = (overridePrompt || scienceChatInput).trim();
    if (!promptToSend || isEditingScienceCode) return;

    setIsEditingScienceCode(true);
    setScienceExplainingMsg(null);

    try {
      const fallbackScienceCode = `import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';

export const Scene_${activeScene ? activeScene.scene_id : 1}: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width || height === 1920;
  const popSpring = spring({ frame, fps, config: { damping: 14, stiffness: 140 } });
  const rotY = (frame * 1.2) % 360;
  const laserY = interpolate(frame % (fps * 3), [0, fps * 3], [0, 100], { extrapolateRight: 'clamp' });

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#060B18', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", perspective: 1200 }}>
      <div style={{ position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%', backgroundImage: 'radial-gradient(rgba(0, 240, 255, 0.12) 1px, transparent 1px)', backgroundSize: '36px 36px', transform: 'rotateX(65deg)', opacity: 0.8 }} />
      <div style={{ position: 'absolute', top: \`\${laserY}%\`, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #00F0FF, #10B981, transparent)', boxShadow: '0 0 20px #00F0FF', zIndex: 5 }} />
      <div style={{ transform: \`scale(\${popSpring})\`, zIndex: 10, textAlign: 'center', color: '#00F0FF' }}>
        <h2 style={{ fontSize: isPortrait ? 28 : 42, fontWeight: 900, textShadow: '0 0 20px rgba(0, 240, 255, 0.8)' }}>STEM EXPLAINER</h2>
        <p style={{ color: '#E2E8F0', marginTop: 8, fontSize: 14 }}>${activeScene?.voice_transcript || activeScene?.title || 'Scientific Discovery & Quantum Dynamics'}</p>
      </div>
    </div>
  );
};`;

      const currentCode = (activeScene as any)?.code || fallbackScienceCode;
      const res = await wynmotionService.editScienceExplainerCode({
        project_id: project.project_id,
        scene_id: activeScene ? activeScene.scene_id : 1,
        current_code: currentCode,
        prompt: promptToSend,
        aspect_ratio: aspectRatio,
        science_domain: (project as any)?.science_domain || 'physics',
        language_code: isVietnamese ? 'vi' : 'en',
      });

      if (res.success && res.new_code) {
        setScenes((prev) =>
          prev.map((s) =>
            s.scene_id === (activeScene ? activeScene.scene_id : 1)
              ? { ...s, code: res.new_code }
              : s
          )
        );
        if (res.version_history) {
          setScienceVersions(res.version_history);
        }
        setScienceExplainingMsg(res.explanation || (isVietnamese ? 'Đã cập nhật code hoạt họa!' : 'Animation code updated!'));
        setScienceChatInput('');
      } else {
        alert(res.message || (isVietnamese ? 'Không thể chỉnh sửa code.' : 'Failed to edit code.'));
      }
    } catch (err: any) {
      console.error('Error editing science code:', err);
      alert(err.message || (isVietnamese ? 'Lỗi khi gửi yêu cầu chỉnh sửa AI.' : 'AI edit request error.'));
    } finally {
      setIsEditingScienceCode(false);
    }
  };

  const handleApplyScienceVersion = async (versionId: string) => {
    try {
      const res = await wynmotionService.applyScienceExplainerVersion(
        project.project_id,
        activeScene ? activeScene.scene_id : 1,
        versionId
      );
      if (res.code) {
        setScenes((prev) =>
          prev.map((s) =>
            s.scene_id === (activeScene ? activeScene.scene_id : 1)
              ? { ...s, code: res.code }
              : s
          )
        );
        if (res.version_history) {
          setScienceVersions(res.version_history);
        }
        setScienceExplainingMsg(res.explanation || (isVietnamese ? `Đã chuyển về phiên bản ${res.version_number}` : `Restored version ${res.version_number}`));
      }
    } catch (err: any) {
      alert(err.message || (isVietnamese ? 'Không thể áp dụng phiên bản này.' : 'Failed to apply version.'));
    }
  };

  // Active speaker identification at current frame
  const activeSpeaker: 'A' | 'B' = useMemo(() => {
    if (!activeScene) return 'A';
    const turns = activeScene.dialogue_turns || [];
    if (turns.length === 0) {
      const text = activeScene.voice_transcript || activeScene.summary_text || '';
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length === 0) return 'A';
      const sceneDur = activeScene.duration_sec || 5;
      const sceneLocalSec = Math.max(0, currentTimeSec - (activeScene.start_sec || 0));
      const turnIdx = Math.min(lines.length - 1, Math.floor((sceneLocalSec / Math.max(0.5, sceneDur)) * lines.length));
      return turnIdx % 2 === 0 ? 'A' : 'B';
    }
    const sceneDur = activeScene.duration_sec || 5;
    const sceneLocalSec = Math.max(0, currentTimeSec - (activeScene.start_sec || 0));
    const avgTurnDur = sceneDur / Math.max(1, turns.length);
    const turnIdx = Math.min(turns.length - 1, Math.floor(sceneLocalSec / Math.max(0.5, avgTurnDur)));
    return turns[turnIdx]?.speaker || (turnIdx % 2 === 0 ? 'A' : 'B');
  }, [activeScene, currentTimeSec]);

  // Update 2D (X, Y) anchor position for active character
  const calculatePosFromClientCoords = (clientX: number, clientY: number) => {
    if (!videoStageRef.current || !activeScene) return;
    const rect = videoStageRef.current.getBoundingClientRect();
    if (rect.height <= 0 || rect.width <= 0) return;
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    const pctX = Math.max(10, Math.min(90, Math.round((relativeX / rect.width) * 100)));
    const pctY = Math.max(8, Math.min(90, Math.round((relativeY / rect.height) * 100)));
    const isA = activeSpeaker === 'A';
    updateScene(activeScene.scene_id, {
      bubble_custom_layout: {
        ...(activeScene.bubble_custom_layout || {}),
        [isA ? 'customPosXA' : 'customPosXB']: pctX,
        [isA ? 'customPosYA' : 'customPosYB']: pctY,
        customTopPct: pctY,
      },
    });
  };

  // Fluid window-level drag listeners (iOS Safari / Capacitor gold standard)
  const startDragging = (initialClientX: number, initialClientY: number) => {
    setIsDraggingBubble(true);
    calculatePosFromClientCoords(initialClientX, initialClientY);

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches && e.touches[0]) {
        calculatePosFromClientCoords(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      setIsDraggingBubble(false);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };

    const onPointerMove = (e: PointerEvent) => {
      calculatePosFromClientCoords(e.clientX, e.clientY);
    };

    const onPointerUp = () => {
      setIsDraggingBubble(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // ── Sync Animation Timeline with Audio Length ──
  const syncAnimationWithAudio = (audioDuration: number, langLabel: string = 'Audio Track') => {
    if (!isAnimationSyncableTemplate(project.visual_style || visualStyle)) {
      return;
    }
    if (!audioDuration || isNaN(audioDuration) || !isFinite(audioDuration) || audioDuration <= 1.0) {
      alert(t('⚠️ Độ dài file audio không hợp lệ để đồng bộ.', '⚠️ Invalid audio duration for sync.'));
      return;
    }

    setIsSyncingTimeline(true);
    setSyncStatusMsg(t(`Đang đồng bộ animation theo ${langLabel}...`, `Syncing animation to ${langLabel}...`));

    const totalAudioFrames = Math.round(audioDuration * fps);
    const baseFrames = scenes.reduce((acc, s) => acc + (s.duration_frames || 150), 0) || 300;
    const scale = totalAudioFrames / baseFrames;

    let curFrame = 0;
    const scaledScenes: DynamicSceneData[] = scenes.map((s, idx) => {
      const rawFrames = s.duration_frames || 150;
      const scaledF = Math.max(30, Math.round(rawFrames * scale));
      const sf = curFrame;
      const df = idx === scenes.length - 1 ? Math.max(30, totalAudioFrames - curFrame) : scaledF;
      curFrame += df;

      const sceneScale = rawFrames > 0 ? df / rawFrames : scale;

      const scaledActions = (s as any).actions?.map((act: any) => ({
        ...act,
        draw_speed_sec: act.draw_speed_sec ? Number((act.draw_speed_sec * sceneScale).toFixed(2)) : act.draw_speed_sec,
        timestamp_start_sec: act.timestamp_start_sec ? Number((act.timestamp_start_sec * sceneScale).toFixed(2)) : act.timestamp_start_sec,
        timestamp_end_sec: act.timestamp_end_sec ? Number((act.timestamp_end_sec * sceneScale).toFixed(2)) : act.timestamp_end_sec,
      }));

      return {
        ...s,
        start_frame: sf,
        duration_frames: df,
        duration_sec: Number((df / fps).toFixed(2)),
        start_sec: Number((sf / fps).toFixed(2)),
        end_sec: Number(((sf + df) / fps).toFixed(2)),
        ...(scaledActions ? { actions: scaledActions } : {}),
      };
    });

    if (captionSegments.length > 0) {
      setCaptionSegments((prev) =>
        prev.map((seg) => ({
          ...seg,
          start: Number((seg.start * scale).toFixed(2)),
          end: Number((seg.end * scale).toFixed(2)),
          words: seg.words?.map((w) => ({
            ...w,
            start: Number((w.start * scale).toFixed(2)),
            end: Number((w.end * scale).toFixed(2)),
          })),
        }))
      );
    }

    setScenes(scaledScenes);
    setDurationInFrames?.(totalAudioFrames);
    seekTo(0);
    pause();

    wynmotionService
      .updateProject(project.project_id, {
        scenes: scaledScenes as any,
        duration_sec: audioDuration,
      })
      .catch((err) => console.warn('Auto-save sync failed:', err));

    setSyncStatusMsg(`✅ Đã đồng bộ timeline theo ${langLabel} (${audioDuration.toFixed(1)}s)!`);
    setTimeout(() => {
      setSyncStatusMsg(null);
      setIsSyncingTimeline(false);
    }, 3500);
  };

  // ── Switch Audio Language Track ──
  const handleSelectAudioLang = (langCode: string) => {
    setActiveAudioLang(langCode);
    setTextLangMode(langCode === 'vi' ? 'vi' : 'en');

    const trackData = multilingualAudios[langCode];
    const targetUrl = trackData?.audio_url || (langCode === 'en' || langCode === 'en-US' ? (project as any).audio_url_en : project.audio_url) || '';

    if (targetUrl) {
      setIsAudioRemoved(false);
      setAudioSrc?.(targetUrl);
      const temp = new Audio(targetUrl);
      temp.addEventListener('loadedmetadata', () => {
        if (temp.duration && isFinite(temp.duration)) {
          const flag = trackData?.flag || (langCode === 'vi' ? '🇻🇳' : '🌐');
          const name = trackData?.language_name || langCode.toUpperCase();
          if (isAnimationSyncableTemplate(project.visual_style || visualStyle)) {
            syncAnimationWithAudio(temp.duration, `${flag} ${name}`);
          }
        }
      });
    }
  };

  const handleAddNewVoiceTrack = (res: GeneratedVoiceResult) => {
    setIsAudioRemoved(false);
    const nextMap = {
      ...multilingualAudios,
      [res.language_code]: {
        audio_url: res.audio_url,
        duration_sec: res.duration_sec,
        language_code: res.language_code,
        voice_name: res.voice_name,
        script: res.script,
        language_name: res.language_name,
        flag: res.flag,
      },
    };
    setMultilingualAudios(nextMap);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`wynmotion_multilingual_${project.project_id}`, JSON.stringify(nextMap));
      }
    } catch {}

    handleSelectAudioLang(res.language_code);
    setSyncStatusMsg(`✨ Đã thêm giọng đọc: ${res.flag || '🌐'} ${res.language_name || res.language_code}!`);
    setTimeout(() => setSyncStatusMsg(null), 3500);
  };

  const handleSelectBgmFromLibrary = (url: string, title: string) => {
    setBgmAudioUrl(url);
    setBgmTrackTitle(title);
    setBgmStartSec(0);
    setBgmDurationSec(totalDurationSec);
    setRemotionBgmAudioSrc?.(url);
    setRemotionBgmStartSec?.(0);
    setRemotionBgmDurationSec?.(totalDurationSec);
    setSyncStatusMsg(`🎵 Đã gắn Nhạc Nền: ${title}!`);
    setTimeout(() => setSyncStatusMsg(null), 3000);
  };

  const handleBgmVolumeChange = (newVal: number) => {
    setBgmVolume(newVal);
    setRemotionBgmVolume?.(newVal);
  };

  // ── Update scene field with 0ms local auto-save (No backend DB writes while dragging) ──
  const updateScene = useCallback(
    (sceneId: string | number, updates: Partial<DynamicSceneData>) => {
      setScenes((prev) => {
        const next = prev.map((s) => (s.scene_id === sceneId ? { ...s, ...updates } : s));
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `wynmotion_draft_${project.project_id}`,
              JSON.stringify({ scenes: next, swap_speakers: swapSpeakers, visual_style: visualStyle })
            );
          }
        } catch (e) {}
        return next;
      });
    },
    [project.project_id, swapSpeakers, visualStyle]
  );

  const deleteScene = useCallback(
    (sceneId: string | number) => {
      setScenes((prev) => {
        if (prev.length <= 1) {
          const resetScene: DynamicSceneData = {
            scene_id: '1',
            title: isVietnamese ? 'Phân cảnh 1' : 'Scene 1',
            duration_sec: 5.0,
            duration_frames: 150,
            start_sec: 0,
            start_frame: 0,
            voice_transcript: '',
            image_url: undefined,
            video_url: undefined,
          };
          setSyncStatusMsg(isVietnamese ? '🗑️ Đã làm mới phân cảnh!' : '🗑️ Reset scene!');
          setTimeout(() => setSyncStatusMsg(null), 2500);
          return [resetScene];
        }
        const next = prev.filter((s) => String(s.scene_id) !== String(sceneId));
        let totalSec = 0;
        let totalFrames = 0;
        const reindexed = next.map((s) => {
          const durSec = getSceneDuration(s);
          const durFrames = Math.round(durSec * fps);
          const updated = {
            ...s,
            start_sec: Number(totalSec.toFixed(2)),
            start_frame: totalFrames,
            duration_sec: durSec,
            duration_frames: durFrames,
          };
          totalSec += durSec;
          totalFrames += durFrames;
          return updated;
        });
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `wynmotion_draft_${project.project_id}`,
              JSON.stringify({ scenes: reindexed, swap_speakers: swapSpeakers, visual_style: visualStyle })
            );
          }
        } catch (e) {}
        setSyncStatusMsg(isVietnamese ? '🗑️ Đã xoá phân cảnh!' : '🗑️ Scene deleted!');
        setTimeout(() => setSyncStatusMsg(null), 2500);
        return reindexed;
      });
    },
    [project.project_id, swapSpeakers, visualStyle, isVietnamese, fps]
  );

  // ── Lưu Dự Án Toàn Diện (Full 5 Tabs Project Configuration) ──
  const [isSavingProject, setIsSavingProject] = useState(false);

  const handleSaveProject = useCallback(async () => {
    setIsSavingProject(true);
    try {
      const fullProjectPayload: any = {
        project_id: project.project_id,
        title: project.title || 'WynMotion Project',
        scenes: scenes as any,
        aspect_ratio: aspectRatio,
        bg_color: bgColor,
        visual_style: visualStyle,
        fps,
        swap_speakers: swapSpeakers,
        model_type: (project as any).model_type || 'flash',
        audio_url: isAudioRemoved ? '' : (audioSrc || ''),
        voice_start_sec: voiceStartSec,
        voice_duration_sec: voiceDurationSec,
        bgm_url: bgmAudioUrl || (project as any).bgm_url || '',
        bgm_track_title: bgmTrackTitle,
        bgm_volume: bgmVolume,
        voice_volume: isAudioRemoved ? 0 : volume,
        bgm_start_sec: bgmStartSec,
        bgm_duration_sec: bgmDurationSec,
        caption_segments: captionSegments,
        caption_preset_style: captionPresetStyle,
        show_whisper_subs: showWhisperSubs,
        subs_pos_y: subsPosY,
        card_pos_y: cardPosY,
        updated_at: new Date().toISOString(),
      };

      // 1. Save locally (current project + draft)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`wynmotion_draft_${project.project_id}`, JSON.stringify(fullProjectPayload));
        localStorage.setItem('wynmotion_current_project', JSON.stringify(fullProjectPayload));

        // 2. Add / Update in offline projects list for easy reopening
        try {
          const offlineKey = 'wynmotion_offline_projects';
          const raw = localStorage.getItem(offlineKey);
          let list: any[] = raw ? JSON.parse(raw) : [];
          const existingIdx = list.findIndex((p) => p.project_id === project.project_id);
          if (existingIdx >= 0) {
            list[existingIdx] = { ...list[existingIdx], ...fullProjectPayload };
          } else {
            list.unshift(fullProjectPayload);
          }
          localStorage.setItem(offlineKey, JSON.stringify(list));
        } catch (e) {
          console.warn('Failed to update wynmotion_offline_projects:', e);
        }
      }

      // 3. Online sync to server if authenticated or available
      try {
        await wynmotionService.updateProject(project.project_id, fullProjectPayload);
      } catch (srvErr) {
        console.warn('Project saved offline locally (server sync skipped/failed):', srvErr);
      }

      setSyncStatusMsg(isVietnamese ? '💾 Đã lưu dự án thành công!' : '💾 Project saved successfully!');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed to save project:', err);
      setSyncStatusMsg(isVietnamese ? '❌ Lỗi khi lưu dự án' : '❌ Failed to save project');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } finally {
      setIsSavingProject(false);
    }
  }, [
    project,
    scenes,
    aspectRatio,
    bgColor,
    visualStyle,
    fps,
    swapSpeakers,
    isAudioRemoved,
    audioSrc,
    voiceStartSec,
    voiceDurationSec,
    bgmAudioUrl,
    bgmTrackTitle,
    bgmVolume,
    bgmStartSec,
    bgmDurationSec,
    captionSegments,
    captionPresetStyle,
    showWhisperSubs,
    subsPosY,
    cardPosY,
    isVietnamese,
  ]);

  // ── Thêm Phân Cảnh Mới (New Scene) ──
  const handleAddNewScene = useCallback(() => {
    const newId = String(Date.now());
    const newOrder = scenes.length + 1;
    const newSceneDur = 5.0;

    let totalFrames = 0;
    let totalSec = 0;
    scenes.forEach((s) => {
      const durSec = getSceneDuration(s);
      totalSec += durSec;
      totalFrames += Math.round(durSec * fps);
    });

    const newScene: DynamicSceneData = {
      scene_id: newId,
      title: isVietnamese ? `Phân cảnh ${newOrder}` : `Scene ${newOrder}`,
      duration_sec: newSceneDur,
      duration_frames: Math.round(newSceneDur * fps),
      start_sec: Number(totalSec.toFixed(2)),
      start_frame: totalFrames,
      voice_transcript: '',
      actions: [],
    } as any;

    const next = [...scenes, newScene];
    setScenes(next);
    seekTo(totalFrames);
    const newTotalSec = totalSec + newSceneDur;
    setDurationInFrames?.(Math.round(newTotalSec * fps));

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `wynmotion_draft_${project.project_id}`,
          JSON.stringify({ scenes: next, swap_speakers: swapSpeakers, visual_style: visualStyle })
        );
      }
    } catch (e) {}

    setSyncStatusMsg(isVietnamese ? '✨ Đã thêm phân cảnh mới!' : '✨ Added new scene!');
    setTimeout(() => setSyncStatusMsg(null), 2500);
  }, [scenes, fps, isVietnamese, seekTo, setDurationInFrames, project.project_id, swapSpeakers, visualStyle]);

  // ── Upload Ảnh hoặc Video cho từng phân cảnh + Đồng bộ thời lượng video ──
  const handleMediaUploadForScene = useCallback(
    (sceneId: string | number, file: File) => {
      const isVideo = file.type.startsWith('video/');
      const localUrl = URL.createObjectURL(file);

      if (isVideo) {
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        tempVideo.src = localUrl;
        tempVideo.onloadedmetadata = () => {
          const exactDur = Math.max(1, Number(tempVideo.duration.toFixed(2)));
          updateScene(sceneId, {
            video_url: localUrl,
            image_url: undefined,
            duration_sec: exactDur,
            duration_frames: Math.round(exactDur * fps),
            _rawFile: file,
          } as any);

          setSyncStatusMsg(
            isVietnamese
              ? `🎥 Đã gắn video & đồng bộ thời lượng: ${exactDur}s`
              : `🎥 Attached video & synced duration: ${exactDur}s`
          );
          setTimeout(() => setSyncStatusMsg(null), 2500);
        };
      } else {
        updateScene(sceneId, {
          image_url: localUrl,
          video_url: undefined,
          _rawFile: file,
        } as any);

        setSyncStatusMsg(isVietnamese ? '🖼️ Đã gắn hình ảnh vào phân cảnh!' : '🖼️ Attached image to scene!');
        setTimeout(() => setSyncStatusMsg(null), 2500);
      }
    },
    [updateScene, fps, isVietnamese]
  );

  // ── Native Share / Save to Camera Roll Helper (Local File:// with Save Video option) ──
  const triggerNativeShare = async (url: string) => {
    await saveAndShareMedia(url, `WynMotion_${project.project_id.slice(0, 8)}.mp4`);
  };

  // ── Export MP4 with Live Polling (every 5s, up to 5 mins) & Native Save Sheet ──
  const handleExportMP4 = async () => {
    setIsExporting(true);

    if (exportIntervalRef.current) clearInterval(exportIntervalRef.current);
    if (exportTimerRef.current) clearInterval(exportTimerRef.current);

    setExportModalState({
      isOpen: true,
      status: 'rendering',
      progress: 8,
      message: t('🎬 Đang khởi tạo tiến trình render video MP4 chất lượng cao...', 'Initializing high-quality MP4 video render...'),
      elapsedSec: 0,
    });

    // 1-second elapsed time ticker (counts 1s to 300s)
    let elapsed = 0;
    exportTimerRef.current = setInterval(() => {
      elapsed += 1;
      setExportModalState((prev) => (prev ? { ...prev, elapsedSec: elapsed } : null));
    }, 1000);

    try {
      // Pre-upload local blob / raw media files to R2 before exporting
      setExportModalState((prev) =>
        prev ? { ...prev, message: t('📤 Đang chuẩn bị và tải media phân cảnh lên...', 'Uploading scene media...') } : null
      );

      const processedScenes = await Promise.all(
        scenes.map(async (s) => {
          const sc = { ...s };
          const rawFile = (s as any)._rawFile as File | undefined;
          if (rawFile) {
            try {
              const fd = new FormData();
              fd.append('file', rawFile);
              const upRes = await wynmotionService.uploadMedia(fd);
              if (upRes.url) {
                if (rawFile.type.startsWith('video/')) {
                  sc.video_url = upRes.url;
                  sc.image_url = undefined;
                } else {
                  sc.image_url = upRes.url;
                  sc.video_url = undefined;
                }
              }
            } catch (err) {
              console.warn(`Could not upload media for scene ${s.scene_id}:`, err);
            }
          }
          return sc;
        })
      );

      const currentActiveAudioUrl =
        multilingualAudios[activeAudioLang]?.audio_url ||
        (activeAudioLang === 'en' || activeAudioLang === 'en-US' ? (project as any).audio_url_en : project.audio_url) ||
        audioSrc ||
        '';

      const res = await wynmotionService.exportMP4(project.project_id, processedScenes as any, {
        swap_speakers: swapSpeakers,
        aspect_ratio: aspectRatio,
        show_scene_cards: showSceneCards,
        show_whisper_subs: showWhisperSubs,
        force_rerender: true,
        audio_url: isAudioRemoved ? '' : currentActiveAudioUrl,
        voice_volume: isAudioRemoved ? 0 : volume,
        voice_start_sec: voiceStartSec,
        voice_duration_sec: voiceDurationSec,
        bgm_url: bgmAudioUrl || undefined,
        bgm_volume: bgmAudioUrl ? bgmVolume : 0,
        bgm_start_sec: bgmStartSec,
        bgm_duration_sec: bgmDurationSec,
        duration_sec: totalDurationSec,
        language_code: activeAudioLang,
        caption_segments: captionSegments,
        caption_preset_style: captionPresetStyle,
        caption_font_size: captionFontSize,
        subs_pos_y: subsPosY,
        timeline_effects: (project as any).timeline_effects || [],
        visual_style: visualStyle,
        bg_color: bgColor,
        studio_config: (project as any).studio_config || undefined,
      });

      // Instant pre-rendered MP4 hit
      if (res.mp4_url && res.status === 'completed') {
        if (exportTimerRef.current) clearInterval(exportTimerRef.current);
        setExportModalState({
          isOpen: true,
          status: 'completed',
          progress: 100,
          message: t('🎉 Xuất video MP4 thành công!', '🎉 MP4 Export Completed!'),
          elapsedSec: elapsed,
          mp4Url: res.mp4_url,
          jobId: res.job_id,
        });
        triggerNativeShare(res.mp4_url);
        return;
      }

      const jobId = res.job_id;
      let attempts = 0;
      const maxAttempts = 60; // 60 attempts * 5s = 300s (5 mins)

      exportIntervalRef.current = setInterval(async () => {
        attempts += 1;
        if (attempts > maxAttempts) {
          if (exportIntervalRef.current) clearInterval(exportIntervalRef.current);
          if (exportTimerRef.current) clearInterval(exportTimerRef.current);
          setExportModalState({
            isOpen: true,
            status: 'failed',
            progress: 0,
            message: t('⏱️ Quá thời gian 5 phút. Vui lòng kiểm tra lại trong Thư viện video sau ít phút.', 'Timeout after 5 mins. Please check Videos Library shortly.'),
            elapsedSec: elapsed,
          });
          return;
        }

        try {
          const statusRes = await wynmotionService.checkExportStatus(jobId);
          if (statusRes.status === 'completed' || statusRes.status === 'done') {
            if (exportIntervalRef.current) clearInterval(exportIntervalRef.current);
            if (exportTimerRef.current) clearInterval(exportTimerRef.current);
            const finalUrl = statusRes.mp4_url || res.mp4_url;
            setExportModalState({
              isOpen: true,
              status: 'completed',
              progress: 100,
              message: t('🎉 Xuất video MP4 thành công!', '🎉 MP4 Export Completed!'),
              elapsedSec: elapsed,
              mp4Url: finalUrl,
              jobId: jobId,
            });
            libraryCacheManager.notifyLibraryUpdated('videos');
            libraryCacheManager.notifyLibraryUpdated('projects');
            if (finalUrl) triggerNativeShare(finalUrl);
          } else if (statusRes.status === 'failed') {
            if (exportIntervalRef.current) clearInterval(exportIntervalRef.current);
            if (exportTimerRef.current) clearInterval(exportTimerRef.current);
            setExportModalState({
              isOpen: true,
              status: 'failed',
              progress: 0,
              message: (statusRes as any).error || (statusRes as any).message || t('❌ Render video thất bại', 'Video render failed'),
              elapsedSec: elapsed,
            });
          } else {
            // Processing
            const prog = (statusRes as any).progress || Math.min(95, 10 + Math.round((attempts / 20) * 80));
            const msg = (statusRes as any).message || t('✨ Đang ghép âm thanh, khung hình & phụ đề...', 'Rendering frames, subtitles & audio...');
            setExportModalState((prev) => (prev ? { ...prev, progress: prog, message: msg } : null));
          }
        } catch (pollErr) {
          console.warn('Poll status failed:', pollErr);
        }
      }, 5000);
    } catch (err: any) {
      if (exportTimerRef.current) clearInterval(exportTimerRef.current);
      setExportModalState({
        isOpen: true,
        status: 'failed',
        progress: 0,
        message: err.message || t('❌ Xuất video thất bại', '❌ Export failed'),
        elapsedSec: elapsed,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // ── Re-design / Re-generate Scene AI Image via Gemini Agent ──
  const handleRedesignImage = async () => {
    if (!activeScene) return;
    setIsRedesigning(true);
    try {
      const res = await wynmotionService.redesignSceneImage({
        project_id: project.project_id,
        scene_id: activeScene.scene_id,
        user_prompt: redesignPrompt.trim() || project.prompt,
        aspect_ratio: aspectRatio,
        character_subtype: (project as any).character_subtype,
      });
      if (res && res.image_url) {
        updateScene(activeScene.scene_id, { image_url: res.image_url });
        libraryCacheManager.notifyLibraryUpdated('images');
        await refreshSubscription?.();
        alert(t('🎨 Đã vẽ lại hình ảnh nhân vật thành công (-3 điểm)!', '🎨 Image successfully re-designed (-3 points)!'));
      }
    } catch (err: any) {
      alert(err.message || t('Lỗi tạo lại hình ảnh', 'Failed to re-design image'));
    } finally {
      setIsRedesigning(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden transition-colors ${
        isDark ? 'bg-[#080B10] text-white' : 'bg-[#FAFAFC] text-slate-900'
      }`}
    >
      {/* ═══════════════════════════════════════════════════════════
          1. COMPACT HEADER (Clean Title Only, 44px Notch Padding)
      ═══════════════════════════════════════════════════════════ */}
      <header
        className={`flex-shrink-0 flex items-center justify-between px-4 pb-3 border-b z-30 transition-colors ${
          isDark
            ? 'border-slate-800/80 bg-[#0F131C]/95 backdrop-blur-md'
            : 'border-slate-200 bg-white/95 backdrop-blur-md shadow-sm'
        }`}
        style={{ paddingTop: 'max(env(safe-area-inset-top, 44px), 44px)' }}
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBack}
            className={`p-2 rounded-2xl transition-all active:scale-90 ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center min-w-0 flex-1 mx-2">
          <h1
            className={`text-sm font-black truncate max-w-full tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {project.title || project.prompt?.slice(0, 32) || 'WynMotion Studio'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSettingsSheetOpen(true)}
            title={t('Thông Tin Dự Án', 'Project Info')}
            className={`p-2 rounded-2xl transition-all active:scale-90 ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Info className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleExportMP4}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>MP4</span>
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          2. MAIN BODY: Large Remotion Canvas Stage + Controls (Scrollable)
      ═══════════════════════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative min-h-0 scrollbar-thin scrollbar-thumb-slate-700"
        onTouchStart={handleStageTouchStart}
        onTouchEnd={handleStageTouchEnd}
      >
        {syncStatusMsg && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-cyan-500/90 text-slate-950 text-xs font-black shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {/* Dynamic Remotion Stage */}
        <div
          className="shrink-0 flex items-center justify-center p-3 relative overflow-hidden bg-[#07080E] w-full"
          style={{ minHeight: '220px' }}
        >
          {/* Floating AI Chat Button for Science Explainer (Left Side of Canvas) */}
          {visualStyle === 'science_explainer' && (
            <div className="absolute top-3 left-3 z-30">
              <button
                type="button"
                onClick={() => setIsScienceChatOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-black shadow-2xl active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>AI Chat</span>
              </button>
            </div>
          )}

          {/* Floating Compact Aspect Ratio Dropdown */}
          <div className="absolute top-3 right-3 z-30">
            <button
              type="button"
              onClick={() => setShowAspectDropdown((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-black shadow-2xl active:scale-95 transition-all"
            >
              <span className="text-cyan-400">{aspectRatio}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${showAspectDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showAspectDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAspectDropdown(false)} />
                <div className="absolute top-full right-0 mt-1.5 z-50 bg-[#121624]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 min-w-[95px] animate-in fade-in zoom-in-95 duration-150">
                  {(['16:9', '9:16', '1:1'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setAspectRatio(r);
                        setShowAspectDropdown(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-black text-left flex items-center justify-between transition-all active:scale-95 ${
                        aspectRatio === r
                          ? 'bg-cyan-400 text-slate-950 shadow-sm'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{r}</span>
                      {aspectRatio === r && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Video Stage Box */}
          <div
            ref={videoStageRef}
            id="wynmotion-video-stage"
            className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-700/60 flex items-center justify-center transition-all touch-none select-none"
            style={{
              backgroundColor: bgColor,
              aspectRatio: aspectRatio === '16:9' ? '16 / 9' : aspectRatio === '9:16' ? '9 / 16' : '1 / 1',
              height: aspectRatio === '9:16' ? '44vh' : aspectRatio === '1:1' ? '38vh' : 'auto',
              width: aspectRatio === '16:9' ? '100%' : 'auto',
              maxWidth: aspectRatio === '16:9' ? '100%' : 'min(100%, 300px)',
              maxHeight: aspectRatio === '16:9' ? '38vh' : '44vh',
            }}
          >
            <DynamicAnimationComposition
              scenes={scenes}
              visualStyle={visualStyle}
              showSceneCards={showSceneCards}
              showWhisperSubs={showWhisperSubs}
              cardPosY={cardPosY}
              subsPosY={subsPosY}
              swapSpeakers={swapSpeakers}
              captionSegments={captionSegments}
              captionPresetStyle={captionPresetStyle}
              captionFontSize={captionFontSize}
              onCardClick={() => setActiveBottomSheet('canvas')}
              onSubsClick={() => setActiveBottomSheet('canvas')}
            />

            {/* Interactive Direct Touch/Mouse Drag-to-Move for Dialogue Bubbles */}
            {(project.visual_style as string) === 'dialogue_scene' && activeScene && (() => {
              const isFlipped = swapSpeakers ?? (activeScene as any).swap_speakers ?? false;
              const isLeftTail = isFlipped ? activeSpeaker !== 'A' : activeSpeaker === 'A';
              const isPortrait = aspectRatio === '9:16';
              const customLayout = (activeScene as any).bubble_custom_layout || {};

              const defaultPosXA = isPortrait ? 36 : 28;
              const defaultPosYA = isPortrait ? 30 : 34;
              const defaultPosXB = isPortrait ? 64 : 72;
              const defaultPosYB = isPortrait ? 30 : 34;

              const posX = activeSpeaker === 'A'
                ? (customLayout.customPosXA ?? defaultPosXA)
                : (customLayout.customPosXB ?? defaultPosXB);

              const posY = activeSpeaker === 'A'
                ? (customLayout.customPosYA ?? customLayout.customTopPctA ?? customLayout.customTopPct ?? defaultPosYA)
                : (customLayout.customPosYB ?? customLayout.customTopPctB ?? customLayout.customTopPct ?? defaultPosYB);

              const widthPct = customLayout.customWidthPct || (isPortrait ? 82 : 48);

              return (
                <div
                  className={`absolute z-40 cursor-grab active:cursor-grabbing select-none transition-all touch-none rounded-3xl ${
                    isDraggingBubble
                      ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black/50 shadow-2xl bg-cyan-400/20'
                      : 'hover:ring-1 hover:ring-cyan-400/40 active:ring-2 active:ring-cyan-400'
                  }`}
                  style={{
                    top: `${posY}%`,
                    left: `${posX}%`,
                    transform: `translate(${isLeftTail ? -20 : -80}%, -100%)`,
                    width: `${widthPct}%`,
                    maxWidth: isPortrait ? 440 : 640,
                    minHeight: '60px',
                    height: '85px',
                    touchAction: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    startDragging(e.clientX, e.clientY);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (e.touches && e.touches[0]) {
                      startDragging(e.touches[0].clientX, e.touches[0].clientY);
                    }
                  }}
                >
                  {/* Subtle active indicator while dragging */}
                  {isDraggingBubble && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-400 text-slate-950 shadow-lg flex items-center gap-1 whitespace-nowrap">
                      <span>👤 {activeSpeaker === 'A' ? t('Nhân vật A', 'Speaker A') : t('Nhân vật B', 'Speaker B')}</span>
                      <span>•</span>
                      <span>X:{posX}% Y:{posY}%</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Scene counter pill */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-black text-white z-20">
              {activeSceneIndex + 1} / {scenes.length}
            </div>
          </div>
        </div>

        {/* ── Audio Language Dropdown & Sync Bar ── */}
        <div
          onClick={() => setActiveBottomSheet('audio')}
          className={`flex-shrink-0 flex items-center justify-between px-4 py-2 border-t cursor-pointer select-none transition-colors ${
            isDark ? 'border-slate-800/80 bg-[#0E111B] hover:bg-slate-900/90' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
              Audio:
            </span>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setShowAudioLangDropdown((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-[11px] font-black text-white hover:bg-slate-700 transition-all shadow-sm"
              >
                <span>
                  {multilingualAudios[activeAudioLang]?.flag || (activeAudioLang === 'vi' ? '🇻🇳' : '🇺🇸')}{' '}
                  {activeAudioLang.toUpperCase()}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showAudioLangDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showAudioLangDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAudioLangDropdown(false)} />
                  <div className="absolute top-full left-0 mt-1 z-50 bg-[#121624]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 min-w-[190px] animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                      {t('Bản Thu Ngôn Ngữ Clip', 'Clip Audio Languages')}
                    </div>
                    {Object.entries(multilingualAudios).map(([code, data]) => {
                      const isSelected = activeAudioLang === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            handleSelectAudioLang(code);
                            setShowAudioLangDropdown(false);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black text-left flex items-center justify-between transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-cyan-400 text-slate-950 shadow-sm'
                              : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{data.flag || '🌐'}</span>
                            <span>{data.language_name || code.toUpperCase()}</span>
                            <span className="text-[9px] opacity-75 font-mono">({Math.round(data.duration_sec)}s)</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setShowAudioLangDropdown(false);
                        setIsNewVoiceModalOpen(true);
                      }}
                      className="mt-1 pt-1.5 border-t border-white/10 px-2 py-1.5 text-[11px] font-bold text-cyan-400 hover:bg-cyan-500/15 rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('+ Tạo Ngôn Ngữ Mới', '+ Add New Language')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {/* Save Project Button (Full 5 tabs config) */}
            <button
              type="button"
              onClick={handleSaveProject}
              disabled={isSavingProject}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/25 active:scale-95 transition-all text-[10px] font-black shadow-sm cursor-pointer"
              title={t('Lưu dự án (toàn bộ 5 tabs)', 'Save Project (All 5 Tabs)')}
            >
              {isSavingProject ? (
                <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
              ) : (
                <Save className="w-3 h-3 text-emerald-400" />
              )}
              <span>{t('Lưu', 'Save')}</span>
            </button>

            {/* Quick BGM Button (Only shown if project has voice or BGM audio) */}
            {Boolean(hasVoiceAudio || bgmAudioUrl || (project as any).bgm_url) && (
              <button
                type="button"
                onClick={() => setIsMusicLibraryOpen(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-purple-500/15 border border-purple-400/40 text-purple-300 text-[10px] font-black hover:bg-purple-500/25 active:scale-95 transition-all shadow-sm"
              >
                <Music className="w-3 h-3" />
                <span>{bgmTrackTitle ? t('Đổi Nhạc Nền', 'Change BGM') : t('+ Nhạc Nền', '+ BGM')}</span>
              </button>
            )}

            {isAnimationSyncableTemplate(project.visual_style || visualStyle) && hasVoiceAudio && (
              <button
                type="button"
                onClick={() => syncAnimationWithAudio(totalDurationSec, 'Timeline hiện tại')}
                disabled={isSyncingTimeline}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400 text-[10px] font-black hover:bg-cyan-500/25 active:scale-95 transition-all shadow-sm"
              >
                {isSyncingTimeline ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 fill-cyan-400" />}
                <span>{t('Sync Animation', 'Sync Animation')}</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Multi-Track Timeline Slider (CapCut Look & Feel with 100+ GLSL Shaders & Trimming) ── */}
        <div className="pb-28">
          <MultiTrackTimelineSlider
            currentTime={currentTimeSec}
            totalDuration={totalDurationSec}
            isPlaying={isPlaying}
            onPlayPause={togglePlay}
            onSeek={(t) => seekTo(Math.round(t * 30))}
            tracks={timelineTracks}
            isMobile={true}
            selectedItemId={selectedTimelineItemId || (activeScene ? `media_${activeScene.scene_id}` : null)}
            onSelectItem={(itemId) => {
              setSelectedTimelineItemId(itemId);
              if (itemId?.startsWith('media_')) {
                const sId = parseInt(itemId.replace('media_', ''), 10);
                if (!isNaN(sId)) {
                  const s = scenes.find((sc) => sc.scene_id === sId);
                  if (s && s.start_frame !== undefined) seekTo(s.start_frame);
                }
              }
            }}
            onDeleteItem={(itemId) => {
              if (itemId === 'audio_voice' || itemId === 'track_voice') {
                handleRemoveAudio();
              } else if (itemId === 'audio_bgm' || itemId === 'track_bgm') {
                handleRemoveBgm();
              } else if (itemId?.startsWith('media_')) {
                const rawId = itemId.replace('media_', '');
                const sId = isNaN(Number(rawId)) ? rawId : Number(rawId);
                deleteScene(sId);
                setSelectedTimelineItemId(null);
              }
            }}
            onOpenFXTab={() => setActiveBottomSheet('effects')}
            onOpenAudioTab={() => setActiveBottomSheet('audio')}
            onAddCaptionSegment={() => setActiveBottomSheet('captions')}
            onUpdateItemDuration={(itemId, newStart, newDur) => {
              if (itemId === 'audio_bgm') {
                setBgmStartSec(newStart);
                setBgmDurationSec(newDur);
                setRemotionBgmStartSec?.(newStart);
                setRemotionBgmDurationSec?.(newDur);
                setSyncStatusMsg(`🎵 BGM: Bắt đầu ${newStart.toFixed(1)}s, dài ${newDur.toFixed(1)}s`);
                setTimeout(() => setSyncStatusMsg(null), 2500);
              } else if (itemId === 'audio_voice') {
                setVoiceStartSec(newStart);
                setVoiceDurationSec(newDur);
                setRemotionVoiceStartSec?.(newStart);
                setRemotionVoiceDurationSec?.(newDur);
                setSyncStatusMsg(`🎙️ Voice: Bắt đầu ${newStart.toFixed(1)}s, dài ${newDur.toFixed(1)}s`);
                setTimeout(() => setSyncStatusMsg(null), 2500);
              } else if (itemId.startsWith('fx_')) {
                const sId = parseInt(itemId.replace('fx_', ''), 10);
                updateScene(sId, {
                  transition_out: {
                    shader_name: (scenes.find((s) => s.scene_id === sId) as any)?.shader_name || 'GlitchMemories',
                    duration: Math.max(0.2, newDur),
                  },
                } as any);
                setSyncStatusMsg(`Đã cập nhật thời lượng chuyển cảnh: ${newDur.toFixed(2)}s!`);
                setTimeout(() => setSyncStatusMsg(null), 2500);
              }
            }}
          />
        </div>
      </div>

      {/* ── Bottom Action Toolbar (5 Tabs Fixed at Bottom) ── */}
      <div
        className={`flex-shrink-0 grid grid-cols-5 gap-1 px-2 py-2 border-t pb-[calc(max(env(safe-area-inset-bottom,0px),8px)+0.5rem)] z-30 ${
          isDark ? 'border-slate-800 bg-[#0F131C]' : 'border-slate-200 bg-white shadow-sm'
        }`}
      >
        {[
          { id: 'assets' as BottomSheet, icon: Folder, label: 'Assets', color: 'text-amber-400' },
          { id: 'audio' as BottomSheet, icon: Music, label: 'Sound', color: 'text-purple-400' },
          { id: 'canvas' as BottomSheet, icon: Sliders, label: 'Settings', color: 'text-cyan-400' },
          { id: 'effects' as BottomSheet, icon: Sparkles, label: 'FX', color: 'text-pink-400' },
          { id: 'captions' as BottomSheet, icon: Type, label: 'Captions', color: 'text-sky-400' },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeBottomSheet === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveBottomSheet(isActive ? null : item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 rounded-2xl transition-all active:scale-95 min-w-0 ${
                isActive
                  ? `bg-slate-800/90 border border-slate-600 ${item.color} shadow-sm font-black`
                  : isDark
                  ? 'text-slate-400 hover:text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-900 font-semibold'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] leading-none truncate max-w-full block">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. BOTTOM SHEETS
      ═══════════════════════════════════════════════════════════ */}
      {activeBottomSheet && (
        <BottomSheetOverlay isDark={isDark} onClose={() => setActiveBottomSheet(null)}>
          {/* ASSETS SHEET */}
          {activeBottomSheet === 'assets' && (
            <div className="space-y-5">
              <SheetHeader
                title={t('Assets & Phân Cảnh', 'Assets & Scenes')}
                subtitle={`${scenes.length} scenes`}
                isDark={isDark}
                onClose={() => setActiveBottomSheet(null)}
              />

              {/* Nút Thêm Cảnh Mới trong Sheet */}
              <button
                type="button"
                onClick={handleAddNewScene}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 active:scale-98 transition-all font-black text-xs shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t('+ Thêm Phân Cảnh Mới (5s Nền Đen)', '+ Add New Scene (5s Black BG)')}</span>
              </button>

              {/* Danh sách phân cảnh với Upload Ảnh/Video + Xoá cảnh */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {scenes.map((s, idx) => {
                  const isActive = idx === activeSceneIndex;
                  const dur = getSceneDuration(s);
                  const isVideo = Boolean(s.video_url);
                  const isImage = Boolean(s.image_url);

                  return (
                    <div
                      key={s.scene_id || idx}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isActive
                          ? isDark
                            ? 'border-cyan-500/60 bg-cyan-500/10 shadow-sm'
                            : 'border-cyan-400 bg-cyan-50'
                          : isDark
                          ? 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div
                          onClick={() => {
                            seekTo(s.start_frame || 0);
                            setActiveBottomSheet(null);
                          }}
                          className={`w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer relative ${
                            isDark ? 'bg-black border border-slate-700' : 'bg-black border border-slate-300'
                          }`}
                        >
                          {isVideo ? (
                            <video src={s.video_url} className="w-full h-full object-cover" />
                          ) : isImage ? (
                            <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                              <Layers className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                          <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/70 text-[9px] font-mono text-cyan-300">
                            {isVideo ? 'VID' : isImage ? 'IMG' : 'BLK'}
                          </span>
                        </div>

                        {/* Info & Duration */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            seekTo(s.start_frame || 0);
                            setActiveBottomSheet(null);
                          }}
                        >
                          <div className={`text-xs font-black truncate ${isActive ? 'text-cyan-400' : isDark ? 'text-white' : 'text-slate-900'}`}>
                            {t('Cảnh', 'Scene')} {idx + 1}: {s.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span className="font-mono text-cyan-300">{dur.toFixed(1)}s</span>
                            <span>•</span>
                            <span className="text-[10px]">{isVideo ? t('Video clip', 'Video clip') : isImage ? t('Hình ảnh', 'Image') : t('Nền đen', 'Black background')}</span>
                          </div>
                        </div>

                        {/* Actions: Upload & Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Upload Media Button */}
                          <label className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 cursor-pointer transition-all active:scale-95 flex items-center justify-center" title={t('Tải ảnh / video lên cảnh này', 'Upload image/video')}>
                            <Upload className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleMediaUploadForScene(s.scene_id, f);
                              }}
                            />
                          </label>

                          {/* Delete Scene Button */}
                          <button
                            type="button"
                            disabled={scenes.length <= 1}
                            onClick={() => deleteScene(s.scene_id)}
                            title={t('Xoá phân cảnh này', 'Delete scene')}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RE-DESIGN SCENE IMAGE WITH AI AGENT */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    {t('Tạo Lại Hình Ảnh Bằng AI Agent', 'Re-design Image with AI Agent')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-black text-amber-300 flex items-center gap-1">
                    <span>💎</span>
                    <span>3 {t('Điểm', 'Points')}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t(
                    'Gemini Agent sẽ phân tích nhân vật A/B, trang phục và bối cảnh kịch bản để vẽ lại bức tranh 3D Pixar / Anime mới tràn viền chuẩn xác (-3 điểm / lần).',
                    'Gemini Agent analyzes dialogue characters and generates a fresh 3D Pixar / Anime illustration (-3 points / gen).'
                  )}
                </p>
                <textarea
                  value={redesignPrompt}
                  onChange={(e) => setRedesignPrompt(e.target.value)}
                  rows={2}
                  placeholder={t(
                    'Gợi ý thêm về trang phục, bối cảnh, nét mặt (hoặc để trống)...',
                    'Add hints for outfit, setting (optional)...'
                  )}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-all"
                />
                <button
                  type="button"
                  disabled={isRedesigning}
                  onClick={handleRedesignImage}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isRedesigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('Đang phân tích kịch bản & vẽ lại...', 'Analyzing & Generating...')}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t('🎨 Vẽ Lại Ảnh Ngay', '🎨 Re-design Image Now')}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px] font-black text-amber-300">
                        💎 3 {t('Điểm', 'Pts')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* AUDIO SHEET: ATTACHED AUDIO & SOUND MANAGEMENT (2 TRACKS: VOICEOVER & BGM) */}
          {activeBottomSheet === 'audio' && (
            <div className="space-y-4 scrollbar-none pb-8">
              <SheetHeader
                title={t('🎵 Quản Lý Âm Thanh & Voiceover', '🎵 Audio & Voiceover Tracks')}
                subtitle={t('🎙️ Voiceover (Lời thoại) & 🎵 BGM (Nhạc nền)', '🎙️ Voiceover (Speech) & 🎵 BGM (Music)')}
                isDark={isDark}
                onClose={() => setActiveBottomSheet(null)}
              />

              {/* Hidden file inputs for uploading Voice and BGM */}
              <input
                ref={voiceUploadInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/flac,audio/*"
                className="hidden"
                onChange={handleUploadVoiceAudio}
              />
              <input
                ref={bgmUploadInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/flac,audio/*"
                className="hidden"
                onChange={handleUploadBgmAudio}
              />

              {/* 1. TRACK 1: VOICEOVER / GIỌNG ĐỌC LỜI THOẠI */}
              <div
                className={`p-4 rounded-3xl border transition-all space-y-3 ${
                  isDark
                    ? 'bg-gradient-to-br from-slate-900 to-[#0F1422] border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                    : 'bg-gradient-to-br from-cyan-50/70 to-blue-50/70 border-cyan-300 shadow-md'
                }`}
              >
                {(() => {
                  const activeTrack = multilingualAudios[activeAudioLang];
                  const langMeta = AUDIO_STUDIO_LANGUAGES.find(
                    (l) => l.code === activeAudioLang || l.code.toLowerCase() === activeAudioLang.toLowerCase() || (activeAudioLang === 'en' && l.code === 'en-US')
                  );
                  const trackFlag = activeTrack?.flag || langMeta?.flag || (activeAudioLang === 'vi' ? '🇻🇳' : '🌐');
                  const trackLangName = activeTrack?.language_name || langMeta?.name || (activeAudioLang === 'vi' ? 'Tiếng Việt' : activeAudioLang.toUpperCase());
                  const rawVoice = activeTrack?.voice_name || (project.language_code === activeAudioLang ? (project as any).voice_name : undefined);
                  const trackVoiceName = rawVoice
                    ? (rawVoice.includes('(') ? rawVoice.split('(')[0].trim() : rawVoice)
                    : (activeAudioLang === 'vi' ? 'Giọng Đọc AI' : activeAudioLang.startsWith('en') ? 'Bella' : activeAudioLang === 'ja' ? 'Alpha' : activeAudioLang === 'zh' ? 'Xiaobei' : activeAudioLang === 'kr' || activeAudioLang === 'ko' ? 'Sarah' : 'Custom Voice');

                  return (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
                          <Languages className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black truncate text-cyan-400">
                            {t('Track 1: Giọng Đọc / Lời Thoại (Voiceover)', 'Track 1: Voiceover / Narration')}
                          </div>
                          <div className={`text-[11px] truncate flex items-center gap-1.5 mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span>{trackFlag}</span>
                            <span className="font-bold">{hasVoiceAudio ? trackLangName : t('Chưa có âm thanh', 'No audio')}</span>
                            {hasVoiceAudio && trackVoiceName && (
                              <span className="text-[10px] text-slate-400 font-normal">({trackVoiceName})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {hasVoiceAudio && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-black border border-cyan-400/30 flex-shrink-0">
                          {Math.round(voiceDurationSec || totalDurationSec)}s
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Multilingual Selector Dropdown Bar (if multiple languages exist) */}
                {Object.keys(multilingualAudios).length > 1 && (
                  <div className="p-2 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-300 truncate">
                        {t('Ngôn ngữ Clip:', 'Clip Language:')}
                      </span>
                    </div>

                    <select
                      value={activeAudioLang}
                      onChange={(e) => handleSelectAudioLang(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-black outline-none focus:border-cyan-400"
                    >
                      {Object.entries(multilingualAudios).map(([code, data]) => (
                        <option key={code} value={code}>
                          {data.flag || '🌐'} {data.language_name || code.toUpperCase()} ({Math.round(data.duration_sec)}s)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Voice Action Buttons: Upload Custom Voice, Change AI Voice, Delete Voice */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    disabled={isUploadingVoice}
                    onClick={() => voiceUploadInputRef.current?.click()}
                    className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold flex flex-col items-center justify-center gap-1 border border-cyan-500/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isUploadingVoice ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Upload className="w-4 h-4 text-cyan-400" />}
                    <span className="truncate">{t('Tải Voice', 'Upload Voice')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNewVoiceModalOpen(true)}
                    className="py-2.5 px-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-[11px] font-bold flex flex-col items-center justify-center gap-1 border border-cyan-400/40 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-300 fill-cyan-300/30" />
                    <span className="truncate">{t('Đổi Giọng AI', 'AI Voice')}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!hasVoiceAudio}
                    onClick={handleRemoveAudio}
                    className={`py-2.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition-all border disabled:opacity-30 ${
                      isDark
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                        : 'border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span className="truncate">{t('Xoá Voice', 'Delete Voice')}</span>
                  </button>
                </div>
              </div>

              {/* 2. TRACK 2: BACKGROUND MUSIC (BGM) */}
              <div
                className={`p-4 rounded-3xl border transition-all space-y-3 ${
                  isDark
                    ? 'bg-gradient-to-br from-slate-900 to-[#120F24] border-purple-500/40 shadow-lg shadow-purple-500/5'
                    : 'bg-gradient-to-br from-purple-50/70 to-pink-50/70 border-purple-300 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate text-purple-400">
                        {t('Track 2: Nhạc Nền (Background Music - BGM)', 'Track 2: Background Music (BGM)')}
                      </div>
                      <div className={`text-[11px] truncate mt-0.5 font-bold ${bgmTrackTitle ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {bgmTrackTitle ? `🎶 ${bgmTrackTitle}` : t('Chưa chọn nhạc nền', 'No BGM selected')}
                      </div>
                    </div>
                  </div>

                  {bgmAudioUrl && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black border border-purple-400/30 flex-shrink-0">
                      {Math.round(bgmDurationSec || totalDurationSec)}s
                    </span>
                  )}
                </div>

                {/* BGM Action Buttons: Upload BGM, Pick Library, Delete BGM */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    disabled={isUploadingBgm}
                    onClick={() => bgmUploadInputRef.current?.click()}
                    className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] font-bold flex flex-col items-center justify-center gap-1 border border-purple-500/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isUploadingBgm ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <Upload className="w-4 h-4 text-purple-400" />}
                    <span className="truncate">{t('Tải Nhạc', 'Upload BGM')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMusicLibraryOpen(true)}
                    className="py-2.5 px-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-[11px] font-bold flex flex-col items-center justify-center gap-1 border border-purple-400/40 active:scale-95 transition-all"
                  >
                    <Music className="w-4 h-4 text-purple-300" />
                    <span className="truncate">{t('Thư Viện Nhạc', 'Music Library')}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!bgmAudioUrl}
                    onClick={handleRemoveBgm}
                    className={`py-2.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition-all border disabled:opacity-30 ${
                      isDark
                        ? 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
                        : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 text-purple-400" />
                    <span className="truncate">{t('Xoá BGM', 'Delete BGM')}</span>
                  </button>
                </div>
              </div>

              {/* 3. VOLUME SLIDERS */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t('Âm lượng Giọng Đọc (Voice)', 'Voice Volume')}</span>
                    </label>
                    <span className="text-xs font-black text-cyan-400">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      <Music className="w-3.5 h-3.5 text-purple-400" />
                      <span>{t('Âm lượng Nhạc Nền (BGM)', 'BGM Volume')}</span>
                    </label>
                    <span className="text-xs font-black text-purple-400">{Math.round(bgmVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={bgmVolume}
                    onChange={(e) => handleBgmVolumeChange(parseFloat(e.target.value))}
                    className="w-full accent-purple-400 h-2 rounded-lg"
                  />
                </div>
              </div>

              {/* 4. SYNC TIMELINE BUTTON (CHỈ HIỂN THỊ KHI CÓ VOICE AUDIO VÀ THUỘC TEMPLATE HỖ TRỢ CO DÃN ANIMATION) */}
              {isAnimationSyncableTemplate(project.visual_style || visualStyle) && hasVoiceAudio && (
                <button
                  type="button"
                  onClick={() => syncAnimationWithAudio(totalDurationSec, 'Timeline hiện tại')}
                  disabled={isSyncingTimeline}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSyncingTimeline ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-slate-950" />}
                  <span>{t('Đồng Bộ Toàn Bộ Phân Cảnh Theo Audio (Sync)', 'Sync All Scenes to Audio')}</span>
                </button>
              )}
            </div>
          )}

          {/* CANVAS & 2-LAYER TEXT SETTINGS SHEET */}
          {activeBottomSheet === 'canvas' && (
            <div className="space-y-6">
              <SheetHeader
                title={t('Cài Đặt Canvas & 2 Khung Văn Bản', 'Canvas & 2 Text Layers Settings')}
                isDark={isDark}
                onClose={() => setActiveBottomSheet(null)}
              />

              {/* 1. MÀU NỀN CANVAS (ẨN ĐỐI VỚI DIALOGUE SCENE DO HÌNH ẢNH TRÀN VIỀN 100%) */}
              {(project?.visual_style as string) !== 'dialogue_scene' && (
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                    {t('1. Màu Nền Canvas', '1. Canvas Background')}
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {BG_THEMES.map((theme) => (
                      <button
                        key={theme.color}
                        type="button"
                        onClick={() => setBgColor(theme.color)}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                          bgColor === theme.color
                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/40 shadow-sm'
                            : isDark
                            ? 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-black/20 flex-shrink-0 shadow-sm" style={{ backgroundColor: theme.color }} />
                        <span className="truncate">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DIALOGUE SCENE SCRIPT SETTINGS VS 2-LAYER TEXT SETTINGS */}
              {(project?.visual_style as string) === 'dialogue_scene' ? (
                <div className="space-y-5 pt-2">
                  {/* BUBBLE POSITION & GEOMETRY CONTROLS */}
                  <div className="space-y-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm" />
                        <span className="text-xs font-black text-white">
                          {t('Vị Trí & Kích Thước Bong Bóng', 'Speech Bubble Layout')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSwapSpeakers((prev) => !prev)}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 transition-all ${
                          swapSpeakers
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                            : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span>🔄</span>
                        <span>{swapSpeakers ? t('Đã Đổi Bên', 'Swapped') : t('Đổi Bên (Trái ⇋ Phải)', 'Swap Sides')}</span>
                      </button>
                    </div>

                    {/* 2D Positioning Sliders for Character A and Character B */}
                    <div className="space-y-3.5 pt-1">
                      {/* Character A (Left Speaker) */}
                      <div className="space-y-2 bg-slate-950/70 p-3 rounded-2xl border border-sky-500/30">
                        <div className="text-[11px] font-black text-sky-400 flex items-center justify-between">
                          <span>👤 {t('Nhân Vật A (Bên Trái)', 'Speaker A (Left)')}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            X: {activeScene?.bubble_custom_layout?.customPosXA ?? (aspectRatio === '9:16' ? 36 : 28)}% • Y: {activeScene?.bubble_custom_layout?.customPosYA ?? activeScene?.bubble_custom_layout?.customTopPctA ?? (aspectRatio === '9:16' ? 30 : 34)}%
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{t('Vị trí Ngang (X %):', 'Horizontal (X %):')}</span>
                            <span className="text-sky-300 font-mono">{activeScene?.bubble_custom_layout?.customPosXA ?? (aspectRatio === '9:16' ? 36 : 28)}%</span>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={90}
                            step={1}
                            value={activeScene?.bubble_custom_layout?.customPosXA ?? (aspectRatio === '9:16' ? 36 : 28)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              updateScene(activeScene.scene_id, {
                                bubble_custom_layout: {
                                  ...(activeScene.bubble_custom_layout || {}),
                                  customPosXA: val,
                                },
                              });
                            }}
                            className="w-full accent-sky-400 h-1.5 rounded-lg bg-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{t('Vị trí Dọc (Y %):', 'Vertical (Y %):')}</span>
                            <span className="text-sky-300 font-mono">{activeScene?.bubble_custom_layout?.customPosYA ?? activeScene?.bubble_custom_layout?.customTopPctA ?? (aspectRatio === '9:16' ? 30 : 34)}%</span>
                          </div>
                          <input
                            type="range"
                            min={8}
                            max={90}
                            step={1}
                            value={activeScene?.bubble_custom_layout?.customPosYA ?? activeScene?.bubble_custom_layout?.customTopPctA ?? (aspectRatio === '9:16' ? 30 : 34)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              updateScene(activeScene.scene_id, {
                                bubble_custom_layout: {
                                  ...(activeScene.bubble_custom_layout || {}),
                                  customPosYA: val,
                                  customTopPctA: val,
                                  customTopPct: val,
                                },
                              });
                            }}
                            className="w-full accent-sky-400 h-1.5 rounded-lg bg-slate-800"
                          />
                        </div>
                      </div>

                      {/* Character B (Right Speaker) */}
                      <div className="space-y-2 bg-slate-950/70 p-3 rounded-2xl border border-emerald-500/30">
                        <div className="text-[11px] font-black text-emerald-400 flex items-center justify-between">
                          <span>👤 {t('Nhân Vật B (Bên Phải)', 'Speaker B (Right)')}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            X: {activeScene?.bubble_custom_layout?.customPosXB ?? (aspectRatio === '9:16' ? 64 : 72)}% • Y: {activeScene?.bubble_custom_layout?.customPosYB ?? activeScene?.bubble_custom_layout?.customTopPctB ?? (aspectRatio === '9:16' ? 30 : 34)}%
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{t('Vị trí Ngang (X %):', 'Horizontal (X %):')}</span>
                            <span className="text-emerald-300 font-mono">{activeScene?.bubble_custom_layout?.customPosXB ?? (aspectRatio === '9:16' ? 64 : 72)}%</span>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={90}
                            step={1}
                            value={activeScene?.bubble_custom_layout?.customPosXB ?? (aspectRatio === '9:16' ? 64 : 72)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              updateScene(activeScene.scene_id, {
                                bubble_custom_layout: {
                                  ...(activeScene.bubble_custom_layout || {}),
                                  customPosXB: val,
                                },
                              });
                            }}
                            className="w-full accent-emerald-400 h-1.5 rounded-lg bg-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{t('Vị trí Dọc (Y %):', 'Vertical (Y %):')}</span>
                            <span className="text-emerald-300 font-mono">{activeScene?.bubble_custom_layout?.customPosYB ?? activeScene?.bubble_custom_layout?.customTopPctB ?? (aspectRatio === '9:16' ? 30 : 34)}%</span>
                          </div>
                          <input
                            type="range"
                            min={8}
                            max={90}
                            step={1}
                            value={activeScene?.bubble_custom_layout?.customPosYB ?? activeScene?.bubble_custom_layout?.customTopPctB ?? (aspectRatio === '9:16' ? 30 : 34)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              updateScene(activeScene.scene_id, {
                                bubble_custom_layout: {
                                  ...(activeScene.bubble_custom_layout || {}),
                                  customPosYB: val,
                                  customTopPctB: val,
                                  customTopPct: val,
                                },
                              });
                            }}
                            className="w-full accent-emerald-400 h-1.5 rounded-lg bg-slate-800"
                          />
                        </div>
                      </div>

                      {/* Bubble Width & Font Size Grid */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        {/* Width */}
                        <div className="space-y-1 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                            <span>{t('Độ rộng bong bóng:', 'Bubble Width:')}</span>
                            <span className="text-cyan-400 font-mono">
                              {activeScene?.bubble_custom_layout?.customWidthPct ?? (aspectRatio === '9:16' ? 82 : 48)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={45}
                            max={95}
                            step={1}
                            value={activeScene?.bubble_custom_layout?.customWidthPct ?? (aspectRatio === '9:16' ? 82 : 48)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              updateScene(activeScene.scene_id, {
                                bubble_custom_layout: {
                                  ...(activeScene.bubble_custom_layout || {}),
                                  customWidthPct: val,
                                },
                              });
                            }}
                            className="w-full accent-cyan-400 h-1.5 rounded-lg bg-slate-800"
                          />
                        </div>

                        {/* Font Size */}
                        {(() => {
                          const isPortrait = aspectRatio === '9:16';
                          const isSquare = aspectRatio === '1:1';
                          const baseW = isPortrait ? 1080 : isSquare ? 1080 : 1920;
                          const defaultFontPct = isPortrait ? 3.3 : isSquare ? 3.3 : 2.0;

                          const layout = activeScene?.bubble_custom_layout || {};
                          const currentFontPct = layout.fontSizePct
                            ? Number(layout.fontSizePct)
                            : layout.fontSize
                            ? (layout.fontSize > 26 ? ((layout.fontSize / baseW) * 100) : ((layout.fontSize / (isPortrait ? 420 : isSquare ? 580 : 880)) * 100))
                            : defaultFontPct;

                          const equiv1080pPx = Math.round(baseW * (currentFontPct / 100));

                          return (
                            <div className="space-y-1 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                                <span>{t('Cỡ chữ (% Màn hình):', 'Font Size (% Screen):')}</span>
                                <span className="text-amber-400 font-mono">
                                  {currentFontPct.toFixed(1)}% ({equiv1080pPx}px)
                                </span>
                              </div>
                              <input
                                type="range"
                                min={isPortrait || isSquare ? 2.2 : 1.4}
                                max={isPortrait || isSquare ? 5.0 : 3.2}
                                step={0.1}
                                value={currentFontPct}
                                onChange={(e) => {
                                  const pct = parseFloat(e.target.value);
                                  const px1080 = Math.round(baseW * (pct / 100));
                                  updateScene(activeScene.scene_id, {
                                    bubble_custom_layout: {
                                      ...(activeScene.bubble_custom_layout || {}),
                                      fontSizePct: pct,
                                      fontSize: px1080,
                                    },
                                  });
                                }}
                                className="w-full accent-amber-400 h-1.5 rounded-lg bg-slate-800"
                              />
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Color Themes */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-bold text-slate-300 block">
                        {t('Tông Màu Bong Bóng Thoại:', 'Bubble Color Theme:')}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Navy & Forest', bgA: '#132644', bgB: '#1E392A', textA: '#FFFFFF', textB: '#FFFFFF' },
                          { label: 'Obsidian & Amber', bgA: '#18181B', bgB: '#78350F', textA: '#FFFFFF', textB: '#FEF3C7' },
                          { label: 'Midnight & Indigo', bgA: '#0F172A', bgB: '#312E81', textA: '#FFFFFF', textB: '#E0E7FF' },
                          { label: 'Pure Milk & Slate', bgA: '#F8FAFC', bgB: '#E2E8F0', textA: '#0F172A', textB: '#0F172A' },
                        ].map((th) => (
                          <button
                            key={th.label}
                            type="button"
                            onClick={() => {
                              if (activeScene) {
                                updateScene(activeScene.scene_id, {
                                  bubble_custom_layout: {
                                    ...(activeScene.bubble_custom_layout || {}),
                                    bgColorA: th.bgA,
                                    bgColorB: th.bgB,
                                    textColorA: th.textA,
                                    textColorB: th.textB,
                                  },
                                });
                              }
                            }}
                            className="p-2 rounded-xl border border-slate-800 bg-slate-950 flex items-center gap-2 text-[11px] font-bold text-slate-300 hover:border-cyan-400/50 transition-all"
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: th.bgA }} />
                            <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: th.bgB }} />
                            <span className="truncate">{th.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {activeScene && (
                    <div className="space-y-2 bg-slate-900/60 p-4 rounded-3xl border border-slate-700/60">
                      <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t('Chỉnh sửa Lời Thoại / Kịch bản:', 'Edit Dialogue Script:')}</span>
                      </div>
                      <textarea
                        value={activeScene.voice_transcript || activeScene.summary_text || ''}
                        onChange={(e) =>
                          updateScene(activeScene.scene_id, {
                            voice_transcript: e.target.value,
                            summary_text: e.target.value,
                          })
                        }
                        rows={6}
                        className="w-full px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-mono"
                        placeholder="[Nhân vật A]: Lời thoại...\n[Nhân vật B]: Lời thoại..."
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* LAYER 1: AI SCENE NOTE CARD */}
                  <div className="space-y-3 pt-4 border-t border-slate-800/80 bg-slate-900/60 p-4 rounded-3xl border border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-white border border-slate-400 shadow-sm" />
                        <div>
                          <span className="text-xs font-black text-white block">
                            {t('Lớp 1: Thẻ Tóm Tắt AI (White Card)', 'Layer 1: AI Scene Note Card (White Card)')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {t('Khung trắng font viết tay tóm tắt nội dung chính', 'Handwritten white card summarizing the scene')}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSceneCards((v) => !v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                          showSceneCards ? 'bg-cyan-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {showSceneCards ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{showSceneCards ? t('BẬT', 'ON') : t('TẮT', 'OFF')}</span>
                      </button>
                    </div>

                    {showSceneCards && (
                      <>
                        <div className="space-y-1.5 pt-2">
                          <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                            <span>{t('Vị trí hiển thị Thẻ Trắng:', 'White Card Position:')}</span>
                            <span className="text-cyan-400 capitalize">{cardPosY}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'top' as TextPosition, icon: AlignVerticalJustifyStart, label: 'Trên Cùng' },
                              { id: 'middle' as TextPosition, icon: AlignVerticalJustifyCenter, label: 'Ở Giữa' },
                              { id: 'bottom' as TextPosition, icon: AlignVerticalJustifyEnd, label: 'Phía Dưới' },
                            ].map((pos) => {
                              const PosIcon = pos.icon;
                              return (
                                <button
                                  key={pos.id}
                                  type="button"
                                  onClick={() => setCardPosY(pos.id)}
                                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    cardPosY === pos.id
                                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                                      : 'border-slate-800 bg-slate-900 text-slate-400'
                                  }`}
                                >
                                  <PosIcon className="w-3.5 h-3.5" />
                                  <span>{pos.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {(project.visual_style as string) === 'dialogue_scene' && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setSwapSpeakers((prev) => !prev)}
                              className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                                swapSpeakers
                                  ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span>🔄</span>
                              <span>{t('Đổi Bên Nhân Vật (Trái ⇋ Phải)', 'Swap Character Sides (Left ⇋ Right)')}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                                {swapSpeakers ? t('Đã Đổi', 'Swapped') : t('Mặc Định', 'Default')}
                              </span>
                            </button>
                          </div>
                        )}

                        {activeScene && (
                          <div className="space-y-2 pt-2">
                            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{t(`Sửa Tóm Tắt AI (Scene ${activeSceneIndex + 1})`, `Edit AI Summary (Scene ${activeSceneIndex + 1})`)}</span>
                            </div>
                            <textarea
                              value={activeScene.summary_text || activeScene.voice_transcript || ''}
                              onChange={(e) => updateScene(activeScene.scene_id, { summary_text: e.target.value })}
                              rows={2}
                              className="w-full px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                              placeholder={t('Nhập tóm tắt phân cảnh viết tay...', 'Enter scene summary...')}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TEMPLATES SHEET */}
          {activeBottomSheet === 'templates' && (
            <div className="space-y-4">
              <TemplatesFlyoutTab
                onClose={() => setActiveBottomSheet(null)}
                onApplyTemplate={(tplId) => {
                  setVisualStyle(tplId);
                  setActiveBottomSheet(null);
                }}
                currentTemplateId={visualStyle}
                isVertical={aspectRatio === '9:16'}
              />
            </div>
          )}

          {/* CAPTIONS SHEET */}
          {activeBottomSheet === 'captions' && (
            <div className="space-y-4">
              <CaptionsFlyoutTab
                onClose={() => setActiveBottomSheet(null)}
                audioUrl={audioSrc}
                segments={captionSegments}
                onChangeSegments={handleChangeSegments}
                presetStyle={captionPresetStyle}
                onChangePresetStyle={handleChangePresetStyle}
                captionFontSize={captionFontSize}
                onChangeCaptionFontSize={handleChangeFontSize}
                onTranscribeWhisper={handleTranscribeCaptions}
                isTranscribing={isTranscribingCaptions}
                visualStyle={project.visual_style || visualStyle}
                showSubs={showWhisperSubs}
                onToggleSubs={() => {
                  setShowWhisperSubs((v) => {
                    const nv = !v;
                    if (project?.project_id) {
                      wynmotionService.updateProject(project.project_id, { show_whisper_subs: nv } as any).catch(console.warn);
                    }
                    return nv;
                  });
                }}
                subsPosY={subsPosY}
                onChangeSubsPosY={(pos) => {
                  setSubsPosY(pos);
                  if (project?.project_id) {
                    wynmotionService.updateProject(project.project_id, { subs_pos_y: pos } as any).catch(console.warn);
                  }
                }}
                activeScene={activeScene}
                activeSceneIndex={activeSceneIndex}
                onUpdateActiveSceneTranscript={(text) => {
                  if (activeScene) {
                    updateScene(activeScene.scene_id, { voice_transcript: text });
                  }
                }}
                hasVoiceAudio={hasVoiceAudio}
                isCommercialMusicStyle={isCommercialMusicStyle}
                sourceBadgeText={(activeScene as any)?.source_badge_text || (scenes[0] as any)?.source_badge_text || 'TIN MỚI TỪ VNEXPRESS'}
                onChangeSourceBadgeText={(txt) => {
                  if (activeScene) updateScene(activeScene.scene_id, { source_badge_text: txt } as any);
                }}
                sourceBadgePosX={(activeScene as any)?.source_badge_pos_x ?? (scenes[0] as any)?.source_badge_pos_x ?? 5}
                onChangeSourceBadgePosX={(x) => {
                  if (activeScene) updateScene(activeScene.scene_id, { source_badge_pos_x: x } as any);
                }}
                sourceBadgePosY={(activeScene as any)?.source_badge_pos_y ?? (scenes[0] as any)?.source_badge_pos_y ?? 5}
                onChangeSourceBadgePosY={(y) => {
                  if (activeScene) updateScene(activeScene.scene_id, { source_badge_pos_y: y } as any);
                }}
                captionPosY={(activeScene as any)?.caption_pos_y ?? (scenes[0] as any)?.caption_pos_y ?? 20}
                onChangeCaptionPosY={(y) => {
                  if (activeScene) updateScene(activeScene.scene_id, { caption_pos_y: y } as any);
                }}
                tickerText={(activeScene as any)?.ticker_text || (scenes[0] as any)?.ticker_text || '⚡ BẢN TIN NÓNG • Cập nhật liên tục 24/7'}
                onChangeTickerText={(txt) => {
                  if (activeScene) updateScene(activeScene.scene_id, { ticker_text: txt } as any);
                }}
                scenes={scenes as any}
                originalLanguage={(project as any)?.whisper_original_language || 'vi'}
                targetLanguage={(project as any)?.whisper_target_language || 'en'}
                hasTranslatedSegments={Boolean((project as any)?.whisper_translated_segments?.length > 0)}
                activeSubtitleMode={(project as any)?.whisper_active_mode || 'original'}
                onChangeSubtitleMode={(mode) => {
                  const p = project as any;
                  if (mode === 'translated' && p?.whisper_translated_segments?.length > 0) {
                    setCaptionSegments(p.whisper_translated_segments);
                  } else {
                    setCaptionSegments(p?.whisper_original_segments || p?.whisper_segments || captionSegments);
                  }
                  if (project?.project_id) {
                    wynmotionService.updateProject(project.project_id, { whisper_active_mode: mode } as any).catch(console.warn);
                  }
                }}
              />
            </div>
          )}

          {/* FX TRANSITIONS & EFFECTS SHEET */}
          {activeBottomSheet === 'effects' && (
            <div className="space-y-4">
              <EffectsFlyoutTab
                onClose={() => setActiveBottomSheet(null)}
                selectedSceneIndex={activeSceneIndex}
                currentShaderName={
                  activeScene ? (activeScene as any).shader_name || (activeScene as any).transition_out?.shader_name : undefined
                }
                onApplyTransition={(shaderName) => {
                  if (activeScene) {
                    updateScene(activeScene.scene_id, {
                      transition_out: { shader_name: shaderName, duration: 0.5 },
                      shader_name: shaderName,
                    } as any);
                  }
                  setSyncStatusMsg(`Đã áp dụng chuyển cảnh: ${shaderName}!`);
                  setTimeout(() => setSyncStatusMsg(null), 2500);
                  setActiveBottomSheet(null);
                }}
                onApplyEffect={(effId) => {
                  if (activeScene) {
                    updateScene(activeScene.scene_id, {
                      underlayer_effect: effId,
                    } as any);
                  }
                  setSyncStatusMsg(`Đã áp dụng hiệu ứng: ${effId}!`);
                  setTimeout(() => setSyncStatusMsg(null), 2500);
                  setActiveBottomSheet(null);
                }}
              />
            </div>
          )}
        </BottomSheetOverlay>
      )}

      {/* PROJECT INFO ACTION MODAL / SHEET */}
      {isSettingsSheetOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-end pointer-events-auto"
          style={{ transform: 'translateZ(999px)', WebkitTransform: 'translateZ(999px)' }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSettingsSheetOpen(false)} />
          <div
            className={`relative z-[10000] w-full rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom-full duration-200 pb-[calc(max(env(safe-area-inset-bottom,0px),16px)+1rem)] ${
              isDark ? 'bg-[#121624] border-t border-slate-700' : 'bg-white border-t border-slate-200 shadow-2xl'
            }`}
            style={{ transform: 'translateZ(1000px)', WebkitTransform: 'translateZ(1000px)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('Thông Tin Chi Tiết Dự Án', 'Project Info & Specifications')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsSheetOpen(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`p-4 rounded-2xl text-xs space-y-2.5 border ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">{t('Mã Dự Án (ID)', 'Project ID')}</span>
                <span className="font-mono text-cyan-400 font-bold">{project.project_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">{t('Phong Cách', 'Visual Style')}</span>
                <span className="font-bold text-white uppercase">{project.visual_style}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">{t('Tổng Số Scenes', 'Total Scenes')}</span>
                <span className="font-bold">{scenes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">{t('Thời Lượng', 'Total Duration')}</span>
                <span className="font-bold text-cyan-400">{Math.round(totalDurationSec)}s ({durationInFrames} frames)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">{t('Tỉ Lệ Khung Hình', 'Aspect Ratio')}</span>
                <span className="font-bold text-cyan-400">{aspectRatio}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsSheetOpen(false)}
              className="w-full py-3.5 rounded-2xl bg-cyan-400 text-slate-950 font-black text-sm transition-all shadow-md"
            >
              <span>{t('Đóng', 'Close')}</span>
            </button>
          </div>
        </div>
      )}

      {/* EXPORT PROGRESS & NATIVE SAVE / SHARE MODAL */}
      {exportModalState?.isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-auto"
          style={{ transform: 'translateZ(999px)', WebkitTransform: 'translateZ(999px)' }}
        >
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => {
              if (exportModalState.status === 'completed' || exportModalState.status === 'failed') {
                setExportModalState(null);
              }
            }}
          />

          <div
            className={`relative z-[10000] w-full max-w-sm rounded-3xl p-6 shadow-2xl border animate-in zoom-in-95 duration-200 space-y-5 ${
              isDark ? 'bg-gradient-to-b from-[#161d31] to-[#0d1222] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            style={{ transform: 'translateZ(1000px)', WebkitTransform: 'translateZ(1000px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {exportModalState.status === 'rendering' ? (
                  <div className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">
                    <Film className="w-5 h-5" />
                  </div>
                ) : exportModalState.status === 'completed' ? (
                  <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    {exportModalState.status === 'completed'
                      ? t('🎉 Xuất Video Thành Công!', '🎉 Export Completed!')
                      : exportModalState.status === 'failed'
                      ? t('❌ Xuất Video Thất Bại', '❌ Export Failed')
                      : t('🎬 Đang Render Video MP4...', '🎬 Rendering MP4 Video...')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {exportModalState.status === 'rendering'
                      ? `⏱️ ${Math.floor(exportModalState.elapsedSec / 60)
                          .toString()
                          .padStart(2, '0')}:${(exportModalState.elapsedSec % 60)
                          .toString()
                          .padStart(2, '0')} / 05:00`
                      : t('Full HD 1080p • 30fps Audio Sync', 'Full HD 1080p • 30fps Audio Sync')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExportModalState(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Body */}
            {exportModalState.status === 'rendering' && (
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-cyan-400 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="line-clamp-1">{exportModalState.message}</span>
                    </span>
                    <span className="text-slate-300 font-mono">{exportModalState.progress}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500 shadow-lg"
                      style={{ width: `${Math.max(5, exportModalState.progress)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200/80 leading-relaxed">
                  {t(
                    '💡 Bạn có thể ẩn cửa sổ này để làm việc khác. Video sẽ tiếp tục render và tự động lưu vào mục Video Xuất trong Thư viện.',
                    '💡 You can minimize this window. The video will finish in the background and save to your Videos Library.'
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setExportModalState(null)}
                  className="w-full py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all border border-slate-700/60"
                >
                  {t('Ẩn Xuống Nền (Tiếp Tục Render)', 'Run in Background')}
                </button>
              </div>
            )}

            {exportModalState.status === 'completed' && exportModalState.mp4Url && (
              <div className="space-y-4">
                {/* Video Preview */}
                <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-[9/16] max-h-56 mx-auto shadow-inner flex items-center justify-center">
                  <video
                    src={exportModalState.mp4Url}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => triggerNativeShare(exportModalState.mp4Url!)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{t('📱 Lưu vào iPhone (Camera Roll) / Chia Sẻ', '📱 Save to iPhone / Share Video')}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={exportModalState.mp4Url}
                      download={`WynMotion_${project.project_id.slice(0, 8)}.mp4`}
                      className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700 text-center"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t('Tải MP4', 'Download')}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setExportModalState(null);
                        setIsStudioOpen?.(false);
                        setActiveTab?.('library');
                      }}
                      className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                    >
                      <Folder className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('Mở Thư Viện', 'Open Library')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {exportModalState.status === 'failed' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
                  {exportModalState.message}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportModalState(null)}
                    className="py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700"
                  >
                    {t('Đóng', 'Close')}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportMP4}
                    className="py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t('Thử Lại', 'Retry')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sound & Music Library Modal with Saved Tab */}
      <SoundMusicLibraryModal
        isOpen={isMusicLibraryOpen}
        onClose={() => setIsMusicLibraryOpen(false)}
        onSelectTrackForVideo={handleSelectBgmFromLibrary}
      />

      {/* Multilingual Voice Generation Modal */}
      <NewVoiceLanguageModal
        isOpen={isNewVoiceModalOpen}
        onClose={() => setIsNewVoiceModalOpen(false)}
        basePrompt={project.prompt}
        baseScript={project.script || scenes.map((s) => s.voice_transcript || s.title).join('. ')}
        visualStyle={project.visual_style}
        currentLangCode={activeAudioLang}
        onSuccess={handleAddNewVoiceTrack}
      />

      {/* ── Science Explainer: Slide-In Left Chat Drawer ── */}
      {isScienceChatOpen && (
        <div
          className="fixed inset-0 z-[9999] flex pointer-events-auto"
          style={{ transform: 'translateZ(999px)', WebkitTransform: 'translateZ(999px)' }}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsScienceChatOpen(false)}
          />
          <div
            className={`relative z-[10000] w-[88vw] max-w-[370px] h-full flex flex-col justify-between p-4 space-y-3 animate-in slide-in-from-left duration-250 pb-[calc(max(env(safe-area-inset-bottom,0px),16px)+1rem)] pt-[max(env(safe-area-inset-top,0px),16px)] shadow-2xl ${
              isDark ? 'bg-[#0E121F] border-r border-slate-700/60' : 'bg-slate-900 border-r border-slate-700'
            }`}
            style={{ transform: 'translateZ(1000px)', WebkitTransform: 'translateZ(1000px)' }}
          >
            <div className="space-y-3 overflow-y-auto pr-1">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-sm">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white">Edit by Chat with AI</h3>
                    <p className="text-[10px] text-slate-400">
                      {isVietnamese ? 'Chỉnh sửa hoạt họa Science Explainer' : 'Edit Science Explainer animation'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScienceChatOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Version History Toggle Pill */}
              <div className="flex items-center justify-between bg-[#14192A] border border-cyan-500/30 p-2 rounded-2xl">
                <div className="flex items-center gap-2 text-xs text-white font-bold">
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-[11px] border border-cyan-500/40">
                    v{scienceVersions.find((v) => v.is_applied)?.version_number || scienceVersions.length || 1}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {isVietnamese ? 'Phiên bản hoạt họa' : 'Animation version'}
                  </span>
                </div>
                {scienceVersions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{showVersionHistory ? (isVietnamese ? 'Ẩn' : 'Hide') : (isVietnamese ? 'Lịch sử' : 'History')} ({scienceVersions.length})</span>
                  </button>
                )}
              </div>

              {/* Version History List */}
              {showVersionHistory && scienceVersions.length > 0 && (
                <div className="space-y-1.5 p-2 rounded-2xl bg-[#0B0E18] border border-slate-800 max-h-44 overflow-y-auto">
                  {scienceVersions.map((v: any) => (
                    <div
                      key={v.version_id}
                      className={`p-2 rounded-xl text-xs flex items-center justify-between gap-2 border transition-all ${
                        v.is_applied
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                          : 'bg-[#121626] border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="font-mono text-cyan-400 text-[11px]">v{v.version_number}</span>
                          <span className="truncate text-[11px]">{v.prompt || (isVietnamese ? 'Bản gốc' : 'Initial')}</span>
                        </div>
                        {v.explanation && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{v.explanation}</p>
                        )}
                      </div>
                      {v.is_applied ? (
                        <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {isVietnamese ? 'Đang dùng' : 'Applied'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyScienceVersion(v.version_id)}
                          className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-cyan-400 text-slate-950 active:scale-95 transition-all shadow-sm"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* AI Explanation Banner */}
              {scienceExplainingMsg && (
                <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-xs text-cyan-200 leading-relaxed shadow-sm flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <div className="font-bold text-white text-[11px] mb-0.5">Gemini 3.8 Flash</div>
                    <div className="text-[11px]">{scienceExplainingMsg}</div>
                  </div>
                </div>
              )}

              {/* Quick suggestions */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400">
                  {isVietnamese ? 'Gợi ý chỉnh sửa nhanh:' : 'Quick suggestions:'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '🟣 Đổi laser sang tím neon',
                    '⚛️ Thêm quỹ đạo electron',
                    '📐 Lưới 3D blueprint',
                    '⚡ Tăng tốc độ quay hạt',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      disabled={isEditingScienceCode}
                      onClick={() => handleSendScienceCodePrompt(chip)}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-xl bg-[#14192A] text-slate-300 hover:text-cyan-300 border border-slate-700/60 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Scene Transcript Display */}
              <div className="p-3 rounded-2xl bg-[#090C16] border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {isVietnamese
                    ? `Phân cảnh ${(activeScene as any)?.scene_number || activeScene?.scene_id || 1}`
                    : `Scene ${(activeScene as any)?.scene_number || activeScene?.scene_id || 1}`}
                </div>
                <p className="text-[11px] text-slate-200 italic line-clamp-3">
                  "{activeScene?.voice_transcript || activeScene?.summary_text || activeScene?.title || (isVietnamese ? 'Khoa học STEM' : 'Science STEM')}"
                </p>
              </div>
            </div>

            {/* Input area */}
            <div className="pt-2 border-t border-slate-800">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={scienceChatInput}
                  disabled={isEditingScienceCode}
                  onChange={(e) => setScienceChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendScienceCodePrompt();
                    }
                  }}
                  placeholder={
                    isEditingScienceCode
                      ? (isVietnamese ? 'Gemini 3.8 Flash đang sửa code...' : 'Gemini 3.8 Flash editing code...')
                      : (isVietnamese ? 'Yêu cầu sửa hoạt họa (Enter gửi)...' : 'Type animation changes (Enter to send)...')
                  }
                  className="w-full pl-3 pr-14 py-2.5 text-xs rounded-2xl bg-[#14192A] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  disabled={isEditingScienceCode || !scienceChatInput.trim()}
                  onClick={() => handleSendScienceCodePrompt()}
                  className="absolute right-1.5 p-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-40 active:scale-95 transition-all"
                >
                  {isEditingScienceCode ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Root Studio Component Wrapped in RemotionPlayerProvider ─────────

interface MobileVideoEditorStudioProps {
  project: MotionProject;
  onBack: () => void;
}

export const MobileVideoEditorStudio: React.FC<MobileVideoEditorStudioProps> = ({ project, onBack }) => {
  let rawScenes = project.scenes && project.scenes.length > 0 ? (project.scenes as any) : [];

  // Safe Fallback: If CapCut template or single-scene ads has empty scenes, synthesize the template scene from project metadata
  if (
    rawScenes.length === 0 &&
    project.visual_style &&
    ['ads_cinematic_showcase', 'cinematic_showcase', 'ads_strobe_teaser', 'strobe_teaser', 'product_ads_motion'].includes(
      project.visual_style
    )
  ) {
    const gallery =
      (project as any).product_images ||
      (project as any).user_media_urls ||
      (project as any).gallery_images ||
      [];
    const fallbackImage =
      (project as any).image_url ||
      gallery[0] ||
      'https://static.wordai.pro/ai-generated-images/wynmotion/sample_menu.jpg';

    rawScenes = [
      {
        scene_id: 'scene_1',
        scene_number: 1,
        title: project.title || 'CapCut Ads Reel',
        visual_concept: project.prompt || project.title,
        start_frame: 0,
        duration_frames: Math.round((project.duration_sec || 22.0) * 30),
        duration_sec: project.duration_sec || 22.0,
        visual_style: project.visual_style,
        template_type: project.visual_style,
        gallery_images: gallery.length > 0 ? gallery : [fallbackImage],
        image_url: fallbackImage,
        headline_solid: (project as any).headline_solid || (project as any).hook_text || 'BEST MENU',
        headline_outline: (project as any).headline_outline || 'CHOICE',
        sub_headline: (project as any).sub_headline || (project as any).slogan_text || '⚡ ĐÓN ĐẦU XU HƯỚNG - ƯU ĐÃI HÔM NAY',
        cta_text: (project as any).cta_text || 'ORDER NOW',
        accent_color: '#FF7A00',
      },
    ];
  }

  const scenes = rawScenes;
  const totalDuration = project.duration_sec || scenes.reduce((acc: number, s: any) => acc + getSceneDuration(s), 0) || 10;
  const initialFrames = Math.round(totalDuration * 30);

  return (
    <RemotionPlayerProvider
      fps={30}
      durationInFrames={initialFrames}
      audioSrc={project.audio_url || ''}
      bgmAudioSrc={(project as any).bgm_url || null}
      initialBgmVolume={(project as any).bgm_volume ?? 0.3}
      initialBgColor={project.bg_color || '#FAF7EF'}
      initialAspectRatio={((project.aspect_ratio as any) || '16:9') as any}
    >
      <StudioInner project={project} initialScenes={scenes} onBack={onBack} />
    </RemotionPlayerProvider>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function BottomSheetOverlay({
  children,
  isDark,
  onClose,
}: {
  children: React.ReactNode;
  isDark: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end pointer-events-auto"
      style={{
        transform: 'translateZ(999px)',
        WebkitTransform: 'translateZ(999px)',
      }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div
        className={`relative z-[10000] w-full rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom-full duration-200 pb-[calc(max(env(safe-area-inset-bottom,0px),16px)+1rem)] max-h-[85vh] overflow-y-auto shadow-2xl ${
          isDark ? 'bg-[#101422] border-t border-slate-700' : 'bg-white border-t border-slate-200 shadow-2xl'
        }`}
        style={{
          transform: 'translateZ(1000px)',
          WebkitTransform: 'translateZ(1000px)',
        }}
      >
        <div className="w-12 h-1.5 rounded-full bg-slate-600/50 mx-auto -mt-1 mb-2" />
        {children}
      </div>
    </div>
  );
}

function SheetHeader({
  title,
  subtitle,
  isDark,
  onClose,
}: {
  title: string;
  subtitle?: string;
  isDark: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
      <div>
        <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className={`p-2 rounded-2xl transition-all ${
          isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'
        }`}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
