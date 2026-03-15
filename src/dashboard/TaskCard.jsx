import { useState } from 'react'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'

const STATUS_COLORS = {
  in_progress: '#3B82F6',
  done: tokens.green,
  failed: tokens.red,
  pending: tokens.textDim,
  backlog: tokens.textDim,
}

function relativeTime(timestamp) {
  if (!timestamp) return ''
  const elapsed = Date.now() - new Date(timestamp).getTime()
  if (elapsed < 60000) return 'just now'
  if (elapsed < 3600000) return `${Math.floor(elapsed / 60000)}m ago`
  if (elapsed < 86400000) return `${Math.floor(elapsed / 3600000)}h ago`
  return `${Math.floor(elapsed / 86400000)}d ago`
}

export default function TaskCard({ task }) {
  const [hovered, setHovered] = useState(false)
  const agent = useStore((s) => s.agents[task.assigned_to])
  const agentColor = agent?.color || tokens.textDim
  const agentName = agent?.name || task.assigned_to || 'Unassigned'
  const agentStatus = agent?.status

  const statusColor = STATUS_COLORS[task.status] || tokens.textDim
  const isActive = task.status === 'in_progress'
  const isFailed = task.status === 'failed'
  const isDone = task.status === 'done'
  const isWorking = isActive && (agentStatus === 'working' || agentStatus === 'thinking')

  return (
    <div
      onClick={() => useStore.getState().setSelectedTask(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        borderRadius: tokens.radiusSmall,
        padding: 12,
        marginBottom: 8,
        cursor: 'pointer',
        borderLeft: `3px solid ${agentColor}`,
        transition: 'background 0.15s ease',
      }}
    >
      {/* Agent name */}
      <div style={{
        fontFamily: tokens.fontUI,
        fontSize: 10,
        fontWeight: 600,
        color: agentColor,
        letterSpacing: '0.03em',
        marginBottom: 4,
      }}>
        {agentName}
      </div>

      {/* Task title */}
      <div style={{
        fontFamily: tokens.fontUI,
        fontSize: 13,
        color: tokens.textPrimary,
        lineHeight: 1.4,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        marginBottom: 8,
      }}>
        {task.title || task.text || task.description || 'Untitled task'}
      </div>

      {/* Bottom row: timestamp + status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: tokens.fontMono,
          fontSize: 9,
          color: tokens.textDim,
        }}>
          {relativeTime(task.created_at)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Working indicator */}
          {isWorking && (
            <span style={{
              fontFamily: tokens.fontUI,
              fontSize: 10,
              color: '#3B82F6',
              animation: 'kanbanWorkingPulse 1.5s ease-in-out infinite',
            }}>
              Working...
            </span>
          )}

          {/* Status dot */}
          <div style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: statusColor,
            boxShadow: isActive
              ? `0 0 6px ${statusColor}, 0 0 12px ${statusColor}40`
              : isDone
                ? `0 0 4px ${statusColor}60`
                : isFailed
                  ? `0 0 4px ${statusColor}60`
                  : 'none',
            animation: isActive ? 'kanbanPulse 2s ease-in-out infinite' : 'none',
          }} />
        </div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes kanbanPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes kanbanWorkingPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
