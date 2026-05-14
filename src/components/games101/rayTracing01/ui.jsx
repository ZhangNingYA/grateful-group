// Shared UI primitives for the rayTracing01 lecture page

export const panelStyle = {
  width: '100%', borderRadius: 16, overflow: 'hidden',
  border: '1px solid rgba(99,102,241,0.18)',
  background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
}

export const sidePanel = {
  padding: 14, fontSize: 12, color: '#aaa', display: 'flex', flexDirection: 'column', gap: 12,
  background: 'rgba(15,15,26,0.6)', borderLeft: '1px solid rgba(255,255,255,0.04)',
}

export function Header({ title, subtitle, right }) {
  return (
    <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  )
}

export function ObsTask({ children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#666', marginBottom: 4, letterSpacing: 1 }}>OBSERVATION TASK</div>
      <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.55 }}>{children}</div>
    </div>
  )
}

export function Slider({ label, value, min, max, step, onChange, color = '#6366f1', unit = '', precision = 2 }) {
  const display = typeof value === 'number'
    ? (Number.isInteger(value) ? value.toString() : value.toFixed(precision))
    : value
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color, fontFamily: 'monospace' }}>{display}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: color }} />
    </div>
  )
}

export function Toggle({ active, onClick, children, color = '#6366f1' }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
      border: active ? `1px solid ${color}66` : '1px solid rgba(255,255,255,0.06)',
      background: active ? `${color}1a` : 'transparent',
      color: active ? '#c7d2fe' : '#666',
    }}>{children}</button>
  )
}

export function Status({ children, title = 'STATUS', accent = '#c7d2fe' }) {
  return (
    <div style={{
      padding: 10, borderRadius: 8,
      background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
      fontFamily: 'monospace', fontSize: 11, color: accent, lineHeight: 1.7,
    }}>
      <div style={{ color: '#888', fontSize: 10, marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  )
}

export function Pill({ ok, label }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 100,
      fontSize: 10, fontFamily: 'monospace',
      background: ok ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
      color: ok ? '#4ade80' : '#f87171',
      border: `1px solid ${ok ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
    }}>{label}</span>
  )
}

export const fmt = (n, p = 3) => (n === null || n === undefined ? '—' : Number.isFinite(n) ? n.toFixed(p) : '—')
