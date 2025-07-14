import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import toast from 'react-hot-toast';

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState(null);
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [bridgeInfo, setBridgeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuración de la API
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Función para conectar a la blockchain
  const connectToBlockchain = async () => {
    try {
      setLoading(true);
      setError(null);

      // Crear provider
      const newProvider = new ethers.JsonRpcProvider(API_BASE_URL);
      setProvider(newProvider);

      // Obtener información de la red
      const networkInfo = await newProvider.getNetwork();
      setNetwork(networkInfo);

      // Verificar conexión
      const blockNumber = await newProvider.getBlockNumber();
      console.log('Conectado a la blockchain. Block actual:', blockNumber);

      setIsConnected(true);
      toast.success('Conectado a la blockchain WCV');

    } catch (error) {
      console.error('Error conectando a la blockchain:', error);
      setError('No se pudo conectar a la blockchain');
      toast.error('Error conectando a la blockchain');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener información de la blockchain
  const fetchBlockchainInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/info`);
      setBlockchainInfo(response.data);
    } catch (error) {
      console.error('Error obteniendo información de blockchain:', error);
    }
  };

  // Función para obtener información del token
  const fetchTokenInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/token/info`);
      setTokenInfo(response.data);
    } catch (error) {
      console.error('Error obteniendo información del token:', error);
    }
  };

  // Función para obtener información del bridge
  const fetchBridgeInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bridge/info`);
      setBridgeInfo(response.data);
    } catch (error) {
      console.error('Error obteniendo información del bridge:', error);
    }
  };

  // Función para obtener información de un bloque
  const getBlockInfo = async (blockNumber) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/block/${blockNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo información del bloque:', error);
      throw error;
    }
  };

  // Función para obtener información de una transacción
  const getTransactionInfo = async (txHash) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/tx/${txHash}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo información de la transacción:', error);
      throw error;
    }
  };

  // Función para obtener balance de una dirección
  const getAddressBalance = async (address) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/balance/${address}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo balance de la dirección:', error);
      throw error;
    }
  };

  // Función para obtener balance de token de una dirección
  const getTokenBalance = async (address) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/token/balance/${address}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo balance del token:', error);
      throw error;
    }
  };

  // Función para obtener estadísticas de la red
  const getNetworkStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/stats`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de la red:', error);
      throw error;
    }
  };

  // Función para obtener transacciones pendientes
  const getPendingTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/pending`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo transacciones pendientes:', error);
      throw error;
    }
  };

  // Función para buscar por hash o dirección
  const searchByHash = async (hash) => {
    try {
      // Intentar como transacción
      try {
        const txInfo = await getTransactionInfo(hash);
        return { type: 'transaction', data: txInfo };
      } catch (txError) {
        // Si no es transacción, intentar como bloque
        try {
          const blockInfo = await getBlockInfo(hash);
          return { type: 'block', data: blockInfo };
        } catch (blockError) {
          // Si no es bloque, intentar como dirección
          try {
            const addressInfo = await getAddressBalance(hash);
            return { type: 'address', data: addressInfo };
          } catch (addressError) {
            throw new Error('Hash no encontrado');
          }
        }
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      throw error;
    }
  };

  // Función para formatear direcciones
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Función para formatear hashes
  const formatHash = (hash) => {
    if (!hash) return '';
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  // Función para formatear números grandes
  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(2) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(2) + 'K';
    }
    return number.toString();
  };

  // Función para formatear fechas
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('es-ES');
  };

  // Función para formatear WCV
  const formatWCV = (amount, decimals = 3) => {
    if (!amount) return '0 WCV';
    const formatted = ethers.formatUnits(amount, decimals);
    return `${parseFloat(formatted).toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} WCV`;
  };

  // Función para formatear ETH
  const formatETH = (amount) => {
    if (!amount) return '0 ETH';
    const formatted = ethers.formatEther(amount);
    return `${parseFloat(formatted).toFixed(6)} ETH`;
  };

  // Efecto para conectar automáticamente
  useEffect(() => {
    connectToBlockchain();
  }, []);

  // Efecto para obtener información inicial
  useEffect(() => {
    if (isConnected) {
      fetchBlockchainInfo();
      fetchTokenInfo();
      fetchBridgeInfo();
    }
  }, [isConnected]);

  // Efecto para actualizar información periódicamente
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      fetchBlockchainInfo();
    }, 10000); // Actualizar cada 10 segundos

    return () => clearInterval(interval);
  }, [isConnected]);

  const value = {
    // Estado
    isConnected,
    provider,
    network,
    blockchainInfo,
    tokenInfo,
    bridgeInfo,
    loading,
    error,

    // Funciones de conexión
    connectToBlockchain,

    // Funciones de datos
    fetchBlockchainInfo,
    fetchTokenInfo,
    fetchBridgeInfo,
    getBlockInfo,
    getTransactionInfo,
    getAddressBalance,
    getTokenBalance,
    getNetworkStats,
    getPendingTransactions,
    searchByHash,

    // Funciones de utilidad
    formatAddress,
    formatHash,
    formatNumber,
    formatDate,
    formatWCV,
    formatETH,

    // Configuración
    API_BASE_URL,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}; 