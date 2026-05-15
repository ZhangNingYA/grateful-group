import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { panelStyle, sidePanel, Header, ObsTask, Slider, Status, Button, InfoBox } from './ui.jsx'

/**
 * KD-Tree K-近邻搜索 (KNN) 可视化
 * 展示如何找到 K 个最近邻
 */

const AXIS_COLORS = ['#f43f5e', '#4ade80', '#818cf8']

function generatePoints(count, seed = 88) {
  const pts = []
  let s = seed
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
  for (let i = 0; i < count; i++) {
    pts.push([(rand() - 0.5) * 6, (rand() - 0.5) * 6, (rand() - 0.5) * 6])
  }
  return pts
}

function dist(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
}

// 简单优先队列（最大堆）
class MaxHeap {
  constructor(k) { this.k = k; this.items = [] }
  push(item) {
    this.items.push(item)
    this.items.sort((a, b) => b.dist - a.dist)
    if (this.items.length > this.k) this.items.pop()
  }
  maxDist() { return this.items.length < this.k ? Infinity : this.items[0].dist }
  getItems() { return [...this.items].sort((a, b) => a.dist - b.dist) }
  size() { return this.items.length }
}

function buildTree(points, depth = 0, indices = null) {
  if (!indices) indices = points.map((_, i) => i)
  if (indices.length === 0) return null
  if (indices.length === 1) return { idx: indices[0], isLeaf: true, depth }
  const axis = depth % 3
  const sorted = [...indices].sort((a, b) => points[a][axis] - points[b][axis])
  const mid = Math.floor(sorted.length / 2)
  return {
    idx: sorted[mid], axis, depth, isLeaf: false,
    left: buildTree(points, depth + 1, sorted.slice(0, mid)),
    right: buildTree(points, depth + 1, sorted.slice(mid + 1)),
  }
}

function knnSearch(tree, points, query, k) {
  const heap = new MaxHeap(k)
  const visited = []

  function search(node) {
    if (!node) return
    visited.push(node.idx)
    const d = dist(points[node.idx], query)
    heap.push({ idx: node.idx, dist: d })

    if (node.isLeaf) return

    const axis = node.axis
    const diff = query[axis] - points[node.idx][axis]
    const first = diff < 0 ? node.left : node.right
    const second = diff < 0 ? node.right : node.left

    search(first)
    if (Math.abs(diff) < heap.maxDist()) {
      search(second)
    }
  }

  search(tree)
  return { neighbors: heap.getItems(), visited }
}

// 暴力 KNN 用于对比
function bruteKNN(points, query, k) {
  return points
    .map((pt, i) => ({ idx: i, dist: dist(pt, query) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k)
}

function Scene({ points, query, knnResult, k }) {
  const neighborSet = new Set(knnResult.neighbors.map(n => n.idx))
  const visitedSet = new Set(knnResult.visited)
  const maxNeighborDist = knnResult.neighbors.length > 0
    ? knnResult.neighbors[knnResult.neighbors.length - 1].dist
    : 0

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />

      {/* K-近邻搜索半径球 */}
      {maxNeighborDist > 0 && (
        <mesh position={query}>
          <sphereGeometry args={[maxNeighborDist, 32, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.04} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      )}

      {/* 连线到 K 个最近邻 */}
      {knnResult.neighbors.map((n, i) => (
        <Line
          key={`line-${i}`}
          points={[query, points[n.idx]]}
          color="#4ade80"
          lineWidth={1.5}
          transparent
          opacity={0.6}
          dashed
          dashSize={0.1}
          gapSize={0.06}
        />
      ))}

      {/* 点云 */}
      {points.map((pt, i) => {
        let color = '#334155'
        let size = 0.07
        if (neighborSet.has(i)) {
          color = '#4ade80'
          size = 0.12
        } else if (visitedSet.has(i)) {
          color = '#818cf8'
          size = 0.08
        }
        return (
          <mesh key={i} position={pt}>
            <sphereGeometry args={[size, 10, 10]} />
            <meshBasicMaterial color={color} />
          </mesh>
        )
      })}

      {/* 查询点 */}
      <mesh position={query}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <Html position={[query[0], query[1] + 0.35, query[2]]} center>
        <div style={{
          background: 'rgba(10,10,20,0.85)', padding: '2px 8px', borderRadius: 4,
          fontSize: 10, color: '#fde68a', fontFamily: 'monospace',
        }}>query (k={k})</div>
      </Html>

      {/* 标注最近邻序号 */}
      {knnResult.neighbors.map((n, i) => (
        <Html key={`label-${i}`} position={[points[n.idx][0], points[n.idx][1] + 0.25, points[n.idx][2]]} center>
          <div style={{
            background: 'rgba(10,10,20,0.8)', padding: '1px 5px', borderRadius: 3,
            fontSize: 9, color: '#86efac', fontFamily: 'monospace',
          }}>#{i + 1} d={n.dist.toFixed(2)}</div>
        </Html>
      ))}

      <gridHelper args={[8, 16, '#1a1a2e', '#0f0f1a']} position={[0, -3.5, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

export default function KDTreeKNNSearch() {
  const points = useMemo(() => generatePoints(40), [])
  const tree = useMemo(() => buildTree(points), [points])
  const [k, setK] = useState(5)
  const [qx, setQx] = useState(0)
  const [qy, setQy] = useState(0)
  const [qz, setQz] = useState(0)

  const query = useMemo(() => [qx, qy, qz], [qx, qy, qz])
  const knnResult = useMemo(() => knnSearch(tree, points, query, k), [tree, points, query, k])
  const bruteResult = useMemo(() => bruteKNN(points, query, k), [points, query, k])

  return (
    <div style={panelStyle}>
      <Header
        title="KD-Tree · K-近邻搜索 (KNN)"
        subtitle="找到距离查询点最近的 K 个点"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(250px, 1fr)' }}>
        <div style={{ height: 480, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas camera={{ position: [7, 5, 8], fov: 45 }}>
            <Scene points={points} query={query} knnResult={knnResult} k={k} />
          </Canvas>
        </div>
        <div style={sidePanel}>
          <ObsTask>
            调整 K 值和查询点位置，观察搜索半径如何变化。K 越大，搜索半径越大，需要访问的节点越多。
          </ObsTask>

          <Slider label="K (近邻数)" value={k} min={1} max={15} step={1} onChange={setK} color="#4ade80" precision={0} />
          <Slider label="query X" value={qx} min={-3} max={3} step={0.1} onChange={setQx} color="#fbbf24" />
          <Slider label="query Y" value={qy} min={-3} max={3} step={0.1} onChange={setQy} color="#fbbf24" />
          <Slider label="query Z" value={qz} min={-3} max={3} step={0.1} onChange={setQz} color="#fbbf24" />

          <Status title="KNN 结果">
            <div>K = {k}</div>
            <div>访问节点: <b style={{ color: '#818cf8' }}>{knnResult.visited.length}</b> / {points.length}</div>
            <div>搜索半径: <b style={{ color: '#fbbf24' }}>
              {knnResult.neighbors.length > 0 ? knnResult.neighbors[knnResult.neighbors.length - 1].dist.toFixed(3) : '—'}
            </b></div>
            <div style={{ marginTop: 4, fontSize: 10, color: '#666' }}>
              暴力搜索需访问: {points.length} 节点
            </div>
            <div style={{ fontSize: 10, color: '#4ade80' }}>
              节省: {((1 - knnResult.visited.length / points.length) * 100).toFixed(1)}%
            </div>
          </Status>

          <InfoBox type="info">
            KNN 使用最大堆维护 K 个候选点。当堆满后，只有距离小于堆顶的点才会被加入，这使得搜索半径不断收缩。
          </InfoBox>

          <div style={{
            padding: 8, borderRadius: 6, background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, color: '#666',
          }}>
            <div><span style={{ color: '#fbbf24' }}>●</span> 查询点</div>
            <div><span style={{ color: '#4ade80' }}>●</span> K 个最近邻</div>
            <div><span style={{ color: '#818cf8' }}>●</span> 已访问节点</div>
            <div><span style={{ color: '#334155' }}>●</span> 未访问（被剪枝）</div>
          </div>
        </div>
      </div>
    </div>
  )
}
