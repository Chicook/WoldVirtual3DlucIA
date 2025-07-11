import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from '@/types/metaverso';

// Componente avanzado de mensaje individual
const ChatMessageItem: React.FC<{
  message: ChatMessage
  onReply: (message: ChatMessage) => void
  onReact: (messageId: string, reaction: string) => void
}> = ({ message, onReply, onReact }) => {
  const [showReactions, setShowReactions] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡']
  const messageReactions = (message.reactions as unknown as Record<string, number>) || {}

  const handleReaction = (reaction: string) => {
    onReact(message.id, reaction)
    setShowReactions(false)
  }

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getMessageTypeColor = () => {
    switch (message.type) {
      case 'system': return 'text-yellow-400'
      case 'trade': return 'text-green-400'
      case 'guild': return 'text-purple-400'
      case 'whisper': return 'text-pink-400'
      case 'emote': return 'text-blue-400'
      default: return 'text-white'
    }
  }

  const getMessageTypeIcon = () => {
    switch (message.type) {
      case 'system': return '🔔'
      case 'trade': return '💰'
      case 'guild': return '🏰'
      case 'whisper': return '💬'
      case 'emote': return '🎭'
      default: return ''
    }
  }

  return (
    <div
      className={`group relative p-3 rounded-lg transition-all duration-200 ${
        isHovered ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header del mensaje */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {message.sender.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white">{message.sender.username}</span>
              {message.type !== 'text' && (
                <span className="text-sm">{getMessageTypeIcon()}</span>
              )}
              <span className="text-xs text-gray-400">Lv.{message.sender.level}</span>
            </div>
            <div className="text-xs text-gray-500">{formatTime(message.timestamp)}</div>
          </div>
        </div>

        {/* Contador de reacciones */}
        {Object.keys(messageReactions).length > 0 && (
          <div className="flex space-x-1">
            {Object.entries(messageReactions).map(([reaction, count]) => (
              <span
                key={reaction}
                className="px-2 py-1 bg-gray-600 rounded-full text-xs text-white"
              >
                {reaction} {count}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Contenido del mensaje */}
      <div className={`${getMessageTypeColor()} break-words`}>
        {message.text}
      </div>

      {/* Acciones del mensaje */}
      {isHovered && (
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onReply(message)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
            title="Responder"
          >
            ↩️
          </button>
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
            title="Reaccionar"
          >
            😊
          </button>
        </div>
      )}

      {/* Panel de reacciones */}
      {showReactions && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10">
          <div className="p-2 flex space-x-1">
            {reactions.map((reaction) => (
              <button
                key={reaction}
                onClick={() => handleReaction(reaction)}
                className="w-8 h-8 text-lg hover:bg-gray-700 rounded transition-colors flex items-center justify-center"
              >
                {reaction}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente principal avanzado
export const ChatSystem: React.FC = () => {
  const { messages, sendMessage } = useChat()
  const [activeChannel, setActiveChannel] = useState('general')
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const channels = [
    { id: 'general', name: 'General', icon: '💬' },
    { id: 'trade', name: 'Comercio', icon: '💰' },
    { id: 'guild', name: 'Gremio', icon: '🏰' },
    { id: 'help', name: 'Ayuda', icon: '❓' }
  ]

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    try {
      const newMessage: Partial<ChatMessage> = {
        text: message.trim(),
        timestamp: new Date(),
        type: activeChannel === 'trade' ? 'trade' : 
              activeChannel === 'guild' ? 'guild' : 'text'
      }

      // Enviar mensaje usando el hook
      await sendMessage(newMessage.text || '')
      setMessage('')
      setReplyTo(null)
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
    }
  }

  const handleReply = (message: ChatMessage) => {
    setReplyTo(message)
  }

  const handleReaction = (messageId: string, reaction: string) => {
    // Aquí se procesaría la reacción
    console.log('Reacción:', { messageId, reaction })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else if (e.key === 'Escape' && replyTo) {
      setReplyTo(null)
    }
  }

  const filteredMessages = messages.filter((msg: ChatMessage) => {
    if (activeChannel === 'general') return msg.type === 'text' || msg.type === 'system'
    if (activeChannel === 'trade') return msg.type === 'trade'
    if (activeChannel === 'guild') return msg.type === 'guild'
    return true
  })

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg">
      {/* Header del chat */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Chat</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {filteredMessages.length} mensajes
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Canales */}
      <div className="flex border-b border-gray-700">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => setActiveChannel(channel.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
              activeChannel === channel.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{channel.icon}</span>
            <span>{channel.name}</span>
          </button>
        ))}
      </div>

      {/* Mensaje de respuesta */}
      {replyTo && (
        <div className="p-3 bg-blue-600/20 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-300">
              Respondiendo a <span className="font-semibold">{replyTo.sender.username}</span>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-blue-300 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-blue-200 mt-1 truncate">
            {replyTo.text}
          </div>
        </div>
      )}

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">💬</div>
            <p>No hay mensajes en este canal</p>
            <p className="text-sm">¡Sé el primero en escribir!</p>
          </div>
        ) : (
          filteredMessages.map((msg: ChatMessage) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onReply={handleReply}
              onReact={handleReaction}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatSystem; 
