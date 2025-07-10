/**
 * 🔧 BinaryManager - Gestión Avanzada de Binarios
 * 
 * Responsabilidades:
 * - Gestión centralizada de binarios y ejecutables
 * - Escaneo y registro de binarios del sistema
 * - Validación de integridad de archivos
 * - Gestión de metadatos de binarios
 * - Optimización de rendimiento
 * 
 * Límite: 200-300 líneas de código
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { BinaryInfo, BinaryRegistry, BinaryStats } from './BinTypes';

export class BinaryManager {
  private registry: BinaryRegistry = {};
  private binaryUsage: Map<string, number> = new Map();
  private isInitialized: boolean = false;
  private binDirectory: string;

  constructor() {
    this.binDirectory = path.join(process.cwd(), '.bin');
    this.ensureBinDirectory();
  }

  private ensureBinDirectory(): void {
    if (!fs.existsSync(this.binDirectory)) {
      fs.mkdirSync(this.binDirectory, { recursive: true });
    }
  }

  async initialize(): Promise<void> {
    console.log('[🔧] Initializing BinaryManager...');
    
    try {
      await this.scanBinaries();
      await this.validateBinaries();
      await this.updateRegistry();
      
      this.isInitialized = true;
      console.log('[✅] BinaryManager initialized successfully');
    } catch (error) {
      console.error('[❌] Error initializing BinaryManager:', error);
      throw error;
    }
  }

  private async scanBinaries(): Promise<void> {
    console.log('[🔧] Scanning binaries...');
    
    const files = await this.getBinaryFiles();
    
    for (const file of files) {
      const binaryInfo = await this.getBinaryInfo(file);
      if (binaryInfo) {
        this.registry[binaryInfo.name] = binaryInfo;
      }
    }
  }

  private async getBinaryFiles(): Promise<string[]> {
    const files: string[] = [];
    
    const scanDirectory = (dir: string): void => {
      if (fs.existsSync(dir)) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (this.isBinaryFile(fullPath)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scanDirectory(this.binDirectory);
    return files;
  }

  private isBinaryFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const binaryExtensions = ['.exe', '.bin', '.so', '.dylib', '.dll', '.app'];
    return binaryExtensions.includes(ext) || this.isExecutable(filePath);
  }

  private isExecutable(filePath: string): boolean {
    try {
      const stat = fs.statSync(filePath);
      return (stat.mode & fs.constants.S_IXUSR) !== 0;
    } catch {
      return false;
    }
  }

  private async getBinaryInfo(filePath: string): Promise<BinaryInfo | null> {
    try {
      const stat = fs.statSync(filePath);
      const content = fs.readFileSync(filePath);
      const checksum = crypto.createHash('sha256').update(content).digest('hex');
      
      return {
        name: path.basename(filePath),
        version: await this.extractVersion(filePath),
        platform: this.detectPlatform(filePath),
        architecture: this.detectArchitecture(filePath),
        path: filePath,
        size: stat.size,
        checksum,
        dependencies: await this.extractDependencies(filePath),
        permissions: stat.mode.toString(8),
        lastModified: stat.mtime,
        isExecutable: this.isExecutable(filePath)
      };
    } catch (error) {
      console.warn(`[⚠️] Error getting binary info for ${filePath}:`, error);
      return null;
    }
  }

  private async extractVersion(filePath: string): Promise<string> {
    // Simulación de extracción de versión
    return '1.0.0';
  }

  private detectPlatform(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.exe') return 'windows';
    if (ext === '.app') return 'macos';
    if (ext === '.so' || ext === '.bin') return 'linux';
    return 'unknown';
  }

  private detectArchitecture(filePath: string): string {
    // Simulación de detección de arquitectura
    return 'x64';
  }

  private async extractDependencies(filePath: string): Promise<string[]> {
    // Simulación de extracción de dependencias
    return [];
  }

  private async validateBinaries(): Promise<void> {
    console.log('[🔧] Validating binaries...');
    
    for (const [name, binary] of Object.entries(this.registry)) {
      const isValid = await this.validateBinary(binary);
      if (!isValid) {
        console.warn(`[⚠️] Binary ${name} failed validation`);
        delete this.registry[name];
      }
    }
  }

  private async validateBinary(binary: BinaryInfo): Promise<boolean> {
    try {
      if (!fs.existsSync(binary.path)) {
        return false;
      }
      
      const content = fs.readFileSync(binary.path);
      const currentChecksum = crypto.createHash('sha256').update(content).digest('hex');
      
      return currentChecksum === binary.checksum;
    } catch {
      return false;
    }
  }

  private async updateRegistry(): Promise<void> {
    console.log('[🔧] Updating binary registry...');
    // Aquí se podría implementar persistencia en base de datos
  }

  getBinary(name: string): BinaryInfo | null {
    return this.registry[name] || null;
  }

  getAllBinaries(): BinaryInfo[] {
    return Object.values(this.registry);
  }

  getBinariesByPlatform(platform: string): BinaryInfo[] {
    return Object.values(this.registry).filter(binary => binary.platform === platform);
  }

  getBinariesByArchitecture(architecture: string): BinaryInfo[] {
    return Object.values(this.registry).filter(binary => binary.architecture === architecture);
  }

  getBinaryStats(): BinaryStats {
    const binaries = Object.values(this.registry);
    const totalSize = binaries.reduce((sum, binary) => sum + binary.size, 0);
    const platforms = [...new Set(binaries.map(binary => binary.platform))];
    const architectures = [...new Set(binaries.map(binary => binary.architecture))];
    
    const usageArray = Array.from(this.binaryUsage.entries())
      .map(([name, count]) => ({ name, usageCount: count }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    return {
      totalBinaries: binaries.length,
      totalSize,
      platforms,
      architectures,
      averageSize: binaries.length > 0 ? totalSize / binaries.length : 0,
      mostUsedBinaries: usageArray,
      lastUpdated: new Date()
    };
  }

  async updateBinary(name: string, newPath: string): Promise<void> {
    const binaryInfo = await this.getBinaryInfo(newPath);
    if (binaryInfo) {
      this.registry[name] = binaryInfo;
      console.log(`[✅] Binary ${name} updated successfully`);
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
} 