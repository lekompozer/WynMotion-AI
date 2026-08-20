'use client';

import React, { useState } from 'react';
import { ImageIcon, Sparkles, Download, Layers } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const AiImagesTab: React.FC = () => {
  const { isVietnamese, t } = useApp();
  const [prompt, setPrompt] = useState(isVietnamese ? 'Chú cáo trắng mặc áo hoodie hồng vẽ tranh nghệ thuật' : 'Cute white fox in pink hoodie painting artwork');

  const STYLES = [
    { id: 'whiteboard', name: 'Whiteboard Sketch 🖋️' },
    { id: 'watercolor', name: 'Watercolor Pastel 🎨' },
    { id: '3d_render', name: '3D Glossy Render 🧸' },
    { id: 'cyberpunk', name: 'Apple Glassmorphism 🍏' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">AI Images Studio</h2>
            <p className="text-[11px] text-slate-500">{t('Tạo hình ảnh & minh họa hoạt họa AI', 'AI Art & Concept Generator')}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t('Mô tả hình ảnh', 'Image Prompt')}</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:border-pink-400 text-left transition-all"
            >
              {s.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>{t('✨ Tạo Ảnh Nghệ Thuật (1 Điểm)', '✨ Generate AI Art (1 Pt)')}</span>
        </button>
      </div>
    </div>
  );
};
