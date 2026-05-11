import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import { useRef, useState, useMemo, useCallback } from 'react'
import * as THREE from 'three'

/**
 * 贝塞尔曲线/曲面演示
 * 用户可以拖拽控制点，实时看到曲线变化
 * 展示显式几何中参数曲线的概念
 */

function bezierPoint(t, p0, p1, p2, p3) {
  const mt = 1 - t
  return [
    mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0],
    mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1],
    0,
  ]
}

function DraggablePoint({ position, onDrag, color = '#fff' }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const { camera, raycaster, size } = useThree()

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation()
    setDragging(true)
    e.target.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerUp = useCallback((e) => {
    setDragging(false)
    e.target.releasePointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return
    e.stopPropagation()

    // Project mouse to XY plane
    const rect = e.target.getBoundingClientRect
    const x = ((e.clientX / size.width) * 2 - 1)
    const y = (-(e.clientY / size.height) * 2 + 1)

    const vec = new THREE.Vector3(x, y, 0.5)
    vec.unproject(camera)
    const dir = vec.sub(camera.position).normalize()
    const dist = -camera.position.z / dir.z
    const pos = camera.position.clone().add(dir.multiplyScalar(dist))

    onDrag([
      Math.max(-3, Math.min(3, pos.x)),
      Math.max(-2, Math.min(2, pos.y)),
    ])
  }, [dragging, camera, size, onDrag])

  return (
    <mesh
      ref={meshRef}
      position={[position[0], position[1], 0]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[hovered || dragging ? 0.12 : 0.09, 16, 16]} />
      <meshBasicMaterial color={dragging ? '#fff' : color} />
    </mesh>
  )
}

function BezierCurve({ points, color = '#6366f1', segments = 80 }) {
  const curvePoints = useMemo(() => {
    const pts = []
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const p = bezierPoint(t, points[0], points[1], points[2], points[3])
      pts.push(new THREE.Vector3(p[0], p[1], p[2]))
    }
    return pts
  }, [points, segments])

  return <Line points={curvePoints} color={color} lineWidth={3} />
}

function ControlLines({ points }) {
  return (
    <>
      <Line
        points={[
          new THREE.Vector3(points[0][0], points[0][1], 0),
          new THREE.Vector3(points[1][0], points[1][1], 0),
        ]}
        color="#555"
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      <Line
        points={[
          new THREE.Vector3(points[2][0], points[2][1], 0),
          new THREE.Vector3(points[3][0], points[3][1], 0),
        ]}
        color="#555"
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
    </>
  )
}

function TParameter({ points, t }) {
  const pos = bezierPoint(t, points[0], points[1], points[2], points[3])
  return (
    <mesh position={[pos[0], pos[1], 0]}>
      <sphereGeometry args={[0.07, 16, 16]} />
      <meshBasicMaterial color="#f59e0b" />
    </mesh>
  )
}

function Scene({ points, setPoints, t }) {
  return (
    <>
      <BezierCurve points={points} />
      <ControlLines points={points} />
      <TParameter points={points} t={t} />

      {points.map((p, i) => (
        <DraggablePoint
          key={i}
          position={p}
          color={i === 0 || i === 3 ? '#6366f1' : '#f43f5e'}
          onDrag={(newPos) => {
            const newPoints = [...points]
            newPoints[i] = newPos
            setPoints(newPoints)
          }}
        />
      ))}

      <OrbitControls enabled={false} />
    </>
  )
}

export default function BezierCurveDemo() {
  const [points, setPoints] = useState([
    [-2, -1],
    [-0.5, 1.5],
    [0.5, -1.5],
    [2, 1],
  ])
  const [t, setT] = useState(0.5)
  const [animating, setAnimating] = useState(false)
  const animRef = useRef(null)

  const startAnimation = () => {
    if (animating) {
      cancelAnimationFrame(animRef.current)
      setAnimating(false)
      return
    }
    setAnimating(true)
    let start = performance.now()
    const animate = (now) => {
      const elapsed = (now - start) / 2000
      setT((elapsed % 1))
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
  }

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', background: '#0a0a1a' }}>
      <div style={{ height: '360px' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} orthographic={false}>
          <Scene points={points} setPoints={setPoints} t={t} />
        </Canvas>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>t =</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={t}
            onChange={(e) => setT(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#f59e0b' }}
          />
          <span style={{ fontSize: '12px', color: '#f59e0b', fontFamily: 'monospace', minWidth: '36px' }}>{t.toFixed(2)}</span>
          <button
            onClick={startAnimation}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: '1px solid #333',
              background: animating ? 'rgba(245,158,11,0.15)' : 'transparent',
              color: animating ? '#f59e0b' : '#888',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {animating ? '⏸' : '▶'}
          </button>
        </div>
        <div style={{ fontSize: '13px', color: '#888' }}>
          拖拽 <span style={{ color: '#6366f1' }}>●</span> 端点和 <span style={{ color: '#f43f5e' }}>●</span> 控制点 — <span style={{ color: '#f59e0b' }}>●</span> 是参数 t 对应的曲线上的点
        </div>
      </div>
    </div>
  )
}
