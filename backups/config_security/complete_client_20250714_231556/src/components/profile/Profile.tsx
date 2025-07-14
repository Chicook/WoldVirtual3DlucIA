

import React, { useState } from 'react'
import { Avatar } from '@/types/metaverso'
import { useMetaverso } from '@/contexts/MetaversoContext'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Avatar } from '@/types/metaverso'
import { useMetaverso } from '@/contexts/MetaversoContext'
import { motion } from 'framer-motion'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Avatar } from '@/types/metaverso'
import { useMetaverso } from '@/contexts/MetaversoContext'
import { motion } from 'framer-motion'

import React, { useState } from 'react'
import { Avatar } from '@/types/metaverso'
import { useMetaverso } from '@/contexts/MetaversoContext'

interface ProfileProps {
  onClose: () => void
}

// Componente avanzado de estadísticas dinámicas
const DynamicStats: React.FC<{ avatar: Avatar }> = ({ avatar }) => {
  const [activeTab, setActiveTab] = useState<'combat' | 'exploration' | 'social' | 'crafting' | 'economy'>('combat')
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const stats = useMemo(() => ({
    combat: {
      level: avatar.level,
      experience: avatar.experience,
      health: avatar.health,
      energy: avatar.energy,
      skills: avatar.skills.length
    },
    exploration: {
      worldsVisited: 5,
      areasDiscovered: 12,
      secretsFound: 3,
      distanceTraveled: 2500
    },
    social: {
      friends: 8,
      guildsJoined: 2,
      partiesJoined: 15,
      tradesCompleted: 25
    },
    crafting: {
      itemsCrafted: 45,
      recipesLearned: 18,
      materialsGathered: 120,
      qualityItems: 12
    },
    economy: {
      goldEarned: 50000,
      goldSpent: 25000,
      itemsSold: 35,
      itemsBought: 28
    }
  }), [avatar])

  const tabs = [
    { id: 'combat', name: 'Combate', icon: '⚔️', color: 'red' },
    { id: 'exploration', name: 'Exploración', icon: '🗺️', color: 'blue' },
    { id: 'social', name: 'Social', icon: '👥', color: 'green' },
    { id: 'crafting', name: 'Crafteo', icon: '🔨', color: 'yellow' },
    { id: 'economy', name: 'Economía', icon: '💰', color: 'purple' }
  ] as const

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'text-red-400'
      case 'blue': return 'text-blue-400'
      case 'green': return 'text-green-400'
      case 'yellow': return 'text-yellow-400'
      case 'purple': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const renderStats = useCallback(() => {
    const currentStats = stats[activeTab]
    const entries = Object.entries(currentStats)
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {entries.map(([key, value], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500"
          >
            <div className="text-sm text-gray-400 capitalize mb-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="text-xl font-bold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {/* Barra de progreso animada */}
            <div className="mt-2 w-full bg-gray-600 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min(100, (value as number / 100) * 100)}%`,
                  animation: `pulse 2s infinite`
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }, [stats, activeTab])

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Estadísticas Dinámicas</h3>
      
      {/* Tabs animados */}
      <div className="flex space-x-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-102'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Stats Content */}
      {renderStats()}

      {/* Gráfico de progreso circular */}
      <div className="mt-6 flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-600"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${animationProgress * 3.52} 352`}
              className={`${getColorClass(tabs.find(t => t.id === activeTab)?.color || 'gray')} transition-all duration-1000`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{animationProgress}%</div>
              <div className="text-sm text-gray-400">Progreso</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente avanzado de logros con animaciones
const AdvancedAchievements: React.FC = () => {
  const [achievements] = useState([
    {
      id: 'first_kill',
      name: 'Primera Sangre',
      description: 'Derrota a tu primer enemigo',
      icon: '⚔️',
      rarity: 'common',
      unlocked: true,
      progress: 100,
      target: 1,
      points: 10,
      unlockDate: new Date('2024-01-15')
    },
    {
      id: 'explorer',
      name: 'Explorador',
      description: 'Visita 10 áreas diferentes',
      icon: '🗺️',
      rarity: 'uncommon',
      unlocked: false,
      progress: 7,
      target: 10,
      points: 25
    },
    {
      id: 'craftsman',
      name: 'Artesano',
      description: 'Crea 50 objetos',
      icon: '🔨',
      rarity: 'rare',
      unlocked: false,
      progress: 32,
      target: 50,
      points: 50
    },
    {
      id: 'social_butterfly',
      name: 'Mariposa Social',
      description: 'Haz 20 amigos',
      icon: '🦋',
      rarity: 'epic',
      unlocked: false,
      progress: 15,
      target: 20,
      points: 100
    },
    {
      id: 'legendary_hero',
      name: 'Héroe Legendario',
      description: 'Completa todas las misiones principales',
      icon: '👑',
      rarity: 'legendary',
      unlocked: false,
      progress: 0,
      target: 100,
      points: 500
    }
  ])

  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [sortBy, setSortBy] = useState<'rarity' | 'progress' | 'points'>('progress')

  const filteredAchievements = useMemo(() => {
    let filtered = achievements
    
    if (filter === 'unlocked') {
      filtered = filtered.filter(a => a.unlocked)
    } else if (filter === 'locked') {
      filtered = filtered.filter(a => !a.unlocked)
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          const rarityOrder: Record<string, number> = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 }
          return rarityOrder[a.rarity] - rarityOrder[b.rarity]
        case 'progress':
          return (b.progress / b.target) - (a.progress / a.target)
        case 'points':
          return b.points - a.points
        default:
          return 0
      }
    })
  }, [achievements, filter, sortBy])

  const totalPoints = useMemo(() => {
    return achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0)
  }, [achievements])

  const completionRate = useMemo(() => {
    return achievements.length > 0 
      ? (achievements.filter(a => a.unlocked).length / achievements.length) * 100 
      : 0
  }, [achievements])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-500'
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-cyan-500'
      case 'uncommon': return 'bg-gradient-to-r from-green-400 to-emerald-500'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500'
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Logros Avanzados</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-gray-300">
            Puntos: <span className="text-yellow-400 font-semibold">{totalPoints}</span>
          </div>
          <div className="text-gray-300">
            Completado: <span className="text-green-400 font-semibold">{completionRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Filtros avanzados */}
      <div className="flex space-x-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">Todos los Logros</option>
          <option value="unlocked">Desbloqueados</option>
          <option value="locked">Bloqueados</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="progress">Por Progreso</option>
          <option value="rarity">Por Rareza</option>
          <option value="points">Por Puntos</option>
        </select>
      </div>

      {/* Grid de logros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              achievement.unlocked
                ? 'bg-gray-700 border-green-500 shadow-lg shadow-green-500/20'
                : 'bg-gray-900 border-gray-600 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{achievement.icon}</div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${getRarityColor(achievement.rarity)}`}>
                {achievement.points} pts
              </div>
            </div>
            
            <h4 className="font-semibold text-white mb-2">{achievement.name}</h4>
            <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>
            
            <div className="flex items-center justify-between text-xs mb-3">
              <span className={`px-2 py-1 rounded capitalize ${getRarityColor(achievement.rarity)}`}>
                {achievement.rarity}
              </span>
              
              {achievement.unlocked && achievement.unlockDate && (
                <span className="text-gray-500">
                  {achievement.unlockDate.toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Barra de progreso avanzada */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progreso</span>
                <span>{achievement.progress}/{achievement.target}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full ${achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Efecto de desbloqueo */}
            {achievement.unlocked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-lg pointer-events-none"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Componente principal avanzado
export const Profile: React.FC<ProfileProps> = ({ }) => {
  const { state, updateAvatar } = useMetaverso()
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'achievements' | 'customization'>('overview')
  const [avatarData, setAvatarData] = useState<Partial<Avatar>>({
    name: '',
    level: 1,
    experience: 0,
    health: 100,
    energy: 100,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    model: 'default',
    texture: 'default',
    animations: ['idle'],
    currentAnimation: 'idle',
    skills: [],
    equipment: {
      weapon: undefined,
      head: undefined,
      chest: undefined,
      legs: undefined,
      feet: undefined,
      hands: undefined,
      shield: undefined,
      accessory1: undefined,
      accessory2: undefined,
      accessory3: undefined
    },
    customization: {
      skinColor: '#ffdbac',
      hairStyle: 'short',
      hairColor: '#8b4513',
      eyeColor: '#000000',
      facialFeatures: [],
      tattoos: [],
      scars: [],
      accessories: []
    }
  })

  // Actualizar datos del avatar cuando cambie el estado
  useEffect(() => {
    if (state.userAvatar) {
      setAvatarData(state.userAvatar)
    }
  }, [state.userAvatar])

  const handleAvatarUpdate = useCallback(async (updates: Partial<Avatar>) => {
    try {
      if (state.userAvatar) {
        const updatedAvatar: Avatar = {
          ...state.userAvatar,
          ...updates
        }
        await updateAvatar(updatedAvatar)
      }
    } catch (error) {
      console.error('Error al actualizar avatar:', error)
    }
  }, [state.userAvatar, updateAvatar])

  const handleSave = useCallback(async () => {
    try {
      await handleAvatarUpdate(avatarData)
    } catch (error) {
      console.error('Error al guardar perfil:', error)
    }
  }, [avatarData, handleAvatarUpdate])

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: '📊' },
    { id: 'stats', name: 'Estadísticas', icon: '📈' },
    { id: 'achievements', name: 'Logros', icon: '🏆' },
    { id: 'customization', name: 'Personalización', icon: '🎨' }
  ] as const

  if (!state.userAvatar) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">👤</div>
          <p>No hay avatar seleccionado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header avanzado */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {state.userAvatar.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{state.userAvatar.name}</h1>
            <p className="text-gray-400 mb-4">Nivel {state.userAvatar.level} • {state.userAvatar.experience} EXP</p>
            
            {/* Barras de progreso avanzadas */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Salud</span>
                  <span className="text-gray-400">{state.userAvatar.health}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${state.userAvatar.health}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Energía</span>
                  <span className="text-gray-400">{state.userAvatar.energy}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${state.userAvatar.energy}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          {state.wallet && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Balance</div>
              <div className="text-2xl font-bold text-white">
                {state.wallet.balance.gold.toLocaleString()} 🪙
              </div>
              <div className="text-sm text-gray-400">
                {state.wallet.transactions.length} transacciones
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs avanzados */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Información General</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mundo Actual:</span>
                  <span className="text-white">{state.currentWorld?.name || 'Ninguno'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Jugadores Cercanos:</span>
                  <span className="text-white">{state.nearbyUsers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Objetos Cercanos:</span>
                  <span className="text-white">{state.nearbyObjects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Misiones Activas:</span>
                  <span className="text-white">{state.activeQuests.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                {state.chatMessages.slice(-5).map((message) => (
                  <div key={message.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                      {message.sender.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{message.sender.username}</div>
                      <div className="text-xs text-gray-400">{message.text}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}

export const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const { state, updateAvatar } = useMetaverso()
  const [activeTab, setActiveTab] = useState<'avatar' | 'settings' | 'stats'>('avatar')
  const [avatarData, setAvatarData] = useState<Partial<Avatar>>(
    state.userAvatar || {
      name: '',
      level: 1,
      experience: 0,
      health: 100,
      energy: 100,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      model: '',
      animations: [],
      customizations: {},
      equipment: {},
      inventory: [],
      stats: {
        strength: 10,
        agility: 10,
        intelligence: 10,
        charisma: 10
      }
    }
  )

  const handleSave = () => {
    updateAvatar(avatarData)
    onClose()
  }

  const handleCustomizationChange = (key: string, value: any) => {
    setAvatarData(prev => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        [key]: value
      }
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Perfil del Usuario</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('avatar')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'avatar'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Avatar
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Configuración
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'stats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Estadísticas
          </button>
        </div>

        {/* Avatar Tab */}
        {activeTab === 'avatar' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Avatar
              </label>
              <input
                type="text"
                value={avatarData.name || ''}
                onChange={(e) => setAvatarData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Piel
                </label>
                <input
                  type="color"
                  value={avatarData.customizations?.skinColor || '#FFB6C1'}
                  onChange={(e) => handleCustomizationChange('skinColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Cabello
                </label>
                <input
                  type="color"
                  value={avatarData.customizations?.hairColor || '#8B4513'}
                  onChange={(e) => handleCustomizationChange('hairColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Altura
                </label>
                <input
                  type="range"
                  min="1.5"
                  max="2.0"
                  step="0.1"
                  value={avatarData.customizations?.height || 1.7}
                  onChange={(e) => handleCustomizationChange('height', parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">
                  {avatarData.customizations?.height || 1.7}m
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  value={avatarData.customizations?.weight || 70}
                  onChange={(e) => handleCustomizationChange('weight', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">
                  {avatarData.customizations?.weight || 70}kg
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && state.userAvatar && (
          <DynamicStats avatar={state.userAvatar} />
        )}

        {activeTab === 'achievements' && (
          <AdvancedAchievements />
        )}

        {activeTab === 'customization' && state.userAvatar && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Personalización Avanzada</h3>
            <p className="text-gray-400 mb-6">Personaliza tu avatar con opciones avanzadas</p>
            
            {/* Aquí irían los controles de personalización */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color de Piel</label>
                <input
                  type="color"
                  value={avatarData.customization?.skinColor || '#ffdbac'}
                  onChange={(e) => setAvatarData(prev => ({
                    ...prev,
                    customization: {
                      ...prev.customization!,
                      skinColor: e.target.value
                    }
                  }))}
                  className="w-full h-10 rounded border border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color de Pelo</label>
                <input
                  type="color"
                  value={avatarData.customization?.hairColor || '#8b4513'}
                  onChange={(e) => setAvatarData(prev => ({
                    ...prev,
                    customization: {
                      ...prev.customization!,
                      hairColor: e.target.value
                    }
                  }))}
                  className="w-full h-10 rounded border border-gray-600"
                />

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calidad de Gráficos
              </label>
              <select
                value={state.settings.graphics}
                onChange={(e) => {
                  // Aquí se actualizarían las configuraciones
                  console.log('Cambiando calidad de gráficos:', e.target.value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="ultra">Ultra</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Audio</span>
              <input
                type="checkbox"
                checked={state.settings.audio}
                onChange={(e) => {
                  console.log('Cambiando audio:', e.target.checked)
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Notificaciones</span>
              <input
                type="checkbox"
                checked={state.settings.notifications}
                onChange={(e) => {
                  console.log('Cambiando notificaciones:', e.target.checked)
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && state.userAvatar && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Nivel</h3>
                <p className="text-2xl font-bold text-blue-600">{state.userAvatar.level}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Experiencia</h3>
                <p className="text-2xl font-bold text-green-600">{state.userAvatar.experience}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Salud</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${state.userAvatar.health}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{state.userAvatar.health}/100</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Energía</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${state.userAvatar.energy}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{state.userAvatar.energy}/100</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-4">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Fuerza</span>
                  <p className="font-medium">{state.userAvatar.stats.strength}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Agilidad</span>
                  <p className="font-medium">{state.userAvatar.stats.agility}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Inteligencia</span>
                  <p className="font-medium">{state.userAvatar.stats.intelligence}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Carisma</span>
                  <p className="font-medium">{state.userAvatar.stats.charisma}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Save Button */}
      {activeTab === 'customization' && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Guardar Cambios
          </button>

// Componente avanzado de estadísticas dinámicas
const DynamicStats: React.FC<{ avatar: Avatar }> = ({ avatar }) => {
  const [activeTab, setActiveTab] = useState<'combat' | 'exploration' | 'social' | 'crafting' | 'economy'>('combat')
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const stats = useMemo(() => ({
    combat: {
      level: avatar.level,
      experience: avatar.experience,
      health: avatar.health,
      energy: avatar.energy,
      skills: avatar.skills.length
    },
    exploration: {
      worldsVisited: 5,
      areasDiscovered: 12,
      secretsFound: 3,
      distanceTraveled: 2500
    },
    social: {
      friends: 8,
      guildsJoined: 2,
      partiesJoined: 15,
      tradesCompleted: 25
    },
    crafting: {
      itemsCrafted: 45,
      recipesLearned: 18,
      materialsGathered: 120,
      qualityItems: 12
    },
    economy: {
      goldEarned: 50000,
      goldSpent: 25000,
      itemsSold: 35,
      itemsBought: 28
    }
  }), [avatar])

  const tabs = [
    { id: 'combat', name: 'Combate', icon: '⚔️', color: 'red' },
    { id: 'exploration', name: 'Exploración', icon: '🗺️', color: 'blue' },
    { id: 'social', name: 'Social', icon: '👥', color: 'green' },
    { id: 'crafting', name: 'Crafteo', icon: '🔨', color: 'yellow' },
    { id: 'economy', name: 'Economía', icon: '💰', color: 'purple' }
  ] as const

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'text-red-400'
      case 'blue': return 'text-blue-400'
      case 'green': return 'text-green-400'
      case 'yellow': return 'text-yellow-400'
      case 'purple': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const renderStats = useCallback(() => {
    const currentStats = stats[activeTab]
    const entries = Object.entries(currentStats)
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {entries.map(([key, value], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500"
          >
            <div className="text-sm text-gray-400 capitalize mb-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="text-xl font-bold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {/* Barra de progreso animada */}
            <div className="mt-2 w-full bg-gray-600 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min(100, (value as number / 100) * 100)}%`,
                  animation: `pulse 2s infinite`
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }, [stats, activeTab])

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Estadísticas Dinámicas</h3>
      
      {/* Tabs animados */}
      <div className="flex space-x-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-102'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Stats Content */}
      {renderStats()}

      {/* Gráfico de progreso circular */}
      <div className="mt-6 flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-600"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${animationProgress * 3.52} 352`}
              className={`${getColorClass(tabs.find(t => t.id === activeTab)?.color || 'gray')} transition-all duration-1000`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{animationProgress}%</div>
              <div className="text-sm text-gray-400">Progreso</div>
            </div>
          </div>
        </div>

      )}
    </div>
  )
}

export default Profile 

      </div>
    </div>
  )

} 

}

// Componente avanzado de logros con animaciones
const AdvancedAchievements: React.FC = () => {
  const [achievements] = useState([
    {
      id: 'first_kill',
      name: 'Primera Sangre',
      description: 'Derrota a tu primer enemigo',
      icon: '⚔️',
      rarity: 'common',
      unlocked: true,
      progress: 100,
      target: 1,
      points: 10,
      unlockDate: new Date('2024-01-15')
    },
    {
      id: 'explorer',
      name: 'Explorador',
      description: 'Visita 10 áreas diferentes',
      icon: '🗺️',
      rarity: 'uncommon',
      unlocked: false,
      progress: 7,
      target: 10,
      points: 25
    },
    {
      id: 'craftsman',
      name: 'Artesano',
      description: 'Crea 50 objetos',
      icon: '🔨',
      rarity: 'rare',
      unlocked: false,
      progress: 32,
      target: 50,
      points: 50
    },
    {
      id: 'social_butterfly',
      name: 'Mariposa Social',
      description: 'Haz 20 amigos',
      icon: '🦋',
      rarity: 'epic',
      unlocked: false,
      progress: 15,
      target: 20,
      points: 100
    },
    {
      id: 'legendary_hero',
      name: 'Héroe Legendario',
      description: 'Completa todas las misiones principales',
      icon: '👑',
      rarity: 'legendary',
      unlocked: false,
      progress: 0,
      target: 100,
      points: 500
    }
  ])

  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [sortBy, setSortBy] = useState<'rarity' | 'progress' | 'points'>('progress')

  const filteredAchievements = useMemo(() => {
    let filtered = achievements
    
    if (filter === 'unlocked') {
      filtered = filtered.filter(a => a.unlocked)
    } else if (filter === 'locked') {
      filtered = filtered.filter(a => !a.unlocked)
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          const rarityOrder: Record<string, number> = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 }
          return rarityOrder[a.rarity] - rarityOrder[b.rarity]
        case 'progress':
          return (b.progress / b.target) - (a.progress / a.target)
        case 'points':
          return b.points - a.points
        default:
          return 0
      }
    })
  }, [achievements, filter, sortBy])

  const totalPoints = useMemo(() => {
    return achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0)
  }, [achievements])

  const completionRate = useMemo(() => {
    return achievements.length > 0 
      ? (achievements.filter(a => a.unlocked).length / achievements.length) * 100 
      : 0
  }, [achievements])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-500'
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-cyan-500'
      case 'uncommon': return 'bg-gradient-to-r from-green-400 to-emerald-500'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500'
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Logros Avanzados</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-gray-300">
            Puntos: <span className="text-yellow-400 font-semibold">{totalPoints}</span>
          </div>
          <div className="text-gray-300">
            Completado: <span className="text-green-400 font-semibold">{completionRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Filtros avanzados */}
      <div className="flex space-x-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">Todos los Logros</option>
          <option value="unlocked">Desbloqueados</option>
          <option value="locked">Bloqueados</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="progress">Por Progreso</option>
          <option value="rarity">Por Rareza</option>
          <option value="points">Por Puntos</option>
        </select>
      </div>

      {/* Grid de logros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              achievement.unlocked
                ? 'bg-gray-700 border-green-500 shadow-lg shadow-green-500/20'
                : 'bg-gray-900 border-gray-600 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{achievement.icon}</div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${getRarityColor(achievement.rarity)}`}>
                {achievement.points} pts
              </div>
            </div>
            
            <h4 className="font-semibold text-white mb-2">{achievement.name}</h4>
            <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>
            
            <div className="flex items-center justify-between text-xs mb-3">
              <span className={`px-2 py-1 rounded capitalize ${getRarityColor(achievement.rarity)}`}>
                {achievement.rarity}
              </span>
              
              {achievement.unlocked && achievement.unlockDate && (
                <span className="text-gray-500">
                  {achievement.unlockDate.toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Barra de progreso avanzada */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progreso</span>
                <span>{achievement.progress}/{achievement.target}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full ${achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Efecto de desbloqueo */}
            {achievement.unlocked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-lg pointer-events-none"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Componente principal avanzado
export const Profile: React.FC<ProfileProps> = ({ }) => {
  const { state, updateAvatar } = useMetaverso()
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'achievements' | 'customization'>('overview')
  const [avatarData, setAvatarData] = useState<Partial<Avatar>>({
    name: '',
    level: 1,
    experience: 0,
    health: 100,
    energy: 100,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    model: 'default',
    texture: 'default',
    animations: ['idle'],
    currentAnimation: 'idle',
    skills: [],
    equipment: {
      weapon: undefined,
      head: undefined,
      chest: undefined,
      legs: undefined,
      feet: undefined,
      hands: undefined,
      shield: undefined,
      accessory1: undefined,
      accessory2: undefined,
      accessory3: undefined
    },
    customization: {
      skinColor: '#ffdbac',
      hairStyle: 'short',
      hairColor: '#8b4513',
      eyeColor: '#000000',
      facialFeatures: [],
      tattoos: [],
      scars: [],
      accessories: []
    }
  })

  // Actualizar datos del avatar cuando cambie el estado
  useEffect(() => {
    if (state.userAvatar) {
      setAvatarData(state.userAvatar)
    }
  }, [state.userAvatar])

  const handleAvatarUpdate = useCallback(async (updates: Partial<Avatar>) => {
    try {
      if (state.userAvatar) {
        const updatedAvatar: Avatar = {
          ...state.userAvatar,
          ...updates
        }
        await updateAvatar(updatedAvatar)
      }
    } catch (error) {
      console.error('Error al actualizar avatar:', error)
    }
  }, [state.userAvatar, updateAvatar])

  const handleSave = useCallback(async () => {
    try {
      await handleAvatarUpdate(avatarData)
    } catch (error) {
      console.error('Error al guardar perfil:', error)
    }
  }, [avatarData, handleAvatarUpdate])

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: '📊' },
    { id: 'stats', name: 'Estadísticas', icon: '📈' },
    { id: 'achievements', name: 'Logros', icon: '🏆' },
    { id: 'customization', name: 'Personalización', icon: '🎨' }
  ] as const

  if (!state.userAvatar) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">👤</div>
          <p>No hay avatar seleccionado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header avanzado */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {state.userAvatar.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{state.userAvatar.name}</h1>
            <p className="text-gray-400 mb-4">Nivel {state.userAvatar.level} • {state.userAvatar.experience} EXP</p>
            
            {/* Barras de progreso avanzadas */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Salud</span>
                  <span className="text-gray-400">{state.userAvatar.health}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${state.userAvatar.health}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Energía</span>
                  <span className="text-gray-400">{state.userAvatar.energy}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${state.userAvatar.energy}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          {state.wallet && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Balance</div>
              <div className="text-2xl font-bold text-white">
                {state.wallet.balance.gold.toLocaleString()} 🪙
              </div>
              <div className="text-sm text-gray-400">
                {state.wallet.transactions.length} transacciones
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs avanzados */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Información General</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mundo Actual:</span>
                  <span className="text-white">{state.currentWorld?.name || 'Ninguno'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Jugadores Cercanos:</span>
                  <span className="text-white">{state.nearbyUsers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Objetos Cercanos:</span>
                  <span className="text-white">{state.nearbyObjects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Misiones Activas:</span>
                  <span className="text-white">{state.activeQuests.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                {state.chatMessages.slice(-5).map((message) => (
                  <div key={message.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                      {message.sender.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{message.sender.username}</div>
                      <div className="text-xs text-gray-400">{message.text}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && state.userAvatar && (
          <DynamicStats avatar={state.userAvatar} />
        )}

        {activeTab === 'achievements' && (
          <AdvancedAchievements />
        )}

        {activeTab === 'customization' && state.userAvatar && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Personalización Avanzada</h3>
            <p className="text-gray-400 mb-6">Personaliza tu avatar con opciones avanzadas</p>
            
            {/* Aquí irían los controles de personalización */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color de Piel</label>
                <input
                  type="color"
                  value={avatarData.customization?.skinColor || '#ffdbac'}
                  onChange={(e) => setAvatarData(prev => ({
                    ...prev,
                    customization: {
                      ...prev.customization!,
                      skinColor: e.target.value
                    }
                  }))}
                  className="w-full h-10 rounded border border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color de Pelo</label>
                <input
                  type="color"
                  value={avatarData.customization?.hairColor || '#8b4513'}
                  onChange={(e) => setAvatarData(prev => ({
                    ...prev,
                    customization: {
                      ...prev.customization!,
                      hairColor: e.target.value
                    }
                  }))}
                  className="w-full h-10 rounded border border-gray-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      {activeTab === 'customization' && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Guardar Cambios
          </button>
        </div>
      )}
    </div>
  )
}

export default Profile 

} 
