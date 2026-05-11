import { useRef, useState, useEffect, useCallback } from 'react'

const CURVES = {
  line: { label: 'Line', fn: (t) => ({ x: t, y: t }), color: '#6366f1' },
  circle: { label: 'Circle Arc', fn: (t) => ({ x: Math.cos(t * Math.PI * 1.5), y: Math.sin(t * Math.PI * 1.5) }), color: '#818cf8' },
  quadratic: { label: 'Quadratic', fn: (t) => ({ x: 2 * t - 1, y: 4 * t * (1 - t) - 0.2 }), color: '#a78bfa' },
  spiral: { label: 'Spiral', fn: (t) => ({ x: (0.3 + 0.7 * t) * Math.cos(t * Math.PI * 4), y: (0.3 + 0.7 * t) * Math.sin(t * Math.PI * 4) }), color: '#c084fc' },
}

export default function ParametricCurveExplorer() {
  const canvasRef = useRef(null)
  const [t, setT] = useState(0.5)
  const [curveType, setCurveType] = useState('circle')
  const [size, setSize] = useState({ w: 560, h: 380 })
  const containerRef = useRef(null)

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

  const toCanvas = useCallback((p) => {
    const cx = size.w / 2, cy = size.h / 2
    const s = Math.min(size.w, size.h) * 0.35
    return { x: cx + p.x * s, y: cy - p.y * s }
  }, [size])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)

    const fn = CURVES[curveType].fn
    const curveColor = CURVES[curveType].color
    const cx = size.w / 2, cy = size.h / 2
    const s = Math.min(size.w, size.h) * 0.35

    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    const gridStep = s * 0.5
    for (let gx = cx % gridStep; gx < size.w; gx += gridStep) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, size.h); ctx.stroke()
    }
    for (let gy = cy % gridStep; gy < size.h; gy += gridStep) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(size.w, gy); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, cy); ctx.lineTo(size.w, cy)
    ctx.moveTo(cx, 0); ctx.lineTo(cx, size.h)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '10px monospace'
    ctx.fillText('x', size.w - 14, cy - 6)
    ctx.fillText('y', cx + 6, 14)

    // Full curve (ghost)
    ctx.beginPath()
    for (let i = 0; i <= 300; i++) {
      const tt = i / 300
      const p = toCanvas(fn(tt))
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
    ctx.strokeStyle = curveColor + '20'
    ctx.lineWidth = 3
    ctx.stroke()

    // Traced path (0 to t) - with glow
    const traceSteps = Math.max(4, Math.floor(t * 300))
    ctx.beginPath()
    for (let i = 0; i <= traceSteps; i++) {
      const tt = (i / traceSteps) * t
      const p = toCanvas(fn(tt))
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
    ctx.strokeStyle = curveColor + '30'
    ctx.lineWidth = 7
    ctx.lineCap = 'round'
    ctx.stroke()

    // Traced path - main
    ctx.beginPath()
    for (let i = 0; i <= traceSteps; i++) {
      const tt = (i / traceSteps) * t
      const p = toCanvas(fn(tt))
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
    ctx.strokeStyle = curveColor
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.stroke()

    // Trail dots (fading)
    const trailCount = 8
    for (let i = 0; i < trailCount; i++) {
      const tt = t - (i * 0.02)
      if (tt < 0) break
      const p = toCanvas(fn(tt))
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3 - i * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = curveColor + Math.floor((1 - i / trailCount) * 80).toString(16).padStart(2, '0')
      ctx.fill()
    }

    // Start point
    const sp = toCanvas(fn(0))
    ctx.beginPath()
    ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#4ade80'
    ctx.fill()
    ctx.strokeStyle = 'rgba(74,222,128,0.4)'
    ctx.lineWidth = 3
    ctx.stroke()

    // Current point - glow
    const current = fn(t)
    const cp = toCanvas(current)
    ctx.beginPath()
    ctx.arc(cp.x, cp.y, 14, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(245,158,11,0.12)'
    ctx.fill()

    // Current point
    ctx.beginPath()
    ctx.arc(cp.x, cp.y, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#f59e0b'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2.5
    ctx.stroke()

    // Inner dot
    ctx.beginPath()
    ctx.arc(cp.x, cp.y, 3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fill()

    // Labels
    ctx.font = '11px monospace'
    ctx.fillStyle = 'rgba(74,222,128,0.8)'
    ctx.fillText('t=0', sp.x + 8, sp.y - 8)
    ctx.fillStyle = '#f59e0b'
    ctx.fillText(`t=${t.toFixed(2)}`, cp.x + 12, cp.y - 12)
  }, [t, curveType, size, toCanvas])

  const btnStyle = (active) => ({
    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
    border: active ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
    background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
    color: active ? '#a5b4fc' : '#888',
    transition: 'all 0.15s',
  })

  const current = CURVES[curveType].fn(t)

  return (
    <div ref={containerRef} style={{
      width: '100%', borderRadius: '16px', overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.15)',
      background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      <div style={{ padding: '12px 16px 8px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {Object.entries(CURVES).map(([key, { label }]) => (
          <button key={key} style={btnStyle(curveType === key)} onClick={() => setCurveType(key)}>{label}</button>
        ))}
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: size.h, display: 'block' }} />
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>t</span>
          <input type="range" min="0" max="1" step="0.005" value={t}
            onChange={(e) => setT(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#f59e0b' }} />
          <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'monospace', minWidth: '44px', background: 'rgba(245,158,11,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{t.toFixed(3)}</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontFamily: 'monospace', color: '#888' }}>
          <span>x(t) = <span style={{ color: '#a5b4fc' }}>{current.x.toFixed(3)}</span></span>
          <span>y(t) = <span style={{ color: '#a5b4fc' }}>{current.y.toFixed(3)}</span></span>
        </div>
      </div>
    </div>
  )
}
