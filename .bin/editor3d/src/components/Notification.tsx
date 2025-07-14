import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Esperar a que termine la animación
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          background: '#28a745',
          borderColor: '#1e7e34',
          icon: '✅'
        };
      case 'error':
        return {
          background: '#dc3545',
          borderColor: '#c82333',
          icon: '❌'
        };
      case 'warning':
        return {
          background: '#ffc107',
          borderColor: '#e0a800',
          icon: '⚠️'
        };
      case 'info':
        return {
          background: '#17a2b8',
          borderColor: '#138496',
          icon: 'ℹ️'
        };
      default:
        return {
          background: '#6c757d',
          borderColor: '#545b62',
          icon: '💬'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: styles.background,
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '6px',
        border: `1px solid ${styles.borderColor}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        maxWidth: '300px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onClick={() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }}
    >
      <span style={{ fontSize: '16px' }}>{styles.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0',
          marginLeft: '8px'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Notification; 