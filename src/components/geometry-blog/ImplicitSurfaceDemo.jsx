import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 隐式几何演示：展示隐式方程定义的曲面
 * 球体: x² + y² + z² = r²
 * 环面: (√(x²+y²) - R)² + z² = r²
 * 用户可切换不同隐式曲面，观察等值面
 */

function ImplicitSphere({ radius = 1, color = '#6366f1' }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.1}
        metalness={0.1}
        transmission={0.6}
        thickness={1.5}
        transparent
        opacity={0.85}
      />
    </mesh>
  )
}

function ImplicitTorus({ R = 1, r = 0.4, color = '#10b981' }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[R, r, 48, 96]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.1}
        metalness={0.1}
        transmission={0.6}
        thickness={1}
        transparent
        opacity={0.85}
      />
    </mesh>
  )
}

function ImplicitHeart({ color = '#f43f5e' }) {
  const meshRef = useRef()
  const geometry = useMemo(() => {
    // Heart shape using parametric approach
    const shape = new THREE.Shape()
    const x = 0, y = 0
    shape.moveTo(x, y + 0.5)
    shape.bezierCurveTo(x, y + 0.5, x - 0.5, y, x - 0.5, y)
    shape.bezierCurveTo(x - 0.5, y - 0.5, x, y - 0.7, x, y - 1)
    shape.bezierCurveTo(x, y - 0.7, x + 0.5, y - 0.5, x + 0.5, y)
    shape.bezierCurveTo(x + 0.5, y, x, y + 0.5, x, y + 0.5)

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 8,
      bevelSize: 0.15,
      bevelThickness: 0.1,
    }
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03
      meshRef.current.scale.set(s, s, s)
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0.3, 0]} scale={1.2}>
      <meshPhysicalMaterial
        color={color}
        roughness={0.15}
        metalness={0.1}
        transmission={0.4}
        thickness={1}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

// 等值面网格线
function IsoLines({ type }) {
  const linesRef = useRef()
  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  const points = useMemo(() => {
    const pts = []
    const segments = 64
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2
      if (type === 'sphere') {
        pts.push(new THREE.Vector3(Math.cos(theta) * 1.3, 0, Math.sin(theta) * 1.3))
      }
    }
    return pts
  }, [type])

  if (type !== 'sphere') return null

  return (
    <group ref={linesRef}>
      {[0, 0.5, -0.5].map((y, idx) => (
        <line key={idx}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={65}
              array={new Float32Array(
                Array.from({ length: 65 }, (_, i) => {
                  const theta = (i / 64) * Math.PI * 2
                  const r = Math.sqrt(Math.max(0, 1.3 * 1.3 - y * y))
                  return [Math.cos(theta) * r, y, Math.sin(theta) * r]
                }).flat()
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ffffff" opacity={0.3} transparent />
        </line>
      ))}
    </group>
  )
}

function FormulaOverlay({ type }) {
  const formulas = {
    sphere: 'f(x,y,z) = x² + y² + z² - r² = 0',
    torus: 'f(x,y,z) = (√(x²+y²) - R)² + z² - r² = 0',
    heart: 'f(x,y,z) = (x²+y²+z²-1)³ - x²z³ - y²z³/10 = 0',
  }
  return formulas[type] || ''
}

function Scene({ type }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-3, 2, -3]} intensity={0.4} color="#a78bfa" />

      {type === 'sphere' && <ImplicitSphere />}
      {type === 'torus' && <ImplicitTorus />}
      {type === 'heart' && <ImplicitHeart />}

      <IsoLines type={type} />
      <OrbitControls enablePan={false} autoRotate={false} />
      <gridHelper args={[6, 12, '#333', '#222']} position={[0, -1.5, 0]} />
    </>
  )
}

export default function ImplicitSurfaceDemo() {
  const [type, setType] = useState('sphere')

  const descriptions = {
    sphere: '球面：所有到原点距离为 r 的点的集合',
    torus: '环面：所有到圆环中心线距离为 r 的点的集合',
    heart: '心形：由隐式方程定义的代数曲面',
  }

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', background: '#0a0a1a' }}>
      <div style={{ height: '420px' }}>
        <Canvas camera={{ position: [3, 2, 3], fov: 45 }}>
          <Scene type={type} />
        </Canvas>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {['sphere', 'torus', 'heart'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                padding: '6px 16px',
                borderRadius: '100px',
                border: type === t ? '1px solid #6366f1' : '1px solid #333',
                background: type === t ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: type === t ? '#a5b4fc' : '#888',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t === 'sphere' ? '球面' : t === 'torus' ? '环面' : '心形'}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '12px', color: '#6366f1', fontFamily: 'monospace', marginBottom: '6px' }}>
          <FormulaOverlay type={type} />
        </div>
        <div style={{ fontSize: '13px', color: '#888' }}>
          {descriptions[type]}
        </div>
      </div>
    </div>
  )
}
