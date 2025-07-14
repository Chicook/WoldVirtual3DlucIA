

import React, { useState, useCallback, useMemo, useEffect } from 'react'
// motion import removed - not used in current implementation
import { useMetaverso } from '@/contexts/MetaversoContext'
import { Avatar, PlayerStatistics, Achievement } from '@/types/metaverso'

// Componente avanzado de estadísticas detalladas
const AdvancedStats: React.FC<{ statistics: PlayerStatistics }> = ({ statistics }) => {
  const [activeTab, setActiveTab] = useState<'combat' | 'exploration' | 'social' | 'crafting' | 'economy'>('combat')

  const tabs = [
    { id: 'combat', name: 'Combate', icon: '⚔️' },
    { id: 'exploration', name: 'Exploración', icon: '🗺️' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'crafting', name: 'Crafteo', icon: '🔨' },
    { id: 'economy', name: 'Economía', icon: '💰' }
  ] as const

  const renderStats = useCallback(() => {
    const stats = statistics[activeTab]
    const entries = Object.entries(stats)
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {entries.map(([key, value]) => (
          <div key={key} className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="text-lg font-semibold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          </div>
        ))}
      </div>
    )
  }, [statistics, activeTab])

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Estadísticas Avanzadas</h3>
      
      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Stats Content */}
      {renderStats()}
    </div>
  )
}

// Componente avanzado de logros
const AchievementsPanel: React.FC<{ achievements: Achievement[] }> = ({ achievements }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [sortBy, setSortBy] = useState<'rarity' | 'category' | 'points'>('rarity')

  const filteredAchievements = useMemo(() => {
    let filtered = achievements
    
    if (filter === 'unlocked') {
      filtered = filtered.filter(achievement => achievement.unlocked)
    } else if (filter === 'locked') {
      filtered = filtered.filter(achievement => !achievement.unlocked)
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 }
          return rarityOrder[a.rarity] - rarityOrder[b.rarity]
        case 'category':
          return a.category.localeCompare(b.category)
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

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Logros</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-gray-300">
            Puntos: <span className="text-yellow-400 font-semibold">{totalPoints}</span>
          </div>
          <div className="text-gray-300">
            Completado: <span className="text-green-400 font-semibold">{completionRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-gray-700 text-white px-3 py-1 rounded"
        >
          <option value="all">Todos</option>
          <option value="unlocked">Desbloqueados</option>
          <option value="locked">Bloqueados</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-gray-700 text-white px-3 py-1 rounded"
        >
          <option value="rarity">Por Rareza</option>
          <option value="category">Por Categoría</option>
          <option value="points">Por Puntos</option>
        </select>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              achievement.unlocked
                ? 'bg-gray-700 border-green-500'
                : 'bg-gray-900 border-gray-600 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-2xl">{achievement.icon}</div>
              <div className="text-xs px-2 py-1 rounded bg-gray-600 text-white">
                {achievement.points} pts
              </div>
            </div>
            
            <h4 className="font-semibold text-white mb-1">{achievement.name}</h4>
            <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
            
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-1 rounded ${
                achievement.rarity === 'legendary' ? 'bg-purple-600' :
                achievement.rarity === 'epic' ? 'bg-purple-500' :
                achievement.rarity === 'rare' ? 'bg-blue-600' :
                achievement.rarity === 'uncommon' ? 'bg-green-600' :
                'bg-gray-600'
              }`}>
                {achievement.rarity}
              </span>
              
              {achievement.unlocked && achievement.unlockDate && (
                <span className="text-gray-500">
                  {new Date(achievement.unlockDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Progress Bar */}
            {!achievement.unlocked && achievement.progress > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progreso</span>
                  <span>{achievement.progress}/{achievement.target}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Componente avanzado de personalización de avatar
const AvatarCustomization: React.FC<{
  avatar: Avatar;
  onAvatarUpdate: (avatar: Partial<Avatar>) => void;
}> = ({ avatar, onAvatarUpdate }) => {
  const [activeSection, setActiveSection] = useState<'appearance' | 'equipment' | 'skills'>('appearance')

  const updateCustomization = useCallback((key: keyof Avatar['customization'], value: any) => {
    onAvatarUpdate({
      customization: {
        ...avatar.customization,
        [key]: value
      }
    })
  }, [avatar.customization, onAvatarUpdate])

  const skinColors = [
    '#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524',
    '#ffb6c1', '#ffa07a', '#ff7f50', '#ff6347', '#ff4500'
  ]

  const hairColors = [
    '#8b4513', '#654321', '#3e2723', '#1b1b1b', '#ffffff',
    '#ffd700', '#ff69b4', '#ff1493', '#00ff00', '#4169e1'
  ]

  const eyeColors = [
    '#000000', '#8b4513', '#4169e1', '#32cd32', '#ff69b4',
    '#ffd700', '#ff6347', '#9370db', '#20b2aa', '#f0e68c'
  ]

  const renderAppearance = () => (
    <div className="space-y-6">
      {/* Color de piel */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Color de Piel</label>
        <div className="grid grid-cols-5 gap-2">
          {skinColors.map((color) => (
            <button
              key={color}
              onClick={() => updateCustomization('skinColor', color)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                avatar.customization.skinColor === color 
                  ? 'border-white scale-110' 
                  : 'border-gray-600 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Color de pelo */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Color de Pelo</label>
        <div className="grid grid-cols-5 gap-2">
          {hairColors.map((color) => (
            <button
              key={color}
              onClick={() => updateCustomization('hairColor', color)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                avatar.customization.hairColor === color 
                  ? 'border-white scale-110' 
                  : 'border-gray-600 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Color de ojos */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Color de Ojos</label>
        <div className="grid grid-cols-5 gap-2">
          {eyeColors.map((color) => (
            <button
              key={color}
              onClick={() => updateCustomization('eyeColor', color)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                avatar.customization.eyeColor === color 
                  ? 'border-white scale-110' 
                  : 'border-gray-600 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Características faciales */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Características Faciales</label>
        <div className="grid grid-cols-2 gap-2">
          {['bigote', 'barba', 'cicatriz', 'lunar', 'tatuaje', 'piercing'].map((feature) => (
            <label key={feature} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={avatar.customization.facialFeatures.includes(feature)}
                onChange={(e) => {
                  const newFeatures = e.target.checked
                    ? [...avatar.customization.facialFeatures, feature]
                    : avatar.customization.facialFeatures.filter(f => f !== feature)
                  updateCustomization('facialFeatures', newFeatures)
                }}
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300 capitalize">{feature}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderEquipment = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(avatar.equipment).map(([slot, item]) => (
          <div key={slot} className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400 capitalize mb-2">{slot}</div>
            {item ? (
              <div className="text-white">
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-gray-300">{item.description}</div>
              </div>
            ) : (
              <div className="text-gray-500 italic">Vacío</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderSkills = () => (
    <div className="space-y-4">
      {avatar.skills.map((skill) => (
        <div key={skill.id} className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-white">{skill.name}</h4>
            <span className="text-sm text-gray-400">Nivel {skill.level}/{skill.maxLevel}</span>
          </div>
          
          <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(skill.experience / (skill.level * 100)) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>EXP: {skill.experience}</span>
            <span>Cooldown: {skill.cooldown}s</span>
            <span>Mana: {skill.manaCost}</span>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Personalización de Avatar</h3>
      
      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'appearance', name: 'Apariencia', icon: '👤' },
          { id: 'equipment', name: 'Equipamiento', icon: '⚔️' },
          { id: 'skills', name: 'Habilidades', icon: '🎯' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeSection === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'appearance' && renderAppearance()}
      {activeSection === 'equipment' && renderEquipment()}
      {activeSection === 'skills' && renderSkills()}
    </div>
  )
}

// Componente principal avanzado
export const Profile: React.FC = () => {
  const { state, updateAvatar } = useMetaverso()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'achievements' | 'customization'>('overview')

  const [avatarData, setAvatarData] = useState<Partial<Avatar>>({
    name: '',
    level: 1,
    experience: 0,
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
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {state.userAvatar.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{state.userAvatar.name}</h1>
            <p className="text-gray-400">Nivel {state.userAvatar.level} • {state.userAvatar.experience} EXP</p>
            
            {/* Barras de progreso */}
            <div className="mt-4 space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Salud</span>
                  <span className="text-gray-400">{state.userAvatar.health}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${state.userAvatar.health}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Energía</span>
                  <span className="text-gray-400">{state.userAvatar.energy}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${state.userAvatar.energy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          {state.wallet && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Balance</div>
              <div className="text-lg font-semibold text-white">
                {state.wallet.balance.gold} 🪙
              </div>
              <div className="text-sm text-gray-400">
                {state.wallet.transactions.length} transacciones
              </div>
            </div>
          )}

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useMetaverso } from '@/hooks/useMetaverso'
import { useWeb3 } from '@/hooks/useWeb3'
import { Avatar } from '@/types/metaverso'

export const Profile: React.FC = () => {
  const { state: metaversoState, updateAvatar } = useMetaverso()
  const { account, balance } = useWeb3()
  
  const [activeTab, setActiveTab] = useState('avatar')
  const [isEditing, setIsEditing] = useState(false)
  const [avatarData, setAvatarData] = useState<Partial<Avatar>>(metaversoState.userAvatar || {
    name: 'Usuario',
    level: 1,
    experience: 0,
    customizations: {
      skinColor: '#FFB6C1',
      hairColor: '#8B4513'
    }
  })

  const tabs = [
    { id: 'avatar', name: 'Avatar', icon: '👤' },
    { id: 'stats', name: 'Estadísticas', icon: '📊' },
    { id: 'achievements', name: 'Logros', icon: '🏆' },
    { id: 'settings', name: 'Configuración', icon: '⚙️' }
  ]

  const handleSaveAvatar = async () => {
    try {
      await updateAvatar(avatarData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating avatar:', error)
    }
  }

  const renderAvatarTab = () => (
    <div className="space-y-6">
      {/* Avatar Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h3>
        <div className="flex items-center space-x-6">
          <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-4xl font-bold text-white">
            {avatarData.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-gray-900">
              {avatarData.name || 'Usuario'}
            </h4>
            <p className="text-gray-600">Avatar del metaverso</p>
            <div className="mt-2 flex space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Nivel {avatarData.level || 1}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {avatarData.experience || 0} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Customization */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Personalización</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {isEditing ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Avatar
              </label>
              <input
                type="text"
                value={avatarData.name || ''}
                onChange={(e) => setAvatarData({ ...avatarData, name: e.target.value })}
                className="input w-full"
                placeholder="Ingresa el nombre de tu avatar"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Piel
                </label>
                <select
                  value={avatarData.customizations?.skinColor || ''}
                  onChange={(e) => setAvatarData({
                    ...avatarData,
                    customizations: { ...avatarData.customizations, skinColor: e.target.value }
                  })}
                  className="input w-full"
                >
                  <option value="">Seleccionar</option>
                  <option value="fair">Clara</option>
                  <option value="medium">Media</option>
                  <option value="dark">Oscura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Cabello
                </label>
                <select
                  value={avatarData.customizations?.hairColor || ''}
                  onChange={(e) => setAvatarData({
                    ...avatarData,
                    customizations: { ...avatarData.customizations, hairColor: e.target.value }
                  })}
                  className="input w-full"
                >
                  <option value="">Seleccionar</option>
                  <option value="black">Negro</option>
                  <option value="brown">Marrón</option>
                  <option value="blonde">Rubio</option>
                  <option value="red">Rojo</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSaveAvatar}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Guardar Cambios
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center text-2xl">
                🎨
              </div>
              <p className="text-sm text-gray-600">Personalizar</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center text-2xl">
                👕
              </div>
              <p className="text-sm text-gray-600">Ropa</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center text-2xl">
                🎭
              </div>
              <p className="text-sm text-gray-600">Expresiones</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center text-2xl">
                ✨
              </div>
              <p className="text-sm text-gray-600">Efectos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderStatsTab = () => (
    <div className="space-y-6">
      {/* General Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Generales</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">24</div>
            <p className="text-sm text-gray-600">Mundos Visitados</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">156</div>
            <p className="text-sm text-gray-600">Horas Jugadas</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">89</div>
            <p className="text-sm text-gray-600">Objetos Interactuados</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">12</div>
            <p className="text-sm text-gray-600">Logros Desbloqueados</p>
          </div>
        </div>
      </div>

      {/* Wallet Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Wallet</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Balance Total</span>
            <span className="font-semibold">
              {balance ? parseFloat(balance).toFixed(4) : '0.0000'} ETH
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Assets Poseídos</span>
            <span className="font-semibold">{metaversoState.inventory.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Transacciones</span>
            <span className="font-semibold">{metaversoState.wallet.transactions.length}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAchievementsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logros Desbloqueados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Explorador', description: 'Visita 10 mundos diferentes', icon: '🌍', unlocked: true },
            { name: 'Coleccionista', description: 'Adquiere 50 items', icon: '💎', unlocked: true },
            { name: 'Social', description: 'Interactúa con 20 usuarios', icon: '👥', unlocked: false },
            { name: 'Constructor', description: 'Crea tu primer mundo', icon: '🏗️', unlocked: false }
          ].map((achievement, index) => (
            <motion.div
              key={achievement.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                achievement.unlocked 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`text-2xl ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}`}>
                  {achievement.icon}
                </div>
                <div>
                  <h4 className={`font-medium ${
                    achievement.unlocked ? 'text-green-800' : 'text-gray-600'
                  }`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-sm ${
                    achievement.unlocked ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Notificaciones</h4>
              <p className="text-sm text-gray-600">Recibir notificaciones del metaverso</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Sonido</h4>
              <p className="text-sm text-gray-600">Activar efectos de sonido</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Privacidad</h4>
              <p className="text-sm text-gray-600">Perfil público</p>
            </div>
            <select className="input w-32">
              <option value="public">Público</option>
              <option value="friends">Amigos</option>
              <option value="private">Privado</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu avatar y configuración personal
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Wallet</p>
          <p className="font-medium text-gray-900">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
        </div>
      </div>

      {/* Tabs */}

      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
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

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                {state.chatMessages.slice(-5).map((message) => (
                  <div key={message.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm">
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
          <AdvancedStats statistics={state.statistics} />
        )}

        {activeTab === 'achievements' && (
          <AchievementsPanel achievements={state.achievements} />
        )}

        {activeTab === 'customization' && state.userAvatar && (
          <AvatarCustomization 
            avatar={state.userAvatar} 
            onAvatarUpdate={handleAvatarUpdate} 
          />
        )}
      </div>

      {/* Save Button */}
      {activeTab === 'customization' && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'avatar' && renderAvatarTab()}
          {activeTab === 'stats' && renderStatsTab()}
          {activeTab === 'achievements' && renderAchievementsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>
    </div>
  )
}

export default Profile 
