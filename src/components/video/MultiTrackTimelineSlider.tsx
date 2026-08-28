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
          1. TOP CONTROL BAR (PLAY, TIMESTAMPS, ZOOM & DELETE ACTIONS)
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

        {/* Center: Interactive Timeline Zoom Slider (CapCut-Style) */}
        <div className="flex items-center gap-1.5 bg-[#090B12] px-2.5 py-1 rounded-xl border border-[#1E2232]">
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
            className="w-20 sm:w-28 accent-cyan-400 h-1 bg-[#1F2438] rounded-lg cursor-pointer"
            title="Kéo để phóng to / thu nhỏ khung timeline"
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

        {/* Right: Selected Item Actions (Delete & Add FX) */}
        <div className="flex items-center gap-2">
          {selectedItemId && onDeleteItem && (
            <button
              onClick={() => onDeleteItem(selectedItemId)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black transition-all shadow-md shadow-rose-600/30 active:scale-95 animate-pulse"
              title="Xóa clip/hiệu ứng đang chọn (Phím Delete/Backspace)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa ({selectedItemId.split('_')[0]})</span>
            </button>
          )}

          {onOpenFXTab && (
            <button
              onClick={onOpenFXTab}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white text-[10px] font-black transition-all shadow-sm"
            >
              <Sparkles className="w-3 h-3" />
              <span>+ Thêm FX</span>
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onClick={handleTimelineClick}
        className="w-full overflow-x-auto overflow-y-hidden relative bg-[#090B12] cursor-crosshair scrollbar-thin scrollbar-thumb-slate-700"
        style={{ minHeight: isMobile ? '120px' : '150px' }}
      >
        <div className="relative py-2" style={{ width: `${totalWidth}px` }}>
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
                className={`relative rounded-lg bg-[#141724]/60 border border-[#1E2232]/80 flex items-center ${
                  isMobile ? 'h-7' : 'h-9'
                }`}
              >
                <div className="absolute left-2 z-10 text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 pointer-events-none">
                  {track.type === 'video' && '🎬 Media'}
                  {track.type === 'transitions' && (track.id === 'track_fx_1' ? '⚡ FX 2 (Overlay)' : '⚡ FX Shaders')}
                  {track.type === 'captions' && '💬 Captions'}
                  {track.type === 'audio' && '🎵 Audio'}
                </div>

                {track.items.map((item) => {
                  const itemLeft = timeToPixels(item.startTime, zoom);
                  const itemWidth = Math.max(16, timeToPixels(item.duration, zoom));
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
                      className={`absolute top-0.5 bottom-0.5 rounded-md bg-gradient-to-r ${bgGradient} text-white flex items-center justify-between px-1.5 border shadow-sm transition-shadow group cursor-grab active:cursor-grabbing ${
                        isSelected ? 'border-white ring-2 ring-cyan-400 shadow-cyan-500/30' : 'border-white/20 hover:border-white/60'
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
                        className="w-2.5 h-full -ml-1.5 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-white/40 rounded-l flex items-center justify-center transition-opacity z-20"
                        title="Kéo chỉnh thời lượng bắt đầu"
                      >
                        <div className="w-0.5 h-3 bg-white/80 rounded" />
                      </div>

                      <div className="flex-1 truncate px-1 text-[10px] font-black flex items-center gap-1 pointer-events-none">
                        {track.type === 'transitions' && <RefreshCw className="w-2.5 h-2.5 shrink-0" />}
                        <span className="truncate">{item.title}</span>
                        <span className="text-[9px] opacity-75 font-mono ml-auto">({item.duration.toFixed(1)}s)</span>
                      </div>

                      {onDeleteItem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-500/50 text-white rounded transition-opacity ml-1 z-20"
                          title="Xóa clip này"
                        >
                          <Trash2 className="w-3 h-3 text-rose-200" />
                        </button>
                      )}

                      <div
                        onMouseDown={(e) => handleResizeStart(e, item, 'right')}
                        onTouchStart={(e) => handleResizeStart(e, item, 'right')}
                        className="w-2.5 h-full -mr-1.5 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-white/40 rounded-r flex items-center justify-center transition-opacity z-20"
                        title="Kéo chỉnh thời lượng kết thúc"
                      >
                        <div className="w-0.5 h-3 bg-white/80 rounded" />
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
            <div className="w-3 h-3 bg-cyan-400 rotate-45 -mt-1 shadow-lg shadow-cyan-400/50" />
            <div className="w-[2px] flex-1 bg-cyan-400 shadow-md shadow-cyan-400/80" />
          </div>
        </div>
      </div>
    </div>
  );
};
