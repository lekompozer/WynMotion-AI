'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { wynmotionService } from '@/services/wynmotionService';
import { Loader2 } from 'lucide-react';

export interface CapCutTemplateData {
  id: 'ads_strobe_teaser' | 'ads_cinematic_showcase' | 'product_ads_motion' | 'animation_ads_image_veo' | 'animation_ads_image_veo_2';
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  durationSec: number;
  videoUrl: string;
  bgmUrl: string;
  badge: string;
  usageCount: string;
  maxImages: number;
  defaultHookVi: string;
  defaultHookEn: string;
  defaultSolidVi: string;
  defaultSolidEn: string;
  defaultOutlineVi: string;
  defaultOutlineEn: string;
  defaultSloganVi: string;
  defaultSloganEn: string;
}

export const CAPCUT_ADS_TEMPLATES: Record<string, CapCutTemplateData> = {
  animation_ads_image_veo: {
    id: 'animation_ads_image_veo',
    titleVi: 'Animation Ads Image (Google VEO 3.1 VIP)',
    titleEn: 'Animation Ads Image (Google VEO 3.1 VIP)',
    descVi: 'Tải 1 ảnh Ads Poster → AI Gemini 3.8 & Google VEO 3.1 sinh video chuyển động điện ảnh siêu thực 6s/9s/12s chuẩn Hollywood.',
    descEn: 'Upload 1 Ads Poster → Gemini 3.8 & Google VEO 3.1 generate hyper-realistic cinematic commercial animation video.',
    durationSec: 12.0,
    videoUrl: '/templates/animation_ads_image_demo.mp4',
    bgmUrl: '',
    badge: '👑 VIP VEO 3.1',
    usageCount: '95.4K',
    maxImages: 1,
    defaultHookVi: 'SIÊU PHẨM MỚI',
    defaultHookEn: 'NEW ARRIVAL',
    defaultSolidVi: 'LUXURY',
    defaultSolidEn: 'LUXURY',
    defaultOutlineVi: 'EDITION',
    defaultOutlineEn: 'EDITION',
    defaultSloganVi: '⚡ TRẢI NGHIỆM ĐẲNG CẤP - ĐẶT HÀNG NGAY',
    defaultSloganEn: '⚡ EXPERIENCE LUXURY - ORDER NOW',
  },
  animation_ads_image_veo_2: {
    id: 'animation_ads_image_veo_2',
    titleVi: 'Animation Ads Image 6s (Cinematic Flow)',
    titleEn: 'Animation Ads Image 6s (Cinematic Flow)',
    descVi: 'Tải 1 ảnh Ads Poster → Google VEO 3.1 tạo video chuyển động điện ảnh mềm mại 6s chuẩn quảng cáo cao cấp.',
    descEn: 'Upload 1 Ads Poster → Google VEO 3.1 creates smooth 6s cinematic commercial animation video.',
    durationSec: 6.0,
    videoUrl: '/templates/animation_ads_image_demo_2.mp4',
    bgmUrl: '',
    badge: '👑 VIP VEO 6s',
    usageCount: '64.2K',
    maxImages: 1,
    defaultHookVi: 'SIÊU PHẨM MỚI',
    defaultHookEn: 'NEW ARRIVAL',
    defaultSolidVi: 'DISCOVER',
    defaultSolidEn: 'DISCOVER',
    defaultOutlineVi: 'NOW',
    defaultOutlineEn: 'NOW',
    defaultSloganVi: '⚡ TRẢI NGHIỆM ĐẲNG CẤP - ĐẶT HÀNG NGAY',
    defaultSloganEn: '⚡ EXPERIENCE LUXURY - ORDER NOW',
  },
  product_ads_motion: {
    id: 'product_ads_motion',
    titleVi: 'Universal Images Product Video',
    titleEn: 'Universal Images Product Video',
    descVi: 'Đạo diễn AI Gemini 3.8 tự do điều phối 125 Transitions GLSL & 40 Hiệu ứng thị giác theo nhịp beat (1-10 ảnh).',
    descEn: 'Universal AI Motion Director with 125+ GLSL Shaders, 40 visual effects & dynamic 1-10 photos layout.',
    durationSec: 15.0,
    videoUrl: '/templates/animation_ads_image_demo.mp4',
    bgmUrl: '',
    badge: '💎 AI MOTION 10-60s',
    usageCount: '88.5K',
    maxImages: 10,
    defaultHookVi: 'SIÊU PHẨM MỚI',
    defaultHookEn: 'NEW ARRIVAL',
    defaultSolidVi: 'ORDER',
    defaultSolidEn: 'ORDER',
    defaultOutlineVi: 'NOW',
    defaultOutlineEn: 'NOW',
    defaultSloganVi: '⚡ ĐẶT HÀNG NGAY - SỐ LƯỢNG CÓ HẠN',
    defaultSloganEn: '⚡ LIMITED TIME OFFER - ORDER NOW',
  },
  ads_strobe_teaser: {
    id: 'ads_strobe_teaser',
    titleVi: 'Strobe Teaser & Big Reveal',
    titleEn: 'Strobe Teaser & Big Reveal',
    descVi: 'Đập chữ nhịp điệu nhanh, chớp nháy vi mô R-E-A-D-Y & hé lộ sản phẩm với chữ 2 tầng Solid/Outline.',
    descEn: 'Fast-paced rhythmic strobe typography with READY letter-flash and cinematic reveal outro.',
    durationSec: 11.7,
    videoUrl: '/templates/strobe_teaser_demo.mp4',
    bgmUrl: '/templates/strobe_teaser_bgm.mp3',
    badge: '⚡ STROBE 11.7s',
    usageCount: '76.9K',
    maxImages: 3,
    defaultHookVi: 'SIÊU PHẨM MỚI',
    defaultHookEn: 'NEW ARRIVAL',
    defaultSolidVi: 'STAY',
    defaultSolidEn: 'STAY',
    defaultOutlineVi: 'TUNED',
    defaultOutlineEn: 'TUNED',
    defaultSloganVi: '⚡ ĐÓN ĐẦU XU HƯỚNG - ƯU ĐÃI HÔM NAY',
    defaultSloganEn: '⚡ DISCOVER THE BEST - ORDER NOW',
  },
  ads_cinematic_showcase: {
    id: 'ads_cinematic_showcase',
    titleVi: 'Cinematic Menu Showcase 22s',
    titleEn: 'Cinematic Menu Showcase 22s',
    descVi: 'Tải 1 ảnh Menu thực đơn → AI tự động quét 7 món ăn ngon mắt, hiệu ứng điện ảnh & Outro bìa Menu 3D.',
    descEn: 'Upload 1 Menu photo → AI automatically scans 7 dishes, cinematic food VFX & 3D Menu Outro.',
    durationSec: 22.0,
    videoUrl: '/templates/cinematic_showcase_demo.mp4',
    bgmUrl: '/templates/cinematic_showcase_bgm.mp3',
    badge: '💎 REEL 22.0s',
    usageCount: '41.2K',
    maxImages: 8,
    defaultHookVi: 'BEST MENU',
    defaultHookEn: 'BEST MENU',
    defaultSolidVi: 'SPECIAL',
    defaultSolidEn: 'SPECIAL',
    defaultOutlineVi: 'CHOICE',
    defaultOutlineEn: 'CHOICE',
    defaultSloganVi: '⚡ TRẢI NGHIỆM ĐẲNG CẤP - ĐẶT HÀNG NGAY',
    defaultSloganEn: '⚡ TASTE THE PERFECTION - ORDER NOW',
  },
};

export interface CapCutTemplateModalProps {
  template: any | null;
  isOpen: boolean;
  onClose: () => void;
  defaultAspectRatio?: '9:16' | '16:9';
  userTier?: 'free' | 'premium' | 'pro' | 'vip';
  onRequireUpgrade?: (tier?: 'premium' | 'vip') => void;
  onApply: (params: {
    template: any;
    prompt: string;
    productImages: string[];
    bgmUrl: string;
    durationSec: number;
    aspectRatio: '9:16' | '16:9';
    hookText?: string;
    ctaText?: string;
    solidText?: string;
    outlineText?: string;
    sloganText?: string;
  }) => void;
}

export const CapCutTemplateModal: React.FC<CapCutTemplateModalProps> = ({
  template,
  isOpen,
  onClose,
  defaultAspectRatio = '9:16',
  userTier = 'free',
  onRequireUpgrade,
  onApply,
}) => {
  const { isVietnamese } = useApp();
  const t = (vi: string, en: string) => (isVietnamese ? vi : en);

  // Normalized template attributes supporting both snake_case API and camelCase legacy
  const title = template ? (isVietnamese ? (template.title_vi || template.titleVi || template.title) : (template.title_en || template.titleEn || template.title)) : '';
  const desc = template ? (isVietnamese ? (template.desc_vi || template.descVi) : (template.desc_en || template.descEn)) : '';
  const durationSec = template ? (template.duration_sec || template.durationSec || 12) : 12;
  const videoUrl = template ? (template.video_demo_url || template.videoUrl || template.local_video_path || '') : '';
  const bgmUrl = template ? (template.bgm_url || template.bgmUrl || template.local_bgm_path || '') : '';
  const badge = template ? (template.badge || (template.is_vip ? '👑 VIP' : '💎 AI VIDEO')) : '💎 AI VIDEO';
  const usageCount = template ? (template.usage_count || template.usageCount || '50K') : '50K';
  const maxImages = template ? (template.max_images || template.maxImages || (template.visual_style === 'animation_ads_image_veo' ? 1 : 10)) : 10;
  const defaultHook = template?.default_params ? (isVietnamese ? template.default_params.hook_text_vi : template.default_params.hook_text_en) : (isVietnamese ? (template?.defaultHookVi || 'SIÊU PHẨM MỚI') : (template?.defaultHookEn || 'NEW ARRIVAL'));
  const defaultSolid = template?.default_params ? (isVietnamese ? template.default_params.solid_text_vi : template.default_params.solid_text_en) : (isVietnamese ? (template?.defaultSolidVi || 'SPECIAL') : (template?.defaultSolidEn || 'SPECIAL'));
  const defaultOutline = template?.default_params ? (isVietnamese ? template.default_params.outline_text_vi : template.default_params.outline_text_en) : (isVietnamese ? (template?.defaultOutlineVi || 'CHOICE') : (template?.defaultOutlineEn || 'CHOICE'));
  const defaultSlogan = template?.default_params ? (isVietnamese ? template.default_params.slogan_vi : template.default_params.slogan_en) : (isVietnamese ? (template?.defaultSloganVi || '⚡ TRẢI NGHIỆM ĐẲNG CẤP - ĐẶT HÀNG NGAY') : (template?.defaultSloganEn || '⚡ EXPERIENCE LUXURY - ORDER NOW'));

  // 3-step intuitive flow: preview -> fill_assets (Step 1) -> fill_texts (Step 2)
  const [step, setStep] = useState<'preview' | 'fill_assets' | 'fill_texts'>('preview');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Form Fields
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>(defaultAspectRatio);
  const [prompt, setPrompt] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [hookText, setHookText] = useState('');
  const [solidText, setSolidText] = useState('');
  const [outlineText, setOutlineText] = useState('');
  const [sloganText, setSloganText] = useState('');
  const [ctaText, setCtaText] = useState('ORDER NOW');
  const [selectedDuration, setSelectedDuration] = useState<number>(15);
  const [customAudioUrl, setCustomAudioUrl] = useState<string>('');
  const [customAudioName, setCustomAudioName] = useState<string>('');
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (template) {
      setStep('preview');
      setIsPlaying(true);
      setAspectRatio(defaultAspectRatio);
      setPrompt(title);
      setHookText(defaultHook);
      setSolidText(defaultSolid);
      setOutlineText(defaultOutline);
      setSloganText(defaultSlogan);
      setCtaText('ORDER NOW');
      setProductImages([]);
      setSelectedDuration(durationSec);
      setCustomAudioUrl(bgmUrl);
      setCustomAudioName('');
    }
  }, [isOpen, template, isVietnamese, defaultAspectRatio]);

  if (!isOpen || !template) return null;

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await wynmotionService.uploadMedia(formData);
      if (res?.url) {
        setCustomAudioUrl(res.url);
        setCustomAudioName(file.name);
        try {
          const audio = new Audio();
          audio.src = res.url;
          audio.onloadedmetadata = () => {
            const dur = Math.min(60, Math.max(5, Math.round(audio.duration)));
            setSelectedDuration(dur);
          };
        } catch (_) {}
      }
    } catch (err) {
      console.error('Audio upload failed:', err);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await wynmotionService.uploadMedia(formData);
        return res?.url;
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
      if (uploadedUrls.length > 0) {
        setProductImages((prev) => [...prev, ...uploadedUrls].slice(0, maxImages));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLaunchCreation = () => {
    if (!['premium', 'pro', 'vip'].includes(userTier)) {
      onRequireUpgrade?.('premium');
      return;
    }
    const finalPrompt = prompt.trim() || title;
    onApply({
      template,
      prompt: finalPrompt,
      productImages,
      bgmUrl: customAudioUrl || bgmUrl,
      durationSec: selectedDuration || durationSec,
      aspectRatio,
      hookText: hookText.trim() || undefined,
      ctaText: ctaText.trim() || undefined,
      solidText: solidText.trim() || undefined,
      outlineText: outlineText.trim() || undefined,
      sloganText: sloganText.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
      {/* Container Dialog: Full screen on mobile, tall 9:16 smartphone preview card on desktop */}
      <div className="relative w-full h-full sm:h-[88vh] sm:max-h-[850px] sm:w-[440px] sm:max-w-[95vw] bg-[#0A0D14] border border-white/10 sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* ─────────────────────────────────────────────────────────────
            VIEW 1: FULLSCREEN VIDEO PREVIEW PLAYER (FLOATING OVERLAY)
            ───────────────────────────────────────────────────────────── */}
        {step === 'preview' && (
          <div className="relative w-full h-full flex flex-col overflow-hidden bg-black">
            {videoUrl ? (
              <>
                {/* Ambient Blurred Video Background for Seamless Letterbox Filling */}
                <video
                  src={videoUrl}
                  autoPlay
                  loop
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-40 scale-110 pointer-events-none"
                />

                {/* Crisp Main Video Player */}
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    onClick={handleTogglePlay}
                    className="w-full h-full object-contain cursor-pointer"
                  />
                </div>
              </>
            ) : (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black p-6 text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500/20 via-pink-500/15 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-3xl shadow-2xl">
                  🎬
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h4 className="text-base font-black text-white">{title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {desc || t(
                      'Mẫu quảng cáo thương hiệu 2.5D Parallax thuần Visual (60fps). Bấm nút bên dưới để tải ảnh sản phẩm và tạo video!',
                      '2.5D Parallax pure visual brand ads (60fps). Click button below to upload product images and create video!'
                    )}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                  <span>✨</span>
                  <span>{t('60fps CapCut Trilogy Animation', '60fps CapCut Trilogy Animation')}</span>
                </div>
              </div>
            )}

            {/* Top Bar Floating on Video */}
            <div
              className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pb-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent"
              style={{ paddingTop: 'max(env(safe-area-inset-top, 44px), 44px)' }}
            >
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg">
                  {badge}
                </span>
                <span className="text-[11px] font-bold text-white/90 drop-shadow">
                  🔥 {usageCount} {t('lượt dùng', 'uses')}
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-sm font-bold border border-white/20 transition-all active:scale-95 cursor-pointer shadow-lg backdrop-blur-md"
              >
                ✕
              </button>
            </div>

            {/* Center Play/Pause indicator */}
            {!isPlaying && (
              <div
                onClick={handleTogglePlay}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white text-2xl shadow-2xl">
                  ▶
                </div>
              </div>
            )}

            {/* Bottom Floating Info & "Use Template" CTA Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-5 pt-16 pb-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent space-y-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2 drop-shadow-md">
                  <span>🎬</span>
                  <span>{isVietnamese ? template.titleVi : template.titleEn}</span>
                </h3>
                <p className="text-xs text-white/80 mt-1 line-clamp-2 drop-shadow leading-snug">
                  {isVietnamese ? template.descVi : template.descEn}
                </p>
              </div>

              {/* Audio strip with mute/unmute */}
              <div className="flex items-center justify-between text-[11px] text-white/90 py-1.5 px-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                <div className="flex items-center gap-2 truncate">
                  <span>🎵</span>
                  <span className="font-semibold truncate">{t('Âm thanh gốc đã đồng bộ nhịp', 'Original Beat-Synced Audio')}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                    }
                    setIsMuted(!isMuted);
                  }}
                  className="text-cyan-300 hover:text-cyan-200 font-bold cursor-pointer ml-2 whitespace-nowrap"
                >
                  {isMuted ? '🔇 Bật tiếng' : '🔊 Tắt tiếng'}
                </button>
              </div>

              {/* Big Use Template Button (App Signature Cyan-Blue Gradient) */}
              <button
                onClick={() => {
                  // ── Template Tier Authorization Check: Require Paid Tier for ALL templates ──
                  const isAnimationAdsImageVip =
                    template?.id?.startsWith('animation_ads_image') ||
                    template?.badge?.includes('VIP') ||
                    template?.title_en?.includes('VEO') ||
                    template?.title_vi?.includes('VEO');

                  if (isAnimationAdsImageVip && userTier !== 'vip') {
                    onRequireUpgrade?.('vip');
                    return;
                  }

                  if (!['premium', 'pro', 'vip'].includes(userTier)) {
                    onRequireUpgrade?.('premium');
                    return;
                  }

                  const isNarrativeStyle =
                    template?.visual_style === 'science_explainer' ||
                    template?.visual_style === 'video_news_60s' ||
                    template?.visual_style === 'whiteboard_stream_hand' ||
                    template?.visual_style === 'handdrawn_fast_doodle' ||
                    template?.visual_style === 'dialogue_scene' ||
                    template?.visual_style === 'character_animation' ||
                    template?.visual_style === 'apple_modern_motion';

                  if (isNarrativeStyle) {
                    onApply({
                      template,
                      prompt: title,
                      productImages: [],
                      bgmUrl,
                      durationSec,
                      aspectRatio,
                    });
                  } else {
                    setStep('fill_assets');
                  }
                }}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 shadow-xl shadow-cyan-500/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡</span>
                <span>{t('SỬ DỤNG MẪU NÀY (USE TEMPLATE)', 'USE THIS TEMPLATE')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VIEW 2: STEP 1/2 — TỈ LỆ & TẢI ẢNH SẢN PHẨM / MENU
            ───────────────────────────────────────────────────────────── */}
        {step === 'fill_assets' && (
          <div className="flex-1 flex flex-col h-full bg-[#0A0D14] text-white overflow-hidden">
            {/* Top Navigation Bar */}
            <div className="pt-12 sm:pt-4 px-4 pb-3 border-b border-white/10 bg-[#0A0D14]/95 flex items-center justify-between gap-2">
              <button
                onClick={() => setStep('preview')}
                className="flex items-center gap-1 text-xs text-cyan-400 font-bold hover:underline cursor-pointer min-h-[36px]"
              >
                <span>←</span>
                <span>{t('Xem video', 'Back to video')}</span>
              </button>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                {t('Bước 1/2: Tải Ảnh & Tỉ Lệ', 'Step 1/2: Photos & Ratio')}
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 px-4 py-4 overflow-y-auto space-y-4">
              {/* Aspect Ratio Selector */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <label className="text-xs font-bold text-white/90 flex items-center justify-between">
                  <span>📐 {t('Tỉ Lệ Khung Hình Video', 'Video Aspect Ratio')}</span>
                  <span className="text-[10px] text-cyan-300 font-bold">{aspectRatio === '9:16' ? 'Dọc (TikTok/Reels)' : 'Ngang (YouTube/TV)'}</span>
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      aspectRatio === '9:16'
                        ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <span>📱 9:16 (Dọc)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      aspectRatio === '16:9'
                        ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <span>🖥️ 16:9 (Ngang)</span>
                  </button>
                </div>
              </div>

              {/* Video Duration Selector */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <label className="text-xs font-bold text-white/90 flex items-center justify-between">
                  <span>⏱️ {t('Thời Lượng Video Ads', 'Video Ad Duration')}</span>
                  <span className="text-[10px] text-cyan-300 font-bold">{selectedDuration}s</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[10, 15, 20, 30, 60].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setSelectedDuration(dur)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        selectedDuration === dur
                          ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-md'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {dur === 10 ? '⚡ 10s' : dur === 15 ? '🔥 15s' : dur === 20 ? '✨ 20s' : dur === 30 ? '💼 30s' : '💎 60s'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Track / Music Beat Selector */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/90 flex items-center gap-1.5">
                    <span>🎵</span>
                    <span>{t('Nhạc Nền / Audio (AI Phân Tích Beat-Sync)', 'Audio Track (AI Beat-Sync)')}</span>
                  </label>
                  {customAudioUrl && (
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Đã nạp ({selectedDuration}s)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomAudioUrl(template.bgmUrl);
                      setCustomAudioName(t('Nhạc Mẫu Chuẩn (Beat Mặc Định)', 'Default Template Beat'));
                      setSelectedDuration(15);
                    }}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all truncate border cursor-pointer ${
                      customAudioUrl === template.bgmUrl
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    🎵 {t('Nhạc Mẫu (15s Beat)', 'Default Beat')}
                  </button>
                  <label className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center border border-dashed border-white/20 bg-white/5 hover:border-cyan-400 hover:text-cyan-300 cursor-pointer truncate">
                    <span>📁 {isUploadingAudio ? t('Đang tải...', 'Uploading...') : t('Tải Audio Riêng', 'Upload Audio')}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {customAudioName && (
                  <p className="text-[11px] text-cyan-300 truncate">
                    🎶 {customAudioName}
                  </p>
                )}
              </div>

              {/* Product Images Slot */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/90">
                    {template.id === 'ads_cinematic_showcase'
                      ? t('📸 8 Ảnh Món Ăn / Menu (Tải 1-8 ảnh)', '📸 8 Food / Menu Images (Upload 1-8)')
                      : template.id === 'product_ads_motion'
                      ? t('📸 Tải 1 - 10 Ảnh Sản Phẩm (Tự động tách nền & phân cảnh AI)', '📸 1-10 Product Images (Auto Cutout & AI Directing)')
                      : t('Ảnh Sản Phẩm / Clip Cuối', 'Hero Media')}
                  </label>
                  <span className="text-[10px] text-cyan-300 font-semibold">{productImages.length}/{template.maxImages}</span>
                </div>

                {template.id === 'product_ads_motion' && (
                  <div className="p-3 bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-transparent border border-purple-500/30 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
                      <span>✨</span>
                      <span>{t('Universal AI Motion Director (1 - 10 ảnh):', 'Universal AI Motion Director (1 - 10 photos):')}</span>
                    </div>
                    <p className="text-[11px] text-white/80 leading-relaxed">
                      {t(
                        'Tải từ 1 đến 10 ảnh sản phẩm. AI tự động sáng tạo kịch bản, 125+ Shaders GLSL, hiệu ứng Strobe Beat & Typography chữ trắng đè lên video độc bản.',
                        'Upload 1 to 10 product photos. AI will auto-orchestrate 125+ GLSL Shaders, Strobe Beats & typography overlay.'
                      )}
                    </p>
                  </div>
                )}

                {template.id === 'ads_cinematic_showcase' && (
                  <div className="p-3 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                      <span>💡</span>
                      <span>{t('Hướng dẫn tải ảnh Menu 8 món (22.0s):', 'Guide for 8-Dish Menu:')}</span>
                    </div>
                    <ul className="text-[11px] text-white/80 space-y-1 pl-4 list-disc leading-relaxed">
                      <li>
                        <strong className="text-cyan-300">{t('Cách 1 (Khuyên dùng):', 'Option 1 (Recommended):')}</strong>{' '}
                        {t(
                          'Tải 1 ảnh chụp Menu thực đơn → AI sẽ tạo đủ 8 món ăn và đưa hình Menu vào quyển menu kết thúc ở cảnh cuối cùng!',
                          'Upload 1 Menu photo → AI will generate all 8 dishes and place the Menu photo into the final closing book outro!'
                        )}
                      </li>
                      <li>
                        <strong className="text-amber-300">{t('Cách 2:', 'Option 2:')}</strong>{' '}
                        {t('Hoặc tải lên từ 1 đến 8 ảnh món ăn / sản phẩm đã có sẵn.', 'Or directly upload 1 to 8 dish / product photos.')}
                      </li>
                    </ul>
                  </div>
                )}

                {/* Bulk upload trigger button */}
                <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold cursor-pointer transition-all">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                      <span>{t('Đang tải ảnh lên...', 'Uploading...')}</span>
                    </>
                  ) : (
                    <>
                      <span>📂</span>
                      <span>{t('Chọn ảnh từ thiết bị (1 hoặc nhiều ảnh, tối đa 10 ảnh)', 'Select photos (Single or Multiple, up to 10)')}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {/* Grid slots */}
                <div className={`grid ${template.maxImages >= 8 ? 'grid-cols-4 sm:grid-cols-5' : template.maxImages > 3 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 pt-1`}>
                  {Array.from({ length: template.maxImages }).map((_, idx) => {
                    const img = productImages[idx];
                    return (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
                          img ? 'border-cyan-500 bg-slate-900 shadow-md' : 'border-white/20 bg-white/5 hover:border-cyan-400/60'
                        }`}
                      >
                        {img ? (
                          <>
                            {img.toLowerCase().includes('.mp4') || img.toLowerCase().includes('.mov') || img.toLowerCase().includes('.webm') ? (
                              <video src={img} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                            ) : (
                              <img src={img} alt={`Asset ${idx + 1}`} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-black text-cyan-300">
                              #{idx + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => setProductImages(productImages.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center text-[9px] font-bold cursor-pointer"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-1 text-center group">
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                            ) : (
                              <>
                                <span className="text-sm group-hover:scale-110 transition-transform">➕</span>
                                <span className="text-[8px] text-white/60 font-bold mt-0.5">
                                  #{idx + 1}
                                </span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              onChange={handleFileUpload}
                              disabled={isUploading}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Button to Step 2 */}
            <div className="p-4 border-t border-white/10 bg-[#0A0D14]">
              <button
                type="button"
                onClick={() => setStep('fill_texts')}
                className="w-full py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-500 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <span>{t('Tiếp theo: Điền Nội Dung Chữ (Bước 2) →', 'Next: Topic & Copywriting (Step 2) →')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VIEW 3: STEP 2/2 — TÊN SẢN PHẨM & NỘI DUNG CHỮ
            ───────────────────────────────────────────────────────────── */}
        {step === 'fill_texts' && (
          <div className="flex-1 flex flex-col h-full bg-[#0A0D14] text-white overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Top Navigation Bar */}
            <div className="pt-12 sm:pt-4 px-4 pb-3 border-b border-white/10 bg-[#0A0D14]/95 flex items-center justify-between gap-2">
              <button
                onClick={() => setStep('fill_assets')}
                className="flex items-center gap-1 text-xs text-cyan-400 font-bold hover:underline cursor-pointer min-h-[36px]"
              >
                <span>←</span>
                <span>{t('Bước 1 (Ảnh)', 'Back to Step 1')}</span>
              </button>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                {t('Bước 2/2: Tên & Nội Dung Chữ', 'Step 2/2: Copywriting')}
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 px-4 py-4 overflow-y-auto space-y-4">
              {/* 1. Product Name / Detailed Description Prompt */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <label className="text-xs font-bold text-white/90 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>🏷️</span>
                    <span>{t('Tên & Mô Tả Sản Phẩm / Ý Tưởng AI', 'Product Name & Description / AI Concept')}</span>
                  </span>
                  <span className="text-[10px] text-cyan-300 font-normal">{t('Kèm mô tả chi tiết', 'With description')}</span>
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    isVietnamese
                      ? 'Ví dụ: Trà thảo mộc cao cấp chiết xuất hoa cúc tự nhiên, bao bì tinh tế sang trọng, phong cách trẻ trung hiện đại...'
                      : 'E.g., Premium chamomile herbal tea with natural extract, elegant packaging, modern refreshing style...'
                  }
                  className="w-full py-2 px-3.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-cyan-400 leading-relaxed resize-none"
                />
              </div>

              {/* 2. Editable 2-Layer Typography (For Strobe & Product Ads) */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <label className="text-xs font-bold text-white/90 flex items-center gap-1.5">
                  <span>🔤</span>
                  <span>{t('Chữ Điểm Nhấn (Typography)', 'Emphasis Typography')}</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-white/80">{t('Chữ trên (Đặc)', 'Solid Text (Top)')}</label>
                    <input
                      type="text"
                      value={solidText}
                      onChange={(e) => setSolidText(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-white/80">{t('Chữ dưới (Viền rỗng)', 'Outlined Text (Bottom)')}</label>
                    <input
                      type="text"
                      value={outlineText}
                      onChange={(e) => setOutlineText(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Editable Tagline / Marketing Slogan */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>{t('Câu Slogan Marketing Cuối (Editable)', 'Final Marketing Tagline (Editable)')}</span>
                </label>
                <input
                  type="text"
                  value={sloganText}
                  onChange={(e) => setSloganText(e.target.value)}
                  placeholder={isVietnamese ? '⚡ ĐÓN ĐẦU XU HƯỚNG - ƯU ĐÃI HÔM NAY' : '⚡ DISCOVER THE BEST - ORDER NOW'}
                  className="w-full py-2 px-3.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Bottom Action Launch Button */}
            <div className="p-4 border-t border-white/10 bg-[#0A0D14]">
              <button
                onClick={handleLaunchCreation}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 shadow-xl shadow-cyan-500/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🚀</span>
                <span>{t('TẠO VIDEO & MỞ STUDIO RESULT', 'GENERATE & OPEN STUDIO RESULT')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
