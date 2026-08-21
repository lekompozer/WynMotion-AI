'use client';

/**
 * MobileVideoEditorStudio.tsx — WynMotion-AI iOS App
 *
 * Mobile-optimized Video Editor:
 * - Compact Header + Settings Action Sheet
 * - AI Assistant Left Slide-over Drawer
 * - Auto-fit Canvas Preview Stage (16:9 / 9:16 / 1:1)
 * - Playback Controls (Play / Pause / Next / Prev scene)
 * - Horizontal Scene Timeline Carousel (tap-to-seek)
 * - Bottom Sheet from below: Assets | Audio & BGM | Canvas+Script Settings
 *   → Canvas Settings: Màu nền, Ngôn ngữ Text (VI / EN / Song ngữ),
 *     chỉnh sửa Script AI + Voice Transcript từng scene, Typography, ẩn/hiện phụ đề
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Settings,
  Download,
  Sparkles,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Folder,
  Music,
  Sliders,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Upload,
  Loader2,
  RefreshCw,
  Check,
  Layers,
  Volume2,
  VolumeX,
  Edit3,
  Type,
  Globe,
  Send,
  Mic,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { wynmotionService, MotionProject, MotionScene } from '@/services/wynmotionService';

// ─── Constants ─────────────────────────────────────────────────────────────

const BG_THEMES = [
  { label: 'Paper Cream', color: '#FAF7EF' },
  { label: 'Pure White', color: '#FFFFFF' },
  { label: 'Slate Mist', color: '#F1F5F9' },
  { label: 'Dark Navy', color: '#0F172A' },
  { label: 'Night Black', color: '#090A0F' },
  { label: 'Warm Sand', color: '#FFFBEB' },
];

type TextLangMode = 'vi' | 'en' | 'bilingual';
type BottomSheet = null | 'assets' | 'audio' | 'canvas';

// ─── Helper ─────────────────────────────────────────────────────────────────

function formatTimecode(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface MobileVideoEditorStudioProps {
  project: MotionProject;
  onBack: () => void;
}

export const MobileVideoEditorStudio: React.FC<MobileVideoEditorStudioProps> = ({
  project,
  onBack,
}) => {
  const { isDark, isVietnamese, t } = useApp();

  // ── Scenes State ──
  const [scenes, setScenes] = useState<MotionScene[]>(project.scenes || []);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [bgColor, setBgColor] = useState(project.bg_color || '#FAF7EF');
  const [aspectRatio, setAspectRatio] = useState(project.aspect_ratio || '16:9');

  // ── Playback ──
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Sidebars / Bottom Sheets ──
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [activeBottomSheet, setActiveBottomSheet] = useState<BottomSheet>(null);

  // ── AI Chat ──
  const [chatInput, setChatInput] = useState('');

  // ── Canvas Settings ──
  const [textLangMode, setTextLangMode] = useState<TextLangMode>('vi');

  // ── Audio ──
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const [customBgmFile, setCustomBgmFile] = useState<string | null>(null);
  const bgmFileInputRef = useRef<HTMLInputElement>(null);
  const assetFileInputRef = useRef<HTMLInputElement>(null);

  // ── Export ──
  const [isExporting, setIsExporting] = useState(false);
  const [exportJobId, setExportJobId] = useState<string | null>(null);

  // ── Auto-save debounce ──
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeScene: MotionScene | null = scenes[activeSceneIndex] ?? null;
  const totalDurationSec = scenes.reduce((sum, s) => sum + (s.duration_sec || 0), 0);

  // ── Playback timer ──
  useEffect(() => {
    if (isPlaying) {
      playbackTimerRef.current = setInterval(() => {
        setCurrentTimeSec((prev) => {
          const next = prev + 0.1;
          if (next >= totalDurationSec) {
            setIsPlaying(false);
            return 0;
          }
          // Auto-advance active scene
          let elapsed = 0;
          for (let i = 0; i < scenes.length; i++) {
            elapsed += scenes[i].duration_sec || 0;
            if (next < elapsed) {
              setActiveSceneIndex(i);
              break;
            }
          }
          return next;
        });
      }, 100);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, totalDurationSec, scenes]);

  // ── Scene click (timeline) ──
  const handleSceneClick = (index: number) => {
    setActiveSceneIndex(index);
    // Seek playhead to start of scene
    let elapsed = 0;
    for (let i = 0; i < index; i++) elapsed += scenes[i].duration_sec || 0;
    setCurrentTimeSec(elapsed);
  };

  // ── Update scene field with auto-save ──
  const updateScene = useCallback(
    (sceneId: string | number, updates: Partial<MotionScene>) => {
      setScenes((prev) =>
        prev.map((s) => (s.scene_id === sceneId ? { ...s, ...updates } : s))
      );
      // Debounced auto-save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        wynmotionService
          .updateProject(project.project_id, {
            scenes: scenes.map((s) =>
              s.scene_id === sceneId ? { ...s, ...updates } : s
            ) as MotionScene[],
          })
          .catch((err) => console.warn('Auto-save failed:', err));
      }, 1200);
    },
    [project.project_id, scenes]
  );

  // ── Export MP4 ──
  const handleExportMP4 = async () => {
    setIsExporting(true);
    try {
      const res = await wynmotionService.exportMP4(project.project_id, scenes);
      setExportJobId(res.job_id);
      if (res.mp4_url) {
        // Direct download
        const a = document.createElement('a');
        a.href = res.mp4_url;
        a.download = `WynMotion_${project.project_id.slice(0, 8)}.mp4`;
        a.click();
      } else {
        alert(
          t(
            `🎬 Đang render video MP4 (job: ${res.job_id.slice(0, 8)}...). Vui lòng quay lại sau vài phút.`,
            `🎬 Rendering MP4 (job: ${res.job_id.slice(0, 8)}...). Please check back in a few minutes.`
          )
        );
      }
    } catch (err: any) {
      alert(err.message || t('❌ Xuất video thất bại', '❌ Export failed'));
    } finally {
      setIsExporting(false);
    }
  };

  // ── Get thumbnail for scene ──
  const getSceneThumb = (s: MotionScene) => (s as any).image_url || null;

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden transition-colors ${
        isDark ? 'bg-[#0C0D14] text-white' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* ═══════════════════════════════════════════════════════════
          1. COMPACT HEADER
      ═══════════════════════════════════════════════════════════ */}
      <header
        className={`flex-shrink-0 flex items-center justify-between px-4 h-14 border-b z-30 ${
          isDark ? 'border-slate-800 bg-[#10121C]' : 'border-slate-200 bg-white shadow-sm'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className={`p-2 rounded-xl transition-all active:scale-90 ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex flex-col items-center min-w-0 flex-1 mx-2">
          <h1
            className={`text-xs font-black truncate max-w-full ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {project.title || project.prompt?.slice(0, 30) || 'WynMotion Project'}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/15 px-1.5 py-0.5 rounded-full">
              {project.visual_style?.replace('_', ' ') || 'Style'}
            </span>
            <span className="text-[10px] text-slate-500">{aspectRatio}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Settings */}
          <button
            type="button"
            onClick={() => setIsSettingsSheetOpen(true)}
            className={`p-2 rounded-xl transition-all active:scale-90 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Export MP4 */}
          <button
            type="button"
            onClick={handleExportMP4}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-black shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>MP4</span>
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          2. MAIN BODY: Canvas + Controls + Timeline + Tools
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* AI Assistant Button (floating top-left) */}
        <button
          type="button"
          onClick={() => setIsAISidebarOpen(true)}
          className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[11px] font-black backdrop-blur-sm hover:bg-cyan-500/30 active:scale-90 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI</span>
        </button>

        {/* ── Canvas Stage ── */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div
            className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-700/50 flex items-center justify-center"
            style={{
              backgroundColor: bgColor,
              width: aspectRatio === '9:16' ? '160px' : aspectRatio === '1:1' ? '240px' : '320px',
              aspectRatio:
                aspectRatio === '16:9' ? '16 / 9' : aspectRatio === '9:16' ? '9 / 16' : '1 / 1',
              maxHeight: '45vh',
            }}
          >
            {/* Scene Thumbnail Preview */}
            {activeScene && getSceneThumb(activeScene) ? (
              <img
                src={getSceneThumb(activeScene)!}
                alt={activeScene.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <Layers className="w-8 h-8 text-slate-400 opacity-40 mb-2" />
                <p className="text-xs font-bold text-slate-400 opacity-60">
                  {activeScene?.title || 'Scene Preview'}
                </p>
                <p className="text-[10px] text-slate-500 opacity-50 mt-1 line-clamp-2 leading-relaxed">
                  {(activeScene as any)?.voice_transcript || ''}
                </p>
              </div>
            )}

            {/* Scene number badge */}
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] font-bold text-white">
              {activeSceneIndex + 1} / {scenes.length}
            </div>

            {/* Text Overlay: show subtitle based on lang mode */}
            {activeScene && !(activeScene as any).hide_text && (
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <div
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold text-white leading-snug"
                  style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
                >
                  {textLangMode === 'vi' &&
                    ((activeScene as any).voice_transcript || activeScene.summary_text || activeScene.title)}
                  {textLangMode === 'en' &&
                    ((activeScene as any).voice_transcript_en || (activeScene as any).voice_transcript || activeScene.title)}
                  {textLangMode === 'bilingual' && (
                    <>
                      <div>{(activeScene as any).voice_transcript || activeScene.title}</div>
                      {(activeScene as any).voice_transcript_en && (
                        <div className="text-cyan-200 text-[9px] mt-0.5">
                          {(activeScene as any).voice_transcript_en}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Playback Controls ── */}
        <div
          className={`flex-shrink-0 flex items-center justify-between px-6 py-3 border-t ${
            isDark ? 'border-slate-800 bg-[#10121C]' : 'border-slate-100 bg-white'
          }`}
        >
          {/* Prev Scene */}
          <button
            type="button"
            onClick={() => handleSceneClick(Math.max(0, activeSceneIndex - 1))}
            disabled={activeSceneIndex === 0}
            className={`p-2 rounded-xl transition-all active:scale-90 disabled:opacity-30 ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Timecode */}
          <div className="flex flex-col items-center gap-0.5">
            <div className={`text-xs font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {formatTimecode(currentTimeSec)} /{' '}
              {formatTimecode(totalDurationSec)}
            </div>
            {/* Mini Progress Bar */}
            <div className={`w-32 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <div
                className="h-1 rounded-full bg-cyan-400 transition-all"
                style={{
                  width: totalDurationSec > 0 ? `${(currentTimeSec / totalDurationSec) * 100}%` : '0%',
                }}
              />
            </div>
          </div>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={() => setIsPlaying((v) => !v)}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center shadow-md shadow-cyan-500/20 active:scale-90 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-slate-950" />
            ) : (
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            )}
          </button>

          {/* Next Scene */}
          <button
            type="button"
            onClick={() => handleSceneClick(Math.min(scenes.length - 1, activeSceneIndex + 1))}
            disabled={activeSceneIndex === scenes.length - 1}
            className={`p-2 rounded-xl transition-all active:scale-90 disabled:opacity-30 ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* ── Horizontal Scene Timeline ── */}
        <div
          className={`flex-shrink-0 border-t ${
            isDark ? 'border-slate-800 bg-[#0E0F18]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-none">
            {scenes.map((s, idx) => {
              const isActive = idx === activeSceneIndex;
              const thumb = getSceneThumb(s);
              return (
                <button
                  key={s.scene_id || idx}
                  type="button"
                  onClick={() => handleSceneClick(idx)}
                  className={`flex-shrink-0 w-16 rounded-2xl border overflow-hidden transition-all active:scale-95 ${
                    isActive
                      ? 'border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                      : isDark
                      ? 'border-slate-700 hover:border-slate-500'
                      : 'border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {/* Scene thumbnail */}
                  <div
                    className={`w-full aspect-video flex items-center justify-center ${
                      isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}
                    style={{ backgroundColor: thumb ? undefined : bgColor }}
                  >
                    {thumb ? (
                      <img src={thumb} alt={s.title} className="w-full h-full object-cover" />
                    ) : (
                      <Layers
                        className={`w-4 h-4 ${
                          isActive ? 'text-cyan-400' : isDark ? 'text-slate-600' : 'text-slate-400'
                        }`}
                      />
                    )}
                  </div>
                  {/* Scene label */}
                  <div
                    className={`px-1 py-1 text-center ${
                      isDark ? 'bg-slate-900' : 'bg-white'
                    }`}
                  >
                    <div
                      className={`text-[9px] font-bold truncate ${
                        isActive ? 'text-cyan-400' : isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      S{idx + 1}
                    </div>
                    <div className={`text-[8px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      {Math.round(s.duration_sec || 0)}s
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Bottom Toolbar: Assets | Audio | Canvas Settings ── */}
        <div
          className={`flex-shrink-0 flex items-center justify-around px-4 py-3 border-t ${
            isDark ? 'border-slate-800 bg-[#10121C]' : 'border-slate-200 bg-white shadow-sm'
          }`}
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
        >
          {[
            { id: 'assets' as BottomSheet, icon: Folder, labelVi: 'Assets', labelEn: 'Assets', color: 'text-amber-400' },
            { id: 'audio' as BottomSheet, icon: Music, labelVi: 'Âm Thanh', labelEn: 'Audio', color: 'text-purple-400' },
            { id: 'canvas' as BottomSheet, icon: Sliders, labelVi: 'Canvas', labelEn: 'Canvas', color: 'text-cyan-400' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeBottomSheet === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveBottomSheet(isActive ? null : item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all active:scale-90 ${
                  isActive
                    ? `bg-slate-800/80 border border-slate-600 ${item.color}`
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">
                  {isVietnamese ? item.labelVi : item.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. BOTTOM SHEETS
      ═══════════════════════════════════════════════════════════ */}
      {activeBottomSheet && (
        <BottomSheetOverlay
          isDark={isDark}
          onClose={() => setActiveBottomSheet(null)}
        >
          {/* ── ASSETS SHEET ── */}
          {activeBottomSheet === 'assets' && (
            <div className="space-y-4">
              <SheetHeader
                title={t('Assets & Phân Cảnh', 'Assets & Scenes')}
                subtitle={`${scenes.length} scenes`}
                isDark={isDark}
                onClose={() => setActiveBottomSheet(null)}
              />

              {/* Upload custom image */}
              <label
                className={`flex items-center gap-2 p-3 rounded-2xl border border-dashed cursor-pointer transition-all ${
                  isDark
                    ? 'border-slate-600 hover:border-cyan-400 bg-slate-800/50'
                    : 'border-slate-300 hover:border-cyan-400 bg-slate-50'
                }`}
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('+ Upload Ảnh Tùy Biến vào Scene', '+ Upload Image to Scene')}
                </span>
                <input
                  ref={assetFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && activeScene) {
                      const url = URL.createObjectURL(file);
                      updateScene(activeScene.scene_id, { image_url: url } as any);
                    }
                  }}
                />
              </label>

              {/* Scenes list */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {scenes.map((s, idx) => {
                  const isActive = idx === activeSceneIndex;
                  const thumb = getSceneThumb(s);
                  return (
                    <button
                      key={s.scene_id || idx}
                      type="button"
                      onClick={() => {
                        handleSceneClick(idx);
                        setActiveBottomSheet(null);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-[0.98] ${
                        isActive
                          ? isDark
                            ? 'border-cyan-500/50 bg-cyan-500/10'
                            : 'border-cyan-400 bg-cyan-50'
                          : isDark
                          ? 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div
                        className={`w-14 rounded-xl overflow-hidden flex-shrink-0 ${
                          isDark ? 'bg-slate-700' : 'bg-slate-100'
                        }`}
                        style={{ aspectRatio: '16/9' }}
                      >
                        {thumb ? (
                          <img src={thumb} alt={s.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Layers className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div
                          className={`text-xs font-bold truncate ${
                            isActive ? 'text-cyan-400' : isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          Scene {idx + 1}: {s.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {Math.round(s.duration_sec || 0)}s
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── AUDIO SHEET ── */}
          {activeBottomSheet === 'audio' && (
            <div className="space-y-5">
              <SheetHeader
                title={t('Âm Thanh & Nhạc Nền', 'Audio & Background Music')}
                isDark={isDark}
                onClose={() => setActiveBottomSheet(null)}
              />

              {/* Voice Narration volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className={`text-xs font-bold flex items-center gap-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t('Giọng đọc AI (Voice)', 'AI Narration Volume')}</span>
                  </label>
                  <span className="text-xs font-bold text-cyan-400">
                    {Math.round(voiceVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* BGM Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className={`text-xs font-bold flex items-center gap-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5 text-purple-400" />
                    <span>{t('Nhạc nền (BGM)', 'Background Music')}</span>
                  </label>
                  <span className="text-xs font-bold text-purple-400">
                    {Math.round(bgmVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={bgmVolume}
                  onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>

              {/* Custom BGM upload */}
              <label
                className={`flex items-center gap-2 p-3 rounded-2xl border border-dashed cursor-pointer transition-all ${
                  isDark
                    ? 'border-slate-600 hover:border-purple-400 bg-slate-800/50'
                    : 'border-slate-300 hover:border-purple-400 bg-slate-50'
                }`}
              >
                <Upload className="w-4 h-4 text-purple-400" />
                <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {customBgmFile
                    ? `✓ ${customBgmFile}`
                    : t('+ Tải nhạc nền MP3/WAV lên', '+ Upload BGM Track MP3/WAV')}
                </span>
                <input
                  ref={bgmFileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCustomBgmFile(file.name);
                  }}
                />
              </label>
            </div>
          )}

          {/* ── CANVAS SETTINGS SHEET ── */}
          {activeBottomSheet === 'canvas' && (
            <div className="space-y-5">
              <SheetHeader
                title={t('Canvas Settings & Script', 'Canvas Settings & Script')}
                isDark={isDark}
                onClose={() => setActiveBottomSheet(null)}
              />

              {/* Background Color */}
              <div className="space-y-2.5">
                <label
                  className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                >
                  {t('Màu Nền Canvas', 'Canvas Background')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BG_THEMES.map((theme) => (
                    <button
                      key={theme.color}
                      type="button"
                      onClick={() => setBgColor(theme.color)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-[10px] font-bold transition-all ${
                        bgColor === theme.color
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                          : isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-400'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 flex-shrink-0"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span className="truncate">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2.5 pt-3 border-t border-slate-700/40">
                <label className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {t('Tỷ Lệ Khung Hình', 'Aspect Ratio')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['16:9', '9:16', '1:1'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        aspectRatio === r
                          ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                          : isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-400'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Language Mode */}
              <div className="space-y-2.5 pt-3 border-t border-slate-700/40">
                <label
                  className={`text-xs font-bold flex items-center gap-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('Ngôn Ngữ Hiển Thị Text / Phụ Đề', 'Subtitle Language Mode')}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'vi' as TextLangMode, label: '🇻🇳 VI' },
                    { id: 'en' as TextLangMode, label: '🇺🇸 EN' },
                    { id: 'bilingual' as TextLangMode, label: '⚡ VI+EN' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setTextLangMode(m.id)}
                      className={`py-2 rounded-xl border text-[11px] font-bold transition-all ${
                        textLangMode === m.id
                          ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                          : isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-400'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Scene Script / Transcript Editor */}
              {activeScene && (
                <div className="space-y-2.5 pt-3 border-t border-slate-700/40">
                  <label
                    className={`text-xs font-bold flex items-center gap-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {t(
                        `Chỉnh Sửa Script · Scene ${activeSceneIndex + 1}`,
                        `Edit Script · Scene ${activeSceneIndex + 1}`
                      )}
                    </span>
                  </label>

                  {/* Voice Transcript (VI) */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      🇻🇳 Voice Transcript (VI)
                    </div>
                    <textarea
                      value={(activeScene as any).voice_transcript || activeScene.summary_text || activeScene.title || ''}
                      onChange={(e) =>
                        updateScene(activeScene.scene_id, {
                          voice_transcript: e.target.value,
                          summary_text: e.target.value,
                        } as any)
                      }
                      rows={3}
                      className={`w-full px-3 py-2 rounded-xl text-xs border resize-none focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                      placeholder={t('Nhập kịch bản / phụ đề tiếng Việt...', 'Enter Vietnamese script...')}
                    />
                  </div>

                  {/* Voice Transcript EN */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      🇺🇸 Voice Transcript (EN)
                    </div>
                    <textarea
                      value={(activeScene as any).voice_transcript_en || ''}
                      onChange={(e) =>
                        updateScene(activeScene.scene_id, {
                          voice_transcript_en: e.target.value,
                        } as any)
                      }
                      rows={3}
                      className={`w-full px-3 py-2 rounded-xl text-xs border resize-none focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                      placeholder={t('Nhập kịch bản / phụ đề tiếng Anh...', 'Enter English script...')}
                    />
                  </div>
                </div>
              )}

              {/* Hide/Show Text Per Scene */}
              <div className="space-y-2.5 pt-3 border-t border-slate-700/40">
                <label
                  className={`text-xs font-bold flex items-center gap-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  <Type className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('Ẩn / Hiện Phụ Đề Từng Scene', 'Toggle Subtitle Per Scene')}</span>
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {scenes.map((s, idx) => {
                    const isHidden = (s as any).hide_text === true;
                    return (
                      <div
                        key={s.scene_id || idx}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${
                          isHidden
                            ? isDark
                              ? 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                            : isDark
                            ? 'bg-slate-800 border-slate-700 text-slate-200'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] font-bold w-5 text-center">S{idx + 1}</span>
                          <span className="truncate text-[11px]">
                            {s.title || (s as any).summary_text?.slice(0, 24) || `Scene ${idx + 1}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateScene(s.scene_id, { hide_text: !isHidden } as any)
                          }
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            isHidden
                              ? 'bg-slate-700 text-slate-400'
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {isHidden ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                          <span>{isHidden ? t('Ẩn', 'Hidden') : t('Hiện', 'Shown')}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </BottomSheetOverlay>
      )}

      {/* ═══════════════════════════════════════════════════════════
          4. AI ASSISTANT LEFT SLIDE-OVER DRAWER
      ═══════════════════════════════════════════════════════════ */}
      {isAISidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAISidebarOpen(false)}
          />
          {/* Drawer */}
          <div
            className={`relative z-10 w-72 h-full flex flex-col animate-in slide-in-from-left-full duration-200 ${
              isDark ? 'bg-[#10121C] border-r border-slate-800' : 'bg-white border-r border-slate-200 shadow-2xl'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-4 h-14 border-b flex-shrink-0 ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-cyan-400">WYNRISE AI</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAISidebarOpen(false)}
                className={`p-1.5 rounded-xl transition-all ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* WynRise message */}
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  isDark ? 'bg-slate-800 border border-slate-700 text-slate-300' : 'bg-slate-50 border border-slate-200 text-slate-700'
                }`}
              >
                {t(
                  'Xin chào! Tôi là WynRise AI. Hãy nhập yêu cầu chỉnh sửa video của bạn bên dưới.',
                  "Hello! I'm WynRise AI. Type an edit request below and I'll help you update this video."
                )}
              </div>

              {/* Active Scene Transcript Editor */}
              {activeScene && (
                <div
                  className={`p-3 rounded-2xl border space-y-2 ${
                    isDark
                      ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/30'
                      : 'bg-blue-50 border-cyan-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400">
                    <span className="flex items-center gap-1">
                      <Edit3 className="w-3 h-3" />
                      {t(`Phụ Đề Scene ${activeSceneIndex + 1}`, `Scene ${activeSceneIndex + 1} Subtitle`)}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {(activeScene as any).start_sec?.toFixed(1)}s
                    </span>
                  </div>
                  <textarea
                    value={(activeScene as any).voice_transcript || activeScene.summary_text || activeScene.title || ''}
                    onChange={(e) =>
                      updateScene(activeScene.scene_id, {
                        voice_transcript: e.target.value,
                        summary_text: e.target.value,
                      } as any)
                    }
                    rows={3}
                    className={`w-full px-2.5 py-2 rounded-xl text-[11px] border resize-none focus:outline-none focus:border-cyan-400 transition-all ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder={t(
                      'Chỉnh sửa phụ đề / kịch bản phân cảnh này...',
                      'Edit this scene subtitle or script...'
                    )}
                  />
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div
              className={`p-3 border-t flex-shrink-0 ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t('Nhập yêu cầu chỉnh sửa...', 'Type an edit request...')}
                  className={`w-full pl-3 pr-14 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-400 transition-all ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Future: trigger AI edit
                      setChatInput('');
                    }
                  }}
                />
                <div className="absolute right-2 flex items-center gap-1 text-slate-400">
                  <button className="p-1 hover:text-cyan-400 transition-colors">
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          5. SETTINGS ACTION SHEET (Header Settings)
      ═══════════════════════════════════════════════════════════ */}
      {isSettingsSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSettingsSheetOpen(false)}
          />
          <div
            className={`relative z-10 w-full rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom-full duration-200 ${
              isDark ? 'bg-[#12141F] border-t border-slate-700' : 'bg-white border-t border-slate-200 shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('Cài Đặt & Nâng Cao', 'Settings & Advanced')}
              </h3>
              <button
                type="button"
                onClick={() => setIsSettingsSheetOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Project info */}
            <div
              className={`p-3.5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{t('Dự án:', 'Project:')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {project.project_id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{t('Phong cách:', 'Style:')}</span>
                <span className="font-bold text-cyan-400">{project.visual_style}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{t('Ngôn ngữ:', 'Language:')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {project.language_code?.toUpperCase() || 'VI'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{t('Số phân cảnh:', 'Scenes:')}</span>
                <span className="font-bold text-amber-400">{scenes.length}</span>
              </div>
            </div>

            {/* Refresh Scenes */}
            <button
              type="button"
              onClick={async () => {
                const res = await wynmotionService.getProject(project.project_id);
                if (res.project?.scenes) setScenes(res.project.scenes);
                setIsSettingsSheetOpen(false);
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition-all active:scale-95 ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700'
                  : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>{t('Tải Lại Dữ Liệu Dự Án', 'Reload Project Data')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Helper Sub-Components ───────────────────────────────────────────────────

function BottomSheetOverlay({
  isDark,
  children,
  onClose,
}: {
  isDark: boolean;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {/* Sheet */}
      <div
        className={`relative z-10 w-full max-h-[75vh] overflow-y-auto rounded-t-3xl p-5 animate-in slide-in-from-bottom-full duration-200 ${
          isDark ? 'bg-[#12141F] border-t border-slate-700' : 'bg-white border-t border-slate-200 shadow-2xl'
        }`}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-slate-600/60 mx-auto mb-4" />
        {children}
        {/* Safe area padding */}
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  );
}

function SheetHeader({
  title,
  subtitle,
  isDark,
  onClose,
}: {
  title: string;
  subtitle?: string;
  isDark: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className={`p-1.5 rounded-xl transition-all ${
          isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'
        }`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
