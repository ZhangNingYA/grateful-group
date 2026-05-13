import { useRef, useState, useEffect, useCallback } from 'react'

const VERTS = [
  { x: 150, y: 280, label: 'V0' },
  { x: 350, y: 280, label: 'V1' },
  { x: 250, y: 80, label: 'V2' },
  { x: 450, y: 120, label: 'V3' },
]

const HALF_EDGES = [
  { id: 0, from: 0, to: 1, face: 'F0', twin: 3, next: 1, prev: 2, color: '#6366f1' },
  { id: 1, from: 1, to: 2, face: 'F0', twin: 4, next: 2, prev: 0, color: '#6366f1' },
  { id: 2, from: 2, to: 0, face: 'F0', twin: null, next: 0, prev: 1, color: '#6366f1' },
  { id: 3, from: 1, to: 0, face: 'F1', twin: 0, next: 5, prev: 4, color: '#f43f5e' },
  { id: 4, from: 2, to: 1, face: 'F1', twin: 1, next: 3, prev: 5, color: '#f43f5e' },
  { id: 5, from: 3, to: 2, face: 'F1', twin: null, next: 4, prev: 3, color: '#f43f5e' },
]

// Adjusted positions for half-edges (offset from center of edge)
function getHalfEdgePoints(he, offset = 6) {
  const from = VERTS[he.from], to = VERTS[he.to]
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = -dy / len * offset, ny = dx / len * offset
  return { x1: from.x + nx, y1: from.y + ny, x2: to.x + nx, y2: to.y + ny }
}

export default function HalfEdgeStructureExplainer() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [hovered, setHovered] = useState(null)
  const [size, setSize] = useState({ w: 560, h: 380 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const w = Math.min(entries[0].contentRect.width, 560)
      setSize({ w, h: Math.max(320, w * 0.68) })
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

    // Dot grid
    ctx.fillStyle = 'rgba(255,255,255,0.02)'
    for (let gx = 0; gx < size.w; gx += 35) {
      for (let gy = 0; gy < size.h; gy += 35) {
        ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2); ctx.fill()
      }
    }

    // Face fills
    ctx.beginPath()
    ctx.moveTo(VERTS[0].x, VERTS[0].y); ctx.lineTo(VERTS[1].x, VERTS[1].y); ctx.lineTo(VERTS[2].x, VERTS[2].y)
    ctx.closePath()
    ctx.fillStyle = 'rgba(99,102,241,0.06)'
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(VERTS[1].x, VERTS[1].y); ctx.lineTo(VERTS[3].x, VERTS[3].y); ctx.lineTo(VERTS[2].x, VERTS[2].y)
    ctx.closePath()
    ctx.fillStyle = 'rgba(244,63,94,0.06)'
    ctx.fill()

    // Face labels
    ctx.font = '12px system-ui'
    ctx.fillStyle = 'rgba(99,102,241,0.5)'
    ctx.fillText('F0', 230, 230)
    ctx.fillStyle = 'rgba(244,63,94,0.5)'
    ctx.fillText('F1', 340, 190)

    // Draw half-edges
    for (const he of HALF_EDGES) {
      const pts = getHalfEdgePoints(he)
      const isHov = hovered === he.id
      const isTwin = hovered !== null && HALF_EDGES[hovered]?.twin === he.id
      const isNext = hovered !== null && HALF_EDGES[hovered]?.next === he.id
      const isPrev = hovered !== null && HALF_EDGES[hovered]?.prev === he.id

      let color = he.color + '55'
      let width = 2
      if (isHov) { color = '#f59e0b'; width = 3.5 }
      else if (isTwin) { color = '#4ade80'; width = 3 }
      else if (isNext) { color = '#38bdf8'; width = 3 }
      else if (isPrev) { color = '#c084fc'; width = 3 }

      // Line
      ctx.beginPath()
      ctx.moveTo(pts.x1, pts.y1)
      ctx.lineTo(pts.x2, pts.y2)
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.stroke()

      // Arrow
      const dx = pts.x2 - pts.x1, dy = pts.y2 - pts.y1
      const angle = Math.atan2(dy, dx)
      const ax = pts.x1 + dx * 0.7, ay = pts.y1 + dy * 0.7
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(ax - 10 * Math.cos(angle - 0.35), ay - 10 * Math.sin(angle - 0.35))
      ctx.lineTo(ax - 10 * Math.cos(angle + 0.35), ay - 10 * Math.sin(angle + 0.35))
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
    }

    // Vertices
    for (const v of VERTS) {
      ctx.beginPath()
      ctx.arc(v.x, v.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = '#ccc'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(v.label, v.x - 10, v.y + 22)
    }
  }, [hovered, size])

  const handlePointerMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (size.w / rect.width)
    const my = (e.clientY - rect.top) * (size.h / rect.height)

    let closest = null, minDist = 20
    for (const he of HALF_EDGES) {
      const pts = getHalfEdgePoints(he)
      const cx = (pts.x1 + pts.x2) / 2, cy = (pts.y1 + pts.y2) / 2
      const d = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2)
      if (d < minDist) { minDist = d; closest = he.id }
    }
    setHovered(closest)
  }

  const hoveredHE = hovered !== null ? HALF_EDGES[hovered] : null

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block', cursor: 'crosshair', touchAction: 'none' }}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHovered(null)}
      />
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {hoveredHE ? (
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: '#f59e0b' }}>HE{hoveredHE.id}</span>
            <span style={{ color: '#4ade80' }}>twin: {hoveredHE.twin !== null ? `HE${hoveredHE.twin}` : 'null'}</span>
            <span style={{ color: '#38bdf8' }}>next: HE{hoveredHE.next}</span>
            <span style={{ color: '#c084fc' }}>prev: HE{hoveredHE.prev}</span>
            <span style={{ color: '#aaa' }}>face: {hoveredHE.face}</span>
            <span style={{ color: '#aaa' }}>V{hoveredHE.from}→V{hoveredHE.to}</span>
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: '#666' }}>
            Hover 一条有向边查看 half-edge 的 twin / next / prev / face 关系
          </div>
        )}
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#555', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span><span style={{ color: '#f59e0b' }}>●</span> 当前</span>
          <span><span style={{ color: '#4ade80' }}>●</span> twin</span>
          <span><span style={{ color: '#38bdf8' }}>●</span> next</span>
          <span><span style={{ color: '#c084fc' }}>●</span> prev</span>
        </div>
      </div>
    </div>
  )
}
