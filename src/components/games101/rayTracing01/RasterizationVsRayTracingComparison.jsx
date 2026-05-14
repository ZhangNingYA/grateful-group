import { useState, useMemo } from 'react'
import { barycentric2D } from './rayUtils.js'

const W = 360, H = 280
const GRID_N = 12
const CELL = W / GRID_N

const TRIS = [
  { id: 'A', color: '#6366f1', verts: [{ x: 80, y: 60 }, { x: 220, y: 50 }, { x: 180, y: 200 }] },
  { id: 'B', color: '#f43f5e', verts: [{ x: 200, y: 130 }, { x: 320, y: 100 }, { x: 290, y: 230 }] },
  { id: 'C', color: '#4ade80', verts: [{ x: 60, y: 180 }, { x: 170, y: 230 }, { x: 100, y: 250 }] },
]

function pointInTri(p, t) {
  const r = barycentric2D(p, t.verts[0], t.verts[1], t.verts[2])
  return r.inside
}

export default function RasterizationVsRayTracingComparison() {
  const [hover, setHover] = useState(null) // { i, j }
  const [mode, setMode] = useState('side') // side | tri | pix

  // For each pixel, find covering triangles
  const cover = useMemo(() => {
    const map = {}
    for (let j = 0; j < GRID_N; j++) {
      for (let i = 0; i < GRID_N; i++) {
        const px = i * CELL + CELL / 2
        const py = j * CELL + CELL / 2
        const hits = TRIS.filter((t) => pointInTri({ x: px, y: py }, t))
        map[`${i}-${j}`] = hits
      }
    }
    return map
  }, [])

  const hoveredTris = hover ? cover[`${hover.i}-${hover.j}`] || [] : []

  return (
    <div style={{
      width: '100%', borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.18)',
      background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      <div style={{ padding: '14px 18px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div>
          <div style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600 }}>Rasterization vs Ray Tracing</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>悬停在像素格子上，观察两种范式如何回答“这个像素 / 这个三角形”的问题。</div>
        </div>
        <div style={{ fontSize: 10, color: '#888', fontFamily: 'monospace' }}>
          {hover ? `pixel (${hover.i}, ${hover.j})` : 'hover a pixel'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: '#0a0a14' }}>
        {/* Rasterization Side */}
        <Side title="Rasterization · object → screen" subtitle="问：这个三角形覆盖哪些像素？" accent="#6366f1">
          <Canvas2D
            mode="raster"
            hover={hover} setHover={setHover}
            hoveredTris={hoveredTris}
            cover={cover}
          />
        </Side>

        <Side title="Ray Tracing · pixel → scene" subtitle="问：这个像素看到哪一个物体？" accent="#fbbf24">
          <Canvas2D
            mode="raytrace"
            hover={hover} setHover={setHover}
            hoveredTris={hoveredTris}
            cover={cover}
          />
        </Side>
      </div>

      <div style={{ padding: '12px 18px', background: 'rgba(15,15,26,0.6)', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 11, color: '#aaa' }}>
        <div style={{ padding: 10, borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div style={{ color: '#a5b4fc', fontWeight: 600, marginBottom: 4 }}>Rasterization</div>
          for each <b>triangle</b>: 投影到屏幕，遍历它覆盖的所有 pixel，比较深度。
        </div>
        <div style={{ padding: 10, borderRadius: 8, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <div style={{ color: '#fbbf24', fontWeight: 600, marginBottom: 4 }}>Ray Tracing</div>
          for each <b>pixel</b>: 发射 ray，遍历可能命中的物体，找最近的交点。
        </div>
      </div>

      <div style={{ padding: '10px 18px 14px', background: 'rgba(15,15,26,0.85)', fontSize: 11, color: '#888', fontFamily: 'monospace' }}>
        {hover ? (
          <>
            <span style={{ color: '#a5b4fc' }}>raster</span>: 像素 ({hover.i}, {hover.j}) 被
            {hoveredTris.length === 0 ? ' 没有三角形 ' : ` ${hoveredTris.map(t => t.id).join(', ')} `}
            覆盖 &nbsp; · &nbsp;
            <span style={{ color: '#fbbf24' }}>raytrace</span>: 该像素 ray 命中
            {hoveredTris.length === 0 ? ' 背景' : ` ${hoveredTris[0].id}（最近的三角形，z-test 模拟）`}
          </>
        ) : '👉 把鼠标移到任意一格像素上观察对应关系'}
      </div>
    </div>
  )
}

function Side({ title, subtitle, accent, children }) {
  return (
    <div style={{ padding: 14, borderRight: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ fontSize: 11, color: accent, fontWeight: 600, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 10, color: '#666', marginBottom: 10 }}>{subtitle}</div>
      {children}
    </div>
  )
}

function Canvas2D({ mode, hover, setHover, hoveredTris, cover }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', background: '#070710', borderRadius: 8 }}>
      {/* Grid */}
      {Array.from({ length: GRID_N }).map((_, i) => (
        <line key={`vx-${i}`} x1={i * CELL} y1={0} x2={i * CELL} y2={H} stroke="rgba(255,255,255,0.05)" />
      ))}
      {Array.from({ length: GRID_N }).map((_, j) => (
        <line key={`hz-${j}`} x1={0} y1={j * CELL} x2={W} y2={j * CELL} stroke="rgba(255,255,255,0.05)" />
      ))}

      {/* Triangles (rasterization side: filled; raytrace side: outlined targets) */}
      {TRIS.map((t) => (
        <polygon
          key={t.id}
          points={t.verts.map((v) => `${v.x},${v.y}`).join(' ')}
          fill={mode === 'raster' ? `${t.color}33` : 'none'}
          stroke={t.color}
          strokeWidth={1.5}
        />
      ))}

      {/* Highlight covered pixels in raster mode for hovered triangle */}
      {mode === 'raster' && hoveredTris.map((t) => {
        const cells = []
        Object.entries(cover).forEach(([key, hits]) => {
          if (hits.find((h) => h.id === t.id)) {
            const [i, j] = key.split('-').map(Number)
            cells.push(<rect key={`${t.id}-${key}`} x={i * CELL + 1} y={j * CELL + 1} width={CELL - 2} height={CELL - 2} fill={`${t.color}66`} />)
          }
        })
        return <g key={t.id}>{cells}</g>
      })}

      {/* Hover cell */}
      {hover && (
        <rect
          x={hover.i * CELL} y={hover.j * CELL} width={CELL} height={CELL}
          fill="rgba(251,191,36,0.18)" stroke="#fbbf24" strokeWidth={1.5}
        />
      )}

      {/* Ray from camera in raytrace mode */}
      {mode === 'raytrace' && hover && (
        <>
          <line
            x1={W / 2} y1={H + 30}
            x2={hover.i * CELL + CELL / 2} y2={hover.j * CELL + CELL / 2}
            stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4,3"
          />
          {hoveredTris[0] && (
            <line
              x1={hover.i * CELL + CELL / 2} y1={hover.j * CELL + CELL / 2}
              x2={(hoveredTris[0].verts[0].x + hoveredTris[0].verts[1].x + hoveredTris[0].verts[2].x) / 3}
              y2={(hoveredTris[0].verts[0].y + hoveredTris[0].verts[1].y + hoveredTris[0].verts[2].y) / 3}
              stroke="#4ade80" strokeWidth={2}
            />
          )}
          <circle cx={W / 2} cy={H + 30} r={6} fill="#fbbf24" />
        </>
      )}

      {/* Mouse capture overlay */}
      <rect
        x={0} y={0} width={W} height={H}
        fill="transparent"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          const sx = ((e.clientX - r.left) / r.width) * W
          const sy = ((e.clientY - r.top) / r.height) * H
          const i = Math.floor(sx / CELL)
          const j = Math.floor(sy / CELL)
          if (i >= 0 && i < GRID_N && j >= 0 && j < GRID_N) setHover({ i, j })
        }}
        onMouseLeave={() => setHover(null)}
      />
    </svg>
  )
}
