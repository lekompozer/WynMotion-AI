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
  | 'science_explainer';

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
  hide_text?: boolean;
  actions: SceneAction[];
  whisper_segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  duration_sec?: number;
  start_time_sec?: number;
  end_time_sec?: number;
  swap_speakers?: boolean;
  bubble_custom_layout?: any;
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
    script_style?: 'explainer' | 'storytelling' | 'humorous' | 'scientific';
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
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/generate-audio`, {
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
   * Orchestrate Animation Scenes
   */
  async generateScenes(params: {
    title: string;
    prompt: string;
    script: string;
    audio_url?: string;
    duration_sec?: number;
    aspect_ratio?: string;
    visual_style?: string;
    character_subtype?: string;
    science_domain?: string;
    dialogue_speakers?: {
      speaker_a: DialogueSpeakerConfig;
      speaker_b: DialogueSpeakerConfig;
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi phân cảnh hoạt họa');
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tải dự án');
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
    scenes?: MotionScene[]
  ): Promise<{ success: boolean; job_id: string; message: string; mp4_url?: string; status?: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/export-mp4`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ project_id: projectId, scenes }),
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
  ): Promise<{ status: 'pending' | 'processing' | 'done' | 'failed'; mp4_url?: string; error?: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/export-status/${jobId}`, {
      headers,
    });
    const data = await res.json();
    if (!res.ok) return { status: 'failed', error: data.detail };
    return data;
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
};
