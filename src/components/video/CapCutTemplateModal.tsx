'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { wynmotionService } from '@/services/wynmotionService';
import { Loader2 } from 'lucide-react';

export interface CapCutTemplateData {
  id: 'ads_strobe_teaser' | 'ads_cinematic_showcase';
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
    usageCount: '24.8K',
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
    maxImages: 3,
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
  templateId: 'ads_strobe_teaser' | 'ads_cinematic_showcase' | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (params: {
    templateId: 'ads_strobe_teaser' | 'ads_cinematic_showcase';
    prompt: string;
    productImages: string[];
    bgmUrl: string;
    durationSec: number;
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
  onApply,
}) => {
  const { isVietnamese, isDark, t } = useApp();
  const [step, setStep] = useState<'preview' | 'fill_data'>('preview');

  // Input states
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
      if (template) {
        setHookText(isVietnamese ? template.defaultHookVi : template.defaultHookEn);
        setSolidText(isVietnamese ? template.defaultSolidVi : template.defaultSolidEn);
        setOutlineText(isVietnamese ? template.defaultOutlineVi : template.defaultOutlineEn);
        setSloganText(isVietnamese ? template.defaultSloganVi : template.defaultSloganEn);
      }
    }
  }, [isOpen, templateId, isVietnamese]);

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
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      const res = await wynmotionService.uploadMedia(formData);
      if (res && res.url) {
        setProductImages((prev) => [...prev, res.url].slice(0, template.maxImages));
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

            {/* 1. Product Images Slot */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <label className="text-xs font-bold text-white/90 flex items-center justify-between">
                <span>{t('Ảnh Sản Phẩm / Clip Cuối (Tối đa ' + template.maxImages + ' file)', 'Hero Media (Max ' + template.maxImages + ')')}</span>
                <span className="text-[10px] text-white/60">{productImages.length}/{template.maxImages}</span>
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {Array.from({ length: template.maxImages }).map((_, idx) => {
                  const img = productImages[idx];
                  return (
                    <div
                      key={idx}
                      className={`relative aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
                        img ? 'border-cyan-500 bg-slate-900' : 'border-white/20 bg-white/5 hover:border-cyan-400/60'
                      }`}
                    >
                      {img ? (
                        <>
                          {img.toLowerCase().includes('.mp4') || img.toLowerCase().includes('.mov') || img.toLowerCase().includes('.webm') ? (
                            <video src={img} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                          ) : (
                            <img src={img} alt="Product" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => setProductImages(productImages.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-1 text-center">
                          {isUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                          ) : (
                            <>
                              <span className="text-lg">➕</span>
                              <span className="text-[9px] text-white/70 font-bold mt-1">
                                {idx === 0 ? t('Tải ảnh / clip', 'Upload') : t('Thêm ảnh', 'Extra')}
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*,video/*"
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
