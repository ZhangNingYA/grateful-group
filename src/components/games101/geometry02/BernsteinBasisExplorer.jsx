import { useRef, useState, useEffect, useCallback } from 'react'
import { bernstein3 } from './utils'

const BASIS_COLORS = ['#6366f1', '#f43f5e', '#4ade80', '#f59e0b']
const BASIS_LABELS = ['B₀³(t)', 'B₁³(t)', 'B₂³(t)', 'B₃³(t)']
const POINT_LABELS = ['P₀', 'P₁', 'P₂', 'P₃']

export default function BernsteinBasisExplorer() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [t, setT] = useState(0.5)
  const [size, setSize] = useState({ w: 560, h: 320 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const w = Math.min(entries[0].contentRect.width, 560)
      setSize({ w, h: Math.max(280, w * 0.57) })
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

    const pad = { left: 50, right: 24, top: 24, bottom: 44 }
    const plotW = size.w - pad.left - pad.right
    const plotH = size.h - pad.top - pad.bottom

    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      const y = pad.top + (plotH * i / 4)
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke()
    }
    for (let i = 1; i < 10; i++) {
      const x = pad.left + (plotW * i / 10)
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad.left, pad.top)
    ctx.lineTo(pad.left, pad.top + plotH)
    ctx.lineTo(pad.left + plotW, pad.top + plotH)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = '#555'
    ctx.font = '10px monospace'
    ctx.fillText('1.0', pad.left - 30, pad.top + 5)
    ctx.fillText('0.5', pad.left - 30, pad.top + plotH / 2 + 4)
    ctx.fillText('0', pad.left - 12, pad.top + plotH + 4)
    ctx.fillText('0', pad.left - 2, pad.top + plotH + 16)
    ctx.fillText('0.5', pad.left + plotW / 2 - 8, pad.top + plotH + 16)
    ctx.fillText('1', pad.left + plotW - 4, pad.top + plotH + 16)
    ctx.fillStyle = '#666'
    ctx.fillText('t →', pad.left + plotW / 2 - 8, pad.top + plotH + 32)

    // 0.5 horizontal guide
    ctx.beginPath()
    ctx.moveTo(pad.left, pad.top + plotH / 2)
    ctx.lineTo(pad.left + plotW, pad.top + plotH / 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.setLineDash([4, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // Draw filled area under each basis function (subtle)
    for (let b = 0; b < 4; b++) {
      ctx.beginPath()
      ctx.moveTo(pad.left, pad.top + plotH)
      for (let i = 0; i <= 200; i++) {
        const tt = i / 200
        const val = bernstein3(b, tt)
        const x = pad.left + tt * plotW
        const y = pad.top + plotH - val * plotH
        ctx.lineTo(x, y)
      }
      ctx.lineTo(pad.left + plotW, pad.top + plotH)
      ctx.closePath()
      ctx.fillStyle = BASIS_COLORS[b] + '08'
      ctx.fill()
    }

    // Draw 4 basis function curves
    for (let b = 0; b < 4; b++) {
      ctx.beginPath()
      for (let i = 0; i <= 200; i++) {
        const tt = i / 200
        const val = bernstein3(b, tt)
        const x = pad.left + tt * plotW
        const y = pad.top + plotH - val * plotH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = BASIS_COLORS[b]
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    // Vertical line at current t
    const tx = pad.left + t * plotW
    ctx.beginPath()
    ctx.moveTo(tx, pad.top)
    ctx.lineTo(tx, pad.top + plotH)
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([5, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // Dots at current t with connecting lines
    for (let b = 0; b < 4; b++) {
      const val = bernstein3(b, t)
      const x = tx
      const y = pad.top + plotH - val * plotH

      // Horizontal guide to axis
      ctx.beginPath()
      ctx.moveTo(pad.left, y)
      ctx.lineTo(x, y)
      ctx.strokeStyle = BASIS_COLORS[b] + '30'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.stroke()
      ctx.setLineDash([])

      // Dot glow
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fillStyle = BASIS_COLORS[b] + '20'
      ctx.fill()

      // Dot
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fillStyle = BASIS_COLORS[b]
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // t label at bottom
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 11px monospace'
    ctx.fillText(`t=${t.toFixed(2)}`, tx - 16, pad.top + plotH + 28)
  }, [t, size])

  const weights = [0, 1, 2, 3].map(i => bernstein3(i, t))
  const sum = weights.reduce((a, b) => a + b, 0)

  return (
    <div ref={containerRef} style={{
      width: '100%', borderRadius: '16px', overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.15)',
      background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: size.h, display: 'block' }} />
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>t</span>
          <input type="range" min="0" max="1" step="0.005" value={t}
            onChange={(e) => setT(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#f59e0b' }} />
          <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'monospace', minWidth: '44px', background: 'rgba(245,158,11,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{t.toFixed(3)}</span>
        </div>
        {/* Weight bars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
          {weights.map((w, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: BASIS_COLORS[i], marginBottom: '4px', fontWeight: 500 }}>{BASIS_LABELS[i]}</div>
              <div style={{ height: '48px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: `${w * 100}%`,
                  background: `linear-gradient(180deg, ${BASIS_COLORS[i]}66, ${BASIS_COLORS[i]}22)`,
                  borderTop: `2px solid ${BASIS_COLORS[i]}`,
                  transition: 'height 0.06s ease-out',
                }} />
              </div>
              <div style={{ fontSize: '11px', color: '#bbb', fontFamily: 'monospace', marginTop: '4px' }}>{w.toFixed(3)}</div>
              <div style={{ fontSize: '9px', color: '#555', marginTop: '1px' }}>{POINT_LABELS[i]}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', textAlign: 'center', padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
          Σ B<sub>i</sub>(t) = {sum.toFixed(4)} {Math.abs(sum - 1) < 0.001 ? <span style={{ color: '#4ade80' }}>✓ = 1</span> : ''}
        </div>
      </div>
    </div>
  )
}
