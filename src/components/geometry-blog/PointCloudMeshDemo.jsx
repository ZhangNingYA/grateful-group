import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Points, PointMaterial } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 点云 vs 网格对比演示
 * 同一个球体用点云和三角网格两种方式显示
 * 可调节密度、切换 wireframe、显示法线
 */

function PointCloudSphere({ count = 3000 }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  const positions = useMemo(() => {
    const pts = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const color = new THREE.Color()

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 1.0
      pts[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pts[i * 3 + 2] = r * Math.cos(phi)

      const h = (pts[i * 3 + 2] + 1) / 2
      color.setHSL(0.55 + h * 0.3, 0.7, 0.6)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    return { positions: pts, colors }
  }, [count])

  return (
    <group ref={ref}>
      <Points positions={positions.positions} colors={positions.colors}>
        <PointMaterial vertexColors size={0.03} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
      </Points>
    </group>
  )
}

function MeshSphere({ detail = 2, showWireframe = true, showNormals = false }) {
  const meshRef = useRef()
  const normalsRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
    if (normalsRef.current) {
      normalsRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  const normalLines = useMemo(() => {
    if (!showNormals) return null
    const geo = new THREE.IcosahedronGeometry(1.0, detail)
    const pos = geo.attributes.position
    const norm = geo.attributes.normal
    const lines = []
    const step = Math.max(1, Math.floor(pos.count / 60))
    for (let i = 0; i < pos.count; i += step) {
      const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i)
      const nx = norm.getX(i), ny = norm.getY(i), nz = norm.getZ(i)
      lines.push(px, py, pz, px + nx * 0.2, py + ny * 0.2, pz + nz * 0.2)
    }
    return new Float32Array(lines)
  }, [detail, showNormals])

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.0, detail]} />
        <meshPhysicalMaterial
          color="#6366f1"
          roughness={0.3}
          metalness={0.1}
          flatShading={detail < 3}
          transparent
          opacity={showWireframe ? 0.5 : 0.85}
        />
      </mesh>
      {showWireframe && (
        <mesh ref={normalsRef}>
          <icosahedronGeometry args={[1.001, detail]} />
          <meshBasicMaterial color="#a5b4fc" wireframe transparent opacity={0.4} />
        </mesh>
      )}
      {normalLines && (
        <line ref={normalsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={normalLines.length / 3} array={normalLines} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color="#22c55e" opacity={0.7} transparent />
        </line>
      )}
    </group>
  )
}

function Scene({ mode, pointCount, meshDetail, showWireframe, showNormals }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#a78bfa" />

      {mode === 'points' && <PointCloudSphere count={pointCount} />}
      {mode === 'mesh' && <MeshSphere detail={meshDetail} showWireframe={showWireframe} showNormals={showNormals} />}

      <OrbitControls enablePan={false} />
      <gridHelper args={[4, 8, '#333', '#222']} position={[0, -1.3, 0]} />
    </>
  )
}

export default function PointCloudMeshDemo() {
  const [mode, setMode] = useState('points')
  const [pointCount, setPointCount] = useState(3000)
  const [meshDetail, setMeshDetail] = useState(2)
  const [showWireframe, setShowWireframe] = useState(true)
  const [showNormals, setShowNormals] = useState(false)

  const faces = 20 * Math.pow(4, meshDetail)
  const vertices = Math.round(10 * Math.pow(4, meshDetail) + 2)

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(6,182,212,0.2)', background: '#0a0a1a' }}>
      <div style={{ height: '380px' }}>
        <Canvas camera={{ position: [2, 1.5, 2], fov: 45 }}>
          <Scene mode={mode} pointCount={pointCount} meshDetail={meshDetail} showWireframe={showWireframe} showNormals={showNormals} />
        </Canvas>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setMode('points')} style={{ padding: '6px 14px', borderRadius: '100px', border: mode === 'points' ? '1px solid #06b6d4' : '1px solid #333', background: mode === 'points' ? 'rgba(6,182,212,0.15)' : 'transparent', color: mode === 'points' ? '#67e8f9' : '#888', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            Point Cloud 点云
          </button>
          <button onClick={() => setMode('mesh')} style={{ padding: '6px 14px', borderRadius: '100px', border: mode === 'mesh' ? '1px solid #06b6d4' : '1px solid #333', background: mode === 'mesh' ? 'rgba(6,182,212,0.15)' : 'transparent', color: mode === 'mesh' ? '#67e8f9' : '#888', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            Polygon Mesh 网格
          </button>
          {mode === 'mesh' && (
            <>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#888', marginLeft: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={showWireframe} onChange={e => setShowWireframe(e.target.checked)} style={{ accentColor: '#06b6d4' }} />
                wireframe
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#888', cursor: 'pointer' }}>
                <input type="checkbox" checked={showNormals} onChange={e => setShowNormals(e.target.checked)} style={{ accentColor: '#22c55e' }} />
                normals
              </label>
            </>
          )}
        </div>

        {mode === 'points' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#888', minWidth: '50px' }}>点数</span>
            <input type="range" min="100" max="15000" step="100" value={pointCount} onChange={e => setPointCount(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#06b6d4' }} />
            <span style={{ fontSize: '12px', color: '#67e8f9', fontFamily: 'monospace', minWidth: '50px' }}>{pointCount}</span>
          </div>
        )}

        {mode === 'mesh' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#888', minWidth: '50px' }}>细分</span>
            <input type="range" min="0" max="4" step="1" value={meshDetail} onChange={e => setMeshDetail(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#06b6d4' }} />
            <span style={{ fontSize: '12px', color: '#67e8f9', fontFamily: 'monospace', minWidth: '80px' }}>L{meshDetail} ({faces}面)</span>
          </div>
        )}

        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          {mode === 'points'
            ? '点云：只有位置，没有面连接。密度不足时出现"洞"。'
            : `网格：顶点 ${vertices} + 面 ${faces}，有连接关系，可计算法线和着色。`}
        </div>
      </div>
    </div>
  )
}
