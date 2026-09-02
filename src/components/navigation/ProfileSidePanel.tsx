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
  RotateCw,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { DeleteAccountModal } from '@/components/modals/DeleteAccountModal';
import { WynMotionUpgradeModal } from '@/components/modals/WynMotionUpgradeModal';

interface ProfileSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSidePanel: React.FC<ProfileSidePanelProps> = ({ isOpen, onClose }) => {
  const { isVietnamese, toggleLanguage, isDark, toggleTheme, t } = useApp();
  const { user, userSubscription, signOut, deleteAccount, refreshSubscription } = useWordaiAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeDefaultTab, setUpgradeDefaultTab] = useState<'subscriptions' | 'points'>('subscriptions');
  const [isRefreshingPoints, setIsRefreshingPoints] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const rawTier = (userSubscription?.tier || 'free').toLowerCase();
  const isVip = rawTier === 'vip';
  const isPremium = rawTier === 'premium' || rawTier === 'pro';
  const points = userSubscription?.points_balance ?? 0;

  // Refresh points on panel open
  useEffect(() => {
    if (isOpen && user) {
      refreshSubscription();
    }
  }, [isOpen, user]);

  const handleManualRefreshPoints = async () => {
    setIsRefreshingPoints(true);
    try {
      await refreshSubscription();
    } finally {
      setTimeout(() => setIsRefreshingPoints(false), 500);
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleConfirmDelete = async () => {
    await deleteAccount();
    setShowDeleteModal(false);
    onClose();
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
        style={{
          willChange: 'transform',
          paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
        }}
        className={`fixed top-0 right-0 bottom-0 z-[9001] w-[88vw] max-w-[340px] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isDark ? 'bg-[#0B0F17] text-slate-100 border-l border-slate-800' : 'bg-white text-slate-900'
        } ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* ── Header ── */}
        <div
          className={`flex items-center justify-between px-5 pb-4 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl overflow-hidden border border-cyan-400/30 shadow-sm">
              <img src="/assets/mascot-logo.jpg" alt="WynMotion" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className={`text-base font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                WynMotion AI
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {t('Tài khoản & Cài đặt', 'Account & Settings')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-5 space-y-4">
            {/* ── User Card ── */}
            {user ? (
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
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
                      {/* Tier Badge: VIP / Premium / Free */}
                      {isVip ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-xs">
                          <Crown className="w-3 h-3 fill-current" />
                          VIP
                        </span>
                      ) : isPremium ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xs">
                          <Sparkles className="w-3 h-3 fill-current" />
                          Premium
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDark ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          Free
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Points badge matching Web header */}
                <div
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isDark ? 'bg-slate-950/80 border-amber-500/30' : 'bg-white border-amber-200/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isDark ? 'bg-amber-950/60' : 'bg-amber-50'}`}>
                      <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] text-slate-400 font-medium">
                          {t('Điểm AI còn lại', 'AI Points')}
                        </p>
                        <button
                          type="button"
                          onClick={handleManualRefreshPoints}
                          className="text-slate-400 hover:text-white transition-colors"
                          title="Refresh points"
                        >
                          <RotateCw
                            className={`w-3 h-3 ${isRefreshingPoints ? 'animate-spin text-amber-400' : ''}`}
                          />
                        </button>
                      </div>
                      <p className="text-lg font-black text-amber-400 leading-tight">
                        {points.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpgradeModal(true);
                        setUpgradeDefaultTab('points');
                      }}
                      className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 transition-all flex items-center gap-1 active:scale-95"
                    >
                      <span>+</span>
                      <span>{t('Nạp điểm', 'Top up')}</span>
                    </button>

                    {/* Tier status indicator */}
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full ${
                        isVip
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : isPremium
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : isDark
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isVip ? 'VIP' : isPremium ? 'Premium' : 'Free'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`p-4 rounded-2xl border text-center space-y-3 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                  <LogIn className="w-6 h-6" />
                </div>
                <div>
                  <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t('Chưa đăng nhập', 'Not signed in')}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t(
                      'Đăng nhập để lưu dự án và nhận điểm AI miễn phí',
                      'Sign in to save projects & get free AI points'
                    )}
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
            {(!isVip && !isPremium) && (
              <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                <div className="absolute -bottom-2 -left-2 w-14 h-14 bg-white/10 rounded-full" />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Crown className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                      <span className="text-xs font-black text-yellow-300 uppercase tracking-wide">
                        WynMotion VIP / Premium
                      </span>
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
                  onClick={() => {
                    setShowUpgradeModal(true);
                    setUpgradeDefaultTab('subscriptions');
                  }}
                  className="mt-3 w-full py-2.5 rounded-xl bg-white text-slate-950 text-sm font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                >
                  <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />
                  {t('Nâng Cấp VIP / Premium', 'Upgrade VIP / Premium')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* ── Settings ── */}
            <div
              className={`rounded-2xl border overflow-hidden ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t('Cài đặt giao diện', 'Display Settings')}
              </p>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                  isDark ? 'hover:bg-slate-800/60 text-slate-200' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="h-4.5 w-4.5 text-indigo-400" />
                  ) : (
                    <Sun className="h-4.5 w-4.5 text-amber-500" />
                  )}
                  <span>{t('Giao diện', 'Theme')}</span>
                </div>
                <span className="text-xs text-slate-400 font-bold">{isDark ? 'Dark' : 'Light'}</span>
              </button>

              {/* Language Toggle */}
              <button
                type="button"
                onClick={toggleLanguage}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium border-t transition-colors ${
                  isDark
                    ? 'border-slate-800 hover:bg-slate-800/60 text-slate-200'
                    : 'border-slate-100 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-4.5 w-4.5 text-cyan-400" />
                  <span>{t('Ngôn ngữ', 'Language')}</span>
                </div>
                <span className="text-xs text-slate-400 font-bold">{isVietnamese ? 'Tiếng Việt' : 'English'}</span>
              </button>
            </div>

            {/* ── Account Actions ── */}
            {user && (
              <div
                className={`rounded-2xl border overflow-hidden ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <p className="px-4 pt-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('Tài khoản', 'Account')}
                </p>

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                    isDark ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-4.5 w-4.5 text-slate-400" />
                    <span>{t('Đăng xuất', 'Sign Out')}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>

                {/* Delete Account (Apple Guideline 5.1.1) */}
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-rose-500 border-t transition-colors ${
                    isDark ? 'border-slate-800 hover:bg-rose-950/20' : 'border-slate-100 hover:bg-rose-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-4.5 w-4.5 text-rose-500" />
                    <span>{t('Xóa tài khoản vĩnh viễn', 'Delete Account Permanently')}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-rose-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className={`px-5 py-3 border-t text-center ${
            isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'
          }`}
        >
          <p className="text-[10px] font-medium">WynMotion AI Studio v1.0.0 (Build 2026)</p>
        </div>
      </div>

      {/* Delete Account Modal (Apple Guideline 5.1.1) */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        userEmail={user?.email || ''}
        onClose={() => setShowDeleteModal(false)}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* WynMotion Upgrade & Paywall Modal */}
      <WynMotionUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        defaultTab={upgradeDefaultTab}
      />
    </>
  );

  return createPortal(panel, document.body);
};
