// Shared UI primitives for the rayTracing01 lecture page (light theme)

export const panelStyle = {
  width: '100%',
  borderRadius: 18,
  overflow: 'hidden',
  border: '1px solid rgba(126,196,154,0.22)',
  background: 'linear-gradient(180deg, #fbfdfb 0%, #f5f9f5 100%)',
  boxShadow: '0 4px 20px rgba(45,80,60,0.06)',
}

export const sidePanel = {
  padding: 14,
  fontSize: 12,
  color: 'rgba(45,58,51,0.78)',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  background: 'linear-gradient(180deg, rgba(248,251,249,0.7), rgba(255,255,255,0.5))',
  borderLeft: '1px solid rgba(126,196,154,0.18)',
}

export function Header({ title, subtitle, right }) {
  return (
    <div
      style={{
        padding: '14px 18px 10px',
        borderBottom: '1px solid rgba(126,196,154,0.18)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(126,196,154,0.06), rgba(139,164,230,0.05))',
      }}
    >
      <div>
        <div style={{ fontSize: 13, color: '#1a2b22', fontWeight: 700, letterSpacing: '-0.005em' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: 'rgba(45,58,51,0.55)', marginTop: 2, lineHeight: 1.55 }}>
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </div>
  )
}

export function ObsTask({ children }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: 'rgba(45,58,51,0.5)',
          marginBottom: 4,
          letterSpacing: 1,
          fontWeight: 600,
        }}
      >
        OBSERVATION TASK
      </div>
      <div style={{ fontSize: 12, color: '#2a4035', lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}

export function Slider({ label, value, min, max, step, onChange, color = '#4a9e6e', unit = '', precision = 2 }) {
  const display = typeof value === 'number'
    ? (Number.isInteger(value) ? value.toString() : value.toFixed(precision))
    : value
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: 'rgba(45,58,51,0.55)',
          marginBottom: 3,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        <span>{label}</span>
        <span style={{ color, fontFamily: 'JetBrains Mono, monospace', textTransform: 'none', letterSpacing: 0 }}>
          {display}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: color }}
      />
    </div>
  )
}

export function Toggle({ active, onClick, children, color = '#4a9e6e' }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: 6,
        fontSize: 11,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: 600,
        border: active ? `1px solid ${color}80` : '1px solid rgba(126,196,154,0.22)',
        background: active ? `${color}1a` : '#fff',
        color: active ? color : 'rgba(45,58,51,0.55)',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

export function Status({ children, title = 'STATUS', accent = '#4a9e6e' }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 10,
        background: '#fff',
        border: '1px solid rgba(126,196,154,0.22)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        color: accent,
        lineHeight: 1.7,
        boxShadow: '0 2px 8px rgba(45,80,60,0.04)',
      }}
    >
      <div
        style={{
          color: 'rgba(45,58,51,0.5)',
          fontSize: 10,
          marginBottom: 4,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

export function Pill({ ok, label }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 100,
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 600,
        background: ok ? 'rgba(74,158,110,0.14)' : 'rgba(196,105,113,0.14)',
        color: ok ? '#4a9e6e' : '#c46971',
        border: `1px solid ${ok ? 'rgba(74,158,110,0.35)' : 'rgba(196,105,113,0.35)'}`,
      }}
    >
      {label}
    </span>
  )
}

export const fmt = (n, p = 3) => (n === null || n === undefined ? '—' : Number.isFinite(n) ? n.toFixed(p) : '—')
