'use client';

import React, { useState } from 'react';
import { Bell, LogIn } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { ProfileSidePanel } from './ProfileSidePanel';

export const AppHeader: React.FC = () => {
  const { t } = useApp();
  const { user } = useWordaiAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <header
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
        }}
        className="sticky top-0 z-30 bg-white/97 backdrop-blur-2xl border-b border-slate-200/80 px-4 pb-2.5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">

          {/* ── Left: App Icon + Brand Name ── */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-9 h-9 rounded-2xl overflow-hidden shadow-sm shadow-rose-300/30 border border-rose-200/60 flex-shrink-0">
              <img
                src="/assets/mascot-logo.jpg"
                alt="WynMotion"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-[17px] font-black text-slate-900 tracking-tight leading-none">
                WynMotion
              </h1>
              <p className="text-[11px] font-medium text-slate-400 leading-tight mt-0.5">
                {t('AI Studio', 'AI Studio')}
              </p>
            </div>
          </div>

          {/* ── Right: Notification + Avatar ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Notification Bell */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors active:scale-95"
            >
              <Bell className="h-5 w-5 text-slate-600" />
              {/* Unread dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF2D55] rounded-full border-2 border-white" />
            </button>

            {/* Avatar / Sign-in button */}
            {user ? (
              <button
                type="button"
                id="profile-avatar-btn"
                aria-label="Open profile"
                onClick={() => setIsProfileOpen(true)}
                className="relative p-0.5 rounded-full border-2 border-transparent hover:border-[#FF2D55] transition-all active:scale-95"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF2D55] to-[#FF8FA3] text-white font-black text-sm flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </button>
            ) : (
              <button
                type="button"
                id="sign-in-header-btn"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-2 rounded-full bg-[#FF2D55] hover:bg-[#E11D48] text-white text-sm font-black shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <LogIn className="h-4 w-4" />
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
