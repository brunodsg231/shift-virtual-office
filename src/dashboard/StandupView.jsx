import { useEffect, useState, useCallback } from 'react'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export default function StandupView() {
  const agents = useStore((s) => s.agents)
  const [history, setHistory] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  const fetchHistory = useCallback(() => {
    setLoading(true)
    fetch(`${SOCKET_URL}/api/standup/history`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data)
          if (data.length > 0 && !selectedDate) {
            setSelectedDate(data[0].date)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedDate])

  useEffect(() => {
    fetchHistory()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRunStandup = async () => {
    setRunning(true)
    try {
      await fetch(`${SOCKET_URL}/api/standup/run`, { method: 'POST' })
      // Re-fetch history after a brief delay to allow the standup to complete
      setTimeout(() => {
        fetchHistory()
        setRunning(false)
      }, 2000)
    } catch {
      setRunning(false)
    }
  }

  const selected = history.find((h) => h.date === selectedDate)

  // Separate Bruno's synthesis from agent reports
  const agentReports = selected?.reports?.filter((r) => r.agent_id !== 'bruno') || []
  const brunoReport = selected?.reports?.find((r) => r.agent_id === 'bruno')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: tokens.void,
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          borderBottom: `1px solid ${tokens.border}`,
          flexShrink: 0,
        }}
      >
        {/* Date selector */}
        {history.length > 0 && (
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${tokens.glassBorder}`,
              borderRadius: tokens.radiusSmall,
              padding: '7px 12px',
              color: tokens.textPrimary,
              fontSize: 13,
              fontFamily: tokens.fontUI,
              outline: 'none',
              cursor: 'pointer',
              minWidth: 180,
            }}
          >
            {history.map((h) => (
              <option
                key={h.date}
                value={h.date}
                style={{ background: tokens.surface2, color: tokens.textPrimary }}
              >
                {new Date(h.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </option>
            ))}
          </select>
        )}

        {/* Run Standup button */}
        <button
          onClick={handleRunStandup}
          disabled={running}
          style={{
            marginLeft: history.length > 0 ? 0 : 0,
            background: running ? tokens.accentDim : tokens.accent,
            border: 'none',
            borderRadius: tokens.radiusSmall,
            padding: '8px 18px',
            fontFamily: tokens.fontUI,
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            cursor: running ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            opacity: running ? 0.7 : 1,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!running) e.currentTarget.style.background = tokens.accentBright
          }}
          onMouseLeave={(e) => {
            if (!running) e.currentTarget.style.background = tokens.accent
          }}
        >
          {running ? 'Running...' : 'Run Standup'}
        </button>

        {selected && (
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: tokens.fontMono,
              fontSize: 11,
              color: tokens.textDim,
            }}
          >
            {(selected.reports?.length || 0)} reports
          </span>
        )}
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
        }}
      >
        {/* Loading state */}
        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 200,
              fontFamily: tokens.fontUI,
              fontSize: 14,
              color: tokens.textDim,
            }}
          >
            Loading...
          </div>
        )}

        {/* Empty state */}
        {!loading && history.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 300,
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: tokens.fontUI,
                fontSize: 16,
                color: tokens.textSecondary,
              }}
            >
              No standups recorded yet.
            </div>
            <div
              style={{
                fontFamily: tokens.fontUI,
                fontSize: 13,
                color: tokens.textDim,
              }}
            >
              Press S or click Run Standup.
            </div>
          </div>
        )}

        {/* Reports */}
        {!loading && selected && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxWidth: 800,
            }}
          >
            {/* Agent report cards */}
            {agentReports.map((r) => {
              const agent = agents[r.agent_id]
              return (
                <div
                  key={r.id || r.agent_id}
                  style={{
                    background: tokens.glass,
                    backdropFilter: tokens.glassBlur,
                    border: `1px solid ${tokens.glassBorder}`,
                    borderLeft: `3px solid ${agent?.color || tokens.textDim}`,
                    borderRadius: `0 ${tokens.radius} ${tokens.radius} 0`,
                    padding: '16px 20px',
                    boxShadow: tokens.glassShadow,
                  }}
                >
                  {/* Agent name + timestamp */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: tokens.fontUI,
                        fontWeight: 600,
                        fontSize: 14,
                        color: agent?.color || tokens.textSecondary,
                      }}
                    >
                      {agent?.name || r.agent_id}
                      <span
                        style={{
                          fontWeight: 400,
                          fontSize: 12,
                          color: tokens.textDim,
                          marginLeft: 8,
                        }}
                      >
                        {agent?.role || ''}
                      </span>
                    </span>
                    {r.created_at && (
                      <span
                        style={{
                          fontFamily: tokens.fontMono,
                          fontSize: 11,
                          color: tokens.textDim,
                        }}
                      >
                        {new Date(r.created_at).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  {/* Report text */}
                  <div
                    style={{
                      fontFamily: tokens.fontUI,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: tokens.textPrimary,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {r.report}
                  </div>
                </div>
              )
            })}

            {/* Bruno's report (if exists in reports list) */}
            {brunoReport && (
              <div
                key="bruno-report"
                style={{
                  background: tokens.glass,
                  backdropFilter: tokens.glassBlur,
                  border: `1px solid ${tokens.glassBorder}`,
                  borderLeft: `3px solid ${agents.bruno?.color || tokens.red}`,
                  borderRadius: `0 ${tokens.radius} ${tokens.radius} 0`,
                  padding: '16px 20px',
                  boxShadow: tokens.glassShadow,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: tokens.fontUI,
                      fontWeight: 600,
                      fontSize: 14,
                      color: agents.bruno?.color || tokens.red,
                    }}
                  >
                    Bruno
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: 12,
                        color: tokens.textDim,
                        marginLeft: 8,
                      }}
                    >
                      Founder
                    </span>
                  </span>
                  {brunoReport.created_at && (
                    <span
                      style={{
                        fontFamily: tokens.fontMono,
                        fontSize: 11,
                        color: tokens.textDim,
                      }}
                    >
                      {new Date(brunoReport.created_at).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: tokens.fontUI,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: tokens.textPrimary,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {brunoReport.report}
                </div>
              </div>
            )}

            {/* Synthesis card */}
            {selected.summary && (
              <div
                style={{
                  background: 'rgba(255,69,58,0.05)',
                  backdropFilter: tokens.glassBlur,
                  border: `1px solid rgba(255,69,58,0.2)`,
                  borderRadius: tokens.radius,
                  padding: '18px 22px',
                  boxShadow: tokens.glassShadow,
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    fontFamily: tokens.fontMono,
                    fontWeight: 600,
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    color: tokens.red,
                    marginBottom: 10,
                    textTransform: 'uppercase',
                  }}
                >
                  SYNTHESIS
                </div>
                <div
                  style={{
                    fontFamily: tokens.fontUI,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: tokens.textPrimary,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selected.summary}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
