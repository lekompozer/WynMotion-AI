'use client';

import React, { useState } from 'react';
import { X, Sparkles, Upload, Palette, Check, Clock, Type, Plus } from 'lucide-react';

export interface CreatedColorSceneData {
  title: string;
  bgColor: string;
  durationSec: number;
  initialText?: string;
  imageUrl: string;
}

export interface ColorSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddColorScene: (data: CreatedColorSceneData) => void;
  onUploadMediaScene?: (file: File) => void;
}

const PRESET_COLORS = [
  { id: 'black', label: 'Đen Tuyền', value: '#000000', isDark: true },
  { id: 'white', label: 'Trắng Tinh', value: '#FFFFFF', isDark: false },
  { id: 'navy', label: 'Xanh Navy', value: '#0F172A', isDark: true },
  { id: 'crimson', label: 'Đỏ Mận', value: '#450A0A', isDark: true },
  { id: 'purple', label: 'Tím Hoàng Gia', value: '#3B0764', isDark: true },
  { id: 'emerald', label: 'Xanh Lục Bảo', value: '#064E3B', isDark: true },
  { id: 'amber', label: 'Cam Hổ Phách', value: '#78350F', isDark: true },
  { id: 'gradient_cyber', label: 'Cyber Ocean', value: 'linear-gradient(135deg, #0F172A 0%, #083344 100%)', isDark: true },
  { id: 'gradient_sunset', label: 'Sunset Glow', value: 'linear-gradient(135deg, #4C0519 0%, #1E1B4B 100%)', isDark: true },
  { id: 'gradient_gold', label: 'Royal Gold', value: 'linear-gradient(135deg, #1C1917 0%, #451A03 100%)', isDark: true },
  { id: 'gradient_neon', label: 'Neon Cyberpunk', value: 'linear-gradient(135deg, #180033 0%, #001A33 100%)', isDark: true },
];

/**
 * Tạo nhanh SVG Data URI đại diện cho màu nền solid hoặc gradient để Remotion và trình duyệt render 0ms không cần server
 */
function generateSvgDataUri(colorVal: string): string {
  if (colorVal.startsWith('linear-gradient')) {
    // Trích xuất các màu cơ bản từ linear-gradient hoặc dùng SVG gradient
    const match = colorVal.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g);
    const c1 = match && match[0] ? match[0] : '#0F172A';
    const c2 = match && match[1] ? match[1] : '#083344';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="100%" height="100%" fill="${colorVal}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const ColorSceneModal: React.FC<ColorSceneModalProps> = ({
  isOpen,
  onClose,
  onAddColorScene,
  onUploadMediaScene,
}) => {
  const [activeTab, setActiveTab] = useState<'color' | 'upload'>('color');
  const [selectedColor, setSelectedColor] = useState<string>('#0F172A');
  const [customHex, setCustomHex] = useState<string>('#0F172A');
  const [durationSec, setDurationSec] = useState<number>(3.0);
  const [sceneTitle, setSceneTitle] = useState<string>('');
  const [initialText, setInitialText] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (val: string) => {
    setSelectedColor(val);
    if (!val.startsWith('linear-gradient')) {
      setCustomHex(val);
    }
  };

  const handleCustomHexChange = (hex: string) => {
    setCustomHex(hex);
    setSelectedColor(hex);
  };

  const handleCreateColorScene = () => {
    const imageUrl = generateSvgDataUri(selectedColor);
    onAddColorScene({
      title: sceneTitle.trim() || 'Phân cảnh Màu Nền',
      bgColor: selectedColor,
      durationSec: Math.max(1, durationSec),
      initialText: initialText.trim(),
      imageUrl,
    });
    onClose();
  };

  const handleUploadSubmit = () => {
    if (uploadFile && onUploadMediaScene) {
      onUploadMediaScene(uploadFile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#121522] border border-[#23293F] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#23293F] bg-[#0D0F18]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Thêm Phân Cảnh Mới (Add Scene)</h3>
              <p className="text-[11px] text-slate-400">Chọn Scene màu nền để gõ text hoặc tải video/ảnh từ máy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#23293F] bg-[#141826] px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('color')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'color'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Scene Trống (Màu Nền)</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'upload'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải Video / Ảnh</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto studio-scrollbar">
          {activeTab === 'color' ? (
            <>
              {/* Preview Box */}
              <div
                className="w-full h-28 rounded-xl border border-white/20 shadow-inner flex flex-col items-center justify-center p-3 relative overflow-hidden transition-all"
                style={{ background: selectedColor }}
              >
                <span
                  className="text-xs font-bold text-center px-4 py-1.5 rounded-lg backdrop-blur-xs shadow-sm max-w-full truncate"
                  style={{
                    color: selectedColor === '#FFFFFF' ? '#0F172A' : '#FFFFFF',
                    backgroundColor: selectedColor === '#FFFFFF' ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.35)',
                  }}
                >
                  {initialText || sceneTitle || 'Xem trước phân cảnh màu nền'}
                </span>
                <span className="absolute bottom-2 right-2.5 text-[10px] font-mono text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                  {durationSec.toFixed(1)}s
                </span>
              </div>

              {/* Preset Palettes */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-2 block flex items-center justify-between">
                  <span>Bảng màu phổ biến</span>
                  <span className="text-[10px] text-slate-400 font-mono">11 màu đẹp</span>
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((c) => {
                    const isSelected = selectedColor === c.value;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectPreset(c.value)}
                        className={`h-9 rounded-xl relative transition-all border ${
                          isSelected ? 'ring-2 ring-cyan-400 border-white scale-105 shadow-md' : 'border-white/10 hover:scale-102 hover:border-white/40'
                        }`}
                        style={{ background: c.value }}
                        title={c.label}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className={`w-4 h-4 ${c.isDark ? 'text-white' : 'text-slate-900'} drop-shadow-md`} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-2.5 bg-[#090B12] p-2 rounded-xl border border-[#23293F]">
                <input
                  type="color"
                  value={customHex.startsWith('#') ? customHex : '#0F172A'}
                  onChange={(e) => handleCustomHexChange(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">Tự chọn mã màu HEX</span>
                  <input
                    type="text"
                    value={customHex}
                    onChange={(e) => handleCustomHexChange(e.target.value)}
                    placeholder="#0F172A"
                    className="bg-transparent text-xs font-mono text-white focus:outline-hidden w-full"
                  />
                </div>
              </div>

              {/* Duration Slider */}
              <div className="bg-[#090B12] p-3 rounded-xl border border-[#23293F] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Thời lượng phân cảnh
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{durationSec.toFixed(1)} giây</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={durationSec}
                  onChange={(e) => setDurationSec(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-[#1E2335] rounded-lg cursor-pointer"
                />
              </div>

              {/* Optional Text Content for this scene */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-cyan-400" />
                  Chữ hiển thị trên Scene (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={initialText}
                  onChange={(e) => setInitialText(e.target.value)}
                  placeholder="Ví dụ: Giới thiệu sản phẩm mới, Chương 1, Lưu ý..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#090B12] border border-[#23293F] text-white focus:outline-hidden focus:border-cyan-400 placeholder:text-slate-600"
                />
              </div>
            </>
          ) : (
            /* Upload File Tab */
            <div className="space-y-3">
              <label
                htmlFor="color_scene_file_input"
                className="w-full border-2 border-dashed border-[#2A314A] hover:border-cyan-500/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-[#0A0D15]/60 hover:bg-cyan-500/5 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white">
                    {uploadFile ? uploadFile.name : 'Bấm để chọn hoặc kéo thả Video / Hình ảnh vào đây'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ MP4, MOV, WEBM, PNG, JPG (Tối đa 200MB)</p>
                </div>
                <input
                  id="color_scene_file_input"
                  type="file"
                  accept="video/*,image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>

              {uploadFile && (
                <div className="p-2.5 rounded-xl bg-[#090B12] border border-cyan-500/30 flex items-center justify-between text-xs">
                  <span className="truncate text-cyan-300 font-bold">{uploadFile.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(uploadFile.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#23293F] bg-[#0D0F18] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Hủy
          </button>
          {activeTab === 'color' ? (
            <button
              onClick={handleCreateColorScene}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tạo Scene Màu Nền</span>
            </button>
          ) : (
            <button
              onClick={handleUploadSubmit}
              disabled={!uploadFile}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Thêm Video/Ảnh Vào Dự Án</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
