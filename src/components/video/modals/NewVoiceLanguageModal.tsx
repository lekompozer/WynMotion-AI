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
  Crown,
  RefreshCw,
  FileText,
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

  const [selectedLang, setSelectedLang] = useState<string>(
    currentLangCode === 'vi' ? 'en-US' : 'vi'
  );
  const [voiceModel, setVoiceModel] = useState<'wynai' | 'gemini'>('wynai');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('af_bella');
  const [readingStyle, setReadingStyle] = useState('tu_nhien');
  const [vietnameseRegion, setVietnameseRegion] = useState<'all' | 'north' | 'central' | 'south'>('all');

  const [scriptMode, setScriptMode] = useState<'auto_translate' | 'custom'>('auto_translate');
  const [customScriptText, setCustomScriptText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-200 p-0 sm:p-4">
      {/* Hidden Preview Audio */}
      <audio ref={audioPreviewRef} />

      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        className={`relative z-10 w-full max-w-xl max-h-[92vh] rounded-t-[32px] sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl border transition-all animate-in slide-in-from-bottom duration-300 ${
          isDark ? 'bg-[#0F131F] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-cyan-500/20">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black">
                {t('🎙️ Tạo Giọng Đọc Đa Ngôn Ngữ Mới', '🎙️ Create New Language Voiceover')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('Chuyển đổi âm thanh video sang ngôn ngữ quốc tế', 'Generate AI voiceover in 15+ global languages')}
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 1. LANGUAGE SELECTOR (15 LANGUAGES) */}
          <div className="space-y-2">
            <label className="text-xs font-black flex items-center gap-1.5 text-cyan-400 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>1. {t('Chọn Ngôn Ngữ Đích', 'Target Language')}</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {AUDIO_STUDIO_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`p-2 rounded-xl text-left flex flex-col items-center justify-center gap-1 border transition-all active:scale-95 ${
                    selectedLang === lang.code
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40 shadow-xs'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span className="text-[10px] font-black truncate max-w-full text-center">
                    {lang.code.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. VOICE ENGINE & MODEL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black flex items-center gap-1.5 text-cyan-400 uppercase tracking-wider">
                <Mic className="w-3.5 h-3.5" />
                <span>2. {t('Giọng Đọc & Engine', 'Voice & Engine')}</span>
              </label>
              <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-slate-700 text-[10px] font-black">
                <button
                  type="button"
                  onClick={() => setVoiceModel('wynai')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    voiceModel === 'wynai' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  WynAI Kokoro
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceModel('gemini')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    voiceModel === 'gemini' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Gemini HD
                </button>
              </div>
            </div>

            {/* Region Filter for Vietnamese */}
            {selectedLang === 'vi' && voiceModel === 'wynai' && (
              <div className="flex gap-1">
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
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {getDisplayVoiceList().map((v: any) => {
                const isSelected = selectedVoiceName === v.code;
                return (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => setSelectedVoiceName(v.code)}
                    className={`p-2 rounded-xl text-left border transition-all active:scale-95 flex flex-col justify-between ${
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
                    <span className="text-[9px] text-slate-400 truncate mt-0.5">{v.desc || v.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. READING STYLE */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400">
              {t('Phong Cách Đọc:', 'Reading Style:')}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {AUDIO_READING_STYLES.map((style) => (
                <button
                  key={style.code}
                  type="button"
                  onClick={() => setReadingStyle(style.code)}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-black border truncate transition-all ${
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

          {/* 4. SCRIPT TRANSLATION / CUSTOM SCRIPT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black flex items-center gap-1.5 text-cyan-400 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>3. {t('Kịch Bản Lồng Tiếng', 'Narration Script')}</span>
              </label>
              <div className="flex gap-1 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setScriptMode('auto_translate')}
                  className={`px-2 py-0.5 rounded-lg border transition-all ${
                    scriptMode === 'auto_translate'
                      ? 'bg-cyan-400 text-slate-950 border-cyan-400 font-black'
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
                  className={`px-2 py-0.5 rounded-lg border transition-all ${
                    scriptMode === 'custom'
                      ? 'bg-cyan-400 text-slate-950 border-cyan-400 font-black'
                      : 'border-slate-700 text-slate-400'
                  }`}
                >
                  {t('✏️ Tùy Biến', '✏️ Custom')}
                </button>
              </div>
            </div>

            {scriptMode === 'auto_translate' ? (
              <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('AI sẽ tự động dịch kịch bản sang', 'AI will translate script to')} {currentLangObj.name} ({currentLangObj.flag})</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                  "{baseScript || basePrompt || 'Nội dung kịch bản video...'}"
                </p>
              </div>
            ) : (
              <textarea
                value={customScriptText}
                onChange={(e) => setCustomScriptText(e.target.value)}
                rows={3}
                placeholder={t('Nhập kịch bản bằng ngôn ngữ đích...', 'Enter script in target language...')}
                className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
              />
            )}
          </div>
        </div>

        {/* Footer Launch Button */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-[#0A0D16]' : 'border-slate-100 bg-slate-50'}`}>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateVoice}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('Đang tổng hợp giọng đọc AI...', 'Synthesizing AI Voice...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>{t('Tổng Hợp Giọng Đọc Mới ✨', 'Synthesize Voice Track ✨')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
