import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { CHAT_SUGGESTIONS } from '../data/chatSuggestions'
import { useChat } from '../context/ChatContext'
import { useReducedMotion } from '../hooks/useReducedMotion'

const MIN_LENGTH = 3
const MAX_LENGTH = 500

function CyclingPlaceholder({
  active,
  onQuestionChange,
}: {
  active: boolean
  onQuestionChange: (question: string) => void
}) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [display, setDisplay] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!active) return

    if (reduced) {
      const q = CHAT_SUGGESTIONS[index]
      setDisplay(q)
      onQuestionChange(q)
      return
    }

    const current = CHAT_SUGGESTIONS[index]
    onQuestionChange(current)

    const timeout = window.setTimeout(
      () => {
        if (!deleting) {
          if (display.length < current.length) {
            setDisplay(current.slice(0, display.length + 1))
          } else {
            window.setTimeout(() => setDeleting(true), 2200)
          }
        } else if (display.length > 0) {
          setDisplay(display.slice(0, -1))
        } else {
          setDeleting(false)
          setIndex((i) => (i + 1) % CHAT_SUGGESTIONS.length)
        }
      },
      deleting ? 30 : 55,
    )

    return () => window.clearTimeout(timeout)
  }, [active, deleting, display, index, onQuestionChange, reduced])

  if (!active) return null

  return (
    <span className="pointer-events-none truncate text-muted">
      {display}
      <span className="animate-pulse text-accent">|</span>
    </span>
  )
}

export function HeroAskBox() {
  const { openWithQuestion, streaming } = useChat()
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [currentSuggestion, setCurrentSuggestion] = useState<string>(CHAT_SUGGESTIONS[0])

  const isEditing = focused || value.length > 0
  const trimmed = value.trim()
  const canSubmit = !streaming && (!isEditing || trimmed.length >= MIN_LENGTH)

  const submitSample = () => {
    if (streaming || !currentSuggestion) return
    setError(null)
    setValue('')
    setFocused(false)
    openWithQuestion(currentSuggestion)
  }

  const submitTyped = () => {
    if (trimmed.length < MIN_LENGTH) {
      setError(`Question must be at least ${MIN_LENGTH} characters.`)
      inputRef.current?.focus()
      return
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Question must be under ${MAX_LENGTH} characters.`)
      return
    }

    setError(null)
    setValue('')
    setFocused(false)
    openWithQuestion(trimmed)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (streaming) return

    if (!isEditing) {
      submitSample()
      return
    }

    submitTyped()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    if (error) setError(null)
  }

  const focusInput = () => {
    inputRef.current?.focus()
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.5 }}
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto mt-4 w-full max-w-xl"
    >
      <div
        onClick={focusInput}
        className={`group relative flex cursor-text items-center gap-3 rounded-lg border bg-surface/60 px-4 py-3.5 font-mono text-sm transition-all hover:glow-accent focus-within:border-accent/50 sm:px-5 sm:py-4 ${
          error
            ? 'border-red-400/60 hover:border-red-400/60'
            : 'border-border hover:border-accent/40'
        }`}
      >
        <span className="shrink-0 text-accent">&gt;</span>

        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              if (!value.trim()) setFocused(false)
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setValue('')
                setError(null)
                setFocused(false)
                inputRef.current?.blur()
              }
            }}
            disabled={streaming}
            maxLength={MAX_LENGTH}
            placeholder=""
            aria-label="Ask AKS AI a question"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'hero-ask-error' : undefined}
            className="w-full bg-transparent text-text outline-none disabled:opacity-50"
          />
          {!focused && !value && (
            <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
              <CyclingPlaceholder
                active={!focused && !value}
                onQuestionChange={setCurrentSuggestion}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          onClick={(e) => e.stopPropagation()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-accent/40 bg-accent/10 text-accent transition-all hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Ask AKS AI"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      {error && (
        <p id="hero-ask-error" className="mt-2 text-left font-mono text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </motion.form>
  )
}
