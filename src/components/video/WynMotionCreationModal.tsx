import React, { useState, useEffect } from 'react';
import { Loader2, Minimize2, Maximize2, Sparkles, CheckCircle2, AlertCircle, Clock, Film } from 'lucide-react';

interface WynMotionCreationModalProps {
  isOpen: boolean;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  statusMessage: string;
  progressPercent: number;
  remainingSeconds: number;
  projectTitle?: string;
  visualStyle?: string;
  onCancel?: () => void;
  error?: string | null;
}

export const WynMotionCreationModal: React.FC<WynMotionCreationModalProps> = ({
  isOpen,
  isMinimized,
  onToggleMinimize,
  statusMessage,
  progressPercent,
  remainingSeconds,
  projectTitle = 'Video Hoạt Họa AI',
  visualStyle,
  onCancel,
  error,
}) => {
  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ── MINIMIZED FLOATING PILL ──────────────────────────────────────────────
  if (isMinimized) {
    return (
      <aside
        aria-label="Tiến trình tạo video ngầm"
        onClick={onToggleMinimize}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-950/90 border border-cyan-500/40 rounded-full shadow-2xl shadow-cyan-500/20 backdrop-blur-xl cursor-pointer hover:border-cyan-400 transition-all hover:scale-105 group"
      >
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          <span className="absolute w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-100 tracking-wide">
              Đang tạo video ({Math.round(progressPercent)}%)
            </span>
            <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/50">
              {formatTime(remainingSeconds)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 max-w-[180px] truncate">
            {statusMessage || 'Đang xử lý ngầm...'}
          </span>
        </div>
        <div className="p-1 rounded-full bg-slate-800/60 text-slate-400 group-hover:text-white transition-colors">
          <Maximize2 className="w-4 h-4" />
        </div>
      </aside>
    );
  }

  // ── FULL CENTERED MODAL ──────────────────────────────────────────────────
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="creation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar with Minimize Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Film className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {visualStyle === 'product_ads_motion' ? 'Quảng Cáo Visual Ads' : 'WynMotion AI Studio'}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleMinimize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/50 transition-all active:scale-95 cursor-pointer"
            title="Ẩn xuống góc màn hình và tiếp tục làm việc"
          >
            <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ẩn xuống nền</span>
          </button>
        </div>

        {/* Center Content */}
        <div className="py-8 flex flex-col items-center text-center relative z-10">
          {/* Animated Spinner Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              {error ? (
                <AlertCircle className="w-10 h-10 text-rose-400 animate-bounce" />
              ) : (
                <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
              )}
            </div>
            {!error && (
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-30 blur-sm animate-pulse -z-10" />
            )}
          </div>

          {/* Title & Stage */}
          <h3 id="creation-modal-title" className="text-lg font-black text-white tracking-tight mb-2">
            {error ? 'Quá Trình Tạo Gặp Sự Cố' : 'Đang Kiến Tạo Video Hoạt Họa'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-6 font-medium">
            {error || statusMessage || 'Hệ thống AI đang phân tích dữ liệu, bóc tách vật thể SAM 2 và tính toán chuyển động...'}
          </p>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Thời gian tối đa:</span>
            <span className="text-sm font-mono font-black text-cyan-400 tracking-wider">
              {formatTime(remainingSeconds)}
            </span>
          </div>

          {/* Glowing Progress Bar */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
              <span>Tiến độ xử lý</span>
              <span className="text-cyan-400 font-mono">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-700 ease-out shadow-sm shadow-cyan-400/50"
                style={{ width: `${Math.max(5, Math.min(100, progressPercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom hint & Cancel */}
        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between relative z-10">
          <span className="text-[11px] text-slate-500">
            Tự động kiểm tra trạng thái mỗi 8-10 giây
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-semibold"
            >
              Hủy bỏ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
