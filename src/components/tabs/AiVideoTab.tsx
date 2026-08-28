'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Check,
  Globe,
  Loader2,
  Mic,
  Play,
  Pause,
  ChevronRight,
  Plus,
  LayoutGrid,
  Bell,
  LogIn,
  Crown,
  Film,
  Layers,
  FileText,
  Sliders,
  Users,
  Clock,
  X,
  Upload,
  Volume2,
  CheckCircle2,
  RefreshCw,
  Timer,
  MessageSquare,
  Atom,
  Calculator,
  Compass,
  Zap,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { WynMotionCreationModal } from '../video/WynMotionCreationModal';
import {
  wynmotionService,
  MotionProject,
  MotionVisualStyle,
  CharacterSubtype,
  DialogueSpeakerConfig,
  DialogueTurn,
  calculateProjectPoints,
} from '@/services/wynmotionService';
import { HeroBackground } from '@/components/video/HeroBackground';
import {
  WhiteboardStreamIcon,
  DoodleQuickIcon,
  AppleModernMotionIcon,
  MascotCharacterIcon,
  CharacterAnimationIcon,
  DialogueSceneIcon,
  ScienceExplainerIcon,
  ProductAdsIcon,
  StrobeTeaserIcon,
  CinematicShowcaseIcon,
  VideoNewsIcon,
} from '@/components/video/MotionStyleIcons';
import { ProfileSidePanel } from '@/components/navigation/ProfileSidePanel';
import { LoginModal } from '@/components/auth/LoginModal';
import { DualVoiceSelectorModal } from '@/components/video/DualVoiceSelectorModal';
import { DialogueScriptEditor } from '@/components/video/DialogueScriptEditor';
import { MobileVideoEditorStudio } from '@/components/video/MobileVideoEditorStudio';
import { CapCutTemplateModal } from '@/components/video/CapCutTemplateModal';
import { CapCutGalleryModal } from '@/components/video/CapCutGalleryModal';

// ── EXACT WEB DATA CONSTANTS (100% Parity with https://www.wynai.pro/app/wynmotion-ai) ──

export const AUDIO_STUDIO_LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'zh', name: '中文 (Mandarin)', flag: '🇨🇳' },
  { code: 'kr', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ms', name: 'Melayu', flag: '🇲🇾' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇧🇩' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const VIENEU_NORTHERN_VOICES = [
  { code: 'Phạm Tuyên', name: 'Phạm Tuyên', desc: 'Giọng Bắc · Tự nhiên', tag: 'Phổ biến nhất' },
  { code: 'Minh Đức', name: 'Minh Đức', desc: 'Giọng Bắc · Tin tức', tag: 'Sư phạm' },
  { code: 'Thanh Bình', name: 'Thanh Bình', desc: 'Giọng Bắc · Kể chuyện', tag: 'Kể chuyện' },
  { code: 'Trúc Ly', name: 'Trúc Ly', desc: 'Giọng Bắc · Tự nhiên', tag: 'Tự nhiên' },
  { code: 'Đoan Trang', name: 'Đoan Trang', desc: 'Giọng Bắc · Tự nhiên', tag: 'Nhẹ nhàng' },
  { code: 'Ngọc Linh', name: 'Ngọc Linh', desc: 'Giọng Bắc · Kể chuyện', tag: 'Truyền cảm' },
  { code: 'Mai Anh', name: 'Mai Anh', desc: 'Giọng Bắc · Tin tức', tag: 'Thời sự' },
];

export const VIENEU_CENTRAL_VOICES = [
  { code: 'Quang Sơn', name: 'Quang Sơn', desc: 'Giọng Trung · Tự nhiên', tag: 'Miền Trung' },
  { code: 'Ngọc Trân', name: 'Ngọc Trân', desc: 'Giọng Trung · Tự nhiên', tag: 'Miền Trung' },
];

export const VIENEU_SOUTHERN_VOICES = [
  { code: 'Xuân Vĩnh', name: 'Xuân Vĩnh', desc: 'Giọng Nam · Tự nhiên', tag: 'Miền Nam' },
  { code: 'Thái Sơn', name: 'Thái Sơn', desc: 'Giọng Nam · Kể chuyện', tag: 'Kể chuyện' },
  { code: 'Minh Triết', name: 'Minh Triết', desc: 'Giọng Nam · Tin tức', tag: 'Thời sự' },
  { code: 'Thục Đoan', name: 'Thục Đoan', desc: 'Giọng Nam · Kể chuyện', tag: 'Truyền cảm' },
  { code: 'Thùy Dung', name: 'Thùy Dung', desc: 'Giọng Nam · Tin tức', tag: 'Tin tức' },
];

export const KOKORO_FEMALE_VOICES = [
  // US & UK English
  { code: 'af_bella', name: 'Bella', desc: 'US Female 🇺🇸 · Clear', tag: 'Top Pick' },
  { code: 'af_nicole', name: 'Nicole', desc: 'US Female 🇺🇸 · Studio', tag: 'Clear' },
  { code: 'af_sarah', name: 'Sarah', desc: 'US Female 🇺🇸 · Natural', tag: 'Natural' },
  { code: 'af_sky', name: 'Sky', desc: 'US Female 🇺🇸 · Youthful', tag: 'Youth' },
  { code: 'af_heart', name: 'Heart', desc: 'US Female 🇺🇸 · Warm', tag: 'Expressive' },
  { code: 'bf_isabella', name: 'Isabella', desc: 'UK Female 🇬🇧 · Academic', tag: 'Academic' },
  { code: 'bf_emma', name: 'Emma', desc: 'UK Female 🇬🇧 · British', tag: 'British' },
  // Mandarin Chinese 🇨🇳
  { code: 'zf_xiaobei', name: 'Xiaobei (小北)', desc: 'Mandarin Female 🇨🇳 · Clear', tag: 'Top Pick' },
  { code: 'zf_xiaoni', name: 'Xiaoni (小妮)', desc: 'Mandarin Female 🇨🇳 · Sweet', tag: 'Sweet' },
  { code: 'zf_xiaoxiao', name: 'Xiaoxiao (小小)', desc: 'Mandarin Female 🇨🇳 · Natural', tag: 'Natural' },
  { code: 'zf_yunjian', name: 'Yunjian (云间)', desc: 'Mandarin Female 🇨🇳 · Soft', tag: 'Soft' },
  // Japanese 🇯🇵
  { code: 'jf_alpha', name: 'Alpha (アルファ)', desc: 'Japanese Female 🇯🇵 · Standard', tag: 'Top Pick' },
  { code: 'jf_gongitsune', name: 'Gongitsune (ごんぎつね)', desc: 'Japanese Female 🇯🇵 · Story', tag: 'Story' },
  { code: 'jf_nezumi', name: 'Nezumi (ねずみ)', desc: 'Japanese Female 🇯🇵 · Sweet', tag: 'Sweet' },
  { code: 'jf_tebukuro', name: 'Tebukuro (手袋)', desc: 'Japanese Female 🇯🇵 · Soft', tag: 'Soft' },
  // Korean 🇰🇷
  { code: 'kf_sarah', name: 'Sarah (세라)', desc: 'Korean Female 🇰🇷 · K-Style', tag: 'Top Pick' },
  // European & Global
  { code: 'ef_dora', name: 'Dora', desc: 'Spanish Female 🇪🇸 · Clear', tag: 'Spanish' },
  { code: 'ff_siwis', name: 'Siwis', desc: 'French Female 🇫🇷 · Elegant', tag: 'French' },
  { code: 'if_sara', name: 'Sara', desc: 'Italian Female 🇮🇹 · Expressive', tag: 'Italian' },
  { code: 'pf_dora', name: 'Dora', desc: 'Portuguese Female 🇧🇷 · Natural', tag: 'Portuguese' },
  { code: 'hf_alpha', name: 'Alpha', desc: 'Hindi Female 🇮🇳 · Standard', tag: 'Hindi' },
];

export const KOKORO_MALE_VOICES = [
  // US & UK English
  { code: 'am_adam', name: 'Adam', desc: 'US Male 🇺🇸 · Standard', tag: 'Top Pick' },
  { code: 'am_michael', name: 'Michael', desc: 'US Male 🇺🇸 · Deep', tag: 'Deep' },
  { code: 'am_echo', name: 'Echo', desc: 'US Male 🇺🇸 · Warm', tag: 'Warm' },
  { code: 'am_eric', name: 'Eric', desc: 'US Male 🇺🇸 · Energetic', tag: 'Dynamic' },
  { code: 'am_fenrir', name: 'Fenrir', desc: 'US Male 🇺🇸 · Dramatic', tag: 'Story' },
  { code: 'am_liam', name: 'Liam', desc: 'US Male 🇺🇸 · Friendly', tag: 'Friendly' },
  { code: 'am_onyx', name: 'Onyx', desc: 'US Male 🇺🇸 · Strong', tag: 'Strong' },
  { code: 'am_puck', name: 'Puck', desc: 'US Male 🇺🇸 · Expressive', tag: 'Expressive' },
  { code: 'bm_george', name: 'George', desc: 'UK Male 🇬🇧 · Narrative', tag: 'Story' },
  { code: 'bm_lewis', name: 'Lewis', desc: 'UK Male 🇬🇧 · British', tag: 'British' },
  // Mandarin Chinese 🇨🇳
  { code: 'zm_yunjian', name: 'Yunjian (云健)', desc: 'Mandarin Male 🇨🇳 · Standard', tag: 'Top Pick' },
  // Japanese 🇯🇵
  { code: 'jm_kumo', name: 'Kumo (クモ)', desc: 'Japanese Male 🇯🇵 · Crisp', tag: 'Top Pick' },
  // Korean 🇰🇷
  { code: 'km_joon', name: 'Joon (준)', desc: 'Korean Male 🇰🇷 · K-Style', tag: 'Top Pick' },
  // European & Global
  { code: 'em_alex', name: 'Alex', desc: 'Spanish Male 🇪🇸 · Warm', tag: 'Spanish' },
  { code: 'im_nicola', name: 'Nicola', desc: 'Italian Male 🇮🇹 · Expressive', tag: 'Italian' },
  { code: 'pm_alex', name: 'Alex', desc: 'Portuguese Male 🇧🇷 · Clear', tag: 'Portuguese' },
  { code: 'hm_omega', name: 'Omega', desc: 'Hindi Male 🇮🇳 · Standard', tag: 'Hindi' },
];

export const GEMINI_MALE_VOICES = [
  { code: 'Puck', name: 'Puck', desc: 'Male ♂️ · Energetic', tag: 'Expressive' },
  { code: 'Charon', name: 'Charon', desc: 'Male ♂️ · Deep & Calm', tag: 'Deep' },
  { code: 'Fenrir', name: 'Fenrir', desc: 'Male ♂️ · Dramatic', tag: 'Story' },
  { code: 'Orus', name: 'Orus', desc: 'Male ♂️ · Professional', tag: 'Teacher' },
  { code: 'Enceladus', name: 'Enceladus', desc: 'Male ♂️ · Soft & Warm', tag: 'Soft' },
  { code: 'Iapetus', name: 'Iapetus', desc: 'Male ♂️ · Narrative', tag: 'Narrative' },
  { code: 'Alnilam', name: 'Alnilam', desc: 'Male ♂️ · Natural Tone', tag: 'Natural' },
  { code: 'Gacrux', name: 'Gacrux', desc: 'Male ♂️ · Crisp Articulation', tag: 'Crisp' },
];

export const GEMINI_FEMALE_VOICES = [
  { code: 'Kore', name: 'Kore', desc: 'Female ♀️ · Sweet & Warm', tag: 'Top Pick' },
  { code: 'Aoede', name: 'Aoede', desc: 'Female ♀️ · Clear & Expressive', tag: 'Expressive' },
  { code: 'Leda', name: 'Leda', desc: 'Female ♀️ · Gentle Storyteller', tag: 'Story' },
  { code: 'Zephyr', name: 'Zephyr', desc: 'Female ♀️ · Calm & Academic', tag: 'Academic' },
  { code: 'Despina', name: 'Despina', desc: 'Female ♀️ · Friendly Host', tag: 'Friendly' },
];

export const KOKORO_DEFAULT_VOICE_MAP: Record<string, { female: string; male: string }> = {
  'en-US': { female: 'af_bella', male: 'am_adam' },
  'en-GB': { female: 'bf_emma', male: 'bm_george' },
  'ja': { female: 'jf_alpha', male: 'jm_kumo' },
  'zh': { female: 'zf_xiaobei', male: 'zm_yunjian' },
  'cmn': { female: 'zf_xiaobei', male: 'zm_yunjian' },
  'kr': { female: 'kf_sarah', male: 'km_joon' },
  'ko': { female: 'kf_sarah', male: 'km_joon' },
  'es': { female: 'ef_dora', male: 'em_alex' },
  'fr': { female: 'ff_siwis', male: 'ff_siwis' },
  'it': { female: 'if_sara', male: 'im_nicola' },
  'pt-BR': { female: 'pf_dora', male: 'pm_alex' },
  'hi': { female: 'hf_alpha', male: 'hm_omega' },
  'vi': { female: 'Trúc Ly', male: 'Phạm Tuyên' },
};

export const AUDIO_READING_STYLES = [
  { code: 'tu_nhien', nameVi: '🗣️ Tự nhiên / Đàm thoại', nameEn: '🗣️ Natural / Conversational' },
  { code: 'tin_tuc', nameVi: '📰 Đọc bản tin / Thời sự', nameEn: '📰 News / Formal' },
  { code: 'doc_truyen', nameVi: '📖 Kể chuyện / Sách nói', nameEn: '📖 Storytelling / Audiobook' },
];

export const AiVideoTab: React.FC = () => {
  const { isVietnamese, isDark, setIsStudioOpen, t, setActiveTab } = useApp();
  const { user } = useWordaiAuth();

  // ── Mobile Editor Project ──
  const [activeEditorProject, setActiveEditorProject] = useState<MotionProject | null>(null);

  const openProjectInEditor = async (projectOrId: MotionProject | string) => {
    if (typeof projectOrId === 'string') {
      try {
        const res = await wynmotionService.getProject(projectOrId);
        if (res.success && res.project) {
          setActiveEditorProject(res.project);
          setIsStudioOpen(true);
        }
      } catch (err) {
        console.warn('Could not load project for editor:', err);
      }
    } else {
      setActiveEditorProject(projectOrId);
      setIsStudioOpen(true);
    }
  };

  // Navigation mode: 'home' (CapCut Hub) vs 'studio' (Creation Flow)
  const [viewMode, setViewMode] = useState<'home' | 'studio'>('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // ── Auth Toast Notification (hiển thị khi chưa đăng nhập) ──
  const [authToast, setAuthToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const showAuthToast = (message: string) => {
    setAuthToast({ visible: true, message });
    setTimeout(() => setAuthToast({ visible: false, message: '' }), 3500);
  };

  // Wizard Steps: 1 | 2 | 3.1 | 3.2 | 3.3 | 4
  type WizardStep = '1' | '2' | '3.1' | '3.2' | '3.3' | '4';
  const [wizardStep, setWizardStep] = useState<WizardStep>('1');

  // Step 1: Visual Style (6 Styles in 2 Groups)
  const [visualStyle, setVisualStyle] = useState<MotionVisualStyle>('whiteboard_stream_hand');
  const [characterSubtype, setCharacterSubtype] = useState<CharacterSubtype>('full_character');
  const [scienceDomain, setScienceDomain] = useState<'math' | 'physics' | 'chemistry' | 'biology' | 'cs'>('physics');

  // Step 2: Prompt / Concept
  const [prompt, setPrompt] = useState(
    isVietnamese
      ? 'Mô phỏng chu trình quang hợp của cây xanh trong tự nhiên và vai trò của ánh sáng mặt trời'
      : 'Simulate the photosynthesis process of green plants and the role of sunlight',
  );

  // Step 3: Audio Source Tab ('agent' vs 'upload')
  const [audioMode, setAudioMode] = useState<'agent' | 'upload'>('agent');

  // Step 3.1: Voice Setup (Single Voice)
  const [selectedLang, setSelectedLang] = useState(isVietnamese ? 'vi' : 'en-US');
  const [voiceModel, setVoiceModel] = useState<'wynai' | 'gemini'>('wynai');
  const [selectedVoiceName, setSelectedVoiceName] = useState(isVietnamese ? 'Phạm Tuyên' : 'af_bella');
  const [readingStyle, setReadingStyle] = useState('tu_nhien');
  const [vietnameseRegion, setVietnameseRegion] = useState<'all' | 'north' | 'central' | 'south'>('all');

  // Step 3.1: Dual Voice Setup for Dialogue Scene
  const [speakerA, setSpeakerA] = useState<DialogueSpeakerConfig>({
    name: isVietnamese ? 'Trúc Ly' : 'Sarah',
    gender: 'female',
    voice_engine: 'wynai',
    voice_name: isVietnamese ? 'Trúc Ly' : 'af_bella',
    language_code: isVietnamese ? 'vi' : 'en-US',
  });
  const [speakerB, setSpeakerB] = useState<DialogueSpeakerConfig>({
    name: isVietnamese ? 'Phạm Tuyên' : 'Tom',
    gender: 'male',
    voice_engine: 'wynai',
    voice_name: isVietnamese ? 'Phạm Tuyên' : 'am_adam',
    language_code: isVietnamese ? 'vi' : 'en-US',
  });
  const [isDualVoiceModalOpen, setIsDualVoiceModalOpen] = useState(false);
  const [activeSpeakerModalRole, setActiveSpeakerModalRole] = useState<'A' | 'B'>('A');

  // Step 3.2: Audience & Style & Length
  const [targetAudience, setTargetAudience] = useState<'kids' | 'teen' | 'adult'>('teen');
  const [scriptStyle, setScriptStyle] = useState<'explainer' | 'storytelling' | 'humorous' | 'scientific'>('explainer');
  const [maxChars, setMaxChars] = useState<number>(500); // 500 | 750 | 1100 | 1800 (for science)

  // Step 3.3: Narration Script & Synthesis
  const [scriptMode, setScriptMode] = useState<'ai_auto' | 'custom'>('ai_auto');
  const [customNarrationText, setCustomNarrationText] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [dialogueTurns, setDialogueTurns] = useState<DialogueTurn[]>([
    { id: '1', speaker: 'A', text: 'Hey Tom, how was your weekend?' },
    { id: '2', speaker: 'B', text: 'It was great! I went hiking in the mountains.' },
    { id: '3', speaker: 'A', text: 'That sounds amazing! Did you take any photos?' },
    { id: '4', speaker: 'B', text: 'Yes, lots of beautiful scenic pictures!' },
  ]);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDurationSec, setAudioDurationSec] = useState<number>(30);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);
  const [audioTimerSec, setAudioTimerSec] = useState<number>(0);

  // Uploaded audio
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Step 4: Aspect Ratio & Launch
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [creationStage, setCreationStage] = useState<'idle' | 'scripting' | 'drawing' | 'syncing' | 'done'>('idle');
  const [createdProject, setCreatedProject] = useState<MotionProject | null>(null);

  // Product Ads States (Style 7)
  const [productImages, setProductImages] = useState<string[]>([]);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);
  const [hookText, setHookText] = useState('');
  const [priceText, setPriceText] = useState('ƯU ĐÃI');
  const [ctaText, setCtaText] = useState('MUA NGAY');
  const [capcutModalTemplate, setCapcutModalTemplate] = useState<'ads_strobe_teaser' | 'ads_cinematic_showcase' | 'product_ads_motion' | null>(null);
  const [isCapCutGalleryOpen, setIsCapCutGalleryOpen] = useState(false);

  // Video News 60s States
  const [newsInputMode, setNewsInputMode] = useState<'url' | 'text'>('url');
  const [newsUrlInput, setNewsUrlInput] = useState('');
  const [newsRawTextInput, setNewsRawTextInput] = useState('');
  const [isSummarizingNews, setIsSummarizingNews] = useState(false);
  const [newsHeadline, setNewsHeadline] = useState('');
  const [newsCategory, setNewsCategory] = useState('THỜI SỰ');
  const [newsTickerText, setNewsTickerText] = useState('BẢN TIN NÓNG 60S • CẬP NHẬT MỚI NHẤT LIÊN TỤC • ĐĂNG KÝ KÊNH ĐỂ THEO DÕI');
  const [newsImages, setNewsImages] = useState<string[]>([]);
  const [newsScenes, setNewsScenes] = useState<any[]>([]);

  const handleSummarizeNews = async () => {
    if (newsInputMode === 'url' && !newsUrlInput.trim()) {
      alert(isVietnamese ? 'Vui lòng dán link bài báo cần tóm tắt.' : 'Please paste an article URL.');
      return;
    }
    if (newsInputMode === 'text' && !newsRawTextInput.trim()) {
      alert(isVietnamese ? 'Vui lòng nhập hoặc dán nội dung tin tức.' : 'Please enter news content.');
      return;
    }

    setIsSummarizingNews(true);
    try {
      const res = await wynmotionService.summarizeNews({
        url: newsInputMode === 'url' ? newsUrlInput.trim() : undefined,
        text: newsInputMode === 'text' ? newsRawTextInput.trim() : undefined,
        language: selectedLang.startsWith('vi') ? 'vi' : 'en',
      });

      if (res.headline) setNewsHeadline(res.headline);
      if (res.category) setNewsCategory(res.category);
      if (res.ticker_text) setNewsTickerText(res.ticker_text);
      if (res.full_voice_script) {
        setPrompt(res.full_voice_script);
        setCustomNarrationText(res.full_voice_script);
      }
      if (res.crawled_images && res.crawled_images.length > 0) {
        setNewsImages(res.crawled_images.slice(0, 4));
      }
      if (res.scenes) {
        setNewsScenes(res.scenes);
      }
    } catch (err: any) {
      console.error('News summarization error:', err);
      alert(err.message || (isVietnamese ? 'Lỗi tóm tắt tin tức' : 'Failed to summarize news'));
    } finally {
      setIsSummarizingNews(false);
    }
  };

  // 10-Minute Countdown & Minimize-to-Background State
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isCreationMinimized, setIsCreationMinimized] = useState(false);
  const [creationStatusMessage, setCreationStatusMessage] = useState('Đang khởi tạo tiến trình...');
  const [creationProgressPercent, setCreationProgressPercent] = useState(10);
  const [creationCountdownSec, setCreationCountdownSec] = useState(600);
  const [creationError, setCreationError] = useState<string | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Recent Projects
  const [recentProjects, setRecentProjects] = useState<MotionProject[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── CapCut State Persistence: Auto-restore Draft ──
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('wynmotion_wizard_draft');
      if (savedDraft) {
        const d = JSON.parse(savedDraft);
        if (d.prompt) setPrompt(d.prompt);
        if (d.visualStyle) setVisualStyle(d.visualStyle);
        if (d.characterSubtype) setCharacterSubtype(d.characterSubtype);
        if (d.scienceDomain) setScienceDomain(d.scienceDomain);
        if (d.selectedLang) setSelectedLang(d.selectedLang);
        if (d.voiceModel) setVoiceModel(d.voiceModel);
        if (d.selectedVoiceName) setSelectedVoiceName(d.selectedVoiceName);
        if (d.speakerA) setSpeakerA(d.speakerA);
        if (d.speakerB) setSpeakerB(d.speakerB);
        if (d.dialogueTurns) setDialogueTurns(d.dialogueTurns);
        if (d.readingStyle) setReadingStyle(d.readingStyle);
        if (d.targetAudience) setTargetAudience(d.targetAudience);
        if (d.scriptStyle) setScriptStyle(d.scriptStyle);
        if (d.maxChars) setMaxChars(d.maxChars);
        if (d.scriptMode) setScriptMode(d.scriptMode);
        if (d.customNarrationText) setCustomNarrationText(d.customNarrationText);
        if (d.scriptText) setScriptText(d.scriptText);
        if (d.audioUrl) setAudioUrl(d.audioUrl);
        if (d.audioDurationSec) setAudioDurationSec(d.audioDurationSec);
        if (d.aspectRatio) setAspectRatio(d.aspectRatio);
      }

      // Check if navigated here from Library with a specific projectId to open
      try {
        const pendingProjectId = sessionStorage.getItem('wynmotion_open_project_id');
        if (pendingProjectId) {
          sessionStorage.removeItem('wynmotion_open_project_id');
          openProjectInEditor(pendingProjectId);
        }
      } catch {}
    } catch {}

    // Listen for open-project events dispatched from Library tab
    const handleOpenProjectEvent = (e: Event) => {
      const { projectId } = (e as CustomEvent).detail || {};
      if (projectId) openProjectInEditor(projectId);
    };
    window.addEventListener('wynmotion:open-project', handleOpenProjectEvent);

    // Listen for use-audio events dispatched from Library tab
    const handleUseAudioEvent = (e: Event) => {
      const { audioUrl: url, audioName: name } = (e as CustomEvent).detail || {};
      if (url) {
        setAudioUrl(url);
        setUploadedFileName(name || 'Library Audio');
        if (name && !prompt) {
          setPrompt(name.replace(/\.[^/.]+$/, ''));
        }
        const temp = new Audio(url);
        temp.addEventListener('loadedmetadata', () => {
          if (temp.duration && isFinite(temp.duration)) {
            setAudioDurationSec(temp.duration);
          }
        });
      }
    };
    window.addEventListener('wynmotion:use-audio', handleUseAudioEvent);

    return () => {
      window.removeEventListener('wynmotion:open-project', handleOpenProjectEvent);
      window.removeEventListener('wynmotion:use-audio', handleUseAudioEvent);
    };
  }, []);

  // ── User-scoped Recent Projects — re-fetch whenever user changes (login/logout) ──
  useEffect(() => {
    if (!user) {
      // Chưa đăng nhập: xoá list → hiện sample placeholders
      setRecentProjects([]);
      return;
    }

    // Đăng nhập: load cache riêng theo uid trước, rồi fetch mới từ API
    const cacheKey = `wynmotion_cached_projects_${user.uid}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) setRecentProjects(JSON.parse(cached));
    } catch {}

    wynmotionService
      .listProjects()
      .then((res) => {
        if (res.projects && res.projects.length > 0) {
          setRecentProjects(res.projects);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(res.projects));
          } catch {}
        } else {
          // API trả rỗng (user mới) — clear stale cache
          setRecentProjects([]);
          try { localStorage.removeItem(cacheKey); } catch {}
        }
      })
      .catch(() => {});
  }, [user]);

  // ── Auto-save Draft to LocalStorage ──
  useEffect(() => {
    try {
      const draft = {
        prompt,
        visualStyle,
        characterSubtype,
        scienceDomain,
        selectedLang,
        voiceModel,
        selectedVoiceName,
        speakerA,
        speakerB,
        dialogueTurns,
        readingStyle,
        targetAudience,
        scriptStyle,
        maxChars,
        scriptMode,
        customNarrationText,
        scriptText,
        audioUrl,
        audioDurationSec,
        aspectRatio,
      };
      localStorage.setItem('wynmotion_wizard_draft', JSON.stringify(draft));
    } catch {}
  }, [
    prompt,
    visualStyle,
    characterSubtype,
    scienceDomain,
    selectedLang,
    voiceModel,
    selectedVoiceName,
    speakerA,
    speakerB,
    dialogueTurns,
    readingStyle,
    targetAudience,
    scriptStyle,
    maxChars,
    scriptMode,
    customNarrationText,
    scriptText,
    audioUrl,
    audioDurationSec,
    aspectRatio,
  ]);

  // Audio generation countdown timer (Max 5 mins = 300s)
  useEffect(() => {
    let interval: any;
    if (isGeneratingAudio) {
      setAudioTimerSec(0);
      interval = setInterval(() => {
        setAudioTimerSec((prev) => {
          if (prev >= 300) {
            clearInterval(interval);
            return 300;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setAudioTimerSec(0);
    }
    return () => clearInterval(interval);
  }, [isGeneratingAudio]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sample items shown when no real projects loaded yet (placeholders – click does nothing)
  const SAMPLE_RECENT_ITEMS: any[] = [
    { project_id: '', id: '0815-01', title: isVietnamese ? 'Quang hợp cây xanh' : 'Photosynthesis Cycle', duration_sec: 32 },
    { project_id: '', id: '0815-02', title: isVietnamese ? 'Hội thoại quán Cafe 3D' : 'Cafe Dialogue 3D', duration_sec: 45 },
    { project_id: '', id: '0707-01', title: isVietnamese ? 'Định luật Newton F=ma' : "Newton's Law F=ma", duration_sec: 60 },
    { project_id: '', id: '0704-01', title: isVietnamese ? 'Phỏng vấn xin việc' : 'Job Interview Scene', duration_sec: 50 },
  ];

  // Dynamic Prompt Suggestions tailored for each of the 6 visual styles
  const getPromptSuggestions = () => {
    switch (visualStyle) {
      case 'whiteboard_stream_hand':
        return [
          t('🧠 Sơ đồ tư duy 5 bước xây dựng kỷ luật bản thân & làm chủ thời gian', '🧠 5-step mindmap for building self-discipline & mastering time management'),
          t('💰 6 chiếc hũ tài chính cá nhân giúp quản lý tiền bạc thông minh', '💰 The 6-Jar money management system for smart personal finance'),
          t('📚 Tóm tắt trực quan quy trình bán hàng 7 bước từ tiếp cận đến chốt đơn', '📚 Visual summary of the 7-step sales funnel from prospecting to closing'),
          t('🌱 Mô phỏng chu trình quang hợp & tuần hoàn nước trong tự nhiên', '🌱 Visual whiteboard walkthrough of photosynthesis & water cycle in nature'),
        ];
      case 'handdrawn_fast_doodle':
        return [
          t('☕ Thói quen buổi sáng 15 phút giúp khởi đầu ngày mới tràn đầy năng lượng', '☕ 15-minute mindful morning routine to kickstart a productive day'),
          t('📖 Hành trình vượt qua nỗi sợ thất bại của một nhà sáng lập khởi nghiệp', '📖 An inspiring journey of a startup founder overcoming the fear of failure'),
          t('🌿 4 nguyên tắc sống tối giản (Minimalism) để tâm trí luôn an yên', '🌿 4 principles of minimalism for a peaceful and clutter-free mind'),
          t('🎨 Câu chuyện đằng sau sự ra đời của những bức danh họa thế giới', '🎨 The story behind the creation of world-famous master paintings'),
        ];
      case 'apple_modern_motion':
        return [
          t('⚡ Giới thiệu tính năng AI Agent tự động hóa quy trình làm việc với đồ thị 3D', '⚡ Introducing Autonomous AI Agents workflow automation with 3D UI cards'),
          t('📊 Báo cáo tăng trưởng doanh thu SaaS Q3 với bảng điều khiển trực quan', '📊 SaaS Q3 revenue growth report with interactive dashboard analytics'),
          t('🔒 Kiến trúc bảo mật đám mây Zero-Trust & cơ chế mã hóa đầu cuối', '🔒 Zero-Trust cloud security architecture & end-to-end encryption mechanics'),
          t('🚀 Pitching sản phẩm công nghệ FinTech mới đến các nhà đầu tư mạo hiểm', '🚀 High-impact investor pitch for a next-gen FinTech mobile application'),
        ];
      case 'dialogue_scene':
        return [
          t('☕ Hội thoại đối đáp gọi món & làm quen bạn mới tại quán cà phê', '☕ Conversational ordering & making new friends at a cozy coffee shop'),
          t('💼 Buổi phỏng vấn xin việc vị trí Senior Product Manager tại công ty công nghệ', '💼 Job interview roleplay for Senior Product Manager at a tech company'),
          t('✈️ Tình huống hỏi đường, đổi vé & check-in tại sân bay quốc tế', '✈️ Airport roleplay: asking for directions, rebooking & flight check-in'),
          t('🎓 Tranh luận giữa 2 chuyên gia về tương lai của Generative AI và con người', '🎓 Expert podcast debate: The future of Generative AI vs human workforce'),
        ];
      case 'science_explainer':
        return [
          t('🚀 Định luật II Newton (F = ma) và bài toán chuyển động ném vật trong không gian', "🚀 Newton's Second Law (F = ma) and projectile motion trajectory vectors"),
          t('🧬 Cấu trúc xoắn kép DNA và cơ chế phiên mã, nhân đôi tế bào sinh học', '🧬 DNA double helix structure and cellular transcription replication mechanics'),
          t('📐 Chứng minh Định lý Pytago (a² + b² = c²) bằng mô hình hình học động', '📐 Geometric visual proof of the Pythagorean Theorem (a² + b² = c²)'),
          t('⚗️ Quá trình hình thành liên kết cộng hóa trị phân tử nước (2H₂ + O₂ → 2H₂O)', '⚗️ Covalent bond formation in water molecules (2H₂ + O₂ → 2H₂O)'),
        ];
      case 'character_animation':
        return [
          t('🦊 Chú cáo WynMotion hướng dẫn 3 bí quyết học từ vựng tiếng Anh nhớ lâu', '🦊 WynMotion Fox Mascot presents 3 secrets to supercharge English vocabulary retention'),
          t('🏃 Anh chàng Người Que khám phá 7 kỳ quan thế giới qua lăng kính hài hước', '🏃 Stickman humorous adventures exploring the 7 wonders of the world'),
          t('🌟 Chú robot nhỏ dũng cảm vượt qua thử thách để tìm thấy viên pin năng lượng mặt trời', '🌟 A brave little robot overcoming obstacles to discover clean solar energy'),
          t('🦸‍♂️ Biệt đội siêu nhân nhí giải cứu khu rừng xanh khỏi ô nhiễm môi trường', '🦸‍♂️ Superhero kids mascot team rescuing the green forest from pollution'),
        ];
      case 'product_ads_motion':
        return [
          t('🧋 Trà sữa trân châu đường đen mua 1 tặng 1 duy nhất hôm nay tại quán', '🧋 Brown sugar boba milk tea Buy 1 Get 1 Free today only at the shop'),
          t('🍔 Combo Burger bò phô mai thượng hạng thơm nức giá chỉ 39K', '🍔 Premium juicy cheeseburger combo special offer only 39K'),
          t('✨ Nước hoa Pháp hoàng gia lưu hương quyến rũ 24h - Ưu đãi giảm 50%', '✨ Royal French luxury perfume 24h long-lasting scent - 50% OFF deal'),
          t('👟 Giày sneaker thể thao siêu nhẹ chống nước dẫn đầu xu hướng', '👟 Ultra-light waterproof athletic sneakers leading the trend'),
        ];
      default:
        return [
          t('🌱 Mô phỏng chu trình quang hợp của cây xanh trong tự nhiên', '🌱 Simulate the photosynthesis process of green plants in nature'),
          t('🤖 Giải thích nguyên lý hoạt động của Trí tuệ nhân tạo (AI)', '🤖 Explain how Artificial Intelligence (AI) works step by step'),
          t('📈 Giới thiệu tính năng vượt trội của nền tảng phần mềm mới với đồ thị 3D', '📈 Introduce cutting-edge software features with 3D charts'),
          t('🚀 Câu chuyện truyền cảm hứng của chú robot nhỏ vượt qua thử thách', '🚀 Inspiring journey of a little robot overcoming obstacles'),
        ];
    }
  };

  const getPromptPlaceholder = () => {
    switch (visualStyle) {
      case 'whiteboard_stream_hand':
        return t('Ví dụ: Sơ đồ tư duy 5 bước quản lý thời gian hiệu quả, phác thảo từng mục trên bảng trắng...', 'E.g., 5-step time management mindmap sketched out on a whiteboard...');
      case 'handdrawn_fast_doodle':
        return t('Ví dụ: Câu chuyện thói quen buổi sáng 15 phút vẽ phác chì loang màu nước nhẹ nhàng...', 'E.g., A mindful 15-minute morning routine told through watercolor sketches...');
      case 'apple_modern_motion':
        return t('Ví dụ: Giới thiệu tính năng AI Agent mới với các thẻ kính mờ glassmorphism và biểu đồ 3D...', 'E.g., Introducing new AI Agent features with frosted glass cards & 3D charts...');
      case 'dialogue_scene':
        return t('Ví dụ: Hội thoại phỏng vấn xin việc giữa Nhà tuyển dụng và Ứng viên tại quán cà phê...', 'E.g., Job interview dialogue between recruiter and candidate at a coffee shop...');
      case 'science_explainer':
        return t('Ví dụ: Giải thích Định luật II Newton (F = ma) kèm công thức và vector chuyển động STEM...', 'E.g., Explaining Newton\'s Second Law (F = ma) with formulas and STEM vectors...');
      case 'character_animation':
        return t('Ví dụ: Chú cáo WynMotion / Người Que hướng dẫn mẹo học tiếng Anh siêu tốc...', 'E.g., WynMotion Fox mascot or Stickman presenting rapid language learning tips...');
      case 'product_ads_motion':
        return t('Ví dụ: Quảng cáo Trà sữa trân châu đường đen mua 1 tặng 1, bóc tách ly trà sữa nổi bật kèm hiệu ứng giật nháy CapCut...', 'E.g., Brown sugar boba milk tea buy 1 get 1 free ad with SAM 2 cutout and CapCut flash effects...');
      default:
        return t('Nhập chủ đề chi tiết...', 'Enter detailed topic...');
    }
  };

  const handleLangChange = (langCode: string) => {
    setSelectedLang(langCode);
    if (voiceModel === 'wynai') {
      if (langCode === 'vi') {
        setSelectedVoiceName('Phạm Tuyên');
        setSpeakerA((prev) => ({ ...prev, name: 'Trúc Ly', voice_name: 'Trúc Ly', voice_engine: 'wynai', language_code: 'vi' }));
        setSpeakerB((prev) => ({ ...prev, name: 'Phạm Tuyên', voice_name: 'Phạm Tuyên', voice_engine: 'wynai', language_code: 'vi' }));
      } else {
        const def = KOKORO_DEFAULT_VOICE_MAP[langCode] || { female: 'af_bella', male: 'am_adam' };
        setSelectedVoiceName(def.female);
        setSpeakerA((prev) => ({ ...prev, name: langCode === 'zh' ? 'Xiaobei' : langCode === 'ja' ? 'Alpha' : langCode === 'ko' || langCode === 'kr' ? 'Sarah' : 'Sarah', voice_name: def.female, voice_engine: 'wynai', language_code: langCode }));
        setSpeakerB((prev) => ({ ...prev, name: langCode === 'zh' ? 'Yunjian' : langCode === 'ja' ? 'Kumo' : langCode === 'ko' || langCode === 'kr' ? 'Joon' : 'Tom', voice_name: def.male, voice_engine: 'wynai', language_code: langCode }));
      }
    } else {
      setSpeakerA((prev) => ({ ...prev, voice_name: 'Aoede', voice_engine: 'gemini', language_code: langCode }));
      setSpeakerB((prev) => ({ ...prev, voice_name: 'Puck', voice_engine: 'gemini', language_code: langCode }));
    }
  };

  const handleModelChange = (model: 'wynai' | 'gemini') => {
    setVoiceModel(model);
    if (model === 'wynai') {
      if (selectedLang === 'vi') {
        setSelectedVoiceName('Phạm Tuyên');
        setSpeakerA((prev) => ({ ...prev, voice_name: 'Trúc Ly', voice_engine: 'wynai' }));
        setSpeakerB((prev) => ({ ...prev, voice_name: 'Phạm Tuyên', voice_engine: 'wynai' }));
      } else {
        const def = KOKORO_DEFAULT_VOICE_MAP[selectedLang] || { female: 'af_bella', male: 'am_adam' };
        setSelectedVoiceName(def.female);
        setSpeakerA((prev) => ({ ...prev, voice_name: def.female, voice_engine: 'wynai' }));
        setSpeakerB((prev) => ({ ...prev, voice_name: def.male, voice_engine: 'wynai' }));
      }
    } else {
      setSelectedVoiceName('Puck');
      setSpeakerA((prev) => ({ ...prev, voice_name: 'Aoede', voice_engine: 'gemini' }));
      setSpeakerB((prev) => ({ ...prev, voice_name: 'Puck', voice_engine: 'gemini' }));
    }
  };

  const getDisplayVoiceList = () => {
    if (voiceModel === 'gemini') {
      return [...GEMINI_MALE_VOICES, ...GEMINI_FEMALE_VOICES];
    }
    if (selectedLang === 'vi') {
      if (vietnameseRegion === 'north') return VIENEU_NORTHERN_VOICES;
      if (vietnameseRegion === 'central') return VIENEU_CENTRAL_VOICES;
      if (vietnameseRegion === 'south') return VIENEU_SOUTHERN_VOICES;
      return [...VIENEU_NORTHERN_VOICES, ...VIENEU_CENTRAL_VOICES, ...VIENEU_SOUTHERN_VOICES];
    }
    return [...KOKORO_FEMALE_VOICES, ...KOKORO_MALE_VOICES];
  };

  const handleStartStudio = (initialStyle?: MotionVisualStyle) => {
    // ✅ Auth gate: yêu cầu đăng nhập trước khi vào wizard
    if (!user) {
      showAuthToast(
        isVietnamese
          ? '🔐 Vui lòng đăng nhập để tạo video AI'
          : '🔐 Please sign in to create AI videos',
      );
      setTimeout(() => setIsLoginModalOpen(true), 400);
      return;
    }

    if (initialStyle) {
      setVisualStyle(initialStyle);
      if (initialStyle === 'dialogue_scene') {
        setCharacterSubtype('pixar_3d');
      }
    }
    setWizardStep('1');
    setViewMode('studio');
    setIsStudioOpen(true);
  };

  const handleExitStudio = () => {
    if (confirm(isVietnamese ? 'Bạn có chắc muốn thoát về trang chủ?' : 'Exit back to home?')) {
      setViewMode('home');
      setIsStudioOpen(false);
    }
  };

  const handleTogglePlayAudio = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlayingAudioPreview) {
      audioPlayerRef.current.pause();
      setIsPlayingAudioPreview(false);
    } else {
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play();
      setIsPlayingAudioPreview(true);
    }
  };

  // Audio Generation (Handles both Standard Single Voice & Dialogue Dual Voice)
  const handleGenerateAudio = async () => {
    if (!prompt.trim()) {
      alert(isVietnamese ? 'Vui lòng nhập ý tưởng kịch bản trước' : 'Please enter a prompt idea first');
      return;
    }
    setIsGeneratingAudio(true);
    setIsPlayingAudioPreview(false);

    try {
      if (visualStyle === 'dialogue_scene') {
        // Dual Voice Dialogue Synthesis & Stitching
        const res = await wynmotionService.generateDialogueAudio({
          prompt,
          speaker_a: speakerA,
          speaker_b: speakerB,
          dialogue_turns: scriptMode === 'custom' ? dialogueTurns : undefined,
          language_code: speakerA.language_code || selectedLang || 'en-US',
          max_chars: maxChars,
          target_audience: targetAudience,
          script_style: scriptStyle,
          llm_engine: 'deepseek',
        });
        const targetAudioUrl = res.audio_url || (res as any).file_url || (res as any).public_url;
        setScriptText(res.script);
        if (res.dialogue_turns && res.dialogue_turns.length > 0) {
          setDialogueTurns(res.dialogue_turns);
        }
        setAudioUrl(targetAudioUrl);
        setAudioDurationSec(res.duration_sec || 45);
      } else {
        // Standard Single Voice Synthesis (Tailored per Visual Style)
        const effectiveScriptStyle = visualStyle === 'product_ads_motion' ? 'commercial_ads' : (visualStyle === 'science_explainer' ? 'scientific' : scriptStyle);
        const effectiveMaxChars = visualStyle === 'product_ads_motion' ? 350 : maxChars;

        const res = await wynmotionService.generateScriptAndAudio({
          prompt,
          script: scriptMode === 'custom' && customNarrationText.trim() ? customNarrationText.trim() : undefined,
          language_code: selectedLang,
          target_audience: targetAudience,
          script_style: effectiveScriptStyle as any,
          max_chars: effectiveMaxChars,
          voice_engine: voiceModel,
          voice_name: selectedVoiceName,
          reading_style: readingStyle,
        });

        const targetAudioUrl = res.audio_url || (res as any).file_url || (res as any).public_url;
        setScriptText(res.script || customNarrationText || prompt);
        setAudioUrl(targetAudioUrl);
        setAudioDurationSec(res.duration_sec || (effectiveMaxChars <= 350 ? 15 : maxChars === 500 ? 30 : maxChars === 750 ? 60 : maxChars === 1100 ? 120 : 160));
      }
    } catch (err: any) {
      alert(err.message || (isVietnamese ? 'Lỗi tạo giọng đọc AI' : 'Failed to generate AI voice'));
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleAiAutoWriteDialogue = async () => {
    if (!prompt.trim()) {
      alert(isVietnamese ? 'Vui lòng nhập chủ đề hội thoại trước' : 'Please enter conversation topic first');
      return;
    }
    handleGenerateAudio();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert(isVietnamese ? 'File quá lớn (tối đa 20MB)' : 'File too large (max 20MB)');
      return;
    }
    setUploadedFileName(file.name);
    const localUrl = URL.createObjectURL(file);
    setAudioUrl(localUrl);

    const tempAudio = new Audio(localUrl);
    tempAudio.onloadedmetadata = () => {
      setAudioDurationSec(Math.round(tempAudio.duration) || 30);
    };
  };

  const handleLaunchProject = async () => {
    if (!prompt.trim()) return;

    // ✅ Double-check auth tại thời điểm launch (token có thể đã hết hạn)
    if (!user) {
      showAuthToast(
        isVietnamese
          ? '🔐 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại'
          : '🔐 Session expired. Please sign in again',
      );
      setTimeout(() => setIsLoginModalOpen(true), 400);
      return;
    }

    setIsCreatingProject(true);
    setIsCreationModalOpen(true);
    setIsCreationMinimized(false);
    setCreationError(null);
    setCreationCountdownSec(600);
    setCreationProgressPercent(15);
    setCreationStatusMessage(isVietnamese ? 'Đang khởi tạo tiến trình AI Motion...' : 'Initializing AI Motion pipeline...');

    // Start 1-second interval for countdown timer & smooth progress
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCreationCountdownSec((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
      setCreationProgressPercent((prev) => {
        if (prev < 90) return prev + 0.5;
        return prev;
      });
    }, 1000);

    try {
      setCreationStatusMessage(isVietnamese ? 'Đang phân tích kịch bản & căn chỉnh nhịp độ...' : 'Analyzing script & timing...');

      const res = await wynmotionService.generateScenes({
        title: prompt.slice(0, 40),
        prompt,
        script: scriptText || prompt,
        audio_url: audioUrl || undefined,
        duration_sec: audioDurationSec,
        aspect_ratio: aspectRatio,
        visual_style: visualStyle,
        character_subtype: characterSubtype,
        science_domain: visualStyle === 'science_explainer' ? scienceDomain : undefined,
        product_images: (visualStyle === 'product_ads_motion' || visualStyle === 'ads_strobe_teaser' || visualStyle === 'ads_cinematic_showcase') && productImages.length > 0 ? productImages : (visualStyle === 'video_news_60s' && newsImages.length > 0 ? newsImages : undefined),
        hook_text: (visualStyle === 'product_ads_motion' || visualStyle === 'ads_strobe_teaser' || visualStyle === 'ads_cinematic_showcase') ? (hookText || prompt.slice(0, 30)) : (visualStyle === 'video_news_60s' ? newsHeadline : undefined),
        price_text: (visualStyle === 'product_ads_motion' || visualStyle === 'ads_strobe_teaser' || visualStyle === 'ads_cinematic_showcase') ? (priceText || 'ƯU ĐÃI') : (visualStyle === 'video_news_60s' ? newsCategory : undefined),
        cta_text: (visualStyle === 'product_ads_motion' || visualStyle === 'ads_strobe_teaser' || visualStyle === 'ads_cinematic_showcase') ? ctaText : (visualStyle === 'video_news_60s' ? newsTickerText : undefined),
        dialogue_speakers: visualStyle === 'dialogue_scene' ? { speaker_a: speakerA, speaker_b: speakerB } : undefined,
        dialogue_turns: visualStyle === 'dialogue_scene' && dialogueTurns.length > 0 ? dialogueTurns : undefined,
        language_code: visualStyle === 'dialogue_scene' ? speakerA.language_code : selectedLang,
      });

      if (res && res.project) {
        let finalProject = res.project;

        // ⏱️ Background Silent Polling up to 10 minutes (600s), pinging every 1.5s if status is processing/pending
        if (finalProject && (finalProject.status === 'processing' || finalProject.status === 'queued' || finalProject.status === 'pending')) {
          setCreationStatusMessage(isVietnamese ? 'AI đang phân tích yêu cầu...' : 'AI is analyzing request...');
          const startTime = Date.now();
          const MAX_POLL_MS = 10 * 60 * 1000;
          const POLL_INTERVAL_MS = 1500;

          while (Date.now() - startTime < MAX_POLL_MS) {
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
            try {
              const polled = await wynmotionService.getProject(finalProject.project_id);
              if (polled && polled.project) {
                finalProject = polled.project;
                if ((polled.project as any).status_message) {
                  setCreationStatusMessage((polled.project as any).status_message);
                }
                if ((polled.project as any).progress_percent) {
                  setCreationProgressPercent((polled.project as any).progress_percent);
                }
                if (finalProject.status === 'completed' || finalProject.status === 'ready' || finalProject.status === 'done') {
                  setCreationProgressPercent(100);
                  break;
                }
                if (finalProject.status === 'failed' || finalProject.status === 'error') {
                  throw new Error((polled as any).error || (finalProject as any).error || 'Dự án gặp lỗi trong quá trình xử lý');
                }
              }
            } catch (pollErr: any) {
              console.warn('Silent polling warning:', pollErr);
            }
          }
        }

        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setCreationProgressPercent(100);
        setCreationStatusMessage(isVietnamese ? '✨ Hoàn tất tạo video!' : '✨ Video ready!');

        setTimeout(() => {
          setIsCreationModalOpen(false);
          setIsCreatingProject(false);
          setCreatedProject(finalProject);

          const updatedList = [finalProject, ...recentProjects.filter((p) => p.project_id !== finalProject.project_id)];
          setRecentProjects(updatedList);
          try {
            localStorage.setItem(`wynmotion_cached_projects_${user.uid}`, JSON.stringify(updatedList));
          } catch {}
        }, 800);
      }
    } catch (err: any) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      const errMsg = err.message || '';
      if (errMsg.includes('401') || errMsg.toLowerCase().includes('đăng nhập') || errMsg.toLowerCase().includes('sign in')) {
        setIsCreationModalOpen(false);
        setIsCreatingProject(false);
        showAuthToast(
          isVietnamese
            ? '🔐 Vui lòng đăng nhập để tạo dự án video'
            : '🔐 Please sign in to create video projects',
        );
        setTimeout(() => setIsLoginModalOpen(true), 400);
      } else {
        setCreationError(errMsg || (isVietnamese ? 'Lỗi tạo video hoạt họa' : 'Failed to generate animation video'));
        setIsCreatingProject(false);
      }
    }
  };

  const handleApplyCapCutTemplate = async (params: {
    templateId: 'ads_strobe_teaser' | 'ads_cinematic_showcase' | 'product_ads_motion';
    prompt: string;
    productImages: string[];
    bgmUrl: string;
    durationSec: number;
    aspectRatio?: '9:16' | '16:9';
    hookText?: string;
    ctaText?: string;
    solidText?: string;
    outlineText?: string;
    sloganText?: string;
  }) => {
    if (!user) {
      showAuthToast(isVietnamese ? '🔐 Vui lòng đăng nhập để áp dụng mẫu CapCut' : '🔐 Please sign in to apply CapCut template');
      setIsLoginModalOpen(true);
      return;
    }

    setIsCreatingProject(true);
    setIsCreationModalOpen(true);
    setIsCreationMinimized(false);
    setCreationError(null);
    setCreationProgressPercent(15);
    setCreationCountdownSec(600); // 10 minutes countdown
    setCreationStatusMessage(
      params.templateId === 'animation_ads_image_veo'
        ? (isVietnamese ? '👑 Đang khởi tạo VEO 3.1 Ads Animation (VIP)...' : '👑 Launching VEO 3.1 Ads Animation (VIP)...')
        : (isVietnamese ? '⚡ Đang khởi tạo video theo mẫu CapCut...' : '⚡ Launching CapCut template video...')
    );

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCreationCountdownSec((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const chosenAspectRatio = (params.aspectRatio || (aspectRatio === '16:9' ? '16:9' : '9:16')) as '9:16' | '1:1' | '16:9';
      
      let res: any;
      if (params.templateId === 'animation_ads_image_veo') {
        const firstImg = params.productImages[0] || '';
        if (!firstImg) {
          throw new Error(isVietnamese ? 'Vui lòng tải lên 1 ảnh Ads Poster để tạo animation VEO 3.1' : 'Please upload 1 Ads Poster image for VEO 3.1 animation');
        }
        res = await wynmotionService.generateVeoAdsAnimation({
          image_url: firstImg,
          user_prompt: params.prompt,
          aspect_ratio: chosenAspectRatio,
          duration_seconds: (params.durationSec || 12) as any,
        });
      } else {
        res = await wynmotionService.generateScenes({
          title: params.prompt,
          prompt: params.prompt,
          script: params.prompt,
          audio_url: params.bgmUrl,
          duration_sec: params.durationSec,
          aspect_ratio: chosenAspectRatio,
          visual_style: params.templateId,
          product_images: params.productImages.length > 0 ? params.productImages : undefined,
          hook_text: params.hookText,
          cta_text: params.ctaText,
          language_code: selectedLang,
          ...(params.solidText && { headline_solid: params.solidText }),
          ...(params.outlineText && { headline_outline: params.outlineText }),
          ...(params.sloganText && { sub_headline: params.sloganText }),
        } as any);
      }

      if (res && res.project) {
        let finalProject = res.project;
        if (finalProject.status === 'processing' || finalProject.status === 'queued' || finalProject.status === 'pending') {
          setCreationStatusMessage(
            params.templateId === 'animation_ads_image_veo'
              ? (isVietnamese ? 'Google VEO 3.1 đang kết xuất video điện ảnh 60fps...' : 'Google VEO 3.1 is rendering 60fps cinematic video...')
              : (isVietnamese ? 'Đang tạo hình ảnh & tính toán chuyển động AI...' : 'Generating visuals & AI motion calculations...')
          );
          const startTime = Date.now();
          const MAX_POLL_MS = 10 * 60 * 1000;
          const POLL_INTERVAL_MS = 8000;

          while (Date.now() - startTime < MAX_POLL_MS) {
            await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
            try {
              const polled = await wynmotionService.getProject(finalProject.project_id);
              if (polled.success && polled.project) {
                finalProject = polled.project;
                const elapsed = (Date.now() - startTime) / 1000;
                setCreationProgressPercent(Math.min(95, Math.round(20 + (elapsed / 60) * 70)));
                if (finalProject.status === 'completed' || finalProject.status === 'ready' || finalProject.status === 'done') {
                  setCreationProgressPercent(100);
                  break;
                }
              }
            } catch (pollErr: any) {
              console.warn('Silent polling warning:', pollErr);
            }
          }
        }

        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setCreationProgressPercent(100);
        setCreationStatusMessage(isVietnamese ? '✨ Hoàn tất tạo video!' : '✨ Video ready!');

        setTimeout(() => {
          setIsCreationModalOpen(false);
          setIsCreatingProject(false);
          setCreatedProject(finalProject);
          const updatedList = [finalProject, ...recentProjects.filter((p) => p.project_id !== finalProject.project_id)];
          setRecentProjects(updatedList);
          try {
            localStorage.setItem(`wynmotion_cached_projects_${user.uid}`, JSON.stringify(updatedList));
          } catch {}
          openProjectInEditor(finalProject);
        }, 800);
      }
    } catch (err: any) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      console.error('CapCut template launch error:', err);
      setCreationError(err.message || (isVietnamese ? 'Lỗi tạo video theo mẫu CapCut' : 'Failed to launch CapCut template'));
      setIsCreatingProject(false);
    }
  };

  // 7 Styles Organised into 3 Distinct Groups (Illustrative, Motion Explainer, Commercial Ads)
  const ILLUSTRATIVE_STYLES: { id: MotionVisualStyle; title: string; desc: string; icon: any }[] = [
    {
      id: 'whiteboard_stream_hand',
      title: isVietnamese ? 'Bảng vẽ\ntay' : 'Whiteboard\nStream',
      desc: isVietnamese ? 'Nét vẽ tay Marker vector & bảng trắng' : 'Hand-drawn illustration & marker stream',
      icon: WhiteboardStreamIcon,
    },
    {
      id: 'handdrawn_fast_doodle',
      title: isVietnamese ? 'Phác họa\nnhanh' : 'Doodle\nQuick',
      desc: isVietnamese ? 'Phác họa bút chì nhanh & vệt màu' : 'Fast sketch & doodle animation',
      icon: DoodleQuickIcon,
    },
    {
      id: 'character_animation',
      title: isVietnamese ? 'Nhân vật\nhoạt hình' : 'Mascot &\nCharacter',
      desc: isVietnamese ? 'Nhân vật & Cáo Mascot 3D dẫn chuyện' : 'Animated mascots, hosts & character scenes',
      icon: CharacterAnimationIcon,
    },
  ];

  const MOTION_EXPLAINER_STYLES: { id: MotionVisualStyle; title: string; desc: string; icon: any }[] = [
    {
      id: 'apple_modern_motion',
      title: isVietnamese ? 'Chuyển động\nhiện đại' : 'Modern\nMotion',
      desc: isVietnamese ? 'Thẻ kính kinetic & motion graphics 3D' : 'Glassmorphic cards & modern motion graphics',
      icon: AppleModernMotionIcon,
    },
    {
      id: 'dialogue_scene',
      title: isVietnamese ? 'Hội thoại\n2 người' : 'Dialogue\nScene',
      desc: isVietnamese ? 'Hội thoại 2 nhân vật & bong bóng thoại' : 'Two-character conversations & speech bubbles',
      icon: DialogueSceneIcon,
    },
    {
      id: 'science_explainer',
      title: isVietnamese ? 'Diễn giải\nkhoa học' : 'Science\nExplainer',
      desc: isVietnamese ? 'Sơ đồ, công thức & chuyển động khoa học' : 'Diagrams, formulas & scientific animations',
      icon: ScienceExplainerIcon,
    },
  ];

  const COMMERCIAL_ADS_STYLES: { id: MotionVisualStyle; title: string; desc: string; icon: any }[] = [
    {
      id: 'product_ads_motion',
      title: isVietnamese ? 'Quảng cáo Sản phẩm\n& Thương hiệu (Ads)' : 'Product & Brand\nCommercial Ads',
      desc: isVietnamese ? 'Biến ảnh sản phẩm & poster thành video ads 60fps đỉnh cao, chữ giật nảy thu hút & sản phẩm 3D sống động' : 'High-converting 60fps commercial motion ads with 3D floating products & kinetic typography',
      icon: ProductAdsIcon,
    },
    {
      id: 'ads_strobe_teaser',
      title: isVietnamese ? 'Strobe Teaser\n& Big Reveal' : 'Strobe Teaser\n& Big Reveal',
      desc: isVietnamese ? 'Đập chữ nhịp điệu nhanh, chớp nháy vi mô R-E-A-D-Y & hé lộ sản phẩm với typography 2 tầng đẳng cấp' : 'Fast-paced rhythmic strobe typography with READY letter-flash and cinematic reveal outro',
      icon: StrobeTeaserIcon,
    },
    {
      id: 'ads_cinematic_showcase',
      title: isVietnamese ? 'Cinematic Showcase\nReel 22s' : 'Cinematic Showcase\nReel 22s',
      desc: isVietnamese ? 'Video F&B / Sản phẩm 7 phân cảnh điện ảnh, khói sương, nguyên liệu bay 3D, chia 3 cột & nút đặt hàng' : '7-stage commercial reel with flare intro, smoke VFX, zero-gravity floating ingredients, 3-panel split & pulse CTA',
      icon: CinematicShowcaseIcon,
    },
  ];

  const NEWS_VIDEO_STYLES: { id: MotionVisualStyle; title: string; desc: string; icon: any }[] = [
    {
      id: 'video_news_60s',
      title: isVietnamese ? 'Bản Tin Nóng 60s\n(Video News)' : '60s Video News\n& Daily Digest',
      desc: isVietnamese ? 'Tự động đọc bài báo từ Link hoặc Dán văn bản, tóm tắt tin tức 60s TikTok, hiệu ứng Ken Burns & thanh tin vắn' : 'Auto-crawl news links or paste text, generate 60s TikTok breaking news reels with Ken Burns & live ticker',
      icon: VideoNewsIcon,
    },
  ];

  const estimatedPoints = calculateProjectPoints(visualStyle, audioDurationSec);

  // ── EARLY RETURN: Mobile Video Editor Studio ──
  if (activeEditorProject) {
    return (
      <MobileVideoEditorStudio
        project={activeEditorProject}
        onBack={() => {
          setActiveEditorProject(null);
          setIsStudioOpen(false);
        }}
      />
    );
  }

  // =========================================================================
  // VIEW MODE A: CAPCUT-STYLE HOME HUB
  // =========================================================================
  if (viewMode === 'home') {
    return (
      <div className={`pb-2 transition-colors duration-200 ${isDark ? 'bg-[#080B10]' : 'bg-[#FAFAFC]'}`}>
        {/* ── Auth Toast Notification — fixed bottom overlay ── */}
        {authToast.visible && (
          <div
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border animate-[fadeInUp_0.3s_ease-out] max-w-[320px] w-[90vw]"
            style={{
              background: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)',
              borderColor: isDark ? 'rgba(99,179,237,0.3)' : 'rgba(59,130,246,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-base flex-1 font-semibold leading-snug" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
              {authToast.message}
            </span>
            <button
              onClick={() => {
                setAuthToast({ visible: false, message: '' });
                setIsLoginModalOpen(true);
              }}
              className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md active:scale-95 transition-all"
            >
              {isVietnamese ? 'Đăng nhập' : 'Sign In'}
            </button>
          </div>
        )}

        <HeroBackground
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenUpgrade={() => setIsProfileOpen(true)}
        >
          {/* Banner Headline Text (Lowered down to sit exactly 10px above the New Project row) */}
          <div
            onClick={() => handleStartStudio('whiteboard_stream_hand')}
            className="cursor-pointer active:opacity-90 transition-opacity"
          >
            <div className="text-[15px] font-medium text-white/90 tracking-tight">
              {t('Tạo video từ ý tưởng', 'Create videos from ideas')}
            </div>
            <div className="text-3xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>{t('Bắt đầu', 'Get started')}</span>
              <span className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm">
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </span>
            </div>
          </div>
        </HeroBackground>

        <div className="max-w-xl mx-auto px-4 -mt-[162px] relative z-10 space-y-6">
          {/* Action Cards: Both Frosted Translucent Glass (New Video flex-[1.35] & Templates flex-1) */}
          <div className="flex gap-3 items-stretch">
            {/* New Video Button — Frosted Glass with Translucent Blur */}
            <button
              onClick={() => handleStartStudio('whiteboard_stream_hand')}
              className={`flex-[1.35] group relative overflow-hidden rounded-3xl p-5 shadow-xl active:scale-[0.98] transition-all flex flex-col justify-between h-38 ${
                isDark
                  ? 'bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white shadow-black/40 hover:border-slate-700'
                  : 'bg-white/80 backdrop-blur-xl border border-white/80 text-slate-900 shadow-lg shadow-black/5 hover:bg-white/90'
              }`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-white/10 backdrop-blur-md text-white' : 'bg-slate-950/10 text-slate-950'
              }`}>
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <div className="text-base font-black tracking-tight">{t('Tạo Video Mới', 'New Project')}</div>
                <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-white/80' : 'text-slate-600'}`}>
                  {t('Luồng 4 bước chuẩn AI', '4-Step AI Studio')}
                </div>
              </div>
            </button>

            {/* Templates Button — Frosted Glass with Translucent Blur */}
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 group rounded-3xl p-5 border text-left shadow-lg active:scale-[0.98] transition-all flex flex-col justify-between h-38 ${
                isDark
                  ? 'bg-slate-900/80 backdrop-blur-xl border border-white/10 hover:border-slate-700 text-white shadow-black/40'
                  : 'bg-white/80 backdrop-blur-xl border border-white/80 hover:bg-white/90 text-slate-900 shadow-black/5'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-white/10 text-white' : 'bg-slate-950/10 text-slate-950'
              }`}>
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-black tracking-tight">{t('Mẫu Dựng Sẵn', 'Templates')}</div>
                <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('Khám phá kho mẫu', 'Explore library')}
                </div>
              </div>
            </button>
          </div>

          {/* Recent Projects (Dự Án Gần Đây) — Full Cover Black & White Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('Dự Án Gần Đây', 'Recent Projects')}
              </h3>
              <button
                onClick={() => setActiveTab('library')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1"
              >
                <span>{t('Xem tất cả', 'View all')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {!user ? (
              <div
                onClick={() => setIsLoginModalOpen(true)}
                className={`w-full p-4 rounded-3xl border cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between gap-3 ${
                  isDark
                    ? 'bg-slate-900/80 backdrop-blur-md border-slate-800 hover:border-slate-700 text-slate-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-lg">
                    🔐
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {t('Đăng nhập để xem dự án gần đây', 'Sign in to view recent projects')}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {t('Dự án của bạn sẽ được lưu riêng tư và an toàn', 'Your projects will be saved privately and securely')}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md flex-shrink-0">
                  {t('Đăng nhập', 'Sign In')}
                </span>
              </div>
            ) : recentProjects.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {recentProjects.map((item: any, idx: number) => {
                  const coverImg = item.scenes?.[0]?.image_url || item.thumbnail_url;
                  const projectId: string = item.project_id || item.id || '';
                  const displayTitle: string = item.title || item.prompt?.slice(0, 36) || t('Dự Án WynMotion', 'WynMotion Project');
                  const displayDuration: string = item.duration_sec
                    ? `${Math.round(item.duration_sec)}s`
                    : item.duration || '';
                  const sceneCount: number = item.scenes?.length || 0;
                  const styleLabel: string = item.visual_style
                    ? item.visual_style.replace(/_/g, ' ')
                    : '';

                  return (
                    <div
                      key={projectId || idx}
                      onClick={() => openProjectInEditor(item as MotionProject)}
                      style={
                        coverImg
                          ? {
                              backgroundImage: `url(${coverImg})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }
                          : undefined
                      }
                      className="flex-shrink-0 w-32 h-36 rounded-2xl p-3 bg-black text-white border border-slate-800/80 flex flex-col justify-end relative overflow-hidden shadow-sm cursor-pointer active:scale-95 hover:border-cyan-500/50 transition-all"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                      {styleLabel && (
                        <div className="absolute top-2 left-2 right-2 flex">
                          <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-[8px] font-bold text-cyan-300 uppercase tracking-wide truncate">
                            {styleLabel}
                          </span>
                        </div>
                      )}

                      <div className="relative z-10">
                        <h4 className="text-[11px] font-semibold text-white leading-snug line-clamp-2">
                          {displayTitle}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {displayDuration && (
                            <span className="text-[9px] text-slate-400">{displayDuration}</span>
                          )}
                          {sceneCount > 0 && (
                            <span className="text-[9px] text-cyan-400">· {sceneCount} scenes</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`p-5 text-center rounded-3xl border text-xs text-slate-400 ${
                  isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {t('Chưa có dự án nào gần đây', 'No recent projects yet')}
              </div>
            )}
          </div>

          {/* 7 AI Animation Styles in 3 categories (Clean text, Monochrome icons) */}
          <div className="space-y-6">
            {/* Nhóm 3: Commercial & Brand Ads (Single card opening CapCut-style Masonry Gallery) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔥</span>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                  {isVietnamese ? 'Quảng Cáo & Thương Hiệu' : 'Commercial & Brand Ads'}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => setIsCapCutGalleryOpen(true)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3.5 active:scale-98 group ${
                    isDark
                      ? 'bg-slate-900/90 border-rose-900/40 text-white hover:border-rose-500/50 shadow-lg shadow-rose-950/20'
                      : 'bg-white border-rose-200 text-slate-900 shadow-sm hover:border-rose-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <ProductAdsIcon size={36} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {isVietnamese ? 'Kho Mẫu Quảng Cáo & Thương Hiệu' : 'Commercial & Brand Ads Templates'}
                      </div>
                    </div>
                    <div className={`text-xs mt-0.5 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {isVietnamese
                        ? 'Strobe Teaser, Cinematic Menu 22s & Billboard 60fps đỉnh cao'
                        : 'Strobe Teaser, Cinematic Showcase & Billboard motion templates'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Nhóm 4: Video News 60s (Tin Tức & Điểm Tin) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">📰</span>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  {isVietnamese ? 'Tin Tức & Điểm Tin 60s (Video News)' : '60s Video News & Daily Digest'}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {NEWS_VIDEO_STYLES.map((style) => {
                  const Icon = style.icon;
                  return (
                    <button
                      key={style.id}
                      onClick={() => handleStartStudio(style.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3.5 active:scale-98 group ${
                        isDark
                          ? 'bg-slate-900/90 border-amber-900/40 text-white hover:border-amber-500/50 shadow-lg shadow-amber-950/20'
                          : 'bg-white border-amber-200 text-slate-900 shadow-sm hover:border-amber-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        <Icon size={36} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {style.title.replace('\n', ' ')}
                          </div>
                        </div>
                        <div className={`text-xs mt-0.5 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {style.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nhóm 1: Illustrative */}
            <div className="space-y-3">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {isVietnamese ? 'Minh Họa & Vẽ Tay' : 'Illustrative'}
              </h3>
              <div className="grid grid-cols-3 gap-2.5">
                {ILLUSTRATIVE_STYLES.map((style) => {
                  const Icon = style.icon;
                  return (
                    <button
                      key={style.id}
                      onClick={() => handleStartStudio(style.id)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between h-30 active:scale-95 group ${
                        isDark
                          ? 'bg-slate-900/90 border-slate-800 text-white hover:border-slate-700'
                          : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:border-slate-300'
                      }`}
                    >
                      {/* Big Monochrome Icon */}
                      <div className={`flex-1 flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        <Icon size={42} />
                      </div>
                      <div className="w-full">
                        <div className={`text-[11px] font-normal leading-tight text-center whitespace-pre-line ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {style.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nhóm 2: Motion & Explainer */}
            <div className="space-y-3">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {isVietnamese ? 'Chuyển Động & Diễn Giải' : 'Motion & Explainer'}
              </h3>
              <div className="grid grid-cols-3 gap-2.5">
                {MOTION_EXPLAINER_STYLES.map((style) => {
                  const Icon = style.icon;
                  return (
                    <button
                      key={style.id}
                      onClick={() => handleStartStudio(style.id)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between h-30 active:scale-95 group ${
                        isDark
                          ? 'bg-slate-900/90 border-slate-800 text-white hover:border-slate-700'
                          : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:border-slate-300'
                      }`}
                    >
                      {/* Big Monochrome Icon */}
                      <div className={`flex-1 flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        <Icon size={42} />
                      </div>
                      <div className="w-full">
                        <div className={`text-[11px] font-normal leading-tight text-center whitespace-pre-line ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {style.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <ProfileSidePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

        <CapCutGalleryModal
          isOpen={isCapCutGalleryOpen}
          onClose={() => setIsCapCutGalleryOpen(false)}
          onSelectTemplate={(tplId) => {
            setIsCapCutGalleryOpen(false);
            setCapcutModalTemplate(tplId);
          }}
        />

        {/* ── CapCut Fullscreen Preview & Instant Apply Modal in Home Mode ── */}
        <CapCutTemplateModal
          templateId={capcutModalTemplate}
          isOpen={Boolean(capcutModalTemplate)}
          defaultAspectRatio={aspectRatio === '16:9' ? '16:9' : '9:16'}
          onClose={() => setCapcutModalTemplate(null)}
          onApply={handleApplyCapCutTemplate}
        />

        {/* ── 5-Minute Countdown & Minimize-to-Background Creation Modal in Home Mode ── */}
        <WynMotionCreationModal
          isOpen={isCreationModalOpen}
          isMinimized={isCreationMinimized}
          onToggleMinimize={() => setIsCreationMinimized(!isCreationMinimized)}
          statusMessage={creationStatusMessage}
          progressPercent={creationProgressPercent}
          remainingSeconds={creationCountdownSec}
          projectTitle={prompt.slice(0, 30)}
          visualStyle={visualStyle}
          error={creationError}
          onCancel={() => {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            setIsCreationModalOpen(false);
            setIsCreatingProject(false);
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE B: FULL-SCREEN IMMERSIVE 4-STEP CREATION STUDIO
  // =========================================================================
  return (
    <div className={`min-h-screen pb-28 pt-[max(env(safe-area-inset-top,44px),44px)] px-4 sm:px-6 transition-colors duration-200 ${
      isDark ? 'bg-[#080B10] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* ── Auth Toast Notification — fixed bottom overlay ── */}
      {authToast.visible && (
        <div
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border max-w-[320px] w-[90vw]"
          style={{
            background: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)',
            borderColor: isDark ? 'rgba(99,179,237,0.3)' : 'rgba(59,130,246,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <span className="text-base flex-1 font-semibold leading-snug" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
            {authToast.message}
          </span>
          <button
            onClick={() => {
              setAuthToast({ visible: false, message: '' });
              setIsLoginModalOpen(true);
            }}
            className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md active:scale-95 transition-all"
          >
            {isVietnamese ? 'Đăng nhập' : 'Sign In'}
          </button>
        </div>
      )}

      {/* Hidden audio element for preview */}

      <audio
        ref={audioPlayerRef}
        onEnded={() => setIsPlayingAudioPreview(false)}
        className="hidden"
      />

      {/* Studio Header Bar */}
      <div className="max-w-xl mx-auto flex items-center justify-between pb-4 border-b border-slate-800/40">
        <button
          onClick={handleExitStudio}
          className={`p-2.5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-black tracking-tight">
            {wizardStep === '1' && t('Bước 1/4: Chọn Phong Cách Hoạt Họa', 'Step 1/4: Animation Style')}
            {wizardStep === '2' && t('Bước 2/4: Ý Tưởng Kịch Bản', 'Step 2/4: Prompt & Concept')}
            {wizardStep === '3.1' && t('Bước 3.1/4: Cấu Hình Giọng Đọc AI', 'Step 3.1/4: Voice Setup')}
            {wizardStep === '3.2' && t('Bước 3.2/4: Đối Tượng & Văn Phong', 'Step 3.2/4: Style & Duration')}
            {wizardStep === '3.3' && t('Bước 3.3/4: Kịch Bản & Lồng Tiếng AI', 'Step 3.3/4: Narration & Audio')}
            {wizardStep === '4' && t('Bước 4/4: Tỉ Lệ Khung Hình & Tạo Video', 'Step 4/4: Ratio & Launch')}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            {['1', '2', '3.1', '3.2', '3.3', '4'].map((st) => (
              <div
                key={st}
                className={`h-1.5 rounded-full transition-all ${
                  wizardStep === st
                    ? 'w-6 bg-cyan-400'
                    : 'w-2 bg-slate-700/60'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="w-10" />
      </div>

      <div className="max-w-xl mx-auto mt-6 space-y-7">
        {/* ========================================================================= */}
        {/* STEP 1: 6 STYLES IN 2 GROUPS */}
        {/* ========================================================================= */}
        {wizardStep === '1' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Nhóm 3: Commercial & Brand Ads (Single card opening CapCut-style Masonry Gallery) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔥</span>
                <label className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  {isVietnamese ? 'Quảng Cáo & Thương Hiệu' : 'Commercial & Brand Ads'}
                </label>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCapCutGalleryOpen(true)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 ${
                    visualStyle === 'product_ads_motion' || visualStyle === 'ads_strobe_teaser' || visualStyle === 'ads_cinematic_showcase'
                      ? 'bg-rose-500/15 border-rose-400 shadow-md shadow-rose-500/15'
                      : isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <ProductAdsIcon size={36} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {isVietnamese ? 'Kho Mẫu Quảng Cáo & Thương Hiệu' : 'Commercial & Brand Ads Templates'}
                      </div>
                    </div>
                    <div className={`text-xs mt-0.5 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {isVietnamese
                        ? 'Strobe Teaser, Cinematic Menu 22s & Billboard 60fps đỉnh cao'
                        : 'Strobe Teaser, Cinematic Showcase & Billboard motion templates'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Nhóm 4: Video News 60s (Tin Tức & Điểm Tin) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">📰</span>
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {isVietnamese ? 'Tin Tức & Điểm Tin 60s (Video News)' : '60s Video News & Daily Digest'}
                </label>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => setVisualStyle('video_news_60s')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 ${
                    visualStyle === 'video_news_60s'
                      ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/15'
                      : isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <VideoNewsIcon size={36} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {isVietnamese ? 'Bản Tin Nóng 60s (Video News)' : '60s Video News & Daily Digest'}
                      </div>
                    </div>
                    <div className={`text-xs mt-0.5 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {isVietnamese
                        ? 'Tự động đọc bài báo từ Link hoặc Dán văn bản, tóm tắt tin tức 60s TikTok, hiệu ứng Ken Burns & thanh tin vắn'
                        : 'Auto-crawl news links or paste text, generate 60s TikTok breaking news reels with Ken Burns & live ticker'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Nhóm 1: Illustrative */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isVietnamese ? 'Minh Họa & Vẽ Tay' : 'Illustrative'}
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {ILLUSTRATIVE_STYLES.map((st) => {
                  const Icon = st.icon;
                  const isSelected = visualStyle === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setVisualStyle(st.id)}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-between h-34 ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-md shadow-cyan-500/10'
                          : isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                      }`}
                    >
                      <div className="text-slate-900 dark:text-white my-1">
                        <Icon size={36} />
                      </div>
                      <div className="w-full">
                        <div className={`text-[11px] font-normal leading-tight whitespace-pre-line text-center ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {st.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nhóm 2: Motion & Explainer */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isVietnamese ? 'Chuyển Động & Diễn Giải' : 'Motion & Explainer'}
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {MOTION_EXPLAINER_STYLES.map((st) => {
                  const Icon = st.icon;
                  const isSelected = visualStyle === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setVisualStyle(st.id);
                        if (st.id === 'dialogue_scene') setCharacterSubtype('pixar_3d');
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-between h-34 ${
                        isSelected
                          ? 'bg-purple-500/10 border-purple-400 shadow-md shadow-purple-500/10'
                          : isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                      }`}
                    >
                      <div className="text-slate-900 dark:text-white my-1">
                        <Icon size={36} />
                      </div>
                      <div className="w-full">
                        <div className={`text-[11px] font-normal leading-tight whitespace-pre-line text-center ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {st.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PROMPT & STYLE-SPECIFIC CONFIGURATION */}
        {/* ========================================================================= */}
        {wizardStep === '2' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* ── 1. STYLE 7, 8, 9: COMMERCIAL ADS TEMPLATES (1-3 Images + Offer Tag + CTA) ── */}
            {(visualStyle === 'product_ads_motion' || visualStyle === 'ads_strobe_teaser' || visualStyle === 'ads_cinematic_showcase') && (
              <div className="space-y-3 p-4 rounded-3xl border border-rose-500/30 bg-rose-950/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <span>🛍️</span> {t('Tải ảnh sản phẩm / Poster (Tối đa 3 ảnh)', 'Upload Product Images / Poster (Max 3)')}
                  </label>
                  <span className="text-[11px] font-bold text-rose-400">
                    {productImages.length}/3 {t('ảnh', 'images')}
                  </span>
                </div>

                {/* 1-3 Images Dropzone / Upload Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[0, 1, 2].map((idx) => {
                    const img = productImages[idx];
                    return (
                      <div
                        key={idx}
                        className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-1.5 text-center transition-all overflow-hidden ${
                          img
                            ? 'border-rose-500 bg-slate-900 shadow-md'
                            : 'border-slate-700 bg-slate-900/40 hover:border-rose-400/60'
                        }`}
                      >
                        {img ? (
                          <>
                            <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                            <span className="absolute top-1.5 left-1.5 bg-rose-500 text-[10px] text-white px-2 py-0.5 rounded-md font-black">
                              Scene {idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setProductImages(productImages.filter((_, i) => i !== idx))}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center text-xs font-bold transition-all shadow-md"
                            >
                              ✕
                            </button>
                          </>
                        ) : uploadingImageIndex === idx ? (
                          <div className="flex flex-col items-center justify-center w-full h-full text-rose-400 gap-1.5">
                            <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-bold">{t('Đang tải...', 'Uploading...')}</span>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-rose-400">
                            <span className="text-2xl mb-1">📸</span>
                            <span className="text-[11px] font-bold text-slate-200">Scene {idx + 1}</span>
                            <span className="text-[9px] text-slate-500 mt-0.5">
                              {idx === 0 ? t('Bắt buộc', 'Required') : t('Tùy chọn', 'Optional')}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploadingImageIndex(idx);
                                try {
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  const upRes = await wynmotionService.uploadMedia(formData);
                                  if (upRes?.url) {
                                    setProductImages([...productImages, upRes.url].slice(0, 3));
                                  }
                                } catch (upErr: any) {
                                  alert(upErr.message || 'Lỗi tải ảnh lên');
                                } finally {
                                  setUploadingImageIndex(null);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Ads marketing fields (Price Tag, CTA) */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rose-500/20">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      🏷️ {t('Tag Ưu Đãi / Khuyến Mãi', 'Offer / Promo Badge')}
                    </label>
                    <input
                      type="text"
                      value={priceText}
                      onChange={(e) => setPriceText(e.target.value)}
                      placeholder="MUA 1 TẶNG 1"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      📢 {t('Nút Kêu Gọi CTA', 'Call to Action')}
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="MUA NGAY / ĐẶT HÀNG"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STYLE: VIDEO NEWS 60S (URL vs Raw Text) ── */}
            {visualStyle === 'video_news_60s' && (
              <div className="space-y-4 p-4 rounded-3xl border border-amber-500/30 bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>📰</span>
                    <span>{t('Nguồn tin tức (Link bài báo hoặc dán văn bản)', 'News Source (Article URL or Raw Text)')}</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase">
                    Auto-60s
                  </span>
                </div>

                {/* Input Mode Switcher */}
                <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setNewsInputMode('url')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      newsInputMode === 'url'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔗 {t('Dán Link Báo', 'Paste Article URL')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewsInputMode('text')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      newsInputMode === 'text'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📝 {t('Dán Nội Dung / Điểm Tin', 'Paste Text / Digest')}
                  </button>
                </div>

                {newsInputMode === 'url' ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={newsUrlInput}
                      onChange={(e) => setNewsUrlInput(e.target.value)}
                      placeholder="https://vnexpress.net/... hoặc báo quốc tế"
                      className="w-full px-4 py-3 text-xs rounded-2xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-amber-400 focus:outline-none"
                    />
                    <div className="text-[10px] text-slate-400">
                      * Hỗ trợ VnExpress, Tuổi Trẻ, Zing, Dân Trí, TechCrunch, CNN, Reuters...
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={newsRawTextInput}
                      onChange={(e) => setNewsRawTextInput(e.target.value)}
                      rows={4}
                      placeholder={t('Dán bài báo hoặc gom nhiều mẩu tin ngắn để tổng hợp điểm tin 60s...', 'Paste news article or multiple news snippets for a 60s digest...')}
                      className="w-full p-3.5 text-xs rounded-2xl bg-slate-900 border border-slate-800 text-white font-medium focus:border-amber-400 focus:outline-none resize-none"
                    />
                  </div>
                )}

                {/* Summarize Action Button */}
                <button
                  type="button"
                  onClick={handleSummarizeNews}
                  disabled={isSummarizingNews}
                  className={`w-full py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                    isSummarizingNews
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[0.98]'
                  }`}
                >
                  {isSummarizingNews ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>{t('AI đang đọc & tóm tắt bản tin 60s...', 'AI summarizing news for 60s video...')}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>{t('✨ AI Đọc & Tóm Tắt Bản Tin 60s (Auto-Summarize)', '✨ AI Auto-Summarize 60s Video Script')}</span>
                    </>
                  )}
                </button>

                {/* Extracted Headline & Ticker Preview */}
                {newsHeadline && (
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-amber-400 uppercase">TIÊU ĐỀ HEADLINE:</span>
                      <span className="text-slate-400">{newsCategory}</span>
                    </div>
                    <div className="text-xs font-black text-white">{newsHeadline}</div>
                    <div className="text-[10px] text-amber-300/90 truncate pt-1 border-t border-slate-800">
                      ⚡ Ticker: {newsTickerText}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 2. STYLE 6: SCIENCE & STEM EXPLAINER (5 Domains) ── */}
            {visualStyle === 'science_explainer' && (
              <div className="space-y-2 p-4 rounded-3xl border border-indigo-500/30 bg-indigo-950/20">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {t('Lĩnh vực khoa học & Bài toán', 'Scientific STEM Domain')}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'math' as const, label: '📐 Toán' },
                    { id: 'physics' as const, label: '🚀 Vật lý' },
                    { id: 'chemistry' as const, label: '⚗️ Hóa học' },
                    { id: 'biology' as const, label: '🧬 Sinh học' },
                    { id: 'cs' as const, label: '💻 Tin học' },
                  ].map((dom) => (
                    <button
                      key={dom.id}
                      type="button"
                      onClick={() => setScienceDomain(dom.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border text-center transition-all ${
                        scienceDomain === dom.id
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {dom.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── 3. STYLE 4: CHARACTER MASCOT (Full Character vs Stickman) ── */}
            {visualStyle === 'character_animation' && (
              <div className="space-y-2 p-4 rounded-3xl border border-cyan-500/30 bg-cyan-950/20">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {t('Kiểu nhân vật dẫn chuyện', 'Character Subtype')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCharacterSubtype('full_character')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      characterSubtype === 'full_character' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    🦊 Mascot Cáo 3D Pixar
                  </button>
                  <button
                    type="button"
                    onClick={() => setCharacterSubtype('stickman')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      characterSubtype === 'stickman' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    🏃 Người Que (Stickman)
                  </button>
                </div>
              </div>
            )}

            {/* ── 4. STYLE 5: DIALOGUE SCENE (3D Pixar vs 2D Comic) ── */}
            {visualStyle === 'dialogue_scene' && (
              <div className="space-y-2 p-4 rounded-3xl border border-purple-500/30 bg-purple-950/20">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  {t('Phong cách thị giác 2 Nhân vật', '2-Character Visual Subtype')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCharacterSubtype('pixar_3d')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      characterSubtype === 'pixar_3d' ? 'bg-purple-500 text-white border-purple-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    ✨ 3D Pixar Cinematic
                  </button>
                  <button
                    type="button"
                    onClick={() => setCharacterSubtype('cartoon_2d')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      characterSubtype === 'cartoon_2d' ? 'bg-purple-500 text-white border-purple-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    🎨 2D Comic / Cafe Host
                  </button>
                </div>
              </div>
            )}

            {/* Prompt Concept Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                {visualStyle === 'product_ads_motion'
                  ? t('Mô tả sản phẩm & thông điệp quảng cáo (Ad Concept)', 'Product Concept & Advertising Message')
                  : visualStyle === 'dialogue_scene'
                  ? t('Chủ đề hội thoại 2 nhân vật', 'Two-Character Conversation Topic')
                  : visualStyle === 'science_explainer'
                  ? t('Đề bài toán học / Hiện tượng khoa học', 'STEM Problem / Scientific Concept')
                  : t('Mô tả ý tưởng video (Prompt)', 'Video Prompt Concept')}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder={getPromptPlaceholder()}
                className={`w-full p-4 rounded-3xl border text-sm font-semibold outline-none resize-none transition-colors ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-cyan-400' : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
                }`}
              />
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('✨ Gợi ý chủ đề tiêu biểu', '✨ Topic Inspiration')}
              </span>
              <div className="space-y-2">
                {getPromptSuggestions().map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(sug)}
                    className={`w-full p-3 rounded-2xl border text-left text-xs font-medium transition-all ${
                      isDark ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-400/40 text-slate-300' : 'bg-white border-slate-200 shadow-sm hover:border-cyan-400 text-slate-700'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3.1: VOICE SETUP (Single Voice vs Dialogue Dual Voice) */}
        {/* ========================================================================= */}
        {wizardStep === '3.1' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Audio Source: Agent vs Upload */}
            <div className={`p-1 rounded-2xl flex items-center border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/70 border-slate-300/60'
            }`}>
              {(visualStyle === 'product_ads_motion' || visualStyle === 'ads_strobe_teaser' || visualStyle === 'ads_cinematic_showcase') && (
                <button
                  type="button"
                  onClick={() => setAudioMode('bgm' as any)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    (audioMode as any) === 'bgm' ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{t('Nhạc Beat Ads', 'Ad Beat Tracks')}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setAudioMode('agent')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  audioMode === 'agent' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md' : 'text-slate-400'
                }`}
              >
                <Mic className="h-4 w-4" />
                <span>{t('Giọng Đọc AI (TTS)', 'AI Voiceover')}</span>
              </button>
              <button
                type="button"
                onClick={() => setAudioMode('upload')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  audioMode === 'upload' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md' : 'text-slate-400'
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>{t('Tải Lên Audio', 'Upload Audio')}</span>
              </button>
            </div>

            {/* BGM Preset Selection for Ads */}
            {((audioMode as any) === 'bgm' && (visualStyle === 'product_ads_motion' || visualStyle === 'ads_strobe_teaser' || visualStyle === 'ads_cinematic_showcase')) && (
              <div className="space-y-3 p-4 rounded-3xl border border-amber-500/30 bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎶</span>
                    <span>{t('Chọn Nhạc Beat Thịnh Hành (AI Beat-Sync):', 'Select Trending Beat (AI Beat-Sync):')}</span>
                  </label>
                  {audioUrl && (
                    <span className="text-[10px] font-bold text-emerald-400">✓ {t('Đã chọn', 'Selected')}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: 'chill_lofi', title: 'Phê La Chill Hop Beat', url: 'https://static.wordai.pro/ai-generated-images/wynmotion/ddd110f2dc60_templates/bgm_chill.mp3', duration: 15, tag: 'Thư giãn · Cafe', icon: '🥤' },
                    { id: 'viral_phonk', title: 'TikTok Viral Phonk Drop', url: 'https://static.wordai.pro/ai-generated-images/wynmotion/ddd110f2dc60_templates/bgm_phonk.mp3', duration: 15, tag: 'Sôi động · Hot Trend', icon: '⚡' },
                    { id: 'luxury_electro', title: 'Luxury Brand Electronic', url: 'https://static.wordai.pro/ai-generated-images/wynmotion/ddd110f2dc60_templates/bgm_luxury.mp3', duration: 15, tag: 'Sang trọng · Apple', icon: '✨' },
                    { id: 'cinematic_drop', title: 'Cinematic Commercial Beat', url: 'https://static.wordai.pro/ai-generated-images/wynmotion/ddd110f2dc60_templates/bgm_cinematic.mp3', duration: 15, tag: 'Bom tấn · Đột phá', icon: '🎬' },
                  ].map((bgm) => (
                    <div
                      key={bgm.id}
                      onClick={() => {
                        setAudioUrl(bgm.url);
                        setAudioDurationSec(bgm.duration);
                        setScriptText(prompt || bgm.title);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        audioUrl === bgm.url
                          ? 'border-amber-400 bg-amber-500/20 shadow-md ring-1 ring-amber-400/50'
                          : isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{bgm.icon}</span>
                        <div>
                          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{bgm.title}</p>
                          <p className="text-[10px] text-amber-500 font-semibold">{bgm.tag} · {bgm.duration}s</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-bold">▶</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {audioMode === 'agent' && visualStyle === 'dialogue_scene' ? (
              /* DUAL VOICE CARDS FOR DIALOGUE SCENE */
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-purple-400">
                  {t('Phân vai giọng đọc 2 Nhân vật', 'Dual Character Voices')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Speaker A Card */}
                  <div className={`p-4 rounded-3xl border space-y-3 ${
                    isDark ? 'bg-cyan-950/20 border-cyan-800/50' : 'bg-cyan-50 border-cyan-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-cyan-500 text-slate-950 font-black text-xs">
                        👩 Nhân Vật A
                      </span>
                      <span className="text-[10px] text-cyan-500 font-bold">{speakerA.gender === 'female' ? 'Nữ' : 'Nam'}</span>
                    </div>
                    <div>
                      <div className="text-sm font-black truncate">{speakerA.name || 'Sarah'}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">{speakerA.voice_name}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSpeakerModalRole('A');
                        setIsDualVoiceModalOpen(true);
                      }}
                      className="w-full py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-extrabold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{t('Đổi Giọng Đọc A', 'Change Voice A')}</span>
                    </button>
                  </div>

                  {/* Speaker B Card */}
                  <div className={`p-4 rounded-3xl border space-y-3 ${
                    isDark ? 'bg-purple-950/20 border-purple-800/50' : 'bg-purple-50 border-purple-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-500 text-white font-black text-xs">
                        👨 Nhân Vật B
                      </span>
                      <span className="text-[10px] text-purple-400 font-bold">{speakerB.gender === 'female' ? 'Nữ' : 'Nam'}</span>
                    </div>
                    <div>
                      <div className="text-sm font-black truncate">{speakerB.name || 'Tom'}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">{speakerB.voice_name}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSpeakerModalRole('B');
                        setIsDualVoiceModalOpen(true);
                      }}
                      className="w-full py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 font-extrabold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{t('Đổi Giọng Đọc B', 'Change Voice B')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : audioMode === 'agent' ? (
              /* STANDARD SINGLE VOICE SETUP */
              <div className="space-y-5">
                {/* 1. Language selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{t('1. Chọn Ngôn Ngữ Phát Âm', '1. Spoken Language')}</span>
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {AUDIO_STUDIO_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLangChange(lang.code)}
                        className={`flex-shrink-0 py-2.5 px-3.5 rounded-2xl text-xs font-black flex items-center gap-1.5 border transition-all ${
                          selectedLang === lang.code
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                            : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Model: WynAI vs Gemini */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{t('2. Bộ Công Nghệ AI Giọng Đọc', '2. AI Voice Engine')}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleModelChange('wynai')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        voiceModel === 'wynai'
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-sm'
                          : isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>WynAI Ultra-HD (48kHz)</div>
                      <div className="text-[10px] text-cyan-500 font-bold mt-0.5">WynAI Voice Studio</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModelChange('gemini')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        voiceModel === 'gemini'
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-sm'
                          : isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>WynAI Neural Voice</div>
                      <div className="text-[10px] text-purple-400 font-bold mt-0.5">Natural Multi-dialect</div>
                    </button>
                  </div>
                </div>

                {/* 3. Voice list */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {t('3. Danh Sách Giọng Đọc AI', '3. Voice Personas')}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
                    {getDisplayVoiceList().map((v) => {
                      const isSelected = selectedVoiceName === v.code;
                      return (
                        <button
                          key={v.code}
                          type="button"
                          onClick={() => setSelectedVoiceName(v.code)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all ${
                            isSelected
                              ? 'bg-cyan-500/10 border-cyan-400 shadow-sm'
                              : isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{v.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-400 font-bold">
                              {v.tag}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 truncate">{v.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* UPLOAD AUDIO FILE */
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${
                    isDark ? 'border-slate-700 bg-slate-900/40 hover:border-cyan-500' : 'border-slate-300 bg-white hover:border-cyan-500 shadow-sm'
                  }`}
                >
                  <Upload className="w-8 h-8 text-cyan-500" />
                  <div className="text-center">
                    <div className="text-sm font-black">{uploadedFileName || t('Bấm để tải tệp audio lên (.mp3, .wav)', 'Click to upload audio file')}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{t('Hỗ trợ tối đa 20MB', 'Max size 20MB')}</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3.2: AUDIENCE, STYLE & DURATION */}
        {/* ========================================================================= */}
        {wizardStep === '3.2' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* 1. Target audience */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                {t('1. Đối Tượng Người Xem', '1. Target Audience')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'kids' as const, label: t('👶 Tiểu Học', '👶 Kids (6-10)') },
                  { id: 'teen' as const, label: t('🧑 THCS - THPT', '🧑 Teens (11-18)') },
                  { id: 'adult' as const, label: t('👨 Người Lớn', '👨 Adults / Pro') },
                ].map((aud) => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => setTargetAudience(aud.id)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      targetAudience === aud.id
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-black'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                    }`}
                  >
                    <span className="text-xs font-extrabold">{aud.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Script Style */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                {t('2. Văn Phong Bài Giảng', '2. Script Tone')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'explainer' as const, label: t('👨‍🏫 Sư Phạm Dễ Hiểu', '👨‍🏫 Clear Explainer') },
                  { id: 'storytelling' as const, label: t('📖 Kể Chuyện Hấp Dẫn', '📖 Storytelling') },
                  { id: 'humorous' as const, label: t('😄 Hài Hước Sinh Động', '😄 Humorous') },
                  { id: 'scientific' as const, label: t('🔬 Chuẩn Xác Khoa Học', '🔬 Scientific Precision') },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setScriptStyle(st.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      scriptStyle === st.id
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-black'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                    }`}
                  >
                    <span className="text-xs font-extrabold">{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Duration & Char Limits (Science Explainer allows up to 1800 chars) */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                {t('3. Thời Lượng Dự Kiến & Giới Hạn Kịch Bản', '3. Estimated Duration & Char Limits')}
              </label>
              <div className={`grid ${visualStyle === 'science_explainer' ? 'grid-cols-3' : 'grid-cols-3'} gap-2`}>
                {visualStyle === 'science_explainer' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMaxChars(600)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        maxChars === 600
                          ? 'bg-indigo-500/10 border-indigo-400 text-indigo-400 font-black'
                          : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                      }`}
                    >
                      <div className="text-xs font-black">Ngắn (~30s)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">600 ký tự</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaxChars(1100)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        maxChars === 1100
                          ? 'bg-indigo-500/10 border-indigo-400 text-indigo-400 font-black'
                          : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                      }`}
                    >
                      <div className="text-xs font-black">Vừa (~60s)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">1100 ký tự</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaxChars(1800)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        maxChars === 1800
                          ? 'bg-indigo-500/10 border-indigo-400 text-indigo-400 font-black'
                          : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                      }`}
                    >
                      <div className="text-xs font-black">Chi Tiết (~3p)</div>
                      <div className="text-[10px] text-indigo-400 font-bold mt-0.5">1800 ký tự</div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setMaxChars(500)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        maxChars === 500
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-black'
                          : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                      }`}
                    >
                      <div className="text-xs font-black">Ngắn (~30s)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">500 ký tự</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaxChars(750)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        maxChars === 750
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-black'
                          : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                      }`}
                    >
                      <div className="text-xs font-black">Vừa (~60s)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">750 ký tự</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaxChars(1100)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        maxChars === 1100
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-black'
                          : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                      }`}
                    >
                      <div className="text-xs font-black">Chi Tiết (~2p)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">1100 ký tự</div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3.3: NARRATION SCRIPT & SYNTHESIS */}
        {/* ========================================================================= */}
        {wizardStep === '3.3' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {visualStyle === 'dialogue_scene' ? (
              /* DIALOGUE SCRIPT MODE SWITCHER & EDITOR */
              <div className="space-y-4">
                {/* Mode switch: AI Auto-Write vs Custom Lines */}
                <div className={`p-1 rounded-2xl flex items-center border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/70 border-slate-300/60'
                }`}>
                  <button
                    type="button"
                    onClick={() => setScriptMode('ai_auto')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                      scriptMode === 'ai_auto'
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ✨ {t('AI Tự Soạn & Ghép Giọng (Tự Động)', 'AI Auto Script & Stitch')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptMode('custom')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                      scriptMode === 'custom'
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ✏️ {t('Tự Soạn / Chỉnh Từng Câu', 'Custom Dialogue Lines')}
                  </button>
                </div>

                {scriptMode === 'ai_auto' ? (
                  <div className={`p-4 sm:p-5 rounded-3xl border space-y-3 ${
                    isDark ? 'bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900/60 border-indigo-800/40' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-white border-indigo-200 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-base">
                        💬
                      </div>
                      <div>
                        <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {t('Chế độ AI Tự Động Phân Vai & Tạo Lời Thoại', 'AI Dual-Speaker Script Auto-Generator')}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {t('AI sẽ tự động sáng tạo 4-6 câu đối đáp tự nhiên bám sát chủ đề.', 'AI will naturally generate 4-6 alternating dialogue lines based on your topic.')}
                        </div>
                      </div>
                    </div>

                    <div className={`p-3 rounded-2xl border space-y-2 text-xs ${
                      isDark ? 'bg-black/30 border-white/5 text-slate-300' : 'bg-white/80 border-slate-200 text-slate-700'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-400">{t('Nhân vật A:', 'Speaker A:')}</span>
                        <span className="font-extrabold text-cyan-400">
                          {speakerA.gender === 'female' ? '👩 Nữ' : '👨 Nam'} · {speakerA.name} ({speakerA.voice_name})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-400">{t('Nhân vật B:', 'Speaker B:')}</span>
                        <span className="font-extrabold text-purple-400">
                          {speakerB.gender === 'female' ? '👩 Nữ' : '👨 Nam'} · {speakerB.name} ({speakerB.voice_name})
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-2 pt-1 border-t border-white/5">
                        <span className="font-bold text-slate-400 flex-shrink-0">{t('Chủ đề:', 'Topic:')}</span>
                        <span className="font-semibold text-right line-clamp-2">{prompt}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-indigo-400/90 font-medium flex items-center gap-1.5">
                      <span>💡</span>
                      <span>{t('Bấm nút bên dưới để AI viết kịch bản, thu âm từng vai và ghép thành audio hoàn chỉnh.', 'Click button below to generate dialogue lines, synthesize voices, and stitch.')}</span>
                    </div>
                  </div>
                ) : (
                  <DialogueScriptEditor
                    speakerA={speakerA}
                    speakerB={speakerB}
                    dialogueTurns={dialogueTurns}
                    onChangeTurns={setDialogueTurns}
                    onAiAutoWrite={handleAiAutoWriteDialogue}
                    isGeneratingAi={isGeneratingAudio}
                  />
                )}
              </div>
            ) : (
              /* STANDARD NARRATION SCRIPT */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {t('Kịch Bản Lời Thoại (Narration Script)', 'Narration Script')}
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">
                    {(customNarrationText || scriptText || prompt).length} / {maxChars} ký tự
                  </span>
                </div>
                <textarea
                  value={customNarrationText || scriptText || prompt}
                  onChange={(e) => {
                    setCustomNarrationText(e.target.value);
                    setScriptText(e.target.value);
                  }}
                  rows={6}
                  maxLength={maxChars}
                  placeholder={t('Nhập hoặc xem kịch bản chi tiết...', 'Enter or inspect script...')}
                  className={`w-full p-4 rounded-3xl border text-sm font-medium outline-none resize-none transition-colors ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-cyan-400' : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
                  }`}
                />
              </div>
            )}

            {/* Audio Synthesis Button */}
            <button
              type="button"
              onClick={handleGenerateAudio}
              disabled={isGeneratingAudio}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingAudio ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>
                    {t('Đang tạo âm thanh AI...', 'Generating AI audio...')} ({formatTimer(audioTimerSec)} / 05:00)
                  </span>
                </>
              ) : audioUrl ? (
                <>
                  <RefreshCw className="h-5 w-5" />
                  <span>{t('Tạo Lại Âm Thanh AI 🔄', 'Regenerate AI Voice 🔄')}</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  <span>
                    {visualStyle === 'dialogue_scene'
                      ? t('Tạo Âm Thanh Hội Thoại AI 🎙️', 'Generate Dual-Voice Dialogue 🎙️')
                      : t('Tạo Âm Thanh AI 🎙️', 'Generate AI Voiceover 🎙️')}
                  </span>
                </>
              )}
            </button>

            {/* Audio Player Preview */}
            {audioUrl && (
              <div className={`p-4 rounded-3xl border flex items-center justify-between animate-in fade-in ${
                isDark ? 'bg-cyan-950/30 border-cyan-800/40' : 'bg-cyan-50 border-cyan-200'
              }`}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTogglePlayAudio}
                    className="w-12 h-12 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md active:scale-95 transition-all"
                  >
                    {isPlayingAudioPreview ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {t('Âm thanh đã sẵn sàng nghe thử', 'Audio preview ready')}
                    </div>
                    <div className="text-[11px] text-cyan-600 font-semibold mt-0.5">
                      {audioDurationSec}s · {visualStyle === 'dialogue_scene' ? `${speakerA.name} & ${speakerB.name}` : selectedVoiceName}
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 font-extrabold text-[10px]">
                  ✓ Sẵn sàng
                </span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: ASPECT RATIO, ESTIMATED POINTS & LAUNCH */}
        {/* ========================================================================= */}
        {wizardStep === '4' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                {t('1. Tỉ Lệ Khung Hình', '1. Aspect Ratio')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '16:9' as const, label: '16:9', desc: t('Ngang · YouTube', 'Landscape') },
                  { id: '9:16' as const, label: '9:16', desc: t('Dọc · TikTok/Reels', 'Portrait') },
                  { id: '1:1' as const, label: '1:1', desc: t('Vuông · Post', 'Square') },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setAspectRatio(r.id)}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      aspectRatio === r.id
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-black'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                    }`}
                  >
                    <div className="text-sm font-black">{r.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{t('2. Thời Lượng Video Ads / Animation', '2. Video Duration')}</span>
                </label>
                <span className="text-xs font-bold text-amber-400">{audioDurationSec}s</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[10, 15, 20, 30, 60].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setAudioDurationSec(dur)}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      audioDurationSec === dur
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-black'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                    }`}
                  >
                    <div className="text-xs font-black">{dur === 10 ? '⚡ 10s' : dur === 15 ? '🔥 15s' : dur === 20 ? '✨ 20s' : dur === 30 ? '💼 30s' : '💎 60s'}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary & Point Deduction Card */}
            <div className={`p-5 rounded-3xl border space-y-3 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                {t('Tóm Tắt Cấu Hình Dự Án', 'Project Summary')}
              </h4>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('Phong cách:', 'Style:')}</span>
                  <span className="text-cyan-400 font-bold">{visualStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('Thời lượng:', 'Duration:')}</span>
                  <span>~{audioDurationSec}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('Tỉ lệ:', 'Ratio:')}</span>
                  <span>{aspectRatio}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('Điểm AI tiêu thụ:', 'AI Points Cost:')}</span>
                  </span>
                  <span className="text-sm font-black text-amber-400">
                    {estimatedPoints} pts {visualStyle === 'science_explainer' ? '(30 pts/60s)' : '(20 pts/60s)'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── DONE STATE: Success banner + Open Editor CTA ── */}
            {createdProject ? (
              <div className="space-y-3 animate-in fade-in duration-300">
                {/* Success Banner */}
                <div
                  className={`rounded-3xl border overflow-hidden ${
                    isDark
                      ? 'bg-gradient-to-br from-cyan-950/60 to-slate-900 border-cyan-500/30'
                      : 'bg-gradient-to-br from-cyan-50 to-white border-cyan-300'
                  }`}
                >
                  {/* Thumbnail strip */}
                  {createdProject.scenes?.[0] && (createdProject.scenes[0] as any).image_url && (
                    <div className="w-full h-28 overflow-hidden">
                      <img
                        src={(createdProject.scenes[0] as any).image_url}
                        alt={createdProject.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-400/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {t('Video hoạt họa đã sẵn sàng! 🎉', 'Animation ready! 🎉')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {createdProject.scenes?.length || 0} scenes ·{' '}
                          {Math.round(createdProject.duration_sec || 0)}s · {createdProject.visual_style?.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>

                    {/* Open Editor CTA */}
                    <button
                      type="button"
                      onClick={() => openProjectInEditor(createdProject)}
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all"
                    >
                      <Film className="h-4 w-4" />
                      <span>{t('Mở Trình Biên Tập Ngay ✨', 'Open Video Editor ✨')}</span>
                    </button>

                    {/* Secondary: create new */}
                    <button
                      type="button"
                      onClick={() => {
                        setCreatedProject(null);
                        setCreationStage('idle');
                        setWizardStep('1');
                        setViewMode('home');
                        setIsStudioOpen(false);
                      }}
                      className={`w-full h-10 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{t('Tạo Video Mới Khác', 'Create Another Video')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Final Launch Button */
              <button
                type="button"
                onClick={handleLaunchProject}
                disabled={isCreatingProject}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCreatingProject ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>
                      {creationStage === 'scripting' && t('Đang chia phân cảnh...', 'Partitioning scenes...')}
                      {creationStage === 'drawing' && t('Đang tạo hoạt họa vector...', 'Generating vector animations...')}
                      {creationStage === 'syncing' && t('Đang đồng bộ Whisper...', 'Syncing timeline...')}
                      {creationStage === 'done' && t('Hoàn tất!', 'Completed!')}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>{t('Khởi Tạo Video Hoạt Họa Ngay 🚀', 'Launch AI Animation 🚀')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Bottom Navigation Buttons in Studio */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-800/40">
          {wizardStep !== '1' && (
            <button
              type="button"
              onClick={() => {
                if (wizardStep === '4') setWizardStep('3.3');
                else if (wizardStep === '3.3') setWizardStep('3.2');
                else if (wizardStep === '3.2') setWizardStep('3.1');
                else if (wizardStep === '3.1') setWizardStep('2');
                else if (wizardStep === '2') setWizardStep('1');
              }}
              className={`w-32 h-14 rounded-2xl border font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${
                isDark ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('Quay lại', 'Back')}</span>
            </button>
          )}

          {wizardStep !== '4' && (
            <button
              type="button"
              onClick={() => {
                if (wizardStep === '1') setWizardStep('2');
                else if (wizardStep === '2') setWizardStep('3.1');
                else if (wizardStep === '3.1') setWizardStep('3.2');
                else if (wizardStep === '3.2') setWizardStep('3.3');
                else if (wizardStep === '3.3') setWizardStep('4');
              }}
              className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <span>{t('Tiếp tục', 'Continue')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dual Voice Selector Modal for Dialogue Scene */}
      <DualVoiceSelectorModal
        isOpen={isDualVoiceModalOpen}
        onClose={() => setIsDualVoiceModalOpen(false)}
        speakerRole={activeSpeakerModalRole}
        currentConfig={activeSpeakerModalRole === 'A' ? speakerA : speakerB}
        onSave={(cfg) => {
          if (activeSpeakerModalRole === 'A') setSpeakerA(cfg);
          else setSpeakerB(cfg);
        }}
      />

      {/* ── Login Modal — hiển thị khi user chưa đăng nhập ── */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* ── 10-Minute Countdown & Minimize-to-Background Creation Modal ── */}
      <WynMotionCreationModal
        isOpen={isCreationModalOpen}
        isMinimized={isCreationMinimized}
        onToggleMinimize={() => setIsCreationMinimized(!isCreationMinimized)}
        statusMessage={creationStatusMessage}
        progressPercent={creationProgressPercent}
        remainingSeconds={creationCountdownSec}
        projectTitle={prompt.slice(0, 30)}
        visualStyle={visualStyle}
        error={creationError}
        onCancel={() => {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          setIsCreationModalOpen(false);
          setIsCreatingProject(false);
        }}
      />

      {/* ── CapCut Fullscreen Preview & Instant Apply Modal ── */}
      <CapCutTemplateModal
        templateId={capcutModalTemplate}
        isOpen={Boolean(capcutModalTemplate)}
        defaultAspectRatio={aspectRatio === '16:9' ? '16:9' : '9:16'}
        onClose={() => setCapcutModalTemplate(null)}
        onApply={handleApplyCapCutTemplate}
      />
    </div>
  );
};

