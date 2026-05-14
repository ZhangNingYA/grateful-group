import { useState } from 'react'
import { barycentric2D } from './rayUtils.js'
import { Header, ObsTask, Slider, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

const W = 560, H = 320
const CX = W / 2, CY = H / 2
const SCALE = 50
const toScreen = (p) => ({ sx: CX + p.x * SCALE, sy: CY - p.y * SCALE })
const toWorld = (sx, sy) => ({ x: (sx - CX) / SCALE, y: (CY - sy) / SCALE })

export default function RayPlaneAndTriangleLab() {
  const [origin, setOrigin] = useState({ x: -3.5, y: -1.2 })
  const [angle, setAngle] = useState(0.35)
  const [tri, setTri] = useState([
    { x: -0.5, y: -0.8 },
    { x: 1.5, y: -0.5 },
    { x: 0.6, y: 1.4 },
  ])
  const [drag, setDrag] = useState(null)
  const [showInsideRule, setShowInsideRule] = useState('bary') // 'bary' | 'edge' | 'side'

  const dir = { x: Math.cos(angle), y: Math.sin(angle) }

  // 2D plane = the line through tri[0] tri[1] (we treat the page as the plane)
  // Actually treat the triangle as 2D. plane intersection = always within page since 2D.
  // We compute t such that ray hits the line passing through edge of triangle's "centroid plane"
  // But the more useful demo: treat triangle as 2D shape, ray as 2D ray, find intersection with the
  // *infinite plane containing the triangle*. In 2D this plane is just the same plane (page).
  //
  // To still demonstrate "ray-plane vs ray-triangle", we project the demo:
  // - The triangle is drawn in 2D.
  // - We pretend the "plane" is the line through (centroid, perpendicular).
  // Simpler: we cast the ray, find first intersection with bounding line of triangle's edges? No.
  //
  // Better: treat the triangle as 2D, the "plane" is the page itself. The ray
  // finds the *closest* edge line and shows the plane intersection point with that edge line.
  // But this complicates things.
  //
  // Cleanest: keep "plane" = the infinite line containing edge p0->p1, normal perpendicular.
  // - Show ray-plane t.
  // - Show point on plane.
  // - Then check inside triangle using barycentric.

  // plane: line through tri[0] perpendicular to normal n = perp(tri[1]-tri[0])
  const e01 = { x: tri[1].x - tri[0].x, y: tri[1].y - tri[0].y }
  const normal = { x: -e01.y, y: e01.x }
  const nLen = Math.hypot(normal.x, normal.y) || 1
  const nUnit = { x: normal.x / nLen, y: normal.y / nLen }

  const denom = dir.x * nUnit.x + dir.y * nUnit.y
  const isParallel = Math.abs(denom) < 1e-6
  const numerator = (tri[0].x - origin.x) * nUnit.x + (tri[0].y - origin.y) * nUnit.y
  const tPlane = isParallel ? null : numerator / denom

  let hitPoint = null
  let bary = null
  let inside = false
  if (tPlane !== null && tPlane > 0) {
    hitPoint = { x: origin.x + dir.x * tPlane, y: origin.y + dir.y * tPlane }
    bary = barycentric2D(hitPoint, tri[0], tri[1], tri[2])
    inside = bary.inside
  }

  const oS = toScreen(origin)
  const dh = { x: origin.x + dir.x, y: origin.y + dir.y }
  const dhS = toScreen(dh)
  const rayEnd = { x: origin.x + dir.x * 9, y: origin.y + dir.y * 9 }
  const reS = toScreen(rayEnd)

  const onDown = (which) => (e) => { e.preventDefault(); setDrag(which) }
  const onMove = (e) => {
    if (!drag) return
    const r = e.currentTarget.getBoundingClientRect()
    const sx = ((e.clientX - r.left) / r.width) * W
    const sy = ((e.clientY - r.top) / r.height) * H
    const p = toWorld(sx, sy)
    if (drag === 'origin') setOrigin(p)
    if (drag === 'dir') setAngle(Math.atan2(p.y - origin.y, p.x - origin.x))
    if (drag && drag.startsWith('v')) {
      const i = parseInt(drag.slice(1))
      setTri((t) => t.map((tv, idx) => idx === i ? p : tv))
    }
  }

  // plane line
  const ptOnPlane = tri[0]
  const planeDir = { x: -nUnit.y, y: nUnit.x }
  const planeStart = { x: ptOnPlane.x - planeDir.x * 5, y: ptOnPlane.y - planeDir.y * 5 }
  const planeEnd = { x: ptOnPlane.x + planeDir.x * 5, y: ptOnPlane.y + planeDir.y * 5 }
  const psS = toScreen(planeStart)
  const peS = toScreen(planeEnd)

  const ruleText = showInsideRule === 'bary'
    ? 'Barycentric: u, v ≥ 0 且 u + v ≤ 1'
    : showInsideRule === 'edge'
      ? 'Edge function: 三个边方程同号'
      : 'Same-side test: 点在每条边的同一侧'

  return (
    <div style={panelStyle}>
      <Header title="Ray–Plane & Ray–Triangle" subtitle="第一步：和三角形所在平面求交。第二步：交点是否在三角形内部。" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', background: '#070710', display: 'block', cursor: drag ? 'grabbing' : 'crosshair' }}
          onMouseMove={onMove}
          onMouseUp={() => setDrag(null)}
          onMouseLeave={() => setDrag(null)}
        >
          {/* plane (line p0->p1 extended) */}
          <line x1={psS.sx} y1={psS.sy} x2={peS.sx} y2={peS.sy} stroke="rgba(99,102,241,0.4)" strokeDasharray="6,4" strokeWidth={1.5} />
          <text x={peS.sx - 60} y={peS.sy - 10} fill="#a5b4fc" fontSize="10" fontFamily="monospace">plane (edge p0p1 extended)</text>

          {/* triangle */}
          <polygon points={tri.map((p) => `${toScreen(p).sx},${toScreen(p).sy}`).join(' ')}
            fill={inside ? 'rgba(74,222,128,0.18)' : 'rgba(244,63,94,0.08)'}
            stroke={inside ? '#4ade80' : '#f43f5e'} strokeWidth={2} />

          {/* ray */}
          <line x1={oS.sx} y1={oS.sy} x2={reS.sx} y2={reS.sy} stroke="#fbbf24" strokeWidth={2} />

          {/* hit on plane */}
          {hitPoint && (
            <>
              <circle cx={toScreen(hitPoint).sx} cy={toScreen(hitPoint).sy} r={7}
                fill={inside ? '#4ade80' : '#f43f5e'} stroke="#fff" strokeWidth={1.5} />
              <text x={toScreen(hitPoint).sx + 10} y={toScreen(hitPoint).sy - 8} fill="#fff" fontSize="11" fontFamily="monospace">
                {inside ? 'inside ✓' : 'plane hit, outside ✗'}
              </text>
            </>
          )}

          {/* triangle vertex handles */}
          {tri.map((p, i) => (
            <g key={i} onMouseDown={onDown(`v${i}`)} style={{ cursor: 'grab' }}>
              <circle cx={toScreen(p).sx} cy={toScreen(p).sy} r={8} fill="#6366f1" stroke="#fff" strokeWidth={1.2} />
              <text x={toScreen(p).sx + 10} y={toScreen(p).sy + 4} fill="#a5b4fc" fontSize="11" fontFamily="monospace">p{i}</text>
            </g>
          ))}

          <g onMouseDown={onDown('origin')} style={{ cursor: 'grab' }}>
            <circle cx={oS.sx} cy={oS.sy} r={9} fill="#a5b4fc" stroke="#fff" strokeWidth={1.5} />
            <text x={oS.sx - 18} y={oS.sy + 4} fill="#c7d2fe" fontSize="11" fontFamily="monospace">o</text>
          </g>
          <g onMouseDown={onDown('dir')} style={{ cursor: 'grab' }}>
            <circle cx={dhS.sx} cy={dhS.sy} r={7} fill="#fbbf24" stroke="#fff" strokeWidth={1.2} />
          </g>
        </svg>

        <div style={sidePanel}>
          <ObsTask>拖动 ray、direction 或 triangle 顶点。注意：plane hit 不等于 triangle hit！</ObsTask>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Toggle active={showInsideRule === 'bary'} onClick={() => setShowInsideRule('bary')}>Barycentric</Toggle>
            <Toggle active={showInsideRule === 'edge'} onClick={() => setShowInsideRule('edge')}>Edge fn</Toggle>
            <Toggle active={showInsideRule === 'side'} onClick={() => setShowInsideRule('side')}>Same side</Toggle>
          </div>
          <div style={{ fontSize: 10, color: '#888', lineHeight: 1.5 }}>{ruleText}</div>

          <Status>
            <div>denom = d·n = {isParallel ? <span style={{ color: '#f87171' }}>~ 0 (parallel)</span> : denom.toFixed(3)}</div>
            <div>t = {tPlane === null ? '—' : tPlane.toFixed(3)}</div>
            {hitPoint && (
              <>
                <div>plane hit at ({hitPoint.x.toFixed(2)}, {hitPoint.y.toFixed(2)})</div>
                <div style={{ marginTop: 4 }}>bary u = {bary.u.toFixed(2)}, v = {bary.vCoord.toFixed(2)}</div>
              </>
            )}
            <div style={{ marginTop: 4, color: inside ? '#4ade80' : isParallel ? '#f87171' : '#fbbf24' }}>
              {isParallel ? 'parallel: no plane hit' : tPlane === null || tPlane <= 0 ? 'plane behind ray' : inside ? 'final: HIT triangle ✓' : 'final: miss triangle ✗'}
            </div>
          </Status>
        </div>
      </div>
    </div>
  )
}
