import React, { useState, useCallback, useMemo } from 'react'
import { useMetaverso } from '@/contexts/MetaversoContext'
import { World, Position } from '@/types/metaverso'

interface IslandMapProps {
  onWorldSelect?: (world: World) => void
  onTeleport?: (position: Position) => void
}

// Componente avanzado de navegación 3D
const Navigation3D: React.FC<{
  worlds: World[]
  currentWorld: World | null
  onWorldSelect: (world: World) => void
}> = ({ worlds, currentWorld, onWorldSelect }) => {
  const [hoveredWorld, setHoveredWorld] = useState<string | null>(null)

  const worldPositions = useMemo(() => {
    return worlds.map((world, index) => ({
      ...world,
      position: {
        x: Math.cos((index / worlds.length) * Math.PI * 2) * 50,
        y: 0,
        z: Math.sin((index / worlds.length) * Math.PI * 2) * 50
      }
    }))
  }, [worlds])

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Navegación 3D</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {worldPositions.map((world) => (
            <div
              key={world.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                currentWorld?.id === world.id
                  ? 'border-blue-500 bg-blue-50'
                  : hoveredWorld === world.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              onClick={() => onWorldSelect(world)}
              onMouseEnter={() => setHoveredWorld(world.id)}
              onMouseLeave={() => setHoveredWorld(null)}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">
                  {String(world.environment) === 'forest' && '🌲'}
                  {String(world.environment) === 'desert' && '🏜️'}
                  {String(world.environment) === 'snow' && '❄️'}
                  {String(world.environment) === 'underwater' && '🌊'}
                  {String(world.environment) === 'space' && '🚀'}
                  {String(world.environment) === 'indoor' && '🏢'}
                </div>
                <h3 className="font-semibold text-lg">{world.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{world.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  <div>Jugadores: {world.currentPlayers}/{world.maxPlayers}</div>
                  <div>Clima: {world.weather.type}</div>
                </div>
              </div>
              
              {currentWorld?.id === world.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente avanzado de puntos de interés
const PointsOfInterest: React.FC<{
  world: World
  onTeleport: (position: Position) => void
}> = ({ onTeleport }) => {
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null)

  const pointsOfInterest = useMemo(() => [
    { id: 'spawn', name: 'Punto de Spawn', position: { x: 0, y: 0, z: 0 }, icon: '🏠' },
    { id: 'center', name: 'Centro del Mundo', position: { x: 50, y: 0, z: 50 }, icon: '🎯' },
    { id: 'north', name: 'Norte', position: { x: 0, y: 0, z: 100 }, icon: '⬆️' },
    { id: 'south', name: 'Sur', position: { x: 0, y: 0, z: -100 }, icon: '⬇️' },
    { id: 'east', name: 'Este', position: { x: 100, y: 0, z: 0 }, icon: '➡️' },
    { id: 'west', name: 'Oeste', position: { x: -100, y: 0, z: 0 }, icon: '⬅️' }
  ], [])

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg p-4 shadow-lg">
      <h3 className="font-semibold mb-3">Puntos de Interés</h3>
      <div className="grid grid-cols-2 gap-2">
        {pointsOfInterest.map((poi) => (
          <button
            key={poi.id}
            className={`p-2 rounded text-sm transition-colors ${
              selectedPOI === poi.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => {
              setSelectedPOI(poi.id)
              onTeleport(poi.position)
            }}
          >
            <div className="text-center">
              <div className="text-lg">{poi.icon}</div>
              <div className="text-xs">{poi.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Componente principal del mapa de islas
const IslandMap: React.FC<IslandMapProps> = ({ onWorldSelect, onTeleport }) => {
  const { state } = useMetaverso()
  const [showNavigation, setShowNavigation] = useState(false)
  const [showPOI, setShowPOI] = useState(false)

  const handleWorldSelect = useCallback((world: World) => {
    onWorldSelect?.(world)
    setShowNavigation(false)
  }, [onWorldSelect])

  const handleTeleport = useCallback((position: Position) => {
    onTeleport?.(position)
    setShowPOI(false)
  }, [onTeleport])

  // Asegurar que availableWorlds exista y sea un array
  const availableWorlds: World[] = Array.isArray((state as any).availableWorlds) ? (state as any).availableWorlds : [];

  if (!state.currentWorld) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-xl font-semibold mb-2">Sin mundo activo</h2>
          <p className="text-gray-600">Selecciona un mundo para comenzar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Mapa principal */}
      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-green-400 relative overflow-hidden">
        {/* Representación visual del mundo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-4">
              {String(state.currentWorld.environment) === 'forest' && '🌲'}
              {String(state.currentWorld.environment) === 'desert' && '🏜️'}
              {String(state.currentWorld.environment) === 'snow' && '❄️'}
              {String(state.currentWorld.environment) === 'underwater' && '🌊'}
              {String(state.currentWorld.environment) === 'space' && '🚀'}
              {String(state.currentWorld.environment) === 'indoor' && '🏢'}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{state.currentWorld.name}</h1>
            <p className="text-white text-lg">{state.currentWorld.description}</p>
          </div>
        </div>

        {/* Controles del mapa */}
        <div className="absolute top-4 right-4 space-y-2">
          <button
            onClick={() => setShowNavigation(!showNavigation)}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-lg shadow-lg transition-all duration-300"
          >
            <div className="text-2xl">🗺️</div>
            <div className="text-xs">Mundos</div>
          </button>
          
          <button
            onClick={() => setShowPOI(!showPOI)}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-lg shadow-lg transition-all duration-300"
          >
            <div className="text-2xl">📍</div>
            <div className="text-xs">POI</div>
          </button>
        </div>

        {/* Información del mundo */}
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-lg p-4 shadow-lg">
          <h3 className="font-semibold mb-2">Información del Mundo</h3>
          <div className="space-y-1 text-sm">
            <div>Jugadores: {state.currentWorld.currentPlayers}/{state.currentWorld.maxPlayers}</div>
            <div>Ambiente: {state.currentWorld.environment}</div>
            <div>Clima: {state.currentWorld.weather.type}</div>
            <div>Temperatura: {state.currentWorld.weather.temperature}°C</div>
          </div>
        </div>
      </div>

      {/* Navegación 3D */}
      {showNavigation && (
        <Navigation3D
          worlds={availableWorlds}
          currentWorld={state.currentWorld}
          onWorldSelect={handleWorldSelect}
        />
      )}

      {/* Puntos de interés */}
      {showPOI && (
        <PointsOfInterest
          world={state.currentWorld}
          onTeleport={handleTeleport}
        />
      )}
    </div>
  )
}

export default IslandMap 