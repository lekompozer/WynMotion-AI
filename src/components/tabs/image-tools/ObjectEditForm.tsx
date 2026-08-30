import React from 'react';
import { ObjectEditRequest, AspectRatio } from '@/services/imageService';
import { Upload, X, Edit3, Loader2 } from 'lucide-react';

interface ObjectEditFormProps {
  isDark: boolean;
  language: 'vi' | 'en';
  onSubmit: (data: ObjectEditRequest, file: File) => void;
  isGenerating: boolean;
}

export const ObjectEditForm: React.FC<ObjectEditFormProps> = ({
  isDark,
  language,
  onSubmit,
  isGenerating,
}) => {
  const [originalImage, setOriginalImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>('');
  const [targetObject, setTargetObject] = React.useState('');
  const [modification, setModification] = React.useState('');
  const [preserveBackground, setPreserveBackground] = React.useState(true);
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

  const handleRemoveImage = () => {
    setOriginalImage(null);
    setImagePreview('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalImage) return;

    const data: ObjectEditRequest = {
      target_object: targetObject,
      modification,
      aspect_ratio: aspectRatio,
    };

    if (!preserveBackground) data.preserve_background = preserveBackground;
    if (negativePrompt) data.negative_prompt = negativePrompt;

    onSubmit(data, originalImage);
  };

  const isValid =
    originalImage !== null &&
    targetObject.length > 0 &&
    targetObject.length <= 100 &&
    modification.length > 0 &&
    modification.length <= 200;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File Upload */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Ảnh gốc' : 'Original Image'} <span className="text-rose-500">*</span>
        </label>

        {!imagePreview ? (
          <label
            className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${
              isDark
                ? 'bg-[#090B12] border-slate-800 hover:border-violet-500 hover:bg-violet-950/10'
                : 'bg-white border-slate-300 hover:border-violet-500 hover:bg-violet-50/40 shadow-xs'
            }`}
          >
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-2 shadow-inner">
                <Upload className="w-5 h-5" />
              </div>
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {language === 'vi' ? 'Nhấp hoặc chạm để tải ảnh lên' : 'Tap to upload original image'}
              </p>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                PNG, JPG, JPEG (Tối đa 15MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-violet-500/30 bg-black/40 p-2 flex items-center justify-center">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-48 object-contain rounded-xl shadow-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors backdrop-blur-sm"
              title={language === 'vi' ? 'Xóa ảnh' : 'Remove image'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Target Object */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Đối tượng cần chỉnh sửa' : 'Target Object'} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={targetObject}
          onChange={(e) => setTargetObject(e.target.value)}
          placeholder={language === 'vi' ? 'Ví dụ: chiếc ghế sofa màu xanh, chiếc xe màu trắng' : 'Example: the blue sofa, the white car'}
          className={`w-full p-3 rounded-2xl border text-xs outline-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-violet-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 shadow-xs'
          }`}
          required
          maxLength={100}
        />
        <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {targetObject.length}/100 {language === 'vi' ? 'ký tự' : 'characters'}
        </div>
      </div>

      {/* Modification */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Cách thay đổi / Mô tả chỉnh sửa' : 'Modification Description'} <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={modification}
          onChange={(e) => setModification(e.target.value)}
          placeholder={
            language === 'vi'
              ? 'Ví dụ: đổi thành ghế sofa da nâu cổ điển kiểu chesterfield sang trọng'
              : 'Example: change it to a vintage brown leather chesterfield sofa'
          }
          className={`w-full p-3 rounded-2xl border text-xs outline-none resize-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-violet-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 shadow-xs'
          }`}
          rows={3}
          required
          maxLength={200}
        />
        <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {modification.length}/200 {language === 'vi' ? 'ký tự' : 'characters'}
        </div>
      </div>

      {/* Preserve Background Toggle */}
      <div className="flex items-center gap-2.5 py-1">
        <input
          type="checkbox"
          id="preserve-background"
          checked={preserveBackground}
          onChange={(e) => setPreserveBackground(e.target.checked)}
          className="w-4 h-4 rounded border-slate-700 text-violet-600 focus:ring-0 cursor-pointer"
        />
        <label htmlFor="preserve-background" className={`text-xs font-bold cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {language === 'vi'
            ? 'Giữ nguyên tuyệt đối phần nền còn lại của ảnh'
            : 'Preserve the rest of the image unchanged'}
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
          placeholder={language === 'vi' ? 'Ví dụ: blur, unrealistic, bad lighting' : 'Example: blur, unrealistic, bad lighting'}
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
            : 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-violet-500/25'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{language === 'vi' ? 'Đang chỉnh sửa đối tượng...' : 'Editing...'}</span>
          </>
        ) : (
          <>
            <Edit3 className="w-4 h-4" />
            <span>{language === 'vi' ? 'Chỉnh Sửa Đối Tượng Ngay' : 'Edit Object'}</span>
          </>
        )}
      </button>
    </form>
  );
};
