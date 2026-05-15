import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { panelStyle, sidePanel, Header, ObsTask, Slider, Status, InfoBox } from './ui.jsx'

/**
 * 维度灾难可视化
 * 展示高维空间中 KD-Tree 效率下降的原因
 */

// 在不同维度下模拟搜索效率
function simulateEfficiency(dims, nPoints, nQueries, seed = 42) {
  let s = seed
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }

  // 模拟：高维下需要访问的节点比例
  // 理论上，当 d 增大时，KD-Tree 退化为线性搜索
  const visitRatio = Math.min(1, Math.pow(nPoints, 1 - 1 / dims) / nPoints * dims * 0.3)
  const avgVisited = Math.ceil(nPoints * Math.min(1, visitRatio))

  return {
    dims,
    nPoints,
    avgVisited,
    efficiency: 1 - avgVisited / nPoints,
    logN: Math.ceil(Math.log2(nPoints)),
  }
}

// 生成 3D 点用于可视化（展示高维空间中点的"稀疏性"）
function generateHighDimProjection(nPoints, dims, seed = 42) {
  let s = seed
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }

  const pts = []
  for (let i = 0; i < nPoints; i++) {
    // 在高维空间中生成点，投影到 3D
    const coords = []
    for (let d = 0; d < dims; d++) coords.push(rand() - 0.5)

    // 投影到 3D（取前 3 维或 PCA 近似）
    const x = coords[0] * 4 || 0
    const y = coords[1] * 4 || 0
    const z = coords[2] * 4 || 0
    pts.push([x, y, z])
  }
  return pts
}

// 计算高维空间中"最近"和"最远"距离的比值
function distanceRatio(dims, nPoints, seed = 42) {
  let s = seed
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }

  // 在 d 维单位超立方体中
  // 最近邻距离期望 ≈ (1/n)^(1/d) * Γ(1+1/d) * (d * V_d)^(-1/d)
  // 简化：随着 d 增大，所有点之间的距离趋于相同
  const minDistExpected = Math.pow(1 / nPoints, 1 / dims) * Math.sqrt(dims) * 0.5
  const maxDistExpected = Math.sqrt(dims) * 0.5
  return { minDist: minDistExpected, maxDist: maxDistExpected, ratio: maxDistExpected / minDistExpected }
}

function Scene({ points, dims }) {
  // 可视化：高维空间中点的分布
  // 用颜色深浅表示"距离中心的距离"
  const center = [0, 0, 0]

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />

      {/* 单位球壳（高维中大部分点集中在球壳附近） */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.03} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* 内球（高维中内部几乎为空） */}
      <mesh>
        <sphereGeometry args={[2 * Math.pow(0.9, dims / 3), 32, 32]} />
        <meshBasicMaterial color="#f43f5e" transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* 点 */}
      {points.map((pt, i) => {
        const d = Math.sqrt(pt[0] ** 2 + pt[1] ** 2 + pt[2] ** 2)
        const normalized = d / 3.5
        // 高维中点集中在外壳
        const color = new THREE.Color().setHSL(0.6 - normalized * 0.4, 0.8, 0.5 + normalized * 0.2)
        return (
          <mesh key={i} position={pt}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        )
      })}

      {/* 中心点 */}
      <mesh position={center}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>

      <gridHelper args={[8, 16, '#1a1a2e', '#0f0f1a']} position={[0, -3, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

// 效率曲线 SVG
function EfficiencyChart({ nPoints }) {
  const W = 460, H = 140
  const dims = [2, 3, 4, 5, 8, 10, 15, 20, 30, 50]
  const data = dims.map(d => simulateEfficiency(d, nPoints, 100))

  const maxVisited = nPoints
  const xScale = (W - 60) / (dims.length - 1)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 130, display: 'block', background: '#0a0a14', borderRadius: 6 }}>
      {/* 网格 */}
      <line x1="45" y1={H - 25} x2={W - 10} y2={H - 25} stroke="rgba(255,255,255,0.08)" />
      <line x1="45" y1="10" x2="45" y2={H - 25} stroke="rgba(255,255,255,0.08)" />

      {/* 效率曲线 */}
      <polyline
        points={data.map((d, i) => {
          const x = 50 + i * xScale
          const y = 15 + (1 - d.efficiency) * (H - 45)
          return `${x},${y}`
        }).join(' ')}
        fill="none" stroke="#4ade80" strokeWidth="2"
      />

      {/* 访问比例曲线 */}
      <polyline
        points={data.map((d, i) => {
          const x = 50 + i * xScale
          const y = 15 + (d.avgVisited / nPoints) * (H - 45)
          return `${x},${y}`
        }).join(' ')}
        fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,3"
      />

      {/* X 轴标签 */}
      {data.map((d, i) => (
        <text key={i} x={50 + i * xScale} y={H - 8} fill="#666" fontSize="8" textAnchor="middle" fontFamily="monospace">
          {d.dims}d
        </text>
      ))}

      {/* 数据点 */}
      {data.map((d, i) => (
        <circle key={i} cx={50 + i * xScale} cy={15 + (1 - d.efficiency) * (H - 45)} r="3" fill="#4ade80" />
      ))}

      <text x="5" y="15" fill="#4ade80" fontSize="9" fontFamily="monospace">效率</text>
      <text x="5" y="30" fill="#f43f5e" fontSize="9" fontFamily="monospace">访问%</text>
      <text x={W / 2} y={H - 0} fill="#666" fontSize="9" fontFamily="monospace" textAnchor="middle">维度 →</text>
    </svg>
  )
}

export default function KDTreeDimensionCurse() {
  const [dims, setDims] = useState(3)
  const [nPoints, setNPoints] = useState(100)

  const points = useMemo(() => generateHighDimProjection(50, dims), [dims])
  const efficiency = useMemo(() => simulateEfficiency(dims, nPoints, 100), [dims, nPoints])
  const ratio = useMemo(() => distanceRatio(dims, nPoints), [dims, nPoints])

  return (
    <div style={panelStyle}>
      <Header
        title="KD-Tree · 维度灾难"
        subtitle="高维空间中 KD-Tree 为何退化"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)' }}>
        <div>
          <div style={{ height: 380, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
            <Canvas camera={{ position: [5, 4, 6], fov: 45 }}>
              <Scene points={points} dims={dims} />
            </Canvas>
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>KD-Tree 效率 vs 维度 (n={nPoints})</div>
            <EfficiencyChart nPoints={nPoints} />
          </div>
        </div>
        <div style={sidePanel}>
          <ObsTask>
            增加维度，观察效率如何急剧下降。在高维中，几乎所有点到查询点的距离都差不多，剪枝失效。
          </ObsTask>

          <Slider label="维度 d" value={dims} min={2} max={30} step={1} onChange={setDims} color="#6366f1" precision={0} />
          <Slider label="点数 n" value={nPoints} min={50} max={1000} step={50} onChange={setNPoints} color="#c7d2fe" precision={0} />

          <Status title="效率分析">
            <div>维度: <b style={{ color: '#c7d2fe' }}>{dims}</b></div>
            <div>理想访问 (log n): <b style={{ color: '#4ade80' }}>{efficiency.logN}</b></div>
            <div>实际平均访问: <b style={{ color: '#f43f5e' }}>{efficiency.avgVisited}</b></div>
            <div>效率: <b style={{ color: efficiency.efficiency > 0.5 ? '#4ade80' : '#f43f5e' }}>
              {(efficiency.efficiency * 100).toFixed(1)}%
            </b></div>
            <div style={{ marginTop: 4 }}>
              max/min 距离比: <b style={{ color: '#fbbf24' }}>{ratio.ratio.toFixed(2)}</b>
            </div>
          </Status>

          <InfoBox type="warn">
            经验法则：当 d {'>'} log₂(n) 时，KD-Tree 不再比暴力搜索快。<br/>
            d={dims}, log₂({nPoints})={Math.ceil(Math.log2(nPoints))}<br/>
            <b style={{ color: dims > Math.log2(nPoints) ? '#f43f5e' : '#4ade80' }}>
              {dims > Math.log2(nPoints) ? '⚠ KD-Tree 已退化' : '✓ KD-Tree 仍有效'}
            </b>
          </InfoBox>

          <InfoBox type="info">
            高维空间的反直觉现象：<br/>
            • 体积集中在角落<br/>
            • 点集中在球壳表面<br/>
            • 所有距离趋于相等<br/>
            → 划分平面无法有效剪枝
          </InfoBox>
        </div>
      </div>
    </div>
  )
}
