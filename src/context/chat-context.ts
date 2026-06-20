import { createContext, type RefObject } from 'react'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatContextValue {
  open: boolean
  messages: ChatMessage[]
  input: string
  streaming: boolean
  error: string | null
  setOpen: (open: boolean) => void
  setInput: (value: string) => void
  sendMessage: (text: string) => Promise<void>
  openWithQuestion: (question: string) => void
  toggleChat: () => void
  inputRef: RefObject<HTMLInputElement | null>
}

export const ChatContext = createContext<ChatContextValue | null>(null)

export const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || '/api/chat'
