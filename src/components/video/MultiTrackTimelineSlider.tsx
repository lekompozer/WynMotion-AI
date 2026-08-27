'use client';

import React, { useRef, useCallback } from 'react';
import { Play, Pause, ZoomIn, ZoomOut, Sparkles, RefreshCw, Scissors, Type, Music } from 'lucide-react';
import { TimelineTrack, TimelineItem } from '../../../packages/timeline-core/types';
import { formatTimestamp, timeToPixels, pixelsToTime, snapToGrid } from '../../../packages/timeline-core/math_timeline';

export interface MultiTrackTimelineSliderProps {
  currentTime: number; // in seconds
  totalDuration: number; // in seconds
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  tracks: TimelineTrack[];
  onUpdateItemDuration: (itemId: string, newStartTime: number, newDuration: number) => void;
  onSelectItem?: (itemId: string | null) => void;
  selectedItemId?: string | null;
  onOpenFXTab?: () => void;
  isMobile?: boolean;
}

export const MultiTrackTimelineSlider: React.FC<MultiTrackTimelineSliderProps> = ({
  currentTime,
  totalDuration = 15.0,
  isPlaying,
  onPlayPause,
  onSeek,
  tracks = [],
  onUpdateItemDuration,
  onSelectItem,
  selectedItemId,
  onOpenFXTab,
  isMobile = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const zoom = isMobile ? 35 : 60; // pixels per second (compact on mobile, expansive on desktop)
  const totalWidth = Math.max(isMobile ? 360 : 800, totalDuration * zoom);

  // Handle Playhead Scrubbing
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left + (scrollContainerRef.current?.scrollLeft || 0);
    const newTime = snapToGrid(pixelsToTime(clickX, zoom), 0.05);
    onSeek(Math.max(0, Math.min(totalDuration, newTime)));
  };

  // Handle Item Duration Trimming (Left and Right Handles)
  const handleResizeStart = (
    e: React.MouseEvent | React.TouchEvent,
    item: TimelineItem,
    direction: 'left' | 'right'
  ) => {
    e.stopPropagation();
    const startClientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const initialStart = item.startTime;
    const initialDur = item.duration;

    const onMove = (moveEvt: MouseEvent | TouchEvent) => {
      const currentClientX = 'touches' in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX;
      const deltaX = currentClientX - startClientX;
      const deltaTime = pixelsToTime(deltaX, zoom);

      if (direction === 'right') {
        const newDur = Math.max(0.2, Math.min(totalDuration - initialStart, snapToGrid(initialDur + deltaTime, 0.05)));
        onUpdateItemDuration(item.id, initialStart, newDur);
      } else {
        const newStart = Math.max(0, snapToGrid(initialStart + deltaTime, 0.05));
        const newDur = Math.max(0.2, snapToGrid(initialDur - (newStart - initialStart), 0.05));
        onUpdateItemDuration(item.id, newStart, newDur);
      }
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  // Rulers Marks
  const rulerMarks = [];
  const step = totalDuration > 30 ? 2 : 1; // 1s or 2s intervals
  for (let s = 0; s <= totalDuration; s += step) {
    rulerMarks.push(s);
  }

  const playheadLeft = timeToPixels(currentTime, zoom);

  return (
    <div className={`w-full bg-[#0D0F18] border-t border-[#1E2232] flex flex-col select-none ${isMobile ? 'text-xs' : 'text-sm'}`}>
      {/* ─────────────────────────────────────────────────────────────
          1. TOP CONTROL BAR (PLAY, TIMESTAMPS, ACTIONS)
          ───────────────────────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-3 py-1.5 bg-[#121522] border-b border-[#1E2232] ${isMobile ? 'gap-1' : 'gap-4'}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={onPlayPause}
            className="p-1.5 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 hover:brightness-110 shadow-md font-bold transition-all"
            title={isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          <div className="font-mono text-[11px] font-black tracking-wider text-slate-300">
            <span className="text-cyan-400">{formatTimestamp(currentTime)}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">{formatTimestamp(totalDuration)}</span>
          </div>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-1.5">
          {onOpenFXTab && (
            <button
              onClick={onOpenFXTab}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-300 text-[11px] font-bold transition-all"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>+ FX & Shaders</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SCROLLABLE MULTI-TRACK CANVAS
          ───────────────────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto overflow-y-hidden relative scrollbar-thin scrollbar-thumb-[#252B3E] scrollbar-track-[#0D0F18]"
        style={{ maxHeight: isMobile ? '160px' : '220px' }}
      >
        <div
          className="relative min-h-[140px] py-1 cursor-pointer"
          style={{ width: `${totalWidth + 100}px` }}
          onClick={handleTimelineClick}
        >
          {/* Ruler Bar */}
          <div className="h-5 border-b border-[#1E2232] relative flex items-end">
            {rulerMarks.map((sec) => (
              <div
                key={sec}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${timeToPixels(sec, zoom)}px` }}
              >
                <div className="w-[1px] h-2 bg-slate-600" />
                <span className="text-[9px] font-mono text-slate-500 mt-0.5">{sec}s</span>
              </div>
            ))}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TRACKS CONTAINER
              ───────────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5 py-1.5">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`relative rounded-lg bg-[#141724]/60 border border-[#1E2232]/80 flex items-center ${
                  isMobile ? 'h-7' : 'h-9'
                }`}
              >
                {/* Track Label Icon */}
                <div className="absolute left-2 z-10 text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 pointer-events-none">
                  {track.type === 'video' && '🎬 Media'}
                  {track.type === 'transitions' && '⚡ FX Shaders'}
                  {track.type === 'captions' && '💬 Captions'}
                  {track.type === 'audio' && '🎵 Audio'}
                </div>

                {/* Track Items */}
                {track.items.map((item) => {
                  const itemLeft = timeToPixels(item.startTime, zoom);
                  const itemWidth = Math.max(16, timeToPixels(item.duration, zoom));
                  const isSelected = selectedItemId === item.id;

                  // Styling per track type
                  let bgGradient = 'from-blue-600 to-indigo-700';
                  if (track.type === 'transitions' || track.type === 'effects') {
                    bgGradient = 'from-purple-600 via-pink-600 to-rose-600';
                  } else if (track.type === 'captions') {
                    bgGradient = 'from-amber-500 to-orange-600';
                  } else if (track.type === 'audio') {
                    bgGradient = 'from-emerald-600 to-teal-700';
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem?.(item.id);
                      }}
                      className={`absolute top-0.5 bottom-0.5 rounded-md bg-gradient-to-r ${bgGradient} text-white flex items-center justify-between px-1.5 border shadow-sm transition-shadow group ${
                        isSelected ? 'border-white ring-2 ring-cyan-400 shadow-cyan-500/30' : 'border-white/20 hover:border-white/60'
                      }`}
                      style={{
                        left: `${itemLeft}px`,
                        width: `${itemWidth}px`,
                      }}
                    >
                      {/* Left Resize Handle */}
                      <div
                        onMouseDown={(e) => handleResizeStart(e, item, 'left')}
                        onTouchStart={(e) => handleResizeStart(e, item, 'left')}
                        className="w-2.5 h-full -ml-1.5 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-white/40 rounded-l flex items-center justify-center transition-opacity"
                        title="Kéo chỉnh thời lượng"
                      >
                        <div className="w-0.5 h-3 bg-white/80 rounded" />
                      </div>

                      {/* Content Title */}
                      <div className="flex-1 truncate px-1 text-[10px] font-black flex items-center gap-1 pointer-events-none">
                        {track.type === 'transitions' && <RefreshCw className="w-2.5 h-2.5 shrink-0" />}
                        <span className="truncate">{item.title}</span>
                        <span className="text-[9px] opacity-75 font-mono ml-auto">({item.duration.toFixed(1)}s)</span>
                      </div>

                      {/* Right Resize Handle */}
                      <div
                        onMouseDown={(e) => handleResizeStart(e, item, 'right')}
                        onTouchStart={(e) => handleResizeStart(e, item, 'right')}
                        className="w-2.5 h-full -mr-1.5 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-white/40 rounded-r flex items-center justify-center transition-opacity"
                        title="Kéo chỉnh thời lượng"
                      >
                        <div className="w-0.5 h-3 bg-white/80 rounded" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. PLAYHEAD RED/PURPLE NEEDLE CURSOR
              ───────────────────────────────────────────────────────────── */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
            style={{ left: `${playheadLeft}px` }}
          >
            {/* Playhead Top Pin */}
            <div className="w-3 h-3 bg-cyan-400 rotate-45 -mt-1 shadow-lg shadow-cyan-400/50" />
            {/* Vertical Line */}
            <div className="w-[2px] flex-1 bg-cyan-400 shadow-md shadow-cyan-400/80" />
          </div>
        </div>
      </div>
    </div>
  );
};
