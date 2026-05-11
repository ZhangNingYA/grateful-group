import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * 分形递归可视化
 * Koch Snowflake — 通过递归深度 slider 展示分形的自相似性
 * 2D Canvas 实现
 */

function drawKoch(ctx, x1, y1, x2, y2, depth) {
  if (depth === 0) {
    ctx.lineTo(x2, y2)
    return
  }
  const dx = x2 - x1
  const dy = y2 - y1
  const ax = x1 + dx / 3
  const ay = y1 + dy / 3
  const bx = x1 + dx * 2 / 3
  const by = y1 + dy * 2 / 3
  const px = (ax + bx) / 2 - (by - ay) * Math.sqrt(3) / 2
  const py = (ay + by) / 2 + (bx - ax) * Math.sqrt(3) / 2

  drawKoch(ctx, x1, y1, ax, ay, depth - 1)
  drawKoch(ctx, ax, ay, px, py, depth - 1)
  drawKoch(ctx, px, py, bx, by, depth - 1)
  drawKoch(ctx, bx, by, x2, y2, depth - 1)
}

function KochCanvas({ depth, zoom }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, w, h)

    const cx = w / 2
    const cy = h / 2
    const size = Math.min(w, h) * 0.38 * zoom

    // Equilateral triangle vertices
    const angle = -Math.PI / 2
    const v1 = [cx + size * Math.cos(angle), cy + size * Math.sin(angle)]
    const v2 = [cx + size * Math.cos(angle + 2 * Math.PI / 3), cy + size * Math.sin(angle + 2 * Math.PI / 3)]
    const v3 = [cx + size * Math.cos(angle + 4 * Math.PI / 3), cy + size * Math.sin(angle + 4 * Math.PI / 3)]

    ctx.strokeStyle = '#a78bfa'
    ctx.lineWidth = depth > 4 ? 0.5 : 1.2
    ctx.beginPath()
    ctx.moveTo(v1[0], v1[1])
    drawKoch(ctx, v1[0], v1[1], v2[0], v2[1], depth)
    drawKoch(ctx, v2[0], v2[1], v3[0], v3[1], depth)
    drawKoch(ctx, v3[0], v3[1], v1[0], v1[1], depth)
    ctx.stroke()

    // Draw zoom box hint
    if (zoom > 1) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      const boxSize = 60
      ctx.strokeRect(cx - boxSize, cy - boxSize, boxSize * 2, boxSize * 2)
      ctx.setLineDash([])
    }
  }, [depth, zoom])

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

function getSegmentCount(depth) {
  return 3 * Math.pow(4, depth)
}

export default function FractalRecursionViewer() {
  const [depth, setDepth] = useState(2)
  const [zoom, setZoom] = useState(1)

  const segments = getSegmentCount(depth)

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(167,139,250,0.2)', background: '#0a0a1a' }}>
      <div style={{ height: '360px', position: 'relative' }}>
        <KochCanvas depth={depth} zoom={zoom} />
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'rgba(0,0,0,0.7)', borderRadius: '8px', padding: '8px 12px',
          fontSize: '11px', color: '#a78bfa', fontFamily: 'monospace'
        }}>
          线段数: {segments.toLocaleString()}
        </div>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888', flex: 1, minWidth: '200px' }}>
            <span style={{ minWidth: '70px' }}>递归深度</span>
            <input
              type="range" min="0" max="6" step="1" value={depth}
              onChange={e => setDepth(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: '#a78bfa' }}
              aria-label="递归深度"
            />
            <span style={{ fontFamily: 'monospace', minWidth: '20px', color: '#a78bfa' }}>{depth}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888', flex: 1, minWidth: '200px' }}>
            <span style={{ minWidth: '70px' }}>缩放</span>
            <input
              type="range" min="0.5" max="2.5" step="0.1" value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: '#f59e0b' }}
              aria-label="缩放级别"
            />
            <span style={{ fontFamily: 'monospace', minWidth: '30px', color: '#f59e0b' }}>{zoom.toFixed(1)}x</span>
          </label>
        </div>
        <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
          {depth === 0 && '深度 0：初始等边三角形，3 条线段。'}
          {depth === 1 && '深度 1：每条边中间凸出一个小三角形，线段数 ×4。'}
          {depth === 2 && '深度 2：自相似结构开始显现。'}
          {depth >= 3 && depth <= 4 && '局部放大后，形状和整体一样 — 这就是自相似性。'}
          {depth >= 5 && '深度越高细节越多，但渲染和采样成本急剧增加。高频细节会带来走样问题。'}
        </p>
      </div>
    </div>
  )
}
