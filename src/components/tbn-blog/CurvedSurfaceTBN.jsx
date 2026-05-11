import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 曲面上的 TBN 坐标系
 * 展示每个点的 TBN 如何随曲面法线变化
 * 用户可以调节曲面的弯曲程度
 */

function WavySurface({ amplitude, frequency }) {
  const { geometry, tbnPoints } = useMemo(() => {
    const size = 4
    const segments = 16
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    const positions = geo.attributes.position
    const uvs = geo.attributes.uv

    // 波浪变形
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = Math.sin(x * frequency) * amplitude + Math.cos(y * frequency) * amplitude * 0.7
      positions.setZ(i, z)
    }

    geo.computeVertexNormals()

    // 采样 TBN 点
    const normals = geo.attributes.normal
    const points = []
    const step = Math.max(1, Math.floor(positions.count / 16))

    for (let i = 0; i < positions.count; i += step) {
      const pos = new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      )
      const normal = new THREE.Vector3(
        normals.getX(i),
        normals.getY(i),
        normals.getZ(i)
      ).normalize()

      // 计算切线（沿 x 方向的投影到切平面）
      const tangent = new THREE.Vector3(1, 0, 0)
      tangent.sub(normal.clone().multiplyScalar(tangent.dot(normal))).normalize()
      const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize()

      points.push({ pos, tangent, bitangent, normal })
    }

    return { geometry: geo, tbnPoints: points }
  }, [amplitude, frequency])

  return (
    <group>
      {/* 曲面 */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#446688"
          side={THREE.DoubleSide}
          transparent
          opacity={0.6}
          flatShading={false}
        />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#5588aa" wireframe transparent opacity={0.15} />
      </mesh>

      {/* TBN 箭头 */}
      {tbnPoints.map((data, idx) => (
        <group key={idx} position={data.pos}>
          <arrowHelper args={[data.tangent, new THREE.Vector3(0, 0, 0), 0.3, 0xff4444, 0.06, 0.03]} />
          <arrowHelper args={[data.bitangent, new THREE.Vector3(0, 0, 0), 0.3, 0x44ff44, 0.06, 0.03]} />
          <arrowHelper args={[data.normal, new THREE.Vector3(0, 0, 0), 0.35, 0x4488ff, 0.06, 0.03]} />
        </group>
      ))}
    </group>
  )
}

function Scene({ amplitude, frequency }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={0.7} />
      <WavySurface amplitude={amplitude} frequency={frequency} />
      <OrbitControls enablePan={true} />
    </>
  )
}

export default function CurvedSurfaceTBN() {
  const [amplitude, setAmplitude] = useState(0.5)
  const [frequency, setFrequency] = useState(1.5)

  return (
    <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
      <div style={{ height: '420px', background: '#0a0a1a' }}>
        <Canvas camera={{ position: [3, 3, 4], fov: 45 }}>
          <Scene amplitude={amplitude} frequency={frequency} />
        </Canvas>
      </div>
      <div style={{ background: '#111', padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
            <span>🌊 波浪幅度</span>
            <span>{amplitude.toFixed(2)}</span>
          </div>
          <input type="range" min="0" max="1.2" step="0.05" value={amplitude}
            onChange={(e) => setAmplitude(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#4488ff' }} />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
            <span>〰️ 波浪频率</span>
            <span>{frequency.toFixed(2)}</span>
          </div>
          <input type="range" min="0.5" max="3" step="0.1" value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#44ccff' }} />
        </div>
        <div style={{ flex: '1 1 100%', fontSize: '12px', color: '#666', textAlign: 'center' }}>
          把幅度调到 0 → 平面上所有 TBN 一致 | 增大幅度 → 每个点的 TBN 随曲面旋转
        </div>
      </div>
    </div>
  )
}
