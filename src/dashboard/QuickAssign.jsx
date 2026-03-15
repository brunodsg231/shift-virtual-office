import { useState, useRef, useEffect, memo } from 'react'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { assignTaskToAgent } from '../socket/client'

const AGENT_IDS = ['kim', 'dev', 'marco', 'zara', 'riley', 'dante', 'sam', 'petra', 'lex', 'bruno']

const AgentDot = memo(function AgentDot({ agentId, isSelected, onSelect }) {
  const name = useStore((s) => s.agents[agentId]?.name)
  const color = useStore((s) => s.agents[agentId]?.color)

  return (
    <button
      onClick={() => onSelect(agentId)}
      title={name}
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: `${color}${isSelected ? '44' : '22'}`,
        border: isSelected ? `2px solid ${color}` : '2px solid transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
        flexShrink: 0,
        padding: 0,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = `${color}66`
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          opacity: isSelected ? 1 : 0.5,
          transition: 'opacity 0.15s',
        }}
      />
    </button>
  )
})

export default function QuickAssign() {
  const [input, setInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('bruno')
  const inputRef = useRef(null)

  const agentName = useStore((s) => s.agents[selectedAgent]?.name)
  const agentStatus = useStore((s) => s.agents[selectedAgent]?.status)
  const assignTask = useStore((s) => s.assignTask)

  const isBusy = agentStatus !== 'idle'

  const handleSubmit = () => {
    const text = input.trim()
    if (!text || isBusy) return
    setInput('')
    assignTaskToAgent(selectedAgent, text)
    useStore.getState().assignTask(selectedAgent, text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 300,
        background: tokens.glass,
        backdropFilter: tokens.glassBlur,
        borderTop: `1px solid ${tokens.glassBorder}`,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Agent dots */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
        }}
      >
        {AGENT_IDS.map((id) => (
          <AgentDot
            key={id}
            agentId={id}
            isSelected={selectedAgent === id}
            onSelect={setSelectedAgent}
          />
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 24,
          background: tokens.glassBorder,
          flexShrink: 0,
        }}
      />

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isBusy
            ? `${agentName} is busy...`
            : `Assign a task to ${agentName}...`
        }
        disabled={isBusy}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          fontFamily: tokens.fontUI,
          fontSize: 14,
          color: tokens.textPrimary,
          padding: '6px 0',
          outline: 'none',
          opacity: isBusy ? 0.3 : 1,
          caretColor: tokens.accent,
        }}
      />

      {/* Send button */}
      <button
        onClick={handleSubmit}
        disabled={isBusy || !input.trim()}
        style={{
          background:
            isBusy || !input.trim()
              ? 'rgba(255,255,255,0.03)'
              : tokens.accent,
          border: 'none',
          borderRadius: 8,
          padding: '6px 18px',
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isBusy || !input.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          flexShrink: 0,
          fontFamily: tokens.fontUI,
          fontSize: 13,
          fontWeight: 600,
          color:
            isBusy || !input.trim()
              ? 'rgba(255,255,255,0.15)'
              : '#fff',
          opacity: isBusy || !input.trim() ? 0.4 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isBusy && input.trim())
            e.currentTarget.style.background = tokens.accentBright
        }}
        onMouseLeave={(e) => {
          if (!isBusy && input.trim())
            e.currentTarget.style.background = tokens.accent
        }}
      >
        Assign
      </button>
    </div>
  )
}
