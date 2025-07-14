import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaExchangeAlt, 
  FaHashtag, 
  FaClock, 
  FaGasPump,
  FaArrowUp,
  FaArrowDown,
  FaCopy,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { useBlockchain } from '../contexts/BlockchainContext';
import { formatNumber, formatAddress, formatTimestamp } from '../utils/formatters';
import { toast } from 'react-hot-toast';

const TransactionDetailPage = () => {
  const { txHash } = useParams();
  const { provider } = useBlockchain();
  const [transaction, setTransaction] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!provider) {
          throw new Error('No hay conexión a la blockchain');
        }

        const [txData, txReceipt] = await Promise.all([
          provider.getTransaction(txHash),
          provider.getTransactionReceipt(txHash)
        ]);
        
        if (!txData) {
          throw new Error('Transacción no encontrada');
        }

        setTransaction(txData);
        setReceipt(txReceipt);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [txHash, provider]);

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
        <div className="text-red-400 text-xl mb-4">Error al cargar la transacción</div>
        <div className="text-gray-400">{error}</div>
        <Link 
          to="/transactions" 
          className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver a transacciones
        </Link>
      </motion.div>
    );
  }

  if (!transaction) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-gray-400 text-xl">Transacción no encontrada</div>
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
          <FaExchangeAlt className="text-3xl text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Transacción</h1>
            <p className="text-gray-400">Detalles de la transacción</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/transactions" className="hover:text-blue-400 transition-colors">
            Transacciones
          </Link>
          <span>/</span>
          <span>{formatAddress(txHash)}</span>
        </div>
      </div>

      {/* Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
      >
        <div className="flex items-center gap-3">
          {receipt?.status === 1 ? (
            <FaCheckCircle className="text-green-500 text-2xl" />
          ) : (
            <FaTimesCircle className="text-red-500 text-2xl" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-white">
              {receipt?.status === 1 ? 'Transacción Exitosa' : 'Transacción Fallida'}
            </h3>
            <p className="text-gray-400">
              {receipt?.status === 1 
                ? 'La transacción se ejecutó correctamente' 
                : 'La transacción falló durante la ejecución'
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* Transaction Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Hash */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaHashtag className="text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Hash</h3>
          </div>
          <div className="text-sm text-gray-300 break-all mb-2">
            {transaction.hash}
          </div>
          <button
            onClick={() => copyToClipboard(transaction.hash)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Copiar hash
          </button>
        </motion.div>

        {/* Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaHashtag className="text-green-500" />
            <h3 className="text-lg font-semibold text-white">Bloque</h3>
          </div>
          <Link
            to={`/block/${transaction.blockNumber}`}
            className="text-2xl font-bold text-green-400 hover:text-green-300 transition-colors"
          >
            #{formatNumber(transaction.blockNumber)}
          </Link>
        </motion.div>

        {/* Timestamp */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaClock className="text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Fecha</h3>
          </div>
          <div className="text-lg text-gray-300">
            {transaction.timestamp ? formatTimestamp(transaction.timestamp) : 'N/A'}
          </div>
        </motion.div>

        {/* From */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaArrowUp className="text-red-500" />
            <h3 className="text-lg font-semibold text-white">Desde</h3>
          </div>
          <div className="text-sm text-gray-300 break-all mb-2">
            {formatAddress(transaction.from)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(transaction.from)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Copiar
            </button>
            <Link
              to={`/address/${transaction.from}`}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Ver dirección
            </Link>
          </div>
        </motion.div>

        {/* To */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaArrowDown className="text-green-500" />
            <h3 className="text-lg font-semibold text-white">Hacia</h3>
          </div>
          <div className="text-sm text-gray-300 break-all mb-2">
            {formatAddress(transaction.to)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(transaction.to)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Copiar
            </button>
            <Link
              to={`/address/${transaction.to}`}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Ver dirección
            </Link>
          </div>
        </motion.div>

        {/* Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaExchangeAlt className="text-purple-500" />
            <h3 className="text-lg font-semibold text-white">Valor</h3>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {transaction.value ? `${parseFloat(transaction.value.toString()) / 1e18} WCV` : '0 WCV'}
          </div>
        </motion.div>
      </div>

      {/* Gas Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Gas Price */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaGasPump className="text-orange-500" />
            <h3 className="text-lg font-semibold text-white">Precio de Gas</h3>
          </div>
          <div className="text-lg text-gray-300">
            {transaction.gasPrice ? `${parseFloat(transaction.gasPrice.toString()) / 1e9} Gwei` : 'N/A'}
          </div>
        </motion.div>

        {/* Gas Used */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaGasPump className="text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Gas Usado</h3>
          </div>
          <div className="text-lg text-gray-300">
            {receipt?.gasUsed ? formatNumber(receipt.gasUsed.toString()) : 'N/A'}
          </div>
        </motion.div>

        {/* Gas Limit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaGasPump className="text-red-500" />
            <h3 className="text-lg font-semibold text-white">Límite de Gas</h3>
          </div>
          <div className="text-lg text-gray-300">
            {transaction.gasLimit ? formatNumber(transaction.gasLimit.toString()) : 'N/A'}
          </div>
        </motion.div>
      </div>

      {/* Transaction Data */}
      {transaction.data && transaction.data !== '0x' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Datos de la Transacción</h3>
          <div className="bg-gray-900 p-4 rounded border border-gray-600">
            <code className="text-sm text-gray-300 break-all">{transaction.data}</code>
          </div>
        </motion.div>
      )}

      {/* Logs */}
      {receipt?.logs && receipt.logs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Logs ({receipt.logs.length})
          </h3>
          <div className="space-y-4">
            {receipt.logs.map((log, index) => (
              <div
                key={index}
                className="bg-gray-900 p-4 rounded border border-gray-600"
              >
                <div className="text-sm text-gray-400 mb-2">
                  Log #{index + 1} - {formatAddress(log.address)}
                </div>
                <div className="text-xs text-gray-500 break-all">
                  {log.data}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="flex justify-center items-center gap-4 mt-8 pt-8 border-t border-gray-700"
      >
        <Link
          to="/transactions"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver Todas las Transacciones
        </Link>
        
        <Link
          to={`/block/${transaction.blockNumber}`}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Ver Bloque #{transaction.blockNumber}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default TransactionDetailPage; 