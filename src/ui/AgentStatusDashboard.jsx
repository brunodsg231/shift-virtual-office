import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { useIsMobile } from '../hooks/useMediaQuery'

const STATUS_CONFIG = {
  idle: { label: 'Idle', color: tokens.textDim, icon: '—' },
  working: { label: 'Working', color: '#3B82F6', icon: '⚡' },
  speaking: { label: 'Speaking', color: tokens.green, icon: '💬' },
  thinking: { label: 'Thinking', color: tokens.accent, icon: '🧠' },
  delegating: { label: 'Delegating', color: '#F59E0B', icon: '👉' },
  error: { label: 'Error', color: tokens.red, icon: '⚠️' },
}

function AgentRow({ agent, isActive, onClick }) {
  const cfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG.idle
  const taskCount = agent.taskHistory.length
  const lastTask = agent.taskHistory[agent.taskHistory.length - 1]

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        background: isActive ? 'rgba(123,92,230,0.08)' : 'rgba(255,255,255,0.02)',
        border: isActive ? `1px solid ${tokens.accentDim}` : '1px solid rgba(255,255,255,0.04)',
        borderRadius: 10,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: tokens.fontUI,
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
      }}
    >
      {/* Color dot */}
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: agent.color,
        flexShrink: 0,
        boxShadow: agent.status !== 'idle' ? `0 0 8px ${agent.color}` : 'none',
      }} />

      {/* Name & role */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: tokens.textPrimary,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {agent.name}
          <span style={{
            fontSize: 9,
            color: cfg.color,
            fontWeight: 500,
          }}>
            {cfg.icon}
          </span>
        </div>
        <div style={{
          fontSize: 10,
          color: tokens.textDim,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {agent.status !== 'idle' && lastTask ? lastTask.text : agent.role}
        </div>
      </div>

      {/* Task count */}
      <div style={{
        fontFamily: tokens.fontMono,
        fontSize: 10,
        color: tokens.textDim,
        flexShrink: 0,
      }}>
        {taskCount > 0 ? `${taskCount}` : ''}
      </div>

      {/* Status indicator */}
      <div style={{
        width: 4,
        height: 20,
        borderRadius: 2,
        background: cfg.color,
        opacity: agent.status === 'idle' ? 0.2 : 0.8,
        flexShrink: 0,
      }} />
    </motion.button>
  )
}

export default function AgentStatusDashboard() {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const agents = useStore((s) => s.agents)
  const activeAgent = useStore((s) => s.activeAgent)
  const openAgentDetail = useStore((s) => s.openAgentDetail)

  const agentList = Object.values(agents)
  const activeCount = agentList.filter((a) => a.status !== 'idle').length
  const totalTasks = agentList.reduce((sum, a) => sum + a.taskHistory.length, 0)

  return (
    <>
      {/* Toggle button — bottom left above minimap */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 190,
          left: 16,
          zIndex: 100,
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'rgba(10,10,24,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: tokens.textDim,
          fontSize: 14,
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = tokens.textPrimary
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = tokens.textDim
          e.currentTarget.style.borderColor = tokens.glassBorder
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 499,
                background: 'rgba(0,0,0,0.2)',
              }}
            />

            <motion.div
              initial={{ x: isMobile ? '-100vw' : -340, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? '-100vw' : -340, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: isMobile ? 0 : 12,
                left: isMobile ? 0 : 12,
                bottom: isMobile ? 0 : 12,
                width: isMobile ? '100vw' : 300,
                zIndex: 500,
                background: tokens.glass,
                backdropFilter: tokens.glassBlur,
                border: `1px solid ${tokens.glassBorder}`,
                borderRadius: tokens.radiusLarge,
                boxShadow: tokens.glassShadow,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '20px 20px 16px',
                borderBottom: `1px solid ${tokens.glassBorder}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontFamily: tokens.fontUI,
                    fontSize: 14,
                    fontWeight: 700,
                    color: tokens.textPrimary,
                  }}>
                    Team Status
                  </span>
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 6,
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tokens.textDim,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Stats row */}
                <div style={{
                  display: 'flex',
                  gap: 16,
                  marginTop: 12,
                }}>
                  <div>
                    <div style={{
                      fontFamily: tokens.fontMono,
                      fontSize: 18,
                      fontWeight: 700,
                      color: activeCount > 0 ? tokens.green : tokens.textDim,
                    }}>
                      {activeCount}/{agentList.length}
                    </div>
                    <div style={{
                      fontFamily: tokens.fontUI,
                      fontSize: 9,
                      color: tokens.textDim,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>
                      Active
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontFamily: tokens.fontMono,
                      fontSize: 18,
                      fontWeight: 700,
                      color: tokens.textPrimary,
                    }}>
                      {totalTasks}
                    </div>
                    <div style={{
                      fontFamily: tokens.fontUI,
                      fontSize: 9,
                      color: tokens.textDim,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>
                      Tasks
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent list */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                {agentList.map((a) => (
                  <AgentRow
                    key={a.id}
                    agent={a}
                    isActive={activeAgent === a.id}
                    onClick={() => {
                      openAgentDetail(a.id)
                      setOpen(false)
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
