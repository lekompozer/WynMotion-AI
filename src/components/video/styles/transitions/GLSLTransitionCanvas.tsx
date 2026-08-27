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

function buildFragmentShader(glslTransitionCode: string): string {
  return `
precision highp float;
varying vec2 _uv;
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform float ratio;

vec4 getFromColor(vec2 uv) {
  return texture2D(from, uv);
}

vec4 getToColor(vec2 uv) {
  return texture2D(to, uv);
}

// ─────────────────────────────────────────────────────────────
// GL-TRANSITION SHADER CODE
// ─────────────────────────────────────────────────────────────
${glslTransitionCode}

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
  const imgFromObj = useRef<HTMLImageElement | null>(null);
  const imgToObj = useRef<HTMLImageElement | null>(null);

  // Initialize WebGL Context and compile shader
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) return;
    glRef.current = gl;

    // Create shader program
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    const fsSource = buildFragmentShader(glslSource || 'vec4 transition(vec2 uv) { return mix(getFromColor(uv), getToColor(uv), progress); }');
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.warn('GLSL Shader compile error:', gl.getShaderInfoLog(fs));
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    programRef.current = program;

    // Set up quad buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Create textures
    const texFrom = gl.createTexture();
    const texTo = gl.createTexture();
    texFromRef.current = texFrom;
    texToRef.current = texTo;

    const loadTexture = (url: string, tex: WebGLTexture, isFrom: boolean) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        if (isFrom) imgFromObj.current = img;
        else imgToObj.current = img;
      };
      img.src = url;
    };

    if (fromImage) loadTexture(fromImage, texFrom!, true);
    if (toImage) loadTexture(toImage, texTo!, false);

    return () => {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteTexture(texFrom);
      gl.deleteTexture(texTo);
    };
  }, [glslSource, fromImage, toImage]);

  // Render on progress change
  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);

    // Bind uniforms
    const progLoc = gl.getUniformLocation(program, 'progress');
    const ratioLoc = gl.getUniformLocation(program, 'ratio');
    gl.uniform1f(progLoc, Math.min(1.0, Math.max(0.0, progress)));
    gl.uniform1f(ratioLoc, (width || 1080) / (height || 1920));

    // Bind from texture (unit 0)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texFromRef.current);
    gl.uniform1i(gl.getUniformLocation(program, 'from'), 0);

    // Bind to texture (unit 1)
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texToRef.current);
    gl.uniform1i(gl.getUniformLocation(program, 'to'), 1);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
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
        ...style,
      }}
    />
  );
};
