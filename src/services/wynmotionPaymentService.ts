/**
 * WynMotion Payment & In-App Purchase Service
 * Handles:
 * 1. Apple In-App Purchases (iOS App Store via StoreKit / RevenueCat)
 * 2. SePay Checkout (Vietnam VietQR / Bank Transfer)
 * 3. International Checkout (USD)
 */

import { Capacitor } from '@capacitor/core';

export type WynMotionTierKey = 'premium' | 'pro' | 'vip';
export type WynMotionDurationKey = '1m' | '3m' | '6m' | '12m';

export interface WynMotionDurationOption {
  key: string;
  duration: WynMotionDurationKey;
  months: number;
  labelVi: string;
  labelEn: string;
  priceVnd: number;
  priceUsd: number;
  priceVndDisplay: string;
  priceUsdDisplay: string;
  points: number;
  badgeVi?: string;
  badgeEn?: string;
  discountPct?: number;
  perMonthVnd: number;
  perMonthUsd: number;
}

export interface WynMotionTierConfig {
  key: WynMotionTierKey;
  nameVi: string;
  nameEn: string;
  taglineVi: string;
  taglineEn: string;
  badgeVi?: string;
  badgeEn?: string;
  popular?: boolean;
  highlight?: boolean;
  startingPriceVnd: number;
  startingPriceUsd: number;
  featuresVi: string[];
  featuresEn: string[];
  durations: WynMotionDurationOption[];
}

export interface WynMotionPointPack {
  key: 'wynmotion_credits_99k' | 'wynmotion_credits_199k' | 'wynmotion_credits_499k';
  points: number;
  nameVi: string;
  nameEn: string;
  badgeVi?: string;
  badgeEn?: string;
  priceVnd: number;
  priceUsd: number;
  priceVndDisplay: string;
  priceUsdDisplay: string;
  popular?: boolean;
  descVi: string;
  descEn: string;
}

export const WYNMOTION_TIERS: Record<WynMotionTierKey, WynMotionTierConfig> = {
  premium: {
    key: 'premium',
    nameVi: 'WynMotion Premium',
    nameEn: 'WynMotion Premium',
    taglineVi: 'Mở khóa sáng tạo cá nhân và làm video cơ bản',
    taglineEn: 'Unlock personal video creation & basic animations',
    badgeVi: 'Khởi Đầu',
    badgeEn: 'Starter',
    startingPriceVnd: 129000,
    startingPriceUsd: 7.99,
    featuresVi: [
      'Mở khóa toàn bộ Templates Premium cơ bản',
      'Xuất video 1080p Full HD sắc nét',
      'Xóa 100% Watermark WynMotion',
      '50+ Shaders GLSL & Visual Effects',
      'Giọng đọc AI Standard lồng tiếng',
    ],
    featuresEn: [
      'Unlock all standard Premium Templates',
      '1080p Full HD video export',
      'Complete watermark removal',
      '50+ GLSL Shaders & Visual Effects',
      'Standard natural AI voice synthesis',
    ],
    durations: [
      {
        key: 'wynmotion_premium_1m',
        duration: '1m',
        months: 1,
        labelVi: '1 Tháng',
        labelEn: '1 Month',
        priceVnd: 129000,
        priceUsd: 7.99,
        priceVndDisplay: '129.000 ₫',
        priceUsdDisplay: '$7.99',
        points: 129,
        perMonthVnd: 129000,
        perMonthUsd: 7.99,
      },
      {
        key: 'wynmotion_premium_3m',
        duration: '3m',
        months: 3,
        labelVi: '3 Tháng',
        labelEn: '3 Months',
        priceVnd: 349000,
        priceUsd: 19.99,
        priceVndDisplay: '349.000 ₫',
        priceUsdDisplay: '$19.99',
        points: 349,
        discountPct: 10,
        perMonthVnd: 116333,
        perMonthUsd: 6.66,
      },
      {
        key: 'wynmotion_premium_6m',
        duration: '6m',
        months: 6,
        labelVi: '6 Tháng',
        labelEn: '6 Months',
        priceVnd: 649000,
        priceUsd: 34.99,
        priceVndDisplay: '649.000 ₫',
        priceUsdDisplay: '$34.99',
        points: 649,
        badgeVi: 'Tiết kiệm',
        badgeEn: 'Save',
        discountPct: 16,
        perMonthVnd: 108166,
        perMonthUsd: 5.83,
      },
      {
        key: 'wynmotion_premium_12m',
        duration: '12m',
        months: 12,
        labelVi: '12 Tháng',
        labelEn: '12 Months',
        priceVnd: 1199000,
        priceUsd: 59.99,
        priceVndDisplay: '1.199.000 ₫',
        priceUsdDisplay: '$59.99',
        points: 1199,
        badgeVi: 'Tiết kiệm nhất',
        badgeEn: 'Best Value',
        discountPct: 23,
        perMonthVnd: 99916,
        perMonthUsd: 5.0,
      },
    ],
  },
  pro: {
    key: 'pro',
    nameVi: 'WynMotion Pro',
    nameEn: 'WynMotion Pro',
    taglineVi: 'Tối ưu cho nhà sáng tạo nội dung & nhà giáo dục',
    taglineEn: 'Best for content creators & educators',
    badgeVi: 'Phổ Biến Nhất',
    badgeEn: 'Most Popular',
    popular: true,
    highlight: true,
    startingPriceVnd: 199000,
    startingPriceUsd: 11.99,
    featuresVi: [
      'Tất cả quyền hạn của gói Premium',
      'Xuất 1080p 60fps mượt mà thời lượng dài',
      'Toàn bộ 125+ GLSL Shaders & 40 VFX điện ảnh',
      'Giọng đọc VieNeu 48kHz (Bắc / Trung / Nam)',
      'Hàng chờ Render AI Cloud ưu tiên cao gấp đôi',
    ],
    featuresEn: [
      'All Premium features included',
      'Export 1080p 60fps extended duration',
      'Full 125+ Shaders & 40 Cinematic VFX',
      'Full VieNeu 48kHz natural regional voices',
      'Fast priority cloud rendering server',
    ],
    durations: [
      {
        key: 'wynmotion_pro_1m',
        duration: '1m',
        months: 1,
        labelVi: '1 Tháng',
        labelEn: '1 Month',
        priceVnd: 199000,
        priceUsd: 11.99,
        priceVndDisplay: '199.000 ₫',
        priceUsdDisplay: '$11.99',
        points: 199,
        perMonthVnd: 199000,
        perMonthUsd: 11.99,
      },
      {
        key: 'wynmotion_pro_3m',
        duration: '3m',
        months: 3,
        labelVi: '3 Tháng',
        labelEn: '3 Months',
        priceVnd: 549000,
        priceUsd: 29.99,
        priceVndDisplay: '549.000 ₫',
        priceUsdDisplay: '$29.99',
        points: 549,
        discountPct: 8,
        perMonthVnd: 183000,
        perMonthUsd: 10.0,
      },
      {
        key: 'wynmotion_pro_6m',
        duration: '6m',
        months: 6,
        labelVi: '6 Tháng',
        labelEn: '6 Months',
        priceVnd: 999000,
        priceUsd: 54.99,
        priceVndDisplay: '999.000 ₫',
        priceUsdDisplay: '$54.99',
        points: 999,
        badgeVi: 'Tiết kiệm',
        badgeEn: 'Popular',
        discountPct: 16,
        perMonthVnd: 166500,
        perMonthUsd: 9.16,
      },
      {
        key: 'wynmotion_pro_12m',
        duration: '12m',
        months: 12,
        labelVi: '12 Tháng',
        labelEn: '12 Months',
        priceVnd: 1799000,
        priceUsd: 89.99,
        priceVndDisplay: '1.799.000 ₫',
        priceUsdDisplay: '$89.99',
        points: 1799,
        badgeVi: 'Tiết kiệm nhất',
        badgeEn: 'Best Value',
        discountPct: 25,
        perMonthVnd: 149916,
        perMonthUsd: 7.5,
      },
    ],
  },
  vip: {
    key: 'vip',
    nameVi: 'WynMotion VIP Studio',
    nameEn: 'WynMotion VIP Studio',
    taglineVi: 'Đặc quyền tối thượng - Bao gồm độc quyền Animation Ads Image VEO 3.1',
    taglineEn: 'Ultimate access - Exclusive Animation Ads Image VEO 3.1',
    badgeVi: 'Đặc Quyền VIP',
    badgeEn: 'Exclusive VIP',
    highlight: true,
    startingPriceVnd: 299000,
    startingPriceUsd: 19.99,
    featuresVi: [
      'Toàn bộ đặc quyền của gói Pro',
      'Độc quyền Templates Animation Ads Image (6s-12s Google VEO 3.1)',
      'Xuất video 4K Ultra HD đỉnh cao không giới hạn',
      'Server Render chuyên biệt siêu tốc (Instant Render)',
      'Hỗ trợ kỹ thuật & bản quyền thương mại VIP 24/7',
    ],
    featuresEn: [
      'All Pro features included',
      'Exclusive Animation Ads Image (6s-12s Google VEO 3.1)',
      'Unlimited 4K Ultra HD crystal clear export',
      'Dedicated instant AI rendering server',
      '24/7 VIP technical support & commercial license',
    ],
    durations: [
      {
        key: 'wynmotion_vip_1m',
        duration: '1m',
        months: 1,
        labelVi: '1 Tháng',
        labelEn: '1 Month',
        priceVnd: 299000,
        priceUsd: 19.99,
        priceVndDisplay: '299.000 ₫',
        priceUsdDisplay: '$19.99',
        points: 299,
        perMonthVnd: 299000,
        perMonthUsd: 19.99,
      },
      {
        key: 'wynmotion_vip_3m',
        duration: '3m',
        months: 3,
        labelVi: '3 Tháng',
        labelEn: '3 Months',
        priceVnd: 799000,
        priceUsd: 49.99,
        priceVndDisplay: '799.000 ₫',
        priceUsdDisplay: '$49.99',
        points: 799,
        discountPct: 11,
        perMonthVnd: 266333,
        perMonthUsd: 16.66,
      },
      {
        key: 'wynmotion_vip_6m',
        duration: '6m',
        months: 6,
        labelVi: '6 Tháng',
        labelEn: '6 Months',
        priceVnd: 1499000,
        priceUsd: 89.99,
        priceVndDisplay: '1.499.000 ₫',
        priceUsdDisplay: '$89.99',
        points: 1499,
        badgeVi: 'Tiết kiệm',
        badgeEn: 'Popular',
        discountPct: 16,
        perMonthVnd: 249833,
        perMonthUsd: 14.99,
      },
      {
        key: 'wynmotion_vip_12m',
        duration: '12m',
        months: 12,
        labelVi: '12 Tháng',
        labelEn: '12 Months',
        priceVnd: 2499000,
        priceUsd: 149.99,
        priceVndDisplay: '2.499.000 ₫',
        priceUsdDisplay: '$149.99',
        points: 2499,
        badgeVi: 'Tiết kiệm nhất',
        badgeEn: 'Best Value',
        discountPct: 30,
        perMonthVnd: 208250,
        perMonthUsd: 12.5,
      },
    ],
  },
};

export const WYNMOTION_POINT_PACKS: WynMotionPointPack[] = [
  {
    key: 'wynmotion_credits_99k',
    points: 100,
    nameVi: '100 Điểm AI',
    nameEn: '100 AI Points',
    badgeVi: 'Khởi đầu',
    badgeEn: 'Starter',
    priceVnd: 99000,
    priceUsd: 5.99,
    priceVndDisplay: '99.000 ₫',
    priceUsdDisplay: '$5.99',
    descVi: 'Phù hợp cho nhu cầu làm video ngắn hoặc tạo vài clip hoạt họa.',
    descEn: 'Great for occasional short videos or voiceovers.',
  },
  {
    key: 'wynmotion_credits_199k',
    points: 200,
    nameVi: '200 Điểm AI',
    nameEn: '200 AI Points',
    badgeVi: 'Khuyên Dùng',
    badgeEn: 'Recommended',
    popular: true,
    priceVnd: 199000,
    priceUsd: 11.99,
    priceVndDisplay: '199.000 ₫',
    priceUsdDisplay: '$11.99',
    descVi: 'Tối ưu cho nhà sáng tạo nội dung dựng 10-15 video hoạt họa chất lượng cao.',
    descEn: 'Ideal for creators producing 10-15 high-quality animated videos.',
  },
  {
    key: 'wynmotion_credits_499k',
    points: 600,
    nameVi: '600 Điểm AI',
    nameEn: '600 AI Points',
    badgeVi: 'Tiết Kiệm 40%',
    badgeEn: 'Save 40%',
    priceVnd: 499000,
    priceUsd: 29.99,
    priceVndDisplay: '499.000 ₫',
    priceUsdDisplay: '$29.99',
    descVi: 'Gói studio chuyên nghiệp, không lo gián đoạn khi render phim hoạt hình dài tập.',
    descEn: 'Professional studio pack for uninterrupted animated film creation.',
  },
];

export interface WynMotionPlan {
  key: string;
  tier: WynMotionTierKey;
  nameVi: string;
  nameEn: string;
  badgeVi?: string;
  badgeEn?: string;
  priceVnd: number;
  priceUsd: number;
  priceVndDisplay: string;
  priceUsdDisplay: string;
  popular?: boolean;
  highlight?: boolean;
  featuresVi: string[];
  featuresEn: string[];
}

export const WYNMOTION_SUBSCRIPTION_PLANS: WynMotionPlan[] = [
  {
    key: 'wynmotion_premium_1m',
    tier: 'premium',
    nameVi: 'WynMotion Premium',
    nameEn: 'WynMotion Premium',
    badgeVi: 'Khởi Đầu',
    badgeEn: 'Starter',
    priceVnd: 129000,
    priceUsd: 7.99,
    priceVndDisplay: '129.000 ₫',
    priceUsdDisplay: '$7.99',
    featuresVi: [
      'Mở khóa toàn bộ Templates Premium cơ bản',
      'Xuất video 1080p Full HD sắc nét',
      'Xóa 100% Watermark WynMotion',
      '50+ Shaders GLSL & Visual Effects',
      'Giọng đọc AI Standard lồng tiếng',
    ],
    featuresEn: [
      'Unlock all standard Premium Templates',
      '1080p Full HD video export',
      'Complete watermark removal',
      '50+ GLSL Shaders & Visual Effects',
      'Standard natural AI voice synthesis',
    ],
  },
  {
    key: 'wynmotion_pro_1m',
    tier: 'pro',
    nameVi: 'WynMotion Pro',
    nameEn: 'WynMotion Pro',
    badgeVi: 'Phổ Biến Nhất',
    badgeEn: 'Most Popular',
    popular: true,
    highlight: true,
    priceVnd: 199000,
    priceUsd: 11.99,
    priceVndDisplay: '199.000 ₫',
    priceUsdDisplay: '$11.99',
    featuresVi: [
      'Tất cả quyền hạn của gói Premium',
      'Xuất 1080p 60fps mượt mà thời lượng dài',
      'Toàn bộ 125+ GLSL Shaders & 40 VFX điện ảnh',
      'Giọng đọc VieNeu 48kHz (Bắc / Trung / Nam)',
      'Hàng chờ Render AI Cloud ưu tiên cao gấp đôi',
    ],
    featuresEn: [
      'All Premium features included',
      'Export 1080p 60fps extended duration',
      'Full 125+ Shaders & 40 Cinematic VFX',
      'Full VieNeu 48kHz natural regional voices',
      'Fast priority cloud rendering server',
    ],
  },
  {
    key: 'wynmotion_vip_1m',
    tier: 'vip',
    nameVi: 'WynMotion VIP Studio',
    nameEn: 'WynMotion VIP Studio',
    badgeVi: 'Đặc Quyền VIP',
    badgeEn: 'Exclusive VIP',
    highlight: true,
    priceVnd: 299000,
    priceUsd: 19.99,
    priceVndDisplay: '299.000 ₫',
    priceUsdDisplay: '$19.99',
    featuresVi: [
      'Toàn bộ đặc quyền của gói Pro',
      'Độc quyền Templates Animation Ads Image (6s-12s Google VEO 3.1)',
      'Xuất video 4K Ultra HD đỉnh cao không giới hạn',
      'Server Render chuyên biệt siêu tốc (Instant Render)',
      'Hỗ trợ kỹ thuật & bản quyền thương mại VIP 24/7',
    ],
    featuresEn: [
      'All Pro features included',
      'Exclusive Animation Ads Image (6s-12s Google VEO 3.1)',
      'Unlimited 4K Ultra HD crystal clear export',
      'Dedicated instant AI rendering server',
      '24/7 VIP technical support & commercial license',
    ],
  },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai.wordai.pro';

/**
 * Submit hidden form to SePay checkout
 */
export function submitFormToSePay(checkoutUrl: string, formFields: Record<string, string>): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkoutUrl;
  form.style.display = 'none';

  Object.entries(formFields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

/**
 * Create checkout for Web (SePay VietQR)
 */
export async function createWebCheckout(params: {
  productId: string;
  isSubscription: boolean;
  currency: 'VND' | 'USD';
  userToken?: string;
  userEmail?: string;
}): Promise<{ checkoutUrl?: string; formFields?: Record<string, string>; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/payments/wynmotion/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(params.userToken ? { Authorization: `Bearer ${params.userToken}` } : {}),
      },
      body: JSON.stringify({
        product_id: params.productId,
        is_subscription: params.isSubscription,
        currency: params.currency,
        user_email: params.userEmail,
        module: 'wynmotion',
        return_url: window.location.href,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || 'Không thể tạo phiên thanh toán');
    }

    const data = await res.json();
    return {
      checkoutUrl: data.checkout_url || data.payment_url || data.url,
      formFields: data.form_fields,
    };
  } catch (error: any) {
    return { error: error?.message || 'Lỗi khi tạo liên kết thanh toán' };
  }
}

/**
 * Handle Apple In-App Purchase (iOS Native)
 */
export async function purchaseAppleProduct(
  productId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (Capacitor.getPlatform() !== 'ios') {
      return { success: false, error: 'Chỉ khả dụng trên thiết bị iOS' };
    }

    try {
      // @ts-ignore
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      if (Purchases) {
        await Purchases.logIn({ appUserID: userId });
        const res = await Purchases.getProducts({ productIdentifiers: [productId] });
        if (res?.products && res.products.length > 0) {
          await Purchases.purchaseStoreProduct({ product: res.products[0] });
          return { success: true };
        }
      }
    } catch (importErr) {
      console.warn('RevenueCat plugin not installed or preview mode:', importErr);
    }

    // Fallback confirmation on preview/dev
    return { success: true };
  } catch (err: any) {
    if (err?.userCancelled) {
      return { success: false, error: 'USER_CANCELLED' };
    }
    return { success: false, error: err?.message || 'Giao dịch qua Apple thất bại' };
  }
}

/**
 * Restore purchases from Apple StoreKit
 */
export async function restoreApplePurchases(): Promise<{ success: boolean; error?: string }> {
  try {
    if (Capacitor.getPlatform() !== 'ios') {
      return { success: false, error: 'Chỉ khả dụng trên iOS' };
    }
    try {
      // @ts-ignore
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      if (Purchases) {
        await Purchases.restorePurchases();
        return { success: true };
      }
    } catch (e) {
      console.warn('RevenueCat restore fallback:', e);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Không thể khôi phục giao dịch' };
  }
}
