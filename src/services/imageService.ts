/**
 * WynMotion AI Image Service — iOS Client
 * Connects to AI Image Generation (Photorealistic, Stylized, Logo, Background, Mockup, Edit)
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

export type ImageCategory =
  | 'photorealistic'
  | 'stylized'
  | 'logo'
  | 'background'
  | 'mockup';

export interface ImagePromptPreset {
  id: string;
  label: string;
  prompt: string;
  category: ImageCategory;
}

export const IMAGE_PROMPT_PRESETS: ImagePromptPreset[] = [
  {
    id: '1',
    label: '🦊 Mascot Cáo WynMotion 3D',
    prompt: 'Cute fluffy white fox mascot wearing pink hoodie with letter M, 3D Pixar character style, studio soft lighting, 8k resolution, vibrant colors',
    category: 'stylized',
  },
  {
    id: '2',
    label: '🌆 Thành Phố Cyberpunk 8K',
    prompt: 'Futuristic cyberpunk neon city at night, rainy reflections on street, flying cars, volumetric cinematic lighting, ultra-detailed 8k',
    category: 'photorealistic',
  },
  {
    id: '3',
    label: '🌿 Tranh Màu Nước Tự Nhiên',
    prompt: 'Gentle pastel watercolor illustration of green forest and serene lake, soft ink lines, aesthetic Notion art style',
    category: 'stylized',
  },
  {
    id: '4',
    label: '✨ Logo Vector Hiện Đại',
    prompt: 'Minimalist modern vector logo of motion wave and brain, flat geometric gradient coral pink, clean white background, Behance trending',
    category: 'logo',
  },
  {
    id: '5',
    label: '📱 Mockup iPhone 16 Pro',
    prompt: 'Premium sleek iPhone 16 Pro mockup floating with glowing glass screen, elegant pastel aesthetic gradient studio backdrop, 3D render',
    category: 'mockup',
  },
  {
    id: '6',
    label: '🌌 Wallpaper Không Gian 3D',
    prompt: 'Abstract deep space nebula wallpaper, luminous cosmic dust, vibrant magenta and deep indigo glow, 4k wallpaper',
    category: 'background',
  },
];

export const imageService = {
  /**
   * Generate AI Image based on category and aspect ratio
   */
  async generateImage(params: {
    prompt: string;
    category: ImageCategory;
    aspect_ratio: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
    negative_prompt?: string;
  }): Promise<{
    image_url: string;
    file_id?: string;
    prompt_used: string;
  }> {
    const headers = await getAuthHeaders();
    const endpoint = `${API_BASE_URL}/api/ai/image/generate/${params.category}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: params.prompt,
        aspect_ratio: params.aspect_ratio,
        negative_prompt: params.negative_prompt || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo hình ảnh AI');

    return {
      image_url: data.file_url || data.image_url || data.url,
      file_id: data.file_id || data.id,
      prompt_used: data.prompt_used || params.prompt,
    };
  },

  /**
   * AI Image Editing (Style transfer, Inpainting, Object edit)
   */
  async editImage(params: {
    image_url: string;
    prompt: string;
    edit_mode: 'style-transfer' | 'object-edit' | 'inpainting';
  }): Promise<{
    image_url: string;
    file_id?: string;
  }> {
    const headers = await getAuthHeaders();
    const endpoint = `${API_BASE_URL}/api/ai/image/edit/${params.edit_mode}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        image_url: params.image_url,
        prompt: params.prompt,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi chỉnh sửa hình ảnh');

    return {
      image_url: data.file_url || data.image_url || data.url,
      file_id: data.file_id,
    };
  },
};
