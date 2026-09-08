import { MotionProject, MotionScene, ModernMotionParams } from './wynmotionService';

export const DEFAULT_MODERN_MOTION_BGM = 'https://static.wordai.pro/ai-generated-images/wynmotion/templates/Intro-Music.mp3';

export const DEFAULT_LANGUAGE_FLAGS = [
  { flag: '🇻🇳', name: 'Tiếng Việt' },
  { flag: '🇺🇸', name: 'English' },
  { flag: '🇨🇳', name: '中文' },
  { flag: '🇯🇵', name: '日本語' },
  { flag: '🇰🇷', name: '한국어' },
  { flag: '🇪🇸', name: 'Español' },
];

export function convertModernMotionParamsToMotionProject(
  params: ModernMotionParams,
  customTitle?: string,
  user?: { uid?: string } | null
): MotionProject {
  const brandCompany = params.brand_company?.trim() || 'WynAI';
  const brandName = params.brand_name?.trim() || 'WynMotion';
  const titlePrimary = params.title_primary?.trim() || 'AI Video Studio';
  const tagline1 = params.tagline_1?.trim() || 'NEXT-GEN';
  const tagline2 = params.tagline_2?.trim() || 'CREATIVE SUITE';
  const header = params.templates_header?.trim() || 'DISCOVER OUR TEMPLATES';
  const cat1 = params.category_1?.trim() || 'Business.';
  const cat2 = params.category_2?.trim() || 'News.';
  const cat3 = params.category_3?.trim() || 'Illustrative.';
  const cat4 = params.category_4?.trim() || 'Motion & Explainer';
  const cat4Sub = params.category_4_sub?.trim() || 'Videos';
  const audioTitle = params.audio_title?.trim() || 'AI Audio Studio';
  const audioTags = params.audio_taglines && params.audio_taglines.length > 0
    ? params.audio_taglines
    : ['Natural voices.', 'Every language.', 'Every conversation.'];
  const flags = params.language_flags && params.language_flags.length > 0
    ? params.language_flags
    : DEFAULT_LANGUAGE_FLAGS;
  const headline1 = params.editor_headline_1?.trim() || 'A COMPLETE';
  const headline2 = params.editor_headline_2?.trim() || 'VIDEO EDITOR.';
  const slogan = params.slogan_text?.trim() || 'Create Daily 60s AI Videos From Just';
  const price = params.slogan_price?.trim() || '$1';

  const defaultCDN = 'https://static.wordai.pro/ai-generated-images/wynmotion/templates';
  const mainVideo1 = params.main_video_1 || `${defaultCDN}/WynMotion-Video-phase1-7s.mp4`;
  const mainVideo2 = params.main_video_2 || `${defaultCDN}/Wynmotion_video_phase4.5.mp4`;
  const mainVideo3 = params.main_video_3 || `${defaultCDN}/WynMotion_Video_Phase6.mp4`;
  const brandLogo = params.brand_logo_url || `${defaultCDN}/iconApp-WynAI-512.png`;
  const trainVideos = params.train_videos && params.train_videos.length === 5
    ? params.train_videos
    : [
        `${defaultCDN}/cinematic_showcase_demo.mp4`,
        `${defaultCDN}/science_explainer_rendered_demo2.mp4`,
        `${defaultCDN}/whiteboard_stream_en_demo.mp4`,
        `${defaultCDN}/video_animate_image_demo.mp4`,
        `${defaultCDN}/WynMotion_character_animation_stickman_en_demo.mp4`,
      ];

  const scenes: MotionScene[] = [
    {
      scene_id: '1',
      order: 1,
      title: 'Phase 1 — Hero Clip 1 (7.0s)',
      video_url: mainVideo1,
      duration_sec: 7.0,
      start_time_sec: 0.0,
      voice_transcript: `Hero Clip 1: Fullscreen 9:16 Intro`,
      actions: [],
    },
    {
      scene_id: '2',
      order: 2,
      title: `Phase 1.5 — By ${brandCompany} & Logo (2.0s)`,
      duration_sec: 2.0,
      start_time_sec: 7.0,
      image_url: brandLogo,
      voice_transcript: `By ${brandCompany}`,
      actions: [],
    },
    {
      scene_id: '3',
      order: 3,
      title: `Phase 1.6a — Tiêu đề chính (1.2s)`,
      duration_sec: 1.2,
      start_time_sec: 9.0,
      voice_transcript: titlePrimary,
      hook_text: titlePrimary,
      actions: [],
    },
    {
      scene_id: '4',
      order: 4,
      title: `Phase 1.6b — Tagline 1 (0.6s)`,
      duration_sec: 0.6,
      start_time_sec: 10.2,
      voice_transcript: tagline1,
      hook_text: tagline1,
      actions: [],
    },
    {
      scene_id: '5',
      order: 5,
      title: `Phase 1.6c — Tagline 2 (0.6s)`,
      duration_sec: 0.6,
      start_time_sec: 10.8,
      voice_transcript: tagline2,
      hook_text: tagline2,
      actions: [],
    },
    {
      scene_id: '6',
      order: 6,
      title: `Phase 2.0 — ${header} (1.0s)`,
      duration_sec: 1.0,
      start_time_sec: 11.4,
      voice_transcript: header,
      hook_text: header,
      actions: [],
    },
    {
      scene_id: '7',
      order: 7,
      title: `Phase 2.1 — ${cat1} (0.7s)`,
      duration_sec: 0.7,
      start_time_sec: 12.4,
      voice_transcript: cat1,
      hook_text: cat1,
      actions: [],
    },
    {
      scene_id: '8',
      order: 8,
      title: `Phase 2.2 — ${cat2} (0.7s)`,
      duration_sec: 0.7,
      start_time_sec: 13.1,
      voice_transcript: cat2,
      hook_text: cat2,
      actions: [],
    },
    {
      scene_id: '9',
      order: 9,
      title: `Phase 2.3 — ${cat3} (0.7s)`,
      duration_sec: 0.7,
      start_time_sec: 13.8,
      voice_transcript: cat3,
      hook_text: cat3,
      actions: [],
    },
    {
      scene_id: '10',
      order: 10,
      title: `Phase 2.4 — ${cat4} (${cat4Sub}) (1.4s)`,
      duration_sec: 1.4,
      start_time_sec: 14.5,
      voice_transcript: `${cat4} · ${cat4Sub}`,
      hook_text: `${cat4}\n${cat4Sub}`,
      actions: [],
    },
    {
      scene_id: '11',
      order: 11,
      title: `Phase 3 — Carousel 5 Videos (9.0s)`,
      duration_sec: 9.0,
      start_time_sec: 15.9,
      video_url: trainVideos[0],
      voice_transcript: `5-Video Carousel Conveyor Showcase`,
      actions: [],
    },
    {
      scene_id: '12',
      order: 12,
      title: `Phase 4.0 — ${audioTitle} (1.2s)`,
      duration_sec: 1.2,
      start_time_sec: 24.9,
      voice_transcript: audioTitle,
      hook_text: audioTitle,
      actions: [],
    },
    {
      scene_id: '13',
      order: 13,
      title: `Phase 4.1 — Audio Taglines (1.4s)`,
      duration_sec: 1.4,
      start_time_sec: 26.1,
      voice_transcript: audioTags.join(' · '),
      hook_text: audioTags.join('\n'),
      actions: [],
    },
    {
      scene_id: '14',
      order: 14,
      title: `Phase 4.2 — Language Flags Beat Sync (1.5s)`,
      duration_sec: 1.5,
      start_time_sec: 27.5,
      voice_transcript: flags.map(f => `${f.flag} ${f.name}`).join(' · '),
      hook_text: flags.map(f => `${f.flag} ${f.name}`).join('\n'),
      actions: [],
    },
    {
      scene_id: '15',
      order: 15,
      title: `Phase 4.5 — Hero Clip 2 (9.0s)`,
      duration_sec: 9.0,
      start_time_sec: 29.0,
      video_url: mainVideo2,
      voice_transcript: `Hero Clip 2: Fullscreen 9:16 Video`,
      actions: [],
    },
    {
      scene_id: '16',
      order: 16,
      title: `Phase 5.5 — ${headline1} ${headline2} (1.6s)`,
      duration_sec: 1.6,
      start_time_sec: 38.0,
      voice_transcript: `${headline1} ${headline2}`,
      hook_text: `${headline1}\n${headline2}`,
      actions: [],
    },
    {
      scene_id: '17',
      order: 17,
      title: `Phase 6 — Hero Clip 3 (Fast-forward) (5.0s)`,
      duration_sec: 5.0,
      start_time_sec: 39.6,
      video_url: mainVideo3,
      voice_transcript: `Hero Clip 3: Fast-forward 2.67x -> 1x`,
      actions: [],
    },
    {
      scene_id: '18',
      order: 18,
      title: `Phase 7.0 — Slogan & Price (${price}) (2.0s)`,
      duration_sec: 2.0,
      start_time_sec: 44.6,
      voice_transcript: `${slogan} ${price}`,
      hook_text: `${slogan}\n${price}`,
      price_text: price,
      actions: [],
    },
    {
      scene_id: '19',
      order: 19,
      title: `Phase 7.5 — Outro ${brandName} (3.5s)`,
      duration_sec: 3.5,
      start_time_sec: 46.6,
      image_url: brandLogo,
      voice_transcript: brandName,
      hook_text: brandName,
      actions: [],
    },
  ];

  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration_sec || 0), 0);
  const now = new Date().toISOString();
  const projectId = `apple_mm_${Date.now()}`;

  return {
    project_id: projectId,
    title: customTitle || `Modern Motion Suite 50.1s (${brandName})`,
    prompt: `Apple Modern Motion Suite 50.1s customizable scenes (${brandName})`,
    aspect_ratio: '9:16',
    visual_style: 'apple_modern_motion',
    duration_sec: Number(totalDuration.toFixed(1)),
    fps: 30,
    language_code: 'vi',
    bg_color: '#08090f',
    audio_url: params.bgm_url || DEFAULT_MODERN_MOTION_BGM,
    status: 'ready',
    scenes,
    created_at: now,
    updated_at: now,
  };
}
