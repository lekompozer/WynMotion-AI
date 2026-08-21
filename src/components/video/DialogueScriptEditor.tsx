'use client';

import React from 'react';
import { Plus, Trash2, Sparkles, MessageSquare, ArrowRightLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { DialogueTurn, DialogueSpeakerConfig } from '@/services/wynmotionService';

interface DialogueScriptEditorProps {
  speakerA: DialogueSpeakerConfig;
  speakerB: DialogueSpeakerConfig;
  dialogueTurns: DialogueTurn[];
  onChangeTurns: (turns: DialogueTurn[]) => void;
  onAiAutoWrite: () => void;
  isGeneratingAi?: boolean;
}

export const DialogueScriptEditor: React.FC<DialogueScriptEditorProps> = ({
  speakerA,
  speakerB,
  dialogueTurns,
  onChangeTurns,
  onAiAutoWrite,
  isGeneratingAi = false,
}) => {
  const { isVietnamese, isDark, t } = useApp();

  const handleUpdateText = (id: string, text: string) => {
    onChangeTurns(
      dialogueTurns.map((turn) => (turn.id === id ? { ...turn, text } : turn))
    );
  };

  const handleToggleSpeaker = (id: string) => {
    onChangeTurns(
      dialogueTurns.map((turn) =>
        turn.id === id ? { ...turn, speaker: turn.speaker === 'A' ? 'B' : 'A' } : turn
      )
    );
  };

  const handleAddTurn = (speaker: 'A' | 'B') => {
    const newTurn: DialogueTurn = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      speaker,
      text: '',
    };
    onChangeTurns([...dialogueTurns, newTurn]);
  };

  const handleDeleteTurn = (id: string) => {
    if (dialogueTurns.length <= 1) return;
    onChangeTurns(dialogueTurns.filter((turn) => turn.id !== id));
  };

  const totalChars = dialogueTurns.reduce((sum, t) => sum + t.text.length, 0);

  return (
    <div className="space-y-4">
      {/* Header with Auto-write AI & Total chars */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-cyan-500" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            {isVietnamese ? 'Kịch bản hội thoại từng câu' : 'Dialogue Script Lines'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAiAutoWrite}
            disabled={isGeneratingAi}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-400 font-extrabold text-[11px] flex items-center gap-1 active:scale-95 transition-all"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{isVietnamese ? 'AI Tự Soạn Kịch Bản' : 'AI Auto-Write'}</span>
          </button>
          <span className="text-[11px] font-bold text-slate-400">{totalChars} ký tự</span>
        </div>
      </div>

      {/* List of Dialogue Turns */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {dialogueTurns.map((turn, index) => {
          const isA = turn.speaker === 'A';
          const speakerConfig = isA ? speakerA : speakerB;

          return (
            <div
              key={turn.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                isA
                  ? isDark
                    ? 'bg-cyan-950/20 border-cyan-800/40 mr-4'
                    : 'bg-cyan-50/70 border-cyan-200 mr-4'
                  : isDark
                  ? 'bg-purple-950/20 border-purple-800/40 ml-4'
                  : 'bg-purple-50/70 border-purple-200 ml-4'
              }`}
            >
              {/* Speaker Bar */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      isA
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-purple-500 text-white'
                    }`}
                  >
                    {isA ? `👩 ${speakerA.name || 'Speaker A'}` : `👨 ${speakerB.name || 'Speaker B'}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleSpeaker(turn.id)}
                    className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center gap-0.5 underline decoration-dotted"
                  >
                    <ArrowRightLeft className="w-2.5 h-2.5" />
                    <span>{isVietnamese ? 'Đổi người nói' : 'Switch'}</span>
                  </button>
                </div>

                {dialogueTurns.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTurn(turn.id)}
                    className="p-1 rounded-md text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Textarea for this turn */}
              <textarea
                value={turn.text}
                onChange={(e) => handleUpdateText(turn.id, e.target.value)}
                rows={2}
                placeholder={
                  isA
                    ? isVietnamese
                      ? 'Nhập lời thoại của nhân vật A...'
                      : 'Enter line for Character A...'
                    : isVietnamese
                    ? 'Nhập lời thoại của nhân vật B...'
                    : 'Enter line for Character B...'
                }
                className={`w-full p-2.5 rounded-xl border text-xs font-medium outline-none resize-none transition-colors ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800 text-white focus:border-cyan-400'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Quick Add Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleAddTurn('A')}
          className="flex-1 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-extrabold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ {isVietnamese ? `Lời thoại ${speakerA.name || 'A'}` : `Line for ${speakerA.name || 'A'}`}</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddTurn('B')}
          className="flex-1 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-extrabold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ {isVietnamese ? `Lời thoại ${speakerB.name || 'B'}` : `Line for ${speakerB.name || 'B'}`}</span>
        </button>
      </div>
    </div>
  );
};
