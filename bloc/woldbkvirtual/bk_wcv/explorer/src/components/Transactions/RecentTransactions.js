import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { ArrowsRightLeftIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useBlockchain } from '../../contexts/BlockchainContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const RecentTransactions = () => {
  const { getTransactionInfo, formatHash, formatAddress, formatETH, formatWCV } = useBlockchain();

  // Obtener transacciones recientes
  const { data: transactions, isLoading } = useQuery(
    'recentTransactions',
    async () => {
      // En una implementación real, esto vendría de la API
      // Por ahora, simulamos algunas transacciones
      const mockTransactions = [
        {
          hash: '0x1234567890abcdef1234567890abcdef12345678',
          from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
          value: '1000000000000000000', // 1 ETH
          gasUsed: '21000',
          gasPrice: '1000000000',
          blockNumber: '12345',
          timestamp: Math.floor(Date.now() / 1000) - 300,
          type: 'transfer'
        },
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef12',
          from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b8',
          to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9',
          value: '500000000000000000', // 0.5 ETH
          gasUsed: '21000',
          gasPrice: '1000000000',
          blockNumber: '12344',
          timestamp: Math.floor(Date.now() / 1000) - 600,
          type: 'transfer'
        },
        {
          hash: '0x567890abcdef1234567890abcdef1234567890ab',
          from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8ba',
          to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8bb',
          value: '2000000000000000000', // 2 ETH
          gasUsed: '21000',
          gasPrice: '1000000000',
          blockNumber: '12343',
          timestamp: Math.floor(Date.now() / 1000) - 900,
          type: 'transfer'
        }
      ];
      
      return mockTransactions;
    },
    {
      refetchInterval: 5000, // Actualizar cada 5 segundos
    }
  );

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'transfer':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'contract':
        return <ArrowsRightLeftIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <ArrowsRightLeftIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionType = (type) => {
    switch (type) {
      case 'transfer':
        return { label: 'Transferencia', color: 'text-green-400' };
      case 'contract':
        return { label: 'Contrato', color: 'text-blue-400' };
      default:
        return { label: 'Otro', color: 'text-gray-400' };
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Transacciones Recientes</h2>
          <ArrowsRightLeftIcon className="h-6 w-6 text-green-500" />
        </div>
        <LoadingSpinner text="Cargando transacciones..." />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Transacciones Recientes</h2>
        <Link 
          to="/transactions" 
          className="text-green-500 hover:text-green-400 text-sm font-medium"
        >
          Ver todas
        </Link>
      </div>
      
      <div className="space-y-3">
        {transactions?.map((tx, index) => {
          const txType = getTransactionType(tx.type);
          
          return (
            <motion.div
              key={tx.hash}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  {getTransactionIcon(tx.type)}
                </div>
                <div>
                  <Link 
                    to={`/tx/${tx.hash}`}
                    className="text-white hover:text-green-400 font-medium"
                  >
                    {formatHash(tx.hash)}
                  </Link>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className={txType.color}>{txType.label}</span>
                    <span>De: {formatAddress(tx.from)}</span>
                    <span>A: {formatAddress(tx.to)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white font-medium">
                  {formatETH(tx.value)}
                </div>
                <div className="text-xs text-gray-500">
                  Bloque #{tx.blockNumber}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentTransactions; 