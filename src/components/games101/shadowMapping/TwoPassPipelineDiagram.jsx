import { useState, useEffect } from 'react'
import { Header, ObsTask, Status, Toggle, panelStyle, sidePanel } from './ui.jsx'

const STEPS = [
  { id: 'scene', label: 'Scene', x: 50, y: 8, pass: 0, desc: '所有几何体、光源和相机的 3D 场景。' },
  { id: 'lightview', label: 'Light View', x: 25, y: 24, pass: 1, desc: 'Pass 1: 把 view matrix 切换到光源位置和方向。' },
  { id: 'lproj', label: 'Light Projection', x: 25, y: 38, pass: 1, desc: 'Directional 用 ortho；spot 用 perspective。' },
  { id: 'depthbuf', label: 'Depth Buffer', x: 25, y: 52, pass: 1, desc: 'Z-buffer 自动写入光源视角下最近表面的深度。' },
  { id: 'shadowmap', label: 'Shadow Map', x: 25, y: 66, pass: 1, desc: '把 depth buffer 作为纹理保存，留给 Pass 2 采样。' },
  { id: 'cameraview', label: 'Camera View', x: 75, y: 24, pass: 2, desc: 'Pass 2: 从相机渲染，每个 fragment 都要做阴影查询。' },
  { id: 'project', label: 'Project to Light Space', x: 75, y: 38, pass: 2, desc: '把 fragment 的世界坐标乘 light VP 矩阵，做透视除法 + [-1,1] → [0,1] 映射。' },
  { id: 'sample', label: 'Sample Shadow Map', x: 75, y: 52, pass: 2, desc: '用 (u, v) 采样 shadow map，得到 closestDepth。' },
  { id: 'compare', label: 'Depth Compare', x: 75, y: 66, pass: 2, desc: 'currentDepth − bias > closestDepth → shadow，否则 lit。' },
  { id: 'result', label: 'Lit or Shadow', x: 50, y: 84, pass: 0, desc: '最终把 visibility 乘到该 fragment 的直接光照分量上。' },
]

const EDGES = [
  ['scene', 'lightview'], ['scene', 'cameraview'],
  ['lightview', 'lproj'], ['lproj', 'depthbuf'], ['depthbuf', 'shadowmap'],
  ['cameraview', 'project'], ['project', 'sample'], ['sample', 'compare'],
  ['shadowmap', 'sample'], ['compare', 'result'],
]

export default function TwoPassPipelineDiagram() {
  const [active, setActive] = useState('scene')
  const [autoplay, setAutoplay] = useState(false)

  useEffect(() => {
    if (!autoplay) return
    let i = STEPS.findIndex((s) => s.id === active)
    const timer = setInterval(() => {
      i = (i + 1) % STEPS.length
      setActive(STEPS[i].id)
    }, 1300)
    return () => clearInterval(timer)
  }, [autoplay, active])

  const sel = STEPS.find((s) => s.id === active)
  const W = 540, H = 440
  const toSvg = (n) => ({ x: (n.x / 100) * W, y: (n.y / 100) * H + 10 })

  return (
    <div style={panelStyle}>
      <Header
        title="Two-Pass Pipeline · 光源 Pass + 相机 Pass"
        subtitle="点击节点查看说明；开启 Auto-play 看完整流程动画。"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: '100%', height: 'auto', background: '#070710', display: 'block' }}>
          {/* Pass labels */}
          <rect x={W * 0.06} y={20} width={W * 0.38} height={H * 0.7} fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.18)" rx={10} strokeDasharray="4,3" />
          <rect x={W * 0.56} y={20} width={W * 0.38} height={H * 0.7} fill="rgba(244,63,94,0.04)" stroke="rgba(244,63,94,0.18)" rx={10} strokeDasharray="4,3" />
          <text x={W * 0.25} y={36} textAnchor="middle" fill="#a5b4fc" fontSize="12" fontWeight="600">PASS 1 · From Light</text>
          <text x={W * 0.75} y={36} textAnchor="middle" fill="#fda4af" fontSize="12" fontWeight="600">PASS 2 · From Camera</text>

          {EDGES.map(([from, to], idx) => {
            const a = toSvg(STEPS.find((s) => s.id === from))
            const b = toSvg(STEPS.find((s) => s.id === to))
            const isHL = from === active || to === active
            return (
              <line key={idx} x1={a.x} y1={a.y + 12} x2={b.x} y2={b.y - 12}
                stroke={isHL ? '#fbbf24' : 'rgba(255,255,255,0.12)'}
                strokeWidth={isHL ? 1.8 : 1}
                markerEnd={isHL ? 'url(#arrow-hl)' : 'url(#arrow)'} />
            )
          })}
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            </marker>
            <marker id="arrow-hl" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7" fill="none" stroke="#fbbf24" strokeWidth="1.4" />
            </marker>
          </defs>

          {STEPS.map((node) => {
            const pos = toSvg(node)
            const isSel = active === node.id
            const accent = node.pass === 1 ? '#a5b4fc' : node.pass === 2 ? '#fda4af' : '#fde68a'
            return (
              <g key={node.id} onClick={() => setActive(node.id)} style={{ cursor: 'pointer' }}>
                <rect x={pos.x - 70} y={pos.y - 12} width={140} height={24} rx={7}
                  fill={isSel ? `${accent}26` : 'rgba(255,255,255,0.03)'}
                  stroke={isSel ? accent : `${accent}44`} strokeWidth={isSel ? 2 : 1} />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle"
                  fill={isSel ? '#fff' : accent} fontSize="11" fontFamily="system-ui" fontWeight={isSel ? 700 : 500}>
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>

        <div style={sidePanel}>
          <ObsTask>第一遍只产出深度图，没有 shading；第二遍才决定每个像素的最终颜色。</ObsTask>

          <Toggle active={autoplay} onClick={() => setAutoplay(!autoplay)} color="#fbbf24">
            {autoplay ? '⏸ 暂停' : '▶ Auto-play 1.3s/step'}
          </Toggle>

          <div style={{ padding: 12, borderRadius: 8, background: `${sel.pass === 1 ? '#a5b4fc' : sel.pass === 2 ? '#fda4af' : '#fde68a'}10`, border: `1px solid ${sel.pass === 1 ? '#a5b4fc' : sel.pass === 2 ? '#fda4af' : '#fde68a'}44` }}>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, marginBottom: 6 }}>
              {sel.pass > 0 && <span style={{ marginRight: 6, opacity: 0.7 }}>Pass {sel.pass}</span>}
              {sel.label}
            </div>
            <div style={{ fontSize: 12, color: '#bbb', lineHeight: 1.65 }}>{sel.desc}</div>
          </div>

          <Status>
            <div>shadow map 是 Pass 1 → Pass 2 之间</div>
            <div>唯一的"中间产物"。</div>
            <div style={{ marginTop: 4, color: '#fde68a' }}>核心：Pass 1 写深度，Pass 2 读深度。</div>
          </Status>
        </div>
      </div>
    </div>
  )
}
