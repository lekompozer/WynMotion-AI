'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FolderOpen,
  Film,
  Mic,
  Image as ImageIcon,
  Video,
  Download,
  Upload,
  Trash2,
  Play,
  Pause,
  Clock,
  Sparkles,
  Search,
  X,
  Loader2,
  Edit3,
  Layers,
  Music,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { wynmotionService, MotionProject, MotionScene } from '@/services/wynmotionService';
import {
  listLibraryFiles,
  uploadLibraryFile,
  moveToTrash,
  formatFileSize,
  LibraryFile,
} from '@/services/libraryService';

import { useWordaiAuth } from '@/contexts/WordaiAuthContext';
import { LoginModal } from '@/components/auth/LoginModal';

type AssetCategory = 'projects' | 'images' | 'videos' | 'audio';

interface LibraryTabProps {
  onOpenProject?: (projectId: string) => void;
  onUseAudioInVideo?: (audioUrl: string, audioName: string) => void;
}

const CATEGORY_TABS: {
  id: AssetCategory;
  labelVi: string;
  labelEn: string;
  icon: any;
  color: string;
  activeColor: string;
}[] = [
  { id: 'projects', labelVi: 'Dự Án Video AI', labelEn: 'AI Projects', icon: Film, color: 'text-cyan-400', activeColor: 'from-cyan-400 to-blue-600' },
  { id: 'images', labelVi: 'Hình Ảnh', labelEn: 'Images', icon: ImageIcon, color: 'text-amber-400', activeColor: 'from-amber-400 to-orange-500' },
  { id: 'videos', labelVi: 'Video Xuất', labelEn: 'Videos', icon: Video, color: 'text-emerald-400', activeColor: 'from-emerald-400 to-teal-600' },
  { id: 'audio', labelVi: 'Âm Thanh', labelEn: 'Audio', icon: Music, color: 'text-purple-400', activeColor: 'from-purple-400 to-violet-600' },
];

function getStyleLabel(style: string): string {
  switch (style) {
    case 'whiteboard_stream_hand': return 'Bút vẽ tay';
    case 'handdrawn_fast_doodle': return 'Doodle nhanh';
    case 'apple_modern_motion': return 'Apple Modern';
    case 'character_animation': return 'Nhân vật';
    case 'science_explainer': return 'Khoa học';
    case 'dialogue_scene': return 'Hội thoại';
    default: return style || 'Mặc định';
  }
}

export const LibraryTab: React.FC<LibraryTabProps> = ({
  onOpenProject,
  onUseAudioInVideo,
}) => {
  const { isVietnamese, isDark, t } = useApp();
  const { user } = useWordaiAuth();

  const [activeCategory, setActiveCategory] = useState<AssetCategory>('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Data state
  const [projects, setProjects] = useState<MotionProject[]>([]);
  const [recentProjects, setRecentProjects] = useState<MotionProject[]>([]);
  const [files, setFiles] = useState<LibraryFile[]>([]);

  // UI state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<LibraryFile | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load data on mount and user/category change ──
  useEffect(() => {
    // Clear any stale legacy global cache
    try {
      localStorage.removeItem('wynmotion_cached_projects');
    } catch {}

    if (!user) {
      setProjects([]);
      setRecentProjects([]);
      setFiles([]);
      return;
    }

    const cacheKey = `wynmotion_cached_projects_${user.uid}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed: MotionProject[] = JSON.parse(cached);
        setProjects(parsed);
        setRecentProjects(parsed.slice(0, 8));
      }
    } catch {}

    loadCategoryData(activeCategory);
  }, [user, activeCategory]);

  const loadCategoryData = useCallback(async (cat: AssetCategory) => {
    if (!user) {
      setProjects([]);
      setRecentProjects([]);
      setFiles([]);
      return;
    }

    setLoading(true);
    const cacheKey = `wynmotion_cached_projects_${user.uid}`;
    try {
      if (cat === 'projects') {
        const res = await wynmotionService.listProjects(100);
        if (res.projects) {
          setProjects(res.projects);
          setRecentProjects(res.projects.slice(0, 8));
          try {
            localStorage.setItem(cacheKey, JSON.stringify(res.projects));
          } catch {}
        } else {
          setProjects([]);
          setRecentProjects([]);
        }
      } else {
        const data = await listLibraryFiles(cat as any, undefined, 100, 0);
        setFiles(data || []);
      }
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Search Filter ──
  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.prompt?.toLowerCase().includes(q) ||
      p.project_id.toLowerCase().includes(q)
    );
  });

  const filteredFiles = files.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return f.filename.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q);
  });

  // ── Upload Handler ──
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      alert(t('❌ File quá lớn (tối đa 100MB)', '❌ File too large (max 100MB)'));
      return;
    }
    setUploading(true);
    try {
      await uploadLibraryFile(file);
      alert(t('✅ Tải file lên thư viện thành công!', '✅ Uploaded successfully!'));
      await loadCategoryData(activeCategory);
    } catch (err: any) {
      alert(err.message || t('❌ Tải file thất bại', '❌ Upload failed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Delete Handlers ──
  const handleDeleteProject = async (p: MotionProject) => {
    if (!confirm(t(`Xóa dự án "${p.title || p.project_id}"?`, `Delete "${p.title || p.project_id}"?`))) return;
    try {
      await wynmotionService.deleteProject(p.project_id);
      setProjects((prev) => prev.filter((x) => x.project_id !== p.project_id));
      setRecentProjects((prev) => prev.filter((x) => x.project_id !== p.project_id));
    } catch {
      alert(t('❌ Không thể xóa dự án', '❌ Failed to delete project'));
    }
  };

  const handleDeleteFile = async (file: LibraryFile) => {
    if (!confirm(t(`Xóa file "${file.filename}"?`, `Delete "${file.filename}"?`))) return;
    try {
      await moveToTrash(file.library_id);
      setFiles((prev) => prev.filter((f) => f.library_id !== file.library_id));
    } catch {
      alert(t('❌ Không thể xóa file', '❌ Failed to delete'));
    }
  };

  // ── Audio Player ──
  const handleToggleAudio = (file: LibraryFile) => {
    if (playingAudioId === file.library_id) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = file.file_url;
        audioPlayerRef.current.play();
        setPlayingAudioId(file.library_id);
      }
    }
  };

  const openProject = (projectId: string) => {
    if (onOpenProject) {
      onOpenProject(projectId);
    } else {
      window.location.href = `/?tab=video&projectId=${projectId}`;
    }
  };

  // ── Responsive card classes ──
  const cardBase = `rounded-3xl border overflow-hidden transition-all group flex flex-col ${
    isDark
      ? 'bg-slate-900 border-slate-800 hover:border-slate-600'
      : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
  }`;

  return (
    <div
      className={`w-full max-w-xl mx-auto px-4 py-5 space-y-5 transition-colors duration-200 ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioPlayerRef}
        onEnded={() => setPlayingAudioId(null)}
        onError={() => setPlayingAudioId(null)}
        className="hidden"
      />

      {/* File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,video/*,audio/*"
      />

      {/* ─── HEADER SECTION ─── */}
      <div
        className={`rounded-3xl p-5 border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-500">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Cloud Library
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {t('Kho lưu trữ video, giọng đọc & hình ảnh AI', 'Saved Videos, Audio & Art')}
              </p>
            </div>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || activeCategory === 'projects'}
            className={`p-2.5 rounded-2xl transition-all active:scale-95 ${
              activeCategory === 'projects'
                ? 'opacity-30 pointer-events-none'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={t('Tải File Lên Thư Viện', 'Upload Asset')}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* ─── SEARCH BAR ─── */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Tìm kiếm dự án hoặc tài nguyên...', 'Search projects or assets...')}
            className={`w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-white placeholder:text-slate-500'
                : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ─── RECENT PROJECTS HORIZONTAL CAROUSEL ─── */}
      {user && recentProjects.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3
              className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {t('Dự Án Gần Đây', 'Recent Projects')}
            </h3>
            <button
              onClick={() => setActiveCategory('projects')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors font-medium"
            >
              <span>{t('Xem tất cả', 'View all')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
            {recentProjects.map((p) => {
              const thumb = (p.scenes as any)?.[0]?.image_url || (p as any).thumbnail_url;
              return (
                <button
                  key={p.project_id}
                  onClick={() => openProject(p.project_id)}
                  style={
                    thumb
                      ? { backgroundImage: `url(${thumb})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : undefined
                  }
                  className={`flex-shrink-0 w-28 h-36 rounded-2xl p-3 border cursor-pointer active:scale-95 transition-all flex flex-col justify-end relative overflow-hidden ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 hover:border-cyan-500/50'
                      : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                  <div className="relative z-10 text-left">
                    <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wide mb-0.5">
                      {getStyleLabel(p.visual_style)}
                    </div>
                    <h4 className="text-[11px] font-semibold text-white leading-snug line-clamp-2">
                      {p.title || p.prompt || 'Dự án WynMotion'}
                    </h4>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">
                      {Math.round(p.duration_sec || 0)}s
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── CATEGORY SWITCHER PILLS ─── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {CATEGORY_TABS.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? `bg-gradient-to-r ${cat.activeColor} text-white shadow-md`
                  : isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700 shadow-sm'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : cat.color}`} />
              <span>{isVietnamese ? cat.labelVi : cat.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* ─── CONTENT AREA ─── */}
      {!user ? (
        <div className={`p-8 text-center rounded-3xl border space-y-4 my-4 ${
          isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="w-14 h-14 rounded-3xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-2xl mx-auto shadow-inner">
            🔐
          </div>
          <div className="space-y-1">
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('Vui lòng đăng nhập', 'Please sign in')}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              {t(
                'Đăng nhập để xem, lưu trữ và đồng bộ hóa tất cả dự án video AI và tài nguyên đám mây của bạn.',
                'Sign in to access, manage, and sync all your AI video projects and cloud assets.'
              )}
            </p>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg active:scale-95 transition-all"
          >
            {isVietnamese ? 'Đăng Nhập Ngay' : 'Sign In Now'}
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
          <p className="text-xs text-slate-400">
            {t('Đang tải danh sách...', 'Loading assets...')}
          </p>
        </div>
      ) : activeCategory === 'projects' ? (
        /* ─── PROJECTS GRID ─── */
        filteredProjects.length === 0 ? (
          <EmptyState
            icon={<Film className="h-8 w-8 text-cyan-400" />}
            title={t('Chưa có dự án nào', 'No projects yet')}
            subtitle={t(
              'Hãy chuyển sang tab "AI Video" để tạo video đầu tiên!',
              'Go to "AI Video" tab to create your first video!'
            )}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProjects.map((p) => (
              <ProjectCard
                key={p.project_id}
                project={p}
                isDark={isDark}
                isVietnamese={isVietnamese}
                onOpen={() => openProject(p.project_id)}
                onDelete={() => handleDeleteProject(p)}
              />
            ))}
          </div>
        )
      ) : (
        /* ─── MEDIA FILES GRID ─── */
        filteredFiles.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-8 w-8 text-slate-500" />}
            title={t('Chưa có file nào', 'No assets yet')}
            subtitle={
              t('Nhấn nút ', 'Tap ') +
              (isVietnamese ? '↑ Upload' : '↑ Upload') +
              t(' để thêm file vào thư viện.', ' to add files to library.')
            }
          />
        ) : (
          <div className={`grid gap-3 ${activeCategory === 'audio' ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {filteredFiles.map((file) => (
              <MediaFileCard
                key={file.library_id}
                file={file}
                isDark={isDark}
                isVietnamese={isVietnamese}
                isPlaying={playingAudioId === file.library_id}
                onToggleAudio={() => handleToggleAudio(file)}
                onPreview={() => setPreviewFile(file)}
                onDelete={() => handleDeleteFile(file)}
                onUseInVideo={
                  file.category === 'audio' && onUseAudioInVideo
                    ? () => onUseAudioInVideo(file.file_url, file.filename)
                    : undefined
                }
              />
            ))}
          </div>
        )
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <PreviewModal
          file={previewFile}
          isDark={isDark}
          isVietnamese={isVietnamese}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 border-2 border-dashed border-slate-700/40 rounded-3xl">
      <div className="p-4 rounded-2xl bg-slate-800/50">{icon}</div>
      <div>
        <p className="text-sm font-bold text-slate-300">{title}</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

function ProjectCard({
  project: p,
  isDark,
  isVietnamese,
  onOpen,
  onDelete,
}: {
  project: MotionProject;
  isDark: boolean;
  isVietnamese: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const thumb = (p.scenes as any)?.[0]?.image_url || (p as any).thumbnail_url;

  return (
    <div
      className={`rounded-3xl border overflow-hidden transition-all group flex flex-col ${
        isDark
          ? 'bg-slate-900 border-slate-800 hover:border-cyan-500/40'
          : 'bg-white border-slate-200 shadow-sm hover:border-cyan-400/40'
      }`}
    >
      {/* Thumbnail */}
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center"
      >
        {thumb ? (
          <img
            src={thumb}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <Film className="h-7 w-7 text-cyan-400 opacity-60 mb-1" />
            <span className="text-[9px] text-cyan-300 font-bold uppercase tracking-wider">
              WynMotion
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-bold text-cyan-300">
          {getStyleLabel(p.visual_style)}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-[10px]">
            <Edit3 className="h-3 w-3" />
            <span>{isVietnamese ? 'Mở' : 'Open'}</span>
          </div>
        </div>
      </button>

      {/* Details */}
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <div className="flex-1">
          <h4
            className={`text-[11px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}
            title={p.title || p.prompt}
          >
            {p.title || p.prompt || 'Dự án WynMotion'}
          </h4>
          <div
            className={`flex items-center gap-2 text-[9px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <span className="flex items-center gap-0.5">
              <Layers className="h-2.5 w-2.5 text-cyan-400" />
              {p.scenes?.length || 0} scenes
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5 text-amber-400" />
              {Math.round(p.duration_sec || 0)}s
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/40">
          <button
            type="button"
            onClick={onOpen}
            className="flex-1 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <Edit3 className="h-3 w-3" />
            <span>{isVietnamese ? 'Biên Tập' : 'Edit'}</span>
          </button>

          {(p as any).mp4_url && (
            <a
              href={(p as any).mp4_url}
              download={`WynMotion_${p.project_id.slice(0, 8)}.mp4`}
              className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
              title={isVietnamese ? 'Tải Video MP4' : 'Download MP4'}
            >
              <Download className="h-3 w-3" />
            </a>
          )}

          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
            title={isVietnamese ? 'Xóa dự án' : 'Delete'}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaFileCard({
  file,
  isDark,
  isVietnamese,
  isPlaying,
  onToggleAudio,
  onPreview,
  onDelete,
  onUseInVideo,
}: {
  file: LibraryFile;
  isDark: boolean;
  isVietnamese: boolean;
  isPlaying: boolean;
  onToggleAudio: () => void;
  onPreview: () => void;
  onDelete: () => void;
  onUseInVideo?: () => void;
}) {
  const isAudio = file.category === 'audio';
  const isImage = file.category === 'images';
  const isVideo = file.category === 'videos';

  return (
    <div
      className={`rounded-3xl border overflow-hidden transition-all group flex flex-col ${
        isDark
          ? 'bg-slate-900 border-slate-800 hover:border-slate-600'
          : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
      } ${isAudio ? '' : ''}`}
    >
      {/* Preview Area */}
      {isAudio ? (
        /* Audio Card - Full Width Layout */
        <div
          className={`flex items-center gap-3 p-3.5 ${
            isDark ? 'bg-gradient-to-r from-purple-950/30 to-slate-900' : 'bg-gradient-to-r from-purple-50 to-white'
          }`}
        >
          <button
            type="button"
            onClick={onToggleAudio}
            className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center flex-shrink-0 hover:bg-purple-500/30 transition-all active:scale-90"
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-purple-300" /> : <Play className="h-4 w-4 fill-purple-300" />}
          </button>
          <div className="flex-1 min-w-0">
            <h4
              className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}
              title={file.filename}
            >
              {file.filename}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span>{formatFileSize(file.file_size)}</span>
              <span>·</span>
              <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {onUseInVideo && (
              <button
                type="button"
                onClick={onUseInVideo}
                className="px-2 py-1 rounded-xl bg-cyan-500/15 text-cyan-400 text-[10px] font-bold hover:bg-cyan-500/25 transition-colors"
              >
                {isVietnamese ? 'Dùng' : 'Use'}
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : (
        /* Image / Video Card */
        <>
          <button
            type="button"
            onClick={onPreview}
            className="relative aspect-video w-full bg-black/50 overflow-hidden flex items-center justify-center"
          >
            {isImage ? (
              <img
                src={file.file_url}
                alt={file.filename}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                <Video className="h-7 w-7 text-emerald-400 opacity-60" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-2.5 rounded-full bg-emerald-400 text-slate-950">
                    <Play className="h-3.5 w-3.5 fill-slate-950" />
                  </div>
                </div>
              </div>
            )}
          </button>

          {/* Details */}
          <div className="p-3 space-y-2">
            <div>
              <h4
                className={`text-[11px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                {file.filename}
              </h4>
              <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5">
                <span>{formatFileSize(file.file_size)}</span>
                <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800/40">
              <a
                href={file.file_url}
                download={file.filename}
                className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Download className="h-3 w-3" />
                <span>{isVietnamese ? 'Tải Về' : 'Download'}</span>
              </a>
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PreviewModal({
  file,
  isDark,
  isVietnamese,
  onClose,
}: {
  file: LibraryFile;
  isDark: boolean;
  isVietnamese: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 ${
          isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
          <h3
            className={`text-sm font-bold truncate max-w-[80%] ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            {file.filename}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[60vh]">
          {file.category === 'images' ? (
            <img src={file.file_url} alt={file.filename} className="max-h-[60vh] object-contain w-auto mx-auto" />
          ) : file.category === 'videos' ? (
            <video src={file.file_url} controls autoPlay className="max-h-[60vh] w-full" />
          ) : (
            <div className="p-8 text-center space-y-4 w-full">
              <div className="p-4 rounded-full bg-purple-500/20 text-purple-400 inline-block">
                <Music className="h-10 w-10" />
              </div>
              <audio src={file.file_url} controls autoPlay className="w-full max-w-xs mx-auto" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">{formatFileSize(file.file_size)}</span>
          <a
            href={file.file_url}
            download={file.filename}
            className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-300 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isVietnamese ? 'Tải File Về' : 'Download'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
