'use client';

import React, { useState } from 'react';
import { Mic, Sparkles, Play, Pause, Globe, Volume2, Check, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const AiAudioTab: React.FC = () => {
  const { isVietnamese, t } = useApp();
  const [text, setText] = useState(isVietnamese ? 'Chào mừng bạn đến với phòng thu giọng đọc AI WynMotion Studio!' : 'Welcome to WynMotion AI Audio Studio!');
  const [selectedVoice, setSelectedVoice] = useState('Phạm Tuyên');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const VIETNAMESE_VOICES = [
    { code: 'Phạm Tuyên', name: 'Phạm Tuyên (♂️ Nam Bắc · Tự nhiên)' },
    { code: 'Trúc Ly', name: 'Trúc Ly (♀️ Nữ Bắc · Tự nhiên)' },
    { code: 'Quang Sơn', name: 'Quang Sơn (♂️ Nam Trung · Tự nhiên)' },
    { code: 'Ngọc Trân', name: 'Ngọc Trân (♀️ Nữ Trung · Tự nhiên)' },
    { code: 'Xuân Vĩnh', name: 'Xuân Vĩnh (♂️ Nam Nam · Tự nhiên)' },
    { code: 'Thục Đoan', name: 'Thục Đoan (♀️ Nữ Nam · Kể chuyện)' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">WynVoice Studio 48kHz</h2>
            <p className="text-[11px] text-slate-500">{t('Giọng đọc AI chân thực 14 vùng miền', 'Studio HD AI Voiceover')}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t('Nội dung cần chuyển thành giọng đọc', 'Voiceover Script')}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t('Chọn giọng đọc mẫu', 'Preset Voice')}</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold focus:border-purple-500 outline-none"
          >
            {VIETNAMESE_VOICES.map((v) => (
              <option key={v.code} value={v.code}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!text.trim() || isGenerating}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>{t('✨ Tạo Giọng Đọc 48kHz (1 Điểm)', '✨ Generate 48kHz Voice (1 Pt)')}</span>
        </button>
      </div>
    </div>
  );
};
