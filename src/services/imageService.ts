/**
 * WynMotion AI Image Service — iOS Client
 * Connects to AI Image Generation & Editing (10 Tools + Studio + RemoveBG)
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

export interface PhotorealisticRequest {
  prompt: string;
  lighting?: 'Natural' | 'Studio' | 'Cinematic' | 'Golden Hour' | '';
  camera_angle?: 'Wide Angle' | 'Macro' | 'Drone View' | 'Eye Level' | '';
  aspect_ratio: AspectRatio;
  negative_prompt?: string;
}

export interface StylizedRequest {
  prompt: string;
  style_preset: 'Anime' | 'Watercolor' | 'Oil Painting' | 'Flat Design' | '3D Render' | 'Sticker Art';
  sticker_mode?: boolean;
  aspect_ratio: AspectRatio;
}

export interface LogoRequest {
  brand_name: string;
  tagline?: string;
  industry: string;
  style: 'Modern' | 'Minimalist' | 'Vintage' | 'Luxury';
  color_palette?: string;
  visual_elements?: string;
  aspect_ratio: AspectRatio;
}

export interface BackgroundRequest {
  theme: string;
  minimalist_mode?: boolean;
  negative_space_position?: 'Center' | 'Left' | 'Right' | 'Top';
  color_mood?: 'Dark' | 'Light' | 'Pastel' | 'Vibrant';
  aspect_ratio: AspectRatio;
}

export interface MockupRequest {
  scene_description: string;
  placement_type: 'Tabletop' | 'Model Wearing' | 'Outdoor' | 'Studio Backdrop';
  aspect_ratio: AspectRatio;
}

export interface SequentialRequest {
  story_script: string;
  panel_count: number;
  style: 'Comic Book' | 'Manga' | 'Storyboard Sketch';
  aspect_ratio: AspectRatio;
}

export interface StyleTransferRequest {
  target_style: string;
  strength?: number;
  preserve_structure?: boolean;
  aspect_ratio: AspectRatio;
  negative_prompt?: string;
}

export interface ObjectEditRequest {
  target_object: string;
  modification: string;
  preserve_background?: boolean;
  aspect_ratio: AspectRatio;
  negative_prompt?: string;
}

export interface InpaintingRequest {
  prompt: string;
  action: 'add' | 'remove' | 'replace';
  blend_mode?: 'natural' | 'seamless' | 'artistic';
  aspect_ratio: AspectRatio;
  negative_prompt?: string;
}

export interface CompositionRequest {
  prompt: string;
  composition_style?: 'realistic' | 'artistic' | 'professional' | 'collage';
  lighting_adjustment?: boolean;
  aspect_ratio: AspectRatio;
  negative_prompt?: string;
}

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/images/generate/photorealistic`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo ảnh Photorealistic');
      return {
        image_url: data.file_url || data.image_url || data.url,
        file_id: data.file_id || data.id,
        prompt_used: data.prompt_used || params.prompt,
        aspect_ratio: data.aspect_ratio || params.aspect_ratio,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Quá thời gian tạo ảnh (240s)');
      throw err;
    }
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/images/generate/stylized`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo ảnh Stylized');
      return {
        image_url: data.file_url || data.image_url || data.url,
        file_id: data.file_id || data.id,
        prompt_used: data.prompt_used || params.prompt,
        aspect_ratio: data.aspect_ratio || params.aspect_ratio,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Quá thời gian tạo ảnh (240s)');
      throw err;
    }
  },

  /**
   * 3. Logo Generation
   */
  async generateLogo(params: {
    brand_name: string;
    tagline?: string;
    industry: string;
    style: 'Modern' | 'Minimalist' | 'Vintage' | 'Luxury';
    color_palette?: string;
    visual_elements?: string;
    aspect_ratio: AspectRatio;
  }): Promise<GenerateImageResult> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('brand_name', params.brand_name);
    if (params.tagline) formData.append('tagline', params.tagline);
    formData.append('industry', params.industry || 'Technology');
    formData.append('style', params.style);
    if (params.color_palette) formData.append('color_palette', params.color_palette);
    if (params.visual_elements) formData.append('visual_elements', params.visual_elements);
    formData.append('aspect_ratio', params.aspect_ratio);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/images/generate/logo`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo Logo');
      return {
        image_url: data.file_url || data.image_url || data.url,
        file_id: data.file_id || data.id,
        prompt_used: data.prompt_used || params.brand_name,
        aspect_ratio: data.aspect_ratio || params.aspect_ratio,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Quá thời gian tạo ảnh (240s)');
      throw err;
    }
  },

  /**
   * 4. Background / Wallpaper Generation
   */
  async generateBackground(params: {
    theme: string;
    color_mood?: 'Vibrant' | 'Pastel' | 'Dark' | 'Light';
    minimalist_mode?: boolean;
    negative_space_position?: 'Center' | 'Left' | 'Right' | 'Top';
    aspect_ratio: AspectRatio;
  }): Promise<GenerateImageResult> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('theme', params.theme);
    if (params.color_mood) formData.append('color_mood', params.color_mood);
    if (params.minimalist_mode !== undefined) formData.append('minimalist_mode', params.minimalist_mode.toString());
    if (params.negative_space_position) formData.append('negative_space_position', params.negative_space_position);
    formData.append('aspect_ratio', params.aspect_ratio);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/images/generate/background`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo Background');
      return {
        image_url: data.file_url || data.image_url || data.url,
        file_id: data.file_id || data.id,
        prompt_used: data.prompt_used || params.theme,
        aspect_ratio: data.aspect_ratio || params.aspect_ratio,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Quá thời gian tạo ảnh (240s)');
      throw err;
    }
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/images/generate/mockup`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo Mockup');
      return {
        image_url: data.file_url || data.image_url || data.url,
        file_id: data.file_id || data.id,
        prompt_used: data.prompt_used || params.scene_description,
        aspect_ratio: data.aspect_ratio || params.aspect_ratio,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Quá thời gian tạo ảnh (240s)');
      throw err;
    }
  },

  /**
   * 6. Sequential Art Generation
   */
  async generateSequential(params: {
    story_script: string;
    panel_count: number;
    style: 'Comic Book' | 'Manga' | 'Storyboard Sketch';
    aspect_ratio: AspectRatio;
  }): Promise<GenerateImageResult> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('story_script', params.story_script);
    formData.append('panel_count', params.panel_count.toString());
    formData.append('style', params.style);
    formData.append('aspect_ratio', params.aspect_ratio);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/images/generate/sequential`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo Sequential Art');
      return {
        image_url: data.file_url || data.image_url || data.url,
        file_id: data.file_id || data.id,
        prompt_used: data.prompt_used || params.story_script,
        aspect_ratio: data.aspect_ratio || params.aspect_ratio,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Quá thời gian tạo ảnh (240s)');
      throw err;
    }
  },

  /**
   * 7. Style Transfer Editing
   */
  async editStyleTransfer(params: {
    image_file: File;
    target_style: string;
    strength?: number;
    preserve_structure?: boolean;
    aspect_ratio?: AspectRatio;
    negative_prompt?: string;
  }): Promise<GenerateImageResult> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('image', params.image_file);
    formData.append('target_style', params.target_style);
    if (params.strength !== undefined) formData.append('strength', params.strength.toString());
    if (params.preserve_structure !== undefined) formData.append('preserve_structure', params.preserve_structure.toString());
    if (params.aspect_ratio) formData.append('aspect_ratio', params.aspect_ratio);
    if (params.negative_prompt) formData.append('negative_prompt', params.negative_prompt);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/images/edit/style-transfer`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi chuyển phong cách ảnh');
      return {
        image_url: data.file_url || data.image_url || data.url,
        file_id: data.file_id || data.id,
        prompt_used: data.prompt_used || params.target_style,
        aspect_ratio: data.aspect_ratio || params.aspect_ratio || '1:1',
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Quá thời gian tạo ảnh (240s)');
      throw err;
    }
  },

  /**
   * 8. Object Edit
   */
  async editObjectEdit(params: {
    image_file: File;
    target_object: string;
    modification: string;
    preserve_background?: boolean;
    aspect_ratio?: AspectRatio;
    negative_prompt?: string;
  }): Promise<GenerateImageResult> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('image', params.image_file);
    formData.append('target_object', params.target_object);
    formData.append('modification', params.modification);
    if (params.preserve_background !== undefined) formData.append('preserve_background', params.preserve_background.toString());
    if (params.aspect_ratio) formData.append('aspect_ratio', params.aspect_ratio);
    if (params.negative_prompt) formData.append('negative_prompt', params.negative_prompt);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/images/edit/object-edit`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi chỉnh sửa đối tượng ảnh');
      return {
        image_url: data.file_url || data.image_url || data.url,
        file_id: data.file_id || data.id,
        prompt_used: data.prompt_used || `${params.target_object} -> ${params.modification}`,
        aspect_ratio: data.aspect_ratio || params.aspect_ratio || '1:1',
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Quá thời gian tạo ảnh (240s)');
      throw err;
    }
  },

  /**
   * 9. Inpainting
   */
  async editInpainting(params: {
    image_file: File;
    mask_file?: File;
    prompt: string;
    action?: 'add' | 'remove' | 'replace';
    blend_mode?: 'natural' | 'seamless' | 'artistic';
    aspect_ratio?: AspectRatio;
    negative_prompt?: string;
  }): Promise<GenerateImageResult> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('image', params.image_file);
    if (params.mask_file) formData.append('mask', params.mask_file);
    formData.append('prompt', params.prompt);
    if (params.action) formData.append('action', params.action);
    if (params.blend_mode) formData.append('blend_mode', params.blend_mode);
    if (params.aspect_ratio) formData.append('aspect_ratio', params.aspect_ratio);
    if (params.negative_prompt) formData.append('negative_prompt', params.negative_prompt);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/images/edit/inpainting`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi inpainting ảnh');
      return {
        image_url: data.file_url || data.image_url || data.url,
        file_id: data.file_id || data.id,
        prompt_used: data.prompt_used || params.prompt,
        aspect_ratio: data.aspect_ratio || params.aspect_ratio || '1:1',
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Quá thời gian tạo ảnh (240s)');
      throw err;
    }
  },

  /**
   * 10. Composition
   */
  async editComposition(params: {
    base_image: File;
    overlay_images: File[];
    prompt: string;
    composition_style?: 'realistic' | 'artistic' | 'professional' | 'collage';
    lighting_adjustment?: boolean;
    aspect_ratio?: AspectRatio;
    negative_prompt?: string;
  }): Promise<GenerateImageResult> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('base_image', params.base_image);
    params.overlay_images.forEach((img) => formData.append('overlay_images', img));
    formData.append('prompt', params.prompt);
    if (params.composition_style) formData.append('composition_style', params.composition_style);
    if (params.lighting_adjustment !== undefined) formData.append('lighting_adjustment', params.lighting_adjustment.toString());
    if (params.aspect_ratio) formData.append('aspect_ratio', params.aspect_ratio);
    if (params.negative_prompt) formData.append('negative_prompt', params.negative_prompt);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/images/edit/composition`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi ghép ảnh composition');
      return {
        image_url: data.file_url || data.image_url || data.url,
        file_id: data.file_id || data.id,
        prompt_used: data.prompt_used || params.prompt,
        aspect_ratio: data.aspect_ratio || params.aspect_ratio || '1:1',
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Quá thời gian tạo ảnh (240s)');
      throw err;
    }
  },

  /**
   * AI Remove Background (Cutout PNG)
   */
  async removeBackground(params: {
    file: File;
    prompt?: string;
    aspect_ratio?: string;
  }): Promise<{ cutout_url: string; original_url?: string; points_deducted: number }> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('image', params.file);
    if (params.prompt) formData.append('prompt', params.prompt);
    if (params.aspect_ratio) formData.append('aspect_ratio', params.aspect_ratio);

    const res = await fetch(`${API_BASE_URL}/api/v1/images/edit/remove-bg`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tách nền ảnh');
    return {
      cutout_url: data.cutout_url,
      original_url: data.original_url,
      points_deducted: data.points_deducted || 3,
    };
  },

  /**
   * Session Management & Generation (Studio Parity)
   */
  async createSession(title: string = 'New Session') {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('title', title);
    const res = await fetch(`${API_BASE_URL}/api/v1/images/sessions`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo session');
    return data;
  },

  async listSessions() {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/images/sessions`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi lấy danh sách session');
    return data;
  },

  async getSession(sessionId: string) {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/images/sessions/${sessionId}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi lấy session');
    return data;
  },

  async uploadSessionReferences(sessionId: string, files: File[], role: 'character' | 'object') {
    const token = await getAuthToken();
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('role', role);
    const res = await fetch(`${API_BASE_URL}/api/v1/images/sessions/${sessionId}/references`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi upload ảnh tham chiếu');
    return data;
  },

  async generateInSession(sessionId: string, params: {
    prompt: string;
    aspect_ratio?: string;
    negative_prompt?: string;
    extra_images?: File[];
    extra_role?: 'object' | 'character';
    plan_id?: string;
  }) {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('prompt', params.prompt);
    if (params.aspect_ratio) formData.append('aspect_ratio', params.aspect_ratio);
    if (params.negative_prompt) formData.append('negative_prompt', params.negative_prompt);
    params.extra_images?.forEach((file) => formData.append('extra_images', file));
    if (params.extra_role) formData.append('extra_role', params.extra_role);
    if (params.plan_id) formData.append('plan_id', params.plan_id);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/images/sessions/${sessionId}/generate`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo ảnh trong session');
      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Quá thời gian tạo ảnh (240s)');
      throw err;
    }
  },

  async deleteSessionImage(sessionId: string, imageIndex: number) {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/images/sessions/${sessionId}/images/${imageIndex}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi xóa ảnh');
    return data;
  },

  async deleteSession(sessionId: string) {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/images/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi xóa session');
    return data;
  },
};
