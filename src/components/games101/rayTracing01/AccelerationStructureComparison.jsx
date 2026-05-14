import { useState } from 'react'
import { Header, panelStyle } from './ui.jsx'

const STRUCTS = [
  {
    id: 'brute',
    name: 'Brute Force',
    color: '#f87171',
    idea: '不建任何加速结构，对每条 ray 测试场景中所有三角形。',
    pros: ['实现极简', '没有预处理时间'],
    cons: ['复杂度 O(N) per ray', '完全不可扩展', '大场景下不可用'],
    suit: '只适合极小测试场景或调试。',
    build: 'free',
    traverse: 'O(N)',
    impl: 'trivial',
    dyn: 'easy',
    diagram: 'brute',
  },
  {
    id: 'grid',
    name: 'Uniform Grid',
    color: '#fbbf24',
    idea: '把场景空间均匀切成 N×N×N 个 cell，物体写入它重叠的 cells。Ray 沿 DDA 顺序访问 cell。',
    pros: ['实现直观', '构建快', '硬件友好'],
    cons: ['物体分布不均时 cell 利用率差', 'resolution 难选', '大空地浪费'],
    suit: '物体分布相对均匀的中小场景。',
    build: 'fast',
    traverse: '依分布而定',
    impl: 'easy',
    dyn: 'medium',
    diagram: 'grid',
  },
  {
    id: 'kd',
    name: 'KD-tree / Spatial Partition',
    color: '#a5b4fc',
    idea: '递归把空间切成两半（沿坐标轴）。每个 internal node 记录 split axis 和 split value。',
    pros: ['对非均匀分布自适应', '理论性能优秀'],
    cons: ['几何体可能跨越多个区域，需复制引用', 'traversal 较复杂', '动态场景维护成本高'],
    suit: '静态、复杂、密度差异大的场景。',
    build: 'medium',
    traverse: 'O(log N) ish',
    impl: 'hard',
    dyn: 'hard',
    diagram: 'kd',
  },
  {
    id: 'bvh',
    name: 'BVH (Bounding Volume Hierarchy)',
    color: '#4ade80',
    idea: '不切空间，而是把 objects 递归分成两组，每组用 bounding box 包起来。每个三角形只属于一个 leaf。',
    pros: ['每个三角形只属于一个 leaf', '构建直观', '现代光追主流方案', '动态场景较易处理'],
    cons: ['bounding boxes 可能重叠', '构建质量直接影响性能'],
    suit: '现代实时和离线光追的事实标准（RT cores、Embree、PBRT 等）。',
    build: 'medium',
    traverse: 'O(log N) typical',
    impl: 'medium',
    dyn: 'good',
    diagram: 'bvh',
  },
]

function Diagram({ kind }) {
  const W = 200, H = 130
  if (kind === 'brute') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <rect x="10" y="10" width={W - 20} height={H - 20} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" />
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={20 + (i % 7) * 26} cy={30 + Math.floor(i / 7) * 32} r={5} fill="#f87171" />
        ))}
        <line x1={5} y1={H - 18} x2={W - 8} y2={20} stroke="#fbbf24" strokeWidth={1.5} />
      </svg>
    )
  }
  if (kind === 'grid') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`v${i}`} x1={10 + (i / 5) * (W - 20)} y1={10} x2={10 + (i / 5) * (W - 20)} y2={H - 10} stroke="rgba(251,191,36,0.4)" />
        ))}
        {Array.from({ length: 5 }).map((_, j) => (
          <line key={`h${j}`} x1={10} y1={10 + (j / 4) * (H - 20)} x2={W - 10} y2={10 + (j / 4) * (H - 20)} stroke="rgba(251,191,36,0.4)" />
        ))}
        {[[40, 30], [80, 50], [140, 40], [60, 80], [110, 90], [160, 100]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={5} fill="#fbbf24" />
        ))}
        <line x1={5} y1={H - 18} x2={W - 8} y2={20} stroke="#fde68a" strokeWidth={1.5} />
      </svg>
    )
  }
  if (kind === 'kd') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <rect x="10" y="10" width={W - 20} height={H - 20} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" />
        <line x1={W / 2} y1={10} x2={W / 2} y2={H - 10} stroke="#a5b4fc" strokeWidth={2} />
        <line x1={10} y1={H / 2} x2={W / 2} y2={H / 2} stroke="#a5b4fc" strokeWidth={1.5} strokeDasharray="3,2" />
        <line x1={W * 3 / 4} y1={10} x2={W * 3 / 4} y2={H - 10} stroke="#a5b4fc" strokeWidth={1.5} strokeDasharray="3,2" />
        {[[40, 30], [70, 80], [120, 35], [160, 90]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={5} fill="#a5b4fc" />
        ))}
        <line x1={5} y1={H - 18} x2={W - 8} y2={20} stroke="#fde68a" strokeWidth={1.5} />
      </svg>
    )
  }
  if (kind === 'bvh') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <rect x="10" y="10" width={W - 20} height={H - 20} fill="rgba(74,222,128,0.04)" stroke="#4ade80" strokeWidth={1.5} />
        <rect x="20" y="20" width={75} height={50} fill="none" stroke="#4ade80" strokeDasharray="4,2" />
        <rect x="105" y="55" width={80} height={60} fill="none" stroke="#4ade80" strokeDasharray="4,2" />
        <rect x="22" y="22" width={30} height={20} fill="none" stroke="#4ade80" strokeDasharray="2,2" opacity="0.6" />
        <rect x="55" y="40" width={36} height={25} fill="none" stroke="#4ade80" strokeDasharray="2,2" opacity="0.6" />
        {[[35, 32], [75, 55], [125, 70], [165, 90]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={5} fill="#4ade80" />
        ))}
        <line x1={5} y1={H - 18} x2={W - 8} y2={20} stroke="#fde68a" strokeWidth={1.5} />
      </svg>
    )
  }
  return null
}

function StructCard({ s, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer', userSelect: 'none',
        padding: 14, borderRadius: 12,
        background: active ? `linear-gradient(180deg, ${s.color}1a, ${s.color}05)` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${active ? s.color + '66' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: active ? `0 4px 14px ${s.color}26` : 'none',
        transition: 'all 0.18s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: 7, background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
        <div style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.name}</div>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: 4, height: 100 }}>
        <Diagram kind={s.diagram} />
      </div>
      {active && (
        <div style={{ fontSize: 11, color: '#bbb', lineHeight: 1.6, marginTop: 8 }}>
          {s.idea}
        </div>
      )}
    </div>
  )
}

export default function AccelerationStructureComparison() {
  const [active, setActive] = useState('bvh')

  const sel = STRUCTS.find((s) => s.id === active)

  return (
    <div style={panelStyle}>
      <Header title="Acceleration Structure · 加速结构对比" subtitle="点击卡片查看每种结构的详细对比。" />

      <div style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {STRUCTS.map((s) => (
            <StructCard key={s.id} s={s} active={s.id === active} onClick={() => setActive(s.id)} />
          ))}
        </div>

        <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${sel.color}55` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: sel.color, fontWeight: 600, marginBottom: 6 }}>✓ 优点</div>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 12, color: '#bbb', lineHeight: 1.7 }}>
                {sel.pros.map((p) => (<li key={p}>{p}</li>))}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#f87171', fontWeight: 600, marginBottom: 6 }}>✗ 缺点</div>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 12, color: '#bbb', lineHeight: 1.7 }}>
                {sel.cons.map((p) => (<li key={p}>{p}</li>))}
              </ul>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#aaa', lineHeight: 1.7 }}>
            <span style={{ color: '#888', fontSize: 10 }}>适用场景</span><br />
            {sel.suit}
          </div>
        </div>

        <div style={{ marginTop: 14, overflow: 'auto', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: '#aaa', minWidth: 540 }}>
            <thead>
              <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                <th style={th}>结构</th>
                <th style={th}>构建成本</th>
                <th style={th}>遍历成本</th>
                <th style={th}>实现难度</th>
                <th style={th}>动态场景</th>
              </tr>
            </thead>
            <tbody>
              {STRUCTS.map((s) => (
                <tr key={s.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: s.id === active ? `${s.color}10` : 'transparent' }}>
                  <td style={{ ...td, color: s.color, fontWeight: 600 }}>{s.name}</td>
                  <td style={td}>{s.build}</td>
                  <td style={td}>{s.traverse}</td>
                  <td style={td}>{s.impl}</td>
                  <td style={td}>{s.dyn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const th = { textAlign: 'left', padding: '10px 14px', fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600 }
const td = { padding: '10px 14px', fontFamily: 'monospace' }
