'use client';

import React from 'react';
import { Bell, Crown, User as UserIcon, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

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
  const { isDark } = useApp();

  return (
    <div className={`relative w-full overflow-hidden min-h-[410px] flex flex-col justify-between ${className}`}>
      {/* 1. Fresh, Radiant Sky-Blue with Coral-Pink in Bottom-Right 1/4 */}
      <div className="absolute inset-0 z-0 bg-[#07132B]">
        {/* Dynamic bright glowing mesh */}
        <div
          className="absolute inset-0 opacity-100 animate-pulse"
          style={{
            animationDuration: '3.2s',
            background: `
              radial-gradient(circle at 18% 22%, rgba(56, 189, 248, 0.98) 0%, rgba(14, 165, 233, 0.65) 45%, transparent 70%),
              radial-gradient(circle at 60% 30%, rgba(125, 211, 252, 0.75) 0%, transparent 60%),
              radial-gradient(circle at 90% 85%, rgba(255, 45, 85, 0.75) 0%, rgba(244, 63, 94, 0.4) 40%, transparent 65%),
              linear-gradient(180deg, #0A1E42 0%, #0E2E66 45%, #0B1E3F 75%, transparent 100%)
            `,
          }}
        />

        {/* Ambient bright light spheres */}
        <div
          className="absolute -top-12 -left-12 w-88 h-88 rounded-full bg-sky-300/40 blur-3xl animate-pulse pointer-events-none"
          style={{ animationDuration: '2.5s' }}
        />
        {/* Coral-pink strictly in the bottom-right 1/4 */}
        <div
          className="absolute -bottom-8 -right-8 w-64 h-64 rounded-full bg-[#FF2D55]/35 blur-2xl animate-pulse pointer-events-none"
          style={{ animationDuration: '2.8s', animationDelay: '0.6s' }}
        />
      </div>

      {/* 2. Bottom Fade to White/Canvas Background (CapCut iconic smooth blend) */}
      <div
        className="absolute inset-x-0 bottom-0 h-44 pointer-events-none z-[2]"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, transparent 0%, rgba(8,11,16,0.3) 30%, rgba(8,11,16,0.85) 75%, #080B10 100%)'
            : 'linear-gradient(180deg, transparent 0%, rgba(250,250,252,0.3) 30%, rgba(250,250,252,0.85) 75%, #FAFAFC 100%)'
        }}
      />

      {/* 3. Top Header Content (Pushed up snugly to 10px below notch edge) */}
      <div className="relative z-10 w-full pt-[calc(env(safe-area-inset-top,44px)+10px)] px-4">
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
      </div>

      {/* 4. Bottom Hero Content: Headline lowered down to pb-[172px] */}
      <div className="relative z-10 w-full px-4 pb-[172px] mt-auto">
        {children}
      </div>
    </div>
  );
};
