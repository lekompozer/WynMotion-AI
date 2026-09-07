'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Video,
  Music,
  Trash2,
  Play,
  Pause,
  ArrowRight,
  Loader2,
  Film,
  Layers,
  Plus,
} from 'lucide-react';
import { MotionProject, MotionScene, wynmotionService } from '@/services/wynmotionService';

export interface EmptyProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: MotionProject) => void;
  isVietnamese?: boolean;
}

interface UploadedMediaItem {
  id: string;
  type: 'image' | 'video';
  file: File;
  previewUrl: string;
  remoteUrl?: string;
  durationSec: number;
  name: string;
}

export const EmptyProjectModal: React.FC<EmptyProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
  isVietnamese = true,
}) => {
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [mediaItems, setMediaItems] = useState<UploadedMediaItem[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioDurationSec, setAudioDurationSec] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Keyboard shortcut Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {}
      });
      if (audioPreviewUrl) {
        try {
          URL.revokeObjectURL(audioPreviewUrl);
        } catch {}
      }
    };
  }, []);

  if (!isOpen) return null;

  // 1. Handle Multiple Media Files (Images / Videos) Selection
  const handleMediaFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: UploadedMediaItem[] = [];
    Array.from(files).forEach((file) => {
      const isVid = file.type.startsWith('video/');
      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: isVid ? 'video' : 'image',
        file,
        previewUrl,
        durationSec: isVid ? 5.0 : 4.0,
        name: file.name,
      });
    });

    setMediaItems((prev) => [...prev, ...newItems]);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  // 2. Handle Audio File Selection
  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (audioPreviewUrl) {
      try {
        URL.revokeObjectURL(audioPreviewUrl);
      } catch {}
    }

    const url = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioPreviewUrl(url);
    setIsPlayingAudio(false);

    // Read audio duration
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && isFinite(tempAudio.duration)) {
        setAudioDurationSec(Math.round(tempAudio.duration * 10) / 10);
      }
    };

    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const togglePlayAudio = () => {
    if (!audioPlayerRef.current && audioPreviewUrl) {
      audioPlayerRef.current = new Audio(audioPreviewUrl);
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
    }
    if (audioPlayerRef.current) {
      if (isPlayingAudio) {
        audioPlayerRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) {
        try {
          URL.revokeObjectURL(target.previewUrl);
        } catch {}
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleRemoveAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (audioPreviewUrl) {
      try {
        URL.revokeObjectURL(audioPreviewUrl);
      } catch {}
    }
    setAudioFile(null);
    setAudioPreviewUrl(null);
    setAudioDurationSec(null);
    setIsPlayingAudio(false);
  };

  // 3. Create Empty Project and Launch Editor
  const handleCreateAndOpenStudio = async () => {
    setIsProcessing(true);
    try {
      // 1. Upload media files if needed (or fallback to object URLs for fast local preview)
      const uploadedMedia = await Promise.all(
        mediaItems.map(async (item) => {
          try {
            const formData = new FormData();
            formData.append('file', item.file);
            const res = await wynmotionService.uploadMedia(formData);
            if (res.url) {
              return { ...item, remoteUrl: res.url };
            }
          } catch (err) {
            console.warn('Local asset upload fallback:', err);
          }
          return item;
        })
      );

      // 2. Upload audio if present
      let uploadedAudioUrl = audioPreviewUrl || undefined;
      if (audioFile) {
        try {
          const formData = new FormData();
          formData.append('file', audioFile);
          const res = await wynmotionService.uploadMedia(formData);
          if (res.url) uploadedAudioUrl = res.url;
        } catch (err) {
          console.warn('Audio upload fallback:', err);
        }
      }

      // 3. Build Scenes from uploaded media (or default 3 scenes if empty)
      const count = uploadedMedia.length > 0 ? uploadedMedia.length : 3;
      const totalAudioDur = audioDurationSec || count * 4.0;
      const perSceneDur = Number((totalAudioDur / count).toFixed(1));

      let curStartSec = 0;
      const scenes: MotionScene[] = [];

      for (let i = 0; i < count; i++) {
        const item = uploadedMedia[i];
        const scDur = item?.durationSec ? Math.max(2.0, item.durationSec) : perSceneDur;
        const mediaUrl = item ? (item.remoteUrl || item.previewUrl) : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080';
        const isVideo = item?.type === 'video';

        scenes.push({
          scene_id: String(i + 1),
          order: i + 1,
          title: isVietnamese ? `Phân cảnh ${i + 1}` : `Scene ${i + 1}`,
          image_url: !isVideo ? mediaUrl : undefined,
          video_url: isVideo ? mediaUrl : undefined,
          voice_transcript: '',
          duration_sec: scDur,
          start_time_sec: Number(curStartSec.toFixed(1)),
          actions: [],
        });
        curStartSec += scDur;
      }

      const newProject: MotionProject = {
        project_id: `empty_${Date.now()}`,
        title: isVietnamese ? `Dự Án Mới (${new Date().toLocaleDateString('vi-VN')})` : `Custom Project (${new Date().toLocaleDateString()})`,
        prompt: 'Custom Empty Project with user uploaded media and audio',
        aspect_ratio: aspectRatio,
        visual_style: 'product_ads_motion',
        duration_sec: Math.max(totalAudioDur, curStartSec),
        fps: 30,
        language_code: 'vi',
        status: 'ready',
        audio_url: uploadedAudioUrl,
        scenes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      onProjectCreated(newProject);
      onClose();
    } catch (err: any) {
      console.error('Error creating empty project:', err);
      alert(err.message || 'Không thể tạo dự án lúc này');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-2xl bg-[#10121B] border border-[#232A3E] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-200">
        {/* ── HEADER ── */}
        <div className="px-6 py-4 border-b border-[#1E2333] flex items-center justify-between bg-[#0E1017]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20 shrink-0">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">
                  {isVietnamese ? 'Dự Án Trống (Tải Lên Tự Do)' : 'Empty Project (Custom Upload)'}
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  Studio Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isVietnamese
                  ? 'Tải lên Ảnh, Video và Âm thanh của riêng bạn để tự do cắt ghép và tạo phụ đề AI'
                  : 'Upload your photos, video clips and audio to customize timeline and create AI subtitles'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E2333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── BODY (SCROLLABLE) ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 studio-scrollbar">
          {/* SECTION 1: ASPECT RATIO SELECTION */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isVietnamese ? '1. Chọn Tỉ Lệ Khung Hình Video' : '1. Select Video Aspect Ratio'}</span>
            </label>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: '9:16', label: '9:16 (Dọc)', desc: 'TikTok, Reels, Shorts', icon: '📱' },
                { id: '16:9', label: '16:9 (Ngang)', desc: 'YouTube, Tivi, PC', icon: '📺' },
                { id: '1:1', label: '1:1 (Vuông)', desc: 'Instagram, Feed', icon: '🔲' },
              ].map((item) => {
                const isSelected = aspectRatio === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectRatio(item.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                        : 'bg-[#151824] border-[#22283A] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xl mb-0.5">{item.icon}</span>
                    <span className="text-xs font-black">{item.label}</span>
                    <span className="text-[10px] text-slate-500 text-center">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: MULTI-IMAGE / VIDEO CLIPS UPLOAD */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isVietnamese ? '2. Tải Ảnh / Video Phân Cảnh' : '2. Upload Photos / Videos'}</span>
                <span className="text-[10px] text-slate-500 font-normal">({mediaItems.length} đã chọn)</span>
              </label>

              <button
                type="button"
                onClick={() => mediaInputRef.current?.click()}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isVietnamese ? 'Thêm file' : 'Add files'}</span>
              </button>
            </div>

            <input
              ref={mediaInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleMediaFilesSelect}
            />

            {mediaItems.length === 0 ? (
              <div
                onClick={() => mediaInputRef.current?.click()}
                className="border-2 border-dashed border-[#262D42] hover:border-cyan-500/60 rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#121522]/50 hover:bg-[#151928] group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1A1F30] group-hover:bg-cyan-500/10 text-slate-400 group-hover:text-cyan-400 flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-black text-white">
                  {isVietnamese ? 'Bấm để chọn nhiều Ảnh hoặc Video cùng lúc' : 'Click to select multiple Photos or Videos'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isVietnamese
                    ? 'Hỗ trợ PNG, JPG, WEBP, MP4, MOV. Mỗi file sẽ tạo thành 1 Scene trên Timeline.'
                    : 'Supports PNG, JPG, WEBP, MP4, MOV. Each file becomes a Scene on the timeline.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto pr-1 studio-scrollbar">
                {mediaItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="relative group rounded-xl overflow-hidden border border-[#23293D] bg-[#141724] aspect-video flex items-center justify-center shadow-sm"
                  >
                    {item.type === 'video' ? (
                      <video src={item.previewUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                          {item.type === 'video' ? <Video className="w-2.5 h-2.5 text-purple-400" /> : <ImageIcon className="w-2.5 h-2.5 text-cyan-400" />}
                          <span>Scene {idx + 1}</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMedia(item.id);
                          }}
                          className="p-1 rounded bg-rose-600/80 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                          title="Xóa media này"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <span className="text-[9px] text-slate-300 truncate font-mono">{item.name}</span>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  className="rounded-xl border border-dashed border-[#2D364F] hover:border-cyan-400/60 bg-[#121522] hover:bg-[#161B2B] text-slate-400 hover:text-cyan-300 aspect-video flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[10px] font-bold">{isVietnamese ? 'Thêm' : 'Add'}</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION 3: AUDIO / SONG UPLOAD (OPTIONAL) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isVietnamese ? '3. Âm Thanh / Bài Hát (Tùy chọn)' : '3. Audio / Song (Optional)'}</span>
              </label>

              {audioFile && (
                <button
                  type="button"
                  onClick={handleRemoveAudio}
                  className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{isVietnamese ? 'Bỏ audio' : 'Remove'}</span>
                </button>
              )}
            </div>

            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleAudioFileSelect}
            />

            {!audioFile ? (
              <div
                onClick={() => audioInputRef.current?.click()}
                className="border border-dashed border-[#262D42] hover:border-cyan-500/60 rounded-2xl p-4 flex items-center gap-3.5 cursor-pointer transition-all bg-[#121522]/50 hover:bg-[#151928] group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1A1F30] group-hover:bg-cyan-500/10 text-slate-400 group-hover:text-cyan-400 flex items-center justify-center shrink-0 transition-colors">
                  <Music className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-white">
                    {isVietnamese ? 'Tải lên bài hát / voice / nhạc nền (.mp3, .wav, .m4a)' : 'Upload song / voiceover / BGM (.mp3, .wav)'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {isVietnamese ? 'Có thể dùng Whisper để trích xuất phụ đề hoặc tạo lời bài hát ngay' : 'Can transcribe to subtitles or lyrics with Whisper AI'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#151825] border border-cyan-500/30 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={togglePlayAudio}
                    className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold hover:brightness-110 shadow-sm shrink-0 active:scale-95 transition-all cursor-pointer"
                  >
                    {isPlayingAudio ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{audioFile.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>{(audioFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                      {audioDurationSec && <span>• {audioDurationSec}s</span>}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#22283A] text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                >
                  {isVietnamese ? 'Đổi tệp' : 'Replace'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="px-6 py-4 border-t border-[#1E2333] flex items-center justify-between bg-[#0E1017] gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            {isVietnamese ? 'Hủy' : 'Cancel'}
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleCreateAndOpenStudio}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>{isVietnamese ? 'Đang Khởi Tạo Studio...' : 'Launching Studio...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isVietnamese ? '🚀 Tạo Dự Án & Vào Studio' : '🚀 Create & Open Studio'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
