import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * SDF Blend 演示
 * 展示两个球从分离到融合的过程
 * 对比 min(d1,d2) 硬边界 vs smooth union 平滑融合
 */

function SDFSphere({ position, radius, color, opacity = 0.4 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.2}
        transmission={0.7}
        thickness={0.5}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function BlendedShape({ separation, smoothness, showBlend }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  // Generate an approximate smooth union isosurface using marching-cubes-like sampling
  const geometry = useMemo(() => {
    const resolution = 40
    const size = 3.0
    const step = size / resolution

    // SDF functions
    const sdSphere = (px, py, pz, cx, cy, cz, r) => {
      const dx = px - cx, dy = py - cy, dz = pz - cz
      return Math.sqrt(dx * dx + dy * dy + dz * dz) - r
    }

    const smoothMin = (a, b, k) => {
      if (k <= 0.001) return Math.min(a, b)
      const h = Math.max(0, Math.min(1, 0.5 + 0.5 * (b - a) / k))
      return b * (1 - h) + a * h - k * h * (1 - h)
    }

    const sdf = (px, py, pz) => {
      const d1 = sdSphere(px, py, pz, -separation / 2, 0, 0, 0.7)
      const d2 = sdSphere(px, py, pz, separation / 2, 0, 0, 0.7)
      return showBlend ? smoothMin(d1, d2, smoothness) : Math.min(d1, d2)
    }

    // Simple marching cubes - generate triangles at isosurface
    const vertices = []
    const half = size / 2

    for (let ix = 0; ix < resolution; ix++) {
      for (let iy = 0; iy < resolution; iy++) {
        for (let iz = 0; iz < resolution; iz++) {
          const x = -half + ix * step
          const y = -half + iy * step
          const z = -half + iz * step

          // Check if this cell crosses the isosurface
          const d = sdf(x + step / 2, y + step / 2, z + step / 2)
          if (Math.abs(d) < step * 0.8) {
            // Add a small quad facing the gradient direction
            const eps = 0.01
            const nx = sdf(x + step / 2 + eps, y + step / 2, z + step / 2) - sdf(x + step / 2 - eps, y + step / 2, z + step / 2)
            const ny = sdf(x + step / 2, y + step / 2 + eps, z + step / 2) - sdf(x + step / 2, y + step / 2 - eps, z + step / 2)
            const nz = sdf(x + step / 2, y + step / 2, z + step / 2 + eps) - sdf(x + step / 2, y + step / 2, z + step / 2 - eps)
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
            if (len > 0.001) {
              vertices.push(x + step / 2, y + step / 2, z + step / 2)
            }
          }
        }
      }
    }

    // Create point cloud geometry for the isosurface
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    return geo
  }, [separation, smoothness, showBlend])

  return (
    <group ref={meshRef}>
      <points geometry={geometry}>
        <pointsMaterial color="#a78bfa" size={0.04} sizeAttenuation transparent opacity={0.8} />
      </points>
    </group>
  )
}

function Scene({ separation, smoothness, showBlend }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#a78bfa" />

      <SDFSphere position={[-separation / 2, 0, 0]} radius={0.7} color="#6366f1" opacity={0.25} />
      <SDFSphere position={[separation / 2, 0, 0]} radius={0.7} color="#06b6d4" opacity={0.25} />
      <BlendedShape separation={separation} smoothness={smoothness} showBlend={showBlend} />

      <OrbitControls enablePan={false} />
      <gridHelper args={[4, 8, '#333', '#222']} position={[0, -1.2, 0]} />
    </>
  )
}

export default function SDFBlendDemo() {
  const [separation, setSeparation] = useState(1.0)
  const [smoothness, setSmoothness] = useState(0.5)
  const [showBlend, setShowBlend] = useState(true)

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(139,92,246,0.2)', background: '#0a0a1a' }}>
      <div style={{ height: '380px' }}>
        <Canvas camera={{ position: [2.5, 1.5, 2.5], fov: 45 }}>
          <Scene separation={separation} smoothness={smoothness} showBlend={showBlend} />
        </Canvas>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
          <button onClick={() => setShowBlend(false)} style={{ padding: '6px 14px', borderRadius: '100px', border: !showBlend ? '1px solid #8b5cf6' : '1px solid #333', background: !showBlend ? 'rgba(139,92,246,0.15)' : 'transparent', color: !showBlend ? '#c4b5fd' : '#888', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            min(d₁, d₂) 硬并集
          </button>
          <button onClick={() => setShowBlend(true)} style={{ padding: '6px 14px', borderRadius: '100px', border: showBlend ? '1px solid #8b5cf6' : '1px solid #333', background: showBlend ? 'rgba(139,92,246,0.15)' : 'transparent', color: showBlend ? '#c4b5fd' : '#888', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            smooth union 平滑融合
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#888', minWidth: '50px' }}>间距</span>
          <input type="range" min="0" max="2.5" step="0.05" value={separation} onChange={e => setSeparation(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#8b5cf6' }} />
          <span style={{ fontSize: '12px', color: '#c4b5fd', fontFamily: 'monospace', minWidth: '36px' }}>{separation.toFixed(2)}</span>
        </div>
        {showBlend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#888', minWidth: '50px' }}>平滑度 k</span>
            <input type="range" min="0.05" max="1.5" step="0.05" value={smoothness} onChange={e => setSmoothness(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#8b5cf6' }} />
            <span style={{ fontSize: '12px', color: '#c4b5fd', fontFamily: 'monospace', minWidth: '36px' }}>{smoothness.toFixed(2)}</span>
          </div>
        )}
        <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace', marginTop: '8px', lineHeight: 1.8 }}>
          <div>SDF₁ = |p − c₁| − r₁ &nbsp; SDF₂ = |p − c₂| − r₂</div>
          <div>{showBlend ? 'smooth_min(d₁, d₂, k) = mix − k·h·(1−h)' : 'union = min(d₁, d₂)'}</div>
        </div>
        <div style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>
          紫色点云 = f=0 等值面采样。减小间距观察两球融合过程。
        </div>
      </div>
    </div>
  )
}
