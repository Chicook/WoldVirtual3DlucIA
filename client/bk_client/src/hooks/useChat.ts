import { useState, useCallback } from 'react'
import { ChatMessage } from '@/types/metaverso'

interface UseChatReturn {
  messages: ChatMessage[]
  sendMessage: (content: string, channel: string) => void
  clearMessages: (channel: string) => void
  isLoading: boolean
  error: string | null
}

export const useChat = (initialMessages: ChatMessage[] = []): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback((content: string, channel: string) => {
    try {
      setError(null)
      setIsLoading(true)
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content,
        sender: {
          id: 'user',
          username: 'Usuario',
          avatar: '/avatars/default.png'
        },
        timestamp: new Date(),
        roomId: channel,
        type: 'text'
      }

      setMessages(prev => [...prev, newMessage])
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error enviando mensaje')
      setIsLoading(false)
    }
  }, [])

  const clearMessages = useCallback((channel: string) => {
    setMessages(prev => prev.filter(msg => msg.roomId !== channel))
  }, [])
import { useState, useCallback, useEffect } from 'react'
import { ChatMessage, ChatReaction } from '../types/metaverso'

interface UseChatReturn {
  messages: ChatMessage[]
  sendMessage: (content: string, channelId: string) => void
  addReaction: (messageId: string, reaction: ChatReaction) => void
  removeReaction: (messageId: string, reactionId: string) => void
  clearMessages: (channelId: string) => void
  activeChannel: string | null
  setActiveChannel: (channelId: string) => void
  isTyping: boolean
  typingUsers: string[]
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeChannel, setActiveChannel] = useState<string>('global')
  const [isTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  const sendMessage = useCallback((content: string, channelId: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: content,
      channel: channelId,
      sender: {
        id: 'user-1',
        username: 'Usuario',
        avatar: '👤',
        level: 1
      },
      timestamp: new Date(),
      type: 'text',
      mentions: [],
      attachments: [],
      reactions: [],
      edited: false,
      deleted: false
    }

    setMessages(prev => [...prev, newMessage])
    
    // Simular respuesta automática
    setTimeout(() => {
      const autoResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '¡Mensaje recibido!',
        channel: channelId,
        sender: {
          id: 'system',
          username: 'Sistema',
          avatar: '🤖',
          level: 99
        },
        timestamp: new Date(),
        type: 'text',
        mentions: [],
        attachments: [],
        reactions: [],
        edited: false,
        deleted: false
      }
      setMessages(prev => [...prev, autoResponse])
    }, 1000)
  }, [])

  const addReaction = useCallback((messageId: string, reaction: ChatReaction) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        const existingReaction = message.reactions.find(r => r.emoji === reaction.emoji)
        if (existingReaction) {
          existingReaction.count++
        } else {
          message.reactions.push({ ...reaction, count: 1 })
        }
      }
      return message
    }))
  }, [])

  const removeReaction = useCallback((messageId: string, reactionId: string) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        message.reactions = message.reactions.filter(r => r.emoji !== reactionId)
      }
      return message
    }))
  }, [])

  const clearMessages = useCallback((channelId: string) => {
    setMessages(prev => prev.filter(message => message.channel !== channelId))
  }, [])

  const handleTyping = useCallback((isUserTyping: boolean, username: string) => {
    if (isUserTyping) {
      setTypingUsers(prev => [...new Set([...prev, username])])
    } else {
      setTypingUsers(prev => prev.filter(user => user !== username))
    }
  }, [])

  // Simular usuarios escribiendo
  useEffect(() => {
    const interval = setInterval(() => {
      const users = ['Alice', 'Bob', 'Charlie']
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const isTyping = Math.random() > 0.7
      
      if (isTyping) {
        handleTyping(true, randomUser)
        setTimeout(() => handleTyping(false, randomUser), 3000)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [handleTyping])

  return {
    messages,
    sendMessage,
    addReaction,
    removeReaction,
    clearMessages,
    activeChannel,
    setActiveChannel,
    isTyping,
    typingUsers
    addReaction,
    removeReaction,
    clearMessages,
    activeChannel,
    setActiveChannel,
    isTyping,
    typingUsers
    clearMessages,
    isLoading,
    error
  }
}
