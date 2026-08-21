'use client';

import React, { useState, useRef } from 'react';
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
  const { isVietnamese, toggleLanguage, isDark, toggleTheme, t } = useApp();
  const { user, userSubscription, signOut, deleteAccount } = useWordaiAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const points = userSubscription?.points_balance ?? 0;
  const tier = userSubscription?.tier ?? 'free';
  const isPremium = tier !== 'free';

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
          isOpen ? 'bg-black/60 backdrop-blur-sm' : 'pointer-events-none bg-transparent'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Slide Panel */}
      <div
        ref={panelRef}
        style={{ willChange: 'transform', paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
        className={`fixed top-0 right-0 bottom-0 z-[9001] w-[88vw] max-w-[340px] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isDark ? 'bg-[#0B0F17] text-slate-100 border-l border-slate-800' : 'bg-white text-slate-900'
        } ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* ── Header ── */}
        <div className={`flex items-center justify-between px-5 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl overflow-hidden border border-cyan-400/30 shadow-sm">
              <img src="/assets/mascot-logo.jpg" alt="WynMotion" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className={`text-base font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>WynMotion AI</h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {t('Tài khoản & Cài đặt', 'Account & Settings')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-5 space-y-4">

            {/* ── User Card ── */}
            {user ? (
              <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="w-12 h-12 rounded-full border-2 border-cyan-400 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black text-lg flex items-center justify-center flex-shrink-0 border-2 border-cyan-300">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className={`text-base font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
                <div className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-slate-950/80 border-amber-500/30' : 'bg-white border-amber-200/80'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isDark ? 'bg-amber-950/60' : 'bg-amber-50'}`}>
                      <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">{t('Điểm AI còn lại', 'AI Points')}</p>
                      <p className="text-lg font-black text-amber-400 leading-tight">{points.toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isPremium
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : isDark
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isPremium ? 'PRO' : t('Miễn phí', 'Free')}
                  </span>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-2xl border text-center space-y-3 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                  <LogIn className="w-6 h-6" />
                </div>
                <div>
                  <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t('Chưa đăng nhập', 'Not signed in')}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t('Đăng nhập để lưu video và nhận 100 điểm AI', 'Sign in to save projects & get 100 AI points')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-sm shadow-md active:scale-95 transition-all"
                >
                  {t('Đăng Nhập Ngay', 'Sign In Now')}
                </button>
              </div>
            )}

            {/* ── Upgrade Banner ── */}
            {!isPremium && (
              <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                <div className="absolute -bottom-2 -left-2 w-14 h-14 bg-white/10 rounded-full" />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Crown className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                      <span className="text-xs font-black text-yellow-300 uppercase tracking-wide">WynMotion Pro</span>
                    </div>
                    <p className="text-white font-black text-sm leading-snug">
                      {t('Mở khóa toàn bộ AI & tính năng nâng cao', 'Unlock full AI & premium features')}
                    </p>
                    <p className="text-white/80 text-xs mt-1">
                      {t('Video 4K · Giọng 48kHz · Không giới hạn', '4K Video · 48kHz Voice · Unlimited')}
                    </p>
                  </div>
                  <Sparkles className="h-8 w-8 text-white/30 shrink-0 mt-1" />
                </div>
                <button
                  type="button"
                  onClick={() => alert(isVietnamese ? 'Gói Pro chỉ 129,000 đ/tháng' : 'Pro plan for only 129,000 VND/month')}
                  className="mt-3 w-full py-2.5 rounded-xl bg-white text-slate-950 text-sm font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                >
                  <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />
                  {t('Nâng Cấp Ngay (129,000 đ)', 'Upgrade Now (129k)')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* ── Settings ── */}
            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t('Cài đặt giao diện', 'Display Settings')}
              </p>

              {/* Appearance row */}
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="h-4.5 w-4.5 text-cyan-400" />
                  ) : (
                    <Sun className="h-4.5 w-4.5 text-amber-500" />
                  )}
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {isDark ? t('Giao diện Tối (Dark)', 'Dark Mode') : t('Giao diện Sáng (Light)', 'Light Mode')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isDark ? 'bg-cyan-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform ${
                      isDark ? 'translate-x-6 bg-slate-950' : 'translate-x-0 bg-white'
                    }`}
                  />
                </button>
              </div>

              {/* Language row */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Globe className="h-4.5 w-4.5 text-slate-400" />
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {t('Ngôn ngữ', 'Language')}
                  </span>
                </div>
                <div className={`flex rounded-full border overflow-hidden text-xs font-black ${isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-100'}`}>
                  <button
                    type="button"
                    onClick={() => !isVietnamese && toggleLanguage()}
                    className={`px-3 py-1.5 transition-all ${isVietnamese ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'}`}
                  >
                    🇻🇳 VI
                  </button>
                  <button
                    type="button"
                    onClick={() => isVietnamese && toggleLanguage()}
                    className={`px-3 py-1.5 transition-all ${!isVietnamese ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'}`}
                  >
                    🇺🇸 EN
                  </button>
                </div>
              </div>
            </div>

            {/* ── Account Actions ── */}
            {user && (
              <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                <p className="px-4 pt-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('Tài khoản', 'Account')}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 border-b text-sm font-semibold transition-colors ${
                    isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-slate-100 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-4.5 w-4.5 text-slate-400" />
                    <span>{t('Đăng xuất', 'Sign Out')}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                {/* Apple Guideline 5.1.1 Delete Account */}
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-rose-500 transition-colors ${
                    isDark ? 'hover:bg-rose-950/20' : 'hover:bg-rose-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-4.5 w-4.5 text-rose-500" />
                    <span>{t('Xóa tài khoản', 'Delete Account')}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-rose-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={`px-5 py-3 border-t text-center ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
          <p className="text-[10px] font-medium">WynMotion AI Studio v1.0.0 (Build 2026)</p>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black">{t('Xác nhận xóa tài khoản', 'Delete Account')}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {t(
                  'Hành động này sẽ xóa vĩnh viễn dữ liệu dự án và điểm AI của bạn.',
                  'This will permanently delete your projects and AI points.'
                )}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {t('Hủy', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                {isDeleting ? '...' : t('Xóa Vĩnh Viễn', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );

  return createPortal(panel, document.body);
};
