import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

interface ExportProgressModalProps {
  isExporting: boolean;
  exportStatusText: string;
  exportElapsedSec: number;
  exportProgress: number;
}

export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  isExporting,
  exportStatusText,
  exportElapsedSec,
  exportProgress,
}) => {
  if (!isExporting) return null;

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div className="bg-[#161926] border border-[#2B334B] rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/25 animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-black text-white">Exporting Video</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            {exportStatusText &&
            !exportStatusText.includes('Playwright') &&
            !exportStatusText.includes('Chromium') &&
            !exportStatusText.includes('Đang')
              ? exportStatusText
              : 'Rendering watercolor strokes, pencil sketches & syncing audio...'}
          </p>
        </div>

        {/* Timer Badge (Counts seconds up to max 10:00) */}
        <div className="flex items-center justify-center gap-2 py-1.5 px-4 rounded-full bg-[#1F2538] border border-[#2F374E] text-xs font-mono text-cyan-300 font-bold shadow-inner">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>Time: {formatElapsed(exportElapsedSec)} / Max 10:00</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-3 bg-[#202538] rounded-full overflow-hidden p-0.5 border border-[#2B334B]">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-full transition-all duration-150"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-bold">
            <span>Rendering frames...</span>
            <span className="text-cyan-400 font-black">{exportProgress}%</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Please keep this browser tab open. Your video will download automatically once completed!
        </p>
      </div>
    </div>
  );
};
