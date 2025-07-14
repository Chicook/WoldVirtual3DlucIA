import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMetaverso } from '@/contexts/MetaversoContext'
import { Avatar } from '@/types/metaverso'

// Componente avanzado de previsualización 3D
const AvatarPreview3D: React.FC<{ avatar: Avatar }> = ({ avatar }) => {
  const [rotation, setRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    // y variable removed - not used in current implementation
    
    const centerX = rect.width / 2
    // centerY variable removed - not used in current implementation
    
    const deltaX = (x - centerX) / centerX
    // deltaY calculation removed - not used in current implementation
    
    setRotation(deltaX * 180)
  }, [])

  const startAnimation = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }, [])

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
      
      {/* Avatar 3D */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onDoubleClick={startAnimation}
      >
        <motion.div
          className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d'
          }}
          animate={isAnimating ? {
            scale: [1, 1.2, 1],
            rotateY: [rotation, rotation + 360, rotation + 720],
            transition: { duration: 2, ease: "easeInOut" }
          } : {}}
        >
          {avatar.name.charAt(0).toUpperCase()}
        </motion.div>
      </div>

      {/* Información del avatar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4">
        <div className="text-center">
          <h3 className="text-white font-semibold">{avatar.name}</h3>
          <p className="text-gray-300 text-sm">Nivel {avatar.level}</p>
        </div>
      </div>

      {/* Controles */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={startAnimation}
          className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white text-sm transition-colors"
          title="Animar"
        >
          ▶️
        </button>
        <button
          onClick={() => setRotation(0)}
          className="w-8 h-8 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white text-sm transition-colors"
          title="Resetear"
        >
          🔄
        </button>
      </div>
    </div>
  )
}

// Componente avanzado de filtros
const AdvancedFilters: React.FC<{
  filters: {
    level: [number, number]
    rarity: string[]
    class: string[]
    status: string[]
  }
  onFiltersChange: (filters: any) => void
}> = ({ filters, onFiltersChange }) => {
  const rarityOptions = ['common', 'uncommon', 'rare', 'epic', 'legendary']
  const classOptions = ['warrior', 'mage', 'archer', 'rogue', 'healer']
  const statusOptions = ['active', 'inactive', 'online', 'offline']

  const updateFilter = useCallback((key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }, [filters, onFiltersChange])

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white">Filtros Avanzados</h3>
      
      {/* Rango de nivel */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Rango de Nivel: {filters.level[0]} - {filters.level[1]}
        </label>
        <div className="flex space-x-2">
          <input
            type="range"
            min="1"
            max="100"
            value={filters.level[0]}
            onChange={(e) => updateFilter('level', [parseInt(e.target.value), filters.level[1]])}
            className="flex-1"
          />
          <input
            type="range"
            min="1"
            max="100"
            value={filters.level[1]}
            onChange={(e) => updateFilter('level', [filters.level[0], parseInt(e.target.value)])}
            className="flex-1"
          />
        </div>
      </div>

      {/* Rareza */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Rareza</label>
        <div className="flex flex-wrap gap-2">
          {rarityOptions.map((rarity) => (
            <label key={rarity} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.rarity.includes(rarity)}
                onChange={(e) => {
                  const newRarity = e.target.checked
                    ? [...filters.rarity, rarity]
                    : filters.rarity.filter(r => r !== rarity)
                  updateFilter('rarity', newRarity)
                }}
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300 capitalize">{rarity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clase */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Clase</label>
        <div className="flex flex-wrap gap-2">
          {classOptions.map((className) => (
            <label key={className} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.class.includes(className)}
                onChange={(e) => {
                  const newClass = e.target.checked
                    ? [...filters.class, className]
                    : filters.class.filter(c => c !== className)
                  updateFilter('class', newClass)
                }}
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300 capitalize">{className}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Estado */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <label key={status} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.status.includes(status)}
                onChange={(e) => {
                  const newStatus = e.target.checked
                    ? [...filters.status, status]
                    : filters.status.filter(s => s !== status)
                  updateFilter('status', newStatus)
                }}
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300 capitalize">{status}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente principal avanzado
export const AvatarSelector: React.FC = () => {
  const { updateAvatar } = useMetaverso()
  
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'created' | 'lastUsed'>('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Avatares de ejemplo para demostración
  const [avatars, setAvatars] = useState<Avatar[]>([
    {
      id: 'avatar_1',
      name: 'Guerrero Élfico',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      model: 'warrior_elf',
      texture: 'warrior_elf_tex',
      animations: ['idle', 'walk', 'attack'],
      currentAnimation: 'idle',
      health: 100,
      energy: 100,
      level: 25,
      experience: 12500,
      skills: [
        { 
          id: 'slash', 
          name: 'Tajo', 
          level: 3, 
          experience: 150, 
          maxLevel: 5, 
          type: 'combat',
          effects: [{ type: 'damage', value: 50, duration: 0, target: 'enemy' }],
          cooldown: 5, 
          manaCost: 10 
        }
      ],
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
        hairStyle: 'long',
        hairColor: '#8b4513',
        eyeColor: '#4169e1',
        facialFeatures: ['barba'],
        tattoos: [],
        scars: [],
        accessories: ['piercing_oreja']
      }
    },
    {
      id: 'avatar_2',
      name: 'Maga Oscura',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      model: 'dark_mage',
      texture: 'dark_mage_tex',
      animations: ['idle', 'walk', 'cast'],
      currentAnimation: 'idle',
      health: 100,
      energy: 100,
      level: 42,
      experience: 35000,
      skills: [
        { 
          id: 'fireball', 
          name: 'Bola de Fuego', 
          level: 5, 
          experience: 500, 
          maxLevel: 5, 
          type: 'magic',
          effects: [{ type: 'damage', value: 100, duration: 0, target: 'enemy' }],
          cooldown: 3, 
          manaCost: 25 
        },
        { 
          id: 'teleport', 
          name: 'Teletransporte', 
          level: 3, 
          experience: 200, 
          maxLevel: 5, 
          type: 'magic',
          effects: [{ type: 'teleport', value: 0, duration: 0, target: 'self' }],
          cooldown: 15, 
          manaCost: 50 
        }
      ],
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
        skinColor: '#f1c27d',
        hairStyle: 'short',
        hairColor: '#000000',
        eyeColor: '#ff69b4',
        facialFeatures: [],
        tattoos: [],
        scars: [],
        accessories: ['collar_magico']
      }
    }
  ])
  
  const [filters, setFilters] = useState({
    level: [1, 100] as [number, number],
    rarity: [] as string[],
    class: [] as string[],
    status: [] as string[]
  })

  // Filtrar y ordenar avatares
  const filteredAvatars = useMemo(() => {
    let filtered = avatars

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(avatar =>
        avatar.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por nivel
    filtered = filtered.filter(avatar =>
      avatar.level >= filters.level[0] && avatar.level <= filters.level[1]
    )

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'level':
          return b.level - a.level
        case 'created':
          return 0 // No tenemos createdAt en el tipo Avatar
        case 'lastUsed':
          return 0 // No tenemos lastUsed en el tipo Avatar
        default:
          return 0
      }
    })

    return filtered
  }, [avatars, searchTerm, filters, sortBy])

  const handleAvatarSelect = useCallback(async (avatar: Avatar) => {
    try {
      setSelectedAvatar(avatar)
      await updateAvatar(avatar)
    } catch (error) {
      console.error('Error al seleccionar avatar:', error)
    }
  }, [updateAvatar])

  const handleCreateAvatar = useCallback(async () => {
    try {
      const newAvatar: Avatar = {
        id: `avatar_${Date.now()}`,
        name: `Avatar ${avatars.length + 1}`,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        model: 'default_avatar',
        texture: 'default_avatar_tex',
        animations: ['idle', 'walk'],
        currentAnimation: 'idle',
        health: 100,
        energy: 100,
        level: 1,
        experience: 0,
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
      }
      
      setAvatars(prev => [...prev, newAvatar])
    } catch (error) {
      console.error('Error al crear avatar:', error)
    }
  }, [avatars.length])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Selector de Avatar</h1>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
          
          <button
            onClick={handleCreateAvatar}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Crear Avatar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles de búsqueda y ordenamiento */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar avatares..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div className="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="name">Por Nombre</option>
            <option value="level">Por Nivel</option>
            <option value="created">Por Fecha de Creación</option>
            <option value="lastUsed">Por Último Uso</option>
          </select>
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {viewMode === 'grid' ? '📋' : '🔲'}
          </button>
        </div>
      </div>

      {/* Lista de avatares */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        <AnimatePresence>
          {filteredAvatars.map((avatar, index) => (
            <motion.div
              key={avatar.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`bg-gray-800 rounded-lg overflow-hidden border-2 transition-all cursor-pointer hover:border-blue-500 ${
                selectedAvatar?.id === avatar.id ? 'border-blue-500' : 'border-gray-700'
              }`}
              onClick={() => handleAvatarSelect(avatar)}
            >
              {viewMode === 'grid' ? (
                <>
                  <AvatarPreview3D avatar={avatar} />
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{avatar.name}</h3>
                      <span className="px-2 py-1 rounded text-xs bg-blue-600">
                        Nivel {avatar.level}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">
                      Modelo: {avatar.model} • EXP: {avatar.experience}
                    </p>
                    
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Salud: {avatar.health}</span>
                      <span>Energía: {avatar.energy}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {avatar.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-white">{avatar.name}</h3>
                      <span className="px-2 py-1 rounded text-xs bg-blue-600">
                        Nivel {avatar.level}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm">
                      Modelo: {avatar.model} • EXP: {avatar.experience}
                    </p>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <div>Salud: {avatar.health}</div>
                    <div>Energía: {avatar.energy}</div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mensaje si no hay avatares */}
      {filteredAvatars.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-white mb-2">No se encontraron avatares</h3>
          <p className="text-gray-400">
            {searchTerm || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : false)
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Crea tu primer avatar para comenzar'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default AvatarSelector 