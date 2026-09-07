import React from 'react';
import { Download, X, Radio, Crown, Play, Pause } from 'lucide-react';

interface AudioTrack {
  id: string;
  label: string;
  flag: string;
  url: string;
  langCode?: string;
  lang?: string;
}

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAudioTracks: AudioTrack[] | any[];
  selectedAudioUrl: string;
  onSelectAudioUrl: (url: string) => void;
  selectedAspectRatio: '16:9' | '9:16' | '1:1';
  onSelectAspectRatio: (ratio: '16:9' | '9:16' | '1:1') => void;
  selectedResolution: '1080p' | '4k';
  onSelectResolution: (res: '1080p' | '4k') => void;
  selectedBgColor: string;
  onSelectBgColor: (color: string) => void;
  bgThemes: Array<{ color: string; label: string }>;
  previewPlayingAudioId: string | null;
  onToggleAudioPreview: (track: any) => void;
  onStartExport: (audioUrl: string, ratio: '16:9' | '9:16' | '1:1', bgColor: string) => void;
}

export const ExportVideoModal: React.FC<ExportVideoModalProps> = ({
  isOpen,
  onClose,
  availableAudioTracks,
  selectedAudioUrl,
  onSelectAudioUrl,
  selectedAspectRatio,
  onSelectAspectRatio,
  selectedResolution,
  onSelectResolution,
  selectedBgColor,
  onSelectBgColor,
  bgThemes,
  previewPlayingAudioId,
  onToggleAudioPreview,
  onStartExport,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#141724] border border-[#2B334B] rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col space-y-5 text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#22283A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Xuất Video MP4 Hoạt Họa</h3>
              <p className="text-[11px] text-slate-400">Chọn giọng đọc audio và cấu hình trước khi xuất</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#202638] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SECTION 1: AUDIO TRACK SELECTION */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. Chọn Giọng Đọc / Audio Khả Dụng ({availableAudioTracks.length})</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Tạo nhiều bản ngôn ngữ cho 1 bộ ảnh</span>
          </label>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableAudioTracks.length > 0 ? (
              availableAudioTracks.map((track) => {
                const isSelected = selectedAudioUrl === track.url;
                const isPlaying = previewPlayingAudioId === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => onSelectAudioUrl(track.url)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                        : 'bg-[#1A1E2D] border-[#252B3E] hover:bg-[#22273B] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                      <span className="text-xl">{track.flag}</span>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {track.label}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">
                          {track.url.split('/').pop() || 'audio-track.wav'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleAudioPreview(track);
                      }}
                      className={`p-2 rounded-xl transition-all flex items-center gap-1 text-[11px] font-bold ${
                        isPlaying
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 animate-pulse'
                          : 'bg-[#262C40] text-slate-300 hover:text-white hover:bg-[#323A54]'
                      }`}
                      title={isPlaying ? 'Dừng phát' : 'Nghe thử'}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Đang phát' : 'Nghe thử'}</span>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#1A1E2D] border border-[#252B3E] text-xs text-slate-400 flex items-center gap-2">
                <span>🎧</span>
                <span>Sử dụng Audio hiện tại của Slide</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: ASPECT RATIO */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 block">2. Tỉ Lệ Khung Hình</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '16:9', label: '16:9 (Ngang)', icon: '🖥️', desc: 'YouTube, Web, TV' },
              { id: '9:16', label: '9:16 (Dọc)', icon: '📱', desc: 'TikTok, Reels, Shorts' },
              { id: '1:1', label: '1:1 (Vuông)', icon: '⏹️', desc: 'Instagram, Feed' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectAspectRatio(item.id as any)}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  selectedAspectRatio === item.id
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-black'
                    : 'bg-[#1A1E2D] border-[#252B3E] text-slate-300 hover:bg-[#22273B]'
                }`}
              >
                <div className="text-base mb-1">{item.icon}</div>
                <p className="text-xs font-bold">{item.label}</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 2.5: RESOLUTION (FULL HD vs 4K VIP) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
            <span>3. Chất Lượng Render Video</span>
            <span className="text-[10px] text-amber-400 font-bold">Native 4K Retina Support</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSelectResolution('1080p')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedResolution === '1080p'
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-black'
                  : 'bg-[#1A1E2D] border-[#252B3E] text-slate-300 hover:bg-[#22273B]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Full HD (1080p)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#252B3E] text-slate-400">Tiêu chuẩn</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Xuất cực nhanh ~20s, tương thích mọi máy</p>
            </button>
            <button
              type="button"
              onClick={() => onSelectResolution('4k')}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                selectedResolution === '4k'
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/50 text-amber-300 font-black ring-1 ring-amber-400/30'
                  : 'bg-[#1A1E2D] border-[#252B3E] text-slate-300 hover:bg-[#22273B]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1">
                  <span>4K Ultra HD</span>
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  VIP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Retina 3840x2160 siêu nét từng chi tiết</p>
            </button>
          </div>
        </div>

        {/* SECTION 3: BACKGROUND COLOR */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 block">4. Màu Nền Giấy (Paper Theme)</label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {bgThemes.map((theme) => (
              <button
                key={theme.color}
                type="button"
                onClick={() => onSelectBgColor(theme.color)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${
                  selectedBgColor === theme.color
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                    : 'border-[#252B3E] bg-[#1A1E2D] text-slate-300 hover:bg-[#22273B]'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full border border-slate-500" style={{ backgroundColor: theme.color }} />
                <span>{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#22283A]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-[#202638] transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => onStartExport(selectedAudioUrl, selectedAspectRatio, selectedBgColor)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Bắt Đầu Xuất Video MP4</span>
          </button>
        </div>
      </div>
    </div>
  );
};
