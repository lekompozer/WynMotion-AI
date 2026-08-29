'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Palette,
  Maximize2,
  Layers,
  FileText,
  Music,
  Download,
  Loader2,
  FastForward,
  Rewind,
  Scissors,
  CheckCircle2,
  Radio,
  Mic,
  Send,
  Plus,
  Folder,
  Sliders,
  Search,
  ChevronDown,
  ChevronUp,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Upload,
  Settings,
  X,
  Edit3,
  History,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Image as ImageIcon,
  Type,
  Trash2,
  Sparkle,
  Clock,
  ArrowLeft,
  LayoutTemplate,
} from 'lucide-react';
import { RemotionPlayerProvider, useRemotion } from './RemotionEngine';
import { DynamicAnimationComposition } from './DynamicAnimationComposition';
import { DynamicSceneData } from './DynamicSceneRenderer';
import { TemplatesFlyoutTab } from './flyouts/TemplatesFlyoutTab';
import { CaptionsFlyoutTab } from './flyouts/CaptionsFlyoutTab';
import { EffectsFlyoutTab } from './flyouts/EffectsFlyoutTab';
import { MultiTrackTimelineSlider } from './MultiTrackTimelineSlider';
import { TimelineTrack, TimelineItem } from '../../../packages/timeline-core/types';
import { CaptionSegment, CaptionPresetStyle } from './subtitles/CapCutCaptionRenderer';
import { CustomTimelineEffect } from './styles/ActiveEffectsOverlay';
import { snapToGrid } from '../../../packages/timeline-core/math_timeline';
import { wordaiAuth } from '@/lib/wordai-firebase';
import { wynmotionService, MotionProject } from '@/services/wynmotionService';

const API_BASE = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'https://ai.wordai.pro';

const DEFAULT_FALLBACK_SCENES: DynamicSceneData[] = [
  {
    scene_id: 1,
    title: 'Cơn sóng bùng nổ Generative AI',
    start_sec: 0.0,
    end_sec: 6.72,
    start_frame: 0,
    duration_frames: 202,
    summary_text: 'Generative AI bùng nổ mạnh mẽ, mở ra làn sóng sáng tạo mới.',
    voice_transcript: 'Vì sao Generative AI lại tạo ra một làn sóng bùng nổ mạnh mẽ đến vậy?',
    highlight_keywords: ['Làn sóng bùng nổ', 'Mạnh mẽ', 'Generative AI'],
  },
  {
    scene_id: 2,
    title: 'Chuyển dịch sang Generative AI',
    start_sec: 6.72,
    end_sec: 14.74,
    start_frame: 202,
    duration_frames: 240,
    summary_text: 'Sự chuyển dịch từ AI phân loại (Discriminative) sang AI tạo sinh (Generative).',
    voice_transcript: 'Đó là nhờ sự chuyển dịch từ Discriminative AI sang Generative AI.',
    highlight_keywords: ['Chuyển dịch', 'AI phân loại', 'AI tạo sinh'],
  },
  {
    scene_id: 3,
    title: 'Trước đây: Lọc & Phân loại dữ liệu',
    start_sec: 14.74,
    end_sec: 23.64,
    start_frame: 442,
    duration_frames: 267,
    summary_text: 'Trước đây AI chủ yếu đóng vai trò phân loại email rác hoặc ảnh mèo.',
    voice_transcript: "Trước đây: AI chủ yếu đóng vai trò phân loại hoặc lọc dữ liệu (Email rác hay ảnh con mèo).",
    highlight_keywords: ['Phân loại', 'Email rác', 'Ảnh con mèo'],
  },
  {
    scene_id: 4,
    title: 'Hiện nay: Người sáng tạo nội dung',
    start_sec: 23.64,
    end_sec: 34.62,
    start_frame: 709,
    duration_frames: 330,
    summary_text: 'Hiện nay AI trực tiếp viết email từ chối khách hàng lịch sự và giữ quan hệ.',
    voice_transcript: "Hiện nay: Bạn có thể yêu cầu 'Hãy viết cho tôi một email từ chối khách hàng thật lịch sự'.",
    highlight_keywords: ['Người sáng tạo', 'Email từ chối lịch sự', 'Quan hệ tốt'],
  },
  {
    scene_id: 5,
    title: 'Người đồng hành sáng tạo tương lai',
    start_sec: 34.62,
    end_sec: 44.62,
    start_frame: 1039,
    duration_frames: 299,
    summary_text: 'Biến AI thành người đồng hành sáng tạo (Creative Partner) trong công việc hàng ngày.',
    voice_transcript: 'Sự thay đổi này biến AI từ công cụ thụ động trở thành người đồng hành sáng tạo.',
    highlight_keywords: ['Công cụ thụ động', 'Creative Partner', 'Hàng ngày'],
  },
];

const BG_THEMES = [
  { label: 'Paper Cream', color: '#FAF7EF' },
  { label: 'Pure White', color: '#FFFFFF' },
  { label: 'Warm Yellow', color: '#FFFBEB' },
  { label: 'Slate Mist', color: '#F1F5F9' },
  { label: 'Dark Navy', color: '#0F172A' },
  { label: 'Midnight Black', color: '#090A0F' },
];

const LANGUAGE_LABELS: Record<string, { label: string; flag: string }> = {
  vi: { label: 'Tiếng Việt', flag: '🇻🇳' },
  en: { label: 'English (US/UK)', flag: '🇺🇸' },
  ja: { label: 'Tiếng Nhật (日本語)', flag: '🇯🇵' },
  ko: { label: 'Tiếng Hàn (한국어)', flag: '🇰🇷' },
  zh: { label: 'Tiếng Trung (中文)', flag: '🇨🇳' },
  es: { label: 'Tiếng Tây Ban Nha', flag: '🇪🇸' },
  fr: { label: 'Tiếng Pháp', flag: '🇫🇷' },
  de: { label: 'Tiếng Đức', flag: '🇩🇪' },
};

export interface AvailableAudioTrack {
  id: string;
  langCode: string;
  label: string;
  flag: string;
  url: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `${mins}:${parseFloat(secs) < 10 ? '0' : ''}${secs}`;
}

// ─────────────────────────────────────────────────────────────
// REALISTIC MINI SCENE THUMBNAIL RENDERER
// ─────────────────────────────────────────────────────────────
function SceneMiniThumbnail({ scene, className = 'w-full h-full' }: { scene: DynamicSceneData; className?: string }) {
  if (scene.image_url) {
    return (
      <img
        src={scene.image_url}
        alt={scene.title}
        className={`${className} object-cover rounded`}
      />
    );
  }

  return (
    <div className={`${className} bg-slate-100 flex flex-col items-center justify-center text-slate-700 font-bold text-[10px] p-1 text-center truncate`}>
      <span className="text-xs mb-0.5">🎨</span>
      <span className="truncate w-full">{scene.title || `Scene ${scene.scene_id}`}</span>
    </div>
  );
}

function StudioInner({
  slideId,
  moduleId,
  slideIndex = 0,
  projectId,
  projectData,
  initialStyle = 'handdrawn_fast_doodle',
  initialScenes = DEFAULT_FALLBACK_SCENES,
  audioUrl,
  onBack,
}: {
  slideId?: string;
  moduleId?: string;
  slideIndex?: number;
  projectId?: string;
  projectData?: any;
  initialStyle?: string;
  initialScenes?: DynamicSceneData[];
  audioUrl?: string;
  onBack?: () => void;
}) {
  const {
    frame,
    fps,
    durationInFrames,
    isPlaying,
    play,
    pause,
    togglePlay,
    seekTo,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    aspectRatio,
    setAspectRatio,
    bgColor,
    setBgColor,
    audioSrc: remotionAudioSrc,
    setAudioSrc,
    setDurationInFrames,
  } = useRemotion();

  const [visualStyle, setVisualStyle] = useState<string>(initialStyle || projectData?.visual_style || 'product_ads_motion');

  const effectiveInitialScenes: DynamicSceneData[] = useMemo(() => {
    if (projectData?.scenes && projectData.scenes.length > 0) {
      return projectData.scenes;
    }
    if (initialScenes && initialScenes.length > 0 && initialScenes !== DEFAULT_FALLBACK_SCENES) {
      return initialScenes;
    }
    const currStyle = projectData?.visual_style || initialStyle;
    if (currStyle === 'product_ads_motion' || currStyle === 'ads_strobe_teaser' || currStyle === 'ads_cinematic_showcase') {
      const pImages = projectData?.product_images || [];
      const defaultImg = pImages[0] || 'https://static.wordai.pro/ai-generated-images/wynmotion/11ca09714987_templates/cinematic_showcase_cover.png';
      return [
        {
          scene_id: 1,
          title: projectData?.title || 'Product Commercial Ad',
          start_sec: 0.0,
          end_sec: 15.0,
          start_frame: 0,
          duration_frames: 450,
          image_url: defaultImg,
          original_image_url: defaultImg,
          visual_style: 'product_ads_motion',
          shader_name: 'GlitchMemories',
          headline: projectData?.hook_text || 'SIÊU PHẨM MỚI',
          category: projectData?.price_text || 'ƯU ĐÃI',
          cta_text: projectData?.cta_text || 'MUA NGAY',
        } as any,
      ];
    }
    return DEFAULT_FALLBACK_SCENES;
  }, [projectData, initialScenes, initialStyle]);

  const [scenes, setScenes] = useState<DynamicSceneData[]>(effectiveInitialScenes);
  const [sceneHistory, setSceneHistory] = useState<DynamicSceneData[][]>([effectiveInitialScenes]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  useEffect(() => {
    if (projectData?.visual_style) {
      setVisualStyle(projectData.visual_style);
    } else if (initialStyle) {
      setVisualStyle(initialStyle);
    }
  }, [projectData?.visual_style, initialStyle]);

  useEffect(() => {
    if (effectiveInitialScenes && effectiveInitialScenes.length > 0) {
      setScenes(effectiveInitialScenes);
      setSceneHistory([effectiveInitialScenes]);
      setHistoryIndex(0);
    }
  }, [effectiveInitialScenes]);

  useEffect(() => {
    if (audioUrl) {
      setSelectedExportAudioUrl(audioUrl);
      setAudioSrc?.(audioUrl);
    }
  }, [audioUrl, setAudioSrc]);

  const [activeSceneId, setActiveSceneId] = useState<string | number>(1);
  const [activeFlyoutTab, setActiveFlyoutTab] = useState<'assets' | 'audio' | 'settings' | 'effects' | 'captions' | null>('assets');
  const [assetCategory, setAssetCategory] = useState<string>('All');
  const [searchAssetQuery, setSearchAssetQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState('');
  const [exportElapsedSec, setExportElapsedSec] = useState<number>(0);
  const [bgmVolume, setBgmVolume] = useState(0.4);
  const [customBgmFile, setCustomBgmFile] = useState<string | null>(null);
  const [availableAudioTracks, setAvailableAudioTracks] = useState<AvailableAudioTrack[]>([]);
  const [selectedExportAudioUrl, setSelectedExportAudioUrl] = useState<string>(audioUrl || '');

  // Auto-Captions Whisper & CapCut Subtitle State
  const [captionSegments, setCaptionSegments] = useState<CaptionSegment[]>([]);
  const [captionPresetStyle, setCaptionPresetStyle] = useState<CaptionPresetStyle>('karaoke_glow');
  const [isTranscribingCaptions, setIsTranscribingCaptions] = useState(false);
  const [timelineEffects, setTimelineEffects] = useState<CustomTimelineEffect[]>([]);
  const [selectedTimelineItemId, setSelectedTimelineItemId] = useState<string | null>(null);

  const handleDeleteItem = (itemId: string) => {
    if (itemId.startsWith('media_')) {
      const sId = parseInt(itemId.replace('media_', ''), 10);
      setScenes((prev) => {
        if (prev.length <= 1) {
          alert('Video cần có tối thiểu 1 phân cảnh.');
          return prev;
        }
        return prev.filter((s, idx) => s.scene_id !== sId && idx + 1 !== sId);
      });
      setSelectedTimelineItemId(null);
      setSyncStatusMsg('Đã xóa phân cảnh khỏi Timeline!');
      setTimeout(() => setSyncStatusMsg(null), 2500);
      return;
    }

    if (itemId.startsWith('fx_')) {
      setTimelineEffects((prev) => prev.filter((fx) => fx.id !== itemId));
      setSelectedTimelineItemId(null);
      setSyncStatusMsg('Đã xóa hiệu ứng khỏi Timeline!');
      setTimeout(() => setSyncStatusMsg(null), 2500);
      return;
    }

    if (itemId.startsWith('cap_')) {
      const capIdx = parseInt(itemId.replace('cap_', ''), 10);
      setCaptionSegments((prev) => prev.filter((_, idx) => idx !== capIdx));
      setSelectedTimelineItemId(null);
      setSyncStatusMsg('Đã xóa đoạn phụ đề!');
      setTimeout(() => setSyncStatusMsg(null), 2500);
    }
  };

  const handleTranscribeCaptions = async (targetAudioUrl: string, language: string) => {
    try {
      setIsTranscribingCaptions(true);
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
        setCaptionSegments(data.segments);
        setShowWhisperSubs(true);
      }
    } catch (err: any) {
      console.error('Whisper caption error:', err);
      alert(err.message || 'Không thể tạo phụ đề lúc này');
    } finally {
      setIsTranscribingCaptions(false);
    }
  };
  const [selectedExportAspectRatio, setSelectedExportAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [selectedExportBgColor, setSelectedExportBgColor] = useState<string>('#FAF7EF');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [previewPlayingAudioId, setPreviewPlayingAudioId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Active audio selector & sync timeline state
  const [showAudioDropdown, setShowAudioDropdown] = useState(false);
  const [isSyncingTimeline, setIsSyncingTimeline] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [activeAudioLang, setActiveAudioLang] = useState<string>('vi');

  // 2-Layer Text Controls
  const [showSceneCards, setShowSceneCards] = useState<boolean>(true);
  const [showWhisperSubs, setShowWhisperSubs] = useState<boolean>(true);
  const [cardPosY, setCardPosY] = useState<'top' | 'middle' | 'bottom'>('middle');
  const [subsPosY, setSubsPosY] = useState<'top' | 'middle' | 'bottom'>('bottom');

  // Timer counting seconds while export is active (Max 10 mins)
  useEffect(() => {
    let timer: any = null;
    if (isExporting) {
      setExportElapsedSec(0);
      timer = setInterval(() => {
        setExportElapsedSec((prev) => prev + 1);
      }, 1000);
    } else {
      setExportElapsedSec(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isExporting]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [moduleSlidesList, setModuleSlidesList] = useState<{ index: number; title: string; hasAnimation: boolean }[]>([]);
  const [isLoadingSlide, setIsLoadingSlide] = useState(false);

  const [showAspectDropdown, setShowAspectDropdown] = useState(false);

  // Zoom control state for main canvas
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Custom User Uploaded Images
  const [uploadedImages, setUploadedImages] = useState<{ id: string; name: string; url: string }[]>([]);

  // Regenerate Scene Modal State
  const [sceneToRegenerate, setSceneToRegenerate] = useState<DynamicSceneData | null>(null);
  const [regeneratePrompt, setRegeneratePrompt] = useState<string>('');
  const [isRegeneratingScene, setIsRegeneratingScene] = useState<boolean>(false);

  const timelineRef = useRef<HTMLDivElement | null>(null);

  // Toggle audio preview in modal/flyout
  const toggleAudioPreview = (track: AvailableAudioTrack) => {
    if (previewPlayingAudioId === track.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      setPreviewPlayingAudioId(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const audio = new Audio(track.url);
      previewAudioRef.current = audio;
      setPreviewPlayingAudioId(track.id);
      audio.play().catch(() => setPreviewPlayingAudioId(null));
      audio.onended = () => {
        setPreviewPlayingAudioId(null);
        previewAudioRef.current = null;
      };
    }
  };

  // Push new state to undo/redo history
  const updateScenesWithHistory = useCallback((newScenes: DynamicSceneData[]) => {
    setScenes(newScenes);
    setSceneHistory((prev) => [...prev.slice(0, historyIndex + 1), newScenes]);
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setScenes(sceneHistory[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < sceneHistory.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setScenes(sceneHistory[historyIndex + 1]);
    }
  };

  // Switch active audio track and synchronize animation timeline
  const handleSelectAndSyncAudio = async (track: AvailableAudioTrack, autoSyncTimeline: boolean = true) => {
    try {
      setSelectedExportAudioUrl(track.url);
      setActiveAudioLang(track.langCode);
      if (setAudioSrc) setAudioSrc(track.url);
      setShowAudioDropdown(false);

      if (!autoSyncTimeline) return;

      setIsSyncingTimeline(true);
      setSyncStatusMsg(`Đang đồng bộ timeline animation theo ${track.label}...`);

      // 1. Check if backend API sync is available
      if (moduleId) {
        try {
          const res = await fetch(`${API_BASE}/api/slides/animate/sync-language-timeline`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              module_id: moduleId,
              slide_index: slideIndex,
              target_language: track.langCode === 'default' ? 'en' : track.langCode,
              base_language: 'en',
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.scenes && data.scenes.length > 0) {
              const updatedScenes: DynamicSceneData[] = data.scenes.map((s: any, idx: number) => {
                const baseScene = scenes[idx] || scenes[0];
                return {
                  ...baseScene,
                  ...s,
                  scene_id: s.scene_id || idx + 1,
                  start_sec: s.start_sec,
                  end_sec: s.end_sec,
                  duration_frames: s.duration_frames || Math.round((s.end_sec - s.start_sec) * fps),
                  summary_text: s.summary_text || s.voice_transcript || baseScene.summary_text,
                  voice_transcript: s.voice_transcript || s.summary_text || baseScene.voice_transcript,
                };
              });
              updateScenesWithHistory(updatedScenes);
              const calculatedFrames = updatedScenes.reduce((acc, sc) => acc + (sc.duration_frames || 150), 0);
              if (setDurationInFrames) setDurationInFrames(calculatedFrames);
              seekTo(0);
              setSyncStatusMsg(`✅ Đã đồng bộ hoàn hảo timeline theo ${track.label}!`);
              setTimeout(() => setSyncStatusMsg(null), 4000);
              setIsSyncingTimeline(false);
              return;
            }
          }
        } catch (apiErr) {
          console.warn('API sync failed, falling back to instant client-side scaling:', apiErr);
        }
      }

      // 2. Client-side Smart Proportional Scaling Fallback
      const tempAudio = new Audio(track.url);
      tempAudio.addEventListener('loadedmetadata', () => {
        const audioDur = tempAudio.duration;
          const baseDur = scenes.reduce((acc, sc) => {
            const sEnd = typeof sc.end_sec === 'number' ? sc.end_sec : ((sc.duration_frames || 150) / fps);
            const sStart = typeof sc.start_sec === 'number' ? sc.start_sec : 0;
            return acc + Math.max(0.5, sEnd - sStart);
          }, 0) || 10.0;
          const scale = audioDur / baseDur;
          let curSec = 0.0;
          let curFrame = 0;
          const scaledScenes: DynamicSceneData[] = scenes.map((sc, idx) => {
            const sEnd = typeof sc.end_sec === 'number' ? sc.end_sec : ((sc.duration_frames || 150) / fps);
            const sStart = typeof sc.start_sec === 'number' ? sc.start_sec : 0;
            const rawDur = Math.max(0.5, sEnd - sStart);
            const scaledDur = rawDur * scale;
            const scFrames = Math.round(scaledDur * fps);
            const start_sec = Number(curSec.toFixed(2));
            const end_sec = idx === scenes.length - 1 ? Number(audioDur.toFixed(2)) : Number((curSec + scaledDur).toFixed(2));
            const duration_frames = idx === scenes.length - 1 ? Math.round(audioDur * fps) - curFrame : scFrames;
            curSec += scaledDur;
            curFrame += duration_frames;
            return {
              ...sc,
              start_sec,
              end_sec,
              start_frame: curFrame - duration_frames,
              duration_frames,
            };
          });
          updateScenesWithHistory(scaledScenes);
          if (setDurationInFrames) setDurationInFrames(Math.round(audioDur * fps));
          seekTo(0);
          setSyncStatusMsg(`✅ Đã đồng bộ timeline theo ${track.label} (${audioDur.toFixed(1)}s)!`);
          setTimeout(() => setSyncStatusMsg(null), 4000);
          setIsSyncingTimeline(false);
      });
    } catch (err: any) {
      console.error('Error syncing audio timeline:', err);
      setSyncStatusMsg('❌ Không thể đồng bộ timeline. Vui lòng thử lại.');
      setTimeout(() => setSyncStatusMsg(null), 4000);
      setIsSyncingTimeline(false);
    }
  };

  // Synchronize internal scenes whenever parent initialScenes updates
  useEffect(() => {
    if (initialScenes && initialScenes.length > 0) {
      setScenes(initialScenes);
      setSceneHistory([initialScenes]);
      setHistoryIndex(0);
      setActiveSceneId(initialScenes[0]?.scene_id ?? 1);
    }
  }, [initialScenes]);

  // 1. Fetch dynamic animation data for this specific slide and module
  useEffect(() => {
    if (!moduleId) return;

    let isMounted = true;
    const loadSlideData = async () => {
      try {
        setIsLoadingSlide(true);
        const res = await fetch(`${API_BASE}/api/slides/animate/module/${moduleId}/slide/${slideIndex}`);
        if (!res.ok) return;

        const result = await res.json();
        if (result.success && result.data && isMounted) {
          const doc = result.data;
          if (doc.scenes && doc.scenes.length > 0) {
            setScenes(doc.scenes);
            setSceneHistory([doc.scenes]);
            setHistoryIndex(0);
            setActiveSceneId(doc.scenes[0].scene_id || 1);
          }
          if (doc.visual_style) setVisualStyle(doc.visual_style);
          if (doc.aspect_ratio) setAspectRatio(doc.aspect_ratio as any);
          if (doc.bg_color) setBgColor(doc.bg_color);
        }
      } catch (err) {
        console.warn('Could not fetch slide animation from API:', err);
      } finally {
        if (isMounted) setIsLoadingSlide(false);
      }
    };

    loadSlideData();

    // 2. Fetch list of all slides in module for History navigation and audio tracks extraction
    const loadModuleSlides = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/studyhub/modules/${moduleId}`);
        if (!res.ok) return;
        const mod = await res.json();
        if (mod && mod.slides && isMounted) {
          const list = mod.slides.map((s: any, idx: number) => ({
            index: idx,
            title: s.title || s.speaker_text?.en?.slice(0, 35) || s.speaker_text?.vi?.slice(0, 35) || `Slide ${idx + 1}`,
            hasAnimation: !!s.animation,
          }));
          setModuleSlidesList(list);

          const curSlide = mod.slides[slideIndex];
          if (curSlide) {
            const tracks: AvailableAudioTrack[] = [];
            if (curSlide.audio_urls && typeof curSlide.audio_urls === 'object') {
              Object.entries(curSlide.audio_urls).forEach(([lang, url]) => {
                if (url && typeof url === 'string') {
                  const meta = LANGUAGE_LABELS[lang] || { label: `Ngôn ngữ ${lang.toUpperCase()}`, flag: '🌐' };
                  tracks.push({
                    id: `lang_${lang}`,
                    langCode: lang,
                    label: meta.label,
                    flag: meta.flag,
                    url: url,
                  });
                }
              });
            }

            if (curSlide.audio_url && typeof curSlide.audio_url === 'string' && !tracks.some((t) => t.url === curSlide.audio_url)) {
              tracks.push({
                id: 'default_audio_url',
                langCode: 'default',
                label: 'Audio Gốc (Mặc định)',
                flag: '🎧',
                url: curSlide.audio_url,
              });
            }

            if (audioUrl && !tracks.some((t) => t.url === audioUrl)) {
              tracks.push({
                id: 'current_audio_src',
                langCode: 'current',
                label: 'Audio Hiện Tại (Active)',
                flag: '⚡',
                url: audioUrl,
              });
            }

            if (tracks.length === 0 && audioUrl) {
              tracks.push({
                id: 'active_audio',
                langCode: 'vi',
                label: 'Tiếng Việt (Mặc định)',
                flag: '🇻🇳',
                url: audioUrl,
              });
            }

            setAvailableAudioTracks(tracks);
            if (tracks.length > 0) {
              setSelectedExportAudioUrl(tracks[0].url);
            }
          }
        }
      } catch (e) {
        if (isMounted) {
          setModuleSlidesList(
            Array.from({ length: 8 }).map((_, i) => ({
              index: i,
              title: `Slide ${i + 1}`,
              hasAnimation: i === slideIndex,
            }))
          );
        }
      }
    };

    loadModuleSlides();

    return () => {
      isMounted = false;
    };
  }, [moduleId, slideIndex, setBgColor, setAspectRatio]);

  // Auto-track active scene based on current frame
  useEffect(() => {
    const found = scenes.find(
      (s) => frame >= (s.start_frame || 0) && frame < (s.start_frame || 0) + (s.duration_frames || 150)
    );
    if (found && found.scene_id !== activeSceneId) {
      setActiveSceneId(found.scene_id);
    }
  }, [frame, scenes]);

  const activeScene = scenes.find((s) => s.scene_id === activeSceneId) || scenes[0];
  const totalDurationSec = durationInFrames / fps;
  const currentSec = frame / fps;
  const progressPct = (frame / (durationInFrames || 1)) * 100;

  const timelineTracks: TimelineTrack[] = useMemo(() => {
    let accumTime = 0;
    const mediaItems: TimelineItem[] = [];
    const fxItems0: TimelineItem[] = [];
    const fxItems1: TimelineItem[] = [];

    scenes.forEach((s, idx) => {
      const dur = (s.duration_frames || 150) / fps;
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
        thumbnailUrl: s.image_url || s.original_image_url,
      });

      const shaderName = (s as any).shader_name || (s as any).transition_out?.shader_name;
      if (shaderName && !timelineEffects.some((fx) => fx.id === `fx_trans_${s.scene_id || idx + 1}`)) {
        const transDur = (s as any).transition_out?.duration || 0.8;
        fxItems0.push({
          id: `fx_trans_${s.scene_id || idx + 1}`,
          trackId: 'track_fx_0',
          trackType: 'transitions',
          startTime: Math.max(0, et - transDur),
          endTime: et,
          duration: transDur,
          title: `⚡ ${shaderName}`,
          shaderName: shaderName,
        });
      }

      accumTime = et;
    });

    // Populate custom FX items into Track 0 or Track 1
    timelineEffects.forEach((fx) => {
      const item: TimelineItem = {
        id: fx.id,
        trackId: fx.trackIndex === 1 ? 'track_fx_1' : 'track_fx_0',
        trackType: 'transitions',
        startTime: fx.startTime,
        endTime: fx.endTime,
        duration: fx.duration,
        title: `✨ ${fx.name || fx.effectId}`,
        shaderName: fx.shaderName || fx.effectId,
      };
      if (fx.trackIndex === 1) {
        fxItems1.push(item);
      } else {
        fxItems0.push(item);
      }
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

    const audioItems: TimelineItem[] = [
      {
        id: 'bgm_main',
        trackId: 'track_audio',
        trackType: 'audio',
        startTime: 0,
        endTime: totalDurationSec,
        duration: totalDurationSec,
        title: '🎵 BGM & Voiceover Audio',
      },
    ];

    const tracksList: TimelineTrack[] = [
      { id: 'track_media', type: 'video', name: 'Media Scenes', items: mediaItems },
      { id: 'track_fx_0', type: 'transitions', name: 'FX Shaders 1', items: fxItems0 },
    ];

    if (fxItems1.length > 0) {
      tracksList.push({ id: 'track_fx_1', type: 'transitions', name: 'FX Shaders 2 (Hàng dưới)', items: fxItems1 });
    }

    tracksList.push(
      { id: 'track_captions', type: 'captions', name: 'Auto Captions', items: captionItems },
      { id: 'track_audio', type: 'audio', name: 'Audio Track', items: audioItems }
    );

    return tracksList;
  }, [scenes, fps, totalDurationSec, captionSegments, timelineEffects]);

  // Handle click or drag on timeline scrubber
  const handleTimelineScrub = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const targetPct = clickX / rect.width;
      const targetFrame = Math.round(targetPct * durationInFrames);
      seekTo(targetFrame);
    },
    [durationInFrames, seekTo]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleTimelineScrub(e);
    const onMouseMove = (moveEvent: MouseEvent) => handleTimelineScrub(moveEvent);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleSceneClick = (scene: DynamicSceneData) => {
    setActiveSceneId(scene.scene_id);
    seekTo(scene.start_frame ?? 0);
  };

  // CapCut Split Tool (✂️)
  const handleSplitClipAtPlayhead = () => {
    const targetIdx = scenes.findIndex(
      (s) => frame > (s.start_frame || 0) && frame < (s.start_frame || 0) + (s.duration_frames || 150)
    );

    if (targetIdx === -1) return;

    const currentScene = scenes[targetIdx];
    const splitFrameOffset = frame - (currentScene.start_frame || 0);
    const remainingFrames = (currentScene.duration_frames || 150) - splitFrameOffset;

    if (splitFrameOffset < 15 || remainingFrames < 15) return;

    const scenePart1: DynamicSceneData = {
      ...currentScene,
      duration_frames: splitFrameOffset,
      end_sec: parseFloat((((currentScene.start_frame ?? 0) + splitFrameOffset) / fps).toFixed(2)),
    };

    const scenePart2: DynamicSceneData = {
      ...currentScene,
      scene_id: scenes.length + 1,
      title: `${currentScene.title} (Phần 2)`,
      start_frame: frame,
      duration_frames: remainingFrames,
      start_sec: parseFloat((frame / fps).toFixed(2)),
      end_sec: currentScene.end_sec,
    };

    const newScenes = [...scenes.slice(0, targetIdx), scenePart1, scenePart2, ...scenes.slice(targetIdx + 1)];
    updateScenesWithHistory(newScenes);
  };

  // Trim Scene Handle
  const handleTrimScene = (sceneId: string | number, deltaSec: number) => {
    const newScenes = scenes.map((s) => {
      if (s.scene_id === sceneId) {
        const newDuration = Math.max(30, (s.duration_frames || 150) + Math.round(deltaSec * fps));
        return {
          ...s,
          duration_frames: newDuration,
          end_sec: parseFloat((((s.start_frame ?? 0) + newDuration) / fps).toFixed(2)),
        };
      }
      return s;
    });
    updateScenesWithHistory(newScenes);
  };

  const handleOpenRegenerateModal = (scene: DynamicSceneData) => {
    setSceneToRegenerate(scene);
    setRegeneratePrompt((scene as any).visual_concept || '');
  };

  const handleRegenerateSceneSubmit = async () => {
    if (!sceneToRegenerate || !moduleId) return;

    try {
      setIsRegeneratingScene(true);
      const res = await fetch(`${API_BASE}/api/slides/animate/regenerate-scene`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: moduleId,
          slide_index: slideIndex,
          scene_id: sceneToRegenerate.scene_id,
          user_prompt: regeneratePrompt.trim() || undefined,
          visual_style: visualStyle,
          bg_color: bgColor,
        }),
      });

      if (!res.ok) {
        throw new Error('Không thể tạo lại Scene');
      }

      const result = await res.json();
      if (result.success && result.scenes) {
        updateScenesWithHistory(result.scenes);
        setSceneToRegenerate(null);
        alert(`Scene ${sceneToRegenerate.scene_id} đã được tạo lại thành công!`);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo lại Scene');
    } finally {
      setIsRegeneratingScene(false);
    }
  };

  // Handle Custom Image Upload
  const handleUploadImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setUploadedImages((prev) => [...prev, { id: `${Date.now()}`, name: file.name, url }]);
    };
    reader.readAsDataURL(file);
  };

  // Download Video: Render via Backend Docker Service (100% Reliable, Proper MP4 Muxing, Font & Layout)
  const handleDownloadVideoMP4 = async (
    targetAudioUrl?: string,
    targetAspectRatio?: string,
    targetBgColor?: string
  ) => {
    try {
      setShowExportModal(false);
      setIsExporting(true);
      setExportProgress(10);
      setExportStatusText('Initializing 1080p animation render...');

      pause();

      const user = wordaiAuth?.currentUser;
      const token = user ? await user.getIdToken() : null;

      const chosenAudio = targetAudioUrl !== undefined ? targetAudioUrl : (selectedExportAudioUrl || audioUrl);
      const chosenAspect = targetAspectRatio || aspectRatio;
      const chosenBg = targetBgColor || bgColor || '#FAF7EF';

      // Step 1: Trigger backend export MP4 job
      let jobId: string | null = null;
      if (projectId) {
        const expRes = await (wynmotionService as any).exportMP4(projectId, scenes, {
          aspect_ratio: chosenAspect,
          show_scene_cards: showSceneCards,
          show_whisper_subs: showWhisperSubs,
          force_rerender: true,
        });
        jobId = expRes.job_id;
      } else {
        const res = await fetch(`${API_BASE}/api/slides/animate/export-mp4`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            module_id: moduleId,
            slide_index: slideIndex,
            aspect_ratio: chosenAspect,
            bg_color: chosenBg,
            audio_url: chosenAudio || undefined,
            language_code: 'vi',
          }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.detail || 'Could not start video export on server');
        }

        const data = await res.json();
        jobId = data.job_id;
      }

      if (!jobId) throw new Error('No task ID received from server');

      // Step 2: Poll export job status (Max 10 minutes)
      const maxPolls = 200;
      for (let i = 0; i < maxPolls; i++) {
        await new Promise((r) => setTimeout(r, 3000));

        let statusData: any = null;
        if (projectId) {
          try {
            statusData = await (wynmotionService as any).pollExportStatus(jobId);
          } catch (pollErr) {
            continue;
          }
        } else {
          const statusRes = await fetch(`${API_BASE}/api/slides/animate/export-mp4/status/${jobId}`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          });
          if (statusRes.ok) {
            statusData = await statusRes.json();
          }
        }

        if (!statusData) continue;

        const prog = Math.min(95, Math.max(15, statusData.progress || 15 + i * 2));
        setExportProgress(prog);
        setExportStatusText(statusData.message || `Rendering video... (${prog}%)`);

        if (statusData.status === 'completed' && statusData.mp4_url) {
          setExportProgress(100);
          setExportStatusText('Completed! Downloading your MP4 video...');

          const mp4Url = statusData.mp4_url;
          const fileName = statusData.filename || (projectId ? `WynMotion_${projectId.slice(0, 8)}.mp4` : `wynrise_slide_${slideIndex + 1}.mp4`);

          try {
            const blobRes = await fetch(mp4Url);
            if (!blobRes.ok) throw new Error('Blob fetch error');
            const blob = await blobRes.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
          } catch {
            const link = document.createElement('a');
            link.href = mp4Url;
            link.setAttribute('download', fileName);
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          return;
        }

        if (statusData.status === 'failed') {
          throw new Error(statusData.message || 'Video rendering error on server');
        }
      }

      throw new Error('Video rendering is taking longer than expected. Please try again.');
    } catch (err: any) {
      console.error('Export MP4 error:', err);
      alert(err.message || 'Error exporting and downloading MP4 video');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };


  const timeMarkers: number[] = [];
  for (let s = 0; s <= totalDurationSec; s += 3.93) {
    timeMarkers.push(s);
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0C0D14] text-slate-200 font-sans select-none overflow-hidden">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP DARK HEADER BAR */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="h-12 border-b border-[#1E2230] bg-[#12141F] flex items-center justify-between px-4 z-20 shadow-md relative">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg bg-[#1E2333] hover:bg-[#282F45] text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
              title="Quay lại Wizard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-[11px] shadow-sm shadow-cyan-500/20">
              W
            </div>
            <span className="text-xs font-black text-white">WynMotion Studio</span>
            <span className="text-xs text-slate-400 truncate max-w-xs font-medium">
              {projectData?.title || activeScene?.title || (slideIndex !== undefined ? `Slide ${slideIndex + 1}` : 'Project')}
            </span>
          </div>
        </div>

        {/* Center: Interactive Aspect Ratio + Audio Language Selector + Sync Timeline */}
        <div className="flex items-center gap-2">
          {/* 1. Aspect Ratio Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAspectDropdown(!showAspectDropdown);
                setShowAudioDropdown(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#1E2333] hover:bg-[#282F45] text-white rounded-lg border border-[#2D354E] shadow-xs transition-all"
            >
              <span>
                {aspectRatio === '16:9' ? '📺 16:9 (Ngang)' : aspectRatio === '9:16' ? '📱 9:16 (Dọc)' : '🔲 1:1 (Vuông)'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showAspectDropdown && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-44 bg-[#161926] rounded-xl border border-[#2A3147] shadow-xl p-1.5 z-50 text-xs">
                <button
                  onClick={() => {
                    setAspectRatio('16:9');
                    setShowAspectDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                    aspectRatio === '16:9' ? 'bg-cyan-500/20 text-cyan-300 font-black' : 'text-slate-300 hover:bg-[#22283A]'
                  }`}
                >
                  <span>📺 16:9 (Ngang)</span>
                  {aspectRatio === '16:9' && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                <button
                  onClick={() => {
                    setAspectRatio('9:16');
                    setShowAspectDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                    aspectRatio === '9:16' ? 'bg-cyan-500/20 text-cyan-300 font-black' : 'text-slate-300 hover:bg-[#22283A]'
                  }`}
                >
                  <span>📱 9:16 (Dọc)</span>
                  {aspectRatio === '9:16' && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                <button
                  onClick={() => {
                    setAspectRatio('1:1');
                    setShowAspectDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                    aspectRatio === '1:1' ? 'bg-cyan-500/20 text-cyan-300 font-black' : 'text-slate-300 hover:bg-[#22283A]'
                  }`}
                >
                  <span>🔲 1:1 (Vuông)</span>
                  {aspectRatio === '1:1' && <Check className="w-3 h-3 text-cyan-400" />}
                </button>
              </div>
            )}
          </div>

          {/* 2. Active Audio / Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAudioDropdown(!showAudioDropdown);
                setShowAspectDropdown(false);
              }}
              title="Chọn ngôn ngữ giọng đọc audio của Slide"
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#1E2333] hover:bg-[#282F45] text-white rounded-lg border border-[#2D354E] shadow-xs transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {availableAudioTracks.find((t) => t.url === (selectedExportAudioUrl || remotionAudioSrc))?.flag || '🎧'}{' '}
                {availableAudioTracks.find((t) => t.url === (selectedExportAudioUrl || remotionAudioSrc))?.label || 'Giọng đọc'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showAudioDropdown && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-64 bg-[#161926] rounded-2xl border border-[#2A3147] shadow-2xl p-2.5 z-50 text-xs text-white animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#252B3E]">
                  <span className="font-black text-cyan-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Chọn Audio Ngôn Ngữ</span>
                  </span>
                  <button onClick={() => setShowAudioDropdown(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5">
                  {availableAudioTracks.map((track) => {
                    const isSelected = (selectedExportAudioUrl || remotionAudioSrc) === track.url;
                    const isPlaying = previewPlayingAudioId === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all border ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-black'
                            : 'bg-[#1D2132] text-slate-300 border-[#282F45] hover:bg-[#252B3E]'
                        }`}
                      >
                        <div
                          className="flex items-center gap-2 truncate cursor-pointer flex-1 mr-1"
                          onClick={() => handleSelectAndSyncAudio(track, false)}
                        >
                          <span className="text-sm">{track.flag}</span>
                          <span className="truncate">{track.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAudioPreview(track);
                            }}
                            className={`p-1 rounded-md transition-all ${
                              isPlaying ? 'bg-cyan-500 text-slate-950 animate-pulse' : 'text-slate-400 hover:text-white'
                            }`}
                            title={isPlaying ? 'Dừng phát' : 'Nghe thử'}
                          >
                            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectAndSyncAudio(track, true)}
                            title="Chọn và đồng bộ timeline theo audio này"
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-[#2A3147] text-slate-300 hover:bg-cyan-500 hover:text-slate-950'
                            }`}
                          >
                            {isSelected ? 'Đang chọn' : 'Dùng'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Sync Timeline Button */}
          <button
            onClick={() => {
              const currentTrack = availableAudioTracks.find((t) => t.url === (selectedExportAudioUrl || remotionAudioSrc)) || availableAudioTracks[0];
              if (currentTrack) {
                handleSelectAndSyncAudio(currentTrack, true);
              }
            }}
            disabled={isSyncingTimeline}
            title="Tự động đồng bộ mốc thời gian các phân cảnh và phụ đề theo Audio đang chọn"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isSyncingTimeline ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Sync Animation</span>
          </button>
        </div>

        {/* Right: History Button, AI Credits & Actions */}
        <div className="flex items-center gap-2.5">
          {/* EXPORT SPINNER & NOTIFICATION */}
          {isExporting && (
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs font-bold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Generating and rendering Remotion MP4 video on server. Please do not close this tab...</span>
            </div>
          )}

          {/* HISTORY BUTTON */}
          <div className="relative">
            <button
              onClick={() => setShowHistoryModal(!showHistoryModal)}
              title="Lịch sử các Slide trong Module"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1E2333] hover:bg-[#282F45] border border-[#2D354E] text-slate-200 text-xs font-bold transition-all"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>History (Slide {slideIndex + 1})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* HISTORY DROPDOWN MODAL */}
            {showHistoryModal && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#161926] rounded-2xl border border-[#2A3147] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#252B3E]">
                  <div className="flex items-center gap-1.5 text-xs font-black text-white">
                    <History className="w-4 h-4 text-cyan-400" />
                    <span>Lịch sử Slide trong Module</span>
                  </div>
                  <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {(moduleSlidesList.length > 0
                    ? moduleSlidesList
                    : Array.from({ length: 8 }).map((_, i) => ({
                        index: i,
                        title: `Slide ${i + 1}`,
                        hasAnimation: i === slideIndex,
                      }))
                  ).map((s) => {
                    const isCurrent = s.index === slideIndex;
                    return (
                      <a
                        key={s.index}
                        href={`/app/ai-video-editor/slide_${s.index}?moduleId=${moduleId || ''}&style=${visualStyle}`}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-black'
                            : 'bg-[#1E2333] text-slate-300 hover:bg-[#282F45] border border-[#252B3E]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-full bg-[#2A3147] flex items-center justify-center text-[10px] text-slate-300">
                            {s.index + 1}
                          </span>
                          <span className="truncate max-w-[150px]">{s.title}</span>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* AI CREDIT BADGE */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-black">
            <span>💎 2</span>
          </div>

          {/* DOWNLOAD AS MP4 BUTTON */}
          <button
            onClick={() => {
              setSelectedExportAspectRatio(aspectRatio);
              setSelectedExportBgColor(bgColor || '#FAF7EF');
              setShowExportModal(true);
            }}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Download MP4</span>
          </button>

          <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1E2333]">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN BODY: LEFT CHAT + ICON BAR + FLYOUT DRAWER + CANVAS */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: LEFT CHAT SIDEBAR (WYNRISE AI - DARK) */}
        <div className="w-80 border-r border-[#1E2230] bg-[#10121B] flex flex-col justify-between p-3.5 z-10">
          <div className="space-y-3 overflow-y-auto pr-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WYNRISE AI</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#161926] border border-[#22273B] text-xs text-slate-300 leading-relaxed shadow-sm">
              What would you like to create? Just type your request.
            </div>

            {/* Active Scene Transcript / Subtitle Interactive Editor */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#161B2E] via-[#141829] to-[#0F1322] border border-cyan-500/30 text-white text-xs leading-relaxed shadow-lg shadow-cyan-950/20 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Phụ Đề Phân Cảnh {activeScene ? activeScene.scene_id : 1}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono bg-[#0B0D14] px-1.5 py-0.5 rounded-md border border-[#202538]">
                {activeScene ? `${(activeScene.start_sec ?? 0).toFixed(1)}s - ${(activeScene.end_sec ?? 0).toFixed(1)}s` : ''}
                </span>
              </div>
              <textarea
                value={activeScene?.voice_transcript || activeScene?.summary_text || activeScene?.title || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!activeScene) return;
                  const updated = scenes.map((s) =>
                    s.scene_id === activeScene.scene_id
                      ? { ...s, voice_transcript: val, summary_text: val, title: s.title || val.slice(0, 35) }
                      : s
                  );
                  setScenes(updated);
                }}
                onBlur={() => {
                  if (projectId) {
                    wynmotionService.updateProject(projectId, { scenes: scenes as any }).catch((err) => {
                      console.warn('Could not auto-save edited scenes:', err);
                    });
                  }
                }}
                placeholder="Nhập hoặc chỉnh sửa phụ đề cho phân cảnh này..."
                rows={3}
                className="w-full bg-[#0B0D14]/90 border border-[#23293D] rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 resize-none transition-all leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400 pt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WYNRISE AI</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#161926] border border-[#22273B] text-xs font-bold text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Created new clip (~{Math.round(totalDurationSec)}s) · with voiceover.</span>
            </div>
          </div>

          {/* Bottom Chat Prompt Input */}
          <div className="pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type an edit or create request... (Enter to send)"
                className="w-full pl-3 pr-16 py-2.5 text-xs rounded-xl bg-[#161926] border border-[#252B3E] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:bg-[#1A1E2E] transition-all"
              />
              <div className="absolute right-2 flex items-center gap-1 text-slate-400">
                <button className="p-1 hover:text-white">
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 text-cyan-400 hover:text-cyan-300">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: VERTICAL ICON TOOLBAR (DARK) */}
        <div className="w-12 border-r border-[#1E2230] bg-[#0E1017] flex flex-col items-center py-3 space-y-3 z-10">
          <button
            onClick={() => setActiveFlyoutTab(activeFlyoutTab === 'assets' ? null : 'assets')}
            title="Assets / Scenes (Option+2)"
            className={`p-2 rounded-xl transition-all ${
              activeFlyoutTab === 'assets'
                ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-[#1E2333]'
            }`}
          >
            <Folder className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveFlyoutTab(activeFlyoutTab === 'audio' ? null : 'audio')}
            title="Voice & Music Mixer"
            className={`p-2 rounded-xl transition-all ${
              activeFlyoutTab === 'audio'
                ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-[#1E2333]'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveFlyoutTab(activeFlyoutTab === 'settings' ? null : 'settings')}
            title="Canvas Settings"
            className={`p-2 rounded-xl transition-all ${
              activeFlyoutTab === 'settings'
                ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-[#1E2333]'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveFlyoutTab(activeFlyoutTab === 'effects' ? null : 'effects')}
            title="FX & Transitions (100+ GLSL & Visual Filters)"
            className={`p-2 rounded-xl transition-all ${
              activeFlyoutTab === 'effects'
                ? 'bg-gradient-to-tr from-purple-500 to-pink-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-[#1E2333]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveFlyoutTab(activeFlyoutTab === 'captions' ? null : 'captions')}
            title="Auto-Captions AI (Whisper Phụ Đề)"
            className={`p-2 rounded-xl transition-all ${
              activeFlyoutTab === 'captions'
                ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-[#1E2333]'
            }`}
          >
            <Type className="w-4 h-4" />
          </button>
        </div>

        {/* COLUMN 3: FLYOUT DRAWER (ASSETS / AUDIO MIXER / SETTINGS - DARK) */}
        {activeFlyoutTab && (
          <div className="w-80 border-r border-[#1E2230] bg-[#12141F] flex flex-col p-4 z-10 shadow-lg animate-in slide-in-from-left-4 duration-150 overflow-y-auto">
            {/* TAB 1: ASSETS & SCENES GRID */}
            {activeFlyoutTab === 'assets' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">Assets</h3>
                    <p className="text-[11px] text-slate-400">
                      {scenes.length} Scenes · Slide {slideIndex + 1}
                    </p>
                  </div>
                  <button onClick={() => setActiveFlyoutTab(null)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchAssetQuery}
                    onChange={(e) => setSearchAssetQuery(e.target.value)}
                    placeholder="Search assets"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#181B28] border border-[#252B3E] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Category Pills & Upload Image */}
                <div className="flex flex-wrap gap-1 text-[11px] font-bold">
                  {[
                    'All',
                    `Image ${uploadedImages.length + scenes.filter((s) => s.image_url).length}`,
                    'Audio 1',
                    `Scene ${scenes.length}`,
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setAssetCategory(cat)}
                      className={`px-2 py-0.5 rounded-lg transition-all ${
                        assetCategory === cat
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black'
                          : 'bg-[#1E2333] text-slate-300 hover:bg-[#282F45]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Upload Custom Image Button */}
                <label className="p-2.5 rounded-xl border border-dashed border-[#2F374E] hover:border-cyan-400 bg-[#161926] cursor-pointer flex items-center justify-center gap-2 text-xs text-slate-300 transition-all">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold">+ Upload Ảnh Tùy Biến</span>
                  <input type="file" accept="image/*" onChange={handleUploadImageFile} className="hidden" />
                </label>

                {/* 2-Column Scene Cards Grid with REALISTIC SVG THUMBNAILS */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {scenes.map((s) => {
                    const isActive = s.scene_id === activeSceneId;
                    return (
                      <div
                        key={s.scene_id}
                        onClick={() => handleSceneClick(s)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleOpenRegenerateModal(s);
                        }}
                        className={`rounded-2xl border p-2.5 cursor-pointer flex flex-col justify-between transition-all group ${
                          isActive
                            ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-400/30 shadow-md shadow-cyan-500/10'
                            : 'border-[#22273B] bg-[#161926] hover:border-[#323955]'
                        }`}
                      >
                        {/* Realistic Mini SVG Preview of Scene */}
                        <div className="aspect-video w-full rounded-xl bg-white border border-[#2A3147] flex items-center justify-center p-1 relative overflow-hidden mb-2 shadow-xs">
                          <SceneMiniThumbnail scene={s} />
                          <span className="absolute bottom-1 right-1 text-[8px] font-mono px-1 py-0.2 bg-black/80 text-white rounded">
                            {((s.duration_frames ?? 150) / fps).toFixed(1)}s
                          </span>
                        </div>
                        <h4 className="text-[11px] font-bold text-slate-200 line-clamp-1 mb-1">{s.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] font-black uppercase text-slate-400 bg-[#252B3E] px-1.5 py-0.5 rounded">
                            SCENE {s.scene_id}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRegenerateModal(s);
                            }}
                            title="Tạo lại Scene này bằng AI"
                            className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: AUDIO MIXER */}
            {activeFlyoutTab === 'audio' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white">Audio & Voiceover Tracks</h3>
                  <button onClick={() => setActiveFlyoutTab(null)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Available Slide Voiceovers */}
                {availableAudioTracks.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-[#161926] border border-[#22273B] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Giọng đọc của Slide ({availableAudioTracks.length})</span>
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {availableAudioTracks.map((track) => {
                        const isSelected = selectedExportAudioUrl === track.url;
                        const isPlaying = previewPlayingAudioId === track.id;
                        return (
                          <div
                            key={track.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all border ${
                              isSelected
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-black'
                                : 'bg-[#1D2132] text-slate-300 border-[#282F45] hover:bg-[#252B3E]'
                            }`}
                          >
                            <div
                              className="flex items-center gap-2 truncate cursor-pointer flex-1 mr-2"
                              onClick={() => handleSelectAndSyncAudio(track, false)}
                            >
                              <span className="text-base">{track.flag}</span>
                              <span className="truncate">{track.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAudioPreview(track);
                                }}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isPlaying
                                    ? 'bg-cyan-500 text-slate-950 animate-pulse'
                                    : 'text-slate-400 hover:text-white hover:bg-[#2A3147]'
                                }`}
                                title={isPlaying ? 'Dừng phát' : 'Nghe thử'}
                              >
                                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectAndSyncAudio(track, true)}
                                title="Kích hoạt audio này và đồng bộ animation timeline"
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                  isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-[#2A3147] text-slate-300 hover:bg-cyan-500 hover:text-slate-950'
                                }`}
                              >
                                {isSelected ? 'Đang chọn' : 'Dùng & Sync'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-[#161926] border border-[#22273B] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-teal-400" />
                      <span>Âm lượng Voiceover</span>
                    </span>
                    <span className="font-mono text-[11px] text-teal-400">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-teal-400 h-1.5 bg-[#252B3E] rounded-lg"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#161926] border border-[#22273B] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-orange-400" />
                      <span>Nhạc nền BGM (Music)</span>
                    </span>
                    <span className="font-mono text-[11px] text-orange-400">{Math.round(bgmVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgmVolume}
                    onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                    className="w-full accent-orange-400 h-1.5 bg-[#252B3E] rounded-lg"
                  />
                </div>

                <label className="p-3 rounded-2xl border border-dashed border-[#2F374E] hover:border-orange-500 bg-[#161926] cursor-pointer flex flex-col items-center justify-center gap-1 text-xs text-slate-300 transition-all">
                  <Upload className="w-4 h-4 text-orange-400" />
                  <span className="font-bold">Upload Custom BGM MP3</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCustomBgmFile(file.name);
                    }}
                    className="hidden"
                  />
                </label>
                {customBgmFile && (
                  <p className="text-[11px] text-emerald-400 font-bold">✓ Đã nạp: {customBgmFile}</p>
                )}
              </div>
            )}

            {/* TAB 3: SETTINGS */}
            {activeFlyoutTab === 'settings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white">Canvas Settings</h3>
                  <button onClick={() => setActiveFlyoutTab(null)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">Màu Nền (Background)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {BG_THEMES.map((theme) => (
                      <button
                        key={theme.color}
                        onClick={() => setBgColor(theme.color)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] font-bold transition-all ${
                          bgColor === theme.color
                            ? 'border-orange-500 bg-orange-500/20 text-orange-300 ring-2 ring-orange-500/30'
                            : 'border-[#22273B] bg-[#161926] text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-black/30" style={{ backgroundColor: theme.color }} />
                        <span>{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* LAYER 1: AI SCENE NOTE CARD (WHITE HANDWRITTEN CARD) */}
                <div className="pt-3 border-t border-[#22273B] space-y-2.5 bg-[#141724] p-3 rounded-2xl border border-[#282F45]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
                      <div>
                        <span className="text-xs font-black text-white block">Thẻ Tóm Tắt AI (White Card)</span>
                        <span className="text-[10px] text-slate-400">Khung trắng font viết tay tóm tắt ý chính</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSceneCards((v) => !v)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                        showSceneCards ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {showSceneCards ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{showSceneCards ? 'BẬT' : 'TẮT'}</span>
                    </button>
                  </div>

                  {showSceneCards && (
                    <>
                      <div className="space-y-1 pt-1">
                        <div className="text-[10px] font-bold text-slate-300 flex justify-between">
                          <span>Vị trí Thẻ Trắng:</span>
                          <span className="text-cyan-400 capitalize">{cardPosY}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['top', 'middle', 'bottom'] as const).map((pos) => (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => setCardPosY(pos)}
                              className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                                cardPosY === pos
                                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                                  : 'border-[#22273B] bg-[#161926] text-slate-400'
                              }`}
                            >
                              {pos === 'top' ? 'Trên Cùng' : pos === 'middle' ? 'Ở Giữa' : 'Phía Dưới'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {(() => {
                        const currentScene = scenes.find((s) => s.scene_id === activeSceneId) || scenes[0];
                        const currentIdx = scenes.findIndex((s) => s.scene_id === (currentScene?.scene_id || 1));
                        if (!currentScene) return null;
                        return (
                          <div className="space-y-1 pt-1">
                            <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                              <Edit3 className="w-3 h-3 text-cyan-400" />
                              <span>Sửa Tóm Tắt AI (Scene {currentIdx + 1})</span>
                            </div>
                            <textarea
                              value={currentScene.summary_text || currentScene.voice_transcript || ''}
                              onChange={(e) => {
                                const newScenes = scenes.map((s) =>
                                  s.scene_id === currentScene.scene_id ? { ...s, summary_text: e.target.value } : s
                                );
                                updateScenesWithHistory(newScenes);
                              }}
                              rows={2}
                              className="w-full px-2.5 py-1.5 rounded-xl text-[11px] bg-[#0E1017] border border-[#22273B] text-white resize-none focus:outline-none focus:border-cyan-400"
                              placeholder="Nhập tóm tắt phân cảnh..."
                            />
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>

                {/* LAYER 2: WHISPER VOICE SUBTITLES (DARK PILL) */}
                <div className="pt-3 border-t border-[#22273B] space-y-2.5 bg-[#141724] p-3 rounded-2xl border border-[#282F45]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-white/40" />
                      <div>
                        <span className="text-xs font-black text-white block">Phụ Đề Whisper (Dark Pill)</span>
                        <span className="text-[10px] text-slate-400">Khung xám đen chạy theo giọng đọc audio</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowWhisperSubs((v) => !v)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                        showWhisperSubs ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {showWhisperSubs ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{showWhisperSubs ? 'BẬT' : 'TẮT'}</span>
                    </button>
                  </div>

                  {showWhisperSubs && (
                    <>
                      <div className="space-y-1 pt-1">
                        <div className="text-[10px] font-bold text-slate-300 flex justify-between">
                          <span>Vị trí Phụ Đề Whisper:</span>
                          <span className="text-cyan-400 capitalize">{subsPosY}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['bottom', 'middle', 'top'] as const).map((pos) => (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => setSubsPosY(pos)}
                              className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                                subsPosY === pos
                                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                                  : 'border-[#22273B] bg-[#161926] text-slate-400'
                              }`}
                            >
                              {pos === 'bottom' ? 'Phía Dưới' : pos === 'middle' ? 'Ở Giữa' : 'Trên Cùng'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {(() => {
                        const currentScene = scenes.find((s) => s.scene_id === activeSceneId) || scenes[0];
                        const currentIdx = scenes.findIndex((s) => s.scene_id === (currentScene?.scene_id || 1));
                        if (!currentScene) return null;
                        return (
                          <div className="space-y-1 pt-1">
                            <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                              <Edit3 className="w-3 h-3 text-cyan-400" />
                              <span>Sửa Lời Thoại Whisper (Scene {currentIdx + 1})</span>
                            </div>
                            <textarea
                              value={currentScene.voice_transcript || currentScene.summary_text || ''}
                              onChange={(e) => {
                                const newScenes = scenes.map((s) =>
                                  s.scene_id === currentScene.scene_id ? { ...s, voice_transcript: e.target.value } : s
                                );
                                updateScenesWithHistory(newScenes);
                              }}
                              rows={3}
                              className="w-full px-2.5 py-1.5 rounded-xl text-[11px] bg-[#0E1017] border border-[#22273B] text-white resize-none focus:outline-none focus:border-cyan-400"
                              placeholder="Nhập lời thoại đọc theo audio..."
                            />
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>

                {/* SUBTITLE VISIBILITY PER SCENE */}
                <div className="pt-3 border-t border-[#22273B] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ẩn / Hiện Toàn Bộ Text Từng Scene</span>
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Tùy chọn ẩn hoặc hiện thẻ chữ cho từng phân cảnh:
                  </p>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {scenes.map((s, idx) => {
                      const isHidden = s.hide_text === true;
                      return (
                        <div
                          key={s.scene_id || idx}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                            isHidden
                              ? 'bg-[#151824] border-[#22273B] text-slate-500 opacity-75'
                              : 'bg-[#1D2132] border-[#282F45] text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate flex-1 mr-2">
                            <span className="w-5 h-5 rounded-md bg-[#282F45] text-slate-300 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="truncate text-[11px] font-medium">
                              {s.title || s.summary_text?.slice(0, 26) || `Scene ${idx + 1}`}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const newScenes = scenes.map((sc, i) =>
                                i === idx ? { ...sc, hide_text: !sc.hide_text } : sc
                              );
                              updateScenesWithHistory(newScenes);
                            }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              isHidden
                                ? 'bg-slate-800 text-slate-400 hover:text-white'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                            }`}
                          >
                            {isHidden ? <EyeOff className="w-3 h-3 text-slate-400" /> : <Eye className="w-3 h-3 text-cyan-400" />}
                            <span>{isHidden ? 'Đã ẩn' : 'Hiển thị'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FX / TRANSITIONS (100+ GLSL) & FILTERS */}
            {activeFlyoutTab === 'effects' && (
              <EffectsFlyoutTab
                onClose={() => setActiveFlyoutTab(null)}
                selectedSceneIndex={typeof activeSceneId === 'number' ? activeSceneId - 1 : 0}
                currentShaderName={
                  typeof activeSceneId === 'number' && scenes[activeSceneId - 1]
                    ? (scenes[activeSceneId - 1] as any).shader_name || (scenes[activeSceneId - 1] as any).transition_out?.shader_name
                    : undefined
                }
                onApplyTransition={(shaderName) => {
                  let targetIdx = typeof activeSceneId === 'number' ? activeSceneId - 1 : -1;
                  if (targetIdx < 0 || targetIdx >= scenes.length) {
                    targetIdx = scenes.findIndex((s) => {
                      const sSt = s.start_sec !== undefined ? s.start_sec : (s.start_frame || 0) / fps;
                      const sDur = s.duration_sec !== undefined ? s.duration_sec : (s.duration_frames || 150) / fps;
                      return currentSec >= sSt && currentSec <= sSt + sDur;
                    });
                    if (targetIdx < 0) targetIdx = 0;
                  }

                  const targetScene = scenes[targetIdx] || scenes[0];
                  const sStart = targetScene.start_sec !== undefined ? targetScene.start_sec : (targetScene.start_frame || 0) / fps;
                  const sDur = targetScene.duration_sec !== undefined ? targetScene.duration_sec : (targetScene.duration_frames || 150) / fps;
                  const boundarySec = sStart + sDur;

                  const dur = 0.8;
                  // Center the transition right on the boundary between Scene i and Scene i+1
                  const st = Math.max(0, snapToGrid(boundarySec - dur / 2, 0.05));
                  const et = Math.min(totalDurationSec, st + dur);

                  const hasOverlapTrack0 = timelineEffects.some(
                    (fx) => fx.trackIndex === 0 && ((st >= fx.startTime && st < fx.endTime) || (et > fx.startTime && et <= fx.endTime))
                  );

                  const nextIdx = targetIdx + 1 < scenes.length ? targetIdx + 1 : targetIdx;

                  const newFx: CustomTimelineEffect = {
                    id: `fx_trans_${Date.now()}`,
                    effectId: shaderName,
                    name: `${shaderName} (S${targetIdx + 1} ➔ S${nextIdx + 1})`,
                    shaderName: shaderName,
                    trackIndex: hasOverlapTrack0 ? 1 : 0,
                    startTime: st,
                    endTime: et,
                    duration: dur,
                  };

                  setTimelineEffects((prev) => [...prev, newFx]);

                  setScenes((prev) =>
                    prev.map((s, idx) => {
                      if (idx === targetIdx) {
                        return {
                          ...s,
                          transition_out: { shader_name: shaderName, duration: dur },
                          shader_name: shaderName,
                        };
                      }
                      return s;
                    })
                  );

                  seekTo(Math.round(Math.max(0, st - 0.2) * fps));
                  setSyncStatusMsg(`Đã áp dụng chuyển cảnh ${shaderName} giữa Scene ${targetIdx + 1} và Scene ${nextIdx + 1}!`);
                  setTimeout(() => setSyncStatusMsg(null), 3000);
                }}
                onApplyEffect={(effId) => {
                  const st = snapToGrid(currentSec, 0.05);
                  const dur = 2.0;
                  const et = Math.min(totalDurationSec, st + dur);

                  const hasOverlapTrack0 = timelineEffects.some(
                    (fx) => fx.trackIndex === 0 && ((st >= fx.startTime && st < fx.endTime) || (et > fx.startTime && et <= fx.endTime))
                  );

                  const newFx: CustomTimelineEffect = {
                    id: `fx_eff_${Date.now()}`,
                    effectId: effId,
                    name: effId.replace(/_/g, ' ').toUpperCase(),
                    trackIndex: hasOverlapTrack0 ? 1 : 0,
                    startTime: st,
                    endTime: et,
                    duration: dur,
                  };

                  setTimelineEffects((prev) => [...prev, newFx]);

                  setScenes((prev) => {
                    let targetIdx = typeof activeSceneId === 'number' ? activeSceneId - 1 : -1;
                    if (targetIdx < 0 || targetIdx >= prev.length) {
                      let accum = 0;
                      targetIdx = prev.findIndex((s) => {
                        const dur = (s.duration_frames || 150) / fps;
                        const match = currentSec >= accum && currentSec <= accum + dur;
                        accum += dur;
                        return match;
                      });
                      if (targetIdx < 0) targetIdx = 0;
                    }
                    return prev.map((s, idx) => {
                      if (idx === targetIdx) {
                        return {
                          ...s,
                          underlayer_effect: effId,
                          visual_effect: effId,
                        };
                      }
                      return s;
                    });
                  });
                  setSyncStatusMsg(`Đã kích hoạt hiệu ứng: ${effId} tại ${st.toFixed(1)}s (Track ${hasOverlapTrack0 ? 2 : 1})!`);
                  setTimeout(() => setSyncStatusMsg(null), 3000);
                }}
              />
            )}

            {/* TAB 5: AUTO-CAPTIONS AI */}
            {activeFlyoutTab === 'captions' && (
              <CaptionsFlyoutTab
                onClose={() => setActiveFlyoutTab(null)}
                audioUrl={selectedExportAudioUrl || remotionAudioSrc}
                segments={captionSegments}
                onChangeSegments={setCaptionSegments}
                presetStyle={captionPresetStyle}
                onChangePresetStyle={setCaptionPresetStyle}
                onTranscribeWhisper={handleTranscribeCaptions}
                isTranscribing={isTranscribingCaptions}
                visualStyle={visualStyle}
                sourceBadgeText={scenes[typeof activeSceneId === 'number' ? Math.max(0, activeSceneId - 1) : 0]?.source_badge_text || scenes[0]?.source_badge_text || 'TIN MỚI TỪ VNEXPRESS'}
                onChangeSourceBadgeText={(txt) => {
                  const sIdx = typeof activeSceneId === 'number' ? Math.max(0, activeSceneId - 1) : 0;
                  setScenes((prev) =>
                    prev.map((s, idx) =>
                      idx === sIdx || !s.source_badge_text ? { ...s, source_badge_text: txt } : s
                    )
                  );
                }}
                sourceBadgePosX={scenes[typeof activeSceneId === 'number' ? Math.max(0, activeSceneId - 1) : 0]?.source_badge_pos_x ?? scenes[0]?.source_badge_pos_x ?? 5}
                onChangeSourceBadgePosX={(x) => {
                  const sIdx = typeof activeSceneId === 'number' ? Math.max(0, activeSceneId - 1) : 0;
                  setScenes((prev) =>
                    prev.map((s, idx) => (idx === sIdx ? { ...s, source_badge_pos_x: x } : s))
                  );
                }}
                sourceBadgePosY={scenes[typeof activeSceneId === 'number' ? Math.max(0, activeSceneId - 1) : 0]?.source_badge_pos_y ?? scenes[0]?.source_badge_pos_y ?? 5}
                onChangeSourceBadgePosY={(y) => {
                  const sIdx = typeof activeSceneId === 'number' ? Math.max(0, activeSceneId - 1) : 0;
                  setScenes((prev) =>
                    prev.map((s, idx) => (idx === sIdx ? { ...s, source_badge_pos_y: y } : s))
                  );
                }}
                captionPosY={scenes[typeof activeSceneId === 'number' ? Math.max(0, activeSceneId - 1) : 0]?.caption_pos_y ?? scenes[0]?.caption_pos_y ?? 20}
                onChangeCaptionPosY={(y) => {
                  const sIdx = typeof activeSceneId === 'number' ? Math.max(0, activeSceneId - 1) : 0;
                  setScenes((prev) =>
                    prev.map((s, idx) => (idx === sIdx ? { ...s, caption_pos_y: y } : s))
                  );
                }}
                tickerText={scenes[typeof activeSceneId === 'number' ? Math.max(0, activeSceneId - 1) : 0]?.ticker_text || scenes[0]?.ticker_text || '⚡ BẢN TIN NÓNG • Cập nhật liên tục 24/7'}
                onChangeTickerText={(txt) => {
                  const sIdx = typeof activeSceneId === 'number' ? Math.max(0, activeSceneId - 1) : 0;
                  setScenes((prev) =>
                    prev.map((s, idx) =>
                      idx === sIdx || !s.ticker_text ? { ...s, ticker_text: txt } : s
                    )
                  );
                }}
              />
            )}
          </div>
        )}

        {/* COLUMN 4: MAIN CANVAS STAGE PREVIEW WITH ZOOM (DARK BACKDROP) */}
        <main className="flex-1 bg-[#090A10] flex items-center justify-center p-6 relative overflow-hidden">
          {/* Floating Sync Timeline Status Banner */}
          {syncStatusMsg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-500/20 text-white text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{syncStatusMsg}</span>
            </div>
          )}

          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* 16:9 Video Canvas WITH SCALABLE ZOOM */}
          <div
            id="wynrise-video-stage"
            className="relative shadow-2xl rounded-2xl overflow-hidden border border-[#22273B] bg-white transition-transform duration-150 flex items-center justify-center"
            style={{
              width: aspectRatio === '16:9' ? '880px' : aspectRatio === '9:16' ? '420px' : '580px',
              aspectRatio: aspectRatio === '16:9' ? '16 / 9' : aspectRatio === '9:16' ? '9 / 16' : '1 / 1',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            <DynamicAnimationComposition
              scenes={scenes}
              visualStyle={visualStyle}
              showSceneCards={showSceneCards}
              showWhisperSubs={showWhisperSubs}
              cardPosY={cardPosY}
              subsPosY={subsPosY}
              captionSegments={captionSegments}
              captionPresetStyle={captionPresetStyle}
              timelineEffects={timelineEffects}
              onUpdateScene={(sceneId, updated) => {
                setScenes((prev) =>
                  prev.map((s) => (s.scene_id === sceneId ? { ...s, ...updated } : s))
                );
              }}
            />
          </div>
        </main>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. CAPCUT PROFESSIONAL MULTI-TRACK TIMELINE */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer
        className={`border-t border-[#1E2330] bg-[#12141F] flex flex-col z-20 transition-all duration-200 ${
          isTimelineCollapsed ? 'h-12' : 'h-64'
        }`}
      >
        {/* Top Mini Control Toolbar with CapCut Tools */}
        <div className="h-10 px-4 flex items-center justify-between border-b border-[#1E2330] bg-[#0E1017]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white"
            >
              {isTimelineCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{isTimelineCollapsed ? 'Expand' : 'Close'}</span>
            </button>

            <div className="h-4 w-px bg-[#252B3E]" />

            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Hoàn tác)"
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= sceneHistory.length - 1}
              title="Redo"
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSplitClipAtPlayhead}
              title="Split Clip tại vị trí con trỏ (✂️ Cắt phân đoạn)"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition-all"
            >
              <Scissors className="w-3 h-3" />
              <span>Split (Cắt)</span>
            </button>
          </div>

          {/* Center Playback Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => seekTo(Math.max(0, frame - fps * 3))}
              className="p-1 text-slate-400 hover:text-white"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-7 h-7 rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center font-bold shadow-md transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => seekTo(Math.min(durationInFrames, frame + fps * 3))}
              className="p-1 text-slate-400 hover:text-white"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-mono text-white font-bold ml-1">
              {formatTime(currentSec)} ({frame}) / {formatTime(totalDurationSec)} ({durationInFrames})
            </span>

            <div className="flex items-center gap-1.5 ml-2">
              <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-white">
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 accent-cyan-400 h-1 bg-[#252B3E] rounded-lg"
              />
            </div>
          </div>

          {/* Right: Interactive Zoom Slider & Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))}
              className="p-1 text-slate-400 hover:text-white"
              title="Thu nhỏ Canvas"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-16 accent-cyan-400 h-1 bg-[#252B3E] rounded-lg cursor-pointer"
            />
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.0, parseFloat((z + 0.1).toFixed(1))))}
              className="p-1 text-slate-400 hover:text-white"
              title="Phóng to Canvas"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 w-8">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => seekTo(0)} className="text-slate-400 hover:text-white ml-1">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Timeline Multi-Tracks Stage (CapCut Look & Feel with 100+ GLSL Trimming) */}
        {!isTimelineCollapsed && (
          <MultiTrackTimelineSlider
            currentTime={currentSec}
            totalDuration={totalDurationSec}
            isPlaying={isPlaying}
            onPlayPause={togglePlay}
            onSeek={(t) => seekTo(Math.round(t * fps))}
            tracks={timelineTracks}
            selectedItemId={selectedTimelineItemId || (typeof activeSceneId === 'number' ? `media_${activeSceneId}` : null)}
            onSelectItem={(itemId) => {
              setSelectedTimelineItemId(itemId);
              if (itemId?.startsWith('media_')) {
                const sId = parseInt(itemId.replace('media_', ''), 10);
                if (!isNaN(sId)) setActiveSceneId(sId);
              }
            }}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
            onDeleteItem={handleDeleteItem}
            onOpenFXTab={() => setActiveFlyoutTab('effects')}
            onUpdateItemDuration={(itemId, newStart, newDur) => {
              // 1. Move & Resize Media Scene Clip (Independent Position & Duration with Gap Support)
              if (itemId.startsWith('media_')) {
                const sId = parseInt(itemId.replace('media_', ''), 10);
                setScenes((prev) =>
                  prev.map((s, idx) => {
                    const match = (s.scene_id === sId) || (idx + 1 === sId);
                    if (match) {
                      const safeStart = Math.max(0, newStart);
                      const safeDur = Math.max(0.5, newDur);
                      const startFrame = Math.round(safeStart * fps);
                      const durFrames = Math.round(safeDur * fps);
                      return {
                        ...s,
                        start_frame: startFrame,
                        duration_frames: durFrames,
                        start_sec: safeStart,
                        duration_sec: safeDur,
                        end_sec: safeStart + safeDur,
                      };
                    }
                    return s;
                  })
                );
                setSyncStatusMsg(`Đã cập nhật Scene: ${newStart.toFixed(1)}s (${newDur.toFixed(1)}s)!`);
                setTimeout(() => setSyncStatusMsg(null), 2500);
                return;
              }

              // 2. Resize & Move FX Item
              if (itemId.startsWith('fx_')) {
                setTimelineEffects((prev) =>
                  prev.map((fx) => {
                    if (fx.id === itemId) {
                      const safeStart = Math.max(0, newStart);
                      const safeDur = Math.max(0.2, newDur);
                      return {
                        ...fx,
                        startTime: safeStart,
                        duration: safeDur,
                        endTime: safeStart + safeDur,
                      };
                    }
                    return fx;
                  })
                );

                if (itemId.startsWith('fx_trans_')) {
                  const sId = parseInt(itemId.replace('fx_trans_', ''), 10);
                  if (!isNaN(sId)) {
                    setScenes((prev) =>
                      prev.map((s, idx) => {
                        const match = (s.scene_id === sId) || (idx + 1 === sId);
                        if (match) {
                          return {
                            ...s,
                            transition_out: {
                              ...(s as any).transition_out,
                              duration: Math.max(0.2, newDur),
                            },
                          };
                        }
                        return s;
                      })
                    );
                  }
                }

                setSyncStatusMsg(`Đã cập nhật thời lượng FX: ${newDur.toFixed(1)}s!`);
                setTimeout(() => setSyncStatusMsg(null), 2500);
              }
            }}
          />
        )}
      </footer>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. MODAL: REGENERATE SCENE WITH AI PROMPT / CODE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {sceneToRegenerate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#141622] rounded-3xl border border-[#2A3147] shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#22273B]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                  <RefreshCw className={`w-4 h-4 ${isRegeneratingScene ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Tạo lại Scene {sceneToRegenerate.scene_id}: {sceneToRegenerate.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Thời lượng: {sceneToRegenerate.start_sec}s ➔ {sceneToRegenerate.end_sec}s
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSceneToRegenerate(null)}
                disabled={isRegeneratingScene}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Nhập Prompt/Ý tưởng hình vẽ mới cho Scene này:
              </label>
              <textarea
                value={regeneratePrompt}
                onChange={(e) => setRegeneratePrompt(e.target.value)}
                disabled={isRegeneratingScene}
                rows={4}
                placeholder="Ví dụ: 'Vẽ chú mèo đang ôm lá thư với biểu cảm ngạc nhiên và dấu tích xanh thành công...'"
                className="w-full p-3.5 rounded-2xl bg-[#1A1E2E] border border-[#2B334B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-[#161926] border border-[#252B3E] text-[11px] text-slate-400 leading-relaxed">
              💡 <span className="font-bold text-slate-200">Ghi chú:</span> AI sẽ tạo lại mã hoạt họa riêng cho Scene này và lưu trực tiếp vào cơ sở dữ liệu. Toàn bộ các Scene khác vẫn được giữ nguyên.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSceneToRegenerate(null)}
                disabled={isRegeneratingScene}
                className="px-4 py-2 rounded-xl border border-[#2D354E] text-xs font-bold text-slate-300 hover:bg-[#1E2333]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleRegenerateSceneSubmit}
                disabled={isRegeneratingScene}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isRegeneratingScene ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{isRegeneratingScene ? 'Đang tạo lại Scene...' : 'Tạo lại Scene này'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT CONFIGURATION & AUDIO SELECTION MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-150">
          <div className="bg-[#141724] border border-[#2B334B] rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col space-y-5 text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#22283A]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Xuất Video MP4 Hoạt Họa</h3>
                  <p className="text-[11px] text-slate-400">Chọn giọng đọc audio và cấu hình trước khi xuất</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (previewAudioRef.current) {
                    previewAudioRef.current.pause();
                    previewAudioRef.current = null;
                  }
                  setPreviewPlayingAudioId(null);
                  setShowExportModal(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#202638]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SECTION 1: AUDIO TRACK SELECTION */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1. Chọn Giọng Đọc / Audio Khả Dụng ({availableAudioTracks.length})</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Tạo nhiều bản ngôn ngữ cho 1 bộ ảnh</span>
              </label>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableAudioTracks.length > 0 ? (
                  availableAudioTracks.map((track) => {
                    const isSelected = selectedExportAudioUrl === track.url;
                    const isPlaying = previewPlayingAudioId === track.id;
                    return (
                      <div
                        key={track.id}
                        onClick={() => setSelectedExportAudioUrl(track.url)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                            : 'bg-[#1A1E2D] border-[#252B3E] hover:bg-[#22273B] text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                          <span className="text-xl">{track.flag}</span>
                          <div>
                            <p className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>{track.label}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">
                              {track.url.split('/').pop() || 'audio-track.wav'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAudioPreview(track);
                          }}
                          className={`p-2 rounded-xl transition-all flex items-center gap-1 text-[11px] font-bold ${
                            isPlaying
                              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 animate-pulse'
                              : 'bg-[#262C40] text-slate-300 hover:text-white hover:bg-[#323A54]'
                          }`}
                          title={isPlaying ? 'Dừng phát' : 'Nghe thử'}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isPlaying ? 'Đang phát' : 'Nghe thử'}</span>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[#1A1E2D] border border-[#252B3E] text-xs text-slate-400 flex items-center gap-2">
                    <span>🎧</span>
                    <span>Sử dụng Audio hiện tại của Slide</span>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: ASPECT RATIO */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">2. Tỉ Lệ Khung Hình (Resolution)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '16:9', label: '16:9 (Ngang)', icon: '🖥️', desc: 'YouTube, Web, TV' },
                  { id: '9:16', label: '9:16 (Dọc)', icon: '📱', desc: 'TikTok, Reels, Shorts' },
                  { id: '1:1', label: '1:1 (Vuông)', icon: '⏹️', desc: 'Instagram, Feed' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedExportAspectRatio(item.id as any)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      selectedExportAspectRatio === item.id
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-black'
                        : 'bg-[#1A1E2D] border-[#252B3E] text-slate-300 hover:bg-[#22273B]'
                    }`}
                  >
                    <div className="text-base mb-1">{item.icon}</div>
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 3: BACKGROUND COLOR */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">3. Màu Nền Giấy (Paper Theme)</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {BG_THEMES.map((theme) => (
                  <button
                    key={theme.color}
                    type="button"
                    onClick={() => setSelectedExportBgColor(theme.color)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${
                      selectedExportBgColor === theme.color
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                        : 'border-[#252B3E] bg-[#1A1E2D] text-slate-300 hover:bg-[#22273B]'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-500" style={{ backgroundColor: theme.color }} />
                    <span>{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#22283A]">
              <button
                type="button"
                onClick={() => {
                  if (previewAudioRef.current) {
                    previewAudioRef.current.pause();
                    previewAudioRef.current = null;
                  }
                  setPreviewPlayingAudioId(null);
                  setShowExportModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-[#202638] transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (previewAudioRef.current) {
                    previewAudioRef.current.pause();
                    previewAudioRef.current = null;
                  }
                  setPreviewPlayingAudioId(null);
                  handleDownloadVideoMP4(selectedExportAudioUrl, selectedExportAspectRatio, selectedExportBgColor);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Bắt Đầu Xuất Video MP4</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. REAL-TIME CLIENT-SIDE EXPORT PROGRESS MODAL */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200">
          <div className="bg-[#161926] border border-[#2B334B] rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/25 animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">Exporting 1080p Video</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                {exportStatusText &&
                !exportStatusText.includes('Playwright') &&
                !exportStatusText.includes('Chromium') &&
                !exportStatusText.includes('Đang')
                  ? exportStatusText
                  : 'Rendering watercolor strokes, pencil sketches & syncing audio...'}
              </p>
            </div>

            {/* Timer Badge (Counts seconds up to max 10:00) */}
            <div className="flex items-center justify-center gap-2 py-1.5 px-4 rounded-full bg-[#1F2538] border border-[#2F374E] text-xs font-mono text-cyan-300 font-bold shadow-inner">
              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Time: {formatElapsed(exportElapsedSec)} / Max 10:00</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-2">
              <div className="w-full h-3 bg-[#202538] rounded-full overflow-hidden p-0.5 border border-[#2B334B]">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-full transition-all duration-150"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-bold">
                <span>Rendering frames...</span>
                <span className="text-cyan-400 font-black">{exportProgress}%</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Please keep this browser tab open. Your video will download automatically once completed!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const AIVideoEditorStudio: React.FC<{
  slideId?: string;
  moduleId?: string;
  slideIndex?: number;
  projectId?: string;
  projectData?: any;
  audioSrc?: string;
  style?: string;
  onBack?: () => void;
}> = ({
  slideId = 'slide_0',
  moduleId,
  slideIndex = 0,
  projectId,
  projectData,
  audioSrc,
  style = 'handdrawn_fast_doodle',
  onBack,
}) => {
  const [slideAudio, setSlideAudio] = useState<string | undefined>(projectData?.audio_url || audioSrc);
  const [totalFrames, setTotalFrames] = useState<number>(
    projectData?.total_frames ||
    (projectData?.scenes && projectData.scenes.length > 0
      ? projectData.scenes.reduce((acc: number, s: any) => acc + (s.duration_frames || 150), 0)
      : 1338)
  );
  const [initialSlideScenes, setInitialSlideScenes] = useState<DynamicSceneData[]>(
    projectData?.scenes && projectData.scenes.length > 0 ? projectData.scenes : DEFAULT_FALLBACK_SCENES
  );
  const [initialBg, setInitialBg] = useState<string>(projectData?.bg_color || '#FAF7EF');

  useEffect(() => {
    if (projectData) {
      if (projectData.audio_url) setSlideAudio(projectData.audio_url);
      if (projectData.scenes && projectData.scenes.length > 0) {
        setInitialSlideScenes(projectData.scenes);
        const calculatedFrames = projectData.scenes.reduce(
          (acc: number, s: any) => acc + (s.duration_frames || 150),
          0
        );
        if (calculatedFrames > 0) setTotalFrames(calculatedFrames);
      }
      if (projectData.bg_color) setInitialBg(projectData.bg_color);
      return;
    }

    if (!moduleId) return;

    let isMounted = true;
    const fetchSlideData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/slides/animate/module/${moduleId}/slide/${slideIndex}`);
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data && isMounted) {
            const d = result.data;
            if (d.audio_url) setSlideAudio(d.audio_url);
            if (d.scenes && d.scenes.length > 0) {
              setInitialSlideScenes(d.scenes);
              const calculatedFrames = d.scenes.reduce(
                (acc: number, s: any) => acc + (s.duration_frames || 150),
                0
              );
              if (calculatedFrames > 0) setTotalFrames(calculatedFrames);
            }
            if (d.bg_color) setInitialBg(d.bg_color);
            return;
          }
        }

        // Fallback: check module slides to extract slide-specific speaker text, image and audio
        const modRes = await fetch(`${API_BASE}/api/studyhub/modules/${moduleId}`);
        if (modRes.ok) {
          const mod = await modRes.json();
          if (mod && mod.slides && mod.slides[slideIndex] && isMounted) {
            const s = mod.slides[slideIndex];
            const foundAudio =
              s.audio_urls?.en ||
              s.audio_urls?.vi ||
              (s.audio_urls && Object.values(s.audio_urls)[0]) ||
              s.audio_url ||
              s.audio;
            if (foundAudio) setSlideAudio(foundAudio as string);

            if (s.animation?.scenes && s.animation.scenes.length > 0) {
              setInitialSlideScenes(s.animation.scenes);
              const calculatedFrames = s.animation.scenes.reduce(
                (acc: number, sc: any) => acc + (sc.duration_frames || 150),
                0
              );
              if (calculatedFrames > 0) setTotalFrames(calculatedFrames);
            } else {
              // Construct dynamic slide scene for THIS slide if no AI animation exists yet
              const spText = s.speaker_text?.en || s.speaker_text?.vi || s.speaker_notes || s.text || '';
              const isEn = Boolean(s.speaker_text?.en && !s.speaker_text?.vi) || /^[a-zA-Z0-9\s.,!?'"-]+$/.test(spText.slice(0, 40));
              const titleText = s.title || (isEn ? `Slide ${slideIndex + 1}` : `Slide ${slideIndex + 1}`);
              const dynamicScene: DynamicSceneData = {
                scene_id: 1,
                title: titleText,
                start_sec: 0.0,
                end_sec: 10.0,
                start_frame: 0,
                duration_frames: 300,
                summary_text: spText.slice(0, 120) || (isEn ? `Overview of ${titleText}` : `Tóm tắt nội dung ${titleText}`),
                voice_transcript: spText || (isEn ? `Slide ${slideIndex + 1} presentation content.` : `Nội dung bài giảng Slide ${slideIndex + 1}.`),
                highlight_keywords: [titleText, isEn ? 'Overview' : 'Tổng quan'],
                image_url: s.image_url || '',
              };
              setInitialSlideScenes([dynamicScene]);
              setTotalFrames(300);
            }
          }
        }
      } catch (err) {
        console.warn('Error pre-fetching slide audio/animation:', err);
      }
    };

    fetchSlideData();

    return () => {
      isMounted = false;
    };
  }, [moduleId, slideIndex, projectData]);

  const effectiveStyle = projectData?.visual_style || style || 'handdrawn_fast_doodle';
  const effectiveScenes = projectData?.scenes && projectData.scenes.length > 0 ? projectData.scenes : initialSlideScenes;

  return (
    <RemotionPlayerProvider
      fps={30}
      durationInFrames={totalFrames}
      audioSrc={slideAudio || ''}
      initialBgColor={initialBg}
    >
      <StudioInner
        slideId={slideId}
        moduleId={moduleId}
        slideIndex={slideIndex}
        projectId={projectId}
        projectData={projectData}
        initialStyle={effectiveStyle}
        initialScenes={effectiveScenes}
        audioUrl={slideAudio}
        onBack={onBack}
      />
    </RemotionPlayerProvider>
  );
};
