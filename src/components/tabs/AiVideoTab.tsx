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
  X,
  Upload,
  Music,
  Volume2,
  CheckCircle2,
  RefreshCw,
  Share2,
  Download,
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

  // Navigation mode: 'home' (CapCut Hub) vs 'studio' (Full-screen Immersive Creation Flow)
  const [viewMode, setViewMode] = useState<'home' | 'studio'>('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Wizard Step: 1 | 2 | 3.1 | 3.2 | 4
  type WizardStep = '1' | '2' | '3.1' | '3.2' | '4';
  const [wizardStep, setWizardStep] = useState<WizardStep>('1');

  // Step 1: Visual Style
  const [visualStyle, setVisualStyle] = useState<
    'whiteboard_stream_hand' | 'handdrawn_fast_doodle' | 'apple_modern_motion' | 'character_animation'
  >('whiteboard_stream_hand');
  const [characterSubtype, setCharacterSubtype] = useState<'full_character' | 'stickman'>('full_character');

  // Step 2: Prompt / Concept (Gemini-style Big Input)
  const [prompt, setPrompt] = useState(
    isVietnamese
      ? 'Mô phỏng chu trình quang hợp của cây xanh trong tự nhiên và vai trò của ánh sáng mặt trời'
      : 'Simulate the photosynthesis process of green plants and the role of sunlight',
  );

  // Step 3: Audio Tab ('generate' vs 'upload')
  const [audioSourceTab, setAudioSourceTab] = useState<'generate' | 'upload'>('generate');

  // Step 3.1: Voice Setup
  const [selectedLang, setSelectedLang] = useState(isVietnamese ? 'vi' : 'en-US');
  const [voiceModel, setVoiceModel] = useState<'wynai' | 'gemini'>('wynai');
  const [selectedVoiceName, setSelectedVoiceName] = useState(isVietnamese ? 'Phạm Tuyên' : 'af_bella');
  const [readingStyle, setReadingStyle] = useState<'academic' | 'natural' | 'expressive' | 'storytelling'>('academic');

  // Step 3.2: Script & Audience Context
  const [targetAudience, setTargetAudience] = useState<'kids' | 'teen' | 'adult'>('teen');
  const [scriptStyle, setScriptStyle] = useState<'explainer' | 'storytelling' | 'humorous' | 'scientific'>('explainer');
  const [scriptLength, setScriptLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [scriptMode, setScriptMode] = useState<'ai_auto' | 'custom'>('ai_auto');
  const [customScriptText, setCustomScriptText] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDurationSec, setAudioDurationSec] = useState<number>(35);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);

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
    t('🌱 Chu trình quang hợp của cây xanh và hấp thụ CO2', '🌱 Photosynthesis cycle of green plants and CO2 absorption'),
    t('🤖 Trí tuệ nhân tạo (AI) hoạt động và học tập như thế nào?', '🤖 How Artificial Intelligence (AI) works & learns step-by-step'),
    t('📐 Định lý Pytago trong hình học và ứng dụng thực tế', '📐 Pythagorean theorem in geometry and practical real-life applications'),
    t('📜 Tóm tắt chiến dịch Điện Biên Phủ lịch sử 1954', '📜 Summary of historic Dien Bien Phu campaign in 1954'),
  ];

  const VIETNAMESE_VOICES = [
    { id: 'Phạm Tuyên', name: 'Thầy Tuyên', desc: 'Nam sư phạm · Ấm áp · Giảng bài chuẩn', tag: 'Phổ biến nhất' },
    { id: 'Mai Phương', name: 'Cô Phương', desc: 'Nữ truyền cảm · Nhẹ nhàng · Rõ ràng', tag: 'Sư phạm' },
    { id: 'Bảo Nhi', name: 'Bé Bảo Nhi', desc: 'Giọng bé gái · Vui tươi · Dành cho tiểu học', tag: 'Thiếu nhi' },
    { id: 'Quang Anh', name: 'Quang Anh', desc: 'Nam sôi nổi · Năng động · Khám phá', tag: 'Hào hứng' },
  ];

  const ENGLISH_VOICES = [
    { id: 'af_bella', name: 'Bella (US)', desc: 'Female · Clear & Engaging teacher', tag: 'Top Pick' },
    { id: 'am_adam', name: 'Adam (US)', desc: 'Male · Natural & Deep explainer', tag: 'Standard' },
    { id: 'bf_isabella', name: 'Isabella (UK)', desc: 'British Female · Articulate & Polite', tag: 'Academic' },
    { id: 'bm_george', name: 'George (UK)', desc: 'British Male · Professional documentary', tag: 'Story' },
  ];

  const currentVoices = selectedLang === 'vi' ? VIETNAMESE_VOICES : ENGLISH_VOICES;

  const handleStartStudio = (initialStyle?: 'whiteboard_stream_hand' | 'handdrawn_fast_doodle' | 'apple_modern_motion' | 'character_animation') => {
    if (initialStyle) {
      setVisualStyle(initialStyle);
    }
    setWizardStep('1');
    setViewMode('studio');
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
      const maxCharCount = scriptLength === 'short' ? 350 : scriptLength === 'medium' ? 650 : 1200;
      const res = await wynmotionService.generateScriptAndAudio({
        prompt,
        script: scriptMode === 'custom' && customScriptText.trim() ? customScriptText.trim() : undefined,
        language_code: selectedLang,
        target_audience: targetAudience,
        script_style: scriptStyle,
        max_chars: maxCharCount,
        voice_engine: voiceModel,
        voice_name: selectedVoiceName,
        reading_style: readingStyle,
      });

      setGeneratedScript(res.script);
      setAudioUrl(res.audio_url);
      setAudioDurationSec(res.duration_sec || (scriptLength === 'short' ? 25 : scriptLength === 'medium' ? 45 : 90));
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo giọng đọc AI');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);
    setAudioDurationSec(40);
  };

  const handleCreateVideo = async () => {
    setIsCreatingProject(true);
    setCreationStage('scripting');

    try {
      setTimeout(() => setCreationStage('drawing'), 1800);
      setTimeout(() => setCreationStage('syncing'), 3800);

      const finalScript = scriptMode === 'custom' && customScriptText.trim() 
        ? customScriptText 
        : generatedScript || prompt;

      const res = await wynmotionService.generateScenes({
        title: prompt.slice(0, 40),
        prompt,
        script: finalScript,
        audio_url: audioUrl || undefined,
        duration_sec: audioDurationSec,
        aspect_ratio: aspectRatio,
        visual_style: visualStyle,
        character_subtype: visualStyle === 'character_animation' ? characterSubtype : undefined,
        language_code: selectedLang,
      });

      setCreatedProject(res.project);
      setCreationStage('done');
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo video phân cảnh AI');
      setIsCreatingProject(false);
      setCreationStage('idle');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. CAPCUT HOME HUB VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (viewMode === 'home') {
    return (
      <div className="min-h-screen bg-[#080B10] text-white pb-12 select-none">
        {/* Hidden Audio Player for Preview */}
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
            className="group relative overflow-hidden rounded-3xl bg-white text-slate-900 p-5 shadow-xl shadow-cyan-950/40 hover:bg-slate-50 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[140px] text-left border border-white/80"
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
            onClick={() => {
              handleStartStudio('whiteboard_stream_hand');
            }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-xl p-5 shadow-xl border border-slate-700/60 hover:border-pink-500/50 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[140px] text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/30 group-hover:scale-105 transition-transform">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight leading-tight">
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
              <Film className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-base text-white">
                {isVietnamese ? 'Dự án gần đây' : 'Recent projects'}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('library')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
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
                  className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${item.bg} border border-slate-800 group-hover:border-cyan-500/60 transition-all flex flex-col justify-between p-3 relative overflow-hidden shadow-md`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-white/70 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded-md border border-cyan-800/40">
                      {item.duration}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-cyan-500 text-white flex items-center justify-center self-center transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                  <p className="text-xs font-bold text-white truncate">{item.title}</p>
                </div>
              </div>
            ))}

            {/* Final ">" Circle Button to switch to Library Tab */}
            <button
              onClick={() => setActiveTab('library')}
              className="flex-shrink-0 w-16 h-32 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-400/80 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-cyan-300"
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                <ChevronRight className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">Thư viện</span>
            </button>
          </div>
        </div>

        {/* 4. Four Supported Motion Styles (4 Square Grid with Handcrafted Vector Icons) */}
        <div className="mt-8 px-4">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>{isVietnamese ? 'Phong cách hoạt họa AI' : 'AI Animation Styles'}</span>
            </h3>
            <span className="text-[11px] font-medium text-slate-400">4 styles</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Style 1: Whiteboard */}
            <button
              onClick={() => handleStartStudio('whiteboard_stream_hand')}
              className="group p-4 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800 hover:border-cyan-500/60 transition-all text-left flex flex-col justify-between min-h-[160px] relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                <WhiteboardStreamIcon className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white group-hover:text-cyan-300 transition-colors">
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
              className="group p-4 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800 hover:border-amber-500/60 transition-all text-left flex flex-col justify-between min-h-[160px] relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                <DoodleQuickIcon className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white group-hover:text-amber-300 transition-colors">
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
              className="group p-4 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800 hover:border-blue-500/60 transition-all text-left flex flex-col justify-between min-h-[160px] relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AppleModernMotionIcon className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white group-hover:text-blue-300 transition-colors">
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
              className="group p-4 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800 hover:border-purple-500/60 transition-all text-left flex flex-col justify-between min-h-[160px] relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MascotCharacterIcon className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white group-hover:text-purple-300 transition-colors">
                  {isVietnamese ? 'Mascot Cáo 3D' : 'Mascot & Character'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  {isVietnamese ? 'Nhân vật hoạt hình dẫn chuyện' : 'Animated host & avatar'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Profile Side Panel & Login Modal */}
        <ProfileSidePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. FULL-SCREEN IMMERSIVE CREATION STUDIO FLOW (Gemini App Big Style)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-[#070A0F] text-slate-100 flex flex-col select-none overflow-hidden">
      {/* Hidden Audio Player for Preview */}
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

      {/* ── Top Bar (Back, Progress, Close) ── */}
      <header className="pt-12 pb-3 px-5 bg-slate-950/90 border-b border-slate-850 backdrop-blur-xl flex items-center justify-between">
        <button
          onClick={() => {
            if (wizardStep === '1') setViewMode('home');
            else if (wizardStep === '2') setWizardStep('1');
            else if (wizardStep === '3.1') setWizardStep('2');
            else if (wizardStep === '3.2') setWizardStep('3.1');
            else if (wizardStep === '4') setWizardStep('3.2');
          }}
          className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Step Indicator Pill */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
              {wizardStep === '1' && (isVietnamese ? 'Bước 1/4: Chọn Phong cách' : 'Step 1/4: Visual Style')}
              {wizardStep === '2' && (isVietnamese ? 'Bước 2/4: Ý tưởng Video' : 'Step 2/4: Video Prompt')}
              {wizardStep === '3.1' && (isVietnamese ? 'Bước 3.1/4: Giọng đọc AI' : 'Step 3.1/4: Voice Setup')}
              {wizardStep === '3.2' && (isVietnamese ? 'Bước 3.2/4: Kịch bản' : 'Step 3.2/4: Script')}
              {wizardStep === '4' && (isVietnamese ? 'Bước 4/4: Tỷ lệ & Tạo' : 'Step 4/4: Ratio & Launch')}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm(isVietnamese ? 'Bạn có chắc muốn thoát về trang chủ?' : 'Exit back to home?')) {
              setViewMode('home');
            }
          }}
          className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* ── Scrollable Body Area ── */}
      <main className="flex-1 overflow-y-auto px-5 py-6 space-y-6 max-w-lg mx-auto w-full">
        {/* ========================================================================= */}
        {/* STEP 1: 4 Ô VUÔNG TO BỰ (Visual Style Selection) */}
        {/* ========================================================================= */}
        {wizardStep === '1' && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
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
                    : 'bg-slate-900/80 border-2 border-slate-800 hover:border-slate-700'
                }`}
              >
                {visualStyle === 'whiteboard_stream_hand' && (
                  <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center">
                  <WhiteboardStreamIcon className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
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
                    : 'bg-slate-900/80 border-2 border-slate-800 hover:border-slate-700'
                }`}
              >
                {visualStyle === 'handdrawn_fast_doodle' && (
                  <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800/40 flex items-center justify-center">
                  <DoodleQuickIcon className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
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
                    : 'bg-slate-900/80 border-2 border-slate-800 hover:border-slate-700'
                }`}
              >
                {visualStyle === 'apple_modern_motion' && (
                  <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-blue-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/40 flex items-center justify-center">
                  <AppleModernMotionIcon className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
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
                    : 'bg-slate-900/80 border-2 border-slate-800 hover:border-slate-700'
                }`}
              >
                {visualStyle === 'character_animation' && (
                  <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-purple-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800/40 flex items-center justify-center">
                  <MascotCharacterIcon className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {isVietnamese ? 'Mascot Cáo 3D' : 'Mascot Host'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isVietnamese ? 'Nhân vật 3D biểu cảm' : 'Animated fox host'}
                  </p>
                </div>
              </button>
            </div>

            {/* Mascot Sub-type Picker if Mascot is chosen */}
            {visualStyle === 'character_animation' && (
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-purple-800/40 space-y-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  {isVietnamese ? 'Kiểu nhân vật Mascot' : 'Character Type'}
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setCharacterSubtype('full_character')}
                    className={`py-3 px-3.5 rounded-2xl text-xs font-bold transition-all ${
                      characterSubtype === 'full_character'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isVietnamese ? '🦊 Cáo WynMotion 3D' : '🦊 3D WynFox'}
                  </button>
                  <button
                    onClick={() => setCharacterSubtype('stickman')}
                    className={`py-3 px-3.5 rounded-2xl text-xs font-bold transition-all ${
                      characterSubtype === 'stickman'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300'
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
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
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
                placeholder={isVietnamese ? 'Ví dụ: Giải thích định luật vạn vật hấp dẫn của Newton...' : 'e.g. Explain Newton\'s law of universal gravitation...'}
                className="w-full min-h-[160px] p-5 rounded-3xl bg-slate-900/90 border-2 border-slate-800 focus:border-indigo-500 text-white text-lg font-medium outline-none resize-none placeholder:text-slate-500 shadow-inner"
              />
              <div className="absolute bottom-3.5 right-4 text-xs font-semibold text-slate-500">
                {prompt.length} ký tự
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVietnamese ? '✨ Gợi ý bài giảng mẫu' : '✨ Sample Suggestions'}
              </span>
              <div className="space-y-2">
                {PROMPT_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(s.replace(/^[^\s]+\s/, ''))}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-850 text-left text-sm font-medium text-slate-300 hover:text-white transition-all flex items-center justify-between"
                  >
                    <span>{s}</span>
                    <Plus className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3.1: GIỌNG ĐỌC AI & NGÔN NGỮ (Tách Sub-step 1) */}
        {/* ========================================================================= */}
        {wizardStep === '3.1' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {isVietnamese ? 'Âm thanh & Giọng đọc' : 'Voiceover & Audio'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isVietnamese ? 'Chọn nguồn âm thanh cho bài giảng' : 'Choose your audio source'}
              </p>
            </div>

            {/* Two Big Source Tabs: Tạo mới vs Tải lên */}
            <div className="grid grid-cols-2 gap-3 p-1.5 rounded-3xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setAudioSourceTab('generate')}
                className={`py-3.5 px-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                  audioSourceTab === 'generate'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isVietnamese ? 'Tạo mới Audio AI' : 'Generate AI Voice'}</span>
              </button>

              <button
                onClick={() => setAudioSourceTab('upload')}
                className={`py-3.5 px-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                  audioSourceTab === 'upload'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{isVietnamese ? 'Tải lên Audio' : 'Upload Audio'}</span>
              </button>
            </div>

            {/* TAB A: TẠO MỚI AUDIO */}
            {audioSourceTab === 'generate' && (
              <div className="space-y-5">
                {/* 1. Ngôn ngữ (Language Chips) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isVietnamese ? '1. Ngôn ngữ đọc' : '1. Spoken Language'}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedLang('vi');
                        setSelectedVoiceName('Phạm Tuyên');
                      }}
                      className={`py-3.5 px-4 rounded-2xl text-sm font-bold flex items-center justify-between transition-all ${
                        selectedLang === 'vi'
                          ? 'bg-indigo-600/30 border-2 border-indigo-500 text-white'
                          : 'bg-slate-900 border-2 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>🇻🇳 Tiếng Việt (VN)</span>
                      {selectedLang === 'vi' && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedLang('en-US');
                        setSelectedVoiceName('af_bella');
                      }}
                      className={`py-3.5 px-4 rounded-2xl text-sm font-bold flex items-center justify-between transition-all ${
                        selectedLang === 'en-US'
                          ? 'bg-indigo-600/30 border-2 border-indigo-500 text-white'
                          : 'bg-slate-900 border-2 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>🇺🇸 English (US)</span>
                      {selectedLang === 'en-US' && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  </div>
                </div>

                {/* 2. Model AI Engine */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isVietnamese ? '2. Bộ công nghệ AI' : '2. Voice AI Engine'}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setVoiceModel('wynai')}
                      className={`py-3 px-3.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        voiceModel === 'wynai'
                          ? 'bg-indigo-600/30 border-2 border-indigo-500 text-white'
                          : 'bg-slate-900 border-2 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-extrabold text-white">WynAI Ultra-HD</div>
                      <div className="text-[10px] text-indigo-300 mt-0.5">48kHz Studio âm trầm</div>
                    </button>

                    <button
                      onClick={() => setVoiceModel('gemini')}
                      className={`py-3 px-3.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        voiceModel === 'gemini'
                          ? 'bg-indigo-600/30 border-2 border-indigo-500 text-white'
                          : 'bg-slate-900 border-2 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-extrabold text-white">Gemini Expressive</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Đa sắc thái biểu cảm</div>
                    </button>
                  </div>
                </div>

                {/* 3. Danh sách Giọng đọc (Voice Persona Cards) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isVietnamese ? '3. Chọn giọng đọc yêu thích' : '3. Select Voice Persona'}
                  </label>
                  <div className="space-y-2.5">
                    {currentVoices.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVoiceName(v.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          selectedVoiceName === v.id
                            ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/50'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
                            <Volume2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-white">{v.name}</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-900/60 text-indigo-300 border border-indigo-700/40">
                                {v.tag}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{v.desc}</p>
                          </div>
                        </div>

                        {selectedVoiceName === v.id && (
                          <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Phong cách đọc (Tone) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isVietnamese ? '4. Sắc thái giọng đọc' : '4. Reading Tone'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'academic', label: '🎓 Sư phạm / Chuẩn mực' },
                      { id: 'natural', label: '🌿 Tự nhiên / Gần gũi' },
                      { id: 'expressive', label: '🔥 Hào hứng / Sinh động' },
                      { id: 'storytelling', label: '📖 Kể chuyện / Truyền cảm' },
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => setReadingStyle(tone.id as any)}
                        className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all ${
                          readingStyle === tone.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB B: TẢI LÊN AUDIO */}
            {audioSourceTab === 'upload' && (
              <div className="p-6 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-700 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    {uploadedFileName || (isVietnamese ? 'Chọn file âm thanh (.mp3, .wav, .m4a)' : 'Choose audio file')}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isVietnamese ? 'Hỗ trợ tải lên bài giảng thu âm sẵn' : 'Upload pre-recorded voiceover'}
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-6 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
                >
                  {isVietnamese ? 'Chọn file từ máy' : 'Browse Files'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3.2: KỊCH BẢN & ĐỐI TƯỢNG (Tách Sub-step 2) */}
        {/* ========================================================================= */}
        {wizardStep === '3.2' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {isVietnamese ? 'Kịch bản & Người xem' : 'Script & Audience'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isVietnamese ? 'Tùy chỉnh văn phong phù hợp với đối tượng học sinh' : 'Customize tone & length'}
              </p>
            </div>

            {/* 1. Đối tượng người xem (Target Audience) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVietnamese ? '1. Đối tượng người xem' : '1. Target Audience'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'kids', label: 'Tiểu học', desc: '6-10 tuổi', emoji: '🎒' },
                  { id: 'teen', label: 'THCS - THPT', desc: '11-18 tuổi', emoji: '📚' },
                  { id: 'adult', label: 'Người lớn', desc: 'Sinh viên, GV', emoji: '🎓' },
                ].map((aud) => (
                  <button
                    key={aud.id}
                    onClick={() => setTargetAudience(aud.id as any)}
                    className={`p-3 rounded-2xl text-center border-2 transition-all ${
                      targetAudience === aud.id
                        ? 'bg-indigo-950/60 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-lg">{aud.emoji}</div>
                    <div className="text-xs font-extrabold text-white mt-1">{aud.label}</div>
                    <div className="text-[10px] text-slate-400">{aud.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Văn phong kịch bản (Script Style) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVietnamese ? '2. Văn phong bài giảng' : '2. Script Style'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'explainer', label: '💡 Sư phạm dễ hiểu' },
                  { id: 'storytelling', label: '📜 Kể chuyện cuốn hút' },
                  { id: 'humorous', label: '😄 Hài hước sinh động' },
                  { id: 'scientific', label: '🔬 Khoa học chuẩn xác' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setScriptStyle(st.id as any)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all ${
                      scriptStyle === st.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Độ dài kịch bản */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVietnamese ? '3. Thời lượng video dự kiến' : '3. Expected Duration'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'short', label: '~30 giây', desc: 'Ngắn gọn' },
                  { id: 'medium', label: '~60 giây', desc: 'Chuẩn bài giảng' },
                  { id: 'long', label: '~2 phút', desc: 'Chi tiết sâu' },
                ].map((len) => (
                  <button
                    key={len.id}
                    onClick={() => setScriptLength(len.id as any)}
                    className={`p-3 rounded-2xl text-center border-2 transition-all ${
                      scriptLength === len.id
                        ? 'bg-indigo-950/60 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-extrabold text-white">{len.label}</div>
                    <div className="text-[10px] text-indigo-300">{len.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Tự viết Script hay để AI viết */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isVietnamese ? '4. Kịch bản thuyết minh' : '4. Narration Script'}
                </label>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setScriptMode('ai_auto')}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                      scriptMode === 'ai_auto' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    AI Tự viết
                  </button>
                  <button
                    onClick={() => setScriptMode('custom')}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                      scriptMode === 'custom' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Tự nhập
                  </button>
                </div>
              </div>

              {scriptMode === 'custom' ? (
                <textarea
                  value={customScriptText}
                  onChange={(e) => setCustomScriptText(e.target.value)}
                  placeholder={isVietnamese ? 'Dán hoặc gõ kịch bản lời thoại của bạn vào đây...' : 'Paste or type custom narration script here...'}
                  className="w-full min-h-[120px] p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm outline-none resize-none focus:border-indigo-500"
                />
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {generatedScript || (
                    <span className="text-slate-500 italic">
                      {isVietnamese
                        ? 'AI sẽ tự động soạn kịch bản chi tiết dựa theo chủ đề ở Bước 2.'
                        : 'AI will automatically write the script based on your Step 2 idea.'}
                    </span>
                  )}
                </div>
              )}

              {/* Nút Tạo & Nghe thử Giọng đọc */}
              <button
                onClick={handleGenerateAudio}
                disabled={isGeneratingAudio}
                className="w-full py-4 rounded-2xl bg-slate-900 border-2 border-indigo-500/80 hover:bg-indigo-950/30 text-indigo-300 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                    <span>{isVietnamese ? 'Đang tạo lời thoại AI...' : 'Generating AI Voice...'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 text-indigo-400" />
                    <span>{isVietnamese ? 'Tạo & Nghe thử Giọng đọc AI 🔊' : 'Generate & Preview Voiceover 🔊'}</span>
                  </>
                )}
              </button>

              {/* Audio Preview Bar if generated */}
              {audioUrl && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTogglePlayAudio}
                      className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
                    >
                      {isPlayingAudioPreview ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {isVietnamese ? 'Đã tạo giọng đọc thành công' : 'Audio generated'}
                      </div>
                      <div className="text-[11px] text-indigo-300">~{audioDurationSec}s · {selectedVoiceName}</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: TỶ LỆ KHUNG HÌNH & TẠO VIDEO (Ratio & Launch) */}
        {/* ========================================================================= */}
        {wizardStep === '4' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
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
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-xl shadow-indigo-950/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="w-14 h-9 rounded-lg border-2 border-current flex items-center justify-center text-[10px] font-bold">
                  16:9
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white">Ngang</div>
                  <div className="text-[10px] text-slate-400">YouTube, Slide</div>
                </div>
              </button>

              {/* 9:16 */}
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`p-4 rounded-3xl text-center border-2 transition-all flex flex-col items-center justify-between min-h-[140px] ${
                  aspectRatio === '9:16'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-xl shadow-indigo-950/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="w-9 h-14 rounded-lg border-2 border-current flex items-center justify-center text-[10px] font-bold">
                  9:16
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white">Dọc</div>
                  <div className="text-[10px] text-slate-400">TikTok, Shorts</div>
                </div>
              </button>

              {/* 1:1 */}
              <button
                onClick={() => setAspectRatio('1:1')}
                className={`p-4 rounded-3xl text-center border-2 transition-all flex flex-col items-center justify-between min-h-[140px] ${
                  aspectRatio === '1:1'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-xl shadow-indigo-950/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="w-11 h-11 rounded-lg border-2 border-current flex items-center justify-center text-[10px] font-bold">
                  1:1
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white">Vuông</div>
                  <div className="text-[10px] text-slate-400">Instagram, FB</div>
                </div>
              </button>
            </div>

            {/* Summary Card */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVietnamese ? '📋 Tóm tắt cấu hình video' : '📋 Video Summary'}
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Phong cách:</span>
                  <span className="font-bold text-white uppercase">{visualStyle}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Giọng đọc:</span>
                  <span className="font-bold text-indigo-300">{selectedVoiceName} ({selectedLang})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Thời lượng dự kiến:</span>
                  <span className="font-bold text-emerald-400">~{audioDurationSec} giây</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Tỷ lệ khung hình:</span>
                  <span className="font-bold text-white">{aspectRatio}</span>
                </div>
              </div>
            </div>

            {/* Generation Progress Overlay */}
            {isCreatingProject && (
              <div className="p-6 rounded-3xl bg-indigo-950/70 border border-indigo-800/80 text-center space-y-4 animate-in fade-in">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
                <div>
                  <h4 className="font-extrabold text-lg text-white">
                    {creationStage === 'scripting' && (isVietnamese ? 'AI đang phân tích kịch bản...' : 'Analyzing script...')}
                    {creationStage === 'drawing' && (isVietnamese ? 'AI đang phác thảo phân cảnh đồ họa...' : 'Drafting graphic scenes...')}
                    {creationStage === 'syncing' && (isVietnamese ? 'Đồng bộ chuyển động âm thanh...' : 'Syncing motion with audio...')}
                    {creationStage === 'done' && (isVietnamese ? 'Hoàn thành video thành công!' : 'Video created successfully!')}
                  </h4>
                  <p className="text-xs text-indigo-300 mt-1">
                    {isVietnamese ? 'Hệ thống đang xuất video độ phân giải cao' : 'Rendering high-resolution animation'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Fixed Bottom Action Bar (Gemini App Huge Button Style) ── */}
      <footer className="p-5 pb-9 bg-slate-950/95 border-t border-slate-850 backdrop-blur-xl">
        <div className="max-w-lg mx-auto w-full">
          {wizardStep === '1' && (
            <button
              onClick={() => setWizardStep('2')}
              className="w-full h-15 py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-lg shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>{isVietnamese ? 'Tiếp tục: Nhập Ý tưởng' : 'Continue: Enter Idea'}</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          )}

          {wizardStep === '2' && (
            <button
              onClick={() => setWizardStep('3.1')}
              disabled={!prompt.trim()}
              className="w-full h-15 py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 disabled:opacity-50 text-white font-extrabold text-lg shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>{isVietnamese ? 'Tiếp tục: Chọn Giọng đọc' : 'Continue: Voice Setup'}</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          )}

          {wizardStep === '3.1' && (
            <button
              onClick={() => {
                if (audioSourceTab === 'upload') {
                  setWizardStep('4');
                } else {
                  setWizardStep('3.2');
                }
              }}
              className="w-full h-15 py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-lg shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>{isVietnamese ? 'Tiếp tục: Kịch bản & Đối tượng' : 'Continue: Script & Audience'}</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          )}

          {wizardStep === '3.2' && (
            <button
              onClick={() => setWizardStep('4')}
              className="w-full h-15 py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-lg shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>{isVietnamese ? 'Tiếp tục: Tỷ lệ & Khởi tạo' : 'Continue: Ratio & Launch'}</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          )}

          {wizardStep === '4' && (
            <button
              onClick={handleCreateVideo}
              disabled={isCreatingProject}
              className="w-full h-15 py-4.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 disabled:opacity-50 text-white font-extrabold text-lg shadow-xl shadow-purple-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isCreatingProject ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{isVietnamese ? 'Đang tạo phân cảnh AI...' : 'Creating Motion Video...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-yellow-300 fill-current" />
                  <span>{isVietnamese ? 'Tạo Video Hoạt Họa AI Ngay ✨' : 'Generate AI Video Now ✨'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
