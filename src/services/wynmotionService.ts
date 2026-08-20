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
    // Guest / unauthenticated fallback
  }
  return headers;
}

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
  summary_text?: string;
  actions: SceneAction[];
  whisper_segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  duration_sec?: number;
  start_time_sec?: number;
  end_time_sec?: number;
}

export interface MotionProject {
  project_id: string;
  title: string;
  prompt: string;
  script?: string;
  audio_url?: string;
  duration_sec: number;
  aspect_ratio: '16:9' | '9:16' | '1:1';
  visual_style: 'handdrawn_fast_doodle' | 'whiteboard_stream_hand' | 'apple_modern_motion' | 'character_animation';
  character_subtype?: 'full_character' | 'stickman';
  language_code: string;
  bg_color?: string;
  status: string;
  mp4_url?: string;
  scenes: MotionScene[];
  created_at?: string;
  updated_at?: string;
}

export const wynmotionService = {
  /**
   * Generate Voiceover Script & Audio
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
  async listProjects(): Promise<{ success: boolean; projects: MotionProject[] }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/projects`, {
      headers,
    });
    const data = await res.json();
    if (!res.ok) return { success: true, projects: [] };
    return data;
  },
};
