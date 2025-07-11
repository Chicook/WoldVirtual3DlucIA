import { useState, useEffect } from 'react';

interface EngineBridgeProps {
  port?: number;
  autoConnect?: boolean;
}

const EngineBridgeComponent = ({ port = 8181, autoConnect = true }: EngineBridgeProps) => {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoConnect) {
      connectToEngine();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [autoConnect]);

  const connectToEngine = () => {
    try {
      setConnectionStatus('connecting');
      setError(null);
      
      const socket = new WebSocket(`ws://localhost:${port}`);
      
      socket.onopen = () => {
        setConnectionStatus('connected');
        addMessage('Conectado al engine 3D');
        
        // Enviar heartbeat
        socket.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now()
        }));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addMessage(`Recibido: ${data.type}`);
        } catch (err) {
          addMessage(`Mensaje: ${event.data}`);
        }
      };
      
      socket.onerror = () => {
        setConnectionStatus('error');
        setError('Error de conexión WebSocket');
        addMessage('Error de conexión');
      };
      
      socket.onclose = () => {
        setConnectionStatus('disconnected');
        addMessage('Conexión cerrada');
      };
      
      setWs(socket);
      
    } catch (err) {
      setConnectionStatus('error');
      setError('Error creando conexión WebSocket');
      addMessage('Error de conexión');
    }
  };

  const disconnectFromEngine = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
  };

  const addMessage = (message: string) => {
    setMessages(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const sendCommand = (command: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'command',
        command,
        timestamp: Date.now()
      };
      ws.send(JSON.stringify(message));
      addMessage(`Enviado: ${command}`);
    } else {
      addMessage('No conectado al engine');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'green';
      case 'connecting': return 'orange';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="engine-bridge-container">
      <div className="bridge-header">
        <h3>Engine Bridge</h3>
        <div className="connection-status">
          <span 
            className="status-indicator" 
            style={{ backgroundColor: getStatusColor() }}
          ></span>
          <span className="status-text">{connectionStatus}</span>
        </div>
      </div>

      <div className="connection-controls">
        <button 
          onClick={connectToEngine}
          disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
          className="btn-connect"
        >
          Conectar
        </button>
        <button 
          onClick={disconnectFromEngine}
          disabled={connectionStatus === 'disconnected'}
          className="btn-disconnect"
        >
          Desconectar
        </button>
        <span className="port-info">Puerto: {port}</span>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="command-panel">
        <h4>Comandos Rápidos</h4>
        <div className="command-buttons">
          <button onClick={() => sendCommand('ping')}>Ping</button>
          <button onClick={() => sendCommand('get_status')}>Estado</button>
          <button onClick={() => sendCommand('get_scene')}>Obtener Escena</button>
          <button onClick={() => sendCommand('clear_scene')}>Limpiar Escena</button>
        </div>
      </div>

      <div className="messages-panel">
        <h4>Mensajes ({messages.length})</h4>
        <div className="messages-list">
          {messages.map((message, index) => (
            <div key={index} className="message-item">
              {message}
            </div>
          ))}
          {messages.length === 0 && (
            <div className="no-messages">
              No hay mensajes
            </div>
          )}
        </div>
        <button 
          onClick={() => setMessages([])}
          className="btn-clear-messages"
        >
          Limpiar
        </button>
      </div>

      <div className="bridge-footer">
        <div className="connection-info">
          <span>WebSocket: {connectionStatus}</span>
          <span>Puerto: {port}</span>
          <span>Mensajes: {messages.length}</span>
        </div>
      </div>
    </div>
  );
};

export default EngineBridgeComponent; 