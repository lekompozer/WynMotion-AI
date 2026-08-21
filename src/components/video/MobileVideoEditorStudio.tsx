'use client';

/**
 * MobileVideoEditorStudio.tsx — WynMotion-AI iOS App
 *
 * Mobile-optimized Video Editor:
 * - 44px Safe-area Notch / Dynamic Island Header Padding
 * - Complete 6-style dynamic rendering via MobileDynamicSceneRenderer
 * - Robust Playback Timer with Per-Scene Relative Progress
 * - Audio playback synchronization
 * - Large, beautiful, high-contrast typography matching Video Creation Modals
 * - Bottom Sheet from below: Assets | Audio & BGM | Canvas+Script Settings
 * - AI Assistant Left Slide-over Drawer (WynRise AI)
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
  Upload,
  Loader2,
  RefreshCw,
  Check,
  Layers,
  Volume2,
  Edit3,
  Type,
  Globe,
  Send,
  Mic,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { wynmotionService, MotionProject, MotionScene } from '@/services/wynmotionService';
import { MobileDynamicSceneRenderer } from '@/components/video/MobileDynamicSceneRenderer';

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

export function getSceneDuration(s: MotionScene): number {
  if (s.duration_sec && s.duration_sec > 0) return s.duration_sec;
  if ((s as any).duration && (s as any).duration > 0) return (s as any).duration;
  if ((s as any).duration_frames && (s as any).duration_frames > 0) return (s as any).duration_frames / 30;
  if (s.end_time_sec && s.start_time_sec !== undefined && s.end_time_sec > s.start_time_sec) {
    return s.end_time_sec - s.start_time_sec;
  }
  return 5; // Default 5 seconds per scene
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
  const [scenes, setScenes] = useState<MotionScene[]>(
    project.scenes && project.scenes.length > 0
      ? project.scenes
      : [
          {
            scene_id: 'scene_1',
            order: 1,
            title: project.title || 'Scene 1',
            duration_sec: 5,
            actions: [],
            voice_transcript: project.prompt || 'WynMotion AI Scene',
          },
        ]
  );
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

  // Calculate cumulative duration
  const totalDurationSec = Math.max(
    5,
    project.duration_sec || scenes.reduce((sum, s) => sum + getSceneDuration(s), 0)
  );

  // Calculate relative time inside current active scene
  let prevScenesElapsed = 0;
  for (let i = 0; i < activeSceneIndex; i++) {
    prevScenesElapsed += getSceneDuration(scenes[i]);
  }
  const currentSceneRelativeTime = Math.max(0, currentTimeSec - prevScenesElapsed);
  const activeSceneDuration = activeScene ? getSceneDuration(activeScene) : 5;

  // ── Playback timer loop ──
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 50;
      const stepSec = intervalMs / 1000; // 0.05s

      playbackTimerRef.current = setInterval(() => {
        setCurrentTimeSec((prev) => {
          const next = prev + stepSec;
          if (next >= totalDurationSec) {
            setIsPlaying(false);
            return 0;
          }
          // Auto-advance active scene index
          let elapsed = 0;
          for (let i = 0; i < scenes.length; i++) {
            const d = getSceneDuration(scenes[i]);
            elapsed += d;
            if (next < elapsed) {
              setActiveSceneIndex(i);
              break;
            }
          }
          return next;
        });
      }, intervalMs);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, totalDurationSec, scenes]);

  // Sync audio tag with playback state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.currentTime = currentTimeSec;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // ── Scene click (timeline) ──
  const handleSceneClick = (index: number) => {
    setActiveSceneIndex(index);
    let elapsed = 0;
    for (let i = 0; i < index; i++) elapsed += getSceneDuration(scenes[i]);
    setCurrentTimeSec(elapsed);
    if (audioRef.current) {
      audioRef.current.currentTime = elapsed;
    }
  };

  // ── Update scene field with auto-save ──
  const updateScene = useCallback(
    (sceneId: string | number, updates: Partial<MotionScene>) => {
      setScenes((prev) =>
        prev.map((s) => (s.scene_id === sceneId ? { ...s, ...updates } : s))
      );
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

  const getSceneThumb = (s: MotionScene) => (s as any).image_url || null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden transition-colors ${
        isDark ? 'bg-[#080B10] text-white' : 'bg-[#FAFAFC] text-slate-900'
      }`}
    >
      {/* Hidden audio element for project audio sync */}
      {project.audio_url && (
        <audio
          ref={audioRef}
          src={project.audio_url}
          preload="auto"
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          1. COMPACT HEADER (Pushed down 44px for iPhone Notch / Dynamic Island)
      ═══════════════════════════════════════════════════════════ */}
      <header
        className={`flex-shrink-0 flex items-center justify-between px-4 pb-3 border-b z-30 transition-colors ${
          isDark
            ? 'border-slate-800/80 bg-[#0F131C]/95 backdrop-blur-md'
            : 'border-slate-200 bg-white/95 backdrop-blur-md shadow-sm'
        }`}
        style={{ paddingTop: 'max(env(safe-area-inset-top, 44px), 44px)' }}
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className={`p-2 rounded-2xl transition-all active:scale-90 ${
            isDark
              ? 'text-slate-300 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title & Metadata */}
        <div className="flex flex-col items-center min-w-0 flex-1 mx-2">
          <h1
            className={`text-sm font-black truncate max-w-full tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {project.title || project.prompt?.slice(0, 30) || 'WynMotion Project'}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {project.visual_style?.replace(/_/g, ' ') || 'Style'}
            </span>
            <span className="text-[10px] font-bold text-slate-400">{aspectRatio}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsSheetOpen(true)}
            className={`p-2 rounded-2xl transition-all active:scale-90 ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Export MP4 Button */}
          <button
            type="button"
            onClick={handleExportMP4}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
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
          2. MAIN BODY: Dynamic Canvas + Controls + Timeline + Toolbar
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* AI Assistant Floating Button (Top-Left) */}
        <button
          type="button"
          onClick={() => setIsAISidebarOpen(true)}
          className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 text-xs font-black backdrop-blur-md hover:bg-cyan-500/30 active:scale-90 transition-all shadow-md"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>WynRise AI</span>
        </button>

        {/* ── Dynamic Canvas Stage ── */}
        <div className="flex-1 flex items-center justify-center p-3 overflow-hidden">
          <div
            className="relative shadow-2xl rounded-3xl overflow-hidden border border-slate-700/60 flex items-center justify-center transition-all"
            style={{
              backgroundColor: bgColor,
              width: aspectRatio === '9:16' ? '180px' : aspectRatio === '1:1' ? '260px' : '340px',
              aspectRatio:
                aspectRatio === '16:9' ? '16 / 9' : aspectRatio === '9:16' ? '9 / 16' : '1 / 1',
              maxHeight: '46vh',
            }}
          >
            {/* Dynamic Multi-Style Renderer */}
            {activeScene ? (
              <MobileDynamicSceneRenderer
                scene={activeScene}
                visualStyle={project.visual_style || 'whiteboard_stream_hand'}
                currentTimeSec={currentSceneRelativeTime}
                totalSceneDurationSec={activeSceneDuration}
                bgColor={bgColor}
                aspectRatio={aspectRatio}
                textLangMode={textLangMode}
                showSubtitle={!(activeScene as any).hide_text}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <Layers className="w-8 h-8 text-slate-400 opacity-40 mb-2" />
                <p className="text-xs font-bold text-slate-400 opacity-60">Scene Preview</p>
              </div>
            )}

            {/* Scene counter pill (top-right) */}
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-black text-white z-30">
              {activeSceneIndex + 1} / {scenes.length}
            </div>
          </div>
        </div>

        {/* ── Playback Controller Row ── */}
        <div
          className={`flex-shrink-0 flex items-center justify-between px-6 py-2.5 border-t ${
            isDark ? 'border-slate-800/80 bg-[#0F131C]' : 'border-slate-100 bg-white'
          }`}
        >
          {/* Prev Scene */}
          <button
            type="button"
            onClick={() => handleSceneClick(Math.max(0, activeSceneIndex - 1))}
            disabled={activeSceneIndex === 0}
            className={`p-2 rounded-2xl transition-all active:scale-90 disabled:opacity-30 ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Timecode & Progress bar */}
          <div className="flex flex-col items-center gap-1">
            <div className={`text-xs font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {formatTimecode(currentTimeSec)} / {formatTimecode(totalDurationSec)}
            </div>
            <div className={`w-36 h-1.5 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <div
                className="h-1.5 rounded-full bg-cyan-400 transition-all shadow-sm"
                style={{
                  width: totalDurationSec > 0 ? `${(currentTimeSec / totalDurationSec) * 100}%` : '0%',
                }}
              />
            </div>
          </div>

          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (currentTimeSec >= totalDurationSec) {
                setCurrentTimeSec(0);
                setActiveSceneIndex(0);
              }
              setIsPlaying((v) => !v);
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center shadow-md shadow-cyan-500/25 active:scale-90 transition-all"
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
            className={`p-2 rounded-2xl transition-all active:scale-90 disabled:opacity-30 ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* ── Horizontal Scene Timeline Carousel ── */}
        <div
          className={`flex-shrink-0 border-t ${
            isDark ? 'border-slate-800/80 bg-[#0A0D15]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-none">
            {scenes.map((s, idx) => {
              const isActive = idx === activeSceneIndex;
              const thumb = getSceneThumb(s);
              const dur = getSceneDuration(s);
              return (
                <button
                  key={s.scene_id || idx}
                  type="button"
                  onClick={() => handleSceneClick(idx)}
                  className={`flex-shrink-0 w-20 rounded-2xl border overflow-hidden transition-all active:scale-95 flex flex-col ${
                    isActive
                      ? 'border-cyan-400 shadow-md shadow-cyan-500/20 ring-2 ring-cyan-400/50'
                      : isDark
                      ? 'border-slate-700 bg-slate-800/60 hover:border-slate-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
                    style={{ aspectRatio: '16/9' }}
                  >
                    {thumb ? (
                      <img src={thumb} alt={s.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-1 text-center">
                    <span
                      className={`text-[9px] font-bold block truncate ${
                        isActive ? 'text-cyan-400' : isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      S{idx + 1}: {Math.round(dur)}s
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Bottom Action Toolbar ── */}
        <div
          className={`flex-shrink-0 flex items-center justify-around px-4 py-3 border-t pb-[calc(max(env(safe-area-inset-bottom,0px),10px)+0.5rem)] ${
            isDark ? 'border-slate-800 bg-[#0F131C]' : 'border-slate-200 bg-white shadow-sm'
          }`}
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
                className={`flex flex-col items-center gap-1.5 px-5 py-2 rounded-2xl transition-all active:scale-90 ${
                  isActive
                    ? `bg-slate-800/90 border border-slate-600 ${item.color} shadow-sm`
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold">
                  {isVietnamese ? item.labelVi : item.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. BOTTOM SHEETS (Large Typography Matching Wizard Modals)
      ═══════════════════════════════════════════════════════════ */}
      {activeBottomSheet && (
        <BottomSheetOverlay isDark={isDark} onClose={() => setActiveBottomSheet(null)}>
          {/* ── ASSETS SHEET ── */}
          {activeBottomSheet === 'assets' && (
            <div className="space-y-5">
              <SheetHeader
                title={t('Assets & Phân Cảnh', 'Assets & Scenes')}
                subtitle={`${scenes.length} scenes`}
                isDark={isDark}
                onClose={() => setActiveBottomSheet(null)}
              />

              {/* Upload image button */}
              <label
                className={`flex items-center gap-2.5 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  isDark
                    ? 'border-slate-700 hover:border-cyan-400 bg-slate-800/40'
                    : 'border-slate-300 hover:border-cyan-400 bg-slate-50'
                }`}
              >
                <Upload className="w-5 h-5 text-cyan-400" />
                <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {t('+ Tải Ảnh Tùy Biến Lên Scene Này', '+ Upload Custom Image to Scene')}
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

              {/* Scene list */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {scenes.map((s, idx) => {
                  const isActive = idx === activeSceneIndex;
                  const thumb = getSceneThumb(s);
                  const dur = getSceneDuration(s);
                  return (
                    <button
                      key={s.scene_id || idx}
                      type="button"
                      onClick={() => {
                        handleSceneClick(idx);
                        setActiveBottomSheet(null);
                      }}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
                        isActive
                          ? isDark
                            ? 'border-cyan-500/60 bg-cyan-500/15 shadow-sm'
                            : 'border-cyan-400 bg-cyan-50'
                          : isDark
                          ? 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-16 rounded-xl overflow-hidden flex-shrink-0 ${
                          isDark ? 'bg-slate-800' : 'bg-slate-100'
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
                      <div className="flex-1 min-w-0 text-left">
                        <div
                          className={`text-sm font-black truncate ${
                            isActive ? 'text-cyan-400' : isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          Scene {idx + 1}: {s.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {Math.round(dur)}s duration
                        </div>
                      </div>
                      {isActive && <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── AUDIO SHEET ── */}
          {activeBottomSheet === 'audio' && (
            <div className="space-y-6">
              <SheetHeader
                title={t('Âm Thanh & Nhạc Nền', 'Audio & Background Music')}
                isDark={isDark}
                onClose={() => setActiveBottomSheet(null)}
              />

              {/* Voice volume */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label
                    className={`text-sm font-bold flex items-center gap-2 ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>{t('Giọng Đọc AI (Voice Narration)', 'AI Narration Volume')}</span>
                  </label>
                  <span className="text-sm font-black text-cyan-400">
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
                  className="w-full accent-cyan-400 h-2 rounded-lg"
                />
              </div>

              {/* BGM volume */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label
                    className={`text-sm font-bold flex items-center gap-2 ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    <Music className="w-4 h-4 text-purple-400" />
                    <span>{t('Nhạc Nền (BGM Volume)', 'Background Music Volume')}</span>
                  </label>
                  <span className="text-sm font-black text-purple-400">
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
                  className="w-full accent-purple-400 h-2 rounded-lg"
                />
              </div>

              {/* BGM file upload */}
              <label
                className={`flex items-center gap-2.5 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  isDark
                    ? 'border-slate-700 hover:border-purple-400 bg-slate-800/40'
                    : 'border-slate-300 hover:border-purple-400 bg-slate-50'
                }`}
              >
                <Upload className="w-5 h-5 text-purple-400" />
                <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {customBgmFile
                    ? `✓ ${customBgmFile}`
                    : t('+ Tải File Nhạc Nền MP3/WAV Lên', '+ Upload Custom BGM Track (MP3/WAV)')}
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

          {/* ── CANVAS SETTINGS SHEET (Large Typography) ── */}
          {activeBottomSheet === 'canvas' && (
            <div className="space-y-6">
              <SheetHeader
                title={t('Cài Đặt Canvas & Kịch Bản', 'Canvas Settings & Script')}
                isDark={isDark}
                onClose={() => setActiveBottomSheet(null)}
              />

              {/* Background Color themes */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  {t('1. Màu Nền Canvas', '1. Canvas Background')}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {BG_THEMES.map((theme) => (
                    <button
                      key={theme.color}
                      type="button"
                      onClick={() => setBgColor(theme.color)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                        bgColor === theme.color
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/40 shadow-sm'
                          : isDark
                          ? 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/20 flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span className="truncate">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  {t('2. Tỷ Lệ Khung Hình', '2. Aspect Ratio')}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['16:9', '9:16', '1:1'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`py-3 rounded-2xl border text-sm font-black transition-all ${
                        aspectRatio === r
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/40 shadow-sm'
                          : isDark
                          ? 'border-slate-800 bg-slate-900 text-slate-400'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text / Subtitle Language Mode */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>{t('3. Chế Độ Hiển Thị Phụ Đề', '3. Subtitle Language Mode')}</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'vi' as TextLangMode, label: '🇻🇳 Tiếng Việt' },
                    { id: 'en' as TextLangMode, label: '🇺🇸 English' },
                    { id: 'bilingual' as TextLangMode, label: '⚡ Song Ngữ' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setTextLangMode(m.id)}
                      className={`py-3 rounded-2xl border text-xs font-black transition-all ${
                        textLangMode === m.id
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/40 shadow-sm'
                          : isDark
                          ? 'border-slate-800 bg-slate-900 text-slate-400'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Scene Script Editor (Large text) */}
              {activeScene && (
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-cyan-400" />
                    <span>
                      {t(
                        `4. Kịch Bản & Lời Thoại · Scene ${activeSceneIndex + 1}`,
                        `4. Script & Narration · Scene ${activeSceneIndex + 1}`
                      )}
                    </span>
                  </label>

                  {/* Voice Transcript (VI) */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      🇻🇳 Voice Transcript (Tiếng Việt)
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
                      className={`w-full px-4 py-3 rounded-2xl text-sm leading-relaxed border resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                      placeholder={t('Nhập kịch bản tiếng Việt...', 'Enter Vietnamese narration...')}
                    />
                  </div>

                  {/* Voice Transcript (EN) */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      🇺🇸 Voice Transcript (English)
                    </div>
                    <textarea
                      value={(activeScene as any).voice_transcript_en || ''}
                      onChange={(e) =>
                        updateScene(activeScene.scene_id, {
                          voice_transcript_en: e.target.value,
                        } as any)
                      }
                      rows={3}
                      className={`w-full px-4 py-3 rounded-2xl text-sm leading-relaxed border resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                      placeholder={t('Nhập kịch bản tiếng Anh...', 'Enter English narration...')}
                    />
                  </div>
                </div>
              )}

              {/* Subtitle Visibility Per Scene */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-cyan-400" />
                  <span>{t('5. Ẩn / Hiện Phụ Đề Từng Scene', '5. Toggle Subtitle Per Scene')}</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {scenes.map((s, idx) => {
                    const isHidden = (s as any).hide_text === true;
                    return (
                      <div
                        key={s.scene_id || idx}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                          isHidden
                            ? isDark
                              ? 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                            : isDark
                            ? 'bg-slate-900 border-slate-700 text-slate-200'
                            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-xs font-black w-6 text-cyan-400">S{idx + 1}</span>
                          <span className="truncate text-xs font-bold">
                            {s.title || (s as any).summary_text?.slice(0, 24) || `Scene ${idx + 1}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateScene(s.scene_id, { hide_text: !isHidden } as any)
                          }
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            isHidden
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                          }`}
                        >
                          {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isHidden ? t('Đang ẩn', 'Hidden') : t('Hiển thị', 'Visible')}</span>
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
          4. AI ASSISTANT SLIDE-OVER DRAWER (WynRise AI)
      ═══════════════════════════════════════════════════════════ */}
      {isAISidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAISidebarOpen(false)}
          />
          <div
            className={`relative z-10 w-80 h-full flex flex-col animate-in slide-in-from-left-full duration-200 ${
              isDark ? 'bg-[#0E111B] border-r border-slate-800' : 'bg-white border-r border-slate-200 shadow-2xl'
            }`}
          >
            {/* Header pushed down for notch */}
            <div
              className={`flex items-center justify-between px-4 pb-3 border-b flex-shrink-0 ${
                isDark ? 'border-slate-800 bg-[#121624]' : 'border-slate-100 bg-white'
              }`}
              style={{ paddingTop: 'max(env(safe-area-inset-top, 44px), 44px)' }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-black text-cyan-400 tracking-wider">WYNRISE AI</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAISidebarOpen(false)}
                className={`p-2 rounded-2xl transition-all ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div
                className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                  isDark ? 'bg-slate-800/80 border border-slate-700 text-slate-200' : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                {t(
                  '👋 Chào bạn! Tôi là WynRise AI. Hãy nhập yêu cầu để tôi hỗ trợ biên tập và cập nhật video hoạt họa này.',
                  "👋 Hello! I'm WynRise AI. Type an edit instruction below to modify this animation video."
                )}
              </div>

              {/* Quick Scene Transcript Editor in Drawer */}
              {activeScene && (
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isDark
                      ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30'
                      : 'bg-cyan-50 border-cyan-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-black text-cyan-400">
                    <span className="flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      {t(`Phụ Đề Scene ${activeSceneIndex + 1}`, `Scene ${activeSceneIndex + 1} Subtitle`)}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
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
                    rows={4}
                    className={`w-full px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed border resize-none focus:outline-none focus:border-cyan-400 transition-all ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder={t('Chỉnh sửa phụ đề phân cảnh này...', 'Edit scene subtitle...')}
                  />
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div
              className={`p-3.5 border-t flex-shrink-0 pb-[calc(max(env(safe-area-inset-bottom,0px),10px)+0.5rem)] ${
                isDark ? 'border-slate-800 bg-[#121624]' : 'border-slate-100 bg-white'
              }`}
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t('Nhập yêu cầu chỉnh sửa...', 'Type an edit request...')}
                  className={`w-full pl-3.5 pr-14 py-3 rounded-2xl text-xs border focus:outline-none focus:border-cyan-400 transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setChatInput('');
                  }}
                />
                <div className="absolute right-2 flex items-center gap-1 text-slate-400">
                  <button className="p-1.5 hover:text-cyan-400 transition-colors">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          5. SETTINGS ACTION SHEET (Header Action Sheet)
      ═══════════════════════════════════════════════════════════ */}
      {isSettingsSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSettingsSheetOpen(false)}
          />
          <div
            className={`relative z-10 w-full rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom-full duration-200 pb-[calc(max(env(safe-area-inset-bottom,0px),16px)+1rem)] ${
              isDark ? 'bg-[#121624] border-t border-slate-700' : 'bg-white border-t border-slate-200 shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('Cài Đặt Dự Án & Nâng Cao', 'Project Settings & Info')}
              </h3>
              <button
                type="button"
                onClick={() => setIsSettingsSheetOpen(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Project info card */}
            <div
              className={`p-4 rounded-2xl text-xs space-y-2 border ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">{t('Mã Dự Án (ID)', 'Project ID')}</span>
                <span className="font-mono text-cyan-400 font-bold">{project.project_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">{t('Phong Cách', 'Visual Style')}</span>
                <span className="font-bold">{project.visual_style}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">{t('Tổng Số Scenes', 'Total Scenes')}</span>
                <span className="font-bold">{scenes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">{t('Thời Lượng', 'Total Duration')}</span>
                <span className="font-bold">{Math.round(totalDurationSec)}s</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  wynmotionService
                    .getProject(project.project_id)
                    .then((res) => {
                      if (res.project?.scenes) setScenes(res.project.scenes);
                    })
                    .catch(() => {});
                  setIsSettingsSheetOpen(false);
                }}
                className={`w-full py-3.5 rounded-2xl border text-sm font-black flex items-center justify-center gap-2 transition-all ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'border-slate-200 bg-white text-slate-800'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>{t('Tải Lại Dữ Liệu Dự Án', 'Reload Project Data')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsSheetOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-cyan-400 text-slate-950 font-black text-sm transition-all shadow-md"
              >
                <span>{t('Đóng Cài Đặt', 'Close Settings')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function BottomSheetOverlay({
  children,
  isDark,
  onClose,
}: {
  children: React.ReactNode;
  isDark: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 w-full rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom-full duration-200 pb-[calc(max(env(safe-area-inset-bottom,0px),16px)+1rem)] max-h-[82vh] overflow-y-auto ${
          isDark ? 'bg-[#101422] border-t border-slate-700' : 'bg-white border-t border-slate-200 shadow-2xl'
        }`}
      >
        <div className="w-12 h-1.5 rounded-full bg-slate-600/50 mx-auto -mt-1 mb-2" />
        {children}
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
    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
      <div>
        <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className={`p-2 rounded-2xl transition-all ${
          isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'
        }`}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
