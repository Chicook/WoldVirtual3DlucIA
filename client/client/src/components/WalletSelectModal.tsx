import React from 'react'

interface WalletSelectModalProps {
  open: boolean
  onClose: () => void
  onSelectMetaMask: () => void
}

const WalletSelectModal: React.FC<WalletSelectModalProps> = ({ open, onClose, onSelectMetaMask }) => {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.4)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2rem 2.5rem', maxWidth: 340, textAlign: 'center', boxShadow: '0 4px 24px #0003' }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Selecciona tu wallet</h3>
        <button
          style={{ width: '100%', background: '#f6851b', color: '#fff', border: 'none', borderRadius: 8, padding: '1rem', fontWeight: 600, fontSize: 18, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
          onClick={onSelectMetaMask}
        >
          <img src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" alt="MetaMask" style={{ width: 28, height: 28 }} />
          MetaMask
        </button>
        <button
          style={{ marginTop: 8, background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, padding: '0.7rem 2rem', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default WalletSelectModal 