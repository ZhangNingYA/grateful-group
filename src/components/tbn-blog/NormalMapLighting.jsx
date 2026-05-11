import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 法线贴图 + 可拖拽光源
 * 用户可以拖动光源位置，直观看到法线贴图如何影响光照
 * 同时对比有/无法线贴图的效果
 */

function LitSphere({ position, useNormalMap, normalMap, lightPos }) {
  const materialRef = useRef()

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.needsUpdate = true
    }
  })

  return (
    <mesh position={position}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#cc9966"
        roughness={0.5}
        metalness={0.1}
        normalMap={useNormalMap ? normalMap : null}
        normalScale={useNormalMap ? new THREE.Vector2(2, 2) : new THREE.Vector2(0, 0)}
      />
    </mesh>
  )
}

function MovableLight({ position, onMove }) {
  const meshRef = useRef()
  const lightRef = useRef()

  useFrame((state) => {
    // 光源绕圈运动
    const t = state.clock.elapsedTime
    const x = Math.cos(t * 0.5) * 3
    const y = 2
    const z = Math.sin(t * 0.5) * 3
    if (meshRef.current) {
      meshRef.current.position.set(x, y, z)
    }
    if (lightRef.current) {
      lightRef.current.position.set(x, y, z)
    }
  })

  return (
    <>
      <pointLight ref={lightRef} intensity={40} color="#ffddaa" distance={10} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ffdd44" />
      </mesh>
    </>
  )
}

function Scene({ showNormal }) {
  // 程序化法线贴图
  const normalMap = useMemo(() => {
    const size = 256
    const data = new Uint8Array(size * size * 4)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4
        const brickW = 32
        const brickH = 16
        const mortarW = 2
        const row = Math.floor(y / brickH)
        const offsetX = row % 2 === 0 ? 0 : brickW / 2
        const localX = (x + offsetX) % brickW
        const localY = y % brickH

        const isMortar = localX < mortarW || localY < mortarW

        if (isMortar) {
          const nx = localX < mortarW ? (localX === 0 ? -0.6 : 0.6) : 0
          const ny = localY < mortarW ? (localY === 0 ? -0.6 : 0.6) : 0
          data[i] = Math.floor((nx * 0.5 + 0.5) * 255)
          data[i + 1] = Math.floor((ny * 0.5 + 0.5) * 255)
          data[i + 2] = 180
          data[i + 3] = 255
        } else {
          const noise = (Math.random() - 0.5) * 10
          data[i] = 128 + noise
          data[i + 1] = 128 + noise
          data[i + 2] = 255
          data[i + 3] = 255
        }
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
    tex.needsUpdate = true
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [])

  return (
    <>
      <ambientLight intensity={0.15} />
      <MovableLight />
      <LitSphere position={[0, 0, 0]} useNormalMap={showNormal} normalMap={normalMap} />
      <OrbitControls enablePan={false} />
    </>
  )
}

export default function NormalMapLighting() {
  const [showNormal, setShowNormal] = useState(true)

  return (
    <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
      <div style={{ height: '400px', background: '#0a0a1a' }}>
        <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
          <Scene showNormal={showNormal} />
        </Canvas>
      </div>
      <div style={{ background: '#111', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <span style={{ color: '#aaa', fontSize: '13px' }}>法线贴图：</span>
        <button
          onClick={() => setShowNormal(false)}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            border: 'none',
            background: !showNormal ? '#4488ff' : '#333',
            color: 'white',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'background 0.2s',
          }}
        >
          ❌ 关闭
        </button>
        <button
          onClick={() => setShowNormal(true)}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            border: 'none',
            background: showNormal ? '#4488ff' : '#333',
            color: 'white',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'background 0.2s',
          }}
        >
          ✅ 开启
        </button>
        <span style={{ color: '#666', fontSize: '11px', marginLeft: '8px' }}>
          光源自动旋转中 — 观察砖墙凹凸效果
        </span>
      </div>
    </div>
  )
}
