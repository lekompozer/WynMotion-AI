'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Zap, RotateCcw, Check, Play } from 'lucide-react';
import { GLSLTransitionCanvas } from '../styles/transitions/GLSLTransitionCanvas';
import { SHADERS_MAP } from '../../../../packages/core-effects/shadersMap';
import { ActiveEffectsOverlay, CustomTimelineEffect } from '../styles/ActiveEffectsOverlay';

export interface FoxLivePreviewBoxProps {
  currentType: 'transition' | 'effect';
  currentName: string;
  currentCategory?: string;
  onApply: () => void;
}

// Generate a high-contrast real PNG data URL for Texture B in WebGL transitions
const generateTextureBDataUrl = (): string => {
  if (typeof document === 'undefined') return '/png-fox.png';
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '/png-fox.png';

  // Draw vibrant dark slate background with neon cyan circle & badge
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, 300, 300);

  // Gradient circle
  const grad = ctx.createRadialGradient(150, 150, 20, 150, 150, 140);
  grad.addColorStop(0, '#38BDF8');
  grad.addColorStop(1, '#6366F1');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(150, 150, 110, 0, Math.PI * 2);
  ctx.fill();

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NEXT SCENE', 150, 150);

  return canvas.toDataURL('image/png');
};

export const FoxLivePreviewBox: React.FC<FoxLivePreviewBoxProps> = ({
  currentType,
  currentName,
  currentCategory = 'General',
  onApply,
}) => {
  const [progress, setProgress] = useState(0);
  const [appliedAnim, setAppliedAnim] = useState(false);
  const [textureB, setTextureB] = useState<string>('/png-fox.png');
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const FOX_IMG_A = '/png-fox.png';

  // Initialize Texture B
  useEffect(() => {
    try {
      const bData = generateTextureBDataUrl();
      setTextureB(bData);
    } catch (e) {
      setTextureB('/png-fox.png');
    }
  }, []);

  const glslCode =
    SHADERS_MAP[currentName] ||
    'vec4 transition(vec2 uv) { return mix(getFromColor(uv), getToColor(uv), progress); }';

  // Continuous looping animation with smooth cycle
  useEffect(() => {
    startTimeRef.current = Date.now();

    const loop = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const cycleDuration = 1.3; // 1.3s transition duration
      const pauseDuration = 0.4; // 0.4s pause at end
      const totalCycle = cycleDuration + pauseDuration;
      const currentCycleTime = elapsed % totalCycle;

      if (currentCycleTime <= cycleDuration) {
        setProgress(Math.min(1.0, currentCycleTime / cycleDuration));
      } else {
        setProgress(1.0);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentName, currentType]);

  const handleApplyClick = () => {
    setAppliedAnim(true);
    onApply();
    setTimeout(() => setAppliedAnim(false), 2000);
  };

  const handleReplay = () => {
    startTimeRef.current = Date.now();
    setProgress(0);
  };

  const previewEffectsList: CustomTimelineEffect[] = [
    {
      id: 'preview_fx',
      effectId: currentName,
      name: currentName,
      trackIndex: 0,
      startTime: 0,
      endTime: 1.5,
      duration: 1.5,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#181C2E] to-[#0F111E] border border-[#2D334D] rounded-2xl p-3 shadow-xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3">
        {/* 1. SQUARE WHITE CANVAS PREVIEW CONTAINER (105x105) */}
        <div className="relative w-[105px] h-[105px] shrink-0 rounded-xl overflow-hidden bg-white shadow-md border-2 border-purple-500/40 flex items-center justify-center group">
          {currentType === 'transition' ? (
            <div className="relative w-full h-full">
              <GLSLTransitionCanvas
                fromImage={FOX_IMG_A}
                toImage={textureB}
                progress={progress}
                glslSource={glslCode}
                width={210}
                height={210}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-white">
              <img
                src={FOX_IMG_A}
                alt="Fox Preview"
                className="w-full h-full object-contain p-1 select-none pointer-events-none"
              />
              <ActiveEffectsOverlay
                activeEffects={previewEffectsList}
                currentTime={progress * 1.5}
                currentFrame={Math.round(progress * 45)}
                fps={30}
              />
            </div>
          )}

          {/* Live Progress Bar Indicator at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-75"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Mini Live WebGL Badge */}
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[8px] font-black text-cyan-300 uppercase tracking-wider flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
            Live 🦊
          </div>
        </div>

        {/* 2. PREVIEW DETAILS & ACTION BUTTON */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-2">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                {currentType === 'transition' ? <Sparkles className="w-3 h-3" /> : <Zap className="w-3 h-3 text-amber-400" />}
                <span>{currentType === 'transition' ? 'GLSL Transition' : 'Visual Effect'}</span>
              </div>
              <button
                onClick={handleReplay}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#252B3E] transition-colors"
                title="Chạy lại xem trước"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <h4 className="text-xs font-black text-white truncate mt-0.5" title={currentName}>
              {currentName || 'GlitchMemories'}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-[#1F2438] text-[10px] font-semibold text-slate-300 border border-[#2D334D] truncate max-w-[110px]">
                {currentCategory}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">{Math.round(progress * 100)}%</span>
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApplyClick}
            className={`w-full py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
              appliedAnim
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white hover:brightness-110 shadow-purple-500/25'
            }`}
          >
            {appliedAnim ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã áp dụng vào Video!</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Áp dụng vào Video</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
