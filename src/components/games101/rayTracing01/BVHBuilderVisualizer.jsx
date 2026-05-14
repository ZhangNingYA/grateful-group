import { useState, useMemo } from 'react'
import { Header, ObsTask, Slider, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

const W = 600, H = 400, PAD = 24

const ALL_OBJECTS = [
  { id: 'A', x: 0.10, y: 0.20, r: 0.06, color: '#f43f5e' },
  { id: 'B', x: 0.18, y: 0.32, r: 0.05, color: '#fb923c' },
  { id: 'C', x: 0.28, y: 0.18, r: 0.05, color: '#fbbf24' },
  { id: 'D', x: 0.40, y: 0.50, r: 0.06, color: '#4ade80' },
  { id: 'E', x: 0.55, y: 0.45, r: 0.05, color: '#22d3ee' },
  { id: 'F', x: 0.62, y: 0.30, r: 0.05, color: '#6366f1' },
  { id: 'G', x: 0.78, y: 0.20, r: 0.06, color: '#a78bfa' },
  { id: 'H', x: 0.85, y: 0.40, r: 0.05, color: '#ec4899' },
  { id: 'I', x: 0.30, y: 0.75, r: 0.05, color: '#f472b6' },
  { id: 'J', x: 0.55, y: 0.80, r: 0.06, color: '#86efac' },
  { id: 'K', x: 0.72, y: 0.70, r: 0.05, color: '#fde68a' },
  { id: 'L', x: 0.88, y: 0.78, r: 0.05, color: '#fda4af' },
]

function bboxOf(objects) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const o of objects) {
    minX = Math.min(minX, o.x - o.r); minY = Math.min(minY, o.y - o.r)
    maxX = Math.max(maxX, o.x + o.r); maxY = Math.max(maxY, o.y + o.r)
  }
  return { minX, minY, maxX, maxY }
}

let _id = 0
function buildBVH(objects, depth = 0, maxLeaf = 2, maxDepth = 5, axisOpt = 'longest') {
  const bbox = bboxOf(objects)
  const node = { id: ++_id, depth, bbox, objects, isLeaf: false, left: null, right: null, axis: null }
  if (objects.length <= maxLeaf || depth >= maxDepth) {
    node.isLeaf = true
    return node
  }
  let axis
  if (axisOpt === 'x') axis = 'x'
  else if (axisOpt === 'y') axis = 'y'
  else {
    axis = (bbox.maxX - bbox.minX) >= (bbox.maxY - bbox.minY) ? 'x' : 'y'
  }
  const sorted = [...objects].sort((a, b) => a[axis] - b[axis])
  const mid = Math.floor(sorted.length / 2)
  node.axis = axis
  node.left = buildBVH(sorted.slice(0, mid), depth + 1, maxLeaf, maxDepth, axisOpt)
  node.right = buildBVH(sorted.slice(mid), depth + 1, maxLeaf, maxDepth, axisOpt)
  return node
}

function flatten(node, list = []) {
  if (!node) return list
  list.push(node)
  flatten(node.left, list)
  flatten(node.right, list)
  return list
}

function depthLayers(root) {
  const out = []
  const walk = (n) => {
    if (!n) return
    out[n.depth] ||= []
    out[n.depth].push(n)
    walk(n.left); walk(n.right)
  }
  walk(root)
  return out
}

export default function BVHBuilderVisualizer() {
  const [maxLeaf, setMaxLeaf] = useState(2)
  const [maxDepth, setMaxDepth] = useState(4)
  const [step, setStep] = useState(4)
  const [axisOpt, setAxisOpt] = useState('longest')
  const [selectedNode, setSelectedNode] = useState(null)

  const tree = useMemo(() => { _id = 0; return buildBVH(ALL_OBJECTS, 0, maxLeaf, maxDepth, axisOpt) }, [maxLeaf, maxDepth, axisOpt])
  const layers = useMemo(() => depthLayers(tree), [tree])
  const visibleNodes = useMemo(() => layers.flat().filter((n) => n.depth <= step), [layers, step])

  // Tree layout
  const treeNodes = useMemo(() => {
    const list = []
    const walk = (n, x, y, dx) => {
      if (!n || n.depth > step) return
      list.push({ ...n, tx: x, ty: y })
      if (!n.isLeaf) {
        walk(n.left, x - dx, y + 70, dx / 2)
        walk(n.right, x + dx, y + 70, dx / 2)
      }
    }
    walk(tree, 220, 30, 100)
    return list
  }, [tree, step])

  const sx = (x) => PAD + x * (W - 2 * PAD)
  const sy = (y) => PAD + y * (H - 2 * PAD)

  const totalLevels = layers.length

  const sel = selectedNode ? visibleNodes.find((n) => n.id === selectedNode) : null

  return (
    <div style={panelStyle}>
      <Header title="BVH Builder · 按物体分组的层级包围盒"
        subtitle="逐步构建：包盒 → 选轴 → 排序 → 分两组 → 递归。点击 tree 节点查看其物体。"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)' }}>
        <div style={{ display: 'grid', gridTemplateRows: '1fr 240px', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          {/* spatial view */}
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: '#070710', display: 'block' }}>
            {visibleNodes.map((n) => {
              const isSel = n.id === selectedNode
              const color = isSel ? '#fbbf24' : ['#6366f1', '#4ade80', '#f43f5e', '#a78bfa', '#22d3ee', '#fb923c'][n.depth % 6]
              return (
                <rect key={n.id}
                  x={sx(n.bbox.minX)} y={sy(n.bbox.minY)}
                  width={sx(n.bbox.maxX) - sx(n.bbox.minX)}
                  height={sy(n.bbox.maxY) - sy(n.bbox.minY)}
                  fill={isSel ? 'rgba(251,191,36,0.18)' : 'transparent'}
                  stroke={color}
                  strokeWidth={isSel ? 2.5 : Math.max(0.6, 2 - n.depth * 0.3)}
                  strokeDasharray={n.isLeaf ? '0' : '4,3'}
                />
              )
            })}
            {ALL_OBJECTS.map((o) => {
              const inSel = sel ? sel.objects.some((s) => s.id === o.id) : false
              return (
                <g key={o.id}>
                  <circle cx={sx(o.x)} cy={sy(o.y)} r={Math.max(4, o.r * (W - 2 * PAD))}
                    fill={o.color} stroke={inSel ? '#fff' : 'rgba(0,0,0,0.6)'}
                    strokeWidth={inSel ? 2.5 : 1} />
                  <text x={sx(o.x)} y={sy(o.y) + 4} fill="#1a1a2a" fontSize="10" textAnchor="middle" fontWeight="bold">{o.id}</text>
                </g>
              )
            })}
          </svg>

          {/* tree view */}
          <svg viewBox="0 0 440 240" style={{ width: '100%', height: 240, display: 'block', background: '#0a0a14' }}>
            {treeNodes.map((n) => {
              if (!n.isLeaf && n.left && n.left.depth <= step) {
                const child = treeNodes.find((c) => c.id === n.left.id)
                if (child) return (<line key={`l-${n.id}`} x1={n.tx} y1={n.ty} x2={child.tx} y2={child.ty} stroke="rgba(255,255,255,0.2)" />)
              }
              return null
            })}
            {treeNodes.map((n) => {
              if (!n.isLeaf && n.right && n.right.depth <= step) {
                const child = treeNodes.find((c) => c.id === n.right.id)
                if (child) return (<line key={`r-${n.id}`} x1={n.tx} y1={n.ty} x2={child.tx} y2={child.ty} stroke="rgba(255,255,255,0.2)" />)
              }
              return null
            })}
            {treeNodes.map((n) => {
              const isSel = n.id === selectedNode
              const fill = isSel ? '#fbbf24' : n.isLeaf ? '#4ade80' : '#6366f1'
              return (
                <g key={`n-${n.id}`} style={{ cursor: 'pointer' }} onClick={() => setSelectedNode(n.id)}>
                  <rect x={n.tx - 22} y={n.ty - 12} width={44} height={24} rx={4}
                    fill={fill + '33'} stroke={fill} strokeWidth={isSel ? 2 : 1.2} />
                  <text x={n.tx} y={n.ty + 4} fill={fill} fontSize="10" textAnchor="middle" fontFamily="monospace">
                    {n.isLeaf ? `[${n.objects.length}]` : `${n.axis}:${n.objects.length}`}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div style={sidePanel}>
          <ObsTask>调 max leaf 看叶子大小如何影响树的形状。点击 tree 节点 → 看 spatial view 哪些 objects 属于这个节点。</ObsTask>

          <Slider label="step (depth visible)" value={step} min={0} max={totalLevels - 1} step={1} onChange={setStep} color="#fbbf24" />
          <Slider label="max leaf size" value={maxLeaf} min={1} max={4} step={1} onChange={setMaxLeaf} color="#6366f1" />
          <Slider label="max depth" value={maxDepth} min={1} max={6} step={1} onChange={setMaxDepth} color="#a5b4fc" />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Toggle active={axisOpt === 'longest'} onClick={() => setAxisOpt('longest')}>Longest axis</Toggle>
            <Toggle active={axisOpt === 'x'} onClick={() => setAxisOpt('x')}>X only</Toggle>
            <Toggle active={axisOpt === 'y'} onClick={() => setAxisOpt('y')}>Y only</Toggle>
          </div>

          <Status>
            <div>nodes (visible): {visibleNodes.length}</div>
            <div>leaves: {visibleNodes.filter((n) => n.isLeaf).length}</div>
            {sel ? (
              <>
                <div style={{ marginTop: 4 }}>selected node #{sel.id} (depth {sel.depth})</div>
                <div>{sel.isLeaf ? 'LEAF' : `internal · split=${sel.axis}`}</div>
                <div>objects: {sel.objects.map((o) => o.id).join(', ')}</div>
              </>
            ) : <div style={{ marginTop: 4, color: '#888' }}>点击 tree 节点查看其物体</div>}
          </Status>

          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', lineHeight: 1.6 }}>
{`BuildBVH(objects):
  bbox = compute(objects)
  if leaf-condition: return Leaf
  axis = longest(bbox)
  sort objects along axis
  split into left, right
  recurse`}
          </div>
        </div>
      </div>
    </div>
  )
}
