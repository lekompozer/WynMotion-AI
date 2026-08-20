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
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  getValidToken: () => Promise<string>;
  refreshSubscription: () => Promise<void>;
}

const WordaiAuthContext = createContext<WordaiAuthContextType | undefined>(undefined);

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
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(wordaiAuth, wordaiGoogleProvider);
          return true;
        } catch (rErr: any) {
          setError(rErr.message);
        }
      } else {
        setError(err.message);
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
      setError(err.message);
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
      setError(err.message);
      throw err;
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
        await updateProfile(res.user, { displayName: name });
      }
      if (res.user) {
        await sendEmailVerification(res.user);
        setUser(res.user);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setError(null);
    await sendPasswordResetEmail(wordaiAuth, email);
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
    if (!wordaiAuth.currentUser) throw new Error('Chua dang nhap');
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
        forgotPassword,
        sendPasswordReset: forgotPassword,
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

