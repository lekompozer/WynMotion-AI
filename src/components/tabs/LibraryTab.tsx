'use client';

import React from 'react';
import { FolderOpen, Film, Mic, Download, Share2, Play } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const LibraryTab: React.FC = () => {
  const { isVietnamese, t } = useApp();

  const SAMPLE_ITEMS = [
    {
      id: '1',
      title: 'Chu trình quang hợp của cây xanh',
      type: 'video',
      duration: '32s',
      thumb: '/assets/motion-styles/whiteboard_stream.jpg',
      style: 'Whiteboard Stream',
    },
    {
      id: '2',
      title: 'Hành trình chú robot nhỏ',
      type: 'video',
      duration: '45s',
      thumb: '/assets/motion-styles/character_motion.jpg',
      style: 'Mascot Character',
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Cloud Library</h2>
              <p className="text-[11px] text-slate-500">{t('Kho dự án & tài nguyên đã tạo', 'Saved Projects & Audio')}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {SAMPLE_ITEMS.length} {t('mục', 'items')}
          </span>
        </div>

        <div className="space-y-3">
          {SAMPLE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  <img src={item.thumb} alt={item.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/70 text-white text-[8px] font-bold rounded">
                    {item.duration}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 line-clamp-1">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.style}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#FF2D55] shadow-xs active:scale-95 transition-all"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 shadow-xs active:scale-95 transition-all"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
