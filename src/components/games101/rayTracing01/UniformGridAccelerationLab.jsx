import { useState, useMemo } from 'react'
import { Header, ObsTask, Slider, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

const W = 600, H = 380
const PAD = 20

function genObjects(distribution, count, seed = 1) {
  let rand = mulberry32(seed)
  const out = []
  for (let i = 0; i < count; i++) {
    let x, y
    if (distribution === 'uniform') {
      x = rand() * 0.95 + 0.025
      y = rand() * 0.95 + 0.025
    } else if (distribution === 'clustered') {
      const cx = 0.3 + (i % 3) * 0.2
      const cy = 0.4 + Math.floor((i / 3) % 3) * 0.18
      x = cx + (rand() - 0.5) * 0.06
      y = cy + (rand() - 0.5) * 0.06
    } else {
      // sparse: most empty, few corners
      const corner = i % 4
      const cx = corner < 2 ? 0.15 : 0.85
      const cy = corner % 2 === 0 ? 0.2 : 0.8
      x = cx + (rand() - 0.5) * 0.08
      y = cy + (rand() - 0.5) * 0.08
    }
    out.push({ id: i, x, y, r: 0.012 + rand() * 0.012 })
  }
  return out
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// DDA-like grid traversal
function traverseGrid(rayOrigin, rayDir, gridN) {
  const cells = []
  let x = rayOrigin.x, y = rayOrigin.y
  const cellSize = 1 / gridN
  const stepX = rayDir.x > 0 ? 1 : -1
  const stepY = rayDir.y > 0 ? 1 : -1
  let i = Math.floor(x * gridN)
  let j = Math.floor(y * gridN)

  // Compute tDeltaX / tDeltaY (distance along ray to cross one cell)
  const tDeltaX = Math.abs(cellSize / rayDir.x)
  const tDeltaY = Math.abs(cellSize / rayDir.y)

  // tMaxX / tMaxY (distance to next x/y boundary)
  const nextX = stepX > 0 ? (i + 1) * cellSize : i * cellSize
  const nextY = stepY > 0 ? (j + 1) * cellSize : j * cellSize
  let tMaxX = (nextX - x) / rayDir.x
  let tMaxY = (nextY - y) / rayDir.y

  let safety = 0
  while (i >= 0 && i < gridN && j >= 0 && j < gridN && safety < gridN * 2 + 5) {
    cells.push({ i, j })
    if (tMaxX < tMaxY) { tMaxX += tDeltaX; i += stepX }
    else { tMaxY += tDeltaY; j += stepY }
    safety++
  }
  return cells
}

export default function UniformGridAccelerationLab() {
  const [gridN, setGridN] = useState(6)
  const [distribution, setDistribution] = useState('uniform')
  const [count, setCount] = useState(40)
  const [angle, setAngle] = useState(0.5)

  const objects = useMemo(() => genObjects(distribution, count), [distribution, count])

  // Place objects into cells
  const objectsByCell = useMemo(() => {
    const map = {}
    for (const o of objects) {
      const i = Math.floor(o.x * gridN)
      const j = Math.floor(o.y * gridN)
      const key = `${i}-${j}`
      ;(map[key] ||= []).push(o)
    }
    return map
  }, [objects, gridN])

  // Ray
  const rayOrigin = { x: 0.02, y: 0.5 + Math.sin(angle * 1.2) * 0.2 }
  const rayDir = { x: Math.cos(angle * 0.4 + 0.1), y: Math.sin(angle * 0.4 + 0.1) }

  const visited = useMemo(() => traverseGrid(rayOrigin, rayDir, gridN), [rayOrigin, rayDir, gridN])
  const visitedSet = useMemo(() => new Set(visited.map((c) => `${c.i}-${c.j}`)), [visited])

  // tested objects = objects in visited cells
  const testedObjs = visited.flatMap((c) => objectsByCell[`${c.i}-${c.j}`] || [])
  const skippedCount = objects.length - testedObjs.length
  const emptyVisited = visited.filter((c) => !objectsByCell[`${c.i}-${c.j}`]).length

  // svg coords
  const sx = (x) => PAD + x * (W - 2 * PAD)
  const sy = (y) => PAD + y * (H - 2 * PAD)

  return (
    <div style={panelStyle}>
      <Header title="Uniform Grid Acceleration · 均匀网格加速" subtitle="把场景切成 N×N 格，ray 只测试它穿过的 cell 中的物体。" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: '#070710', display: 'block' }}>
          {/* grid */}
          {Array.from({ length: gridN + 1 }).map((_, k) => (
            <g key={k}>
              <line x1={sx(k / gridN)} y1={sy(0)} x2={sx(k / gridN)} y2={sy(1)} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
              <line x1={sx(0)} y1={sy(k / gridN)} x2={sx(1)} y2={sy(k / gridN)} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
            </g>
          ))}

          {/* visited cells */}
          {visited.map((c) => (
            <rect key={`${c.i}-${c.j}`} x={sx(c.i / gridN)} y={sy(c.j / gridN)}
              width={sx((c.i + 1) / gridN) - sx(c.i / gridN)} height={sy((c.j + 1) / gridN) - sy(c.j / gridN)}
              fill={objectsByCell[`${c.i}-${c.j}`] ? 'rgba(251,191,36,0.18)' : 'rgba(99,102,241,0.06)'}
              stroke={objectsByCell[`${c.i}-${c.j}`] ? '#fbbf24' : '#6366f1'}
              strokeWidth={1} strokeDasharray={objectsByCell[`${c.i}-${c.j}`] ? '0' : '3,2'}
            />
          ))}

          {/* objects */}
          {objects.map((o) => {
            const cellKey = `${Math.floor(o.x * gridN)}-${Math.floor(o.y * gridN)}`
            const tested = visitedSet.has(cellKey)
            return (
              <circle key={o.id} cx={sx(o.x)} cy={sy(o.y)}
                r={Math.max(2.5, o.r * (W - 2 * PAD))}
                fill={tested ? '#fbbf24' : '#444'}
                stroke={tested ? '#fde68a' : '#222'}
                strokeWidth={1}
              />
            )
          })}

          {/* ray */}
          <line x1={sx(rayOrigin.x)} y1={sy(rayOrigin.y)}
            x2={sx(Math.min(1.5, rayOrigin.x + rayDir.x * 2))}
            y2={sy(Math.min(1.5, rayOrigin.y + rayDir.y * 2))}
            stroke="#f43f5e" strokeWidth={2.5} />
          <circle cx={sx(rayOrigin.x)} cy={sy(rayOrigin.y)} r={6} fill="#a5b4fc" />
        </svg>

        <div style={sidePanel}>
          <ObsTask>切换 distribution 看 uniform / clustered / sparse 三种场景。clustered 时 grid 命中的格子里物体很多，sparse 时大量 visited 格是空的 — 这就是 grid 不稳定的根源。</ObsTask>

          <Slider label="grid resolution" value={gridN} min={2} max={20} step={1} onChange={setGridN} color="#6366f1" />
          <Slider label="object count" value={count} min={10} max={120} step={1} onChange={setCount} color="#fbbf24" />
          <Slider label="ray direction" value={angle} min={-1.2} max={1.2} step={0.01} onChange={setAngle} precision={2} color="#f43f5e" />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['uniform', 'clustered', 'sparse'].map((d) => (
              <Toggle key={d} active={distribution === d} onClick={() => setDistribution(d)}>{d}</Toggle>
            ))}
          </div>

          <Status>
            <div>visited cells: {visited.length} / {gridN * gridN}</div>
            <div>cells with objects: {visited.length - emptyVisited}</div>
            <div>empty visited: <span style={{ color: '#fbbf24' }}>{emptyVisited}</span> (overhead)</div>
            <div style={{ marginTop: 4 }}>tested objects: <b style={{ color: '#fbbf24' }}>{testedObjs.length}</b></div>
            <div>skipped objects: <b style={{ color: '#4ade80' }}>{skippedCount}</b></div>
          </Status>
        </div>
      </div>
    </div>
  )
}
