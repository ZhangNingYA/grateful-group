import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * CSG (Constructive Solid Geometry) 演示
 * 展示如何通过布尔运算组合简单几何体构建复杂形状
 * 使用 Three.js 的基本几何体来模拟 CSG 概念
 */

function AnimatedGroup({ children, speed = 0.3 }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed
    }
  })
  return <group ref={ref}>{children}</group>
}

function UnionDemo() {
  return (
    <AnimatedGroup>
      <mesh position={[-0.4, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhysicalMaterial color="#6366f1" roughness={0.2} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0.4, 0, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshPhysicalMaterial color="#06b6d4" roughness={0.2} transparent opacity={0.7} />
      </mesh>
    </AnimatedGroup>
  )
}

function IntersectionDemo() {
  // Show only the overlapping region (approximated with a smaller shape)
  return (
    <AnimatedGroup>
      <mesh position={[-0.4, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhysicalMaterial color="#6366f1" roughness={0.2} transparent opacity={0.2} wireframe />
      </mesh>
      <mesh position={[0.4, 0, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshPhysicalMaterial color="#06b6d4" roughness={0.2} transparent opacity={0.2} wireframe />
      </mesh>
      {/* Intersection approximation */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial color="#f59e0b" roughness={0.1} metalness={0.3} />
      </mesh>
    </AnimatedGroup>
  )
}

function SubtractionDemo() {
  return (
    <AnimatedGroup>
      {/* Main box with "holes" */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshPhysicalMaterial color="#10b981" roughness={0.2} transparent opacity={0.8} />
      </mesh>
      {/* Show what's being subtracted as wireframe */}
      <mesh position={[0.5, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhysicalMaterial color="#f43f5e" wireframe transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 2, 16]} />
        <meshPhysicalMaterial color="#f43f5e" wireframe transparent opacity={0.5} />
      </mesh>
    </AnimatedGroup>
  )
}

function Scene({ mode }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#a78bfa" />

      {mode === 'union' && <UnionDemo />}
      {mode === 'intersection' && <IntersectionDemo />}
      {mode === 'subtraction' && <SubtractionDemo />}

      <OrbitControls enablePan={false} />
      <gridHelper args={[6, 12, '#333', '#222']} position={[0, -1.5, 0]} />
    </>
  )
}

export default function CSGDemo() {
  const [mode, setMode] = useState('union')

  const info = {
    union: { label: '并集 (Union)', desc: 'A ∪ B — 合并两个形状，保留所有部分', color: '#6366f1' },
    intersection: { label: '交集 (Intersection)', desc: 'A ∩ B — 只保留两个形状重叠的部分（金色区域）', color: '#f59e0b' },
    subtraction: { label: '差集 (Subtraction)', desc: 'A - B — 从绿色方块中减去红色线框形状', color: '#10b981' },
  }

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', background: '#0a0a1a' }}>
      <div style={{ height: '380px' }}>
        <Canvas camera={{ position: [3, 2, 3], fov: 45 }}>
          <Scene mode={mode} />
        </Canvas>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {Object.entries(info).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              style={{
                padding: '6px 14px',
                borderRadius: '100px',
                border: mode === key ? `1px solid ${val.color}` : '1px solid #333',
                background: mode === key ? `${val.color}22` : 'transparent',
                color: mode === key ? val.color : '#888',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {val.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '13px', color: '#888' }}>
          {info[mode].desc}
        </div>
      </div>
    </div>
  )
}
