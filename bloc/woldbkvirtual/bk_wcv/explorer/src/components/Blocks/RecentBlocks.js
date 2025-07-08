import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { CubeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useBlockchain } from '../../contexts/BlockchainContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const RecentBlocks = () => {
  const { getBlockInfo, formatHash, formatDate, formatNumber } = useBlockchain();

  // Obtener los últimos 10 bloques
  const { data: blocks, isLoading } = useQuery(
    'recentBlocks',
    async () => {
      const latestBlock = await getBlockInfo('latest');
      const blockNumber = parseInt(latestBlock.number);
      
      const recentBlocks = [];
      for (let i = 0; i < 10; i++) {
        try {
          const block = await getBlockInfo(blockNumber - i);
          recentBlocks.push(block);
        } catch (error) {
          console.error(`Error obteniendo bloque ${blockNumber - i}:`, error);
        }
      }
      return recentBlocks;
    },
    {
      refetchInterval: 10000, // Actualizar cada 10 segundos
    }
  );

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Bloques Recientes</h2>
          <CubeIcon className="h-6 w-6 text-blue-500" />
        </div>
        <LoadingSpinner text="Cargando bloques..." />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Bloques Recientes</h2>
        <Link 
          to="/blocks" 
          className="text-blue-500 hover:text-blue-400 text-sm font-medium"
        >
          Ver todos
        </Link>
      </div>
      
      <div className="space-y-3">
        {blocks?.map((block, index) => (
          <motion.div
            key={block.hash}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CubeIcon className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <Link 
                  to={`/block/${block.number}`}
                  className="text-white hover:text-blue-400 font-medium"
                >
                  Bloque #{block.number}
                </Link>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>{formatHash(block.hash)}</span>
                  <span>{formatNumber(block.transactions?.length || 0)} txs</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">
                {formatDate(block.timestamp)}
              </div>
              <div className="text-xs text-gray-500">
                {block.gasUsed} gas
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentBlocks; 