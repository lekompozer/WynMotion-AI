'use client';

/**
 * MobileVideoEditorStudio.tsx — WynMotion-AI iOS App
 *
 * Mobile-optimized Video Editor:
 * - Clean Header with only Project Title (no style badge) + 44px Notch Padding
 * - Floating Aspect Ratio Switcher (16:9 | 9:16 | 1:1) in Top-Right of Canvas Area
 * - Large Responsive Canvas Stage (Full-width for 16:9, max-height for 9:16 / 1:1)
 * - 2 Independent Configurable Text Layers (Zero Overlap):
 *   1. Layer 1: AI Scene Note Card (White handwritten card / summary_text) + Custom Y Position
 *   2. Layer 2: Whisper Voice Subtitle (Dark pill / voice_transcript) + Custom Y Position
 * - Audio Track & Language Bar directly below Scene Canvas / Timeline (EN / VI / Multi-language)
 * - Smart Proportional Audio-to-Animation Timeline Sync Button in Settings & Bar
 * - Large, high-contrast typography in all Bottom Sheets
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Settings,
  Download,
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
  Zap,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
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

export type TextLangMode = 'vi' | 'en' | 'bilingual';
export type TextPosition = 'top' | 'middle' | 'bottom';
type BottomSheet = null | 'assets' | 'audio' | 'canvas';

// ─── Helpers ────────────────────────────────────────────────────────────────

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
  return 5;
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
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>(
    (project.aspect_ratio as any) || '16:9'
  );

  // ── Text Layers Control (2 Separate Layers) ──
  const [showSceneCards, setShowSceneCards] = useState<boolean>(true); // Layer 1: White Note Card
  const [showWhisperSubs, setShowWhisperSubs] = useState<boolean>(true); // Layer 2: Dark Whisper Pill
  const [cardPosY, setCardPosY] = useState<TextPosition>('middle'); // Top / Middle / Bottom
  const [subsPosY, setSubsPosY] = useState<TextPosition>('bottom'); // Bottom / Middle / Top
  const [textLangMode, setTextLangMode] = useState<TextLangMode>('vi');

  // ── Audio Tracks & Language Switching ──
  const [activeAudioLang, setActiveAudioLang] = useState<'vi' | 'en' | 'default'>('vi');
  const [activeAudioUrl, setActiveAudioUrl] = useState<string>(project.audio_url || '');
  const [isSyncingTimeline, setIsSyncingTimeline] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // ── Playback ──
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Sidebars / Bottom Sheets ──
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [activeBottomSheet, setActiveBottomSheet] = useState<BottomSheet>(null);

  // ── Audio volumes ──
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

  // Relative time inside current active scene
  let prevScenesElapsed = 0;
  for (let i = 0; i < activeSceneIndex; i++) {
    prevScenesElapsed += getSceneDuration(scenes[i]);
  }
  const currentSceneRelativeTime = Math.max(0, currentTimeSec - prevScenesElapsed);
  const activeSceneDuration = activeScene ? getSceneDuration(activeScene) : 5;

  // ── Playback timer loop (50ms interval) ──
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 50;
      const stepSec = intervalMs / 1000;

      playbackTimerRef.current = setInterval(() => {
        setCurrentTimeSec((prev) => {
          const next = prev + stepSec;
          if (next >= totalDurationSec) {
            setIsPlaying(false);
            return 0;
          }
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

  // Sync audio element with playback state
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

  // ── Sync Animation Timeline with Audio Length ──
  const syncAnimationWithAudio = (audioDuration: number, langLabel: string = 'Audio Track') => {
    if (!audioDuration || isNaN(audioDuration) || !isFinite(audioDuration) || audioDuration <= 1.0) {
      alert(t('⚠️ Độ dài file audio không hợp lệ để đồng bộ.', '⚠️ Invalid audio duration for sync.'));
      return;
    }

    setIsSyncingTimeline(true);
    setSyncStatusMsg(t(`Đang đồng bộ animation theo ${langLabel}...`, `Syncing animation to ${langLabel}...`));

    const baseDuration = scenes.reduce((acc, s) => acc + getSceneDuration(s), 0) || 10.0;
    const scale = audioDuration / baseDuration;

    let curSec = 0.0;
    const scaledScenes: MotionScene[] = scenes.map((s, idx) => {
      const rawDur = getSceneDuration(s);
      const scaledDur = rawDur * scale;
      const start_time_sec = Number(curSec.toFixed(2));
      const end_time_sec = idx === scenes.length - 1 ? Number(audioDuration.toFixed(2)) : Number((curSec + scaledDur).toFixed(2));
      const duration_sec = idx === scenes.length - 1 ? Number((audioDuration - curSec).toFixed(2)) : Number(scaledDur.toFixed(2));
      curSec += scaledDur;

      return {
        ...s,
        duration_sec,
        start_time_sec,
        end_time_sec,
      };
    });

    setScenes(scaledScenes);
    setCurrentTimeSec(0);
    setActiveSceneIndex(0);
    setIsPlaying(false);

    wynmotionService
      .updateProject(project.project_id, {
        scenes: scaledScenes,
        duration_sec: audioDuration,
      })
      .catch((err) => console.warn('Auto-save sync failed:', err));

    setSyncStatusMsg(`✅ Đã đồng bộ timeline theo ${langLabel} (${audioDuration.toFixed(1)}s)!`);
    setTimeout(() => {
      setSyncStatusMsg(null);
      setIsSyncingTimeline(false);
    }, 3500);
  };

  // ── Switch Audio Language Track ──
  const handleSelectAudioLang = (lang: 'vi' | 'en') => {
    setActiveAudioLang(lang);
    setTextLangMode(lang === 'vi' ? 'vi' : 'en');

    const targetUrl = lang === 'en'
      ? (project as any).audio_url_en || project.audio_url || ''
      : project.audio_url || '';

    setActiveAudioUrl(targetUrl);

    if (targetUrl) {
      const temp = new Audio(targetUrl);
      temp.addEventListener('loadedmetadata', () => {
        if (temp.duration && isFinite(temp.duration)) {
          syncAnimationWithAudio(temp.duration, lang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English');
        }
      });
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
      {/* Hidden audio element for project audio playback */}
      {activeAudioUrl && (
        <audio
          ref={audioRef}
          src={activeAudioUrl}
          preload="auto"
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          1. COMPACT HEADER (Clean Title Only, 44px Notch Padding)
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

        {/* ONLY Project Title centered (no extra badges) */}
        <div className="flex flex-col items-center min-w-0 flex-1 mx-3">
          <h1
            className={`text-sm font-black truncate max-w-full tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {project.title || project.prompt?.slice(0, 32) || 'WynMotion Studio'}
          </h1>
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
          2. MAIN BODY: Large Canvas + Aspect Switcher + Controls + Audio Bar
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* ── Sync Notification Toast ── */}
        {syncStatusMsg && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-cyan-500/90 text-slate-950 text-xs font-black shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {/* ── Dynamic Canvas Stage (Full Height / Width responsive) ── */}
        <div className="flex-1 flex items-center justify-center p-2 relative overflow-hidden">
          
          {/* Floating Aspect Ratio Selector (Top-Right of Canvas Area) */}
          <div className="absolute top-3 right-3 z-30 flex items-center bg-black/75 backdrop-blur-md p-1 rounded-2xl border border-white/15 shadow-xl">
            {(['16:9', '9:16', '1:1'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setAspectRatio(r)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all active:scale-90 ${
                  aspectRatio === r
                    ? 'bg-cyan-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Canvas Box */}
          <div
            className="relative shadow-2xl rounded-3xl overflow-hidden border border-slate-700/60 flex items-center justify-center transition-all"
            style={{
              backgroundColor: bgColor,
              width: aspectRatio === '16:9' ? '100%' : aspectRatio === '9:16' ? 'auto' : 'auto',
              maxWidth: aspectRatio === '16:9' ? '100%' : aspectRatio === '9:16' ? '290px' : '380px',
              height: aspectRatio === '16:9' ? 'auto' : '100%',
              aspectRatio:
                aspectRatio === '16:9' ? '16 / 9' : aspectRatio === '9:16' ? '9 / 16' : '1 / 1',
              maxHeight: aspectRatio === '16:9' ? '54vh' : '52vh',
            }}
          >
            {/* Dynamic Multi-Style Scene Renderer with 2 Separate Layers */}
            {activeScene ? (
              <MobileDynamicSceneRenderer
                scene={activeScene}
                visualStyle={project.visual_style || 'whiteboard_stream_hand'}
                currentTimeSec={currentSceneRelativeTime}
                totalSceneDurationSec={activeSceneDuration}
                bgColor={bgColor}
                aspectRatio={aspectRatio}
                textLangMode={textLangMode}
                showSceneCards={showSceneCards}
                showWhisperSubs={showWhisperSubs}
                cardPosY={cardPosY}
                subsPosY={subsPosY}
                onCardClick={() => setActiveBottomSheet('canvas')}
                onSubsClick={() => setActiveBottomSheet('canvas')}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <Layers className="w-8 h-8 text-slate-400 opacity-40 mb-2" />
                <p className="text-xs font-bold text-slate-400 opacity-60">Scene Preview</p>
              </div>
            )}

            {/* Scene counter pill (top-left) */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-black text-white z-20">
              {activeSceneIndex + 1} / {scenes.length}
            </div>
          </div>
        </div>

        {/* ── Audio Language & Sync Bar (Below Scene Canvas) ── */}
        <div
          className={`flex-shrink-0 flex items-center justify-between px-4 py-2 border-t ${
            isDark ? 'border-slate-800/80 bg-[#0E111B]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          {/* Audio Language Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Music className="w-3 h-3 text-cyan-400" />
              Audio:
            </span>
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => handleSelectAudioLang('vi')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                  activeAudioLang === 'vi'
                    ? 'bg-cyan-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇻🇳 VI
              </button>
              <button
                type="button"
                onClick={() => handleSelectAudioLang('en')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                  activeAudioLang === 'en'
                    ? 'bg-cyan-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇺🇸 EN
              </button>
            </div>
          </div>

          {/* Sync Animation Button */}
          <button
            type="button"
            onClick={() => {
              if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
                syncAnimationWithAudio(
                  audioRef.current.duration,
                  activeAudioLang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'
                );
              } else {
                syncAnimationWithAudio(totalDurationSec, 'Timeline hiện tại');
              }
            }}
            disabled={isSyncingTimeline}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400 text-[10px] font-black hover:bg-cyan-500/25 active:scale-95 transition-all shadow-sm"
          >
            {isSyncingTimeline ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Zap className="w-3 h-3 fill-cyan-400" />
            )}
            <span>{t('Sync Animation', 'Sync Animation')}</span>
          </button>
        </div>

        {/* ── Playback Controller Row ── */}
        <div
          className={`flex-shrink-0 flex items-center justify-between px-6 py-2 border-t ${
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

          {/* Play / Pause Button */}
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
          <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-none">
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
          className={`flex-shrink-0 flex items-center justify-around px-4 py-2.5 border-t pb-[calc(max(env(safe-area-inset-bottom,0px),10px)+0.5rem)] ${
            isDark ? 'border-slate-800 bg-[#0F131C]' : 'border-slate-200 bg-white shadow-sm'
          }`}
        >
          {[
            { id: 'assets' as BottomSheet, icon: Folder, labelVi: 'Assets', labelEn: 'Assets', color: 'text-amber-400' },
            { id: 'audio' as BottomSheet, icon: Music, labelVi: 'Âm Thanh', labelEn: 'Audio', color: 'text-purple-400' },
            { id: 'canvas' as BottomSheet, icon: Sliders, labelVi: 'Canvas & Text', labelEn: 'Canvas & Text', color: 'text-cyan-400' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeBottomSheet === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveBottomSheet(isActive ? null : item.id)}
                className={`flex flex-col items-center gap-1 px-5 py-1.5 rounded-2xl transition-all active:scale-90 ${
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
          3. BOTTOM SHEETS (2 Independent Text Layers Configuration)
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

              {/* Sync Audio Button inside Audio Sheet */}
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-cyan-400">
                    {t('⚡ Đồng Bộ Timeline Hoạt Họa Theo Audio', '⚡ Sync Animation Timeline to Audio')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {t('Tự động chia tỉ lệ thời lượng các scene theo độ dài file giọng đọc', 'Automatically scale scenes duration to narration')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
                      syncAnimationWithAudio(audioRef.current.duration, 'Audio Track');
                    } else {
                      syncAnimationWithAudio(totalDurationSec, 'Timeline hiện tại');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex-shrink-0"
                >
                  {t('Đồng Bộ Ngay', 'Sync Now')}
                </button>
              </div>

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

          {/* ── CANVAS & 2-LAYER TEXT SETTINGS SHEET ── */}
          {activeBottomSheet === 'canvas' && (
            <div className="space-y-6">
              <SheetHeader
                title={t('Cài Đặt Canvas & 2 Khung Văn Bản', 'Canvas & 2 Text Layers Settings')}
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

              {/* Text / Subtitle Language Mode */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>{t('2. Ngôn Ngữ Hiển Thị Text', '2. Text Display Language')}</span>
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

              {/* ─────────────────────────────────────────────────────────────
                  LAYER 1: AI SCENE NOTE CARD (Khung Trắng Tóm Tắt AI)
              ───────────────────────────────────────────────────────────── */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80 bg-slate-900/60 p-4 rounded-3xl border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-400 shadow-sm" />
                    <div>
                      <span className="text-xs font-black text-white block">
                        {t('Lớp 1: Thẻ Tóm Tắt AI (White Card)', 'Layer 1: AI Scene Note Card (White Card)')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {t('Khung trắng font viết tay tóm tắt nội dung chính phân cảnh', 'Handwritten white card summarizing the scene')}
                      </span>
                    </div>
                  </div>
                  {/* Toggle On/Off */}
                  <button
                    type="button"
                    onClick={() => setShowSceneCards((v) => !v)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                      showSceneCards
                        ? 'bg-cyan-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {showSceneCards ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showSceneCards ? t('BẬT', 'ON') : t('TẮT', 'OFF')}</span>
                  </button>
                </div>

                {showSceneCards && (
                  <>
                    {/* Position Y Selector */}
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                        <span>{t('Vị trí hiển thị Thẻ Trắng:', 'White Card Position:')}</span>
                        <span className="text-cyan-400 capitalize">{cardPosY}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'top' as TextPosition, icon: AlignVerticalJustifyStart, label: 'Trên Cùng' },
                          { id: 'middle' as TextPosition, icon: AlignVerticalJustifyCenter, label: 'Ở Giữa' },
                          { id: 'bottom' as TextPosition, icon: AlignVerticalJustifyEnd, label: 'Phía Dưới' },
                        ].map((pos) => {
                          const PosIcon = pos.icon;
                          return (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setCardPosY(pos.id)}
                              className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                                cardPosY === pos.id
                                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                                  : 'border-slate-800 bg-slate-900 text-slate-400'
                              }`}
                            >
                              <PosIcon className="w-3.5 h-3.5" />
                              <span>{pos.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Edit summary_text for active scene */}
                    {activeScene && (
                      <div className="space-y-2 pt-2">
                        <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{t(`Sửa Tóm Tắt AI (Scene ${activeSceneIndex + 1})`, `Edit AI Summary (Scene ${activeSceneIndex + 1})`)}</span>
                        </div>
                        <textarea
                          value={activeScene.summary_text || (activeScene as any).voice_transcript || ''}
                          onChange={(e) =>
                            updateScene(activeScene.scene_id, {
                              summary_text: e.target.value,
                            } as any)
                          }
                          rows={2}
                          className="w-full px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                          placeholder={t('Nhập tóm tắt phân cảnh viết tay...', 'Enter scene summary...')}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  LAYER 2: WHISPER VOICE SUBTITLES (Khung Xám Đen Giọng Đọc)
              ───────────────────────────────────────────────────────────── */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80 bg-slate-900/60 p-4 rounded-3xl border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-900 border border-white/40 shadow-sm" />
                    <div>
                      <span className="text-xs font-black text-white block">
                        {t('Lớp 2: Phụ Đề Whisper Giọng Đọc (Dark Pill)', 'Layer 2: Whisper Voice Subtitles (Dark Pill)')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {t('Khung oval xám đen chạy theo lời đọc audio', 'Dark speech-aligned subtitle bar matching audio')}
                      </span>
                    </div>
                  </div>
                  {/* Toggle On/Off */}
                  <button
                    type="button"
                    onClick={() => setShowWhisperSubs((v) => !v)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                      showWhisperSubs
                        ? 'bg-cyan-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {showWhisperSubs ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showWhisperSubs ? t('BẬT', 'ON') : t('TẮT', 'OFF')}</span>
                  </button>
                </div>

                {showWhisperSubs && (
                  <>
                    {/* Position Y Selector */}
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                        <span>{t('Vị trí hiển thị Phụ Đề Giọng Đọc:', 'Voice Subtitles Position:')}</span>
                        <span className="text-cyan-400 capitalize">{subsPosY}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'bottom' as TextPosition, icon: AlignVerticalJustifyEnd, label: 'Phía Dưới (Đáy)' },
                          { id: 'middle' as TextPosition, icon: AlignVerticalJustifyCenter, label: 'Ở Giữa' },
                          { id: 'top' as TextPosition, icon: AlignVerticalJustifyStart, label: 'Trên Cùng' },
                        ].map((pos) => {
                          const PosIcon = pos.icon;
                          return (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setSubsPosY(pos.id)}
                              className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                                subsPosY === pos.id
                                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                                  : 'border-slate-800 bg-slate-900 text-slate-400'
                              }`}
                            >
                              <PosIcon className="w-3.5 h-3.5" />
                              <span>{pos.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Edit voice_transcript for active scene */}
                    {activeScene && (
                      <div className="space-y-2 pt-2">
                        <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{t(`Sửa Lời Thoại / Phụ Đề Whisper (Scene ${activeSceneIndex + 1})`, `Edit Voice Transcript (Scene ${activeSceneIndex + 1})`)}</span>
                        </div>
                        <textarea
                          value={(activeScene as any).voice_transcript || activeScene.summary_text || ''}
                          onChange={(e) =>
                            updateScene(activeScene.scene_id, {
                              voice_transcript: e.target.value,
                            } as any)
                          }
                          rows={3}
                          className="w-full px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                          placeholder={t('Nhập lời thoại phụ đề đọc theo audio...', 'Enter voice transcription...')}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </BottomSheetOverlay>
      )}

      {/* ═══════════════════════════════════════════════════════════
          4. SETTINGS ACTION SHEET (Header Action Sheet)
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

            {/* Sync Animation Feature in Settings */}
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-cyan-400">
                  {t('⚡ Đồng Bộ Animation Theo Audio', '⚡ Sync Animation to Audio')}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {t('Khớp toàn bộ các scene theo độ dài file giọng đọc', 'Fit all scenes to narration audio duration')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
                    syncAnimationWithAudio(audioRef.current.duration, 'Audio Track');
                  } else {
                    syncAnimationWithAudio(totalDurationSec, 'Timeline');
                  }
                  setIsSettingsSheetOpen(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex-shrink-0"
              >
                {t('Đồng Bộ', 'Sync')}
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
