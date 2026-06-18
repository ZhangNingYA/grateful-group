import React, { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Line } from '@react-three/drei'
import * as THREE from 'three'

function HemisphereSamples({ sampleCount, normal }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i < sampleCount; i++) {
      const theta = Math.acos(Math.random())
      const phi = Math.random() * Math.PI * 2
      
      const x = Math.sin(theta) * Math.cos(phi)
      const y = Math.cos(theta)
      const z = Math.sin(theta) * Math.sin(phi)
      
      pts.push(new THREE.Vector3(x * 2, y * 2, z * 2))
    }
    return pts
  }, [sampleCount])
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  
  return (
    <>
      <points geometry={geometry}>
        <pointsMaterial size={0.08} color="#ffd43b" />
      </points>
      {points.slice(0, Math.min(10, points.length)).map((pt, i) => (
        <Line
          key={i}
          points={[[0, 0, 0], [pt.x, pt.y, pt.z]]}
          color="#ffd43b"
          lineWidth={1}
          opacity={0.3}
          transparent
        />
      ))}
    </>
  )
}

function SurfaceWithNormal({ roughness }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#4dabf7"
          metalness={0.3}
          roughness={roughness}
        />
      </mesh>
      
      <arrowHelper
        args={[
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, 0, 0),
          1.5,
          '#ff6b6b',
          0.3,
          0.2
        ]}
      />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[2, 64]} />
        <meshBasicMaterial color="#1e1e1e" opacity={0.3} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default function IBLIntegrationDemo() {
  const [sampleCount, setSampleCount] = useState(32)
  const [roughness, setRoughness] = useState(0.5)
  
  return (
    <div className="my-8 border-2 border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">IBL 半球积分可视化</h3>
        <p className="text-sm text-gray-400 mb-4">
          环境光照 = 对半球上所有方向的入射光积分
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              采样数量: {sampleCount}
            </label>
            <input
              type="range"
              min="8"
              max="128"
              step="8"
              value={sampleCount}
              onChange={(e) => setSampleCount(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              实时渲染通常需要 100+ 采样才能收敛 → 太贵！
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              表面粗糙度: {roughness.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={roughness}
              onChange={(e) => setRoughness(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="relative" style={{ height: '500px' }}>
        <Canvas camera={{ position: [4, 3, 4], fov: 50 }}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          
          <SurfaceWithNormal roughness={roughness} />
          <HemisphereSamples sampleCount={sampleCount} normal={[0, 1, 0]} />
          
          <Environment preset="sunset" />
          <OrbitControls enableDamping dampingFactor={0.05} />
          
          <gridHelper args={[6, 6, '#444', '#222']} />
        </Canvas>
        
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
          🟡 黄点 = 采样方向
        </div>
      </div>
      
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="text-sm space-y-2">
          <div className="font-mono text-green-400">
            L_o = ∫_Ω L_i(ωᵢ) · BRDF · cosθᵢ dωᵢ
          </div>
          <div className="text-gray-300">
            红色箭头 = 表面法线 | 黄色点 = 采样方向 | 黄色线 = 光线路径
          </div>
          <div className="text-yellow-400">
            💡 解决方案：预计算（Split Sum）或低频表示（SH）
          </div>
        </div>
      </div>
    </div>
  )
}
