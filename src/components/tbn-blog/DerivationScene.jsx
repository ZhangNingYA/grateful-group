import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Step 3 & 4 的核心推导可视化：
 * 展示 E1 = Δu1*T + Δv1*B 的几何含义
 * 用户可以调节 Δu 和 Δv 的滑块，看到 T 和 B 的线性组合如何构成边向量
 */

function VectorDecomposition({ deltaU, deltaV, T, B, edgeVec, label }) {
  const tComponent = T.clone().multiplyScalar(deltaU)
  const bComponent = B.clone().multiplyScalar(deltaV)

  return (
    <group>
      {/* T 分量 */}
      <arrowHelper
        args={[
          tComponent.clone().normalize(),
          new THREE.Vector3(0, 0, 0),
          tComponent.length(),
          0xff4444,
          0.08,
          0.04,
        ]}
      />

      {/* B 分量（从 T 分量末端开始） */}
      <arrowHelper
        args={[
          bComponent.clone().normalize(),
          tComponent.clone(),
          bComponent.length(),
          0x44ff44,
          0.08,
          0.04,
        ]}
      />

      {/* 合成的边向量 */}
      <arrowHelper
        args={[
          edgeVec.clone().normalize(),
          new THREE.Vector3(0, 0, 0),
          edgeVec.length(),
          0xffcc44,
          0.1,
          0.05,
        ]}
      />

      {/* 标注 */}
      <Text position={[tComponent.x / 2, -0.2, tComponent.z / 2]} fontSize={0.1} color="#ff4444">
        Δu·T
      </Text>
      <Text
        position={[tComponent.x + bComponent.x / 2, tComponent.y + bComponent.y / 2 + 0.15, 0]}
        fontSize={0.1}
        color="#44ff44"
      >
        Δv·B
      </Text>
      <Text
        position={[edgeVec.x / 2 + 0.1, edgeVec.y / 2 + 0.15, edgeVec.z / 2]}
        fontSize={0.1}
        color="#ffcc44"
      >
        {label}
      </Text>
    </group>
  )
}

function DerivationSceneInner({ du1, dv1, du2, dv2 }) {
  // T 和 B 基向量（单位向量）
  const T = new THREE.Vector3(1, 0, 0)
  const B = new THREE.Vector3(0, 1, 0)

  // 边向量 = Δu*T + Δv*B
  const E1 = T.clone().multiplyScalar(du1).add(B.clone().multiplyScalar(dv1))
  const E2 = T.clone().multiplyScalar(du2).add(B.clone().multiplyScalar(dv2))

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={0.7} />

      {/* 基向量 T 和 B（虚线风格，较淡） */}
      <arrowHelper
        args={[T, new THREE.Vector3(0, 0, 0), 2, 0xff4444, 0.06, 0.03]}
      />
      <arrowHelper
        args={[B, new THREE.Vector3(0, 0, 0), 2, 0x44ff44, 0.06, 0.03]}
      />
      <Text position={[2.2, 0, 0]} fontSize={0.14} color="#ff4444">T</Text>
      <Text position={[0, 2.2, 0]} fontSize={0.14} color="#44ff44">B</Text>

      {/* E1 的分解 */}
      <VectorDecomposition deltaU={du1} deltaV={dv1} T={T} B={B} edgeVec={E1} label="E1" />

      {/* E2 的分解（偏移一点避免重叠） */}
      <group position={[0, 0, 0]}>
        <VectorDecomposition deltaU={du2} deltaV={dv2} T={T} B={B} edgeVec={E2} label="E2" />
      </group>

      {/* 网格 */}
      <gridHelper args={[4, 8, '#333', '#222']} rotation={[Math.PI / 2, 0, 0]} />

      <OrbitControls enablePan={false} />
    </>
  )
}

export default function DerivationScene() {
  const [du1, setDu1] = useState(1.5)
  const [dv1, setDv1] = useState(0.3)
  const [du2, setDu2] = useState(0.4)
  const [dv2, setDv2] = useState(1.2)

  const sliderStyle = {
    width: '100%',
    accentColor: '#4488ff',
    cursor: 'pointer',
  }

  const labelStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
    fontSize: '12px',
  }

  return (
    <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {/* 3D 场景 */}
        <div style={{ flex: '1 1 65%', minWidth: '300px', height: '400px', background: '#0a0a1a' }}>
          <Canvas camera={{ position: [1, 1, 4], fov: 45 }}>
            <DerivationSceneInner du1={du1} dv1={dv1} du2={du2} dv2={dv2} />
          </Canvas>
        </div>

        {/* 控制面板 */}
        <div style={{ flex: '1 1 30%', minWidth: '200px', background: '#111', padding: '16px', fontFamily: 'monospace', color: '#ccc' }}>
          <div style={{ color: '#ffcc44', fontWeight: 'bold', marginBottom: '12px', fontSize: '13px' }}>
            调节 ΔUV 观察分解
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#ff8844', fontSize: '12px', marginBottom: '6px' }}>E₁ = Δu₁·T + Δv₁·B</div>
            <div style={labelStyle}>
              <span style={{ color: '#ff4444' }}>Δu₁</span>
              <span>{du1.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="2" step="0.05" value={du1}
              onChange={(e) => setDu1(parseFloat(e.target.value))} style={sliderStyle} />
            <div style={{ ...labelStyle, marginTop: '8px' }}>
              <span style={{ color: '#44ff44' }}>Δv₁</span>
              <span>{dv1.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="2" step="0.05" value={dv1}
              onChange={(e) => setDv1(parseFloat(e.target.value))} style={sliderStyle} />
          </div>

          <div>
            <div style={{ color: '#44ccff', fontSize: '12px', marginBottom: '6px' }}>E₂ = Δu₂·T + Δv₂·B</div>
            <div style={labelStyle}>
              <span style={{ color: '#ff4444' }}>Δu₂</span>
              <span>{du2.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="2" step="0.05" value={du2}
              onChange={(e) => setDu2(parseFloat(e.target.value))} style={sliderStyle} />
            <div style={{ ...labelStyle, marginTop: '8px' }}>
              <span style={{ color: '#44ff44' }}>Δv₂</span>
              <span>{dv2.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="2" step="0.05" value={dv2}
              onChange={(e) => setDv2(parseFloat(e.target.value))} style={sliderStyle} />
          </div>

          <div style={{ marginTop: '16px', padding: '10px', background: '#0a0a1a', borderRadius: '6px', fontSize: '11px', color: '#888' }}>
            💡 黄色箭头 = 合成的边向量<br />
            红色段 = Δu·T 分量<br />
            绿色段 = Δv·B 分量<br />
            <br />
            边向量 = T方向分量 + B方向分量
          </div>
        </div>
      </div>
    </div>
  )
}
