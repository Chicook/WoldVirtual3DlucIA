/**
 * Configuración para deshabilitar MetaMask en desarrollo
 * Evita errores de conexión cuando MetaMask no está disponible
 */

// Deshabilitar MetaMask en desarrollo
if (process.env.NODE_ENV === 'development') {
  // Mock de window.ethereum para evitar errores
  if (typeof window !== 'undefined' && !window.ethereum) {
    window.ethereum = {
      isMetaMask: false,
      request: () => Promise.reject(new Error('MetaMask not available in development')),
      on: () => {},
      removeListener: () => {},
      isConnected: () => false
    };
  }
  
  // Deshabilitar mensajes de error de MetaMask
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('MetaMask')) {
      return; // No mostrar errores de MetaMask en desarrollo
    }
    originalError.apply(console, args);
  };
}

export default {}; 