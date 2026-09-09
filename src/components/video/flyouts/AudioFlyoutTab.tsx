'use client';

import React, { useRef } from 'react';
import { X, Radio, Play, Pause, Volume2, Music, Upload, Trash2, CheckCircle2, Clock, Film } from 'lucide-react';

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
  availableAudioTracks?: AudioTrackItem[] | any[];
  selectedExportAudioUrl?: string;
  previewPlayingAudioId?: string | null;
  onSelectAndSyncAudio?: (track: any, syncTimeline: boolean) => void;
  onToggleAudioPreview?: (track: any) => void;
  volume: number;
  setVolume: (vol: number) => void;
  isMuted?: boolean;
  setIsMuted?: (muted: boolean) => void;
  bgmVolume: number;
  setBgmVolume: (vol: number) => void;
  customBgmFile?: string | null;
  onUploadCustomBgm?: (fileName: string) => void;
  // Enhanced props for full voice & BGM management
  activeVoiceUrl?: string | null;
  voiceDurationSec?: number;
  onUploadVoiceFile?: (file: File) => void;
  onRemoveVoice?: () => void;
  activeBgmUrl?: string | null;
  bgmTrackTitle?: string | null;
  onUploadBgmFile?: (file: File) => void;
  onRemoveBgm?: () => void;
  onOpenMusicLibrary?: () => void;
  bgmOffsetSec?: number;
  setBgmOffsetSec?: (offset: number) => void;
  bgmTotalDurationSec?: number;
  videoAudioVolume?: number;
  setVideoAudioVolume?: (vol: number) => void;
  isVideoAudioMuted?: boolean;
  setIsVideoAudioMuted?: (muted: boolean) => void;
  onExtractAudioFromScene?: (sceneIdOrIndex?: string | number) => Promise<string | undefined>;
  scenes?: any[];
}

export const AudioFlyoutTab: React.FC<AudioFlyoutTabProps> = ({
  onClose,
  availableAudioTracks = [],
  selectedExportAudioUrl,
  previewPlayingAudioId,
  onSelectAndSyncAudio,
  onToggleAudioPreview,
  volume,
  setVolume,
  isMuted = false,
  setIsMuted,
  bgmVolume,
  setBgmVolume,
  customBgmFile,
  onUploadCustomBgm,
  activeVoiceUrl,
  voiceDurationSec,
  onUploadVoiceFile,
  onRemoveVoice,
  activeBgmUrl,
  bgmTrackTitle,
  onUploadBgmFile,
  onRemoveBgm,
  onOpenMusicLibrary,
  bgmOffsetSec = 0,
  setBgmOffsetSec,
  bgmTotalDurationSec,
  videoAudioVolume = 1.0,
  setVideoAudioVolume,
  isVideoAudioMuted = false,
  setIsVideoAudioMuted,
  onExtractAudioFromScene,
  scenes,
}) => {
  const voiceFileInputRef = useRef<HTMLInputElement | null>(null);
  const bgmFileInputRef = useRef<HTMLInputElement | null>(null);

  const hasVoice = Boolean(activeVoiceUrl || selectedExportAudioUrl);
  const hasBgm = Boolean(activeBgmUrl || customBgmFile);
  const hasVideoScenes = Boolean(scenes?.some((s: any) => s.video_url));

  const handleVoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadVoiceFile) {
      onUploadVoiceFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleBgmFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onUploadBgmFile) {
        onUploadBgmFile(file);
      } else if (onUploadCustomBgm) {
        onUploadCustomBgm(file.name);
      }
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={voiceFileInputRef}
        accept="audio/*"
        onChange={handleVoiceFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={bgmFileInputRef}
        accept="audio/*"
        onChange={handleBgmFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between pb-1 border-b border-[#22273B]">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Quản Lý Âm Thanh & Audio Tracks</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Voiceover, BGM & Original Video Audio Mixer
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. VOICEOVER TRACK (GIỌNG ĐỌC / LỜI THOẠI) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-[#141724] border border-[#282F45] space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
            <span className="text-xs font-black text-white">
              🎙️ Giọng Đọc / Lời Thoại (Voiceover Track)
            </span>
          </div>
          {hasVoice && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-md font-bold">
              {voiceDurationSec ? `${voiceDurationSec.toFixed(1)}s` : 'Active'}
            </span>
          )}
        </div>

        {/* Current Voice Status Box */}
        <div className="p-2.5 rounded-xl bg-[#0E1017] border border-[#23293D] flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-200 truncate">
              {hasVoice ? 'Đã có file giọng đọc hoạt động' : 'Chưa có file giọng đọc'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
              {activeVoiceUrl || selectedExportAudioUrl || 'Hỗ trợ .mp3, .wav, .m4a, .aac, .ogg'}
            </p>
          </div>
          {hasVoice && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
        </div>

        {/* Voiceover Actions: Upload File, Delete, and Extract from Scene Video */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => voiceFileInputRef.current?.click()}
            className="py-2 px-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{hasVoice ? 'Đổi File Giọng' : 'Tải File Giọng (.mp3)'}</span>
          </button>

          <button
            type="button"
            disabled={!hasVoice}
            onClick={onRemoveVoice}
            className="py-2 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Xoá Giọng Đọc</span>
          </button>
        </div>

        {/* Extract Audio from Scene Video Button */}
        {hasVideoScenes && onExtractAudioFromScene && (
          <button
            type="button"
            onClick={() => onExtractAudioFromScene()}
            className="w-full py-2 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Trích xuất âm thanh từ video phân cảnh làm voice track"
          >
            <Film className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tách MP3 từ Video Phân Cảnh</span>
          </button>
        )}

        {/* Available Slide Voiceovers (Multilingual AI Tracks) */}
        {availableAudioTracks.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-[#23293D]">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>Giọng AI có sẵn trong dự án ({availableAudioTracks.length}):</span>
            </span>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 studio-scrollbar">
              {availableAudioTracks.map((track) => {
                const isSelected = selectedExportAudioUrl === track.url;
                const isPlaying = previewPlayingAudioId === track.id;
                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all border ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-black'
                        : 'bg-[#1D2132] text-slate-300 border-[#282F45] hover:bg-[#252B3E]'
                    }`}
                  >
                    <div
                      className="flex items-center gap-1.5 truncate cursor-pointer flex-1 mr-2"
                      onClick={() => onSelectAndSyncAudio?.(track, false)}
                    >
                      <span className="text-sm">{track.flag}</span>
                      <span className="truncate text-[11px]">{track.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {onToggleAudioPreview && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleAudioPreview(track);
                          }}
                          className={`p-1 rounded-lg transition-all ${
                            isPlaying
                              ? 'bg-cyan-500 text-slate-950 animate-pulse'
                              : 'text-slate-400 hover:text-white hover:bg-[#2A3147]'
                          }`}
                          title={isPlaying ? 'Dừng phát' : 'Nghe thử'}
                        >
                          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                      )}
                      {onSelectAndSyncAudio && (
                        <button
                          type="button"
                          onClick={() => onSelectAndSyncAudio(track, true)}
                          title="Kích hoạt audio này và đồng bộ animation timeline"
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                            isSelected
                              ? 'bg-cyan-400 text-slate-950'
                              : 'bg-[#2A3147] text-slate-300 hover:bg-cyan-500 hover:text-slate-950'
                          }`}
                        >
                          {isSelected ? 'Đang chọn' : 'Dùng'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Voiceover Volume Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Âm lượng Giọng đọc</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-cyan-400">{Math.round(volume * 100)}%</span>
              {setIsMuted && (
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                    isMuted ? 'bg-rose-500/20 text-rose-300' : 'bg-[#252B3E] text-slate-300'
                  }`}
                >
                  {isMuted ? 'Đã tắt' : 'Tắt'}
                </button>
              )}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setIsMuted?.(false);
              setVolume(parseFloat(e.target.value));
            }}
            className="w-full accent-cyan-400 h-1.5 bg-[#252B3E] rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. BACKGROUND MUSIC TRACK (NHẠC NỀN BGM) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-[#141724] border border-[#282F45] space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm" />
            <span className="text-xs font-black text-white">
              🎵 Nhạc Nền (Background Music - BGM)
            </span>
          </div>
          {hasBgm && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded-md font-bold">
              Active
            </span>
          )}
        </div>

        {/* Current BGM Status Box */}
        <div className="p-2.5 rounded-xl bg-[#0E1017] border border-[#23293D] flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-200 truncate">
              {hasBgm ? (bgmTrackTitle ? `🎶 ${bgmTrackTitle}` : 'Nhạc nền tùy biến') : 'Chưa có nhạc nền'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
              {activeBgmUrl || customBgmFile || 'Chọn từ Thư viện hoặc tải file từ máy'}
            </p>
          </div>
          {hasBgm && (
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
          )}
        </div>

        {/* BGM Actions: Upload / Pick Library / Delete */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => bgmFileInputRef.current?.click()}
            className="py-2 px-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-[11px] font-black flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Tải tệp MP3 nhạc nền từ máy tính"
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tải BGM</span>
          </button>

          {onOpenMusicLibrary && (
            <button
              type="button"
              onClick={onOpenMusicLibrary}
              className="py-2 px-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-400/40 text-purple-200 text-[11px] font-black flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm cursor-pointer"
              title="Mở kho nhạc nền bản quyền"
            >
              <Music className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="truncate">Thư Viện</span>
            </button>
          )}

          <button
            type="button"
            disabled={!hasBgm}
            onClick={onRemoveBgm}
            className="py-2 px-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-black flex items-center justify-center gap-1 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Xoá bỏ nhạc nền khỏi video"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">Xoá BGM</span>
          </button>
        </div>

        {/* BGM Volume Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span>Âm lượng Nhạc nền (BGM)</span>
            </span>
            <span className="font-mono text-[11px] text-purple-400">{Math.round(bgmVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={bgmVolume}
            onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
            className="w-full accent-purple-400 h-1.5 bg-[#252B3E] rounded-lg cursor-pointer"
          />
        </div>

        {/* Audio Slip / Tua đoạn nhạc trong bài hát */}
        {hasBgm && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-[#090B12] border border-[#23293F] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tua đoạn nhạc (Audio Slip)</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {Math.floor(bgmOffsetSec || 0)}s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(10, Math.floor(bgmTotalDurationSec || 180))}
              step="1"
              value={bgmOffsetSec || 0}
              onChange={(e) => setBgmOffsetSec?.(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-[#1B2032] rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Bắt đầu từ 0s</span>
              <span>Phát từ {Math.floor(bgmOffsetSec || 0)}s</span>
              <span>{Math.floor(bgmTotalDurationSec || 180)}s</span>
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. ORIGINAL VIDEO AUDIO (ÂM THANH VIDEO GỐC) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-[#141724] border border-[#282F45] space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <span className="text-xs font-black text-white">
              🎬 Âm Thanh Video Gốc (Original Video Audio)
            </span>
          </div>
          {setIsVideoAudioMuted && (
            <button
              type="button"
              onClick={() => setIsVideoAudioMuted(!isVideoAudioMuted)}
              className={`text-[10px] font-mono px-2 py-0.5 border rounded-md font-bold transition-all cursor-pointer ${
                isVideoAudioMuted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              {isVideoAudioMuted ? '🔇 Đã Tắt Tiếng Gốc' : '🔊 Bật Tiếng Gốc'}
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-400 leading-snug">
          Bật/Tắt tiếng hoặc điều chỉnh âm lượng tiếng gốc từ các đoạn clip Video bạn vừa tải lên.
        </p>

        {/* Video Audio Volume Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Âm lượng Video gốc</span>
            </span>
            <span className="font-mono text-[11px] text-amber-400">
              {isVideoAudioMuted ? '0%' : `${Math.round(videoAudioVolume * 100)}%`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isVideoAudioMuted ? 0 : videoAudioVolume}
            onChange={(e) => {
              setIsVideoAudioMuted?.(false);
              setVideoAudioVolume?.(parseFloat(e.target.value));
            }}
            className="w-full accent-amber-400 h-1.5 bg-[#252B3E] rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
