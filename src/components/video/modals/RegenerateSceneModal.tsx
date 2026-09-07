import React from 'react';
import { RefreshCw, X, Loader2, Sparkles, Coins } from 'lucide-react';
import { DynamicSceneData } from '../DynamicSceneRenderer';

interface RegenerateSceneModalProps {
  scene: DynamicSceneData | null;
  isOpen: boolean;
  isRegenerating: boolean;
  prompt: string;
  onPromptChange: (val: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  visualStyle?: string;
}

export const RegenerateSceneModal: React.FC<RegenerateSceneModalProps> = ({
  scene,
  isOpen,
  isRegenerating,
  prompt,
  onPromptChange,
  onSubmit,
  onClose,
  visualStyle,
}) => {
  if (!isOpen || !scene) return null;

  const isDialogue = visualStyle === 'dialogue_scene' || visualStyle === 'conversation';

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#141622] rounded-3xl border border-[#2A3147] shadow-2xl p-6 space-y-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#22273B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold shadow-sm shadow-cyan-500/20">
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">
                  {isDialogue ? `Đổi hình nền minh họa AI — Cảnh ${scene.scene_id}` : `Tạo lại Scene ${scene.scene_id}: ${scene.title}`}
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Coins className="w-3 h-3 text-amber-400" />
                  3 Điểm
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Thời lượng cảnh: {scene.start_sec}s ➔ {scene.end_sec}s
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isRegenerating}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-[#1E2333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current scene image preview if available */}
        {scene.image_url && (
          <div className="flex items-center gap-3 p-3 bg-[#10121C] rounded-2xl border border-[#22283C]">
            <img
              src={scene.image_url}
              alt="Current Scene"
              className="w-16 h-12 rounded-xl object-cover border border-[#2A3147] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-300">Ảnh hiện tại của cảnh</p>
              <p className="text-[10px] text-slate-500 truncate">{scene.title || 'Scene Backdrop'}</p>
            </div>
          </div>
        )}

        {/* Input prompt */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300">
            {isDialogue
              ? 'Nhập mô tả / bối cảnh tranh vẽ 3D Pixar mới cho cuộc hội thoại:'
              : 'Nhập Prompt/Ý tưởng hình vẽ mới cho Scene này:'}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            disabled={isRegenerating}
            rows={4}
            placeholder={
              isDialogue
                ? "Ví dụ: 'Sảnh sân bay quốc tế hiện đại, 2 nhân vật 3D Pixar sinh động đang nói chuyện trước bảng chỉ dẫn check-in...'"
                : "Ví dụ: 'Vẽ chú mèo đang ôm lá thư với biểu cảm ngạc nhiên và dấu tích xanh thành công...'"
            }
            className="w-full p-3.5 rounded-2xl bg-[#1A1E2E] border border-[#2B334B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none transition-colors"
          />
        </div>

        {/* Cost & Note box */}
        <div className="p-3 rounded-2xl bg-[#161926] border border-[#252B3E] text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200">Chi phí tạo mới:</span> Tiêu tốn <span className="text-amber-300 font-bold">3 điểm</span> tài khoản. AI sẽ sinh lại bức hình minh họa chất lượng cao riêng cho Cảnh này và cập nhật ngay vào video.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isRegenerating}
            className="px-4 py-2.5 rounded-xl border border-[#2D354E] text-xs font-bold text-slate-300 hover:bg-[#1E2333] transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isRegenerating ? 'Đang tạo mới...' : 'Xác nhận Đổi Hình AI (3 Điểm)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
