import { useState, useEffect, useRef } from 'react'

const CARDS = [
  {
    id: 'straight',
    title: '光沿直线传播',
    subtitle: 'Light travels in straight lines',
    color: '#6366f1',
    detail: '在均匀介质中，光不会拐弯。这让我们能用一个最简单的数学对象 — 射线 r(t) = o + t·d 来描述一条光路。',
    extra: '现实世界存在折射、衍射等现象，但 GAMES101 第一讲先假设直线传播，以建立基础几何模型。',
  },
  {
    id: 'noInteract',
    title: '光线之间互不影响',
    subtitle: 'Rays do not interfere with each other',
    color: '#4ade80',
    detail: '两束 ray 在空间中可以自由穿越彼此，不会改变方向或强度。所以我们可以独立地处理每一条 ray。',
    extra: '这个简化让 ray tracing 天然适合并行：每条 ray 是独立任务。',
  },
  {
    id: 'reversible',
    title: '光路可逆 → 从 camera 反推',
    subtitle: 'Reciprocity: trace from the eye',
    color: '#fbbf24',
    detail: '真实光线从光源出发，绝大多数都不会进入相机。光路可逆意味着：camera 能看到的每条光路也能反向走通。',
    extra: '所以我们从 camera 发射 rays，只追踪可能影响最终图像的路径，从而把无穷大的问题化约成像素数量级的问题。',
    isKey: true,
  },
]

const MISCONCEPTION = {
  id: 'wrong',
  title: '错误直觉：从光源发射无数光线？',
  subtitle: 'Why not shoot rays from the light?',
  color: '#f43f5e',
  detail: '理论上可以。但光源射出的绝大多数光子飞向不会被看到的方向，绝大多数 ray 都被浪费。',
  extra: '从 camera 出发的 ray，每条都对应一个像素 — 100% 的 ray 都对最终图像有贡献。这就是 eye-ray 高效的根本原因。',
}

function MiniAnim({ id, color }) {
  const ref = useRef(null)
  const [t, setT] = useState(0)

  useEffect(() => {
    let raf
    const tick = () => {
      setT((p) => (p + 0.012) % 1)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Different mini animations per card id
  if (id === 'straight') {
    const x = 20 + 200 * t
    return (
      <svg viewBox="0 0 240 80" style={{ width: '100%', height: 80 }}>
        <line x1="20" y1="40" x2="220" y2="40" stroke="rgba(255,255,255,0.08)" strokeDasharray="4,3" />
        <circle cx={x} cy={40} r={5} fill={color} />
        <circle cx="20" cy="40" r={4} fill="#a5b4fc" />
        <circle cx="220" cy="40" r={4} fill="#fbbf24" />
        <text x="20" y="62" fontSize="9" fill="#666" fontFamily="monospace">light</text>
        <text x="200" y="62" fontSize="9" fill="#666" fontFamily="monospace">eye</text>
      </svg>
    )
  }
  if (id === 'noInteract') {
    const x = 30 + 180 * t
    const x2 = 210 - 180 * t
    return (
      <svg viewBox="0 0 240 80" style={{ width: '100%', height: 80 }}>
        <line x1="20" y1="20" x2="220" y2="60" stroke={color} strokeOpacity="0.3" />
        <line x1="220" y1="20" x2="20" y2="60" stroke="#fbbf24" strokeOpacity="0.3" />
        <circle cx={x} cy={20 + (60 - 20) * t} r={4} fill={color} />
        <circle cx={x2} cy={20 + (60 - 20) * t} r={4} fill="#fbbf24" />
        <text x="100" y="74" fontSize="9" fill="#666" fontFamily="monospace">rays cross freely</text>
      </svg>
    )
  }
  if (id === 'reversible') {
    // forward and backward rays
    const phase = t < 0.5 ? t * 2 : 1 - (t - 0.5) * 2
    return (
      <svg viewBox="0 0 240 80" style={{ width: '100%', height: 80 }}>
        <line x1="30" y1="40" x2="210" y2="40" stroke="rgba(255,255,255,0.1)" />
        <circle cx="30" cy="40" r={5} fill="#fde68a" />
        <circle cx="210" cy="40" r={5} fill="#a5b4fc" />
        <text x="20" y="62" fontSize="9" fill="#666" fontFamily="monospace">light</text>
        <text x="195" y="62" fontSize="9" fill="#666" fontFamily="monospace">camera</text>
        {/* arrow */}
        <circle cx={30 + 180 * phase} cy={40} r={4} fill={color} />
        {t < 0.5 ? (
          <text x="120" y="22" fontSize="10" fill={color} textAnchor="middle">→ photon</text>
        ) : (
          <text x="120" y="22" fontSize="10" fill={color} textAnchor="middle">← eye-ray</text>
        )}
      </svg>
    )
  }
  if (id === 'wrong') {
    // many rays from light, few hit camera
    return (
      <svg viewBox="0 0 240 80" style={{ width: '100%', height: 80 }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line key={i} x1="30" y1="40"
            x2={30 + Math.cos(((i / 8) * Math.PI - Math.PI / 2)) * 200}
            y2={40 + Math.sin(((i / 8) * Math.PI - Math.PI / 2)) * 60}
            stroke={i === 4 ? '#fbbf24' : color} strokeOpacity={i === 4 ? 1 : 0.35}
          />
        ))}
        <circle cx="30" cy="40" r={5} fill="#fde68a" />
        <circle cx="210" cy="42" r={4} fill="#a5b4fc" />
        <text x="120" y="74" fontSize="9" fill="#666" fontFamily="monospace">most photons miss the camera</text>
      </svg>
    )
  }
  return null
}

function Card({ card, expanded, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        flex: '1 1 220px', minWidth: 220, cursor: 'pointer', userSelect: 'none',
        padding: 16, borderRadius: 14,
        background: expanded ? `linear-gradient(180deg, ${card.color}14, ${card.color}06)` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${expanded ? card.color + '55' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.18s ease',
        boxShadow: expanded ? `0 4px 18px ${card.color}22` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{
          width: 6, height: 6, borderRadius: 6, background: card.color,
          boxShadow: `0 0 6px ${card.color}`,
        }} />
        <div style={{ fontSize: 12, color: card.color, fontWeight: 600 }}>{card.subtitle}</div>
      </div>
      <div style={{ fontSize: 14, color: '#e5e7eb', fontWeight: 600, marginBottom: 10 }}>{card.title}</div>
      <div style={{
        background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '4px 6px',
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
        <MiniAnim id={card.id} color={card.color} />
      </div>
      <div style={{
        fontSize: 12, color: '#bbb', lineHeight: 1.65, marginTop: 10,
        maxHeight: expanded ? 400 : 0, overflow: 'hidden',
        opacity: expanded ? 1 : 0, transition: 'all 0.25s ease',
      }}>
        <div style={{ marginBottom: 6 }}>{card.detail}</div>
        <div style={{ color: '#888', fontSize: 11 }}>{card.extra}</div>
      </div>
      <div style={{ fontSize: 10, color: '#555', marginTop: 8, textAlign: 'right' }}>
        {expanded ? '收起' : '点击展开'}
      </div>
    </div>
  )
}

export default function RayAssumptionsInteractiveCards() {
  const [expanded, setExpanded] = useState({ reversible: true })

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div style={{
      width: '100%', borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.18)',
      background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      padding: 16,
    }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600 }}>Three Ray Tracing Assumptions</div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>点击卡片展开详细解释。重点理解第三张：为什么我们从 camera 发射 ray。</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {CARDS.map((c) => (
          <Card key={c.id} card={c} expanded={!!expanded[c.id]} onToggle={() => toggle(c.id)} />
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <Card card={MISCONCEPTION} expanded={!!expanded[MISCONCEPTION.id]} onToggle={() => toggle(MISCONCEPTION.id)} />
      </div>
    </div>
  )
}
