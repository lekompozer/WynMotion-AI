'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Eye, Plus, Check } from 'lucide-react';
import { GLSLTransitionCanvas } from '../styles/transitions/GLSLTransitionCanvas';
import { ActiveEffectsOverlay, CustomTimelineEffect } from '../styles/ActiveEffectsOverlay';
import { SHADERS_MAP } from '../../../../packages/core-effects/shadersMap';

interface EffectCardThumbnailProps {
  id: string;
  name: string;
  category: string;
  type: 'transition' | 'effect';
  duration?: number;
  icon?: string;
  gradient?: string;
  isSelected?: boolean;
  onPreview: () => void;
  onApply: () => void;
}

const FOX_IMG = '/png-fox.png';
const NEXT_SCENE_IMG = '/previews/next_scene_cover.png';

export const EffectCardThumbnail: React.FC<EffectCardThumbnailProps> = ({
  id,
  name,
  category,
  type,
  duration = 0.8,
  icon,
  gradient,
  isSelected,
  onPreview,
  onApply,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [appliedAnim, setAppliedAnim] = useState(false);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Loop animation for thumbnail (1.4s cycle)
  useEffect(() => {
    let active = true;
    const loopDuration = 1400; // 1.4s per loop

    const tick = () => {
      if (!active) return;
      const elapsed = Date.now() - startTimeRef.current;
      const prog = (elapsed % loopDuration) / loopDuration;
      setProgress(prog);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const glslSource =
    type === 'transition'
      ? SHADERS_MAP[id] || 'vec4 transition(vec2 uv) { return mix(getFromColor(uv), getToColor(uv), progress); }'
      : undefined;

  const effectList: CustomTimelineEffect[] = [
    {
      id: `thumb_${id}`,
      effectId: id,
      name,
      trackIndex: 0,
      startTime: 0,
      endTime: 1.5,
      duration: 1.5,
    },
  ];

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAppliedAnim(true);
    onApply();
    setTimeout(() => setAppliedAnim(false), 1500);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview();
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPreview}
      className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'bg-purple-950/70 border-cyan-400 ring-2 ring-cyan-400/80 shadow-lg shadow-cyan-500/25'
          : 'bg-[#131624] border-[#252A3D] hover:border-purple-500/60 hover:bg-[#181D30] hover:shadow-md'
      }`}
    >
      {/* 1. ANIMATED THUMBNAIL CANVAS (Fox -> NEXT SCENE or Filter) */}
      <div className="relative w-full aspect-square bg-[#0F111E] overflow-hidden flex items-center justify-center">
        {type === 'transition' ? (
          <div className="relative w-full h-full">
            <GLSLTransitionCanvas
              fromImage={FOX_IMG}
              toImage={NEXT_SCENE_IMG}
              progress={progress}
              glslSource={glslSource || ''}
              width={160}
              height={160}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-white p-2">
            <img
              src={FOX_IMG}
              alt="Fox Thumbnail"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
            <ActiveEffectsOverlay
              activeEffects={effectList}
              currentTime={progress * 1.5}
              currentFrame={Math.round(progress * 45)}
              fps={30}
            />
          </div>
        )}

        {/* Progress Bar Indicator at Bottom of Thumbnail */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 transition-all duration-75"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
          <span className="text-[9px] uppercase font-black tracking-wider text-purple-300 bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded border border-purple-800/50 truncate max-w-[90px]">
            {category}
          </span>
          {isSelected && (
            <span className="px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 text-[9px] font-black flex items-center gap-0.5 shadow-sm">
              🦊 Đang xem
            </span>
          )}
        </div>

        {/* HOVER OVERLAY WITH 2 ACTION BUTTONS */}
        <div
          className={`absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 p-2 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={handlePreviewClick}
            className="w-full py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/50 text-[11px] font-black flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
            title="Xem chi tiết trên khung con cáo lớn"
          >
            <Eye className="w-3 h-3" />
            <span>Xem thử</span>
          </button>

          <button
            onClick={handleApplyClick}
            className={`w-full py-1 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm ${
              appliedAnim
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 text-white shadow-purple-500/30'
            }`}
            title="Chèn ngay vào Timeline Video chính"
          >
            {appliedAnim ? (
              <>
                <Check className="w-3 h-3" />
                <span>Đã áp dụng!</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Áp dụng</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. CARD FOOTER: NAME & DURATION */}
      <div className="p-2 flex flex-col justify-between">
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-xs">{icon}</span>}
          <h4
            className={`text-[11px] font-black truncate transition-colors ${
              isSelected ? 'text-cyan-300' : 'text-white group-hover:text-purple-300'
            }`}
            title={name}
          >
            {name}
          </h4>
        </div>
        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
          <span>{duration}s</span>
          <span className="text-purple-400 font-mono font-bold text-[9px]">CapCut Pro</span>
        </div>
      </div>
    </div>
  );
};
