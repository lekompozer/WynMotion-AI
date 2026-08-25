'use client';

import React, { useState } from 'react';
import { X, Type, Sparkles, Wand2, RefreshCw, Check, Trash2, Edit2, Globe } from 'lucide-react';
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
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('vi');
  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'timeline'>('presets');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editText, setEditText] = useState<string>('');

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
            <h3 className="text-sm font-black text-white">Auto-Captions AI</h3>
            <p className="text-[11px] text-slate-400">Phụ đề tự động Whisper & 10 mẫu CapCut</p>
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
      </div>

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
