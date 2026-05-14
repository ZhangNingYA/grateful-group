import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useMemo, useState, useRef } from 'react'
import * as THREE from 'three'
import { v, sub, normalize, dot, cross, length, scale, add, intersectSphere, intersectTriangle, intersectAABB, aabbFromPoints } from './rayUtils.js'

// Scene description (a few simple objects)
const SPHERE = { type: 'sphere', id: 'sphere', center: v(-1.6, 0.6, 0.4), radius: 0.7, color: '#6366f1' }
const BOX = {
  type: 'aabb', id: 'box',
  bbox: { min: v(0.5, -0.4, -1.2), max: v(1.7, 0.8, 0.0) },
  color: '#f59e0b',
}
const TRIANGLE = {
  type: 'triangle', id: 'triangle',
  p0: v(-0.4, -0.4, 1.4), p1: v(1.0, -0.4, 1.4), p2: v(0.3, 1.2, 1.4),
  color: '#f43f5e',
}
const LIGHT = v(2.5, 3.5, 2.5)

function intersectScene(ray) {
  let best = { t: Infinity, obj: null, point: null, normal: null }

  // sphere
  const s = intersectSphere(ray, SPHERE.center, SPHERE.radius)
  if (s.hit && s.tNear < best.t) {
    const p = s.point
    const n = normalize(sub(p, SPHERE.center))
    best = { t: s.tNear, obj: SPHERE, point: p, normal: n }
  }

  // triangle
  const tri = intersectTriangle(ray, TRIANGLE.p0, TRIANGLE.p1, TRIANGLE.p2)
  if (tri.hit && tri.t < best.t) {
    const e1 = sub(TRIANGLE.p1, TRIANGLE.p0)
    const e2 = sub(TRIANGLE.p2, TRIANGLE.p0)
    let n = normalize(cross(e1, e2))
    if (dot(n, ray.direction) > 0) n = scale(n, -1)
    best = { t: tri.t, obj: TRIANGLE, point: tri.point, normal: n }
  }

  // box
  const bx = intersectAABB(ray, BOX.bbox)
  if (bx.hit && bx.tEnter > 1e-4 && bx.tEnter < best.t) {
    const point = add(ray.origin, scale(ray.direction, bx.tEnter))
    // normal: which face was hit?
    let normal = v(0, 0, 0)
    const eps = 1e-3
    if (Math.abs(point.x - BOX.bbox.min.x) < eps) normal = v(-1, 0, 0)
    else if (Math.abs(point.x - BOX.bbox.max.x) < eps) normal = v(1, 0, 0)
    else if (Math.abs(point.y - BOX.bbox.min.y) < eps) normal = v(0, -1, 0)
    else if (Math.abs(point.y - BOX.bbox.max.y) < eps) normal = v(0, 1, 0)
    else if (Math.abs(point.z - BOX.bbox.min.z) < eps) normal = v(0, 0, -1)
    else normal = v(0, 0, 1)
    best = { t: bx.tEnter, obj: BOX, point, normal }
  }

  return best.obj ? best : null
}

function ImagePlane({ camPos, fovDeg, distance, gridN, selected, onPick, showGrid }) {
  // Build a square image plane facing -Z from camera
  const fov = (fovDeg * Math.PI) / 180
  const half = Math.tan(fov / 2) * distance
  const planeZ = camPos.z - distance

  const rows = []
  const colors = []
  for (let j = 0; j < gridN; j++) {
    for (let i = 0; i < gridN; i++) {
      const px = (i + 0.5) / gridN
      const py = (j + 0.5) / gridN
      const x = (2 * px - 1) * half + camPos.x
      const y = (1 - 2 * py) * half + camPos.y
      rows.push([x, y, planeZ, i, j])
      colors.push((i + j) % 2 === 0 ? '#1f2940' : '#19223a')
    }
  }
  const cellSize = (2 * half) / gridN

  return (
    <group>
      {/* Outline */}
      <Line
        points={[
          [camPos.x - half, camPos.y - half, planeZ],
          [camPos.x + half, camPos.y - half, planeZ],
          [camPos.x + half, camPos.y + half, planeZ],
          [camPos.x - half, camPos.y + half, planeZ],
          [camPos.x - half, camPos.y - half, planeZ],
        ]}
        color="#6366f1" lineWidth={2}
      />
      {/* Pixels */}
      {showGrid && rows.map(([x, y, z, i, j]) => {
        const isSel = selected.x === i && selected.y === j
        return (
          <mesh key={`${i}-${j}`} position={[x, y, z]} onClick={(e) => { e.stopPropagation(); onPick(i, j) }}>
            <planeGeometry args={[cellSize * 0.92, cellSize * 0.92]} />
            <meshBasicMaterial
              color={isSel ? '#fbbf24' : (i + j) % 2 === 0 ? '#202c4d' : '#172033'}
              transparent opacity={isSel ? 0.8 : 0.55}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function getRayForPixel(camPos, fovDeg, distance, gridN, sx, sy) {
  const fov = (fovDeg * Math.PI) / 180
  const half = Math.tan(fov / 2) * distance
  const px = (sx + 0.5) / gridN
  const py = (sy + 0.5) / gridN
  const x = (2 * px - 1) * half
  const y = (1 - 2 * py) * half
  const dir = normalize(v(x, y, -distance))
  return { origin: camPos, direction: dir }
}

function RayLine({ origin, end, color, dashed = false, lineWidth = 2 }) {
  return (
    <Line
      points={[[origin.x, origin.y, origin.z], [end.x, end.y, end.z]]}
      color={color}
      lineWidth={lineWidth}
      dashed={dashed}
      dashSize={0.1}
      gapSize={0.06}
    />
  )
}

function Scene({ fov, dist, selected, setSelected, gridN, showAll, showShadow, showNormals, showGrid }) {
  const camPos = v(0, 0, 4)

  // Selected primary ray
  const ray = useMemo(() => getRayForPixel(camPos, fov, dist, gridN, selected.x, selected.y), [fov, dist, selected, gridN])
  const hit = useMemo(() => intersectScene(ray), [ray])

  // Sample rays (subset)
  const sampleRays = useMemo(() => {
    if (!showAll) return []
    const out = []
    const step = Math.max(1, Math.floor(gridN / 6))
    for (let j = 0; j < gridN; j += step) {
      for (let i = 0; i < gridN; i += step) {
        const r = getRayForPixel(camPos, fov, dist, gridN, i, j)
        const h = intersectScene(r)
        const end = h ? h.point : add(r.origin, scale(r.direction, 8))
        out.push({ origin: r.origin, end, hit: !!h })
      }
    }
    return out
  }, [showAll, fov, dist, gridN, camPos])

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[LIGHT.x, LIGHT.y, LIGHT.z]} intensity={1.0} />
      <pointLight position={[-3, 3, 3]} intensity={0.4} />

      {/* Camera marker */}
      <mesh position={[camPos.x, camPos.y, camPos.z]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#a5b4fc" />
      </mesh>
      <Html position={[camPos.x, camPos.y + 0.3, camPos.z]} center>
        <div style={{ color: '#a5b4fc', fontSize: 11, fontFamily: 'monospace', background: 'rgba(15,15,26,0.7)', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>camera</div>
      </Html>

      <ImagePlane
        camPos={camPos} fovDeg={fov} distance={dist} gridN={gridN}
        selected={selected} onPick={(i, j) => setSelected({ x: i, y: j })}
        showGrid={showGrid}
      />

      {/* Scene objects */}
      <mesh position={[SPHERE.center.x, SPHERE.center.y, SPHERE.center.z]}>
        <sphereGeometry args={[SPHERE.radius, 32, 32]} />
        <meshStandardMaterial color={SPHERE.color} roughness={0.4} />
      </mesh>

      <mesh position={[
        (BOX.bbox.min.x + BOX.bbox.max.x) / 2,
        (BOX.bbox.min.y + BOX.bbox.max.y) / 2,
        (BOX.bbox.min.z + BOX.bbox.max.z) / 2,
      ]}>
        <boxGeometry args={[
          BOX.bbox.max.x - BOX.bbox.min.x,
          BOX.bbox.max.y - BOX.bbox.min.y,
          BOX.bbox.max.z - BOX.bbox.min.z,
        ]} />
        <meshStandardMaterial color={BOX.color} roughness={0.5} />
      </mesh>

      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={3}
            array={new Float32Array([
              TRIANGLE.p0.x, TRIANGLE.p0.y, TRIANGLE.p0.z,
              TRIANGLE.p1.x, TRIANGLE.p1.y, TRIANGLE.p1.z,
              TRIANGLE.p2.x, TRIANGLE.p2.y, TRIANGLE.p2.z,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <meshStandardMaterial color={TRIANGLE.color} side={THREE.DoubleSide} roughness={0.4} />
      </mesh>

      {/* Light marker */}
      <mesh position={[LIGHT.x, LIGHT.y, LIGHT.z]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      <Html position={[LIGHT.x, LIGHT.y + 0.3, LIGHT.z]} center>
        <div style={{ color: '#fde68a', fontSize: 11, fontFamily: 'monospace', background: 'rgba(15,15,26,0.7)', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>light</div>
      </Html>

      {/* All sample rays */}
      {sampleRays.map((r, i) => (
        <RayLine key={i} origin={r.origin} end={r.end} color={r.hit ? 'rgba(125, 211, 252, 0.45)' : 'rgba(120,130,180,0.18)'} lineWidth={1} />
      ))}

      {/* Selected primary ray */}
      <RayLine
        origin={ray.origin}
        end={hit ? hit.point : add(ray.origin, scale(ray.direction, 8))}
        color={hit ? '#fbbf24' : '#94a3b8'}
        lineWidth={3}
      />

      {/* Hit point + normal + shadow ray */}
      {hit && (
        <>
          <mesh position={[hit.point.x, hit.point.y, hit.point.z]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
          {showNormals && (
            <RayLine
              origin={hit.point}
              end={add(hit.point, scale(hit.normal, 0.6))}
              color="#4ade80"
              lineWidth={2}
            />
          )}
          {showShadow && (
            <RayLine
              origin={add(hit.point, scale(hit.normal, 0.02))}
              end={LIGHT}
              color="#fde68a"
              lineWidth={1.5}
              dashed
            />
          )}
        </>
      )}

      <gridHelper args={[12, 24, '#1f2937', '#0f172a']} position={[0, -1.2, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} target={[0, 0, 0]} />
    </>
  )
}

const fmt = (n) => (n === null || n === undefined ? '—' : Number.isFinite(n) ? n.toFixed(3) : '—')

export default function RayTracingHeroLab3D() {
  const [fov, setFov] = useState(50)
  const [dist, setDist] = useState(1.4)
  const [gridN, setGridN] = useState(10)
  const [selected, setSelected] = useState({ x: 5, y: 5 })
  const [showAll, setShowAll] = useState(true)
  const [showShadow, setShowShadow] = useState(true)
  const [showNormals, setShowNormals] = useState(true)
  const [showGrid, setShowGrid] = useState(true)

  const ray = useMemo(() => getRayForPixel(v(0, 0, 4), fov, dist, gridN, selected.x, selected.y), [fov, dist, gridN, selected])
  const hit = useMemo(() => intersectScene(ray), [ray])

  const tBtn = (active) => ({
    padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
    border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
    background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
    color: active ? '#c7d2fe' : '#666',
  })

  return (
    <div style={{
      width: '100%', borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.18)',
      background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
    }}>
      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600 }}>Ray Tracing Hero · Pixel → Scene</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>点击 image plane 上的像素，发射 primary ray，找到最近命中的物体。</div>
        </div>
        <div style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}>
          pixel ({selected.x}, {selected.y})
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)', gap: 0 }}>
        <div style={{ height: 520, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas camera={{ position: [4, 3, 6], fov: 45 }}>
            <Scene fov={fov} dist={dist} selected={selected} setSelected={setSelected} gridN={gridN}
              showAll={showAll} showShadow={showShadow} showNormals={showNormals} showGrid={showGrid} />
          </Canvas>
        </div>

        <div style={{ padding: 14, fontSize: 12, color: '#aaa', display: 'flex', flexDirection: 'column', gap: 14, background: 'rgba(15,15,26,0.6)', minHeight: 520 }}>
          <div>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 4, letterSpacing: 1 }}>OBSERVATION TASK</div>
            <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.55 }}>
              拖动相机视角观察。点击不同像素，看 primary ray 命中哪个物体。打开 / 关闭 sample rays 体会“每个像素一条 ray”的整体直觉。
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ControlSlider label="FOV" value={fov} min={20} max={90} step={1} onChange={setFov} unit="°" color="#6366f1" />
            <ControlSlider label="Image Plane Distance" value={dist} min={0.6} max={3} step={0.05} onChange={setDist} color="#f59e0b" />
            <ControlSlider label="Grid Resolution" value={gridN} min={4} max={16} step={1} onChange={setGridN} color="#4ade80" />
            <div style={{ display: 'flex', gap: 8 }}>
              <ControlSlider label="Pixel x" value={selected.x} min={0} max={gridN - 1} step={1} onChange={(x) => setSelected((s) => ({ ...s, x }))} color="#fbbf24" />
              <ControlSlider label="Pixel y" value={selected.y} min={0} max={gridN - 1} step={1} onChange={(y) => setSelected((s) => ({ ...s, y }))} color="#fbbf24" />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button style={tBtn(showAll)} onClick={() => setShowAll(!showAll)}>Sample Rays</button>
            <button style={tBtn(showShadow)} onClick={() => setShowShadow(!showShadow)}>Shadow Ray</button>
            <button style={tBtn(showNormals)} onClick={() => setShowNormals(!showNormals)}>Normals</button>
            <button style={tBtn(showGrid)} onClick={() => setShowGrid(!showGrid)}>Pixel Grid</button>
          </div>

          <div style={{
            marginTop: 4, padding: 10, borderRadius: 8,
            background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
            fontFamily: 'monospace', fontSize: 11, color: '#c7d2fe', lineHeight: 1.7,
          }}>
            <div style={{ color: '#888', fontSize: 10, marginBottom: 4 }}>STATUS</div>
            <div>origin <span style={{ color: '#fff' }}>({fmt(ray.origin.x)}, {fmt(ray.origin.y)}, {fmt(ray.origin.z)})</span></div>
            <div>dir &nbsp;&nbsp;&nbsp;<span style={{ color: '#fff' }}>({fmt(ray.direction.x)}, {fmt(ray.direction.y)}, {fmt(ray.direction.z)})</span></div>
            <div style={{ marginTop: 4, color: hit ? '#4ade80' : '#94a3b8' }}>
              {hit ? `hit → ${hit.obj.id}, t = ${fmt(hit.t)}` : 'miss → background'}
            </div>
            {hit && <div style={{ color: '#fff' }}>p = ({fmt(hit.point.x)}, {fmt(hit.point.y)}, {fmt(hit.point.z)})</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

function ControlSlider({ label, value, min, max, step, onChange, color = '#6366f1', unit = '' }) {
  return (
    <div style={{ flex: 1, minWidth: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color, fontFamily: 'monospace' }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: color }}
      />
    </div>
  )
}
