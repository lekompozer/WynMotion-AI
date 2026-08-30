'use client';

import React, { useState } from 'react';
import { Bell, LogIn, ChevronRight, User as UserIcon, Mic } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { ProfileSidePanel } from './ProfileSidePanel';

export const AppHeader: React.FC = () => {
  const { isDark, activeTab, isVietnamese, t } = useApp();
  const { user } = useWordaiAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Dynamic Header title, subtitle, and icon per tab
  const getHeaderInfo = () => {
    if (activeTab === 'audio') {
      return {
        title: 'AI Audio Studio',
        subtitle: isVietnamese
          ? 'Tạo giọng đọc & nhạc nền AI trong một studio'
          : 'Create AI voice and AI background music in one studio',
        icon: (
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-violet-600 flex items-center justify-center text-white shadow-sm shrink-0 border border-fuchsia-400/30">
            <Mic className="w-5 h-5 text-white" />
          </div>
        ),
      };
    }

    if (activeTab === 'images') {
      return {
        title: 'AI Images Studio',
        subtitle: isVietnamese
          ? 'Tạo và chỉnh sửa ảnh bằng AI'
          : 'Create and edit images with AI',
        icon: (
          <div className="relative w-9 h-9 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center">
            <img
              src="https://www.wynai.pro/logo%20AI%20Image%20Studio.png"
              alt="AI Images Studio"
              className="w-full h-full object-contain"
            />
          </div>
        ),
      };
    }

    if (activeTab === 'library') {
      return {
        title: 'WynMotion',
        subtitle: t('Thư Viện Đám Mây', 'Cloud Library'),
        icon: (
          <div className="relative w-9 h-9 rounded-2xl overflow-hidden shadow-sm border border-cyan-400/30 flex-shrink-0">
            <img
              src="/assets/mascot-logo.jpg"
              alt="WynMotion"
              className="w-full h-full object-cover"
            />
          </div>
        ),
      };
    }

    // Default: 'video' (Studio)
    return {
      title: 'WynMotion',
      subtitle: t('AI Studio', 'AI Studio'),
      icon: (
        <div className="relative w-9 h-9 rounded-2xl overflow-hidden shadow-sm border border-cyan-400/30 flex-shrink-0">
          <img
            src="/assets/mascot-logo.jpg"
            alt="WynMotion"
            className="w-full h-full object-cover"
          />
        </div>
      ),
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <>
      <header
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
        }}
        className={`sticky top-0 z-30 backdrop-blur-2xl px-4 pb-2.5 transition-colors duration-200 ${
          isDark
            ? 'bg-[#080B10]/95 border-b border-slate-800/80 shadow-[0_1px_15px_rgba(0,0,0,0.5)]'
            : 'bg-white/97 border-b border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)]'
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">

          {/* ── Left: App Icon + Dynamic Brand Name & Subtitle ── */}
          <div className="flex items-center gap-2.5 min-w-0">
            {headerInfo.icon}
            <div className="min-w-0">
              <h1 className={`text-[17px] font-black tracking-tight leading-none truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {headerInfo.title}
              </h1>
              <p className={`text-[11px] font-medium leading-tight mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {headerInfo.subtitle}
              </p>
            </div>
          </div>

          {/* ── Right: Notification + Avatar with Chevron ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Notification Bell */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => alert(t('Bạn chưa có thông báo mới', 'No new notifications'))}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-95 ${
                isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Bell className="h-5 w-5" />
              {/* Unread dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full border-2 border-slate-900" />
            </button>

            {/* Avatar / Sign-in button with chevron arrow */}
            {user ? (
              <button
                type="button"
                id="profile-avatar-btn"
                aria-label="Open profile"
                onClick={() => setIsProfileOpen(true)}
                className={`flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-full border transition-all active:scale-95 shadow-sm ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-750 text-white hover:border-cyan-400/50'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border border-white/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                  )}
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            ) : (
              <button
                type="button"
                id="sign-in-header-btn"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <LogIn className="h-4 w-4 stroke-[2.5]" />
                <span>{t('Đăng Nhập', 'Sign In')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Profile Slide Panel */}
      <ProfileSidePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};
