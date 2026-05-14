import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useMemo, useState } from 'react'
import { v, normalize, intersectAABB } from './rayUtils.js'
import { Header, ObsTask, Slider, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

// build groups of triangles in space, each with its bounding box
const GROUPS = (() => {
  const out = []
  const positions = [
    { id: 'G1', cx: -2.5, cy: 0.4, cz: -0.2, color: '#6366f1', n: 8 },
    { id: 'G2', cx: 0.0, cy: -0.6, cz: 0.5, color: '#f43f5e', n: 12 },
    { id: 'G3', cx: 2.5, cy: 0.5, cz: -0.3, color: '#fbbf24', n: 10 },
    { id: 'G4', cx: 0.5, cy: 1.5, cz: -1.5, color: '#4ade80', n: 6 },
  ]
  for (const p of positions) {
    const tris = []
    for (let i = 0; i < p.n; i++) {
      const ox = p.cx + (Math.random() - 0.5) * 0.7
      const oy = p.cy + (Math.random() - 0.5) * 0.6
      const oz = p.cz + (Math.random() - 0.5) * 0.7
      tris.push({ x: ox, y: oy, z: oz, size: 0.18 + Math.random() * 0.18 })
    }
    let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
    for (const t of tris) {
      minX = Math.min(minX, t.x - t.size); minY = Math.min(minY, t.y - t.size); minZ = Math.min(minZ, t.z - t.size)
      maxX = Math.max(maxX, t.x + t.size); maxY = Math.max(maxY, t.y + t.size); maxZ = Math.max(maxZ, t.z + t.size)
    }
    out.push({ id: p.id, color: p.color, tris, bbox: { min: v(minX, minY, minZ), max: v(maxX, maxY, maxZ) } })
  }
  return out
})()

export default function BoundingVolumePruningDemo3D() {
  const [angle, setAngle] = useState(0)
  const [showBoxes, setShowBoxes] = useState(true)
  const [showSkipped, setShowSkipped] = useState(true)

  const ray = useMemo(() => {
    const dir = normalize(v(Math.cos(angle), Math.sin(angle * 0.5), -1))
    return { origin: v(-5, 0, 4), direction: dir }
  }, [angle])

  // test boxes
  const tests = useMemo(() => {
    return GROUPS.map((g) => ({ group: g, hit: intersectAABB(ray, g.bbox).hit }))
  }, [ray])

  const totalTri = GROUPS.reduce((s, g) => s + g.tris.length, 0)
  const testedWithBV = tests.filter((t) => t.hit).reduce((s, t) => s + t.group.tris.length, 0)
  const skipped = totalTri - testedWithBV

  return (
    <div style={panelStyle}>
      <Header title="Bounding Volume · 用包围盒快速排除" subtitle="ray miss 一个 group 的 bounding box，整个 group 都不需要测试。" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <div style={{ height: 480, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas camera={{ position: [3, 4, 8], fov: 45 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[3, 5, 4]} intensity={0.7} />

            {/* ray */}
            <mesh position={[ray.origin.x, ray.origin.y, ray.origin.z]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshBasicMaterial color="#a5b4fc" />
            </mesh>
            <Line points={[
              [ray.origin.x, ray.origin.y, ray.origin.z],
              [ray.origin.x + ray.direction.x * 12, ray.origin.y + ray.direction.y * 12, ray.origin.z + ray.direction.z * 12],
            ]} color="#fbbf24" lineWidth={3} />

            {/* groups */}
            {tests.map(({ group, hit }) => (
              <group key={group.id}>
                {showBoxes && (
                  <BoxOutline bbox={group.bbox} color={hit ? group.color : '#444'} dashed={!hit} />
                )}
                {(hit || showSkipped) && group.tris.map((t, i) => (
                  <mesh key={i} position={[t.x, t.y, t.z]}>
                    <tetrahedronGeometry args={[t.size, 0]} />
                    <meshStandardMaterial color={hit ? group.color : '#3a3a4a'} transparent opacity={hit ? 0.85 : 0.25} />
                  </mesh>
                ))}
                <Html position={[(group.bbox.min.x + group.bbox.max.x) / 2, group.bbox.max.y + 0.15, (group.bbox.min.z + group.bbox.max.z) / 2]} center>
                  <div style={{
                    fontSize: 10, fontFamily: 'monospace',
                    color: hit ? group.color : '#666',
                    background: 'rgba(15,15,26,0.8)', padding: '2px 6px', borderRadius: 4,
                  }}>
                    {group.id} · {hit ? `tested (${group.tris.length})` : `skipped`}
                  </div>
                </Html>
              </group>
            ))}

            <gridHelper args={[14, 28, '#1f2937', '#0f172a']} position={[0, -1.5, 0]} />
            <OrbitControls />
          </Canvas>
        </div>
        <div style={sidePanel}>
          <ObsTask>调整 ray angle 观察 ray 命中和 miss 不同的 group。开关 bounding boxes 体会“一个 box 决定整组三角形”的剪枝。</ObsTask>

          <Slider label="ray yaw" value={angle} min={-1.2} max={1.2} step={0.01} onChange={setAngle} precision={2} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Toggle active={showBoxes} onClick={() => setShowBoxes(!showBoxes)}>Bounding boxes</Toggle>
            <Toggle active={showSkipped} onClick={() => setShowSkipped(!showSkipped)}>Show skipped</Toggle>
          </div>

          <Status>
            <div>total triangles: {totalTri}</div>
            <div>without BV: <b style={{ color: '#f87171' }}>{totalTri}</b> tests</div>
            <div>with BV: <b style={{ color: '#4ade80' }}>{testedWithBV}</b> tests</div>
            <div style={{ marginTop: 4, color: '#fbbf24' }}>skipped: {skipped} ({(skipped / totalTri * 100).toFixed(0)}%)</div>
          </Status>
        </div>
      </div>
    </div>
  )
}

function BoxOutline({ bbox, color, dashed }) {
  const { min, max } = bbox
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
        <Line key={i} points={[corners[a], corners[b]]} color={color} lineWidth={dashed ? 1 : 1.6} dashed={dashed} dashSize={0.06} gapSize={0.04} />
      ))}
    </>
  )
}
