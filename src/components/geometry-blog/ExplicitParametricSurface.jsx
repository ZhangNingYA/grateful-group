import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 显式参数曲面演示
 * 展示 Torus 和 Saddle 的参数映射 r(u,v) → (x,y,z)
 * 可调节分段数、R、r 参数
 */

function ParametricTorus({ R = 1.0, r = 0.4, uSegs = 32, vSegs = 16 }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  const { geometry, uLines, vLines } = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = []
    const colors = []
    const color = new THREE.Color()

    for (let i = 0; i <= uSegs; i++) {
      const u = (i / uSegs) * Math.PI * 2
      for (let j = 0; j <= vSegs; j++) {
        const v = (j / vSegs) * Math.PI * 2
        const x = (R + r * Math.cos(u)) * Math.cos(v)
        const y = r * Math.sin(u)
        const z = (R + r * Math.cos(u)) * Math.sin(v)
        positions.push(x, y, z)
        color.setHSL(i / uSegs * 0.8, 0.6, 0.55)
        colors.push(color.r, color.g, color.b)
      }
    }

    const indices = []
    for (let i = 0; i < uSegs; i++) {
      for (let j = 0; j < vSegs; j++) {
        const a = i * (vSegs + 1) + j
        const b = a + 1
        const c = (i + 1) * (vSegs + 1) + j
        const d = c + 1
        indices.push(a, b, c)
        indices.push(b, d, c)
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()

    // U parameter lines
    const uL = []
    for (let i = 0; i <= Math.min(uSegs, 12); i++) {
      const u = (i / Math.min(uSegs, 12)) * Math.PI * 2
      const pts = []
      for (let j = 0; j <= 64; j++) {
        const v = (j / 64) * Math.PI * 2
        pts.push((R + r * Math.cos(u)) * Math.cos(v), r * Math.sin(u), (R + r * Math.cos(u)) * Math.sin(v))
      }
      uL.push(new Float32Array(pts))
    }

    // V parameter lines
    const vL = []
    for (let j = 0; j <= Math.min(vSegs, 16); j++) {
      const v = (j / Math.min(vSegs, 16)) * Math.PI * 2
      const pts = []
      for (let i = 0; i <= 64; i++) {
        const u = (i / 64) * Math.PI * 2
        pts.push((R + r * Math.cos(u)) * Math.cos(v), r * Math.sin(u), (R + r * Math.cos(u)) * Math.sin(v))
      }
      vL.push(new Float32Array(pts))
    }

    return { geometry: geo, uLines: uL, vLines: vL }
  }, [R, r, uSegs, vSegs])

  return (
    <group ref={meshRef}>
      <mesh geometry={geometry}>
        <meshPhongMaterial vertexColors side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>
      {uLines.map((pts, idx) => (
        <line key={`u-${idx}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={pts.length / 3} array={pts} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color="#f59e0b" opacity={0.7} transparent />
        </line>
      ))}
      {vLines.map((pts, idx) => (
        <line key={`v-${idx}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={pts.length / 3} array={pts} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color="#06b6d4" opacity={0.7} transparent />
        </line>
      ))}
    </group>
  )
}

function ParametricSaddle({ uSegs = 24, vSegs = 24 }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  const { geometry, uLines, vLines } = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = []
    const colors = []
    const color = new THREE.Color()
    const range = 1.5

    for (let i = 0; i <= uSegs; i++) {
      const u = (i / uSegs) * 2 * range - range
      for (let j = 0; j <= vSegs; j++) {
        const v = (j / vSegs) * 2 * range - range
        const x = u
        const z = v
        const y = (u * u - v * v) * 0.3
        positions.push(x, y, z)
        const h = (y + 0.7) / 1.4
        color.setHSL(0.55 + h * 0.3, 0.6, 0.55)
        colors.push(color.r, color.g, color.b)
      }
    }

    const indices = []
    for (let i = 0; i < uSegs; i++) {
      for (let j = 0; j < vSegs; j++) {
        const a = i * (vSegs + 1) + j
        const b = a + 1
        const c = (i + 1) * (vSegs + 1) + j
        const d = c + 1
        indices.push(a, b, c)
        indices.push(b, d, c)
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()

    // U lines
    const uL = []
    for (let i = 0; i <= 10; i++) {
      const u = (i / 10) * 2 * range - range
      const pts = []
      for (let j = 0; j <= 40; j++) {
        const v = (j / 40) * 2 * range - range
        pts.push(u, (u * u - v * v) * 0.3, v)
      }
      uL.push(new Float32Array(pts))
    }

    // V lines
    const vL = []
    for (let j = 0; j <= 10; j++) {
      const v = (j / 10) * 2 * range - range
      const pts = []
      for (let i = 0; i <= 40; i++) {
        const u = (i / 40) * 2 * range - range
        pts.push(u, (u * u - v * v) * 0.3, v)
      }
      vL.push(new Float32Array(pts))
    }

    return { geometry: geo, uLines: uL, vLines: vL }
  }, [uSegs, vSegs])

  return (
    <group ref={meshRef}>
      <mesh geometry={geometry}>
        <meshPhongMaterial vertexColors side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>
      {uLines.map((pts, idx) => (
        <line key={`u-${idx}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={pts.length / 3} array={pts} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color="#f59e0b" opacity={0.7} transparent />
        </line>
      ))}
      {vLines.map((pts, idx) => (
        <line key={`v-${idx}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={pts.length / 3} array={pts} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color="#06b6d4" opacity={0.7} transparent />
        </line>
      ))}
    </group>
  )
}

function Scene({ type, R, r, uSegs, vSegs }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#a78bfa" />

      {type === 'torus' && <ParametricTorus R={R} r={r} uSegs={uSegs} vSegs={vSegs} />}
      {type === 'saddle' && <ParametricSaddle uSegs={uSegs} vSegs={vSegs} />}

      <OrbitControls enablePan={false} />
      <gridHelper args={[4, 8, '#333', '#222']} position={[0, -1.2, 0]} />
    </>
  )
}

export default function ExplicitParametricSurface() {
  const [type, setType] = useState('torus')
  const [R, setR] = useState(1.0)
  const [r, setR2] = useState(0.4)
  const [uSegs, setUSegs] = useState(24)
  const [vSegs, setVSegs] = useState(16)

  const formulas = {
    torus: {
      main: 'r(u,v) = ((R + r·cos u)·cos v, r·sin u, (R + r·cos u)·sin v)',
      desc: 'Torus 参数方程：u 控制管截面角度，v 控制环绕角度',
      vars: `R = ${R.toFixed(2)} (主半径)  r = ${r.toFixed(2)} (管半径)  u,v ∈ [0, 2π]`,
    },
    saddle: {
      main: 'r(u,v) = (u, u² − v², v)',
      desc: '马鞍面：z = u² − v²，双曲抛物面',
      vars: `u,v ∈ [−1.5, 1.5]  分段: ${uSegs}×${vSegs}`,
    },
  }

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(16,185,129,0.2)', background: '#0a0a1a' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <Canvas camera={{ position: [2.5, 2, 2.5], fov: 45 }}>
            <Scene type={type} R={R} r={r} uSegs={uSegs} vSegs={vSegs} />
          </Canvas>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6ee7b7', marginBottom: '4px' }}>
            {formulas[type].main}
          </div>
          <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.7 }}>
            {formulas[type].desc}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666', marginTop: '4px' }}>
            {formulas[type].vars}
          </div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '8px', lineHeight: 1.6 }}>
            <span style={{ color: '#f59e0b' }}>━</span> u 方向参数线 &nbsp;
            <span style={{ color: '#06b6d4' }}>━</span> v 方向参数线
          </div>
          <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.6 }}>
            遍历 (u,v) 网格 → 直接生成表面点 → 这就是"显式"
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setType('torus')} style={{ padding: '6px 14px', borderRadius: '100px', border: type === 'torus' ? '1px solid #10b981' : '1px solid #333', background: type === 'torus' ? 'rgba(16,185,129,0.15)' : 'transparent', color: type === 'torus' ? '#6ee7b7' : '#888', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            Torus 游泳圈
          </button>
          <button onClick={() => setType('saddle')} style={{ padding: '6px 14px', borderRadius: '100px', border: type === 'saddle' ? '1px solid #10b981' : '1px solid #333', background: type === 'saddle' ? 'rgba(16,185,129,0.15)' : 'transparent', color: type === 'saddle' ? '#6ee7b7' : '#888', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            Saddle 马鞍面
          </button>
        </div>
        {type === 'torus' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888' }}>
              <span style={{ minWidth: '16px' }}>R</span>
              <input type="range" min="0.5" max="1.8" step="0.05" value={R} onChange={e => setR(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#10b981' }} />
              <span style={{ fontFamily: 'monospace', minWidth: '36px', color: '#6ee7b7' }}>{R.toFixed(2)}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888' }}>
              <span style={{ minWidth: '16px' }}>r</span>
              <input type="range" min="0.1" max="0.8" step="0.05" value={r} onChange={e => setR2(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#10b981' }} />
              <span style={{ fontFamily: 'monospace', minWidth: '36px', color: '#6ee7b7' }}>{r.toFixed(2)}</span>
            </label>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888', marginTop: '8px' }}>
          <span>分段数</span>
          <input type="range" min="4" max="48" step="2" value={uSegs} onChange={e => setUSegs(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#10b981' }} />
          <span style={{ fontFamily: 'monospace', minWidth: '36px', color: '#6ee7b7' }}>{uSegs}</span>
        </div>
      </div>
    </div>
  )
}
