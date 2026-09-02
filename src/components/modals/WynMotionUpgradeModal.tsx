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
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import {
  WYNMOTION_SUBSCRIPTION_PLANS,
  WYNMOTION_POINT_PACKS,
  WynMotionPlan,
  WynMotionPointPack,
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

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'points'>(defaultTab);
  const [currency, setCurrency] = useState<'VND' | 'USD'>(isVietnamese ? 'VND' : 'USD');
  const [selectedSubKey, setSelectedSubKey] = useState<string>(
    defaultPlanKey || 'wynmotion_pro_199k'
  );
  const [selectedPointKey, setSelectedPointKey] = useState<string>('wynmotion_credits_199k');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const isIosPlatform = Capacitor.getPlatform() === 'ios';

  useEffect(() => {
    setMounted(true);
    if (defaultTab) setActiveTab(defaultTab);
    if (defaultPlanKey) setSelectedSubKey(defaultPlanKey);
  }, [defaultTab, defaultPlanKey]);

  useEffect(() => {
    // If on iOS App Store, sync currency to VND if device is VN, else USD
    if (isVietnamese) {
      setCurrency('VND');
    } else {
      setCurrency('USD');
    }
  }, [isVietnamese]);

  if (!isOpen || !mounted) return null;

  const bgModal = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textTitle = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBorder = isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50';

  const handleCheckout = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const isSubscription = activeTab === 'subscriptions';
    const productId = isSubscription ? selectedSubKey : selectedPointKey;

    try {
      if (isIosPlatform) {
        // ── Apple In-App Purchase Flow (iOS Native StoreKit) ──
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
        // ── Web Checkout Flow (SePay VietQR or Lemon Squeezy) ──
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
          // SePay hidden form POST with HMAC signature
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${bgModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg sm:text-xl font-black ${textTitle}`}>
                  {t('Nâng Cấp WynMotion Studio', 'Upgrade WynMotion Studio')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  VIP
                </span>
              </div>
              <p className={`text-xs ${textSub} mt-0.5`}>
                {t('Mở khóa sáng tạo Video AI, 48kHz Voice & VFX đỉnh cao', 'Unlock unlimited AI Video, 48kHz Voice & VFX')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency toggle for Web preview */}
            <div className={`flex items-center p-0.5 rounded-xl border text-xs font-bold ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setCurrency('VND')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currency === 'VND'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                VND
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currency === 'USD'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                USD
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-all active:scale-95 ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Feature Highlights Strip */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl border ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50/80 border-amber-200'}`}>
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className={`text-xs font-bold ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                {t('Video 1080p / 4K', '1080p / 4K Video')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className={`text-xs font-bold ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                {t('Xóa 100% Watermark', 'No Watermark')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className={`text-xs font-bold ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                {t('125+ Shaders & VFX', '125+ Shaders & VFX')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className={`text-xs font-bold ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                {t('Giọng AI 48kHz', '48kHz AI Voice')}
              </span>
            </div>
          </div>

          {/* Tab Switcher: Subscriptions vs Points */}
          <div className={`p-1 rounded-2xl flex border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            <button
              type="button"
              onClick={() => setActiveTab('subscriptions')}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'subscriptions'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crown className="w-4 h-4" />
              {t('Gói Định Kỳ (Subscriptions)', 'Subscription Plans')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('points')}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'points'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coins className="w-4 h-4" />
              {t('Nạp Điểm AI (Points)', 'AI Point Packs')}
            </button>
          </div>

          {/* Tab 1: Subscriptions Cards */}
          {activeTab === 'subscriptions' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {WYNMOTION_SUBSCRIPTION_PLANS.map((plan) => {
                const isSelected = selectedSubKey === plan.key;
                const priceDisplay = currency === 'VND' ? plan.priceVndDisplay : plan.priceUsdDisplay;
                const features = isVietnamese ? plan.featuresVi : plan.featuresEn;
                const badge = isVietnamese ? plan.badgeVi : plan.badgeEn;

                return (
                  <div
                    key={plan.key}
                    onClick={() => setSelectedSubKey(plan.key)}
                    className={`relative rounded-2xl p-4 border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                        : `${cardBorder} hover:border-slate-600`
                    }`}
                  >
                    {badge && (
                      <div className="absolute -top-2.5 right-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide text-white shadow-sm ${
                            plan.highlight
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                              : 'bg-slate-700'
                          }`}
                        >
                          {badge}
                        </span>
                      </div>
                    )}

                    <div>
                      <h3 className={`text-base font-black ${textTitle}`}>{plan.nameVi}</h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-amber-500">{priceDisplay}</span>
                        <span className={`text-xs ${textSub}`}>
                          /{t('tháng', 'month')}
                        </span>
                      </div>

                      <ul className="mt-4 space-y-2 text-xs">
                        {features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/40">
                      <div
                        className={`w-full py-2 rounded-xl text-center text-xs font-black transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : isDark
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? t('Đã chọn', 'Selected') : t('Chọn gói này', 'Select Plan')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Point Packs Cards */}
          {activeTab === 'points' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {WYNMOTION_POINT_PACKS.map((pack) => {
                const isSelected = selectedPointKey === pack.key;
                const priceDisplay = currency === 'VND' ? pack.priceVndDisplay : pack.priceUsdDisplay;
                const badge = isVietnamese ? pack.badgeVi : pack.badgeEn;
                const desc = isVietnamese ? pack.descVi : pack.descEn;

                return (
                  <div
                    key={pack.key}
                    onClick={() => setSelectedPointKey(pack.key)}
                    className={`relative rounded-2xl p-4 border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                        : `${cardBorder} hover:border-slate-600`
                    }`}
                  >
                    {badge && (
                      <div className="absolute -top-2.5 right-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide text-white shadow-sm ${
                            pack.popular
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                              : 'bg-slate-700'
                          }`}
                        >
                          {badge}
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <h3 className={`text-base font-black ${textTitle}`}>{pack.nameVi}</h3>
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-amber-500">{priceDisplay}</span>
                      </div>

                      <p className={`mt-3 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/40">
                      <div
                        className={`w-full py-2 rounded-xl text-center text-xs font-black transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : isDark
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? t('Đã chọn', 'Selected') : t('Nạp gói này', 'Top-up')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-400">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ── Apple Review Compliance Box (Required for In-App Purchase approval) ── */}
          <div className={`p-3.5 rounded-2xl border text-[11px] leading-relaxed space-y-1.5 ${isDark ? 'bg-slate-950/60 border-slate-800/60 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <p>
              {t(
                '• Gói đăng ký tự động gia hạn mỗi tháng trừ khi hủy ít nhất 24 giờ trước khi kết thúc chu kỳ hiện tại.',
                '• Subscriptions auto-renew monthly unless canceled at least 24 hours before the end of the current period.'
              )}
            </p>
            <p>
              {t(
                '• Quản lý hoặc hủy bất cứ lúc nào trong Cài đặt tài khoản Apple ID / App Store sau khi mua.',
                '• Manage or cancel your subscription anytime in your Apple ID / App Store Account Settings.'
              )}
            </p>
            <div className="pt-1 flex items-center gap-3 font-semibold">
              <a
                href="https://wordai.pro/terms"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-amber-500 cursor-pointer"
              >
                {t('Điều khoản sử dụng (EULA)', 'Terms of Use (EULA)')}
              </a>
              <span>•</span>
              <a
                href="https://wordai.pro/privacy"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-amber-500 cursor-pointer"
              >
                {t('Chính sách bảo mật', 'Privacy Policy')}
              </a>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
          <p className={`text-xs ${textSub} hidden sm:block`}>
            {isIosPlatform
              ? t('Giao dịch xử lý an toàn qua Apple App Store', 'Transaction handled securely by Apple App Store')
              : currency === 'VND'
              ? t('Thanh toán an toàn qua SePay (VietQR)', 'Secure payment via SePay (VietQR)')
              : t('Thanh toán quốc tế qua Lemon Squeezy (Thẻ / PayPal)', 'Global payment via Lemon Squeezy')}
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Restore button (Mandatory on iOS App Store) */}
            <button
              type="button"
              onClick={handleRestore}
              disabled={isLoading}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" />
                {t('Khôi phục', 'Restore')}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {t('Hủy', 'Cancel')}
            </button>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isLoading}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                      : t('Tiếp tục thanh toán', 'Proceed to Payment')}
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
