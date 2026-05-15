import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { panelStyle, Header, Slider, Status, Button, InfoBox } from './ui.jsx'

/**
 * KD-Tree 复杂度可视化
 * 展示不同点数下暴力搜索 vs KD-Tree 搜索的比较
 * 用 3D 柱状图展示
 */

function generateData(maxN) {
  const data = []
  for (let n = 10; n <= maxN; n += 10) {
    const bruteForce = n // O(n)
    const kdTree = Math.log2(n) * 2 // O(log n) 近似
    const buildCost = n * Math.log2(n) / 10 // O(n log n) 构建
    data.push({ n, bruteForce, kdTree, buildCost })
  }
  return data
}

function Bar3D({ position, height, color, width = 0.3, depth = 0.3, opacity = 0.85 }) {
  return (
    <mesh position={[position[0], height / 2 + position[1], position[2]]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

function Scene({ data, maxN, showBuild }) {
  const maxVal = Math.max(...data.map(d => d.bruteForce))
  const scale = 5 / maxVal
  const xScale = 8 / data.length

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 8, 5]} intensity={0.6} />
      <pointLight position={[-3, 5, -3]} intensity={0.3} />

      {/* 坐标轴 */}
      <Line points={[[0, 0, 0], [9, 0, 0]]} color="#4b5563" lineWidth={1.5} />
      <Line points={[[0, 0, 0], [0, 6, 0]]} color="#4b5563" lineWidth={1.5} />
      <Html position={[9.5, 0, 0]} center>
        <div style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>n →</div>
      </Html>
      <Html position={[0, 6.5, 0]} center>
        <div style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>ops →</div>
      </Html>

      {/* 柱状图 */}
      {data.map((d, i) => {
        const x = (i + 0.5) * xScale
        return (
          <group key={i}>
            {/* 暴力搜索 */}
            <Bar3D
              position={[x - 0.2, 0, 0.4]}
              height={d.bruteForce * scale}
              color="#f43f5e"
              width={0.25}
              depth={0.25}
            />
            {/* KD-Tree 搜索 */}
            <Bar3D
              position={[x + 0.2, 0, 0.4]}
              height={d.kdTree * scale}
              color="#4ade80"
              width={0.25}
              depth={0.25}
            />
            {/* 构建成本 */}
            {showBuild && (
              <Bar3D
                position={[x, 0, -0.4]}
                height={d.buildCost * scale}
                color="#818cf8"
                width={0.25}
                depth={0.25}
                opacity={0.6}
              />
            )}
            {/* X 轴标签 */}
            {i % 3 === 0 && (
              <Html position={[x, -0.3, 0.4]} center>
                <div style={{ fontSize: 8, color: '#666', fontFamily: 'monospace' }}>{d.n}</div>
              </Html>
            )}
          </group>
        )
      })}

      {/* Y 轴刻度 */}
      {[1, 2, 3, 4, 5].map(v => (
        <group key={v}>
          <Line points={[[-0.1, v, 0], [0.1, v, 0]]} color="#4b5563" lineWidth={1} />
          <Html position={[-0.5, v, 0]} center>
            <div style={{ fontSize: 8, color: '#666', fontFamily: 'monospace' }}>{Math.round(v / scale)}</div>
          </Html>
        </group>
      ))}

      <gridHelper args={[10, 20, '#1a1a2e', '#0f0f1a']} position={[4.5, 0, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} target={[4, 2.5, 0]} />
    </>
  )
}

export default function KDTreeComplexityVisualizer() {
  const [maxN, setMaxN] = useState(200)
  const [showBuild, setShowBuild] = useState(true)
  const data = useMemo(() => generateData(maxN), [maxN])

  return (
    <div style={panelStyle}>
      <Header
        title="KD-Tree · 复杂度对比"
        subtitle="暴力搜索 O(n) vs KD-Tree 搜索 O(log n) vs 构建 O(n log n)"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) minmax(220px, 1fr)' }}>
        <div style={{ height: 400, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas camera={{ position: [5, 5, 8], fov: 45 }}>
            <Scene data={data} maxN={maxN} showBuild={showBuild} />
          </Canvas>
        </div>
        <div style={{
          padding: 14, fontSize: 12, color: '#aaa', display: 'flex', flexDirection: 'column', gap: 12,
          background: 'rgba(15,15,26,0.6)',
        }}>
          <Slider label="最大 N" value={maxN} min={50} max={500} step={10} onChange={setMaxN} color="#c7d2fe" />

          <Button onClick={() => setShowBuild(!showBuild)} active={showBuild} color="#818cf8">
            显示构建成本
          </Button>

          <Status title="复杂度">
            <div style={{ color: '#f43f5e' }}>暴力搜索: O(n)</div>
            <div style={{ color: '#4ade80' }}>KD-Tree 查询: O(log n)</div>
            <div style={{ color: '#818cf8' }}>KD-Tree 构建: O(n log n)</div>
          </Status>

          <InfoBox type="tip">
            当 n 很大时，KD-Tree 的 O(log n) 查询优势非常明显。但需要 O(n log n) 的一次性构建成本。
          </InfoBox>

          <div style={{
            padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, color: '#666', lineHeight: 1.8,
          }}>
            <div>n={maxN} 时:</div>
            <div style={{ color: '#f43f5e' }}>暴力: {maxN} 次比较</div>
            <div style={{ color: '#4ade80' }}>KD-Tree: ~{Math.ceil(Math.log2(maxN))} 次比较</div>
            <div style={{ color: '#818cf8' }}>加速比: <b style={{ color: '#fbbf24' }}>{(maxN / Math.log2(maxN)).toFixed(1)}x</b></div>
          </div>
        </div>
      </div>
    </div>
  )
}
