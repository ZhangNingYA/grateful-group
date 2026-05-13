import { useRef, useState, useEffect, useCallback } from 'react'

// Simulated shadow map: 1 = shadow, 0 = lit
function generateShadowPattern(res) {
  const map = []
  for (let y = 0; y < res; y++) {
    const row = []
    for (let x = 0; x < res; x++) {
      // Create a diagonal shadow edge
      const inShadow = (x + y * 0.6) < res * 0.55
      row.push(inShadow ? 1 : 0)
    }
    map.push(row)
  }
  return map
}

function applyPCF(shadowMap, kernelSize) {
  const res = shadowMap.length
  const result = []
  const half = Math.floor(kernelSize / 2)
  for (let y = 0; y < res; y++) {
    const row = []
    for (let x = 0; x < res; x++) {
      let sum = 0, count = 0
      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const sy = y + ky, sx = x + kx
          if (sy >= 0 && sy < res && sx >= 0 && sx < res) {
            sum += shadowMap[sy][sx]
            count++
          }
        }
      }
      row.push(sum / count)
    }
    result.push(row)
  }
  return result
}

export default function PCFFilteringDemo() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [kernelSize, setKernelSize] = useState(1)
  const [size, setSize] = useState({ w: 560, h: 320 })

  const RES = 32

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

    const shadowMap = generateShadowPattern(RES)
    const filtered = kernelSize > 1 ? applyPCF(shadowMap, kernelSize) : shadowMap

    const gap = 20
    const gridW = (size.w - gap * 3) / 2
    const cellSize = Math.min(gridW / RES, (size.h - 60) / RES)
    const offsetY = 30

    // Labels
    ctx.fillStyle = '#888'
    ctx.font = '11px system-ui'
    ctx.fillText('Hard Shadow (1×1)', gap, 18)
    ctx.fillText(`PCF ${kernelSize}×${kernelSize}`, gap * 2 + gridW, 18)

    // Draw hard shadow
    for (let y = 0; y < RES; y++) {
      for (let x = 0; x < RES; x++) {
        const val = shadowMap[y][x]
        ctx.fillStyle = val > 0.5 ? '#1a1a2e' : '#e2e8f0'
        ctx.fillRect(gap + x * cellSize, offsetY + y * cellSize, cellSize - 0.5, cellSize - 0.5)
      }
    }

    // Draw PCF result
    const ox = gap * 2 + gridW
    for (let y = 0; y < RES; y++) {
      for (let x = 0; x < RES; x++) {
        const val = filtered[y][x]
        const brightness = Math.floor((1 - val) * 220)
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${Math.min(255, brightness + 20)})`
        ctx.fillRect(ox + x * cellSize, offsetY + y * cellSize, cellSize - 0.5, cellSize - 0.5)
      }
    }

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(gap, offsetY, RES * cellSize, RES * cellSize)
    ctx.strokeRect(ox, offsetY, RES * cellSize, RES * cellSize)
  }, [kernelSize, size])

  const kernels = [1, 3, 5, 7]
  const btnStyle = (active) => ({
    padding: '5px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
    border: active ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
    background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
    color: active ? '#a5b4fc' : '#888',
  })

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: size.h, display: 'block' }} />
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: '#666' }}>Kernel:</span>
          {kernels.map(k => (
            <button key={k} style={btnStyle(kernelSize === k)} onClick={() => setKernelSize(k)}>{k}×{k}</button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
            Samples: {kernelSize * kernelSize}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#555' }}>
          PCF 对邻域 texel 分别做 shadow test 再平均 → 边缘从硬变柔
        </div>
      </div>
    </div>
  )
}
