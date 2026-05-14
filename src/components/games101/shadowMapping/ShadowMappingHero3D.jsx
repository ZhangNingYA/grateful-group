import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import { Header, ObsTask, Slider, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

function Scene({ lightAzim, lightHeight, resolution, bias, showFrustum }) {
  const lightRef = useRef()

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.shadow.mapSize.set(resolution, resolution)
      lightRef.current.shadow.bias = bias
      lightRef.current.shadow.camera.left = -6
      lightRef.current.shadow.camera.right = 6
      lightRef.current.shadow.camera.top = 6
      lightRef.current.shadow.camera.bottom = -6
      lightRef.current.shadow.camera.near = 0.5
      lightRef.current.shadow.camera.far = 22
      lightRef.current.shadow.camera.updateProjectionMatrix()
      lightRef.current.shadow.needsUpdate = true
    }
  }, [resolution, bias])

  const lightPos = [Math.cos(lightAzim) * 5.5, lightHeight, Math.sin(lightAzim) * 5.5]

  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight
        ref={lightRef}
        position={lightPos}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={resolution}
        shadow-mapSize-height={resolution}
        shadow-bias={bias}
      />
      {showFrustum && lightRef.current && (
        <cameraHelper args={[lightRef.current.shadow.camera]} />
      )}
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#2a2d40" />
      </mesh>
      {/* Cube */}
      <mesh position={[-1.4, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      {/* Sphere */}
      <mesh position={[1.5, 0.6, -0.6]} castShadow receiveShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#f43f5e" />
      </mesh>
      {/* Cone */}
      <mesh position={[0, 0.8, 1.8]} castShadow receiveShadow>
        <coneGeometry args={[0.5, 1.4, 16]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      {/* Torus */}
      <mesh position={[2.4, 0.55, 1.6]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.45, 0.18, 12, 32]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      {/* Light marker */}
      <mesh position={lightPos}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

export default function ShadowMappingHero3D() {
  const [lightAzim, setLightAzim] = useState(0.8)
  const [lightHeight, setLightHeight] = useState(6)
  const [resolution, setResolution] = useState(1024)
  const [bias, setBias] = useState(-0.001)
  const [showFrustum, setShowFrustum] = useState(false)

  return (
    <div style={panelStyle}>
      <Header
        title="Shadow Mapping Hero · Light → Depth → Camera"
        subtitle="拖动相机视角、改变光源方向、调整 shadow map 分辨率与 bias，观察阴影随之变化。"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(240px, 1fr)' }}>
        <div style={{ height: 480, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas shadows camera={{ position: [5, 3.5, 5.5], fov: 45 }}>
            <Scene lightAzim={lightAzim} lightHeight={lightHeight} resolution={resolution} bias={bias} showFrustum={showFrustum} />
          </Canvas>
        </div>

        <div style={sidePanel}>
          <ObsTask>转动光源观察阴影方向。把分辨率调到 128 看锯齿；调到 2048 看细腻度；把 bias 调到 0 看 shadow acne。</ObsTask>

          <Slider label="光源方位角" value={lightAzim} min={0} max={6.28} step={0.02} onChange={setLightAzim} precision={2} color="#fbbf24" />
          <Slider label="光源高度" value={lightHeight} min={2} max={10} step={0.1} onChange={setLightHeight} color="#fbbf24" />
          <Slider label="Shadow Map 分辨率" value={resolution} min={128} max={2048} step={128} onChange={setResolution} color="#6366f1" />
          <Slider label="Bias" value={bias} min={-0.01} max={0.01} step={0.0005} onChange={setBias} precision={4} color="#f43f5e" />

          <Toggle active={showFrustum} onClick={() => setShowFrustum(!showFrustum)}>Light Frustum</Toggle>

          <Status>
            <div>光源方向: ({Math.cos(lightAzim).toFixed(2)}, {(lightHeight / Math.hypot(5.5, lightHeight, 0)).toFixed(2)}, {Math.sin(lightAzim).toFixed(2)})</div>
            <div>shadow map: {resolution}×{resolution}</div>
            <div>bias: {bias.toFixed(4)}</div>
            <div style={{ marginTop: 4, color: bias > -0.0001 ? '#f87171' : Math.abs(bias) > 0.005 ? '#fbbf24' : '#4ade80' }}>
              {bias > -0.0001 ? '⚠ acne 风险' : Math.abs(bias) > 0.005 ? '⚠ peter panning 风险' : '✓ 较为平衡'}
            </div>
          </Status>
        </div>
      </div>
    </div>
  )
}
