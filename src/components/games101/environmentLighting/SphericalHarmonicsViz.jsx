import React, { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// 简化的球谐函数基函数
function sphericalHarmonic(l, m, theta, phi) {
  if (l === 0 && m === 0) {
    return 0.282095 // Y_0^0
  } else if (l === 1 && m === -1) {
    return 0.488603 * Math.sin(theta) * Math.sin(phi) // Y_1^-1
  } else if (l === 1 && m === 0) {
    return 0.488603 * Math.cos(theta) // Y_1^0
  } else if (l === 1 && m === 1) {
    return 0.488603 * Math.sin(theta) * Math.cos(phi) // Y_1^1
  } else if (l === 2 && m === -2) {
    return 1.092548 * Math.sin(theta) * Math.sin(theta) * Math.sin(2 * phi)
  } else if (l === 2 && m === -1) {
    return 1.092548 * Math.sin(theta) * Math.cos(theta) * Math.sin(phi)
  } else if (l === 2 && m === 0) {
    return 0.315392 * (3 * Math.cos(theta) * Math.cos(theta) - 1)
  } else if (l === 2 && m === 1) {
    return 1.092548 * Math.sin(theta) * Math.cos(theta) * Math.cos(phi)
  } else if (l === 2 && m === 2) {
    return 0.546274 * Math.sin(theta) * Math.sin(theta) * Math.cos(2 * phi)
  }
  return 0
}

function SHVisualization({ l, m }) {
  const geometry = useMemo(() => {
    const resolution = 64
    const positions = []
    const colors = []
    
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const theta = (i / resolution) * Math.PI
        const phi = (j / resolution) * Math.PI * 2
        
        const value = sphericalHarmonic(l, m, theta, phi)
        const radius = 1.5 + Math.abs(value) * 0.8
        
        const x = radius * Math.sin(theta) * Math.cos(phi)
        const y = radius * Math.cos(theta)
        const z = radius * Math.sin(theta) * Math.sin(phi)
        
        positions.push(x, y, z)
        
        // 颜色：正值蓝色，负值红色
        if (value >= 0) {
          colors.push(0.3, 0.6, 1.0)
        } else {
          colors.push(1.0, 0.3, 0.3)
        }
      }
    }
    
    const indices = []
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const a = i * (resolution + 1) + j
        const b = a + resolution + 1
        
        indices.push(a, b, a + 1)
        indices.push(b, b + 1, a + 1)
      }
    }
    
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    
    return geo
  }, [l, m])
  
  return (
    <mesh geometry={geometry}>
      <meshPhongMaterial vertexColors side={THREE.DoubleSide} shininess={30} />
    </mesh>
  )
}

const shBands = [
  { l: 0, m: 0, name: 'Y₀⁰', desc: '常数 - 平均亮度' },
  { l: 1, m: -1, name: 'Y₁⁻¹', desc: '1阶 - Y方向' },
  { l: 1, m: 0, name: 'Y₁⁰', desc: '1阶 - Z方向' },
  { l: 1, m: 1, name: 'Y₁¹', desc: '1阶 - X方向' },
  { l: 2, m: -2, name: 'Y₂⁻²', desc: '2阶 - XY平面' },
  { l: 2, m: -1, name: 'Y₂⁻¹', desc: '2阶 - YZ平面' },
  { l: 2, m: 0, name: 'Y₂⁰', desc: '2阶 - 环形' },
  { l: 2, m: 1, name: 'Y₂¹', desc: '2阶 - XZ平面' },
  { l: 2, m: 2, name: 'Y₂²', desc: '2阶 - 对角线' },
]

export default function SphericalHarmonicsViz() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = shBands[selectedIndex]
  
  return (
    <div className="my-8 border-2 border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">球谐函数基函数可视化</h3>
        <p className="text-sm text-gray-400 mb-4">
          类似傅里叶级数，任何球面函数都可以用这些"基"展开
        </p>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {shBands.map((band, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3 py-2 rounded text-sm font-mono transition-colors ${
                idx === selectedIndex
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {band.name}
            </button>
          ))}
        </div>
        
        <div className="bg-gray-950 p-3 rounded">
          <div className="text-white font-bold mb-1">{selected.name}</div>
          <div className="text-gray-400 text-sm">{selected.desc}</div>
          <div className="text-blue-400 text-xs mt-2">
            阶数 l={selected.l}, m={selected.m} | 
            {selected.l === 0 ? ' 1个系数' : selected.l === 1 ? ' 3个系数' : ' 5个系数'}
          </div>
        </div>
      </div>
      
      <div className="relative" style={{ height: '500px' }}>
        <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />
          
          <SHVisualization l={selected.l} m={selected.m} />
          
          <OrbitControls enableDamping dampingFactor={0.05} />
          <gridHelper args={[4, 4, '#444', '#222']} />
        </Canvas>
        
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded text-sm space-y-1">
          <div>🔵 蓝色 = 正值区域</div>
          <div>🔴 红色 = 负值区域</div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-bold text-yellow-400 mb-1">0阶（1个）</div>
            <div className="text-gray-300">常数项，表示平均亮度</div>
          </div>
          <div>
            <div className="font-bold text-green-400 mb-1">1阶（3个）</div>
            <div className="text-gray-300">线性项，表示主光照方向</div>
          </div>
          <div>
            <div className="font-bold text-blue-400 mb-1">2阶（5个）</div>
            <div className="text-gray-300">二次项，表示光照形状</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-950 rounded text-sm">
          <div className="text-green-400 font-mono mb-2">
            f(ω) = Σ c_l^m · Y_l^m(ω)
          </div>
          <div className="text-gray-300">
            💡 实时渲染常用2阶（9个系数）= 36 bytes，就能表示整个环境光！
          </div>
        </div>
      </div>
    </div>
  )
}
