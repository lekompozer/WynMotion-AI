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
  Scissors,
  Crown,
  Film,
  Layers,
  FileText,
  Sliders,
  Users,
  Video,
  Clock,
  ExternalLink,
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

export const AiVideoTab: React.FC = () => {
  const { isVietnamese, t, setActiveTab } = useApp();
  const { user } = useWordaiAuth();

  // Navigation state: 'home' (CapCut style) vs 'studio' (Creation Wizard)
  const [viewMode, setViewMode] = useState<'home' | 'studio'>('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Wizard Step (1: Style, 2: Idea, 3: Audio, 4: Ratio & Launch)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Visual Style
  const [visualStyle, setVisualStyle] = useState<
    'whiteboard_stream_hand' | 'handdrawn_fast_doodle' | 'apple_modern_motion' | 'character_animation'
  >('whiteboard_stream_hand');
  const [characterSubtype, setCharacterSubtype] = useState<'full_character' | 'stickman'>('full_character');

  // Step 2: Prompt / Concept
  const [prompt, setPrompt] = useState(
    isVietnamese
      ? 'Mô phỏng chu trình quang hợp của cây xanh trong tự nhiên'
      : 'Simulate the photosynthesis process of green plants in nature',
  );

  // Step 3: Voiceover & Audio
  const [selectedLang, setSelectedLang] = useState(isVietnamese ? 'vi' : 'en-US');
  const [voiceModel, setVoiceModel] = useState<'wynai' | 'gemini'>('wynai');
  const [selectedVoiceName, setSelectedVoiceName] = useState(isVietnamese ? 'Phạm Tuyên' : 'af_bella');
  const [targetAudience, setTargetAudience] = useState<'kids' | 'teen' | 'adult'>('teen');
  const [scriptStyle, setScriptStyle] = useState<'explainer' | 'storytelling' | 'humorous' | 'scientific'>('explainer');
  const [maxChars, setMaxChars] = useState<number>(500);
  const [customNarrationText, setCustomNarrationText] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDurationSec, setAudioDurationSec] = useState<number>(30);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);

  // Step 4: Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [activeProject, setActiveProject] = useState<MotionProject | null>(null);

  const [recentProjects, setRecentProjects] = useState<MotionProject[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    wynmotionService
      .listProjects()
      .then((res) => {
        if (res.projects && res.projects.length > 0) {
          setRecentProjects(res.projects);
        }
      })
      .catch(() => {});
  }, []);

  const SAMPLE_RECENT_ITEMS = [
    { id: '0815-01', title: 'Quang hợp cây xanh', duration: '32s', bg: 'from-slate-900 to-slate-800' },
    { id: '0815-02', title: 'Robot AI thông minh', duration: '45s', bg: 'from-blue-950 to-slate-900' },
    { id: '0707-01', title: 'Giới thiệu WynMotion', duration: '28s', bg: 'from-rose-950 to-slate-900' },
    { id: '0704-01', title: 'Hội thoại tiếng Anh', duration: '50s', bg: 'from-indigo-950 to-slate-900' },
  ];

  const PROMPT_SUGGESTIONS = [
    t('Mô phỏng chu trình quang hợp của cây xanh trong tự nhiên', 'Simulate the photosynthesis process of green plants in nature'),
    t('Giải thích nguyên lý hoạt động của Trí tuệ nhân tạo (AI)', 'Explain how Artificial Intelligence (AI) works step by step'),
    t('Giới thiệu tính năng vượt trội của nền tảng phần mềm mới', 'Introduce cutting-edge software features with 3D charts'),
  ];

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
    if (!prompt.trim()) return;
    setIsGeneratingAudio(true);
    setIsPlayingAudioPreview(false);

    try {
      const res = await wynmotionService.generateScriptAndAudio({
        prompt,
        script: customNarrationText.trim() || undefined,
        language_code: selectedLang,
        target_audience: targetAudience,
        script_style: scriptStyle,
        max_chars: maxChars,
        voice_engine: voiceModel,
        voice_name: selectedVoiceName,
      });

      setScriptText(res.script);
      setAudioUrl(res.audio_url);
      setAudioDurationSec(res.duration_sec || 30);
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo giọng đọc AI');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleCreateProject = async () => {
    if (!prompt.trim()) return;
    setIsCreatingProject(true);

    try {
      const res = await wynmotionService.generateScenes({
        title: `WynMotion - ${prompt.slice(0, 25)}`,
        prompt,
        script: scriptText || customNarrationText || prompt,
        audio_url: audioUrl || undefined,
        duration_sec: audioDurationSec,
        aspect_ratio: aspectRatio,
        visual_style: visualStyle,
        character_subtype: characterSubtype,
        language_code: selectedLang,
      });

      if (res.success && res.project) {
        setActiveProject(res.project);
      }
    } catch (err: any) {
      alert(err.message || 'Không thể tạo dự án');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const launchStudioWithStyle = (
    style: 'whiteboard_stream_hand' | 'handdrawn_fast_doodle' | 'apple_modern_motion' | 'character_animation',
  ) => {
    setVisualStyle(style);
    setCurrentStep(2);
    setViewMode('studio');
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <audio
        ref={audioPlayerRef}
        onEnded={() => setIsPlayingAudioPreview(false)}
        className="hidden"
      />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── MODE 1: CAPCUT-STYLE HOME HUB ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'home' && (
        <div className="w-full flex flex-col">
          {/* 1. EXTENSIBLE HERO BACKGROUND WITH TOP BAR & HERO GREETING */}
          <HeroBackground variant="blue-gradient" className="pb-8">
            <div
              style={{
                paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
              }}
              className="max-w-xl mx-auto px-4 sm:px-6 space-y-6"
            >
              {/* ── Top Bar: Upgrade Pill + Bell + Avatar ── */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {/* Upgrade Pill */}
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-900 text-xs font-black shadow-md backdrop-blur-md flex items-center gap-1.5 active:scale-95 transition-all border border-white/60"
                >
                  <span className="text-sm">💎</span>
                  <span>{t('Start Premium for only 129,000 đ', 'Start Premium for only 129,000 đ')}</span>
                </button>

                {/* Right: Notification & Avatar */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="relative w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/25 active:scale-95 transition-all"
                  >
                    <Bell className="h-4.5 w-4.5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF2D55] rounded-full border-2 border-white" />
                  </button>

                  {user ? (
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen(true)}
                      className="p-0.5 rounded-full border-2 border-white/80 active:scale-95 transition-all"
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF2D55] to-[#FF8FA3] text-white font-black text-xs flex items-center justify-center">
                          {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsLoginModalOpen(true)}
                      className="w-9 h-9 rounded-full bg-white text-slate-900 font-bold flex items-center justify-center active:scale-95 transition-all shadow-md"
                    >
                      <LogIn className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Hero Greeting & Title ── */}
              <div className="pt-2">
                <p className="text-white/85 text-xs font-semibold tracking-wide uppercase">
                  {t('Sáng tạo hoạt họa AI', 'Video editing')}
                </p>
                <div
                  onClick={() => {
                    setCurrentStep(1);
                    setViewMode('studio');
                  }}
                  className="inline-flex items-center gap-1.5 text-white text-3xl sm:text-4xl font-black tracking-tight cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all mt-0.5"
                >
                  <span>{t('Get started', 'Get started')}</span>
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <ChevronRight className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              {/* ── 2 Big Feature Cards: New Project & Templates ── */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                {/* Card 1: New Project */}
                <div
                  onClick={() => {
                    setCurrentStep(1);
                    setViewMode('studio');
                  }}
                  className="bg-white rounded-3xl p-5 shadow-xl shadow-blue-950/10 border border-white/80 flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all text-center min-h-[140px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md">
                    <Plus className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-950 tracking-tight leading-tight">
                      {t('New video', 'New video')}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {t('Tạo video từ ý tưởng', 'Generate with AI')}
                    </p>
                  </div>
                </div>

                {/* Card 2: Templates */}
                <div
                  onClick={() => {
                    setCurrentStep(1);
                    setViewMode('studio');
                  }}
                  className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-xl shadow-blue-950/10 border border-white/80 flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all text-center min-h-[140px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-[#FF2D55] text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                    <LayoutGrid className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-950 tracking-tight leading-tight">
                      {t('Templates', 'Templates')}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {t('Mẫu kịch bản sẵn có', 'Motion presets')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </HeroBackground>

          {/* 2. RECENT PROJECTS CAROUSEL (SQUARE THUMBNAILS + ARROW TO LIBRARY) */}
          <div className="max-w-xl mx-auto w-full px-4 sm:px-6 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>{t('Dự án gần đây', 'Recent projects')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
              >
                <span>{t('Xem tất cả', 'View all')}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Horizontal list of square thumbnails */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {SAMPLE_RECENT_ITEMS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveTab('library')}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${item.bg} border border-slate-700/40 p-2 flex flex-col justify-between shrink-0 cursor-pointer shadow-sm hover:scale-[1.03] active:scale-95 transition-all text-white`}
                >
                  <div className="flex items-center justify-between">
                    <Scissors className="h-3 w-3 text-white/60" />
                    <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-white/20 text-white">
                      {item.duration}
                    </span>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-white/50">{item.id}</p>
                    <p className="text-[10px] font-bold truncate leading-tight mt-0.5">{item.title}</p>
                  </div>
                </div>
              ))}

              {/* Arrow button pushing to Library tab */}
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                aria-label="Go to library"
                className="w-12 h-20 sm:h-24 rounded-2xl bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 font-bold shrink-0 active:scale-95 transition-all shadow-2xs"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 3. 4 MOTION STYLES WITH HANDCRAFTED VECTOR ICONS (NO JPG IMAGES) */}
          <div className="max-w-xl mx-auto w-full px-4 sm:px-6 pt-6 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#FF2D55]" />
                  <span>{t('4 Phong Cách Hoạt Họa AI', '4 Supported AI Motion Styles')}</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {t('Chọn nhanh phong cách vẽ để bắt đầu tạo video', 'Select a visual style to launch AI Studio')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Style 1: Whiteboard Stream */}
              <div
                onClick={() => launchStudioWithStyle('whiteboard_stream_hand')}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between gap-3 active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <WhiteboardStreamIcon size={30} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100/80 text-blue-700">
                      Whiteboard
                    </span>
                  </div>
                  <h5 className="text-sm font-black text-slate-900 mt-1">
                    {t('Bút Vẽ Whiteboard', 'Whiteboard Stream')}
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                    {t('Nét vẽ tay Marker trên giấy kem', 'Marker drawing synced to speech')}
                  </p>
                </div>
              </div>

              {/* Style 2: Doodle Quick */}
              <div
                onClick={() => launchStudioWithStyle('handdrawn_fast_doodle')}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between gap-3 active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                  <DoodleQuickIcon size={30} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-100/80 text-teal-700">
                      Watercolor
                    </span>
                  </div>
                  <h5 className="text-sm font-black text-slate-900 mt-1">
                    {t('Phác Chì & Màu Nước', 'Doodle Quick')}
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                    {t('Nét chì nhanh, loang màu pastel', 'Fast sketch & soft watercolor pop')}
                  </p>
                </div>
              </div>

              {/* Style 3: Apple Modern Motion */}
              <div
                onClick={() => launchStudioWithStyle('apple_modern_motion')}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between gap-3 active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                  <AppleModernMotionIcon size={30} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-100/80 text-sky-700">
                      Apple Motion
                    </span>
                  </div>
                  <h5 className="text-sm font-black text-slate-900 mt-1">
                    {t('Apple Modern UI', 'Apple Modern Motion')}
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                    {t('Thẻ Glassmorphism & kinetic tech', 'Glass cards & kinetic layout')}
                  </p>
                </div>
              </div>

              {/* Style 4: Mascot Character */}
              <div
                onClick={() => launchStudioWithStyle('character_animation')}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between gap-3 active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <MascotCharacterIcon size={30} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-800">
                      Mascot 2D/3D
                    </span>
                  </div>
                  <h5 className="text-sm font-black text-slate-900 mt-1">
                    {t('Mascot Nhân Vật', 'Mascot Character')}
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                    {t('Cáo WynMotion cử động sinh động', 'Animated character acting & expressions')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── MODE 2: CREATION STUDIO WIZARD ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'studio' && (
        <div className="w-full max-w-xl mx-auto p-4 sm:p-6 space-y-4">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => setViewMode('home')}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('Trang chủ', 'Home')}</span>
            </button>
            <span className="text-xs font-black text-[#FF2D55]">
              {t(`Bước ${currentStep}/4`, `Step ${currentStep}/4`)}
            </span>
          </div>

          {/* Step Navigation Pills */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { step: 1, label: t('1. Style', '1. Style'), canJump: true },
              { step: 2, label: t('2. Ý Tưởng', '2. Prompt'), canJump: true },
              { step: 3, label: t('3. Voice AI', '3. Audio'), canJump: Boolean(prompt.trim()) },
              { step: 4, label: t('4. Tỉ Lệ', '4. Ratio'), canJump: Boolean(audioUrl) },
            ].map(({ step: s, label, canJump }) => (
              <button
                key={s}
                type="button"
                disabled={!canJump}
                onClick={() => {
                  if (canJump) setCurrentStep(s as any);
                }}
                className={`h-7 rounded-xl text-[10px] font-extrabold flex items-center justify-center transition-all ${
                  s === currentStep
                    ? 'bg-[#FF2D55] text-white shadow-sm font-black'
                    : s < currentStep
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* STEP 1: VISUAL STYLE CARDS (USING VECTOR ICONS) */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#FF2D55]" />
                  <span>{t('Chọn Phong Cách Hoạt Họa (Visual Style)', 'Choose Visual Style')}</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  {t(
                    'Mỗi phong cách có thuật toán vẽ nét và cách phân bổ nhịp điệu riêng biệt.',
                    'Each style has a unique rendering engine and animation timing.',
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Style 1: Whiteboard Stream */}
                <div
                  onClick={() => setVisualStyle('whiteboard_stream_hand')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    visualStyle === 'whiteboard_stream_hand'
                      ? 'border-[#FF2D55] bg-rose-50/50 ring-2 ring-rose-500/20 shadow-md scale-[1.01]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <WhiteboardStreamIcon size={32} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900">
                        {t('Bút Vẽ Whiteboard', 'Whiteboard Stream')}
                      </h4>
                      {visualStyle === 'whiteboard_stream_hand' && <Check className="h-4 w-4 text-[#FF2D55]" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight mt-1">
                      {t('Nét Marker Notion trên giấy kem, tô màu theo Whisper', 'Marker drawing synced to Whisper audio')}
                    </p>
                  </div>
                </div>

                {/* Style 2: Doodle Quick */}
                <div
                  onClick={() => setVisualStyle('handdrawn_fast_doodle')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    visualStyle === 'handdrawn_fast_doodle'
                      ? 'border-[#FF2D55] bg-rose-50/50 ring-2 ring-rose-500/20 shadow-md scale-[1.01]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <DoodleQuickIcon size={32} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900">
                        {t('Phác Chì & Màu Nước', 'Doodle Watercolor')}
                      </h4>
                      {visualStyle === 'handdrawn_fast_doodle' && <Check className="h-4 w-4 text-[#FF2D55]" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight mt-1">
                      {t('Nét phác chì nhanh, loang màu nước nghệ thuật', 'Pencil sketch lines with soft watercolor blooming')}
                    </p>
                  </div>
                </div>

                {/* Style 3: Apple Modern Motion */}
                <div
                  onClick={() => setVisualStyle('apple_modern_motion')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    visualStyle === 'apple_modern_motion'
                      ? 'border-[#FF2D55] bg-rose-50/50 ring-2 ring-rose-500/20 shadow-md scale-[1.01]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                    <AppleModernMotionIcon size={32} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900">
                        {t('Apple Modern Motion', 'Apple Modern Motion')}
                      </h4>
                      {visualStyle === 'apple_modern_motion' && <Check className="h-4 w-4 text-[#FF2D55]" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight mt-1">
                      {t('Thẻ Glassmorphism & kinetic tech motion', 'Floating glass cards & smooth layers')}
                    </p>
                  </div>
                </div>

                {/* Style 4: Mascot Character */}
                <div
                  onClick={() => setVisualStyle('character_animation')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    visualStyle === 'character_animation'
                      ? 'border-[#FF2D55] bg-rose-50/50 ring-2 ring-rose-500/20 shadow-md scale-[1.01]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <MascotCharacterIcon size={32} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900">
                        {t('Mascot Nhân Vật', 'Mascot Character')}
                      </h4>
                      {visualStyle === 'character_animation' && <Check className="h-4 w-4 text-[#FF2D55]" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight mt-1">
                      {t('Cáo WynMotion diễn xuất sinh động', 'Animated character acting & expressions')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-3.5 rounded-2xl bg-[#FF2D55] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <span>{t('Tiếp Tục: Nhập Ý Tưởng', 'Next: Enter Concept')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* STEP 2: CONCEPT & PROMPT */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                  {t('Ý Tưởng Video & Đề Tài (Prompt)', 'Video Concept & Prompt')}
                </label>
                <p className="text-[11px] text-slate-500">
                  {t('Mô tả chủ đề, bài học, sản phẩm hoặc thông điệp bạn muốn truyền tải.', 'Describe the core lesson, explainer topic or message.')}
                </p>
              </div>

              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('Nhập nội dung ý tưởng...', 'Enter your idea prompt...')}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:border-[#FF2D55] focus:bg-white transition-all resize-none"
              />

              {/* Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {t('Gợi ý ý tưởng phổ biến:', 'Popular prompt ideas:')}
                </span>
                <div className="space-y-1">
                  {PROMPT_SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(s)}
                      className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[11px] text-slate-600 transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="h-3 w-3 text-rose-500 shrink-0" />
                      <span className="truncate">{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 font-black text-xs"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={!prompt.trim()}
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-3.5 rounded-2xl bg-[#FF2D55] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 shadow-md active:scale-95 transition-all"
                >
                  <span>{t('Tiếp Tục: Chọn Giọng Đọc', 'Next: Choose Voiceover')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: VOICEOVER & AUDIO */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Mic className="h-4 w-4 text-[#FF2D55]" />
                  <span>{t('Giọng Đọc & Kịch Bản Hoạt Họa', 'AI Voice & Script')}</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  {t('Tạo lời bình chuẩn xác và khớp từng khung hình hoạt họa.', 'Generate speech aligned with frame-by-frame animation.')}
                </p>
              </div>

              {/* Voice selectors */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    {t('Ngôn ngữ', 'Language')}
                  </label>
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="en-US">🇺🇸 English (US)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    {t('Giọng đọc', 'Voice')}
                  </label>
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => setSelectedVoiceName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="Phạm Tuyên">🎙️ Phạm Tuyên (Miền Bắc)</option>
                    <option value="Minh Đức">🎙️ Minh Đức (Trầm ấm)</option>
                    <option value="Quang Sơn">🎙️ Quang Sơn (Miền Trung)</option>
                    <option value="Xuân Vĩnh">🎙️ Xuân Vĩnh (Miền Nam)</option>
                    <option value="af_bella">🇺🇸 Bella (American)</option>
                    <option value="af_sarah">🇺🇸 Sarah (Soft)</option>
                  </select>
                </div>
              </div>

              {/* Script Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 block">
                  {t('Kịch bản lời bình (AI tự viết hoặc tự nhập):', 'Script narration text:')}
                </label>
                <textarea
                  rows={3}
                  value={customNarrationText || scriptText}
                  onChange={(e) => setCustomNarrationText(e.target.value)}
                  placeholder={t('Để trống để AI tự sinh từ ý tưởng...', 'Leave blank for AI auto-generation...')}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none resize-none"
                />
              </div>

              {/* Generate Audio Button */}
              <button
                type="button"
                disabled={isGeneratingAudio}
                onClick={handleGenerateAudio}
                className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-[#FF2D55] font-black text-xs flex items-center justify-center gap-2 border border-rose-200 transition-all active:scale-95"
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('Đang sinh kịch bản & giọng đọc 48kHz...', 'Generating speech...')}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    <span>{t('Tạo Giọng Đọc AI Ngay', 'Generate AI Voiceover')}</span>
                  </>
                )}
              </button>

              {/* Audio Preview if ready */}
              {audioUrl && (
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={handleTogglePlayAudio}
                      className="w-9 h-9 rounded-full bg-[#FF2D55] flex items-center justify-center text-white shrink-0 active:scale-95"
                    >
                      {isPlayingAudioPreview ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-black truncate">{selectedVoiceName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{audioDurationSec}s · 48kHz Neural</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                    Ready
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 font-black text-xs"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 py-3.5 rounded-2xl bg-[#FF2D55] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <span>{t('Tiếp Tục: Chọn Tỉ Lệ', 'Next: Choose Ratio')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: RATIO & LAUNCH GENERATION */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                  {t('Tỉ Lệ Khung Hình (Aspect Ratio)', 'Aspect Ratio')}
                </label>
                <p className="text-[11px] text-slate-500">
                  {t('Chọn định dạng video phù hợp với nền tảng phát sóng.', 'Choose target video format.')}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: '16:9', label: '16:9', desc: t('Ngang (YouTube)', 'Landscape') },
                  { id: '9:16', label: '9:16', desc: t('Dọc (TikTok)', 'Shorts/TikTok') },
                  { id: '1:1', label: '1:1', desc: t('Vuông (Post)', 'Square') },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setAspectRatio(r.id as any)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-1 transition-all ${
                      aspectRatio === r.id
                        ? 'border-[#FF2D55] bg-rose-50/50 text-[#FF2D55] font-black'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-sm font-black">{r.label}</span>
                    <span className="text-[9px] font-medium text-slate-400">{r.desc}</span>
                  </button>
                ))}
              </div>

              {/* Summary recap */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('Phong cách:', 'Style:')}</span>
                  <span className="font-bold text-slate-900 capitalize">{visualStyle.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('Giọng đọc:', 'Voice:')}</span>
                  <span className="font-bold text-slate-900">{selectedVoiceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('Tỉ lệ:', 'Ratio:')}</span>
                  <span className="font-bold text-slate-900">{aspectRatio}</span>
                </div>
              </div>

              {/* Launch Button */}
              <button
                type="button"
                disabled={isCreatingProject}
                onClick={handleCreateProject}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E85] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 active:scale-95 transition-all disabled:opacity-50"
              >
                {isCreatingProject ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t('Đang phân cảnh hoạt họa AI...', 'Orchestrating Animation...')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>{t('Bắt Đầu Tạo Video Hoạt Họa', 'Generate Animated Video')}</span>
                  </>
                )}
              </button>

              {/* Project preview if created */}
              {activeProject && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-xs">
                    <Check className="h-4 w-4" />
                    <span>{t('Đã tạo thành công phân cảnh hoạt họa!', 'Scenes created successfully!')}</span>
                  </div>
                  <p className="text-xs text-emerald-700 font-bold">{activeProject.title}</p>
                  <p className="text-[11px] text-emerald-600">
                    {t(
                      `Bao gồm ${activeProject.scenes?.length || 0} phân cảnh đồng bộ giọng đọc. Đã lưu vào Cloud Library.`,
                      `${activeProject.scenes?.length || 0} animated scenes synchronized. Saved to Library.`,
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('library')}
                    className="mt-2 w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>{t('Xem trong Cloud Library', 'View in Cloud Library')}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Profile & Login Modals */}
      <ProfileSidePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};
