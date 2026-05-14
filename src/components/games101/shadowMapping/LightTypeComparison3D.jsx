import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Header, ObsTask, Toggle, Status, panelStyle, sidePanel } from './ui.jsx'

// 3 modes: directional (ortho), spot (perspective cone), point (cubemap = 6 frustums)

function DirectionalScene({ angle }) {
  const ref = useRef()
  const lightPos = [Math.cos(angle) * 5, 5, Math.sin(angle) * 5]
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight ref={ref} position={lightPos} intensity={1.2} castShadow
        shadow-camera-left={-3} shadow-camera-right={3}
        shadow-camera-top={3} shadow-camera-bottom={-3}
        shadow-camera-near={0.5} shadow-camera-far={15}
      />
      {ref.current && <cameraHelper args={[ref.current.shadow.camera]} />}
      <SceneObjects />
      <mesh position={lightPos}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      <Html position={[lightPos[0], lightPos[1] + 0.3, lightPos[2]]} center>
        <div style={{ color: '#fde68a', fontSize: 10, fontFamily: 'monospace', background: 'rgba(15,15,26,0.8)', padding: '2px 6px', borderRadius: 4 }}>directional · ortho</div>
      </Html>
    </>
  )
}

function SpotScene({ angle }) {
  const ref = useRef()
  const lightPos = [Math.cos(angle) * 3, 4, Math.sin(angle) * 3]
  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight ref={ref} position={lightPos} angle={0.5} penumbra={0.2} intensity={6} castShadow
        target-position={[0, 0, 0]}
        shadow-camera-fov={60}
        shadow-camera-near={0.3}
        shadow-camera-far={12}
      />
      {ref.current && <cameraHelper args={[ref.current.shadow.camera]} />}
      <SceneObjects />
      <mesh position={lightPos}>
        <coneGeometry args={[0.12, 0.3, 8]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      <Html position={[lightPos[0], lightPos[1] + 0.3, lightPos[2]]} center>
        <div style={{ color: '#fde68a', fontSize: 10, fontFamily: 'monospace', background: 'rgba(15,15,26,0.8)', padding: '2px 6px', borderRadius: 4 }}>spot · perspective</div>
      </Html>
    </>
  )
}

function PointScene() {
  const ref = useRef()
  const lightPos = [0, 2.5, 0]
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight ref={ref} position={lightPos} intensity={6} distance={10} castShadow
        shadow-camera-near={0.3}
        shadow-camera-far={10}
      />
      {/* visualize 6 frustums */}
      <SixFrustumsHelper position={lightPos} />
      <SceneObjects />
      <mesh position={lightPos}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      <Html position={[lightPos[0], lightPos[1] + 0.3, lightPos[2]]} center>
        <div style={{ color: '#fde68a', fontSize: 10, fontFamily: 'monospace', background: 'rgba(15,15,26,0.8)', padding: '2px 6px', borderRadius: 4 }}>point · 6× cubemap</div>
      </Html>
    </>
  )
}

function SixFrustumsHelper({ position }) {
  const dirs = [
    { dir: [1, 0, 0], color: '#f43f5e' },
    { dir: [-1, 0, 0], color: '#fb7185' },
    { dir: [0, 1, 0], color: '#4ade80' },
    { dir: [0, -1, 0], color: '#86efac' },
    { dir: [0, 0, 1], color: '#6366f1' },
    { dir: [0, 0, -1], color: '#a5b4fc' },
  ]
  const FAR = 3
  return (
    <>
      {dirs.map((d, i) => (
        <FrustumSquare key={i} origin={position} dir={d.dir} far={FAR} color={d.color} />
      ))}
    </>
  )
}

function FrustumSquare({ origin, dir, far, color }) {
  // a square far face perpendicular to dir
  const d = new THREE.Vector3(...dir)
  const center = new THREE.Vector3(...origin).add(d.clone().multiplyScalar(far))
  const upRef = Math.abs(d.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
  const right = new THREE.Vector3().crossVectors(d, upRef).normalize().multiplyScalar(far * 0.8)
  const up = new THREE.Vector3().crossVectors(right, d).normalize().multiplyScalar(far * 0.8)
  const a = center.clone().add(right).add(up)
  const b = center.clone().sub(right).add(up)
  const c = center.clone().sub(right).sub(up)
  const e = center.clone().add(right).sub(up)
  const o = new THREE.Vector3(...origin)
  return (
    <>
      <Line points={[[o.x, o.y, o.z], [a.x, a.y, a.z]]} color={color} lineWidth={0.8} transparent opacity={0.5} />
      <Line points={[[o.x, o.y, o.z], [b.x, b.y, b.z]]} color={color} lineWidth={0.8} transparent opacity={0.5} />
      <Line points={[[o.x, o.y, o.z], [c.x, c.y, c.z]]} color={color} lineWidth={0.8} transparent opacity={0.5} />
      <Line points={[[o.x, o.y, o.z], [e.x, e.y, e.z]]} color={color} lineWidth={0.8} transparent opacity={0.5} />
      <Line points={[[a.x, a.y, a.z], [b.x, b.y, b.z], [c.x, c.y, c.z], [e.x, e.y, e.z], [a.x, a.y, a.z]]}
        color={color} lineWidth={1} transparent opacity={0.7} />
    </>
  )
}

function SceneObjects() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#2a2d40" />
      </mesh>
      <mesh position={[-1, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      <mesh position={[1, 0.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshStandardMaterial color="#f43f5e" />
      </mesh>
    </>
  )
}

export default function LightTypeComparison3D() {
  const [type, setType] = useState('dir')
  const [angle, setAngle] = useState(0.6)

  const info = {
    dir: { name: 'Directional', proj: 'Orthographic', count: '1 shadow map (2D)', cost: '1×', use: '太阳光、月光' },
    spot: { name: 'Spot', proj: 'Perspective', count: '1 shadow map (2D)', cost: '1×', use: '聚光灯、手电筒' },
    pt: { name: 'Point', proj: '6× Perspective (cubemap)', count: '6 shadow maps', cost: '6×', use: '灯泡、火把' },
  }

  return (
    <div style={panelStyle}>
      <Header
        title="Light Types · Directional / Spot / Point"
        subtitle="光源类型决定 shadow map 的投影方式与张数。"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <div style={{ height: 460, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas shadows camera={{ position: [4, 3.5, 5], fov: 45 }}>
            {type === 'dir' && <DirectionalScene angle={angle} />}
            {type === 'spot' && <SpotScene angle={angle} />}
            {type === 'pt' && <PointScene />}
            <OrbitControls enableDamping dampingFactor={0.1} />
          </Canvas>
        </div>
        <div style={sidePanel}>
          <ObsTask>切换光源类型，看 frustum / cubemap 形状的差异。Point light 一次需要 6 张 shadow map。</ObsTask>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Toggle active={type === 'dir'} onClick={() => setType('dir')}>Directional</Toggle>
            <Toggle active={type === 'spot'} onClick={() => setType('spot')}>Spot</Toggle>
            <Toggle active={type === 'pt'} onClick={() => setType('pt')}>Point</Toggle>
          </div>

          {type !== 'pt' && (
            <input type="range" min={0} max={6.28} step={0.02} value={angle}
              onChange={(e) => setAngle(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#fde68a' }} />
          )}

          <div style={{ padding: 12, borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 12, color: '#bbb', lineHeight: 1.7 }}>
            <div style={{ color: '#c7d2fe', fontWeight: 600, marginBottom: 4 }}>{info[type].name} Light</div>
            <div>投影：<span style={{ color: '#a5b4fc' }}>{info[type].proj}</span></div>
            <div>shadow map：<span style={{ color: '#a5b4fc' }}>{info[type].count}</span></div>
            <div>相对成本：<span style={{ color: '#fbbf24' }}>{info[type].cost}</span></div>
            <div>典型用途：{info[type].use}</div>
          </div>

          <Status>
            <div>directional 用 ortho（平行光）</div>
            <div>spot 用 perspective（圆锥）</div>
            <div>point 用 cubemap（6 个方向）</div>
          </Status>
        </div>
      </div>
    </div>
  )
}
