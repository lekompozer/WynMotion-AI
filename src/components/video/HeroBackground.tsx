'use client';

import React from 'react';
import { Bell, Crown, Sparkles, User as UserIcon } from 'lucide-react';

interface HeroBackgroundProps {
  children?: React.ReactNode;
  variant?: 'blue-gradient' | 'coral-mesh' | 'dark-video';
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
  variant = 'blue-gradient',
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
      {/* 1. Background Layers */}
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#080B10]" />
        </div>
      ) : variant === 'blue-gradient' ? (
        <div className="absolute inset-0 z-0 bg-[#071329]">
          {/* Top-to-bottom CapCut radiant mesh */}
          <div
            className="absolute inset-0 opacity-100"
            style={{
              background: `
                radial-gradient(circle at 85% 10%, rgba(37, 99, 235, 0.7) 0%, transparent 50%),
                radial-gradient(circle at 20% 25%, rgba(6, 182, 212, 0.6) 0%, transparent 55%),
                radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.4) 0%, transparent 65%),
                linear-gradient(180deg, #0A192F 0%, #0F2D5C 35%, #0B1E3D 70%, #080B10 100%)
              `,
            }}
          />
          {/* Subtle noise/glow accents */}
          <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 -right-16 w-72 h-72 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1E1B4B] via-[#311042] to-[#080B10]" />
      )}

      {/* 2. Top Bar & Foreground Content */}
      <div className="relative z-10 w-full pt-12 pb-6 px-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {/* Left: Upgrade Pill */}
          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 transition-all backdrop-blur-md border border-white/20 text-white shadow-sm"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span className="text-xs font-bold tracking-tight">
              Start Premium for only 129,000 đ
            </span>
          </button>

          {/* Right: Notifications & Profile Avatar */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNotifications}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 transition-all backdrop-blur-md border border-white/20 text-white flex items-center justify-center relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
            </button>

            <button
              onClick={onOpenProfile}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 border border-white/40 flex items-center justify-center overflow-hidden active:scale-95 transition-all shadow-md"
            >
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt={userDisplayName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Hero Children */}
        {children}
      </div>
    </div>
  );
};
