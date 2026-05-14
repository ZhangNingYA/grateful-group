import { useState } from 'react'
import { Header, ObsTask, Slider, Toggle, Status, Pill, panelStyle, sidePanel } from './ui.jsx'

const W = 600, H = 320
const CX = 60, CY = H / 2
const SCALE = 50
const toScreen = (p) => ({ sx: CX + p.x * SCALE, sy: CY - p.y * SCALE })

const OBJECTS = [
  { id: 'A', x: 1.5, y: 0.0, r: 0.5, color: '#6366f1' },
  { id: 'B', x: 3.5, y: -0.4, r: 0.7, color: '#f59e0b' },
  { id: 'C', x: 5.5, y: 0.5, r: 0.6, color: '#f43f5e' },
  { id: 'D', x: 7.5, y: -0.2, r: 0.55, color: '#4ade80' },
]
const LIGHT = { x: 8.5, y: 1.6 }

function intersect(o, d, c, r) {
  const ocx = o.x - c.x, ocy = o.y - c.y
  const a = d.x * d.x + d.y * d.y
  const b = 2 * (ocx * d.x + ocy * d.y)
  const cc = ocx * ocx + ocy * ocy - r * r
  const disc = b * b - 4 * a * cc
  if (disc < 0) return null
  const s = Math.sqrt(disc)
  const t0 = (-b - s) / (2 * a)
  return t0
}

export default function ClosestHitAndVisibilityLab() {
  const [tMin, setTMin] = useState(0)
  const [tMax, setTMax] = useState(8)
  const [angle, setAngle] = useState(0.05)
  const [showAll, setShowAll] = useState(true)
  const [shadowMode, setShadowMode] = useState(false)

  const origin = { x: -0.6, y: 0 }
  const dir = { x: Math.cos(angle), y: Math.sin(angle) }

  // gather all hits
  const hits = OBJECTS.map((obj) => {
    const t = intersect(origin, dir, obj, obj.r)
    return t === null ? null : { obj, t }
  }).filter(Boolean).sort((a, b) => a.t - b.t)

  const validHits = hits.filter((h) => h.t >= tMin && h.t <= tMax)
  const closestHit = validHits[0] || null

  // shadow ray test
  let shadowResult = null
  if (shadowMode && closestHit) {
    const surfacePt = { x: origin.x + dir.x * closestHit.t, y: origin.y + dir.y * closestHit.t }
    // shift slightly out
    const shifted = { x: surfacePt.x + 0.01 * (LIGHT.x - surfacePt.x), y: surfacePt.y + 0.01 * (LIGHT.y - surfacePt.y) }
    const sd = { x: LIGHT.x - shifted.x, y: LIGHT.y - shifted.y }
    const sdLen = Math.hypot(sd.x, sd.y)
    const sdN = { x: sd.x / sdLen, y: sd.y / sdLen }
    let blocker = null
    for (const obj of OBJECTS) {
      if (obj.id === closestHit.obj.id) continue
      const t = intersect(shifted, sdN, obj, obj.r)
      if (t !== null && t > 1e-3 && t < sdLen) {
        if (!blocker || t < blocker.t) blocker = { obj, t }
      }
    }
    shadowResult = { surfacePt, sdLen, blocker }
  }

  const oS = toScreen(origin)
  const rayEnd = { x: origin.x + dir.x * tMax, y: origin.y + dir.y * tMax }
  const reS = toScreen(rayEnd)
  const rayStart = { x: origin.x + dir.x * tMin, y: origin.y + dir.y * tMin }
  const rsS = toScreen(rayStart)

  return (
    <div style={panelStyle}>
      <Header title="Closest Hit · t_min / t_max · Shadow Ray"
        subtitle="一条 ray 命中多个物体时，取最近合法 t 才是 camera 看到的物体。"
        right={<Pill ok={closestHit} label={closestHit ? `closest = ${closestHit.obj.id} @ t=${closestHit.t.toFixed(2)}` : 'no closest'} />}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: '#070710', display: 'block' }}>
          <line x1="0" y1={CY} x2={W} y2={CY} stroke="rgba(255,255,255,0.05)" />

          {/* objects */}
          {OBJECTS.map((obj) => {
            const s = toScreen(obj)
            const isClosest = closestHit?.obj.id === obj.id
            return (
              <g key={obj.id}>
                <circle cx={s.sx} cy={s.sy} r={obj.r * SCALE} fill={obj.color + '22'} stroke={obj.color} strokeWidth={isClosest ? 3 : 1.5} />
                <text x={s.sx} y={s.sy + 4} fill={obj.color} fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="bold">{obj.id}</text>
              </g>
            )
          })}

          {/* full ray (faint) */}
          <line x1={oS.sx} y1={oS.sy} x2={toScreen({ x: origin.x + dir.x * 9, y: origin.y + dir.y * 9 }).sx}
            y2={toScreen({ x: origin.x + dir.x * 9, y: origin.y + dir.y * 9 }).sy}
            stroke="rgba(255,255,255,0.18)" strokeWidth={1} strokeDasharray="3,3" />

          {/* valid t range */}
          <line x1={rsS.sx} y1={rsS.sy} x2={reS.sx} y2={reS.sy} stroke="#fbbf24" strokeWidth={2.5} />

          {/* hit markers */}
          {showAll && hits.map((h, i) => {
            const p = { x: origin.x + dir.x * h.t, y: origin.y + dir.y * h.t }
            const ps = toScreen(p)
            const valid = h.t >= tMin && h.t <= tMax
            return (
              <g key={i}>
                <circle cx={ps.sx} cy={ps.sy} r={6}
                  fill={closestHit?.obj.id === h.obj.id ? '#4ade80' : valid ? '#fde68a' : '#666'}
                  stroke="#fff" strokeWidth={1.2} />
                <text x={ps.sx + 8} y={ps.sy - 8} fill={valid ? '#fde68a' : '#666'} fontSize="10" fontFamily="monospace">
                  t={h.t.toFixed(2)}
                </text>
              </g>
            )
          })}

          {/* origin */}
          <circle cx={oS.sx} cy={oS.sy} r={7} fill="#a5b4fc" stroke="#fff" strokeWidth={1.5} />
          <text x={oS.sx - 14} y={oS.sy + 4} fill="#c7d2fe" fontSize="11" fontFamily="monospace">o</text>

          {/* shadow ray */}
          {shadowMode && shadowResult && (
            <>
              <line
                x1={toScreen(shadowResult.surfacePt).sx} y1={toScreen(shadowResult.surfacePt).sy}
                x2={toScreen(LIGHT).sx} y2={toScreen(LIGHT).sy}
                stroke={shadowResult.blocker ? '#f43f5e' : '#fde68a'} strokeWidth={2} strokeDasharray="4,3"
              />
              <circle cx={toScreen(LIGHT).sx} cy={toScreen(LIGHT).sy} r={6} fill="#fde68a" />
              <text x={toScreen(LIGHT).sx + 8} y={toScreen(LIGHT).sy - 6} fill="#fde68a" fontSize="11" fontFamily="monospace">light</text>
              {shadowResult.blocker && (
                <text x={toScreen(LIGHT).sx - 100} y={toScreen(LIGHT).sy + 18} fill="#f87171" fontSize="11" fontFamily="monospace">in shadow ✗</text>
              )}
            </>
          )}

          {/* tmin / tmax markers */}
          <g>
            <line x1={rsS.sx} y1={rsS.sy - 12} x2={rsS.sx} y2={rsS.sy + 12} stroke="#a5b4fc" strokeWidth={1.5} />
            <text x={rsS.sx} y={rsS.sy - 16} fill="#a5b4fc" fontSize="10" fontFamily="monospace" textAnchor="middle">t_min</text>
            <line x1={reS.sx} y1={reS.sy - 12} x2={reS.sx} y2={reS.sy + 12} stroke="#fda4af" strokeWidth={1.5} />
            <text x={reS.sx} y={reS.sy - 16} fill="#fda4af" fontSize="10" fontFamily="monospace" textAnchor="middle">t_max</text>
          </g>
        </svg>

        <div style={sidePanel}>
          <ObsTask>调整 t_min 和 t_max，看哪些 hit 被排除。打开 shadow ray 模式，从 closest hit 向 light 发射 shadow ray。</ObsTask>

          <Slider label="ray angle" value={angle} min={-0.4} max={0.4} step={0.005} onChange={setAngle} precision={3} color="#fbbf24" />
          <Slider label="t_min" value={tMin} min={0} max={5} step={0.05} onChange={setTMin} color="#a5b4fc" />
          <Slider label="t_max" value={tMax} min={1} max={9} step={0.05} onChange={setTMax} color="#fda4af" />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Toggle active={showAll} onClick={() => setShowAll(!showAll)}>Show all hits</Toggle>
            <Toggle active={shadowMode} onClick={() => setShadowMode(!shadowMode)}>Shadow ray</Toggle>
          </div>

          <Status>
            <div>all hits ({hits.length}): {hits.map((h) => `${h.obj.id}@${h.t.toFixed(2)}`).join(', ') || '—'}</div>
            <div>valid (t∈[t_min,t_max]): {validHits.length}</div>
            <div style={{ marginTop: 4, color: closestHit ? '#4ade80' : '#94a3b8' }}>
              closest: {closestHit ? `${closestHit.obj.id} (t=${closestHit.t.toFixed(3)})` : 'none'}
            </div>
            {shadowMode && shadowResult && (
              <div style={{ marginTop: 4, color: shadowResult.blocker ? '#f87171' : '#fde68a' }}>
                shadow: {shadowResult.blocker ? `blocked by ${shadowResult.blocker.obj.id}` : 'unblocked → lit'}
              </div>
            )}
          </Status>
        </div>
      </div>
    </div>
  )
}
