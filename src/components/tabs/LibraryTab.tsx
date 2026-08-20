'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Film,
  Mic,
  Image as ImageIcon,
  Download,
  Share2,
  Play,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { wynmotionService, MotionProject } from '@/services/wynmotionService';

type LibraryFilter = 'all' | 'video' | 'audio' | 'image';

export const LibraryTab: React.FC = () => {
  const { isVietnamese, t } = useApp();
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [projects, setProjects] = useState<MotionProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    wynmotionService
      .listProjects()
      .then((res) => {
        if (res.projects) setProjects(res.projects);
      })
      .catch(() => {});
  }, []);

  const SAMPLE_ITEMS = [
    {
      id: '1',
      title: isVietnamese ? 'Chu trình quang hợp của cây xanh' : 'Photosynthesis Cycle in Nature',
      type: 'video',
      duration: '32s',
      thumb: '/assets/motion-styles/whiteboard_stream.jpg',
      style: 'Whiteboard Stream',
      created_at: 'Hôm nay',
    },
    {
      id: '2',
      title: isVietnamese ? 'Hành trình chú robot nhỏ AI' : 'Journey of Little AI Robot',
      type: 'video',
      duration: '45s',
      thumb: '/assets/motion-styles/character_motion.jpg',
      style: 'Mascot Character',
      created_at: 'Hôm qua',
    },
    {
      id: '3',
      title: isVietnamese ? 'Bản tin công nghệ AI 2026' : 'AI Tech News 2026',
      type: 'audio',
      duration: '18s',
      thumb: '/assets/motion-styles/apple_motion.jpg',
      style: 'WynVoice 48kHz (Phạm Tuyên)',
      created_at: '2 ngày trước',
    },
    {
      id: '4',
      title: isVietnamese ? 'Mascot Cáo WynMotion 3D' : 'WynMotion Fox Mascot 3D',
      type: 'image',
      duration: '8K HD',
      thumb: '/assets/mascot-logo.jpg',
      style: 'Stylized 3D Pixar',
      created_at: '3 ngày trước',
    },
  ];

  const filteredItems = SAMPLE_ITEMS.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Header & Filter Pills */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 text-[#FF2D55]">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Cloud Library</h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {t('Kho lưu trữ video, giọng đọc & hình ảnh AI', 'Saved Videos, Audio & Art')}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {filteredItems.length} {t('tài nguyên', 'assets')}
          </span>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: t('Tất Cả', 'All Assets'), icon: Sparkles },
            { id: 'video', label: t('🎬 Video', '🎬 Videos'), icon: Film },
            { id: 'audio', label: t('🎙️ Giọng Đọc', '🎙️ Audio'), icon: Mic },
            { id: 'image', label: t('🖼️ Hình Ảnh', '🖼️ Images'), icon: ImageIcon },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                filter === f.id
                  ? 'bg-[#FF2D55] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Assets List */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center justify-between gap-3 hover:border-rose-300 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-16 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img
                  src={item.thumb}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/70 text-white text-[8px] font-extrabold rounded">
                  {item.duration}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black text-slate-900 truncate leading-snug">
                  {item.title}
                </h3>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.style}</p>
                <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-1">
                  <Clock className="h-2.5 w-2.5" />
                  <span>{item.created_at}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <a
                href={item.thumb}
                download
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors shadow-2xs"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
