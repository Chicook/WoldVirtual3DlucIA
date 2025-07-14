/**
 * Sistema de Versionado del Metaverso
 */

export class VersioningSystem {
  increment(version: string): string {
    const parts = version.split('.');
    const major = parseInt(parts[0] || '1');
    const minor = parseInt(parts[1] || '0');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${major}.${minor}.${patch}`;
  }
} 