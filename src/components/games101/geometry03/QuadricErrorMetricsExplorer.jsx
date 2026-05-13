import { useRef, useState, useEffect, useCallback } from 'react'

// Simplified 2D QEM demo: point-to-line distances
const PLANES = [
  { a: 0, b: 1, d: -100, label: 'Plane 1 (horizontal)' },
  { a: 0.7, b: 0.7, d: -250, label: 'Plane 2 (diagonal)' },
  { a: -0.5, b: 0.87, d: -180, label: 'Plane 3 (angled)' },
]

function computeError(x, y, planes) {
  let total = 0
  const dists = []
  for (const p of planes) {
    const d = p.a * x + p.b * y + p.d
    dists.push(d)
    total += d * d
  }
  return { total, dists }
}

export default function QuadricErrorMetricsExplorer() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [candidate, setCandidate] = useState({ x: 260, y: 180 })
  const [dragging, setDragging] = useState(false)
  const [size, setSize] = useState({ w: 520, h: 360 })

  const endpointA = { x: 180, y: 220 }
  const endpointB = { x: 340, y: 140 }
  const midPt = { x: (endpointA.x + endpointB.x) / 2, y: (endpointA.y + endpointB.y) / 2 }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const w = Math.min(entries[0].contentRect.width, 520)
      setSize({ w, h: Math.max(300, w * 0.69) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => { draw() })

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)

    // Draw planes as lines
    const colors = ['#6366f1', '#4ade80', '#f59e0b']
    for (let i = 0; i < PLANES.length; i++) {
      const p = PLANES[i]
      // Draw line: ax + by + d = 0
      ctx.beginPath()
      if (Math.abs(p.b) > 0.01) {
        const y0 = (-p.d - p.a * 0) / p.b
        const y1 = (-p.d - p.a * size.w) / p.b
        ctx.moveTo(0, y0); ctx.lineTo(size.w, y1)
      } else {
        const x0 = -p.d / p.a
        ctx.moveTo(x0, 0); ctx.lineTo(x0, size.h)
      }
      ctx.strokeStyle = colors[i] + '44'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw distance lines from candidate to each plane
    const { total, dists } = computeError(candidate.x, candidate.y, PLANES)
    for (let i = 0; i < PLANES.length; i++) {
      const p = PLANES[i]
      const len = Math.sqrt(p.a * p.a + p.b * p.b)
      const projX = candidate.x - p.a * dists[i] / (len * len)
      const projY = candidate.y - p.b * dists[i] / (len * len)

      ctx.beginPath()
      ctx.moveTo(candidate.x, candidate.y)
      ctx.lineTo(projX, projY)
      ctx.strokeStyle = colors[i]
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 3])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Endpoints A, B
    const drawPt = (pt, label, color) => {
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = color
      ctx.font = '10px monospace'
      ctx.fillText(label, pt.x + 10, pt.y - 6)
    }
    drawPt(endpointA, 'A', '#888')
    drawPt(endpointB, 'B', '#888')
    drawPt(midPt, 'Mid', '#888')

    // Edge
    ctx.beginPath()
    ctx.moveTo(endpointA.x, endpointA.y)
    ctx.lineTo(endpointB.x, endpointB.y)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Candidate point
    ctx.beginPath()
    ctx.arc(candidate.x, candidate.y, 12, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(245,158,11,0.12)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(candidate.x, candidate.y, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#f59e0b'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 11px monospace'
    ctx.fillText('v*', candidate.x + 12, candidate.y - 8)
  }, [candidate, size])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: (e.clientX - rect.left) * (size.w / rect.width), y: (e.clientY - rect.top) * (size.h / rect.height) }
  }

  const handlePointerDown = (e) => {
    const pos = getPos(e)
    const dx = pos.x - candidate.x, dy = pos.y - candidate.y
    if (dx*dx + dy*dy < 600) { setDragging(true); canvasRef.current.setPointerCapture(e.pointerId) }
  }
  const handlePointerMove = (e) => {
    if (!dragging) return
    const pos = getPos(e)
    setCandidate({ x: Math.max(20, Math.min(size.w-20, pos.x)), y: Math.max(20, Math.min(size.h-20, pos.y)) })
  }
  const handlePointerUp = () => setDragging(false)

  const errCandidate = computeError(candidate.x, candidate.y, PLANES).total
  const errA = computeError(endpointA.x, endpointA.y, PLANES).total
  const errB = computeError(endpointB.x, endpointB.y, PLANES).total
  const errMid = computeError(midPt.x, midPt.y, PLANES).total

  const barMax = Math.max(errCandidate, errA, errB, errMid, 1)
  const Bar = ({ label, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
      <span style={{ color: '#888', minWidth: '30px' }}>{label}</span>
      <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${(value/barMax)*100}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.1s' }} />
      </div>
      <span style={{ color, fontFamily: 'monospace', minWidth: '50px' }}>{value.toFixed(0)}</span>
    </div>
  )

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block', cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#888' }}>E(v) = Σ (distance to plane)² — 拖动 <span style={{ color: '#f59e0b' }}>v*</span> 观察误差变化</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Bar label="v*" value={errCandidate} color="#f59e0b" />
          <Bar label="A" value={errA} color="#888" />
          <Bar label="B" value={errB} color="#888" />
          <Bar label="Mid" value={errMid} color="#888" />
        </div>
      </div>
    </div>
  )
}
