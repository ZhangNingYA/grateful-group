import { Canvas } from '@react-three/fiber';
import type { ShowroomModelDefinition } from '../../../types/showroom';
import { ShowcaseScene } from './ShowcaseScene';

interface SceneCanvasProps {
  model: ShowroomModelDefinition;
  focusVersion: number;
}

export function SceneCanvas({ model, focusVersion }: SceneCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.2, 8], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
    >
      <ShowcaseScene model={model} focusVersion={focusVersion} />
    </Canvas>
  );
}