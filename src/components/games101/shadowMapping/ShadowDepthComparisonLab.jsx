import { useState } from 'react'
import { Header, ObsTask, Slider, Status, Pill, Toggle, panelStyle, sidePanel } from './ui.jsx'

const W = 600, H = 320
const PAD = 50
const BAR_Y = H * 0.55
const BAR_H = 16

export default function ShadowDepthComparisonLab() {
  const [fragmentDepth, setFragmentDepth] = useState(0.72)
  const [occluderDepth, setOccluderDepth] = useState(0.45)
  const [bias, setBias] = useState(0.005)
  const [showFormula, setShowFormula] = useState(true)
  const [drag, setDrag] = useState(null)

  const inShadow = (fragmentDepth - bias) > occluderDepth

  const xT = (t) => PAD + t * (W - 2 * PAD)
  const fragX = xT(fragmentDepth)
  const occX = xT(occluderDepth)
  const biasX = xT(fragmentDepth - bias)

  const onMove = (e) => {
    if (!drag) return
    const r = e.currentTarget.getBoundingClientRect()
    const sx = ((e.clientX - r.left) / r.width) * W
    const t = Math.max(0, Math.min(1, (sx - PAD) / (W - 2 * PAD)))
    if (drag === 'frag') setFragmentDepth(t)
    if (drag === 'occ') setOccluderDepth(t)
  }

  return (
    <div style={panelStyle}>
      <Header
        title="Shadow Test · currentDepth − bias > closestDepth ?"
        subtitle="把 fragment 和 occluder 沿 light 方向投影到 [0, 1]，做一次比较。"
        right={<Pill ok={!inShadow} label={inShadow ? '🌑 SHADOW' : '☀ LIT'} />}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', background: '#070710', display: 'block', cursor: drag ? 'grabbing' : 'default' }}
          onMouseMove={onMove}
          onMouseUp={() => setDrag(null)}
          onMouseLeave={() => setDrag(null)}
        >
          {/* axis */}
          <line x1={PAD} y1={BAR_Y + BAR_H + 8} x2={W - PAD} y2={BAR_Y + BAR_H + 8} stroke="rgba(255,255,255,0.12)" />
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <g key={i}>
              <line x1={xT(t)} y1={BAR_Y + BAR_H + 4} x2={xT(t)} y2={BAR_Y + BAR_H + 12} stroke="rgba(255,255,255,0.2)" />
              <text x={xT(t)} y={BAR_Y + BAR_H + 26} fill="#666" fontSize="10" textAnchor="middle" fontFamily="monospace">{t.toFixed(2)}</text>
            </g>
          ))}
          <text x={PAD} y={BAR_Y + BAR_H + 46} fill="#888" fontSize="10" fontFamily="monospace">0 (near · 光源端)</text>
          <text x={W - PAD - 100} y={BAR_Y + BAR_H + 46} fill="#888" fontSize="10" fontFamily="monospace">1 (far · 远离光源)</text>

          {/* "lit" zone (closest to light, before occluder) */}
          <rect x={PAD} y={BAR_Y - 4} width={Math.max(0, occX - PAD)} height={BAR_H + 8}
            fill="rgba(74,222,128,0.06)" />
          {/* "shadow" zone (after occluder) */}
          <rect x={occX} y={BAR_Y - 4} width={Math.max(0, W - PAD - occX)} height={BAR_H + 8}
            fill="rgba(244,63,94,0.06)" />

          {/* bar */}
          <rect x={PAD} y={BAR_Y} width={W - 2 * PAD} height={BAR_H} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" />

          {/* light marker */}
          <circle cx={PAD - 18} cy={BAR_Y + BAR_H / 2} r={9} fill="#fde68a" />
          <text x={PAD - 18} y={BAR_Y + BAR_H + 22} fill="#fde68a" fontSize="10" fontFamily="monospace" textAnchor="middle">light</text>

          {/* occluder */}
          <line x1={occX} y1={BAR_Y - 18} x2={occX} y2={BAR_Y + BAR_H + 18} stroke="#6366f1" strokeWidth={3} />
          <rect x={occX - 5} y={BAR_Y - 6} width={10} height={BAR_H + 12} fill="#6366f1" />
          <text x={occX} y={BAR_Y - 24} fill="#a5b4fc" fontSize="11" fontFamily="monospace" textAnchor="middle">closestDepth = {occluderDepth.toFixed(3)}</text>
          <text x={occX} y={BAR_Y + BAR_H + 60} fill="#888" fontSize="10" textAnchor="middle">shadow map texel</text>
          <g style={{ cursor: 'ew-resize' }} onMouseDown={(e) => { e.preventDefault(); setDrag('occ') }}>
            <circle cx={occX} cy={BAR_Y + BAR_H / 2} r={11} fill="#6366f1" stroke="#fff" strokeWidth={1.5} opacity={0.4} />
          </g>

          {/* fragment */}
          <line x1={fragX} y1={BAR_Y - 30} x2={fragX} y2={BAR_Y + BAR_H + 18} stroke={inShadow ? '#f43f5e' : '#4ade80'} strokeWidth={1.5} strokeDasharray="3,2" />
          <circle cx={fragX} cy={BAR_Y + BAR_H / 2} r={9} fill={inShadow ? '#f43f5e' : '#4ade80'} stroke="#fff" strokeWidth={1.5} />
          <text x={fragX} y={BAR_Y - 36} fill={inShadow ? '#fda4af' : '#86efac'} fontSize="11" fontFamily="monospace" textAnchor="middle">currentDepth = {fragmentDepth.toFixed(3)}</text>
          <g style={{ cursor: 'ew-resize' }} onMouseDown={(e) => { e.preventDefault(); setDrag('frag') }}>
            <circle cx={fragX} cy={BAR_Y + BAR_H / 2} r={12} fill="transparent" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
          </g>

          {/* bias indicator */}
          <line x1={biasX} y1={BAR_Y - 4} x2={biasX} y2={BAR_Y + BAR_H + 4} stroke="#fbbf24" strokeWidth={2} strokeDasharray="3,2" />
          <text x={biasX} y={BAR_Y + BAR_H + 60} fill="#fde68a" fontSize="10" fontFamily="monospace" textAnchor="middle">−bias</text>

          {/* formula text */}
          {showFormula && (
            <g>
              <rect x={PAD} y={20} width={W - 2 * PAD} height={42} rx={6}
                fill={inShadow ? 'rgba(244,63,94,0.06)' : 'rgba(74,222,128,0.06)'}
                stroke={inShadow ? 'rgba(244,63,94,0.25)' : 'rgba(74,222,128,0.25)'} />
              <text x={W / 2} y={42} fill={inShadow ? '#fda4af' : '#86efac'} fontSize="13" fontFamily="monospace" textAnchor="middle">
                {fragmentDepth.toFixed(3)} − {bias.toFixed(3)} {inShadow ? '>' : '≤'} {occluderDepth.toFixed(3)}
              </text>
              <text x={W / 2} y={56} fill="#888" fontSize="10" fontFamily="monospace" textAnchor="middle">
                {inShadow ? '→ 在阴影里' : '→ 被光直接照亮'}
              </text>
            </g>
          )}
        </svg>

        <div style={sidePanel}>
          <ObsTask>把 fragment 拖到 occluder 后面（更大的 depth）→ shadow；拉到 occluder 前面 → lit。bias 把 fragment 临界点向左推。</ObsTask>

          <Slider label="fragment depth" value={fragmentDepth} min={0.05} max={0.98} step={0.005} onChange={setFragmentDepth} color="#4ade80" precision={3} />
          <Slider label="closest depth (shadow map)" value={occluderDepth} min={0.05} max={0.95} step={0.005} onChange={setOccluderDepth} color="#6366f1" precision={3} />
          <Slider label="bias" value={bias} min={0} max={0.05} step={0.0005} onChange={setBias} color="#fbbf24" precision={4} />

          <Toggle active={showFormula} onClick={() => setShowFormula(!showFormula)}>show formula</Toggle>

          <Status>
            <div>currentDepth: {fragmentDepth.toFixed(3)}</div>
            <div>closestDepth: {occluderDepth.toFixed(3)}</div>
            <div>bias: {bias.toFixed(4)}</div>
            <div style={{ marginTop: 4, color: inShadow ? '#f87171' : '#4ade80' }}>
              {inShadow ? `${(fragmentDepth - bias).toFixed(3)} > ${occluderDepth.toFixed(3)} → in shadow` : `${(fragmentDepth - bias).toFixed(3)} ≤ ${occluderDepth.toFixed(3)} → lit`}
            </div>
          </Status>

          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', lineHeight: 1.6 }}>
{`vec3 ndc = lightClip.xyz / lightClip.w;
ndc = ndc * 0.5 + 0.5;
float current = ndc.z;
float closest = texture(sm, ndc.xy).r;
shadow = current - bias > closest;`}
          </div>
        </div>
      </div>
    </div>
  )
}
