import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { createIcosphere, loopSubdivide } from './meshUtils'

function SubdivMesh({ meshData, smooth }) {
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

  return (
    <>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#6366f1" side={THREE.DoubleSide} flatShading={!smooth} />
      </mesh>
      <lineSegments geometry={wireGeo}>
        <lineBasicMaterial color="#fff" opacity={0.15} transparent />
      </lineSegments>
    </>
  )
}

export default function SubdivisionComparison3D() {
  const [level, setLevel] = useState(0)
  const [smooth, setSmooth] = useState(false)

  const meshes = useMemo(() => {
    const levels = [createIcosphere(0)]
    for (let i = 1; i <= 3; i++) levels.push(loopSubdivide(levels[i - 1]))
    return levels
  }, [])

  const current = meshes[level]

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <div style={{ height: '400px' }}>
        <Canvas camera={{ position: [2, 1.5, 2], fov: 40 }}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 4, 3]} intensity={0.8} />
          <SubdivMesh meshData={current} smooth={smooth} />
          <OrbitControls enableDamping dampingFactor={0.1} />
        </Canvas>
      </div>
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>Level</span>
          <input type="range" min="0" max="3" step="1" value={level}
            onChange={(e) => setLevel(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: '#6366f1' }} />
          <span style={{ fontSize: '13px', color: '#a5b4fc', fontFamily: 'monospace', minWidth: '20px' }}>{level}</span>
          <button
            style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', border: smooth ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.08)', background: smooth ? 'rgba(74,222,128,0.08)' : 'transparent', color: smooth ? '#4ade80' : '#888' }}
            onClick={() => setSmooth(!smooth)}
          >{smooth ? 'Smooth' : 'Flat'}</button>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>
          <span>Vertices: <span style={{ color: '#a5b4fc' }}>{current.vertices.length}</span></span>
          <span>Faces: <span style={{ color: '#a5b4fc' }}>{current.faces.length}</span></span>
          <span>Level: <span style={{ color: '#f59e0b' }}>{level}</span></span>
        </div>
      </div>
    </div>
  )
}
