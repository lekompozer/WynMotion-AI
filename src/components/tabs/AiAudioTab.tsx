'use client';

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
  FolderOpen,
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

type StudioTab = 'voice' | 'music';

export const AiAudioTab: React.FC = () => {
  const { isVietnamese, isDark, setActiveTab, t } = useApp();
  const { refreshSubscription } = useWordaiAuth();

  // Studio Mode: 'voice' | 'music'
  const [studioTab, setStudioTab] = useState<StudioTab>('voice');

  // ── Step 1: Voice Settings ──
  const [selectedLang, setSelectedLang] = useState<string>(isVietnamese ? 'vi' : 'en-US');
  const [modelType, setModelType] = useState<'wynai' | 'gemini'>('wynai');
  const [regionFilter, setRegionFilter] = useState<'all' | 'north' | 'central' | 'south'>('all');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('Phạm Tuyên');
  const [readingStyle, setReadingStyle] = useState<string>('tu_nhien');
  const [speakingRate, setSpeakingRate] = useState<number>(1.0);

  // ── Step 1: Music Settings ──
  const [selectedMusicStyle, setSelectedMusicStyle] = useState(MUSIC_STYLES[0]);
  const [customMusicPrompt, setCustomMusicPrompt] = useState(MUSIC_STYLES[0].prompt);
  const [negativeMusicPrompt, setNegativeMusicPrompt] = useState('');

  // ── Step 2: Text / Script Input ──
  const [scriptText, setScriptText] = useState(
    isVietnamese
      ? 'Chào mừng bạn đến với WynMotion AI. Ứng dụng sáng tạo video hoạt họa và giọng đọc thông minh hàng đầu!'
      : 'Welcome to WynMotion AI. The leading smart animated video and voiceover studio!'
  );
  const [isWritingScript, setIsWritingScript] = useState(false);
  const [scriptPromptIdea, setScriptPromptIdea] = useState('');
  const [showScriptAssistant, setShowScriptAssistant] = useState(false);

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

  // Audio event listeners
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

  // Timer for live generation duration
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

  // Get current voice list
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

  // Play / Pause toggle
  const togglePlay = () => {
    if (!audioRef.current || !generatedAudio?.audio_url) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Seek audio
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  // Volume toggle
  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // ── AI Script Assistant ──
  const handleGenerateScriptWithAI = async () => {
    if (!scriptPromptIdea.trim()) return;
    setIsWritingScript(true);
    try {
      const generated = await audioService.generateScriptFromPrompt(
        scriptPromptIdea.trim(),
        selectedLang
      );
      if (generated) {
        setScriptText(generated);
        setShowScriptAssistant(false);
      }
    } catch (err: any) {
      alert(err.message || t('Lỗi tạo kịch bản AI', 'Failed to generate script'));
    } finally {
      setIsWritingScript(false);
    }
  };

  // ── Voiceover Generation ──
  const handleGenerateVoice = async () => {
    if (!scriptText.trim()) {
      alert(t('Vui lòng nhập văn bản cần đọc', 'Please enter text to synthesize'));
      return;
    }

    setIsGenerating(true);
    setGeneratedAudio(null);
    setIsPlaying(false);

    try {
      const res = await audioService.generateSpeech({
        text: scriptText.trim(),
        voice_name: selectedVoiceName,
        language_code: selectedLang,
        voice_engine: modelType,
        reading_style: readingStyle,
        speaking_rate: speakingRate,
      });

      setGeneratedAudio(res);
      await refreshSubscription();
    } catch (err: any) {
      alert(err.message || t('Lỗi tạo giọng đọc AI', 'Failed to generate speech'));
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Music Generation ──
  const handleGenerateMusic = async () => {
    if (!customMusicPrompt.trim()) {
      alert(t('Vui lòng nhập mô tả nhạc nền', 'Please enter music description'));
      return;
    }

    setIsGenerating(true);
    setGeneratedAudio(null);
    setIsPlaying(false);

    try {
      const res = await audioService.generateMusic({
        prompt: customMusicPrompt.trim(),
        negative_prompt: negativeMusicPrompt.trim() || undefined,
      });

      if (res.audio_url) {
        setGeneratedAudio({
          audio_url: res.audio_url,
          duration_sec: 30,
          filename: 'wynmotion_bgm.wav',
        });
      } else {
        alert(t('🎵 Đang tạo nhạc nền AI, vui lòng kiểm tra sau!', '🎵 Generating AI BGM, please check shortly!'));
      }
      await refreshSubscription();
    } catch (err: any) {
      alert(err.message || t('Lỗi tạo nhạc nền AI', 'Failed to generate music'));
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Download Audio ──
  const handleDownload = () => {
    if (!generatedAudio?.audio_url) return;
    const a = document.createElement('a');
    a.href = generatedAudio.audio_url;
    a.download = generatedAudio.filename || 'wynmotion_audio.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const voiceList = getAvailableVoices();

  return (
    <div
      className={`w-full max-w-xl mx-auto px-4 py-5 space-y-6 transition-colors duration-200 ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* Hidden audio element */}
      {generatedAudio?.audio_url && (
        <audio ref={audioRef} src={generatedAudio.audio_url} className="hidden" preload="auto" />
      )}

      {/* ─── TAB SWITCHER: VOICE (TTS) vs MUSIC (BGM) ─── */}
      <div
        className={`p-1.5 rounded-3xl border flex items-center gap-1.5 shadow-sm ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <button
          type="button"
          onClick={() => setStudioTab('voice')}
          className={`flex-1 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
            studioTab === 'voice'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>{t('Lồng Tiếng AI (TTS)', 'AI Voiceover (TTS)')}</span>
        </button>

        <button
          type="button"
          onClick={() => setStudioTab('music')}
          className={`flex-1 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
            studioTab === 'music'
              ? 'bg-gradient-to-r from-purple-400 to-violet-600 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Music2 className="w-4 h-4" />
          <span>{t('Nhạc Nền AI (BGM)', 'AI Music & BGM')}</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          VOICE STUDIO (TTS)
      ═══════════════════════════════════════════════════════════ */}
      {studioTab === 'voice' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* ─── STEP 1: CẤU HÌNH & GIỌNG ĐỌC (SETTINGS FIRST) ─── */}
          <div
            className={`rounded-3xl p-5 border space-y-4 shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('Cấu Hình & Chọn Giọng Đọc', 'Voice & Language Settings')}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400">
                48kHz Studio
              </span>
            </div>

            {/* 1.1: Language Selector Carousel */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t('1. Ngôn Ngữ', '1. Language')}
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-2 px-2">
                {AUDIO_STUDIO_LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLang(lang.code)}
                      className={`flex-shrink-0 px-3 py-2 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 text-cyan-400 shadow-sm'
                          : isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1.2: AI Voice Engine Switcher (WynAI vs Gemini) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t('2. Mô Hình AI Voice', '2. AI Voice Engine')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModelType('wynai')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    modelType === 'wynai'
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40'
                      : isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="text-xs font-black flex items-center justify-between">
                    <span>WynAI Audio (VieNeu)</span>
                    {modelType === 'wynai' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('VieNeu 48kHz siêu thực · Kokoro 15+ tiếng', 'VieNeu 48kHz & Kokoro 15+ langs')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setModelType('gemini')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    modelType === 'gemini'
                      ? 'bg-purple-500/15 border-purple-400 text-purple-300 ring-1 ring-purple-400/40'
                      : isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="text-xs font-black flex items-center justify-between">
                    <span>Gemini AI Audio</span>
                    {modelType === 'gemini' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('30+ giọng tự nhiên đa cảm xúc', '30+ expressive natural voices')}
                  </p>
                </button>
              </div>
            </div>

            {/* 1.3: Region Filter (for Vietnamese VieNeu) */}
            {selectedLang === 'vi' && modelType === 'wynai' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t('3. Vùng Miền Giọng Đọc', '3. Vietnamese Region')}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'all' as const, label: t('Tất Cả', 'All') },
                    { id: 'north' as const, label: t('Miền Bắc', 'North') },
                    { id: 'central' as const, label: t('Miền Trung', 'Central') },
                    { id: 'south' as const, label: t('Miền Nam', 'South') },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegionFilter(r.id)}
                      className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                        regionFilter === r.id
                          ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-sm'
                          : isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 1.4: Voice List Selection Grid */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t('4. Danh Sách Giọng Đọc', '4. Select Voice')}
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {voiceList.map((v) => {
                  const isSelected = selectedVoiceName === v.code;
                  return (
                    <button
                      key={v.code}
                      type="button"
                      onClick={() => setSelectedVoiceName(v.code)}
                      className={`p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40 shadow-sm'
                          : isDark
                          ? 'bg-slate-800/70 border-slate-700 hover:border-slate-600 text-slate-300'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black truncate">{v.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
                        <span className="truncate">{v.region}</span>
                        {v.tag && (
                          <span className="px-1.5 py-0.2 rounded-md bg-black/40 text-cyan-300 font-semibold flex-shrink-0">
                            {v.tag}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1.5: Reading Style & Speed */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/40">
              {/* Reading style for VieNeu */}
              {selectedLang === 'vi' && modelType === 'wynai' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">
                    {t('Phong cách đọc', 'Reading Style')}
                  </label>
                  <select
                    value={readingStyle}
                    onChange={(e) => setReadingStyle(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {READING_STYLES.map((st) => (
                      <option key={st.code} value={st.code}>
                        {isVietnamese ? st.labelVi : st.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Speaking speed */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400">
                    {t('Tốc độ đọc', 'Speed')}
                  </label>
                  <span className="text-[10px] font-bold text-cyan-400">{speakingRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.25"
                  value={speakingRate}
                  onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* ─── STEP 2: NHẬP VĂN BẢN & TẠO AUDIO (TEXT & GENERATE) ─── */}
          <div
            className={`rounded-3xl p-5 border space-y-4 shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('Nội Dung Văn Bản Cần Đọc', 'Script & Narration Text')}
                </h3>
              </div>

              {/* AI Auto-write button */}
              <button
                type="button"
                onClick={() => setShowScriptAssistant((v) => !v)}
                className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('AI Viết Hộ', 'AI Writer')}</span>
              </button>
            </div>

            {/* AI Prompt Assistant Panel */}
            {showScriptAssistant && (
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 animate-in slide-in-from-top-2 ${
                  isDark ? 'bg-cyan-950/20 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'
                }`}
              >
                <label className="text-[11px] font-bold text-cyan-400">
                  {t('Nhập ý tưởng để AI viết kịch bản tự động:', 'Enter idea for AI to draft script:')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scriptPromptIdea}
                    onChange={(e) => setScriptPromptIdea(e.target.value)}
                    placeholder={t('Ví dụ: Giới thiệu khóa học tiếng Anh giao tiếp...', 'e.g. Intro for English course...')}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-cyan-400 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateScriptWithAI}
                    disabled={isWritingScript || !scriptPromptIdea.trim()}
                    className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1 disabled:opacity-50"
                  >
                    {isWritingScript ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    <span>{t('Tạo', 'Write')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Textarea */}
            <div className="space-y-1.5">
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder={t('Nhập văn bản cần chuyển thành giọng nói...', 'Enter text to synthesize...')}
                className={`w-full px-4 py-3 rounded-2xl text-xs leading-relaxed border resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
                <span>{selectedVoiceName} · {selectedLang}</span>
                <span>{scriptText.length} / 2000 {t('ký tự', 'chars')}</span>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerateVoice}
              disabled={isGenerating || !scriptText.trim()}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t(`Đang tạo giọng đọc AI (${elapsedTime}s)...`, `Generating speech (${elapsedTime}s)...`)}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{t('Tạo Giọng Đọc AI Ngay 🚀', 'Synthesize Voiceover 🚀')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MUSIC STUDIO (BGM)
      ═══════════════════════════════════════════════════════════ */}
      {studioTab === 'music' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* ─── STEP 1: CẤU HÌNH PHONG CÁCH NHẠC (SETTINGS FIRST) ─── */}
          <div
            className={`rounded-3xl p-5 border space-y-4 shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-400 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('Chọn Thể Loại & Nhịp Điệu', 'Music Genre & Style')}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400">
                Lyria AI
              </span>
            </div>

            {/* Music Style Cards */}
            <div className="grid grid-cols-2 gap-2">
              {MUSIC_STYLES.map((style) => {
                const isSelected = selectedMusicStyle.id === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      setSelectedMusicStyle(style);
                      setCustomMusicPrompt(style.prompt);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-purple-500/15 border-purple-400 text-purple-300 ring-1 ring-purple-400/40 shadow-sm'
                        : isDark
                        ? 'bg-slate-800/70 border-slate-700 hover:border-slate-600 text-slate-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black truncate">
                        {isVietnamese ? style.labelVi : style.labelEn}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── STEP 2: MÔ TẢ PROMPT & TẠO NHẠC (TEXT & GENERATE) ─── */}
          <div
            className={`rounded-3xl p-5 border space-y-4 shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-400 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('Mô Tả & Khởi Tạo Nhạc Nền', 'Music Prompt & Launch')}
              </h3>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400">
                {t('Prompt chi tiết (nhạc cụ, cảm xúc, tempo):', 'Detailed prompt (instruments, mood, tempo):')}
              </label>
              <textarea
                value={customMusicPrompt}
                onChange={(e) => setCustomMusicPrompt(e.target.value)}
                rows={3}
                placeholder={t('Nhập mô tả nhạc nền bạn muốn...', 'Describe the background music you want...')}
                className={`w-full px-4 py-3 rounded-2xl text-xs leading-relaxed border resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Negative Prompt (Optional) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400">
                {t('Loại trừ (Negative Prompt - tùy chọn):', 'Negative prompt (optional):')}
              </label>
              <input
                type="text"
                value={negativeMusicPrompt}
                onChange={(e) => setNegativeMusicPrompt(e.target.value)}
                placeholder={t('Ví dụ: vocals, harsh drums, distortion...', 'e.g. vocals, harsh drums...')}
                className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-purple-400 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerateMusic}
              disabled={isGenerating || !customMusicPrompt.trim()}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 via-violet-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t(`Đang tạo nhạc nền AI (${elapsedTime}s)...`, `Generating AI music (${elapsedTime}s)...`)}</span>
                </>
              ) : (
                <>
                  <Music2 className="w-5 h-5" />
                  <span>{t('Tạo Nhạc Nền AI Ngay 🎵', 'Generate AI Music 🎵')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          RESULT AUDIO PLAYER & ACTIONS
      ═══════════════════════════════════════════════════════════ */}
      {generatedAudio?.audio_url && (
        <div
          className={`rounded-3xl p-5 border space-y-4 shadow-xl animate-in zoom-in-95 duration-200 ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 to-[#121422] border-cyan-500/40 shadow-cyan-500/10'
              : 'bg-gradient-to-br from-cyan-50/50 to-white border-cyan-300 shadow-cyan-500/5'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('Âm Thanh Đã Sẵn Sàng! 🎉', 'Audio Ready! 🎉')}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {studioTab === 'voice' ? `${selectedVoiceName} · ${selectedLang}` : 'WynMotion AI BGM'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 transition-colors"
              title={t('Tải về', 'Download')}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Player Controls */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Play / Pause button */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center shadow-md shadow-cyan-500/25 active:scale-90 transition-all flex-shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-slate-950" />
                ) : (
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                )}
              </button>

              {/* Progress & Time */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <input
                  type="range"
                  min="0"
                  max={duration || 30}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || generatedAudio.duration_sec || 0)}</span>
                </div>
              </div>

              {/* Mute button */}
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/40">
            <button
              type="button"
              onClick={handleDownload}
              className="py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('Tải File Audio', 'Download WAV')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'border-slate-200 bg-white text-slate-700 shadow-sm'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('Xem Trong Thư Viện', 'Open in Library')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
