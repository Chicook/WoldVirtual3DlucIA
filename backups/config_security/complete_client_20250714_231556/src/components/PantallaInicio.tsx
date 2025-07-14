import React from 'react'

const PantallaInicio: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #7b9cfb 0%, #6a5acd 100%)' }}>
      {/* Banda superior amarilla */}
      <div style={{ background: '#f3c800', padding: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: '1rem' }}>World Virtual</div>
        <div style={{ display: 'flex', gap: '1.5rem', marginRight: '1rem' }}>
          <a href="#" style={{ color: '#222', textDecoration: 'none', fontWeight: 500 }}>Acerca de</a>
          <a href="#" style={{ color: '#222', textDecoration: 'none', fontWeight: 500 }}>Características</a>
          <a href="#" style={{ color: '#222', textDecoration: 'none', fontWeight: 500 }}>Comunidad</a>
          <button style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 1rem', fontWeight: 600 }}>Redes Blockchain</button>
        </div>
      </div>
      {/* Fondo verde */}
      <div style={{ background: '#228b22', minHeight: 'calc(100vh - 44px)', padding: '2rem 0' }}>
        {/* Marco azul pequeño */}
        <div style={{
          maxWidth: '90vw',
          margin: '2rem auto',
          borderRadius: '16px',
          border: '3px solid #0033cc',
          boxShadow: '0 0 0 4px #228b22',
          background: 'transparent',
          padding: '0.5rem'
        }}>
          {/* Marco blanco */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            minHeight: '60vh',
            minWidth: '60vw',
            padding: '2rem',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}>
            {/* Aquí irá el contenido principal o el canvas 3D */}
            {children ? children : <span style={{ color: '#222', fontSize: '1.1rem' }}>AQUÍ tiene que ir la zona blanca., del tamaño del marco blanco</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PantallaInicio 