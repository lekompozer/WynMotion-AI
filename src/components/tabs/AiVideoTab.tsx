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
} from '@/components/video/MotionStyleIcons';
import { ProfileSidePanel } from '@/components/navigation/ProfileSidePanel';
import { LoginModal } from '@/components/auth/LoginModal';
import { DualVoiceSelectorModal } from '@/components/video/DualVoiceSelectorModal';
import { DialogueScriptEditor } from '@/components/video/DialogueScriptEditor';

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
  { code: 'Kore', name: 'Kore', desc: 'Female ♀️ · Sweet & Warm', tag: 'Top Pick' },
  { code: 'Aoede', name: 'Aoede', desc: 'Female ♀️ · Clear & Expressive', tag: 'Expressive' },
  { code: 'Leda', name: 'Leda', desc: 'Female ♀️ · Gentle Storyteller', tag: 'Story' },
  { code: 'Zephyr', name: 'Zephyr', desc: 'Female ♀️ · Calm & Academic', tag: 'Academic' },
  { code: 'Despina', name: 'Despina', desc: 'Female ♀️ · Friendly Host', tag: 'Friendly' },
];

export const KOKORO_DEFAULT_VOICE_MAP: Record<string, string> = {
  'en-US': 'af_bella',
  'en-GB': 'bf_emma',
  'ja': 'jf_alpha',
  'zh': 'zf_xiaobei',
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

  // Navigation mode: 'home' (CapCut Hub) vs 'studio' (Creation Flow)
  const [viewMode, setViewMode] = useState<'home' | 'studio'>('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
    name: 'Sarah',
    gender: 'female',
    voice_engine: 'wynai',
    voice_name: 'af_bella',
    language_code: 'en-US',
  });
  const [speakerB, setSpeakerB] = useState<DialogueSpeakerConfig>({
    name: 'Tom',
    gender: 'male',
    voice_engine: 'wynai',
    voice_name: 'am_adam',
    language_code: 'en-US',
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

  const SAMPLE_RECENT_ITEMS = [
    { id: '0815-01', title: 'Quang hợp cây xanh', duration: '32s', bg: 'from-slate-900 to-slate-800' },
    { id: '0815-02', title: 'Hội thoại quán Cafe 3D', duration: '45s', bg: 'from-cyan-950 to-slate-900' },
    { id: '0707-01', title: 'Định luật Newton F=ma', duration: '60s', bg: 'from-indigo-950 to-slate-900' },
    { id: '0704-01', title: 'Hội thoại phỏng vấn xin việc', duration: '50s', bg: 'from-purple-950 to-slate-900' },
  ];

  // Dynamic Prompt Suggestions based on selected style
  const getPromptSuggestions = () => {
    if (visualStyle === 'dialogue_scene') {
      return [
        t('☕ Hội thoại gọi món & trò chuyện tại quán cà phê', '☕ Ordering espresso & chatting in a cozy coffee shop'),
        t('💼 Phỏng vấn xin việc vị trí Marketing Manager', '💼 Job Interview for Marketing Manager position'),
        t('✈️ Hỏi đường & check-in tại sân bay quốc tế', '✈️ Asking for directions & checking in at airport'),
        t('🎓 Thảo luận bài tập nhóm về Trí tuệ nhân tạo', '🎓 Classroom group discussion about Artificial Intelligence'),
      ];
    }
    if (visualStyle === 'science_explainer') {
      return [
        t('🚀 Định luật II Newton (F = ma) và chuyển động ném vật', "🚀 Newton's Second Law (F = ma) and projectile motion vectors"),
        t('📐 Chứng minh Định lý Pytago (a² + b² = c²) bằng hình học động', '📐 Geometric visual proof of Pythagorean Theorem (a² + b² = c²)'),
        t('⚗️ Quá trình hình thành liên kết cộng hóa trị phân tử nước H₂O', '⚗️ Covalent bond formation in water molecule (2H₂ + O₂ → 2H₂O)'),
        t('🧬 Cấu trúc xoắn kép DNA và cơ chế nhân đôi tế bào', '🧬 DNA double helix structure and cellular replication mechanics'),
      ];
    }
    return [
      t('🌱 Mô phỏng chu trình quang hợp của cây xanh trong tự nhiên', '🌱 Simulate the photosynthesis process of green plants in nature'),
      t('🤖 Giải thích nguyên lý hoạt động của Trí tuệ nhân tạo (AI)', '🤖 Explain how Artificial Intelligence (AI) works step by step'),
      t('📈 Giới thiệu tính năng vượt trội của nền tảng phần mềm mới với đồ thị 3D', '📈 Introduce cutting-edge software features with 3D charts'),
      t('🚀 Câu chuyện truyền cảm hứng của chú robot nhỏ vượt qua thử thách', '🚀 Inspiring journey of a little robot overcoming obstacles'),
    ];
  };

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
          language_code: speakerA.language_code || 'en-US',
        });
        const targetAudioUrl = res.audio_url || (res as any).file_url || (res as any).public_url;
        setScriptText(res.script);
        if (res.dialogue_turns && res.dialogue_turns.length > 0) {
          setDialogueTurns(res.dialogue_turns);
        }
        setAudioUrl(targetAudioUrl);
        setAudioDurationSec(res.duration_sec || 45);
      } else {
        // Standard Single Voice Synthesis
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
        setAudioDurationSec(res.duration_sec || (maxChars === 500 ? 30 : maxChars === 750 ? 60 : maxChars === 1100 ? 120 : 160));
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
    setIsCreatingProject(true);
    setCreationStage('scripting');

    try {
      setTimeout(() => setCreationStage('drawing'), 2000);
      setTimeout(() => setCreationStage('syncing'), 4500);

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
        dialogue_speakers: visualStyle === 'dialogue_scene' ? { speaker_a: speakerA, speaker_b: speakerB } : undefined,
        language_code: visualStyle === 'dialogue_scene' ? speakerA.language_code : selectedLang,
      });

      if (res.project) {
        setCreatedProject(res.project);
        setRecentProjects((prev) => [res.project, ...prev.filter((p) => p.project_id !== res.project.project_id)]);
      }
      setCreationStage('done');
    } catch (err: any) {
      alert(err.message || (isVietnamese ? 'Lỗi tạo video hoạt họa' : 'Failed to generate animation video'));
      setIsCreatingProject(false);
      setCreationStage('idle');
    }
  };

  // 6 Styles Organised into 2 Groups (Clean titles, monochrome icons)
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

  const estimatedPoints = calculateProjectPoints(visualStyle, audioDurationSec);

  // =========================================================================
  // VIEW MODE A: CAPCUT-STYLE HOME HUB
  // =========================================================================
  if (viewMode === 'home') {
    return (
      <div className={`pb-2 transition-colors duration-200 ${isDark ? 'bg-[#080B10]' : 'bg-[#FAFAFC]'}`}>
        <HeroBackground
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenUpgrade={() => setIsProfileOpen(true)}
        >
          {/* Banner Headline Text (White text on colorful animated background, above New Project) */}
          <div
            onClick={() => handleStartStudio('whiteboard_stream_hand')}
            className="mt-6 mb-1 cursor-pointer active:opacity-90 transition-opacity"
          >
            <div className="text-xs font-normal text-white/85 tracking-wide">
              {t('Tạo video từ ý tưởng', 'Create videos from ideas')}
            </div>
            <div className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
              <span>{t('Bắt đầu', 'Get started')}</span>
              <span className="font-extrabold text-sky-200 text-lg">&gt;</span>
            </div>
          </div>
        </HeroBackground>

        <div className="max-w-xl mx-auto px-4 -mt-8 relative z-10 space-y-6">
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

            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {(recentProjects.length > 0 ? recentProjects : SAMPLE_RECENT_ITEMS).map((item: any) => {
                const coverImg = item.scenes?.[0]?.image_url || item.thumbnail_url;
                return (
                  <div
                    key={item.id || item.project_id}
                    onClick={() => setActiveTab('library')}
                    style={coverImg ? { backgroundImage: `url(${coverImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                    className="flex-shrink-0 w-32 h-36 rounded-2xl p-3 bg-black text-white border border-slate-800/80 cursor-pointer active:scale-95 transition-all flex flex-col justify-end relative overflow-hidden shadow-sm"
                  >
                    {/* Dark gradient overlay for clear text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10">
                      <h4 className="text-[11px] font-medium text-white leading-snug line-clamp-2">{item.title}</h4>
                      <span className="text-[9px] text-slate-400 font-normal mt-0.5 block">{item.duration || '30s'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6 AI Animation Styles in 2 categories (Clean text, Monochrome icons, No tags) */}
          <div className="space-y-6">
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

            {/* Subtype for Character Animation */}
            {visualStyle === 'character_animation' && (
              <div className="space-y-2 p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5">
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

            {/* Subtype for Dialogue Scene */}
            {visualStyle === 'dialogue_scene' && (
              <div className="space-y-2 p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5">
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

            {/* Subtype for Science Explainer */}
            {visualStyle === 'science_explainer' && (
              <div className="space-y-2 p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5">
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
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {dom.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PROMPT & CONCEPTS */}
        {/* ========================================================================= */}
        {wizardStep === '2' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                {visualStyle === 'dialogue_scene'
                  ? t('Chủ đề hội thoại 2 nhân vật', 'Two-Character Conversation Topic')
                  : visualStyle === 'science_explainer'
                  ? t('Đề bài toán học / Hiện tượng khoa học', 'STEM Problem / Scientific Concept')
                  : t('Mô tả ý tưởng video (Prompt)', 'Video Prompt Concept')}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                placeholder={t('Nhập chủ đề chi tiết...', 'Enter detailed topic...')}
                className={`w-full p-4 rounded-3xl border text-base font-semibold outline-none resize-none transition-colors ${
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
                <span>{t('Tải Lên Audio Có Sẵn', 'Upload Audio File')}</span>
              </button>
            </div>

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
                      <div className="text-[10px] text-cyan-500 font-bold mt-0.5">VieNeu & Kokoro Studio</div>
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
                      <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Google Gemini AI</div>
                      <div className="text-[10px] text-purple-400 font-bold mt-0.5">Expressive Multimodal</div>
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
              /* DIALOGUE SCRIPT EDITOR */
              <DialogueScriptEditor
                speakerA={speakerA}
                speakerB={speakerB}
                dialogueTurns={dialogueTurns}
                onChangeTurns={setDialogueTurns}
                onAiAutoWrite={handleAiAutoWriteDialogue}
                isGeneratingAi={isGeneratingAudio}
              />
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

            {/* Final Launch Button */}
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
    </div>
  );
};
