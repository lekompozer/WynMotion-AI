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
      {/* Dynamic CSS for Liquid Fluid Color Morphing & Drifting (Apple Intelligence / Gemini Style) */}
      <style jsx>{`
        @keyframes liquidFlow1 {
          0% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
          33% {
            transform: translate(45px, 25px) scale(1.18) rotate(45deg);
          }
          66% {
            transform: translate(-30px, 40px) scale(0.92) rotate(90deg);
          }
          100% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
        }

        @keyframes liquidFlow2 {
          0% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
          33% {
            transform: translate(-40px, -25px) scale(1.22) rotate(-60deg);
          }
          66% {
            transform: translate(35px, -30px) scale(0.9) rotate(-120deg);
          }
          100% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
        }

        @keyframes liquidFlow3 {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          40% {
            transform: translate(-45px, -35px) scale(1.25);
          }
          75% {
            transform: translate(30px, -20px) scale(1.05);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes morphWarmColors {
          0% {
            background-color: #FF2D55; /* Neon Coral Pink */
          }
          35% {
            background-color: #FF5E3A; /* Sunset Orange */
          }
          65% {
            background-color: #FFAA00; /* Golden Amber */
          }
          85% {
            background-color: #E02475; /* Vivid Magenta */
          }
          100% {
            background-color: #FF2D55;
          }
        }

        @keyframes morphCoolColors {
          0% {
            background-color: #0EA5E9; /* Sky Blue */
          }
          35% {
            background-color: #38BDF8; /* Electric Cyan */
          }
          65% {
            background-color: #6366F1; /* Royal Indigo */
          }
          85% {
            background-color: #8B5CF6; /* Deep Violet */
          }
          100% {
            background-color: #0EA5E9;
          }
        }

        .liquid-blob-1 {
          animation: liquidFlow1 10s ease-in-out infinite, morphCoolColors 14s ease-in-out infinite;
        }

        .liquid-blob-2 {
          animation: liquidFlow2 12s ease-in-out infinite;
        }

        .liquid-blob-3 {
          animation: liquidFlow3 9s ease-in-out infinite, morphWarmColors 12s ease-in-out infinite;
        }
      `}</style>

      {/* 1. Deep Midnight Base with Fluid Liquid Glowing Blobs (No blinking/pulse, 100% smooth fluid drift) */}
      <div className="absolute inset-0 z-0 bg-[#07132B] overflow-hidden pointer-events-none">
        {/* Ambient base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2552] via-[#081B3D] to-[#061226]" />

        {/* Liquid Blob 1: Cool Azure to Royal Indigo / Violet (Top-Left) */}
        <div
          className="liquid-blob-1 absolute -top-16 -left-16 w-96 h-96 rounded-full blur-[80px] opacity-90"
          style={{ willChange: 'transform, background-color' }}
        />

        {/* Liquid Blob 2: Vibrant Cyan / Sapphire (Center-Top) */}
        <div
          className="liquid-blob-2 absolute top-4 left-1/4 w-80 h-80 rounded-full bg-cyan-400 blur-[85px] opacity-75"
          style={{ willChange: 'transform' }}
        />

        {/* Liquid Blob 3: Coral Pink to Sunset Orange & Golden Amber (Bottom-Right) */}
        <div
          className="liquid-blob-3 absolute -bottom-10 -right-10 w-84 h-84 rounded-full blur-[75px] opacity-85"
          style={{ willChange: 'transform, background-color' }}
        />

        {/* Liquid Blob 4: Deep Violet Aura for richness (Bottom-Center) */}
        <div
          className="absolute bottom-6 left-1/3 w-72 h-72 rounded-full bg-indigo-600/60 blur-[90px] opacity-70 animate-pulse pointer-events-none"
          style={{ animationDuration: '6s' }}
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
