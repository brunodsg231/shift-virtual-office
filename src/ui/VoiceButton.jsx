import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { tokens } from '../styles/tokens'

export default function VoiceButton({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  const supported = typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  )

  const toggle = useCallback(() => {
    if (!supported) return

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (transcript && onTranscript) {
        onTranscript(transcript)
      }
      setListening(false)
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [listening, supported, onTranscript])

  if (!supported) return null

  return (
    <motion.button
      onClick={toggle}
      disabled={disabled}
      whileTap={{ scale: 0.92 }}
      style={{
        background: listening
          ? 'rgba(255,69,58,0.15)'
          : 'rgba(255,255,255,0.03)',
        border: listening
          ? '1px solid rgba(255,69,58,0.3)'
          : '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8,
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        flexShrink: 0,
        opacity: disabled ? 0.3 : 1,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !listening) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
        }
      }}
      onMouseLeave={(e) => {
        if (!listening) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        }
      }}
    >
      {/* Pulse ring when listening */}
      {listening && (
        <div style={{
          position: 'absolute',
          inset: -3,
          borderRadius: 11,
          border: '1px solid rgba(255,69,58,0.3)',
          animation: 'pulse-scale 1.5s ease-in-out infinite',
        }} />
      )}

      {/* Mic icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={listening ? tokens.red : 'rgba(255,255,255,0.35)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </motion.button>
  )
}
