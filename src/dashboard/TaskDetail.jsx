import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { assignTaskToAgent } from '../socket/client'

const STATUS_BADGE = {
  in_progress: { label: 'In Progress', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  done:        { label: 'Done',        color: tokens.green, bg: 'rgba(48,209,88,0.12)' },
  failed:      { label: 'Failed',      color: tokens.red, bg: 'rgba(255,69,58,0.12)' },
  pending:     { label: 'Pending',     color: tokens.textDim, bg: 'rgba(255,255,255,0.04)' },
  backlog:     { label: 'Backlog',     color: tokens.textDim, bg: 'rgba(255,255,255,0.04)' },
}

function formatTimestamp(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleString('en-GB', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDuration(startTs, endTs) {
  if (!startTs || !endTs) return null
  const ms = new Date(endTs).getTime() - new Date(startTs).getTime()
  if (ms < 0) return null
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds}s`
}

export default function TaskDetail() {
  const selectedTask = useStore((s) => s.selectedTask)
  const agents = useStore((s) => s.agents)
  const streamingTokens = useStore((s) => s.streamingTokens)
  const clearSelectedTask = useStore((s) => s.clearSelectedTask)
  const [followUp, setFollowUp] = useState('')
  const conversationRef = useRef(null)

  const agent = selectedTask ? agents[selectedTask.assigned_to] : null
  const agentColor = agent?.color || tokens.textDim
  const agentName = agent?.name || selectedTask?.assigned_to || 'Agent'
  const streaming = selectedTask ? streamingTokens[selectedTask.assigned_to] : ''

  // Escape key to close
  useEffect(() => {
    if (!selectedTask) return
    const handler = (e) => {
      if (e.key === 'Escape') clearSelectedTask()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedTask, clearSelectedTask])

  // Auto-scroll conversation when streaming
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [streaming, selectedTask?.result])

  const handleFollowUp = () => {
    if (!followUp.trim() || !selectedTask?.assigned_to) return
    assignTaskToAgent(selectedTask.assigned_to, followUp.trim())
    useStore.getState().assignTask(selectedTask.assigned_to, followUp.trim())
    setFollowUp('')
    clearSelectedTask()
  }

  const badge = selectedTask ? (STATUS_BADGE[selectedTask.status] || STATUS_BADGE.pending) : STATUS_BADGE.pending
  const taskTitle = selectedTask?.title || selectedTask?.text || selectedTask?.description || 'Untitled task'
  const duration = selectedTask ? formatDuration(selectedTask.created_at, selectedTask.completed_at) : null
  const isInProgress = selectedTask?.status === 'in_progress'

  return (
    <AnimatePresence>
      {selectedTask && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={clearSelectedTask}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1100,
              background: 'rgba(0,0,0,0.35)',
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 480,
              zIndex: 1200,
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
            {/* ─── Header ─────────────────────────── */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: `1px solid ${tokens.glassBorder}`,
              position: 'relative',
            }}>
              {/* Close button */}
              <button
                onClick={clearSelectedTask}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
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
                &times;
              </button>

              {/* Agent dot + name */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
              }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: agentColor,
                  boxShadow: `0 0 8px ${agentColor}60`,
                }} />
                <span style={{
                  fontFamily: tokens.fontUI,
                  fontSize: 12,
                  fontWeight: 600,
                  color: agentColor,
                }}>
                  {agentName}
                </span>
              </div>

              {/* Task title */}
              <div style={{
                fontFamily: tokens.fontUI,
                fontSize: 16,
                fontWeight: 700,
                color: tokens.textPrimary,
                lineHeight: 1.4,
                marginBottom: 12,
                paddingRight: 36,
              }}>
                {taskTitle}
              </div>

              {/* Status badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                background: badge.bg,
                border: `1px solid ${badge.color}22`,
                marginBottom: 10,
              }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: badge.color,
                  boxShadow: `0 0 6px ${badge.color}`,
                }} />
                <span style={{
                  fontFamily: tokens.fontUI,
                  fontSize: 11,
                  fontWeight: 600,
                  color: badge.color,
                  letterSpacing: '0.04em',
                }}>
                  {badge.label}
                </span>
              </div>

              {/* Timestamps */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}>
                <div style={{
                  fontFamily: tokens.fontMono,
                  fontSize: 10,
                  color: tokens.textDim,
                }}>
                  Created: {formatTimestamp(selectedTask.created_at)}
                </div>
                {selectedTask.completed_at && (
                  <div style={{
                    fontFamily: tokens.fontMono,
                    fontSize: 10,
                    color: tokens.textDim,
                  }}>
                    Completed: {formatTimestamp(selectedTask.completed_at)}
                  </div>
                )}
                {duration && (
                  <div style={{
                    fontFamily: tokens.fontMono,
                    fontSize: 10,
                    color: tokens.textSecondary,
                  }}>
                    Took: {duration}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Conversation ────────────────────── */}
            <div
              ref={conversationRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* "You" block — the task description */}
              <div>
                <div style={{
                  fontFamily: tokens.fontUI,
                  fontSize: 10,
                  fontWeight: 700,
                  color: tokens.textDim,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}>
                  You
                </div>
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.06)',
                  fontFamily: tokens.fontUI,
                  fontSize: 13,
                  color: tokens.textSecondary,
                  lineHeight: 1.5,
                }}>
                  {taskTitle}
                </div>
              </div>

              {/* "Agent" block — result or streaming */}
              <div>
                <div style={{
                  fontFamily: tokens.fontUI,
                  fontSize: 10,
                  fontWeight: 700,
                  color: agentColor,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}>
                  {agentName}
                </div>
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 10,
                  border: `1px solid ${agentColor}15`,
                  borderLeft: `3px solid ${agentColor}40`,
                  fontFamily: tokens.fontUI,
                  fontSize: 13,
                  color: tokens.textPrimary,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  minHeight: 40,
                }}>
                  {selectedTask.result ? (
                    selectedTask.result
                  ) : isInProgress && streaming ? (
                    <>
                      {streaming}
                      <span style={{
                        display: 'inline-block',
                        width: 2,
                        height: 14,
                        background: agentColor,
                        marginLeft: 2,
                        verticalAlign: 'text-bottom',
                        animation: 'taskDetailCursorBlink 1s step-end infinite',
                      }} />
                    </>
                  ) : isInProgress ? (
                    <span style={{
                      color: tokens.textDim,
                      fontStyle: 'italic',
                    }}>
                      Waiting for response...
                      <span style={{
                        display: 'inline-block',
                        width: 2,
                        height: 14,
                        background: agentColor,
                        marginLeft: 4,
                        verticalAlign: 'text-bottom',
                        animation: 'taskDetailCursorBlink 1s step-end infinite',
                      }} />
                    </span>
                  ) : (
                    <span style={{
                      color: tokens.textDim,
                      fontStyle: 'italic',
                    }}>
                      No response yet
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Follow-up input ─────────────────── */}
            <div style={{
              padding: '12px 20px',
              borderTop: `1px solid ${tokens.glassBorder}`,
              display: 'flex',
              gap: 8,
            }}>
              <input
                type="text"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFollowUp()
                }}
                placeholder={`Ask ${agentName} to follow up...`}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${tokens.glassBorder}`,
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontFamily: tokens.fontUI,
                  fontSize: 12,
                  color: tokens.textPrimary,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = `${agentColor}50`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = tokens.glassBorder
                }}
              />
              <button
                onClick={handleFollowUp}
                disabled={!followUp.trim()}
                style={{
                  background: followUp.trim() ? `${agentColor}20` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${followUp.trim() ? `${agentColor}40` : tokens.glassBorder}`,
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontFamily: tokens.fontUI,
                  fontSize: 12,
                  fontWeight: 600,
                  color: followUp.trim() ? agentColor : tokens.textDim,
                  cursor: followUp.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              >
                Send
              </button>
            </div>

            {/* Keyframes */}
            <style>{`
              @keyframes taskDetailCursorBlink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
              }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
