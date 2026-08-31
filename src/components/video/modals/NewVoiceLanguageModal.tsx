'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Globe,
  Mic,
  Loader2,
  Play,
  Pause,
  Check,
  Volume2,
  Languages,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  FileText,
  Radio,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { wynmotionService } from '@/services/wynmotionService';
import {
  AUDIO_STUDIO_LANGUAGES,
  VIENEU_NORTHERN_VOICES,
  VIENEU_CENTRAL_VOICES,
  VIENEU_SOUTHERN_VOICES,
  KOKORO_FEMALE_VOICES,
  KOKORO_MALE_VOICES,
  GEMINI_MALE_VOICES,
  GEMINI_FEMALE_VOICES,
  KOKORO_DEFAULT_VOICE_MAP,
  AUDIO_READING_STYLES,
} from '@/components/tabs/AiVideoTab';

export interface GeneratedVoiceResult {
  audio_url: string;
  language_code: string;
  voice_name: string;
  duration_sec: number;
  script: string;
  language_name?: string;
  flag?: string;
}

interface NewVoiceLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseScript?: string;
  basePrompt?: string;
  visualStyle?: string;
  currentLangCode?: string;
  onSuccess: (result: GeneratedVoiceResult) => void;
}

export const NewVoiceLanguageModal: React.FC<NewVoiceLanguageModalProps> = ({
  isOpen,
  onClose,
  baseScript = '',
  basePrompt = '',
  visualStyle = 'whiteboard_stream_hand',
  currentLangCode = 'vi',
  onSuccess,
}) => {
  const { isDark, isVietnamese, t } = useApp();
  const { refreshSubscription } = useWordaiAuth();

  // Multi-step: Step 1 = Language & Script, Step 2 = Voice & Engine
  const [step, setStep] = useState<1 | 2>(1);

  const [selectedLang, setSelectedLang] = useState<string>(
    currentLangCode === 'vi' ? 'en-US' : 'vi'
  );
  const [voiceModel, setVoiceModel] = useState<'wynai' | 'gemini'>('wynai');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('af_bella');
  const [readingStyle, setReadingStyle] = useState('tu_nhien');
  const [vietnameseRegion, setVietnameseRegion] = useState<'all' | 'north' | 'central' | 'south'>('all');

  const [scriptMode, setScriptMode] = useState<'auto_translate' | 'custom'>('auto_translate');
  const [customScriptText, setCustomScriptText] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Reset to Step 1 whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  // Sync default voice when language changes
  useEffect(() => {
    if (voiceModel === 'wynai') {
      if (selectedLang === 'vi') {
        setSelectedVoiceName('Phạm Tuyên');
      } else {
        const def = KOKORO_DEFAULT_VOICE_MAP[selectedLang] || { female: 'af_bella', male: 'am_adam' };
        setSelectedVoiceName(def.female);
      }
    } else {
      setSelectedVoiceName('Puck');
    }
  }, [selectedLang, voiceModel]);

  if (!isOpen) return null;

  const currentLangObj =
    AUDIO_STUDIO_LANGUAGES.find((l) => l.code === selectedLang) || AUDIO_STUDIO_LANGUAGES[0];

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

  const handleGenerateVoice = async () => {
    setIsGenerating(true);
    try {
      const res = await wynmotionService.generateScriptAndAudio({
        prompt: basePrompt || baseScript || 'Voiceover narration',
        script: scriptMode === 'custom' && customScriptText.trim() ? customScriptText.trim() : undefined,
        language_code: selectedLang,
        voice_engine: voiceModel,
        voice_name: selectedVoiceName,
        reading_style: readingStyle,
        script_style: visualStyle === 'product_ads_motion' ? 'commercial_ads' : 'explainer',
        max_chars: 600,
      });

      const audioUrl = res.audio_url || (res as any).file_url;
      if (!audioUrl) throw new Error('Không nhận được đường dẫn audio');

      await refreshSubscription?.();

      onSuccess({
        audio_url: audioUrl,
        language_code: selectedLang,
        voice_name: selectedVoiceName,
        duration_sec: res.duration_sec || 30,
        script: res.script || customScriptText || baseScript,
        language_name: currentLangObj.name,
        flag: currentLangObj.flag,
      });

      onClose();
    } catch (err: any) {
      console.error('Failed to generate multilingual audio:', err);
      alert(err.message || t('Lỗi tạo giọng đọc đa ngôn ngữ', 'Failed to generate voice'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[20000] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-0 sm:p-4"
      style={{ transform: 'translateZ(20000px)', WebkitTransform: 'translateZ(20000px)' }}
    >
      {/* Hidden Preview Audio */}
      <audio ref={audioPreviewRef} />

      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        className={`relative z-[20005] w-full max-w-xl max-h-[92vh] rounded-t-[32px] sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl border transition-all animate-in slide-in-from-bottom duration-300 ${
          isDark ? 'bg-[#0F131F] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        style={{ transform: 'translateZ(20005px)', WebkitTransform: 'translateZ(20005px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with 2-Step Progress Indicator */}
        <div className={`p-4 sm:p-5 border-b space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-cyan-500/20">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black">
                  {t('🎙️ Tạo Giọng Đọc Đa Ngôn Ngữ', '🎙️ Create New Language Voiceover')}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {step === 1
                    ? t('Bước 1: Chọn ngôn ngữ đích & kịch bản', 'Step 1: Select language & narration script')
                    : t('Bước 2: Chọn giọng đọc AI & Engine', 'Step 2: Select AI voice & engine')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-2xl border transition-all active:scale-95 ${
                isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2-Step Navigation Tabs Bar */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all border ${
                step === 1
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] flex items-center justify-center font-bold">1</span>
              <span>{t('Ngôn Ngữ & Kịch Bản', 'Language & Script')}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all border ${
                step === 2
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] flex items-center justify-center font-bold">2</span>
              <span>{t('Giọng Đọc & Engine', 'Voice & Engine')}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* ─────────────────────────────────────────────────────────────
              STEP 1: TARGET LANGUAGE & NARRATION SCRIPT
              ───────────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
              {/* 1.1 TARGET LANGUAGE SELECTOR (Scroll Ngang & Dropdown) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black flex items-center gap-1.5 text-cyan-400 uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{t('1. Chọn Ngôn Ngữ Đích', '1. Target Language')}</span>
                  </label>
                  <span className="text-xs font-bold text-slate-300">
                    {currentLangObj.flag} {currentLangObj.name}
                  </span>
                </div>

                {/* Dropdown Selector */}
                <div className="relative">
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className={`w-full h-11 px-3.5 rounded-2xl border text-xs sm:text-sm font-bold outline-none appearance-none transition-all ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                    }`}
                  >
                    {AUDIO_STUDIO_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name} ({lang.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Horizontal Scroll Chips Bar (Cuộn ngang chọn nhanh) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                  {AUDIO_STUDIO_LANGUAGES.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setSelectedLang(lang.code)}
                        className={`h-9 px-3 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap flex items-center gap-1.5 border transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 border-cyan-300 shadow-md font-black'
                            : isDark
                            ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.code.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1.2 NARRATION SCRIPT TRANSLATION / CUSTOM */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black flex items-center gap-1.5 text-cyan-400 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('2. Kịch Bản Lồng Tiếng', '2. Narration Script')}</span>
                  </label>
                  <div className="flex gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setScriptMode('auto_translate')}
                      className={`px-2.5 py-1 rounded-xl border transition-all ${
                        scriptMode === 'auto_translate'
                          ? 'bg-cyan-400 text-slate-950 border-cyan-400 font-black shadow-xs'
                          : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      {t('⚡ AI Tự Dịch', '⚡ AI Translate')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScriptMode('custom');
                        if (!customScriptText && baseScript) setCustomScriptText(baseScript);
                      }}
                      className={`px-2.5 py-1 rounded-xl border transition-all ${
                        scriptMode === 'custom'
                          ? 'bg-cyan-400 text-slate-950 border-cyan-400 font-black shadow-xs'
                          : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      {t('✏️ Tùy Biến', '✏️ Custom')}
                    </button>
                  </div>
                </div>

                {scriptMode === 'auto_translate' ? (
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-cyan-300">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>
                        {t('AI sẽ tự động dịch kịch bản gốc sang', 'AI will automatically translate script into')}{' '}
                        <strong className="text-white underline">{currentLangObj.name} ({currentLangObj.flag})</strong>
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px] text-slate-300 line-clamp-3 italic">
                      "{baseScript || basePrompt || t('Nội dung phân cảnh video...', 'Video scene contents...')}"
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <textarea
                      value={customScriptText}
                      onChange={(e) => setCustomScriptText(e.target.value)}
                      rows={4}
                      placeholder={t('Nhập nội dung kịch bản bằng ngôn ngữ đích...', 'Enter narration script in target language...')}
                      className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all leading-relaxed"
                    />
                    <div className="text-[10px] text-slate-400 text-right">
                      {customScriptText.length} {t('ký tự', 'characters')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 2: VOICE & ENGINE SELECTION
              ───────────────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
              {/* Selected Language Summary Pill */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentLangObj.flag}</span>
                  <div>
                    <div className="text-xs font-black text-white">{currentLangObj.name} ({selectedLang.toUpperCase()})</div>
                    <div className="text-[10px] text-cyan-400">
                      {scriptMode === 'auto_translate' ? t('⚡ AI Tự động dịch', '⚡ Auto Translation') : t('✏️ Kịch bản tùy biến', '✏️ Custom Script')}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] font-bold text-slate-300 border border-white/10"
                >
                  {t('Đổi Ngôn Ngữ', 'Change')}
                </button>
              </div>

              {/* 2.1 VOICE ENGINE SELECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black flex items-center gap-1.5 text-cyan-400 uppercase tracking-wider">
                    <Mic className="w-3.5 h-3.5" />
                    <span>{t('1. Voice Engine', '1. Voice Engine')}</span>
                  </label>
                  <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-slate-700 text-[10px] font-black">
                    <button
                      type="button"
                      onClick={() => setVoiceModel('wynai')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        voiceModel === 'wynai' ? 'bg-cyan-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      WynAI Kokoro / VieNeu
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoiceModel('gemini')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        voiceModel === 'gemini' ? 'bg-cyan-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Gemini HD
                    </button>
                  </div>
                </div>

                {/* Region Filter for Vietnamese */}
                {selectedLang === 'vi' && voiceModel === 'wynai' && (
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {[
                      { id: 'all', label: 'Tất cả miền' },
                      { id: 'north', label: 'Miền Bắc' },
                      { id: 'central', label: 'Miền Trung' },
                      { id: 'south', label: 'Miền Nam' },
                    ].map((reg) => (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => setVietnameseRegion(reg.id as any)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all shrink-0 ${
                          vietnameseRegion === reg.id
                            ? 'bg-cyan-400 text-slate-950 border-cyan-400'
                            : isDark
                            ? 'bg-slate-800 border-slate-700 text-slate-400'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {reg.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Voices List Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {getDisplayVoiceList().map((v: any) => {
                    const isSelected = selectedVoiceName === v.code;
                    return (
                      <button
                        key={v.code}
                        type="button"
                        onClick={() => setSelectedVoiceName(v.code)}
                        className={`p-2.5 rounded-2xl text-left border transition-all active:scale-95 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-400/15 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40 shadow-xs'
                            : isDark
                            ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black truncate">{v.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                        </div>
                        <span className="text-[9px] text-slate-400 truncate mt-1">{v.desc || v.tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2.2 READING STYLE */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-bold text-slate-400">
                  {t('Phong Cách Đọc:', 'Reading Style:')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {AUDIO_READING_STYLES.map((style) => (
                    <button
                      key={style.code}
                      type="button"
                      onClick={() => setReadingStyle(style.code)}
                      className={`py-2 px-2 rounded-xl text-[10px] font-black border truncate transition-all ${
                        readingStyle === style.code
                          ? 'bg-cyan-400 text-slate-950 border-cyan-400 shadow-xs'
                          : isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {isVietnamese ? style.nameVi : style.nameEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-[#0A0D16]' : 'border-slate-100 bg-slate-50'}`}>
          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all"
            >
              <span>{t('Tiếp Tục (Chọn Giọng Đọc)', 'Continue (Select Voice)')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-12 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('Quay Lại', 'Back')}</span>
              </button>

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateVoice}
                className="col-span-2 h-12 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('Đang tổng hợp...', 'Synthesizing...')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>{t('Tổng Hợp Giọng Đọc ✨', 'Synthesize Voice ✨')}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
