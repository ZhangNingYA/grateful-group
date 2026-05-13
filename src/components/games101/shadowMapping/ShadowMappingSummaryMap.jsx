import { useState } from 'react'

const NODES = [
  { id: 'sm', label: 'Shadow Mapping', x: 50, y: 5, desc: '实时渲染中最经典的阴影算法：从光源生成深度图，再从相机比较深度。' },
  { id: 'pass1', label: 'Pass 1: Light', x: 25, y: 20, desc: '从光源视角渲染场景，只写入深度缓冲，生成 Shadow Map。' },
  { id: 'lvm', label: 'Light View Matrix', x: 12, y: 35, desc: '定义光源的"相机"位置和方向，决定从哪里看场景。' },
  { id: 'lpm', label: 'Light Projection', x: 38, y: 35, desc: '正交投影（方向光）或透视投影（聚光灯），决定覆盖范围。' },
  { id: 'dmap', label: 'Depth Map', x: 25, y: 50, desc: '每个 texel 存储光源方向上最近表面的深度值。' },
  { id: 'pass2', label: 'Pass 2: Camera', x: 75, y: 20, desc: '从相机正常渲染，对每个片元查询 Shadow Map 判断遮挡。' },
  { id: 'proj', label: 'Project to LS', x: 62, y: 35, desc: '把片元世界坐标变换到光源裁剪空间，得到 UV 和深度。' },
  { id: 'cmp', label: 'Depth Compare', x: 88, y: 35, desc: 'currentDepth - bias > closestDepth → shadow。' },
  { id: 'artifacts', label: 'Artifacts', x: 25, y: 68, desc: 'Shadow Mapping 的常见问题：acne、peter panning、aliasing。' },
  { id: 'acne', label: 'Shadow Acne', x: 10, y: 82, desc: '自阴影斑点，因深度精度和离散化导致的误判。' },
  { id: 'peter', label: 'Peter Panning', x: 25, y: 82, desc: '阴影脱离物体，因 bias 过大导致。' },
  { id: 'alias', label: 'Aliasing', x: 40, y: 82, desc: '阴影锯齿，因 shadow map 分辨率不足。' },
  { id: 'fixes', label: 'Fixes', x: 75, y: 68, desc: '常见改进方案。' },
  { id: 'bias', label: 'Bias', x: 60, y: 82, desc: '深度偏移，减少 acne 但可能引入 peter panning。' },
  { id: 'pcf', label: 'PCF', x: 75, y: 82, desc: '邻域多次 shadow test 取平均，软化边缘。' },
  { id: 'csm', label: 'CSM', x: 90, y: 82, desc: '级联阴影图，按距离分配精度，适合大场景方向光。' },
]

const EDGES = [
  ['sm','pass1'],['sm','pass2'],
  ['pass1','lvm'],['pass1','lpm'],['pass1','dmap'],
  ['pass2','proj'],['pass2','cmp'],['dmap','cmp'],
  ['sm','artifacts'],['sm','fixes'],
  ['artifacts','acne'],['artifacts','peter'],['artifacts','alias'],
  ['fixes','bias'],['fixes','pcf'],['fixes','csm'],
]

export default function ShadowMappingSummaryMap() {
  const [selected, setSelected] = useState(null)
  const nodeMap = {}
  NODES.forEach(n => { nodeMap[n.id] = n })

  const svgW = 500, svgH = 400
  const toSvg = (n) => ({ x: n.x / 100 * svgW, y: n.y / 100 * svgH + 10 })

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', padding: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', maxWidth: '460px', height: 'auto' }}>
          {EDGES.map(([from, to], idx) => {
            const a = toSvg(nodeMap[from]), b = toSvg(nodeMap[to])
            const isHL = selected === from || selected === to
            return <line key={idx} x1={a.x} y1={a.y+12} x2={b.x} y2={b.y-12}
              stroke={isHL ? '#6366f1' : '#333'} strokeWidth={isHL ? 2 : 1} />
          })}
          {NODES.map(node => {
            const pos = toSvg(node)
            const isSel = selected === node.id
            return (
              <g key={node.id} onClick={() => setSelected(selected === node.id ? null : node.id)} style={{ cursor: 'pointer' }}>
                <rect x={pos.x-48} y={pos.y-11} width={96} height={22} rx={7}
                  fill={isSel ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)'}
                  stroke={isSel ? '#6366f1' : 'rgba(255,255,255,0.08)'} strokeWidth={isSel ? 2 : 1} />
                <text x={pos.x} y={pos.y+4} textAnchor="middle" fill={isSel ? '#c7d2fe' : '#ccc'} fontSize="9.5" fontFamily="system-ui">{node.label}</text>
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
            <div style={{ padding: '16px', color: '#555', fontSize: '13px', textAlign: 'center' }}>点击节点查看说明</div>
          )}
        </div>
      </div>
    </div>
  )
}
