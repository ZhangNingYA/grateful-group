import { useState } from 'react'
import { Header, panelStyle } from './ui.jsx'

const NODES = [
  // root
  { id: 'root', x: 300, y: 30, label: 'Ray Tracing 1', color: '#fbbf24', desc: '从 pixel 出发，到 acceleration structure 的完整知识链。' },

  // pillars
  { id: 'cast', x: 100, y: 110, label: 'Ray Casting', color: '#6366f1', desc: '从 camera 经过 pixel 发射 primary ray，找最近命中。' },
  { id: 'inter', x: 250, y: 110, label: 'Intersection', color: '#22d3ee', desc: 'Ray 和 implicit / triangle / plane 求交。' },
  { id: 'vis', x: 400, y: 110, label: 'Visibility', color: '#fb923c', desc: 'closest hit · t_min/t_max · shadow ray。' },
  { id: 'accel', x: 550, y: 110, label: 'Acceleration', color: '#4ade80', desc: '当三角形数量大时，使用包围体 / 空间划分 / BVH 提速。' },

  // ray casting children
  { id: 'p2r', x: 50, y: 200, label: 'Pixel → Ray', color: '#a5b4fc', desc: '通过 camera 坐标系把像素生成一条 ray direction。' },
  { id: 'eq', x: 130, y: 200, label: 'r(t)=o+t·d', color: '#a5b4fc', desc: 'Ray 的数学表达：从 origin 沿 direction 延伸的半直线，t ≥ 0。' },

  // intersection children
  { id: 'imp', x: 200, y: 200, label: 'Implicit', color: '#67e8f9', desc: '把 ray 代入隐式表面方程，解 t。例：sphere 得到二次方程。' },
  { id: 'pl', x: 270, y: 200, label: 'Plane', color: '#67e8f9', desc: 't = (p₀−o)·n / d·n。' },
  { id: 'tri', x: 340, y: 200, label: 'Triangle', color: '#67e8f9', desc: '先和平面求交，再判断点是否在三角形内（barycentric）。' },
  { id: 'mt', x: 270, y: 280, label: 'Möller–Trumbore', color: '#fde68a', desc: '同时求出 t 和 barycentric (u, v)，几何意义清晰。', isKey: true },

  // visibility children
  { id: 'pri', x: 380, y: 200, label: 'Primary Ray', color: '#fdba74', desc: 'camera → pixel 方向。' },
  { id: 'sh', x: 460, y: 200, label: 'Shadow Ray', color: '#fdba74', desc: '从命中点指向 light，t_max=distanceToLight。' },

  // acceleration children
  { id: 'bv', x: 470, y: 200, label: 'Bounding Volume', color: '#86efac', desc: 'ray miss bbox → 整个物体跳过。' },
  { id: 'aabb', x: 540, y: 200, label: 'AABB · Slab', color: '#86efac', desc: 't_enter = max(per axis), t_exit = min(per axis)。' },
  { id: 'grid', x: 470, y: 280, label: 'Uniform Grid', color: '#86efac', desc: '均匀切空间，DDA 顺序访问 cell。' },
  { id: 'sp', x: 540, y: 280, label: 'KD-tree (Spatial)', color: '#86efac', desc: '递归切空间，几何体可能跨边界。' },
  { id: 'bvh', x: 605, y: 280, label: 'BVH (Object)', color: '#4ade80', desc: '按物体分组的层级 bbox，现代光追主流。', isKey: true },
]

const EDGES = [
  ['root', 'cast'], ['root', 'inter'], ['root', 'vis'], ['root', 'accel'],
  ['cast', 'p2r'], ['cast', 'eq'],
  ['inter', 'imp'], ['inter', 'pl'], ['inter', 'tri'],
  ['tri', 'mt'],
  ['vis', 'pri'], ['vis', 'sh'],
  ['accel', 'bv'], ['accel', 'aabb'],
  ['accel', 'grid'], ['accel', 'sp'], ['accel', 'bvh'],
]

export default function RayTracingPipelineSummaryMap() {
  const [active, setActive] = useState('mt')
  const sel = NODES.find((n) => n.id === active) || NODES[0]

  // highlight ancestors
  const highlight = new Set([active])
  for (const [a, b] of EDGES) if (b === active) highlight.add(a)
  // and root
  highlight.add('root')

  return (
    <div style={panelStyle}>
      <Header title="Ray Tracing 1 · Knowledge Map" subtitle="点击节点查看说明。橙色为 root，绿色为加速结构主线。" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg viewBox="0 0 700 340" style={{ width: '100%', height: 'auto', background: '#070710', display: 'block' }}>
          {/* edges */}
          {EDGES.map(([a, b], i) => {
            const na = NODES.find((n) => n.id === a)
            const nb = NODES.find((n) => n.id === b)
            const isPath = highlight.has(a) && highlight.has(b)
            return (
              <line key={i} x1={na.x} y1={na.y + 12} x2={nb.x} y2={nb.y - 12}
                stroke={isPath ? '#fbbf24' : 'rgba(255,255,255,0.12)'}
                strokeWidth={isPath ? 1.6 : 1} />
            )
          })}

          {NODES.map((n) => {
            const isActive = n.id === active
            const inPath = highlight.has(n.id)
            const w = n.label.length * 6 + 24
            return (
              <g key={n.id} onClick={() => setActive(n.id)} style={{ cursor: 'pointer' }}>
                <rect x={n.x - w / 2} y={n.y - 12} width={w} height={24} rx={6}
                  fill={isActive ? n.color : `${n.color}1a`}
                  stroke={isActive ? '#fff' : (inPath ? n.color : 'rgba(255,255,255,0.1)')}
                  strokeWidth={isActive ? 2 : 1}
                />
                <text x={n.x} y={n.y + 4} fill={isActive ? '#0a0a14' : n.color} fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight={isActive ? 700 : 500}>
                  {n.label}
                </text>
                {n.isKey && !isActive && (
                  <circle cx={n.x + w / 2 - 4} cy={n.y - 8} r={3} fill="#fbbf24" />
                )}
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
            pixel → ray → intersection → closest hit → acceleration
          </div>
        </div>
      </div>
    </div>
  )
}
