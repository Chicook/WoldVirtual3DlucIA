import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  walletAddress?: string;
  token: string;
  isPremium: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Verificar token almacenado al cargar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Verificar estado de autenticación
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('metaverso_token');
      
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        // Token inválido, limpiar
        localStorage.removeItem('metaverso_token');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Error de conexión'
      });
    }
  }, []);

  // Iniciar sesión
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error de inicio de sesión');
      }

      const { user, token } = await response.json();
      
      // Guardar token
      localStorage.setItem('metaverso_token', token);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Registrarse
  const register = useCallback(async (userData: {
    username: string;
    email: string;
    password: string;
    avatar?: string;
  }): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error de registro');
      }

      const { user, token } = await response.json();
      
      // Guardar token
      localStorage.setItem('metaverso_token', token);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Cerrar sesión
  const logout = useCallback(() => {
    localStorage.removeItem('metaverso_token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }, []);

  // Conectar wallet
  const connectWallet = useCallback(async (): Promise<string> => {
    if (!authState.user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      // Verificar si MetaMask está disponible
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask no está instalado');
      }

      // Solicitar conexión
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const walletAddress = accounts[0];

      // Actualizar usuario con dirección de wallet
      const response = await fetch('/api/auth/connect-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.user.token}`
        },
        body: JSON.stringify({ walletAddress })
      });

      if (!response.ok) {
        throw new Error('Error conectando wallet');
      }

      const updatedUser = await response.json();
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));

      return walletAddress;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    }
  }, [authState.user]);

  // Actualizar perfil
  const updateProfile = useCallback(async (updates: Partial<User>): Promise<User> => {
    if (!authState.user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.user.token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Error actualizando perfil');
      }

      const updatedUser = await response.json();
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));

      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    }
  }, [authState.user]);

  // Cambiar contraseña
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!authState.user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.user.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        throw new Error('Error cambiando contraseña');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    }
  }, [authState.user]);

  // Solicitar restablecimiento de contraseña
  const requestPasswordReset = useCallback(async (email: string): Promise<void> => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Error solicitando restablecimiento');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Restablecer contraseña
  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<void> => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      if (!response.ok) {
        throw new Error('Error restableciendo contraseña');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Verificar si el usuario es premium
  const isPremium = useCallback(() => {
    return authState.user?.isPremium || false;
  }, [authState.user]);

  // Limpiar error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Estado
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    
    // Acciones
    login,
    register,
    logout,
    connectWallet,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    clearError,
    
    // Utilidades
    isPremium
  };
}; 