import { useState } from 'react'

const NODES = [
  { id: 'param', label: '参数曲线', x: 50, y: 6, desc: '用参数 t 映射到空间中的点，扫出一条路径。这是所有曲线表示的基础。', icon: '〰️' },
  { id: 'lerp', label: '线性插值', x: 50, y: 17, desc: 'lerp(A,B,t) = (1-t)A + tB，按比例混合两个点。De Casteljau 的基本操作。', icon: '📐' },
  { id: 'decasteljau', label: 'De Casteljau', x: 50, y: 28, desc: '递归线性插值构造曲线点。几何直觉强，数值稳定，是理解 Bézier 曲线的核心。', icon: '🔄' },
  { id: 'bezier', label: 'Bézier 曲线', x: 50, y: 40, desc: '控制点牵引的平滑曲线。广泛用于字体、矢量图形、动画路径和工业设计。', icon: '✨' },
  { id: 'bernstein', label: 'Bernstein 基', x: 18, y: 52, desc: '决定每个控制点在不同 t 处的权重。所有权重之和恒为 1。', icon: '📊' },
  { id: 'properties', label: '曲线性质', x: 82, y: 52, desc: '端点插值、端点切线、凸包性质、仿射不变性——让 Bézier 曲线适合交互设计。', icon: '🎯' },
  { id: 'piecewise', label: '分段 Bézier', x: 50, y: 64, desc: '多段低阶曲线拼接复杂路径。需要处理连接处的连续性。', icon: '🔗' },
  { id: 'spline', label: '样条 Spline', x: 50, y: 76, desc: '满足连续性条件的多段曲线。B-spline 具有局部控制特性。', icon: '🌊' },
  { id: 'surface', label: 'Bézier 曲面', x: 50, y: 88, desc: '曲线的二维推广。用控制网格和 (u,v) 两个参数定义曲面 patch。', icon: '🏔️' },
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

  const svgW = 440, svgH = 460
  const toSvg = (n) => ({ x: n.x / 100 * svgW, y: (n.y / 100 * svgH) + 20 })

  return (
    <div style={{
      width: '100%', borderRadius: '16px', overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.15)',
      background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      padding: '24px',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', maxWidth: '400px', height: 'auto' }}>
          {/* Gradient defs */}
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges with curves */}
          {EDGES.map(([from, to], idx) => {
            const a = toSvg(nodeMap[from])
            const b = toSvg(nodeMap[to])
            const isHighlight = selected === from || selected === to
            const midX = (a.x + b.x) / 2
            const midY = (a.y + b.y) / 2
            // Slight curve for branching edges
            const isBranch = from === 'bezier' && (to === 'bernstein' || to === 'properties')
            const cx = isBranch ? (a.x + b.x) / 2 : midX
            const cy = isBranch ? a.y + 10 : midY

            return (
              <g key={idx}>
                <path
                  d={`M ${a.x} ${a.y + 16} Q ${cx} ${cy} ${b.x} ${b.y - 16}`}
                  fill="none"
                  stroke={isHighlight ? '#6366f1' : '#333'}
                  strokeWidth={isHighlight ? 2.5 : 1.5}
                  strokeDasharray={isHighlight ? '' : ''}
                  opacity={isHighlight ? 1 : 0.6}
                />
                {/* Arrow */}
                <circle cx={b.x} cy={b.y - 16} r={2.5}
                  fill={isHighlight ? '#6366f1' : '#444'} />
              </g>
            )
          })}

          {/* Nodes */}
          {NODES.map(node => {
            const pos = toSvg(node)
            const isSelected = selected === node.id
            return (
              <g key={node.id}
                onClick={() => setSelected(selected === node.id ? null : node.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow */}
                {isSelected && (
                  <rect x={pos.x - 62} y={pos.y - 15} width={124} height={30} rx={10}
                    fill="rgba(99,102,241,0.15)" filter="url(#glow)" />
                )}
                {/* Card */}
                <rect x={pos.x - 62} y={pos.y - 15} width={124} height={30} rx={10}
                  fill={isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)'}
                  stroke={isSelected ? '#6366f1' : 'rgba(255,255,255,0.08)'}
                  strokeWidth={isSelected ? 2 : 1} />
                {/* Text */}
                <text x={pos.x} y={pos.y + 5} textAnchor="middle"
                  fill={isSelected ? '#c7d2fe' : '#ccc'} fontSize="12"
                  fontFamily="system-ui, sans-serif" fontWeight={isSelected ? '600' : '400'}>
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Description panel */}
        <div style={{ flex: '1 1 220px', minWidth: '220px' }}>
          {selected ? (
            <div style={{
              padding: '20px', borderRadius: '12px',
              background: 'rgba(99,102,241,0.05)',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{nodeMap[selected].icon}</div>
              <div style={{ fontSize: '15px', color: '#c7d2fe', fontWeight: 600, marginBottom: '10px' }}>
                {nodeMap[selected].label}
              </div>
              <div style={{ fontSize: '13px', color: '#bbb', lineHeight: '1.7' }}>
                {nodeMap[selected].desc}
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', color: '#555', fontSize: '13px', textAlign: 'center', lineHeight: '1.6' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.5 }}>👆</div>
              点击左侧节点<br />查看知识点说明
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
