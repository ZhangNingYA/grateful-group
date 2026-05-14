import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { v, normalize, add, scale } from './rayUtils.js'
import { Header, ObsTask, Slider, Toggle, Status, Pill, panelStyle, sidePanel } from './ui.jsx'

// 3D AABB
const BOX = { min: v(-0.8, -0.6, -0.7), max: v(1.2, 0.8, 0.6) }

const AXIS_COLOR = { x: '#f43f5e', y: '#4ade80', z: '#6366f1' }

function slab3D(rayOrigin, rayDir, box) {
  const intervals = {}
  let tEnter = -Infinity, tExit = Infinity
  let parallelMiss = false
  for (const a of ['x', 'y', 'z']) {
    const o = rayOrigin[a], d = rayDir[a]
    const lo = box.min[a], hi = box.max[a]
    if (Math.abs(d) < 1e-9) {
      if (o < lo || o > hi) { parallelMiss = true; intervals[a] = { parallel: true, hit: false }; continue }
      intervals[a] = { parallel: true, hit: true, t0: -Infinity, t1: Infinity }
      continue
    }
    let t0 = (lo - o) / d
    let t1 = (hi - o) / d
    if (t0 > t1) [t0, t1] = [t1, t0]
    intervals[a] = { t0, t1, parallel: false }
    tEnter = Math.max(tEnter, t0)
    tExit = Math.min(tExit, t1)
  }
  return { intervals, tEnter, tExit, parallelMiss, hit: !parallelMiss && tEnter <= tExit && tExit >= 0 }
}

// Render an AABB as wireframe edges
function BoxWireframe({ min, max, color, opacity = 1 }) {
  const corners = [
    [min.x, min.y, min.z], [max.x, min.y, min.z], [max.x, max.y, min.z], [min.x, max.y, min.z],
    [min.x, min.y, max.z], [max.x, min.y, max.z], [max.x, max.y, max.z], [min.x, max.y, max.z],
  ]
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ]
  return (
    <>
      {edges.map(([a, b], i) => (
        <Line key={i} points={[corners[a], corners[b]]} color={color} lineWidth={1.6} transparent opacity={opacity} />
      ))}
    </>
  )
}

// Render a single slab: a thin transparent box covering the slab in two axes (extending beyond box)
function SlabPlane({ axis, low, high, color, span = 4 }) {
  // axis = 'x' | 'y' | 'z'. Two planes at coordinate=low and coordinate=high
  const plane = (coord) => {
    if (axis === 'x') return [coord, 0, 0, span * 2, span * 2, 'yz']
    if (axis === 'y') return [0, coord, 0, span * 2, span * 2, 'xz']
    return [0, 0, coord, span * 2, span * 2, 'xy']
  }
  const [px, py, pz, w, h, kind] = plane(low)
  const [px2, py2, pz2] = plane(high)
  return (
    <group>
      <mesh position={[px, py, pz]} rotation={kind === 'yz' ? [0, Math.PI / 2, 0] : kind === 'xz' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[px2, py2, pz2]} rotation={kind === 'yz' ? [0, Math.PI / 2, 0] : kind === 'xz' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Scene3D({ origin, dir, result, showSlabs }) {
  const rayLen = 8
  const rayEnd = add(origin, scale(dir, rayLen))

  const enterPt = result.hit && result.tEnter > 0
    ? add(origin, scale(dir, result.tEnter))
    : null
  const exitPt = result.hit
    ? add(origin, scale(dir, result.tExit))
    : null

  // Per-axis hit points on slab planes (where ray crosses min/max planes)
  const planeHits = []
  for (const a of ['x', 'y', 'z']) {
    const it = result.intervals[a]
    if (!it || it.parallel) continue
    if (Number.isFinite(it.t0)) planeHits.push({ axis: a, t: it.t0, pos: add(origin, scale(dir, it.t0)), kind: 'min' })
    if (Number.isFinite(it.t1)) planeHits.push({ axis: a, t: it.t1, pos: add(origin, scale(dir, it.t1)), kind: 'max' })
  }

  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[3, 4, 4]} intensity={0.7} />
      <pointLight position={[-3, -2, 2]} intensity={0.3} />

      {/* slabs */}
      {showSlabs && (
        <>
          <SlabPlane axis="x" low={BOX.min.x} high={BOX.max.x} color={AXIS_COLOR.x} />
          <SlabPlane axis="y" low={BOX.min.y} high={BOX.max.y} color={AXIS_COLOR.y} />
          <SlabPlane axis="z" low={BOX.min.z} high={BOX.max.z} color={AXIS_COLOR.z} />
        </>
      )}

      {/* AABB filled box */}
      <mesh position={[(BOX.min.x + BOX.max.x) / 2, (BOX.min.y + BOX.max.y) / 2, (BOX.min.z + BOX.max.z) / 2]}>
        <boxGeometry args={[BOX.max.x - BOX.min.x, BOX.max.y - BOX.min.y, BOX.max.z - BOX.min.z]} />
        <meshStandardMaterial color={result.hit ? '#4ade80' : '#6366f1'} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <BoxWireframe min={BOX.min} max={BOX.max} color={result.hit ? '#86efac' : '#a5b4fc'} />

      {/* axes near origin marker */}
      <Line points={[[0, 0, 0], [0.7, 0, 0]]} color={AXIS_COLOR.x} lineWidth={1.5} />
      <Line points={[[0, 0, 0], [0, 0.7, 0]]} color={AXIS_COLOR.y} lineWidth={1.5} />
      <Line points={[[0, 0, 0], [0, 0, 0.7]]} color={AXIS_COLOR.z} lineWidth={1.5} />
      <Html position={[0.85, 0, 0]} center><div style={{ color: AXIS_COLOR.x, fontSize: 10, fontFamily: 'monospace' }}>x</div></Html>
      <Html position={[0, 0.85, 0]} center><div style={{ color: AXIS_COLOR.y, fontSize: 10, fontFamily: 'monospace' }}>y</div></Html>
      <Html position={[0, 0, 0.85]} center><div style={{ color: AXIS_COLOR.z, fontSize: 10, fontFamily: 'monospace' }}>z</div></Html>

      {/* ray (faint full extension) */}
      <Line
        points={[[origin.x, origin.y, origin.z], [rayEnd.x, rayEnd.y, rayEnd.z]]}
        color="rgba(251,191,36,0.5)"
        lineWidth={1.5}
        dashed
        dashSize={0.12}
        gapSize={0.08}
      />

      {/* enter→exit highlighted segment */}
      {enterPt && exitPt && (
        <Line
          points={[[enterPt.x, enterPt.y, enterPt.z], [exitPt.x, exitPt.y, exitPt.z]]}
          color="#fde68a"
          lineWidth={4}
        />
      )}

      {/* origin */}
      <mesh position={[origin.x, origin.y, origin.z]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#a5b4fc" />
      </mesh>
      <Html position={[origin.x, origin.y + 0.2, origin.z]} center>
        <div style={{ color: '#c7d2fe', fontSize: 11, fontFamily: 'monospace', background: 'rgba(15,15,26,0.7)', padding: '2px 6px', borderRadius: 4 }}>o</div>
      </Html>

      {/* per-axis plane hits */}
      {showSlabs && planeHits.map((h, i) => (
        <mesh key={i} position={[h.pos.x, h.pos.y, h.pos.z]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={AXIS_COLOR[h.axis]} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* enter / exit markers */}
      {enterPt && (
        <>
          <mesh position={[enterPt.x, enterPt.y, enterPt.z]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
          <Html position={[enterPt.x, enterPt.y + 0.18, enterPt.z]} center>
            <div style={{ color: '#86efac', fontSize: 10, fontFamily: 'monospace', background: 'rgba(15,15,26,0.7)', padding: '2px 6px', borderRadius: 4 }}>
              t_enter = {result.tEnter.toFixed(2)}
            </div>
          </Html>
        </>
      )}
      {exitPt && result.hit && (
        <>
          <mesh position={[exitPt.x, exitPt.y, exitPt.z]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <Html position={[exitPt.x, exitPt.y + 0.18, exitPt.z]} center>
            <div style={{ color: '#fde68a', fontSize: 10, fontFamily: 'monospace', background: 'rgba(15,15,26,0.7)', padding: '2px 6px', borderRadius: 4 }}>
              t_exit = {result.tExit.toFixed(2)}
            </div>
          </Html>
        </>
      )}

      <gridHelper args={[10, 20, '#1f2937', '#0f172a']} position={[0, BOX.min.y - 0.4, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} target={[(BOX.min.x + BOX.max.x) / 2, (BOX.min.y + BOX.max.y) / 2, (BOX.min.z + BOX.max.z) / 2]} />
    </>
  )
}

function fmtT(t) {
  if (t === undefined || t === null) return '—'
  if (!Number.isFinite(t)) return t > 0 ? '+∞' : '−∞'
  return t.toFixed(2)
}

function Timeline({ intervals, tEnter, tExit }) {
  const tMin = -3, tMax = 7
  const Wt = 600, Ht = 110
  const xT = (t) => 50 + ((t - tMin) / (tMax - tMin)) * (Wt - 80)
  const xT0 = (t) => xT(Math.max(tMin, t))
  const xT1 = (t) => xT(Math.min(tMax, t))

  return (
    <svg viewBox={`0 0 ${Wt} ${Ht}`} style={{ width: '100%', height: 110, display: 'block', background: '#0a0a14' }}>
      {/* axis */}
      {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((t, i) => (
        <g key={i}>
          <line x1={xT(t)} y1={Ht - 22} x2={xT(t)} y2={Ht - 26} stroke="rgba(255,255,255,0.2)" />
          <text x={xT(t)} y={Ht - 8} fill="#666" fontSize="9" textAnchor="middle" fontFamily="monospace">{t}</text>
        </g>
      ))}
      <line x1="40" y1={Ht - 24} x2={Wt - 30} y2={Ht - 24} stroke="rgba(255,255,255,0.1)" />
      <text x="6" y={Ht - 20} fill="#666" fontSize="10" fontFamily="monospace">t →</text>

      {/* per-axis intervals */}
      {['x', 'y', 'z'].map((ax, i) => {
        const it = intervals[ax]
        if (!it || it.parallel) return null
        return (
          <g key={ax}>
            <rect x={xT0(it.t0)} y={14 + i * 18} width={Math.max(2, xT1(it.t1) - xT0(it.t0))} height={12}
              fill={`${AXIS_COLOR[ax]}66`} stroke={AXIS_COLOR[ax]} strokeWidth={1} />
            <text x="6" y={24 + i * 18} fill={AXIS_COLOR[ax]} fontSize="10" fontFamily="monospace">{ax}</text>
          </g>
        )
      })}
      {/* enter / exit */}
      {Number.isFinite(tEnter) && Number.isFinite(tExit) && tEnter <= tExit && (
        <g>
          <line x1={xT(tEnter)} y1={6} x2={xT(tEnter)} y2={Ht - 26} stroke="#86efac" strokeWidth={1.5} strokeDasharray="3,2" />
          <line x1={xT(tExit)} y1={6} x2={xT(tExit)} y2={Ht - 26} stroke="#fde68a" strokeWidth={1.5} strokeDasharray="3,2" />
          <rect x={xT(Math.max(tMin, tEnter))} y={Ht - 38} width={Math.max(1, xT(Math.min(tMax, tExit)) - xT(Math.max(tMin, tEnter)))} height={6}
            fill="#fbbf24" />
          <text x={xT(tEnter)} y={5} fill="#86efac" fontSize="9" textAnchor="middle" fontFamily="monospace">enter</text>
          <text x={xT(tExit)} y={5} fill="#fde68a" fontSize="9" textAnchor="middle" fontFamily="monospace">exit</text>
        </g>
      )}
    </svg>
  )
}

export default function AABBSlabMethodLab() {
  const [yaw, setYaw] = useState(0.4)
  const [pitch, setPitch] = useState(0.15)
  const [oxy, setOxy] = useState({ x: -2.6, y: -1.2 })
  const [oz, setOz] = useState(2.5)
  const [showSlabs, setShowSlabs] = useState(true)

  const origin = v(oxy.x, oxy.y, oz)
  const dir = useMemo(() => normalize(v(
    Math.cos(pitch) * Math.cos(yaw),
    Math.sin(pitch),
    -Math.cos(pitch) * Math.sin(yaw),
  )), [yaw, pitch])

  const result = useMemo(() => slab3D(origin, dir, BOX), [origin, dir])

  return (
    <div style={panelStyle}>
      <Header
        title="AABB · Slab Method (3D)"
        subtitle="对 x / y / z 三个 slab 各算 [t₀, t₁]，三段的交集非空才命中盒子。"
        right={<Pill ok={result.hit} label={result.hit ? `t_enter=${result.tEnter.toFixed(2)}` : 'miss'} />}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(240px, 1fr)' }}>
        <div>
          <div style={{ height: 460, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
            <Canvas camera={{ position: [4, 3, 5], fov: 45 }}>
              <Scene3D origin={origin} dir={dir} result={result} showSlabs={showSlabs} />
            </Canvas>
          </div>
          <Timeline intervals={result.intervals} tEnter={result.tEnter} tExit={result.tExit} />
        </div>

        <div style={sidePanel}>
          <ObsTask>
            旋转视角观察 3D 包围盒。开关 slabs 看每个轴对应的两个平行平面。让 ray 平行于某个轴：观察 parallel case。
          </ObsTask>

          <Slider label="ray yaw" value={yaw} min={-Math.PI} max={Math.PI} step={0.01} onChange={setYaw} precision={2} color="#fbbf24" />
          <Slider label="ray pitch" value={pitch} min={-1.2} max={1.2} step={0.01} onChange={setPitch} precision={2} color="#fbbf24" />
          <Slider label="origin x" value={oxy.x} min={-4} max={2} step={0.05} onChange={(x) => setOxy(p => ({ ...p, x }))} color="#a5b4fc" />
          <Slider label="origin y" value={oxy.y} min={-3} max={3} step={0.05} onChange={(y) => setOxy(p => ({ ...p, y }))} color="#a5b4fc" />
          <Slider label="origin z" value={oz} min={-3} max={4} step={0.05} onChange={setOz} color="#a5b4fc" />

          <Toggle active={showSlabs} onClick={() => setShowSlabs(!showSlabs)}>Show slabs</Toggle>

          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', lineHeight: 1.6 }}>
            t_enter = max(t_x0, t_y0, t_z0)<br />
            t_exit  = min(t_x1, t_y1, t_z1)<br />
            hit ⇔ t_enter ≤ t_exit ∧ t_exit ≥ 0
          </div>

          <Status>
            <div style={{ color: AXIS_COLOR.x }}>x: t₀={fmtT(result.intervals.x?.t0)}, t₁={fmtT(result.intervals.x?.t1)}</div>
            <div style={{ color: AXIS_COLOR.y }}>y: t₀={fmtT(result.intervals.y?.t0)}, t₁={fmtT(result.intervals.y?.t1)}</div>
            <div style={{ color: AXIS_COLOR.z }}>z: t₀={fmtT(result.intervals.z?.t0)}, t₁={fmtT(result.intervals.z?.t1)}</div>
            <div style={{ marginTop: 4 }}>t_enter = <b style={{ color: '#86efac' }}>{fmtT(result.tEnter)}</b></div>
            <div>t_exit&nbsp; = <b style={{ color: '#fde68a' }}>{fmtT(result.tExit)}</b></div>
            <div style={{ marginTop: 4, color: result.hit ? '#4ade80' : '#f87171' }}>
              {result.hit
                ? 'hit ✓'
                : result.parallelMiss ? 'miss: parallel & outside slab'
                  : result.tEnter > result.tExit ? 'miss: t_enter > t_exit'
                    : result.tExit < 0 ? 'miss: box behind ray'
                      : 'miss'}
            </div>
          </Status>
        </div>
      </div>
    </div>
  )
}
