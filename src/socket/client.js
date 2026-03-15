import { io } from 'socket.io-client'
import useStore from '../store/useStore'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

const socket = io(SOCKET_URL)

socket.on('connect', () => {
  console.log('SHIFT HQ connected to server')

  // Load initial data from REST API
  fetch(`${SOCKET_URL}/api/activity`)
    .then((r) => r.json())
    .then((data) => {
      if (Array.isArray(data)) useStore.getState().setActivities(data.reverse())
    })
    .catch(() => {})

  fetch(`${SOCKET_URL}/api/tasks`)
    .then((r) => r.json())
    .then((data) => {
      if (Array.isArray(data)) useStore.getState().setTaskBoard(data)
    })
    .catch(() => {})
})

socket.on('disconnect', () => {
  console.log('SHIFT HQ disconnected from server')
})

// ─── Agent Status ────────────────────────────────

socket.on('agent_status', ({ agentId, status }) => {
  useStore.getState().setAgentStatus(agentId, status)
  useStore.getState().setLastHeartbeat(agentId, Date.now())
})

// ─── Heartbeat ──────────────────────────────────

socket.on('agent_heartbeat', ({ agentId, status, timestamp }) => {
  useStore.getState().setLastHeartbeat(agentId, timestamp || Date.now())
})

// ─── Token Streaming ─────────────────────────────

socket.on('agent_token', ({ agentId, token }) => {
  // Clear tool call indicator when new text arrives
  if (useStore.getState().activeToolCalls[agentId]) {
    useStore.getState().clearToolCall(agentId)
  }
  useStore.getState().appendToken(agentId, token)
})

// ─── Task Complete ───────────────────────────────

socket.on('agent_done', ({ agentId, fullResponse }) => {
  useStore.getState().clearToolCall(agentId)
  useStore.getState().clearStreamingToken(agentId)
  useStore.getState().setAgentMessage(agentId, fullResponse)
  // Save response to task history so it persists in agent detail
  useStore.getState().saveAgentResponse(agentId, fullResponse)
})

// ─── Error ───────────────────────────────────────

socket.on('agent_error', ({ agentId, error }) => {
  useStore.getState().clearToolCall(agentId)
  useStore.getState().clearStreamingToken(agentId)
  useStore.getState().setAgentMessage(agentId, error || 'Something went wrong. Try again.')
})

// ─── Tool Calls ──────────────────────────────────

socket.on('agent_tool_call', ({ agentId, tool, input }) => {
  useStore.getState().setToolCall(agentId, { tool, input })
})

// ─── Delegations ─────────────────────────────────

socket.on('agent_delegation', ({ from, to, task }) => {
  const agents = useStore.getState().agents
  const fromAgent = agents[from]
  const toAgent = agents[to]

  if (!fromAgent || !toAgent) return

  const delegation = {
    from: fromAgent.position,
    to: toAgent.position,
    fromColor: fromAgent.color,
    toColor: toAgent.color,
    fromName: fromAgent.name,
    toName: toAgent.name,
    task,
    timestamp: Date.now(),
  }

  useStore.getState().addDelegation(delegation)

  // Auto-remove after 3 seconds
  setTimeout(() => {
    useStore.getState().removeDelegation(delegation.timestamp)
  }, 3000)
})

// ─── Agent Report ────────────────────────────────

socket.on('agent_report', ({ from, to, result }) => {
  // Brief flash — set status to speaking then back to idle
  useStore.getState().setAgentStatus(to, 'speaking')
  setTimeout(() => {
    const currentStatus = useStore.getState().agents[to]?.status
    if (currentStatus === 'speaking') {
      useStore.getState().setAgentStatus(to, 'idle')
    }
  }, 1500)
})

// ─── Activity & Task Updates ─────────────────────

socket.on('activity_update', (activity) => {
  useStore.getState().addActivity(activity)
  // Auto-open activity feed on first activity
  if (!useStore.getState().activityFeedOpen && useStore.getState().activities.length === 0) {
    useStore.getState().toggleActivityFeed()
  }
})

socket.on('task_update', (task) => {
  const existing = useStore.getState().taskBoard.find((t) => t.id === task.id)
  if (existing) {
    useStore.getState().updateTaskBoardItem(task.id, task)
  } else {
    useStore.getState().addTaskBoardItem(task)
  }
})

// ─── Standup Events ─────────────────────────────────

socket.on('standup_start', ({ timestamp, agents }) => {
  useStore.getState().startStandup(agents)
})

socket.on('standup_agent_turn', ({ agentId }) => {
  // Clear any previous agent's streaming message
  const prev = useStore.getState().standupCurrentAgent
  if (prev) {
    useStore.getState().clearStreamingToken(prev)
  }
  useStore.getState().setStandupCurrentAgent(agentId)
  useStore.getState().setAgentMessage(agentId, '')
})

socket.on('standup_agent_done', ({ agentId, report, isLast }) => {
  useStore.getState().clearStreamingToken(agentId)
  useStore.getState().setAgentMessage(agentId, report)
  useStore.getState().completeStandupAgent(agentId, report)
})

socket.on('standup_complete', ({ timestamp, summary }) => {
  useStore.getState().setStandupSummary(summary)
  // Delay ending standup so the summary card is visible
  setTimeout(() => {
    useStore.getState().endStandup()
    // Reset all agent messages after standup fades
    setTimeout(() => {
      const agents = useStore.getState().agents
      Object.keys(agents).forEach((id) => {
        useStore.getState().setAgentMessage(id, null)
      })
    }, 1000)
  }, 5000)
})

// ─── Exports ─────────────────────────────────────

export function assignTaskToAgent(agentId, task) {
  socket.emit('assign_task', { agentId, task })
}

export default socket
