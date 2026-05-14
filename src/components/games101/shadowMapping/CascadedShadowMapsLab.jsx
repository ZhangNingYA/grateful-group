import { useState } from 'react'
import { Header, ObsTask, Slider, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

const W = 600, H = 360

const CASCADE_COLORS = ['#4ade80', '#fbbf24', '#fb7185', '#a5b4fc']

export default function CascadedShadowMapsLab() {
  const [cascades, setCascades] = useState(3)
  const [splits, setSplits] = useState([0.05, 0.2, 0.5]) // fraction of far plane
  const [shadowResPerCascade, setShadowResPerCascade] = useState(1024)
  const [singleMode, setSingleMode] = useState(false) // compare single shadow map

  const cameraNear = 0.1
  const cameraFar = 200

  // build cascade ranges
  const cascadeRanges = []
  let prev = cameraNear
  for (let i = 0; i < cascades - 1 && i < splits.length; i++) {
    const next = splits[i] * cameraFar
    cascadeRanges.push({ near: prev, far: next })
    prev = next
  }
  cascadeRanges.push({ near: prev, far: cameraFar })

  // svg coords
  const xT = (d) => 50 + (d / cameraFar) * (W - 100)

  // texel world size for each cascade (smaller = better)
  const texelSizes = cascadeRanges.map((r) => {
    const frustumWidth = r.far - r.near // approximate: cascade size
    return frustumWidth / shadowResPerCascade
  })

  const totalMemory = cascades * shadowResPerCascade * shadowResPerCascade * 2 // bytes (D16)

  return (
    <div style={panelStyle}>
      <Header
        title="Cascaded Shadow Maps · 按距离分配精度"
        subtitle="把相机视锥按距离切几段，每段一张专属 shadow map。近处精度高、远处精度低。"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: '#070710', display: 'block' }}>
          {/* axis */}
          <line x1={50} y1={H - 60} x2={W - 50} y2={H - 60} stroke="rgba(255,255,255,0.15)" />
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const d = t * cameraFar
            return (
              <g key={i}>
                <line x1={xT(d)} y1={H - 65} x2={xT(d)} y2={H - 55} stroke="rgba(255,255,255,0.2)" />
                <text x={xT(d)} y={H - 42} fill="#666" fontSize="10" textAnchor="middle" fontFamily="monospace">{d.toFixed(0)}m</text>
              </g>
            )
          })}

          {/* camera */}
          <g transform={`translate(${50}, ${H - 130})`}>
            <polygon points="0,-10 20,0 0,10" fill="#a5b4fc" />
            <text x={-2} y={28} fill="#a5b4fc" fontSize="10" fontFamily="monospace">camera</text>
          </g>

          {/* camera frustum visualization */}
          <line x1={50} y1={H - 130} x2={W - 50} y2={H - 200} stroke="rgba(165,180,252,0.3)" strokeDasharray="3,3" />
          <line x1={50} y1={H - 130} x2={W - 50} y2={H - 60} stroke="rgba(165,180,252,0.3)" strokeDasharray="3,3" />

          {/* cascade ranges */}
          {!singleMode && cascadeRanges.map((r, i) => {
            const c = CASCADE_COLORS[i]
            return (
              <g key={i}>
                <rect x={xT(r.near)} y={H - 200} width={xT(r.far) - xT(r.near)} height={70}
                  fill={`${c}1a`} stroke={c} strokeWidth={1.5} rx={4} />
                <text x={(xT(r.near) + xT(r.far)) / 2} y={H - 190} fill={c} fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  Cascade {i}
                </text>
                <text x={(xT(r.near) + xT(r.far)) / 2} y={H - 175} fill={c} fontSize="9" fontFamily="monospace" textAnchor="middle">
                  [{r.near.toFixed(1)}, {r.far.toFixed(1)}]m
                </text>
                <text x={(xT(r.near) + xT(r.far)) / 2} y={H - 158} fill="#888" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  {shadowResPerCascade}² · texel ≈ {texelSizes[i].toFixed(3)}m
                </text>
              </g>
            )
          })}

          {singleMode && (
            <g>
              <rect x={xT(cameraNear)} y={H - 200} width={xT(cameraFar) - xT(cameraNear)} height={70}
                fill="rgba(244,63,94,0.12)" stroke="#f43f5e" strokeWidth={1.5} rx={4} />
              <text x={W / 2} y={H - 180} fill="#fda4af" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                Single Shadow Map [{cameraNear.toFixed(1)}, {cameraFar.toFixed(1)}]m
              </text>
              <text x={W / 2} y={H - 162} fill="#888" fontSize="9" fontFamily="monospace" textAnchor="middle">
                {shadowResPerCascade}² · texel ≈ {(cameraFar / shadowResPerCascade).toFixed(3)}m everywhere
              </text>
            </g>
          )}

          {/* example fragment */}
          <text x={W / 2} y={30} fill="#fde68a" fontSize="11" fontFamily="monospace" textAnchor="middle">
            {!singleMode ? '近处用 cascade 0（最锐利）；远处用 cascade N（粗糙但够用）' : '一张图覆盖整个范围 → 近处糊'}
          </text>
        </svg>

        <div style={sidePanel}>
          <ObsTask>切换 Single vs CSM。注意：在相同显存下，CSM 的近处 texel 远小于单张 shadow map。</ObsTask>

          <Slider label="cascade 数量" value={cascades} min={1} max={4} step={1} onChange={setCascades} color="#4ade80" />
          <Slider label="每张 shadow map 分辨率" value={shadowResPerCascade} min={256} max={4096} step={256} onChange={setShadowResPerCascade} color="#a5b4fc" />

          {cascades >= 2 && (
            <>
              <Slider label="split 0/1 (× far)" value={splits[0]} min={0.01} max={0.4} step={0.01} onChange={(v) => setSplits([v, ...splits.slice(1)])} color={CASCADE_COLORS[0]} precision={2} />
              {cascades >= 3 && (
                <Slider label="split 1/2" value={splits[1]} min={splits[0] + 0.05} max={0.7} step={0.01} onChange={(v) => setSplits([splits[0], v, splits[2]])} color={CASCADE_COLORS[1]} precision={2} />
              )}
              {cascades >= 4 && (
                <Slider label="split 2/3" value={splits[2]} min={splits[1] + 0.05} max={0.95} step={0.01} onChange={(v) => setSplits([splits[0], splits[1], v])} color={CASCADE_COLORS[2]} precision={2} />
              )}
            </>
          )}

          <Toggle active={singleMode} onClick={() => setSingleMode(!singleMode)} color="#f43f5e">
            {singleMode ? 'Showing Single' : 'Single Shadow Map (compare)'}
          </Toggle>

          <Status>
            <div>memory: {(totalMemory / 1024 / 1024).toFixed(2)} MB total</div>
            {!singleMode && (
              <>
                <div style={{ color: CASCADE_COLORS[0] }}>cascade 0 texel: {texelSizes[0]?.toFixed(3)}m</div>
                <div style={{ color: CASCADE_COLORS[Math.min(3, cascades - 1)] }}>cascade {cascades - 1} texel: {texelSizes[cascades - 1]?.toFixed(3)}m</div>
                <div style={{ marginTop: 4, color: '#fbbf24' }}>
                  near vs far ratio: {(texelSizes[cascades - 1] / texelSizes[0]).toFixed(0)}×
                </div>
              </>
            )}
            {singleMode && (
              <div style={{ color: '#fda4af' }}>
                texel: {(cameraFar / shadowResPerCascade).toFixed(3)}m everywhere（近处也是同样精度，浪费）
              </div>
            )}
          </Status>
        </div>
      </div>
    </div>
  )
}
