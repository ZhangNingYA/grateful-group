import { useState } from 'react'
import { Header, ObsTask, Slider, Status, Pill, Toggle, panelStyle, sidePanel } from './ui.jsx'

const W = 600, H = 360

export default function AcneGeometryExplainer() {
  const [tilt, setTilt] = useState(0.5)         // surface tilt angle (radians)
  const [texelSize, setTexelSize] = useState(0.18) // shadow map texel size in world space
  const [bias, setBias] = useState(0)
  const [normalBias, setNormalBias] = useState(0)
  const [showStep, setShowStep] = useState('all') // 'sm' | 'shade' | 'all'

  const lightX = 80, lightY = 60
  const surfaceY = 220

  // Surface: from (left) to (right), tilted by 'tilt' angle
  // p(s) = (left + s * (right - left), surfaceY + tilt-induced y-offset)
  const left = 100, right = W - 60
  const tiltDy = (right - left) * Math.sin(tilt) * 0.4

  const surfaceA = { x: left, y: surfaceY }
  const surfaceB = { x: right, y: surfaceY - tiltDy }

  // light direction (going from light to scene)
  const lightDir = { x: 1, y: 1 }
  const ld = Math.hypot(lightDir.x, lightDir.y)
  lightDir.x /= ld; lightDir.y /= ld

  // sample surface points
  const samplePts = []
  const N = 24
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N
    const x = surfaceA.x + (surfaceB.x - surfaceA.x) * t
    const y = surfaceA.y + (surfaceB.y - surfaceA.y) * t
    samplePts.push({ x, y })
  }

  // For each sample, compute "perceived shadow depth" from the shadow map.
  // The shadow map quantizes depth across a texel; we approximate by snapping x to texel boundaries.
  const texelWidth = texelSize * (right - left)
  const samples = samplePts.map((p) => {
    // distance from light along light direction (proxy for "depth from light")
    const distLight = (p.x - lightX) * lightDir.x + (p.y - lightY) * lightDir.y

    // shadow map records the min depth in this texel (= depth at the closest part of the surface within the texel)
    const texelStart = Math.floor((p.x - left) / texelWidth) * texelWidth + left
    const texelEnd = texelStart + texelWidth
    // the surface enters this texel; the closest sample to light is at texelStart (since light comes from upper-left, the left edge of texel is closer)
    const yAtStart = surfaceA.y + (surfaceB.y - surfaceA.y) * ((texelStart - surfaceA.x) / (surfaceB.x - surfaceA.x))
    const recordedDepth = (texelStart - lightX) * lightDir.x + (yAtStart - lightY) * lightDir.y

    // current frag's perceived depth
    const currentDepth = distLight

    // normal bias: shift fragment along (estimated) surface normal toward light
    const surfaceNormal = { x: -(surfaceB.y - surfaceA.y), y: -(surfaceB.x - surfaceA.x) }
    const sn = Math.hypot(surfaceNormal.x, surfaceNormal.y) || 1
    surfaceNormal.x /= sn; surfaceNormal.y /= sn
    // shifted point
    const shiftedX = p.x + surfaceNormal.x * normalBias * 30
    const shiftedY = p.y + surfaceNormal.y * normalBias * 30
    const shiftedDepth = (shiftedX - lightX) * lightDir.x + (shiftedY - lightY) * lightDir.y

    const acne = (shiftedDepth - bias * 50) > recordedDepth + 0.5

    return { p, currentDepth, recordedDepth, acne }
  })

  const acneRate = samples.filter((s) => s.acne).length / samples.length

  return (
    <div style={panelStyle}>
      <Header
        title="Shadow Acne · 几何机理"
        subtitle="一个 shadow texel 在斜面上覆盖一段空间，离散化导致同一表面误判为自我遮挡。"
        right={<Pill ok={acneRate < 0.05} label={acneRate < 0.05 ? `acne ${(acneRate * 100).toFixed(0)}%` : `acne ${(acneRate * 100).toFixed(0)}% ⚠`} />}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: '#070710', display: 'block' }}>
          {/* light */}
          <circle cx={lightX} cy={lightY} r={11} fill="#fde68a" />
          <text x={lightX + 16} y={lightY + 4} fill="#fde68a" fontSize="11" fontFamily="monospace">light</text>

          {/* light rays */}
          {(showStep === 'sm' || showStep === 'all') && samplePts.filter((_, i) => i % 3 === 0).map((p, i) => (
            <line key={i} x1={lightX} y1={lightY} x2={p.x} y2={p.y} stroke="rgba(253,224,134,0.18)" strokeWidth={0.6} />
          ))}

          {/* shadow map texel grid (vertical separators on the surface) */}
          {(showStep === 'sm' || showStep === 'all') && Array.from({ length: Math.ceil((right - left) / texelWidth) + 1 }).map((_, i) => {
            const x = left + i * texelWidth
            const y = surfaceA.y + (surfaceB.y - surfaceA.y) * ((x - surfaceA.x) / (surfaceB.x - surfaceA.x))
            return (
              <g key={i}>
                <line x1={x} y1={y - 12} x2={x} y2={y + 12} stroke="rgba(99,102,241,0.4)" strokeWidth={1} strokeDasharray="2,2" />
              </g>
            )
          })}

          {/* surface */}
          <line x1={surfaceA.x} y1={surfaceA.y} x2={surfaceB.x} y2={surfaceB.y} stroke="#666" strokeWidth={2.5} />

          {/* shadow map "stair" (recorded depth per texel) */}
          {(showStep === 'sm' || showStep === 'all') && Array.from({ length: Math.floor((right - left) / texelWidth) }).map((_, i) => {
            const xs = left + i * texelWidth
            const xe = xs + texelWidth
            const ys = surfaceA.y + (surfaceB.y - surfaceA.y) * ((xs - surfaceA.x) / (surfaceB.x - surfaceA.x))
            return (
              <line key={i} x1={xs} y1={ys} x2={xe} y2={ys}
                stroke="#6366f1" strokeWidth={3} opacity={0.7} />
            )
          })}

          {/* surface samples colored by acne */}
          {(showStep === 'shade' || showStep === 'all') && samples.map((s, i) => (
            <circle key={i} cx={s.p.x} cy={s.p.y} r={4}
              fill={s.acne ? '#f43f5e' : '#4ade80'} stroke="#fff" strokeWidth={0.4} />
          ))}

          {/* labels */}
          <text x={left} y={surfaceY + 70} fill="#888" fontSize="10" fontFamily="monospace">surface (continuous)</text>
          <text x={left} y={surfaceY + 90} fill="#a5b4fc" fontSize="10" fontFamily="monospace">shadow map (stair-step quantization)</text>
          <text x={left} y={surfaceY + 108} fill={acneRate > 0.05 ? '#fda4af' : '#86efac'} fontSize="10" fontFamily="monospace">
            sample dot: {acneRate > 0.05 ? 'red = self-shadow (acne)' : 'green = lit'}
          </text>
        </svg>

        <div style={sidePanel}>
          <ObsTask>调高 tilt（surface 越斜）→ acne 越多。把 bias 调一点出来 → 减少 acne 但可能产生 peter panning。</ObsTask>

          <Slider label="surface tilt" value={tilt} min={0} max={1.0} step={0.02} onChange={setTilt} color="#a5b4fc" precision={2} />
          <Slider label="texel size" value={texelSize} min={0.05} max={0.4} step={0.01} onChange={setTexelSize} color="#6366f1" />
          <Slider label="bias" value={bias} min={0} max={0.04} step={0.001} onChange={setBias} color="#fbbf24" precision={3} />
          <Slider label="normal bias" value={normalBias} min={0} max={0.05} step={0.001} onChange={setNormalBias} color="#4ade80" precision={3} />

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Toggle active={showStep === 'all'} onClick={() => setShowStep('all')}>both</Toggle>
            <Toggle active={showStep === 'sm'} onClick={() => setShowStep('sm')}>shadow map</Toggle>
            <Toggle active={showStep === 'shade'} onClick={() => setShowStep('shade')}>shading</Toggle>
          </div>

          <Status>
            <div>蓝色 stair = shadow map 记录的 closestDepth</div>
            <div>红点 = 此处的 currentDepth &gt; 同 texel 的 closestDepth → acne</div>
            <div style={{ marginTop: 4, color: acneRate < 0.05 ? '#4ade80' : '#fbbf24' }}>
              estimated acne: {(acneRate * 100).toFixed(0)}%
            </div>
          </Status>
        </div>
      </div>
    </div>
  )
}
