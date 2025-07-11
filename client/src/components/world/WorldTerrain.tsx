import React from 'react'

interface WorldTerrainProps {
  terrainData?: any
}

const WorldTerrain: React.FC<WorldTerrainProps> = ({ terrainData }) => {
  // Renderizado básico del terreno
  if (!terrainData) {
    return <div className="p-4 text-gray-400">No hay datos de terreno disponibles.</div>
  }

  return (
    <div className="world-terrain bg-green-900 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-bold text-white mb-2">Terreno del Mundo</h3>
      {/* Renderizado simple de datos de terreno */}
      <pre className="bg-gray-800 text-green-200 rounded p-2 overflow-x-auto text-xs">
        {JSON.stringify(terrainData, null, 2)}
      </pre>
    </div>
  )
}

export default WorldTerrain