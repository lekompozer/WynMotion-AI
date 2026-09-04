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
      {/* Dynamic CSS for Orbiting Warm & Cool Liquid Glowing Orbs */}
      <style jsx>{`
        /* Warm Glowing Orb (Coral Pink -> Sunset Orange -> Amber -> Magenta) Orbiting Motion on RIGHT */
        @keyframes warmOrbFloatRight {
          0% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
          25% {
            transform: translate(-50px, -20px) scale(1.15) rotate(-90deg);
          }
          50% {
            transform: translate(-90px, 35px) scale(1.22) rotate(-180deg);
          }
          75% {
            transform: translate(-25px, 50px) scale(0.95) rotate(-270deg);
          }
          100% {
            transform: translate(0px, 0px) scale(1) rotate(-360deg);
          }
        }

        /* Cool Liquid Blob (Sky Blue -> Cyan -> Royal Indigo -> Deep Violet) at Bottom-LEFT */
        @keyframes coolLiquidDriftLeft {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(45px, -30px) scale(1.18);
          }
          66% {
            transform: translate(-20px, -45px) scale(0.92);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        /* Aqua Cyan Ambient Flow on LEFT */
        @keyframes cyanFlowLeft {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(35px, 30px) scale(1.12);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes morphWarmColors {
          0% {
            background-color: #FF2D55; /* Neon Coral Pink */
          }
          30% {
            background-color: #FF5E3A; /* Sunset Orange */
          }
          60% {
            background-color: #FF9500; /* Golden Amber / Warm Coral */
          }
          85% {
            background-color: #E11D48; /* Deep Rose Magenta */
          }
          100% {
            background-color: #FF2D55;
          }
        }

        @keyframes morphCoolColors {
          0% {
            background-color: #0EA5E9; /* Sky Blue */
          }
          30% {
            background-color: #06B6D4; /* Electric Cyan */
          }
          60% {
            background-color: #6366F1; /* Royal Indigo */
          }
          85% {
            background-color: #7C3AED; /* Deep Violet */
          }
          100% {
            background-color: #0EA5E9;
          }
        }

        .warm-orb-right {
          animation: warmOrbFloatRight 11s ease-in-out infinite, morphWarmColors 12s ease-in-out infinite;
        }

        .cool-liquid-bottom-left {
          animation: coolLiquidDriftLeft 10s ease-in-out infinite, morphCoolColors 13s ease-in-out infinite;
        }

        .cyan-orb-left {
          animation: cyanFlowLeft 9s ease-in-out infinite;
        }
      `}</style>

      {/* 1. Deep Midnight Base with Vivid Warm Orbiting Orb on RIGHT + Cool Bottom-LEFT Liquid */}
      <div className="absolute inset-0 z-0 bg-[#07132B] overflow-hidden pointer-events-none">
        {/* Ambient base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2552] via-[#091D42] to-[#061226]" />

        {/* VIVID WARM ORB (Right area - coral pink to orange/amber orbiting fluidly) */}
        <div
          className="warm-orb-right absolute top-8 right-10 w-80 h-80 rounded-full blur-[65px] opacity-95"
          style={{ willChange: 'transform, background-color' }}
        />

        {/* COOL LIQUID BLOB (Bottom-Left quadrant - Sky Blue to Indigo to Violet) */}
        <div
          className="cool-liquid-bottom-left absolute bottom-12 left-0 w-88 h-88 rounded-full blur-[70px] opacity-95"
          style={{ willChange: 'transform, background-color' }}
        />

        {/* AMBIENT ELECTRIC CYAN (Top-Left Accent) */}
        <div
          className="cyan-orb-left absolute top-4 left-12 w-72 h-72 rounded-full bg-cyan-400 blur-[75px] opacity-80"
          style={{ willChange: 'transform' }}
        />

        {/* DEEP SAPPHIRE BASE (Top-Right corner) */}
        <div
          className="absolute -top-12 -right-12 w-80 h-80 rounded-full bg-blue-600/70 blur-[85px] opacity-75"
        />
      </div>

      {/* 2. Bottom Fade to White/Canvas Background (CapCut iconic smooth blend) */}
      <div
        className="absolute inset-x-0 bottom-0 h-44 pointer-events-none z-[2]"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, transparent 0%, rgba(8,11,16,0.3) 30%, rgba(8,11,16,0.85) 75%, #080B10 100%)'
            : 'linear-gradient(180deg, transparent 0%, rgba(250,250,252,0.3) 30%, rgba(250,250,252,0.85) 75%, #FAFAFC 100%)',
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
