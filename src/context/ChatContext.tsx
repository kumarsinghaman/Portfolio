import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatContextValue {
  open: boolean
  messages: Message[]
  input: string
  streaming: boolean
  error: string | null
  setOpen: (open: boolean) => void
  setInput: (value: string) => void
  sendMessage: (text: string) => Promise<void>
  openWithQuestion: (question: string) => void
  toggleChat: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

const ChatContext = createContext<ChatContextValue | null>(null)

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || '/api/chat'

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return

      const userMsg: Message = { role: 'user', content: text.trim() }
      const updated = [...messages, userMsg]
      setMessages(updated)
      setInput('')
      setStreaming(true)
      setError(null)

      const assistantMsg: Message = { role: 'assistant', content: '' }
      setMessages([...updated, assistantMsg])

      try {
        const res = await fetch(CHAT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updated }),
        })

        if (!res.ok) throw new Error(`API error: ${res.status}`)

        const reader = res.body?.getReader()
        if (!reader) throw new Error('No stream')

        const decoder = new TextDecoder()
        let buffer = ''
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulated += parsed.content
                setMessages((prev) => {
                  const copy = [...prev]
                  copy[copy.length - 1] = { role: 'assistant', content: accumulated }
                  return copy
                })
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } catch (err) {
        console.error('Chat error:', err)
        setError('Unable to reach the AI assistant. Please try again later.')
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setStreaming(false)
      }
    },
    [messages, streaming],
  )

  const openWithQuestion = useCallback(
    (question: string) => {
      setOpen(true)
      void sendMessage(question)
    },
    [sendMessage],
  )

  const toggleChat = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        open,
        messages,
        input,
        streaming,
        error,
        setOpen,
        setInput,
        sendMessage,
        openWithQuestion,
        toggleChat,
        inputRef,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
