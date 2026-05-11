import { useRef, useState, useEffect, useCallback } from 'react'
import { lerpPoint, distance } from './utils'

export default function LinearInterpolationLab() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [t, setT] = useState(0.5)
  const [pointA, setPointA] = useState({ x: 100, y: 250 })
  const [pointB, setPointB] = useState({ x: 460, y: 100 })
  const [dragging, setDragging] = useState(null) // 'A' | 'B' | null
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

    // Line A-B
    ctx.beginPath()
    ctx.moveTo(pointA.x, pointA.y)
    ctx.lineTo(pointB.x, pointB.y)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Segment A-P (colored)
    ctx.beginPath()
    ctx.moveTo(pointA.x, pointA.y)
    ctx.lineTo(P.x, P.y)
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 3
    ctx.stroke()

    // Segment P-B (colored)
    ctx.beginPath()
    ctx.moveTo(P.x, P.y)
    ctx.lineTo(pointB.x, pointB.y)
    ctx.strokeStyle = '#f43f5e'
    ctx.lineWidth = 3
    ctx.stroke()

    // Point A
    ctx.beginPath()
    ctx.arc(pointA.x, pointA.y, 9, 0, Math.PI * 2)
    ctx.fillStyle = '#6366f1'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px monospace'
    ctx.fillText('A', pointA.x - 20, pointA.y + 4)

    // Point B
    ctx.beginPath()
    ctx.arc(pointB.x, pointB.y, 9, 0, Math.PI * 2)
    ctx.fillStyle = '#f43f5e'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px monospace'
    ctx.fillText('B', pointB.x + 12, pointB.y + 4)

    // Interpolated point P
    ctx.beginPath()
    ctx.arc(P.x, P.y, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#f59e0b'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 12px monospace'
    ctx.fillText('P', P.x + 12, P.y - 8)

    // Distance labels
    const dAP = distance(pointA, P)
    const dPB = distance(P, pointB)
    const total = distance(pointA, pointB)
    ctx.fillStyle = '#888'
    ctx.font = '11px monospace'
    const midAP = lerpPoint(pointA, P, 0.5)
    const midPB = lerpPoint(P, pointB, 0.5)
    ctx.fillText(`${(dAP / total * 100).toFixed(0)}%`, midAP.x, midAP.y - 12)
    ctx.fillText(`${(dPB / total * 100).toFixed(0)}%`, midPB.x, midPB.y - 12)
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
    if (distance(pos, pointA) < 20) { setDragging('A'); canvasRef.current.setPointerCapture(e.pointerId) }
    else if (distance(pos, pointB) < 20) { setDragging('B'); canvasRef.current.setPointerCapture(e.pointerId) }
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
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: '#0f0f1a' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block', cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div style={{ padding: '12px 16px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>t =</span>
          <input type="range" min="0" max="1" step="0.01" value={t}
            onChange={(e) => setT(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#f59e0b' }} />
          <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'monospace', minWidth: '36px' }}>{t.toFixed(2)}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>
          P = (1 - {t.toFixed(2)})·A + {t.toFixed(2)}·B = ({P.x.toFixed(1)}, {P.y.toFixed(1)})
        </div>
        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
          拖动 <span style={{ color: '#6366f1' }}>A</span> 和 <span style={{ color: '#f43f5e' }}>B</span> 改变端点位置
        </div>
      </div>
    </div>
  )
}
