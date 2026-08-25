'use client';

import React, { useState } from 'react';
import { Search, X, Sparkles, Scissors, Play, Flame, Film, ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export interface CapCutGalleryItem {
  id: 'ads_strobe_teaser' | 'ads_cinematic_showcase' | 'product_ads_motion';
  title: string;
  category: string;
  duration: string;
  usageCount: string;
  author: string;
  authorAvatar: string;
  coverUrl: string;
  badge?: string;
}

export const CAPCUT_GALLERY_TEMPLATES: CapCutGalleryItem[] = [
  {
    id: 'ads_strobe_teaser',
    title: 'Strobe Teaser & Big Reveal',
    category: 'Trending',
    duration: '11.7s',
    usageCount: '76,9K',
    author: 'Meno Me',
    authorAvatar: '⚡',
    coverUrl: '/templates/cover-strobe-teaser.png',
    badge: 'Standard',
  },
  {
    id: 'ads_cinematic_showcase',
    title: 'Cinematic Menu Showcase 22s',
    category: 'F&B',
    duration: '22.0s',
    usageCount: '41,2K',
    author: 'WynMotion AI',
    authorAvatar: '🍜',
    coverUrl: '/templates/cover-cinematic-showcase.png',
    badge: 'Pro 60fps',
  },
  {
    id: 'product_ads_motion',
    title: 'Product Commercial Billboard (Style 7)',
    category: 'Sản phẩm',
    duration: '15.0s',
    usageCount: '6,5K',
    author: 'Ay',
    authorAvatar: '✨',
    coverUrl: '/templates/cover-poster-image.png',
    badge: 'SAM 2 Cutout',
  },
];

export const CAPCUT_CATEGORIES = [
  'Dành cho bạn',
  'Quảng cáo',
  'Sản phẩm',
  'Ẩm thực F&B',
  'Trending',
  'Thời trang',
];

interface CapCutGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: 'ads_strobe_teaser' | 'ads_cinematic_showcase' | 'product_ads_motion') => void;
}

export const CapCutGalleryModal: React.FC<CapCutGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const { isDark, isVietnamese, t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('Dành cho bạn');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredTemplates = CAPCUT_GALLERY_TEMPLATES.filter((tpl) => {
    if (searchQuery.trim()) {
      return (
        tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory === 'Dành cho bạn') return true;
    if (selectedCategory === 'Quảng cáo' || selectedCategory === 'Sản phẩm') {
      return tpl.category === 'Sản phẩm' || tpl.category === 'Trending';
    }
    if (selectedCategory === 'Ẩm thực F&B') return tpl.category === 'F&B';
    return true;
  });

  // Split into 2 columns for staggered Masonry layout
  const col1 = filteredTemplates.filter((_, idx) => idx % 2 === 0);
  const col2 = filteredTemplates.filter((_, idx) => idx % 2 === 1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#090A10] text-white animate-in fade-in duration-200">
      {/* ── TOP APP BAR (Safe area for iPhone Notch / Tai thỏ) ── */}
      <div className="pt-12 sm:pt-4 px-4 pb-3 border-b border-slate-800/80 bg-[#090A10]/95 backdrop-blur-md flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 min-w-[42px] min-h-[42px] flex items-center justify-center cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Tìm kiếm mẫu CapCut...', 'Search CapCut templates...')}
            className="w-full pl-9 pr-8 py-2.5 text-xs rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── CATEGORY PILLS HORIZONTAL SCROLL ── */}
      <div className="px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-slate-800/40 bg-[#090A10]">
        {CAPCUT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800/60 hover:text-white'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── 2-COLUMN STAGGERED MASONRY GRID (Cột 2 thấp xuống 32px so le) ── */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 pb-24">
        <div className="grid grid-cols-2 gap-3.5 items-start max-w-lg mx-auto">
          {/* Column 1 */}
          <div className="space-y-4">
            {col1.map((item) => renderTemplateCard(item, onSelectTemplate))}
          </div>

          {/* Column 2 (Thấp xuống so le) */}
          <div className="space-y-4 pt-8">
            {col2.map((item) => renderTemplateCard(item, onSelectTemplate))}
          </div>
        </div>
      </div>
    </div>
  );
};

function renderTemplateCard(
  item: CapCutGalleryItem,
  onSelect: (id: CapCutGalleryItem['id']) => void
) {
  return (
    <div
      key={item.id}
      onClick={() => onSelect(item.id)}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800 hover:border-rose-500/60 transition-all active:scale-[0.98] shadow-lg flex flex-col"
    >
      {/* Cover Image Container — Chuẩn kích thước bằng nhau aspect-[9/14] tự crop */}
      <div className="relative w-full aspect-[9/14] overflow-hidden bg-slate-950">
        <img
          src={item.coverUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />

        {/* Top badge */}
        {item.badge && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-extrabold text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <span>💎</span>
            <span>{item.badge}</span>
          </div>
        )}

        {/* Bottom-left Usage count (e.g. ✂️ 76,9K) */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white shadow-sm">
          <Scissors className="w-3 h-3 text-slate-300 rotate-90" />
          <span>{item.usageCount}</span>
        </div>

        {/* Bottom-right duration */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-bold text-slate-300">
          {item.duration}
        </div>
      </div>

      {/* Info Body */}
      <div className="p-2.5 space-y-1.5">
        <h4 className="text-xs font-black text-white line-clamp-2 leading-snug group-hover:text-rose-400 transition-colors">
          {item.title}
        </h4>

        {/* Author */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px]">
            {item.authorAvatar}
          </div>
          <span className="truncate">{item.author}</span>
        </div>
      </div>
    </div>
  );
}
