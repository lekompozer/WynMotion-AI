import React, { useState } from 'react';
import {
  X,
  Type,
  Sparkles,
  Wand2,
  RefreshCw,
  Check,
  Trash2,
  Edit2,
  Edit3,
  Globe,
  Radio,
  Move,
  Sliders,
  Eye,
  EyeOff,
  Music,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Plus,
} from 'lucide-react';
import { CaptionSegment, CaptionPresetStyle, CAPTION_PRESET_LABELS } from '../subtitles/CapCutCaptionRenderer';

export type TextPosition = 'top' | 'middle' | 'bottom';

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
  showSubs?: boolean;
  onToggleSubs?: () => void;
  subsPosY?: TextPosition;
  onChangeSubsPosY?: (pos: TextPosition) => void;
  activeScene?: any;
  activeSceneIndex?: number;
  onUpdateActiveSceneTranscript?: (text: string) => void;
  hasVoiceAudio?: boolean;
  isCommercialMusicStyle?: boolean;
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
  onOpenReviewModal?: () => void;
  hasTranslatedSegments?: boolean;
  activeSubtitleMode?: 'original' | 'translated';
  onChangeSubtitleMode?: (mode: 'original' | 'translated') => void;
  originalLanguage?: string;
  targetLanguage?: string;
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
  showSubs = true,
  onToggleSubs,
  subsPosY = 'bottom',
  onChangeSubsPosY,
  activeScene,
  activeSceneIndex = 0,
  onUpdateActiveSceneTranscript,
  hasVoiceAudio = true,
  isCommercialMusicStyle = false,
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
  onOpenReviewModal,
  hasTranslatedSegments = false,
  activeSubtitleMode = 'original',
  onChangeSubtitleMode,
  originalLanguage = 'vi',
  targetLanguage = 'en',
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(originalLanguage || 'vi');
  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'timeline' | 'news_badge'>('presets');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editText, setEditText] = useState<string>('');


  const isNewsStyle =
    visualStyle === 'video_news_60s' ||
    visualStyle === 'news_video' ||
    visualStyle === 'breaking_news' ||
    visualStyle === 'video_news';

  const handleStartTranscribe = async () => {
    if (!audioUrl || !hasVoiceAudio) {
      alert('Vui lòng tạo âm thanh Giọng đọc AI hoặc tải lên Audio có lời trước khi tạo phụ đề tự động.');
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

  const handleAddCustomSegment = () => {
    const newId = Date.now();
    const newSeg: CaptionSegment = {
      id: newId,
      start: 0,
      end: 3.0,
      text: 'Slogan / Phụ đề quảng cáo mới',
    };
    onChangeSegments([...segments, newSeg]);
    setActiveSubTab('timeline');
    setEditingId(newId);
    setEditText('Slogan / Phụ đề quảng cáo mới');
  };

  return (
    <div className="space-y-4">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between pb-2 border-b border-[#252B3E]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 font-bold">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Auto-Captions & Phụ Đề</h3>
            <p className="text-[11px] text-slate-400">
              {isCommercialMusicStyle
                ? 'Mẫu chữ động CapCut & Slogan quảng cáo (BGM)'
                : 'Phụ đề tự động Whisper & Kiểu chữ CapCut'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2333]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── 1. SUBTITLE DISPLAY & POSITION CONTROLS (Moved from Settings/Canvas) ── */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1A1F30] to-[#121522] border border-[#2A334C] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm" />
            <div>
              <span className="text-xs font-black text-white block">Hiển Thị Phụ Đề Trên Video</span>
              <span className="text-[10px] text-slate-400">Khung chữ phụ đề chạy theo video</span>
            </div>
          </div>
          {onToggleSubs && (
            <button
              type="button"
              onClick={onToggleSubs}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                showSubs ? 'bg-cyan-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {showSubs ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showSubs ? 'BẬT' : 'TẮT'}</span>
            </button>
          )}
        </div>

        {showSubs && onChangeSubsPosY && (
          <div className="space-y-1.5 pt-2 border-t border-[#252B3E]">
            <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>Vị trí hiển thị phụ đề:</span>
              <span className="text-cyan-400 capitalize">
                {subsPosY === 'top' ? 'Trên Cùng' : subsPosY === 'middle' ? 'Ở Giữa' : 'Phía Dưới'}
              </span>
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
                    onClick={() => onChangeSubsPosY(pos.id)}
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
        )}
      </div>

      {/* ── 2. TEMPLATE-TAILORED UI (COMMERCIAL BGM vs VOICE AI EXPLAINER) ── */}
      {isCommercialMusicStyle ? (
        /* COMMERCIAL BGM MODE: Informative Banner & Slogan Addition */
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-purple-500/10 border border-purple-400/30 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
            <Music className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Mẫu Quảng Cáo Nhạc Nền (BGM)</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Mẫu này sử dụng nhạc nền thương mại đính kèm. Phụ đề tự động Whisper chỉ áp dụng khi có Giọng đọc Voice AI. Bạn có thể chọn mẫu chữ động CapCut bên dưới và thêm câu Slogan hiển thị trên video.
          </p>
          <button
            type="button"
            onClick={handleAddCustomSegment}
            className="w-full py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Câu Slogan / Tiêu Đề Mới</span>
          </button>
        </div>
      ) : (
        /* VOICE AI NARRATION MODE: Whisper AI Transcriber & Scene Transcript */
        <>
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
                <option value="ja">🇯🇵 日本語 (Japanese)</option>
                <option value="zh">🇨🇳 中文 (Chinese)</option>
                <option value="ko">🇰🇷 한국어 (Korean)</option>
                <option value="auto">🌐 Tự động nhận diện</option>
              </select>
            </div>

            <button
              onClick={handleStartTranscribe}
              disabled={isTranscribing || !audioUrl || !hasVoiceAudio}
              className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                isTranscribing
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : !audioUrl || !hasVoiceAudio
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

            {/* Quick Switch between Original & Translated Subtitles */}
            {hasTranslatedSegments && onChangeSubtitleMode && (
              <div className="pt-2 border-t border-[#252B3E] space-y-1.5">
                <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>Hiển thị trên video:</span>
                  <span className="text-cyan-400 font-bold uppercase">{activeSubtitleMode}</span>
                </div>
                <div className="flex p-1 rounded-xl bg-[#141828] border border-[#262D42]">
                  <button
                    type="button"
                    onClick={() => onChangeSubtitleMode('original')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeSubtitleMode === 'original'
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bản Gốc ({(originalLanguage || 'vi').toUpperCase()})
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeSubtitleMode('translated')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeSubtitleMode === 'translated'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bản Dịch ({(targetLanguage || 'en').toUpperCase()})
                  </button>
                </div>
              </div>
            )}

            {/* Review & Edit Whisper JSON button */}
            {segments.length > 0 && onOpenReviewModal && (
              <button
                type="button"
                onClick={onOpenReviewModal}
                className="w-full py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Rà Soát & Dịch Phụ Đề (DeepSeek)</span>
              </button>
            )}
          </div>


          {/* Active Scene Transcript Editor (Transferred from Settings) */}
          {activeScene && onUpdateActiveSceneTranscript && (
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-2">
              <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sửa Lời Thoại / Phụ Đề Whisper (Phân cảnh {activeSceneIndex + 1})</span>
              </div>
              <textarea
                value={activeScene.voice_transcript || activeScene.summary_text || ''}
                onChange={(e) => onUpdateActiveSceneTranscript(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-xs leading-relaxed border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-mono"
                placeholder="Nhập lời thoại hoặc phụ đề khớp giọng đọc phân cảnh này..."
              />
            </div>
          )}
        </>
      )}

      {/* ── 3. SUB-TABS (PRESETS, TIMELINE, NEWS BADGE) ── */}
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
        {isNewsStyle && (
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
        )}
      </div>

      {/* ── SUB-TAB: NEWS BADGE ── */}
      {activeSubTab === 'news_badge' && isNewsStyle && (
        <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
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
              min="5"
              max="40"
              value={captionPosY}
              onChange={(e) => onChangeCaptionPosY?.(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-[#252B3E] rounded-lg cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#181B28] border border-[#2A334C] space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>⚡</span>
              Dòng Chữ Chạy Tin Vắn (Ticker Running Text)
            </label>
            <input
              type="text"
              value={tickerText}
              onChange={(e) => onChangeTickerText?.(e.target.value)}
              placeholder="VD: ⚡ BẢN TIN NÓNG • Cập nhật liên tục 24/7..."
              className="w-full bg-[#11131E] border border-[#2D374D] rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      )}

      {/* ── SUB-TAB: 10 KIỂU CAPCUT PRESETS ── */}
      {activeSubTab === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
          {(Object.entries(CAPTION_PRESET_LABELS) as [CaptionPresetStyle, { label: string; desc: string; icon: string }][]).map(([id, preset]) => {
            const isSelected = presetStyle === id;
            return (
              <div
                key={id}
                onClick={() => onChangePresetStyle(id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 active:scale-[0.98] ${
                  isSelected
                    ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/10'
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

      {/* ── SUB-TAB: TIMELINE SEGMENTS ── */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {segments.length === 0 ? (
            <div className="p-6 text-center text-slate-400 border border-dashed border-[#252B3E] rounded-2xl space-y-2">
              <Type className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="text-xs font-bold text-slate-300">Chưa có phụ đề hoặc slogan nào</p>
              <p className="text-[11px] text-slate-500">
                {isCommercialMusicStyle
                  ? 'Bấm nút "Thêm Câu Slogan" ở trên để tạo câu quảng cáo.'
                  : 'Bấm "Tạo Phụ Đề Tự Động" ở trên để Whisper AI trích xuất mốc thời gian.'}
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
