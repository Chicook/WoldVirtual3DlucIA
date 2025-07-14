import React, { useState, useCallback, useRef, useEffect } from 'react'
// motion import removed - not used in current implementation
// useMetaverso import removed - not used in current implementation
import React, { useState, useCallback, useRef, useEffect } from 'react'
// motion import removed - not used in current implementation
// useMetaverso import removed - not used in current implementation
import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChatMessage } from '@/types/metaverso'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  placeholder?: string
  disabled?: boolean
  replyTo?: ChatMessage | null
  onCancelReply?: () => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = 'Escribe un mensaje...',
  disabled = false,
  replyTo = null,
  onCancelReply
}) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [message])

  // Focus input when replyTo changes
  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus()
    }
  }, [replyTo])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      setIsTyping(false)
      
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const quickMessages = [
    '¡Hola!',
    '¿Cómo estás?',
    '¡Genial!',
    'Gracias',
    'Adiós'
  ]

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* Reply Preview */}
      {replyTo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded-r-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <span className="font-semibold">Respondiendo a {replyTo.sender.username}:</span>
              <p className="truncate">{replyTo.content}</p>
            </div>
            <button
              onClick={onCancelReply}
              className="text-gray-500 hover:text-gray-700 ml-2"
  maxLength?: number
  showEmojiPicker?: boolean
  showFileUpload?: boolean
  showVoiceMessage?: boolean
}

// Componente avanzado de selector de emojis
const EmojiPicker: React.FC<{
  onEmojiSelect: (emoji: string) => void
  isOpen: boolean
  onClose: () => void
}> = ({ onEmojiSelect, isOpen, onClose }) => {
  const emojiCategories = [
    {
      name: 'Emociones',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚']
    },
    {
      name: 'Acciones',
      emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌']
    },
    {
      name: 'Objetos',
      emojis: ['⚔️', '🛡️', '🏹', '🗡️', '🔪', '💎', '🪙', '🏆', '🎖️', '🥇', '🥈', '🥉', '🎗️', '🏅', '🎖️', '🏆', '💍', '👑', '👒', '🎩']
    },
    {
      name: 'Naturaleza',
      emojis: ['🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚']
    }
  ]

  if (!isOpen) return null

  return (
    <div className="absolute bottom-full mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
      <div className="p-3 border-b border-gray-600">
        <div className="flex space-x-2">
          {emojiCategories.map((category) => (
            <button
              key={category.name}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-3 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-10 gap-2">
          {emojiCategories.flatMap(category => category.emojis).map((emoji, index) => (
            <button
              key={index}
              onClick={() => {
                onEmojiSelect(emoji)
                onClose()
              }}
              className="w-8 h-8 text-lg hover:bg-gray-700 rounded transition-colors flex items-center justify-center"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente avanzado de carga de archivos
const FileUpload: React.FC<{
  onFileSelect: (file: File) => void
  isOpen: boolean
  onClose: () => void
}> = ({ onFileSelect, isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0])
      onClose()
    }
  }, [onFileSelect, onClose])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0])
      onClose()
    }
  }, [onFileSelect, onClose])

  if (!isOpen) return null

  return (
    <div className="absolute bottom-full mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 w-80">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Subir Archivo</h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-4xl mb-4">📁</div>
          <p className="text-gray-300 mb-2">Arrastra un archivo aquí o</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Seleccionar Archivo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
        </div>
        
        <div className="mt-4 text-xs text-gray-400">
          <p>Tipos soportados: Imágenes, Videos, Audio, PDF, Documentos</p>
          <p>Tamaño máximo: 10MB</p>
        </div>
      </div>
    </div>
  )
}

// Componente avanzado de grabación de voz
const VoiceRecorder: React.FC<{
  onRecordingComplete: (audioBlob: Blob) => void
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
}> = ({ onRecordingComplete, isRecording, onStartRecording, onStopRecording }) => {
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
        onRecordingComplete(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      onStartRecording()
    } catch (error) {
      console.error('Error al iniciar grabación:', error)
    }
  }, [onRecordingComplete, onStartRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      onStopRecording()
    }
  }, [isRecording, onStopRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center space-x-2">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
          title="Grabar mensaje de voz"
        >
          🎤
        </button>
      ) : (
        <div className="flex items-center space-x-2">
          <button
            onClick={stopRecording}
            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
            title="Detener grabación"
          >
            ⏹️
          </button>
          <span className="text-sm text-red-400 animate-pulse">
            {formatTime(recordingTime)}
          </span>
        </div>
      )}
    </div>
  )
}

export const ChatInput: React.FC<ChatInputProps> = ({
  // onSendMessage prop removed - not used in current implementation
  placeholder = 'Escribe un mensaje...',
  disabled = false,
  replyTo = null,
  onCancelReply,
  maxLength = 500,
  showEmojiPicker = true,
  showFileUpload = true,
  showVoiceMessage = true
}) => {
  // state removed - not used in current implementation
  const [message, setMessage] = useState('')
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const MAX_MESSAGE_LENGTH = 500
  const TYPING_INDICATOR_DELAY = 1000

  useEffect(() => {
    setCharCount(message.length)
  }, [message])

  const handleTyping = useCallback(() => {
    setIsTyping(true)
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, TYPING_INDICATOR_DELAY)
  }, [])

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || charCount > MAX_MESSAGE_LENGTH) return

    try {
      const newMessage: Partial<ChatMessage> = {
        text: message.trim(),
        timestamp: new Date(),
        type: 'text'
      }

      // Aquí se enviaría el mensaje usando el contexto
      console.log('Enviando mensaje:', newMessage)
      setMessage('')
      setIsTyping(false)
      setIsEmojiPickerOpen(false)
      setIsFileUploadOpen(false)
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
    }
  }, [message, charCount])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessage(prev => prev + emoji)
    inputRef.current?.focus()
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    // Aquí se procesaría el archivo y se enviaría como mensaje
    console.log('Archivo seleccionado:', file)
    
    // Simular envío de archivo
    const fileMessage: Partial<ChatMessage> = {
      text: `Archivo: ${file.name}`,
      timestamp: new Date(),
      type: 'text'
    }
    
    console.log('Enviando archivo:', fileMessage)
  }, [])

  const handleVoiceRecording = useCallback((audioBlob: Blob) => {
    // Aquí se procesaría el audio y se enviaría como mensaje
    console.log('Audio grabado:', audioBlob)
    
    const audioMessage: Partial<ChatMessage> = {
      text: 'Mensaje de voz',
      timestamp: new Date(),
      type: 'text'
    }
    
    console.log('Enviando audio:', audioMessage)
  }, [])

  const getCharCountColor = () => {
    if (charCount > MAX_MESSAGE_LENGTH) return 'text-red-500'
    if (charCount > MAX_MESSAGE_LENGTH * 0.8) return 'text-yellow-500'
    return 'text-gray-400'
  }

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      {/* Mensaje de respuesta */}
      {replyTo && (
        <div className="mb-3 p-3 bg-gray-700 rounded-lg relative">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 mb-1">
                Respondiendo a <span className="font-semibold">{replyTo.sender.username}</span>
              </p>
              <p className="truncate text-gray-400">{replyTo.text}</p>
            </div>
            <button
              onClick={onCancelReply}
              className="ml-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Quick Messages */}
      {!isTyping && message.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {quickMessages.map((quickMsg, index) => (
            <button
              key={index}
              onClick={() => setMessage(quickMsg)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
            >
              {quickMsg}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        </div>
      )}

      {/* Input principal */}
      <div className="flex items-end space-x-2">
        {/* Botones de herramientas */}
        <div className="flex space-x-1">
          {showEmojiPicker && (
            <div className="relative">
              <button
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                title="Emojis"
              >
                😊
              </button>
              {isEmojiPickerOpen && (
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  isOpen={isEmojiPickerOpen}
                  onClose={() => setIsEmojiPickerOpen(false)}
                />
              )}
            </div>
          )}
          
          {showFileUpload && (
            <div className="relative">
              <button
                onClick={() => setIsFileUploadOpen(!isFileUploadOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                title="Subir archivo"
              >
                📎
              </button>
              {isFileUploadOpen && (
                <FileUpload
                  onFileSelect={handleFileSelect}
                  isOpen={isFileUploadOpen}
                  onClose={() => setIsFileUploadOpen(false)}
                />
              )}
            </div>
          )}
          
          {showVoiceMessage && (
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecording}
              isRecording={isRecording}
              onStartRecording={() => setIsRecording(true)}
              onStopRecording={() => setIsRecording(false)}
            />
          )}
        </div>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={1}
            maxLength={500}
          />
          
          {/* Character Count */}
          {message.length > 0 && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {message.length}/500
            onChange={(e) => {
              setMessage(e.target.value)
              handleTyping()
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 resize-none border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            rows={1}
            maxLength={maxLength}
          />
          
          {/* Contador de caracteres */}
          {message.length > maxLength * 0.8 && (
            <div className={`absolute bottom-1 right-2 text-xs ${getCharCountColor()}`}>
              {charCount}/{maxLength}
            </div>
          )}
        </div>

        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={disabled}
        >
          😊
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Enviar
        </button>
      </form>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10"
        >
          <div className="grid grid-cols-8 gap-1">
            {['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '👏', '🙏', '🤔', '😎', '🥳', '😍', '🤩', '😴', '🤯'].map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 hover:bg-gray-100 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>
        {/* Botón de envío */}
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || charCount > MAX_MESSAGE_LENGTH}
          className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-1`}
        >
          <span>Enviar</span>
          <span className="text-sm">↵</span>
        </button>
      </div>

      {/* Indicador de escritura */}
      {isTyping && (
        <div className="mt-2 text-xs text-gray-400">
          Escribiendo...
        </div>
      )}
    </div>
  )
}

export default ChatInput 