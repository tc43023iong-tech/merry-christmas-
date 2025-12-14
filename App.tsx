import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Scene from './components/Scene';
import { AnimationState } from './types';

const App: React.FC = () => {
  const [animState, setAnimState] = useState<AnimationState>('TREE');

  const toggleState = () => {
    setAnimState((prev) => (prev === 'TREE' ? 'EXPLODE' : 'TREE'));
  };

  return (
    <div className="relative w-full h-screen bg-[#050103] text-white overflow-hidden select-none">
      
      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 35], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: false, alpha: false }} // Post-processing handles AA usually, creating deeper blacks
        onClick={toggleState}
      >
        <color attach="background" args={['#050103']} />
        <Suspense fallback={null}>
           <Scene animState={animState} />
        </Suspense>
      </Canvas>

      {/* Loading Overlay */}
      <Loader 
        containerStyles={{ background: '#050103' }}
        innerStyles={{ width: '200px', height: '10px', background: '#333' }}
        barStyles={{ background: '#FF69B4', height: '10px' }}
        dataStyles={{ color: '#FF69B4', fontFamily: 'monospace' }}
      />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none flex flex-col justify-between h-full z-10">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400 drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] max-w-2xl leading-tight">
              Miss Iong wishes you a Merry Christmas!
            </h1>
          </div>
        </header>

        <footer className="text-center pb-8 opacity-80">
             <div className="inline-block px-6 py-3 rounded-full border border-pink-500/30 bg-black/20 backdrop-blur-md text-pink-300 font-mono text-xs md:text-sm animate-pulse">
                CLICK ANYWHERE TO {animState === 'TREE' ? 'DETONATE' : 'ASSEMBLE'}
            </div>
        </footer>
      </div>
      
    </div>
  );
};

export default App;