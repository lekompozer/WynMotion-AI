'use client';

import React, { useState, useMemo } from 'react';
import { X, Sparkles, Wand2, Search, Zap, Film, Layers, Check, Play, Flame, RefreshCw } from 'lucide-react';
import MANIFEST from '../../../../packages/core-effects/manifest.json';

export interface EffectsFlyoutTabProps {
  onClose: () => void;
  onApplyTransition: (shaderName: string) => void;
  onApplyEffect?: (effectId: string) => void;
  selectedSceneIndex?: number;
  currentShaderName?: string;
}

export const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'glitch', name: 'Glitch & Cyber' },
  { id: 'motion_blur', name: 'Zoom & Motion Blur' },
  { id: 'light_cinematic', name: 'Light & Cinematic' },
  { id: 'wipe_slice', name: 'Wipe & Slices' },
  { id: '3d_morph', name: '3D & Morphing' },
  { id: 'creative', name: 'Sáng tạo' },
];

export const CORE_FILTERS = [
  {
    id: 'scanline_rgb_glitch',
    name: 'Scanline RGB Glitch',
    tag: 'Cyberpunk / Y2K',
    desc: 'Vạch quét màn hình CRT retro và hiệu ứng quang sai màu RGB 3D.',
    icon: '⚡',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'strobe_flash',
    name: 'Strobe Flash Beat',
    tag: 'EDM / High-Energy',
    desc: 'Chớp nháy tương phản Trắng/Đen nghịch màu đập dồn theo nhịp bass.',
    icon: '✨',
    gradient: 'from-yellow-400 to-amber-600',
  },
  {
    id: 'specular_sheen',
    name: 'Specular Light Sheen',
    tag: 'Luxury / Commercial',
    desc: 'Vệt sáng kim loại quét mượt mà qua bề mặt sản phẩm phong cách Apple.',
    icon: '🌟',
    gradient: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'silhouette_burst',
    name: 'Flash Blast Silhouette Burst',
    tag: 'Big Reveal / Outro',
    desc: 'Cú nổ bùng sáng chói lòa chuyển hóa vật thể thành khối màu sắc nét 100%.',
    icon: '💥',
    gradient: 'from-purple-500 to-indigo-600',
  },
];

export const EffectsFlyoutTab: React.FC<EffectsFlyoutTabProps> = ({
  onClose,
  onApplyTransition,
  onApplyEffect,
  selectedSceneIndex = 0,
  currentShaderName,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'transitions' | 'effects'>('transitions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#252B3E]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-600 text-white font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">FX & Transitions (100+ GLSL)</h3>
            <p className="text-[11px] text-slate-400">Kho thư viện chuyển cảnh & hiệu ứng chuẩn thế giới</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2333]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Switch Sub-Tabs: Transitions vs Effects */}
      <div className="flex bg-[#181B28] p-1 rounded-xl border border-[#252B3E]">
        <button
          onClick={() => setActiveSubTab('transitions')}
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
          onClick={() => setActiveSubTab('effects')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'effects'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Effects & Filters ({CORE_FILTERS.length})
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
              placeholder="Tìm kiếm shader (Glitch, Zoom, Burn, Wipe, Swirl...)"
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
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid of 125 Shaders */}
          <div className="grid grid-cols-2 gap-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {transitions.map((item) => {
              const isSelected = currentShaderName === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onApplyTransition(item.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/20'
                      : 'bg-[#141724] border-[#252B3E] hover:border-purple-500/50 hover:bg-[#1A1F30]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                      {item.category}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </div>

                  <div className="my-2">
                    <h4 className="text-xs font-black text-white group-hover:text-purple-300 transition-colors truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-500">Duration: {item.default_duration}s</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyTransition(item.id);
                    }}
                    className={`w-full py-1 text-[11px] font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#202538] text-slate-300 group-hover:bg-purple-600 group-hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Đang chọn' : 'Áp dụng'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 2: EFFECTS & FILTERS
          ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'effects' && (
        <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          {CORE_FILTERS.map((eff) => (
            <div
              key={eff.id}
              onClick={() => onApplyEffect && onApplyEffect(eff.id)}
              className="p-3 rounded-xl bg-[#141724] border border-[#252B3E] hover:border-pink-500/50 hover:bg-[#1A1F30] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${eff.gradient} flex items-center justify-center text-base shadow-md`}>
                  {eff.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white group-hover:text-pink-300 transition-colors">
                    {eff.name}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500">{eff.tag}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{eff.desc}</p>
              <div className="mt-2 flex justify-end">
                <button className="px-3 py-1 bg-[#202538] group-hover:bg-pink-600 text-slate-300 group-hover:text-white rounded-lg text-[11px] font-bold transition-all">
                  Áp dụng hiệu ứng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
