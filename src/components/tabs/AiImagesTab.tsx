'use client';

/**
 * AiImagesTab.tsx — WynMotion-AI iOS & Mobile Image Studio
 *
 * Full Parity with Web GeminiImageModal:
 * - Direct 3-Tab switcher under global AppHeader: Studio | 10 Tools | Remove BG
 * - 100% Light & Dark Theme adaptive colors across all elements
 * - Studio View: Design Prompt, Session Management, Extra Images, and Pixabay Inspiration
 * - 10 Tools: Clean grid leading to 10 dedicated modular form components with all 19+ presets
 * - Streamlined RemoveBG (PNG, JPG, JPEG, WEBP at original aspect ratio & resolution)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  FolderOpen,
  Trash2,
  Search,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { WynMotionUpgradeModal } from '@/components/modals/WynMotionUpgradeModal';
import {
  imageService,
  ImageEndpoint,
  AspectRatio,
  GenerateImageResult,
  PhotorealisticRequest,
  StylizedRequest,
  LogoRequest,
  MockupRequest,
  StyleTransferRequest,
  ObjectEditRequest,
  CompositionRequest,
  SequentialRequest,
  InpaintingRequest,
  BackgroundRequest,
} from '@/services/imageService';
import { saveAndShareMedia } from '@/utils/mediaSaveHelper';

// 10 Modular Form Components
import { PhotorealisticForm } from './image-tools/PhotorealisticForm';
import { StylizedForm } from './image-tools/StylizedForm';
import { LogoForm } from './image-tools/LogoForm';
import { MockupForm } from './image-tools/MockupForm';
import { StyleTransferForm } from './image-tools/StyleTransferForm';
import { ObjectEditForm } from './image-tools/ObjectEditForm';
import { CompositionForm } from './image-tools/CompositionForm';
import { SequentialForm } from './image-tools/SequentialForm';
import { InpaintingForm } from './image-tools/InpaintingForm';
import { BackgroundForm } from './image-tools/BackgroundForm';

type MainViewMode = 'studio' | 'tools' | 'removebg';

interface ToolConfig {
  id: ImageEndpoint;
  icon: any;
  iconBg: string;
  iconColor: string;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  type: 'generation' | 'editing';
}

const PIXABAY_KEY = process.env.NEXT_PUBLIC_PIXABAY_API_KEY || '55048100-e971c09b92fef96aab418bbc1';

const INSPIRATION_TABS = [
  { id: 'ai-images', vi: 'AI Images', en: 'AI Images', query: 'AI art digital illustration' },
  { id: 'ai-women', vi: 'AI Women', en: 'AI Women', query: 'beautiful women portrait AI' },
  { id: 'ai-man', vi: 'AI Man', en: 'AI Man', query: 'handsome men portrait AI' },
  { id: 'anime', vi: 'Anime', en: 'Anime', query: 'anime illustration character' },
  { id: 'nature', vi: 'Thiên nhiên', en: 'Nature', query: 'nature landscape scenery' },
  { id: 'city', vi: 'Thành phố', en: 'City', query: 'city urban architecture night' },
  { id: 'fantasy', vi: 'Fantasy', en: 'Fantasy', query: 'fantasy magical art illustration' },
  { id: 'art', vi: 'Nghệ thuật', en: 'Art', query: 'digital painting concept art' },
  { id: 'portrait', vi: 'Chân dung', en: 'Portrait', query: 'portrait photography face' },
  { id: 'background', vi: 'Background', en: 'Background', query: 'abstract background texture wallpaper' },
  { id: 'fashion', vi: 'Thời trang', en: 'Fashion', query: 'fashion model style outfit' },
  { id: 'food', vi: 'Ẩm thực', en: 'Food', query: 'food photography delicious' },
] as const;

interface PixabayImage {
  id: number;
  webformatURL: string;
  previewURL: string;
  tags: string;
}

// 10 Tools definition matching Web order
const CUSTOM_TOOLS: ToolConfig[] = [
  {
    id: 'photorealistic',
    icon: Camera,
    iconBg: 'bg-blue-500/12',
    iconColor: 'text-blue-500',
    nameVi: 'Ảnh Chân Thực',
    nameEn: 'Photorealistic',
    descVi: 'Tạo ảnh chân thực như chụp bằng máy ảnh',
    descEn: 'Create photorealistic images like real photos',
    type: 'generation',
  },
  {
    id: 'stylized',
    icon: Palette,
    iconBg: 'bg-fuchsia-500/12',
    iconColor: 'text-fuchsia-500',
    nameVi: 'Phong Cách Nghệ Thuật',
    nameEn: 'Stylized Art',
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
    descVi: 'Tạo logo thương hiệu và biểu tượng',
    descEn: 'Create brand logos and icons',
    type: 'generation',
  },
  {
    id: 'object-edit',
    icon: Edit3,
    iconBg: 'bg-violet-500/12',
    iconColor: 'text-violet-500',
    nameVi: 'Chỉnh Sửa Đối Tượng',
    nameEn: 'Object Edit',
    descVi: 'Chỉnh sửa đối tượng cụ thể trong ảnh',
    descEn: 'Edit specific objects in image',
    type: 'editing',
  },
  {
    id: 'composition',
    icon: Layers,
    iconBg: 'bg-emerald-500/12',
    iconColor: 'text-emerald-500',
    nameVi: 'Ghép Ảnh Nâng Cao',
    nameEn: 'Advanced Composition',
    descVi: 'Kết hợp nhiều ảnh thành một composition',
    descEn: 'Combine multiple images into one composition',
    type: 'editing',
  },
  {
    id: 'sequential',
    icon: Film,
    iconBg: 'bg-rose-500/12',
    iconColor: 'text-rose-500',
    nameVi: 'Sequential Art',
    nameEn: 'Sequential Art',
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
    descVi: 'Tạo mockup sản phẩm cho marketing',
    descEn: 'Create product mockups for marketing',
    type: 'generation',
  },
  {
    id: 'style-transfer',
    icon: Wand2,
    iconBg: 'bg-purple-500/12',
    iconColor: 'text-purple-500',
    nameVi: 'Chuyển Phong Cách',
    nameEn: 'Style Transfer',
    descVi: 'Chuyển ảnh thành phong cách nghệ thuật khác',
    descEn: 'Transform image to different artistic style',
    type: 'editing',
  },
  {
    id: 'inpainting',
    icon: Scissors,
    iconBg: 'bg-teal-500/12',
    iconColor: 'text-teal-500',
    nameVi: 'Inpainting',
    nameEn: 'Inpainting',
    descVi: 'Thêm, xóa hoặc thay thế phần tử trong ảnh',
    descEn: 'Add, remove or replace elements in image',
    type: 'editing',
  },
  {
    id: 'background',
    icon: ImageIcon,
    iconBg: 'bg-emerald-500/12',
    iconColor: 'text-emerald-500',
    nameVi: 'Background',
    nameEn: 'Background',
    descVi: 'Tạo background cho UI và wallpaper',
    descEn: 'Create backgrounds for UI and wallpapers',
    type: 'generation',
  },
];

export const AiImagesTab: React.FC = () => {
  const { isDark, isVietnamese, t } = useApp();
  const { user, userSubscription, refreshSubscription } = useWordaiAuth();

  // Auth & Upgrade Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Navigation mode: Studio (Default) | Tools | RemoveBG
  const [mainView, setMainView] = useState<MainViewMode>('studio');
  const [selectedTool, setSelectedTool] = useState<ImageEndpoint | null>(null);

  // ── Studio State ──
  const [studioPrompt, setStudioPrompt] = useState('');
  const [studioAspectRatio, setStudioAspectRatio] = useState<string>('16:9');
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [showSessionPicker, setShowSessionPicker] = useState(false);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [extraImages, setExtraImages] = useState<File[]>([]);
  const [extraImageUrls, setExtraImageUrls] = useState<string[]>([]);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [uploadRoleForRef, setUploadRoleForRef] = useState<'character' | 'object'>('character');
  const extraImagesRef = useRef<HTMLInputElement>(null);
  const sessionFileInputRef = useRef<HTMLInputElement>(null);

  // ── Pixabay Inspiration State ──
  const [inspirationTab, setInspirationTab] = useState<string>('ai-images');
  const [pixabayQuery, setPixabayQuery] = useState('');
  const [pixabayImages, setPixabayImages] = useState<PixabayImage[]>([]);
  const [pixabayPage, setPixabayPage] = useState(1);
  const [pixabayHasMore, setPixabayHasMore] = useState(true);
  const [isPixabayLoading, setIsPixabayLoading] = useState(false);
  const [isPixabayLoadingMore, setIsPixabayLoadingMore] = useState(false);
  const [pixabayPreviewImg, setPixabayPreviewImg] = useState<PixabayImage | null>(null);
  const [addingPixabayIdx, setAddingPixabayIdx] = useState<number | null>(null);

  // ── Streamlined RemoveBG State ──
  const [removeBgFile, setRemoveBgFile] = useState<File | null>(null);
  const [removeBgPreview, setRemoveBgPreview] = useState<string | null>(null);
  const removeBgInputRef = useRef<HTMLInputElement>(null);

  // ── Output & Lightbox State ──
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

  // Fetch Pixabay Inspiration
  const fetchPixabay = useCallback(
    async (query: string, page = 1, append = false) => {
      if (!query.trim()) return;
      if (append) setIsPixabayLoadingMore(true);
      else setIsPixabayLoading(true);

      try {
        const lang = isVietnamese ? 'vi' : 'en';
        const response = await fetch(
          `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=all&lang=${lang}&safesearch=true&order=popular&per_page=20&page=${page}`
        );
        if (!response.ok) throw new Error(`Pixabay status ${response.status}`);
        const data = await response.json();
        const hits: PixabayImage[] = data.hits || [];

        if (append) setPixabayImages((prev) => [...prev, ...hits]);
        else setPixabayImages(hits);

        setPixabayHasMore(hits.length === 20);
        setPixabayPage(page);
      } catch (_) {
      } finally {
        setIsPixabayLoading(false);
        setIsPixabayLoadingMore(false);
      }
    },
    [isVietnamese]
  );

  useEffect(() => {
    if (mainView === 'studio') {
      const tab = INSPIRATION_TABS.find((tb) => tb.id === inspirationTab) || INSPIRATION_TABS[0];
      setPixabayImages([]);
      setPixabayPage(1);
      setPixabayHasMore(true);
      setPixabayQuery('');
      fetchPixabay(tab.query, 1, false);
    }
  }, [inspirationTab, mainView, fetchPixabay]);

  const addPixabayAsReference = async (img: PixabayImage, idx: number) => {
    setAddingPixabayIdx(idx);
    try {
      const res = await fetch(img.webformatURL);
      const blob = await res.blob();
      const file = new File([blob], `pixabay-${img.id}.jpg`, { type: blob.type || 'image/jpeg' });
      handleAddExtraImages([file]);
      alert(t('Đã thêm ảnh vào danh sách Extra!', 'Added image to Extra list!'));
    } catch {
      alert(t('Không thể tải ảnh này trực tiếp.', 'Cannot fetch this image.'));
    } finally {
      setAddingPixabayIdx(null);
    }
  };

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

  const loadSessionDetail = async (sessionId: string) => {
    try {
      setIsSessionLoading(true);
      const detail = await imageService.getSession(sessionId);
      setCurrentSession(detail);
      setShowSessionPicker(false);
      if (detail.images?.length > 0) {
        setActivePreviewUrl(detail.images[detail.images.length - 1].file_url);
      } else {
        setActivePreviewUrl(null);
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

  const handleDeleteCurrentSession = async () => {
    if (!user || !currentSession) return;
    if (!confirm(t('Bạn có chắc chắn muốn xóa session này?', 'Are you sure you want to delete this session?'))) return;
    try {
      await imageService.deleteSession(currentSession.session_id);
      setAllSessions((prev) => prev.filter((s) => s.session_id !== currentSession.session_id));
      setCurrentSession(null);
      setActivePreviewUrl(null);
    } catch (err: any) {
      alert(err.message || t('Không thể xóa session', 'Failed to delete session'));
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
    // 🔐 Auth Guard: Bắt buộc đăng nhập
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    // 🪙 Points Guard: Cần tối thiểu 2 điểm
    if ((userSubscription?.points_balance ?? 0) < 2) {
      setIsUpgradeModalOpen(true);
      return;
    }

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

      extraImageUrls.forEach((u) => URL.revokeObjectURL(u));
      setExtraImages([]);
      setExtraImageUrls([]);

      const updatedSession = await imageService.getSession(sessionId);
      setCurrentSession(updatedSession);
      refreshSubscription();
    } catch (err: any) {
      console.error('Studio generate error:', err);
      if (err?.message?.includes('402') || err?.message?.includes('insufficient_points') || err?.message?.includes('Không đủ điểm')) {
        setIsUpgradeModalOpen(true);
      } else {
        alert(err.message || t('Tạo ảnh thất bại, vui lòng thử lại', 'Image generation failed'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Streamlined RemoveBG (No Aspect Ratio / Prompt needed - Free for logged-in users) ──
  const handleExecuteRemoveBg = async () => {
    // 🔐 Auth Guard: Bắt buộc đăng nhập (kể cả tính năng miễn phí)
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!removeBgFile) {
      alert(t('Vui lòng tải ảnh cần xóa nền!', 'Please upload an image!'));
      return;
    }
    try {
      setIsGenerating(true);
      setResultImage(null);
      const res = await imageService.removeBackground({
        file: removeBgFile,
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

  // ── Generic Wrapper to Handle Tool Results ──
  const handleToolExecution = async (toolPromise: Promise<GenerateImageResult>) => {
    // 🔐 Auth Guard: Bắt buộc đăng nhập
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    // 🪙 Points Guard: Cần tối thiểu 2 điểm
    if ((userSubscription?.points_balance ?? 0) < 2) {
      setIsUpgradeModalOpen(true);
      return;
    }

    try {
      setIsGenerating(true);
      setResultImage(null);
      const res = await toolPromise;
      setResultImage(res);
      refreshSubscription();
    } catch (err: any) {
      console.error('Tool execution error:', err);
      if (err?.message?.includes('402') || err?.message?.includes('insufficient_points') || err?.message?.includes('Không đủ điểm')) {
        setIsUpgradeModalOpen(true);
      } else {
        alert(err.message || t('Tạo ảnh thất bại, vui lòng thử lại', 'Image generation failed'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const activeToolConfig = CUSTOM_TOOLS.find((t) => t.id === selectedTool);

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 pt-1 pb-24 space-y-4">
      {/* ─────────────────────────────────────────────────────────────
          1. TAB NAVIGATION SWITCHER (Studio | 10 Tools | RemoveBG)
          ───────────────────────────────────────────────────────────── */}
      <div
        className={`p-1 rounded-2xl border flex items-center gap-1 backdrop-blur-xl ${
          isDark ? 'bg-[#0E111A]/90 border-slate-800/80 shadow-md' : 'bg-white/90 border-slate-200 shadow-sm'
        }`}
      >
        {[
          { id: 'studio' as MainViewMode, labelVi: 'Studio (2 điểm)', labelEn: 'Studio (2 pts)' },
          { id: 'tools' as MainViewMode, labelVi: '10 Tools (2 điểm)', labelEn: '10 Tools (2 pts)' },
          { id: 'removebg' as MainViewMode, icon: Scissors, labelVi: 'Remove BG (Miễn phí)', labelEn: 'Remove BG (Free)' },
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
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                isActive
                  ? isDark
                    ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                    : 'bg-black text-white shadow-sm scale-[1.02]'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
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
          2. VIEW MODE 1: STUDIO (Web Parity & Light/Dark Theme)
          ───────────────────────────────────────────────────────────── */}
      {mainView === 'studio' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Card: DESIGN PROMPT */}
          <div
            className={`rounded-[28px] border p-4 sm:p-5 space-y-3 backdrop-blur-2xl ${
              isDark
                ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border-slate-200 bg-white shadow-sm'
            }`}
          >
            <div>
              <p className={`text-[10px] uppercase tracking-[0.24em] font-black mb-1.5 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                DESIGN PROMPT
              </p>
              <textarea
                value={studioPrompt}
                onChange={(e) => setStudioPrompt(e.target.value)}
                rows={3}
                className={`w-full resize-none rounded-2xl border px-3.5 py-3 text-xs sm:text-sm outline-none transition-all ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-cyan-400/60'
                    : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500'
                }`}
                placeholder="Enter your ideas or upload images to get started."
              />
            </div>

            {/* Controls Bar: Extra + 16:9 + Send Button */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                {/* Extra Button */}
                <button
                  type="button"
                  onClick={() => extraImagesRef.current?.click()}
                  className={`h-10 px-3.5 rounded-2xl font-semibold text-xs border transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                    isDark
                      ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>Extra</span>
                  {extraImages.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                      {extraImages.length}
                    </span>
                  )}
                </button>

                {/* 16:9 Dropdown */}
                <div
                  className={`h-10 rounded-2xl border px-3 flex items-center gap-1.5 relative transition-all ${
                    isDark ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <ImageIcon className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`} />
                  <select
                    value={studioAspectRatio}
                    onChange={(e) => setStudioAspectRatio(e.target.value)}
                    className="bg-transparent outline-none text-xs font-semibold appearance-none cursor-pointer pr-4"
                  >
                    <option value="16:9" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>16:9</option>
                    <option value="1:1" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>1:1</option>
                    <option value="9:16" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>9:16</option>
                    <option value="4:3" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>4:3</option>
                    <option value="3:4" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>3:4</option>
                    <option value="3:2" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>3:2</option>
                    <option value="2:3" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>2:3</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none -ml-3" />
                </div>
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={handleStudioSubmit}
                disabled={isGenerating || !studioPrompt.trim()}
                className="h-10 px-6 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 shadow-md shadow-violet-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{elapsedTime}s</span>
                  </>
                ) : (
                  <span>{t('Tạo ảnh (2 điểm)', 'Create (2 pts)')}</span>
                )}
              </button>
            </div>

            {/* Status Footer */}
            <div className={`pt-1 flex items-center gap-3 text-[11px] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
              <span>Session: {currentSession?.title || 'None'}</span>
              <span>•</span>
              <span>History: {currentSession?.images?.length ?? 0} images</span>
            </div>
          </div>

          {/* Middle Section: SESSION & EXTRA IMAGES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. SESSION Card (Consistent History) */}
            <div
              className={`rounded-[28px] border p-4 space-y-3 backdrop-blur-2xl ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'border-slate-200 bg-white shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] uppercase tracking-[0.24em] font-black ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                    SESSION
                  </p>
                  <h3 className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t('Lịch sử nhất quán', 'Consistent History')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCreateNewSession}
                  disabled={isSessionLoading}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 active:scale-95 ${
                    isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>{t('Mới', 'New')}</span>
                </button>
              </div>

              {/* Session Selector Dropdown */}
              {allSessions.length > 0 && (
                <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-slate-50'}`}>
                  <button
                    type="button"
                    onClick={() => setShowSessionPicker(!showSessionPicker)}
                    className={`w-full px-3 py-2 flex items-center justify-between text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <span className="truncate">{currentSession?.title || t('Chọn session...', 'Select session...')}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSessionPicker ? 'rotate-180' : ''}`} />
                  </button>
                  {showSessionPicker && (
                    <div className={`border-t divide-y max-h-36 overflow-y-auto ${isDark ? 'border-white/10 divide-white/5 bg-[#0E111A]' : 'border-slate-200 divide-slate-100 bg-white shadow-md'}`}>
                      {allSessions.map((s) => (
                        <button
                          key={s.session_id}
                          type="button"
                          onClick={() => loadSessionDetail(s.session_id)}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                            currentSession?.session_id === s.session_id
                              ? isDark ? 'bg-cyan-500/15 text-cyan-300 font-bold' : 'bg-cyan-50 text-cyan-800 font-bold'
                              : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{s.title}</span>
                          <span className="text-[10px] text-slate-500 shrink-0">{s.images_count} imgs</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* UPLOAD REFERENCES Sub-card */}
              <div className={`rounded-2xl border p-3 ${isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50/80'}`}>
                <p className={`text-[10px] uppercase tracking-widest font-black mb-2 ${isDark ? 'text-fuchsia-300' : 'text-fuchsia-700'}`}>
                  {t('UPLOAD THAM CHIẾU', 'UPLOAD REFERENCES')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadRoleForRef('character');
                      sessionFileInputRef.current?.click();
                    }}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1 active:scale-95 ${
                      uploadRoleForRef === 'character'
                        ? isDark ? 'border-violet-500/50 bg-violet-500/20 text-violet-200' : 'border-violet-400 bg-violet-100 text-violet-800 font-bold'
                        : isDark ? 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    👤 {t('Nhân vật', 'Character')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadRoleForRef('object');
                      sessionFileInputRef.current?.click();
                    }}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1 active:scale-95 ${
                      uploadRoleForRef === 'object'
                        ? isDark ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-200' : 'border-cyan-400 bg-cyan-100 text-cyan-800 font-bold'
                        : isDark ? 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    📦 {t('Đối tượng', 'Object')}
                  </button>
                </div>
              </div>

              {/* Session Images Display / Empty State */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {!currentSession || currentSession.images?.length === 0 ? (
                  <div className={`rounded-2xl border border-dashed p-6 text-center ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/50'}`}>
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                    <p className={`text-xs font-bold ${isDark ? 'text-white/80' : 'text-slate-800'}`}>{t('Chưa có session', 'No session yet')}</p>
                    <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t('Tạo session mới để bắt đầu chuỗi ảnh nhất quán.', 'Create a new session to start a consistent image series.')}
                    </p>
                  </div>
                ) : (
                  currentSession.images.map((img: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setActivePreviewUrl(img.file_url)}
                      className={`group rounded-xl border p-2 flex items-center gap-2.5 cursor-pointer transition-all ${
                        activePreviewUrl === img.file_url
                          ? isDark ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-cyan-400 bg-cyan-50'
                          : isDark ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-black/40 shrink-0">
                        <img src={img.file_url} alt="Ref" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          img.role === 'character' ? 'bg-violet-500/20 text-violet-600 dark:text-violet-300' : img.role === 'object' ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                        }`}>
                          {img.role === 'character' ? 'Character' : img.role === 'object' ? 'Object' : 'Generated'}
                        </span>
                        <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {img.prompt || 'Reference image'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSessionImage(idx);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {currentSession && (
                <button
                  type="button"
                  onClick={handleDeleteCurrentSession}
                  className="w-full py-2 rounded-xl text-[11px] font-semibold border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 flex items-center justify-center gap-1 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('Xóa session', 'Delete session')}</span>
                </button>
              )}
            </div>

            {/* 2. EXTRA IMAGES Card */}
            <div
              className={`rounded-[28px] border p-4 space-y-3 backdrop-blur-2xl ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'border-slate-200 bg-white shadow-sm'
              }`}
            >
              <div>
                <p className={`text-[10px] uppercase tracking-[0.24em] font-black ${isDark ? 'text-fuchsia-300' : 'text-fuchsia-700'}`}>
                  EXTRA IMAGES
                </p>
                <h4 className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('Chỉ dùng 1 lần — không lưu vào session', 'One-time only — not saved to session')}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => extraImagesRef.current?.click()}
                className={`w-full py-2.5 rounded-2xl text-xs font-bold border transition-all active:scale-[0.98] ${
                  isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                {t('Thêm ảnh', 'Add images')}
              </button>

              <div className="flex flex-wrap gap-2 min-h-[90px]">
                {extraImages.length === 0 ? (
                  <div className={`w-full rounded-2xl border border-dashed p-4 text-center text-[11px] ${isDark ? 'border-white/10 text-white/40' : 'border-slate-200 text-slate-500'}`}>
                    {t('Thêm ảnh cho lần generate hiện tại.', 'Add images for this current generation.')}
                  </div>
                ) : (
                  extraImageUrls.map((url, idx) => (
                    <div key={idx} className="relative h-14 w-14 rounded-xl overflow-hidden border border-slate-700/50 group">
                      <img src={url} alt="Extra" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraImage(idx)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Active Preview / Canvas Display Card */}
          {activePreviewUrl && (
            <div
              className={`rounded-[28px] border p-4 backdrop-blur-2xl ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'border-slate-200 bg-white shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                  {t('Ảnh xem trước', 'Studio Preview')}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await saveAndShareMedia(activePreviewUrl, `wynmotion_studio_${Date.now()}.png`);
                    }}
                    className={`p-1.5 rounded-xl border transition-all active:scale-95 ${
                      isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-slate-200 bg-slate-100 text-slate-800'
                    }`}
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
                    className={`p-1.5 rounded-xl border transition-all active:scale-95 ${
                      isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-slate-200 bg-slate-100 text-slate-800'
                    }`}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden max-h-[360px] flex items-center justify-center bg-black/60 border border-slate-700/50">
                <img
                  src={activePreviewUrl}
                  alt="Studio Render"
                  className="max-h-[360px] w-auto max-w-full object-contain cursor-pointer"
                  onClick={() => {
                    setResultImage({
                      image_url: activePreviewUrl,
                      prompt_used: studioPrompt || 'Studio Image',
                      aspect_ratio: studioAspectRatio as AspectRatio,
                    });
                    setIsLightboxOpen(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Bottom Card: INSPIRATION */}
          <div
            className={`rounded-[30px] border p-4 sm:p-5 backdrop-blur-2xl ${
              isDark
                ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border-slate-200 bg-white shadow-sm'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-violet-500 flex items-center justify-center shadow-lg shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-[10px] uppercase tracking-[0.24em] font-black ${isDark ? 'text-amber-200/70' : 'text-amber-700'}`}>
                    INSPIRATION
                  </p>
                  <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t('Tìm ảnh cảm hứng', 'Browse inspiration')}
                  </h3>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={pixabayQuery}
                  onChange={(e) => setPixabayQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && pixabayQuery.trim()) {
                      setPixabayImages([]);
                      setPixabayPage(1);
                      setPixabayHasMore(true);
                      fetchPixabay(pixabayQuery.trim(), 1, false);
                    }
                  }}
                  placeholder={t('Tìm kiếm thêm...', 'Search more...')}
                  className={`h-9 w-full pl-8 pr-3 rounded-2xl border text-xs outline-none transition-all ${
                    isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-violet-400/60' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-500'
                  }`}
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
              {INSPIRATION_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setInspirationTab(tab.id)}
                  className={`h-8 px-3.5 rounded-2xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all border ${
                    inspirationTab === tab.id
                      ? isDark ? 'border-violet-500/60 bg-violet-500/20 text-violet-200 shadow-sm' : 'border-violet-400 bg-violet-100 text-violet-800 font-bold'
                      : isDark ? 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isVietnamese ? tab.vi : tab.en}
                </button>
              ))}
            </div>

            {/* Pixabay Images Grid */}
            {isPixabayLoading ? (
              <div className="flex items-center justify-center h-36">
                <Loader2 className="w-7 h-7 animate-spin text-violet-400 opacity-60" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {pixabayImages.map((img, idx) => (
                    <div key={img.id} className="group relative rounded-2xl overflow-hidden aspect-square border border-slate-700/40 bg-black/40">
                      <img
                        src={img.previewURL}
                        alt={img.tags}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                        <button
                          type="button"
                          onClick={() => setPixabayPreviewImg(img)}
                          className="h-6 px-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm"
                        >
                          <Search className="w-2.5 h-2.5" />
                          <span>{t('Xem', 'View')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => addPixabayAsReference(img, idx)}
                          disabled={addingPixabayIdx === idx}
                          className="h-6 px-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold flex items-center gap-1 shadow"
                        >
                          {addingPixabayIdx === idx ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-2.5 h-2.5" />
                              <span>{t('Dùng', 'Use')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {pixabayHasMore && pixabayImages.length > 0 && (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const activeTab = INSPIRATION_TABS.find((tb) => tb.id === inspirationTab) || INSPIRATION_TABS[0];
                        fetchPixabay(pixabayQuery.trim() || activeTab.query, pixabayPage + 1, true);
                      }}
                      disabled={isPixabayLoadingMore}
                      className={`h-9 px-5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {isPixabayLoadingMore ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{t('Đang tải...', 'Loading...')}</span>
                        </>
                      ) : (
                        <span>{t('Tải thêm 20 ảnh', 'Load 20 more')}</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. VIEW MODE 2: 10 CUSTOM TOOLS (Modular & Exact Web Parity)
          ───────────────────────────────────────────────────────────── */}
      {mainView === 'tools' && (
        <div className="space-y-4">
          {!selectedTool ? (
            // ── Grid View: 10 Tool Cards — Clean & Exact Web Layout ──
            <div className="space-y-4 animate-in fade-in duration-200">
              <div
                className={`rounded-[30px] border p-4 sm:p-5 backdrop-blur-2xl ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-[18px] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-[0.24em] font-black ${
                      isDark ? 'text-fuchsia-200/70' : 'text-fuchsia-700'
                    }`}>
                      CUSTOM TOOLS
                    </p>
                    <h3 className={`text-lg sm:text-xl font-bold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      10 AI tools studio
                    </h3>
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
                  {CUSTOM_TOOLS.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setSelectedTool(tool.id)}
                        className={`group relative rounded-[26px] border p-4 text-left transition-all duration-200 flex flex-col justify-between aspect-square active:scale-95 ${
                          isDark
                            ? 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                            : 'border-slate-200/80 bg-slate-50/70 hover:border-slate-300 hover:bg-white shadow-xs'
                        }`}
                      >
                        <div>
                          <div className={`w-12 h-12 rounded-2xl mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${tool.iconBg}`}>
                            <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                          </div>
                          <h4 className={`text-xs sm:text-sm font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {isVietnamese ? tool.nameVi : tool.nameEn}
                          </h4>
                          <p className={`mt-1.5 text-[10px] sm:text-xs leading-relaxed line-clamp-2 ${
                            isDark ? 'text-white/65 group-hover:text-white/80' : 'text-slate-600'
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
            // ── Dedicated Tool Screen With Full Form Components ──
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
              {/* Back Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedTool(null)}
                  className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm ${
                    isDark ? 'bg-[#121522] border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('Quay Lại Danh Sách Tools', 'Back to 10 Tools')}</span>
                </button>
              </div>

              {/* Glowing Tool Header */}
              <div
                className={`rounded-[30px] border p-4 sm:p-6 backdrop-blur-2xl ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-5">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-cyan-400 to-violet-500 blur-md opacity-70" />
                    <div className="relative h-14 w-14 rounded-[20px] border border-white/20 bg-black/30 backdrop-blur-xl flex items-center justify-center shadow-lg">
                      {activeToolConfig && <activeToolConfig.icon className="w-7 h-7 text-white" />}
                    </div>
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-[0.24em] font-black ${
                      isDark ? 'text-cyan-300' : 'text-cyan-700'
                    }`}>
                      {activeToolConfig?.type === 'editing' ? t('EDITING TOOL', 'EDITING TOOL') : t('GENERATION TOOL', 'GENERATION TOOL')}
                    </p>
                    <h3 className={`text-xl sm:text-2xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {isVietnamese ? activeToolConfig?.nameVi : activeToolConfig?.nameEn}
                    </h3>
                    <p className={`mt-1.5 text-xs sm:text-sm max-w-2xl leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                      {isVietnamese ? activeToolConfig?.descVi : activeToolConfig?.descEn}
                    </p>
                  </div>
                </div>

                {/* Form Container Rendering Dedicated Modular Component */}
                <div
                  className={`rounded-[24px] border p-4 sm:p-5 ${
                    isDark ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  {/* Tool 1: Photorealistic */}
                  {selectedTool === 'photorealistic' && (
                    <PhotorealisticForm
                      isDark={isDark}
                      language={isVietnamese ? 'vi' : 'en'}
                      isGenerating={isGenerating}
                      onSubmit={(data) => handleToolExecution(imageService.generatePhotorealistic(data))}
                    />
                  )}

                  {/* Tool 2: Stylized Art */}
                  {selectedTool === 'stylized' && (
                    <StylizedForm
                      isDark={isDark}
                      language={isVietnamese ? 'vi' : 'en'}
                      isGenerating={isGenerating}
                      onSubmit={(data) => handleToolExecution(imageService.generateStylized(data))}
                    />
                  )}

                  {/* Tool 3: Logo & Typography */}
                  {selectedTool === 'logo' && (
                    <LogoForm
                      isDark={isDark}
                      language={isVietnamese ? 'vi' : 'en'}
                      isGenerating={isGenerating}
                      onSubmit={(data) => handleToolExecution(imageService.generateLogo(data))}
                    />
                  )}

                  {/* Tool 4: Object Edit */}
                  {selectedTool === 'object-edit' && (
                    <ObjectEditForm
                      isDark={isDark}
                      language={isVietnamese ? 'vi' : 'en'}
                      isGenerating={isGenerating}
                      onSubmit={(data, file) =>
                        handleToolExecution(
                          imageService.editObjectEdit({
                            ...data,
                            image_file: file,
                          })
                        )
                      }
                    />
                  )}

                  {/* Tool 5: Composition */}
                  {selectedTool === 'composition' && (
                    <CompositionForm
                      isDark={isDark}
                      language={isVietnamese ? 'vi' : 'en'}
                      isGenerating={isGenerating}
                      onSubmit={(data, baseFile, overlayFiles) =>
                        handleToolExecution(
                          imageService.editComposition({
                            ...data,
                            base_image: baseFile,
                            overlay_images: overlayFiles,
                          })
                        )
                      }
                    />
                  )}

                  {/* Tool 6: Sequential Art */}
                  {selectedTool === 'sequential' && (
                    <SequentialForm
                      isDark={isDark}
                      language={isVietnamese ? 'vi' : 'en'}
                      isGenerating={isGenerating}
                      onSubmit={(data) => handleToolExecution(imageService.generateSequential(data))}
                    />
                  )}

                  {/* Tool 7: Product Mockup */}
                  {selectedTool === 'mockup' && (
                    <MockupForm
                      isDark={isDark}
                      language={isVietnamese ? 'vi' : 'en'}
                      isGenerating={isGenerating}
                      onSubmit={(data) => handleToolExecution(imageService.generateMockup(data))}
                    />
                  )}

                  {/* Tool 8: Style Transfer (With all 19 presets & sliders) */}
                  {selectedTool === 'style-transfer' && (
                    <StyleTransferForm
                      isDark={isDark}
                      language={isVietnamese ? 'vi' : 'en'}
                      isGenerating={isGenerating}
                      onSubmit={(data, file) =>
                        handleToolExecution(
                          imageService.editStyleTransfer({
                            ...data,
                            image_file: file,
                          })
                        )
                      }
                    />
                  )}

                  {/* Tool 9: Inpainting */}
                  {selectedTool === 'inpainting' && (
                    <InpaintingForm
                      isDark={isDark}
                      language={isVietnamese ? 'vi' : 'en'}
                      isGenerating={isGenerating}
                      onSubmit={(data, file, maskFile) =>
                        handleToolExecution(
                          imageService.editInpainting({
                            ...data,
                            image_file: file,
                            mask_file: maskFile,
                          })
                        )
                      }
                    />
                  )}

                  {/* Tool 10: Background */}
                  {selectedTool === 'background' && (
                    <BackgroundForm
                      isDark={isDark}
                      language={isVietnamese ? 'vi' : 'en'}
                      isGenerating={isGenerating}
                      onSubmit={(data) => handleToolExecution(imageService.generateBackground(data))}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. VIEW MODE 3: STREAMLINED REMOVE BACKGROUND TOOL
          ───────────────────────────────────────────────────────────── */}
      {mainView === 'removebg' && (
        <div
          className={`p-4 sm:p-5 rounded-3xl border space-y-4 animate-in fade-in duration-200 ${
            isDark ? 'bg-[#121522] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Info Banner */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${
            isDark ? 'bg-teal-950/30 border-teal-500/20 text-teal-300' : 'bg-teal-50 border-teal-200 text-teal-800'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('AI Tách Nền Trong Suốt', 'AI Background Remover')}</h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('Tách chủ thể độ phân giải gốc 100% Alpha PNG', 'Extract subject with 100% transparent PNG alpha')}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm shrink-0">
              {t('✨ Miễn Phí', '✨ Free')}
            </span>
          </div>

          <input
            ref={removeBgInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 20 * 1024 * 1024) {
                  alert(t('File không được vượt quá 20MB', 'File size must not exceed 20MB'));
                  return;
                }
                setRemoveBgFile(file);
                setRemoveBgPreview(URL.createObjectURL(file));
              }
              e.target.value = '';
            }}
          />

          {removeBgPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-teal-500/30 max-h-64 flex items-center justify-center bg-black/40 p-2">
              <img src={removeBgPreview} alt="Target" className="max-h-64 object-contain rounded-xl" />
              <button
                type="button"
                onClick={() => {
                  setRemoveBgFile(null);
                  setRemoveBgPreview(null);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => removeBgInputRef.current?.click()}
              className={`w-full py-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isDark ? 'border-slate-800 bg-[#090B12] hover:border-slate-700' : 'border-slate-300 bg-slate-50 hover:border-teal-500 hover:bg-teal-50/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-1">
                <Upload className="w-6 h-6" />
              </div>
              <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('Tải Ảnh Cần Xóa Nền', 'Upload Image to Cutout')}</span>
              <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>PNG, JPG, JPEG, WEBP (Tối đa 20MB)</span>
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
                <span>{t('✂️ Tách Nền Trong Suốt (Miễn phí)', '✂️ Cutout Subject Now (Free)')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. RESULT CARD & LIGHTBOX PREVIEW
          ───────────────────────────────────────────────────────────── */}
      {resultImage?.image_url && (
        <div
          className={`p-4 rounded-3xl border space-y-3 animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-[#121522] border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {t('Tạo ảnh hoàn tất!', 'Image generated successfully!')}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative rounded-2xl overflow-hidden border border-slate-700/50 cursor-pointer group flex items-center justify-center p-3"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(128,128,128,0.12) 25%, transparent 25%), 
                linear-gradient(-45deg, rgba(128,128,128,0.12) 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, rgba(128,128,128,0.12) 75%), 
                linear-gradient(-45deg, transparent 75%, rgba(128,128,128,0.12) 75%)
              `,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          >
            <img
              src={resultImage.image_url}
              alt="Generated AI"
              className="w-full max-h-96 object-contain group-hover:scale-[1.02] transition-transform duration-300 filter drop-shadow-xl"
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

      {/* Fullscreen Pixabay Image Lightbox */}
      {pixabayPreviewImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPixabayPreviewImg(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/60">
              <img
                src={pixabayPreviewImg.webformatURL}
                alt={pixabayPreviewImg.tags}
                className="max-h-[60vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-3 bg-[#0E111A] px-4 py-3 border-t border-white/10">
              <p className="text-xs text-white/70 truncate">{pixabayPreviewImg.tags}</p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const idx = pixabayImages.findIndex((i) => i.id === pixabayPreviewImg.id);
                    addPixabayAsReference(pixabayPreviewImg, idx);
                    setPixabayPreviewImg(null);
                  }}
                  disabled={addingPixabayIdx !== null}
                  className="h-8 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t('Dùng làm ref', 'Use as ref')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPixabayPreviewImg(null)}
                  className="h-8 w-8 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Result Image Lightbox Modal */}
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

      {/* Auth & Upgrade Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <WynMotionUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        defaultTab="points"
      />
    </div>
  );
};
