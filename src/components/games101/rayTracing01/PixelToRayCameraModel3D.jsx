import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useMemo, useState } from 'react'
import { v, sub, normalize, scale, add } from './rayUtils.js'
import { Header, ObsTask, Slider, Status, panelStyle, sidePanel } from './ui.jsx'

function fmt(n, p = 3) {
  return Number.isFinite(n) ? n.toFixed(p) : '—'
}

function CameraScene({ width, height, fovDeg, aspect, selI, selJ, camPos }) {
  const fov = (fovDeg * Math.PI) / 180
  const focal = 1
  const halfH = Math.tan(fov / 2) * focal
  const halfW = halfH * aspect

  const grid = useMemo(() => {
    const out = []
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const px = (i + 0.5) / width
        const py = (j + 0.5) / height
        const x = (2 * px - 1) * halfW
        const y = (1 - 2 * py) * halfH
        out.push({ x: x + camPos.x, y: y + camPos.y, z: camPos.z - focal, i, j })
      }
    }
    return out
  }, [width, height, halfW, halfH, camPos])

  // selected pixel and direction
  const sel = useMemo(() => {
    const px = (selI + 0.5) / width
    const py = (selJ + 0.5) / height
    const x = (2 * px - 1) * halfW
    const y = (1 - 2 * py) * halfH
    const dirLocal = normalize(v(x, y, -focal))
    const pixelWorld = v(x + camPos.x, y + camPos.y, camPos.z - focal)
    return { dir: dirLocal, pixel: pixelWorld }
  }, [selI, selJ, width, height, halfW, halfH, camPos])

  const rayEnd = add(camPos, scale(sel.dir, 6))

  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[3, 4, 4]} intensity={0.8} />

      {/* camera */}
      <mesh position={[camPos.x, camPos.y, camPos.z]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="#a5b4fc" />
      </mesh>
      <Html position={[camPos.x, camPos.y + 0.3, camPos.z]} center>
        <div style={{ color: '#a5b4fc', fontSize: 11, fontFamily: 'monospace', background: 'rgba(15,15,26,0.7)', padding: '2px 6px', borderRadius: 4 }}>camera</div>
      </Html>

      {/* axes (right, up, forward) */}
      <Line points={[[camPos.x, camPos.y, camPos.z], [camPos.x + 0.6, camPos.y, camPos.z]]} color="#f43f5e" lineWidth={2} />
      <Line points={[[camPos.x, camPos.y, camPos.z], [camPos.x, camPos.y + 0.6, camPos.z]]} color="#4ade80" lineWidth={2} />
      <Line points={[[camPos.x, camPos.y, camPos.z], [camPos.x, camPos.y, camPos.z - 0.6]]} color="#6366f1" lineWidth={2} />
      <Html position={[camPos.x + 0.7, camPos.y, camPos.z]} center>
        <div style={{ color: '#fda4af', fontSize: 10, fontFamily: 'monospace' }}>right</div>
      </Html>
      <Html position={[camPos.x, camPos.y + 0.7, camPos.z]} center>
        <div style={{ color: '#86efac', fontSize: 10, fontFamily: 'monospace' }}>up</div>
      </Html>
      <Html position={[camPos.x, camPos.y, camPos.z - 0.7]} center>
        <div style={{ color: '#a5b4fc', fontSize: 10, fontFamily: 'monospace' }}>forward (-z)</div>
      </Html>

      {/* image plane outline */}
      <Line
        points={[
          [camPos.x - halfW, camPos.y - halfH, camPos.z - focal],
          [camPos.x + halfW, camPos.y - halfH, camPos.z - focal],
          [camPos.x + halfW, camPos.y + halfH, camPos.z - focal],
          [camPos.x - halfW, camPos.y + halfH, camPos.z - focal],
          [camPos.x - halfW, camPos.y - halfH, camPos.z - focal],
        ]}
        color="#6366f1" lineWidth={1.5}
      />

      {/* pixel grid */}
      {grid.map((g) => {
        const isSel = g.i === selI && g.j === selJ
        const cellW = (2 * halfW) / width
        const cellH = (2 * halfH) / height
        return (
          <mesh key={`${g.i}-${g.j}`} position={[g.x, g.y, g.z]}>
            <planeGeometry args={[cellW * 0.85, cellH * 0.85]} />
            <meshBasicMaterial color={isSel ? '#fbbf24' : '#1a2240'} transparent opacity={isSel ? 0.85 : 0.45} />
          </mesh>
        )
      })}

      {/* primary ray */}
      <Line points={[[camPos.x, camPos.y, camPos.z], [rayEnd.x, rayEnd.y, rayEnd.z]]} color="#fbbf24" lineWidth={3} />

      {/* dashed ray to pixel */}
      <Line
        points={[[camPos.x, camPos.y, camPos.z], [sel.pixel.x, sel.pixel.y, sel.pixel.z]]}
        color="#fde68a" lineWidth={1.5} dashed dashSize={0.08} gapSize={0.04}
      />

      <gridHelper args={[10, 20, '#1f2937', '#0f172a']} position={[0, -1.2, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} target={[0, 0, 0]} />
    </>
  )
}

export default function PixelToRayCameraModel3D() {
  const [width, setWidth] = useState(8)
  const [height, setHeight] = useState(6)
  const [fov, setFov] = useState(50)
  const [aspect, setAspect] = useState(8 / 6)
  const [selI, setSelI] = useState(2)
  const [selJ, setSelJ] = useState(2)
  const [camY, setCamY] = useState(0)

  const camPos = v(0, camY, 4)

  const fovRad = (fov * Math.PI) / 180
  const halfH = Math.tan(fovRad / 2)
  const halfW = halfH * aspect
  const px = (selI + 0.5) / width
  const py = (selJ + 0.5) / height
  const dx = (2 * px - 1) * halfW
  const dy = (1 - 2 * py) * halfH
  const dirLen = Math.sqrt(dx * dx + dy * dy + 1)
  const dir = { x: dx / dirLen, y: dy / dirLen, z: -1 / dirLen }

  return (
    <div style={panelStyle}>
      <Header
        title="Pixel → Ray · Camera Model"
        subtitle="选择一个像素，查看相机坐标系如何把它变成 3D 空间中的 ray direction。"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(240px, 1fr)' }}>
        <div style={{ height: 480, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas camera={{ position: [4, 2, 5], fov: 45 }}>
            <CameraScene width={width} height={height} fovDeg={fov} aspect={aspect} selI={selI} selJ={selJ} camPos={camPos} />
          </Canvas>
        </div>
        <div style={sidePanel}>
          <ObsTask>
            调整 FOV 观察 image plane 的尺寸如何变化。改变 selected pixel 看 ray direction 的数值。注意：相机坐标里 forward = -z。
          </ObsTask>

          <Slider label="image width" value={width} min={4} max={16} step={1} onChange={(v) => { setWidth(v); setAspect(v / height); setSelI(Math.min(v - 1, selI)) }} color="#6366f1" />
          <Slider label="image height" value={height} min={3} max={12} step={1} onChange={(v) => { setHeight(v); setAspect(width / v); setSelJ(Math.min(v - 1, selJ)) }} color="#6366f1" />
          <Slider label="FOV (vertical)" value={fov} min={20} max={90} step={1} onChange={setFov} unit="°" color="#f59e0b" />
          <Slider label="camera y" value={camY} min={-1.5} max={1.5} step={0.05} onChange={setCamY} color="#a5b4fc" />
          <div style={{ display: 'flex', gap: 8 }}>
            <Slider label="pixel i" value={selI} min={0} max={width - 1} step={1} onChange={setSelI} color="#fbbf24" />
            <Slider label="pixel j" value={selJ} min={0} max={height - 1} step={1} onChange={setSelJ} color="#fbbf24" />
          </div>

          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', lineHeight: 1.55 }}>
{`px = (i + 0.5) / width
py = (j + 0.5) / height
x  = (2*px-1) * aspect * tan(fov/2)
y  = (1 - 2*py) * tan(fov/2)
dir = normalize(x*right + y*up + forward)`}
          </div>

          <Status>
            <div>aspect = {fmt(aspect)}</div>
            <div>tan(fov/2) = {fmt(halfH)}</div>
            <div>dir = ({fmt(dir.x)}, {fmt(dir.y)}, {fmt(dir.z)})</div>
            <div style={{ color: '#4ade80', marginTop: 4 }}>‖dir‖ = {fmt(Math.hypot(dir.x, dir.y, dir.z))}</div>
          </Status>
        </div>
      </div>
    </div>
  )
}
