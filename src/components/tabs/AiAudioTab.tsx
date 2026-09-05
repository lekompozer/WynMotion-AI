'use client';

/**
 * AiAudioTab.tsx — WynMotion-AI iOS & Web Audio Studio
 *
 * 2-Step Architecture:
 * - Step 1: Content & Language (Nội dung văn bản, AI Script Assistant & Chọn ngôn ngữ)
 * - Step 2: Voice & Sound Configuration (Chọn Model, Giọng đọc vùng miền, Tốc độ, Sinh âm thanh & Player)
 * - Theme Integration: Matching bottom navigation bar active color (#FF2D55 -> #FF4570)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Music2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Download,
  Loader2,
  Volume2,
  VolumeX,
  Wand2,
  Sliders,
  CheckCircle2,
  Check,
  Globe,
  Radio,
  Share2,
  Layers,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  Copy,
  Zap,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import {
  audioService,
  AUDIO_STUDIO_LANGUAGES,
  VIENEU_NORTHERN_VOICES,
  VIENEU_CENTRAL_VOICES,
  VIENEU_SOUTHERN_VOICES,
  KOKORO_FEMALE_VOICES,
  KOKORO_MALE_VOICES,
  GEMINI_MALE_VOICES,
  GEMINI_FEMALE_VOICES,
  KOKORO_DEFAULT_VOICE_MAP,
  READING_STYLES,
  MUSIC_STYLES,
  VoiceOption,
  AudioGenerateResponse,
} from '@/services/audioService';
import { saveAndShareMedia } from '@/utils/mediaSaveHelper';

type StudioTab = 'voice' | 'music';
type AudioStep = 1 | 2;

export const AiAudioTab: React.FC = () => {
  const { isVietnamese, isDark, setActiveTab, t } = useApp();
  const { refreshSubscription } = useWordaiAuth();

  // Studio Mode: 'voice' (Lồng tiếng) | 'music' (Tạo nhạc nền)
  const [studioTab, setStudioTab] = useState<StudioTab>('voice');

  // Wizard Step: 1 (Content & Language) | 2 (Voice & Generate)
  const [currentStep, setCurrentStep] = useState<AudioStep>(1);

  // ── Step 1: Content & Language States ──
  const [selectedLang, setSelectedLang] = useState<string>(isVietnamese ? 'vi' : 'en-US');
  const [scriptText, setScriptText] = useState(
    isVietnamese
      ? 'Chào mừng bạn đến với WynMotion AI. Ứng dụng sáng tạo video hoạt họa và giọng đọc thông minh hàng đầu!'
      : 'Welcome to WynMotion AI. The leading smart animated video and voiceover studio!'
  );
  const [isWritingScript, setIsWritingScript] = useState(false);
  const [scriptPromptIdea, setScriptPromptIdea] = useState('');
  const [showScriptAssistant, setShowScriptAssistant] = useState(false);

  // Music Step 1 States
  const [selectedMusicStyle, setSelectedMusicStyle] = useState(MUSIC_STYLES[0]);
  const [customMusicPrompt, setCustomMusicPrompt] = useState(MUSIC_STYLES[0].prompt);
  const [negativeMusicPrompt, setNegativeMusicPrompt] = useState('');

  // ── Step 2: Voice Configuration States ──
  const [modelType, setModelType] = useState<'wynai' | 'gemini'>('wynai');
  const [regionFilter, setRegionFilter] = useState<'all' | 'north' | 'central' | 'south'>('all');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('Phạm Tuyên');
  const [readingStyle, setReadingStyle] = useState<string>('tu_nhien');
  const [speakingRate, setSpeakingRate] = useState<number>(1.0);

  // ── Generation State ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Audio Playback State ──
  const [generatedAudio, setGeneratedAudio] = useState<AudioGenerateResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-sync voice when language changes
  useEffect(() => {
    if (modelType === 'wynai') {
      if (selectedLang === 'vi') {
        setSelectedVoiceName('Phạm Tuyên');
      } else {
        setSelectedVoiceName(KOKORO_DEFAULT_VOICE_MAP[selectedLang] || 'af_bella');
      }
    } else if (modelType === 'gemini') {
      setSelectedVoiceName('Kore');
    }
  }, [selectedLang, modelType]);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [generatedAudio]);

  // Timer for live generation
  useEffect(() => {
    if (isGenerating) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => setElapsedTime((p) => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGenerating]);

  // Voice list calculation
  const getAvailableVoices = (): VoiceOption[] => {
    if (modelType === 'gemini') {
      return [...GEMINI_FEMALE_VOICES, ...GEMINI_MALE_VOICES];
    }
    if (selectedLang === 'vi') {
      if (regionFilter === 'north') return VIENEU_NORTHERN_VOICES;
      if (regionFilter === 'central') return VIENEU_CENTRAL_VOICES;
      if (regionFilter === 'south') return VIENEU_SOUTHERN_VOICES;
      return [...VIENEU_NORTHERN_VOICES, ...VIENEU_CENTRAL_VOICES, ...VIENEU_SOUTHERN_VOICES];
    }
    return [...KOKORO_FEMALE_VOICES, ...KOKORO_MALE_VOICES];
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // AI Script Assistant
  const handleGenerateScriptWithAI = async () => {
    if (!scriptPromptIdea.trim()) {
      alert(t('Vui lòng nhập chủ đề kịch bản!', 'Please enter a script topic!'));
      return;
    }
    try {
      setIsWritingScript(true);
      const generated = await audioService.generateScriptFromPrompt(
        scriptPromptIdea,
        selectedLang
      );
      if (generated) {
        setScriptText(generated);
        setShowScriptAssistant(false);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo kịch bản với AI');
    } finally {
      setIsWritingScript(false);
    }
  };

  // Generate Audio Trigger
  const handleGenerateAudio = async () => {
    try {
      setIsGenerating(true);
      setGeneratedAudio(null);

      let res: AudioGenerateResponse;

      if (studioTab === 'voice') {
        if (!scriptText.trim()) {
          alert(t('Vui lòng nhập văn bản cần đọc!', 'Please enter text to speak!'));
          return;
        }

        res = await audioService.generateSpeech({
          text: scriptText,
          voice_name: selectedVoiceName,
          language_code: selectedLang,
          voice_engine: modelType,
          reading_style: readingStyle,
          speaking_rate: speakingRate,
        });
      } else {
        if (!customMusicPrompt.trim()) {
          alert(t('Vui lòng nhập mô tả phong cách nhạc!', 'Please enter music prompt!'));
          return;
        }
        const musicRes = await audioService.generateMusic({
          prompt: customMusicPrompt,
          negative_prompt: negativeMusicPrompt || undefined,
        });

        if (!musicRes.audio_url) {
          throw new Error(musicRes.message || 'Chưa nhận được file âm thanh');
        }

        res = {
          audio_url: musicRes.audio_url,
          duration_sec: 30,
          filename: 'background_music.mp3',
        };
      }

      setGeneratedAudio(res);
      refreshSubscription();
    } catch (err: any) {
      console.error('Audio generation error:', err);
      alert(err.message || t('Tạo âm thanh thất bại!', 'Failed to generate audio!'));
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedLangObj = AUDIO_STUDIO_LANGUAGES.find((l) => l.code === selectedLang);

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto px-2 sm:px-4 pt-2 pb-24 space-y-4 rounded-3xl overflow-hidden transition-colors ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          ATMOSPHERIC AMBIENT GLOW (Matching Web AIAudioStudioModal)
          ───────────────────────────────────────────────────────────── */}
      {isDark && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-[#09111f]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(88,28,135,0.24),transparent_35%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.20),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. TOP STUDIO MODE TOGGLE (Voiceover vs Music Generator)
          ───────────────────────────────────────────────────────────── */}
      <div
        className={`p-1.5 rounded-2xl border flex items-center gap-1.5 backdrop-blur-xl ${
          isDark
            ? 'border-white/10 bg-white/5 shadow-md shadow-black/40'
            : 'bg-slate-100/90 border-slate-200 shadow-sm'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setStudioTab('voice');
            setCurrentStep(1);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${
            studioTab === 'voice'
              ? isDark
                ? 'bg-white/15 text-white shadow-sm border border-white/15'
                : 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : isDark
              ? 'text-white/60 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Mic className={`w-3.5 h-3.5 ${studioTab === 'voice' ? 'text-fuchsia-400' : ''}`} />
          <span>{t('Lồng Tiếng AI (Voiceover)', 'AI Voiceover')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStudioTab('music');
            setCurrentStep(1);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${
            studioTab === 'music'
              ? isDark
                ? 'bg-white/15 text-white shadow-sm border border-white/15'
                : 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : isDark
              ? 'text-white/60 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Music2 className={`w-3.5 h-3.5 ${studioTab === 'music' ? 'text-fuchsia-400' : ''}`} />
          <span>{t('Tạo Nhạc Nền (BGM Generator)', 'BGM Music')}</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. STEP PROGRESS INDICATOR (Step 1 -> Step 2)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all backdrop-blur-xl ${
            currentStep === 1
              ? isDark
                ? 'border-fuchsia-500/50 bg-fuchsia-500/10 shadow-[0_0_20px_rgba(217,70,239,0.15)] ring-1 ring-fuchsia-500/30'
                : 'bg-white border-fuchsia-500 shadow-sm'
              : isDark
              ? 'border-white/10 bg-white/[0.03] opacity-60 hover:opacity-100'
              : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
              currentStep === 1
                ? 'bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white shadow-sm shadow-fuchsia-500/30'
                : isDark
                ? 'bg-white/10 text-white/50'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            1
          </div>
          <div className="min-w-0 flex-1">
            <span
              className={`text-[9px] font-black uppercase block tracking-wider ${
                currentStep === 1 && isDark ? 'text-fuchsia-300' : 'text-slate-400'
              }`}
            >
              {t('Bước 1', 'Step 1')}
            </span>
            <span className={`text-xs font-bold truncate block ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {studioTab === 'voice' ? t('Nội Dung & Ngôn Ngữ', 'Content & Language') : t('Ý Tưởng & Thể Loại', 'Style & Prompt')}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            if (studioTab === 'voice' && !scriptText.trim()) {
              alert(t('Vui lòng nhập văn bản trước!', 'Please enter script first!'));
              return;
            }
            setCurrentStep(2);
          }}
          className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all backdrop-blur-xl ${
            currentStep === 2
              ? isDark
                ? 'border-fuchsia-500/50 bg-fuchsia-500/10 shadow-[0_0_20px_rgba(217,70,239,0.15)] ring-1 ring-fuchsia-500/30'
                : 'bg-white border-fuchsia-500 shadow-sm'
              : isDark
              ? 'border-white/10 bg-white/[0.03] opacity-60 hover:opacity-100'
              : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
              currentStep === 2
                ? 'bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white shadow-sm shadow-fuchsia-500/30'
                : isDark
                ? 'bg-white/10 text-white/50'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </div>
          <div className="min-w-0 flex-1">
            <span
              className={`text-[9px] font-black uppercase block tracking-wider ${
                currentStep === 2 && isDark ? 'text-fuchsia-300' : 'text-slate-400'
              }`}
            >
              {t('Bước 2', 'Step 2')}
            </span>
            <span className={`text-xs font-bold truncate block ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {studioTab === 'voice' ? t('Giọng Đọc & Tạo Audio', 'Voice & Generate') : t('Tùy Chỉnh & Sinh Nhạc', 'Config & Render')}
            </span>
          </div>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. STEP 1: CONTENT & LANGUAGE INPUT SCREEN
          ───────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {studioTab === 'voice' ? (
            <>
              {/* Language Selector Dropdown / Pills */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('Ngôn ngữ đọc (Language)', 'Language')}</span>
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {AUDIO_STUDIO_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLang(lang.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 active:scale-95 ${
                        selectedLang === lang.code
                          ? isDark
                            ? 'border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-300 shadow-sm ring-1 ring-fuchsia-400/40'
                            : 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-sm'
                          : isDark
                          ? 'border-white/10 bg-black/20 text-white/70 hover:border-white/20 hover:text-white'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    ✍️ {t('Văn bản kịch bản (Script)', 'Script Content')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowScriptAssistant((p) => !p)}
                    className="text-[11px] font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors flex items-center gap-1"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{t('Trợ lý AI viết kịch bản', 'AI Script Assistant')}</span>
                  </button>
                </div>

                {/* AI Script Assistant Pop-down */}
                {showScriptAssistant && (
                  <div
                    className={`p-3.5 rounded-2xl border space-y-2.5 animate-in fade-in duration-150 backdrop-blur-xl ${
                      isDark ? 'border-fuchsia-400/25 bg-fuchsia-500/10' : 'bg-fuchsia-50 border-fuchsia-200'
                    }`}
                  >
                    <div className={`text-[11px] font-bold ${isDark ? 'text-fuchsia-200' : 'text-fuchsia-800'}`}>
                      💡 {t('Nhập chủ đề để AI tự động viết kịch bản:', 'Enter topic for AI to write script:')}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={scriptPromptIdea}
                        onChange={(e) => setScriptPromptIdea(e.target.value)}
                        placeholder="Quảng cáo son môi cao cấp, tin tức công nghệ AI..."
                        className={`flex-1 p-2.5 rounded-xl text-xs border focus:outline-none transition-all ${
                          isDark
                            ? 'bg-black/40 border-white/15 text-white focus:border-fuchsia-400 placeholder:text-white/35'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-fuchsia-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleGenerateScriptWithAI}
                        disabled={isWritingScript}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                          isDark
                            ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md shadow-fuchsia-500/25'
                            : 'bg-fuchsia-600 text-white shadow-sm'
                        }`}
                      >
                        {isWritingScript ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        <span>{t('Viết AI', 'Write')}</span>
                      </button>
                    </div>
                  </div>
                )}

                <textarea
                  rows={6}
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder={t(
                    'Nhập đoạn văn bản cần chuyển thành giọng nói tại đây...',
                    'Enter script text to convert to voice...'
                  )}
                  className={`w-full p-4 rounded-2xl text-xs leading-relaxed border transition-all resize-none focus:outline-none backdrop-blur-xl ${
                    isDark
                      ? 'bg-black/20 border-white/10 text-white placeholder:text-white/35 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20'
                      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20'
                  }`}
                />

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>
                    {scriptText.length} {t('ký tự', 'chars')} (~{Math.max(1, Math.round(scriptText.length / 15))}s)
                  </span>
                  <span>
                    {selectedLangObj?.flag} {selectedLangObj?.name}
                  </span>
                </div>
              </div>
            </>
          ) : (
            // Music Step 1: Prompt & Styles
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  🎵 {t('Phong cách nhạc thịnh hành', 'Trending Music Styles')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MUSIC_STYLES.map((style) => (
                    <div
                      key={style.id}
                      onClick={() => {
                        setSelectedMusicStyle(style);
                        setCustomMusicPrompt(style.prompt);
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all active:scale-98 ${
                        selectedMusicStyle.id === style.id
                          ? isDark
                            ? 'bg-fuchsia-500/20 border-fuchsia-400 text-white shadow-md shadow-fuchsia-500/25 ring-1 ring-fuchsia-400/40'
                            : 'bg-fuchsia-600 text-white border-fuchsia-600'
                          : isDark
                          ? 'bg-black/20 border-white/10 hover:border-white/20 text-slate-300'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold">{isVietnamese ? style.labelVi : style.labelEn}</div>
                      <div className="text-[10px] opacity-80 line-clamp-1 mt-0.5">{style.prompt}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  ✍️ {t('Mô tả nhạc nền (Music Prompt)', 'Music Prompt')}
                </label>
                <textarea
                  rows={4}
                  value={customMusicPrompt}
                  onChange={(e) => setCustomMusicPrompt(e.target.value)}
                  placeholder="Lo-fi hiphop beat, chill piano melody, relaxing atmosphere..."
                  className={`w-full p-4 rounded-2xl text-xs leading-relaxed border transition-all resize-none focus:outline-none backdrop-blur-xl ${
                    isDark
                      ? 'bg-black/20 border-white/10 text-white placeholder:text-white/35 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20'
                      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Action Button: Next to Step 2 */}
          <button
            type="button"
            onClick={() => {
              if (studioTab === 'voice' && !scriptText.trim()) {
                alert(t('Vui lòng nhập văn bản kịch bản!', 'Please enter script!'));
                return;
              }
              setCurrentStep(2);
            }}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white shadow-[0_8px_25px_rgba(192,38,205,0.35)] hover:shadow-[0_12px_32px_rgba(192,38,205,0.45)]'
                : 'bg-fuchsia-600 text-white shadow-md'
            }`}
          >
            <span>
              {studioTab === 'voice'
                ? t('Tiếp Tục Chọn Giọng Đọc (Bước 2)', 'Next: Configure Voice (Step 2)')
                : t('Tiếp Tục Sinh Nhạc (Bước 2)', 'Next: Configure & Render (Step 2)')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. STEP 2: VOICE CONFIGURATION & GENERATION SCREEN
          ───────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Back to Step 1 Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                isDark
                  ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('Quay lại chỉnh văn bản', 'Back to script')}</span>
            </button>

            <span className="text-[11px] font-mono text-slate-400">
              {selectedLangObj?.flag} {selectedLangObj?.name}
            </span>
          </div>

          {/* Script Summary Card */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-2.5 backdrop-blur-xl ${
              isDark ? 'border-white/10 bg-white/[0.04]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <Mic className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                {t('Văn bản đã chọn', 'Script Preview')}
              </span>
              <p className="text-xs text-slate-200 line-clamp-2 mt-0.5 font-mono">
                {studioTab === 'voice' ? scriptText : customMusicPrompt}
              </p>
            </div>
          </div>

          {studioTab === 'voice' ? (
            <>
              {/* Model Selection (WynAI Neural vs Gemini Audio) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  ⚡ {t('Công nghệ AI TTS', 'AI Voice Engine')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModelType('wynai')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      modelType === 'wynai'
                        ? isDark
                          ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 shadow-md ring-1 ring-fuchsia-400/50'
                          : 'bg-fuchsia-50 border-fuchsia-500 text-fuchsia-800 shadow-sm'
                        : isDark
                        ? 'bg-black/20 border-white/10 text-slate-300 hover:border-white/20'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span className="text-xs font-bold">WynAI Neural 48kHz</span>
                    </div>
                    <div className={`text-[10px] mt-1 ${isDark ? 'text-fuchsia-200/80' : 'text-fuchsia-700'}`}>
                      WynAI Voice Studio
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModelType('gemini')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      modelType === 'gemini'
                        ? isDark
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md ring-1 ring-purple-400/50'
                          : 'bg-purple-50 border-purple-500 text-purple-800 shadow-sm'
                        : isDark
                        ? 'bg-black/20 border-white/10 text-slate-300 hover:border-white/20'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs font-bold">Gemini Audio Flash</span>
                    </div>
                    <div className={`text-[10px] mt-1 ${isDark ? 'text-purple-200/80' : 'text-purple-700'}`}>
                      Google Gemini Expressive
                    </div>
                  </button>
                </div>
              </div>

              {/* Region Filter for Vietnamese */}
              {selectedLang === 'vi' && modelType === 'wynai' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    📍 {t('Vùng miền giọng đọc', 'Accent & Region')}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'all' as const, label: 'Tất cả' },
                      { id: 'north' as const, label: 'Miền Bắc' },
                      { id: 'central' as const, label: 'Miền Trung' },
                      { id: 'south' as const, label: 'Miền Nam' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRegionFilter(r.id)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          regionFilter === r.id
                            ? isDark
                              ? 'bg-fuchsia-500/25 text-fuchsia-300 border-fuchsia-400 shadow-sm ring-1 ring-fuchsia-400/40'
                              : 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-sm'
                            : isDark
                            ? 'bg-black/20 border-white/10 text-slate-400 hover:text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Cards Grid */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  🎙️ {t('Danh sách giọng đọc', 'Voice Character')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getAvailableVoices().map((voice) => {
                    const isSelected = selectedVoiceName === voice.name || selectedVoiceName === voice.code;
                    return (
                      <div
                        key={voice.code}
                        onClick={() => setSelectedVoiceName(voice.code)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all active:scale-98 flex flex-col justify-between ${
                          isSelected
                            ? isDark
                              ? 'bg-fuchsia-500/20 border-fuchsia-400 text-white shadow-md shadow-fuchsia-500/20 ring-1 ring-fuchsia-400/40'
                              : 'bg-fuchsia-600 text-white border-fuchsia-600'
                            : isDark
                            ? 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{voice.name}</span>
                          {voice.gender && (
                            <span
                              className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${
                                isSelected
                                  ? 'bg-white/20 border-white/30 text-white'
                                  : isDark
                                  ? 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {voice.gender === 'female' ? '♀ Nữ' : '♂ Nam'}
                            </span>
                          )}
                        </div>
                        {voice.region && (
                          <span className={`text-[10px] mt-1.5 opacity-80 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                            {voice.region}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Speed & Reading Style Sliders */}
              <div
                className={`p-3.5 rounded-2xl border space-y-3 backdrop-blur-xl ${
                  isDark ? 'border-white/10 bg-white/[0.04]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {/* Reading Style */}
                {selectedLang === 'vi' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">
                      🎭 {t('Phong cách đọc (WynAI)', 'Reading Style')}
                    </label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {READING_STYLES.map((st) => (
                        <button
                          key={st.code}
                          type="button"
                          onClick={() => setReadingStyle(st.code)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap border transition-all ${
                            readingStyle === st.code
                              ? isDark
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm ring-1 ring-amber-400/30'
                                : 'bg-amber-500 text-white border-amber-500'
                              : isDark
                              ? 'bg-black/20 border-white/10 text-slate-300 hover:text-white'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {isVietnamese ? st.labelVi : st.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Speed Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400">⚡ {t('Tốc độ đọc', 'Speaking Rate')}</span>
                    <span className="text-fuchsia-400 font-mono">{speakingRate}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={speakingRate}
                    onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                    className="w-full accent-fuchsia-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </>
          ) : (
            // Music Step 2 Config
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">
                  🚫 {t('Loại trừ (Negative Prompt)', 'Negative Prompt')}
                </label>
                <input
                  type="text"
                  value={negativeMusicPrompt}
                  onChange={(e) => setNegativeMusicPrompt(e.target.value)}
                  placeholder="vocals, distortion, noise, harsh beats..."
                  className={`w-full p-3 rounded-xl text-xs border focus:outline-none transition-all ${
                    isDark
                      ? 'bg-black/20 border-white/10 text-white placeholder:text-white/35 focus:border-fuchsia-500'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Action Button: Generate Audio */}
          <button
            type="button"
            onClick={handleGenerateAudio}
            disabled={isGenerating}
            className={`w-full py-4 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 ${
              isDark
                ? 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white shadow-[0_8px_25px_rgba(192,38,205,0.35)] hover:shadow-[0_12px_32px_rgba(192,38,205,0.45)]'
                : 'bg-fuchsia-600 text-white shadow-fuchsia-600/30'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {t('Đang tạo âm thanh AI...', 'Generating audio...')} ({elapsedTime}s)
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {studioTab === 'voice'
                    ? t('✨ Tạo Giọng Đọc AI Ngay', '✨ Generate AI Voice')
                    : t('✨ Tạo Bản Nhạc Ngay', '✨ Generate Music Now')}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. AUDIO PLAYER & RESULT CONTAINER (When Audio is Ready)
          ───────────────────────────────────────────────────────────── */}
      {generatedAudio?.audio_url && (
        <div
          className={`p-4 sm:p-5 rounded-[28px] border space-y-4 animate-in zoom-in-95 duration-200 backdrop-blur-2xl ${
            isDark
              ? 'bg-[#09111f]/95 border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]'
              : 'bg-white border-slate-200 shadow-xl'
          }`}
        >
          <audio ref={audioRef} src={generatedAudio.audio_url} preload="metadata" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {t('Âm thanh đã sẵn sàng!', 'Audio ready!')}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {generatedAudio.duration_sec?.toFixed(1) || duration.toFixed(1)}s · 48kHz
            </span>
          </div>

          {/* Player Controls Bar */}
          <div
            className={`flex items-center gap-3 p-3.5 rounded-2xl border ${
              isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-fuchsia-500/35 hover:scale-105 active:scale-95 transition-transform shrink-0"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1.5">
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.05}
                value={currentTime}
                onChange={(e) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = parseFloat(e.target.value);
                    setCurrentTime(parseFloat(e.target.value));
                  }
                }}
                className="w-full accent-fuchsia-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{currentTime.toFixed(1)}s</span>
                <span>{(duration || generatedAudio.duration_sec || 0).toFixed(1)}s</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Download & Save */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                if (generatedAudio.audio_url) {
                  await saveAndShareMedia(
                    generatedAudio.audio_url,
                    `wynmotion_audio_${Date.now()}.mp3`
                  );
                }
              }}
              className={`flex-1 py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${
                isDark
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md shadow-fuchsia-500/25 hover:scale-[1.01]'
                  : 'bg-fuchsia-600 text-white shadow-md'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{t('Tải Về File MP3', 'Download MP3')}</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (generatedAudio.audio_url) {
                  await saveAndShareMedia(
                    generatedAudio.audio_url,
                    `wynmotion_audio_${Date.now()}.mp3`
                  );
                }
              }}
              className={`px-5 py-3.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                isDark
                  ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>{t('Chia Sẻ', 'Share')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
