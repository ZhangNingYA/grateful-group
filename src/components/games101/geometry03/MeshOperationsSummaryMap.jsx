import { useState } from 'react'

const NODES = [
  { id: 'mesh', label: 'Triangle Mesh', x: 50, y: 5, desc: '由顶点、边、面组成的显式几何表示，是几何处理的基础数据结构。' },
  { id: 'connectivity', label: '邻接关系', x: 25, y: 18, desc: '顶点、边、面之间的连接关系（拓扑信息），是所有 mesh 操作的前提。' },
  { id: 'halfedge', label: 'Half-Edge', x: 25, y: 30, desc: '高效的邻接查询数据结构，把每条边拆成两个有向半边。' },
  { id: 'local', label: '局部操作', x: 75, y: 18, desc: 'Edge Split / Flip / Collapse 是复杂算法的基本积木。' },
  { id: 'split', label: 'Edge Split', x: 60, y: 30, desc: '在边上插入新顶点，增加局部细节。' },
  { id: 'flip', label: 'Edge Flip', x: 75, y: 30, desc: '改变对角线连接，改善三角形质量。' },
  { id: 'collapse', label: 'Edge Collapse', x: 90, y: 30, desc: '合并两个端点，减少网格复杂度。' },
  { id: 'subdiv', label: 'Subdivision', x: 20, y: 48, desc: '增加面数并平滑顶点位置，从粗网格得到光滑表面。' },
  { id: 'loop', label: 'Loop', x: 12, y: 60, desc: '三角网格细分：1→4 split + 加权顶点更新。' },
  { id: 'cc', label: 'Catmull-Clark', x: 30, y: 60, desc: '四边形网格细分：face point + edge point + vertex update。' },
  { id: 'simplify', label: 'Simplification', x: 55, y: 48, desc: '减少面数，尽量保持外形。用于 LOD 和实时渲染。' },
  { id: 'qem', label: 'QEM', x: 55, y: 60, desc: '用局部平面距离误差衡量 collapse 代价，选择最优位置。' },
  { id: 'regular', label: 'Regularization', x: 85, y: 48, desc: '改善网格质量：均匀边长、规则 valence、避免 skinny triangles。' },
]

const EDGES = [
  ['mesh','connectivity'],['mesh','local'],
  ['connectivity','halfedge'],
  ['local','split'],['local','flip'],['local','collapse'],
  ['mesh','subdiv'],['mesh','simplify'],['mesh','regular'],
  ['subdiv','loop'],['subdiv','cc'],
  ['simplify','qem'],['simplify','collapse'],
]

export default function MeshOperationsSummaryMap() {
  const [selected, setSelected] = useState(null)
  const nodeMap = {}
  NODES.forEach(n => { nodeMap[n.id] = n })

  const svgW = 480, svgH = 340
  const toSvg = (n) => ({ x: n.x / 100 * svgW, y: n.y / 100 * svgH + 15 })

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', padding: '24px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', maxWidth: '440px', height: 'auto' }}>
          {EDGES.map(([from, to], idx) => {
            const a = toSvg(nodeMap[from]), b = toSvg(nodeMap[to])
            const isHL = selected === from || selected === to
            return <line key={idx} x1={a.x} y1={a.y+12} x2={b.x} y2={b.y-12} stroke={isHL ? '#6366f1' : '#333'} strokeWidth={isHL ? 2 : 1.2} />
          })}
          {NODES.map(node => {
            const pos = toSvg(node)
            const isSel = selected === node.id
            return (
              <g key={node.id} onClick={() => setSelected(selected === node.id ? null : node.id)} style={{ cursor: 'pointer' }}>
                {isSel && <rect x={pos.x-50} y={pos.y-12} width={100} height={24} rx={8} fill="rgba(99,102,241,0.15)" />}
                <rect x={pos.x-50} y={pos.y-12} width={100} height={24} rx={8}
                  fill={isSel ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)'}
                  stroke={isSel ? '#6366f1' : 'rgba(255,255,255,0.08)'} strokeWidth={isSel ? 2 : 1} />
                <text x={pos.x} y={pos.y+4} textAnchor="middle" fill={isSel ? '#c7d2fe' : '#ccc'} fontSize="10" fontFamily="system-ui">{node.label}</text>
              </g>
            )
          })}
        </svg>
        <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
          {selected ? (
            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: '14px', color: '#c7d2fe', fontWeight: 600, marginBottom: '8px' }}>{nodeMap[selected].label}</div>
              <div style={{ fontSize: '13px', color: '#bbb', lineHeight: '1.6' }}>{nodeMap[selected].desc}</div>
            </div>
          ) : (
            <div style={{ padding: '16px', color: '#555', fontSize: '13px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '6px', opacity: 0.5 }}>👆</div>
              点击节点查看说明
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
