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
  const { isVietnamese, isDark, setActiveTab, t } = useApp();
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
    if (navigator.share) {
      navigator.share({ title: 'WynMotion AI Artwork', url: resultImageUrl }).catch(() => {});
    } else {
      window.open(resultImageUrl, '_blank');
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto p-4 sm:p-6 space-y-5 transition-colors duration-200 ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* TOP SEGMENTED SWITCHER: Generate vs Edit */}
      <div className={`p-1 rounded-2xl flex items-center shadow-inner border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/70 border-slate-300/60'
      }`}>
        <button
          type="button"
          onClick={() => setTabMode('generate')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            tabMode === 'generate'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{t('Tạo Ảnh Mới (Generate)', 'AI Generate')}</span>
        </button>
        <button
          type="button"
          onClick={() => setTabMode('edit')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            tabMode === 'edit'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Wand2 className="h-4 w-4" />
          <span>{t('Chỉnh Sửa AI (Edit)', 'AI Edit')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE A: AI GENERATE */}
      {/* ========================================================================= */}
      {tabMode === 'generate' && (
        <div className="space-y-5 animate-in fade-in-50 duration-150">
          {/* 1. Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm font-black'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* 2. Prompt Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t('Mô Tả Hình Ảnh (Prompt)', 'Image Prompt')}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder={t('Nhập chi tiết về hình ảnh...', 'Describe your image in detail...')}
              className={`w-full p-4 rounded-2xl border text-sm font-medium outline-none resize-none transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-cyan-400'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
              }`}
            />
          </div>

          {/* 3. Aspect Ratio */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t('Tỉ Lệ Khung Hình', 'Aspect Ratio')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['1:1', '16:9', '9:16', '4:3'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAspectRatio(r)}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    aspectRatio === r
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-500 font-black'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Prompt Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('✨ Gợi Ý Mẫu Có Sẵn', '✨ Prompt Inspiration')}
            </span>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {IMAGE_PROMPT_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`w-full p-3 rounded-2xl border text-left text-xs font-medium transition-all ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800/80 hover:border-cyan-400/40 text-slate-300'
                      : 'bg-white border-slate-200 shadow-sm hover:border-cyan-400 text-slate-700'
                  }`}
                >
                  <p className="font-extrabold text-cyan-500">{p.label}</p>
                  <p className="text-slate-400 line-clamp-1 mt-0.5">{p.prompt}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t('Đang tạo tác phẩm 8K...', 'Rendering 8K artwork...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>{t('Tạo Hình Ảnh AI Ngay 🎨', 'Generate AI Image 🎨')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE B: AI EDIT */}
      {/* ========================================================================= */}
      {tabMode === 'edit' && (
        <div className="space-y-5 animate-in fade-in-50 duration-150">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t('URL Hình Ảnh Gốc', 'Source Image URL')}
            </label>
            <input
              type="text"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              placeholder="https://..."
              className={`w-full p-4 rounded-2xl border text-sm font-medium outline-none transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-cyan-400'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t('Mô Tả Chỉnh Sửa', 'Edit Instructions')}
            </label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              rows={3}
              placeholder={t('Ví dụ: Thêm kính râm cho nhân vật...', 'e.g. Add sunglasses...')}
              className={`w-full p-4 rounded-2xl border text-sm font-medium outline-none resize-none transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-cyan-400'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={handleEdit}
            disabled={isEditing || !editImageUrl.trim() || !editPrompt.trim()}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isEditing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t('Đang biến hóa hình ảnh...', 'Editing artwork...')}</span>
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                <span>{t('Chỉnh Sửa Hình Ảnh Ngay ✨', 'Edit AI Image ✨')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Result Box */}
      {resultImageUrl && (
        <div className={`p-4 rounded-3xl border space-y-3 animate-in fade-in ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="relative rounded-2xl overflow-hidden aspect-square border border-slate-800/40">
            <img src={resultImageUrl} alt="Result" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleNativeShare}
              className="flex-1 py-3 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('Chia Sẻ', 'Share')}</span>
            </button>
            <a
              href={resultImageUrl}
              download="wynmotion_art.png"
              className={`p-3 rounded-xl border flex items-center justify-center active:scale-95 transition-all ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
              }`}
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
