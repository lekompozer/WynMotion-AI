'use client';

import React from 'react';
import { Bell, Crown, Sparkles, User as UserIcon, ChevronRight } from 'lucide-react';

interface HeroBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  onOpenUpgrade?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  userAvatarUrl?: string;
  userDisplayName?: string;
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({
  children,
  className = '',
  onOpenUpgrade,
  onOpenNotifications,
  onOpenProfile,
  userAvatarUrl,
  userDisplayName,
}) => {
  return (
    <div className={`relative w-full overflow-hidden min-h-[310px] ${className}`}>
      {/* 1. Fresh, Fast-Paced Gemini Mesh Background (Sky-Blue + Coral-Pink) */}
      <div className="absolute inset-0 z-0 bg-[#060913]">
        {/* Animated glowing mesh gradient */}
        <div
          className="absolute inset-0 opacity-95 animate-pulse"
          style={{
            animationDuration: '3s',
            background: `
              radial-gradient(circle at 80% 20%, rgba(255, 45, 85, 0.65) 0%, transparent 55%),
              radial-gradient(circle at 15% 30%, rgba(56, 189, 248, 0.75) 0%, transparent 60%),
              radial-gradient(circle at 50% 70%, rgba(168, 85, 247, 0.5) 0%, transparent 65%),
              linear-gradient(180deg, #070D1E 0%, #0F172A 50%, #080B10 100%)
            `,
          }}
        />

        {/* Dynamic bright energy spots */}
        <div
          className="absolute -top-10 -left-10 w-80 h-80 rounded-full bg-sky-400/40 blur-2xl animate-pulse pointer-events-none"
          style={{ animationDuration: '2.2s' }}
        />
        <div
          className="absolute top-2 -right-10 w-80 h-80 rounded-full bg-[#FF2D55]/40 blur-2xl animate-pulse pointer-events-none"
          style={{ animationDuration: '2.6s', animationDelay: '0.5s' }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-cyan-300/25 blur-3xl animate-pulse pointer-events-none"
          style={{ animationDuration: '3s' }}
        />
      </div>

      {/* 2. Top Bar (Pushed up to 10px below notch edge) */}
      <div className="relative z-10 w-full pt-[calc(env(safe-area-inset-top,44px)+10px)] pb-14 px-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Left: Upgrade Pill with Bright Crisp White Background */}
          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-950 font-bold text-xs shadow-lg shadow-black/20 active:scale-95 transition-all border border-white/90"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
            <span className="truncate">
              Start Premium for only 129,000 đ
            </span>
          </button>

          {/* Right: Notifications & Profile Avatar with Chevron */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onOpenNotifications}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all backdrop-blur-md border border-white/25 text-white flex items-center justify-center relative shadow-sm"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF2D55] ring-2 ring-slate-900" />
            </button>

            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all backdrop-blur-md border border-white/25 text-white shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-[#FF2D55] border border-white/70 flex items-center justify-center overflow-hidden flex-shrink-0">
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt={userDisplayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                )}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-sky-200" />
            </button>
          </div>
        </div>

        {/* Hero Children */}
        {children}
      </div>
    </div>
  );
};
