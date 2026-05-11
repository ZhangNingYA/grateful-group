import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 网格细分演示
 * 展示从粗糙多面体到光滑曲面的细分过程
 * 用户可以调节细分级别
 */

function SubdividedSphere({ detail = 0 }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <group>
      {/* Solid mesh */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, detail]} />
        <meshPhysicalMaterial
          color="#6366f1"
          roughness={0.3}
          metalness={0.1}
          flatShading={detail < 3}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh rotation={meshRef.current?.rotation}>
        <icosahedronGeometry args={[1.201, detail]} />
        <meshBasicMaterial color="#a5b4fc" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

function FaceCounter({ detail }) {
  const faces = useMemo(() => {
    // Icosahedron face count: 20 * 4^detail
    return 20 * Math.pow(4, detail)
  }, [detail])

  const vertices = useMemo(() => {
    // Approximate vertex count
    return 10 * Math.pow(4, detail) + 2
  }, [detail])

  return { faces, vertices }
}

function Scene({ detail }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#a78bfa" />
      <SubdividedSphere detail={detail} />
      <OrbitControls enablePan={false} />
      <gridHelper args={[6, 12, '#333', '#222']} position={[0, -1.5, 0]} />
    </>
  )
}

export default function MeshSubdivisionDemo() {
  const [detail, setDetail] = useState(0)

  const faces = 20 * Math.pow(4, detail)
  const vertices = Math.round(10 * Math.pow(4, detail) + 2)

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', background: '#0a0a1a' }}>
      <div style={{ height: '380px' }}>
        <Canvas camera={{ position: [2.5, 1.5, 2.5], fov: 45 }}>
          <Scene detail={detail} />
        </Canvas>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {[0, 1, 2, 3, 4].map((d) => (
            <button
              key={d}
              onClick={() => setDetail(d)}
              style={{
                padding: '6px 16px',
                borderRadius: '100px',
                border: detail === d ? '1px solid #6366f1' : '1px solid #333',
                background: detail === d ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: detail === d ? '#a5b4fc' : '#888',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Level {d}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: '#888' }}>
          <span>面数: <span style={{ color: '#a5b4fc', fontFamily: 'monospace' }}>{faces.toLocaleString()}</span></span>
          <span>顶点: <span style={{ color: '#a5b4fc', fontFamily: 'monospace' }}>{vertices.toLocaleString()}</span></span>
        </div>
        <div style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
          从正二十面体开始，每次细分将每个三角形分成 4 个 → 逐渐逼近球面
        </div>
      </div>
    </div>
  )
}
