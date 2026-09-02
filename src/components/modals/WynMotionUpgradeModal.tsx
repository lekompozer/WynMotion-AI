'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Crown,
  Check,
  Zap,
  Sparkles,
  ChevronRight,
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
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import {
  WYNMOTION_SUBSCRIPTION_PLANS,
  WYNMOTION_POINT_PACKS,
  submitFormToSePay,
  createWebCheckout,
  purchaseAppleProduct,
  restoreApplePurchases,
} from '@/services/wynmotionPaymentService';

interface WynMotionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'subscriptions' | 'points';
  defaultPlanKey?: string;
  onSuccess?: () => void;
}

export const WynMotionUpgradeModal: React.FC<WynMotionUpgradeModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'subscriptions',
  defaultPlanKey,
  onSuccess,
}) => {
  const { isVietnamese, isDark, t } = useApp();
  const { user, refreshSubscription } = useWordaiAuth();

  const isDarkMode = isDark;
  const isIosPlatform = typeof window !== 'undefined' && (
    Capacitor.getPlatform() === 'ios' ||
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (Boolean(navigator.maxTouchPoints) && navigator.maxTouchPoints > 2 && /Macintosh/.test(navigator.userAgent))
  );

  const [activeCategory, setActiveCategory] = useState<'subscriptions' | 'points'>(defaultTab);
  const [currency, setCurrency] = useState<'VND' | 'USD'>(isVietnamese ? 'VND' : 'USD');
  const [selectedSubKey, setSelectedSubKey] = useState<string>(defaultPlanKey || 'wynmotion_pro_199k');
  const [selectedPointKey, setSelectedPointKey] = useState<string>('wynmotion_credits_199k');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (defaultTab) setActiveCategory(defaultTab);
    if (defaultPlanKey) setSelectedSubKey(defaultPlanKey);
  }, [defaultTab, defaultPlanKey]);

  useEffect(() => {
    if (isOpen) {
      setCurrency(isVietnamese ? 'VND' : 'USD');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, isVietnamese]);

  if (!isOpen || !mounted) return null;

  // ── Styles (100% Identical to ConversationsUpgradeModal) ──
  const bg = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const border = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const isSubscription = activeCategory === 'subscriptions';
  const selectedPlan = isSubscription
    ? WYNMOTION_SUBSCRIPTION_PLANS.find((p) => p.key === selectedSubKey)
    : null;
  const selectedPoint = !isSubscription
    ? WYNMOTION_POINT_PACKS.find((p) => p.key === selectedPointKey)
    : null;

  const handleCheckout = async () => {
    if (currency === 'USD' && !isIosPlatform) {
      const url = new URL('https://checkout.wynai.pro/checkout');
      if (user?.uid) url.searchParams.set('user_id', user.uid);
      if (user?.email) url.searchParams.set('email', user.email);
      const planKey = isSubscription ? selectedSubKey : selectedPointKey;
      if (planKey) url.searchParams.set('plan', planKey);
      window.open(url.toString(), '_blank');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const productId = isSubscription ? selectedSubKey : selectedPointKey;

    try {
      if (isIosPlatform) {
        // Apple In-App Purchase Flow (iOS Native StoreKit)
        const result = await purchaseAppleProduct(productId, user?.uid || 'guest_user');
        if (!result.success) {
          if (result.error === 'USER_CANCELLED') {
            setIsLoading(false);
            return;
          }
          throw new Error(result.error || t('Thanh toán Apple Store thất bại', 'Apple purchase failed'));
        }

        setSuccessMessage(
          t('🎉 Kích hoạt thành công qua Apple In-App Purchase!', '🎉 Activated successfully via Apple Store!')
        );
        await refreshSubscription();
        onSuccess?.();
        setTimeout(() => {
          setIsLoading(false);
          onClose();
        }, 1500);
      } else {
        // Web Checkout Flow (SePay VietQR)
        const token = user ? await user.getIdToken() : undefined;
        const res = await createWebCheckout({
          productId,
          isSubscription,
          currency,
          userToken: token,
          userEmail: user?.email || undefined,
        });

        if (res.error) {
          throw new Error(res.error);
        }

        if (res.formFields && res.checkoutUrl) {
          submitFormToSePay(res.checkoutUrl, res.formFields);
        } else if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
        } else {
          throw new Error(t('Không nhận được URL thanh toán từ server', 'No payment URL returned'));
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t('Đã xảy ra lỗi khi thanh toán', 'Payment error occurred'));
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await restoreApplePurchases();
      if (!res.success) {
        throw new Error(res.error || t('Không tìm thấy giao dịch để khôi phục', 'No purchases to restore'));
      }
      await refreshSubscription();
      setSuccessMessage(
        t('✅ Đã khôi phục giao dịch mua từ Apple ID!', '✅ Restored purchases from Apple ID successfully!')
      );
      setTimeout(() => setIsLoading(false), 2000);
    } catch (e: any) {
      setErrorMessage(e?.message || t('Khôi phục giao dịch thất bại', 'Restore failed'));
      setIsLoading(false);
    }
  };

  const content = (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100000] flex items-start justify-center overflow-y-auto p-4">
      <div className={`relative w-full max-w-[1040px] my-8 rounded-2xl shadow-2xl border ${bg} ${border}`}>
        {/* ── 1. Header (Identical to ConversationsUpgradeModal) ── */}
        <div className={`sticky top-0 ${bg} ${border} border-b rounded-t-2xl p-5 flex items-center justify-between z-10`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 flex items-center justify-center border border-amber-500/20">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${textPrimary}`}>
                {t('Nâng cấp WynMotion AI Studio', 'Upgrade to WynMotion AI Studio')}
              </h2>
              <p className={`text-xs ${textMuted}`}>
                {t('Mở khóa sáng tạo Video 4K, 125+ VFX & Giọng AI 48kHz không giới hạn', 'Unlock unlimited 4K Video, 125+ VFX & 48kHz AI Voice')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency toggle */}
            <div className={`flex items-center p-0.5 rounded-lg border text-xs font-semibold ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
              <button
                type="button"
                onClick={() => setCurrency('VND')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currency === 'VND'
                    ? 'bg-amber-500 text-white shadow-sm font-bold'
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
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currency === 'USD'
                    ? 'bg-amber-500 text-white shadow-sm font-bold'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                USD
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 2. Body (Identical layout to ConversationsUpgradeModal) ── */}
        <div className="p-5 space-y-5">
          {/* Benefits strip */}
          <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Film, label: t('Xuất video 1080p / 4K', '1080p / 4K Video export') },
                { icon: ShieldCheck, label: t('Xóa 100% Watermark', 'No WynMotion Watermark') },
                { icon: Layers, label: t('125+ Shaders & 40 VFX', '125+ Shaders & 40 VFX') },
                { icon: Mic, label: t('Giọng đọc AI VieNeu 48kHz', '48kHz VieNeu AI Voice') },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className={`text-xs ${isDarkMode ? 'text-amber-200' : 'text-amber-700'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscriptions vs Points Category Switcher */}
          <div className={`p-1 rounded-xl flex border max-w-md ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
            <button
              type="button"
              onClick={() => setActiveCategory('subscriptions')}
              className={`flex-1 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeCategory === 'subscriptions'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>{t('Gói Định Kỳ (Subscriptions)', 'Subscription Plans')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('points')}
              className={`flex-1 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeCategory === 'points'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>{t('Nạp Điểm AI (Points)', 'AI Point Packs')}</span>
            </button>
          </div>

          {/* ── Category 1: Subscriptions Cards ── */}
          {activeCategory === 'subscriptions' && (
            <div>
              <p className={`text-sm font-medium ${textPrimary} mb-3`}>
                {t('Chọn gói thuê bao WynMotion (1 Tháng)', 'Choose a WynMotion subscription plan (1 Month)')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {WYNMOTION_SUBSCRIPTION_PLANS.map((plan) => {
                  const isSelected = selectedSubKey === plan.key;
                  const isVip = plan.key === 'wynmotion_vip_299k';
                  const priceDisplay = currency === 'VND' ? plan.priceVndDisplay : plan.priceUsdDisplay;
                  const badge = isVietnamese ? plan.badgeVi : plan.badgeEn;
                  const features = isVietnamese ? plan.featuresVi : plan.featuresEn;

                  return (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => setSelectedSubKey(plan.key)}
                      className={`relative rounded-xl p-4 text-left transition-all border-2 flex flex-col justify-between min-h-[170px] ${
                        isSelected
                          ? isVip
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-amber-500 bg-amber-500/10'
                          : isDarkMode
                          ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {/* Badge on top */}
                      {badge && (
                        <span
                          className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap text-white ${
                            isVip ? 'bg-purple-600' : plan.popular ? 'bg-teal-500' : 'bg-amber-500'
                          }`}
                        >
                          {badge}
                        </span>
                      )}

                      {/* Selected indicator */}
                      {isSelected && (
                        <div
                          className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center ${
                            isVip ? 'bg-purple-500' : 'bg-amber-500'
                          }`}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}

                      <div>
                        {/* Label */}
                        <div
                          className={`text-sm font-bold mb-1.5 ${
                            isSelected ? (isVip ? 'text-purple-400' : 'text-amber-400') : textPrimary
                          }`}
                        >
                          {isVietnamese ? plan.nameVi : plan.nameEn}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1 mt-1">
                          <span
                            className={`text-xl font-bold ${
                              isSelected ? (isVip ? 'text-purple-300' : 'text-amber-300') : textPrimary
                            }`}
                          >
                            {priceDisplay}
                          </span>
                          <span className={`text-xs ${textMuted}`}>/{t('tháng', 'mo')}</span>
                        </div>

                        {/* Features Checklist */}
                        <ul className="mt-3 space-y-1.5 text-xs">
                          {features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isVip ? 'text-purple-400' : 'text-amber-400'}`} />
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Category 2: Points Cards ── */}
          {activeCategory === 'points' && (
            <div>
              <p className={`text-sm font-medium ${textPrimary} mb-3`}>
                {t('Chọn gói nạp điểm AI (Dùng hết mua tiếp)', 'Choose an AI points package (Consumable)')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {WYNMOTION_POINT_PACKS.map((pack) => {
                  const isSelected = selectedPointKey === pack.key;
                  const priceDisplay = currency === 'VND' ? pack.priceVndDisplay : pack.priceUsdDisplay;
                  const badge = isVietnamese ? pack.badgeVi : pack.badgeEn;
                  const desc = isVietnamese ? pack.descVi : pack.descEn;

                  return (
                    <button
                      key={pack.key}
                      type="button"
                      onClick={() => setSelectedPointKey(pack.key)}
                      className={`relative rounded-xl p-4 text-left transition-all border-2 flex flex-col justify-between min-h-[170px] ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10'
                          : isDarkMode
                          ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {/* Badge on top */}
                      {badge && (
                        <span
                          className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap text-white ${
                            pack.popular ? 'bg-teal-500' : 'bg-amber-500'
                          }`}
                        >
                          {badge}
                        </span>
                      )}

                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center bg-amber-500">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span className={`text-sm font-bold ${isSelected ? 'text-amber-400' : textPrimary}`}>
                            {pack.nameVi}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-1 mt-1">
                          <span className={`text-xl font-bold ${isSelected ? 'text-amber-300' : textPrimary}`}>
                            {priceDisplay}
                          </span>
                        </div>

                        <p className={`mt-3 text-xs leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── International USD Payment Card (Identical to ConversationsUpgradeModal lines 590-646) ── */}
          {!isIosPlatform && currency === 'USD' && (
            <div className={`rounded-2xl p-4 border space-y-3 ${isDarkMode ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50/80 border-indigo-200'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <p className={`text-sm font-bold ${textPrimary}`}>
                      {t('Thanh toán quốc tế USD (Visa / Mastercard / PayPal)', 'International USD Payment (Credit Card / PayPal)')}
                    </p>
                  </div>
                  <p className={`text-xs mt-1.5 leading-relaxed ${textMuted}`}>
                    {t(
                      'Để thanh toán bằng USD qua thẻ Credit/Debit hoặc PayPal, vui lòng vào ',
                      'To pay in USD using Credit/Debit Card or PayPal, go to '
                    )}
                    <a
                      href="https://checkout.wynai.pro/checkout"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-indigo-400 underline hover:text-indigo-300"
                    >
                      https://checkout.wynai.pro/checkout
                    </a>
                    {t(
                      ' chọn gói WynMotion phù hợp và nhập thông tin thanh toán.',
                      ', select your preferred WynMotion plan, and enter your Card or PayPal details.'
                    )}
                  </p>
                </div>
                <a
                  href="https://checkout.wynai.pro/checkout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center flex-shrink-0 shadow-md hover:shadow-indigo-500/20"
                >
                  <span>{t('Thanh toán USD ↗', 'Pay in USD ↗')}</span>
                </a>
              </div>
            </div>
          )}

          {/* ── Order Summary Card (Identical to ConversationsUpgradeModal lines 783-817) ── */}
          {(selectedPlan || selectedPoint) && (
            <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-medium ${textPrimary}`}>
                    {isSubscription
                      ? t(`Gói ${selectedPlan?.nameVi}`, `${selectedPlan?.nameEn} Plan`)
                      : t(`Gói ${selectedPoint?.nameVi}`, `${selectedPoint?.nameEn}`)}
                  </span>
                  <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    {isSubscription
                      ? t('Thời hạn 1 tháng · Xuất video 1080p/4K · Không Watermark', '1 Month duration · 1080p/4K Video · No Watermark')
                      : t('Điểm khả dụng ngay sau khi thanh toán', 'Points credited instantly after payment')}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currency === 'VND'
                      ? (isSubscription ? selectedPlan?.priceVndDisplay : selectedPoint?.priceVndDisplay)
                      : (isSubscription ? selectedPlan?.priceUsdDisplay : selectedPoint?.priceUsdDisplay)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error & Success Alerts */}
          {errorMessage && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Apple Review Compliance Box (Required for iOS App Store) */}
          {isIosPlatform && (
            <div className={`p-3.5 rounded-xl border text-[11px] leading-relaxed space-y-1.5 ${isDarkMode ? 'bg-gray-800/40 border-gray-700/60 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              <p>
                {t(
                  '• Gói đăng ký tự động gia hạn mỗi tháng trừ khi hủy ít nhất 24 giờ trước khi kết thúc chu kỳ hiện tại.',
                  '• Subscriptions auto-renew monthly unless canceled at least 24 hours before the end of the current period.'
                )}
              </p>
              <div className="pt-1 flex items-center gap-3 font-semibold">
                <a href="https://wordai.pro/terms" target="_blank" rel="noreferrer" className="underline hover:text-amber-500">
                  {t('Điều khoản sử dụng (EULA)', 'Terms of Use (EULA)')}
                </a>
                <span>•</span>
                <a href="https://wordai.pro/privacy" target="_blank" rel="noreferrer" className="underline hover:text-amber-500">
                  {t('Chính sách bảo mật', 'Privacy Policy')}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Footer (Identical to ConversationsUpgradeModal lines 829-870) ── */}
        <div className={`sticky bottom-0 ${bg} ${border} border-t rounded-b-2xl p-5 flex items-center justify-between gap-3`}>
          <p className={`text-xs ${textMuted} hidden sm:block`}>
            {isIosPlatform
              ? t('Giao dịch xử lý an toàn qua Apple App Store', 'Transaction handled securely by Apple App Store')
              : currency === 'USD'
              ? t('Thanh toán an toàn qua Thẻ quốc tế / PayPal', 'Secure payment via Credit Card / PayPal')
              : t('Thanh toán an toàn qua SePay (VietQR)', 'Secure payment via SePay (VietQR)')}
          </p>

          <div className="flex gap-3 ml-auto items-center">
            {isIosPlatform && (
              <button
                type="button"
                onClick={handleRestore}
                disabled={isLoading}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" />
                  {t('Khôi phục', 'Restore')}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('Hủy', 'Cancel')}
            </button>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isLoading || (currency === 'VND' && !user)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg active:scale-95 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-amber-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('Đang xử lý...', 'Processing...')}</span>
                </>
              ) : (
                <>
                  <span>
                    {isIosPlatform
                      ? t('Thanh toán qua Apple', 'Pay with Apple')
                      : t('Tiếp tục thanh toán', 'Proceed to payment')}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
