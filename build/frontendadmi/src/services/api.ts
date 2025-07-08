import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'react-hot-toast'

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Interceptor para agregar token de autenticación
const authInterceptor = (config: AxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    }
  }
  return config
}

// Interceptor para manejar respuestas
const responseInterceptor = (response: AxiosResponse) => {
  return response
}

// Interceptor para manejar errores
const errorInterceptor = (error: any) => {
  if (error.response) {
    const { status, data } = error.response
    
    switch (status) {
      case 401:
        // Token expirado o inválido
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        break
      
      case 403:
        toast.error('No tienes permisos para realizar esta acción.')
        break
      
      case 404:
        toast.error('Recurso no encontrado.')
        break
      
      case 422:
        // Errores de validación
        if (data.details) {
          const errors = Array.isArray(data.details) 
            ? data.details.join(', ')
            : data.details
          toast.error(`Error de validación: ${errors}`)
        } else {
          toast.error(data.message || 'Error de validación')
        }
        break
      
      case 429:
        toast.error('Demasiadas requests. Intenta de nuevo más tarde.')
        break
      
      case 500:
        toast.error('Error interno del servidor. Contacta al administrador.')
        break
      
      default:
        toast.error(data.message || 'Error inesperado')
    }
  } else if (error.request) {
    toast.error('No se pudo conectar con el servidor.')
  } else {
    toast.error('Error de configuración de la request.')
  }
  
  return Promise.reject(error)
}

// Crear instancia de axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Agregar interceptores
api.interceptors.request.use(authInterceptor)
api.interceptors.response.use(responseInterceptor, errorInterceptor)

// Tipos de respuesta comunes
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Funciones helper para requests
export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.get<ApiResponse<T>>(url, config)
  return response.data.data
}

export const apiPost = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.post<ApiResponse<T>>(url, data, config)
  return response.data.data
}

export const apiPut = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.put<ApiResponse<T>>(url, data, config)
  return response.data.data
}

export const apiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.delete<ApiResponse<T>>(url, config)
  return response.data.data
}

export const apiPatch = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.patch<ApiResponse<T>>(url, data, config)
  return response.data.data
}

// Función para subir archivos
export const apiUpload = async <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post<ApiResponse<T>>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  })
  
  return response.data.data
}

// Función para descargar archivos
export const apiDownload = async (url: string, filename?: string): Promise<void> => {
  const response = await api.get(url, {
    responseType: 'blob',
  })
  
  const blob = new Blob([response.data])
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}

// Función para obtener datos paginados
export const apiGetPaginated = async <T>(url: string, params?: any): Promise<PaginatedResponse<T>> => {
  const response = await api.get<PaginatedResponse<T>>(url, { params })
  return response.data
}

// Función para hacer requests con retry
export const apiWithRetry = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error: any) {
      lastError = error
      
      // No reintentar en errores de cliente (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }
  
  throw lastError
}

// Función para cancelar requests
export const createCancelToken = () => {
  return axios.CancelToken.source()
}

// Función para verificar si un error es de cancelación
export const isCancelError = (error: any): boolean => {
  return axios.isCancel(error)
}

export default api 