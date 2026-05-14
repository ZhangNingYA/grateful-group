import { useState, useMemo } from 'react'
import { Header, ObsTask, Slider, Toggle, Status, Pill, panelStyle, sidePanel } from './ui.jsx'

const W = 600, H = 400, PAD = 24

const OBJECTS = [
  { id: 'A', x: 0.10, y: 0.20, r: 0.06 },
  { id: 'B', x: 0.18, y: 0.32, r: 0.05 },
  { id: 'C', x: 0.28, y: 0.18, r: 0.05 },
  { id: 'D', x: 0.40, y: 0.50, r: 0.06 },
  { id: 'E', x: 0.55, y: 0.45, r: 0.05 },
  { id: 'F', x: 0.62, y: 0.30, r: 0.05 },
  { id: 'G', x: 0.78, y: 0.20, r: 0.06 },
  { id: 'H', x: 0.85, y: 0.40, r: 0.05 },
  { id: 'I', x: 0.30, y: 0.75, r: 0.05 },
  { id: 'J', x: 0.55, y: 0.80, r: 0.06 },
  { id: 'K', x: 0.72, y: 0.70, r: 0.05 },
  { id: 'L', x: 0.88, y: 0.78, r: 0.05 },
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
function buildBVH(objects, depth = 0, maxLeaf = 2, maxDepth = 5) {
  const bbox = bboxOf(objects)
  const node = { id: ++_id, depth, bbox, objects, isLeaf: false, left: null, right: null, axis: null }
  if (objects.length <= maxLeaf || depth >= maxDepth) {
    node.isLeaf = true
    return node
  }
  const axis = (bbox.maxX - bbox.minX) >= (bbox.maxY - bbox.minY) ? 'x' : 'y'
  const sorted = [...objects].sort((a, b) => a[axis] - b[axis])
  const mid = Math.floor(sorted.length / 2)
  node.axis = axis
  node.left = buildBVH(sorted.slice(0, mid), depth + 1, maxLeaf, maxDepth)
  node.right = buildBVH(sorted.slice(mid), depth + 1, maxLeaf, maxDepth)
  return node
}

function intersectAABB2D(ray, bbox) {
  let tMin = -Infinity, tMax = Infinity
  for (const ax of ['x', 'y']) {
    const o = ray.origin[ax], d = ray.direction[ax]
    const lo = bbox[ax === 'x' ? 'minX' : 'minY']
    const hi = bbox[ax === 'x' ? 'maxX' : 'maxY']
    if (Math.abs(d) < 1e-9) {
      if (o < lo || o > hi) return { hit: false }
      continue
    }
    let t0 = (lo - o) / d
    let t1 = (hi - o) / d
    if (t0 > t1) [t0, t1] = [t1, t0]
    tMin = Math.max(tMin, t0)
    tMax = Math.min(tMax, t1)
    if (tMin > tMax) return { hit: false }
  }
  return { hit: tMax >= 0, tEnter: tMin, tExit: tMax }
}

function intersectCircle(ray, c) {
  const ocx = ray.origin.x - c.x, ocy = ray.origin.y - c.y
  const d = ray.direction
  const aa = d.x * d.x + d.y * d.y
  const bb = 2 * (ocx * d.x + ocy * d.y)
  const cc = ocx * ocx + ocy * ocy - c.r * c.r
  const disc = bb * bb - 4 * aa * cc
  if (disc < 0) return null
  const t = (-bb - Math.sqrt(disc)) / (2 * aa)
  return t > 1e-4 ? t : null
}

function traverse(ray, node, log, stats, closest) {
  stats.bboxTests++
  const t = intersectAABB2D(ray, node.bbox)
  log.push({ type: 'bboxTest', nodeId: node.id, depth: node.depth, hit: t.hit, isLeaf: node.isLeaf })
  if (!t.hit) {
    log.push({ type: 'skip', nodeId: node.id, count: countObjs(node) })
    stats.skipped += countObjs(node)
    return
  }
  if (node.isLeaf) {
    for (const o of node.objects) {
      stats.objTests++
      const ti = intersectCircle(ray, o)
      log.push({ type: 'objTest', nodeId: node.id, objId: o.id, hit: ti !== null, t: ti })
      if (ti !== null && ti < closest.t) {
        closest.t = ti
        closest.obj = o
      }
    }
    return
  }
  // visit nearer first (heuristic)
  const tL = intersectAABB2D(ray, node.left.bbox)
  const tR = intersectAABB2D(ray, node.right.bbox)
  const leftFirst = (tL.hit ? tL.tEnter : Infinity) <= (tR.hit ? tR.tEnter : Infinity)
  if (leftFirst) {
    traverse(ray, node.left, log, stats, closest)
    traverse(ray, node.right, log, stats, closest)
  } else {
    traverse(ray, node.right, log, stats, closest)
    traverse(ray, node.left, log, stats, closest)
  }
}

function countObjs(node) {
  if (node.isLeaf) return node.objects.length
  return countObjs(node.left) + countObjs(node.right)
}

function flatten(node, list = []) {
  if (!node) return list
  list.push(node)
  flatten(node.left, list)
  flatten(node.right, list)
  return list
}

export default function BVHTraversalDebugger() {
  const [origin, setOrigin] = useState({ x: -0.05, y: 0.5 })
  const [angle, setAngle] = useState(0.05)
  const [step, setStep] = useState(999)
  const [autoplay, setAutoplay] = useState(false)
  const [drag, setDrag] = useState(null)

  const tree = useMemo(() => { _id = 0; return buildBVH(OBJECTS, 0, 2, 5) }, [])

  const dir = { x: Math.cos(angle), y: Math.sin(angle) }
  const ray = { origin, direction: dir }

  const { log, stats, closest } = useMemo(() => {
    const log = [], stats = { bboxTests: 0, objTests: 0, skipped: 0 }, closest = { t: Infinity, obj: null }
    traverse(ray, tree, log, stats, closest)
    return { log, stats, closest }
  }, [ray, tree])

  // step subset
  const visibleLog = log.slice(0, Math.min(step, log.length))
  const currentStep = visibleLog[visibleLog.length - 1] || null

  // running stats up to currentStep
  const partialStats = useMemo(() => {
    let bb = 0, ob = 0, sk = 0
    for (const e of visibleLog) {
      if (e.type === 'bboxTest') bb++
      if (e.type === 'objTest') ob++
      if (e.type === 'skip') sk += e.count
    }
    return { bboxTests: bb, objTests: ob, skipped: sk }
  }, [visibleLog])

  const allNodes = useMemo(() => flatten(tree), [tree])

  // svg coords
  const sx = (x) => PAD + x * (W - 2 * PAD)
  const sy = (y) => PAD + y * (H - 2 * PAD)

  // Per-node states
  const nodeState = useMemo(() => {
    const state = {}
    for (const n of allNodes) state[n.id] = { tested: false, hit: null, skipped: false }
    for (const e of visibleLog) {
      if (e.type === 'bboxTest') state[e.nodeId] = { tested: true, hit: e.hit, isLeaf: e.isLeaf, depth: e.depth }
      if (e.type === 'skip') {
        // mark whole subtree
        const mark = (id) => {
          const node = allNodes.find((n) => n.id === id)
          if (!node) return
          state[id] = { ...state[id], skipped: true }
          if (node.left) mark(node.left.id)
          if (node.right) mark(node.right.id)
        }
        mark(e.nodeId)
      }
    }
    return state
  }, [visibleLog, allNodes])

  // tested objects
  const objStates = useMemo(() => {
    const m = {}
    for (const e of visibleLog) {
      if (e.type === 'objTest') m[e.objId] = { tested: true, hit: e.hit, t: e.t }
    }
    return m
  }, [visibleLog])

  const onDown = (which) => (e) => { e.preventDefault(); setDrag(which) }
  const onMove = (e) => {
    if (!drag) return
    const r = e.currentTarget.getBoundingClientRect()
    const sxv = ((e.clientX - r.left) / r.width) * W
    const syv = ((e.clientY - r.top) / r.height) * H
    const wx = (sxv - PAD) / (W - 2 * PAD)
    const wy = (syv - PAD) / (H - 2 * PAD)
    if (drag === 'origin') setOrigin({ x: wx, y: wy })
  }

  return (
    <div style={panelStyle}>
      <Header title="BVH Traversal Debugger · 步进观察 ray 如何穿过 BVH"
        subtitle="逐步推进，观察 bbox 测试 / 跳过整个子树 / leaf 内的对象测试。"
        right={<Pill ok={closest.obj} label={closest.obj ? `closest = ${closest.obj.id} t=${closest.t.toFixed(2)}` : 'no hit'} />}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)' }}>
        <svg viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', background: '#070710', display: 'block', cursor: drag ? 'grabbing' : 'crosshair' }}
          onMouseMove={onMove}
          onMouseUp={() => setDrag(null)}
          onMouseLeave={() => setDrag(null)}
        >
          {/* root box */}
          <rect x={sx(0)} y={sy(0)} width={sx(1) - sx(0)} height={sy(1) - sy(0)}
            fill="rgba(99,102,241,0.03)" stroke="rgba(99,102,241,0.3)" strokeWidth={1} />

          {/* nodes */}
          {allNodes.map((n) => {
            const st = nodeState[n.id]
            if (!st || (!st.tested && !st.skipped)) return null
            const color = st.skipped ? '#3a3a4a'
              : st.hit === false ? '#f87171'
                : st.hit === true ? '#4ade80'
                  : '#fbbf24'
            return (
              <rect key={n.id}
                x={sx(n.bbox.minX)} y={sy(n.bbox.minY)}
                width={sx(n.bbox.maxX) - sx(n.bbox.minX)} height={sy(n.bbox.maxY) - sy(n.bbox.minY)}
                fill={st.hit ? 'rgba(74,222,128,0.06)' : 'transparent'}
                stroke={color}
                strokeWidth={Math.max(0.6, 2 - n.depth * 0.3)}
                strokeDasharray={n.isLeaf ? '0' : '4,3'}
                opacity={st.skipped ? 0.4 : 1}
              />
            )
          })}

          {/* objects */}
          {OBJECTS.map((o) => {
            const st = objStates[o.id]
            const fill = st?.hit ? '#4ade80' : st ? '#fbbf24' : '#6366f1'
            const isClosest = closest.obj?.id === o.id && step >= log.length
            return (
              <g key={o.id}>
                <circle cx={sx(o.x)} cy={sy(o.y)} r={Math.max(4, o.r * (W - 2 * PAD))}
                  fill={fill} stroke={isClosest ? '#fff' : 'rgba(0,0,0,0.5)'}
                  strokeWidth={isClosest ? 2.5 : 1}
                />
                <text x={sx(o.x)} y={sy(o.y) + 4} fill="#1a1a2a" fontSize="10" textAnchor="middle" fontWeight="bold">{o.id}</text>
              </g>
            )
          })}

          {/* ray */}
          <line x1={sx(origin.x)} y1={sy(origin.y)}
            x2={sx(Math.min(1.5, origin.x + dir.x * 2))}
            y2={sy(Math.min(1.5, origin.y + dir.y * 2))}
            stroke="#fde68a" strokeWidth={2.5} />
          <g onMouseDown={onDown('origin')} style={{ cursor: 'grab' }}>
            <circle cx={sx(origin.x)} cy={sy(origin.y)} r={9} fill="#a5b4fc" stroke="#fff" strokeWidth={1.5} />
          </g>
        </svg>

        <div style={sidePanel}>
          <ObsTask>步进观察。注意：ray miss 一个大 box 时，整个子树（多个 objects）一次性被跳过。这就是 BVH 加速的核心。</ObsTask>

          <Slider label="step" value={Math.min(step, log.length)} min={0} max={log.length} step={1} onChange={setStep} color="#fbbf24" />
          <Slider label="ray angle" value={angle} min={-0.6} max={0.6} step={0.005} onChange={setAngle} precision={3} color="#fde68a" />

          <div style={{ display: 'flex', gap: 6 }}>
            <Toggle active={false} onClick={() => setStep(0)}>Reset</Toggle>
            <Toggle active={false} onClick={() => setStep(log.length)}>Run All</Toggle>
            <Toggle active={false} onClick={() => setStep((s) => Math.min(log.length, s + 1))}>+1</Toggle>
          </div>

          <Status>
            <div>step: {Math.min(step, log.length)} / {log.length}</div>
            <div>bbox tests: {partialStats.bboxTests}</div>
            <div>obj tests: {partialStats.objTests}</div>
            <div style={{ color: '#4ade80' }}>skipped: {partialStats.skipped}</div>
            <div style={{ marginTop: 4 }}>
              brute force would test: {OBJECTS.length} objs<br />
              BVH tests so far: {partialStats.objTests} objs (+ {partialStats.bboxTests} bbox)
            </div>
            {currentStep && (
              <div style={{ marginTop: 4, color: '#a5b4fc', fontSize: 10 }}>
                last: {currentStep.type === 'bboxTest' ? `bbox node #${currentStep.nodeId} → ${currentStep.hit ? 'HIT' : 'MISS'}` :
                  currentStep.type === 'skip' ? `skip subtree of #${currentStep.nodeId} (${currentStep.count} objs)` :
                    `obj test ${currentStep.objId} → ${currentStep.hit ? 'HIT' : 'miss'}`}
              </div>
            )}
          </Status>

          <details style={{ fontSize: 10, color: '#888' }}>
            <summary style={{ cursor: 'pointer', color: '#a5b4fc' }}>查看伪代码</summary>
            <pre style={{ margin: 0, padding: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 6, color: '#cbd5e1', overflow: 'auto' }}>
{`function intersectBVH(ray, node) {
  if (!intersectAABB(ray, node.bbox)) return miss
  if (node.isLeaf) {
    return intersectObjects(ray, node.objects)
  }
  const hL = intersectBVH(ray, node.left)
  const hR = intersectBVH(ray, node.right)
  return closer(hL, hR)
}`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}
