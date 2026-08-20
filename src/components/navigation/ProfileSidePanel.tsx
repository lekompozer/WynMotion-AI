'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Zap,
  Sun,
  Moon,
  Globe,
  LogOut,
  Trash2,
  Crown,
  ChevronRight,
  Shield,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { LoginModal } from '@/components/auth/LoginModal';

interface ProfileSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSidePanel: React.FC<ProfileSidePanelProps> = ({ isOpen, onClose }) => {
  const { isVietnamese, toggleLanguage, t } = useApp();
  const { user, userSubscription, signOut, deleteAccount } = useWordaiAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const points = userSubscription?.points_balance ?? 0;
  const tier = userSubscription?.tier ?? 'free';
  const isPremium = tier !== 'free';

  // Dark mode toggle — persisted
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wynmotion_theme');
      if (saved === 'dark') {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      }
    } catch {}
  }, []);

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('wynmotion_theme', next ? 'dark' : 'light');
        if (next) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } catch {}
      return next;
    });
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      onClose();
    } catch (err: any) {
      alert(err?.message || t('Xóa tài khoản thất bại', 'Account deletion failed'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (typeof window === 'undefined') return null;

  const panel = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9000] transition-all duration-300 ${
          isOpen ? 'bg-black/40 backdrop-blur-sm' : 'pointer-events-none bg-transparent'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Slide Panel */}
      <div
        ref={panelRef}
        style={{ willChange: 'transform', paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
        className={`fixed top-0 right-0 bottom-0 z-[9001] w-[88vw] max-w-[340px] flex flex-col bg-white shadow-2xl
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl overflow-hidden border border-rose-200/80 shadow-sm shadow-rose-200">
              <img src="/assets/mascot-logo.jpg" alt="WynMotion" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">WynMotion AI</h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {t('Tài khoản & Cài đặt', 'Account & Settings')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-5 space-y-4">

            {/* ── User Card ── */}
            {user ? (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="w-12 h-12 rounded-full border-2 border-rose-200 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF2D55] to-[#FF8FA3] text-white font-black text-lg flex items-center justify-center flex-shrink-0 border-2 border-rose-200">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-base font-black text-slate-900 truncate">
                        {user.displayName || t('Người dùng', 'User')}
                      </p>
                      {isPremium && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900">
                          <Crown className="w-2.5 h-2.5" />
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Points badge */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200/80">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-50">
                      <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">{t('Điểm AI còn lại', 'AI Points')}</p>
                      <p className="text-lg font-black text-amber-700 leading-tight">{points.toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isPremium
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isPremium ? 'PRO' : t('Miễn phí', 'Free')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{t('Chưa đăng nhập', 'Not signed in')}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t('Đăng nhập để dùng AI đầy đủ', 'Sign in to use full AI features')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowLoginModal(true); onClose(); }}
                  className="px-5 py-2.5 rounded-full bg-[#FF2D55] text-white text-sm font-black flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-rose-200"
                >
                  <LogIn className="h-4 w-4" />
                  {t('Đăng Nhập', 'Sign In')}
                </button>
              </div>
            )}

            {/* ── Upgrade Banner ── */}
            {!isPremium && (
              <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#FF2D55] to-[#FF5E85]">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                <div className="absolute -bottom-2 -left-2 w-14 h-14 bg-white/10 rounded-full" />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Crown className="h-4 w-4 text-yellow-300" />
                      <span className="text-xs font-black text-yellow-300 uppercase tracking-wide">WynMotion Pro</span>
                    </div>
                    <p className="text-white font-black text-sm leading-snug">
                      {t('Mở khóa toàn bộ AI & tính năng nâng cao', 'Unlock full AI & premium features')}
                    </p>
                    <p className="text-white/70 text-xs mt-1">
                      {t('Video HD · Giọng 48kHz · Hình 8K', 'HD Video · 48kHz Voice · 8K Images')}
                    </p>
                  </div>
                  <Sparkles className="h-8 w-8 text-white/30 shrink-0 mt-1" />
                </div>
                <button
                  type="button"
                  className="mt-3 w-full py-2.5 rounded-xl bg-white text-[#FF2D55] text-sm font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                >
                  <Crown className="h-4 w-4 text-amber-500" />
                  {t('Nâng Cấp Ngay', 'Upgrade Now')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* ── Settings ── */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t('Cài đặt giao diện', 'Display Settings')}
              </p>

              {/* Appearance row */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="h-4.5 w-4.5 text-slate-600" />
                  ) : (
                    <Sun className="h-4.5 w-4.5 text-amber-500" />
                  )}
                  <span className="text-sm font-semibold text-slate-800">
                    {isDark ? t('Giao diện Tối', 'Dark Mode') : t('Giao diện Sáng', 'Light Mode')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleDark}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isDark ? 'bg-[#FF2D55]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      isDark ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Language row */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Globe className="h-4.5 w-4.5 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-800">
                    {t('Ngôn ngữ', 'Language')}
                  </span>
                </div>
                <div className="flex rounded-full border border-slate-200 overflow-hidden text-xs font-black">
                  <button
                    type="button"
                    onClick={() => !isVietnamese && toggleLanguage()}
                    className={`px-3 py-1.5 transition-all ${isVietnamese ? 'bg-[#FF2D55] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    🇻🇳 VI
                  </button>
                  <button
                    type="button"
                    onClick={() => isVietnamese && toggleLanguage()}
                    className={`px-3 py-1.5 transition-all ${!isVietnamese ? 'bg-[#FF2D55] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    🇺🇸 EN
                  </button>
                </div>
              </div>
            </div>

            {/* ── Account Actions ── */}
            {user && (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <p className="px-4 pt-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('Tài khoản', 'Account')}
                </p>
                <button
                  type="button"
                  onClick={async () => { await signOut(); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 active:bg-slate-100"
                >
                  <LogOut className="h-4.5 w-4.5 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">
                    {t('Đăng Xuất', 'Sign Out')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-red-50 transition-colors active:bg-red-100"
                >
                  <Trash2 className="h-4.5 w-4.5 text-red-400" />
                  <span className="text-sm font-semibold text-red-500">
                    {t('Xóa Tài Khoản', 'Delete Account')}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete Account Modal (Apple 5.1.1) ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">
                {t('Xóa tài khoản', 'Delete Account')}
              </h2>
              <button type="button" onClick={() => setShowDeleteModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50">
                <p className="text-sm font-bold text-red-700 mb-1">
                  ⚠️ {t('Hành động không thể hoàn tác!', 'This cannot be undone!')}
                </p>
                <p className="text-xs text-red-600 leading-relaxed">
                  {t(
                    'Toàn bộ dữ liệu, điểm AI và lịch sử tạo nội dung sẽ bị xóa vĩnh viễn.',
                    'All your data, AI points, and content history will be permanently deleted.',
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">
                  {t('Nhập email để xác nhận:', 'Enter your email to confirm:')}
                </p>
                <input
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder={user?.email ?? ''}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                />
              </div>
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteEmail(''); }}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold"
              >
                {t('Hủy', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteEmail !== user?.email}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-black disabled:opacity-50 transition-all active:scale-95"
              >
                {isDeleting ? t('Đang xóa...', 'Deleting...') : t('Xóa vĩnh viễn', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(panel, document.body);
};
