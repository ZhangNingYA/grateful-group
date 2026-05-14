import { useState } from 'react'
import { Header, ObsTask, Status, panelStyle, sidePanel } from './ui.jsx'

const W = 600, H = 320
const LIGHT = { x: 60, y: 60 }
const RECEIVER_Y = 250

export default function VisibilityFunctionExplainer() {
  const [hover, setHover] = useState(null)

  // a few occluders (boxes)
  const occluders = [
    { x: 240, y: 130, w: 50, h: 60 },
    { x: 350, y: 170, w: 60, h: 30 },
    { x: 150, y: 200, w: 35, h: 35 },
  ]

  // sample points along receiver
  const samples = []
  for (let i = 0; i < 24; i++) {
    const px = 50 + (i + 0.5) * (W - 100) / 24
    const py = RECEIVER_Y
    // ray from light to (px, py); does it hit any occluder?
    let blocked = false
    let hitT = 1
    for (const o of occluders) {
      // line segment from LIGHT to (px,py) intersect with axis-aligned rectangle
      const dx = px - LIGHT.x, dy = py - LIGHT.y
      // parametric x(t) = LIGHT.x + t*dx in [0,1]
      // intersect with rect's slabs
      let tMin = 0, tMax = 1
      for (const [a, lo, hi, off, d] of [
        ['x', o.x, o.x + o.w, LIGHT.x, dx],
        ['y', o.y, o.y + o.h, LIGHT.y, dy],
      ]) {
        if (Math.abs(d) < 1e-6) {
          if (off < lo || off > hi) { tMin = 1; tMax = 0; break }
          continue
        }
        let t0 = (lo - off) / d
        let t1 = (hi - off) / d
        if (t0 > t1) [t0, t1] = [t1, t0]
        tMin = Math.max(tMin, t0); tMax = Math.min(tMax, t1)
      }
      if (tMin <= tMax && tMax >= 0 && tMin <= 1 - 0.001) {
        blocked = true
        hitT = Math.min(hitT, tMin)
        break
      }
    }
    samples.push({ px, py, blocked, hitT })
  }

  return (
    <div style={panelStyle}>
      <Header title="Visibility Function · V(x, ω)" subtitle="阴影本质：从光源到接收点的视线是否被挡。" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', background: '#070710', display: 'block' }}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            const sx = ((e.clientX - r.left) / r.width) * W
            const sy = ((e.clientY - r.top) / r.height) * H
            setHover({ x: sx, y: sy })
          }}
          onMouseLeave={() => setHover(null)}
        >
          {/* light */}
          <circle cx={LIGHT.x} cy={LIGHT.y} r={12} fill="#fde68a" />
          <text x={LIGHT.x + 18} y={LIGHT.y + 4} fill="#fde68a" fontSize="11" fontFamily="monospace">light</text>

          {/* occluders */}
          {occluders.map((o, i) => (
            <rect key={i} x={o.x} y={o.y} width={o.w} height={o.h}
              fill="rgba(99,102,241,0.6)" stroke="#a5b4fc" strokeWidth={1} rx={3} />
          ))}

          {/* receiver */}
          <line x1={30} y1={RECEIVER_Y + 8} x2={W - 30} y2={RECEIVER_Y + 8} stroke="#666" strokeWidth={2} />
          <text x={32} y={RECEIVER_Y + 24} fill="#666" fontSize="10" fontFamily="monospace">receiver (ground)</text>

          {/* sample rays */}
          {samples.map((s, i) => (
            <line key={i} x1={LIGHT.x} y1={LIGHT.y} x2={s.px} y2={s.py}
              stroke={s.blocked ? 'rgba(244,63,94,0.18)' : 'rgba(74,222,128,0.25)'} strokeWidth={0.7} />
          ))}

          {/* sample dots: lit / shadow */}
          {samples.map((s, i) => (
            <circle key={i} cx={s.px} cy={s.py} r={4}
              fill={s.blocked ? '#f43f5e' : '#4ade80'} stroke="#fff" strokeWidth={0.5} />
          ))}

          {/* hover line */}
          {hover && (
            <>
              <line x1={LIGHT.x} y1={LIGHT.y} x2={hover.x} y2={hover.y}
                stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3,2" />
              <circle cx={hover.x} cy={hover.y} r={5} fill="#fbbf24" />
            </>
          )}

          {/* legend */}
          <g transform={`translate(${W - 130}, 20)`}>
            <rect width="120" height="50" fill="rgba(15,15,26,0.8)" stroke="rgba(255,255,255,0.1)" rx={4} />
            <circle cx="14" cy="18" r="4" fill="#4ade80" />
            <text x="24" y="22" fill="#86efac" fontSize="10" fontFamily="monospace">V(x) = 1 (lit)</text>
            <circle cx="14" cy="36" r="4" fill="#f43f5e" />
            <text x="24" y="40" fill="#fda4af" fontSize="10" fontFamily="monospace">V(x) = 0 (shadow)</text>
          </g>
        </svg>

        <div style={sidePanel}>
          <ObsTask>把鼠标在画面里移动，看从 light 到那个点的视线穿过 occluder 的样子。</ObsTask>

          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', fontSize: 11, color: '#bbb', lineHeight: 1.7 }}>
            渲染方程里的可见性项：
            <div style={{ margin: '6px 0', padding: 6, background: 'rgba(99,102,241,0.06)', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, color: '#c7d2fe' }}>
              V(x, ω) = {'{'}1 (lit), 0 (blocked){'}'}
            </div>
            Shadow Mapping 的整张深度图本质就是为每个方向上"最近的 V=1 表面"做缓存。
          </div>

          <Status>
            samples lit: {samples.filter((s) => !s.blocked).length} / {samples.length}<br />
            samples in shadow: {samples.filter((s) => s.blocked).length} / {samples.length}
          </Status>

          <div style={{ fontSize: 11, color: '#888', lineHeight: 1.6 }}>
            如果对每个着色点都向光源射 ray 求 V，渲染会非常昂贵。Shadow Map 把这个查询变成一次纹理读取。
          </div>
        </div>
      </div>
    </div>
  )
}
