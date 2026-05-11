import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * 空间变换演示：
 * 展示 TBN 矩阵如何将切线空间的法线变换到世界空间
 * 左边：切线空间（法线贴图中的向量）
 * 右边：世界空间（变换后的向量）
 * 中间：TBN 矩阵连接两者
 */

function TangentSpaceView({ normalTS }) {
  return (
    <group position={[-2.5, 0, 0]}>
      {/* 标题 */}
      <Text position={[0, 2, 0]} fontSize={0.15} color="#ffcc44">切线空间</Text>

      {/* 坐标轴 */}
      <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.2, 0xff4444, 0.06, 0.03]} />
      <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.2, 0x44ff44, 0.06, 0.03]} />
      <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.2, 0x4488ff, 0.06, 0.03]} />

      <Text position={[1.4, 0, 0]} fontSize={0.1} color="#ff4444">u</Text>
      <Text position={[0, 1.4, 0]} fontSize={0.1} color="#44ff44">v</Text>
      <Text position={[0, 0, 1.4]} fontSize={0.1} color="#4488ff">n</Text>

      {/* 法线贴图中的法线向量 */}
      <arrowHelper
        args={[
          new THREE.Vector3(...normalTS).normalize(),
          new THREE.Vector3(0, 0, 0),
          1.5,
          0xffaa00,
          0.1,
          0.05,
        ]}
      />

      {/* 参考平面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#223" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function WorldSpaceView({ normalWS, T, B, N }) {
  return (
    <group position={[2.5, 0, 0]}>
      {/* 标题 */}
      <Text position={[0, 2, 0]} fontSize={0.15} color="#ffcc44">世界空间</Text>

      {/* TBN 坐标轴（表面的局部坐标系） */}
      <arrowHelper args={[new THREE.Vector3(...T), new THREE.Vector3(0, 0, 0), 1.2, 0xff4444, 0.06, 0.03]} />
      <arrowHelper args={[new THREE.Vector3(...B), new THREE.Vector3(0, 0, 0), 1.2, 0x44ff44, 0.06, 0.03]} />
      <arrowHelper args={[new THREE.Vector3(...N), new THREE.Vector3(0, 0, 0), 1.2, 0x4488ff, 0.06, 0.03]} />

      <Text
        position={[T[0] * 1.4, T[1] * 1.4, T[2] * 1.4]}
        fontSize={0.1} color="#ff4444"
      >T</Text>
      <Text
        position={[B[0] * 1.4, B[1] * 1.4, B[2] * 1.4]}
        fontSize={0.1} color="#44ff44"
      >B</Text>
      <Text
        position={[N[0] * 1.4, N[1] * 1.4, N[2] * 1.4]}
        fontSize={0.1} color="#4488ff"
      >N</Text>

      {/* 变换后的法线 */}
      <arrowHelper
        args={[
          new THREE.Vector3(...normalWS).normalize(),
          new THREE.Vector3(0, 0, 0),
          1.5,
          0xffaa00,
          0.1,
          0.05,
        ]}
      />

      {/* 倾斜的参考平面 */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#223" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function TransformArrow() {
  return (
    <group position={[0, 1.8, 0]}>
      <Text position={[0, 0, 0]} fontSize={0.13} color="#888">
        × TBN →
      </Text>
    </group>
  )
}

function Scene({ normalTS, surfaceAngle }) {
  // 模拟一个倾斜表面的 TBN
  const angle = surfaceAngle * Math.PI / 180
  const T = [Math.cos(angle), Math.sin(angle), 0]
  const B = [0, 0, 1]
  const N = [-Math.sin(angle), Math.cos(angle), 0]

  // TBN 矩阵变换
  const tbnMatrix = new THREE.Matrix3()
  tbnMatrix.set(
    T[0], B[0], N[0],
    T[1], B[1], N[1],
    T[2], B[2], N[2]
  )

  const normalTSVec = new THREE.Vector3(...normalTS).normalize()
  const normalWS = normalTSVec.clone().applyMatrix3(tbnMatrix).normalize()

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={0.5} />
      <TangentSpaceView normalTS={normalTS} />
      <TransformArrow />
      <WorldSpaceView normalWS={normalWS.toArray()} T={T} B={B} N={N} />
      <OrbitControls enablePan={true} />
    </>
  )
}

export default function SpaceTransformDemo() {
  const [nx, setNx] = useState(0.3)
  const [ny, setNy] = useState(0)
  const [nz, setNz] = useState(0.95)
  const [surfaceAngle, setSurfaceAngle] = useState(30)

  // 归一化
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
  const normalTS = [nx / len, ny / len, nz / len]

  return (
    <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
      <div style={{ height: '380px', background: '#0a0a1a' }}>
        <Canvas camera={{ position: [0, 2, 7], fov: 40 }}>
          <Scene normalTS={normalTS} surfaceAngle={surfaceAngle} />
        </Canvas>
      </div>
      <div style={{ background: '#111', padding: '14px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div style={{ flex: '1 1 150px' }}>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>
              法线 X (切线空间): {normalTS[0].toFixed(2)}
            </div>
            <input type="range" min="-1" max="1" step="0.05" value={nx}
              onChange={(e) => setNx(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#ff4444' }} />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>
              法线 Z (切线空间): {normalTS[2].toFixed(2)}
            </div>
            <input type="range" min="0" max="1" step="0.05" value={nz}
              onChange={(e) => setNz(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#4488ff' }} />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>
              表面倾斜角度: {surfaceAngle}°
            </div>
            <input type="range" min="0" max="90" step="5" value={surfaceAngle}
              onChange={(e) => setSurfaceAngle(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#ffcc44' }} />
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
          左侧：法线贴图中的法线（切线空间） | 右侧：经 TBN 变换后的法线（世界空间）
        </div>
      </div>
    </div>
  )
}
