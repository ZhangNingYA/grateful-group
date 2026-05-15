import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Html, Float } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { panelStyle, Header } from './ui.jsx'

/**
 * Hero 组件：展示 KD-Tree 的核心概念 —— 空间递归划分
 * 3D 场景中展示点云被逐步划分的过程
 */

// 生成随机 3D 点
function generatePoints(count, seed = 42) {
  const pts = []
  let s = seed
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
  for (let i = 0; i < count; i++) {
    pts.push([
      (rand() - 0.5) * 4,
      (rand() - 0.5) * 4,
      (rand() - 0.5) * 4,
    ])
  }
  return pts
}

// 简单 KD-Tree 构建
function buildKDTree(points, depth = 0, bounds = null, maxDepth = 4) {
  if (!bounds) {
    bounds = { min: [-2.5, -2.5, -2.5], max: [2.5, 2.5, 2.5] }
  }
  if (points.length <= 1 || depth >= maxDepth) {
    return { points, bounds, isLeaf: true, depth }
  }
  const axis = depth % 3
  const sorted = [...points].sort((a, b) => a[axis] - b[axis])
  const mid = Math.floor(sorted.length / 2)
  const median = sorted[mid][axis]

  const leftBounds = { min: [...bounds.min], max: [...bounds.max] }
  leftBounds.max[axis] = median
  const rightBounds = { min: [...bounds.min], max: [...bounds.max] }
  rightBounds.min[axis] = median

  return {
    axis,
    median,
    depth,
    bounds,
    isLeaf: false,
    left: buildKDTree(sorted.slice(0, mid), depth + 1, leftBounds, maxDepth),
    right: buildKDTree(sorted.slice(mid), depth + 1, rightBounds, maxDepth),
  }
}

const AXIS_COLORS = ['#f43f5e', '#4ade80', '#818cf8']
const AXIS_NAMES = ['X', 'Y', 'Z']

function SplitPlane({ axis, median, bounds, opacity = 0.15 }) {
  const color = AXIS_COLORS[axis]
  const size = [
    bounds.max[0] - bounds.min[0],
    bounds.max[1] - bounds.min[1],
    bounds.max[2] - bounds.min[2],
  ]
  const center = [
    (bounds.min[0] + bounds.max[0]) / 2,
    (bounds.min[1] + bounds.max[1]) / 2,
    (bounds.min[2] + bounds.max[2]) / 2,
  ]
  center[axis] = median

  let rotation = [0, 0, 0]
  let planeSize = [1, 1]
  if (axis === 0) { rotation = [0, Math.PI / 2, 0]; planeSize = [size[2], size[1]] }
  if (axis === 1) { rotation = [Math.PI / 2, 0, 0]; planeSize = [size[0], size[2]] }
  if (axis === 2) { rotation = [0, 0, 0]; planeSize = [size[0], size[1]] }

  return (
    <mesh position={center} rotation={rotation}>
      <planeGeometry args={planeSize} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

function renderSplits(node, visibleDepth) {
  if (!node || node.isLeaf || node.depth >= visibleDepth) return null
  return (
    <group key={`${node.axis}-${node.median}-${node.depth}`}>
      <SplitPlane axis={node.axis} median={node.median} bounds={node.bounds} opacity={0.12 + node.depth * 0.03} />
      {renderSplits(node.left, visibleDepth)}
      {renderSplits(node.right, visibleDepth)}
    </group>
  )
}

function PointCloud({ points, tree, visibleDepth }) {
  // Color points by their leaf region
  const getLeafDepth = (pt, node) => {
    if (!node || node.isLeaf) return node ? node.depth : 0
    if (pt[node.axis] < node.median) return getLeafDepth(pt, node.left)
    return getLeafDepth(pt, node.right)
  }

  const regionColors = ['#f43f5e', '#4ade80', '#818cf8', '#fbbf24', '#f472b6', '#22d3ee', '#a78bfa', '#fb923c']

  return (
    <>
      {points.map((pt, i) => {
        const leafDepth = getLeafDepth(pt, tree)
        const color = regionColors[leafDepth % regionColors.length]
        return (
          <mesh key={i} position={pt}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color={visibleDepth > 0 ? color : '#6366f1'} />
          </mesh>
        )
      })}
    </>
  )
}

function BoundsWireframe({ bounds, color = '#334155' }) {
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
        <Line key={i} points={[corners[a], corners[b]]} color={color} lineWidth={1} transparent opacity={0.4} />
      ))}
    </>
  )
}

function RotatingGroup({ children }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.08
  })
  return <group ref={ref}>{children}</group>
}

function Scene({ points, tree, visibleDepth, autoRotate }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.6} />
      {autoRotate ? (
        <RotatingGroup>
          <BoundsWireframe bounds={{ min: [-2.5, -2.5, -2.5], max: [2.5, 2.5, 2.5] }} />
          <PointCloud points={points} tree={tree} visibleDepth={visibleDepth} />
          {renderSplits(tree, visibleDepth)}
        </RotatingGroup>
      ) : (
        <group>
          <BoundsWireframe bounds={{ min: [-2.5, -2.5, -2.5], max: [2.5, 2.5, 2.5] }} />
          <PointCloud points={points} tree={tree} visibleDepth={visibleDepth} />
          {renderSplits(tree, visibleDepth)}
        </group>
      )}
      <gridHelper args={[6, 12, '#1a1a2e', '#0f0f1a']} position={[0, -2.5, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

export default function KDTreeConceptHero() {
  const [visibleDepth, setVisibleDepth] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)
  const points = useMemo(() => generatePoints(60), [])
  const tree = useMemo(() => buildKDTree(points, 0, null, 4), [points])

  return (
    <div style={panelStyle}>
      <Header
        title="KD-Tree · 空间递归划分"
        subtitle="逐层展开划分平面，观察空间如何被递归二分"
      />
      <div style={{ position: 'relative', height: 480, background: '#0a0a14' }}>
        <Canvas camera={{ position: [5, 4, 6], fov: 45 }}>
          <Scene points={points} tree={tree} visibleDepth={visibleDepth} autoRotate={autoRotate} />
        </Canvas>
        {/* 控制面板 */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 16,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 16px', borderRadius: 10,
          background: 'rgba(10,10,20,0.85)', border: '1px solid rgba(99,102,241,0.2)',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>划分深度</span>
          <input type="range" min={0} max={4} step={1} value={visibleDepth}
            onChange={(e) => setVisibleDepth(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: '#6366f1' }} />
          <span style={{ fontSize: 12, color: '#c7d2fe', fontFamily: 'monospace', minWidth: 20 }}>{visibleDepth}</span>
          <button onClick={() => setAutoRotate(!autoRotate)} style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 10, cursor: 'pointer',
            border: autoRotate ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
            background: autoRotate ? 'rgba(99,102,241,0.15)' : 'transparent',
            color: autoRotate ? '#c7d2fe' : '#666',
          }}>
            {autoRotate ? '⏸ 停止旋转' : '▶ 自动旋转'}
          </button>
        </div>
        {/* 图例 */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          padding: '8px 12px', borderRadius: 8,
          background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(255,255,255,0.06)',
          fontSize: 10, color: '#94a3b8', lineHeight: 1.8,
        }}>
          <div><span style={{ color: AXIS_COLORS[0] }}>■</span> X 轴划分</div>
          <div><span style={{ color: AXIS_COLORS[1] }}>■</span> Y 轴划分</div>
          <div><span style={{ color: AXIS_COLORS[2] }}>■</span> Z 轴划分</div>
        </div>
      </div>
    </div>
  )
}
