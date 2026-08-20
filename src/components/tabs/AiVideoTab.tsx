'use client';

import React, { useState, useRef } from 'react';
import {
  Film,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Check,
  Globe,
  Loader2,
  Mic,
  Play,
  Pause,
  Upload,
  Layers,
  FileText,
  Sliders,
  Users,
  Feather,
  Lock,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { wynmotionService, MotionProject } from '@/services/wynmotionService';

export const AiVideoTab: React.FC = () => {
  const { isVietnamese, t } = useApp();

  // Wizard Step (1: Style, 2: Idea, 3: Audio, 4: Ratio & Launch)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Visual Style
  const [visualStyle, setVisualStyle] = useState<'whiteboard_stream_hand' | 'handdrawn_fast_doodle' | 'apple_modern_motion' | 'character_animation'>('whiteboard_stream_hand');
  const [characterSubtype, setCharacterSubtype] = useState<'full_character' | 'stickman'>('full_character');

  // Step 2: Prompt / Concept
  const [prompt, setPrompt] = useState(
    isVietnamese ? 'Mô phỏng chu trình quang hợp của cây xanh trong tự nhiên' : 'Simulate the photosynthesis process of green plants in nature'
  );

  // Step 3: Voiceover & Audio
  const [selectedLang, setSelectedLang] = useState(isVietnamese ? 'vi' : 'en-US');
  const [voiceModel, setVoiceModel] = useState<'wynai' | 'gemini'>('wynai');
  const [selectedVoiceName, setSelectedVoiceName] = useState(isVietnamese ? 'Phạm Tuyên' : 'af_bella');
  const [targetAudience, setTargetAudience] = useState<'kids' | 'teen' | 'adult'>('teen');
  const [scriptStyle, setScriptStyle] = useState<'explainer' | 'storytelling' | 'humorous' | 'scientific'>('explainer');
  const [maxChars, setMaxChars] = useState<number>(500);
  const [customNarrationText, setCustomNarrationText] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDurationSec, setAudioDurationSec] = useState<number>(30);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);

  // Step 4: Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [activeProject, setActiveProject] = useState<MotionProject | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const PROMPT_SUGGESTIONS = [
    t('Mô phỏng chu trình quang hợp của cây xanh trong tự nhiên', 'Simulate the photosynthesis process of green plants in nature'),
    t('Giải thích nguyên lý hoạt động của Trí tuệ nhân tạo (AI)', 'Explain how Artificial Intelligence (AI) works step by step'),
    t('Giới thiệu tính năng vượt trội của nền tảng phần mềm mới', 'Introduce cutting-edge software features with 3D charts'),
  ];

  const handleTogglePlayAudio = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlayingAudioPreview) {
      audioPlayerRef.current.pause();
      setIsPlayingAudioPreview(false);
    } else {
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play();
      setIsPlayingAudioPreview(true);
    }
  };

  const handleGenerateAudio = async () => {
    if (!prompt.trim()) return;
    setIsGeneratingAudio(true);
    setIsPlayingAudioPreview(false);

    try {
      const res = await wynmotionService.generateScriptAndAudio({
        prompt,
        script: customNarrationText.trim() || undefined,
        language_code: selectedLang,
        target_audience: targetAudience,
        script_style: scriptStyle,
        max_chars: maxChars,
        voice_engine: voiceModel,
        voice_name: selectedVoiceName,
      });

      setScriptText(res.script);
      setAudioUrl(res.audio_url);
      setAudioDurationSec(res.duration_sec || 30);
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo giọng đọc AI');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleCreateProject = async () => {
    if (!prompt.trim()) return;
    setIsCreatingProject(true);

    try {
      const res = await wynmotionService.generateScenes({
        title: `WynMotion - ${prompt.slice(0, 25)}`,
        prompt,
        script: scriptText || customNarrationText || prompt,
        audio_url: audioUrl || undefined,
        duration_sec: audioDurationSec,
        aspect_ratio: aspectRatio,
        visual_style: visualStyle,
        character_subtype: characterSubtype,
        language_code: selectedLang,
      });

      if (res.success && res.project) {
        setActiveProject(res.project);
      }
    } catch (err: any) {
      alert(err.message || 'Không thể tạo dự án');
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 space-y-5">
      <audio
        ref={audioPlayerRef}
        onEnded={() => setIsPlayingAudioPreview(false)}
        className="hidden"
      />

      {/* STEP PROGRESS INDICATOR */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#FF2D55] to-[#FF5E85] text-white font-black text-xs flex items-center justify-center shadow-sm">
              {currentStep}
            </span>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {currentStep === 1 && t('Bước 1: Phong Cách Hoạt Họa', 'Step 1: Visual Style')}
              {currentStep === 2 && t('Bước 2: Ý Tưởng & Đề Tài', 'Step 2: Idea & Concept')}
              {currentStep === 3 && t('Bước 3: Giọng Đọc & Kịch Bản AI', 'Step 3: AI Voice & Audio')}
              {currentStep === 4 && t('Bước 4: Tỉ Lệ & Khởi Tạo Video', 'Step 4: Ratio & Launch')}
            </h2>
          </div>
          <span className="text-xs font-black text-[#FF2D55]">{currentStep}/4</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { step: 1, label: t('1. Style', '1. Style'), canJump: true },
            { step: 2, label: t('2. Ý Tưởng', '2. Prompt'), canJump: true },
            { step: 3, label: t('3. Voice AI', '3. Audio'), canJump: Boolean(prompt.trim()) },
            { step: 4, label: t('4. Tỉ Lệ', '4. Ratio'), canJump: Boolean(audioUrl) },
          ].map(({ step: s, label, canJump }) => (
            <button
              key={s}
              type="button"
              disabled={!canJump}
              onClick={() => {
                if (canJump) setCurrentStep(s as any);
              }}
              className={`h-7 rounded-xl text-[10px] font-extrabold flex items-center justify-center transition-all ${
                s === currentStep
                  ? 'bg-[#FF2D55] text-white shadow-sm shadow-rose-500/20 font-black'
                  : s < currentStep
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: VISUAL STYLE CARDS */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#FF2D55]" />
              <span>{t('Chọn Phong Cách Hoạt Họa (Visual Style)', 'Choose Visual Style')}</span>
            </label>
            <p className="text-[11px] text-slate-500">
              {t('Mỗi phong cách có thuật toán vẽ nét và cách phân bổ nhịp điệu riêng biệt.', 'Each style has a unique rendering engine and animation timing.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Style 1: Whiteboard Stream */}
            <div
              onClick={() => setVisualStyle('whiteboard_stream_hand')}
              className={`group rounded-2xl overflow-hidden border-2 cursor-pointer transition-all flex flex-col ${
                visualStyle === 'whiteboard_stream_hand'
                  ? 'border-[#FF2D55] bg-rose-50/40 ring-2 ring-rose-500/20 shadow-md scale-[1.01]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img
                  src="/assets/motion-styles/whiteboard_stream.jpg"
                  alt="Whiteboard Stream"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-amber-500 text-white font-black text-[9px] uppercase shadow-xs">
                  🔥 {t('Bút Vẽ Tay', 'Hand Drawn')}
                </span>
                {visualStyle === 'whiteboard_stream_hand' && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#FF2D55] text-white font-black text-[9px] shadow-sm flex items-center gap-1">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div className="p-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                  <span>🖋️</span>
                  <span>{t('Bút Vẽ Tay Whiteboard', 'Whiteboard Stream')}</span>
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
                  {t('Vẽ nét Notion-sketch trên giấy kem và tô màu theo giọng nói Whisper.', 'Marker pen drawing Notion-sketch elements synced to Whisper audio.')}
                </p>
              </div>
            </div>

            {/* Style 2: Doodle Quick */}
            <div
              onClick={() => setVisualStyle('handdrawn_fast_doodle')}
              className={`group rounded-2xl overflow-hidden border-2 cursor-pointer transition-all flex flex-col ${
                visualStyle === 'handdrawn_fast_doodle'
                  ? 'border-[#FF2D55] bg-rose-50/40 ring-2 ring-rose-500/20 shadow-md scale-[1.01]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img
                  src="/assets/motion-styles/doodle_quick.jpg"
                  alt="Doodle Quick"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-teal-500 text-white font-black text-[9px] uppercase shadow-xs">
                  🎨 {t('Màu Nước', 'Watercolor')}
                </span>
                {visualStyle === 'handdrawn_fast_doodle' && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#FF2D55] text-white font-black text-[9px] shadow-sm flex items-center gap-1">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div className="p-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                  <span>🎨</span>
                  <span>{t('Phác Chì & Màu Nước', 'Doodle Watercolor')}</span>
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
                  {t('Nét phác chì 2-3s, loang màu nước pastel và nảy chữ viết tay nghệ thuật.', 'Pencil sketch lines with soft watercolor blooming and pops.')}
                </p>
              </div>
            </div>

            {/* Style 3: Apple Modern UI */}
            <div
              onClick={() => setVisualStyle('apple_modern_motion')}
              className={`group rounded-2xl overflow-hidden border-2 cursor-pointer transition-all flex flex-col ${
                visualStyle === 'apple_modern_motion'
                  ? 'border-[#FF2D55] bg-rose-50/40 ring-2 ring-rose-500/20 shadow-md scale-[1.01]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img
                  src="/assets/motion-styles/apple_motion.jpg"
                  alt="Apple Modern UI"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-cyan-500 text-white font-black text-[9px] uppercase shadow-xs">
                  ⚡ {t('Apple UI', 'Tech UI')}
                </span>
                {visualStyle === 'apple_modern_motion' && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#FF2D55] text-white font-black text-[9px] shadow-sm flex items-center gap-1">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div className="p-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                  <span>🍏</span>
                  <span>{t('Hiện Đại / Apple UI Glass', 'Modern Apple UI')}</span>
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
                  {t('Thẻ kính mờ glassmorphism, gõ text cursor và biểu đồ 3D chuyển động.', 'Frosted glassmorphism cards with smooth typing and 3D charts.')}
                </p>
              </div>
            </div>

            {/* Style 4: Mascot Character */}
            <div
              onClick={() => setVisualStyle('character_animation')}
              className={`group rounded-2xl overflow-hidden border-2 cursor-pointer transition-all flex flex-col ${
                visualStyle === 'character_animation'
                  ? 'border-[#FF2D55] bg-rose-50/40 ring-2 ring-rose-500/20 shadow-md scale-[1.01]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img
                  src="/assets/motion-styles/character_motion.jpg"
                  alt="Character Mascot"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-pink-500 text-white font-black text-[9px] uppercase shadow-xs">
                  🦊 {t('Mascot WynMotion', 'Mascot Studio')}
                </span>
                {visualStyle === 'character_animation' && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#FF2D55] text-white font-black text-[9px] shadow-sm flex items-center gap-1">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div className="p-3 space-y-1.5">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                  <span>🏃</span>
                  <span>{t('Nhân Vật Mascot Cáo WynMotion', 'Character Mascot')}</span>
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                  {t('Chú cáo áo hồng cử động tay chân giải thích nội dung tương tác vui nhộn.', 'WynMotion fox mascot gesturing and presenting animated explainer cards.')}
                </p>
                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVisualStyle('character_animation');
                      setCharacterSubtype('full_character');
                    }}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-bold transition-all ${
                      characterSubtype === 'full_character'
                        ? 'bg-[#FF2D55] text-white font-black'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    🦊 {t('Mascot Cáo', 'Fox Mascot')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVisualStyle('character_animation');
                      setCharacterSubtype('stickman');
                    }}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-bold transition-all ${
                      characterSubtype === 'stickman'
                        ? 'bg-[#FF2D55] text-white font-black'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    ✏️ {t('Người Que', 'Stickman')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="w-full py-3.5 rounded-2xl bg-[#FF2D55] hover:bg-[#E11D48] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>{t('Tiếp Tục: Nhập Ý Tưởng & Đề Tài', 'Next: Enter Idea / Concept')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STEP 2: PROMPT / IDEA */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Wand2 className="h-4 w-4 text-[#FF2D55]" />
              <span>{t('Mô Tả Đề Tài Video Của Bạn', 'Enter Video Topic')}</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 1000))}
              rows={4}
              placeholder={t('Nhập chủ đề video...', 'Enter video topic...')}
              className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs outline-none focus:border-[#FF2D55] focus:ring-2 focus:ring-rose-500/10 leading-relaxed"
            />
            <div className="flex justify-end text-[10px] text-slate-400 mt-1">
              {prompt.length}/1000
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 block">
              💡 {t('Chủ đề mẫu gợi ý:', 'Suggested topics:')}
            </span>
            <div className="flex flex-col gap-1.5">
              {PROMPT_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="text-left text-xs p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all truncate"
                >
                  • {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex-1 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('Quay Lại', 'Back')}</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={!prompt.trim()}
              className="flex-2 py-3 rounded-xl bg-[#FF2D55] hover:bg-[#E11D48] text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{t('Tiếp Tục: Giọng Đọc AI', 'Next: AI Voice')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI VOICEOVER */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          {/* Target Audience */}
          <div>
            <label className="block text-slate-800 font-bold text-xs mb-1.5 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-amber-500" />
              <span>{t('Đối Tượng Người Xem', 'Target Audience')}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'kids', label: '🧸 ' + t('Trẻ em', 'Kids') },
                { id: 'teen', label: '⚡ ' + t('Giới trẻ', 'Teen') },
                { id: 'adult', label: '💼 ' + t('Người lớn', 'Adult') },
              ].map((aud) => (
                <button
                  key={aud.id}
                  type="button"
                  onClick={() => setTargetAudience(aud.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    targetAudience === aud.id
                      ? 'bg-rose-50 border-[#FF2D55] text-[#FF2D55] font-black'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="text-xs">{aud.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Model Selector */}
          <div>
            <label className="block text-slate-800 font-bold text-xs mb-1.5">
              {t('Động Cơ Giọng Đọc Độc Quyền', 'Exclusive Voice Engine')}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setVoiceModel('wynai')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  voiceModel === 'wynai'
                    ? 'bg-rose-50 border-[#FF2D55] text-[#FF2D55] ring-1 ring-rose-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <p className="font-black text-slate-900">WynVoice Studio</p>
                <p className="text-[10px] text-rose-600 mt-0.5">Ultra HD 48kHz (14 giọng 3 miền)</p>
              </button>

              <button
                type="button"
                onClick={() => setVoiceModel('gemini')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  voiceModel === 'gemini'
                    ? 'bg-rose-50 border-[#FF2D55] text-[#FF2D55] ring-1 ring-rose-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <p className="font-black text-slate-900">WynAI Neural Audio</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Neural Engine Cao Cấp</p>
              </button>
            </div>
          </div>

          {/* Trigger synthesis */}
          <button
            type="button"
            onClick={handleGenerateAudio}
            disabled={isGeneratingAudio || !prompt.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGeneratingAudio ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('Đang thu âm giọng đọc AI...', 'Synthesizing voiceover...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{t('✨ AI Tự Động Viết & Thu Âm Ngay', '✨ Generate Script & Audio Now')}</span>
              </>
            )}
          </button>

          {/* Audio Preview */}
          {audioUrl && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleTogglePlayAudio}
                  className="p-2.5 rounded-full bg-[#FF2D55] text-white shadow-sm"
                >
                  {isPlayingAudioPreview ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                </button>
                <div>
                  <p className="text-xs font-black text-slate-900">{selectedVoiceName}</p>
                  <p className="text-[10px] text-rose-600 font-bold">{audioDurationSec}s</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                ✅ {t('Đã Thu Âm', 'Audio Ready')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex-1 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('Quay Lại', 'Back')}</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              disabled={!audioUrl || isGeneratingAudio}
              className="flex-2 py-3 rounded-xl bg-[#FF2D55] hover:bg-[#E11D48] text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{t('Tiếp Tục: Tỉ Lệ & Tạo', 'Next: Ratio & Launch')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ASPECT RATIO & LAUNCH */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-[#FF2D55]" />
            <span>{t('Chọn Tỉ Lệ Khung Hình', 'Select Aspect Ratio')}</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '16:9', label: '16:9 ' + t('Ngang', 'Landscape'), sub: 'YouTube / PC' },
              { id: '9:16', label: '9:16 ' + t('Dọc', 'Portrait'), sub: 'TikTok / Reels' },
              { id: '1:1', label: '1:1 ' + t('Vuông', 'Square'), sub: 'Instagram' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setAspectRatio(r.id as any)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  aspectRatio === r.id
                    ? 'border-[#FF2D55] bg-rose-50/50 text-[#FF2D55] ring-1 ring-rose-300 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <p className="text-xs font-black">{r.label}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{r.sub}</p>
              </button>
            ))}
          </div>

          {/* Launch Action */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={isCreatingProject}
              className="flex-1 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('Quay Lại', 'Back')}</span>
            </button>
            <button
              type="button"
              onClick={handleCreateProject}
              disabled={isCreatingProject}
              className="flex-2 py-3.5 rounded-xl bg-[#FF2D55] hover:bg-[#E11D48] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-rose-500/20 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreatingProject ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('Đang tạo video...', 'Rendering...')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{t('🚀 Khởi Tạo Video (5 Điểm)', '🚀 Launch Studio (5 Pts)')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
