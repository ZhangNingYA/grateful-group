import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Points, PointMaterial } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 点云演示：展示显式几何中的点表示
 * 通过点云采样展示不同曲面
 * 可调节点密度，观察从稀疏到稠密的变化
 */

function PointCloudSurface({ type = 'sphere', count = 5000 }) {
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  const positions = useMemo(() => {
    const pts = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const color = new THREE.Color()

    for (let i = 0; i < count; i++) {
      let x, y, z

      if (type === 'sphere') {
        // Uniform sphere sampling
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const r = 1.2
        x = r * Math.sin(phi) * Math.cos(theta)
        y = r * Math.sin(phi) * Math.sin(theta)
        z = r * Math.cos(phi)
      } else if (type === 'bunny') {
        // Approximate bunny shape with multiple spheres
        const part = Math.random()
        if (part < 0.5) {
          // Body
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          x = 0.8 * Math.sin(phi) * Math.cos(theta)
          y = 0.8 * Math.sin(phi) * Math.sin(theta) - 0.3
          z = 1.0 * Math.cos(phi)
        } else if (part < 0.75) {
          // Head
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          x = 0.5 * Math.sin(phi) * Math.cos(theta)
          y = 0.5 * Math.sin(phi) * Math.sin(theta) + 0.8
          z = 0.5 * Math.cos(phi)
        } else {
          // Ears
          const ear = Math.random() > 0.5 ? 1 : -1
          const t = Math.random()
          x = ear * 0.2 + (Math.random() - 0.5) * 0.1
          y = 1.3 + t * 0.7
          z = (Math.random() - 0.5) * 0.1
        }
      } else {
        // Torus point cloud
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI * 2
        const R = 1.0, r = 0.4
        x = (R + r * Math.cos(phi)) * Math.cos(theta)
        y = r * Math.sin(phi)
        z = (R + r * Math.cos(phi)) * Math.sin(theta)
      }

      pts[i * 3] = x
      pts[i * 3 + 1] = y
      pts[i * 3 + 2] = z

      // Color based on height
      const h = (y + 1.5) / 3
      color.setHSL(0.6 + h * 0.3, 0.7, 0.6)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return { positions: pts, colors }
  }, [type, count])

  return (
    <group ref={ref}>
      <Points positions={positions.positions} colors={positions.colors}>
        <PointMaterial
          vertexColors
          size={0.025}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

function Scene({ type, count }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <PointCloudSurface type={type} count={count} />
      <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  )
}

export default function PointCloudDemo() {
  const [type, setType] = useState('sphere')
  const [count, setCount] = useState(5000)

  const types = {
    sphere: '球面采样',
    torus: '环面采样',
    bunny: '兔子（多球近似）',
  }

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(6,182,212,0.2)', background: '#0a0a1a' }}>
      <div style={{ height: '380px' }}>
        <Canvas camera={{ position: [2.5, 1.5, 2.5], fov: 45 }}>
          <Scene type={type} count={count} />
        </Canvas>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {Object.entries(types).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setType(key)}
              style={{
                padding: '6px 14px',
                borderRadius: '100px',
                border: type === key ? '1px solid #06b6d4' : '1px solid #333',
                background: type === key ? 'rgba(6,182,212,0.15)' : 'transparent',
                color: type === key ? '#67e8f9' : '#888',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>点数</span>
          <input
            type="range"
            min="500"
            max="20000"
            step="500"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: '#06b6d4' }}
          />
          <span style={{ fontSize: '12px', color: '#67e8f9', fontFamily: 'monospace', minWidth: '50px' }}>{count}</span>
        </div>
        <div style={{ fontSize: '13px', color: '#888' }}>
          点云是最简单的显式表示 — 增加点数观察曲面如何逐渐"显现"
        </div>
      </div>
    </div>
  )
}
