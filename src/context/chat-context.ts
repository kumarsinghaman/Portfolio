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

const PRODUCTION_CHAT_API_URL =
  'https://portfolio-two-ruddy-m4gutm4tn2.vercel.app/api/chat'

/** Empty GitHub Actions secrets override .env.production — treat blank as unset. */
export const CHAT_API_URL =
  import.meta.env.VITE_CHAT_API_URL?.trim() ||
  (import.meta.env.PROD ? PRODUCTION_CHAT_API_URL : '/api/chat')
