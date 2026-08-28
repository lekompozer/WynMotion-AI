'use client';

import React, { useState, useMemo } from 'react';
import { X, Sparkles, Wand2, Search, Zap, Film, Layers, Check, Play, Flame, RefreshCw } from 'lucide-react';
import MANIFEST from '../../../../packages/core-effects/manifest.json';
import { FULL_CORE_FILTERS, EFFECT_CATEGORIES } from '../../../../packages/core-effects/effectShaders';
import { FoxLivePreviewBox } from './FoxLivePreviewBox';

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
  const [selectedEffectCategory, setSelectedEffectCategory] = useState('all');

  const [previewItem, setPreviewItem] = useState<{
    type: 'transition' | 'effect';
    name: string;
    category?: string;
  }>({
    type: 'transition',
    name: currentShaderName || 'GlitchMemories',
    category: 'Glitch & Cyber',
  });

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
            <p className="text-[11px] text-slate-400">Kho hiệu ứng PixiJS Filters, Three.js & GL-Transitions</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2333]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. FOX LIVE PREVIEW BOX (CAPCUT-STYLE INTERACTIVE CANVAS)
          ───────────────────────────────────────────────────────────── */}
      <FoxLivePreviewBox
        currentType={previewItem.type}
        currentName={previewItem.name}
        currentCategory={previewItem.category}
        onApply={() => {
          if (previewItem.type === 'transition') {
            onApplyTransition(previewItem.name);
          } else {
            onApplyEffect?.(previewItem.name);
          }
        }}
      />

      {/* Switch Sub-Tabs: Transitions vs Effects */}
      <div className="flex bg-[#181B28] p-1 rounded-xl border border-[#252B3E]">
        <button
          onClick={() => {
            setActiveSubTab('transitions');
            setPreviewItem({
              type: 'transition',
              name: 'GlitchMemories',
              category: 'Glitch & Cyber',
            });
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
            setPreviewItem({
              type: 'effect',
              name: 'horizontal_scanline_rgb_glitch',
              category: 'PixiJS Glitch + CRT',
            });
          }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'effects'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Effects ({FULL_CORE_FILTERS.length} Pixi & ThreeJS)
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
              placeholder="Tìm kiếm 125 shader (Glitch, Zoom, Burn, Wipe, Swirl...)"
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
          <div className="grid grid-cols-2 gap-2 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {transitions.map((item) => {
              const isSelected = previewItem.name === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setPreviewItem({
                      type: 'transition',
                      name: item.id,
                      category: item.category,
                    });
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-purple-950/60 border-cyan-400 ring-2 ring-cyan-400/80 shadow-lg shadow-cyan-500/20'
                      : 'bg-[#141724] border-[#252B3E] hover:border-purple-500/50 hover:bg-[#1A1F30]'
                  }`}
                  title="Bấm để thử nghiệm trực tiếp trên con cáo"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 text-[9px] font-black flex items-center gap-0.5 shadow-xs">
                        🦊 Đang thử
                      </span>
                    )}
                  </div>

                  <div className="my-2">
                    <h4 className={`text-xs font-black transition-colors truncate ${isSelected ? 'text-cyan-300' : 'text-white group-hover:text-purple-300'}`}>
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400">Thời lượng: {item.default_duration}s</p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem({
                          type: 'transition',
                          name: item.id,
                          category: item.category,
                        });
                      }}
                      className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all border ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-[#181B28] text-slate-400 hover:text-white border-[#2A3045]'
                      }`}
                      title="Chạy hiệu ứng này trên con cáo"
                    >
                      🦊 Thử trên Cáo
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem({
                          type: 'transition',
                          name: item.id,
                          category: item.category,
                        });
                        onApplyTransition(item.id);
                      }}
                      className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white rounded-lg text-[10px] font-black transition-all shadow-sm active:scale-95"
                      title="Áp dụng chuyển cảnh này vào Timeline Video"
                    >
                      + Áp dụng
                    </button>
                  </div>
                </div>
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
              placeholder="Tìm kiếm 40+ hiệu ứng (Glitch, CRT, Godrays, Shockwave, Bloom...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141724] border border-[#252B3E] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Effect Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
            {EFFECT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedEffectCategory(cat.id)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all ${
                  selectedEffectCategory === cat.id
                    ? 'bg-pink-600 text-white'
                    : 'bg-[#181B28] text-slate-400 hover:text-white border border-[#252B3E]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* List of 40 Filters */}
          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredEffects.map((eff) => {
              const isSelected = previewItem.name === eff.id;
              return (
                <div
                  key={eff.id}
                  onClick={() => {
                    setPreviewItem({
                      type: 'effect',
                      name: eff.id,
                      category: eff.tag,
                    });
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-pink-950/60 border-cyan-400 ring-2 ring-cyan-400/80 shadow-lg shadow-cyan-500/20'
                      : 'bg-[#141724] border-[#252B3E] hover:border-pink-500/50 hover:bg-[#1A1F30]'
                  }`}
                  title="Bấm để thử nghiệm hiệu ứng trên con cáo"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${eff.gradient} flex items-center justify-center text-base shadow-md`}>
                        {eff.icon}
                      </div>
                      <div>
                        <h4 className={`text-xs font-black transition-colors ${isSelected ? 'text-cyan-300' : 'text-white group-hover:text-pink-300'}`}>
                          {eff.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400">{eff.tag}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 text-[9px] font-black flex items-center gap-0.5 shadow-xs">
                        🦊 Đang thử
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">{eff.desc}</p>

                  <div className="mt-2.5 flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem({
                          type: 'effect',
                          name: eff.id,
                          category: eff.tag,
                        });
                      }}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all border ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-[#181B28] text-slate-400 hover:text-white border-[#2A3045]'
                      }`}
                    >
                      🦊 Thử trên Cáo
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem({
                          type: 'effect',
                          name: eff.id,
                          category: eff.tag,
                        });
                        onApplyEffect && onApplyEffect(eff.id);
                      }}
                      className="px-3 py-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:brightness-110 text-white rounded-lg text-[11px] font-black transition-all shadow-sm active:scale-95"
                    >
                      + Áp dụng vào Video
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

