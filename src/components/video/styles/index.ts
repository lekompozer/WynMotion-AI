'use client';

import React from 'react';
import { StyleRendererProps, DialogueSceneRenderer } from './DialogueSceneRenderer';
import { AppleModernRenderer } from './AppleModernRenderer';
import { ScienceExplainerRenderer } from './ScienceExplainerRenderer';
import { CharacterMascotRenderer } from './CharacterMascotRenderer';
import { ProductAdsRenderer } from './ProductAdsRenderer';
import { StrobeTeaserRenderer } from './StrobeTeaserRenderer';
import { CinematicShowcaseRenderer } from './CinematicShowcaseRenderer';
import { NewsVideoRenderer } from './NewsVideoRenderer';

export {
  DialogueSceneRenderer,
  AppleModernRenderer,
  ScienceExplainerRenderer,
  CharacterMascotRenderer,
  ProductAdsRenderer,
  StrobeTeaserRenderer,
  CinematicShowcaseRenderer,
  NewsVideoRenderer,
};
export type { StyleRendererProps };

/**
 * Registry of modular visual style renderers.
 */
export const MODULAR_STYLE_RENDERERS: Record<string, React.FC<StyleRendererProps>> = {
  dialogue_scene: DialogueSceneRenderer,
  conversation: DialogueSceneRenderer,
  podcast_dual: DialogueSceneRenderer,
  apple_modern_motion: AppleModernRenderer,
  tech_ui: AppleModernRenderer,
  vector_motion: AppleModernRenderer,
  science_explainer: ScienceExplainerRenderer,
  stem_explainer: ScienceExplainerRenderer,
  character_animation: CharacterMascotRenderer,
  mascot_character: CharacterMascotRenderer,
  stickman: CharacterMascotRenderer,
  product_ads_motion: ProductAdsRenderer as any,
  brand_billboard_ads: ProductAdsRenderer as any,
  fnb_ads: ProductAdsRenderer as any,
  capcut_ads: ProductAdsRenderer as any,
  product_ads: ProductAdsRenderer as any,
  brand_ads: ProductAdsRenderer as any,
  commercial_ads: ProductAdsRenderer as any,
  ads_strobe_teaser: StrobeTeaserRenderer as any,
  strobe_teaser: StrobeTeaserRenderer as any,
  ads_cinematic_showcase: CinematicShowcaseRenderer as any,
  cinematic_showcase: CinematicShowcaseRenderer as any,
  video_news_60s: NewsVideoRenderer as any,
  news_video: NewsVideoRenderer as any,
  video_news: NewsVideoRenderer as any,
  breaking_news: NewsVideoRenderer as any,
};

export function getModularStyleRenderer(visualStyle?: string): React.FC<StyleRendererProps> | null {
  if (!visualStyle) return null;
  const key = visualStyle.toLowerCase();
  return MODULAR_STYLE_RENDERERS[key] || null;
}
