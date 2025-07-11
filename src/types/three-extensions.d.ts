// Declaraciones de tipos para Three.js y React Three Fiber
declare module 'three' {
  export * from 'three';
}

declare module '@react-three/fiber' {
  import { ReactThreeFiber } from '@react-three/fiber';
  
  export interface ThreeElements {
    group: ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>;
    points: ReactThreeFiber.BufferGeometryNode<THREE.Points, typeof THREE.Points>;
    gridHelper: ReactThreeFiber.Object3DNode<THREE.GridHelper, typeof THREE.GridHelper>;
  }
  
  export { Canvas, useFrame } from '@react-three/fiber';
}

declare module '@react-three/drei' {
  export { 
    OrbitControls, 
    Stats, 
    Sphere, 
    Cylinder, 
    Box, 
    Plane,
    useGLTF 
  } from '@react-three/drei';
}

declare module 'tone' {
  export * from 'tone';
}

// Extender JSX para elementos Three.js
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      points: any;
      gridHelper: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      fog: any;
    }
  }
} 