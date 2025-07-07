import React from 'react';
import { useBlockchain } from '../../contexts/BlockchainContext';

const TokenStats = () => {
  const { tokenInfo, formatWCV, formatNumber } = useBlockchain();

  if (!tokenInfo) {
    return (
      <div className="text-center py-8">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-400">Cargando información del token...</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Supply Total',
      value: formatWCV(tokenInfo.totalSupply || 0),
      description: 'Total de tokens en circulación'
    },
    {
      label: 'Holders',
      value: formatNumber(tokenInfo.holders || 0),
      description: 'Número de direcciones con tokens'
    },
    {
      label: 'Transacciones',
      value: formatNumber(tokenInfo.transactions || 0),
      description: 'Total de transacciones del token'
    },
    {
      label: 'Market Cap',
      value: formatWCV(tokenInfo.marketCap || 0),
      description: 'Capitalización de mercado'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Información básica */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-750 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">{stat.label}</h3>
            <p className="text-lg font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="bg-gray-750 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Información del Token</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Nombre:</span>
              <span className="text-white">WoldVirtual Coin</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Símbolo:</span>
              <span className="text-white">WCV</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Decimales:</span>
              <span className="text-white">3</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Contrato:</span>
              <span className="text-white font-mono text-xs">
                {tokenInfo.address ? `${tokenInfo.address.slice(0, 8)}...${tokenInfo.address.slice(-6)}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Estado:</span>
              <span className="text-green-500">Activo</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Tipo:</span>
              <span className="text-white">ERC-20</span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución */}
      <div className="bg-gray-750 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Distribución</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Circulación</span>
              <span className="text-white">85%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Reservado</span>
              <span className="text-white">10%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Equipo</span>
              <span className="text-white">5%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '5%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenStats; 