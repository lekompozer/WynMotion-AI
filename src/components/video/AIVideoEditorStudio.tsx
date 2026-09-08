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
  ArrowLeft,
  LayoutTemplate,
  Crown,
  Atom,
  Film,
  Clock,
  Info,
} from 'lucide-react';
import { usePointsBalance } from '@/hooks/useSubscription';
import { WynMotionUpgradeModal } from '@/components/modals/WynMotionUpgradeModal';
import { RemotionPlayerProvider, useRemotion } from './RemotionEngine';
import { DynamicAnimationComposition } from './DynamicAnimationComposition';
import { DynamicSceneData } from './DynamicSceneRenderer';
import { TemplatesFlyoutTab } from './flyouts/TemplatesFlyoutTab';
import { AssetsFlyoutTab } from './flyouts/AssetsFlyoutTab';
import { AudioFlyoutTab } from './flyouts/AudioFlyoutTab';
import { SettingsFlyoutTab } from './flyouts/SettingsFlyoutTab';
import { CaptionsFlyoutTab } from './flyouts/CaptionsFlyoutTab';
import { EffectsFlyoutTab } from './flyouts/EffectsFlyoutTab';
import { RegenerateSceneModal } from './modals/RegenerateSceneModal';
import { ExportVideoModal } from './modals/ExportVideoModal';
import { ExportProgressModal } from './modals/ExportProgressModal';
import { CaptionReviewModal } from './modals/CaptionReviewModal';
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
    setVoiceStartSec,
    setVoiceDurationSec,
    setBgmStartSec,
    setBgmDurationSec,
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
    if (currStyle === 'apple_modern_motion') {
      const DEFAULT_CDN = 'https://static.wordai.pro/ai-generated-images/wynmotion/templates';
      const mainVideo1 = (projectData as any)?.default_params?.main_video_1 || `${DEFAULT_CDN}/WynMotion-Video-phase1-7s.mp4`;
      const trainVideos = (projectData as any)?.default_params?.train_videos || [
        `${DEFAULT_CDN}/cinematic_showcase_demo.mp4`,
        `${DEFAULT_CDN}/science_explainer_rendered_demo2.mp4`,
        `${DEFAULT_CDN}/whiteboard_stream_en_demo.mp4`,
        `${DEFAULT_CDN}/video_animate_image_demo.mp4`,
        `${DEFAULT_CDN}/WynMotion_character_animation_stickman_en_demo.mp4`,
      ];
      const mainVideo2 = (projectData as any)?.default_params?.main_video_2 || `${DEFAULT_CDN}/Wynmotion_video_phase4.5.mp4`;
      const mainVideo3 = (projectData as any)?.default_params?.main_video_3 || `${DEFAULT_CDN}/WynMotion_Video_Phase6.mp4`;
      const brandLogo = (projectData as any)?.default_params?.brand_logo_url || `${DEFAULT_CDN}/iconApp-WynAI-512.png`;
      const brandCompany = (projectData as any)?.default_params?.brand_company || 'WynAI';
      const brandName = (projectData as any)?.default_params?.brand_name || 'WynMotion';
      const titlePrimary = (projectData as any)?.default_params?.title_primary || 'AI Video Studio';
      const tagline1 = (projectData as any)?.default_params?.tagline_1 || 'NEXT-GEN';
      const tagline2 = (projectData as any)?.default_params?.tagline_2 || 'CREATIVE SUITE';
      const sloganPrice = (projectData as any)?.default_params?.slogan_price || '$1';
      const sloganText = (projectData as any)?.default_params?.slogan_text || 'Create Daily 60s AI Videos From Just';

      return [
        { scene_id: 1, title: 'Hero Video 1: Cinematic Intro', start_sec: 0.0, end_sec: 7.0, duration_frames: 210, video_url: mainVideo1, visual_style: 'apple_modern_motion' },
        { scene_id: 2, title: `By ${brandCompany} & Logo`, start_sec: 7.0, end_sec: 9.0, duration_frames: 60, brand_company: brandCompany, brand_logo_url: brandLogo, visual_style: 'apple_modern_motion' },
        { scene_id: 3, title: titlePrimary, start_sec: 9.0, end_sec: 10.2, duration_frames: 36, title_primary: titlePrimary, visual_style: 'apple_modern_motion' },
        { scene_id: 4, title: tagline1, start_sec: 10.2, end_sec: 11.4, duration_frames: 36, tagline_1: tagline1, visual_style: 'apple_modern_motion' },
        { scene_id: 5, title: tagline2, start_sec: 11.4, end_sec: 12.6, duration_frames: 36, tagline_2: tagline2, visual_style: 'apple_modern_motion' },
        { scene_id: 6, title: 'DISCOVER OUR TEMPLATES', start_sec: 12.6, end_sec: 13.8, duration_frames: 36, templates_header: 'DISCOVER OUR TEMPLATES', visual_style: 'apple_modern_motion' },
        { scene_id: 7, title: 'Category: Business.', start_sec: 13.8, end_sec: 15.0, duration_frames: 36, category_1: 'Business.', visual_style: 'apple_modern_motion' },
        { scene_id: 8, title: 'Category: News.', start_sec: 15.0, end_sec: 16.2, duration_frames: 36, category_2: 'News.', visual_style: 'apple_modern_motion' },
        { scene_id: 9, title: 'Category: Illustrative.', start_sec: 16.2, end_sec: 17.4, duration_frames: 36, category_3: 'Illustrative.', visual_style: 'apple_modern_motion' },
        { scene_id: 10, title: 'Motion & Explainer Videos', start_sec: 17.4, end_sec: 19.5, duration_frames: 63, category_4: 'Motion & Explainer', category_4_sub: 'Videos', visual_style: 'apple_modern_motion' },
        { scene_id: 11, title: '5-Video Conveyor Belt Showcase', start_sec: 19.5, end_sec: 28.5, duration_frames: 270, train_videos: trainVideos, visual_style: 'apple_modern_motion' },
        { scene_id: 12, title: 'Hero Video 2: AI Audio Studio', start_sec: 28.5, end_sec: 30.5, duration_frames: 60, video_url: mainVideo2, visual_style: 'apple_modern_motion' },
        { scene_id: 13, title: 'AI Audio Studio', start_sec: 30.5, end_sec: 32.5, duration_frames: 60, audio_title: 'AI Audio Studio', visual_style: 'apple_modern_motion' },
        { scene_id: 14, title: 'Natural voices.', start_sec: 32.5, end_sec: 34.0, duration_frames: 45, visual_style: 'apple_modern_motion' },
        { scene_id: 15, title: 'Every language.', start_sec: 34.0, end_sec: 35.5, duration_frames: 45, visual_style: 'apple_modern_motion' },
        { scene_id: 16, title: 'Every conversation.', start_sec: 35.5, end_sec: 37.0, duration_frames: 45, visual_style: 'apple_modern_motion' },
        { scene_id: 17, title: 'World Flags Wave', start_sec: 37.0, end_sec: 39.5, duration_frames: 75, visual_style: 'apple_modern_motion' },
        { scene_id: 18, title: 'Hero Video 3: Video Editor Suite', start_sec: 39.5, end_sec: 44.5, duration_frames: 150, video_url: mainVideo3, visual_style: 'apple_modern_motion' },
        { scene_id: 19, title: `Offer: From ${sloganPrice}`, start_sec: 44.5, end_sec: 47.5, duration_frames: 90, slogan_text: sloganText, slogan_price: sloganPrice, visual_style: 'apple_modern_motion' },
        { scene_id: 20, title: `${brandName} Outro`, start_sec: 47.5, end_sec: 50.1, duration_frames: 78, brand_name: brandName, visual_style: 'apple_modern_motion' },
      ] as any;
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

  // Resizable flyout width (min: 320px, max: 640px - max gấp đôi default)
  const DEFAULT_FLYOUT_WIDTH = 320;
  const MIN_FLYOUT_WIDTH = 320;
  const MAX_FLYOUT_WIDTH = 640;

  const [flyoutWidth, setFlyoutWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wynmotion_flyout_width');
        if (saved) {
          const val = parseInt(saved, 10);
          if (!isNaN(val) && val >= MIN_FLYOUT_WIDTH && val <= MAX_FLYOUT_WIDTH) {
            return val;
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_FLYOUT_WIDTH;
  });

  const [isResizingFlyout, setIsResizingFlyout] = useState(false);
  const isResizingFlyoutRef = useRef(false);
  const flyoutStartXRef = useRef(0);
  const flyoutStartWidthRef = useRef(DEFAULT_FLYOUT_WIDTH);

  const handleFlyoutResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingFlyout(true);
    isResizingFlyoutRef.current = true;
    flyoutStartXRef.current = e.clientX;
    flyoutStartWidthRef.current = flyoutWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingFlyoutRef.current) return;
      const deltaX = moveEvent.clientX - flyoutStartXRef.current;
      const nextWidth = Math.min(
        MAX_FLYOUT_WIDTH,
        Math.max(MIN_FLYOUT_WIDTH, flyoutStartWidthRef.current + deltaX)
      );
      setFlyoutWidth(nextWidth);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      if (!isResizingFlyoutRef.current) return;
      isResizingFlyoutRef.current = false;
      setIsResizingFlyout(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const deltaX = upEvent.clientX - flyoutStartXRef.current;
      const finalWidth = Math.min(
        MAX_FLYOUT_WIDTH,
        Math.max(MIN_FLYOUT_WIDTH, flyoutStartWidthRef.current + deltaX)
      );
      try {
        localStorage.setItem('wynmotion_flyout_width', String(finalWidth));
      } catch (e) {}
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleFlyoutResizeReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFlyoutWidth(DEFAULT_FLYOUT_WIDTH);
    try {
      localStorage.setItem('wynmotion_flyout_width', String(DEFAULT_FLYOUT_WIDTH));
    } catch (e) {}
  };

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

  // Determine whether this project is commercial showcase / BGM based or voice narrator
  const isCommercialMusicStyle = useMemo(() => {
    return (
      ['ads_cinematic_showcase', 'cinematic_showcase', 'ads_strobe_teaser', 'strobe_teaser', 'product_ads_motion', 'animation_ads_image_veo'].includes(
        (visualStyle as string) || ''
      ) ||
      (projectData as any)?.audio_mode === 'bgm' ||
      Boolean((projectData as any)?.is_music_template) ||
      Boolean((projectData as any)?.bgm_url && !(projectData as any)?.voice_name)
    );
  }, [visualStyle, projectData]);

  // Determine if template supports dynamic voice animation synchronization
  const isAnimationSyncableTemplate = useMemo(() => {
    return [
      'whiteboard_stream_hand',
      'handdrawn_fast_doodle',
      'dialogue_scene',
      'science_explainer',
      'character_animation',
      'apple_modern_motion',
      'video_news_60s',
    ].includes(visualStyle);
  }, [visualStyle]);

  // Points Balance from real API
  const { data: pointsData, isLoading: pointsLoading, refetch: refetchPoints } = usePointsBalance({
    autoRefresh: true,
    refreshInterval: 20000,
  });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [showProjectInfoModal, setShowProjectInfoModal] = useState(false);

  // Science Explainer AI Chat Code Editing & Version History State
  const [isEditingScienceCode, setIsEditingScienceCode] = useState(false);
  const [scienceVersions, setScienceVersions] = useState<any[]>([]);
  const [scienceExplainingMsg, setScienceExplainingMsg] = useState<string | null>(null);
  const [showVersionHistoryDropdown, setShowVersionHistoryDropdown] = useState(false);

  // Auto-Captions Whisper & CapCut Subtitle State with Original/Translated Dual Storage
  const initialOrigSegs: CaptionSegment[] = (projectData as any)?.whisper_original_segments || [];
  const initialTransSegs: CaptionSegment[] = (projectData as any)?.whisper_translated_segments || [];
  const initialActiveMode: 'original' | 'translated' = (projectData as any)?.whisper_active_mode || (initialTransSegs.length > 0 ? 'translated' : 'original');
  const initialCurrentSegs: CaptionSegment[] = initialActiveMode === 'translated' && initialTransSegs.length > 0 ? initialTransSegs : initialOrigSegs;

  // Language auto-detection helper from content
  const detectLanguageFromContent = useCallback((data: any, sceneList: DynamicSceneData[]): string => {
    if (data?.whisper_original_language) return data.whisper_original_language;
    if (data?.language_code) return data.language_code;
    if (data?.language) return data.language;
    const textToCheck = [
      data?.script || '',
      ...(sceneList || []).map((s: any) => `${s.voice_transcript || ''} ${s.dialogue || ''} ${s.voiceover || ''} ${s.summary_text || ''}`),
    ].join(' ');
    if (/[\u4e00-\u9fa5]/.test(textToCheck)) return 'zh';
    if (/[\u3040-\u30ff]/.test(textToCheck)) return 'ja';
    if (/[\uac00-\ud7af]/.test(textToCheck)) return 'ko';
    if (/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(textToCheck)) return 'vi';
    return 'vi';
  }, []);

  const detectedOrigLang = useMemo(() => detectLanguageFromContent(projectData, scenes), [projectData, scenes, detectLanguageFromContent]);
  const defaultTargetLang = detectedOrigLang === 'vi' ? 'en' : 'vi';

  const [captionSegments, setCaptionSegments] = useState<CaptionSegment[]>(initialCurrentSegs);
  const [originalCaptionSegments, setOriginalCaptionSegments] = useState<CaptionSegment[]>(initialOrigSegs);
  const [translatedCaptionSegments, setTranslatedCaptionSegments] = useState<CaptionSegment[]>(initialTransSegs);
  const [captionOriginalLang, setCaptionOriginalLang] = useState<string>(
    () => (projectData as any)?.whisper_original_language || (projectData as any)?.language_code || detectedOrigLang
  );
  const [captionTargetLang, setCaptionTargetLang] = useState<string>(
    () => (projectData as any)?.whisper_target_language || defaultTargetLang
  );
  const [subtitleMode, setSubtitleMode] = useState<'original' | 'translated'>(initialActiveMode);

  // Synchronize caption states when projectData changes or loads from API
  useEffect(() => {
    if (!projectData) return;
    const p = projectData as any;
    const orig = p.whisper_original_segments || (p.whisper_active_mode !== 'translated' ? p.caption_segments : []) || [];
    const trans = p.whisper_translated_segments || (p.whisper_active_mode === 'translated' ? p.caption_segments : []) || [];
    const mode = p.whisper_active_mode || (trans.length > 0 ? 'translated' : 'original');
    const active = mode === 'translated' && trans.length > 0 ? trans : orig;

    if (orig && orig.length > 0) setOriginalCaptionSegments(orig);
    if (trans && trans.length > 0) setTranslatedCaptionSegments(trans);
    if (active && active.length > 0) setCaptionSegments(active);

    const lang = p.whisper_original_language || p.language_code || detectLanguageFromContent(p, scenes);
    if (lang) setCaptionOriginalLang(lang);
    if (p.whisper_target_language) {
      setCaptionTargetLang(p.whisper_target_language);
    } else {
      setCaptionTargetLang(lang === 'vi' ? 'en' : 'vi');
    }
    if (mode) setSubtitleMode(mode);
    if (p.show_whisper_subs !== undefined) setShowWhisperSubs(Boolean(p.show_whisper_subs));
  }, [projectData?.project_id, projectData?.updated_at]);

  const [isCaptionReviewModalOpen, setIsCaptionReviewModalOpen] = useState<boolean>(false);
  const [captionPresetStyle, setCaptionPresetStyle] = useState<CaptionPresetStyle>(() => {
    return (
      (projectData as any)?.caption_preset_style ||
      (projectData as any)?.studio_config?.captions_config?.preset_style ||
      (projectData as any)?.studio_config?.captions?.preset_style ||
      'karaoke_glow'
    );
  });
  const [captionFontSize, setCaptionFontSize] = useState<number>(() => {
    return (
      (projectData as any)?.caption_font_size ||
      (projectData as any)?.studio_config?.captions_config?.font_size ||
      (projectData as any)?.studio_config?.captions?.font_size ||
      32
    );
  });
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
        const segs: CaptionSegment[] = data.segments;
        const detectedLang = data.language || language || 'vi';
        setOriginalCaptionSegments(segs);
        setCaptionSegments(segs);
        setCaptionOriginalLang(detectedLang);
        setSubtitleMode('original');
        setShowWhisperSubs(true);
        // Automatically open the Review & Edit modal so user can check text before translating!
        setIsCaptionReviewModalOpen(true);
        if (projectId) {
          wynmotionService.updateProject(projectId, {
            whisper_original_segments: segs,
            whisper_original_language: detectedLang,
            whisper_active_mode: 'original',
          } as any).catch(console.warn);
        }
      }
    } catch (err: any) {
      console.error('Whisper caption error:', err);
      alert(err.message || 'Không thể tạo phụ đề lúc này');
    } finally {
      setIsTranscribingCaptions(false);
    }
  };

  const handleSaveOriginalCaptions = async (editedSegments: CaptionSegment[], lang: string) => {
    setOriginalCaptionSegments(editedSegments);
    setCaptionSegments(editedSegments);
    setCaptionOriginalLang(lang);
    setSubtitleMode('original');
    setShowWhisperSubs(true);
    setSyncStatusMsg('Đã lưu phụ đề gốc vào dự án!');
    setTimeout(() => setSyncStatusMsg(null), 2500);
    if (projectId) {
      await wynmotionService.updateProject(projectId, {
        caption_segments: editedSegments,
        whisper_original_segments: editedSegments,
        whisper_original_language: lang,
        whisper_active_mode: 'original',
        show_whisper_subs: true,
      } as any).catch(console.warn);
    }
  };

  const handleSaveTranslatedCaptions = async (
    originalSegs: CaptionSegment[],
    translatedSegs: CaptionSegment[],
    sourceLang: string,
    targetLang: string
  ) => {
    setOriginalCaptionSegments(originalSegs);
    setTranslatedCaptionSegments(translatedSegs);
    setCaptionSegments(translatedSegs);
    setCaptionOriginalLang(sourceLang);
    setCaptionTargetLang(targetLang);
    setSubtitleMode('translated');
    setShowWhisperSubs(true);
    setSyncStatusMsg(`Đã dịch phụ đề sang ${targetLang.toUpperCase()} & lưu vào dự án!`);
    setTimeout(() => setSyncStatusMsg(null), 3000);
    if (projectId) {
      await wynmotionService.updateProject(projectId, {
        caption_segments: translatedSegs,
        whisper_original_segments: originalSegs,
        whisper_original_language: sourceLang,
        whisper_translated_segments: translatedSegs,
        whisper_target_language: targetLang,
        whisper_active_mode: 'translated',
        show_whisper_subs: true,
      } as any).catch(console.warn);
    }
  };

  const handleSwitchSubtitleMode = (mode: 'original' | 'translated') => {
    setSubtitleMode(mode);
    if (mode === 'translated' && translatedCaptionSegments.length > 0) {
      setCaptionSegments(translatedCaptionSegments);
    } else {
      setCaptionSegments(originalCaptionSegments);
    }
    if (projectId) {
      wynmotionService.updateProject(projectId, {
        whisper_active_mode: mode,
      } as any).catch(console.warn);
    }
  };

  const [selectedExportAspectRatio, setSelectedExportAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [selectedExportBgColor, setSelectedExportBgColor] = useState<string>('#FAF7EF');
  const [selectedExportResolution, setSelectedExportResolution] = useState<'1080p' | '4k'>('1080p');
  const [omniChatPrompt, setOmniChatPrompt] = useState('');
  const [isGeneratingOmni, setIsGeneratingOmni] = useState(false);
  const [extensionDurationSec, setExtensionDurationSec] = useState<number>(5);
  const [isExtendingVideo, setIsExtendingVideo] = useState<boolean>(false);
  const [extensionHistory, setExtensionHistory] = useState<Array<{ prompt: string; duration: number; video_url: string; time: string }>>([]);
  const [extendedVideoUrl, setExtendedVideoUrl] = useState<string | null>(null);

  const handleExtendOmniVideo = async () => {
    if (!omniChatPrompt.trim() || isExtendingVideo || !projectId) return;
    setIsExtendingVideo(true);
    try {
      const res = await (wynmotionService as any).extendVeoVideo({
        project_id: projectId,
        extension_prompt: omniChatPrompt.trim(),
        duration_seconds: extensionDurationSec,
        resolution: (projectData?.resolution as any) || '720p',
      });
      if (res?.video_url) {
        setExtendedVideoUrl(res.video_url);
        setScenes((prev) =>
          prev.map((s, idx) => (idx === 0 ? { ...s, video_url: res.video_url } : s))
        );
        setExtensionHistory((prev) => [
          ...prev,
          {
            prompt: omniChatPrompt.trim(),
            duration: res.duration_seconds || extensionDurationSec,
            video_url: res.video_url,
            time: new Date().toLocaleTimeString(),
          },
        ]);
        setOmniChatPrompt('');
        alert(`✅ Đã nối dài video thêm ${res.duration_seconds || extensionDurationSec}s thành công! (-${res.points_deducted} Điểm)`);
      }
    } catch (err: any) {
      console.error('Failed to extend video:', err);
      alert(err.message || 'Lỗi khi nối dài video');
    } finally {
      setIsExtendingVideo(false);
    }
  };

  const [swapSpeakers, setSwapSpeakers] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [previewPlayingAudioId, setPreviewPlayingAudioId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleDeleteScene = (sceneIdToDelete: number | string) => {
    if (scenes.length <= 1) {
      alert('Video cần có tối thiểu 1 phân cảnh!');
      return;
    }
    const updatedScenes = scenes
      .filter((s) => s.scene_id !== sceneIdToDelete)
      .map((s, idx) => ({
        ...s,
        scene_id: idx + 1,
      }));
    setScenes(updatedScenes);
    if (activeScene?.scene_id === sceneIdToDelete) {
      setActiveSceneId(updatedScenes[0].scene_id);
    }
    if (projectId) {
      wynmotionService.updateProject(projectId, {
        scenes: updatedScenes as any,
      } as any).catch(console.warn);
    }
  };

  const handleAddScene = () => {
    const newSceneId = scenes.length + 1;
    const newScene: DynamicSceneData = {
      scene_id: newSceneId,
      title: `Scene ${newSceneId}`,
      summary_text: `Phân cảnh mới ${newSceneId}`,
      voice_transcript: `Phân cảnh mới ${newSceneId}`,
      duration_frames: 120,
    };
    const updatedScenes = [...scenes, newScene];
    setScenes(updatedScenes);
    setActiveSceneId(newScene.scene_id);
    if (projectId) {
      wynmotionService.updateProject(projectId, {
        scenes: updatedScenes as any,
      } as any).catch(console.warn);
    }
  };

  // Active audio selector & sync timeline state
  const [showAudioDropdown, setShowAudioDropdown] = useState(false);
  const [isSyncingTimeline, setIsSyncingTimeline] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [activeAudioLang, setActiveAudioLang] = useState<string>('vi');

  // 2-Layer Text Controls
  const [showSceneCards, setShowSceneCards] = useState<boolean>(true);
  const [showWhisperSubs, setShowWhisperSubs] = useState<boolean>(() => {
    const p = projectData as any;
    if (typeof p?.show_whisper_subs === 'boolean') return p.show_whisper_subs;
    if (typeof p?.studio_config?.settings?.show_whisper_subs === 'boolean') return p.studio_config.settings.show_whisper_subs;
    return true;
  });
  const [cardPosY, setCardPosY] = useState<'top' | 'middle' | 'bottom'>('middle');
  const [subsPosY, setSubsPosY] = useState<'top' | 'middle' | 'bottom'>(() => {
    const p = projectData as any;
    return p?.subs_pos_y || p?.studio_config?.captions_config?.position_y || p?.studio_config?.settings?.subs_pos_y || 'bottom';
  });

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

  // Zoom control states: separate canvas stage zoom from multi-track timeline zoom
  const [canvasZoom, setCanvasZoom] = useState<number>(1.0);
  const [timelineZoom, setTimelineZoom] = useState<number | undefined>(undefined);

  // Audio trimming state (startTime, duration in seconds)
  const [audioTrim, setAudioTrim] = useState<{ startTime: number; duration: number }>({
    startTime: 0,
    duration: 0,
  });

  // Keep RemotionEngine voice & bgm windowed playback in sync with audioTrim
  useEffect(() => {
    setVoiceStartSec?.(audioTrim.startTime);
    if (audioTrim.duration > 0) {
      setVoiceDurationSec?.(audioTrim.duration);
    }
    setBgmStartSec?.(audioTrim.startTime);
    if (audioTrim.duration > 0) {
      setBgmDurationSec?.(audioTrim.duration);
    }
  }, [audioTrim, setVoiceStartSec, setVoiceDurationSec, setBgmStartSec, setBgmDurationSec]);

  // Master Studio Config - Single Source of Truth for all 5 Tabs
  const masterStudioConfig = useMemo(() => {
    const audioPayload = {
      voice_enabled: !isMuted,
      voice_url: selectedExportAudioUrl || audioUrl || undefined,
      voice_volume: isMuted ? 0 : volume,
      voice_muted: isMuted,
      bgm_enabled: bgmVolume > 0,
      bgm_url: customBgmFile || projectData?.bgm_url || undefined,
      bgm_volume: bgmVolume,
      bgm_muted: bgmVolume === 0,
      bgm_start_sec: audioTrim.startTime,
      bgm_duration_sec: audioTrim.duration > 0 ? audioTrim.duration : undefined,
    };
    const settingsPayload = {
      aspect_ratio: aspectRatio,
      bg_color: bgColor,
      swap_speakers: swapSpeakers,
      show_scene_cards: showSceneCards,
      show_whisper_subs: showWhisperSubs,
      card_pos_y: cardPosY,
      subs_pos_y: subsPosY,
      fps: 30,
    };
    const assetsPayload = {
      template_nature: (visualStyle === 'science_explainer' || visualStyle === 'stem_explainer')
        ? 'code_vector_based'
        : (visualStyle === 'dialogue_scene' || visualStyle === 'conversation')
        ? 'dialogue_based'
        : (visualStyle === 'animation_ads_image_veo' || visualStyle === 'product_ads_omni')
        ? 'ads_video_omni'
        : 'image_based',
      scenes,
      deleted_scene_ids: [],
      omni_video_url: extendedVideoUrl || projectData?.mp4_url || (scenes[0] as any)?.video_url || undefined,
    };
    const fxPayload = {
      timeline_effects: timelineEffects,
      transition_type: 'wipe_diagonal',
      scene_transitions: {},
      visual_filters: {},
    };
    const captionsPayload = {
      preset_style: captionPresetStyle,
      caption_segments: captionSegments,
      font_size: captionFontSize,
      position_y: subsPosY,
      max_width_pct: 85,
    };

    return {
      version: '2.0',
      project_id: projectId || '',
      visual_style: visualStyle,
      resolution: selectedExportResolution,
      aspect_ratio: aspectRatio,
      bg_color: bgColor,
      updated_at: new Date().toISOString(),
      // Standard 2.0 schema
      assets_config: assetsPayload,
      audio_config: audioPayload,
      settings_config: settingsPayload,
      fx_config: fxPayload,
      captions_config: captionsPayload,
      // Backward-compatible legacy aliases
      scenes,
      audio: audioPayload,
      settings: settingsPayload,
      fx: fxPayload,
      captions: captionsPayload,
    };
  }, [
    visualStyle,
    scenes,
    selectedExportAudioUrl,
    audioUrl,
    volume,
    isMuted,
    customBgmFile,
    projectData?.bgm_url,
    projectData?.mp4_url,
    bgmVolume,
    audioTrim,
    aspectRatio,
    bgColor,
    swapSpeakers,
    showSceneCards,
    showWhisperSubs,
    cardPosY,
    subsPosY,
    timelineEffects,
    captionPresetStyle,
    captionFontSize,
    captionSegments,
    selectedExportResolution,
    projectId,
  ]);

  // Debounced auto-save of studio_config to MongoDB
  useEffect(() => {
    if (!projectId) return;
    const t = setTimeout(() => {
      wynmotionService.updateProject(projectId, {
        scenes: scenes as any,
        aspect_ratio: aspectRatio,
        bg_color: bgColor,
        show_whisper_subs: showWhisperSubs,
        subs_pos_y: subsPosY,
        caption_preset_style: captionPresetStyle,
        caption_font_size: captionFontSize,
        caption_segments: captionSegments,
        studio_config: masterStudioConfig,
      } as any).catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [masterStudioConfig, projectId, scenes, aspectRatio, bgColor, showWhisperSubs, subsPosY, captionPresetStyle, captionFontSize, captionSegments]);

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

  // Sync audio duration with total video duration
  useEffect(() => {
    if (totalDurationSec > 0) {
      setAudioTrim((prev) => ({
        startTime: prev.startTime,
        duration: prev.duration > 0 ? Math.min(prev.duration, totalDurationSec - prev.startTime) : totalDurationSec,
      }));
    }
  }, [totalDurationSec]);

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

    const audioDur = audioTrim.duration > 0 ? audioTrim.duration : totalDurationSec;
    const audioItems: TimelineItem[] = [
      {
        id: 'bgm_main',
        trackId: 'track_audio',
        trackType: 'audio',
        startTime: audioTrim.startTime,
        endTime: audioTrim.startTime + audioDur,
        duration: audioDur,
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
  }, [scenes, fps, totalDurationSec, captionSegments, timelineEffects, audioTrim]);

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

  const handleSendScienceCodePrompt = async (overridePrompt?: string) => {
    const promptToSend = (overridePrompt || chatInput).trim();
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
        <h2 style={{ fontSize: isPortrait ? 32 : 48, fontWeight: 900, textShadow: '0 0 20px rgba(0, 240, 255, 0.8)' }}>STEM EXPLAINER</h2>
        <p style={{ color: '#E2E8F0', marginTop: 8, fontSize: 16 }}>${activeScene?.voice_transcript || activeScene?.title || 'Scientific Discovery & Quantum Dynamics'}</p>
      </div>
    </div>
  );
};`;

      const currentCode = (activeScene as any)?.code || fallbackScienceCode;
      const res = await wynmotionService.editScienceExplainerCode({
        project_id: projectId,
        scene_id: activeScene ? activeScene.scene_id : 1,
        current_code: currentCode,
        prompt: promptToSend,
        aspect_ratio: aspectRatio,
        science_domain: (projectData as any)?.science_domain || 'physics',
        language_code: (projectData as any)?.language_code || 'vi',
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
        setScienceExplainingMsg(res.explanation || 'Đã cập nhật code hoạt họa!');
        setChatInput('');
      } else {
        alert(res.message || 'Không thể chỉnh sửa code.');
      }
    } catch (err: any) {
      console.error('Error editing science code:', err);
      alert(err.message || 'Lỗi khi gửi yêu cầu chỉnh sửa AI.');
    } finally {
      setIsEditingScienceCode(false);
    }
  };

  const handleApplyScienceVersion = async (versionId: string) => {
    try {
      const res = await wynmotionService.applyScienceExplainerVersion(
        projectId,
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
        setScienceExplainingMsg(res.explanation || `Đã chuyển về phiên bản ${res.version_number}`);
      }
    } catch (err: any) {
      alert(err.message || 'Không thể áp dụng phiên bản này.');
    }
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

  // Handle Replace Scene Image directly (Dialogue & Cartoon Sketches)
  const handleReplaceSceneImage = (sceneId: number | string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (!dataUrl) return;
      const newScenes = scenes.map((sc) => {
        if (sc.scene_id === sceneId) {
          return {
            ...sc,
            image_url: dataUrl,
            generated_image_url: dataUrl,
            sketch_image_url: dataUrl,
          };
        }
        return sc;
      });
      updateScenesWithHistory(newScenes);
      setSyncStatusMsg(`Đã đổi ảnh cho Cảnh ${sceneId} thành công!`);
      setTimeout(() => setSyncStatusMsg(null), 2500);
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
        // Save latest state to project doc so backend worker reads up-to-date configuration
        wynmotionService.updateProject(projectId, {
          scenes: scenes as any,
          studio_config: masterStudioConfig,
          timeline_effects: timelineEffects,
          bg_color: chosenBg,
          visual_style: visualStyle,
          caption_segments: captionSegments,
        } as any).catch(() => {});

        const expRes = await (wynmotionService as any).exportMP4(projectId, scenes, {
          aspect_ratio: chosenAspect,
          show_scene_cards: showSceneCards,
          show_whisper_subs: showWhisperSubs,
          force_rerender: true,
          audio_url: chosenAudio || undefined,
          bg_color: chosenBg,
          visual_style: visualStyle,
          card_pos_y: cardPosY,
          subs_pos_y: subsPosY,
          timeline_effects: timelineEffects,
          caption_segments: captionSegments,
          caption_preset_style: captionPresetStyle,
          caption_font_size: captionFontSize,
          voice_start_sec: audioTrim.startTime,
          voice_duration_sec: audioTrim.duration > 0 ? audioTrim.duration : undefined,
          bgm_start_sec: audioTrim.startTime,
          bgm_duration_sec: audioTrim.duration > 0 ? audioTrim.duration : undefined,
          resolution: selectedExportResolution,
          studio_config: masterStudioConfig,
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
    <div className="flex flex-col min-h-screen w-full bg-[#0C0D14] text-slate-200 font-sans select-none overflow-x-hidden overflow-y-auto studio-scrollbar">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP DARK HEADER BAR */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="h-12 border-b border-[#1E2230] bg-[#12141F] flex items-center justify-between px-4 z-30 shadow-md sticky top-0 shrink-0">
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
          {!isCommercialMusicStyle && (
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

                  <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5 studio-scrollbar">
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
          )}

          {/* 3. Sync Timeline Button */}
          {isAnimationSyncableTemplate && (
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
          )}
        </div>

        {/* Right: AI Credits (Real API), Download & Info Modal */}
        <div className="flex items-center gap-2.5">
          {/* EXPORT SPINNER & NOTIFICATION */}
          {isExporting && (
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs font-bold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Generating and rendering Remotion MP4 video on server. Please do not close this tab...</span>
            </div>
          )}

          {/* AI CREDIT BADGE (Real user points from API) */}
          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            title="Điểm AI Khả Dụng - Bấm để nạp thêm điểm"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <span>💎</span>
            <span>{pointsData ? pointsData.points_remaining.toLocaleString() : (pointsLoading ? '...' : 0)}</span>
          </button>

          {/* SAVE PROJECT TO SERVER BUTTON */}
          <button
            type="button"
            onClick={async () => {
              if (!projectId) {
                alert('Không tìm thấy ID dự án để lưu.');
                return;
              }
              try {
                setSyncStatusMsg('Đang lưu toàn bộ dự án & phụ đề lên máy chủ...');
                await wynmotionService.updateProject(projectId, {
                  scenes: scenes as any,
                  caption_segments: captionSegments,
                  whisper_original_segments: originalCaptionSegments,
                  whisper_translated_segments: translatedCaptionSegments,
                  whisper_original_language: captionOriginalLang,
                  whisper_target_language: captionTargetLang,
                  whisper_active_mode: subtitleMode,
                  show_whisper_subs: showWhisperSubs,
                  caption_preset_style: captionPresetStyle,
                  caption_font_size: captionFontSize,
                  subs_pos_y: subsPosY,
                  aspect_ratio: aspectRatio,
                  bg_color: bgColor || '#FAF7EF',
                  fps: fps,
                } as any);
                setSyncStatusMsg('✅ Đã lưu dự án & phụ đề lên máy chủ thành công!');
                setTimeout(() => setSyncStatusMsg(null), 3000);
              } catch (err: any) {
                console.error('Save project error:', err);
                alert(`Lỗi khi lưu dự án: ${err.message || 'Vui lòng thử lại'}`);
                setSyncStatusMsg(null);
              }
            }}
            title="Lưu toàn bộ phân cảnh, phụ đề gốc và phụ đề dịch vào cơ sở dữ liệu"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E2333] hover:bg-[#2A3146] border border-[#2F374E] text-slate-200 hover:text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lưu Dự Án</span>
          </button>

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

          {/* PROJECT INFO MODAL TRIGGER */}
          <button
            type="button"
            onClick={() => setShowProjectInfoModal(true)}
            title="Thông Tin Chi Tiết Dự Án (Project Info)"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1E2333] transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN BODY: LEFT CHAT + ICON BAR + FLYOUT DRAWER + CANVAS */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className={`flex w-full shrink-0 border-b border-[#1E2230] relative transition-all duration-200 overflow-hidden ${
          aspectRatio === '9:16'
            ? 'h-[calc(100vh-210px)] min-h-[500px] max-h-[620px]'
            : aspectRatio === '1:1'
            ? 'h-[calc(100vh-210px)] min-h-[460px] max-h-[560px]'
            : 'h-[calc(100vh-210px)] min-h-[440px] max-h-[540px]'
        }`}
      >
        {/* COLUMN 1: LEFT CHAT SIDEBAR (Exclusive to Science Explainer) */}
        {visualStyle === 'science_explainer' && (
          <div className="w-80 h-full border-r border-[#1E2230] bg-[#10121B] flex flex-col justify-between p-3.5 z-10 animate-in slide-in-from-left duration-200 shrink-0 overflow-hidden">
            <div className="space-y-3 overflow-y-auto pr-1 studio-scrollbar flex-1">
              {/* Header with Title & Version Indicator */}
              <div className="flex items-center justify-between pb-2 border-b border-[#1E2230]">
                <div className="flex items-center gap-2 text-xs font-black text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="tracking-wide">Edit by Chat with AI</span>
                </div>
                {scienceVersions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowVersionHistoryDropdown((v) => !v)}
                    className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all font-mono"
                    title="Xem lịch sử phiên bản code"
                  >
                    <History className="w-3 h-3" />
                    <span>v{scienceVersions.find((v) => v.is_applied)?.version_number || scienceVersions.length}</span>
                  </button>
                )}
              </div>

              {/* Version History Dropdown / Rollback List */}
              {showVersionHistoryDropdown && scienceVersions.length > 0 && (
                <div className="p-2.5 rounded-2xl bg-[#141828] border border-cyan-500/30 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Lịch Sử Phiên Bản (Version History)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowVersionHistoryDropdown(false)}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 studio-scrollbar">
                    {scienceVersions.map((v: any) => (
                      <div
                        key={v.version_id}
                        className={`p-2 rounded-xl text-xs flex items-center justify-between gap-2 border transition-all ${
                          v.is_applied
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                            : 'bg-[#0E101A] border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <span className="font-mono text-cyan-400">v{v.version_number}</span>
                            <span className="truncate">{v.prompt || 'Phiên bản gốc'}</span>
                          </div>
                          {v.explanation && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{v.explanation}</p>
                          )}
                        </div>
                        {v.is_applied ? (
                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Đang dùng
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApplyScienceVersion(v.version_id)}
                            className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-md bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95 transition-all shadow-sm"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Explanation of Recent Edit */}
              {scienceExplainingMsg && (
                <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed animate-in fade-in duration-200 shadow-sm flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white mb-0.5">Gemini 3.8 Flash</div>
                    <div>{scienceExplainingMsg}</div>
                  </div>
                </div>
              )}

              {/* Quick Suggestion Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400">Gợi ý chỉnh sửa nhanh:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '🟣 Đổi laser sang tím neon',
                    '⚛️ Thêm quỹ đạo electron',
                    '📐 Lưới 3D blueprint chuyển động',
                    '⚡ Tăng tốc độ quay hạt',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      disabled={isEditingScienceCode}
                      onClick={() => handleSendScienceCodePrompt(chip)}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-[#171B2B] hover:bg-[#1E243A] text-slate-300 hover:text-cyan-300 border border-[#262D44] transition-all disabled:opacity-50"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
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
                  rows={2}
                  className="w-full bg-[#0B0D14]/90 border border-[#23293D] rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 resize-none transition-all leading-relaxed"
                />
              </div>
            </div>

            {/* Bottom Chat Prompt Input */}
            <div className="pt-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  disabled={isEditingScienceCode}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendScienceCodePrompt();
                    }
                  }}
                  placeholder={
                    isEditingScienceCode
                      ? 'Gemini 3.8 Flash đang sửa code...'
                      : 'Yêu cầu sửa hoạt họa STEM (Enter gửi)...'
                  }
                  className="w-full pl-3 pr-16 py-2.5 text-xs rounded-xl bg-[#161926] border border-[#252B3E] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:bg-[#1A1E2E] transition-all disabled:opacity-60"
                />
                <div className="absolute right-2 flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    disabled={isEditingScienceCode || !chatInput.trim()}
                    onClick={() => handleSendScienceCodePrompt()}
                    className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 disabled:opacity-40 transition-all"
                  >
                    {isEditingScienceCode ? (
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COLUMN 1: LEFT CHAT SIDEBAR (VIP Video Extension for Gemini Omni) */}
        {(visualStyle === 'animation_ads_image_veo' || visualStyle === 'product_ads_omni') && (
          <div className="w-80 h-full border-r border-[#1E2230] bg-[#10121B] flex flex-col justify-between p-3.5 z-10 animate-in slide-in-from-left duration-200 shrink-0 overflow-hidden">
            <div className="space-y-3 overflow-y-auto pr-1 studio-scrollbar flex-1">
              {/* Header with Title */}
              <div className="flex items-center justify-between pb-2 border-b border-[#1E2230]">
                <div className="flex items-center gap-2 text-xs font-black text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="tracking-wide">AI Video Extension (Omni)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  👑 VIP 3-10s
                </span>
              </div>

              {/* Extension Duration Selector */}
              <div className="p-2.5 rounded-2xl bg-[#141828] border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span>⏱️ Số giây nối dài tiếp theo:</span>
                  <span className="text-cyan-400 font-mono">+{extensionDurationSec}s</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[3, 5, 7, 10].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setExtensionDurationSec(sec)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        extensionDurationSec === sec
                          ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-black shadow-sm'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      +{sec}s
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Trừ: {extensionDurationSec * 4} Điểm (720p)</span>
                  <span className="text-cyan-300 font-semibold">Gemini Omni Flash</span>
                </div>
              </div>

              {/* Clip History / Status Card */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <span>🎬</span>
                  <span>Tiến trình các phân đoạn video:</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#141828]/80 border border-[#22273B] text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>Phân đoạn gốc:</span>
                    <span className="text-cyan-400 font-mono">{projectData?.duration_sec ? `${Math.round(projectData.duration_sec)}s` : '15s'}</span>
                  </div>
                  {extensionHistory.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-white/10">
                      {extensionHistory.map((h, i) => (
                        <div key={i} className="text-[11px] text-slate-300 flex items-start justify-between gap-1">
                          <span className="truncate text-slate-400">+{h.duration}s: {h.prompt}</span>
                          <span className="text-emerald-400 text-[10px] font-mono shrink-0">✓ Xong</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Input for Extension Prompt */}
            <div className="pt-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={omniChatPrompt}
                  disabled={isExtendingVideo}
                  onChange={(e) => setOmniChatPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleExtendOmniVideo();
                    }
                  }}
                  placeholder={
                    isExtendingVideo
                      ? 'Gemini Omni đang nối dài video...'
                      : 'Nhập hướng nối dài (Enter gửi)...'
                  }
                  className="w-full pl-3 pr-16 py-2.5 text-xs rounded-xl bg-[#161926] border border-[#252B3E] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:bg-[#1A1E2E] transition-all disabled:opacity-60"
                />
                <div className="absolute right-2 flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    disabled={isExtendingVideo || !omniChatPrompt.trim()}
                    onClick={() => handleExtendOmniVideo()}
                    className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 disabled:opacity-40 transition-all"
                  >
                    {isExtendingVideo ? (
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COLUMN 2: VERTICAL ICON TOOLBAR (DARK) */}
        <div className="w-12 h-full border-r border-[#1E2230] bg-[#0E1017] flex flex-col items-center py-3 space-y-3 z-10 shrink-0">
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
          <div
            style={{ width: `${flyoutWidth}px` }}
            className={`relative h-full max-h-full min-h-0 border-r border-[#1E2230] bg-[#12141F] flex flex-col z-10 shadow-lg animate-in slide-in-from-left-4 duration-150 shrink-0 ${
              isResizingFlyout ? 'select-none transition-none' : 'transition-[width] duration-150'
            }`}
          >
            {/* Scrollable Flyout Content */}
            <div className="w-full h-full p-4 overflow-y-auto studio-scrollbar flex flex-col min-h-0">
            {/* TAB 1: ASSETS & SCENES GRID */}
            {activeFlyoutTab === 'assets' && (
              <AssetsFlyoutTab
                scenes={scenes}
                activeSceneId={activeSceneId}
                visualStyle={visualStyle}
                fps={fps}
                moduleId={moduleId}
                slideIndex={slideIndex}
                swapSpeakers={swapSpeakers}
                onSetSwapSpeakers={setSwapSpeakers}
                onSceneClick={(sc) => {
                  seekTo(sc.start_frame || 0);
                  setActiveSceneId(sc.scene_id);
                }}
                onAddScene={handleAddScene}
                onDeleteScene={handleDeleteScene}
                onUpdateScenes={updateScenesWithHistory}
                onOpenRegenerateModal={handleOpenRegenerateModal}
                onClose={() => setActiveFlyoutTab(null)}
                uploadedImages={uploadedImages}
                onUploadImageFile={handleUploadImageFile}
                onReplaceSceneImage={handleReplaceSceneImage}
                isGeneratingOmni={isGeneratingOmni}
                projectData={projectData}
              />
            )}

            {/* TAB 2: AUDIO & VOICEOVER */}
            {activeFlyoutTab === 'audio' && (
              <AudioFlyoutTab
                onClose={() => setActiveFlyoutTab(null)}
                availableAudioTracks={availableAudioTracks}
                selectedExportAudioUrl={selectedExportAudioUrl}
                previewPlayingAudioId={previewPlayingAudioId}
                onSelectAndSyncAudio={handleSelectAndSyncAudio}
                onToggleAudioPreview={toggleAudioPreview}
                volume={volume}
                setVolume={setVolume}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                bgmVolume={bgmVolume}
                setBgmVolume={setBgmVolume}
                customBgmFile={customBgmFile}
                onUploadCustomBgm={(name) => {
                  setCustomBgmFile(name);
                  setSyncStatusMsg(`Đã tải lên BGM: ${name}`);
                  setTimeout(() => setSyncStatusMsg(null), 2500);
                }}
              />
            )}

            {/* TAB 3: SETTINGS & PROPORTIONAL DIALOGUE BUBBLE CONTROLS */}
            {activeFlyoutTab === 'settings' && (
              <SettingsFlyoutTab
                onClose={() => setActiveFlyoutTab(null)}
                visualStyle={visualStyle}
                aspectRatio={aspectRatio}
                scenes={scenes}
                activeSceneId={activeSceneId}
                onUpdateScenesWithHistory={updateScenesWithHistory}
                swapSpeakers={swapSpeakers}
                onSetSwapSpeakers={setSwapSpeakers}
                bgColor={bgColor}
                setBgColor={setBgColor}
                showSceneCards={showSceneCards}
                setShowSceneCards={setShowSceneCards}
                cardPosY={cardPosY}
                setCardPosY={setCardPosY}
                showWhisperSubs={showWhisperSubs}
                subsPosY={subsPosY}
                onOpenCaptionsTab={() => setActiveFlyoutTab('captions')}
              />
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
                  const half = dur / 2;
                  const st = Math.max(0, boundarySec - half);

                  const updatedScenes = scenes.map((s, idx) => {
                    if (idx === targetIdx) {
                      return {
                        ...s,
                        shader_name: shaderName,
                        transition_out: {
                          shader_name: shaderName,
                          duration_sec: dur,
                        },
                      };
                    }
                    return s;
                  });
                  updateScenesWithHistory(updatedScenes);

                  setSyncStatusMsg(`Đã gán chuyển cảnh GLSL: ${shaderName} tại cuối phân cảnh ${targetIdx + 1}!`);
                  setTimeout(() => setSyncStatusMsg(null), 3000);
                }}
                onApplyEffect={(effId) => {
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
                  const st = targetScene.start_sec !== undefined ? targetScene.start_sec : (targetScene.start_frame || 0) / fps;
                  const dur = targetScene.duration_sec !== undefined ? targetScene.duration_sec : (targetScene.duration_frames || 150) / fps;

                  const hasOverlapTrack0 = timelineEffects.some(
                    (ef) => (ef.trackIndex === 0 || ef.trackIndex === undefined) && !(st + dur <= ef.startTime || st >= ef.startTime + ef.duration)
                  );
                  const trackIndex = hasOverlapTrack0 ? 1 : 0;

                  const newFx: CustomTimelineEffect = {
                    id: `fx_${Date.now()}`,
                    effectId: effId,
                    name: effId.replace(/_/g, ' ').toUpperCase(),
                    startTime: st,
                    endTime: st + dur,
                    duration: dur,
                    trackIndex: trackIndex,
                  };
                  setTimelineEffects((prev) => [...prev, newFx]);
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
                onChangeSegments={(newSegs) => {
                  setCaptionSegments(newSegs);
                  if (subtitleMode === 'translated') {
                    setTranslatedCaptionSegments(newSegs);
                  } else {
                    setOriginalCaptionSegments(newSegs);
                  }
                  if (projectId) {
                    wynmotionService.updateProject(projectId, {
                      caption_segments: newSegs,
                      whisper_translated_segments: subtitleMode === 'translated' ? newSegs : undefined,
                      whisper_original_segments: subtitleMode === 'original' ? newSegs : undefined,
                      whisper_segments: newSegs,
                    } as any).catch(() => {});
                  }
                }}
                presetStyle={captionPresetStyle}
                onChangePresetStyle={(st) => {
                  setCaptionPresetStyle(st);
                  if (projectId) {
                    wynmotionService.updateProject(projectId, { caption_preset_style: st } as any).catch(() => {});
                  }
                }}
                onTranscribeWhisper={handleTranscribeCaptions}
                isTranscribing={isTranscribingCaptions}
                visualStyle={visualStyle}
                showSubs={showWhisperSubs}
                onToggleSubs={() => {
                  setShowWhisperSubs((v) => {
                    const nv = !v;
                    if (projectId) {
                      wynmotionService.updateProject(projectId, { show_whisper_subs: nv } as any).catch(() => {});
                    }
                    return nv;
                  });
                }}
                subsPosY={subsPosY}
                onChangeSubsPosY={(pos) => {
                  setSubsPosY(pos);
                  if (projectId) {
                    wynmotionService.updateProject(projectId, { subs_pos_y: pos } as any).catch(() => {});
                  }
                }}
                captionFontSize={captionFontSize}
                onChangeCaptionFontSize={(sz) => {
                  setCaptionFontSize(sz);
                  if (projectId) {
                    wynmotionService.updateProject(projectId, { caption_font_size: sz } as any).catch(() => {});
                  }
                }}
                onOpenReviewModal={() => setIsCaptionReviewModalOpen(true)}
                hasTranslatedSegments={translatedCaptionSegments.length > 0}
                activeSubtitleMode={subtitleMode}
                onChangeSubtitleMode={handleSwitchSubtitleMode}
                originalLanguage={captionOriginalLang}
                targetLanguage={captionTargetLang}
                originalSegments={originalCaptionSegments}
                translatedSegments={translatedCaptionSegments}
                scenes={scenes}
                onSaveBothSegments={(orig, trans, mode) => {
                  setOriginalCaptionSegments(orig);
                  setTranslatedCaptionSegments(trans);
                  const active = mode === 'translated' ? trans : orig;
                  setCaptionSegments(active);
                  setSubtitleMode(mode);
                  if (projectId) {
                    wynmotionService.updateProject(projectId, {
                      caption_segments: active,
                      whisper_original_segments: orig,
                      whisper_translated_segments: trans,
                      whisper_active_mode: mode,
                    } as any).catch(() => {});
                  }
                }}
                activeScene={scenes.find((s) => s.scene_id === activeSceneId) || scenes[0]}
                activeSceneIndex={scenes.findIndex((s) => s.scene_id === (activeSceneId || 1))}
                onUpdateActiveSceneTranscript={(text) => {
                  const curr = scenes.find((s) => s.scene_id === activeSceneId) || scenes[0];
                  if (curr) {
                    const newScenes = scenes.map((s) =>
                      s.scene_id === curr.scene_id ? { ...s, voice_transcript: text } : s
                    );
                    updateScenesWithHistory(newScenes);
                  }
                }}
                hasVoiceAudio={Boolean(selectedExportAudioUrl || audioUrl || remotionAudioSrc)}
                isCommercialMusicStyle={visualStyle === 'product_ads_motion' || visualStyle === 'ads_strobe_teaser'}
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

            {/* Drag Handle to Resize Flyout Width (min: 320px, max: 640px) */}
            <div
              onMouseDown={handleFlyoutResizeStart}
              onDoubleClick={handleFlyoutResizeReset}
              title="Kéo sang phải để mở rộng (320px - 640px) • Nhấp đúp để đặt lại mặc định"
              className={`absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-30 group flex items-center justify-center transition-colors select-none ${
                isResizingFlyout ? 'bg-cyan-500/20' : 'hover:bg-cyan-500/10'
              }`}
            >
              <div
                className={`w-1 h-8 rounded-full transition-all duration-200 ${
                  isResizingFlyout
                    ? 'bg-cyan-400 scale-y-125 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                    : 'bg-slate-600/60 group-hover:bg-cyan-400 group-hover:scale-y-110'
                }`}
              />
            </div>
          </div>
        )}

        {/* Global drag overlay to prevent canvas / iframe capture during resize */}
        {isResizingFlyout && (
          <div
            className="fixed inset-0 z-50 cursor-col-resize select-none pointer-events-auto"
            style={{ userSelect: 'none' }}
          />
        )}

        {/* COLUMN 4: MAIN CANVAS STAGE PREVIEW WITH ZOOM (DARK BACKDROP) */}
        <main className="flex-1 h-full max-h-full min-h-0 bg-[#090A10] flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
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

          {/* Scalable Video Canvas with True Aspect Ratio */}
          <div
            id="wynrise-video-stage"
            className="relative shadow-2xl rounded-2xl overflow-hidden border border-[#22273B] bg-white transition-transform duration-150 flex items-center justify-center shrink-0"
            style={{
              height:
                aspectRatio === '16:9'
                  ? 'min(440px, calc(100% - 24px))'
                  : aspectRatio === '9:16'
                  ? 'min(540px, calc(100% - 24px))'
                  : 'min(480px, calc(100% - 24px))',
              aspectRatio: aspectRatio === '16:9' ? '16 / 9' : aspectRatio === '9:16' ? '9 / 16' : '1 / 1',
              maxWidth: '96%',
              maxHeight: 'calc(100% - 16px)',
              transform: `scale(${canvasZoom})`,
              transformOrigin: 'center center',
            }}
          >
            <DynamicAnimationComposition
              scenes={
                (visualStyle === 'animation_ads_image_veo' || visualStyle === 'product_ads_omni' || visualStyle === 'product_ads_motion') &&
                (extendedVideoUrl || projectData?.mp4_url) &&
                scenes.length > 0 &&
                !scenes[0].video_url
                  ? scenes.map((s, idx) => (idx === 0 ? { ...s, video_url: extendedVideoUrl || projectData.mp4_url } : s))
                  : scenes
              }
              visualStyle={visualStyle}
              showSceneCards={showSceneCards}
              showWhisperSubs={showWhisperSubs}
              cardPosY={cardPosY}
              subsPosY={subsPosY}
              captionSegments={captionSegments}
              captionPresetStyle={captionPresetStyle}
              captionFontSize={captionFontSize}
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
        className={`border-t border-[#1E2330] bg-[#12141F] flex flex-col z-20 transition-all duration-200 shrink-0 ${
          isTimelineCollapsed ? 'h-10' : 'min-h-[380px] pb-8'
        }`}
      >
        {/* Top Mini Control Toolbar with CapCut Tools */}
        <div className="h-10 px-4 flex items-center justify-between border-b border-[#1E2330] bg-[#0E1017] sticky top-12 z-20 shadow-sm">
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

          {/* Right: Interactive Canvas Zoom Slider & Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCanvasZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))}
              className="p-1 text-slate-400 hover:text-white"
              title="Thu nhỏ Canvas"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={canvasZoom}
              onChange={(e) => setCanvasZoom(parseFloat(e.target.value))}
              className="w-16 accent-cyan-400 h-1 bg-[#252B3E] rounded-lg cursor-pointer"
            />
            <button
              onClick={() => setCanvasZoom((z) => Math.min(2.0, parseFloat((z + 0.1).toFixed(1))))}
              className="p-1 text-slate-400 hover:text-white"
              title="Phóng to Canvas"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 w-8">{Math.round(canvasZoom * 100)}%</span>
            <button onClick={() => seekTo(0)} className="text-slate-400 hover:text-white ml-1" title="Về đầu video">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Quick Caption Font Size Controls (Phóng to / Thu nhỏ Text Phụ đề) */}
            {showWhisperSubs && captionSegments && captionSegments.length > 0 && (
              <div className="flex items-center gap-1 pl-2 border-l border-[#252B3E]">
                <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">Cỡ Sub:</span>
                <button
                  type="button"
                  onClick={() => setCaptionFontSize((s) => Math.max(16, s - 2))}
                  className="px-1.5 py-0.5 rounded bg-[#202538] hover:bg-[#2A324B] text-[10px] text-slate-300 font-bold hover:text-white transition-all cursor-pointer"
                  title="Thu nhỏ chữ phụ đề (A-)"
                >
                  A-
                </button>
                <span className="text-[10px] font-mono text-cyan-300 font-bold min-w-[26px] text-center">
                  {captionFontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => setCaptionFontSize((s) => Math.min(68, s + 2))}
                  className="px-1.5 py-0.5 rounded bg-[#202538] hover:bg-[#2A324B] text-[10px] text-slate-300 font-bold hover:text-white transition-all cursor-pointer"
                  title="Phóng to chữ phụ đề (A+)"
                >
                  A+
                </button>
              </div>
            )}
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
            zoomLevel={timelineZoom}
            onZoomChange={setTimelineZoom}
            onDeleteItem={handleDeleteItem}
            onOpenFXTab={() => setActiveFlyoutTab('effects')}
            onUpdateItemDuration={(itemId, newStart, newDur) => {
              // 1. Move & Resize Media Scene Clip (CapCut Magnetic Timeline Trimming & Reordering)
              if (itemId.startsWith('media_')) {
                const sId = parseInt(itemId.replace('media_', ''), 10);
                const targetIdx = scenes.findIndex((s, idx) => s.scene_id === sId || idx + 1 === sId);
                if (targetIdx === -1) return;

                const currentScene = scenes[targetIdx];
                const oldDur = currentScene.duration_sec || (currentScene.duration_frames || 150) / fps;
                const oldStart = currentScene.start_sec ?? 0;

                // Case 1A: Body Drag (Move left / right ➔ Reorder / Swap Scenes)
                if (Math.abs(newDur - oldDur) < 0.08 && Math.abs(newStart - oldStart) > 0.05) {
                  const draggedCenter = newStart + oldDur / 2;
                  let accumulated = 0;
                  let newSlotIdx = scenes.length - 1;
                  for (let i = 0; i < scenes.length; i++) {
                    const sDur = scenes[i].duration_sec || (scenes[i].duration_frames || 150) / fps;
                    if (draggedCenter < accumulated + sDur) {
                      newSlotIdx = i;
                      break;
                    }
                    accumulated += sDur;
                  }

                  if (newSlotIdx !== targetIdx) {
                    const reorderedScenes = [...scenes];
                    const [movedScene] = reorderedScenes.splice(targetIdx, 1);
                    reorderedScenes.splice(newSlotIdx, 0, movedScene);

                    let curSec = 0;
                    let curFrame = 0;
                    const finalScenes = reorderedScenes.map((s) => {
                      const durSec = s.duration_sec || (s.duration_frames || 150) / fps;
                      const durFrames = Math.round(durSec * fps);
                      const startSec = Number(curSec.toFixed(2));
                      const startFrame = curFrame;
                      curSec += durSec;
                      curFrame += durFrames;
                      return {
                        ...s,
                        start_sec: startSec,
                        duration_sec: durSec,
                        end_sec: Number(curSec.toFixed(2)),
                        start_frame: startFrame,
                        duration_frames: durFrames,
                      };
                    });
                    setScenes(finalScenes);
                    const calculatedFrames = finalScenes.reduce((acc, sc) => acc + (sc.duration_frames || 150), 0);
                    if (setDurationInFrames) setDurationInFrames(calculatedFrames);
                    return;
                  }
                }

                // Case 1B: Edge Trimming (Shorten or lengthen duration)
                const safeDur = Math.max(0.5, newDur);
                let curSec = 0;
                let curFrame = 0;
                const updatedScenes = scenes.map((s, idx) => {
                  const match = idx === targetIdx;
                  const durSec = match ? safeDur : (s.duration_sec || (s.duration_frames || 150) / fps);
                  const durFrames = Math.round(durSec * fps);
                  const startSec = Number(curSec.toFixed(2));
                  const startFrame = curFrame;
                  curSec += durSec;
                  curFrame += durFrames;
                  return {
                    ...s,
                    start_sec: startSec,
                    duration_sec: durSec,
                    end_sec: Number(curSec.toFixed(2)),
                    start_frame: startFrame,
                    duration_frames: durFrames,
                  };
                });
                setScenes(updatedScenes);
                const calculatedFrames = updatedScenes.reduce((acc, sc) => acc + (sc.duration_frames || 150), 0);
                if (setDurationInFrames) setDurationInFrames(calculatedFrames);
                return;
              }

              // 2. Move & Resize FX / Shader Items (Clamped to Video Duration & Synced to Canvas)
              if (itemId.startsWith('fx_')) {
                const safeStart = Math.max(0, Math.min(Math.max(0, totalDurationSec - 0.2), newStart));
                const safeDur = Math.max(0.2, Math.min(totalDurationSec - safeStart, newDur));
                const safeEnd = safeStart + safeDur;

                setTimelineEffects((prev) => {
                  const existing = prev.find((fx) => fx.id === itemId);
                  if (existing) {
                    return prev.map((fx) =>
                      fx.id === itemId
                        ? { ...fx, startTime: safeStart, duration: safeDur, endTime: safeEnd }
                        : fx
                    );
                  }
                  if (itemId.startsWith('fx_trans_')) {
                    const sId = parseInt(itemId.replace('fx_trans_', ''), 10);
                    const targetScene = scenes.find((s, idx) => s.scene_id === sId || idx + 1 === sId);
                    const shName = (targetScene as any)?.shader_name || (targetScene as any)?.transition_out?.shader_name || 'Crossfade';
                    return [
                      ...prev,
                      {
                        id: itemId,
                        name: `⚡ ${shName}`,
                        effectId: itemId,
                        shaderName: shName,
                        startTime: safeStart,
                        duration: safeDur,
                        endTime: safeEnd,
                        trackIndex: 0,
                      },
                    ];
                  }
                  return prev;
                });

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
                              duration: safeDur,
                              start_time: safeStart,
                            },
                          };
                        }
                        return s;
                      })
                    );
                  }
                }
                return;
              }

              // 3. Move & Resize Caption Segment (Word-level Karaoke Highlight Scale & Live Canvas Sync)
              if (itemId.startsWith('cap_')) {
                const capIdx = parseInt(itemId.replace('cap_', ''), 10);
                if (!isNaN(capIdx) && captionSegments && captionSegments[capIdx]) {
                  const prevSeg = captionSegments[capIdx];
                  const safeStart = Math.max(0, Math.min(Math.max(0, totalDurationSec - 0.2), newStart));
                  const safeDur = Math.max(0.2, Math.min(totalDurationSec - safeStart, newDur));
                  const safeEnd = safeStart + safeDur;
                  const oldStart = prevSeg.start ?? 0;
                  const oldEnd = prevSeg.end ?? (oldStart + 1.5);
                  const oldDur = Math.max(0.01, oldEnd - oldStart);
                  const scaleRatio = safeDur / oldDur;

                  // Co giãn tỷ lệ mốc thời gian của từng từ cho hiệu ứng Karaoke Highlight
                  const updatedWords = (prevSeg.words || []).map((w: any) => ({
                    ...w,
                    start: Number((safeStart + (w.start - oldStart) * scaleRatio).toFixed(2)),
                    end: Number((safeStart + (w.end - oldStart) * scaleRatio).toFixed(2)),
                  }));

                  const updatedSeg: CaptionSegment = {
                    ...prevSeg,
                    start: Number(safeStart.toFixed(2)),
                    end: Number(safeEnd.toFixed(2)),
                    words: updatedWords,
                  };

                  const newSegments = [...captionSegments];
                  newSegments[capIdx] = updatedSeg;
                  setCaptionSegments(newSegments);

                  if (subtitleMode === 'translated') {
                    setTranslatedCaptionSegments(newSegments);
                  } else {
                    setOriginalCaptionSegments(newSegments);
                  }
                }
                return;
              }

              // 4. Move & Resize Audio Track (CapCut Audio Windowing & Master Clock Sync)
              if (itemId === 'bgm_main' || itemId.startsWith('audio_')) {
                const safeStart = Math.max(0, Math.min(Math.max(0, totalDurationSec - 0.2), newStart));
                const safeDur = Math.max(0.2, Math.min(totalDurationSec - safeStart, newDur));
                setAudioTrim({
                  startTime: safeStart,
                  duration: safeDur,
                });
                setVoiceStartSec?.(safeStart);
                setVoiceDurationSec?.(safeDur);
                setBgmStartSec?.(safeStart);
                setBgmDurationSec?.(safeDur);
                return;
              }
            }}
            onUpdateItemEnd={(itemId) => {
              if (itemId.startsWith('media_')) {
                updateScenesWithHistory(scenes);
                setSyncStatusMsg('Đã đồng bộ vị trí & thời lượng Scene!');
                setTimeout(() => setSyncStatusMsg(null), 2000);
              } else if (itemId.startsWith('fx_')) {
                setSyncStatusMsg('Đã đồng bộ vị trí & thời lượng FX!');
                setTimeout(() => setSyncStatusMsg(null), 2000);
              } else if (itemId.startsWith('cap_')) {
                setSyncStatusMsg('Đã đồng bộ thời gian phụ đề & nhịp Karaoke!');
                setTimeout(() => setSyncStatusMsg(null), 2000);
              } else if (itemId === 'bgm_main' || itemId.startsWith('audio_')) {
                setSyncStatusMsg('Đã đồng bộ cửa sổ phát Audio!');
                setTimeout(() => setSyncStatusMsg(null), 2000);
              }
            }}
          />
        )}
      </footer>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. MODALS (REGENERATE SCENE WITH 3 POINTS, EXPORT VIDEO, EXPORT PROGRESS) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <RegenerateSceneModal
        scene={sceneToRegenerate}
        isOpen={Boolean(sceneToRegenerate)}
        isRegenerating={isRegeneratingScene}
        prompt={regeneratePrompt}
        onPromptChange={setRegeneratePrompt}
        onSubmit={handleRegenerateSceneSubmit}
        onClose={() => setSceneToRegenerate(null)}
        visualStyle={visualStyle}
      />

      <ExportVideoModal
        isOpen={showExportModal}
        onClose={() => {
          if (previewAudioRef.current) {
            previewAudioRef.current.pause();
            previewAudioRef.current = null;
          }
          setPreviewPlayingAudioId(null);
          setShowExportModal(false);
        }}
        availableAudioTracks={availableAudioTracks}
        selectedAudioUrl={selectedExportAudioUrl}
        onSelectAudioUrl={setSelectedExportAudioUrl}
        selectedAspectRatio={selectedExportAspectRatio}
        onSelectAspectRatio={setSelectedExportAspectRatio}
        selectedResolution={selectedExportResolution}
        onSelectResolution={setSelectedExportResolution}
        selectedBgColor={selectedExportBgColor}
        onSelectBgColor={setSelectedExportBgColor}
        bgThemes={BG_THEMES}
        previewPlayingAudioId={previewPlayingAudioId}
        onToggleAudioPreview={toggleAudioPreview}
        onStartExport={(audioUrl, ratio, bg) => {
          if (previewAudioRef.current) {
            previewAudioRef.current.pause();
            previewAudioRef.current = null;
          }
          setPreviewPlayingAudioId(null);
          handleDownloadVideoMP4(audioUrl, ratio, bg);
        }}
      />

      <ExportProgressModal
        isExporting={isExporting}
        exportStatusText={exportStatusText}
        exportElapsedSec={exportElapsedSec}
        exportProgress={exportProgress}
      />

      {/* PROJECT INFO MODAL */}
      {showProjectInfoModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowProjectInfoModal(false)}
        >
          <div
            className="relative z-10 w-full max-w-md bg-[#121624] border border-[#2B334B] rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">
                  Thông Tin Chi Tiết Dự Án
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectInfoModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl text-xs space-y-2.5 bg-slate-900/80 border border-slate-800 text-slate-300 font-medium">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Mã Dự Án (ID)</span>
                <span className="font-mono text-cyan-400 font-bold">{projectId || (projectData as any)?.project_id || 'N/A'}</span>
              </div>
              {((projectData as any)?.title || (projectData as any)?.topic) && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Tiêu Đề (Title)</span>
                  <span className="font-bold text-white max-w-[220px] truncate text-right">
                    {(projectData as any)?.title || (projectData as any)?.topic}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Phong Cách Diễn Hoạt</span>
                <span className="font-bold text-white uppercase text-[11px] bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                  {visualStyle}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Tổng Số Scenes</span>
                <span className="font-bold text-white">{scenes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Thời Lượng Video</span>
                <span className="font-bold text-cyan-400">
                  {Math.round(totalDurationSec)}s ({Math.round(totalDurationSec * 30)} frames)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Tỉ Lệ Khung Hình</span>
                <span className="font-bold text-cyan-400">{aspectRatio}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Chế Độ Âm Thanh</span>
                <span className="font-bold text-slate-200">
                  {isCommercialMusicStyle ? 'Nhạc nền (BGM)' : 'Giọng đọc AI (Voiceover)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Sync Animation</span>
                <span className={`font-bold ${isAnimationSyncableTemplate ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isAnimationSyncableTemplate ? 'Hỗ trợ đồng bộ' : 'Không áp dụng'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProjectInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs hover:brightness-110 transition-all shadow-md active:scale-98"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* TOP UP / UPGRADE POINTS MODAL */}
      <WynMotionUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => {
          setIsUpgradeModalOpen(false);
          refetchPoints?.();
        }}
        defaultTab="points"
      />

      {/* WHISPER & DEEPSEEK CAPTION REVIEW & TRANSLATE MODAL */}
      <CaptionReviewModal
        isOpen={isCaptionReviewModalOpen}
        onClose={() => setIsCaptionReviewModalOpen(false)}
        audioUrl={selectedExportAudioUrl || remotionAudioSrc || audioUrl}
        originalLanguage={captionOriginalLang}
        segments={originalCaptionSegments.length > 0 ? originalCaptionSegments : captionSegments}
        initialTranslatedSegments={translatedCaptionSegments.length > 0 ? translatedCaptionSegments : null}
        initialTargetLang={captionTargetLang}
        initialActiveMode={subtitleMode}
        projectId={projectId}
        onSeek={(sec) => seekTo(Math.round(sec * fps))}
        onSaveOriginal={handleSaveOriginalCaptions}
        onSaveTranslated={handleSaveTranslatedCaptions}
      />
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
