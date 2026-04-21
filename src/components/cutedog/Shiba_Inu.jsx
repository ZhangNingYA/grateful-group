import React, { useEffect, useState } from 'react'
import { useGraph, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

export function Model(props) {
  const group = React.useRef()
  const { scene, animations } = useGLTF('/Shiba_Inu-transformed.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group)

  // 🐾 核心：使用 React State 来管理小狗当前的动作
  const [currentAction, setCurrentAction] = useState('Idle')

  useEffect(() => {
    const action = actions[currentAction]
    if (!action) return

    // 每次动作切换时，淡入新动作 (0.3秒过渡)，显得非常平滑自然
    action.reset().fadeIn(0.3).play()

    // 针对不同的动作，设置不同的播放逻辑
    let timeout;
    if (currentAction === 'Eating' || currentAction === 'Jump_ToIdle') {
      // 喂食和跳跃属于“一次性动作”，播放完一次就停
      action.setLoop(THREE.LoopOnce)
      // 保持在动画最后一帧（可选，防止闪烁）
      action.clampWhenFinished = true
      
      // 获取当前动画的真实时长（秒），在动画结束时自动切回 Idle
      const duration = action.getClip().duration * 1000
      timeout = setTimeout(() => {
        setCurrentAction('Idle')
      }, duration)

    } else {
      // 其他动作（Idle, Walk 等）默认循环播放
      action.setLoop(THREE.LoopRepeat)
    }

    // 清理函数：当 currentAction 改变时，淡出上一个动作
    return () => {
      action.fadeOut(0.3)
      if (timeout) clearTimeout(timeout)
    }
  }, [currentAction, actions])

  // 鼠标跟随（保持之前的眼神锁定功能）
  useFrame((state) => {
    if (!group.current) return
    const targetX = state.pointer.x * 0.5
    const targetY = state.pointer.y * 0.2
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetX, 0.1)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -targetY, 0.1)
  })

  return (
    <group 
      ref={group} 
      {...props} 
      dispose={null}
      // 添加 3D 鼠标事件
      onPointerOver={() => {
        // 防止覆盖正在播放的一次性动画
        if (currentAction === 'Idle') setCurrentAction('Idle_2_HeadLow')
        // 鼠标移上去变小手
        document.body.style.cursor = 'pointer' 
      }}
      onPointerOut={() => {
        if (currentAction === 'Idle_2_HeadLow') setCurrentAction('Idle')
        // 恢复鼠标指针
        document.body.style.cursor = 'auto'
      }}
      onClick={(e) => {
        e.stopPropagation() // 阻止点击事件穿透到背景
        setCurrentAction('Jump_ToIdle')
      }}
    >
      {/* 🚀 亮点：Drei 的 Html 组件，可以将真实的 HTML 挂载在 3D 坐标上 */}
      <Html 
        position={[0, 0.8, 0]} // 把按钮定位在小狗头顶偏上的位置
        center 
        distanceFactor={4} // 随相机距离缩放
      >
        <button 
          onClick={(e) => {
            e.stopPropagation()
            setCurrentAction('Eating')
          }}
          style={{
            background: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#ff7a00',
            opacity: currentAction === 'Eating' ? 0 : 1, // 吃东西时隐藏按钮
            transition: 'opacity 0.3s'
          }}
        >
          🍖 喂狗粮
        </button>
      </Html>

      {/* 下面是你原来的模型节点 */}
      <group name="Root_Scene">
        <group name="AnimalArmature" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <primitive object={nodes.Body} />
          <primitive object={nodes.IKBackLegL} />
          <primitive object={nodes.IKFrontLegL} />
          <primitive object={nodes.IKBackLegR} />
          <primitive object={nodes.IKFrontLegR} />
        </group>
        <group name="ShibaInu" position={[0, 0, 0.062]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <skinnedMesh name="ShibaInu_1" geometry={nodes.ShibaInu_1.geometry} material={materials.PaletteMaterial001} skeleton={nodes.ShibaInu_1.skeleton} />
          <skinnedMesh name="ShibaInu_2" geometry={nodes.ShibaInu_2.geometry} material={materials.PaletteMaterial001} skeleton={nodes.ShibaInu_2.skeleton} />
          <skinnedMesh name="ShibaInu_3" geometry={nodes.ShibaInu_3.geometry} material={materials.PaletteMaterial001} skeleton={nodes.ShibaInu_3.skeleton} />
          <skinnedMesh name="ShibaInu_4" geometry={nodes.ShibaInu_4.geometry} material={materials.PaletteMaterial001} skeleton={nodes.ShibaInu_4.skeleton} />
          <skinnedMesh name="ShibaInu_5" geometry={nodes.ShibaInu_5.geometry} material={materials.PaletteMaterial001} skeleton={nodes.ShibaInu_5.skeleton} />
          <skinnedMesh name="ShibaInu_6" geometry={nodes.ShibaInu_6.geometry} material={materials.PaletteMaterial001} skeleton={nodes.ShibaInu_6.skeleton} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/Shiba_Inu-transformed.glb')