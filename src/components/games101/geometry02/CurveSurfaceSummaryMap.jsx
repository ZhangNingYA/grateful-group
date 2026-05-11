import { useState } from 'react'

const NODES = [
  { id: 'param', label: '参数曲线', x: 50, y: 10, desc: '用参数 t 映射到空间中的点，扫出一条路径' },
  { id: 'lerp', label: '线性插值', x: 50, y: 22, desc: 'lerp(A,B,t) = (1-t)A + tB，按比例混合两个点' },
  { id: 'decasteljau', label: 'De Casteljau', x: 50, y: 34, desc: '递归线性插值，几何直觉强且数值稳定' },
  { id: 'bezier', label: 'Bézier 曲线', x: 50, y: 46, desc: '控制点牵引的平滑曲线，广泛用于设计和动画' },
  { id: 'bernstein', label: 'Bernstein 基', x: 20, y: 55, desc: '决定每个控制点在不同 t 处的权重' },
  { id: 'properties', label: '曲线性质', x: 80, y: 55, desc: '端点插值、切线、凸包、仿射不变性' },
  { id: 'piecewise', label: '分段 Bézier', x: 50, y: 66, desc: '多段低阶曲线拼接复杂路径' },
  { id: 'spline', label: '样条 Spline', x: 50, y: 78, desc: '满足连续性条件的多段曲线，具有局部控制' },
  { id: 'surface', label: 'Bézier 曲面', x: 50, y: 90, desc: '曲线的二维推广，用控制网格和 (u,v) 参数' },
]

const EDGES = [
  ['param', 'lerp'],
  ['lerp', 'decasteljau'],
  ['decasteljau', 'bezier'],
  ['bezier', 'bernstein'],
  ['bezier', 'properties'],
  ['bezier', 'piecewise'],
  ['piecewise', 'spline'],
  ['spline', 'surface'],
]

export default function CurveSurfaceSummaryMap() {
  const [selected, setSelected] = useState(null)

  const nodeMap = {}
  NODES.forEach(n => { nodeMap[n.id] = n })

  const svgW = 400, svgH = 420
  const toSvg = (n) => ({ x: n.x / 100 * svgW, y: n.y / 100 * svgH })

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: '#0f0f1a', padding: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', maxWidth: '360px', height: 'auto' }}>
          {/* Edges */}
          {EDGES.map(([from, to], idx) => {
            const a = toSvg(nodeMap[from])
            const b = toSvg(nodeMap[to])
            const isHighlight = selected === from || selected === to
            return (
              <line key={idx} x1={a.x} y1={a.y + 12} x2={b.x} y2={b.y - 12}
                stroke={isHighlight ? '#6366f1' : '#333'} strokeWidth={isHighlight ? 2 : 1.2}
                strokeDasharray={isHighlight ? '' : '4 3'} />
            )
          })}
          {/* Nodes */}
          {NODES.map(node => {
            const pos = toSvg(node)
            const isSelected = selected === node.id
            return (
              <g key={node.id} onClick={() => setSelected(selected === node.id ? null : node.id)} style={{ cursor: 'pointer' }}>
                <rect x={pos.x - 52} y={pos.y - 12} width={104} height={24} rx={6}
                  fill={isSelected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)'}
                  stroke={isSelected ? '#6366f1' : '#444'} strokeWidth={isSelected ? 2 : 1} />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle"
                  fill={isSelected ? '#a5b4fc' : '#ccc'} fontSize="11" fontFamily="system-ui">
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>
        {/* Description panel */}
        <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
          {selected ? (
            <div style={{ padding: '16px', background: 'rgba(99,102,241,0.05)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: '14px', color: '#a5b4fc', fontWeight: 600, marginBottom: '8px' }}>
                {nodeMap[selected].label}
              </div>
              <div style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.6' }}>
                {nodeMap[selected].desc}
              </div>
            </div>
          ) : (
            <div style={{ padding: '16px', color: '#666', fontSize: '13px' }}>
              ← 点击节点查看说明
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
