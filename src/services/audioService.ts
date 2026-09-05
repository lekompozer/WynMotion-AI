/**
 * WynMotion AI Audio Service — iOS Client
 * Connects to AI TTS 48kHz (VieNeu, Kokoro, Gemini) and Background Music APIs
 * Mirrors https://www.wynai.pro/app/wynmotion-ai?tab=audio
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
  tag?: string;
}

export const AUDIO_STUDIO_LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'zh', name: '中文 (Mandarin)', flag: '🇨🇳' },
  { code: 'kr', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ms', name: 'Melayu', flag: '🇲🇾' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇧🇩' },
];

export const VIENEU_NORTHERN_VOICES: VoiceOption[] = [
  { code: 'Phạm Tuyên', name: 'Phạm Tuyên', region: 'Miền Bắc · Tự nhiên', gender: 'male', tag: 'Phổ biến' },
  { code: 'Minh Đức', name: 'Minh Đức', region: 'Miền Bắc · Tin tức', gender: 'male', tag: 'Sư phạm' },
  { code: 'Thanh Bình', name: 'Thanh Bình', region: 'Miền Bắc · Kể chuyện', gender: 'male', tag: 'Kể chuyện' },
  { code: 'Trúc Ly', name: 'Trúc Ly', region: 'Miền Bắc · Tự nhiên', gender: 'female', tag: 'Tự nhiên' },
  { code: 'Đoan Trang', name: 'Đoan Trang', region: 'Miền Bắc · Ngọt ngào', gender: 'female', tag: 'Nhẹ nhàng' },
  { code: 'Ngọc Linh', name: 'Ngọc Linh', region: 'Miền Bắc · Kể chuyện', gender: 'female', tag: 'Truyền cảm' },
  { code: 'Mai Anh', name: 'Mai Anh', region: 'Miền Bắc · Tin tức', gender: 'female', tag: 'Thời sự' },
];

export const VIENEU_CENTRAL_VOICES: VoiceOption[] = [
  { code: 'Quang Sơn', name: 'Quang Sơn', region: 'Miền Trung · Trầm ấm', gender: 'male', tag: 'Miền Trung' },
  { code: 'Ngọc Trân', name: 'Ngọc Trân', region: 'Miền Trung · Dịu dàng', gender: 'female', tag: 'Miền Trung' },
];

export const VIENEU_SOUTHERN_VOICES: VoiceOption[] = [
  { code: 'Xuân Vĩnh', name: 'Xuân Vĩnh', region: 'Miền Nam · Tự nhiên', gender: 'male', tag: 'Miền Nam' },
  { code: 'Thái Sơn', name: 'Thái Sơn', region: 'Miền Nam · Kể chuyện', gender: 'male', tag: 'Kể chuyện' },
  { code: 'Minh Triết', name: 'Minh Triết', region: 'Miền Nam · Tin tức', gender: 'male', tag: 'Thời sự' },
  { code: 'Thục Đoan', name: 'Thục Đoan', region: 'Miền Nam · Truyền cảm', gender: 'female', tag: 'Truyền cảm' },
  { code: 'Thùy Dung', name: 'Thùy Dung', region: 'Miền Nam · Tin tức', gender: 'female', tag: 'Tin tức' },
];

export const KOKORO_FEMALE_VOICES: VoiceOption[] = [
  { code: 'af_bella', name: 'Bella (US Female 🇺🇸)', region: 'English (US)', gender: 'female', tag: 'Top Pick' },
  { code: 'af_nicole', name: 'Nicole (US Female 🇺🇸)', region: 'English (US)', gender: 'female', tag: 'Clear' },
  { code: 'af_sarah', name: 'Sarah (US Female 🇺🇸)', region: 'English (US)', gender: 'female', tag: 'Natural' },
  { code: 'af_sky', name: 'Sky (US Female 🇺🇸)', region: 'English (US)', gender: 'female', tag: 'Youth' },
  { code: 'bf_isabella', name: 'Isabella (UK Female 🇬🇧)', region: 'English (UK)', gender: 'female', tag: 'Academic' },
  { code: 'bf_emma', name: 'Emma (UK Female 🇬🇧)', region: 'English (UK)', gender: 'female', tag: 'British' },
  { code: 'zf_xiaobei', name: 'Xiaobei (Chinese Female 🇨🇳)', region: '中文', gender: 'female', tag: 'Mandarin' },
  { code: 'jf_alpha', name: 'Alpha (Japanese Female 🇯🇵)', region: '日本語', gender: 'female', tag: 'Anime' },
  { code: 'kf_sarah', name: 'Sarah (Korean Female 🇰🇷)', region: '한국어', gender: 'female', tag: 'Korean' },
  { code: 'ef_dora', name: 'Dora (Spanish Female 🇪🇸)', region: 'Español', gender: 'female', tag: 'Spanish' },
  { code: 'if_sara', name: 'Sara (Italian Female 🇮🇹)', region: 'Italiano', gender: 'female', tag: 'Italian' },
  { code: 'pf_dora', name: 'Dora (Portuguese Female 🇧🇷)', region: 'Português', gender: 'female', tag: 'Portuguese' },
  { code: 'hf_alpha', name: 'Alpha (Hindi Female 🇮🇳)', region: 'हिन्दी', gender: 'female', tag: 'Hindi' },
];

export const KOKORO_MALE_VOICES: VoiceOption[] = [
  { code: 'am_adam', name: 'Adam (US Male 🇺🇸)', region: 'English (US)', gender: 'male', tag: 'Standard' },
  { code: 'am_michael', name: 'Michael (US Male 🇺🇸)', region: 'English (US)', gender: 'male', tag: 'Deep' },
  { code: 'bm_george', name: 'George (UK Male 🇬🇧)', region: 'English (UK)', gender: 'male', tag: 'Story' },
  { code: 'bm_lewis', name: 'Lewis (UK Male 🇬🇧)', region: 'English (UK)', gender: 'male', tag: 'British' },
  { code: 'zm_yunjian', name: 'Yunjian (Chinese Male 🇨🇳)', region: '中文', gender: 'male', tag: 'Mandarin' },
  { code: 'jm_kumo', name: 'Kumo (Japanese Male 🇯🇵)', region: '日本語', gender: 'male', tag: 'Japanese' },
  { code: 'km_joon', name: 'Joon (Korean Male 🇰🇷)', region: '한국어', gender: 'male', tag: 'Korean' },
  { code: 'em_alex', name: 'Alex (Spanish Male 🇪🇸)', region: 'Español', gender: 'male', tag: 'Spanish' },
  { code: 'im_nicola', name: 'Nicola (Italian Male 🇮🇹)', region: 'Italiano', gender: 'male', tag: 'Italian' },
  { code: 'pm_alex', name: 'Alex (Portuguese Male 🇧🇷)', region: 'Português', gender: 'male', tag: 'Portuguese' },
  { code: 'hm_omega', name: 'Omega (Hindi Male 🇮🇳)', region: 'हिन्दी', gender: 'male', tag: 'Hindi' },
];

export const GEMINI_MALE_VOICES: VoiceOption[] = [
  { code: 'Puck', name: 'Puck', region: 'Male ♂️ · Energetic', gender: 'male', tag: 'Expressive' },
  { code: 'Charon', name: 'Charon', region: 'Male ♂️ · Deep & Calm', gender: 'male', tag: 'Deep' },
  { code: 'Fenrir', name: 'Fenrir', region: 'Male ♂️ · Dramatic', gender: 'male', tag: 'Story' },
  { code: 'Orus', name: 'Orus', region: 'Male ♂️ · Professional', gender: 'male', tag: 'Teacher' },
  { code: 'Enceladus', name: 'Enceladus', region: 'Male ♂️ · Soft & Warm', gender: 'male', tag: 'Soft' },
  { code: 'Iapetus', name: 'Iapetus', region: 'Male ♂️ · Narrative', gender: 'male', tag: 'Narrative' },
  { code: 'Alnilam', name: 'Alnilam', region: 'Male ♂️ · Natural Tone', gender: 'male', tag: 'Natural' },
  { code: 'Gacrux', name: 'Gacrux', region: 'Male ♂️ · Crisp Articulation', gender: 'male', tag: 'Crisp' },
];

export const GEMINI_FEMALE_VOICES: VoiceOption[] = [
  { code: 'Kore', name: 'Kore', region: 'Female ♀️ · Sweet & Warm', gender: 'female', tag: 'Top Pick' },
  { code: 'Aoede', name: 'Aoede', region: 'Female ♀️ · Clear & Expressive', gender: 'female', tag: 'Expressive' },
  { code: 'Leda', name: 'Leda', region: 'Female ♀️ · Gentle Storyteller', gender: 'female', tag: 'Story' },
  { code: 'Zephyr', name: 'Zephyr', region: 'Female ♀️ · Calm & Academic', gender: 'female', tag: 'Academic' },
  { code: 'Despina', name: 'Despina', region: 'Female ♀️ · Friendly Host', gender: 'female', tag: 'Friendly' },
];

export const KOKORO_DEFAULT_VOICE_MAP: Record<string, string> = {
  'en-US': 'af_bella',
  'en-GB': 'bf_emma',
  'zh': 'zf_xiaobei',
  'ja': 'jf_alpha',
  'es': 'ef_dora',
  'hi': 'hf_alpha',
  'pt-BR': 'pf_dora',
  'kr': 'kf_sarah',
  'ko': 'kf_sarah',
  'vi': 'Phạm Tuyên',
};

export const READING_STYLES = [
  { code: 'tu_nhien', labelVi: '🗣️ Tự nhiên / Đàm thoại', labelEn: '🗣️ Natural / Conversational' },
  { code: 'tin_tuc', labelVi: '📰 Đọc bản tin / Thời sự', labelEn: '📰 News / Formal' },
  { code: 'doc_truyen', labelVi: '📖 Kể chuyện / Sách nói', labelEn: '📖 Storytelling / Audiobook' },
];

export const MUSIC_STYLES = [
  { id: 'cinematic', labelVi: '🎬 Điện Ảnh / Epic', labelEn: '🎬 Cinematic Epic', prompt: 'Epic orchestral soundtrack with dramatic strings and heroic brass, cinematic movie score' },
  { id: 'lofi', labelVi: '☕ Lo-fi Chill / Study', labelEn: '☕ Lo-Fi Chill', prompt: 'Chill lo-fi hip hop beat with smooth piano chords, warm vinyl crackle, relaxed mellow vibe' },
  { id: 'corporate', labelVi: '💼 Doanh Nghiệp / Tech', labelEn: '💼 Corporate Tech', prompt: 'Upbeat inspiring corporate acoustic pop with bright guitar, positive motivational modern rhythm' },
  { id: 'piano', labelVi: '🎹 Piano Tình Cảm', labelEn: '🎹 Emotional Piano', prompt: 'Calm emotional acoustic piano solo with gentle melody and atmospheric cinematic reverb' },
  { id: 'ambient', labelVi: '🌌 Ambient Thư Giãn', labelEn: '🌌 Ambient Soundscape', prompt: 'Ethereal ambient electronic music with slow tempo, deep warm synth pads, peaceful soundscape' },
  { id: 'electronic', labelVi: '⚡ Năng Lượng / Pop', labelEn: '⚡ Upbeat Pop', prompt: 'Energetic electronic dance track with fast tempo, upbeat bright synths and catchy driving bass' },
];

export interface AudioGenerateResponse {
  audio_url: string;
  duration_sec: number;
  file_id?: string;
  filename?: string;
}

export const audioService = {
  /**
   * Synthesize AI Voiceover Speech
   */
  async generateSpeech(params: {
    text: string;
    voice_name: string;
    language_code: string;
    voice_engine?: 'wynai' | 'gemini';
    reading_style?: string;
    speaking_rate?: number;
    use_pro_model?: boolean;
  }): Promise<AudioGenerateResponse> {
    const headers = await getAuthHeaders();
    const effectiveVoiceEngine =
      params.voice_engine === 'gemini'
        ? 'gemini'
        : params.language_code === 'vi'
        ? 'vieneu'
        : 'kokoro';

    const body: Record<string, any> = {
      text: params.text,
      voice_engine: effectiveVoiceEngine,
      language: params.language_code,
      voice: params.voice_name,
      voice_name: params.voice_name,
      speaking_rate: params.speaking_rate || 1.0,
      use_pro_model: params.use_pro_model || false,
    };

    if (effectiveVoiceEngine === 'vieneu' && params.reading_style) {
      body.reading_style = params.reading_style;
      body.style = params.reading_style;
    }

    const res = await fetch(`${API_BASE_URL}/api/ai/audio/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo giọng đọc AI');

    return {
      audio_url: data.audio_url || data.url,
      duration_sec: data.duration || data.duration_seconds || data.duration_sec || 15,
      file_id: data.library_id || data.library_file_id || data.file_id,
      filename: data.filename || 'audio.wav',
    };
  },

  /**
   * Generate Background Music from Prompt
   */
  async generateMusic(params: {
    prompt: string;
    negative_prompt?: string;
    seed?: number;
  }): Promise<{
    audio_url?: string;
    job_id?: string;
    message?: string;
  }> {
    const headers = await getAuthHeaders();

    // Try Lyria endpoint first
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/lyria/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: params.prompt,
          negative_prompt: params.negative_prompt || null,
          seed: params.seed || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (_) {}

    // Fallback to documents endpoint
    const fallbackRes = await fetch(`${API_BASE_URL}/api/ai/documents/generate-background-music`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: params.prompt,
        duration: 30,
      }),
    });

    const data = await fallbackRes.json();
    if (!fallbackRes.ok) throw new Error(data.detail || data.message || 'Lỗi tạo nhạc nền AI');
    return {
      audio_url: data.audio_url || data.url,
      job_id: data.job_id,
    };
  },

  /**
   * AI Script Writer Assistant
   */
  async generateScriptFromPrompt(prompt: string, language: string = 'vi'): Promise<string> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/ai/motion/generate-script-audio`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        language_code: language,
        max_chars: 450,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Lỗi tạo kịch bản');
    return data.script || '';
  },
};
