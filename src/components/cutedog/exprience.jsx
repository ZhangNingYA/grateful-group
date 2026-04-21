// 1. 注意这里：一定要从 'react' 中引入 Suspense !
import React, { Suspense } from 'react'; 
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useControls, Leva } from 'leva';

import { Model as ShibaInu } from './Shiba_Inu.jsx'; 

export default function Experience() {
  const { environmentPreset, bgBlur } = useControls('场景设置', {
    environmentPreset: {
      label: '时间段',
      options: {
        '🌅 清晨 (Dawn)': 'dawn',
        '☀️ 正午 (Noon)': 'park',
        '🌇 下午 (Sunset)': 'sunset',
        '🌃 夜晚 (Night)': 'night',
      },
    },
    bgBlur: {
      label: '背景模糊度',
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.1,
    }
  });

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Leva collapsed={false} />

      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        
        {/* === 核心修复点：使用 Suspense 包裹所有需要下载的元素 === */}
        {/* fallback={null} 表示在下载期间什么都不显示，你也可以换成一个加载动画 */}
        <Suspense fallback={null}>
          
          {/* 背景贴图需要去 polyhaven 下载，所以放进 Suspense */}
          <Environment 
          key={environmentPreset}
            preset={environmentPreset} 
            background 
            blur={bgBlur} 
          />

          {/* 狗模型也需要解析，同样放进 Suspense */}
          <ShibaInu position={[0, 0, 0]} scale={0.6} />
          
        </Suspense>

        {/* 光影和控制器不需要下载外部资源，可以放在外面 */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.5} 
          castShadow 
        />
        
        <ContactShadows 
          position={[0, -0.01, 0]} 
          opacity={0.6} 
          scale={5} 
          blur={2} 
        />

        <OrbitControls 
          makeDefault 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2}
        />
        
      </Canvas>
    </div>
  );
}