/**
 * 💻 CLITypes - Tipos y Interfaces para el Sistema CLI
 * 
 * Responsabilidades:
 * - Definición de tipos TypeScript para CLI
 * - Interfaces de comandos y opciones
 * - Tipos de resultados y sesiones
 * - Estructuras de datos para templates
 */

// ============================================================================
// INTERFACES FUNDAMENTALES DE CLI
// ============================================================================

export interface CLICommand {
  name: string;
  description: string;
  usage: string;
  options: CLIOption[];
  action: (args: string[], options: Record<string, any>) => Promise<void>;
  aliases?: string[];
  examples?: string[];
}

export interface CLIOption {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  default?: any;
  aliases?: string[];
}

export interface CLIResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  timestamp: Date;
}

export interface CLISession {
  id: string;
  userId: string;
  commands: CLIResult[];
  startTime: Date;
  endTime?: Date;
  environment: string;
  workingDirectory: string;
}

export interface CLITemplate {
  name: string;
  description: string;
  files: TemplateFile[];
  variables: TemplateVariable[];
  category: string;
}

export interface TemplateFile {
  path: string;
  content: string;
  type: 'file' | 'directory';
  permissions?: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  default?: any;
  validation?: RegExp;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

export type CommandName = 'init' | 'build' | 'test' | 'deploy' | 'help' | 'version';
export type EnvironmentType = 'development' | 'staging' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// ============================================================================
// INTERFACES DE CONFIGURACIÓN
// ============================================================================

export interface CLIConfig {
  defaultEnvironment: EnvironmentType;
  logLevel: LogLevel;
  enableColors: boolean;
  enableProgress: boolean;
  timeout: number;
  maxRetries: number;
}

export interface CLIStats {
  totalCommands: number;
  successfulCommands: number;
  failedCommands: number;
  averageExecutionTime: number;
  activeSessions: number;
  templatesUsed: number;
} 