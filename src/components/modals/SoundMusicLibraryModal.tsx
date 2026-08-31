'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  X,
  Search,
  Play,
  Pause,
  Music,
  Zap,
  Coffee,
  Mic,
  Clock,
  Download,
  Sparkles,
  ChevronRight,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Star,
  Bookmark,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import defaultMusicCatalog from '@/data/music_library.json';
import { saveAndShareMedia } from '@/utils/mediaSaveHelper';

export interface MusicTrackDuration {
  url: string;
  duration_sec: number;
  label: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: 'future-bass' | 'relax' | 'songs';
  category_name_vi: string;
  category_name_en: string;
  bpm: number;
  total_duration_sec: number;
  highlight_start_sec: number;
  original_filename: string;
  durations: {
    '15s'?: MusicTrackDuration;
    '30s'?: MusicTrackDuration;
    '45s'?: MusicTrackDuration;
    '60s'?: MusicTrackDuration;
    '90s'?: MusicTrackDuration;
    full?: MusicTrackDuration;
  };
}

interface SoundMusicLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrackForVideo?: (audioUrl: string, trackTitle: string) => void;
}

type DurationFilter = 'all' | '15s' | '30s' | '45s' | '60s' | '90s' | 'full';

const DURATION_CHIPS: { id: DurationFilter; labelVi: string; labelEn: string }[] = [
  { id: 'all', labelVi: 'Tất cả', labelEn: 'All' },
  { id: '15s', labelVi: '15s', labelEn: '15s' },
  { id: '30s', labelVi: '30s', labelEn: '30s' },
  { id: '45s', labelVi: '45s', labelEn: '45s' },
  { id: '60s', labelVi: '1 Phút', labelEn: '1 Min' },
  { id: '90s', labelVi: '1p30s', labelEn: '1m30s' },
  { id: 'full', labelVi: 'Full Bài', labelEn: 'Full' },
];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const SoundMusicLibraryModal: React.FC<SoundMusicLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectTrackForVideo,
}) => {
  const { isDark, isVietnamese, t } = useApp();

  // Filters & State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedDurationFilter, setSelectedDurationFilter] = useState<DurationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedTrackIds, setSavedTrackIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('wynmotion_saved_music_tracks');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  const handleToggleSaveTrack = (trackId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedTrackIds((prev) => {
      const next = prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId];
      try {
        localStorage.setItem('wynmotion_saved_music_tracks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Audio Playback
  const [currentPlayingTrackId, setCurrentPlayingTrackId] = useState<string | null>(null);
  const [currentPlayingDurationKey, setCurrentPlayingDurationKey] = useState<string>('30s');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Granular duration selection per track
  const [trackSelectedDurations, setTrackSelectedDurations] = useState<Record<string, string>>({});

  const catalog = defaultMusicCatalog as any;
  const allTracks: MusicTrack[] = useMemo(() => {
    return (catalog?.tracks || []) as MusicTrack[];
  }, [catalog]);

  // Filtered tracks according to current search, category, and screen view
  const filteredTracks = useMemo(() => {
    return allTracks.filter((track) => {
      // Saved Category Filter
      if (activeCategory === 'saved') {
        if (!savedTrackIds.includes(track.id)) return false;
      } else if (activeCategory !== 'all' && track.category !== activeCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = track.title.toLowerCase().includes(q);
        const matchArtist = track.artist.toLowerCase().includes(q);
        const matchCat =
          (track.category_name_vi || '').toLowerCase().includes(q) ||
          (track.category_name_en || '').toLowerCase().includes(q);
        if (!matchTitle && !matchArtist && !matchCat) return false;
      }
      return true;
    });
  }, [allTracks, activeCategory, searchQuery, savedTrackIds]);

  // Index of currently playing track within filtered list
  const currentTrackIndex = useMemo(() => {
    if (!currentPlayingTrackId) return -1;
    return filteredTracks.findIndex((t) => t.id === currentPlayingTrackId);
  }, [filteredTracks, currentPlayingTrackId]);

  const currentPlayingTrack = useMemo(() => {
    return allTracks.find((t) => t.id === currentPlayingTrackId);
  }, [allTracks, currentPlayingTrackId]);

  // Play a specific track and duration key
  const playTrack = useCallback(
    (track: MusicTrack, durationKey?: string) => {
      const targetDurKey =
        durationKey ||
        trackSelectedDurations[track.id] ||
        (selectedDurationFilter !== 'all' ? selectedDurationFilter : track.durations['30s'] ? '30s' : 'full');

      const trackDur =
        track.durations[targetDurKey as keyof typeof track.durations] ||
        track.durations['30s'] ||
        track.durations['full'];

      if (!trackDur) return;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = trackDur.url;
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setCurrentPlayingTrackId(track.id);
            setCurrentPlayingDurationKey(targetDurKey);
          })
          .catch(() => {
            setIsPlaying(false);
          });
      }
    },
    [trackSelectedDurations, selectedDurationFilter]
  );

  // Toggle Play / Pause
  const handleTogglePlay = (track: MusicTrack, durationKey?: string) => {
    const targetDurKey =
      durationKey ||
      trackSelectedDurations[track.id] ||
      (selectedDurationFilter !== 'all' ? selectedDurationFilter : track.durations['30s'] ? '30s' : 'full');

    if (currentPlayingTrackId === track.id && currentPlayingDurationKey === targetDurKey && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else if (currentPlayingTrackId === track.id && currentPlayingDurationKey === targetDurKey && !isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      playTrack(track, targetDurKey);
    }
  };

  // Next Track in Current Filter List
  const handleNextTrack = useCallback(() => {
    if (filteredTracks.length === 0) return;
    let nextIdx = currentTrackIndex + 1;
    if (nextIdx >= filteredTracks.length) {
      nextIdx = 0; // Loop back to beginning
    }
    const nextTrack = filteredTracks[nextIdx];
    if (nextTrack) {
      playTrack(nextTrack);
    }
  }, [filteredTracks, currentTrackIndex, playTrack]);

  // Previous Track in Current Filter List
  const handlePrevTrack = useCallback(() => {
    if (filteredTracks.length === 0) return;
    let prevIdx = currentTrackIndex - 1;
    if (prevIdx < 0) {
      prevIdx = filteredTracks.length - 1; // Loop to end
    }
    const prevTrack = filteredTracks[prevIdx];
    if (prevTrack) {
      playTrack(prevTrack);
    }
  }, [filteredTracks, currentTrackIndex, playTrack]);

  // Scrubber / Seek Handler
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSelectTrackDuration = (trackId: string, durationKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTrackSelectedDurations((prev) => ({ ...prev, [trackId]: durationKey }));
    const track = allTracks.find((t) => t.id === trackId);
    if (track && currentPlayingTrackId === trackId) {
      playTrack(track, durationKey);
    }
  };

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      handleNextTrack(); // Auto-advance to next track in screen list
    };
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, [isSeeking, handleNextTrack]);

  // Reset audio on modal close
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentPlayingTrackId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[20000] flex items-end justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      style={{ transform: 'translateZ(20000px)', WebkitTransform: 'translateZ(20000px)' }}
    >
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="none" />

      {/* Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-Up Container */}
      <div
        className={`relative z-[20005] w-full max-w-4xl max-h-[92vh] h-[88vh] rounded-t-[36px] flex flex-col overflow-hidden shadow-2xl border-t border-x transition-all animate-in slide-in-from-bottom duration-300 ${
          isDark ? 'bg-[#0E111A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        style={{ transform: 'translateZ(20005px)', WebkitTransform: 'translateZ(20005px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          className={`p-4 sm:p-5 border-b shrink-0 flex items-center justify-between ${
            isDark ? 'border-white/10' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">Sound & Music Library</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xs">
                  {allTracks.length}+ Tracks
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t(
                  'Kho nhạc độc quyền WynMotion đã cắt highlight 15s-90s',
                  'Curated WynMotion music library with 15s-90s smart highlight cuts'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-2xl border transition-all active:scale-95 ${
              isDark
                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div
          className={`p-3 sm:px-5 space-y-2.5 border-b shrink-0 ${
            isDark ? 'border-white/5 bg-black/20' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                'Tìm kiếm bài hát, tác giả hoặc phong cách âm nhạc...',
                'Search songs, artists, or genres...'
              )}
              className={`w-full h-10 pl-10 pr-4 rounded-2xl border text-xs outline-none transition-all ${
                isDark
                  ? 'bg-[#121522] border-slate-800 text-white placeholder:text-slate-500 focus:border-purple-400'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 shadow-xs'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 4 Main Category Tabs (Scroll ngang mượt mà) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
            {[
              { id: 'all', nameVi: 'Tất Cả Thể Loại', nameEn: 'All Tracks', icon: Sparkles },
              {
                id: 'saved',
                nameVi: `⭐ Đã Lưu (${savedTrackIds.length})`,
                nameEn: `⭐ Saved (${savedTrackIds.length})`,
                icon: Star,
              },
              {
                id: 'future-bass',
                nameVi: 'Future Bass & Sôi Động',
                nameEn: 'Future Bass & EDM',
                icon: Zap,
              },
              {
                id: 'relax',
                nameVi: 'Nhạc Chill & Thư Giãn',
                nameEn: 'Relax / Chill',
                icon: Coffee,
              },
              {
                id: 'songs',
                nameVi: 'Rap & EDM Có Lời',
                nameEn: 'Vocal Songs & Rap',
                icon: Mic,
              },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border active:scale-95 shrink-0 whitespace-nowrap ${
                    isActive
                      ? isDark
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 shadow-md shadow-purple-500/25'
                        : 'bg-black text-white border-black shadow-sm'
                      : isDark
                      ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{isVietnamese ? cat.nameVi : cat.nameEn}</span>
                </button>
              );
            })}
          </div>

          {/* Duration Filter Chips (Scroll ngang độc lập) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider shrink-0 mr-1 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <Clock className="w-3 h-3 inline mr-1" />
              {t('Thời lượng:', 'Duration:')}
            </span>
            {DURATION_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedDurationFilter(chip.id)}
                className={`h-7 px-3 rounded-full text-[11px] font-bold shrink-0 whitespace-nowrap transition-all border ${
                  selectedDurationFilter === chip.id
                    ? isDark
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                      : 'bg-purple-100 border-purple-400 text-purple-900'
                    : isDark
                    ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isVietnamese ? chip.labelVi : chip.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Track List Section (Chỉ cuộn dọc, cố định 100% không xô lệch 2 bên) */}
        <div className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden p-3 sm:p-5 space-y-2.5 pb-60">
          {filteredTracks.length === 0 ? (
            <div className="py-16 text-center">
              <Music className="w-12 h-12 mx-auto mb-3 text-slate-500 opacity-50" />
              <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('Không tìm thấy bài hát phù hợp', 'No tracks found')}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('Hãy thử tìm kiếm từ khóa khác hoặc chuyển thể loại', 'Try searching for different keywords or category')}
              </p>
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isCurrentPlaying = currentPlayingTrackId === track.id && isPlaying;
              const activeDurKey =
                trackSelectedDurations[track.id] ||
                (selectedDurationFilter !== 'all' ? selectedDurationFilter : '30s');

              return (
                <div
                  key={track.id}
                  className={`group w-full max-w-full box-border overflow-hidden rounded-2xl border p-3 sm:p-3.5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    currentPlayingTrackId === track.id
                      ? isDark
                        ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                        : 'border-purple-400 bg-purple-50/70 shadow-sm'
                      : isDark
                      ? 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  {/* Left info & play button */}
                  <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                    {/* Play/Pause Circle Button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePlay(track, activeDurKey)}
                      className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center transition-all active:scale-95 shadow-md ${
                        isCurrentPlaying
                          ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white animate-pulse'
                          : isDark
                          ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Text meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {track.title}
                        </h4>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                            track.category === 'future-bass'
                              ? 'bg-cyan-500/15 text-cyan-500'
                              : track.category === 'relax'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : 'bg-pink-500/15 text-pink-500'
                          }`}
                        >
                          {track.bpm ? `${track.bpm} BPM` : 'NCS'}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        👤 {track.artist} • {isVietnamese ? track.category_name_vi : track.category_name_en}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions: Duration Chips & Buttons (Cố định width không tràn lề) */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5 overflow-hidden">
                    {/* Duration Variations Selector */}
                    <div className="flex items-center gap-0.5 bg-black/20 p-1 rounded-xl border border-white/10 shrink min-w-0 overflow-x-auto scrollbar-none">
                      {(['15s', '30s', '45s', '60s', '90s', 'full'] as const).map((durKey) => {
                        const isSelected = activeDurKey === durKey;
                        const isCurrentlyRunning =
                          currentPlayingTrackId === track.id && currentPlayingDurationKey === durKey && isPlaying;
                        return (
                          <button
                            key={durKey}
                            type="button"
                            onClick={(e) => handleSelectTrackDuration(track.id, durKey, e)}
                            className={`px-1.5 sm:px-2 py-1 rounded-lg text-[10px] font-black transition-all shrink-0 ${
                              isCurrentlyRunning
                                ? 'bg-pink-500 text-white shadow-xs'
                                : isSelected
                                ? isDark
                                  ? 'bg-white/20 text-white'
                                  : 'bg-white text-slate-900 shadow-xs'
                                : isDark
                                ? 'text-slate-400 hover:text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {durKey}
                          </button>
                        );
                      })}
                    </div>

                    {/* Bookmark / Save Star Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSaveTrack(track.id, e)}
                      className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                        savedTrackIds.includes(track.id)
                          ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-xs'
                          : isDark
                          ? 'bg-white/5 border-white/10 text-slate-400 hover:text-amber-300 hover:bg-white/10'
                          : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-slate-200'
                      }`}
                      title={savedTrackIds.includes(track.id) ? t('Bỏ lưu', 'Unsave') : t('Lưu bài hát', 'Save track')}
                    >
                      <Star className={`w-3.5 h-3.5 ${savedTrackIds.includes(track.id) ? 'fill-amber-400' : ''}`} />
                    </button>

                    {/* Use In Video Button */}
                    {onSelectTrackForVideo && (
                      <button
                        type="button"
                        onClick={() => {
                          const durObj =
                            track.durations[activeDurKey as keyof typeof track.durations] ||
                            track.durations['30s'] ||
                            track.durations['full'];
                          if (durObj) {
                            onSelectTrackForVideo(durObj.url, `${track.title} (${activeDurKey})`);
                            onClose();
                          }
                        }}
                        className="h-8 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('Dùng', 'Use')}</span>
                      </button>
                    )}

                    {/* Download Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        const durObj =
                          track.durations[activeDurKey as keyof typeof track.durations] ||
                          track.durations['30s'] ||
                          track.durations['full'];
                        if (durObj) {
                          await saveAndShareMedia(durObj.url, `${track.title}_${activeDurKey}.mp3`);
                        }
                      }}
                      className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={t('Tải về máy', 'Download track')}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            STICKY BOTTOM MEDIA PLAYER (Taller, 3-Row Spacious Design)
            Row 1: Track Title & Info + Action Buttons
            Row 2: Scrubber Bar & Live Timers
            Row 3: Large Centered Controls (Back - Play/Pause - Next)
            ───────────────────────────────────────────────────────────── */}
        {currentPlayingTrack && (
          <div
            className={`absolute bottom-0 left-0 right-0 z-30 border-t shadow-2xl backdrop-blur-2xl transition-all animate-in slide-in-from-bottom-3 duration-200 flex flex-col p-4 sm:p-5 space-y-3 ${
              isDark
                ? 'bg-[#090B12]/95 border-purple-500/25 text-white shadow-purple-950/60'
                : 'bg-slate-900/95 border-slate-800 text-white shadow-black/40'
            }`}
          >
            {/* ROW 1: Track Info & Action Buttons (Tách biệt lên phía trên) */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/30">
                  <Music className={`w-5 h-5 sm:w-6 sm:h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black truncate text-white">
                      {currentPlayingTrack.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500/20 text-pink-400 border border-pink-500/30 shrink-0">
                      {currentPlayingDurationKey}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    👤 {currentPlayingTrack.artist} • {currentPlayingTrack.bpm} BPM •{' '}
                    {isVietnamese ? currentPlayingTrack.category_name_vi : currentPlayingTrack.category_name_en}
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Bookmark in Player */}
                <button
                  type="button"
                  onClick={(e) => handleToggleSaveTrack(currentPlayingTrack.id, e)}
                  className={`h-9 px-3 rounded-2xl border flex items-center gap-1.5 transition-all active:scale-95 ${
                    savedTrackIds.includes(currentPlayingTrack.id)
                      ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                      : 'bg-white/10 border-white/15 text-slate-300 hover:text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${savedTrackIds.includes(currentPlayingTrack.id) ? 'fill-amber-400' : ''}`} />
                  <span className="text-xs font-bold hidden sm:inline">
                    {savedTrackIds.includes(currentPlayingTrack.id) ? t('Đã lưu', 'Saved') : t('Lưu', 'Save')}
                  </span>
                </button>

                {/* Use in Video from Player */}
                {onSelectTrackForVideo && (
                  <button
                    type="button"
                    onClick={() => {
                      const durObj =
                        currentPlayingTrack.durations[currentPlayingDurationKey as keyof typeof currentPlayingTrack.durations] ||
                        currentPlayingTrack.durations['30s'] ||
                        currentPlayingTrack.durations['full'];
                      if (durObj) {
                        onSelectTrackForVideo(durObj.url, `${currentPlayingTrack.title} (${currentPlayingDurationKey})`);
                        onClose();
                      }
                    }}
                    className="h-9 px-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('Dùng BGM', 'Use BGM')}</span>
                  </button>
                )}
                {/* Close Player Button */}
                <button
                  type="button"
                  onClick={() => {
                    audioRef.current?.pause();
                    setIsPlaying(false);
                    setCurrentPlayingTrackId(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-90"
                  title={t('Đóng player', 'Close player')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ROW 2: Scrubber Bar & Live Time Counter (Hàng trượt riêng biệt) */}
            <div className="flex items-center gap-3 px-1">
              <span className="text-xs font-mono font-bold text-pink-400 shrink-0 w-9 text-right">
                {formatTime(currentTime)}
              </span>

              {/* Range Slider for Seeking */}
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeekChange}
                  onMouseDown={() => setIsSeeking(true)}
                  onMouseUp={() => setIsSeeking(false)}
                  onTouchStart={() => setIsSeeking(true)}
                  onTouchEnd={() => setIsSeeking(false)}
                  className="w-full h-2 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  style={{
                    background: `linear-gradient(to right, #ec4899 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.15) ${(currentTime / (duration || 1)) * 100}%)`,
                  }}
                />
              </div>

              <span className="text-xs font-mono font-bold text-slate-400 shrink-0 w-9 text-left">
                {formatTime(duration)}
              </span>
            </div>

            {/* ROW 3: Spacious Centered Navigation Controls (Back - Play/Pause - Next) */}
            <div className="flex items-center justify-center gap-5 pt-1">
              {/* Previous Button */}
              <button
                type="button"
                onClick={handlePrevTrack}
                disabled={filteredTracks.length <= 1}
                className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white active:scale-90 disabled:opacity-30 transition-all shadow-sm"
                title={t('Bài trước đó', 'Previous track')}
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Play / Pause Glowing Center Button */}
              <button
                type="button"
                onClick={() => handleTogglePlay(currentPlayingTrack, currentPlayingDurationKey)}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-pink-500/40 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNextTrack}
                disabled={filteredTracks.length <= 1}
                className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white active:scale-90 disabled:opacity-30 transition-all shadow-sm"
                title={t('Bài kế tiếp', 'Next track')}
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
