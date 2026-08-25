'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { wynmotionService } from '@/services/wynmotionService';
import { Loader2 } from 'lucide-react';

export interface CapCutTemplateData {
  id: 'ads_strobe_teaser' | 'ads_cinematic_showcase' | 'product_ads_motion';
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
  ads_strobe_teaser: {
    id: 'ads_strobe_teaser',
    titleVi: 'Strobe Teaser & Big Reveal',
    titleEn: 'Strobe Teaser & Big Reveal',
    descVi: 'Đập chữ nhịp điệu nhanh, chớp nháy vi mô R-E-A-D-Y & hé lộ sản phẩm với chữ 2 tầng Solid/Outline.',
    descEn: 'Fast-paced rhythmic strobe typography with READY letter-flash and cinematic reveal outro.',
    durationSec: 11.7,
    videoUrl: 'https://static.wordai.pro/ai-generated-images/wynmotion/ddd110f2dc60_templates/strobe_teaser_demo.mp4',
    bgmUrl: 'https://static.wordai.pro/ai-generated-images/wynmotion/7fcf80645e11_templates/strobe_teaser_bgm.mp3',
    badge: '⚡ STROBE 11.7s',
    usageCount: '76.9K',
    maxImages: 1,
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
    titleVi: 'Cinematic Showcase Reel',
    titleEn: 'Cinematic Showcase Reel',
    descVi: '7 phân cảnh F&B điện ảnh, khói sương, nguyên liệu bay không trọng lực, chia 3 cột & nút đặt hàng.',
    descEn: '7 cinematic F&B scenes, smoke VFX, zero-gravity floating items, 3-panel split & pulse CTA.',
    durationSec: 22.0,
    videoUrl: 'https://static.wordai.pro/ai-generated-images/wynmotion/42534bb8d9df_templates/cinematic_showcase_demo.mp4',
    bgmUrl: 'https://static.wordai.pro/ai-generated-images/wynmotion/11ca09714987_templates/cinematic_showcase_bgm.mp3',
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
  product_ads_motion: {
    id: 'product_ads_motion',
    titleVi: 'Product Commercial Billboard (Style 7)',
    titleEn: 'Product Commercial Billboard (Style 7)',
    descVi: 'Chuyển động 2.5D Parallax thuần Visual, SAM 2 bóc tách vật thể, RGB Glitch & Flash Blast, Match-to-Poster Outro.',
    descEn: 'Pure visual 2.5D parallax ads, SAM 2 packshot cutout, RGB Glitch & Flash Blast, Match-to-Poster Outro.',
    durationSec: 15.0,
    videoUrl: 'https://static.wordai.pro/ai-generated-images/wynmotion/ddd110f2dc60_templates/strobe_teaser_demo.mp4',
    bgmUrl: 'https://static.wordai.pro/ai-generated-images/wynmotion/7fcf80645e11_templates/strobe_teaser_bgm.mp3',
    badge: '💎 2.5D ADS 15.0s',
    usageCount: '6.5K',
    maxImages: 3,
    defaultHookVi: 'SIÊU PHẨM MỚI',
    defaultHookEn: 'NEW ARRIVAL',
    defaultSolidVi: 'ORDER',
    defaultSolidEn: 'ORDER',
    defaultOutlineVi: 'NOW',
    defaultOutlineEn: 'NOW',
    defaultSloganVi: '⚡ ĐÓN ĐẦU XU HƯỚNG - ƯU ĐÃI HÔM NAY',
    defaultSloganEn: '⚡ DISCOVER THE BEST - ORDER NOW',
  },
};

export interface CapCutTemplateModalProps {
  templateId: 'ads_strobe_teaser' | 'ads_cinematic_showcase' | 'product_ads_motion' | null;
  isOpen: boolean;
  onClose: () => void;
  defaultAspectRatio?: '9:16' | '16:9';
  onApply: (params: {
    templateId: 'ads_strobe_teaser' | 'ads_cinematic_showcase' | 'product_ads_motion';
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
  templateId,
  isOpen,
  onClose,
  defaultAspectRatio = '9:16',
  onApply,
}) => {
  const { isVietnamese, isDark, t } = useApp();
  const [step, setStep] = useState<'preview' | 'fill_data'>('preview');

  // Input states
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>(defaultAspectRatio);
  const [prompt, setPrompt] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [hookText, setHookText] = useState('');
  const [ctaText, setCtaText] = useState('MUA NGAY');
  const [solidText, setSolidText] = useState('STAY');
  const [outlineText, setOutlineText] = useState('TUNED');
  const [sloganText, setSloganText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const template = templateId ? CAPCUT_ADS_TEMPLATES[templateId] : null;

  useEffect(() => {
    if (isOpen) {
      setStep('preview');
      setIsPlaying(true);
      setAspectRatio(defaultAspectRatio);
      if (template) {
        setHookText(isVietnamese ? template.defaultHookVi : template.defaultHookEn);
        setSolidText(isVietnamese ? template.defaultSolidVi : template.defaultSolidEn);
        setOutlineText(isVietnamese ? template.defaultOutlineVi : template.defaultOutlineEn);
        setSloganText(isVietnamese ? template.defaultSloganVi : template.defaultSloganEn);
        setCtaText(template.id === 'ads_cinematic_showcase' ? 'ORDER NOW' : 'MUA NGAY');
        setProductImages([]);
      }
    }
  }, [isOpen, templateId, isVietnamese, defaultAspectRatio]);

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
        setProductImages((prev) => [...prev, ...uploadedUrls].slice(0, template.maxImages));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLaunchCreation = () => {
    const finalPrompt = prompt.trim() || (isVietnamese ? template.titleVi : template.titleEn);
    onApply({
      templateId: template.id,
      prompt: finalPrompt,
      productImages,
      bgmUrl: template.bgmUrl,
      durationSec: template.durationSec,
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
      {/* Container Dialog */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-md bg-[#0A0D14] border border-white/10 sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg">
              {template.badge}
            </span>
            <span className="text-[11px] font-bold text-white/80">
              🔥 {template.usageCount} {t('lượt dùng', 'uses')}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-sm font-bold border border-white/20 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            VIEW 1: FULLSCREEN VIDEO PREVIEW PLAYER
            ───────────────────────────────────────────────────────────── */}
        {step === 'preview' && (
          <div className="relative flex-1 flex flex-col justify-between overflow-hidden bg-black">
            {/* Video Player */}
            <div className="relative flex-1 flex items-center justify-center cursor-pointer" onClick={handleTogglePlay}>
              <video
                ref={videoRef}
                src={template.videoUrl}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                className="w-full h-full object-cover sm:object-contain"
              />

              {/* Play / Pause indicator overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white text-2xl shadow-2xl">
                    ▶
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Info & "Use Template" CTA Bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-t from-black via-black/90 to-transparent space-y-3 z-20">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>🎬</span>
                  <span>{isVietnamese ? template.titleVi : template.titleEn}</span>
                </h3>
                <p className="text-xs text-white/70 mt-1 line-clamp-2">
                  {isVietnamese ? template.descVi : template.descEn}
                </p>
              </div>

              {/* Audio info tag */}
              <div className="flex items-center justify-between text-[11px] text-white/80 py-1 px-3 rounded-xl bg-white/10 border border-white/15">
                <div className="flex items-center gap-2">
                  <span>🎵</span>
                  <span className="font-semibold">{t('Âm thanh gốc đã đồng bộ nhịp', 'Original Beat-Synced Audio')}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                >
                  {isMuted ? '🔇 Bật tiếng' : '🔊 Tắt tiếng'}
                </button>
              </div>

              {/* Big Use Template Button (App Signature Cyan-Blue Gradient) */}
              <button
                onClick={() => setStep('fill_data')}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 shadow-xl shadow-cyan-500/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡</span>
                <span>{t('Sử Dụng Mẫu Này (Use Template)', 'Use This Template')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VIEW 2: QUICK ASSET & DATA INPUT DRAWER
            ───────────────────────────────────────────────────────────── */}
        {step === 'fill_data' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="pt-6 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>📸</span>
                <span>{t('Tùy Biến Dữ Liệu Mẫu', 'Customize Template')}</span>
              </h3>
              <button
                onClick={() => setStep('preview')}
                className="text-xs text-cyan-400 hover:underline font-medium cursor-pointer"
              >
                ← {t('Xem lại mẫu', 'Back to preview')}
              </button>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/10">
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

            {/* 1. Product Images Slot */}
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/90">
                  {template.id === 'ads_cinematic_showcase'
                    ? t('📸 8 Ảnh Món Ăn / Menu (Tải 1-8 ảnh)', '📸 8 Food / Menu Images (Upload 1-8)')
                    : t('Ảnh Sản Phẩm / Clip Cuối', 'Hero Media')}
                </label>
                <span className="text-[10px] text-cyan-300 font-semibold">{productImages.length}/{template.maxImages}</span>
              </div>

              {template.id === 'ads_cinematic_showcase' && (
                <div className="p-3 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                    <span>💡</span>
                    <span>{t('Hướng dẫn tải ảnh cho mẫu Menu 8 món (22.0s):', 'Image Upload Guide for 8-Dish Menu:')}</span>
                  </div>
                  <ul className="text-[11px] text-white/80 space-y-1 pl-4 list-disc">
                    <li>
                      <strong className="text-cyan-300">{t('Cách 1 (Khuyên dùng):', 'Option 1 (Recommended):')}</strong>{' '}
                      {t(
                        'Tải 1 ảnh chụp Menu thực đơn → AI Gemini sẽ tự động đọc các món ăn và tạo đủ 8 ảnh 1080p chuẩn studio theo tỉ lệ ' + aspectRatio + '!',
                        'Upload 1 Menu photo → Gemini AI will automatically read items and generate all 8 studio 1080p dishes in ' + aspectRatio + '!'
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
              <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold cursor-pointer transition-all">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    <span>{t('Đang tải ảnh lên...', 'Uploading...')}</span>
                  </>
                ) : (
                  <>
                    <span>📂</span>
                    <span>{t('Chọn ảnh từ thiết bị (1 hoặc nhiều ảnh)', 'Select photos (Single or Multiple)')}</span>
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

              {/* Grid 8 slots */}
              <div className={`grid ${template.maxImages > 3 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 pt-1`}>
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

            {/* 2. Product Name / Topic Prompt */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/90">
                {t('Tên Sản Phẩm / Chủ Đề', 'Product Name / Topic')}
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={isVietnamese ? 'Ví dụ: Ô Long Sữa Phê La / Thời Trang Hè...' : 'E.g., Oolong Milk Tea / Summer Fashion...'}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* 3. Editable 2-Layer Typography */}
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

            {/* 4. Editable Tagline / Marketing Slogan */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white/80">
                {t('Câu Slogan Marketing Cuối (Editable)', 'Final Marketing Tagline (Editable)')}
              </label>
              <input
                type="text"
                value={sloganText}
                onChange={(e) => setSloganText(e.target.value)}
                placeholder={isVietnamese ? '⚡ ĐÓN ĐẦU XU HƯỚNG - ƯU ĐÃI HÔM NAY' : '⚡ DISCOVER THE BEST - ORDER NOW'}
                className="w-full py-2 px-3.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Action Launch Button (App Signature Cyan-Blue Gradient) */}
            <button
              onClick={handleLaunchCreation}
              className="w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 shadow-xl shadow-cyan-500/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>🚀</span>
              <span>{t('Tạo Video & Mở Studio Result', 'Generate & Open Studio Result')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
