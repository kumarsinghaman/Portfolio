import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { CHAT_SUGGESTIONS } from '../data/chatSuggestions'
import { useChat } from '../hooks/useChat'

export function ChatWidget() {
  const {
    open,
    setOpen,
    messages,
    input,
    setInput,
    sendMessage,
    streaming,
    error,
    toggleChat,
    inputRef,
  } = useChat()

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open, inputRef])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void sendMessage(input)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 flex h-[min(520px,80vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-border bg-bg shadow-2xl glow-accent sm:right-6"
          >
            <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
              <div>
                <p className="font-mono text-sm font-semibold text-accent">ASK AKS AI</p>
                <p className="text-xs text-muted">Powered by DeepSeek</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-text transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted">
                    Hi! Ask me anything about Aman's experience, projects, or skills.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CHAT_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => void sendMessage(s)}
                        className="rounded border border-border px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-accent/15 text-text border border-accent/30'
                        : 'bg-surface border border-border text-muted'
                    }`}
                  >
                    {msg.content ||
                      (streaming && i === messages.length - 1 ? (
                        <Loader2 size={16} className="animate-spin text-accent" />
                      ) : null)}
                  </div>
                </div>
              ))}

              {error && <p className="text-center text-xs text-red-400">{error}</p>}

              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-border p-3">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Aman..."
                  disabled={streaming}
                  className="flex-1 rounded border border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder:text-muted focus:border-accent/50 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded border border-accent/50 bg-accent/10 text-accent transition-all hover:bg-accent/20 disabled:opacity-40"
                  aria-label="Send message"
                >
                  {streaming ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-accent/50 bg-bg px-4 py-3 font-mono text-sm text-accent shadow-lg glow-accent transition-all hover:bg-accent/10 sm:right-6"
        aria-label="Open AI chat"
      >
        {open ? <X size={18} /> : <MessageCircle size={18} />}
        <span className="hidden sm:inline">{open ? 'Close' : 'Ask AKS AI'}</span>
      </motion.button>
    </>
  )
}
