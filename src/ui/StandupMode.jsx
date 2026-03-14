import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { useIsMobile } from '../hooks/useMediaQuery'

const AGENT_ORDER = [
  'kim', 'marco', 'zara', 'riley', 'dante',
  'sam', 'petra', 'lex', 'dev', 'bruno',
]

function TypewriterText({ text }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
  }, [text])

  useEffect(() => {
    if (!text) return
    if (indexRef.current >= text.length) return

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        indexRef.current++
        setDisplayed(text.slice(0, indexRef.current))
      } else {
        clearInterval(timer)
      }
    }, 15)

    return () => clearInterval(timer)
  }, [text])

  const progress = text ? (displayed.length / text.length) * 100 : 0

  return (
    <>
      <div style={{
        fontFamily: tokens.fontUI,
        fontSize: 15,
        color: tokens.textPrimary,
        lineHeight: 1.8,
      }}>
        {displayed}
        <span style={{
          opacity: displayed.length < (text?.length || 0) ? 1 : 0,
          color: tokens.accent,
          animation: 'blink 1s step-end infinite',
        }}>|</span>
      </div>
      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: 2,
        background: 'rgba(255,255,255,0.06)',
        marginTop: 16,
        borderRadius: 1,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${tokens.accent}, ${tokens.accentBright})`,
          transition: 'width 40ms linear',
          borderRadius: 1,
        }} />
      </div>
    </>
  )
}

export default function StandupMode() {
  const active = useStore((s) => s.standupActive)
  const currentAgent = useStore((s) => s.standupCurrentAgent)
  const completedAgents = useStore((s) => s.standupCompletedAgents)
  const reports = useStore((s) => s.standupReports)
  const summary = useStore((s) => s.standupSummary)
  const agents = useStore((s) => s.agents)
  const dismissStandup = useStore((s) => s.dismissStandup)

  // Escape key to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && active) {
        dismissStandup()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, dismissStandup])

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const currentAgentData = currentAgent ? agents[currentAgent] : null
  const currentReport = currentAgent ? reports[currentAgent] : null
  const streamingMessage = currentAgent ? agents[currentAgent]?.currentMessage : null
  const displayText = currentReport || streamingMessage || ''

  const isMobile = useIsMobile()
  const agentCount = Object.keys(agents).length
  const completedCount = completedAgents.length

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 700,
            background: 'rgba(4, 4, 12, 0.95)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Top bar */}
          <div
            style={{
              height: isMobile ? 48 : 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '0 12px' : '0 32px',
              borderBottom: `1px solid rgba(255,255,255,0.06)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: tokens.accent,
                animation: 'pulse 2s ease-in-out infinite',
                boxShadow: `0 0 10px ${tokens.accent}`,
              }} />
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: tokens.textPrimary,
                fontFamily: tokens.fontUI,
                letterSpacing: '0.04em',
              }}>
                Daily Standup
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              fontSize: 12,
              color: tokens.textDim,
              fontFamily: tokens.fontUI,
            }}>
              <span>{dateStr}</span>
              <span style={{
                background: 'rgba(255,255,255,0.04)',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                color: tokens.textSecondary,
              }}>
                {completedCount}/{agentCount}
              </span>
              <button
                onClick={dismissStandup}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontFamily: tokens.fontMono,
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'all 150ms linear',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                }}
              >
                {'\u2715'} CLOSE
              </button>
            </div>
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: 1, minHeight: 0 }}>
            {/* Left — Agent roster */}
            <div style={{
              width: isMobile ? '100%' : 280,
              ...(isMobile ? { borderBottom: '1px solid rgba(255,255,255,0.06)', maxHeight: 120, flexShrink: 0 } : {}),
              borderRight: isMobile ? 'none' : `1px solid rgba(255,255,255,0.06)`,
              overflowY: 'auto',
              padding: '8px 0',
            }}>
              {AGENT_ORDER.map((id) => {
                const agent = agents[id]
                const isCompleted = completedAgents.includes(id)
                const isCurrent = currentAgent === id

                return (
                  <motion.div
                    key={id}
                    animate={{
                      background: isCurrent ? 'rgba(123,92,230,0.08)' : 'transparent',
                    }}
                    style={{
                      height: 44,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 20px',
                      borderLeft: isCurrent ? `2px solid ${agent.color}` : '2px solid transparent',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {/* Agent dot */}
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: agent.color,
                      marginRight: 12,
                      flexShrink: 0,
                      opacity: isCurrent ? 1 : 0.5,
                      boxShadow: isCurrent ? `0 0 8px ${agent.color}` : 'none',
                      transition: 'opacity 0.2s',
                    }} />

                    {/* Name */}
                    <span style={{
                      fontFamily: tokens.fontUI,
                      fontWeight: 600,
                      fontSize: 13,
                      color: isCurrent ? tokens.textPrimary : tokens.textSecondary,
                      width: 70,
                      flexShrink: 0,
                    }}>
                      {agent.name}
                    </span>

                    {/* Role */}
                    <span style={{
                      fontFamily: tokens.fontUI,
                      fontSize: 11,
                      color: tokens.textDim,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {agent.role}
                    </span>

                    {/* Status */}
                    <span style={{
                      fontSize: 11,
                      fontFamily: tokens.fontUI,
                      fontWeight: 600,
                      color: isCurrent ? tokens.green : isCompleted ? tokens.green : tokens.textDim,
                      flexShrink: 0,
                    }}>
                      {isCurrent ? (
                        <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                          {[1,2,3].map(i => (
                            <span key={i} style={{
                              display: 'inline-block',
                              width: 2,
                              height: 6,
                              background: tokens.green,
                              borderRadius: 1,
                              animation: `audio-bar-${i} 0.8s ease-in-out ${i * 0.1}s infinite`,
                            }} />
                          ))}
                        </span>
                      ) : isCompleted ? '\u2713' : ''}
                    </span>
                  </motion.div>
                )
              })}
            </div>

            {/* Right — Speech area */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: isMobile ? 16 : 32,
              overflow: 'auto',
            }}>
              {/* Current speaker */}
              {currentAgentData && (
                <motion.div
                  key={currentAgent}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ marginBottom: 32 }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 20,
                  }}>
                    <div style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: currentAgentData.color,
                      boxShadow: `0 0 12px ${currentAgentData.color}`,
                    }} />
                    <span style={{
                      color: currentAgentData.color,
                      fontWeight: 700,
                      fontSize: 22,
                      fontFamily: tokens.fontUI,
                    }}>
                      {currentAgentData.name}
                    </span>
                    <span style={{
                      color: tokens.textDim,
                      fontSize: 14,
                      fontFamily: tokens.fontUI,
                    }}>
                      {currentAgentData.role}
                    </span>
                  </div>

                  <TypewriterText text={displayText} />
                </motion.div>
              )}

              {/* Previous reports (faded) */}
              {completedAgents
                .filter((id) => id !== currentAgent)
                .reverse()
                .slice(0, 2)
                .map((id) => {
                  const agent = agents[id]
                  return (
                    <motion.div
                      key={`done-${id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        borderLeft: `2px solid ${agent.color}`,
                        borderRadius: `0 ${tokens.radiusSmall} ${tokens.radiusSmall} 0`,
                        padding: '12px 16px',
                        marginBottom: 8,
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: agent.color,
                        }} />
                        <span style={{
                          color: agent.color,
                          fontWeight: 600,
                          fontSize: 12,
                          fontFamily: tokens.fontUI,
                        }}>
                          {agent.name}
                        </span>
                      </div>
                      <div style={{
                        color: tokens.textSecondary,
                        fontSize: 13,
                        lineHeight: 1.6,
                        fontFamily: tokens.fontUI,
                      }}>
                        {reports[id]}
                      </div>
                    </motion.div>
                  )
                })}
            </div>
          </div>

          {/* Bruno's synthesis */}
          <AnimatePresence>
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                style={{ padding: '0 32px 32px' }}
              >
                <div
                  style={{
                    background: 'rgba(255,69,58,0.06)',
                    border: `1px solid rgba(255,69,58,0.2)`,
                    borderRadius: tokens.radius,
                    padding: '20px 24px',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 12,
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: tokens.red,
                    }} />
                    <span style={{
                      fontFamily: tokens.fontUI,
                      fontWeight: 700,
                      fontSize: 12,
                      color: tokens.red,
                      letterSpacing: '0.06em',
                    }}>
                      Founder Synthesis
                    </span>
                  </div>
                  <div style={{
                    fontFamily: tokens.fontUI,
                    color: tokens.textPrimary,
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}>
                    {summary}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
