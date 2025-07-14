/**
 * 🔧 BinTypes - Tipos e Interfaces de Binarios
 * 
 * Responsabilidades:
 * - Definición de tipos TypeScript para binarios
 * - Interfaces de información y registro
 * - Tipos de compilación y ejecución
 * - Estructuras de datos de binarios
 */

// ============================================================================
// INTERFACES DE INFORMACIÓN DE BINARIOS
// ============================================================================

export interface BinaryInfo {
  name: string;
  version: string;
  platform: string;
  architecture: string;
  path: string;
  size: number;
  checksum: string;
  dependencies: string[];
  permissions: string;
  lastModified: Date;
  isExecutable: boolean;
}

export interface BinaryRegistry {
  [key: string]: BinaryInfo;
}

export interface CompilationConfig {
  target: string;
  optimization: 'debug' | 'release';
  platform: 'linux' | 'windows' | 'macos';
  architecture: 'x64' | 'arm64' | 'x86';
  outputDir: string;
  sourceFiles: string[];
  dependencies: string[];
  flags: string[];
}

export interface BinaryStats {
  totalBinaries: number;
  totalSize: number;
  platforms: string[];
  architectures: string[];
  averageSize: number;
  mostUsedBinaries: Array<{ name: string; usageCount: number }>;
  lastUpdated: Date;
}

// ============================================================================
// TIPOS DE PLATAFORMA Y ARQUITECTURA
// ============================================================================

export type Platform = 'linux' | 'windows' | 'macos' | 'unknown';
export type Architecture = 'x64' | 'arm64' | 'x86' | 'unknown';
export type Optimization = 'debug' | 'release';
export type BinaryType = 'executable' | 'library' | 'script' | 'tool';

// ============================================================================
// INTERFACES DE EJECUCIÓN
// ============================================================================

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number;
  executionTime: number;
  memoryUsage: number;
}

export interface ExecutionConfig {
  timeout: number;
  workingDirectory?: string;
  environment?: Record<string, string>;
  stdin?: string;
  captureOutput: boolean;
  captureErrors: boolean;
}

// ============================================================================
// INTERFACES DE VERIFICACIÓN
// ============================================================================

export interface BinaryValidation {
  isValid: boolean;
  checksum: string;
  expectedChecksum: string;
  size: number;
  expectedSize: number;
  permissions: string;
  expectedPermissions: string;
  errors: string[];
  warnings: string[];
}

export interface SecurityScan {
  isSecure: boolean;
  vulnerabilities: SecurityVulnerability[];
  permissions: PermissionCheck[];
  integrity: IntegrityCheck;
  recommendations: string[];
}

export interface SecurityVulnerability {
  type: 'buffer_overflow' | 'race_condition' | 'privilege_escalation' | 'code_injection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  line?: number;
  cve?: string;
}

export interface PermissionCheck {
  permission: string;
  required: boolean;
  granted: boolean;
  description: string;
}

export interface IntegrityCheck {
  checksumValid: boolean;
  signatureValid: boolean;
  notarized: boolean;
  trusted: boolean;
}

// ============================================================================
// INTERFACES DE DISTRIBUCIÓN
// ============================================================================

export interface DistributionPackage {
  name: string;
  version: string;
  platform: Platform;
  architecture: Architecture;
  binaries: BinaryInfo[];
  dependencies: string[];
  metadata: PackageMetadata;
  downloadUrl: string;
  size: number;
  checksum: string;
}

export interface PackageMetadata {
  description: string;
  author: string;
  license: string;
  repository: string;
  keywords: string[];
  category: string;
  tags: string[];
  requirements: SystemRequirements;
}

export interface SystemRequirements {
  minMemory: number;
  minStorage: number;
  minCpuCores: number;
  supportedPlatforms: Platform[];
  supportedArchitectures: Architecture[];
  dependencies: string[];
}

// ============================================================================
// INTERFACES DE MONITOREO
// ============================================================================

export interface BinaryMetrics {
  name: string;
  executionCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  lastExecuted: Date;
  successRate: number;
  errorCount: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface PerformanceProfile {
  binaryName: string;
  timestamp: Date;
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  ioOperations: number;
  networkCalls: number;
  context: Record<string, any>;
}

// ============================================================================
// INTERFACES DE CONFIGURACIÓN
// ============================================================================

export interface BinaryConfig {
  enableValidation: boolean;
  enableSecurityScan: boolean;
  enablePerformanceMonitoring: boolean;
  autoUpdate: boolean;
  backupBeforeUpdate: boolean;
  maxConcurrentExecutions: number;
  defaultTimeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface BinaryEnvironment {
  platform: Platform;
  architecture: Architecture;
  nodeVersion: string;
  systemMemory: number;
  availableStorage: number;
  cpuCores: number;
  environmentVariables: Record<string, string>;
} 