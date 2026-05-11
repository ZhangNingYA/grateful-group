import { useRef, useState, useCallback, useEffect } from 'react'
import { sampleBezier } from './utils'

const PRESETS = {
  arch: [
    { x: 80, y: 320 }, { x: 160, y: 80 }, { x: 440, y: 80 }, { x: 520, y: 320 }
  ],
  sCurve: [
    { x: 80, y: 320 }, { x: 200, y: 60 }, { x: 400, y: 340 }, { x: 520, y: 80 }
  ],
  loop: [
    { x: 120, y: 300 }, { x: 500, y: 60 }, { x: 100, y: 60 }, { x: 480, y: 300 }
  ],
  ease: [
    { x: 60, y: 320 }, { x: 200, y: 320 }, { x: 400, y: 80 }, { x: 540, y: 80 }
  ],
}

export default function BezierHeroPlayground() {
  const canvasRef = useRef(null)
  const [points, setPoints] = useState(PRESETS.arch)
  const [dragging, setDragging] = useState(-1)
  const [hovered, setHovered] = useState(-1)
  const [size, setSize] = useState({ w: 600, h: 400 })
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      const w = Math.min(width, 600)
      const h = w * 0.667
      setSize({ w, h })
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

    // Subtle grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    for (let gx = 0; gx < size.w; gx += 30) {
      for (let gy = 0; gy < size.h; gy += 30) {
        ctx.beginPath()
        ctx.arc(gx, gy, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Control polygon with gradient
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([8, 5])
    ctx.stroke()
    ctx.setLineDash([])

    // Bezier curve - glow layer
    const curve = sampleBezier(points, 180)
    ctx.beginPath()
    ctx.moveTo(curve[0].x, curve[0].y)
    for (let i = 1; i < curve.length; i++) ctx.lineTo(curve[i].x, curve[i].y)
    ctx.strokeStyle = 'rgba(99,102,241,0.25)'
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.stroke()

    // Bezier curve - main
    ctx.beginPath()
    ctx.moveTo(curve[0].x, curve[0].y)
    for (let i = 1; i < curve.length; i++) ctx.lineTo(curve[i].x, curve[i].y)
    const grad = ctx.createLinearGradient(points[0].x, points[0].y, points[3].x, points[3].y)
    grad.addColorStop(0, '#818cf8')
    grad.addColorStop(0.5, '#6366f1')
    grad.addColorStop(1, '#a78bfa')
    ctx.strokeStyle = grad
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()

    // Control point connections (P0-P1 and P2-P3 highlighted)
    const drawHandle = (from, to, color) => {
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.setLineDash([])
      ctx.stroke()
    }
    drawHandle(points[0], points[1], 'rgba(99,102,241,0.4)')
    drawHandle(points[2], points[3], 'rgba(99,102,241,0.4)')

    // Control points with glow
    points.forEach((p, i) => {
      const isEndpoint = i === 0 || i === 3
      const isHov = hovered === i || dragging === i
      const baseColor = isEndpoint ? '#6366f1' : '#f43f5e'
      const radius = isHov ? 11 : (isEndpoint ? 8 : 7)

      // Glow
      if (isHov) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius + 6, 0, Math.PI * 2)
        ctx.fillStyle = baseColor + '22'
        ctx.fill()
      }

      // Outer ring
      ctx.beginPath()
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = baseColor
      ctx.fill()
      ctx.strokeStyle = isHov ? '#fff' : 'rgba(255,255,255,0.7)'
      ctx.lineWidth = isHov ? 2.5 : 2
      ctx.stroke()

      // Inner dot
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.fill()

      // Label with background
      const label = `P${i}`
      ctx.font = '11px monospace'
      const lx = p.x + (i < 2 ? -22 : 14)
      const ly = p.y + (i < 2 ? -14 : -14)
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(lx - 2, ly - 10, 22, 14)
      ctx.fillStyle = '#ddd'
      ctx.fillText(label, lx, ly)
    })
  }, [points, size, hovered, dragging])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (size.w / rect.width),
      y: (e.clientY - rect.top) * (size.h / rect.height),
    }
  }

  const handlePointerDown = (e) => {
    const pos = getPos(e)
    for (let i = 0; i < points.length; i++) {
      const dx = pos.x - points[i].x, dy = pos.y - points[i].y
      if (dx * dx + dy * dy < 500) {
        setDragging(i)
        canvasRef.current.setPointerCapture(e.pointerId)
        return
      }
    }
  }

  const handlePointerMove = (e) => {
    const pos = getPos(e)
    if (dragging >= 0) {
      setPoints(prev => {
        const next = [...prev]
        next[dragging] = { x: Math.max(10, Math.min(size.w - 10, pos.x)), y: Math.max(10, Math.min(size.h - 10, pos.y)) }
        return next
      })
    } else {
      // Hover detection
      let found = -1
      for (let i = 0; i < points.length; i++) {
        const dx = pos.x - points[i].x, dy = pos.y - points[i].y
        if (dx * dx + dy * dy < 500) { found = i; break }
      }
      setHovered(found)
    }
  }

  const handlePointerUp = () => setDragging(-1)

  const btnStyle = (active) => ({
    padding: '6px 14px', borderRadius: '8px',
    border: active ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
    color: active ? '#a5b4fc' : '#888', fontSize: '12px', cursor: 'pointer',
    transition: 'all 0.15s',
  })

  return (
    <div ref={containerRef} style={{
      width: '100%', borderRadius: '16px', overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.2)',
      background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
    }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block', cursor: dragging >= 0 ? 'grabbing' : (hovered >= 0 ? 'grab' : 'default'), touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setHovered(-1)}
      />
      <div style={{
        padding: '14px 18px', background: 'rgba(17,17,24,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center',
      }}>
        <span style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>Presets</span>
        <button style={btnStyle(false)} onClick={() => setPoints(PRESETS.arch)}>Arch</button>
        <button style={btnStyle(false)} onClick={() => setPoints(PRESETS.sCurve)}>S Curve</button>
        <button style={btnStyle(false)} onClick={() => setPoints(PRESETS.loop)}>Loop</button>
        <button style={btnStyle(false)} onClick={() => setPoints(PRESETS.ease)}>Ease</button>
        <button style={{ ...btnStyle(false), marginLeft: 'auto', borderColor: 'rgba(244,63,94,0.3)', color: '#f87171' }} onClick={() => setPoints(PRESETS.arch)}>↺ Reset</button>
      </div>
      <div style={{ padding: '8px 18px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
        B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
      </div>
    </div>
  )
}
