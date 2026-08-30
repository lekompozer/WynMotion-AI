import React from 'react';
import { CompositionRequest, AspectRatio } from '@/services/imageService';
import { Upload, X, Plus, Layers, Loader2, ChevronDown } from 'lucide-react';

interface CompositionFormProps {
  isDark: boolean;
  language: 'vi' | 'en';
  onSubmit: (data: CompositionRequest, baseImage: File, overlayImages: File[]) => void;
  isGenerating: boolean;
}

export const CompositionForm: React.FC<CompositionFormProps> = ({
  isDark,
  language,
  onSubmit,
  isGenerating,
}) => {
  const [baseImage, setBaseImage] = React.useState<File | null>(null);
  const [basePreview, setBasePreview] = React.useState<string>('');
  const [overlayImages, setOverlayImages] = React.useState<File[]>([]);
  const [overlayPreviews, setOverlayPreviews] = React.useState<string[]>([]);
  const [prompt, setPrompt] = React.useState('');
  const [compositionStyle, setCompositionStyle] = React.useState<'realistic' | 'artistic' | 'professional' | 'collage'>('realistic');
  const [lightingAdjustment, setLightingAdjustment] = React.useState(true);
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatio>('1:1');
  const [negativePrompt, setNegativePrompt] = React.useState('');

  const handleBaseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert(language === 'vi' ? 'File không được vượt quá 15MB' : 'File size must not exceed 15MB');
        return;
      }
      setBaseImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBasePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOverlayImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (overlayImages.length + files.length > 5) {
      alert(language === 'vi' ? 'Tối đa 5 ảnh overlay' : 'Maximum 5 overlay images');
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      if (file.size > 15 * 1024 * 1024) {
        alert(`${file.name}: ${language === 'vi' ? 'File không được vượt quá 15MB' : 'File size must not exceed 15MB'}`);
        continue;
      }
      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setOverlayPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    setOverlayImages((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveBaseImage = () => {
    setBaseImage(null);
    setBasePreview('');
  };

  const handleRemoveOverlayImage = (index: number) => {
    setOverlayImages((prev) => prev.filter((_, i) => i !== index));
    setOverlayPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseImage || overlayImages.length === 0) return;

    const data: CompositionRequest = {
      prompt,
      aspect_ratio: aspectRatio,
    };

    if (compositionStyle !== 'realistic') data.composition_style = compositionStyle;
    if (!lightingAdjustment) data.lighting_adjustment = lightingAdjustment;
    if (negativePrompt) data.negative_prompt = negativePrompt;

    onSubmit(data, baseImage, overlayImages);
  };

  const isValid =
    baseImage !== null &&
    overlayImages.length > 0 &&
    overlayImages.length <= 5 &&
    prompt.length > 0 &&
    prompt.length <= 300;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Base Image Upload */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Ảnh nền cơ sở (Base Image)' : 'Base Image'} <span className="text-rose-500">*</span>
        </label>

        {!basePreview ? (
          <label
            className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${
              isDark
                ? 'bg-[#090B12] border-slate-800 hover:border-emerald-500 hover:bg-emerald-950/10'
                : 'bg-white border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 shadow-xs'
            }`}
          >
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <Upload className="w-6 h-6 text-emerald-400 mb-1.5" />
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {language === 'vi' ? 'Tải ảnh nền cơ sở (Base Image)' : 'Upload Base Image'}
              </p>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>PNG, JPG (Tối đa 15MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={handleBaseImageChange} />
          </label>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-black/40 p-2 flex items-center justify-center">
            <img src={basePreview} alt="Base Preview" className="max-h-36 object-contain rounded-xl" />
            <button
              type="button"
              onClick={handleRemoveBaseImage}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Overlay Images Upload */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Ảnh overlay ghép vào (1-5 ảnh)' : 'Overlay Images (1-5 images)'} <span className="text-rose-500">*</span>
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
          {overlayPreviews.map((preview, index) => (
            <div key={index} className="relative rounded-xl overflow-hidden border border-emerald-500/30 aspect-square bg-black/40">
              <img src={preview} alt={`Overlay ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveOverlayImage(index)}
                className="absolute top-1 right-1 p-1 bg-black/70 text-rose-400 rounded-full hover:bg-rose-600 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {overlayImages.length < 5 && (
          <label
            className={`flex items-center justify-center w-full py-3.5 border-2 border-dashed rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${
              isDark ? 'bg-[#090B12] border-slate-800 hover:border-emerald-500' : 'bg-white border-slate-300 hover:border-emerald-500 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {language === 'vi' ? 'Thêm ảnh overlay' : 'Add overlay images'} ({overlayImages.length}/5)
              </span>
            </div>
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/jpg" multiple onChange={handleOverlayImagesChange} />
          </label>
        )}
      </div>

      {/* Prompt */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Mô tả cách kết hợp & bố cục' : 'Composition Description'} <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            language === 'vi'
              ? 'Ví dụ: Đặt người mẫu mặc váy vào góc phải của bức ảnh nền khu vườn, ánh sáng tự nhiên hòa trộn đồng nhất...'
              : 'Example: Place model wearing dress on the right side of base garden image with natural lighting match...'
          }
          className={`w-full p-3 rounded-2xl border text-xs outline-none resize-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 shadow-xs'
          }`}
          rows={3}
          required
          maxLength={300}
        />
        <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {prompt.length}/300 {language === 'vi' ? 'ký tự' : 'characters'}
        </div>
      </div>

      {/* Composition Style */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Phong cách composition' : 'Composition Style'}
        </label>
        <div className="relative">
          <select
            value={compositionStyle}
            onChange={(e) => setCompositionStyle(e.target.value as any)}
            className={`w-full p-3 pr-10 rounded-2xl border text-xs font-semibold appearance-none outline-none transition-all cursor-pointer ${
              isDark
                ? 'bg-[#090B12] border-slate-800 text-white focus:border-emerald-400'
                : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-xs'
            }`}
          >
            <option value="realistic" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Chân thực (Realistic)' : 'Realistic'}
            </option>
            <option value="artistic" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Nghệ thuật (Artistic)' : 'Artistic'}
            </option>
            <option value="professional" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Chuyên nghiệp (Professional)' : 'Professional'}
            </option>
            <option value="collage" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Collage nghệ thuật' : 'Collage'}
            </option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Lighting Adjustment Toggle */}
      <div className="flex items-center gap-2.5 py-1">
        <input
          type="checkbox"
          id="lighting-adjustment"
          checked={lightingAdjustment}
          onChange={(e) => setLightingAdjustment(e.target.checked)}
          className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
        />
        <label htmlFor="lighting-adjustment" className={`text-xs font-bold cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {language === 'vi'
            ? 'Tự động hòa trộn ánh sáng và bóng đổ đồng nhất'
            : 'Automatic lighting and shadow adjustment'}
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

      {/* Negative Prompt */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Negative Prompt' : 'Negative Prompt'}
          <span className={`ml-1.5 text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ({language === 'vi' ? 'Tùy chọn' : 'Optional'})
          </span>
        </label>
        <textarea
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder={language === 'vi' ? 'Ví dụ: blur, bad lighting, unrealistic shadows' : 'Example: blur, bad lighting, unrealistic shadows'}
          className={`w-full p-2.5 rounded-2xl border text-xs outline-none resize-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-xs'
          }`}
          rows={2}
          maxLength={200}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || isGenerating}
        className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] ${
          !isValid || isGenerating
            ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-emerald-500/25'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{language === 'vi' ? 'Đang kết hợp ảnh...' : 'Composing...'}</span>
          </>
        ) : (
          <>
            <Layers className="w-4 h-4" />
            <span>{language === 'vi' ? 'Ghép Ảnh Nâng Cao Ngay' : 'Compose Images'}</span>
          </>
        )}
      </button>
    </form>
  );
};
