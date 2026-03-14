import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { useIsMobile } from '../hooks/useMediaQuery'

const ACTION_LABELS = {
  task_received: 'received task',
  tool_called: 'called',
  delegated: 'delegated \u2192',
  completed: 'completed',
  message_sent: 'sent message',
  standup: 'standup report',
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function StandupHistory({ agents: agentData }) {
  const [history, setHistory] = useState([])
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
    fetch(`${url}/api/standup/history`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data)
          if (data.length > 0) setSelectedDate(data[0].date)
        }
      })
      .catch(() => {})
  }, [])

  const selected = history.find((h) => h.date === selectedDate)

  return (
    <div style={{ padding: '12px 16px', fontSize: 11 }}>
      {history.length === 0 ? (
        <div style={{ color: tokens.textDim, textAlign: 'center', marginTop: 40, fontFamily: tokens.fontUI, fontSize: 12 }}>
          No standups recorded
        </div>
      ) : (
        <>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${tokens.glassBorder}`,
              borderRadius: tokens.radiusSmall,
              padding: '8px 10px',
              color: tokens.textSecondary,
              fontSize: 11,
              fontFamily: tokens.fontUI,
              outline: 'none',
              marginBottom: 12,
            }}
          >
            {history.map((h) => (
              <option key={h.date} value={h.date}>
                {new Date(h.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                })}
              </option>
            ))}
          </select>

          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selected.reports.map((r) => {
                const agent = agentData[r.agent_id]
                return (
                  <div
                    key={r.id}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      borderLeft: `2px solid ${agent?.color || tokens.textDim}`,
                      borderRadius: `0 ${tokens.radiusSmall} ${tokens.radiusSmall} 0`,
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{
                      fontFamily: tokens.fontUI,
                      fontWeight: 600,
                      fontSize: 11,
                      color: agent?.color || tokens.textSecondary,
                      marginBottom: 4,
                    }}>
                      {agent?.name || r.agent_id}
                    </div>
                    <div style={{
                      color: tokens.textSecondary,
                      fontSize: 12,
                      lineHeight: 1.5,
                      fontFamily: tokens.fontUI,
                    }}>
                      {r.report}
                    </div>
                  </div>
                )
              })}

              {selected.summary && (
                <div
                  style={{
                    background: 'rgba(255,69,58,0.06)',
                    border: '1px solid rgba(255,69,58,0.2)',
                    borderRadius: tokens.radiusSmall,
                    padding: '12px 14px',
                    marginTop: 4,
                  }}
                >
                  <div style={{
                    fontFamily: tokens.fontMono,
                    fontWeight: 600,
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    color: tokens.red,
                    marginBottom: 6,
                  }}>
                    SYNTHESIS
                  </div>
                  <div style={{
                    color: tokens.textPrimary,
                    fontSize: 12,
                    lineHeight: 1.6,
                    fontFamily: tokens.fontUI,
                  }}>
                    {selected.summary}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const FILTER_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'task_received', label: 'Tasks' },
  { key: 'completed', label: 'Done' },
  { key: 'tool_called', label: 'Tools' },
  { key: 'delegated', label: 'Delegated' },
]

export default function ActivityFeed() {
  const activities = useStore((s) => s.activities)
  const isOpen = useStore((s) => s.activityFeedOpen)
  const toggle = useStore((s) => s.toggleActivityFeed)
  const agents = useStore((s) => s.agents)
  const setActivities = useStore((s) => s.setActivities)
  const scrollRef = useRef(null)
  const [tab, setTab] = useState('live')
  const [filter, setFilter] = useState('all')
  const userScrolledRef = useRef(false)
  const isMobile = useIsMobile()
  const panelW = isMobile ? '100vw' : 280

  // Smart auto-scroll: only scroll if user is near bottom
  useEffect(() => {
    const el = scrollRef.current
    if (!el || userScrolledRef.current) return
    el.scrollTop = el.scrollHeight
  }, [activities])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    userScrolledRef.current = !nearBottom
  }

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter((a) => a.action_type === filter)

  return (
    <>
      {/* Toggle tab — vertical ACTIVITY text */}
      {!isOpen && (
        <button
          onClick={toggle}
          style={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 100,
            width: 32,
            background: 'rgba(10,10,24,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRight: 'none',
            borderRadius: '8px 0 0 8px',
            padding: '12px 8px',
            writingMode: 'vertical-rl',
            fontFamily: tokens.fontMono,
            fontWeight: 600,
            fontSize: 10,
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = tokens.textPrimary
            e.currentTarget.style.borderColor = tokens.accent
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
          }}
        >
          ACTIVITY
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: isMobile ? '100vw' : 280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? '100vw' : 280, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              right: 0,
              top: isMobile ? 0 : 60,
              bottom: isMobile ? 0 : 100,
              width: panelW,
              zIndex: 100,
              background: tokens.glass,
              backdropFilter: tokens.glassBlur,
              border: `1px solid ${tokens.glassBorder}`,
              borderRight: 'none',
              borderRadius: isMobile ? 0 : '12px 0 0 12px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: tokens.glassShadow,
            }}
          >
            {/* Header with tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {[
                { key: 'live', label: 'Activity' },
                { key: 'standups', label: 'Standups' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: tab === t.key ? `2px solid ${tokens.accent}` : '2px solid transparent',
                    color: tab === t.key ? tokens.textPrimary : tokens.textDim,
                    fontFamily: tokens.fontUI,
                    fontWeight: 600,
                    fontSize: 12,
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                    flex: 1,
                  }}
                >
                  {t.label}
                </button>
              ))}
              <button
                onClick={toggle}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: tokens.textDim,
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: '0 12px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = tokens.textPrimary }}
                onMouseLeave={(e) => { e.currentTarget.style.color = tokens.textDim }}
              >
                {'\u2715'}
              </button>
            </div>

            {/* Content */}
            {tab === 'standups' ? (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <StandupHistory agents={agents} />
              </div>
            ) : (
              <>
              {/* Filter bar */}
              <div style={{
                display: 'flex', gap: 4, padding: '8px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                overflowX: 'auto', scrollbarWidth: 'none',
              }}>
                {FILTER_TYPES.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    style={{
                      background: filter === f.key ? 'rgba(123,92,230,0.15)' : 'transparent',
                      border: filter === f.key ? `1px solid ${tokens.accentDim}` : '1px solid transparent',
                      borderRadius: 12,
                      padding: '2px 10px',
                      fontFamily: tokens.fontMono, fontSize: 9,
                      color: filter === f.key ? tokens.accent : tokens.textDim,
                      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
                {activities.length > 0 && (
                  <button
                    onClick={() => setActivities([])}
                    style={{
                      background: 'transparent', border: 'none',
                      marginLeft: 'auto', padding: '2px 8px',
                      fontFamily: tokens.fontMono, fontSize: 9,
                      color: tokens.textDim, cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div
                ref={scrollRef}
                onScroll={handleScroll}
                style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}
              >
                {filteredActivities.length === 0 && (
                  <div style={{
                    color: tokens.textDim,
                    fontSize: 12,
                    textAlign: 'center',
                    marginTop: 40,
                    fontFamily: tokens.fontUI,
                  }}>
                    No activity yet
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {filteredActivities.map((activity) => {
                    const agent = agents[activity.agent_id]
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 16px',
                          cursor: 'default',
                          transition: 'background 0.15s',
                          borderRadius: 4,
                          margin: '0 4px',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: agent?.color || '#666',
                          flexShrink: 0,
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            fontSize: 12,
                            fontFamily: tokens.fontUI,
                            fontWeight: 600,
                            color: agent?.color || tokens.textSecondary,
                          }}>
                            {agent?.name || activity.agent_id}
                          </span>
                          <span style={{
                            fontSize: 12,
                            fontFamily: tokens.fontUI,
                            color: tokens.textSecondary,
                            marginLeft: 6,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {activity.description || ACTION_LABELS[activity.action_type] || activity.action_type}
                          </span>
                        </div>
                        <span style={{
                          fontSize: 10,
                          color: tokens.textDim,
                          fontFamily: tokens.fontMono,
                          flexShrink: 0,
                        }}>
                          {formatTime(activity.created_at)}
                        </span>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
