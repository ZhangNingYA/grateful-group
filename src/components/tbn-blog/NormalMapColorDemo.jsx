import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 解释法线贴图为什么是蓝紫色的
 * 交互式展示：法线方向 ↔ RGB 颜色的对应关系
 * 用户拖动法线方向，实时看到对应的颜色编码
 */

function NormalArrow({ nx, ny, nz }) {
  const dir = new THREE.Vector3(nx, ny, nz).normalize()

  // 法线编码为颜色: (n * 0.5 + 0.5) * 255
  const r = Math.floor((dir.x * 0.5 + 0.5) * 255)
  const g = Math.floor((dir.y * 0.5 + 0.5) * 255)
  const b = Math.floor((dir.z * 0.5 + 0.5) * 255)

  const colorHex = (r << 16) | (g << 8) | b

  return (
    <group>
      {/* 参考平面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshStandardMaterial color="#334" side={THREE.DoubleSide} />
      </mesh>

      {/* 法线箭头 */}
      <arrowHelper
        args={[dir, new THREE.Vector3(0, 0, 0), 1.5, colorHex, 0.15, 0.08]}
      />

      {/* 颜色球 */}
      <mesh position={[dir.x * 1.7, dir.y * 1.7, dir.z * 1.7]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={colorHex} />
      </mesh>

      {/* 坐标轴参考 */}
      <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0x884444, 0.04, 0.02]} />
      <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0x448844, 0.04, 0.02]} />
      <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0x444488, 0.04, 0.02]} />

      <Text position={[1.15, 0, 0]} fontSize={0.08} color="#884444">X/R</Text>
      <Text position={[0, 1.15, 0]} fontSize={0.08} color="#448844">Y/G</Text>
      <Text position={[0, 0, 1.15]} fontSize={0.08} color="#444488">Z/B</Text>
    </group>
  )
}

function Scene({ nx, ny, nz }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={0.5} />
      <NormalArrow nx={nx} ny={ny} nz={nz} />
      <OrbitControls enablePan={false} />
    </>
  )
}

export default function NormalMapColorDemo() {
  const [nx, setNx] = useState(0)
  const [ny, setNy] = useState(0)
  const [nz, setNz] = useState(1)

  // 归一化
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
  const nnx = nx / len
  const nny = ny / len
  const nnz = nz / len

  // 编码为颜色
  const r = Math.floor((nnx * 0.5 + 0.5) * 255)
  const g = Math.floor((nny * 0.5 + 0.5) * 255)
  const b = Math.floor((nnz * 0.5 + 0.5) * 255)

  return (
    <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 55%', minWidth: '280px', height: '350px', background: '#0a0a1a' }}>
          <Canvas camera={{ position: [2, 2, 2.5], fov: 45 }}>
            <Scene nx={nnx} ny={nny} nz={nnz} />
          </Canvas>
        </div>

        <div style={{ flex: '1 1 40%', minWidth: '220px', background: '#111', padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#ccc' }}>
          <div style={{ color: '#ffcc44', fontWeight: 'bold', marginBottom: '12px' }}>法线方向 → RGB 颜色</div>

          <div style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#ff6666' }}>X (R): {nnx.toFixed(2)}</span>
              <span style={{ color: '#ff6666' }}>→ {r}</span>
            </div>
            <input type="range" min="-1" max="1" step="0.05" value={nx}
              onChange={(e) => setNx(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#ff4444' }} />
          </div>

          <div style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#66ff66' }}>Y (G): {nny.toFixed(2)}</span>
              <span style={{ color: '#66ff66' }}>→ {g}</span>
            </div>
            <input type="range" min="-1" max="1" step="0.05" value={ny}
              onChange={(e) => setNy(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#44ff44' }} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6688ff' }}>Z (B): {nnz.toFixed(2)}</span>
              <span style={{ color: '#6688ff' }}>→ {b}</span>
            </div>
            <input type="range" min="-1" max="1" step="0.05" value={nz}
              onChange={(e) => setNz(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#4488ff' }} />
          </div>

          {/* 颜色预览 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              background: `rgb(${r}, ${g}, ${b})`,
              border: '2px solid #333',
            }} />
            <div style={{ fontSize: '11px', color: '#888' }}>
              <div>RGB({r}, {g}, {b})</div>
              <div style={{ marginTop: '4px' }}>
                编码公式：<br />
                color = normal * 0.5 + 0.5
              </div>
            </div>
          </div>

          <div style={{ background: '#0a0a1a', borderRadius: '6px', padding: '10px', fontSize: '11px', color: '#888' }}>
            💡 当法线 = (0, 0, 1) 时<br />
            RGB = (128, 128, 255)<br />
            → 这就是法线贴图标志性的<span style={{ color: '#8888ff' }}>蓝紫色</span>！
          </div>
        </div>
      </div>
    </div>
  )
}
