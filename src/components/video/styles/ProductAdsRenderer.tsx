'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from '../RemotionEngine';
import { DynamicSceneData } from '../DynamicSceneRenderer';

import { UniversalMotionPlayer } from './UniversalMotionPlayer';

export interface ProductAdsRendererProps {
  scene: DynamicSceneData;
  showSceneCards?: boolean;
  showWhisperSubs?: boolean;
}

export const ProductAdsRenderer: React.FC<ProductAdsRendererProps> = ({ scene }) => {
  const dynamicTimeline = (scene as any).dynamic_timeline;
  const allScenes = (scene as any).all_scenes || [scene];
  const sceneStartSec = (scene as any).start_sec || 0;

  // If AI Dynamic Timeline is present, use UniversalMotionPlayer
  if (dynamicTimeline && dynamicTimeline.timeline_blocks) {
    const productImages = allScenes.map((s: any) => s.original_image_url || s.image_url || '');
    const productCutouts = allScenes.map((s: any) => s.cutout_url || s.original_image_url || s.image_url || '');
    return (
      <UniversalMotionPlayer
        timeline={dynamicTimeline}
        productImages={productImages}
        productCutouts={productCutouts}
        sceneStartSec={sceneStartSec}
      />
    );
  }
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const totalFrames = durationInFrames || 450; // 15.0s @ 30fps

  const img1Bg = allScenes[0]?.original_image_url || allScenes[0]?.image_url || scene.original_image_url || scene.image_url;
  const img1Cut = allScenes[0]?.cutout_url || img1Bg;

  const img2Bg = allScenes[1]?.original_image_url || allScenes[1]?.image_url || img1Bg;
  const img2Cut = allScenes[1]?.cutout_url || img2Bg;

  const img3Bg = allScenes[2]?.original_image_url || allScenes[2]?.image_url || img2Bg;
  const img3Cut = allScenes[2]?.cutout_url || img3Bg;

  const dominantColors = (scene as any).dominant_colors || ['#FF0055', '#FFE600', '#00E5FF'];
  const primaryColor = dominantColors[0] || '#FF0055';
  const accentColor = dominantColors[1] || '#FFE600';

  const hookText = (scene as any).hook_text || 'HOT DEAL 2026';
  const priceText = (scene as any).price_text || 'MUA 1 TẶNG 1';
  const ctaText = (scene as any).cta_text || 'ĐẶT HÀNG NGAY';
  const userPrompt = (scene as any).visual_concept || scene.title || 'EXCLUSIVE PRODUCT';

  // ─────────────────────────────────────────────────────────────
  // PHASE 0: INTRO KINETIC TEXT (0.0s – 2.0s / frames 0..60)
  // ─────────────────────────────────────────────────────────────
  const isIntro = frame < 60;
  const introWords = ['ARE YOU READY?', 'HOT DEAL 2026', hookText];
  const wordIdx = Math.min(introWords.length - 1, Math.floor(frame / 20));
  const currentWord = introWords[wordIdx];
  const wordScale = 1 + 0.08 * Math.sin(frame * 0.4);
  const introOpacity = frame >= 55 ? interpolate(frame, [55, 60], [1, 0]) : 1;

  // ─────────────────────────────────────────────────────────────
  // PHASE 1: OBJECT 1 SLIDES FROM RIGHT ON BLACK -> BG 1 (2.0s – 5.5s / 60..165f)
  // ─────────────────────────────────────────────────────────────
  const isPhase1 = frame >= 60 && frame < 165;
  const isObj1Slide = frame >= 60 && frame < 82;
  const slideT1 = isObj1Slide ? Math.min(1, Math.max(0, (frame - 60) / 20)) : 1;
  const slideX1 = isObj1Slide ? interpolate(1 - Math.pow(1 - slideT1, 3), [0, 1], [650, 0]) : 0;
  const obj1Opacity = isObj1Slide ? interpolate(slideT1, [0, 0.15], [0, 1], { extrapolateRight: 'clamp' }) : 0;

  const isBg1Revealed = frame >= 82 && frame < 165;
  const sc1Prog = isBg1Revealed ? (frame - 82) / (165 - 82) : 0;
  const sc1Zoom = isBg1Revealed ? interpolate(sc1Prog, [0, 1], [1.0, 1.05]) : 1.0;

  const isGlitch1 = frame >= 145 && frame < 165;
  const gOffset1 = isGlitch1 ? Math.sin(frame * 1.5) * 16 * ((frame - 145) / 20) : 0;

  const sheen1Progress = interpolate(frame, [95, 130], [-120, 220], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sheen1Opacity = interpolate(frame, [95, 105, 120, 130], [0, 0.85, 0.85, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ─────────────────────────────────────────────────────────────
  // PHASE 2: OBJECT 2 SLIDES FROM BOTTOM OVER BG 1 -> BG 2 (5.5s – 9.0s / 165..270f)
  // ─────────────────────────────────────────────────────────────
  const isPhase2 = frame >= 165 && frame < 270;
  const isPhase2Obj2Stack = frame >= 165 && frame < 230;
  const push2T = isPhase2Obj2Stack ? Math.min(1, Math.max(0, (frame - 165) / 18)) : 0;
  const push2Y = isPhase2Obj2Stack ? interpolate(1 - Math.pow(1 - push2T, 3), [0, 1], [450, 0]) : 0;
  const float2Y = Math.sin(frame * 0.06) * 4;
  const tilt2 = Math.sin(frame * 0.05) * 0.8;
  const obj2Opacity = isPhase2Obj2Stack ? interpolate(push2T, [0, 0.15], [0, 1], { extrapolateRight: 'clamp' }) : 0;

  const push2Flash =
    frame >= 180 && frame <= 186
      ? interpolate(frame, [180, 186], [0, 0.8])
      : 0;

  const isBg2Revealed = frame >= 230 && frame < 270;
  const sc2Prog = isBg2Revealed ? (frame - 230) / (270 - 230) : 0;
  const sc2Zoom = isBg2Revealed ? interpolate(sc2Prog, [0, 1], [1.0, 1.05]) : 1.0;

  const isGlitch2 = frame >= 255 && frame < 270;
  const gOffset2 = isGlitch2 ? Math.sin(frame * 1.8) * 14 * ((frame - 255) / 15) : 0;

  const sheen2Progress = interpolate(frame, [195, 225], [-120, 220], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sheen2Opacity = interpolate(frame, [195, 205, 215, 225], [0, 0.85, 0.85, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ─────────────────────────────────────────────────────────────
  // PHASE 3: OBJECT 3 SLIDES FROM BOTTOM OVER BG 2 -> FLASH BLAST -> BG 3 (9.0s – 15.0s / 270..450f)
  // ─────────────────────────────────────────────────────────────
  const isPhase3 = frame >= 270;
  const isPhase3Obj3Stack = frame >= 270 && frame < 340;
  const push3T = isPhase3Obj3Stack ? Math.min(1, Math.max(0, (frame - 270) / 18)) : 0;
  const push3Y = isPhase3Obj3Stack ? interpolate(1 - Math.pow(1 - push3T, 3), [0, 1], [450, 0]) : 0;
  const float3Y = Math.sin(frame * 0.06) * 4;
  const tilt3 = Math.sin(frame * 0.05) * 0.8;
  const obj3Opacity = isPhase3Obj3Stack ? interpolate(push3T, [0, 0.15], [0, 1], { extrapolateRight: 'clamp' }) : (frame >= 340 && frame < 365 ? 1 : 0);

  const push3Flash =
    frame >= 285 && frame <= 292
      ? interpolate(frame, [285, 292], [0, 0.8])
      : 0;

  const isBlast3 = frame >= 340 && frame < 365;
  const blast3T = isBlast3 ? (frame - 340) / 25 : 0;
  const blast3Flash = isBlast3 ? (blast3T < 0.4 ? interpolate(blast3T, [0, 0.4], [0, 1.0]) : interpolate(blast3T, [0.4, 1.0], [1.0, 0])) : 0;
  const blast3SilOp = isBlast3 ? (blast3T < 0.5 ? interpolate(blast3T, [0, 0.5], [0, 1.0]) : interpolate(blast3T, [0.5, 1.0], [1.0, 0])) : 0;

  const isBg3Revealed = frame >= 365;
  const outroProg = isBg3Revealed ? (frame - 365) / (totalFrames - 365) : 0;
  const outroZoom = isBg3Revealed ? interpolate(outroProg, [0, 1], [1.05, 1.02]) : 1.0;
  const outroFloatY = Math.sin(frame * 0.05) * 4;
  const outroTilt = Math.sin(frame * 0.04) * 0.8;
  const outroCtaOp = isBg3Revealed ? interpolate(outroProg, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' }) : 0;
  const outroCtaY = isBg3Revealed ? interpolate(outroProg, [0, 0.35], [30, 0], { extrapolateRight: 'clamp' }) : 30;

  const sheen3Progress = interpolate(frame, [305, 335], [-120, 220], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sheen3Opacity = interpolate(frame, [305, 315, 325, 335], [0, 0.85, 0.85, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const sheen4Progress = interpolate(frame, [390, 425], [-120, 220], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sheen4Opacity = interpolate(frame, [390, 400, 415, 425], [0, 0.85, 0.85, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Active BG selection
  let currentBg = '';
  let currentBgScale = 1.0;
  let currentBgFilter = 'contrast(1.08) brightness(1.0)';

  if (isPhase1 && isBg1Revealed) {
    currentBg = img1Bg;
    currentBgScale = sc1Zoom;
  } else if (isPhase2) {
    if (isPhase2Obj2Stack) {
      currentBg = img1Bg;
      currentBgScale = 1.05;
      currentBgFilter = 'grayscale(60%) brightness(0.65) contrast(1.1)';
    } else {
      currentBg = img2Bg;
      currentBgScale = sc2Zoom;
    }
  } else if (isPhase3) {
    if (frame < 365) {
      currentBg = img2Bg;
      currentBgScale = 1.05;
      currentBgFilter = isBlast3 ? `brightness(${interpolate(blast3T, [0, 1], [0.65, 3.0])}) contrast(1.2)` : 'grayscale(60%) brightness(0.65) contrast(1.1)';
    } else {
      currentBg = img3Bg;
      currentBgScale = outroZoom;
    }
  }

  const globalFlashOp = Math.max(push2Flash, push3Flash, blast3Flash);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#000000',
        fontFamily: "'Impact', 'Montserrat', 'Arial Black', -apple-system, sans-serif",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          LAYER 1: Active Background Canvas (100% Canvas 1:1)
          ───────────────────────────────────────────────────────────── */}
      {!isIntro && currentBg && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${currentBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: isBg3Revealed
              ? `translateY(${outroFloatY}px) rotate(${outroTilt}deg) scale(${currentBgScale})`
              : `scale(${currentBgScale})`,
            filter: currentBgFilter,
          }}
        />
      )}

      {/* RGB Chromatic Ghosting Glitch */}
      {(isGlitch1 || isGlitch2) && currentBg && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${currentBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 0 12px #FF0055) hue-rotate(180deg)',
              transform: `scale(${currentBgScale}) translate(${-(isGlitch1 ? gOffset1 : gOffset2)}px, 0)`,
              opacity: 0.8,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${currentBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 0 12px #00FFFF) hue-rotate(90deg)',
              transform: `scale(${currentBgScale}) translate(${isGlitch1 ? gOffset1 : gOffset2}px, 0)`,
              opacity: 0.8,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 4px)',
              opacity: 0.65,
              pointerEvents: 'none',
              zIndex: 25,
            }}
          />
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 2A: Object 1 Sliding from RIGHT on Black BG (60..82f)
          ───────────────────────────────────────────────────────────── */}
      {isObj1Slide && img1Cut && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateX(${slideX1}px)`,
            opacity: obj1Opacity,
            pointerEvents: 'none',
            zIndex: 30,
          }}
        >
          <img
            src={img1Cut}
            alt="Hero Object 1"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.9))',
            }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 2B: Object 2 Sliding from BOTTOM & FLOATING on BG 1 (165..230f)
          ───────────────────────────────────────────────────────────── */}
      {isPhase2Obj2Stack && img2Cut && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${push2Y + float2Y}px) rotate(${tilt2}deg)`,
            opacity: obj2Opacity,
            pointerEvents: 'none',
            zIndex: 30,
          }}
        >
          <img
            src={img2Cut}
            alt="Hero Object 2"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.9))',
            }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 2C: Object 3 Sliding from BOTTOM & FLOATING on BG 2 (270..365f)
          ───────────────────────────────────────────────────────────── */}
      {frame >= 270 && frame < 365 && img3Cut && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${push3Y + float3Y}px) rotate(${tilt3}deg)`,
            opacity: obj3Opacity,
            pointerEvents: 'none',
            zIndex: 30,
          }}
        >
          <img
            src={img3Cut}
            alt="Hero Object 3"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.9))',
            }}
          />
        </div>
      )}

      {/* Silhouette Flash Blast on Transition (340..365f) */}
      {isBlast3 && img3Cut && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: blast3SilOp,
            pointerEvents: 'none',
            zIndex: 40,
          }}
        >
          <img
            src={img3Cut}
            alt="Silhouette Flash Blast"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0) invert(1) drop-shadow(0 0 60px #FFFFFF)',
            }}
          />
        </div>
      )}

      {/* Specular Light Sheen Scan */}
      {(sheen1Opacity > 0.01 || sheen2Opacity > 0.01 || sheen3Opacity > 0.01 || sheen4Opacity > 0.01) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${sheen1Opacity > 0.01 ? sheen1Progress : sheen2Opacity > 0.01 ? sheen2Progress : sheen3Opacity > 0.01 ? sheen3Progress : sheen4Progress}%`,
            width: '160px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)',
            transform: 'skewX(-25deg)',
            opacity: Math.max(sheen1Opacity, sheen2Opacity, sheen3Opacity, sheen4Opacity),
            pointerEvents: 'none',
            zIndex: 35,
          }}
        />
      )}

      {/* Fullscreen White Flash Transition Layer */}
      {globalFlashOp > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#FFFFFF',
            opacity: globalFlashOp,
            pointerEvents: 'none',
            zIndex: 80,
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 0: Intro Kinetic Text (0.0s – 2.0s)
          ───────────────────────────────────────────────────────────── */}
      {isIntro && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#000000',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 40px',
            textAlign: 'center',
            opacity: introOpacity,
          }}
        >
          <div
            style={{
              fontSize: '100px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              textShadow: '0 0 35px rgba(255,255,255,0.8), 0 10px 40px rgba(0,0,0,0.9)',
              lineHeight: 1.0,
              transform: `scale(${wordScale})`,
            }}
          >
            {currentWord}
          </div>
          <div
            style={{
              fontSize: '34px',
              fontWeight: 800,
              color: primaryColor,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginTop: '24px',
            }}
          >
            {hookText}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LAYER 4: Outro CTA Typography (12.2s – 15.0s)
          ───────────────────────────────────────────────────────────── */}
      {isBg3Revealed && (
        <div
          style={{
            position: 'absolute',
            bottom: '120px',
            left: '40px',
            right: '40px',
            zIndex: 90,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            opacity: outroCtaOp,
            transform: `translateY(${outroCtaY}px)`,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: '46px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textShadow: `0 4px 20px rgba(0,0,0,0.95), 0 0 30px ${primaryColor}`,
              lineHeight: 1.1,
              marginBottom: '16px',
              maxWidth: '90%',
            }}
          >
            {userPrompt}
          </div>
          <div
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
              color: '#000000',
              fontSize: '30px',
              fontWeight: 900,
              letterSpacing: '2px',
              padding: '10px 32px',
              borderRadius: '40px',
              textTransform: 'uppercase',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              marginBottom: '18px',
            }}
          >
            {priceText}
          </div>
          <div
            style={{
              background: '#FFFFFF',
              color: '#000000',
              fontSize: '24px',
              fontWeight: 900,
              letterSpacing: '3px',
              padding: '14px 44px',
              borderRadius: '50px',
              textTransform: 'uppercase',
              boxShadow: '0 12px 35px rgba(0,0,0,0.8), 0 0 30px rgba(255,255,255,0.7)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            ⚡ {ctaText} ➔
          </div>
        </div>
      )}
    </div>
  );
};
