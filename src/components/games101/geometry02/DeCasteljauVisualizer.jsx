import { useRef, useState, useEffect, useCallback } from 'react'
import { deCasteljauLevels, sampleBezier } from './utils'

const LEVEL_COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#4ade80']
const LEVEL_NAMES = ['控制点', '第1层', '第2层', '第3层']

const DEFAULT_QUAD = [
  { x: 80, y: 300 }, { x: 280, y: 60 }, { x: 480, y: 300 }
]
const DEFAULT_CUBIC = [
  { x: 60, y: 320 }, { x: 180, y: 60 }, { x: 420, y: 60 }, { x: 540, y: 320 }
]

export default function DeCasteljauVisualizer() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [degree, setDegree] = useState(3)
  const [points, setPoints] = useState(DEFAULT_CUBIC)
  const [t, setT] = useState(0.4)
  const [dragging, setDragging] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const animRef = useRef(null)
  const [size, setSize] = useState({ w: 600, h: 400 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const w = Math.min(entries[0].contentRect.width, 600)
      setSize({ w, h: Math.max(340, w * 0.667) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    setPoints(degree === 2 ? DEFAULT_QUAD : DEFAULT_CUBIC)
  }, [degree])

  useEffect(() => { draw() })

  useEffect(() => {
    if (!playing) return
    let start = performance.now()
    const animate = (now) => {
      const elapsed = (now - start) / 3500
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

    // Subtle dot grid
    ctx.fillStyle = 'rgba(255,255,255,0.02)'
    for (let gx = 0; gx < size.w; gx += 40) {
      for (let gy = 0; gy < size.h; gy += 40) {
        ctx.beginPath()
        ctx.arc(gx, gy, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const levels = deCasteljauLevels(points, t)
    const curve = sampleBezier(points, 180)

    // Full Bezier curve - glow
    ctx.beginPath()
    ctx.moveTo(curve[0].x, curve[0].y)
    for (let i = 1; i < curve.length; i++) ctx.lineTo(curve[i].x, curve[i].y)
    ctx.strokeStyle = 'rgba(99,102,241,0.15)'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.stroke()

    // Full Bezier curve - main
    ctx.beginPath()
    ctx.moveTo(curve[0].x, curve[0].y)
    for (let i = 1; i < curve.length; i++) ctx.lineTo(curve[i].x, curve[i].y)
    ctx.strokeStyle = 'rgba(99,102,241,0.5)'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
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

        if (lvl === 0) {
          ctx.strokeStyle = 'rgba(255,255,255,0.15)'
          ctx.lineWidth = 1.5
          ctx.setLineDash([8, 5])
        } else {
          ctx.strokeStyle = color + '88'
          ctx.lineWidth = 2
          ctx.setLineDash([])
        }
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Points
      for (let i = 0; i < pts.length; i++) {
        const isLast = lvl === levels.length - 1 && pts.length === 1
        const radius = lvl === 0 ? 8 : isLast ? 11 : 6

        // Glow for final point
        if (isLast) {
          ctx.beginPath()
          ctx.arc(pts[i].x, pts[i].y, 18, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(245,158,11,0.12)'
          ctx.fill()
        }

        // Point
        ctx.beginPath()
        ctx.arc(pts[i].x, pts[i].y, radius, 0, Math.PI * 2)
        ctx.fillStyle = isLast ? '#f59e0b' : color
        ctx.fill()

        if (lvl === 0 || isLast) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2.5
          ctx.stroke()
        } else {
          ctx.strokeStyle = color + 'aa'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Labels for level 0
        if (lvl === 0) {
          ctx.font = '12px monospace'
          ctx.fillStyle = 'rgba(0,0,0,0.5)'
          ctx.fillRect(pts[i].x + 10, pts[i].y - 18, 22, 16)
          ctx.fillStyle = '#ddd'
          ctx.fillText(`P${i}`, pts[i].x + 12, pts[i].y - 6)
        }
      }
    }

    // Final point label
    const finalPt = levels[levels.length - 1][0]
    ctx.font = 'bold 12px monospace'
    const labelText = `B(${t.toFixed(2)})`
    const lw = ctx.measureText(labelText).width
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(finalPt.x + 14, finalPt.y - 18, lw + 8, 18)
    ctx.fillStyle = '#f59e0b'
    ctx.fillText(labelText, finalPt.x + 18, finalPt.y - 4)
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
      if (dx * dx + dy * dy < 500) {
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
      next[dragging] = { x: Math.max(20, Math.min(size.w - 20, pos.x)), y: Math.max(20, Math.min(size.h - 20, pos.y)) }
      return next
    })
  }

  const handlePointerUp = () => setDragging(-1)

  const levels = deCasteljauLevels(points, t)

  const btnStyle = (active) => ({
    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
    border: active ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
    background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
    color: active ? '#a5b4fc' : '#888',
    transition: 'all 0.15s',
  })

  return (
    <div ref={containerRef} style={{
      width: '100%', borderRadius: '16px', overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.15)',
      background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      <div style={{ padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Degree</span>
        <button style={btnStyle(degree === 2)} onClick={() => { setDegree(2); setPlaying(false) }}>Quadratic (3点)</button>
        <button style={btnStyle(degree === 3)} onClick={() => { setDegree(3); setPlaying(false) }}>Cubic (4点)</button>
        {/* Legend */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', fontSize: '10px' }}>
          {levels.map((_, idx) => (
            <span key={idx} style={{ color: LEVEL_COLORS[idx], display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: LEVEL_COLORS[idx], display: 'inline-block' }} />
              {LEVEL_NAMES[idx]}
            </span>
          ))}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block', cursor: dragging >= 0 ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>t</span>
          <input type="range" min="0" max="1" step="0.005" value={t}
            onChange={(e) => { setT(parseFloat(e.target.value)); setPlaying(false) }}
            style={{ flex: 1, accentColor: '#f59e0b' }} />
          <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'monospace', minWidth: '44px', background: 'rgba(245,158,11,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{t.toFixed(3)}</span>
          <button
            onClick={() => setPlaying(!playing)}
            style={{
              padding: '5px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
              border: playing ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.1)',
              background: playing ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)',
              color: playing ? '#fbbf24' : '#888',
            }}
          >{playing ? '⏸ Pause' : '▶ Play'}</button>
          <button
            onClick={() => { setT(0); setPlaying(false) }}
            style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#888', fontSize: '12px', cursor: 'pointer' }}
          >Reset</button>
        </div>
        {/* Algorithm steps */}
        <div style={{ fontSize: '11px', lineHeight: '1.8', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ color: '#aaa', marginBottom: '4px', fontWeight: 500 }}>递归插值过程：</div>
          {levels.slice(1).map((lvl, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: LEVEL_COLORS[(idx + 1) % LEVEL_COLORS.length], flexShrink: 0 }} />
              <span style={{ color: LEVEL_COLORS[(idx + 1) % LEVEL_COLORS.length] }}>
                Layer {idx + 1}: {lvl.map((p, i) => `(${p.x.toFixed(0)}, ${p.y.toFixed(0)})`).join('  →  ')}
                {lvl.length === 1 && <span style={{ color: '#f59e0b', fontWeight: 600 }}> ← B(t)</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
