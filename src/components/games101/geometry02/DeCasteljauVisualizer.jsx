import { useRef, useState, useEffect, useCallback } from 'react'
import { deCasteljauLevels, sampleBezier, lerpPoint } from './utils'

const LEVEL_COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#4ade80']

const DEFAULT_QUAD = [
  { x: 80, y: 300 }, { x: 280, y: 60 }, { x: 480, y: 300 }
]
const DEFAULT_CUBIC = [
  { x: 60, y: 310 }, { x: 180, y: 60 }, { x: 400, y: 60 }, { x: 520, y: 310 }
]

export default function DeCasteljauVisualizer() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [degree, setDegree] = useState(3) // 2 or 3
  const [points, setPoints] = useState(DEFAULT_CUBIC)
  const [t, setT] = useState(0.4)
  const [dragging, setDragging] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const animRef = useRef(null)
  const [size, setSize] = useState({ w: 580, h: 380 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const w = Math.min(entries[0].contentRect.width, 580)
      setSize({ w, h: Math.max(320, w * 0.65) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    setPoints(degree === 2 ? DEFAULT_QUAD : DEFAULT_CUBIC)
  }, [degree])

  useEffect(() => { draw() })

  // Animation
  useEffect(() => {
    if (!playing) return
    let start = performance.now()
    const animate = (now) => {
      const elapsed = (now - start) / 3000
      setT(elapsed % 1)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [playing])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)

    const levels = deCasteljauLevels(points, t)
    const curve = sampleBezier(points, 150)

    // Full Bezier curve
    ctx.beginPath()
    ctx.moveTo(curve[0].x, curve[0].y)
    for (let i = 1; i < curve.length; i++) ctx.lineTo(curve[i].x, curve[i].y)
    ctx.strokeStyle = 'rgba(99,102,241,0.3)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw each level
    for (let lvl = 0; lvl < levels.length; lvl++) {
      const pts = levels[lvl]
      const color = LEVEL_COLORS[lvl % LEVEL_COLORS.length]

      // Lines between points at this level
      if (pts.length > 1) {
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
        ctx.strokeStyle = lvl === 0 ? 'rgba(255,255,255,0.2)' : color + '66'
        ctx.lineWidth = lvl === 0 ? 1.5 : 1.5
        ctx.setLineDash(lvl === 0 ? [6, 4] : [])
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Points
      for (let i = 0; i < pts.length; i++) {
        const isLast = lvl === levels.length - 1 && pts.length === 1
        const radius = lvl === 0 ? 7 : isLast ? 9 : 5
        ctx.beginPath()
        ctx.arc(pts[i].x, pts[i].y, radius, 0, Math.PI * 2)
        ctx.fillStyle = isLast ? '#f59e0b' : color
        ctx.fill()
        if (lvl === 0 || isLast) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // Labels for level 0
        if (lvl === 0) {
          ctx.fillStyle = '#ccc'
          ctx.font = '11px monospace'
          ctx.fillText(`P${i}`, pts[i].x + 10, pts[i].y - 8)
        }
      }
    }

    // Final point label
    const finalPt = levels[levels.length - 1][0]
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 11px monospace'
    ctx.fillText(`B(${t.toFixed(2)})`, finalPt.x + 12, finalPt.y - 10)
  }, [points, t, size])

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

  const handlePointerUp = () => setDragging(-1)

  const levels = deCasteljauLevels(points, t)

  const btnStyle = (active) => ({
    padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
    border: active ? '1px solid #6366f1' : '1px solid #333',
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: active ? '#a5b4fc' : '#888',
  })

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: '#0f0f1a' }}>
      <div style={{ padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>阶数:</span>
        <button style={btnStyle(degree === 2)} onClick={() => { setDegree(2); setPlaying(false) }}>Quadratic (3点)</button>
        <button style={btnStyle(degree === 3)} onClick={() => { setDegree(3); setPlaying(false) }}>Cubic (4点)</button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block', cursor: dragging >= 0 ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div style={{ padding: '12px 16px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>t =</span>
          <input type="range" min="0" max="1" step="0.005" value={t}
            onChange={(e) => { setT(parseFloat(e.target.value)); setPlaying(false) }}
            style={{ flex: 1, accentColor: '#f59e0b' }} />
          <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'monospace', minWidth: '36px' }}>{t.toFixed(3)}</span>
          <button
            onClick={() => setPlaying(!playing)}
            style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #333', background: playing ? 'rgba(245,158,11,0.15)' : 'transparent', color: playing ? '#f59e0b' : '#888', fontSize: '12px', cursor: 'pointer' }}
          >{playing ? '⏸' : '▶ Play'}</button>
          <button
            onClick={() => { setT(0); setPlaying(false) }}
            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #333', background: 'transparent', color: '#888', fontSize: '12px', cursor: 'pointer' }}
          >Reset</button>
        </div>
        {/* Algorithm steps */}
        <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.6', marginTop: '4px' }}>
          <div style={{ color: '#aaa', marginBottom: '2px' }}>算法步骤：</div>
          {levels.slice(1).map((lvl, idx) => (
            <div key={idx} style={{ color: LEVEL_COLORS[(idx + 1) % LEVEL_COLORS.length] }}>
              第{idx + 1}层: {lvl.map((p, i) => `(${p.x.toFixed(0)}, ${p.y.toFixed(0)})`).join(' → ')}
              {lvl.length === 1 && ' ← 曲线点 B(t)'}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
