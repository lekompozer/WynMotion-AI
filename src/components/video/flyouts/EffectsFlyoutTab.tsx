'use client';

import React, { useState, useMemo } from 'react';
import { X, Sparkles, Wand2, Search, Zap, Film, Layers, Check, Play, Flame, RefreshCw } from 'lucide-react';
import MANIFEST from '../../../../packages/core-effects/manifest.json';
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

export const CORE_FILTERS = [
  {
    id: 'horizontal_scanline_rgb_glitch',
    name: 'Scanline RGB Slicing Glitch',
    tag: 'Cyberpunk / Y2K',
    desc: 'Cắt lát ngang đa tầng và lệch kênh màu Red/Cyan 3D với vạch quét CRT (Ảnh 3).',
    icon: '⚡',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'strobe_flash_beat',
    name: 'Strobe Flash Beat',
    tag: 'EDM / High-Energy',
    desc: 'Chớp nháy tương phản Trắng/Đen nghịch màu đập dồn theo nhịp bass.',
    icon: '✨',
    gradient: 'from-yellow-400 to-amber-600',
  },
  {
    id: 'specular_metallic_sheen',
    name: 'Specular Light Sheen',
    tag: 'Luxury / Commercial',
    desc: 'Vệt sáng kim loại quét mượt mà qua bề mặt sản phẩm phong cách Apple.',
    icon: '🌟',
    gradient: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'flash_blast_silhouette',
    name: 'Flash Blast Silhouette Burst',
    tag: 'Big Reveal / Outro',
    desc: 'Cú nổ bùng sáng chói lòa chuyển hóa vật thể thành khối màu sắc nét 100%.',
    icon: '💥',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'vhs_retro_tape_noise',
    name: 'VHS Retro Tape Static',
    tag: 'Vintage / Y2K',
    desc: 'Nhiễu hạt băng từ VHS cổ điển, vạch tuyết chạy dọc và quang sai màu.',
    icon: '📼',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'pixel_mosaic_shatter',
    name: 'Pixel Mosaic Shatter',
    tag: 'Cyber / Glitch',
    desc: 'Phân rã vật thể thành các khối pixel vuông rồi tái tạo sắc nét.',
    icon: '🧱',
    gradient: 'from-violet-500 to-fuchsia-600',
  },
  {
    id: 'golden_bokeh_particles',
    name: 'Golden Bokeh Particles',
    tag: 'Luxury / Elegant',
    desc: 'Bụi vàng phát sáng lơ lửng bồng bềnh tạo cảm giác sang trọng đẳng cấp.',
    icon: '✨',
    gradient: 'from-amber-400 to-yellow-600',
  },
  {
    id: 'prism_rainbow_flare',
    name: 'Prism Optical Flare',
    tag: 'Cinematic Light',
    desc: 'Vệt lóa cầu vồng quang học góc ống kính máy quay điện ảnh.',
    icon: '🌈',
    gradient: 'from-blue-500 to-purple-600',
  },
  {
    id: 'perspective_3d_float',
    name: '3D Perspective Tilt & Float',
    tag: 'Motion / 3D Space',
    desc: 'Nghiêng góc 3D lơ lửng bồng bềnh tự nhiên kết hợp bóng đổ mặt sàn.',
    icon: '📦',
    gradient: 'from-indigo-500 to-sky-600',
  },
  {
    id: 'kenburns_continuous_zoom',
    name: 'Ken-Burns Cinematic Slow Zoom',
    tag: 'Cinematic Camera',
    desc: 'Góc máy zoom chậm mượt mà mang phong cách phim truyện Hollywood.',
    icon: '🔍',
    gradient: 'from-sky-500 to-cyan-600',
  },
  {
    id: 'grayscale_underlayer_push',
    name: 'Grayscale Underlayer Push',
    tag: 'F&B / Product Showcase',
    desc: 'Đè nổi bật vật thể mới lên nền cũ đã mờ xám tương phản tuyệt đối.',
    icon: '🖤',
    gradient: 'from-slate-600 to-zinc-800',
  },
  {
    id: 'neon_cyber_glow',
    name: 'Neon Cyberpunk Outline Glow',
    tag: 'Glow / Cyber',
    desc: 'Đèn viền Neon phát sáng nhấp nháy chuyển màu theo nhịp điệu bài hát.',
    icon: '💡',
    gradient: 'from-cyan-400 to-fuchsia-600',
  },
  {
    id: 'liquid_wave_distortion',
    name: 'Liquid Ripple Wave Distortion',
    tag: 'Organic / Water',
    desc: 'Sóng nước gợn sóng biến dạng bề mặt sản phẩm độc đáo.',
    icon: '🌊',
    gradient: 'from-blue-600 to-teal-500',
  },
  {
    id: 'thermal_heatmap_matrix',
    name: 'Thermal Matrix Heatmap',
    tag: 'Sci-Fi / Matrix',
    desc: 'Bản đồ nhiệt quang phổ rực lửa quét qua góc quay.',
    icon: '🔥',
    gradient: 'from-red-600 to-amber-500',
  },
  {
    id: 'halftone_pop_art',
    name: 'Retro Halftone Pop-Art Grid',
    tag: 'Comic / Poster',
    desc: 'Chấm hạt in lưới truyện tranh phong cách Retro Pop-Art nổi bật.',
    icon: '🎨',
    gradient: 'from-pink-600 to-yellow-500',
  },
  {
    id: 'film_grain_vintage',
    name: '35mm Film Grain Cinema Overlay',
    tag: 'Vintage / Film',
    desc: 'Hạt phim nhựa 35mm hoài cổ Hollywood tăng chất lượng điện ảnh.',
    icon: '🎬',
    gradient: 'from-amber-600 to-stone-700',
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

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#252B3E]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-600 text-white font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">FX & Transitions (125 GLSL)</h3>
            <p className="text-[11px] text-slate-400">Kho thư viện chuyển cảnh & hiệu ứng chuẩn CapCut</p>
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
              category: 'Cyberpunk / Y2K',
            });
          }}
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
          <div className="grid grid-cols-2 gap-2 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {transitions.map((item) => {
              const isSelected = previewItem.name === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() =>
                    setPreviewItem({
                      type: 'transition',
                      name: item.id,
                      category: item.category,
                    })
                  }
                  onClick={() => {
                    setPreviewItem({
                      type: 'transition',
                      name: item.id,
                      category: item.category,
                    });
                    onApplyTransition(item.id);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-purple-950/50 border-purple-400 ring-1 ring-purple-400 shadow-lg shadow-purple-500/20'
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
                      setPreviewItem({
                        type: 'transition',
                        name: item.id,
                        category: item.category,
                      });
                      onApplyTransition(item.id);
                    }}
                    className={`w-full py-1 text-[11px] font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-[#202538] text-slate-300 group-hover:bg-purple-600 group-hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Đang xem & Chọn' : 'Xem & Áp dụng'}
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
        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          {CORE_FILTERS.map((eff) => {
            const isSelected = previewItem.name === eff.id;
            return (
              <div
                key={eff.id}
                onMouseEnter={() =>
                  setPreviewItem({
                    type: 'effect',
                    name: eff.id,
                    category: eff.tag,
                  })
                }
                onClick={() => {
                  setPreviewItem({
                    type: 'effect',
                    name: eff.id,
                    category: eff.tag,
                  });
                  onApplyEffect && onApplyEffect(eff.id);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-pink-950/40 border-pink-500 ring-1 ring-pink-400 shadow-lg shadow-pink-500/20'
                    : 'bg-[#141724] border-[#252B3E] hover:border-pink-500/50 hover:bg-[#1A1F30]'
                }`}
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
            );
          })}
        </div>
      )}
    </div>
  );
};
