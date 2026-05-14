import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { v, sub, cross, dot, add, scale, normalize, intersectTriangle } from './rayUtils.js'
import { Header, ObsTask, Slider, Toggle, Status, Pill, panelStyle, sidePanel } from './ui.jsx'

// --- Steps definitions
const STEPS = [
  { id: 1, label: 'Define ray', desc: 'ray.origin (o) + ray.direction (d)' },
  { id: 2, label: 'Compute edges', desc: 'e₁ = p₁ − p₀, e₂ = p₂ − p₀' },
  { id: 3, label: 'pvec & det', desc: 'pvec = d × e₂; det = e₁ · pvec' },
  { id: 4, label: 'Check |det| > ε', desc: '判断 ray 是否与 triangle 平行 / 退化' },
  { id: 5, label: 'tvec & u', desc: 'tvec = o − p₀; u = (tvec · pvec) / det' },
  { id: 6, label: 'Check 0 ≤ u ≤ 1', desc: 'u 出界则 miss' },
  { id: 7, label: 'qvec & v', desc: 'qvec = tvec × e₁; v = (d · qvec) / det' },
  { id: 8, label: 'Check v ≥ 0 & u + v ≤ 1', desc: '在 triangle 内才能命中' },
  { id: 9, label: 'Compute t', desc: 't = (e₂ · qvec) / det; 要求 t > ε' },
  { id: 10, label: 'Result', desc: 'hit (t, u, v) or miss' },
]

function StepLine({ active, ok, num, title, detail }) {
  const color = ok === null ? (active ? '#fbbf24' : '#666') : ok ? '#4ade80' : '#f87171'
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '6px 10px', borderRadius: 6,
      background: active ? 'rgba(251,191,36,0.07)' : 'transparent',
      border: active ? '1px solid rgba(251,191,36,0.25)' : '1px solid transparent',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 4, fontSize: 11, fontFamily: 'monospace',
        background: color + '22', color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}33`, flexShrink: 0,
      }}>
        {num}
      </div>
      <div>
        <div style={{ fontSize: 11, color: active ? '#fde68a' : '#aaa', fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 10, color: '#666', fontFamily: 'monospace', marginTop: 1 }}>{detail}</div>
      </div>
    </div>
  )
}

function Scene3D({ ray, p0, p1, p2, hit }) {
  const e1 = sub(p1, p0)
  const e2 = sub(p2, p0)

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 4, 4]} intensity={0.7} />

      {/* triangle */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={3} args={[new Float32Array([p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z]), 3]} />
        </bufferGeometry>
        <meshStandardMaterial color={hit?.hit ? '#4ade80' : '#6366f1'} side={THREE.DoubleSide} transparent opacity={0.45} />
      </mesh>

      {/* edges e1, e2 */}
      <Line points={[[p0.x, p0.y, p0.z], [p1.x, p1.y, p1.z]]} color="#fbbf24" lineWidth={3} />
      <Line points={[[p0.x, p0.y, p0.z], [p2.x, p2.y, p2.z]]} color="#f43f5e" lineWidth={3} />
      <Line points={[[p1.x, p1.y, p1.z], [p2.x, p2.y, p2.z]]} color="#a5b4fc" lineWidth={1.5} />

      <Html position={[p0.x - 0.1, p0.y - 0.2, p0.z]}><div style={{ color: '#fff', fontSize: 11, fontFamily: 'monospace' }}>p₀</div></Html>
      <Html position={[p1.x + 0.1, p1.y - 0.2, p1.z]}><div style={{ color: '#fbbf24', fontSize: 11, fontFamily: 'monospace' }}>p₁ (e₁)</div></Html>
      <Html position={[p2.x, p2.y + 0.2, p2.z]}><div style={{ color: '#f43f5e', fontSize: 11, fontFamily: 'monospace' }}>p₂ (e₂)</div></Html>

      {/* ray */}
      <Line points={[[ray.origin.x, ray.origin.y, ray.origin.z], [ray.origin.x + ray.direction.x * 10, ray.origin.y + ray.direction.y * 10, ray.origin.z + ray.direction.z * 10]]}
        color={hit?.hit ? '#fde68a' : '#94a3b8'} lineWidth={2.5} />

      <mesh position={[ray.origin.x, ray.origin.y, ray.origin.z]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#a5b4fc" />
      </mesh>

      {/* hit */}
      {hit?.hit && (
        <>
          <mesh position={[hit.point.x, hit.point.y, hit.point.z]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
          <Html position={[hit.point.x + 0.15, hit.point.y + 0.15, hit.point.z]}>
            <div style={{ color: '#86efac', fontSize: 11, fontFamily: 'monospace', background: 'rgba(15,15,26,0.8)', padding: '2px 6px', borderRadius: 4 }}>
              t={hit.t.toFixed(2)}, u={hit.u.toFixed(2)}, v={hit.vCoord.toFixed(2)}
            </div>
          </Html>
        </>
      )}

      <gridHelper args={[10, 20, '#1f2937', '#0f172a']} position={[0, -1.5, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

const PRESETS = {
  hit: { o: { x: 0.3, y: 0.2, z: 3 }, ang: 0, ay: 0 },
  miss_u: { o: { x: 1.6, y: 0.0, z: 3 }, ang: 0, ay: 0 },
  miss_v: { o: { x: -1.5, y: 1.1, z: 3 }, ang: 0, ay: 0 },
  parallel: { o: { x: -1, y: 0, z: 0 }, ang: 0, ay: Math.PI / 2 },
  behind: { o: { x: 0.3, y: 0.2, z: -3 }, ang: 0, ay: Math.PI },
}

export default function MollerTrumboreVisualizer() {
  const [step, setStep] = useState(10)
  const [oxy, setOxy] = useState({ x: 0.3, y: 0.2 })
  const [oz, setOz] = useState(3)
  const [angX, setAngX] = useState(0)
  const [angY, setAngY] = useState(0)

  const p0 = v(-1.0, -0.6, 0)
  const p1 = v(1.2, -0.6, 0)
  const p2 = v(0.0, 1.1, 0)

  const ray = useMemo(() => {
    const origin = v(oxy.x, oxy.y, oz)
    const dx = Math.sin(angY) * Math.cos(angX)
    const dy = Math.sin(angX)
    const dz = -Math.cos(angY) * Math.cos(angX)
    return { origin, direction: normalize(v(dx, dy, dz)) }
  }, [oxy, oz, angX, angY])

  const hit = useMemo(() => intersectTriangle(ray, p0, p1, p2), [ray])

  // step-checks
  const e1 = sub(p1, p0)
  const e2 = sub(p2, p0)
  const pvec = cross(ray.direction, e2)
  const det = dot(e1, pvec)
  const detOk = Math.abs(det) > 1e-6
  const tvec = sub(ray.origin, p0)
  const u = detOk ? dot(tvec, pvec) / det : NaN
  const uOk = u >= 0 && u <= 1
  const qvec = cross(tvec, e1)
  const vC = detOk ? dot(ray.direction, qvec) / det : NaN
  const vOk = vC >= 0 && u + vC <= 1
  const t = detOk ? dot(e2, qvec) / det : NaN
  const tOk = t > 1e-6

  const checks = [null, null, null, null, detOk, null, uOk, null, vOk, tOk]

  const applyPreset = (key) => {
    const p = PRESETS[key]
    setOxy({ x: p.o.x, y: p.o.y })
    setOz(p.o.z)
    setAngX(p.ang)
    setAngY(p.ay)
  }

  return (
    <div style={panelStyle}>
      <Header
        title="Möller–Trumbore · 同时求 t、u、v"
        subtitle="拖动 step slider 逐步执行算法。每一步都展示当前判断条件是否通过。"
        right={<Pill ok={hit.hit} label={hit.hit ? `HIT t=${hit.t?.toFixed(2)}` : `MISS · ${hit.reason}`} />}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)' }}>
        <div style={{ height: 540, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas camera={{ position: [3, 2, 4], fov: 45 }}>
            <Scene3D ray={ray} p0={p0} p1={p1} p2={p2} hit={hit} />
          </Canvas>
        </div>
        <div style={sidePanel}>
          <ObsTask>用 Step 滑动条逐步推进。试 4 个预设：hit / miss(u out) / miss(v out) / parallel / behind。</ObsTask>

          <Slider label="STEP" value={step} min={1} max={10} step={1} onChange={setStep} color="#fbbf24" />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {Object.entries(PRESETS).map(([k]) => (
              <Toggle key={k} active={false} onClick={() => applyPreset(k)}>{k}</Toggle>
            ))}
          </div>

          <Slider label="origin x" value={oxy.x} min={-2} max={2} step={0.05} onChange={(x) => setOxy(p => ({ ...p, x }))} />
          <Slider label="origin y" value={oxy.y} min={-2} max={2} step={0.05} onChange={(y) => setOxy(p => ({ ...p, y }))} />
          <Slider label="origin z" value={oz} min={-3} max={5} step={0.05} onChange={setOz} />
          <Slider label="dir pitch" value={angX} min={-1} max={1} step={0.01} onChange={setAngX} />
          <Slider label="dir yaw" value={angY} min={-1.5} max={1.5} step={0.01} onChange={setAngY} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
            {STEPS.slice(0, step).map((s, i) => (
              <StepLine key={s.id} num={s.id} title={s.label} detail={s.desc}
                active={i === step - 1}
                ok={checks[i]} />
            ))}
          </div>

          <Status>
            <div>det = {det.toFixed(4)} {detOk ? <Pill ok label=">ε" /> : <Pill label="parallel" />}</div>
            <div>u = {Number.isFinite(u) ? u.toFixed(3) : '—'} {Number.isFinite(u) && (uOk ? <Pill ok label="0..1" /> : <Pill label="out" />)}</div>
            <div>v = {Number.isFinite(vC) ? vC.toFixed(3) : '—'} {Number.isFinite(vC) && (vOk ? <Pill ok label="ok" /> : <Pill label="out" />)}</div>
            <div>t = {Number.isFinite(t) ? t.toFixed(3) : '—'} {Number.isFinite(t) && (tOk ? <Pill ok label="t>0" /> : <Pill label="behind" />)}</div>
            <div style={{ marginTop: 4, color: hit.hit ? '#4ade80' : '#f87171' }}>{hit.hit ? `result: HIT (t=${hit.t.toFixed(3)}, u=${hit.u.toFixed(3)}, v=${hit.vCoord.toFixed(3)})` : `result: MISS — ${hit.reason}`}</div>
          </Status>

          <details style={{ fontSize: 10, color: '#888' }}>
            <summary style={{ cursor: 'pointer', color: '#a5b4fc' }}>查看伪代码</summary>
            <pre style={{ margin: 0, padding: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 6, color: '#cbd5e1', overflow: 'auto' }}>
{`function intersectTri(ray, p0, p1, p2) {
  const e1 = p1 - p0
  const e2 = p2 - p0
  const pvec = cross(ray.dir, e2)
  const det = dot(e1, pvec)
  if (abs(det) < EPS) return miss
  const invDet = 1 / det
  const tvec = ray.o - p0
  const u = dot(tvec, pvec) * invDet
  if (u < 0 || u > 1) return miss
  const qvec = cross(tvec, e1)
  const v = dot(ray.dir, qvec) * invDet
  if (v < 0 || u + v > 1) return miss
  const t = dot(e2, qvec) * invDet
  return t > EPS ? hit(t, u, v) : miss
}`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}
