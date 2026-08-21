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
    {/* Whiteboard Slate Background */}
    <rect x="4" y="6" width="40" height="28" rx="6" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2.5" />
    <path d="M4 14H44" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="2 2" />
    
    {/* Animated stroke path on board */}
    <path
      d="M10 24C14 20 18 28 22 23C26 18 30 25 34 21"
      stroke="#2563EB"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="34" cy="21" r="2.5" fill="#60A5FA" />
    
    {/* Marker Pen */}
    <g transform="translate(24, 18) rotate(-35)">
      <rect x="0" y="0" width="6" height="18" rx="2" fill="#2563EB" stroke="#0F172A" strokeWidth="2" />
      <path d="M0 4H6" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M1 18L3 23L5 18Z" fill="#0F172A" />
      <circle cx="3" cy="23" r="1" fill="#60A5FA" />
    </g>
    
    {/* Stand Leg */}
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
    {/* Watercolor splash background bubble */}
    <path
      d="M8 20C6 12 16 6 24 8C32 10 42 16 40 26C38 36 28 42 18 40C8 38 10 28 8 20Z"
      fill="#CCFBF1"
      opacity="0.9"
    />
    
    {/* Sketch swirls */}
    <path
      d="M12 28C14 22 20 20 24 24C28 28 34 26 36 18"
      stroke="#0D9488"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="4 2"
    />
    
    {/* Stylized Pencil */}
    <g transform="translate(18, 6) rotate(25)">
      <rect x="0" y="0" width="8" height="22" rx="2" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
      <path d="M0 6H8M0 16H8" stroke="#FDE68A" strokeWidth="1.5" />
      <path d="M0 22L4 28L8 22Z" fill="#FDE68A" stroke="#0F172A" strokeWidth="2" />
      <path d="M3 26.5L4 28L5 26.5Z" fill="#0F172A" />
      <rect x="0" y="-3" width="8" height="4" rx="1.5" fill="#F43F5E" stroke="#0F172A" strokeWidth="1.5" />
    </g>

    {/* Creative sparkle */}
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
    {/* Back layer card */}
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
    
    {/* Middle layer card */}
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
    
    {/* Front Glassmorphism card */}
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
    
    {/* Content lines inside front card */}
    <rect x="17" y="18" width="16" height="3" rx="1.5" fill="#0284C7" />
    <rect x="17" y="24" width="11" height="2.5" rx="1.2" fill="#94A3B8" />
    <rect x="17" y="29" width="14" height="2.5" rx="1.2" fill="#CBD5E1" />
    
    {/* Kinetic Play Spark */}
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
    {/* Mascot Fox Ears */}
    <path d="M12 18L7 6L20 13Z" fill="#EA580C" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
    <path d="M11 16L9 9L17 13Z" fill="#FED7AA" />
    
    <path d="M36 18L41 6L28 13Z" fill="#EA580C" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
    <path d="M37 16L39 9L31 13Z" fill="#FED7AA" />

    {/* Mascot Head */}
    <ellipse cx="24" cy="25" rx="17" ry="14" fill="#F97316" stroke="#0F172A" strokeWidth="2.5" />
    
    {/* White Cheeks */}
    <path
      d="M10 27C10 27 13 35 24 35C35 35 38 27 38 27C38 31 34 37 24 37C14 37 10 31 10 27Z"
      fill="#FFFFFF"
    />
    
    {/* Big Anime Eyes */}
    <ellipse cx="17" cy="22" rx="3.5" ry="4.5" fill="#0F172A" />
    <circle cx="16" cy="20" r="1.5" fill="#FFFFFF" />
    <circle cx="18.5" cy="23.5" r="0.8" fill="#FFFFFF" />
    
    <ellipse cx="31" cy="22" rx="3.5" ry="4.5" fill="#0F172A" />
    <circle cx="30" cy="20" r="1.5" fill="#FFFFFF" />
    <circle cx="32.5" cy="23.5" r="0.8" fill="#FFFFFF" />
    
    {/* Nose & Smile */}
    <polygon points="24,27 22,25 26,25" fill="#0F172A" />
    <path d="M22 28.5C23 29.5 25 29.5 26 28.5" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />

    {/* Motion Sparkles */}
    <path d="M6 34L7 36.5L9.5 37.5L7 38.5L6 41L5 38.5L2.5 37.5L5 36.5L6 34Z" fill="#FBBF24" />
    <path d="M42 28L43 30L45 31L43 32L42 34L41 32L39 31L41 30L42 28Z" fill="#FBBF24" />
  </svg>
);
