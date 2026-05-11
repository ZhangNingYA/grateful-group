import { useRef, useState, useEffect, useCallback } from 'react'

const CURVES = {
  line: { label: 'Line', fn: (t) => ({ x: t, y: t }) },
  circle: { label: 'Circle Arc', fn: (t) => ({ x: Math.cos(t * Math.PI * 1.5), y: Math.sin(t * Math.PI * 1.5) }) },
  quadratic: { label: 'Quadratic', fn: (t) => ({ x: 2 * t - 1, y: 4 * t * (1 - t) - 0.2 }) },
  spiral: { label: 'Spiral', fn: (t) => ({ x: (0.3 + 0.7 * t) * Math.cos(t * Math.PI * 4), y: (0.3 + 0.7 * t) * Math.sin(t * Math.PI * 4) }) },
}

export default function ParametricCurveExplorer() {
  const canvasRef = useRef(null)
  const [t, setT] = useState(0.5)
  const [curveType, setCurveType] = useState('circle')
  const [size, setSize] = useState({ w: 560, h: 360 })
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const w = Math.min(entries[0].contentRect.width, 560)
      setSize({ w, h: Math.max(300, w * 0.64) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => { draw() })

  const toCanvas = useCallback((p) => {
    const cx = size.w / 2, cy = size.h / 2
    const scale = Math.min(size.w, size.h) * 0.35
    return { x: cx + p.x * scale, y: cy - p.y * scale }
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

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    const cx = size.w / 2, cy = size.h / 2
    ctx.beginPath()
    ctx.moveTo(0, cy); ctx.lineTo(size.w, cy)
    ctx.moveTo(cx, 0); ctx.lineTo(cx, size.h)
    ctx.stroke()

    // Full curve (faded)
    ctx.beginPath()
    for (let i = 0; i <= 200; i++) {
      const tt = i / 200
      const p = toCanvas(fn(tt))
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
    ctx.strokeStyle = 'rgba(99,102,241,0.2)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Traced path (0 to t)
    ctx.beginPath()
    const steps = Math.max(2, Math.floor(t * 200))
    for (let i = 0; i <= steps; i++) {
      const tt = (i / steps) * t
      const p = toCanvas(fn(tt))
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 3
    ctx.stroke()

    // Current point
    const current = fn(t)
    const cp = toCanvas(current)
    ctx.beginPath()
    ctx.arc(cp.x, cp.y, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#f59e0b'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Start point
    const sp = toCanvas(fn(0))
    ctx.beginPath()
    ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#4ade80'
    ctx.fill()

    // Labels
    ctx.fillStyle = '#888'
    ctx.font = '11px monospace'
    ctx.fillText('t=0', sp.x + 8, sp.y - 6)
    ctx.fillStyle = '#f59e0b'
    ctx.fillText(`t=${t.toFixed(2)}`, cp.x + 10, cp.y - 10)
  }, [t, curveType, size, toCanvas])

  const btnStyle = (active) => ({
    padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
    border: active ? '1px solid #6366f1' : '1px solid #333',
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: active ? '#a5b4fc' : '#888',
  })

  const current = CURVES[curveType].fn(t)

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: '#0f0f1a' }}>
      <div style={{ padding: '12px 16px 8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {Object.entries(CURVES).map(([key, { label }]) => (
          <button key={key} style={btnStyle(curveType === key)} onClick={() => setCurveType(key)}>{label}</button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block' }}
      />
      <div style={{ padding: '12px 16px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>t =</span>
          <input type="range" min="0" max="1" step="0.005" value={t}
            onChange={(e) => setT(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#f59e0b' }} />
          <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'monospace', minWidth: '40px' }}>{t.toFixed(3)}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>
          p(t) = ( x: {current.x.toFixed(3)}, y: {current.y.toFixed(3)} )
        </div>
      </div>
    </div>
  )
}
