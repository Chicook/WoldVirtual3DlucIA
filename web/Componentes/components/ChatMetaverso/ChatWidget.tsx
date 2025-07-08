import React from 'react';
import styles from './ChatMetaverso.module.css';

export interface ChatWidgetProps {
  minimized?: boolean;
  onToggle?: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ minimized = false, onToggle }) => {
  return (
    <div className={minimized ? styles.chatWidgetMin : styles.chatWidget}>
      <div className={styles.header}>
        <span>Chat Metaverso</span>
        <button onClick={onToggle} className={styles.toggleBtn}>
          {minimized ? '▲' : '▼'}
        </button>
      </div>
      {!minimized && (
        <div className={styles.messages}>
          {/* Aquí se mostrarán los mensajes públicos */}
          <div className={styles.message}>¡Bienvenido al chat del metaverso!</div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget; 