import React from 'react'

interface PlantillaMetaversoProps {
  onRedBlockchain?: () => void
  onLogout?: () => void
  showLogout?: boolean
  children: React.ReactNode
}

const PlantillaMetaverso: React.FC<PlantillaMetaversoProps> = ({ onRedBlockchain, onLogout, showLogout, children }) => {
  return (
    <div style={{ minHeight: '100vh', height: '100vh', width: '100%', background: 'linear-gradient(120deg, #7b9cfb 0%, #6a5acd 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Banda superior amarilla más pequeña */}
      <div style={{ background: '#f3c800', padding: '0.2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginLeft: '0.7rem' }}>World Virtual</div>
        <div style={{ display: 'flex', gap: '1rem', marginRight: '0.7rem', alignItems: 'center' }}>
          <a href="#" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>Acerca de</a>
          <a href="#" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>Características</a>
          <a href="#" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>Comunidad</a>
          <button
            style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 6, padding: '0.2rem 0.7rem', fontWeight: 600, fontSize: '0.95rem' }}
            onClick={onRedBlockchain}
          >
            Redes Blockchain
          </button>
          {showLogout && (
            <button
              style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.9rem', fontWeight: 600, fontSize: 14, marginLeft: 10, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}
              onClick={onLogout}
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
      {/* Fondo verde más pequeño */}
      <div style={{ background: '#228b22', flex: 1, minHeight: 0, height: '100%', width: '100%', padding: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        {/* Marco azul y zona blanca más larga y ancha */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '14px',
          border: '2px solid #0033cc',
          boxShadow: '0 0 0 2px #228b22',
          background: 'transparent',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}>
          {/* Marco blanco */}
          <div style={{
            background: '#fff',
            borderRadius: '10px',
            width: '100%',
            height: '100%',
            padding: 0,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            overflow: 'hidden',
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlantillaMetaverso 