import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaWallet, 
  FaExchangeAlt, 
  FaCopy,
  FaExternalLinkAlt,
  FaBalanceScale,
  FaHistory,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { useBlockchain } from '../contexts/BlockchainContext';
import { formatNumber, formatAddress, formatTimestamp } from '../utils/formatters';
import { toast } from 'react-hot-toast';

const AddressPage = () => {
  const { address } = useParams();
  const { provider } = useBlockchain();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!provider) {
          throw new Error('No hay conexión a la blockchain');
        }

        // Obtener balance
        const addressBalance = await provider.getBalance(address);
        setBalance(addressBalance);

        // Obtener transacciones (simulado - en un explorador real usarías una API)
        const latestBlock = await provider.getBlockNumber();
        const txPromises = [];
        const blocksToFetch = Math.min(20, latestBlock);
        
        for (let i = 0; i < blocksToFetch; i++) {
          const blockNumber = latestBlock - i;
          txPromises.push(provider.getBlock(blockNumber, true));
        }
        
        const blocks = await Promise.all(txPromises);
        const allTransactions = blocks
          .filter(block => block && block.transactions)
          .flatMap(block => 
            block.transactions
              .filter(tx => 
                tx.from?.toLowerCase() === address.toLowerCase() || 
                tx.to?.toLowerCase() === address.toLowerCase()
              )
              .map(tx => ({
                ...tx,
                blockNumber: block.number,
                timestamp: block.timestamp
              }))
          )
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 50); // Limitar a 50 transacciones

        setTransactions(allTransactions);
      } catch (err) {
        console.error('Error fetching address data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAddressData();
  }, [address, provider]);

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
        <div className="text-red-400 text-xl mb-4">Error al cargar la dirección</div>
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
          <FaUser className="text-3xl text-green-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Dirección</h1>
            <p className="text-gray-400">Información de la dirección</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-blue-400 transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span>{formatAddress(address)}</span>
        </div>
      </div>

      {/* Address Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Dirección</h3>
          <button
            onClick={() => copyToClipboard(address)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
          >
            <FaCopy className="text-sm" />
            Copiar
          </button>
        </div>
        <div className="bg-gray-900 p-4 rounded border border-gray-600">
          <code className="text-sm text-gray-300 break-all">{address}</code>
        </div>
      </motion.div>

      {/* Balance and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaWallet className="text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Balance</h3>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {balance ? `${parseFloat(balance.toString()) / 1e18} WCV` : '0 WCV'}
          </div>
        </motion.div>

        {/* Total Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaExchangeAlt className="text-purple-500" />
            <h3 className="text-lg font-semibold text-white">Transacciones</h3>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {formatNumber(transactions.length)}
          </div>
        </motion.div>

        {/* Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaUser className="text-green-500" />
            <h3 className="text-lg font-semibold text-white">Tipo</h3>
          </div>
          <div className="text-lg text-gray-300">
            {balance && parseFloat(balance.toString()) > 0 ? 'Activa' : 'Inactiva'}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
      >
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FaHistory className="text-blue-500" />
            <h3 className="text-lg font-semibold text-white">
              Transacciones Recientes ({transactions.length})
            </h3>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="px-6 py-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Transaction Type */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.from?.toLowerCase() === address.toLowerCase() 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {tx.from?.toLowerCase() === address.toLowerCase() ? (
                        <FaArrowUp className="text-xs" />
                      ) : (
                        <FaArrowDown className="text-xs" />
                      )}
                    </div>

                    {/* Transaction Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${
                          tx.from?.toLowerCase() === address.toLowerCase() 
                            ? 'text-red-400' 
                            : 'text-green-400'
                        }`}>
                          {tx.from?.toLowerCase() === address.toLowerCase() ? 'Enviado' : 'Recibido'}
                        </span>
                        <span className="text-sm text-gray-400">
                          {tx.value ? `${parseFloat(tx.value.toString()) / 1e18} WCV` : '0 WCV'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Bloque #{tx.blockNumber} • {formatTimestamp(tx.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/tx/${tx.hash}`}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      <FaExternalLinkAlt className="text-xs" />
                      Ver TX
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaHistory className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No se encontraron transacciones para esta dirección</p>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center items-center gap-4 mt-8 pt-8 border-t border-gray-700"
      >
        <Link
          to="/transactions"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver Todas las Transacciones
        </Link>
        
        <Link
          to="/"
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Volver al Inicio
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default AddressPage; 