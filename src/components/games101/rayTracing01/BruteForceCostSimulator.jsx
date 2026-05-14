import { useState, useMemo } from 'react'
import { Header, ObsTask, Slider, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

const PRESETS = {
  toy: { width: 320, height: 240, spp: 1, triangles: 1000, bounces: 1, label: 'Toy scene' },
  hw: { width: 800, height: 600, spp: 4, triangles: 50000, bounces: 4, label: 'Homework scene' },
  film: { width: 1920, height: 1080, spp: 64, triangles: 500000, bounces: 8, label: 'Film quality' },
  path: { width: 1280, height: 720, spp: 16, triangles: 200000, bounces: 6, label: 'Path tracing preview' },
}

function fmtBig(n) {
  if (n < 1e3) return n.toFixed(0)
  if (n < 1e6) return (n / 1e3).toFixed(2) + 'K'
  if (n < 1e9) return (n / 1e6).toFixed(2) + 'M'
  if (n < 1e12) return (n / 1e9).toFixed(2) + 'B'
  return (n / 1e12).toFixed(2) + 'T'
}

function fmtTime(seconds) {
  if (seconds < 1) return (seconds * 1000).toFixed(0) + 'ms'
  if (seconds < 60) return seconds.toFixed(1) + 's'
  if (seconds < 3600) return (seconds / 60).toFixed(1) + ' min'
  if (seconds < 3600 * 24) return (seconds / 3600).toFixed(2) + ' h'
  return (seconds / (3600 * 24)).toFixed(2) + ' day'
}

export default function BruteForceCostSimulator() {
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [spp, setSpp] = useState(4)
  const [triangles, setTriangles] = useState(50000)
  const [bounces, setBounces] = useState(4)
  const [accel, setAccel] = useState(false)

  const totalRays = width * height * spp * bounces
  const testsBrute = totalRays * triangles
  // BVH approx: log2 triangles
  const testsBVH = totalRays * Math.max(1, Math.log2(Math.max(2, triangles))) * 4
  const tests = accel ? testsBVH : testsBrute

  // Assume 100M tests/sec
  const seconds = tests / 1e8

  // Visualization: animate rays
  const cellsPerRow = 40
  const cells = useMemo(() => {
    const out = []
    for (let i = 0; i < cellsPerRow * 8; i++) {
      out.push({
        i,
        delay: (i % cellsPerRow) * 0.04 + Math.floor(i / cellsPerRow) * 0.18,
      })
    }
    return out
  }, [])

  const apply = (key) => {
    const p = PRESETS[key]
    setWidth(p.width); setHeight(p.height); setSpp(p.spp); setTriangles(p.triangles); setBounces(p.bounces)
  }

  const cost = tests
  const warningLevel = cost > 1e10 ? 'critical' : cost > 1e8 ? 'warn' : 'ok'

  return (
    <div style={panelStyle}>
      <Header title="Brute Force Cost · 为什么 Ray Tracing 很慢"
        subtitle="估算 intersection tests 数量 = pixels × spp × bounces × triangles。"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)' }}>
        <div style={{ padding: 16, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          {/* visualization */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cellsPerRow}, 1fr)`, gap: 1, padding: 8, background: '#070710', borderRadius: 8, marginBottom: 12 }}>
            {cells.slice(0, cellsPerRow * 8).map((c) => (
              <div key={c.i} style={{
                aspectRatio: '1 / 1',
                background: '#1a2240',
                borderRadius: 1,
                animation: `bfPulse 2s linear infinite`,
                animationDelay: `${c.delay}s`,
              }} />
            ))}
            <style>{`
              @keyframes bfPulse {
                0% { background: #1a2240; }
                10% { background: #fbbf24; }
                30% { background: rgba(251,191,36,0.6); }
                100% { background: #1a2240; }
              }
            `}</style>
          </div>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 8 }}>每个 pixel 发出 ray，每条 ray 都要扫 triangles。</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Stat label="image size" value={`${width} × ${height}`} sub={`${fmtBig(width * height)} pixels`} color="#6366f1" />
            <Stat label="primary rays" value={fmtBig(width * height * spp)} sub={`× ${spp} spp`} color="#a5b4fc" />
            <Stat label="total rays" value={fmtBig(totalRays)} sub={`× ${bounces} bounces`} color="#fde68a" />
            <Stat label="triangle tests" value={fmtBig(tests)} sub={accel ? '≈ BVH log₂' : 'brute force'}
              color={warningLevel === 'critical' ? '#f87171' : warningLevel === 'warn' ? '#fbbf24' : '#4ade80'}
              big
            />
            <Stat label="est. wall time" value={fmtTime(seconds)} sub="@ 100M tests/sec"
              color={warningLevel === 'critical' ? '#f87171' : warningLevel === 'warn' ? '#fbbf24' : '#4ade80'}
              big
            />
            <Stat label="speedup" value={accel ? `${fmtBig(testsBrute / testsBVH)}×` : '1×'} sub={accel ? 'BVH vs brute' : 'no accel'} color="#4ade80" />
          </div>

          <div style={{
            marginTop: 12, padding: 10, borderRadius: 8,
            background: warningLevel === 'critical'
              ? 'linear-gradient(90deg, rgba(248,113,113,0.12), rgba(248,113,113,0.04))'
              : warningLevel === 'warn' ? 'rgba(251,191,36,0.08)' : 'rgba(74,222,128,0.06)',
            border: `1px solid ${warningLevel === 'critical' ? 'rgba(248,113,113,0.3)' : warningLevel === 'warn' ? 'rgba(251,191,36,0.25)' : 'rgba(74,222,128,0.2)'}`,
            fontSize: 11, color: warningLevel === 'critical' ? '#fda4af' : '#aaa', lineHeight: 1.6,
          }}>
            {warningLevel === 'critical'
              ? '⚠ 估算时间已经远超可用范围。Brute force 在大场景中完全不可行 — 这就是为什么 acceleration structure 不是优化技巧，而是必需品。'
              : warningLevel === 'warn'
                ? '⏳ 时间已经过长，实际渲染体验会很糟。开启 BVH 试试。'
                : '✓ 当前规模可以承受。'}
          </div>
        </div>

        <div style={sidePanel}>
          <ObsTask>切换 preset，特别是 film quality。开启 BVH 看时间从天级别变成分钟级别。</ObsTask>

          <Slider label="image width" value={width} min={160} max={3840} step={20} onChange={setWidth} color="#6366f1" />
          <Slider label="image height" value={height} min={120} max={2160} step={20} onChange={setHeight} color="#6366f1" />
          <Slider label="spp" value={spp} min={1} max={256} step={1} onChange={setSpp} color="#fbbf24" />
          <Slider label="bounces" value={bounces} min={1} max={16} step={1} onChange={setBounces} color="#fde68a" />
          <Slider label="triangles (log)" value={Math.log10(triangles)} min={2} max={7} step={0.05}
            onChange={(v) => setTriangles(Math.round(Math.pow(10, v)))}
            color="#f43f5e" precision={2}
          />
          <div style={{ fontSize: 10, color: '#888', textAlign: 'right' }}>= {fmtBig(triangles)} triangles</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {Object.entries(PRESETS).map(([k, p]) => (
              <Toggle key={k} active={false} onClick={() => apply(k)}>{p.label}</Toggle>
            ))}
          </div>

          <Toggle active={accel} onClick={() => setAccel(!accel)} color="#4ade80">{accel ? '✓ With BVH' : 'Without acceleration'}</Toggle>

          <Status>
            <div>tests = pixels · spp · bounces · triangles</div>
            <div style={{ color: '#fbbf24' }}>= {fmtBig(tests)}</div>
            <div style={{ color: '#fde68a' }}>≈ {fmtTime(seconds)}</div>
          </Status>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, sub, color = '#6366f1', big = false }) {
  return (
    <div style={{
      padding: big ? 12 : 8, borderRadius: 8,
      background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}33`,
    }}>
      <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
      <div style={{ fontSize: big ? 16 : 14, color, fontFamily: 'monospace', fontWeight: 600, marginTop: 3 }}>{value}</div>
      <div style={{ fontSize: 9, color: '#888', marginTop: 1 }}>{sub}</div>
    </div>
  )
}
