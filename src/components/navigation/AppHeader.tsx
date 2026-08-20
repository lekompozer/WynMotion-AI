'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, Zap, User as UserIcon, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { LoginModal } from '@/components/auth/LoginModal';

export const AppHeader: React.FC = () => {
  const { isVietnamese, toggleLanguage, t } = useApp();
  const { user, userSubscription, signOut } = useWordaiAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const points = userSubscription?.points_balance ?? 100;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo & Mascot */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-2xl overflow-hidden shadow-md shadow-rose-500/20 border border-rose-200 bg-gradient-to-tr from-[#FF2D55] to-[#FF5E85] flex items-center justify-center">
              <img
                src="/assets/mascot-logo.jpg"
                alt="WynMotion Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-slate-900 tracking-tight">WynMotion</h1>
                <span className="px-1.5 py-0.2 rounded-md bg-[#FFF1F2] text-[#FF2D55] text-[9px] font-black uppercase border border-rose-200">
                  AI iOS
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500">
                {t('Studio Hoạt Họa & Voiceover', 'Animation & Voiceover Studio')}
              </p>
            </div>
          </div>

          {/* Top Right: Credits, User Avatar / Login, Lang switcher */}
          <div className="flex items-center gap-2">
            {/* Credit balance badge */}
            <div className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black flex items-center gap-1 shadow-xs">
              <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>{points} {t('Điểm', 'Pts')}</span>
            </div>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black transition-all flex items-center gap-1 border border-slate-200 active:scale-95"
            >
              <span>{isVietnamese ? '🇻🇳 VI' : '🇺🇸 EN'}</span>
            </button>

            {/* Auth Button or User Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1 p-0.5 rounded-full border border-slate-200 hover:border-[#FF2D55] transition-all"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#FF2D55] text-white font-black text-xs flex items-center justify-center">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {user.displayName || t('Người dùng', 'User')}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>{t('Đăng Xuất', 'Sign Out')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-1 rounded-full bg-[#FF2D55] hover:bg-[#E11D48] text-white text-[11px] font-black shadow-xs flex items-center gap-1 active:scale-95 transition-all"
              >
                <LogIn className="h-3 w-3" />
                <span>{t('Đăng Nhập', 'Sign In')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};
