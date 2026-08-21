/**
 * WynMotion AI Image Service — iOS Client
 * Connects to AI Image Generation & Editing (Photorealistic, Stylized, Logo, Background, Mockup, Sequential, Edit)
 * Mirrors https://www.wynai.pro/app/wynmotion-ai?tab=images & GeminiImageModal.tsx
 */

import { wordaiAuth } from '@/lib/wordai-firebase';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://ai.wordai.pro';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const user = wordaiAuth?.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (_) {}
  return headers;
}

async function getAuthToken(): Promise<string | null> {
  try {
    const user = wordaiAuth?.currentUser;
    if (user) return await user.getIdToken();
  } catch (_) {}
  return null;
}

export type ImageEndpoint =
  | 'photorealistic'
  | 'stylized'
  | 'logo'
  | 'background'
  | 'mockup'
  | 'sequential'
  | 'style-transfer'
  | 'object-edit'
  | 'inpainting'
  | 'composition';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface ImagePromptPreset {
  id: string;
  labelVi: string;
  labelEn: string;
  prompt: string;
  category: ImageEndpoint;
}

export const IMAGE_PROMPT_PRESETS: ImagePromptPreset[] = [
  {
    id: '1',
    labelVi: '🦊 Mascot Cáo 3D Pixar',
    labelEn: '🦊 3D Pixar Fox Mascot',
    prompt: 'Cute fluffy white fox mascot wearing cyan hoodie with letter M, 3D Pixar character style, soft studio rim lighting, vibrant 8k render',
    category: 'stylized',
  },
  {
    id: '2',
    labelVi: '📸 Chân Dung Nhiếp Ảnh 8K',
    labelEn: '📸 8K Portrait Photo',
    prompt: 'Hyperrealistic cinematic portrait of a young Vietnamese woman, natural golden hour sunlight, 85mm lens, f/1.4 soft bokeh, ultra-detailed skin texture',
    category: 'photorealistic',
  },
  {
    id: '3',
    labelVi: '✨ Logo Vector Gradient',
    labelEn: '✨ Gradient Vector Logo',
    prompt: 'Minimalist modern vector logo of motion waves forming an AI brain, bold geometric shapes, smooth cyan and violet gradient, clean isolated white background',
    category: 'logo',
  },
  {
    id: '4',
    labelVi: '🌌 Wallpaper Vũ Trụ 4K',
    labelEn: '🌌 Deep Space Wallpaper',
    prompt: 'Breathtaking deep space nebula wallpaper, luminous cosmic dust clouds in magenta and deep navy, floating starlight, ultra-wide 4k OLED wallpaper',
    category: 'background',
  },
  {
    id: '5',
    labelVi: '📱 Mockup iPhone 16 Pro',
    labelEn: '📱 iPhone 16 Pro Mockup',
    prompt: 'Sleek premium iPhone 16 Pro mockup floating at an angle with glowing glass display, aesthetic minimalist pastel gradient studio backdrop, 3D render',
    category: 'mockup',
  },
  {
    id: '6',
    labelVi: '🎨 Tranh Màu Nước Anime',
    labelEn: '🎨 Watercolor Anime',
    prompt: 'Serene Japanese street in spring with blooming cherry blossoms, soft watercolor painting style, delicate ink outlines, Studio Ghibli aesthetic',
    category: 'stylized',
  },
];

export const INSPIRATION_CATEGORIES = [
  { id: 'ai-art', labelVi: '✨ AI Art', labelEn: '✨ AI Art', query: 'AI art digital illustration vibrant' },
  { id: 'portrait', labelVi: '👤 Chân Dung', labelEn: '👤 Portrait', query: 'cinematic portrait photography 8k' },
  { id: 'anime', labelVi: '🎨 Anime / 3D', labelEn: '🎨 Anime / 3D', query: 'anime 3D pixar render character' },
  { id: 'nature', labelVi: '🌿 Thiên Nhiên', labelEn: '🌿 Nature', query: 'breathtaking nature landscape sunrise' },
  { id: 'city', labelVi: '🌆 Thành Phố', labelEn: '🌆 Cityscape', query: 'futuristic cyberpunk city neon night' },
  { id: 'fantasy', labelVi: '🐉 Fantasy', labelEn: '🐉 Fantasy', query: 'magical fantasy epic castle dragon' },
  { id: 'background', labelVi: '🌌 Wallpaper', labelEn: '🌌 Wallpaper', query: 'minimalist modern abstract wallpaper 4k' },
];

export interface GenerateImageResult {
  image_url: string;
  file_id?: string;
  prompt_used: string;
  aspect_ratio: string;
}

export const imageService = {
  /**
   * 1. Photorealistic Generation
   */
  async generatePhotorealistic(params: {
    prompt: string;
    lighting?: string;
    camera_angle?: string;
    aspect_ratio: AspectRatio;
    negative_prompt?: string;
  }): Promise<GenerateImageResult> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('prompt', params.prompt);
    formData.append('aspect_ratio', params.aspect_ratio);
    if (params.lighting) formData.append('lighting', params.lighting);
    if (params.camera_angle) formData.append('camera_angle', params.camera_angle);
    if (params.negative_prompt) formData.append('negative_prompt', params.negative_prompt);

    const res = await fetch(`${API_BASE_URL}/api/v1/images/generate/photorealistic`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo ảnh Photorealistic');
    return {
      image_url: data.file_url || data.image_url || data.url,
      file_id: data.file_id || data.id,
      prompt_used: data.prompt_used || params.prompt,
      aspect_ratio: data.aspect_ratio || params.aspect_ratio,
    };
  },

  /**
   * 2. Stylized (3D / Anime / Sticker) Generation
   */
  async generateStylized(params: {
    prompt: string;
    style_preset: 'Anime' | '3D Render' | 'Watercolor' | 'Oil Painting' | 'Flat Design' | 'Sticker Art';
    sticker_mode?: boolean;
    aspect_ratio: AspectRatio;
    negative_prompt?: string;
  }): Promise<GenerateImageResult> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('prompt', params.prompt);
    formData.append('style_preset', params.style_preset);
    formData.append('aspect_ratio', params.aspect_ratio);
    if (params.sticker_mode !== undefined) formData.append('sticker_mode', params.sticker_mode.toString());
    if (params.negative_prompt) formData.append('negative_prompt', params.negative_prompt);

    const res = await fetch(`${API_BASE_URL}/api/v1/images/generate/stylized`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo ảnh Stylized');
    return {
      image_url: data.file_url || data.image_url || data.url,
      file_id: data.file_id || data.id,
      prompt_used: data.prompt_used || params.prompt,
      aspect_ratio: data.aspect_ratio || params.aspect_ratio,
    };
  },

  /**
   * 3. Logo Generation
   */
  async generateLogo(params: {
    brand_name: string;
    tagline?: string;
    industry: string;
    style: 'Modern' | 'Minimalist' | 'Vintage' | 'Luxury';
    aspect_ratio: AspectRatio;
  }): Promise<GenerateImageResult> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('brand_name', params.brand_name);
    if (params.tagline) formData.append('tagline', params.tagline);
    formData.append('industry', params.industry || 'Technology');
    formData.append('style', params.style);
    formData.append('aspect_ratio', params.aspect_ratio);

    const res = await fetch(`${API_BASE_URL}/api/v1/images/generate/logo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo Logo');
    return {
      image_url: data.file_url || data.image_url || data.url,
      file_id: data.file_id || data.id,
      prompt_used: data.prompt_used || params.brand_name,
      aspect_ratio: data.aspect_ratio || params.aspect_ratio,
    };
  },

  /**
   * 4. Background / Wallpaper Generation
   */
  async generateBackground(params: {
    theme: string;
    color_mood?: 'Vibrant' | 'Pastel' | 'Dark' | 'Light';
    minimalist_mode?: boolean;
    aspect_ratio: AspectRatio;
  }): Promise<GenerateImageResult> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('theme', params.theme);
    if (params.color_mood) formData.append('color_mood', params.color_mood);
    if (params.minimalist_mode !== undefined) formData.append('minimalist_mode', params.minimalist_mode.toString());
    formData.append('aspect_ratio', params.aspect_ratio);

    const res = await fetch(`${API_BASE_URL}/api/v1/images/generate/background`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo Background');
    return {
      image_url: data.file_url || data.image_url || data.url,
      file_id: data.file_id || data.id,
      prompt_used: data.prompt_used || params.theme,
      aspect_ratio: data.aspect_ratio || params.aspect_ratio,
    };
  },

  /**
   * 5. Product Mockup Generation
   */
  async generateMockup(params: {
    scene_description: string;
    placement_type: 'Tabletop' | 'Model Wearing' | 'Outdoor' | 'Studio Backdrop';
    aspect_ratio: AspectRatio;
  }): Promise<GenerateImageResult> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('scene_description', params.scene_description);
    formData.append('placement_type', params.placement_type);
    formData.append('aspect_ratio', params.aspect_ratio);

    const res = await fetch(`${API_BASE_URL}/api/v1/images/generate/mockup`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo Mockup');
    return {
      image_url: data.file_url || data.image_url || data.url,
      file_id: data.file_id || data.id,
      prompt_used: data.prompt_used || params.scene_description,
      aspect_ratio: data.aspect_ratio || params.aspect_ratio,
    };
  },

  /**
   * Generic Universal Generation (Fallback)
   */
  async generateImage(params: {
    prompt: string;
    category: ImageEndpoint;
    aspect_ratio: AspectRatio;
    negative_prompt?: string;
  }): Promise<GenerateImageResult> {
    if (params.category === 'photorealistic') {
      return this.generatePhotorealistic({
        prompt: params.prompt,
        aspect_ratio: params.aspect_ratio,
        negative_prompt: params.negative_prompt,
      });
    }
    if (params.category === 'stylized') {
      return this.generateStylized({
        prompt: params.prompt,
        style_preset: '3D Render',
        aspect_ratio: params.aspect_ratio,
        negative_prompt: params.negative_prompt,
      });
    }
    if (params.category === 'logo') {
      return this.generateLogo({
        brand_name: params.prompt,
        industry: 'Technology',
        style: 'Modern',
        aspect_ratio: params.aspect_ratio,
      });
    }
    if (params.category === 'background') {
      return this.generateBackground({
        theme: params.prompt,
        aspect_ratio: params.aspect_ratio,
      });
    }
    if (params.category === 'mockup') {
      return this.generateMockup({
        scene_description: params.prompt,
        placement_type: 'Studio Backdrop',
        aspect_ratio: params.aspect_ratio,
      });
    }

    // Default fallback
    return this.generateStylized({
      prompt: params.prompt,
      style_preset: '3D Render',
      aspect_ratio: params.aspect_ratio,
      negative_prompt: params.negative_prompt,
    });
  },

  /**
   * AI Image Editing (Style Transfer, Object Edit, Inpainting)
   */
  async editImage(params: {
    image_url?: string;
    image_file?: File;
    prompt: string;
    edit_mode: 'style-transfer' | 'object-edit' | 'inpainting';
    aspect_ratio?: AspectRatio;
  }): Promise<{ image_url: string; file_id?: string }> {
    const token = await getAuthToken();
    const formData = new FormData();
    if (params.image_file) {
      formData.append('image', params.image_file);
    } else if (params.image_url) {
      formData.append('image_url', params.image_url);
    }
    formData.append('prompt', params.prompt);
    if (params.aspect_ratio) formData.append('aspect_ratio', params.aspect_ratio);

    const res = await fetch(`${API_BASE_URL}/api/v1/images/edit/${params.edit_mode}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi chỉnh sửa ảnh');
    return {
      image_url: data.file_url || data.image_url || data.url,
      file_id: data.file_id || data.id,
    };
  },
};
