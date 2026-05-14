import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Header, ObsTask, Slider, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

// Left pane: light's-eye-view (depth visualization). Right pane: final shaded scene.

function CommonScene({ lightAngle, height, withShadow, depthOnly = false, resolution = 512, bias = -0.001 }) {
  const lightRef = useRef()

  useEffect(() => {
    if (lightRef.current && !depthOnly) {
      lightRef.current.shadow.mapSize.set(resolution, resolution)
      lightRef.current.shadow.bias = bias
      lightRef.current.shadow.camera.left = -5
      lightRef.current.shadow.camera.right = 5
      lightRef.current.shadow.camera.top = 5
      lightRef.current.shadow.camera.bottom = -5
      lightRef.current.shadow.camera.near = 0.5
      lightRef.current.shadow.camera.far = 20
      lightRef.current.shadow.camera.updateProjectionMatrix()
      lightRef.current.shadow.needsUpdate = true
    }
  }, [resolution, bias, depthOnly])

  const lightPos = [Math.cos(lightAngle) * 5, height, Math.sin(lightAngle) * 5]

  // depthOnly: white materials, no shadows, the camera will be placed at light position
  if (depthOnly) {
    return (
      <>
        <ambientLight intensity={0.9} />
        <DepthMaterial>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-1.4, 0.5, 0]}>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[1.5, 0.6, -0.6]}>
            <sphereGeometry args={[0.7, 32, 32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.8, 1.8]}>
            <coneGeometry args={[0.5, 1.4, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </DepthMaterial>
      </>
    )
  }

  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight
        ref={lightRef}
        position={lightPos}
        intensity={1.3}
        castShadow={withShadow}
        shadow-mapSize-width={resolution}
        shadow-mapSize-height={resolution}
        shadow-bias={bias}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#2a2d40" />
      </mesh>
      <mesh position={[-1.4, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      <mesh position={[1.5, 0.6, -0.6]} castShadow receiveShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#f43f5e" />
      </mesh>
      <mesh position={[0, 0.8, 1.8]} castShadow receiveShadow>
        <coneGeometry args={[0.5, 1.4, 16]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      <mesh position={lightPos}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
    </>
  )
}

// Wrap children in a depth-darkened material via fragment-shader-like effect using fog + monochrome.
// Simplest approach: just rely on fog + low ambient to create a depth feeling.
function DepthMaterial({ children }) {
  return (
    <>
      <fog attach="fog" args={['#000000', 4, 12]} />
      {children}
    </>
  )
}

function LightCamera({ lightAngle, height }) {
  const ref = useRef()
  useEffect(() => {
    if (ref.current) {
      const target = new THREE.Vector3(0, 0, 0)
      ref.current.lookAt(target)
    }
  }, [lightAngle, height])

  return null
}

export default function TwoPassPlayground3D() {
  const [lightAngle, setLightAngle] = useState(0.8)
  const [height, setHeight] = useState(5)
  const [resolution, setResolution] = useState(1024)
  const [bias, setBias] = useState(-0.001)
  const [hideShadow, setHideShadow] = useState(false)

  const lightPos = [Math.cos(lightAngle) * 5, height, Math.sin(lightAngle) * 5]

  return (
    <div style={panelStyle}>
      <Header
        title="Two-Pass Playground · 同时看 Light Pass 与 Camera Pass"
        subtitle="左：光源视角下场景轮廓（用作深度提示）。右：相机视角的最终阴影。"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(220px, 0.8fr)' }}>
        <div style={{ height: 360, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Canvas camera={{ position: lightPos, fov: 50 }}>
              <CommonScene lightAngle={lightAngle} height={height} depthOnly />
              {/* lock camera to light position aiming at origin */}
            </Canvas>
            <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, color: '#a5b4fc', fontFamily: 'monospace', background: 'rgba(15,15,26,0.7)', padding: '3px 8px', borderRadius: 4 }}>
              PASS 1 · 从光源看（白模 + 雾深度）
            </div>
          </div>
        </div>

        <div style={{ height: 360, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Canvas shadows camera={{ position: [4, 3, 5], fov: 45 }}>
              <CommonScene lightAngle={lightAngle} height={height} withShadow={!hideShadow} resolution={resolution} bias={bias} />
              <OrbitControls enableDamping dampingFactor={0.1} />
            </Canvas>
            <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, color: '#fda4af', fontFamily: 'monospace', background: 'rgba(15,15,26,0.7)', padding: '3px 8px', borderRadius: 4 }}>
              PASS 2 · 从相机看（{hideShadow ? '关闭阴影' : '使用 shadow map'}）
            </div>
          </div>
        </div>

        <div style={sidePanel}>
          <ObsTask>关闭阴影看每个像素都被"看见"。开启阴影后，左右两边对应的"光源看不见"区域应该一一对上。</ObsTask>

          <Slider label="光源方位角" value={lightAngle} min={0} max={6.28} step={0.02} onChange={setLightAngle} precision={2} color="#fde68a" />
          <Slider label="光源高度" value={height} min={2} max={9} step={0.1} onChange={setHeight} color="#fde68a" />
          <Slider label="resolution" value={resolution} min={128} max={2048} step={128} onChange={setResolution} color="#6366f1" />
          <Slider label="bias" value={bias} min={-0.01} max={0.01} step={0.0005} onChange={setBias} precision={4} color="#f43f5e" />

          <Toggle active={!hideShadow} onClick={() => setHideShadow(!hideShadow)}>
            {hideShadow ? '✗ 阴影已关闭' : '✓ 阴影已启用'}
          </Toggle>

          <Status>
            <div>{hideShadow ? '当前：仅 Pass 2，无 visibility 项' : '当前：Pass 1 + Pass 2 完整流程'}</div>
            <div style={{ marginTop: 4, color: '#fbbf24' }}>左侧"被光照亮"= 右侧"在光下" = lit。</div>
          </Status>
        </div>
      </div>
    </div>
  )
}
