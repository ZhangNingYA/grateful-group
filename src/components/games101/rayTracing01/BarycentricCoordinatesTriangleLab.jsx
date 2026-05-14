import { useState } from 'react'
import { barycentric2D } from './rayUtils.js'
import { Header, ObsTask, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

const W = 480, H = 340
const CX = W / 2, CY = H / 2 + 20
const SCALE = 80
const toScreen = (p) => ({ sx: CX + p.x * SCALE, sy: CY - p.y * SCALE })
const toWorld = (sx, sy) => ({ x: (sx - CX) / SCALE, y: (CY - sy) / SCALE })

const VERT_COLORS = ['#f43f5e', '#4ade80', '#6366f1']

export default function BarycentricCoordinatesTriangleLab() {
  const [tri] = useState([
    { x: -1.4, y: -0.9 },
    { x: 1.5, y: -0.9 },
    { x: 0.0, y: 1.4 },
  ])
  const [p, setP] = useState({ x: 0.1, y: 0.05 })
  const [mode, setMode] = useState('color') // color | barycentric | inside
  const [drag, setDrag] = useState(false)

  const r = barycentric2D(p, tri[0], tri[1], tri[2])
  const u = r.u, vC = r.vCoord, w = r.w
  const inside = r.inside

  // failing condition
  let failReason = ''
  if (!inside) {
    if (u < 0) failReason = 'u < 0 (在 p0p1 边外)'
    else if (vC < 0) failReason = 'v < 0 (在 p0p2 边外)'
    else if (w < 0) failReason = 'w = 1−u−v < 0 (在 p1p2 边外)'
  }

  const onMouseDown = () => setDrag(true)
  const onMouseUp = () => setDrag(false)
  const onMove = (e) => {
    if (!drag) return
    const r = e.currentTarget.getBoundingClientRect()
    const sx = ((e.clientX - r.left) / r.width) * W
    const sy = ((e.clientY - r.top) / r.height) * H
    setP(toWorld(sx, sy))
  }

  // mix barycentric color
  const mixColor = () => {
    const cs = [
      { r: 244, g: 63, b: 94 },
      { r: 74, g: 222, b: 128 },
      { r: 99, g: 102, b: 241 },
    ]
    const cw = inside ? [w, u, vC] : [Math.max(0, w), Math.max(0, u), Math.max(0, vC)]
    const sum = cw[0] + cw[1] + cw[2] || 1
    const cn = cw.map((x) => x / sum)
    const r = Math.round(cs[0].r * cn[0] + cs[1].r * cn[1] + cs[2].r * cn[2])
    const g = Math.round(cs[0].g * cn[0] + cs[1].g * cn[1] + cs[2].g * cn[2])
    const b = Math.round(cs[0].b * cn[0] + cs[1].b * cn[1] + cs[2].b * cn[2])
    return `rgb(${r},${g},${b})`
  }

  // mode visualization fill
  let triFill = 'rgba(99,102,241,0.08)'
  if (mode === 'inside') triFill = inside ? 'rgba(74,222,128,0.16)' : 'rgba(244,63,94,0.08)'

  const pS = toScreen(p)

  return (
    <div style={panelStyle}>
      <Header title="Barycentric Coordinates · 内部判断 + 属性插值" subtitle="拖动点观察 (u, v, w)。内部条件：u, v, w ≥ 0。" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', background: '#070710', display: 'block', cursor: drag ? 'grabbing' : 'crosshair' }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onMouseMove={onMove}
        >
          {/* axis */}
          <line x1="0" y1={CY} x2={W} y2={CY} stroke="rgba(255,255,255,0.05)" />
          <line x1={CX} y1="0" x2={CX} y2={H} stroke="rgba(255,255,255,0.05)" />

          {/* triangle fill */}
          <polygon points={tri.map((p) => `${toScreen(p).sx},${toScreen(p).sy}`).join(' ')}
            fill={triFill} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />

          {/* vertices */}
          {tri.map((tv, i) => (
            <g key={i}>
              <circle cx={toScreen(tv).sx} cy={toScreen(tv).sy} r={9} fill={VERT_COLORS[i]} stroke="#fff" strokeWidth={1.4} />
              <text x={toScreen(tv).sx + 10} y={toScreen(tv).sy + 4}
                fill={VERT_COLORS[i]} fontSize="11" fontFamily="monospace">
                {i === 0 ? 'p₀ (w)' : i === 1 ? 'p₁ (u)' : 'p₂ (v)'}
              </text>
            </g>
          ))}

          {/* edges to point: weights visualization */}
          {mode === 'barycentric' && tri.map((tv, i) => {
            const tvS = toScreen(tv)
            const weight = i === 0 ? w : i === 1 ? u : vC
            return (
              <line key={i} x1={tvS.sx} y1={tvS.sy} x2={pS.sx} y2={pS.sy}
                stroke={VERT_COLORS[i]}
                strokeWidth={Math.max(0.3, weight) * 5}
                strokeOpacity={0.5}
              />
            )
          })}

          {/* point */}
          <g onMouseDown={onMouseDown} style={{ cursor: 'grab' }}>
            <circle cx={pS.sx} cy={pS.sy} r={9}
              fill={mode === 'color' ? mixColor() : inside ? '#4ade80' : '#f43f5e'}
              stroke="#fff" strokeWidth={1.5} />
            <text x={pS.sx + 12} y={pS.sy - 8} fill="#fff" fontSize="11" fontFamily="monospace">p</text>
          </g>
        </svg>

        <div style={sidePanel}>
          <ObsTask>拖动 p。在 color 模式下，p 的颜色由 (u, v, w) 加权混合三个顶点颜色。</ObsTask>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Toggle active={mode === 'color'} onClick={() => setMode('color')}>Color blend</Toggle>
            <Toggle active={mode === 'barycentric'} onClick={() => setMode('barycentric')}>Weights</Toggle>
            <Toggle active={mode === 'inside'} onClick={() => setMode('inside')}>Inside test</Toggle>
          </div>

          <Status>
            <div style={{ color: VERT_COLORS[0] }}>w (p₀) = {w.toFixed(3)}</div>
            <div style={{ color: VERT_COLORS[1] }}>u (p₁) = {u.toFixed(3)}</div>
            <div style={{ color: VERT_COLORS[2] }}>v (p₂) = {vC.toFixed(3)}</div>
            <div style={{ marginTop: 4 }}>sum = {(u + vC + w).toFixed(3)}</div>
            <div style={{ marginTop: 4, color: inside ? '#4ade80' : '#f87171' }}>
              {inside ? 'inside triangle ✓' : 'outside · ' + failReason}
            </div>
          </Status>

          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', lineHeight: 1.5 }}>
            p = w·p₀ + u·p₁ + v·p₂<br />
            inside ⇔ u ≥ 0, v ≥ 0, w ≥ 0
          </div>
        </div>
      </div>
    </div>
  )
}
