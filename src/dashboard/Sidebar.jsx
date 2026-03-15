import { memo } from 'react'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'

const NAV_ITEMS = [
  { key: 'board', label: 'Board' },
  { key: 'activity', label: 'Activity' },
  { key: 'standups', label: 'Standups' },
]

const AGENT_IDS = ['kim', 'dev', 'marco', 'zara', 'riley', 'dante', 'sam', 'petra', 'lex', 'bruno']

function NavButton({ item, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(item.key)}
      style={{
        width: '100%',
        padding: '8px 14px',
        background: isActive ? tokens.accentGlow : 'transparent',
        border: 'none',
        borderLeft: isActive ? `2px solid ${tokens.accent}` : '2px solid transparent',
        borderRadius: 0,
        fontFamily: tokens.fontUI,
        fontSize: 13,
        fontWeight: isActive ? 600 : 400,
        color: isActive ? tokens.textPrimary : tokens.textSecondary,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.color = tokens.textPrimary
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = tokens.textSecondary
        }
      }}
    >
      {item.label}
    </button>
  )
}

const AgentRow = memo(function AgentRow({ agentId }) {
  const agent = useStore((s) => s.agents[agentId])
  const activeAgent = useStore((s) => s.activeAgent)
  const setActiveAgent = useStore((s) => s.setActiveAgent)
  const setBoardFilter = useStore((s) => s.setBoardFilter)

  if (!agent) return null

  const isActive = activeAgent === agentId
  const isWorking = agent.status === 'working' || agent.status === 'thinking'
  const lastTask = agent.taskHistory.length > 0
    ? agent.taskHistory[agent.taskHistory.length - 1]
    : null
  const taskTitle = lastTask && isWorking
    ? (lastTask.text.length > 30 ? lastTask.text.slice(0, 30) + '...' : lastTask.text)
    : null

  const handleClick = () => {
    setActiveAgent(agentId)
    setBoardFilter(agentId)
  }

  return (
    <button
      onClick={handleClick}
      style={{
        width: '100%',
        padding: '8px 14px',
        background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: 'none',
        borderLeft: isActive ? `2px solid ${agent.color}` : '2px solid transparent',
        borderRadius: 0,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: agent.color,
            flexShrink: 0,
            opacity: isWorking ? 1 : 0.4,
            transition: 'opacity 0.2s',
            boxShadow: isWorking ? `0 0 6px ${agent.color}` : 'none',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            style={{
              fontFamily: tokens.fontUI,
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: tokens.textPrimary,
            }}
          >
            {agent.name}
          </span>
          <span
            style={{
              fontFamily: tokens.fontMono,
              fontSize: 9,
              color: tokens.textDim,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {agent.role}
          </span>
        </div>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: tokens.fontMono,
            fontSize: 10,
            color: isWorking ? tokens.green : tokens.textDim,
            textTransform: 'lowercase',
          }}
        >
          {agent.status}
        </span>
      </div>
      {taskTitle && (
        <span
          style={{
            fontFamily: tokens.fontMono,
            fontSize: 10,
            color: tokens.textSecondary,
            paddingLeft: 16,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {taskTitle}
        </span>
      )}
    </button>
  )
})

export default function Sidebar() {
  const dashboardNav = useStore((s) => s.dashboardNav)
  const setDashboardNav = useStore((s) => s.setDashboardNav)

  return (
    <aside
      style={{
        width: 200,
        height: '100%',
        background: tokens.glass,
        backdropFilter: tokens.glassBlur,
        borderRight: `1px solid ${tokens.glassBorder}`,
        boxShadow: tokens.glassShadow,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Navigation */}
      <div style={{ padding: '16px 0 8px' }}>
        <div
          style={{
            padding: '0 14px 8px',
            fontFamily: tokens.fontMono,
            fontSize: 10,
            fontWeight: 600,
            color: tokens.textDim,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Navigation
        </div>
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.key}
            item={item}
            isActive={dashboardNav === item.key}
            onClick={setDashboardNav}
          />
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: tokens.glassBorder,
          margin: '4px 14px',
        }}
      />

      {/* Agent Roster */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        <div
          style={{
            padding: '0 14px 8px',
            fontFamily: tokens.fontMono,
            fontSize: 10,
            fontWeight: 600,
            color: tokens.textDim,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Agents
        </div>
        {AGENT_IDS.map((id) => (
          <AgentRow key={id} agentId={id} />
        ))}
      </div>
    </aside>
  )
}
