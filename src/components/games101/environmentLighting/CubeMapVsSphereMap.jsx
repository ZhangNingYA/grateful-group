import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

function EnvironmentSphere({ mapType }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        metalness={0.9}
        roughness={0.1}
        color="#ffffff"
      />
    </mesh>
  )
}

function DistortionGrid({ type }) {
  const points = []
  const resolution = type === 'sphere' ? 20 : 15
  
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const u = i / resolution
      const v = j / resolution
      
      let x, y, z
      if (type === 'sphere') {
        const theta = v * Math.PI
        const phi = u * Math.PI * 2
        x = Math.sin(theta) * Math.cos(phi) * 3
        y = Math.cos(theta) * 3
        z = Math.sin(theta) * Math.sin(phi) * 3
      } else {
        // Cube map projection
        const face = Math.floor(u * 6) % 6
        const localU = (u * 6 - face) * 2 - 1
        const localV = v * 2 - 1
        
        switch(face) {
          case 0: x = 3; y = -localV * 3; z = -localU * 3; break
          case 1: x = -3; y = -localV * 3; z = localU * 3; break
          case 2: x = localU * 3; y = 3; z = localV * 3; break
          case 3: x = localU * 3; y = -3; z = -localV * 3; break
          case 4: x = localU * 3; y = -localV * 3; z = 3; break
          case 5: x = -localU * 3; y = -localV * 3; z = -3; break
          default: x = 0; y = 0; z = 0
        }
      }
      
      points.push(new THREE.Vector3(x, y, z))
    }
  }
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  
  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.05} color={type === 'sphere' ? '#ff6b6b' : '#4dabf7'} />
    </points>
  )
}

export default function CubeMapVsSphereMap() {
  const [mapType, setMapType] = useState('cube')
  
  return (
    <div className="my-8 border-2 border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">环境贴图对比：Cube Map vs Sphere Map</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMapType('cube')}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              mapType === 'cube'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Cube Map (立方体贴图)
          </button>
          <button
            onClick={() => setMapType('sphere')}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              mapType === 'sphere'
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Sphere Map (球面贴图)
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-3">
          {mapType === 'cube' 
            ? '✓ 扭曲小、采样均匀、GPU硬件支持'
            : '⚠ 两极严重扭曲、纹理密度不均'}
        </p>
      </div>
      
      <div className="relative" style={{ height: '500px' }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          <EnvironmentSphere mapType={mapType} />
          <DistortionGrid type={mapType} />
          
          <Environment preset="sunset" />
          <OrbitControls enableDamping dampingFactor={0.05} />
          
          <gridHelper args={[10, 10, '#444', '#222']} />
        </Canvas>
        
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
          拖动旋转查看 | 滚轮缩放
        </div>
      </div>
      
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-bold text-blue-400 mb-1">Cube Map</div>
            <ul className="text-gray-300 space-y-1">
              <li>• 6张正方形纹理</li>
              <li>• 扭曲小、均匀分布</li>
              <li>• GPU原生支持</li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-red-400 mb-1">Sphere Map</div>
            <ul className="text-gray-300 space-y-1">
              <li>• 单张纹理</li>
              <li>• 两极扭曲严重</li>
              <li>• 纹理密度不均</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
