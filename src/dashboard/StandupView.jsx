import { useEffect, useState, useCallback, useMemo } from 'react'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// Group reports into standup sessions (reports within 10 min of each other)
function groupIntoSessions(reports) {
  if (!reports || reports.length === 0) return []
  const sorted = [...reports].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  const sessions = []
  let currentSession = { time: sorted[0].created_at, reports: [sorted[0]] }

  for (let i = 1; i < sorted.length; i++) {
    const gap = new Date(sorted[i].created_at) - new Date(currentSession.reports[currentSession.reports.length - 1].created_at)
    if (gap < 10 * 60 * 1000) { // 10 minutes
      currentSession.reports.push(sorted[i])
    } else {
      sessions.push(currentSession)
      currentSession = { time: sorted[i].created_at, reports: [sorted[i]] }
    }
  }
  sessions.push(currentSession)
  return sessions
}

function ReportCard({ report, agents }) {
  const agent = agents[report.agent_id]
  return (
    <div
      style={{
        background: tokens.glass,
        backdropFilter: tokens.glassBlur,
        border: `1px solid ${tokens.glassBorder}`,
        borderLeft: `3px solid ${agent?.color || tokens.textDim}`,
        borderRadius: `0 8px 8px 0`,
        padding: '14px 18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: tokens.fontUI, fontWeight: 600, fontSize: 13, color: agent?.color || tokens.textSecondary }}>
          {agent?.name || report.agent_id}
          <span style={{ fontWeight: 400, fontSize: 11, color: tokens.textDim, marginLeft: 8 }}>
            {agent?.role || ''}
          </span>
        </span>
        <span style={{ fontFamily: tokens.fontMono, fontSize: 10, color: tokens.textDim }}>
          {formatTime(report.created_at)}
        </span>
      </div>
      <div style={{ fontFamily: tokens.fontUI, fontSize: 13, lineHeight: 1.6, color: tokens.textPrimary, whiteSpace: 'pre-wrap' }}>
        {report.report}
      </div>
    </div>
  )
}

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
          if (data.length > 0 && !selectedDate) setSelectedDate(data[0].date)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedDate])

  useEffect(() => { fetchHistory() }, []) // eslint-disable-line

  const handleRunStandup = async () => {
    setRunning(true)
    try {
      await fetch(`${SOCKET_URL}/api/standup/run`, { method: 'POST' })
      setTimeout(() => { fetchHistory(); setRunning(false) }, 2000)
    } catch { setRunning(false) }
  }

  const selected = history.find((h) => h.date === selectedDate)
  const sessions = useMemo(() => groupIntoSessions(selected?.reports), [selected])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: tokens.void }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px', borderBottom: `1px solid rgba(255,255,255,0.06)`, flexShrink: 0,
      }}>
        {history.length > 0 && (
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${tokens.glassBorder}`,
              borderRadius: 6, padding: '7px 12px', color: tokens.textPrimary,
              fontSize: 13, fontFamily: tokens.fontUI, outline: 'none', cursor: 'pointer', minWidth: 220,
            }}
          >
            {history.map((h) => (
              <option key={h.date} value={h.date} style={{ background: '#12121e' }}>
                {formatDate(h.date)}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={handleRunStandup}
          disabled={running}
          style={{
            background: running ? tokens.accentDim : tokens.accent,
            border: 'none', borderRadius: 6, padding: '8px 18px',
            fontFamily: tokens.fontUI, fontSize: 13, fontWeight: 600,
            color: '#fff', cursor: running ? 'not-allowed' : 'pointer',
            opacity: running ? 0.7 : 1, flexShrink: 0,
          }}
        >
          {running ? 'Running...' : 'Run Standup'}
        </button>
        {selected && (
          <span style={{ marginLeft: 'auto', fontFamily: tokens.fontMono, fontSize: 11, color: tokens.textDim }}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} / {selected.reports?.length || 0} reports
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, fontFamily: tokens.fontUI, fontSize: 14, color: tokens.textDim }}>
            Loading...
          </div>
        )}

        {!loading && history.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
            <div style={{ fontFamily: tokens.fontUI, fontSize: 16, color: tokens.textSecondary }}>
              No standups recorded yet.
            </div>
            <div style={{ fontFamily: tokens.fontUI, fontSize: 13, color: tokens.textDim }}>
              Press S or click Run Standup.
            </div>
          </div>
        )}

        {!loading && sessions.map((session, si) => (
          <div key={si} style={{ marginBottom: 28, maxWidth: 800 }}>
            {/* Session header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: tokens.accent, boxShadow: `0 0 6px ${tokens.accent}`,
              }} />
              <span style={{ fontFamily: tokens.fontUI, fontSize: 13, fontWeight: 600, color: tokens.textPrimary }}>
                Standup at {formatTime(session.time)}
              </span>
              <span style={{ fontFamily: tokens.fontMono, fontSize: 10, color: tokens.textDim }}>
                {session.reports.length} reports
              </span>
            </div>

            {/* Reports in this session */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 18 }}>
              {session.reports.filter(r => r.agent_id !== 'bruno').map((r) => (
                <ReportCard key={r.id || r.agent_id + si} report={r} agents={agents} />
              ))}

              {/* Bruno's report */}
              {session.reports.filter(r => r.agent_id === 'bruno').map((r) => (
                <ReportCard key={'bruno-' + si} report={r} agents={agents} />
              ))}
            </div>

            {/* Synthesis for this date (only on last session) */}
            {si === sessions.length - 1 && selected?.summary && (
              <div style={{
                marginTop: 14, marginLeft: 18, padding: '16px 20px',
                background: 'rgba(255,0,64,0.04)', border: '1px solid rgba(255,0,64,0.15)',
                borderRadius: 8,
              }}>
                <div style={{
                  fontFamily: tokens.fontMono, fontWeight: 600, fontSize: 10,
                  letterSpacing: '0.1em', color: '#FF0040', marginBottom: 8, textTransform: 'uppercase',
                }}>
                  SYNTHESIS
                </div>
                <div style={{ fontFamily: tokens.fontUI, fontSize: 13, lineHeight: 1.6, color: tokens.textPrimary, whiteSpace: 'pre-wrap' }}>
                  {selected.summary}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
