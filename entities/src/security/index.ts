/**
 * Sistema de Seguridad del Metaverso
 */

export function validateURI(uri: string): boolean {
  try {
    new URL(uri);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '');
}

export class AccessControl {
  async checkPermission(userId: string, entityId: string, action: string): Promise<boolean> {
    // Implementación de control de acceso
    return true;
  }
} 