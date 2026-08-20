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
} from 'firebase/auth';
import { wordaiAuth, wordaiGoogleProvider } from '@/lib/wordai-firebase';

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
  };
  return messages[code] || `Lỗi đăng nhập (${code})`;
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
          setUser(res.user);
          fetchUserSubscription(res.user);
        }
      })
      .catch((err) => {
        console.warn('Redirect sign-in error:', err);
      });

    const unsubscribe = onAuthStateChanged(wordaiAuth, (currentUser) => {
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

  const signIn = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await signInWithPopup(wordaiAuth, wordaiGoogleProvider);
      setUser(res.user);
      await fetchUserSubscription(res.user);
      return true;
    } catch (err: any) {
      // Fallback to redirect if popup is blocked
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(wordaiAuth, wordaiGoogleProvider);
          return true;
        } catch (rErr: any) {
          setError(mapFirebaseAuthError(rErr.code || ''));
        }
      } else {
        setError(mapFirebaseAuthError(err.code || ''));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const res = await signInWithPopup(wordaiAuth, provider);
      setUser(res.user);
      await fetchUserSubscription(res.user);
    } catch (err: any) {
      setError(mapFirebaseAuthError(err.code || ''));
      throw err;
    } finally {
      setIsLoading(false);
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
        // Sign out immediately so user must verify email before full login
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
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
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
