import { useState } from 'react'
import { Header, ObsTask, Slider, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

const W = 560, H = 320
const ORIGIN_X = W / 2, ORIGIN_Y = H / 2
const SCALE = 60 // 1 unit -> 60 px

function toScreen(p) {
  return { sx: ORIGIN_X + p.x * SCALE, sy: ORIGIN_Y - p.y * SCALE }
}
function toWorld(sx, sy) {
  return { x: (sx - ORIGIN_X) / SCALE, y: (ORIGIN_Y - sy) / SCALE }
}

function Arrow({ from, to, color }) {
  const dx = to.sx - from.sx, dy = to.sy - from.sy
  const len = Math.hypot(dx, dy)
  if (len < 1) return null
  const ux = dx / len, uy = dy / len
  const ax = to.sx - ux * 12, ay = to.sy - uy * 12
  const px = -uy, py = ux
  return (
    <polygon
      points={`${to.sx},${to.sy} ${ax + px * 6},${ay + py * 6} ${ax - px * 6},${ay - py * 6}`}
      fill={color}
    />
  )
}

export default function RayEquationExplorer() {
  const [origin, setOrigin] = useState({ x: -1.5, y: -0.5 })
  const [angle, setAngle] = useState(0.6)
  const [t, setT] = useState(1.5)
  const [normalized, setNormalized] = useState(true)
  const [showNeg, setShowNeg] = useState(true)
  const [showComp, setShowComp] = useState(true)
  const [drag, setDrag] = useState(null)

  const dirRaw = { x: Math.cos(angle), y: Math.sin(angle) }
  const dirLen = normalized ? 1 : 1.4
  const dir = { x: dirRaw.x * dirLen, y: dirRaw.y * dirLen }

  const rt = { x: origin.x + t * dir.x, y: origin.y + t * dir.y }
  const negEnd = { x: origin.x - 4 * dir.x, y: origin.y - 4 * dir.y }
  const posEnd = { x: origin.x + 6 * dir.x, y: origin.y + 6 * dir.y }
  const dirHandle = { x: origin.x + dir.x, y: origin.y + dir.y }

  const onDown = (which) => (e) => { e.preventDefault(); setDrag(which) }

  const onMove = (e) => {
    if (!drag) return
    const r = e.currentTarget.getBoundingClientRect()
    const sx = ((e.clientX - r.left) / r.width) * W
    const sy = ((e.clientY - r.top) / r.height) * H
    const p = toWorld(sx, sy)
    if (drag === 'origin') setOrigin(p)
    if (drag === 'dir') setAngle(Math.atan2(p.y - origin.y, p.x - origin.x))
  }

  const oS = toScreen(origin), rtS = toScreen(rt), negS = toScreen(negEnd), posS = toScreen(posEnd), dhS = toScreen(dirHandle)

  return (
    <div style={panelStyle}>
      <Header title="Ray Equation · r(t) = o + t·d" subtitle="拖动 origin / direction handle，滑动 t 观察 r(t) 的位置。" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', background: '#070710', display: 'block', cursor: drag ? 'grabbing' : 'crosshair' }}
          onMouseMove={onMove}
          onMouseUp={() => setDrag(null)}
          onMouseLeave={() => setDrag(null)}
        >
          <line x1="0" y1={ORIGIN_Y} x2={W} y2={ORIGIN_Y} stroke="rgba(255,255,255,0.08)" />
          <line x1={ORIGIN_X} y1="0" x2={ORIGIN_X} y2={H} stroke="rgba(255,255,255,0.08)" />
          {Array.from({ length: 11 }).map((_, i) => {
            const v = -5 + i
            const xs = ORIGIN_X + v * SCALE
            const ys = ORIGIN_Y - v * SCALE
            return (
              <g key={i}>
                <line x1={xs} y1={ORIGIN_Y - 3} x2={xs} y2={ORIGIN_Y + 3} stroke="rgba(255,255,255,0.18)" />
                <line x1={ORIGIN_X - 3} y1={ys} x2={ORIGIN_X + 3} y2={ys} stroke="rgba(255,255,255,0.18)" />
              </g>
            )
          })}

          {showNeg && (
            <line x1={oS.sx} y1={oS.sy} x2={negS.sx} y2={negS.sy} stroke="#666" strokeDasharray="4,3" strokeWidth={1.5} />
          )}

          <line x1={oS.sx} y1={oS.sy} x2={posS.sx} y2={posS.sy} stroke="#fbbf24" strokeWidth={2.5} />
          <Arrow from={oS} to={posS} color="#fbbf24" />

          {showComp && (
            <>
              <line x1={oS.sx} y1={oS.sy} x2={oS.sx + dir.x * SCALE} y2={oS.sy} stroke="#6366f1" strokeWidth={2} />
              <line x1={oS.sx + dir.x * SCALE} y1={oS.sy} x2={dhS.sx} y2={dhS.sy} stroke="#4ade80" strokeWidth={2} />
              <text x={oS.sx + dir.x * SCALE / 2} y={oS.sy - 6} fill="#a5b4fc" fontSize="11" textAnchor="middle" fontFamily="monospace">d.x</text>
              <text x={oS.sx + dir.x * SCALE + 6} y={oS.sy - dir.y * SCALE / 2 + 4} fill="#86efac" fontSize="11" fontFamily="monospace">d.y</text>
            </>
          )}

          <circle cx={rtS.sx} cy={rtS.sy} r={6} fill="#f43f5e" stroke="#fff" strokeWidth={1.5} />
          <text x={rtS.sx + 10} y={rtS.sy - 6} fill="#fda4af" fontSize="11" fontFamily="monospace">r(t)</text>

          <g onMouseDown={onDown('origin')} style={{ cursor: 'grab' }}>
            <circle cx={oS.sx} cy={oS.sy} r={9} fill="#a5b4fc" stroke="#fff" strokeWidth={1.5} />
            <text x={oS.sx + 12} y={oS.sy - 8} fill="#c7d2fe" fontSize="11" fontFamily="monospace">o</text>
          </g>

          <g onMouseDown={onDown('dir')} style={{ cursor: 'grab' }}>
            <circle cx={dhS.sx} cy={dhS.sy} r={7} fill="#4ade80" stroke="#fff" strokeWidth={1.5} />
            <text x={dhS.sx + 10} y={dhS.sy + 14} fill="#86efac" fontSize="11" fontFamily="monospace">d</text>
          </g>
        </svg>

        <div style={sidePanel}>
          <ObsTask>滑动 t，观察 r(t) 沿 ray 移动。t = 0 是 origin 本身，t &lt; 0 在 origin 后方（虚线），ray 只取 t ≥ 0。</ObsTask>

          <Slider label="t" value={t} min={-3} max={5} step={0.05} onChange={setT} color="#f43f5e" />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Toggle active={normalized} onClick={() => setNormalized(!normalized)}>Normalize d</Toggle>
            <Toggle active={showNeg} onClick={() => setShowNeg(!showNeg)}>Show t&lt;0</Toggle>
            <Toggle active={showComp} onClick={() => setShowComp(!showComp)}>Show d.x / d.y</Toggle>
          </div>

          <Status>
            <div>o = ({origin.x.toFixed(2)}, {origin.y.toFixed(2)})</div>
            <div>d = ({dir.x.toFixed(3)}, {dir.y.toFixed(3)})</div>
            <div>|d| = {Math.hypot(dir.x, dir.y).toFixed(3)}</div>
            <div>t = <b style={{ color: t >= 0 ? '#4ade80' : '#f87171' }}>{t.toFixed(2)}</b></div>
            <div>r(t) = ({rt.x.toFixed(2)}, {rt.y.toFixed(2)})</div>
            <div style={{ marginTop: 4, color: t >= 0 ? '#4ade80' : '#f87171' }}>
              {t >= 0 ? 'on ray (valid)' : 'behind origin (invalid)'}
            </div>
          </Status>
        </div>
      </div>
    </div>
  )
}
