/**
 * @fileoverview Utilidades para manejo de archivos
 */

import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime-types';

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  mimeType: string;
  hash: string;
  lastModified: Date;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Obtiene información detallada de un archivo
 */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  const stats = await fs.stat(filePath);
  const buffer = await fs.readFile(filePath);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  
  return {
    path: filePath,
    name: path.basename(filePath),
    extension: path.extname(filePath).toLowerCase(),
    size: stats.size,
    mimeType: mime.lookup(filePath) || 'application/octet-stream',
    hash,
    lastModified: stats.mtime
  };
}

/**
 * Valida un archivo según criterios específicos
 */
export async function validateFile(
  filePath: string, 
  options: {
    maxSize?: number;
    allowedExtensions?: string[];
    allowedMimeTypes?: string[];
  } = {}
): Promise<FileValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const fileInfo = await getFileInfo(filePath);

    // Validar tamaño
    if (options.maxSize && fileInfo.size > options.maxSize) {
      errors.push(`Archivo demasiado grande: ${fileInfo.size} bytes (máximo: ${options.maxSize})`);
    }

    // Validar extensión
    if (options.allowedExtensions && !options.allowedExtensions.includes(fileInfo.extension)) {
      errors.push(`Extensión no permitida: ${fileInfo.extension}`);
    }

    // Validar tipo MIME
    if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(fileInfo.mimeType)) {
      errors.push(`Tipo MIME no permitido: ${fileInfo.mimeType}`);
    }

    // Validar que el archivo existe y es legible
    if (!(await fs.pathExists(filePath))) {
      errors.push('Archivo no existe');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return {
      valid: false,
      errors: [`Error validando archivo: ${errorMessage}`],
      warnings: []
    };
  }
}

/**
 * Crea un directorio si no existe
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Copia un archivo a una nueva ubicación
 */
export async function copyFile(source: string, destination: string): Promise<void> {
  await fs.copy(source, destination);
}

/**
 * Mueve un archivo a una nueva ubicación
 */
export async function moveFile(source: string, destination: string): Promise<void> {
  await fs.move(source, destination);
}

/**
 * Elimina un archivo o directorio
 */
export async function removeFile(filePath: string): Promise<void> {
  await fs.remove(filePath);
}

/**
 * Genera un nombre único para un archivo
 */
export function generateUniqueFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName);
  const name = path.basename(originalName, extension);
  
  return `${prefix || ''}${name}_${timestamp}_${random}${extension}`;
}

/**
 * Obtiene el tamaño de un archivo en formato legible
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Verifica si un archivo es de imagen
 */
export function isImageFile(filePath: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const extension = path.extname(filePath).toLowerCase();
  return imageExtensions.includes(extension);
}

/**
 * Verifica si un archivo es de audio
 */
export function isAudioFile(filePath: string): boolean {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.opus'];
  const extension = path.extname(filePath).toLowerCase();
  return audioExtensions.includes(extension);
}

/**
 * Verifica si un archivo es de video
 */
export function isVideoFile(filePath: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv'];
  const extension = path.extname(filePath).toLowerCase();
  return videoExtensions.includes(extension);
}

/**
 * Verifica si un archivo es un modelo 3D
 */
export function is3DModelFile(filePath: string): boolean {
  const modelExtensions = ['.glb', '.gltf', '.fbx', '.obj', '.dae', '.ply'];
  const extension = path.extname(filePath).toLowerCase();
  return modelExtensions.includes(extension);
} 