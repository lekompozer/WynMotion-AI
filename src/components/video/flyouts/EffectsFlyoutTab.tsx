'use client';

import React, { useState, useMemo } from 'react';
import { X, Sparkles, Search, Zap, RefreshCw } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import MANIFEST from '../../../../packages/core-effects/manifest.json';
import { FULL_CORE_FILTERS, EFFECT_CATEGORIES } from '../../../../packages/core-effects/effectShaders';
import { EffectCardThumbnail } from './EffectCardThumbnail';

export interface EffectsFlyoutTabProps {
  onClose: () => void;
  onApplyTransition: (shaderName: string) => void;
  onApplyEffect?: (effectId: string) => void;
  selectedSceneIndex?: number;
  currentShaderName?: string;
}

export const CATEGORIES = [
  { id: 'all', nameVi: 'Tất cả', nameEn: 'All' },
  { id: 'glitch', nameVi: 'Glitch & Cyber', nameEn: 'Glitch & Cyber' },
  { id: 'motion_blur', nameVi: 'Zoom & Chuyển động', nameEn: 'Zoom & Motion Blur' },
  { id: 'light_cinematic', nameVi: 'Ánh sáng & Điện ảnh', nameEn: 'Light & Cinematic' },
  { id: 'wipe_slice', nameVi: 'Cắt quét & Slices', nameEn: 'Wipe & Slices' },
  { id: '3d_morph', nameVi: '3D & Biến hình', nameEn: '3D & Morphing' },
  { id: 'creative', nameVi: 'Sáng tạo', nameEn: 'Creative' },
];

export const EffectsFlyoutTab: React.FC<EffectsFlyoutTabProps> = ({
  onClose,
  onApplyTransition,
  onApplyEffect,
  selectedSceneIndex = 0,
  currentShaderName,
}) => {
  const { t, isVietnamese } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'transitions' | 'effects'>('transitions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEffectCategory, setSelectedEffectCategory] = useState('all');

  const [selectedItem, setSelectedItem] = useState<string>(currentShaderName || 'GlitchMemories');

  const transitions = useMemo(() => {
    const list = MANIFEST.transitions || [];
    return list.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  const filteredEffects = useMemo(() => {
    return FULL_CORE_FILTERS.filter((item) => {
      const matchCat = selectedEffectCategory === 'all' || item.category === selectedEffectCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedEffectCategory]);

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#252B3E]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-600 text-white font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">FX & Transitions (125 GLSL + 40 Filters)</h3>
            <p className="text-[11px] text-slate-400">
              {t('Kho hiệu ứng chuyển cảnh và bộ lọc video', 'Transition effects & video filters library')}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2333]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Switch Sub-Tabs: Transitions vs Effects */}
      <div className="flex bg-[#181B28] p-1 rounded-xl border border-[#252B3E]">
        <button
          onClick={() => {
            setActiveSubTab('transitions');
            setSelectedItem('GlitchMemories');
          }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'transitions'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Transitions ({MANIFEST.total_shaders || 125})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('effects');
            setSelectedItem('horizontal_scanline_rgb_glitch');
          }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'effects'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          {t('Hiệu ứng', 'Effects')} ({FULL_CORE_FILTERS.length || 40})
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 1: TRANSITIONS (125 GLSL SHADERS)
          ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'transitions' && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={t(
                'Tìm kiếm 125 shader (Glitch, Zoom, Burn, Wipe, Swirl...)',
                'Search 125 shaders (Glitch, Zoom, Burn, Wipe, Swirl...)'
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141724] border border-[#252B3E] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#181B28] text-slate-400 hover:text-white border border-[#252B3E]'
                }`}
              >
                {isVietnamese ? cat.nameVi : cat.nameEn}
              </button>
            ))}
          </div>

          {/* Grid of 125 Shaders with Animated Thumbnails */}
          <div className="grid grid-cols-2 gap-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {transitions.map((item) => {
              const isSelected = selectedItem === item.id;
              return (
                <EffectCardThumbnail
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  category={item.category}
                  type="transition"
                  duration={item.default_duration}
                  isSelected={isSelected}
                  onPreview={() => {
                    setSelectedItem(item.id);
                  }}
                  onApply={() => {
                    setSelectedItem(item.id);
                    onApplyTransition(item.id);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 2: EFFECTS & FILTERS (FULL 40+ PIXI & THREEJS FILTERS)
          ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'effects' && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={t(
                'Tìm kiếm 40+ hiệu ứng (Glitch, CRT, Godrays, Shockwave, Bloom...)',
                'Search 40+ effects (Glitch, CRT, Godrays, Shockwave, Bloom...)'
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141724] border border-[#252B3E] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Effect Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
            {EFFECT_CATEGORIES.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setSelectedEffectCategory(cat.id)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all ${
                  selectedEffectCategory === cat.id
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-[#181B28] text-slate-400 hover:text-white border border-[#252B3E]'
                }`}
              >
                {(isVietnamese ? cat.nameVi : cat.nameEn) || cat.name}
              </button>
            ))}
          </div>

          {/* Grid of 40 Filters with Animated Thumbnails */}
          <div className="grid grid-cols-2 gap-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredEffects.map((eff) => {
              const isSelected = selectedItem === eff.id;
              return (
                <EffectCardThumbnail
                  key={eff.id}
                  id={eff.id}
                  name={eff.name}
                  category={eff.tag}
                  type="effect"
                  icon={eff.icon}
                  gradient={eff.gradient}
                  duration={1.5}
                  isSelected={isSelected}
                  onPreview={() => {
                    setSelectedItem(eff.id);
                  }}
                  onApply={() => {
                    setSelectedItem(eff.id);
                    onApplyEffect && onApplyEffect(eff.id);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

