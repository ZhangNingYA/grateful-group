import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 显式几何演示：展示参数方程定义的曲面
 * 用户可以调节参数，实时看到曲面变化
 * 包含：参数曲面（球面参数化）、贝塞尔曲面、旋转体
 */

function ParametricSphere({ uSegments = 32, vSegments = 32 }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = []
    const colors = []
    const color = new THREE.Color()

    for (let i = 0; i <= uSegments; i++) {
      const u = (i / uSegments) * Math.PI * 2
      for (let j = 0; j <= vSegments; j++) {
        const v = (j / vSegments) * Math.PI
        const x = Math.sin(v) * Math.cos(u)
        const y = Math.cos(v)
        const z = Math.sin(v) * Math.sin(u)
        positions.push(x, y, z)

        // Color based on UV
        color.setHSL(i / uSegments, 0.7, 0.5)
        colors.push(color.r, color.g, color.b)
      }
    }

    const indices = []
    for (let i = 0; i < uSegments; i++) {
      for (let j = 0; j < vSegments; j++) {
        const a = i * (vSegments + 1) + j
        const b = a + 1
        const c = (i + 1) * (vSegments + 1) + j
        const d = c + 1
        indices.push(a, b, c)
        indices.push(b, d, c)
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [uSegments, vSegments])

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhongMaterial vertexColors side={THREE.DoubleSide} wireframe={false} transparent opacity={0.85} />
    </mesh>
  )
}

function ParametricWireframe({ uSegments = 16, vSegments = 16, type = 'sphere' }) {
  const groupRef = useRef()
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  const lines = useMemo(() => {
    const result = []

    const getPoint = (u, v) => {
      if (type === 'sphere') {
        return [
          Math.sin(v * Math.PI) * Math.cos(u * Math.PI * 2),
          Math.cos(v * Math.PI),
          Math.sin(v * Math.PI) * Math.sin(u * Math.PI * 2),
        ]
      } else if (type === 'cylinder') {
        return [Math.cos(u * Math.PI * 2), v * 2 - 1, Math.sin(u * Math.PI * 2)]
      } else {
        // Cone
        const r = 1 - v
        return [r * Math.cos(u * Math.PI * 2), v * 2 - 1, r * Math.sin(u * Math.PI * 2)]
      }
    }

    // U lines
    for (let i = 0; i <= uSegments; i++) {
      const pts = []
      const u = i / uSegments
      for (let j = 0; j <= vSegments * 2; j++) {
        const v = j / (vSegments * 2)
        pts.push(...getPoint(u, v))
      }
      result.push(new Float32Array(pts))
    }

    // V lines
    for (let j = 0; j <= vSegments; j++) {
      const pts = []
      const v = j / vSegments
      for (let i = 0; i <= uSegments * 2; i++) {
        const u = i / (uSegments * 2)
        pts.push(...getPoint(u, v))
      }
      result.push(new Float32Array(pts))
    }

    return result
  }, [type, uSegments, vSegments])

  return (
    <group ref={groupRef}>
      {lines.map((pts, idx) => (
        <line key={idx}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={pts.length / 3}
              array={pts}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={idx < (type === 'sphere' ? 17 : 17) ? '#6366f1' : '#10b981'}
            opacity={0.6}
            transparent
          />
        </line>
      ))}
    </group>
  )
}

function Scene({ type, showWireframe }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#a78bfa" />

      {showWireframe ? (
        <ParametricWireframe type={type} />
      ) : (
        <>
          {type === 'sphere' && <ParametricSphere />}
          {type === 'cylinder' && (
            <mesh rotation={[0, 0, 0]}>
              <cylinderGeometry args={[1, 1, 2, 32]} />
              <meshPhysicalMaterial color="#10b981" roughness={0.2} metalness={0.1} transparent opacity={0.8} />
            </mesh>
          )}
          {type === 'cone' && (
            <mesh>
              <coneGeometry args={[1, 2, 32]} />
              <meshPhysicalMaterial color="#f59e0b" roughness={0.2} metalness={0.1} transparent opacity={0.8} />
            </mesh>
          )}
        </>
      )}

      <OrbitControls enablePan={false} />
      <gridHelper args={[6, 12, '#333', '#222']} position={[0, -1.5, 0]} />
    </>
  )
}

export default function ExplicitSurfaceDemo() {
  const [type, setType] = useState('sphere')
  const [showWireframe, setShowWireframe] = useState(true)

  const formulas = {
    sphere: 'P(u,v) = (sin(v)cos(u), cos(v), sin(v)sin(u))',
    cylinder: 'P(u,v) = (cos(u), v, sin(u))',
    cone: 'P(u,v) = ((1-v)cos(u), v, (1-v)sin(u))',
  }

  const descriptions = {
    sphere: '球面参数化：u ∈ [0,2π], v ∈ [0,π]，每对 (u,v) 唯一确定球面上一点',
    cylinder: '圆柱参数化：u 控制圆周角度，v 控制高度',
    cone: '圆锥参数化：u 控制圆周角度，v 控制从底到顶的位置',
  }

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(16,185,129,0.2)', background: '#0a0a1a' }}>
      <div style={{ height: '420px' }}>
        <Canvas camera={{ position: [2.5, 2, 3], fov: 45 }}>
          <Scene type={type} showWireframe={showWireframe} />
        </Canvas>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['sphere', 'cylinder', 'cone'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                padding: '6px 16px',
                borderRadius: '100px',
                border: type === t ? '1px solid #10b981' : '1px solid #333',
                background: type === t ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: type === t ? '#6ee7b7' : '#888',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t === 'sphere' ? '球面' : t === 'cylinder' ? '圆柱' : '圆锥'}
            </button>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', fontSize: '12px', color: '#888', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showWireframe}
              onChange={(e) => setShowWireframe(e.target.checked)}
              style={{ accentColor: '#10b981' }}
            />
            参数线
          </label>
        </div>
        <div style={{ fontSize: '12px', color: '#10b981', fontFamily: 'monospace', marginBottom: '6px' }}>
          {formulas[type]}
        </div>
        <div style={{ fontSize: '13px', color: '#888' }}>
          {descriptions[type]}
        </div>
      </div>
    </div>
  )
}
