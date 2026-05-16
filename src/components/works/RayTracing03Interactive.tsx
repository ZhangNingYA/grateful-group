/**
 * RayTracing03Interactive.tsx
 *
 * GAMES101 Ray Tracing 3 / Lecture 15 — interactive 3D teaching components.
 *
 * Five focused demos:
 *   1. IrradianceCosineDemo      — Lambert's cosine law on a tiltable patch
 *   2. RadianceBeamDemo          — radiance as power per (projected area · solid angle)
 *   3. BRDFLobeDemo              — material lobes for diffuse / glossy / mirror
 *   4. ReflectionEquationDemo    — hemispherical integral over Ω+
 *   5. RenderingEquationDemo     — recursive bounce series in a mini Cornell box
 *
 * Adjust the import path in MDX as needed:
 *   import { IrradianceCosineDemo, ... } from '../../components/works/RayTracing03Interactive.tsx'
 */

import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

/* ============================================================
 * 0. Theme tokens (semantic colors for graphics quantities)
 * ============================================================ */
const COLOR = {
  bg: '#0b1020',
  card: 'rgba(20, 26, 44, 0.78)',
  cardStrong: 'rgba(28, 36, 60, 0.92)',
  border: 'rgba(120, 145, 200, 0.18)',
  borderStrong: 'rgba(150, 175, 230, 0.32)',
  text: '#d6dcec',
  textDim: '#98a3bf',
  accent: '#6aa9ff',
  incident: '#6aa9ff',
  outgoing: '#ff9a4d',
  normal: '#62d7a4',
  emission: '#ffd66b',
  indirect: '#c08bff',
  warn: '#ff7a7a',
  hemi: '#90a8c8',
  surface: '#5b6884',
} as const;

/* ============================================================
 * 1. Math utilities (plain TS, kept outside components)
 * ============================================================ */
export function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}
export function clamp01(x: number): number {
  return clamp(x, 0, 1);
}
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
export function safeNormalize(v: THREE.Vector3): THREE.Vector3 {
  const len = v.length();
  return len > 1e-8 ? v.clone().multiplyScalar(1 / len) : new THREE.Vector3(0, 1, 0);
}
export function dotClamped(a: THREE.Vector3, b: THREE.Vector3): number {
  return Math.max(0, a.dot(b));
}

/** Spherical (theta from +Y, phi around +Y) → cartesian. */
export function sphericalToCartesian(theta: number, phi: number): THREE.Vector3 {
  const s = Math.sin(theta);
  return new THREE.Vector3(s * Math.cos(phi), Math.cos(theta), s * Math.sin(phi));
}

/** Lambertian BRDF: f_r = albedo / π. Constant in all directions. */
export function lambertBRDF(albedo: number): number {
  return albedo / Math.PI;
}

/**
 * Glossy BRDF approximation (NOT physically accurate — teaching only).
 * Uses a Phong-ish lobe centered at the mirror reflection of wi about n.
 * Returns a non-negative scalar; visualization is what matters here.
 */
export function glossyBRDFApprox(
  wi: THREE.Vector3,
  wo: THREE.Vector3,
  n: THREE.Vector3,
  roughness: number,
  albedo: number,
): number {
  const r = clamp(roughness, 0.02, 1);
  const shininess = 2 / (r * r) - 2; // small r → big exponent → tight lobe
  const refl = reflect(wi.clone().multiplyScalar(-1), n);
  const cosAlpha = Math.max(0, refl.dot(wo));
  const lobe = Math.pow(cosAlpha, Math.max(1, shininess));
  // diffuse base + specular lobe (energy approximate)
  const diffuse = albedo / Math.PI;
  const specular = lobe * (shininess + 2) / (2 * Math.PI);
  // mix by roughness so r=1 → mostly diffuse, r=0.05 → mostly specular
  return diffuse * r + specular * (1 - r);
}

/** Mirror BRDF approximation (visual only — narrow Phong lobe). */
export function mirrorBRDFApprox(
  wi: THREE.Vector3,
  wo: THREE.Vector3,
  n: THREE.Vector3,
): number {
  const refl = reflect(wi.clone().multiplyScalar(-1), n);
  const cosAlpha = Math.max(0, refl.dot(wo));
  return Math.pow(cosAlpha, 256) * 80;
}

/** Reflect vector v about normal n (both unit). */
function reflect(v: THREE.Vector3, n: THREE.Vector3): THREE.Vector3 {
  return v.clone().sub(n.clone().multiplyScalar(2 * v.dot(n)));
}

/** Irradiance from a single directional light: E = power · max(0, n·l). */
export function computeIrradiance(power: number, n: THREE.Vector3, l: THREE.Vector3, useCos: boolean): number {
  const cos = useCos ? dotClamped(n, l) : 1;
  return power * cos;
}

/** Radiance demo: L = flux / (dA · cosθ · dω) — projected area in denominator. */
export function computeRadiance(flux: number, dA: number, cosTheta: number, dOmega: number): number {
  const projected = Math.max(1e-6, dA * Math.max(1e-3, cosTheta));
  return flux / (projected * Math.max(1e-6, dOmega));
}

/**
 * Deterministic hemisphere samples (stratified Fibonacci-like spiral).
 * Returns directions on the upper hemisphere (n = +Y).
 */
export function sampleHemisphere(count: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i + 0.5) / count; // y in (0, 1)
    const r = Math.sqrt(1 - y * y);
    const phi = goldenAngle * i;
    out.push(new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r));
  }
  return out;
}

export interface SampleContribution {
  dir: THREE.Vector3;
  Li: number;
  brdf: number;
  cos: number;
  contrib: number; // Li * brdf * cos
}

/**
 * Numerical estimate of the reflection equation over the upper hemisphere.
 * NOT a real path tracer — uniform deterministic samples × dω.
 */
export function estimateReflectionIntegral(
  samples: THREE.Vector3[],
  Li: (dir: THREE.Vector3) => number,
  brdf: (wi: THREE.Vector3) => number,
  n: THREE.Vector3,
): { Lo: number; perSample: SampleContribution[] } {
  if (samples.length === 0) return { Lo: 0, perSample: [] };
  const dOmega = (2 * Math.PI) / samples.length; // hemisphere area / N
  const perSample: SampleContribution[] = [];
  let Lo = 0;
  for (const wi of samples) {
    const cos = Math.max(0, n.dot(wi));
    const li = Li(wi);
    const fr = brdf(wi);
    const c = li * fr * cos * dOmega;
    Lo += c;
    perSample.push({ dir: wi, Li: li, brdf: fr, cos, contrib: c });
  }
  return { Lo, perSample };
}

/**
 * Bounce series: L = E + K·E + K²·E + ... (geometric series of a scalar transport
 * operator, parameterised here by an effective scalar throughput K = albedo · geom).
 * Returns array [E, KE, K²E, ...].
 */
export function computeBounceSeries(emission: number, throughput: number, maxBounces: number): number[] {
  const out: number[] = [];
  let term = emission;
  out.push(term);
  for (let i = 1; i <= maxBounces; i++) {
    term *= throughput;
    out.push(term);
  }
  return out;
}

/* ============================================================
 * 2. UI primitives (shared, plain DOM, no extra libs)
 * ============================================================ */

/** Inject the shared CSS once. */
function useDemoStyles(): void {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const id = 'rt03-demo-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = SHARED_CSS;
    document.head.appendChild(style);
  }, []);
}

const SHARED_CSS = `
.rt03-demo {
  --rt03-bg: ${COLOR.bg};
  --rt03-card: ${COLOR.card};
  --rt03-card-s: ${COLOR.cardStrong};
  --rt03-border: ${COLOR.border};
  --rt03-border-s: ${COLOR.borderStrong};
  --rt03-text: ${COLOR.text};
  --rt03-dim: ${COLOR.textDim};
  --rt03-accent: ${COLOR.accent};
  background:
    radial-gradient(800px 400px at 80% -10%, rgba(70,100,180,0.14), transparent 60%),
    var(--rt03-bg);
  color: var(--rt03-text);
  border: 1px solid var(--rt03-border-s);
  border-radius: 14px;
  margin: 22px 0;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(0,0,0,0.35);
}
.rt03-demo-head {
  padding: 14px 18px 8px;
  border-bottom: 1px solid var(--rt03-border);
  background: linear-gradient(180deg, rgba(60,90,160,0.10), transparent);
}
.rt03-demo-eyebrow {
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  color: var(--rt03-accent);
  font-weight: 700;
}
.rt03-demo-title { font-size: 17px; margin: 4px 0 2px; color: #eef1fa; font-weight: 600; }
.rt03-demo-sub { font-size: 13.5px; color: var(--rt03-dim); }
.rt03-demo-body {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 0;
}
@media (max-width: 920px) {
  .rt03-demo-body { grid-template-columns: 1fr; }
}
.rt03-canvas-wrap {
  position: relative;
  background: linear-gradient(180deg, #0a1124 0%, #060914 100%);
  min-height: 460px;
  border-right: 1px solid var(--rt03-border);
}
@media (max-width: 920px) {
  .rt03-canvas-wrap { border-right: none; border-bottom: 1px solid var(--rt03-border); }
}
.rt03-controls {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(10, 15, 28, 0.55);
  min-height: 460px;
}
.rt03-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.rt03-label {
  font-size: 12.5px;
  color: var(--rt03-dim);
  letter-spacing: 0.3px;
}
.rt03-value {
  font-family: 'JetBrains Mono', Menlo, monospace;
  font-size: 12.5px;
  color: #e7eeff;
  background: rgba(80, 110, 180, 0.16);
  padding: 1px 6px;
  border-radius: 4px;
}
.rt03-input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  background: transparent;
  height: 22px;
}
.rt03-input[type="range"]::-webkit-slider-runnable-track {
  height: 4px;
  background: linear-gradient(90deg, ${COLOR.accent}, rgba(120, 145, 200, 0.25));
  border-radius: 2px;
}
.rt03-input[type="range"]::-moz-range-track {
  height: 4px;
  background: rgba(120, 145, 200, 0.3);
  border-radius: 2px;
}
.rt03-input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  margin-top: -5px;
  border: 2px solid ${COLOR.accent};
  cursor: pointer;
}
.rt03-input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid ${COLOR.accent};
  cursor: pointer;
}
.rt03-select, .rt03-button {
  background: rgba(60, 90, 160, 0.18);
  color: var(--rt03-text);
  border: 1px solid var(--rt03-border-s);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
}
.rt03-button:hover { background: rgba(80, 120, 200, 0.28); }
.rt03-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: var(--rt03-text);
}
.rt03-toggle input { accent-color: ${COLOR.accent}; }
.rt03-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 6px 0;
}
.rt03-stat {
  background: var(--rt03-card);
  border: 1px solid var(--rt03-border);
  border-radius: 8px;
  padding: 7px 10px;
}
.rt03-stat-name { font-size: 11px; color: var(--rt03-dim); letter-spacing: 0.3px; }
.rt03-stat-value {
  font-family: 'JetBrains Mono', Menlo, monospace;
  font-size: 14px;
  color: #f4f7ff;
  margin-top: 2px;
}
.rt03-formula {
  background: var(--rt03-card-s);
  border: 1px solid var(--rt03-border-s);
  border-radius: 8px;
  padding: 8px 10px;
  font-family: 'JetBrains Mono', Menlo, monospace;
  font-size: 12.5px;
  color: #e7eeff;
  overflow-x: auto;
}
.rt03-callout {
  background: var(--rt03-card);
  border: 1px solid var(--rt03-border);
  border-left: 3px solid ${COLOR.accent};
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12.5px;
  color: var(--rt03-text);
}
.rt03-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  font-size: 11.5px;
  color: var(--rt03-dim);
  background: rgba(10,15,28,0.55);
  border-top: 1px solid var(--rt03-border);
  padding: 8px 16px;
}
.rt03-legend span { display: inline-flex; align-items: center; gap: 6px; }
.rt03-legend i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: currentColor;
}
.rt03-bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'JetBrains Mono', Menlo, monospace;
  font-size: 11.5px;
  color: var(--rt03-text);
  margin: 1px 0;
}
.rt03-bar-row .name { width: 36px; color: var(--rt03-dim); }
.rt03-bar-row .bar {
  flex: 1;
  height: 6px;
  background: rgba(120, 145, 200, 0.14);
  border-radius: 3px;
  overflow: hidden;
}
.rt03-bar-row .bar > i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, ${COLOR.accent}, ${COLOR.indirect});
}
.rt03-section { font-size: 12px; color: var(--rt03-dim); margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1.2px; }
`;

interface DemoShellProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  legend?: { color: string; label: string }[];
}

export function DemoShell({ eyebrow, title, subtitle, children, legend }: DemoShellProps): JSX.Element {
  useDemoStyles();
  return (
    <div className="rt03-demo">
      <div className="rt03-demo-head">
        <div className="rt03-demo-eyebrow">{eyebrow}</div>
        <div className="rt03-demo-title">{title}</div>
        {subtitle ? <div className="rt03-demo-sub">{subtitle}</div> : null}
      </div>
      <div className="rt03-demo-body">{children}</div>
      {legend && legend.length > 0 ? (
        <div className="rt03-legend">
          {legend.map((l, i) => (
            <span key={i} style={{ color: l.color }}>
              <i />
              <span style={{ color: COLOR.textDim }}>{l.label}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface StatProps {
  name: string;
  value: string | number;
}
export function Stat({ name, value }: StatProps): JSX.Element {
  return (
    <div className="rt03-stat">
      <div className="rt03-stat-name">{name}</div>
      <div className="rt03-stat-value">{typeof value === 'number' ? formatNumber(value) : value}</div>
    </div>
  );
}

function formatNumber(x: number): string {
  if (!isFinite(x)) return '∞';
  if (Math.abs(x) >= 1000) return x.toFixed(0);
  if (Math.abs(x) >= 10) return x.toFixed(2);
  if (Math.abs(x) >= 1) return x.toFixed(3);
  return x.toFixed(4);
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  unit?: string;
}
export function Slider({ label, value, min, max, step = 0.01, onChange, unit }: SliderProps): JSX.Element {
  return (
    <div>
      <div className="rt03-row">
        <span className="rt03-label">{label}</span>
        <span className="rt03-value">
          {formatNumber(value)}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        className="rt03-input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

interface SelectOption<T extends string> {
  value: T;
  label: string;
}
interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
}
export function Select<T extends string>({ label, value, options, onChange }: SelectProps<T>): JSX.Element {
  return (
    <div className="rt03-row">
      <span className="rt03-label">{label}</span>
      <select
        className="rt03-select"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}
export function Toggle({ label, checked, onChange }: ToggleProps): JSX.Element {
  return (
    <label className="rt03-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function FormulaCard({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="rt03-formula">{children}</div>;
}

export function Callout({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="rt03-callout">{children}</div>;
}

export function Legend({ items }: { items: { color: string; label: string }[] }): JSX.Element {
  return (
    <div className="rt03-legend" style={{ borderTop: 'none', padding: '6px 0 0' }}>
      {items.map((l, i) => (
        <span key={i} style={{ color: l.color }}>
          <i />
          <span style={{ color: COLOR.textDim }}>{l.label}</span>
        </span>
      ))}
    </div>
  );
}

/* ============================================================
 * 3. R3F helpers
 * ============================================================ */

interface ArrowVectorProps {
  origin: [number, number, number] | THREE.Vector3;
  dir: [number, number, number] | THREE.Vector3;
  length?: number;
  color: string;
  thickness?: number;
  label?: string;
}

/** A simple shaft + head arrow built from cylinder + cone, oriented along `dir`. */
export function ArrowVector({ origin, dir, length = 1, color, thickness = 0.025, label }: ArrowVectorProps): JSX.Element {
  const o = useMemo(
    () => (origin instanceof THREE.Vector3 ? origin.clone() : new THREE.Vector3(...origin)),
    [origin],
  );
  const d = useMemo(() => {
    const v = dir instanceof THREE.Vector3 ? dir.clone() : new THREE.Vector3(...dir);
    return safeNormalize(v);
  }, [dir]);

  const headLen = Math.min(0.18, length * 0.28);
  const shaftLen = Math.max(0.001, length - headLen);

  // quaternion that rotates +Y to d
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    return q;
  }, [d]);

  const shaftCenter = useMemo(() => o.clone().add(d.clone().multiplyScalar(shaftLen / 2)), [o, d, shaftLen]);
  const headCenter = useMemo(
    () => o.clone().add(d.clone().multiplyScalar(shaftLen + headLen / 2)),
    [o, d, shaftLen, headLen],
  );
  const tip = useMemo(() => o.clone().add(d.clone().multiplyScalar(length)), [o, d, length]);

  return (
    <group>
      <mesh position={shaftCenter} quaternion={quat}>
        <cylinderGeometry args={[thickness, thickness, shaftLen, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={headCenter} quaternion={quat}>
        <coneGeometry args={[thickness * 2.4, headLen, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      {label ? (
        <Html
          position={tip.toArray() as [number, number, number]}
          style={{
            color,
            fontFamily: 'JetBrains Mono, Menlo, monospace',
            fontSize: '11.5px',
            background: 'rgba(10,15,28,0.7)',
            padding: '1px 5px',
            border: '1px solid rgba(150,175,230,0.25)',
            borderRadius: '4px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            transform: 'translate(8px, -50%)',
          }}
        >
          {label}
        </Html>
      ) : null}
    </group>
  );
}

interface SurfacePatchProps {
  size?: number;
  /** rotation about Z so patch tilts in X (axis stays in scene). */
  tiltZ?: number;
  /** rotation about X so patch tilts in Y. */
  tiltX?: number;
  position?: [number, number, number];
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  showProjection?: boolean;
  /** projection brightness (0..1) — colors the patch. */
  intensity?: number;
}
export function SurfacePatch({
  size = 1.4,
  tiltZ = 0,
  tiltX = 0,
  position = [0, 0, 0],
  color = COLOR.surface,
  emissive,
  emissiveIntensity = 0,
  intensity = 0.5,
}: SurfacePatchProps): JSX.Element {
  const tinted = useMemo(() => {
    // Lerp from base surface to a warmer color as intensity grows.
    const a = new THREE.Color(color);
    const b = new THREE.Color('#ffe2b0');
    return a.lerp(b, clamp01(intensity)).getStyle();
  }, [color, intensity]);
  return (
    <group position={position} rotation={[tiltX, 0, tiltZ]}>
      <mesh>
        <boxGeometry args={[size, 0.04, size]} />
        <meshStandardMaterial
          color={tinted}
          roughness={0.85}
          metalness={0.0}
          emissive={emissive ?? '#000000'}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      {/* outline */}
      <Line
        points={[
          [-size / 2, 0.025, -size / 2],
          [size / 2, 0.025, -size / 2],
          [size / 2, 0.025, size / 2],
          [-size / 2, 0.025, size / 2],
          [-size / 2, 0.025, -size / 2],
        ]}
        color={COLOR.borderStrong}
        lineWidth={1}
      />
    </group>
  );
}

interface HemisphereProps {
  radius?: number;
  position?: [number, number, number];
  color?: string;
  opacity?: number;
}
export function Hemisphere({ radius = 1, position = [0, 0, 0], color = COLOR.hemi, opacity = 0.08 }: HemisphereProps): JSX.Element {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[radius, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>
      {/* equator ring */}
      <Line
        points={ringPoints(radius, 64)}
        color={COLOR.hemi}
        lineWidth={1}
        transparent
        opacity={0.45}
      />
      {/* meridian */}
      <Line points={meridianPoints(radius, 0, 32)} color={COLOR.hemi} lineWidth={1} transparent opacity={0.25} />
      <Line points={meridianPoints(radius, Math.PI / 2, 32)} color={COLOR.hemi} lineWidth={1} transparent opacity={0.25} />
    </group>
  );
}

function ringPoints(r: number, n: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
  }
  return out;
}
function meridianPoints(r: number, phi: number, n: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * (Math.PI / 2);
    out.push([Math.cos(phi) * Math.sin(t) * r, Math.cos(t) * r, Math.sin(phi) * Math.sin(t) * r]);
  }
  return out;
}

interface DirectionSamplesProps {
  origin?: [number, number, number];
  dirs: THREE.Vector3[];
  /** scaled per direction — if not provided, uniform unit length. */
  intensity?: number[];
  /** color per direction; falls back to default. */
  color?: string;
  baseLength?: number;
}
export function DirectionSamples({
  origin = [0, 0, 0],
  dirs,
  intensity,
  color = COLOR.incident,
  baseLength = 1,
}: DirectionSamplesProps): JSX.Element {
  return (
    <group position={origin}>
      {dirs.map((d, i) => {
        const k = intensity ? clamp01(intensity[i] ?? 0) : 1;
        const len = 0.25 + baseLength * 0.85 * k;
        const c = blendColor(color, k);
        return (
          <ArrowVector
            key={i}
            origin={[0, 0, 0]}
            dir={d}
            length={len}
            color={c}
            thickness={0.012 + 0.012 * k}
          />
        );
      })}
    </group>
  );
}

function blendColor(base: string, t: number): string {
  // brighter when t→1
  const c = new THREE.Color(base);
  const w = new THREE.Color('#ffffff');
  return c.lerp(w, 0.25 * t).getStyle();
}

interface BRDFLobeProps {
  /** surface normal (unit). */
  n: THREE.Vector3;
  /** incident direction (unit), pointing from surface toward light. */
  wi: THREE.Vector3;
  mode: 'diffuse' | 'glossy' | 'mirror';
  roughness: number;
  albedo: number;
  scale?: number;
}
export function BRDFLobe({ n, wi, mode, roughness, albedo, scale = 1 }: BRDFLobeProps): JSX.Element {
  const geom = useMemo(() => {
    return buildLobeGeometry(n, wi, mode, roughness, albedo, scale);
  }, [n, wi, mode, roughness, albedo, scale]);

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color={mode === 'mirror' ? '#ffd9b8' : mode === 'glossy' ? '#ffb682' : '#ffd9aa'}
        emissive={COLOR.outgoing}
        emissiveIntensity={0.35}
        transparent
        opacity={mode === 'mirror' ? 0.55 : 0.45}
        side={THREE.DoubleSide}
        roughness={0.6}
      />
    </mesh>
  );
}

/** Build a hemisphere of vertices, displaced radially by f_r(wi, wo)·cos. */
function buildLobeGeometry(
  n: THREE.Vector3,
  wi: THREE.Vector3,
  mode: 'diffuse' | 'glossy' | 'mirror',
  roughness: number,
  albedo: number,
  scale: number,
): THREE.BufferGeometry {
  const stacks = 18;
  const slices = 28;
  const positions: number[] = [];
  const indices: number[] = [];
  const evaluate = (wo: THREE.Vector3): number => {
    if (n.dot(wo) <= 0) return 0;
    if (mode === 'diffuse') return lambertBRDF(albedo);
    if (mode === 'glossy') return glossyBRDFApprox(wi, wo, n, roughness, albedo);
    return mirrorBRDFApprox(wi, wo, n);
  };

  // Use an orthonormal basis around n.
  const nx = Math.abs(n.x) > 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const t = new THREE.Vector3().crossVectors(n, nx).normalize();
  const b = new THREE.Vector3().crossVectors(n, t).normalize();

  for (let i = 0; i <= stacks; i++) {
    const theta = (i / stacks) * (Math.PI / 2);
    for (let j = 0; j <= slices; j++) {
      const phi = (j / slices) * Math.PI * 2;
      const wo = new THREE.Vector3()
        .addScaledVector(t, Math.sin(theta) * Math.cos(phi))
        .addScaledVector(b, Math.sin(theta) * Math.sin(phi))
        .addScaledVector(n, Math.cos(theta));
      const r = Math.max(0, evaluate(wo)) * scale;
      const p = wo.clone().multiplyScalar(Math.min(2.5, r) * 0.6 + 0.04); // tiny base radius for visibility
      positions.push(p.x, p.y, p.z);
    }
  }
  const stride = slices + 1;
  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < slices; j++) {
      const a = i * stride + j;
      const b2 = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, b2, b2, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

interface BeamConeProps {
  origin: [number, number, number];
  target: [number, number, number];
  baseRadius: number;
  tipRadius: number;
  color?: string;
  opacity?: number;
}
/**
 * A wireframe-ish frustum from origin to target. Used to visualize a
 * differential beam carrying radiance.
 */
export function BeamCone({ origin, target, baseRadius, tipRadius, color = COLOR.outgoing, opacity = 0.18 }: BeamConeProps): JSX.Element {
  const o = useMemo(() => new THREE.Vector3(...origin), [origin]);
  const tgt = useMemo(() => new THREE.Vector3(...target), [target]);
  const d = useMemo(() => tgt.clone().sub(o), [o, tgt]);
  const len = d.length();
  const dir = useMemo(() => safeNormalize(d), [d]);
  const center = useMemo(() => o.clone().addScaledVector(dir, len / 2), [o, dir, len]);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [dir]);
  return (
    <group>
      <mesh position={center} quaternion={quat}>
        <cylinderGeometry args={[tipRadius, baseRadius, len, 24, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>
      {/* outline rays at 4 sides */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a, i) => {
        const u = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
        const baseP = o.clone().add(u.clone().applyQuaternion(quat).multiplyScalar(baseRadius));
        const tipP = tgt.clone().add(u.clone().applyQuaternion(quat).multiplyScalar(tipRadius));
        return (
          <Line
            key={i}
            points={[baseP.toArray() as [number, number, number], tipP.toArray() as [number, number, number]]}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.7}
          />
        );
      })}
    </group>
  );
}

interface BouncePathProps {
  points: THREE.Vector3[];
  color?: string;
  thickness?: number;
  dashed?: boolean;
}
export function BouncePath({ points, color = COLOR.indirect, thickness = 1.6, dashed = false }: BouncePathProps): JSX.Element {
  const pts = useMemo(() => points.map((p) => p.toArray() as [number, number, number]), [points]);
  return <Line points={pts} color={color} lineWidth={thickness} dashed={dashed} dashSize={0.12} gapSize={0.08} />;
}

interface MiniCornellBoxProps {
  size?: number;
  showLight?: boolean;
}
/**
 * A schematic Cornell-style box: gray floor, red left wall, green right wall,
 * top emissive light, two diffuse / glossy spheres. Geometry is intentionally
 * simple (teaching only).
 */
export function MiniCornellBox({ size = 2.4, showLight = true }: MiniCornellBoxProps): JSX.Element {
  const s = size;
  const h = size;
  return (
    <group>
      {/* floor */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[s, 0.04, s]} />
        <meshStandardMaterial color="#cfd3df" roughness={0.95} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, h / 2, -s / 2]}>
        <boxGeometry args={[s, h, 0.04]} />
        <meshStandardMaterial color="#bdc2cf" roughness={0.95} />
      </mesh>
      {/* left wall (red) */}
      <mesh position={[-s / 2, h / 2, 0]}>
        <boxGeometry args={[0.04, h, s]} />
        <meshStandardMaterial color="#d35a5a" roughness={0.95} />
      </mesh>
      {/* right wall (green) */}
      <mesh position={[s / 2, h / 2, 0]}>
        <boxGeometry args={[0.04, h, s]} />
        <meshStandardMaterial color="#5fb986" roughness={0.95} />
      </mesh>
      {/* ceiling */}
      <mesh position={[0, h, 0]}>
        <boxGeometry args={[s, 0.04, s]} />
        <meshStandardMaterial color="#aab0c0" roughness={0.95} />
      </mesh>
      {/* light */}
      {showLight ? (
        <mesh position={[0, h - 0.05, 0]}>
          <boxGeometry args={[s * 0.45, 0.04, s * 0.45]} />
          <meshStandardMaterial color={COLOR.emission} emissive={COLOR.emission} emissiveIntensity={1.4} />
        </mesh>
      ) : null}
      {/* diffuse sphere (left) */}
      <mesh position={[-s * 0.22, 0.42, s * 0.05]}>
        <sphereGeometry args={[0.42, 32, 24]} />
        <meshStandardMaterial color="#dfe3ee" roughness={0.9} />
      </mesh>
      {/* glossy sphere (right) */}
      <mesh position={[s * 0.22, 0.42, -s * 0.06]}>
        <sphereGeometry args={[0.42, 32, 24]} />
        <meshStandardMaterial color="#cfd9ff" roughness={0.18} metalness={0.55} />
      </mesh>
    </group>
  );
}

interface ContributionBarsProps {
  items: { label: string; value: number; color?: string }[];
  max?: number;
}
export function ContributionBars({ items, max }: ContributionBarsProps): JSX.Element {
  const m = useMemo(() => {
    if (max !== undefined) return max;
    return Math.max(1e-6, ...items.map((it) => it.value));
  }, [items, max]);
  return (
    <div>
      {items.map((it, i) => {
        const w = clamp01(it.value / m) * 100;
        return (
          <div key={i} className="rt03-bar-row">
            <span className="name">{it.label}</span>
            <span className="bar">
              <i style={{ width: `${w}%`, background: it.color ?? `linear-gradient(90deg, ${COLOR.accent}, ${COLOR.indirect})` }} />
            </span>
            <span style={{ width: 64, textAlign: 'right' }}>{formatNumber(it.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * 4. Demo 1 — IrradianceCosineDemo
 * ============================================================ */
interface IrradianceSceneProps {
  thetaDeg: number;
  power: number;
  useCosine: boolean;
  irradiance: number;
  maxIrradiance: number;
}
function IrradianceScene({ thetaDeg, power, useCosine, irradiance, maxIrradiance }: IrradianceSceneProps): JSX.Element {
  // Surface tilts around Z. Normal is the patch's local +Y rotated by tiltZ.
  const tiltZ = degToRad(thetaDeg);
  const n = useMemo(() => new THREE.Vector3(-Math.sin(tiltZ), Math.cos(tiltZ), 0).normalize(), [tiltZ]);
  // Light comes from straight above (+Y).
  const l = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const intensityNorm = clamp01(irradiance / Math.max(1e-3, maxIrradiance));

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 2]} intensity={0.9} />
      {/* Surface patch */}
      <SurfacePatch tiltZ={tiltZ} intensity={intensityNorm * (power > 0 ? 1 : 0)} />
      {/* incident light arrow (downward) */}
      <ArrowVector
        origin={[0, 1.7, 0]}
        dir={[0, -1, 0]}
        length={1.3}
        color={COLOR.incident}
        thickness={0.03}
        label="incident l"
      />
      {/* normal arrow (perpendicular to patch) */}
      <ArrowVector
        origin={[0, 0.04, 0]}
        dir={[n.x, n.y, n.z]}
        length={1}
        color={COLOR.normal}
        thickness={0.022}
        label="normal n"
      />
      {/* projected area indicator: a horizontal rectangle whose width = patch * cosθ */}
      {useCosine && power > 0 ? (
        <mesh position={[0, -0.02, 0]}>
          <boxGeometry args={[1.4 * Math.cos(tiltZ), 0.005, 1.4]} />
          <meshBasicMaterial color={COLOR.emission} transparent opacity={0.55} />
        </mesh>
      ) : null}
      <Line
        points={[
          [-1.6, 0, -1.6],
          [1.6, 0, -1.6],
          [1.6, 0, 1.6],
          [-1.6, 0, 1.6],
          [-1.6, 0, -1.6],
        ]}
        color={COLOR.borderStrong}
        lineWidth={1}
        transparent
        opacity={0.4}
      />
    </>
  );
}

export function IrradianceCosineDemo(): JSX.Element {
  const [thetaDeg, setThetaDeg] = useState(30);
  const [power, setPower] = useState(5);
  const [useCosine, setUseCosine] = useState(true);

  const theta = degToRad(thetaDeg);
  const cos = Math.cos(theta);
  const ndotl = Math.max(0, cos);
  const E = computeIrradiance(power, new THREE.Vector3(-Math.sin(theta), Math.cos(theta), 0), new THREE.Vector3(0, 1, 0), useCosine);
  const projectedArea = useCosine ? Math.cos(theta) : 1;
  const maxE = power; // when theta = 0 and cosine on (or always if cosine off)

  return (
    <DemoShell
      eyebrow="Demo 01"
      title="Irradiance & Lambert's Cosine Law"
      subtitle="倾斜入射并不会让光变弱，而是同样的 flux 摊到了更大的面积上。"
      legend={[
        { color: COLOR.incident, label: '入射方向 l' },
        { color: COLOR.normal, label: '法线 n' },
        { color: COLOR.emission, label: '投影面积 dA·cosθ' },
        { color: COLOR.surface, label: '接收面 patch' },
      ]}
    >
      <div className="rt03-canvas-wrap" style={{ height: 480 }}>
        <Canvas camera={{ position: [3.4, 2.6, 3.4], fov: 45 }}>
          <IrradianceScene
            thetaDeg={thetaDeg}
            power={power}
            useCosine={useCosine}
            irradiance={E}
            maxIrradiance={maxE}
          />
          <OrbitControls enablePan={false} minDistance={3} maxDistance={9} />
        </Canvas>
      </div>
      <div className="rt03-controls">
        <FormulaCard>E(x) = Φ / dA · cosθ &nbsp; → &nbsp; E = power · max(0, n·l)</FormulaCard>
        <Slider label="入射角 θ" value={thetaDeg} min={0} max={89} step={1} unit="°" onChange={setThetaDeg} />
        <Slider label="光源功率" value={power} min={0} max={10} step={0.1} onChange={setPower} />
        <Toggle label="启用 cosine term" checked={useCosine} onChange={setUseCosine} />

        <div className="rt03-section">实时数值</div>
        <div className="rt03-stat-grid">
          <Stat name="θ" value={`${thetaDeg.toFixed(0)}°`} />
          <Stat name="cos(θ)" value={cos} />
          <Stat name="max(0, n·l)" value={ndotl} />
          <Stat name="投影系数" value={projectedArea} />
          <Stat name="光源功率 Φ/A" value={power} />
          <Stat name="Irradiance E" value={E} />
        </div>

        <Callout>
          关掉 cosine term 你会看到 E ≡ power，不随 θ 变化——这就是为什么没有 cosine 的"光照"是物理上不诚实的。
        </Callout>
        <div style={{ fontSize: 12, color: COLOR.textDim, marginTop: 'auto' }}>
          鼠标拖拽旋转视角 · 滚轮缩放
        </div>
      </div>
    </DemoShell>
  );
}

/* ============================================================
 * 5. Demo 2 — RadianceBeamDemo
 * ============================================================ */
interface RadianceSceneProps {
  tiltDeg: number;
  distance: number;
  solidAngleScale: number;
  flux: number;
}
function RadianceScene({ tiltDeg, distance, solidAngleScale }: RadianceSceneProps): JSX.Element {
  const tilt = degToRad(tiltDeg);
  const cos = Math.cos(tilt);
  // emitter position (below) → receiver position (above), beam length = distance.
  const baseR = 0.6 * solidAngleScale;
  const tipR = baseR;
  const o: [number, number, number] = [0, 0, 0];
  const tgt: [number, number, number] = [0, distance, 0];
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 2]} intensity={0.7} />
      {/* emitter patch (tilted) */}
      <group position={[0, 0, 0]} rotation={[0, 0, tilt]}>
        <mesh>
          <boxGeometry args={[1.2, 0.04, 1.2]} />
          <meshStandardMaterial color={COLOR.emission} emissive={COLOR.emission} emissiveIntensity={0.6} />
        </mesh>
      </group>
      {/* receiver patch (above) */}
      <group position={[0, distance, 0]}>
        <mesh>
          <boxGeometry args={[1.2 * 0.7, 0.04, 1.2 * 0.7]} />
          <meshStandardMaterial color={COLOR.surface} roughness={0.85} />
        </mesh>
      </group>
      {/* projected area on the emitter (rectangle below patch indicating dA·cosθ) */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[1.2 * cos, 0.005, 1.2]} />
        <meshBasicMaterial color={COLOR.outgoing} transparent opacity={0.45} />
      </mesh>
      {/* beam */}
      <BeamCone origin={o} target={tgt} baseRadius={baseR} tipRadius={tipR} color={COLOR.outgoing} opacity={0.18} />
      {/* normal arrow on emitter (rotated with tilt) */}
      <ArrowVector
        origin={[0, 0.05, 0]}
        dir={[-Math.sin(tilt), Math.cos(tilt), 0]}
        length={0.9}
        color={COLOR.normal}
        label="n"
      />
      {/* propagation arrow */}
      <ArrowVector origin={[0, 0.1, 0]} dir={[0, 1, 0]} length={0.6} color={COLOR.outgoing} label="ω" />
      {/* labels */}
      <Html position={[0.7, -0.05, 0]} style={htmlLabel(COLOR.outgoing)}>dA·cosθ</Html>
      <Html position={[baseR + 0.05, distance / 2, 0]} style={htmlLabel(COLOR.outgoing)}>dω</Html>
    </>
  );
}

function htmlLabel(color: string): React.CSSProperties {
  return {
    color,
    fontFamily: 'JetBrains Mono, Menlo, monospace',
    fontSize: '11.5px',
    background: 'rgba(10,15,28,0.7)',
    padding: '1px 5px',
    border: '1px solid rgba(150,175,230,0.25)',
    borderRadius: '4px',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  };
}

export function RadianceBeamDemo(): JSX.Element {
  const [tiltDeg, setTiltDeg] = useState(20);
  const [distance, setDistance] = useState(2.2);
  const [solidAngleScale, setSolidAngleScale] = useState(0.35);
  const [flux, setFlux] = useState(4);

  const dA = 1.2 * 1.2; // emitter face area
  const cos = Math.cos(degToRad(tiltDeg));
  const projectedArea = dA * Math.max(0.01, cos);
  // approximate solid angle by treating tipRadius as a disc area / distance^2
  const tipR = 0.6 * solidAngleScale;
  const dOmega = (Math.PI * tipR * tipR) / (distance * distance);
  const L = computeRadiance(flux, dA, cos, dOmega);

  return (
    <DemoShell
      eyebrow="Demo 02"
      title="Radiance — power per (projected area · solid angle)"
      subtitle="同一束光，不论你从什么角度去切，量出来的 radiance 都不变。"
      legend={[
        { color: COLOR.emission, label: '发光面 dA' },
        { color: COLOR.outgoing, label: '投影面积 / 立体角' },
        { color: COLOR.normal, label: '法线 n' },
        { color: COLOR.surface, label: '接收面' },
      ]}
    >
      <div className="rt03-canvas-wrap" style={{ height: 500 }}>
        <Canvas camera={{ position: [4, 2.5, 4], fov: 45 }}>
          <RadianceScene tiltDeg={tiltDeg} distance={distance} solidAngleScale={solidAngleScale} flux={flux} />
          <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
        </Canvas>
      </div>
      <div className="rt03-controls">
        <FormulaCard>L = d²Φ / (dω · dA · cosθ)</FormulaCard>
        <Slider label="发射面倾角 θ" value={tiltDeg} min={0} max={75} step={1} unit="°" onChange={setTiltDeg} />
        <Slider label="距离 (示意)" value={distance} min={1} max={4} step={0.05} onChange={setDistance} />
        <Slider label="立体角缩放" value={solidAngleScale} min={0.1} max={0.8} step={0.01} onChange={setSolidAngleScale} />
        <Slider label="flux Φ" value={flux} min={0.1} max={10} step={0.1} onChange={setFlux} />

        <div className="rt03-section">实时数值</div>
        <div className="rt03-stat-grid">
          <Stat name="dA" value={dA} />
          <Stat name="cos(θ)" value={cos} />
          <Stat name="dA·cosθ" value={projectedArea} />
          <Stat name="dω (sr)" value={dOmega} />
          <Stat name="Φ" value={flux} />
          <Stat name="L = Φ/(dA·cosθ·dω)" value={L} />
        </div>

        <Callout>
          注意：在真实物理中 radiance 沿真空中的 ray 是 <i>常量</i>，不会因为距离自动衰减。
          这里改距离只是改变了你"测量 dω 时的几何尺度"——L 的值会跟着 dω 变。
        </Callout>
      </div>
    </DemoShell>
  );
}

/* ============================================================
 * 6. Demo 3 — BRDFLobeDemo
 * ============================================================ */
type MaterialMode = 'diffuse' | 'glossy' | 'mirror';

interface BRDFSceneProps {
  mode: MaterialMode;
  roughness: number;
  albedo: number;
  incidentDeg: number;
  viewDeg: number;
}
function BRDFScene({ mode, roughness, albedo, incidentDeg, viewDeg }: BRDFSceneProps): JSX.Element {
  const n = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const incidentTheta = degToRad(incidentDeg);
  const viewTheta = degToRad(viewDeg);
  // Place wi & wo in the X-Y plane for clarity.
  const wi = useMemo(() => new THREE.Vector3(-Math.sin(incidentTheta), Math.cos(incidentTheta), 0), [incidentTheta]);
  const wo = useMemo(() => new THREE.Vector3(Math.sin(viewTheta), Math.cos(viewTheta), 0), [viewTheta]);

  // Rough scaling so lobes are visually comparable.
  const lobeScale = mode === 'diffuse' ? 1.2 : mode === 'glossy' ? 0.45 : 0.05;

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 2]} intensity={0.7} />
      {/* Surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.6, 0.04, 2.6]} />
        <meshStandardMaterial color={COLOR.surface} roughness={0.9} />
      </mesh>
      <Hemisphere radius={1.05} />
      {/* normal */}
      <ArrowVector origin={[0, 0.04, 0]} dir={[0, 1, 0]} length={1.1} color={COLOR.normal} label="n" />
      {/* incident (from light to surface — drawn as inbound arrow toward p) */}
      <ArrowVector
        origin={[wi.x * 1.4, wi.y * 1.4, wi.z * 1.4]}
        dir={[-wi.x, -wi.y, -wi.z]}
        length={1.1}
        color={COLOR.incident}
        label="ωᵢ"
      />
      {/* view direction outgoing */}
      <ArrowVector origin={[0, 0.04, 0]} dir={[wo.x, wo.y, wo.z]} length={1.05} color={COLOR.outgoing} label="ωₒ" />
      {/* lobe */}
      <BRDFLobe n={n} wi={wi} mode={mode} roughness={roughness} albedo={albedo} scale={lobeScale} />
    </>
  );
}

export function BRDFLobeDemo(): JSX.Element {
  const [mode, setMode] = useState<MaterialMode>('glossy');
  const [roughness, setRoughness] = useState(0.35);
  const [albedo, setAlbedo] = useState(0.7);
  const [incidentDeg, setIncidentDeg] = useState(45);
  const [viewDeg, setViewDeg] = useState(30);
  const [Li] = useState(1);

  const n = new THREE.Vector3(0, 1, 0);
  const incidentTheta = degToRad(incidentDeg);
  const viewTheta = degToRad(viewDeg);
  const wi = new THREE.Vector3(-Math.sin(incidentTheta), Math.cos(incidentTheta), 0);
  const wo = new THREE.Vector3(Math.sin(viewTheta), Math.cos(viewTheta), 0);
  const ndotwi = Math.max(0, n.dot(wi));
  const fr =
    mode === 'diffuse'
      ? lambertBRDF(albedo)
      : mode === 'glossy'
        ? glossyBRDFApprox(wi, wo, n, roughness, albedo)
        : mirrorBRDFApprox(wi, wo, n);
  const contrib = Li * fr * ndotwi;

  return (
    <DemoShell
      eyebrow="Demo 03"
      title="BRDF — material's directional reallocation"
      subtitle="diffuse / glossy / mirror 三类材质的 lobe 形状本质不同。"
      legend={[
        { color: COLOR.incident, label: 'ωᵢ 入射' },
        { color: COLOR.outgoing, label: 'ωₒ / lobe' },
        { color: COLOR.normal, label: '法线 n' },
        { color: COLOR.hemi, label: '上半球 Ω+' },
      ]}
    >
      <div className="rt03-canvas-wrap" style={{ height: 500 }}>
        <Canvas camera={{ position: [3.2, 2.6, 3.2], fov: 45 }}>
          <BRDFScene
            mode={mode}
            roughness={roughness}
            albedo={albedo}
            incidentDeg={incidentDeg}
            viewDeg={viewDeg}
          />
          <OrbitControls enablePan={false} minDistance={3} maxDistance={9} />
        </Canvas>
      </div>
      <div className="rt03-controls">
        <FormulaCard>f_r(p, ωᵢ → ωₒ) = dL_r(ωₒ) / dE_i(ωᵢ) &nbsp;|&nbsp; Lambertian f_r = ρ / π</FormulaCard>
        <Select<MaterialMode>
          label="材质类型"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'diffuse', label: 'Lambertian (diffuse)' },
            { value: 'glossy', label: 'Glossy' },
            { value: 'mirror', label: 'Mirror-like' },
          ]}
        />
        <Slider label="roughness" value={roughness} min={0.05} max={1} step={0.01} onChange={setRoughness} />
        <Slider label="albedo ρ" value={albedo} min={0} max={1} step={0.01} onChange={setAlbedo} />
        <Slider label="入射角" value={incidentDeg} min={0} max={85} step={1} unit="°" onChange={setIncidentDeg} />
        <Slider label="观察角" value={viewDeg} min={0} max={85} step={1} unit="°" onChange={setViewDeg} />

        <div className="rt03-section">实时数值</div>
        <div className="rt03-stat-grid">
          <Stat name="ωᵢ · n" value={ndotwi} />
          <Stat name="approx f_r" value={fr} />
          <Stat name="L_i" value={Li} />
          <Stat name="贡献 = L_i·f_r·cosθ" value={contrib} />
        </div>

        <Callout>
          降低 roughness 看 glossy lobe 收紧到镜面方向；切到 Mirror 时 lobe 几乎只在反射方向上有值——这正是 δ-like 的极限情形。
        </Callout>
      </div>
    </DemoShell>
  );
}

/* ============================================================
 * 7. Demo 4 — ReflectionEquationDemo
 * ============================================================ */
type LightMode = 'directional' | 'area' | 'environment';

interface ReflSceneProps {
  contributions: SampleContribution[];
  wo: THREE.Vector3;
  maxContrib: number;
}
function ReflectionScene({ contributions, wo, maxContrib }: ReflSceneProps): JSX.Element {
  const dirs = useMemo(() => contributions.map((c) => c.dir), [contributions]);
  const intensities = useMemo(
    () => contributions.map((c) => (maxContrib > 1e-8 ? c.contrib / maxContrib : 0)),
    [contributions, maxContrib],
  );
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 2]} intensity={0.7} />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.6, 0.04, 2.6]} />
        <meshStandardMaterial color={COLOR.surface} roughness={0.9} />
      </mesh>
      <Hemisphere radius={1.1} />
      <ArrowVector origin={[0, 0.04, 0]} dir={[0, 1, 0]} length={1.05} color={COLOR.normal} label="n" />
      <ArrowVector origin={[0, 0.04, 0]} dir={[wo.x, wo.y, wo.z]} length={1} color={COLOR.outgoing} label="ωₒ" />
      <DirectionSamples origin={[0, 0.04, 0]} dirs={dirs} intensity={intensities} color={COLOR.incident} baseLength={0.95} />
    </>
  );
}

export function ReflectionEquationDemo(): JSX.Element {
  const [lightMode, setLightMode] = useState<LightMode>('area');
  const [sampleCount, setSampleCount] = useState<8 | 16 | 32 | 64>(32);
  const [roughness, setRoughness] = useState(0.5);
  const [albedo, setAlbedo] = useState(0.7);
  const [lightAngleDeg, setLightAngleDeg] = useState(40);
  const [viewDeg, setViewDeg] = useState(20);

  const n = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const wo = useMemo(
    () => new THREE.Vector3(Math.sin(degToRad(viewDeg)), Math.cos(degToRad(viewDeg)), 0),
    [viewDeg],
  );

  const samples = useMemo(() => sampleHemisphere(sampleCount), [sampleCount]);

  // Define L_i(wi) for the chosen light mode.
  const lightDir = useMemo(() => {
    const t = degToRad(lightAngleDeg);
    return new THREE.Vector3(-Math.sin(t), Math.cos(t), 0).normalize();
  }, [lightAngleDeg]);

  const Li = useMemo(() => {
    return (wi: THREE.Vector3): number => {
      if (lightMode === 'directional') {
        // sharp lobe centered at lightDir
        const k = Math.max(0, wi.dot(lightDir));
        return Math.pow(k, 32) * 8;
      }
      if (lightMode === 'area') {
        // a soft cap centered at lightDir
        const k = Math.max(0, wi.dot(lightDir));
        return Math.pow(k, 6) * 1.6;
      }
      // environment: low constant + a hint toward +Y
      return 0.5 + 0.4 * Math.max(0, wi.y);
    };
  }, [lightMode, lightDir]);

  const brdf = useMemo(() => {
    return (wi: THREE.Vector3): number => glossyBRDFApprox(wi, wo, n, roughness, albedo);
  }, [wo, n, roughness, albedo]);

  const { Lo, perSample } = useMemo(
    () => estimateReflectionIntegral(samples, Li, brdf, n),
    [samples, Li, brdf, n],
  );

  const sorted = useMemo(() => [...perSample].sort((a, b) => b.contrib - a.contrib), [perSample]);
  const top = sorted.slice(0, 6);
  const maxContrib = useMemo(() => Math.max(1e-8, ...perSample.map((s) => s.contrib)), [perSample]);
  const avgContrib = useMemo(
    () => (perSample.length ? perSample.reduce((s, c) => s + c.contrib, 0) / perSample.length : 0),
    [perSample],
  );
  const strongest = sorted[0];

  return (
    <DemoShell
      eyebrow="Demo 04"
      title="Reflection Equation — hemispherical integral"
      subtitle="所有入射方向的贡献加起来，才是 ωₒ 上的 outgoing radiance。"
      legend={[
        { color: COLOR.incident, label: '入射采样' },
        { color: COLOR.outgoing, label: 'ωₒ' },
        { color: COLOR.normal, label: 'n' },
      ]}
    >
      <div className="rt03-canvas-wrap" style={{ height: 520 }}>
        <Canvas camera={{ position: [3.4, 2.8, 3.4], fov: 45 }}>
          <ReflectionScene contributions={perSample} wo={wo} maxContrib={maxContrib} />
          <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
        </Canvas>
      </div>
      <div className="rt03-controls">
        <FormulaCard>L_o(ωₒ) = ∫_{'{Ω+}'} f_r · L_i · cosθᵢ · dωᵢ</FormulaCard>
        <Select<LightMode>
          label="光源模式"
          value={lightMode}
          onChange={setLightMode}
          options={[
            { value: 'directional', label: 'directional (点)' },
            { value: 'area', label: 'area light (面)' },
            { value: 'environment', label: 'environment (环境)' },
          ]}
        />
        <Select<string>
          label="采样数"
          value={String(sampleCount)}
          onChange={(v) => setSampleCount(Number(v) as 8 | 16 | 32 | 64)}
          options={[
            { value: '8', label: '8' },
            { value: '16', label: '16' },
            { value: '32', label: '32' },
            { value: '64', label: '64' },
          ]}
        />
        <Slider label="roughness" value={roughness} min={0.08} max={1} step={0.01} onChange={setRoughness} />
        <Slider label="albedo ρ" value={albedo} min={0} max={1} step={0.01} onChange={setAlbedo} />
        <Slider label="光源方向角" value={lightAngleDeg} min={0} max={85} step={1} unit="°" onChange={setLightAngleDeg} />
        <Slider label="观察方向角" value={viewDeg} min={0} max={70} step={1} unit="°" onChange={setViewDeg} />

        <div className="rt03-section">累计 L_o</div>
        <div className="rt03-stat-grid">
          <Stat name="样本数 N" value={sampleCount} />
          <Stat name="dω = 2π/N" value={(2 * Math.PI) / sampleCount} />
          <Stat name="L_o (近似)" value={Lo} />
          <Stat name="平均贡献" value={avgContrib} />
          <Stat name="峰值贡献" value={strongest ? strongest.contrib : 0} />
          <Stat
            name="最强方向 (n·ω)"
            value={strongest ? strongest.cos : 0}
          />
        </div>

        <div className="rt03-section">前 6 个最强方向</div>
        <ContributionBars
          items={top.map((s, i) => ({
            label: `#${i + 1}`,
            value: s.contrib,
          }))}
          max={maxContrib}
        />

        <Callout>
          采样数翻倍时 L_o 会更接近真实积分。靠近法线的方向，cosθ 更大，贡献天然更高——这是物理事实，不是 bug。
        </Callout>
      </div>
    </DemoShell>
  );
}

/* ============================================================
 * 8. Demo 5 — RenderingEquationDemo
 * ============================================================ */
interface RenderingSceneProps {
  bounceCount: number;
  showIndirect: boolean;
  selectedPoint: 'left-sphere' | 'right-sphere' | 'floor';
}
function RenderingScene({ bounceCount, showIndirect, selectedPoint }: RenderingSceneProps): JSX.Element {
  const lightCenter = new THREE.Vector3(0, 2.35, 0);
  const cameraEye = new THREE.Vector3(0, 1.0, 2.6);
  const target =
    selectedPoint === 'left-sphere'
      ? new THREE.Vector3(-0.53, 0.42, 0.12)
      : selectedPoint === 'right-sphere'
        ? new THREE.Vector3(0.53, 0.42, -0.14)
        : new THREE.Vector3(0.0, 0.04, 0.5);

  // Predefined didactic paths (Cornell-style).
  const directPath = [lightCenter, target, cameraEye];
  const wallLeft = new THREE.Vector3(-1.18, 1.2, 0);
  const wallRight = new THREE.Vector3(1.18, 1.2, 0);
  const floorPt = new THREE.Vector3(0, 0.04, 0.4);

  const oneBouncePaths = [
    [lightCenter, wallLeft, target, cameraEye],
    [lightCenter, wallRight, target, cameraEye],
  ];
  const twoBouncePaths = [
    [lightCenter, wallLeft, floorPt, target, cameraEye],
    [lightCenter, wallRight, floorPt, target, cameraEye],
  ];
  const threeBouncePaths = [
    [lightCenter, wallLeft, floorPt, wallRight, target, cameraEye],
  ];

  const allIndirect: THREE.Vector3[][] = [];
  if (showIndirect) {
    if (bounceCount >= 2) allIndirect.push(...oneBouncePaths);
    if (bounceCount >= 3) allIndirect.push(...twoBouncePaths);
    if (bounceCount >= 4) allIndirect.push(...threeBouncePaths);
  }

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 2.2, 0]} intensity={0.9} color={COLOR.emission} />
      <MiniCornellBox size={2.6} />
      {/* shading point marker */}
      <mesh position={target.toArray() as [number, number, number]}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshStandardMaterial color={COLOR.outgoing} emissive={COLOR.outgoing} emissiveIntensity={0.7} />
      </mesh>
      {/* camera marker */}
      <mesh position={cameraEye.toArray() as [number, number, number]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
      <Html position={cameraEye.toArray() as [number, number, number]} style={htmlLabel('#ffffff')}>
        camera
      </Html>
      {/* direct path always visible if bounceCount >= 1 */}
      {bounceCount >= 1 ? (
        <>
          <BouncePath points={directPath} color={COLOR.emission} thickness={2.2} />
        </>
      ) : null}
      {/* indirect paths */}
      {allIndirect.map((p, i) => (
        <BouncePath key={i} points={p} color={COLOR.indirect} thickness={1.6} dashed />
      ))}
    </>
  );
}

export function RenderingEquationDemo(): JSX.Element {
  const [bounceCount, setBounceCount] = useState(2);
  const [albedo, setAlbedo] = useState(0.65);
  const [lightStrength, setLightStrength] = useState(1.6);
  const [showIndirect, setShowIndirect] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<'left-sphere' | 'right-sphere' | 'floor'>('floor');

  // Effective scalar transport — albedo modulated by selected point's geometric exposure.
  const geomFactor = selectedPoint === 'floor' ? 0.85 : 0.7;
  const K = albedo * geomFactor;
  const E = 0; // shading point is non-emissive
  const directE = lightStrength; // KE input — direct illumination magnitude
  const series = useMemo(() => computeBounceSeries(directE, K, bounceCount), [directE, K, bounceCount]);

  // Radiance accumulated at the shading point depending on whether indirect is shown.
  const directOnly = series[0] ?? 0; // KE
  const total = showIndirect ? series.reduce((a, b) => a + b, 0) : (series[0] ?? 0);
  const indirectRatio = total > 1e-6 ? clamp01(1 - directOnly / total) : 0;

  const labels = ['E', 'KE', 'K²E', 'K³E', 'K⁴E'];
  const items = series.map((v, i) => ({
    label: labels[i] ?? `K^${i}E`,
    value: showIndirect || i <= 1 ? v : 0,
  }));

  return (
    <DemoShell
      eyebrow="Demo 05"
      title="Rendering Equation — recursive light transport"
      subtitle="L = E + KE + K²E + K³E + ... — 直接光 + 各阶间接光 = global illumination"
      legend={[
        { color: COLOR.emission, label: '光源 / 直接路径' },
        { color: COLOR.indirect, label: '间接 bounce' },
        { color: COLOR.outgoing, label: '着色点' },
      ]}
    >
      <div className="rt03-canvas-wrap" style={{ height: 540 }}>
        <Canvas camera={{ position: [3.2, 2.4, 3.4], fov: 45 }}>
          <RenderingScene bounceCount={bounceCount} showIndirect={showIndirect} selectedPoint={selectedPoint} />
          <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
        </Canvas>
      </div>
      <div className="rt03-controls">
        <FormulaCard>L_o = L_e + ∫ f_r · L_i · cosθᵢ · dωᵢ &nbsp;⟹&nbsp; L = E + KE + K²E + K³E + ...</FormulaCard>
        <Slider label="bounce 数" value={bounceCount} min={0} max={4} step={1} onChange={(v) => setBounceCount(Math.round(v))} />
        <Slider label="albedo (throughput)" value={albedo} min={0} max={1} step={0.01} onChange={setAlbedo} />
        <Slider label="光源强度" value={lightStrength} min={0} max={4} step={0.05} onChange={setLightStrength} />
        <Toggle label="显示间接光照 (global illumination)" checked={showIndirect} onChange={setShowIndirect} />
        <Select<'left-sphere' | 'right-sphere' | 'floor'>
          label="着色点"
          value={selectedPoint}
          onChange={setSelectedPoint}
          options={[
            { value: 'floor', label: 'floor 地板' },
            { value: 'left-sphere', label: 'left sphere 漫反射球' },
            { value: 'right-sphere', label: 'right sphere 光泽球' },
          ]}
        />

        <div className="rt03-section">能量级数</div>
        <ContributionBars items={items} />

        <div className="rt03-stat-grid">
          <Stat name="K = ρ·geom" value={K} />
          <Stat name="E (自发光)" value={E} />
          <Stat name="KE (直接)" value={series[0] ?? 0} />
          <Stat name="K²E (1次间接)" value={series[1] ?? 0} />
          <Stat name="累计 L" value={total} />
          <Stat name="indirect ratio" value={indirectRatio} />
        </div>

        <Callout>
          这是 rendering equation 的 <i>结构示意</i>，不是真实 path tracer。
          albedo 越接近 1，高阶项衰减越慢，间接光占比越高——这正是 white room 里很难"全黑"的原因。
        </Callout>
      </div>
    </DemoShell>
  );
}

/* ============================================================
 * 9. Default export — render all five demos in order
 * ============================================================ */
export default function RayTracing03Interactive(): JSX.Element {
  return (
    <>
      <IrradianceCosineDemo />
      <RadianceBeamDemo />
      <BRDFLobeDemo />
      <ReflectionEquationDemo />
      <RenderingEquationDemo />
    </>
  );
}
