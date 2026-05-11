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

const COLORS = {
  curve: '#6366f1',
  polygon: 'rgba(255,255,255,0.2)',
  endpoint: '#6366f1',
  control: '#f43f5e',
  label: '#ccc',
  bg: '#0f0f1a',
}

export default function BezierHeroPlayground() {
  const canvasRef = useRef(null)
  const [points, setPoints] = useState(PRESETS.arch)
  const [dragging, setDragging] = useState(-1)
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

  useEffect(() => {
    draw()
  })

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)

    // Control polygon
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.strokeStyle = COLORS.polygon
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // Bezier curve
    const curve = sampleBezier(points, 150)
    ctx.beginPath()
    ctx.moveTo(curve[0].x, curve[0].y)
    for (let i = 1; i < curve.length; i++) {
      ctx.lineTo(curve[i].x, curve[i].y)
    }
    ctx.strokeStyle = COLORS.curve
    ctx.lineWidth = 3
    ctx.stroke()

    // Control points
    points.forEach((p, i) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, i === 0 || i === 3 ? 8 : 7, 0, Math.PI * 2)
      ctx.fillStyle = i === 0 || i === 3 ? COLORS.endpoint : COLORS.control
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Label
      ctx.fillStyle = COLORS.label
      ctx.font = '12px monospace'
      ctx.fillText(`P${i}`, p.x + 12, p.y - 10)
    })
  }, [points, size])

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
      const dx = pos.x - points[i].x
      const dy = pos.y - points[i].y
      if (dx * dx + dy * dy < 400) {
        setDragging(i)
        canvasRef.current.setPointerCapture(e.pointerId)
        return
      }
    }
  }

  const handlePointerMove = (e) => {
    if (dragging < 0) return
    const pos = getPos(e)
    setPoints(prev => {
      const next = [...prev]
      next[dragging] = { x: Math.max(10, Math.min(size.w - 10, pos.x)), y: Math.max(10, Math.min(size.h - 10, pos.y)) }
      return next
    })
  }

  const handlePointerUp = () => {
    setDragging(-1)
  }

  const btnStyle = {
    padding: '5px 12px', borderRadius: '6px', border: '1px solid #333',
    background: 'transparent', color: '#aaa', fontSize: '12px', cursor: 'pointer',
  }

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', background: COLORS.bg }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block', cursor: dragging >= 0 ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div style={{ padding: '12px 16px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#666', marginRight: '4px' }}>预设:</span>
        <button style={btnStyle} onClick={() => setPoints(PRESETS.arch)}>Arch</button>
        <button style={btnStyle} onClick={() => setPoints(PRESETS.sCurve)}>S Curve</button>
        <button style={btnStyle} onClick={() => setPoints(PRESETS.loop)}>Loop</button>
        <button style={btnStyle} onClick={() => setPoints(PRESETS.ease)}>Ease</button>
        <button style={{ ...btnStyle, marginLeft: 'auto', borderColor: '#f43f5e44', color: '#f43f5e' }} onClick={() => setPoints(PRESETS.arch)}>Reset</button>
      </div>
      <div style={{ padding: '8px 16px 12px', fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
        B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
      </div>
    </div>
  )
}
