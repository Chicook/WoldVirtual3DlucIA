import React from 'react';
import '../styles/globals.css';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => (
  <div className="layout-frame">
    <header className="layout-header">
      <span>World Virtual</span>
      <nav>
        <a href="#" style={{ marginRight: 16 }}>Mapa del proyecto.</a>
        <a href="#" style={{ marginRight: 16 }}>Libro blanco</a>
        <a href="#" style={{ marginRight: 16 }}>Código abierto</a>
        <button style={{ background: '#222', color: '#fff', borderRadius: 8, padding: '0.3rem 1rem', border: 'none' }}>Redes Blockchain</button>
      </nav>
    </header>
    <main className="layout-content">
      <div className="layout-inner">
        {children}
      </div>
    </main>
  </div>
);

export default GlobalLayout; 