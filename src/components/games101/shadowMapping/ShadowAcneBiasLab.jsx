import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import { Header, ObsTask, Slider, Toggle, Status, Pill, panelStyle, sidePanel } from './ui.jsx'

function AcneScene({ bias, resolution, normalBias, lightAngle }) {
  const lightRef = useRef()

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.shadow.mapSize.set(resolution, resolution)
      lightRef.current.shadow.bias = bias
      lightRef.current.shadow.normalBias = normalBias
      lightRef.current.shadow.camera.left = -4
      lightRef.current.shadow.camera.right = 4
      lightRef.current.shadow.camera.top = 4
      lightRef.current.shadow.camera.bottom = -4
      lightRef.current.shadow.camera.near = 0.5
      lightRef.current.shadow.camera.far = 15
      lightRef.current.shadow.camera.updateProjectionMatrix()
      lightRef.current.shadow.needsUpdate = true
    }
  }, [resolution, bias, normalBias])

  const lightPos = [Math.cos(lightAngle) * 3.5, 4, Math.sin(lightAngle) * 3.5]

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight ref={lightRef} position={lightPos} intensity={1.3} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow castShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#3a3a4a" />
      </mesh>
      <mesh position={[-0.6, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      <mesh position={[1.5, 0.5, 0.5]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color="#f43f5e" />
      </mesh>
      <mesh position={lightPos}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

function classifyBias(bias, normalBias) {
  if (Math.abs(bias) < 0.0002 && normalBias === 0) return { label: 'no bias → 大量 shadow acne', color: '#f87171', kind: 'acne' }
  if (Math.abs(bias) > 0.008) return { label: 'bias 太大 → peter panning（阴影脱离物体）', color: '#fbbf24', kind: 'peter' }
  if (normalBias > 0.05) return { label: 'normal bias 过大 → 阴影从物体身上"剥离"', color: '#fbbf24', kind: 'peter' }
  return { label: '✓ 较好平衡', color: '#4ade80', kind: 'ok' }
}

export default function ShadowAcneBiasLab() {
  const [bias, setBias] = useState(-0.001)
  const [normalBias, setNormalBias] = useState(0.02)
  const [resolution, setResolution] = useState(512)
  const [lightAngle, setLightAngle] = useState(0.5)

  const status = classifyBias(bias, normalBias)

  const presets = [
    { name: 'no bias', b: 0, nb: 0 },
    { name: 'small bias', b: -0.0008, nb: 0.01 },
    { name: 'balanced', b: -0.001, nb: 0.02 },
    { name: 'too large', b: -0.012, nb: 0.08 },
  ]

  return (
    <div style={panelStyle}>
      <Header
        title="Shadow Acne / Bias / Peter Panning"
        subtitle="bias 是工程补丁，过小有 acne，过大有 peter panning。"
        right={<Pill ok={status.kind === 'ok'} label={status.kind === 'ok' ? 'balanced' : status.kind} />}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr)' }}>
        <div style={{ height: 460, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas shadows camera={{ position: [3, 2.5, 3.5], fov: 45 }}>
            <AcneScene bias={bias} normalBias={normalBias} resolution={resolution} lightAngle={lightAngle} />
          </Canvas>
        </div>
        <div style={sidePanel}>
          <ObsTask>1) 把 bias 拖到 0 → 看 ground 上的斑点。2) 把 bias 拖到 −0.012 → 看阴影脱离物体底部。3) 找一个让 acne 几乎消失但又没 peter panning 的值。</ObsTask>

          <Slider label="bias" value={bias} min={-0.015} max={0.005} step={0.0001} onChange={setBias} color="#fbbf24" precision={4} />
          <Slider label="normal bias" value={normalBias} min={0} max={0.12} step={0.002} onChange={setNormalBias} color="#4ade80" precision={3} />
          <Slider label="resolution" value={resolution} min={128} max={2048} step={128} onChange={setResolution} color="#6366f1" />
          <Slider label="light angle" value={lightAngle} min={0} max={6.28} step={0.02} onChange={setLightAngle} color="#fde68a" precision={2} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {presets.map((p) => (
              <Toggle key={p.name} active={false}
                onClick={() => { setBias(p.b); setNormalBias(p.nb) }}>
                {p.name}
              </Toggle>
            ))}
          </div>

          <div style={{ padding: 10, borderRadius: 8, background: `${status.color}10`, border: `1px solid ${status.color}55`, fontSize: 11, color: status.color, lineHeight: 1.6 }}>
            {status.label}
          </div>

          <Status>
            <div>低分辨率 + 大 frustum + 斜面 = 容易 acne。</div>
            <div>解决：bias / normal bias / 增加分辨率 / 收紧 frustum。</div>
          </Status>
        </div>
      </div>
    </div>
  )
}
