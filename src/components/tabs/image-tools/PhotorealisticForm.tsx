import React from 'react';
import { PhotorealisticRequest, AspectRatio } from '@/services/imageService';
import { ChevronDown, Sparkles, Loader2 } from 'lucide-react';

interface PhotorealisticFormProps {
  isDark: boolean;
  language: 'vi' | 'en';
  onSubmit: (data: PhotorealisticRequest) => void;
  isGenerating: boolean;
}

export const PhotorealisticForm: React.FC<PhotorealisticFormProps> = ({
  isDark,
  language,
  onSubmit,
  isGenerating,
}) => {
  const [prompt, setPrompt] = React.useState('');
  const [lighting, setLighting] = React.useState<'Natural' | 'Studio' | 'Cinematic' | 'Golden Hour' | ''>('');
  const [cameraAngle, setCameraAngle] = React.useState<'Wide Angle' | 'Macro' | 'Drone View' | 'Eye Level' | ''>('');
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatio>('16:9');
  const [negativePrompt, setNegativePrompt] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: PhotorealisticRequest = {
      prompt,
      aspect_ratio: aspectRatio,
    };

    if (lighting) data.lighting = lighting;
    if (cameraAngle) data.camera_angle = cameraAngle;
    if (negativePrompt) data.negative_prompt = negativePrompt;

    onSubmit(data);
  };

  const isValid = prompt.length >= 10 && prompt.length <= 500;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Prompt */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Mô tả chi tiết cảnh' : 'Detailed Scene Description'} <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            language === 'vi'
              ? 'Ví dụ: Một chiếc xe hơi mui trần màu đỏ vintage thập niên 1960 đỗ trên đường ven biển lúc hoàng hôn'
              : 'Example: A vintage 1960s red convertible car parked on a coastal highway during sunset'
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

      {/* Lighting */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Kiểu ánh sáng' : 'Lighting'}
          <span className={`ml-1.5 text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ({language === 'vi' ? 'Tùy chọn' : 'Optional'})
          </span>
        </label>
        <div className="relative">
          <select
            value={lighting}
            onChange={(e) => setLighting(e.target.value as any)}
            className={`w-full p-3 pr-10 rounded-2xl border text-xs font-semibold appearance-none outline-none transition-all cursor-pointer ${
              isDark
                ? 'bg-[#090B12] border-slate-800 text-white focus:border-cyan-400'
                : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500 shadow-xs'
            }`}
          >
            <option value="" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? '-- Chọn kiểu ánh sáng --' : '-- Select lighting --'}
            </option>
            <option value="Natural" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Ánh sáng tự nhiên' : 'Natural'}
            </option>
            <option value="Studio" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Ánh sáng studio' : 'Studio'}
            </option>
            <option value="Cinematic" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Ánh sáng điện ảnh' : 'Cinematic'}
            </option>
            <option value="Golden Hour" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Giờ vàng' : 'Golden Hour'}
            </option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Camera Angle */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Góc máy' : 'Camera Angle'}
          <span className={`ml-1.5 text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ({language === 'vi' ? 'Tùy chọn' : 'Optional'})
          </span>
        </label>
        <div className="relative">
          <select
            value={cameraAngle}
            onChange={(e) => setCameraAngle(e.target.value as any)}
            className={`w-full p-3 pr-10 rounded-2xl border text-xs font-semibold appearance-none outline-none transition-all cursor-pointer ${
              isDark
                ? 'bg-[#090B12] border-slate-800 text-white focus:border-cyan-400'
                : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500 shadow-xs'
            }`}
          >
            <option value="" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? '-- Chọn góc máy --' : '-- Select camera angle --'}
            </option>
            <option value="Wide Angle" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Góc rộng' : 'Wide Angle'}
            </option>
            <option value="Macro" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Góc cận cảnh (Macro)' : 'Macro'}
            </option>
            <option value="Drone View" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Góc flycam' : 'Drone View'}
            </option>
            <option value="Eye Level" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Góc ngang tầm mắt' : 'Eye Level'}
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

      {/* Negative Prompt */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Negative Prompt (Những gì cần tránh)' : 'Negative Prompt'}
          <span className={`ml-1.5 text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ({language === 'vi' ? 'Tùy chọn' : 'Optional'})
          </span>
        </label>
        <textarea
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder={
            language === 'vi'
              ? 'Ví dụ: blur, distortion, watermark'
              : 'Example: blur, distortion, watermark'
          }
          className={`w-full p-2.5 rounded-2xl border text-xs outline-none resize-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-xs'
          }`}
          rows={2}
          maxLength={200}
        />
        <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {negativePrompt.length}/200 {language === 'vi' ? 'ký tự' : 'characters'}
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
            <span>{language === 'vi' ? 'Đang tạo ảnh...' : 'Generating...'}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>{language === 'vi' ? 'Tạo Ảnh Chân Thực' : 'Generate Photorealistic'}</span>
          </>
        )}
      </button>
    </form>
  );
};
