import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import { useRef, useState, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { bernstein3 } from './utils'

function evaluateSurface(control, u, v) {
  let x = 0, y = 0, z = 0
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const w = bernstein3(i, u) * bernstein3(j, v)
      x += control[i][j][0] * w
      y += control[i][j][1] * w
      z += control[i][j][2] * w
    }
  }
  return [x, y, z]
}

function createDefaultControl(heightScale = 1) {
  const grid = []
  for (let i = 0; i < 4; i++) {
    const row = []
    for (let j = 0; j < 4; j++) {
      const x = (i - 1.5) * 0.8
      const z = (j - 1.5) * 0.8
      // Create a nice curved surface
      let y = 0
      if (i === 1 && j === 1) y = 0.8 * heightScale
      if (i === 1 && j === 2) y = 0.6 * heightScale
      if (i === 2 && j === 1) y = 0.6 * heightScale
      if (i === 2 && j === 2) y = 1.0 * heightScale
      if (i === 0 && j === 0) y = -0.2 * heightScale
      if (i === 3 && j === 3) y = -0.2 * heightScale
      row.push([x, y, z])
    }
    grid.push(row)
  }
  return grid
}

function SurfaceMesh({ control, resolution, showWireframe }) {
  const geometry = useMemo(() => {
    const res = resolution
    const geo = new THREE.BufferGeometry()
    const vertices = []
    const indices = []
    const normals = []

    for (let i = 0; i <= res; i++) {
      for (let j = 0; j <= res; j++) {
        const u = i / res
        const v = j / res
        const p = evaluateSurface(control, u, v)
        vertices.push(p[0], p[1], p[2])
      }
    }

    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const a = i * (res + 1) + j
        const b = a + 1
        const c = (i + 1) * (res + 1) + j
        const d = c + 1
        indices.push(a, c, b)
        indices.push(b, c, d)
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [control, resolution])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#6366f1"
        side={THREE.DoubleSide}
        wireframe={showWireframe}
        transparent
        opacity={showWireframe ? 0.8 : 0.85}
      />
    </mesh>
  )
}

function ControlNet({ control, showNet }) {
  if (!showNet) return null

  const lines = useMemo(() => {
    const result = []
    // Rows
    for (let i = 0; i < 4; i++) {
      const pts = control[i].map(p => new THREE.Vector3(p[0], p[1], p[2]))
      result.push(pts)
    }
    // Columns
    for (let j = 0; j < 4; j++) {
      const pts = [0, 1, 2, 3].map(i => new THREE.Vector3(control[i][j][0], control[i][j][1], control[i][j][2]))
      result.push(pts)
    }
    return result
  }, [control])

  return (
    <>
      {lines.map((pts, idx) => (
        <Line key={idx} points={pts} color="#f59e0b" lineWidth={1} opacity={0.5} transparent />
      ))}
      {control.flat().map((p, idx) => (
        <mesh key={idx} position={[p[0], p[1], p[2]]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      ))}
    </>
  )
}

function Scene({ control, resolution, showNet, showWireframe }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 3]} intensity={0.8} />
      <directionalLight position={[-2, 3, -2]} intensity={0.3} />
      <SurfaceMesh control={control} resolution={resolution} showWireframe={showWireframe} />
      <ControlNet control={control} showNet={showNet} />
      <OrbitControls enableDamping dampingFactor={0.1} />
      <gridHelper args={[4, 8, '#222', '#222']} position={[0, -0.5, 0]} />
    </>
  )
}

export default function BezierSurfacePatch3D() {
  const [resolution, setResolution] = useState(20)
  const [heightScale, setHeightScale] = useState(1)
  const [showNet, setShowNet] = useState(true)
  const [showWireframe, setShowWireframe] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState({ i: 2, j: 2 })
  const [pointHeight, setPointHeight] = useState(1.0)

  const control = useMemo(() => {
    const grid = createDefaultControl(heightScale)
    grid[selectedPoint.i][selectedPoint.j][1] = pointHeight * heightScale
    return grid
  }, [heightScale, selectedPoint, pointHeight])

  const toggleStyle = (active) => ({
    padding: '4px 10px', borderRadius: '5px', fontSize: '11px', cursor: 'pointer',
    border: active ? '1px solid #6366f1' : '1px solid #333',
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: active ? '#a5b4fc' : '#888',
  })

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: '#0f0f1a' }}>
      <div style={{ height: '420px' }}>
        <Canvas camera={{ position: [3, 2.5, 3], fov: 45 }}>
          <Scene control={control} resolution={resolution} showNet={showNet} showWireframe={showWireframe} />
        </Canvas>
      </div>
      <div style={{ padding: '12px 16px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <button style={toggleStyle(showNet)} onClick={() => setShowNet(!showNet)}>Control Net</button>
          <button style={toggleStyle(showWireframe)} onClick={() => setShowWireframe(!showWireframe)}>Wireframe</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Resolution: {resolution}</div>
            <input type="range" min="5" max="40" value={resolution}
              onChange={(e) => setResolution(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Height Scale: {heightScale.toFixed(1)}</div>
            <input type="range" min="0" max="2" step="0.1" value={heightScale}
              onChange={(e) => setHeightScale(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
              Selected Point [{selectedPoint.i},{selectedPoint.j}] Height: {pointHeight.toFixed(2)}
            </div>
            <input type="range" min="-1.5" max="2" step="0.05" value={pointHeight}
              onChange={(e) => setPointHeight(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }} />
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
          参数域 (u,v) ∈ [0,1]² → 3D 曲面 patch | 拖动旋转观察
        </div>
      </div>
    </div>
  )
}
