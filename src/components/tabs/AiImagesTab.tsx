'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Camera,
  Palette,
  Layers,
  Wand2,
  Download,
  Share2,
  Loader2,
  Film,
  ZoomIn,
  CheckCircle2,
  Sliders,
  X,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import {
  imageService,
  ImageCategory,
  IMAGE_PROMPT_PRESETS,
  ImagePromptPreset,
} from '@/services/imageService';

export const AiImagesTab: React.FC = () => {
  const { isVietnamese, setActiveTab, t } = useApp();
  const { refreshSubscription } = useWordaiAuth();

  // Mode: 'generate' | 'edit'
  const [tabMode, setTabMode] = useState<'generate' | 'edit'>('generate');

  // Generation Settings
  const [category, setCategory] = useState<ImageCategory>('stylized');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('1:1');
  const [prompt, setPrompt] = useState(
    'Cute fluffy white fox mascot wearing pink hoodie with letter M, 3D Pixar character style, studio soft lighting, 8k resolution'
  );
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit Settings
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editMode, setEditMode] = useState<'style-transfer' | 'object-edit' | 'inpainting'>('style-transfer');
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Result Image & Lightbox
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const CATEGORIES: { id: ImageCategory; label: string; icon: any }[] = [
    { id: 'stylized', label: t('🎨 3D & Anime', '🎨 3D & Anime'), icon: Palette },
    { id: 'photorealistic', label: t('📸 Chân Thực 8K', '📸 Photorealistic'), icon: Camera },
    { id: 'logo', label: t('✨ Logo Vector', '✨ Vector Logo'), icon: Sparkles },
    { id: 'background', label: t('🌌 Hình Nền', '🌌 Wallpaper'), icon: Layers },
    { id: 'mockup', label: t('📱 Mockup UI', '📱 Product Mockup'), icon: ImageIcon },
  ];

  const handleApplyPreset = (preset: ImagePromptPreset) => {
    setCategory(preset.category);
    setPrompt(preset.prompt);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await imageService.generateImage({
        prompt: prompt.trim(),
        category,
        aspect_ratio: aspectRatio,
        negative_prompt: negativePrompt.trim() || undefined,
      });
      setResultImageUrl(res.image_url);
      await refreshSubscription();
    } catch (err: any) {
      alert(err.message || t('Lỗi tạo hình ảnh', 'Failed to generate image'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!editImageUrl.trim() || !editPrompt.trim()) return;
    setIsEditing(true);
    try {
      const res = await imageService.editImage({
        image_url: editImageUrl.trim(),
        prompt: editPrompt.trim(),
        edit_mode: editMode,
      });
      setResultImageUrl(res.image_url);
      await refreshSubscription();
    } catch (err: any) {
      alert(err.message || t('Lỗi chỉnh sửa ảnh', 'Failed to edit image'));
    } finally {
      setIsEditing(false);
    }
  };

  const handleNativeShare = async () => {
    if (!resultImageUrl) return;
    if (typeof window !== 'undefined') {
      try {
        const cap = (window as any).Capacitor;
        if (cap && cap.isNativePlatform && cap.isNativePlatform()) {
          const { Share } = await import('@capacitor/share');
          await Share.share({
            title: 'WynMotion AI Artwork',
            text: prompt,
            url: resultImageUrl,
            dialogTitle: 'Chia sẻ hình ảnh AI',
          });
          return;
        }
      } catch (_) {}
    }
    // Web fallback
    if (navigator.share) {
      navigator.share({ title: 'WynMotion AI Artwork', url: resultImageUrl }).catch(() => {});
    } else {
      window.open(resultImageUrl, '_blank');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 space-y-4">
      {/* TOP SEGMENTED SWITCHER: Generate vs Edit */}
      <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center shadow-inner">
        <button
          type="button"
          onClick={() => setTabMode('generate')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            tabMode === 'generate'
              ? 'bg-white text-[#FF2D55] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t('Tạo Ảnh Mới (Generate)', 'AI Generate')}</span>
        </button>
        <button
          type="button"
          onClick={() => setTabMode('edit')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            tabMode === 'edit'
              ? 'bg-white text-[#FF2D55] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wand2 className="h-3.5 w-3.5" />
          <span>{t('Chỉnh Sửa AI (Edit)', 'AI Edit')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE A: AI GENERATE */}
      {/* ========================================================================= */}
      {tabMode === 'generate' && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          {/* 1. Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#FF2D55] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Aspect Ratio Selector */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {t('Tỉ Lệ Khung Hình', 'Aspect Ratio')}
            </span>
            <div className="flex items-center gap-1">
              {(['1:1', '16:9', '9:16', '4:3'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAspectRatio(r)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                    aspectRatio === r
                      ? 'bg-[#FF2D55] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Prompt Presets Carousel */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase">
              {t('Gợi Ý Prompt Sáng Tạo (1 Chạm)', 'Creative Prompt Presets')}
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {IMAGE_PROMPT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-3 py-1.5 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 text-slate-800 text-xs font-bold whitespace-nowrap shadow-2xs active:scale-95 transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Prompt Input Box */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              {t('Mô Tả Hình Ảnh (Prompt)', 'Image Prompt')}
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Detailed description of subject, lighting, style..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:border-[#FF2D55] leading-relaxed resize-none"
            />

            {/* Advanced toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <Sliders className="h-3 w-3" />
                <span>{t('Tùy chọn nâng cao (Negative Prompt)', 'Advanced Settings')}</span>
              </button>
              {showAdvanced && (
                <div className="mt-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="blurry, bad anatomy, low quality, watermark..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 5. Generate Button */}
          <button
            type="button"
            disabled={isGenerating || !prompt.trim()}
            onClick={handleGenerate}
            className="w-full py-3.5 rounded-2xl bg-[#FF2D55] hover:bg-[#E11D48] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('Đang Sinh Hình Ảnh AI 8K...', 'Rendering AI Image...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{t('Tạo Hình Ảnh AI Ngay (2 Điểm)', 'Generate AI Image (2 Pts)')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE B: AI IMAGE EDIT */}
      {/* ========================================================================= */}
      {tabMode === 'edit' && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          {/* Edit Mode Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'style-transfer', label: t('Biến Đổi Phong Cách', 'Style Transfer') },
              { id: 'object-edit', label: t('Đổi Vật Thể', 'Object Edit') },
              { id: 'inpainting', label: t('Xóa Chi Tiết', 'Inpainting') },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setEditMode(m.id as any)}
                className={`py-2 rounded-xl text-[11px] font-extrabold transition-all ${
                  editMode === m.id
                    ? 'bg-[#FF2D55] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('URL Hình Ảnh Gốc', 'Source Image URL')}
              </label>
              <input
                type="text"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                placeholder="https://... image url"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#FF2D55]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('Yêu Cầu Chỉnh Sửa (Prompt)', 'Edit Instructions Prompt')}
              </label>
              <textarea
                rows={3}
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder={t('Mô tả thay đổi mong muốn...', 'Describe the changes...')}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:border-[#FF2D55] resize-none"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isEditing || !editImageUrl.trim() || !editPrompt.trim()}
            onClick={handleEdit}
            className="w-full py-3.5 rounded-2xl bg-[#FF2D55] hover:bg-[#E11D48] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {isEditing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('Đang Chỉnh Sửa...', 'Processing Edit...')}</span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                <span>{t('Thực Hiện Chỉnh Sửa (2 Điểm)', 'Apply AI Edit (2 Pts)')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESULT IMAGE CARD */}
      {/* ========================================================================= */}
      {resultImageUrl && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-rose-200/80 shadow-lg shadow-rose-500/5 space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#FF2D55]" />
              <span>{t('Kết Quả Hình Ảnh AI', 'AI Generated Artwork')}</span>
            </h4>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleNativeShare}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <a
                href={resultImageUrl}
                download="wynmotion-art.jpg"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Image Display */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-100 border border-slate-200 aspect-square max-h-[340px] flex items-center justify-center"
          >
            <img
              src={resultImageUrl}
              alt="Generated AI Art"
              className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm flex items-center gap-1 opacity-80 group-hover:opacity-100">
              <ZoomIn className="h-3 w-3" />
              <span>{t('Phóng to', 'Zoom')}</span>
            </div>
          </div>

          {/* Action: Use image in WynMotion Video Scene */}
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#FF2D55] font-black text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-200"
          >
            <Film className="h-4 w-4" />
            <span>{t('🎬 Đưa Vào Video Hoạt Họa WynMotion', 'Use in WynMotion Video Scene')}</span>
          </button>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && resultImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={resultImageUrl}
            alt="Fullscreen view"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
