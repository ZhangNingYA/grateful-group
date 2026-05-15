import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useState, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { panelStyle, Header, ObsTask, Button, Status, InfoBox, Toggle } from './ui.jsx'

/**
 * 2D KD-Tree 交互式 Playground
 * 用户可以点击添加点，实时看到 KD-Tree 的构建
 * 使用 3D 视角展示 2D 平面上的 KD-Tree
 */

const AXIS_COLORS = ['#f43f5e', '#4ade80']
const AXIS_NAMES = ['X', 'Y']

function buildKD2D(points, depth = 0, bounds = null, maxDepth = 6) {
  if (!bounds) bounds = { min: [-4, -4], max: [4, 4] }
  if (points.length <= 1 || depth >= maxDepth) {
    return { points, bounds, isLeaf: true, depth }
  }
  const axis = depth % 2
  const sorted = [...points].sort((a, b) => a[axis] - b[axis])
  const mid = Math.floor(sorted.length / 2)
  const median = sorted[mid][axis]

  const leftBounds = { min: [...bounds.min], max: [...bounds.max] }
  leftBounds.max[axis] = median
  const rightBounds = { min: [...bounds.min], max: [...bounds.max] }
  rightBounds.min[axis] = median

  return {
    axis, median, depth, bounds, isLeaf: false,
    splitPoint: sorted[mid],
    left: buildKD2D(sorted.slice(0, mid), depth + 1, leftBounds, maxDepth),
    right: buildKD2D(sorted.slice(mid), depth + 1, rightBounds, maxDepth),
  }
}

// 收集所有划分线
function collectSplits(node, splits = []) {
  if (!node || node.isLeaf) return splits
  splits.push({
    axis: node.axis,
    median: node.median,
    bounds: node.bounds,
    depth: node.depth,
  })
  collectSplits(node.left, splits)
  collectSplits(node.right, splits)
  return splits
}

// 范围搜索
function rangeSearch(node, points, queryMin, queryMax, results = []) {
  if (!node) return results
  if (node.isLeaf) {
    for (const p of node.points) {
      if (p[0] >= queryMin[0] && p[0] <= queryMax[0] && p[1] >= queryMin[1] && p[1] <= queryMax[1]) {
        results.push(p)
      }
    }
    return results
  }
  const axis = node.axis
  if (queryMin[axis] <= node.median) rangeSearch(node.left, points, queryMin, queryMax, results)
  if (queryMax[axis] >= node.median) rangeSearch(node.right, points, queryMin, queryMax, results)
  return results
}

function SplitLine2D({ axis, median, bounds, depth }) {
  const color = AXIS_COLORS[axis]
  const opacity = Math.max(0.2, 0.7 - depth * 0.12)
  let points
  if (axis === 0) {
    // X 轴划分 → 竖线
    points = [[median, 0, bounds.min[1]], [median, 0, bounds.max[1]]]
  } else {
    // Y 轴划分 → 横线
    points = [[bounds.min[0], 0, median], [bounds.max[0], 0, median]]
  }
  return <Line points={points} color={color} lineWidth={1.5} transparent opacity={opacity} />
}

function RangeBox({ queryMin, queryMax }) {
  const corners = [
    [queryMin[0], 0.01, queryMin[1]],
    [queryMax[0], 0.01, queryMin[1]],
    [queryMax[0], 0.01, queryMax[1]],
    [queryMin[0], 0.01, queryMax[1]],
    [queryMin[0], 0.01, queryMin[1]],
  ]
  return (
    <group>
      <Line points={corners} color="#fbbf24" lineWidth={2.5} />
      <mesh position={[(queryMin[0] + queryMax[0]) / 2, -0.01, (queryMin[1] + queryMax[1]) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[queryMax[0] - queryMin[0], queryMax[1] - queryMin[1]]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Scene({ points, tree, showRange, rangeMin, rangeMax, rangeResults }) {
  const splits = useMemo(() => collectSplits(tree), [tree])
  const rangeResultSet = useMemo(() => new Set(rangeResults.map(p => `${p[0]},${p[1]}`)), [rangeResults])

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 8, 0]} intensity={0.4} />

      {/* 地面网格 */}
      <gridHelper args={[8, 16, '#1e293b', '#0f172a']} position={[0, -0.02, 0]} />

      {/* 边界框 */}
      <Line
        points={[[-4, 0, -4], [4, 0, -4], [4, 0, 4], [-4, 0, 4], [-4, 0, -4]]}
        color="#334155"
        lineWidth={1.5}
      />

      {/* 划分线 */}
      {splits.map((s, i) => (
        <SplitLine2D key={i} axis={s.axis} median={s.median} bounds={s.bounds} depth={s.depth} />
      ))}

      {/* 范围查询框 */}
      {showRange && <RangeBox queryMin={rangeMin} queryMax={rangeMax} />}

      {/* 点 */}
      {points.map((pt, i) => {
        const inRange = showRange && rangeResultSet.has(`${pt[0]},${pt[1]}`)
        return (
          <group key={i}>
            <mesh position={[pt[0], 0.05, pt[1]]}>
              <sphereGeometry args={[inRange ? 0.12 : 0.08, 12, 12]} />
              <meshBasicMaterial color={inRange ? '#4ade80' : '#6366f1'} />
            </mesh>
            {/* 点的投影线 */}
            <Line
              points={[[pt[0], 0, pt[1]], [pt[0], 0.05, pt[1]]]}
              color={inRange ? '#4ade80' : '#6366f1'}
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          </group>
        )
      })}

      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  )
}

const DEFAULT_POINTS = [
  [-2.5, -1.8], [1.2, 2.3], [-0.8, 0.5], [2.8, -2.1], [-1.5, 3.0],
  [0.3, -1.2], [3.2, 1.5], [-3.0, -0.5], [1.8, -0.8], [-0.2, 2.8],
  [2.0, 0.2], [-2.0, 1.5], [0.8, 1.0], [-1.0, -2.5], [3.5, -1.0],
]

export default function KDTree2DPlayground() {
  const [points, setPoints] = useState(DEFAULT_POINTS)
  const [showRange, setShowRange] = useState(false)
  const [rangeMin, setRangeMin] = useState([-1.5, -1.5])
  const [rangeMax, setRangeMax] = useState([2.0, 2.0])

  const tree = useMemo(() => buildKD2D(points), [points])
  const rangeResults = useMemo(
    () => showRange ? rangeSearch(tree, points, rangeMin, rangeMax) : [],
    [tree, points, showRange, rangeMin, rangeMax]
  )

  const addRandomPoint = useCallback(() => {
    const x = (Math.random() - 0.5) * 7
    const y = (Math.random() - 0.5) * 7
    setPoints(prev => [...prev, [x, y]])
  }, [])

  const splits = useMemo(() => collectSplits(tree), [tree])

  return (
    <div style={panelStyle}>
      <Header
        title="KD-Tree · 2D 交互 Playground"
        subtitle="添加点观察树结构变化，开启范围查询观察剪枝"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(240px, 1fr)' }}>
        <div style={{ height: 480, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas camera={{ position: [0, 7, 5], fov: 50 }}>
            <Scene
              points={points}
              tree={tree}
              showRange={showRange}
              rangeMin={rangeMin}
              rangeMax={rangeMax}
              rangeResults={rangeResults}
            />
          </Canvas>
        </div>
        <div style={{
          padding: 14, fontSize: 12, color: '#aaa', display: 'flex', flexDirection: 'column', gap: 12,
          background: 'rgba(15,15,26,0.6)', borderLeft: '1px solid rgba(255,255,255,0.04)',
          overflowY: 'auto',
        }}>
          <ObsTask>
            添加点观察划分线如何变化。开启范围查询，调整查询框大小，观察哪些点被高效找到。
          </ObsTask>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Button onClick={addRandomPoint} active>+ 添加随机点</Button>
            <Button onClick={() => setPoints(DEFAULT_POINTS)}>重置</Button>
            <Button onClick={() => setPoints([])}>清空</Button>
          </div>

          <Toggle active={showRange} onClick={() => setShowRange(!showRange)} color="#fbbf24">
            范围查询 (Range Query)
          </Toggle>

          {showRange && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 10, color: '#666' }}>查询范围</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#666' }}>min X</div>
                  <input type="range" min={-4} max={rangeMax[0] - 0.5} step={0.1} value={rangeMin[0]}
                    onChange={(e) => setRangeMin([parseFloat(e.target.value), rangeMin[1]])}
                    style={{ width: '100%', accentColor: '#fbbf24' }} />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#666' }}>max X</div>
                  <input type="range" min={rangeMin[0] + 0.5} max={4} step={0.1} value={rangeMax[0]}
                    onChange={(e) => setRangeMax([parseFloat(e.target.value), rangeMax[1]])}
                    style={{ width: '100%', accentColor: '#fbbf24' }} />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#666' }}>min Y</div>
                  <input type="range" min={-4} max={rangeMax[1] - 0.5} step={0.1} value={rangeMin[1]}
                    onChange={(e) => setRangeMin([rangeMin[0], parseFloat(e.target.value)])}
                    style={{ width: '100%', accentColor: '#fbbf24' }} />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#666' }}>max Y</div>
                  <input type="range" min={rangeMin[1] + 0.5} max={4} step={0.1} value={rangeMax[1]}
                    onChange={(e) => setRangeMax([rangeMax[0], parseFloat(e.target.value)])}
                    style={{ width: '100%', accentColor: '#fbbf24' }} />
                </div>
              </div>
            </div>
          )}

          <Status title="树信息">
            <div>点数: <b style={{ color: '#c7d2fe' }}>{points.length}</b></div>
            <div>划分数: <b style={{ color: '#c7d2fe' }}>{splits.length}</b></div>
            {showRange && (
              <>
                <div style={{ marginTop: 4 }}>范围内点数: <b style={{ color: '#4ade80' }}>{rangeResults.length}</b></div>
                <div>查询范围: [{rangeMin[0].toFixed(1)},{rangeMin[1].toFixed(1)}] → [{rangeMax[0].toFixed(1)},{rangeMax[1].toFixed(1)}]</div>
              </>
            )}
          </Status>

          <InfoBox type="info">
            2D KD-Tree 交替按 X（红线）和 Y（绿线）划分。每次选择中位数作为划分点，保证树的平衡。
          </InfoBox>

          <div style={{
            padding: 8, borderRadius: 6, background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, color: '#666',
          }}>
            <div><span style={{ color: '#f43f5e' }}>—</span> X 轴划分线</div>
            <div><span style={{ color: '#4ade80' }}>—</span> Y 轴划分线</div>
            <div><span style={{ color: '#6366f1' }}>●</span> 数据点</div>
            {showRange && <div><span style={{ color: '#fbbf24' }}>□</span> 查询范围</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
