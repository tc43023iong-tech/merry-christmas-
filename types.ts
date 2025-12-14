import { Color } from "three";

export type AnimationState = 'TREE' | 'EXPLODE';

export interface ParticleData {
    treePosition: [number, number, number];
    explodePosition: [number, number, number];
    rotation: [number, number, number];
    scale: number;
    color?: Color | string;
}
