import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { createIcosphere, loopSubdivide, computeVertexNormals, faceNormal } from './meshUtils'

function NormalsMesh({ meshData, shading, showFaceNormals, showVertNormals }) {
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

  const faceNormalLines = useMemo(() => {
    if (!showFaceNormals) return null
    const pts = []
    for (const [a, b, c] of meshData.faces) {
      const va = meshData.vertices[a], vb = meshData.vertices[b], vc = meshData.vertices[c]
      const center = { x: (va.x+vb.x+vc.x)/3, y: (va.y+vb.y+vc.y)/3, z: (va.z+vb.z+vc.z)/3 }
      const n = faceNormal(va, vb, vc)
      const s = 0.12
      pts.push(center.x, center.y, center.z, center.x+n.x*s, center.y+n.y*s, center.z+n.z*s)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [meshData, showFaceNormals])

  const vertNormalLines = useMemo(() => {
    if (!showVertNormals) return null
    const normals = computeVertexNormals(meshData.vertices, meshData.faces)
    const pts = []
    for (let i = 0; i < meshData.vertices.length; i++) {
      const v = meshData.vertices[i], n = normals[i]
      const s = 0.15
      pts.push(v.x, v.y, v.z, v.x+n.x*s, v.y+n.y*s, v.z+n.z*s)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [meshData, showVertNormals])

  return (
    <>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#6366f1" side={THREE.DoubleSide} flatShading={shading === 'flat'} />
      </mesh>
      {faceNormalLines && (
        <lineSegments geometry={faceNormalLines}>
          <lineBasicMaterial color="#f59e0b" />
        </lineSegments>
      )}
      {vertNormalLines && (
        <lineSegments geometry={vertNormalLines}>
          <lineBasicMaterial color="#4ade80" />
        </lineSegments>
      )}
    </>
  )
}

export default function NormalsAndCurvatureViewer3D() {
  const [shading, setShading] = useState('flat')
  const [showFaceNormals, setShowFaceNormals] = useState(false)
  const [showVertNormals, setShowVertNormals] = useState(false)

  const meshData = useMemo(() => loopSubdivide(createIcosphere(0)), [])

  const toggleStyle = (active) => ({
    padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
    border: active ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.06)',
    background: active ? 'rgba(245,158,11,0.08)' : 'transparent',
    color: active ? '#fbbf24' : '#666',
  })

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <div style={{ height: '400px' }}>
        <Canvas camera={{ position: [2, 1.5, 2], fov: 40 }}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 4, 3]} intensity={0.8} />
          <directionalLight position={[-2, 2, -1]} intensity={0.3} />
          <NormalsMesh meshData={meshData} shading={shading} showFaceNormals={showFaceNormals} showVertNormals={showVertNormals} />
          <OrbitControls enableDamping dampingFactor={0.1} />
        </Canvas>
      </div>
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button style={toggleStyle(shading === 'flat')} onClick={() => setShading('flat')}>Flat Shading</button>
          <button style={toggleStyle(shading === 'smooth')} onClick={() => setShading('smooth')}>Smooth Shading</button>
          <button style={toggleStyle(showFaceNormals)} onClick={() => setShowFaceNormals(!showFaceNormals)}>Face Normals</button>
          <button style={toggleStyle(showVertNormals)} onClick={() => setShowVertNormals(!showVertNormals)}>Vertex Normals</button>
        </div>
        <div style={{ fontSize: '11px', color: '#555', marginTop: '8px' }}>
          几何不变，只是法线插值方式不同 → 光照结果完全不同
        </div>
      </div>
    </div>
  )
}
