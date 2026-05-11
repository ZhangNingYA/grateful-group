import { useRef, useState, useEffect, useCallback } from 'react'
import { sampleBezier } from './utils'

/**
 * SplineConceptExplorer
 * Demonstrates the difference between a global high-degree Bézier curve
 * and a B-spline-like local control curve.
 * NOTE: The "B-spline-like" mode is a simplified educational demonstration
 * using Catmull-Rom segments, NOT a rigorous B-spline implementation.
 */

function generatePiecewiseCubic(controlPoints) {
  if (controlPoints.length < 4) return []
  const segments = []
  for (let i = 0; i < controlPoints.length - 3; i++) {
    const p0 = controlPoints[i]
    const p1 = controlPoints[i + 1]
    const p2 = controlPoints[i + 2]
    const p3 = controlPoints[i + 3]
    const bp0 = p1
    const bp1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const bp2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    const bp3 = p2
    segments.push(sampleBezier([bp0, bp1, bp2, bp3], 50))
  }
  return segments
}

const DEFAULT_POINTS = [
  { x: 40, y: 200 }, { x: 110, y: 80 }, { x: 200, y: 280 },
  { x: 290, y: 100 }, { x: 380, y: 260 }, { x: 460, y: 120 }, { x: 540, y: 220 }
]

export default function SplineConceptExplorer() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [points, setPoints] = useState(DEFAULT_POINTS)
  const [modeView, setModeView] = useState('local')
  const [dragging, setDragging] = useState(-1)
  const [highlightIdx, setHighlightIdx] = useState(-1)
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

    // Dot grid
    ctx.fillStyle = 'rgba(255,255,255,0.02)'
    for (let gx = 0; gx < size.w; gx += 35) {
      for (let gy = 0; gy < size.h; gy += 35) {
        ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2); ctx.fill()
      }
    }

    if (modeView === 'global') {
      // Global Bezier - glow
      const curve = sampleBezier(points, 250)
      ctx.beginPath()
      ctx.moveTo(curve[0].x, curve[0].y)
      for (let i = 1; i < curve.length; i++) ctx.lineTo(curve[i].x, curve[i].y)
      ctx.strokeStyle = 'rgba(99,102,241,0.2)'
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.stroke()

      // Global Bezier - main
      ctx.beginPath()
      ctx.moveTo(curve[0].x, curve[0].y)
      for (let i = 1; i < curve.length; i++) ctx.lineTo(curve[i].x, curve[i].y)
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.stroke()

      // "All affected" indicator
      if (highlightIdx >= 0) {
        ctx.fillStyle = 'rgba(244,63,94,0.06)'
        ctx.fillRect(0, 0, size.w, size.h)
        ctx.fillStyle = 'rgba(244,63,94,0.7)'
        ctx.font = '12px system-ui'
        ctx.fillText('⚠ 整条曲线都受影响', 16, 24)
      }
    } else {
      // Local support region highlight (soft area)
      if (highlightIdx >= 0) {
        const startIdx = Math.max(0, highlightIdx - 2)
        const endIdx = Math.min(points.length - 1, highlightIdx + 2)
        const leftX = points[startIdx].x - 20
        const rightX = points[endIdx].x + 20

        // Gradient region
        const grad = ctx.createLinearGradient(leftX, 0, rightX, 0)
        grad.addColorStop(0, 'rgba(245,158,11,0)')
        grad.addColorStop(0.15, 'rgba(245,158,11,0.06)')
        grad.addColorStop(0.5, 'rgba(245,158,11,0.08)')
        grad.addColorStop(0.85, 'rgba(245,158,11,0.06)')
        grad.addColorStop(1, 'rgba(245,158,11,0)')
        ctx.fillStyle = grad
        ctx.fillRect(leftX, 0, rightX - leftX, size.h)

        // Border lines
        ctx.beginPath()
        ctx.moveTo(leftX + 20, 0); ctx.lineTo(leftX + 20, size.h)
        ctx.moveTo(rightX - 20, 0); ctx.lineTo(rightX - 20, size.h)
        ctx.strokeStyle = 'rgba(245,158,11,0.15)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.setLineDash([])

        // Label
        ctx.fillStyle = 'rgba(245,158,11,0.7)'
        ctx.font = '11px system-ui'
        ctx.fillText('局部影响区域', leftX + 24, 20)
      }

      // Piecewise local curve
      const segments = generatePiecewiseCubic(points)
      segments.forEach((seg, idx) => {
        const isNear = highlightIdx >= 0 && Math.abs(idx - (highlightIdx - 1)) <= 1

        // Glow for affected segments
        if (isNear) {
          ctx.beginPath()
          ctx.moveTo(seg[0].x, seg[0].y)
          for (let i = 1; i < seg.length; i++) ctx.lineTo(seg[i].x, seg[i].y)
          ctx.strokeStyle = 'rgba(245,158,11,0.2)'
          ctx.lineWidth = 6
          ctx.lineCap = 'round'
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.moveTo(seg[0].x, seg[0].y)
        for (let i = 1; i < seg.length; i++) ctx.lineTo(seg[i].x, seg[i].y)
        ctx.strokeStyle = isNear ? '#f59e0b' : '#6366f1'
        ctx.lineWidth = isNear ? 3 : 2.5
        ctx.lineCap = 'round'
        ctx.stroke()
      })
    }

    // Control polygon
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // Points
    points.forEach((p, i) => {
      const isHighlight = i === highlightIdx
      const radius = isHighlight ? 10 : 6

      // Glow
      if (isHighlight) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 18, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(245,158,11,0.12)'
        ctx.fill()
      }

      ctx.beginPath()
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = isHighlight ? '#f59e0b' : '#6366f1'
      ctx.fill()
      ctx.strokeStyle = isHighlight ? '#fff' : 'rgba(255,255,255,0.6)'
      ctx.lineWidth = isHighlight ? 2.5 : 1.5
      ctx.stroke()

      // Index label
      if (isHighlight) {
        ctx.fillStyle = '#f59e0b'
        ctx.font = '10px monospace'
        ctx.fillText(`P${i}`, p.x + 14, p.y - 8)
      }
    })
  }, [points, modeView, highlightIdx, size])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: (e.clientX - rect.left) * (size.w / rect.width), y: (e.clientY - rect.top) * (size.h / rect.height) }
  }

  const handlePointerDown = (e) => {
    const pos = getPos(e)
    for (let i = 0; i < points.length; i++) {
      const dx = pos.x - points[i].x, dy = pos.y - points[i].y
      if (dx * dx + dy * dy < 500) {
        setDragging(i)
        setHighlightIdx(i)
        canvasRef.current.setPointerCapture(e.pointerId)
        return
      }
    }
  }

  const handlePointerMove = (e) => {
    if (dragging < 0) return
    const pos = getPos(e)
    setPoints(prev => {
      const n = [...prev]
      n[dragging] = { x: Math.max(10, Math.min(size.w - 10, pos.x)), y: Math.max(10, Math.min(size.h - 10, pos.y)) }
      return n
    })
  }

  const handlePointerUp = () => setDragging(-1)

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
      <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap' }}>
        <button style={btnStyle(modeView === 'global')} onClick={() => setModeView('global')}>Global Bézier</button>
        <button style={btnStyle(modeView === 'local')} onClick={() => setModeView('local')}>Local Control</button>
        <button style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#888', fontSize: '11px', cursor: 'pointer' }}
          onClick={() => { setPoints(DEFAULT_POINTS); setHighlightIdx(-1) }}>↺ Reset</button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block', cursor: dragging >= 0 ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div style={{ padding: '12px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>
          {modeView === 'global'
            ? <><span style={{ color: '#f43f5e' }}>全局 Bézier</span>：拖动任意控制点，<strong>整条曲线</strong>都会变化</>
            : <><span style={{ color: '#4ade80' }}>局部控制</span>：拖动一个控制点，只有<strong>附近的曲线段</strong>受影响</>
          }
        </div>
        <div style={{ fontSize: '11px', color: '#555', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
          ⚠️ 教学演示：Local Control 模式使用 Catmull-Rom 近似展示 B-spline 局部控制思想
        </div>
      </div>
    </div>
  )
}
