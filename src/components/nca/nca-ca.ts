/**
 * Neural Cellular Automata WebGL Implementation
 * Ported from Google's Growing NCA (Apache 2.0 License)
 * https://github.com/distillpub/post--growing-ca
 *
 * Original authors: Alexander Mordvintsev, et al.
 */

import * as twgl from 'twgl.js';

const CHANNEL_N = 16;
const MAX_ACTIVATION_VALUE = 10.0;

// Vertex shader - fullscreen quad
const VS_CODE = `
  attribute vec4 position;
  varying vec2 uv;
  void main() {
    uv = position.xy * 0.5 + 0.5;
    gl_Position = position;
  }
`;

// Helper to define tensor input uniforms
function defInput(name: string): string {
  return `
    uniform Tensor ${name};
    uniform sampler2D ${name}_tex;

    vec4 ${name}_read(vec2 pos, float ch) {
      return _read(${name}, ${name}_tex, pos, ch);
    }
    vec4 ${name}_readUV(vec2 uv) {
      return _readUV(${name}, ${name}_tex, uv);
    }
  `;
}

// Common GLSL prefix for all fragment shaders
const PREFIX = `
  precision highp float;

  struct Tensor {
    vec2 size;
    vec2 gridSize;
    float depth, depth4;
    vec2 packScaleBias;
  };
  uniform Tensor u_output;

  vec4 _readUV(Tensor tensor, sampler2D tex, vec2 uv) {
    vec4 v = texture2D(tex, uv);
    vec2 p = tensor.packScaleBias;
    v = tan((v - p.y) * p.x);
    return v;
  }

  vec4 _read(Tensor tensor, sampler2D tex, vec2 pos, float ch) {
    vec2 p = fract(pos / tensor.size);
    ch += 0.5;
    float tx = floor(mod(ch, tensor.gridSize.x));
    float ty = floor(ch / tensor.gridSize.x);
    p += vec2(tx, ty);
    return _readUV(tensor, tex, p / tensor.gridSize);
  }

  vec2 getOutputXY() {
    return mod(gl_FragCoord.xy, u_output.size);
  }

  float getOutputChannel() {
    vec2 xy = floor(gl_FragCoord.xy / u_output.size);
    return xy.y * u_output.gridSize.x + xy.x;
  }

  void setOutput(vec4 v) {
    vec2 p = u_output.packScaleBias;
    v = atan(v) / p.x + p.y;
    gl_FragColor = v;
  }

  ${defInput('u_input')}
`;

// Fragment shaders for each operation
const PROGRAMS: Record<string, string> = {
  paint: `
    uniform vec2 u_pos;
    uniform float u_r;
    uniform float u_brush;

    void main() {
      vec2 diff = abs(getOutputXY() - u_pos + 0.5);
      diff = min(diff, u_output.size - diff);
      if (length(diff) >= u_r)
        discard;
      vec4 result = vec4(0.0);
      if (u_brush > 0.5) {
        float ch = getOutputChannel();
        result = vec4(vec3(float(ch > 0.5)), 1.0);
      }
      setOutput(result);
    }
  `,

  perception: `
    uniform float u_angle;
    const mat3 sobel = mat3(-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -1.0, 0.0, 1.0) / 8.0;

    void main() {
      vec2 xy = getOutputXY();
      float ch = getOutputChannel();
      float filterBand = floor(ch / u_input.depth4);
      float inputCh = mod(ch, u_input.depth4);

      if (filterBand == 0.0) {
        setOutput(u_input_read(xy, inputCh));
      } else {
        vec4 dx = vec4(0.0), dy = vec4(0.0);
        for (int y = 0; y < 3; ++y)
        for (int x = 0; x < 3; ++x) {
          vec2 p = xy + vec2(float(x - 1), float(y - 1));
          vec4 a = u_input_read(p, inputCh);
          dx += sobel[y][x] * a;
          dy += sobel[x][y] * a;
        }
        float s = sin(u_angle), c = cos(u_angle);
        setOutput(filterBand == 1.0 ? dx * c - dy * s : dx * s + dy * c);
      }
    }
  `,

  dense: `
    uniform sampler2D u_weightTex;
    uniform vec3 u_weightCoefs; // weightScale, biasScale, center

    const float MAX_PACKED_DEPTH = 32.0;

    vec4 readWeight(vec2 p) {
      vec4 w = texture2D(u_weightTex, p);
      return (w - u_weightCoefs.z) * u_weightCoefs.x;
    }

    vec4 readBias(vec2 p) {
      vec4 w = texture2D(u_weightTex, p);
      return (w - u_weightCoefs.z) * u_weightCoefs.y;
    }

    void main() {
      vec2 xy = getOutputXY();
      float ch = getOutputChannel();
      if (ch >= u_output.depth4)
        return;

      float dy = 1.0 / (u_input.depth + 1.0);
      vec2 p = vec2((ch + 0.5) / u_output.depth4, dy * 0.5);
      vec4 result = vec4(0.0);

      for (float i = 0.0; i < MAX_PACKED_DEPTH; i += 1.0) {
        vec4 inVec = u_input_read(xy, i);
        result += inVec.x * readWeight(p); p.y += dy;
        result += inVec.y * readWeight(p); p.y += dy;
        result += inVec.z * readWeight(p); p.y += dy;
        result += inVec.w * readWeight(p); p.y += dy;
        if (i + 1.5 > u_input.depth4) {
          break;
        }
      }
      result += readBias(p); // bias
      setOutput(result);
    }
  `,

  dropout: `
    uniform float u_seed, u_updateProbability;
    varying vec2 uv;

    // "Hash without Sine" by David Hoskins
    float hash13(vec3 p3) {
      p3 = fract(p3 * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    void main() {
      vec2 xy = getOutputXY();
      vec4 result = u_input_readUV(uv);
      result *= float(hash13(vec3(xy, u_seed)) <= u_updateProbability);
      setOutput(result);
    }
  `,

  update: `
    ${defInput('u_update')}

    varying vec2 uv;

    void main() {
      vec2 xy = getOutputXY();
      float preMaxAlpha = 0.0, postMaxAlpha = 0.0;

      for (float y = -1.0; y <= 1.0; ++y)
      for (float x = -1.0; x <= 1.0; ++x) {
        vec2 p = xy + vec2(x, y);
        float preAlpha = u_input_read(p, 0.0).a;
        float updateAlpha = u_update_read(p, 0.0).a;
        float postAlpha = preAlpha + updateAlpha;
        preMaxAlpha = max(preAlpha, preMaxAlpha);
        postMaxAlpha = max(postAlpha, postMaxAlpha);
      }

      if (min(preMaxAlpha, postMaxAlpha) < 0.1) {
        setOutput(vec4(0.0));
        return;
      }

      vec4 state = u_input_readUV(uv);
      vec4 update = u_update_readUV(uv);
      setOutput(state + update);
    }
  `,

  vis: `
    uniform float u_raw;
    uniform vec3 u_lastDamage;
    uniform float u_transparent;
    varying vec2 uv;

    void main() {
      vec2 xy = vec2(uv.x, 1.0 - uv.y);
      if (u_raw > 0.5) {
        gl_FragColor = texture2D(u_input_tex, xy);
        gl_FragColor.a = 1.0;
      } else {
        xy *= u_input.size;
        vec4 rgba = u_input_read(xy, 0.0);

        // Transparent mode: output with alpha for compositing over any background
        // Opaque mode: composite over white (original behavior)
        if (u_transparent > 0.5) {
          gl_FragColor = vec4(rgba.rgb, rgba.a);
        } else {
          gl_FragColor = 1.0 - rgba.a + rgba;
        }

        // Damage highlight effect
        vec2 diff = abs(xy - u_lastDamage.xy + 0.5);
        diff = min(diff, u_input.size - diff);
        if (length(diff) < u_lastDamage.z) {
          gl_FragColor.rgb *= 0.7;
          gl_FragColor.rgb += vec3(0.3, 0.3, 0.0) * (u_transparent > 0.5 ? rgba.a : 1.0);
        }
      }
    }
  `,
};

// Types
export interface LayerWeights {
  data_b64: string;
  in_ch: number;
  out_ch: number;
  weight_scale: number;
  bias_scale: number;
  type: string;
}

interface Tensor {
  _type: 'tensor';
  fbi: twgl.FramebufferInfo;
  w: number;
  h: number;
  depth: number;
  gridW: number;
  gridH: number;
  depth4: number;
  tex: WebGLTexture;
  activation?: string;
  packScaleBias: [number, number];
}

interface DenseInfo {
  tex: WebGLTexture;
  coefs: [number, number, number];
}

export interface NCA {
  reset: () => void;
  step: () => void;
  draw: (visMode?: string) => void;
  benchmark: () => string;
  setWeights: (weights: LayerWeights[]) => void;
  paint: (x: number, y: number, r: number, brush: 'clear' | 'seed') => void;
  visModes: string[];
  gridSize: [number, number];
  fps: () => string;
  flush: (buf?: Tensor) => void;
  getStepCount: () => number;
  setAngle: (v: number) => void;
  setTransparent: (value: boolean) => void;
}

// Decode base64 to typed array
function decodeArray<T extends Uint8Array>(s: string, arrayType: new (buffer: ArrayBuffer) => T): T {
  const data = atob(s);
  const buf = new Uint8Array(data.length);
  for (let i = 0; i < data.length; ++i) {
    buf[i] = data.charCodeAt(i);
  }
  return new arrayType(buf.buffer) as T;
}

// Main factory function
export function createCA(
  gl: WebGLRenderingContext,
  layerWeights: LayerWeights[],
  gridSize?: [number, number]
): NCA {
  gridSize = gridSize || [96, 96];
  const [gridW, gridH] = gridSize;

  // Create all shader programs
  function createPrograms(): Record<string, twgl.ProgramInfo> {
    const res: Record<string, twgl.ProgramInfo> = {};
    for (const name in PROGRAMS) {
      const fs_code = PREFIX + PROGRAMS[name];
      res[name] = twgl.createProgramInfo(gl, [VS_CODE, fs_code]);
    }
    return res;
  }

  // Create a tensor (framebuffer + texture)
  function createTensor(h: number, w: number, depth: number, activation?: string): Tensor {
    const depth4 = Math.ceil(depth / 4);
    const tensorGridW = Math.ceil(Math.sqrt(depth4));
    const tensorGridH = Math.floor((depth4 + tensorGridW - 1) / tensorGridW);
    const texW = w * tensorGridW;
    const texH = h * tensorGridH;

    const attachments = [{ minMag: gl.NEAREST }];
    const fbi = twgl.createFramebufferInfo(gl, attachments, texW, texH);
    const tex = fbi.attachments[0] as WebGLTexture;
    const C = Math.atan(MAX_ACTIVATION_VALUE);
    let packScaleBias: [number, number] = [2.0 * C, 127.0 / 255.0];
    if (activation === 'relu') {
      packScaleBias = [C, 0.0];
    }
    return {
      _type: 'tensor',
      fbi,
      w,
      h,
      depth,
      gridW: tensorGridW,
      gridH: tensorGridH,
      depth4,
      tex,
      activation,
      packScaleBias,
    };
  }

  // Set uniforms for a tensor
  function setTensorUniforms(uniforms: Record<string, unknown>, name: string, tensor: Tensor): void {
    uniforms[name + '.size'] = [tensor.w, tensor.h];
    uniforms[name + '.gridSize'] = [tensor.gridW, tensor.gridH];
    uniforms[name + '.depth'] = tensor.depth;
    uniforms[name + '.depth4'] = tensor.depth4;
    uniforms[name + '.packScaleBias'] = tensor.packScaleBias;
    if (name !== 'u_output') {
      uniforms[name + '_tex'] = tensor.tex;
    }
  }

  // Run a shader pass
  function runLayer(
    programName: string,
    output: Tensor,
    inputs?: Record<string, unknown>
  ): { programName: string; output: Tensor } {
    inputs = inputs || {};
    const uniforms: Record<string, unknown> = {};

    for (const name in inputs) {
      const val = inputs[name] as { _type?: string };
      if (val && val._type === 'tensor') {
        setTensorUniforms(uniforms, name, val as Tensor);
      } else {
        uniforms[name] = val;
      }
    }
    setTensorUniforms(uniforms, 'u_output', output);

    const program = progs[programName];
    twgl.bindFramebufferInfo(gl, output.fbi);
    gl.useProgram(program.program);
    twgl.setBuffersAndAttributes(gl, program, quad);
    twgl.setUniforms(program, uniforms);
    twgl.drawBufferInfo(gl, quad);
    return { programName, output };
  }

  // Create weight texture for a dense layer
  function createDenseInfo(params: LayerWeights): DenseInfo {
    const src = decodeArray(params.data_b64, Uint8Array);
    const coefs: [number, number, number] = [params.weight_scale, params.bias_scale, 0.5];
    const tex = twgl.createTexture(gl, {
      minMag: gl.NEAREST,
      width: params.out_ch / 4,
      height: params.in_ch + 1,
      src: src,
    });
    return { tex, coefs };
  }

  // Initialize
  const progs = createPrograms();
  const quad = twgl.createBufferInfoFromArrays(gl, {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  });

  let stateBuf = createTensor(gridW, gridH, CHANNEL_N);
  let newStateBuf = createTensor(gridW, gridH, CHANNEL_N);
  const perceptionBuf = createTensor(gridW, gridH, CHANNEL_N * 3);
  const hiddenBuf = createTensor(gridW, gridH, 128, 'relu');
  const updateBuf = createTensor(gridW, gridH, CHANNEL_N);
  const maskedUpdateBuf = createTensor(gridW, gridH, CHANNEL_N);

  let layerTex1 = createDenseInfo(layerWeights[0]);
  let layerTex2 = createDenseInfo(layerWeights[1]);

  let rotationAngle = 0.0;
  function setAngle(v: number): void {
    rotationAngle = (v / 180.0) * Math.PI;
  }

  // Operations pipeline
  const ops = [
    () => runLayer('perception', perceptionBuf, { u_input: stateBuf, u_angle: rotationAngle }),
    () =>
      runLayer('dense', hiddenBuf, {
        u_input: perceptionBuf,
        u_weightTex: layerTex1.tex,
        u_weightCoefs: layerTex1.coefs,
      }),
    () =>
      runLayer('dense', updateBuf, {
        u_input: hiddenBuf,
        u_weightTex: layerTex2.tex,
        u_weightCoefs: layerTex2.coefs,
      }),
    () =>
      runLayer('dropout', maskedUpdateBuf, {
        u_input: updateBuf,
        u_seed: Math.random() * 1000,
        u_updateProbability: 0.5,
      }),
    () => runLayer('update', newStateBuf, { u_input: stateBuf, u_update: maskedUpdateBuf }),
  ];

  // FPS tracking
  let fpsStartTime: number | undefined;
  let fpsCount = 0;
  let lastFpsCount = '';
  let totalStepCount = 0;

  function fps(): string {
    return lastFpsCount;
  }

  function getStepCount(): number {
    return totalStepCount;
  }

  // Paint/damage tracking
  let lastDamage = [0, 0, -1];

  function paint(x: number, y: number, r: number, brush: 'clear' | 'seed'): void {
    runLayer('paint', stateBuf, {
      u_pos: [x, y],
      u_r: r,
      u_brush: brush === 'seed' ? 1.0 : 0.0,
    });
    if (brush === 'clear' && r < 1000) {
      lastDamage = [x, y, r];
    }
  }

  function reset(): void {
    paint(0, 0, 10000, 'clear');
    paint(gridW / 2, gridH / 2, 1, 'seed');
    totalStepCount = 0;
  }

  reset();

  function step(): void {
    for (const op of ops) op();
    [stateBuf, newStateBuf] = [newStateBuf, stateBuf];

    totalStepCount += 1;
    fpsCount += 1;
    let time = Date.now();
    if (!fpsStartTime) fpsStartTime = time;
    const fpsInterval = 1000;
    if (time - fpsStartTime > fpsInterval) {
      time = Date.now();
      lastFpsCount = ((fpsCount * 1000) / (time - fpsStartTime)).toFixed(1);
      fpsStartTime = time;
      fpsCount = 0;
    }
  }

  const visModes = ['color', 'state', 'perception', 'hidden', 'update', 'maskedUpdate'];

  // Transparency mode for compositing over any background
  let transparentMode = false;

  function setTransparent(value: boolean): void {
    transparentMode = value;
  }

  function draw(visMode?: string): void {
    visMode = visMode || 'color';

    // IMPORTANT: Unbind framebuffer to render to screen and avoid feedback loop
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Enable alpha blending for transparent mode
    if (transparentMode) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    gl.useProgram(progs.vis.program);
    twgl.setBuffersAndAttributes(gl, progs.vis, quad);
    const uniforms: Record<string, unknown> = {
      u_raw: 0.0,
      u_lastDamage: lastDamage,
      u_transparent: transparentMode ? 1.0 : 0.0,
    };
    lastDamage[2] = Math.max(-0.1, lastDamage[2] - 1.0);

    let inputBuf = stateBuf;
    if (visMode !== 'color') {
      const buffers: Record<string, Tensor> = {
        stateBuf,
        perceptionBuf,
        hiddenBuf,
        updateBuf,
        maskedUpdateBuf,
      };
      inputBuf = buffers[visMode + 'Buf'] || stateBuf;
      uniforms.u_raw = 1.0;
    }
    setTensorUniforms(uniforms, 'u_input', inputBuf);
    twgl.setUniforms(progs.vis, uniforms);
    twgl.drawBufferInfo(gl, quad);

    if (transparentMode) {
      gl.disable(gl.BLEND);
    }
  }

  function setWeights(newWeights: LayerWeights[]): void {
    gl.deleteTexture(layerTex1.tex);
    gl.deleteTexture(layerTex2.tex);
    layerTex1 = createDenseInfo(newWeights[0]);
    layerTex2 = createDenseInfo(newWeights[1]);
  }

  const _flushBuf = new Uint8Array(4);
  function flush(buf?: Tensor): void {
    buf = buf || stateBuf;
    twgl.bindFramebufferInfo(gl, buf.fbi);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, _flushBuf);
  }

  function benchmark(): string {
    flush();
    const stepN = 100;
    const start = Date.now();
    for (let i = 0; i < stepN; ++i) step();
    flush();
    const total = (Date.now() - start) / stepN;

    const perOp: string[] = [];
    for (const op of ops) {
      const opStart = Date.now();
      let r: { programName: string; output: Tensor } | undefined;
      for (let i = 0; i < stepN; ++i) {
        r = op();
      }
      flush(r?.output);
      const dt = (Date.now() - opStart) / stepN;
      const percent = (100.0 * dt) / total;
      perOp.push(`${r?.programName}: ${percent.toFixed(1)}%`);
    }
    return (
      `${total.toFixed(2)} ms/step, ${(1000.0 / total).toFixed(2)} step/sec\n` +
      perOp.join(', ') +
      '\n\n'
    );
  }

  return {
    reset,
    step,
    draw,
    benchmark,
    setWeights,
    paint,
    visModes,
    gridSize,
    fps,
    flush,
    getStepCount,
    setAngle,
    setTransparent,
  };
}
