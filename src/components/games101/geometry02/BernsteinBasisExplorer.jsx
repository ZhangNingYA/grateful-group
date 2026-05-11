import { useRef, useState, useEffect, useCallback } from 'react'
import { bernstein3, deCasteljau, sampleBezier } from './utils'

const BASIS_COLORS = ['#6366f1', '#f43f5e', '#4ade80', '#f59e0b']
const BASIS_LABELS = ['B₀³(t)', 'B₁³(t)', 'B₂³(t)', 'B₃³(t)']

export default function BernsteinBasisExplorer() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [t, setT] = useState(0.5)
  const [size, setSize] = useState({ w: 560, h: 300 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const w = Math.min(entries[0].contentRect.width, 560)
      setSize({ w, h: Math.max(260, w * 0.53) })
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

    const pad = { left: 50, right: 20, top: 20, bottom: 40 }
    const plotW = size.w - pad.left - pad.right
    const plotH = size.h - pad.top - pad.bottom

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad.left, pad.top)
    ctx.lineTo(pad.left, pad.top + plotH)
    ctx.lineTo(pad.left + plotW, pad.top + plotH)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = '#666'
    ctx.font = '10px monospace'
    ctx.fillText('1.0', pad.left - 28, pad.top + 6)
    ctx.fillText('0', pad.left - 12, pad.top + plotH + 4)
    ctx.fillText('0', pad.left - 2, pad.top + plotH + 16)
    ctx.fillText('1', pad.left + plotW - 4, pad.top + plotH + 16)
    ctx.fillText('t', pad.left + plotW / 2, pad.top + plotH + 30)

    // Draw 4 basis functions
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
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Vertical line at current t
    const tx = pad.left + t * plotW
    ctx.beginPath()
    ctx.moveTo(tx, pad.top)
    ctx.lineTo(tx, pad.top + plotH)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 3])
    ctx.stroke()
    ctx.setLineDash([])

    // Dots at current t
    for (let b = 0; b < 4; b++) {
      const val = bernstein3(b, t)
      const x = tx
      const y = pad.top + plotH - val * plotH
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fillStyle = BASIS_COLORS[b]
      ctx.fill()
    }
  }, [t, size])

  const weights = [0, 1, 2, 3].map(i => bernstein3(i, t))
  const sum = weights.reduce((a, b) => a + b, 0)

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: '#0f0f1a' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: size.h, display: 'block' }} />
      <div style={{ padding: '12px 16px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>t =</span>
          <input type="range" min="0" max="1" step="0.005" value={t}
            onChange={(e) => setT(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#f59e0b' }} />
          <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'monospace', minWidth: '36px' }}>{t.toFixed(3)}</span>
        </div>
        {/* Weight bars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
          {weights.map((w, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: BASIS_COLORS[i], marginBottom: '3px' }}>{BASIS_LABELS[i]}</div>
              <div style={{ height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${w * 100}%`, background: BASIS_COLORS[i] + '44', borderTop: `2px solid ${BASIS_COLORS[i]}`, transition: 'height 0.05s' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', marginTop: '2px' }}>{w.toFixed(3)}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', textAlign: 'center' }}>
          Σ weights = {sum.toFixed(4)} {Math.abs(sum - 1) < 0.001 ? '✓' : ''}
        </div>
      </div>
    </div>
  )
}
