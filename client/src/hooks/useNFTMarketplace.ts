import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  rarity?: number;
}

export interface NFTBid {
  id: string;
  bidder: string;
  amount: number;
  timestamp: Date;
}

export interface NFTCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface NFTCreateData {
  name: string;
  description: string;
  image: File;
  category: string;
  price: number;
  currency: string;
  royalties: number;
  attributes: NFTAttribute[];
}

// Defino un tipo local para los mocks
interface NFTMock {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  owner: string;
  tokenId: string;
  contractAddress: string;
  attributes: { trait_type: string; value: string }[];
  bids?: any[];
}

export const useNFTMarketplace = () => {
  const { user } = useAuth();
  const [nfts, setNfts] = useState<NFTMock[]>([]);
  const [myNFTs, setMyNFTs] = useState<NFTMock[]>([]);
  const [featuredNFTs, setFeaturedNFTs] = useState<NFTMock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Categorías predefinidas
  const categories: NFTCategory[] = [
    {
      id: 'art',
      name: 'Arte Digital',
      description: 'Obras de arte digital únicas',
      icon: '🎨',
      color: 'purple'
    },
    {
      id: 'collectibles',
      name: 'Coleccionables',
      description: 'Items coleccionables raros',
      icon: '🏆',
      color: 'gold'
    },
    {
      id: 'gaming',
      name: 'Gaming',
      description: 'NFTs de videojuegos',
      icon: '🎮',
      color: 'green'
    },
    {
      id: 'music',
      name: 'Música',
      description: 'NFTs musicales y audio',
      icon: '🎵',
      color: 'blue'
    },
    {
      id: 'virtual-worlds',
      name: 'Mundos Virtuales',
      description: 'Tierras y propiedades virtuales',
      icon: '🌍',
      color: 'teal'
    },
    {
      id: 'sports',
      name: 'Deportes',
      description: 'NFTs deportivos',
      icon: '⚽',
      color: 'orange'
    }
  ];

  // Cargar NFTs del marketplace
  const loadNFTs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/nfts/marketplace', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error cargando NFTs');
      }

      const data = await response.json();
      setNfts(data.nfts || []);
      setFeaturedNFTs(data.featured || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error loading NFTs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cargar NFTs del usuario
  const loadMyNFTs = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nfts/my-nfts`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error cargando mis NFTs');
      }

      const data = await response.json();
      setMyNFTs(data.nfts || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error loading my NFTs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Crear NFT
  const createNFT = useCallback(async (nftData: NFTCreateData): Promise<NFTMock> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      // Subir imagen primero
      const formData = new FormData();
      formData.append('image', nftData.image);

      const uploadResponse = await fetch('/api/upload/nft-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Error subiendo imagen');
      }

      const { imageUrl } = await uploadResponse.json();

      // Crear NFT en blockchain
      const nftResponse = await fetch('/api/nfts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...nftData,
          image: imageUrl
        })
      });

      if (!nftResponse.ok) {
        throw new Error('Error creando NFT');
      }

      const newNFT = await nftResponse.json();
      
      // Actualizar listas
      setMyNFTs(prev => [newNFT, ...prev]);
      setNfts(prev => [newNFT, ...prev]);

      return newNFT;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Comprar NFT
  const buyNFT = useCallback(async (nftId: string, price: number): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nfts/${nftId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ price })
      });

      if (!response.ok) {
        throw new Error('Error comprando NFT');
      }

      const result = await response.json();
      
      // Actualizar listas
      setNfts(prev => prev.filter(nft => nft.id !== nftId));
      setMyNFTs(prev => [result.nft, ...prev]);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Vender NFT
  const sellNFT = useCallback(async (nftId: string, price: number): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nfts/${nftId}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ price })
      });

      if (!response.ok) {
        throw new Error('Error vendiendo NFT');
      }

      const result = await response.json();
      
      // Actualizar listas
      setMyNFTs(prev => prev.filter(nft => nft.id !== nftId));
      setNfts(prev => [result.nft, ...prev]);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Pujar en subasta
  const placeBid = useCallback(async (nftId: string, bidAmount: number): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nfts/${nftId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ bidAmount })
      });

      if (!response.ok) {
        throw new Error('Error realizando puja');
      }

      const result = await response.json();
      
      // Actualizar NFT en las listas
      const updateNFT = (nft: NFTMock) => 
        nft.id === nftId 
          ? { ...nft, currentBid: bidAmount, bids: [...(nft.bids || []), result.bid] }
          : nft;

      setNfts(prev => prev.map(updateNFT));
      setMyNFTs(prev => prev.map(updateNFT));

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Finalizar subasta
  const endAuction = useCallback(async (nftId: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nfts/${nftId}/end-auction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error finalizando subasta');
      }

      const result = await response.json();
      
      // Actualizar NFT en las listas
      const updateNFT = (nft: NFTMock) => 
        nft.id === nftId 
          ? { ...nft, isAuction: false, owner: result.winner }
          : nft;

      setNfts(prev => prev.map(updateNFT));
      setMyNFTs(prev => prev.map(updateNFT));

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Transferir NFT
  const transferNFT = useCallback(async (nftId: string, toAddress: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nfts/${nftId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ toAddress })
      });

      if (!response.ok) {
        throw new Error('Error transfiriendo NFT');
      }

      const result = await response.json();
      
      // Remover NFT de mis NFTs
      setMyNFTs(prev => prev.filter(nft => nft.id !== nftId));

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Obtener detalles de NFT
  const getNFTDetails = useCallback(async (nftId: string): Promise<NFTMock> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nfts/${nftId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo detalles del NFT');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Buscar NFTs
  const searchNFTs = useCallback(async (query: string): Promise<NFTMock[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nfts/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error buscando NFTs');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Obtener NFTs por categoría
  const getNFTsByCategory = useCallback(async (category: string): Promise<NFTMock[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nfts/category/${category}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo NFTs por categoría');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Obtener estadísticas del marketplace
  const getMarketplaceStats = useCallback(async (): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/nfts/stats', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo estadísticas');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadNFTs();
    if (user) {
      loadMyNFTs();
    }
  }, [loadNFTs, loadMyNFTs, user]);

  return {
    // Estado
    nfts,
    myNFTs,
    featuredNFTs,
    categories,
    isLoading,
    error,
    
    // Acciones principales
    loadNFTs,
    loadMyNFTs,
    createNFT,
    buyNFT,
    sellNFT,
    placeBid,
    endAuction,
    transferNFT,
    getNFTDetails,
    
    // Utilidades
    searchNFTs,
    getNFTsByCategory,
    getMarketplaceStats
  };
}; 