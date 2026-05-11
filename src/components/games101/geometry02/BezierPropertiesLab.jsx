import { useRef, useState, useEffect, useCallback } from 'react'
import { sampleBezier, convexHull, subtract, add, scale } from './utils'

const TABS = ['endpoint', 'tangent', 'convexHull', 'affine']
const TAB_LABELS = { endpoint: '端点插值', tangent: '端点切线', convexHull: '凸包性质', affine: '仿射不变性' }

export default function BezierPropertiesLab() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [tab, setTab] = useState('endpoint')
  const [points, setPoints] = useState([
    { x: 80, y: 280 }, { x: 180, y: 60 }, { x: 400, y: 60 }, { x: 500, y: 280 }
  ])
  const [dragging, setDragging] = useState(-1)
  const [size, setSize] = useState({ w: 580, h: 360 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const w = Math.min(entries[0].contentRect.width, 580)
      setSize({ w, h: Math.max(300, w * 0.62) })
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

    const curve = sampleBezier(points, 150)

    // Control polygon
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([5, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // Convex hull
    if (tab === 'convexHull') {
      const hull = convexHull(points)
      if (hull.length >= 3) {
        ctx.beginPath()
        ctx.moveTo(hull[0].x, hull[0].y)
        for (let i = 1; i < hull.length; i++) ctx.lineTo(hull[i].x, hull[i].y)
        ctx.closePath()
        ctx.fillStyle = 'rgba(74,222,128,0.08)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(74,222,128,0.5)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }

    // Affine transformed copy
    if (tab === 'affine') {
      const offset = { x: 60, y: -40 }
      const angle = 0.2
      const cos = Math.cos(angle), sin = Math.sin(angle)
      const center = { x: size.w / 2, y: size.h / 2 }
      const transform = (p) => {
        const dx = p.x - center.x, dy = p.y - center.y
        return { x: center.x + dx * cos - dy * sin + offset.x, y: center.y + dx * sin + dy * cos + offset.y }
      }
      const tPoints = points.map(transform)
      const tCurve = sampleBezier(tPoints, 150)

      // Transformed control polygon
      ctx.beginPath()
      ctx.moveTo(tPoints[0].x, tPoints[0].y)
      for (let i = 1; i < tPoints.length; i++) ctx.lineTo(tPoints[i].x, tPoints[i].y)
      ctx.strokeStyle = 'rgba(244,63,94,0.2)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 3])
      ctx.stroke()
      ctx.setLineDash([])

      // Transformed curve
      ctx.beginPath()
      ctx.moveTo(tCurve[0].x, tCurve[0].y)
      for (let i = 1; i < tCurve.length; i++) ctx.lineTo(tCurve[i].x, tCurve[i].y)
      ctx.strokeStyle = '#f43f5e'
      ctx.lineWidth = 2
      ctx.stroke()

      // Transformed points
      tPoints.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#f43f5e'
        ctx.fill()
      })
    }

    // Main curve
    ctx.beginPath()
    ctx.moveTo(curve[0].x, curve[0].y)
    for (let i = 1; i < curve.length; i++) ctx.lineTo(curve[i].x, curve[i].y)
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 3
    ctx.stroke()

    // Endpoint highlight
    if (tab === 'endpoint') {
      ;[0, 3].forEach(i => {
        ctx.beginPath()
        ctx.arc(points[i].x, points[i].y, 14, 0, Math.PI * 2)
        ctx.strokeStyle = '#4ade80'
        ctx.lineWidth = 2
        ctx.stroke()
      })
      ctx.fillStyle = '#4ade80'
      ctx.font = '11px monospace'
      ctx.fillText('B(0) = P₀ ✓', points[0].x + 16, points[0].y - 4)
      ctx.fillText('B(1) = P₃ ✓', points[3].x + 16, points[3].y - 4)
    }

    // Tangent arrows
    if (tab === 'tangent') {
      const drawArrow = (from, to, color) => {
        const dir = subtract(to, from)
        const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y)
        const norm = { x: dir.x / len, y: dir.y / len }
        const arrowLen = Math.min(len * 0.8, 80)
        const end = { x: from.x + norm.x * arrowLen, y: from.y + norm.y * arrowLen }

        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(end.x, end.y)
        ctx.strokeStyle = color
        ctx.lineWidth = 2.5
        ctx.stroke()

        // Arrowhead
        const headLen = 10
        const angle = Math.atan2(norm.y, norm.x)
        ctx.beginPath()
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(end.x - headLen * Math.cos(angle - 0.4), end.y - headLen * Math.sin(angle - 0.4))
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(end.x - headLen * Math.cos(angle + 0.4), end.y - headLen * Math.sin(angle + 0.4))
        ctx.stroke()
      }
      drawArrow(points[0], points[1], '#4ade80')
      drawArrow(points[3], points[2], '#f59e0b')

      ctx.fillStyle = '#4ade80'
      ctx.font = '11px monospace'
      ctx.fillText("B'(0) = 3(P₁-P₀)", points[0].x + 10, points[0].y + 20)
      ctx.fillStyle = '#f59e0b'
      ctx.fillText("B'(1) = 3(P₃-P₂)", points[3].x - 100, points[3].y + 20)
    }

    // Control points
    points.forEach((p, i) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, i === 0 || i === 3 ? 7 : 6, 0, Math.PI * 2)
      ctx.fillStyle = i === 0 || i === 3 ? '#6366f1' : '#f43f5e'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = '#ccc'
      ctx.font = '10px monospace'
      ctx.fillText(`P${i}`, p.x + 10, p.y - 8)
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
      if (dx * dx + dy * dy < 400) { setDragging(i); canvasRef.current.setPointerCapture(e.pointerId); return }
    }
  }
  const handlePointerMove = (e) => {
    if (dragging < 0) return
    const pos = getPos(e)
    setPoints(prev => { const n = [...prev]; n[dragging] = { x: Math.max(10, Math.min(size.w - 10, pos.x)), y: Math.max(10, Math.min(size.h - 10, pos.y)) }; return n })
  }
  const handlePointerUp = () => setDragging(-1)

  const tabBtnStyle = (active) => ({
    padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
    border: active ? '1px solid #6366f1' : '1px solid #333',
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: active ? '#a5b4fc' : '#888', whiteSpace: 'nowrap',
  })

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: '#0f0f1a' }}>
      <div style={{ padding: '10px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {TABS.map(key => (
          <button key={key} style={tabBtnStyle(tab === key)} onClick={() => setTab(key)}>{TAB_LABELS[key]}</button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block', cursor: dragging >= 0 ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div style={{ padding: '10px 16px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: '#888' }}>
        {tab === 'endpoint' && '曲线一定经过第一个和最后一个控制点：B(0)=P₀, B(1)=P₃'}
        {tab === 'tangent' && '起点切线方向 = P₀→P₁，终点切线方向 = P₂→P₃（反向箭头表示）'}
        {tab === 'convexHull' && '曲线始终位于控制点形成的凸包（绿色区域）内部'}
        {tab === 'affine' && '红色曲线 = 对控制点做旋转+平移后重新生成，等价于直接变换原曲线'}
      </div>
    </div>
  )
}
