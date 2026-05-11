import { useRef, useState, useEffect, useCallback } from 'react'
import { lerpPoint, distance } from './utils'

export default function LinearInterpolationLab() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [t, setT] = useState(0.5)
  const [pointA, setPointA] = useState({ x: 100, y: 250 })
  const [pointB, setPointB] = useState({ x: 460, y: 100 })
  const [dragging, setDragging] = useState(null)
  const [size, setSize] = useState({ w: 560, h: 340 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const w = Math.min(entries[0].contentRect.width, 560)
      setSize({ w, h: Math.max(280, w * 0.6) })
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

    const P = lerpPoint(pointA, pointB, t)

    // Subtle dot grid
    ctx.fillStyle = 'rgba(255,255,255,0.02)'
    for (let gx = 0; gx < size.w; gx += 35) {
      for (let gy = 0; gy < size.h; gy += 35) {
        ctx.beginPath()
        ctx.arc(gx, gy, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Full line A-B (faint)
    ctx.beginPath()
    ctx.moveTo(pointA.x, pointA.y)
    ctx.lineTo(pointB.x, pointB.y)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Segment A-P with gradient feel
    ctx.beginPath()
    ctx.moveTo(pointA.x, pointA.y)
    ctx.lineTo(P.x, P.y)
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.stroke()

    // Segment P-B
    ctx.beginPath()
    ctx.moveTo(P.x, P.y)
    ctx.lineTo(pointB.x, pointB.y)
    ctx.strokeStyle = '#f43f5e'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.stroke()

    // Tick marks along the line
    const total = distance(pointA, pointB)
    const dir = { x: (pointB.x - pointA.x) / total, y: (pointB.y - pointA.y) / total }
    const perp = { x: -dir.y, y: dir.x }
    for (let i = 0; i <= 10; i++) {
      const frac = i / 10
      const px = pointA.x + (pointB.x - pointA.x) * frac
      const py = pointA.y + (pointB.y - pointA.y) * frac
      const tickLen = i === 0 || i === 10 ? 6 : 4
      ctx.beginPath()
      ctx.moveTo(px + perp.x * tickLen, py + perp.y * tickLen)
      ctx.lineTo(px - perp.x * tickLen, py - perp.y * tickLen)
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Point A - glow + main
    ctx.beginPath()
    ctx.arc(pointA.x, pointA.y, 14, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(99,102,241,0.1)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(pointA.x, pointA.y, 9, 0, Math.PI * 2)
    ctx.fillStyle = '#6366f1'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 13px monospace'
    ctx.fillText('A', pointA.x - 24, pointA.y + 5)

    // Point B - glow + main
    ctx.beginPath()
    ctx.arc(pointB.x, pointB.y, 14, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(244,63,94,0.1)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(pointB.x, pointB.y, 9, 0, Math.PI * 2)
    ctx.fillStyle = '#f43f5e'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 13px monospace'
    ctx.fillText('B', pointB.x + 14, pointB.y + 5)

    // Interpolated point P - glow + main
    ctx.beginPath()
    ctx.arc(P.x, P.y, 18, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(245,158,11,0.1)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(P.x, P.y, 11, 0, Math.PI * 2)
    ctx.fillStyle = '#f59e0b'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2.5
    ctx.stroke()
    // Inner dot
    ctx.beginPath()
    ctx.arc(P.x, P.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fill()

    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 13px monospace'
    ctx.fillText('P', P.x + 14, P.y - 10)

    // Percentage labels with background
    const dAP = distance(pointA, P)
    const dPB = distance(P, pointB)
    const midAP = lerpPoint(pointA, P, 0.5)
    const midPB = lerpPoint(P, pointB, 0.5)

    const drawPercentLabel = (pos, text, color) => {
      ctx.font = '11px monospace'
      const w = ctx.measureText(text).width
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(pos.x - w / 2 - 3, pos.y - 20, w + 6, 16)
      ctx.fillStyle = color
      ctx.fillText(text, pos.x - w / 2, pos.y - 8)
    }
    drawPercentLabel(midAP, `${(dAP / total * 100).toFixed(0)}%`, '#a5b4fc')
    drawPercentLabel(midPB, `${(dPB / total * 100).toFixed(0)}%`, '#fda4af')
  }, [pointA, pointB, t, size])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (size.w / rect.width),
      y: (e.clientY - rect.top) * (size.h / rect.height),
    }
  }

  const handlePointerDown = (e) => {
    const pos = getPos(e)
    if (distance(pos, pointA) < 25) { setDragging('A'); canvasRef.current.setPointerCapture(e.pointerId) }
    else if (distance(pos, pointB) < 25) { setDragging('B'); canvasRef.current.setPointerCapture(e.pointerId) }
  }

  const handlePointerMove = (e) => {
    if (!dragging) return
    const pos = getPos(e)
    const clamped = { x: Math.max(20, Math.min(size.w - 20, pos.x)), y: Math.max(20, Math.min(size.h - 20, pos.y)) }
    if (dragging === 'A') setPointA(clamped)
    else setPointB(clamped)
  }

  const handlePointerUp = () => setDragging(null)

  const P = lerpPoint(pointA, pointB, t)

  return (
    <div ref={containerRef} style={{
      width: '100%', borderRadius: '16px', overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.15)',
      background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block', cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>t</span>
          <input type="range" min="0" max="1" step="0.01" value={t}
            onChange={(e) => setT(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#f59e0b' }} />
          <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'monospace', minWidth: '44px', background: 'rgba(245,158,11,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{t.toFixed(2)}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#888', fontFamily: 'monospace', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
          P = <span style={{ color: '#a5b4fc' }}>(1 - {t.toFixed(2)})</span>·A + <span style={{ color: '#fda4af' }}>{t.toFixed(2)}</span>·B
        </div>
        <div style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>
          拖动 <span style={{ color: '#6366f1' }}>●</span> A 和 <span style={{ color: '#f43f5e' }}>●</span> B 改变端点位置
        </div>
      </div>
    </div>
  )
}
