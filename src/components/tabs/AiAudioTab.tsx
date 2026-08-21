'use client';

import React, { useState, useRef } from 'react';
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
  Wand2,
  Sliders,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import {
  audioService,
  VIETNAMESE_VOICES,
  GLOBAL_VOICES,
  READING_STYLES,
  MUSIC_STYLES,
  VoiceOption,
} from '@/services/audioService';

export const AiAudioTab: React.FC = () => {
  const { isVietnamese, isDark, t } = useApp();
  const { refreshSubscription } = useWordaiAuth();

  // Mode: 'voice' | 'music'
  const [studioMode, setStudioMode] = useState<'voice' | 'music'>('voice');

  // Voiceover States
  const [regionFilter, setRegionFilter] = useState<'north' | 'central' | 'south' | 'global'>('north');
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VIETNAMESE_VOICES[0]);
  const [readingStyle, setReadingStyle] = useState('tu_nhien');
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [scriptText, setScriptText] = useState(
    isVietnamese
      ? 'Chào mừng bạn đến với WynMotion AI. Ứng dụng sáng tạo video hoạt họa và giọng đọc thông minh hàng đầu!'
      : 'Welcome to WynMotion AI. The leading smart animated video and voiceover studio!'
  );
  const [aiPrompt, setAiPrompt] = useState('');
  const [isWritingScript, setIsWritingScript] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  // Music States
  const [selectedMusicStyle, setSelectedMusicStyle] = useState(MUSIC_STYLES[0]);
  const [musicPrompt, setMusicPrompt] = useState(MUSIC_STYLES[0].prompt);
  const [musicDuration, setMusicDuration] = useState<number>(30);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);

  // Audio Playback
  const [resultAudioUrl, setResultAudioUrl] = useState<string | null>(null);
  const [resultDuration, setResultDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter Voices
  const currentVoiceList =
    regionFilter === 'global'
      ? GLOBAL_VOICES
      : VIETNAMESE_VOICES.filter((v) => {
          if (regionFilter === 'north') return v.region?.includes('Bắc');
          if (regionFilter === 'central') return v.region?.includes('Trung');
          if (regionFilter === 'south') return v.region?.includes('Nam');
          return true;
        });

  // Audio Handlers
  const handleTogglePlay = () => {
    if (!audioRef.current || !resultAudioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleGenerateVoice = async () => {
    if (!scriptText.trim()) return;
    setIsGeneratingVoice(true);
    setIsPlaying(false);
    try {
      const res = await audioService.generateSpeech({
        text: scriptText.trim(),
        voice_name: selectedVoice.code,
        language_code: regionFilter === 'global' ? 'en-US' : 'vi',
        reading_style: readingStyle,
        speed: speechSpeed,
      });
      setResultAudioUrl(res.audio_url);
      setResultDuration(res.duration_sec);
      await refreshSubscription();
    } catch (err: any) {
      alert(err.message || t('Lỗi tạo giọng đọc', 'Failed to generate voiceover'));
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) return;
    setIsGeneratingMusic(true);
    setIsPlaying(false);
    try {
      const res = await audioService.generateMusic({
        prompt: musicPrompt.trim(),
        duration_sec: musicDuration,
      });
      setResultAudioUrl(res.audio_url);
      setResultDuration(res.duration_sec);
      await refreshSubscription();
    } catch (err: any) {
      alert(err.message || t('Lỗi tạo nhạc nền', 'Failed to generate music'));
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleAiWriteScript = async () => {
    if (!aiPrompt.trim()) return;
    setIsWritingScript(true);
    try {
      const script = await audioService.generateScriptFromPrompt(
        aiPrompt.trim(),
        regionFilter === 'global' ? 'en' : 'vi'
      );
      if (script) {
        setScriptText(script);
        setAiPrompt('');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi soạn kịch bản');
    } finally {
      setIsWritingScript(false);
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto p-4 sm:p-6 space-y-5 transition-colors duration-200 ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={resultAudioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* TOP SEGMENTED SWITCHER: Voiceover vs Music */}
      <div className={`p-1 rounded-2xl flex items-center shadow-inner border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/70 border-slate-300/60'
      }`}>
        <button
          type="button"
          onClick={() => setStudioMode('voice')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            studioMode === 'voice'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Mic className="h-4 w-4" />
          <span>{t('Giọng Đọc AI (Voiceover)', 'AI Voiceover')}</span>
        </button>
        <button
          type="button"
          onClick={() => setStudioMode('music')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            studioMode === 'music'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Music2 className="h-4 w-4" />
          <span>{t('Nhạc Nền AI (Music)', 'AI Music')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE A: AI VOICEOVER STUDIO */}
      {/* ========================================================================= */}
      {studioMode === 'voice' && (
        <div className="space-y-5 animate-in fade-in-50 duration-150">
          {/* 1. Region Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'north', label: t('🇻🇳 Miền Bắc', '🇻🇳 Northern') },
              { id: 'central', label: t('🇻🇳 Miền Trung', '🇻🇳 Central') },
              { id: 'south', label: t('🇻🇳 Miền Nam', '🇻🇳 Southern') },
              { id: 'global', label: t('🌍 Quốc Tế (US/UK)', '🌍 Global Voices') },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setRegionFilter(tab.id as any);
                  if (tab.id === 'global') setSelectedVoice(GLOBAL_VOICES[0]);
                  else setSelectedVoice(VIETNAMESE_VOICES[0]);
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all border ${
                  regionFilter === tab.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm font-black'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400'
                    : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 2. Voice Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t('Chọn Diễn Viên Lồng Tiếng', 'Select Voice Actor')}
            </label>
            <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {currentVoiceList.map((v) => {
                const isSelected = selectedVoice.code === v.code;
                return (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => setSelectedVoice(v)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-sm'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{v.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {v.gender === 'male' ? '♂️ Nam' : '♀️ Nữ'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">{v.region}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Reading Style */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t('Phong Cách Đọc', 'Reading Style')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {READING_STYLES.map((st) => (
                <button
                  key={st.code}
                  type="button"
                  onClick={() => setReadingStyle(st.code)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    readingStyle === st.code
                      ? 'bg-cyan-500/10 border-cyan-400'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                  }`}
                >
                  <span className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Textarea for Narration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
                {t('Nội Dung Lời Thoại', 'Narration Text')}
              </label>
              <span className="text-[11px] font-bold text-slate-400">{scriptText.length} ký tự</span>
            </div>
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={4}
              placeholder={t('Nhập văn bản cần đọc...', 'Enter text to speak...')}
              className={`w-full p-4 rounded-2xl border text-sm font-medium outline-none resize-none transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-cyan-400'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
              }`}
            />
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleGenerateVoice}
            disabled={isGeneratingVoice || !scriptText.trim()}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingVoice ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t('Đang lồng tiếng AI...', 'Synthesizing voice...')}</span>
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                <span>{t('Tạo Giọng Đọc AI Ngay 🔊', 'Generate AI Voiceover 🔊')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE B: AI MUSIC STUDIO */}
      {/* ========================================================================= */}
      {studioMode === 'music' && (
        <div className="space-y-5 animate-in fade-in-50 duration-150">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t('Phong Cách Âm Nhạc', 'Music Style')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MUSIC_STYLES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setSelectedMusicStyle(st);
                    setMusicPrompt(st.prompt);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedMusicStyle.id === st.id
                      ? 'bg-cyan-500/10 border-cyan-400'
                      : isDark
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t('Mô Tả Nhạc Cần Tạo', 'Music Prompt')}
            </label>
            <textarea
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
              rows={3}
              className={`w-full p-4 rounded-2xl border text-sm font-medium outline-none resize-none transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-cyan-400'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateMusic}
            disabled={isGeneratingMusic || !musicPrompt.trim()}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingMusic ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t('Đang sáng tác nhạc AI...', 'Composing music...')}</span>
              </>
            ) : (
              <>
                <Music2 className="h-5 w-5" />
                <span>{t('Tạo Nhạc Nền AI Ngay 🎵', 'Generate AI Music 🎵')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Audio Player Result Box */}
      {resultAudioUrl && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between animate-in fade-in ${
          isDark ? 'bg-cyan-950/40 border-cyan-800/40' : 'bg-cyan-50 border-cyan-200'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className="w-12 h-12 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <div>
              <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('File âm thanh đã tạo', 'Audio ready')}
              </div>
              <div className="text-[11px] text-cyan-600 font-semibold mt-0.5">
                {Math.round(currentTime)}s / {resultDuration}s
              </div>
            </div>
          </div>
          <a
            href={resultAudioUrl}
            download="wynmotion_audio.mp3"
            className="p-2.5 rounded-xl bg-cyan-400 text-slate-950 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};
