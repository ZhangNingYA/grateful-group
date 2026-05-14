import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import { Header, ObsTask, Slider, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

function Scene({ resolution, frustumSize, withPCF }) {
  const lightRef = useRef()

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.shadow.mapSize.set(resolution, resolution)
      lightRef.current.shadow.bias = -0.001
      lightRef.current.shadow.camera.left = -frustumSize
      lightRef.current.shadow.camera.right = frustumSize
      lightRef.current.shadow.camera.top = frustumSize
      lightRef.current.shadow.camera.bottom = -frustumSize
      lightRef.current.shadow.camera.near = 0.5
      lightRef.current.shadow.camera.far = 25
      lightRef.current.shadow.camera.updateProjectionMatrix()
      lightRef.current.shadow.needsUpdate = true
      lightRef.current.shadow.radius = withPCF ? 4 : 0
    }
  }, [resolution, frustumSize, withPCF])

  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight ref={lightRef} position={[4, 6, 3]} intensity={1.3} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a2d40" />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[(i - 2.5) * 0.9, 0.4, Math.sin(i * 0.7) * 0.4]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.8, 0.5]} />
          <meshStandardMaterial color={['#6366f1', '#f43f5e', '#fbbf24', '#4ade80', '#22d3ee', '#a78bfa'][i]} />
        </mesh>
      ))}
      <mesh position={[0, 0.6, 1.6]} castShadow receiveShadow>
        <torusGeometry args={[0.4, 0.12, 16, 32]} />
        <meshStandardMaterial color="#fb7185" />
      </mesh>
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

export default function ShadowResolutionAliasingDemo() {
  const [resolution, setResolution] = useState(256)
  const [frustumSize, setFrustumSize] = useState(6)
  const [withPCF, setWithPCF] = useState(false)

  // texel world size = (2 * frustumSize) / resolution
  const texelWorld = (2 * frustumSize) / resolution

  return (
    <div style={panelStyle}>
      <Header
        title="Resolution & Aliasing · Texel 世界尺寸"
        subtitle="阴影锯齿 = 一个 texel 在世界空间太大。"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <div style={{ height: 460, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas shadows camera={{ position: [3, 2.5, 4], fov: 45 }}>
            <Scene resolution={resolution} frustumSize={frustumSize} withPCF={withPCF} />
          </Canvas>
        </div>
        <div style={sidePanel}>
          <ObsTask>1) 把 resolution 调到 128 看锯齿。2) 不变分辨率，但把 frustum 调到 12 → 同样很糊。3) 开启 PCF 看模糊化。</ObsTask>

          <Slider label="shadow map 分辨率" value={resolution} min={64} max={2048} step={64} onChange={setResolution} color="#a5b4fc" />
          <Slider label="light frustum 半宽" value={frustumSize} min={2} max={15} step={0.5} onChange={setFrustumSize} color="#fbbf24" precision={1} />
          <Toggle active={withPCF} onClick={() => setWithPCF(!withPCF)}>PCF (radius=4)</Toggle>

          <Status>
            <div>resolution: {resolution}×{resolution}</div>
            <div>frustum: {(frustumSize * 2).toFixed(1)} × {(frustumSize * 2).toFixed(1)}</div>
            <div style={{ marginTop: 4, color: texelWorld > 0.05 ? '#f87171' : texelWorld > 0.02 ? '#fbbf24' : '#4ade80' }}>
              一个 texel ≈ {texelWorld.toFixed(4)} 世界单位
            </div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
              {texelWorld > 0.05 ? '⚠ 一个 texel 跨越大量像素 → 严重锯齿' :
                texelWorld > 0.02 ? '⚠ 边缘可见锯齿' : '✓ 较精细'}
            </div>
          </Status>

          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', lineHeight: 1.6 }}>
            world texel ≈ frustum / resolution<br />
            quality &uarr;: 增大分辨率 / 收紧 frustum / 用 CSM
          </div>
        </div>
      </div>
    </div>
  )
}
