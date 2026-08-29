/**
 * WynMotion AI Service — iOS API Client
 * Connects to WordAI / WynAI AI Microservices
 */

import { wordaiAuth } from '@/lib/wordai-firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://ai.wordai.pro';

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
  } catch (err) {
    // Guest fallback
  }
  return headers;
}

export type MotionVisualStyle =
  | 'whiteboard_stream_hand'
  | 'handdrawn_fast_doodle'
  | 'character_animation'
  | 'apple_modern_motion'
  | 'dialogue_scene'
  | 'science_explainer'
  | 'product_ads_motion'
  | 'ads_strobe_teaser'
  | 'ads_cinematic_showcase'
  | 'animation_ads_image_veo'
  | 'video_news_60s';

export type CharacterSubtype =
  | 'full_character'
  | 'stickman'
  | 'pixar_3d'
  | 'cartoon_2d';

export interface SceneAction {
  action_type: string;
  element_id: string;
  label?: string;
  icon?: string;
  style?: string;
  pos_x?: number;
  pos_y?: number;
  width?: number;
  height?: number;
  highlight_color?: string;
  draw_speed_sec?: number;
  timestamp_start_sec?: number;
  timestamp_end_sec?: number;
  dialogue_cue?: string;
}

export interface MotionScene {
  scene_id: string;
  order: number;
  title: string;
  voice_transcript?: string;
  voice_transcript_en?: string;
  summary_text?: string;
  image_url?: string;
  video_url?: string;
  cutout_url?: string;
  bg_url?: string;
  dominant_colors?: string[];
  hook_text?: string;
  price_text?: string;
  hide_text?: boolean;
  actions: SceneAction[];
  whisper_segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  duration_sec?: number;
  start_time_sec?: number;
  swap_speakers?: boolean;
  bubble_custom_layout?: any;
  source_badge_text?: string;
  source_badge_pos_x?: number;
  source_badge_pos_y?: number;
  caption_pos_y?: number;
  ticker_text?: string;
  source_domain?: string;
}

export interface DialogueTurn {
  id: string;
  speaker: 'A' | 'B';
  text: string;
}

export interface DialogueSpeakerConfig {
  name: string;
  gender: 'male' | 'female';
  voice_engine: 'wynai' | 'gemini';
  voice_name: string;
  language_code: string;
}

export interface MotionProject {
  project_id: string;
  title: string;
  prompt: string;
  script?: string;
  audio_url?: string;
  duration_sec: number;
  fps?: number;
  aspect_ratio: '16:9' | '9:16' | '1:1';
  visual_style: MotionVisualStyle;
  character_subtype?: CharacterSubtype;
  science_domain?: 'math' | 'physics' | 'chemistry' | 'biology' | 'cs';
  language_code: string;
  bg_color?: string;
  status: string;
  mp4_url?: string;
  scenes: MotionScene[];
  created_at?: string;
  updated_at?: string;
}

export function calculateProjectPoints(style: MotionVisualStyle, durationSec: number = 60): number {
  const ratePer60s = style === 'science_explainer' ? 30 : 20;
  return Math.max(10, Math.ceil((durationSec / 60.0) * ratePer60s));
}

export const wynmotionService = {
  /**
   * Generate Voiceover Script & Audio (Standard Styles)
   */
  async generateScriptAndAudio(params: {
    prompt: string;
    script?: string;
    language_code?: string;
    target_audience?: 'kids' | 'teen' | 'adult';
    script_style?: 'explainer' | 'storytelling' | 'humorous' | 'scientific' | 'commercial_ads';
    max_chars?: number;
    voice_engine?: 'wynai' | 'gemini';
    voice_name?: string;
    reading_style?: string;
  }): Promise<{
    script: string;
    audio_url: string;
    duration_sec: number;
    audio_id?: string;
  }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/generate-script-audio`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo giọng đọc AI');
    return data;
  },

  /**
   * Generate Dialogue Script & Dual-Voice Stitched Audio (Dialogue Scene)
   */
  async generateDialogueAudio(params: {
    prompt: string;
    speaker_a: DialogueSpeakerConfig;
    speaker_b: DialogueSpeakerConfig;
    dialogue_turns?: DialogueTurn[];
    scenario_preset?: string;
    language_code?: string;
    max_chars?: number;
    target_audience?: string;
    script_style?: string;
    llm_engine?: string;
  }): Promise<{
    script: string;
    audio_url: string;
    duration_sec: number;
    dialogue_turns: DialogueTurn[];
    whisper_segments?: Array<{ start: number; end: number; text: string }>;
  }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/generate-dialogue-audio`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo âm thanh hội thoại');
    return data;
  },

  /**
   * Upload image / media file
   */
  async uploadMedia(formData: FormData): Promise<{ url: string; success?: boolean }> {
    const authHeaders = await getAuthHeaders();
    // Do not set Content-Type header so browser sets multipart boundary automatically
    const headers: Record<string, string> = {};
    if (authHeaders['Authorization']) {
      headers['Authorization'] = authHeaders['Authorization'];
    }
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Lỗi tải tệp lên' }));
      throw new Error(err.detail || 'Lỗi tải tệp lên');
    }
    return res.json();
  },

  /**
   * Orchestrate Animation Scenes
   */
  async generateScenes(params: {
    title?: string;
    prompt: string;
    script: string;
    audio_url?: string;
    duration_sec?: number;
    aspect_ratio?: '16:9' | '9:16' | '1:1';
    visual_style?: MotionVisualStyle;
    character_subtype?: CharacterSubtype;
    science_domain?: string;
    product_images?: string[];
    hook_text?: string;
    price_text?: string;
    cta_text?: string;
    dialogue_speakers?: {
      speaker_a: { name: string; gender: string; voice_engine: string; voice_name: string; language_code?: string };
      speaker_b: { name: string; gender: string; voice_engine: string; voice_name: string; language_code?: string };
    };
    dialogue_turns?: any[];
    language_code?: string;
    bg_color?: string;
  }): Promise<{
    success: boolean;
    project: MotionProject;
  }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/generate-scenes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const errMsg = data?.detail || data?.message || (res.status === 402 ? 'Số dư điểm không đủ để tạo video' : 'Lỗi phân cảnh hoạt họa');
      throw new Error(errMsg);
    }
    if (!data) throw new Error('Mất kết nối đến server');
    return data;
  },

  /**
   * Get Project Details
   */
  async getProject(projectId: string): Promise<{ success: boolean; project: MotionProject }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/project/${projectId}`, {
      headers,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const errMsg = data?.detail || data?.message || 'Lỗi tải dự án';
      throw new Error(errMsg);
    }
    if (!data) throw new Error('Mất kết nối đến server');
    return data;
  },

  /**
   * List Recent Projects
   */
  async listProjects(
    limit = 50,
    offset = 0
  ): Promise<{ success: boolean; projects: MotionProject[] }> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/projects?${params}`, {
      headers,
    });
    const data = await res.json();
    if (!res.ok) return { success: true, projects: [] };
    return data;
  },

  /**
   * Update Project (scenes, bg_color, title, duration_sec, aspect_ratio, etc.)
   */
  async updateProject(
    projectId: string,
    updates: Partial<MotionProject>
  ): Promise<{ success: boolean; project: MotionProject }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/project/${projectId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi cập nhật dự án');
    return data;
  },

  /**
   * Delete Project
   */
  async deleteProject(projectId: string): Promise<{ success: boolean }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/project/${projectId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi xóa dự án');
    return data;
  },

  /**
   * Enqueue MP4 video export job
   */
  async exportMP4(
    projectId: string,
    scenes?: MotionScene[],
    options?: {
      swap_speakers?: boolean;
      aspect_ratio?: string;
      show_scene_cards?: boolean;
      show_whisper_subs?: boolean;
      force_rerender?: boolean;
    }
  ): Promise<{ success: boolean; job_id: string; message: string; mp4_url?: string; status?: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/export-mp4`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        project_id: projectId,
        scenes,
        swap_speakers: options?.swap_speakers,
        aspect_ratio: options?.aspect_ratio,
        show_scene_cards: options?.show_scene_cards,
        show_whisper_subs: options?.show_whisper_subs,
        force_rerender: options?.force_rerender,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi xuất video MP4');
    return data;
  },

  /**
   * Check MP4 export job status
   */
  async checkExportStatus(
    jobId: string
  ): Promise<{
    status: 'pending' | 'processing' | 'queued' | 'done' | 'completed' | 'failed' | string;
    progress?: number;
    message?: string;
    mp4_url?: string;
    error?: string;
  }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/export-status/${jobId}`, {
      headers,
    });
    const data = await res.json();
    if (!res.ok) return { status: 'failed', error: data.detail };
    return data;
  },

  /**
   * Poll export status alias
   */
  async pollExportStatus(jobId: string) {
    return this.checkExportStatus(jobId);
  },

  /**
   * Re-design / Re-generate Scene AI Image via Gemini Agent
   */
  async redesignSceneImage(params: {
    project_id: string;
    scene_id: number | string;
    user_prompt?: string;
    aspect_ratio?: '16:9' | '9:16' | '1:1';
    character_subtype?: string;
  }): Promise<{ success: boolean; image_url: string; prompt: string; message: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/redesign-scene-image`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tái tạo hình ảnh');
    return data;
  },

  /**
   * Summarize News Article (URL or Text) into a 60-second viral TikTok news script
   */
  async summarizeNews(params: {
    url?: string;
    text?: string;
    language?: string;
    max_chars?: number;
    target_duration_sec?: number;
  }): Promise<{
    success: boolean;
    headline: string;
    category: string;
    ticker_text: string;
    full_voice_script: string;
    scenes: Array<{
      scene_id: number;
      time_range: string;
      headline: string;
      narration: string;
      image_prompt: string;
      suggested_image_index: number;
    }>;
    crawled_images: string[];
    source_title?: string;
    source_url?: string;
  }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/summarize-news`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Lỗi tóm tắt tin tức');
    }
    return res.json();
  },

  /**
   * VIP Feature: Google VEO 3.1 Animation Ads Image
   */
  async generateVeoAdsAnimation(params: {
    image_url: string;
    user_prompt?: string;
    aspect_ratio?: '9:16' | '1:1' | '16:9';
    duration_seconds?: 6 | 9 | 12;
    force_create_poster?: boolean;
  }): Promise<{
    success: boolean;
    project_id: string;
    video_url: string;
    duration_seconds: number;
    points_deducted: number;
    strategy_decision?: string;
    synthesized_poster_url?: string;
    brand_name?: string;
    product_title?: string;
    project: any;
  }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/veo-animate-ads`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Lỗi tạo video VEO 3.1');
    }
    return res.json();
  },

  /**
   * Fetch Dynamic Templates from Backend (No App Store Update Needed)
   */
  async getTemplates(params?: {
    style?: string;
    category?: string;
    is_vip?: boolean;
  }): Promise<{
    success: boolean;
    templates: Array<{
      template_id: string;
      visual_style: string;
      category: string;
      title_vi: string;
      title_en?: string;
      desc_vi: string;
      desc_en?: string;
      cover_url: string;
      cover_ios_url?: string;
      video_demo_url: string;
      local_video_path?: string;
      bgm_url?: string;
      local_bgm_path?: string;
      duration_sec: number;
      max_images: number;
      points_cost: number;
      is_vip: boolean;
      badge?: string;
      usage_count?: string;
      aspect_class?: string;
      order?: number;
      default_params?: any;
    }>;
    total: number;
  }> {
    try {
      const headers = await getAuthHeaders();
      const query = new URLSearchParams();
      if (params?.style) query.append('style', params.style);
      if (params?.category) query.append('category', params.category);
      if (params?.is_vip !== undefined) query.append('is_vip', String(params.is_vip));

      const res = await fetch(`${API_BASE_URL}/api/ai/motion/templates?${query.toString()}`, {
        headers,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic templates from API, using fallback:', err);
    }
    return { success: false, templates: [], total: 0 };
  },
};
