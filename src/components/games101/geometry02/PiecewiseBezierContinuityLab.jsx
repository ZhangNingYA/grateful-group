import { useRef, useState, useEffect, useCallback } from 'react'
import { sampleBezier, subtract, add, scale, normalize, length } from './utils'

const MODES = ['broken', 'C0', 'C1', 'G1']

export default function PiecewiseBezierContinuityLab() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [mode, setMode] = useState('C0')
  const [seg1, setSeg1] = useState([
    { x: 50, y: 260 }, { x: 130, y: 80 }, { x: 220, y: 80 }, { x: 290, y: 200 }
  ])
  const [seg2, setSeg2] = useState([
    { x: 290, y: 200 }, { x: 360, y: 320 }, { x: 450, y: 100 }, { x: 540, y: 260 }
  ])
  const [dragging, setDragging] = useState(null) // { seg: 1|2, idx: number }
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

  const enforceConstraint = useCallback((newSeg1, newSeg2, currentMode) => {
    let s1 = [...newSeg1], s2 = [...newSeg2]
    if (currentMode === 'C0' || currentMode === 'C1' || currentMode === 'G1') {
      s2[0] = { ...s1[3] }
    }
    if (currentMode === 'C1') {
      // Q1 - Q0 = P3 - P2 => Q1 = Q0 + (P3 - P2)
      const diff = subtract(s1[3], s1[2])
      s2[1] = add(s2[0], diff)
    }
    if (currentMode === 'G1') {
      // Q1 direction same as P3-P2, but length can differ
      const dir = subtract(s1[3], s1[2])
      const dirLen = length(dir)
      if (dirLen > 0) {
        const q1Dist = length(subtract(s2[1], s2[0]))
        const norm = normalize(dir)
        const actualDist = Math.max(q1Dist, 30)
        s2[1] = add(s2[0], scale(norm, actualDist))
      }
    }
    return [s1, s2]
  }, [])

  const applyMode = (newMode) => {
    setMode(newMode)
    if (newMode === 'broken') return
    const [s1, s2] = enforceConstraint(seg1, seg2, newMode)
    setSeg1(s1)
    setSeg2(s2)
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)

    const curve1 = sampleBezier(seg1, 100)
    const curve2 = sampleBezier(seg2, 100)

    // Control polygons
    const drawPoly = (pts, color) => {
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.setLineDash([4, 3])
      ctx.stroke()
      ctx.setLineDash([])
    }
    drawPoly(seg1, 'rgba(99,102,241,0.3)')
    drawPoly(seg2, 'rgba(244,63,94,0.3)')

    // Curves
    const drawCurve = (pts, color) => {
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.stroke()
    }
    drawCurve(curve1, '#6366f1')
    drawCurve(curve2, '#f43f5e')

    // Junction point
    const jp = seg1[3]
    ctx.beginPath()
    ctx.arc(jp.x, jp.y, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#f59e0b'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Tangent arrows at junction
    if (mode !== 'broken') {
      const drawTangent = (from, to, color) => {
        const dir = subtract(to, from)
        const len = length(dir)
        if (len < 1) return
        const norm = normalize(dir)
        const arrowLen = Math.min(len, 60)
        const end = add(from, scale(norm, arrowLen))
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(end.x, end.y)
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.stroke()
        // arrowhead
        const angle = Math.atan2(norm.y, norm.x)
        ctx.beginPath()
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(end.x - 8 * Math.cos(angle - 0.4), end.y - 8 * Math.sin(angle - 0.4))
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(end.x - 8 * Math.cos(angle + 0.4), end.y - 8 * Math.sin(angle + 0.4))
        ctx.stroke()
      }
      // Left tangent: P2 -> P3
      drawTangent(jp, add(jp, subtract(jp, seg1[2])), '#6366f1')
      // Right tangent: Q0 -> Q1
      drawTangent(jp, seg2[1], '#f43f5e')
    }

    // Control points
    const allPts = [
      ...seg1.map((p, i) => ({ ...p, seg: 1, idx: i })),
      ...seg2.map((p, i) => ({ ...p, seg: 2, idx: i })),
    ]
    allPts.forEach(p => {
      if (p.seg === 2 && p.idx === 0 && mode !== 'broken') return // skip duplicate junction
      ctx.beginPath()
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = p.seg === 1 ? '#6366f1' : '#f43f5e'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    })
  }, [seg1, seg2, mode, size])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: (e.clientX - rect.left) * (size.w / rect.width), y: (e.clientY - rect.top) * (size.h / rect.height) }
  }

  const handlePointerDown = (e) => {
    const pos = getPos(e)
    const check = (pts, seg) => {
      for (let i = 0; i < pts.length; i++) {
        const dx = pos.x - pts[i].x, dy = pos.y - pts[i].y
        if (dx * dx + dy * dy < 300) return { seg, idx: i }
      }
      return null
    }
    const hit = check(seg1, 1) || check(seg2, 2)
    if (hit) { setDragging(hit); canvasRef.current.setPointerCapture(e.pointerId) }
  }

  const handlePointerMove = (e) => {
    if (!dragging) return
    const pos = getPos(e)
    const clamped = { x: Math.max(10, Math.min(size.w - 10, pos.x)), y: Math.max(10, Math.min(size.h - 10, pos.y)) }

    let newSeg1 = [...seg1], newSeg2 = [...seg2]
    if (dragging.seg === 1) newSeg1[dragging.idx] = clamped
    else newSeg2[dragging.idx] = clamped

    if (mode !== 'broken') {
      const [s1, s2] = enforceConstraint(newSeg1, newSeg2, mode)
      setSeg1(s1)
      setSeg2(s2)
    } else {
      setSeg1(newSeg1)
      setSeg2(newSeg2)
    }
  }

  const handlePointerUp = () => setDragging(null)

  // Status
  const posMatch = Math.abs(seg1[3].x - seg2[0].x) < 2 && Math.abs(seg1[3].y - seg2[0].y) < 2
  const tanDir1 = normalize(subtract(seg1[3], seg1[2]))
  const tanDir2 = normalize(subtract(seg2[1], seg2[0]))
  const dot = tanDir1.x * tanDir2.x + tanDir1.y * tanDir2.y
  const dirMatch = dot > 0.99
  const tanVec1 = subtract(seg1[3], seg1[2])
  const tanVec2 = subtract(seg2[1], seg2[0])
  const vecMatch = Math.abs(tanVec1.x - tanVec2.x) < 3 && Math.abs(tanVec1.y - tanVec2.y) < 3

  const btnStyle = (active) => ({
    padding: '5px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
    border: active ? '1px solid #f59e0b' : '1px solid #333',
    background: active ? 'rgba(245,158,11,0.12)' : 'transparent',
    color: active ? '#fbbf24' : '#888',
  })

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: '#0f0f1a' }}>
      <div style={{ padding: '10px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {MODES.map(m => (
          <button key={m} style={btnStyle(mode === m)} onClick={() => applyMode(m)}>{m}</button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.h, display: 'block', cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div style={{ padding: '10px 16px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
          <span style={{ color: posMatch ? '#4ade80' : '#f43f5e' }}>位置连续: {posMatch ? '✓' : '✗'}</span>
          <span style={{ color: dirMatch ? '#4ade80' : '#f43f5e' }}>切线方向: {dirMatch ? '✓' : '✗'}</span>
          <span style={{ color: vecMatch ? '#4ade80' : '#f43f5e' }}>切线长度: {vecMatch ? '✓' : '✗'}</span>
        </div>
        <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
          {mode === 'broken' && '无约束：两段曲线独立，可能不连接'}
          {mode === 'C0' && 'C0: P₃ = Q₀，位置连续但切线可能突变'}
          {mode === 'C1' && 'C1: P₃ = Q₀ 且 P₃-P₂ = Q₁-Q₀，一阶导数连续'}
          {mode === 'G1' && 'G1: 切线方向一致但长度不要求相等，视觉平滑'}
        </div>
      </div>
    </div>
  )
}
