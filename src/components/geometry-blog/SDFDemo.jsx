import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, shaderMaterial } from '@react-three/drei'
import { useRef, useState, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

/**
 * 距离函数 (SDF) 演示
 * 用 Raymarching 实时渲染 SDF 定义的几何体
 * 展示 SDF 的布尔运算：并集、交集、差集
 */

const SDFMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: new THREE.Vector2(1, 1),
    uOperation: 0, // 0=union, 1=intersection, 2=subtraction, 3=smooth-union
    uSmooth: 0.3,
  },
  // Vertex
  `varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }`,
  // Fragment
  `precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform int uOperation;
  uniform float uSmooth;

  float sdSphere(vec3 p, float r) {
    return length(p) - r;
  }

  float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
  }

  float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
  }

  float opUnion(float d1, float d2) { return min(d1, d2); }
  float opIntersection(float d1, float d2) { return max(d1, d2); }
  float opSubtraction(float d1, float d2) { return max(-d1, d2); }
  float opSmoothUnion(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);
    return mix(d2, d1, h) - k*h*(1.0-h);
  }

  float scene(vec3 p) {
    float sphere = sdSphere(p - vec3(-0.5, 0.0, 0.0), 0.8);
    float box = sdBox(p - vec3(0.5, 0.0, 0.0), vec3(0.6));

    if (uOperation == 0) return opUnion(sphere, box);
    if (uOperation == 1) return opIntersection(sphere, box);
    if (uOperation == 2) return opSubtraction(sphere, box);
    return opSmoothUnion(sphere, box, uSmooth);
  }

  vec3 calcNormal(vec3 p) {
    vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
      scene(p + e.xyy) - scene(p - e.xyy),
      scene(p + e.yxy) - scene(p - e.yxy),
      scene(p + e.yyx) - scene(p - e.yyx)
    ));
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= uResolution.x / uResolution.y;

    // Camera
    float angle = uTime * 0.3;
    vec3 ro = vec3(cos(angle) * 3.5, 1.5, sin(angle) * 3.5);
    vec3 target = vec3(0.0);
    vec3 forward = normalize(target - ro);
    vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, forward);
    vec3 rd = normalize(forward + uv.x * right + uv.y * up);

    // Raymarching
    float t = 0.0;
    vec3 col = vec3(0.02, 0.02, 0.04);

    for (int i = 0; i < 80; i++) {
      vec3 p = ro + rd * t;
      float d = scene(p);
      if (d < 0.001) {
        vec3 n = calcNormal(p);
        vec3 lightDir = normalize(vec3(1.0, 2.0, 1.5));
        float diff = max(dot(n, lightDir), 0.0);
        float amb = 0.15;
        float spec = pow(max(dot(reflect(-lightDir, n), -rd), 0.0), 32.0);

        vec3 baseColor = vec3(0.4, 0.35, 0.95);
        col = baseColor * (amb + diff * 0.8) + vec3(1.0) * spec * 0.4;

        // AO approximation
        float ao = 1.0 - float(i) / 80.0;
        col *= ao;
        break;
      }
      if (t > 10.0) break;
      t += d;
    }

    // Gamma
    col = pow(col, vec3(0.4545));
    gl_FragColor = vec4(col, 1.0);
  }`
)

extend({ SDFMaterial })

function SDFPlane() {
  const materialRef = useRef()
  const { size } = useThree()

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime
      materialRef.current.uResolution.set(size.width, size.height)
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <sDFMaterial ref={materialRef} />
    </mesh>
  )
}

function SDFScene({ operation, smooth }) {
  const materialRef = useRef()

  useEffect(() => {
    // We need to find the material in the scene
  }, [operation, smooth])

  return (
    <>
      <SDFPlaneWithProps operation={operation} smooth={smooth} />
    </>
  )
}

function SDFPlaneWithProps({ operation, smooth }) {
  const materialRef = useRef()
  const { size } = useThree()

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime
      materialRef.current.uResolution.set(size.width, size.height)
      materialRef.current.uOperation = operation
      materialRef.current.uSmooth = smooth
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <sDFMaterial ref={materialRef} />
    </mesh>
  )
}

export default function SDFDemo() {
  const [operation, setOperation] = useState(0)
  const [smooth, setSmooth] = useState(0.3)

  const ops = [
    { label: '并集', desc: 'min(d₁, d₂) — 两个形状的合并' },
    { label: '交集', desc: 'max(d₁, d₂) — 两个形状的重叠部分' },
    { label: '差集', desc: 'max(-d₁, d₂) — 从一个形状中挖去另一个' },
    { label: '平滑并集', desc: 'smooth min — 两个形状平滑融合' },
  ]

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(139,92,246,0.2)', background: '#0a0a1a' }}>
      <div style={{ height: '400px' }}>
        <Canvas camera={{ position: [0, 0, 1], fov: 90 }} gl={{ antialias: true }}>
          <SDFPlaneWithProps operation={operation} smooth={smooth} />
        </Canvas>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {ops.map((op, i) => (
            <button
              key={i}
              onClick={() => setOperation(i)}
              style={{
                padding: '6px 14px',
                borderRadius: '100px',
                border: operation === i ? '1px solid #8b5cf6' : '1px solid #333',
                background: operation === i ? 'rgba(139,92,246,0.15)' : 'transparent',
                color: operation === i ? '#c4b5fd' : '#888',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {op.label}
            </button>
          ))}
        </div>
        {operation === 3 && (
          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>平滑度</span>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={smooth}
              onChange={(e) => setSmooth(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: '#8b5cf6' }}
            />
            <span style={{ fontSize: '12px', color: '#c4b5fd', fontFamily: 'monospace', minWidth: '36px' }}>{smooth.toFixed(2)}</span>
          </div>
        )}
        <div style={{ fontSize: '13px', color: '#888' }}>
          {ops[operation].desc}
        </div>
      </div>
    </div>
  )
}
