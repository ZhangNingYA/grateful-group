import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { panelStyle, sidePanel, Header, ObsTask, Slider, Status, Toggle, Button, InfoBox } from './ui.jsx'

/**
 * KD-Tree 光线遍历可视化
 * 展示光线如何在 KD-Tree 中高效遍历
 */

const AXIS_COLORS = ['#f43f5e', '#4ade80', '#818cf8']

function generateTriangles(count, seed = 55) {
  const tris = []
  let s = seed
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
  for (let i = 0; i < count; i++) {
    const cx = (rand() - 0.5) * 6
    const cy = (rand() - 0.5) * 6
    const cz = (rand() - 0.5) * 6
    const size = 0.3 + rand() * 0.4
    tris.push({
      id: i,
      center: [cx, cy, cz],
      bbox: {
        min: [cx - size, cy - size, cz - size],
        max: [cx + size, cy + size, cz + size],
      },
    })
  }
  return tris
}

// 构建 KD-Tree for objects (SAH-like)
function buildObjectKDTree(objects, depth = 0, bounds = null, maxDepth = 5) {
  if (!bounds) {
    bounds = { min: [-4, -4, -4], max: [4, 4, 4] }
  }
  if (objects.length <= 2 || depth >= maxDepth) {
    return { objects, bounds, isLeaf: true, depth }
  }
  const axis = depth % 3
  const sorted = [...objects].sort((a, b) => a.center[axis] - b.center[axis])
  const mid = Math.floor(sorted.length / 2)
  const splitPos = sorted[mid].center[axis]

  const leftBounds = { min: [...bounds.min], max: [...bounds.max] }
  leftBounds.max[axis] = splitPos
  const rightBounds = { min: [...bounds.min], max: [...bounds.max] }
  rightBounds.min[axis] = splitPos

  return {
    axis, splitPos, depth, bounds, isLeaf: false,
    left: buildObjectKDTree(sorted.slice(0, mid), depth + 1, leftBounds, maxDepth),
    right: buildObjectKDTree(sorted.slice(mid), depth + 1, rightBounds, maxDepth),
  }
}

// 光线与 AABB 求交
function rayAABB(origin, dir, bounds) {
  let tmin = -Infinity, tmax = Infinity
  for (let i = 0; i < 3; i++) {
    if (Math.abs(dir[i]) < 1e-9) {
      if (origin[i] < bounds.min[i] || origin[i] > bounds.max[i]) return null
      continue
    }
    let t1 = (bounds.min[i] - origin[i]) / dir[i]
    let t2 = (bounds.max[i] - origin[i]) / dir[i]
    if (t1 > t2) [t1, t2] = [t2, t1]
    tmin = Math.max(tmin, t1)
    tmax = Math.min(tmax, t2)
    if (tmin > tmax) return null
  }
  if (tmax < 0) return null
  return { tmin: Math.max(0, tmin), tmax }
}

// 光线遍历 KD-Tree，记录访问的节点
function traverseKDTree(tree, origin, dir) {
  const visited = []
  const testedObjects = new Set()

  function traverse(node) {
    if (!node) return
    const hit = rayAABB(origin, dir, node.bounds)
    if (!hit) {
      visited.push({ bounds: node.bounds, depth: node.depth || 0, action: 'skip' })
      return
    }
    visited.push({ bounds: node.bounds, depth: node.depth || 0, action: 'enter' })

    if (node.isLeaf) {
      node.objects.forEach(obj => testedObjects.add(obj.id))
      return
    }

    // 确定先遍历哪一侧
    const axis = node.axis
    if (origin[axis] < node.splitPos || (origin[axis] === node.splitPos && dir[axis] <= 0)) {
      traverse(node.left)
      traverse(node.right)
    } else {
      traverse(node.right)
      traverse(node.left)
    }
  }

  traverse(tree)
  return { visited, testedObjects }
}

function BoundsWireframe({ bounds, color, opacity = 0.3, lineWidth = 1 }) {
  const { min: mn, max: mx } = bounds
  const corners = [
    [mn[0], mn[1], mn[2]], [mx[0], mn[1], mn[2]], [mx[0], mx[1], mn[2]], [mn[0], mx[1], mn[2]],
    [mn[0], mn[1], mx[2]], [mx[0], mn[1], mx[2]], [mx[0], mx[1], mx[2]], [mn[0], mx[1], mx[2]],
  ]
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ]
  return (
    <>
      {edges.map(([a, b], i) => (
        <Line key={i} points={[corners[a], corners[b]]} color={color} lineWidth={lineWidth} transparent opacity={opacity} />
      ))}
    </>
  )
}

function Scene({ objects, tree, origin, dir, traversalResult, showAllBounds }) {
  const rayLen = 12
  const rayEnd = [origin[0] + dir[0] * rayLen, origin[1] + dir[1] * rayLen, origin[2] + dir[2] * rayLen]

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />

      {/* 根节点边界 */}
      <BoundsWireframe bounds={{ min: [-4, -4, -4], max: [4, 4, 4] }} color="#334155" opacity={0.2} />

      {/* 遍历过的节点 */}
      {traversalResult.visited.map((v, i) => (
        <BoundsWireframe
          key={i}
          bounds={v.bounds}
          color={v.action === 'enter' ? '#4ade80' : '#f43f5e'}
          opacity={v.action === 'enter' ? 0.4 : 0.15}
          lineWidth={v.action === 'enter' ? 1.5 : 0.8}
        />
      ))}

      {/* 物体 */}
      {objects.map((obj) => {
        const tested = traversalResult.testedObjects.has(obj.id)
        return (
          <mesh key={obj.id} position={obj.center}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial
              color={tested ? '#fbbf24' : '#475569'}
              transparent
              opacity={tested ? 0.8 : 0.3}
              emissive={tested ? '#fbbf24' : '#000000'}
              emissiveIntensity={tested ? 0.3 : 0}
            />
          </mesh>
        )
      })}

      {/* 光线 */}
      <Line
        points={[origin, rayEnd]}
        color="#fbbf24"
        lineWidth={2.5}
      />
      {/* 光线起点 */}
      <mesh position={origin}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <Html position={[origin[0], origin[1] + 0.3, origin[2]]} center>
        <div style={{
          background: 'rgba(10,10,20,0.85)', padding: '2px 6px', borderRadius: 4,
          fontSize: 10, color: '#fde68a', fontFamily: 'monospace',
        }}>ray origin</div>
      </Html>

      {/* 方向箭头 */}
      <Line
        points={[origin, [origin[0] + dir[0] * 1.5, origin[1] + dir[1] * 1.5, origin[2] + dir[2] * 1.5]]}
        color="#fde68a"
        lineWidth={3}
      />

      <gridHelper args={[10, 20, '#1a1a2e', '#0f0f1a']} position={[0, -4, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

export default function KDTreeRayTraversal() {
  const objects = useMemo(() => generateTriangles(20), [])
  const tree = useMemo(() => buildObjectKDTree(objects), [objects])

  const [yaw, setYaw] = useState(0.3)
  const [pitch, setPitch] = useState(0.1)
  const [ox, setOx] = useState(-4)
  const [oy, setOy] = useState(0)
  const [oz, setOz] = useState(0)
  const [showAllBounds, setShowAllBounds] = useState(false)

  const origin = useMemo(() => [ox, oy, oz], [ox, oy, oz])
  const dir = useMemo(() => {
    const d = [
      Math.cos(pitch) * Math.cos(yaw),
      Math.sin(pitch),
      Math.cos(pitch) * Math.sin(yaw),
    ]
    const len = Math.sqrt(d[0] ** 2 + d[1] ** 2 + d[2] ** 2)
    return [d[0] / len, d[1] / len, d[2] / len]
  }, [yaw, pitch])

  const traversalResult = useMemo(() => traverseKDTree(tree, origin, dir), [tree, origin, dir])

  const totalObjects = objects.length
  const testedCount = traversalResult.testedObjects.size
  const skipRatio = ((1 - testedCount / totalObjects) * 100).toFixed(1)

  return (
    <div style={panelStyle}>
      <Header
        title="KD-Tree · 光线遍历"
        subtitle="观察光线如何跳过不相交的空间区域，只测试必要的物体"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(250px, 1fr)' }}>
        <div style={{ height: 500, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas camera={{ position: [8, 6, 8], fov: 45 }}>
            <Scene
              objects={objects}
              tree={tree}
              origin={origin}
              dir={dir}
              traversalResult={traversalResult}
              showAllBounds={showAllBounds}
            />
          </Canvas>
        </div>
        <div style={sidePanel}>
          <ObsTask>
            调整光线方向和起点，观察绿色框（被遍历的节点）和黄色物体（被测试的物体）。注意跳过率如何变化。
          </ObsTask>

          <Slider label="ray yaw" value={yaw} min={-Math.PI} max={Math.PI} step={0.02} onChange={setYaw} color="#fbbf24" />
          <Slider label="ray pitch" value={pitch} min={-1.2} max={1.2} step={0.02} onChange={setPitch} color="#fbbf24" />
          <Slider label="origin X" value={ox} min={-5} max={5} step={0.1} onChange={setOx} color="#a5b4fc" />
          <Slider label="origin Y" value={oy} min={-4} max={4} step={0.1} onChange={setOy} color="#a5b4fc" />
          <Slider label="origin Z" value={oz} min={-4} max={4} step={0.1} onChange={setOz} color="#a5b4fc" />

          <Status title="遍历统计">
            <div>总物体数: {totalObjects}</div>
            <div>实际测试: <b style={{ color: '#fbbf24' }}>{testedCount}</b></div>
            <div>跳过率: <b style={{ color: '#4ade80' }}>{skipRatio}%</b></div>
            <div>遍历节点: {traversalResult.visited.filter(v => v.action === 'enter').length}</div>
            <div>跳过节点: <b style={{ color: '#f43f5e' }}>{traversalResult.visited.filter(v => v.action === 'skip').length}</b></div>
          </Status>

          <InfoBox type="tip">
            KD-Tree 让光线只需测试少量物体，而非暴力遍历所有物体。跳过率越高，加速效果越好。
          </InfoBox>

          <div style={{
            padding: 8, borderRadius: 6, background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, color: '#666',
          }}>
            <div><span style={{ color: '#4ade80' }}>□</span> 光线穿过的节点</div>
            <div><span style={{ color: '#f43f5e' }}>□</span> 被跳过的节点</div>
            <div><span style={{ color: '#fbbf24' }}>■</span> 被测试的物体</div>
            <div><span style={{ color: '#475569' }}>■</span> 未测试的物体</div>
          </div>
        </div>
      </div>
    </div>
  )
}
