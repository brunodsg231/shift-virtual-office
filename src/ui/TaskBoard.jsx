import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { useIsMobile } from '../hooks/useMediaQuery'

const STATUS_COLORS = {
  pending: tokens.textDim,
  in_progress: tokens.accent,
  done: tokens.green,
  failed: tokens.red,
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return new Date(dateStr).toLocaleDateString()
}

function TaskCard({ task, agents }) {
  const agent = agents[task.assigned_to]
  const statusColor = STATUS_COLORS[task.status] || tokens.textDim

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderLeft: `2px solid ${agent?.color || '#666'}`,
        borderRadius: `0 ${tokens.radiusSmall} ${tokens.radiusSmall} 0`,
        padding: '10px 14px',
        margin: '0 8px 6px',
        cursor: 'default',
        transition: 'background 0.15s',
        position: 'relative',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
    >
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: statusColor,
          animation: task.status === 'in_progress' ? 'pulse 2s ease-in-out infinite' : 'none',
          boxShadow: task.status === 'in_progress' ? `0 0 6px ${statusColor}` : 'none',
        }}
      />
      <div style={{
        fontFamily: tokens.fontUI,
        fontWeight: 600,
        fontSize: 11,
        color: agent?.color || tokens.textSecondary,
        marginBottom: 3,
      }}>
        {agent?.name || task.assigned_to}
      </div>
      <div style={{
        fontFamily: tokens.fontUI,
        fontSize: 12,
        color: tokens.textPrimary,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginBottom: 4,
        paddingRight: 16,
      }}>
        {task.title}
      </div>
      <div style={{
        fontFamily: tokens.fontMono,
        fontSize: 10,
        color: tokens.textDim,
      }}>
        {timeAgo(task.created_at)}
      </div>
    </motion.div>
  )
}

export default function TaskBoard() {
  const taskBoard = useStore((s) => s.taskBoard)
  const isOpen = useStore((s) => s.taskBoardOpen)
  const toggle = useStore((s) => s.toggleTaskBoard)
  const agents = useStore((s) => s.agents)
  const isMobile = useIsMobile()
  const panelW = isMobile ? '100vw' : 260

  const columns = {
    in_progress: taskBoard.filter((t) => t.status === 'in_progress'),
    pending: taskBoard.filter((t) => t.status === 'pending'),
    done: taskBoard.filter((t) => t.status === 'done' || t.status === 'failed'),
  }

  const sectionLabels = {
    in_progress: 'In Progress',
    pending: 'Pending',
    done: 'Completed',
  }

  return (
    <>
      {/* Toggle tab — vertical TASKS text */}
      {!isOpen && (
        <button
          onClick={toggle}
          style={{
            position: 'fixed',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 100,
            width: 32,
            background: 'rgba(10,10,24,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
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
          TASKS
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: isMobile ? '-100vw' : -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? '-100vw' : -260, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              left: 0,
              top: isMobile ? 0 : 60,
              bottom: isMobile ? 0 : 100,
              width: panelW,
              zIndex: 100,
              background: tokens.glass,
              backdropFilter: tokens.glassBlur,
              border: `1px solid ${tokens.glassBorder}`,
              borderLeft: 'none',
              borderRadius: isMobile ? 0 : '0 12px 12px 0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: tokens.glassShadow,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{
                fontFamily: tokens.fontUI,
                fontWeight: 700,
                fontSize: 13,
                color: tokens.textPrimary,
              }}>
                Tasks
              </span>
              <button
                onClick={toggle}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: tokens.textDim,
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = tokens.textPrimary }}
                onMouseLeave={(e) => { e.currentTarget.style.color = tokens.textDim }}
              >
                {'\u2715'}
              </button>
            </div>

            {/* Task sections */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {Object.entries(columns).map(([status, tasks]) => (
                <div key={status}>
                  <div style={{
                    padding: '8px 16px 6px',
                    fontSize: 10,
                    fontWeight: 600,
                    color: tokens.textDim,
                    fontFamily: tokens.fontUI,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    {sectionLabels[status]}
                    {tasks.length > 0 && (
                      <span style={{
                        marginLeft: 6,
                        color: tokens.textDim,
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: 4,
                        padding: '1px 5px',
                        fontSize: 9,
                      }}>
                        {tasks.length}
                      </span>
                    )}
                  </div>

                  <AnimatePresence>
                    {tasks.slice(0, 10).map((task) => (
                      <TaskCard key={task.id} task={task} agents={agents} />
                    ))}
                  </AnimatePresence>

                  {tasks.length === 0 && (
                    <div style={{
                      padding: '6px 16px',
                      fontSize: 11,
                      color: tokens.textDim,
                      fontFamily: tokens.fontUI,
                      fontStyle: 'italic',
                    }}>
                      None
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
