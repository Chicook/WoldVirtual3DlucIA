import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaExchangeAlt, 
  FaClock, 
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
  FaExternalLinkAlt,
  FaArrowRight
} from 'react-icons/fa';
import { useBlockchain } from '../contexts/BlockchainContext';
import { formatNumber, formatAddress, formatTimestamp } from '../utils/formatters';
import { toast } from 'react-hot-toast';

const BridgePage = () => {
  const { provider } = useBlockchain();
  const [bridgeData, setBridgeData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos simulados del bridge
  const BRIDGE_DATA = {
    name: 'WCV Bridge',
    description: 'Bridge para transferir tokens WCV entre diferentes blockchains',
    supportedChains: [
      { name: 'WCV Chain', symbol: 'WCV', icon: '🔗' },
      { name: 'Binance Smart Chain', symbol: 'BSC', icon: '🟡' },
      { name: 'Ethereum', symbol: 'ETH', icon: '🔷' },
      { name: 'Polygon', symbol: 'MATIC', icon: '🟣' }
    ],
    stats: {
      totalVolume: '15000000', // 15M WCV
      totalTransactions: 1250,
      activeUsers: 450,
      averageTime: '5-10 minutos'
    }
  };

  useEffect(() => {
    const fetchBridgeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simular transacciones del bridge
        const mockTransactions = Array.from({ length: 20 }, (_, i) => ({
          id: `bridge-${i + 1}`,
          fromChain: BRIDGE_DATA.supportedChains[Math.floor(Math.random() * 2)].name,
          toChain: BRIDGE_DATA.supportedChains[Math.floor(Math.random() * 2) + 2].name,
          amount: Math.random() * 10000 + 100,
          status: Math.random() > 0.1 ? 'completed' : 'pending',
          timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
          userAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`
        }));

        setTransactions(mockTransactions.sort((a, b) => b.timestamp - a.timestamp));
        setBridgeData(BRIDGE_DATA);
      } catch (err) {
        console.error('Error fetching bridge data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBridgeData();
  }, [provider]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-96"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-red-400 text-xl mb-4">Error al cargar datos del bridge</div>
        <div className="text-gray-400">{error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <FaExchangeAlt className="text-3xl text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">{bridgeData.name}</h1>
            <p className="text-gray-400">{bridgeData.description}</p>
          </div>
        </div>
      </div>

      {/* Bridge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Volume */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaExchangeAlt className="text-green-500" />
            <h3 className="text-lg font-semibold text-white">Volumen Total</h3>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {formatNumber(parseFloat(bridgeData.stats.totalVolume) / 1e18)} WCV
          </div>
        </motion.div>

        {/* Total Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaExchangeAlt className="text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Transacciones</h3>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {formatNumber(bridgeData.stats.totalTransactions)}
          </div>
        </motion.div>

        {/* Active Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaExchangeAlt className="text-purple-500" />
            <h3 className="text-lg font-semibold text-white">Usuarios Activos</h3>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {formatNumber(bridgeData.stats.activeUsers)}
          </div>
        </motion.div>

        {/* Average Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaClock className="text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Tiempo Promedio</h3>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {bridgeData.stats.averageTime}
          </div>
        </motion.div>
      </div>

      {/* Supported Chains */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Blockchains Soportadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bridgeData.supportedChains.map((chain, index) => (
            <div
              key={index}
              className="bg-gray-900 p-4 rounded border border-gray-600 hover:border-gray-500 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{chain.icon}</span>
                <div>
                  <h4 className="text-white font-medium">{chain.name}</h4>
                  <p className="text-gray-400 text-sm">{chain.symbol}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bridge Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Transferir Tokens</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* From Chain */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Desde
            </label>
            <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
              {bridgeData.supportedChains.map((chain, index) => (
                <option key={index} value={chain.symbol}>
                  {chain.name} ({chain.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* To Chain */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hacia
            </label>
            <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
              {bridgeData.supportedChains.map((chain, index) => (
                <option key={index} value={chain.symbol}>
                  {chain.name} ({chain.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cantidad WCV
            </label>
            <input
              type="number"
              placeholder="0.0"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dirección Destino
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Bridge Button */}
        <div className="mt-6">
          <button className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Iniciar Transferencia
          </button>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
      >
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">
            Transacciones Recientes ({transactions.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-700">
          {transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="px-6 py-4 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.status === 'completed' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {tx.status === 'completed' ? (
                      <FaCheckCircle className="text-sm" />
                    ) : (
                      <FaClock className="text-sm" />
                    )}
                  </div>

                  {/* Transaction Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-300">{tx.fromChain}</span>
                      <FaArrowRight className="text-xs text-gray-500" />
                      <span className="text-sm text-gray-300">{tx.toChain}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {tx.amount.toFixed(2)} WCV • {formatTimestamp(tx.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(tx.txHash)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaCopy className="text-sm" />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <FaExternalLinkAlt className="text-sm" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bridge Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Información del Bridge</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Cómo funciona</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• Conecta múltiples blockchains</li>
              <li>• Transferencias seguras y rápidas</li>
              <li>• Liquidez garantizada</li>
              <li>• Verificación automática</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Seguridad</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• Contratos auditados</li>
              <li>• Validadores descentralizados</li>
              <li>• Time-locks de seguridad</li>
              <li>• Monitoreo 24/7</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BridgePage; 