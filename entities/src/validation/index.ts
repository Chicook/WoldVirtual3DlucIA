/**
 * Sistema de Validación del Metaverso
 */

import { Entity, EntitySystemConfig, ValidationResult, ValidationError } from '../types';

export async function validateEntity(
  entity: Entity, 
  config: EntitySystemConfig
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validaciones básicas
  if (!entity.id) {
    errors.push({
      field: 'id',
      message: 'ID es requerido',
      code: 'REQUIRED_FIELD',
      severity: 'error',
      name: 'ValidationError'
    });
  }

  if (!entity.type) {
    errors.push({
      field: 'type',
      message: 'Tipo es requerido',
      code: 'REQUIRED_FIELD',
      severity: 'error',
      name: 'ValidationError'
    });
  }

  if (!entity.uri) {
    errors.push({
      field: 'uri',
      message: 'URI es requerida',
      code: 'REQUIRED_FIELD',
      severity: 'error',
      name: 'ValidationError'
    });
  }

  return { valid: errors.length === 0, errors, warnings };
} 