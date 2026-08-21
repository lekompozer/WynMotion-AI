'use client';

import React from 'react';
import { Bell, Crown, Sparkles, User as UserIcon, ChevronRight } from 'lucide-react';

interface HeroBackgroundProps {
  children?: React.ReactNode;
  variant?: 'gemini-mesh' | 'blue-gradient' | 'dark-video';
  videoSrc?: string;
  className?: string;
  onOpenUpgrade?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  userAvatarUrl?: string;
  userDisplayName?: string;
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({
  children,
  variant = 'gemini-mesh',
  videoSrc,
  className = '',
  onOpenUpgrade,
  onOpenNotifications,
  onOpenProfile,
  userAvatarUrl,
  userDisplayName,
}) => {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* 1. Gemini Flowing Mesh Gradient Background (Full Bleed over Notch) */}
      {videoSrc ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
            src={videoSrc}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-[#070B14]">
          {/* Multi-color mesh gradient: Gemini Cyan & Magenta/Purple */}
          <div
            className="absolute inset-0 opacity-90 transition-opacity duration-1000"
            style={{
              background: `
                radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.45) 0%, transparent 50%),
                radial-gradient(circle at 15% 20%, rgba(6, 182, 212, 0.55) 0%, transparent 55%),
                radial-gradient(circle at 50% 60%, rgba(99, 102, 241, 0.4) 0%, transparent 65%),
                linear-gradient(180deg, #0A1128 0%, #101B3B 40%, #0D162F 75%, transparent 100%)
              `,
            }}
          />

          {/* Animated Gemini energy spheres */}
          <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-cyan-400/30 blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute top-4 -right-16 w-80 h-80 rounded-full bg-fuchsia-500/25 blur-3xl animate-pulse delay-1000 pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        </div>
      )}

      {/* 2. Top Bar & Header Content with Safe Area Padding */}
      <div className="relative z-10 w-full pt-[max(env(safe-area-inset-top),3.25rem)] pb-10 px-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Left: Upgrade Pill with Crisp White Background */}
          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-slate-950 font-black text-xs shadow-lg shadow-black/10 active:scale-95 transition-all border border-white/80"
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
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all backdrop-blur-md border border-white/20 text-white flex items-center justify-center relative shadow-sm"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
            </button>

            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all backdrop-blur-md border border-white/20 text-white shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 border border-white/60 flex items-center justify-center overflow-hidden flex-shrink-0">
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt={userDisplayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                )}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-200" />
            </button>
          </div>
        </div>

        {/* Hero Children */}
        {children}
      </div>
    </div>
  );
};
