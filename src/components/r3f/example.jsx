// src/components/My3DScene.jsx
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function RotatingCube() {
  const meshRef = useRef();
  
  // 简单的旋转动画
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta;
    meshRef.current.rotation.y += delta;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#7ea38c" />
    </mesh>
  );
}

export default function My3DScene() {
  return (
    // 注意：嵌入到博客正文的 Canvas 必须有一个明确的高度
    <div style={{ width: '100%', height: '50vh', borderRadius: '20px', overflow: 'hidden', margin: '2rem 0' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <RotatingCube />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}