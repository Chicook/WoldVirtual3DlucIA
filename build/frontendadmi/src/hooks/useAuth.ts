import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiPost, apiGet } from '@/services/api'

// Tipos
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'developer' | 'viewer'
  permissions: string[]
  isOnline: boolean
  lastLogin?: string
  avatar?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateUser: (user: Partial<User>) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export interface AuthStore extends AuthState, AuthActions {}

// Store de autenticación
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: localStorage.getItem('auth_token'),
      isAuthenticated: !!localStorage.getItem('auth_token'),
      isLoading: false,
      error: null,

      // Acciones
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await apiPost<{ user: User; token: string }>('/api/v1/auth/login', credentials)
          
          // Guardar token
          localStorage.setItem('auth_token', response.token)
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Error al iniciar sesión'
          })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      refreshUser: async () => {
        const { token } = get()
        if (!token) return

        try {
          const user = await apiGet<User>('/api/v1/auth/me')
          set({ user })
        } catch (error) {
          // Si hay error al refrescar, hacer logout
          get().logout()
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...userData } })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Hook principal de autenticación
export const useAuth = () => {
  const store = useAuthStore()
  
  return {
    ...store,
    // Funciones helper
    hasPermission: (permission: string) => {
      return store.user?.permissions.includes(permission) || false
    },
    
    hasRole: (role: string) => {
      return store.user?.role === role
    },
    
    isAdmin: () => {
      return store.user?.role === 'admin'
    },
    
    isDeveloper: () => {
      return store.user?.role === 'developer'
    },
    
    isViewer: () => {
      return store.user?.role === 'viewer'
    }
  }
}

// Hook para proteger rutas
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth()
  
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, isLoading])
  
  return { isAuthenticated, isLoading }
}

// Hook para verificar permisos
export const useRequirePermission = (permission: string) => {
  const { hasPermission, isAuthenticated, isLoading } = useAuth()
  
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && !hasPermission(permission)) {
      // Redirigir a página de acceso denegado
      window.location.href = '/access-denied'
    }
  }, [hasPermission, isAuthenticated, isLoading, permission])
  
  return { hasPermission: hasPermission(permission), isAuthenticated, isLoading }
}

// Hook para verificar roles
export const useRequireRole = (role: string) => {
  const { hasRole, isAuthenticated, isLoading } = useAuth()
  
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRole(role)) {
      // Redirigir a página de acceso denegado
      window.location.href = '/access-denied'
    }
  }, [hasRole, isAuthenticated, isLoading, role])
  
  return { hasRole: hasRole(role), isAuthenticated, isLoading }
} 