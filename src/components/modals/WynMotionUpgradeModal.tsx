'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Crown,
  Check,
  Zap,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Coins,
  ShieldCheck,
  Film,
  Sparkles,
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

const ALL_STORE_PRODUCT_IDS = [
  'wynmotion_premium_1m',
  'wynmotion_premium_3m',
  'wynmotion_premium_6m',
  'wynmotion_premium_12m',
  'wynmotion_premium_1y',
  'wynmotion_premium_1year',
  'wynmotion_premium_12months',
  'wynmotion_pro_1m',
  'wynmotion_pro_3m',
  'wynmotion_pro_6m',
  'wynmotion_pro_12m',
  'wynmotion_pro_1y',
  'wynmotion_pro_1year',
  'wynmotion_pro_12months',
  'wynmotion_vip_1m',
  'wynmotion_vip_3m',
  'wynmotion_vip_6m',
  'wynmotion_vip_12m',
  'wynmotion_vip_1y',
  'wynmotion_vip_1year',
  'wynmotion_vip_12months',
  'wynmotion_credits_99k',
  'wynmotion_credits_199k',
  'wynmotion_credits_499k',
];

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

  // Selected item type in Step 1: 'tier' or 'point'
  const [activeItemType, setActiveItemType] = useState<'tier' | 'point'>('tier');
  const [selectedPointKey, setSelectedPointKey] = useState<string>('wynmotion_credits_199k');

  // Apple Store prices from StoreKit
  const [applePrices, setApplePrices] = useState<Record<string, { priceString: string; pricePerMonthString?: string }>>({});

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
    } catch (e) {
      console.warn('Could not check WynMotion subscription status:', e);
    } finally {
      setIsCheckingSub(false);
    }
  }, [user]);

  // Load real App Store prices on iOS via RevenueCat SDK
  useEffect(() => {
    if (isOpen && isIosPlatform) {
      const loadApplePrices = async () => {
        try {
          const { Purchases } = await import('@revenuecat/purchases-capacitor');
          const { initRevenueCat } = await import('@/services/appleIAPService');
          if (user?.uid) {
            await initRevenueCat(user.uid);
          }
          const res = await Purchases.getProducts({ productIdentifiers: ALL_STORE_PRODUCT_IDS });
          if (res?.products && res.products.length > 0) {
            const pricesMap: Record<string, { priceString: string; pricePerMonthString?: string }> = {};
            res.products.forEach((p: any) => {
              const id = p.identifier;
              const info = {
                priceString: p.priceString,
                pricePerMonthString: p.pricePerMonthString,
              };
              pricesMap[id] = info;

              // Map aliases to canonical keys if created differently on App Store Connect
              if (
                id === 'wynmotion_premium_1y' ||
                id === 'wynmotion_premium_1year' ||
                id === 'wynmotion_premium_12months'
              ) {
                pricesMap['wynmotion_premium_12m'] = info;
              }
              if (
                id === 'wynmotion_pro_1y' ||
                id === 'wynmotion_pro_1year' ||
                id === 'wynmotion_pro_12months'
              ) {
                pricesMap['wynmotion_pro_12m'] = info;
              }
              if (
                id === 'wynmotion_vip_1y' ||
                id === 'wynmotion_vip_1year' ||
                id === 'wynmotion_vip_12months'
              ) {
                pricesMap['wynmotion_vip_12m'] = info;
              }
            });
            setApplePrices(pricesMap);
          }
        } catch (err) {
          console.warn('[UpgradeModal] Could not load Apple Store prices:', err);
        }
      };
      loadApplePrices();
    }
  }, [isOpen, isIosPlatform, user]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedTier(initialTier);
      setSelectedDuration('1m');
      setCurrency(isVietnamese ? 'VND' : 'USD');
      setActiveItemType(defaultTab === 'points' ? 'point' : 'tier');
      setErrorMessage(null);
      setSuccessMessage(null);
      checkWynMotionSubscription();
    }
  }, [isOpen, initialTier, defaultTab, isVietnamese, checkWynMotionSubscription]);

  // Detect if App Store returned any Vietnamese Dong prices or user is in VN
  const isVndStorefront = useMemo(() => {
    const hasVndInApplePrices = Object.values(applePrices).some(
      (p) =>
        p.priceString?.includes('đ') ||
        p.priceString?.includes('₫') ||
        p.priceString?.includes('VND')
    );
    return hasVndInApplePrices || isVietnamese || currency === 'VND';
  }, [applePrices, isVietnamese, currency]);

  if (!isOpen || !mounted) return null;

  const isMember = userTier !== 'free';

  // Helper to format price: iOS uses App Store StoreKit, Web uses selected currency (VND / USD)
  const getDisplayPrice = (productId: string, priceVndDisplay: string, priceUsdDisplay: string) => {
    if (isIosPlatform && applePrices[productId]?.priceString) {
      return applePrices[productId].priceString;
    }
    return isVndStorefront ? priceVndDisplay : priceUsdDisplay;
  };

  // Helper to format per-month price without overriding with full year total
  const getDisplayPerMonth = (productId: string, perMonthVnd: number, perMonthUsd: number) => {
    if (isIosPlatform && applePrices[productId]?.pricePerMonthString) {
      return applePrices[productId].pricePerMonthString;
    }
    return isVndStorefront
      ? `${perMonthVnd.toLocaleString('vi-VN')} ₫`
      : `$${perMonthUsd.toFixed(2)}`;
  };

  // ── Styles (Matching Listen & Learn Modal Sheet) ──
  const bg = isDarkMode ? 'bg-[#0F172A]' : 'bg-white';
  const border = isDarkMode ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const overlayCls =
    'fixed inset-0 bg-black/65 backdrop-blur-sm z-[100000] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 transition-all duration-300';
  const containerCls = `relative w-full sm:max-w-[720px] max-h-[94dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl shadow-2xl border ${bg} ${border} upgrade-modal-sheet`;

  const tierConfig = WYNMOTION_TIERS[selectedTier];
  const currentDurationOption =
    tierConfig.durations.find((d) => d.duration === selectedDuration) || tierConfig.durations[0];

  // Handle Proceeding to Checkout
  const handleProceedCheckout = async (productId: string, isSubscription: boolean) => {
    if (!user) {
      setErrorMessage(t('Vui lòng đăng nhập để thực hiện thanh toán.', 'Please log in to proceed.'));
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isIosPlatform) {
        // iOS In-App Purchase via StoreKit + RevenueCat
        const token = await user.getIdToken();
        const result = await purchaseAppleProduct(productId, user.uid, token);
        if (result.success) {
          setSuccessMessage(t('Thanh toán thành công qua Apple App Store!', 'Payment successful via Apple App Store!'));
          await checkWynMotionSubscription();
          if (onSuccess) onSuccess();
          setTimeout(() => onClose(), 1500);
        } else if (result.error !== 'USER_CANCELLED') {
          setErrorMessage(result.error || t('Giao dịch qua Apple không thành công.', 'Apple transaction failed.'));
        }
      } else {
        // Web Checkout: VND -> SePay VietQR, USD -> Lemon Squeezy Checkout
        if (currency === 'USD') {
          const checkoutUrl = `https://checkout.wynai.pro/checkout?product=${productId}&user=${encodeURIComponent(
            user.uid
          )}&email=${encodeURIComponent(user.email || '')}`;
          window.open(checkoutUrl, '_blank');
          setIsLoading(false);
          return;
        }

        // VND via SePay
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

  const handleRestorePurchases = async () => {
    if (!user) {
      setErrorMessage(t('Vui lòng đăng nhập để khôi phục giao dịch.', 'Please log in to restore purchases.'));
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const token = await user.getIdToken();
      const result = await restoreApplePurchases(user.uid, token);
      if (result.success) {
        setSuccessMessage(t('Khôi phục giao dịch thành công!', 'Purchases restored successfully!'));
        await checkWynMotionSubscription();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(result.error || t('Không tìm thấy giao dịch nào cần khôi phục.', 'No purchases found to restore.'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || t('Lỗi khôi phục giao dịch', 'Failed to restore purchases'));
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
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#FF2D55]/20 to-[#FF4570]/5 flex items-center justify-center border border-[#FF2D55]/20 flex-shrink-0">
                <Crown className="w-6 h-6 text-[#FF2D55]" />
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
              <h3 className="text-lg sm:text-xl font-black bg-gradient-to-r from-[#FF2D55] to-[#FF4570] bg-clip-text text-transparent tracking-wide leading-none mt-0.5">
                {step === 1 ? 'WYNMOTION AI STUDIO' : tierConfig.nameVi.toUpperCase()}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isIosPlatform && (
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
                      ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-sm'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  VND (SePay)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    currency === 'USD'
                      ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-sm'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  USD
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Banner Cover Image */}
          <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-[#FF2D55]/30 shadow-lg bg-black">
            <img
              src="/images/WynMotion-UpgradeBanner.avif"
              alt="WynMotion Studio Upgrade"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent flex flex-col justify-center pl-7 sm:pl-8 pr-4 py-4 pointer-events-none">
              <div className="text-white font-black text-xl sm:text-2xl tracking-tight leading-tight drop-shadow-md">
                Turn ideas into 1-min videos
              </div>
              <div className="text-gray-200 font-normal text-xs sm:text-sm mt-1 drop-shadow">
                from just $1
              </div>
            </div>
          </div>

          {/* Alert / Errors */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 1: CHỌN GÓI THÀNH VIÊN HOẶC MUA ĐIỂM TIÊU HAO
             ═══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <>
              {/* Membership Tiers List (Style Listen & Learn) */}
              <div className="space-y-3">
                <p className={`text-sm font-semibold tracking-wide ${textPrimary}`}>
                  {t('Chọn gói đăng ký WynMotion', 'Choose a WynMotion subscription plan')}
                </p>

                <div className="flex flex-col gap-2.5">
                  {(['premium', 'pro', 'vip'] as WynMotionTierKey[]).map((tierKey) => {
                    const cfg = WYNMOTION_TIERS[tierKey];
                    const isSelected = activeItemType === 'tier' && selectedTier === tierKey;
                    const isVip = tierKey === 'vip';
                    const isPro = tierKey === 'pro';
                    const firstPlan = cfg.durations[0];

                    // Concise descriptions matching Listen & Learn format
                    const shortDesc =
                      tierKey === 'vip'
                        ? t(
                            'Độc quyền Templates VEO Ads + Xuất 4K + 299 điểm AI/tháng',
                            'Exclusive VEO Ads Templates + 4K Export + 299 AI points/mo'
                          )
                        : tierKey === 'pro'
                        ? t(
                            'Tất cả tính năng Premium + 125 Shaders & 40 VFX + 199 điểm AI/tháng',
                            'All Premium + 125 Shaders & 40 VFX + 199 AI points/mo'
                          )
                        : t(
                            'Sử dụng tất cả các Templates Premium + 129 điểm AI/tháng',
                            'All Premium Templates + 129 AI points/mo'
                          );

                    return (
                      <button
                        key={tierKey}
                        type="button"
                        onClick={() => {
                          setActiveItemType('tier');
                          setSelectedTier(tierKey);
                        }}
                        className={`relative rounded-2xl p-4 text-left transition-all border-2 flex items-center justify-between gap-4 cursor-pointer ${
                          isSelected
                            ? isVip
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-[#FF2D55] bg-[#FF2D55]/10'
                            : isDarkMode
                            ? 'border-gray-800 bg-gray-800/40 hover:border-gray-700'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Selection circle */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? isVip
                                  ? 'border-purple-500'
                                  : 'border-[#FF2D55]'
                                : isDarkMode
                                ? 'border-gray-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <div className={`w-2.5 h-2.5 rounded-full ${isVip ? 'bg-purple-500' : 'bg-[#FF2D55]'}`} />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm sm:text-base font-bold ${textPrimary}`}>
                                {t(cfg.nameVi, cfg.nameEn)}
                              </span>
                              {cfg.badgeVi && (
                                <span
                                  className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white ${
                                    isVip ? 'bg-purple-600' : isPro ? 'bg-teal-500' : 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570]'
                                  }`}
                                >
                                  {t(cfg.badgeVi, cfg.badgeEn || '')}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs mt-0.5 ${textMuted}`}>{shortDesc}</p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div
                            className={`text-base font-extrabold ${
                              isSelected ? (isVip ? 'text-purple-400' : 'text-[#FF2D55]') : textPrimary
                            }`}
                          >
                            {getDisplayPrice(firstPlan.key, firstPlan.priceVndDisplay, firstPlan.priceUsdDisplay)}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${textMuted}`}>
                            {t('từ ', 'from ')}
                            {getDisplayPerMonth(
                              firstPlan.key,
                              firstPlan.perMonthVnd,
                              firstPlan.perMonthUsd
                            )}
                            /{t('tháng', 'mo')}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: AI Credit Packs (Only for Active Members) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-[#FF2D55]" />
                    <p className={`text-sm font-semibold tracking-wide ${textPrimary}`}>
                      {t('Gói nạp thêm điểm AI tiêu hao', 'Additional AI Credit Packs')}
                    </p>
                  </div>
                  {!isMember && (
                    <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {t('Yêu cầu tài khoản Premium+', 'Requires Premium+')}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2.5">
                  {WYNMOTION_POINT_PACKS.map((pack) => {
                    const isSelected = activeItemType === 'point' && selectedPointKey === pack.key;
                    const shortDesc =
                      pack.points === 600
                        ? t('Nạp thêm 600 điểm AI tiêu hao (Tiết kiệm 40%)', 'Add 600 AI consumable points (Save 40%)')
                        : pack.points === 200
                        ? t('Nạp thêm 200 điểm AI tiêu hao (Phổ biến)', 'Add 200 AI consumable points (Popular)')
                        : t('Nạp thêm 100 điểm AI tiêu hao', 'Add 100 AI consumable points');

                    return (
                      <button
                        key={pack.key}
                        type="button"
                        disabled={!isMember}
                        onClick={() => {
                          if (isMember) {
                            setActiveItemType('point');
                            setSelectedPointKey(pack.key);
                          }
                        }}
                        className={`relative rounded-2xl p-4 text-left transition-all border-2 flex items-center justify-between gap-4 ${
                          !isMember
                            ? 'opacity-55 cursor-not-allowed border-gray-800 bg-gray-900/30'
                            : isSelected
                            ? 'border-[#FF2D55] bg-[#FF2D55]/10 cursor-pointer'
                            : isDarkMode
                            ? 'border-gray-800 bg-gray-800/40 hover:border-gray-700 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'border-[#FF2D55]'
                                : isDarkMode
                                ? 'border-gray-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#FF2D55]" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm sm:text-base font-bold ${textPrimary}`}>
                                {t(pack.nameVi, pack.nameEn)}
                              </span>
                              {pack.badgeVi && (
                                <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white bg-gradient-to-r from-[#FF2D55] to-[#FF4570]">
                                  {t(pack.badgeVi, pack.badgeEn || '')}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs mt-0.5 ${textMuted}`}>{shortDesc}</p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div
                            className={`text-base font-extrabold ${isSelected ? 'text-[#FF2D55]' : textPrimary}`}
                          >
                            {getDisplayPrice(pack.key, pack.priceVndDisplay, pack.priceUsdDisplay)}
                          </div>
                          <div className={`text-[10px] mt-0.5 text-[#FF2D55] font-medium`}>
                            +{pack.points} {t('Điểm', 'Points')}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 2: CHỌN CHU KỲ THỜI HẠN (1M / 3M / 6M / 12M)
             ═══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-3">
              <p className={`text-sm font-semibold tracking-wide ${textPrimary}`}>
                {t(
                  `Chọn chu kỳ đăng ký ${tierConfig.nameVi}`,
                  `Choose ${tierConfig.nameEn} subscription duration`
                )}
              </p>

              <div className="flex flex-col gap-2.5">
                {tierConfig.durations.map((d) => {
                  const isSelected = selectedDuration === d.duration;
                  const isVip = selectedTier === 'vip';

                  const shortDesc =
                    d.duration === '12m'
                      ? t(`Tiết kiệm nhất + ${d.points} điểm AI`, `Best value + ${d.points} AI points`)
                      : d.duration === '6m'
                      ? t(`Sử dụng trọn vẹn 6 tháng + ${d.points} điểm AI`, `6 Months full access + ${d.points} AI points`)
                      : d.duration === '3m'
                      ? t(`Sử dụng trọn vẹn 3 tháng + ${d.points} điểm AI`, `3 Months full access + ${d.points} AI points`)
                      : t(`Sử dụng trọn vẹn 1 tháng + ${d.points} điểm AI`, `1 Month full access + ${d.points} AI points`);

                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setSelectedDuration(d.duration)}
                      className={`relative rounded-2xl p-4 text-left transition-all border-2 flex items-center justify-between gap-4 cursor-pointer ${
                        isSelected
                          ? isVip
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-[#FF2D55] bg-[#FF2D55]/10'
                          : isDarkMode
                          ? 'border-gray-800 bg-gray-800/40 hover:border-gray-700'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? isVip
                                ? 'border-purple-500'
                                : 'border-[#FF2D55]'
                              : isDarkMode
                              ? 'border-gray-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <div className={`w-2.5 h-2.5 rounded-full ${isVip ? 'bg-purple-500' : 'bg-[#FF2D55]'}`} />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm sm:text-base font-bold ${textPrimary}`}>
                              {d.duration === '1m'
                                ? t('1 Tháng', '1 Month')
                                : d.duration === '3m'
                                ? t('3 Tháng', '3 Months')
                                : d.duration === '6m'
                                ? t('6 Tháng', '6 Months')
                                : t('12 Tháng', '12 Months')}
                            </span>
                            {d.discountPct && d.discountPct > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                                -{d.discountPct}%
                              </span>
                            )}
                            {d.badgeVi && (
                              <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white bg-gradient-to-r from-[#FF2D55] to-[#FF4570]">
                                {t(d.badgeVi, d.badgeEn || '')}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 ${textMuted}`}>{shortDesc}</p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className={`text-base font-extrabold ${
                            isSelected ? (isVip ? 'text-purple-400' : 'text-[#FF2D55]') : textPrimary
                          }`}
                        >
                          {getDisplayPrice(d.key, d.priceVndDisplay, d.priceUsdDisplay)}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${textMuted}`}>
                          ~
                          {getDisplayPerMonth(
                            d.key,
                            d.perMonthVnd,
                            d.perMonthUsd
                          )}
                          /{t('tháng', 'mo')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Order summary */}
              <div
                className={`rounded-2xl p-4 border mt-4 ${
                  isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-sm font-bold ${textPrimary}`}>
                      {t(
                        `${tierConfig.nameVi} (${currentDurationOption.duration})`,
                        `${tierConfig.nameEn} (${currentDurationOption.duration})`
                      )}
                    </span>
                    <div className="mt-0.5 text-xs text-[#FF2D55] font-medium">
                      +{currentDurationOption.points} {t('Điểm AI tặng kèm', 'AI Bonus Points')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getDisplayPrice(
                        currentDurationOption.key,
                        currentDurationOption.priceVndDisplay,
                        currentDurationOption.priceUsdDisplay
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EULA & Privacy Policy Links for Apple Guideline 3.1.2 */}
          <div
            className={`text-[11px] ${textMuted} text-center leading-relaxed pt-2 border-t ${
              isDarkMode ? 'border-gray-800' : 'border-gray-100'
            }`}
          >
            {t('Bằng việc đăng ký, bạn đồng ý với ', 'By subscribing, you agree to our ')}
            <a
              href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
              onClick={(e) => {
                e.preventDefault();
                const url = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
                const cap = (window as any).Capacitor;
                if (cap?.isNativePlatform?.()) {
                  window.open(url, '_system');
                } else {
                  window.open(url, '_blank');
                }
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#FF2D55] cursor-pointer"
            >
              {t('Điều khoản sử dụng (EULA)', 'Terms of Use (EULA)')}
            </a>
            {t(' và ', ' and ')}
            <a
              href="https://www.wynai.pro/privacy/wynmotion"
              onClick={(e) => {
                e.preventDefault();
                const url = 'https://www.wynai.pro/privacy/wynmotion';
                const cap = (window as any).Capacitor;
                if (cap?.isNativePlatform?.()) {
                  window.open(url, '_system');
                } else {
                  window.open(url, '_blank');
                }
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#FF2D55] cursor-pointer"
            >
              {t('Chính sách bảo mật', 'Privacy Policy')}
            </a>
            .
          </div>
        </div>

        {/* ── Footer Bar (Strictly Matching Listen & Learn Format: Khôi phục - Hủy - Thanh toán) ── */}
        <div
          className={`flex-shrink-0 ${bg} ${border} border-t sm:rounded-b-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3`}
        >
          <p className={`text-xs ${textMuted} hidden sm:block`}>
            {!user
              ? t('Vui lòng đăng nhập để tiếp tục thanh toán', 'Please log in to proceed with payment')
              : isIosPlatform
              ? t('Giao dịch xử lý qua Apple App Store', 'Transaction handled by Apple App Store')
              : currency === 'USD'
              ? t('Thanh toán quốc tế qua Lemon Squeezy (USD)', 'International payment via Lemon Squeezy (USD)')
              : t('Thanh toán quét mã VietQR tự động qua SePay (VND)', 'Scan VietQR automatic payment via SePay (VND)')}
          </p>

          <div className="flex gap-2.5 w-full sm:w-auto items-center justify-end">
            {isIosPlatform && (
              <button
                type="button"
                onClick={handleRestorePurchases}
                disabled={isLoading}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all sm:text-sm sm:px-4 ${
                  isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('Khôi phục', 'Restore')}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all sm:text-sm sm:px-4 ${
                isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {t('Hủy', 'Cancel')}
            </button>

            {step === 1 && activeItemType === 'tier' ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#FF2D55] to-[#FF4570] hover:from-rose-500 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>{t('Chọn chu kỳ thời hạn', 'Select Plan Duration')}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  if (step === 2) {
                    handleProceedCheckout(currentDurationOption.key, true);
                  } else {
                    handleProceedCheckout(selectedPointKey, false);
                  }
                }}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 whitespace-nowrap cursor-pointer ${
                  selectedTier === 'vip' && step === 2
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-purple-500/20'
                    : 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] hover:from-rose-500 hover:to-pink-600 shadow-rose-500/25'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <span>{t('Đang xử lý...', 'Processing...')}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isIosPlatform
                        ? t('Thanh toán Apple', 'Pay with Apple')
                        : currency === 'USD'
                        ? t('Thanh toán USD (Lemon Squeezy)', 'Pay USD (Lemon Squeezy)')
                        : t('Thanh toán qua SePay (VietQR)', 'Pay via SePay (VietQR)')}
                    </span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WynMotionUpgradeModal;
