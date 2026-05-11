import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Points, PointMaterial } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 表示方式切换器
 * 同一个球体在三种表示之间切换：隐式 / 点云 / 三角网格
 * 帮助理解：同一个几何形状可以有完全不同的表示方式
 */

function ImplicitView() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })
  return (
    <group ref={ref}>
      {/* 半透明球面表示隐式定义的表面 */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          color="#6366f1"
          roughness={0.1}
          transmission={0.8}
          thickness={0.5}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* 等值线暗示 */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.12} />
      </mesh>
      {/* 内部小球暗示 f < 0 区域 */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.08} />
      </mesh>
    </group>
  )
}

function PointCloudView({ count = 4000 }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  const { positions, colors } = useMemo(() => {
    const pts = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)
    const color = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pts[i * 3] = Math.sin(phi) * Math.cos(theta)
      pts[i * 3 + 1] = Math.sin(phi) * Math.sin(theta)
      pts[i * 3 + 2] = Math.cos(phi)
      const h = (pts[i * 3 + 2] + 1) / 2
      color.setHSL(0.6 + h * 0.2, 0.7, 0.6)
      cols[i * 3] = color.r
      cols[i * 3 + 1] = color.g
      cols[i * 3 + 2] = color.b
    }
    return { positions: pts, colors: cols }
  }, [count])

  return (
    <group ref={ref}>
      <Points positions={positions} colors={colors}>
        <PointMaterial vertexColors size={0.025} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
      </Points>
    </group>
  )
}

function MeshView() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#10b981" flatShading />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#34d399" wireframe transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

function Scene({ mode }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#a78bfa" />
      {mode === 'implicit' && <ImplicitView />}
      {mode === 'pointcloud' && <PointCloudView />}
      {mode === 'mesh' && <MeshView />}
      <OrbitControls enablePan={false} />
      <gridHelper args={[4, 8, '#333', '#222']} position={[0, -1.5, 0]} />
    </>
  )
}

export default function RepresentationSwitcher3D() {
  const [mode, setMode] = useState('implicit')

  const info = {
    implicit: {
      label: 'Implicit',
      desc: '不直接列出点，而是定义满足关系的点集合。表面是 f(x,y,z) = 0 的解集。',
      color: '#6366f1',
    },
    pointcloud: {
      label: 'Point Cloud',
      desc: '用大量离散点近似表面。点足够密时看起来像连续曲面。',
      color: '#3b82f6',
    },
    mesh: {
      label: 'Triangle Mesh',
      desc: '用顶点、边、三角面显式连接成表面。GPU 渲染管线最常用的表示。',
      color: '#10b981',
    },
  }

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', background: '#0a0a1a' }}>
      <div style={{ height: '380px' }}>
        <Canvas camera={{ position: [2.5, 1.5, 2.5], fov: 45 }}>
          <Scene mode={mode} />
        </Canvas>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {Object.entries(info).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              aria-label={`切换到 ${val.label} 表示`}
              style={{
                padding: '6px 16px',
                borderRadius: '100px',
                border: mode === key ? `2px solid ${val.color}` : '1px solid rgba(255,255,255,0.1)',
                background: mode === key ? `${val.color}22` : 'transparent',
                color: mode === key ? val.color : '#888',
                fontSize: '13px',
                fontWeight: mode === key ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {val.label}
            </button>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#ccc', lineHeight: 1.6 }}>
          {info[mode].desc}
        </p>
      </div>
    </div>
  )
}
