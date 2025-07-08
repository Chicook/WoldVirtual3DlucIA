import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaUsers, 
  FaCoins,
  FaExchangeAlt,
  FaNetworkWired,
  FaServer,
  FaClock
} from 'react-icons/fa';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useBlockchain } from '../contexts/BlockchainContext';
import { formatNumber } from '../utils/formatters';

const StatsPage = () => {
  const { provider } = useBlockchain();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos simulados de estadísticas
  const STATS_DATA = {
    overview: {
      totalBlocks: 1250000,
      totalTransactions: 8500000,
      totalAddresses: 45000,
      totalSupply: '30000000000000000000000000', // 30M WCV
      averageBlockTime: '3.2 segundos',
      networkHashrate: '2.5 TH/s'
    },
    charts: {
      transactionsPerDay: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        transactions: Math.floor(Math.random() * 50000) + 20000,
        blocks: Math.floor(Math.random() * 1000) + 500
      })),
      networkGrowth: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('es', { month: 'short' }),
        addresses: Math.floor(Math.random() * 10000) + 5000,
        transactions: Math.floor(Math.random() * 500000) + 200000
      })),
      tokenDistribution: [
        { name: 'Circulación', value: 65, color: '#3B82F6' },
        { name: 'Staking', value: 20, color: '#10B981' },
        { name: 'Desarrollo', value: 10, color: '#F59E0B' },
        { name: 'Reserva', value: 5, color: '#EF4444' }
      ]
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(STATS_DATA);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [provider]);

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
        <div className="text-red-400 text-xl mb-4">Error al cargar estadísticas</div>
        <div className="text-gray-400">{error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <FaChartBar className="text-3xl text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Estadísticas de la Red</h1>
            <p className="text-gray-400">Métricas y análisis de la blockchain WCV</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Blocks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaServer className="text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Bloques Totales</h3>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {formatNumber(stats.overview.totalBlocks)}
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
            <FaExchangeAlt className="text-green-500" />
            <h3 className="text-lg font-semibold text-white">Transacciones</h3>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {formatNumber(stats.overview.totalTransactions)}
          </div>
        </motion.div>

        {/* Total Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaUsers className="text-purple-500" />
            <h3 className="text-lg font-semibold text-white">Direcciones</h3>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {formatNumber(stats.overview.totalAddresses)}
          </div>
        </motion.div>

        {/* Total Supply */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaCoins className="text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Supply Total</h3>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {formatNumber(parseFloat(stats.overview.totalSupply) / 1e18)} WCV
          </div>
        </motion.div>
      </div>

      {/* Network Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Block Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaClock className="text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Tiempo de Bloque Promedio</h3>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {stats.overview.averageBlockTime}
          </div>
        </motion.div>

        {/* Hashrate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaNetworkWired className="text-green-500" />
            <h3 className="text-lg font-semibold text-white">Hashrate de Red</h3>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {stats.overview.networkHashrate}
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Transactions per Day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Transacciones por Día</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.charts.transactionsPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value) => [formatNumber(value), 'Transacciones']}
                />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Network Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Crecimiento de la Red</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.networkGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value, name) => [
                    formatNumber(value), 
                    name === 'addresses' ? 'Direcciones' : 'Transacciones'
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="addresses" 
                  fill="#10B981" 
                  name="Direcciones"
                />
                <Bar 
                  dataKey="transactions" 
                  fill="#3B82F6" 
                  name="Transacciones"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Token Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Distribución de Tokens WCV</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts.tokenDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.charts.tokenDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value) => [`${value}%`, 'Porcentaje']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            {stats.charts.tokenDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-900 rounded border border-gray-600">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-white font-medium">{item.name}</span>
                </div>
                <span className="text-gray-300 font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Additional Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Transaction Success Rate */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-3">Tasa de Éxito</h4>
          <div className="text-3xl font-bold text-green-400 mb-2">99.8%</div>
          <p className="text-gray-400 text-sm">Transacciones exitosas</p>
        </div>

        {/* Average Gas Price */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-3">Gas Promedio</h4>
          <div className="text-3xl font-bold text-blue-400 mb-2">5.2 Gwei</div>
          <p className="text-gray-400 text-sm">Precio promedio por transacción</p>
        </div>

        {/* Network Uptime */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-3">Tiempo Activo</h4>
          <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
          <p className="text-gray-400 text-sm">Disponibilidad de la red</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatsPage; 