import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 完整的交互式 TBN 计算器
 * 用户拖动滑块改变三角形形状，实时看到：
 * 1. 3D 中三角形和 TBN 向量
 * 2. 计算步骤
 * 3. 最终 TBN 矩阵
 */

function TriangleWithTBN({ v0, v1, v2, T, B, N }) {
  const center = [
    (v0[0] + v1[0] + v2[0]) / 3,
    (v0[1] + v1[1] + v2[1]) / 3,
    (v0[2] + v1[2] + v2[2]) / 3,
  ]

  return (
    <group>
      {/* 三角形面 */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={3}
            array={new Float32Array([...v0, ...v1, ...v2])}
            itemSize={3}
          />
        </bufferGeometry>
        <meshBasicMaterial color="#334466" side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>

      {/* 边框 */}
      <Line points={[v0, v1, v2, v0]} color="#88aacc" lineWidth={2} />

      {/* 顶点标记 */}
      <mesh position={v0}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="#fff" /></mesh>
      <mesh position={v1}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="#ffaa44" /></mesh>
      <mesh position={v2}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="#44ccff" /></mesh>

      <Text position={[v0[0] - 0.15, v0[1] - 0.15, v0[2]]} fontSize={0.1} color="#fff">V0</Text>
      <Text position={[v1[0] + 0.1, v1[1] - 0.15, v1[2]]} fontSize={0.1} color="#ffaa44">V1</Text>
      <Text position={[v2[0] - 0.15, v2[1] + 0.1, v2[2]]} fontSize={0.1} color="#44ccff">V2</Text>

      {/* TBN 向量 */}
      <arrowHelper args={[new THREE.Vector3(...T), new THREE.Vector3(...center), 1.2, 0xff4444, 0.12, 0.06]} />
      <arrowHelper args={[new THREE.Vector3(...B), new THREE.Vector3(...center), 1.2, 0x44ff44, 0.12, 0.06]} />
      <arrowHelper args={[new THREE.Vector3(...N), new THREE.Vector3(...center), 1.2, 0x4488ff, 0.12, 0.06]} />

      <Text position={[center[0] + T[0] * 1.35, center[1] + T[1] * 1.35, center[2] + T[2] * 1.35]} fontSize={0.12} color="#ff4444">T</Text>
      <Text position={[center[0] + B[0] * 1.35, center[1] + B[1] * 1.35, center[2] + B[2] * 1.35]} fontSize={0.12} color="#44ff44">B</Text>
      <Text position={[center[0] + N[0] * 1.35, center[1] + N[1] * 1.35, center[2] + N[2] * 1.35]} fontSize={0.12} color="#4488ff">N</Text>
    </group>
  )
}

function Scene({ v0, v1, v2, T, B, N }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={0.6} />
      <TriangleWithTBN v0={v0} v1={v1} v2={v2} T={T} B={B} N={N} />
      <gridHelper args={[4, 8, '#333', '#222']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.01]} />
      <OrbitControls enablePan={false} />
    </>
  )
}

export default function TBNCalculatorScene() {
  const [v2z, setV2z] = useState(0)
  const [v1x, setV1x] = useState(1.5)
  const [v2x, setV2x] = useState(0)
  const [v2y, setV2y] = useState(1.5)

  const v0 = [-1, -0.8, 0]
  const v1 = [v1x, -0.8, 0]
  const v2 = [v2x, v2y, v2z]

  const uv0 = [0, 0]
  const uv1 = [1, 0]
  const uv2 = [0, 1]

  const result = useMemo(() => {
    const edge1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]]
    const edge2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]]

    const duv1 = [uv1[0] - uv0[0], uv1[1] - uv0[1]]
    const duv2 = [uv2[0] - uv0[0], uv2[1] - uv0[1]]

    const det = duv1[0] * duv2[1] - duv2[0] * duv1[1]
    const f = det !== 0 ? 1.0 / det : 0

    let T = [
      f * (duv2[1] * edge1[0] - duv1[1] * edge2[0]),
      f * (duv2[1] * edge1[1] - duv1[1] * edge2[1]),
      f * (duv2[1] * edge1[2] - duv1[1] * edge2[2]),
    ]
    const tLen = Math.sqrt(T[0] ** 2 + T[1] ** 2 + T[2] ** 2)
    if (tLen > 0) T = T.map((v) => v / tLen)

    let B = [
      f * (-duv2[0] * edge1[0] + duv1[0] * edge2[0]),
      f * (-duv2[0] * edge1[1] + duv1[0] * edge2[1]),
      f * (-duv2[0] * edge1[2] + duv1[0] * edge2[2]),
    ]
    const bLen = Math.sqrt(B[0] ** 2 + B[1] ** 2 + B[2] ** 2)
    if (bLen > 0) B = B.map((v) => v / bLen)

    // N = cross(edge1, edge2)
    let N = [
      edge1[1] * edge2[2] - edge1[2] * edge2[1],
      edge1[2] * edge2[0] - edge1[0] * edge2[2],
      edge1[0] * edge2[1] - edge1[1] * edge2[0],
    ]
    const nLen = Math.sqrt(N[0] ** 2 + N[1] ** 2 + N[2] ** 2)
    if (nLen > 0) N = N.map((v) => v / nLen)

    return { T, B, N, edge1, edge2, det, f }
  }, [v0, v1, v2])

  const fmt = (n) => (n >= 0 ? ' ' : '') + n.toFixed(2)

  return (
    <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {/* 3D 场景 */}
        <div style={{ flex: '1 1 55%', minWidth: '280px', height: '420px', background: '#0a0a1a' }}>
          <Canvas camera={{ position: [0, 0.5, 4], fov: 45 }}>
            <Scene v0={v0} v1={v1} v2={v2} T={result.T} B={result.B} N={result.N} />
          </Canvas>
        </div>

        {/* 控制 + 结果面板 */}
        <div style={{ flex: '1 1 40%', minWidth: '240px', background: '#111', padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#ccc', overflowY: 'auto', maxHeight: '420px' }}>
          {/* 滑块控制 */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#ffcc44', fontWeight: 'bold', marginBottom: '8px' }}>拖动改变三角形</div>
            <div style={{ marginBottom: '6px' }}>
              <span>V₁.x: {v1x.toFixed(1)}</span>
              <input type="range" min="0.5" max="2.5" step="0.1" value={v1x}
                onChange={(e) => setV1x(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#ffaa44' }} />
            </div>
            <div style={{ marginBottom: '6px' }}>
              <span>V₂.x: {v2x.toFixed(1)}</span>
              <input type="range" min="-1.5" max="1.5" step="0.1" value={v2x}
                onChange={(e) => setV2x(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#44ccff' }} />
            </div>
            <div style={{ marginBottom: '6px' }}>
              <span>V₂.y: {v2y.toFixed(1)}</span>
              <input type="range" min="0" max="2.5" step="0.1" value={v2y}
                onChange={(e) => setV2y(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#44ccff' }} />
            </div>
            <div style={{ marginBottom: '6px' }}>
              <span style={{ color: '#88ff88' }}>V₂.z: {v2z.toFixed(1)}</span>
              <input type="range" min="-2" max="2" step="0.1" value={v2z}
                onChange={(e) => setV2z(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#88ff88' }} />
            </div>
          </div>

          {/* TBN 矩阵结果 */}
          <div style={{ background: '#0a0a1a', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <div style={{ color: '#ffcc44', marginBottom: '8px', fontWeight: 'bold' }}>TBN 矩阵</div>
            <div style={{ textAlign: 'center', lineHeight: '1.8' }}>
              <div>
                │ <span style={{ color: '#ff4444' }}>{fmt(result.T[0])}</span>
                {' '}<span style={{ color: '#44ff44' }}>{fmt(result.B[0])}</span>
                {' '}<span style={{ color: '#4488ff' }}>{fmt(result.N[0])}</span> │
              </div>
              <div>
                │ <span style={{ color: '#ff4444' }}>{fmt(result.T[1])}</span>
                {' '}<span style={{ color: '#44ff44' }}>{fmt(result.B[1])}</span>
                {' '}<span style={{ color: '#4488ff' }}>{fmt(result.N[1])}</span> │
              </div>
              <div>
                │ <span style={{ color: '#ff4444' }}>{fmt(result.T[2])}</span>
                {' '}<span style={{ color: '#44ff44' }}>{fmt(result.B[2])}</span>
                {' '}<span style={{ color: '#4488ff' }}>{fmt(result.N[2])}</span> │
              </div>
              <div style={{ color: '#666', fontSize: '10px', marginTop: '4px' }}>
                [ T | B | N ]
              </div>
            </div>
          </div>

          {/* 提示 */}
          <div style={{ background: '#0a0a1a', borderRadius: '8px', padding: '10px', fontSize: '11px', color: '#888' }}>
            🎯 拖动 V₂.z 滑块让三角形离开平面，观察 <span style={{ color: '#4488ff' }}>N（法线）</span> 如何倾斜！
          </div>
        </div>
      </div>
    </div>
  )
}
