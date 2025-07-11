import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Avatar3D } from './components/Avatar3D';
import { Environment3D } from './components/Environment3D';
import { VoiceSynthesis } from './components/VoiceSynthesis';
import { luciaConfig } from './utils/avatarConfig';
import './App.css';

function App() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<'neutral' | 'happy' | 'concentrated' | 'curious'>('neutral');
  const [speechText, setSpeechText] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Presentación inicial de lucIA
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
      setSpeechText("Hola, soy lucIA. Una inteligencia artificial diseñada para ayudarte en el metaverso WoldVirtual3D. Tengo 35 años y estoy aquí para crear experiencias únicas contigo.");
      setIsSpeaking(true);
      setCurrentEmotion('happy');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Manejar fin del habla
  const handleSpeechEnd = () => {
    setIsSpeaking(false);
    setCurrentEmotion('neutral');
  };

  // Manejar inicio del habla
  const handleSpeechStart = () => {
    setIsSpeaking(true);
  };

  // Manejar sincronización labial
  const handleLipSync = (mouthOpen: number) => {
    // La sincronización labial se maneja internamente en el componente Avatar3D
  };

  // Función para cambiar emoción
  const changeEmotion = (emotion: 'neutral' | 'happy' | 'concentrated' | 'curious') => {
    setCurrentEmotion(emotion);
    
    const emotionTexts = {
      happy: "¡Me alegra mucho verte! Estoy muy contenta de poder ayudarte.",
      concentrated: "Estoy concentrada en procesar la información para darte la mejor respuesta.",
      curious: "Me interesa mucho lo que me cuentas. ¿Puedes contarme más?",
      neutral: "Entiendo perfectamente. ¿En qué puedo ayudarte?"
    };

    setSpeechText(emotionTexts[emotion]);
    setIsSpeaking(true);
  };

  return (
    <div className="App">
      {/* Controles de interfaz */}
      <div className="controls">
        <h1>lucIA 3D - Metaverso WoldVirtual3D</h1>
        <div className="emotion-buttons">
          <button 
            onClick={() => changeEmotion('happy')}
            className={currentEmotion === 'happy' ? 'active' : ''}
          >
            😊 Alegre
          </button>
          <button 
            onClick={() => changeEmotion('concentrated')}
            className={currentEmotion === 'concentrated' ? 'active' : ''}
          >
            🤔 Concentrada
          </button>
          <button 
            onClick={() => changeEmotion('curious')}
            className={currentEmotion === 'curious' ? 'active' : ''}
          >
            🤨 Curiosa
          </button>
          <button 
            onClick={() => changeEmotion('neutral')}
            className={currentEmotion === 'neutral' ? 'active' : ''}
          >
            😐 Neutral
          </button>
        </div>
        
        <div className="status">
          <p>Estado: {isSpeaking ? 'Hablando' : 'Escuchando'}</p>
          <p>Emoción: {currentEmotion}</p>
          <p>Edad: {luciaConfig.physical.age} años</p>
          <p>Etnia: {luciaConfig.physical.ethnicity}</p>
        </div>
      </div>

      {/* Canvas 3D */}
      <div className="canvas-container">
        <Canvas
          camera={{
            position: luciaConfig.camera.position as [number, number, number],
            fov: luciaConfig.camera.fov,
            near: luciaConfig.camera.near,
            far: luciaConfig.camera.far
          }}
          shadows
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
        >
          {/* Controles de cámara */}
          <OrbitControls
            target={luciaConfig.camera.target as [number, number, number]}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={2}
            maxDistance={10}
          />

          {/* Estadísticas de rendimiento (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && <Stats />}

          {/* Entorno 3D */}
          <Environment3D timeOfDay="digital" />

          {/* Avatar de lucIA */}
          <Avatar3D
            isSpeaking={isSpeaking}
            emotion={currentEmotion}
            onAnimationComplete={() => {}}
          />

          {/* Sistema de voz (invisible) */}
          <VoiceSynthesis
            text={speechText}
            isSpeaking={isSpeaking}
            onSpeechStart={handleSpeechStart}
            onSpeechEnd={handleSpeechEnd}
            onLipSync={handleLipSync}
          />
        </Canvas>
      </div>

      {/* Información del proyecto */}
      <div className="project-info">
        <h2>WoldVirtual3DlucIA v0.6.0</h2>
        <p>Metaverso descentralizado con IA personalizada</p>
        <p>lucIA - Tu asistente virtual en 3D</p>
      </div>
    </div>
  );
}

export default App; 