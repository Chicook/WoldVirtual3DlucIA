

import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeTitle: React.FC = () => (
  <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 drop-shadow-lg mb-8 animate-pulse">
    Wold Virtual
  </h1>
);

const HomeDescription: React.FC = () => (
  <p className="text-xl text-blue-200 max-w-md mx-auto mb-8">
    Explora el metaverso descentralizado del futuro
  </p>
);

const StartButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50"
  >
    Empezar
  </button>
);

const NavBar: React.FC = () => (
  <nav className="absolute top-0 left-0 w-full flex items-center justify-between px-8 py-4 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 z-20">
    <span className="text-2xl font-bold text-white tracking-widest">Wold Virtual</span>
    <div className="space-x-6">
      <a href="#" className="text-blue-200 hover:text-white transition-colors">Inicio</a>
      <a href="#features" className="text-blue-200 hover:text-white transition-colors">Características</a>
      <a href="#contact" className="text-blue-200 hover:text-white transition-colors">Contacto</a>
    </div>
  </nav>
);

const ParticleBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-ping"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 3}s`
        }}
      />
    ))}
  </div>
);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center relative">
      <NavBar />
      <div className="flex flex-col items-center justify-center flex-1 z-10 pt-32">
        <HomeTitle />
        <HomeDescription />
        <StartButton onClick={() => navigate('/avatar-selector')} />
      </div>
      <ParticleBackground />
    </div>
  );
};

export default HomePage; 

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface HomePageProps {
  onStartJourney: () => void
}

export const HomePage: React.FC<HomePageProps> = ({ onStartJourney }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<'male' | 'female' | null>(null)
  const [isHovered, setIsHovered] = useState<'male' | 'female' | null>(null)

  const handleAvatarSelect = (type: 'male' | 'female') => {
    setSelectedAvatar(type)
  }

  const handleStartJourney = () => {
    if (selectedAvatar) {
      onStartJourney()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl flex flex-col items-center justify-center">
          {/* Header Mejorado */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 w-full"
          >
            {/* Título Principal con mejor centrado y efectos */}
            <motion.h1 
              className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight"
              style={{
                textShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(147, 51, 234, 0.3)',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
              }}
            >
              Metaverso
            </motion.h1>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
              style={{
                textShadow: '0 0 30px rgba(236, 72, 153, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #c7d2fe 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
              }}
            >
              Crypto World
            </motion.h1>
  
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-8 font-medium text-center"
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
              }}
            >
              Explora mundos virtuales 3D con integración blockchain
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap justify-center space-x-6 text-sm text-gray-400 font-medium text-center"
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
              }}
            >
              <span className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🌍</span>
                <span>Mundos Virtuales</span>
              </span>
              <span className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">💰</span>
                <span>Blockchain</span>
              </span>
              <span className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🎮</span>
                <span>Gaming</span>
              </span>
              <span className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🤝</span>
                <span>Comunidad</span>
              </span>
            </motion.div>
          </motion.div>

          {/* Selección de Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12 w-full"
          >
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Elige tu Avatar
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
              {/* Avatar Masculino */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
                  selectedAvatar === 'male'
                    ? 'ring-4 ring-blue-400 shadow-2xl'
                    : 'ring-2 ring-gray-600 hover:ring-blue-300'
                }`}
                onClick={() => handleAvatarSelect('male')}
                onMouseEnter={() => setIsHovered('male')}
                onMouseLeave={() => setIsHovered(null)}
              >
                {/* Imagen generada por código */}
                <div className="h-96 bg-gradient-to-br from-blue-500 to-blue-700 relative flex flex-col items-center justify-center">
                  {/* Cabeza */}
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-blue-400 rounded-full border-4 border-white shadow-lg"></div>
                  {/* Cuerpo */}
                  <div className="absolute top-44 left-1/2 transform -translate-x-1/2 w-16 h-32 bg-blue-400 rounded-lg border-2 border-white shadow-lg"></div>
                  {/* Brazos */}
                  <div className="absolute top-52 -left-6 w-4 h-16 bg-blue-400 rounded-full border border-white transform rotate-12"></div>
                  <div className="absolute top-52 -right-6 w-4 h-16 bg-blue-400 rounded-full border border-white transform -rotate-12"></div>
                  {/* Piernas */}
                  <div className="absolute bottom-0 left-2 w-4 h-16 bg-blue-400 rounded-full border border-white"></div>
                  <div className="absolute bottom-0 right-2 w-4 h-16 bg-blue-400 rounded-full border border-white"></div>
                  {/* Efectos de animación */}
                  {isHovered === 'male' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-blue-400 bg-opacity-20"
                    />
                  )}
                </div>
                {/* Información */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Avatar Masculino</h3>
                  <p className="text-gray-300">Explorador valiente y aventurero</p>
                  <div className="flex items-center justify-center mt-2 space-x-2">
                    <span className="text-blue-400">⚔️</span>
                    <span className="text-blue-400">🛡️</span>
                    <span className="text-blue-400">🏃</span>
                  </div>
                </div>
              </motion.div>

              {/* Avatar Femenino */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
                  selectedAvatar === 'female'
                    ? 'ring-4 ring-pink-400 shadow-2xl'
                    : 'ring-2 ring-gray-600 hover:ring-pink-300'
                }`}
                onClick={() => handleAvatarSelect('female')}
                onMouseEnter={() => setIsHovered('female')}
                onMouseLeave={() => setIsHovered(null)}
              >
                {/* Imagen generada por código */}
                <div className="h-96 bg-gradient-to-br from-pink-500 to-pink-700 relative flex flex-col items-center justify-center">
                  {/* Cabeza */}
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-pink-400 rounded-full border-4 border-white shadow-lg"></div>
                  {/* Cuerpo */}
                  <div className="absolute top-44 left-1/2 transform -translate-x-1/2 w-16 h-32 bg-pink-400 rounded-lg border-2 border-white shadow-lg"></div>
                  {/* Brazos */}
                  <div className="absolute top-52 -left-6 w-4 h-16 bg-pink-400 rounded-full border border-white transform rotate-12"></div>
                  <div className="absolute top-52 -right-6 w-4 h-16 bg-pink-400 rounded-full border border-white transform -rotate-12"></div>
                  {/* Piernas */}
                  <div className="absolute bottom-0 left-2 w-4 h-16 bg-pink-400 rounded-full border border-white"></div>
                  <div className="absolute bottom-0 right-2 w-4 h-16 bg-pink-400 rounded-full border border-white"></div>
                  {/* Cabello */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-28 h-8 bg-pink-300 rounded-full"></div>
                  {/* Efectos de animación */}
                  {isHovered === 'female' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-pink-400 bg-opacity-20"
                    />
                  )}
                </div>
                {/* Información */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Avatar Femenino</h3>
                  <p className="text-gray-300">Guerrera sabia y poderosa</p>
                  <div className="flex items-center justify-center mt-2 space-x-2">
                    <span className="text-pink-400">✨</span>
                    <span className="text-pink-400">🔮</span>
                    <span className="text-pink-400">⚡</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Botón de inicio */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center w-full"
          >
            <button
              onClick={handleStartJourney}
              disabled={!selectedAvatar}
              className={`px-12 py-4 text-xl font-bold rounded-full transition-all duration-300 transform ${
                selectedAvatar
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedAvatar ? '🚀 Comenzar Aventura' : 'Selecciona tu Avatar'}
            </button>
            
            {selectedAvatar && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-300 mt-4"
              >
                ¡Perfecto! Has elegido el avatar {selectedAvatar === 'male' ? 'masculino' : 'femenino'}
              </motion.p>
            )}
          </motion.div>

          {/* Características */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                🌍
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Mundos Virtuales</h3>
              <p className="text-gray-300">Explora mundos únicos y dinámicos</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                💰
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Blockchain</h3>
              <p className="text-gray-300">Transacciones seguras y transparentes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                🎮
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Gaming</h3>
              <p className="text-gray-300">Experiencias inmersivas y divertidas</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default HomePage 
