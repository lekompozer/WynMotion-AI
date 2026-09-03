import { Purchases } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

const REVENUECAT_API_KEY =
  process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || 'appl_EIBqTQhgGjFhjJgzWIgVgiVgDmR';

let isInitialized = false;

/**
 * Initialize RevenueCat Purchases SDK
 */
export async function initRevenueCat(userId: string): Promise<boolean> {
  if (Capacitor.getPlatform() !== 'ios') {
    return false;
  }
  try {
    if (!REVENUECAT_API_KEY) {
      console.warn('[AppleIAP] No RevenueCat API key configured');
      return false;
    }

    console.log('[AppleIAP] Configuring RevenueCat with key:', REVENUECAT_API_KEY);
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId,
    });

    isInitialized = true;
    console.log('[AppleIAP] RevenueCat initialized for user:', userId);
    return true;
  } catch (error) {
    console.error('[AppleIAP] Failed to initialize RevenueCat:', error);
    return false;
  }
}

/**
 * Log in user to RevenueCat
 */
export async function loginRevenueCat(userId: string): Promise<boolean> {
  if (Capacitor.getPlatform() !== 'ios') {
    return false;
  }
  try {
    if (!isInitialized) {
      return await initRevenueCat(userId);
    }
    await Purchases.logIn({ appUserID: userId });
    console.log('[AppleIAP] Logged in user to RevenueCat:', userId);
    return true;
  } catch (error) {
    console.error('[AppleIAP] Failed to log in user to RevenueCat:', error);
    return false;
  }
}

/**
 * Verify purchase with backend and credit points
 */
export async function syncSubscriptionWithBackend(
  idToken: string,
  productId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ai.wordai.pro';
    const res = await fetch(`${apiUrl}/api/ai/motion/subscription/apple/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        product_id: productId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Backend verification failed');
    }

    const data = await res.json();
    console.log('[AppleIAP] Backend verification successful:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('[AppleIAP] Backend sync error:', error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
}

/**
 * Purchase a WynMotion Subscription or Points Pack via StoreKit / RevenueCat
 */
export async function purchaseWynMotionProduct(
  productId: string,
  userId: string,
  idToken?: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  if (Capacitor.getPlatform() !== 'ios') {
    return { success: false, error: 'Chỉ khả dụng trên thiết bị iOS' };
  }

  try {
    console.log('[AppleIAP] Initiating purchase for:', productId);

    // Ensure RevenueCat is configured
    await loginRevenueCat(userId);

    // Fetch product details from Apple StoreKit
    const productsResult = await Purchases.getProducts({
      productIdentifiers: [productId],
    });

    if (!productsResult.products || productsResult.products.length === 0) {
      throw new Error(`Sản phẩm ${productId} chưa có sẵn trên App Store`);
    }

    const storeProduct = productsResult.products[0];

    // Trigger native iOS purchase sheet
    const result = await Purchases.purchaseStoreProduct({
      product: storeProduct,
    });

    console.log('[AppleIAP] Purchase completed on StoreKit:', result);

    // Sync with backend if token is available
    if (idToken) {
      const syncResult = await syncSubscriptionWithBackend(idToken, productId);
      return { success: true, data: syncResult.data };
    }

    return { success: true };
  } catch (error: any) {
    if (error?.userCancelled) {
      console.log('[AppleIAP] User cancelled purchase');
      return { success: false, error: 'USER_CANCELLED' };
    }

    console.error('[AppleIAP] Purchase failed:', error);
    return { success: false, error: error?.message || 'Giao dịch qua Apple thất bại' };
  }
}

/**
 * Restore purchases from Apple StoreKit & Sync with Backend
 */
export async function restorePurchases(
  userId?: string,
  idToken?: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  if (Capacitor.getPlatform() !== 'ios') {
    return { success: false, error: 'Chỉ khả dụng trên iOS' };
  }

  try {
    console.log('[AppleIAP] Restoring purchases...');
    if (userId) {
      await loginRevenueCat(userId);
    }
    const customerInfo = await Purchases.restorePurchases();
    console.log('[AppleIAP] Restore completed, customer info:', customerInfo);

    if (idToken) {
      const syncResult = await syncSubscriptionWithBackend(idToken);
      return { success: true, data: syncResult.data };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[AppleIAP] Restore failed:', error);
    return { success: false, error: error?.message || 'Không thể khôi phục giao dịch' };
  }
}
