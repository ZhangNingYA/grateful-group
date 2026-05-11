import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import { useState, useMemo } from 'react'
import * as THREE from 'three'
import { bernstein3 } from './utils'

function createControl() {
  const grid = []
  for (let i = 0; i < 4; i++) {
    const row = []
    for (let j = 0; j < 4; j++) {
      const x = (i - 1.5) * 0.7
      const z = (j - 1.5) * 0.7
      let y = 0
      if (i === 1 && j === 1) y = 0.7
      if (i === 1 && j === 2) y = 0.5
      if (i === 2 && j === 1) y = 0.5
      if (i === 2 && j === 2) y = 0.9
      row.push([x, y, z])
    }
    grid.push(row)
  }
  return grid
}

function evaluateRow(control, i, u) {
  // Evaluate Bezier along row i at parameter u
  let x = 0, y = 0, z = 0
  for (let j = 0; j < 4; j++) {
    const w = bernstein3(j, u)
    x += control[i][j][0] * w
    y += control[i][j][1] * w
    z += control[i][j][2] * w
  }
  return [x, y, z]
}

function evaluateFromIntermediate(intermediatePoints, v) {
  // intermediatePoints is 4 points, evaluate Bezier at v
  let x = 0, y = 0, z = 0
  for (let i = 0; i < 4; i++) {
    const w = bernstein3(i, v)
    x += intermediatePoints[i][0] * w
    y += intermediatePoints[i][1] * w
    z += intermediatePoints[i][2] * w
  }
  return [x, y, z]
}

function Scene({ control, u, v }) {
  // Step 1: For fixed u, evaluate each row to get 4 intermediate points
  const intermediatePoints = useMemo(() => {
    return [0, 1, 2, 3].map(i => evaluateRow(control, i, u))
  }, [control, u])

  // Step 2: Evaluate along v direction using intermediate points
  const finalPoint = useMemo(() => {
    return evaluateFromIntermediate(intermediatePoints, v)
  }, [intermediatePoints, v])

  // Control net lines
  const netLines = useMemo(() => {
    const lines = []
    for (let i = 0; i < 4; i++) {
      lines.push(control[i].map(p => new THREE.Vector3(p[0], p[1], p[2])))
    }
    for (let j = 0; j < 4; j++) {
      lines.push([0, 1, 2, 3].map(i => new THREE.Vector3(control[i][j][0], control[i][j][1], control[i][j][2])))
    }
    return lines
  }, [control])

  // U-direction curves (show the row being evaluated)
  const uCurves = useMemo(() => {
    const curves = []
    for (let i = 0; i < 4; i++) {
      const pts = []
      for (let s = 0; s <= 30; s++) {
        const uu = s / 30
        const p = evaluateRow(control, i, uu)
        pts.push(new THREE.Vector3(p[0], p[1], p[2]))
      }
      curves.push(pts)
    }
    return curves
  }, [control])

  // V-direction curve through intermediate points
  const vCurve = useMemo(() => {
    const pts = []
    for (let s = 0; s <= 30; s++) {
      const vv = s / 30
      const p = evaluateFromIntermediate(intermediatePoints, vv)
      pts.push(new THREE.Vector3(p[0], p[1], p[2]))
    }
    return pts
  }, [intermediatePoints])

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 3]} intensity={0.7} />

      {/* Control net */}
      {netLines.map((pts, idx) => (
        <Line key={`net-${idx}`} points={pts} color="#444" lineWidth={0.8} />
      ))}

      {/* Control points */}
      {control.flat().map((p, idx) => (
        <mesh key={`cp-${idx}`} position={[p[0], p[1], p[2]]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#666" />
        </mesh>
      ))}

      {/* U-direction curves (faded) */}
      {uCurves.map((pts, idx) => (
        <Line key={`u-${idx}`} points={pts} color="#6366f1" lineWidth={1.5} opacity={0.4} transparent />
      ))}

      {/* Intermediate points (from u evaluation) */}
      {intermediatePoints.map((p, idx) => (
        <mesh key={`ip-${idx}`} position={[p[0], p[1], p[2]]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>
      ))}

      {/* V-direction curve through intermediate points */}
      <Line points={vCurve} color="#f43f5e" lineWidth={2.5} />

      {/* Final surface point */}
      <mesh position={[finalPoint[0], finalPoint[1], finalPoint[2]]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      <OrbitControls enableDamping dampingFactor={0.1} />
      <gridHelper args={[3, 6, '#1a1a2e', '#1a1a2e']} position={[0, -0.3, 0]} />
    </>
  )
}

export default function TensorProductSurfaceExplainer() {
  const [u, setU] = useState(0.5)
  const [v, setV] = useState(0.5)
  const control = useMemo(() => createControl(), [])

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: '#0f0f1a' }}>
      <div style={{ height: '420px' }}>
        <Canvas camera={{ position: [2.5, 2, 2.5], fov: 45 }}>
          <Scene control={control} u={u} v={v} />
        </Canvas>
      </div>
      <div style={{ padding: '12px 16px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#6366f1', marginBottom: '4px' }}>u = {u.toFixed(2)} (沿行方向插值)</div>
            <input type="range" min="0" max="1" step="0.01" value={u}
              onChange={(e) => setU(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#f43f5e', marginBottom: '4px' }}>v = {v.toFixed(2)} (沿列方向插值)</div>
            <input type="range" min="0" max="1" step="0.01" value={v}
              onChange={(e) => setV(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#f43f5e' }} />
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.6', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
          <div><span style={{ color: '#6366f1' }}>Step 1:</span> 固定 u={u.toFixed(2)}，对每行 4 个控制点做 Bézier 插值 → 得到 4 个<span style={{ color: '#f43f5e' }}>中间点</span></div>
          <div><span style={{ color: '#f43f5e' }}>Step 2:</span> 对 4 个中间点沿 v={v.toFixed(2)} 方向做 Bézier 插值 → 得到<span style={{ color: '#f59e0b' }}>曲面点 S(u,v)</span></div>
        </div>
      </div>
    </div>
  )
}
