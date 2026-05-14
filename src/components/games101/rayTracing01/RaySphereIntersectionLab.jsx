import { useState } from 'react'
import { Header, ObsTask, Slider, Status, Pill, panelStyle, sidePanel } from './ui.jsx'

const W = 560, H = 320
const CX = W / 2, CY = H / 2
const SCALE = 50

const toScreen = (p) => ({ sx: CX + p.x * SCALE, sy: CY - p.y * SCALE })
const toWorld = (sx, sy) => ({ x: (sx - CX) / SCALE, y: (CY - sy) / SCALE })

function intersect2D(o, d, c, r) {
  const ocx = o.x - c.x, ocy = o.y - c.y
  const a = d.x * d.x + d.y * d.y
  const b = 2 * (ocx * d.x + ocy * d.y)
  const cc = ocx * ocx + ocy * ocy - r * r
  const disc = b * b - 4 * a * cc
  if (disc < 0) return { hit: false, disc, t0: null, t1: null }
  const s = Math.sqrt(disc)
  const t0 = (-b - s) / (2 * a)
  const t1 = (-b + s) / (2 * a)
  return { hit: true, disc, t0, t1, tangent: disc < 1e-6 }
}

export default function RaySphereIntersectionLab() {
  const [origin, setOrigin] = useState({ x: -3, y: 0 })
  const [angle, setAngle] = useState(0.05)
  const [center, setCenter] = useState({ x: 1.0, y: 0.2 })
  const [radius, setRadius] = useState(1.2)
  const [drag, setDrag] = useState(null)

  const dir = { x: Math.cos(angle), y: Math.sin(angle) }
  const res = intersect2D(origin, dir, center, radius)
  const oS = toScreen(origin)
  const cS = toScreen(center)
  const dirHandle = { x: origin.x + dir.x * 1.0, y: origin.y + dir.y * 1.0 }
  const dhS = toScreen(dirHandle)
  const rayEnd = { x: origin.x + dir.x * 8, y: origin.y + dir.y * 8 }
  const reS = toScreen(rayEnd)

  const p0 = res.hit ? { x: origin.x + dir.x * res.t0, y: origin.y + dir.y * res.t0 } : null
  const p1 = res.hit ? { x: origin.x + dir.x * res.t1, y: origin.y + dir.y * res.t1 } : null

  const tNear = res.hit ? (res.t0 > 1e-4 ? res.t0 : res.t1 > 1e-4 ? res.t1 : null) : null
  const status = !res.hit
    ? 'no intersection (Δ < 0)'
    : res.tangent
      ? 'tangent · 1 hit'
      : tNear === null
        ? 'sphere is behind ray origin'
        : 'two hits · near = ' + tNear.toFixed(2)

  const onDown = (which) => (e) => { e.preventDefault(); setDrag(which) }
  const onMove = (e) => {
    if (!drag) return
    const r = e.currentTarget.getBoundingClientRect()
    const sx = ((e.clientX - r.left) / r.width) * W
    const sy = ((e.clientY - r.top) / r.height) * H
    const p = toWorld(sx, sy)
    if (drag === 'origin') setOrigin(p)
    if (drag === 'dir') setAngle(Math.atan2(p.y - origin.y, p.x - origin.x))
    if (drag === 'center') setCenter(p)
  }

  return (
    <div style={panelStyle}>
      <Header title="Ray–Sphere Intersection · 隐式表面求交" subtitle="把 ray 代入球面方程 ‖p−c‖² − r² = 0，得到关于 t 的二次方程。" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', background: '#070710', display: 'block', cursor: drag ? 'grabbing' : 'crosshair' }}
          onMouseMove={onMove}
          onMouseUp={() => setDrag(null)}
          onMouseLeave={() => setDrag(null)}
        >
          <line x1="0" y1={CY} x2={W} y2={CY} stroke="rgba(255,255,255,0.06)" />
          <line x1={CX} y1="0" x2={CX} y2={H} stroke="rgba(255,255,255,0.06)" />

          {/* sphere */}
          <circle cx={cS.sx} cy={cS.sy} r={radius * SCALE} fill="rgba(99,102,241,0.12)" stroke="#6366f1" strokeWidth={1.5} />
          <circle cx={cS.sx} cy={cS.sy} r={3} fill="#a5b4fc" />

          {/* ray */}
          <line x1={oS.sx} y1={oS.sy} x2={reS.sx} y2={reS.sy} stroke="#fbbf24" strokeWidth={2} />

          {p0 && p1 && (
            <>
              <circle cx={toScreen(p0).sx} cy={toScreen(p0).sy} r={6}
                fill={res.t0 > 0 ? '#4ade80' : '#666'} stroke="#fff" strokeWidth={1.2} />
              <text x={toScreen(p0).sx + 8} y={toScreen(p0).sy - 8} fill={res.t0 > 0 ? '#86efac' : '#888'} fontSize="11" fontFamily="monospace">
                t₀={res.t0.toFixed(2)}
              </text>
              <circle cx={toScreen(p1).sx} cy={toScreen(p1).sy} r={6}
                fill={res.t1 > 0 ? '#4ade80' : '#666'} stroke="#fff" strokeWidth={1.2} />
              <text x={toScreen(p1).sx + 8} y={toScreen(p1).sy - 8} fill={res.t1 > 0 ? '#86efac' : '#888'} fontSize="11" fontFamily="monospace">
                t₁={res.t1.toFixed(2)}
              </text>
            </>
          )}

          <g onMouseDown={onDown('center')} style={{ cursor: 'grab' }}>
            <circle cx={cS.sx} cy={cS.sy} r={9} fill="#6366f1" stroke="#fff" strokeWidth={1.5} opacity={0.7} />
            <text x={cS.sx + 12} y={cS.sy + 4} fill="#a5b4fc" fontSize="11" fontFamily="monospace">c</text>
          </g>
          <g onMouseDown={onDown('origin')} style={{ cursor: 'grab' }}>
            <circle cx={oS.sx} cy={oS.sy} r={9} fill="#a5b4fc" stroke="#fff" strokeWidth={1.5} />
            <text x={oS.sx - 18} y={oS.sy + 4} fill="#c7d2fe" fontSize="11" fontFamily="monospace">o</text>
          </g>
          <g onMouseDown={onDown('dir')} style={{ cursor: 'grab' }}>
            <circle cx={dhS.sx} cy={dhS.sy} r={7} fill="#fbbf24" stroke="#fff" strokeWidth={1.2} />
            <text x={dhS.sx + 8} y={dhS.sy - 6} fill="#fde68a" fontSize="11" fontFamily="monospace">d</text>
          </g>
        </svg>

        <div style={sidePanel}>
          <ObsTask>拖动 origin / direction / center，改变 radius，观察 discriminant 在 hit、tangent、miss 三种情况之间切换。</ObsTask>

          <Slider label="radius" value={radius} min={0.3} max={2.4} step={0.05} onChange={setRadius} color="#6366f1" />
          <Slider label="ray angle" value={angle} min={-Math.PI} max={Math.PI} step={0.01} onChange={setAngle} precision={2} color="#fbbf24" />

          <Status>
            <div>discriminant = <b style={{ color: res.disc < 0 ? '#f87171' : '#4ade80' }}>{res.disc.toFixed(3)}</b></div>
            {res.hit && (
              <>
                <div>t₀ = {res.t0.toFixed(3)} {res.t0 > 0 ? <Pill ok label="front" /> : <Pill label="behind" />}</div>
                <div>t₁ = {res.t1.toFixed(3)} {res.t1 > 0 ? <Pill ok label="front" /> : <Pill label="behind" />}</div>
              </>
            )}
            <div style={{ marginTop: 4, color: res.hit && tNear !== null ? '#4ade80' : '#f87171' }}>{status}</div>
          </Status>

          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>
            ‖o + t·d − c‖² − r² = 0<br />→ a t² + b t + c = 0
          </div>
        </div>
      </div>
    </div>
  )
}
