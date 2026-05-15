import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { panelStyle, sidePanel, Header, ObsTask, Status, Button, InfoBox } from './ui.jsx'

/**
 * KD-Tree vs BVH 对比可视化
 * 并排展示两种加速结构的划分方式差异
 */

const COLORS = {
  kdSplit: ['#f43f5e', '#4ade80', '#818cf8'],
  bvhBox: '#fbbf24',
  point: '#94a3b8',
}

function generatePoints(count, seed = 99) {
  const pts = []
  let s = seed
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
  for (let i = 0; i < count; i++) {
    // 创建一些聚类
    const cluster = Math.floor(rand() * 3)
    const cx = [-1.5, 1.5, 0][cluster]
    const cy = [0, 1, -1.5][cluster]
    const cz = [1, -1, 0.5][cluster]
    pts.push([
      cx + (rand() - 0.5) * 2,
      cy + (rand() - 0.5) * 2,
      cz + (rand() - 0.5) * 2,
    ])
  }
  return pts
}

// KD-Tree 构建
function buildKD(points, depth = 0, bounds = null, maxDepth = 3) {
  if (!bounds) bounds = { min: [-3, -3, -3], max: [3, 3, 3] }
  if (points.length <= 2 || depth >= maxDepth) {
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
    axis, median, depth, bounds, isLeaf: false,
    left: buildKD(sorted.slice(0, mid), depth + 1, leftBounds, maxDepth),
    right: buildKD(sorted.slice(mid), depth + 1, rightBounds, maxDepth),
  }
}

// BVH 构建
function computeBBox(points) {
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (const p of points) {
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], p[i])
      max[i] = Math.max(max[i], p[i])
    }
  }
  // 添加一点 padding
  for (let i = 0; i < 3; i++) { min[i] -= 0.1; max[i] += 0.1 }
  return { min, max }
}

function buildBVH(points, depth = 0, maxDepth = 3) {
  const bounds = computeBBox(points)
  if (points.length <= 2 || depth >= maxDepth) {
    return { points, bounds, isLeaf: true, depth }
  }
  // 选择最长轴
  const extents = [bounds.max[0] - bounds.min[0], bounds.max[1] - bounds.min[1], bounds.max[2] - bounds.min[2]]
  const axis = extents.indexOf(Math.max(...extents))
  const sorted = [...points].sort((a, b) => a[axis] - b[axis])
  const mid = Math.floor(sorted.length / 2)

  return {
    bounds, depth, isLeaf: false, axis,
    left: buildBVH(sorted.slice(0, mid), depth + 1, maxDepth),
    right: buildBVH(sorted.slice(mid), depth + 1, maxDepth),
  }
}

function BoundsWireframe({ bounds, color, opacity = 0.4, lineWidth = 1.2 }) {
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

function SplitPlane({ axis, median, bounds, opacity = 0.12 }) {
  const color = COLORS.kdSplit[axis]
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

function renderKDSplits(node) {
  if (!node || node.isLeaf) return null
  return (
    <group key={`kd-${node.depth}-${node.axis}-${node.median}`}>
      <SplitPlane axis={node.axis} median={node.median} bounds={node.bounds} />
      {renderKDSplits(node.left)}
      {renderKDSplits(node.right)}
    </group>
  )
}

function renderBVHBoxes(node, depth = 0) {
  if (!node) return null
  const depthColors = ['#fbbf24', '#f472b6', '#22d3ee', '#a78bfa']
  const color = depthColors[depth % depthColors.length]
  return (
    <group key={`bvh-${depth}-${node.bounds.min.join(',')}`}>
      <BoundsWireframe bounds={node.bounds} color={color} opacity={0.5 - depth * 0.1} lineWidth={2 - depth * 0.3} />
      {!node.isLeaf && renderBVHBoxes(node.left, depth + 1)}
      {!node.isLeaf && renderBVHBoxes(node.right, depth + 1)}
    </group>
  )
}

function KDScene({ points, kdTree }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={0.4} />
      <BoundsWireframe bounds={{ min: [-3, -3, -3], max: [3, 3, 3] }} color="#334155" opacity={0.2} />
      {renderKDSplits(kdTree)}
      {points.map((pt, i) => (
        <mesh key={i} position={pt}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      ))}
      <gridHelper args={[8, 16, '#1a1a2e', '#0f0f1a']} position={[0, -3, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

function BVHScene({ points, bvhTree }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={0.4} />
      {renderBVHBoxes(bvhTree)}
      {points.map((pt, i) => (
        <mesh key={i} position={pt}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      ))}
      <gridHelper args={[8, 16, '#1a1a2e', '#0f0f1a']} position={[0, -3, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

export default function KDTreeVsBVH() {
  const points = useMemo(() => generatePoints(30), [])
  const kdTree = useMemo(() => buildKD(points), [points])
  const bvhTree = useMemo(() => buildBVH(points), [points])
  const [view, setView] = useState('both') // 'kd', 'bvh', 'both'

  return (
    <div style={panelStyle}>
      <Header
        title="KD-Tree vs BVH · 结构对比"
        subtitle="同一组点云，两种不同的空间划分策略"
      />
      <div style={{ padding: '8px 16px', display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <Button onClick={() => setView('both')} active={view === 'both'}>并排对比</Button>
        <Button onClick={() => setView('kd')} active={view === 'kd'} color="#f43f5e">仅 KD-Tree</Button>
        <Button onClick={() => setView('bvh')} active={view === 'bvh'} color="#fbbf24">仅 BVH</Button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: view === 'both' ? '1fr 1fr' : '1fr',
        height: 450, background: '#0a0a14',
      }}>
        {(view === 'kd' || view === 'both') && (
          <div style={{ position: 'relative', borderRight: view === 'both' ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <Canvas camera={{ position: [5, 4, 6], fov: 45 }}>
              <KDScene points={points} kdTree={kdTree} />
            </Canvas>
            <div style={{
              position: 'absolute', top: 8, left: 8,
              padding: '4px 10px', borderRadius: 6,
              background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(244,63,94,0.3)',
              fontSize: 11, color: '#f43f5e', fontWeight: 600,
            }}>KD-Tree</div>
          </div>
        )}
        {(view === 'bvh' || view === 'both') && (
          <div style={{ position: 'relative' }}>
            <Canvas camera={{ position: [5, 4, 6], fov: 45 }}>
              <BVHScene points={points} bvhTree={bvhTree} />
            </Canvas>
            <div style={{
              position: 'absolute', top: 8, left: 8,
              padding: '4px 10px', borderRadius: 6,
              background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(251,191,36,0.3)',
              fontSize: 11, color: '#fbbf24', fontWeight: 600,
            }}>BVH</div>
          </div>
        )}
      </div>

      {/* 对比表格 */}
      <div style={{ padding: 16 }}>
        <table style={{
          width: '100%', fontSize: 11, color: '#94a3b8',
          borderCollapse: 'collapse', fontFamily: 'monospace',
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#666' }}>特性</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', color: '#f43f5e' }}>KD-Tree</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', color: '#fbbf24' }}>BVH</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['划分方式', '轴对齐平面切割空间', '包围盒包裹物体'],
              ['空间覆盖', '无重叠，完整覆盖', '可能重叠'],
              ['物体归属', '物体可能跨越多个节点', '每个物体只属于一个节点'],
              ['动态更新', '困难（需重建）', '相对容易（refit）'],
              ['构建复杂度', 'O(n log n)', 'O(n log n)'],
              ['适用场景', '静态场景、光线追踪', '动态场景、实时渲染'],
            ].map(([feature, kd, bvh], i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '6px 12px', color: '#c7d2fe' }}>{feature}</td>
                <td style={{ padding: '6px 12px', textAlign: 'center' }}>{kd}</td>
                <td style={{ padding: '6px 12px', textAlign: 'center' }}>{bvh}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
