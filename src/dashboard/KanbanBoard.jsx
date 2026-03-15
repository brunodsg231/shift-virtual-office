import { useState, useMemo } from 'react'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { assignTaskToAgent } from '../socket/client'
import TaskCard from './TaskCard'

const COLUMNS = [
  { key: 'backlog', label: 'Backlog', match: (s) => !s || s === 'pending' || s === 'backlog' },
  { key: 'in_progress', label: 'In Progress', match: (s) => s === 'in_progress' },
  { key: 'done', label: 'Done', match: (s) => s === 'done' || s === 'failed' },
]

function NewTaskForm({ onClose }) {
  const agents = useStore((s) => s.agents)
  const [agentId, setAgentId] = useState('')
  const [text, setText] = useState('')

  const agentList = useMemo(() =>
    Object.values(agents).sort((a, b) => a.name.localeCompare(b.name)),
    [agents]
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!agentId || !text.trim()) return
    assignTaskToAgent(agentId, text.trim())
    useStore.getState().assignTask(agentId, text.trim())
    setText('')
    setAgentId('')
    onClose()
  }

  const selectedAgent = agents[agentId]

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: tokens.radiusSmall,
        border: `1px solid ${tokens.glassBorder}`,
        padding: 12,
        marginBottom: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Agent dropdown */}
      <select
        value={agentId}
        onChange={(e) => setAgentId(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${selectedAgent ? selectedAgent.color + '40' : tokens.glassBorder}`,
          borderRadius: 6,
          padding: '8px 10px',
          fontFamily: tokens.fontUI,
          fontSize: 12,
          color: selectedAgent ? selectedAgent.color : tokens.textSecondary,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
        }}
      >
        <option value="" style={{ background: tokens.surface1, color: tokens.textSecondary }}>
          Select agent...
        </option>
        {agentList.map((a) => (
          <option
            key={a.id}
            value={a.id}
            style={{ background: tokens.surface1, color: a.color }}
          >
            {a.name} — {a.role}
          </option>
        ))}
      </select>

      {/* Task text */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe the task..."
        autoFocus
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${tokens.glassBorder}`,
          borderRadius: 6,
          padding: '8px 10px',
          fontFamily: tokens.fontUI,
          fontSize: 12,
          color: tokens.textPrimary,
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = `${tokens.accent}50`
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = tokens.glassBorder
        }}
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${tokens.glassBorder}`,
            borderRadius: 6,
            padding: '6px 12px',
            fontFamily: tokens.fontUI,
            fontSize: 11,
            color: tokens.textDim,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!agentId || !text.trim()}
          style={{
            background: agentId && text.trim() ? `${tokens.accent}20` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${agentId && text.trim() ? tokens.accentDim : tokens.glassBorder}`,
            borderRadius: 6,
            padding: '6px 12px',
            fontFamily: tokens.fontUI,
            fontSize: 11,
            fontWeight: 600,
            color: agentId && text.trim() ? tokens.accent : tokens.textDim,
            cursor: agentId && text.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}
        >
          Create
        </button>
      </div>
    </form>
  )
}

function Column({ column, tasks }) {
  const [showForm, setShowForm] = useState(false)
  const isBacklog = column.key === 'backlog'

  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(10,10,24,0.6)',
      borderRadius: tokens.radius,
      border: `1px solid rgba(255,255,255,0.06)`,
      overflow: 'hidden',
    }}>
      {/* Column header */}
      <div style={{
        padding: '14px 16px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid rgba(255,255,255,0.04)`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            fontFamily: tokens.fontUI,
            fontSize: 12,
            fontWeight: 700,
            color: tokens.textPrimary,
            letterSpacing: '0.02em',
          }}>
            {column.label}
          </span>
          <span style={{
            fontFamily: tokens.fontMono,
            fontSize: 10,
            fontWeight: 600,
            color: tokens.textDim,
            background: 'rgba(255,255,255,0.06)',
            padding: '2px 7px',
            borderRadius: 10,
            minWidth: 18,
            textAlign: 'center',
          }}>
            {tasks.length}
          </span>
        </div>

        {isBacklog && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: showForm ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${tokens.glassBorder}`,
              borderRadius: 6,
              padding: '3px 10px',
              fontFamily: tokens.fontUI,
              fontSize: 11,
              fontWeight: 600,
              color: tokens.accent,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {showForm ? 'Close' : '+ New Task'}
          </button>
        )}
      </div>

      {/* Column body — scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 12,
      }}>
        {isBacklog && showForm && (
          <NewTaskForm onClose={() => setShowForm(false)} />
        )}

        {tasks.length === 0 && !showForm ? (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            fontFamily: tokens.fontUI,
            fontSize: 12,
            color: tokens.textDim,
            lineHeight: 1.5,
          }}>
            No tasks yet.{isBacklog ? ' Use the quick assign bar above to create one.' : ''}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  )
}

// Demo tasks shown when the board is empty so the user can see the layout
const DEMO_TASKS = [
  { id: 'demo-1', assigned_to: 'kim', title: 'Follow up with Acme Corp on venue booking', status: 'pending', created_at: new Date(Date.now() - 3600000).toISOString(), _demo: true },
  { id: 'demo-2', assigned_to: 'marco', title: 'Send proposal to TechFlow for Q2 event', status: 'pending', created_at: new Date(Date.now() - 7200000).toISOString(), _demo: true },
  { id: 'demo-3', assigned_to: 'zara', title: 'Draft social media campaign for March', status: 'in_progress', created_at: new Date(Date.now() - 1800000).toISOString(), _demo: true },
  { id: 'demo-4', assigned_to: 'dev', title: 'Fix monitor streaming on 3D office view', status: 'in_progress', created_at: new Date(Date.now() - 900000).toISOString(), _demo: true },
  { id: 'demo-5', assigned_to: 'riley', title: 'Test projector alignment for Saturday event', status: 'done', created_at: new Date(Date.now() - 86400000).toISOString(), completed_at: new Date(Date.now() - 82800000).toISOString(), result: 'All 17 projectors calibrated and aligned. MadMapper scenes tested.', _demo: true },
  { id: 'demo-6', assigned_to: 'petra', title: 'Reconcile February invoices', status: 'done', created_at: new Date(Date.now() - 172800000).toISOString(), completed_at: new Date(Date.now() - 169200000).toISOString(), result: 'All invoices reconciled. $800 variance found in tech spending.', _demo: true },
]

export default function KanbanBoard() {
  const taskBoard = useStore((s) => s.taskBoard)
  const boardFilter = useStore((s) => s.boardFilter)

  // Show demo tasks when board is empty
  const showDemo = taskBoard.length === 0
  const source = showDemo ? DEMO_TASKS : taskBoard

  const filtered = useMemo(() => {
    if (!boardFilter) return source
    return source.filter((t) => t.assigned_to === boardFilter)
  }, [source, boardFilter])

  const grouped = useMemo(() => {
    const result = {}
    COLUMNS.forEach((col) => {
      result[col.key] = filtered.filter((t) => col.match(t.status))
    })
    return result
  }, [filtered])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '100%',
      boxSizing: 'border-box',
    }}>
      {showDemo && (
        <div style={{
          margin: '20px 20px 0',
          padding: '8px 16px',
          background: 'rgba(123,92,230,0.08)',
          border: '1px solid rgba(123,92,230,0.2)',
          borderRadius: 8,
          fontFamily: tokens.fontUI,
          fontSize: 12,
          color: tokens.accent,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>&#9672;</span>
          Demo mode — these are example tasks. Assign a real task to get started. They'll disappear once you do.
        </div>
      )}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 16,
        padding: 20,
        flex: 1,
        minHeight: 0,
      }}>
        {COLUMNS.map((col) => (
          <Column
            key={col.key}
            column={col}
            tasks={grouped[col.key]}
          />
        ))}
      </div>
    </div>
  )
}
