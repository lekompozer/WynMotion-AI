'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Globe, Sliders, Volume2, User } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { DialogueSpeakerConfig } from '@/services/wynmotionService';
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
} from '@/components/tabs/AiVideoTab';

interface DualVoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  speakerRole: 'A' | 'B';
  currentConfig: DialogueSpeakerConfig;
  onSave: (config: DialogueSpeakerConfig) => void;
}

export const DualVoiceSelectorModal: React.FC<DualVoiceSelectorModalProps> = ({
  isOpen,
  onClose,
  speakerRole,
  currentConfig,
  onSave,
}) => {
  const { isVietnamese, isDark, t } = useApp();

  const [name, setName] = useState(currentConfig.name);
  const [selectedLang, setSelectedLang] = useState(currentConfig.language_code || (isVietnamese ? 'vi' : 'en-US'));
  const [voiceModel, setVoiceModel] = useState<'wynai' | 'gemini'>(currentConfig.voice_engine || 'wynai');
  const [selectedVoiceName, setSelectedVoiceName] = useState(currentConfig.voice_name);
  const [gender, setGender] = useState<'male' | 'female'>(currentConfig.gender || (speakerRole === 'A' ? 'female' : 'male'));
  const [vietnameseRegion, setVietnameseRegion] = useState<'all' | 'north' | 'central' | 'south'>('all');

  if (!isOpen || typeof window === 'undefined') return null;

  const handleLangChange = (langCode: string) => {
    setSelectedLang(langCode);
    if (voiceModel === 'wynai') {
      if (langCode === 'vi') {
        setSelectedVoiceName(gender === 'female' ? 'Trúc Ly' : 'Phạm Tuyên');
      } else {
        setSelectedVoiceName(KOKORO_DEFAULT_VOICE_MAP[langCode] || (gender === 'female' ? 'af_bella' : 'am_adam'));
      }
    }
  };

  const handleModelChange = (model: 'wynai' | 'gemini') => {
    setVoiceModel(model);
    if (model === 'wynai') {
      if (selectedLang === 'vi') {
        setSelectedVoiceName(gender === 'female' ? 'Trúc Ly' : 'Phạm Tuyên');
      } else {
        setSelectedVoiceName(gender === 'female' ? 'af_bella' : 'am_adam');
      }
    } else {
      setSelectedVoiceName(gender === 'female' ? 'Kore' : 'Puck');
    }
  };

  const getDisplayVoiceList = () => {
    if (voiceModel === 'gemini') {
      return gender === 'female' ? GEMINI_FEMALE_VOICES : GEMINI_MALE_VOICES;
    }
    if (selectedLang === 'vi') {
      let list = [...VIENEU_NORTHERN_VOICES, ...VIENEU_CENTRAL_VOICES, ...VIENEU_SOUTHERN_VOICES];
      if (vietnameseRegion === 'north') list = VIENEU_NORTHERN_VOICES;
      if (vietnameseRegion === 'central') list = VIENEU_CENTRAL_VOICES;
      if (vietnameseRegion === 'south') list = VIENEU_SOUTHERN_VOICES;
      return list;
    }
    return gender === 'female' ? KOKORO_FEMALE_VOICES : KOKORO_MALE_VOICES;
  };

  const handleApply = () => {
    onSave({
      name: name.trim() || (speakerRole === 'A' ? 'Speaker A' : 'Speaker B'),
      gender,
      voice_engine: voiceModel,
      voice_name: selectedVoiceName,
      language_code: selectedLang,
    });
    onClose();
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 space-y-5 border max-h-[85vh] overflow-y-auto ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/40">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
              speakerRole === 'A' ? 'bg-cyan-500 text-slate-950' : 'bg-purple-500 text-white'
            }`}>
              {speakerRole}
            </div>
            <h3 className="text-base font-black">
              {isVietnamese
                ? `Cấu hình Giọng đọc Nhân vật ${speakerRole}`
                : `Configure Character ${speakerRole} Voice`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Character Name & Gender */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isVietnamese ? '1. Tên hiển thị & Giới tính' : '1. Character Name & Gender'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={speakerRole === 'A' ? 'Sarah / Lễ tân / Interviewer' : 'Tom / Khách hàng / Candidate'}
              className={`flex-1 p-3.5 rounded-2xl border text-sm font-semibold outline-none ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
            <div className="flex rounded-2xl border border-slate-700/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`px-3 py-2 text-xs font-black transition-all ${
                  gender === 'female' ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                ♀️ Nữ
              </button>
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`px-3 py-2 text-xs font-black transition-all ${
                  gender === 'male' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                ♂️ Nam
              </button>
            </div>
          </div>
        </div>

        {/* 2. Spoken Language */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            <span>{isVietnamese ? '2. Ngôn ngữ phát âm' : '2. Spoken Language'}</span>
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {AUDIO_STUDIO_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLangChange(lang.code)}
                className={`flex-shrink-0 py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1 border ${
                  selectedLang === lang.code
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-500'
                    : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. AI Voice Engine */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-500" />
            <span>{isVietnamese ? '3. Bộ công nghệ AI' : '3. AI Engine'}</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleModelChange('wynai')}
              className={`p-3 rounded-2xl border text-left ${
                voiceModel === 'wynai' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-500' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="font-extrabold text-xs">WynAI Ultra-HD</div>
              <div className="text-[10px] text-slate-400">VieNeu & Kokoro 48kHz</div>
            </button>
            <button
              type="button"
              onClick={() => handleModelChange('gemini')}
              className={`p-3 rounded-2xl border text-left ${
                voiceModel === 'gemini' ? 'bg-purple-500/10 border-purple-400 text-purple-400' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="font-extrabold text-xs">Google Gemini</div>
              <div className="text-[10px] text-slate-400">Expressive Tone</div>
            </button>
          </div>
        </div>

        {/* 4. Voice Persona Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isVietnamese ? '4. Diễn viên lồng tiếng' : '4. Select Voice'}
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {getDisplayVoiceList().map((v: any) => (
              <div
                key={v.code}
                onClick={() => setSelectedVoiceName(v.code)}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between ${
                  selectedVoiceName === v.code
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-500'
                    : isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-extrabold text-xs">{v.name} ({v.desc})</div>
                  <div className="text-[10px] text-slate-400">{v.tag}</div>
                </div>
                {selectedVoiceName === v.code && <Check className="w-4 h-4 text-cyan-500" />}
              </div>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button
          type="button"
          onClick={handleApply}
          className="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-sm shadow-md active:scale-95 transition-all"
        >
          {isVietnamese ? 'Lưu Cấu Hình Giọng Đọc' : 'Apply Voice Settings'}
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
