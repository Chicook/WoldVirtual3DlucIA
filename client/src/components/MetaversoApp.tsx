import React from 'react';
import { useMetaverso } from '../contexts/MetaversoContext';
import { useWeb3 } from '../contexts/Web3Context';

const MetaversoApp: React.FC = () => {
  const { state: metaversoState } = useMetaverso();
  const { state: web3State } = useWeb3();

  return (
    <div className="metaverso-app-container">
      <header className="app-header">
        <h1>WoldVirtual3DlucIA</h1>
        <div className="user-info">
          {web3State.isConnected && (
            <span>Wallet: {web3State.account?.slice(0, 6)}...{web3State.account?.slice(-4)}</span>
          )}
        </div>
      </header>
      
      <main className="app-main">
        {metaversoState.isLoading ? (
          <div className="loading-screen">
            <h2>Cargando Metaverso...</h2>
            <div className="loading-spinner"></div>
          </div>
        ) : metaversoState.error ? (
          <div className="error-screen">
            <h2>Error</h2>
            <p>{metaversoState.error}</p>
          </div>
        ) : (
          <div className="metaverso-content">
            <h2>Bienvenido al Metaverso</h2>
            <p>Tu avatar: {metaversoState.userAvatar?.name || 'Sin avatar'}</p>
            <p>Mundo actual: {metaversoState.currentScene || 'Sin mundo'}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MetaversoApp; 