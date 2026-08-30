import React from 'react';
import { InpaintingRequest, AspectRatio } from '@/services/imageService';
import { Upload, X, Scissors, Loader2, ChevronDown } from 'lucide-react';

interface InpaintingFormProps {
  isDark: boolean;
  language: 'vi' | 'en';
  onSubmit: (data: InpaintingRequest, file: File, maskFile?: File) => void;
  isGenerating: boolean;
}

export const InpaintingForm: React.FC<InpaintingFormProps> = ({
  isDark,
  language,
  onSubmit,
  isGenerating,
}) => {
  const [originalImage, setOriginalImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>('');
  const [maskImage, setMaskImage] = React.useState<File | null>(null);
  const [maskPreview, setMaskPreview] = React.useState<string>('');
  const [prompt, setPrompt] = React.useState('');
  const [action, setAction] = React.useState<'add' | 'remove' | 'replace'>('add');
  const [blendMode, setBlendMode] = React.useState<'natural' | 'seamless' | 'artistic'>('natural');
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatio>('1:1');
  const [negativePrompt, setNegativePrompt] = React.useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert(language === 'vi' ? 'File không được vượt quá 15MB' : 'File size must not exceed 15MB');
        return;
      }
      setOriginalImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMaskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert(language === 'vi' ? 'File không được vượt quá 15MB' : 'File size must not exceed 15MB');
        return;
      }
      setMaskImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMaskPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setOriginalImage(null);
    setImagePreview('');
  };

  const handleRemoveMask = () => {
    setMaskImage(null);
    setMaskPreview('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalImage) return;

    const data: InpaintingRequest = {
      prompt,
      action,
      aspect_ratio: aspectRatio,
    };

    if (blendMode !== 'natural') data.blend_mode = blendMode;
    if (negativePrompt) data.negative_prompt = negativePrompt;

    onSubmit(data, originalImage, maskImage || undefined);
  };

  const isValid = originalImage !== null && prompt.length > 0 && prompt.length <= 200;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File Uploads Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Original Image */}
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {language === 'vi' ? 'Ảnh gốc' : 'Original Image'} <span className="text-rose-500">*</span>
          </label>

          {!imagePreview ? (
            <label
              className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${
                isDark
                  ? 'bg-[#090B12] border-slate-800 hover:border-teal-500 hover:bg-teal-950/10'
                  : 'bg-white border-slate-300 hover:border-teal-500 hover:bg-teal-50/40 shadow-xs'
              }`}
            >
              <div className="flex flex-col items-center justify-center p-3 text-center">
                <Upload className="w-5 h-5 text-teal-400 mb-1" />
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {language === 'vi' ? 'Tải ảnh gốc' : 'Upload Image'}
                </p>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>PNG, JPG (Tối đa 15MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-teal-500/30 bg-black/40 p-2 flex items-center justify-center">
              <img src={imagePreview} alt="Preview" className="max-h-36 object-contain rounded-xl" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mask Image */}
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {language === 'vi' ? 'Ảnh Mask (Tùy chọn)' : 'Mask Image (Optional)'}
            <span className={`ml-1 text-[10px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ({language === 'vi' ? 'Vùng trắng = vùng cần sửa' : 'White area = edit'})
            </span>
          </label>

          {!maskPreview ? (
            <label
              className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${
                isDark ? 'bg-[#090B12] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-300 hover:border-slate-400 shadow-xs'
              }`}
            >
              <div className="flex flex-col items-center justify-center p-3 text-center">
                <Upload className="w-5 h-5 text-slate-500 mb-1" />
                <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {language === 'vi' ? 'Tải mask PNG' : 'Upload Mask'}
                </p>
                <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>PNG (Tối đa 15MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/png" onChange={handleMaskFileChange} />
            </label>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black/40 p-2 flex items-center justify-center">
              <img src={maskPreview} alt="Mask" className="max-h-36 object-contain rounded-xl" />
              <button
                type="button"
                onClick={handleRemoveMask}
                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Loại thao tác (Action)' : 'Action'} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as any)}
            className={`w-full p-3 pr-10 rounded-2xl border text-xs font-semibold appearance-none outline-none transition-all cursor-pointer ${
              isDark
                ? 'bg-[#090B12] border-slate-800 text-white focus:border-teal-400'
                : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500 shadow-xs'
            }`}
            required
          >
            <option value="add" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Thêm đối tượng (Add)' : 'Add'}
            </option>
            <option value="remove" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Xóa bỏ đối tượng (Remove)' : 'Remove'}
            </option>
            <option value="replace" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Thay thế đối tượng (Replace)' : 'Replace'}
            </option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Prompt */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {action === 'remove'
            ? language === 'vi'
              ? 'Mô tả những gì cần xóa'
              : 'What to remove'
            : language === 'vi'
            ? 'Mô tả những gì cần thêm / thay thế'
            : 'What to add / replace'}{' '}
          <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            language === 'vi'
              ? action === 'remove'
                ? 'Ví dụ: chiếc ghế, chiếc cốc cà phê thừa'
                : 'Ví dụ: một chiếc đồng hồ thông minh kim loại sáng bóng trên cổ tay'
              : action === 'remove'
              ? 'Example: the chair, unwanted water bottle'
              : 'Example: a shiny metal smartwatch on the wrist'
          }
          className={`w-full p-3 rounded-2xl border text-xs outline-none resize-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-teal-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 shadow-xs'
          }`}
          rows={3}
          required
          maxLength={200}
        />
        <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {prompt.length}/200 {language === 'vi' ? 'ký tự' : 'characters'}
        </div>
      </div>

      {/* Blend Mode */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Cách pha trộn (Blend Mode)' : 'Blend Mode'}
        </label>
        <div className="relative">
          <select
            value={blendMode}
            onChange={(e) => setBlendMode(e.target.value as any)}
            className={`w-full p-3 pr-10 rounded-2xl border text-xs font-semibold appearance-none outline-none transition-all cursor-pointer ${
              isDark
                ? 'bg-[#090B12] border-slate-800 text-white focus:border-teal-400'
                : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500 shadow-xs'
            }`}
          >
            <option value="natural" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Tự nhiên (Natural)' : 'Natural'}
            </option>
            <option value="seamless" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Mượt mà liền mạch (Seamless)' : 'Seamless'}
            </option>
            <option value="artistic" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              {language === 'vi' ? 'Nghệ thuật (Artistic)' : 'Artistic'}
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
          {language === 'vi' ? 'Negative Prompt' : 'Negative Prompt'}
          <span className={`ml-1.5 text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ({language === 'vi' ? 'Tùy chọn' : 'Optional'})
          </span>
        </label>
        <textarea
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder={language === 'vi' ? 'Ví dụ: blur, unrealistic, bad quality' : 'Example: blur, unrealistic, bad quality'}
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
            : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-teal-500/25'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{language === 'vi' ? 'Đang xử lý inpainting...' : 'Processing...'}</span>
          </>
        ) : (
          <>
            <Scissors className="w-4 h-4" />
            <span>{language === 'vi' ? 'Áp Dụng Inpainting Ngay' : 'Apply Inpainting'}</span>
          </>
        )}
      </button>
    </form>
  );
};
