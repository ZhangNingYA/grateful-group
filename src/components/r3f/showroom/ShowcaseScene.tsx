import { Bounds, OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import type { Group } from 'three';
import type { ShowroomModelDefinition } from '../../../types/showroom';
import { FocusCurrentModel } from './FocusCurrentModel';
import { ShowcaseModel } from './ShowcaseModel';

interface ShowcaseSceneProps {
  model: ShowroomModelDefinition;
  focusVersion: number;
}

export function ShowcaseScene({ model, focusVersion }: ShowcaseSceneProps) {
  // 这个 ref 指向当前显示的模型根节点
  const currentModelRef = useRef<Group>(null);

  return (
    <>
      {/* 背景 */}
      <color attach="background" args={['#f5f7fb']} />
      <fog attach="fog" args={['#f5f7fb', 14, 24]} />

      {/* 灯光 */}
      <ambientLight intensity={1.8} />
      <hemisphereLight intensity={0.8} groundColor="#d9dce3" />
      <directionalLight
        position={[5, 8, 6]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-4, 3, -4]} intensity={1.15} />

      {/* 地面阴影承载面：放在 Bounds 外面，避免被算进模型包围盒 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 0]} receiveShadow>
        <circleGeometry args={[7, 64]} />
        <shadowMaterial transparent opacity={0.22} />
      </mesh>

      {/* 
        Bounds:
        - fit: 首次渲染自动适配
        - clip: 自动设置 near/far，减少近裁剪和远裁剪问题
        - observe: 视口变化时自动重算
        - margin: 给模型留一点边距，观感更像“展台”
      */}
      <Bounds fit clip observe margin={1.2} maxDuration={0.8}>
        <group ref={currentModelRef}>
          <ShowcaseModel model={model} />
        </group>

        {/* 模型切换 / 点击复位时，自动重新 framing */} 
        <FocusCurrentModel
          targetRef={currentModelRef}
          selectedId={model.id}
          focusVersion={focusVersion}
        />
      </Bounds>

      {/* 
        OrbitControls:
        - makeDefault：让 Bounds 等组件知道当前 controls 是谁
        - enableDamping：平滑阻尼
      */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.9}
        zoomSpeed={0.9}
        panSpeed={0.8}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 1.85}
        minDistance={1.5}
        maxDistance={18}
      />
    </>
  );
}