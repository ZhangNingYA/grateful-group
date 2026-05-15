import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { panelStyle, sidePanel, Header, ObsTask, Slider, Status, Toggle, Button, InfoBox } from './ui.jsx'

/**
 * KD-Tree SAH (Surface Area Heuristic) 构建策略可视化
 * 对比中位数划分 vs SAH 划分
 */

const AXIS_COLORS = ['#f43f5e', '#4ade80', '#818cf8']

function generateClusteredPoints(seed = 42) {
  const pts = []
  let s = seed
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }

  // 密集聚类（左侧）
  for (let i = 0; i < 15; i++) {
    pts.push([
      -2 + (rand() - 0.5) * 1.5,
      (rand() - 0.5) * 3,
      (rand() - 0.5) * 3,
    ])
  }
  // 稀疏分布（右侧）
  for (let i = 0; i < 5; i++) {
    pts.push([
      1.5 + rand() * 3,
      (rand() - 0.5) * 4,
      (rand() - 0.5) * 4,
    ])
  }
  return pts
}

// 计算表面积
function surfaceArea(bounds) {
  const dx = bounds.max[0] - bounds.min[0]
  const dy = bounds.max[1] - bounds.min[1]
  const dz = bounds.max[2] - bounds.min[2]
  return 2 * (dx * dy + dy * dz + dz * dx)
}

// 计算 SAH 成本
function sahCost(leftCount, rightCount, leftBounds, rightBounds, parentBounds) {
  const parentSA = surfaceArea(parentBounds)
  if (parentSA === 0) return Infinity
  const leftSA = surfaceArea(leftBounds)
  const rightSA = surfaceArea(rightBounds)
  const traversalCost = 1
  const intersectCost = 1
  return traversalCost + intersectCost * (leftCount * leftSA / parentSA + rightCount * rightSA / parentSA)
}

// 找到最佳 SAH 划分
function findBestSAHSplit(points, bounds) {
  let bestCost = Infinity
  let bestAxis = 0
  let bestSplitIdx = 0
  let bestMedian = 0
  const allCosts = []

  for (let axis = 0; axis < 3; axis++) {
    const sorted = [...points].sort((a, b) => a[axis] - b[axis])
    const axisCosts = []

    for (let i = 1; i < sorted.length; i++) {
      const splitPos = (sorted[i - 1][axis] + sorted[i][axis]) / 2
      const leftPts = sorted.slice(0, i)
      const rightPts = sorted.slice(i)

      const leftBounds = computeBounds(leftPts)
      const rightBounds = computeBounds(rightPts)

      const cost = sahCost(leftPts.length, rightPts.length, leftBounds, rightBounds, bounds)
      axisCosts.push({ splitPos, cost, leftCount: i, rightCount: sorted.length - i })

      if (cost < bestCost) {
        bestCost = cost
        bestAxis = axis
        bestSplitIdx = i
        bestMedian = splitPos
      }
    }
    allCosts.push(axisCosts)
  }

  return { bestAxis, bestSplitIdx, bestMedian, bestCost, allCosts }
}

function computeBounds(points) {
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (const p of points) {
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], p[i])
      max[i] = Math.max(max[i], p[i])
    }
  }
  return { min, max }
}

function SplitPlane({ axis, median, bounds, opacity = 0.2, color = null }) {
  const c = color || AXIS_COLORS[axis]
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
      <meshBasicMaterial color={c} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

function BoundsWireframe({ bounds, color, opacity = 0.4 }) {
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
        <Line key={i} points={[corners[a], corners[b]]} color={color} lineWidth={1.2} transparent opacity={opacity} />
      ))}
    </>
  )
}

function Scene({ points, bounds, medianSplit, sahSplit, showMode }) {
  const medianAxis = 0 // 第一层按 X
  const sorted = [...points].sort((a, b) => a[medianAxis] - b[medianAxis])
  const medianVal = sorted[Math.floor(sorted.length / 2)][medianAxis]

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />

      <BoundsWireframe bounds={bounds} color="#334155" opacity={0.3} />

      {/* 中位数划分 */}
      {(showMode === 'median' || showMode === 'both') && (
        <SplitPlane axis={medianAxis} median={medianVal} bounds={bounds} opacity={0.15} color="#f43f5e" />
      )}

      {/* SAH 划分 */}
      {(showMode === 'sah' || showMode === 'both') && (
        <SplitPlane axis={sahSplit.bestAxis} median={sahSplit.bestMedian} bounds={bounds} opacity={0.2} color="#4ade80" />
      )}

      {/* 点 */}
      {points.map((pt, i) => {
        let color = '#6366f1'
        if (showMode === 'sah' || showMode === 'both') {
          if (pt[sahSplit.bestAxis] < sahSplit.bestMedian) color = '#4ade80'
          else color = '#fbbf24'
        } else if (showMode === 'median') {
          if (pt[medianAxis] < medianVal) color = '#f43f5e'
          else color = '#fb923c'
        }
        return (
          <mesh key={i} position={pt}>
            <sphereGeometry args={[0.1, 10, 10]} />
            <meshBasicMaterial color={color} />
          </mesh>
        )
      })}

      <gridHelper args={[10, 20, '#1a1a2e', '#0f0f1a']} position={[0, -3, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

// SAH 成本曲线 SVG
function SAHCostChart({ allCosts, bestAxis }) {
  const W = 500, H = 120
  const axisCosts = allCosts[bestAxis]
  if (!axisCosts || axisCosts.length === 0) return null

  const maxCost = Math.max(...axisCosts.map(c => c.cost))
  const minCost = Math.min(...axisCosts.map(c => c.cost))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 100, display: 'block', background: '#0a0a14', borderRadius: 6 }}>
      {/* 网格 */}
      {[0.25, 0.5, 0.75].map(f => (
        <line key={f} x1="40" y1={H * (1 - f) * 0.8 + 10} x2={W - 10} y2={H * (1 - f) * 0.8 + 10}
          stroke="rgba(255,255,255,0.05)" />
      ))}
      {/* 曲线 */}
      <polyline
        points={axisCosts.map((c, i) => {
          const x = 40 + (i / (axisCosts.length - 1)) * (W - 60)
          const y = 10 + (1 - (c.cost - minCost) / (maxCost - minCost + 0.001)) * (H - 30)
          return `${x},${y}`
        }).join(' ')}
        fill="none"
        stroke={AXIS_COLORS[bestAxis]}
        strokeWidth="2"
      />
      {/* 最小点 */}
      {(() => {
        const minIdx = axisCosts.findIndex(c => c.cost === minCost)
        const x = 40 + (minIdx / (axisCosts.length - 1)) * (W - 60)
        const y = 10 + (1 - (minCost - minCost) / (maxCost - minCost + 0.001)) * (H - 30)
        return <circle cx={x} cy={y} r="4" fill="#4ade80" />
      })()}
      <text x="5" y="15" fill="#666" fontSize="9" fontFamily="monospace">cost</text>
      <text x={W / 2} y={H - 2} fill="#666" fontSize="9" fontFamily="monospace" textAnchor="middle">split position</text>
    </svg>
  )
}

export default function KDTreeSAHBuilder() {
  const points = useMemo(() => generateClusteredPoints(), [])
  const bounds = useMemo(() => {
    const b = computeBounds(points)
    // 扩展一点
    for (let i = 0; i < 3; i++) { b.min[i] -= 0.5; b.max[i] += 0.5 }
    return b
  }, [points])
  const sahResult = useMemo(() => findBestSAHSplit(points, bounds), [points, bounds])
  const [showMode, setShowMode] = useState('both')

  const medianAxis = 0
  const sorted = [...points].sort((a, b) => a[medianAxis] - b[medianAxis])
  const medianVal = sorted[Math.floor(sorted.length / 2)][medianAxis]

  return (
    <div style={panelStyle}>
      <Header
        title="KD-Tree · SAH 划分策略"
        subtitle="对比中位数划分 vs SAH（Surface Area Heuristic）最优划分"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)' }}>
        <div>
          <div style={{ height: 400, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
            <Canvas camera={{ position: [6, 4, 7], fov: 45 }}>
              <Scene points={points} bounds={bounds} medianSplit={medianVal} sahSplit={sahResult} showMode={showMode} />
            </Canvas>
          </div>
          {/* SAH 成本曲线 */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>SAH Cost (axis={AXIS_COLORS[sahResult.bestAxis] === '#f43f5e' ? 'X' : sahResult.bestAxis === 1 ? 'Y' : 'Z'})</div>
            <SAHCostChart allCosts={sahResult.allCosts} bestAxis={sahResult.bestAxis} />
          </div>
        </div>
        <div style={sidePanel}>
          <ObsTask>
            观察非均匀分布的点云中，SAH 如何找到比中位数更优的划分位置。注意 SAH 倾向于让密集区域有更紧凑的包围盒。
          </ObsTask>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Button onClick={() => setShowMode('median')} active={showMode === 'median'} color="#f43f5e">中位数</Button>
            <Button onClick={() => setShowMode('sah')} active={showMode === 'sah'} color="#4ade80">SAH</Button>
            <Button onClick={() => setShowMode('both')} active={showMode === 'both'}>对比</Button>
          </div>

          <Status title="划分对比">
            <div style={{ color: '#f43f5e' }}>
              中位数: axis=X, pos={medianVal.toFixed(3)}
            </div>
            <div style={{ color: '#f43f5e' }}>
              左/右: {Math.floor(points.length / 2)} / {points.length - Math.floor(points.length / 2)}
            </div>
            <div style={{ marginTop: 6, color: '#4ade80' }}>
              SAH: axis={AXIS_COLORS[sahResult.bestAxis] === '#f43f5e' ? 'X' : sahResult.bestAxis === 1 ? 'Y' : 'Z'}, pos={sahResult.bestMedian.toFixed(3)}
            </div>
            <div style={{ color: '#4ade80' }}>
              cost={sahResult.bestCost.toFixed(3)}
            </div>
          </Status>

          <InfoBox type="info">
            SAH 公式:<br/>
            Cost = C_trav + C_isect × (N_L × SA_L + N_R × SA_R) / SA_parent<br/><br/>
            目标：最小化期望的光线求交成本
          </InfoBox>

          <InfoBox type="tip">
            对于非均匀分布，SAH 通常比简单中位数划分产生更高效的树结构。
          </InfoBox>
        </div>
      </div>
    </div>
  )
}
