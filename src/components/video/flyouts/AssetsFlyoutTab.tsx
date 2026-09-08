'use client';

import React, { useRef } from 'react';
import {
  X,
  Upload,
  RefreshCw,
  Trash2,
  Plus,
  Atom,
  Sparkles,
  Video,
  ImageIcon,
  MessageSquare,
  Radio,
} from 'lucide-react';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface AssetsFlyoutTabProps {
  scenes: DynamicSceneData[];
  activeSceneId: number | string;
  visualStyle: string;
  fps: number;
  moduleId?: string;
  slideIndex?: number;
  swapSpeakers: boolean;
  onSetSwapSpeakers: (val: boolean | ((prev: boolean) => boolean)) => void;
  onSceneClick: (scene: DynamicSceneData) => void;
  onAddScene: () => void;
  onDeleteScene: (sceneId: number | string) => void;
  onUpdateScenes: (scenes: DynamicSceneData[]) => void;
  onOpenRegenerateModal: (scene: DynamicSceneData) => void;
  onClose: () => void;
  uploadedImages: Array<{ id: string; name: string; url: string; isVideo?: boolean }>;
  onUploadImageFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReplaceSceneImage?: (sceneId: number | string, file: File) => void;
  onAddAssetAsScene?: (asset: { id: string; name: string; url: string; isVideo?: boolean }) => void;
  onRemoveUploadedAsset?: (id: string) => void;
  isGeneratingOmni?: boolean;
  onOpenOmniModal?: () => void;
  projectData?: any;
  onDirectRegenerateOmni?: () => void;
}

const SceneMiniThumbnail: React.FC<{ scene: DynamicSceneData }> = ({ scene }) => {
  const imgUrl = scene.image_url || (scene as any).generated_image_url || (scene as any).sketch_image_url;
  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={scene.title || 'Scene preview'}
        className="w-full h-full object-cover rounded-lg"
      />
    );
  }
  if (scene.video_url) {
    return (
      <video
        src={scene.video_url}
        className="w-full h-full object-cover rounded-lg"
        muted
        playsInline
      />
    );
  }
  return (
    <div className="w-full h-full bg-[#1E2333] flex items-center justify-center text-slate-500 rounded-lg">
      <ImageIcon className="w-5 h-5" />
    </div>
  );
};

export const AssetsFlyoutTab: React.FC<AssetsFlyoutTabProps> = ({
  scenes,
  activeSceneId,
  visualStyle,
  fps,
  moduleId,
  slideIndex,
  swapSpeakers,
  onSetSwapSpeakers,
  onSceneClick,
  onAddScene,
  onDeleteScene,
  onUpdateScenes,
  onOpenRegenerateModal,
  onClose,
  uploadedImages,
  onUploadImageFile,
  onReplaceSceneImage,
  onAddAssetAsScene,
  onRemoveUploadedAsset,
  isGeneratingOmni,
  onOpenOmniModal,
  projectData,
  onDirectRegenerateOmni,
}) => {
  const activeScene = scenes.find((s) => s.scene_id === activeSceneId) || scenes[0];
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeScene && onReplaceSceneImage) {
      onReplaceSceneImage(activeScene.scene_id, file);
    }
    // reset value
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1 border-b border-[#22273B]">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            {visualStyle === 'science_explainer' ? (
              <>
                <Atom className="w-4 h-4 text-cyan-400" />
                <span>Khối Công Thức STEM Manim</span>
              </>
            ) : visualStyle === 'dialogue_scene' || visualStyle === 'conversation' ? (
              <>
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Hình Ảnh & Lời Thoại (Scene & Cast)</span>
              </>
            ) : visualStyle === 'animation_ads_image_veo' ||
              visualStyle === 'product_ads_omni' ||
              visualStyle === 'product_ads_motion' ? (
              <>
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Tài Nguyên Video Ads & Sản Phẩm</span>
              </>
            ) : visualStyle === 'video_news_60s' ||
              visualStyle === 'news_video' ||
              visualStyle === 'apple_modern_motion' ? (
              <>
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Danh Sách Bản Tin Headline</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Thư Viện Phân Cảnh (Scene Assets)</span>
              </>
            )}
          </h3>
          <p className="text-[10px] text-slate-400 font-mono">
            {scenes.length} Scenes · Slide {slideIndex ? slideIndex + 1 : 1}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── PROJECT MEDIA BIN (CAPCUT ASSETS TAB) ── */}
      <div className="p-3 rounded-2xl bg-[#141824] border border-[#252B3E] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">Media Dự Án (Project Assets)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              {uploadedImages.length}
            </span>
          </div>
          <label className="cursor-pointer text-[10px] font-bold px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 transition-all">
            <Upload className="w-3 h-3" />
            <span>+ Tải tệp</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={onUploadImageFile}
            />
          </label>
        </div>

        {uploadedImages.length === 0 ? (
          <div className="p-3 rounded-xl border border-dashed border-[#22273B] text-center text-[11px] text-slate-500 flex flex-col items-center gap-1">
            <ImageIcon className="w-5 h-5 text-slate-600" />
            <span>Tải nhiều ảnh / video vào đây và bấm &quot;Thêm vào Dự Án&quot; để đưa nhanh vào Timeline</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {uploadedImages.map((asset) => {
              const isVid = asset.isVideo || /\.(mp4|mov|webm|mkv)$/i.test(asset.name);
              return (
                <div key={asset.id} className="p-2 rounded-xl bg-[#0D1018] border border-[#22273B] flex flex-col justify-between group hover:border-cyan-500/40 transition-all">
                  <div className="aspect-video w-full rounded-lg bg-black/40 overflow-hidden relative mb-1.5 flex items-center justify-center">
                    {isVid ? (
                      <video src={asset.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    )}
                    {isVid && (
                      <span className="absolute top-1 left-1 px-1 py-0.2 bg-black/70 text-cyan-300 text-[8px] font-bold rounded">
                        VID
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-medium text-slate-300 truncate mb-1.5" title={asset.name}>
                    {asset.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onAddAssetAsScene?.(asset)}
                      className="flex-1 py-1 px-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                      title="Thêm tệp này vào Timeline"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>+ Thêm</span>
                    </button>
                    {onRemoveUploadedAsset && (
                      <button
                        type="button"
                        onClick={() => onRemoveUploadedAsset(asset.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Xoá khỏi thư viện"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. SCIENCE EXPLAINER / STEM MANIM BLOCKS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {visualStyle === 'science_explainer' ? (
        <div className="space-y-2.5">
          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2">
            <Atom className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Đồ họa vector toán học / vật lý Manim & MathJax. Không dùng ảnh bitmap để đảm bảo độ nét tuyệt đối.</span>
          </div>

          <div className="space-y-2">
            {scenes.map((s, idx) => (
              <div
                key={s.scene_id}
                onClick={() => onSceneClick(s)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  s.scene_id === activeSceneId
                    ? 'bg-cyan-500/15 border-cyan-500/50'
                    : 'bg-[#161926] border-[#22273B] hover:border-[#323955]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase text-cyan-400 bg-[#252B3E] px-2 py-0.5 rounded">
                    Phân đoạn {idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRegenerateModal(s);
                      }}
                      className="p-1 text-slate-400 hover:text-cyan-400"
                      title="Tạo lại công thức bằng AI (3 Điểm)"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteScene(s.scene_id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="Xóa phân đoạn này"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-bold text-white mb-1">{s.title}</p>
                <textarea
                  value={s.voice_transcript || s.summary_text || ''}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = scenes.map((sc) =>
                      sc.scene_id === s.scene_id
                        ? { ...sc, voice_transcript: val, summary_text: val }
                        : sc
                    );
                    onUpdateScenes(updated);
                  }}
                  rows={2}
                  placeholder="Nhập phương trình hoặc giải thích..."
                  className="w-full bg-[#0E111A] border border-[#22273B] rounded-xl p-2 text-[11px] text-slate-200 outline-none focus:border-cyan-400 resize-none font-mono"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={onAddScene}
              className="w-full py-2.5 rounded-2xl border border-dashed border-[#2F374E] hover:border-cyan-400 text-xs font-bold text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-center gap-1.5 bg-[#161926]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm Phân Đoạn STEM</span>
            </button>
          </div>
        </div>
      ) : visualStyle === 'dialogue_scene' || visualStyle === 'conversation' ? (
        /* ───────────────────────────────────────────────────────────── */
        /* 2. DIALOGUE TEMPLATE: SCENE BACKDROP IMAGE (REPLACE / AI 3 PTS) + TURNS SCRIPT */
        /* ───────────────────────────────────────────────────────────── */
        <div className="space-y-4">
          {/* Hidden File Input for Image/Video Replacement */}
          <input
            type="file"
            ref={replaceFileInputRef}
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* A. SCENE ILLUSTRATION IMAGE PREVIEW & ACTIONS (ĐỔI TẤM HÌNH NÀY - 3 ĐIỂM / TẢI ẢNH LÊN) */}
          <div className="p-3.5 rounded-2xl bg-[#141724] border border-[#282F45] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
                <span className="text-xs font-black text-white">
                  Tấm Hình Minh Họa Phân Cảnh (Scene Backdrop)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#252B3E] text-cyan-300 rounded-md">
                Scene {activeScene?.scene_id || 1} / {scenes.length}
              </span>
            </div>

            {/* Backdrop Image Thumbnail */}
            <div className="relative aspect-video w-full rounded-2xl bg-[#0E1017] border border-[#2B334B] overflow-hidden group shadow-lg">
              {activeScene?.image_url ||
              (activeScene as any)?.generated_image_url ||
              (activeScene as any)?.sketch_image_url ? (
                <img
                  src={
                    activeScene.image_url ||
                    (activeScene as any).generated_image_url ||
                    (activeScene as any).sketch_image_url
                  }
                  alt={activeScene.title || 'Dialogue Scene backdrop'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <ImageIcon className="w-8 h-8 opacity-60" />
                  <span className="text-xs font-bold">Chưa có ảnh minh họa</span>
                </div>
              )}

              {/* Gradient Overlay with Action Buttons */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-2.5 gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onOpenRegenerateModal(activeScene)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-[11px] font-black flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Đổi Hình AI</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-white text-[9px] font-bold">
                    3 Điểm
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => replaceFileInputRef.current?.click()}
                  className="py-1.5 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600/60 text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                  title="Upload file ảnh từ máy để thay thế"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tải ảnh</span>
                </button>
              </div>
            </div>

            {/* Quick Scene Selector if multiple scenes exist */}
            {scenes.length > 1 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Chọn phân cảnh cần đổi ảnh:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {scenes.map((s, sIdx) => {
                    const isCur = s.scene_id === activeSceneId;
                    const thumb = s.image_url || (s as any).generated_image_url || (s as any).sketch_image_url;
                    return (
                      <button
                        key={s.scene_id}
                        type="button"
                        onClick={() => onSceneClick(s)}
                        className={`flex-shrink-0 flex items-center gap-1.5 p-1.5 pr-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                          isCur
                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30'
                            : 'border-[#22273B] bg-[#161926] text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-[#0E1017] overflow-hidden flex-shrink-0">
                          {thumb ? (
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px]">🎭</div>
                          )}
                        </div>
                        <span>Scene {sIdx + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* B. CAST & DIALOGUE SCRIPT MANAGEMENT */}
          <div className="space-y-3">
            <div className="p-2.5 rounded-2xl bg-[#161926] border border-[#22273B] flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎭</span>
                <span className="text-slate-200">2 Nhân Vật Đang Trò Chuyện</span>
              </div>
              <button
                type="button"
                onClick={() => onSetSwapSpeakers(!swapSpeakers)}
                className="px-2.5 py-1 rounded-lg bg-[#252B3E] text-cyan-400 hover:bg-[#303850] text-[10px] font-bold transition-all flex items-center gap-1"
              >
                <span>⇄</span>
                <span>{swapSpeakers ? 'Đã đổi bên' : 'Đổi vị trí'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Danh sách lời thoại ({scenes.length} lượt)
              </span>
              {scenes.map((s, idx) => (
                <div
                  key={s.scene_id}
                  onClick={() => onSceneClick(s)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    s.scene_id === activeSceneId
                      ? 'bg-cyan-500/15 border-cyan-500/50'
                      : 'bg-[#161926] border-[#22273B] hover:border-[#323955]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase text-cyan-400 bg-[#252B3E] px-2 py-0.5 rounded">
                      {idx % 2 === 0 ? 'Nhân vật A' : 'Nhân vật B'} · Lượt {idx + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteScene(s.scene_id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="Xóa lượt thoại"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <textarea
                    value={s.voice_transcript || s.summary_text || ''}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updated = scenes.map((sc) =>
                        sc.scene_id === s.scene_id
                          ? { ...sc, voice_transcript: val, summary_text: val }
                          : sc
                      );
                      onUpdateScenes(updated);
                    }}
                    rows={2}
                    placeholder="Nhập lời thoại..."
                    className="w-full bg-[#0E111A] border border-[#22273B] rounded-xl p-2 text-xs text-slate-200 outline-none focus:border-cyan-400 resize-none"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={onAddScene}
                className="w-full py-2.5 rounded-2xl border border-dashed border-[#2F374E] hover:border-cyan-400 text-xs font-bold text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-center gap-1.5 bg-[#161926]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Lượt Thoại Mới</span>
              </button>
            </div>
          </div>
        </div>
      ) : visualStyle === 'animation_ads_image_veo' ||
        visualStyle === 'product_ads_omni' ||
        visualStyle === 'product_ads_motion' ? (
        /* ───────────────────────────────────────────────────────────── */
        /* 3. GEMINI OMNI ADS & PRODUCT ASSETS */
        /* ───────────────────────────────────────────────────────────── */
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Ảnh sản phẩm tách nền:</span>
            <div className="p-3 rounded-2xl bg-[#161926] border border-[#22273B] flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {scenes[0]?.image_url ? (
                  <img src={scenes[0].image_url} alt="Product" className="w-full h-full object-contain" />
                ) : (
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{scenes[0]?.title || 'Sản phẩm chính'}</p>
                <p className="text-[10px] text-emerald-400 font-mono">✓ Đã tách nền chuẩn xác</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1A1829] border border-orange-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-orange-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Gemini Omni 1.1 Flash Ads Video</span>
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">
                Max 10s
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Mô hình Omni AI tạo chuyển động sản phẩm 3D điện ảnh thực tế kết hợp hiệu ứng VFX.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenOmniModal}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all active:scale-95"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Chat Sửa Video Omni</span>
              </button>
              {onDirectRegenerateOmni && (
                <button
                  type="button"
                  onClick={onDirectRegenerateOmni}
                  disabled={isGeneratingOmni}
                  className="px-3 py-2 rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-300 text-xs font-bold hover:bg-orange-500/20 transition-all flex items-center justify-center gap-1"
                  title="Tạo lại Video Omni ngay (3 Điểm)"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingOmni ? 'animate-spin' : ''}`} />
                  <span className="text-[10px]">3 Điểm</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ───────────────────────────────────────────────────────────── */
        /* 4. CARTOON / HANDDRAWN / WHITEBOARD / DEFAULT SKETCH CARDS */
        /* ───────────────────────────────────────────────────────────── */
        <div className="space-y-3">
          <label className="p-2.5 rounded-xl border border-dashed border-[#2F374E] hover:border-cyan-400 bg-[#161926] cursor-pointer flex items-center justify-center gap-2 text-xs text-slate-300 transition-all">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">+ Upload Ảnh / Video Tùy Biến</span>
            <input type="file" accept="image/*,video/*" onChange={onUploadImageFile} className="hidden" />
          </label>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {scenes.map((s) => {
              const isActive = s.scene_id === activeSceneId;
              return (
                <div
                  key={s.scene_id}
                  onClick={() => onSceneClick(s)}
                  className={`rounded-2xl border p-2.5 cursor-pointer flex flex-col justify-between transition-all group ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-400/30 shadow-md shadow-cyan-500/10'
                      : 'border-[#22273B] bg-[#161926] hover:border-[#323955]'
                  }`}
                >
                  <div className="aspect-video w-full rounded-xl bg-white border border-[#2A3147] flex items-center justify-center p-1 relative overflow-hidden mb-2 shadow-xs">
                    <SceneMiniThumbnail scene={s} />
                    <span className="absolute bottom-1 right-1 text-[8px] font-mono px-1 py-0.2 bg-black/80 text-white rounded">
                      {((s.duration_frames ?? 150) / fps).toFixed(1)}s
                    </span>
                    {(s as any).video_url && (
                      <span className="absolute top-1 left-1 text-[8px] font-bold px-1 py-0.2 bg-cyan-500/90 text-black rounded shadow">
                        VID
                      </span>
                    )}
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-200 line-clamp-1 mb-1">{s.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] font-black uppercase text-slate-400 bg-[#252B3E] px-1.5 py-0.5 rounded">
                      SCENE {s.scene_id}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {/* Upload Media to this Scene */}
                      <label
                        onClick={(e) => e.stopPropagation()}
                        title="Tải ảnh / video lên cho Scene này"
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f && onReplaceSceneImage) {
                              onReplaceSceneImage(s.scene_id, f);
                            }
                            if (e.target) e.target.value = '';
                          }}
                        />
                      </label>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenRegenerateModal(s);
                        }}
                        title="Tạo lại Scene này bằng AI (3 Điểm)"
                        className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all flex items-center gap-0.5"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span className="text-[8px] font-mono text-cyan-400">3đ</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteScene(s.scene_id);
                        }}
                        title="Xóa phân cảnh này"
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onAddScene}
            className="w-full py-2.5 rounded-2xl border border-dashed border-[#2F374E] hover:border-cyan-400 text-xs font-bold text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-center gap-1.5 bg-[#161926]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Thêm Phân Cảnh (Add Scene)</span>
          </button>
        </div>
      )}
    </div>
  );
};
