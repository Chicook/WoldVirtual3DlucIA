import React, { useState, useEffect } from 'react'
import { useNFTMarketplace } from '@/hooks/useNFTMarketplace'

interface NFTMarketplaceProps {
  isOpen: boolean
  onToggle: () => void
}

export const NFTMarketplace: React.FC<NFTMarketplaceProps> = ({ isOpen, onToggle }) => {
  const {
    nfts,
    myNFTs,
    featuredNFTs,
    categories,
    isLoading,
    error,
    loadNFTs,
    loadMyNFTs,
    buyNFT,
    searchNFTs,
  } = useNFTMarketplace()

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadNFTs()
      loadMyNFTs()
    }
  }, [isOpen, loadNFTs, loadMyNFTs])

  const handleBuyNFT = async (nftId: string, price: string) => {
    try {
      await buyNFT(nftId, Number(price))
      // Recargar NFTs después de la compra
      loadNFTs()
      loadMyNFTs()
    } catch (error) {
      console.error('Error comprando NFT:', error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    searchNFTs(query)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Marketplace NFT</h2>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Buscar NFTs..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Estado de carga */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* NFTs Destacados */}
        {featuredNFTs.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">NFTs Destacados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredNFTs.map((nft) => (
                <div key={nft.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    {nft.image ? (
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500">Sin imagen</span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1">{nft.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{nft.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      {nft.price} ETH
                    </span>
                    <button
                      onClick={() => handleBuyNFT(nft.id, nft.price)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todos los NFTs */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Todos los NFTs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {nfts.map((nft) => (
              <div key={nft.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  {nft.image ? (
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-gray-500">Sin imagen</span>
                  )}
                </div>
                <h4 className="font-medium text-gray-800 mb-1">{nft.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{nft.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">
                    {nft.price} ETH
                  </span>
                  <button
                    onClick={() => handleBuyNFT(nft.id, nft.price)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mis NFTs */}
        {myNFTs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Mis NFTs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {myNFTs.map((nft) => (
                <div key={nft.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    {nft.image ? (
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500">Sin imagen</span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1">{nft.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{nft.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      {nft.price} ETH
                    </span>
                    <span className="text-sm text-green-600 font-medium">Propietario</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 