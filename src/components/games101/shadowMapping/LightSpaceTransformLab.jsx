import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { Header, ObsTask, Slider, Status, Toggle, panelStyle, sidePanel, fmt } from './ui.jsx'

function fmtVec(v, p = 2) {
  return `(${v.x.toFixed(p)}, ${v.y.toFixed(p)}, ${v.z.toFixed(p)})`
}

function Scene({ fragmentWorld, lightPos, lightTarget, halfSize, near, far, showFrustum, ndc, uv }) {
  const lightDir = useMemo(() => {
    const d = new THREE.Vector3().subVectors(lightTarget, lightPos).normalize()
    return d
  }, [lightPos, lightTarget])

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 4, 4]} intensity={0.6} />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#1f2433" />
      </mesh>

      {/* fragment marker */}
      <mesh position={[fragmentWorld.x, fragmentWorld.y, fragmentWorld.z]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>
      <Html position={[fragmentWorld.x, fragmentWorld.y + 0.18, fragmentWorld.z]} center>
        <div style={{ color: '#86efac', fontSize: 11, fontFamily: 'monospace', background: 'rgba(15,15,26,0.8)', padding: '2px 6px', borderRadius: 4 }}>fragment</div>
      </Html>

      {/* light marker */}
      <mesh position={[lightPos.x, lightPos.y, lightPos.z]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      <Html position={[lightPos.x, lightPos.y + 0.22, lightPos.z]} center>
        <div style={{ color: '#fde68a', fontSize: 11, fontFamily: 'monospace', background: 'rgba(15,15,26,0.8)', padding: '2px 6px', borderRadius: 4 }}>light</div>
      </Html>

      {/* light → fragment line */}
      <Line points={[[lightPos.x, lightPos.y, lightPos.z], [fragmentWorld.x, fragmentWorld.y, fragmentWorld.z]]}
        color="#fde68a" lineWidth={1.5} dashed dashSize={0.1} gapSize={0.06} />

      {/* light frustum (wireframe, in light space) */}
      {showFrustum && (
        <FrustumWireframe lightPos={lightPos} lightDir={lightDir} halfSize={halfSize} near={near} far={far} />
      )}

      {/* image plane near light: draw the [-halfSize, halfSize] square */}
      {showFrustum && (
        <ProjectedFragment lightPos={lightPos} lightDir={lightDir} halfSize={halfSize} near={near} ndc={ndc} uv={uv} />
      )}

      <gridHelper args={[10, 20, '#1f2937', '#0f172a']} position={[0, -0.49, 0]} />
      <OrbitControls enableDamping dampingFactor={0.1} target={[0, 0, 0]} />
    </>
  )
}

function buildLightFrame(lightPos, lightDir) {
  const forward = lightDir.clone().normalize()
  const upRef = new THREE.Vector3(0, 1, 0)
  if (Math.abs(forward.dot(upRef)) > 0.95) upRef.set(1, 0, 0)
  const right = new THREE.Vector3().crossVectors(forward, upRef).normalize()
  const up = new THREE.Vector3().crossVectors(right, forward).normalize()
  return { right, up, forward }
}

function FrustumWireframe({ lightPos, lightDir, halfSize, near, far }) {
  const { right, up, forward } = buildLightFrame(lightPos, lightDir)

  const corner = (sx, sy, dist) =>
    lightPos.clone()
      .add(forward.clone().multiplyScalar(dist))
      .add(right.clone().multiplyScalar(sx * halfSize))
      .add(up.clone().multiplyScalar(sy * halfSize))

  const c = [
    corner(-1, -1, near), corner(1, -1, near), corner(1, 1, near), corner(-1, 1, near),
    corner(-1, -1, far), corner(1, -1, far), corner(1, 1, far), corner(-1, 1, far),
  ]
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ]
  return (
    <>
      {edges.map(([a, b], i) => (
        <Line key={i} points={[[c[a].x, c[a].y, c[a].z], [c[b].x, c[b].y, c[b].z]]}
          color="#a5b4fc" lineWidth={1} transparent opacity={0.6} />
      ))}
    </>
  )
}

function ProjectedFragment({ lightPos, lightDir, halfSize, near, ndc, uv }) {
  const { right, up, forward } = buildLightFrame(lightPos, lightDir)
  // image plane center = lightPos + forward * near
  const center = lightPos.clone().add(forward.clone().multiplyScalar(near))
  // map ndc.x ∈ [-1,1] to right component in [-halfSize, halfSize]
  const ndcPos = center.clone()
    .add(right.clone().multiplyScalar(ndc.x * halfSize))
    .add(up.clone().multiplyScalar(ndc.y * halfSize))
  return (
    <>
      <mesh position={[ndcPos.x, ndcPos.y, ndcPos.z]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <Html position={[ndcPos.x, ndcPos.y + 0.18, ndcPos.z]} center>
        <div style={{ color: '#fbbf24', fontSize: 10, fontFamily: 'monospace', background: 'rgba(15,15,26,0.8)', padding: '2px 5px', borderRadius: 4 }}>
          uv ({uv.u.toFixed(2)}, {uv.v.toFixed(2)})
        </div>
      </Html>
    </>
  )
}

export default function LightSpaceTransformLab() {
  const [fragX, setFragX] = useState(0.6)
  const [fragY, setFragY] = useState(-0.4)
  const [fragZ, setFragZ] = useState(0.2)
  const [lightAzim, setLightAzim] = useState(0.6)
  const [lightHeight, setLightHeight] = useState(3)
  const [halfSize, setHalfSize] = useState(2.5)
  const [near, setNear] = useState(1)
  const [far, setFar] = useState(8)
  const [showFrustum, setShowFrustum] = useState(true)

  const lightPos = useMemo(() => new THREE.Vector3(Math.cos(lightAzim) * 3.5, lightHeight, Math.sin(lightAzim) * 3.5), [lightAzim, lightHeight])
  const lightTarget = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const fragmentWorld = useMemo(() => new THREE.Vector3(fragX, fragY, fragZ), [fragX, fragY, fragZ])

  const lightDir = useMemo(() => new THREE.Vector3().subVectors(lightTarget, lightPos).normalize(), [lightPos, lightTarget])

  // build view matrix for the light (inverse of light's transform)
  // We compute fragment position in light view frame
  const { right, up, forward } = buildLightFrame(lightPos, lightDir)

  const rel = new THREE.Vector3().subVectors(fragmentWorld, lightPos)
  const lvX = rel.dot(right)
  const lvY = rel.dot(up)
  const lvZ = rel.dot(forward) // along forward direction (positive = in front)

  // ortho projection: ndc.x = lvX / halfSize, ndc.y = lvY / halfSize
  // ndc.z = (lvZ - near) / (far - near) * 2 - 1   (linear depth in [-1, 1])
  const ndc = useMemo(() => {
    const ndcX = lvX / halfSize
    const ndcY = lvY / halfSize
    const ndcZ = ((lvZ - near) / (far - near)) * 2 - 1
    return { x: ndcX, y: ndcY, z: ndcZ }
  }, [lvX, lvY, lvZ, halfSize, near, far])

  const uv = useMemo(() => ({
    u: ndc.x * 0.5 + 0.5,
    v: ndc.y * 0.5 + 0.5,
    z: ndc.z * 0.5 + 0.5,
  }), [ndc])

  const inFrustum = Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1 && lvZ >= near && lvZ <= far

  return (
    <div style={panelStyle}>
      <Header
        title="Light-Space Transform · World → NDC → UV"
        subtitle="给 fragment 一组世界坐标，看它如何被映射到 shadow map UV 和深度。"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(280px, 1fr)' }}>
        <div style={{ height: 460, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Canvas camera={{ position: [4, 3, 5], fov: 45 }}>
            <Scene
              fragmentWorld={fragmentWorld}
              lightPos={lightPos}
              lightTarget={lightTarget}
              halfSize={halfSize} near={near} far={far}
              showFrustum={showFrustum}
              ndc={ndc} uv={uv}
            />
          </Canvas>
        </div>

        <div style={sidePanel}>
          <ObsTask>滑动 fragment 坐标，看它在 light 空间的 (x, y, z) 怎么变；移到 frustum 之外，看 NDC 越界。</ObsTask>

          <div style={{ display: 'flex', gap: 6 }}>
            <Slider label="frag x" value={fragX} min={-2.5} max={2.5} step={0.05} onChange={setFragX} color="#4ade80" />
            <Slider label="frag y" value={fragY} min={-1.2} max={1.5} step={0.05} onChange={setFragY} color="#4ade80" />
          </div>
          <Slider label="frag z" value={fragZ} min={-2.5} max={2.5} step={0.05} onChange={setFragZ} color="#4ade80" />
          <div style={{ display: 'flex', gap: 6 }}>
            <Slider label="light azim" value={lightAzim} min={0} max={6.28} step={0.02} onChange={setLightAzim} color="#fde68a" precision={2} />
            <Slider label="light height" value={lightHeight} min={1.5} max={6} step={0.05} onChange={setLightHeight} color="#fde68a" />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Slider label="frustum half" value={halfSize} min={1} max={4} step={0.1} onChange={setHalfSize} color="#a5b4fc" />
            <Slider label="near" value={near} min={0.3} max={3} step={0.05} onChange={setNear} color="#a5b4fc" />
            <Slider label="far" value={far} min={4} max={12} step={0.1} onChange={setFar} color="#a5b4fc" />
          </div>
          <Toggle active={showFrustum} onClick={() => setShowFrustum(!showFrustum)}>show frustum</Toggle>

          <Status>
            <div>frag world: {fmtVec(fragmentWorld)}</div>
            <div>frag light-view: ({lvX.toFixed(2)}, {lvY.toFixed(2)}, {lvZ.toFixed(2)})</div>
            <div>NDC: ({ndc.x.toFixed(2)}, {ndc.y.toFixed(2)}, {ndc.z.toFixed(2)})</div>
            <div style={{ color: '#fbbf24' }}>shadow uv: ({uv.u.toFixed(3)}, {uv.v.toFixed(3)})</div>
            <div style={{ color: '#fbbf24' }}>shadow z:&nbsp; {uv.z.toFixed(3)}</div>
            <div style={{ marginTop: 4, color: inFrustum ? '#4ade80' : '#f87171' }}>
              {inFrustum ? '✓ in light frustum' : '✗ outside frustum (no shadow data)'}
            </div>
          </Status>

          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', lineHeight: 1.6 }}>
{`p_clip = P_light · V_light · p_world
ndc    = p_clip.xyz / p_clip.w
uv     = ndc.xy · 0.5 + 0.5
z_sm   = ndc.z   · 0.5 + 0.5`}
          </div>
        </div>
      </div>
    </div>
  )
}
