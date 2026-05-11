import { useState, useMemo, useCallback } from 'react'

/**
 * Level Set 网格演示 (2D Canvas)
 * 展示离散网格上的标量场和等值线提取
 * 用户可调节 isoValue 和 grid resolution
 */

function LevelSetCanvas({ resolution, isoValue, funcType }) {
  const canvasRef = useCallback((canvas) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    // Clear
    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, w, h)

    const cellW = w / resolution
    const cellH = h / resolution

    // Define scalar field function
    const scalarField = (x, y) => {
      const nx = (x / resolution - 0.5) * 4
      const ny = (y / resolution - 0.5) * 4
      if (funcType === 'circle') {
        return nx * nx + ny * ny - 1
      } else if (funcType === 'saddle') {
        return nx * nx - ny * ny
      } else {
        // Two circles blended
        const d1 = Math.sqrt((nx - 0.8) ** 2 + ny * ny) - 0.7
        const d2 = Math.sqrt((nx + 0.8) ** 2 + ny * ny) - 0.7
        return Math.min(d1, d2)
      }
    }

    // Draw grid cells with color based on field value
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const val = scalarField(i + 0.5, j + 0.5)
        const normalized = Math.max(-2, Math.min(2, val)) / 2

        let r, g, b
        if (val < isoValue) {
          // Inside: blue-purple
          const t = Math.abs(normalized)
          r = Math.floor(30 + t * 60)
          g = Math.floor(20 + t * 30)
          b = Math.floor(80 + t * 100)
        } else {
          // Outside: warm
          const t = Math.abs(normalized)
          r = Math.floor(40 + t * 80)
          g = Math.floor(30 + t * 40)
          b = Math.floor(20 + t * 20)
        }

        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(i * cellW, j * cellH, cellW + 1, cellH + 1)
      }
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= resolution; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellW, 0)
      ctx.lineTo(i * cellW, h)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cellH)
      ctx.lineTo(w, i * cellH)
      ctx.stroke()
    }

    // Draw contour (iso line) using marching squares concept
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2.5
    ctx.beginPath()

    for (let i = 0; i < resolution - 1; i++) {
      for (let j = 0; j < resolution - 1; j++) {
        const v00 = scalarField(i, j) - isoValue
        const v10 = scalarField(i + 1, j) - isoValue
        const v01 = scalarField(i, j + 1) - isoValue
        const v11 = scalarField(i + 1, j + 1) - isoValue

        // Simple contour: check edges for sign changes
        const edges = []

        if (v00 * v10 < 0) {
          const t = v00 / (v00 - v10)
          edges.push([(i + t) * cellW, j * cellH])
        }
        if (v10 * v11 < 0) {
          const t = v10 / (v10 - v11)
          edges.push([(i + 1) * cellW, (j + t) * cellH])
        }
        if (v01 * v11 < 0) {
          const t = v01 / (v01 - v11)
          edges.push([(i + t) * cellW, (j + 1) * cellH])
        }
        if (v00 * v01 < 0) {
          const t = v00 / (v00 - v01)
          edges.push([i * cellW, (j + t) * cellH])
        }

        if (edges.length >= 2) {
          ctx.moveTo(edges[0][0], edges[0][1])
          ctx.lineTo(edges[1][0], edges[1][1])
        }
      }
    }
    ctx.stroke()

    // Draw grid point values for low resolution
    if (resolution <= 16) {
      ctx.font = `${Math.min(10, 80 / resolution)}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
          const val = scalarField(i, j)
          const isNear = Math.abs(val - isoValue) < 0.3
          ctx.fillStyle = isNear ? '#f59e0b' : 'rgba(255,255,255,0.3)'
          if (resolution <= 10) {
            ctx.fillText(val.toFixed(1), i * cellW, j * cellH)
          }
        }
      }
    }

  }, [resolution, isoValue, funcType])

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

export default function LevelSetGridDemo() {
  const [resolution, setResolution] = useState(20)
  const [isoValue, setIsoValue] = useState(0)
  const [funcType, setFuncType] = useState('circle')

  const funcLabels = {
    circle: { label: '圆 (x²+y²−1)', desc: '经典圆形等值线，f=0 是单位圆' },
    saddle: { label: '鞍面 (x²−y²)', desc: '双曲等值线，f=0 是两条对角线' },
    blend: { label: '双圆 min(d₁,d₂)', desc: '两个圆的 SDF 并集，观察拓扑变化' },
  }

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.2)', background: '#0a0a1a' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
        <div style={{ aspectRatio: '1', maxHeight: '400px' }}>
          <LevelSetCanvas resolution={resolution} isoValue={isoValue} funcType={funcType} />
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 500 }}>Level Set 水平集</div>
          <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.8 }}>
            <p style={{ margin: '0 0 8px' }}>将标量场存储在离散网格上，提取 f = isoValue 的等值线。</p>
            <p style={{ margin: '0 0 8px' }}><span style={{ color: '#f59e0b' }}>━━</span> 黄色线 = 等值线 (contour)</p>
            <p style={{ margin: '0 0 8px' }}><span style={{ color: '#3b3b6b' }}>■</span> 蓝紫色 = f &lt; iso (内部)</p>
            <p style={{ margin: '0' }}><span style={{ color: '#5a3a2a' }}>■</span> 暖色 = f &gt; iso (外部)</p>
          </div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '8px', lineHeight: 1.6 }}>
            2D 类比等高线地图；3D 中提取 f=0 等值面即为 Marching Cubes 的输入。
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {Object.entries(funcLabels).map(([key, val]) => (
            <button key={key} onClick={() => setFuncType(key)} style={{ padding: '6px 14px', borderRadius: '100px', border: funcType === key ? '1px solid #f59e0b' : '1px solid #333', background: funcType === key ? 'rgba(245,158,11,0.15)' : 'transparent', color: funcType === key ? '#fbbf24' : '#888', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
              {val.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#888', minWidth: '60px' }}>isoValue</span>
          <input type="range" min="-2" max="2" step="0.1" value={isoValue} onChange={e => setIsoValue(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#f59e0b' }} />
          <span style={{ fontSize: '12px', color: '#fbbf24', fontFamily: 'monospace', minWidth: '36px' }}>{isoValue.toFixed(1)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#888', minWidth: '60px' }}>网格精度</span>
          <input type="range" min="6" max="40" step="2" value={resolution} onChange={e => setResolution(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#f59e0b' }} />
          <span style={{ fontSize: '12px', color: '#fbbf24', fontFamily: 'monospace', minWidth: '36px' }}>{resolution}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          {funcLabels[funcType].desc}
        </div>
      </div>
    </div>
  )
}
