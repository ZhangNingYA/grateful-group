import { useState } from 'react'
import { Header, panelStyle } from './ui.jsx'

const ITEMS = [
  {
    id: 'no_shadow',
    symptom: '完全没有阴影',
    icon: '⚫',
    color: '#f87171',
    causes: [
      'light.castShadow = false',
      'object.castShadow = false / receiveShadow = false',
      'shadow camera frustum 没覆盖物体',
      'shadow map size = 0',
      '材质不响应阴影（如 MeshBasicMaterial）',
    ],
    fix: '逐项检查 caster / receiver 的 flag 与 frustum 范围。',
  },
  {
    id: 'wrong_dir',
    symptom: '阴影方向错误',
    icon: '↗️',
    color: '#fbbf24',
    causes: [
      'light position / target 设置错误',
      '光源越过 zenith 没正确处理',
      '使用了世界空间向量代替方向',
    ],
    fix: '可视化 light frustum，确认 target → position 是否符合预期。',
  },
  {
    id: 'acne',
    symptom: 'Shadow Acne（自阴影斑点）',
    icon: '🟫',
    color: '#fbbf24',
    causes: [
      'bias 太小或为 0',
      'normal bias 没启用',
      'depth buffer 精度不足（如 D16 + 大 far）',
      '斜面 + 低 shadow map 分辨率',
    ],
    fix: '逐步加 bias / normal bias；缩短 light frustum 的 near-far 比。',
  },
  {
    id: 'peter',
    symptom: 'Peter Panning（阴影脱离物体）',
    icon: '👻',
    color: '#fbbf24',
    causes: [
      'bias 过大',
      'normal bias 过大',
      '物体很薄，bias 把 fragment 推穿到了背面',
    ],
    fix: '减小 bias；用 slope-scale bias 让陡峭表面才有更大 bias。',
  },
  {
    id: 'alias',
    symptom: '锯齿严重 / 阶梯',
    icon: '🔺',
    color: '#fbbf24',
    causes: [
      'shadow map 分辨率太低',
      'light frustum 太大（一个 texel 覆盖太大空间）',
      '没有 PCF / PCSS 软化',
    ],
    fix: '提高分辨率 / 收紧 frustum / 开启 PCF / 用 CSM。',
  },
  {
    id: 'flicker',
    symptom: '阴影闪烁（移动时）',
    icon: '⚡',
    color: '#fbbf24',
    causes: [
      'shadow map texel 没有相对场景"snap"',
      '相机移动时 light frustum 中心也在移动',
      'CSM cascade 边界跳变',
    ],
    fix: '把 light view origin 按 shadow map texel 大小做 snapping。',
  },
  {
    id: 'far_missing',
    symptom: '远处阴影消失',
    icon: '🌌',
    color: '#fbbf24',
    causes: [
      'shadow camera far 太小',
      '没有 CSM，远处超出最大 frustum',
    ],
    fix: '调大 shadow camera far；引入 CSM。',
  },
  {
    id: 'ghost',
    symptom: '应有阴影的位置 lit / 幽灵阴影',
    icon: '👤',
    color: '#fbbf24',
    causes: [
      'sampler clamp/wrap 模式错误，UV 出界后采样到了 0/1 边缘',
      '物体被 light frustum 切掉了一部分',
    ],
    fix: '用 sampler2DShadow 配合 clamp_to_border，并把 border 设为 1（lit）或 0（shadow）按需求选择。',
  },
]

export default function ShadowDebugChecklist() {
  const [active, setActive] = useState('no_shadow')
  const sel = ITEMS.find((i) => i.id === active)

  return (
    <div style={panelStyle}>
      <Header
        title="Shadow Debug Checklist · 8 个常见症状"
        subtitle="左：症状卡片 · 右：可能原因 + 排查路线。"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: 16, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          {ITEMS.map((it) => {
            const isActive = it.id === active
            return (
              <div key={it.id} onClick={() => setActive(it.id)} style={{
                padding: 10, borderRadius: 8, cursor: 'pointer', userSelect: 'none',
                background: isActive ? `${it.color}1a` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? it.color + '66' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s ease',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{it.icon}</div>
                <div style={{ fontSize: 11, color: isActive ? '#fff' : '#bbb', fontWeight: isActive ? 600 : 400, lineHeight: 1.4 }}>
                  {it.symptom}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ padding: 18, background: 'rgba(15,15,26,0.6)' }}>
          <div style={{ fontSize: 10, color: '#666', letterSpacing: 1, marginBottom: 6 }}>SYMPTOM</div>
          <div style={{ fontSize: 16, color: sel.color, fontWeight: 600, marginBottom: 14 }}>
            {sel.icon} {sel.symptom}
          </div>

          <div style={{ fontSize: 10, color: '#666', letterSpacing: 1, marginBottom: 6 }}>POSSIBLE CAUSES</div>
          <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 12, color: '#ccc', lineHeight: 1.8 }}>
            {sel.causes.map((c, i) => (<li key={i}>{c}</li>))}
          </ul>

          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: `${sel.color}10`, border: `1px solid ${sel.color}44` }}>
            <div style={{ fontSize: 10, color: sel.color, fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>FIX</div>
            <div style={{ fontSize: 12, color: '#ddd', lineHeight: 1.65 }}>{sel.fix}</div>
          </div>

          <div style={{ marginTop: 14, padding: 10, borderRadius: 6, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 11, color: '#a5b4fc', lineHeight: 1.7 }}>
            <strong>调试套路</strong>：1) 可视化 light frustum；2) 把 shadow map 渲到屏幕上看；3) 临时把 bias=0 看 acne；4) 临时取消 PCF 看真实边界。
          </div>
        </div>
      </div>
    </div>
  )
}
