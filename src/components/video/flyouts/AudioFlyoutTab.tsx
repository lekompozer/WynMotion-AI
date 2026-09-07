'use client';

import React from 'react';
import { X, Radio, Play, Pause, Volume2, Music, Upload } from 'lucide-react';

export interface AudioTrackItem {
  id: string;
  label: string;
  flag: string;
  url: string;
  langCode?: string;
  lang?: string;
}

export interface AudioFlyoutTabProps {
  onClose: () => void;
  availableAudioTracks: AudioTrackItem[] | any[];
  selectedExportAudioUrl?: string;
  previewPlayingAudioId: string | null;
  onSelectAndSyncAudio: (track: any, syncTimeline: boolean) => void;
  onToggleAudioPreview: (track: any) => void;
  volume: number;
  setVolume: (vol: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  bgmVolume: number;
  setBgmVolume: (vol: number) => void;
  customBgmFile: string | null;
  onUploadCustomBgm: (fileName: string) => void;
}

export const AudioFlyoutTab: React.FC<AudioFlyoutTabProps> = ({
  onClose,
  availableAudioTracks,
  selectedExportAudioUrl,
  previewPlayingAudioId,
  onSelectAndSyncAudio,
  onToggleAudioPreview,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  bgmVolume,
  setBgmVolume,
  customBgmFile,
  onUploadCustomBgm,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1 border-b border-[#22273B]">
        <h3 className="text-sm font-black text-white">Audio & Voiceover Tracks</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Available Slide Voiceovers */}
      {availableAudioTracks.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#161926] border border-[#22273B] space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Giọng đọc của Slide ({availableAudioTracks.length})</span>
            </span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 studio-scrollbar">
            {availableAudioTracks.map((track) => {
              const isSelected = selectedExportAudioUrl === track.url;
              const isPlaying = previewPlayingAudioId === track.id;
              return (
                <div
                  key={track.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all border ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-black'
                      : 'bg-[#1D2132] text-slate-300 border-[#282F45] hover:bg-[#252B3E]'
                  }`}
                >
                  <div
                    className="flex items-center gap-2 truncate cursor-pointer flex-1 mr-2"
                    onClick={() => onSelectAndSyncAudio(track, false)}
                  >
                    <span className="text-base">{track.flag}</span>
                    <span className="truncate">{track.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleAudioPreview(track);
                      }}
                      className={`p-1.5 rounded-lg transition-all ${
                        isPlaying
                          ? 'bg-cyan-500 text-slate-950 animate-pulse'
                          : 'text-slate-400 hover:text-white hover:bg-[#2A3147]'
                      }`}
                      title={isPlaying ? 'Dừng phát' : 'Nghe thử'}
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectAndSyncAudio(track, true)}
                      title="Kích hoạt audio này và đồng bộ animation timeline"
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        isSelected
                          ? 'bg-cyan-400 text-slate-950'
                          : 'bg-[#2A3147] text-slate-300 hover:bg-cyan-500 hover:text-slate-950'
                      }`}
                    >
                      {isSelected ? 'Đang chọn' : 'Dùng & Sync'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Voiceover Volume Slider */}
      <div className="p-3.5 rounded-2xl bg-[#161926] border border-[#22273B] space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-teal-400" />
            <span>Âm lượng Giọng đọc (Voiceover)</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-teal-400">{Math.round(volume * 100)}%</span>
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isMuted ? 'bg-rose-500/20 text-rose-300' : 'bg-[#252B3E] text-slate-300'
              }`}
            >
              {isMuted ? 'Đã tắt' : 'Tắt'}
            </button>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setIsMuted(false);
            setVolume(parseFloat(e.target.value));
          }}
          className="w-full accent-teal-400 h-1.5 bg-[#252B3E] rounded-lg"
        />
      </div>

      {/* BGM Volume Slider */}
      <div className="p-3.5 rounded-2xl bg-[#161926] border border-[#22273B] space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Music className="w-4 h-4 text-orange-400" />
            <span>Nhạc nền BGM (Music)</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-orange-400">{Math.round(bgmVolume * 100)}%</span>
            {bgmVolume > 0 && (
              <button
                type="button"
                onClick={() => setBgmVolume(0)}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#252B3E] text-rose-300 hover:bg-rose-500/20"
              >
                Xóa BGM
              </button>
            )}
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={bgmVolume}
          onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
          className="w-full accent-orange-400 h-1.5 bg-[#252B3E] rounded-lg"
        />
      </div>

      {/* Custom BGM Upload */}
      <label className="p-3 rounded-2xl border border-dashed border-[#2F374E] hover:border-orange-500 bg-[#161926] cursor-pointer flex flex-col items-center justify-center gap-1 text-xs text-slate-300 transition-all">
        <Upload className="w-4 h-4 text-orange-400" />
        <span className="font-bold">Upload Custom BGM MP3</span>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUploadCustomBgm(file.name);
          }}
          className="hidden"
        />
      </label>
      {customBgmFile && (
        <p className="text-[11px] text-emerald-400 font-bold">✓ Đã nạp: {customBgmFile}</p>
      )}
    </div>
  );
};
