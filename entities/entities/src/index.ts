/**
 * Sistema de Entidades del Metaverso
 * 
 * Este módulo proporciona un sistema completo de gestión de entidades
 * para el metaverso descentralizado, incluyendo:
 * - Sistema URI avanzado
 * - Gestión de entidades
 * - Integración blockchain
 * - Validación y seguridad
 * - Sincronización con motor 3D
 */

// Exportar sistema URI existente
export * from '../esnext/uri';
export * from '../esnext/util';

// Exportar nuevos módulos del sistema de entidades
export * from './types';
export * from './entity-manager';
export * from './metadata-system';
export * from './blockchain';
export * from './validation';
export * from './versioning';
export * from './wasm';
export * from './sync';
export * from './cache';
export * from './security';
export * from './config';
export * from './utils';

// Exportar configuración por defecto
export { defaultConfig } from './config'; 