import React from 'react';
import { SequentialRequest, AspectRatio } from '@/services/imageService';
import { ChevronDown, Film, Loader2 } from 'lucide-react';

interface SequentialFormProps {
  isDark: boolean;
  language: 'vi' | 'en';
  onSubmit: (data: SequentialRequest) => void;
  isGenerating: boolean;
}

export const SequentialForm: React.FC<SequentialFormProps> = ({
  isDark,
  language,
  onSubmit,
  isGenerating,
}) => {
  const [storyScript, setStoryScript] = React.useState('');
  const [panelCount, setPanelCount] = React.useState(2);
  const [style, setStyle] = React.useState<'Comic Book' | 'Manga' | 'Storyboard Sketch'>('Comic Book');
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatio>('16:9');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: SequentialRequest = {
      story_script: storyScript,
      panel_count: panelCount,
      style,
      aspect_ratio: aspectRatio,
    };

    onSubmit(data);
  };

  const isValid = storyScript.length >= 10 && storyScript.length <= 500 && panelCount >= 1 && panelCount <= 4;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Story Script */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Mô tả câu chuyện / kịch bản chuỗi sự kiện' : 'Story Script'} <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={storyScript}
          onChange={(e) => setStoryScript(e.target.value)}
          placeholder={
            language === 'vi'
              ? 'Ví dụ: Một thám tử mặc áo măng-tô đứng dưới đèn đường trong mưa. Cận cảnh khuôn mặt lo lắng của anh. Góc rộng một con hẻm tối với bóng người bí ẩn trong bóng tối.'
              : 'Example: A detective in a trench coat stands under a streetlamp in the rain. Close-up of his concerned face. Wide shot of a dark alley with a mysterious figure in the shadows.'
          }
          className={`w-full p-3 rounded-2xl border text-xs outline-none resize-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-rose-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-rose-500 shadow-xs'
          }`}
          rows={5}
          required
          minLength={10}
          maxLength={500}
        />
        <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {storyScript.length}/500 {language === 'vi' ? 'ký tự (tối thiểu 10)' : 'characters (minimum 10)'}
        </div>
      </div>

      {/* Panel Count */}
      <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className={isDark ? 'text-white' : 'text-slate-900'}>
            {language === 'vi' ? 'Số lượng khung hình (Panels)' : 'Panel Count'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-400">
            {panelCount} {language === 'vi' ? 'khung hình' : 'panels'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            value={panelCount}
            onChange={(e) => setPanelCount(parseInt(e.target.value))}
            min={1}
            max={4}
            className="flex-1 accent-rose-500 cursor-pointer"
          />
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPanelCount(num)}
                className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all ${
                  panelCount === num
                    ? 'bg-rose-500 text-white border-rose-500'
                    : isDark
                    ? 'bg-white/5 border-white/10 text-slate-300'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Style */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Phong cách nghệ thuật' : 'Art Style'} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as any)}
            className={`w-full p-3 pr-10 rounded-2xl border text-xs font-semibold appearance-none outline-none transition-all cursor-pointer ${
              isDark
                ? 'bg-[#090B12] border-slate-800 text-white focus:border-rose-400'
                : 'bg-white border-slate-300 text-slate-900 focus:border-rose-500 shadow-xs'
            }`}
            required
          >
            <option value="Comic Book" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Truyện tranh phương Tây (Comic Book)' : 'Comic Book'}
            </option>
            <option value="Manga" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Manga Nhật Bản (Manga)' : 'Manga'}
            </option>
            <option value="Storyboard Sketch" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Phác thảo điện ảnh (Storyboard Sketch)' : 'Storyboard Sketch'}
            </option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
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
            : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-500/25'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{language === 'vi' ? 'Đang tạo panels...' : 'Generating panels...'}</span>
          </>
        ) : (
          <>
            <Film className="w-4 h-4" />
            <span>{language === 'vi' ? 'Tạo Storyboard & Panels' : 'Generate Panels'}</span>
          </>
        )}
      </button>
    </form>
  );
};
