import { useRef, useState, useEffect, useCallback } from 'react'

export default function ShadowDepthComparisonLab() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [fragmentDepth, setFragmentDepth] = useState(0.72)
  const [occluderDepth, setOccluderDepth] = useState(0.45)
  const [bias, setBias] = useState(0.005)
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

    const pad = 40
    const barW = size.w - pad * 2
    const barY = size.h * 0.5
    const barH = 12

    // Depth axis
    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.fillRect(pad, barY - barH/2, barW, barH)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(pad, barY - barH/2, barW, barH)

    // Labels
    ctx.fillStyle = '#555'
    ctx.font = '10px monospace'
    ctx.fillText('0 (near)', pad, barY + barH + 14)
    ctx.fillText('1 (far)', pad + barW - 40, barY + barH + 14)
    ctx.fillText('← Light direction →', pad + barW/2 - 50, barY - barH - 30)

    // Light source
    ctx.beginPath()
    ctx.arc(pad - 10, barY, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#fbbf24'
    ctx.fill()
    ctx.fillStyle = '#fbbf24'
    ctx.font = '10px system-ui'
    ctx.fillText('Light', pad - 20, barY + 22)

    // Occluder position
    const occX = pad + occluderDepth * barW
    ctx.beginPath()
    ctx.moveTo(occX, barY - 30)
    ctx.lineTo(occX, barY + 30)
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = '#6366f1'
    ctx.font = '11px monospace'
    ctx.fillText(`closestDepth = ${occluderDepth.toFixed(3)}`, occX - 60, barY - 36)
    ctx.font = '10px system-ui'
    ctx.fillText('Occluder', occX - 20, barY + 44)

    // Fragment position
    const fragX = pad + fragmentDepth * barW
    ctx.beginPath()
    ctx.arc(fragX, barY, 9, 0, Math.PI * 2)
    const inShadow = (fragmentDepth - bias) > occluderDepth
    ctx.fillStyle = inShadow ? '#f43f5e' : '#4ade80'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = inShadow ? '#f43f5e' : '#4ade80'
    ctx.font = '11px monospace'
    ctx.fillText(`currentDepth = ${fragmentDepth.toFixed(3)}`, fragX - 60, barY - 50)
    ctx.font = '10px system-ui'
    ctx.fillText('Fragment', fragX - 20, barY + 44)

    // Bias indicator
    const biasX = pad + (fragmentDepth - bias) * barW
    ctx.beginPath()
    ctx.moveTo(biasX, barY - 6)
    ctx.lineTo(biasX, barY + 6)
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.setLineDash([3, 2])
    ctx.stroke()
    ctx.setLineDash([])

    // Result
    ctx.font = 'bold 14px system-ui'
    ctx.fillStyle = inShadow ? '#f43f5e' : '#4ade80'
    ctx.fillText(inShadow ? '🌑 SHADOW' : '☀️ LIT', size.w / 2 - 30, size.h - 20)
  }, [fragmentDepth, occluderDepth, bias, size])

  const inShadow = (fragmentDepth - bias) > occluderDepth

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: size.h, display: 'block' }} />
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '3px' }}>Fragment Depth</div>
            <input type="range" min="0.1" max="0.95" step="0.01" value={fragmentDepth}
              onChange={(e) => setFragmentDepth(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#4ade80' }} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '3px' }}>Occluder Depth</div>
            <input type="range" min="0.1" max="0.9" step="0.01" value={occluderDepth}
              onChange={(e) => setOccluderDepth(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '3px' }}>Bias</div>
            <input type="range" min="0" max="0.05" step="0.001" value={bias}
              onChange={(e) => setBias(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }} />
          </div>
        </div>
        <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#aaa', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
          {fragmentDepth.toFixed(3)} - {bias.toFixed(3)} {'>'} {occluderDepth.toFixed(3)} → <span style={{ color: inShadow ? '#f43f5e' : '#4ade80', fontWeight: 600 }}>{inShadow ? 'shadow' : 'lit'}</span>
        </div>
      </div>
    </div>
  )
}
