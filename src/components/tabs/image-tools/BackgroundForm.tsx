import React from 'react';
import { BackgroundRequest, AspectRatio } from '@/services/imageService';
import { ChevronDown, Image as ImageIcon, Loader2 } from 'lucide-react';

interface BackgroundFormProps {
  isDark: boolean;
  language: 'vi' | 'en';
  onSubmit: (data: BackgroundRequest) => void;
  isGenerating: boolean;
}

export const BackgroundForm: React.FC<BackgroundFormProps> = ({
  isDark,
  language,
  onSubmit,
  isGenerating,
}) => {
  const [theme, setTheme] = React.useState('');
  const [minimalistMode, setMinimalistMode] = React.useState(false);
  const [negativeSpacePosition, setNegativeSpacePosition] = React.useState<'Center' | 'Left' | 'Right' | 'Top'>('Center');
  const [colorMood, setColorMood] = React.useState<'Dark' | 'Light' | 'Pastel' | 'Vibrant'>('Dark');
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatio>('16:9');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: BackgroundRequest = {
      theme,
      aspect_ratio: aspectRatio,
    };

    if (minimalistMode) {
      data.minimalist_mode = minimalistMode;
      data.negative_space_position = negativeSpacePosition;
    }
    if (colorMood) data.color_mood = colorMood;

    onSubmit(data);
  };

  const isValid = theme.length >= 10 && theme.length <= 200;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Theme */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Chủ đề background' : 'Background Theme'} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder={
            language === 'vi'
              ? 'Ví dụ: Thành phố cyberpunk về đêm, Rừng thông mùa thu sương mù'
              : 'Example: Cyberpunk city at night, Foggy pine forest in autumn'
          }
          className={`w-full p-3 rounded-2xl border text-xs outline-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 shadow-xs'
          }`}
          required
          minLength={10}
          maxLength={200}
        />
        <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {theme.length}/200 {language === 'vi' ? 'ký tự (tối thiểu 10)' : 'characters (minimum 10)'}
        </div>
      </div>

      {/* Minimalist Mode Toggle */}
      <div className="flex items-center gap-2.5 py-1">
        <input
          type="checkbox"
          id="minimalist-mode"
          checked={minimalistMode}
          onChange={(e) => setMinimalistMode(e.target.checked)}
          className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
        />
        <label htmlFor="minimalist-mode" className={`text-xs font-bold cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {language === 'vi'
            ? 'Chế độ tối giản (có không gian trống để đặt chữ/UI)'
            : 'Minimalist mode (with negative space for text/UI)'}
        </label>
      </div>

      {/* Negative Space Position */}
      {minimalistMode && (
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {language === 'vi' ? 'Vị trí không gian trống' : 'Negative Space Position'}
          </label>
          <div className="relative">
            <select
              value={negativeSpacePosition}
              onChange={(e) => setNegativeSpacePosition(e.target.value as any)}
              className={`w-full p-3 pr-10 rounded-2xl border text-xs font-semibold appearance-none outline-none transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#090B12] border-slate-800 text-white focus:border-emerald-400'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-xs'
              }`}
            >
              <option value="Center" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                {language === 'vi' ? 'Ở giữa (Center)' : 'Center'}
              </option>
              <option value="Left" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                {language === 'vi' ? 'Bên trái (Left)' : 'Left'}
              </option>
              <option value="Right" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                {language === 'vi' ? 'Bên phải (Right)' : 'Right'}
              </option>
              <option value="Top" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                {language === 'vi' ? 'Phía trên (Top)' : 'Top'}
              </option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Color Mood */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Tâm trạng màu sắc' : 'Color Mood'}
        </label>
        <div className="relative">
          <select
            value={colorMood}
            onChange={(e) => setColorMood(e.target.value as any)}
            className={`w-full p-3 pr-10 rounded-2xl border text-xs font-semibold appearance-none outline-none transition-all cursor-pointer ${
              isDark
                ? 'bg-[#090B12] border-slate-800 text-white focus:border-emerald-400'
                : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-xs'
            }`}
          >
            <option value="Dark" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Tông tối huyền bí (Dark)' : 'Dark'}
            </option>
            <option value="Light" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Tông sáng trong trẻo (Light)' : 'Light'}
            </option>
            <option value="Pastel" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Màu Pastel nhẹ nhàng (Pastel)' : 'Pastel'}
            </option>
            <option value="Vibrant" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Màu rực rỡ sống động (Vibrant)' : 'Vibrant'}
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
            : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{language === 'vi' ? 'Đang tạo background...' : 'Generating...'}</span>
          </>
        ) : (
          <>
            <ImageIcon className="w-4 h-4" />
            <span>{language === 'vi' ? 'Tạo Background Ngay' : 'Generate Background'}</span>
          </>
        )}
      </button>
    </form>
  );
};
