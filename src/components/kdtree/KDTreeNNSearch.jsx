import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useState, useMemo, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { panelStyle, sidePanel, Header, ObsTask, Slider, Status, Toggle, Button, InfoBox } from './ui.jsx'

/**
 * KD-Tree 最近邻搜索可视化
 * 展示搜索过程中的回溯和剪枝
 */

const AXIS_COLORS = ['#f43f5e', '#4ade80', '#818cf8']
const AXIS_NAMES = ['X', 'Y', 'Z']

function generatePoints(count, seed = 77) {
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

// 构建 KD-Tree
function buildTree(points, depth = 0, indices = null) {
  if (!indices) indices = points.map((_, i) => i)
  if (indices.length === 0) return null
  if (indices.length === 1) return { idx: indices[0], isLeaf: true, depth }

  const axis = depth % 3
  const sorted = [...indices].sort((a, b) => points[a][axis] - points[b][axis])
  const mid = Math.floor(sorted.length / 2)

  return {
    idx: sorted[mid],
    axis,
    depth,
    isLeaf: false,
    left: buildTree(points, depth + 1, sorted.slice(0, mid)),
    right: buildTree(points, depth + 1, sorted.slice(mid + 1)),
  }
}

// 最近邻搜索，记录访问路径
function nnSearch(tree, points, query) {
  const visited = []
  let bestIdx = -1
  let bestDist = Infinity
  const prunedNodes = []

  function search(node) {
    if (!node) return
    visited.push({ idx: node.idx, action: 'visit' })

    const d = dist(points[node.idx], query)
    if (d < bestDist) {
      bestDist = d
      bestIdx = node.idx
      visited.push({ idx: node.idx, action: 'update_best', dist: d })
    }

    if (node.isLeaf) return

    const axis = node.axis
    const diff = query[axis] - points[node.idx][axis]
    const first = diff < 0 ? node.left : node.right
    const second = diff < 0 ? node.right : node.left

    search(first)

    // 检查是否需要搜索另一侧
    if (Math.abs(diff) < bestDist) {
      visited.push({ idx: node.idx, action: 'cross_check', axis })
      search(second)
    } else {
      prunedNodes.push(node.idx)
      visited.push({ idx: node.idx, action: 'prune', axis })
    }
  }

  search(tree)
  return { bestIdx, bestDist, visited, prunedNodes }
}

function SearchSphere({ center, radius, opacity = 0.08 }) {
  return (
    <mesh position={center}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={opacity} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}

function Scene({ points, tree, query, searchResult, currentVisitStep, showSearchSphere }) {
  const visitedUpTo = searchResult.visited.slice(0, currentVisitStep + 1)
  const visitedIndices = new Set(visitedUpTo.filter(v => v.action === 'visit').map(v => v.idx))
  const prunedSet = new Set(searchResult.prunedNodes)

  // 当前最佳距离（到当前步骤为止）
  let currentBestDist = Infinity
  let currentBestIdx = -1
  for (const v of visitedUpTo) {
    if (v.action === 'update_best') {
      currentBestDist = v.dist
      currentBestIdx = v.idx
    }
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />

      {/* 搜索球 */}
      {showSearchSphere && currentBestDist < Infinity && (
        <SearchSphere center={query} radius={currentBestDist} opacity={0.06} />
      )}

      {/* 查询点到最近点的连线 */}
      {currentBestIdx >= 0 && (
        <Line
          points={[query, points[currentBestIdx]]}
          color="#fbbf24"
          lineWidth={2}
          dashed
          dashSize={0.15}
          gapSize={0.1}
        />
      )}

      {/* 点云 */}
      {points.map((pt, i) => {
        let color = '#334155'
        let size = 0.08
        if (i === currentBestIdx) {
          color = '#4ade80'
          size = 0.14
        } else if (visitedIndices.has(i)) {
          color = '#818cf8'
          size = 0.1
        } else if (prunedSet.has(i)) {
          color = '#f43f5e'
          size = 0.06
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
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <Html position={[query[0], query[1] + 0.3, query[2]]} center>
        <div style={{
          background: 'rgba(10,10,20,0.85)', padding: '2px 6px', borderRadius: 4,
          fontSize: 10, color: '#fde68a', fontFamily: 'monospace',
        }}>query</div>
      </Html>

      {/* 最近点标注 */}
      {currentBestIdx >= 0 && (
        <Html position={[points[currentBestIdx][0], points[currentBestIdx][1] + 0.3, points[currentBestIdx][2]]} center>
          <div style={{
            background: 'rgba(10,10,20,0.85)', padding: '2px 6px', borderRadius: 4,
            fontSize: 10, color: '#86efac', fontFamily: 'monospace',
          }}>nearest d={currentBestDist.toFixed(2)}</div>
        </Html>
      )}

      <gridHelper args={[8, 16, '#1a1a2e', '#0f0f1a']} position={[0, -3.5, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

export default function KDTreeNNSearch() {
  const points = useMemo(() => generatePoints(30), [])
  const tree = useMemo(() => buildTree(points), [points])
  const [queryX, setQueryX] = useState(0.5)
  const [queryY, setQueryY] = useState(0.8)
  const [queryZ, setQueryZ] = useState(-0.3)
  const [currentVisitStep, setCurrentVisitStep] = useState(0)
  const [showSearchSphere, setShowSearchSphere] = useState(true)
  const [autoPlay, setAutoPlay] = useState(false)
  const autoPlayRef = useRef(null)

  const query = useMemo(() => [queryX, queryY, queryZ], [queryX, queryY, queryZ])
  const searchResult = useMemo(() => nnSearch(tree, points, query), [tree, points, query])

  const maxStep = searchResult.visited.length - 1

  // 自动播放
  const toggleAutoPlay = useCallback(() => {
    if (autoPlay) {
      clearInterval(autoPlayRef.current)
      setAutoPlay(false)
    } else {
      setAutoPlay(true)
      setCurrentVisitStep(0)
      autoPlayRef.current = setInterval(() => {
        setCurrentVisitStep(prev => {
          if (prev >= maxStep) {
            clearInterval(autoPlayRef.current)
            setAutoPlay(false)
            return prev
          }
          return prev + 1
        })
      }, 600)
    }
  }, [autoPlay, maxStep])

  const currentAction = searchResult.visited[currentVisitStep]

  return (
    <div style={panelStyle}>
      <Header
        title="KD-Tree · 最近邻搜索 (NN Search)"
        subtitle="观察搜索如何沿树下降、回溯、剪枝"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)' }}>
        <div style={{ height: 500, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas camera={{ position: [6, 5, 8], fov: 45 }}>
            <Scene
              points={points}
              tree={tree}
              query={query}
              searchResult={searchResult}
              currentVisitStep={currentVisitStep}
              showSearchSphere={showSearchSphere}
            />
          </Canvas>
        </div>
        <div style={sidePanel}>
          <ObsTask>
            拖动查询点位置，观察搜索路径如何变化。注意黄色球体（搜索半径）如何收缩，以及红色点（被剪枝）如何被跳过。
          </ObsTask>

          <Slider label="query X" value={queryX} min={-3} max={3} step={0.1} onChange={(v) => { setQueryX(v); setCurrentVisitStep(0) }} color="#fbbf24" />
          <Slider label="query Y" value={queryY} min={-3} max={3} step={0.1} onChange={(v) => { setQueryY(v); setCurrentVisitStep(0) }} color="#fbbf24" />
          <Slider label="query Z" value={queryZ} min={-3} max={3} step={0.1} onChange={(v) => { setQueryZ(v); setCurrentVisitStep(0) }} color="#fbbf24" />

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Button onClick={() => setCurrentVisitStep(Math.max(0, currentVisitStep - 1))}>←</Button>
            <Button onClick={() => setCurrentVisitStep(Math.min(maxStep, currentVisitStep + 1))}>→</Button>
            <Button onClick={toggleAutoPlay} active={autoPlay}>
              {autoPlay ? '⏸ 暂停' : '▶ 自动播放'}
            </Button>
          </div>

          <div style={{ fontSize: 10, color: '#666' }}>
            步骤 {currentVisitStep + 1} / {maxStep + 1}
          </div>

          <Toggle active={showSearchSphere} onClick={() => setShowSearchSphere(!showSearchSphere)}>
            显示搜索半径球
          </Toggle>

          {currentAction && (
            <Status title="当前操作">
              <div>节点 #{currentAction.idx}</div>
              <div>动作: <b style={{
                color: currentAction.action === 'visit' ? '#818cf8'
                  : currentAction.action === 'update_best' ? '#4ade80'
                    : currentAction.action === 'prune' ? '#f43f5e'
                      : '#fbbf24'
              }}>
                {currentAction.action === 'visit' && '访问节点'}
                {currentAction.action === 'update_best' && `更新最近 d=${currentAction.dist.toFixed(3)}`}
                {currentAction.action === 'prune' && `剪枝 (${AXIS_NAMES[currentAction.axis]}轴距离 > bestDist)`}
                {currentAction.action === 'cross_check' && `跨越检查 (${AXIS_NAMES[currentAction.axis]}轴)`}
              </b></div>
            </Status>
          )}

          <Status title="搜索结果">
            <div>最近点: #{searchResult.bestIdx}</div>
            <div>距离: <b style={{ color: '#4ade80' }}>{searchResult.bestDist.toFixed(4)}</b></div>
            <div>访问节点数: {searchResult.visited.filter(v => v.action === 'visit').length}</div>
            <div>剪枝次数: <b style={{ color: '#f43f5e' }}>{searchResult.prunedNodes.length}</b></div>
          </Status>

          <div style={{
            padding: 8, borderRadius: 6, background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, color: '#666',
          }}>
            <div><span style={{ color: '#fbbf24' }}>●</span> 查询点</div>
            <div><span style={{ color: '#4ade80' }}>●</span> 当前最近点</div>
            <div><span style={{ color: '#818cf8' }}>●</span> 已访问</div>
            <div><span style={{ color: '#f43f5e' }}>●</span> 被剪枝</div>
          </div>
        </div>
      </div>
    </div>
  )
}
