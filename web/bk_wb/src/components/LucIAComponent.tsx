import React, { useState, useEffect, useRef } from 'react';
import { messageBus } from '../core/InterModuleMessageBus';

interface LucIAProps {
  userId?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'lucia';
  timestamp: Date;
  type: 'text' | 'code' | 'image' | 'system';
}

interface AICapability {
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

const LucIAComponent = ({ userId }: LucIAProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [capabilities, setCapabilities] = useState<AICapability[]>([
    {
      name: 'Código',
      description: 'Generar y analizar código',
      icon: '💻',
      enabled: true
    },
    {
      name: '3D',
      description: 'Crear y modificar modelos 3D',
      icon: '🎨',
      enabled: true
    },
    {
      name: 'Blockchain',
      description: 'Interactuar con la blockchain',
      icon: '⛓️',
      enabled: true
    },
    {
      name: 'Metaverso',
      description: 'Gestionar entornos virtuales',
      icon: '🌐',
      enabled: true
    },
    {
      name: 'Análisis',
      description: 'Analizar datos y métricas',
      icon: '📊',
      enabled: true
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mensaje de bienvenida
    const welcomeMessage: Message = {
      id: 'welcome',
      text: `¡Hola! Soy LucIA, tu asistente de IA en WoldVirtual3D. Estoy aquí para ayudarte con desarrollo, diseño 3D, blockchain y más. ¿En qué puedo ayudarte hoy?`,
      sender: 'lucia',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simular respuesta de LucIA
    setTimeout(() => {
      const luciaResponse = generateLuciaResponse(inputText);
      const luciaMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: luciaResponse,
        sender: 'lucia',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, luciaMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateLuciaResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hola') || input.includes('hello')) {
      return '¡Hola! ¿Cómo puedo ayudarte hoy? Puedo asistirte con desarrollo, diseño 3D, blockchain, o cualquier aspecto del metaverso.';
    }
    
    if (input.includes('código') || input.includes('code') || input.includes('programar')) {
      return '¡Perfecto! Puedo ayudarte con programación. ¿Qué lenguaje prefieres? Puedo generar código en JavaScript, TypeScript, Python, Solidity para blockchain, y más.';
    }
    
    if (input.includes('3d') || input.includes('modelo') || input.includes('diseño')) {
      return '¡Excelente! Para diseño 3D puedo ayudarte con modelado, texturizado, animaciones, y optimización de assets. ¿Qué tipo de proyecto tienes en mente?';
    }
    
    if (input.includes('blockchain') || input.includes('nft') || input.includes('smart contract')) {
      return '¡Genial! Para blockchain puedo ayudarte con smart contracts, NFTs, DeFi, y desarrollo de dApps. ¿Qué aspecto te interesa más?';
    }
    
    if (input.includes('metaverso') || input.includes('virtual') || input.includes('avatar')) {
      return '¡Fascinante! Para el metaverso puedo ayudarte con entornos virtuales, avatares, interacciones sociales, y experiencias inmersivas.';
    }
    
    return 'Entiendo tu consulta. Como IA especializada en WoldVirtual3D, puedo ayudarte con desarrollo, diseño 3D, blockchain, y creación de experiencias en el metaverso. ¿Puedes ser más específico sobre lo que necesitas?';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleCapability = (capabilityName: string) => {
    setCapabilities(prev => prev.map(cap => 
      cap.name === capabilityName 
        ? { ...cap, enabled: !cap.enabled }
        : cap
    ));
  };

  const handleQuickAction = (action: string) => {
    const quickMessages = {
      'code': '¿Puedes ayudarme a generar código para un componente React?',
      '3d': 'Necesito ayuda para crear un modelo 3D de un personaje',
      'blockchain': '¿Cómo puedo crear un smart contract para NFTs?',
      'metaverso': 'Quiero diseñar un entorno virtual para el metaverso'
    };
    
    setInputText(quickMessages[action as keyof typeof quickMessages] || '');
  };

  return (
    <div className="lucia-container">
      <div className="lucia-header">
        <div className="lucia-info">
          <div className="lucia-avatar">🤖</div>
          <div className="lucia-details">
            <h2>LucIA</h2>
            <p>Asistente de IA - WoldVirtual3D</p>
          </div>
        </div>
        <div className="lucia-status">
          <span className="status-indicator online"></span>
          <span className="status-text">Online</span>
        </div>
      </div>

      <div className="lucia-controls">
        <div className="model-selector">
          <label>Modelo IA:</label>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-select"
          >
            <option value="gpt-4">GPT-4</option>
            <option value="claude-3">Claude-3</option>
            <option value="custom-woldvirtual">WoldVirtual Custom</option>
          </select>
        </div>

        <div className="capabilities-toggle">
          <span>Capacidades:</span>
          {capabilities.map(cap => (
            <button
              key={cap.name}
              onClick={() => toggleCapability(cap.name)}
              className={`capability-btn ${cap.enabled ? 'enabled' : 'disabled'}`}
              title={cap.description}
            >
              {cap.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <button onClick={() => handleQuickAction('code')} className="quick-btn">
          💻 Código
        </button>
        <button onClick={() => handleQuickAction('3d')} className="quick-btn">
          🎨 3D
        </button>
        <button onClick={() => handleQuickAction('blockchain')} className="quick-btn">
          ⛓️ Blockchain
        </button>
        <button onClick={() => handleQuickAction('metaverso')} className="quick-btn">
          🌐 Metaverso
        </button>
      </div>

      <div className="chat-container">
        <div className="messages-area">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.sender}`}
            >
              <div className="message-avatar">
                {message.sender === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message lucia typing">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje a LucIA..."
              className="message-input"
              rows={1}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="send-btn"
            >
              ➤
            </button>
          </div>
          <div className="input-hints">
            <small>Presiona Enter para enviar, Shift+Enter para nueva línea</small>
          </div>
        </div>
      </div>

      <div className="lucia-footer">
        <div className="footer-info">
          <span>Usuario: {userId}</span>
          <span>Modelo: {selectedModel}</span>
          <span>Capacidades: {capabilities.filter(c => c.enabled).length}/5</span>
        </div>
        <div className="footer-actions">
          <button 
            onClick={() => setMessages([])}
            className="btn-secondary"
          >
            Limpiar Chat
          </button>
          <button 
            onClick={() => messageBus.publish('lucia-export', { messages, userId })}
            className="btn-primary"
          >
            Exportar Conversación
          </button>
        </div>
      </div>
    </div>
  );
};

export default LucIAComponent; 