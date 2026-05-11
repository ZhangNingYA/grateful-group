import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Mesh 解剖可视化
 * 展示一个低模 icosphere 的顶点、边、面结构
 * 可切换显示 vertices / edges / faces / normals / wireframe
 * 可调节细分级别
 */

function MeshModel({ detail, showVertices, showEdges, showFaces, showNormals, showWireframe }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, detail), [detail])

  const vertices = useMemo(() => {
    const pos = geo.attributes.position
    const verts = []
    const seen = new Set()
    for (let i = 0; i < pos.count; i++) {
      const key = `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`
      if (!seen.has(key)) {
        seen.add(key)
        verts.push([pos.getX(i), pos.getY(i), pos.getZ(i)])
      }
    }
    return verts
  }, [geo])

  const normals = useMemo(() => {
    const pos = geo.attributes.position
    const norm = geo.attributes.normal
    const lines = []
    const step = Math.max(1, Math.floor(pos.count / 60))
    for (let i = 0; i < pos.count; i += step) {
      const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i)
      const nx = norm.getX(i), ny = norm.getY(i), nz = norm.getZ(i)
      lines.push([px, py, pz, px + nx * 0.2, py + ny * 0.2, pz + nz * 0.2])
    }
    return lines
  }, [geo])

  const stats = useMemo(() => {
    const pos = geo.attributes.position
    const faceCount = pos.count / 3
    const uniqueVerts = vertices.length
    // Euler: E = V + F - 2 for closed mesh
    const edgeCount = uniqueVerts + faceCount - 2
    return { vertices: uniqueVerts, edges: edgeCount, faces: faceCount }
  }, [geo, vertices])

  return (
    <group ref={meshRef}>
      {/* Solid faces */}
      {showFaces && (
        <mesh geometry={geo}>
          <meshStandardMaterial color="#10b981" flatShading transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Wireframe */}
      {showWireframe && (
        <mesh geometry={geo}>
          <meshBasicMaterial color="#34d399" wireframe transparent opacity={0.4} />
        </mesh>
      )}

      {/* Edges */}
      {showEdges && (
        <lineSegments>
          <edgesGeometry args={[geo]} />
          <lineBasicMaterial color="#f59e0b" transparent opacity={0.8} />
        </lineSegments>
      )}

      {/* Vertices */}
      {showVertices && vertices.map((v, i) => (
        <mesh key={i} position={v}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      ))}

      {/* Normals */}
      {showNormals && normals.map((n, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array(n)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </line>
      ))}
    </group>
  )
}

function Scene({ detail, showVertices, showEdges, showFaces, showNormals, showWireframe }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#a78bfa" />
      <MeshModel
        detail={detail}
        showVertices={showVertices}
        showEdges={showEdges}
        showFaces={showFaces}
        showNormals={showNormals}
        showWireframe={showWireframe}
      />
      <OrbitControls enablePan={false} />
      <gridHelper args={[4, 8, '#333', '#222']} position={[0, -1.5, 0]} />
    </>
  )
}

export default function MeshAnatomy3D() {
  const [detail, setDetail] = useState(1)
  const [showVertices, setShowVertices] = useState(true)
  const [showEdges, setShowEdges] = useState(true)
  const [showFaces, setShowFaces] = useState(true)
  const [showNormals, setShowNormals] = useState(false)
  const [showWireframe, setShowWireframe] = useState(false)

  // Compute stats
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, detail), [detail])
  const stats = useMemo(() => {
    const pos = geo.attributes.position
    const faceCount = pos.count / 3
    const seen = new Set()
    for (let i = 0; i < pos.count; i++) {
      seen.add(`${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`)
    }
    const uniqueVerts = seen.size
    const edgeCount = uniqueVerts + faceCount - 2
    return { vertices: uniqueVerts, edges: edgeCount, faces: faceCount }
  }, [geo])

  const toggleStyle = (active) => ({
    padding: '5px 12px',
    borderRadius: '100px',
    border: active ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(16,185,129,0.15)' : 'transparent',
    color: active ? '#34d399' : '#666',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  })

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(16,185,129,0.2)', background: '#0a0a1a' }}>
      <div style={{ height: '380px' }}>
        <Canvas camera={{ position: [2.2, 1.5, 2.2], fov: 45 }}>
          <Scene
            detail={detail}
            showVertices={showVertices}
            showEdges={showEdges}
            showFaces={showFaces}
            showNormals={showNormals}
            showWireframe={showWireframe}
          />
        </Canvas>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', fontFamily: 'monospace' }}>
          <span style={{ color: '#ef4444' }}>V: {stats.vertices}</span>
          <span style={{ color: '#f59e0b' }}>E: {stats.edges}</span>
          <span style={{ color: '#10b981' }}>F: {stats.faces}</span>
          <span style={{ color: '#666' }}>Euler: V-E+F = {stats.vertices - stats.edges + stats.faces}</span>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowVertices(!showVertices)} style={toggleStyle(showVertices)} aria-label="显示顶点">
            Vertices
          </button>
          <button onClick={() => setShowEdges(!showEdges)} style={toggleStyle(showEdges)} aria-label="显示边">
            Edges
          </button>
          <button onClick={() => setShowFaces(!showFaces)} style={toggleStyle(showFaces)} aria-label="显示面">
            Faces
          </button>
          <button onClick={() => setShowNormals(!showNormals)} style={toggleStyle(showNormals)} aria-label="显示法线">
            Normals
          </button>
          <button onClick={() => setShowWireframe(!showWireframe)} style={toggleStyle(showWireframe)} aria-label="显示线框">
            Wireframe
          </button>
        </div>

        {/* Subdivision slider */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888' }}>
          <span style={{ minWidth: '70px' }}>细分级别</span>
          <input
            type="range" min="0" max="4" step="1" value={detail}
            onChange={e => setDetail(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: '#10b981' }}
            aria-label="细分级别"
          />
          <span style={{ fontFamily: 'monospace', minWidth: '20px', color: '#10b981' }}>{detail}</span>
        </label>
      </div>
    </div>
  )
}
