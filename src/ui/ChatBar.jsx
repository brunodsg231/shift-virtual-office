import { useState, useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { assignTaskToAgent } from '../socket/client'
import VoiceButton from './VoiceButton'
import { useIsMobile } from '../hooks/useMediaQuery'

const AGENT_IDS = ['kim', 'dev', 'marco', 'zara', 'riley', 'dante', 'sam', 'petra', 'lex', 'bruno']

const QUICK_ACTIONS = {
  kim:   ['Check bookings', 'Client follow-up', 'Calendar availability'],
  dev:   ['Deploy status', 'Check errors', 'Run tests'],
  marco: ['Pipeline summary', 'Follow up leads', 'Draft outreach'],
  zara:  ['Content ideas', 'SEO check', 'Social post'],
  riley: ['AV status', 'Projector check', 'Sound test'],
  dante: ['Inventory check', 'Menu update', 'Vendor order'],
  sam:   ['Event checklist', 'Staff schedule', 'Vendor status'],
  petra: ['Invoice summary', 'Budget check', 'Expense report'],
  lex:   ['Contract review', 'Compliance check', 'Risk assessment'],
  bruno: ['Team status', 'Run standup', 'Daily priorities'],
}

// Each button subscribes to its own agent's static data — no cascade re-renders
const AgentSelectorButton = memo(function AgentSelectorButton({ agentId, isSelected, onSelect }) {
  const name = useStore((s) => s.agents[agentId]?.name)
  const color = useStore((s) => s.agents[agentId]?.color)

  return (
    <button
      onClick={() => onSelect(agentId)}
      style={{
        background: isSelected ? `${color}22` : 'transparent',
        border: isSelected ? `1px solid ${color}` : '1px solid transparent',
        borderRadius: 20,
        padding: '3px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: tokens.fontUI,
        fontSize: 11,
        fontWeight: isSelected ? 600 : 400,
        color: isSelected ? color : 'rgba(255,255,255,0.3)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
          e.currentTarget.style.borderColor = 'transparent'
        }
      }}
    >
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color,
        display: 'inline-block',
        flexShrink: 0,
        opacity: isSelected ? 1 : 0.4,
        transition: 'opacity 0.15s',
      }} />
      {name}
    </button>
  )
})

export default function ChatBar() {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const activeAgent = useStore((s) => s.activeAgent)
  const setActiveAgent = useStore((s) => s.setActiveAgent)
  const assignTask = useStore((s) => s.assignTask)
  // Subscribe to individual fields — not the whole agents object
  const activeStatus = useStore((s) => s.agents[activeAgent]?.status)
  const activeName = useStore((s) => s.agents[activeAgent]?.name)

  const isMobile = useIsMobile()
  const isBusy = activeStatus !== 'idle'

  const handleSubmit = () => {
    const text = input.trim()
    if (!text || isBusy) return
    setInput('')
    assignTask(activeAgent, text)
    assignTaskToAgent(activeAgent, text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Keyboard shortcut: "/" to focus
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        bottom: isMobile ? '8px' : '20px',
        left: isMobile ? '8px' : '0',
        right: isMobile ? '8px' : '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        zIndex: 200,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          width: isMobile ? '100%' : '660px',
          maxWidth: isMobile ? '100%' : 'calc(100vw - 40px)',
          background: 'rgba(10,10,24,0.92)',
          backdropFilter: 'blur(24px)',
          border: `1px solid ${focused ? tokens.borderBright : 'rgba(255,255,255,0.08)'}`,
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '8px 12px' : '12px 16px',
          boxShadow: focused
            ? '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(123,92,230,0.15)'
            : '0 8px 32px rgba(0,0,0,0.5)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
      {/* ROW 1 — Agent selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        paddingBottom: 10,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {AGENT_IDS.map((id) => (
          <AgentSelectorButton
            key={id}
            agentId={id}
            isSelected={activeAgent === id}
            onSelect={setActiveAgent}
          />
        ))}
      </div>

      {/* ROW 2 — Quick actions */}
      {!isBusy && (
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '8px 0 0',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {(QUICK_ACTIONS[activeAgent] || []).map((action) => (
            <button
              key={action}
              onClick={() => {
                assignTask(activeAgent, action)
                assignTaskToAgent(activeAgent, action)
              }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
                padding: '4px 12px',
                fontFamily: tokens.fontUI,
                fontSize: 11,
                color: tokens.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(123,92,230,0.12)'
                e.currentTarget.style.borderColor = tokens.accentDim
                e.currentTarget.style.color = tokens.textPrimary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = tokens.textSecondary
              }}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* ROW 3 — Input row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10 }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={isBusy ? `${activeName} is busy...` : `Message ${activeName}...`}
          disabled={isBusy}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            fontFamily: tokens.fontUI,
            fontSize: 14,
            color: tokens.textPrimary,
            padding: '4px 0',
            outline: 'none',
            opacity: isBusy ? 0.3 : 1,
            caretColor: tokens.accent,
          }}
        />

        {/* Voice button */}
        <VoiceButton
          disabled={isBusy}
          onTranscript={(text) => {
            setInput(text)
            setTimeout(() => {
              const trimmed = text.trim()
              if (trimmed && !isBusy) {
                assignTask(activeAgent, trimmed)
                assignTaskToAgent(activeAgent, trimmed)
                setInput('')
              }
            }, 300)
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={isBusy || !input.trim()}
          style={{
            background: isBusy || !input.trim()
              ? 'rgba(255,255,255,0.03)'
              : tokens.accent,
            border: 'none',
            borderRadius: 8,
            padding: '6px 16px',
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            cursor: isBusy || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
            fontFamily: tokens.fontUI,
            fontSize: 13,
            fontWeight: 600,
            color: isBusy || !input.trim() ? 'rgba(255,255,255,0.15)' : '#fff',
            opacity: isBusy || !input.trim() ? 0.4 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isBusy && input.trim()) e.currentTarget.style.background = tokens.accentBright
          }}
          onMouseLeave={(e) => {
            if (!isBusy && input.trim()) e.currentTarget.style.background = tokens.accent
          }}
        >
          Send &uarr;
        </button>
      </div>
      </div>
    </motion.div>
  )
}
