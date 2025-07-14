
// LucIA UI Component
import React, { useState, useEffect } from 'react';
import LucIAVirtualStudio from './LucIAStudio.js';
import LucIAVoice from './LucIAVoice.js';

const LucIAUI = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [voiceSystem, setVoiceSystem] = useState(null);
    
    useEffect(() => {
        const voice = new LucIAVoice();
        setVoiceSystem(voice);
        
        const studio = new LucIAVirtualStudio();
    }, []);
    
    const sendMessage = (text) => {
        if (!text.trim()) return;
        
        const userMessage = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        
        setTimeout(() => {
            const luciaResponse = {
                id: Date.now() + 1,
                text: "¡Hola! Soy LucIA, tu asistente virtual. ¿En qué puedo ayudarte?",
                sender: 'lucia',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, luciaResponse]);
            
            if (voiceSystem) {
                voiceSystem.speak(luciaResponse.text);
            }
        }, 1000);
    };
    
    const toggleVoiceRecognition = () => {
        setIsListening(!isListening);
        if (!isListening && voiceSystem) {
            voiceSystem.startVoiceRecognition();
        }
    };
    
    const toggleCamera = () => {
        setIsCameraOn(!isCameraOn);
    };
    
    return (
        <div className="lucia-ui">
            <div className="virtual-environment" id="threejs-container">
                {/* Three.js se renderiza aquí */}
            </div>
            
            <div className="chat-interface">
                <div className="chat-header">
                    <h3>💬 Chat con LucIA</h3>
                    <div className="chat-controls">
                        <button 
                            className={isListening ? 'active' : ''}
                            onClick={toggleVoiceRecognition}
                        >
                            🎤
                        </button>
                        <button 
                            className={isCameraOn ? 'active' : ''}
                            onClick={toggleCamera}
                        >
                            📹
                        </button>
                    </div>
                </div>
                
                <div className="chat-messages">
                    {messages.map(message => (
                        <div key={message.id} className={`message ${message.sender}`}>
                            <div className="message-content">{message.text}</div>
                            <div className="message-time">
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="chat-input">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                        placeholder="Escribe tu mensaje..."
                    />
                    <button onClick={() => sendMessage(inputText)}>
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LucIAUI;
