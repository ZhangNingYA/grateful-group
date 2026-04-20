import { Canvas, useFrame } from '@react-three/fiber'
import { KeyboardControls, useKeyboardControls } from '@react-three/drei'
import { useRef } from 'react'

// 1. 定义按键映射字典
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'jump', keys: ['Space'] },
]

function Player() {
  const meshRef = useRef()
  const [, getKeys] = useKeyboardControls() // 不需要 subscribe，可以省略第一个参数

  useFrame((state, delta) => {
    // 防御性检查：确保模型已经加载完毕再去操作它
    if (!meshRef.current) return

    const keys = getKeys()

    // 往前走
    if (keys.forward) {
      meshRef.current.position.z -= 5 * delta
    }
    // 往后退
    if (keys.backward) {
      meshRef.current.position.z += 5 * delta
    }
    
    // 简易跳跃演示（带一个极其简陋的“重力”让它能掉下来）
    if (keys.jump && meshRef.current.position.y <= 0) {
       // 如果按了空格且在地面，瞬间获得一个高度
       meshRef.current.position.y = 2 
    }
    // 每一帧模拟重力下降，直到落回地面 (y=0)
    if (meshRef.current.position.y > 0) {
      meshRef.current.position.y -= 3 * delta
    } else {
      meshRef.current.position.y = 0
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      {/* 依然使用标准材质，但现在我们有光了！ */}
      <meshStandardMaterial color="hotpink" />
    </mesh>
  )
}

export default function App() {
  return (
    // 2. 最佳实践：把 KeyboardControls 放在最外层
    <KeyboardControls map={keyboardMap}>
      <Canvas camera={{ position: [0, 2, 5] }}> {/* 稍微抬高一点相机方便观察 */}
        
        {/* 关键修复：一定要打光！ */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        <Player />
      </Canvas>
    </KeyboardControls>
  )
}