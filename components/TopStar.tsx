import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { AnimationState } from '../types';

export const TopStar: React.FC<{ animState: AnimationState }> = ({ animState }) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = new THREE.Vector3(0, 18.5, 0); // Top of tree
  const explodePos = new THREE.Vector3(0, 30, 0); // Fly up when exploded

  // Custom 5-Point Star Geometry
  const starShape = new THREE.Shape();
  const outerRadius = 1.2;
  const innerRadius = 0.5;
  const numPoints = 5;

  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  starShape.closePath();

  const starGeo = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.2,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.1,
    bevelThickness: 0.1,
  });

  useFrame((state, delta) => {
    if (groupRef.current) {
      const target = animState === 'TREE' ? targetPos : explodePos;
      
      // Move logic
      groupRef.current.position.lerp(target, delta * 2);

      // Rotate logic
      groupRef.current.rotation.y += delta;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh geometry={starGeo}>
                <meshStandardMaterial 
                    color="#ffffff" 
                    emissive="#ffccff"
                    emissiveIntensity={2}
                    toneMapped={false}
                    roughness={0.1}
                    metalness={0.8}
                />
            </mesh>
            
            {/* Inner glow/core */}
            <mesh position={[0, 0, 0]} scale={[0.5, 0.5, 0.5]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
        </Float>

        {/* Dynamic Sparkles around the star */}
        <Sparkles 
            count={50} 
            scale={4} 
            size={4} 
            speed={0.4} 
            opacity={0.8}
            color="#FFD700"
        />
        <Sparkles 
            count={30} 
            scale={3} 
            size={2} 
            speed={1} 
            opacity={0.5}
            color="#FF69B4"
        />
    </group>
  );
};