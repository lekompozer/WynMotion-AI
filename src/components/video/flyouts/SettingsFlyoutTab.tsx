'use client';

import React from 'react';
import { X, Eye, EyeOff, Edit3, Type } from 'lucide-react';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export const BG_THEMES = [
  { color: '#FAF7EF', label: 'Vintage Cream' },
  { color: '#FFFFFF', label: 'Pure White' },
  { color: '#F1F5F9', label: 'Paper Gray' },
  { color: '#0F172A', label: 'Midnight Slate' },
  { color: '#0B0F19', label: 'Deep Dark' },
  { color: '#052E16', label: 'Emerald Forest' },
];

export interface SettingsFlyoutTabProps {
  onClose: () => void;
  visualStyle: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  scenes: DynamicSceneData[];
  activeSceneId: number | string;
  onUpdateScenesWithHistory: (scenes: DynamicSceneData[]) => void;
  swapSpeakers: boolean;
  onSetSwapSpeakers: (val: boolean | ((prev: boolean) => boolean)) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  showSceneCards: boolean;
  setShowSceneCards: (val: boolean | ((prev: boolean) => boolean)) => void;
  cardPosY: 'top' | 'middle' | 'bottom';
  setCardPosY: (pos: 'top' | 'middle' | 'bottom') => void;
  showWhisperSubs: boolean;
  subsPosY: 'top' | 'middle' | 'bottom';
  onOpenCaptionsTab: () => void;
}

export const SettingsFlyoutTab: React.FC<SettingsFlyoutTabProps> = ({
  onClose,
  visualStyle,
  aspectRatio,
  scenes,
  activeSceneId,
  onUpdateScenesWithHistory,
  swapSpeakers,
  onSetSwapSpeakers,
  bgColor,
  setBgColor,
  showSceneCards,
  setShowSceneCards,
  cardPosY,
  setCardPosY,
  showWhisperSubs,
  subsPosY,
  onOpenCaptionsTab,
}) => {
  const isDialogue = visualStyle === 'dialogue_scene' || visualStyle === 'conversation';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1 border-b border-[#22273B]">
        <h3 className="text-sm font-black text-white">
          {isDialogue ? 'Cài Đặt Khung Hội Thoại (Dialogue Bubble)' : 'Canvas Settings'}
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 1. DIALOGUE SCENE BUBBLE CONTROLS (X/Y 2D POSITIONS, % FONT SIZE, WIDTH, BUBBLE COLORS) */}
      {isDialogue ? (
        <div className="space-y-4">
          {(() => {
            const currentScene = scenes.find((s) => s.scene_id === activeSceneId) || scenes[0];
            if (!currentScene) return null;
            const layout = (currentScene as any).bubble_custom_layout || {};

            const isPortrait = aspectRatio === '9:16';
            const isSquare = aspectRatio === '1:1';
            const baseW = isPortrait ? 1080 : isSquare ? 1080 : 1920;
            const defaultFontPct = isPortrait ? 3.3 : isSquare ? 3.3 : 2.0;

            const currentFontPct = layout.fontSizePct
              ? Number(layout.fontSizePct)
              : layout.fontSize
              ? layout.fontSize > 26
                ? (layout.fontSize / baseW) * 100
                : (layout.fontSize / (isPortrait ? 420 : isSquare ? 580 : 880)) * 100
              : defaultFontPct;

            const equiv1080pPx = Math.round(baseW * (currentFontPct / 100));

            const posXA = layout.customPosXA ?? (isPortrait ? 36 : 28);
            const posYA = layout.customPosYA ?? layout.customTopPctA ?? (isPortrait ? 30 : 34);
            const posXB = layout.customPosXB ?? (isPortrait ? 64 : 72);
            const posYB = layout.customPosYB ?? layout.customTopPctB ?? (isPortrait ? 30 : 34);
            const widthPct = layout.customWidthPct ?? (isPortrait ? 82 : isSquare ? 76 : 48);

            const updateBubbleLayout = (patch: Record<string, any>) => {
              const newScenes = scenes.map((s) =>
                s.scene_id === currentScene.scene_id
                  ? {
                      ...s,
                      bubble_custom_layout: {
                        ...((s as any).bubble_custom_layout || {}),
                        ...patch,
                      },
                    }
                  : s
              );
              onUpdateScenesWithHistory(newScenes);
            };

            return (
              <div className="space-y-3.5">
                {/* Top Controls: Swap Speakers */}
                <div className="p-3 rounded-2xl bg-[#141724] border border-[#282F45] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
                    <span className="text-xs font-black text-white">Vị Trí & Khung Bong Bóng Thoại</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSetSwapSpeakers(!swapSpeakers)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 transition-all ${
                      swapSpeakers
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                        : 'border-[#2D354E] bg-[#1B1F30] text-slate-300 hover:border-cyan-500/50'
                    }`}
                  >
                    <span>⇄</span>
                    <span>{swapSpeakers ? 'Đã Đổi Bên' : 'Đổi Bên (Trái ⇋ Phải)'}</span>
                  </button>
                </div>

                {/* Speaker A (Left) Sliders */}
                <div className="space-y-2.5 bg-[#141724] p-3 rounded-2xl border border-sky-500/30">
                  <div className="text-[11px] font-black text-sky-400 flex items-center justify-between">
                    <span>👤 Nhân Vật A (Bên Trái)</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      X: {posXA}% • Y: {posYA}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Vị trí Ngang (Trục X):</span>
                      <span className="text-sky-300 font-mono">{posXA}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      step={1}
                      value={posXA}
                      onChange={(e) => updateBubbleLayout({ customPosXA: parseInt(e.target.value) })}
                      className="w-full accent-sky-400 h-1.5 rounded-lg bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Vị trí Dọc (Trục Y - Lên / Xuống):</span>
                      <span className="text-sky-300 font-mono">{posYA}%</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={90}
                      step={1}
                      value={posYA}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        updateBubbleLayout({ customPosYA: val, customTopPctA: val, customTopPct: val });
                      }}
                      className="w-full accent-sky-400 h-1.5 rounded-lg bg-slate-800"
                    />
                  </div>
                </div>

                {/* Speaker B (Right) Sliders */}
                <div className="space-y-2.5 bg-[#141724] p-3 rounded-2xl border border-emerald-500/30">
                  <div className="text-[11px] font-black text-emerald-400 flex items-center justify-between">
                    <span>👤 Nhân Vật B (Bên Phải)</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      X: {posXB}% • Y: {posYB}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Vị trí Ngang (Trục X):</span>
                      <span className="text-emerald-300 font-mono">{posXB}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      step={1}
                      value={posXB}
                      onChange={(e) => updateBubbleLayout({ customPosXB: parseInt(e.target.value) })}
                      className="w-full accent-emerald-400 h-1.5 rounded-lg bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Vị trí Dọc (Trục Y - Lên / Xuống):</span>
                      <span className="text-emerald-300 font-mono">{posYB}%</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={90}
                      step={1}
                      value={posYB}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        updateBubbleLayout({ customPosYB: val, customTopPctB: val, customTopPct: val });
                      }}
                      className="w-full accent-emerald-400 h-1.5 rounded-lg bg-slate-800"
                    />
                  </div>
                </div>

                {/* Width % and Font Size Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1 bg-[#141724] p-2.5 rounded-2xl border border-[#282F45]">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <span>Độ Rộng Khung:</span>
                      <span className="text-cyan-400 font-mono">{widthPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={45}
                      max={95}
                      step={1}
                      value={widthPct}
                      onChange={(e) => updateBubbleLayout({ customWidthPct: parseInt(e.target.value) })}
                      className="w-full accent-cyan-400 h-1.5 rounded-lg bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1 bg-[#141724] p-2.5 rounded-2xl border border-[#282F45]">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <span>Cỡ Chữ (% Màn Hình):</span>
                      <span className="text-amber-400 font-mono">
                        {currentFontPct.toFixed(1)}% ({equiv1080pPx}px)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={isPortrait || isSquare ? 2.2 : 1.4}
                      max={isPortrait || isSquare ? 5.0 : 3.2}
                      step={0.1}
                      value={currentFontPct}
                      onChange={(e) => {
                        const pct = parseFloat(e.target.value);
                        const px1080 = Math.round(baseW * (pct / 100));
                        updateBubbleLayout({
                          fontSizePct: pct,
                          fontSize: px1080,
                        });
                      }}
                      className="w-full accent-amber-400 h-1.5 rounded-lg bg-slate-800"
                    />
                  </div>
                </div>

                {/* Color Themes for Dialogue Bubbles */}
                <div className="space-y-1.5 bg-[#141724] p-3 rounded-2xl border border-[#282F45]">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Màu Sắc Khung Bong Bóng Thoại (Bubble Colors):
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { label: 'Navy & Forest', bgA: '#132644', bgB: '#1E392A', textA: '#FFFFFF', textB: '#FFFFFF' },
                      { label: 'Obsidian & Amber', bgA: '#18181B', bgB: '#78350F', textA: '#FFFFFF', textB: '#FEF3C7' },
                      { label: 'Midnight & Indigo', bgA: '#0F172A', bgB: '#312E81', textA: '#FFFFFF', textB: '#E0E7FF' },
                      { label: 'Pure Milk & Slate', bgA: '#F8FAFC', bgB: '#E2E8F0', textA: '#0F172A', textB: '#0F172A' },
                    ].map((th) => (
                      <button
                        key={th.label}
                        type="button"
                        onClick={() =>
                          updateBubbleLayout({
                            bgColorA: th.bgA,
                            bgColorB: th.bgB,
                            textColorA: th.textA,
                            textColorB: th.textB,
                          })
                        }
                        className="p-2 rounded-xl border border-[#22273B] bg-[#0E1017] flex items-center gap-2 text-[11px] font-bold text-slate-300 hover:border-cyan-400 transition-all"
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: th.bgA }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: th.bgB }} />
                        <span className="truncate">{th.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dialogue Script Textarea for Active Scene */}
                <div className="space-y-1.5 bg-[#141724] p-3 rounded-2xl border border-[#282F45]">
                  <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Chỉnh Sửa Lời Thoại Phân Đoạn Này:</span>
                  </div>
                  <textarea
                    value={currentScene.voice_transcript || currentScene.summary_text || ''}
                    onChange={(e) => {
                      const newScenes = scenes.map((s) =>
                        s.scene_id === currentScene.scene_id
                          ? { ...s, voice_transcript: e.target.value, summary_text: e.target.value }
                          : s
                      );
                      onUpdateScenesWithHistory(newScenes);
                    }}
                    rows={2}
                    className="w-full px-2.5 py-1.5 rounded-xl text-[11px] bg-[#0E1017] border border-[#22273B] text-white resize-none focus:outline-none focus:border-cyan-400"
                    placeholder="Nhập lời thoại..."
                  />
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <>
          {/* STANDARD STYLES: CANVAS BACKGROUND COLOR */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Màu Nền (Background)</label>
            <div className="grid grid-cols-3 gap-2">
              {BG_THEMES.map((theme) => (
                <button
                  key={theme.color}
                  onClick={() => setBgColor(theme.color)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] font-bold transition-all ${
                    bgColor === theme.color
                      ? 'border-orange-500 bg-orange-500/20 text-orange-300 ring-2 ring-orange-500/30'
                      : 'border-[#22273B] bg-[#161926] text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-black/30" style={{ backgroundColor: theme.color }} />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LAYER 1: AI SCENE NOTE CARD (WHITE HANDWRITTEN CARD) */}
          <div className="pt-3 border-t border-[#22273B] space-y-2.5 bg-[#141724] p-3 rounded-2xl border border-[#282F45]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
                <div>
                  <span className="text-xs font-black text-white block">Thẻ Tóm Tắt AI (White Card)</span>
                  <span className="text-[10px] text-slate-400">Khung trắng font viết tay tóm tắt ý chính</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSceneCards(!showSceneCards)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                  showSceneCards ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {showSceneCards ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{showSceneCards ? 'BẬT' : 'TẮT'}</span>
              </button>
            </div>

            {showSceneCards && (
              <>
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-bold text-slate-300 flex justify-between">
                    <span>Vị trí Thẻ Trắng:</span>
                    <span className="text-cyan-400 capitalize">{cardPosY}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['top', 'middle', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setCardPosY(pos)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                          cardPosY === pos
                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                            : 'border-[#22273B] bg-[#161926] text-slate-400'
                        }`}
                      >
                        {pos === 'top' ? 'Trên Cùng' : pos === 'middle' ? 'Ở Giữa' : 'Phía Dưới'}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const currentScene = scenes.find((s) => s.scene_id === activeSceneId) || scenes[0];
                  const currentIdx = scenes.findIndex((s) => s.scene_id === (currentScene?.scene_id || 1));
                  if (!currentScene) return null;
                  return (
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <Edit3 className="w-3 h-3 text-cyan-400" />
                        <span>Sửa Tóm Tắt AI (Scene {currentIdx + 1})</span>
                      </div>
                      <textarea
                        value={currentScene.summary_text || currentScene.voice_transcript || ''}
                        onChange={(e) => {
                          const newScenes = scenes.map((s) =>
                            s.scene_id === currentScene.scene_id ? { ...s, summary_text: e.target.value } : s
                          );
                          onUpdateScenesWithHistory(newScenes);
                        }}
                        rows={2}
                        className="w-full px-2.5 py-1.5 rounded-xl text-[11px] bg-[#0E1017] border border-[#22273B] text-white resize-none focus:outline-none focus:border-cyan-400"
                        placeholder="Nhập tóm tắt phân cảnh..."
                      />
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </>
      )}

      {/* WHISPER SUBTITLES NOTICE (MOVED TO TAB 5 CAPTIONS) */}
      <div className="pt-3 border-t border-[#22273B]">
        <div
          onClick={onOpenCaptionsTab}
          className="p-3 rounded-2xl bg-[#141724] border border-[#252B3E] hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-xs font-black text-white block group-hover:text-cyan-300 transition-colors">
                Phụ Đề Whisper & Kiểu Chữ
              </span>
              <span className="text-[10px] text-slate-400">
                {showWhisperSubs ? `Đang BẬT (${subsPosY === 'bottom' ? 'Phía dưới' : subsPosY === 'middle' ? 'Ở giữa' : 'Trên cùng'})` : 'Đang TẮT'}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">➔</span>
        </div>
      </div>
    </div>
  );
};
