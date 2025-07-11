import { useState, useCallback } from 'react'
import { ChatMessage } from '../types/metaverso'

interface UseChatReturn {
  messages: ChatMessage[]
  sendMessage: (content: string, channel: string) => void
  clearMessages: (channel: string) => void
}

export const useChat = (initialMessages: ChatMessage[] = []): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)

  const sendMessage = useCallback((content: string, channel: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: content,
      content, // compatibilidad con campos antiguos
      sender: {
        id: 'user',
        username: 'Usuario',
        avatar: '/avatars/default.png',
        level: 1
      },
      timestamp: new Date(),
      type: 'text',
      channel,
      roomId: channel, // compatibilidad con campos antiguos
      mentions: [],
      attachments: [],
      reactions: [],
      edited: false,
      deleted: false
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  const clearMessages = useCallback((channel: string) => {
    setMessages(prev => prev.filter(msg => msg.channel !== channel && msg.roomId !== channel))
  }, [])

  return {
    messages,
    sendMessage,
    clearMessages
  }
}
