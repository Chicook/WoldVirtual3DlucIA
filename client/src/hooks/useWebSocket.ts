import { useEffect, useRef, useCallback } from 'react'
import { useWeb3 } from './useWeb3'

const WS_BASE_URL = process.env.VITE_WS_URL || 'ws://localhost:8000'

export const useWebSocket = () => {
  const { account, isConnected: web3Connected } = useWeb3()
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const wsUrl = `${WS_BASE_URL}/ws?token=${account}`
      socketRef.current = new WebSocket(wsUrl)

      socketRef.current.onopen = () => {
        console.log('WebSocket connected')
        reconnectAttempts.current = 0
      }

      socketRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        
        // Intentar reconectar si no fue un cierre intencional
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
    }
  }, [account])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.close(1000, 'User disconnected')
      socketRef.current = null
    }
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [])

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!socketRef.current) {
      console.warn('WebSocket is not connected')
      return
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === eventType) {
          callback(data.payload)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    socketRef.current.addEventListener('message', handleMessage)

    return () => {
      socketRef.current?.removeEventListener('message', handleMessage)
    }
  }, [])

  // Conectar cuando el usuario esté conectado
  useEffect(() => {
    if (web3Connected && account) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [web3Connected, account, connect, disconnect])

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    subscribe,
    connect,
    disconnect
  }
} 