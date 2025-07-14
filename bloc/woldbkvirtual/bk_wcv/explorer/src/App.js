import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Layouts
import Layout from './components/Layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import BlocksPage from './pages/BlocksPage';
import BlockDetailPage from './pages/BlockDetailPage';
import TransactionsPage from './pages/TransactionsPage';
import TransactionDetailPage from './pages/TransactionDetailPage';
import AddressPage from './pages/AddressPage';
import TokenPage from './pages/TokenPage';
import BridgePage from './pages/BridgePage';
import StatsPage from './pages/StatsPage';
import NotFoundPage from './pages/NotFoundPage';

// Contexts
import { useBlockchain } from './contexts/BlockchainContext';

function App() {
  const { isConnected } = useBlockchain();

  return (
    <>
      <Helmet>
        <title>WoldPBVirtual - Explorador de Bloques WCV</title>
        <meta name="description" content="Explorador de bloques para la blockchain WCV - WoldPBVirtual" />
        <meta name="keywords" content="blockchain, WCV, explorer, bloques, transacciones, crypto" />
        <meta property="og:title" content="WoldPBVirtual - Explorador de Bloques WCV" />
        <meta property="og:description" content="Explorador de bloques para la blockchain WCV" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://woldpbvirtual.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WoldPBVirtual - Explorador de Bloques WCV" />
        <meta name="twitter:description" content="Explorador de bloques para la blockchain WCV" />
      </Helmet>

      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Layout>
          <Routes>
            {/* Página principal */}
            <Route path="/" element={<HomePage />} />
            
            {/* Bloques */}
            <Route path="/blocks" element={<BlocksPage />} />
            <Route path="/block/:blockNumber" element={<BlockDetailPage />} />
            
            {/* Transacciones */}
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/tx/:txHash" element={<TransactionDetailPage />} />
            
            {/* Direcciones */}
            <Route path="/address/:address" element={<AddressPage />} />
            
            {/* Token WCV */}
            <Route path="/token" element={<TokenPage />} />
            
            {/* Bridge */}
            <Route path="/bridge" element={<BridgePage />} />
            
            {/* Estadísticas */}
            <Route path="/stats" element={<StatsPage />} />
            
            {/* Página 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </div>
    </>
  );
}

export default App; 