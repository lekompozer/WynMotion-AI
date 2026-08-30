'use client';

/**
 * AiImagesTab.tsx — WynMotion-AI iOS & Mobile Image Studio
 *
 * Full Parity with Web GeminiImageModal (Studio + 10 Tools + Remove BG):
 * - Studio View with Session Management, Character & Object Reference uploads, and History
 * - Extra & Aspect Ratio dropdown (with ChevronDown) in 1 horizontal row
 * - Plan ID hidden on Mobile/iOS Studio
 * - 10 Custom Tools rendered in 2-row square cards layout with dedicated forms
 * - Seamless Remove Background tool
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
  X,
  CheckCircle2,
  Plus,
  Maximize2,
  ArrowLeft,
  Upload,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import {
  imageService,
  ImageEndpoint,
  AspectRatio,
  IMAGE_PROMPT_PRESETS,
  GenerateImageResult,
} from '@/services/imageService';
import { saveAndShareMedia } from '@/utils/mediaSaveHelper';

type MainViewMode = 'studio' | 'tools' | 'removebg';

interface ToolConfig {
  id: ImageEndpoint;
  icon: typeof Camera;
  iconBg: string;
  iconColor: string;
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
    descEn: 'Create artistic stylized images (anime, watercolor...)',
    type: 'generation',
  },
  {
    id: 'logo',
    icon: Type,
    iconBg: 'bg-amber-500/12',
    iconColor: 'text-amber-500',
    nameVi: 'Thiết Kế Logo',
    nameEn: 'Logo Design',
    badgeVi: 'Vector & Typo',
    badgeEn: 'Vector & Typo',
    descVi: 'Thiết kế logo thương hiệu với typography',
    descEn: 'Design brand logos with typography',
    type: 'generation',
  },
  {
    id: 'background',
    icon: ImageIcon,
    iconBg: 'bg-emerald-500/12',
    iconColor: 'text-emerald-500',
    nameVi: 'Background',
    nameEn: 'Background',
    badgeVi: 'Wallpaper',
    badgeEn: 'Wallpaper',
    descVi: 'Tạo hình nền, texture, backdrop quảng cáo',
    descEn: 'Generate wallpapers, textures, ad backdrops',
    type: 'generation',
  },
  {
    id: 'mockup',
    icon: Package,
    iconBg: 'bg-violet-500/12',
    iconColor: 'text-violet-500',
    nameVi: 'Mockup Sản Phẩm',
    nameEn: 'Product Mockup',
    badgeVi: 'E-commerce',
    badgeEn: 'E-commerce',
    descVi: 'Đặt sản phẩm vào bối cảnh studio chuyên nghiệp',
    descEn: 'Place products in professional studio settings',
    type: 'generation',
  },
  {
    id: 'sequential',
    icon: Film,
    iconBg: 'bg-rose-500/12',
    iconColor: 'text-rose-500',
    nameVi: 'Truyện Tranh AI',
    nameEn: 'Sequential Art',
    badgeVi: 'Comic / Manga',
    badgeEn: 'Comic / Manga',
    descVi: 'Tạo storyboard, truyện tranh từ kịch bản',
    descEn: 'Create storyboards and comics from scripts',
    type: 'generation',
  },
  {
    id: 'style-transfer',
    icon: Wand2,
    iconBg: 'bg-indigo-500/12',
    iconColor: 'text-indigo-500',
    nameVi: 'Chuyển Phong Cách',
    nameEn: 'Style Transfer',
    badgeVi: 'AI Filter',
    badgeEn: 'AI Filter',
    descVi: 'Chuyển ảnh sang phong cách nghệ thuật khác',
    descEn: 'Transform images into different art styles',
    type: 'editing',
  },
  {
    id: 'object-edit',
    icon: Edit3,
    iconBg: 'bg-cyan-500/12',
    iconColor: 'text-cyan-500',
    nameVi: 'Sửa Chi Tiết',
    nameEn: 'Object Edit',
    badgeVi: 'Smart Edit',
    badgeEn: 'Smart Edit',
    descVi: 'Thêm, xóa, thay đổi đối tượng trong ảnh',
    descEn: 'Add, remove, or modify objects in images',
    type: 'editing',
  },
  {
    id: 'inpainting',
    icon: Scissors,
    iconBg: 'bg-teal-500/12',
    iconColor: 'text-teal-500',
    nameVi: 'Vẽ Lại Vùng Chọn',
    nameEn: 'Inpainting',
    badgeVi: 'Magic Fill',
    badgeEn: 'Magic Fill',
    descVi: 'Vẽ lại hoặc thay thế vùng chọn trên ảnh',
    descEn: 'Redraw or replace selected areas in images',
    type: 'editing',
  },
  {
    id: 'composition',
    icon: Layers,
    iconBg: 'bg-purple-500/12',
    iconColor: 'text-purple-500',
    nameVi: 'Ghép Ảnh AI',
    nameEn: 'Composition',
    badgeVi: 'AI Blend',
    badgeEn: 'AI Blend',
    descVi: 'Ghép nhiều ảnh thành một bố cục hoàn chỉnh',
    descEn: 'Combine multiple images into one composition',
    type: 'editing',
  },
];

export const AiImagesTab: React.FC = () => {
  const { isDark, isVietnamese, t } = useApp();
  const { user, refreshSubscription } = useWordaiAuth();

  // Navigation mode: Studio (Default) | Tools | RemoveBG
  const [mainView, setMainView] = useState<MainViewMode>('studio');
  const [selectedTool, setSelectedTool] = useState<ImageEndpoint | null>(null);

  // ── Studio State ──
  const [studioPrompt, setStudioPrompt] = useState('');
  const [studioAspectRatio, setStudioAspectRatio] = useState<string>('16:9');
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [extraImages, setExtraImages] = useState<File[]>([]);
  const [extraImageUrls, setExtraImageUrls] = useState<string[]>([]);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [uploadRoleForRef, setUploadRoleForRef] = useState<'character' | 'object'>('character');
  const extraImagesRef = useRef<HTMLInputElement>(null);
  const sessionFileInputRef = useRef<HTMLInputElement>(null);

  // ── Tools State ──
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [lighting, setLighting] = useState<'Natural' | 'Studio' | 'Cinematic' | 'Golden Hour'>('Cinematic');
  const [cameraAngle, setCameraAngle] = useState<'Wide Angle' | 'Macro' | 'Drone View' | 'Eye Level'>('Eye Level');
  const [stylePreset, setStylePreset] = useState<'Anime' | 'Watercolor' | 'Oil Painting' | 'Flat Design' | '3D Render' | 'Sticker Art'>('3D Render');
  const [logoStyle, setLogoStyle] = useState<'Modern' | 'Minimalist' | 'Vintage' | 'Luxury'>('Modern');
  const [colorMood, setColorMood] = useState<'Dark' | 'Light' | 'Pastel' | 'Vibrant'>('Vibrant');
  const [mockupPlacement, setMockupPlacement] = useState<'Tabletop' | 'Model Wearing' | 'Outdoor' | 'Studio Backdrop'>('Studio Backdrop');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── RemoveBG State ──
  const [removeBgFile, setRemoveBgFile] = useState<File | null>(null);
  const [removeBgPreview, setRemoveBgPreview] = useState<string | null>(null);
  const [removeBgPrompt, setRemoveBgPrompt] = useState('');
  const [removeBgAspectRatio, setRemoveBgAspectRatio] = useState('original');
  const removeBgInputRef = useRef<HTMLInputElement>(null);

  // ── Generation & Output State ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [resultImage, setResultImage] = useState<GenerateImageResult | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

  // Load Sessions on Mount
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      setIsSessionLoading(true);
      const sessions = await imageService.listSessions();
      if (Array.isArray(sessions)) {
        setAllSessions(sessions);
        if (sessions.length > 0) {
          const firstDetail = await imageService.getSession(sessions[0].session_id);
          setCurrentSession(firstDetail);
          if (firstDetail.images?.length > 0) {
            const lastImg = firstDetail.images[firstDetail.images.length - 1];
            setActivePreviewUrl(lastImg.file_url);
          }
        }
      }
    } catch (_) {
    } finally {
      setIsSessionLoading(false);
    }
  };

  const handleCreateNewSession = async () => {
    if (!user) return;
    try {
      setIsSessionLoading(true);
      const newSession = await imageService.createSession(t('Session mới', 'New Session'));
      setCurrentSession(newSession);
      setAllSessions((prev) => [
        {
          session_id: newSession.session_id,
          title: newSession.title,
          images_count: 0,
          preview_url: null,
          created_at: newSession.created_at,
          updated_at: newSession.updated_at,
        },
        ...prev,
      ]);
      setActivePreviewUrl(null);
      setResultImage(null);
    } catch (err: any) {
      alert(err.message || t('Không thể tạo session mới', 'Failed to create session'));
    } finally {
      setIsSessionLoading(false);
    }
  };

  const handleUploadToSession = async (files: File[], role: 'character' | 'object') => {
    if (!user || files.length === 0) return;
    setIsSessionLoading(true);
    try {
      let sessionId = currentSession?.session_id;
      if (!sessionId) {
        const newSession = await imageService.createSession(t('Session mới', 'New Session'));
        sessionId = newSession.session_id;
        setAllSessions((prev) => [
          {
            session_id: newSession.session_id,
            title: newSession.title,
            images_count: 0,
            preview_url: null,
            created_at: newSession.created_at,
            updated_at: newSession.updated_at,
          },
          ...prev,
        ]);
      }
      const updated = await imageService.uploadSessionReferences(sessionId, files, role);
      setCurrentSession(updated);
    } catch (err: any) {
      alert(err.message || t('Không thể upload ảnh tham chiếu', 'Failed to upload reference'));
    } finally {
      setIsSessionLoading(false);
    }
  };

  const handleDeleteSessionImage = async (imageIndex: number) => {
    if (!user || !currentSession) return;
    try {
      await imageService.deleteSessionImage(currentSession.session_id, imageIndex);
      const updated = await imageService.getSession(currentSession.session_id);
      setCurrentSession(updated);
      if (updated.images?.length > 0) {
        setActivePreviewUrl(updated.images[updated.images.length - 1].file_url);
      } else {
        setActivePreviewUrl(null);
      }
    } catch (err: any) {
      alert(err.message || t('Không thể xóa ảnh', 'Failed to delete image'));
    }
  };

  const handleAddExtraImages = (files: File[]) => {
    const newUrls = files.map((f) => URL.createObjectURL(f));
    setExtraImages((prev) => [...prev, ...files]);
    setExtraImageUrls((prev) => [...prev, ...newUrls]);
  };

  const handleRemoveExtraImage = (index: number) => {
    URL.revokeObjectURL(extraImageUrls[index]);
    setExtraImages((prev) => prev.filter((_, i) => i !== index));
    setExtraImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Studio Generation Trigger ──
  const handleStudioSubmit = async () => {
    if (!studioPrompt.trim()) {
      alert(t('Vui lòng nhập mô tả ảnh!', 'Please enter an image prompt!'));
      return;
    }

    try {
      setIsGenerating(true);
      setResultImage(null);

      let sessionId = currentSession?.session_id;
      if (!sessionId) {
        const newSession = await imageService.createSession(t('Session mới', 'New Session'));
        sessionId = newSession.session_id;
        setCurrentSession(newSession);
        setAllSessions((prev) => [
          {
            session_id: newSession.session_id,
            title: newSession.title,
            images_count: 0,
            preview_url: null,
            created_at: newSession.created_at,
            updated_at: newSession.updated_at,
          },
          ...prev,
        ]);
      }

      const res = await imageService.generateInSession(sessionId, {
        prompt: studioPrompt.trim(),
        aspect_ratio: studioAspectRatio,
        extra_images: extraImages.length > 0 ? extraImages : undefined,
        extra_role: extraImages.length > 0 ? 'object' : undefined,
      });

      const imageUrl = res.file_url || res.image_url;
      setActivePreviewUrl(imageUrl);
      setResultImage({
        image_url: imageUrl,
        prompt_used: studioPrompt.trim(),
        aspect_ratio: studioAspectRatio as AspectRatio,
      });

      // Clear extra images
      extraImageUrls.forEach((u) => URL.revokeObjectURL(u));
      setExtraImages([]);
      setExtraImageUrls([]);

      // Refresh current session
      const updatedSession = await imageService.getSession(sessionId);
      setCurrentSession(updatedSession);
      refreshSubscription();
    } catch (err: any) {
      console.error('Studio generate error:', err);
      alert(err.message || t('Tạo ảnh thất bại, vui lòng thử lại', 'Image generation failed'));
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Tools Selection & File Handlers ──
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

  // ── Tools Generation Trigger ──
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

  const characterRefs = currentSession?.images?.filter((img: any) => img.role === 'character') || [];
  const objectRefs = currentSession?.images?.filter((img: any) => img.role === 'object') || [];
  const generatedHistory = currentSession?.images?.filter((img: any) => img.role === 'generated') || [];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 pt-2 pb-24 space-y-4">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION HEADER (Studio | 10 Tools | Remove BG)
          ───────────────────────────────────────────────────────────── */}
      <div
        className={`p-1 rounded-2xl border flex items-center gap-1 backdrop-blur-xl ${
          isDark ? 'bg-[#0E111A]/90 border-slate-800/80 shadow-md' : 'bg-white/90 border-slate-200 shadow-sm'
        }`}
      >
        {[
          { id: 'studio' as MainViewMode, icon: Sparkles, labelVi: 'Studio', labelEn: 'Studio' },
          { id: 'tools' as MainViewMode, icon: Wand2, labelVi: '10 Công Cụ', labelEn: '10 Tools' },
          { id: 'removebg' as MainViewMode, icon: Scissors, labelVi: 'Xóa Nền', labelEn: 'Remove BG' },
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

      {/* Hidden file inputs for session & extra uploads */}
      <input
        ref={sessionFileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) handleUploadToSession(files, uploadRoleForRef);
          e.target.value = '';
        }}
      />
      <input
        ref={extraImagesRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) handleAddExtraImages(files);
          e.target.value = '';
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. VIEW MODE 1: STUDIO (Web Parity with Session & Clean Controls)
          ───────────────────────────────────────────────────────────── */}
      {mainView === 'studio' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Main Hero & Preview Canvas Card */}
          <div
            className={`rounded-[28px] border overflow-hidden backdrop-blur-2xl ${
              isDark
                ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border-white/80 bg-white/75 shadow-lg'
            }`}
          >
            {/* Header: Session Status & Actions */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs font-bold truncate">
                  {currentSession?.title || t('Studio Sáng Tạo', 'Creative Studio')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCreateNewSession}
                disabled={isSessionLoading}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 active:scale-95 ${
                  isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-white text-slate-800'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>{t('Session Mới', 'New Session')}</span>
              </button>
            </div>

            {/* Canvas Display */}
            <div className="p-3 sm:p-4">
              <div
                className={`relative rounded-2xl overflow-hidden min-h-[220px] sm:min-h-[300px] flex items-center justify-center border ${
                  isDark ? 'bg-black/50 border-white/5' : 'bg-slate-100 border-slate-200'
                }`}
              >
                {activePreviewUrl ? (
                  <div className="relative group w-full flex items-center justify-center">
                    <img
                      src={activePreviewUrl}
                      alt="Studio Preview"
                      className="max-h-[360px] w-auto max-w-full object-contain rounded-xl cursor-pointer"
                      onClick={() => {
                        setResultImage({
                          image_url: activePreviewUrl,
                          prompt_used: studioPrompt || 'Studio Image',
                          aspect_ratio: studioAspectRatio as AspectRatio,
                        });
                        setIsLightboxOpen(true);
                      }}
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-90">
                      <button
                        type="button"
                        onClick={async () => {
                          await saveAndShareMedia(activePreviewUrl, `wynmotion_studio_${Date.now()}.png`);
                        }}
                        className="p-2 rounded-xl bg-black/70 backdrop-blur-md text-white border border-white/15 active:scale-95 shadow-md"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResultImage({
                            image_url: activePreviewUrl,
                            prompt_used: studioPrompt || 'Studio Image',
                            aspect_ratio: studioAspectRatio as AspectRatio,
                          });
                          setIsLightboxOpen(true);
                        }}
                        className="p-2 rounded-xl bg-black/70 backdrop-blur-md text-white border border-white/15 active:scale-95 shadow-md"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 flex items-center justify-center mb-3">
                      <Sparkles className="w-6 h-6 text-fuchsia-400" />
                    </div>
                    <p className="text-xs font-bold text-white/90">
                      {t('WynMotion AI Studio Sẵn Sàng', 'WynMotion AI Studio Ready')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      {t('Nhập prompt hoặc tải ảnh nhân vật tham chiếu để bắt đầu tạo ảnh chất lượng cao.', 'Enter a prompt or upload reference characters to generate images.')}
                    </p>
                  </div>
                )}

                {/* Live Generation Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4">
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-5 text-center shadow-2xl">
                      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-cyan-300" />
                      <p className="text-sm font-bold text-white">{t('Đang tạo ảnh AI...', 'Generating AI image...')}</p>
                      <p className="text-2xl font-black mt-1 text-white">{elapsedTime}s</p>
                      <p className="text-[11px] mt-1 text-white/70">{t('Studio đang phân tích & vẽ chi tiết', 'Studio is rendering artwork')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reference Images Section (Character + Object) */}
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {/* Character Reference Box */}
                <div className={`p-2.5 rounded-2xl border ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-fuchsia-400">
                      👤 {t('Nhân vật', 'Character')} ({characterRefs.length}/4)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadRoleForRef('character');
                        sessionFileInputRef.current?.click();
                      }}
                      className="text-[10px] font-bold text-fuchsia-300 hover:text-fuchsia-200 flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> {t('Thêm', 'Add')}
                    </button>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none min-h-[44px]">
                    {characterRefs.length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic py-2">{t('Chưa có ảnh', 'No images')}</span>
                    ) : (
                      characterRefs.map((img: any) => (
                        <div key={img.index} className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-white/10 group">
                          <img src={img.file_url} alt="Character ref" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleDeleteSessionImage(img.index)}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 text-rose-400"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Object Reference Box */}
                <div className={`p-2.5 rounded-2xl border ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-cyan-400">
                      📦 {t('Vật thể', 'Object')} ({objectRefs.length}/10)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadRoleForRef('object');
                        sessionFileInputRef.current?.click();
                      }}
                      className="text-[10px] font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> {t('Thêm', 'Add')}
                    </button>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none min-h-[44px]">
                    {objectRefs.length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic py-2">{t('Chưa có ảnh', 'No images')}</span>
                    ) : (
                      objectRefs.map((img: any) => (
                        <div key={img.index} className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-white/10 group">
                          <img src={img.file_url} alt="Object ref" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleDeleteSessionImage(img.index)}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 text-rose-400"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Extra Images Chips (One-time) */}
              {extraImageUrls.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  <span className="text-[10px] font-bold text-amber-400 shrink-0">✨ Extra:</span>
                  {extraImageUrls.map((url, idx) => (
                    <div key={idx} className="relative h-8 w-8 shrink-0 rounded-lg overflow-hidden border border-amber-400/40">
                      <img src={url} alt="Extra" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraImage(idx)}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 text-amber-400"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session Generated History Strip */}
            {generatedHistory.length > 0 && (
              <div className="px-4 pb-4 border-t border-white/5 pt-3">
                <p className="text-[11px] font-bold text-slate-400 mb-2">
                  🎞️ {t('Lịch sử Session', 'Session History')} ({generatedHistory.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {generatedHistory.map((img: any) => (
                    <div
                      key={img.index}
                      onClick={() => setActivePreviewUrl(img.file_url)}
                      className={`relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                        activePreviewUrl === img.file_url ? 'border-fuchsia-400 scale-105 shadow-md shadow-fuchsia-500/20' : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.file_url} alt="History" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prompts & Controls Card (Plan ID hidden, Extra + 16:9 in 1 row with ChevronDown) */}
          <div
            className={`rounded-[28px] border p-4 space-y-3 backdrop-blur-2xl ${
              isDark
                ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border-white/80 bg-white/75 shadow-lg'
            }`}
          >
            <div>
              <p className={`text-[10px] uppercase tracking-widest font-black mb-1.5 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                {t('CÂU LỆNH TẠO ẢNH / DESIGN PROMPT', 'DESIGN PROMPT')}
              </p>
              <textarea
                value={studioPrompt}
                onChange={(e) => setStudioPrompt(e.target.value)}
                rows={3}
                className={`w-full resize-none rounded-2xl border px-3.5 py-2.5 text-xs outline-none transition-all ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-cyan-400/60'
                    : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500'
                }`}
                placeholder={t(
                  'Nhập ý tưởng tạo ảnh hoặc mô tả nhân vật, bối cảnh để bắt đầu...',
                  'Enter your ideas or describe character and setting to get started...'
                )}
              />
            </div>

            {/* Extra Button and 16:9 Dropdown in 1 Single Horizontal Row */}
            <div className="flex flex-row items-center gap-2 w-full">
              {/* 1. Extra Button */}
              <button
                type="button"
                onClick={() => extraImagesRef.current?.click()}
                className={`h-11 flex-1 px-3 rounded-2xl font-semibold text-xs border transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                  isDark
                    ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>{t('Extra', 'Extra')}</span>
                {extraImages.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                    {extraImages.length}
                  </span>
                )}
              </button>

              {/* 2. Aspect Ratio Dropdown Button with ChevronDown Arrow */}
              <div
                className={`h-11 flex-1 rounded-2xl border px-3 flex items-center justify-between relative transition-all ${
                  isDark ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <ImageIcon className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`} />
                  <select
                    value={studioAspectRatio}
                    onChange={(e) => setStudioAspectRatio(e.target.value)}
                    className="w-full bg-transparent outline-none text-xs font-semibold appearance-none cursor-pointer pr-4"
                  >
                    <option value="16:9" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>16:9</option>
                    <option value="1:1" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>1:1</option>
                    <option value="9:16" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>9:16</option>
                    <option value="4:3" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>4:3</option>
                    <option value="3:4" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>3:4</option>
                    <option value="3:2" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>3:2</option>
                    <option value="2:3" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>2:3</option>
                  </select>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none -ml-3" />
              </div>
            </div>

            {/* Send / Generate Button */}
            <button
              type="button"
              onClick={handleStudioSubmit}
              disabled={isGenerating || !studioPrompt.trim()}
              className={`w-full py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 text-white shadow-fuchsia-500/25'
                  : 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-600 text-white shadow-violet-500/25'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('Đang tạo ảnh Studio...', 'Generating Studio...')} ({elapsedTime}s)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('Tạo Ảnh Studio Ngay', 'Generate in Studio')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. VIEW MODE 2: 10 CUSTOM TOOLS (2-Row Square Cards Grid or Form)
          ───────────────────────────────────────────────────────────── */}
      {mainView === 'tools' && (
        <div className="space-y-4">
          {!selectedTool ? (
            // ── Grid View: 10 Tool Cards — Web parity (GeminiImageModal style) ──
            <div className="space-y-4 animate-in fade-in duration-200">
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

                {/* Tool Cards Grid: 2 cols mobile / 5 cols sm+ */}
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
                  {CUSTOM_TOOLS.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => handleSelectTool(tool.id)}
                        className={`group relative rounded-2xl border p-3 text-left transition-all duration-300 flex flex-col justify-between aspect-square active:scale-95 ${
                          isDark
                            ? 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                            : 'border-slate-200/80 bg-white/80 hover:border-slate-300 hover:bg-white shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${tool.iconBg}`}>
                            <Icon className={`w-4 h-4 ${tool.iconColor}`} />
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isVietnamese ? tool.badgeVi : tool.badgeEn}
                          </span>
                        </div>

                        <div>
                          <h4 className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {isVietnamese ? tool.nameVi : tool.nameEn}
                          </h4>
                          <p className={`text-[10px] leading-tight line-clamp-2 mt-0.5 ${
                            isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500'
                          }`}>
                            {isVietnamese ? tool.descVi : tool.descEn}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // ── Form View: Selected Tool Screen ──
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedTool(null)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                    isDark ? 'bg-[#121522] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('Quay Lại Danh Sách', 'Back to Tools')}</span>
                </button>

                <div className="flex items-center gap-2">
                  {activeToolConfig && (
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <activeToolConfig.icon className="w-4 h-4 text-fuchsia-400" />
                      {isVietnamese ? activeToolConfig.nameVi : activeToolConfig.nameEn}
                    </span>
                  )}
                </div>
              </div>

              {/* Upload Input for Editing Tools */}
              {activeToolConfig?.type === 'editing' && (
                <div
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-[#121522] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-fuchsia-400" />
                      {t('Tải Ảnh Gốc Lên Để Chỉnh Sửa', 'Upload Source Image to Edit')}
                    </span>
                    {uploadedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadedPreview(null);
                        }}
                        className="text-[10px] text-rose-400 font-bold"
                      >
                        {t('Xóa ảnh', 'Clear')}
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {uploadedPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-48 flex items-center justify-center bg-black/40">
                      <img src={uploadedPreview} alt="Source" className="max-h-48 object-contain" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full py-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                        isDark ? 'border-slate-800 bg-[#090B12] hover:border-slate-700' : 'border-slate-300 bg-slate-50'
                      }`}
                    >
                      <Upload className="w-6 h-6 text-slate-500" />
                      <span className="text-xs font-bold text-slate-400">
                        {t('Chạm để chọn ảnh từ thư viện', 'Tap to select image from library')}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Tool Specific Form Options */}
              <div
                className={`p-4 rounded-2xl border space-y-4 ${
                  isDark ? 'bg-[#121522] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                {/* Prompt input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-white flex items-center justify-between">
                    <span>{t('Mô tả hình ảnh (Prompt)', 'Image Prompt')}</span>
                    <span className="text-[10px] text-slate-500 font-normal">Tiếng Anh & Việt</span>
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    placeholder={t('Mô tả chi tiết bức ảnh bạn muốn AI tạo...', 'Describe the image you want AI to generate...')}
                    className={`w-full p-3 rounded-xl text-xs font-medium border outline-none resize-none transition-all ${
                      isDark
                        ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600 focus:border-[#FF2D55]'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-black'
                    }`}
                  />
                </div>

                {/* Aspect ratio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-white">{t('Tỉ Lệ Khung Hình', 'Aspect Ratio')}</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-2 rounded-xl text-xs font-black transition-all border ${
                          aspectRatio === ratio
                            ? isDark
                              ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-sm'
                              : 'bg-black text-white border-black'
                            : isDark
                            ? 'bg-[#090B12] border-slate-800 text-slate-400'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific controls */}
                {selectedTool === 'photorealistic' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">{t('Ánh Sáng', 'Lighting')}</label>
                      <select
                        value={lighting}
                        onChange={(e) => setLighting(e.target.value as any)}
                        className={`w-full p-2 rounded-xl text-xs font-bold border outline-none ${
                          isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="Cinematic">Cinematic</option>
                        <option value="Natural">Natural</option>
                        <option value="Studio">Studio</option>
                        <option value="Golden Hour">Golden Hour</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">{t('Góc Chụp', 'Camera Angle')}</label>
                      <select
                        value={cameraAngle}
                        onChange={(e) => setCameraAngle(e.target.value as any)}
                        className={`w-full p-2 rounded-xl text-xs font-bold border outline-none ${
                          isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="Eye Level">Eye Level</option>
                        <option value="Wide Angle">Wide Angle</option>
                        <option value="Macro">Macro 8K</option>
                        <option value="Drone View">Drone View</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedTool === 'stylized' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">{t('Phong Cách', 'Style Preset')}</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Anime', '3D Render', 'Watercolor', 'Oil Painting', 'Flat Design', 'Sticker Art'] as const).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setStylePreset(preset)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all truncate ${
                            stylePreset === preset
                              ? isDark
                                ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55]'
                                : 'bg-black text-white border-black'
                              : isDark
                              ? 'bg-[#090B12] border-slate-800 text-slate-400'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg ${
                    isDark
                      ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-rose-500/25'
                      : 'bg-black text-white shadow-slate-500/25'
                  } disabled:opacity-50`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('Đang vẽ AI...', 'Generating...')} ({elapsedTime}s)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t('Tạo Ảnh Nghệ Thuật Ngay', 'Generate Image Now')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. VIEW MODE 3: REMOVE BACKGROUND TOOL
          ───────────────────────────────────────────────────────────── */}
      {mainView === 'removebg' && (
        <div
          className={`p-4 rounded-3xl border space-y-4 animate-in fade-in duration-200 ${
            isDark ? 'bg-[#121522] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{t('AI Tách Nền Trong Suốt', 'AI Background Remover')}</h3>
              <p className="text-[11px] text-slate-400">
                {t('Tách chủ thể cực nét, trả về ảnh PNG trong suốt độ phân giải gốc', 'Extract subject with precision PNG transparent cutout')}
              </p>
            </div>
          </div>

          <input
            ref={removeBgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleRemoveBgUpload}
          />

          {removeBgPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-64 flex items-center justify-center bg-black/40">
              <img src={removeBgPreview} alt="Target" className="max-h-64 object-contain" />
              <button
                type="button"
                onClick={() => {
                  setRemoveBgFile(null);
                  setRemoveBgPreview(null);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => removeBgInputRef.current?.click()}
              className={`w-full py-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isDark ? 'border-slate-800 bg-[#090B12] hover:border-slate-700' : 'border-slate-300 bg-slate-50'
              }`}
            >
              <Upload className="w-8 h-8 text-teal-400" />
              <span className="text-xs font-black text-white">{t('Tải Ảnh Cần Xóa Nền', 'Upload Image to Cutout')}</span>
              <span className="text-[10px] text-slate-500">PNG, JPG, WEBP lên đến 20MB</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExecuteRemoveBg}
            disabled={isGenerating || !removeBgFile}
            className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg ${
              isDark
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/25'
                : 'bg-teal-600 text-white shadow-teal-500/25'
            } disabled:opacity-50`}
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
