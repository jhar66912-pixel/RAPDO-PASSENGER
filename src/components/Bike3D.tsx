import { Canvas } from "@react-three/fiber";
import { Float, PresentationControls } from "@react-three/drei";
import { memo } from "react";

const StylizedBike = () => {
  return (
    <group position={[0, -0.5, 0]} scale={1.5} rotation={[0, -Math.PI / 4, 0]}>
      {/* Front Wheel */}
      <mesh position={[1, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
        <meshStandardMaterial color="#1E1E1E" roughness={0.8} />
      </mesh>
      
      {/* Front Hubcap */}
      <mesh position={[1, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.16, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rear Wheel */}
      <mesh position={[-1, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
        <meshStandardMaterial color="#1E1E1E" roughness={0.8} />
      </mesh>
      
      {/* Rear Hubcap */}
      <mesh position={[-1, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.16, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Main Body - Bottom Box */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.8, 0.2, 0.3]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Main Body - Top Colored Area */}
      <mesh position={[-0.2, 0.85, 0]}>
        <boxGeometry args={[1.2, 0.3, 0.35]} />
        <meshStandardMaterial color="#FFC107" metalness={0.6} roughness={0.1} />
      </mesh>

      {/* Seat */}
      <mesh position={[-0.4, 1.05, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.3]} />
        <meshStandardMaterial color="#0A0A0A" />
      </mesh>

      {/* Headlight */}
      <mesh position={[0.45, 0.85, 0]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[0.51, 0.85, 0]}>
        <boxGeometry args={[0.02, 0.15, 0.2]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1} />
      </mesh>

      {/* Handlebars Stem */}
      <mesh position={[0.3, 1.1, 0]} rotation={[0, 0, -Math.PI / 12]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Handlebars */}
      <mesh position={[0.35, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>

      {/* Front Fork */}
      <mesh position={[0.8, 0.7, 0.1]} rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        <meshStandardMaterial color="#444444" metalness={0.9} />
      </mesh>
      <mesh position={[0.8, 0.7, -0.1]} rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        <meshStandardMaterial color="#444444" metalness={0.9} />
      </mesh>
    </group>
  );
};

export const Bike3D = memo(() => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing z-0 isolate">
      <Canvas
        camera={{ position: [5, 4, 8], fov: 35, near: 0.1, far: 50 }}
        gl={{ alpha: true, antialias: true }}
        dpr={1}
      >
        <ambientLight intensity={1.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={2.5} 
          color="#ffffff" 
          castShadow={false}
        />
        <directionalLight 
          position={[-10, 10, -5]} 
          intensity={1.0} 
          color="#FFC107" 
        />
        <directionalLight 
          position={[0, -10, 0]} 
          intensity={0.5} 
          color="#3B82F6" 
        />

        <PresentationControls
          global
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 5, Math.PI / 4]}
          azimuth={[-Math.PI / 2, Math.PI / 2]}
        >
          <Float
            speed={2.5} 
            rotationIntensity={0.2} 
            floatIntensity={1.5}
            floatingRange={[-0.1, 0.1]}
          >
            <StylizedBike />
          </Float>
        </PresentationControls>
      </Canvas>
    </div>
  );
});
