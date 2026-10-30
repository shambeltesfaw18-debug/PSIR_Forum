// PSIR Forum animated background: a slow, royal blue and gold shader behind the whole site.
// Falls back to the plain page colour if WebGL2 is unavailable, and shows a still picture
// for visitors who have "reduce motion" turned on. A soft veil keeps the text readable.
(function () {
  "use strict";
  if (document.getElementById("psir-bg") || !document.body) return;

  const CONFIG = {
    bg: "#1E3F82", colorA: "#2855A6", colorB: "#5B8DEF", colorC: "#A9C7F5", colorD: "#E6B75A",
    scale: 1, speed: 0.2, tilt: 1.87, rock: 0.12, horizon: 0.36, breathe: 0.29,
    spread: 0.41, curve: 3.32, direct: 0.97, bounce: 0.38, bounceCurve: 4.25,
    spillCentre: 0.3, spillWidth: 2.18, spillFloor: 0.26, amount: 0.2, warp: 2.58,
    warpScale: 0.78, flow: 0.475, roughness: 0.29, lacunarity: 1.99, motes: 0.074,
    moteScale: 7, ambient: 0.24, contrast: 2.45, midpoint: 0.57, sink: 0.24, glow: 0.2,
    dither: 0.58, vignette: 0.21, steer: -0.13, lift: 0.11, sweep: 0.5, parallax: 0.0137, maxDpr: 1
  };

  const canvas = document.createElement("canvas");
  canvas.id = "psir-bg";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:-2;pointer-events:none;display:block;";
  document.body.prepend(canvas);

  const veil = document.createElement("div");
  veil.id = "psir-veil";
  veil.setAttribute("aria-hidden", "true");
  veil.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;background:rgba(247,249,252,0.84);";
  document.body.prepend(veil);

  const style = document.createElement("style");
  style.textContent = 'html[data-theme="dark"] #psir-veil{background:rgba(17,22,31,0.88) !important;}';
  document.head.appendChild(style);

  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl) { canvas.remove(); return; }

  const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

  const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 iResolution; uniform float iTime; uniform vec2 iMouse; uniform float uScale;
uniform vec3 uBg, uColorA, uColorB, uColorC, uColorD;
uniform float uSpeed, uTilt, uRock, uHorizon, uBreathe, uSpread, uCurve, uDirect;
uniform float uBounce, uBounceCurve, uSpillCentre, uSpillWidth, uSpillFloor;
uniform float uAmount, uWarp, uWarpScale, uFlow, uRoughness, uLacunarity, uMotes, uMoteScale;
uniform float uAmbient, uContrast, uMidpoint, uSink, uGlow, uDither, uVignette;
uniform float uSteer, uLift, uSweep, uParallax;
#define OCTAVES 4
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float snoise(vec2 p) {
  const float K1 = 0.366025404, K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
  return dot(n, vec3(70.0));
}
float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < OCTAVES; i++) { v += amp * snoise(p); p *= uLacunarity; amp *= uRoughness; }
  return v;
}
vec3 ramp4(float t) {
  vec3 c = mix(uColorA, uColorB, smoothstep(0.00, 0.36, t));
  c = mix(c, uColorC, smoothstep(0.32, 0.70, t));
  c = mix(c, uColorD, smoothstep(0.66, 1.00, t));
  return c;
}
float triDither(vec2 fc) {
  float a = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float b = fract(sin(dot(fc + 17.0, vec2(12.9898, 78.233))) * 43758.5453);
  return (a + b - 1.0) / 255.0;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
  uv *= uScale;
  vec2 iM = iMouse * uScale;
  float t = iTime * uSpeed;
  vec2 p = uv - iM * uParallax;
  float tilt = uTilt + sin(t * 0.13) * uRock + iM.x * uSteer;
  vec2 dir = vec2(cos(tilt), sin(tilt));
  float axis = dot(p, dir);
  float across = dot(p, vec2(-dir.y, dir.x));
  vec2 q = vec2(fbm(p * uWarpScale + vec2(0.0, t * uFlow)), fbm(p * uWarpScale + vec2(5.2, 1.3) - t * uFlow * 0.7));
  float air = fbm(p + uWarp * q + vec2(t * 0.12, -t * 0.09)) * 0.5 + 0.5;
  float horizon = uHorizon + sin(t * 0.09 + 2.1) * uBreathe - iM.y * uLift;
  float alt = clamp(0.5 + (axis - horizon) * uSpread + (air - 0.5) * uAmount, 0.0, 1.0);
  float ac = (across - uSpillCentre - iM.x * uSweep) / max(0.05, uSpillWidth);
  float spill = mix(uSpillFloor, 1.0, exp(-ac * ac));
  float direct = pow(alt, max(0.05, uCurve)) * uDirect * spill;
  float bounce = uBounce * pow(1.0 - alt, max(0.05, uBounceCurve));
  float f = uAmbient + direct + bounce;
  f += uMotes * snoise(p * uMoteScale + vec2(-t * 0.5, t * 0.35)) * 0.5 * alt;
  f = clamp((f - uMidpoint) * uContrast + 0.5, 0.0, 1.0);
  vec3 col = ramp4(f);
  col += uColorD * uGlow * pow(f, 4.0);
  col = mix(uBg, col, smoothstep(0.0, max(0.01, uSink), f) * 0.90 + 0.10);
  col *= 1.0 - uVignette * dot(uv, uv);
  col += triDither(gl_FragCoord.xy) * uDither;
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  }
  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("link");
  } catch (e) { canvas.remove(); return; }
  gl.useProgram(program);
  gl.bindVertexArray(gl.createVertexArray());

  const hex = h => { const n = parseInt(h.replace("#", ""), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  const LOC = {};
  const loc = n => (n in LOC ? LOC[n] : (LOC[n] = gl.getUniformLocation(program, n)));
  const f1 = (n, v) => gl.uniform1f(loc(n), v);
  const c3 = (n, h) => { const c = hex(h); gl.uniform3f(loc(n), c[0], c[1], c[2]); };
  c3("uBg", CONFIG.bg); c3("uColorA", CONFIG.colorA); c3("uColorB", CONFIG.colorB); c3("uColorC", CONFIG.colorC); c3("uColorD", CONFIG.colorD);
  ["Scale:scale", "Speed:speed", "Tilt:tilt", "Rock:rock", "Horizon:horizon", "Breathe:breathe", "Spread:spread", "Curve:curve",
   "Direct:direct", "Bounce:bounce", "BounceCurve:bounceCurve", "SpillCentre:spillCentre", "SpillWidth:spillWidth", "SpillFloor:spillFloor",
   "Amount:amount", "Warp:warp", "WarpScale:warpScale", "Flow:flow", "Roughness:roughness", "Lacunarity:lacunarity", "Motes:motes",
   "MoteScale:moteScale", "Ambient:ambient", "Contrast:contrast", "Midpoint:midpoint", "Sink:sink", "Glow:glow", "Dither:dither",
   "Vignette:vignette", "Steer:steer", "Lift:lift", "Sweep:sweep", "Parallax:parallax"].forEach(pair => {
    const [u, k] = pair.split(":");
    f1("u" + u, CONFIG[k]);
  });

  let dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
    const w = Math.max(1, Math.round(innerWidth * dpr));
    const h = Math.max(1, Math.round(innerHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(loc("iResolution"), w, h);
  }
  let queued = false;
  addEventListener("resize", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; resize(); });
  }, { passive: true });

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(canvas);

  let clock = 0, prev = performance.now();
  function draw() {
    gl.uniform2f(loc("iMouse"), 0, 0);
    gl.uniform1f(loc("iTime"), clock);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function frame(now) {
    requestAnimationFrame(frame);
    const ms = Math.min(50, Math.max(4.167, now - prev));
    prev = now;
    if (!visible || document.hidden) return;
    clock += ms * 0.001;
    draw();
  }

  resize();
  if (reduce) {
    draw();   // one still frame for visitors who prefer less motion
  } else {
    requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !reduce) prev = performance.now(); });
})();
