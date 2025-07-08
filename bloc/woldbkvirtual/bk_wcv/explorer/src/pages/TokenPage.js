import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCoins, 
  FaChartLine, 
  FaUsers, 
  FaExchangeAlt,
  FaCopy,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBlockchain } from '../contexts/BlockchainContext';
import { formatNumber, formatAddress } from '../utils/formatters';
import { toast } from 'react-hot-toast';

const TokenPage = () => {
  const { provider } = useBlockchain();
  const [tokenData, setTokenData] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos del token WCV (simulados - en producción vendrían de contratos reales)
  const WCV_TOKEN_DATA = {
    name: 'WoldCoin Virtual',
    symbol: 'WCV',
    totalSupply: '30000000', // 30,000,000 WCV con 3 decimales
    decimals: 3,
    contractAddress: '0x1234567890123456789012345678901234567890', // Dirección simulada
    description: 'Token nativo de la blockchain WCV, utilizado para transacciones, staking y gobernanza en el metaverso.',
    features: [
      'Token nativo de la blockchain',
      'Utilizado para transacciones',
      'Staking y recompensas',
      'Gobernanza del metaverso',
      '3 decimales para formato en metaverso'
    ]
  };

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simular datos de precio (en producción vendrían de APIs reales)
        const mockPriceData = Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          price: 0.5 + Math.random() * 0.5, // Precio entre 0.5 y 1.0
          volume: Math.random() * 1000000 + 500000 // Volumen entre 500k y 1.5M
        }));

        setPriceData(mockPriceData);
        setTokenData(WCV_TOKEN_DATA);
      } catch (err) {
        console.error('Error fetching token data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
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
        <div className="text-red-400 text-xl mb-4">Error al cargar datos del token</div>
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
          <FaCoins className="text-3xl text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">{tokenData.name}</h1>
            <p className="text-gray-400">Información del token WCV</p>
          </div>
        </div>
      </div>

      {/* Token Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Supply */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaCoins className="text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Supply Total</h3>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {formatNumber(parseFloat(tokenData.totalSupply))} WCV
          </div>
        </motion.div>

        {/* Current Price */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaChartLine className="text-green-500" />
            <h3 className="text-lg font-semibold text-white">Precio Actual</h3>
          </div>
          <div className="text-2xl font-bold text-green-400">
            $0.75 USD
          </div>
        </motion.div>

        {/* Market Cap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaUsers className="text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Market Cap</h3>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            $22.5M USD
          </div>
        </motion.div>

        {/* 24h Volume */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaExchangeAlt className="text-purple-500" />
            <h3 className="text-lg font-semibold text-white">Volumen 24h</h3>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            $1.2M USD
          </div>
        </motion.div>
      </div>

      {/* Contract Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Dirección del Contrato</h3>
          <button
            onClick={() => copyToClipboard(tokenData.contractAddress)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
          >
            <FaCopy className="text-sm" />
            Copiar
          </button>
        </div>
        <div className="bg-gray-900 p-4 rounded border border-gray-600">
          <code className="text-sm text-gray-300 break-all">{tokenData.contractAddress}</code>
        </div>
      </motion.div>

      {/* Price Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Precio Últimos 30 Días</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Precio']}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Token Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Descripción</h3>
          <p className="text-gray-300 leading-relaxed mb-6">
            {tokenData.description}
          </p>
          
          <h4 className="text-lg font-semibold text-white mb-3">Características</h4>
          <ul className="space-y-2">
            {tokenData.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {feature}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Detalles Técnicos</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Símbolo</span>
              <span className="text-white font-medium">{tokenData.symbol}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Decimales</span>
              <span className="text-white font-medium">3</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Supply Total</span>
              <span className="text-white font-medium">
                {formatNumber(parseFloat(tokenData.totalSupply))} WCV
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Formato Metaverso</span>
              <span className="text-white font-medium">3 decimales (0.000 WCV)</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Blockchain</span>
              <span className="text-white font-medium">WCV (Binance Smart Chain)</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Estándar</span>
              <span className="text-white font-medium">ERC-20</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex justify-center items-center gap-4 mt-8 pt-8 border-t border-gray-700"
      >
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FaExternalLinkAlt />
          Ver en BSCScan
        </button>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <FaExchangeAlt />
          Comprar WCV
        </button>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <FaCoins />
          Staking
        </button>
      </motion.div>
    </motion.div>
  );
};

export default TokenPage; 