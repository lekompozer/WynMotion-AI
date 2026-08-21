'use client';

import React from 'react';

interface StyleIconProps {
  className?: string;
  size?: number;
}

/**
 * 1. Whiteboard Stream Icon — Hand-drawn whiteboard marker pen & fluid path
 */
export const WhiteboardStreamIcon: React.FC<StyleIconProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="4" y="6" width="40" height="28" rx="6" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2.5" />
    <path d="M4 14H44" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="2 2" />
    <path
      d="M10 24C14 20 18 28 22 23C26 18 30 25 34 21"
      stroke="#2563EB"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="34" cy="21" r="2.5" fill="#60A5FA" />
    <g transform="translate(24, 18) rotate(-35)">
      <rect x="0" y="0" width="6" height="18" rx="2" fill="#2563EB" stroke="#0F172A" strokeWidth="2" />
      <path d="M0 4H6" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M1 18L3 23L5 18Z" fill="#0F172A" />
      <circle cx="3" cy="23" r="1" fill="#60A5FA" />
    </g>
    <path d="M16 34L12 42M32 34L36 42M14 38H34" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/**
 * 2. Doodle Quick Icon — Sketch pencil with soft watercolor wash
 */
export const DoodleQuickIcon: React.FC<StyleIconProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M8 20C6 12 16 6 24 8C32 10 42 16 40 26C38 36 28 42 18 40C8 38 10 28 8 20Z"
      fill="#CCFBF1"
      opacity="0.9"
    />
    <path
      d="M12 28C14 22 20 20 24 24C28 28 34 26 36 18"
      stroke="#0D9488"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="4 2"
    />
    <g transform="translate(18, 6) rotate(25)">
      <rect x="0" y="0" width="8" height="22" rx="2" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
      <path d="M0 6H8M0 16H8" stroke="#FDE68A" strokeWidth="1.5" />
      <path d="M0 22L4 28L8 22Z" fill="#FDE68A" stroke="#0F172A" strokeWidth="2" />
      <path d="M3 26.5L4 28L5 26.5Z" fill="#0F172A" />
      <rect x="0" y="-3" width="8" height="4" rx="1.5" fill="#F43F5E" stroke="#0F172A" strokeWidth="1.5" />
    </g>
    <path d="M38 10L39.5 14L43.5 15.5L39.5 17L38 21L36.5 17L32.5 15.5L36.5 14L38 10Z" fill="#F59E0B" />
  </svg>
);

/**
 * 3. Apple Modern Motion Icon — Kinetic glass cards & smooth layers
 */
export const AppleModernMotionIcon: React.FC<StyleIconProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="8"
      y="6"
      width="24"
      height="30"
      rx="6"
      fill="#E0F2FE"
      stroke="#38BDF8"
      strokeWidth="2"
      transform="rotate(-8 8 6)"
    />
    <rect
      x="14"
      y="8"
      width="24"
      height="30"
      rx="6"
      fill="#BAE6FD"
      stroke="#0284C7"
      strokeWidth="2"
      transform="rotate(6 14 8)"
    />
    <rect
      x="12"
      y="12"
      width="26"
      height="30"
      rx="7"
      fill="#FFFFFF"
      stroke="#0F172A"
      strokeWidth="2.5"
    />
    <rect x="17" y="18" width="16" height="3" rx="1.5" fill="#0284C7" />
    <rect x="17" y="24" width="11" height="2.5" rx="1.2" fill="#94A3B8" />
    <rect x="17" y="29" width="14" height="2.5" rx="1.2" fill="#CBD5E1" />
    <circle cx="34" cy="36" r="6" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M33 33.5L36.5 36L33 38.5V33.5Z" fill="#FFFFFF" />
  </svg>
);

/**
 * 4. Mascot Character Icon — 2D/3D Animated character face & energy
 */
export const MascotCharacterIcon: React.FC<StyleIconProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12 18L7 6L20 13Z" fill="#EA580C" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
    <path d="M11 16L9 9L17 13Z" fill="#FED7AA" />
    <path d="M36 18L41 6L28 13Z" fill="#EA580C" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
    <path d="M37 16L39 9L31 13Z" fill="#FED7AA" />
    <ellipse cx="24" cy="25" rx="17" ry="14" fill="#F97316" stroke="#0F172A" strokeWidth="2.5" />
    <path
      d="M10 27C10 27 13 35 24 35C35 35 38 27 38 27C38 31 34 37 24 37C14 37 10 31 10 27Z"
      fill="#FFFFFF"
    />
    <ellipse cx="17" cy="22" rx="3.5" ry="4.5" fill="#0F172A" />
    <circle cx="16" cy="20" r="1.5" fill="#FFFFFF" />
    <circle cx="18.5" cy="23.5" r="0.8" fill="#FFFFFF" />
    <ellipse cx="31" cy="22" rx="3.5" ry="4.5" fill="#0F172A" />
    <circle cx="30" cy="20" r="1.5" fill="#FFFFFF" />
    <circle cx="32.5" cy="23.5" r="0.8" fill="#FFFFFF" />
    <polygon points="24,27 22,25 26,25" fill="#0F172A" />
    <path d="M22 28.5C23 29.5 25 29.5 26 28.5" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M6 34L7 36.5L9.5 37.5L7 38.5L6 41L5 38.5L2.5 37.5L5 36.5L6 34Z" fill="#FBBF24" />
    <path d="M42 28L43 30L45 31L43 32L42 34L41 32L39 31L41 30L42 28Z" fill="#FBBF24" />
  </svg>
);

/**
 * 5. Dialogue Scene Icon — Two character speech bubbles & conversational exchange
 */
export const DialogueSceneIcon: React.FC<StyleIconProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Left Speaker Bubble (Cyan/Blue) */}
    <path
      d="M6 14C6 9.58172 9.58172 6 14 6H26C30.4183 6 34 9.58172 34 14V22C34 26.4183 30.4183 30 26 30H14L8 35V30C6.89543 30 6 29.1046 6 28V14Z"
      fill="#06B6D4"
      stroke="#0F172A"
      strokeWidth="2.2"
    />
    <rect x="12" y="13" width="16" height="2.5" rx="1.2" fill="#FFFFFF" />
    <rect x="12" y="19" width="10" height="2.5" rx="1.2" fill="#FFFFFF" opacity="0.8" />

    {/* Right Speaker Bubble (Purple/Pink) */}
    <path
      d="M42 22C42 17.5817 38.4183 14 34 14H22C17.5817 14 14 17.5817 14 22V30C14 34.4183 17.5817 38 22 38H34L40 43V38C41.1046 38 42 37.1046 42 36V22Z"
      fill="#A855F7"
      stroke="#0F172A"
      strokeWidth="2.2"
    />
    <rect x="20" y="21" width="16" height="2.5" rx="1.2" fill="#FFFFFF" />
    <rect x="20" y="27" width="12" height="2.5" rx="1.2" fill="#FFFFFF" opacity="0.8" />

    {/* Dialogue Wave Sparkle */}
    <circle cx="10" cy="8" r="2" fill="#FBBF24" />
    <circle cx="38" cy="11" r="1.5" fill="#38BDF8" />
  </svg>
);

/**
 * 6. Science Explainer Icon — Scientific atom model, mathematical formula & vector axis
 */
export const ScienceExplainerIcon: React.FC<StyleIconProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Scientific Grid Board */}
    <rect x="6" y="6" width="36" height="36" rx="8" fill="#1E1B4B" stroke="#0F172A" strokeWidth="2.5" />
    <path d="M14 6V42M24 6V42M34 6V42M6 14H42M6 24H42M6 34H42" stroke="#312E81" strokeWidth="1" strokeDasharray="2 2" />

    {/* Orbit 1 */}
    <ellipse cx="24" cy="24" rx="15" ry="6" stroke="#38BDF8" strokeWidth="2" transform="rotate(30 24 24)" />
    <circle cx="34" cy="18" r="2" fill="#38BDF8" />

    {/* Orbit 2 */}
    <ellipse cx="24" cy="24" rx="15" ry="6" stroke="#EC4899" strokeWidth="2" transform="rotate(-30 24 24)" />
    <circle cx="14" cy="18" r="2" fill="#EC4899" />

    {/* Nucleus Core */}
    <circle cx="24" cy="24" r="4.5" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.5" />

    {/* Math / Vector Arrow */}
    <path d="M12 36L20 28M20 28H15M20 28V33" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Formula Tag: a² + b² = c² hint */}
    <rect x="22" y="32" width="16" height="6" rx="2" fill="#6366F1" stroke="#0F172A" strokeWidth="1" />
    <path d="M25 35H35" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
