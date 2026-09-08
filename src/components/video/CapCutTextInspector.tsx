'use client';

import React from 'react';
import {
  X,
  Type,
  MoveVertical,
  Palette,
  Sparkles,
  Sliders,
  Check,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  CaptionPresetStyle,
  CAPTION_PRESET_LABELS,
} from './subtitles/CapCutCaptionRenderer';

export interface CapCutTextInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  presetStyle: CaptionPresetStyle;
  onChangePresetStyle: (style: CaptionPresetStyle) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  positionY: number | string;
  onChangePositionY: (pos: number | string) => void;
  fontFamily?: string;
  onChangeFontFamily?: (font: string) => void;
  textColor?: string;
  onChangeTextColor?: (color: string) => void;
  highlightColor?: string;
  onChangeHighlightColor?: (color: string) => void;
}

const AVAILABLE_FONTS = [
  { id: 'Outfit, Montserrat, sans-serif', label: 'Outfit (Hiện đại)', style: 'font-sans font-bold' },
  { id: "'Playfair Display', serif", label: 'Playfair (Luxury Serif)', style: 'font-serif italic' },
  { id: "'Bangers', cursive, sans-serif", label: 'Bangers (Comic Manga)', style: 'font-mono uppercase tracking-wider' },
  { id: "'Courier New', Courier, monospace", label: 'Typewriter (Máy đánh chữ)', style: 'font-mono' },
  { id: "'Inter', sans-serif", label: 'Inter (Sạch sẽ)', style: 'font-sans' },
  { id: "'Cinzel', serif", label: 'Cinzel (Điện ảnh)', style: 'font-serif font-black tracking-widest' },
];

const TEXT_COLORS = [
  { label: 'Trắng', value: '#FFFFFF', bg: 'bg-white' },
  { label: 'Đen', value: '#0F172A', bg: 'bg-slate-900 border border-slate-700' },
  { label: 'Vàng', value: '#FACC15', bg: 'bg-yellow-400' },
  { label: 'Cyan', value: '#22D3EE', bg: 'bg-cyan-400' },
  { label: 'Hồng Neon', value: '#F43F5E', bg: 'bg-rose-500' },
  { label: 'Cam', value: '#FB923C', bg: 'bg-orange-400' },
  { label: 'Xanh Lá', value: '#4ADE80', bg: 'bg-green-400' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Vàng Rực', value: '#FACC15', bg: 'bg-yellow-400' },
  { label: 'Cyan Sáng', value: '#06B6D4', bg: 'bg-cyan-500' },
  { label: 'Xanh Neon', value: '#22C55E', bg: 'bg-green-500' },
  { label: 'Hồng Neon', value: '#EC4899', bg: 'bg-pink-500' },
  { label: 'Cam Cháy', value: '#F97316', bg: 'bg-orange-500' },
  { label: 'Tím Điện', value: '#A855F7', bg: 'bg-purple-500' },
];

export const CapCutTextInspector: React.FC<CapCutTextInspectorProps> = ({
  isOpen,
  onClose,
  presetStyle,
  onChangePresetStyle,
  fontSize,
  onChangeFontSize,
  positionY,
  onChangePositionY,
  fontFamily = 'Outfit, Montserrat, sans-serif',
  onChangeFontFamily,
  textColor = '#FFFFFF',
  onChangeTextColor,
  highlightColor = '#FACC15',
  onChangeHighlightColor,
}) => {
  if (!isOpen) return null;

  // Convert current positionY into numeric percentage for slider (5 - 95)
  const numericPosY = (() => {
    if (typeof positionY === 'number') return Math.min(95, Math.max(5, positionY));
    if (typeof positionY === 'string') {
      if (positionY === 'top') return 15;
      if (positionY === 'middle') return 50;
      if (positionY === 'bottom') return 82;
      const parsed = parseFloat(positionY);
      if (!isNaN(parsed)) return Math.min(95, Math.max(5, parsed));
    }
    return 82;
  })();

  return (
    <aside
      className="absolute top-3 right-3 bottom-3 w-80 max-w-[calc(100vw-32px)] bg-[#101321]/95 backdrop-blur-xl border border-[#2B344D] rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden animate-in slide-in-from-right-4 fade-in duration-200"
      style={{
        boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 1px 1px rgba(255,255,255,0.08)',
      }}
    >
      {/* ── HEADER ── */}
      <div className="px-4 py-3 border-b border-[#22293E] flex items-center justify-between bg-[#141829]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">CapCut Text Studio</h3>
            <p className="text-[10px] text-slate-400">Tùy biến phông chữ, cỡ & hiệu ứng</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#20273D] transition-colors"
          title="Đóng bảng chỉnh sửa"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 text-slate-200">
        {/* 1. CỠ CHỮ PHỤ ĐỀ (Slider: 4px - 72px) */}
        <section className="space-y-2 bg-[#161B2E] p-3 rounded-xl border border-[#232B44]">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cỡ Chữ Phụ Đề</span>
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {fontSize}px
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onChangeFontSize(Math.max(4, fontSize - 2))}
              className="w-7 h-7 rounded-lg bg-[#20273D] hover:bg-[#2A3450] text-white text-xs font-black flex items-center justify-center border border-[#2C3754] transition-transform active:scale-95 shrink-0"
              title="Thu nhỏ chữ (A-)"
            >
              A-
            </button>
            <input
              type="range"
              min={4}
              max={72}
              step={1}
              value={fontSize}
              onChange={(e) => onChangeFontSize(Number(e.target.value))}
              className="flex-1 accent-cyan-400 h-1.5 bg-[#0C0E17] rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => onChangeFontSize(Math.min(72, fontSize + 2))}
              className="w-7 h-7 rounded-lg bg-[#20273D] hover:bg-[#2A3450] text-white text-xs font-black flex items-center justify-center border border-[#2C3754] transition-transform active:scale-95 shrink-0"
              title="Phóng to chữ (A+)"
            >
              A+
            </button>
          </div>

          {/* Quick Font Size Presets */}
          <div className="grid grid-cols-6 gap-1 pt-1">
            {[4, 8, 14, 20, 28, 40].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => onChangeFontSize(sz)}
                className={`py-0.5 rounded text-[9px] font-bold font-mono transition-all ${
                  fontSize === sz
                    ? 'bg-cyan-400 text-slate-950 font-black shadow-sm'
                    : 'bg-[#20273D]/60 text-slate-400 hover:text-white hover:bg-[#2A3450]'
                }`}
              >
                {sz}p
              </button>
            ))}
          </div>
        </section>

        {/* 2. VỊ TRÍ Y (Thanh trượt liên tục: 5% - 95%) */}
        <section className="space-y-2 bg-[#161B2E] p-3 rounded-xl border border-[#232B44]">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <MoveVertical className="w-3.5 h-3.5 text-blue-400" />
              <span>Vị Trí Dọc (Trục Y)</span>
            </label>
            <span className="text-[11px] font-mono font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {numericPosY}%
            </span>
          </div>

          <div className="pt-1">
            <input
              type="range"
              min={5}
              max={95}
              step={1}
              value={numericPosY}
              onChange={(e) => onChangePositionY(Number(e.target.value))}
              className="w-full accent-blue-400 h-1.5 bg-[#0C0E17] rounded-lg cursor-pointer"
            />
          </div>

          {/* Quick Position Presets */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { label: 'Trên Cùng', val: 12 },
              { label: 'Ở Giữa', val: 50 },
              { label: 'Phía Dưới', val: 82 },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => onChangePositionY(p.val)}
                className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  Math.abs(numericPosY - p.val) <= 3
                    ? 'bg-blue-500 text-white font-black shadow-sm'
                    : 'bg-[#20273D]/60 text-slate-400 hover:text-white hover:bg-[#2A3450]'
                }`}
              >
                {p.label} ({p.val}%)
              </button>
            ))}
          </div>
        </section>

        {/* 3. PHÔNG CHỮ (Font Family) */}
        {onChangeFontFamily && (
          <section className="space-y-2 bg-[#161B2E] p-3 rounded-xl border border-[#232B44]">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-purple-400" />
              <span>Kiểu Phông Chữ</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {AVAILABLE_FONTS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChangeFontFamily(f.id)}
                  className={`p-1.5 rounded-lg text-left text-[10px] transition-all border ${
                    fontFamily === f.id
                      ? 'border-purple-400 bg-purple-500/20 text-purple-200 font-bold'
                      : 'border-[#242C44] bg-[#1B2138] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className={`truncate ${f.style}`}>{f.label}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 4. MÀU CHỮ & MÀU TỪ PHÁT ÂM (Colors) */}
        <section className="space-y-3 bg-[#161B2E] p-3 rounded-xl border border-[#232B44]">
          {onChangeTextColor && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Màu Chữ Chính</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">{textColor}</span>
              </label>
              <div className="flex items-center gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => onChangeTextColor(c.value)}
                    className={`w-6 h-6 rounded-full ${c.bg} transition-transform flex items-center justify-center ${
                      textColor.toLowerCase() === c.value.toLowerCase()
                        ? 'ring-2 ring-cyan-400 scale-110'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {textColor.toLowerCase() === c.value.toLowerCase() && (
                      <Check className={`w-3 h-3 ${c.value === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {onChangeHighlightColor && (
            <div className="space-y-1.5 pt-2 border-t border-[#232B44]">
              <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Màu Nhấn (Từ Đang Đọc)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">{highlightColor}</span>
              </label>
              <div className="flex items-center gap-1.5">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => onChangeHighlightColor(c.value)}
                    className={`w-6 h-6 rounded-full ${c.bg} transition-transform flex items-center justify-center ${
                      highlightColor.toLowerCase() === c.value.toLowerCase()
                        ? 'ring-2 ring-white scale-110'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {highlightColor.toLowerCase() === c.value.toLowerCase() && (
                      <Check className="w-3 h-3 text-slate-950 font-bold" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 5. DANH SÁCH 14 HIỆU ỨNG CAPCUT (Presets Grid) */}
        <section className="space-y-2">
          <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mẫu Kiểu Chữ CapCut (14 Kiểu)</span>
            </span>
          </label>

          <div className="grid grid-cols-1 gap-1.5">
            {(Object.entries(CAPTION_PRESET_LABELS) as [CaptionPresetStyle, { label: string; desc: string; icon: string }][]).map(([id, p]) => {
              const isActive = presetStyle === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChangePresetStyle(id)}
                  className={`p-2 rounded-xl text-left border transition-all flex items-start gap-2.5 ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/40'
                      : 'border-[#20273D] bg-[#141829] text-slate-400 hover:text-slate-200 hover:border-slate-600 hover:bg-[#181D31]'
                  }`}
                >
                  <span className="text-base shrink-0 mt-0.5">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {p.label}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
};
