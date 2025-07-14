

import React from 'react'
import { useMetaverso } from '../contexts/MetaversoContext'

const Profile: React.FC = () => {
  const { state } = useMetaverso()
  const avatar = state.userAvatar

  if (!avatar) return <div className="p-6">No hay datos de avatar.</div>

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Perfil del Avatar</h2>
        <div className="flex items-center space-x-6">
          <div>
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-4xl text-white">
              {avatar.name.charAt(0)}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-white">{avatar.name}</div>
            <div className="text-gray-400">Nivel: {avatar.level}</div>
            <div className="text-gray-400">Experiencia: {avatar.experience}</div>
            <div className="text-gray-400">Salud: {avatar.health}</div>
            <div className="text-gray-400">Energía: {avatar.energy}</div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Estadísticas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-gray-300">Fuerza: {avatar.stats.strength}</div>
          <div className="text-gray-300">Agilidad: {avatar.stats.agility}</div>
          <div className="text-gray-300">Inteligencia: {avatar.stats.intelligence}</div>
          <div className="text-gray-300">Carisma: {avatar.stats.charisma}</div>
        </div>
      </div>
    </div>
  )
}

export default Profile 
