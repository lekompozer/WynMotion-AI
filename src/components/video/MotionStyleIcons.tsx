'use client';

import React from 'react';

interface StyleIconProps {
  className?: string;
  size?: number;
}

/**
 * 1. Whiteboard Stream Icon — Crisp monochrome whiteboard & marker stroke
 */
export const WhiteboardStreamIcon: React.FC<StyleIconProps> = ({ className = '', size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Whiteboard frame */}
    <rect x="5" y="6" width="38" height="26" rx="4" stroke="currentColor" strokeWidth="2.2" />
    <path d="M5 12H43" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
    {/* Fluid drawing wave */}
    <path
      d="M11 22C15 17 19 25 24 20C29 15 33 21 37 18"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <circle cx="37" cy="18" r="2" fill="currentColor" />
    {/* Marker pen */}
    <g transform="translate(26, 14) rotate(-35)">
      <rect x="0" y="0" width="5" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.8" fill="transparent" />
      <path d="M0.5 15L2.5 19L4.5 15Z" fill="currentColor" />
    </g>
    {/* Easel stand */}
    <path d="M14 32L10 42M34 32L38 42M12 37H36" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/**
 * 2. Doodle Quick Icon — Sketch pencil with doodle wave & spark
 */
export const DoodleQuickIcon: React.FC<StyleIconProps> = ({ className = '', size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Sketch pencil */}
    <g transform="translate(14, 8) rotate(32)">
      <rect x="0" y="0" width="8" height="24" rx="2" stroke="currentColor" strokeWidth="2.2" fill="transparent" />
      <path d="M0 6H8M0 18H8" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
      <path d="M0 24L4 30L8 24Z" fill="currentColor" />
      <path d="M0 -3H8V0H0Z" stroke="currentColor" strokeWidth="1.8" />
    </g>
    {/* Doodle quick spirals */}
    <path
      d="M8 36C14 30 20 40 26 34C32 28 38 36 42 32"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeDasharray="3 2"
    />
    {/* Spark */}
    <path d="M38 10L39 13L42 14L39 15L38 18L37 15L34 14L37 13L38 10Z" fill="currentColor" />
    <circle cx="10" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

/**
 * 3. Apple Modern Motion Icon — Kinetic floating glass cards
 */
export const AppleModernMotionIcon: React.FC<StyleIconProps> = ({ className = '', size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background card */}
    <rect
      x="8"
      y="7"
      width="24"
      height="30"
      rx="5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeOpacity="0.4"
      transform="rotate(-10 8 7)"
    />
    {/* Mid card */}
    <rect
      x="16"
      y="8"
      width="24"
      height="30"
      rx="5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeOpacity="0.6"
      transform="rotate(6 16 8)"
    />
    {/* Front main card */}
    <rect
      x="12"
      y="11"
      width="26"
      height="31"
      rx="6"
      stroke="currentColor"
      strokeWidth="2.2"
      fill="transparent"
    />
    {/* Content lines & play triangle */}
    <rect x="17" y="17" width="16" height="2.5" rx="1.25" fill="currentColor" />
    <rect x="17" y="23" width="10" height="2" rx="1" fill="currentColor" strokeOpacity="0.7" />
    <path d="M23 29L28 32.5L23 36Z" fill="currentColor" />
  </svg>
);

/**
 * 4. Mascot & Character Icon — Character face with expression
 */
export const CharacterAnimationIcon: React.FC<StyleIconProps> = ({ className = '', size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Head outline */}
    <circle cx="24" cy="23" r="16" stroke="currentColor" strokeWidth="2.2" />
    {/* Mascot ears / antennas */}
    <path d="M12 11L7 6M36 11L41 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="7" cy="6" r="2" fill="currentColor" />
    <circle cx="41" cy="6" r="2" fill="currentColor" />
    {/* Cute eyes */}
    <circle cx="18" cy="21" r="2.2" fill="currentColor" />
    <circle cx="30" cy="21" r="2.2" fill="currentColor" />
    {/* Winking smile */}
    <path d="M20 28C22 31 26 31 28 28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    {/* Body collar */}
    <path d="M14 39C16 36 32 36 34 39" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/**
 * 5. Dialogue Scene Icon — Two conversational speech bubbles
 */
export const DialogueSceneIcon: React.FC<StyleIconProps> = ({ className = '', size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Left speaker bubble */}
    <path
      d="M7 12C7 8.68629 9.68629 6 13 6H25C28.3137 6 31 8.68629 31 12V20C31 23.3137 28.3137 26 25 26H15L9 31V26H13C9.68629 26 7 23.3137 7 20V12Z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <circle cx="14" cy="16" r="1.5" fill="currentColor" />
    <circle cx="19" cy="16" r="1.5" fill="currentColor" />
    <circle cx="24" cy="16" r="1.5" fill="currentColor" />

    {/* Right responder bubble */}
    <path
      d="M21 24V28C21 31.3137 23.6863 34 27 34H35L41 39V34H37C40.3137 34 43 31.3137 43 28V20C43 16.6863 40.3137 14 37 14H33"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 6. Science Explainer Icon — Atom orbit, STEM flask & math formula
 */
export const ScienceExplainerIcon: React.FC<StyleIconProps> = ({ className = '', size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Atom orbital ellipses */}
    <ellipse cx="24" cy="24" rx="18" ry="7" stroke="currentColor" strokeWidth="2.2" transform="rotate(-30 24 24)" />
    <ellipse cx="24" cy="24" rx="18" ry="7" stroke="currentColor" strokeWidth="2.2" transform="rotate(30 24 24)" />
    {/* Nucleus */}
    <circle cx="24" cy="24" r="3.5" fill="currentColor" />
    {/* Orbiting electrons */}
    <circle cx="10" cy="16" r="2" fill="currentColor" />
    <circle cx="38" cy="32" r="2" fill="currentColor" />
    {/* Math plus and delta hint */}
    <path d="M38 10V16M35 13H41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * 7. Product & Brand Ads Icon — Sleek 3D showcase, commercial ribbon, kinetic wings & star sparkle
 */
export const ProductAdsIcon: React.FC<StyleIconProps> = ({ className = '', size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Commercial Product Package / Showcase */}
    <rect
      x="14"
      y="11"
      width="20"
      height="22"
      rx="4"
      stroke="currentColor"
      strokeWidth="2.2"
      fill="transparent"
    />
    {/* Product branding ribbon & center seal */}
    <path d="M14 19H34" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.5" />
    <circle cx="24" cy="25" r="3" stroke="currentColor" strokeWidth="1.8" />

    {/* Floating Commercial Stage / Pedestal base */}
    <ellipse cx="24" cy="40" rx="16" ry="4" stroke="currentColor" strokeWidth="2.2" />

    {/* Dynamic Kinetic Motion Flash & Speed Wings */}
    <path
      d="M7 20L11 22M6 26L10 26M37 22L41 20M38 26L42 26"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Sparkle Star */}
    <path d="M38 5L39 8L42 9L39 10L38 13L37 10L34 9L37 8L38 5Z" fill="currentColor" />
    <circle cx="9" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

/**
 * 8. Strobe Teaser & Big Reveal Icon — Strobe typography lightning flash
 */
export const StrobeTeaserIcon: React.FC<StyleIconProps> = ({ className = '', size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Strobe background box */}
    <rect x="6" y="6" width="36" height="36" rx="6" stroke="currentColor" strokeWidth="2.2" fill="transparent" />
    {/* Strobe lightning bolt */}
    <path
      d="M27 9L15 25H25L21 39L33 23H23L27 9Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Kinetic sound waves */}
    <path d="M9 16V32M39 16V32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/**
 * 9. Cinematic Showcase Reel Icon — Multi-panel film reel & luxury flare
 */
export const CinematicShowcaseIcon: React.FC<StyleIconProps> = ({ className = '', size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 3-Panel Split Gallery */}
    <rect x="6" y="8" width="10" height="32" rx="3" stroke="currentColor" strokeWidth="2" fill="transparent" />
    <rect x="19" y="8" width="10" height="32" rx="3" stroke="currentColor" strokeWidth="2.2" fill="transparent" />
    <rect x="32" y="8" width="10" height="32" rx="3" stroke="currentColor" strokeWidth="2" fill="transparent" />
    {/* Play / Showcase flare */}
    <path d="M22 20L28 24L22 28Z" fill="currentColor" />
    {/* Film perforations */}
    <circle cx="11" cy="13" r="1.5" fill="currentColor" />
    <circle cx="11" cy="35" r="1.5" fill="currentColor" />
    <circle cx="37" cy="13" r="1.5" fill="currentColor" />
    <circle cx="37" cy="35" r="1.5" fill="currentColor" />
  </svg>
);

export const MascotCharacterIcon = CharacterAnimationIcon;

