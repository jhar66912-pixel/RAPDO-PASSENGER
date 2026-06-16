import React, { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

const StylizedCyberBike = () => {
  return (
    <group position={[0, -0.2, 0]} scale={1.8} rotation={[0, Math.PI / 6, 0]}>
      {/* Front Light Trail Core */}
      <mesh position={[1.2, 0.6, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[1.2, 0.6, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#FFC107" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Cyber Body */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.8, 0.25, 0.2]} />
        <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Power Core */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[1.2, 0.2, 0.25]} />
        <meshStandardMaterial color="#FFC107" metalness={0.8} roughness={0.2} emissive="#FFC107" emissiveIntensity={0.5} />
      </mesh>

      {/* Wheels */}
      <mesh position={[0.8, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.08, 16, 64]} />
        <meshStandardMaterial color="#0A0A0A" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[-0.8, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.08, 16, 64]} />
        <meshStandardMaterial color="#0A0A0A" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Neon Rims */}
      <mesh position={[0.8, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.18, 32]} />
        <meshBasicMaterial color="#FFC107" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.8, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.18, 32]} />
        <meshBasicMaterial color="#FFC107" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const LightTrails = () => {
  const lines = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      x: (Math.random() - 0.5) * 20,
      y: Math.random() * 5 + 0.5,
      z: (Math.random() - 0.5) * 20,
      speed: Math.random() * 0.2 + 0.1,
      color: Math.random() > 0.5 ? '#FFC107' : '#3B82F6'
    }));
  }, []);

  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      child.position.z += lines[i].speed;
      if (child.position.z > 10) child.position.z = -10;
    });
  });

  return (
    <group ref={group}>
      {lines.map((line, i) => (
        <mesh key={i} position={[line.x, line.y, line.z]}>
          <boxGeometry args={[0.02, 0.02, 1.5]} />
          <meshBasicMaterial color={line.color} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
};

export const CinematicHero3D = memo(() => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing z-0 font-sans">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={1}
      >
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 5, 20]} />
        
        <ambientLight intensity={1.5} />
        <spotLight position={[5, 10, 5]} intensity={2.5} color="#FFC107" angle={0.5} penumbra={1} castShadow={false} />
        <pointLight position={[-5, 5, -5]} intensity={2} color="#3B82F6" />
        
        <PresentationControls
          {...{
            global: true,
            rotation: [0, -Math.PI / 8, 0],
            polar: [-Math.PI / 6, Math.PI / 4],
            azimuth: [-Math.PI / 2, Math.PI / 2],
            config: { mass: 2, tension: 400 },
            snap: { mass: 4, tension: 400 }
          } as any}
        >
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <StylizedCyberBike />
          </Float>
        </PresentationControls>

        <LightTrails />
      </Canvas>
    </div>
  );
});
