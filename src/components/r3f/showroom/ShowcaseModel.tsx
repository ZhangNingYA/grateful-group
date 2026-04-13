import type { ShowroomModelDefinition } from '../../../types/showroom';
import { useControls } from 'leva';
interface ShowcaseModelProps {
  model: ShowroomModelDefinition;
}

export function ShowcaseModel({ model }: ShowcaseModelProps) {
  switch (model.id) {
    case 'watch':
      return <WatchModel />;

    case 'speaker':
      return <SpeakerModel />;

    case 'lamp':
      return <LampModel />;

    default:
      return null;
  }
}

function WatchModel() {
  return (
    <group rotation={[0.25, -0.45, 0]} scale={1.15}>
      {/* 表盘外壳 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.1, 1.4, 0.18]} />
        <meshStandardMaterial color="#0f172a" metalness={0.75} roughness={0.25} />
      </mesh>

      {/* 屏幕 */}
      <mesh castShadow receiveShadow position={[0, 0, 0.11]}>
        <boxGeometry args={[0.82, 1.08, 0.04]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={0.18}
          metalness={0.15}
          roughness={0.3}
        />
      </mesh>

      {/* 上表带 */}
      <mesh castShadow receiveShadow position={[0, 1.25, -0.01]}>
        <boxGeometry args={[0.48, 1.15, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* 下表带 */}
      <mesh castShadow receiveShadow position={[0, -1.25, -0.01]}>
        <boxGeometry args={[0.48, 1.15, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.2} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function SpeakerModel() {
  return (
    <group rotation={[0.1, -0.55, 0]} scale={1.85}>
      {/* 1. 主体音箱壳：颜色稍微调亮一点 (深灰)，降低金属感，模拟磨砂塑料或木质质感 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.2, 1.1]} />
        <meshStandardMaterial 
          color="#374151" 
          metalness={0.2} 
          roughness={0.8} 
        />
      </mesh>

      {/* 2. 上喇叭振膜：使用纯黑，并调低粗糙度 (roughness)，让它看起来像光滑的亮面振膜 */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0.56]}>
        <circleGeometry args={[0.42, 48]} />
        <meshStandardMaterial 
          color="#000000" 
          metalness={0.6} 
          roughness={0.15} 
        />
      </mesh>

      {/* 3. 下喇叭振膜：同上 */}
      <mesh castShadow receiveShadow position={[0, -0.5, 0.56]}>
        <circleGeometry args={[0.28, 48]} />
        <meshStandardMaterial 
          color="#000000" 
          metalness={0.6} 
          roughness={0.15} 
        />
      </mesh>

      {/* 4. 中心高光圈：换成更明亮的蓝色，并增加了一点自发光 (emissive)，让它像通电了一样 */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0.57]}>
        <ringGeometry args={[0.28, 0.38, 48]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#2563eb" 
          emissiveIntensity={0.6} // 自发光强度
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
    </group>
  );
}
// export function SpeakerModel() {
//   // 1. 开启 Leva 控制面板，定义你需要调试的变量
//   const { 
//     speakerZ, 
//     speakerColor, 
//     speakerScale,
//     boxDepth
//   } = useControls('音箱参数微调', {
//     speakerZ: { value: 0.56, min: 0.4, max: 1.0, step: 0.01 }, // 拖动找找看 Z 轴
//     speakerColor: '#111827', // 默认黑色，你可以随便换个鲜艳的颜色测试
//     speakerScale: { value: 1, min: 0.1, max: 2, step: 0.1 },
//     boxDepth: { value: 1.1, min: 0.5, max: 2, step: 0.1 }, // 控制主体厚度
//   });

//   return (
//     <group rotation={[0.1, -0.55, 0]} scale={1.85}>
//       {/* 主体 */}
//       <mesh castShadow receiveShadow>
//         {/* 用面板里的变量替换写死的值 */}
//         <boxGeometry args={[1.6, 2.2, boxDepth]} />
//         <meshStandardMaterial color="#1f2937" metalness={0.45} roughness={0.45} />
//       </mesh>

//       {/* 上喇叭 */}
//       <mesh castShadow receiveShadow position={[0, 0.5, speakerZ]} scale={speakerScale}>
//         <circleGeometry args={[0.42, 48]} />
//         <meshStandardMaterial color={speakerColor} metalness={0.7} roughness={0.28} />
//       </mesh>

//       {/* 下喇叭 */}
//       <mesh castShadow receiveShadow position={[0, -0.5, speakerZ]} scale={speakerScale}>
//         <circleGeometry args={[0.28, 48]} />
//         <meshStandardMaterial color={speakerColor} metalness={0.7} roughness={0.28} />
//       </mesh>

//       {/* 中心高光圈（它的 Z 轴要比黑色底盘再靠前一点点） */}
//       <mesh castShadow receiveShadow position={[0, 0.5, speakerZ + 0.01]} scale={speakerScale}>
//         <ringGeometry args={[0.28, 0.38, 48]} />
//         <meshStandardMaterial color="#60a5fa" metalness={1} roughness={0.2} />
//       </mesh>
//     </group>
//   );
// }

function LampModel() {
  return (
    <group rotation={[0.05, -0.5, 0]} scale={1.55}>
      {/* 底座 */}
      <mesh castShadow receiveShadow position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.95, 1.1, 0.16, 48]} />
        <meshStandardMaterial color="#1e293b" metalness={0.65} roughness={0.35} />
      </mesh>

      {/* 立杆 */}
      <mesh castShadow receiveShadow position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 1.85, 32]} />
        <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.25} />
      </mesh>

      {/* 关节球 */}
      <mesh castShadow receiveShadow position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshStandardMaterial color="#64748b" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* 灯臂 */}
      <group position={[0.2, 1.15, 0]} rotation={[0, 0, -0.9]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.08, 1.0, 32]} />
          <meshStandardMaterial color="#64748b" metalness={0.75} roughness={0.22} />
        </mesh>

        {/* 灯罩 */}
        <mesh castShadow receiveShadow position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.38, 0.78, 32]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.28} roughness={0.5} />
        </mesh>

        {/* 灯泡发光 */}
        <mesh castShadow receiveShadow position={[0.73, 0, 0]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial
            color="#fde68a"
            emissive="#fbbf24"
            emissiveIntensity={0.9}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}