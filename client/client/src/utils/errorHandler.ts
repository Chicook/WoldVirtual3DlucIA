import { toast } from 'react-hot-toast';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Manejar error general
  handleError(error: Error | string, context?: string): void {
    const appError: AppError = {
      code: this.getErrorCode(error),
      message: typeof error === 'string' ? error : error.message,
      details: typeof error === 'object' ? error : undefined,
      timestamp: Date.now()
    };

    // Log del error
    this.logError(appError, context);

    // Mostrar notificación al usuario
    this.showUserNotification(appError);

    // En desarrollo, mostrar en consola
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'App'}] Error:`, appError);
    }
  }

  // Manejar error de Web3
  handleWeb3Error(error: any, operation: string): void {
    const message = this.getWeb3ErrorMessage(error);
    this.handleError(message, `Web3-${operation}`);
  }

  // Manejar error de avatar
  handleAvatarError(error: any, operation: string): void {
    const message = this.getAvatarErrorMessage(error);
    this.handleError(message, `Avatar-${operation}`);
  }

  // Manejar error de metaverso
  handleMetaversoError(error: any, operation: string): void {
    const message = this.getMetaversoErrorMessage(error);
    this.handleError(message, `Metaverso-${operation}`);
  }

  // Obtener código de error
  private getErrorCode(error: Error | string): string {
    if (typeof error === 'string') {
      return 'UNKNOWN_ERROR';
    }

    // Códigos específicos para errores conocidos
    if (error.message.includes('MetaMask')) return 'METAMASK_ERROR';
    if (error.message.includes('network')) return 'NETWORK_ERROR';
    if (error.message.includes('avatar')) return 'AVATAR_ERROR';
    if (error.message.includes('wallet')) return 'WALLET_ERROR';
    if (error.message.includes('connection')) return 'CONNECTION_ERROR';

    return 'UNKNOWN_ERROR';
  }

  // Obtener mensaje de error de Web3
  private getWeb3ErrorMessage(error: any): string {
    if (error.code === 4001) {
      return 'Operación cancelada por el usuario';
    }
    if (error.code === -32603) {
      return 'Error interno de MetaMask';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Saldo insuficiente en la wallet';
    }
    if (error.message.includes('user rejected')) {
      return 'Operación rechazada por el usuario';
    }
    if (error.message.includes('network')) {
      return 'Error de conexión a la red blockchain';
    }
    
    return error.message || 'Error desconocido de Web3';
  }

  // Obtener mensaje de error de avatar
  private getAvatarErrorMessage(error: any): string {
    if (error.message.includes('load')) {
      return 'Error al cargar el avatar';
    }
    if (error.message.includes('create')) {
      return 'Error al crear el avatar';
    }
    if (error.message.includes('update')) {
      return 'Error al actualizar el avatar';
    }
    
    return error.message || 'Error desconocido del avatar';
  }

  // Obtener mensaje de error del metaverso
  private getMetaversoErrorMessage(error: any): string {
    if (error.message.includes('initialize')) {
      return 'Error al inicializar el metaverso';
    }
    if (error.message.includes('join')) {
      return 'Error al unirse al mundo';
    }
    if (error.message.includes('connection')) {
      return 'Error de conexión al metaverso';
    }
    
    return error.message || 'Error desconocido del metaverso';
  }

  // Log del error
  private logError(error: AppError, context?: string): void {
    this.errorLog.push({
      ...error,
      message: `[${context || 'App'}] ${error.message}`
    });

    // Mantener solo los últimos 100 errores
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // En desarrollo, guardar en localStorage
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('metaverso_error_log', JSON.stringify(this.errorLog));
    }
  }

  // Mostrar notificación al usuario
  private showUserNotification(error: AppError): void {
    const isCritical = this.isCriticalError(error);
    
    if (isCritical) {
      toast.error(error.message, {
        duration: 6000,
        style: {
          background: '#dc2626',
          color: '#fff'
        }
      });
    } else {
      toast.error(error.message, {
        duration: 4000
      });
    }
  }

  // Determinar si es un error crítico
  private isCriticalError(error: AppError): boolean {
    const criticalCodes = [
      'METAMASK_ERROR',
      'NETWORK_ERROR',
      'CONNECTION_ERROR'
    ];
    
    return criticalCodes.includes(error.code);
  }

  // Obtener log de errores
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  // Limpiar log de errores
  clearErrorLog(): void {
    this.errorLog = [];
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('metaverso_error_log');
    }
  }

  // Obtener estadísticas de errores
  getErrorStats(): {
    total: number;
    byCode: Record<string, number>;
    recent: number;
  } {
    const byCode: Record<string, number> = {};
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    let recent = 0;

    this.errorLog.forEach(error => {
      byCode[error.code] = (byCode[error.code] || 0) + 1;
      if (error.timestamp > oneHourAgo) {
        recent++;
      }
    });

    return {
      total: this.errorLog.length,
      byCode,
      recent
    };
  }
}

// Instancia global
export const errorHandler = ErrorHandler.getInstance();

// Hooks de conveniencia
export const useErrorHandler = () => {
  return {
    handleError: errorHandler.handleError.bind(errorHandler),
    handleWeb3Error: errorHandler.handleWeb3Error.bind(errorHandler),
    handleAvatarError: errorHandler.handleAvatarError.bind(errorHandler),
    handleMetaversoError: errorHandler.handleMetaversoError.bind(errorHandler),
    getErrorLog: errorHandler.getErrorLog.bind(errorHandler),
    getErrorStats: errorHandler.getErrorStats.bind(errorHandler)
  };
}; 