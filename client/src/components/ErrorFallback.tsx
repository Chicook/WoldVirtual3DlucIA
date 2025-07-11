import React from 'react'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{
          color: '#e53e3e',
          marginBottom: '1rem',
          fontSize: '1.8rem'
        }}>
          Algo salió mal
        </h2>
        <p style={{
          color: '#4a5568',
          marginBottom: '1.5rem',
          lineHeight: '1.6'
        }}>
          Ha ocurrido un error inesperado en la aplicación.
        </p>
        <details style={{ margin: '1.5rem 0', textAlign: 'left' }}>
          <summary style={{
            cursor: 'pointer',
            color: '#2d3748',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            Detalles del error
          </summary>
          <pre style={{
            background: '#f7fafc',
            padding: '1rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#e53e3e',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {error.message}
          </pre>
          <pre style={{
            background: '#f7fafc',
            padding: '1rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#e53e3e',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {error.stack}
          </pre>
        </details>
        <button 
          onClick={resetErrorBoundary}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}

export default ErrorFallback 