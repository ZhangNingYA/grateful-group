import { useState, useMemo } from 'react'
import { Header, ObsTask, Slider, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

const W = 600, H = 380, PAD = 20

const OBJECTS = [
  { id: 1, x: 0.18, y: 0.20, r: 0.05 },
  { id: 2, x: 0.30, y: 0.42, r: 0.04 },
  { id: 3, x: 0.62, y: 0.18, r: 0.06 },
  { id: 4, x: 0.78, y: 0.50, r: 0.05 },
  { id: 5, x: 0.45, y: 0.65, r: 0.07 },
  { id: 6, x: 0.18, y: 0.80, r: 0.05 },
  { id: 7, x: 0.78, y: 0.82, r: 0.06 },
  { id: 8, x: 0.50, y: 0.30, r: 0.04 },
]

function buildKD(objects, depth, maxDepth, region) {
  if (objects.length <= 2 || depth >= maxDepth) {
    return { region, objects, isLeaf: true, depth }
  }
  const axis = depth % 2 === 0 ? 'x' : 'y'
  const sorted = [...objects].sort((a, b) => a[axis] - b[axis])
  const mid = sorted[Math.floor(sorted.length / 2)][axis]

  const left = []
  const right = []
  // For spatial partition: object can appear in both sides if it overlaps split plane
  for (const o of sorted) {
    if (o[axis] - o.r <= mid) left.push(o)
    if (o[axis] + o.r >= mid) right.push(o)
  }

  const leftRegion = { ...region, [axis === 'x' ? 'maxX' : 'maxY']: mid }
  const rightRegion = { ...region, [axis === 'x' ? 'minX' : 'minY']: mid }

  return {
    region, axis, splitValue: mid, depth, isLeaf: false,
    objects,
    left: buildKD(left, depth + 1, maxDepth, leftRegion),
    right: buildKD(right, depth + 1, maxDepth, rightRegion),
  }
}

function flatten(node, list = []) {
  list.push(node)
  if (node.left) flatten(node.left, list)
  if (node.right) flatten(node.right, list)
  return list
}

export default function SpatialPartitionConceptViewer() {
  const [mode, setMode] = useState('kd')
  const [maxDepth, setMaxDepth] = useState(3)
  const [showSplits, setShowSplits] = useState(true)

  const tree = useMemo(() => buildKD(OBJECTS, 0, maxDepth, { minX: 0, minY: 0, maxX: 1, maxY: 1 }), [maxDepth])
  const nodes = useMemo(() => flatten(tree), [tree])

  // count objects spanning split planes
  const overlapping = useMemo(() => {
    let cnt = 0
    for (const node of nodes) {
      if (node.isLeaf) continue
      for (const o of node.objects) {
        const a = o[node.axis]
        if (a - o.r <= node.splitValue && a + o.r >= node.splitValue) cnt++
      }
    }
    return cnt
  }, [nodes])

  const sx = (x) => PAD + x * (W - 2 * PAD)
  const sy = (y) => PAD + y * (H - 2 * PAD)

  // grid mode
  const gridN = 6
  const uniformInfo = OBJECTS.map((o) => ({
    id: o.id,
    cells: [{ i: Math.floor(o.x * gridN), j: Math.floor(o.y * gridN) }],
  }))

  return (
    <div style={panelStyle}>
      <Header title="Spatial Partition · 切空间 (KD-tree 概念)" subtitle="Spatial Partition 是切空间，不是按物体分组。物体跨越分界时需要复制引用。" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: '#070710', display: 'block' }}>
          <rect x={sx(0)} y={sy(0)} width={sx(1) - sx(0)} height={sy(1) - sy(0)} fill="rgba(99,102,241,0.04)" stroke="#6366f1" strokeWidth={1.5} />

          {mode === 'grid' && Array.from({ length: gridN + 1 }).map((_, k) => (
            <g key={k}>
              <line x1={sx(k / gridN)} y1={sy(0)} x2={sx(k / gridN)} y2={sy(1)} stroke="rgba(255,255,255,0.1)" />
              <line x1={sx(0)} y1={sy(k / gridN)} x2={sx(1)} y2={sy(k / gridN)} stroke="rgba(255,255,255,0.1)" />
            </g>
          ))}

          {mode === 'kd' && showSplits && nodes.filter((n) => !n.isLeaf).map((n, idx) => {
            const r = n.region
            if (n.axis === 'x') {
              return (
                <line key={idx} x1={sx(n.splitValue)} y1={sy(r.minY)} x2={sx(n.splitValue)} y2={sy(r.maxY)}
                  stroke={['#f43f5e', '#4ade80', '#fbbf24', '#a5b4fc'][n.depth % 4]} strokeWidth={Math.max(0.5, 2 - n.depth * 0.4)}
                  strokeDasharray={n.depth > 1 ? '4,3' : '0'} />
              )
            } else {
              return (
                <line key={idx} x1={sx(r.minX)} y1={sy(n.splitValue)} x2={sx(r.maxX)} y2={sy(n.splitValue)}
                  stroke={['#f43f5e', '#4ade80', '#fbbf24', '#a5b4fc'][n.depth % 4]} strokeWidth={Math.max(0.5, 2 - n.depth * 0.4)}
                  strokeDasharray={n.depth > 1 ? '4,3' : '0'} />
              )
            }
          })}

          {mode === 'bsp' && showSplits && (
            // BSP-style: arbitrary lines (concept demo)
            <>
              <line x1={sx(0)} y1={sy(0.4)} x2={sx(1)} y2={sy(0.55)} stroke="#f43f5e" strokeWidth={2} />
              <line x1={sx(0.55)} y1={sy(0)} x2={sx(0.45)} y2={sy(0.5)} stroke="#4ade80" strokeWidth={2} strokeDasharray="4,3" />
            </>
          )}

          {/* objects */}
          {OBJECTS.map((o) => (
            <g key={o.id}>
              <circle cx={sx(o.x)} cy={sy(o.y)} r={Math.max(3, o.r * (W - 2 * PAD))} fill="#fbbf24" stroke="#fde68a" strokeWidth={1.5} />
              <text x={sx(o.x)} y={sy(o.y) + 4} fill="#1a1a2a" fontSize="10" textAnchor="middle" fontWeight="bold">{o.id}</text>
            </g>
          ))}
        </svg>

        <div style={sidePanel}>
          <ObsTask>调整深度，看空间被递归切分。同一个三角形（圆代表）可能被切分平面穿过 — 这是 spatial partition 的代价。</ObsTask>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Toggle active={mode === 'grid'} onClick={() => setMode('grid')}>Uniform Grid</Toggle>
            <Toggle active={mode === 'kd'} onClick={() => setMode('kd')}>KD-tree</Toggle>
            <Toggle active={mode === 'bsp'} onClick={() => setMode('bsp')}>BSP (concept)</Toggle>
          </div>

          {mode === 'kd' && (
            <Slider label="kd-tree depth" value={maxDepth} min={1} max={5} step={1} onChange={setMaxDepth} color="#6366f1" />
          )}

          <Toggle active={showSplits} onClick={() => setShowSplits(!showSplits)}>Show splits</Toggle>

          <Status>
            <div>mode: <b style={{ color: '#a5b4fc' }}>{mode === 'kd' ? 'KD-tree (axis-aligned splits)' : mode === 'bsp' ? 'BSP-tree (arbitrary planes)' : 'Uniform Grid'}</b></div>
            {mode === 'kd' && (
              <>
                <div>nodes: {nodes.length}</div>
                <div>leaves: {nodes.filter((n) => n.isLeaf).length}</div>
                <div style={{ marginTop: 4, color: '#fbbf24' }}>对象跨越分界 = {overlapping} 次</div>
              </>
            )}
            <div style={{ marginTop: 4, fontSize: 10, color: '#888', lineHeight: 1.5 }}>
              空间划分 ≠ BVH。空间划分切的是“空间”，几何体可能横跨多个区域；BVH 切的是“物体集合”，每个物体只属于一个 leaf。
            </div>
          </Status>
        </div>
      </div>
    </div>
  )
}
