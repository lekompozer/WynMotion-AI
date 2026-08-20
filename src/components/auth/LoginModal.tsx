'use client';

/**
 * LoginModal — Full-screen login/register overlay for WynMotion AI Studio (iOS & Web).
 * Replicated with 100% design and feature parity from Listen & Learn iOS / Web.
 *
 * Features:
 *  - Memoized LoginBackdrop with safe-area insets & video background on desktop
 *  - Native iOS & Web Google OAuth + Apple Sign In
 *  - Email & Password with automatic verification flow (checkEmailVerified, resend)
 *  - Forgot password screen with recovery email
 *  - Capacitor keyboard listener for iOS smooth input scrolling
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  X,
  Mail,
  Lock,
  User as UserIcon,
  MailCheck,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { useApp } from '@/contexts/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  forceLogin?: boolean;
}

const isCapacitorNative = () => {
  if (typeof window === 'undefined') return false;
  const cap = (window as any).Capacitor;
  const byApi = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const byPlatform = !!(cap && typeof cap.getPlatform === 'function' && cap.getPlatform() !== 'web');
  const byProtocol = typeof window.location !== 'undefined' && window.location.protocol === 'capacitor:';
  return byApi || byPlatform || byProtocol;
};

// ── Module-level backdrop — stable reference so React never remounts on keystroke
interface LoginBackdropProps {
  onClose: () => void;
  videoRef: (el: HTMLVideoElement | null) => void;
  tagline: string;
  isMobile: boolean;
  showClose?: boolean;
  keyboardHeight?: number;
  children: React.ReactNode;
}

const LoginBackdrop = memo(function LoginBackdrop({
  onClose,
  videoRef,
  tagline,
  isMobile,
  showClose = true,
  keyboardHeight = 0,
  children,
}: LoginBackdropProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {isMobile ? (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-white to-slate-100" />
      ) : (
        <div className="absolute inset-0 bg-black overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            src="https://static.wordai.pro/login/video-login1.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
        </div>
      )}

      {showClose && (
        <button
          onClick={onClose}
          type="button"
          style={{ top: 'calc(26px + env(safe-area-inset-top, 0px))' }}
          className="absolute right-4 z-50 p-2 rounded-full bg-black/30 text-white/70 hover:text-white hover:bg-black/50 transition-colors backdrop-blur-sm active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div
        className={
          isMobile
            ? 'relative z-10 w-full h-[100dvh] flex flex-col bg-white overflow-hidden'
            : 'relative z-10 w-full max-w-[1100px] mx-4 min-h-[560px] md:min-h-[620px] bg-transparent rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col md:flex-row overflow-hidden border border-white/10'
        }
      >
        {/* Left branding (Desktop / Tablet) */}
        <div className="hidden md:flex md:w-1/2 relative flex-col p-12 bg-transparent">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          <div className="relative z-10 text-white h-full flex flex-col">
            <div className="mb-auto">
              <img
                src="/assets/mascot-logo.jpg"
                alt="WynMotion AI"
                className="w-[50px] h-[50px] mb-3 rounded-2xl border border-white/20 shadow-lg object-cover"
              />
              <span className="font-black tracking-widest text-xl uppercase">WynMotion AI</span>
            </div>
            <div className="mt-auto">
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-sm">WynAI</h2>
              <p className="text-xl font-medium mb-6 text-white/90 drop-shadow-sm">{tagline}</p>
              <div className="w-12 h-[3px] bg-white rounded-full mb-6 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80 leading-relaxed">
                Animation · Audio · Art
                <br />— powered by AI.
              </p>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div
          className={
            isMobile
              ? `w-full flex-1 bg-white p-6 flex flex-col ${
                  keyboardHeight > 0 ? 'justify-start pt-6' : 'justify-center'
                } relative overflow-y-auto`
              : 'w-full md:w-1/2 bg-white/[0.85] backdrop-blur-2xl p-8 md:p-12 lg:p-16 flex flex-col justify-center relative shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.12)] border-l border-white/20'
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
});

type AuthTab = 'login' | 'register';
type Screen = 'form' | 'verifying' | 'forgot';

export function LoginModal({ isOpen, onClose, forceLogin = false }: LoginModalProps) {
  const {
    signIn,
    signInWithApple,
    signInWithEmail,
    registerWithEmail,
    checkEmailVerified,
    resendVerificationEmail,
    sendPasswordReset,
    user,
  } = useWordaiAuth();
  const { isVietnamese, t } = useApp();

  const [screen, setScreen] = useState<Screen>('form');
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const forgotEmailRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [resetSent, setResetSent] = useState(false);

  // Setup Capacitor keyboard listener for iOS
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cleanup = () => {};
    const setup = async () => {
      if (isCapacitorNative()) {
        try {
          const { Keyboard } = await import('@capacitor/keyboard');
          const showHandler = await Keyboard.addListener('keyboardWillShow', (info) => {
            setKeyboardHeight(info.keyboardHeight);
            setTimeout(() => {
              const activeEl = document.activeElement;
              if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 200);
          });
          const hideHandler = await Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardHeight(0);
          });
          cleanup = () => {
            showHandler.remove();
            hideHandler.remove();
          };
        } catch (e) {
          console.error('Failed to setup keyboard listeners:', e);
        }
      }
    };
    setup();
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () =>
      setIsMobileLayout(window.innerWidth < 768 && (isCapacitorNative() || forceLogin));
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [forceLogin]);

  useEffect(() => {
    if (isOpen) {
      setScreen('form');
      setTab('login');
      setEmail('');
      setPassword('');
      setDisplayName('');
      setVerifySuccess(false);
      setResetSent(false);
      setGoogleLoading(false);
      setAppleLoading(false);
      setTimeout(() => emailRef.current?.focus(), 150);
      if (!isMobileLayout) {
        setTimeout(() => {
          videoRef.current?.play().catch(() => {});
        }, 100);
      }
    }
  }, [isOpen, isMobileLayout]);

  const setVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
      if (el && !isMobileLayout) el.play().catch(() => {});
    },
    [isMobileLayout],
  );

  useEffect(() => {
    if (user && isOpen && !isSubmitting && screen === 'form') {
      onClose();
    }
  }, [user, isOpen, onClose, isSubmitting, screen]);

  useEffect(() => {
    if (!googleLoading) {
      setLoadingSeconds(0);
      return;
    }
    const iv = setInterval(() => setLoadingSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [googleLoading]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const iv = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(iv);
  }, [resendCooldown]);

  const googleLoadingText = (() => {
    if (!googleLoading) return '';
    if (loadingSeconds < 5) return t('Đang mở đăng nhập Google...', 'Opening Google sign-in...');
    if (loadingSeconds < 30) return t('Đang chờ xác thực Google...', 'Waiting for Google authentication...');
    if (loadingSeconds < 60) return t('Vui lòng hoàn tất đăng nhập rồi quay lại', 'Please complete sign-in and return');
    return t('Không nhận được phản hồi. Nhấn thử lại.', 'No response. Click to retry.');
  })();

  const handleGoogle = async () => {
    if (googleLoading) return;
    setError('');
    setGoogleLoading(true);
    try {
      const success = await signIn();
      if (success) {
        onClose();
      }
    } catch {
      // Handled internally
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleApple = async () => {
    setError('');
    setAppleLoading(true);
    try {
      await signInWithApple();
      onClose();
    } catch {
      // Handled internally
    } finally {
      setAppleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError(t('Vui lòng nhập email.', 'Please enter your email.'));
      return;
    }
    if (!password) {
      setError(t('Vui lòng nhập mật khẩu.', 'Please enter your password.'));
      return;
    }
    if (password.length < 6) {
      setError(t('Mật khẩu tối thiểu 6 ký tự.', 'Password must be at least 6 characters.'));
      return;
    }
    if (tab === 'register' && displayName.trim().length < 2) {
      setError(t('Tên hiển thị tối thiểu 2 ký tự.', 'Display name must be at least 2 characters.'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'login') {
        await signInWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password, displayName.trim());
        setError('');
        setScreen('verifying');
      }
    } catch (err: any) {
      setError(err.message || t('Đã có lỗi xảy ra.', 'An error occurred.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckVerified = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const verified = await checkEmailVerified(email.trim(), password);
      if (verified) {
        setVerifySuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(
          t(
            'Email chưa được xác nhận. Kiểm tra hộp thư và bấm link trong email.',
            'Email not yet verified. Check your inbox and click the verification link.',
          ),
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setIsSubmitting(true);
    try {
      await resendVerificationEmail(email.trim(), password);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError(t('Vui lòng nhập email.', 'Please enter your email.'));
      return;
    }
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || t('Đã có lỗi xảy ra.', 'An error occurred.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setScreen('forgot');
    setError('');
    setResetSent(false);
    setTimeout(() => forgotEmailRef.current?.focus(), 250);
  };

  if (!isOpen) return null;

  if (googleLoading && isCapacitorNative() && !forceLogin) return null;

  const tagline = t(
    'Sáng tạo video hoạt họa & giọng đọc AI đỉnh cao',
    'AI Animation Studio & 48kHz Voiceovers',
  );

  // ─── Screen: Verifying email ────────────────────────────────────────────────
  if (screen === 'verifying') {
    return createPortal(
      <LoginBackdrop
        onClose={onClose}
        videoRef={setVideoRef}
        tagline={tagline}
        isMobile={isMobileLayout}
        showClose={!forceLogin}
        keyboardHeight={keyboardHeight}
      >
        <div
          className="w-full max-w-sm mx-auto text-center"
          style={{
            paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px',
            transition: 'padding-bottom 0.15s ease',
          }}
        >
          <div className="md:hidden mb-6">
            <img
              src="/assets/mascot-logo.jpg"
              alt="WynMotion AI"
              className="w-[50px] h-[50px] mb-3 rounded-2xl mx-auto border border-rose-200 shadow-md object-cover"
            />
            <span className="font-black text-xl tracking-widest uppercase text-slate-900">
              WynMotion AI
            </span>
          </div>

          {verifySuccess ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
              <p className="text-lg font-bold text-gray-900">
                {t('Xác nhận thành công!', 'Email verified!')}
              </p>
              <p className="text-sm text-gray-500">{t('Đang mở app...', 'Opening app...')}</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-100 flex items-center justify-center">
                  <MailCheck className="w-8 h-8 text-[#FF2D55]" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                {t('Xác nhận email', 'Verify your email')}
              </h2>
              <p className="text-gray-500 text-sm mb-2">
                {t('Chúng tôi đã gửi email xác nhận đến:', 'We sent a verification email to:')}
              </p>
              <p className="font-semibold text-slate-800 text-sm mb-5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 break-all">
                {email}
              </p>
              <p className="text-gray-400 text-xs mb-5 leading-relaxed">
                {t(
                  'Kiểm tra hộp thư (kể cả Spam) và bấm link xác nhận. Link có hiệu lực 24 giờ.',
                  'Check your inbox (including Spam) and click the verification link. Valid for 24 hours.',
                )}
              </p>

              {error && (
                <p className="text-red-500 text-xs font-medium mb-3 text-left px-1">{error}</p>
              )}

              <button
                onClick={handleCheckVerified}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mb-3 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('Đang kiểm tra...', 'Checking...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('Tôi đã xác nhận email', "I've verified my email")}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResend}
                disabled={isSubmitting || resendCooldown > 0}
                className="w-full py-3 bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {resendCooldown > 0
                  ? t(`Gửi lại sau ${resendCooldown}s`, `Resend in ${resendCooldown}s`)
                  : t('Gửi lại email xác nhận', 'Resend verification email')}
              </button>

              <button
                onClick={() => {
                  setScreen('form');
                  setError('');
                }}
                className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {t('← Quay lại đăng nhập', '← Back to login')}
              </button>
            </>
          )}
        </div>
      </LoginBackdrop>,
      document.body,
    );
  }

  // ─── Screen: Forgot password ────────────────────────────────────────────────
  if (screen === 'forgot') {
    return createPortal(
      <LoginBackdrop
        onClose={onClose}
        videoRef={setVideoRef}
        tagline={tagline}
        isMobile={isMobileLayout}
        showClose={!forceLogin}
        keyboardHeight={keyboardHeight}
      >
        <div
          className="w-full max-w-sm mx-auto text-center"
          style={{
            paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px',
            transition: 'padding-bottom 0.15s ease',
          }}
        >
          <div className="md:hidden mb-6">
            <img
              src="/assets/mascot-logo.jpg"
              alt="WynMotion AI"
              className="w-[50px] h-[50px] mb-3 rounded-2xl mx-auto border border-rose-200 shadow-md object-cover"
            />
            <span className="font-black text-xl tracking-widest uppercase text-slate-900">
              WynMotion AI
            </span>
          </div>

          {resetSent ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
              <p className="text-lg font-bold text-gray-900">{t('Đã gửi email!', 'Email sent!')}</p>
              <p className="text-sm text-gray-500 leading-relaxed px-4">
                {t(
                  'Hãy kiểm tra hộp thư của bạn (và cả mục thư rác) để đặt lại mật khẩu.',
                  'Please check your inbox (including Spam folder) to reset your password.',
                )}
              </p>
              <button
                onClick={() => {
                  setScreen('form');
                  setResetSent(false);
                }}
                className="mt-4 py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-95"
              >
                {t('Quay lại đăng nhập', 'Back to login')}
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordResetSubmit}>
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-100 flex items-center justify-center">
                  <MailCheck className="w-8 h-8 text-[#FF2D55]" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                {t('Quên mật khẩu', 'Forgot Password')}
              </h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {t(
                  'Nhập email của bạn để nhận liên kết đặt lại mật khẩu mới.',
                  'Enter your email address to receive a link to reset your password.',
                )}
              </p>

              <div className="relative mb-4 text-left">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  ref={forgotEmailRef}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-medium mb-3 text-left px-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mb-3 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('Đang gửi...', 'Sending...')}</span>
                  </>
                ) : (
                  <span>{t('Gửi yêu cầu', 'Send reset link')}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setScreen('form');
                  setError('');
                }}
                className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {t('← Quay lại đăng nhập', '← Back to login')}
              </button>
            </form>
          )}
        </div>
      </LoginBackdrop>,
      document.body,
    );
  }

  // ─── Screen: Login / Register form ─────────────────────────────────────────
  return createPortal(
    <LoginBackdrop
      onClose={onClose}
      videoRef={setVideoRef}
      tagline={tagline}
      isMobile={isMobileLayout}
      showClose={!forceLogin}
      keyboardHeight={keyboardHeight}
    >
      <div
        className="w-full max-w-sm mx-auto"
        style={{
          paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px',
          transition: 'padding-bottom 0.15s ease',
        }}
      >
        <div className="md:hidden mb-8 text-center">
          <img
            src="/assets/mascot-logo.jpg"
            alt="WynMotion AI"
            className="w-[50px] h-[50px] mb-3 rounded-2xl mx-auto border border-rose-200 shadow-md object-cover"
          />
          <span className="font-black text-2xl tracking-widest uppercase text-slate-900">
            WynMotion AI
          </span>
        </div>

        <div className="text-center mb-7">
          <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
            {tab === 'login' ? t('Đăng Nhập', 'Welcome back') : t('Tạo Tài Khoản', 'Create Account')}
          </h2>
          <p className="text-gray-500 text-sm">
            {tab === 'login'
              ? t('Đăng nhập để tiếp tục sáng tạo', 'Sign in to continue creating')
              : t('Đăng ký tài khoản mới miễn phí', 'Register a new free account')}
          </p>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || isSubmitting}
          style={{ background: 'linear-gradient(to right, #1e293b, #0f172a)' }}
          className="w-full py-3.5 px-5 text-white font-semibold rounded-2xl shadow-[0_8px_16px_-8px_rgba(15,23,42,0.5)] hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-800 active:scale-95"
        >
          {googleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('Đang mở đăng nhập Google...', 'Opening Google sign-in...')}</span>
            </>
          ) : (
            <>
              <div className="bg-white p-0.5 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <span>{t('Đăng nhập với Google', 'Continue with Google')}</span>
            </>
          )}
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={handleApple}
          disabled={appleLoading || googleLoading || isSubmitting}
          className="mt-3 w-full py-3.5 px-5 bg-black text-white font-semibold rounded-2xl shadow-[0_8px_16px_-8px_rgba(0,0,0,0.5)] hover:bg-black/90 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {appleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('Đang đăng nhập Apple...', 'Signing in with Apple...')}</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 814 1000" className="w-5 h-5 fill-current" aria-hidden="true">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
              </svg>
              <span>{t('Tiếp tục với Apple', 'Continue with Apple')}</span>
            </>
          )}
        </button>

        {googleLoading && googleLoadingText && (
          <p className="text-center text-xs font-medium text-gray-500 mt-2 animate-pulse">
            {googleLoadingText}
          </p>
        )}

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">
            {t('hoặc', 'or')}
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          {(['login', 'register'] as AuthTab[]).map((t2) => (
            <button
              key={t2}
              type="button"
              onClick={() => {
                setTab(t2);
                setError('');
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === t2 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t2 === 'login' ? t('Đăng Nhập', 'Login') : t('Đăng Ký', 'Register')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'register' && (
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t('Tên hiển thị (vd: Nguyễn Văn A)', 'Display name (e.g. John Doe)')}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              ref={emailRef}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('Mật khẩu (tối thiểu 6 ký tự)', 'Password (min. 6 characters)')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-red-500 text-xs font-medium px-1">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || googleLoading || appleLoading}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_6px_14px_-6px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {tab === 'login'
                    ? t('Đang đăng nhập...', 'Signing in...')
                    : t('Đang tạo tài khoản...', 'Creating account...')}
                </span>
              </>
            ) : (
              <span>{tab === 'login' ? t('Đăng Nhập', 'Sign In') : t('Tạo Tài Khoản', 'Create Account')}</span>
            )}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center">
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors underline"
          >
            {t('Quên mật khẩu?', 'Forgot password?')}
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-gray-400">
          {t(
            'Tài khoản Email/Password độc lập với Google. Mật khẩu do bạn tự đặt.',
            'Email/Password account is separate from Google. You set your own password.',
          )}
        </p>
      </div>
    </LoginBackdrop>,
    document.body,
  );
}
