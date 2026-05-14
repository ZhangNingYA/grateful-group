import { useState } from 'react'
import { Header, panelStyle } from './ui.jsx'

const NODES = [
  { id: 'root', x: 300, y: 28, label: 'Shadow Mapping', color: '#fbbf24', desc: '从光源生成 depth map，从相机查询 visibility。' },

  // pillars
  { id: 'pass1', x: 110, y: 95, label: 'Pass 1: Light', color: '#a5b4fc', desc: '从光源视角渲染场景，写入 depth buffer。' },
  { id: 'pass2', x: 290, y: 95, label: 'Pass 2: Camera', color: '#fda4af', desc: '从相机渲染，对每个 fragment 做 shadow test。' },
  { id: 'art', x: 470, y: 95, label: 'Artifacts', color: '#fb7185', desc: 'shadow mapping 的常见伪影。' },
  { id: 'fix', x: 590, y: 95, label: 'Fixes', color: '#4ade80', desc: '工程上消除伪影的手段。' },

  // pass1 children
  { id: 'lvm', x: 50, y: 175, label: 'Light VP', color: '#a5b4fc', desc: '光源的 view + projection 矩阵；directional 用 ortho、spot 用 perspective、point 用 6× cubemap。' },
  { id: 'dmap', x: 170, y: 175, label: 'Depth Map', color: '#a5b4fc', desc: '光源最近表面的深度纹理。' },

  // pass2 children
  { id: 'proj', x: 230, y: 175, label: 'Light Space', color: '#fda4af', desc: 'p_clip = P_l · V_l · p_world，再 / w 得到 NDC。' },
  { id: 'samp', x: 320, y: 175, label: 'Sample SM', color: '#fda4af', desc: '用 NDC.xy 做 [0,1] 映射后采样 depth map。' },
  { id: 'cmp', x: 410, y: 175, label: 'Depth Compare', color: '#fda4af', desc: 'currentDepth − bias > closestDepth → shadow。' },

  // artifacts
  { id: 'acne', x: 460, y: 175, label: 'Acne', color: '#fb7185', desc: '自阴影斑点；离散化 + 浮点 + 斜面导致。' },
  { id: 'peter', x: 540, y: 175, label: 'Peter Pan', color: '#fb7185', desc: '阴影脱离物体；bias 过大引起。' },
  { id: 'alias', x: 460, y: 245, label: 'Aliasing', color: '#fb7185', desc: '锯齿；texel 世界尺寸太大。' },

  // fixes
  { id: 'bias', x: 550, y: 245, label: 'Bias', color: '#4ade80', desc: 'depth bias / normal bias / slope-scale bias。' },
  { id: 'pcf', x: 620, y: 175, label: 'PCF', color: '#4ade80', desc: '邻域多次比较取平均；软化边缘。' },
  { id: 'pcss', x: 620, y: 245, label: 'PCSS', color: '#4ade80', desc: 'penumbra ∝ blocker 距离，物理近似软阴影。' },
  { id: 'csm', x: 620, y: 305, label: 'CSM', color: '#4ade80', desc: '近精远粗，按距离切分多个 cascade。' },
]

const EDGES = [
  ['root', 'pass1'], ['root', 'pass2'], ['root', 'art'], ['root', 'fix'],
  ['pass1', 'lvm'], ['pass1', 'dmap'],
  ['pass2', 'proj'], ['pass2', 'samp'], ['pass2', 'cmp'],
  ['dmap', 'samp'],
  ['art', 'acne'], ['art', 'peter'], ['art', 'alias'],
  ['fix', 'bias'], ['fix', 'pcf'], ['fix', 'pcss'], ['fix', 'csm'],
  ['acne', 'bias'], ['alias', 'pcf'], ['alias', 'csm'],
]

export default function ShadowMappingSummaryMap() {
  const [active, setActive] = useState('cmp')
  const sel = NODES.find((n) => n.id === active)

  // ancestors
  const highlight = new Set([active])
  for (const [a, b] of EDGES) if (b === active) highlight.add(a)
  highlight.add('root')

  return (
    <div style={panelStyle}>
      <Header title="Shadow Mapping · Knowledge Map" subtitle="点击节点查看说明，黄路径表示当前节点的依赖。" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg viewBox="0 0 700 360" style={{ width: '100%', height: 'auto', background: '#070710', display: 'block' }}>
          {EDGES.map(([a, b], i) => {
            const na = NODES.find((n) => n.id === a)
            const nb = NODES.find((n) => n.id === b)
            const isPath = highlight.has(a) && highlight.has(b)
            return (
              <line key={i} x1={na.x} y1={na.y + 11} x2={nb.x} y2={nb.y - 11}
                stroke={isPath ? '#fbbf24' : 'rgba(255,255,255,0.1)'}
                strokeWidth={isPath ? 1.6 : 1} />
            )
          })}
          {NODES.map((n) => {
            const isActive = n.id === active
            const inPath = highlight.has(n.id)
            const w = n.label.length * 6.5 + 28
            return (
              <g key={n.id} onClick={() => setActive(n.id)} style={{ cursor: 'pointer' }}>
                <rect x={n.x - w / 2} y={n.y - 12} width={w} height={24} rx={6}
                  fill={isActive ? n.color : `${n.color}1a`}
                  stroke={isActive ? '#fff' : (inPath ? n.color : 'rgba(255,255,255,0.08)')}
                  strokeWidth={isActive ? 2 : 1} />
                <text x={n.x} y={n.y + 4} fill={isActive ? '#0a0a14' : n.color}
                  fontSize="10.5" textAnchor="middle" fontFamily="monospace" fontWeight={isActive ? 700 : 500}>
                  {n.label}
                </text>
              </g>
            )
          })}
        </svg>
        <div style={{ padding: 14, fontSize: 12, color: '#aaa', display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(15,15,26,0.6)' }}>
          <div style={{ fontSize: 10, color: '#666', letterSpacing: 1 }}>SELECTED</div>
          <div>
            <div style={{ fontSize: 14, color: sel.color, fontWeight: 600, marginBottom: 4 }}>{sel.label}</div>
            <div style={{ fontSize: 12, color: '#bbb', lineHeight: 1.65 }}>{sel.desc}</div>
          </div>
          <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', fontSize: 11, color: '#fde68a', lineHeight: 1.6 }}>
            <b>核心链路：</b><br />
            light → depth map → light-space transform → depth compare → visibility
          </div>
        </div>
      </div>
    </div>
  )
}
