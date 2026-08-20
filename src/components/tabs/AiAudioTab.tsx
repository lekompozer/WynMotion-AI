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
  const { isVietnamese, t } = useApp();
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

  const handleGenerateVoiceover = async () => {
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
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={resultAudioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* TOP SEGMENTED SWITCHER: Voiceover vs Music */}
      <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center shadow-inner">
        <button
          type="button"
          onClick={() => setStudioMode('voice')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            studioMode === 'voice'
              ? 'bg-white text-[#FF2D55] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mic className="h-3.5 w-3.5" />
          <span>{t('Giọng Đọc AI (Voiceover)', 'AI Voiceover')}</span>
        </button>
        <button
          type="button"
          onClick={() => setStudioMode('music')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            studioMode === 'music'
              ? 'bg-white text-[#FF2D55] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Music2 className="h-3.5 w-3.5" />
          <span>{t('Nhạc Nền AI (Music)', 'AI Music')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE A: AI VOICEOVER STUDIO */}
      {/* ========================================================================= */}
      {studioMode === 'voice' && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          {/* 1. Region Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
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
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                  regionFilter === tab.id
                    ? 'bg-[#FF2D55] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 2. Voice Selection Grid */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              {t('Chọn Giọng Đọc Neural 48kHz', 'Select Neural 48kHz Voice')}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {currentVoiceList.map((voice) => {
                const isSelected = selectedVoice.code === voice.code;
                return (
                  <button
                    key={voice.code}
                    type="button"
                    onClick={() => setSelectedVoice(voice)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#FF2D55] bg-rose-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {voice.name}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                          voice.gender === 'female'
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {voice.gender === 'female' ? '♀ Nữ' : '♂ Nam'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{voice.region}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Reading Style & Speed Slider */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                {t('Phong Cách Đọc', 'Reading Style')}
              </label>
              <select
                value={readingStyle}
                onChange={(e) => setReadingStyle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 outline-none"
              >
                {READING_STYLES.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  {t('Tốc Độ Đọc', 'Speed')}
                </label>
                <span className="text-xs font-black text-[#FF2D55]">{speechSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.25"
                value={speechSpeed}
                onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                className="w-full accent-[#FF2D55]"
              />
            </div>
          </div>

          {/* 4. Textarea & AI Script Assistant */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {t('Nội Dung Văn Bản / Kịch Bản', 'Script / Voice Text')}
              </label>
              <span className="text-[10px] font-bold text-slate-400">
                {scriptText.length} {t('ký tự', 'chars')}
              </span>
            </div>

            <textarea
              rows={4}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder={t('Nhập văn bản cần đọc...', 'Enter text to synthesize...')}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:border-[#FF2D55] leading-relaxed resize-none"
            />

            {/* AI Script Assistant Input */}
            <div className="pt-1 flex items-center gap-1.5">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={t('Nhập chủ đề để AI tự soạn...', 'Enter topic for AI writer...')}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
              />
              <button
                type="button"
                disabled={isWritingScript || !aiPrompt.trim()}
                onClick={handleAiWriteScript}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-black flex items-center gap-1 shrink-0 active:scale-95 transition-all"
              >
                {isWritingScript ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5 text-rose-400" />
                )}
                <span>{t('AI Soạn', 'AI Write')}</span>
              </button>
            </div>
          </div>

          {/* 5. Generate Voiceover Button */}
          <button
            type="button"
            disabled={isGeneratingVoice || !scriptText.trim()}
            onClick={handleGenerateVoiceover}
            className="w-full py-3.5 rounded-2xl bg-[#FF2D55] hover:bg-[#E11D48] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {isGeneratingVoice ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('Đang Xử Lý Giọng Đọc 48kHz...', 'Synthesizing Neural Audio...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{t('Tạo Giọng Đọc AI Ngay (1 Điểm)', 'Generate AI Voice (1 Pt)')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE B: AI MUSIC STUDIO */}
      {/* ========================================================================= */}
      {studioMode === 'music' && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          {/* Preset Styles */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              {t('Gợi Ý Thể Loại Nhạc Nền', 'Select Music Style Preset')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MUSIC_STYLES.map((st) => {
                const isSelected = selectedMusicStyle.id === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setSelectedMusicStyle(st);
                      setMusicPrompt(st.prompt);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#FF2D55] bg-rose-50/50 shadow-xs font-black'
                        : 'border-slate-200 hover:border-slate-300 bg-white font-bold'
                    } text-xs text-slate-900 truncate`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Music Prompt Box */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              {t('Mô Tả Giai Điệu / Nhạc Cụ', 'Music Prompt Description')}
            </label>
            <textarea
              rows={3}
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
              placeholder="Describe instruments, mood, bpm..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:border-[#FF2D55] leading-relaxed resize-none"
            />
          </div>

          {/* Duration Selector */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">{t('Thời lượng', 'Duration')}</span>
            <div className="flex items-center gap-1">
              {[15, 30, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setMusicDuration(d)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                    musicDuration === d
                      ? 'bg-[#FF2D55] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Generate Music Button */}
          <button
            type="button"
            disabled={isGeneratingMusic || !musicPrompt.trim()}
            onClick={handleGenerateMusic}
            className="w-full py-3.5 rounded-2xl bg-[#FF2D55] hover:bg-[#E11D48] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {isGeneratingMusic ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('Đang Sáng Tác Nhạc Nền AI...', 'Composing AI Music...')}</span>
              </>
            ) : (
              <>
                <Music2 className="h-4 w-4" />
                <span>{t('Tạo Bản Nhạc AI (3 Điểm)', 'Compose AI Music (3 Pts)')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESULT & MOBILE WAVEFORM AUDIO PLAYER */}
      {/* ========================================================================= */}
      {resultAudioUrl && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-rose-200/80 shadow-lg shadow-rose-500/5 space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-rose-50 text-[#FF2D55]">
                <Volume2 className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  {studioMode === 'voice'
                    ? selectedVoice.name
                    : selectedMusicStyle.label}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  {Math.round(resultDuration)}s · MP3 48kHz
                </p>
              </div>
            </div>

            <a
              href={resultAudioUrl}
              download="wynmotion-audio.mp3"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>

          {/* Waveform Scrubber Simulation */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-full bg-[#FF2D55] text-white flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
              {/* Fake animated bars */}
              <div className="flex items-center gap-0.8 h-6 overflow-hidden">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${Math.max(20, (Math.sin(i * 0.8) * 0.5 + 0.5) * 100)}%`,
                    }}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      isPlaying ? 'bg-[#FF2D55]' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                <span>{Math.floor(currentTime)}s</span>
                <span>{Math.round(resultDuration)}s</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
