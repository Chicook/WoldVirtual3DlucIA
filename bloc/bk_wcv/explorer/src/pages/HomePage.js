import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  CubeIcon, 
  ArrowsRightLeftIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
  FireIcon
} from '@heroicons/react/24/outline';

import { useBlockchain } from '../contexts/BlockchainContext';
import StatCard from '../components/UI/StatCard';
import RecentBlocks from '../components/Blocks/RecentBlocks';
import RecentTransactions from '../components/Transactions/RecentTransactions';
import TokenStats from '../components/Token/TokenStats';
import NetworkChart from '../components/Charts/NetworkChart';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const HomePage = () => {
  const { 
    isConnected, 
    blockchainInfo, 
    tokenInfo, 
    getNetworkStats, 
    getPendingTransactions,
    formatNumber,
    formatWCV,
    formatETH
  } = useBlockchain();

  // Queries para datos en tiempo real
  const { data: networkStats, isLoading: statsLoading } = useQuery(
    'networkStats',
    getNetworkStats,
    {
      refetchInterval: 10000, // Actualizar cada 10 segundos
      enabled: isConnected,
    }
  );

  const { data: pendingTxs, isLoading: pendingLoading } = useQuery(
    'pendingTransactions',
    getPendingTransactions,
    {
      refetchInterval: 5000, // Actualizar cada 5 segundos
      enabled: isConnected,
    }
  );

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Conectando a la blockchain WCV...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>WoldPBVirtual - Explorador de Bloques WCV</title>
        <meta name="description" content="Dashboard del explorador de bloques WCV - Estadísticas en tiempo real, bloques recientes y transacciones" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            WoldPBVirtual Explorer
          </h1>
          <p className="text-gray-400 text-lg">
            Explorador de bloques para la blockchain WCV
          </p>
        </motion.div>

        {/* Estadísticas principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Bloque Actual"
            value={blockchainInfo?.latestBlock || '0'}
            icon={CubeIcon}
            color="blue"
            loading={!blockchainInfo}
          />
          <StatCard
            title="Transacciones Totales"
            value={formatNumber(networkStats?.totalTransactions || 0)}
            icon={ArrowsRightLeftIcon}
            color="green"
            loading={statsLoading}
          />
          <StatCard
            title="Supply WCV"
            value={formatWCV(tokenInfo?.totalSupply || 0)}
            icon={CurrencyDollarIcon}
            color="purple"
            loading={!tokenInfo}
          />
          <StatCard
            title="Transacciones Pendientes"
            value={formatNumber(pendingTxs?.length || 0)}
            icon={ClockIcon}
            color="yellow"
            loading={pendingLoading}
          />
        </motion.div>

        {/* Gráficos y estadísticas detalladas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Gráfico de red */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Actividad de Red</h2>
              <ChartBarIcon className="h-6 w-6 text-blue-500" />
            </div>
            <NetworkChart />
          </div>

          {/* Estadísticas del token */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Token WCV</h2>
              <CurrencyDollarIcon className="h-6 w-6 text-purple-500" />
            </div>
            <TokenStats />
          </div>
        </motion.div>

        {/* Información de red */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Información de Red</h2>
            <FireIcon className="h-6 w-6 text-orange-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Configuración de Red</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nombre:</span>
                  <span className="text-white">WCV Local</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chain ID:</span>
                  <span className="text-white">31337</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Símbolo:</span>
                  <span className="text-white">WCV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Decimales:</span>
                  <span className="text-white">3</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Estadísticas de Red</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tiempo de Bloque:</span>
                  <span className="text-white">~12 seg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gas Limit:</span>
                  <span className="text-white">30,000,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gas Price:</span>
                  <span className="text-white">1 Gwei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado:</span>
                  <span className="text-green-500">Activo</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Información del Bridge</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado:</span>
                  <span className="text-green-500">Operativo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Red Destino:</span>
                  <span className="text-white">BSC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee:</span>
                  <span className="text-white">0.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tiempo:</span>
                  <span className="text-white">~5 min</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bloques y transacciones recientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <RecentBlocks />
          <RecentTransactions />
        </motion.div>
      </div>
    </>
  );
};

export default HomePage; 