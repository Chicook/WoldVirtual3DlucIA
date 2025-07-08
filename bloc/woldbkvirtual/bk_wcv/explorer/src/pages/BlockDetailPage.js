import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaCube, 
  FaClock, 
  FaHashtag, 
  FaExchangeAlt, 
  FaGasPump,
  FaUserCog,
  FaCopy,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { useBlockchain } from '../contexts/BlockchainContext';
import { formatNumber, formatAddress, formatTimestamp } from '../utils/formatters';
import { toast } from 'react-hot-toast';

const BlockDetailPage = () => {
  const { blockNumber } = useParams();
  const { provider } = useBlockchain();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlock = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!provider) {
          throw new Error('No hay conexión a la blockchain');
        }

        const blockData = await provider.getBlock(parseInt(blockNumber));
        
        if (!blockData) {
          throw new Error('Bloque no encontrado');
        }

        setBlock(blockData);
      } catch (err) {
        console.error('Error fetching block:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlock();
  }, [blockNumber, provider]);

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
        <div className="text-red-400 text-xl mb-4">Error al cargar el bloque</div>
        <div className="text-gray-400">{error}</div>
        <Link 
          to="/blocks" 
          className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver a bloques
        </Link>
      </motion.div>
    );
  }

  if (!block) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-gray-400 text-xl">Bloque no encontrado</div>
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
          <FaCube className="text-3xl text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Bloque #{block.number}</h1>
            <p className="text-gray-400">Detalles del bloque</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/blocks" className="hover:text-blue-400 transition-colors">
            Bloques
          </Link>
          <span>/</span>
          <span>#{block.number}</span>
        </div>
      </div>

      {/* Block Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Block Number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaHashtag className="text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Número de Bloque</h3>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {formatNumber(block.number)}
          </div>
        </motion.div>

        {/* Timestamp */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaClock className="text-green-500" />
            <h3 className="text-lg font-semibold text-white">Timestamp</h3>
          </div>
          <div className="text-lg text-gray-300">
            {formatTimestamp(block.timestamp)}
          </div>
        </motion.div>

        {/* Transactions */}
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
            {block.transactions?.length || 0}
          </div>
        </motion.div>

        {/* Gas Used */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaGasPump className="text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Gas Usado</h3>
          </div>
          <div className="text-lg text-gray-300">
            {formatNumber(block.gasUsed?.toString() || '0')}
          </div>
        </motion.div>

        {/* Gas Limit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaGasPump className="text-orange-500" />
            <h3 className="text-lg font-semibold text-white">Límite de Gas</h3>
          </div>
          <div className="text-lg text-gray-300">
            {formatNumber(block.gasLimit?.toString() || '0')}
          </div>
        </motion.div>

        {/* Miner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaUserCog className="text-red-500" />
            <h3 className="text-lg font-semibold text-white">Minero</h3>
          </div>
          <div className="text-sm text-gray-300 break-all">
            {formatAddress(block.miner || 'N/A')}
          </div>
        </motion.div>
      </div>

      {/* Block Hash */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Hash del Bloque</h3>
          <button
            onClick={() => copyToClipboard(block.hash)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
          >
            <FaCopy className="text-sm" />
            Copiar
          </button>
        </div>
        <div className="bg-gray-900 p-4 rounded border border-gray-600">
          <code className="text-sm text-gray-300 break-all">{block.hash}</code>
        </div>
      </motion.div>

      {/* Parent Hash */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Hash del Bloque Padre</h3>
          <Link
            to={`/block/${block.number - 1}`}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <FaExternalLinkAlt className="text-sm" />
            Ver Bloque Padre
          </Link>
        </div>
        <div className="bg-gray-900 p-4 rounded border border-gray-600">
          <code className="text-sm text-gray-300 break-all">{block.parentHash}</code>
        </div>
      </motion.div>

      {/* Transactions List */}
      {block.transactions && block.transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-6">
            Transacciones ({block.transactions.length})
          </h3>
          
          <div className="space-y-4">
            {block.transactions.map((tx, index) => (
              <div
                key={tx}
                className="bg-gray-900 p-4 rounded border border-gray-600 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                    <code className="text-sm text-gray-300 break-all">{formatAddress(tx)}</code>
                  </div>
                  <Link
                    to={`/tx/${tx}`}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    Ver TX
                  </Link>
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
        transition={{ delay: 1.0 }}
        className="flex justify-between items-center mt-8 pt-8 border-t border-gray-700"
      >
        <Link
          to={`/block/${block.number - 1}`}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Bloque Anterior
        </Link>
        
        <Link
          to="/blocks"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver Todos los Bloques
        </Link>
        
        <Link
          to={`/block/${block.number + 1}`}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Bloque Siguiente →
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default BlockDetailPage; 