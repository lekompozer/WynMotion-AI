'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Edit3,
  Scissors,
  Copy,
  Check,
  CheckCircle2,
  Eye,
  RefreshCw,
  Plus,
  Compass,
  FolderOpen,
  Maximize2,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import {
  imageService,
  ImageEndpoint,
  AspectRatio,
  IMAGE_PROMPT_PRESETS,
  INSPIRATION_CATEGORIES,
  ImagePromptPreset,
  GenerateImageResult,
} from '@/services/imageService';

type MainTab = 'generate' | 'removebg' | 'edit' | 'inspiration';

export const AiImagesTab: React.FC = () => {
  const { isVietnamese, isDark, setActiveTab, t } = useApp();
  const { refreshSubscription } = useWordaiAuth();

  // Mode: 'generate' | 'removebg' | 'edit' | 'inspiration'
  const [mainTab, setMainTab] = useState<MainTab>('generate');

  // ── Step 1: Generation Settings ──
  const [category, setCategory] = useState<ImageEndpoint>('stylized');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  // Sub-options
  const [lighting, setLighting] = useState<string>('Cinematic');
  const [cameraAngle, setCameraAngle] = useState<string>('Eye Level');
  const [stylePreset, setStylePreset] = useState<'3D Render' | 'Anime' | 'Watercolor' | 'Oil Painting' | 'Flat Design' | 'Sticker Art'>('3D Render');
  const [stickerMode, setStickerMode] = useState<boolean>(false);
  const [logoStyle, setLogoStyle] = useState<'Modern' | 'Minimalist' | 'Vintage' | 'Luxury'>('Modern');
  const [colorMood, setColorMood] = useState<'Vibrant' | 'Pastel' | 'Dark' | 'Light'>('Vibrant');
  const [mockupPlacement, setMockupPlacement] = useState<'Tabletop' | 'Model Wearing' | 'Outdoor' | 'Studio Backdrop'>('Studio Backdrop');

  // ── Step 2: Prompt & Launch ──
  const [prompt, setPrompt] = useState(
    'Cute fluffy white fox mascot wearing cyan hoodie with letter M, 3D Pixar character style, soft studio rim lighting, vibrant 8k render'
  );
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ── RemoveBG States ──
  const [removeBgFile, setRemoveBgFile] = useState<File | null>(null);
  const [removeBgPreview, setRemoveBgPreview] = useState('');
  const [removeBgPrompt, setRemoveBgPrompt] = useState('');
  const [removeBgAspectRatio, setRemoveBgAspectRatio] = useState<string>('original');

  // ── Editing States ──
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editMode, setEditMode] = useState<'style-transfer' | 'object-edit' | 'inpainting'>('style-transfer');
  const [editPrompt, setEditPrompt] = useState('');

  // ── Inspiration Tab States ──
  const [selectedInspirationCat, setSelectedInspirationCat] = useState(INSPIRATION_CATEGORIES[0].id);

  // ── Generation Status & Timer ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Output Image & Lightbox ──
  const [resultImage, setResultImage] = useState<GenerateImageResult | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => setElapsedTime((p) => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGenerating]);

  // Categories config
  const CATEGORIES: { id: ImageEndpoint; labelVi: string; labelEn: string; icon: any }[] = [
    { id: 'stylized', labelVi: '🎨 3D & Anime', labelEn: '🎨 3D & Anime', icon: Palette },
    { id: 'photorealistic', labelVi: '📸 Chân Thực 8K', labelEn: '📸 Photorealistic', icon: Camera },
    { id: 'logo', labelVi: '✨ Logo Vector', labelEn: '✨ Vector Logo', icon: Sparkles },
    { id: 'background', labelVi: '🌌 Wallpaper', labelEn: '🌌 Wallpaper', icon: Layers },
    { id: 'mockup', labelVi: '📱 Mockup UI', labelEn: '📱 Mockup', icon: ImageIcon },
  ];

  const handleApplyPreset = (preset: ImagePromptPreset) => {
    setCategory(preset.category);
    setPrompt(preset.prompt);
    setMainTab('generate');
  };

  // ── Generate Image ──
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert(t('Vui lòng nhập mô tả hình ảnh', 'Please enter an image prompt'));
      return;
    }

    setIsGenerating(true);
    setResultImage(null);

    try {
      let res: GenerateImageResult;

      if (category === 'photorealistic') {
        res = await imageService.generatePhotorealistic({
          prompt: prompt.trim(),
          lighting,
          camera_angle: cameraAngle,
          aspect_ratio: aspectRatio,
          negative_prompt: negativePrompt.trim() || undefined,
        });
      } else if (category === 'stylized') {
        res = await imageService.generateStylized({
          prompt: prompt.trim(),
          style_preset: stylePreset,
          sticker_mode: stickerMode,
          aspect_ratio: aspectRatio,
          negative_prompt: negativePrompt.trim() || undefined,
        });
      } else if (category === 'logo') {
        res = await imageService.generateLogo({
          brand_name: prompt.trim(),
          industry: 'Technology',
          style: logoStyle,
          aspect_ratio: aspectRatio,
        });
      } else if (category === 'background') {
        res = await imageService.generateBackground({
          theme: prompt.trim(),
          color_mood: colorMood,
          aspect_ratio: aspectRatio,
        });
      } else if (category === 'mockup') {
        res = await imageService.generateMockup({
          scene_description: prompt.trim(),
          placement_type: mockupPlacement,
          aspect_ratio: aspectRatio,
        });
      } else {
        res = await imageService.generateImage({
          prompt: prompt.trim(),
          category,
          aspect_ratio: aspectRatio,
          negative_prompt: negativePrompt.trim() || undefined,
        });
      }

      setResultImage(res);
      await refreshSubscription();
    } catch (err: any) {
      alert(err.message || t('Lỗi tạo hình ảnh AI', 'Failed to generate image'));
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Edit Image ──
  const handleEdit = async () => {
    if (!editImageUrl.trim() || !editPrompt.trim()) {
      alert(t('Vui lòng nhập URL ảnh và yêu cầu chỉnh sửa', 'Please enter image URL and prompt'));
      return;
    }

    setIsGenerating(true);
    setResultImage(null);

    try {
      const res = await imageService.editImage({
        image_url: editImageUrl.trim(),
        prompt: editPrompt.trim(),
        edit_mode: editMode,
        aspect_ratio: aspectRatio,
      });

      setResultImage({
        image_url: res.image_url,
        file_id: res.file_id,
        prompt_used: editPrompt.trim(),
        aspect_ratio: aspectRatio,
      });
      await refreshSubscription();
    } catch (err: any) {
      alert(err.message || t('Lỗi chỉnh sửa hình ảnh', 'Failed to edit image'));
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Remove Background ──
  const handleRemoveBg = async () => {
    if (!removeBgFile) {
      alert(t('Vui lòng chọn ảnh cần tách nền', 'Please select an image to remove background'));
      return;
    }
    setIsGenerating(true);
    setResultImage(null);
    try {
      const res = await imageService.removeBackground({
        file: removeBgFile,
        prompt: removeBgPrompt.trim() || undefined,
        aspect_ratio: removeBgAspectRatio === 'original' ? undefined : removeBgAspectRatio,
      });
      setResultImage({
        image_url: res.cutout_url,
        prompt_used: removeBgPrompt.trim() || 'AI RemoveBG Cutout',
        aspect_ratio: (removeBgAspectRatio === 'original' ? '1:1' : removeBgAspectRatio) as any,
      });
      await refreshSubscription();
    } catch (err: any) {
      alert(err.message || t('Lỗi tách nền hình ảnh', 'Failed to remove background'));
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Download Image ──
  const handleDownload = async () => {
    if (!resultImage?.image_url) return;
    try {
      const response = await fetch(resultImage.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WynMotion_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(resultImage.image_url, '_blank');
    }
  };

  // ── Copy Prompt ──
  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={`w-full max-w-xl mx-auto px-4 py-5 space-y-6 transition-colors duration-200 ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* ─── MAIN TAB SWITCHER ─── */}
      <div
        className={`p-1.5 rounded-3xl border flex items-center gap-1 shadow-sm ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <button
          type="button"
          onClick={() => setMainTab('generate')}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
            mainTab === 'generate'
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{t('Tạo Ảnh', 'Generate')}</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('removebg')}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
            mainTab === 'removebg'
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md'
              : isDark
              ? 'text-emerald-400 hover:text-white'
              : 'text-emerald-600 hover:text-emerald-900'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>{t('Tách Nền', 'Cutout')}</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('edit')}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
            mainTab === 'edit'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{t('Sửa Ảnh', 'Edit')}</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('inspiration')}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
            mainTab === 'inspiration'
              ? 'bg-gradient-to-r from-purple-400 to-violet-600 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{t('Cảm Hứng', 'Ideas')}</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODE: REMOVE BG STUDIO
      ═══════════════════════════════════════════════════════════ */}
      {mainTab === 'removebg' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div
            className={`rounded-3xl p-5 border space-y-4 shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-emerald-400" />
                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('AI Tách Nền / RemoveBG', 'AI Remove Background')}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ✨ {t('Miễn Phí (0 Điểm)', 'Free (0 Pts)')}
              </span>
            </div>

            <p className="text-xs opacity-75 leading-relaxed">
              {t(
                'Bóc tách chủ thể và sản phẩm sắc nét, giữ trọn vẹn nhãn mác, chi tiết và phông nền trong suốt 100%.',
                'High-precision AI cutout, preserving subjects, labels, and clean transparent background.'
              )}
            </p>

            {/* Upload Box */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400">
                {t('Tải ảnh cần tách nền:', 'Upload Image:')}
              </label>
              {!removeBgPreview ? (
                <label
                  className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                    isDark
                      ? 'bg-slate-800/40 border-slate-700 hover:border-emerald-500'
                      : 'bg-slate-50 border-slate-300 hover:border-emerald-500'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center p-3 text-center">
                    <Scissors className="w-6 h-6 text-emerald-400 mb-1" />
                    <p className="text-xs font-bold">{t('Chọn ảnh cần tách nền', 'Select image')}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP (Max 15MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setRemoveBgFile(file);
                        const r = new FileReader();
                        r.onloadend = () => setRemoveBgPreview(r.result as string);
                        r.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-black/40 p-2 flex items-center justify-center">
                  <img
                    src={removeBgPreview}
                    alt="Preview"
                    className="max-h-40 object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setRemoveBgFile(null);
                      setRemoveBgPreview('');
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Prompt input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400">
                {t('Ghi chú chủ thể (Tùy chọn):', 'Subject Notes (Optional):')}
              </label>
              <textarea
                value={removeBgPrompt}
                onChange={(e) => setRemoveBgPrompt(e.target.value)}
                rows={2}
                placeholder={t('Ví dụ: Giữ nguyên chai dầu gội, nhãn dán...', 'e.g. Keep shampoo bottle, label...')}
                className={`w-full px-3 py-2 rounded-xl text-xs leading-relaxed border resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Aspect ratio */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400">
                {t('Tỉ lệ khung hình:', 'Aspect Ratio:')}
              </label>
              <div className="grid grid-cols-6 gap-1.5 text-center">
                {[
                  { id: 'original', label: t('Gốc', 'Auto') },
                  { id: '1:1', label: '1:1' },
                  { id: '9:16', label: '9:16' },
                  { id: '16:9', label: '16:9' },
                  { id: '4:3', label: '4:3' },
                  { id: '3:4', label: '3:4' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRemoveBgAspectRatio(r.id)}
                    className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                      removeBgAspectRatio === r.id
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleRemoveBg}
              disabled={isGenerating || !removeBgFile}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {elapsedTime < 4
                      ? t('AI đang phân tích yêu cầu...', 'AI is analyzing request...')
                      : t('AI đang tách ảnh...', 'AI is processing cutout...')}
                  </span>
                </>
              ) : (
                <>
                  <Scissors className="w-5 h-5" />
                  <span>{t('Tách Nền AI Ngay (Miễn Phí)', 'Remove Background (Free)')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODE 1: GENERATION STUDIO (Settings First)
      ═══════════════════════════════════════════════════════════ */}
      {mainTab === 'generate' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* ─── STEP 1: CẤU HÌNH & THỂ LOẠI (SETTINGS FIRST) ─── */}
          <div
            className={`rounded-3xl p-5 border space-y-4 shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('Thể Loại & Tỷ Lệ Khung Hình', 'Style & Aspect Ratio')}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                Imagen 3.0 HD
              </span>
            </div>

            {/* 1.1: Category Pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t('1. Thể Loại Hình Ảnh', '1. Image Category')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 text-amber-300 ring-1 ring-amber-400/40 shadow-sm'
                          : isDark
                          ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : ''}`} />
                      <span className="text-[11px] font-bold">
                        {isVietnamese ? cat.labelVi : cat.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1.2: Aspect Ratio Pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t('2. Tỷ Lệ Khung Hình', '2. Aspect Ratio')}
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAspectRatio(r)}
                    className={`py-2 rounded-xl text-xs font-black border text-center transition-all ${
                      aspectRatio === r
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                        : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* 1.3: Category-Specific Options */}
            {category === 'photorealistic' && (
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/40">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">
                    {t('Ánh sáng', 'Lighting')}
                  </label>
                  <select
                    value={lighting}
                    onChange={(e) => setLighting(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {['Cinematic', 'Natural', 'Studio', 'Golden Hour'].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">
                    {t('Góc chụp', 'Camera Angle')}
                  </label>
                  <select
                    value={cameraAngle}
                    onChange={(e) => setCameraAngle(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {['Eye Level', 'Wide Angle', 'Macro', 'Drone View'].map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {category === 'stylized' && (
              <div className="space-y-2 pt-2 border-t border-slate-800/40">
                <label className="text-[10px] font-bold text-slate-400">
                  {t('Phong cách hội họa', 'Style Preset')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    '3D Render',
                    'Anime',
                    'Watercolor',
                    'Oil Painting',
                    'Flat Design',
                    'Sticker Art',
                  ].map((st: any) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStylePreset(st)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border truncate transition-all ${
                        stylePreset === st
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── STEP 2: MÔ TẢ PROMPT & TẠO ẢNH (TEXT & GENERATE) ─── */}
          <div
            className={`rounded-3xl p-5 border space-y-4 shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('Ý Tưởng & Prompt Tạo Ảnh', 'Prompt & Launch')}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? t('Đã copy', 'Copied') : t('Copy', 'Copy')}</span>
              </button>
            </div>

            {/* Prompt Presets Pills */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400">
                {t('Gợi ý prompt mẫu:', 'Prompt presets:')}
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-2 px-2">
                {IMAGE_PROMPT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all active:scale-95 ${
                      isDark
                        ? 'bg-slate-800/70 border-slate-700 text-slate-300 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {isVietnamese ? p.labelVi : p.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-1.5">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder={t('Mô tả chi tiết hình ảnh bạn muốn AI tạo...', 'Describe the image you want AI to create...')}
                className={`w-full px-4 py-3 rounded-2xl text-xs leading-relaxed border resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Advanced Negative Prompt Toggle */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-[10px] font-bold text-slate-400 flex items-center gap-1 hover:text-amber-400 transition-colors"
              >
                <Sliders className="w-3 h-3" />
                <span>{t('Tùy chọn nâng cao (Negative Prompt)', 'Advanced (Negative Prompt)')}</span>
              </button>

              {showAdvanced && (
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder={t('Loại trừ: blurry, low quality, distorted, extra fingers...', 'Exclude: blurry, low quality...')}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-amber-400 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              )}
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t(`Đang vẽ ảnh AI (${elapsedTime}s)...`, `Generating image (${elapsedTime}s)...`)}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{t('Khởi Tạo Hình Ảnh AI Ngay 🚀', 'Generate AI Image 🚀')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODE 2: IMAGE EDITING STUDIO
      ═══════════════════════════════════════════════════════════ */}
      {mainTab === 'edit' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div
            className={`rounded-3xl p-5 border space-y-4 shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('Chỉnh Sửa & Biến Đổi Ảnh AI', 'AI Image Editing')}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400">
                Inpainting & Transfer
              </span>
            </div>

            {/* Edit Mode Switcher */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'style-transfer' as const, labelVi: 'Chuyển Style', labelEn: 'Style Transfer' },
                { id: 'object-edit' as const, labelVi: 'Sửa Đối Tượng', labelEn: 'Object Edit' },
                { id: 'inpainting' as const, labelVi: 'Inpainting', labelEn: 'Inpainting' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setEditMode(m.id)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    editMode === m.id
                      ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-sm'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {isVietnamese ? m.labelVi : m.labelEn}
                </button>
              ))}
            </div>

            {/* Image URL Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400">
                {t('URL Hình ảnh gốc cần sửa:', 'Original Image URL:')}
              </label>
              <input
                type="text"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                placeholder="https://... image url"
                className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-400 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            {/* Edit Instruction Prompt */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400">
                {t('Yêu cầu chỉnh sửa chi tiết:', 'Edit instruction prompt:')}
              </label>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={3}
                placeholder={t('Ví dụ: Chuyển toàn bộ bối cảnh sang phong cách Cyberpunk về đêm...', 'e.g. Turn background into nighttime cyberpunk...')}
                className={`w-full px-4 py-3 rounded-2xl text-xs leading-relaxed border resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Edit Action Button */}
            <button
              type="button"
              onClick={handleEdit}
              disabled={isGenerating || !editImageUrl.trim() || !editPrompt.trim()}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t(`Đang xử lý ảnh (${elapsedTime}s)...`, `Editing image (${elapsedTime}s)...`)}</span>
                </>
              ) : (
                <>
                  <Scissors className="w-5 h-5" />
                  <span>{t('Áp Dụng Chỉnh Sửa Ảnh 🚀', 'Apply Image Edit 🚀')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODE 3: INSPIRATION GALLERY & PRESETS
      ═══════════════════════════════════════════════════════════ */}
      {mainTab === 'inspiration' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div
            className={`rounded-3xl p-5 border space-y-4 shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('Thư Viện Cảm Hứng & Ý Tưởng Prompt', 'Inspiration & Prompt Ideas')}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400">
                Curated
              </span>
            </div>

            {/* Inspiration Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-2 px-2">
              {INSPIRATION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedInspirationCat(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    selectedInspirationCat === cat.id
                      ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {isVietnamese ? cat.labelVi : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Presets Cards List */}
            <div className="space-y-2.5">
              {IMAGE_PROMPT_PRESETS.map((p) => (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all ${
                    isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-purple-400 mb-1">
                      {isVietnamese ? p.labelVi : p.labelEn}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                      {p.prompt}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="self-end px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('Dùng Prompt Này', 'Use This Prompt')}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          RESULT IMAGE CARD & ACTIONS
      ═══════════════════════════════════════════════════════════ */}
      {resultImage?.image_url && (
        <div
          className={`rounded-3xl p-5 border space-y-4 shadow-xl animate-in zoom-in-95 duration-200 ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 to-[#1c1409] border-amber-500/40 shadow-amber-500/10'
              : 'bg-gradient-to-br from-amber-50/50 to-white border-amber-300 shadow-amber-500/5'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('Hình Ảnh Đã Hoàn Tất! 🎉', 'Image Ready! 🎉')}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {resultImage.aspect_ratio || aspectRatio} · HD Resolution
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors"
              title={t('Tải về', 'Download')}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Image Display */}
          <div
            className="relative rounded-2xl overflow-hidden bg-black/40 border border-slate-700/50 group flex items-center justify-center p-2"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%), 
                linear-gradient(-45deg, rgba(255,255,255,0.06) 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.06) 75%), 
                linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.06) 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          >
            <img
              src={resultImage.image_url}
              alt={resultImage.prompt_used || 'Generated Art'}
              className="w-full h-auto max-h-[50vh] object-contain mx-auto filter drop-shadow-xl"
            />
            {/* Zoom / Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white opacity-90 group-hover:opacity-100 transition-opacity"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/40">
            <button
              type="button"
              onClick={handleDownload}
              className="py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('Tải Ảnh HD Về Máy', 'Download HD')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'border-slate-200 bg-white text-slate-700 shadow-sm'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Xem Trong Thư Viện', 'Open in Library')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── FULLSCREEN LIGHTBOX MODAL ─── */}
      {isLightboxOpen && resultImage?.image_url && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={resultImage.image_url}
              alt="Fullscreen Art"
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={handleDownload}
              className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{t('Tải Ảnh Về Máy', 'Download Image')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
