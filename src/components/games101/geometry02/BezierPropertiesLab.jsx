import { useRef, useState, useEffect, useCallback } from 'react'
import { sampleBezier, convexHull, subtract, add, scale, normalize, length } from './utils'

const TABS = ['endpoint', 'tangent', 'convexHull', 'affine']
const TAB_LABELS = { endpoint: '端点插值', tangent: '端点切线', convexHull: '凸包性质', affine: '仿射不变性' }
const TAB_ICONS = { endpoint: '📍', tangent: '➡️', convexHull: '⬡', affine: '🔄' }

export default function BezierPropertiesLab() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [tab, setTab] = useState('endpoint')
  const [points, setPoints] = useState([
    { x: 80, y: 290 }, { x: 180, y: 60 }, { x: 420, y: 60 }, { x: 520, y: 290 }
  ])
  const [dragging, setDragging] = useState(-1)
  const [size, setSize] = useState({ w: 600, h: 380 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const w = Math.min(entries[0].contentRect.width, 600)
      setSize({ w, h: Math.max(320, w * 0.63) })
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

    const curve = sampleBezier(points, 180)

    // Convex hull (draw first, behind everything)
    if (tab === 'convexHull') {
      const hull = convexHull(points)
      if (hull.length >= 3) {
        ctx.beginPath()
        ctx.moveTo(hull[0].x, hull[0].y)
        for (let i = 1; i < hull.length; i++) ctx.lineTo(hull[i].x, hull[i].y)
        ctx.closePath()
        // Gradient fill
        ctx.fillStyle = 'rgba(74,222,128,0.06)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(74,222,128,0.4)'
        ctx.lineWidth = 2
        ctx.setLineDash([6, 4])
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // Affine transformed copy
    if (tab === 'affine') {
      const offset = { x: 50, y: -30 }
      const angle = 0.25
      const cos = Math.cos(angle), sin = Math.sin(angle)
      const center = { x: size.w / 2, y: size.h / 2 }
      const transform = (p) => {
        const dx = p.x - center.x, dy = p.y - center.y
        return { x: center.x + dx * cos - dy * sin + offset.x, y: center.y + dx * sin + dy * cos + offset.y }
      }
      const tPoints = points.map(transform)
      const tCurve = sampleBezier(tPoints, 180)

      // Transformed control polygon
      ctx.beginPath()
      ctx.moveTo(tPoints[0].x, tPoints[0].y)
      for (let i = 1; i < tPoints.length; i++) ctx.lineTo(tPoints[i].x, tPoints[i].y)
      ctx.strokeStyle = 'rgba(244,63,94,0.15)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([5, 4])
      ctx.stroke()
      ctx.setLineDash([])

      // Transformed curve - glow
      ctx.beginPath()
      ctx.moveTo(tCurve[0].x, tCurve[0].y)
      for (let i = 1; i < tCurve.length; i++) ctx.lineTo(tCurve[i].x, tCurve[i].y)
      ctx.strokeStyle = 'rgba(244,63,94,0.15)'
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.stroke()

      // Transformed curve - main
      ctx.beginPath()
      ctx.moveTo(tCurve[0].x, tCurve[0].y)
      for (let i = 1; i < tCurve.length; i++) ctx.lineTo(tCurve[i].x, tCurve[i].y)
      ctx.strokeStyle = '#f43f5e'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.stroke()

      // Transformed points
      tPoints.forEach((p, i) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#f43f5e'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      })

      // Label
      ctx.fillStyle = 'rgba(244,63,94,0.7)'
      ctx.font = '11px system-ui'
      ctx.fillText('旋转+平移后的副本', tPoints[0].x - 10, tPoints[0].y - 16)
    }

    // Control polygon
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // Main curve - glow
    ctx.beginPath()
    ctx.moveTo(curve[0].x, curve[0].y)
    for (let i = 1; i < curve.length; i++) ctx.lineTo(curve[i].x, curve[i].y)
    ctx.strokeStyle = 'rgba(99,102,241,0.2)'
    ctx.lineWidth = 7
    ctx.lineCap = 'round'
    ctx.stroke()

    // Main curve
    ctx.beginPath()
    ctx.moveTo(curve[0].x, curve[0].y)
    for (let i = 1; i < curve.length; i++) ctx.lineTo(curve[i].x, curve[i].y)
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()

    // Endpoint highlight
    if (tab === 'endpoint') {
      ;[0, 3].forEach(i => {
        // Pulsing ring
        ctx.beginPath()
        ctx.arc(points[i].x, points[i].y, 18, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(74,222,128,0.4)'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(points[i].x, points[i].y, 22, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(74,222,128,0.15)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      })
      // Labels
      ctx.font = '11px monospace'
      ctx.fillStyle = '#4ade80'
      ctx.fillText('B(0) = P₀ ✓', points[0].x + 20, points[0].y + 4)
      ctx.fillText('B(1) = P₃ ✓', points[3].x + 20, points[3].y + 4)
    }

    // Tangent arrows
    if (tab === 'tangent') {
      const drawArrow = (from, to, color, label) => {
        const dir = subtract(to, from)
        const len = length(dir)
        if (len < 1) return
        const norm = normalize(dir)
        const arrowLen = Math.min(len * 0.9, 90)
        const end = add(from, scale(norm, arrowLen))

        // Arrow shaft - glow
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(end.x, end.y)
        ctx.strokeStyle = color + '30'
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.stroke()

        // Arrow shaft
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(end.x, end.y)
        ctx.strokeStyle = color
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.stroke()

        // Arrowhead
        const headLen = 12
        const angle = Math.atan2(norm.y, norm.x)
        ctx.beginPath()
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(end.x - headLen * Math.cos(angle - 0.35), end.y - headLen * Math.sin(angle - 0.35))
        ctx.lineTo(end.x - headLen * Math.cos(angle + 0.35), end.y - headLen * Math.sin(angle + 0.35))
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()

        // Label
        ctx.fillStyle = color
        ctx.font = '10px monospace'
        ctx.fillText(label, from.x + (end.x - from.x) * 0.5 - 30, from.y + (end.y - from.y) * 0.5 - 12)
      }
      drawArrow(points[0], points[1], '#4ade80', "B'(0)")
      drawArrow(points[3], points[2], '#f59e0b', "B'(1)")
    }

    // Control points
    points.forEach((p, i) => {
      const isEndpoint = i === 0 || i === 3
      const radius = isEndpoint ? 8 : 7

      // Glow
      ctx.beginPath()
      ctx.arc(p.x, p.y, radius + 5, 0, Math.PI * 2)
      ctx.fillStyle = (isEndpoint ? '#6366f1' : '#f43f5e') + '15'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = isEndpoint ? '#6366f1' : '#f43f5e'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Label
      ctx.font = '10px monospace'
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(p.x + 10, p.y - 16, 20, 14)
      ctx.fillStyle = '#ccc'
      ctx.fillText(`P${i}`, p.x + 12, p.y - 5)
    })
  }, [points, tab, size])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: (e.clientX - rect.left) * (size.w / rect.width), y: (e.clientY - rect.top) * (size.h / rect.height) }
  }

  const handlePointerDown = (e) => {
    const pos = getPos(e)
    for (let i = 0; i < points.length; i++) {
      const dx = pos.x - points[i].x, dy = pos.y - points[i].y
      if (dx * dx + dy * dy < 500) { setDragging(i); canvasRef.current.setPointerCapture(e.pointerId); return }
    }
  }
  const handlePointerMove = (e) => {
    if (dragging < 0) return
    const pos = getPos(e)
    setPoints(prev => { const n = [...prev]; n[dragging] = { x: Math.max(20, Math.min(size.w - 20, pos.x)), y: Math.max(20, Math.min(size.h - 20, pos.y)) }; return n })
  }
  const handlePointerUp = () => setDragging(-1)

  const tabBtnStyle = (active) => ({
    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
    border: active ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.06)',
    background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
    color: active ? '#a5b4fc' : '#888', whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  })

  const descriptions = {
    endpoint: '曲线一定经过首尾控制点：B(0)=P₀, B(1)=P₃。中间控制点只"牵引"曲线。',
    tangent: '起点切线方向 = P₀→P₁（绿色），终点切线方向 = P₂→P₃（橙色，反向显示）。',
    convexHull: '曲线始终位于控制点形成的凸包（虚线区域）内部，不会"跑出去"。',
    affine: '对控制点做旋转+平移后重新生成曲线（红色），等价于直接变换原曲线。',
  }

  return (
    <div ref={containerRef} style={{
      width: '100%', borderRadius: '16px', overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.15)',
      background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      <div style={{ padding: '10px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {TABS.map(key => (
          <button key={key} style={tabBtnStyle(tab === key)} onClick={() => setTab(key)}>
            <span style={{ marginRight: '4px' }}>{TAB_ICONS[key]}</span>{TAB_LABELS[key]}
          </button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block', cursor: dragging >= 0 ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div style={{ padding: '12px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', color: '#aaa', lineHeight: '1.5' }}>
        {descriptions[tab]}
      </div>
    </div>
  )
}
