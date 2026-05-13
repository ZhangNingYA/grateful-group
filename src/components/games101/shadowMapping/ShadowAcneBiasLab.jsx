import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'

function AcneScene({ bias, resolution }) {
  const lightRef = useRef()

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight
        ref={lightRef}
        position={[3, 5, 2]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={resolution}
        shadow-mapSize-height={resolution}
        shadow-bias={bias}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
      />
      {/* Ground - tilted slightly to show acne */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow castShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#3a3a4a" />
      </mesh>
      {/* Floating cube */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      {/* Sphere */}
      <mesh position={[1.8, 0.5, 0.5]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color="#f43f5e" />
      </mesh>
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  )
}

export default function ShadowAcneBiasLab() {
  const [bias, setBias] = useState(0)
  const [resolution, setResolution] = useState(512)

  const getStatus = () => {
    if (bias === 0) return { label: 'No Bias → Shadow Acne 可能出现', color: '#f43f5e' }
    if (Math.abs(bias) < 0.003) return { label: 'Small Bias → Acne 减少', color: '#f59e0b' }
    if (Math.abs(bias) > 0.008) return { label: 'Large Bias → Peter Panning 风险', color: '#f43f5e' }
    return { label: 'Moderate Bias → 较好平衡', color: '#4ade80' }
  }
  const status = getStatus()

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(180deg, #0c0c18 0%, #0f0f1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
      <div style={{ height: '380px' }}>
        <Canvas shadows camera={{ position: [3, 3, 4], fov: 45 }}>
          <AcneScene bias={bias} resolution={resolution} />
        </Canvas>
      </div>
      <div style={{ padding: '14px 18px', background: 'rgba(17,17,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '3px' }}>Bias: <span style={{ color: '#f59e0b' }}>{bias.toFixed(4)}</span></div>
            <input type="range" min="-0.015" max="0.015" step="0.0005" value={bias}
              onChange={(e) => setBias(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '3px' }}>Resolution: <span style={{ color: '#a5b4fc' }}>{resolution}</span></div>
            <input type="range" min="128" max="2048" step="128" value={resolution}
              onChange={(e) => setResolution(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }} />
          </div>
        </div>
        <div style={{ fontSize: '12px', color: status.color, padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
          {status.label}
        </div>
      </div>
    </div>
  )
}
