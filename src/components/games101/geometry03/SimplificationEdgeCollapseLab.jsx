import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { createIcosphere, simplifyMesh } from './meshUtils'

function SimplifiedMesh({ meshData }) {
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
        <meshStandardMaterial color="#6366f1" side={THREE.DoubleSide} flatShading />
      </mesh>
      <lineSegments geometry={wireGeo}>
        <lineBasicMaterial color="#fff" opacity={0.2} transparent />
      </lineSegments>
    </>
  )
}

export default function SimplificationEdgeCollapseLab() {
  const [ratio, setRatio] = useState(1.0)

  const original = useMemo(() => createIcosphere(2), [])
  const current = useMemo(() => {
    if (ratio >= 0.99) return original
    return simplifyMesh(original, ratio)
  }, [original, ratio])

  const reductionPct = ((1 - current.faces.length / original.faces.length) * 100).toFixed(0)

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <div style={{ height: '400px' }}>
        <Canvas camera={{ position: [2, 1.5, 2], fov: 40 }}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 4, 3]} intensity={0.8} />
          <SimplifiedMesh meshData={current} />
          <OrbitControls enableDamping dampingFactor={0.1} />
        </Canvas>
      </div>
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>Target Ratio</span>
          <input type="range" min="0.15" max="1" step="0.05" value={ratio}
            onChange={(e) => setRatio(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#f43f5e' }} />
          <span style={{ fontSize: '13px', color: '#f43f5e', fontFamily: 'monospace', minWidth: '40px' }}>{(ratio*100).toFixed(0)}%</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>
          <span>Original: <span style={{ color: '#a5b4fc' }}>{original.faces.length}F</span></span>
          <span>Current: <span style={{ color: '#f43f5e' }}>{current.faces.length}F</span></span>
          <span>Reduced: <span style={{ color: '#f59e0b' }}>{reductionPct}%</span></span>
        </div>
      </div>
    </div>
  )
}
