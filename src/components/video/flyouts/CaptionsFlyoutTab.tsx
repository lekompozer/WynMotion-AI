import React, { useState } from 'react';
import { X, Type, Sparkles, Wand2, RefreshCw, Check, Trash2, Edit2, Globe, Radio, Move, Sliders } from 'lucide-react';
import { CaptionSegment, CaptionPresetStyle, CAPTION_PRESET_LABELS } from '../subtitles/CapCutCaptionRenderer';

export interface CaptionsFlyoutTabProps {
  onClose: () => void;
  audioUrl?: string;
  segments: CaptionSegment[];
  onChangeSegments: (segments: CaptionSegment[]) => void;
  presetStyle: CaptionPresetStyle;
  onChangePresetStyle: (style: CaptionPresetStyle) => void;
  onTranscribeWhisper: (audioUrl: string, language: string) => Promise<void>;
  isTranscribing?: boolean;
  visualStyle?: string;
  sourceBadgeText?: string;
  onChangeSourceBadgeText?: (text: string) => void;
  sourceBadgePosX?: number;
  onChangeSourceBadgePosX?: (x: number) => void;
  sourceBadgePosY?: number;
  onChangeSourceBadgePosY?: (y: number) => void;
  captionPosY?: number;
  onChangeCaptionPosY?: (y: number) => void;
  tickerText?: string;
  onChangeTickerText?: (text: string) => void;
}

export const CaptionsFlyoutTab: React.FC<CaptionsFlyoutTabProps> = ({
  onClose,
  audioUrl,
  segments,
  onChangeSegments,
  presetStyle,
  onChangePresetStyle,
  onTranscribeWhisper,
  isTranscribing = false,
  visualStyle,
  sourceBadgeText = 'TIN MỚI TỪ VNEXPRESS',
  onChangeSourceBadgeText,
  sourceBadgePosX = 5,
  onChangeSourceBadgePosX,
  sourceBadgePosY = 5,
  onChangeSourceBadgePosY,
  captionPosY = 20,
  onChangeCaptionPosY,
  tickerText = '⚡ BẢN TIN NÓNG • Cập nhật liên tục 24/7',
  onChangeTickerText,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('vi');
  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'timeline' | 'news_badge'>('presets');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editText, setEditText] = useState<string>('');

  const isNewsStyle =
    visualStyle === 'video_news_60s' ||
    visualStyle === 'news_video' ||
    visualStyle === 'breaking_news' ||
    visualStyle === 'video_news';

  const handleStartTranscribe = async () => {
    if (!audioUrl) {
      alert('Vui lòng tạo âm thanh Voice AI hoặc tải lên Audio trước khi tạo phụ đề tự động.');
      return;
    }
    await onTranscribeWhisper(audioUrl, selectedLanguage);
  };

  const handleUpdateText = (id: string | number) => {
    onChangeSegments(
      segments.map((seg) => (seg.id === id ? { ...seg, text: editText } : seg))
    );
    setEditingId(null);
  };

  const handleDeleteSegment = (id: string | number) => {
    onChangeSegments(segments.filter((seg) => seg.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#252B3E]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 font-bold">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Auto-Captions & Tin Tức</h3>
            <p className="text-[11px] text-slate-400">Phụ đề Whisper, Mẫu CapCut & Thanh Tin Mới</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2333]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1A1F30] to-[#121522] border border-[#2A334C] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> Ngôn ngữ phát âm
          </span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-xs bg-[#181B28] border border-[#2D374D] rounded-xl px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="vi">🇻🇳 Tiếng Việt</option>
            <option value="en">🇺🇸 English</option>
            <option value="auto">🌐 Tự động nhận diện</option>
          </select>
        </div>

        <button
          onClick={handleStartTranscribe}
          disabled={isTranscribing || !audioUrl}
          className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            isTranscribing
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : !audioUrl
              ? 'bg-[#202538] text-slate-500 cursor-not-allowed border border-[#282F45]'
              : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-[0.98]'
          }`}
        >
          {isTranscribing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              Đang phân tích Whisper AI...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              {segments.length > 0 ? 'Tạo Lại Phụ Đề Whisper' : 'Tạo Phụ Đề Tự Động (Auto-Generate)'}
            </>
          )}
        </button>
      </div>

      <div className="flex bg-[#181B28] p-1 rounded-xl border border-[#252B3E]">
        <button
          onClick={() => setActiveSubTab('presets')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'presets'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          10 Kiểu CapCut
        </button>
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'timeline'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Edit2 className="w-3.5 h-3.5" />
          Timeline ({segments.length})
        </button>
        <button
          onClick={() => setActiveSubTab('news_badge')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'news_badge'
              ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-red-400" />
          Tin Mới
        </button>
      </div>

      {activeSubTab === 'news_badge' && (
        <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
          {/* Badge Text Input */}
          <div className="p-3 rounded-xl bg-[#181B28] border border-[#2A334C] space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              Nội dung Thanh Tin Mới (Source Badge)
            </label>
            <input
              type="text"
              value={sourceBadgeText}
              onChange={(e) => onChangeSourceBadgeText?.(e.target.value)}
              placeholder="VD: TIN MỚI TỪ VNEXPRESS..."
              className="w-full bg-[#11131E] border border-[#2D374D] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
            />
            {/* Quick Multi-Language Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '🇻🇳 VNExpress', text: 'TIN MỚI TỪ VNEXPRESS' },
                { label: '🇻🇳 Tuổi Trẻ', text: 'TIN MỚI TỪ TUỔI TRẺ' },
                { label: '🇺🇸 Breaking BBC', text: 'BREAKING NEWS: BBC' },
                { label: '🇺🇸 CNN Live', text: 'LIVE: CNN SPECIAL REPORT' },
                { label: '🇯🇵 NHK News', text: '最新ニュース: NHK' },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => onChangeSourceBadgeText?.(p.text)}
                  className="text-[10px] bg-[#22273B] hover:bg-[#2E354F] text-slate-300 hover:text-white px-2 py-0.5 rounded-lg border border-[#2F3854] transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Badge Position Controls */}
          <div className="p-3 rounded-xl bg-[#181B28] border border-[#2A334C] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-cyan-400" />
                Vị trí Thanh Tin Mới (X / Y)
              </span>
              <span className="text-[11px] text-slate-400">
                X: {sourceBadgePosX}% • Y: {sourceBadgePosY}%
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Trái qua phải (X)</span>
                  <span>{sourceBadgePosX}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="80"
                  value={sourceBadgePosX}
                  onChange={(e) => onChangeSourceBadgePosX?.(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-[#252B3E] rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Trên xuống dưới (Y)</span>
                  <span>{sourceBadgePosY}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="80"
                  value={sourceBadgePosY}
                  onChange={(e) => onChangeSourceBadgePosY?.(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-[#252B3E] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Caption Height Control */}
          <div className="p-3 rounded-xl bg-[#181B28] border border-[#2A334C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Độ cao Phụ đề (Cách đáy màn hình)
              </span>
              <span className="text-[11px] text-amber-400 font-bold">{captionPosY}%</span>
            </div>
            <input
              type="range"
              min="8"
              max="60"
              value={captionPosY}
              onChange={(e) => onChangeCaptionPosY?.(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-[#252B3E] rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Mặc định 20% cách đáy màn hình (chuẩn video tin tức thời sự 9:16).
            </p>
          </div>

          {/* Ticker Text Input */}
          <div className="p-3 rounded-xl bg-[#181B28] border border-[#2A334C] space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span className="text-red-500">⚡</span> Dải chữ chạy tin tức (Bottom Ticker)
            </label>
            <textarea
              rows={2}
              value={tickerText}
              onChange={(e) => onChangeTickerText?.(e.target.value)}
              placeholder="VD: Dời đường sắt Phú Xuyên - Ngọc Hồi • Mở rộng quốc lộ 1A lên 16 làn..."
              className="w-full bg-[#11131E] border border-[#2D374D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>
        </div>
      )}

      {activeSubTab === 'presets' && (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {(Object.keys(CAPTION_PRESET_LABELS) as CaptionPresetStyle[]).map((key) => {
            const preset = CAPTION_PRESET_LABELS[key];
            const isSelected = presetStyle === key;
            return (
              <div
                key={key}
                onClick={() => onChangePresetStyle(key)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'border-cyan-400 bg-[#1E2333] shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400'
                    : 'border-[#252B3E] bg-[#161824] hover:border-slate-500 hover:bg-[#1C2030]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#202538] flex items-center justify-center text-xl shrink-0">
                  {preset.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{preset.label}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{preset.desc}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeSubTab === 'timeline' && (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {segments.length === 0 ? (
            <div className="p-6 text-center text-slate-400 border border-dashed border-[#252B3E] rounded-2xl">
              <Type className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-300">Chưa có phụ đề nào</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Bấm "Tạo Phụ Đề Tự Động" ở trên để Whisper AI trích xuất mốc thời gian.
              </p>
            </div>
          ) : (
            segments.map((seg) => (
              <div
                key={seg.id}
                className="p-3 rounded-xl border border-[#252B3E] bg-[#161824] space-y-2"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-[#202538] text-cyan-300">
                    ⏱️ {seg.start}s → {seg.end}s
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(seg.id);
                        setEditText(seg.text);
                      }}
                      className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-[#202538] rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSegment(seg.id)}
                      className="p-1 text-slate-400 hover:text-red-400 hover:bg-[#202538] rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {editingId === seg.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 text-xs bg-[#12141F] border border-cyan-400 rounded-lg text-white focus:outline-none"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 text-[11px] rounded bg-[#202538] text-slate-300 hover:bg-[#282F45]"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleUpdateText(seg.id)}
                        className="px-2.5 py-1 text-[11px] rounded bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-white leading-relaxed">{seg.text}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
