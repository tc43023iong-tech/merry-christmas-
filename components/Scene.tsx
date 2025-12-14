import React from 'react';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { DreamTree } from './DreamTree';
import { TopStar } from './TopStar';
import { SnowSystem } from './SnowSystem';
import { AnimationState } from '../types';

interface SceneProps {
  animState: AnimationState;
}

const Scene: React.FC<SceneProps> = ({ animState }) => {
  return (
    <>
      {/* Exponential Fog to fade out distant elements and snow */}
      <fogExp2 attach="fog" args={['#050103', 0.02]} />

      {/* Lighting: Moody, dark pink/purple rim lights */}
      <ambientLight intensity={0.5} color="#4a0e2e" />
      
      {/* Main highlight light */}
      <spotLight 
        position={[20, 50, 20]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color="#ffcce6" 
        castShadow 
      />
      
      {/* Rim light (Backlight) for that "Cyber" look */}
      <pointLight position={[-10, 0, -20]} intensity={5} color="#d600ff" distance={40} />
      <pointLight position={[10, 10, -10]} intensity={3} color="#00ffff" distance={40} />

      {/* Environment Map for Reflections (Shiny Ornaments) */}
      <Environment preset="city" />

      {/* Snow Particles */}
      <SnowSystem />

      <group position={[0, -8, 0]}>
        <DreamTree animState={animState} />
        <TopStar animState={animState} />
      </group>

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={10} 
        maxDistance={60} 
        autoRotate 
        autoRotateSpeed={0.5} 
        maxPolarAngle={Math.PI / 1.5}
      />

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={1.2} // Only very bright things glow
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Scene;