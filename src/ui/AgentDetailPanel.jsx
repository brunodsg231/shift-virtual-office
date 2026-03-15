import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { useIsMobile } from '../hooks/useMediaQuery'

const STATUS_CONFIG = {
  idle: { label: 'Idle', color: tokens.textDim, bg: 'rgba(255,255,255,0.04)' },
  working: { label: 'Working', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  speaking: { label: 'Speaking', color: tokens.green, bg: 'rgba(48,209,88,0.1)' },
  thinking: { label: 'Thinking', color: tokens.accent, bg: 'rgba(123,92,230,0.1)' },
  error: { label: 'Error', color: tokens.red, bg: 'rgba(255,69,58,0.1)' },
}

const ROLE_ICONS = {
  kim: '📅', dev: '⚡', marco: '📊', zara: '🎨',
  riley: '🎬', dante: '☕', sam: '📋', petra: '💰',
  lex: '⚖️', bruno: '🚀',
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 12px',
      borderRadius: 20,
      background: cfg.bg,
      border: `1px solid ${cfg.color}22`,
    }}>
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: cfg.color,
        boxShadow: status !== 'idle' ? `0 0 8px ${cfg.color}` : 'none',
        animation: status === 'speaking' ? 'pulse 1.5s ease-in-out infinite' : 'none',
      }} />
      <span style={{
        fontFamily: tokens.fontUI,
        fontSize: 11,
        fontWeight: 600,
        color: cfg.color,
        letterSpacing: '0.04em',
      }}>
        {cfg.label}
      </span>
    </div>
  )
}

function TaskItem({ task }) {
  const [expanded, setExpanded] = useState(false)
  const elapsed = Date.now() - task.timestamp
  const timeStr = elapsed < 60000
    ? 'just now'
    : elapsed < 3600000
      ? `${Math.floor(elapsed / 60000)}m ago`
      : `${Math.floor(elapsed / 3600000)}h ago`

  return (
    <div
      onClick={() => task.response && setExpanded(!expanded)}
      style={{
        padding: '10px 12px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.04)',
        cursor: task.response ? 'pointer' : 'default',
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          fontFamily: tokens.fontUI,
          fontSize: 12,
          color: tokens.textPrimary,
          lineHeight: 1.4,
          flex: 1,
        }}>
          {task.text}
        </div>
        {task.response && (
          <span style={{ fontSize: 10, color: tokens.textDim, marginLeft: 8, flexShrink: 0 }}>
            {expanded ? '\u25B2' : '\u25BC'}
          </span>
        )}
      </div>
      <div style={{
        fontFamily: tokens.fontMono,
        fontSize: 9,
        color: tokens.textDim,
        marginTop: 2,
      }}>
        {timeStr}
      </div>
      {expanded && task.response && (
        <div style={{
          marginTop: 8,
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 6,
          borderLeft: '2px solid rgba(123,92,230,0.4)',
          fontFamily: tokens.fontUI,
          fontSize: 12,
          color: tokens.textSecondary,
          lineHeight: 1.5,
          maxHeight: 200,
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
        }}>
          {task.response}
        </div>
      )}
    </div>
  )
}

function MemorySection({ agentId, agentColor }) {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!agentId) return
    setLoading(true)
    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
    fetch(`${url}/api/agent/${agentId}/memory`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMemories(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [agentId])

  const filtered = search
    ? memories.filter((m) => m.content?.toLowerCase().includes(search.toLowerCase()))
    : memories

  return (
    <div>
      <div style={{
        fontFamily: tokens.fontUI, fontSize: 10, fontWeight: 700,
        color: tokens.textDim, letterSpacing: '0.1em',
        textTransform: 'uppercase', marginBottom: 8,
      }}>
        Memory ({memories.length})
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search memory..."
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${tokens.glassBorder}`, borderRadius: 8,
          padding: '6px 10px', fontFamily: tokens.fontUI, fontSize: 11,
          color: tokens.textPrimary, outline: 'none', marginBottom: 8,
          boxSizing: 'border-box',
        }}
      />
      {loading ? (
        <div style={{ color: tokens.textDim, fontSize: 11, fontFamily: tokens.fontUI, textAlign: 'center', padding: 12 }}>
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: 16, textAlign: 'center', fontFamily: tokens.fontUI,
          fontSize: 11, color: tokens.textDim, background: 'rgba(255,255,255,0.02)',
          borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)',
        }}>
          {search ? 'No matches' : 'No memories yet'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
          {filtered.slice(-20).map((m, i) => (
            <div key={m.id || i} style={{
              padding: '6px 10px', background: 'rgba(255,255,255,0.02)',
              borderRadius: 6, borderLeft: `2px solid ${m.role === 'assistant' ? agentColor : tokens.textDim}`,
            }}>
              <div style={{
                fontFamily: tokens.fontUI, fontSize: 11, color: tokens.textSecondary,
                lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {m.content}
              </div>
              {m.created_at && (
                <div style={{
                  fontFamily: tokens.fontMono, fontSize: 8, color: tokens.textDim, marginTop: 2,
                }}>
                  {new Date(m.created_at).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AgentDetailPanel() {
  const activeAgent = useStore((s) => s.activeAgent)
  const agentDetailOpen = useStore((s) => s.agentDetailOpen)
  const toggleAgentDetail = useStore((s) => s.toggleAgentDetail)
  const enterDeskMode = useStore((s) => s.enterDeskMode)

  // Subscribe to individual agent fields — not the whole agents object
  const agentColor = useStore((s) => s.agents[activeAgent]?.color)
  const agentName = useStore((s) => s.agents[activeAgent]?.name)
  const agentRole = useStore((s) => s.agents[activeAgent]?.role)
  const agentStatus = useStore((s) => s.agents[activeAgent]?.status)
  const agentMessage = useStore((s) => s.agents[activeAgent]?.currentMessage)
  const agentTaskHistory = useStore((s) => s.agents[activeAgent]?.taskHistory)
  const toolCall = useStore((s) => s.activeToolCalls[activeAgent])
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!agentDetailOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') toggleAgentDetail()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [agentDetailOpen, toggleAgentDetail])

  if (!agentName) return null

  const tasks = agentTaskHistory ? [...agentTaskHistory].reverse().slice(0, 10) : []
  const icon = ROLE_ICONS[activeAgent] || '🤖'

  return (
    <AnimatePresence>
      {agentDetailOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggleAgentDetail}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 499,
              background: 'rgba(0,0,0,0.3)',
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: isMobile ? '100vw' : 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? '100vw' : 360, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: isMobile ? 0 : 12,
              right: isMobile ? 0 : 12,
              bottom: isMobile ? 0 : 12,
              width: isMobile ? '100vw' : 320,
              zIndex: 500,
              background: tokens.glass,
              backdropFilter: tokens.glassBlur,
              border: `1px solid ${tokens.glassBorder}`,
              borderRadius: isMobile ? 0 : tokens.radiusLarge,
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
              {/* Close button */}
              <button
                onClick={toggleAgentDetail}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tokens.textDim,
                  cursor: 'pointer',
                  fontSize: 14,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = tokens.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = tokens.textDim
                }}
              >
                ×
              </button>

              {/* Avatar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 14,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${agentColor}30, ${agentColor}10)`,
                  border: `2px solid ${agentColor}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  boxShadow: `0 0 20px ${agentColor}15`,
                }}>
                  {icon}
                </div>
                <div>
                  <div style={{
                    fontFamily: tokens.fontUI,
                    fontSize: 18,
                    fontWeight: 700,
                    color: tokens.textPrimary,
                    letterSpacing: '-0.01em',
                  }}>
                    {agentName}
                  </div>
                  <div style={{
                    fontFamily: tokens.fontUI,
                    fontSize: 12,
                    color: tokens.textSecondary,
                    marginTop: 2,
                  }}>
                    {agentRole}
                  </div>
                </div>
              </div>

              <StatusBadge status={agentStatus} />
              <div style={{
                display: 'flex', gap: 16, marginTop: 12,
              }}>
                <div style={{ fontFamily: tokens.fontMono, fontSize: 11, color: tokens.textDim }}>
                  <span style={{ color: tokens.textPrimary, fontWeight: 700 }}>{agentTaskHistory?.length || 0}</span> tasks
                </div>
                <div style={{ fontFamily: tokens.fontMono, fontSize: 11, color: tokens.textDim }}>
                  {agentStatus === 'idle' ? 'Available' : agentStatus}
                </div>
              </div>
            </div>

            {/* Content — scrollable */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}>
              {/* Current Activity */}
              {(agentMessage || toolCall) && (
                <div>
                  <div style={{
                    fontFamily: tokens.fontUI,
                    fontSize: 10,
                    fontWeight: 700,
                    color: tokens.textDim,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>
                    Current Activity
                  </div>

                  {agentMessage && (
                    <div style={{
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.05)',
                      fontFamily: tokens.fontUI,
                      fontSize: 12,
                      color: tokens.textPrimary,
                      lineHeight: 1.5,
                      maxHeight: 120,
                      overflow: 'auto',
                    }}>
                      {agentMessage}
                    </div>
                  )}

                  {toolCall && (
                    <div style={{
                      marginTop: 8,
                      padding: '8px 12px',
                      background: 'rgba(59,130,246,0.06)',
                      borderRadius: 8,
                      border: '1px solid rgba(59,130,246,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <div style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#3B82F6',
                        animation: 'pulse 1s ease-in-out infinite',
                      }} />
                      <span style={{
                        fontFamily: tokens.fontMono,
                        fontSize: 11,
                        color: '#3B82F6',
                      }}>
                        {toolCall.name || 'Processing...'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Stats */}
              <div>
                <div style={{
                  fontFamily: tokens.fontUI,
                  fontSize: 10,
                  fontWeight: 700,
                  color: tokens.textDim,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  Stats
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}>
                  <div style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.04)',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontFamily: tokens.fontMono,
                      fontSize: 20,
                      fontWeight: 700,
                      color: agentColor,
                    }}>
                      {agentTaskHistory?.length || 0}
                    </div>
                    <div style={{
                      fontFamily: tokens.fontUI,
                      fontSize: 10,
                      color: tokens.textDim,
                      marginTop: 2,
                    }}>
                      Tasks
                    </div>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.04)',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontFamily: tokens.fontMono,
                      fontSize: 20,
                      fontWeight: 700,
                      color: tokens.textPrimary,
                    }}>
                      {agentStatus === 'idle' ? '—' : '⚡'}
                    </div>
                    <div style={{
                      fontFamily: tokens.fontUI,
                      fontSize: 10,
                      color: tokens.textDim,
                      marginTop: 2,
                    }}>
                      {agentStatus === 'idle' ? 'Available' : 'Busy'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Task History */}
              <div>
                <div style={{
                  fontFamily: tokens.fontUI,
                  fontSize: 10,
                  fontWeight: 700,
                  color: tokens.textDim,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  Recent Tasks
                </div>
                {tasks.length === 0 ? (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: tokens.fontUI,
                    fontSize: 12,
                    color: tokens.textDim,
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    No tasks yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {tasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>

              {/* Memory */}
              <MemorySection agentId={activeAgent} agentColor={agentColor} />
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: `1px solid ${tokens.glassBorder}`,
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    useStore.getState().setActiveAgent(activeAgent)
                    toggleAgentDetail()
                    // Focus chat input
                    setTimeout(() => {
                      document.querySelector('input[type="text"]')?.focus()
                    }, 100)
                  }}
                  style={{
                    flex: 1,
                    background: `${agentColor}15`,
                    border: `1px solid ${agentColor}30`,
                    borderRadius: 10,
                    padding: '10px 0',
                    fontFamily: tokens.fontUI,
                    fontSize: 12,
                    fontWeight: 600,
                    color: agentColor,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${agentColor}25`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${agentColor}15`
                  }}
                >
                  Message {agentName}
                </button>
              </div>
              <button
                onClick={() => {
                  toggleAgentDetail()
                  enterDeskMode(activeAgent)
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '12px',
                  background: 'rgba(123,92,230,0.15)',
                  border: '1px solid rgba(123,92,230,0.4)',
                  borderRadius: '8px',
                  color: '#9B7CF6',
                  font: '13px Inter',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(123,92,230,0.25)'
                  e.currentTarget.style.borderColor = '#7B5CE6'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(123,92,230,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(123,92,230,0.4)'
                  e.currentTarget.style.color = '#9B7CF6'
                }}
              >
                ⌐ Enter {agentName}'s Desk
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
