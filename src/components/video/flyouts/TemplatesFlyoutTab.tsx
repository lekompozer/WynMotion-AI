'use client';

import React, { useState } from 'react';
import { X, Sparkles, Wand2, Layers, Flame } from 'lucide-react';

export interface TemplatesFlyoutTabProps {
  onClose: () => void;
  onApplyTemplate: (templateId: string) => void;
  currentTemplateId?: string;
  isVertical?: boolean;
}

export const CAPCUT_TEMPLATES = [
  {
    id: 'universal_product_video',
    title: 'Universal Images Product Video',
    tag: 'Đa Ngành Hàng / Billboard',
    duration: '10s – 60s',
    photos: '1-10 Ảnh',
    desc: 'Đạo diễn AI Gemini 3.8 tự do điều phối 125 Transitions GLSL & 40 Hiệu ứng thị giác theo nhịp beat.',
    popular: true,
    points: '15 – 40 Điểm',
  },
  {
    id: 'animation_ads_image_veo',
    title: 'Animation Ads Image (VEO 3.1)',
    tag: '👑 VIP Google VEO 3.1',
    duration: '6s, 9s, 12s',
    photos: '1 Ảnh Ads Poster',
    desc: 'Biến 1 ảnh poster tĩnh thành video chuyển động điện ảnh Hollywood bằng mô hình Google VEO 3.1 Vertex AI.',
    popular: true,
    vip: true,
    points: '45 – 60 Điểm',
  },
  {
    id: 'ads_strobe_teaser',
    title: 'Strobe Teaser & Big Reveal',
    tag: 'Trending / Flash Sale',
    duration: '10s – 18s',
    photos: '1-3 Ảnh',
    desc: 'Intro chữ chớp giật Strobe giật gân, flash sáng bùng nổ, quét laser và lộ diện sản phẩm hoàn chỉnh.',
    popular: false,
    points: '20 Điểm',
  },
  {
    id: 'ads_cinematic_showcase',
    title: 'Cinematic Menu Showcase 22s',
    tag: 'F&B / Spa / Menu Luxury',
    duration: '22.0s',
    photos: '4-8 Ảnh',
    desc: 'Lướt menu/danh mục êm ái, cuộn giấy bung nở 3D, thu nhỏ 3 card đa màu và đóng sách nghệ thuật.',
    popular: false,
    points: '20 Điểm',
  },
];

export const VIDEO_OVERLAYS = [
  { id: 'smoke_steam', name: 'Khói & Hơi Nước', icon: '💨', tag: 'Ẩm thực / Trà sữa', desc: 'Hơi nước bốc lên tự nhiên quanh món ăn' },
  { id: 'lens_flare', name: 'Lóa Sáng Lens Flare', icon: '✨', tag: 'Điện ảnh / Intro', desc: 'Ánh sáng tím neon lóe sáng tại tâm' },
  { id: 'film_burn', name: 'Cháy Phim & Xước Cũ', icon: '🎞️', tag: 'Vintage / Y2K', desc: 'Vết xước retro và ánh sáng rò rỉ (light leak)' },
  { id: 'sparks_gold', name: 'Bụi Vàng Lấp Lánh', icon: '🌟', tag: 'Luxury / Mỹ phẩm', desc: 'Hạt bụi vàng lơ lửng sang trọng' },
  { id: 'brush_stroke', name: 'Vệt Cọ Sơn Xước', icon: '🖌️', tag: 'Nghệ thuật', desc: 'Vệt cọ quét mở ra toàn cảnh' },
];

export const TemplatesFlyoutTab: React.FC<TemplatesFlyoutTabProps> = ({
  onClose,
  onApplyTemplate,
  currentTemplateId,
  isVertical = true,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'templates' | 'overlays'>('templates');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#252B3E]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 font-bold">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Templates & Visual Effects</h3>
            <p className="text-[11px] text-slate-400">Kho mẫu CapCut & Overlays điện ảnh</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2333]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex bg-[#181B28] p-1 rounded-xl border border-[#252B3E]">
        <button
          onClick={() => setActiveSubTab('templates')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'templates'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Mẫu CapCut ({CAPCUT_TEMPLATES.length})
        </button>
        <button
          onClick={() => setActiveSubTab('overlays')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'overlays'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Overlays Shaders ({VIDEO_OVERLAYS.length})
        </button>
      </div>

      {activeSubTab === 'templates' && (
        <div className="space-y-3">
          {CAPCUT_TEMPLATES.map((tpl) => {
            const isSelected = currentTemplateId === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => onApplyTemplate(tpl.id)}
                className={`group relative p-3 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-cyan-400 bg-[#1E2333] shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                    : 'border-[#252B3E] bg-[#161824] hover:border-slate-500 hover:bg-[#1C2030]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#232A3E] text-cyan-300">
                        {tpl.tag}
                      </span>
                      {tpl.popular && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-red-500 text-white flex items-center gap-1">
                          <Flame className="w-3 h-3" /> HOT
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1.5 group-hover:text-cyan-300 transition-colors">
                      {tpl.title}
                    </h4>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {tpl.desc}
                </p>

                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[#232A3E] text-[11px] font-bold text-slate-400">
                  <span>⏱️ {tpl.duration}</span>
                  <span>🖼️ {tpl.photos}</span>
                  <span className="ml-auto text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Áp dụng →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeSubTab === 'overlays' && (
        <div className="space-y-2.5">
          {VIDEO_OVERLAYS.map((ov) => (
            <div
              key={ov.id}
              className="p-3 rounded-xl border border-[#252B3E] bg-[#161824] hover:border-cyan-400/60 transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#202538] flex items-center justify-center text-xl">
                {ov.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white truncate">{ov.name}</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#252B3E] text-slate-300">
                    {ov.tag}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{ov.desc}</p>
              </div>
              <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-1 rounded-lg">
                Screen Mode
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
