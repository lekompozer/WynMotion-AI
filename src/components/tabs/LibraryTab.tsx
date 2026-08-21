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
  const { isVietnamese, isDark, t } = useApp();
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [projects, setProjects] = useState<MotionProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load local cached projects first
    try {
      const cached = localStorage.getItem('wynmotion_cached_projects');
      if (cached) {
        setProjects(JSON.parse(cached));
      }
    } catch {}

    wynmotionService
      .listProjects()
      .then((res) => {
        if (res.projects && res.projects.length > 0) {
          setProjects(res.projects);
          try {
            localStorage.setItem('wynmotion_cached_projects', JSON.stringify(res.projects));
          } catch {}
        }
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
    <div className={`w-full max-w-xl mx-auto p-4 sm:p-6 space-y-5 transition-colors duration-200 ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Header & Filter Pills */}
      <div className={`rounded-3xl p-5 border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-500">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Cloud Library</h2>
              <p className="text-xs text-slate-400 font-medium">
                {t('Kho lưu trữ video, giọng đọc & hình ảnh AI', 'Saved Videos, Audio & Art')}
              </p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}>
            {filteredItems.length} {t('tài nguyên', 'assets')}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'all' as const, label: t('Tất Cả', 'All') },
            { id: 'video' as const, label: t('Video', 'Video') },
            { id: 'audio' as const, label: t('Audio', 'Audio') },
            { id: 'image' as const, label: t('Ảnh', 'Image') },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`py-2 rounded-xl text-xs font-black transition-all border ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 border-transparent shadow-sm'
                  : isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Saved Assets */}
      <div className="grid grid-cols-2 gap-3.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-3xl border overflow-hidden transition-all group flex flex-col justify-between ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:border-cyan-500/60'
                : 'bg-white border-slate-200 shadow-sm hover:border-cyan-500'
            }`}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-slate-950 overflow-hidden">
              <img
                src={item.thumb}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white uppercase">
                {item.type}
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800/60 text-[10px] font-extrabold text-cyan-300">
                {item.duration}
              </div>
            </div>

            {/* Meta */}
            <div className="p-3.5 space-y-2">
              <div>
                <h3 className={`text-xs font-black truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {item.title}
                </h3>
                <p className="text-[10px] text-cyan-500 font-semibold truncate mt-0.5">{item.style}</p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.created_at}
                </span>
                <button
                  type="button"
                  onClick={() => alert(isVietnamese ? 'Tải xuống tệp' : 'Download file')}
                  className="p-1 rounded-md hover:bg-cyan-500/20 text-cyan-500"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
