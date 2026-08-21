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
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { wynmotionService, MotionProject } from '@/services/wynmotionService';
import { HeroBackground } from '@/components/video/HeroBackground';
import {
  WhiteboardStreamIcon,
  DoodleQuickIcon,
  AppleModernMotionIcon,
  MascotCharacterIcon,
} from '@/components/video/MotionStyleIcons';
import { ProfileSidePanel } from '@/components/navigation/ProfileSidePanel';
import { LoginModal } from '@/components/auth/LoginModal';

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
  { code: 'af_bella', name: 'Bella', desc: 'US Female 🇺🇸 · Clear', tag: 'Top Pick' },
  { code: 'af_nicole', name: 'Nicole', desc: 'US Female 🇺🇸 · Studio', tag: 'Clear' },
  { code: 'af_sarah', name: 'Sarah', desc: 'US Female 🇺🇸 · Natural', tag: 'Natural' },
  { code: 'af_sky', name: 'Sky', desc: 'US Female 🇺🇸 · Youthful', tag: 'Youth' },
  { code: 'bf_isabella', name: 'Isabella', desc: 'UK Female 🇬🇧 · Academic', tag: 'Academic' },
  { code: 'bf_emma', name: 'Emma', desc: 'UK Female 🇬🇧 · British', tag: 'British' },
  { code: 'jf_alpha', name: 'Alpha', desc: 'Japanese Female 🇯🇵', tag: 'Japanese' },
  { code: 'zf_xiaobei', name: 'Xiaobei', desc: 'Mandarin Female 🇨🇳', tag: 'Mandarin' },
  { code: 'ef_dora', name: 'Dora', desc: 'Spanish Female 🇪🇸', tag: 'Spanish' },
  { code: 'ff_siwis', name: 'Siwis', desc: 'French Female 🇫🇷', tag: 'French' },
  { code: 'hf_alpha', name: 'Alpha', desc: 'Hindi Female 🇮🇳', tag: 'Hindi' },
  { code: 'pf_dora', name: 'Dora', desc: 'Portuguese Female 🇧🇷', tag: 'Portuguese' },
];

export const KOKORO_MALE_VOICES = [
  { code: 'am_adam', name: 'Adam', desc: 'US Male 🇺🇸 · Standard', tag: 'Standard' },
  { code: 'am_michael', name: 'Michael', desc: 'US Male 🇺🇸 · Deep', tag: 'Deep' },
  { code: 'bm_george', name: 'George', desc: 'UK Male 🇬🇧 · Narrative', tag: 'Story' },
  { code: 'bm_lewis', name: 'Lewis', desc: 'UK Male 🇬🇧 · British', tag: 'British' },
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
  { code: 'Kore', name: 'Kore', desc: 'Female ♀️ · Warm & Friendly', tag: 'Top Female' },
  { code: 'Leda', name: 'Leda', desc: 'Female ♀️ · Elegant & Soft', tag: 'Elegant' },
  { code: 'Aoede', name: 'Aoede', desc: 'Female ♀️ · Melodic Rhythm', tag: 'Melodic' },
  { code: 'Callirrhoe', name: 'Callirrhoe', desc: 'Female ♀️ · Calm & Steady', tag: 'Calm' },
  { code: 'Autonoe', name: 'Autonoe', desc: 'Female ♀️ · Bright Teacher', tag: 'Teacher' },
  { code: 'Despina', name: 'Despina', desc: 'Female ♀️ · Gentle Tone', tag: 'Soft' },
  { code: 'Achernar', name: 'Achernar', desc: 'Female ♀️ · Clear & Expressive', tag: 'Clear' },
  { code: 'Pulcherrima', name: 'Pulcherrima', desc: 'Female ♀️ · Dynamic', tag: 'Expressive' },
  { code: 'Vindemiatrix', name: 'Vindemiatrix', desc: 'Female ♀️ · Formal News', tag: 'News' },
];

export const KOKORO_DEFAULT_VOICE_MAP: Record<string, string> = {
  'en-US': 'af_bella',
  'en-GB': 'bf_isabella',
  'zh': 'zf_xiaobei',
  'ja': 'jf_alpha',
  'es': 'ef_dora',
  'fr': 'ff_siwis',
  'hi': 'hf_alpha',
  'pt-BR': 'pf_dora',
  'kr': 'af_bella',
  'ko': 'af_bella',
  'vi': 'Phạm Tuyên',
};

export const AUDIO_READING_STYLES = [
  { code: 'tu_nhien', nameVi: '🗣️ Tự nhiên / Đàm thoại', nameEn: '🗣️ Natural / Conversational' },
  { code: 'tin_tuc', nameVi: '📰 Đọc bản tin / Thời sự', nameEn: '📰 News / Formal' },
  { code: 'doc_truyen', nameVi: '📖 Kể chuyện / Sách nói', nameEn: '📖 Storytelling / Audiobook' },
];

export const AiVideoTab: React.FC = () => {
  const { isVietnamese, isDark, setIsStudioOpen, t, setActiveTab } = useApp();
  const { user } = useWordaiAuth();

  // Navigation mode: 'home' (CapCut Hub) vs 'studio' (Full-screen Immersive Creation Flow)
  const [viewMode, setViewMode] = useState<'home' | 'studio'>('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Wizard Steps: 1 | 2 | 3.1 | 3.2 | 3.3 | 4
  type WizardStep = '1' | '2' | '3.1' | '3.2' | '3.3' | '4';
  const [wizardStep, setWizardStep] = useState<WizardStep>('1');

  // Step 1: Visual Style
  const [visualStyle, setVisualStyle] = useState<
    'whiteboard_stream_hand' | 'handdrawn_fast_doodle' | 'apple_modern_motion' | 'character_animation' | null
  >('whiteboard_stream_hand');
  const [characterSubtype, setCharacterSubtype] = useState<'full_character' | 'stickman'>('full_character');

  // Step 2: Prompt / Concept (Gemini-style Big Input)
  const [prompt, setPrompt] = useState(
    isVietnamese
      ? 'Mô phỏng chu trình quang hợp của cây xanh trong tự nhiên và vai trò của ánh sáng mặt trời'
      : 'Simulate the photosynthesis process of green plants and the role of sunlight',
  );

  // Step 3: Audio Source Tab ('agent' vs 'upload')
  const [audioMode, setAudioMode] = useState<'agent' | 'upload'>('agent');

  // Step 3.1: Voice Setup
  const [selectedLang, setSelectedLang] = useState(isVietnamese ? 'vi' : 'en-US');
  const [voiceModel, setVoiceModel] = useState<'wynai' | 'gemini'>('wynai');
  const [selectedVoiceName, setSelectedVoiceName] = useState(isVietnamese ? 'Phạm Tuyên' : 'af_bella');
  const [readingStyle, setReadingStyle] = useState('tu_nhien');
  const [vietnameseRegion, setVietnameseRegion] = useState<'all' | 'north' | 'central' | 'south'>('all');

  // Step 3.2: Audience & Style & Length
  const [targetAudience, setTargetAudience] = useState<'kids' | 'teen' | 'adult'>('teen');
  const [scriptStyle, setScriptStyle] = useState<'explainer' | 'storytelling' | 'humorous' | 'scientific'>('explainer');
  const [maxChars, setMaxChars] = useState<number>(500); // 500 | 750 | 1100

  // Step 3.3: Narration Script & Synthesis
  const [scriptMode, setScriptMode] = useState<'ai_auto' | 'custom'>('ai_auto');
  const [customNarrationText, setCustomNarrationText] = useState('');
  const [scriptText, setScriptText] = useState('');
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
        if (d.selectedLang) setSelectedLang(d.selectedLang);
        if (d.voiceModel) setVoiceModel(d.voiceModel);
        if (d.selectedVoiceName) setSelectedVoiceName(d.selectedVoiceName);
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

      // Cached projects
      const cached = localStorage.getItem('wynmotion_cached_projects');
      if (cached) {
        setRecentProjects(JSON.parse(cached));
      }
    } catch {}

    wynmotionService
      .listProjects()
      .then((res) => {
        if (res.projects && res.projects.length > 0) {
          setRecentProjects(res.projects);
          try {
            localStorage.setItem('wynmotion_cached_projects', JSON.stringify(res.projects));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // ── Auto-save Draft to LocalStorage ──
  useEffect(() => {
    try {
      const draft = {
        prompt,
        visualStyle,
        characterSubtype,
        selectedLang,
        voiceModel,
        selectedVoiceName,
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
    selectedLang,
    voiceModel,
    selectedVoiceName,
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

  const SAMPLE_RECENT_ITEMS = [
    { id: '0815-01', title: 'Quang hợp cây xanh', duration: '32s', bg: 'from-slate-900 to-slate-800' },
    { id: '0815-02', title: 'Robot AI thông minh', duration: '45s', bg: 'from-blue-950 to-slate-900' },
    { id: '0707-01', title: 'Giới thiệu WynMotion', duration: '28s', bg: 'from-rose-950 to-slate-900' },
    { id: '0704-01', title: 'Hội thoại tiếng Anh', duration: '50s', bg: 'from-indigo-950 to-slate-900' },
  ];

  const PROMPT_SUGGESTIONS = [
    t('🌱 Mô phỏng chu trình quang hợp của cây xanh trong tự nhiên', '🌱 Simulate the photosynthesis process of green plants in nature'),
    t('🤖 Giải thích nguyên lý hoạt động của Trí tuệ nhân tạo (AI)', '🤖 Explain how Artificial Intelligence (AI) works step by step'),
    t('📈 Giới thiệu tính năng vượt trội của nền tảng phần mềm mới với đồ thị 3D', '📈 Introduce cutting-edge software features with 3D charts'),
    t('🚀 Câu chuyện truyền cảm hứng của chú robot nhỏ vượt qua thử thách', '🚀 Inspiring journey of a little robot overcoming obstacles'),
  ];

  // Auto-switch default voice when language or model changes
  const handleLangChange = (langCode: string) => {
    setSelectedLang(langCode);
    if (voiceModel === 'wynai') {
      if (langCode === 'vi') {
        setSelectedVoiceName('Phạm Tuyên');
      } else {
        setSelectedVoiceName(KOKORO_DEFAULT_VOICE_MAP[langCode] || 'af_bella');
      }
    }
  };

  const handleModelChange = (model: 'wynai' | 'gemini') => {
    setVoiceModel(model);
    if (model === 'wynai') {
      if (selectedLang === 'vi') {
        setSelectedVoiceName('Phạm Tuyên');
      } else {
        setSelectedVoiceName(KOKORO_DEFAULT_VOICE_MAP[selectedLang] || 'af_bella');
      }
    } else {
      setSelectedVoiceName('Puck');
    }
  };

  // Filter available voices based on model and language
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

  const handleStartStudio = (initialStyle?: 'whiteboard_stream_hand' | 'handdrawn_fast_doodle' | 'apple_modern_motion' | 'character_animation') => {
    if (initialStyle) {
      setVisualStyle(initialStyle);
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

  const handleGenerateAudio = async () => {
    if (!prompt.trim()) {
      alert(isVietnamese ? 'Vui lòng nhập ý tưởng kịch bản trước' : 'Please enter a prompt idea first');
      return;
    }
    setIsGeneratingAudio(true);
    setIsPlayingAudioPreview(false);

    try {
      const res = await wynmotionService.generateScriptAndAudio({
        prompt,
        script: scriptMode === 'custom' && customNarrationText.trim() ? customNarrationText.trim() : undefined,
        language_code: selectedLang,
        target_audience: targetAudience,
        script_style: scriptStyle,
        max_chars: maxChars,
        voice_engine: voiceModel,
        voice_name: selectedVoiceName,
        reading_style: readingStyle,
      });

      const targetAudioUrl = res.audio_url || (res as any).file_url || (res as any).public_url;
      setScriptText(res.script || customNarrationText || prompt);
      setAudioUrl(targetAudioUrl);
      setAudioDurationSec(res.duration_sec || (maxChars === 500 ? 30 : maxChars === 750 ? 60 : 120));
    } catch (err: any) {
      alert(err.message || (isVietnamese ? 'Lỗi tạo giọng đọc AI' : 'Failed to generate AI voice'));
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert(isVietnamese ? 'File quá lớn (tối đa 20MB)' : 'File too large (max 20MB)');
      return;
    }
    setUploadedFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);
    setScriptText(customNarrationText.trim() || file.name);

    const audio = new Audio();
    audio.src = objectUrl;
    audio.onloadedmetadata = () => {
      setAudioDurationSec(Math.round(audio.duration));
    };
  };

  const handleCreateVideo = async () => {
    setIsCreatingProject(true);
    setCreationStage('scripting');

    try {
      setTimeout(() => setCreationStage('drawing'), 1800);
      setTimeout(() => setCreationStage('syncing'), 3800);

      const finalScript = scriptMode === 'custom' && customNarrationText.trim()
        ? customNarrationText
        : scriptText || prompt;
      const targetBg = visualStyle === 'whiteboard_stream_hand' ? '#F5EBD7' : '#FAF7EF';

      const res = await wynmotionService.generateScenes({
        title: `WynMotion - ${prompt.slice(0, 30)}`,
        prompt,
        script: finalScript,
        audio_url: audioUrl || undefined,
        duration_sec: audioDurationSec,
        aspect_ratio: aspectRatio,
        visual_style: visualStyle || 'whiteboard_stream_hand',
        character_subtype: visualStyle === 'character_animation' ? characterSubtype : undefined,
        language_code: selectedLang,
        bg_color: targetBg,
      });

      if (res.success && res.project) {
        setCreatedProject(res.project);
        setCreationStage('done');
      }
    } catch (err: any) {
      alert(err.message || (isVietnamese ? 'Không thể khởi tạo dự án WynMotion' : 'Failed to create WynMotion project'));
      setIsCreatingProject(false);
      setCreationStage('idle');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. CAPCUT HOME HUB VIEW (Full Light/Dark Responsive)
  // ─────────────────────────────────────────────────────────────────────────────
  if (viewMode === 'home') {
    return (
      <div className={`min-h-screen pb-12 select-none transition-colors duration-200 ${
        isDark ? 'bg-[#080B10] text-white' : 'bg-[#F8FAFC] text-slate-900'
      }`}>
        {/* Hidden Audio Player */}
        <audio
          ref={audioPlayerRef}
          onEnded={() => setIsPlayingAudioPreview(false)}
          className="hidden"
        />

        {/* 1. CapCut Standalone Dynamic Hero Background */}
        <HeroBackground
          onOpenUpgrade={() => setIsProfileOpen(true)}
          onOpenNotifications={() => alert(isVietnamese ? 'Bạn chưa có thông báo mới' : 'No new notifications')}
          onOpenProfile={() => (user ? setIsProfileOpen(true) : setIsLoginModalOpen(true))}
          userAvatarUrl={user?.photoURL || undefined}
          userDisplayName={user?.displayName || user?.email || undefined}
        >
          {/* Hero Content inside gradient: "Get started ›" */}
          <div className="pt-2 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300/90 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>{isVietnamese ? 'Sáng tạo video hoạt họa AI' : 'AI Motion & Animation Studio'}</span>
            </div>

            <button
              onClick={() => handleStartStudio()}
              className="group inline-flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight hover:text-cyan-300 transition-colors"
            >
              <span>{isVietnamese ? 'Bắt đầu tạo ngay' : 'Get started'}</span>
              <ChevronRight className="w-7 h-7 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </HeroBackground>

        {/* 2. Two Big Primary Action Cards (New Video & Templates) */}
        <div className="px-4 -mt-3 relative z-10 grid grid-cols-2 gap-3.5">
          {/* Card 1: New Video (Bự, Nổi Bật) */}
          <button
            onClick={() => handleStartStudio()}
            className={`group relative overflow-hidden rounded-3xl p-5 shadow-xl active:scale-[0.98] transition-all flex flex-col justify-between min-h-[140px] text-left border ${
              isDark
                ? 'bg-white text-slate-900 border-white/80 shadow-cyan-950/40 hover:bg-slate-50'
                : 'bg-white text-slate-900 border-slate-200 shadow-slate-200/80 hover:border-cyan-400'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-950 tracking-tight leading-tight">
                {isVietnamese ? 'Dự án mới' : 'New video'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isVietnamese ? 'Hoạt họa 4 bước' : '4-step generator'}
              </p>
            </div>
          </button>

          {/* Card 2: Templates */}
          <button
            onClick={() => handleStartStudio('whiteboard_stream_hand')}
            className={`group relative overflow-hidden rounded-3xl p-5 shadow-xl active:scale-[0.98] transition-all flex flex-col justify-between min-h-[140px] text-left border ${
              isDark
                ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-xl border-slate-700/60 hover:border-pink-500/50'
                : 'bg-white border-slate-200 shadow-slate-200/80 hover:border-pink-400'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/30 group-hover:scale-105 transition-transform">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-extrabold text-lg sm:text-xl tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isVietnamese ? 'Mẫu bài giảng' : 'Templates'}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {isVietnamese ? 'Toán, Lý, Sinh, Sử...' : 'STEM & Lecture kits'}
              </p>
            </div>
          </button>
        </div>

        {/* 3. Recent Projects Carousel with ">" Arrow into Library */}
        <div className="mt-7 px-4">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-500" />
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isVietnamese ? 'Dự án gần đây' : 'Recent projects'}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('library')}
              className="text-xs font-semibold text-cyan-500 hover:text-cyan-600 flex items-center gap-1"
            >
              <span>{isVietnamese ? 'Xem tất cả' : 'View all'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
            {SAMPLE_RECENT_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => handleStartStudio()}
                className="flex-shrink-0 w-32 group cursor-pointer"
              >
                <div
                  className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${item.bg} border ${
                    isDark ? 'border-slate-800 group-hover:border-cyan-500/60' : 'border-slate-200 shadow-sm'
                  } transition-all flex flex-col justify-between p-3 relative overflow-hidden`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-white/80 bg-black/50 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded-md border border-cyan-800/40">
                      {item.duration}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-cyan-500 text-white flex items-center justify-center self-center transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                  <p className="text-xs font-bold text-white truncate">{item.title}</p>
                </div>
              </div>
            ))}

            {/* Final ">" Circle Button to switch to Library Tab */}
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-shrink-0 w-16 h-32 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                isDark
                  ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-400/80 text-slate-400 hover:text-cyan-300'
                  : 'bg-white border-slate-200 shadow-sm hover:border-cyan-500 text-slate-500 hover:text-cyan-600'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <ChevronRight className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">Thư viện</span>
            </button>
          </div>
        </div>

        {/* 4. Four Supported Motion Styles */}
        <div className="mt-8 px-4">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Layers className="w-4 h-4 text-purple-500" />
              <span>{isVietnamese ? 'Phong cách hoạt họa AI' : 'AI Animation Styles'}</span>
            </h3>
            <span className="text-[11px] font-medium text-slate-400">4 styles</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Style 1: Whiteboard */}
            <button
              onClick={() => handleStartStudio('whiteboard_stream_hand')}
              className={`group p-4 rounded-3xl border transition-all text-left flex flex-col justify-between min-h-[160px] relative overflow-hidden ${
                isDark
                  ? 'bg-gradient-to-b from-slate-900/90 to-slate-900/50 border-slate-800 hover:border-cyan-500/60'
                  : 'bg-white border-slate-200 shadow-sm hover:border-cyan-500 hover:shadow-md'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <WhiteboardStreamIcon className="w-7 h-7 text-cyan-500" />
              </div>
              <div>
                <h4 className={`font-extrabold text-base group-hover:text-cyan-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isVietnamese ? 'Bảng vẽ Whiteboard' : 'Whiteboard Stream'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  {isVietnamese ? 'Nét vẽ tay Marker giảng bài' : 'Hand-drawn marker stream'}
                </p>
              </div>
            </button>

            {/* Style 2: Doodle */}
            <button
              onClick={() => handleStartStudio('handdrawn_fast_doodle')}
              className={`group p-4 rounded-3xl border transition-all text-left flex flex-col justify-between min-h-[160px] relative overflow-hidden ${
                isDark
                  ? 'bg-gradient-to-b from-slate-900/90 to-slate-900/50 border-slate-800 hover:border-amber-500/60'
                  : 'bg-white border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <DoodleQuickIcon className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h4 className={`font-extrabold text-base group-hover:text-amber-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isVietnamese ? 'Phác họa Doodle' : 'Doodle Quick'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  {isVietnamese ? 'Bút chì & Vệt màu sinh động' : 'Rapid sketch animation'}
                </p>
              </div>
            </button>

            {/* Style 3: Apple Modern Motion */}
            <button
              onClick={() => handleStartStudio('apple_modern_motion')}
              className={`group p-4 rounded-3xl border transition-all text-left flex flex-col justify-between min-h-[160px] relative overflow-hidden ${
                isDark
                  ? 'bg-gradient-to-b from-slate-900/90 to-slate-900/50 border-slate-800 hover:border-blue-500/60'
                  : 'bg-white border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AppleModernMotionIcon className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <h4 className={`font-extrabold text-base group-hover:text-blue-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isVietnamese ? 'Apple Modern' : 'Modern Motion'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  {isVietnamese ? 'Thẻ kính & Biểu đồ 3D sang trọng' : 'Kinetic glassmorphic cards'}
                </p>
              </div>
            </button>

            {/* Style 4: Mascot Character */}
            <button
              onClick={() => handleStartStudio('character_animation')}
              className={`group p-4 rounded-3xl border transition-all text-left flex flex-col justify-between min-h-[160px] relative overflow-hidden ${
                isDark
                  ? 'bg-gradient-to-b from-slate-900/90 to-slate-900/50 border-slate-800 hover:border-purple-500/60'
                  : 'bg-white border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MascotCharacterIcon className="w-7 h-7 text-purple-500" />
              </div>
              <div>
                <h4 className={`font-extrabold text-base group-hover:text-purple-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isVietnamese ? 'Mascot Cáo 3D' : 'Mascot & Character'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  {isVietnamese ? 'Nhân vật hoạt hình dẫn chuyện' : 'Animated host & avatar'}
                </p>
              </div>
            </button>
          </div>
        </div>

        <ProfileSidePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. FULL-SCREEN CREATION STUDIO (Step 1 -> 2 -> 3.1 -> 3.2 -> 3.3 -> 4)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col select-none overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#070A0F] text-slate-100' : 'bg-[#F4F6FB] text-slate-900'
    }`}>
      {/* Hidden Audio Player */}
      <audio
        ref={audioPlayerRef}
        onEnded={() => setIsPlayingAudioPreview(false)}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="audio/mp3,audio/wav,audio/m4a,audio/aac"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ── Top Bar ── */}
      <header className={`pt-12 pb-3 px-5 border-b backdrop-blur-xl flex items-center justify-between transition-colors ${
        isDark ? 'bg-slate-950/95 border-slate-850' : 'bg-white/95 border-slate-200 shadow-sm'
      }`}>
        <button
          onClick={() => {
            if (wizardStep === '1') handleExitStudio();
            else if (wizardStep === '2') setWizardStep('1');
            else if (wizardStep === '3.1') setWizardStep('2');
            else if (wizardStep === '3.2') setWizardStep('3.1');
            else if (wizardStep === '3.3') setWizardStep('3.2');
            else if (wizardStep === '4') setWizardStep('3.3');
          }}
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-95 transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Step Indicator Pill */}
        <div className="flex flex-col items-center">
          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-500">
              {wizardStep === '1' && (isVietnamese ? 'Bước 1/4: Chọn Phong cách' : 'Step 1/4: Visual Style')}
              {wizardStep === '2' && (isVietnamese ? 'Bước 2/4: Ý tưởng Video' : 'Step 2/4: Video Prompt')}
              {wizardStep === '3.1' && (isVietnamese ? 'Bước 3.1: Giọng đọc AI' : 'Step 3.1: Voice Setup')}
              {wizardStep === '3.2' && (isVietnamese ? 'Bước 3.2: Đối tượng & Phong cách' : 'Step 3.2: Audience')}
              {wizardStep === '3.3' && (isVietnamese ? 'Bước 3.3: Kịch bản & Tạo Audio' : 'Step 3.3: Script & Audio')}
              {wizardStep === '4' && (isVietnamese ? 'Bước 4/4: Tỷ lệ & Xuất Video' : 'Step 4/4: Ratio & Launch')}
            </span>
          </div>
        </div>

        <button
          onClick={handleExitStudio}
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-95 transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900'
          }`}
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* ── Scrollable Body Area (with Roomy Spacing) ── */}
      <main className="flex-1 overflow-y-auto px-5 py-6 space-y-7 max-w-lg mx-auto w-full">
        {/* ========================================================================= */}
        {/* STEP 1: 4 Ô VUÔNG TO BỰ (Visual Style Selection) */}
        {/* ========================================================================= */}
        {wizardStep === '1' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isVietnamese ? 'Chọn phong cách hiển thị' : 'Choose Animation Style'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isVietnamese
                  ? 'Bấm chọn 1 trong 4 phong cách hoạt họa dưới đây'
                  : 'Tap 1 of 4 styles tailored for teaching & storytelling'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Card 1: Whiteboard */}
              <button
                onClick={() => setVisualStyle('whiteboard_stream_hand')}
                className={`p-5 rounded-3xl text-left flex flex-col justify-between min-h-[170px] relative transition-all active:scale-[0.98] ${
                  visualStyle === 'whiteboard_stream_hand'
                    ? 'bg-gradient-to-b from-cyan-950/80 to-slate-900 border-2 border-cyan-400 shadow-xl shadow-cyan-950/50'
                    : isDark
                    ? 'bg-slate-900/80 border-2 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-2 border-slate-200 shadow-sm hover:border-cyan-400'
                }`}
              >
                {visualStyle === 'whiteboard_stream_hand' && (
                  <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                  <WhiteboardStreamIcon className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                  <h3 className={`font-extrabold text-base ${isDark || visualStyle === 'whiteboard_stream_hand' ? 'text-white' : 'text-slate-900'}`}>
                    {isVietnamese ? 'Bảng vẽ Whiteboard' : 'Whiteboard'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isVietnamese ? 'Tay vẽ Marker Notion' : 'Marker hand-drawing'}
                  </p>
                </div>
              </button>

              {/* Card 2: Doodle */}
              <button
                onClick={() => setVisualStyle('handdrawn_fast_doodle')}
                className={`p-5 rounded-3xl text-left flex flex-col justify-between min-h-[170px] relative transition-all active:scale-[0.98] ${
                  visualStyle === 'handdrawn_fast_doodle'
                    ? 'bg-gradient-to-b from-amber-950/80 to-slate-900 border-2 border-amber-400 shadow-xl shadow-amber-950/50'
                    : isDark
                    ? 'bg-slate-900/80 border-2 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-2 border-slate-200 shadow-sm hover:border-amber-400'
                }`}
              >
                {visualStyle === 'handdrawn_fast_doodle' && (
                  <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <DoodleQuickIcon className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h3 className={`font-extrabold text-base ${isDark || visualStyle === 'handdrawn_fast_doodle' ? 'text-white' : 'text-slate-900'}`}>
                    {isVietnamese ? 'Phác họa Doodle' : 'Doodle Quick'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isVietnamese ? 'Bút chì & Vệt màu tốc độ' : 'Fast sketch & color'}
                  </p>
                </div>
              </button>

              {/* Card 3: Apple Modern Motion */}
              <button
                onClick={() => setVisualStyle('apple_modern_motion')}
                className={`p-5 rounded-3xl text-left flex flex-col justify-between min-h-[170px] relative transition-all active:scale-[0.98] ${
                  visualStyle === 'apple_modern_motion'
                    ? 'bg-gradient-to-b from-blue-950/80 to-slate-900 border-2 border-blue-400 shadow-xl shadow-blue-950/50'
                    : isDark
                    ? 'bg-slate-900/80 border-2 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-2 border-slate-200 shadow-sm hover:border-blue-400'
                }`}
              >
                {visualStyle === 'apple_modern_motion' && (
                  <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-blue-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                  <AppleModernMotionIcon className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className={`font-extrabold text-base ${isDark || visualStyle === 'apple_modern_motion' ? 'text-white' : 'text-slate-900'}`}>
                    {isVietnamese ? 'Apple Modern' : 'Apple Modern'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isVietnamese ? 'Thẻ kính & Biểu đồ 3D' : 'Kinetic glass cards'}
                  </p>
                </div>
              </button>

              {/* Card 4: Mascot Character */}
              <button
                onClick={() => setVisualStyle('character_animation')}
                className={`p-5 rounded-3xl text-left flex flex-col justify-between min-h-[170px] relative transition-all active:scale-[0.98] ${
                  visualStyle === 'character_animation'
                    ? 'bg-gradient-to-b from-purple-950/80 to-slate-900 border-2 border-purple-400 shadow-xl shadow-purple-950/50'
                    : isDark
                    ? 'bg-slate-900/80 border-2 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-2 border-slate-200 shadow-sm hover:border-purple-400'
                }`}
              >
                {visualStyle === 'character_animation' && (
                  <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-purple-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                  <MascotCharacterIcon className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <h3 className={`font-extrabold text-base ${isDark || visualStyle === 'character_animation' ? 'text-white' : 'text-slate-900'}`}>
                    {isVietnamese ? 'Mascot Cáo 3D' : 'Mascot Host'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isVietnamese ? 'Nhân vật 3D biểu cảm' : 'Animated fox host'}
                  </p>
                </div>
              </button>
            </div>

            {/* Mascot Subtype Picker */}
            {visualStyle === 'character_animation' && (
              <div className={`p-4 rounded-3xl border space-y-2 ${isDark ? 'bg-slate-900/90 border-purple-800/40' : 'bg-white border-purple-200 shadow-sm'}`}>
                <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">
                  {isVietnamese ? 'Kiểu nhân vật Mascot' : 'Character Type'}
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setCharacterSubtype('full_character')}
                    className={`py-3 px-3.5 rounded-2xl text-xs font-bold transition-all ${
                      characterSubtype === 'full_character'
                        ? 'bg-purple-600 text-white shadow-md'
                        : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isVietnamese ? '🦊 Cáo WynMotion 3D' : '🦊 3D WynFox'}
                  </button>
                  <button
                    onClick={() => setCharacterSubtype('stickman')}
                    className={`py-3 px-3.5 rounded-2xl text-xs font-bold transition-all ${
                      characterSubtype === 'stickman'
                        ? 'bg-purple-600 text-white shadow-md'
                        : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isVietnamese ? '🏃 Người que Hài hước' : '🏃 Comic Stickman'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Ý TƯỞNG VIDEO (Gemini-style Big Input) */}
        {/* ========================================================================= */}
        {wizardStep === '2' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isVietnamese ? 'Chủ đề video của bạn là gì?' : 'What is your video idea?'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isVietnamese
                  ? 'Nhập bài giảng, khái niệm hoặc chọn từ các gợi ý bên dưới'
                  : 'Type a lecture concept or tap a sample below'}
              </p>
            </div>

            {/* Huge Textarea */}
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={isVietnamese ? 'Ví dụ: Mô phỏng chu trình quang hợp của cây xanh...' : 'e.g. Simulate photosynthesis cycle in green plants...'}
                className={`w-full min-h-[160px] p-5 rounded-3xl border-2 text-lg font-medium outline-none resize-none shadow-inner transition-colors ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 focus:border-cyan-400 text-white placeholder:text-slate-500'
                    : 'bg-white border-slate-200 focus:border-cyan-500 text-slate-900 placeholder:text-slate-400 shadow-slate-100'
                }`}
              />
              <div className="absolute bottom-3.5 right-4 text-xs font-semibold text-slate-400">
                {prompt.length} ký tự
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVietnamese ? '✨ Gợi ý bài giảng mẫu' : '✨ Sample Suggestions'}
              </span>
              <div className="space-y-2">
                {PROMPT_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(s.replace(/^[^\s]+\s/, ''))}
                    className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between active:scale-[0.99] ${
                      isDark
                        ? 'bg-slate-900/70 border-slate-800/80 hover:border-cyan-400/50 hover:bg-slate-850 text-slate-300 hover:text-white'
                        : 'bg-white border-slate-200 shadow-sm hover:border-cyan-500 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>{s}</span>
                    <Plus className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3.1: GIỌNG ĐỌC AI & 15 NGÔN NGỮ CHUẨN WEB (Giao diện Tinh Gọn) */}
        {/* ========================================================================= */}
        {wizardStep === '3.1' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isVietnamese ? 'Âm thanh & Giọng đọc' : 'Voiceover & Audio'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isVietnamese ? 'Chọn ngôn ngữ và diễn viên lồng tiếng AI' : 'Select language and AI voice persona'}
              </p>
            </div>

            {/* Two Big Source Tabs: Tạo mới vs Tải lên */}
            <div className={`grid grid-cols-2 gap-3 p-1.5 rounded-3xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setAudioMode('agent')}
                className={`py-3.5 px-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                  audioMode === 'agent'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/25 font-black'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isVietnamese ? 'Tạo mới Audio AI' : 'Generate AI Voice'}</span>
              </button>

              <button
                onClick={() => setAudioMode('upload')}
                className={`py-3.5 px-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                  audioMode === 'upload'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/25 font-black'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{isVietnamese ? 'Tải lên Audio' : 'Upload Audio'}</span>
              </button>
            </div>

            {/* TAB A: TẠO MỚI AUDIO (AGENT) */}
            {audioMode === 'agent' && (
              <div className="space-y-6">
                {/* 1. Ngôn ngữ (15 Quốc gia chuẩn web) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{isVietnamese ? '1. Ngôn ngữ thuyết minh' : '1. Spoken Language'}</span>
                    </label>
                    <span className="text-[11px] font-bold text-cyan-500">15 quốc gia</span>
                  </div>

                  {/* Horizontal Scroll Language Badges */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-5 px-5">
                    {AUDIO_STUDIO_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangChange(lang.code)}
                        className={`flex-shrink-0 py-2.5 px-3.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                          selectedLang === lang.code
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-500 shadow-md'
                            : isDark
                            ? 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.name}</span>
                        {selectedLang === lang.code && <Check className="w-3 h-3 text-cyan-500 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Model AI Engine */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-500" />
                    <span>{isVietnamese ? '2. Bộ công nghệ AI' : '2. Voice AI Engine'}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleModelChange('wynai')}
                      className={`p-3.5 rounded-2xl text-left border-2 transition-all ${
                        voiceModel === 'wynai'
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-950/30'
                          : isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-400'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className={`font-extrabold text-sm ${isDark || voiceModel === 'wynai' ? 'text-white' : 'text-slate-900'}`}>
                        WynAI Ultra-HD
                      </div>
                      <div className="text-[11px] text-cyan-400 mt-0.5">VieNeu-TTS & Kokoro 48kHz</div>
                    </button>

                    <button
                      onClick={() => handleModelChange('gemini')}
                      className={`p-3.5 rounded-2xl text-left border-2 transition-all ${
                        voiceModel === 'gemini'
                          ? 'bg-purple-950/40 border-purple-400 shadow-md shadow-purple-950/30'
                          : isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-400'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className={`font-extrabold text-sm ${isDark || voiceModel === 'gemini' ? 'text-white' : 'text-slate-900'}`}>
                        Google Gemini Audio
                      </div>
                      <div className="text-[11px] text-purple-400 mt-0.5">Đa sắc thái biểu cảm cao</div>
                    </button>
                  </div>
                </div>

                {/* 3. Danh sách Giọng đọc (Định dạng Tinh Gọn, Bỏ icon thừa) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isVietnamese ? '3. Chọn giọng đọc yêu thích' : '3. Select Voice Persona'}</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-semibold">{getDisplayVoiceList().length} giọng</span>
                  </div>

                  {/* Vùng miền nếu là Tiếng Việt */}
                  {selectedLang === 'vi' && voiceModel === 'wynai' && (
                    <div className={`grid grid-cols-4 gap-1.5 p-1 rounded-2xl border ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                    }`}>
                      {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'north', label: 'Miền Bắc' },
                        { id: 'central', label: 'Miền Trung' },
                        { id: 'south', label: 'Miền Nam' },
                      ].map((reg) => (
                        <button
                          key={reg.id}
                          onClick={() => setVietnameseRegion(reg.id as any)}
                          className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                            vietnameseRegion === reg.id
                              ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          {reg.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Lưới danh sách giọng đọc (Gọn gàng, Rõ ràng) */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {getDisplayVoiceList().map((v: any) => (
                      <div
                        key={v.code}
                        onClick={() => setSelectedVoiceName(v.code)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                          selectedVoiceName === v.code
                            ? 'bg-cyan-500/10 border-cyan-400 shadow-sm'
                            : isDark
                            ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                            : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {v.name}
                            </h4>
                            <span className="text-xs text-slate-400 font-medium truncate">
                              ({v.desc})
                            </span>
                          </div>
                          <p className="text-[11px] text-cyan-500 font-semibold mt-0.5">
                            {voiceModel === 'wynai' ? '48kHz Ultra-HD Studio' : 'Gemini Expressive'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {v.tag && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              isDark ? 'bg-cyan-950 text-cyan-300 border-cyan-800/40' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                            }`}>
                              {v.tag}
                            </span>
                          )}
                          {selectedVoiceName === v.code && (
                            <div className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Phong cách đọc */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isVietnamese ? '4. Phong cách thể hiện' : '4. Reading Style'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {AUDIO_READING_STYLES.map((st) => (
                      <button
                        key={st.code}
                        onClick={() => setReadingStyle(st.code)}
                        className={`p-3 rounded-2xl text-center border-2 transition-all ${
                          readingStyle === st.code
                            ? 'bg-cyan-500/10 border-cyan-400'
                            : isDark
                            ? 'bg-slate-900 border-slate-800 text-slate-400'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {isVietnamese ? st.nameVi : st.nameEn}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB B: TẢI LÊN AUDIO */}
            {audioMode === 'upload' && (
              <div className={`p-8 rounded-3xl border-2 border-dashed text-center space-y-4 ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
              }`}>
                <div className="w-16 h-16 rounded-3xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {uploadedFileName || (isVietnamese ? 'Chọn file âm thanh (.mp3, .wav, .m4a)' : 'Choose audio file')}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isVietnamese ? 'Hỗ trợ tải lên bài giảng thu âm sẵn (tối đa 20MB)' : 'Upload pre-recorded voiceover (max 20MB)'}
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-sm shadow-md active:scale-95 transition-all"
                >
                  {isVietnamese ? 'Chọn file từ máy' : 'Browse Files'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3.2: ĐỐI TƯỢNG, VĂN PHONG & THỜI LƯỢNG (Thoáng mắt, Rộng rãi) */}
        {/* ========================================================================= */}
        {wizardStep === '3.2' && (
          <div className="space-y-7 animate-in fade-in-50 duration-200">
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isVietnamese ? 'Đối tượng & Văn phong' : 'Audience & Style'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isVietnamese ? 'Tùy chỉnh phong cách sư phạm phù hợp với người xem' : 'Customize tone and expected video length'}
              </p>
            </div>

            {/* 1. Đối tượng người xem */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                <span>{isVietnamese ? '1. Đối tượng người xem' : '1. Target Audience'}</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'kids', label: 'Tiểu học', desc: '6-10 tuổi', emoji: '🎒' },
                  { id: 'teen', label: 'THCS - THPT', desc: '11-18 tuổi', emoji: '📚' },
                  { id: 'adult', label: 'Người lớn', desc: 'Sinh viên, GV', emoji: '🎓' },
                ].map((aud) => (
                  <button
                    key={aud.id}
                    onClick={() => setTargetAudience(aud.id as any)}
                    className={`p-4 rounded-3xl text-center border-2 transition-all ${
                      targetAudience === aud.id
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-sm'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-400'
                        : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                    }`}
                  >
                    <div className="text-2xl">{aud.emoji}</div>
                    <div className={`text-xs font-extrabold mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{aud.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{aud.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Văn phong bài giảng */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>{isVietnamese ? '2. Văn phong bài giảng' : '2. Script Style'}</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'explainer', label: '💡 Sư phạm dễ hiểu' },
                  { id: 'storytelling', label: '📜 Kể chuyện cuốn hút' },
                  { id: 'humorous', label: '😄 Hài hước sinh động' },
                  { id: 'scientific', label: '🔬 Khoa học chuẩn xác' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setScriptStyle(st.id as any)}
                    className={`py-4 px-3 rounded-2xl text-xs font-extrabold transition-all border ${
                      scriptStyle === st.id
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black shadow-md border-transparent'
                        : isDark
                        ? 'bg-slate-900 text-slate-300 border-slate-800'
                        : 'bg-white text-slate-700 border-slate-200 shadow-sm'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Độ dài kịch bản */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{isVietnamese ? '3. Thời lượng video dự kiến' : '3. Expected Duration'}</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { chars: 500, label: '~30 giây', desc: '500 ký tự' },
                  { chars: 750, label: '~60 giây', desc: '750 ký tự' },
                  { chars: 1100, label: '~2 phút', desc: '1100 ký tự' },
                ].map((len) => (
                  <button
                    key={len.chars}
                    onClick={() => setMaxChars(len.chars)}
                    className={`p-4 rounded-3xl text-center border-2 transition-all ${
                      maxChars === len.chars
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-sm'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-400'
                        : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                    }`}
                  >
                    <div className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{len.label}</div>
                    <div className="text-[11px] text-cyan-500 font-semibold mt-0.5">{len.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3.3: KỊCH BẢN & TẠO ÂM THANH AI (Màn hình Riêng Biệt Thoải Mái) */}
        {/* ========================================================================= */}
        {wizardStep === '3.3' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isVietnamese ? 'Kịch bản & Tạo Âm thanh' : 'Script & Audio Generation'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isVietnamese ? 'Soạn lời thoại bài giảng và khởi tạo file lồng tiếng AI' : 'Draft narration text and synthesize audio'}
              </p>
            </div>

            {/* Mode Switch: AI Tự viết vs Tự nhập */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isVietnamese ? 'Lời thoại thuyết minh' : 'Narration Text'}
                </label>
                <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    onClick={() => setScriptMode('ai_auto')}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                      scriptMode === 'ai_auto' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    AI Tự viết
                  </button>
                  <button
                    onClick={() => setScriptMode('custom')}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                      scriptMode === 'custom' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    Tự nhập
                  </button>
                </div>
              </div>

              {scriptMode === 'custom' ? (
                <textarea
                  value={customNarrationText}
                  onChange={(e) => setCustomNarrationText(e.target.value)}
                  placeholder={isVietnamese ? 'Dán hoặc gõ kịch bản lời thoại của bạn vào đây...' : 'Paste or type custom narration script here...'}
                  className={`w-full min-h-[160px] p-4 rounded-3xl border text-sm outline-none resize-none transition-colors ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-white focus:border-cyan-400'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
                  }`}
                />
              ) : (
                <div className={`p-5 rounded-3xl border text-sm leading-relaxed ${
                  isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                }`}>
                  {scriptText || (
                    <span className="text-slate-400 italic">
                      {isVietnamese
                        ? '✨ AI sẽ tự động phân tích và tạo kịch bản sư phạm hoàn chỉnh khi bạn bấm nút Tạo bên dưới.'
                        : '✨ AI will automatically generate an educational script when you tap the button below.'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Nút Tạo Âm Thanh AI kèm Countdown Timer 5:00 max */}
            <div className="space-y-3">
              <button
                onClick={handleGenerateAudio}
                disabled={isGeneratingAudio}
                className={`w-full h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md ${
                  isGeneratingAudio
                    ? 'bg-cyan-950 border border-cyan-800 text-cyan-300'
                    : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 shadow-cyan-500/25 cursor-pointer'
                }`}
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                    <span>
                      {isVietnamese ? 'Đang tạo âm thanh...' : 'Generating Audio...'} ({formatTimer(audioTimerSec)} / 05:00)
                    </span>
                  </>
                ) : audioUrl ? (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>{isVietnamese ? 'Tạo lại âm thanh AI 🔄' : 'Regenerate AI Audio 🔄'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>{isVietnamese ? 'Tạo âm thanh AI 🎙️' : 'Generate AI Audio 🎙️'}</span>
                  </>
                )}
              </button>

              {/* Audio Preview Bar with Direct Player */}
              {audioUrl && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between animate-in fade-in ${
                  isDark ? 'bg-cyan-950/40 border-cyan-800/40' : 'bg-cyan-50 border-cyan-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTogglePlayAudio}
                      className="w-12 h-12 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md active:scale-95 transition-all"
                    >
                      {isPlayingAudioPreview ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <div>
                      <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {isVietnamese ? 'Đã tạo giọng đọc thành công' : 'Audio generated successfully'}
                      </div>
                      <div className="text-[11px] text-cyan-600 font-semibold mt-0.5">
                        ~{audioDurationSec}s · {selectedVoiceName} ({selectedLang})
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: TỶ LỆ KHUNG HÌNH & XUẤT VIDEO (Ratio & Launch) */}
        {/* ========================================================================= */}
        {wizardStep === '4' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isVietnamese ? 'Tỷ lệ khung hình & Khởi tạo' : 'Aspect Ratio & Export'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isVietnamese ? 'Chọn kích thước phù hợp với kênh chia sẻ của bạn' : 'Select layout format'}
              </p>
            </div>

            {/* 3 Large Ratio Cards */}
            <div className="grid grid-cols-3 gap-3">
              {/* 16:9 */}
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`p-4 rounded-3xl text-center border-2 transition-all flex flex-col items-center justify-between min-h-[140px] ${
                  aspectRatio === '16:9'
                    ? 'bg-cyan-500/10 border-cyan-400 shadow-md'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400'
                    : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                }`}
              >
                <div className="w-14 h-9 rounded-lg border-2 border-current flex items-center justify-center text-[10px] font-bold">
                  16:9
                </div>
                <div>
                  <div className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Ngang</div>
                  <div className="text-[10px] text-slate-400">YouTube, Slide</div>
                </div>
              </button>

              {/* 9:16 */}
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`p-4 rounded-3xl text-center border-2 transition-all flex flex-col items-center justify-between min-h-[140px] ${
                  aspectRatio === '9:16'
                    ? 'bg-cyan-500/10 border-cyan-400 shadow-md'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400'
                    : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                }`}
              >
                <div className="w-9 h-14 rounded-lg border-2 border-current flex items-center justify-center text-[10px] font-bold">
                  9:16
                </div>
                <div>
                  <div className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Dọc</div>
                  <div className="text-[10px] text-slate-400">TikTok, Shorts</div>
                </div>
              </button>

              {/* 1:1 */}
              <button
                onClick={() => setAspectRatio('1:1')}
                className={`p-4 rounded-3xl text-center border-2 transition-all flex flex-col items-center justify-between min-h-[140px] ${
                  aspectRatio === '1:1'
                    ? 'bg-cyan-500/10 border-cyan-400 shadow-md'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400'
                    : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                }`}
              >
                <div className="w-11 h-11 rounded-lg border-2 border-current flex items-center justify-center text-[10px] font-bold">
                  1:1
                </div>
                <div>
                  <div className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Vuông</div>
                  <div className="text-[10px] text-slate-400">Instagram, FB</div>
                </div>
              </button>
            </div>

            {/* Summary Card */}
            <div className={`p-5 rounded-3xl border space-y-3 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVietnamese ? '📋 Tóm tắt cấu hình video' : '📋 Video Summary'}
              </span>
              <div className="space-y-2 text-xs">
                <div className={`flex justify-between py-1 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <span className="text-slate-400">Phong cách:</span>
                  <span className={`font-bold uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{visualStyle}</span>
                </div>
                <div className={`flex justify-between py-1 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <span className="text-slate-400">Giọng đọc:</span>
                  <span className="font-bold text-cyan-500">{selectedVoiceName} ({selectedLang})</span>
                </div>
                <div className={`flex justify-between py-1 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <span className="text-slate-400">Thời lượng dự kiến:</span>
                  <span className="font-bold text-emerald-500">~{audioDurationSec} giây</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Tỷ lệ khung hình:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{aspectRatio}</span>
                </div>
              </div>
            </div>

            {/* Generation Progress Overlay */}
            {isCreatingProject && (
              <div className="p-6 rounded-3xl bg-cyan-950/70 border border-cyan-800/80 text-center space-y-4 animate-in fade-in">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                <div>
                  <h4 className="font-extrabold text-lg text-white">
                    {creationStage === 'scripting' && (isVietnamese ? 'AI đang phân tích kịch bản...' : 'Analyzing script...')}
                    {creationStage === 'drawing' && (isVietnamese ? 'AI đang phác thảo phân cảnh đồ họa...' : 'Drafting graphic scenes...')}
                    {creationStage === 'syncing' && (isVietnamese ? 'Đồng bộ chuyển động âm thanh...' : 'Syncing motion with audio...')}
                    {creationStage === 'done' && (isVietnamese ? 'Hoàn thành video thành công!' : 'Video created successfully!')}
                  </h4>
                  <p className="text-xs text-cyan-300 mt-1">
                    {isVietnamese ? 'Hệ thống đang xuất video độ phân giải cao' : 'Rendering high-resolution animation'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Fixed Bottom Action Bar with 2 Buttons of EQUAL HEIGHT (h-14) ── */}
      <footer className={`p-5 pb-9 border-t backdrop-blur-xl transition-colors ${
        isDark ? 'bg-slate-950/95 border-slate-850' : 'bg-white/95 border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]'
      }`}>
        <div className="max-w-lg mx-auto w-full">
          {/* STEP 1 FOOTER */}
          {wizardStep === '1' && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleExitStudio}
                className={`w-32 h-14 rounded-2xl border font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isVietnamese ? 'Trang chủ' : 'Home'}</span>
              </button>

              <button
                onClick={() => setWizardStep('2')}
                disabled={!visualStyle}
                className={`flex-1 h-14 rounded-2xl text-slate-950 font-black text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                  visualStyle
                    ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 shadow-cyan-500/25 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 opacity-40 cursor-not-allowed'
                }`}
              >
                <span>{isVietnamese ? 'Tiếp tục: Ý tưởng' : 'Continue: Idea'}</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          )}

          {/* STEP 2 FOOTER */}
          {wizardStep === '2' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWizardStep('1')}
                className={`w-32 h-14 rounded-2xl border font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isVietnamese ? 'Quay lại' : 'Back'}</span>
              </button>

              <button
                onClick={() => setWizardStep('3.1')}
                disabled={!prompt.trim()}
                className={`flex-1 h-14 rounded-2xl text-slate-950 font-black text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                  prompt.trim()
                    ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 shadow-cyan-500/25 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 opacity-40 cursor-not-allowed'
                }`}
              >
                <span>{isVietnamese ? 'Tiếp tục: Giọng đọc' : 'Continue: Voice'}</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          )}

          {/* STEP 3.1 FOOTER */}
          {wizardStep === '3.1' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWizardStep('2')}
                className={`w-32 h-14 rounded-2xl border font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isVietnamese ? 'Quay lại' : 'Back'}</span>
              </button>

              <button
                onClick={() => {
                  if (audioMode === 'upload') {
                    setWizardStep('4');
                  } else {
                    setWizardStep('3.2');
                  }
                }}
                disabled={audioMode === 'agent' && !selectedVoiceName}
                className={`flex-1 h-14 rounded-2xl text-slate-950 font-black text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                  (audioMode === 'agent' && selectedVoiceName) || audioMode === 'upload'
                    ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 shadow-cyan-500/25 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 opacity-40 cursor-not-allowed'
                }`}
              >
                <span>{isVietnamese ? 'Tiếp tục: Đối tượng' : 'Continue: Audience'}</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          )}

          {/* STEP 3.2 FOOTER */}
          {wizardStep === '3.2' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWizardStep('3.1')}
                className={`w-32 h-14 rounded-2xl border font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isVietnamese ? 'Quay lại' : 'Back'}</span>
              </button>

              <button
                onClick={() => setWizardStep('3.3')}
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isVietnamese ? 'Tiếp tục: Kịch bản' : 'Continue: Script'}</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          )}

          {/* STEP 3.3 FOOTER */}
          {wizardStep === '3.3' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWizardStep('3.2')}
                className={`w-32 h-14 rounded-2xl border font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isVietnamese ? 'Quay lại' : 'Back'}</span>
              </button>

              <button
                onClick={() => setWizardStep('4')}
                disabled={scriptMode === 'custom' && !customNarrationText.trim()}
                className={`flex-1 h-14 rounded-2xl text-slate-950 font-black text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                  scriptMode === 'ai_auto' || (scriptMode === 'custom' && customNarrationText.trim())
                    ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 shadow-cyan-500/25 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 opacity-40 cursor-not-allowed'
                }`}
              >
                <span>{isVietnamese ? 'Tiếp tục: Tỷ lệ & Xuất' : 'Continue: Ratio'}</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          )}

          {/* STEP 4 FOOTER */}
          {wizardStep === '4' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => (audioMode === 'upload' ? setWizardStep('3.1') : setWizardStep('3.3'))}
                className={`w-32 h-14 rounded-2xl border font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isVietnamese ? 'Quay lại' : 'Back'}</span>
              </button>

              <button
                onClick={handleCreateVideo}
                disabled={isCreatingProject}
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 disabled:opacity-50 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCreatingProject ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-slate-950" />
                    <span>{isVietnamese ? 'Đang tạo phân cảnh AI...' : 'Creating Motion Video...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 text-slate-950 fill-current" />
                    <span>{isVietnamese ? 'Tạo Video Hoạt Họa AI Ngay ✨' : 'Generate AI Video Now ✨'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
