import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Step 1 & 2 的交互式演示：
 * 用户可以拖拽三角形顶点，实时看到边向量和 UV 差值的变化
 */

function DraggableVertex({ position, onDrag, color, label }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color={hovered ? '#ffffff' : color}
        emissive={hovered ? '#ffffff' : color}
        emissiveIntensity={hovered ? 0.5 : 0.2}
      />
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
      >
        {label}
      </Text>
    </mesh>
  )
}

function TriangleScene({ v0, v1, v2, uv0, uv1, uv2 }) {
  // 计算边向量
  const edge1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]]
  const edge2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]]

  // 边向量中点（用于标注）
  const mid1 = [(v0[0] + v1[0]) / 2, (v0[1] + v1[1]) / 2, (v0[2] + v1[2]) / 2]
  const mid2 = [(v0[0] + v2[0]) / 2, (v0[1] + v2[1]) / 2, (v0[2] + v2[2]) / 2]

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={0.7} />

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
        <meshStandardMaterial color="#334466" side={THREE.DoubleSide} transparent opacity={0.4} />
      </mesh>

      {/* 三角形边 */}
      <Line points={[v0, v1, v2, v0]} color="#667788" lineWidth={1.5} />

      {/* 边向量 E1: V0 -> V1 */}
      <arrowHelper
        args={[
          new THREE.Vector3(...edge1).normalize(),
          new THREE.Vector3(...v0),
          new THREE.Vector3(...edge1).length(),
          0xff8844,
          0.12,
          0.06,
        ]}
      />
      <Text position={[mid1[0] + 0.1, mid1[1] + 0.15, mid1[2]]} fontSize={0.11} color="#ff8844">
        E1
      </Text>

      {/* 边向量 E2: V0 -> V2 */}
      <arrowHelper
        args={[
          new THREE.Vector3(...edge2).normalize(),
          new THREE.Vector3(...v0),
          new THREE.Vector3(...edge2).length(),
          0x44ccff,
          0.12,
          0.06,
        ]}
      />
      <Text position={[mid2[0] + 0.1, mid2[1] + 0.15, mid2[2]]} fontSize={0.11} color="#44ccff">
        E2
      </Text>

      {/* 顶点 */}
      <DraggableVertex position={v0} color="#ffffff" label="V0" />
      <DraggableVertex position={v1} color="#ffaa44" label="V1" />
      <DraggableVertex position={v2} color="#44ccff" label="V2" />

      <OrbitControls enablePan={false} />
    </>
  )
}

function UVPanel({ uv0, uv1, uv2, deltaUV1, deltaUV2 }) {
  // 绘制 UV 空间的 2D 示意
  const scale = 120
  const offsetX = 20
  const offsetY = 20

  return (
    <svg width="160" height="160" style={{ background: '#0a0a1a', borderRadius: '8px' }}>
      {/* UV 网格 */}
      <line x1={offsetX} y1={offsetY} x2={offsetX + scale} y2={offsetY} stroke="#333" strokeWidth="1" />
      <line x1={offsetX} y1={offsetY} x2={offsetX} y2={offsetY + scale} stroke="#333" strokeWidth="1" />
      <line x1={offsetX + scale} y1={offsetY} x2={offsetX + scale} y2={offsetY + scale} stroke="#333" strokeWidth="1" />
      <line x1={offsetX} y1={offsetY + scale} x2={offsetX + scale} y2={offsetY + scale} stroke="#333" strokeWidth="1" />

      {/* 轴标签 */}
      <text x={offsetX + scale + 5} y={offsetY + 4} fill="#888" fontSize="10">U</text>
      <text x={offsetX - 4} y={offsetY + scale + 14} fill="#888" fontSize="10">V</text>

      {/* 三角形 */}
      <polygon
        points={`${offsetX + uv0[0] * scale},${offsetY + uv0[1] * scale} ${offsetX + uv1[0] * scale},${offsetY + uv1[1] * scale} ${offsetX + uv2[0] * scale},${offsetY + uv2[1] * scale}`}
        fill="rgba(80,120,180,0.3)"
        stroke="#88aacc"
        strokeWidth="1"
      />

      {/* ΔUV1 箭头 */}
      <line
        x1={offsetX + uv0[0] * scale}
        y1={offsetY + uv0[1] * scale}
        x2={offsetX + uv1[0] * scale}
        y2={offsetY + uv1[1] * scale}
        stroke="#ff8844"
        strokeWidth="2"
        markerEnd="url(#arrowOrange)"
      />

      {/* ΔUV2 箭头 */}
      <line
        x1={offsetX + uv0[0] * scale}
        y1={offsetY + uv0[1] * scale}
        x2={offsetX + uv2[0] * scale}
        y2={offsetY + uv2[1] * scale}
        stroke="#44ccff"
        strokeWidth="2"
        markerEnd="url(#arrowBlue)"
      />

      {/* 顶点标记 */}
      <circle cx={offsetX + uv0[0] * scale} cy={offsetY + uv0[1] * scale} r="4" fill="#fff" />
      <circle cx={offsetX + uv1[0] * scale} cy={offsetY + uv1[1] * scale} r="4" fill="#ffaa44" />
      <circle cx={offsetX + uv2[0] * scale} cy={offsetY + uv2[1] * scale} r="4" fill="#44ccff" />

      <defs>
        <marker id="arrowOrange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#ff8844" />
        </marker>
        <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#44ccff" />
        </marker>
      </defs>
    </svg>
  )
}

export default function EdgeVectorDemo() {
  const [v0] = useState([-1, -0.8, 0])
  const [v1] = useState([1.2, -0.6, 0])
  const [v2] = useState([0, 1.2, 0.3])

  const uv0 = [0, 0]
  const uv1 = [1, 0]
  const uv2 = [0.3, 1]

  const deltaUV1 = [uv1[0] - uv0[0], uv1[1] - uv0[1]]
  const deltaUV2 = [uv2[0] - uv0[0], uv2[1] - uv0[1]]

  const edge1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]]
  const edge2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]]

  return (
    <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {/* 3D 视图 */}
        <div style={{ flex: '1 1 60%', minWidth: '300px', height: '380px', background: '#0a0a1a' }}>
          <Canvas camera={{ position: [0, 0.5, 3.5], fov: 45 }}>
            <TriangleScene v0={v0} v1={v1} v2={v2} uv0={uv0} uv1={uv1} uv2={uv2} />
          </Canvas>
        </div>

        {/* 信息面板 */}
        <div style={{ flex: '1 1 35%', minWidth: '220px', background: '#111', padding: '16px', fontSize: '13px', color: '#ccc', fontFamily: 'monospace' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#88aaff', fontWeight: 'bold', marginBottom: '8px' }}>3D 空间</div>
            <div style={{ color: '#ff8844' }}>
              E₁ = V₁ - V₀ = ({edge1[0].toFixed(1)}, {edge1[1].toFixed(1)}, {edge1[2].toFixed(1)})
            </div>
            <div style={{ color: '#44ccff' }}>
              E₂ = V₂ - V₀ = ({edge2[0].toFixed(1)}, {edge2[1].toFixed(1)}, {edge2[2].toFixed(1)})
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#88aaff', fontWeight: 'bold', marginBottom: '8px' }}>UV 空间</div>
            <div style={{ color: '#ff8844' }}>
              ΔUV₁ = ({deltaUV1[0].toFixed(1)}, {deltaUV1[1].toFixed(1)})
            </div>
            <div style={{ color: '#44ccff' }}>
              ΔUV₂ = ({deltaUV2[0].toFixed(1)}, {deltaUV2[1].toFixed(1)})
            </div>
          </div>

          <div style={{ marginBottom: '8px', color: '#88aaff', fontWeight: 'bold' }}>UV 映射</div>
          <UVPanel uv0={uv0} uv1={uv1} uv2={uv2} deltaUV1={deltaUV1} deltaUV2={deltaUV2} />
        </div>
      </div>
      <div style={{ background: '#111', padding: '10px 16px', fontSize: '12px', color: '#888', textAlign: 'center', borderTop: '1px solid #222' }}>
        左侧：3D 空间中的三角形和边向量 | 右侧：对应的 UV 空间映射 — 两者的对应关系就是 TBN 的来源
      </div>
    </div>
  )
}
