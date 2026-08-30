'use client';

/**
 * AiImagesTab.tsx — WynMotion-AI iOS & Mobile Image Studio
 *
 * Full Parity with Web GeminiImageModal (Studio + 10 Tools + Remove BG):
 * - Studio View with Design Prompt, Consistent History (Session), Extra Images, Preview Canvas & Pixabay Inspiration
 * - 10 Tools Grid matching Web exactly (No clutter badges, clean w-12 icon boxes, 2-line descriptions, exact tool order)
 * - Header with https://www.wynai.pro/logo%20AI%20Image%20Studio.png + "AI Images Studio"
 * - Full parity with Web APIs and parameters
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
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import {
  imageService,
  ImageEndpoint,
  AspectRatio,
  GenerateImageResult,
} from '@/services/imageService';
import { saveAndShareMedia } from '@/utils/mediaSaveHelper';

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

// Exact Web 10 Tools order & definition matching Image 3
const CUSTOM_TOOLS: ToolConfig[] = [
  // 1. Photorealistic
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
  // 2. Stylized Art
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
  // 3. Logo & Typography
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
  // 4. Object Edit
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
  // 5. Advanced Composition
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
  // 6. Sequential Art
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
  // 7. Product Mockup
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
  // 8. Style Transfer
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
  // 9. Inpainting
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
  // 10. Background
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

const STYLE_TRANSFER_PRESETS = [
  { name: 'Van Gogh', desc: 'Starry Night swirling brushstrokes & vivid colors' },
  { name: 'Picasso', desc: 'Cubist fragmented forms & abstract perspectives' },
  { name: 'Monet', desc: 'Impressionist soft brushstrokes & natural light' },
  { name: 'Pop Art', desc: 'Bold printed outlines & vibrant pop culture colors' },
  { name: 'Watercolor', desc: 'Transparent watercolor blooms & soft bleeding edges' },
  { name: 'Oil Painting', desc: 'Thick classical oil paint strokes & deep texture' },
  { name: 'Anime Studio Ghibli', desc: 'Whimsical lush hand-drawn anime backgrounds' },
  { name: 'Cyberpunk Neon', desc: 'Glowing neon lights, futuristic reflections & dark tones' },
  { name: '3D Pixar Style', desc: 'Cute clay-like 3D characters with soft rim lighting' },
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
  const [showSessionPicker, setShowSessionPicker] = useState(false);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [extraImages, setExtraImages] = useState<File[]>([]);
  const [extraImageUrls, setExtraImageUrls] = useState<string[]>([]);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [uploadRoleForRef, setUploadRoleForRef] = useState<'character' | 'object'>('character');
  const extraImagesRef = useRef<HTMLInputElement>(null);
  const sessionFileInputRef = useRef<HTMLInputElement>(null);

  // ── Pixabay Inspiration State (Inside Studio) ──
  const [inspirationTab, setInspirationTab] = useState<string>('ai-images');
  const [pixabayQuery, setPixabayQuery] = useState('');
  const [pixabayImages, setPixabayImages] = useState<PixabayImage[]>([]);
  const [pixabayPage, setPixabayPage] = useState(1);
  const [pixabayHasMore, setPixabayHasMore] = useState(true);
  const [isPixabayLoading, setIsPixabayLoading] = useState(false);
  const [isPixabayLoadingMore, setIsPixabayLoadingMore] = useState(false);
  const [pixabayPreviewImg, setPixabayPreviewImg] = useState<PixabayImage | null>(null);
  const [addingPixabayIdx, setAddingPixabayIdx] = useState<number | null>(null);

  // ── Tool 1: Photorealistic Form State ──
  const [photoPrompt, setPhotoPrompt] = useState('');
  const [photoLighting, setPhotoLighting] = useState<string>('Cinematic');
  const [photoCameraAngle, setPhotoCameraAngle] = useState<string>('Eye Level');
  const [photoAspectRatio, setPhotoAspectRatio] = useState<AspectRatio>('16:9');
  const [photoNegativePrompt, setPhotoNegativePrompt] = useState('');

  // ── Tool 2: Stylized Form State ──
  const [stylizedPrompt, setStylizedPrompt] = useState('');
  const [stylizedStyle, setStylizedStyle] = useState<'Anime' | '3D Render' | 'Watercolor' | 'Oil Painting' | 'Flat Design' | 'Sticker Art'>('Anime');
  const [stylizedStickerMode, setStylizedStickerMode] = useState(false);
  const [stylizedAspectRatio, setStylizedAspectRatio] = useState<AspectRatio>('1:1');

  // ── Tool 3: Logo Form State ──
  const [logoBrandName, setLogoBrandName] = useState('');
  const [logoTagline, setLogoTagline] = useState('');
  const [logoIndustry, setLogoIndustry] = useState('');
  const [logoStyle, setLogoStyle] = useState<'Modern' | 'Minimalist' | 'Vintage' | 'Luxury'>('Modern');
  const [logoColorPalette, setLogoColorPalette] = useState('');
  const [logoVisualElements, setLogoVisualElements] = useState('');
  const [logoAspectRatio, setLogoAspectRatio] = useState<AspectRatio>('1:1');

  // ── Tool 4: Background Form State ──
  const [bgTheme, setBgTheme] = useState('');
  const [bgMinimalistMode, setBgMinimalistMode] = useState(false);
  const [bgNegativeSpace, setBgNegativeSpace] = useState<'Center' | 'Left' | 'Right' | 'Top'>('Center');
  const [bgColorMood, setBgColorMood] = useState<'Dark' | 'Light' | 'Pastel' | 'Vibrant'>('Dark');
  const [bgAspectRatio, setBgAspectRatio] = useState<AspectRatio>('16:9');

  // ── Tool 5: Mockup Form State ──
  const [mockupScene, setMockupScene] = useState('');
  const [mockupPlacement, setMockupPlacement] = useState<'Tabletop' | 'Model Wearing' | 'Outdoor' | 'Studio Backdrop'>('Tabletop');
  const [mockupAspectRatio, setMockupAspectRatio] = useState<AspectRatio>('4:3');

  // ── Tool 6: Sequential Form State ──
  const [seqScript, setSeqScript] = useState('');
  const [seqPanelCount, setSeqPanelCount] = useState(2);
  const [seqStyle, setSeqStyle] = useState<'Comic Book' | 'Manga' | 'Storyboard Sketch'>('Comic Book');
  const [seqAspectRatio, setSeqAspectRatio] = useState<AspectRatio>('16:9');

  // ── Tool 7: Style Transfer Form State ──
  const [stImageFile, setStImageFile] = useState<File | null>(null);
  const [stImagePreview, setStImagePreview] = useState<string | null>(null);
  const [stTargetStyle, setStTargetStyle] = useState('Van Gogh');
  const [stStrength, setStStrength] = useState(80);
  const [stPreserveStructure, setStPreserveStructure] = useState(true);
  const [stAspectRatio, setStAspectRatio] = useState<AspectRatio>('1:1');
  const [stNegativePrompt, setStNegativePrompt] = useState('');
  const stFileInputRef = useRef<HTMLInputElement>(null);

  // ── Tool 8: Object Edit Form State ──
  const [oeImageFile, setOeImageFile] = useState<File | null>(null);
  const [oeImagePreview, setOeImagePreview] = useState<string | null>(null);
  const [oeTargetObject, setOeTargetObject] = useState('');
  const [oeModification, setOeModification] = useState('');
  const [oePreserveBg, setOePreserveBg] = useState(true);
  const [oeAspectRatio, setOeAspectRatio] = useState<AspectRatio>('1:1');
  const [oeNegativePrompt, setOeNegativePrompt] = useState('');
  const oeFileInputRef = useRef<HTMLInputElement>(null);

  // ── Tool 9: Inpainting Form State ──
  const [inImageFile, setInImageFile] = useState<File | null>(null);
  const [inImagePreview, setInImagePreview] = useState<string | null>(null);
  const [inMaskFile, setInMaskFile] = useState<File | null>(null);
  const [inMaskPreview, setInMaskPreview] = useState<string | null>(null);
  const [inPrompt, setInPrompt] = useState('');
  const [inAction, setInAction] = useState<'add' | 'remove' | 'replace'>('add');
  const [inBlendMode, setInBlendMode] = useState<'natural' | 'seamless' | 'artistic'>('natural');
  const [inAspectRatio, setInAspectRatio] = useState<AspectRatio>('1:1');
  const [inNegativePrompt, setInNegativePrompt] = useState('');
  const inFileInputRef = useRef<HTMLInputElement>(null);
  const inMaskInputRef = useRef<HTMLInputElement>(null);

  // ── Tool 10: Composition Form State ──
  const [compBaseFile, setCompBaseFile] = useState<File | null>(null);
  const [compBasePreview, setCompBasePreview] = useState<string | null>(null);
  const [compOverlayFiles, setCompOverlayFiles] = useState<File[]>([]);
  const [compOverlayPreviews, setCompOverlayPreviews] = useState<string[]>([]);
  const [compPrompt, setCompPrompt] = useState('');
  const [compStyle, setCompStyle] = useState<'realistic' | 'artistic' | 'professional' | 'collage'>('realistic');
  const [compLightingAdj, setCompLightingAdj] = useState(true);
  const [compAspectRatio, setCompAspectRatio] = useState<AspectRatio>('1:1');
  const [compNegativePrompt, setCompNegativePrompt] = useState('');
  const compBaseInputRef = useRef<HTMLInputElement>(null);
  const compOverlayInputRef = useRef<HTMLInputElement>(null);

  // ── RemoveBG State ──
  const [removeBgFile, setRemoveBgFile] = useState<File | null>(null);
  const [removeBgPreview, setRemoveBgPreview] = useState<string | null>(null);
  const [removeBgPrompt, setRemoveBgPrompt] = useState('');
  const [removeBgAspectRatio, setRemoveBgAspectRatio] = useState('original');
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
  const fetchPixabay = useCallback(async (query: string, page = 1, append = false) => {
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
  }, [isVietnamese]);

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
      alert(err.message || t('Tạo ảnh thất bại, vui lòng thử lại', 'Image generation failed'));
    } finally {
      setIsGenerating(false);
    }
  };

  // ── 10 Dedicated Tools Submission ──
  const handleExecuteTool = async () => {
    if (!selectedTool) return;
    try {
      setIsGenerating(true);
      setResultImage(null);
      let res: GenerateImageResult;

      switch (selectedTool) {
        case 'photorealistic':
          if (photoPrompt.trim().length < 10) {
            alert(t('Mô tả cảnh cần tối thiểu 10 ký tự!', 'Scene description needs at least 10 characters!'));
            setIsGenerating(false);
            return;
          }
          res = await imageService.generatePhotorealistic({
            prompt: photoPrompt.trim(),
            lighting: photoLighting || undefined,
            camera_angle: photoCameraAngle || undefined,
            aspect_ratio: photoAspectRatio,
            negative_prompt: photoNegativePrompt.trim() || undefined,
          });
          break;

        case 'stylized':
          if (stylizedPrompt.trim().length < 10) {
            alert(t('Mô tả đối tượng cần tối thiểu 10 ký tự!', 'Object description needs at least 10 characters!'));
            setIsGenerating(false);
            return;
          }
          res = await imageService.generateStylized({
            prompt: stylizedPrompt.trim(),
            style_preset: stylizedStyle,
            sticker_mode: stylizedStickerMode,
            aspect_ratio: stylizedAspectRatio,
          });
          break;

        case 'logo':
          if (!logoBrandName.trim() || !logoIndustry.trim()) {
            alert(t('Vui lòng nhập Tên thương hiệu và Ngành nghề!', 'Please enter Brand Name and Industry!'));
            setIsGenerating(false);
            return;
          }
          res = await imageService.generateLogo({
            brand_name: logoBrandName.trim(),
            tagline: logoTagline.trim() || undefined,
            industry: logoIndustry.trim(),
            style: logoStyle,
            color_palette: logoColorPalette.trim() || undefined,
            visual_elements: logoVisualElements.trim() || undefined,
            aspect_ratio: logoAspectRatio,
          });
          break;

        case 'background':
          if (bgTheme.trim().length < 10) {
            alert(t('Chủ đề background cần tối thiểu 10 ký tự!', 'Theme needs at least 10 characters!'));
            setIsGenerating(false);
            return;
          }
          res = await imageService.generateBackground({
            theme: bgTheme.trim(),
            minimalist_mode: bgMinimalistMode,
            negative_space_position: bgMinimalistMode ? bgNegativeSpace : undefined,
            color_mood: bgColorMood,
            aspect_ratio: bgAspectRatio,
          });
          break;

        case 'mockup':
          if (mockupScene.trim().length < 10) {
            alert(t('Mô tả sản phẩm và bối cảnh cần tối thiểu 10 ký tự!', 'Description needs at least 10 characters!'));
            setIsGenerating(false);
            return;
          }
          res = await imageService.generateMockup({
            scene_description: mockupScene.trim(),
            placement_type: mockupPlacement,
            aspect_ratio: mockupAspectRatio,
          });
          break;

        case 'sequential':
          if (seqScript.trim().length < 10) {
            alert(t('Kịch bản truyện cần tối thiểu 10 ký tự!', 'Story script needs at least 10 characters!'));
            setIsGenerating(false);
            return;
          }
          res = await imageService.generateSequential({
            story_script: seqScript.trim(),
            panel_count: seqPanelCount,
            style: seqStyle,
            aspect_ratio: seqAspectRatio,
          });
          break;

        case 'style-transfer':
          if (!stImageFile || !stTargetStyle.trim()) {
            alert(t('Vui lòng tải ảnh gốc và chọn phong cách đích!', 'Please upload original image & select target style!'));
            setIsGenerating(false);
            return;
          }
          res = await imageService.editStyleTransfer({
            image_file: stImageFile,
            target_style: stTargetStyle.trim(),
            strength: stStrength,
            preserve_structure: stPreserveStructure,
            aspect_ratio: stAspectRatio,
            negative_prompt: stNegativePrompt.trim() || undefined,
          });
          break;

        case 'object-edit':
          if (!oeImageFile || !oeTargetObject.trim() || !oeModification.trim()) {
            alert(t('Vui lòng tải ảnh gốc, nhập đối tượng và mô tả chỉnh sửa!', 'Please fill in original image, target object and modification!'));
            setIsGenerating(false);
            return;
          }
          res = await imageService.editObjectEdit({
            image_file: oeImageFile,
            target_object: oeTargetObject.trim(),
            modification: oeModification.trim(),
            preserve_background: oePreserveBg,
            aspect_ratio: oeAspectRatio,
            negative_prompt: oeNegativePrompt.trim() || undefined,
          });
          break;

        case 'inpainting':
          if (!inImageFile || !inPrompt.trim()) {
            alert(t('Vui lòng tải ảnh gốc và nhập mô tả vùng vẽ!', 'Please upload image and enter prompt!'));
            setIsGenerating(false);
            return;
          }
          res = await imageService.editInpainting({
            image_file: inImageFile,
            mask_file: inMaskFile || undefined,
            prompt: inPrompt.trim(),
            action: inAction,
            blend_mode: inBlendMode,
            aspect_ratio: inAspectRatio,
            negative_prompt: inNegativePrompt.trim() || undefined,
          });
          break;

        case 'composition':
          if (!compBaseFile || !compPrompt.trim()) {
            alert(t('Vui lòng tải ảnh nền (Base image) và nhập mô tả bố cục!', 'Please upload base image and enter prompt!'));
            setIsGenerating(false);
            return;
          }
          res = await imageService.editComposition({
            base_image: compBaseFile,
            overlay_images: compOverlayFiles,
            prompt: compPrompt.trim(),
            composition_style: compStyle,
            lighting_adjustment: compLightingAdj,
            aspect_ratio: compAspectRatio,
            negative_prompt: compNegativePrompt.trim() || undefined,
          });
          break;

        default:
          throw new Error('Unknown tool');
      }

      setResultImage(res);
      refreshSubscription();
    } catch (err: any) {
      console.error('Tool execution error:', err);
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
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 pt-1 pb-24 space-y-4">
      {/* ─────────────────────────────────────────────────────────────
          1. UNIFIED APP HEADER (Logo + AI Images Studio + Subtitle)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-1 py-1">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="https://www.wynai.pro/logo%20AI%20Image%20Studio.png"
            alt="AI Images Studio"
            className="w-11 h-11 sm:w-12 sm:h-12 object-contain shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight truncate">
              AI Images Studio
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-tight truncate">
              {t('Tạo và chỉnh sửa ảnh bằng AI', 'Create and edit images with AI')}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TAB NAVIGATION SWITCHER (Studio | Tools | RemoveBG)
          ───────────────────────────────────────────────────────────── */}
      <div
        className={`p-1 rounded-2xl border flex items-center gap-1 backdrop-blur-xl ${
          isDark ? 'bg-[#0E111A]/90 border-slate-800/80 shadow-md' : 'bg-white/90 border-slate-200 shadow-sm'
        }`}
      >
        {[
          { id: 'studio' as MainViewMode, labelVi: 'Studio', labelEn: 'Studio' },
          { id: 'tools' as MainViewMode, labelVi: '10 Tools', labelEn: '10 Tools' },
          { id: 'removebg' as MainViewMode, icon: Scissors, labelVi: 'Remove BG', labelEn: 'Remove BG' },
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
          3. VIEW MODE 1: STUDIO (Exact Web Parity — Image 1 Layout)
          ───────────────────────────────────────────────────────────── */}
      {mainView === 'studio' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Card: DESIGN PROMPT (Matching Image 1 on Web) */}
          <div
            className={`rounded-[28px] border p-4 sm:p-5 space-y-3 backdrop-blur-2xl ${
              isDark
                ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border-white/80 bg-white/75 shadow-lg'
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
                    : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500'
                }`}
                placeholder="Enter your ideas or upload images to get started."
              />
            </div>

            {/* Bottom bar inside Design Prompt Card: Extra + 16:9 + Send Button */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                {/* Extra Button */}
                <button
                  type="button"
                  onClick={() => extraImagesRef.current?.click()}
                  className={`h-10 px-3.5 rounded-2xl font-semibold text-xs border transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                    isDark
                      ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'
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
                    isDark ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-900'
                  }`}
                >
                  <ImageIcon className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`} />
                  <select
                    value={studioAspectRatio}
                    onChange={(e) => setStudioAspectRatio(e.target.value)}
                    className="bg-transparent outline-none text-xs font-semibold appearance-none cursor-pointer pr-4"
                  >
                    <option value="16:9" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>16:9</option>
                    <option value="1:1" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>1:1</option>
                    <option value="9:16" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>9:16</option>
                    <option value="4:3" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>4:3</option>
                    <option value="3:4" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>3:4</option>
                    <option value="3:2" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>3:2</option>
                    <option value="2:3" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'}>2:3</option>
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
                  <span>Send</span>
                )}
              </button>
            </div>

            {/* Status Footer Line */}
            <div className={`pt-1 flex items-center gap-3 text-[11px] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
              <span>Session: {currentSession?.title || 'None'}</span>
              <span>•</span>
              <span>History: {currentSession?.images?.length ?? 0} images</span>
            </div>
          </div>

          {/* Middle Section: SESSION & EXTRA IMAGES (Image 1 Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. SESSION Card (Consistent History) */}
            <div
              className={`rounded-[28px] border p-4 space-y-3 backdrop-blur-2xl ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'border-white/80 bg-white/75 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] uppercase tracking-[0.24em] font-black ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                    SESSION
                  </p>
                  <h3 className="text-sm font-bold text-white mt-0.5">{t('Lịch sử nhất quán', 'Consistent History')}</h3>
                </div>
                <button
                  type="button"
                  onClick={handleCreateNewSession}
                  disabled={isSessionLoading}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 active:scale-95 ${
                    isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>{t('Mới', 'New')}</span>
                </button>
              </div>

              {/* Session Selector Dropdown if Sessions exist */}
              {allSessions.length > 0 && (
                <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-slate-50'}`}>
                  <button
                    type="button"
                    onClick={() => setShowSessionPicker(!showSessionPicker)}
                    className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-white"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{currentSession?.title || t('Chọn session...', 'Select session...')}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSessionPicker ? 'rotate-180' : ''}`} />
                  </button>
                  {showSessionPicker && (
                    <div className={`border-t divide-y max-h-36 overflow-y-auto ${isDark ? 'border-white/10 divide-white/5' : 'border-slate-200 divide-slate-200'}`}>
                      {allSessions.map((s) => (
                        <button
                          key={s.session_id}
                          type="button"
                          onClick={() => loadSessionDetail(s.session_id)}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between ${
                            currentSession?.session_id === s.session_id
                              ? 'bg-cyan-500/15 text-cyan-300 font-bold'
                              : 'text-slate-300 hover:bg-white/5'
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
              <div className={`rounded-2xl border p-3 ${isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'}`}>
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
                        ? 'border-violet-500/50 bg-violet-500/20 text-violet-200'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
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
                        ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-200'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    📦 {t('Đối tượng', 'Object')}
                  </button>
                </div>
              </div>

              {/* Session Images Display / Empty State */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {!currentSession || currentSession.images?.length === 0 ? (
                  <div className={`rounded-2xl border border-dashed p-6 text-center ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}>
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-60" />
                    <p className="text-xs font-bold text-white/80">{t('Chưa có session', 'No session yet')}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
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
                          ? 'border-cyan-400/50 bg-cyan-400/10'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-black/40 shrink-0">
                        <img src={img.file_url} alt="Ref" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          img.role === 'character' ? 'bg-violet-500/20 text-violet-300' : img.role === 'object' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {img.role === 'character' ? 'Character' : img.role === 'object' ? 'Object' : 'Generated'}
                        </span>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
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
                  className="w-full py-2 rounded-xl text-[11px] font-semibold border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 flex items-center justify-center gap-1 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('Xóa session', 'Delete session')}</span>
                </button>
              )}
            </div>

            {/* 2. EXTRA IMAGES Card (Image 1 Layout) */}
            <div
              className={`rounded-[28px] border p-4 space-y-3 backdrop-blur-2xl ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'border-white/80 bg-white/75 shadow-lg'
              }`}
            >
              <div>
                <p className={`text-[10px] uppercase tracking-[0.24em] font-black ${isDark ? 'text-fuchsia-300' : 'text-fuchsia-700'}`}>
                  EXTRA IMAGES
                </p>
                <h4 className="text-xs font-semibold text-slate-400 mt-0.5">
                  {t('Chỉ dùng 1 lần — không lưu vào session', 'One-time only — not saved to session')}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => extraImagesRef.current?.click()}
                className={`w-full py-2.5 rounded-2xl text-xs font-bold border transition-all active:scale-[0.98] ${
                  isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-white text-slate-800'
                }`}
              >
                {t('Thêm ảnh', 'Add images')}
              </button>

              <div className="flex flex-wrap gap-2 min-h-[90px]">
                {extraImages.length === 0 ? (
                  <div className={`w-full rounded-2xl border border-dashed p-4 text-center text-[11px] ${isDark ? 'border-white/10 text-white/40' : 'border-slate-200 text-slate-400'}`}>
                    {t('Thêm ảnh cho lần generate hiện tại.', 'Add images for this current generation.')}
                  </div>
                ) : (
                  extraImageUrls.map((url, idx) => (
                    <div key={idx} className="relative h-14 w-14 rounded-xl overflow-hidden border border-white/10 group">
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
                  : 'border-white/80 bg-white/75 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  {t('Ảnh xem trước', 'Studio Preview')}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await saveAndShareMedia(activePreviewUrl, `wynmotion_studio_${Date.now()}.png`);
                    }}
                    className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 active:scale-95"
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
                    className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 active:scale-95"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden max-h-[360px] flex items-center justify-center bg-black/60 border border-white/10">
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

          {/* Bottom Card: INSPIRATION (Browse inspiration — Image 1 Layout) */}
          <div
            className={`rounded-[30px] border p-4 sm:p-5 backdrop-blur-2xl ${
              isDark
                ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border-white/80 bg-white/72 shadow-lg'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-violet-500 flex items-center justify-center shadow-lg shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-[10px] uppercase tracking-[0.24em] font-black ${isDark ? 'text-amber-200/70' : 'text-amber-700/70'}`}>
                    INSPIRATION
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-white">{t('Tìm ảnh cảm hứng', 'Browse inspiration')}</h3>
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
                    isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-violet-400/60' : 'border-slate-200 bg-white text-slate-900'
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
                      ? 'border-violet-500/60 bg-violet-500/20 text-violet-200 shadow-sm'
                      : isDark
                      ? 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      : 'border-slate-200 bg-white text-slate-600'
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
                    <div key={img.id} className="group relative rounded-2xl overflow-hidden aspect-square border border-white/10 bg-black/40">
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
                      className="h-9 px-5 rounded-2xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all flex items-center gap-1.5"
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
          4. VIEW MODE 2: 10 CUSTOM TOOLS (Exact Web Parity — Image 3)
          ───────────────────────────────────────────────────────────── */}
      {mainView === 'tools' && (
        <div className="space-y-4">
          {!selectedTool ? (
            // ── Grid View: 10 Tool Cards — Clean & Exact Web Layout (Image 3) ──
            <div className="space-y-4 animate-in fade-in duration-200">
              <div
                className={`rounded-[30px] border p-4 sm:p-5 backdrop-blur-2xl ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'border-white/80 bg-white/72 shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-[18px] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-[0.24em] font-black ${
                      isDark ? 'text-fuchsia-200/70' : 'text-fuchsia-700/70'
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
                            : 'border-slate-200/80 bg-white/80 hover:border-slate-300 hover:bg-white shadow-sm'
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
            // ── Dedicated Tool Screen With Glowing Header & Form ──
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
              {/* Back Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedTool(null)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                    isDark ? 'bg-[#121522] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('Quay Lại Danh Sách', 'Back to Tools')}</span>
                </button>
              </div>

              {/* Glowing Tool Header with Tag, Title & Full Description */}
              <div
                className={`rounded-[30px] border p-4 sm:p-6 backdrop-blur-2xl ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'border-white/80 bg-white/75 shadow-lg'
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

                {/* Form Container */}
                <div
                  className={`rounded-[24px] border p-4 sm:p-5 space-y-4 ${
                    isDark ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-white/90'
                  }`}
                >
                  {/* ────────────────── TOOL 1: PHOTOREALISTIC ────────────────── */}
                  {selectedTool === 'photorealistic' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-white flex items-center justify-between mb-1.5">
                          <span>{t('Mô tả chi tiết cảnh', 'Detailed Scene Description')} <span className="text-rose-500">*</span></span>
                          <span className="text-[10px] text-slate-400">{photoPrompt.length}/500</span>
                        </label>
                        <textarea
                          value={photoPrompt}
                          onChange={(e) => setPhotoPrompt(e.target.value)}
                          rows={4}
                          maxLength={500}
                          placeholder={t(
                            'Ví dụ: Một chiếc xe hơi mui trần màu đỏ vintage thập niên 1960 đỗ trên đường ven biển lúc hoàng hôn...',
                            'Example: A vintage 1960s red convertible car parked on a coastal highway during sunset...'
                          )}
                          className={`w-full p-3 rounded-xl text-xs outline-none border resize-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                            {t('Kiểu ánh sáng (Tùy chọn)', 'Lighting (Optional)')}
                          </label>
                          <select
                            value={photoLighting}
                            onChange={(e) => setPhotoLighting(e.target.value)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                              isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="">{t('-- Chọn ánh sáng --', '-- Select lighting --')}</option>
                            <option value="Natural">{t('Ánh sáng tự nhiên', 'Natural')}</option>
                            <option value="Studio">{t('Ánh sáng studio', 'Studio')}</option>
                            <option value="Cinematic">{t('Ánh sáng điện ảnh', 'Cinematic')}</option>
                            <option value="Golden Hour">{t('Giờ vàng', 'Golden Hour')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                            {t('Góc máy (Tùy chọn)', 'Camera Angle (Optional)')}
                          </label>
                          <select
                            value={photoCameraAngle}
                            onChange={(e) => setPhotoCameraAngle(e.target.value)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                              isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="">{t('-- Chọn góc máy --', '-- Select camera angle --')}</option>
                            <option value="Wide Angle">{t('Góc rộng', 'Wide Angle')}</option>
                            <option value="Macro">{t('Góc cận cảnh (Macro)', 'Macro')}</option>
                            <option value="Drone View">{t('Góc flycam', 'Drone View')}</option>
                            <option value="Eye Level">{t('Góc ngang tầm mắt', 'Eye Level')}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Tỷ lệ khung hình', 'Aspect Ratio')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setPhotoAspectRatio(ratio)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                photoAspectRatio === ratio
                                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-sm'
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

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                          {t('Negative Prompt (Những gì cần tránh - Tùy chọn)', 'Negative Prompt (Optional)')}
                        </label>
                        <input
                          type="text"
                          value={photoNegativePrompt}
                          onChange={(e) => setPhotoNegativePrompt(e.target.value)}
                          placeholder="Ví dụ: blur, distortion, low quality, watermark"
                          className={`w-full p-2.5 rounded-xl text-xs border outline-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* ────────────────── TOOL 2: STYLIZED ART ────────────────── */}
                  {selectedTool === 'stylized' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-white flex items-center justify-between mb-1.5">
                          <span>{t('Mô tả đối tượng cần vẽ', 'Object Description')} <span className="text-rose-500">*</span></span>
                          <span className="text-[10px] text-slate-400">{stylizedPrompt.length}/500</span>
                        </label>
                        <textarea
                          value={stylizedPrompt}
                          onChange={(e) => setStylizedPrompt(e.target.value)}
                          rows={4}
                          maxLength={500}
                          placeholder={t(
                            'Ví dụ: Một con gấu trúc đỏ đáng yêu đang ăn tre trong rừng trúc mùa thu...',
                            'Example: A cute red panda eating bamboo in a forest during autumn...'
                          )}
                          className={`w-full p-3 rounded-xl text-xs outline-none border resize-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                          {t('Phong cách nghệ thuật', 'Art Style')} <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={stylizedStyle}
                          onChange={(e) => setStylizedStyle(e.target.value as any)}
                          className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="Anime">Anime</option>
                          <option value="3D Render">Render 3D</option>
                          <option value="Watercolor">{t('Màu nước', 'Watercolor')}</option>
                          <option value="Oil Painting">{t('Tranh sơn dầu', 'Oil Painting')}</option>
                          <option value="Flat Design">{t('Thiết kế phẳng', 'Flat Design')}</option>
                          <option value="Sticker Art">{t('Nghệ thuật sticker', 'Sticker Art')}</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2.5 py-1">
                        <input
                          type="checkbox"
                          id="stk-mode"
                          checked={stylizedStickerMode}
                          onChange={(e) => setStylizedStickerMode(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 text-[#FF2D55] focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="stk-mode" className="text-xs font-bold text-slate-300 cursor-pointer">
                          {t('Chế độ sticker (nền trắng, đường viền rõ nét)', 'Sticker mode (white background, clean outlines)')}
                        </label>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Tỷ lệ khung hình', 'Aspect Ratio')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setStylizedAspectRatio(ratio)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                stylizedAspectRatio === ratio
                                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-sm'
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
                    </div>
                  )}

                  {/* ────────────────── TOOL 3: LOGO DESIGN ────────────────── */}
                  {selectedTool === 'logo' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-white flex items-center justify-between mb-1.5">
                          <span>{t('Tên thương hiệu', 'Brand Name')} <span className="text-rose-500">*</span></span>
                          <span className="text-[10px] text-slate-400">{logoBrandName.length}/50</span>
                        </label>
                        <input
                          type="text"
                          value={logoBrandName}
                          onChange={(e) => setLogoBrandName(e.target.value)}
                          maxLength={50}
                          placeholder={t('Ví dụ: TechFlow, WynMotion', 'Example: TechFlow, WynMotion')}
                          className={`w-full p-2.5 rounded-xl text-xs outline-none border ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                            {t('Khẩu hiệu (Tùy chọn)', 'Tagline (Optional)')}
                          </label>
                          <input
                            type="text"
                            value={logoTagline}
                            onChange={(e) => setLogoTagline(e.target.value)}
                            placeholder="Ví dụ: Innovation in Motion"
                            className={`w-full p-2.5 rounded-xl text-xs border outline-none ${
                              isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                            {t('Ngành nghề', 'Industry')} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={logoIndustry}
                            onChange={(e) => setLogoIndustry(e.target.value)}
                            placeholder="Ví dụ: Tech Startup, Coffee Shop"
                            className={`w-full p-2.5 rounded-xl text-xs border outline-none ${
                              isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                            {t('Phong cách logo', 'Logo Style')} <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={logoStyle}
                            onChange={(e) => setLogoStyle(e.target.value as any)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                              isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="Modern">{t('Hiện đại (Modern)', 'Modern')}</option>
                            <option value="Minimalist">{t('Tối giản (Minimalist)', 'Minimalist')}</option>
                            <option value="Vintage">{t('Cổ điển (Vintage)', 'Vintage')}</option>
                            <option value="Luxury">{t('Sang trọng (Luxury)', 'Luxury')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                            {t('Bảng màu (Tùy chọn)', 'Color Palette (Optional)')}
                          </label>
                          <input
                            type="text"
                            value={logoColorPalette}
                            onChange={(e) => setLogoColorPalette(e.target.value)}
                            placeholder="Ví dụ: Cyan & Violet Gradient"
                            className={`w-full p-2.5 rounded-xl text-xs border outline-none ${
                              isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                          {t('Chi tiết hình ảnh mong muốn (Tùy chọn)', 'Visual Elements (Optional)')}
                        </label>
                        <input
                          type="text"
                          value={logoVisualElements}
                          onChange={(e) => setLogoVisualElements(e.target.value)}
                          placeholder="Ví dụ: Geometric waves, AI node connections"
                          className={`w-full p-2.5 rounded-xl text-xs border outline-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Tỷ lệ khung hình', 'Aspect Ratio')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setLogoAspectRatio(ratio)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                logoAspectRatio === ratio
                                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-sm'
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
                    </div>
                  )}

                  {/* ────────────────── TOOL 4: OBJECT EDIT ────────────────── */}
                  {selectedTool === 'object-edit' && (
                    <div className="space-y-4">
                      <input
                        ref={oeFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setOeImageFile(f);
                            setOeImagePreview(URL.createObjectURL(f));
                          }
                          e.target.value = '';
                        }}
                      />

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Ảnh gốc cần chỉnh sửa', 'Original Image')} <span className="text-rose-500">*</span>
                        </label>
                        {oeImagePreview ? (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-48 flex items-center justify-center bg-black/40">
                            <img src={oeImagePreview} alt="Original" className="max-h-48 object-contain" />
                            <button
                              type="button"
                              onClick={() => {
                                setOeImageFile(null);
                                setOeImagePreview(null);
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => oeFileInputRef.current?.click()}
                            className={`w-full py-7 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                              isDark ? 'border-slate-800 bg-[#090B12] hover:border-slate-700' : 'border-slate-300 bg-slate-50'
                            }`}
                          >
                            <Upload className="w-6 h-6 text-violet-400" />
                            <span className="text-xs font-bold text-white">{t('Chạm để tải ảnh lên (PNG/JPG)', 'Tap to upload original image')}</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Đối tượng cần sửa trong ảnh', 'Target Object')} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={oeTargetObject}
                          onChange={(e) => setOeTargetObject(e.target.value)}
                          maxLength={100}
                          placeholder={t('Ví dụ: Chiếc áo thun, Kính râm, Chiếc xe màu trắng...', 'Example: The t-shirt, The sunglasses, The white car...')}
                          className={`w-full p-2.5 rounded-xl text-xs border outline-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Mô tả hành động / thay đổi chi tiết', 'Modification Description')} <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          value={oeModification}
                          onChange={(e) => setOeModification(e.target.value)}
                          rows={3}
                          maxLength={200}
                          placeholder={t(
                            'Ví dụ: Đổi thành áo khoác da màu đen có khóa kéo kim loại sáng bóng...',
                            'Example: Change into a black leather jacket with shiny metallic zipper...'
                          )}
                          className={`w-full p-3 rounded-xl text-xs outline-none border resize-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="flex items-center gap-2.5 py-1">
                        <input
                          type="checkbox"
                          id="oe-bg"
                          checked={oePreserveBg}
                          onChange={(e) => setOePreserveBg(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 text-[#FF2D55] focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="oe-bg" className="text-xs font-bold text-slate-300 cursor-pointer">
                          {t('Giữ nguyên tuyệt đối phần nền còn lại', 'Preserve background unchanged')}
                        </label>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Tỷ lệ khung hình', 'Aspect Ratio')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setOeAspectRatio(ratio)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                oeAspectRatio === ratio
                                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-sm'
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
                    </div>
                  )}

                  {/* ────────────────── TOOL 5: COMPOSITION ────────────────── */}
                  {selectedTool === 'composition' && (
                    <div className="space-y-4">
                      <input
                        ref={compBaseInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setCompBaseFile(f);
                            setCompBasePreview(URL.createObjectURL(f));
                          }
                          e.target.value = '';
                        }}
                      />
                      <input
                        ref={compOverlayInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            const newPreviews = files.map((f) => URL.createObjectURL(f));
                            setCompOverlayFiles((prev) => [...prev, ...files].slice(0, 5));
                            setCompOverlayPreviews((prev) => [...prev, ...newPreviews].slice(0, 5));
                          }
                          e.target.value = '';
                        }}
                      />

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Ảnh nền cơ sở (Base Image)', 'Base Background Image')} <span className="text-rose-500">*</span>
                        </label>
                        {compBasePreview ? (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-40 flex items-center justify-center bg-black/40">
                            <img src={compBasePreview} alt="Base" className="max-h-40 object-contain" />
                            <button
                              type="button"
                              onClick={() => {
                                setCompBaseFile(null);
                                setCompBasePreview(null);
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => compBaseInputRef.current?.click()}
                            className={`w-full py-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all ${
                              isDark ? 'border-slate-800 bg-[#090B12]' : 'border-slate-300 bg-slate-50'
                            }`}
                          >
                            <Upload className="w-5 h-5 text-emerald-400" />
                            <span className="text-[11px] font-bold text-white">{t('Tải ảnh nền cơ sở (Base Image)', 'Upload Base Image')}</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-white">
                            {t('Ảnh lớp phủ ghép vào (Tối đa 5 ảnh)', 'Overlay Images (Max 5)')}
                          </label>
                          <button
                            type="button"
                            onClick={() => compOverlayInputRef.current?.click()}
                            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> {t('Thêm ảnh', 'Add Image')}
                          </button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none min-h-[50px]">
                          {compOverlayPreviews.length === 0 ? (
                            <span className="text-[11px] text-slate-500 italic py-2">{t('Chưa có ảnh lớp phủ nào', 'No overlay images yet')}</span>
                          ) : (
                            compOverlayPreviews.map((url, idx) => (
                              <div key={idx} className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-emerald-500/30">
                                <img src={url} alt="Overlay" className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    URL.revokeObjectURL(url);
                                    setCompOverlayFiles((prev) => prev.filter((_, i) => i !== idx));
                                    setCompOverlayPreviews((prev) => prev.filter((_, i) => i !== idx));
                                  }}
                                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 text-rose-400"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Mô tả bố cục ghép ảnh', 'Composition Description')} <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          value={compPrompt}
                          onChange={(e) => setCompPrompt(e.target.value)}
                          rows={3}
                          placeholder={t(
                            'Ví dụ: Đặt vật thể vào góc phải của bức ảnh nền, hòa trộn ánh sáng hoàng hôn và đổ bóng tự nhiên...',
                            'Example: Place overlay subject onto right side of base background with sunset lighting match...'
                          )}
                          className={`w-full p-3 rounded-xl text-xs outline-none border resize-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                            {t('Phong cách bố cục', 'Composition Style')}
                          </label>
                          <select
                            value={compStyle}
                            onChange={(e) => setCompStyle(e.target.value as any)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                              isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="realistic">{t('Chân thực (Realistic)', 'Realistic')}</option>
                            <option value="artistic">{t('Nghệ thuật (Artistic)', 'Artistic')}</option>
                            <option value="professional">{t('Chuyên nghiệp (Professional)', 'Professional')}</option>
                            <option value="collage">{t('Collage sáng tạo', 'Collage')}</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id="comp-light"
                            checked={compLightingAdj}
                            onChange={(e) => setCompLightingAdj(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-700 text-[#FF2D55] focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="comp-light" className="text-xs font-bold text-slate-300 cursor-pointer">
                            {t('Tự động khớp ánh sáng', 'Match lighting')}
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Tỷ lệ khung hình', 'Aspect Ratio')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setCompAspectRatio(ratio)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                compAspectRatio === ratio
                                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-sm'
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
                    </div>
                  )}

                  {/* ────────────────── TOOL 6: SEQUENTIAL ART ────────────────── */}
                  {selectedTool === 'sequential' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-white flex items-center justify-between mb-1.5">
                          <span>{t('Mô tả câu chuyện / kịch bản chuỗi', 'Story Script')} <span className="text-rose-500">*</span></span>
                          <span className="text-[10px] text-slate-400">{seqScript.length}/500</span>
                        </label>
                        <textarea
                          value={seqScript}
                          onChange={(e) => setSeqScript(e.target.value)}
                          rows={4}
                          maxLength={500}
                          placeholder={t(
                            'Ví dụ: Một điệp viên đứng dưới mưa trong con hẻm tối. Anh phát hiện dấu vết bí ẩn trên tường và rút thiết bị quét laser ra...',
                            'Example: A detective in the rain in a dark alley. He spots a mysterious symbol on the wall and pulls out his scanner...'
                          )}
                          className={`w-full p-3 rounded-xl text-xs outline-none border resize-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                            {t('Số lượng panels', 'Panel Count')} ({seqPanelCount})
                          </label>
                          <input
                            type="range"
                            min={1}
                            max={4}
                            value={seqPanelCount}
                            onChange={(e) => setSeqPanelCount(parseInt(e.target.value))}
                            className="w-full accent-[#FF2D55] cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                            {t('Phong cách nghệ thuật', 'Art Style')} <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={seqStyle}
                            onChange={(e) => setSeqStyle(e.target.value as any)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                              isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="Comic Book">Comic Book</option>
                            <option value="Manga">Manga</option>
                            <option value="Storyboard Sketch">Storyboard Sketch</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Tỷ lệ khung hình', 'Aspect Ratio')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setSeqAspectRatio(ratio)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                seqAspectRatio === ratio
                                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-sm'
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
                    </div>
                  )}

                  {/* ────────────────── TOOL 7: MOCKUP ────────────────── */}
                  {selectedTool === 'mockup' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-white flex items-center justify-between mb-1.5">
                          <span>{t('Mô tả sản phẩm và bối cảnh', 'Product & Scene Description')} <span className="text-rose-500">*</span></span>
                          <span className="text-[10px] text-slate-400">{mockupScene.length}/300</span>
                        </label>
                        <textarea
                          value={mockupScene}
                          onChange={(e) => setMockupScene(e.target.value)}
                          rows={4}
                          maxLength={300}
                          placeholder={t(
                            'Ví dụ: Một chiếc smartphone màn hình cong cao cấp đặt trên bàn làm việc gỗ hiện đại cùng cốc cà phê và cây xanh...',
                            'Example: A sleek modern smartphone placed on a wooden desk with a coffee mug and indoor plant...'
                          )}
                          className={`w-full p-3 rounded-xl text-xs outline-none border resize-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                          {t('Kiểu đặt sản phẩm', 'Placement Type')} <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={mockupPlacement}
                          onChange={(e) => setMockupPlacement(e.target.value as any)}
                          className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="Tabletop">{t('Trên bàn (Tabletop)', 'Tabletop')}</option>
                          <option value="Model Wearing">{t('Người mẫu mang / mặc (Model Wearing)', 'Model Wearing')}</option>
                          <option value="Outdoor">{t('Ngoài trời (Outdoor)', 'Outdoor')}</option>
                          <option value="Studio Backdrop">{t('Phông studio chuyên nghiệp (Studio Backdrop)', 'Studio Backdrop')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Tỷ lệ khung hình', 'Aspect Ratio')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setMockupAspectRatio(ratio)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                mockupAspectRatio === ratio
                                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-sm'
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
                    </div>
                  )}

                  {/* ────────────────── TOOL 8: STYLE TRANSFER ────────────────── */}
                  {selectedTool === 'style-transfer' && (
                    <div className="space-y-4">
                      <input
                        ref={stFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setStImageFile(f);
                            setStImagePreview(URL.createObjectURL(f));
                          }
                          e.target.value = '';
                        }}
                      />

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Ảnh gốc cần chuyển phong cách', 'Original Image')} <span className="text-rose-500">*</span>
                        </label>
                        {stImagePreview ? (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-48 flex items-center justify-center bg-black/40">
                            <img src={stImagePreview} alt="Original" className="max-h-48 object-contain" />
                            <button
                              type="button"
                              onClick={() => {
                                setStImageFile(null);
                                setStImagePreview(null);
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => stFileInputRef.current?.click()}
                            className={`w-full py-7 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                              isDark ? 'border-slate-800 bg-[#090B12] hover:border-slate-700' : 'border-slate-300 bg-slate-50'
                            }`}
                          >
                            <Upload className="w-6 h-6 text-purple-400" />
                            <span className="text-xs font-bold text-white">{t('Chạm để tải ảnh lên (PNG/JPG)', 'Tap to upload original image')}</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Chọn phong cách đích', 'Target Style Preset')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {STYLE_TRANSFER_PRESETS.map((pst) => (
                            <button
                              key={pst.name}
                              type="button"
                              onClick={() => setStTargetStyle(pst.name)}
                              className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all truncate text-left ${
                                stTargetStyle === pst.name
                                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-sm'
                                  : isDark
                                  ? 'bg-[#090B12] border-slate-800 text-slate-300'
                                  : 'bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                            >
                              {pst.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                          {t('Hoặc nhập mô tả phong cách tùy chỉnh', 'Or custom style description')}
                        </label>
                        <input
                          type="text"
                          value={stTargetStyle}
                          onChange={(e) => setStTargetStyle(e.target.value)}
                          placeholder="Ví dụ: Van Gogh Starry Night with thick oil strokes"
                          className={`w-full p-2.5 rounded-xl text-xs border outline-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                          {t('Độ mạnh áp dụng phong cách', 'Strength')} ({stStrength}%)
                        </label>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          value={stStrength}
                          onChange={(e) => setStStrength(parseInt(e.target.value))}
                          className="w-full accent-[#FF2D55] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2.5 py-1">
                        <input
                          type="checkbox"
                          id="st-pres"
                          checked={stPreserveStructure}
                          onChange={(e) => setStPreserveStructure(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 text-[#FF2D55] focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="st-pres" className="text-xs font-bold text-slate-300 cursor-pointer">
                          {t('Giữ nguyên bố cục và cấu trúc ảnh gốc', 'Preserve structure of original image')}
                        </label>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Tỷ lệ khung hình', 'Aspect Ratio')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setStAspectRatio(ratio)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                stAspectRatio === ratio
                                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-sm'
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
                    </div>
                  )}

                  {/* ────────────────── TOOL 9: INPAINTING ────────────────── */}
                  {selectedTool === 'inpainting' && (
                    <div className="space-y-4">
                      <input
                        ref={inFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setInImageFile(f);
                            setInImagePreview(URL.createObjectURL(f));
                          }
                          e.target.value = '';
                        }}
                      />
                      <input
                        ref={inMaskInputRef}
                        type="file"
                        accept="image/png"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setInMaskFile(f);
                            setInMaskPreview(URL.createObjectURL(f));
                          }
                          e.target.value = '';
                        }}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-bold text-white mb-1.5 block">
                            {t('Ảnh gốc', 'Original Image')} <span className="text-rose-500">*</span>
                          </label>
                          {inImagePreview ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-36 flex items-center justify-center bg-black/40">
                              <img src={inImagePreview} alt="Original" className="max-h-36 object-contain" />
                              <button
                                type="button"
                                onClick={() => {
                                  setInImageFile(null);
                                  setInImagePreview(null);
                                }}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => inFileInputRef.current?.click()}
                              className={`w-full py-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all ${
                                isDark ? 'border-slate-800 bg-[#090B12]' : 'border-slate-300 bg-slate-50'
                              }`}
                            >
                              <Upload className="w-5 h-5 text-teal-400" />
                              <span className="text-[11px] font-bold text-white">{t('Tải ảnh gốc', 'Upload Image')}</span>
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-white mb-1.5 block">
                            {t('Ảnh Mask (Tùy chọn)', 'Mask PNG (Optional)')}
                          </label>
                          {inMaskPreview ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-36 flex items-center justify-center bg-black/40">
                              <img src={inMaskPreview} alt="Mask" className="max-h-36 object-contain" />
                              <button
                                type="button"
                                onClick={() => {
                                  setInMaskFile(null);
                                  setInMaskPreview(null);
                                }}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => inMaskInputRef.current?.click()}
                              className={`w-full py-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all ${
                                isDark ? 'border-slate-800 bg-[#090B12]' : 'border-slate-300 bg-slate-50'
                              }`}
                            >
                              <Upload className="w-5 h-5 text-slate-500" />
                              <span className="text-[11px] font-bold text-slate-400">{t('Tải Mask PNG', 'Upload Mask')}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Mô tả những gì cần vẽ vào vùng chọn', 'Prompt')} <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          value={inPrompt}
                          onChange={(e) => setInPrompt(e.target.value)}
                          rows={3}
                          placeholder={t(
                            'Ví dụ: Thêm một chiếc đồng hồ đeo tay thông minh hiện đại vào cổ tay người mẫu...',
                            'Example: Add a modern smartwatch onto the model wrist...'
                          )}
                          className={`w-full p-3 rounded-xl text-xs outline-none border resize-none ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                            {t('Hành động', 'Action')} <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={inAction}
                            onChange={(e) => setInAction(e.target.value as any)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                              isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="add">{t('Thêm đối tượng (Add)', 'Add')}</option>
                            <option value="remove">{t('Xóa đối tượng (Remove)', 'Remove')}</option>
                            <option value="replace">{t('Thay thế đối tượng (Replace)', 'Replace')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                            {t('Kiểu hòa trộn', 'Blend Mode')}
                          </label>
                          <select
                            value={inBlendMode}
                            onChange={(e) => setInBlendMode(e.target.value as any)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                              isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="natural">{t('Tự nhiên (Natural)', 'Natural')}</option>
                            <option value="seamless">{t('Mịn màng liền mạch (Seamless)', 'Seamless')}</option>
                            <option value="artistic">{t('Nghệ thuật (Artistic)', 'Artistic')}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Tỷ lệ khung hình', 'Aspect Ratio')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setInAspectRatio(ratio)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                inAspectRatio === ratio
                                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-sm'
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
                    </div>
                  )}

                  {/* ────────────────── TOOL 10: BACKGROUND ────────────────── */}
                  {selectedTool === 'background' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-white flex items-center justify-between mb-1.5">
                          <span>{t('Chủ đề background', 'Background Theme')} <span className="text-rose-500">*</span></span>
                          <span className="text-[10px] text-slate-400">{bgTheme.length}/200</span>
                        </label>
                        <input
                          type="text"
                          value={bgTheme}
                          onChange={(e) => setBgTheme(e.target.value)}
                          maxLength={200}
                          placeholder={t('Ví dụ: Thành phố cyberpunk về đêm, Thiên nhiên rừng thông sương mù...', 'Example: Cyberpunk city at night, Foggy pine forest...')}
                          className={`w-full p-2.5 rounded-xl text-xs outline-none border ${
                            isDark ? 'bg-[#090B12] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="flex items-center gap-2.5 py-1">
                        <input
                          type="checkbox"
                          id="bg-min"
                          checked={bgMinimalistMode}
                          onChange={(e) => setBgMinimalistMode(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 text-[#FF2D55] focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="bg-min" className="text-xs font-bold text-slate-300 cursor-pointer">
                          {t('Chế độ tối giản (có không gian trống để đặt chữ)', 'Minimalist mode (with negative space for text)')}
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {bgMinimalistMode && (
                          <div>
                            <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                              {t('Vị trí không gian trống', 'Negative Space Position')}
                            </label>
                            <select
                              value={bgNegativeSpace}
                              onChange={(e) => setBgNegativeSpace(e.target.value as any)}
                              className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                                isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="Center">{t('Giữa', 'Center')}</option>
                              <option value="Left">{t('Bên trái', 'Left')}</option>
                              <option value="Right">{t('Bên phải', 'Right')}</option>
                              <option value="Top">{t('Phía trên', 'Top')}</option>
                            </select>
                          </div>
                        )}

                        <div className={bgMinimalistMode ? '' : 'col-span-2'}>
                          <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                            {t('Tông màu chủ đạo', 'Color Mood')}
                          </label>
                          <select
                            value={bgColorMood}
                            onChange={(e) => setBgColorMood(e.target.value as any)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                              isDark ? 'bg-[#090B12] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="Dark">{t('Tối & Bí ẩn (Dark)', 'Dark')}</option>
                            <option value="Light">{t('Sáng & Tinh tế (Light)', 'Light')}</option>
                            <option value="Pastel">{t('Pastel dịu nhẹ (Pastel)', 'Pastel')}</option>
                            <option value="Vibrant">{t('Rực rỡ nổi bật (Vibrant)', 'Vibrant')}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white mb-1.5 block">
                          {t('Tỷ lệ khung hình', 'Aspect Ratio')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setBgAspectRatio(ratio)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                bgAspectRatio === ratio
                                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-sm'
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
                    </div>
                  )}

                  {/* Submit Button for Active Tool */}
                  <button
                    type="button"
                    onClick={handleExecuteTool}
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
                        <span>{t('Đang tạo ảnh AI...', 'Generating AI...')} ({elapsedTime}s)</span>
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
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. VIEW MODE 3: REMOVE BACKGROUND TOOL
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setRemoveBgFile(file);
                setRemoveBgPreview(URL.createObjectURL(file));
              }
              e.target.value = '';
            }}
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
          6. RESULT CARD & LIGHTBOX PREVIEW
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
    </div>
  );
};
