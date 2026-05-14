import { useState } from 'react'
import { Header, ObsTask, Slider, Status, panelStyle, sidePanel } from './ui.jsx'

const W = 600, H = 360

// Show how penumbra width depends on (receiver - blocker) distance
// PCSS: penumbra ∝ (d_receiver - d_blocker) / d_blocker · light_size

export default function PCSSPenumbraLab() {
  const [blockerH, setBlockerH] = useState(180) // y of blocker
  const [lightSize, setLightSize] = useState(50)
  const [showPCF, setShowPCF] = useState(true)

  const lightY = 40
  const lightCenter = W / 2
  const receiverY = 290

  const blockerCenterX = lightCenter
  const blockerWidth = 100

  // d_blocker (distance from light to blocker)
  const dBlocker = blockerH - lightY
  const dReceiver = receiverY - lightY

  // PCSS penumbra width (proportional approximation)
  const penumbra = lightSize * (dReceiver - dBlocker) / dBlocker

  // sample receiver points and shoot rays from sampled points on the light to compute coverage
  const N = 80
  const lightSamples = 12
  const samples = []
  for (let i = 0; i < N; i++) {
    const rx = 60 + (i + 0.5) * (W - 120) / N
    let blockedCount = 0
    for (let k = 0; k < lightSamples; k++) {
      const lx = lightCenter + (k / (lightSamples - 1) - 0.5) * lightSize
      // line from (lx, lightY) to (rx, receiverY); intersect with blocker rectangle
      const t = (blockerH - lightY) / (receiverY - lightY)
      const xAtBlocker = lx + (rx - lx) * t
      if (xAtBlocker > blockerCenterX - blockerWidth / 2 && xAtBlocker < blockerCenterX + blockerWidth / 2) {
        blockedCount++
      }
    }
    const visibility = 1 - blockedCount / lightSamples // 0 = fully shadow, 1 = fully lit
    samples.push({ rx, visibility })
  }

  // PCF approximation: use a fixed kernel applied to a hard-shadow signal at receiver level
  const hardShadow = samples.map((s) => (s.visibility < 0.5 ? 0 : 1))
  const pcfKernel = 5
  const pcfHalf = Math.floor(pcfKernel / 2)
  const pcfResult = samples.map((_, i) => {
    let sum = 0, count = 0
    for (let k = -pcfHalf; k <= pcfHalf; k++) {
      if (i + k >= 0 && i + k < samples.length) { sum += hardShadow[i + k]; count++ }
    }
    return sum / count
  })

  return (
    <div style={panelStyle}>
      <Header
        title="PCSS · Penumbra 跟着 blocker 距离变化"
        subtitle="PCF 软化程度恒定；PCSS 根据 blocker 距离动态调整 kernel。"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: '#070710', display: 'block' }}>
          {/* light (area) */}
          <rect x={lightCenter - lightSize / 2} y={lightY - 6} width={lightSize} height={12} fill="#fde68a" rx={3} />
          <text x={lightCenter} y={lightY - 12} fill="#fde68a" fontSize="10" fontFamily="monospace" textAnchor="middle">area light (size = {lightSize}px)</text>

          {/* sample rays from edges of light through blocker edges (penumbra cone) */}
          <line x1={lightCenter - lightSize / 2} y1={lightY} x2={blockerCenterX + blockerWidth / 2} y2={blockerH}
            stroke="rgba(253,224,134,0.25)" strokeDasharray="3,2" />
          <line x1={lightCenter + lightSize / 2} y1={lightY} x2={blockerCenterX - blockerWidth / 2} y2={blockerH}
            stroke="rgba(253,224,134,0.25)" strokeDasharray="3,2" />

          {/* blocker */}
          <rect x={blockerCenterX - blockerWidth / 2} y={blockerH - 8} width={blockerWidth} height={16}
            fill="#6366f1" rx={3} />
          <text x={blockerCenterX} y={blockerH - 14} fill="#a5b4fc" fontSize="10" fontFamily="monospace" textAnchor="middle">blocker</text>

          {/* receiver */}
          <line x1={40} y1={receiverY + 4} x2={W - 40} y2={receiverY + 4} stroke="#666" strokeWidth={2} />

          {/* visibility heat */}
          {samples.map((s, i) => (
            <rect key={i} x={s.rx - (W - 120) / N / 2} y={receiverY - 6} width={(W - 120) / N + 0.5} height={12}
              fill={`rgba(74,222,128,${s.visibility})`} />
          ))}

          {/* visibility bars at bottom */}
          {samples.map((s, i) => {
            const h = (1 - s.visibility) * 22
            return (
              <rect key={i} x={s.rx - (W - 120) / N / 2} y={receiverY + 12} width={(W - 120) / N + 0.5} height={h}
                fill="#fda4af" />
            )
          })}

          {showPCF && samples.map((s, i) => {
            const h = (1 - pcfResult[i]) * 22
            return (
              <rect key={i} x={s.rx - (W - 120) / N / 2} y={receiverY + 60} width={(W - 120) / N + 0.5} height={h}
                fill="#a5b4fc" opacity={0.7} />
            )
          })}

          <text x={50} y={receiverY + 8} fill="#888" fontSize="10" fontFamily="monospace">receiver</text>
          <text x={50} y={receiverY + 32} fill="#fda4af" fontSize="9" fontFamily="monospace">PCSS / area light truth</text>
          {showPCF && <text x={50} y={receiverY + 78} fill="#a5b4fc" fontSize="9" fontFamily="monospace">PCF kernel=5 (constant)</text>}

          {/* penumbra width indicator on receiver */}
          <line x1={lightCenter - penumbra} y1={receiverY - 18} x2={lightCenter + penumbra} y2={receiverY - 18}
            stroke="#fbbf24" strokeWidth={2} />
          <text x={lightCenter} y={receiverY - 22} fill="#fde68a" fontSize="10" fontFamily="monospace" textAnchor="middle">
            penumbra ≈ {penumbra.toFixed(1)} px
          </text>
        </svg>

        <div style={sidePanel}>
          <ObsTask>把 blocker 拖近 receiver → penumbra 变窄；拉远 → penumbra 变宽。这是 PCF 做不到的。</ObsTask>

          <Slider label="blocker height" value={blockerH} min={70} max={260} step={1} onChange={setBlockerH} color="#a5b4fc" />
          <Slider label="light size" value={lightSize} min={6} max={120} step={1} onChange={setLightSize} color="#fde68a" />

          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', fontSize: 11, color: '#bbb', lineHeight: 1.7 }}>
            PCSS 半影宽度（直觉公式）：
            <div style={{ margin: '6px 0', padding: 6, background: 'rgba(99,102,241,0.06)', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, color: '#c7d2fe' }}>
              w ∝ (d_recv − d_blk) / d_blk · w_light
            </div>
            blocker 离 receiver 越远，penumbra 越宽。
          </div>

          <Status>
            <div>d_blocker  = {dBlocker.toFixed(1)} px</div>
            <div>d_receiver = {dReceiver.toFixed(1)} px</div>
            <div>(d_r − d_b)/d_b = {((dReceiver - dBlocker) / dBlocker).toFixed(2)}</div>
            <div style={{ color: '#fde68a' }}>penumbra ≈ {penumbra.toFixed(1)} px</div>
          </Status>

          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setShowPCF(!showPCF)} style={{
              padding: '4px 10px', fontSize: 11, borderRadius: 4,
              background: showPCF ? 'rgba(165,180,252,0.15)' : 'transparent',
              color: showPCF ? '#a5b4fc' : '#666',
              border: showPCF ? '1px solid rgba(165,180,252,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}>
              {showPCF ? '✓' : ' '} 对比 PCF (kernel=5)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
