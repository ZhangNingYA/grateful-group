import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'

function Scene({ lightPos, resolution, bias, showFrustum }) {
  const lightRef = useRef()
  const helperRef = useRef()

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.shadow.mapSize.set(resolution, resolution)
      lightRef.current.shadow.bias = bias
      lightRef.current.shadow.camera.left = -6
      lightRef.current.shadow.camera.right = 6
      lightRef.current.shadow.camera.top = 6
      lightRef.current.shadow.camera.bottom = -6
      lightRef.current.shadow.camera.near = 0.5
      lightRef.current.shadow.camera.far = 20
      lightRef.current.shadow.camera.updateProjectionMatrix()
      lightRef.current.shadow.needsUpdate = true
    }
  }, [resolution, bias, lightPos])

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight
        ref={lightRef}
        position={lightPos}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={resolution}
        shadow-mapSize-height={resolution}
        shadow-bias={bias}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
      />
      {showFrustum && lightRef.current && (
        <cameraHelper args={[lightRef.current.shadow.camera]} />
      )}
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
      {/* Cube */}
      <mesh position={[-1.2, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      {/* Sphere */}
      <mesh position={[1.5, 0.6, -0.5]} castShadow receiveShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#f43f5e" />
      </mesh>
      {/* Cone */}
      <mesh position={[0, 0.8, 1.8]} castShadow receiveShadow>
        <coneGeometry args={[0.5, 1.4, 16]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      {/* Light indicator */}
      <mesh position={lightPos}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

export default function ShadowMappingHero3D() {
  const [lightAngle, setLightAngle] = useState(0.8)
  const [resolution, setResolution] = useState(1024)
  const [bias, setBias] = useState(-0.003)
  const [showFrustum, setShowFrustum] = useState(false)

  const lightPos = [Math.cos(lightAngle) * 5, 6, Math.sin(lightAngle) * 5]

  const toggleStyle = (active) => ({
    padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
    border: active ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.06)',
    background: active ? 'rgba(245,158,11,0.08)' : 'transparent',
    color: active ? '#fbbf24' : '#666',
  })

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <div style={{ height: '420px' }}>
        <Canvas shadows camera={{ position: [5, 4, 5], fov: 45 }}>
          <Scene lightPos={lightPos} resolution={resolution} bias={bias} showFrustum={showFrustum} />
        </Canvas>
      </div>
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button style={toggleStyle(showFrustum)} onClick={() => setShowFrustum(!showFrustum)}>Light Frustum</button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
            <span>Res: <span style={{ color: '#a5b4fc' }}>{resolution}</span></span>
            <span>Bias: <span style={{ color: '#f59e0b' }}>{bias.toFixed(4)}</span></span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '3px' }}>Light Angle</div>
            <input type="range" min="0" max="6.28" step="0.05" value={lightAngle}
              onChange={(e) => setLightAngle(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#fbbf24' }} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '3px' }}>Resolution</div>
            <input type="range" min="128" max="2048" step="128" value={resolution}
              onChange={(e) => setResolution(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '3px' }}>Bias</div>
            <input type="range" min="-0.01" max="0.01" step="0.0005" value={bias}
              onChange={(e) => setBias(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#f43f5e' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
