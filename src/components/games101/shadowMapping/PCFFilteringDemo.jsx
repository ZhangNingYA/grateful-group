import { useRef, useState, useEffect, useCallback } from 'react'
import { Header, ObsTask, Slider, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

const RES = 48

function generateShadowMap(seed) {
  const map = []
  // Make an irregular boundary (not a straight diagonal) so the soft edge looks real
  for (let y = 0; y < RES; y++) {
    const row = []
    for (let x = 0; x < RES; x++) {
      // sinusoidal boundary
      const boundary = RES * 0.55 + Math.sin(y / 6 + seed) * 4 + Math.sin(y / 3 + seed * 2) * 2
      const dist = (x + y * 0.5) - boundary
      // hard binary
      const inShadow = dist < 0
      row.push(inShadow ? 1 : 0)
    }
    map.push(row)
  }
  return map
}

function pcfBlur(map, k) {
  const half = Math.floor(k / 2)
  const out = []
  for (let y = 0; y < RES; y++) {
    const row = []
    for (let x = 0; x < RES; x++) {
      let sum = 0, count = 0
      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          const yy = y + dy, xx = x + dx
          if (yy >= 0 && yy < RES && xx >= 0 && xx < RES) {
            sum += map[yy][xx]
            count++
          }
        }
      }
      row.push(sum / count)
    }
    out.push(row)
  }
  return out
}

function drawMap(ctx, map, x0, y0, cell) {
  for (let y = 0; y < RES; y++) {
    for (let x = 0; x < RES; x++) {
      const v = map[y][x]
      const b = Math.round((1 - v) * 220) + 18
      ctx.fillStyle = `rgb(${b}, ${b}, ${Math.min(255, b + 14)})`
      ctx.fillRect(x0 + x * cell, y0 + y * cell, Math.max(1, cell - 0.5), Math.max(1, cell - 0.5))
    }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1
  ctx.strokeRect(x0, y0, RES * cell, RES * cell)
}

export default function PCFFilteringDemo() {
  const canvasRef = useRef(null)
  const [kernel, setKernel] = useState(3)
  const [seed, setSeed] = useState(1.2)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = 300
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const hard = generateShadowMap(seed)
    const filtered = kernel === 1 ? hard : pcfBlur(hard, kernel)

    const pad = 18
    const gap = 14
    const cell = Math.min((w - pad * 2 - gap) / 2 / RES, (h - 50) / RES)
    const off = (w - (RES * cell * 2 + gap)) / 2
    const top = 36

    ctx.fillStyle = '#a5b4fc'
    ctx.font = '11px system-ui'
    ctx.fillText('Hard Shadow (1×1)', off, 26)
    ctx.fillStyle = '#fda4af'
    ctx.fillText(`PCF ${kernel}×${kernel}`, off + RES * cell + gap, 26)

    drawMap(ctx, hard, off, top, cell)
    drawMap(ctx, filtered, off + RES * cell + gap, top, cell)

    // Mark a single texel where we'd "evaluate" PCF
    const fx = Math.floor(RES * 0.5)
    const fy = Math.floor(RES * 0.45)
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    const half = Math.floor(kernel / 2)
    ctx.strokeRect(off + RES * cell + gap + (fx - half) * cell, top + (fy - half) * cell, kernel * cell, kernel * cell)
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(off + RES * cell + gap + (fx + 0.5) * cell, top + (fy + 0.5) * cell, 3, 0, Math.PI * 2)
    ctx.fill()
  }, [kernel, seed])

  useEffect(() => {
    draw()
    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [draw])

  const samples = kernel * kernel

  return (
    <div style={panelStyle}>
      <Header
        title="PCF · Percentage-Closer Filtering"
        subtitle={'对邻域 texel 分别做 shadow test，再平均结果。注意是过滤"比较结果"，不是过滤深度。'}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <div style={{ background: '#070710', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: 300, display: 'block' }} />
          <div style={{ padding: '10px 16px', fontSize: 11, color: '#888', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            黄框 = kernel 邻域；黄点 = 当前 fragment 对应的 shadow map texel。kernel 越大边缘越柔，但成本 ∝ k²。
          </div>
        </div>
        <div style={sidePanel}>
          <ObsTask>1×1 看硬阴影边缘锯齿；7×7 看光滑过渡。注意 PCF 不是物理软阴影 —— 软化程度与 blocker 距离无关。</ObsTask>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[1, 3, 5, 7, 9].map((k) => (
              <Toggle key={k} active={kernel === k} onClick={() => setKernel(k)}>{k}×{k}</Toggle>
            ))}
          </div>

          <Slider label="boundary seed" value={seed} min={0} max={6.28} step={0.05} onChange={setSeed} color="#a5b4fc" precision={2} />

          <Status>
            <div>kernel: {kernel}×{kernel}</div>
            <div>samples per fragment: {samples}</div>
            <div style={{ marginTop: 4, color: '#fbbf24' }}>
              成本相对 hard 的 {samples}× 倍纹理读取
            </div>
          </Status>

          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', lineHeight: 1.6 }}>
{`shadow = 0;
for dy in [-h, h]:
  for dx in [-h, h]:
    closest = sm[uv + (dx,dy)*texel];
    shadow += current - bias > closest;
shadow /= k * k;`}
          </div>
        </div>
      </div>
    </div>
  )
}
