import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaExchangeAlt, 
  FaSearch, 
  FaFilter, 
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaCopy
} from 'react-icons/fa';
import { useBlockchain } from '../contexts/BlockchainContext';
import { formatNumber, formatAddress, formatTimestamp } from '../utils/formatters';
import { toast } from 'react-hot-toast';

const TransactionsPage = () => {
  const { provider } = useBlockchain();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const transactionsPerPage = 20;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!provider) {
          throw new Error('No hay conexión a la blockchain');
        }

        // Obtener el bloque más reciente
        const latestBlock = await provider.getBlockNumber();
        
        // Obtener transacciones de los últimos 10 bloques
        const txPromises = [];
        const blocksToFetch = Math.min(10, latestBlock);
        
        for (let i = 0; i < blocksToFetch; i++) {
          const blockNumber = latestBlock - i;
          txPromises.push(provider.getBlock(blockNumber, true));
        }
        
        const blocks = await Promise.all(txPromises);
        const allTransactions = blocks
          .filter(block => block && block.transactions)
          .flatMap(block => 
            block.transactions.map(tx => ({
              ...tx,
              blockNumber: block.number,
              timestamp: block.timestamp
            }))
          )
          .sort((a, b) => b.timestamp - a.timestamp);

        setTransactions(allTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [provider]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredTransactions = transactions
    .filter(tx => 
      tx.hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.blockNumber?.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'value') {
        aValue = aValue ? parseFloat(aValue.toString()) : 0;
        bValue = bValue ? parseFloat(bValue.toString()) : 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + transactionsPerPage);

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
        <div className="text-red-400 text-xl mb-4">Error al cargar las transacciones</div>
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
          <FaExchangeAlt className="text-3xl text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Transacciones</h1>
            <p className="text-gray-400">
              {formatNumber(transactions.length)} transacciones encontradas
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por hash, dirección o bloque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="timestamp">Fecha</option>
              <option value="blockNumber">Bloque</option>
              <option value="value">Valor</option>
              <option value="hash">Hash</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors"
            >
              {sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
            <div className="col-span-2">Hash</div>
            <div className="col-span-2">Bloque</div>
            <div className="col-span-2">Desde</div>
            <div className="col-span-2">Hacia</div>
            <div className="col-span-2">Valor</div>
            <div className="col-span-2">Fecha</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-700">
          {paginatedTransactions.map((tx, index) => (
            <motion.div
              key={tx.hash}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="px-6 py-4 hover:bg-gray-750 transition-colors"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Hash */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-blue-400 break-all">
                      {formatAddress(tx.hash)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(tx.hash)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <FaCopy className="text-xs" />
                    </button>
                  </div>
                  <Link
                    to={`/tx/${tx.hash}`}
                    className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    Ver detalles
                  </Link>
                </div>

                {/* Block */}
                <div className="col-span-2">
                  <Link
                    to={`/block/${tx.blockNumber}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    #{formatNumber(tx.blockNumber)}
                  </Link>
                </div>

                {/* From */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-gray-300 break-all">
                      {formatAddress(tx.from)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(tx.from)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <FaCopy className="text-xs" />
                    </button>
                  </div>
                  <Link
                    to={`/address/${tx.from}`}
                    className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    Ver dirección
                  </Link>
                </div>

                {/* To */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-gray-300 break-all">
                      {formatAddress(tx.to)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(tx.to)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <FaCopy className="text-xs" />
                    </button>
                  </div>
                  <Link
                    to={`/address/${tx.to}`}
                    className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    Ver dirección
                  </Link>
                </div>

                {/* Value */}
                <div className="col-span-2">
                  <div className="text-sm text-gray-300">
                    {tx.value ? `${parseFloat(tx.value.toString()) / 1e18} WCV` : '0 WCV'}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FaClock className="text-xs" />
                    {formatTimestamp(tx.timestamp)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          
          <span className="px-4 py-2 text-gray-300">
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredTransactions.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaExchangeAlt className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-gray-400 mb-2">No se encontraron transacciones</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay transacciones disponibles'}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default TransactionsPage; 