import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'

function TestSphere({ useEnv }) {
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#ffffff"
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  )
}

function Scene({ lightingMode }) {
  return (
    <>
      {lightingMode === 'direct' && (
        <>
          <ambientLight intensity={0.1} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        </>
      )}
      
      {lightingMode === 'env' && (
        <>
          <ambientLight intensity={0.3} />
          <Environment preset="sunset" />
        </>
      )}
      
      {lightingMode === 'both' && (
        <>
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <Environment preset="sunset" />
        </>
      )}
      
      {lightingMode === 'none' && (
        <ambientLight intensity={0.05} />
      )}
      
      <TestSphere />
      
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>
    </>
  )
}

const lightingModes = [
  { id: 'none', name: '无光照', desc: '只有极弱环境光' },
  { id: 'direct', name: '只有直接光', desc: '方向光 + 弱环境常数' },
  { id: 'env', name: '只有环境光', desc: 'IBL环境贴图' },
  { id: 'both', name: '直接光 + 环境光', desc: '真实感的关键' },
]

export default function EnvironmentLightingComparison() {
  const [mode, setMode] = useState('both')
  const currentMode = lightingModes.find(m => m.id === mode)
  
  return (
    <div className="my-8 border-2 border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">直接光 vs 环境光对比</h3>
        <p className="text-sm text-gray-400 mb-4">
          真实感渲染 = 直接光照 + 环境光照
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {lightingModes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                mode === m.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
        
        <div className="mt-3 bg-gray-950 p-3 rounded">
          <div className="text-white font-bold">{currentMode.name}</div>
          <div className="text-gray-400 text-sm">{currentMode.desc}</div>
        </div>
      </div>
      
      <div className="relative" style={{ height: '500px' }}>
        <Canvas
          camera={{ position: [3, 2, 3], fov: 50 }}
          shadows
        >
          <Scene lightingMode={mode} />
          <OrbitControls enableDamping dampingFactor={0.05} />
        </Canvas>
        
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
          拖动旋转 | 观察光照效果
        </div>
      </div>
      
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-bold text-yellow-400 mb-2">直接光照</div>
            <ul className="text-gray-300 space-y-1">
              <li>• 来自明确光源（太阳、灯泡）</li>
              <li>• 有明确方向和阴影</li>
              <li>• 对比强烈</li>
              <li>• 阴影区域全黑</li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-blue-400 mb-2">环境光照</div>
            <ul className="text-gray-300 space-y-1">
              <li>• 来自环境所有方向</li>
              <li>• 填充阴影区域</li>
              <li>• 柔和自然</li>
              <li>• 占真实感50%+</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-950 rounded">
          <div className="text-blue-300 text-sm">
            💡 注意观察：只有"直接光+环境光"时，球体才有自然的明暗过渡和柔和的阴影填充
          </div>
        </div>
      </div>
    </div>
  )
}
