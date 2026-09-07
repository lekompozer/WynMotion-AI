'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

export interface ModernMotionSuiteRendererProps {
  scene: DynamicSceneData;
  showSceneCards?: boolean;
  showWhisperSubs?: boolean;
}

const DEFAULT_CDN = 'https://static.wordai.pro/ai-generated-images/wynmotion/templates';

export const ModernMotionSuiteRenderer: React.FC<ModernMotionSuiteRendererProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Extract custom parameters with rock-solid defaults from v9
  const params = (scene as any).default_params || (scene as any).template_params || {};
  const brandName = (scene as any).brand_name || params.brand_name || 'WynMotion';
  const brandCompany = (scene as any).brand_company || params.brand_company || 'WynAI';
  const brandLogoUrl = (scene as any).brand_logo_url || params.brand_logo_url || `${DEFAULT_CDN}/iconApp-WynAI-512.png`;
  
  const titlePrimary = (scene as any).title_primary || params.title_primary || 'AI Video Studio';
  const tagline1 = (scene as any).tagline_1 || params.tagline_1 || 'NEXT-GEN';
  const tagline2 = (scene as any).tagline_2 || params.tagline_2 || 'CREATIVE SUITE';
  const templatesHeader = (scene as any).templates_header || params.templates_header || 'DISCOVER OUR TEMPLATES';
  const cat1 = (scene as any).category_1 || params.category_1 || 'Business.';
  const cat2 = (scene as any).category_2 || params.category_2 || 'News.';
  const cat3 = (scene as any).category_3 || params.category_3 || 'Illustrative.';
  const cat4 = (scene as any).category_4 || params.category_4 || 'Motion & Explainer';
  const cat4Sub = (scene as any).category_4_sub || params.category_4_sub || 'Videos';
  
  const audioTitle = (scene as any).audio_title || params.audio_title || 'AI Audio Studio';
  const audioTaglines = (scene as any).audio_taglines || params.audio_taglines || [
    'Natural voices.',
    'Every language.',
    'Every conversation.',
  ];
  
  const editorHeadline1 = (scene as any).editor_headline_1 || params.editor_headline_1 || 'A COMPLETE';
  const editorHeadline2 = (scene as any).editor_headline_2 || params.editor_headline_2 || 'VIDEO EDITOR.';
  const editorEndingText = (scene as any).editor_ending_text || params.editor_ending_text || 'Create with AI. Edit with precision.';
  
  const sloganText = (scene as any).slogan_text || params.slogan_text || 'Create Daily 60s AI Videos From Just';
  const sloganPrice = (scene as any).slogan_price || params.slogan_price || '$1';

  // Media URLs with v9 fallbacks
  const mainVideo1 = (scene as any).main_video_1 || `${DEFAULT_CDN}/WynMotion-Video-phase1-7s.mp4`;
  const mainVideo2 = (scene as any).main_video_2 || `${DEFAULT_CDN}/Wynmotion_video_phase4.5.mp4`;
  const mainVideo3 = (scene as any).main_video_3 || `${DEFAULT_CDN}/WynMotion_Video_Phase6.mp4`;

  const trainVideos = (scene as any).train_videos || [
    `${DEFAULT_CDN}/cinematic_showcase_demo.mp4`,
    `${DEFAULT_CDN}/science_explainer_rendered_demo2.mp4`,
    `${DEFAULT_CDN}/whiteboard_stream_en_demo.mp4`,
    `${DEFAULT_CDN}/video_animate_image_demo.mp4`,
    `${DEFAULT_CDN}/WynMotion_character_animation_stickman_en_demo.mp4`,
  ];

  // Helper for staggered word rise with spring
  const getWordStyle = (wordIndex: number, currentLocalFrame: number, stepFrames = 4) => {
    const startF = wordIndex * stepFrames;
    if (currentLocalFrame < startF) return { opacity: 0, transform: 'translateY(36px)' };
    const sp = spring({
      frame: Math.max(0, currentLocalFrame - startF),
      fps,
      config: { damping: 18, stiffness: 180 },
    });
    const ty = interpolate(sp, [0, 1], [36, 0]);
    return { opacity: sp, transform: `translateY(${ty}px)` };
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SEGMENT ROUTING (Based on frame at 30 FPS)
  // ─────────────────────────────────────────────────────────────────────────────

  // Seg 1: 0 -> 210 (0.0s - 7.0s) Hero Video 1
  if (frame < 210) {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#000', overflow: 'hidden' }}>
        <video
          src={mainVideo1}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          autoPlay
          muted
          playsInline
        />
      </div>
    );
  }

  // Seg 2: 210 -> 270 (7.0s - 9.0s) By [Company] & Brand Logo (CUSTOMIZABLE SECOND 8)
  if (frame < 270) {
    const localF = frame - 210;
    const t = localF / fps;
    const op = t < 0.35 ? t / 0.35 : (t > 1.65 ? Math.max(0, 1 - (t - 1.65) / 0.35) : 1.0);
    const sc = 0.94 + 0.08 * (t / 2.0);

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        }}
      >
        <div
          style={{
            opacity: op,
            transform: `scale(${sc})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 500, color: '#94a3b8', letterSpacing: 8, textTransform: 'uppercase' }}>
            By
          </div>
          <div style={{ fontSize: 76, fontWeight: 600, color: '#1d1d1f', letterSpacing: -2, marginTop: 4 }}>
            {brandCompany}
          </div>
          <div
            style={{
              width: 140,
              height: 140,
              marginTop: 36,
              borderRadius: 32,
              boxShadow: '0 20px 48px rgba(0,0,0,0.12)',
              border: '2px solid rgba(0,0,0,0.06)',
              padding: 5,
              background: '#fff',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={brandLogoUrl}
              alt="Brand Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 27 }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Seg 3: 270 -> 306 (9.0s - 10.2s) "AI Video Studio" Staggered Rise
  if (frame < 306) {
    const localF = frame - 270;
    const words = titlePrimary.split(' ');

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', fontSize: 68, fontWeight: 300, color: '#1d1d1f', letterSpacing: -1.5 }}>
          {words.map((w: string, idx: number) => (
            <span key={idx} style={{ display: 'inline-block', ...getWordStyle(idx, localF, 4) }}>
              {w}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Seg 4: 306 -> 342 (10.2s - 11.4s) "NEXT-GEN" Vivid Gradient
  if (frame < 342) {
    const localF = frame - 306;
    const sp = spring({ frame: localF, fps, config: { damping: 18, stiffness: 180 } });
    const ty = interpolate(sp, [0, 1], [30, 0]);

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: -1.5,
            opacity: sp,
            transform: `translateY(${ty}px)`,
            background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
          }}
        >
          {tagline1}
        </div>
      </div>
    );
  }

  // Seg 5: 342 -> 378 (11.4s - 12.6s) "CREATIVE SUITE" Vivid Gradient
  if (frame < 378) {
    const localF = frame - 342;
    const sp = spring({ frame: localF, fps, config: { damping: 18, stiffness: 180 } });
    const ty = interpolate(sp, [0, 1], [30, 0]);

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 66,
            fontWeight: 800,
            letterSpacing: -1.5,
            opacity: sp,
            transform: `translateY(${ty}px)`,
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #9333ea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
          }}
        >
          {tagline2}
        </div>
      </div>
    );
  }

  // Seg 6: 378 -> 393 (12.6s - 13.1s) Black Circle Expand Transition (0.5s = 15f)
  if (frame < 393) {
    const localF = frame - 378;
    const progress = localF / 15;
    const radius = progress * 1000;

    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: radius * 2,
            height: radius * 2,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            backgroundColor: '#000000',
          }}
        />
      </div>
    );
  }

  // Seg 7: 393 -> 423 (13.1s - 14.1s) "DISCOVER OUR TEMPLATES"
  if (frame < 423) {
    const localF = frame - 393;
    const sp = spring({ frame: localF, fps, config: { damping: 18, stiffness: 180 } });

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#FFFFFF',
            letterSpacing: 4,
            textTransform: 'uppercase',
            opacity: sp,
            textAlign: 'center',
            padding: '0 24px',
          }}
        >
          {templatesHeader}
        </div>
      </div>
    );
  }

  // Seg 8: 423 -> 444 (14.1s - 14.8s) "Business." + Rising Chart Bars
  if (frame < 444) {
    const localF = frame - 423;
    const sp = spring({ frame: localF, fps, config: { damping: 18, stiffness: 180 } });
    const ty = interpolate(sp, [0, 1], [30, 0]);

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
          position: 'relative',
        }}
      >
        {/* Animated Bar Chart SVG behind */}
        <svg width="240" height="100" style={{ position: 'absolute', opacity: 0.18 }}>
          <rect x="20" y={100 - 40 * sp} width="28" height={40 * sp} fill="#38bdf8" rx="6" />
          <rect x="68" y={100 - 65 * sp} width="28" height={65 * sp} fill="#38bdf8" rx="6" />
          <rect x="116" y={100 - 50 * sp} width="28" height={50 * sp} fill="#38bdf8" rx="6" />
          <rect x="164" y={100 - 90 * sp} width="28" height={90 * sp} fill="#38bdf8" rx="6" />
        </svg>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: sp, transform: `translateY(${ty}px)`, zIndex: 2 }}>
          <span style={{ fontSize: 72, fontWeight: 700, color: '#FFFFFF', letterSpacing: -1.5 }}>
            {cat1}
          </span>
          <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 16px #38bdf8' }} />
        </div>
      </div>
    );
  }

  // Seg 9: 444 -> 465 (14.8s - 15.5s) "News." + Rotating Globe Grid
  if (frame < 465) {
    const localF = frame - 444;
    const sp = spring({ frame: localF, fps, config: { damping: 18, stiffness: 180 } });
    const rot = localF * 5;

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
          position: 'relative',
        }}
      >
        {/* Rotating Globe SVG behind */}
        <svg width="220" height="220" style={{ position: 'absolute', opacity: 0.15, transform: `rotate(${rot}deg)` }}>
          <circle cx="110" cy="110" r="80" stroke="#38bdf8" strokeWidth="2" fill="none" />
          <ellipse cx="110" cy="110" rx="80" ry="32" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
          <ellipse cx="110" cy="110" rx="32" ry="80" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
        </svg>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: sp, zIndex: 2 }}>
          <span style={{ fontSize: 72, fontWeight: 700, color: '#FFFFFF', letterSpacing: -1.5 }}>
            {cat2}
          </span>
          <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 16px #38bdf8' }} />
        </div>
      </div>
    );
  }

  // Seg 10: 465 -> 486 (15.5s - 16.2s) "Illustrative." + Pen Drawing Path
  if (frame < 486) {
    const localF = frame - 465;
    const sp = spring({ frame: localF, fps, config: { damping: 18, stiffness: 180 } });

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: sp, zIndex: 2 }}>
          <span style={{ fontSize: 64, fontWeight: 700, color: '#FFFFFF', letterSpacing: -1.5 }}>
            {cat3}
          </span>
          <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 16px #38bdf8' }} />
        </div>
      </div>
    );
  }

  // Seg 11: 486 -> 528 (16.2s - 17.6s) "Motion & Explainer" + "Videos"
  if (frame < 528) {
    const localF = frame - 486;
    const sp1 = spring({ frame: localF, fps, config: { damping: 18, stiffness: 180 } });
    const sp2 = spring({ frame: Math.max(0, localF - 16), fps, config: { damping: 18, stiffness: 180 } });
    const ty2 = interpolate(sp2, [0, 1], [30, 0]);

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 700, color: '#FFFFFF', opacity: sp1, textAlign: 'center' }}>
          {cat4}
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: '#38bdf8', opacity: sp2, transform: `translateY(${ty2}px)`, marginTop: 8 }}>
          {cat4Sub}
        </div>
      </div>
    );
  }

  // Seg 12: 528 -> 798 (17.6s - 26.6s) 5-Video Scrolling Marquee Train (9.0s)
  if (frame < 798) {
    const localF = frame - 528;
    const progress = localF / (798 - 528);
    const translateY = progress * (-3480 + 1280);

    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#000000', overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            transform: `translateY(${translateY}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          {trainVideos.map((url: string, i: number) => (
            <div
              key={i}
              style={{
                width: 380,
                height: 676,
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Seg 13: 798 -> 834 (26.6s - 27.8s) "AI Audio Studio" Staggered Rise
  if (frame < 834) {
    const localF = frame - 798;
    const words = titlePrimary.split(' ');

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', fontSize: 68, fontWeight: 300, color: '#1d1d1f', letterSpacing: -1.5 }}>
          {words.map((w: string, idx: number) => (
            <span key={idx} style={{ display: 'inline-block', ...getWordStyle(idx, localF, 4) }}>
              {w}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Seg 14: 834 -> 876 (27.8s - 29.2s) 3 Tight Audio Taglines
  if (frame < 876) {
    const localF = frame - 834;
    const activeIdx = Math.min(Math.floor(localF / 14), audioTaglines.length - 1);
    const text = audioTaglines[activeIdx] || '';
    const sp = spring({ frame: localF % 14, fps, config: { damping: 18, stiffness: 200 } });

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 600, color: '#1d1d1f', opacity: sp, textAlign: 'center', padding: '0 24px' }}>
          {text}
        </div>
      </div>
    );
  }

  // Seg 15: 876 -> 921 (29.2s - 30.7s) 6 Country Flags Rapid Pop
  if (frame < 921) {
    const localF = frame - 876;
    const flags = ['🇺🇸 English', '🇻🇳 Tiếng Việt', '🇯🇵 日本語', '🇰🇷 한국어', '🇨🇳 中文', '🇩🇪 Deutsch'];
    const activeIdx = Math.min(Math.floor(localF / 7), flags.length - 1);
    const flag = flags[activeIdx];

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#1d1d1f',
            padding: '16px 32px',
            borderRadius: 24,
            backgroundColor: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {flag}
        </div>
      </div>
    );
  }

  // Seg 16: 921 -> 1191 (30.7s - 39.7s) Video 2 Feature Showcase (9.0s)
  if (frame < 1191) {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#000', overflow: 'hidden' }}>
        <video src={mainVideo2} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted playsInline />
      </div>
    );
  }

  // Seg 17: 1191 -> 1239 (39.7s - 41.3s) "A COMPLETE" / "VIDEO EDITOR." Staggered Rise
  if (frame < 1239) {
    const localF = frame - 1191;
    const sp1 = spring({ frame: localF, fps, config: { damping: 18, stiffness: 180 } });
    const sp2 = spring({ frame: Math.max(0, localF - 10), fps, config: { damping: 18, stiffness: 180 } });

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: 58, fontWeight: 700, color: '#1d1d1f', opacity: sp1 }}>
          {editorHeadline1}
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: '#1d1d1f', opacity: sp2, marginTop: 6 }}>
          {editorHeadline2}
        </div>
      </div>
    );
  }

  // Seg 18: 1239 -> 1389 (41.3s - 46.3s) Video 3 in Action (3s Fast + 2s Text Hold)
  if (frame < 1389) {
    const localF = frame - 1239;
    const isHoldPhase = localF >= 90; // Frame 90 = 3.0s

    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#000', overflow: 'hidden', position: 'relative' }}>
        <video src={mainVideo3} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted playsInline />
        {isHoldPhase && (
          <div
            style={{
              position: 'absolute',
              bottom: 120,
              left: 24,
              right: 24,
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(16px)',
              padding: '16px 24px',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF' }}>
              {editorEndingText}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Seg 19: 1389 -> 1449 (46.3s - 48.3s) Slogan with Green Price ($1)
  if (frame < 1449) {
    const localF = frame - 1389;
    const sp = spring({ frame: localF, fps, config: { damping: 18, stiffness: 180 } });

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
          padding: '0 32px',
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 600, color: '#1d1d1f', textAlign: 'center', opacity: sp }}>
          {sloganText}{' '}
          <span style={{ color: '#22c55e', fontWeight: 800 }}>{sloganPrice}</span>
        </div>
      </div>
    );
  }

  // Seg 20: 1449 -> 1539 (48.3s - 51.3s) Outro with Brand Logo + WynMotion + by WynAI
  const localF = frame - 1449;
  const sp = spring({ frame: localF, fps, config: { damping: 18, stiffness: 180 } });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      }}
    >
      <div
        style={{
          opacity: sp,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
            border: '2px solid rgba(0,0,0,0.06)',
            padding: 4,
            background: '#fff',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <img
            src={brandLogoUrl}
            alt="Brand Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 24 }}
          />
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, color: '#1d1d1f', letterSpacing: -2 }}>
          {brandName}
        </div>
        <div style={{ fontSize: 32, fontWeight: 300, color: '#1d1d1f', letterSpacing: 0.5, marginTop: 4 }}>
          by {brandCompany}
        </div>
      </div>
    </div>
  );
};
