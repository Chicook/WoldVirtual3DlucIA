// Three.js Extensions Type Declarations
// Este archivo proporciona soporte TypeScript para las importaciones de Three.js

declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, EventDispatcher } from 'three';
  export class OrbitControls extends EventDispatcher {
    constructor(camera: Camera, domElement?: HTMLElement);
    enabled: boolean;
    target: import('three').Vector3;
    minDistance: number;
    maxDistance: number;
    enableZoom: boolean;
    enableRotate: boolean;
    enablePan: boolean;
    enableDamping: boolean;
    dampingFactor: number;
    screenSpacePanning: boolean;
    update(): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/controls/TransformControls' {
  import { Camera, EventDispatcher, Object3D } from 'three';
  
  export class TransformControls extends EventDispatcher {
    constructor(camera: Camera, domElement?: HTMLElement);
    
    // Properties
    enabled: boolean;
    mode: 'translate' | 'rotate' | 'scale';
    size: number;
    object?: Object3D;
    
    // Methods
    attach(object: Object3D): void;
    detach(): void;
    setMode(mode: 'translate' | 'rotate' | 'scale'): void;
    update(): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import { Loader, LoadingManager, Group } from 'three';
  
  export interface GLTF {
    scene: Group;
    scenes: Group[];
    animations: any[];
    asset: any;
  }
  
  export class GLTFLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(url: string, onLoad: (gltf: GLTF) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    parse(data: ArrayBuffer | string, path: string, onLoad: (gltf: GLTF) => void, onError?: (event: ErrorEvent) => void): void;
  }
}

declare module 'three/examples/jsm/loaders/OBJLoader' {
  import { Loader, LoadingManager, Group } from 'three';
  
  export class OBJLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(url: string, onLoad: (object: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    parse(data: string): Group;
  }
}

declare module 'three/examples/jsm/loaders/FBXLoader' {
  import { Loader, LoadingManager, Group } from 'three';
  
  export class FBXLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(url: string, onLoad: (object: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    parse(FBXBuffer: ArrayBuffer, path: string): Group;
  }
}

declare module 'three/examples/jsm/exporters/GLTFExporter' {
  import { Object3D, Scene } from 'three';
  
  export interface GLTFExporterOptions {
    binary?: boolean;
    trs?: boolean;
    onlyVisible?: boolean;
    truncateDrawRange?: boolean;
    maxTextureSize?: number;
    animations?: any[];
    includeCustomExtensions?: boolean;
  }
  
  export class GLTFExporter {
    constructor();
    parse(input: Object3D | Scene, onDone: (result: string | ArrayBuffer) => void, options?: GLTFExporterOptions): void;
  }
}

declare module 'three/examples/jsm/exporters/OBJExporter' {
  import { Object3D, Scene } from 'three';
  
  export class OBJExporter {
    constructor();
    parse(object: Object3D | Scene): string;
  }
}

// Global Three.js extensions
declare global {
  namespace THREE {
    interface Object3D {
      // Add any custom properties or methods here
      userData: any;
      name: string;
    }
  }
}

export {}; 