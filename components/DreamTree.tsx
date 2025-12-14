import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AnimationState } from '../types';

// Constants
const LEAF_COUNT = 5500;
const ORNAMENT_COUNT = 800;
const RIBBON_COUNT = 1200;
const TREE_HEIGHT = 18;
const TREE_RADIUS_BASE = 7;

// Math Helpers
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Generate sphere distribution for explosion
const getExplodePos = (): [number, number, number] => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = randomRange(10, 40); // Explosion radius
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  ];
};

interface InstanceProps {
  animState: AnimationState;
  count: number;
  // Function to generate the 'Tree' position for index i
  getTreePos: (i: number) => [number, number, number]; 
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  scaleFactor: number;
}

const InstancedGroup: React.FC<InstanceProps> = ({ 
  animState, 
  count, 
  getTreePos, 
  geometry, 
  material,
  scaleFactor 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Compute static data once
  const data = useMemo(() => {
    const treePositions = new Float32Array(count * 3);
    const explodePositions = new Float32Array(count * 3);
    const rotations = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Tree Pos
      const [tx, ty, tz] = getTreePos(i);
      treePositions[i * 3] = tx;
      treePositions[i * 3 + 1] = ty;
      treePositions[i * 3 + 2] = tz;

      // Explode Pos
      const [ex, ey, ez] = getExplodePos();
      explodePositions[i * 3] = ex;
      explodePositions[i * 3 + 1] = ey;
      explodePositions[i * 3 + 2] = ez;

      // Random Rotation
      rotations[i * 3] = Math.random() * Math.PI;
      rotations[i * 3 + 1] = Math.random() * Math.PI;
      rotations[i * 3 + 2] = Math.random() * Math.PI;

      // Random Scale variation
      scales[i] = randomRange(0.5, 1.5) * scaleFactor;
    }

    return { treePositions, explodePositions, rotations, scales };
  }, [count, getTreePos, scaleFactor]);

  // Current interpolated positions (start at tree positions)
  const currentPositions = useMemo(() => new Float32Array(data.treePositions), [data.treePositions]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Lerp Speed
    const speed = 3.5 * delta;
    const isTree = animState === 'TREE';

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      const tx = isTree ? data.treePositions[idx] : data.explodePositions[idx];
      const ty = isTree ? data.treePositions[idx+1] : data.explodePositions[idx+1];
      const tz = isTree ? data.treePositions[idx+2] : data.explodePositions[idx+2];

      // Linear Interpolation
      currentPositions[idx] += (tx - currentPositions[idx]) * speed;
      currentPositions[idx+1] += (ty - currentPositions[idx+1]) * speed;
      currentPositions[idx+2] += (tz - currentPositions[idx+2]) * speed;

      // Update Dummy Object
      dummy.position.set(
        currentPositions[idx],
        currentPositions[idx+1],
        currentPositions[idx+2]
      );
      
      dummy.rotation.set(
        data.rotations[idx] + state.clock.elapsedTime * 0.1, // Slow self-rotation
        data.rotations[idx+1] + state.clock.elapsedTime * 0.1,
        data.rotations[idx+2]
      );

      dummy.scale.setScalar(data.scales[i]);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[geometry, material, count]} 
      castShadow 
      receiveShadow
    />
  );
};


export const DreamTree: React.FC<{ animState: AnimationState }> = ({ animState }) => {
  
  // --- Geometries ---
  const leafGeo = useMemo(() => new THREE.OctahedronGeometry(1, 0), []);
  const cubeGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const icoGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const ribbonGeo = useMemo(() => new THREE.TetrahedronGeometry(1, 0), []);

  // --- Materials ---
  const leafMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFB7C5'),
    roughness: 0.6,
    metalness: 0.4,
  }), []);

  const leafMatDark = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FF69B4'),
    roughness: 0.7,
    metalness: 0.3,
  }), []);

  const ornamentMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ffffff'),
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.6, // Glass-like
    thickness: 1,
    iridescence: 1,
    iridescenceIOR: 1.3,
    emissive: new THREE.Color('#220022'),
    emissiveIntensity: 0.2
  }), []);

  const ribbonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFFFFF'),
    emissive: new THREE.Color('#AAAACC'),
    emissiveIntensity: 0.8,
    roughness: 0.2
  }), []);

  // --- Position Logic ---

  // 1. Leaves: Random Volume inside Cone
  const getLeafPos = (i: number): [number, number, number] => {
    const y = Math.random() * TREE_HEIGHT; // Height from 0 to TREE_HEIGHT
    const radiusAtHeight = TREE_RADIUS_BASE * (1 - y / TREE_HEIGHT);
    const r = Math.random() * radiusAtHeight; // Random radius inside cone
    const theta = Math.random() * Math.PI * 2;
    return [r * Math.cos(theta), y, r * Math.sin(theta)];
  };

  // 2. Ornaments: Surface of Cone
  const getOrnamentPos = (i: number): [number, number, number] => {
    const y = Math.random() * TREE_HEIGHT;
    const radiusAtHeight = TREE_RADIUS_BASE * (1 - y / TREE_HEIGHT);
    // Push slightly outside the leaves (radiusAtHeight + small offset)
    const r = radiusAtHeight + randomRange(-0.2, 0.5); 
    const theta = Math.random() * Math.PI * 2;
    return [r * Math.cos(theta), y, r * Math.sin(theta)];
  };

  // 3. Ribbon: Spiral
  const getRibbonPos = (i: number): [number, number, number] => {
    const t = i / RIBBON_COUNT; // 0 to 1
    const loops = 3.5;
    const y = t * TREE_HEIGHT;
    const radiusAtHeight = (TREE_RADIUS_BASE * (1 - t)) + 0.8; // Slightly outside
    const theta = t * Math.PI * 2 * loops;
    return [radiusAtHeight * Math.cos(theta), y, radiusAtHeight * Math.sin(theta)];
  };

  return (
    <group rotation={[0, 0, 0]}>
      {/* Light Pink Leaves */}
      <InstancedGroup 
        animState={animState}
        count={LEAF_COUNT / 2}
        getTreePos={getLeafPos}
        geometry={leafGeo}
        material={leafMat}
        scaleFactor={0.25}
      />
      {/* Darker Pink Leaves */}
      <InstancedGroup 
        animState={animState}
        count={LEAF_COUNT / 2}
        getTreePos={getLeafPos}
        geometry={leafGeo}
        material={leafMatDark}
        scaleFactor={0.25}
      />
      
      {/* Cube Ornaments */}
      <InstancedGroup 
        animState={animState}
        count={ORNAMENT_COUNT / 2}
        getTreePos={getOrnamentPos}
        geometry={cubeGeo}
        material={ornamentMat}
        scaleFactor={0.3}
      />
      {/* Icosahedron Ornaments */}
      <InstancedGroup 
        animState={animState}
        count={ORNAMENT_COUNT / 2}
        getTreePos={getOrnamentPos}
        geometry={icoGeo}
        material={ornamentMat}
        scaleFactor={0.25}
      />

      {/* The Spiral Ribbon */}
      <InstancedGroup 
        animState={animState}
        count={RIBBON_COUNT}
        getTreePos={getRibbonPos}
        geometry={ribbonGeo}
        material={ribbonMat}
        scaleFactor={0.08}
      />
    </group>
  );
};