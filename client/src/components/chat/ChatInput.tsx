import React, { useState } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSend(message.trim())
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSend} className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg">
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="flex-1 px-3 py-2 rounded-md bg-gray-700 text-white focus:outline-none"
        placeholder="Escribe un mensaje..."
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
      >
        Enviar
      </button>
    </form>
  )
}

export default ChatInput 