'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from 'firebase/auth';
import { wordaiAuth, wordaiGoogleProvider } from '@/lib/wordai-firebase';
import { linkAppleAccount } from '@/services/appleAuthService';

export interface UserSubscription {
  points_balance: number;
  tier?: string;
  is_active?: boolean;
}

interface WordaiAuthContextType {
  user: User | null;
  userSubscription: UserSubscription | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<boolean>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  getValidToken: () => Promise<string>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  checkEmailVerified: (email: string, pass: string) => Promise<boolean>;
  resendVerificationEmail: (email: string, pass: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const isCapacitorNative = (): boolean => {
  if (typeof window === 'undefined') return false;
  const cap = (window as any).Capacitor;
  const byMethod = !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
  const byPlatform = !!(cap && typeof cap.getPlatform === 'function' && cap.getPlatform() !== 'web');
  const byProtocol = window.location.protocol === 'capacitor:';
  return byMethod || byPlatform || byProtocol;
};

const WordaiAuthContext = createContext<WordaiAuthContextType | undefined>(undefined);

export function mapFirebaseAuthError(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Email này đã được đăng ký. Vui lòng đăng nhập.',
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự).',
    'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
    'auth/wrong-password': 'Mật khẩu không đúng.',
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
    'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau ít phút.',
    'auth/network-request-failed': 'Lỗi kết nối mạng. Kiểm tra internet.',
    'auth/user-disabled': 'Tài khoản này đã bị vô hiệu hóa.',
    'auth/operation-not-allowed': 'Phương thức đăng nhập này chưa được bật trên server.',
    'auth/popup-blocked': 'Trình duyệt chặn mở cửa sổ đăng nhập.',
  };
  return messages[code] || `Lỗi xác thực (${code})`;
}

export function WordaiAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>({ points_balance: 100 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch points balance from backend
  const fetchUserSubscription = async (currentUser: User) => {
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('https://ai.wordai.pro/api/user/subscription', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUserSubscription(data);
      }
    } catch (err) {
      console.warn('Could not fetch user subscription:', err);
    }
  };

  useEffect(() => {
    // Handle redirect result if on mobile redirect flow
    getRedirectResult(wordaiAuth)
      .then((res) => {
        if (res?.user) {
          console.log('[WynMotion Auth] getRedirectResult user:', res.user.email);
          setUser(res.user);
          fetchUserSubscription(res.user);
        }
      })
      .catch((err) => {
        console.warn('⚠️ getRedirectResult failed:', err);
      });

    const unsubscribe = onAuthStateChanged(wordaiAuth, (currentUser) => {
      console.log('[WynMotion Auth] onAuthStateChanged:', currentUser?.email || 'null');
      setUser(currentUser);
      setIsInitialized(true);
      if (currentUser) {
        fetchUserSubscription(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const getValidToken = async (): Promise<string> => {
    if (!user) throw new Error('Chưa đăng nhập');
    return await user.getIdToken(true);
  };

  /**
   * Google Sign-In with Native iOS SDK on Capacitor + Web fallback
   */
  const signIn = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    console.log('[WynMotion Auth] 🔐 signIn triggered. isCapacitorNative:', isCapacitorNative());

    // ── Capacitor iOS / Android Native Flow ──
    if (isCapacitorNative()) {
      try {
        console.log('[WynMotion Auth] Loading @capacitor-firebase/authentication...');
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');

        console.log('[WynMotion Auth] Calling native FirebaseAuthentication.signInWithGoogle()...');
        const NATIVE_TIMEOUT_MS = 45_000;
        const result = await Promise.race([
          FirebaseAuthentication.signInWithGoogle(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('NATIVE_SIGNIN_TIMEOUT')), NATIVE_TIMEOUT_MS),
          ),
        ]);

        console.log('[WynMotion Auth] Native Google result:', JSON.stringify(result));

        if (!result.credential?.idToken) {
          throw new Error('Không nhận được idToken từ Google Native Auth');
        }

        const credential = GoogleAuthProvider.credential(
          result.credential.idToken,
          result.credential.accessToken ?? undefined,
        );

        console.log('[WynMotion Auth] Calling signInWithCredential on JS Firebase...');
        const fbResult = await signInWithCredential(wordaiAuth, credential);
        console.log('[WynMotion Auth] ✅ Google Native sign-in success:', fbResult.user.email);

        setUser(fbResult.user);
        await fetchUserSubscription(fbResult.user);
        setIsLoading(false);
        return true;
      } catch (capErr: any) {
        console.error('[WynMotion Auth] ❌ Native Google Sign-In failed:', capErr);
        const msg = capErr?.message || capErr?.localizedMessage || String(capErr);

        if (msg.includes('cancel') || msg.includes('Cancel') || msg.includes('cancelled')) {
          console.log('[WynMotion Auth] User cancelled Google Sign-in');
        } else if (msg.includes('NATIVE_SIGNIN_TIMEOUT')) {
          alert('Đăng nhập Google bị gián đoạn (hết thời gian chờ). Vui lòng thử lại.');
        } else {
          alert(
            `Đăng nhập Google thất bại trên iOS.\n\n` +
              `Chi tiết lỗi: ${msg}\n\n` +
              `Kiểm tra: GoogleService-Info.plist và URL Types REVERSED_CLIENT_ID trong Xcode.`,
          );
        }
        setIsLoading(false);
        return false;
      }
    }

    // ── Web Fallback Flow ──
    try {
      console.log('[WynMotion Auth] Web path: using signInWithPopup');
      const res = await signInWithPopup(wordaiAuth, wordaiGoogleProvider);
      setUser(res.user);
      await fetchUserSubscription(res.user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('[WynMotion Auth] Web Google Sign-In error:', err);
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        try {
          await signInWithRedirect(wordaiAuth, wordaiGoogleProvider);
          return true;
        } catch (rErr: any) {
          setError(mapFirebaseAuthError(rErr.code || ''));
        }
      } else {
        const errorText = mapFirebaseAuthError(err.code || '');
        setError(errorText);
        alert(`Lỗi đăng nhập Google: ${errorText} (${err.message})`);
      }
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Apple Sign-In with Native iOS AuthenticationServices on Capacitor + Web fallback
   */
  const signInWithApple = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    console.log('[WynMotion Auth] 🍎 signInWithApple triggered. isCapacitorNative:', isCapacitorNative());

    // ── Capacitor iOS Native Flow ──
    if (isCapacitorNative()) {
      try {
        console.log('[WynMotion Auth] Loading @capacitor-firebase/authentication for Apple...');
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');

        console.log('[WynMotion Auth] Calling native FirebaseAuthentication.signInWithApple()...');
        const result = await FirebaseAuthentication.signInWithApple();
        console.log('[WynMotion Auth] Native Apple result:', JSON.stringify(result));

        const appleIdToken = result?.credential?.idToken || (result?.credential as any)?.identityToken || '';
        const appleAuthCode = result?.credential?.authorizationCode ?? '';
        const appleNonce = result?.credential?.nonce ?? '';
        const appleEmail = result?.user?.email || (result as any)?.additionalUserInfo?.profile?.email || '';

        if (!appleIdToken) {
          throw new Error('Không nhận được Apple identityToken');
        }

        const provider = new OAuthProvider('apple.com');
        const firebaseCred = provider.credential({
          idToken: appleIdToken,
          rawNonce: appleNonce || undefined,
        });

        console.log('[WynMotion Auth] Syncing Apple credential with JS Firebase...');
        const fbResult = await signInWithCredential(wordaiAuth, firebaseCred);
        console.log('[WynMotion Auth] ✅ Apple Native sign-in success:', fbResult.user.email);

        setUser(fbResult.user);
        await fetchUserSubscription(fbResult.user);

        // Fire-and-forget backend link
        linkAppleAccount(appleIdToken, appleAuthCode || undefined)
          .then((r) => console.log('🍎 Backend Apple Link OK:', r))
          .catch((e) => console.warn('🍎 Backend Apple Link warning:', e?.message));

        setIsLoading(false);
        return;
      } catch (capErr: any) {
        console.error('[WynMotion Auth] ❌ Native Apple Sign-In failed:', capErr);
        const msg = capErr?.message || capErr?.localizedMessage || String(capErr);

        if (msg.includes('cancel') || msg.includes('Cancel') || msg.includes('cancelled') || msg.includes('1001')) {
          console.log('[WynMotion Auth] User cancelled Apple Sign-in');
        } else {
          alert(`Đăng nhập Apple thất bại: ${msg}`);
        }
        setIsLoading(false);
        throw capErr;
      }
    }

    // ── Web Fallback Flow ──
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const res = await signInWithPopup(wordaiAuth, provider);
      setUser(res.user);
      await fetchUserSubscription(res.user);
      setIsLoading(false);
    } catch (err: any) {
      console.error('[WynMotion Auth] Web Apple Sign-In error:', err);
      const errorText = mapFirebaseAuthError(err.code || '');
      setError(errorText);
      alert(`Lỗi đăng nhập Apple: ${errorText} (${err.message})`);
      setIsLoading(false);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await signInWithEmailAndPassword(wordaiAuth, email, pass);
      setUser(res.user);
      await fetchUserSubscription(res.user);
    } catch (err: any) {
      const msg = mapFirebaseAuthError(err.code || '');
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(wordaiAuth, email, pass);
      if (name && res.user) {
        await updateProfile(res.user, { displayName: name.trim() });
      }
      if (res.user) {
        await sendEmailVerification(res.user);
        await firebaseSignOut(wordaiAuth);
      }
    } catch (err: any) {
      const msg = mapFirebaseAuthError(err.code || '');
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailVerified = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await signInWithEmailAndPassword(wordaiAuth, email, pass);
      await res.user.reload();
      const fresh = wordaiAuth.currentUser;
      if (fresh?.emailVerified) {
        setUser(fresh);
        await fetchUserSubscription(fresh);
        return true;
      }
      await firebaseSignOut(wordaiAuth);
      return false;
    } catch (err: any) {
      throw new Error(mapFirebaseAuthError(err.code || ''));
    }
  };

  const resendVerificationEmail = async (email: string, pass: string): Promise<void> => {
    try {
      const res = await signInWithEmailAndPassword(wordaiAuth, email, pass);
      await sendEmailVerification(res.user);
      await firebaseSignOut(wordaiAuth);
    } catch (err: any) {
      throw new Error(mapFirebaseAuthError(err.code || ''));
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    setError(null);
    try {
      await sendPasswordResetEmail(wordaiAuth, email);
    } catch (err: any) {
      throw new Error(mapFirebaseAuthError(err.code || ''));
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseSignOut(wordaiAuth);
      setUser(null);
      setUserSubscription({ points_balance: 100 });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (): Promise<void> => {
    if (!wordaiAuth.currentUser) throw new Error('Chưa đăng nhập');
    await deleteUser(wordaiAuth.currentUser);
    setUser(null);
    setUserSubscription({ points_balance: 100 });
    try {
      localStorage.clear();
    } catch {}
    try {
      sessionStorage.clear();
    } catch {}
  };

  return (
    <WordaiAuthContext.Provider
      value={{
        user,
        userSubscription,
        isInitialized,
        isLoading,
        error,
        signIn,
        signInWithApple,
        signInWithEmail,
        registerWithEmail,
        checkEmailVerified,
        resendVerificationEmail,
        sendPasswordReset,
        signOut,
        deleteAccount,
        getValidToken,
        refreshSubscription: async () => {
          if (user) await fetchUserSubscription(user);
        },
      }}
    >
      {children}
    </WordaiAuthContext.Provider>
  );
}

export function useWordaiAuth() {
  const context = useContext(WordaiAuthContext);
  if (!context) throw new Error('useWordaiAuth must be used within WordaiAuthProvider');
  return context;
}
