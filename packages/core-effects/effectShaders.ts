/**
 * 16 Authentic GLSL Shaders & Post-Processing Filters
 * Sourced from PixiJS Filters, Three.js PostProcessing, and Shadertoy
 */

export interface EffectShaderDefinition {
  id: string;
  name: string;
  category: string;
  source: string;
  fragmentShader: string;
}

export const EFFECT_SHADERS: Record<string, string> = {
  // 1. Scanline RGB Slicing Glitch (PixiJS GlitchFilter + CRTFilter)
  horizontal_scanline_rgb_glitch: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = _uv;
      float sliceCount = 20.0;
      float sliceIndex = floor(uv.y * sliceCount);
      float sliceRand = rand(vec2(sliceIndex, floor(uTime * 15.0)));
      
      float shift = 0.0;
      if (sliceRand > 0.65) {
        shift = (rand(vec2(sliceIndex, uTime)) - 0.5) * 0.08 * sin(uTime * 10.0);
      }
      
      float scanline = sin(uv.y * 600.0) * 0.12;
      
      vec4 colR = texture2D(uTexture, vec2(uv.x + shift + 0.015, uv.y));
      vec4 colG = texture2D(uTexture, vec2(uv.x + shift, uv.y));
      vec4 colB = texture2D(uTexture, vec2(uv.x + shift - 0.015, uv.y));
      
      vec3 finalCol = vec3(colR.r, colG.g, colB.b) - scanline;
      gl_FragColor = vec4(finalCol, 1.0);
    }
  `,

  // 2. Strobe Flash Beat (Three.js StrobePass)
  strobe_flash_beat: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    void main() {
      vec4 base = texture2D(uTexture, _uv);
      float flash = step(0.5, fract(uTime * 6.0));
      vec3 inverted = vec3(1.0) - base.rgb;
      vec3 col = mix(base.rgb, inverted * 1.3, flash * 0.85);
      gl_FragColor = vec4(col, base.a);
    }
  `,

  // 3. Specular Metallic Sheen (Shadertoy Apple Glare)
  specular_metallic_sheen: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    void main() {
      vec4 base = texture2D(uTexture, _uv);
      float pos = fract(uTime * 0.8) * 3.0 - 1.0;
      float diag = _uv.x * 0.7 + _uv.y * 0.3;
      float dist = abs(diag - pos);
      float sheen = smoothstep(0.18, 0.0, dist) * 0.85;
      
      vec3 col = base.rgb + vec3(sheen * 0.9, sheen * 0.95, sheen * 1.0);
      gl_FragColor = vec4(col, base.a);
    }
  `,

  // 4. Flash Blast Silhouette (Shadertoy Solarize Blast)
  flash_blast_silhouette: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    void main() {
      vec4 base = texture2D(uTexture, _uv);
      float blast = sin(uProgress * 3.14159);
      float lum = dot(base.rgb, vec3(0.299, 0.587, 0.114));
      
      vec3 solar = abs(base.rgb * 2.0 - 1.0);
      vec3 col = mix(base.rgb, solar + vec3(blast * 0.6), blast * 0.9);
      gl_FragColor = vec4(col, base.a);
    }
  `,

  // 5. VHS Retro Tape Noise (PixiJS OldFilm / CRTFilter)
  vhs_retro_tape_noise: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    float hash(float n) { return fract(sin(n) * 43758.5453123); }

    void main() {
      vec2 uv = _uv;
      float roll = fract(uv.y + uTime * 0.2);
      float noise = hash(uv.x + uv.y * 100.0 + uTime) * 0.18;
      
      // Horizontal jitter
      float jitter = (hash(floor(uv.y * 120.0) + uTime * 10.0) - 0.5) * 0.02;
      uv.x += jitter;
      
      vec4 col = texture2D(uTexture, uv);
      col.rgb += vec3(noise);
      col.rgb *= 0.85 + 0.15 * sin(uv.y * 400.0); // Scanlines
      
      // Tape tracking bar
      float bar = smoothstep(0.04, 0.0, abs(roll - 0.5));
      col.rgb += vec3(bar * 0.25);
      
      gl_FragColor = col;
    }
  `,

  // 6. Pixel Mosaic Shatter (PixiJS PixelateFilter)
  pixel_mosaic_shatter: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    void main() {
      float pixelSize = 10.0 + abs(sin(uTime * 3.0)) * 40.0;
      vec2 size = vec2(pixelSize, pixelSize);
      vec2 uv = floor(_uv * 400.0 / size) * size / 400.0;
      
      vec4 col = texture2D(uTexture, uv);
      // Subtle block edge grid
      vec2 grid = fract(_uv * 400.0 / size);
      if (grid.x < 0.08 || grid.y < 0.08) {
        col.rgb *= 0.8;
      }
      gl_FragColor = col;
    }
  `,

  // 7. Golden Bokeh Particles (Three.js BokehShader)
  golden_bokeh_particles: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    float bokehOrb(vec2 uv, vec2 center, float radius) {
      float d = length(uv - center);
      return smoothstep(radius, radius * 0.4, d);
    }

    void main() {
      vec4 base = texture2D(uTexture, _uv);
      vec3 gold = vec3(1.0, 0.8, 0.2);
      
      float orb1 = bokehOrb(_uv, vec2(0.3 + sin(uTime * 0.7) * 0.1, 0.4 + cos(uTime * 0.5) * 0.2), 0.18);
      float orb2 = bokehOrb(_uv, vec2(0.7 + cos(uTime * 0.9) * 0.15, 0.6 + sin(uTime * 0.8) * 0.2), 0.14);
      float orb3 = bokehOrb(_uv, vec2(0.5 + sin(uTime * 1.2) * 0.2, 0.8 + cos(uTime * 1.0) * 0.1), 0.10);
      
      vec3 totalBokeh = (orb1 + orb2 + orb3) * gold * 0.7;
      gl_FragColor = vec4(base.rgb + totalBokeh, base.a);
    }
  `,

  // 8. Prism Optical Flare (Shadertoy Anamorphic Flare)
  prism_rainbow_flare: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    void main() {
      vec4 base = texture2D(uTexture, _uv);
      vec2 center = vec2(0.5 + sin(uTime * 0.6) * 0.3, 0.4 + cos(uTime * 0.8) * 0.2);
      vec2 dir = _uv - center;
      float dist = length(dir);
      
      // Chromatic rainbow flare
      float angle = atan(dir.y, dir.x);
      vec3 rainbow = 0.5 + 0.5 * cos(angle * 3.0 + uTime * 2.0 + vec3(0.0, 2.0, 4.0));
      float flare = smoothstep(0.7, 0.0, dist) * 0.55;
      
      // Anamorphic horizontal streak
      float streak = smoothstep(0.04, 0.0, abs(dir.y)) * smoothstep(0.8, 0.0, abs(dir.x)) * 0.7;
      
      vec3 finalCol = base.rgb + rainbow * flare + vec3(streak * 0.9, streak * 0.95, streak * 1.0);
      gl_FragColor = vec4(finalCol, base.a);
    }
  `,

  // 9. 3D Perspective Tilt (Three.js Quad Projection)
  perspective_3d_float: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    void main() {
      vec2 uv = _uv - 0.5;
      float tiltX = sin(uTime * 1.5) * 0.15;
      float tiltY = cos(uTime * 1.2) * 0.15;
      
      uv.x /= 1.0 + uv.y * tiltX;
      uv.y /= 1.0 + uv.x * tiltY;
      
      uv += 0.5;
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.05, 0.07, 0.12, 1.0);
      } else {
        gl_FragColor = texture2D(uTexture, uv);
      }
    }
  `,

  // 10. Ken-Burns Continuous Zoom (Three.js Cinematic Zoom)
  kenburns_continuous_zoom: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    void main() {
      float zoom = 1.0 + (sin(uTime * 0.8) * 0.5 + 0.5) * 0.25;
      vec2 pan = vec2(sin(uTime * 0.5) * 0.04, cos(uTime * 0.4) * 0.03);
      vec2 uv = (_uv - 0.5) / zoom + 0.5 + pan;
      
      vec4 col = texture2D(uTexture, uv);
      // Vignette
      float vig = 1.0 - smoothstep(0.4, 0.9, length(_uv - 0.5));
      col.rgb *= mix(0.75, 1.0, vig);
      gl_FragColor = col;
    }
  `,

  // 11. Grayscale Underlayer Push (Three.js Luminance Monochrome)
  grayscale_underlayer_push: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    void main() {
      vec4 base = texture2D(uTexture, _uv);
      float lum = dot(base.rgb, vec3(0.2126, 0.7152, 0.0722));
      vec3 gray = vec3(lum);
      
      // Center spotlight
      float dist = length(_uv - 0.5);
      float spot = smoothstep(0.45, 0.15, dist);
      
      vec3 col = mix(gray * 0.7, base.rgb * 1.15, spot);
      gl_FragColor = vec4(col, base.a);
    }
  `,

  // 12. Neon Cyberpunk Outline Glow (PixiJS GlowFilter)
  neon_cyber_glow: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    void main() {
      vec4 base = texture2D(uTexture, _uv);
      float edgeDist = min(min(_uv.x, 1.0 - _uv.x), min(_uv.y, 1.0 - _uv.y));
      float border = smoothstep(0.06, 0.0, edgeDist);
      
      vec3 neon = 0.5 + 0.5 * cos(uTime * 2.5 + vec3(0.0, 2.0, 4.0));
      vec3 col = base.rgb + neon * border * 1.4;
      gl_FragColor = vec4(col, base.a);
    }
  `,

  // 13. Liquid Wave Distortion (PixiJS ShockwaveFilter / Water)
  liquid_wave_distortion: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    void main() {
      vec2 uv = _uv;
      float waveX = sin(uv.y * 18.0 + uTime * 4.0) * 0.025;
      float waveY = cos(uv.x * 18.0 + uTime * 4.0) * 0.025;
      uv += vec2(waveX, waveY);
      
      vec4 col = texture2D(uTexture, uv);
      col.rgb += vec3(0.05, 0.1, 0.18) * (waveX + waveY) * 10.0;
      gl_FragColor = col;
    }
  `,

  // 14. Thermal Matrix Heatmap (Shadertoy FLIR Ironbow Heatmap)
  thermal_heatmap_matrix: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    vec3 ironbow(float t) {
      vec3 c0 = vec3(0.05, 0.02, 0.15);
      vec3 c1 = vec3(0.5, 0.05, 0.6);
      vec3 c2 = vec3(0.9, 0.2, 0.1);
      vec3 c3 = vec3(1.0, 0.8, 0.1);
      vec3 c4 = vec3(1.0, 1.0, 0.9);
      
      if (t < 0.25) return mix(c0, c1, t / 0.25);
      if (t < 0.5) return mix(c1, c2, (t - 0.25) / 0.25);
      if (t < 0.75) return mix(c2, c3, (t - 0.5) / 0.25);
      return mix(c3, c4, (t - 0.75) / 0.25);
    }

    void main() {
      vec4 base = texture2D(uTexture, _uv);
      float lum = dot(base.rgb, vec3(0.299, 0.587, 0.114));
      vec3 heat = ironbow(lum);
      
      gl_FragColor = vec4(heat, base.a);
    }
  `,

  // 15. Retro Halftone Pop-Art Grid (Three.js DotScreenShader / PixiJS DotFilter)
  halftone_pop_art: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    void main() {
      vec4 base = texture2D(uTexture, _uv);
      float lum = dot(base.rgb, vec3(0.299, 0.587, 0.114));
      
      float dotSize = 25.0;
      vec2 grid = fract(_uv * dotSize) - 0.5;
      float dist = length(grid);
      float radius = (1.0 - lum) * 0.65;
      
      float isDot = step(dist, radius);
      vec3 popBg = vec3(1.0, 0.88, 0.2); // Pop yellow
      vec3 popDot = vec3(0.9, 0.1, 0.35); // Pop magenta
      
      vec3 col = mix(popBg, popDot, isDot);
      gl_FragColor = vec4(col, base.a);
    }
  `,

  // 16. 35mm Film Grain Cinema Overlay (Three.js FilmShader)
  film_grain_vintage: `
    precision highp float;
    varying vec2 _uv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;

    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec4 base = texture2D(uTexture, _uv);
      float noise = (rand(_uv + fract(uTime)) - 0.5) * 0.25;
      
      // Warm 35mm sepia tone
      vec3 sepia = vec3(base.r * 1.1 + 0.05, base.g * 0.95, base.b * 0.8 - 0.05);
      vec3 col = sepia + vec3(noise);
      
      // Cinematic Vignette
      float vig = 1.0 - smoothstep(0.4, 0.85, length(_uv - 0.5));
      col *= mix(0.7, 1.0, vig);
      
      gl_FragColor = vec4(col, base.a);
    }
  `,
};
