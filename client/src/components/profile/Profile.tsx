

import React, { useState, useEffect } from 'react'
import { useMetaverso } from '../../contexts/MetaversoContext'

interface ProfileProps {
  onClose?: () => void
}

interface Avatar {
  id: string
  name: string
  level: number
  experience: number
  health: number
  energy: number
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  model: string
  animations: string[]
  customizations: {
    skinColor: string
    hairStyle: string
    hairColor: string
    eyeColor: string
    height: number
    weight: number
    features: Record<string, any>
  }
  equipment: Record<string, any>
  inventory: any[]
  stats: {
    strength: number
    agility: number
    intelligence: number
    charisma: number
  }
}

export const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const { state } = useMetaverso()
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
    model: 'default-model',
    animations: [],
    customizations: {
      skinColor: '#ffdbac',
      hairStyle: 'default',
      hairColor: '#8b4513',
      eyeColor: '#000000',
      height: 1.7,
      weight: 70,
      features: {}
    },
    equipment: {},
    inventory: [],
    stats: {
      strength: 10,
      agility: 10,
      intelligence: 10,
      charisma: 10
    }
  })

  useEffect(() => {
    if (state.userAvatar) {
      setAvatarData(state.userAvatar)
    }
  }, [state.userAvatar])

  const handleSave = async () => {
    try {
      // Aquí se implementaría la lógica para guardar los cambios
      console.log('Guardando cambios del avatar:', avatarData)
    } catch (error) {
      console.error('Error al guardar:', error)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: '📊' },
    { id: 'stats', name: 'Estadísticas', icon: '📈' },
    { id: 'achievements', name: 'Logros', icon: '🏆' },
    { id: 'customization', name: 'Personalización', icon: '🎨' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Información General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
            <input
              type="text"
              value={avatarData.name || ''}
              onChange={(e) => setAvatarData({ ...avatarData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nivel</label>
            <input
              type="number"
              value={avatarData.level || 1}
              onChange={(e) => setAvatarData({ ...avatarData, level: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Experiencia</label>
            <input
              type="number"
              value={avatarData.experience || 0}
              onChange={(e) => setAvatarData({ ...avatarData, experience: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Salud</label>
            <input
              type="number"
              value={avatarData.health || 100}
              onChange={(e) => setAvatarData({ ...avatarData, health: parseInt(e.target.value) || 100 })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStats = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Estadísticas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fuerza</label>
            <input
              type="number"
              value={avatarData.stats?.strength || 10}
              onChange={(e) => setAvatarData({
                ...avatarData,
                stats: { ...avatarData.stats, strength: parseInt(e.target.value) || 10 }
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Agilidad</label>
            <input
              type="number"
              value={avatarData.stats?.agility || 10}
              onChange={(e) => setAvatarData({
                ...avatarData,
                stats: { ...avatarData.stats, agility: parseInt(e.target.value) || 10 }
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Inteligencia</label>
            <input
              type="number"
              value={avatarData.stats?.intelligence || 10}
              onChange={(e) => setAvatarData({
                ...avatarData,
                stats: { ...avatarData.stats, intelligence: parseInt(e.target.value) || 10 }
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Carisma</label>
            <input
              type="number"
              value={avatarData.stats?.charisma || 10}
              onChange={(e) => setAvatarData({
                ...avatarData,
                stats: { ...avatarData.stats, charisma: parseInt(e.target.value) || 10 }
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Logros</h3>
        <p className="text-gray-400">Sistema de logros en desarrollo...</p>
      </div>
    </div>
  )

  const renderCustomization = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Personalización</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color de Piel</label>
            <input
              type="color"
              value={avatarData.customizations?.skinColor || '#ffdbac'}
              onChange={(e) => setAvatarData({
                ...avatarData,
                customizations: { ...avatarData.customizations, skinColor: e.target.value }
              })}
              className="w-full h-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color de Cabello</label>
            <input
              type="color"
              value={avatarData.customizations?.hairColor || '#8b4513'}
              onChange={(e) => setAvatarData({
                ...avatarData,
                customizations: { ...avatarData.customizations, hairColor: e.target.value }
              })}
              className="w-full h-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Altura</label>
            <input
              type="number"
              step="0.1"
              value={avatarData.customizations?.height || 1.7}
              onChange={(e) => setAvatarData({
                ...avatarData,
                customizations: { ...avatarData.customizations, height: parseFloat(e.target.value) || 1.7 }
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Peso</label>
            <input
              type="number"
              value={avatarData.customizations?.weight || 70}
              onChange={(e) => setAvatarData({
                ...avatarData,
                customizations: { ...avatarData.customizations, weight: parseInt(e.target.value) || 70 }
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'stats':
        return renderStats()
      case 'achievements':
        return renderAchievements()
      case 'customization':
        return renderCustomization()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Perfil del Avatar</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        {renderContent()}

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile 
