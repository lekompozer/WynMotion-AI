import React from 'react';
import { StylizedRequest, AspectRatio } from '@/services/imageService';
import { ChevronDown, Palette, Loader2 } from 'lucide-react';

interface StylizedFormProps {
  isDark: boolean;
  language: 'vi' | 'en';
  onSubmit: (data: StylizedRequest) => void;
  isGenerating: boolean;
}

export const StylizedForm: React.FC<StylizedFormProps> = ({
  isDark,
  language,
  onSubmit,
  isGenerating,
}) => {
  const [prompt, setPrompt] = React.useState('');
  const [stylePreset, setStylePreset] = React.useState<
    'Anime' | 'Watercolor' | 'Oil Painting' | 'Flat Design' | '3D Render' | 'Sticker Art'
  >('Anime');
  const [stickerMode, setStickerMode] = React.useState(false);
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatio>('1:1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: StylizedRequest = {
      prompt,
      style_preset: stylePreset,
      aspect_ratio: aspectRatio,
    };

    if (stickerMode) data.sticker_mode = stickerMode;

    onSubmit(data);
  };

  const isValid = prompt.length >= 10 && prompt.length <= 500;

  const styleOptions: { value: StylizedRequest['style_preset']; labelVi: string; labelEn: string }[] = [
    { value: 'Anime', labelVi: 'Anime', labelEn: 'Anime' },
    { value: 'Watercolor', labelVi: 'Màu nước', labelEn: 'Watercolor' },
    { value: 'Oil Painting', labelVi: 'Tranh sơn dầu', labelEn: 'Oil Painting' },
    { value: 'Flat Design', labelVi: 'Thiết kế phẳng', labelEn: 'Flat Design' },
    { value: '3D Render', labelVi: 'Render 3D', labelEn: '3D Render' },
    { value: 'Sticker Art', labelVi: 'Nghệ thuật sticker', labelEn: 'Sticker Art' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Prompt */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Mô tả đối tượng cần vẽ' : 'Object Description'} <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            language === 'vi'
              ? 'Ví dụ: Một con gấu trúc đỏ đáng yêu đang ăn tre trong rừng trúc mùa thu'
              : 'Example: A cute red panda eating bamboo in a forest during autumn'
          }
          className={`w-full p-3 rounded-2xl border text-xs outline-none resize-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 shadow-xs'
          }`}
          rows={4}
          required
          minLength={10}
          maxLength={500}
        />
        <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {prompt.length}/500 {language === 'vi' ? 'ký tự (tối thiểu 10)' : 'characters (minimum 10)'}
        </div>
      </div>

      {/* Style Preset */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Phong cách nghệ thuật' : 'Art Style'} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <select
            value={stylePreset}
            onChange={(e) => setStylePreset(e.target.value as any)}
            className={`w-full p-3 pr-10 rounded-2xl border text-xs font-semibold appearance-none outline-none transition-all cursor-pointer ${
              isDark
                ? 'bg-[#090B12] border-slate-800 text-white focus:border-cyan-400'
                : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500 shadow-xs'
            }`}
            required
          >
            {styleOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                {language === 'vi' ? opt.labelVi : opt.labelEn}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Sticker Mode Toggle */}
      <div className="flex items-center gap-2.5 py-1">
        <input
          type="checkbox"
          id="sticker-mode"
          checked={stickerMode}
          onChange={(e) => setStickerMode(e.target.checked)}
          className="w-4 h-4 rounded border-slate-700 text-[#FF2D55] focus:ring-0 cursor-pointer"
        />
        <label htmlFor="sticker-mode" className={`text-xs font-bold cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {language === 'vi'
            ? 'Chế độ sticker (nền trắng, đường viền rõ nét)'
            : 'Sticker mode (white background, clean outlines)'}
        </label>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Tỷ lệ khung hình' : 'Aspect Ratio'} <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setAspectRatio(ratio)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                aspectRatio === ratio
                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white border-[#FF2D55] shadow-md shadow-rose-500/25'
                  : isDark
                  ? 'bg-[#090B12] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || isGenerating}
        className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] ${
          !isValid || isGenerating
            ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-rose-500/25'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{language === 'vi' ? 'Đang tạo phong cách...' : 'Generating...'}</span>
          </>
        ) : (
          <>
            <Palette className="w-4 h-4" />
            <span>{language === 'vi' ? 'Tạo Phong Cách Nghệ Thuật' : 'Generate Stylized Art'}</span>
          </>
        )}
      </button>
    </form>
  );
};
