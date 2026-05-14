import { useState } from 'react'
import { Header, panelStyle } from './ui.jsx'

const TECHS = [
  {
    id: 'hard',
    name: 'Hard Shadow',
    color: '#f87171',
    idea: '一次 shadow test，二值结果。',
    pros: ['实现简单', '成本最低'],
    cons: ['锯齿明显', '无半影', '不真实'],
    cost: '1×',
    soft: '✗',
    physical: '✗',
    use: 'pixel art / 性能极受限',
  },
  {
    id: 'pcf',
    name: 'PCF',
    color: '#fbbf24',
    idea: '邻域多次 shadow test，结果取平均。',
    pros: ['软化边缘', '工程友好'],
    cons: ['软化程度恒定，物理上不真实', 'kernel 越大越贵'],
    cost: 'k²×',
    soft: '✓',
    physical: '✗',
    use: '绝大多数实时项目的默认',
  },
  {
    id: 'pcss',
    name: 'PCSS',
    color: '#4ade80',
    idea: '先估算 blocker 距离，再用动态 PCF kernel。',
    pros: ['penumbra 跟着 blocker 距离变化', '物理直觉正确'],
    cons: ['blocker search 阶段较贵', '采样噪声'],
    cost: '~2× PCF',
    soft: '✓',
    physical: '近似',
    use: '中高端实时（接近 area light）',
  },
  {
    id: 'vsm',
    name: 'VSM',
    color: '#a5b4fc',
    idea: '用统计矩（mean, variance）+ Chebyshev 不等式估计 visibility。',
    pros: ['可预过滤', '可用 mipmap', '边缘自然柔'],
    cons: ['light bleeding 严重', '对复杂遮挡敏感'],
    cost: '类似 hard + mipmap 成本',
    soft: '✓',
    physical: '近似',
    use: '某些角色阴影 / 远景',
  },
  {
    id: 'rtshadow',
    name: 'Ray Traced Shadow',
    color: '#22d3ee',
    idea: '从着色点向光源射 ray 测可见性。',
    pros: ['物理正确', '支持任意几何', 'area light 自然处理'],
    cons: ['成本高', '对噪声敏感，需 denoiser'],
    cost: 'O(rays · scene)',
    soft: '✓',
    physical: '✓',
    use: '现代 RTX / 高端离线',
  },
]

function MiniDiagram({ kind }) {
  const W = 220, H = 100
  if (kind === 'hard') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <rect x={0} y={0} width={W} height={H} fill="rgba(255,255,255,0.02)" />
        <rect x={20} y={20} width={90} height={60} fill="#0a0a14" />
        <rect x={110} y={20} width={90} height={60} fill="#e5e7eb" />
        <text x={65} y={56} fill="#666" fontSize="10" textAnchor="middle">shadow</text>
        <text x={155} y={56} fill="#1a1a2a" fontSize="10" textAnchor="middle">lit</text>
      </svg>
    )
  }
  if (kind === 'pcf') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <defs>
          <linearGradient id="g-pcf" x1="0" x2="1">
            <stop offset="0" stopColor="#0a0a14" />
            <stop offset="0.4" stopColor="#1a1a30" />
            <stop offset="0.6" stopColor="#a8a8b8" />
            <stop offset="1" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#g-pcf)" />
      </svg>
    )
  }
  if (kind === 'pcss') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <defs>
          <linearGradient id="g-pcss" x1="0" x2="1">
            <stop offset="0" stopColor="#0a0a14" />
            <stop offset="0.3" stopColor="#0a0a14" />
            <stop offset="0.45" stopColor="#3a3a52" />
            <stop offset="0.7" stopColor="#a8a8b8" />
            <stop offset="1" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#g-pcss)" />
        <text x={W - 4} y={H - 6} fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="end">wider far away</text>
      </svg>
    )
  }
  if (kind === 'vsm') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <rect x={0} y={0} width={W} height={H} fill="rgba(255,255,255,0.02)" />
        <text x={20} y={28} fill="#a5b4fc" fontSize="11" fontFamily="monospace">μ = E[z]</text>
        <text x={20} y={52} fill="#a5b4fc" fontSize="11" fontFamily="monospace">σ² = E[z²] − μ²</text>
        <text x={20} y={76} fill="#86efac" fontSize="10" fontFamily="monospace">P(z &lt; t) ≤ σ²/(σ²+(t−μ)²)</text>
      </svg>
    )
  }
  if (kind === 'rtshadow') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <circle cx={30} cy={30} r={10} fill="#fde68a" />
        <line x1={30} y1={30} x2={180} y2={70} stroke="#fde68a" strokeDasharray="3,2" />
        <line x1={30} y1={30} x2={130} y2={75} stroke="#fde68a" strokeDasharray="3,2" />
        <rect x={70} y={40} width={20} height={20} fill="#22d3ee" rx={2} />
        <circle cx={180} cy={70} r={6} fill="#4ade80" />
        <circle cx={130} cy={75} r={6} fill="#f43f5e" />
      </svg>
    )
  }
  return null
}

function Card({ t, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      cursor: 'pointer', userSelect: 'none', padding: 12, borderRadius: 10,
      background: active ? `linear-gradient(180deg, ${t.color}1a, ${t.color}05)` : 'rgba(255,255,255,0.02)',
      border: `1px solid ${active ? t.color + '66' : 'rgba(255,255,255,0.06)'}`,
      boxShadow: active ? `0 4px 12px ${t.color}26` : 'none',
      transition: 'all 0.18s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: 7, background: t.color, boxShadow: `0 0 6px ${t.color}` }} />
        <div style={{ fontSize: 13, color: t.color, fontWeight: 600 }}>{t.name}</div>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: 4, height: 80 }}>
        <MiniDiagram kind={t.id} />
      </div>
      {active && <div style={{ fontSize: 11, color: '#bbb', lineHeight: 1.6, marginTop: 8 }}>{t.idea}</div>}
    </div>
  )
}

export default function ShadowTechniquesComparison() {
  const [active, setActive] = useState('pcf')
  const sel = TECHS.find((t) => t.id === active)

  return (
    <div style={panelStyle}>
      <Header title="阴影技术对比 · Hard / PCF / PCSS / VSM / Ray Traced" subtitle="点击卡片切换技术，看优缺点。" />

      <div style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {TECHS.map((t) => (
            <Card key={t.id} t={t} active={t.id === active} onClick={() => setActive(t.id)} />
          ))}
        </div>

        <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${sel.color}55` }}>
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
          <div style={{ marginTop: 12, fontSize: 12, color: '#aaa' }}>
            <span style={{ color: '#888', fontSize: 10 }}>典型用途</span><br />
            {sel.use}
          </div>
        </div>

        <div style={{ marginTop: 14, overflow: 'auto', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: '#aaa', minWidth: 540 }}>
            <thead>
              <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                <th style={th}>技术</th>
                <th style={th}>软阴影</th>
                <th style={th}>物理近似</th>
                <th style={th}>相对成本</th>
                <th style={th}>核心想法</th>
              </tr>
            </thead>
            <tbody>
              {TECHS.map((t) => (
                <tr key={t.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: t.id === active ? `${t.color}10` : 'transparent' }}>
                  <td style={{ ...td, color: t.color, fontWeight: 600 }}>{t.name}</td>
                  <td style={td}>{t.soft}</td>
                  <td style={td}>{t.physical}</td>
                  <td style={td}>{t.cost}</td>
                  <td style={{ ...td, color: '#bbb' }}>{t.idea}</td>
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
