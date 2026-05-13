import { useRef, useState, useEffect, useCallback } from 'react'

const OPS = ['split', 'flip', 'collapse']
const OP_LABELS = { split: 'Edge Split', flip: 'Edge Flip', collapse: 'Edge Collapse' }
const OP_DESC = {
  split: '在边上插入新顶点，相邻三角形被分裂 → 增加局部细节',
  flip: '对角线换成另一条 → 改善三角形质量或调整连接',
  collapse: '两个端点合并成一个 → 减少网格复杂度',
}

// Before states
const BEFORE = {
  split: { verts: [{x:100,y:300},{x:300,y:300},{x:200,y:100},{x:200,y:350}], tris: [[0,1,2],[0,3,1]], edge: [0,1] },
  flip: { verts: [{x:100,y:280},{x:300,y:280},{x:200,y:80},{x:200,y:380}], tris: [[0,1,2],[0,3,1]], edge: [0,1] },
  collapse: { verts: [{x:100,y:280},{x:300,y:280},{x:200,y:80},{x:200,y:380}], tris: [[0,1,2],[0,3,1]], edge: [0,1] },
}

// After states
const AFTER = {
  split: { verts: [{x:100,y:300},{x:300,y:300},{x:200,y:100},{x:200,y:350},{x:200,y:300}], tris: [[0,4,2],[4,1,2],[0,3,4],[4,3,1]], edge: null },
  flip: { verts: [{x:100,y:280},{x:300,y:280},{x:200,y:80},{x:200,y:380}], tris: [[0,3,2],[3,1,2]], edge: [2,3] },
  collapse: { verts: [{x:200,y:280},{x:200,y:280},{x:200,y:80},{x:200,y:380}], tris: [[0,2,2],[0,3,2]], collapsed: true, newVert: {x:200,y:280} },
}

export default function LocalMeshOperationsLab() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [op, setOp] = useState('split')
  const [showAfter, setShowAfter] = useState(false)
  const [size, setSize] = useState({ w: 500, h: 360 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const w = Math.min(entries[0].contentRect.width, 500)
      setSize({ w, h: Math.max(300, w * 0.72) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

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

    // Scale to fit
    const sx = size.w / 500, sy = size.h / 420
    const s = Math.min(sx, sy)
    ctx.save()
    ctx.translate((size.w - 400 * s) / 2, (size.h - 400 * s) / 2)
    ctx.scale(s, s)

    const state = showAfter ? AFTER[op] : BEFORE[op]
    const { verts, tris, edge } = state

    // Draw triangles
    for (const tri of tris) {
      if (state.collapsed && (tri[0] === tri[1] || tri[1] === tri[2] || tri[0] === tri[2])) continue
      ctx.beginPath()
      ctx.moveTo(verts[tri[0]].x, verts[tri[0]].y)
      ctx.lineTo(verts[tri[1]].x, verts[tri[1]].y)
      ctx.lineTo(verts[tri[2]].x, verts[tri[2]].y)
      ctx.closePath()
      ctx.fillStyle = 'rgba(99,102,241,0.06)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Highlight edge
    if (edge) {
      ctx.beginPath()
      ctx.moveTo(verts[edge[0]].x, verts[edge[0]].y)
      ctx.lineTo(verts[edge[1]].x, verts[edge[1]].y)
      ctx.strokeStyle = showAfter ? '#4ade80' : '#f59e0b'
      ctx.lineWidth = 4
      ctx.stroke()
    }

    // Vertices
    for (let i = 0; i < verts.length; i++) {
      if (state.collapsed && i === 1) continue
      const v = verts[i]
      const isNew = showAfter && i >= BEFORE[op].verts.length
      ctx.beginPath()
      ctx.arc(v.x, v.y, isNew ? 9 : 7, 0, Math.PI * 2)
      ctx.fillStyle = isNew ? '#f59e0b' : '#6366f1'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Collapsed indicator
    if (showAfter && state.collapsed && state.newVert) {
      ctx.beginPath()
      ctx.arc(state.newVert.x, state.newVert.y, 11, 0, Math.PI * 2)
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 3])
      ctx.stroke()
      ctx.setLineDash([])
    }

    ctx.restore()

    // State label
    ctx.fillStyle = showAfter ? '#4ade80' : '#f59e0b'
    ctx.font = 'bold 12px system-ui'
    ctx.fillText(showAfter ? 'AFTER' : 'BEFORE', 16, 24)
  }, [op, showAfter, size])

  const btnStyle = (active) => ({
    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
    border: active ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
    background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
    color: active ? '#a5b4fc' : '#888', transition: 'all 0.15s',
  })

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <div style={{ padding: '10px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {OPS.map(o => <button key={o} style={btnStyle(op === o)} onClick={() => { setOp(o); setShowAfter(false) }}>{OP_LABELS[o]}</button>)}
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: size.h, display: 'block' }} />
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <button
            style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', border: '1px solid rgba(245,158,11,0.4)', background: showAfter ? 'rgba(74,222,128,0.1)' : 'rgba(245,158,11,0.08)', color: showAfter ? '#4ade80' : '#fbbf24' }}
            onClick={() => setShowAfter(!showAfter)}
          >{showAfter ? '← Before' : 'Apply →'}</button>
          <span style={{ fontSize: '12px', color: '#888' }}>{OP_DESC[op]}</span>
        </div>
      </div>
    </div>
  )
}
