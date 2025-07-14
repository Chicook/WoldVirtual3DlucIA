import { useCallback } from 'react'
import { useWeb3 } from '@/hooks/useWeb3'

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000'

export const useMetaversoAPI = () => {
  const { account } = useWeb3()

  const fetchUserData = useCallback(async () => {
    if (!account) return null

    try {
      const response = await fetch(`/api/users/${account}`)
      if (!response.ok) throw new Error('Error fetching user data')
      return await response.json()
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }, [account])

  const updateUserPosition = useCallback(async (position: { x: number; y: number; z: number }) => {
    if (!account) return

    try {
      await fetch(`/api/users/${account}/position`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(position)
      })
    } catch (error) {
      console.error('Error updating position:', error)
    }
  }, [account])

  const fetchWorldData = useCallback(async (worldId: string) => {
    try {
      const response = await fetch(`/api/worlds/${worldId}`)
      if (!response.ok) throw new Error('Error fetching world data')
      return await response.json()
    } catch (error) {
      console.error('Error fetching world data:', error)
      return null
    }
  }, [])

  const api = {
    // Usuario
    getUserProfile: useCallback(async (userId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${account}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }
      
      return response.json()
    }, [account]),

    getUserAvatar: useCallback(async (userId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/avatar`, {
        headers: {
          'Authorization': `Bearer ${account}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch user avatar')
      }
      
      return response.json()
    }, [account]),

    updateAvatar: useCallback(async (userId: string, avatarData: any) => {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${account}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(avatarData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update avatar')
      }
      
      return response.json()
    }, [account]),

    getUserInventory: useCallback(async (userId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/inventory`, {
        headers: {
          'Authorization': `Bearer ${account}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch user inventory')
      }
      
      return response.json()
    }, [account]),

    getUserWallet: useCallback(async (userId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/wallet`, {
        headers: {
          'Authorization': `Bearer ${account}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch user wallet')
      }
      
      return response.json()
    }, [account]),

    // Mundos
    getWorld: useCallback(async (worldId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/worlds/${worldId}`, {
        headers: {
          'Authorization': `Bearer ${account}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch world')
      }
      
      return response.json()
    }, [account]),

    getSpawnPoint: useCallback(async (worldId: string, userId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/worlds/${worldId}/spawn/${userId}`, {
        headers: {
          'Authorization': `Bearer ${account}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch spawn point')
      }
      
      return response.json()
    }, [account]),

    createWorld: useCallback(async (worldData: any, userId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/worlds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...worldData, owner: userId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create world')
      }
      
      return response.json()
    }, [account]),

    // Objetos
    interactWithObject: useCallback(async (objectId: string, action: string, userId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/objects/${objectId}/interact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, userId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to interact with object')
      }
      
      return response.json()
    }, [account]),

    // Assets
    purchaseAsset: useCallback(async (assetId: string, price: string, userId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/assets/${assetId}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ price, userId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to purchase asset')
      }
      
      return response.json()
    }, [account]),

    // Chat
    sendMessage: useCallback(async (message: string, channel: string, userId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, channel, userId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      
      return response.json()
    }, [account]),

    // Configuración
    updateSettings: useCallback(async (userId: string, settings: any) => {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${account}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update settings')
      }
      
      return response.json()
    }, [account])
  }

  return {
    fetchUserData,
    updateUserPosition,
    fetchWorldData,
    api
  }
} 