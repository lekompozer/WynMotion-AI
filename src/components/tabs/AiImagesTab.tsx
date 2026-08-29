'use client';

/**
 * AiImagesTab.tsx — WynMotion-AI iOS & Web Image Studio
 *
 * Full Parity with Web GeminiImageModal (10 Tools + Remove BG + Inspiration):
 * - 10 Custom Tools rendered in 2-row square cards layout
 * - Dedicated Edit / Generate form screen upon tool selection with Back button
 * - Seamless Remove Background tool
 * - Rich Pixabay / AI Inspiration gallery
 * - Generation Lightbox & Share Sheet
 * - Harmonized Theme: Active buttons/selects use bottom-nav gradient (#FF2D55 -> #FF4570)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Palette,
  Type,
  Image as ImageIcon,
  Package,
  Film,
  Wand2,
  Edit3,
  Scissors,
  Layers,
  Download,
  Share2,
  Loader2,
  Sliders,
  X,
  Copy,
  Check,
  CheckCircle2,
  Eye,
  RefreshCw,
  Plus,
  Compass,
  FolderOpen,
  Maximize2,
  ArrowLeft,
  Upload,
  Search,
  Sparkles,
  Zap,
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
import { saveAndShareMedia } from '@/utils/mediaSaveHelper';

type MainViewMode = 'tools' | 'removebg' | 'inspiration';

interface ToolConfig {
  id: ImageEndpoint;
  icon: typeof Camera;
  iconBg: string;     // semi-transparent bg e.g. 'bg-blue-500/12'
  iconColor: string;  // icon color e.g. 'text-blue-500'
  nameVi: string;
  nameEn: string;
  badgeVi: string;
  badgeEn: string;
  descVi: string;
  descEn: string;
  type: 'generation' | 'editing';
}

// Web-parity order: matches GeminiImageModal.tsx endpoint order exactly
const CUSTOM_TOOLS: ToolConfig[] = [
  {
    id: 'photorealistic',
    icon: Camera,
    iconBg: 'bg-blue-500/12',
    iconColor: 'text-blue-500',
    nameVi: 'Chân Thực',
    nameEn: 'Photorealistic',
    badgeVi: 'Camera 8K',
    badgeEn: '8K Camera',
    descVi: 'Tạo ảnh chân thực như chụp bằng máy ảnh thật',
    descEn: 'Create photorealistic images like real photos',
    type: 'generation',
  },
  {
    id: 'stylized',
    icon: Palette,
    iconBg: 'bg-fuchsia-500/12',
    iconColor: 'text-fuchsia-500',
    nameVi: 'Cách Điệu',
    nameEn: 'Stylized Art',
    badgeVi: '3D & Anime',
    badgeEn: '3D & Anime',
    descVi: 'Tạo ảnh với phong cách nghệ thuật (anime, watercolor...)',
    descEn: 'Create images with artistic styles (anime, watercolor...)',
    type: 'generation',
  },
  {
    id: 'logo',
    icon: Type,
    iconBg: 'bg-amber-500/12',
    iconColor: 'text-amber-500',
    nameVi: 'Logo & Typography',
    nameEn: 'Logo & Typography',
    badgeVi: 'Vector Pro',
    badgeEn: 'Vector Pro',
    descVi: 'Tạo logo thương hiệu và biểu tượng',
    descEn: 'Create brand logos and icons',
    type: 'generation',
  },
  {
    id: 'object-edit',
    icon: Edit3,
    iconBg: 'bg-violet-500/12',
    iconColor: 'text-violet-500',
    nameVi: 'Sửa Vật Thể',
    nameEn: 'Object Edit',
    badgeVi: 'Thay Thế',
    badgeEn: 'Smart Replace',
    descVi: 'Chỉnh sửa đối tượng cụ thể trong ảnh',
    descEn: 'Edit specific objects in image',
    type: 'editing',
  },
  {
    id: 'composition',
    icon: Layers,
    iconBg: 'bg-emerald-500/12',
    iconColor: 'text-emerald-500',
    nameVi: 'Ghép Cảnh',
    nameEn: 'Advanced Composition',
    badgeVi: 'Đa Lớp 3D',
    badgeEn: 'Multi-Layer',
    descVi: 'Kết hợp nhiều ảnh thành một composition',
    descEn: 'Combine multiple images into one composition',
    type: 'editing',
  },
  {
    id: 'sequential',
    icon: Film,
    iconBg: 'bg-red-500/12',
    iconColor: 'text-red-500',
    nameVi: 'Chuỗi Ảnh',
    nameEn: 'Sequential Art',
    badgeVi: 'Storyboard',
    badgeEn: 'Storyboard',
    descVi: 'Tạo storyboard và comic panels',
    descEn: 'Create storyboards and comic panels',
    type: 'generation',
  },
  {
    id: 'mockup',
    icon: Package,
    iconBg: 'bg-cyan-500/12',
    iconColor: 'text-cyan-500',
    nameVi: 'Product Mockup',
    nameEn: 'Product Mockup',
    badgeVi: 'Sản Phẩm',
    badgeEn: 'Product Ad',
    descVi: 'Tạo mockup sản phẩm cho marketing',
    descEn: 'Create product mockups for marketing',
    type: 'generation',
  },
  {
    id: 'style-transfer',
    icon: Wand2,
    iconBg: 'bg-purple-500/12',
    iconColor: 'text-purple-500',
    nameVi: 'Đổi Phong Cách',
    nameEn: 'Style Transfer',
    badgeVi: 'Filter AI',
    badgeEn: 'AI Filter',
    descVi: 'Chuyển ảnh thành phong cách nghệ thuật khác',
    descEn: 'Transform image to different artistic style',
    type: 'editing',
  },
  {
    id: 'inpainting',
    icon: Scissors,
    iconBg: 'bg-rose-500/12',
    iconColor: 'text-rose-500',
    nameVi: 'Inpainting',
    nameEn: 'Inpainting',
    badgeVi: 'Vẽ Chi Tiết',
    badgeEn: 'Fill Detail',
    descVi: 'Thêm, xóa hoặc thay thế phần tử trong ảnh',
    descEn: 'Add, remove or replace elements in image',
    type: 'editing',
  },
  {
    id: 'background',
    icon: ImageIcon,
    iconBg: 'bg-green-500/12',
    iconColor: 'text-green-500',
    nameVi: 'Hình Nền',
    nameEn: 'Background',
    badgeVi: 'Wallpaper 4K',
    badgeEn: '4K Wallpaper',
    descVi: 'Tạo background cho UI và wallpaper',
    descEn: 'Create backgrounds for UI and wallpapers',
    type: 'generation',
  },
];

const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: '1:1', label: '1:1 Vuông', icon: '■' },
  { value: '16:9', label: '16:9 Ngang', icon: '▬' },
  { value: '9:16', label: '9:16 Dọc', icon: '▮' },
  { value: '4:3', label: '4:3 Tablet', icon: '▬' },
  { value: '3:4', label: '3:4 Portrait', icon: '▮' },
];

export const AiImagesTab: React.FC = () => {
  const { isVietnamese, isDark, t } = useApp();
  const { refreshSubscription } = useWordaiAuth();

  // Navigation View Modes
  const [mainView, setMainView] = useState<MainViewMode>('tools');
  const [selectedTool, setSelectedTool] = useState<ImageEndpoint | null>(null);

  // Form Configuration
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Tool Specific Options
  const [lighting, setLighting] = useState('Cinematic');
  const [cameraAngle, setCameraAngle] = useState('Eye Level');
  const [stylePreset, setStylePreset] = useState<'3D Render' | 'Anime' | 'Watercolor' | 'Oil Painting' | 'Flat Design' | 'Sticker Art'>('3D Render');
  const [logoStyle, setLogoStyle] = useState<'Modern' | 'Minimalist' | 'Vintage' | 'Luxury'>('Modern');
  const [colorMood, setColorMood] = useState<'Vibrant' | 'Pastel' | 'Dark' | 'Light'>('Vibrant');
  const [mockupPlacement, setMockupPlacement] = useState<'Studio Backdrop' | 'Tabletop' | 'Model Wearing' | 'Outdoor'>('Studio Backdrop');

  // Edit / Input File State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RemoveBG States
  const [removeBgFile, setRemoveBgFile] = useState<File | null>(null);
  const [removeBgPreview, setRemoveBgPreview] = useState('');
  const [removeBgPrompt, setRemoveBgPrompt] = useState('');
  const [removeBgAspectRatio, setRemoveBgAspectRatio] = useState('original');
  const removeBgInputRef = useRef<HTMLInputElement>(null);

  // Inspiration State
  const [inspirationCategory, setInspirationCategory] = useState(INSPIRATION_CATEGORIES[0].id);

  // Generation & Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [resultImage, setResultImage] = useState<GenerateImageResult | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Load default prompt when tool changes
  useEffect(() => {
    if (selectedTool) {
      const preset = IMAGE_PROMPT_PRESETS.find((p) => p.category === selectedTool);
      if (preset && !prompt) {
        setPrompt(preset.prompt);
      }
    }
  }, [selectedTool]);

  // Live timer
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

  const handleSelectTool = (toolId: ImageEndpoint) => {
    setSelectedTool(toolId);
    const preset = IMAGE_PROMPT_PRESETS.find((p) => p.category === toolId);
    if (preset) setPrompt(preset.prompt);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setUploadedPreview(url);
    }
  };

  const handleRemoveBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRemoveBgFile(file);
      const url = URL.createObjectURL(file);
      setRemoveBgPreview(url);
    }
  };

  // ── Generation Trigger ──
  const handleGenerate = async () => {
    if (!selectedTool) return;
    if (!prompt.trim() && selectedTool !== 'inpainting') {
      alert(t('Vui lòng nhập mô tả ảnh!', 'Please enter an image prompt!'));
      return;
    }

    try {
      setIsGenerating(true);
      setResultImage(null);

      let res: GenerateImageResult;

      switch (selectedTool) {
        case 'photorealistic':
          res = await imageService.generatePhotorealistic({
            prompt,
            aspect_ratio: aspectRatio,
            negative_prompt: negativePrompt || undefined,
            lighting,
            camera_angle: cameraAngle,
          });
          break;

        case 'stylized':
          res = await imageService.generateStylized({
            prompt,
            aspect_ratio: aspectRatio,
            style_preset: stylePreset,
            negative_prompt: negativePrompt || undefined,
          });
          break;

        case 'logo':
          res = await imageService.generateLogo({
            brand_name: prompt,
            industry: 'Technology',
            style: logoStyle,
            aspect_ratio: aspectRatio,
          });
          break;

        case 'background':
          res = await imageService.generateBackground({
            theme: prompt,
            aspect_ratio: aspectRatio,
            color_mood: colorMood,
          });
          break;

        case 'mockup':
          res = await imageService.generateMockup({
            scene_description: prompt,
            aspect_ratio: aspectRatio,
            placement_type: mockupPlacement,
          });
          break;

        case 'style-transfer':
        case 'object-edit':
        case 'inpainting':
        case 'composition':
          {
            const editRes = await imageService.editImage({
              image_file: uploadedFile || undefined,
              prompt: prompt || 'Edit image realistically',
              edit_mode: selectedTool === 'object-edit' ? 'object-edit' : selectedTool === 'inpainting' ? 'inpainting' : 'style-transfer',
              aspect_ratio: aspectRatio,
            });
            res = {
              image_url: editRes.image_url,
              file_id: editRes.file_id,
              prompt_used: prompt,
              aspect_ratio: aspectRatio,
            };
          }
          break;

        default:
          res = await imageService.generateImage({
            prompt,
            category: selectedTool,
            aspect_ratio: aspectRatio,
            negative_prompt: negativePrompt || undefined,
          });
          break;
      }

      setResultImage(res);
      refreshSubscription();
    } catch (err: any) {
      console.error('Image generate error:', err);
      alert(err.message || t('Tạo ảnh thất bại, vui lòng thử lại', 'Image generation failed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteRemoveBg = async () => {
    if (!removeBgFile) {
      alert(t('Vui lòng tải ảnh cần xóa nền!', 'Please upload an image!'));
      return;
    }
    try {
      setIsGenerating(true);
      setResultImage(null);
      const res = await imageService.removeBackground({
        file: removeBgFile,
        prompt: removeBgPrompt || undefined,
        aspect_ratio: removeBgAspectRatio !== 'original' ? removeBgAspectRatio : undefined,
      });
      setResultImage({
        image_url: res.cutout_url,
        prompt_used: 'Remove Background',
        aspect_ratio: 'original',
      });
      refreshSubscription();
    } catch (err: any) {
      console.error('RemoveBG error:', err);
      alert(err.message || t('Xóa nền thất bại!', 'Failed to remove background'));
    } finally {
      setIsGenerating(false);
    }
  };

  const activeToolConfig = CUSTOM_TOOLS.find((t) => t.id === selectedTool);

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 pt-2 pb-24 space-y-4">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION HEADER (Tools | Remove BG | Inspiration)
          ───────────────────────────────────────────────────────────── */}
      <div
        className={`p-1 rounded-2xl border flex items-center gap-1 backdrop-blur-xl ${
          isDark ? 'bg-[#0E111A]/90 border-slate-800/80 shadow-md' : 'bg-white/90 border-slate-200 shadow-sm'
        }`}
      >
        {[
          { id: 'tools' as MainViewMode, icon: Wand2, labelVi: '10 Công Cụ', labelEn: '10 Tools' },
          { id: 'removebg' as MainViewMode, icon: Scissors, labelVi: 'Xóa Nền', labelEn: 'Remove BG' },
          { id: 'inspiration' as MainViewMode, icon: Compass, labelVi: 'Cảm Hứng', labelEn: 'Inspiration' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = mainView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMainView(tab.id);
                if (tab.id !== 'tools') setSelectedTool(null);
              }}
              className={`flex-1 py-2 px-1 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                isActive
                  ? isDark
                    ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                    : 'bg-black text-white shadow-sm scale-[1.02]'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{isVietnamese ? tab.labelVi : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. VIEW MODE 1: 10 CUSTOM TOOLS (2-Row Square Cards Grid or Form)
          ───────────────────────────────────────────────────────────── */}
      {mainView === 'tools' && (
        <div className="space-y-4">
          {!selectedTool ? (
            // ── Grid View: 10 Tool Cards — Web parity (GeminiImageModal style) ──
            <div className="space-y-4 animate-in fade-in duration-200">

              {/* ── Glass Container: header + grid (matches web rounded-[30px] glass panel) ── */}
              <div
                className={`rounded-[30px] border p-4 sm:p-5 backdrop-blur-2xl ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'border-white/80 bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.60)]'
                }`}
              >
                {/* Header: Sparkles gradient icon + CUSTOM TOOLS label + title */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-[18px] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-[0.24em] ${
                      isDark ? 'text-fuchsia-200/70' : 'text-fuchsia-700/70'
                    }`}>
                      Custom Tools
                    </p>
                    <h3 className={`text-lg sm:text-xl font-semibold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {t('10 AI tools studio', '10 AI tools studio')}
                    </h3>
                  </div>
                </div>

                {/* Tool Cards Grid: 2 cols mobile / 5 cols sm+ — matching web xl:grid-cols-5 */}
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
                  {CUSTOM_TOOLS.map((tool) => {
                    const Icon = tool.icon;
                    const isSelected = selectedTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => handleSelectTool(tool.id)}
                        className={`relative overflow-hidden rounded-[26px] border p-4 text-left transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? isDark
                              ? 'border-cyan-400/45 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.28),0_24px_48px_rgba(0,0,0,0.22)]'
                              : 'border-cyan-300 bg-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_18px_34px_rgba(15,23,42,0.08)]'
                            : isDark
                              ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                              : 'border-white/80 bg-white/80 hover:bg-white'
                        }`}
                      >
                        {/* Icon — semi-transparent bg matching web iconBg pattern */}
                        <div className={`w-12 h-12 rounded-2xl mb-3 flex items-center justify-center ${tool.iconBg}`}>
                          <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                        </div>
                        {/* Title */}
                        <p className={`text-sm font-semibold ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {isVietnamese ? tool.nameVi : tool.nameEn}
                        </p>
                        {/* Description */}
                        <p className={`mt-2 text-xs leading-5 ${
                          isDark ? 'text-white/65' : 'text-gray-600'
                        }`}>
                          {isVietnamese ? tool.descVi : tool.descEn}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Inspiration Presets Strip — outside glass container */}
              <div className="space-y-2">
                <span className={`text-[11px] font-black uppercase tracking-wider px-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  💡 {t('Gợi ý Prompt phổ biến', 'Popular Prompt Presets')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {IMAGE_PROMPT_PRESETS.slice(0, 4).map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        handleSelectTool(preset.category);
                        setPrompt(preset.prompt);
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all active:scale-98 flex items-start gap-2.5 ${
                        isDark
                          ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isDark ? 'text-fuchsia-400' : 'text-fuchsia-600'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-semibold truncate ${
                          isDark ? 'text-white' : 'text-slate-800'
                        }`}>
                          {isVietnamese ? preset.labelVi : preset.labelEn}
                        </div>
                        <div className={`text-[11px] line-clamp-2 mt-0.5 font-mono ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {preset.prompt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // ── Form View: Selected Tool Editing Form ──
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Back to Tools Button Bar */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedTool(null)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all active:scale-95 ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('Tất cả công cụ', 'All Tools')}</span>
                </button>

                {activeToolConfig && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1.5 rounded-xl bg-gradient-to-tr ${activeToolConfig.iconBg} text-white shadow-sm`}
                    >
                      <activeToolConfig.icon className="w-4 h-4" />
                    </span>
                    <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {isVietnamese ? activeToolConfig.nameVi : activeToolConfig.nameEn}
                    </span>
                  </div>
                )}
              </div>

              {/* Aspect Ratio Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  📐 {t('Tỉ lệ khung hình (Aspect Ratio)', 'Aspect Ratio')}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {ASPECT_RATIOS.map((ar) => (
                    <button
                      key={ar.value}
                      type="button"
                      onClick={() => setAspectRatio(ar.value)}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-0.5 border ${
                        aspectRatio === ar.value
                          ? isDark
                            ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-md shadow-rose-500/25'
                            : 'bg-black text-white border-black'
                          : isDark
                          ? 'bg-[#121522] border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="text-xs">{ar.icon}</span>
                      <span className="text-[10px]">{ar.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Input File for Edit Tools (Style-transfer, Object-edit, Inpainting, Composition) */}
              {activeToolConfig?.type === 'editing' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    🖼️ {t('Tải ảnh nguồn để chỉnh sửa', 'Upload Source Image')}
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black/40 flex items-center justify-center max-h-56">
                      <img src={uploadedPreview} alt="Uploaded" className="object-contain max-h-56 w-full" />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute top-2 right-2 px-3 py-1 rounded-xl bg-black/80 text-white text-xs font-bold backdrop-blur-md border border-white/20"
                      >
                        {t('Đổi ảnh khác', 'Change Image')}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full py-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                        isDark
                          ? 'border-slate-700 hover:border-rose-500 bg-slate-800/30'
                          : 'border-slate-300 hover:border-black bg-slate-50'
                      }`}
                    >
                      <Upload className="w-6 h-6 text-[#FF2D55]" />
                      <span className="text-xs font-bold text-slate-300">
                        {t('Bấm để tải ảnh lên (PNG, JPG, WEBP)', 'Click to upload image')}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Main Prompt Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    ✍️ {t('Mô tả hình ảnh (Prompt)', 'Image Prompt')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const preset = IMAGE_PROMPT_PRESETS.find((p) => p.category === selectedTool);
                      if (preset) setPrompt(preset.prompt);
                    }}
                    className="text-[10px] font-bold text-cyan-400 hover:underline"
                  >
                    {t('Nạp mẫu chuẩn', 'Load Preset')}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t(
                    'Mô tả chi tiết đối tượng, màu sắc, phong cách, ánh sáng, góc máy...',
                    'Describe your subject, style, lighting, camera angle in detail...'
                  )}
                  className={`w-full p-3.5 rounded-2xl text-xs leading-relaxed border transition-all resize-none focus:outline-none ${
                    isDark
                      ? 'bg-[#121522] border-slate-800 text-white placeholder-slate-500 focus:border-rose-500'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-black'
                  }`}
                />
              </div>

              {/* Advanced Controls Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((p) => !p)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showAdvanced ? t('Ẩn tùy chọn nâng cao', 'Hide Advanced Options') : t('Tùy chọn nâng cao (Ánh sáng, Góc máy, Preset)', 'Advanced Options')}</span>
                </button>

                {showAdvanced && (
                  <div
                    className={`mt-2.5 p-3.5 rounded-2xl border space-y-3 animate-in fade-in duration-150 ${
                      isDark ? 'bg-[#121522]/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Lighting */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">💡 {t('Ánh sáng', 'Lighting')}</label>
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {['Cinematic', 'Studio Rim', 'Golden Hour', 'Neon Cyber', 'Soft Natural', 'Dark Moody'].map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setLighting(l)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border ${
                              lighting === l
                                ? 'bg-rose-500 text-white border-rose-500'
                                : isDark
                                ? 'bg-slate-800 border-slate-700 text-slate-300'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Camera Angle */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">📷 {t('Góc máy', 'Camera Angle')}</label>
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {['Eye Level', 'Close-up 85mm', 'Wide Angle 24mm', 'Low Angle Hero', 'Top Down Flatlay'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCameraAngle(c)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border ${
                              cameraAngle === c
                                ? 'bg-rose-500 text-white border-rose-500'
                                : isDark
                                ? 'bg-slate-800 border-slate-700 text-slate-300'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Negative Prompt */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">🚫 {t('Loại trừ (Negative Prompt)', 'Negative Prompt')}</label>
                      <input
                        type="text"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="blur, low quality, distorted, extra limbs, watermark..."
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none ${
                          isDark ? 'bg-[#0E111A] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button: Generate Image */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 ${
                  isDark
                    ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-rose-500/30'
                    : 'bg-black text-white shadow-slate-900/20'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('Đang tạo ảnh AI...', 'Generating image...')} ({elapsedTime}s)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t('✨ Tạo Ảnh AI Ngay', '✨ Generate AI Image')}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. VIEW MODE 2: REMOVE BACKGROUND (Cutout Tool)
          ───────────────────────────────────────────────────────────── */}
      {mainView === 'removebg' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="px-1">
            <h2 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ✂️ {t('Tách Nền Ảnh Chuyên Nghiệp (Remove BG)', 'Instant Background Remover')}
            </h2>
            <p className="text-[11px] text-slate-400">
              {t('Tự động cắt chủ thể sắc nét pixel-perfect với AI', 'Auto cutout subjects with pixel-perfect AI precision')}
            </p>
          </div>

          <input
            ref={removeBgInputRef}
            type="file"
            accept="image/*"
            onChange={handleRemoveBgUpload}
            className="hidden"
          />

          {removeBgPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black/40 flex items-center justify-center max-h-64">
              <img src={removeBgPreview} alt="Remove BG Input" className="object-contain max-h-64 w-full" />
              <button
                type="button"
                onClick={() => removeBgInputRef.current?.click()}
                className="absolute top-2 right-2 px-3 py-1 rounded-xl bg-black/80 text-white text-xs font-bold backdrop-blur-md border border-white/20"
              >
                {t('Đổi ảnh', 'Change')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => removeBgInputRef.current?.click()}
              className={`w-full py-12 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2.5 transition-all ${
                isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-300 bg-slate-50'
              }`}
            >
              <Scissors className="w-8 h-8 text-[#FF2D55]" />
              <span className="text-xs font-bold text-slate-200">
                {t('Tải ảnh chân dung hoặc sản phẩm cần tách nền', 'Upload portrait or product photo to remove background')}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExecuteRemoveBg}
            disabled={isGenerating || !removeBgFile}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 ${
              isDark
                ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-rose-500/30'
                : 'bg-black text-white shadow-slate-900/20'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('Đang xử lý tách nền...', 'Removing background...')} ({elapsedTime}s)</span>
              </>
            ) : (
              <>
                <Scissors className="w-4 h-4" />
                <span>{t('✂️ Tách Nền Trong Suốt Ngay', '✂️ Cutout Subject Now')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. VIEW MODE 3: INSPIRATION GALLERY
          ───────────────────────────────────────────────────────────── */}
      {mainView === 'inspiration' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="px-1">
            <h2 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              🎨 {t('Thư Viện Cảm Hứng & Mẫu Prompt', 'Inspiration Gallery & Prompt Library')}
            </h2>
            <p className="text-[11px] text-slate-400">
              {t('Khám phá các phong cách ảnh thịnh hành và sao chép câu lệnh tạo ảnh', 'Explore trending styles and copy prompt formulas')}
            </p>
          </div>

          {/* Categories Strip */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {INSPIRATION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setInspirationCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  inspirationCategory === cat.id
                    ? isDark
                      ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-sm'
                      : 'bg-black text-white border-black'
                    : isDark
                    ? 'bg-[#121522] border-slate-800 text-slate-400'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                {isVietnamese ? cat.labelVi : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Inspiration Presets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {IMAGE_PROMPT_PRESETS.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border space-y-2.5 flex flex-col justify-between ${
                  isDark ? 'bg-[#121522] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">
                      {isVietnamese ? item.labelVi : item.labelEn}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-2 bg-[#090B12] p-2.5 rounded-xl border border-white/5 line-clamp-3">
                    {item.prompt}
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(item.prompt);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 active:scale-95 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isCopied ? t('Đã sao chép!', 'Copied!') : t('Sao chép Prompt', 'Copy Prompt')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMainView('tools');
                      handleSelectTool(item.category);
                      setPrompt(item.prompt);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 active:scale-95 ${
                      isDark
                        ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-sm'
                        : 'bg-black text-white'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{t('Dùng Mẫu Này', 'Use This')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. RESULT CARD & LIGHTBOX PREVIEW (When Image is Ready)
          ───────────────────────────────────────────────────────────── */}
      {resultImage?.image_url && (
        <div
          className={`p-4 rounded-3xl border space-y-3 animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-[#121522] border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {t('Tạo ảnh hoàn tất!', 'Image generated successfully!')}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black/60 cursor-pointer group flex items-center justify-center"
          >
            <img
              src={resultImage.image_url}
              alt="Generated AI"
              className="w-full max-h-96 object-contain group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                if (resultImage.image_url) {
                  await saveAndShareMedia(
                    resultImage.image_url,
                    `wynmotion_image_${Date.now()}.png`
                  );
                }
              }}
              className={`flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${
                isDark
                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-md shadow-rose-500/25'
                  : 'bg-black text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('Tải Về Máy', 'Download Image')}</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (resultImage.image_url) {
                  await saveAndShareMedia(
                    resultImage.image_url,
                    `wynmotion_image_${Date.now()}.png`
                  );
                }
              }}
              className={`px-4 py-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t('Chia Sẻ', 'Share')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && resultImage?.image_url && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-black text-white">Full Resolution Preview</span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img
              src={resultImage.image_url}
              alt="Fullscreen"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
