import { create } from 'zustand'

const useStore = create((set, get) => ({
  agents: {
    kim:    { id: 'kim',    name: 'Kim',    role: 'Bookings & Client Relations', position: [-18, 0, -4],  color: '#7B5CE6', status: 'idle', currentMessage: null, taskHistory: [] },
    dev:    { id: 'dev',    name: 'Dev',    role: 'Engineering',                 position: [ -6, 0, -4],  color: '#00BCD4', status: 'idle', currentMessage: null, taskHistory: [] },
    marco:  { id: 'marco',  name: 'Marco',  role: 'Sales',                       position: [  3, 0, -4],  color: '#FF6B35', status: 'idle', currentMessage: null, taskHistory: [] },
    zara:   { id: 'zara',   name: 'Zara',   role: 'Marketing',                   position: [ 12, 0, -4],  color: '#F59E0B', status: 'idle', currentMessage: null, taskHistory: [] },
    riley:  { id: 'riley',  name: 'Riley',  role: 'AV & Technical Ops',          position: [  3, 0,  5],  color: '#22C55E', status: 'idle', currentMessage: null, taskHistory: [] },
    dante:  { id: 'dante',  name: 'Dante',  role: 'Beverage Ops',                position: [  7, 0,  5],  color: '#EC4899', status: 'idle', currentMessage: null, taskHistory: [] },
    sam:    { id: 'sam',    name: 'Sam',    role: 'Operations',                  position: [ 19, 0, -4],  color: '#94A3B8', status: 'idle', currentMessage: null, taskHistory: [] },
    petra:  { id: 'petra',  name: 'Petra',  role: 'Accounting',                  position: [-18, 0,  5],  color: '#EAB308', status: 'idle', currentMessage: null, taskHistory: [] },
    lex:    { id: 'lex',    name: 'Lex',    role: 'Legal',                       position: [ -6, 0,  5],  color: '#6366F1', status: 'idle', currentMessage: null, taskHistory: [] },
    bruno:  { id: 'bruno',  name: 'Bruno',  role: 'Founder',                     position: [  0, 0,  1.2], color: '#FF0040', status: 'idle', currentMessage: null, taskHistory: [] },
  },

  activeAgent: 'bruno',

  // Streaming tokens per agent
  streamingTokens: {},

  // Active tool calls per agent
  activeToolCalls: {},

  // Active delegation lines
  delegations: [],

  // Activity feed entries
  activities: [],

  // Task board items
  taskBoard: [],

  // Sidebar states
  activityFeedOpen: false,
  taskBoardOpen: false,
  agentDetailOpen: false,

  // Desk mode
  cameraMode: 'overview', // 'overview' | 'desk'
  activeDeskAgent: null,
  deskTransition: 0, // 0 = overview, 1 = desk, animates between
  monitorZoomed: false,

  // Standup state
  standupActive: false,
  standupCurrentAgent: null,
  standupCompletedAgents: [],
  standupReports: {},
  standupSummary: null,

  // Heartbeat tracking
  lastHeartbeats: {},

  // ─── Agent Actions ─────────────────────────────

  setActiveAgent: (id) => set({ activeAgent: id }),

  toggleAgentDetail: () =>
    set((state) => ({ agentDetailOpen: !state.agentDetailOpen })),

  openAgentDetail: (id) =>
    set({ activeAgent: id, agentDetailOpen: true }),

  setAgentPosition: (id, position) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], position },
      },
    })),

  setAgentStatus: (id, status) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], status },
      },
    })),

  setLastHeartbeat: (id, timestamp) =>
    set((state) => ({
      lastHeartbeats: { ...state.lastHeartbeats, [id]: timestamp },
    })),

  setAgentMessage: (id, message) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], currentMessage: message },
      },
    })),

  assignTask: (agentId, task) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          status: 'working',
          taskHistory: [
            ...state.agents[agentId].taskHistory,
            { id: crypto.randomUUID(), text: task, timestamp: Date.now() },
          ],
        },
      },
    })),

  // ─── Streaming ─────────────────────────────────

  appendToken: (agentId, token) =>
    set((state) => {
      const current = state.streamingTokens[agentId] || ''
      const updated = current + token
      return {
        streamingTokens: {
          ...state.streamingTokens,
          [agentId]: updated,
        },
        agents: {
          ...state.agents,
          [agentId]: {
            ...state.agents[agentId],
            currentMessage: updated,
          },
        },
      }
    }),

  clearStreamingToken: (agentId) =>
    set((state) => ({
      streamingTokens: {
        ...state.streamingTokens,
        [agentId]: '',
      },
    })),

  // ─── Tool Calls ────────────────────────────────

  setToolCall: (agentId, toolCall) =>
    set((state) => ({
      activeToolCalls: {
        ...state.activeToolCalls,
        [agentId]: toolCall,
      },
    })),

  clearToolCall: (agentId) =>
    set((state) => {
      const updated = { ...state.activeToolCalls }
      delete updated[agentId]
      return { activeToolCalls: updated }
    }),

  // ─── Delegations ───────────────────────────────

  addDelegation: (delegation) =>
    set((state) => ({
      delegations: [...state.delegations, delegation],
    })),

  removeDelegation: (timestamp) =>
    set((state) => ({
      delegations: state.delegations.filter((d) => d.timestamp !== timestamp),
    })),

  // ─── Activity Feed ─────────────────────────────

  addActivity: (activity) =>
    set((state) => ({
      activities: [...state.activities.slice(-49), activity],
    })),

  setActivities: (activities) => set({ activities }),

  toggleActivityFeed: () =>
    set((state) => ({ activityFeedOpen: !state.activityFeedOpen })),

  // ─── Task Board ────────────────────────────────

  addTaskBoardItem: (task) =>
    set((state) => ({
      taskBoard: [task, ...state.taskBoard].slice(0, 50),
    })),

  updateTaskBoardItem: (taskId, updates) =>
    set((state) => ({
      taskBoard: state.taskBoard.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    })),

  setTaskBoard: (tasks) => set({ taskBoard: tasks }),

  toggleTaskBoard: () =>
    set((state) => ({ taskBoardOpen: !state.taskBoardOpen })),

  // ─── Standup ──────────────────────────────────────

  startStandup: (agents) =>
    set({
      standupActive: true,
      standupCurrentAgent: null,
      standupCompletedAgents: [],
      standupReports: {},
      standupSummary: null,
    }),

  setStandupCurrentAgent: (agentId) =>
    set({ standupCurrentAgent: agentId }),

  completeStandupAgent: (agentId, report) =>
    set((state) => ({
      standupCompletedAgents: [...state.standupCompletedAgents, agentId],
      standupReports: { ...state.standupReports, [agentId]: report },
    })),

  setStandupSummary: (summary) =>
    set({ standupSummary: summary }),

  endStandup: () =>
    set({ standupActive: false, standupCurrentAgent: null }),

  dismissStandup: () =>
    set({ standupActive: false, standupCurrentAgent: null }),

  // ─── Desk Mode ───────────────────────────────────

  enterDeskMode: (agentId) =>
    set({ cameraMode: 'desk', activeDeskAgent: agentId, activeAgent: agentId, monitorZoomed: false }),

  exitDeskMode: () =>
    set({ cameraMode: 'overview', activeDeskAgent: null, deskTransition: 0, monitorZoomed: false }),

  setDeskTransition: (t) =>
    set({ deskTransition: t }),

  setMonitorZoomed: (v) =>
    set({ monitorZoomed: v }),
}))

export default useStore
