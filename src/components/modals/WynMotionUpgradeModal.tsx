'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Crown,
  Check,
  Zap,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Film,
  Layers,
  Mic,
  ShieldCheck,
  AlertCircle,
  Coins,
  RefreshCw,
  Infinity as InfinityIcon,
  Globe,
  Lock,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import {
  WynMotionTierKey,
  WynMotionDurationKey,
  WYNMOTION_TIERS,
  WYNMOTION_POINT_PACKS,
  submitFormToSePay,
  createWebCheckout,
  purchaseAppleProduct,
  restoreApplePurchases,
} from '@/services/wynmotionPaymentService';

interface WynMotionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTier?: WynMotionTierKey;
  defaultPlanKey?: string;
  defaultTab?: 'subscriptions' | 'points';
  onSuccess?: () => void;
}

export const WynMotionUpgradeModal: React.FC<WynMotionUpgradeModalProps> = ({
  isOpen,
  onClose,
  defaultTier = 'pro',
  defaultPlanKey,
  defaultTab = 'subscriptions',
  onSuccess,
}) => {
  const { isDark, isVietnamese, t } = useApp();
  const { user } = useWordaiAuth();

  const initialTier: WynMotionTierKey = defaultPlanKey
    ? defaultPlanKey.includes('vip')
      ? 'vip'
      : defaultPlanKey.includes('premium')
      ? 'premium'
      : 'pro'
    : defaultTier;

  const isDarkMode = isDark;
  const isIosPlatform =
    typeof window !== 'undefined' &&
    (Capacitor.getPlatform() === 'ios' ||
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (Boolean(navigator.maxTouchPoints) && navigator.maxTouchPoints > 2 && /Macintosh/.test(navigator.userAgent)));

  // Navigation Steps: 1 = Choose Tier & Points, 2 = Choose Duration & Pay
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTier, setSelectedTier] = useState<WynMotionTierKey>(initialTier);
  const [selectedDuration, setSelectedDuration] = useState<WynMotionDurationKey>('1m');
  const [currency, setCurrency] = useState<'VND' | 'USD'>(isVietnamese ? 'VND' : 'USD');

  // Credit pack selection for active members
  const [selectedPointKey, setSelectedPointKey] = useState<string>('wynmotion_credits_199k');

  // User subscription status for WynMotion
  const [userTier, setUserTier] = useState<'free' | 'premium' | 'pro' | 'vip'>('free');
  const [isCheckingSub, setIsCheckingSub] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch current WynMotion subscription tier
  const checkWynMotionSubscription = useCallback(async () => {
    if (!user) {
      setUserTier('free');
      return;
    }
    setIsCheckingSub(true);
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ai.wordai.pro';
      const res = await fetch(`${apiUrl}/api/ai/motion/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.is_active && data?.tier) {
          setUserTier(data.tier.toLowerCase());
        } else {
          setUserTier('free');
        }
      }
    } catch {
      setUserTier('free');
    } finally {
      setIsCheckingSub(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedTier(initialTier);
      setSelectedDuration('1m');
      setCurrency(isVietnamese ? 'VND' : 'USD');
      setErrorMessage(null);
      setSuccessMessage(null);
      checkWynMotionSubscription();
    }
  }, [isOpen, initialTier, isVietnamese, checkWynMotionSubscription]);

  if (!isOpen || !mounted) return null;

  const isMember = userTier !== 'free';

  // ── Styles (Matching Listen & Learn Modal Sheet) ──
  const bg = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const border = isDarkMode ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const overlayCls =
    'fixed inset-0 bg-black/65 backdrop-blur-sm z-[100000] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 transition-all duration-300';
  const containerCls = `relative w-full sm:max-w-[760px] max-h-[94dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl shadow-2xl border ${bg} ${border} upgrade-modal-sheet`;

  const tierConfig = WYNMOTION_TIERS[selectedTier];
  const currentDurationOption = tierConfig.durations.find((d) => d.duration === selectedDuration) || tierConfig.durations[0];

  // Handle Proceeding to Checkout
  const handleProceedCheckout = async (productId: string, isSubscription: boolean) => {
    if (!user) {
      setErrorMessage(t('Vui lòng đăng nhập để thực hiện nâng cấp.', 'Please log in to upgrade.'));
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isIosPlatform) {
        // iOS In-App Purchase via StoreKit
        const result = await purchaseAppleProduct(productId, user.uid);
        if (result.success) {
          setSuccessMessage(t('Thanh toán thành công qua Apple App Store!', 'Payment successful via Apple App Store!'));
          await checkWynMotionSubscription();
          if (onSuccess) onSuccess();
          setTimeout(() => onClose(), 1500);
        } else if (result.error !== 'USER_CANCELLED') {
          setErrorMessage(result.error || t('Giao dịch qua Apple không thành công.', 'Apple transaction failed.'));
        }
      } else {
        // Web SePay Checkout (VietQR) or International USD Checkout
        if (currency === 'USD') {
          const checkoutUrl = `https://checkout.wynai.pro/checkout?product=${productId}&user=${encodeURIComponent(
            user.uid
          )}&email=${encodeURIComponent(user.email || '')}`;
          window.open(checkoutUrl, '_blank');
          setIsLoading(false);
          return;
        }

        const token = await user.getIdToken();
        const res = await createWebCheckout({
          productId,
          isSubscription,
          currency: 'VND',
          userToken: token,
          userEmail: user.email || '',
        });

        if (res.error) {
          throw new Error(res.error);
        }

        if (res.checkoutUrl && res.formFields) {
          submitFormToSePay(res.checkoutUrl, res.formFields);
        } else if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
        } else {
          throw new Error(t('Không nhận được liên kết thanh toán từ SePay', 'No payment link returned from SePay'));
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || t('Đã xảy ra lỗi khi tạo thanh toán', 'Payment initiation failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className={overlayCls} onClick={onClose}>
      <style>{`
        @keyframes upgradeSheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .upgrade-modal-sheet {
            animation: upgradeSheetUp 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          }
        }
      `}</style>
      <div className={containerCls} onClick={(e) => e.stopPropagation()}>
        {/* Drag handle for mobile */}
        <div className="flex items-center justify-center pt-3 pb-1 flex-shrink-0 sm:hidden">
          <div className={`w-12 h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>

        {/* ── Modal Header ── */}
        <div
          className={`flex-shrink-0 ${bg} ${border} border-b sm:rounded-t-2xl p-4 sm:p-5 flex items-center justify-between z-10`}
        >
          <div className="flex items-center gap-3">
            {step === 2 ? (
              <button
                onClick={() => setStep(1)}
                className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('Quay lại', 'Back')}</span>
              </button>
            ) : (
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xs sm:text-sm font-semibold tracking-wide uppercase leading-tight ${textMuted}`}>
                  {step === 1 ? t('Nâng cấp tài khoản', 'Upgrade to') : t('Chọn chu kỳ thời hạn', 'Select Plan Duration')}
                </h2>
                {isMember && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    {userTier}
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent tracking-wide leading-none mt-0.5">
                {step === 1 ? 'WYNMOTION AI STUDIO' : tierConfig.nameVi.toUpperCase()}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Switcher */}
            <div
              className={`flex items-center p-0.5 rounded-xl border text-xs font-bold ${
                isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setCurrency('VND')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currency === 'VND'
                    ? 'bg-amber-500 text-gray-950 shadow-sm'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                VND
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currency === 'USD'
                    ? 'bg-amber-500 text-gray-950 shadow-sm'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                USD
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Modal Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Cover image banner */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-gray-500/20 shadow-lg">
            <img
              src="/images/Premium Upgrade Cover.png"
              alt="WynMotion AI Studio Upgrade"
              className="w-full h-auto object-cover rounded-2xl max-h-[140px] sm:max-h-[175px]"
            />
          </div>

          {/* Benefits strip */}
          <div
            className={`p-3 rounded-2xl border grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold ${
              isDarkMode ? 'bg-amber-500/5 border-amber-500/20 text-amber-300/90' : 'bg-amber-50/70 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Film className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{t('Xuất 1080p / 4K UHD', '1080p / 4K Export')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{t('Xóa 100% Watermark', 'No Watermark')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{t('125+ Shaders & 40 VFX', '125+ Shaders & VFX')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{t('Giọng đọc AI 48kHz', '48kHz AI Voices')}</span>
            </div>
          </div>

          {/* Alert / Errors */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 1: CHỌN GÓI THÀNH VIÊN (TIERS) & NẠP ĐIỂM AI TIÊU HAO
             ═══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <>
              {/* Section 1: Membership Tiers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-bold tracking-wide ${textPrimary}`}>
                    {t('1. Chọn gói thành viên WynMotion', '1. Choose WynMotion Membership')}
                  </p>
                  <span className="text-[11px] font-semibold text-amber-400">
                    {t('Bấm để chọn thời hạn & giá', 'Click to choose duration')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['premium', 'pro', 'vip'] as WynMotionTierKey[]).map((tierKey) => {
                    const cfg = WYNMOTION_TIERS[tierKey];
                    const isSelected = selectedTier === tierKey;
                    const isVip = tierKey === 'vip';
                    const isPro = tierKey === 'pro';

                    return (
                      <div
                        key={tierKey}
                        onClick={() => {
                          setSelectedTier(tierKey);
                          setStep(2);
                        }}
                        className={`relative rounded-2xl p-4 cursor-pointer transition-all border-2 flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] ${
                          isSelected
                            ? isVip
                              ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                              : 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                            : isDarkMode
                            ? 'border-gray-800 bg-gray-800/40 hover:border-gray-700'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {/* Top Badge */}
                        {cfg.badgeVi && (
                          <span
                            className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white shadow-sm whitespace-nowrap ${
                              isVip ? 'bg-purple-600' : isPro ? 'bg-teal-500' : 'bg-amber-500'
                            }`}
                          >
                            {t(cfg.badgeVi, cfg.badgeEn || '')}
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between gap-2 mt-1 mb-2">
                            <h4 className={`text-base font-bold ${textPrimary}`}>{t(cfg.nameVi, cfg.nameEn)}</h4>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? isVip
                                    ? 'border-purple-500'
                                    : 'border-amber-500'
                                  : isDarkMode
                                  ? 'border-gray-600'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && (
                                <div className={`w-2.5 h-2.5 rounded-full ${isVip ? 'bg-purple-500' : 'bg-amber-500'}`} />
                              )}
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="text-xs text-gray-400">{t('Chỉ từ', 'Starting at')}</div>
                            <div className="text-2xl font-black text-amber-400">
                              {currency === 'VND'
                                ? `${cfg.startingPriceVnd.toLocaleString('vi-VN')} ₫`
                                : `$${cfg.startingPriceUsd}`}
                              <span className={`text-xs font-normal ${textMuted}`}> / {t('tháng', 'mo')}</span>
                            </div>
                          </div>

                          <p className={`text-[11px] leading-relaxed mb-3 ${textMuted}`}>
                            {t(cfg.taglineVi, cfg.taglineEn)}
                          </p>

                          <ul className="space-y-1.5 mb-4 text-[11px]">
                            {cfg.featuresVi.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <Check
                                  className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                                    isVip ? 'text-purple-400' : 'text-amber-400'
                                  }`}
                                />
                                <span className={textPrimary}>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            isVip
                              ? 'bg-purple-600 hover:bg-purple-500 text-white'
                              : isPro
                              ? 'bg-amber-500 hover:bg-amber-400 text-gray-950'
                              : isDarkMode
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                          }`}
                        >
                          <span>{t('Chọn thời hạn & giá', 'Choose duration')}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Consumable Points Packs */}
              <div className="pt-4 border-t border-gray-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <p className={`text-sm font-bold tracking-wide ${textPrimary}`}>
                      {t('2. Nạp thêm Điểm AI (Points)', '2. Top up AI Points')}
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {t('Gói tiêu hao, dùng hết mua tiếp', 'Consumable packs')}
                  </span>
                </div>

                {/* Free User Lock Warning Banner */}
                {!isMember && (
                  <div
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                      isDarkMode ? 'bg-blue-950/30 border-blue-800/40 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                  >
                    <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
                    <div className="text-xs leading-relaxed">
                      <p className="font-bold mb-0.5">
                        {t('Chỉ dành cho hội viên Premium, Pro hoặc VIP', 'Exclusive for Premium, Pro or VIP Members')}
                      </p>
                      <p className="text-[11px] opacity-90">
                        {t(
                          'Tài khoản Free không thể nạp điểm riêng lẻ. Vui lòng chọn nâng cấp 1 trong 3 gói thành viên ở trên trước khi nạp điểm!',
                          'Free accounts cannot purchase points packs. Please upgrade to a membership plan above first!'
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {WYNMOTION_POINT_PACKS.map((pack) => {
                    const isSelected = selectedPointKey === pack.key;
                    return (
                      <div
                        key={pack.key}
                        onClick={() => {
                          if (isMember) setSelectedPointKey(pack.key);
                        }}
                        className={`relative rounded-2xl p-4 border flex flex-col justify-between transition-all ${
                          !isMember
                            ? 'opacity-60 cursor-not-allowed border-gray-800 bg-gray-800/20'
                            : isSelected
                            ? 'border-yellow-500 bg-yellow-500/10 cursor-pointer shadow-md'
                            : isDarkMode
                            ? 'border-gray-800 bg-gray-800/30 hover:border-gray-700 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 cursor-pointer'
                        }`}
                      >
                        {pack.badgeVi && (
                          <span
                            className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white shadow-sm whitespace-nowrap ${
                              pack.popular ? 'bg-amber-500' : 'bg-purple-600'
                            }`}
                          >
                            {t(pack.badgeVi, pack.badgeEn || '')}
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-1 mt-1">
                            <span className={`text-2xl font-black ${textPrimary}`}>{pack.points}</span>
                            <span className="text-xs font-semibold text-yellow-400">{t('Điểm AI', 'Points')}</span>
                          </div>

                          <div className="text-lg font-bold text-amber-400 mb-2">
                            {currency === 'VND' ? pack.priceVndDisplay : pack.priceUsdDisplay}
                          </div>

                          <p className={`text-[11px] leading-relaxed mb-4 ${textMuted}`}>{t(pack.descVi, pack.descEn)}</p>
                        </div>

                        <button
                          type="button"
                          disabled={!isMember || isLoading}
                          onClick={() => handleProceedCheckout(pack.key, false)}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            !isMember
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              : 'bg-yellow-500 hover:bg-yellow-400 text-gray-950 shadow-sm active:scale-95'
                          }`}
                        >
                          {!isMember ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>{t('Đã khóa', 'Locked')}</span>
                            </>
                          ) : isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" />
                              <span>{t('Nạp điểm ngay', 'Buy Points')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 2: CHỌN THỜI HẠN (1M / 3M / 6M / 12M) & TIẾN HÀNH THANH TOÁN
             ═══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`text-base font-bold ${textPrimary}`}>
                    {t('Gói đã chọn:', 'Selected Plan:')}{' '}
                    <span className="text-amber-400">{t(tierConfig.nameVi, tierConfig.nameEn)}</span>
                  </h4>
                  <p className={`text-xs ${textMuted}`}>
                    {t(
                      'Tỷ lệ quy đổi: 1.000 ₫ = 1 Điểm AI tặng kèm tương ứng với giá trị gói.',
                      'Bonus rate: 1,000 VND = 1 AI point directly added to your balance.'
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  {t('Đổi gói khác', 'Change tier')}
                </button>
              </div>

              {/* Duration Options List */}
              <div className="flex flex-col gap-2.5">
                {tierConfig.durations.map((option) => {
                  const isSelected = selectedDuration === option.duration;
                  const isVip = selectedTier === 'vip';

                  return (
                    <button
                      key={option.duration}
                      type="button"
                      onClick={() => setSelectedDuration(option.duration)}
                      className={`relative rounded-2xl p-4 text-left transition-all border-2 flex items-center justify-between gap-4 ${
                        isSelected
                          ? isVip
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-amber-500 bg-amber-500/10'
                          : isDarkMode
                          ? 'border-gray-800 bg-gray-800/40 hover:border-gray-700'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio circle */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? isVip
                                ? 'border-purple-500'
                                : 'border-amber-500'
                              : isDarkMode
                              ? 'border-gray-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <div className={`w-2.5 h-2.5 rounded-full ${isVip ? 'bg-purple-500' : 'bg-amber-500'}`} />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-base font-bold ${textPrimary}`}>
                              {t(option.labelVi, option.labelEn)}
                            </span>
                            {option.discountPct && option.discountPct > 0 && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                  isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                                }`}
                              >
                                -{option.discountPct}%
                              </span>
                            )}
                            {option.badgeVi && (
                              <span
                                className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${
                                  isVip ? 'bg-purple-600' : 'bg-amber-500'
                                }`}
                              >
                                {t(option.badgeVi, option.badgeEn || '')}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="text-yellow-400 font-semibold">
                              +{option.points} {t('Điểm AI tặng kèm', 'Bonus Points')}
                            </span>
                            <span className={textMuted}>•</span>
                            <span className={textMuted}>
                              {currency === 'VND'
                                ? `~${Math.round(option.perMonthVnd).toLocaleString('vi-VN')} ₫/${t('tháng', 'mo')}`
                                : `~$${option.perMonthUsd.toFixed(2)}/mo`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-black text-amber-400">
                          {currency === 'VND' ? option.priceVndDisplay : option.priceUsdDisplay}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div
                className={`p-4 rounded-2xl border space-y-2 text-xs ${
                  isDarkMode ? 'bg-gray-800/40 border-gray-700/60' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={textMuted}>{t('Gói dịch vụ:', 'Selected Package:')}</span>
                  <span className={`font-bold ${textPrimary}`}>{t(tierConfig.nameVi, tierConfig.nameEn)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textMuted}>{t('Thời hạn đăng ký:', 'Duration:')}</span>
                  <span className={`font-bold ${textPrimary}`}>
                    {t(currentDurationOption.labelVi, currentDurationOption.labelEn)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={textMuted}>{t('Điểm AI nhận ngay:', 'Bonus AI Points:')}</span>
                  <span className="font-bold text-yellow-400">+{currentDurationOption.points} Points</span>
                </div>
                <div className="border-t border-gray-700/50 pt-2 flex justify-between items-center text-sm">
                  <span className="font-bold">{t('Tổng thanh toán:', 'Total Amount:')}</span>
                  <span className="text-lg font-black text-amber-400">
                    {currency === 'VND' ? currentDurationOption.priceVndDisplay : currentDurationOption.priceUsdDisplay}
                  </span>
                </div>
              </div>

              {/* International USD Notice */}
              {currency === 'USD' && !isIosPlatform && (
                <div
                  className={`p-4 rounded-2xl border ${
                    isDarkMode ? 'bg-blue-950/30 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 font-bold text-xs">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>{t('Thanh toán quốc tế (USD)', 'International Checkout (USD)')}</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {t(
                      'Thanh toán bằng thẻ quốc tế (Visa/Mastercard) hoặc PayPal qua cổng bảo mật WynAI Global Checkout.',
                      'Pay with credit card (Visa/Mastercard) or PayPal via WynAI Global Checkout.'
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sticky Modal Footer ── */}
        <div
          className={`flex-shrink-0 ${bg} ${border} border-t sm:rounded-b-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 z-10`}
        >
          {step === 1 ? (
            <div className="w-full flex items-center justify-between">
              <span className={`text-xs ${textMuted}`}>
                {t('Chọn một gói ở trên để xem chi tiết thời hạn & khuyến mãi', 'Select a plan above to view duration options')}
              </span>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('Đóng', 'Close')}
              </button>
            </div>
          ) : (
            <>
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
                <div>
                  <div className="text-xs text-gray-400">{t('Tổng thanh toán', 'Total')}</div>
                  <div className="text-xl font-black text-amber-400">
                    {currency === 'VND' ? currentDurationOption.priceVndDisplay : currentDurationOption.priceUsdDisplay}
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`flex-1 sm:flex-none px-4 py-3 rounded-xl font-bold text-xs transition-colors ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {t('Quay lại', 'Back')}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleProceedCheckout(currentDurationOption.key, true)}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-gray-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('Đang kết nối...', 'Connecting...')}</span>
                    </>
                  ) : isIosPlatform ? (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>{t('Thanh toán qua Apple', 'Pay with Apple')}</span>
                    </>
                  ) : currency === 'USD' ? (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>{t('Đến trang thanh toán USD', 'Proceed to USD Checkout')}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>{t('Thanh toán qua SePay (VietQR)', 'Pay via SePay (VietQR)')}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WynMotionUpgradeModal;
