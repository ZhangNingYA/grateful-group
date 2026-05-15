import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useState, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { panelStyle, sidePanel, Header, ObsTask, Slider, Toggle, Status, Button, InfoBox } from './ui.jsx'

/**
 * KD-Tree 构建过程可视化
 * 逐步展示如何选择划分轴、找中位数、递归划分
 */

const AXIS_COLORS = ['#f43f5e', '#4ade80', '#818cf8']
const AXIS_NAMES = ['X', 'Y', 'Z']

function generatePoints(count, seed = 123) {
  const pts = []
  let s = seed
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
  for (let i = 0; i < count; i++) {
    pts.push({
      id: i,
      pos: [(rand() - 0.5) * 5, (rand() - 0.5) * 5, (rand() - 0.5) * 5],
    })
  }
  return pts
}

// 构建 KD-Tree 并记录每一步
function buildKDTreeSteps(points, maxDepth = 4) {
  const steps = []
  function build(pts, depth, bounds) {
    if (pts.length <= 1 || depth >= maxDepth) {
      return { points: pts, bounds, isLeaf: true, depth }
    }
    const axis = depth % 3
    const sorted = [...pts].sort((a, b) => a.pos[axis] - b.pos[axis])
    const mid = Math.floor(sorted.length / 2)
    const median = sorted[mid].pos[axis]

    steps.push({
      axis,
      median,
      depth,
      bounds: { ...bounds },
      pointIds: pts.map(p => p.id),
      leftIds: sorted.slice(0, mid).map(p => p.id),
      rightIds: sorted.slice(mid).map(p => p.id),
    })

    const leftBounds = { min: [...bounds.min], max: [...bounds.max] }
    leftBounds.max[axis] = median
    const rightBounds = { min: [...bounds.min], max: [...bounds.max] }
    rightBounds.min[axis] = median

    const left = build(sorted.slice(0, mid), depth + 1, leftBounds)
    const right = build(sorted.slice(mid), depth + 1, rightBounds)

    return { axis, median, depth, bounds, isLeaf: false, left, right }
  }

  const bounds = { min: [-3, -3, -3], max: [3, 3, 3] }
  const tree = build(points, 0, bounds)
  return { tree, steps }
}

function SplitPlane({ axis, median, bounds, opacity = 0.2, highlight = false }) {
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
    <group>
      <mesh position={center} rotation={rotation}>
        <planeGeometry args={planeSize} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={highlight ? opacity * 2 : opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {highlight && (
        <Html position={center} center>
          <div style={{
            background: 'rgba(10,10,20,0.85)', padding: '3px 8px', borderRadius: 4,
            fontSize: 10, color: color, fontFamily: 'monospace',
            border: `1px solid ${color}44`,
          }}>
            {AXIS_NAMES[axis]}={median.toFixed(2)}
          </div>
        </Html>
      )}
    </group>
  )
}

function BoundsWireframe({ bounds, color = '#334155', opacity = 0.3 }) {
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
        <Line key={i} points={[corners[a], corners[b]]} color={color} lineWidth={1} transparent opacity={opacity} />
      ))}
    </>
  )
}

function Scene({ points, steps, currentStep }) {
  const visibleSteps = steps.slice(0, currentStep + 1)
  const currentStepData = steps[currentStep]

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />

      <BoundsWireframe bounds={{ min: [-3, -3, -3], max: [3, 3, 3] }} />

      {/* 已完成的划分平面 */}
      {visibleSteps.map((step, i) => (
        <SplitPlane
          key={i}
          axis={step.axis}
          median={step.median}
          bounds={step.bounds}
          opacity={i === currentStep ? 0.25 : 0.1}
          highlight={i === currentStep}
        />
      ))}

      {/* 点云 */}
      {points.map((pt) => {
        let color = '#4b5563'
        let size = 0.07
        if (currentStepData) {
          if (currentStepData.leftIds.includes(pt.id)) {
            color = '#4ade80'
            size = 0.09
          } else if (currentStepData.rightIds.includes(pt.id)) {
            color = '#fbbf24'
            size = 0.09
          } else if (!currentStepData.pointIds.includes(pt.id)) {
            color = '#1e293b'
            size = 0.05
          }
        }
        return (
          <mesh key={pt.id} position={pt.pos}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        )
      })}

      {/* 当前步骤的中位数点高亮 */}
      {currentStepData && (() => {
        const sorted = points
          .filter(p => currentStepData.pointIds.includes(p.id))
          .sort((a, b) => a.pos[currentStepData.axis] - b.pos[currentStepData.axis])
        const medianPt = sorted[Math.floor(sorted.length / 2)]
        if (!medianPt) return null
        return (
          <mesh position={medianPt.pos}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshBasicMaterial color="#f43f5e" transparent opacity={0.8} />
          </mesh>
        )
      })()}

      <gridHelper args={[8, 16, '#1a1a2e', '#0f0f1a']} position={[0, -3, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

export default function KDTreeBuildVisualizer() {
  const points = useMemo(() => generatePoints(24), [])
  const { tree, steps } = useMemo(() => buildKDTreeSteps(points, 4), [points])
  const [currentStep, setCurrentStep] = useState(0)

  const stepData = steps[currentStep]

  return (
    <div style={panelStyle}>
      <Header
        title="KD-Tree · 构建过程"
        subtitle="逐步观察：选轴 → 排序 → 找中位数 → 划分 → 递归"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(240px, 1fr)' }}>
        <div style={{ height: 500, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas camera={{ position: [6, 5, 7], fov: 45 }}>
            <Scene points={points} steps={steps} currentStep={currentStep} />
          </Canvas>
        </div>
        <div style={sidePanel}>
          <ObsTask>
            点击"下一步"观察每次划分如何选择轴和中位数。注意绿色点被分到左子树，黄色点被分到右子树。
          </ObsTask>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} active={currentStep > 0}>
              ← 上一步
            </Button>
            <Button onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} active={currentStep < steps.length - 1}>
              下一步 →
            </Button>
            <Button onClick={() => setCurrentStep(0)}>
              重置
            </Button>
          </div>

          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            步骤 <span style={{ color: '#c7d2fe', fontWeight: 600 }}>{currentStep + 1}</span> / {steps.length}
          </div>

          {stepData && (
            <Status title="当前划分">
              <div>深度: <b style={{ color: '#c7d2fe' }}>{stepData.depth}</b></div>
              <div>划分轴: <b style={{ color: AXIS_COLORS[stepData.axis] }}>{AXIS_NAMES[stepData.axis]}</b></div>
              <div>中位数: <b style={{ color: AXIS_COLORS[stepData.axis] }}>{stepData.median.toFixed(3)}</b></div>
              <div style={{ marginTop: 4 }}>
                <span style={{ color: '#4ade80' }}>左子树: {stepData.leftIds.length} 点</span>
              </div>
              <div>
                <span style={{ color: '#fbbf24' }}>右子树: {stepData.rightIds.length} 点</span>
              </div>
            </Status>
          )}

          <InfoBox type="info">
            轮转策略：depth % 3 决定划分轴<br/>
            depth=0 → X, depth=1 → Y, depth=2 → Z
          </InfoBox>

          <div style={{
            padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, color: '#666',
          }}>
            <div style={{ marginBottom: 4, color: '#888' }}>图例</div>
            <div><span style={{ color: '#f43f5e' }}>●</span> 中位数点</div>
            <div><span style={{ color: '#4ade80' }}>●</span> 左子树点</div>
            <div><span style={{ color: '#fbbf24' }}>●</span> 右子树点</div>
            <div><span style={{ color: '#1e293b' }}>●</span> 不参与当前划分</div>
          </div>
        </div>
      </div>
    </div>
  )
}
