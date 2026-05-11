import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Gram-Schmidt 正交化的可视化
 * 展示当 T 和 N 不正交时，如何通过正交化修正
 */

function OrthoVisualization({ skewAngle, showCorrected }) {
  const { T_raw, N, T_corrected, B_corrected } = useMemo(() => {
    const N = new THREE.Vector3(0, 1, 0)

    // 原始 T（可能不垂直于 N）
    const angle = skewAngle * Math.PI / 180
    const T_raw = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).normalize()

    // Gram-Schmidt: T' = normalize(T - dot(T, N) * N)
    const T_corrected = T_raw.clone()
      .sub(N.clone().multiplyScalar(T_raw.dot(N)))
      .normalize()

    // B = cross(N, T')
    const B_corrected = new THREE.Vector3().crossVectors(N, T_corrected).normalize()

    return { T_raw, N, T_corrected, B_corrected }
  }, [skewAngle])

  return (
    <group>
      {/* 参考平面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial color="#1a1a2e" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* N 向量（始终朝上） */}
      <arrowHelper args={[N, new THREE.Vector3(0, 0, 0), 1.8, 0x4488ff, 0.1, 0.05]} />
      <Text position={[0, 2, 0]} fontSize={0.12} color="#4488ff">N</Text>

      {/* 原始 T（可能歪的） */}
      <arrowHelper args={[T_raw, new THREE.Vector3(0, 0, 0), 1.5, 0xff4444, 0.1, 0.05]} />
      <Text
        position={[T_raw.x * 1.7, T_raw.y * 1.7, T_raw.z * 1.7]}
        fontSize={0.12}
        color="#ff4444"
      >
        T (原始)
      </Text>

      {/* 修正后的 T */}
      {showCorrected && (
        <>
          <arrowHelper args={[T_corrected, new THREE.Vector3(0, 0, 0), 1.5, 0xff8844, 0.1, 0.05]} />
          <Text
            position={[T_corrected.x * 1.7, T_corrected.y * 1.7 - 0.15, T_corrected.z * 1.7]}
            fontSize={0.12}
            color="#ff8844"
          >
            T' (修正)
          </Text>

          {/* 修正后的 B */}
          <arrowHelper args={[B_corrected, new THREE.Vector3(0, 0, 0), 1.5, 0x44ff44, 0.1, 0.05]} />
          <Text
            position={[B_corrected.x * 1.7, B_corrected.y * 1.7, B_corrected.z * 1.7]}
            fontSize={0.12}
            color="#44ff44"
          >
            B'
          </Text>
        </>
      )}

      {/* 投影虚线（T 在 N 上的投影） */}
      {skewAngle > 5 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                T_raw.x * 1.5, T_raw.y * 1.5, T_raw.z * 1.5,
                0, T_raw.dot(N) * 1.5, 0,
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff444488" transparent opacity={0.5} />
        </line>
      )}
    </group>
  )
}

function Scene({ skewAngle, showCorrected }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={0.5} />
      <OrthoVisualization skewAngle={skewAngle} showCorrected={showCorrected} />
      <OrbitControls enablePan={false} />
    </>
  )
}

export default function GramSchmidtDemo() {
  const [skewAngle, setSkewAngle] = useState(25)
  const [showCorrected, setShowCorrected] = useState(true)

  return (
    <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
      <div style={{ height: '360px', background: '#0a0a1a' }}>
        <Canvas camera={{ position: [2, 2, 3], fov: 45 }}>
          <Scene skewAngle={skewAngle} showCorrected={showCorrected} />
        </Canvas>
      </div>
      <div style={{ background: '#111', padding: '14px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>T 与水平面的夹角</span>
              <span>{skewAngle}°</span>
            </div>
            <input type="range" min="0" max="80" step="1" value={skewAngle}
              onChange={(e) => setSkewAngle(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#ff4444' }} />
          </div>
          <label style={{ fontSize: '13px', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input type="checkbox" checked={showCorrected}
              onChange={(e) => setShowCorrected(e.target.checked)} />
            显示正交化结果
          </label>
        </div>
        <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
          增大角度 → T 偏离水平面 → 正交化将 T 投影回垂直于 N 的平面上
        </div>
      </div>
    </div>
  )
}
