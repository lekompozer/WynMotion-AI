import React from 'react';
import { LogoRequest, AspectRatio } from '@/services/imageService';
import { ChevronDown, Type, Loader2 } from 'lucide-react';

interface LogoFormProps {
  isDark: boolean;
  language: 'vi' | 'en';
  onSubmit: (data: LogoRequest) => void;
  isGenerating: boolean;
}

export const LogoForm: React.FC<LogoFormProps> = ({
  isDark,
  language,
  onSubmit,
  isGenerating,
}) => {
  const [brandName, setBrandName] = React.useState('');
  const [tagline, setTagline] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [style, setStyle] = React.useState<'Modern' | 'Minimalist' | 'Vintage' | 'Luxury'>('Modern');
  const [colorPalette, setColorPalette] = React.useState('');
  const [visualElements, setVisualElements] = React.useState('');
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatio>('1:1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: LogoRequest = {
      brand_name: brandName,
      industry,
      style,
      aspect_ratio: aspectRatio,
    };

    if (tagline) data.tagline = tagline;
    if (colorPalette) data.color_palette = colorPalette;
    if (visualElements) data.visual_elements = visualElements;

    onSubmit(data);
  };

  const isValid = brandName.length > 0 && brandName.length <= 50 && industry.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Brand Name */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Tên thương hiệu' : 'Brand Name'} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder={language === 'vi' ? 'Ví dụ: TechFlow, WynMotion' : 'Example: TechFlow, WynMotion'}
          className={`w-full p-3 rounded-2xl border text-xs outline-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 shadow-xs'
          }`}
          required
          maxLength={50}
        />
        <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {brandName.length}/50 {language === 'vi' ? 'ký tự' : 'characters'}
        </div>
      </div>

      {/* Tagline */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Khẩu hiệu' : 'Tagline'}
          <span className={`ml-1.5 text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ({language === 'vi' ? 'Tùy chọn' : 'Optional'})
          </span>
        </label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder={language === 'vi' ? 'Ví dụ: Innovation in Motion' : 'Example: Innovation in Motion'}
          className={`w-full p-3 rounded-2xl border text-xs outline-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 shadow-xs'
          }`}
          maxLength={100}
        />
        <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {tagline.length}/100 {language === 'vi' ? 'ký tự' : 'characters'}
        </div>
      </div>

      {/* Industry */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Ngành nghề' : 'Industry'} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder={language === 'vi' ? 'Ví dụ: Tech Startup, Coffee Shop' : 'Example: Tech Startup, Coffee Shop'}
          className={`w-full p-3 rounded-2xl border text-xs outline-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 shadow-xs'
          }`}
          required
        />
      </div>

      {/* Style */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Phong cách logo' : 'Logo Style'} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as any)}
            className={`w-full p-3 pr-10 rounded-2xl border text-xs font-semibold appearance-none outline-none transition-all cursor-pointer ${
              isDark
                ? 'bg-[#090B12] border-slate-800 text-white focus:border-cyan-400'
                : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500 shadow-xs'
            }`}
            required
          >
            <option value="Modern" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Hiện đại (Modern)' : 'Modern'}
            </option>
            <option value="Minimalist" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Tối giản (Minimalist)' : 'Minimalist'}
            </option>
            <option value="Vintage" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Cổ điển (Vintage)' : 'Vintage'}
            </option>
            <option value="Luxury" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Sang trọng (Luxury)' : 'Luxury'}
            </option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Màu sắc mong muốn' : 'Color Palette'}
          <span className={`ml-1.5 text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ({language === 'vi' ? 'Tùy chọn' : 'Optional'})
          </span>
        </label>
        <input
          type="text"
          value={colorPalette}
          onChange={(e) => setColorPalette(e.target.value)}
          placeholder={language === 'vi' ? 'Ví dụ: xanh dương và bạc, gradient tím cyan' : 'Example: blue and silver, violet cyan gradient'}
          className={`w-full p-3 rounded-2xl border text-xs outline-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 shadow-xs'
          }`}
          maxLength={100}
        />
        <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {colorPalette.length}/100 {language === 'vi' ? 'ký tự' : 'characters'}
        </div>
      </div>

      {/* Visual Elements */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Ý tưởng biểu tượng' : 'Visual Elements'}
          <span className={`ml-1.5 text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ({language === 'vi' ? 'Tùy chọn' : 'Optional'})
          </span>
        </label>
        <textarea
          value={visualElements}
          onChange={(e) => setVisualElements(e.target.value)}
          placeholder={
            language === 'vi'
              ? 'Ví dụ: dòng dữ liệu chảy, tia chớp tốc độ, lá cây cách điệu'
              : 'Example: flowing data streams, speed lightning, stylized leaves'
          }
          className={`w-full p-3 rounded-2xl border text-xs outline-none resize-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 shadow-xs'
          }`}
          rows={2}
          maxLength={150}
        />
        <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {visualElements.length}/150 {language === 'vi' ? 'ký tự' : 'characters'}
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
            : 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-rose-500/25'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{language === 'vi' ? 'Đang tạo logo...' : 'Generating...'}</span>
          </>
        ) : (
          <>
            <Type className="w-4 h-4" />
            <span>{language === 'vi' ? 'Tạo Logo & Typography' : 'Generate Logo'}</span>
          </>
        )}
      </button>
    </form>
  );
};
