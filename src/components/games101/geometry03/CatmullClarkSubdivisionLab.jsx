import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { createQuadCube, catmullClarkSubdivide } from './meshUtils'

function QuadMeshView({ meshData, showFacePoints, showEdgePoints }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = []
    for (const quad of meshData.quads) {
      const [a,b,c,d] = quad.map(i => meshData.vertices[i])
      positions.push(a.x,a.y,a.z, b.x,b.y,b.z, c.x,c.y,c.z)
      positions.push(a.x,a.y,a.z, c.x,c.y,c.z, d.x,d.y,d.z)
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.computeVertexNormals()
    return geo
  }, [meshData])

  const wireGeo = useMemo(() => {
    const edges = new Set()
    const pts = []
    for (const quad of meshData.quads) {
      for (let i = 0; i < 4; i++) {
        const a = quad[i], b = quad[(i+1)%4]
        const key = Math.min(a,b)+'_'+Math.max(a,b)
        if (!edges.has(key)) {
          edges.add(key)
          const v0 = meshData.vertices[a], v1 = meshData.vertices[b]
          pts.push(v0.x,v0.y,v0.z, v1.x,v1.y,v1.z)
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
        <lineBasicMaterial color="#fff" opacity={0.25} transparent />
      </lineSegments>
    </>
  )
}

export default function CatmullClarkSubdivisionLab() {
  const [level, setLevel] = useState(0)

  const meshes = useMemo(() => {
    const levels = [createQuadCube()]
    for (let i = 1; i <= 3; i++) levels.push(catmullClarkSubdivide(levels[i-1]))
    return levels
  }, [])

  const current = meshes[level]

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <div style={{ height: '420px' }}>
        <Canvas camera={{ position: [2.5, 2, 2.5], fov: 40 }}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 4, 3]} intensity={0.8} />
          <directionalLight position={[-2, 2, -1]} intensity={0.3} />
          <QuadMeshView meshData={current} />
          <OrbitControls enableDamping dampingFactor={0.1} />
        </Canvas>
      </div>
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>Subdivision Level</span>
          <input type="range" min="0" max="3" step="1" value={level}
            onChange={(e) => setLevel(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: '#6366f1' }} />
          <span style={{ fontSize: '13px', color: '#a5b4fc', fontFamily: 'monospace' }}>{level}</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>
          <span>Vertices: <span style={{ color: '#a5b4fc' }}>{current.vertices.length}</span></span>
          <span>Quads: <span style={{ color: '#a5b4fc' }}>{current.quads.length}</span></span>
        </div>
        <div style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>
          观察：Cube 经过多次 Catmull-Clark 细分后逐渐趋向球形
        </div>
      </div>
    </div>
  )
}
