import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * 直观展示"为什么需要切线空间"
 * 一个可旋转的平面，上面贴着法线贴图的颜色示意
 * 用户可以旋转平面，观察 TBN 坐标系如何跟随表面
 */

function Arrow3D({ from, direction, length = 1, color, label }) {
  const dir = new THREE.Vector3(...direction).normalize()
  const origin = new THREE.Vector3(...from)

  return (
    <group>
      <arrowHelper args={[dir, origin, length, color, length * 0.18, length * 0.09]} />
      {label && (
        <Text
          position={[
            from[0] + dir.x * (length + 0.2),
            from[1] + dir.y * (length + 0.2),
            from[2] + dir.z * (length + 0.2),
          ]}
          fontSize={0.15}
          color={color}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {label}
        </Text>
      )}
    </group>
  )
}

function RotatablePlane() {
  const groupRef = useRef()
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  // 自动缓慢旋转
  useFrame((state) => {
    if (groupRef.current && !dragging) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.4
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  // 计算当前旋转后的 TBN 方向
  const matrix = new THREE.Matrix4()
  if (groupRef.current) {
    matrix.makeRotationFromEuler(groupRef.current.rotation)
  }

  return (
    <group ref={groupRef}>
      {/* 平面 */}
      <mesh>
        <planeGeometry args={[2.5, 2.5]} />
        <meshStandardMaterial color="#5588aa" side={THREE.DoubleSide} />
      </mesh>

      {/* UV 网格线 */}
      {[...Array(5)].map((_, i) => {
        const t = (i / 4) * 2.5 - 1.25
        return (
          <group key={i}>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([t, -1.25, 0.01, t, 1.25, 0.01])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#ffffff" opacity={0.2} transparent />
            </line>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([-1.25, t, 0.01, 1.25, t, 0.01])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#ffffff" opacity={0.2} transparent />
            </line>
          </group>
        )
      })}

      {/* TBN 箭头 */}
      <Arrow3D from={[0, 0, 0]} direction={[1, 0, 0]} length={1.5} color={0xff4444} label="T" />
      <Arrow3D from={[0, 0, 0]} direction={[0, 1, 0]} length={1.5} color={0x44ff44} label="B" />
      <Arrow3D from={[0, 0, 0]} direction={[0, 0, 1]} length={1.5} color={0x4488ff} label="N" />
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={0.8} />
      <RotatablePlane />
      <OrbitControls enablePan={false} enableZoom={true} />
    </>
  )
}

export default function CoordinateSpaceIntro() {
  return (
    <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
      <div style={{ height: '400px', background: '#0a0a1a' }}>
        <Canvas camera={{ position: [2, 2, 4], fov: 45 }}>
          <Scene />
        </Canvas>
      </div>
      <div style={{ background: '#111', padding: '12px 16px', fontSize: '13px', color: '#aaa', textAlign: 'center' }}>
        🖱️ 拖拽旋转观察 — 无论平面怎么转，<span style={{ color: '#ff4444' }}>T</span>、
        <span style={{ color: '#44ff44' }}>B</span>、<span style={{ color: '#4488ff' }}>N</span> 始终贴合在表面上
      </div>
    </div>
  )
}
