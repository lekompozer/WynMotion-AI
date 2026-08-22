'use client';

/**
 * MobileVideoEditorStudio.tsx — WynMotion-AI iOS Studio
 *
 * 100% Remotion-Engine Driven Studio with Exact Parity to wordai Web:
 * - Powered by RemotionPlayerProvider (30fps frame-accurate rAF audio playhead)
 * - DynamicAnimationComposition with exact mathematical spring physics & SVG ink extraction
 * - Compact Top Header (Project Title only + 44px Notch Padding)
 * - Compact Floating Aspect Ratio Dropdown (16:9 | 9:16 | 1:1) in Top-Right of Canvas Area
 * - CapCut-style Multi-track Timeline with Audio language switcher (VI / EN) and Proportional Sync
 * - Canvas Bottom Sheets for 2-Layer Text Isolation (White AI Card + Whisper Dark Pill)
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  ChevronDown,
  Sparkles,
  Palette,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { wynmotionService, MotionProject, MotionScene } from '@/services/wynmotionService';
import { RemotionPlayerProvider, useRemotion, useCurrentFrame, useVideoConfig } from './RemotionEngine';
import { DynamicAnimationComposition } from './DynamicAnimationComposition';
import { DynamicSceneData } from './DynamicSceneRenderer';

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

function formatTimecode(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 100);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function getSceneDuration(s: DynamicSceneData): number {
  if (s.duration_sec && s.duration_sec > 0) return s.duration_sec;
  if (s.duration_frames && s.duration_frames > 0) return s.duration_frames / 30;
  if (s.end_sec && s.start_sec !== undefined && s.end_sec > s.start_sec) {
    return s.end_sec - s.start_sec;
  }
  return 5;
}

// ─── Studio Inner Component (Inside Remotion Context) ──────────────────────

interface StudioInnerProps {
  project: MotionProject;
  initialScenes: DynamicSceneData[];
  onBack: () => void;
}

const StudioInner: React.FC<StudioInnerProps> = ({ project, initialScenes, onBack }) => {
  const { isDark, isVietnamese, t } = useApp();
  const {
    frame,
    fps,
    durationInFrames,
    isPlaying,
    play,
    pause,
    togglePlay,
    seekTo,
    seekToSec,
    aspectRatio,
    setAspectRatio,
    bgColor,
    setBgColor,
    volume,
    setVolume,
    audioSrc,
    setAudioSrc,
    setDurationInFrames,
  } = useRemotion();

  // Normalize initial scenes with start_frame and duration_frames
  const [scenes, setScenes] = useState<DynamicSceneData[]>(() => {
    let curFrame = 0;
    return initialScenes.map((s, idx) => {
      const durSec = getSceneDuration(s);
      const durFrames = s.duration_frames || Math.round(durSec * 30);
      const sf = s.start_frame !== undefined ? s.start_frame : curFrame;
      curFrame = sf + durFrames;
      return {
        ...s,
        scene_id: s.scene_id || `scene_${idx + 1}`,
        start_frame: sf,
        duration_frames: durFrames,
        duration_sec: durSec,
      };
    });
  });

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);

  // 2-Layer Text Controls
  const [showSceneCards, setShowSceneCards] = useState<boolean>(true);
  const [showWhisperSubs, setShowWhisperSubs] = useState<boolean>(true);
  const [cardPosY, setCardPosY] = useState<TextPosition>('middle');
  const [subsPosY, setSubsPosY] = useState<TextPosition>('bottom');
  const [swapSpeakers, setSwapSpeakers] = useState<boolean>(false);
  const [textLangMode, setTextLangMode] = useState<TextLangMode>('vi');

  // Audio track switching & animation sync
  const [activeAudioLang, setActiveAudioLang] = useState<'vi' | 'en'>('vi');
  const [isSyncingTimeline, setIsSyncingTimeline] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Sheets & Audio mixer
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [activeBottomSheet, setActiveBottomSheet] = useState<BottomSheet>(null);
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const [customBgmFile, setCustomBgmFile] = useState<string | null>(null);
  const bgmFileInputRef = useRef<HTMLInputElement>(null);
  const assetFileInputRef = useRef<HTMLInputElement>(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [isRedesigning, setIsRedesigning] = useState(false);
  const [redesignPrompt, setRedesignPrompt] = useState('');

  // Auto-save debounce
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Video Stage Ref & Direct Drag-to-Move Bubble
  const videoStageRef = useRef<HTMLDivElement>(null);
  const [isDraggingBubble, setIsDraggingBubble] = useState(false);

  const calculateTopPctFromClientY = (clientY: number) => {
    if (!videoStageRef.current || !activeScene) return;
    const rect = videoStageRef.current.getBoundingClientRect();
    if (rect.height <= 0) return;
    const relativeY = clientY - rect.top;
    const pct = Math.max(10, Math.min(78, Math.round((relativeY / rect.height) * 100)));
    updateScene(activeScene.scene_id, {
      bubble_custom_layout: {
        ...(activeScene.bubble_custom_layout || {}),
        customTopPct: pct,
      },
    });
  };

  const handleBubblePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
    setIsDraggingBubble(true);
  };

  const handleBubblePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingBubble) return;
    calculateTopPctFromClientY(e.clientY);
  };

  const handleBubblePointerUp = (e: React.PointerEvent) => {
    if (isDraggingBubble) {
      setIsDraggingBubble(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  // Native iOS Touch Handlers for 100% responsiveness on Safari/Capacitor
  const handleBubbleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingBubble(true);
    if (e.touches[0]) {
      calculateTopPctFromClientY(e.touches[0].clientY);
    }
  };

  const handleBubbleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches[0]) {
      calculateTopPctFromClientY(e.touches[0].clientY);
    }
  };

  const handleBubbleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingBubble(false);
  };

  const totalDurationSec = durationInFrames / fps;
  const currentTimeSec = frame / fps;

  // Active scene tracking based on frame
  useEffect(() => {
    for (let i = 0; i < scenes.length; i++) {
      const sf = scenes[i].start_frame || 0;
      const df = scenes[i].duration_frames || 150;
      if (frame >= sf && frame < sf + df) {
        setActiveSceneIndex(i);
        break;
      }
    }
  }, [frame, scenes]);

  const activeScene: DynamicSceneData = scenes[activeSceneIndex] || scenes[0];

  // ── Sync Animation Timeline with Audio Length ──
  const syncAnimationWithAudio = (audioDuration: number, langLabel: string = 'Audio Track') => {
    if (!audioDuration || isNaN(audioDuration) || !isFinite(audioDuration) || audioDuration <= 1.0) {
      alert(t('⚠️ Độ dài file audio không hợp lệ để đồng bộ.', '⚠️ Invalid audio duration for sync.'));
      return;
    }

    setIsSyncingTimeline(true);
    setSyncStatusMsg(t(`Đang đồng bộ animation theo ${langLabel}...`, `Syncing animation to ${langLabel}...`));

    const totalAudioFrames = Math.round(audioDuration * fps);
    const baseFrames = scenes.reduce((acc, s) => acc + (s.duration_frames || 150), 0) || 300;
    const scale = totalAudioFrames / baseFrames;

    let curFrame = 0;
    const scaledScenes: DynamicSceneData[] = scenes.map((s, idx) => {
      const rawFrames = s.duration_frames || 150;
      const scaledF = Math.max(30, Math.round(rawFrames * scale));
      const sf = curFrame;
      const df = idx === scenes.length - 1 ? Math.max(30, totalAudioFrames - curFrame) : scaledF;
      curFrame += df;

      return {
        ...s,
        start_frame: sf,
        duration_frames: df,
        duration_sec: Number((df / fps).toFixed(2)),
        start_sec: Number((sf / fps).toFixed(2)),
        end_sec: Number(((sf + df) / fps).toFixed(2)),
      };
    });

    setScenes(scaledScenes);
    setDurationInFrames?.(totalAudioFrames);
    seekTo(0);
    pause();

    wynmotionService
      .updateProject(project.project_id, {
        scenes: scaledScenes as any,
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

    setAudioSrc?.(targetUrl);

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
    (sceneId: string | number, updates: Partial<DynamicSceneData>) => {
      setScenes((prev) =>
        prev.map((s) => (s.scene_id === sceneId ? { ...s, ...updates } : s))
      );
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        wynmotionService
          .updateProject(project.project_id, {
            scenes: scenes.map((s) =>
              s.scene_id === sceneId ? { ...s, ...updates } : s
            ) as any,
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
      const res = await wynmotionService.exportMP4(project.project_id, scenes as any);
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

  // ── Re-design / Re-generate Scene AI Image via Gemini Agent ──
  const handleRedesignImage = async () => {
    if (!activeScene) return;
    setIsRedesigning(true);
    try {
      const res = await wynmotionService.redesignSceneImage({
        project_id: project.project_id,
        scene_id: activeScene.scene_id,
        user_prompt: redesignPrompt.trim() || project.prompt,
        aspect_ratio: aspectRatio,
        character_subtype: (project as any).character_subtype,
      });
      if (res && res.image_url) {
        updateScene(activeScene.scene_id, { image_url: res.image_url });
        alert(t('🎨 Đã vẽ lại hình ảnh nhân vật thành công!', '🎨 Image successfully re-designed!'));
      }
    } catch (err: any) {
      alert(err.message || t('Lỗi tạo lại hình ảnh', 'Failed to re-design image'));
    } finally {
      setIsRedesigning(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden transition-colors ${
        isDark ? 'bg-[#080B10] text-white' : 'bg-[#FAFAFC] text-slate-900'
      }`}
    >
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

        <div className="flex flex-col items-center min-w-0 flex-1 mx-3">
          <h1
            className={`text-sm font-black truncate max-w-full tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {project.title || project.prompt?.slice(0, 32) || 'WynMotion Studio'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
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

          <button
            type="button"
            onClick={handleExportMP4}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>MP4</span>
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          2. MAIN BODY: Large Remotion Canvas Stage + Controls
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {syncStatusMsg && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-cyan-500/90 text-slate-950 text-xs font-black shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {/* Dynamic Remotion Stage */}
        <div className="flex-1 flex items-center justify-center p-2 relative overflow-hidden bg-[#07080E]">
          {/* Floating Compact Aspect Ratio Dropdown */}
          <div className="absolute top-3 right-3 z-30">
            <button
              type="button"
              onClick={() => setShowAspectDropdown((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-black shadow-2xl active:scale-95 transition-all"
            >
              <span className="text-cyan-400">{aspectRatio}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${showAspectDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showAspectDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAspectDropdown(false)} />
                <div className="absolute top-full right-0 mt-1.5 z-50 bg-[#121624]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 min-w-[95px] animate-in fade-in zoom-in-95 duration-150">
                  {(['16:9', '9:16', '1:1'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setAspectRatio(r);
                        setShowAspectDropdown(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-black text-left flex items-center justify-between transition-all active:scale-95 ${
                        aspectRatio === r
                          ? 'bg-cyan-400 text-slate-950 shadow-sm'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{r}</span>
                      {aspectRatio === r && <Check className="w-3.5 h-3.5 text-slate-950" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Video Stage Box */}
          <div
            ref={videoStageRef}
            id="wynmotion-video-stage"
            className="relative shadow-2xl rounded-3xl overflow-hidden border border-slate-700/60 flex items-center justify-center transition-all touch-none select-none"
            style={{
              backgroundColor: bgColor,
              width: aspectRatio === '16:9' ? '100%' : aspectRatio === '9:16' ? 'auto' : 'auto',
              maxWidth: aspectRatio === '16:9' ? '100%' : aspectRatio === '9:16' ? '290px' : '380px',
              height: aspectRatio === '16:9' ? 'auto' : '100%',
              aspectRatio: aspectRatio === '16:9' ? '16 / 9' : aspectRatio === '9:16' ? '9 / 16' : '1 / 1',
              maxHeight: aspectRatio === '16:9' ? '54vh' : '52vh',
            }}
          >
            <DynamicAnimationComposition
              scenes={scenes}
              visualStyle={project.visual_style || 'whiteboard_stream_hand'}
              showSceneCards={showSceneCards}
              showWhisperSubs={showWhisperSubs}
              cardPosY={cardPosY}
              subsPosY={subsPosY}
              swapSpeakers={swapSpeakers}
              onCardClick={() => setActiveBottomSheet('canvas')}
              onSubsClick={() => setActiveBottomSheet('canvas')}
            />

            {/* Interactive Direct Touch/Mouse Drag-to-Move for Dialogue Bubbles */}
            {(project.visual_style as string) === 'dialogue_scene' && activeScene && (
              <div
                className={`absolute left-1/2 z-40 cursor-grab active:cursor-grabbing select-none transition-all touch-none rounded-3xl ${
                  isDraggingBubble
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black/50 shadow-2xl bg-cyan-400/15'
                    : 'hover:ring-1 hover:ring-cyan-400/40 active:ring-2 active:ring-cyan-400'
                }`}
                style={{
                  top: `${activeScene?.bubble_custom_layout?.customTopPct ?? (cardPosY === 'top' ? 18 : cardPosY === 'bottom' ? 75 : 48)}%`,
                  left: '50%',
                  transform: 'translate(-50%, -6px)',
                  width: `${activeScene?.bubble_custom_layout?.customWidthPct ?? (aspectRatio === '9:16' ? 82 : 60)}%`,
                  minHeight: '60px',
                  height: '85px',
                  touchAction: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                }}
                onPointerDown={handleBubblePointerDown}
                onPointerMove={handleBubblePointerMove}
                onPointerUp={handleBubblePointerUp}
                onPointerCancel={handleBubblePointerUp}
                onTouchStart={handleBubbleTouchStart}
                onTouchMove={handleBubbleTouchMove}
                onTouchEnd={handleBubbleTouchEnd}
                onTouchCancel={handleBubbleTouchEnd}
              />
            )}

            {/* Scene counter pill */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-black text-white z-20">
              {activeSceneIndex + 1} / {scenes.length}
            </div>
          </div>
        </div>

        {/* ── Audio Language & Sync Bar ── */}
        <div
          className={`flex-shrink-0 flex items-center justify-between px-4 py-2 border-t ${
            isDark ? 'border-slate-800/80 bg-[#0E111B]' : 'border-slate-100 bg-slate-50'
          }`}
        >
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

          <button
            type="button"
            onClick={() => syncAnimationWithAudio(totalDurationSec, 'Timeline hiện tại')}
            disabled={isSyncingTimeline}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400 text-[10px] font-black hover:bg-cyan-500/25 active:scale-95 transition-all shadow-sm"
          >
            {isSyncingTimeline ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 fill-cyan-400" />}
            <span>{t('Sync Animation', 'Sync Animation')}</span>
          </button>
        </div>

        {/* ── Playback Controller Row ── */}
        <div
          className={`flex-shrink-0 flex items-center justify-between px-6 py-2 border-t ${
            isDark ? 'border-slate-800/80 bg-[#0F131C]' : 'border-slate-100 bg-white'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              const prevIdx = Math.max(0, activeSceneIndex - 1);
              const sf = scenes[prevIdx]?.start_frame || 0;
              seekTo(sf);
            }}
            disabled={activeSceneIndex === 0}
            className={`p-2 rounded-2xl transition-all active:scale-90 disabled:opacity-30 ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <SkipBack className="w-5 h-5" />
          </button>

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

          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center shadow-md shadow-cyan-500/25 active:scale-90 transition-all"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              const nextIdx = Math.min(scenes.length - 1, activeSceneIndex + 1);
              const sf = scenes[nextIdx]?.start_frame || 0;
              seekTo(sf);
            }}
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
              const dur = getSceneDuration(s);
              return (
                <button
                  key={s.scene_id || idx}
                  type="button"
                  onClick={() => {
                    const sf = s.start_frame || 0;
                    seekTo(sf);
                  }}
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
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
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
          3. BOTTOM SHEETS
      ═══════════════════════════════════════════════════════════ */}
      {activeBottomSheet && (
        <BottomSheetOverlay isDark={isDark} onClose={() => setActiveBottomSheet(null)}>
          {/* ASSETS SHEET */}
          {activeBottomSheet === 'assets' && (
            <div className="space-y-5">
              <SheetHeader
                title={t('Assets & Phân Cảnh', 'Assets & Scenes')}
                subtitle={`${scenes.length} scenes`}
                isDark={isDark}
                onClose={() => setActiveBottomSheet(null)}
              />

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
                      updateScene(activeScene.scene_id, { image_url: url });
                    }
                  }}
                />
              </label>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {scenes.map((s, idx) => {
                  const isActive = idx === activeSceneIndex;
                  const dur = getSceneDuration(s);
                  return (
                    <button
                      key={s.scene_id || idx}
                      type="button"
                      onClick={() => {
                        seekTo(s.start_frame || 0);
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
                        {s.image_url ? (
                          <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
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

              {/* RE-DESIGN SCENE IMAGE WITH AI AGENT */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    {t('Tạo Lại Hình Ảnh Bằng AI Agent', 'Re-design Image with AI Agent')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t(
                    'Gemini Agent sẽ phân tích nhân vật A/B, trang phục và bối cảnh kịch bản để vẽ lại bức tranh 3D Pixar / Anime mới tràn viền chuẩn xác.',
                    'Gemini Agent analyzes dialogue characters and generates a fresh 3D Pixar / Anime illustration.'
                  )}
                </p>
                <textarea
                  value={redesignPrompt}
                  onChange={(e) => setRedesignPrompt(e.target.value)}
                  rows={2}
                  placeholder={t(
                    'Gợi ý thêm về trang phục, bối cảnh, nét mặt (hoặc để trống)...',
                    'Add hints for outfit, setting (optional)...'
                  )}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-all"
                />
                <button
                  type="button"
                  disabled={isRedesigning}
                  onClick={handleRedesignImage}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isRedesigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('Đang phân tích kịch bản & vẽ lại...', 'Analyzing & Generating...')}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t('🎨 Vẽ Lại Ảnh Ngay', '🎨 Re-design Image Now')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* AUDIO SHEET */}
          {activeBottomSheet === 'audio' && (
            <div className="space-y-6">
              <SheetHeader
                title={t('Âm Thanh & Nhạc Nền', 'Audio & Background Music')}
                isDark={isDark}
                onClose={() => setActiveBottomSheet(null)}
              />

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-cyan-400">
                    {t('⚡ Đồng Bộ Animation Theo Audio', '⚡ Sync Animation to Audio')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {t('Chia tỉ lệ phân cảnh tự động khớp thời lượng giọng đọc', 'Automatically scale scenes to narration duration')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => syncAnimationWithAudio(totalDurationSec, 'Audio Track')}
                  className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex-shrink-0"
                >
                  {t('Đồng Bộ Ngay', 'Sync Now')}
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>{t('Giọng Đọc AI (Voice Narration)', 'AI Narration Volume')}</span>
                  </label>
                  <span className="text-sm font-black text-cyan-400">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-2 rounded-lg"
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    <Music className="w-4 h-4 text-purple-400" />
                    <span>{t('Nhạc Nền (BGM Volume)', 'Background Music Volume')}</span>
                  </label>
                  <span className="text-sm font-black text-purple-400">{Math.round(bgmVolume * 100)}%</span>
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
            </div>
          )}

          {/* CANVAS & 2-LAYER TEXT SETTINGS SHEET */}
          {activeBottomSheet === 'canvas' && (
            <div className="space-y-6">
              <SheetHeader
                title={t('Cài Đặt Canvas & 2 Khung Văn Bản', 'Canvas & 2 Text Layers Settings')}
                isDark={isDark}
                onClose={() => setActiveBottomSheet(null)}
              />

              {/* 1. MÀU NỀN CANVAS (ẨN ĐỐI VỚI DIALOGUE SCENE DO HÌNH ẢNH TRÀN VIỀN 100%) */}
              {(project?.visual_style as string) !== 'dialogue_scene' && (
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
                        <span className="w-5 h-5 rounded-full border border-black/20 flex-shrink-0 shadow-sm" style={{ backgroundColor: theme.color }} />
                        <span className="truncate">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DIALOGUE SCENE SCRIPT SETTINGS VS 2-LAYER TEXT SETTINGS */}
              {(project?.visual_style as string) === 'dialogue_scene' ? (
                <div className="space-y-5 pt-2">
                  {/* BUBBLE POSITION & GEOMETRY CONTROLS */}
                  <div className="space-y-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm" />
                        <span className="text-xs font-black text-white">
                          {t('Vị Trí & Kích Thước Bong Bóng', 'Speech Bubble Layout')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSwapSpeakers((prev) => !prev)}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 transition-all ${
                          swapSpeakers
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                            : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span>🔄</span>
                        <span>{swapSpeakers ? t('Đã Đổi Bên', 'Swapped') : t('Đổi Bên (Trái ⇋ Phải)', 'Swap Sides')}</span>
                      </button>
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
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
                            onClick={() => {
                              setCardPosY(pos.id);
                              if (activeScene) {
                                updateScene(activeScene.scene_id, {
                                  bubble_custom_layout: {
                                    ...(activeScene.bubble_custom_layout || {}),
                                    cardPosY: pos.id,
                                    customTopPct: pos.id === 'top' ? 18 : pos.id === 'middle' ? 48 : 75,
                                  },
                                });
                              }
                            }}
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

                    {/* Sliders */}
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                          <span>{t('Vị trí dọc (Y %):', 'Vertical Position (Y %):')}</span>
                          <span className="text-cyan-400 font-mono">
                            {activeScene?.bubble_custom_layout?.customTopPct ?? (cardPosY === 'top' ? 18 : cardPosY === 'bottom' ? 75 : 48)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={12}
                          max={75}
                          step={1}
                          value={activeScene?.bubble_custom_layout?.customTopPct ?? (cardPosY === 'top' ? 18 : cardPosY === 'bottom' ? 75 : 48)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateScene(activeScene.scene_id, {
                              bubble_custom_layout: {
                                ...(activeScene.bubble_custom_layout || {}),
                                customTopPct: val,
                              },
                            });
                          }}
                          className="w-full accent-cyan-400 h-1.5 rounded-lg bg-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                          <span>{t('Độ rộng bong bóng (Width %):', 'Bubble Width (%):')}</span>
                          <span className="text-cyan-400 font-mono">
                            {activeScene?.bubble_custom_layout?.customWidthPct ?? (aspectRatio === '9:16' ? 82 : 60)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={60}
                          max={94}
                          step={1}
                          value={activeScene?.bubble_custom_layout?.customWidthPct ?? (aspectRatio === '9:16' ? 82 : 60)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateScene(activeScene.scene_id, {
                              bubble_custom_layout: {
                                ...(activeScene.bubble_custom_layout || {}),
                                customWidthPct: val,
                              },
                            });
                          }}
                          className="w-full accent-cyan-400 h-1.5 rounded-lg bg-slate-800"
                        />
                      </div>
                    </div>

                    {/* Color Themes */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-bold text-slate-300 block">
                        {t('Tông Màu Bong Bóng Thoại:', 'Bubble Color Theme:')}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Navy & Forest', bgA: '#132644', bgB: '#1E392A', textA: '#FFFFFF', textB: '#FFFFFF' },
                          { label: 'Obsidian & Amber', bgA: '#18181B', bgB: '#78350F', textA: '#FFFFFF', textB: '#FEF3C7' },
                          { label: 'Midnight & Indigo', bgA: '#0F172A', bgB: '#312E81', textA: '#FFFFFF', textB: '#E0E7FF' },
                          { label: 'Pure Milk & Slate', bgA: '#F8FAFC', bgB: '#E2E8F0', textA: '#0F172A', textB: '#0F172A' },
                        ].map((th) => (
                          <button
                            key={th.label}
                            type="button"
                            onClick={() => {
                              if (activeScene) {
                                updateScene(activeScene.scene_id, {
                                  bubble_custom_layout: {
                                    ...(activeScene.bubble_custom_layout || {}),
                                    bgColorA: th.bgA,
                                    bgColorB: th.bgB,
                                    textColorA: th.textA,
                                    textColorB: th.textB,
                                  },
                                });
                              }
                            }}
                            className="p-2 rounded-xl border border-slate-800 bg-slate-950 flex items-center gap-2 text-[11px] font-bold text-slate-300 hover:border-cyan-400/50 transition-all"
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: th.bgA }} />
                            <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: th.bgB }} />
                            <span className="truncate">{th.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {activeScene && (
                    <div className="space-y-2 bg-slate-900/60 p-4 rounded-3xl border border-slate-700/60">
                      <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t('Chỉnh sửa Lời Thoại / Kịch bản:', 'Edit Dialogue Script:')}</span>
                      </div>
                      <textarea
                        value={activeScene.voice_transcript || activeScene.summary_text || ''}
                        onChange={(e) =>
                          updateScene(activeScene.scene_id, {
                            voice_transcript: e.target.value,
                            summary_text: e.target.value,
                          })
                        }
                        rows={6}
                        className="w-full px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-mono"
                        placeholder="[Nhân vật A]: Lời thoại...\n[Nhân vật B]: Lời thoại..."
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* LAYER 1: AI SCENE NOTE CARD */}
                  <div className="space-y-3 pt-4 border-t border-slate-800/80 bg-slate-900/60 p-4 rounded-3xl border border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-white border border-slate-400 shadow-sm" />
                        <div>
                          <span className="text-xs font-black text-white block">
                            {t('Lớp 1: Thẻ Tóm Tắt AI (White Card)', 'Layer 1: AI Scene Note Card (White Card)')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {t('Khung trắng font viết tay tóm tắt nội dung chính', 'Handwritten white card summarizing the scene')}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSceneCards((v) => !v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                          showSceneCards ? 'bg-cyan-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {showSceneCards ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{showSceneCards ? t('BẬT', 'ON') : t('TẮT', 'OFF')}</span>
                      </button>
                    </div>

                    {showSceneCards && (
                      <>
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

                        {(project.visual_style as string) === 'dialogue_scene' && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setSwapSpeakers((prev) => !prev)}
                              className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                                swapSpeakers
                                  ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span>🔄</span>
                              <span>{t('Đổi Bên Nhân Vật (Trái ⇋ Phải)', 'Swap Character Sides (Left ⇋ Right)')}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                                {swapSpeakers ? t('Đã Đổi', 'Swapped') : t('Mặc Định', 'Default')}
                              </span>
                            </button>
                          </div>
                        )}

                        {activeScene && (
                          <div className="space-y-2 pt-2">
                            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{t(`Sửa Tóm Tắt AI (Scene ${activeSceneIndex + 1})`, `Edit AI Summary (Scene ${activeSceneIndex + 1})`)}</span>
                            </div>
                            <textarea
                              value={activeScene.summary_text || activeScene.voice_transcript || ''}
                              onChange={(e) => updateScene(activeScene.scene_id, { summary_text: e.target.value })}
                              rows={2}
                              className="w-full px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                              placeholder={t('Nhập tóm tắt phân cảnh viết tay...', 'Enter scene summary...')}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* LAYER 2: WHISPER VOICE SUBTITLES */}
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
                      <button
                        type="button"
                        onClick={() => setShowWhisperSubs((v) => !v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                          showWhisperSubs ? 'bg-cyan-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {showWhisperSubs ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{showWhisperSubs ? t('BẬT', 'ON') : t('TẮT', 'OFF')}</span>
                      </button>
                    </div>

                    {showWhisperSubs && (
                      <>
                        <div className="space-y-1.5 pt-2">
                          <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                            <span>{t('Vị trí hiển thị Phụ Đề Giọng Đọc:', 'Voice Subtitles Position:')}</span>
                            <span className="text-cyan-400 capitalize">{subsPosY}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'bottom' as TextPosition, icon: AlignVerticalJustifyEnd, label: 'Phía Dưới' },
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

                        {activeScene && (
                          <div className="space-y-2 pt-2">
                            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{t(`Sửa Lời Thoại / Phụ Đề Whisper (Scene ${activeSceneIndex + 1})`, `Edit Voice Transcript (Scene ${activeSceneIndex + 1})`)}</span>
                            </div>
                            <textarea
                              value={activeScene.voice_transcript || activeScene.summary_text || ''}
                              onChange={(e) => updateScene(activeScene.scene_id, { voice_transcript: e.target.value })}
                              rows={3}
                              className="w-full px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-mono"
                              placeholder={t('Nhập lời thoại hoặc phụ đề khớp giọng đọc...', 'Enter voice transcript or subtitle...')}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </BottomSheetOverlay>
      )}

      {/* SETTINGS ACTION SHEET */}
      {isSettingsSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSettingsSheetOpen(false)} />
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
                <span className="font-bold">{Math.round(totalDurationSec)}s ({durationInFrames} frames)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsSheetOpen(false)}
              className="w-full py-3.5 rounded-2xl bg-cyan-400 text-slate-950 font-black text-sm transition-all shadow-md"
            >
              <span>{t('Đóng Cài Đặt', 'Close Settings')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Root Studio Component Wrapped in RemotionPlayerProvider ─────────

interface MobileVideoEditorStudioProps {
  project: MotionProject;
  onBack: () => void;
}

export const MobileVideoEditorStudio: React.FC<MobileVideoEditorStudioProps> = ({ project, onBack }) => {
  const scenes = project.scenes && project.scenes.length > 0 ? (project.scenes as any) : [];
  const totalDuration = project.duration_sec || scenes.reduce((acc: number, s: any) => acc + getSceneDuration(s), 0) || 10;
  const initialFrames = Math.round(totalDuration * 30);

  return (
    <RemotionPlayerProvider
      fps={30}
      durationInFrames={initialFrames}
      audioSrc={project.audio_url || ''}
      initialBgColor={project.bg_color || '#FAF7EF'}
      initialAspectRatio={((project.aspect_ratio as any) || '16:9') as any}
    >
      <StudioInner project={project} initialScenes={scenes} onBack={onBack} />
    </RemotionPlayerProvider>
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
