import { useEffect, useRef, useState, useCallback } from 'react'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'

const FILTER_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'task_received', label: 'Tasks' },
  { key: 'completed', label: 'Done' },
  { key: 'tool_called', label: 'Tools' },
  { key: 'delegated', label: 'Delegated' },
]

const ACTION_LABELS = {
  task_received: 'received task',
  tool_called: 'called',
  delegated: 'delegated \u2192',
  completed: 'completed',
  message_sent: 'sent message',
  standup: 'standup report',
}

function formatRelativeTime(dateStr) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.max(0, now - then)
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function ActivityView() {
  const activities = useStore((s) => s.activities)
  const agents = useStore((s) => s.agents)
  const taskBoard = useStore((s) => s.taskBoard)
  const setSelectedTask = useStore((s) => s.setSelectedTask)
  const [filter, setFilter] = useState('all')
  const scrollRef = useRef(null)
  const userScrolledRef = useRef(false)
  const prevCountRef = useRef(activities.length)

  // Auto-scroll to bottom when new activities arrive (if user hasn't scrolled up)
  useEffect(() => {
    const el = scrollRef.current
    if (!el || userScrolledRef.current) return
    if (activities.length > prevCountRef.current) {
      el.scrollTop = el.scrollHeight
    }
    prevCountRef.current = activities.length
  }, [activities])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    userScrolledRef.current = !nearBottom
  }, [])

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter((a) => a.action_type === filter)

  const isClickable = (actionType) =>
    actionType === 'task_received' || actionType === 'completed'

  const handleActivityClick = (activity) => {
    if (!isClickable(activity.action_type)) return

    // Try to find matching task from taskBoard
    const desc = (activity.description || '').toLowerCase()
    const agentId = activity.agent_id
    const activityTime = new Date(activity.created_at).getTime()

    // First try: match by agent and description similarity
    let match = taskBoard.find((t) => {
      if (t.agent_id !== agentId) return false
      const taskDesc = (t.description || t.task || '').toLowerCase()
      return taskDesc && desc && (
        taskDesc.includes(desc.slice(0, 30)) ||
        desc.includes(taskDesc.slice(0, 30))
      )
    })

    // Second try: match by agent + closest timestamp
    if (!match) {
      const agentTasks = taskBoard.filter((t) => t.agent_id === agentId)
      if (agentTasks.length > 0) {
        match = agentTasks.reduce((closest, t) => {
          const tTime = new Date(t.created_at || t.timestamp || 0).getTime()
          const cTime = new Date(closest.created_at || closest.timestamp || 0).getTime()
          return Math.abs(tTime - activityTime) < Math.abs(cTime - activityTime) ? t : closest
        })
      }
    }

    if (match) {
      setSelectedTask(match)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: tokens.void,
      }}
    >
      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '14px 20px',
          borderBottom: `1px solid ${tokens.border}`,
          flexShrink: 0,
        }}
      >
        {FILTER_TYPES.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              background: filter === f.key ? tokens.accent : 'rgba(255,255,255,0.04)',
              border: filter === f.key
                ? `1px solid ${tokens.accent}`
                : `1px solid ${tokens.border}`,
              borderRadius: 16,
              padding: '5px 14px',
              fontFamily: tokens.fontUI,
              fontSize: 12,
              fontWeight: filter === f.key ? 600 : 400,
              color: filter === f.key ? '#fff' : tokens.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (filter !== f.key) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = tokens.textPrimary
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== f.key) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.color = tokens.textSecondary
              }
            }}
          >
            {f.label}
          </button>
        ))}
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: tokens.fontMono,
            fontSize: 11,
            color: tokens.textDim,
          }}
        >
          {filteredActivities.length} items
        </span>
      </div>

      {/* Activity list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {filteredActivities.length === 0 && (
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
              userSelect: 'none',
            }}
          >
            No activity yet
          </div>
        )}

        {filteredActivities.map((activity, index) => {
          const agent = agents[activity.agent_id]
          const clickable = isClickable(activity.action_type)
          const isEven = index % 2 === 0

          return (
            <div
              key={activity.id || index}
              onClick={() => handleActivityClick(activity)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 20px',
                background: isEven ? 'transparent' : 'rgba(255,255,255,0.015)',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'background 0.15s',
                borderLeft: clickable ? `2px solid transparent` : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                if (clickable) {
                  e.currentTarget.style.borderLeftColor = tokens.accent
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isEven ? 'transparent' : 'rgba(255,255,255,0.015)'
                e.currentTarget.style.borderLeftColor = 'transparent'
              }}
            >
              {/* Agent color dot */}
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: agent?.color || '#666',
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${agent?.color || '#666'}44`,
                }}
              />

              {/* Agent name */}
              <span
                style={{
                  fontFamily: tokens.fontUI,
                  fontSize: 13,
                  fontWeight: 600,
                  color: agent?.color || tokens.textSecondary,
                  flexShrink: 0,
                  minWidth: 50,
                }}
              >
                {agent?.name || activity.agent_id}
              </span>

              {/* Action description */}
              <span
                style={{
                  flex: 1,
                  fontFamily: tokens.fontUI,
                  fontSize: 13,
                  color: tokens.textSecondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {activity.description || ACTION_LABELS[activity.action_type] || activity.action_type}
              </span>

              {/* Relative timestamp */}
              <span
                style={{
                  fontFamily: tokens.fontMono,
                  fontSize: 11,
                  color: tokens.textDim,
                  flexShrink: 0,
                  textAlign: 'right',
                  minWidth: 60,
                }}
              >
                {formatRelativeTime(activity.created_at)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
