import React, { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import * as THREE from 'three'

const C = {
  bg: '#f8fbff',
  card: '#ffffff',
  card2: '#eef5ff',
  line: 'rgba(59,130,246,0.20)',
  text: '#0f172a',
  mute: '#475569',
  blue: '#2563eb',
  cyan: '#0891b2',
  green: '#059669',
  amber: '#d97706',
  orange: '#ea580c',
  red: '#dc2626',
  purple: '#7c3aed',
  pink: '#db2777',
}

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x))
const lerp = (a, b, t) => a + (b - a) * t
const fmt = (n, p = 2) => Number.isFinite(n) ? n.toFixed(p) : '—'

function DemoFrame({ title, subtitle, children, side, accent = C.blue }) {
  return (
    <div style={{ width: '100%', borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.line}`, background: `linear-gradient(180deg, ${C.card}, ${C.card2})`, boxShadow: '0 18px 46px rgba(37,99,235,0.12)', margin: '1.35rem 0' }}>
      <div style={{ padding: '14px 18px 11px', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: accent, fontSize: 13, fontWeight: 800, letterSpacing: '.02em' }}>{title}</div>
          {subtitle && <div style={{ color: C.mute, fontSize: 11, marginTop: 3, lineHeight: 1.55 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: side ? 'minmax(0, 1.75fr) minmax(240px, .8fr)' : '1fr' }} className="gg-demo-grid">
        <div style={{ minHeight: 360 }}>{children}</div>
        {side && <div style={{ borderLeft: `1px solid ${C.line}`, padding: 14, color: C.mute, fontSize: 12, lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(239,246,255,0.86)' }}>{side}</div>}
      </div>
      <style>{`@media(max-width:820px){.gg-demo-grid{grid-template-columns:1fr!important}.gg-demo-grid>div+div{border-left:0!important;border-top:1px solid ${C.line}}}`}</style>
    </div>
  )
}

function Slider({ label, value, min, max, step = 0.01, onChange, unit = '', accent = C.blue }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: C.mute, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
        <span>{label}</span>
        <span style={{ color: accent }}>{Number.isInteger(value) ? value : fmt(value, 2)}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ width: '100%', accentColor: accent }} />
    </label>
  )
}

function ButtonRow({ items, value, onChange, accent = C.blue }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {items.map((it) => (
        <button key={it.value} onClick={() => onChange(it.value)} style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: 999, border: `1px solid ${value === it.value ? accent : C.line}`, background: value === it.value ? `${accent}18` : 'rgba(255,255,255,0.72)', color: value === it.value ? accent : C.mute, fontSize: 11, fontWeight: 700 }}>
          {it.label}
        </button>
      ))}
    </div>
  )
}

function Metric({ label, value, color = C.amber }) {
  return (
    <div style={{ padding: 10, borderRadius: 12, border: `1px solid ${C.line}`, background: 'rgba(255,255,255,0.72)' }}>
      <div style={{ fontSize: 10, color: C.mute, letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: 4, color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>{value}</div>
    </div>
  )
}

function sphereDir(theta, phi) {
  const s = Math.sin(theta)
  return new THREE.Vector3(s * Math.cos(phi), Math.cos(theta), s * Math.sin(phi))
}

function lobeDirections(mode, roughness, count = 44) {
  const dirs = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  const spread = mode === 'diffuse' ? 1 : mode === 'mirror' ? 0.055 : lerp(0.08, 0.9, roughness)
  for (let i = 0; i < count; i++) {
    const u = (i + 0.5) / count
    const theta = mode === 'diffuse' ? Math.acos(1 - u) : Math.pow(u, 0.72) * spread
    const phi = i * golden
    const d = sphereDir(theta, phi)
    const weight = mode === 'diffuse' ? 0.65 + 0.25 * d.y : Math.pow(Math.max(0, d.y), mode === 'mirror' ? 64 : lerp(4, 22, 1 - roughness))
    dirs.push({ d, weight: clamp(weight, 0.06, 1) })
  }
  return dirs
}

function MaterialLobeScene({ mode, roughness, metallic, lightAngle }) {
  const rays = useMemo(() => lobeDirections(mode, roughness), [mode, roughness])
  const lightX = Math.sin(lightAngle) * 3
  const lightZ = Math.cos(lightAngle) * 3
  const color = mode === 'mirror' ? '#dbeafe' : metallic > 0.5 ? '#f5c26b' : '#8fd3ff'
  return (
    <Canvas camera={{ position: [3.7, 2.6, 4.3], fov: 46 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.38} />
      <pointLight position={[lightX, 3.2, lightZ]} intensity={4.6} color="#fff1c2" />
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.72, 64, 32]} />
        <meshStandardMaterial color={color} metalness={metallic} roughness={mode === 'mirror' ? 0.02 : roughness} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.33, 0]}>
        <circleGeometry args={[1.25, 64]} />
        <meshBasicMaterial color="#dbeafe" transparent opacity={0.82} />
      </mesh>
      <Line points={[[0, 0.45, 0], [0, 2.15, 0]]} color={C.green} lineWidth={2} />
      <Html position={[0.06, 2.18, 0]} style={{ color: C.green, fontSize: 11, fontWeight: 800 }}>N</Html>
      <Line points={[[lightX, 2.7, lightZ], [0.15, 0.94, 0.05]]} color={C.amber} lineWidth={2} />
      <mesh position={[lightX, 2.7, lightZ]}>
        <sphereGeometry args={[0.08, 16, 8]} />
        <meshBasicMaterial color={C.amber} />
      </mesh>
      {rays.map(({ d, weight }, i) => {
        const len = 0.38 + weight * 1.45
        const p0 = new THREE.Vector3(0, 1.08, 0)
        const p1 = p0.clone().add(d.clone().multiplyScalar(len))
        const col = mode === 'diffuse' ? C.green : mode === 'mirror' ? C.cyan : C.orange
        return <Line key={i} points={[p0, p1]} color={col} transparent opacity={0.22 + weight * 0.72} lineWidth={1.2 + weight * 2.1} />
      })}
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function MaterialLobeStudio() {
  const [mode, setMode] = useState('glossy')
  const [roughness, setRoughness] = useState(0.35)
  const [metallic, setMetallic] = useState(0.0)
  const [lightAngle, setLightAngle] = useState(0.7)
  const energy = mode === 'diffuse' ? 0.78 : mode === 'mirror' ? 0.98 : clamp(0.92 - roughness * 0.16 + metallic * 0.04)
  const lobeWidth = mode === 'diffuse' ? 'wide / flat' : mode === 'mirror' ? 'delta-like' : `${fmt(roughness * 100, 0)}% rough spread`
  return (
    <DemoFrame
      title="Material Lobe Studio · 材质把光分到哪里？"
      subtitle="切换 diffuse / glossy / mirror，观察出射 lobe、粗糙度和金属度如何改变外观。"
      accent={C.orange}
      side={<>
        <ButtonRow value={mode} onChange={setMode} accent={C.orange} items={[{ value: 'diffuse', label: 'Diffuse' }, { value: 'glossy', label: 'Glossy' }, { value: 'mirror', label: 'Mirror' }]} />
        <Slider label="roughness" value={roughness} min={0.03} max={1} step={0.01} onChange={setRoughness} accent={C.orange} />
        <Slider label="metallic" value={metallic} min={0} max={1} step={0.01} onChange={setMetallic} accent={C.amber} />
        <Slider label="light azimuth" value={lightAngle} min={-Math.PI} max={Math.PI} step={0.01} onChange={setLightAngle} accent={C.blue} unit=" rad" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Metric label="lobe" value={lobeWidth} color={C.orange} />
          <Metric label="energy check" value={`≤ ${fmt(energy)}`} color={energy <= 1 ? C.green : C.red} />
        </div>
        <div>观察：Lambertian 的 lobe 宽而平；glossy 随 roughness 变宽；mirror 接近 delta 分布，只沿反射方向发出。</div>
      </>}
    >
      <MaterialLobeScene mode={mode} roughness={roughness} metallic={metallic} lightAngle={lightAngle} />
    </DemoFrame>
  )
}

function MicrofacetScene({ roughness }) {
  const normals = useMemo(() => {
    const out = []
    for (let i = 0; i < 65; i++) {
      const x = -1.9 + (i % 13) * 0.32
      const z = -1.0 + Math.floor(i / 13) * 0.32
      const seed = Math.sin(i * 91.7) * 43758.5453
      const a = (seed - Math.floor(seed)) * Math.PI * 2
      const tilt = roughness * (0.08 + ((Math.sin(i * 12.989) + 1) / 2) * 0.62)
      const n = new THREE.Vector3(Math.cos(a) * tilt, 1, Math.sin(a) * tilt).normalize()
      out.push({ p: new THREE.Vector3(x, 0, z), n })
    }
    return out
  }, [roughness])
  return (
    <Canvas camera={{ position: [3.2, 2.8, 4.2], fov: 44 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.4, 2.8, 48, 12]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.82} metalness={0.02} />
      </mesh>
      {normals.map(({ p, n }, i) => <Line key={i} points={[p, p.clone().add(n.multiplyScalar(0.32))]} color={i % 5 === 0 ? C.amber : C.cyan} lineWidth={1.5} />)}
      <Line points={[[0, 0, 0], [0, 1.15, 0]]} color={C.green} lineWidth={3} />
      <Html position={[0.05, 1.22, 0]} style={{ color: C.green, fontSize: 11, fontWeight: 800 }}>macro N</Html>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function MicrofacetDFGExplorer() {
  const [roughness, setRoughness] = useState(0.42)
  const [viewAngle, setViewAngle] = useState(48)
  const cos = Math.cos((viewAngle * Math.PI) / 180)
  const D = clamp(Math.pow(1 - roughness, 1.25) * 0.92 + 0.06)
  const F = clamp(0.04 + (1 - 0.04) * Math.pow(1 - cos, 5))
  const G = clamp(1 - roughness * (1 - cos) * 1.25)
  const spec = D * F * G
  return (
    <DemoFrame
      title="Microfacet D · F · G Explorer"
      subtitle="把粗糙表面拆成很多小镜子：D 负责法线分布，F 负责 Fresnel，G 负责遮蔽。"
      accent={C.cyan}
      side={<>
        <Slider label="roughness" value={roughness} min={0.02} max={1} step={0.01} onChange={setRoughness} accent={C.cyan} />
        <Slider label="view angle" value={viewAngle} min={0} max={85} step={1} onChange={setViewAngle} accent={C.purple} unit="°" />
        {[['D normal distribution', D, C.cyan], ['F fresnel', F, C.amber], ['G masking', G, C.green], ['D·F·G specular', spec, C.orange]].map(([label, val, col]) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.mute }}><span>{label}</span><span style={{ color: col }}>{fmt(val, 3)}</span></div>
            <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}><div style={{ width: `${clamp(val) * 100}%`, height: '100%', background: col }} /></div>
          </div>
        ))}
        <div>roughness 越大，微法线越分散，D 越宽、峰值越低；view angle 越接近掠射，F 会迅速上升。</div>
      </>}
    >
      <MicrofacetScene roughness={roughness} />
    </DemoFrame>
  )
}

export function FresnelMetalnessLab() {
  const [f0, setF0] = useState(0.04)
  const [metallic, setMetallic] = useState(0)
  const [angle, setAngle] = useState(62)
  const cos = Math.cos((angle * Math.PI) / 180)
  const effectiveF0 = lerp(f0, 0.78, metallic)
  const F = clamp(effectiveF0 + (1 - effectiveF0) * Math.pow(1 - cos, 5))
  const pts = Array.from({ length: 80 }, (_, i) => {
    const a = (i / 79) * 88
    const c = Math.cos((a * Math.PI) / 180)
    const y = effectiveF0 + (1 - effectiveF0) * Math.pow(1 - c, 5)
    return [30 + (a / 88) * 440, 220 - y * 175]
  })
  return (
    <DemoFrame
      title="Fresnel & Metalness Lab"
      subtitle="Schlick 近似：F = F0 + (1-F0)(1-cosθ)^5。拖到掠射角，所有材质都会更反光。"
      accent={C.amber}
      side={<>
        <Slider label="dielectric F0" value={f0} min={0.02} max={0.12} step={0.005} onChange={setF0} accent={C.amber} />
        <Slider label="metallic" value={metallic} min={0} max={1} step={0.01} onChange={setMetallic} accent={C.orange} />
        <Slider label="view angle" value={angle} min={0} max={88} step={1} onChange={setAngle} accent={C.purple} unit="°" />
        <Metric label="F(angle)" value={fmt(F, 3)} color={C.amber} />
        <div>非金属通常 F0 很低，高光接近白色；金属 F0 高且带有 base color，几乎没有普通 diffuse。</div>
      </>}
    >
      <svg viewBox="0 0 520 260" style={{ width: '100%', height: 360, display: 'block', background: 'linear-gradient(180deg,#f8fbff,#eef6ff)' }}>
        <line x1="30" y1="220" x2="480" y2="220" stroke={C.line} />
        <line x1="30" y1="35" x2="30" y2="220" stroke={C.line} />
        <text x="30" y="240" fill={C.mute} fontSize="11">0° face-on</text>
        <text x="390" y="240" fill={C.mute} fontSize="11">88° grazing</text>
        <text x="8" y="44" fill={C.mute} fontSize="11">F</text>
        <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={C.amber} strokeWidth="4" />
        <circle cx={30 + (angle / 88) * 440} cy={220 - F * 175} r="7" fill={C.orange} />
        <rect x="55" y="65" width="130" height="88" rx="12" fill={`rgba(${Math.round(80 + F * 175)},${Math.round(90 + F * 130)},${Math.round(110 + F * 90)},0.92)`} stroke={C.line} />
        <text x="70" y="100" fill={C.text} fontSize="14" fontWeight="700">visible reflectance</text>
        <text x="70" y="123" fill={C.text} fontSize="22" fontFamily="monospace">{fmt(F, 3)}</text>
      </svg>
    </DemoFrame>
  )
}

function AppearanceStackScene({ material, normalStrength, env }) {
  const mat = material === 'metal'
    ? { color: '#f59e0b', metalness: 1, roughness: 0.22 }
    : material === 'glass'
      ? { color: '#bae6fd', metalness: 0, roughness: 0.02, transmission: 0.45, transparent: true, opacity: 0.55 }
      : material === 'ceramic'
        ? { color: '#fef3c7', metalness: 0, roughness: 0.38 }
        : { color: '#93c5fd', metalness: 0, roughness: 0.74 }
  const ridges = useMemo(() => Array.from({ length: 26 }, (_, i) => -1.25 + i * 0.1), [])
  return (
    <Canvas camera={{ position: [4.2, 2.8, 4.4], fov: 43 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.42 + env * 0.35} />
      <directionalLight position={[3, 4, 2]} intensity={1.2 + env * 2.3} />
      <pointLight position={[-2.2, 2.2, -1.8]} intensity={0.7 + env} color="#bfdbfe" />
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.82, 72, 36]} />
        <meshPhysicalMaterial {...mat} clearcoat={material === 'ceramic' ? 0.55 : 0.1} clearcoatRoughness={0.22} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]}>
        <circleGeometry args={[1.55, 72]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.86} />
      </mesh>
      {ridges.map((x, i) => (
        <Line key={i} points={[[x, 1.48, -0.76], [x + normalStrength * 0.18, 1.48 + normalStrength * 0.06, 0.76]]} color={i % 2 ? C.blue : C.cyan} transparent opacity={0.24 + normalStrength * 0.42} lineWidth={1.1} />
      ))}
      <Line points={[[0, 0.7, 0], [0, 2.05, 0]]} color={C.green} lineWidth={2.5} />
      <Html position={[0.08, 2.08, 0]} style={{ color: C.green, fontSize: 11, fontWeight: 800 }}>macro normal</Html>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function AppearanceStack3D() {
  const [material, setMaterial] = useState('plastic')
  const [normalStrength, setNormalStrength] = useState(0.42)
  const [env, setEnv] = useState(0.7)
  return (
    <DemoFrame title="Appearance Stack 3D · 同一几何为什么能像不同物体" subtitle="固定球体几何，单独调材质、微法线和环境光，观察外观不是单个颜色决定的。" accent={C.blue} side={<>
      <ButtonRow value={material} onChange={setMaterial} accent={C.blue} items={[{ value: 'plastic', label: 'plastic' }, { value: 'ceramic', label: 'ceramic' }, { value: 'metal', label: 'metal' }, { value: 'glass', label: 'glass' }]} />
      <Slider label="normal detail" value={normalStrength} min={0} max={1} step={0.01} onChange={setNormalStrength} accent={C.cyan} />
      <Slider label="environment light" value={env} min={0.05} max={1.2} step={0.01} onChange={setEnv} accent={C.amber} />
      <div>同一个 mesh 更换 BRDF 参数后外观会完全改变；微法线和环境反射会进一步改变高光形状。</div>
    </>}>
      <AppearanceStackScene material={material} normalStrength={normalStrength} env={env} />
    </DemoFrame>
  )
}

function BSDFSplitScene({ reflect, transmit }) {
  const absorb = clamp(1 - reflect - transmit)
  const reflCount = Math.round(8 + reflect * 20)
  const transCount = Math.round(6 + transmit * 18)
  return (
    <Canvas camera={{ position: [3.8, 2.6, 4.5], fov: 45 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[2.8, 4, 3]} intensity={2.1} />
      <mesh position={[0, 0.35, 0]} rotation={[0.1, 0, -0.18]}>
        <boxGeometry args={[1.55, 0.18, 1.55]} />
        <meshPhysicalMaterial color="#bfdbfe" transparent opacity={0.44} transmission={0.34} roughness={0.04} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => -0.64 + i * 0.16).map((o, i) => <Line key={`in-${i}`} points={[[-1.8, 1.72 + o * 0.25, -0.75 + o], [-0.2, 0.5, -0.08 + o * 0.25]]} color={C.amber} lineWidth={1.5} transparent opacity={0.72} />)}
      {Array.from({ length: reflCount }, (_, i) => {
        const a = -0.75 + (i / Math.max(1, reflCount - 1)) * 1.5
        return <Line key={`r-${i}`} points={[[0.05, 0.55, 0], [1.25 + reflect * 0.65, 1.18 + Math.cos(a) * 0.45, a]]} color={C.blue} lineWidth={1.2} transparent opacity={0.24 + reflect * 0.58} />
      })}
      {Array.from({ length: transCount }, (_, i) => {
        const a = -0.7 + (i / Math.max(1, transCount - 1)) * 1.4
        return <Line key={`t-${i}`} points={[[0, 0.28, 0], [0.55 + transmit * 0.9, -0.85, a]]} color={C.green} lineWidth={1.25} transparent opacity={0.2 + transmit * 0.62} />
      })}
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.09 + absorb * 0.24, 24, 12]} />
        <meshBasicMaterial color={C.red} transparent opacity={0.24 + absorb * 0.5} />
      </mesh>
      <Html position={[-1.85, 1.8, -0.9]} style={{ color: C.amber, fontSize: 11, fontWeight: 800 }}>incoming</Html>
      <Html position={[1.55, 1.42, 0.75]} style={{ color: C.blue, fontSize: 11, fontWeight: 800 }}>reflection</Html>
      <Html position={[1.05, -0.96, 0.72]} style={{ color: C.green, fontSize: 11, fontWeight: 800 }}>transmission</Html>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function BSDFSplitLab3D() {
  const [reflect, setReflect] = useState(0.35)
  const [transmit, setTransmitRaw] = useState(0.42)
  const setTransmit = (v) => setTransmitRaw(Math.min(v, 1 - reflect))
  const setReflectSafe = (v) => {
    setReflect(v)
    setTransmitRaw((t) => Math.min(t, 1 - v))
  }
  const absorb = clamp(1 - reflect - transmit)
  return (
    <DemoFrame title="BSDF Split Lab 3D · 反射、透射、吸收的能量账本" subtitle="BRDF 只管反射；BTDF 管透射；合起来的 BSDF 要满足总能量不超过 1。" accent={C.green} side={<>
      <Slider label="reflection" value={reflect} min={0} max={0.95} step={0.01} onChange={setReflectSafe} accent={C.blue} />
      <Slider label="transmission" value={transmit} min={0} max={1 - reflect} step={0.01} onChange={setTransmit} accent={C.green} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <Metric label="R" value={fmt(reflect, 2)} color={C.blue} />
        <Metric label="T" value={fmt(transmit, 2)} color={C.green} />
        <Metric label="A" value={fmt(absorb, 2)} color={C.red} />
      </div>
      <div>把能量分成 R/T/A 三份，比只说“颜色更亮/更透明”更接近物理材质模型。</div>
    </>}>
      <BSDFSplitScene reflect={reflect} transmit={transmit} />
    </DemoFrame>
  )
}

function AnisotropicScene({ anisotropy, roughness, angle }) {
  const fibers = useMemo(() => Array.from({ length: 46 }, (_, i) => -1.25 + i * 0.055), [])
  return (
    <Canvas camera={{ position: [3.4, 2.5, 4.2], fov: 44 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.54} />
      <directionalLight position={[2.8, 4.3, 2.2]} intensity={2.7} />
      <mesh rotation={[-Math.PI / 2, 0, angle]} position={[0, 0, 0]}>
        <cylinderGeometry args={[1.28, 1.28, 0.16, 96]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.82} roughness={roughness} />
      </mesh>
      <group rotation={[0, angle, 0]}>
        {fibers.map((x, i) => <Line key={i} points={[[x, 0.16, -1.05], [x + anisotropy * 0.38, 0.18, 1.05]]} color={i % 3 ? C.orange : C.amber} transparent opacity={0.22 + anisotropy * 0.46} lineWidth={0.9 + anisotropy * 1.3} />)}
      </group>
      <mesh position={[0.55 * Math.cos(angle), 0.22, 0.55 * Math.sin(angle)]} scale={[0.38 + anisotropy * 1.1, 0.035, 0.12 + roughness * 0.18]} rotation={[0, -angle, 0]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.32} />
      </mesh>
      <Html position={[-1.15, 0.55, 1.15]} style={{ color: C.orange, fontSize: 11, fontWeight: 800 }}>tangent / brush direction</Html>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function AnisotropicMaterialLab3D() {
  const [anisotropy, setAnisotropy] = useState(0.62)
  const [roughness, setRoughness] = useState(0.28)
  const [angle, setAngle] = useState(0.5)
  return (
    <DemoFrame title="Anisotropic Material Lab 3D · 拉丝金属为什么高光被拉长" subtitle="各向异性材质不仅需要 normal，还需要 tangent/bitangent 来定义刷痕方向。" accent={C.orange} side={<>
      <Slider label="anisotropy" value={anisotropy} min={0} max={1} step={0.01} onChange={setAnisotropy} accent={C.orange} />
      <Slider label="roughness" value={roughness} min={0.04} max={0.85} step={0.01} onChange={setRoughness} accent={C.cyan} />
      <Slider label="tangent angle" value={angle} min={-Math.PI} max={Math.PI} step={0.01} onChange={setAngle} accent={C.purple} unit=" rad" />
      <div>高光沿切线方向被拉伸；旋转 tangent，拉伸方向也跟着转，这就是各向异性和 TBN 的联系。</div>
    </>}>
      <AnisotropicScene anisotropy={anisotropy} roughness={roughness} angle={angle} />
    </DemoFrame>
  )
}

function MeasuredBRDFScene({ samples, theta }) {
  const dirs = useMemo(() => Array.from({ length: samples }, (_, i) => {
    const u = (i + 0.5) / samples
    const phi = i * Math.PI * (3 - Math.sqrt(5))
    const r = Math.sqrt(u)
    return [Math.cos(phi) * r, Math.sqrt(1 - u) * 1.3, Math.sin(phi) * r]
  }), [samples])
  const lx = Math.sin(theta) * 1.75
  const lz = Math.cos(theta) * 1.75
  return (
    <Canvas camera={{ position: [3.8, 2.8, 4.3], fov: 45 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.64} />
      <directionalLight position={[3, 4, 2]} intensity={2.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.02, 80]} />
        <meshStandardMaterial color="#fde68a" roughness={0.55} metalness={0.15} />
      </mesh>
      <Line points={[[lx, 1.62, lz], [0, 0.05, 0]]} color={C.amber} lineWidth={2.4} />
      <mesh position={[lx, 1.62, lz]}><sphereGeometry args={[0.08, 16, 8]} /><meshBasicMaterial color={C.amber} /></mesh>
      {dirs.map((d, i) => <Line key={i} points={[[0, 0.06, 0], d]} color={i % 4 === 0 ? C.purple : C.blue} transparent opacity={0.18 + (i % 7) * 0.055} lineWidth={1.1} />)}
      <Html position={[lx, 1.82, lz]} style={{ color: C.amber, fontSize: 11, fontWeight: 800 }}>light arm</Html>
      <Html position={[-1.35, 1.25, 0.6]} style={{ color: C.blue, fontSize: 11, fontWeight: 800 }}>camera samples</Html>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function MeasuredBRDFCapture3D() {
  const [samples, setSamples] = useState(54)
  const [theta, setTheta] = useState(0.8)
  return (
    <DemoFrame title="Measured BRDF Capture 3D · 真实材质如何被采样成数据" subtitle="仪器改变入射光和相机方向，把每一对 wi/wo 的反射响应存成高维表。" accent={C.purple} side={<>
      <Slider label="camera samples" value={samples} min={12} max={120} step={1} onChange={setSamples} accent={C.purple} />
      <Slider label="light azimuth" value={theta} min={-Math.PI} max={Math.PI} step={0.01} onChange={setTheta} accent={C.amber} unit=" rad" />
      <Metric label="stored pairs" value={`${samples} × light dirs`} color={C.purple} />
      <div>测量 BRDF 真实但数据维度高；解析 PBR 模型可控但只能近似真实材质。</div>
    </>}>
      <MeasuredBRDFScene samples={samples} theta={theta} />
    </DemoFrame>
  )
}

function pseudo(i) { return (Math.sin(i * 12.9898) * 43758.5453) % 1 }

export function SamplingMISPlayground() {
  const [strategy, setStrategy] = useState('mis')
  const [roughness, setRoughness] = useState(0.28)
  const [lightSize, setLightSize] = useState(0.16)
  const samples = useMemo(() => Array.from({ length: 90 }, (_, i) => {
    const r1 = Math.abs(pseudo(i + 2))
    const r2 = Math.abs(pseudo(i + 19))
    let x, y, col
    if (strategy === 'light') {
      x = 382 + (r1 - 0.5) * lightSize * 540
      y = 112 + (r2 - 0.5) * lightSize * 380
      col = C.amber
    } else if (strategy === 'brdf') {
      const spread = 34 + roughness * 180
      x = 210 + (r1 - 0.5) * spread
      y = 205 + (r2 - 0.5) * spread
      col = C.cyan
    } else {
      if (i % 2 === 0) {
        x = 382 + (r1 - 0.5) * lightSize * 540; y = 112 + (r2 - 0.5) * lightSize * 380; col = C.amber
      } else {
        const spread = 34 + roughness * 180; x = 210 + (r1 - 0.5) * spread; y = 205 + (r2 - 0.5) * spread; col = C.cyan
      }
    }
    const hitLight = Math.hypot(x - 382, y - 112) < 34 + lightSize * 65
    const hitLobe = Math.hypot(x - 210, y - 205) < 38 + roughness * 85
    return { x, y, col, important: hitLight || hitLobe }
  }), [strategy, roughness, lightSize])
  const brdfPdf = clamp(1 - roughness * 0.7)
  const lightPdf = clamp(lightSize * 2.2)
  const variance = strategy === 'mis' ? 0.18 : strategy === 'light' ? clamp(0.82 - lightSize * 1.6 + roughness * 0.2) : clamp(0.9 - brdfPdf * 0.55 + (0.22 - lightSize))
  return (
    <DemoFrame title="Sampling Strategy Playground · 为什么 MIS 必要？" subtitle="青色表示按 BRDF lobe 采样，黄色表示按光源采样；MIS 把两种策略合并。" accent={C.purple} side={<>
      <ButtonRow value={strategy} onChange={setStrategy} accent={C.purple} items={[{ value: 'brdf', label: 'BRDF sampling' }, { value: 'light', label: 'Light sampling' }, { value: 'mis', label: 'MIS' }]} />
      <Slider label="roughness" value={roughness} min={0.04} max={1} step={0.01} onChange={setRoughness} accent={C.cyan} />
      <Slider label="light size" value={lightSize} min={0.04} max={0.5} step={0.01} onChange={setLightSize} accent={C.amber} />
      <Metric label="relative variance" value={fmt(variance, 2)} color={variance < 0.35 ? C.green : variance < 0.65 ? C.amber : C.red} />
      <div>MIS 的核心不是“平均两张图”，而是根据每条路径在不同策略下的 pdf 决定权重：谁更擅长采到这条路径，谁权重大。</div>
    </>}>
      <svg viewBox="0 0 520 320" style={{ width: '100%', height: 360, display: 'block', background: 'linear-gradient(180deg,#f8fbff,#eef6ff)' }}>
        <defs><filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        <circle cx="210" cy="205" r={38 + roughness * 85} fill="rgba(103,232,249,0.08)" stroke="rgba(103,232,249,0.5)" strokeDasharray="5 5" />
        <text x="145" y="292" fill={C.cyan} fontSize="12">BRDF lobe</text>
        <circle cx="382" cy="112" r={34 + lightSize * 65} fill="rgba(255,209,102,0.12)" stroke="rgba(255,209,102,0.8)" filter="url(#glow)" />
        <text x="345" y="55" fill={C.amber} fontSize="12">area light</text>
        <line x1="210" y1="205" x2="382" y2="112" stroke="rgba(255,255,255,0.14)" />
        {samples.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.important ? 3.2 : 1.8} fill={s.col} opacity={s.important ? 0.92 : 0.28} />)}
      </svg>
    </DemoFrame>
  )
}

export function BidirectionalPathLab() {
  const [eyeDepth, setEyeDepth] = useState(3)
  const [lightDepth, setLightDepth] = useState(3)
  const eye = Array.from({ length: eyeDepth + 1 }, (_, i) => ({ x: 70 + i * 80, y: 235 - i * 28, label: i === 0 ? 'Camera' : `E${i}` }))
  const light = Array.from({ length: lightDepth + 1 }, (_, i) => ({ x: 450 - i * 80, y: 80 + i * 30, label: i === 0 ? 'Light' : `L${i}` }))
  const connections = eye.slice(1).flatMap((e, i) => light.slice(1).map((l, j) => ({ e, l, strong: i + j === 2 })))
  return (
    <DemoFrame title="BDPT Path Connector · 从眼睛和光源两头握手" subtitle="增加两端子路径长度，观察可连接顶点数量如何增长。" accent={C.green} side={<>
      <Slider label="eye subpath vertices" value={eyeDepth} min={1} max={5} step={1} onChange={setEyeDepth} accent={C.blue} />
      <Slider label="light subpath vertices" value={lightDepth} min={1} max={5} step={1} onChange={setLightDepth} accent={C.amber} />
      <Metric label="candidate connections" value={connections.length} color={C.green} />
      <div>单向 PT 只从相机找光；BDPT 同时从光源发路径，再尝试连接。焦散路径常常更容易从光源端被发现。</div>
    </>}>
      <svg viewBox="0 0 520 320" style={{ width: '100%', height: 360, display: 'block', background: 'linear-gradient(180deg,#f8fbff,#eef6ff)' }}>
        {connections.map((c, i) => <line key={i} x1={c.e.x} y1={c.e.y} x2={c.l.x} y2={c.l.y} stroke={c.strong ? C.green : 'rgba(116,224,164,0.12)'} strokeWidth={c.strong ? 2.4 : 1} />)}
        {[eye, light].map((path, pi) => path.map((p, i) => (
          <g key={`${pi}-${i}`}>
            {i > 0 && <line x1={path[i-1].x} y1={path[i-1].y} x2={p.x} y2={p.y} stroke={pi === 0 ? C.blue : C.amber} strokeWidth="3" />}
            <circle cx={p.x} cy={p.y} r="14" fill={pi === 0 ? 'rgba(106,169,255,0.22)' : 'rgba(255,209,102,0.22)'} stroke={pi === 0 ? C.blue : C.amber} strokeWidth="2" />
            <text x={p.x} y={p.y+4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">{p.label}</text>
          </g>
        )))}
        <rect x="220" y="185" width="88" height="45" rx="8" fill="rgba(255,255,255,0.05)" stroke={C.line} />
        <text x="264" y="212" textAnchor="middle" fill={C.mute} fontSize="12">diffuse wall</text>
      </svg>
    </DemoFrame>
  )
}

function PhotonScene({ count, radius }) {
  const photons = useMemo(() => Array.from({ length: count }, (_, i) => {
    const u = (i / Math.max(1, count - 1)) * 2 - 1
    const bend = -u * 0.85
    const hitX = bend * 0.7
    const hitZ = -1.2 + Math.abs(u) * 0.8
    return { u, mid: [u * 0.65, 0.75, 0], hit: [hitX, -0.75, hitZ] }
  }), [count])
  return (
    <Canvas camera={{ position: [3.4, 2.6, 4.2], fov: 48 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[2, 4, 2]} intensity={2} />
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.62, 48, 24]} />
        <meshPhysicalMaterial color="#b7ecff" transparent opacity={0.35} transmission={0.35} roughness={0.02} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]}>
        <planeGeometry args={[4.2, 3.2]} />
        <meshStandardMaterial color="#1f2937" roughness={0.7} />
      </mesh>
      {photons.map((p, i) => <Line key={i} points={[[p.u * 1.6, 2.1, 0.9], p.mid, p.hit]} color={i % 3 === 0 ? C.amber : C.cyan} lineWidth={1.2} transparent opacity={0.45} />)}
      <mesh position={[0, -0.735, -1.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 48]} />
        <meshBasicMaterial color={C.amber} transparent opacity={0.28} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function PhotonMappingCausticsLab() {
  const [count, setCount] = useState(42)
  const [radius, setRadius] = useState(0.42)
  const bias = radius * radius
  const noise = 1 / Math.sqrt(count) / Math.max(0.25, radius)
  return (
    <DemoFrame title="Photon Mapping Caustics Lab" subtitle="从光源发射 photon，穿过玻璃球后在地面形成焦散；查询半径决定 bias / noise 权衡。" accent={C.amber} side={<>
      <Slider label="photon count" value={count} min={12} max={90} step={1} onChange={setCount} accent={C.amber} />
      <Slider label="gather radius" value={radius} min={0.16} max={0.9} step={0.01} onChange={setRadius} accent={C.cyan} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><Metric label="bias" value={fmt(bias, 2)} color={C.orange} /><Metric label="noise" value={fmt(noise, 2)} color={C.cyan} /></div>
      <div>半径大：能量估计平滑但偏；半径小：细节清楚但噪。progressive photon mapping 会逐步缩小半径。</div>
    </>}>
      <PhotonScene count={count} radius={radius} />
    </DemoFrame>
  )
}

function LensScene({ aperture, focus }) {
  const rays = useMemo(() => Array.from({ length: 9 }, (_, i) => -aperture + (2 * aperture * i) / 8), [aperture])
  return (
    <Canvas camera={{ position: [0, 2.8, 6.2], fov: 42 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.7} />
      <Line points={[[0, -1.2, 0], [0, 1.2, 0]]} color={C.cyan} lineWidth={3} />
      <Line points={[[-1.25, -1.1, 0], [-1.25, 1.1, 0]]} color={C.purple} lineWidth={2} />
      <Line points={[[focus, -1.2, 0], [focus, 1.2, 0]]} color={C.green} lineWidth={2} />
      <Html position={[0.06, 1.28, 0]} style={{ color: C.cyan, fontSize: 11 }}>lens aperture</Html>
      <Html position={[-1.55, 1.24, 0]} style={{ color: C.purple, fontSize: 11 }}>sensor</Html>
      <Html position={[focus - 0.35, 1.25, 0]} style={{ color: C.green, fontSize: 11 }}>focus plane</Html>
      {rays.map((y, i) => <Line key={i} points={[[-1.25, 0.18, 0], [0, y, 0], [focus, 0, 0]]} color={i === 4 ? C.amber : C.blue} lineWidth={i === 4 ? 2.8 : 1.3} transparent opacity={0.75} />)}
      <mesh position={[focus, 0, 0]}><sphereGeometry args={[0.055, 16, 8]} /><meshBasicMaterial color={C.green} /></mesh>
      <OrbitControls enableRotate={false} enablePan={false} enableZoom={false} />
    </Canvas>
  )
}

export function ThinLensDOFLab() {
  const [aperture, setAperture] = useState(0.45)
  const [focus, setFocus] = useState(2.8)
  const coc = aperture * Math.abs(focus - 2.1) / focus
  return (
    <DemoFrame title="Thin Lens DOF Lab · 景深来自镜头采样" subtitle="不是后期 blur：同一个 pixel 从 aperture 上采多条 ray，它们会在焦平面汇聚。" accent={C.cyan} side={<>
      <Slider label="aperture radius" value={aperture} min={0.05} max={0.9} step={0.01} onChange={setAperture} accent={C.cyan} />
      <Slider label="focus distance" value={focus} min={1.4} max={4.3} step={0.01} onChange={setFocus} accent={C.green} />
      <Metric label="relative CoC" value={fmt(coc, 2)} color={coc < 0.08 ? C.green : C.amber} />
      <div>aperture 越大，离焦点形成的弥散圆越大；focus plane 移动时，清晰层也随之移动。</div>
    </>}>
      <LensScene aperture={aperture} focus={focus} />
    </DemoFrame>
  )
}

export function BokehApertureLab() {
  const [blades, setBlades] = useState(7)
  const [aperture, setAperture] = useState(0.72)
  const [catEye, setCatEye] = useState(0.28)
  const polygon = Array.from({ length: blades }, (_, i) => {
    const a = -Math.PI / 2 + (i / blades) * Math.PI * 2
    return `${100 + Math.cos(a) * 72 * aperture},${100 + Math.sin(a) * 72 * aperture}`
  }).join(' ')
  return (
    <DemoFrame title="Bokeh Aperture Lab" subtitle="散景形状来自 aperture，不是简单高斯。叶片数、孔径和边缘遮挡都会改变 bokeh。" accent={C.pink} side={<>
      <Slider label="aperture blades" value={blades} min={3} max={10} step={1} onChange={setBlades} accent={C.pink} />
      <Slider label="aperture size" value={aperture} min={0.25} max={1} step={0.01} onChange={setAperture} accent={C.amber} />
      <Slider label="cat-eye edge" value={catEye} min={0} max={0.65} step={0.01} onChange={setCatEye} accent={C.cyan} />
      <div>画面边缘的 bokeh 常因镜筒遮挡变成“猫眼”，高亮离焦时会暴露真实光圈形状。</div>
    </>}>
      <svg viewBox="0 0 520 320" style={{ width: '100%', height: 360, display: 'block', background: 'linear-gradient(180deg,#f8fbff,#eef6ff)' }}>
        <text x="50" y="35" fill={C.mute} fontSize="12">aperture shape</text>
        <polygon points={polygon} fill="rgba(244,114,182,0.23)" stroke={C.pink} strokeWidth="3" />
        {Array.from({ length: 18 }, (_, i) => {
          const x = 260 + (i % 6) * 39
          const y = 72 + Math.floor(i / 6) * 68
          const sx = 1 - catEye * ((x - 260) / 220)
          return <ellipse key={i} cx={x} cy={y} rx={20 * aperture * sx} ry={20 * aperture} fill="rgba(255,209,102,0.18)" stroke={C.amber} />
        })}
        <text x="260" y="285" fill={C.mute} fontSize="12">defocused highlights / bokeh samples</text>
      </svg>
    </DemoFrame>
  )
}

export function LightFieldRefocusLab() {
  const [focus, setFocus] = useState(0.5)
  const rays = Array.from({ length: 9 }, (_, i) => -0.8 + i * 0.2)
  return (
    <DemoFrame title="Light Field Refocus Lab · 记录方向后再对焦" subtitle="两平面参数化 L(u,v,s,t)：同一张光场可通过 shift-and-sum 在不同深度重对焦。" accent={C.purple} side={<>
      <Slider label="refocus depth" value={focus} min={0} max={1} step={0.01} onChange={setFocus} accent={C.purple} />
      <Metric label="shift amount" value={fmt((focus - 0.5) * 2, 2)} color={C.purple} />
      <div>普通照片已经把方向积分掉；光场保留方向维度，所以可以在后期选择深度平面对齐并积分。</div>
    </>}>
      <svg viewBox="0 0 520 320" style={{ width: '100%', height: 360, display: 'block', background: 'linear-gradient(180deg,#f8fbff,#eef6ff)' }}>
        <line x1="120" y1="35" x2="120" y2="285" stroke={C.blue} strokeWidth="3" />
        <line x1="390" y1="35" x2="390" y2="285" stroke={C.amber} strokeWidth="3" />
        <text x="95" y="25" fill={C.blue} fontSize="12">UV plane</text>
        <text x="360" y="25" fill={C.amber} fontSize="12">ST plane</text>
        <line x1={255 + (focus - 0.5) * 120} y1="40" x2={255 + (focus - 0.5) * 120} y2="280" stroke={C.purple} strokeDasharray="6 5" />
        <text x={215 + (focus - 0.5) * 120} y="304" fill={C.purple} fontSize="12">chosen focus slice</text>
        {rays.map((u, i) => {
          const y1 = 160 + u * 95
          const y2 = 160 - u * 55 + (focus - 0.5) * 70
          return <line key={i} x1="120" y1={y1} x2="390" y2={y2} stroke={i === 4 ? C.purple : 'rgba(192,132,252,0.36)'} strokeWidth={i === 4 ? 3 : 1.5} />
        })}
      </svg>
    </DemoFrame>
  )
}

const SPECTRA = {
  daylight: { label: 'D65 daylight', color: '#dbeafe', rgb: [0.92, 0.96, 1.0], peaks: [0.75, 0.95, 0.85, 0.78, 0.72] },
  tungsten: { label: 'tungsten 2700K', color: '#ffd7a1', rgb: [1.0, 0.62, 0.32], peaks: [0.18, 0.32, 0.55, 0.82, 1.0] },
  led: { label: 'white LED', color: '#e0f2fe', rgb: [0.75, 0.86, 1.0], peaks: [0.92, 0.28, 0.72, 0.6, 0.35] },
  laser: { label: 'narrow laser', color: '#74e0a4', rgb: [0.12, 1.0, 0.28], peaks: [0.04, 0.08, 1.0, 0.1, 0.03] },
}

export function SpectrumColorLab() {
  const [preset, setPreset] = useState('daylight')
  const s = SPECTRA[preset]
  const pts = s.peaks.map((v, i) => [45 + i * 95, 220 - v * 160])
  const lms = [s.rgb[0] * 0.55 + s.rgb[1] * 0.25, s.rgb[1] * 0.7 + s.rgb[2] * 0.1, s.rgb[2] * 0.75]
  const rgbCss = `rgb(${s.rgb.map(v => Math.round(v * 255)).join(',')})`
  return (
    <DemoFrame title="Spectrum → LMS → RGB Lab" subtitle="真实光是光谱；RGB 只是刺激三类视锥细胞后的工程编码。" accent={C.green} side={<>
      <ButtonRow value={preset} onChange={setPreset} accent={C.green} items={Object.entries(SPECTRA).map(([value, v]) => ({ value, label: v.label }))} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>{['L', 'M', 'S'].map((k, i) => <Metric key={k} label={`${k} cone`} value={fmt(lms[i], 2)} color={[C.red, C.green, C.blue][i]} />)}</div>
      <div>同色异谱说明：不同 SPD 可以产生相似 LMS 响应，因此显示器不需要复现完整光谱，也能让人眼感到“同一种颜色”。</div>
    </>}>
      <svg viewBox="0 0 520 320" style={{ width: '100%', height: 360, display: 'block', background: 'linear-gradient(180deg,#f8fbff,#eef6ff)' }}>
        <defs><linearGradient id="spectrum" x1="0" x2="1"><stop offset="0" stopColor="#4f46e5"/><stop offset=".25" stopColor="#06b6d4"/><stop offset=".5" stopColor="#22c55e"/><stop offset=".75" stopColor="#f59e0b"/><stop offset="1" stopColor="#ef4444"/></linearGradient></defs>
        <rect x="45" y="235" width="380" height="18" rx="9" fill="url(#spectrum)" />
        <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={s.color} strokeWidth="4" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="5" fill={s.color} />)}
        <rect x="72" y="52" width="104" height="72" rx="14" fill={rgbCss} stroke="rgba(255,255,255,0.4)" />
        <text x="72" y="145" fill={C.mute} fontSize="12">display RGB swatch</text>
        {lms.map((v, i) => <rect key={i} x={255 + i * 54} y={220 - v * 150} width="30" height={v * 150} fill={[C.red, C.green, C.blue][i]} opacity="0.75" />)}
        <text x="250" y="245" fill={C.mute} fontSize="12">L / M / S response</text>
      </svg>
    </DemoFrame>
  )
}

export function GamutToneMappingLab() {
  const [exposure, setExposure] = useState(1.2)
  const [whitePoint, setWhitePoint] = useState(3.6)
  const values = [0.18, 0.5, 1, 2, 4, 8].map(v => v * exposure)
  const reinhard = (x) => x / (1 + x)
  const aces = (x) => clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14))
  const pts = Array.from({ length: 90 }, (_, i) => {
    const x = (i / 89) * whitePoint
    return [38 + (x / whitePoint) * 440, 230 - aces(x) * 170]
  })
  return (
    <DemoFrame title="HDR Tone Mapping & Gamut Lab" subtitle="渲染器输出 scene-linear HDR，显示前必须曝光、压缩高光并转换到目标色彩空间。" accent={C.orange} side={<>
      <Slider label="exposure" value={exposure} min={0.2} max={3.5} step={0.01} onChange={setExposure} accent={C.orange} />
      <Slider label="display white" value={whitePoint} min={1.2} max={8} step={0.1} onChange={setWhitePoint} accent={C.amber} />
      <Metric label="middle gray maps to" value={fmt(aces(0.18 * exposure), 3)} color={C.orange} />
      <div>clip 会丢失高亮层次；tone mapping 曲线把 HDR 压到 0-1，同时尽量保留中间调和颜色观感。</div>
    </>}>
      <svg viewBox="0 0 520 320" style={{ width: '100%', height: 360, display: 'block', background: 'linear-gradient(180deg,#f8fbff,#eef6ff)' }}>
        <line x1="38" y1="230" x2="480" y2="230" stroke={C.line} />
        <line x1="38" y1="55" x2="38" y2="230" stroke={C.line} />
        <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={C.orange} strokeWidth="4" />
        {values.map((v, i) => <g key={i}>
          <rect x={52 + i * 64} y="260" width="44" height="28" rx="6" fill={`rgb(${Math.round(aces(v)*255)},${Math.round(aces(v)*220)},${Math.round(aces(v)*170)})`} />
          <text x={74 + i * 64} y="252" textAnchor="middle" fill={C.mute} fontSize="10">{v.toFixed(1)}</text>
        </g>)}
        <text x="55" y="45" fill={C.mute} fontSize="12">ACES-like curve</text>
        <text x="52" y="306" fill={C.mute} fontSize="12">HDR samples after tone map</text>
        <path d="M330 68 L455 94 L395 190 Z" fill="rgba(106,169,255,0.10)" stroke={C.blue} />
        <path d="M350 82 L438 100 L397 171 Z" fill="rgba(255,209,102,0.10)" stroke={C.amber} />
        <text x="346" y="72" fill={C.blue} fontSize="10">wide gamut</text>
        <text x="360" y="107" fill={C.amber} fontSize="10">sRGB</text>
      </svg>
    </DemoFrame>
  )
}

export function ColorPipelineChecklist() {
  const steps = [
    ['Texture read', 'BaseColor: sRGB→Linear；Normal/Roughness: data no gamma', C.blue],
    ['Lighting', 'BRDF、GI、Bloom threshold 全部在 scene-linear HDR 中计算', C.green],
    ['Exposure', '把物理亮度映射到艺术/摄影曝光区间', C.amber],
    ['Tone mapping', 'Reinhard / Filmic / ACES-like 压缩动态范围', C.orange],
    ['Output transform', '转换到 sRGB / Display P3 / HDR10 等目标显示格式', C.purple],
  ]
  return (
    <DemoFrame title="Color Pipeline Checklist" subtitle="排查颜色问题时，从贴图读取一直追到最终 output transform。" accent={C.green}>
      <div style={{ padding: 18, display: 'grid', gap: 12 }}>
        {steps.map(([a, b, col], i) => <div key={a} style={{ display: 'grid', gridTemplateColumns: '42px 1fr', gap: 12, alignItems: 'start' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', background: `${col}22`, border: `1px solid ${col}77`, color: col, fontWeight: 900 }}>{i + 1}</div>
          <div style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.72)', border: `1px solid ${C.line}` }}>
            <div style={{ color: C.text, fontWeight: 800, marginBottom: 4 }}>{a}</div>
            <div style={{ color: C.mute, fontSize: 13, lineHeight: 1.65 }}>{b}</div>
          </div>
        </div>)}
      </div>
    </DemoFrame>
  )
}

function rgbCss01(rgb, boost = 1) {
  return `rgb(${rgb.map(v => Math.round(clamp(v * boost) * 255)).join(',')})`
}

function srgbToLinearValue(v) {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

function linearToSrgbValue(v) {
  const x = clamp(v)
  return x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055
}

function mixRgb(a, b, t) {
  return a.map((v, i) => lerp(v, b[i], t))
}

function multiplyRgb(a, b) {
  return a.map((v, i) => clamp(v * b[i]))
}

function kelvinToRgb01(kelvin) {
  const t = clamp((kelvin - 1800) / (9000 - 1800))
  const warm = [1, 0.48, 0.18]
  const d65 = [1, 0.94, 0.82]
  const cool = [0.55, 0.68, 1]
  if (t < 0.6) return mixRgb(warm, d65, t / 0.6)
  return mixRgb(d65, cool, (t - 0.6) / 0.4)
}

function tonemapValue(x, mode) {
  if (mode === 'clip') return clamp(x)
  if (mode === 'reinhard') return x / (1 + x)
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14))
}

function SpectralPrismScene({ preset, dispersion }) {
  const s = SPECTRA[preset]
  const bands = [
    ['430nm', '#6366f1', -0.62, s.peaks[0]],
    ['480nm', '#06b6d4', -0.31, s.peaks[1]],
    ['540nm', '#22c55e', 0, s.peaks[2]],
    ['590nm', '#f59e0b', 0.32, s.peaks[3]],
    ['650nm', '#ef4444', 0.63, s.peaks[4]],
  ]
  const lms = [s.rgb[0] * 0.55 + s.rgb[1] * 0.25, s.rgb[1] * 0.7 + s.rgb[2] * 0.1, s.rgb[2] * 0.75]
  return (
    <Canvas camera={{ position: [4.1, 2.55, 5.2], fov: 43 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[-2.2, 2.4, 1.8]} intensity={2.4} color={rgbCss01(s.rgb)} />
      <mesh position={[-2.3, 1.05, 0]}>
        <sphereGeometry args={[0.18, 32, 16]} />
        <meshBasicMaterial color={rgbCss01(s.rgb, 1.2)} />
      </mesh>
      <Html position={[-2.65, 1.42, 0]} style={{ color: C.amber, fontSize: 11, fontWeight: 800 }}>SPD 光源</Html>
      <Line points={[[-2.1, 1.05, 0], [-0.38, 0.9, 0]]} color={rgbCss01(s.rgb, 1.1)} lineWidth={4} transparent opacity={0.65} />
      <mesh position={[0, 0.86, 0]} rotation={[0.05, 0, Math.PI / 2]}>
        <coneGeometry args={[0.56, 0.86, 3]} />
        <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.38} roughness={0.02} metalness={0} />
      </mesh>
      <Html position={[-0.28, 1.48, 0]} style={{ color: C.blue, fontSize: 11, fontWeight: 800 }}>prism / 分光</Html>
      {bands.map(([name, color, offset, peak], i) => {
        const y = 0.88 + offset * dispersion
        const z = offset * dispersion * 0.78
        return <Line key={name} points={[[-0.18, 0.9, 0], [0.38, 0.88, 0], [1.82, y, z]]} color={color} lineWidth={1.2 + peak * 5.5} transparent opacity={0.16 + peak * 0.78} />
      })}
      <mesh position={[2.04, 0.88, 0]} rotation={[0, -0.28, 0]}>
        <sphereGeometry args={[0.42, 48, 24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.28} metalness={0.02} />
      </mesh>
      <mesh position={[1.72, 0.9, -0.12]} rotation={[0, -0.28, 0]}>
        <sphereGeometry args={[0.13, 24, 12]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <Html position={[1.78, 1.48, 0.15]} style={{ color: C.text, fontSize: 11, fontWeight: 800 }}>eye：光谱被压成 LMS</Html>
      {lms.map((v, i) => {
        const h = 0.22 + v * 1.15
        const col = [C.red, C.green, C.blue][i]
        return <group key={i} position={[2.75 + i * 0.34, -0.42 + h / 2, -0.55]}>
          <mesh>
            <boxGeometry args={[0.18, h, 0.18]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.12 + v * 0.25} roughness={0.45} />
          </mesh>
          <Html position={[-0.04, h / 2 + 0.12, 0]} style={{ color: col, fontSize: 10, fontWeight: 900 }}>{['L', 'M', 'S'][i]}</Html>
        </group>
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <planeGeometry args={[5.4, 2.8]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.62} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function SpectralPrismEye3D() {
  const [preset, setPreset] = useState('daylight')
  const [dispersion, setDispersion] = useState(0.72)
  const s = SPECTRA[preset]
  const lms = [s.rgb[0] * 0.55 + s.rgb[1] * 0.25, s.rgb[1] * 0.7 + s.rgb[2] * 0.1, s.rgb[2] * 0.75]
  return (
    <DemoFrame title="Spectral Prism Eye 3D · 光谱如何变成 LMS 感知" subtitle="选择不同光源：白光、白炽灯、LED、激光的 SPD 不同，但人眼只得到压缩后的 L/M/S 响应。" accent={C.green} side={<>
      <ButtonRow value={preset} onChange={setPreset} accent={C.green} items={Object.entries(SPECTRA).map(([value, v]) => ({ value, label: v.label }))} />
      <Slider label="prism dispersion" value={dispersion} min={0.15} max={1.15} step={0.01} onChange={setDispersion} accent={C.purple} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>{['L cone', 'M cone', 'S cone'].map((k, i) => <Metric key={k} label={k} value={fmt(lms[i], 2)} color={[C.red, C.green, C.blue][i]} />)}</div>
      <div>看重点：真实输入是连续光谱；人眼和显示系统把它压缩成少数通道，这就是 RGB 工程编码可行的原因。</div>
    </>}>
      <SpectralPrismScene preset={preset} dispersion={dispersion} />
    </DemoFrame>
  )
}

function ColorMatchingScene({ red, green, blue }) {
  const rgb = [red, green, blue]
  const lms = [red * 0.55 + green * 0.25, green * 0.72 + blue * 0.1, blue * 0.78]
  const emitters = [
    ['R primary', C.red, red, [-2.1, 1.45, -0.68]],
    ['G primary', C.green, green, [-2.1, 0.72, 0]],
    ['B primary', C.blue, blue, [-2.1, -0.02, 0.68]],
  ]
  return (
    <Canvas camera={{ position: [3.6, 2.3, 4.8], fov: 43 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.56} />
      <pointLight position={[-1.8, 2.2, 2.2]} intensity={2.2} color="#ffffff" />
      {emitters.map(([label, color, power, pos]) => <group key={label}>
        <mesh position={pos}>
          <sphereGeometry args={[0.16 + power * 0.1, 32, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.36 + power * 0.64} />
        </mesh>
        <Line points={[pos, [-0.3, 0.72, 0]]} color={color} lineWidth={1 + power * 4.2} transparent opacity={0.18 + power * 0.7} />
        <Html position={[pos[0] - 0.38, pos[1] + 0.22, pos[2]]} style={{ color, fontSize: 10, fontWeight: 800 }}>{label}</Html>
      </group>)}
      <mesh position={[-0.3, 0.72, 0]}>
        <sphereGeometry args={[0.26, 48, 24]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.42} roughness={0.06} />
      </mesh>
      <Html position={[-0.62, 1.12, 0]} style={{ color: C.purple, fontSize: 11, fontWeight: 800 }}>mix</Html>
      <Line points={[[-0.02, 0.72, 0], [1.08, 0.72, 0]]} color={rgbCss01(rgb)} lineWidth={5} transparent opacity={0.72} />
      <mesh position={[1.42, 0.72, 0]} rotation={[0, -0.18, 0]}>
        <boxGeometry args={[0.92, 0.72, 0.08]} />
        <meshStandardMaterial color={rgbCss01(rgb)} emissive={rgbCss01(rgb)} emissiveIntensity={0.18} roughness={0.28} />
      </mesh>
      <Html position={[1.05, 1.22, 0]} style={{ color: C.text, fontSize: 11, fontWeight: 800 }}>matched color</Html>
      {lms.map((v, i) => <group key={i} position={[2.35, -0.04 + i * 0.34, -0.58]}>
        <mesh scale={[v, 0.08, 0.08]} position={[v * 0.45, 0, 0]}>
          <boxGeometry args={[0.9, 1, 1]} />
          <meshBasicMaterial color={[C.red, C.green, C.blue][i]} transparent opacity={0.78} />
        </mesh>
        <Html position={[-0.18, -0.05, 0]} style={{ color: [C.red, C.green, C.blue][i], fontSize: 10, fontWeight: 900 }}>{['L', 'M', 'S'][i]}</Html>
      </group>)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}>
        <planeGeometry args={[4.8, 2.8]} />
        <meshStandardMaterial color="#eaf4ff" roughness={0.88} transparent opacity={0.75} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function ColorMatchingStudio3D() {
  const [red, setRed] = useState(0.88)
  const [green, setGreen] = useState(0.72)
  const [blue, setBlue] = useState(0.24)
  const luma = red * 0.2126 + green * 0.7152 + blue * 0.0722
  return (
    <DemoFrame title="Color Matching Studio 3D · 三基色如何匹配一个颜色" subtitle="拖动 R/G/B primary 强度，观察三束工程基色如何混合成屏幕颜色，并产生对应的 LMS 响应。" accent={C.purple} side={<>
      <Slider label="red primary" value={red} min={0} max={1} step={0.01} onChange={setRed} accent={C.red} />
      <Slider label="green primary" value={green} min={0} max={1} step={0.01} onChange={setGreen} accent={C.green} />
      <Slider label="blue primary" value={blue} min={0} max={1} step={0.01} onChange={setBlue} accent={C.blue} />
      <Metric label="relative Y / luminance" value={fmt(luma, 3)} color={C.purple} />
      <div>这不是复现完整 SPD，而是用三种 primary 让人眼产生目标响应。Color matching experiment 的工程直觉就是这样。</div>
    </>}>
      <ColorMatchingScene red={red} green={green} blue={blue} />
    </DemoFrame>
  )
}

const GAMUTS = {
  srgb: { label: 'sRGB', scale: [1, 1, 1], volume: 1 },
  p3: { label: 'Display P3', scale: [1.16, 1.1, 1.03], volume: 1.32 },
  rec2020: { label: 'Rec.2020', scale: [1.42, 1.32, 1.12], volume: 2.1 },
}

function GamutVolumeScene({ space, fill }) {
  const g = GAMUTS[space]
  const pts = useMemo(() => {
    const out = []
    for (let r = 0; r <= 4; r++) for (let gg = 0; gg <= 4; gg++) for (let b = 0; b <= 4; b++) {
      const rgb = [r / 4, gg / 4, b / 4]
      out.push({ rgb, p: [(rgb[0] - 0.5) * 2 * g.scale[0] * fill, (rgb[1] - 0.5) * 2 * g.scale[1] * fill, (rgb[2] - 0.5) * 2 * g.scale[2] * fill] })
    }
    return out
  }, [space, fill])
  return (
    <Canvas camera={{ position: [3.2, 2.5, 4.2], fov: 45 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 2]} intensity={1.8} />
      <mesh>
        <boxGeometry args={[2 * g.scale[0] * fill, 2 * g.scale[1] * fill, 2 * g.scale[2] * fill]} />
        <meshBasicMaterial color={C.blue} wireframe transparent opacity={0.18} />
      </mesh>
      <Line points={[[-1.45, -1.25, -1.25], [1.45, -1.25, -1.25]]} color={C.red} lineWidth={2.2} />
      <Line points={[[-1.45, -1.25, -1.25], [-1.45, 1.25, -1.25]]} color={C.green} lineWidth={2.2} />
      <Line points={[[-1.45, -1.25, -1.25], [-1.45, -1.25, 1.25]]} color={C.blue} lineWidth={2.2} />
      {pts.map(({ rgb, p }, i) => <mesh key={i} position={p}>
        <sphereGeometry args={[0.045, 12, 8]} />
        <meshStandardMaterial color={rgbCss01(rgb)} emissive={rgbCss01(rgb)} emissiveIntensity={0.08} roughness={0.4} />
      </mesh>)}
      <Html position={[0.2, 1.62, 0]} style={{ color: C.text, fontSize: 12, fontWeight: 900 }}>{g.label} gamut volume</Html>
      <Html position={[1.55, -1.25, -1.25]} style={{ color: C.red, fontSize: 10, fontWeight: 800 }}>R</Html>
      <Html position={[-1.45, 1.42, -1.25]} style={{ color: C.green, fontSize: 10, fontWeight: 800 }}>G</Html>
      <Html position={[-1.45, -1.25, 1.42]} style={{ color: C.blue, fontSize: 10, fontWeight: 800 }}>B</Html>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function GamutVolume3D() {
  const [space, setSpace] = useState('p3')
  const [fill, setFill] = useState(0.86)
  return (
    <DemoFrame title="Gamut Volume 3D · 色域不是一串 RGB 数字" subtitle="把 RGB 当成立方体中的点：目标色域越大，可覆盖的颜色体积越大，但输出设备也越难完整显示。" accent={C.blue} side={<>
      <ButtonRow value={space} onChange={setSpace} accent={C.blue} items={Object.entries(GAMUTS).map(([value, v]) => ({ value, label: v.label }))} />
      <Slider label="sample fill" value={fill} min={0.45} max={1.05} step={0.01} onChange={setFill} accent={C.purple} />
      <Metric label="relative gamut volume" value={`${fmt(GAMUTS[space].volume * fill * fill * fill, 2)}× sRGB`} color={C.blue} />
      <div>同一个 RGB 坐标必须绑定色彩空间才有意义；P3、Rec.2020 的 primary 位置不同，因此“红绿蓝立方体”代表的真实颜色也不同。</div>
    </>}>
      <GamutVolumeScene space={space} fill={fill} />
    </DemoFrame>
  )
}

function LinearGammaScene({ base, light }) {
  const samples = [0.15, 0.3, 0.45, 0.6, 0.78, 1]
  const rows = [
    ['wrong: multiply in sRGB', -0.62, C.red, (x) => clamp(base * x * light)],
    ['correct: linear lighting → sRGB output', 0.62, C.green, (x) => linearToSrgbValue(srgbToLinearValue(base) * x * light)],
  ]
  return (
    <Canvas camera={{ position: [3.4, 2.2, 4.2], fov: 44 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[2.5, 4, 2.5]} intensity={2.2} />
      {rows.map(([label, z, accent, fn]) => <group key={label}>
        <Html position={[-1.85, 1.32, z]} style={{ color: accent, fontSize: 11, fontWeight: 900 }}>{label}</Html>
        {samples.map((s, i) => {
          const v = fn(s)
          const h = 0.1 + v * 1.12
          return <group key={i} position={[-1.55 + i * 0.62, -0.45 + h / 2, z]}>
            <mesh>
              <boxGeometry args={[0.42, h, 0.36]} />
              <meshStandardMaterial color={rgbCss01([v, v, v])} roughness={0.5} metalness={0.02} />
            </mesh>
            <Html position={[-0.1, -h / 2 - 0.22, 0]} style={{ color: C.mute, fontSize: 9 }}>{fmt(s, 2)}</Html>
          </group>
        })}
      </group>)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]}>
        <planeGeometry args={[4.5, 2.7]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.72} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function LinearGammaLighting3D() {
  const [base, setBase] = useState(0.72)
  const [light, setLight] = useState(0.95)
  const wrongMid = clamp(base * 0.5 * light)
  const correctMid = linearToSrgbValue(srgbToLinearValue(base) * 0.5 * light)
  return (
    <DemoFrame title="Linear vs sRGB Lighting 3D · 为什么光照必须在线性空间" subtitle="两排柱子使用同样的输入：上排错误地在 sRGB 编码值里乘光照，下排先转线性、算完再输出。" accent={C.green} side={<>
      <Slider label="baseColor sRGB" value={base} min={0.05} max={1} step={0.01} onChange={setBase} accent={C.green} />
      <Slider label="light multiplier" value={light} min={0.15} max={1.8} step={0.01} onChange={setLight} accent={C.amber} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><Metric label="wrong middle" value={fmt(wrongMid, 3)} color={C.red} /><Metric label="correct middle" value={fmt(correctMid, 3)} color={C.green} /></div>
      <div>如果把 sRGB 当线性能量，暗部和中间调会明显不对；很多“画面灰、脏、暗”的 bug 都来自这里。</div>
    </>}>
      <LinearGammaScene base={base} light={light} />
    </DemoFrame>
  )
}

function WhiteBalanceScene({ kelvin, adaptation }) {
  const light = kelvinToRgb01(kelvin)
  const cardRaw = light
  const cardWb = mixRgb(cardRaw, [1, 1, 1], adaptation)
  const baseObj = [0.18, 0.46, 1]
  const objRaw = multiplyRgb(baseObj, light)
  const objWb = mixRgb(objRaw, baseObj, adaptation)
  return (
    <Canvas camera={{ position: [3.8, 2.5, 4.5], fov: 43 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.48} />
      <pointLight position={[0, 2.8, 0.5]} intensity={3.2} color={rgbCss01(light)} />
      <mesh position={[0, 2.15, 0.45]}>
        <sphereGeometry args={[0.16, 32, 16]} />
        <meshBasicMaterial color={rgbCss01(light)} />
      </mesh>
      <Html position={[-0.45, 2.45, 0.45]} style={{ color: C.amber, fontSize: 11, fontWeight: 900 }}>{kelvin}K light</Html>
      {[['camera raw', -1.08, cardRaw, objRaw, C.orange], ['after white balance', 1.08, cardWb, objWb, C.blue]].map(([label, x, card, obj, accent]) => <group key={label} position={[x, 0, 0]}>
        <mesh position={[0, 0.68, -0.16]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.82, 0.62, 0.06]} />
          <meshStandardMaterial color={rgbCss01(card)} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.26, 0.42]}>
          <sphereGeometry args={[0.28, 48, 24]} />
          <meshStandardMaterial color={rgbCss01(obj)} roughness={0.36} metalness={0.04} />
        </mesh>
        <Html position={[-0.42, 1.15, -0.12]} style={{ color: accent, fontSize: 11, fontWeight: 900 }}>{label}</Html>
      </group>)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[3.8, 2.4]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.86} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function WhiteBalanceAdaptation3D() {
  const [kelvin, setKelvin] = useState(2700)
  const [adaptation, setAdaptation] = useState(0.72)
  return (
    <DemoFrame title="White Balance Adaptation 3D · 白色不是绝对的" subtitle="左边是相机原始受光源色温污染的白卡，右边模拟白平衡/色适应后把参考白拉回白色。" accent={C.amber} side={<>
      <Slider label="color temperature" value={kelvin} min={1800} max={9000} step={100} onChange={setKelvin} accent={C.amber} unit="K" />
      <Slider label="adaptation / WB strength" value={adaptation} min={0} max={1} step={0.01} onChange={setAdaptation} accent={C.blue} />
      <Metric label="reference correction" value={`${fmt(adaptation * 100, 0)}%`} color={C.blue} />
      <div>白平衡的直觉是选择“什么应该算白”。人眼会自动适应，相机和渲染管线需要显式控制。</div>
    </>}>
      <WhiteBalanceScene kelvin={kelvin} adaptation={adaptation} />
    </DemoFrame>
  )
}

function HDRToneMapScene({ exposure, mode }) {
  const values = [0.18, 0.75, 2, 6, 18, 48]
  return (
    <Canvas camera={{ position: [3.6, 2.4, 4.4], fov: 44 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.52} />
      <pointLight position={[-1.5, 3, 2]} intensity={2.4} color="#fff7ed" />
      {values.map((v, i) => {
        const scene = v * exposure
        const mapped = tonemapValue(scene, mode)
        const x = -1.65 + i * 0.66
        return <group key={v}>
          <mesh position={[x, 0.86, -0.55]}>
            <sphereGeometry args={[0.16 + Math.log2(scene + 1) * 0.045, 32, 16]} />
            <meshBasicMaterial color={rgbCss01([1, 0.75, 0.35], Math.min(2.5, 0.8 + scene * 0.12))} />
          </mesh>
          <Line points={[[x, 0.58, -0.55], [x, -0.02, 0.55]]} color={C.amber} transparent opacity={0.18 + mapped * 0.62} lineWidth={1 + mapped * 4} />
          <mesh position={[x, -0.24, 0.55]}>
            <boxGeometry args={[0.42, 0.42, 0.08]} />
            <meshStandardMaterial color={rgbCss01([mapped, mapped * 0.86, mapped * 0.62])} emissive={rgbCss01([mapped, mapped * 0.65, mapped * 0.25])} emissiveIntensity={0.08 + mapped * 0.18} roughness={0.32} />
          </mesh>
          <Html position={[x - 0.14, 1.22, -0.55]} style={{ color: C.amber, fontSize: 9 }}>{fmt(scene, 1)}</Html>
        </group>
      })}
      <Html position={[-2.05, 1.38, -0.55]} style={{ color: C.amber, fontSize: 11, fontWeight: 900 }}>scene-linear HDR</Html>
      <Html position={[-2.08, -0.72, 0.55]} style={{ color: C.orange, fontSize: 11, fontWeight: 900 }}>display after {mode}</Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]}>
        <planeGeometry args={[4.6, 2.6]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.72} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function HDRToneMappingGallery3D() {
  const [exposure, setExposure] = useState(1.1)
  const [mode, setMode] = useState('aces')
  const mid = tonemapValue(0.18 * exposure, mode)
  return (
    <DemoFrame title="HDR Display Gallery 3D · 高亮如何被压进屏幕" subtitle="上排是 scene-linear HDR 亮度；下排是经过 clip / Reinhard / ACES-like 后落到显示范围的结果。" accent={C.orange} side={<>
      <ButtonRow value={mode} onChange={setMode} accent={C.orange} items={[{ value: 'clip', label: 'clip' }, { value: 'reinhard', label: 'Reinhard' }, { value: 'aces', label: 'ACES-like' }]} />
      <Slider label="exposure" value={exposure} min={0.25} max={3.2} step={0.01} onChange={setExposure} accent={C.orange} />
      <Metric label="middle gray output" value={fmt(mid, 3)} color={C.orange} />
      <div>直接 clip 会把 2、10、100 都压成同一个白；tone mapping 的价值是保留高光层次和中间调观感。</div>
    </>}>
      <HDRToneMapScene exposure={exposure} mode={mode} />
    </DemoFrame>
  )
}

function PerceptionContrastScene({ contrast }) {
  const gray = 0.52
  const dark = 0.28 - contrast * 0.18
  const light = 0.68 + contrast * 0.24
  return (
    <Canvas camera={{ position: [0, 1.6, 4.4], fov: 40 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[1.5, 3, 2]} intensity={1.8} />
      {[[-0.95, dark, 'dark surround'], [0.95, light, 'light surround']].map(([x, bg, label]) => <group key={label} position={[x, 0, 0]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.18, 1.18, 0.08]} />
          <meshStandardMaterial color={rgbCss01([bg, bg, bg])} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.45, 0.07]}>
          <boxGeometry args={[0.42, 0.42, 0.09]} />
          <meshStandardMaterial color={rgbCss01([gray, gray, gray])} roughness={0.42} />
        </mesh>
        <Html position={[-0.43, 1.18, 0]} style={{ color: bg < 0.5 ? C.blue : C.mute, fontSize: 11, fontWeight: 900 }}>{label}</Html>
      </group>)}
      <Html position={[-0.5, -0.32, 0.15]} style={{ color: C.purple, fontSize: 12, fontWeight: 900 }}>center patches are identical RGB = {fmt(gray, 2)}</Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]}>
        <planeGeometry args={[3.5, 1.8]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.65} />
      </mesh>
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  )
}

export function PerceptionContrast3D() {
  const [contrast, setContrast] = useState(0.72)
  return (
    <DemoFrame title="Perception Contrast 3D · 同一个灰色为什么看起来不一样" subtitle="两个中心小方块的 RGB 完全相同，但周围背景不同，大脑会把它们解释成不同亮度。" accent={C.purple} side={<>
      <Slider label="surround contrast" value={contrast} min={0} max={1} step={0.01} onChange={setContrast} accent={C.purple} />
      <Metric label="center patch RGB" value="0.52 / 0.52 / 0.52" color={C.purple} />
      <div>颜色感知强烈依赖上下文。最终图像不是物理数值直接进入大脑，而会经过适应、对比和经验解释。</div>
    </>}>
      <PerceptionContrastScene contrast={contrast} />
    </DemoFrame>
  )
}

function CameraRayBundleScene({ model, aperture, focus, pixelY }) {
  const lensSamples = model === 'thin'
    ? [[0, 0], ...Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2
        return [Math.cos(a) * aperture, Math.sin(a) * aperture]
      })]
    : [[0, 0]]
  const sensor = [-1.45, pixelY, 0]
  const focusPoint = [focus, 0, 0]
  return (
    <Canvas camera={{ position: [3.8, 2.45, 5.7], fov: 43 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.58} />
      <directionalLight position={[3, 4, 2]} intensity={2.1} />
      <mesh position={[-1.45, 0, 0]}>
        <boxGeometry args={[0.055, 1.7, 1.15]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.6} transparent opacity={0.72} />
      </mesh>
      <Html position={[-1.7, 1.0, 0]} style={{ color: C.purple, fontSize: 11, fontWeight: 900 }}>sensor / film</Html>
      <mesh position={sensor}>
        <sphereGeometry args={[0.055, 16, 8]} />
        <meshBasicMaterial color={C.purple} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[Math.max(0.08, aperture), 0.026, 16, 72]} />
        <meshStandardMaterial color={model === 'thin' ? C.cyan : C.orange} emissive={model === 'thin' ? C.cyan : C.orange} emissiveIntensity={0.08} roughness={0.32} />
      </mesh>
      <Html position={[-0.3, 0.92, 0]} style={{ color: model === 'thin' ? C.cyan : C.orange, fontSize: 11, fontWeight: 900 }}>{model === 'thin' ? 'finite lens aperture' : 'pinhole center'}</Html>
      <mesh position={[focus, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.75, 1.75]} />
        <meshBasicMaterial color={C.green} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[focus - 0.42, 1.05, 0]} style={{ color: C.green, fontSize: 11, fontWeight: 900 }}>focus plane</Html>
      <mesh position={focusPoint}>
        <sphereGeometry args={[0.09, 24, 12]} />
        <meshBasicMaterial color={C.green} />
      </mesh>
      <mesh position={[focus + 1.05, 0.42, 0.55]}>
        <sphereGeometry args={[0.18, 32, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.35} />
      </mesh>
      {lensSamples.map(([y, z], i) => <Line key={i} points={[sensor, [0, y, z], focusPoint]} color={model === 'thin' ? (i === 0 ? C.amber : C.blue) : C.orange} lineWidth={i === 0 ? 2.7 : 1.15} transparent opacity={model === 'thin' ? 0.42 + (i === 0 ? 0.28 : 0) : 0.85} />)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.55, -0.62, 0]}>
        <planeGeometry args={[5.2, 2.7]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.88} transparent opacity={0.66} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function CameraRaySampler3D() {
  const [model, setModel] = useState('thin')
  const [aperture, setAperture] = useState(0.42)
  const [focus, setFocus] = useState(2.8)
  const [pixelY, setPixelY] = useState(0.22)
  return (
    <DemoFrame title="Camera Ray Sampler 3D · 相机本质是在采样光线" subtitle="pinhole 只有一个中心；thin lens 会从 aperture 上采多个 ray origin，并让它们汇聚到焦平面。" accent={C.cyan} side={<>
      <ButtonRow value={model} onChange={setModel} accent={C.cyan} items={[{ value: 'pinhole', label: 'pinhole' }, { value: 'thin', label: 'thin lens' }]} />
      <Slider label="aperture radius" value={aperture} min={0.06} max={0.78} step={0.01} onChange={setAperture} accent={C.cyan} />
      <Slider label="focus distance" value={focus} min={1.35} max={4.25} step={0.01} onChange={setFocus} accent={C.green} />
      <Slider label="pixel sample height" value={pixelY} min={-0.55} max={0.55} step={0.01} onChange={setPixelY} accent={C.purple} />
      <Metric label="primary ray dimension" value={model === 'thin' ? 'pixel × lens disk' : 'pixel only'} color={C.cyan} />
      <div>把 camera 看成 ray sampler 后，FOV、DOF、bokeh、motion blur、light field 都只是改变 primary ray 的采样维度。</div>
    </>}>
      <CameraRayBundleScene model={model} aperture={aperture} focus={focus} pixelY={pixelY} />
    </DemoFrame>
  )
}

function FOVDollyScene({ focal, distance }) {
  const sensor = 36
  const fov = (2 * Math.atan(sensor / (2 * focal)) * 180) / Math.PI
  const camX = -distance
  const imgX = camX + 0.72
  const subjectDepth = -camX
  const bgDepth = 2.35 - camX
  const subjectImg = clamp((focal / 50) * (1.2 / subjectDepth) * 2.2, 0.14, 1.35)
  const bgImg = clamp((focal / 50) * (1.45 / bgDepth) * 2.2, 0.12, 1.25)
  return (
    <Canvas camera={{ position: [3.8, 2.8, 6.1], fov: 42 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[2.5, 4, 2]} intensity={2.2} />
      <mesh position={[camX, 0.18, 0]}>
        <boxGeometry args={[0.32, 0.42, 0.46]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} />
      </mesh>
      <mesh position={[camX + 0.22, 0.18, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.24, 32]} />
        <meshStandardMaterial color={C.blue} roughness={0.28} />
      </mesh>
      <Html position={[camX - 0.35, 0.72, 0]} style={{ color: C.blue, fontSize: 11, fontWeight: 900 }}>camera</Html>
      <mesh position={[imgX, 0.18, 0]}>
        <boxGeometry args={[0.04, 1.4, 1.1]} />
        <meshStandardMaterial color="#dbeafe" transparent opacity={0.42} roughness={0.6} />
      </mesh>
      <Html position={[imgX - 0.25, 1.02, 0]} style={{ color: C.purple, fontSize: 10, fontWeight: 900 }}>image plane</Html>
      <mesh position={[0, 0.6, -0.45]}>
        <boxGeometry args={[0.28, 1.2, 0.28]} />
        <meshStandardMaterial color={C.green} roughness={0.42} />
      </mesh>
      <mesh position={[2.35, 0.72, 0.52]}>
        <boxGeometry args={[0.34, 1.45, 0.34]} />
        <meshStandardMaterial color={C.orange} roughness={0.42} />
      </mesh>
      {[[-0.45, 1.2, C.green], [0.52, 1.45, C.orange]].map(([z, h, col], i) => {
        const objX = i === 0 ? 0 : 2.35
        return <group key={i}>
          <Line points={[[camX + 0.24, 0.18, 0], [objX, h, z]]} color={col} transparent opacity={0.35} lineWidth={1.2} />
          <Line points={[[camX + 0.24, 0.18, 0], [objX, 0, z]]} color={col} transparent opacity={0.35} lineWidth={1.2} />
        </group>
      })}
      <mesh position={[imgX + 0.045, 0.18, -0.25]}>
        <boxGeometry args={[0.06, subjectImg, 0.12]} />
        <meshBasicMaterial color={C.green} transparent opacity={0.82} />
      </mesh>
      <mesh position={[imgX + 0.05, 0.18, 0.24]}>
        <boxGeometry args={[0.06, bgImg, 0.12]} />
        <meshBasicMaterial color={C.orange} transparent opacity={0.76} />
      </mesh>
      <Html position={[imgX - 0.45, -0.72, 0]} style={{ color: C.text, fontSize: 11, fontWeight: 900 }}>FOV {fmt(fov, 1)}°</Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, -0.05, 0]}>
        <planeGeometry args={[7.2, 2.9]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.7} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function FOVDollyZoom3D() {
  const [focal, setFocal] = useState(50)
  const [distance, setDistance] = useState(4.2)
  const fov = (2 * Math.atan(36 / (2 * focal)) * 180) / Math.PI
  return (
    <DemoFrame title="FOV & Dolly Zoom 3D · 焦距、视角和相机位置要一起看" subtitle="调 focal length 改变 FOV，调 camera distance 改变透视关系；长焦压缩本质来自拍摄距离变化。" accent={C.blue} side={<>
      <Slider label="focal length" value={focal} min={18} max={120} step={1} onChange={setFocal} accent={C.blue} unit="mm" />
      <Slider label="camera distance" value={distance} min={2.2} max={7.4} step={0.01} onChange={setDistance} accent={C.purple} />
      <Metric label="horizontal FOV" value={`${fmt(fov, 1)}°`} color={C.blue} />
      <div>如果只换焦距但相机不动，透视关系不变；为了同构图而移动相机，前后景相对深度才会改变。</div>
    </>}>
      <FOVDollyScene focal={focal} distance={distance} />
    </DemoFrame>
  )
}

function SensorCropScene({ sensorSize }) {
  const scale = sensorSize / 36
  const crop = 36 / sensorSize
  const sensorW = 1.8 * scale
  const sensorH = 1.18 * scale
  return (
    <Canvas camera={{ position: [3.4, 2.35, 4.5], fov: 43 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[2.4, 4, 2.5]} intensity={2} />
      <mesh position={[-1.45, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.46, 0.045, 24, 72]} />
        <meshStandardMaterial color={C.cyan} roughness={0.28} />
      </mesh>
      <Html position={[-1.85, 0.92, 0]} style={{ color: C.cyan, fontSize: 11, fontWeight: 900 }}>lens image circle</Html>
      {[-0.9, 0, 0.9].map((z, i) => <Line key={i} points={[[-1.45, 0.2, 0], [1.05, 0.2 + Math.sin(i) * 0.72, z]]} color={C.amber} transparent opacity={0.42} lineWidth={1.35} />)}
      <mesh position={[1.05, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[1.08, 72]} />
        <meshBasicMaterial color={C.blue} transparent opacity={0.11} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.04, 0.2, 0]}>
        <boxGeometry args={[0.04, 1.8, 1.18]} />
        <meshBasicMaterial color={C.blue} wireframe transparent opacity={0.28} />
      </mesh>
      <mesh position={[1.0, 0.2, 0]}>
        <boxGeometry args={[0.055, sensorH, sensorW]} />
        <meshStandardMaterial color={C.purple} transparent opacity={0.46} roughness={0.42} />
      </mesh>
      <Html position={[0.68, 1.24, 0]} style={{ color: C.blue, fontSize: 10, fontWeight: 900 }}>full-frame capture</Html>
      <Html position={[0.65, -0.68, 0]} style={{ color: C.purple, fontSize: 11, fontWeight: 900 }}>active sensor · crop {fmt(crop, 2)}×</Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]}>
        <planeGeometry args={[4.6, 2.7]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.64} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function SensorCropFactor3D() {
  const [sensorSize, setSensorSize] = useState(24)
  return (
    <DemoFrame title="Sensor Crop Factor 3D · 传感器是在成像圈里裁一块" subtitle="同一颗镜头形成同一个 image circle；传感器越小，截取范围越窄，看起来像更长焦。" accent={C.purple} side={<>
      <Slider label="sensor width" value={sensorSize} min={8} max={36} step={0.5} onChange={setSensorSize} accent={C.purple} unit="mm" />
      <Metric label="crop factor" value={`${fmt(36 / sensorSize, 2)}×`} color={C.purple} />
      <div>“等效焦距”本质是在说视角等效。小传感器没有改变镜头物理焦距，只是裁掉了成像圈边缘。</div>
    </>}>
      <SensorCropScene sensorSize={sensorSize} />
    </DemoFrame>
  )
}

function ApertureExposureScene({ aperture, defocus }) {
  const samples = Array.from({ length: 13 }, (_, i) => {
    if (i === 0) return [0, 0]
    const a = ((i - 1) / 12) * Math.PI * 2
    return [Math.cos(a) * aperture, Math.sin(a) * aperture]
  })
  const coc = aperture * Math.abs(defocus) * 0.82 + 0.045
  return (
    <Canvas camera={{ position: [3.7, 2.4, 4.7], fov: 43 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[2.2, 2.4, 1.5]} intensity={2.4} color="#fff1c2" />
      <mesh position={[2.0, 0.55, 0]}>
        <sphereGeometry args={[0.16, 32, 16]} />
        <meshBasicMaterial color={C.amber} />
      </mesh>
      <Html position={[1.62, 0.92, 0]} style={{ color: C.amber, fontSize: 11, fontWeight: 900 }}>defocused point</Html>
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[aperture, 0.035, 16, 80]} />
        <meshStandardMaterial color={C.cyan} roughness={0.26} />
      </mesh>
      <Html position={[-0.3, 0.88, 0]} style={{ color: C.cyan, fontSize: 11, fontWeight: 900 }}>aperture stop</Html>
      <mesh position={[-1.35, 0, 0]}>
        <boxGeometry args={[0.05, 1.35, 1.05]} />
        <meshStandardMaterial color="#dbeafe" transparent opacity={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[-1.39, 0.12, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[coc, 48]} />
        <meshBasicMaterial color={C.orange} transparent opacity={0.32} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[-1.78, 0.82, 0]} style={{ color: C.orange, fontSize: 11, fontWeight: 900 }}>CoC on sensor</Html>
      {samples.map(([y, z], i) => {
        const hitY = 0.12 + y * defocus
        const hitZ = z * defocus
        return <Line key={i} points={[[2.0, 0.55, 0], [0, y, z], [-1.36, hitY, hitZ]]} color={i === 0 ? C.amber : C.blue} lineWidth={i === 0 ? 2.4 : 1.1} transparent opacity={0.24 + aperture * 0.62} />
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.56, 0]}>
        <planeGeometry args={[4.6, 2.7]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.68} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function ApertureExposureDOF3D() {
  const [aperture, setAperture] = useState(0.42)
  const [defocus, setDefocus] = useState(0.56)
  const exposure = aperture * aperture
  const coc = aperture * Math.abs(defocus) * 0.82 + 0.045
  return (
    <DemoFrame title="Aperture Exposure & CoC 3D · 光圈同时控制进光和离焦斑" subtitle="光圈越大，通过的 ray cone 越粗，曝光越高；如果不在焦平面上，sensor 上的弥散圆也越大。" accent={C.orange} side={<>
      <Slider label="aperture radius" value={aperture} min={0.08} max={0.78} step={0.01} onChange={setAperture} accent={C.cyan} />
      <Slider label="defocus amount" value={defocus} min={0} max={1.15} step={0.01} onChange={setDefocus} accent={C.orange} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><Metric label="relative exposure" value={fmt(exposure, 2)} color={C.amber} /><Metric label="CoC radius" value={fmt(coc, 2)} color={C.orange} /></div>
      <div>这就是为什么大光圈既更亮，也更容易浅景深；真实渲染里应通过采样 aperture 产生这种效果。</div>
    </>}>
      <ApertureExposureScene aperture={aperture} defocus={defocus} />
    </DemoFrame>
  )
}

function LensDefectsScene({ mode, strength }) {
  const pts = []
  for (let iy = -4; iy <= 4; iy++) for (let iz = -4; iz <= 4; iz++) {
    const y = iy / 4
    const z = iz / 4
    const r = Math.sqrt(y * y + z * z)
    if (r <= 1.18) pts.push({ y, z, r })
  }
  const distort = (p, channel = 0) => {
    if (mode === 'distortion') {
      const f = 1 + (strength * 0.42) * p.r * p.r
      return [p.y * f, p.z * f]
    }
    if (mode === 'chromatic') {
      const f = 1 + (channel - 1) * strength * 0.08 * p.r
      return [p.y * f, p.z * f]
    }
    return [p.y, p.z]
  }
  return (
    <Canvas camera={{ position: [3.1, 2.1, 4.3], fov: 42 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[2, 4, 2]} intensity={2} />
      <mesh position={[-1.35, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.48, 0.04, 16, 72]} />
        <meshStandardMaterial color={C.cyan} roughness={0.25} />
      </mesh>
      <Line points={[[-1.35, 0.1, 0], [0.82, 0.9, 0.9]]} color={C.amber} transparent opacity={0.28} lineWidth={1.4} />
      <Line points={[[-1.35, 0.1, 0], [0.82, -0.75, -0.9]]} color={C.amber} transparent opacity={0.28} lineWidth={1.4} />
      <mesh position={[0.85, 0.1, 0]}>
        <boxGeometry args={[0.04, 2.15, 2.15]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.5} roughness={0.65} />
      </mesh>
      {pts.map((p, i) => {
        const channels = mode === 'chromatic' ? [[C.red, 0], [C.green, 1], [C.blue, 2]] : [[mode === 'vignette' ? C.amber : C.blue, 1]]
        return channels.map(([col, ch]) => {
          const [y, z] = distort(p, ch)
          const op = mode === 'vignette' ? clamp(1 - strength * Math.pow(p.r, 1.7), 0.16, 1) : 0.78
          return <mesh key={`${i}-${ch}`} position={[0.8 + ch * 0.008, y * 0.86 + 0.1, z * 0.86]}>
            <sphereGeometry args={[0.025 + (1 - p.r) * 0.01, 10, 8]} />
            <meshBasicMaterial color={col} transparent opacity={op} />
          </mesh>
        })
      })}
      <Html position={[0.35, 1.34, 0]} style={{ color: C.text, fontSize: 11, fontWeight: 900 }}>{mode} strength {fmt(strength, 2)}</Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.93, 0]}>
        <planeGeometry args={[3.6, 2.6]} />
        <meshStandardMaterial color="#eaf4ff" roughness={0.9} transparent opacity={0.66} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function LensDefectsGallery3D() {
  const [mode, setMode] = useState('distortion')
  const [strength, setStrength] = useState(0.62)
  return (
    <DemoFrame title="Lens Defects Gallery 3D · 畸变、暗角、色差不是同一种错误" subtitle="在 sensor 平面上观察网格如何被弯曲、边缘如何变暗，以及 RGB 通道如何被不同折射率拉开。" accent={C.pink} side={<>
      <ButtonRow value={mode} onChange={setMode} accent={C.pink} items={[{ value: 'distortion', label: 'distortion' }, { value: 'vignette', label: 'vignetting' }, { value: 'chromatic', label: 'chromatic CA' }]} />
      <Slider label="defect strength" value={strength} min={0} max={1} step={0.01} onChange={setStrength} accent={C.pink} />
      <Metric label="active defect" value={mode} color={C.pink} />
      <div>真实镜头缺陷可以校正，也可以当成摄影风格保留；它们和 pinhole/thin-lens 的理想模型不同。</div>
    </>}>
      <LensDefectsScene mode={mode} strength={strength} />
    </DemoFrame>
  )
}

function wavelengthColor(nm) {
  const t = clamp((nm - 420) / (680 - 420))
  if (t < 0.25) return mixRgb([0.36, 0.25, 1], [0.04, 0.72, 0.9], t / 0.25)
  if (t < 0.5) return mixRgb([0.04, 0.72, 0.9], [0.12, 0.86, 0.28], (t - 0.25) / 0.25)
  if (t < 0.75) return mixRgb([0.12, 0.86, 0.28], [1, 0.65, 0.06], (t - 0.5) / 0.25)
  return mixRgb([1, 0.65, 0.06], [1, 0.08, 0.08], (t - 0.75) / 0.25)
}

function PlenopticScene({ directions, wavelength, time }) {
  const col = rgbCss01(wavelengthColor(wavelength), 1.15)
  const rays = Array.from({ length: directions }, (_, i) => {
    const a = i * Math.PI * (3 - Math.sqrt(5)) + time * Math.PI * 0.8
    const y = -0.78 + (i / Math.max(1, directions - 1)) * 1.56
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    return [Math.cos(a) * r * 1.9, y * 1.45 + 0.45, Math.sin(a) * r * 1.9]
  })
  return (
    <Canvas camera={{ position: [3.6, 2.5, 4.8], fov: 43 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 1.1, 0]} intensity={3.2} color={col} />
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.16, 32, 16]} />
        <meshBasicMaterial color={col} />
      </mesh>
      {rays.map((p, i) => <Line key={i} points={[[0, 0.45, 0], p]} color={i % 3 === 0 ? col : C.purple} transparent opacity={0.22 + (i % 5) * 0.09} lineWidth={1.1 + (i % 4) * 0.35} />)}
      <Line points={[[-1.6, -0.85, -1.35], [1.6, -0.85, -1.35]]} color={C.red} lineWidth={2.3} />
      <Line points={[[-1.6, -0.85, -1.35], [-1.6, 1.25, -1.35]]} color={C.green} lineWidth={2.3} />
      <Line points={[[-1.6, -0.85, -1.35], [-1.6, -0.85, 1.35]]} color={C.blue} lineWidth={2.3} />
      <Html position={[0.18, 1.0, 0]} style={{ color: C.text, fontSize: 11, fontWeight: 900 }}>P(x,y,z, θ,φ, λ, t)</Html>
      <Html position={[1.7, -0.85, -1.35]} style={{ color: C.red, fontSize: 10, fontWeight: 900 }}>x</Html>
      <Html position={[-1.6, 1.42, -1.35]} style={{ color: C.green, fontSize: 10, fontWeight: 900 }}>y</Html>
      <Html position={[-1.6, -0.85, 1.52]} style={{ color: C.blue, fontSize: 10, fontWeight: 900 }}>z</Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
        <planeGeometry args={[4.2, 3.1]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.58} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function PlenopticFunction3D() {
  const [directions, setDirections] = useState(34)
  const [wavelength, setWavelength] = useState(540)
  const [time, setTime] = useState(0.25)
  return (
    <DemoFrame title="Plenoptic Function 3D · 完整光场到底有多少维" subtitle="空间位置只是开始：一束光还要带方向、波长和时间。普通照片把大量维度积分掉了。" accent={C.green} side={<>
      <Slider label="direction samples" value={directions} min={8} max={70} step={1} onChange={setDirections} accent={C.green} />
      <Slider label="wavelength" value={wavelength} min={420} max={680} step={5} onChange={setWavelength} accent={C.purple} unit="nm" />
      <Slider label="time slice" value={time} min={0} max={1} step={0.01} onChange={setTime} accent={C.amber} />
      <Metric label="stored dimensions" value="x y z · θ φ · λ · t" color={C.green} />
      <div>Light field 是 plenoptic function 在自由空间中的降维版本：保留位置和方向，通常先忽略波长和时间。</div>
    </>}>
      <PlenopticScene directions={directions} wavelength={wavelength} time={time} />
    </DemoFrame>
  )
}

function LightFieldCameraScene({ spatial, angular }) {
  const grid = Array.from({ length: spatial }, (_, i) => -0.72 + (1.44 * i) / Math.max(1, spatial - 1))
  const angles = Array.from({ length: angular }, (_, i) => -0.22 + (0.44 * i) / Math.max(1, angular - 1))
  const scenePoints = [[-2.3, 0.72, -0.45, C.orange], [-2.05, 0.1, 0.5, C.green]]
  return (
    <Canvas camera={{ position: [3.6, 2.35, 4.8], fov: 43 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.58} />
      <directionalLight position={[2.5, 4, 2.2]} intensity={2.1} />
      {scenePoints.map(([x, y, z, col], i) => <mesh key={i} position={[x, y, z]}>
        <sphereGeometry args={[0.11, 24, 12]} />
        <meshBasicMaterial color={col} />
      </mesh>)}
      <mesh position={[-0.85, 0.35, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.48, 0.035, 16, 80]} />
        <meshStandardMaterial color={C.cyan} roughness={0.28} />
      </mesh>
      <Html position={[-1.18, 1.02, 0]} style={{ color: C.cyan, fontSize: 11, fontWeight: 900 }}>main lens</Html>
      <mesh position={[1.04, 0.35, 0]}>
        <boxGeometry args={[0.05, 1.85, 1.85]} />
        <meshStandardMaterial color="#dbeafe" transparent opacity={0.48} roughness={0.6} />
      </mesh>
      <Html position={[0.76, 1.38, 0]} style={{ color: C.purple, fontSize: 11, fontWeight: 900 }}>sensor pixels</Html>
      {grid.map((y) => grid.map((z) => <group key={`${y}-${z}`}>
        <mesh position={[0.55, 0.35 + y, z]} rotation={[0, Math.PI / 2, 0]}>
          <sphereGeometry args={[0.075, 18, 10]} />
          <meshPhysicalMaterial color="#f8fafc" roughness={0.08} transparent opacity={0.55} />
        </mesh>
        <mesh position={[1.0, 0.35 + y, z]}>
          <boxGeometry args={[0.07, 0.18, 0.18]} />
          <meshBasicMaterial color={C.purple} transparent opacity={0.32} />
        </mesh>
      </group>))}
      {scenePoints.map(([x, y, z, col], pi) => grid.slice(0, Math.min(spatial, 4)).flatMap((my, gi) => angles.map((a, ai) => {
        const mz = grid[(gi + ai) % grid.length]
        const sensorY = 0.35 + my + a
        const sensorZ = mz - a * 0.8
        return <Line key={`${pi}-${gi}-${ai}`} points={[[x, y, z], [-0.85, 0.35 + my * 0.25, mz * 0.25], [0.55, 0.35 + my, mz], [1.02, sensorY, sensorZ]]} color={col} transparent opacity={0.13 + 0.04 * ai} lineWidth={1.0} />
      })))}
      <Html position={[0.18, -0.75, 0]} style={{ color: C.text, fontSize: 11, fontWeight: 900 }}>microlens array: spatial samples × angular samples</Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.3, -0.95, 0]}>
        <planeGeometry args={[4.7, 2.9]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.62} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function LightFieldCameraArray3D() {
  const [spatial, setSpatial] = useState(4)
  const [angular, setAngular] = useState(4)
  return (
    <DemoFrame title="Light Field Camera Array 3D · 微透镜如何记录方向" subtitle="每个 microlens 对应一个空间样本；它下面的小像素记录不同入射方向，因此能后期重对焦。" accent={C.purple} side={<>
      <Slider label="spatial microlenses" value={spatial} min={2} max={5} step={1} onChange={setSpatial} accent={C.purple} />
      <Slider label="angular pixels" value={angular} min={2} max={6} step={1} onChange={setAngular} accent={C.blue} />
      <Metric label="samples" value={`${spatial * spatial} spatial × ${angular} angular`} color={C.purple} />
      <div>空间分辨率和角度分辨率互相竞争：微透镜越多，位置样本越多；每个微透镜下像素越多，方向样本越多。</div>
    </>}>
      <LightFieldCameraScene spatial={spatial} angular={angular} />
    </DemoFrame>
  )
}

function KeyframePathScene({ method, time }) {
  const keyframes = [
    { t: 0, p: [-2.2, 0.3, -0.8] },
    { t: 0.33, p: [-0.6, 1.2, 0.4] },
    { t: 0.67, p: [0.8, 0.8, -0.5] },
    { t: 1, p: [2.1, 0.2, 0.6] }
  ]
  const interpolate = (t) => {
    if (t <= 0) return keyframes[0].p
    if (t >= 1) return keyframes[keyframes.length - 1].p
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (t >= keyframes[i].t && t <= keyframes[i + 1].t) {
        const local = (t - keyframes[i].t) / (keyframes[i + 1].t - keyframes[i].t)
        const ease = method === 'linear' ? local : method === 'ease-in' ? local * local : method === 'ease-out' ? 1 - (1 - local) * (1 - local) : 3 * local * local - 2 * local * local * local
        return keyframes[i].p.map((v, j) => lerp(v, keyframes[i + 1].p[j], ease))
      }
    }
    return keyframes[keyframes.length - 1].p
  }
  const currentPos = interpolate(time)
  const pathPoints = Array.from({ length: 80 }, (_, i) => interpolate(i / 79))
  return (
    <Canvas camera={{ position: [4.2, 2.8, 4.5], fov: 44 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[2.5, 4, 2.2]} intensity={2.1} />
      {keyframes.map((kf, i) => <mesh key={i} position={kf.p}>
        <sphereGeometry args={[0.12, 24, 12]} />
        <meshBasicMaterial color={C.amber} />
      </mesh>)}
      <Line points={pathPoints} color={C.blue} lineWidth={2.5} transparent opacity={0.65} />
      <mesh position={currentPos}>
        <sphereGeometry args={[0.18, 32, 16]} />
        <meshStandardMaterial color={C.green} emissive={C.green} emissiveIntensity={0.15} roughness={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]}>
        <planeGeometry args={[5.2, 2.8]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.68} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function KeyframeInterpolation3D() {
  const [method, setMethod] = useState('ease-in-out')
  const [time, setTime] = useState(0.42)
  return (
    <DemoFrame title="Keyframe Interpolation 3D · 关键帧之间如何过渡" subtitle="黄色球是关键帧，绿色球沿蓝色路径运动；切换插值方法观察运动节奏变化。" accent={C.green} side={<>
      <ButtonRow value={method} onChange={setMethod} accent={C.green} items={[{ value: 'linear', label: 'linear' }, { value: 'ease-in', label: 'ease-in' }, { value: 'ease-out', label: 'ease-out' }, { value: 'ease-in-out', label: 'ease-in-out' }]} />
      <Slider label="animation time" value={time} min={0} max={1} step={0.01} onChange={setTime} accent={C.green} />
      <Metric label="interpolation" value={method} color={C.green} />
      <div>linear 速度恒定；ease-in 慢启动；ease-out 慢结束；ease-in-out 两端慢中间快，最自然。</div>
    </>}>
      <KeyframePathScene method={method} time={time} />
    </DemoFrame>
  )
}

function MassSpringScene({ stiffness, damping }) {
  const [positions, setPositions] = useState([[-1.2, 1.5, 0], [1.2, 1.5, 0]])
  const restLength = 2.4
  const currentLength = Math.hypot(positions[1][0] - positions[0][0], positions[1][1] - positions[0][1], positions[1][2] - positions[0][2])
  const extension = currentLength - restLength
  const force = -stiffness * extension
  return (
    <Canvas camera={{ position: [3.8, 2.4, 4.6], fov: 44 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.58} />
      <directionalLight position={[2.5, 4, 2]} intensity={2.2} />
      {positions.map((p, i) => <mesh key={i} position={p}>
        <sphereGeometry args={[0.16, 32, 16]} />
        <meshStandardMaterial color={i === 0 ? C.red : C.blue} roughness={0.35} />
      </mesh>)}
      <Line points={positions} color={extension > 0 ? C.orange : extension < 0 ? C.cyan : C.green} lineWidth={2 + Math.abs(extension) * 3} transparent opacity={0.72} />
      <Html position={[0, 2.2, 0]} style={{ color: C.text, fontSize: 11, fontWeight: 900 }}>spring length {fmt(currentLength, 2)} · force {fmt(force, 1)}</Html>
      <Html position={[-1.5, 1.8, 0]} style={{ color: C.red, fontSize: 10, fontWeight: 800 }}>mass 1</Html>
      <Html position={[1.5, 1.8, 0]} style={{ color: C.blue, fontSize: 10, fontWeight: 800 }}>mass 2</Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.32, 0]}>
        <planeGeometry args={[4.8, 2.6]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.7} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function MassSpringSystem3D() {
  const [stiffness, setStiffness] = useState(12)
  const [damping, setDamping] = useState(0.42)
  return (
    <DemoFrame title="Mass-Spring System 3D · 弹簧连接质点产生弹力" subtitle="调整弹簧刚度和阻尼系数，观察弹簧力如何随形变量变化；布料、头发都可以用质点弹簧建模。" accent={C.cyan} side={<>
      <Slider label="spring stiffness k" value={stiffness} min={2} max={35} step={0.5} onChange={setStiffness} accent={C.cyan} />
      <Slider label="damping b" value={damping} min={0} max={1.5} step={0.01} onChange={setDamping} accent={C.orange} />
      <Metric label="Hooke's law" value="F = -k(|x| - L₀)" color={C.cyan} />
      <div>刚度越大，弹簧越硬；阻尼越大，能量损失越快。真实模拟需要数值积分求解运动方程。</div>
    </>}>
      <MassSpringScene stiffness={stiffness} damping={damping} />
    </DemoFrame>
  )
}

function EulerComparisonScene({ method, dt }) {
  const steps = 18
  const trajectories = useMemo(() => {
    const explicit = []
    const implicit = []
    let ex = [0, 1.5, 0], ev = [1.2, 0, 0]
    let ix = [0, 1.5, 0], iv = [1.2, 0, 0]
    const k = 8, m = 1, g = -2.5
    for (let i = 0; i < steps; i++) {
      explicit.push([...ex])
      implicit.push([...ix])
      const ea = [(k / m) * (0 - ex[0]), g, 0]
      ev = [ev[0] + ea[0] * dt, ev[1] + ea[1] * dt, ev[2] + ea[2] * dt]
      ex = [ex[0] + ev[0] * dt, ex[1] + ev[1] * dt, ex[2] + ev[2] * dt]
      const nextX = [ix[0] + iv[0] * dt, ix[1] + iv[1] * dt, ix[2] + iv[2] * dt]
      const ia = [(k / m) * (0 - nextX[0]), g, 0]
      iv = [iv[0] + ia[0] * dt * 0.85, iv[1] + ia[1] * dt, iv[2] + ia[2] * dt]
      ix = nextX
    }
    return { explicit, implicit }
  }, [method, dt])
  const active = method === 'explicit' ? trajectories.explicit : trajectories.implicit
  return (
    <Canvas camera={{ position: [4.2, 2.6, 4.8], fov: 44 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[2.5, 4, 2]} intensity={2.2} />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 24, 12]} />
        <meshBasicMaterial color={C.green} />
      </mesh>
      <Html position={[-0.25, 0.35, 0]} style={{ color: C.green, fontSize: 10, fontWeight: 900 }}>anchor</Html>
      <Line points={active} color={method === 'explicit' ? C.red : C.blue} lineWidth={2.5} transparent opacity={0.68} />
      {active.map((p, i) => i % 3 === 0 && <mesh key={i} position={p}>
        <sphereGeometry args={[0.09, 20, 12]} />
        <meshStandardMaterial color={method === 'explicit' ? C.red : C.blue} roughness={0.38} />
      </mesh>)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
        <planeGeometry args={[5.2, 2.8]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.7} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function EulerIntegrationComparison3D() {
  const [method, setMethod] = useState('explicit')
  const [dt, setDt] = useState(0.18)
  return (
    <DemoFrame title="Euler Integration Comparison 3D · 显式和隐式的稳定性差异" subtitle="显式欧拉用当前时刻的力更新，简单但大时间步会爆炸；隐式用下一时刻的力，稳定但需要求解。" accent={C.orange} side={<>
      <ButtonRow value={method} onChange={setMethod} accent={C.orange} items={[{ value: 'explicit', label: 'explicit Euler' }, { value: 'implicit', label: 'implicit Euler' }]} />
      <Slider label="time step Δt" value={dt} min={0.05} max={0.35} step={0.01} onChange={setDt} accent={C.orange} />
      <Metric label="stability" value={method === 'explicit' && dt > 0.22 ? 'unstable' : 'stable'} color={method === 'explicit' && dt > 0.22 ? C.red : C.green} />
      <div>大 Δt 时显式欧拉会让能量爆炸增长；隐式欧拉会耗散能量但保持稳定，适合实时模拟。</div>
    </>}>
      <EulerComparisonScene method={method} dt={dt} />
    </DemoFrame>
  )
}

function ParticleForceScene({ forceType, strength }) {
  const particles = useMemo(() => Array.from({ length: 42 }, (_, i) => {
    const a = (i / 42) * Math.PI * 2
    const r = 0.45 + (i % 7) * 0.18
    return { p: [Math.cos(a) * r, 0.85 + Math.sin(i * 2.3) * 0.35, Math.sin(a) * r], v: [0, 0, 0] }
  }), [])
  const forces = particles.map((pt) => {
    if (forceType === 'gravity') return [0, -strength * 1.5, 0]
    if (forceType === 'wind') return [strength * 0.8, 0, strength * 0.4]
    if (forceType === 'vortex') {
      const dx = pt.p[0], dz = pt.p[2]
      const r = Math.sqrt(dx * dx + dz * dz) + 0.01
      return [-dz / r * strength, 0, dx / r * strength]
    }
    const r = Math.sqrt(pt.p[0] * pt.p[0] + pt.p[2] * pt.p[2]) + 0.01
    return [pt.p[0] / r * strength * 0.6, 0, pt.p[2] / r * strength * 0.6]
  })
  return (
    <Canvas camera={{ position: [3.6, 2.5, 4.5], fov: 44 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[2.5, 4, 2]} intensity={2.1} />
      {particles.map((pt, i) => {
        const f = forces[i]
        const end = [pt.p[0] + f[0] * 0.45, pt.p[1] + f[1] * 0.45, pt.p[2] + f[2] * 0.45]
        return <group key={i}>
          <mesh position={pt.p}>
            <sphereGeometry args={[0.055, 16, 10]} />
            <meshStandardMaterial color={C.cyan} roughness={0.4} />
          </mesh>
          <Line points={[pt.p, end]} color={C.amber} transparent opacity={0.42} lineWidth={1.2} />
        </group>
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <planeGeometry args={[4.5, 2.8]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.68} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function ParticleSystemForces3D() {
  const [forceType, setForceType] = useState('gravity')
  const [strength, setStrength] = useState(0.72)
  return (
    <DemoFrame title="Particle System Forces 3D · 粒子受力类型" subtitle="每个粒子是独立的点，可以受重力、风力、涡旋或径向力；黄色箭头表示力的方向和大小。" accent={C.amber} side={<>
      <ButtonRow value={forceType} onChange={setForceType} accent={C.amber} items={[{ value: 'gravity', label: 'gravity' }, { value: 'wind', label: 'wind' }, { value: 'vortex', label: 'vortex' }, { value: 'radial', label: 'radial' }]} />
      <Slider label="force strength" value={strength} min={0.1} max={1.5} step={0.01} onChange={setStrength} accent={C.amber} />
      <Metric label="active force" value={forceType} color={C.amber} />
      <div>粒子系统用大量简单粒子模拟复杂现象：烟雾、火焰、水花、爆炸都可以用不同力场组合实现。</div>
    </>}>
      <ParticleForceScene forceType={forceType} strength={strength} />
    </DemoFrame>
  )
}

function ForwardKinematicsScene({ angle1, angle2, angle3 }) {
  const L1 = 0.85, L2 = 0.72, L3 = 0.58
  const a1 = (angle1 * Math.PI) / 180
  const a2 = (angle2 * Math.PI) / 180
  const a3 = (angle3 * Math.PI) / 180
  const j1 = [0, 0, 0]
  const j2 = [Math.cos(a1) * L1, Math.sin(a1) * L1, 0]
  const j3 = [j2[0] + Math.cos(a1 + a2) * L2, j2[1] + Math.sin(a1 + a2) * L2, 0]
  const end = [j3[0] + Math.cos(a1 + a2 + a3) * L3, j3[1] + Math.sin(a1 + a2 + a3) * L3, 0]
  return (
    <Canvas camera={{ position: [3.2, 1.8, 4.2], fov: 44 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[2, 4, 2]} intensity={2.2} />
      {[j1, j2, j3].map((p, i) => <mesh key={i} position={p}>
        <sphereGeometry args={[0.12, 24, 12]} />
        <meshStandardMaterial color={C.blue} roughness={0.35} />
      </mesh>)}
      <Line points={[j1, j2, j3, end]} color={C.cyan} lineWidth={3.5} />
      <mesh position={end}>
        <sphereGeometry args={[0.15, 32, 16]} />
        <meshStandardMaterial color={C.green} emissive={C.green} emissiveIntensity={0.12} roughness={0.32} />
      </mesh>
      <Html position={[end[0] + 0.25, end[1] + 0.18, 0]} style={{ color: C.green, fontSize: 11, fontWeight: 900 }}>end effector</Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <planeGeometry args={[4.2, 2.6]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.7} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function ForwardKinematics3D() {
  const [angle1, setAngle1] = useState(35)
  const [angle2, setAngle2] = useState(48)
  const [angle3, setAngle3] = useState(-62)
  return (
    <DemoFrame title="Forward Kinematics 3D · 给定关节角度算末端位置" subtitle="调整三个关节角度，观察末端执行器（绿色球）的位置如何通过矩阵链式相乘得到。" accent={C.cyan} side={<>
      <Slider label="joint 1 angle" value={angle1} min={-90} max={90} step={1} onChange={setAngle1} accent={C.cyan} unit="°" />
      <Slider label="joint 2 angle" value={angle2} min={-120} max={120} step={1} onChange={setAngle2} accent={C.blue} unit="°" />
      <Slider label="joint 3 angle" value={angle3} min={-120} max={120} step={1} onChange={setAngle3} accent={C.purple} unit="°" />
      <Metric label="FK method" value="matrix chain multiply" color={C.cyan} />
      <div>FK 简单、快速、稳定，但不直观：艺术家要调很多角度才能让手碰到目标物体。</div>
    </>}>
      <ForwardKinematicsScene angle1={angle1} angle2={angle2} angle3={angle3} />
    </DemoFrame>
  )
}

function InverseKinematicsScene({ targetX, targetY, iterations }) {
  const L1 = 0.85, L2 = 0.72, L3 = 0.58
  const target = [targetX, targetY, 0]
  const solve = useMemo(() => {
    let a1 = 0.5, a2 = 0.8, a3 = -0.6
    for (let iter = 0; iter < iterations; iter++) {
      const j1 = [0, 0, 0]
      const j2 = [Math.cos(a1) * L1, Math.sin(a1) * L1, 0]
      const j3 = [j2[0] + Math.cos(a1 + a2) * L2, j2[1] + Math.sin(a1 + a2) * L2, 0]
      const end = [j3[0] + Math.cos(a1 + a2 + a3) * L3, j3[1] + Math.sin(a1 + a2 + a3) * L3, 0]
      const dx = target[0] - end[0], dy = target[1] - end[1]
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 0.05) break
      a3 += Math.atan2(dy, dx) * 0.15
      a2 += Math.atan2(target[1] - j2[1], target[0] - j2[0]) * 0.12
      a1 += Math.atan2(target[1], target[0]) * 0.08
    }
    const j1 = [0, 0, 0]
    const j2 = [Math.cos(a1) * L1, Math.sin(a1) * L1, 0]
    const j3 = [j2[0] + Math.cos(a1 + a2) * L2, j2[1] + Math.sin(a1 + a2) * L2, 0]
    const end = [j3[0] + Math.cos(a1 + a2 + a3) * L3, j3[1] + Math.sin(a1 + a2 + a3) * L3, 0]
    return { j1, j2, j3, end }
  }, [targetX, targetY, iterations])
  return (
    <Canvas camera={{ position: [3.2, 1.8, 4.2], fov: 44 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[2, 4, 2]} intensity={2.2} />
      {[solve.j1, solve.j2, solve.j3].map((p, i) => <mesh key={i} position={p}>
        <sphereGeometry args={[0.12, 24, 12]} />
        <meshStandardMaterial color={C.blue} roughness={0.35} />
      </mesh>)}
      <Line points={[solve.j1, solve.j2, solve.j3, solve.end]} color={C.cyan} lineWidth={3.5} />
      <mesh position={solve.end}>
        <sphereGeometry args={[0.15, 32, 16]} />
        <meshStandardMaterial color={C.green} emissive={C.green} emissiveIntensity={0.12} roughness={0.32} />
      </mesh>
      <mesh position={target}>
        <sphereGeometry args={[0.13, 32, 16]} />
        <meshBasicMaterial color={C.amber} transparent opacity={0.55} />
      </mesh>
      <Html position={[target[0] + 0.28, target[1] + 0.18, 0]} style={{ color: C.amber, fontSize: 11, fontWeight: 900 }}>IK target</Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <planeGeometry args={[4.2, 2.6]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.7} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function InverseKinematicsIK3D() {
  const [targetX, setTargetX] = useState(1.35)
  const [targetY, setTargetY] = useState(0.92)
  const [iterations, setIterations] = useState(18)
  return (
    <DemoFrame title="Inverse Kinematics IK 3D · 给定目标位置反推关节角度" subtitle="拖动目标位置（黄色球），IK 求解器会迭代调整关节角度让末端尽量接近目标。" accent={C.green} side={<>
      <Slider label="target X" value={targetX} min={-1.5} max={1.8} step={0.01} onChange={setTargetX} accent={C.green} />
      <Slider label="target Y" value={targetY} min={-0.5} max={1.8} step={0.01} onChange={setTargetY} accent={C.amber} />
      <Slider label="IK iterations" value={iterations} min={5} max={35} step={1} onChange={setIterations} accent={C.purple} />
      <Metric label="IK method" value="iterative gradient descent" color={C.green} />
      <div>IK 直观但复杂：可能无解（目标太远）或多解（肘部朝向不确定），需要约束和迭代优化。</div>
    </>}>
      <InverseKinematicsScene targetX={targetX} targetY={targetY} iterations={iterations} />
    </DemoFrame>
  )
}

function RigidBodyScene({ restitution, angularVel }) {
  const bodies = [
    { p: [-1.25, 1.45, 0], v: [0.85, -0.42, 0], w: angularVel, col: C.blue },
    { p: [1.15, 0.92, 0], v: [-0.72, -0.28, 0], w: -angularVel * 0.7, col: C.orange }
  ]
  return (
    <Canvas camera={{ position: [3.5, 2.4, 4.6], fov: 44 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[2.5, 4, 2]} intensity={2.2} />
      {bodies.map((b, i) => <group key={i}>
        <mesh position={b.p} rotation={[0, 0, b.w * 0.5]}>
          <boxGeometry args={[0.52, 0.52, 0.52]} />
          <meshStandardMaterial color={b.col} roughness={0.38} />
        </mesh>
        <Line points={[b.p, [b.p[0] + b.v[0] * 1.2, b.p[1] + b.v[1] * 1.2, b.p[2]]]} color={b.col} lineWidth={2.8} transparent opacity={0.72} />
        <Html position={[b.p[0] + b.v[0] * 1.35, b.p[1] + b.v[1] * 1.35 + 0.15, 0]} style={{ color: b.col, fontSize: 10, fontWeight: 800 }}>v</Html>
      </group>)}
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshBasicMaterial color={C.amber} transparent opacity={0.45} />
      </mesh>
      <Html position={[-0.35, -0.05, 0]} style={{ color: C.amber, fontSize: 11, fontWeight: 900 }}>collision point</Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]}>
        <planeGeometry args={[4.8, 2.8]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.7} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function RigidBodyCollision3D() {
  const [restitution, setRestitution] = useState(0.65)
  const [angularVel, setAngularVel] = useState(0.82)
  return (
    <DemoFrame title="Rigid Body Collision 3D · 刚体碰撞需要平动和转动" subtitle="两个刚体带着线速度和角速度运动；碰撞时要计算冲量、更新速度和角速度。" accent={C.blue} side={<>
      <Slider label="restitution e" value={restitution} min={0} max={1} step={0.01} onChange={setRestitution} accent={C.blue} />
      <Slider label="angular velocity" value={angularVel} min={0} max={2.5} step={0.01} onChange={setAngularVel} accent={C.purple} unit=" rad/s" />
      <Metric label="collision type" value={restitution < 0.15 ? 'inelastic' : restitution > 0.85 ? 'elastic' : 'partial'} color={restitution < 0.15 ? C.red : restitution > 0.85 ? C.green : C.amber} />
      <div>刚体不会变形，但会转动；碰撞响应要同时更新线速度和角速度，并考虑惯性张量。</div>
    </>}>
      <RigidBodyScene restitution={restitution} angularVel={angularVel} />
    </DemoFrame>
  )
}

function FluidSPHScene({ particleCount, viscosity }) {
  const particles = useMemo(() => Array.from({ length: particleCount }, (_, i) => {
    const x = -1.05 + (i % 9) * 0.26
    const y = 0.35 + Math.floor(i / 9) * 0.24
    const vx = (Math.sin(i * 7.3) * 0.5 - 0.15) * (1 - viscosity)
    const vy = -0.35 - Math.abs(Math.cos(i * 5.1)) * 0.25
    return { p: [x, y, 0], v: [vx, vy, 0], density: 0.72 + Math.sin(i * 3.7) * 0.28 }
  }), [particleCount, viscosity])
  return (
    <Canvas camera={{ position: [3.4, 2.2, 4.4], fov: 44 }}>
      <color attach="background" args={[C.bg]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[2, 4, 2]} intensity={2.2} />
      <mesh position={[0, -0.45, 0]}>
        <boxGeometry args={[2.8, 0.08, 1.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.65} />
      </mesh>
      <mesh position={[-1.45, 0.55, 0]}>
        <boxGeometry args={[0.08, 2.1, 1.2]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <mesh position={[1.45, 0.55, 0]}>
        <boxGeometry args={[0.08, 2.1, 1.2]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {particles.map((pt, i) => {
        const size = 0.055 + pt.density * 0.045
        const col = mixRgb([0.06, 0.72, 0.9], [0.04, 0.42, 0.75], pt.density)
        return <group key={i}>
          <mesh position={pt.p}>
            <sphereGeometry args={[size, 16, 10]} />
            <meshStandardMaterial color={rgbCss01(col)} transparent opacity={0.72 + pt.density * 0.28} roughness={0.25} />
          </mesh>
          {i % 5 === 0 && <Line points={[pt.p, [pt.p[0] + pt.v[0] * 0.35, pt.p[1] + pt.v[1] * 0.35, 0]]} color={C.amber} transparent opacity={0.42} lineWidth={1.1} />}
        </group>
      })}
      <Html position={[-1.75, 1.55, 0]} style={{ color: C.cyan, fontSize: 11, fontWeight: 900 }}>SPH fluid particles</Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]}>
        <planeGeometry args={[4.2, 2.6]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} transparent opacity={0.68} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export function FluidSimulationSPH3D() {
  const [particleCount, setParticleCount] = useState(54)
  const [viscosity, setViscosity] = useState(0.42)
  return (
    <DemoFrame title="Fluid Simulation SPH 3D · 用粒子表示连续流体" subtitle="每个粒子代表一小团流体；通过核函数插值计算密度、压力和粘性力，模拟流体行为。" accent={C.cyan} side={<>
      <Slider label="particle count" value={particleCount} min={18} max={81} step={9} onChange={setParticleCount} accent={C.cyan} />
      <Slider label="viscosity" value={viscosity} min={0} max={1} step={0.01} onChange={setViscosity} accent={C.purple} />
      <Metric label="SPH method" value="kernel interpolation" color={C.cyan} />
      <div>SPH 灵活直观，但计算量大；每个粒子要查询邻居、计算压力和粘性，适合小规模或 GPU 加速。</div>
    </>}>
      <FluidSPHScene particleCount={particleCount} viscosity={viscosity} />
    </DemoFrame>
  )
}
