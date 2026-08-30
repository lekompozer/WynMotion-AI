'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { Play, Pause, ZoomIn, ZoomOut, Sparkles, RefreshCw, Scissors, Type, Music, Trash2 } from 'lucide-react';
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
  onDeleteItem?: (itemId: string) => void;
  selectedItemId?: string | null;
  onOpenFXTab?: () => void;
  isMobile?: boolean;
  zoomLevel?: number;
  onZoomChange?: (newZoom: number) => void;
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
  onDeleteItem,
  selectedItemId,
  onOpenFXTab,
  isMobile = false,
  zoomLevel,
  onZoomChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [internalZoom, setInternalZoom] = React.useState<number>(1.2);
  const activeZoom = zoomLevel !== undefined ? zoomLevel : internalZoom;

  const handleZoomUpdate = (newVal: number) => {
    const clamped = Math.max(0.5, Math.min(3.5, newVal));
    setInternalZoom(clamped);
    onZoomChange?.(clamped);
  };

  const basePixelsPerSec = isMobile ? 45 : 85;
  const zoom = basePixelsPerSec * activeZoom; // Dynamic pixels per second scaling
  const totalWidth = Math.max(isMobile ? 360 : 900, totalDuration * zoom);

  // Keyboard shortcut listener for Delete / Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemId) {
        e.preventDefault();
        onDeleteItem?.(selectedItemId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, onDeleteItem]);

  // Handle Playhead Scrubbing
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left + (scrollContainerRef.current?.scrollLeft || 0);
    const newTime = snapToGrid(pixelsToTime(clickX, zoom), 0.05);
    onSeek(Math.max(0, Math.min(totalDuration, newTime)));
  };

  // 1. Handle Drag & Move Item Position (Body Drag)
  const handleDragMoveStart = (e: React.MouseEvent | React.TouchEvent, item: TimelineItem) => {
    e.stopPropagation();
    onSelectItem?.(item.id);

    const startClientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const initialStart = item.startTime;
    const dur = item.duration;

    const onMove = (moveEvt: MouseEvent | TouchEvent) => {
      const currentClientX = 'touches' in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX;
      const deltaX = currentClientX - startClientX;
      const deltaTime = pixelsToTime(deltaX, zoom);
      const newStart = Math.max(0, Math.min(totalDuration - dur, snapToGrid(initialStart + deltaTime, 0.05)));
      onUpdateItemDuration(item.id, newStart, dur);
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

  // 2. Handle Item Duration Trimming (Left and Right Handles)
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
  const step = activeZoom < 0.8 ? 2 : 1;
  for (let s = 0; s <= totalDuration; s += step) {
    rulerMarks.push(s);
  }

  const playheadLeft = timeToPixels(currentTime, zoom);

  return (
    <div className={`w-full bg-[#0D0F18] border-t border-[#1E2232] flex flex-col select-none ${isMobile ? 'text-xs' : 'text-sm'}`}>
      {/* ─────────────────────────────────────────────────────────────
          1. TOP CONTROL BAR (2 COMPACT ROWS: PLAY + TIME SCRUBBER | ZOOM % + TIMESTAMPS)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col px-3 py-1.5 bg-[#121522] border-b border-[#1E2232] gap-1.5">
        {/* ROW 1: Play/Pause Button + Time Scrubber Slider (+ Delete button if selected) */}
        <div className="flex items-center gap-2.5 w-full">
          <button
            onClick={onPlayPause}
            className="p-1.5 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 hover:brightness-110 shadow-md font-bold transition-all shrink-0 active:scale-95"
            title={isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          {/* Interactive Time Scrubber Slider */}
          <input
            type="range"
            min={0}
            max={Math.max(0.1, totalDuration)}
            step={0.02}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="flex-1 accent-cyan-400 h-1.5 bg-[#1F2438] rounded-lg cursor-pointer transition-all"
            title="Kéo để tua nhanh thời gian phát"
          />

          {selectedItemId && onDeleteItem && (
            <button
              onClick={() => onDeleteItem(selectedItemId)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black transition-all shadow-md active:scale-95 shrink-0"
              title="Xóa clip đang chọn"
            >
              <Trash2 className="w-3 h-3" />
              <span>Xóa</span>
            </button>
          )}
        </div>

        {/* ROW 2: Zoom Slider (%) + Dynamic Timestamp Indicator */}
        <div className="flex items-center justify-between w-full pt-0.5">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1.5 bg-[#090B12] px-2 py-0.5 rounded-xl border border-[#1E2232]">
            <button
              onClick={() => handleZoomUpdate(activeZoom - 0.2)}
              className="p-0.5 text-slate-400 hover:text-white rounded transition-colors"
              title="Thu nhỏ timeline (-)"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.1"
              value={activeZoom}
              onChange={(e) => handleZoomUpdate(parseFloat(e.target.value))}
              className="w-16 sm:w-24 accent-cyan-400 h-1 bg-[#1F2438] rounded-lg cursor-pointer"
            />
            <button
              onClick={() => handleZoomUpdate(activeZoom + 0.2)}
              className="p-0.5 text-slate-400 hover:text-white rounded transition-colors"
              title="Phóng to timeline (+)"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono text-cyan-400 font-bold ml-1">{Math.round(activeZoom * 100)}%</span>
          </div>

          {/* Changing Timecode */}
          <div className="font-mono text-[11px] font-black tracking-wider text-slate-300">
            <span className="text-cyan-400">{formatTimestamp(currentTime)}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">{formatTimestamp(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MULTI-TRACKS CONTAINER (Gấp đôi chiều cao mỗi hàng, cuộn theo toàn màn hình)
          ───────────────────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        onClick={handleTimelineClick}
        className="w-full overflow-x-auto relative bg-[#090B12] cursor-crosshair scrollbar-thin scrollbar-thumb-slate-700"
      >
        <div className="relative py-1.5" style={{ width: `${totalWidth}px` }}>
          <div className="h-4 border-b border-[#1E2232] relative flex items-end">
            {rulerMarks.map((s) => (
              <div
                key={s}
                className="absolute text-[9px] font-mono text-slate-500 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                style={{ left: `${timeToPixels(s, zoom)}px` }}
              >
                <span>{s}s</span>
                <div className="w-[1px] h-1 bg-slate-700 mt-0.5" />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 py-1.5">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`relative rounded-xl bg-[#141724]/70 border border-[#1E2232]/90 flex items-center ${
                  isMobile ? 'h-13' : 'h-14'
                }`}
                style={{ height: isMobile ? '50px' : '56px' }}
              >
                <div className="absolute left-2 z-10 text-[9px] font-black uppercase text-slate-300 flex items-center gap-1 pointer-events-none bg-[#0D0F18]/90 px-1.5 py-0.5 rounded backdrop-blur-md border border-white/10 shadow-xs">
                  {track.type === 'video' && '🎬 Scene'}
                  {track.type === 'transitions' && (track.id === 'track_fx_1' ? '⚡ FX 2' : '⚡ FX')}
                  {track.type === 'captions' && '💬 Caption'}
                  {track.type === 'audio' && '🎵 Audio'}
                </div>

                {track.items.map((item) => {
                  const itemLeft = timeToPixels(item.startTime, zoom);
                  const itemWidth = Math.max(20, timeToPixels(item.duration, zoom));
                  const isSelected = selectedItemId === item.id;

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
                      onMouseDown={(e) => handleDragMoveStart(e, item)}
                      onTouchStart={(e) => handleDragMoveStart(e, item)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem?.(item.id);
                      }}
                      className={`absolute top-1 bottom-1 rounded-xl bg-gradient-to-r ${bgGradient} text-white flex items-center justify-between px-2 border shadow-md transition-all group cursor-grab active:cursor-grabbing ${
                        isSelected ? 'border-white ring-2 ring-cyan-400 shadow-cyan-500/40' : 'border-white/20 hover:border-white/60'
                      }`}
                      style={{
                        left: `${itemLeft}px`,
                        width: `${itemWidth}px`,
                      }}
                      title="Bấm giữ để kéo di chuyển clip / Kéo mép để chỉnh độ dài"
                    >
                      <div
                        onMouseDown={(e) => handleResizeStart(e, item, 'left')}
                        onTouchStart={(e) => handleResizeStart(e, item, 'left')}
                        className="w-3.5 h-full -ml-2 cursor-ew-resize opacity-80 group-hover:opacity-100 hover:bg-white/30 rounded-l-xl flex items-center justify-center transition-opacity z-20"
                        title="Kéo chỉnh thời lượng bắt đầu"
                      >
                        <div className="w-1 h-5 bg-white/90 rounded-full shadow-sm" />
                      </div>

                      <div className="flex-1 truncate px-1.5 text-[11px] font-black flex flex-col justify-center pointer-events-none min-w-0">
                        <div className="flex items-center gap-1 truncate">
                          {track.type === 'transitions' && <RefreshCw className="w-3 h-3 shrink-0" />}
                          <span className="truncate">{item.title}</span>
                        </div>
                        <span className="text-[9px] opacity-75 font-mono">({item.duration.toFixed(2)}s)</span>
                      </div>

                      {onDeleteItem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/60 text-white rounded-lg transition-opacity ml-1 z-20"
                          title="Xóa clip này"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-200" />
                        </button>
                      )}

                      <div
                        onMouseDown={(e) => handleResizeStart(e, item, 'right')}
                        onTouchStart={(e) => handleResizeStart(e, item, 'right')}
                        className="w-3.5 h-full -mr-2 cursor-ew-resize opacity-80 group-hover:opacity-100 hover:bg-white/30 rounded-r-xl flex items-center justify-center transition-opacity z-20"
                        title="Kéo chỉnh thời lượng kết thúc"
                      >
                        <div className="w-1 h-5 bg-white/90 rounded-full shadow-sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
            style={{ left: `${playheadLeft}px` }}
          >
            <div className="w-3.5 h-3.5 bg-cyan-400 rotate-45 -mt-1 shadow-lg shadow-cyan-400/60" />
            <div className="w-[2px] flex-1 bg-cyan-400 shadow-md shadow-cyan-400/90" />
          </div>
        </div>
      </div>
    </div>
  );
};
