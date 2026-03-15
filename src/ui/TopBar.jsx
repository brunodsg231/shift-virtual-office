import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { useIsMobile } from '../hooks/useMediaQuery'

// Static — agents are never added/removed at runtime
const AGENT_IDS = ['kim', 'dev', 'marco', 'zara', 'riley', 'dante', 'sam', 'petra', 'lex', 'bruno']

const STATUS_LABELS = {
  idle: 'Idle',
  working: 'Working',
  speaking: 'Speaking',
  thinking: 'Thinking',
  error: 'Error',
}

// Each dot subscribes to its own agent's fields — no cascade re-renders
const AgentDot = memo(function AgentDot({ agentId }) {
  const [hover, setHover] = useState(false)
  const openAgentDetail = useStore((s) => s.openAgentDetail)
  const status = useStore((s) => s.agents[agentId]?.status)
  const color = useStore((s) => s.agents[agentId]?.color)
  const name = useStore((s) => s.agents[agentId]?.name)
  const role = useStore((s) => s.agents[agentId]?.role)
  const currentMessage = useStore((s) => s.agents[agentId]?.currentMessage)
  const taskHistory = useStore((s) => s.agents[agentId]?.taskHistory)
  const lastHeartbeat = useStore((s) => s.lastHeartbeats[agentId])

  const isWorking = status === 'working'
  const isSpeaking = status === 'speaking'
  const isThinking = status === 'thinking'
  const isError = status === 'error'
  const isActive = isWorking || isSpeaking || isThinking
  const isOffline = lastHeartbeat && (Date.now() - lastHeartbeat > 5 * 60 * 1000)
  const lastTask = taskHistory?.[taskHistory.length - 1]

  return (
    <div
      style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
      onClick={() => openAgentDetail(agentId)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: isError ? tokens.red : color,
          opacity: isOffline ? 0.12 : status === 'idle' ? 0.25 : 1,
          boxShadow: isActive ? `0 0 8px ${color}` : 'none',
          animation: isSpeaking ? 'pulse 1.5s ease-in-out infinite' : 'none',
          transition: 'opacity 0.3s, box-shadow 0.3s',
        }}
      />
      {hover && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 8,
            background: 'rgba(10,10,24,0.95)',
            backdropFilter: tokens.glassBlur,
            border: `1px solid ${tokens.glassBorder}`,
            borderRadius: tokens.radiusSmall,
            padding: '10px 14px',
            whiteSpace: 'nowrap',
            zIndex: 500,
            boxShadow: tokens.glassShadow,
            minWidth: 160,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isError ? tokens.red : isActive ? tokens.green : tokens.textDim,
              boxShadow: isActive ? `0 0 6px ${tokens.green}` : 'none',
            }} />
            <span style={{
              fontFamily: tokens.fontUI, fontSize: 12, fontWeight: 700, color: color,
            }}>
              {name}
            </span>
            <span style={{
              fontFamily: tokens.fontMono, fontSize: 9,
              color: isError ? tokens.red : isActive ? tokens.green : tokens.textDim,
              marginLeft: 'auto',
            }}>
              {STATUS_LABELS[status] || status}
            </span>
          </div>
          <div style={{
            fontFamily: tokens.fontMono, fontSize: 9, color: tokens.textDim,
          }}>
            {role}
          </div>
          {isActive && lastTask && (
            <div style={{
              marginTop: 6, padding: '4px 8px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 4, borderLeft: `2px solid ${color}`,
              fontFamily: tokens.fontUI, fontSize: 10,
              color: tokens.textSecondary,
              maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {lastTask.text?.slice(0, 60)}
            </div>
          )}
          {taskHistory?.length > 0 && (
            <div style={{
              marginTop: 4, fontFamily: tokens.fontMono, fontSize: 9, color: tokens.textDim,
            }}>
              {taskHistory.length} task{taskHistory.length !== 1 ? 's' : ''} completed
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
})

export default function TopBar() {
  // Selectors return primitives — only re-render when counts actually change
  const connectedCount = useStore((s) => {
    let c = 0
    for (const id of AGENT_IDS) { if (s.agents[id]?.status !== 'error') c++ }
    return c
  })
  const activeCount = useStore((s) => {
    let c = 0
    for (const id of AGENT_IDS) { const st = s.agents[id]?.status; if (st && st !== 'idle') c++ }
    return c
  })
  const standupActive = useStore((s) => s.standupActive)
  const [time, setTime] = useState('')
  const [standupTriggering, setStandupTriggering] = useState(false)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-GB', { hour12: false }))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const triggerStandup = async () => {
    if (standupActive || standupTriggering) return
    setStandupTriggering(true)
    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
    try {
      await fetch(`${url}/api/standup/run`, { method: 'POST' })
    } catch (e) {
      console.error('Standup trigger failed:', e)
    }
    setStandupTriggering(false)
  }

  const navigate = useNavigate()
  const location = useLocation()
  const isDashboard = location.hash === '' || location.hash === '#/' || location.hash === '#'
  const isOnline = connectedCount > 0
  const isMobile = useIsMobile()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: isMobile ? '6px' : '12px',
        left: isMobile ? '6px' : '0',
        right: isMobile ? '6px' : '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '12px',
          height: isMobile ? '38px' : '44px',
          padding: isMobile ? '0 12px' : '0 18px',
          maxWidth: isMobile ? '100%' : '720px',
          background: 'rgba(10,10,24,0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '22px',
          whiteSpace: 'nowrap',
          fontFamily: tokens.fontMono,
          boxShadow: standupActive
            ? `${tokens.glassShadow}, 0 0 20px rgba(123,92,230,0.3)`
            : tokens.glassShadow,
          transition: 'box-shadow 0.3s',
        }}
      >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: tokens.accent,
          boxShadow: `0 0 8px ${tokens.accent}`,
        }} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: tokens.textPrimary,
          }}
        >
          SHIFT
          <span style={{ color: tokens.accent, marginLeft: 3 }}>HQ</span>
        </span>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

      {/* View switcher */}
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        {[
          { key: '/', label: 'Dashboard' },
          { key: '/office', label: 'Office' },
        ].map((v) => {
          const isActive = v.key === '/' ? isDashboard : !isDashboard
          return (
            <button
              key={v.key}
              onClick={() => navigate(v.key)}
              style={{
                background: isActive ? 'rgba(123,92,230,0.15)' : 'transparent',
                border: 'none',
                borderRadius: 6,
                padding: '4px 10px',
                fontFamily: tokens.fontMono,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: isActive ? tokens.accent : tokens.textDim,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = tokens.textPrimary
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = tokens.textDim
              }}
            >
              {v.label}
            </button>
          )
        })}
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

      {/* Agent dots */}
      <div style={{
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        flexShrink: 0,
      }}>
        {AGENT_IDS.map((id) => (
          <AgentDot key={id} agentId={id} />
        ))}
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

      {/* Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
      }}>
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: isOnline ? tokens.green : tokens.red,
            boxShadow: `0 0 6px ${isOnline ? tokens.green : tokens.red}`,
          }}
        />
        <span style={{
          fontSize: 10,
          color: tokens.textSecondary,
          letterSpacing: '0.05em',
        }}>
          {activeCount > 0 ? `${activeCount} active` : 'idle'}
        </span>
      </div>

      {!isMobile && <>
      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

      {/* Clock */}
      <span style={{
        fontSize: 11,
        color: tokens.textDim,
        fontVariantNumeric: 'tabular-nums',
        flexShrink: 0,
      }}>
        {time}
      </span>

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

      {/* Command palette hint */}
      <button
        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
        style={{
          background: 'transparent',
          border: 'none',
          borderRadius: 6,
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tokens.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <kbd style={{
          fontFamily: tokens.fontMono,
          fontSize: 8,
          color: tokens.textDim,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 3,
          padding: '1px 4px',
        }}>
          Ctrl+K
        </kbd>
      </button>

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
      </>}

      {/* Standup button */}
      <button
        onClick={triggerStandup}
        disabled={standupActive || standupTriggering}
        style={{
          background: standupActive
            ? 'rgba(123,92,230,0.15)'
            : 'transparent',
          border: 'none',
          borderRadius: 20,
          padding: '6px 14px',
          fontFamily: tokens.fontMono,
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: '0.08em',
          color: standupActive ? tokens.accent : tokens.textSecondary,
          cursor: standupActive || standupTriggering ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!standupActive && !standupTriggering) {
            e.currentTarget.style.background = 'rgba(123,92,230,0.1)'
            e.currentTarget.style.color = tokens.textPrimary
          }
        }}
        onMouseLeave={(e) => {
          if (!standupActive) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = tokens.textSecondary
          }
        }}
      >
        {standupActive ? '\u25CF LIVE' : standupTriggering ? '...' : 'STANDUP'}
      </button>
      </div>
    </motion.div>
  )
}
