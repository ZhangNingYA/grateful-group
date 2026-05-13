import { useState } from 'react'

const STEPS = [
  { id: 'scene', label: 'Scene', x: 50, y: 8, desc: '包含所有几何体、光源和相机的 3D 场景。' },
  { id: 'lightview', label: 'Light View', x: 25, y: 25, desc: 'Pass 1: 从光源位置和方向设置虚拟相机，渲染场景。' },
  { id: 'depthbuf', label: 'Depth Buffer', x: 25, y: 42, desc: '光源视角下的深度缓冲，记录每个像素最近表面的深度。' },
  { id: 'shadowmap', label: 'Shadow Map', x: 25, y: 59, desc: '存储为纹理的深度图。每个 texel = 光源方向上最近表面的深度值。' },
  { id: 'cameraview', label: 'Camera View', x: 75, y: 25, desc: 'Pass 2: 从相机位置正常渲染场景，对每个片元进行阴影判断。' },
  { id: 'project', label: 'Project to Light Space', x: 75, y: 42, desc: '把相机看到的片元坐标变换到光源的裁剪空间，得到 shadow map UV 和深度。' },
  { id: 'compare', label: 'Depth Compare', x: 75, y: 59, desc: '比较片元的 light-space 深度和 shadow map 中记录的深度。更远 = 被遮挡 = 阴影。' },
  { id: 'result', label: 'Lit or Shadow', x: 50, y: 78, desc: '如果 currentDepth - bias > closestDepth，则该片元在阴影中。' },
]

const EDGES = [
  ['scene', 'lightview'], ['scene', 'cameraview'],
  ['lightview', 'depthbuf'], ['depthbuf', 'shadowmap'],
  ['cameraview', 'project'], ['project', 'compare'],
  ['shadowmap', 'compare'], ['compare', 'result'],
]

export default function TwoPassPipelineDiagram() {
  const [selected, setSelected] = useState(null)
  const nodeMap = {}
  STEPS.forEach(n => { nodeMap[n.id] = n })

  const svgW = 500, svgH = 380
  const toSvg = (n) => ({ x: n.x / 100 * svgW, y: n.y / 100 * svgH + 10 })

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', padding: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', maxWidth: '460px', height: 'auto' }}>
          {/* Pass labels */}
          <text x={svgW * 0.25} y={16} textAnchor="middle" fill="#6366f1" fontSize="11" fontWeight="600">Pass 1: Light</text>
          <text x={svgW * 0.75} y={16} textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="600">Pass 2: Camera</text>

          {EDGES.map(([from, to], idx) => {
            const a = toSvg(nodeMap[from]), b = toSvg(nodeMap[to])
            const isHL = selected === from || selected === to
            return <line key={idx} x1={a.x} y1={a.y + 14} x2={b.x} y2={b.y - 14}
              stroke={isHL ? '#6366f1' : '#444'} strokeWidth={isHL ? 2 : 1.2}
              markerEnd="url(#arrow)" />
          })}
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="none" stroke="#555" strokeWidth="1" />
            </marker>
          </defs>

          {STEPS.map(node => {
            const pos = toSvg(node)
            const isSel = selected === node.id
            const isPass1 = ['lightview', 'depthbuf', 'shadowmap'].includes(node.id)
            const isPass2 = ['cameraview', 'project', 'compare'].includes(node.id)
            const borderColor = isSel ? '#6366f1' : isPass1 ? 'rgba(99,102,241,0.3)' : isPass2 ? 'rgba(244,63,94,0.3)' : 'rgba(255,255,255,0.08)'
            return (
              <g key={node.id} onClick={() => setSelected(selected === node.id ? null : node.id)} style={{ cursor: 'pointer' }}>
                <rect x={pos.x - 60} y={pos.y - 13} width={120} height={26} rx={8}
                  fill={isSel ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)'}
                  stroke={borderColor} strokeWidth={isSel ? 2 : 1} />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle"
                  fill={isSel ? '#c7d2fe' : '#ccc'} fontSize="11" fontFamily="system-ui">
                  {node.label}
                </text>
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
              点击节点查看说明
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
