import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { CubeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useBlockchain } from '../contexts/BlockchainContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const BlocksPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { getBlockInfo, formatHash, formatDate, formatNumber, formatETH } = useBlockchain();

  const blocksPerPage = 20;

  // Obtener bloques
  const { data: blocks, isLoading } = useQuery(
    ['blocks', currentPage],
    async () => {
      const latestBlock = await getBlockInfo('latest');
      const blockNumber = parseInt(latestBlock.number);
      
      const startBlock = blockNumber - (currentPage - 1) * blocksPerPage;
      const endBlock = Math.max(0, startBlock - blocksPerPage + 1);
      
      const blocksData = [];
      for (let i = startBlock; i >= endBlock; i--) {
        try {
          const block = await getBlockInfo(i);
          blocksData.push(block);
        } catch (error) {
          console.error(`Error obteniendo bloque ${i}:`, error);
        }
      }
      return blocksData;
    },
    {
      refetchInterval: 10000,
    }
  );

  const filteredBlocks = blocks?.filter(block => 
    block.number.toString().includes(searchQuery) ||
    block.hash.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalPages = Math.ceil((blocks?.[0]?.number || 0) / blocksPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Cargando bloques..." />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Bloques - WoldPBVirtual Explorer</title>
        <meta name="description" content="Explora todos los bloques de la blockchain WCV" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Bloques</h1>
            <p className="text-gray-400">
              Explora todos los bloques de la blockchain WCV
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <CubeIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        {/* Búsqueda */}
        <div className="card">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por número de bloque o hash..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabla de bloques */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="table-cell text-left">Bloque</th>
                  <th className="table-cell text-left">Hash</th>
                  <th className="table-cell text-left">Minero</th>
                  <th className="table-cell text-center">Transacciones</th>
                  <th className="table-cell text-center">Gas Usado</th>
                  <th className="table-cell text-center">Gas Limit</th>
                  <th className="table-cell text-center">Tamaño</th>
                  <th className="table-cell text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.map((block, index) => (
                  <motion.tr
                    key={block.hash}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="table-row hover:bg-gray-750"
                  >
                    <td className="table-cell">
                      <a
                        href={`/block/${block.number}`}
                        className="text-blue-500 hover:text-blue-400 font-medium"
                      >
                        #{block.number}
                      </a>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-sm text-gray-300">
                        {formatHash(block.hash)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-sm text-gray-300">
                        {formatHash(block.miner || block.coinbase)}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className="text-white">
                        {formatNumber(block.transactions?.length || 0)}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className="text-gray-300">
                        {formatNumber(block.gasUsed)}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className="text-gray-300">
                        {formatNumber(block.gasLimit)}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className="text-gray-300">
                        {formatNumber(block.size || 0)} bytes
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <span className="text-gray-300 text-sm">
                        {formatDate(block.timestamp)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-400">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlocksPage; 