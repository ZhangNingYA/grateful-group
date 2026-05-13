import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { createIcosphere, loopSubdivide, simplifyMesh } from './meshUtils'

function MeshView({ meshData, showWireframe, showVertices }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = []
    for (const [a, b, c] of meshData.faces) {
      const va = meshData.vertices[a], vb = meshData.vertices[b], vc = meshData.vertices[c]
      positions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z, vc.x, vc.y, vc.z)
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.computeVertexNormals()
    return geo
  }, [meshData])

  const wireGeo = useMemo(() => {
    const edges = new Set()
    const pts = []
    for (const [a, b, c] of meshData.faces) {
      for (const [e0, e1] of [[a,b],[b,c],[c,a]]) {
        const key = Math.min(e0,e1)+'_'+Math.max(e0,e1)
        if (!edges.has(key)) {
          edges.add(key)
          const v0 = meshData.vertices[e0], v1 = meshData.vertices[e1]
          pts.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z)
        }
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [meshData])

  const vertPositions = useMemo(() => {
    const pts = []
    for (const v of meshData.vertices) pts.push(v.x, v.y, v.z)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [meshData])

  return (
    <>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#6366f1" side={THREE.DoubleSide} flatShading />
      </mesh>
      {showWireframe && (
        <lineSegments geometry={wireGeo}>
          <lineBasicMaterial color="#fff" opacity={0.3} transparent />
        </lineSegments>
      )}
      {showVertices && (
        <points geometry={vertPositions}>
          <pointsMaterial color="#f59e0b" size={0.04} />
        </points>
      )}
    </>
  )
}

const MODES = ['Original', 'Subdivided', 'Simplified']

export default function MeshOperationsHero3D() {
  const [mode, setMode] = useState('Original')
  const [showWireframe, setShowWireframe] = useState(true)
  const [showVertices, setShowVertices] = useState(false)

  const meshes = useMemo(() => {
    const original = createIcosphere(1)
    const subdivided = loopSubdivide(original)
    const simplified = simplifyMesh(createIcosphere(2), 0.35)
    return { Original: original, Subdivided: subdivided, Simplified: simplified }
  }, [])

  const current = meshes[mode]
  const stats = { verts: current.vertices.length, faces: current.faces.length }

  const btnStyle = (active) => ({
    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
    border: active ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
    background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
    color: active ? '#a5b4fc' : '#888', transition: 'all 0.15s',
  })

  const toggleStyle = (active) => ({
    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
    border: active ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.06)',
    background: active ? 'rgba(245,158,11,0.08)' : 'transparent',
    color: active ? '#fbbf24' : '#666',
  })

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <div style={{ height: '400px' }}>
        <Canvas camera={{ position: [2.2, 1.5, 2.2], fov: 40 }}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 4, 3]} intensity={0.8} />
          <directionalLight position={[-2, 2, -1]} intensity={0.3} />
          <MeshView meshData={current} showWireframe={showWireframe} showVertices={showVertices} />
          <OrbitControls enableDamping dampingFactor={0.1} />
        </Canvas>
      </div>
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {MODES.map(m => <button key={m} style={btnStyle(mode === m)} onClick={() => setMode(m)}>{m}</button>)}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            <button style={toggleStyle(showWireframe)} onClick={() => setShowWireframe(!showWireframe)}>Wireframe</button>
            <button style={toggleStyle(showVertices)} onClick={() => setShowVertices(!showVertices)}>Vertices</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>
          <span>Vertices: <span style={{ color: '#a5b4fc' }}>{stats.verts}</span></span>
          <span>Faces: <span style={{ color: '#a5b4fc' }}>{stats.faces}</span></span>
          <span>Mode: <span style={{ color: '#f59e0b' }}>{mode}</span></span>
        </div>
      </div>
    </div>
  )
}
