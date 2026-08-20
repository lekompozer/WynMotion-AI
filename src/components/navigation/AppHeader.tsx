'use client';

import React, { useState } from 'react';
import { Zap, LogOut, LogIn, ChevronDown } from 'lucide-react';
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
      <header
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
        }}
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 px-3.5 pb-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Mascot & Brand */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-sm shadow-rose-500/20 border border-rose-200/80 bg-gradient-to-tr from-[#FF2D55] to-[#FF5E85] flex-shrink-0 flex items-center justify-center">
              <img
                src="/assets/mascot-logo.jpg"
                alt="WynMotion Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h1 className="text-xs font-black text-slate-900 tracking-tight leading-tight">
                  WynMotion
                </h1>
                <span className="px-1 py-0.2 rounded bg-rose-50 text-[#FF2D55] text-[8px] font-black uppercase border border-rose-200/60 leading-none">
                  AI
                </span>
              </div>
              <p className="text-[9px] font-medium text-slate-400 truncate leading-tight">
                {t('Studio Hoạt Họa & Voice', 'Animation & Voice')}
              </p>
            </div>
          </div>

          {/* Right: Credits, Language & Login */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Credits badge */}
            <div className="px-2 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-amber-800 text-[10px] font-black flex items-center gap-1 shadow-2xs">
              <Zap className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />
              <span>{points} <span className="text-[9px] font-bold text-amber-700/80">{t('đ', 'pts')}</span></span>
            </div>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2 py-1 rounded-full bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 text-[10px] font-black transition-all flex items-center gap-0.5 border border-slate-200/80 active:scale-95 shadow-2xs"
            >
              <span>{isVietnamese ? '🇻🇳' : '🇺🇸'}</span>
              <span className="text-[9px] font-bold text-slate-600">{isVietnamese ? 'VI' : 'EN'}</span>
            </button>

            {/* User Avatar / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-0.5 rounded-full border border-slate-200 hover:border-[#FF2D55] transition-all shadow-2xs"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#FF2D55] text-white font-black text-[10px] flex items-center justify-center">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                className="px-2.5 py-1 rounded-full bg-[#FF2D55] hover:bg-[#E11D48] text-white text-[10px] font-black shadow-xs flex items-center gap-1 active:scale-95 transition-all"
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
