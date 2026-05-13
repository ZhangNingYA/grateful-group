import { useRef, useState, useEffect, useCallback } from 'react'

// 2D triangle patch for demonstrating Loop subdivision visually
function generateTriPatch() {
  const verts = [
    {x:250,y:50},{x:80,y:320},{x:420,y:320}, // outer triangle
    {x:165,y:185},{x:335,y:185},{x:250,y:320}, // midpoints (edge verts after split)
  ]
  const tris = [[0,1,2]]
  return { verts: verts.slice(0,3), tris, allVerts: verts }
}

function subdivideTriPatch(verts, tris) {
  const newVerts = [...verts]
  const edgeMap = {}
  const edgeKey = (a,b) => Math.min(a,b)+'_'+Math.max(a,b)

  for (const [a,b,c] of tris) {
    for (const [e0,e1] of [[a,b],[b,c],[c,a]]) {
      const k = edgeKey(e0,e1)
      if (edgeMap[k] === undefined) {
        const mid = { x: (verts[e0].x + verts[e1].x)/2, y: (verts[e0].y + verts[e1].y)/2 }
        newVerts.push(mid)
        edgeMap[k] = newVerts.length - 1
      }
    }
  }

  const newTris = []
  for (const [a,b,c] of tris) {
    const ab = edgeMap[edgeKey(a,b)]
    const bc = edgeMap[edgeKey(b,c)]
    const ca = edgeMap[edgeKey(c,a)]
    newTris.push([a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca])
  }
  return { verts: newVerts, tris: newTris }
}

export default function LoopSubdivisionLab() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [level, setLevel] = useState(0)
  const [showNewVerts, setShowNewVerts] = useState(true)
  const [showStencil, setShowStencil] = useState(false)
  const [size, setSize] = useState({ w: 520, h: 380 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const w = Math.min(entries[0].contentRect.width, 520)
      setSize({ w, h: Math.max(320, w * 0.73) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const meshData = useCallback(() => {
    let data = { verts: [{x:250,y:50},{x:60,y:340},{x:440,y:340}], tris: [[0,1,2]] }
    const origCount = data.verts.length
    for (let i = 0; i < level; i++) {
      data = subdivideTriPatch(data.verts, data.tris)
    }
    return { ...data, origCount }
  }, [level])

  useEffect(() => { draw() })

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)

    const { verts, tris, origCount } = meshData()

    // Scale
    const sx = size.w / 520, sy = size.h / 400
    const s = Math.min(sx, sy)
    ctx.save()
    ctx.translate((size.w - 500*s)/2, (size.h - 380*s)/2)
    ctx.scale(s, s)

    // Draw triangles
    for (const [a,b,c] of tris) {
      ctx.beginPath()
      ctx.moveTo(verts[a].x, verts[a].y)
      ctx.lineTo(verts[b].x, verts[b].y)
      ctx.lineTo(verts[c].x, verts[c].y)
      ctx.closePath()
      ctx.fillStyle = 'rgba(99,102,241,0.04)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1.2
      ctx.stroke()
    }

    // Stencil weights display
    if (showStencil && level > 0) {
      // Show weight labels on first new edge vertex
      const firstNew = origCount
      if (firstNew < verts.length) {
        const nv = verts[firstNew]
        ctx.fillStyle = 'rgba(245,158,11,0.8)'
        ctx.font = '10px monospace'
        ctx.fillText('3/8', nv.x - 30, nv.y - 8)
        ctx.fillText('3/8', nv.x + 10, nv.y - 8)
        ctx.fillStyle = 'rgba(74,222,128,0.8)'
        ctx.fillText('1/8', nv.x - 10, nv.y + 18)
      }
    }

    // Vertices
    for (let i = 0; i < verts.length; i++) {
      const v = verts[i]
      const isOld = i < origCount
      if (!showNewVerts && !isOld) continue

      ctx.beginPath()
      ctx.arc(v.x, v.y, isOld ? 7 : 5, 0, Math.PI * 2)
      ctx.fillStyle = isOld ? '#6366f1' : '#f59e0b'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = isOld ? 2 : 1.5
      ctx.stroke()
    }

    ctx.restore()
  }, [level, showNewVerts, showStencil, size, meshData])

  const btnStyle = (active) => ({
    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
    border: active ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.06)',
    background: active ? 'rgba(245,158,11,0.08)' : 'transparent',
    color: active ? '#fbbf24' : '#666',
  })

  const data = meshData()

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: size.h, display: 'block' }} />
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>Level</span>
          <input type="range" min="0" max="4" step="1" value={level}
            onChange={(e) => setLevel(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: '#6366f1' }} />
          <span style={{ fontSize: '13px', color: '#a5b4fc', fontFamily: 'monospace' }}>{level}</span>
          <button style={btnStyle(showNewVerts)} onClick={() => setShowNewVerts(!showNewVerts)}>New Verts</button>
          <button style={btnStyle(showStencil)} onClick={() => setShowStencil(!showStencil)}>Weights</button>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>
          <span>Verts: <span style={{ color: '#a5b4fc' }}>{data.verts.length}</span></span>
          <span>Tris: <span style={{ color: '#a5b4fc' }}>{data.tris.length}</span></span>
          <span><span style={{ color: '#6366f1' }}>●</span> old  <span style={{ color: '#f59e0b' }}>●</span> new</span>
        </div>
      </div>
    </div>
  )
}
