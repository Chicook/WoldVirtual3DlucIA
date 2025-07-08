import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases CSS de manera inteligente, resolviendo conflictos de Tailwind
 * @param inputs - Clases CSS a combinar
 * @returns String con las clases combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número como porcentaje
 * @param value - Valor a formatear
 * @param decimals - Número de decimales
 * @returns String formateado
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Formatea un número con separadores de miles
 * @param value - Valor a formatear
 * @returns String formateado
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-ES').format(value)
}

/**
 * Formatea bytes en formato legible
 * @param bytes - Bytes a formatear
 * @param decimals - Número de decimales
 * @returns String formateado
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Formatea una fecha en formato legible
 * @param date - Fecha a formatear
 * @returns String formateado
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

/**
 * Formatea una duración en formato legible
 * @param seconds - Segundos a formatear
 * @returns String formateado
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * Genera un ID único
 * @returns String con ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Debounce function
 * @param func - Función a debounce
 * @param wait - Tiempo de espera en ms
 * @returns Función debounced
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 * @param func - Función a throttle
 * @param limit - Límite de tiempo en ms
 * @returns Función throttled
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Capitaliza la primera letra de una cadena
 * @param str - String a capitalizar
 * @returns String capitalizado
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convierte un string a slug
 * @param str - String a convertir
 * @returns Slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Valida un email
 * @param email - Email a validar
 * @returns Boolean
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida una URL
 * @param url - URL a validar
 * @returns Boolean
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Copia texto al portapapeles
 * @param text - Texto a copiar
 * @returns Promise<boolean>
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback para navegadores antiguos
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    const result = document.execCommand('copy')
    document.body.removeChild(textArea)
    return result
  }
}

/**
 * Descarga un archivo
 * @param url - URL del archivo
 * @param filename - Nombre del archivo
 */
export function downloadFile(url: string, filename?: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Obtiene el color de contraste para un color de fondo
 * @param hexColor - Color en formato hex
 * @returns 'black' o 'white'
 */
export function getContrastColor(hexColor: string): 'black' | 'white' {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? 'black' : 'white'
}

/**
 * Genera un color aleatorio
 * @returns Color en formato hex
 */
export function generateRandomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

/**
 * Obtiene el tamaño de la ventana
 * @returns Objeto con width y height
 */
export function getWindowSize(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

/**
 * Verifica si el dispositivo es móvil
 * @returns Boolean
 */
export function isMobile(): boolean {
  return window.innerWidth < 768
}

/**
 * Verifica si el dispositivo es tablet
 * @returns Boolean
 */
export function isTablet(): boolean {
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

/**
 * Verifica si el dispositivo es desktop
 * @returns Boolean
 */
export function isDesktop(): boolean {
  return window.innerWidth >= 1024
} 