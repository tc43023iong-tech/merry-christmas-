import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SNOW_COUNT = 2000;
const RANGE_Y = 60;
const RANGE_XZ = 70;

export const SnowSystem: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initial random positions and data for each flake
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < SNOW_COUNT; i++) {
      const x = (Math.random() - 0.5) * RANGE_XZ;
      const y = (Math.random() - 0.5) * RANGE_Y + 10; 
      const z = (Math.random() - 0.5) * RANGE_XZ;
      const speed = 0.5 + Math.random() * 1.0; // Fall speed
      const offset = Math.random() * 100; // Random phase for sway
      const scale = 0.5 + Math.random() * 0.8; // Size variation
      temp.push({ x, y, z, speed, offset, scale });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      // Falling movement
      p.y -= p.speed * delta * 1.5;
      
      // Cyber-sway logic (Sine waves on X and Z)
      const swayX = Math.sin(time * 0.5 + p.offset) * 0.05;
      const swayZ = Math.cos(time * 0.3 + p.offset) * 0.05;
      
      p.x += swayX; 
      p.z += swayZ;

      // Reset loop if it falls below a certain point
      if (p.y < -20) {
        p.y = 35;
        // Randomize XZ on respawn to prevent repeating patterns
        p.x = (Math.random() - 0.5) * RANGE_XZ; 
        p.z = (Math.random() - 0.5) * RANGE_XZ;
      }

      dummy.position.set(p.x, p.y, p.z);
      
      // Continuous gentle rotation
      dummy.rotation.x = time * 0.2 + p.offset;
      dummy.rotation.y = time * 0.1 + p.offset;
      
      dummy.scale.setScalar(p.scale);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SNOW_COUNT]}>
      {/* Tiny Octahedrons match the tree leaf geometry style */}
      <octahedronGeometry args={[0.08, 0]} /> 
      {/* White with slight emissive glow for visibility against dark background */}
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#e0f7fa" 
        emissiveIntensity={0.6}
        roughness={0.1}
        metalness={0.9}
      />
    </instancedMesh>
  );
};