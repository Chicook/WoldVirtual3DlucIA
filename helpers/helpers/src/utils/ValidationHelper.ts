/**
 * @fileoverview Helper de validación para asegurar la integridad de datos en el metaverso
 * @module @metaverso/helpers/utils/ValidationHelper
 */

import * as THREE from 'three';
import { ValidationOptions } from '../types';

/**
 * Tipos de validación
 */
export type ValidationType = 
  | 'required'
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'vector3'
  | 'quaternion'
  | 'matrix4'
  | 'color'
  | 'uuid'
  | 'email'
  | 'url'
  | 'range'
  | 'length'
  | 'pattern'
  | 'custom';

/**
 * Regla de validación
 */
export interface ValidationRule {
  type: ValidationType;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
  custom?: (value: any) => boolean | string;
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  field?: string;
  value?: any;
}

/**
 * Esquema de validación
 */
export interface ValidationSchema {
  [field: string]: ValidationRule | ValidationRule[];
}

/**
 * Helper de validación para asegurar la integridad de datos en el metaverso
 */
export class ValidationHelper {
  private _options: ValidationOptions;
  private _schemas: Map<string, ValidationSchema> = new Map();
  private _customValidators: Map<string, Function> = new Map();

  /**
   * Constructor del helper
   * @param options - Opciones de validación
   */
  constructor(options: Partial<ValidationOptions> = {}) {
    this._options = {
      validateTypes: true,
      validateRanges: true,
      validateFormats: true,
      errorMessages: {
        required: 'El campo es requerido',
        type: 'Tipo de dato inválido',
        range: 'Valor fuera del rango permitido',
        length: 'Longitud inválida',
        pattern: 'Formato inválido',
        custom: 'Validación personalizada falló'
      },
      ...options
    };
    
    this._setupDefaultValidators();
  }

  /**
   * Validar un valor con una regla
   */
  public validate(value: any, rule: ValidationRule, field?: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar requerido
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(rule.message || this._options.errorMessages?.required || 'Campo requerido');
      return { isValid: false, errors, warnings, field, value };
    }

    // Si el valor no es requerido y está vacío, no validar más
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return { isValid: true, errors, warnings, field, value };
    }

    // Validar tipo
    if (this._options.validateTypes) {
      const typeError = this._validateType(value, rule.type);
      if (typeError) {
        errors.push(typeError);
      }
    }

    // Validar rango
    if (this._options.validateRanges && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(rule.message || `${field || 'Valor'} debe ser mayor o igual a ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(rule.message || `${field || 'Valor'} debe ser menor o igual a ${rule.max}`);
      }
    }

    // Validar longitud
    if (rule.type === 'string' || rule.type === 'array') {
      if (rule.min !== undefined && value.length < rule.min) {
        errors.push(rule.message || `${field || 'Valor'} debe tener al menos ${rule.min} elementos`);
      }
      if (rule.max !== undefined && value.length > rule.max) {
        errors.push(rule.message || `${field || 'Valor'} debe tener máximo ${rule.max} elementos`);
      }
    }

    // Validar patrón
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        errors.push(rule.message || `${field || 'Valor'} no coincide con el formato requerido`);
      }
    }

    // Validación personalizada
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (typeof customResult === 'string') {
        errors.push(customResult);
      } else if (!customResult) {
        errors.push(rule.message || this._options.errorMessages?.custom || 'Validación personalizada falló');
      }
    }

    return { isValid: errors.length === 0, errors, warnings, field, value };
  }

  /**
   * Validar un objeto con un esquema
   */
  public validateObject(obj: any, schema: ValidationSchema): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isValid = true;

    for (const [field, rule] of Object.entries(schema)) {
      const value = obj[field];
      const rules = Array.isArray(rule) ? rule : [rule];
      
      for (const singleRule of rules) {
        const result = this.validate(value, singleRule, field);
        
        if (!result.isValid) {
          isValid = false;
          errors.push(...result.errors);
        }
        
        warnings.push(...result.warnings);
      }
    }

    return { isValid, errors, warnings, value: obj };
  }

  /**
   * Validar datos de Three.js
   */
  public validateThreeJSData(data: any): ValidationResult {
    const schema: ValidationSchema = {
      position: { type: 'vector3', required: true },
      rotation: { type: 'quaternion', required: true },
      scale: { type: 'vector3', required: true },
      visible: { type: 'boolean', required: true },
      uuid: { type: 'uuid', required: true },
      type: { type: 'string', required: true }
    };

    return this.validateObject(data, schema);
  }

  /**
   * Validar datos de blockchain
   */
  public validateBlockchainData(data: any): ValidationResult {
    const schema: ValidationSchema = {
      address: { 
        type: 'string', 
        required: true, 
        pattern: /^0x[a-fA-F0-9]{40}$/,
        message: 'Dirección Ethereum inválida'
      },
      amount: { 
        type: 'string', 
        required: true, 
        pattern: /^\d+(\.\d+)?$/,
        message: 'Cantidad inválida'
      },
      gasLimit: { 
        type: 'number', 
        required: true, 
        min: 21000,
        max: 30000000,
        message: 'Gas limit debe estar entre 21,000 y 30,000,000'
      },
      gasPrice: { 
        type: 'string', 
        required: true, 
        pattern: /^\d+(\.\d+)?$/,
        message: 'Gas price inválido'
      }
    };

    return this.validateObject(data, schema);
  }

  /**
   * Validar datos de audio
   */
  public validateAudioData(data: any): ValidationResult {
    const schema: ValidationSchema = {
      url: { 
        type: 'url', 
        required: true,
        message: 'URL de audio inválida'
      },
      volume: { 
        type: 'number', 
        required: true, 
        min: 0, 
        max: 1,
        message: 'Volumen debe estar entre 0 y 1'
      },
      loop: { type: 'boolean', required: true },
      autoplay: { type: 'boolean', required: true },
      maxDistance: { 
        type: 'number', 
        required: true, 
        min: 0,
        message: 'Distancia máxima debe ser positiva'
      }
    };

    return this.validateObject(data, schema);
  }

  /**
   * Validar datos de física
   */
  public validatePhysicsData(data: any): ValidationResult {
    const schema: ValidationSchema = {
      mass: { 
        type: 'number', 
        required: true, 
        min: 0,
        message: 'Masa debe ser positiva'
      },
      friction: { 
        type: 'number', 
        required: true, 
        min: 0, 
        max: 1,
        message: 'Fricción debe estar entre 0 y 1'
      },
      restitution: { 
        type: 'number', 
        required: true, 
        min: 0, 
        max: 1,
        message: 'Restitución debe estar entre 0 y 1'
      },
      position: { type: 'vector3', required: true },
      rotation: { type: 'quaternion', required: true },
      velocity: { type: 'vector3', required: false },
      angularVelocity: { type: 'vector3', required: false }
    };

    return this.validateObject(data, schema);
  }

  /**
   * Validar datos de red
   */
  public validateNetworkData(data: any): ValidationResult {
    const schema: ValidationSchema = {
      ip: { 
        type: 'string', 
        required: true, 
        pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        message: 'Dirección IP inválida'
      },
      port: { 
        type: 'number', 
        required: true, 
        min: 1, 
        max: 65535,
        message: 'Puerto debe estar entre 1 y 65535'
      },
      protocol: { 
        type: 'string', 
        required: true, 
        pattern: /^(http|https|ws|wss|tcp|udp)$/,
        message: 'Protocolo inválido'
      }
    };

    return this.validateObject(data, schema);
  }

  /**
   * Registrar esquema de validación
   */
  public registerSchema(name: string, schema: ValidationSchema): void {
    this._schemas.set(name, schema);
  }

  /**
   * Validar con esquema registrado
   */
  public validateWithSchema(name: string, data: any): ValidationResult {
    const schema = this._schemas.get(name);
    if (!schema) {
      return {
        isValid: false,
        errors: [`Esquema '${name}' no encontrado`],
        warnings: []
      };
    }

    return this.validateObject(data, schema);
  }

  /**
   * Registrar validador personalizado
   */
  public registerCustomValidator(name: string, validator: Function): void {
    this._customValidators.set(name, validator);
  }

  /**
   * Validar con validador personalizado
   */
  public validateWithCustom(name: string, value: any): ValidationResult {
    const validator = this._customValidators.get(name);
    if (!validator) {
      return {
        isValid: false,
        errors: [`Validador personalizado '${name}' no encontrado`],
        warnings: []
      };
    }

    const result = validator(value);
    if (typeof result === 'string') {
      return { isValid: false, errors: [result], warnings: [] };
    } else if (typeof result === 'boolean') {
      return { isValid: result, errors: result ? [] : ['Validación falló'], warnings: [] };
    } else {
      return result;
    }
  }

  /**
   * Sanitizar datos
   */
  public sanitize(data: any, schema: ValidationSchema): any {
    const sanitized: any = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];
      const rules = Array.isArray(rule) ? rule : [rule];
      
      // Aplicar el primer tipo de regla para sanitización
      const firstRule = rules[0];
      sanitized[field] = this._sanitizeValue(value, firstRule.type);
    }

    return sanitized;
  }

  /**
   * Validar tipo de dato
   */
  private _validateType(value: any, type: ValidationType): string | null {
    switch (type) {
      case 'string':
        return typeof value === 'string' ? null : 'Debe ser una cadena de texto';
      case 'number':
        return typeof value === 'number' && !isNaN(value) ? null : 'Debe ser un número';
      case 'boolean':
        return typeof value === 'boolean' ? null : 'Debe ser un booleano';
      case 'array':
        return Array.isArray(value) ? null : 'Debe ser un array';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value) ? null : 'Debe ser un objeto';
      case 'vector3':
        return value instanceof THREE.Vector3 ? null : 'Debe ser un Vector3';
      case 'quaternion':
        return value instanceof THREE.Quaternion ? null : 'Debe ser un Quaternion';
      case 'matrix4':
        return value instanceof THREE.Matrix4 ? null : 'Debe ser un Matrix4';
      case 'color':
        return value instanceof THREE.Color ? null : 'Debe ser un Color';
      case 'uuid':
        return this._isValidUUID(value) ? null : 'Debe ser un UUID válido';
      case 'email':
        return this._isValidEmail(value) ? null : 'Debe ser un email válido';
      case 'url':
        return this._isValidURL(value) ? null : 'Debe ser una URL válida';
      default:
        return null;
    }
  }

  /**
   * Sanitizar valor
   */
  private _sanitizeValue(value: any, type: ValidationType): any {
    if (value === undefined || value === null) {
      return value;
    }

    switch (type) {
      case 'string':
        return typeof value === 'string' ? value.trim() : String(value);
      case 'number':
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      case 'boolean':
        return Boolean(value);
      case 'array':
        return Array.isArray(value) ? value : [value];
      case 'object':
        return typeof value === 'object' && value !== null ? value : {};
      case 'vector3':
        return value instanceof THREE.Vector3 ? value : new THREE.Vector3();
      case 'quaternion':
        return value instanceof THREE.Quaternion ? value : new THREE.Quaternion();
      case 'matrix4':
        return value instanceof THREE.Matrix4 ? value : new THREE.Matrix4();
      case 'color':
        return value instanceof THREE.Color ? value : new THREE.Color();
      case 'email':
        return typeof value === 'string' ? value.toLowerCase().trim() : '';
      case 'url':
        return typeof value === 'string' ? value.trim() : '';
      default:
        return value;
    }
  }

  /**
   * Verificar si es un UUID válido
   */
  private _isValidUUID(value: any): boolean {
    if (typeof value !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Verificar si es un email válido
   */
  private _isValidEmail(value: any): boolean {
    if (typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  /**
   * Verificar si es una URL válida
   */
  private _isValidURL(value: any): boolean {
    if (typeof value !== 'string') return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Configurar validadores por defecto
   */
  private _setupDefaultValidators(): void {
    // Validador para coordenadas 3D
    this.registerCustomValidator('coordinates3D', (value: any) => {
      if (!(value instanceof THREE.Vector3)) {
        return 'Debe ser un Vector3';
      }
      
      if (isNaN(value.x) || isNaN(value.y) || isNaN(value.z)) {
        return 'Coordenadas contienen valores NaN';
      }
      
      if (!isFinite(value.x) || !isFinite(value.y) || !isFinite(value.z)) {
        return 'Coordenadas contienen valores infinitos';
      }
      
      return true;
    });

    // Validador para rotación válida
    this.registerCustomValidator('validRotation', (value: any) => {
      if (!(value instanceof THREE.Quaternion)) {
        return 'Debe ser un Quaternion';
      }
      
      const length = Math.sqrt(value.x * value.x + value.y * value.y + value.z * value.z + value.w * value.w);
      if (Math.abs(length - 1) > 0.001) {
        return 'Quaternion no está normalizado';
      }
      
      return true;
    });

    // Validador para color válido
    this.registerCustomValidator('validColor', (value: any) => {
      if (!(value instanceof THREE.Color)) {
        return 'Debe ser un Color';
      }
      
      if (isNaN(value.r) || isNaN(value.g) || isNaN(value.b)) {
        return 'Color contiene valores NaN';
      }
      
      if (value.r < 0 || value.r > 1 || value.g < 0 || value.g > 1 || value.b < 0 || value.b > 1) {
        return 'Componentes de color deben estar entre 0 y 1';
      }
      
      return true;
    });
  }
} 