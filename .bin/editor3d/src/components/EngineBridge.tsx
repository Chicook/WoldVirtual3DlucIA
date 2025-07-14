/**
 * EngineBridge.tsx - Puente entre el Motor 3D y el Viewport
 * Conecta el sistema de motor con la interfaz de usuario existente
 * 
 * Líneas: 1-250 (Primera instancia)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEngine } from './EngineConnector';
import { engineCore } from '../core/engine/EngineCore';
import { advancedEngineCore } from '../core/engine/EngineCore.2';

// Tipos para el puente
interface EngineBridgeProps {
  children: React.ReactNode;
  viewportRef?: React.RefObject<HTMLDivElement>;
  onEngineReady?: () => void;
  onConnectionError?: (error: string) => void;
}

interface BridgeState {
  isConnecting: boolean;
  isConnected: boolean;
  lastError: string | null;
  connectionAttempts: number;
  maxAttempts: number;
}

export const EngineBridge: React.FC<EngineBridgeProps> = ({
  children,
  viewportRef,
  onEngineReady,
  onConnectionError
}) => {
  const { engineState, connect, disconnect, reconnect } = useEngine();
  const [bridgeState, setBridgeState] = useState<BridgeState>({
    isConnecting: false,
    isConnected: false,
    lastError: null,
    connectionAttempts: 0,
    maxAttempts: 5
  });

  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastConnectionAttemptRef = useRef(0);

  // Configurar el motor para el editor 3D
  useEffect(() => {
    // Configuración específica para el editor
    engineCore.updateConfig({
      url: 'localhost',
      port: 8080,
      protocol: 'ws',
      timeout: 10000, // 10 segundos
      maxRetries: 3,
      retryDelay: 2000,
      autoReconnect: true
    });

    // Intentar conexión inicial
    attemptConnection();
  }, []);

  // Función para intentar conexión
  const attemptConnection = useCallback(async () => {
    if (bridgeState.isConnecting || bridgeState.isConnected) {
      return;
    }

    setBridgeState(prev => ({
      ...prev,
      isConnecting: true,
      lastError: null
    }));

    try {
      await connect();
      setBridgeState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        connectionAttempts: 0
      }));
      
      onEngineReady?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setBridgeState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        lastError: errorMessage,
        connectionAttempts: prev.connectionAttempts + 1
      }));

      onConnectionError?.(errorMessage);

      // Intentar reconexión automática si no se ha alcanzado el máximo
      if (bridgeState.connectionAttempts < bridgeState.maxAttempts) {
        scheduleReconnect();
      }
    }
  }, [connect, bridgeState.isConnecting, bridgeState.isConnected, bridgeState.connectionAttempts, bridgeState.maxAttempts, onEngineReady, onConnectionError]);

  // Programar reconexión con backoff exponencial
  const scheduleReconnect = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    const delay = Math.pow(2, bridgeState.connectionAttempts) * 1000;
    const now = Date.now();

    // Evitar reconexiones demasiado frecuentes
    if (now - lastConnectionAttemptRef.current < 1000) {
      return;
    }

    lastConnectionAttemptRef.current = now;

    connectionTimeoutRef.current = setTimeout(() => {
      attemptConnection();
    }, delay);
  }, [bridgeState.connectionAttempts, attemptConnection]);

  // Manejar cambios de estado del motor
  useEffect(() => {
    const handleStateChange = (newState: any, oldState: any) => {
      if (newState.connected !== oldState.connected) {
        setBridgeState(prev => ({
          ...prev,
          isConnected: newState.connected,
          isConnecting: newState.status === 'connecting'
        }));

        if (newState.connected) {
          onEngineReady?.();
        }
      }
    };

    const handleError = (error: string) => {
      setBridgeState(prev => ({
        ...prev,
        lastError: error
      }));
      onConnectionError?.(error);
    };

    const handleReconnecting = (attempt: number, delay: number) => {
      setBridgeState(prev => ({
        ...prev,
        isConnecting: true,
        connectionAttempts: attempt
      }));
    };

    // Suscribirse a eventos del motor
    engineCore.on('stateChanged', handleStateChange);
    engineCore.on('error', handleError);
    engineCore.on('reconnecting', handleReconnecting);

    return () => {
      engineCore.removeAllListeners();
    };
  }, [onEngineReady, onConnectionError]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
      }
    };
  }, []);

  // Función para reconectar manualmente
  const handleManualReconnect = useCallback(async () => {
    if (bridgeState.isConnecting) return;

    setBridgeState(prev => ({
      ...prev,
      connectionAttempts: 0
    }));

    await attemptConnection();
  }, [bridgeState.isConnecting, attemptConnection]);

  // Función para desconectar manualmente
  const handleManualDisconnect = useCallback(() => {
    disconnect();
    setBridgeState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false
    }));
  }, [disconnect]);

  // Renderizar estado de conexión
  const renderConnectionStatus = () => {
    if (bridgeState.isConnecting) {
      return (
        <div className="fixed top-4 right-4 z-50 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Conectando al motor 3D...</span>
          </div>
        </div>
      );
    }

    if (!bridgeState.isConnected) {
      return (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>Motor 3D desconectado</span>
            <button
              onClick={handleManualReconnect}
              className="ml-2 px-2 py-1 bg-white text-red-600 rounded text-xs hover:bg-gray-100"
            >
              Reconectar
            </button>
          </div>
          {bridgeState.lastError && (
            <div className="text-xs mt-1 opacity-75">
              Error: {bridgeState.lastError}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Motor 3D conectado</span>
          <button
            onClick={handleManualDisconnect}
            className="ml-2 px-2 py-1 bg-white text-green-600 rounded text-xs hover:bg-gray-100"
          >
            Desconectar
          </button>
        </div>
        {engineState.performance.fps > 0 && (
          <div className="text-xs mt-1 opacity-75">
            {engineState.performance.fps} FPS
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {renderConnectionStatus()}
      {children}
    </>
  );
};

// Hook personalizado para usar el puente
export const useEngineBridge = () => {
  const { engineState, isConnected, isConnecting } = useEngine();
  
  return {
    engineState,
    isConnected,
    isConnecting,
    canRender: isConnected && engineState.status === 'connected'
  };
};

// Componente de diagnóstico del motor
export const EngineDiagnostics: React.FC = () => {
  const { engineState, isConnected } = useEngine();
  const [showDetails, setShowDetails] = useState(false);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Diagnóstico del Motor</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-gray-400 hover:text-white"
        >
          {showDetails ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Estado:</span>
          <span className={engineState.status === 'connected' ? 'text-green-400' : 'text-red-400'}>
            {engineState.status}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Motor:</span>
          <span>{engineState.engine}</span>
        </div>

        {engineState.performance.fps > 0 && (
          <div className="flex justify-between">
            <span>FPS:</span>
            <span className={engineState.performance.fps < 30 ? 'text-yellow-400' : 'text-green-400'}>
              {engineState.performance.fps}
            </span>
          </div>
        )}

        {engineState.performance.memory > 0 && (
          <div className="flex justify-between">
            <span>Memoria:</span>
            <span>{(engineState.performance.memory / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        )}

        {showDetails && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="flex justify-between">
              <span>Modelos:</span>
              <span>{engineState.resources.models}</span>
            </div>
            <div className="flex justify-between">
              <span>Texturas:</span>
              <span>{engineState.resources.textures}</span>
            </div>
            <div className="flex justify-between">
              <span>Animaciones:</span>
              <span>{engineState.resources.animations}</span>
            </div>
            
            {engineState.errors.length > 0 && (
              <div className="mt-2">
                <span className="text-red-400">Errores:</span>
                <ul className="text-xs text-red-300 mt-1">
                  {engineState.errors.slice(-3).map((error, index) => (
                    <li key={index} className="truncate">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EngineBridge; 