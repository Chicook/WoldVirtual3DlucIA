/**
 * @fileoverview Utilidades del gateway del metaverso
 * @module @metaverso/gateway/utils
 */

import { Logger } from './logger';
import { Metrics } from './metrics';

/**
 * Clase de utilidades del gateway
 */
export class GatewayUtils {
  /**
   * Genera un ID único
   */
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Valida una URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitiza una cadena
   */
  static sanitizeString(str: string): string {
    return str.replace(/[<>]/g, '');
  }

  /**
   * Obtiene la IP del cliente
   */
  static getClientIP(req: any): string {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           req.connection.socket?.remoteAddress || 
           'unknown';
  }
}

export { Logger, Metrics }; 