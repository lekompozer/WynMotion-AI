/**
 * WynMotion AI Audio Service — iOS Client
 * Connects to AI TTS 48kHz (VieNeu, Kokoro) and Background Music APIs
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

export interface VoiceOption {
  code: string;
  name: string;
  region?: string;
  gender?: 'male' | 'female';
  preview_text?: string;
}

export const VIETNAMESE_VOICES: VoiceOption[] = [
  // Miền Bắc
  { code: 'Phạm Tuyên', name: 'Phạm Tuyên', region: 'Miền Bắc · Tự nhiên', gender: 'male' },
  { code: 'Minh Đức', name: 'Minh Đức', region: 'Miền Bắc · Tin tức', gender: 'male' },
  { code: 'Thanh Bình', name: 'Thanh Bình', region: 'Miền Bắc · Kể chuyện', gender: 'male' },
  { code: 'Trúc Ly', name: 'Trúc Ly', region: 'Miền Bắc · Tự nhiên', gender: 'female' },
  { code: 'Đoan Trang', name: 'Đoan Trang', region: 'Miền Bắc · Ngọt ngào', gender: 'female' },
  { code: 'Ngọc Linh', name: 'Ngọc Linh', region: 'Miền Bắc · Kể chuyện', gender: 'female' },
  { code: 'Mai Anh', name: 'Mai Anh', region: 'Miền Bắc · Tin tức', gender: 'female' },
  // Miền Trung
  { code: 'Quang Sơn', name: 'Quang Sơn', region: 'Miền Trung · Trầm ấm', gender: 'male' },
  { code: 'Ngọc Trân', name: 'Ngọc Trân', region: 'Miền Trung · Dịu dàng', gender: 'female' },
  // Miền Nam
  { code: 'Xuân Vĩnh', name: 'Xuân Vĩnh', region: 'Miền Nam · Tự nhiên', gender: 'male' },
  { code: 'Thái Sơn', name: 'Thái Sơn', region: 'Miền Nam · Kể chuyện', gender: 'male' },
  { code: 'Minh Triết', name: 'Minh Triết', region: 'Miền Nam · Bản tin', gender: 'male' },
  { code: 'Thục Đoan', name: 'Thục Đoan', region: 'Miền Nam · Truyền cảm', gender: 'female' },
  { code: 'Thùy Dung', name: 'Thùy Dung', region: 'Miền Nam · Tin tức', gender: 'female' },
];

export const GLOBAL_VOICES: VoiceOption[] = [
  { code: 'af_bella', name: 'Bella (US Female)', region: 'English (US) · Natural', gender: 'female' },
  { code: 'af_sarah', name: 'Sarah (US Female)', region: 'English (US) · Warm', gender: 'female' },
  { code: 'am_michael', name: 'Michael (US Male)', region: 'English (US) · Confident', gender: 'male' },
  { code: 'am_adam', name: 'Adam (US Male)', region: 'English (US) · Dynamic', gender: 'male' },
  { code: 'bf_emma', name: 'Emma (UK Female)', region: 'English (UK) · Elegant', gender: 'female' },
  { code: 'bm_george', name: 'George (UK Male)', region: 'English (UK) · Deep', gender: 'male' },
  { code: 'jf_nezumi', name: 'Nezumi (JP Female)', region: '日本語 · Anime / Sweet', gender: 'female' },
  { code: 'zf_xiaoyan', name: 'Xiaoyan (CN Female)', region: '中文 · Mandarin', gender: 'female' },
  { code: 'ff_siwis', name: 'Chloé (FR Female)', region: 'Français · Natural', gender: 'female' },
];

export const READING_STYLES = [
  { code: 'tu_nhien', label: '🗣️ Tự nhiên / Đàm thoại' },
  { code: 'tin_tuc', label: '📰 Đọc bản tin / Thời sự' },
  { code: 'doc_truyen', label: '📖 Kể chuyện / Sách nói' },
  { code: 'podcast', label: '🎙️ Podcast / Hùng biện' },
];

export const MUSIC_STYLES = [
  { id: 'cinematic', label: '🎬 Điện Ảnh / Epic', prompt: 'Cinematic orchestral soundtrack, epic emotional strings, movie score' },
  { id: 'lofi', label: '☕ Lo-fi Chill / Study', prompt: 'Chill lo-fi hip hop beat, cozy vinyl warmth, relaxed mellow piano' },
  { id: 'corporate', label: '💼 Doanh Nghiệp / Tech', prompt: 'Inspiring upbeat corporate acoustic guitar, modern tech corporate vibe' },
  { id: 'piano', label: '🎹 Piano Tình Cảm', prompt: 'Emotional heartfelt solo piano melody, ambient cinematic reverb' },
  { id: 'ambient', label: '🌌 Không Gian Ambient', prompt: 'Atmospheric ambient soundscape, deep synth pads, meditation relax' },
  { id: 'upbeat', label: '⚡ Năng Lượng / Pop', prompt: 'Energetic electronic upbeat pop, modern catchy driving rhythm' },
];

export const audioService = {
  /**
   * Synthesize AI Voiceover Speech
   */
  async generateSpeech(params: {
    text: string;
    voice_name: string;
    language_code: string;
    reading_style?: string;
    speed?: number;
  }): Promise<{
    audio_url: string;
    duration_sec: number;
    file_id?: string;
  }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/audio/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: params.text,
        voice: params.voice_name,
        voice_name: params.voice_name,
        language: params.language_code,
        style: params.reading_style || 'tu_nhien',
        speed: params.speed || 1.0,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo giọng đọc AI');
    return {
      audio_url: data.audio_url || data.url,
      duration_sec: data.duration || data.duration_sec || data.duration_seconds || 15,
      file_id: data.library_id || data.file_id,
    };
  },

  /**
   * Generate Background Music from Prompt
   */
  async generateMusic(params: {
    prompt: string;
    duration_sec?: number;
  }): Promise<{
    audio_url: string;
    duration_sec: number;
  }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/documents/generate-background-music`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: params.prompt,
        duration: params.duration_sec || 30,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo nhạc nền AI');
    return {
      audio_url: data.audio_url || data.url,
      duration_sec: data.duration || params.duration_sec || 30,
    };
  },

  /**
   * AI Script Writer Assistant
   */
  async generateScriptFromPrompt(prompt: string, language: string = 'vi'): Promise<string> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/generate-audio`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        language_code: language,
        max_chars: 400,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo kịch bản');
    return data.script || '';
  },
};
