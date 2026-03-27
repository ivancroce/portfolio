import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   WebGL Fluid-Ink Simulation
   ─────────────────────────────────────────────────────────────────────
   Real-time 2D Navier-Stokes fluid solver rendered as flowing ink on
   warm paper. Used as the hero background in light theme mode.

   Pipeline: splat → advect velocity → curl → vorticity confinement
           → divergence → pressure solve (Jacobi) → gradient subtract
           → advect dye → display with shading

   The simulation runs entirely on the GPU via WebGL 1 with half-float
   textures and double-buffered framebuffers (ping-pong). Mouse/touch
   input injects velocity and dye; an idle auto-animation creates
   organic sweep strokes across the canvas when no input is detected.
   ═══════════════════════════════════════════════════════════════════════ */

// ── Shaders ─────────────────────────────────────────────────────────────

const VS = `
precision highp float;
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const SPLAT_FS = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tgt;
uniform float u_ar;
uniform vec3 u_clr;
uniform vec2 u_pt;
uniform float u_rad;
void main() {
  vec2 p = v_uv - u_pt;
  p.x *= u_ar;
  gl_FragColor = vec4(texture2D(u_tgt, v_uv).rgb + exp(-dot(p, p) / u_rad) * u_clr, 1.0);
}`;

const ADV_FS = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_vel;
uniform sampler2D u_src;
uniform vec2 u_txl;
uniform float u_dt;
uniform float u_diss;
void main() {
  vec2 coord = v_uv - u_dt * texture2D(u_vel, v_uv).xy * u_txl;
  float d = 1.0 / (1.0 + u_diss * u_dt);
  gl_FragColor = d * texture2D(u_src, coord);
}`;

const CURL_FS = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_vel;
uniform vec2 u_txl;
void main() {
  float L = texture2D(u_vel, v_uv - vec2(u_txl.x, 0.0)).y;
  float R = texture2D(u_vel, v_uv + vec2(u_txl.x, 0.0)).y;
  float T = texture2D(u_vel, v_uv + vec2(0.0, u_txl.y)).x;
  float B = texture2D(u_vel, v_uv - vec2(0.0, u_txl.y)).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const VORT_FS = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_vel;
uniform sampler2D u_crl;
uniform vec2 u_txl;
uniform float u_str;
uniform float u_dt;
void main() {
  float L = texture2D(u_crl, v_uv - vec2(u_txl.x, 0.0)).x;
  float R = texture2D(u_crl, v_uv + vec2(u_txl.x, 0.0)).x;
  float T = texture2D(u_crl, v_uv + vec2(0.0, u_txl.y)).x;
  float B = texture2D(u_crl, v_uv - vec2(0.0, u_txl.y)).x;
  float C = texture2D(u_crl, v_uv).x;
  vec2 f = vec2(abs(T) - abs(B), abs(R) - abs(L));
  f = f / (length(f) + 1e-5) * u_str * C;
  f.y *= -1.0;
  gl_FragColor = vec4(texture2D(u_vel, v_uv).xy + f * u_dt, 0.0, 1.0);
}`;

const DIV_FS = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_vel;
uniform vec2 u_txl;
void main() {
  float L = texture2D(u_vel, v_uv - vec2(u_txl.x, 0.0)).x;
  float R = texture2D(u_vel, v_uv + vec2(u_txl.x, 0.0)).x;
  float T = texture2D(u_vel, v_uv + vec2(0.0, u_txl.y)).y;
  float B = texture2D(u_vel, v_uv - vec2(0.0, u_txl.y)).y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const PRES_FS = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_prs;
uniform sampler2D u_div;
uniform vec2 u_txl;
void main() {
  float L = texture2D(u_prs, v_uv - vec2(u_txl.x, 0.0)).x;
  float R = texture2D(u_prs, v_uv + vec2(u_txl.x, 0.0)).x;
  float T = texture2D(u_prs, v_uv + vec2(0.0, u_txl.y)).x;
  float B = texture2D(u_prs, v_uv - vec2(0.0, u_txl.y)).x;
  gl_FragColor = vec4((L + R + T + B - texture2D(u_div, v_uv).x) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRAD_FS = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_prs;
uniform sampler2D u_vel;
uniform vec2 u_txl;
void main() {
  float L = texture2D(u_prs, v_uv - vec2(u_txl.x, 0.0)).x;
  float R = texture2D(u_prs, v_uv + vec2(u_txl.x, 0.0)).x;
  float T = texture2D(u_prs, v_uv + vec2(0.0, u_txl.y)).x;
  float B = texture2D(u_prs, v_uv - vec2(0.0, u_txl.y)).x;
  gl_FragColor = vec4(texture2D(u_vel, v_uv).xy - vec2(R - L, T - B), 0.0, 1.0);
}`;

const DISP_FS = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_txl;
uniform vec3 u_ink;
uniform float u_gain;
void main() {
  vec3 c = texture2D(u_tex, v_uv).rgb;
  float m = clamp(max(c.r, max(c.g, c.b)) * u_gain, 0.0, 1.0);
  float dL = texture2D(u_tex, v_uv - vec2(u_txl.x, 0.0)).g;
  float dR = texture2D(u_tex, v_uv + vec2(u_txl.x, 0.0)).g;
  float dT = texture2D(u_tex, v_uv + vec2(0.0, u_txl.y)).g;
  float dB = texture2D(u_tex, v_uv - vec2(0.0, u_txl.y)).g;
  vec3 n = normalize(vec3((dR - dL) * 80.0, (dT - dB) * 80.0, 1.0));
  float shade = dot(n, normalize(vec3(-1.0, -1.0, 1.0))) * 0.12 + 0.88;
  gl_FragColor = vec4(u_ink * shade, m);
}`;

// ── Types ───────────────────────────────────────────────────────────────

type GL = WebGLRenderingContext;
interface Prog {
  p: WebGLProgram;
  u: Record<string, WebGLUniformLocation | null>;
}
interface FBO {
  tex: WebGLTexture;
  fb: WebGLFramebuffer;
  w: number;
  h: number;
  bind(n: number): number;
}
interface DFBO {
  read: FBO;
  write: FBO;
  swap(): void;
}

// ── WebGL helpers ───────────────────────────────────────────────────────

function mkShader(gl: GL, t: number, s: string) {
  const o = gl.createShader(t)!;
  gl.shaderSource(o, s);
  gl.compileShader(o);
  return o;
}

function mkProg(gl: GL, vs: string, fs: string): Prog {
  const p = gl.createProgram()!;
  gl.attachShader(p, mkShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, mkShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, "a_pos");
  gl.linkProgram(p);
  const u: Record<string, WebGLUniformLocation | null> = {};
  for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) {
    const info = gl.getActiveUniform(p, i)!;
    u[info.name] = gl.getUniformLocation(p, info.name);
  }
  return { p, u };
}

function mkFBO(gl: GL, w: number, h: number, type: number, filter: number): FBO {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, type, null);
  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return {
    tex,
    fb,
    w,
    h,
    bind(n: number) {
      gl.activeTexture(gl.TEXTURE0 + n);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      return n;
    }
  };
}

function mkDFBO(gl: GL, w: number, h: number, type: number, filter: number): DFBO {
  let a = mkFBO(gl, w, h, type, filter);
  let b = mkFBO(gl, w, h, type, filter);
  return {
    get read() {
      return a;
    },
    get write() {
      return b;
    },
    swap() {
      [a, b] = [b, a];
    }
  };
}

// ── Simulation config ─────────────────────────────────────────────────
// Tuning knobs for the fluid solver and visual output.

const SIM_RES = 128; // velocity/pressure grid resolution
const DYE_RES = 1024; // dye texture resolution (higher = sharper ink)
const P_ITER = 20; // Jacobi pressure-solve iterations
const D_DISS = 1.3; // dye dissipation rate (higher = faster fade)
const V_DISS = 0.4; // velocity dissipation (lower = more viscous flow)
const S_RAD = 0.003; // splat radius (Gaussian spread)
const S_FORCE = 3000; // velocity multiplier per splat
const CURL_STR = 0.8; // vorticity confinement strength
const GAIN = 2.2; // display brightness multiplier
const DYE_INT = 0.12; // dye intensity per splat

// ── Mouse-input tuning ──────────────────────────────────────────────
const M_FORCE = 2000; // mouse velocity multiplier (vs 3000 for auto)
const M_DYE_INT = 0.12; // mouse dye intensity (matches auto)
const M_MAX_D = 0.012; // max per-frame delta component for mouse
const M_SMOOTH = 0.5; // EMA smoothing factor (0 = full smooth, 1 = none)

const INK_CLR = [0.455, 0.62, 0.604] as const; // ink colour (#749E9A)

// ── Auto-animation ───────────────────────────────────────────────────
// When idle, the simulation plays sweep strokes: a virtual cursor moves
// from one edge to the opposite side along a curved path, injecting dye
// and velocity. After each stroke completes, a pause allows the ink to
// dissolve before the next stroke begins from a new random edge.

const AUTO_IDLE = 1000; // ms of inactivity before auto-animation starts
const AUTO_STROKE_MS = 5000; // duration of each sweep stroke
const AUTO_PAUSE_MS = 1000; // pause between strokes for ink to dissolve

// ── Component ───────────────────────────────────────────────────────────
// Renders a full-screen <canvas> overlay. All WebGL resources are created
// inside a single useEffect and cleaned up on unmount.

const InkEffect = () => {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const ptrRef = useRef({ x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false });
  const autoRef = useRef({
    lastInput: 0,
    wasActive: false,
    phase: "idle" as "idle" | "stroking" | "pausing",
    phaseStart: 0,
    sx: 0,
    sy: 0,
    tx: 0,
    ty: 0,
    cx: 0,
    cy: 0,
    ctrl: 0
  });

  useEffect(() => {
    const el = cvRef.current;
    if (!el) return;

    const gl = el.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) return;

    const hf = gl.getExtension("OES_texture_half_float");
    gl.getExtension("OES_texture_half_float_linear");
    if (!hf) return;
    const HF = hf.HALF_FLOAT_OES;

    // Fullscreen quad
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Compile programs
    const pSplat = mkProg(gl, VS, SPLAT_FS);
    const pAdv = mkProg(gl, VS, ADV_FS);
    const pCurl = mkProg(gl, VS, CURL_FS);
    const pVort = mkProg(gl, VS, VORT_FS);
    const pDiv = mkProg(gl, VS, DIV_FS);
    const pPres = mkProg(gl, VS, PRES_FS);
    const pGrad = mkProg(gl, VS, GRAD_FS);
    const pDisp = mkProg(gl, VS, DISP_FS);

    // FBOs (initialized by initFBOs via resize, called immediately below)
    let vel = undefined as unknown as DFBO;
    let pres = undefined as unknown as DFBO;
    let div = undefined as unknown as FBO;
    let crl = undefined as unknown as FBO;
    let dye = undefined as unknown as DFBO;
    let sW = 0,
      sH = 0,
      dW = 0,
      dH = 0;

    const initFBOs = () => {
      const ar = el.width / el.height;
      sW = SIM_RES;
      sH = Math.round(SIM_RES / ar);
      dW = DYE_RES;
      dH = Math.round(DYE_RES / ar);
      vel = mkDFBO(gl, sW, sH, HF, gl.LINEAR);
      pres = mkDFBO(gl, sW, sH, HF, gl.NEAREST);
      div = mkFBO(gl, sW, sH, HF, gl.NEAREST);
      crl = mkFBO(gl, sW, sH, HF, gl.NEAREST);
      dye = mkDFBO(gl, dW, dH, HF, gl.LINEAR);
    };

    const resize = () => {
      const w = el.offsetWidth,
        h = el.offsetHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      initFBOs();
    };
    resize();

    // Verify half-float FBO support
    gl.bindFramebuffer(gl.FRAMEBUFFER, vel.read.fb);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return;

    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // ── Draw ──

    const blit = (target: FBO | null) => {
      if (target) {
        gl.viewport(0, 0, target.w, target.h);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
      } else {
        gl.viewport(0, 0, el.width, el.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    };

    const splat = (
      x: number, y: number, dx: number, dy: number,
      force = S_FORCE, intensity = DYE_INT
    ) => {
      const ar = el.width / el.height;
      gl.useProgram(pSplat.p);
      gl.uniform1f(pSplat.u["u_ar"], ar);
      gl.uniform2f(pSplat.u["u_pt"], x, y);
      gl.uniform1f(pSplat.u["u_rad"], S_RAD);

      // Velocity splat
      gl.uniform1i(pSplat.u["u_tgt"], vel.read.bind(0));
      gl.uniform3f(pSplat.u["u_clr"], dx * force, dy * force, 0);
      blit(vel.write);
      vel.swap();

      // Dye splat (uniform grayscale)
      gl.uniform1i(pSplat.u["u_tgt"], dye.read.bind(0));
      gl.uniform3f(pSplat.u["u_clr"], intensity, intensity, intensity);
      blit(dye.write);
      dye.swap();
    };

    // ── Simulation step ──

    const step = (dt: number) => {
      const tx = 1 / sW,
        ty = 1 / sH;

      // 1. Advect velocity
      gl.useProgram(pAdv.p);
      gl.uniform2f(pAdv.u["u_txl"], tx, ty);
      gl.uniform1f(pAdv.u["u_dt"], dt);
      gl.uniform1f(pAdv.u["u_diss"], V_DISS);
      gl.uniform1i(pAdv.u["u_vel"], vel.read.bind(0));
      gl.uniform1i(pAdv.u["u_src"], vel.read.bind(0));
      blit(vel.write);
      vel.swap();

      // 2. Curl
      gl.useProgram(pCurl.p);
      gl.uniform2f(pCurl.u["u_txl"], tx, ty);
      gl.uniform1i(pCurl.u["u_vel"], vel.read.bind(0));
      blit(crl);

      // 3. Vorticity confinement
      gl.useProgram(pVort.p);
      gl.uniform2f(pVort.u["u_txl"], tx, ty);
      gl.uniform1f(pVort.u["u_str"], CURL_STR);
      gl.uniform1f(pVort.u["u_dt"], dt);
      gl.uniform1i(pVort.u["u_vel"], vel.read.bind(0));
      gl.uniform1i(pVort.u["u_crl"], crl.bind(1));
      blit(vel.write);
      vel.swap();

      // 4. Divergence
      gl.useProgram(pDiv.p);
      gl.uniform2f(pDiv.u["u_txl"], tx, ty);
      gl.uniform1i(pDiv.u["u_vel"], vel.read.bind(0));
      blit(div);

      // 5. Pressure solve (Jacobi iteration)
      gl.useProgram(pPres.p);
      gl.uniform2f(pPres.u["u_txl"], tx, ty);
      gl.uniform1i(pPres.u["u_div"], div.bind(1));
      for (let i = 0; i < P_ITER; i++) {
        gl.uniform1i(pPres.u["u_prs"], pres.read.bind(0));
        blit(pres.write);
        pres.swap();
      }

      // 6. Gradient subtract
      gl.useProgram(pGrad.p);
      gl.uniform2f(pGrad.u["u_txl"], tx, ty);
      gl.uniform1i(pGrad.u["u_prs"], pres.read.bind(0));
      gl.uniform1i(pGrad.u["u_vel"], vel.read.bind(1));
      blit(vel.write);
      vel.swap();

      // 7. Advect dye (use sim texel for correct velocity scaling)
      gl.useProgram(pAdv.p);
      gl.uniform2f(pAdv.u["u_txl"], tx, ty);
      gl.uniform1f(pAdv.u["u_dt"], dt);
      gl.uniform1f(pAdv.u["u_diss"], D_DISS);
      gl.uniform1i(pAdv.u["u_vel"], vel.read.bind(0));
      gl.uniform1i(pAdv.u["u_src"], dye.read.bind(1));
      blit(dye.write);
      dye.swap();
    };

    // ── Render ──

    const render = () => {
      gl.useProgram(pDisp.p);
      gl.uniform1i(pDisp.u["u_tex"], dye.read.bind(0));
      gl.uniform2f(pDisp.u["u_txl"], 1 / dW, 1 / dH);
      gl.uniform3f(pDisp.u["u_ink"], INK_CLR[0], INK_CLR[1], INK_CLR[2]);
      gl.uniform1f(pDisp.u["u_gain"], GAIN);
      blit(null);
    };

    // ── Pointer state (declared before loop so loop can access them) ──

    let lx = 0,
      ly = 0,
      has = false;
    let accDx = 0,
      accDy = 0;
    let lastPtrX = 0,
      lastPtrY = 0;
    let smoothDx = 0,
      smoothDy = 0;

    // ── Animation loop ──

    let last = performance.now();
    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.02);
      last = now;

      // Real pointer input (clamped + smoothed)
      if (ptrRef.current.moved) {
        autoRef.current.lastInput = now;
        autoRef.current.wasActive = true;
        const mdx = Math.max(-M_MAX_D, Math.min(M_MAX_D, accDx));
        const mdy = Math.max(-M_MAX_D, Math.min(M_MAX_D, accDy));
        smoothDx += (mdx - smoothDx) * M_SMOOTH;
        smoothDy += (mdy - smoothDy) * M_SMOOTH;
        splat(lastPtrX, lastPtrY, smoothDx, smoothDy, M_FORCE, M_DYE_INT);
        ptrRef.current.moved = false;
        accDx = 0;
        accDy = 0;
      } else {
        smoothDx *= 0.9;
        smoothDy *= 0.9;
      }

      // Auto-animation: gentle sweep strokes when idle
      if (now - autoRef.current.lastInput > AUTO_IDLE) {
        const a = autoRef.current;

        // Reset to idle after mouse input so a fresh stroke starts
        if (a.wasActive) {
          a.wasActive = false;
          a.phase = "idle";
        }

        if (a.phase === "idle") {
          // Pick a random edge to start from, flow toward opposite side
          const edge = Math.floor(Math.random() * 4);
          const r1 = 0.2 + Math.random() * 0.6;
          const r2 = 0.2 + Math.random() * 0.6;
          if (edge === 0) {
            a.sx = -0.02;
            a.sy = r1;
            a.tx = 1.02;
            a.ty = r2;
          } else if (edge === 1) {
            a.sx = 1.02;
            a.sy = r1;
            a.tx = -0.02;
            a.ty = r2;
          } else if (edge === 2) {
            a.sx = r1;
            a.sy = 1.02;
            a.tx = r2;
            a.ty = -0.02;
          } else {
            a.sx = r1;
            a.sy = -0.02;
            a.tx = r2;
            a.ty = 1.02;
          }
          a.ctrl = (Math.random() - 0.5) * 0.3;
          a.cx = a.sx;
          a.cy = a.sy;
          a.phaseStart = now;
          a.phase = "stroking";
        }

        if (a.phase === "stroking") {
          const p = Math.min((now - a.phaseStart) / AUTO_STROKE_MS, 1);
          // Ease in-out for gentle acceleration/deceleration
          const t = p < 0.5 ? 2 * p * p : 1 - 2 * (1 - p) * (1 - p);
          const lx = a.sx + (a.tx - a.sx) * t;
          const ly = a.sy + (a.ty - a.sy) * t;
          const ddx = a.tx - a.sx;
          const ddy = a.ty - a.sy;
          const len = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
          const curve = Math.sin(t * Math.PI) * a.ctrl;
          const nx = lx + (-ddy / len) * curve;
          const ny = ly + (ddx / len) * curve;
          const adx = nx - a.cx;
          const ady = ny - a.cy;
          splat(nx, ny, adx, ady);
          a.cx = nx;
          a.cy = ny;
          if (p >= 1) {
            a.phase = "pausing";
            a.phaseStart = now;
          }
        } else if (a.phase === "pausing") {
          if (now - a.phaseStart > AUTO_PAUSE_MS) {
            a.phase = "idle";
          }
        }
      }

      step(dt);
      render();
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    // ── Pointer tracking ──

    const sec = el.parentElement;

    const onPtr = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      if (has) {
        accDx += x - lx;
        accDy += y - ly;
        lastPtrX = x;
        lastPtrY = y;
        ptrRef.current.moved = true;
      }
      lx = x;
      ly = y;
      has = true;
    };
    const onLeave = () => {
      has = false;
      smoothDx = 0;
      smoothDy = 0;
      accDx = 0;
      accDy = 0;
    };

    sec?.addEventListener("pointermove", onPtr);
    sec?.addEventListener("pointerleave", onLeave);

    return () => {
      ro.disconnect();
      sec?.removeEventListener("pointermove", onPtr);
      sec?.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={cvRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0
      }}
    />
  );
};

export default InkEffect;
