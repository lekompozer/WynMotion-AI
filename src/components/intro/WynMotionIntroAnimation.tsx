'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Volume2, VolumeX, X, Sparkles, Play, RotateCcw } from 'lucide-react';

export interface WynMotionIntroAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCreate?: () => void;
}

const OFFICIAL_INTRO_VIDEO_URL =
  'https://static.wordai.pro/ai-generated-images/wynmotion/WynMotion_Official_Intro_v9.mp4';

export const WynMotionIntroAnimation: React.FC<WynMotionIntroAnimationProps> = ({
  isOpen,
  onClose,
  onStartCreate,
}) => {
  const { isVietnamese } = useApp();
  const t = (vi: string, en: string) => (isVietnamese ? vi : en);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setIsEnded(false);
      setProgress(0);
      return;
    }

    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.play().catch(() => {
          // Autoplay policy fallback: mute first
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch((e) => console.warn('Autoplay prevented:', e));
          }
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 50.1;
    const cur = videoRef.current.currentTime || 0;
    setProgress(Math.min(100, (cur / dur) * 100));
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch((e) => console.warn('Replay failed:', e));
    setIsEnded(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200">
      {/* 9:16 Video Stage Container */}
      <div className="relative w-full h-full sm:h-[90vh] sm:max-h-[850px] sm:w-[440px] sm:max-w-[95vw] bg-black sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10">
        {/* Top Floating Controls */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-12 sm:pt-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-black text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>WynMotion 50s Suite</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-white/70" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={OFFICIAL_INTRO_VIDEO_URL}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsEnded(true)}
            className="w-full h-full object-cover"
          />

          {/* End Replay Overlay */}
          {isEnded && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10 animate-in fade-in duration-300">
              <button
                onClick={handleReplay}
                className="w-14 h-14 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              >
                <RotateCcw className="w-6 h-6 text-cyan-300" />
              </button>
              <p className="text-xs font-bold text-white/80">{t('Xem lại video intro', 'Replay intro video')}</p>
            </div>
          )}
        </div>

        {/* Bottom Floating Progress & CTA */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-8 sm:pb-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent space-y-3 pointer-events-auto">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 transition-all duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Bottom Action CTA */}
          <button
            onClick={() => {
              onClose();
              onStartCreate?.();
            }}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-cyan-500/25"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{t('BẮT ĐẦU SÁNG TẠO NGAY', 'START CREATING NOW')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WynMotionIntroAnimation;
