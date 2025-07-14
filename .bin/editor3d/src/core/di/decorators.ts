/**
 * Decorators for dependency injection and metadata
 */

import 'reflect-metadata';

/**
 * Marks a class as injectable service
 * 
 * @param token - Optional token for service identification
 * 
 * @example
 * ```typescript
 * @Injectable('GeometryService')
 * class GeometryService {
 *   constructor(
 *     @Inject('Logger') private logger: ILogger,
 *     @Inject('EventEmitter') private events: IEventEmitter
 *   ) {}
 * }
 * ```
 */
export function Injectable(token?: string) {
  return function (target: any) {
    Reflect.defineMetadata('injectable', true, target);
    if (token) {
      Reflect.defineMetadata('inject:token', token, target);
    }
  };
}

/**
 * Injects a dependency by token
 * 
 * @param token - Service token to inject
 * 
 * @example
 * ```typescript
 * class GeometryService {
 *   constructor(
 *     @Inject('Logger') private logger: ILogger
 *   ) {}
 * }
 * ```
 */
export function Inject(token: string) {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    const injectionTokens = Reflect.getMetadata('inject:tokens', target) || [];
    injectionTokens[parameterIndex] = token;
    Reflect.defineMetadata('inject:tokens', injectionTokens, target);
  };
}

/**
 * Marks a method for performance monitoring
 * 
 * @param operationName - Name for the operation in metrics
 * 
 * @example
 * ```typescript
 * class GeometryService {
 *   @Measure('csg_union')
 *   async csgUnion(geomA: BufferGeometry, geomB: BufferGeometry) {
 *     // Implementation
 *   }
 * }
 * ```
 */
export function Measure(operationName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const monitor = (globalThis as any).container?.resolve('PerformanceMonitor');
      if (monitor) {
        return monitor.measure(operationName, () => originalMethod.apply(this, args));
      }
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Throttles method execution by FPS
 * 
 * @param fps - Target frames per second
 * 
 * @example
 * ```typescript
 * class ViewportService {
 *   @ThrottleByFPS(60)
 *   updateViewport() {
 *     // Will be throttled to 60 FPS
 *   }
 * }
 * ```
 */
export function ThrottleByFPS(fps: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const interval = 1000 / fps;
    let lastCall = 0;
    
    descriptor.value = function (...args: any[]) {
      const now = performance.now();
      if (now - lastCall >= interval) {
        lastCall = now;
        return originalMethod.apply(this, args);
      }
    };
    
    return descriptor;
  };
}

/**
 * Tracks memory usage for a method
 * 
 * @example
 * ```typescript
 * class GeometryService {
 *   @MemoryTracked
 *   createLargeGeometry() {
 *     // Memory usage will be tracked
 *   }
 * }
 * ```
 */
export function MemoryTracked(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const startMemory = performance.memory?.usedJSHeapSize || 0;
    const result = originalMethod.apply(this, args);
    const endMemory = performance.memory?.usedJSHeapSize || 0;
    
    const monitor = (globalThis as any).container?.resolve('PerformanceMonitor');
    if (monitor) {
      monitor.recordMemoryUsage(propertyKey, endMemory - startMemory);
    }
    
    return result;
  };
  
  return descriptor;
}

/**
 * Validates method parameters
 * 
 * @param validator - Validation function
 * 
 * @example
 * ```typescript
 * class GeometryService {
 *   @Validate((geom: BufferGeometry) => geom.attributes.position)
 *   processGeometry(geometry: BufferGeometry) {
 *     // Parameters will be validated
 *   }
 * }
 * ```
 */
export function Validate(validator: (...args: any[]) => boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      if (!validator(...args)) {
        throw new Error(`Validation failed for ${propertyKey}`);
      }
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
} 