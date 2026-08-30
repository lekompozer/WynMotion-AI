import React from 'react';
import { StyleTransferRequest, AspectRatio } from '@/services/imageService';
import { Upload, X, Wand2, Loader2, Info } from 'lucide-react';

interface StyleTransferFormProps {
  isDark: boolean;
  language: 'vi' | 'en';
  onSubmit: (data: StyleTransferRequest, file: File) => void;
  isGenerating: boolean;
}

export const StyleTransferForm: React.FC<StyleTransferFormProps> = ({
  isDark,
  language,
  onSubmit,
  isGenerating,
}) => {
  const [originalImage, setOriginalImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>('');
  const [targetStyle, setTargetStyle] = React.useState('');
  const [strength, setStrength] = React.useState(80);
  const [preserveStructure, setPreserveStructure] = React.useState(true);
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

    const data: StyleTransferRequest = {
      target_style: targetStyle,
      aspect_ratio: aspectRatio,
    };

    if (strength !== 80) data.strength = strength;
    if (!preserveStructure) data.preserve_structure = preserveStructure;
    if (negativePrompt) data.negative_prompt = negativePrompt;

    onSubmit(data, originalImage);
  };

  const isValid = originalImage !== null && targetStyle.length > 0;

  const stylePresets = [
    // Classic Art Styles
    {
      category: 'Classic Art',
      name: 'Van Gogh',
      descVi: 'Phong cách hậu ấn tượng với các nét vẽ xoáy ốc đặc trưng, màu sắc sống động và cảm xúc mãnh liệt.',
      descEn: 'Post-impressionist style with distinctive swirling brushstrokes, vivid colors and intense emotions.',
    },
    {
      category: 'Classic Art',
      name: 'Picasso',
      descVi: 'Phong cách lập thể với hình khối phân mảnh, góc nhìn đa chiều và sự trừu tượng hóa hình thể.',
      descEn: 'Cubist style with fragmented forms, multiple perspectives and abstract representation.',
    },
    {
      category: 'Classic Art',
      name: 'Monet',
      descVi: 'Phong cách ấn tượng với ánh sáng tự nhiên, nét vẽ mềm mại và màu sắc hòa quyện.',
      descEn: 'Impressionist style with natural light, soft brushstrokes and blended colors.',
    },
    {
      category: 'Classic Art',
      name: 'Pop Art',
      descVi: 'Màu sắc rực rỡ, tương phản cao, phong cách đại chúng với đường viền in ấn đậm nét.',
      descEn: 'Vibrant colors, high contrast, mass culture style with bold printed outlines.',
    },
    {
      category: 'Classic Art',
      name: 'Watercolor',
      descVi: 'Hiệu ứng màu nước trong trẻo với các vệt màu loang, đường viền mềm mại và cảm giác nhẹ nhàng.',
      descEn: 'Transparent watercolor effect with soft color bleeds, gentle outlines and airy feeling.',
    },
    {
      category: 'Classic Art',
      name: 'Oil Painting',
      descVi: 'Nét vẽ sơn dầu dày, kết cấu phong phú, màu sắc đậm đà và chiều sâu cổ điển.',
      descEn: 'Thick oil paint strokes, rich texture, deep colors and classical depth.',
    },
    {
      category: 'Classic Art',
      name: 'Sketch',
      descVi: 'Phác thảo bằng bút chì hoặc than với đường nét tự do, tông màu đen trắng và cảm giác phác họa.',
      descEn: 'Pencil or charcoal sketch with free lines, black and white tones and draft feeling.',
    },

    // Anime Styles (10 types)
    {
      category: 'Anime',
      name: 'Anime: Shonen',
      descVi: 'Năng động, mạnh mẽ, nhiều hành động. Đường nét sắc sảo, dáng đứng và biểu cảm quyết đoán.',
      descEn: 'Dynamic, powerful, action-packed. Sharp lines, determined poses and expressions.',
    },
    {
      category: 'Anime',
      name: 'Anime: Shojo',
      descVi: 'Lãng mạn, dịu dàng, đẹp mong manh. Đôi mắt to long lanh, chi tiết tỉ mỉ, màu sắc tươi sáng.',
      descEn: 'Romantic, gentle, delicate beauty. Large sparkling eyes, intricate details, bright colors.',
    },
    {
      category: 'Anime',
      name: 'Anime: Seinen',
      descVi: 'Trưởng thành, chân thực và phức tạp. Tỷ lệ cơ thể gần người thật, đường nét tinh tế.',
      descEn: 'Mature, realistic and complex. Body proportions closer to real, refined lines.',
    },
    {
      category: 'Anime',
      name: 'Anime: Chibi',
      descVi: 'Đầu to, thân nhỏ, đáng yêu ngộ nghĩnh. Phù hợp ảnh selfie, biểu cảm dễ thương.',
      descEn: 'Big head, small body, cute and adorable. Perfect for selfies and cute expressions.',
    },
    {
      category: 'Anime',
      name: 'Anime: Manga',
      descVi: 'Phong cách manga truyền thống, đen trắng với đường tô (screening), có hiệu ứng giấy vẽ.',
      descEn: 'Traditional manga style, black and white with screening, paper drawing effect.',
    },
    {
      category: 'Anime',
      name: 'Anime: Studio Ghibli',
      descVi: 'Cảnh quan thiên nhiên tươi đẹp, màu phim nhẹ nhàng, nhân vật giản dị sống động.',
      descEn: 'Beautiful natural scenery, soft film colors, simple yet lively characters.',
    },
    {
      category: 'Anime',
      name: 'Anime: Cyberpunk',
      descVi: 'Tương lai công nghệ cao. Ánh sáng neon, chi tiết cơ khí, hiệu ứng kỹ thuật số.',
      descEn: 'Futuristic high-tech. Neon lights, mechanical details, digital effects.',
    },
    {
      category: 'Anime',
      name: 'Anime: Dark Fantasy',
      descVi: 'Huyền bí u tối, đôi khi đáng sợ. Màu tối, tương phản mạnh, yếu tố phép thuật và quái vật.',
      descEn: 'Mysterious dark, sometimes scary. Dark colors, strong contrast, magic and monster elements.',
    },
    {
      category: 'Anime',
      name: 'Anime: Watercolor',
      descVi: 'Hiệu ứng màu nước với vệt loang nhẹ, đường viền không rõ, cảm giác trong trẻo thơ mộng.',
      descEn: 'Watercolor effect with soft bleeds, blurred outlines, clear and dreamy feeling.',
    },
    {
      category: 'Anime',
      name: 'Anime: Pixel Art',
      descVi: 'Mô phỏng đồ họa game thời kỳ đầu. Ảnh tạo từ pixel lớn, phong cách retro hoài niệm.',
      descEn: 'Early video game graphics simulation. Large pixel blocks, retro nostalgic style.',
    },

    // 3D Styles
    {
      category: '3D Styles',
      name: '3D: Final Fantasy',
      descVi: '3D chi tiết cao với phong cách JRPG. Nhân vật anime hóa 3D, ánh sáng điện ảnh, kết cấu tinh xảo.',
      descEn: 'High-detail 3D with JRPG style. 3D anime characters, cinematic lighting, intricate textures.',
    },
    {
      category: '3D Styles',
      name: '3D: Marvel Comics',
      descVi: '3D phong cách siêu anh hùng Marvel. Cơ bắp cuồn cuộn, tư thế anh hùng, hiệu ứng năng lượng mạnh mẽ.',
      descEn: 'Marvel superhero 3D style. Muscular physique, heroic poses, powerful energy effects.',
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File Upload */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Ảnh gốc cần chuyển đổi' : 'Original Image'} <span className="text-rose-500">*</span>
        </label>

        {!imagePreview ? (
          <label
            className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${
              isDark
                ? 'bg-[#090B12] border-slate-800 hover:border-purple-500 hover:bg-purple-950/10'
                : 'bg-white border-slate-300 hover:border-purple-500 hover:bg-purple-50/40 shadow-xs'
            }`}
          >
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 shadow-inner">
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
          <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-black/40 p-2 flex items-center justify-center">
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

      {/* Target Style Input & Presets */}
      <div>
        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {language === 'vi' ? 'Phong cách nghệ thuật mục tiêu' : 'Target Style'} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={targetStyle}
          onChange={(e) => setTargetStyle(e.target.value)}
          placeholder={language === 'vi' ? 'Ví dụ: Van Gogh Starry Night, Anime Studio Ghibli...' : 'Example: Van Gogh Starry Night, Anime Studio Ghibli...'}
          className={`w-full p-3 rounded-2xl border text-xs outline-none transition-all ${
            isDark
              ? 'bg-[#090B12] border-slate-800 text-white placeholder:text-slate-600 focus:border-purple-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 shadow-xs'
          }`}
          required
        />

        {/* 19 Presets Pills Container */}
        <div className="mt-2.5 space-y-2">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
            {language === 'vi' ? '✨ 19 Phong Cách Mẫu Có Sẵn (Chạm để chọn)' : '✨ 19 Style Presets (Tap to select)'}
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 rounded-2xl border border-slate-700/30 bg-black/20">
            {stylePresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setTargetStyle(preset.name)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border text-left active:scale-95 ${
                  targetStyle === preset.name
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-400 shadow-sm'
                    : isDark
                    ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
          {targetStyle && (
            <p className={`text-[11px] italic p-2 rounded-xl border ${
              isDark ? 'bg-purple-950/20 border-purple-500/20 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-800'
            }`}>
              💡 {stylePresets.find((p) => p.name === targetStyle)?.[language === 'vi' ? 'descVi' : 'descEn'] || targetStyle}
            </p>
          )}
        </div>
      </div>

      {/* Strength Slider */}
      <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className={isDark ? 'text-white' : 'text-slate-900'}>
            {language === 'vi' ? 'Độ mạnh phong cách (Style Strength)' : 'Style Strength'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-400">
            {strength}%
          </span>
        </div>
        <input
          type="range"
          value={strength}
          onChange={(e) => setStrength(parseInt(e.target.value))}
          min={10}
          max={100}
          className="w-full accent-purple-500 cursor-pointer"
        />
        <div className={`flex justify-between text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>{language === 'vi' ? 'Nhẹ nhàng (10%)' : 'Subtle (10%)'}</span>
          <span>{language === 'vi' ? 'Mặc định (80%)' : 'Default (80%)'}</span>
          <span>{language === 'vi' ? 'Tối đa (100%)' : 'Maximum (100%)'}</span>
        </div>
      </div>

      {/* Preserve Structure Toggle */}
      <div className="flex items-center gap-2.5 py-1">
        <input
          type="checkbox"
          id="preserve-structure"
          checked={preserveStructure}
          onChange={(e) => setPreserveStructure(e.target.checked)}
          className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
        />
        <label htmlFor="preserve-structure" className={`text-xs font-bold cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {language === 'vi'
            ? 'Bảo toàn cấu trúc & đường nét của ảnh gốc'
            : 'Preserve original structure & lines'}
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
          placeholder={
            language === 'vi'
              ? 'Ví dụ: blur, distortion, unrealistic colors'
              : 'Example: blur, distortion, unrealistic colors'
          }
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
            : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/25'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{language === 'vi' ? 'Đang chuyển phong cách...' : 'Applying style...'}</span>
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            <span>{language === 'vi' ? 'Chuyển Đổi Phong Cách Ngay' : 'Apply Style Transfer'}</span>
          </>
        )}
      </button>
    </form>
  );
};
