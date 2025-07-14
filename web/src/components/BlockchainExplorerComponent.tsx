import { useState, useEffect } from 'react';
import { messageBus } from '../core/InterModuleMessageBus';

interface BlockchainExplorerProps {
  userId?: string;
}

interface Block {
  height: number;
  hash: string;
  timestamp: string;
  transactions: number;
  size: string;
  miner: string;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  gas: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
}

export const BlockchainExplorerComponent = ({ userId }: BlockchainExplorerProps) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentBlock, setCurrentBlock] = useState<number>(15420);
  const [networkStats] = useState({
    totalBlocks: 15420,
    totalTransactions: 125430,
    activeNodes: 47,
    difficulty: '2.5M',
    hashRate: '15.2 TH/s'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'blocks' | 'transactions'>('blocks');

  useEffect(() => {
    loadBlockchainData();
    const interval = setInterval(loadBlockchainData, 10000); // Actualizar cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const loadBlockchainData = async () => {
    setIsLoading(true);
    try {
      // Simular carga de datos de blockchain
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockBlocks: Block[] = [
        {
          height: 15420,
          hash: '0x7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
          timestamp: new Date().toISOString(),
          transactions: 127,
          size: '1.2 MB',
          miner: 'WoldVirtual_Miner_01'
        },
        {
          height: 15419,
          hash: '0x6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          transactions: 89,
          size: '0.8 MB',
          miner: 'WoldVirtual_Miner_02'
        },
        {
          height: 15418,
          hash: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
          timestamp: new Date(Date.now() - 240000).toISOString(),
          transactions: 156,
          size: '1.5 MB',
          miner: 'WoldVirtual_Miner_03'
        }
      ];

      const mockTransactions: Transaction[] = [
        {
          hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
          from: '0x7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
          to: '0x6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
          amount: '1.5 WV',
          gas: '0.002 WV',
          status: 'confirmed',
          timestamp: new Date().toISOString()
        },
        {
          hash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
          from: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
          to: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
          amount: '0.75 WV',
          gas: '0.001 WV',
          status: 'pending',
          timestamp: new Date(Date.now() - 30000).toISOString()
        }
      ];
      
      setBlocks(mockBlocks);
      setTransactions(mockTransactions);
      setCurrentBlock(mockBlocks[0].height);
      
    } catch (error) {
      console.error('Error cargando datos de blockchain:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const formatHash = (hash: string) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`;
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  const handleBlockClick = (block: Block) => {
    messageBus.publish('block-selected', { block, userId });
  };

  const handleTransactionClick = (tx: Transaction) => {
    messageBus.publish('transaction-selected', { transaction: tx, userId });
  };

  return (
    <div className="blockchain-explorer-container">
      <div className="explorer-header">
        <h2>Explorador de Blockchain</h2>
        <div className="network-info">
          <span className="network-name">WoldVirtual Network</span>
          <span className="block-height">Bloque #{currentBlock}</span>
        </div>
      </div>

      <div className="network-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h4>Total Bloques</h4>
            <p>{networkStats.totalBlocks.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h4>Transacciones</h4>
            <p>{networkStats.totalTransactions.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🖥️</div>
          <div className="stat-content">
            <h4>Nodos Activos</h4>
            <p>{networkStats.activeNodes}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h4>Hash Rate</h4>
            <p>{networkStats.hashRate}</p>
          </div>
        </div>
      </div>

      <div className="explorer-controls">
        <div className="view-controls">
          <button 
            onClick={() => setViewMode('blocks')}
            className={`view-btn ${viewMode === 'blocks' ? 'active' : ''}`}
          >
            📦 Bloques
          </button>
          <button 
            onClick={() => setViewMode('transactions')}
            className={`view-btn ${viewMode === 'transactions' ? 'active' : ''}`}
          >
            💸 Transacciones
          </button>
        </div>

        <div className="search-controls">
          <input
            type="text"
            placeholder="Buscar por hash o dirección..."
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
      </div>

      <div className="explorer-content">
        {isLoading ? (
          <div className="loading-blockchain">
            <div className="spinner"></div>
            <p>Sincronizando con la blockchain...</p>
          </div>
        ) : (
          <div className="data-display">
            {viewMode === 'blocks' ? (
              <div className="blocks-list">
                <h3>Últimos Bloques</h3>
                {blocks.map(block => (
                  <div 
                    key={block.height} 
                    className="block-item"
                    onClick={() => handleBlockClick(block)}
                  >
                    <div className="block-header">
                      <span className="block-number">#{block.height}</span>
                      <span className="block-time">
                        {new Date(block.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="block-hash">
                      Hash: {formatHash(block.hash)}
                    </div>
                    <div className="block-details">
                      <span>Transacciones: {block.transactions}</span>
                      <span>Tamaño: {block.size}</span>
                      <span>Miner: {block.miner}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="transactions-list">
                <h3>Últimas Transacciones</h3>
                {transactions.map(tx => (
                  <div 
                    key={tx.hash} 
                    className="transaction-item"
                    onClick={() => handleTransactionClick(tx)}
                  >
                    <div className="tx-header">
                      <span className="tx-hash">{formatHash(tx.hash)}</span>
                      <span 
                        className="tx-status"
                        style={{ color: getStatusColor(tx.status) }}
                      >
                        {tx.status}
                      </span>
                    </div>
                    <div className="tx-details">
                      <div className="tx-addresses">
                        <span>De: {formatAddress(tx.from)}</span>
                        <span>A: {formatAddress(tx.to)}</span>
                      </div>
                      <div className="tx-amounts">
                        <span>Cantidad: {tx.amount}</span>
                        <span>Gas: {tx.gas}</span>
                      </div>
                    </div>
                    <div className="tx-time">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="explorer-footer">
        <div className="footer-info">
          <span>Usuario: {userId}</span>
          <span>Red: WoldVirtual Network</span>
          <span>Última actualización: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="footer-actions">
          <button 
            onClick={() => messageBus.publish('load-component', {
              componentName: 'NFTMarketplace',
              props: { userId },
              targetId: 'dynamic-content'
            })}
            className="btn-secondary"
          >
            NFT Marketplace
          </button>
          <button 
            onClick={() => messageBus.publish('load-component', {
              componentName: 'Wallet',
              props: { userId },
              targetId: 'dynamic-content'
            })}
            className="btn-primary"
          >
            Mi Wallet
          </button>
        </div>
      </div>
    </div>
  );
}; 