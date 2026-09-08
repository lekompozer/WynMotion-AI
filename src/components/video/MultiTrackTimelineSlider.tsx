'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Play, Pause, ZoomIn, ZoomOut, Sparkles, RefreshCw, Trash2, Scissors, Plus, Music, Type, Film } from 'lucide-react';
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
  onUpdateItemEnd?: (itemId: string) => void;
  onSelectItem?: (itemId: string | null) => void;
  onDeleteItem?: (itemId: string) => void;
  selectedItemId?: string | null;
  onOpenFXTab?: () => void;
  onOpenAudioTab?: () => void;
  onAddScene?: () => void;
  onAddCaptionSegment?: () => void;
  isMobile?: boolean;
  zoomLevel?: number;
  onZoomChange?: (newZoom: number) => void;
}

interface ActiveDragState {
  itemId: string;
  trackId: string;
  type: 'move' | 'resize-left' | 'resize-right';
  origStart: number;
  origDur: number;
  currentStart: number;
  currentDur: number;
  startClientX: number;
  clientX: number;
  clientY: number;
}

// ─────────────────────────────────────────────────────────────────
// AUDIO WAVEFORM SVG COMPONENT (Rhythmic Waveform Peaks for BGM & Voice)
// ─────────────────────────────────────────────────────────────────
interface AudioWaveformSvgProps {
  width: number;
  height: number;
  seedId: string;
}

const AudioWaveformSvg: React.FC<AudioWaveformSvgProps> = React.memo(({ width, height, seedId }) => {
  const barSpacing = 4;
  const numBars = Math.max(6, Math.floor(width / barSpacing));

  const bars = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seedId.length; i++) hash = (hash << 5) - hash + seedId.charCodeAt(i);
    const result: number[] = [];
    for (let i = 0; i < numBars; i++) {
      const wave = Math.sin(i * 0.18 + hash) * 0.35 + Math.cos(i * 0.42) * 0.25;
      const pseudoRand = Math.abs(Math.sin(hash + i * 997)) * 0.35;
      const normalizedHeight = Math.min(0.95, Math.max(0.18, 0.42 + wave + pseudoRand));
      result.push(normalizedHeight);
    }
    return result;
  }, [numBars, seedId]);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 overflow-hidden"
      preserveAspectRatio="none"
      viewBox={`0 0 ${numBars * barSpacing} ${height}`}
    >
      {bars.map((h, idx) => {
        const barH = h * (height - 14);
        const y = (height - barH) / 2;
        const x = idx * barSpacing + 1;
        const isBeat = idx % 8 === 0;
        return (
          <rect
            key={idx}
            x={x}
            y={y}
            width={2.2}
            height={barH}
            rx={1.1}
            fill={isBeat ? '#34D399' : '#A7F3D0'}
            opacity={isBeat ? 0.95 : 0.65}
          />
        );
      })}
    </svg>
  );
});

AudioWaveformSvg.displayName = 'AudioWaveformSvg';

// ─────────────────────────────────────────────────────────────────
// 1. ISOLATED MEMOIZED CLIP ITEM COMPONENT
// ─────────────────────────────────────────────────────────────────
interface TimelineClipItemProps {
  item: TimelineItem;
  track: TimelineTrack;
  zoom: number;
  isSelected: boolean;
  isMobile: boolean;
  activeDrag: ActiveDragState | null;
  onSelectItem?: (itemId: string | null) => void;
  onDeleteItem?: (itemId: string) => void;
  onStartDragMove: (e: React.MouseEvent | React.TouchEvent, item: TimelineItem, track: TimelineTrack) => void;
  onStartResize: (
    e: React.MouseEvent | React.TouchEvent,
    item: TimelineItem,
    track: TimelineTrack,
    direction: 'left' | 'right'
  ) => void;
}

const TimelineClipItem = React.memo<TimelineClipItemProps>(
  ({
    item,
    track,
    zoom,
    isSelected,
    isMobile,
    activeDrag,
    onSelectItem,
    onDeleteItem,
    onStartDragMove,
    onStartResize,
  }) => {
    // If this item is currently being dragged or resized, use local live coordinates
    const isThisItemActive = activeDrag?.itemId === item.id;
    const effectiveStart = isThisItemActive ? activeDrag.currentStart : item.startTime;
    const effectiveDuration = isThisItemActive ? activeDrag.currentDur : item.duration;

    const itemLeft = timeToPixels(effectiveStart, zoom);
    const itemWidth = Math.max(24, timeToPixels(effectiveDuration, zoom));

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
        className={`absolute top-1 bottom-1 rounded-xl bg-gradient-to-r ${bgGradient} text-white flex items-center justify-between border shadow-md group transition-shadow overflow-hidden ${
          isThisItemActive
            ? 'border-white ring-2 ring-cyan-400 shadow-xl shadow-cyan-500/50 z-30 scale-[1.01]'
            : isSelected
            ? 'border-white ring-2 ring-cyan-400 shadow-cyan-500/30 z-20'
            : 'border-white/20 hover:border-white/60 z-10'
        }`}
        style={{
          left: `${itemLeft}px`,
          width: `${itemWidth}px`,
          willChange: 'left, width',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectItem?.(item.id);
        }}
      >
        {/* AUDIO WAVEFORM BACKGROUND VISUALIZER */}
        {track.type === 'audio' && (
          <AudioWaveformSvg width={itemWidth} height={isMobile ? 48 : 54} seedId={item.id} />
        )}
        {/* LEFT RESIZE HANDLE (Generous 20px hit-zone) */}
        <div
          onMouseDown={(e) => onStartResize(e, item, track, 'left')}
          onTouchStart={(e) => onStartResize(e, item, track, 'left')}
          className="w-5 h-full -ml-1 cursor-ew-resize opacity-90 group-hover:opacity-100 hover:bg-white/30 rounded-l-xl flex items-center justify-center transition-all z-20 shrink-0 select-none"
          title="Kéo mép trái để chỉnh thời lượng bắt đầu"
        >
          <div className="w-1.5 h-6 bg-white/95 rounded-full shadow-md pointer-events-none group-hover:scale-y-110 transition-transform" />
        </div>

        {/* MIDDLE BODY: DRAGGABLE (MOVE) */}
        <div
          onMouseDown={(e) => onStartDragMove(e, item, track)}
          onTouchStart={(e) => onStartDragMove(e, item, track)}
          className="flex-1 h-full truncate px-1.5 text-[11px] font-black flex flex-col justify-center cursor-grab active:cursor-grabbing min-w-0 select-none"
          title="Nhấn giữ & kéo để di chuyển vị trí clip"
        >
          <div className="flex items-center gap-1 truncate pointer-events-none">
            {track.type === 'transitions' && <RefreshCw className="w-3 h-3 shrink-0" />}
            <span className="truncate">{item.title}</span>
          </div>
          <span className="text-[9px] opacity-80 font-mono pointer-events-none">
            ({effectiveDuration.toFixed(2)}s)
          </span>
        </div>

        {/* DELETE BUTTON (IF SELECTED) */}
        {onDeleteItem && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteItem(item.id);
            }}
            className={`p-1.5 hover:bg-rose-500/90 bg-black/60 text-white rounded-lg transition-all ml-1 z-20 flex items-center gap-1 active:scale-90 shrink-0 ${
              isSelected ? 'opacity-100 ring-1 ring-rose-400 shadow-sm' : 'opacity-0 group-hover:opacity-100'
            }`}
            title="Xóa clip này"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-300" />
            {isSelected && <span className="text-[9px] font-bold text-rose-200">Xóa</span>}
          </button>
        )}

        {/* RIGHT RESIZE HANDLE (Generous 20px hit-zone) */}
        <div
          onMouseDown={(e) => onStartResize(e, item, track, 'right')}
          onTouchStart={(e) => onStartResize(e, item, track, 'right')}
          className="w-5 h-full -mr-1 cursor-ew-resize opacity-90 group-hover:opacity-100 hover:bg-white/30 rounded-r-xl flex items-center justify-center transition-all z-20 shrink-0 select-none"
          title="Kéo mép phải để chỉnh thời lượng kết thúc"
        >
          <div className="w-1.5 h-6 bg-white/95 rounded-full shadow-md pointer-events-none group-hover:scale-y-110 transition-transform" />
        </div>
      </div>
    );
  }
);

TimelineClipItem.displayName = 'TimelineClipItem';

// ─────────────────────────────────────────────────────────────────
// 2. ISOLATED MEMOIZED TRACK ROW COMPONENT
// ─────────────────────────────────────────────────────────────────
interface TimelineTrackRowProps {
  track: TimelineTrack;
  zoom: number;
  isMobile: boolean;
  selectedItemId?: string | null;
  activeDrag: ActiveDragState | null;
  onSelectItem?: (itemId: string | null) => void;
  onDeleteItem?: (itemId: string) => void;
  onStartDragMove: (e: React.MouseEvent | React.TouchEvent, item: TimelineItem, track: TimelineTrack) => void;
  onStartResize: (
    e: React.MouseEvent | React.TouchEvent,
    item: TimelineItem,
    track: TimelineTrack,
    direction: 'left' | 'right'
  ) => void;
  onAddScene?: () => void;
  onOpenAudioTab?: () => void;
  onAddCaptionSegment?: () => void;
  onOpenFXTab?: () => void;
}

const TimelineTrackRow = React.memo<TimelineTrackRowProps>(
  ({
    track,
    zoom,
    isMobile,
    selectedItemId,
    activeDrag,
    onSelectItem,
    onDeleteItem,
    onStartDragMove,
    onStartResize,
    onAddScene,
    onOpenAudioTab,
    onAddCaptionSegment,
    onOpenFXTab,
  }) => {
    const lastItem = track.items[track.items.length - 1];
    const lastEndPx = lastItem ? timeToPixels(lastItem.endTime, zoom) : 4;

    return (
      <div
        className={`relative rounded-xl bg-[#141724]/70 border border-[#1E2232]/90 flex items-center ${
          isMobile ? 'h-13' : 'h-14'
        }`}
        style={{ height: isMobile ? '50px' : '56px' }}
      >
        {/* Only display subtle track indicator if track is empty and not video/audio */}
        {track.items.length === 0 && (track.type === 'transitions' || track.type === 'captions') && (
          <div className="absolute left-2 z-10 text-[9px] font-black uppercase text-slate-400 flex items-center gap-1 pointer-events-none bg-[#0D0F18]/90 px-1.5 py-0.5 rounded backdrop-blur-md border border-white/10 shadow-xs">
            {track.type === 'transitions' && (track.id === 'track_fx_1' ? '⚡ FX 2' : '⚡ FX')}
            {track.type === 'captions' && '💬 Caption'}
          </div>
        )}

        {/* Quick Add Button for empty or end of track */}
        {track.type === 'video' && onAddScene && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddScene();
            }}
            style={{ left: `${lastEndPx + 8}px` }}
            className="absolute top-1 bottom-1 px-3 rounded-xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 flex items-center gap-1.5 text-xs font-bold transition-all z-10 cursor-pointer shadow-xs active:scale-95 shrink-0 whitespace-nowrap"
            title="Thêm phân cảnh mới (Scene màu nền hoặc Video/Ảnh)"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Thêm Scene</span>
          </button>
        )}

        {track.type === 'audio' && onOpenAudioTab && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAudioTab();
            }}
            style={{
              left: track.items.length > 0 ? `${lastEndPx + 8}px` : '8px',
            }}
            className="absolute top-1 bottom-1 px-2.5 rounded-xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 flex items-center gap-1 text-[11px] font-black transition-all z-10 cursor-pointer shadow-xs active:scale-95 shrink-0 whitespace-nowrap"
            title="Thêm nhạc nền hoặc giọng đọc AI"
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            <span>Thêm Nhạc / Voice</span>
          </button>
        )}

        {track.type === 'captions' && onAddCaptionSegment && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddCaptionSegment();
            }}
            style={{
              left: track.items.length > 0 ? `${lastEndPx + 8}px` : '8px',
            }}
            className="absolute top-1 bottom-1 px-2.5 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex items-center gap-1 text-[11px] font-black transition-all z-10 cursor-pointer shadow-xs active:scale-95 shrink-0 whitespace-nowrap"
            title="Thêm phân đoạn chữ/phụ đề"
          >
            <Plus className="w-3 h-3 text-amber-400" />
            <span>Thêm Chữ / Sub</span>
          </button>
        )}

        {track.items.map((item) => (
          <TimelineClipItem
            key={item.id}
            item={item}
            track={track}
            zoom={zoom}
            isSelected={selectedItemId === item.id}
            isMobile={isMobile}
            activeDrag={activeDrag}
            onSelectItem={onSelectItem}
            onDeleteItem={onDeleteItem}
            onStartDragMove={onStartDragMove}
            onStartResize={onStartResize}
          />
        ))}
      </div>
    );
  }
);

TimelineTrackRow.displayName = 'TimelineTrackRow';

// ─────────────────────────────────────────────────────────────────
// 3. MAIN MULTI-TRACK TIMELINE SLIDER COMPONENT
// ─────────────────────────────────────────────────────────────────
export const MultiTrackTimelineSlider: React.FC<MultiTrackTimelineSliderProps> = ({
  currentTime,
  totalDuration = 15.0,
  isPlaying,
  onPlayPause,
  onSeek,
  tracks = [],
  onUpdateItemDuration,
  onUpdateItemEnd,
  onSelectItem,
  onDeleteItem,
  selectedItemId,
  onOpenFXTab,
  onAddScene,
  onOpenAudioTab,
  onAddCaptionSegment,
  isMobile = false,
  zoomLevel,
  onZoomChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Active drag/resize state (maintained in local state for 60fps instant UI updates)
  const [activeDrag, setActiveDrag] = useState<ActiveDragState | null>(null);
  const activeDragRef = useRef<ActiveDragState | null>(null);
  activeDragRef.current = activeDrag;

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const updateW = () => {
      if (el && el.clientWidth > 0) {
        setContainerWidth(el.clientWidth);
      }
    };
    updateW();
    const ro = new ResizeObserver(updateW);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const basePixelsPerSec = isMobile ? 45 : 85;

  // Auto-calculated fitZoom: exact zoom factor so totalDuration fills available container width
  const fitZoom = useMemo(() => {
    if (!containerWidth || containerWidth <= 0 || !totalDuration || totalDuration <= 0) return 0.5;
    const availableW = Math.max(300, containerWidth - 32);
    const targetPxPerSec = availableW / totalDuration;
    const calc = targetPxPerSec / basePixelsPerSec;
    return parseFloat(Math.max(0.15, Math.min(3.5, calc)).toFixed(2));
  }, [containerWidth, totalDuration, basePixelsPerSec]);

  const [hasUserCustomizedZoom, setHasUserCustomizedZoom] = useState<boolean>(false);
  const [internalZoom, setInternalZoom] = useState<number>(fitZoom);

  useEffect(() => {
    if (!hasUserCustomizedZoom && fitZoom > 0) {
      setInternalZoom(fitZoom);
      onZoomChange?.(fitZoom);
    }
  }, [fitZoom, hasUserCustomizedZoom]);

  const activeZoom = zoomLevel !== undefined ? zoomLevel : internalZoom;

  const handleZoomUpdate = (newVal: number) => {
    setHasUserCustomizedZoom(true);
    const clamped = Math.max(0.15, Math.min(3.5, parseFloat(newVal.toFixed(2))));
    setInternalZoom(clamped);
    onZoomChange?.(clamped);
  };

  const zoom = basePixelsPerSec * activeZoom;
  const totalWidth = Math.max(
    containerWidth > 0 ? containerWidth - 2 : (isMobile ? 360 : 900),
    totalDuration * zoom
  );

  // Keyboard shortcut listener for Delete / Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Handle Playhead Scrubbing via Timeline background click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If a drag action was just finished, ignore the click to prevent playhead jumping
    if (isDraggingRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left + (scrollContainerRef.current?.scrollLeft || 0);
    const newTime = snapToGrid(pixelsToTime(clickX, zoom), 0.05);
    onSeek(Math.max(0, Math.min(totalDuration, newTime)));
  };

  // 1. DRAG MOVE (ITEM BODY)
  const handleStartDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent, item: TimelineItem, track: TimelineTrack) => {
      e.stopPropagation();
      onSelectItem?.(item.id);
      isDraggingRef.current = true;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const newDrag: ActiveDragState = {
        itemId: item.id,
        trackId: track.id,
        type: 'move',
        origStart: item.startTime,
        origDur: item.duration,
        currentStart: item.startTime,
        currentDur: item.duration,
        startClientX: clientX,
        clientX,
        clientY,
      };

      setActiveDrag(newDrag);

      const onMove = (moveEvt: MouseEvent | TouchEvent) => {
        const curX = 'touches' in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX;
        const curY = 'touches' in moveEvt ? moveEvt.touches[0].clientY : moveEvt.clientY;
        const deltaX = curX - clientX;
        const deltaTime = pixelsToTime(deltaX, zoom);
        const newStart = Math.max(
          0,
          Math.min(totalDuration - item.duration, snapToGrid(item.startTime + deltaTime, 0.05))
        );

        setActiveDrag((prev) =>
          prev
            ? {
                ...prev,
                currentStart: newStart,
                clientX: curX,
                clientY: curY,
              }
            : null
        );
      };

      const onEnd = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);

        const curDrag = activeDragRef.current;
        if (curDrag && (curDrag.currentStart !== curDrag.origStart || curDrag.currentDur !== curDrag.origDur)) {
          onUpdateItemDuration(curDrag.itemId, curDrag.currentStart, curDrag.currentDur);
          onUpdateItemEnd?.(curDrag.itemId);
        }

        setActiveDrag(null);
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 120);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onEnd);
    },
    [onSelectItem, zoom, totalDuration, onUpdateItemDuration, onUpdateItemEnd]
  );

  // 2. RESIZE (ITEM LEFT OR RIGHT EDGE)
  const handleStartResize = useCallback(
    (
      e: React.MouseEvent | React.TouchEvent,
      item: TimelineItem,
      track: TimelineTrack,
      direction: 'left' | 'right'
    ) => {
      e.stopPropagation();
      onSelectItem?.(item.id);
      isDraggingRef.current = true;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const newDrag: ActiveDragState = {
        itemId: item.id,
        trackId: track.id,
        type: direction === 'left' ? 'resize-left' : 'resize-right',
        origStart: item.startTime,
        origDur: item.duration,
        currentStart: item.startTime,
        currentDur: item.duration,
        startClientX: clientX,
        clientX,
        clientY,
      };

      setActiveDrag(newDrag);

      const onMove = (moveEvt: MouseEvent | TouchEvent) => {
        const curX = 'touches' in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX;
        const curY = 'touches' in moveEvt ? moveEvt.touches[0].clientY : moveEvt.clientY;
        const deltaX = curX - clientX;
        const deltaTime = pixelsToTime(deltaX, zoom);

        let calcStart = item.startTime;
        let calcDur = item.duration;

        if (direction === 'right') {
          // For video/media clips, allow stretching up to original clip length (or composition max),
          // instead of clamping to current totalDuration which prevents dragging back up!
          const maxAllowed = item.params?.maxDuration || (track.type === 'video' ? 600 : Math.max(totalDuration - item.startTime, 600));
          calcDur = Math.max(0.2, Math.min(maxAllowed, snapToGrid(item.duration + deltaTime, 0.05)));
        } else {
          const origEnd = item.startTime + item.duration;
          calcStart = Math.max(0, Math.min(origEnd - 0.2, snapToGrid(item.startTime + deltaTime, 0.05)));
          calcDur = Math.max(0.2, snapToGrid(origEnd - calcStart, 0.05));
        }

        setActiveDrag((prev) =>
          prev
            ? {
                ...prev,
                currentStart: calcStart,
                currentDur: calcDur,
                clientX: curX,
                clientY: curY,
              }
            : null
        );
      };

      const onEnd = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);

        const curDrag = activeDragRef.current;
        if (curDrag && (curDrag.currentStart !== curDrag.origStart || curDrag.currentDur !== curDrag.origDur)) {
          onUpdateItemDuration(curDrag.itemId, curDrag.currentStart, curDrag.currentDur);
          onUpdateItemEnd?.(curDrag.itemId);
        }

        setActiveDrag(null);
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 120);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onEnd);
    },
    [onSelectItem, zoom, totalDuration, onUpdateItemDuration, onUpdateItemEnd]
  );

  // Ruler Marks
  const rulerMarks = useMemo(() => {
    const marks: number[] = [];
    const step = activeZoom < 0.8 ? 2 : 1;
    for (let s = 0; s <= totalDuration; s += step) {
      marks.push(s);
    }
    return marks;
  }, [totalDuration, activeZoom]);

  const playheadLeft = timeToPixels(currentTime, zoom);

  return (
    <div className={`w-full flex-1 min-h-0 bg-[#0D0F18] border-t border-[#1E2232] flex flex-col select-none ${isMobile ? 'text-xs' : 'text-sm'}`}>
      {/* ─────────────────────────────────────────────────────────────
          1. TOP CONTROL BAR (SINGLE COMPACT ROW: PLAY + SCRUBBER | QUICK ADD | ZOOM + TIMESTAMPS)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121522] border-b border-[#1E2232] gap-2.5 shrink-0 h-9">
        {/* Left: Play/Pause Button + Time Scrubber Slider */}
        <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-sm">
          <button
            onClick={onPlayPause}
            className="p-1 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 hover:brightness-110 shadow-md font-bold transition-all shrink-0 active:scale-95"
            title={isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
          </button>

          {/* Interactive Time Scrubber Slider */}
          <input
            type="range"
            min={0}
            max={Math.max(0.1, totalDuration)}
            step={0.02}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1 bg-[#1F2438] rounded-lg cursor-pointer transition-all"
            title="Kéo để tua nhanh thời gian phát"
          />
        </div>

        {/* Center: Quick Add Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onAddScene && (
            <button
              type="button"
              onClick={onAddScene}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-black transition-all active:scale-95 shadow-xs"
              title="Thêm phân cảnh mới (Scene màu nền hoặc Video/Ảnh)"
            >
              <Plus className="w-2.5 h-2.5 text-cyan-400" />
              <span className="hidden sm:inline">+ Scene</span>
            </button>
          )}
          {onOpenAudioTab && (
            <button
              type="button"
              onClick={onOpenAudioTab}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-black transition-all active:scale-95 shadow-xs"
              title="Thêm nhạc nền hoặc giọng đọc AI"
            >
              <Music className="w-2.5 h-2.5 text-emerald-400" />
              <span className="hidden sm:inline">+ Audio</span>
            </button>
          )}
          {onAddCaptionSegment && (
            <button
              type="button"
              onClick={onAddCaptionSegment}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-black transition-all active:scale-95 shadow-xs"
              title="Thêm phân đoạn phụ đề / chữ tại vị trí con trỏ"
            >
              <Type className="w-2.5 h-2.5 text-amber-400" />
              <span className="hidden sm:inline">+ Sub</span>
            </button>
          )}
          {selectedItemId && onDeleteItem && (
            <button
              onClick={() => onDeleteItem(selectedItemId)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black transition-all shadow-md active:scale-95 shrink-0"
              title="Xóa clip đang chọn"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>Xóa</span>
            </button>
          )}
        </div>

        {/* Right: Zoom Controls & Timestamp Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-[#090B12] px-1.5 py-0.5 rounded-lg border border-[#1E2232]">
            <button
              onClick={() => handleZoomUpdate(activeZoom - 0.1)}
              className="p-0.5 text-slate-400 hover:text-white rounded transition-colors"
              title="Thu nhỏ timeline (-)"
            >
              <ZoomOut className="w-2.5 h-2.5" />
            </button>
            <input
              type="range"
              min="0.15"
              max="3.5"
              step="0.05"
              value={activeZoom}
              onChange={(e) => handleZoomUpdate(parseFloat(e.target.value))}
              className="w-12 sm:w-16 accent-cyan-400 h-1 bg-[#1F2438] rounded-lg cursor-pointer"
            />
            <button
              onClick={() => handleZoomUpdate(activeZoom + 0.1)}
              className="p-0.5 text-slate-400 hover:text-white rounded transition-colors"
              title="Phóng to timeline (+)"
            >
              <ZoomIn className="w-2.5 h-2.5" />
            </button>
            <span className="text-[9px] font-mono text-cyan-400 font-bold ml-0.5 min-w-[28px]">
              {Math.round(activeZoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => {
                setHasUserCustomizedZoom(false);
                handleZoomUpdate(fitZoom);
              }}
              className="px-1 py-0.2 text-[8px] font-bold rounded bg-[#192238] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all"
              title="Khớp toàn bộ chiều ngang màn hình (Fit to Screen Width)"
            >
              Fit
            </button>
          </div>

          <div className="font-mono text-[10px] font-bold tracking-wide text-slate-300">
            <span className="text-cyan-400">{formatTimestamp(currentTime)}</span>
            <span className="text-slate-500 mx-0.5">/</span>
            <span className="text-slate-400">{formatTimestamp(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MULTI-TRACKS CONTAINER (ISOLATED TRACK ROWS & 60FPS PLAYHEAD)
          ───────────────────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        onClick={handleTimelineClick}
        className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-auto relative bg-[#090B12] cursor-crosshair studio-scrollbar"
      >
        <div className="relative py-1.5" style={{ width: `${totalWidth}px` }}>
          {/* Ruler */}
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

          {/* 4 Track Rows (Isolated and Memoized) */}
          <div className="flex flex-col gap-1.5 py-1.5">
            {tracks.map((track) => (
              <TimelineTrackRow
                key={track.id}
                track={track}
                zoom={zoom}
                isMobile={isMobile}
                selectedItemId={selectedItemId}
                activeDrag={activeDrag}
                onSelectItem={onSelectItem}
                onDeleteItem={onDeleteItem}
                onStartDragMove={handleStartDragMove}
                onStartResize={handleStartResize}
                onAddScene={onAddScene}
                onOpenAudioTab={onOpenAudioTab}
                onAddCaptionSegment={onAddCaptionSegment}
                onOpenFXTab={onOpenFXTab}
              />
            ))}
          </div>

          {/* Playhead Needle Indicator */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
            style={{
              left: `${playheadLeft}px`,
              willChange: 'left',
            }}
          >
            <div className="w-3.5 h-3.5 bg-cyan-400 rotate-45 -mt-1 shadow-lg shadow-cyan-400/60" />
            <div className="w-[2px] flex-1 bg-cyan-400 shadow-md shadow-cyan-400/90" />
          </div>
        </div>
      </div>

      {/* Floating Timecode Tooltip during Clip Drag / Resize */}
      {activeDrag && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-12 px-2.5 py-1 bg-[#090C15]/95 text-cyan-300 border border-cyan-500/50 rounded-xl shadow-2xl backdrop-blur-md text-[11px] font-mono font-bold flex items-center gap-1.5 ring-1 ring-white/10 select-none animate-in fade-in zoom-in-95 duration-100"
          style={{ left: activeDrag.clientX, top: activeDrag.clientY }}
        >
          <span className="text-white">{formatTimestamp(activeDrag.currentStart)}</span>
          <span className="text-slate-500">➔</span>
          <span className="text-white">
            {formatTimestamp(activeDrag.currentStart + activeDrag.currentDur)}
          </span>
          <span className="text-cyan-400 font-extrabold bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-500/30 ml-0.5">
            ({activeDrag.currentDur.toFixed(2)}s)
          </span>
        </div>
      )}
    </div>
  );
};
