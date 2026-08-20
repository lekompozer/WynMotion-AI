'use client';

/**
 * WynMotion AI Studio — Login & Account Modal
 * Unified Authentication with Google, Apple, and Email/Password
 * Uses WordaiAuthContext (connected with ai.wordai.pro)
 */

import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { useApp } from '@/contexts/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { t } = useApp();
  const {
    signIn,
    signInWithApple,
    signInWithEmail,
    registerWithEmail,
    forgotPassword,
    error: authError,
    isLoading: authLoading,
  } = useWordaiAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    try {
      await signIn();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Lỗi đăng nhập Google');
    }
  };

  const handleAppleSignIn = async () => {
    setLocalError(null);
    try {
      await signInWithApple();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Lỗi đăng nhập Apple');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          throw new Error(t('Vui lòng nhập đầy đủ Email và Mật khẩu', 'Please enter email and password'));
        }
        await signInWithEmail(email.trim(), password);
        onClose();
      } else if (mode === 'register') {
        if (!email.trim() || !password.trim()) {
          throw new Error(t('Vui lòng nhập đầy đủ thông tin', 'Please fill in all fields'));
        }
        if (password.length < 6) {
          throw new Error(t('Mật khẩu tối thiểu 6 ký tự', 'Password must be at least 6 characters'));
        }
        await registerWithEmail(email.trim(), password, displayName.trim());
        setSuccessMessage(t('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.', 'Registered! Check email for verification.'));
        setMode('login');
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          throw new Error(t('Vui lòng nhập email để đặt lại mật khẩu', 'Please enter your email'));
        }
        await forgotPassword(email.trim());
        setSuccessMessage(t('Đã gửi email hướng dẫn đặt lại mật khẩu!', 'Password reset email sent!'));
        setMode('login');
      }
    } catch (err: any) {
      setLocalError(err.message || t('Đã xảy ra lỗi, vui lòng thử lại', 'An error occurred'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header & Mascot */}
        <div className="text-center space-y-1.5">
          <div className="mx-auto w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-rose-500/20 border-2 border-rose-200 bg-gradient-to-tr from-[#FF2D55] to-[#FF5E85] flex items-center justify-center mb-2">
            <img src="/assets/mascot-logo.jpg" alt="WynMotion Mascot" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {mode === 'login' && t('Đăng Nhập WynMotion AI', 'Sign In to WynMotion AI')}
            {mode === 'register' && t('Đăng Ký Tài Khoản Mới', 'Create New Account')}
            {mode === 'forgot' && t('Quên Mật Khẩu', 'Reset Password')}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {t('Đồng bộ dữ liệu & điểm tích lũy hệ sinh thái WynAI / WordAI', 'Synced with WynAI / WordAI ecosystem accounts')}
          </p>
        </div>

        {/* Social Buttons: Google & Apple */}
        {mode !== 'forgot' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading || submitting}
              className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-black text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{t('Tiếp tục với Google', 'Continue with Google')}</span>
            </button>

            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={authLoading || submitting}
              className="w-full py-3 px-4 rounded-2xl bg-black text-white hover:bg-slate-900 font-black text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-98"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.74-.96 2.77 1.01.08 2.07-.52 2.69-1.27z" />
              </svg>
              <span>{t('Tiếp tục với Apple', 'Continue with Apple')}</span>
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t('Hoặc qua Email', 'Or via Email')}</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </div>
        )}

        {/* Error / Success feedback */}
        {(localError || authError) && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 leading-relaxed">
            ⚠️ {localError || authError}
          </div>
        )}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 leading-relaxed flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('Họ & Tên', 'Full Name')}</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('Nhập họ tên...', 'Enter your name...')}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#FF2D55]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#FF2D55]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">{t('Mật khẩu', 'Password')}</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] font-bold text-[#FF2D55] hover:underline"
                  >
                    {t('Quên mật khẩu?', 'Forgot password?')}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#FF2D55]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-[#FF2D55] hover:bg-[#E11D48] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>
                  {mode === 'login' && t('Đăng Nhập', 'Sign In')}
                  {mode === 'register' && t('Tạo Tài Khoản', 'Create Account')}
                  {mode === 'forgot' && t('Gửi Yêu Cầu Đặt Lại', 'Send Reset Link')}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Switch mode links */}
        <div className="text-center pt-2 text-xs font-semibold text-slate-500">
          {mode === 'login' ? (
            <p>
              {t('Chưa có tài khoản?', "Don't have an account?")}{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#FF2D55] font-black hover:underline"
              >
                {t('Đăng ký ngay', 'Sign up now')}
              </button>
            </p>
          ) : (
            <p>
              {t('Đã có tài khoản?', 'Already have an account?')}{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#FF2D55] font-black hover:underline"
              >
                {t('Đăng nhập', 'Sign in')}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
