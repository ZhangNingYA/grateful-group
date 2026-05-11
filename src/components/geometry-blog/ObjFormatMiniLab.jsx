import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

/**
 * OBJ 格式迷你实验室
 * 左侧显示 OBJ 文本，右侧显示对应 3D 模型
 * 点击某行高亮对应顶点或面
 */

const OBJ_DATA = {
  vertices: [
    [0, 1, 0],      // v1 顶部
    [-1, -1, 1],    // v2 前左
    [1, -1, 1],     // v3 前右
    [1, -1, -1],    // v4 后右
    [-1, -1, -1],   // v5 后左
  ],
  normals: [
    [0, 0.4472, 0.8944],   // vn1
    [0.8944, 0.4472, 0],   // vn2
    [0, 0.4472, -0.8944],  // vn3
    [-0.8944, 0.4472, 0],  // vn4
    [0, -1, 0],            // vn5
  ],
  texcoords: [
    [0.5, 1.0],   // vt1
    [0.0, 0.0],   // vt2
    [1.0, 0.0],   // vt3
  ],
  faces: [
    { verts: [0, 1, 2], label: 'f 1/1/1 2/2/1 3/3/1' },  // front
    { verts: [0, 2, 3], label: 'f 1/1/2 3/2/2 4/3/2' },  // right
    { verts: [0, 3, 4], label: 'f 1/1/3 4/2/3 5/3/3' },  // back
    { verts: [0, 4, 1], label: 'f 1/1/4 5/2/4 2/3/4' },  // left
    { verts: [1, 4, 3], label: 'f 2/2/5 5/3/5 4/1/5' },  // bottom1
    { verts: [1, 3, 2], label: 'f 2/2/5 4/1/5 3/3/5' },  // bottom2
  ],
}

const OBJ_LINES = [
  { type: 'comment', text: '# Simple Pyramid', idx: -1 },
  { type: 'comment', text: '# 5 vertices, 6 faces', idx: -1 },
  { type: 'vertex', text: 'v  0.0  1.0  0.0', idx: 0 },
  { type: 'vertex', text: 'v -1.0 -1.0  1.0', idx: 1 },
  { type: 'vertex', text: 'v  1.0 -1.0  1.0', idx: 2 },
  { type: 'vertex', text: 'v  1.0 -1.0 -1.0', idx: 3 },
  { type: 'vertex', text: 'v -1.0 -1.0 -1.0', idx: 4 },
  { type: 'normal', text: 'vn 0 0.447 0.894', idx: 0 },
  { type: 'normal', text: 'vn 0.894 0.447 0', idx: 1 },
  { type: 'normal', text: 'vn 0 0.447 -0.894', idx: 2 },
  { type: 'normal', text: 'vn -0.894 0.447 0', idx: 3 },
  { type: 'normal', text: 'vn 0 -1 0', idx: 4 },
  { type: 'texcoord', text: 'vt 0.5 1.0', idx: 0 },
  { type: 'texcoord', text: 'vt 0.0 0.0', idx: 1 },
  { type: 'texcoord', text: 'vt 1.0 0.0', idx: 2 },
  { type: 'face', text: 'f 1/1/1 2/2/1 3/3/1', idx: 0 },
  { type: 'face', text: 'f 1/1/2 3/2/2 4/3/2', idx: 1 },
  { type: 'face', text: 'f 1/1/3 4/2/3 5/3/3', idx: 2 },
  { type: 'face', text: 'f 1/1/4 5/2/4 2/3/4', idx: 3 },
  { type: 'face', text: 'f 2/2/5 5/3/5 4/1/5', idx: 4 },
  { type: 'face', text: 'f 2/2/5 4/1/5 3/3/5', idx: 5 },
]

function PyramidMesh({ highlightType, highlightIdx }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  const { geometry, highlightGeo } = useMemo(() => {
    const verts = OBJ_DATA.vertices
    const faces = OBJ_DATA.faces
    const positions = []
    const faceColors = []
    const color = new THREE.Color()

    for (let fi = 0; fi < faces.length; fi++) {
      const f = faces[fi]
      const isHighlighted = highlightType === 'face' && highlightIdx === fi
      for (const vi of f.verts) {
        positions.push(...verts[vi])
        if (isHighlighted) {
          color.set('#f59e0b')
        } else {
          color.setHSL(0.6 + fi * 0.05, 0.5, 0.5)
        }
        faceColors.push(color.r, color.g, color.b)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(faceColors, 3))
    geo.computeVertexNormals()

    return { geometry: geo, highlightGeo: null }
  }, [highlightType, highlightIdx])

  return (
    <group ref={meshRef}>
      <mesh geometry={geometry}>
        <meshPhongMaterial vertexColors side={THREE.DoubleSide} transparent opacity={0.8} flatShading />
      </mesh>
      {/* Wireframe */}
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#a5b4fc" wireframe transparent opacity={0.3} />
      </mesh>
      {/* Highlight vertices */}
      {highlightType === 'vertex' && highlightIdx >= 0 && (
        <mesh position={OBJ_DATA.vertices[highlightIdx]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      )}
      {/* Show all vertices as small spheres */}
      {OBJ_DATA.vertices.map((v, i) => (
        <mesh key={i} position={v}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={highlightType === 'vertex' && highlightIdx === i ? '#f59e0b' : '#888'} />
        </mesh>
      ))}
      {/* Highlight normal */}
      {highlightType === 'normal' && highlightIdx >= 0 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, ...OBJ_DATA.normals[highlightIdx].map(n => n * 1.5)])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#22c55e" linewidth={2} />
        </line>
      )}
    </group>
  )
}

function Scene({ highlightType, highlightIdx }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#a78bfa" />
      <PyramidMesh highlightType={highlightType} highlightIdx={highlightIdx} />
      <OrbitControls enablePan={false} />
      <gridHelper args={[4, 8, '#333', '#222']} position={[0, -1.2, 0]} />
    </>
  )
}

export default function ObjFormatMiniLab() {
  const [highlightType, setHighlightType] = useState(null)
  const [highlightIdx, setHighlightIdx] = useState(-1)

  const typeColors = {
    comment: '#555',
    vertex: '#6366f1',
    normal: '#22c55e',
    texcoord: '#f59e0b',
    face: '#06b6d4',
  }

  const typeLabels = {
    vertex: 'v — 顶点位置 (x, y, z)',
    normal: 'vn — 法线方向',
    texcoord: 'vt — 纹理坐标 (u, v)',
    face: 'f — 面索引 (vertex/texcoord/normal)',
  }

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', background: '#0a0a1a' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '420px' }}>
        {/* OBJ Text Panel */}
        <div style={{ padding: '16px', borderRight: '1px solid rgba(255,255,255,0.05)', overflow: 'auto', maxHeight: '420px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 500 }}>pyramid.obj</div>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.9 }}>
            {OBJ_LINES.map((line, i) => (
              <div
                key={i}
                onClick={() => {
                  if (line.type !== 'comment') {
                    setHighlightType(line.type)
                    setHighlightIdx(line.idx)
                  }
                }}
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: line.type !== 'comment' ? 'pointer' : 'default',
                  background: highlightType === line.type && highlightIdx === line.idx
                    ? `${typeColors[line.type]}22`
                    : 'transparent',
                  borderLeft: highlightType === line.type && highlightIdx === line.idx
                    ? `2px solid ${typeColors[line.type]}`
                    : '2px solid transparent',
                  color: typeColors[line.type] || '#888',
                  transition: 'all 0.15s',
                }}
              >
                {line.text}
              </div>
            ))}
          </div>
        </div>
        {/* 3D View */}
        <div>
          <Canvas camera={{ position: [2.5, 2, 2.5], fov: 45 }}>
            <Scene highlightType={highlightType} highlightIdx={highlightIdx} />
          </Canvas>
        </div>
      </div>
      <div style={{ padding: '16px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {Object.entries(typeLabels).map(([type, label]) => (
            <span key={type} style={{ fontSize: '11px', color: typeColors[type] }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          点击左侧 OBJ 行 → 右侧高亮对应元素。f 行格式: vertex_idx/texcoord_idx/normal_idx
        </div>
      </div>
    </div>
  )
}
