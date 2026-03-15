import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown date'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function groupIntoSessions(reports) {
  if (!reports || reports.length === 0) return []
  const sorted = [...reports].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  const sessions = []
  let cur = { time: sorted[0].created_at, reports: [sorted[0]] }
  for (let i = 1; i < sorted.length; i++) {
    const gap = new Date(sorted[i].created_at) - new Date(cur.reports[cur.reports.length - 1].created_at)
    if (gap < 10 * 60 * 1000) {
      cur.reports.push(sorted[i])
    } else {
      sessions.push(cur)
      cur = { time: sorted[i].created_at, reports: [sorted[i]] }
    }
  }
  sessions.push(cur)
  return sessions
}

function ReportRow({ report, agents }) {
  const [open, setOpen] = useState(false)
  const agent = agents[report.agent_id]
  const color = agent?.color || tokens.textDim

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid rgba(255,255,255,0.04)`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '0 8px 8px 0',
      overflow: 'hidden',
    }}>
      {/* Clickable header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 10, color: tokens.textDim, transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          &#9654;
        </span>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0,
        }} />
        <span style={{ fontFamily: tokens.fontUI, fontSize: 13, fontWeight: 600, color, flex: 1 }}>
          {agent?.name || report.agent_id}
        </span>
        <span style={{ fontFamily: tokens.fontMono, fontSize: 10, color: tokens.textDim }}>
          {agent?.role || ''}
        </span>
        <span style={{ fontFamily: tokens.fontMono, fontSize: 10, color: tokens.textDim, flexShrink: 0 }}>
          {formatTime(report.created_at)}
        </span>
      </button>

      {/* Expandable report */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 14px 12px 32px',
              fontFamily: tokens.fontUI, fontSize: 13, lineHeight: 1.6,
              color: tokens.textPrimary, whiteSpace: 'pre-wrap',
            }}>
              {report.report}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SessionBlock({ session, agents, summary, isLast, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const agentReports = session.reports.filter(r => r.agent_id !== 'bruno')
  const brunoReport = session.reports.find(r => r.agent_id === 'bruno')

  return (
    <div style={{ marginBottom: 16, maxWidth: 800 }}>
      {/* Session header — clickable */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 0', background: 'transparent', border: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 12, color: tokens.textDim, transition: 'transform 0.2s',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>
          &#9654;
        </span>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: tokens.accent, boxShadow: `0 0 6px ${tokens.accent}`,
        }} />
        <span style={{ fontFamily: tokens.fontUI, fontSize: 13, fontWeight: 600, color: tokens.textPrimary }}>
          Standup — {new Date(session.time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {formatTime(session.time)}
        </span>
        <span style={{ fontFamily: tokens.fontMono, fontSize: 10, color: tokens.textDim }}>
          {session.reports.length} reports
        </span>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0 0 18px' }}>
              {agentReports.map((r) => (
                <ReportRow key={r.id || r.agent_id} report={r} agents={agents} />
              ))}
              {brunoReport && (
                <ReportRow key="bruno" report={brunoReport} agents={agents} />
              )}

              {isLast && summary && (
                <div style={{
                  marginTop: 8, padding: '14px 18px',
                  background: 'rgba(255,0,64,0.04)', border: '1px solid rgba(255,0,64,0.15)',
                  borderRadius: 8,
                }}>
                  <div style={{
                    fontFamily: tokens.fontMono, fontWeight: 600, fontSize: 10,
                    letterSpacing: '0.1em', color: '#FF0040', marginBottom: 6, textTransform: 'uppercase',
                  }}>
                    SYNTHESIS
                  </div>
                  <div style={{ fontFamily: tokens.fontUI, fontSize: 13, lineHeight: 1.6, color: tokens.textPrimary, whiteSpace: 'pre-wrap' }}>
                    {summary}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
            <div style={{ fontFamily: tokens.fontUI, fontSize: 16, color: tokens.textSecondary }}>No standups recorded yet.</div>
            <div style={{ fontFamily: tokens.fontUI, fontSize: 13, color: tokens.textDim }}>Press S or click Run Standup.</div>
          </div>
        )}

        {!loading && sessions.map((session, si) => (
          <SessionBlock
            key={si}
            session={session}
            agents={agents}
            summary={selected?.summary}
            isLast={si === sessions.length - 1}
            defaultOpen={si === 0}
          />
        ))}
      </div>
    </div>
  )
}
