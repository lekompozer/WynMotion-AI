'use client';

import React, { useRef, useEffect } from 'react';

export interface GLSLTransitionCanvasProps {
  fromImage: string;
  toImage: string;
  progress: number; // 0.0 to 1.0
  glslSource: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 _uv;
void main() {
  _uv = vec2(0.5, 0.5) * (position + vec2(1.0, 1.0));
  _uv.y = 1.0 - _uv.y; // Flip Y for canvas coords
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FALLBACK_TRANSITION = `
vec4 transition(vec2 uv) {
  return mix(getFromColor(uv), getToColor(uv), progress);
}
`;

function buildFragmentShader(glslTransitionCode: string): string {
  // Sanitize source code: Remove any duplicate precision or uniform declarations
  let cleanCode = glslTransitionCode || FALLBACK_TRANSITION;
  cleanCode = cleanCode.replace(/precision\s+(highp|mediump|lowp)\s+float\s*;/g, '');

  return `
#ifdef GL_ES
precision highp float;
#endif

varying vec2 _uv;
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform float ratio;

#define PI 3.141592653589793
#define PI2 6.283185307179586
#define M_PI 3.141592653589793

vec4 getFromColor(vec2 uv) {
  return texture2D(from, uv);
}

vec4 getToColor(vec2 uv) {
  return texture2D(to, uv);
}

// ─────────────────────────────────────────────────────────────
// GL-TRANSITION SHADER CODE
// ─────────────────────────────────────────────────────────────
${cleanCode}

void main() {
  gl_FragColor = transition(_uv);
}
`;
}

export const GLSLTransitionCanvas: React.FC<GLSLTransitionCanvasProps> = ({
  fromImage,
  toImage,
  progress,
  glslSource,
  width = 1080,
  height = 1920,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const texFromRef = useRef<WebGLTexture | null>(null);
  const texToRef = useRef<WebGLTexture | null>(null);
  const isLoadedFromRef = useRef<boolean>(false);
  const isLoadedToRef = useRef<boolean>(false);

  // Helper to compile a program safely
  const createProgram = (gl: WebGLRenderingContext, fsSourceCode: string): WebGLProgram | null => {
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fsSourceCode);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.warn('GLSL Shader compile error, falling back:', gl.getShaderInfoLog(fs));
      // Try fallback
      gl.shaderSource(fs, buildFragmentShader(FALLBACK_TRANSITION));
      gl.compileShader(fs);
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('GLSL Program link error:', gl.getProgramInfoLog(program));
      return null;
    }

    return program;
  };

  // Helper to upload image onto a WebGL texture
  const uploadImageToTexture = (gl: WebGLRenderingContext, texture: WebGLTexture, img: HTMLImageElement | HTMLCanvasElement) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  };

  // 1. Initialize WebGL Context and Quad Buffer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: true });
    if (!gl) return;
    glRef.current = gl;

    // Quad Buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    // Initial 1x1 Solid Fallback Textures (White for From, Blue for To)
    const texFrom = gl.createTexture()!;
    const texTo = gl.createTexture()!;
    texFromRef.current = texFrom;
    texToRef.current = texTo;

    gl.bindTexture(gl.TEXTURE_2D, texFrom);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

    gl.bindTexture(gl.TEXTURE_2D, texTo);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([56, 189, 248, 255]));

    return () => {
      if (programRef.current) gl.deleteProgram(programRef.current);
      gl.deleteTexture(texFrom);
      gl.deleteTexture(texTo);
    };
  }, []);

  // 2. Compile Program on Shader Source Change
  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;

    if (programRef.current) {
      gl.deleteProgram(programRef.current);
    }

    const fsCode = buildFragmentShader(glslSource);
    const newProg = createProgram(gl, fsCode);
    programRef.current = newProg;

    if (newProg) {
      const posAttr = gl.getAttribLocation(newProg, 'position');
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
    }
  }, [glslSource]);

  // 3. Load Textures when fromImage / toImage Change
  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;

    const loadTex = (url: string, targetTex: WebGLTexture, isFrom: boolean) => {
      if (!url) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const glCtx = glRef.current;
        if (!glCtx) return;
        uploadImageToTexture(glCtx, targetTex, img);
        if (isFrom) isLoadedFromRef.current = true;
        else isLoadedToRef.current = true;
        drawFrame();
      };
      img.src = url;
      if (img.complete) {
        uploadImageToTexture(gl, targetTex, img);
        if (isFrom) isLoadedFromRef.current = true;
        else isLoadedToRef.current = true;
      }
    };

    if (texFromRef.current && fromImage) {
      loadTex(fromImage, texFromRef.current, true);
    }
    if (texToRef.current && toImage) {
      loadTex(toImage, texToRef.current, false);
    }
  }, [fromImage, toImage]);

  // 4. Render Frame on Progress Change
  const drawFrame = () => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);

    // Bind uniforms
    const progLoc = gl.getUniformLocation(program, 'progress');
    const ratioLoc = gl.getUniformLocation(program, 'ratio');
    if (progLoc) gl.uniform1f(progLoc, Math.min(1.0, Math.max(0.0, progress)));
    if (ratioLoc) gl.uniform1f(ratioLoc, (width || 1080) / (height || 1920));

    // Texture From
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texFromRef.current);
    const fromLoc = gl.getUniformLocation(program, 'from');
    if (fromLoc) gl.uniform1i(fromLoc, 0);

    // Texture To
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texToRef.current);
    const toLoc = gl.getUniformLocation(program, 'to');
    if (toLoc) gl.uniform1i(toLoc, 1);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  useEffect(() => {
    drawFrame();
  }, [progress, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        ...style,
      }}
    />
  );
};
