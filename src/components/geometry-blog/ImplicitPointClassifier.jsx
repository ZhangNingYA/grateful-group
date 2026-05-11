import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 隐式点分类器
 * 展示 f(p) = x² + y² + z² - r² 的内外判断
 * 用户可通过 slider 调整采样点和半径
 */

function TransparentSphere({ radius }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshPhysicalMaterial
        color="#6366f1"
        roughness={0.1}
        metalness={0.0}
        transmission={0.85}
        thickness={0.5}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function WireframeSphere({ radius }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.15} />
    </mesh>
  )
}

function SamplePoint({ position, status }) {
  const colors = {
    inside: '#22c55e',
    surface: '#f59e0b',
    outside: '#ef4444',
  }
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15
      ref.current.scale.set(s, s, s)
    }
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={colors[status]} />
    </mesh>
  )
}

function DistanceLine({ from, to, status }) {
  const colors = {
    inside: '#22c55e',
    surface: '#f59e0b',
    outside: '#ef4444',
  }
  const points = useMemo(() => {
    const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from)).normalize()
    const end = new THREE.Vector3(...from).add(dir.multiplyScalar(new THREE.Vector3(...to).distanceTo(new THREE.Vector3(...from))))
    return [new THREE.Vector3(...from), end]
  }, [from, to])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([...from, ...to])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={colors[status]} transparent opacity={0.6} />
    </line>
  )
}

function Axes() {
  const len = 2.0
  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0,0,0, len,0,0])} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#ef4444" opacity={0.5} transparent />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0,0,0, 0,len,0])} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#22c55e" opacity={0.5} transparent />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0,0,0, 0,0,len])} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#3b82f6" opacity={0.5} transparent />
      </line>
    </group>
  )
}

function Scene({ px, py, pz, radius }) {
  const dist = Math.sqrt(px * px + py * py + pz * pz)
  const fVal = px * px + py * py + pz * pz - radius * radius
  const sdfVal = dist - radius
  const epsilon = 0.05
  let status = 'outside'
  if (Math.abs(sdfVal) < epsilon) status = 'surface'
  else if (sdfVal < 0) status = 'inside'

  // Closest point on sphere surface
  const closestOnSurface = dist > 0.001
    ? [px / dist * radius, py / dist * radius, pz / dist * radius]
    : [radius, 0, 0]

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#a78bfa" />

      <TransparentSphere radius={radius} />
      <WireframeSphere radius={radius} />
      <SamplePoint position={[px, py, pz]} status={status} />
      <DistanceLine from={[px, py, pz]} to={closestOnSurface} status={status} />
      <Axes />

      <OrbitControls enablePan={false} />
      <gridHelper args={[4, 8, '#333', '#222']} position={[0, -1.8, 0]} />
    </>
  )
}

export default function ImplicitPointClassifier() {
  const [px, setPx] = useState(0.8)
  const [py, setPy] = useState(0.3)
  const [pz, setPz] = useState(0.2)
  const [radius, setRadius] = useState(1.0)

  const dist = Math.sqrt(px * px + py * py + pz * pz)
  const fVal = px * px + py * py + pz * pz - radius * radius
  const sdfVal = dist - radius
  const epsilon = 0.05
  let status = 'outside'
  let statusLabel = '外部 (outside)'
  let statusColor = '#ef4444'
  if (Math.abs(sdfVal) < epsilon) {
    status = 'surface'
    statusLabel = '表面 (surface)'
    statusColor = '#f59e0b'
  } else if (sdfVal < 0) {
    status = 'inside'
    statusLabel = '内部 (inside)'
    statusColor = '#22c55e'
  }

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', background: '#0a0a1a' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <Canvas camera={{ position: [2.5, 1.8, 2.5], fov: 45 }}>
            <Scene px={px} py={py} pz={pz} radius={radius} />
          </Canvas>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#a5b4fc', marginBottom: '8px' }}>
            f(p) = x² + y² + z² − r² = 0
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888', lineHeight: 1.8 }}>
            <div>p = ({px.toFixed(2)}, {py.toFixed(2)}, {pz.toFixed(2)})</div>
            <div>r = {radius.toFixed(2)}</div>
            <div>f(p) = <span style={{ color: statusColor }}>{fVal.toFixed(3)}</span></div>
            <div>SDF = |p| − r = <span style={{ color: statusColor }}>{sdfVal.toFixed(3)}</span></div>
            <div style={{ marginTop: '6px' }}>
              判定: <span style={{ color: statusColor, fontWeight: 'bold' }}>{statusLabel}</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', lineHeight: 1.6 }}>
            {status === 'inside' && 'f(p) < 0 → 点在球体内部'}
            {status === 'surface' && 'f(p) ≈ 0 → 点在球面上'}
            {status === 'outside' && 'f(p) > 0 → 点在球体外部'}
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888' }}>
            <span style={{ minWidth: '16px' }}>x</span>
            <input type="range" min="-2" max="2" step="0.05" value={px} onChange={e => setPx(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#6366f1' }} />
            <span style={{ fontFamily: 'monospace', minWidth: '40px', color: '#a5b4fc' }}>{px.toFixed(2)}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888' }}>
            <span style={{ minWidth: '16px' }}>y</span>
            <input type="range" min="-2" max="2" step="0.05" value={py} onChange={e => setPy(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#6366f1' }} />
            <span style={{ fontFamily: 'monospace', minWidth: '40px', color: '#a5b4fc' }}>{py.toFixed(2)}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888' }}>
            <span style={{ minWidth: '16px' }}>z</span>
            <input type="range" min="-2" max="2" step="0.05" value={pz} onChange={e => setPz(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#6366f1' }} />
            <span style={{ fontFamily: 'monospace', minWidth: '40px', color: '#a5b4fc' }}>{pz.toFixed(2)}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888' }}>
            <span style={{ minWidth: '16px' }}>r</span>
            <input type="range" min="0.3" max="2" step="0.05" value={radius} onChange={e => setRadius(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#f59e0b' }} />
            <span style={{ fontFamily: 'monospace', minWidth: '40px', color: '#f59e0b' }}>{radius.toFixed(2)}</span>
          </label>
        </div>
      </div>
    </div>
  )
}
