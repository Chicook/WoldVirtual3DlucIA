/**
 * 🧩 ComponentTypes - Tipos e Interfaces de Componentes
 * 
 * Responsabilidades:
 * - Definición de tipos TypeScript para componentes React
 * - Interfaces de registro y metadatos
 * - Tipos de props y eventos
 * - Estructuras de datos de componentes
 */

import React, { ComponentType } from 'react';

// ============================================================================
// INTERFACES DE REGISTRO
// ============================================================================

export interface ComponentRegistry {
  [key: string]: {
    component: React.LazyExoticComponent<ComponentType<any>>;
    metadata: ComponentMetadata;
    dependencies: string[];
    preload: boolean;
  };
}

export interface ComponentMetadata {
  name: string;
  version: string;
  description: string;
  category: string;
  tags: string[];
  props: ComponentProp[];
  events: ComponentEvent[];
  examples: ComponentExample[];
  performance: ComponentPerformance;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description: string;
  validation?: RegExp;
}

export interface ComponentEvent {
  name: string;
  description: string;
  payload: any;
  bubbles: boolean;
}

export interface ComponentExample {
  name: string;
  description: string;
  code: string;
  props: Record<string, any>;
}

export interface ComponentPerformance {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface ComponentState {
  isLoaded: boolean;
  isError: boolean;
  loadTime: number;
  lastUsed: Date;
  usageCount: number;
}

// ============================================================================
// TIPOS DE CATEGORÍAS
// ============================================================================

export type ComponentCategory = 
  | 'metaverse'
  | 'ui'
  | 'communication'
  | 'navigation'
  | 'forms'
  | 'media'
  | 'data'
  | 'layout'
  | 'feedback'
  | 'overlay';

export type ComponentComplexity = 'low' | 'medium' | 'high';

export type ComponentStatus = 'loading' | 'loaded' | 'error' | 'unmounted';

// ============================================================================
// INTERFACES DE PROPS COMUNES
// ============================================================================

export interface BaseComponentProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface AvatarProps extends BaseComponentProps {
  userId: string;
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  animation?: string;
  visible?: boolean;
  onClick?: (userId: string) => void;
  onHover?: (userId: string) => void;
}

export interface Scene3DProps extends BaseComponentProps {
  environment?: string;
  lighting?: 'dynamic' | 'static' | 'ambient';
  fog?: boolean;
  fogColor?: string;
  fogDensity?: number;
  onLoad?: (sceneId: string) => void;
  onError?: (error: Error) => void;
}

export interface ChatInterfaceProps extends BaseComponentProps {
  channel: string;
  maxMessages?: number;
  autoScroll?: boolean;
  showTimestamp?: boolean;
  onMessage?: (message: string, sender: string) => void;
  onSend?: (message: string) => void;
}

// ============================================================================
// INTERFACES DE EVENTOS
// ============================================================================

export interface ComponentEventData {
  componentName: string;
  eventType: string;
  timestamp: number;
  data: any;
}

export interface ComponentLoadEvent extends ComponentEventData {
  eventType: 'load';
  data: {
    loadTime: number;
    bundleSize: number;
    dependencies: string[];
  };
}

export interface ComponentErrorEvent extends ComponentEventData {
  eventType: 'error';
  data: {
    error: string;
    stack?: string;
    context?: any;
  };
}

export interface ComponentRenderEvent extends ComponentEventData {
  eventType: 'render';
  data: {
    renderTime: number;
    props: Record<string, any>;
    children: number;
  };
}

// ============================================================================
// INTERFACES DE CONFIGURACIÓN
// ============================================================================

export interface ComponentConfig {
  enableLazyLoading: boolean;
  enablePreloading: boolean;
  enableErrorBoundaries: boolean;
  enablePerformanceMonitoring: boolean;
  maxPreloadComponents: number;
  preloadThreshold: number;
}

export interface ComponentStats {
  totalComponents: number;
  loadedComponents: number;
  errorComponents: number;
  preloadedComponents: number;
  averageLoadTime: number;
  mostUsedComponents: Array<{ name: string; usageCount: number }>;
  categoryDistribution: Record<ComponentCategory, number>;
  performanceMetrics: {
    averageRenderTime: number;
    averageMemoryUsage: number;
    totalBundleSize: number;
  };
} 